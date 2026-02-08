
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { jobs, clientData } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportGenerator from '../../components/report-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NDTTechniques } from '@/lib/placeholder-data';
import { subscriptionPlans as initialPlans } from '@/lib/subscription-plans';

const reportSchema = z.object({
  // Generic fields for all reports
  summary: z.string().min(10, "Summary must be at least 10 characters."),

  // Optional fields for different templates.
  // UT
  equipmentUsed: z.string().optional(),
  calibrationBlock: z.string().optional(),
  couplant: z.string().optional(),
  surfaceCondition: z.string().optional(),
  inspectionArea: z.string().optional(),
  findings: z.array(z.object({
    location: z.string(),
    thickness: z.coerce.number(),
    notes: z.string().optional(),
  })).optional(),
  // MT
  equipment: z.string().optional(),
  media: z.string().optional(),
  fieldStrength: z.string().optional(),
  lighting: z.string().optional(),
  // PT
  penetrant: z.string().optional(),
  remover: z.string().optional(),
  developer: z.string().optional(),
  dwellTime: z.string().optional(),
  // RT
  source: z.string().optional(),
  voltage: z.string().optional(),
  exposure: z.string().optional(),
  filmType: z.string().optional(),
  // ET
  frequency: z.string().optional(),
  instrument: z.string().optional(),
  probe: z.string().optional(),
  // Acoustic templates
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


const ReportHeader = ({ job, client, provider, plan }: { job: any, client?: any, provider?: any, plan?: any }) => {
    let logoUrl = 'https://placehold.co/150x50/111827/FFFFFF/png?text=NDT+Exchange';
    let brandColor = '#4A6572'; // Default primary color

    if (plan?.customBranding && provider?.logoUrl) {
        logoUrl = provider.logoUrl;
        brandColor = provider.brandColor || brandColor;
    } else if (client?.logoUrl) {
        logoUrl = client.logoUrl;
        brandColor = client.brandColor || client.brandColor;
    }

    return (
        <div className="flex justify-between items-center pb-4 border-b-2" style={{ borderColor: brandColor }}>
            {logoUrl && <Image src={logoUrl} alt="Company Logo" width={150} height={50} className="object-contain" />}
            <div className="text-right">
                <h2 className="text-2xl font-bold" style={{ color: brandColor }}>INSPECTION REPORT</h2>
                <p className="text-sm font-semibold">Report #: {job.id}-REP-001</p>
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
    
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = React.useState(false);
    const [saveLog, setSaveLog] = React.useState<string[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    
    const job = React.useMemo(() => jobs.find(j => j.id === id), [id]);
    const client = React.useMemo(() => clientData.find(c => c.name === job?.client), [job]);
    const provider = React.useMemo(() => serviceProviders.find(p => p.id === job?.providerId), [job]);
    const [devTemplate, setDevTemplate] = React.useState<string>(job?.technique || '');
    
    const subscription = React.useMemo(() => {
        if (!provider) return null;
        return initialPlans.find(s => s.name === 'Company Growth'); // Simplified for demo
    }, [provider]);

    const plan = React.useMemo(() => {
        if (!subscription) return null;
        return initialPlans.find(p => p.name === subscription.plan);
    }, [subscription]);
    
    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            summary: '',
            findings: [{ location: "", thickness: 0, notes: "" }],
            equipmentUsed: '', calibrationBlock: '', couplant: '', surfaceCondition: '',
            inspectionArea: '', equipment: '', media: '', fieldStrength: '', lighting: '',
            penetrant: '', remover: '', developer: '', dwellTime: '', source: '',
            voltage: '', exposure: '', filmType: '', frequency: '', instrument: '',
            probe: '', sensorLayout: '', threshold: '', preamplifierGain: '',
            ringSpacing: '', frequencyRange: '', deadZone: '', transducerType: '',
            pulseWidth: '', samplingRate: '',
        },
    });

    const handleSave = React.useCallback(() => {
        if (form.formState.isDirty) {
            const currentValues = form.getValues();
            console.log("Saving draft...", currentValues);
            
            const now = new Date();
            const timestamp = format(now, 'p');
            
            toast({
                title: "Draft Saved",
                description: `Your changes were saved at ${timestamp}.`,
            });
            setSaveLog(prevLog => [`Last saved at ${timestamp}`, ...prevLog].slice(0, 5));
            form.reset(currentValues, { keepValues: true, keepDirty: false, keepDefaultValues: false });
        }
    }, [form, toast]);
    
    if (!job) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const onSubmit = (values: z.infer<typeof reportSchema>) => {
        console.log("Report Submitted", values);
        toast({
            title: "Report Submitted Successfully",
            description: `The report for job ${job.id} has been submitted for review.`,
        });
        router.push(constructUrl(`/dashboard/my-jobs/${job.id}`));
    };
    
    const lastSavedMessage = () => {
        if (saveLog.length > 0) {
            return saveLog[0];
        }
        return 'Auto-save is off. Remember to save your draft.';
    };

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
                        <Button variant="outline" onClick={() => setIsPreviewOpen(true)}><Printer className="mr-2"/> Generate PDF</Button>
                        <Button onClick={form.handleSubmit(onSubmit)}><FileText className="mr-2"/> Submit Report</Button>
                    </div>
                </div>
            </div>

            <div className="mb-4 text-xs text-muted-foreground">
                {lastSavedMessage()}
            </div>
            
            {process.env.NODE_ENV === 'development' && (
                <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Developer Controls</AlertTitle>
                    <AlertDescription className="flex items-center gap-4 mt-2">
                        <Label>Override Template:</Label>
                         <Select value={devTemplate} onValueChange={setDevTemplate}>
                            <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {NDTTechniques.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </AlertDescription>
                </Alert>
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
                </div>

                <Separator className="my-6" />
                <Form {...form}>
                <form onBlur={isAutoSaveEnabled ? handleSave : undefined}>
                    <ReportGenerator technique={job.technique} devOverrideTechnique={devTemplate} />
                </form>
                </Form>
            </Card>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate PDF</DialogTitle>
                        <DialogDescription>
                            This will open your browser's print dialog. Review the content on the page, then use the print dialog to save as a PDF.
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
