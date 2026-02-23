
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, Save, AlertTriangle, User, Calendar, HardHat, Building, CheckCircle, XCircle, Maximize } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT, cn } from '@/lib/utils';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReportGenerator from '../../my-jobs/components/report-generator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import UniformDocumentViewer, { ViewerDocument } from '@/app/dashboard/components/uniform-document-viewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobActivityLog from '@/app/dashboard/my-jobs/components/job-history';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import JobChatWindow from '@/app/dashboard/my-jobs/components/job-chat-window';
import { useMobile } from '@/hooks/use-mobile';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, useDoc, useUser } from '@/firebase';
import { collection, serverTimestamp, query, where, limit, getDocs, doc, collectionGroup, updateDoc, writeBatch, documentId, setDoc, arrayUnion, addDoc } from 'firebase/firestore';
import type { Bid, Job, JobDocument, NDTServiceProvider, Client, Review, NDTTechnique, PlatformUser, Inspection, InspectionReport } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import WorkBreakdownAccordion from '../../my-jobs/components/work-breakdown-accordion';
import { JobLifecycle } from '../../my-jobs/components/job-lifecycle';


const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'destructive' | 'secondary' > = {
    'Completed': 'success',
    'Scheduled': 'secondary',
    'Requires Review': 'destructive',
};

// --- Report Viewer Component ---
const ReportViewerPage = ({ reportId }: { reportId: string }) => {
    // This component will be built out later. For now, it's a placeholder.
    // It should fetch the report by its ID and display it in a read-only format.
    return (
        <div>
            <h1>Viewing Report: {reportId}</h1>
            <p>Report viewer functionality to be implemented.</p>
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

const ReportHeader = ({ job, client, provider, inspection }: { job: any, client?: any, provider?: any, inspection: Inspection }) => {
    const clientLogo = client?.logoUrl || 'https://placehold.co/120x40/f0f0f0/999999/png?text=Client+Logo';
    const providerLogo = provider?.logoUrl || 'https://placehold.co/200x80/FF6600/FFFFFF/png?text=TEAM';
    const brandColor = client?.brandColor || '#3B82F6';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b-2" style={{ borderColor: brandColor }}>
                <div className="w-1/3 flex justify-start">
                    <Image src={clientLogo} alt="Client Logo" width={120} height={40} className="object-contain h-10" />
                </div>
                <div className="w-1/3 text-center">
                    <h2 className="text-xl font-bold" style={{ color: brandColor }}>INSPECTION REPORT</h2>
                    <p className="text-sm font-semibold">Report #: {job.id}-REP-{inspection.id}</p>
                </div>
                <div className="w-1/3 flex justify-end">
                     <Image src={providerLogo} alt="Provider Logo" width={120} height={40} className="object-contain h-10" />
                </div>
            </div>
        </div>
    );
};

const SignatureLine = ({ name, role, date }: { name?: string; role: string; date?: string }) => (
    <div className="flex-1 border-t-2 border-dotted pt-2 mt-20 text-left">
        <p className="font-semibold">{name || '\u00A0'}</p> 
        <p className="text-xs text-muted-foreground">{role}</p>
        {date && <p className="text-xs text-muted-foreground">Date: {date}</p>}
    </div>
);

const ReportFooter = ({ inspection, job, client, provider }: { inspection?: Inspection, job?: Job, client?: Client, provider?: NDTServiceProvider }) => {
    // This is simplified. In a real app, you'd fetch the actual assigned technicians.
    const inspectors = job?.assignedTechnicians || [];
    
    return (
        <div className="mt-16 pt-8 text-sm break-after-page">
            <h3 className="font-bold text-lg mb-4 text-center">Approvals</h3>
            <div className="flex flex-col md:flex-row gap-12 md:gap-16">
                <div className="flex-1">
                    <p className="font-semibold text-center mb-2">Service Provider</p>
                    {inspectors.length > 0 ? (
                        inspectors.map(inspector => (
                            <SignatureLine key={inspector.id} name={inspector.name} role={`${inspector.level} Inspector`} />
                        ))
                    ) : (
                         <SignatureLine name={provider?.contactPerson} role="Provider Representative" />
                    )}
                </div>
                {(job?.workflow === 'level3' || job?.workflow === 'auto') && (
                    <div className="flex-1">
                        <p className="font-semibold text-center mb-2">Auditor</p>
                        <SignatureLine name={job?.status === 'Audit Approved' || job?.status === 'Client Approved' ? 'Alex Chen' : undefined} role="Level III Auditor" />
                    </div>
                )}
                <div className="flex-1">
                     <p className="font-semibold text-center mb-2">Client Representative</p>
                    <SignatureLine name={job?.status === 'Client Approved' || job?.status === 'Completed' || job?.status === 'Paid' ? client?.contactPerson : undefined} role="Client Representative" />
                </div>
            </div>
             <div className="mt-16 pt-8 border-t text-xs text-muted-foreground text-center report-disclaimer">
                <p className="font-bold">Disclaimer</p>
                <p>This report was generated via the NDT EXCHANGE platform. NDT EXCHANGE serves as a facilitator for job management and is not a party to the service agreement between the client and the provider. NDT EXCHANGE makes no representations or warranties regarding the accuracy, completeness, or reliability of the inspection results herein. All findings, conclusions, and liabilities are the sole responsibility of the service provider and the client.</p>
            </div>
        </div>
    );
};


const ReportGeneratorPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { firestore, authUser } = useFirebase();

    const jobId = searchParams.get('jobId');
    const inspectionId = searchParams.get('inspectionId');
    const assetId = searchParams.get('assetId');
    
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [orientation, setOrientation] = React.useState('portrait');

    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(useMemoFirebase(() => (firestore && jobId ? doc(firestore, 'jobs', jobId) : null), [firestore, jobId]));
    const { data: inspection, isLoading: isLoadingInspection } = useDoc<Inspection>(useMemoFirebase(() => (firestore && assetId && inspectionId ? doc(firestore, 'assets', assetId, 'inspections', inspectionId) : null), [firestore, assetId, inspectionId]));
    const { data: client, isLoading: isLoadingClient } = useDoc<Client>(useMemoFirebase(() => (firestore && job?.clientCompanyId ? doc(firestore, 'companies', job.clientCompanyId) : null), [firestore, job]));
    const { data: provider, isLoading: isLoadingProvider } = useDoc<NDTServiceProvider>(useMemoFirebase(() => (firestore && job?.providerId ? doc(firestore, 'companies', job.providerId) : null), [firestore, job]));
    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser]));
    
    const [devTemplate, setDevTemplate] = React.useState<string>('');
    
    useEffect(() => {
        if(inspection?.technique) {
            setDevTemplate(inspection.technique);
        }
    }, [inspection]);

    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: { summary: '', findings: [{ location: "", thickness: 0, notes: "" }] },
    });
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const onSubmit = async (values: z.infer<typeof reportSchema>) => {
        if (!firestore || !job || !inspection || !assetId || !authUser || !currentUserProfile) {
            toast({ variant: "destructive", title: "Error", description: "Missing critical data to submit report." });
            return;
        }

        setIsSubmitting(true);
        try {
            const batch = writeBatch(firestore);

            // 1. Create new report document
            const reportRef = doc(collection(firestore, "reports"));
            const reportData: Omit<InspectionReport, 'id'> = {
                submittedOn: new Date().toISOString(),
                submittedBy: currentUserProfile?.name || 'Unknown User',
                reportData: values,
                documents: [], // Document upload logic would go here
            };
            batch.set(reportRef, { id: reportRef.id, ...reportData });

            // 2. Update the inspection sub-document
            const inspectionRef = doc(firestore, 'assets', assetId, 'inspections', inspection.id);
            batch.update(inspectionRef, {
                status: 'Completed',
                report: {
                    id: reportRef.id,
                    submittedOn: reportData.submittedOn,
                    submittedBy: reportData.submittedBy,
                }
            });

            // 3. Update the job status and history
            const jobRef = doc(firestore, 'jobs', job.id);
            const newStatus: Job['status'] = job.workflow === 'standard' ? 'Client Review' : 'Report Submitted';
            const historyEntry: JobUpdate = {
                user: currentUserProfile?.name || 'System',
                timestamp: serverTimestamp(),
                action: 'Submitted inspection report',
                details: `Report for ${inspection.assetName} (${inspection.technique}) submitted.`,
                statusChange: newStatus,
            };
            batch.update(jobRef, {
                status: newStatus,
                history: arrayUnion(historyEntry)
            });

            await batch.commit();

            toast({
                title: "Report Submitted Successfully",
                description: `The report for job ${job.id} has been submitted for review.`,
            });
            router.push(constructUrl(`/dashboard/my-jobs/${job.id}`));

        } catch (error) {
            console.error("Error submitting report:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not save the report." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isLoading = isLoadingJob || isLoadingInspection || isLoadingClient || isLoadingProvider || isLoadingProfile || !jobId || !inspectionId || !assetId;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-screen w-full" />
            </div>
        )
    }

    if (!job || !inspection) {
        notFound();
    }
    
    return (
        <div className={orientation}>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 print-hidden">
                <Button asChild variant="outline" size="sm">
                    <Link href={constructUrl(`/dashboard/my-jobs/${jobId}`)}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Job Details
                    </Link>
                </Button>
                 <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(true)} disabled={isSubmitting}><Printer className="mr-2"/> Generate PDF</Button>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : <><FileText className="mr-2"/> Submit Report</>}
                        </Button>
                    </div>
                </div>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <Alert className="mb-6 print-hidden">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Developer Controls</AlertTitle>
                    <AlertDescription className="flex items-center gap-4 mt-2">
                        <Label>Override Template:</Label>
                         <Select value={devTemplate} onValueChange={setDevTemplate}>
                            <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UT">UT</SelectItem>
                                <SelectItem value="MT">MT</SelectItem>
                                <SelectItem value="PT">PT</SelectItem>
                                <SelectItem value="RT">RT</SelectItem>
                                <SelectItem value="VT">VT</SelectItem>
                                <SelectItem value="ET">ET</SelectItem>
                                <SelectItem value="AE">AE</SelectItem>
                                <SelectItem value="GWT">GWT</SelectItem>
                                <SelectItem value="APR">APR</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label>Orientation:</Label>
                         <Select value={orientation} onValueChange={setOrientation}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="portrait">Portrait</SelectItem>
                                <SelectItem value="landscape">Landscape</SelectItem>
                            </SelectContent>
                        </Select>
                    </AlertDescription>
                </Alert>
            )}

            <Card className="max-w-4xl mx-auto p-8 printable-area report-body">
                 <div className="watermark-container">
                    <p className="watermark-text">NDT EXCHANGE</p>
                </div>
                <ReportHeader job={job} client={client} provider={provider} inspection={inspection} />
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 my-6 text-sm">
                    <div><span className="font-semibold">Client:</span> {job.client}</div>
                    <div><span className="font-semibold">Service Provider:</span> {provider?.name}</div>
                    <div><span className="font-semibold">Job Location:</span> {job.location}</div>
                    <div><span className="font-semibold">Inspection Date:</span> {format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</div>
                </div>

                <Separator className="my-6" />
                <Form {...form}>
                <fieldset disabled={isSubmitting}>
                    <form>
                        <ReportGenerator technique={inspection.technique} devOverrideTechnique={devTemplate} />
                    </form>
                </fieldset>
                </Form>
                <ReportFooter job={job} inspection={inspection} client={client} provider={provider} />
            </Card>

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
