
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
import { clientAssets, NDTTechniques, Inspection } from "@/lib/placeholder-data";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, cn } from '@/lib/utils';
import { PlusCircle, ChevronLeft, FileText, X } from "lucide-react";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import * as React from 'react';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { format } from 'date-fns';
import { MultiSelect } from '@/components/ui/multi-select';

const baseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  location: z.string().min(2, 'Location is required.'),
  technique: z.string({ required_error: "Please select a technique."}),
  description: z.string().optional(),
  workflow: z.enum(['standard', 'level3', 'auto']),
  documents: z.any().optional(), // For file uploads
  bidExpiryDate: z.date().optional(),
  scheduledStartDate: z.date().optional(),
  scheduledEndDate: z.date().optional(),
});


export default function PostJobPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const router = useRouter();
    const { toast } = useToast();

    React.useEffect(() => {
        if (role && !['client', 'inspector'].includes(role)) {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);
    
    const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);
    const documentsInputRef = React.useRef<HTMLInputElement>(null);

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

      return schema.refine(data => {
        if (data.scheduledStartDate && data.scheduledEndDate) {
            return data.scheduledEndDate >= data.scheduledStartDate;
        }
        return true;
      }, {
          message: "End date cannot be before start date.",
          path: ["scheduledEndDate"],
      });
    }, [role]);

    const form = useForm<z.infer<typeof jobSchema>>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: '',
            location: '',
            technique: undefined,
            description: '',
            assets: [],
            clientName: '',
            workflow: 'standard',
        },
    });

    const uniqueLocations = React.useMemo(() => ['all', ...new Set(clientAssets.map(a => a.location))], []);
    const uniqueTypes = React.useMemo(() => ['all', ...new Set(clientAssets.map(a => a.type))], []);
    const uniqueStatuses = React.useMemo(() => ['all', ...new Set(clientAssets.map(a => a.status))], []);

    const filteredAssets = React.useMemo(() => {
        return clientAssets.filter(asset => {
            const nameMatch = asset.name.toLowerCase().includes(assetNameFilter.toLowerCase());
            const locationMatch = assetLocationFilter === 'all' || asset.location === assetLocationFilter;
            const typeMatch = assetTypeFilter === 'all' || asset.type === assetTypeFilter;
            const statusMatch = assetStatusFilter === 'all' || asset.status === assetStatusFilter;
            return nameMatch && locationMatch && typeMatch && statusMatch;
        });
    }, [assetNameFilter, assetLocationFilter, assetTypeFilter, assetStatusFilter]);

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
        const inspections: Omit<Inspection, 'id' | 'jobId' | 'report'>[] = [];
        const inspectionDate = values.scheduledStartDate ? format(values.scheduledStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

        if (role === 'client' && 'assets' in values) {
            (values.assets || []).forEach(assetId => {
                const asset = clientAssets.find(a => a.id === assetId);
                if (asset) {
                    inspections.push({
                        assetName: asset.name,
                        assetId: asset.id,
                        technique: values.technique,
                        inspector: 'Pending',
                        date: inspectionDate,
                        status: 'Scheduled',
                    });
                }
            });
        } else if (role === 'inspector') {
            inspections.push({
                assetName: values.description!.substring(0, 50),
                assetId: 'N/A',
                technique: values.technique,
                inspector: 'Pending',
                date: inspectionDate,
                status: 'Scheduled',
            });
        }

        const newJobData = {
            ...values,
            inspections: inspections,
            isInternal: role === 'inspector'
        };

        console.log('New Job Submitted:', newJobData);
        toast({
            title: 'Job Created Successfully',
            description: `${values.title} is now ready to be managed.`,
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
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., PAUT on Pressure Vessel Welds" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {isInspector && (
                                    <FormField
                                        control={form.control}
                                        name="clientName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your client's company name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City, State" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="technique"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Required Technique</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a technique" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {NDTTechniques.map(tech => (
                                                        <SelectItem key={tech.id} value={tech.id}>{tech.name} ({tech.id})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {isClient && (
                                  <FormField
                                      control={form.control}
                                      name="bidExpiryDate"
                                      render={({ field }) => (
                                          <FormItem className="flex flex-col">
                                          <FormLabel>Bid Expiry Date</FormLabel>
                                           <FormControl>
                                            <CustomDateInput {...field} />
                                          </FormControl>
                                          <FormMessage />
                                          </FormItem>
                                      )}
                                  />
                                )}
                                <FormField
                                    control={form.control}
                                    name="scheduledStartDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Target Start Date (Optional)</FormLabel>
                                        <FormControl>
                                            <CustomDateInput {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="scheduledEndDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Target End Date (Optional)</FormLabel>
                                         <FormControl>
                                            <CustomDateInput {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                           {isClient && (
                              <FormField
                                  control={form.control}
                                  name="assets"
                                  render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Select Asset(s) for Inspection</FormLabel>
                                    <FormDescription>
                                        Use the filters below to narrow down the list of assets available in the dropdown.
                                    </FormDescription>
                                    <Card className="p-4 bg-muted/50 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <Input 
                                                placeholder="Filter by asset name..."
                                                value={assetNameFilter}
                                                onChange={(e) => setAssetNameFilter(e.target.value)}
                                            />
                                            <Select value={assetLocationFilter} onValueChange={setAssetLocationFilter}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    {uniqueLocations.map(loc => <SelectItem key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    {uniqueTypes.map(type => <SelectItem key={type} value={type}>{type === 'all' ? 'All Types' : type}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Select value={assetStatusFilter} onValueChange={setAssetStatusFilter}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    {uniqueStatuses.map(status => <SelectItem key={status} value={status}>{status === 'all' ? 'All Statuses' : status}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </Card>
                                     <FormControl>
                                        <MultiSelect
                                            options={filteredAssets.map(asset => ({ value: asset.id, label: `${asset.name} (${asset.location})` }))}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Select assets from the filtered list..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                  )}
                              />
                            )}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {isClient ? 'Job Description (Optional)' : 'Asset(s) & Scope of Work'}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea placeholder={
                                                isClient 
                                                    ? "Provide a detailed scope of work, requirements, and any specifications for the service providers." 
                                                    : "Describe the asset(s) to be inspected, e.g., '10-inch diameter carbon steel pipe rack, approx. 200 feet long. Perform UT thickness readings at 50 designated locations.'"
                                                }
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="documents"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Attach Documents</FormLabel>
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
                                                <div className="mt-2 space-y-2">
                                                     <p className="text-xs font-medium text-muted-foreground">{documentFiles.length} file(s) attached:</p>
                                                     <div className="max-h-24 rounded-md border p-2 space-y-1">
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
                                                    </div>
                                                </div>
                                            )}
                                            <FormDescription>
                                                You can upload multiple files. Max {MAX_FILE_SIZE_MB}MB per file.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit">{isClient ? 'Post Job' : 'Create Job'}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
