
'use client';
import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { jobs, clientData, serviceProviders, inspectorAssets, allUsers, Job } from '@/lib/placeholder-data';
import { subscriptionPlans } from '@/lib/subscription-plans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, ShieldCheck, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
  summary: z.string().min(10, "Summary is required."),
});

const ReportHeader = ({ job, client, provider, plan }: { job: Job, client?: any, provider?: any, plan?: any }) => {
    let logoUrl = 'https://placehold.co/150x50/111827/FFFFFF/png?text=NDT+Exchange';
    let brandColor = '#3B82F6'; // Default primary color

    if (client?.logoUrl) {
        logoUrl = client.logoUrl;
        brandColor = client.brandColor || brandColor;
    } else if (plan?.customBranding && provider?.logoUrl) {
        logoUrl = provider.logoUrl;
        brandColor = provider.brandColor || brandColor;
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

    const job = React.useMemo(() => jobs.find(j => j.id === id), [id]);
    const client = React.useMemo(() => clientData.find(c => c.name === job?.client), [job]);
    const provider = React.useMemo(() => serviceProviders.find(p => p.id === job?.providerId), [job]);
    const planParam = searchParams.get('plan');
    const plan = React.useMemo(() => subscriptionPlans.find(p => p.name.toLowerCase().replace(' ', '-') === planParam), [planParam]);
    const assignedTechnicians = React.useMemo(() => allUsers.filter(u => job?.technicianIds?.includes(u.id)), [job]);


    const form = useForm<z.infer<typeof utReportSchema>>({
        resolver: zodResolver(utReportSchema),
        defaultValues: {
            findings: [{ location: "", thickness: 0, notes: "" }],
            summary: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "findings",
    });

    if (!job) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const onSubmit = (values: z.infer<typeof utReportSchema>) => {
        console.log("Report Submitted", values);
        toast({
            title: "Report Submitted Successfully",
            description: `The UT report for job ${job.id} has been submitted for review.`,
        });
        router.push(constructUrl(`/dashboard/my-jobs/${job.id}`));
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={constructUrl(`/dashboard/my-jobs/${id}`)}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                        Back to Job Details
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2"/> Print/Save as PDF</Button>
                    <Button onClick={form.handleSubmit(onSubmit)}><FileText className="mr-2"/> Submit Report</Button>
                </div>
            </div>

            <Card className="max-w-4xl mx-auto p-8 printable-area">
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
                <form className="space-y-6">
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
                     <FormField control={form.control} name="summary" render={({ field }) => (
                        <FormItem><FormLabel>Summary of Findings</FormLabel><FormControl><Textarea placeholder="Provide a summary of the inspection results, including any areas of concern, recommendations, and overall condition." className="min-h-32" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </form>
                </Form>
            </Card>
        </div>
    );
}
