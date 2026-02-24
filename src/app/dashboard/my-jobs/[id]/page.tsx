
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, Save, AlertTriangle, User, Users, Calendar, HardHat, Building, CheckCircle, XCircle, Maximize, FileUp, Award, ShieldCheck, MessageSquare, Star, Gavel, Clock, Factory, DollarSign, Workflow, UserCheck, Briefcase, MapPin, Wrench, Folder, File } from 'lucide-react';
import { format, parseISO, differenceInDays, addDays, isValid } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, ACCEPTED_FILE_TYPES, cn } from '@/lib/utils';
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
import type { Bid, Job, JobDocument, NDTServiceProvider, Client, Review, NDTTechnique, PlatformUser, Inspection } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import WorkBreakdownAccordion from '../../my-jobs/components/work-breakdown-accordion';
import { JobLifecycle } from '../../my-jobs/components/job-lifecycle';


const bidSchema = z.object({
    amount: z.coerce.number().positive("Bid amount must be a positive number."),
    mobilizationDate: z.date({ required_error: "Please select a mobilization date." }),
    teamSize: z.coerce.number().int().min(1, "Team size must be at least 1."),
    certifications: z.array(z.string()).optional(),
    coverNote: z.string().max(1200, "Cover note cannot exceed 200 words (approx. 1200 characters).").optional(),
});


const statusDescriptions: Record<Job['status'], string> = {
    'Draft': 'Job is being created and is not yet visible.',
    'Posted': 'Job is live on the marketplace, awaiting bids.',
    'Assigned': 'Job has been awarded to an inspector.',
    'Scheduled': 'Inspection date and time have been confirmed.',
    'In Progress': 'Inspection is currently being performed.',
    'Report Submitted': 'Inspector has submitted the inspection report.',
    'Under Audit': 'Report is being reviewed by a Level III auditor.',
    'Audit Approved': 'Auditor has approved the inspection report.',
    'Client Review': 'Report is now with the client for final review.',
    'Client Approved': 'Client has approved the report and findings.',
    'Completed': 'All work is finished and the job is closed.',
    'Paid': 'Payment for the job has been settled.',
    'Revisions Requested': 'Report was rejected and requires revisions from the provider.',
};

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success', 'Revisions Requested': 'destructive'
};

const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'destructive' | 'secondary' > = {
    'Completed': 'success',
    'Scheduled': 'secondary',
    'Requires Review': 'destructive',
};

const scheduleSchema = z.object({
  scheduledStartDate: z.date(),
  scheduledEndDate: z.date().optional(),
}).refine(data => {
    if (data.scheduledStartDate && data.scheduledEndDate) {
        return data.scheduledEndDate >= data.scheduledStartDate;
    }
    return true;
}, {
    message: "End date cannot be before start date.",
    path: ["scheduledEndDate"],
});

const ScheduleJobForm = ({ onSubmit, onCancel, defaultValues }: { onSubmit: (values: z.infer<typeof scheduleSchema>) => void, onCancel: () => void, defaultValues: any }) => {
    const form = useForm<z.infer<typeof scheduleSchema>>({
        resolver: zodResolver(scheduleSchema),
        defaultValues,
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="scheduledStartDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Scheduled Start Date</FormLabel>
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
                        <FormLabel>Scheduled End Date (Optional)</FormLabel>
                        <FormControl>
                            <CustomDateInput {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Confirm Schedule</Button>
                </DialogFooter>
            </form>
        </Form>
    )
};

const InspectorActions = ({ status, onScheduleClick }: { status: Job['status'], onScheduleClick: () => void }) => {
    if (status === 'Assigned') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Next Step: Schedule Job</CardTitle>
                    <CardDescription>Confirm the inspection dates to move the job to the next stage.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={onScheduleClick}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Job
                    </Button>
                </CardFooter>
            </Card>
        )
    }
    return null;
}


const AuditorActions = ({ status, workflow, isAuditor, reportSubmitted, onApprove, onReject, inspections, handleViewDocuments }: { 
    status: Job['status'], 
    workflow: Job['workflow'], 
    isAuditor: boolean, 
    reportSubmitted: boolean,
    onApprove: () => void, 
    onReject: (comments: string) => void,
    inspections: Inspection[],
    handleViewDocuments: (docs: ViewerDocument[], initialDoc?: string) => void,
}) => {
    const [rejectionComment, setRejectionComment] = React.useState('');
    if (workflow === 'standard') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-muted-foreground/70 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Auditor Review</CardTitle>
                    <CardDescription>This job follows the standard workflow and does not require Level III Auditor review.</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    const isPostAudit = ['Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'].includes(status);

    if (isPostAudit) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Audit Result</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 bg-green-600/10 text-green-700 p-4 rounded-md">
                        <CheckCircle className="w-8 h-8" />
                        <div>
                            <p className="font-bold">Report Approved</p>
                            <p className="text-sm">The report was approved by the auditor on 22-Jul-2024.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!reportSubmitted) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-muted-foreground/70 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Auditor Review</CardTitle>
                    <CardDescription>This step will become active once the service provider submits their final report.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isAuditor) {
        const reportsToReview = inspections.filter(i => i.report && i.status === 'Completed');
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Auditor Actions</CardTitle>
                    <CardDescription>Review the report and provide your decision.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Reports for Review:</h4>
                        {reportsToReview.length > 0 ? (
                            <div className="space-y-2 rounded-md border p-2">
                                {reportsToReview.map(inspection => (
                                    <div key={inspection.id} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                                            <span className="truncate">{inspection.assetName} - {inspection.technique} Report</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleViewDocuments(inspection.report ? [{ name: `Report_${inspection.report.id}.pdf`, url: '', source: 'Generated Report' }] : [])}>View</Button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-muted-foreground">No reports submitted for review yet.</p>}
                    </div>
                    <div>
                        <Label htmlFor="audit-comments">Comments for Provider (if requesting revisions)</Label>
                        <Textarea id="audit-comments" placeholder="e.g., 'Please clarify the UT readings in section 3.2...'" className="mt-2 min-h-[120px]" value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="destructive" onClick={() => onReject(rejectionComment)}>
                        <XCircle className="mr-2"/>
                        Request Revisions
                    </Button>
                     <Button className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
                        <CheckCircle className="mr-2"/>
                        Approve Report
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Auditor Review Pending</CardTitle>
                <CardDescription>The inspection report has been submitted and is currently under review by the Level III Auditor.</CardDescription>
            </CardHeader>
        </Card>
    );
};

const ClientReviewActions = ({ status, workflow, isClient, onApprove, onReject, inspections, handleViewDocuments }: { 
    status: Job['status'], 
    workflow: Job['workflow'],
    isClient: boolean, 
    onApprove: () => void, 
    onReject: (comments: string) => void,
    inspections: Inspection[],
    handleViewDocuments: (docs: ViewerDocument[], initialDoc?: string) => void,
}) => {
    const [rejectionComment, setRejectionComment] = React.useState('');
    const showStandardReview = isClient && status === 'Report Submitted' && workflow === 'standard';
    const showAuditedReview = isClient && status === 'Audit Approved';

    if (!showStandardReview && !showAuditedReview) {
        return null;
    }

    const reportsToReview = inspections.filter(i => i.report && i.status === 'Completed');
    const title = showAuditedReview ? 'Final Review' : 'Report Review';
    const description = showAuditedReview
        ? 'The audited report is ready for your final approval.'
        : 'The provider has submitted the report. Please review and take action.';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> {title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Reports for Your Approval:</h4>
                    {reportsToReview.length > 0 ? (
                        <div className="space-y-2 rounded-md border p-2">
                             {reportsToReview.map(inspection => (
                                <div key={inspection.id} className="flex items-center justify-between text-sm p-1 hover:bg-muted rounded">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                                        <span className="truncate">{inspection.assetName} - {inspection.technique} Report</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleViewDocuments(inspection.report ? [{ name: `Report_${inspection.report.id}.pdf`, url: '', source: 'Generated Report' }] : [])}>View</Button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No reports are ready for your review.</p>}
                </div>
                 <div className="mt-4">
                    <Label htmlFor="client-rejection-comments">Comments for Provider (if requesting revisions)</Label>
                    <Textarea id="client-rejection-comments" placeholder="e.g., 'Please provide a higher resolution image for Fig 3...'" className="mt-2 min-h-[120px]" value={rejectionComment} onChange={(e) => setRejectionComment(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => onReject(rejectionComment)}>
                    <XCircle className="mr-2"/>
                    Request Revisions
                </Button>
                 <Button className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
                    <CheckCircle className="mr-2"/>
                    {showAuditedReview ? 'Approve & Complete Job' : 'Approve Report'}
                </Button>
            </CardFooter>
        </Card>
    );
};

// ... (Rest of the file remains the same, only the two components above are updated with inspections prop and rendering logic)


const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-300 text-gray-300'}`}
                />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
    );
};

export default function JobDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') || 'client';
    const { toast } = useToast();
    const isMobile = useMobile();
    const { firestore } = useFirebase();
    const { user: authUser, isUserLoading: isAuthLoading } = useUser();
    
    const [isTechDialogOpen, setIsTechDialogOpen] = React.useState(false);
    const [isEquipDialogOpen, setIsEquipDialogOpen] = React.useState(false);
    const [isSchedulingOpen, setIsSchedulingOpen] = React.useState(false);
    const [reviewingBid, setReviewingBid] = React.useState<(Bid & { provider: NDTServiceProvider }) | null>(null);

    const [tempSelectedTechs, setTempSelectedTechs] = React.useState<string[]>([]);
    const [tempSelectedEquip, setTempSelectedEquip] = React.useState<string[]>([]);

    const [isViewerOpen, setIsViewerOpen] = React.useState(false);
    const [documentsToView, setDocumentsToView] = React.useState<ViewerDocument[]>([]);
    const [initialDocName, setInitialDocName] = React.useState<string | null>(null);
    
    const [reviewSubmitted, setReviewSubmitted] = React.useState(false);
    const [hasBeenSubmittedOnce, setHasBeenSubmittedOnce] = React.useState(false);
    const [rating, setRating] = React.useState(0);
    const [reviewComment, setReviewComment] = React.useState("");

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );

    const isReady = firestore && authUser && role;

    const jobRef = useMemoFirebase(() => (isReady && id ? doc(firestore, 'jobs', id) : null), [isReady, id]);
    const { data: jobDetails, isLoading: isLoadingJob, error: jobError } = useDoc<Job>(jobRef);

    const bidsQuery = useMemoFirebase(() => (isReady && id ? collection(firestore, 'jobs', id, 'bids') : null), [isReady, id]);
    const { data: bids, isLoading: isLoadingBids } = useCollection<Bid>(bidsQuery);
    
    const [inspections, setInspections] = React.useState<Inspection[]>([]);
    const [isLoadingInspections, setIsLoadingInspections] = React.useState(true);

    React.useEffect(() => {
        if (!firestore || !jobDetails) {
            if (!isLoadingJob) setIsLoadingInspections(false);
            return;
        };

        const fetchInspections = async () => {
            if (!jobDetails.assetIds || jobDetails.assetIds.length === 0) {
                setInspections([]);
                setIsLoadingInspections(false);
                return;
            }
            
            setIsLoadingInspections(true);
            try {
                const allInspections: Inspection[] = [];
                // Use getDocs for non-realtime fetching to avoid security rule complexity
                const inspectionPromises = jobDetails.assetIds.map(assetId => {
                    const inspectionsRef = collection(firestore, `assets/${assetId}/inspections`);
                    const q = query(inspectionsRef, where('jobId', '==', jobDetails.id));
                    return getDocs(q);
                });

                const querySnapshots = await Promise.all(inspectionPromises);

                for (const querySnapshot of querySnapshots) {
                    querySnapshot.forEach(doc => {
                        allInspections.push({ id: doc.id, ...doc.data() } as Inspection);
                    });
                }
                setInspections(allInspections);
            } catch (err) {
                console.error("Error fetching inspections:", err);
            } finally {
                setIsLoadingInspections(false);
            }
        };

        fetchInspections();
    }, [firestore, jobDetails, isLoadingJob]);

    
    React.useEffect(() => {
        if (!jobDetails) return;

        const checkForReview = async () => {
            if (!firestore || !jobDetails.providerId || !authUser) return;
            const reviewsRef = collection(firestore, 'reviews');
            const q = query(reviewsRef, where('jobId', '==', id), where('clientId', '==', authUser.uid), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const existingReview = querySnapshot.docs[0].data() as Review;
                setRating(existingReview.rating);
                setReviewComment(existingReview.comment);
                setReviewSubmitted(true);
                setHasBeenSubmittedOnce(true);
            } else {
                setRating(0);
                setReviewComment("");
                setReviewSubmitted(false);
                setHasBeenSubmittedOnce(false);
            }
        };

        checkForReview();
    }, [id, firestore, jobDetails, authUser]);
    
    const assignedEquipmentQuery = useMemoFirebase(() => {
        if (role !== 'inspector' || !firestore || !jobDetails?.equipmentIds || jobDetails.equipmentIds.length === 0) {
            return null;
        }
        return query(collection(firestore, 'equipment'), where(documentId(), 'in', jobDetails.equipmentIds.slice(0, 10)));
    }, [firestore, jobDetails, role]);
    
    const { data: assignedEquipment, isLoading: isLoadingEquipment } = useCollection<any>(assignedEquipmentQuery);

    const providerTeamQuery = useMemoFirebase(() => {
        if (role !== 'inspector' || !firestore || !jobDetails?.providerId) return null;
        return query(collection(firestore, 'users'), where('companyId', '==', jobDetails.providerId));
    }, [firestore, role, jobDetails]);
    const { data: providerTeamMembers, isLoading: isLoadingProviderTeam } = useCollection<PlatformUser>(providerTeamQuery);
    
    const { data: allCompanies, isLoading: isLoadingCompanies } = useCollection<any>(useMemoFirebase(() => isReady ? collection(firestore, 'companies') : null, [isReady, firestore]));
    const { data: allNdtTechniques, isLoading: isLoadingAllTechniques } = useCollection<NDTTechnique>(useMemoFirebase(() => isReady ? collection(firestore, 'techniques') : null, [isReady, firestore]));
    
    const { data: clientCompany, isLoading: isLoadingClientCompany } = useDoc<Client>(
        useMemoFirebase(() => (firestore && jobDetails?.clientCompanyId ? doc(firestore, 'companies', jobDetails.clientCompanyId) : null), [firestore, jobDetails])
    );

    const provider = React.useMemo(() => allCompanies?.find(p => p.id === jobDetails?.providerId), [allCompanies, jobDetails]);

    const duration = React.useMemo(() => {
        if (!jobDetails?.scheduledStartDate) {
            return jobDetails?.durationDays;
        }
        
        const safeParse = (dateInput: any): Date | null => {
            if (!dateInput) return null;
            if (typeof dateInput.toDate === 'function') {
                return dateInput.toDate();
            }
            const d = new Date(dateInput);
            return isValid(d) ? d : null;
        };

        const startDate = safeParse(jobDetails.scheduledStartDate);
        const endDate = safeParse(jobDetails.scheduledEndDate) || startDate;

        if (startDate && endDate) {
            return differenceInDays(endDate, startDate) + 1;
        }

        return jobDetails?.durationDays;
    }, [jobDetails]);

    const isLoading = isAuthLoading || isLoadingProfile || isLoadingJob || isLoadingBids || isLoadingCompanies || isLoadingEquipment || isLoadingInspections || isLoadingClientCompany || isLoadingAllTechniques || isLoadingProviderTeam || !id;
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-80 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (jobError) {
        return (
            <div className="text-center p-10">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Job</AlertTitle>
                    <AlertDescription>
                        There was an error fetching the job details. This could be due to a network issue or insufficient permissions.
                        <p className="mt-2 text-xs">{jobError.message}</p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (!jobDetails) {
        return (
             <div className="text-center p-10">
                <Alert>
                    <Briefcase className="h-4 w-4" />
                    <AlertTitle>Job Not Found</AlertTitle>
                    <AlertDescription>
                        The job you are looking for does not exist or you may not have permission to view it.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }
    
    const openTechDialog = () => {
        setTempSelectedTechs([...(jobDetails.technicianIds || [])]);
        setIsTechDialogOpen(true);
    };

    const openEquipDialog = () => {
        setTempSelectedEquip([...(jobDetails.equipmentIds || [])]);
        setIsEquipDialogOpen(true);
    };

    const handleAssignTechs = async () => {
        if (!firestore || !jobDetails || !providerTeamMembers) return;
        
        const techniciansToAssign = providerTeamMembers.filter(u => tempSelectedTechs.includes(u.id));
        const assignedTechniciansData = techniciansToAssign.map(t => ({
            id: t.id,
            name: t.name,
            level: t.level || 'N/A'
        }));

        await updateDoc(doc(firestore, 'jobs', jobDetails.id), { 
            technicianIds: tempSelectedTechs,
            assignedTechnicians: assignedTechniciansData
        });

        toast({ title: 'Technicians updated.' });
        setIsTechDialogOpen(false);
    };
    
    const handleAssignEquip = async () => {
        if (!firestore || !jobDetails) return;
        await updateDoc(doc(firestore, 'jobs', jobDetails.id), { equipmentIds: tempSelectedEquip });
        toast({ title: 'Equipment updated.' });
        setIsEquipDialogOpen(false);
    };

    const handleStatusChange = async (newStatus: Job['status']) => {
        if (!firestore || !jobDetails) return;
        await updateDoc(doc(firestore, 'jobs', jobDetails.id), { status: newStatus });
        toast({ title: `Status changed to ${newStatus}.` });
    };

    const handleAwardBid = async (awardedBidId: string, providerId: string) => {
        if (!jobDetails || !bids || !firestore) return;
    
        try {
            const batch = writeBatch(firestore);
    
            // Update bid statuses
            bids.forEach(bid => {
                const bidRef = doc(firestore, 'jobs', jobDetails.id, 'bids', bid.id);
                if (bid.id === awardedBidId) {
                    batch.update(bidRef, { status: 'Awarded' });
                } else {
                    batch.update(bidRef, { status: 'Not Selected' });
                }
            });
    
            // Update job status and provider
            const jobRef = doc(firestore, 'jobs', jobDetails.id);
            batch.update(jobRef, {
                status: 'Assigned',
                providerId: providerId,
            });
    
            // Add to history
            const newHistoryEntry = {
                user: currentUserProfile?.name || 'System',
                timestamp: serverTimestamp(),
                action: `Awarded job to provider`,
                details: `Provider ID: ${providerId}`,
                statusChange: 'Assigned' as Job['status']
            };
            batch.update(jobRef, { history: arrayUnion(newHistoryEntry) });
    
            await batch.commit();
            
            toast({
                title: "Job Awarded!",
                description: `The job has been successfully awarded. The provider will be notified.`,
            });
            setReviewingBid(null);
        } catch (error) {
            console.error("Error awarding job:", error);
            toast({
                variant: "destructive",
                title: "Awarding Failed",
                description: "There was an error awarding the job. Please check your permissions and try again.",
            });
        }
    };

    const handleReviewBid = (bid: Bid) => {
        const provider = allCompanies?.find(p => p.id === bid.providerId);
        if (provider) {
            setReviewingBid({ ...bid, provider: provider as NDTServiceProvider });
        }
    };
    
    const handleScheduleSubmit = async (values: z.infer<typeof scheduleSchema>) => {
        if (jobDetails && firestore) {
            await updateDoc(doc(firestore, 'jobs', jobDetails.id), { 
                status: 'Scheduled',
                scheduledStartDate: format(values.scheduledStartDate, 'yyyy-MM-dd'),
                scheduledEndDate: values.scheduledEndDate ? format(values.scheduledEndDate, 'yyyy-MM-dd') : format(values.scheduledStartDate, 'yyyy-MM-dd'),
            });
            toast({
                title: 'Job Scheduled',
                description: 'The job has been scheduled and the client has been notified.',
            });
            setIsSchedulingOpen(false);
        }
    };
    
    const handleViewDocuments = (docs: JobDocument[] | undefined, initialDoc?: string) => {
        if (!docs || docs.length === 0) return;
        setDocumentsToView(docs.map(d => ({ ...d, source: 'Job Document' })));
        setInitialDocName(initialDoc || docs[0]?.name || null);
        setIsViewerOpen(true);
    };

    const handleAuditorApprove = () => {
        handleStatusChange('Audit Approved');
        toast({
            title: "Report Approved by Auditor",
            description: `The inspection report has been approved. The client will now perform the final review.`,
        });
    }

    const handleAuditorReject = (comments: string) => {
        if (!comments.trim()) {
            toast({ variant: 'destructive', title: 'Comments Required', description: 'Please provide comments to the provider when requesting revisions.' });
            return;
        }
        handleStatusChange('Revisions Requested');
        // In a real app, also save the comments to the job history
        toast({ variant: "destructive", title: "Revisions Requested by Auditor", description: "The report has been sent back to the provider for revisions." });
    }

    const handleClientApprove = () => {
        handleStatusChange('Client Approved');
        toast({
            title: "Job Approved!",
            description: `You have approved the report. The job is now ready for completion.`,
        });
    }

    const handleClientReject = (comments: string) => {
        if (!comments.trim()) {
            toast({ variant: 'destructive', title: 'Comments Required', description: 'Please provide comments to the provider when requesting revisions.' });
            return;
        }
        handleStatusChange('Revisions Requested');
        toast({
            variant: "destructive",
            title: "Revisions Requested by Client",
            description: `The report has been sent back to the provider for revisions.`,
        });
    }

    const handleReviewSubmit = async () => {
        if (rating === 0) {
            toast({
                variant: "destructive",
                title: "Rating required",
                description: "Please select a star rating before submitting.",
            });
            return;
        }
    
        if (!firestore || !authUser || !jobDetails?.providerId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit review. Please try again.' });
            return;
        }
    
        const reviewData = {
            jobId: jobDetails.id,
            providerId: jobDetails.providerId,
            clientId: authUser.uid,
            rating: rating,
            comment: reviewComment,
            date: serverTimestamp(),
            status: 'Pending',
        };
    
        await addDoc(collection(firestore, 'reviews'), reviewData);
        
        toast({
            title: "Review Submitted!",
            description: "Thank you for your feedback. Your review is pending approval.",
        });
    
        setReviewSubmitted(true);
        if (!hasBeenSubmittedOnce) {
            setHasBeenSubmittedOnce(true);
        }
    };

    const handleSendMessage = (message: string) => {
        // This is a simulation for now
        toast({title: 'Message sent (simulation)'});
    };

    const BidsSection = () => {
        if (!jobDetails || (role !== 'client' && role !== 'admin') || !bids) return null;
    
        if (bids.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" />Bids Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">No bids have been received for this job yet.</p>
                    </CardContent>
                </Card>
            )
        }
    
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" />Bids Received ({bids.length})</CardTitle>
                    {jobDetails.status === 'Posted' && <CardDescription>Review the bids below and award the job to a provider.</CardDescription>}
                    {jobDetails.status !== 'Posted' && <CardDescription>A historical record of all bids submitted for this job.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {bids.map(bid => {
                        const provider = allCompanies?.find(p => p.id === bid.providerId);
                        if (!provider) return null;
                        const isAwarded = bid.status === 'Awarded';
                        return (
                            <div key={bid.id} className={cn(
                                "flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4",
                                isAwarded && "bg-green-500/10 border-green-500"
                            )}>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        {(provider as any).logoUrl && <AvatarImage src={(provider as any).logoUrl} alt={`${provider.name} logo`} />}
                                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{provider.name}</p>
                                        <p className="text-sm text-muted-foreground">{provider.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                    <div className="text-left sm:text-right flex-grow">
                                        <p className="font-bold text-lg">${bid.amount.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">Submitted on {format(new Date(bid.submittedDate), GLOBAL_DATE_FORMAT)}</p>
                                    </div>
                                    {isAwarded ? (
                                        <Badge variant="success" className="gap-2">
                                            <Award className="h-4 w-4" />
                                            Awarded
                                        </Badge>
                                    ) : jobDetails.status === 'Posted' ? (
                                        <Button onClick={() => handleReviewBid(bid)}>Review Bid</Button>
                                    ) : (
                                         <Badge variant="outline">{bid.status}</Badge>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        )
    }

    const isInspector = role === 'inspector';
    const isAuditor = role === 'auditor';
    const isClient = role === 'client';
    const isAdmin = role === 'admin';

    const isReviewable = isClient && (jobDetails.status === 'Completed' || jobDetails.status === 'Paid');
    const reportSubmitted = ['Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid', 'Revisions Requested'].includes(jobDetails.status);
    const resourceAssignmentLocked = isInspector && ['In Progress', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'].includes(jobDetails.status);
    
    const backLink = isAdmin ? "/dashboard/all-jobs" : isAuditor ? "/dashboard/reports" : "/dashboard/my-jobs";
    const backText = isAdmin ? "All Jobs" : isAuditor ? "Reports" : "My Jobs";

    const lastRejection = jobDetails.history?.find(h => h.statusChange === 'Revisions Requested');

    const isBiddingView = jobDetails.status === 'Posted' && role === 'inspector';
    
    const JobBiddingView = ({ allNdtTechniques }: { allNdtTechniques: NDTTechnique[] | null }) => {
        const { auth, firestore } = useFirebase();
        
        const form = useForm<z.infer<typeof bidSchema>>({
            resolver: zodResolver(bidSchema),
            defaultValues: {
                certifications: [],
                mobilizationDate: jobDetails.scheduledStartDate ? new Date(jobDetails.scheduledStartDate) : new Date(),
            },
        });
        
        async function onBidSubmit(values: z.infer<typeof bidSchema>) {
            if (!jobDetails || !firestore || !authUser || !currentUserProfile) {
                toast({ variant: "destructive", title: "Error", description: "Cannot submit bid. User or job details are missing." });
                return;
            }
        
            const bidRef = doc(collection(firestore, 'jobs', jobDetails.id, 'bids'));
            
            const newBidData = {
                id: bidRef.id,
                jobId: jobDetails.id,
                inspectorId: authUser.uid,
                providerId: currentUserProfile.companyId,
                providerName: currentUserProfile.company,
                amount: values.amount,
                status: 'Submitted' as Bid['status'],
                submittedDate: new Date().toISOString(),
                comments: values.coverNote,
                mobilizationDate: format(values.mobilizationDate, 'yyyy-MM-dd'),
                certifications: values.certifications,
            };
        
            try {
                await setDoc(bidRef, newBidData);
                toast({
                    title: "Bid Submitted Successfully!",
                    description: `Your bid of $${values.amount.toLocaleString()} has been submitted for ${jobDetails.title}.`,
                });
                router.push(constructUrl('/dashboard/my-bids'));
            } catch (error) {
                console.error("Error submitting bid:", error);
                toast({
                    variant: "destructive",
                    title: "Bid Submission Failed",
                    description: "There was an error submitting your bid. Please try again.",
                });
            }
        }
        
        const certificationsForChecklist = [ "ASNT UT L-II", "TOFD", "PAUT", "RT Source", "PCN", "API 510", "API 570" ];
        const allJobTags = [...(jobDetails.techniques || []), ...(jobDetails.certificationsRequired || [])];
        
        return (
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Left Column (Job Details) */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="bg-primary text-primary-foreground p-4">
                                <Badge variant="destructive">CRITICAL WINDOW</Badge>
                            </div>
                            <div className="p-6">
                                <CardTitle className="text-2xl font-headline">{jobDetails.title}</CardTitle>
                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4 text-muted-foreground">
                                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {jobDetails.location}</div>
                                    {jobDetails.scheduledStartDate && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {format(parseISO(jobDetails.scheduledStartDate), 'dd MMM')} &ndash; {jobDetails.scheduledEndDate ? format(parseISO(jobDetails.scheduledEndDate), 'dd MMM yyyy') : ''}</div>}
                                    {duration && <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {duration} days</div>}
                                    {jobDetails.industry && <div className="flex items-center gap-2"><Factory className="h-4 w-4 text-primary" /> {jobDetails.industry}</div>}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Est. Value</p>
                                    <p className="text-xl font-bold text-primary">{jobDetails.estimatedBudget}</p>
                                </div>
                                <div className="border-l pl-4">
                                    <p className="text-sm text-muted-foreground">Bidding</p>
                                    <p className="font-semibold">{bids?.length || 0} bids · Closes {jobDetails.bidExpiryDate ? format(parseISO(jobDetails.bidExpiryDate), 'dd MMM') : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {allJobTags.map((tag, i) => <Badge key={`${tag}-${i}`} variant="secondary">{tag}</Badge>)}
                            </div>

                            <p className="text-muted-foreground whitespace-pre-wrap">{jobDetails.description}</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                   {jobDetails.certificationsRequired?.map((req, index) => <li key={`${req.trim()}-${index}`}>{req.trim()}</li>)}
                                   {/* Add more static requirements if needed from description */}
                                   <li>Minimum 5 years refinery inspection experience</li>
                                   <li>Valid OISD / PESO certifications</li>
                                   <li>Team of minimum 6 inspectors on-site</li>
                                   <li>RT source licence required</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column (Bid Form) */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Submit Your Bid</CardTitle></CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onBidSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="amount" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Price ($)</FormLabel>
                                            <FormControl><Input type="number" placeholder="e.g. 82,00,000" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="mobilizationDate" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Mobilization Date</FormLabel>
                                            <FormControl><CustomDateInput {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="teamSize" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Team Size</FormLabel>
                                            <FormControl><Input type="number" placeholder="e.g. 8 inspectors" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="certifications" render={() => (
                                        <FormItem>
                                            <FormLabel>Certifications (select all held)</FormLabel>
                                            <ScrollArea className="h-32 w-full rounded-md border p-4">
                                                {certificationsForChecklist.map((cert) => (
                                                    <FormField key={cert} control={form.control} name="certifications" render={({ field }) => (
                                                        <FormItem key={cert} className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                                                            <FormControl>
                                                                <Checkbox checked={field.value?.includes(cert)} onCheckedChange={(checked) => ( checked ? field.onChange([...(field.value || []), cert]) : field.onChange( field.value?.filter((value) => value !== cert) ) )}/>
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-sm">{cert}</FormLabel>
                                                        </FormItem>
                                                    )} />
                                                ))}
                                            </ScrollArea>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="coverNote" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cover Note <span className="text-xs text-muted-foreground">(max 200 words)</span></FormLabel>
                                            <FormControl><Textarea placeholder="Describe your team's specific experience..." className="min-h-[120px]" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit" className="w-full">Submit Bid &rarr;</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
       <TooltipProvider>
        {isBiddingView ? <JobBiddingView allNdtTechniques={allNdtTechniques} /> : (
            <div>
                <Button asChild variant="outline" size="sm" className="mb-4">
                     <Link href={constructUrl(backLink)}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to {backText}
                    </Link>
                </Button>

                {jobDetails.status === 'Revisions Requested' && lastRejection && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Revisions Requested</AlertTitle>
                        <AlertDescription>
                            The report was sent back for revisions. Comments from {lastRejection.user}:
                            <blockquote className="mt-2 pl-4 border-l-2 border-destructive/50 italic">
                                "{lastRejection.details}"
                            </blockquote>
                        </AlertDescription>
                    </Alert>
                )}
                
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="work-scope">Work Scope</TabsTrigger>
                        <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                         <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-2xl font-headline flex items-center gap-3">
                                                    <Briefcase className="h-6 w-6 text-primary" />
                                                    {jobDetails.title}
                                                    {jobDetails.isInternal && <Badge variant="outline" className="ml-2">Internal Job</Badge>}
                                                </CardTitle>
                                                <CardDescription>ID: <span className="font-bold text-foreground">{jobDetails.id}</span> &bull; for {jobDetails.client}</CardDescription>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {(jobDetails.techniques || []).filter(Boolean).map((tech: string, i: number) => {
                                                    const techData = allNdtTechniques?.find(t => t.acronym.toUpperCase() === tech.toUpperCase());
                                                    return (
                                                        <Tooltip key={i}>
                                                            <TooltipTrigger>
                                                                <Badge>{tech}</Badge>
                                                            </TooltipTrigger>
                                                            {techData && (
                                                                <TooltipContent className="max-w-xs">
                                                                    <p className="font-bold">{techData.title}</p>
                                                                    <p>{techData.description}</p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 text-sm text-muted-foreground border-t pt-4">
                                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> <span>{jobDetails.location}</span></div>
                                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> <span>Posted: {format(new Date(jobDetails.postedDate), GLOBAL_DATE_FORMAT)}</span></div>
                                            <div className="flex items-center gap-2"><Workflow className="w-4 h-4 text-primary" /> <span>Workflow: {jobDetails.workflow}</span></div>
                                            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> <span>Job Type: {jobDetails.jobType}</span></div>
                                            <div className="flex items-center gap-2"><Factory className="w-4 h-4 text-primary" /> <span>Industry: {jobDetails.industry}</span></div>
                                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> <span>Duration: {duration} days</span></div>
                                            <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> <span>Budget: {jobDetails.estimatedBudget}</span></div>
                                            <div className="flex items-center gap-2 md:col-span-2"><UserCheck className="w-4 h-4 text-primary" /> <span>Certs: {Array.isArray(jobDetails.certificationsRequired) ? jobDetails.certificationsRequired.join(', ') : jobDetails.certificationsRequired || 'N/A'}</span></div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h3 className="font-semibold text-lg">Job Description</h3>
                                            <p className="mt-2 text-muted-foreground">
                                                {jobDetails.description || "No description provided."}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {(isClient || isAdmin) && <BidsSection />}
                                
                                {isInspector && (
                                    <InspectorActions 
                                        status={jobDetails.status} 
                                        onScheduleClick={() => setIsSchedulingOpen(true)}
                                    />
                                )}
                                <ClientReviewActions
                                    status={jobDetails.status}
                                    workflow={jobDetails.workflow}
                                    isClient={isClient}
                                    onApprove={handleClientApprove}
                                    onReject={handleClientReject}
                                    inspections={inspections || []}
                                    handleViewDocuments={handleViewDocuments}
                                />
                                <AuditorActions 
                                    status={jobDetails.status} 
                                    workflow={jobDetails.workflow}
                                    isAuditor={isAuditor}
                                    reportSubmitted={reportSubmitted}
                                    onApprove={handleAuditorApprove}
                                    onReject={handleAuditorReject}
                                    inspections={inspections || []}
                                    handleViewDocuments={handleViewDocuments}
                                />
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Assigned Resources</CardTitle>
                                        <CardDescription>Manage technicians and equipment for this job. Assignments are locked once the inspection is in progress.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Technicians</h4>
                                                {isInspector && (
                                                    <Button variant="outline" size="sm" onClick={openTechDialog} disabled={resourceAssignmentLocked}>
                                                        Manage
                                                    </Button>
                                                )}
                                            </div>
                                            {jobDetails.assignedTechnicians && jobDetails.assignedTechnicians.length > 0 ? (
                                                <ul className="space-y-2 pl-2">
                                                    {jobDetails.assignedTechnicians.map((tech, i) => (
                                                        <li key={`${tech.id}-${i}`} className="text-sm text-muted-foreground">{tech.name}</li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-sm text-muted-foreground pl-2">{jobDetails.technicianIds?.length || 0} technician(s) assigned.</p>}
                                        </div>
                                        <Separator />
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> Equipment</h4>
                                                {isInspector && (
                                                    <Button variant="outline" size="sm" onClick={openEquipDialog} disabled={resourceAssignmentLocked}>
                                                        Manage
                                                    </Button>
                                                )}
                                            </div>
                                            {assignedEquipment && assignedEquipment.length > 0 ? (
                                                <ul className="space-y-2 pl-2">
                                                    {assignedEquipment.map((equip, i) => (
                                                        <li key={`${equip.id}-${i}`} className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <span>{equip.name} <span className="font-bold text-xs">({equip.id})</span></span>
                                                            <div className="flex flex-wrap gap-1">
                                                                {equip.techniques.map((t: string) => <Badge key={t} variant="outline">{t}</Badge>)}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-sm text-muted-foreground pl-2">No equipment assigned.</p>}
                                        </div>
                                        <Separator />
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 mb-2"><ShieldCheck className="h-5 w-5 text-primary" /> Auditor</h4>
                                            {(jobDetails.workflow === 'level3' || jobDetails.workflow === 'auto') ? (
                                                <p className="text-sm text-muted-foreground pl-2">Alex Chen (NDT Auditors LLC)</p>
                                            ) : <p className="text-sm text-muted-foreground pl-2">No auditor required for standard workflow.</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="work-scope">
                        <Card>
                            <CardContent className="space-y-6 pt-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-base font-semibold">Job-Level Documents</h3>
                                        {(jobDetails.documents && jobDetails.documents.length > 0) && (
                                                <Button variant="outline" size="sm" onClick={() => handleViewDocuments(jobDetails.documents)}>
                                                <Maximize className="mr-2 h-4 w-4" />
                                                View All
                                            </Button>
                                        )}
                                    </div>
                                    {(jobDetails.documents && jobDetails.documents.length > 0) ? (
                                        <div className="space-y-2 rounded-md border p-2">
                                            {jobDetails.documents.map((doc, i) => (
                                                <button 
                                                    key={`${doc.name}-${i}`} 
                                                    className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md text-left"
                                                    onClick={() => handleViewDocuments(jobDetails.documents, doc.name)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        <span className="font-medium text-sm">{doc.name}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-muted-foreground text-center py-4">No job-level documents were provided.</p>}
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="text-base font-semibold mb-4">Work Breakdown</h3>
                                    <WorkBreakdownAccordion
                                        inspections={inspections || []}
                                        job={jobDetails}
                                        constructUrl={constructUrl}
                                        role={role}
                                        handleViewDocuments={handleViewDocuments}
                                        allNdtTechniques={allNdtTechniques}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="lifecycle">
                         <JobLifecycle status={jobDetails.status} workflow={jobDetails.workflow} />
                    </TabsContent>
                    <TabsContent value="chat">
                        <JobChatWindow job={jobDetails} onSendMessage={handleSendMessage} />
                    </TabsContent>
                </Tabs>
                 <Dialog open={!!reviewingBid} onOpenChange={(open) => !open && setReviewingBid(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Review Bid from {reviewingBid?.provider.name}</DialogTitle>
                            <DialogDescription>
                                Review the details of this bid before awarding the job. This action is final.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Bid Amount</p>
                                <p className="text-4xl font-bold">${reviewingBid?.amount.toLocaleString()}</p>
                            </div>
                            {reviewingBid?.comments && (
                                <div>
                                    <p className="font-semibold text-sm">Provider's Comments:</p>
                                    <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
                                        "{reviewingBid.comments}"
                                    </blockquote>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setReviewingBid(null)}>Cancel</Button>
                            <Button onClick={() => handleAwardBid(reviewingBid!.id, reviewingBid!.providerId)}>
                                <Award className="mr-2 h-4 w-4" /> Award Job to {reviewingBid?.provider.name}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                 <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule Job</DialogTitle>
                            <DialogDescription>
                                Set the start and end dates for the inspection work.
                            </DialogDescription>
                        </DialogHeader>
                        <ScheduleJobForm
                            onSubmit={handleScheduleSubmit}
                            onCancel={() => setIsSchedulingOpen(false)}
                            defaultValues={{
                                scheduledStartDate: jobDetails.scheduledStartDate ? new Date(jobDetails.scheduledStartDate) : new Date(),
                                scheduledEndDate: jobDetails.scheduledEndDate ? new Date(jobDetails.scheduledEndDate) : undefined,
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        )}
        </TooltipProvider>
    );
}

    
