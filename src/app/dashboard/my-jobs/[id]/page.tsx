'use client';
import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { notFound, useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Bid, Job, PlatformUser, JobMessage, JobUpdate, Inspection, InspectionReport, Review, NDTServiceProvider, JobDocument } from '@/lib/types';
import { allUsers, inspectorAssets, clientData, serviceProviders } from '@/lib/seed-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Briefcase, MapPin, Calendar, Users, Wrench, ChevronLeft, PlusCircle, Upload, FileText, CheckCircle, History, XCircle, Maximize, FileUp, Award, ShieldCheck, MessageSquare, Star, Gavel, AlertTriangle, Clock, Factory, DollarSign, Workflow, UserCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, ACCEPTED_FILE_TYPES } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import UniformDocumentViewer, { ViewerDocument } from '@/app/dashboard/components/uniform-document-viewer';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobActivityLog from '@/app/dashboard/my-jobs/components/job-history';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ndtTechniques as allNdtTechniques } from '@/lib/ndt-techniques-data';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import JobChatWindow from '@/app/dashboard/my-jobs/components/job-chat-window';
import { useMobile } from '@/hooks/use-mobile';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, serverTimestamp, query, where, limit, getDocs, doc } from 'firebase/firestore';


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
    'Draft': 'outline',
    'Posted': 'secondary',
    'Assigned': 'default',
    'Scheduled': 'default',
    'In Progress': 'default',
    'Report Submitted': 'secondary',
    'Under Audit': 'secondary',
    'Audit Approved': 'success',
    'Client Review': 'secondary',
    'Client Approved': 'success',
    'Completed': 'success',
    'Paid': 'success',
    'Revisions Requested': 'destructive',
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


const JobLifecycle = ({ status, workflow, onStatusChange }: { status: Job['status'], workflow: Job['workflow'], onStatusChange: (status: Job['status']) => void }) => {
    const allStatuses: Job['status'][] = [
        'Posted',
        'Assigned',
        'Scheduled',
        'In Progress',
        'Report Submitted',
        ...(workflow === 'level3' || workflow === 'auto' ? ['Under Audit', 'Audit Approved'] as const : []),
        'Client Review',
        'Client Approved',
        'Completed',
        'Paid'
    ];
    // If current status is not in the linear flow (like 'Revisions Requested'), find index of what it logically follows
    const currentStatusIndex = allStatuses.includes(status) ? allStatuses.indexOf(status) : allStatuses.indexOf('Report Submitted');

    return (
        <Card>
            <CardContent className="pt-6">
                 <ul className="relative">
                    {/* Dotted Line */}
                    <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border -translate-x-1/2 border-l-2 border-dashed border-muted-foreground/30 -z-10" />

                    {allStatuses.map((step, index) => {
                        const isCompleted = index < currentStatusIndex;
                        const isActive = index === currentStatusIndex;

                        return (
                           <li key={step} className="flex items-center gap-4 mb-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 z-10",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                                    isActive ? "bg-accent/20 border-accent text-accent" : 
                                    "bg-muted border-muted-foreground/20 text-muted-foreground",
                                )}>
                                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <span className="text-base font-bold">{index + 1}</span>}
                                </div>
                                <div>
                                    <p className={cn(
                                        "font-medium",
                                        isActive ? "text-foreground" : "text-muted-foreground",
                                    )}>{step}</p>
                                    {(step === 'Under Audit' || step === 'Audit Approved') && (
                                        <p className="text-xs text-muted-foreground">(Level III Workflow)</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
             <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                <div className="font-semibold text-sm">Lifecycle Test Control</div>
                <div className="flex items-center gap-4">
                    <Label htmlFor="status-select">Override Status:</Label>
                    <Select onValueChange={(val) => onStatusChange(val as Job['status'])} value={status}>
                        <SelectTrigger id="status-select" className="w-[200px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {[...allStatuses, 'Revisions Requested'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </CardFooter>
        </Card>
    );
};


const AuditorActions = ({ status, workflow, isAuditor, reportSubmitted, onApprove, onReject }: { 
    status: Job['status'], 
    workflow: Job['workflow'], 
    isAuditor: boolean, 
    reportSubmitted: boolean,
    onApprove: () => void, 
    onReject: (comments: string) => void 
}) => {
    const [rejectionComment, setRejectionComment] = useState('');
    // 1. Standard workflow - always disabled and just provides info
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
    
    // 2. Level 3/Auto workflow
    const isPostAudit = ['Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'].includes(status);

    // 2a. Audit is completed and approved
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

    // 2b. Audit is pending or active
    // If report is not submitted yet
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

    // If report submitted and user IS the auditor
    if (isAuditor) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Auditor Actions</CardTitle>
                    <CardDescription>Review the report and provide your decision.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

    // If report submitted and user is NOT the auditor (client or inspector)
    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Auditor Review Pending</CardTitle>
                <CardDescription>The inspection report has been submitted and is currently under review by the Level III Auditor.</CardDescription>
            </CardHeader>
        </Card>
    );
};

const ClientReviewActions = ({ status, workflow, isClient, onApprove, onReject }: { 
    status: Job['status'], 
    workflow: Job['workflow'],
    isClient: boolean, 
    onApprove: () => void, 
    onReject: (comments: string) => void 
}) => {
    const [rejectionComment, setRejectionComment] = useState('');
    const showStandardReview = isClient && status === 'Report Submitted' && workflow === 'standard';
    const showAuditedReview = isClient && status === 'Audit Approved';

    if (!showStandardReview && !showAuditedReview) {
        return null;
    }

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
            <CardContent>
                <p className="text-sm text-muted-foreground">Review the submitted report and documents. Approve the report to proceed, or request revisions from the provider.</p>
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
    const { firestore, user } = useFirebase();
    
    const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);
    const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false);
    const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
    const [reviewingBid, setReviewingBid] = useState<(Bid & { provider: NDTServiceProvider }) | null>(null);

    const [tempSelectedTechs, setTempSelectedTechs] = useState<string[]>([]);
    const [tempSelectedEquip, setTempSelectedEquip] = useState<string[]>([]);

    const [isViewerOpen, setIsViewerOpen] = React.useState(false);
    const [documentsToView, setDocumentsToView] = React.useState<ViewerDocument[]>([]);
    const [initialDocName, setInitialDocName] = React.useState<string | null>(null);
    
    const [reviewSubmitted, setReviewSubmitted] = React.useState(false);
    const [hasBeenSubmittedOnce, setHasBeenSubmittedOnce] = React.useState(false);
    const [rating, setRating] = React.useState(0);
    const [reviewComment, setReviewComment] = React.useState("");

    const jobRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'jobs', id) : null), [firestore, id]);
    const { data: jobDetails, isLoading: isLoadingJob, error: jobError } = useDoc<Job>(jobRef);
    
    // Re-initialize state if id changes
    useEffect(() => {
        if (!jobDetails) return;

        const checkForReview = async () => {
            if (!firestore || !jobDetails.providerId) return;
            const reviewsRef = collection(firestore, 'reviews');
            // Assuming client-01 for demo consistency
            const q = query(reviewsRef, where('jobId', '==', id), where('clientId', '==', 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2'), limit(1));
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
    }, [id, firestore, jobDetails]);
    
    const duration = jobDetails?.scheduledStartDate && jobDetails?.scheduledEndDate ? differenceInDays(parseISO(jobDetails.scheduledEndDate), parseISO(jobDetails.scheduledStartDate)) + 1 : jobDetails?.durationDays;

    if (isLoadingJob) {
        return <div className="text-center p-10">Loading job details...</div>;
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

    const assignedTechnicians = allUsers.filter(u => u.role === 'Inspector' && jobDetails.technicianIds?.includes(u.id));
    const assignedEquipment = inspectorAssets.filter(e => jobDetails.equipmentIds?.includes(e.id));
    
    const openTechDialog = () => {
        setTempSelectedTechs([...(jobDetails.technicianIds || [])]);
        setIsTechDialogOpen(true);
    };

    const openEquipDialog = () => {
        setTempSelectedEquip([...(jobDetails.equipmentIds || [])]);
        setIsEquipDialogOpen(true);
    };

    const handleAssignTechs = () => {
        // In a real app, this would be a database update.
        // For now, we simulate by just closing.
        // setJobDetails(prev => prev ? { ...prev, technicianIds: tempSelectedTechs } : undefined);
        toast({ title: 'Technicians updated (simulation).' });
        setIsTechDialogOpen(false);
    };
    
    const handleAssignEquip = () => {
        // setJobDetails(prev => prev ? { ...prev, equipmentIds: tempSelectedEquip } : undefined);
        toast({ title: 'Equipment updated (simulation).' });
        setIsEquipDialogOpen(false);
    };

    const handleStatusChange = (newStatus: Job['status']) => {
        // setJobDetails({ ...jobDetails, status: newStatus });
        toast({ title: `Status changed to ${newStatus} (simulation).` });
    };

    const handleAwardBid = (awardedBidId: string, providerId: string) => {
        if (!jobDetails) return;
        // This would be a backend transaction
        toast({
            title: "Job Awarded! (simulation)",
            description: `Provider has been awarded the job: ${jobDetails.title}.`,
        });
    };

    const handleReviewBid = (bid: Bid) => {
        const provider = serviceProviders.find(p => p.id === bid.providerId);
        if (provider) {
            setReviewingBid({ ...bid, provider });
        }
    };
    
    const handleScheduleSubmit = (values: z.infer<typeof scheduleSchema>) => {
        if (jobDetails) {
            // setJobDetails({ 
            //     ...jobDetails, 
            //     status: 'Scheduled',
            //     scheduledStartDate: format(values.scheduledStartDate, 'yyyy-MM-dd'),
            //     scheduledEndDate: values.scheduledEndDate ? format(values.scheduledEndDate, 'yyyy-MM-dd') : format(values.scheduledStartDate, 'yyyy-MM-dd'),
            // });
            toast({
                title: 'Job Scheduled (simulation)',
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
        toast({
            title: "Report Approved by Auditor (simulation)",
            description: `The inspection report has been approved. The client will now perform the final review.`,
        });
        handleStatusChange('Audit Approved');
    }

    const handleAuditorReject = (comments: string) => {
        if (!comments.trim()) {
            toast({ variant: 'destructive', title: 'Comments Required', description: 'Please provide comments to the provider when requesting revisions.' });
            return;
        }
        // ... create history entry ...
        toast({ variant: "destructive", title: "Revisions Requested by Auditor (simulation)", description: "The report has been sent back to the provider for revisions." });
    }

    const handleClientApprove = () => {
        toast({
            title: "Job Approved! (simulation)",
            description: `You have approved the report. The job is now ready for completion.`,
        });
        handleStatusChange('Client Approved');
    }

    const handleClientReject = (comments: string) => {
        if (!comments.trim()) {
            toast({ variant: 'destructive', title: 'Comments Required', description: 'Please provide comments to the provider when requesting revisions.' });
            return;
        }
        // ... create history entry ...
        toast({
            variant: "destructive",
            title: "Revisions Requested by Client (simulation)",
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
    
        if (!firestore || !user || !jobDetails?.providerId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit review. Please try again.' });
            return;
        }
    
        const reviewData = {
            jobId: jobDetails.id,
            providerId: jobDetails.providerId,
            clientId: 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2', // Using placeholder for demo consistency
            rating: rating,
            comment: reviewComment,
            date: serverTimestamp(),
            status: 'Pending',
        };
    
        await addDocumentNonBlocking(collection(firestore, 'reviews'), reviewData);
        
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
        if (!jobDetails) return;

        const currentUserDetails = {
            client: allUsers.find(u => u.id === 'nxHzdOkwW6RLPWEgVvVbHyzN8OR2'),
            inspector: allUsers.find(u => u.id === 'NAXP822MG6cWlaCNkaqkYpxDRmQ2'), // A representative inspector
            auditor: allUsers.find(u => u.id === 'gpx1kGbkuqQz0Fhmgfhyv4t3B3f2'),
            admin: allUsers.find(u => u.id === 'JB5zgSrcKJX3dbNgPJmhlOcrUI62'),
        };

        const currentUser = currentUserDetails[role as keyof typeof currentUserDetails];

        if (!currentUser) return;

        const newMessage: JobMessage = {
            user: currentUser.name,
            role: currentUser.role.split(' ')[0] as 'Client' | 'Inspector' | 'Auditor',
            timestamp: new Date().toISOString(),
            message: message,
        };

        // setJobDetails(prev => {
        //     if (!prev) return undefined;
        //     return {
        //         ...prev,
        //         messages: [...(prev.messages || []), newMessage],
        //     };
        // });
        toast({title: 'Message sent (simulation)'});
    };

    const BidsSection = () => {
        if (!jobDetails || (role !== 'client' && role !== 'admin')) return null;
    
        const jobBids = jobDetails.bids || [];
    
        if (jobBids.length === 0) {
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
                    <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" />Bids Received ({jobBids.length})</CardTitle>
                    {jobDetails.status === 'Posted' && <CardDescription>Review the bids below and award the job to a provider.</CardDescription>}
                    {jobDetails.status !== 'Posted' && <CardDescription>A historical record of all bids submitted for this job.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {jobBids.map(bid => {
                        const provider = serviceProviders.find(p => p.id === bid.providerId);
                        if (!provider) return null;
                        const isAwarded = bid.status === 'Awarded';
                        return (
                            <div key={bid.id} className={cn(
                                "flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4",
                                isAwarded && "bg-green-500/10 border-green-500"
                            )}>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={provider.logoUrl} alt={`${provider.name} logo`} data-ai-hint={`${provider.name} logo`} />
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
    
    const backLink = isAdmin ? "/dashboard/all-jobs" : isAuditor ? "/dashboard/inspections" : "/dashboard/my-jobs";
    const backText = isAdmin ? "All Jobs" : isAuditor ? "Inspections" : "My Jobs";

    const lastRejection = jobDetails.history?.find(h => h.statusChange === 'Revisions Requested');

    const isBiddingView = jobDetails.status === 'Posted' && role === 'inspector';

    const JobBiddingView = () => {
        const form = useForm<z.infer<typeof bidSchema>>({
            resolver: zodResolver(bidSchema),
            defaultValues: {
                certifications: [],
                mobilizationDate: jobDetails.scheduledStartDate ? new Date(jobDetails.scheduledStartDate) : new Date(),
            },
        });
        
        function onBidSubmit(values: z.infer<typeof bidSchema>) {
            toast({
                title: "Bid Submitted (Simulation)",
                description: `Your bid of ${values.amount} has been submitted for ${jobDetails.title}.`,
            });
            console.log(values);
             router.push(constructUrl('/dashboard/my-bids'));
        }
        
        const certificationsForChecklist = [ "ASNT UT L-II", "TOFD", "PAUT", "RT Source", "PCN", "API 510", "API 570" ];
        const allJobTags = [...(jobDetails.techniques || []), ...(jobDetails.certificationsRequired?.split(',').map(s => s.trim()) || [])];
        
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
                                    <p className="font-semibold">{jobDetails.bids.length} bids · Closes {jobDetails.bidExpiryDate ? format(parseISO(jobDetails.bidExpiryDate), 'dd MMM') : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {allJobTags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                            </div>

                            <p className="text-muted-foreground whitespace-pre-wrap">{jobDetails.description}</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                   {jobDetails.certificationsRequired?.split(',').map(req => <li key={req}>{req.trim()}</li>)}
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
                                            <FormLabel>Your Price (₹)</FormLabel>
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
        {isBiddingView ? <JobBiddingView /> : (
            <div>
                <Button asChild variant="outline" size="sm" className="mb-4">
                     <Link href={constructUrl(backLink)}>
                        <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
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
                
                <Accordion type="single" collapsible className="w-full mb-6">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline p-4 bg-muted/50 rounded-md">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <History className="h-6 w-6 text-primary" />
                                    <span>Job Lifecycle</span>
                                    <Badge variant={jobStatusVariants[jobDetails.status]}>{jobDetails.status}</Badge>
                                </div>
                                <span className="text-sm font-normal text-muted-foreground mr-4 hidden md:inline">{statusDescriptions[jobDetails.status]}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                            <JobLifecycle status={jobDetails.status} workflow={jobDetails.workflow} onStatusChange={handleStatusChange} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
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
                                            const techData = allNdtTechniques.find(t => t.id.toUpperCase() === tech);
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
                                    <div className="flex items-center gap-2 md:col-span-2"><UserCheck className="w-4 h-4 text-primary" /> <span>Certs: {jobDetails.certificationsRequired}</span></div>
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

                        <Card>
                            <Tabs defaultValue="documents" className="w-full">
                                <CardHeader className="p-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="documents">Documents & Reports</TabsTrigger>
                                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                                </TabsList>
                                </CardHeader>
                                <TabsContent value="documents">
                                <CardContent className="space-y-6">
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
                                                        key={i} 
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
                                    <h3 className="text-base font-semibold mb-2">Inspection Reports</h3>
                                    {jobDetails.inspections && jobDetails.inspections.length > 0 ? jobDetails.inspections.map(inspection => {
                                        const report = inspection.report;
                                        return (
                                            <Card key={inspection.id} className="mb-4 bg-background">
                                                <CardHeader className="p-4 flex flex-row items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-base font-medium">Report for {inspection.assetName} ({inspection.technique})</CardTitle>
                                                        {report ? (
                                                            <CardDescription className="text-xs">Submitted by {report.submittedBy} on {format(parseISO(report.submittedOn), GLOBAL_DATE_FORMAT)}</CardDescription>
                                                        ) : (
                                                            <CardDescription className="text-xs">Report not yet submitted.</CardDescription>
                                                        )}
                                                    </div>
                                                    {report ? (
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={constructUrl(`/dashboard/reports/${report.id}`)}>View Inspection</Link>
                                                        </Button>
                                                    ) : (
                                                        isInspector && ['In Progress', 'Scheduled', 'Revisions Requested'].includes(jobDetails.status) && (
                                                            <Button asChild size="sm">
                                                                <Link href={constructUrl(`/dashboard/reports/new?jobId=${jobDetails.id}&inspectionId=${inspection.id}`)}>
                                                                    <FileUp className="mr-2 h-4 w-4" />
                                                                    Generate Report
                                                                </Link>
                                                            </Button>
                                                        )
                                                    )}
                                                </CardHeader>
                                            </Card>
                                        );
                                    }) : <p className="text-sm text-muted-foreground">No inspection reports have been submitted for this job yet.</p>}
                                    </div>
                                </CardContent>
                                </TabsContent>
                                <TabsContent value="activity">
                                <CardContent>
                                    <JobActivityLog history={jobDetails.history} />
                                </CardContent>
                                </TabsContent>
                            </Tabs>
                        </Card>
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
                                                <PlusCircle className="mr-2 h-4 w-4" /> Manage
                                            </Button>
                                        )}
                                    </div>
                                    {assignedTechnicians.length > 0 ? (
                                        <ul className="space-y-2 pl-2">
                                            {assignedTechnicians.map(tech => (
                                                <li key={tech.id} className="text-sm text-muted-foreground">{tech.name} <span className="font-bold text-xs">({tech.id})</span> - {tech.level}</li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-sm text-muted-foreground pl-2">No technicians assigned.</p>}
                                </div>
                                <Separator />
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" /> Equipment</h4>
                                        {isInspector && (
                                            <Button variant="outline" size="sm" onClick={openEquipDialog} disabled={resourceAssignmentLocked}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Manage
                                            </Button>
                                        )}
                                    </div>
                                    {assignedEquipment.length > 0 ? (
                                        <ul className="space-y-2 pl-2">
                                            {assignedEquipment.map(equip => (
                                                <li key={equip.id} className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <span>{equip.name} <span className="font-bold text-xs">({equip.id})</span></span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {equip.techniques.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
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
            </div>
        )}
        </TooltipProvider>
    );
}

    





