
'use client';
import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, AlertTriangle, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT, cn, safeParseDate } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportGenerator from '../../my-jobs/components/report-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, serverTimestamp, doc, writeBatch, arrayUnion, query, where, setDoc } from 'firebase/firestore';
import type { Job, Client, NDTServiceProvider, PlatformUser, Inspection, Equipment, NDTTechnique } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';


// --- Report Viewer Component ---
const ReportViewerPage = ({ reportId }: { reportId: string }) => {
    // This component will be built out later. For now, it's a placeholder.
    // It should fetch the report by its ID and display it in a read-only format.
    return (
        <Card>
            <CardHeader>
                <CardTitle>Viewing Report: {reportId}</CardTitle>
            </CardHeader>
             <CardContent>
                <p className="text-muted-foreground p-8 text-center">Full report viewer functionality is coming soon.</p>
             </CardContent>
        </Card>
    );
};


// --- Report Generation Component ---

const reportSchema = z.object({
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
  // Add other potential fields from various templates
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


const ReportGeneratorPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { firestore, user: authUser } = useFirebase();

    const jobId = searchParams.get('jobId');
    const inspectionId = searchParams.get('inspectionId');
    
    const [step, setStep] = React.useState(1);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(useMemoFirebase(() => (firestore && jobId ? doc(firestore, 'jobs', jobId) : null), [firestore, jobId]));
    const { data: inspection, isLoading: isLoadingInspection } = useDoc<Inspection>(useMemoFirebase(() => (firestore && inspectionId ? doc(firestore, 'inspections', inspectionId) : null), [firestore, inspectionId]));
    const { data: client, isLoading: isLoadingClient } = useDoc<Client>(useMemoFirebase(() => (firestore && job?.clientCompanyId ? doc(firestore, 'companies', job.clientCompanyId) : null), [firestore, job]));
    const { data: provider, isLoading: isLoadingProvider } = useDoc<NDTServiceProvider>(useMemoFirebase(() => (firestore && job?.providerCompanyId ? doc(firestore, 'companies', job.providerCompanyId) : null), [firestore, job]));
    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser]));
    const { data: ndtTechnique, isLoading: isLoadingTechnique } = useDoc<NDTTechnique>(useMemoFirebase(() => (firestore && inspection?.technique ? doc(firestore, 'techniques', inspection.technique) : null), [firestore, inspection]));
    
    const { data: providerEquipment, isLoading: isLoadingEquipment } = useCollection<Equipment>(
        useMemoFirebase(() => (firestore && job?.providerCompanyId ? query(collection(firestore, 'equipment'), where('providerId', '==', job.providerCompanyId)) : null), [firestore, job])
    );
    
    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        mode: 'onChange',
        defaultValues: { summary: '', findings: [{ location: "", thickness: 0, notes: "" }] },
    });
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const onSubmit = async (values: z.infer<typeof reportSchema>) => {
        if (!firestore || !job || !inspection || !authUser || !currentUserProfile) {
            toast({ variant: "destructive", title: "Error", description: "Missing critical data to submit report." });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const batch = writeBatch(firestore);

            const newReportRef = doc(collection(firestore, 'reports'));
            const reportData = {
                id: newReportRef.id,
                jobId: job.id,
                inspectionId: inspection.id,
                assetId: inspection.assetId,
                ...values,
                createdAt: serverTimestamp(),
                createdBy: currentUserProfile.id,
                companyId: currentUserProfile.companyId,
            };
            batch.set(newReportRef, reportData);
            
            const inspectionRef = doc(firestore, 'inspections', inspection.id);
            batch.update(inspectionRef, {
                status: 'Completed',
                report: {
                    id: newReportRef.id,
                    submittedOn: serverTimestamp(),
                    submittedBy: currentUserProfile.name,
                }
            });
            
            const jobRef = doc(firestore, 'jobs', job.id);
            const nextStatus: Job['status'] = job.workflow === 'standard' ? 'Client Review' : 'Under Audit';
            batch.update(jobRef, { 
                status: nextStatus,
                history: arrayUnion({
                    user: currentUserProfile.name,
                    timestamp: serverTimestamp(),
                    action: `Submitted inspection report for ${inspection.assetName} (${inspection.technique}).`,
                    statusChange: nextStatus
                })
            });

            await batch.commit();

            toast({ title: 'Report Submitted!', description: 'The inspection report has been sent for review.' });
            router.push(constructUrl(`/dashboard/my-jobs/${job.id}`));
        } catch (error) {
            console.error('Error submitting report:', error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit the report.' });
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
        if (step === 2) fieldsToValidate.push('inspectionEquipmentId');
        if (step === 3) fieldsToValidate.push('summary'); // Add more fields as needed per template
        
        const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
        if (isValid) setStep(s => s + 1);
    };
    
    const handleBack = () => setStep(s => s - 1);
    
    const isLoading = isLoadingJob || isLoadingInspection || isLoadingClient || isLoadingProvider || isLoadingProfile || isLoadingTechnique || isLoadingEquipment || !jobId || !inspectionId;

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
                                <div><p className="font-semibold">Service Provider</p><p>{provider?.name || 'N/A'}</p></div>
                                <div><p className="font-semibold">Scheduled Date</p><p>{job.scheduledStartDate ? format(safeParseDate(job.scheduledStartDate)!, 'PPP') : 'N/A'}</p></div>
                             </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card>
                            <CardHeader><CardTitle>2. Asset & Technique</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-8">
                                <FormField control={form.control} name="inspectionEquipmentId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Inspection Equipment*</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select equipment..."/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {(providerEquipment || []).map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({e.id})</SelectItem>)}
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
                                
                                <div className="grid grid-cols-3 gap-2">
                                  <Image src="https://picsum.photos/seed/report1/200/150" alt="report photo 1" width={200} height={150} className="rounded-md" />
                                  <Image src="https://picsum.photos/seed/report2/200/150" alt="report photo 2" width={200} height={150} className="rounded-md" />
                                  <Image src="https://picsum.photos/seed/report3/200/150" alt="report photo 3" width={200} height={150} className="rounded-md" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    <div className="flex justify-between print-hidden">
                        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
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
                </form>
            </FormProvider>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate PDF</DialogTitle>
                        <DialogDescription>This will open your browser's print dialog. For best results, ensure "Background graphics" is enabled and margins are set to default. You can then save the document as a PDF.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>Cancel</Button>
                        <Button onClick={() => { window.print(); setIsPreviewOpen(false); }}>
                            <Printer className="mr-2 h-4 w-4" />
                            Proceed to Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- Main Page Component ---
export default function UnifiedReportPage() {
    const params = useParams();
    const { reportId } = params as { reportId: string };

    if (reportId === 'new') {
        return <ReportGeneratorPage />;
    } else {
        return <ReportViewerPage reportId={reportId} />;
    }
}
