
'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, FileText, Check, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn, safeParseDate } from '@/lib/utils';
import Link from 'next/link';
import ReportGenerator from '../../my-jobs/components/report-generator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebase, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, serverTimestamp, doc, writeBatch, arrayUnion, query, where, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import type { Job, Client, NDTServiceProvider, PlatformUser, Inspection, Equipment, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';


const reportSchema = z.object({
  inspectorId: z.string({ required_error: "Please select the performing inspector." }),
  inspectionEquipmentId: z.string({ required_error: "Please select the inspection equipment used." }),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  findings: z.array(z.object({
    location: z.string(),
    thickness: z.coerce.number(),
    notes: z.string().optional(),
  })).optional(),
  includeSummary: z.boolean().default(true),
  includeMeasurements: z.boolean().default(true),
  includePhotos: z.boolean().default(false),
  equipmentUsed: z.string().optional(),
  calibrationBlock: z.string().optional(),
  couplant: z.string().optional(),
  surfaceCondition: z.string().optional(),
  inspectionArea: z.string().optional(),
  equipment: z.string().optional(),
  media: z.string().optional(),
  fieldStrength: z.string().optional(),
  lighting: z.string().optional(),
  penetrant: z.string().optional(),
  remover: z.string().optional(),
  developer: z.string().optional(),
  dwellTime: z.string().optional(),
  source: z.string().optional(),
  voltage: z.string().optional(),
  exposure: z.string().optional(),
  filmType: z.string().optional(),
  frequency: z.string().optional(),
  instrument: z.string().optional(),
  probe: z.string().optional(),
  sensorLayout: z.string().optional(),
  threshold: z.string().optional(),
  preamplifierGain: z.string().optional(),
  ringSpacing: z.string().optional(),
  frequencyRange: z.string().optional(),
  deadZone: z.string().optional(),
  transducerType: z.string().optional(),
  pulseWidth: z.string().optional(),
  samplingRate: z.string().optional(),
});


export default function InspectionTaskPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user: authUser } = useFirebase();

    const inspectionId = params.id as string;
    
    const [step, setStep] = React.useState(1);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);


    const { data: inspection, isLoading: isLoadingInspection } = useDoc<Inspection>(useMemoFirebase(() => (firestore && inspectionId ? doc(firestore, 'inspections', inspectionId) : null), [firestore, inspectionId]));
    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(useMemoFirebase(() => (firestore && inspection?.jobId ? doc(firestore, 'jobs', inspection.jobId) : null), [firestore, inspection]));
    
    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser]));
    const { data: ndtTechnique, isLoading: isLoadingTechnique } = useDoc<NDTTechnique>(useMemoFirebase(() => (firestore && inspection?.technique ? doc(firestore, 'techniques', inspection.technique) : null), [firestore, inspection]));
    
    const { data: providerEquipment, isLoading: isLoadingEquipment } = useCollection<Equipment>(
        useMemoFirebase(() => (firestore && job?.providerCompanyId ? query(collection(firestore, 'equipment'), where('providerId', '==', job.providerCompanyId)) : null), [firestore, job])
    );

    const { data: providerTechnicians, isLoading: isLoadingTechnicians } = useCollection<PlatformUser>(
        useMemoFirebase(() => (firestore && job?.providerCompanyId ? query(collection(firestore, 'users'), where('companyId', '==', job.providerCompanyId), where('role', '==', 'Inspector')) : null), [firestore, job])
    );

    const filteredEquipment = React.useMemo(() => {
        if (!providerEquipment || !inspection?.technique) {
            return [];
        }
        return providerEquipment.filter(equip => 
            equip.techniques.includes(inspection.technique) && equip.status === 'Available'
        );
    }, [providerEquipment, inspection?.technique]);
    
    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        mode: 'onChange',
        defaultValues: { summary: '', findings: [{ location: "", thickness: 0, notes: "" }] },
    });

    React.useEffect(() => {
        if (inspection) {
            const initialData = inspection.draftReportData || inspection.report?.reportData || {};
            form.reset({
                inspectorId: inspection.inspectorId,
                inspectionEquipmentId: inspection.equipmentId,
                ...initialData
            });
        }
    }, [inspection, form]);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleSaveProgress = async () => {
        if (!firestore || !inspectionId) return;
        setIsSaving(true);
        try {
            const values = form.getValues();
            const { inspectorId, inspectionEquipmentId, ...draftReportData } = values;

            const inspectionRef = doc(firestore, 'inspections', inspectionId);
            await updateDoc(inspectionRef, {
                inspectorId: inspectorId,
                equipmentId: inspectionEquipmentId,
                draftReportData: draftReportData
            });

            toast.success("Progress Saved!");
            form.reset(values); // Resets dirty state
        } catch (error) {
            console.error("Error saving progress:", error);
            toast.error("Failed to save progress.");
        } finally {
            setIsSaving(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof reportSchema>) => {
        if (!firestore || !job || !inspection || !authUser || !currentUserProfile || !providerTechnicians) {
            toast.error("Error", { description: "Missing critical data to submit report." });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const batch = writeBatch(firestore);
            const inspector = providerTechnicians.find(t => t.id === values.inspectorId);
            if (!inspector) {
                toast.error("Error", { description: "Selected inspector not found." });
                setIsSubmitting(false);
                return;
            }

            const newReportRef = doc(collection(firestore, 'jobs', job.id, 'reports'));
            const { inspectorId, inspectionEquipmentId, ...reportContent } = values;

            const reportData = {
                id: newReportRef.id,
                jobId: job.id,
                inspectionId: inspection.id,
                assetId: inspection.assetId,
                reportData: reportContent,
                createdAt: serverTimestamp(),
                createdBy: currentUserProfile.id,
                companyId: currentUserProfile.companyId,
            };
            batch.set(newReportRef, reportData);
            
            const inspectionRef = doc(firestore, 'inspections', inspection.id);
            batch.update(inspectionRef, {
                status: 'Completed',
                inspector: inspector.name,
                inspectorId: inspector.id,
                equipmentId: values.inspectionEquipmentId,
                report: {
                    id: newReportRef.id,
                    submittedOn: serverTimestamp(),
                    submittedBy: currentUserProfile.name,
                },
                draftReportData: deleteField()
            });
            
            const jobRef = doc(firestore, 'jobs', job.id);
            const nextStatus: Job['status'] = job.workflow === 'standard' ? 'Client Review' : 'Under Audit';
            batch.update(jobRef, { 
                status: nextStatus,
                history: arrayUnion({
                    user: currentUserProfile.name,
                    timestamp: new Date().toISOString(), 
                    action: `Submitted inspection report for ${inspection.assetName} (${inspection.technique}).`,
                    statusChange: nextStatus
                })
            });

            await batch.commit();

            toast.success('Report Submitted!', { description: 'The inspection report has been sent for review.' });
            router.push(constructUrl(`/dashboard/my-jobs/${job.id}`));
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Submission Failed', { description: 'Could not submit the report.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, name: "Job Details" },
        { id: 2, name: "Asset & Technique" },
        { id: 3, name: "Inspection Data" },
        { id: 4, name: "Report Configuration" },
    ];
    
    const handleNext = async () => {
        const fieldsToValidate: any[] = [];
        if (step === 2) fieldsToValidate.push('inspectorId', 'inspectionEquipmentId');
        if (step === 3) fieldsToValidate.push('summary'); 
        
        const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
        if (isValid) setStep(s => s + 1);
    };
    
    const handleBack = () => setStep(s => s - 1);
    
    const isLoading = isLoadingJob || isLoadingInspection || isLoadingProfile || isLoadingTechnique || isLoadingEquipment || isLoadingTechnicians;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-screen w-full" />
            </div>
        )
    }

    if (!job || !inspection) {
        notFound();
    }
    
    const selectedEquipment = providerEquipment?.find(e => e.id === form.watch('inspectionEquipmentId'));

    return (
        <FormProvider {...form}>
            <div className="space-y-8">
                 <nav aria-label="Progress" className="print-hidden">
                    <ol role="list" className="flex items-center">
                        {steps.map((s, index) => (
                            <li key={s.name} className={cn("relative", index !== steps.length - 1 ? "flex-1" : "")}>
                                {step > s.id ? (
                                     <div className="flex items-center font-semibold">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <Check className="h-5 w-5" />
                                        </span>
                                        <span className="ml-2 text-xs text-foreground">{s.name}</span>
                                    </div>
                                ) : step === s.id ? (
                                    <div className="flex items-center font-semibold" aria-current="step">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                                            <span className="text-primary">{s.id}</span>
                                        </span>
                                        <span className="ml-2 text-xs text-primary">{s.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                                            <span className="text-muted-foreground">{s.id}</span>
                                        </span>
                                        <span className="ml-2 text-xs text-muted-foreground">{s.name}</span>
                                    </div>
                                )}
                                 {index < steps.length - 1 ? (
                                    <div className={cn(
                                        "absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5",
                                        step > s.id ? 'bg-primary' : 'bg-border'
                                    )} />
                                ) : null}
                            </li>
                        ))}
                    </ol>
                </nav>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {step === 1 && (
                        <Card>
                             <CardHeader><CardTitle>1. Job Details</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="font-semibold">Job Title</p><p>{job.title}</p></div>
                                <div><p className="font-semibold">Location</p><p>{job.location}</p></div>
                                <div><p className="font-semibold">Client</p><p>{job.client}</p></div>
                                <div><p className="font-semibold">Scheduled Date</p><p>{job.scheduledStartDate ? format(safeParseDate(job.scheduledStartDate)!, 'PPP') : 'N/A'}</p></div>
                             </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader><CardTitle>2. Asset & Technique</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-8">
                                <FormField control={form.control} name="inspectorId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Performing Inspector*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select inspector..."/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {(providerTechnicians || []).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="inspectionEquipmentId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inspection Equipment*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select equipment..."/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {(filteredEquipment || []).map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({e.id})</SelectItem>)}
                                                 {filteredEquipment.length === 0 && <p className="text-sm text-muted-foreground p-2">No available equipment for this technique.</p>}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        {selectedEquipment && (
                                            <div className="mt-4 space-y-1 text-sm border p-3 rounded-md">
                                                <p><strong>Type:</strong> {selectedEquipment.type}</p>
                                                <p><strong>Serial #:</strong> {selectedEquipment.serialNumber}</p>
                                            </div>
                                        )}
                                    </FormItem>
                                )}/>
                                <div>
                                    <h3 className="font-medium">Technique Info</h3>
                                    <div className="mt-2 space-y-1 text-sm border p-3 rounded-md">
                                        <p className="text-base font-semibold">{ndtTechnique?.title} ({ndtTechnique?.acronym})</p>
                                        <p className="text-muted-foreground">{ndtTechnique?.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card>
                             <CardHeader><CardTitle>3. Inspection Data Entry</CardTitle></CardHeader>
                             <CardContent><ReportGenerator technique={inspection.technique} /></CardContent>
                        </Card>
                    )}

                    {step === 4 && (
                        <Card>
                            <CardHeader><CardTitle>4. Report Configuration</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="font-semibold">Configure Inspection Report</h3>
                                <FormField control={form.control} name="includeSummary" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Include Summary</FormLabel></FormItem>} />
                                <FormField control={form.control} name="includeMeasurements" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Include Measurements</FormLabel></FormItem>} />
                                <FormField control={form.control} name="includePhotos" render={({ field }) => <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Include Photos</FormLabel></FormItem>} />
                            </CardContent>
                        </Card>
                    )}
                    
                    <div className="flex justify-between print-hidden">
                        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleSaveProgress}
                                disabled={!form.formState.isDirty || isSubmitting || isSaving}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Progress"}
                            </Button>

                            {step < steps.length ? (
                                <Button type="button" onClick={handleNext}>
                                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : <><FileText className="mr-2 h-4 w-4"/> Generate Report</>}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </FormProvider>
    );
}
