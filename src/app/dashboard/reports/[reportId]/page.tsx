'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { jobs, clientData, Inspection, serviceProviders } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, Save, AlertTriangle, User, Calendar, HardHat, Building, CheckCircle, XCircle, Maximize } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportGenerator from '../../my-jobs/components/report-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NDTTechniques, subscriptionPlans as initialPlans } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import UniformDocumentViewer, { ViewerDocument } from '@/app/dashboard/components/uniform-document-viewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';


const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

// --- Report Viewer Component ---
const ReportViewerPage = ({ reportId }: { reportId: string }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') || 'client';
    const isAuditor = role === 'auditor';
    const { toast } = useToast();
    const [isViewerOpen, setIsViewerOpen] = React.useState(false);

    const { inspection, job } = React.useMemo(() => {
        let inspection: Inspection | undefined;
        let job: (typeof jobs[0]) | undefined;
        for (const j of jobs) {
            const found = j.inspections?.find(i => i.report?.id === reportId);
            if (found) {
                inspection = found;
                job = j;
                break;
            }
        }
        return { inspection, job };
    }, [reportId]);
    
    const provider = React.useMemo(() => serviceProviders.find(p => p.id === job?.providerId), [job]);

    const allDocuments: ViewerDocument[] = React.useMemo(() => {
        const docs: ViewerDocument[] = [];
        if (!inspection?.report) return docs;
        docs.push({ name: `Inspection_Report_${inspection?.id}.pdf`, source: 'Provider (Main Report)' });
        if (inspection.report.documents) {
            docs.push(...inspection.report.documents.map(d => ({ ...d, source: 'Provider (Attachment)' })));
        }
        return docs;
    }, [inspection]);

    if (!inspection || !job) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const backLink = isAuditor ? "/dashboard/inspections" : "/dashboard/reports";
    const backText = isAuditor ? "Back to Audit Queue" : "Back to Reports";

    const handleApprove = () => {
        toast({
            title: "Report Approved",
            description: `The inspection report for ${inspection.assetName} has been approved.`,
        });
        // In a real app, update status in the backend.
    }

    const handleReject = () => {
        toast({
            variant: "destructive",
            title: "Revisions Requested",
            description: `The report has been sent back to the provider for revisions.`,
        });
         // In a real app, update status in the backend.
    }

    return (
        <div>
            <Button asChild variant="outline" size="sm" className="mb-4">
                <Link href={constructUrl(backLink)}>
                    <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
                    {backText}
                </Link>
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-headline flex items-center gap-3">
                                        <FileText className="text-primary" />
                                        Inspection Report for {inspection.assetName}
                                    </CardTitle>
                                    <CardDescription>Inspection ID: <span className="font-extrabold text-foreground">{inspection.id}</span></CardDescription>
                                </div>
                                <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Available Documents ({allDocuments.length})</h3>
                                    <Button onClick={() => setIsViewerOpen(true)} disabled={allDocuments.length === 0}>
                                        <Maximize className="mr-2 h-4 w-4 text-primary" />
                                        View All Documents
                                    </Button>
                                </div>
                                <ScrollArea className="space-y-2 rounded-md border p-2 max-h-48">
                                    {allDocuments.map((doc) => (
                                        <div key={doc.name} className="flex items-center gap-2 p-2">
                                            <FileText className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-sm font-medium truncate" title={doc.name}>{doc.name}</span>
                                        </div>
                                    ))}
                                    {allDocuments.length === 0 && (
                                        <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                                            No report documents found for this inspection.
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>

                    {isAuditor && (
                         <Card>
                             <CardHeader>
                                <CardTitle>Auditor Actions</CardTitle>
                                <CardDescription>Review the report and provide your decision.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="audit-comments">Comments for Provider (if requesting revisions)</Label>
                                    <Textarea id="audit-comments" placeholder="e.g., 'Please clarify the UT readings in section 3.2. The provided image is unclear...'" className="mt-2 min-h-[120px]"/>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="destructive" onClick={handleReject}>
                                    <XCircle className="mr-2"/>
                                    Request Revisions
                                </Button>
                                 <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                                    <CheckCircle className="mr-2"/>
                                    Approve Report
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inspection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div className="flex items-start">
                                <HardHat className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Technique</p>
                                    <p className="text-muted-foreground">{inspection.technique}</p>
                                </div>
                            </div>
                             <div className="flex items-start">
                                <User className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Inspector</p>
                                    <p className="text-muted-foreground">{inspection.inspector}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Calendar className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Inspection Date</p>
                                    <p className="text-muted-foreground">{inspection.date}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start">
                                <Building className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Client</p>
                                    <p className="text-muted-foreground">{job.client}</p>
                                </div>
                            </div>
                             <div className="flex items-start">
                                <HardHat className="w-4 h-4 mr-3 mt-1 text-primary"/>
                                <div>
                                    <p className="font-semibold">Service Provider</p>
                                    <p className="text-muted-foreground">{provider?.name}</p>
                                </div>
                            </div>
                            <Separator />
                             <Button asChild variant="outline" className="w-full">
                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>
                                    View Full Job Details
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <UniformDocumentViewer 
                isOpen={isViewerOpen}
                onOpenChange={setIsViewerOpen}
                documents={allDocuments}
                title={`Documents for Inspection ${inspection.id}`}
                description="Securely view all reports and documents associated with this inspection."
            />
        </div>
    );
};

// --- Report Generation Component ---

const reportSchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters."),
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

const ReportHeader = ({ job, client, provider, plan, inspection }: { job: any, client?: any, provider?: any, plan?: any, inspection: Inspection }) => {
    let logoUrl = 'https://placehold.co/150x50/111827/FFFFFF/png?text=NDT+Exchange';
    let brandColor = '#4A6572';

    if (plan?.customBranding && provider?.logoUrl) {
        logoUrl = provider.logoUrl;
        brandColor = provider.brandColor || brandColor;
    } else if (client?.logoUrl) {
        logoUrl = client.logoUrl;
        brandColor = client.brandColor || client.brandColor;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b-2" style={{ borderColor: brandColor }}>
                {logoUrl && <Image src={logoUrl} alt="Company Logo" width={150} height={50} className="object-contain" />}
                <div className="text-right">
                    <h2 className="text-2xl font-bold" style={{ color: brandColor }}>INSPECTION REPORT</h2>
                    <p className="text-sm font-semibold">Report #: {job.id}-REP-{inspection.id}</p>
                </div>
            </div>
        </div>
    );
};

const ReportFooter = () => (
    <div className="mt-8 pt-4 border-t text-xs text-muted-foreground text-center">
        <p className="font-bold">Disclaimer</p>
        <p>This report was generated via the NDT Exchange platform. NDT Exchange serves as a facilitator for job management and is not a party to the service agreement between the client and the provider. NDT Exchange makes no representations or warranties regarding the accuracy, completeness, or reliability of the inspection results herein. All findings, conclusions, and liabilities are the sole responsibility of the service provider and the client.</p>
    </div>
);

const ReportGeneratorPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const jobId = searchParams.get('jobId');
    const inspectionId = searchParams.get('inspectionId');
    
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = React.useState(false);
    const [saveLog, setSaveLog] = React.useState<string[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    
    const isSubscriptionActive = false;
    
    const job = React.useMemo(() => jobs.find(j => j.id === jobId), [jobId]);
    const inspection = React.useMemo(() => {
        if (!job || !inspectionId) return null;
        return job.inspections.find(i => i.id === inspectionId);
    }, [job, inspectionId]);
    
    const client = React.useMemo(() => clientData.find(c => c.name === job?.client), [job]);
    const provider = React.useMemo(() => serviceProviders.find(p => p.id === job?.providerId), [job]);
    const [devTemplate, setDevTemplate] = React.useState<string>(inspection?.technique || job?.technique || '');
    
    const subscription = React.useMemo(() => {
        if (!provider) return null;
        return initialPlans.find(s => s.name === 'Company Growth');
    }, [provider]);

    const plan = React.useMemo(() => {
        if (!subscription) return null;
        return initialPlans.find(p => p.name === subscription.plan);
    }, [subscription]);
    
    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: { summary: '', findings: [{ location: "", thickness: 0, notes: "" }] },
    });

    const handleSave = React.useCallback(() => {
        if (form.formState.isDirty) {
            const currentValues = form.getValues();
            console.log("Saving draft...", currentValues);
            const now = new Date();
            const timestamp = format(now, 'p');
            toast({ title: "Draft Saved", description: `Your changes were saved at ${timestamp}.` });
            setSaveLog(prevLog => [`Last saved at ${timestamp}`, ...prevLog].slice(0, 5));
            form.reset(currentValues, { keepValues: true, keepDirty: false, keepDefaultValues: false });
        }
    }, [form, toast]);
    
    if (!job || !inspection) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const onSubmit = (values: z.infer<typeof reportSchema>) => {
        console.log("Report Submitted", values);
        toast({ title: "Report Submitted Successfully", description: `The report for job ${job.id} has been submitted for review.` });
        router.push(constructUrl(`/dashboard/my-jobs/${job.id}`));
    };
    
    const lastSavedMessage = () => {
        if (saveLog.length > 0) return saveLog[0];
        return 'Auto-save is off. Remember to save your draft.';
    };

    return (
        <div>
             {!isSubscriptionActive && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Subscription Inactive</AlertTitle>
                    <AlertDescription>Your plan is inactive, so this page is in read-only mode. Please visit settings to manage your subscription.</AlertDescription>
                </Alert>
            )}
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={constructUrl(`/dashboard/my-jobs/${jobId}`)}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Job Details
                    </Link>
                </Button>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="autosave-toggle" checked={isAutoSaveEnabled} onCheckedChange={setIsAutoSaveEnabled} disabled={!isSubscriptionActive} />
                            <Label htmlFor="autosave-toggle">Auto-save</Label>
                        </div>
                        {!isAutoSaveEnabled && (
                            <Button variant="outline" onClick={() => handleSave()} disabled={!isSubscriptionActive}>
                                <Save className="mr-2"/>
                                Save Draft
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} disabled={!isSubscriptionActive}><Printer className="mr-2"/> Generate PDF</Button>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={!isSubscriptionActive}><FileText className="mr-2"/> Submit Report</Button>
                    </div>
                </div>
            </div>

            <div className="mb-4 text-xs text-muted-foreground">{lastSavedMessage()}</div>
            
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
                <ReportHeader job={job} client={client} provider={provider} plan={plan} inspection={inspection} />
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-6 text-sm">
                    <div><span className="font-semibold">Client:</span> {job.client}</div>
                    <div><span className="font-semibold">Service Provider:</span> {provider?.name}</div>
                    <div><span className="font-semibold">Job Location:</span> {job.location}</div>
                    <div><span className="font-semibold">Inspection Date:</span> {format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</div>
                </div>

                <Separator className="my-6" />
                <Form {...form}>
                <fieldset disabled={!isSubscriptionActive}>
                    <form onBlur={isAutoSaveEnabled ? handleSave : undefined}>
                        <ReportGenerator technique={inspection.technique} devOverrideTechnique={devTemplate} />
                    </form>
                </fieldset>
                </Form>
                <ReportFooter />
            </Card>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate PDF</DialogTitle>
                        <DialogDescription>This will open your browser's print dialog. Review the content on the page, then use the print dialog to save as a PDF.</DialogDescription>
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
