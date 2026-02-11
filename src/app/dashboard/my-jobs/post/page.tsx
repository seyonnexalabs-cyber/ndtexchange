
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Asset, NDTTechniques, Inspection, clientData, JobDocument } from "@/lib/placeholder-data";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, cn } from '@/lib/utils';
import { PlusCircle, ChevronLeft, FileText, X } from "lucide-react";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import * as React from 'react';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { format, addDays } from 'date-fns';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';


const baseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  jobType: z.enum(['shutdown', 'project', 'callout'], { required_error: 'Please select a job type.' }),
  industry: z.string().optional(),
  location: z.string().min(2, 'Location is required.'),
  techniques: z.array(z.string()).min(1, "At least one technique is required."),
  description: z.string().optional(),
  workflow: z.enum(['standard', 'level3', 'auto']),
  documents: z.any().optional(), // For file uploads
  isMarketplaceJob: z.boolean().default(true),
  bidExpiryDate: z.date().optional(),
  scheduledStartDate: z.date().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  estimatedBudget: z.string().optional(),
  certificationsRequired: z.string().optional(),
  scheduledEndDate: z.date().optional(), // This is for internal calculation, not a form field
});


const industries = [
    'Oil & Gas — Upstream',
    'Oil & Gas — Midstream',
    'Oil & Gas — Downstream/Refinery',
    'Power Generation — Fossil Fuel',
    'Power Generation — Nuclear',
    'Power Generation — Renewables',
    'Aerospace & Defense',
    'Manufacturing',
    'Infrastructure & Construction',
    'Marine & Shipbuilding',
    'Chemical Processing',
];

const certificationBodies = [
    'ASNT (American Society for Nondestructive Testing)',
    'PCN (Personnel Certification in Non-Destructive Testing)',
    'CSWIP (Certification Scheme for Welding Inspection Personnel)',
    'API (American Petroleum Institute)',
    'ACCP (ASNT Central Certification Program)',
    'Other/Equivalent (Specify in description)',
];

export default function PostJobPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const router = useRouter();
    const { toast } = useToast();
    const { firestore, user } = useFirebase();

    const assetsQuery = useMemoFirebase(() => {
        if (!firestore || role !== 'client') return null;
        // In a real app, this should be filtered by the user's companyId
        return collection(firestore, 'assets');
    }, [firestore, role]);

    const { data: clientAssets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);

    React.useEffect(() => {
        if (role && !['client', 'inspector'].includes(role)) {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);
    
    const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);
    const documentsInputRef = React.useRef<HTMLInputElement>(null);
    const [isDraft, setIsDraft] = React.useState(false);

    const [assetNameFilter, setAssetNameFilter] = React.useState('');
    const [assetLocationFilter, setAssetLocationFilter] = React.useState('all');
    const [assetTypeFilter, setAssetTypeFilter] = React.useState('all');
    const [assetStatusFilter, setAssetStatusFilter] = React.useState('all');

    const jobSchema = React.useMemo(() => {
      let schema = baseSchema;
      if (role === 'client') {
        schema = schema.extend({
          assets: z.array(z.string()).refine(value => value.length > 0, {
            message: "You have to select at least one asset for this job.",
          }),
        });
      } else { // inspector
        schema = schema.extend({
          clientName: z.string().min(2, "Client Name is required."),
          description: z.string().min(10, "A description of the asset(s) and scope of work is required."),
        });
      }

      let finalSchema = schema;

      if (role === 'client') {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today to compare dates properly

        finalSchema = finalSchema.refine(data => {
            if (data.isMarketplaceJob && data.bidExpiryDate) {
                return data.bidExpiryDate >= today;
            }
            return true;
        }, {
            message: "Bid expiry date cannot be in the past.",
            path: ["bidExpiryDate"],
        }).refine(data => {
            if (data.isMarketplaceJob && data.scheduledStartDate) {
                return data.scheduledStartDate >= today;
            }
            return true;
        }, {
            message: "Target start date cannot be in the past.",
            path: ["scheduledStartDate"],
        });
      }

      return finalSchema;
    }, [role]);

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            jobType: 'project',
            industry: undefined,
            location: '',
            scheduledStartDate: undefined,
            durationDays: undefined,
            techniques: [],
            estimatedBudget: '',
            certificationsRequired: undefined,
            description: '',
            bidExpiryDate: undefined,
            assets: [],
            workflow: 'standard',
            isMarketplaceJob: true,
        },
    });

    const isMarketplaceJob = form.watch('isMarketplaceJob');

    const uniqueLocations = React.useMemo(() => ['all', ...new Set((clientAssets || []).map(a => a.location))], [clientAssets]);
    const uniqueTypes = React.useMemo(() => ['all', ...new Set((clientAssets || []).map(a => a.type))], [clientAssets]);
    const uniqueStatuses = React.useMemo(() => ['all', ...new Set((clientAssets || []).map(a => a.status))], [clientAssets]);
    const techniqueOptions = React.useMemo(() => NDTTechniques.map(t => ({ value: t.id, label: `${t.name} (${t.id})`})), []);

    const filteredAssets = React.useMemo(() => {
        if (!clientAssets) return [];
        return clientAssets.filter(asset => {
            const nameMatch = asset.name.toLowerCase().includes(assetNameFilter.toLowerCase());
            const locationMatch = assetLocationFilter === 'all' || asset.location === assetLocationFilter;
            const typeMatch = assetTypeFilter === 'all' || asset.type === assetTypeFilter;
            const statusMatch = assetStatusFilter === 'all' || asset.status === assetStatusFilter;
            return nameMatch && locationMatch && typeMatch && statusMatch;
        });
    }, [clientAssets, assetNameFilter, assetLocationFilter, assetTypeFilter, assetStatusFilter]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleDocumentSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFilesArray = Array.from(files);

            const oversizedFiles = newFilesArray.filter(file => file.size > MAX_FILE_SIZE_BYTES);
            if (oversizedFiles.length > 0) {
                toast({
                    variant: 'destructive',
                    title: 'File(s) Too Large',
                    description: `${oversizedFiles.map(f => f.name).join(', ')} exceed(s) the ${MAX_FILE_SIZE_MB}MB limit and will not be uploaded.`,
                });
            }

            const validFiles = newFilesArray.filter(file => file.size <= MAX_FILE_SIZE_BYTES);
            if (validFiles.length > 0) {
                const updatedFiles = [...documentFiles, ...validFiles];
                setDocumentFiles(updatedFiles);
                form.setValue('documents', updatedFiles);
            }
            
            if (documentsInputRef.current) {
                documentsInputRef.current.value = '';
            }
        }
    };

    const handleRemoveDocument = (indexToRemove: number) => {
        const updatedFiles = documentFiles.filter((_, index) => index !== indexToRemove);
        setDocumentFiles(updatedFiles);
        form.setValue('documents', updatedFiles);
    };

    function onSubmit(values: z.infer<typeof jobSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a job." });
            return;
        }

        const isInternalJob = role === 'inspector' || (role === 'client' && !values.isMarketplaceJob);
        const newJobStatus = isDraft ? 'Draft' : (isInternalJob ? 'Assigned' : 'Posted');
        const jobRef = doc(collection(firestore, 'jobs'));
        
        let endDate = values.scheduledEndDate;
        if(values.scheduledStartDate && values.durationDays) {
            endDate = addDays(values.scheduledStartDate, values.durationDays);
        }

        const inspections: Omit<Inspection, 'id' | 'report'>[] = [];
        if ('assets' in values && clientAssets) {
            (values.assets || []).forEach((assetId: string) => {
                const asset = clientAssets.find(a => a.id === assetId);
                if (asset) {
                    values.techniques.forEach(technique => {
                        inspections.push({
                            jobId: jobRef.id,
                            assetName: asset.name,
                            assetId: asset.id,
                            technique: technique,
                            inspector: 'Pending',
                            date: values.scheduledStartDate ? format(values.scheduledStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                            status: 'Scheduled',
                        });
                    })
                }
            });
        }
        
        const documentMetadata: JobDocument[] = [];
        if (values.documents && values.documents.length > 0) {
            Array.from(values.documents).forEach((file: File) => {
                documentMetadata.push({ name: file.name, url: '#' }); // Placeholder URL
            });
        }
        
        const newJobData = {
            id: jobRef.id,
            title: values.title,
            location: values.location,
            techniques: values.techniques,
            description: values.description || '',
            workflow: values.workflow,
            isInternal: isInternalJob,
            assetIds: 'assets' in values ? values.assets : [],
            clientId: user.uid,
            clientCompanyId: 'client-01',
            client: 'clientName' in values ? values.clientName : (clientData.find(c => c.id === 'client-01')?.name || "Global Energy Corp."),
            status: newJobStatus,
            postedDate: format(new Date(), 'yyyy-MM-dd'),
            createdAt: serverTimestamp(),
            bidExpiryDate: values.bidExpiryDate ? format(values.bidExpiryDate, 'yyyy-MM-dd') : null,
            scheduledStartDate: values.scheduledStartDate ? format(values.scheduledStartDate, 'yyyy-MM-dd') : null,
            scheduledEndDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
            inspections,
            documents: documentMetadata,
            bids: [],
            history: [],
            technicianIds: [],
            equipmentIds: [],
            jobType: values.jobType,
            industry: values.industry,
            durationDays: values.durationDays,
            estimatedBudget: values.estimatedBudget,
            certificationsRequired: values.certificationsRequired,
        };
        
        setDoc(jobRef, newJobData)
          .catch(error => {
            console.error("Failed to save job:", error);
             toast({
                variant: "destructive",
                title: "Failed to create job",
                description: "There was a problem saving your job to the database. Please try again.",
            });
          });

        toast({
            title: isDraft ? 'Draft Saved' : 'Job Posted Successfully',
            description: `${values.title} is now available in your jobs list.`,
        });
        router.push(constructUrl('/dashboard/my-jobs'));
    }

    const isClient = role === 'client';
    const isInspector = role === 'inspector';

    if (role && !['client', 'inspector'].includes(role)) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                     <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <PlusCircle className="text-primary" />
                        {isClient ? 'Post a New Job' : 'Create Internal Job'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isClient 
                            ? 'Fill out the details to create a new job listing on the marketplace.'
                            : 'Create a job for your own records and internal assignments.'
                        }
                    </p>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href={constructUrl('/dashboard/my-jobs')}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        Back to My Jobs
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                             <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Annual Shutdown Inspection — Crude Unit C3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="jobType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a job type" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="shutdown">Plant Shutdown</SelectItem>
                                                    <SelectItem value="project">Project-Based</SelectItem>
                                                    <SelectItem value="callout">Emergency Call-Out</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="industry"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Industry / Sector</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {industries.map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Site Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Jamnagar, Gujarat, India" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="scheduledStartDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Target Start Date</FormLabel>
                                            <FormControl><CustomDateInput {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="durationDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Duration (Days)</FormLabel>
                                            <FormControl><Input type="number" placeholder="e.g., 21" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="techniques"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>NDT Techniques Required</FormLabel>
                                            <MultiSelect
                                                options={techniqueOptions}
                                                selected={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select techniques..."
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="grid md:grid-cols-2 gap-6">
                                 <FormField
                                    control={form.control}
                                    name="estimatedBudget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Budget (Optional)</FormLabel>
                                            <FormControl><Input placeholder="e.g., ₹25L – ₹50L" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="certificationsRequired"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Certification Required</FormLabel>
                                             <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select required certification" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {certificationBodies.map(cert => <SelectItem key={cert} value={cert}>{cert}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scope Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Provide a detailed scope of work..." {...field} className="min-h-[150px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isClient && (
                                <FormField
                                control={form.control}
                                name="isMarketplaceJob"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Post to Marketplace</FormLabel>
                                        <FormDescription>
                                            Post this job publicly to all qualified providers on the marketplace.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />
                            )}
                            
                            {isMarketplaceJob && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="bidExpiryDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                            <FormLabel>Bid Closing Date</FormLabel>
                                            <FormControl><CustomDateInput {...field} /></FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="workflow"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Approval Workflow</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a workflow" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="standard">Standard (Client Review Only)</SelectItem>
                                                        <SelectItem value="level3">Level III Audit (Manual)</SelectItem>
                                                        <SelectItem value="auto">Level III Audit (Auto-Assigned)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                             {isClient && (
                                <FormField
                                    control={form.control}
                                    name="assets"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Select Assets for this Job</FormLabel>
                                                <FormDescription>Choose which of your assets are included in this job's scope.</FormDescription>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 mb-4">
                                                <Input placeholder="Filter by name..." value={assetNameFilter} onChange={(e) => setAssetNameFilter(e.target.value)} />
                                                <Select value={assetLocationFilter} onValueChange={setAssetLocationFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{uniqueLocations.map(l => <SelectItem key={l} value={l}>{l === 'all' ? 'All Locations' : l}</SelectItem>)}</SelectContent></Select>
                                                <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{uniqueTypes.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All Types' : t}</SelectItem>)}</SelectContent></Select>
                                                <Select value={assetStatusFilter} onValueChange={setAssetStatusFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</SelectItem>)}</SelectContent></Select>
                                            </div>
                                            <ScrollArea className="h-60 w-full rounded-md border">
                                                <div className="p-4">
                                                {isLoadingAssets ? <p>Loading assets...</p> : filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                                                    <FormField
                                                        key={asset.id}
                                                        control={form.control}
                                                        name="assets"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem key={asset.id} className="flex flex-row items-center space-x-3 space-y-0 mb-3">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(asset.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked ? field.onChange([...(field.value || []), asset.id]) : field.onChange(field.value?.filter((value) => value !== asset.id));
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal text-sm">{asset.name} <span className="text-xs text-muted-foreground">({asset.location} / {asset.type})</span></FormLabel>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                )) : <p className="text-center text-muted-foreground">No assets match your filters.</p>}
                                                </div>
                                            </ScrollArea>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            
                             <FormField
                                control={form.control}
                                name="documents"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Attach Scope Documents (Optional)</FormLabel>
                                         <Button type="button" variant="outline" className="w-full" onClick={() => documentsInputRef.current?.click()}>
                                            Select Files to Attach
                                        </Button>
                                        <FormControl>
                                            <Input
                                                ref={documentsInputRef}
                                                type="file"
                                                multiple
                                                accept={ACCEPTED_FILE_TYPES}
                                                className="hidden"
                                                onChange={handleDocumentSelection}
                                            />
                                        </FormControl>
                                        {documentFiles.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                 <p className="text-sm font-medium">{documentFiles.length} file(s) attached:</p>
                                                 <ScrollArea className="max-h-32 rounded-md border p-2">
                                                    {documentFiles.map((file, index) => (
                                                        <div key={`${file.name}-${index}`} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <FileText className="h-4 w-4 shrink-0 text-primary" />
                                                                <span className="truncate">{file.name}</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 shrink-0"
                                                                onClick={() => handleRemoveDocument(index)}
                                                            >
                                                                <X className="h-4 w-4 text-primary" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>
                                        )}
                                        <FormDescription>
                                            Attach P&IDs, drawings, or other scope documents. Max {MAX_FILE_SIZE_MB}MB each.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="submit" variant="outline" onClick={() => setIsDraft(true)}>Save as Draft</Button>
                                <Button type="submit" onClick={() => setIsDraft(false)}>Publish Job Posting</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

