
'use client';
import * as React from 'react';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft, Trash } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useUser, errorEmitter, FirestorePermissionError, useMemoFirebase, useCollection } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, writeBatch } from 'firebase/firestore';
import type { Job, PlatformUser, Asset, NDTTechnique, Inspection } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { cn, safeParseDate } from '@/lib/utils';
import { format } from 'date-fns';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';


const scopeItemSchema = z.object({
  assetId: z.string(),
  techniques: z.array(z.string()).min(1, "Please select at least one technique for this asset."),
});

const editJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().optional(),
  location: z.string().min(3, 'Location is required.'),
  scheduledStartDate: z.date().optional(),
  scheduledEndDate: z.date().optional(),
  internalNotes: z.string().optional(),
  scope: z.array(scopeItemSchema).min(1, "You must define a scope for at least one asset."),
  newLocation: z.string().optional(),
}).refine(data => {
    if (data.scheduledEndDate && data.scheduledStartDate && data.scheduledEndDate < data.scheduledStartDate) {
        return false;
    }
    return true;
}, {
    message: 'End date cannot be before start date.',
    path: ['scheduledEndDate'],
});

type EditJobFormValues = z.infer<typeof editJobSchema>;

export default function EditJobPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const searchParams = useSearchParams();
    const { firestore, user: authUser } = useFirebase();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isAddAssetOpen, setIsAddAssetOpen] = React.useState(false);

    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(
        useMemoFirebase(() => (firestore && id ? doc(firestore, `jobs`, id) : null), [firestore, id])
    );
    
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );
    
    const { data: clientAssets, isLoading: isLoadingAssets } = useCollection<Asset>(
        useMemoFirebase(() => (firestore && userProfile?.companyId ? query(collection(firestore, 'assets'), where('companyId', '==', userProfile.companyId)) : null), [firestore, userProfile])
    );
    const { data: allTechniques, isLoading: isLoadingTechniques } = useCollection<NDTTechnique>(
        useMemoFirebase(() => (firestore ? collection(firestore, 'techniques') : null), [firestore])
    );
    const { data: inspections, isLoading: isLoadingInspections } = useCollection<Inspection>(
        useMemoFirebase(() => (firestore && id ? query(collection(firestore, 'inspections'), where('jobId', '==', id)) : null), [firestore, id])
    );

    const form = useForm<EditJobFormValues>({
        resolver: zodResolver(editJobSchema),
    });

    const { fields: scopeFields, append: appendScope, remove: removeScope } = useFieldArray({
        control: form.control,
        name: "scope",
    });
    
    React.useEffect(() => {
        if (job && inspections) {
            const reconstructedScope = (job.assetIds || []).map(assetId => {
                const assetInspections = inspections.filter(i => i.assetId === assetId);
                const techniques = assetInspections.map(i => i.technique);
                return { assetId, techniques: [...new Set(techniques)] };
            }).filter(scopeItem => scopeItem.techniques.length > 0 || job.assetIds?.includes(scopeItem.assetId));

            form.reset({
                title: job.title,
                description: job.description || '',
                location: job.location,
                scheduledStartDate: job.scheduledStartDate ? safeParseDate(job.scheduledStartDate) ?? undefined : undefined,
                scheduledEndDate: job.scheduledEndDate ? safeParseDate(job.scheduledEndDate) ?? undefined : undefined,
                internalNotes: job.internalNotes || '',
                scope: reconstructedScope.length > 0 ? reconstructedScope : job.assetIds?.map(id => ({assetId: id, techniques: []})) || [],
            });
        }
    }, [job, inspections, form]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const handleFormSubmit = async (values: EditJobFormValues) => {
        if (!firestore || !authUser || !userProfile || !job) return;
        setIsSubmitting(true);
        const batch = writeBatch(firestore);

        try {
            const { scope, ...jobData } = values;
            const assetIds = scope.map(s => s.assetId);

            const dataToSave = {
                ...jobData,
                assetIds: assetIds,
                scheduledStartDate: values.scheduledStartDate ? format(values.scheduledStartDate, 'yyyy-MM-dd') : null,
                scheduledEndDate: values.scheduledEndDate ? format(values.scheduledEndDate, 'yyyy-MM-dd') : null,
                modifiedAt: serverTimestamp(),
                modifiedBy: authUser.uid,
            };
            batch.update(doc(firestore, 'jobs', id), dataToSave);

            for (const scopeItem of scope) {
                const asset = clientAssets?.find(a => a.id === scopeItem.assetId);
                if (!asset) continue;

                for (const technique of scopeItem.techniques) {
                    const inspectionExists = inspections?.some(
                        insp => insp.assetId === scopeItem.assetId && insp.technique === technique
                    );

                    if (!inspectionExists) {
                        const inspectionRef = doc(collection(firestore, 'inspections'));
                        const inspectionData: Omit<Inspection, 'id' | 'report'> = {
                            jobId: id,
                            clientCompanyId: userProfile.companyId,
                            providerCompanyId: job.providerCompanyId,
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

            toast.success("Job Updated", { description: `Job "${values.title}" has been successfully updated.` });
            router.push(constructUrl(`/dashboard/my-jobs/${id}`));
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: `jobs/${id}`,
                operation: 'update',
                requestResourceData: values,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast.error("Update Failed", { description: "You might not have permission to edit this job." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const techniqueOptions: MultiSelectOption[] = React.useMemo(() => (allTechniques || []).map(t => ({ value: t.acronym, label: `${t.title} (${t.acronym})` })), [allTechniques]);
    
    const [selectedNewAssets, setSelectedNewAssets] = React.useState<string[]>([]);
    
    const handleAddAssetsToScope = () => {
        selectedNewAssets.forEach(assetId => {
            appendScope({ assetId, techniques: [] });
        });
        setSelectedNewAssets([]);
        setIsAddAssetOpen(false);
    };
    
    const currentAssetIdsInScope = form.watch('scope').map(s => s.assetId);
    const availableAssets = clientAssets?.filter(asset => !currentAssetIdsInScope.includes(asset.id));

    const isLoading = isLoadingJob || isLoadingProfile || isLoadingAssets || isLoadingTechniques || isLoadingInspections;

    if (isLoading) {
        return <div className="max-w-2xl mx-auto"><Skeleton className="h-screen" /></div>;
    }
    
    if (!job) {
        notFound();
    }
    
    return (
        <FormProvider {...form}>
            <div className="max-w-2xl mx-auto">
                <Link href={constructUrl(`/dashboard/my-jobs/${id}`)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-4")}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Job Details
                </Link>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Job: {job.title}</CardTitle>
                            <CardDescription>Update the details for this job.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="min-h-24" /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="location" render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="scheduledStartDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Scheduled Start Date</FormLabel> <FormControl><CustomDateInput {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="scheduledEndDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Scheduled End Date</FormLabel> <FormControl><CustomDateInput {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Scope of Work</CardTitle>
                            <CardDescription>Define which assets are part of this job and what techniques are required for each.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {scopeFields.map((field, index) => {
                                    const asset = clientAssets?.find(a => a.id === field.assetId);
                                    if (!asset) return null;
                                    return (
                                        <div key={field.id} className="rounded-md border p-4 space-y-4 bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div className="font-semibold">{asset.name} <span className="text-sm font-normal text-muted-foreground">({asset.location})</span></div>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeScope(index)}><Trash className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name={`scope.${index}.techniques`}
                                                render={({ field: multiSelectField }) => (
                                                    <FormItem>
                                                        <FormLabel className="sr-only">Techniques for {asset.name}</FormLabel>
                                                        <MultiSelect options={techniqueOptions} selected={multiSelectField.value} onChange={multiSelectField.onChange} placeholder="Assign techniques..." />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                             <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" className="mt-4">Add Asset to Scope</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add Assets to Job Scope</DialogTitle>
                                        <DialogDescription>Select one or more assets to add to this job.</DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-72 border rounded-md p-4">
                                        {(availableAssets || []).map(asset => (
                                             <div key={asset.id} className="flex flex-row items-center space-x-3 space-y-0 mb-3">
                                                <Checkbox
                                                    id={`asset-select-${asset.id}`}
                                                    checked={selectedNewAssets.includes(asset.id)}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedNewAssets(prev => checked ? [...prev, asset.id] : prev.filter(id => id !== asset.id));
                                                    }}
                                                />
                                                <label htmlFor={`asset-select-${asset.id}`} className="font-normal text-sm">{asset.name} <span className="text-xs text-muted-foreground">({asset.location})</span></label>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => { setIsAddAssetOpen(false); setSelectedNewAssets([]); }}>Cancel</Button>
                                        <Button type="button" onClick={handleAddAssetsToScope} disabled={selectedNewAssets.length === 0}>Add Selected Assets</Button>
                                    </DialogFooter>
                                </DialogContent>
                             </Dialog>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
                        <CardContent>
                             <FormField control={form.control} name="internalNotes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Internal Notes</FormLabel>
                                    <FormControl><Textarea {...field} className="min-h-24" placeholder="Add notes visible only to your company..." /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    <CardFooter className="px-0 pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => router.push(constructUrl(`/dashboard/my-jobs/${id}`))}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                    </CardFooter>
                </form>
            </div>
        </FormProvider>
    );
}

