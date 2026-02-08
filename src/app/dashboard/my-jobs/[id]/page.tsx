
'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { notFound, useSearchParams, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jobs, allUsers, inspectorAssets, Bid, Job, reviews, PlatformUser, JobMessage, JobUpdate, Inspection, InspectionReport } from '@/lib/placeholder-data';
import { serviceProviders, NDTServiceProvider } from '@/lib/service-providers-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Briefcase, MapPin, Calendar, Users, Wrench, ChevronLeft, PlusCircle, Upload, FileText, CheckCircle, History, XCircle, Maximize, FileUp, Award, ShieldCheck, MessageSquare, Star, Gavel, AlertTriangle } from 'lucide-react';
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
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ndtTechniques as allNdtTechniques } from '@/lib/ndt-techniques-data';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomDateInput } from '@/components/ui/custom-date-input';
import JobChatWindow from '@/app/dashboard/my-jobs/components/job-chat-window';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


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
    const isMobile = useIsMobile();
    
    // State for the entire page's data to avoid hydration issues with direct mutation
    const [jobDetails, setJobDetails] = useState<Job | undefined>(() => JSON.parse(JSON.stringify(jobs.find(j => j.id === id))));
    
    const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);
    const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false);
    const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
    const [reviewingBid, setReviewingBid] = useState<(Bid & { provider: NDTServiceProvider }) | null>(null);

    const [tempSelectedTechs, setTempSelectedTechs] = useState<string[]>([]);
    const [tempSelectedEquip, setTempSelectedEquip] = useState<string[]>([]);

    const [isViewerOpen, setIsViewerOpen] = React.useState(false);
    const [documentsToView, setDocumentsToView] = React.useState<ViewerDocument[]>([]);
    const [initialDocName, setInitialDocName] = React.useState<string | null>(null);
    const [viewingReport, setViewingReport] = useState<InspectionReport | null>(null);
    
    const [reviewSubmitted, setReviewSubmitted] = React.useState(false);
    const [hasBeenSubmittedOnce, setHasBeenSubmittedOnce] = React.useState(false);
    const [rating, setRating] = React.useState(0);
    const [hoverRating, setHoverRating] = React.useState(0);
    const [reviewComment, setReviewComment] = React.useState("");

    // Re-initialize state if id changes
    useEffect(() => {
        const jobData = jobs.find(j => j.id === id);
        if (jobData) {
            setJobDetails(JSON.parse(JSON.stringify(jobData)));
            
            const existingReview = reviews.find(r => r.jobId === id && r.clientId === 'client-01'); // Assuming client-01 for demo
            if (existingReview) {
                setRating(existingReview.rating);
                setReviewComment(existingReview.comment);
                setReviewSubmitted(true);
                setHasBeenSubmittedOnce(true);
            } else {
                 // Reset review state if navigating to a job without a review
                setRating(0);
                setReviewComment("");
                setReviewSubmitted(false);
                setHasBeenSubmittedOnce(false);
            }
        }
    }, [id]);

    if (!jobDetails) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const [pathname, baseQuery] = base.split('?');
        const newParams = new URLSearchParams(searchParams.toString());

        if (baseQuery) {
            const baseParams = new URLSearchParams(baseQuery);
            baseParams.forEach((value, key) => {
                newParams.set(key, value);
            });
        }

        const queryString = newParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
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
        setJobDetails(prev => prev ? { ...prev, technicianIds: tempSelectedTechs } : undefined);
        setIsTechDialogOpen(false);
    };
    
    const handleAssignEquip = () => {
        setJobDetails(prev => prev ? { ...prev, equipmentIds: tempSelectedEquip } : undefined);
        setIsEquipDialogOpen(false);
    };

    const handleStatusChange = (newStatus: Job['status']) => {
        if (jobDetails) {
            setJobDetails({ ...jobDetails, status: newStatus });
        }
    };

    const handleAwardBid = (awardedBidId: string, providerId: string) => {
        if (!jobDetails) return;

        // Update job status and provider
        setJobDetails(prev => {
            if (!prev) return undefined;
            const updatedBids = prev.bids.map(bid => {
                if (bid.id === awardedBidId) return { ...bid, status: 'Awarded' as const };
                if (bid.status === 'Submitted') return { ...bid, status: 'Rejected' as const };
                return bid;
            });
            return {...prev, status: 'Assigned', providerId: providerId, bids: updatedBids };
        });

        const provider = serviceProviders.find(p => p.id === providerId);
        toast({
            title: "Job Awarded!",
            description: `${provider?.name} has been awarded the job: ${jobDetails.title}.`,
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
            setJobDetails({ 
                ...jobDetails, 
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
        toast({
            title: "Report Approved by Auditor",
            description: `The inspection report has been approved. The client will now perform the final review.`,
        });
        handleStatusChange('Audit Approved');
    }

    const handleAuditorReject = (comments: string) => {
        if (!comments.trim()) {
            toast({ variant: 'destructive', title: 'Comments Required', description: 'Please provide comments to the provider when requesting revisions.' });
            return;
        }
        const historyEntry: JobUpdate = {
            user: 'Alex Chen', // Placeholder for current auditor
            timestamp: new Date().toISOString(),
            action: 'Auditor requested revisions.',
            details: comments,
            statusChange: 'Revisions Requested',
        };
        setJobDetails(prev => prev ? { ...prev, status: 'Revisions Requested', history: [historyEntry, ...(prev.history || [])] } : undefined);
        toast({ variant: "destructive", title: "Revisions Requested by Auditor", description: "The report has been sent back to the provider for revisions." });
    }

    const handleClientApprove = () => {
        toast({
            title: "Job Approved!",
            description: `You have approved the report. The job is now ready for completion.`,
        });
        handleStatusChange('Client Approved');
    }

    const handleClientReject = (comments: string) => {
        if (!comments.trim()) {
            toast({ variant: 'destructive', title: 'Comments Required', description: 'Please provide comments to the provider when requesting revisions.' });
            return;
        }
        const historyEntry: JobUpdate = {
            user: 'John Doe', // Placeholder for current client
            timestamp: new Date().toISOString(),
            action: 'Client requested revisions.',
            details: comments,
            statusChange: 'Revisions Requested',
        };
        setJobDetails(prev => prev ? { ...prev, status: 'Revisions Requested', history: [historyEntry, ...(prev.history || [])] } : undefined);
        toast({
            variant: "destructive",
            title: "Revisions Requested by Client",
            description: `The report has been sent back to the provider for revisions.`,
        });
    }

    const handleReviewSubmit = () => {
        if (rating === 0) {
            toast({
                variant: "destructive",
                title: "Rating required",
                description: "Please select a star rating before submitting.",
            });
            return;
        }
        console.log({
            jobId: jobDetails.id,
            rating,
            comment: reviewComment,
        });
        toast({
            title: hasBeenSubmittedOnce ? "Review Updated!" : "Review Submitted!",
            description: "Thank you for your feedback.",
        });
        setReviewSubmitted(true);
        if (!hasBeenSubmittedOnce) {
            setHasBeenSubmittedOnce(true);
        }
    };

    const handleSendMessage = (message: string) => {
        if (!jobDetails) return;

        const currentUserDetails = {
            client: allUsers.find(u => u.id === 'user-client-01'),
            inspector: allUsers.find(u => u.id === 'user-tech-05'), // A representative inspector
            auditor: allUsers.find(u => u.id === 'user-auditor-01'),
            admin: allUsers.find(u => u.id === 'user-admin-01'),
        };

        const currentUser = currentUserDetails[role as keyof typeof currentUserDetails];

        if (!currentUser) return;

        const newMessage: JobMessage = {
            user: currentUser.name,
            role: currentUser.role.split(' ')[0] as 'Client' | 'Inspector' | 'Auditor',
            timestamp: new Date().toISOString(),
            message: message,
        };

        setJobDetails(prev => {
            if (!prev) return undefined;
            return {
                ...prev,
                messages: [...(prev.messages || []), newMessage],
            };
        });
    };

    const BidsSection = () => {
        if (!jobDetails) return null;
        const isClient = role === 'client';
        const jobBids = jobDetails.bids || [];
        
        // After job is assigned, show who it was assigned to.
        if (jobDetails.status !== 'Posted') {
            const assignedProvider = serviceProviders.find(p => p.id === jobDetails.providerId);
            const awardedBid = jobBids.find(b => b.status === 'Awarded');
    
            if (!assignedProvider || !awardedBid) return null;
    
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Awarded Provider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={assignedProvider.logoUrl} alt={`${assignedProvider.name} logo`} data-ai-hint={`${assignedProvider.name} logo`} />
                                <AvatarFallback>{assignedProvider.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg">{assignedProvider.name}</p>
                                <p className="text-muted-foreground">Awarded bid: ${awardedBid.amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        }
    
        // If job is still posted, show bids.
        const submittedBids = jobBids.filter(b => b.status === 'Submitted');

        if (submittedBids.length === 0) {
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
                    <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" />Bids Received ({submittedBids.length})</CardTitle>
                    {isClient && <CardDescription>Review the bids below and award the job to a provider.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {submittedBids.map(bid => {
                        const provider = serviceProviders.find(p => p.id === bid.providerId);
                        if (!provider) return null;
                        return (
                            <div key={bid.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4">
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
                                    {isClient && <Button onClick={() => handleReviewBid(bid)}>Review Bid</Button>}
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
    const technique = allNdtTechniques.find(t => t.id.toUpperCase() === jobDetails.technique);
    
    const backLink = isAdmin ? "/dashboard/all-jobs" : isAuditor ? "/dashboard/inspections" : "/dashboard/my-jobs";
    const backText = isAdmin ? "All Jobs" : isAuditor ? "Inspections" : "My Jobs";

    const lastRejection = jobDetails.history?.find(h => h.statusChange === 'Revisions Requested');

    return (
        <TooltipProvider>
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
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge>{jobDetails.technique}</Badge>
                                        </TooltipTrigger>
                                        {technique && (
                                            <TooltipContent className="max-w-xs">
                                                <p className="font-bold">{technique.title}</p>
                                                <p>{technique.description}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                                    <span>{jobDetails.location}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    <span>Posted: {format(new Date(jobDetails.postedDate), GLOBAL_DATE_FORMAT)}</span>
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold text-lg">Job Description</h3>
                                    <p className="mt-2 text-muted-foreground">
                                        Full job description will be displayed here, including scope of work, technical requirements, and any client specifications.
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
                                                        <Button variant="outline" size="sm" onClick={() => setViewingReport(report)}>View Report</Button>
                                                    ) : (
                                                        isInspector && ['In Progress', 'Scheduled', 'Revisions Requested'].includes(jobDetails.status) && (
                                                            <Button asChild size="sm">
                                                                <Link href={constructUrl(`/dashboard/my-jobs/${jobDetails.id}/report?inspectionId=${inspection.id}`)}>
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

                        {isReviewable && !reviewSubmitted && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Leave a Review</CardTitle>
                                    <CardDescription>Share your experience with the service provider for this job.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Overall Rating</Label>
                                        <div className="flex items-center gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        "h-8 w-8 cursor-pointer transition-colors",
                                                        (hoverRating || rating) >= star
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "fill-muted-foreground/30 text-muted-foreground/30"
                                                    )}
                                                    onClick={() => setRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="review-comment">Comments</Label>
                                        <Textarea
                                            id="review-comment"
                                            placeholder="Describe your experience with the provider..."
                                            className="mt-2 min-h-[120px]"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleReviewSubmit}>{hasBeenSubmittedOnce ? 'Update Review' : 'Submit Review'}</Button>
                                </CardFooter>
                            </Card>
                        )}

                        {isReviewable && reviewSubmitted && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Your Review</CardTitle>
                                    <CardDescription>
                                        Thank you for your feedback! Your review is now pending approval.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Your Rating</Label>
                                        <div className="flex items-center gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        "h-6 w-6",
                                                        rating >= star
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "fill-muted-foreground/30 text-muted-foreground/30"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {reviewComment && (
                                        <div>
                                            <Label>Your Comments</Label>
                                            <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted/50 rounded-md border">{reviewComment}</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" onClick={() => setReviewSubmitted(false)}>Edit Review</Button>
                                </CardFooter>
                            </Card>
                        )}

                        <ClientReviewActions
                            status={jobDetails.status}
                            workflow={jobDetails.workflow}
                            isClient={isClient}
                            onApprove={handleClientApprove}
                            onReject={handleClientReject}
                        />

                        <AuditorActions 
                            status={jobDetails.status} 
                            workflow={jobDetails.workflow} 
                            isAuditor={isAuditor}
                            reportSubmitted={reportSubmitted}
                            onApprove={handleAuditorApprove}
                            onReject={handleAuditorReject}
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

                {!isMobile && <JobChatWindow job={jobDetails} onSendMessage={handleSendMessage} />}

                {/* Technician Assignment Dialog */}
                <Dialog open={isTechDialogOpen} onOpenChange={setIsTechDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Assign Technicians</DialogTitle>
                            <DialogDescription>Select the technicians to assign to this job.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-64 p-1">
                            <div className="space-y-2 p-3">
                            {allUsers.filter(u => u.role === 'Inspector').map(tech => (
                                <div key={tech.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`tech-${tech.id}`} 
                                        checked={tempSelectedTechs.includes(tech.id)}
                                        onCheckedChange={(checked) => {
                                            setTempSelectedTechs(prev => checked ? [...prev, tech.id] : prev.filter(id => id !== tech.id))
                                        }}
                                    />
                                    <Label htmlFor={`tech-${tech.id}`} className="flex-grow">{tech.name} <span className="text-muted-foreground">({tech.level})</span></Label>
                                    <Badge variant={tech.workStatus === 'Available' ? 'success' : 'default'}>{tech.workStatus}</Badge>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsTechDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssignTechs}>Assign Technicians</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Equipment Assignment Dialog */}
                <Dialog open={isEquipDialogOpen} onOpenChange={setIsEquipDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Assign Equipment</DialogTitle>
                            <DialogDescription>Select the equipment to assign to this job.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-64 p-1">
                            <div className="space-y-2 p-3">
                            {inspectorAssets.map(equip => (
                                <div key={equip.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`equip-${equip.id}`}
                                        checked={tempSelectedEquip.includes(equip.id)}
                                        onCheckedChange={(checked) => {
                                            setTempSelectedEquip(prev => checked ? [...prev, equip.id] : prev.filter(id => id !== equip.id))
                                        }}
                                    />
                                    <Label htmlFor={`equip-${equip.id}`} className="flex-grow">{equip.name} <span className="text-muted-foreground">({equip.techniques.join(', ')})</span></Label>
                                    <Badge variant={equip.status === 'Available' ? 'success' : 'secondary'}>{equip.status}</Badge>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsEquipDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssignEquip}>Assign Equipment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                 <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule Job: {jobDetails.title}</DialogTitle>
                            <DialogDescription>Select the start and end dates for the inspection.</DialogDescription>
                        </DialogHeader>
                        <ScheduleJobForm
                            onSubmit={handleScheduleSubmit}
                            onCancel={() => setIsSchedulingOpen(false)}
                            defaultValues={{
                                scheduledStartDate: jobDetails.scheduledStartDate ? parseISO(jobDetails.scheduledStartDate) : new Date(),
                                scheduledEndDate: jobDetails.scheduledEndDate ? parseISO(jobDetails.scheduledEndDate) : undefined,
                            }}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={!!reviewingBid} onOpenChange={(open) => !open && setReviewingBid(null)}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Review Bid</DialogTitle>
                            {reviewingBid?.provider && (
                                <DialogDescription>
                                From {reviewingBid.provider.name} for job: {jobDetails.title}
                                </DialogDescription>
                            )}
                        </DialogHeader>
                        {reviewingBid && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={reviewingBid.provider.logoUrl} alt={`${reviewingBid.provider.name} logo`} data-ai-hint={`${reviewingBid.provider.name} logo`} />
                                    <AvatarFallback className="text-xl">{reviewingBid.provider.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-bold">{reviewingBid.provider.name}</h3>
                                    <p className="text-sm text-muted-foreground">{reviewingBid.provider.location}</p>
                                    <StarRating rating={reviewingBid.provider.rating} />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Bid Amount</Label>
                                    <p className="text-2xl font-bold">${reviewingBid.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label>Date Submitted</Label>
                                    <p>{format(new Date(reviewingBid.submittedDate), GLOBAL_DATE_FORMAT)}</p>
                                </div>
                            </div>
                            {reviewingBid.proposedTechnique && reviewingBid.proposedTechnique !== jobDetails.technique && (
                                <div>
                                    <Label>Proposed Technique Change</Label>
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>New Technique Proposed: <Badge variant="outline">{reviewingBid.proposedTechnique}</Badge></AlertTitle>
                                        <AlertDescription>{reviewingBid.proposalJustification || "No justification provided."}</AlertDescription>
                                    </Alert>
                                </div>
                            )}
                            <div>
                                <Label>Provider Comments</Label>
                                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border min-h-[60px] mt-2">
                                    {reviewingBid.comments || "No comments provided."}
                                </p>
                            </div>
                            <div>
                                <Label>Attached Documents</Label>
                                <p className="text-sm text-muted-foreground mt-2">Provider documents would be listed here for download.</p>
                            </div>
                        </div>
                        )}
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setReviewingBid(null)}>Close</Button>
                            <Button onClick={() => {
                                if (reviewingBid) {
                                    handleAwardBid(reviewingBid.id, reviewingBid.providerId);
                                }
                                setReviewingBid(null);
                            }}>
                                <Award className="mr-2 h-4 w-4" /> Award Job to {reviewingBid?.provider?.name}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <UniformDocumentViewer 
                    isOpen={isViewerOpen}
                    onOpenChange={setIsViewerOpen}
                    documents={documentsToView}
                    title={`Documents for ${jobDetails.title}`}
                    description="Securely view all documents associated with this job."
                    initialSelectedDocumentName={initialDocName}
                />

                <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Digital Report: {jobDetails.title}</DialogTitle>
                            <DialogDescription>
                                Inspection for {viewingReport?.reportData.inspectionArea} on {viewingReport ? format(parseISO(viewingReport.submittedOn), GLOBAL_DATE_FORMAT) : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4 text-sm">
                            <h3 className="font-semibold">Equipment & Setup</h3>
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                                <div><span className="font-medium text-muted-foreground">Instrument:</span> {viewingReport?.reportData.equipmentUsed}</div>
                                <div><span className="font-medium text-muted-foreground">Calibration Block:</span> {viewingReport?.reportData.calibrationBlock}</div>
                                <div><span className="font-medium text-muted-foreground">Couplant:</span> {viewingReport?.reportData.couplant}</div>
                                <div><span className="font-medium text-muted-foreground">Surface:</span> {viewingReport?.reportData.surfaceCondition}</div>
                            </div>
                            <h3 className="font-semibold">Findings</h3>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Thickness (mm)</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {viewingReport?.reportData.findings.map((finding: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{finding.location}</TableCell>
                                            <TableCell>{finding.thickness}</TableCell>
                                            <TableCell>{finding.notes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             <h3 className="font-semibold">Summary</h3>
                             <div className="p-4 border rounded-md bg-muted/50 prose prose-sm max-w-none">
                                {viewingReport?.reportData.summary}
                             </div>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </TooltipProvider>
    );
}
