'use client';
import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { jobs, clientData, allUsers, Job, subscriptions } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { subscriptionPlans } from '@/lib/subscription-plans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import dynamic from 'next/dynamic';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import type { EditorProps } from 'react-draft-wysiwyg';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const Editor = dynamic<EditorProps>(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
);


const utReportSchema = z.object({
  equipmentUsed: z.string().min(1, "Equipment is required."),
  calibrationBlock: z.string().min(1, "Calibration block is required."),
  couplant: z.string().min(1, "Couplant is required."),
  surfaceCondition: z.string().min(1, "Surface condition is required."),
  inspectionArea: z.string().min(1, "Inspection area is required."),
  findings: z.array(z.object({
    location: z.string().min(1, "Location is required."),
    thickness: z.coerce.number().positive("Thickness must be a positive number."),
    notes: z.string().optional(),
  })),
  summary: z.any().refine((editorState) => {
    if (!editorState) return false;
    const contentState = editorState.getCurrentContent();
    return contentState.hasText();
  }, { message: "Summary is required." }),
});

const ReportHeader = ({ job, client, provider, plan }: { job: Job, client?: any, provider?: any, plan?: any }) => {
    let logoUrl = 'https://placehold.co/150x50/111827/FFFFFF/png?text=NDT+Exchange';
    let brandColor = '#4A6572'; // Default primary color

    if (plan?.customBranding && provider?.logoUrl) {
        logoUrl = provider.logoUrl;
        brandColor = provider.brandColor || brandColor;
    } else if (client?.logoUrl) {
        logoUrl = client.logoUrl;
        brandColor = client.brandColor || brandColor;
    }

    return (
        <div className="flex justify-between items-center pb-4 border-b-2" style={{ borderColor: brandColor }}>
            {logoUrl && <Image src={logoUrl} alt="Company Logo" width={150} height={50} className="object-contain" />}
            <div className="text-right">
                <h2 className="text-2xl font-bold" style={{ color: brandColor }}>ULTRASONIC TEST REPORT</h2>
                <p className="text-sm font-semibold">Report #: {job.id}-UT-001</p>
            </div>
        </div>
    );
};

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const id = params.id as string;
    
    // States for auto-save feature
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = React.useState(true);
    const [saveLog, setSaveLog] = React.useState<string[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    
    const [isClientMounted, setIsClientMounted] = React.useState(false);
    
    const job = React.useMemo(() => jobs.find(j => j.id === id), [id]);
    const client = React.useMemo(() => clientData.find(c => c.name === job?.client), [job]);
    const provider = React.useMemo(() => serviceProviders.find(p => p.id === job?.providerId), [job]);
    
    const subscription = React.useMemo(() => {
        if (!provider) return null;
        return subscriptions.find(s => s.companyId === provider.id);
    }, [provider]);

    const plan = React.useMemo(() => {
        if (!subscription) return null;
        return subscriptionPlans.find(p => p.name === subscription.plan);
    }, [subscription]);
    
    const assignedTechnicians = React.useMemo(() => allUsers.filter(u => job?.technicianIds?.includes(u.id)), [job]);

    const form = useForm<z.infer<typeof utReportSchema>>({
        resolver: zodResolver(utReportSchema),
        defaultValues: {
            findings: [{ location: "", thickness: 0, notes: "" }],
        },
    });

    React.useEffect(() => {
        // This runs only on the client
        form.setValue('summary', EditorState.createEmpty());
        setIsClientMounted(true);
    }, [form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "findings",
    });
    
    const handleSave = React.useCallback(() => {
        if (form.formState.isDirty) {
            // No validation check here, just save if dirty
            const currentValues = form.getValues();
            console.log("Saving draft...", currentValues);
            
            const now = new Date();
            const timestamp = format(now, 'p');
            
            toast({
                title: "Draft Saved",
                description: `Your changes were saved at ${timestamp}.`,
            });

            setSaveLog(prevLog => [`Saved at ${timestamp}`, ...prevLog].slice(0, 5));
            form.reset(currentValues, { keepValues: true, keepDirty: false, keepDefaultValues: false });
        }
    }, [form, toast]);

    const handleAutoSave = React.useCallback(() => {
        if (isAutoSaveEnabled) {
            handleSave();
        }
    }, [isAutoSaveEnabled, handleSave]);
    
    if (!job) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const onSubmit = (values: z.infer<typeof utReportSchema>) => {
        const rawSummary = convertToRaw(values.summary.getCurrentContent());
        console.log("Report Submitted", { ...values, summary: rawSummary });
        toast({
            title: "Report Submitted Successfully",
            description: `The UT report for job ${job.id} has been submitted for review.`,
        });
        router.push(constructUrl(`/dashboard/my-jobs/${job.id}`));
    };

    if (!isClientMounted) {
        return null; // or a loading spinner
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={constructUrl(`/dashboard/my-jobs/${id}`)}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Job Details
                    </Link>
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="autosave-toggle" checked={isAutoSaveEnabled} onCheckedChange={setIsAutoSaveEnabled} />
                            <Label htmlFor="autosave-toggle">Auto-save</Label>
                        </div>
                        {!isAutoSaveEnabled && (
                            <Button variant="outline" onClick={() => handleSave()}>
                                <Save className="mr-2"/>
                                Save Draft
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(true)}><Printer className="mr-2"/> Print</Button>
                        <Button onClick={form.handleSubmit(onSubmit)}><FileText className="mr-2"/> Submit Report</Button>
                    </div>
                </div>
            </div>
             {saveLog.length > 0 && (
                <div className="mb-4 text-xs text-muted-foreground">
                    {saveLog[0]}
                </div>
            )}

            <Card className="max-w-4xl mx-auto p-8 printable-area">
                <div className="watermark-container">
                    <p className="watermark-text">NDT Exchange</p>
                </div>
                <ReportHeader job={job} client={client} provider={provider} plan={plan} />
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-6 text-sm">
                    <div><span className="font-semibold">Client:</span> {job.client}</div>
                    <div><span className="font-semibold">Service Provider:</span> {provider?.name}</div>
                    <div><span className="font-semibold">Job Location:</span> {job.location}</div>
                    <div><span className="font-semibold">Inspection Date:</span> {format(new Date(job.scheduledStartDate || Date.now()), GLOBAL_DATE_FORMAT)}</div>
                    <div><span className="font-semibold">Asset(s):</span> {job.assetIds?.join(', ')}</div>
                    <div><span className="font-semibold">Inspector(s):</span> {assignedTechnicians.map(t => t.name).join(', ')}</div>
                </div>

                <Separator className="my-6" />
                <Form {...form}>
                <form onBlur={handleAutoSave} className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Equipment & Setup</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="equipmentUsed" render={({ field }) => (
                            <FormItem><FormLabel>UT Instrument & Probes</FormLabel><FormControl><Input placeholder="e.g., Olympus 45MG, M110-RM probe" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="calibrationBlock" render={({ field }) => (
                            <FormItem><FormLabel>Calibration Block</FormLabel><FormControl><Input placeholder="e.g., IIW Type 1 Block, S/N: CB-54321" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="couplant" render={({ field }) => (
                            <FormItem><FormLabel>Couplant</FormLabel><FormControl><Input placeholder="e.g., Sonotech Ultragel II" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="surfaceCondition" render={({ field }) => (
                            <FormItem><FormLabel>Surface Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select surface condition..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="As-is">As-is</SelectItem><SelectItem value="Cleaned">Cleaned</SelectItem><SelectItem value="Ground">Ground</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <Separator className="my-6" />
                    <h3 className="text-lg font-semibold border-b pb-2">Inspection Findings</h3>
                     <FormField control={form.control} name="inspectionArea" render={({ field }) => (
                        <FormItem><FormLabel>General Area of Inspection</FormLabel><FormControl><Input placeholder="e.g., Vessel Shell Course 3, West Side" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end border p-4 rounded-lg">
                                <FormField control={form.control} name={`findings.${index}.location`} render={({ field }) => (
                                    <FormItem><FormLabel>Measurement Location</FormLabel><FormControl><Input placeholder={`e.g., TML-${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name={`findings.${index}.thickness`} render={({ field }) => (
                                    <FormItem><FormLabel>Thickness (mm)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name={`findings.${index}.notes`} render={({ field }) => (
                                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Input placeholder="Optional notes" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 /></Button>
                            </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => append({ location: "", thickness: 0, notes: "" })}>Add Measurement</Button>
                    </div>

                     <Separator className="my-6" />
                    <h3 className="text-lg font-semibold border-b pb-2">Summary & Conclusion</h3>
                     <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Summary of Findings</FormLabel>
                                <FormControl>
                                    <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                        {isClientMounted && (
                                            <Editor
                                                editorState={field.value}
                                                onEditorStateChange={field.onChange}
                                                placeholder="Provide a detailed summary of the inspection results, including any recommendations."
                                                toolbarClassName="border-b"
                                                wrapperClassName="min-h-[250px] flex flex-col"
                                                editorClassName="p-3 flex-grow"
                                                toolbar={{
                                                    options: ['inline', 'blockType', 'list', 'history'],
                                                    inline: {
                                                        options: ['bold', 'italic', 'underline'],
                                                    },
                                                    list: {
                                                        options: ['unordered', 'ordered'],
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
                </Form>
            </Card>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate PDF</DialogTitle>
                        <DialogDescription>
                            This action will open your browser's print dialog, allowing you to save the current report view as a PDF.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            window.print();
                            setIsPreviewOpen(false);
                        }}>
                            <Printer className="mr-2 h-4 w-4" />
                            Proceed to Print
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
