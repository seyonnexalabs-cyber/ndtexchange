
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NDTTechniques } from "@/lib/seed-data";
import type { Asset, JobDocument, Inspection } from '@/lib/types';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, cn } from '@/lib/utils';
import { PlusCircle, ChevronLeft, FileText, X, Check, ArrowRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import * as React from 'react';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { format, addDays } from 'date-fns';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc, setDoc, writeBatch } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useFieldArray } from 'react-hook-form';

const scopeItemSchema = z.object({
  assetId: z.string(),
  techniques: z.array(z.string()).min(1, "Please select at least one technique for this asset."),
});

const baseSchemaObject = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  jobType: z.enum(['shutdown', 'project', 'callout'], { required_error: 'Please select a job type.' }),
  industry: z.string({ required_error: 'Please select an industry.' }),
  location: z.string().min(2, 'Location is required.'),
  workflow: z.enum(['standard', 'level3', 'auto']),
  isMarketplaceJob: z.boolean().default(true),
  bidExpiryDate: z.date().optional(),
  scheduledStartDate: z.date().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  estimatedBudget: z.string().optional(),
  certificationsRequired: z.array(z.string()).min(1, "At least one certification is required."),
  scheduledEndDate: z.date().optional(),
  documents: z.any().optional(), // For file uploads
  description: z.string().optional(),
});

const jobRefinement = (data: any, ctx: z.RefinementCtx) => {
    // Rule 1: End date must be after start date
    if (data.scheduledEndDate && data.scheduledStartDate && data.scheduledEndDate < data.scheduledStartDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['scheduledEndDate'],
            message: 'End date cannot be before start date.',
        });
    }

    // Rule 2: Marketplace jobs have specific requirements
    if (data.isMarketplaceJob) {
        if (!data.bidExpiryDate) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['bidExpiryDate'],
                message: 'A bid closing date is required for marketplace jobs.',
            });
        }
        if (!data.scheduledStartDate) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['scheduledStartDate'],
                message: 'A target start date is required for marketplace jobs.',
            });
        }
         if (!data.durationDays && !data.scheduledEndDate) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['durationDays'],
                message: 'Either an estimated duration or a target end date is required.',
            });
        }
    } else { // Internal jobs
        if (!data.scheduledStartDate) {
            ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['scheduledStartDate'],
            message: 'A start date is required for internal jobs.',
          });
        }
        if (!data.durationDays && !data.scheduledEndDate) {
            ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['durationDays'],
            message: 'Either a duration or an end date is required for internal jobs.',
          });
        }
    }
};

const clientJobSchema = baseSchemaObject.extend({
    assetIds: z.array(z.string()).min(1, "Please select at least one asset."),
    scope: z.array(scopeItemSchema).min(1, "You must define a scope for at least one asset."),
}).superRefine(jobRefinement);

const inspectorJobSchema = baseSchemaObject.extend({
    clientName: z.string().min(2, "Client Name is required."),
    techniques: z.array(z.string()).min(1, "At least one technique is required."),
}).superRefine((data, ctx) => {
    // Inspector jobs are always internal
    const internalJobData = { ...data, isMarketplaceJob: false };

    // End date must be after start date
    if (internalJobData.scheduledEndDate && internalJobData.scheduledStartDate && internalJobData.scheduledEndDate < internalJobData.scheduledStartDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['scheduledEndDate'],
            message: 'End date cannot be before start date.',
        });
    }

    // Internal jobs need a start date and duration/end date
    if (!internalJobData.scheduledStartDate) {
        ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledStartDate'],
        message: 'A start date is required for internal jobs.',
        });
    }
    if (!internalJobData.durationDays && !internalJobData.scheduledEndDate) {
        ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['durationDays'],
        message: 'Either a duration or an end date is required for internal jobs.',
        });
    }
});


const industries = [
    'Oil & Gas — Upstream', 'Oil & Gas — Midstream', 'Oil & Gas — Downstream/Refinery',
    'Power Generation — Fossil Fuel', 'Power Generation — Nuclear', 'Power Generation — Renewables',
    'Aerospace & Defense', 'Manufacturing', 'Infrastructure & Construction',
    'Marine & Shipbuilding', 'Chemical Processing',
];

const certificationBodies = [
    'ASNT (American Society for Nondestructive Testing)', 'PCN (Personnel Certification in Non-Destructive Testing)',
    'CSWIP (Certification Scheme for Welding Inspection Personnel)', 'API (American Petroleum Institute)',
    'ACCP (ASNT Central Certification Program)', 'Other/Equivalent (Specify in description)',
];

const ReviewDialog = ({ isOpen, onClose, onConfirm, jobData, clientAssets, allTechniques }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, jobData: any, clientAssets: Asset[] | null, allTechniques: any[] }) => {
    if (!jobData) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Review Your Job Posting</DialogTitle>
                    <DialogDescription>Please confirm the details below before publishing.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] p-4">
                    <div className="space-y-4">
                        <h3 className="font-semibold">{jobData.title}</h3>
                        <p><span className="font-semibold">Type:</span> {jobData.jobType}</p>
                        <p><span className="font-semibold">Industry:</span> {jobData.industry}</p>
                        <p><span className="font-semibold">Location:</span> {jobData.location}</p>
                        <p><span className="font-semibold">Certifications:</span> {jobData.certificationsRequired?.join(', ')}</p>
                        <p><span className="font-semibold">Budget:</span> {jobData.estimatedBudget || 'N/A'}</p>
                        <p><span className="font-semibold">Workflow:</span> {jobData.workflow}</p>
                        <p><span className="font-semibold">Start Date:</span> {jobData.scheduledStartDate ? format(jobData.scheduledStartDate, 'PPP') : 'N/A'}</p>
                        <div>
                            <p className="font-semibold">Scope ({jobData.scope?.length || 0} assets):</p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                {jobData.scope?.map((s: any) => {
                                    const asset = clientAssets?.find(a => a.id === s.assetId);
                                    return (
                                        <li key={s.assetId}>{asset?.name}: <span className="font-medium text-primary">{s.techniques.join(', ')}</span></li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Go Back</Button>
                    <Button onClick={onConfirm}>Confirm & Publish</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function PostJobPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const router = useRouter();
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const [step, setStep] = React.useState(1);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

    const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);
    const documentsInputRef = React.useRef<HTMLInputElement>(null);

    const assetsQuery = useMemoFirebase(() => {
        if (!firestore || role !== 'client') return null;
        return collection(firestore, 'assets');
    }, [firestore, role]);

    const { data: clientAssets } = useCollection<Asset>(assetsQuery);

    React.useEffect(() => {
        if (role && !['client', 'inspector'].includes(role)) {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const isClient = role === 'client';
    const isInspector = role === 'inspector';

    const currentSchema = isClient ? clientJobSchema : inspectorJobSchema;
    
    const form = useForm<z.infer<typeof currentSchema>>({
        resolver: zodResolver(currentSchema),
        mode: 'onChange',
        defaultValues: {
            title: '', jobType: 'project', industry: undefined, location: '',
            scheduledStartDate: undefined, durationDays: undefined, 
            estimatedBudget: '', certificationsRequired: [], description: '',
            bidExpiryDate: undefined, workflow: 'standard', isMarketplaceJob: true,
            ...(isClient ? { assetIds: [], scope: [] } : { techniques: [] })
        },
    });

    const isMarketplaceJob = form.watch('isMarketplaceJob');
    const techniqueOptions = React.useMemo(() => NDTTechniques.map(t => ({ value: t.id, label: `${t.title} (${t.id})` })), []);
    const certificationOptions = React.useMemo(() => certificationBodies.map(c => ({ value: c, label: c })), []);

    const { fields: scopeFields, replace: replaceScope } = useFieldArray({
        control: form.control,
        name: "scope" as any, // Type assertion to handle union type
    });

    const clientSteps = [
        { id: 1, name: 'Core Details', fields: ['title', 'jobType', 'industry', 'location', 'certificationsRequired', 'estimatedBudget', 'isMarketplaceJob', 'workflow'] },
        { id: 2, name: 'Asset Selection', fields: ['assetIds'] },
        { id: 3, name: 'Technique Assignment', fields: ['scope'] },
        { id: 4, name: 'Scheduling & Documents', fields: ['scheduledStartDate', 'durationDays', 'scheduledEndDate', 'bidExpiryDate', 'documents'] },
        { id: 5, name: 'Review & Publish', fields: ['description'] }
    ];

    const inspectorSteps = [
        { id: 1, name: 'Core Details', fields: ['title', 'clientName', 'jobType', 'industry', 'location'] },
        { id: 2, name: 'Scope & Requirements', fields: ['techniques', 'certificationsRequired', 'estimatedBudget'] },
        { id: 3, name: 'Scheduling & Documents', fields: ['scheduledStartDate', 'durationDays', 'scheduledEndDate', 'documents'] },
        { id: 4, name: 'Review & Create', fields: ['description'] }
    ];

    const steps = isClient ? clientSteps : inspectorSteps;
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleNext = async () => {
        const currentStepFields = steps.find(s => s.id === step)?.fields;
        const isValid = await form.trigger(currentStepFields as any);

        if (isValid) {
            if (step === 2 && isClient) { // After asset selection
                const selectedAssetIds = form.getValues('assetIds' as any) || [];
                const currentScope = form.getValues('scope' as any) || [];
                const newScope = selectedAssetIds.map((assetId: string) => {
                    const existingScopeItem = currentScope.find((s: any) => s.assetId === assetId);
                    return existingScopeItem || { assetId, techniques: [] };
                });
                replaceScope(newScope as any);
            }
            setStep(prev => Math.min(prev + 1, steps.length));
        }
    };

    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const onSubmit = async (values: z.infer<typeof currentSchema>) => {
        if (!firestore || !user || (isClient && !clientAssets)) {
            toast({ variant: "destructive", title: "Error", description: "Required data not loaded. Please try again." });
            return;
        }

        setIsSubmitting(true);
        const batch = writeBatch(firestore);

        try {
            const isInternalJob = isInspector || (isClient && !values.isMarketplaceJob);
            const newJobStatus = (isInternalJob ? 'Assigned' : 'Posted');
            const jobRef = doc(collection(firestore, 'jobs'));
            
            let endDate = values.scheduledEndDate;
            if(values.scheduledStartDate && values.durationDays) {
                endDate = addDays(values.scheduledStartDate, values.durationDays);
            }

            const documentMetadata: JobDocument[] = documentFiles.map(file => ({ name: file.name, url: '#' }));
            
            const jobScope = 'scope' in values ? (values.scope as any) : [];
            const flatAssetIds = isClient ? (values as any).assetIds : [];
            const flatTechniques = isClient ? [...new Set(jobScope.flatMap((s: any) => s.techniques))] : (values as any).techniques;

            const newJobData: any = {
                id: jobRef.id,
                title: values.title,
                location: values.location,
                techniques: flatTechniques,
                description: values.description || '',
                workflow: values.workflow,
                isInternal: isInternalJob,
                assetIds: flatAssetIds,
                clientId: user.uid,
                client: 'clientName' in values ? values.clientName : "Global Energy Corp.",
                clientCompanyId: 'client-01', // Placeholder
                status: newJobStatus,
                postedDate: format(new Date(), 'yyyy-MM-dd'),
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                modifiedAt: serverTimestamp(),
                modifiedBy: user.uid,
                bidExpiryDate: values.bidExpiryDate ? format(values.bidExpiryDate, 'yyyy-MM-dd') : null,
                scheduledStartDate: values.scheduledStartDate ? format(values.scheduledStartDate, 'yyyy-MM-dd') : null,
                scheduledEndDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
                documents: documentMetadata,
                jobType: values.jobType,
                industry: values.industry,
                certificationsRequired: values.certificationsRequired,
                estimatedBudget: values.estimatedBudget || '',
            };
            
            if (values.durationDays) {
                newJobData.durationDays = values.durationDays;
            }

            batch.set(jobRef, newJobData);

            if (isClient && jobScope) {
                for (const scopeItem of jobScope) {
                    const asset = clientAssets!.find(a => a.id === scopeItem.assetId);
                    if (!asset) continue;

                    for (const technique of scopeItem.techniques) {
                        const inspectionRef = doc(collection(firestore, `assets/${scopeItem.assetId}/inspections`));
                        const inspectionData: Omit<Inspection, 'id' | 'report'> = {
                            jobId: jobRef.id,
                            assetId: scopeItem.assetId,
                            assetName: asset.name,
                            technique: technique,
                            inspector: "Unassigned",
                            date: values.scheduledStartDate ? format(values.scheduledStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                            status: 'Scheduled',
                        };
                        batch.set(inspectionRef, { id: inspectionRef.id, ...inspectionData });
                    }
                }
            }

            await batch.commit();
            
            toast({ title: 'Job Posted Successfully', description: `${values.title} has been created and relevant inspections are scheduled.` });
            router.push(constructUrl('/dashboard/my-jobs'));
        } catch(error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to post job." });
        } finally {
            setIsSubmitting(false);
            setIsReviewDialogOpen(false);
        }
    };
    
    // Asset selection state
    const [assetNameFilter, setAssetNameFilter] = React.useState('');
    const [assetLocationFilter, setAssetLocationFilter] = React.useState('all');
    const [assetTypeFilter, setAssetTypeFilter] = React.useState('all');

    const uniqueLocations = React.useMemo(() => ['all', ...new Set((clientAssets || []).map(a => a.location))], [clientAssets]);
    const uniqueTypes = React.useMemo(() => ['all', ...new Set((clientAssets || []).map(a => a.type))], [clientAssets]);

    const filteredAssets = React.useMemo(() => {
        if (!clientAssets) return [];
        return clientAssets.filter(asset => {
            const nameMatch = asset.name.toLowerCase().includes(assetNameFilter.toLowerCase());
            const locationMatch = assetLocationFilter === 'all' || asset.location === assetLocationFilter;
            const typeMatch = assetTypeFilter === 'all' || asset.type === assetTypeFilter;
            return nameMatch && locationMatch && typeMatch;
        });
    }, [clientAssets, assetNameFilter, assetLocationFilter, assetTypeFilter]);

    return (
        <div className="max-w-4xl mx-auto">
             <div className="mb-12">
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center justify-between">
                        {steps.map((s, index) => (
                        <li key={s.name} className={cn("relative", index !== steps.length - 1 ? "flex-1" : "")}>
                            {index > 0 && <div className={cn("absolute inset-0 top-4 -ml-px mt-0.5 h-0.5 w-full", step > index ? "bg-primary" : "bg-border")} aria-hidden="true" />}
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full"
                            >
                                {step > s.id ? (
                                    <button onClick={() => setStep(s.id)} className="h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90">
                                        <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                                    </button>
                                ) : step === s.id ? (
                                    <div className="h-8 w-8 rounded-full border-2 border-primary bg-background flex items-center justify-center" aria-current="step">
                                        <span className="text-primary font-semibold">{s.id}</span>
                                    </div>
                                ) : (
                                     <div className="h-8 w-8 rounded-full border-2 border-border bg-background flex items-center justify-center">
                                        <span className="text-muted-foreground font-semibold">{s.id}</span>
                                    </div>
                                )}
                            </div>
                            <span className="absolute -bottom-7 text-xs text-center w-full hidden sm:block">{s.name}</span>
                        </li>
                        ))}
                    </ol>
                </nav>
            </div>
            
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && (
                        <Card>
                            <CardHeader><CardTitle>Core Details</CardTitle><CardDescription>Start with the basic information for your job.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                {isClient && (
                                    <FormField control={form.control} name="isMarketplaceJob" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border bg-background p-4"><div className="space-y-0.5"><FormLabel className="text-base">Post to Marketplace</FormLabel><FormDescription>Post this job publicly to all qualified providers.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                )}
                                <FormField name="title" control={form.control} render={({ field }) => (<FormItem><FormLabel>Job Title*</FormLabel><FormControl><Input placeholder="e.g., Annual Shutdown Inspection — Crude Unit C3" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                {isInspector && <FormField name="clientName" control={form.control} render={({ field }) => (<FormItem><FormLabel>Client Name*</FormLabel><FormControl><Input placeholder="Enter the name of your client" {...field} /></FormControl><FormMessage /></FormItem>)} />}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField name="jobType" control={form.control} render={({ field }) => (<FormItem><FormLabel>Job Type*</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a job type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="shutdown">Plant Shutdown</SelectItem><SelectItem value="project">Project-Based</SelectItem><SelectItem value="callout">Emergency Call-Out</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField name="industry" control={form.control} render={({ field }) => (<FormItem><FormLabel>Industry / Sector*</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-60">{industries.map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage /></FormItem>)} />
                                </div>
                                <FormField name="location" control={form.control} render={({ field }) => (<FormItem><FormLabel>Site Location*</FormLabel><FormControl><Input placeholder="e.g., Jamnagar, Gujarat, India" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="certificationsRequired" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Certifications Required*</FormLabel><MultiSelect options={certificationOptions} selected={field.value || []} onChange={field.onChange} placeholder="Select certifications..." /><FormMessage /></FormItem>)} />
                                {isMarketplaceJob && <FormField name="estimatedBudget" control={form.control} render={({ field }) => (<FormItem><FormLabel>Estimated Budget (Optional)</FormLabel><FormControl><Input placeholder="e.g., $15,000" {...field} /></FormControl><FormMessage /></FormItem>)}/>}
                                {isMarketplaceJob && <FormField control={form.control} name="workflow" render={({ field }) => (<FormItem><FormLabel>Approval Workflow</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a workflow" /></SelectTrigger></FormControl><SelectContent><SelectItem value="standard">Standard (Client Review Only)</SelectItem><SelectItem value="level3">Level III Audit (Manual)</SelectItem><SelectItem value="auto">Level III Audit (Auto-Assigned)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>}
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && isClient && (
                         <Card>
                            <CardHeader><CardTitle>Asset Selection</CardTitle><CardDescription>Choose which of your assets are included in this job's scope.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <Input placeholder="Filter by name..." value={assetNameFilter} onChange={(e) => setAssetNameFilter(e.target.value)} />
                                    <Select value={assetLocationFilter} onValueChange={setAssetLocationFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{uniqueLocations.map(l => <SelectItem key={l} value={l}>{l === 'all' ? 'All Locations' : l}</SelectItem>)}</SelectContent></Select>
                                    <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{uniqueTypes.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <FormField control={form.control} name="assetIds" render={() => (
                                    <FormItem>
                                        <ScrollArea className="h-60 w-full rounded-md border">
                                            <div className="p-4">{filteredAssets.map((asset) => (<FormField key={asset.id} control={form.control} name="assetIds" render={({ field }) => (<FormItem key={asset.id} className="flex flex-row items-center space-x-3 space-y-0 mb-3"><FormControl><Checkbox checked={field.value?.includes(asset.id)} onCheckedChange={(checked) => (checked ? field.onChange([...(field.value || []), asset.id]) : field.onChange(field.value?.filter((value) => value !== asset.id)))} /></FormControl><FormLabel className="font-normal text-sm">{asset.name} <span className="text-xs text-muted-foreground">({asset.location} / {asset.type})</span></FormLabel></FormItem>)} />))}</div>
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
                    )}
                    
                    {step === 2 && isInspector && (
                         <Card>
                            <CardHeader><CardTitle>Scope & Requirements</CardTitle><CardDescription>Detail the work required for this internal job.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField name="techniques" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Techniques Required*</FormLabel><MultiSelect options={techniqueOptions} selected={field.value || []} onChange={field.onChange} placeholder="Select required techniques..." /><FormMessage /></FormItem>)} />
                                <FormField name="estimatedBudget" control={form.control} render={({ field }) => (<FormItem><FormLabel>Job Value / Budget (Optional)</FormLabel><FormControl><Input placeholder="e.g., $15,000" {...field} /></FormControl><FormMessage /></FormItem>)}/>}
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && isClient && (
                         <Card>
                            <CardHeader><CardTitle>Technique Assignment</CardTitle><CardDescription>Assign specific NDT techniques to each selected asset.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                {scopeFields.map((field, index) => {
                                    const asset = clientAssets?.find(a => a.id === field.assetId);
                                    return (
                                        <div key={field.id} className="rounded-md border p-4 space-y-4">
                                            <h4 className="font-semibold">{asset?.name} <span className="text-sm font-normal text-muted-foreground">({asset?.location})</span></h4>
                                            <FormField
                                                control={form.control}
                                                name={`scope.${index}.techniques`}
                                                render={({ field: multiSelectField }) => (
                                                    <FormItem>
                                                        <FormLabel className="sr-only">Techniques for {asset?.name}</FormLabel>
                                                        <MultiSelect
                                                            options={techniqueOptions}
                                                            selected={multiSelectField.value}
                                                            onChange={multiSelectField.onChange}
                                                            placeholder="Select techniques for this asset..."
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {(step === 4 && isClient) || (step === 3 && isInspector) ? (
                         <Card>
                            <CardHeader><CardTitle>Scheduling & Documents</CardTitle><CardDescription>Provide target dates and attach relevant files.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField name="scheduledStartDate" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Target Start Date {isMarketplaceJob || isInspector ? '*' : ''}</FormLabel><FormControl><CustomDateInput {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField name="durationDays" control={form.control} render={({ field }) => (<FormItem><FormLabel>Estimated Duration (Days) {isMarketplaceJob || isInspector ? '*' : ''}</FormLabel><FormControl><Input type="number" placeholder="e.g., 21" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                {isClient && isMarketplaceJob && <FormField name="bidExpiryDate" control={form.control} render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Bid Closing Date*</FormLabel><FormControl><CustomDateInput {...field} /></FormControl><FormMessage /></FormItem>)}/>}
                                <FormField control={form.control} name="documents" render={() => (<FormItem><FormLabel>Attach Scope Documents (Optional)</FormLabel><Button type="button" variant="outline" className="w-full" onClick={() => documentsInputRef.current?.click()}>Select Files</Button><FormControl><Input ref={documentsInputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES} className="hidden" /></FormControl><FormDescription>Attach P&IDs, drawings, etc. Max {MAX_FILE_SIZE_MB}MB each.</FormDescription><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>
                    ) : null}

                    {(step === 5 && isClient) || (step === 4 && isInspector) ? (
                         <Card>
                            <CardHeader><CardTitle>Final Details</CardTitle><CardDescription>Provide an overall job description before finishing.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField name="description" control={form.control} render={({ field }) => (<FormItem><FormLabel>Overall Job Description (Optional)</FormLabel><FormControl><Textarea placeholder="Provide a summary of the work, special instructions, or any other relevant details..." {...field} className="min-h-[150px]" /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>
                    ) : null}
                    
                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        {step < steps.length ? (
                            <Button type="button" onClick={handleNext}>
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                             <div className="flex gap-2">
                                <Button type="submit" variant="outline" disabled={isSubmitting}>Save as Draft</Button>
                                <Button type="button" onClick={() => setIsReviewDialogOpen(true)} disabled={isSubmitting}>{isClient ? 'Review & Publish' : 'Review & Create'}</Button>
                            </div>
                        )}
                    </div>
                </form>
            </FormProvider>

            <ReviewDialog 
                isOpen={isReviewDialogOpen}
                onClose={() => setIsReviewDialogOpen(false)}
                onConfirm={form.handleSubmit(onSubmit)}
                jobData={form.getValues()}
                clientAssets={clientAssets}
                allTechniques={NDTTechniques}
            />
        </div>
    );
}

    