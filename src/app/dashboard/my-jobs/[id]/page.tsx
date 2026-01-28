
'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { jobs, technicians, inspectorAssets, bids, Bid, Job, reviews } from '@/lib/placeholder-data';
import { serviceProviders } from '@/lib/service-providers-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Briefcase, MapPin, Calendar, Users, Wrench, ChevronLeft, PlusCircle, Upload, FileText, CheckCircle, History, XCircle, Maximize, FileUp, Award, ShieldCheck, MessageSquare, Star } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobActivityLog from '@/app/dashboard/my-jobs/components/job-history';
import { format } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ndtTechniques as allNdtTechniques } from '@/lib/ndt-techniques-data';


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
    'Paid': 'Payment for the job has been settled.'
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
    'Paid': 'success'
};


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
    const currentStatusIndex = allStatuses.indexOf(status);

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
                            {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
    onReject: () => void 
}) => {
    // 1. Standard workflow - always disabled and just provides info
    if (workflow === 'standard') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-muted-foreground/70 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Auditor Review</CardTitle>
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
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Audit Result</CardTitle>
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
                    <CardTitle className="text-muted-foreground/70 flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Auditor Review</CardTitle>
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
                    <CardTitle>Auditor Actions</CardTitle>
                    <CardDescription>Review the report and provide your decision.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="audit-comments">Comments for Provider (if requesting revisions)</Label>
                        <Textarea id="audit-comments" placeholder="e.g., 'Please clarify the UT readings in section 3.2...'" className="mt-2 min-h-[120px]"/>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="destructive" onClick={onReject}>
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
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Auditor Review Pending</CardTitle>
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
    onReject: () => void 
}) => {
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
                <CardTitle className="flex items-center gap-2"><FileText /> {title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">Review the submitted report and documents. Approve the report to proceed, or request revisions from the provider.</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive" onClick={onReject}>
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
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
    const { id } = React.use(params);
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const { toast } = useToast();
    
    // State for the entire page's data to avoid hydration issues with direct mutation
    const [jobDetails, setJobDetails] = useState<Job | undefined>(() => jobs.find(j => j.id === id));
    const [jobBids, setJobBids] = useState<Bid[]>(() => bids.filter(b => b.jobId === id));
    
    const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);
    const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false);

    const [tempSelectedTechs, setTempSelectedTechs] = useState<string[]>([]);
    const [tempSelectedEquip, setTempSelectedEquip] = useState<string[]>([]);

    const [isViewerOpen, setIsViewerOpen] = React.useState(false);
    
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
            setJobBids(JSON.parse(JSON.stringify(bids.filter(b => b.jobId === id))));
            
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

    const allDocuments: ViewerDocument[] = React.useMemo(() => {
        if (!jobDetails) return [];
        const docs: ViewerDocument[] = [];
        jobDetails.documents?.forEach(doc => {
            docs.push({ ...doc, source: 'Client' });
        });

        if (['Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'].includes(jobDetails.status)) {
            docs.push({ name: `Inspection_Report_${jobDetails.id}.pdf`, source: 'Provider' });
        }
        
        if ((jobDetails.status === 'Audit Approved' || jobDetails.status === 'Under Audit') && (jobDetails.workflow === 'level3' || jobDetails.workflow === 'auto')) {
             docs.push({ name: `Audit_Findings_${jobDetails.id}.pdf`, source: 'Auditor' });
        }
        return docs;
    }, [jobDetails]);


    if (!jobDetails) {
        notFound();
    }
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const assignedTechnicians = technicians.filter(t => jobDetails.technicianIds?.includes(t.id));
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
        setJobDetails(prev => prev ? {...prev, status: 'Assigned', providerId: providerId } : undefined);

        // Update bids status
        setJobBids(prevBids => prevBids.map(bid => {
            if (bid.id === awardedBidId) {
                return { ...bid, status: 'Awarded' };
            }
            if (bid.status === 'Submitted') {
                 return { ...bid, status: 'Rejected' };
            }
            return bid;
        }));

        const provider = serviceProviders.find(p => p.id === providerId);
        toast({
            title: "Job Awarded!",
            description: `${provider?.name} has been awarded the job: ${jobDetails.title}.`,
        });
    };

    const handleAuditorApprove = () => {
        toast({
            title: "Report Approved by Auditor",
            description: `The inspection report has been approved. The client will now perform the final review.`,
        });
        handleStatusChange('Audit Approved');
    }

    const handleAuditorReject = () => {
        toast({
            variant: "destructive",
            title: "Revisions Requested by Auditor",
            description: `The report has been sent back to the provider for revisions.`,
        });
        handleStatusChange('Assigned');
    }

    const handleClientApprove = () => {
        toast({
            title: "Job Approved!",
            description: `You have approved the report. The job is now ready for completion.`,
        });
        handleStatusChange('Client Approved');
    }

    const handleClientReject = () => {
        toast({
            variant: "destructive",
            title: "Revisions Requested by Client",
            description: `The report has been sent back to the provider for revisions.`,
        });
        handleStatusChange('Assigned'); // Go back to assigned for simplicity
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

    const BidsSection = () => {
        if (!jobDetails) return null;
        const isClient = role === 'client';
        
        // After job is assigned, show who it was assigned to.
        if (jobDetails.status !== 'Posted') {
            const assignedProvider = serviceProviders.find(p => p.id === jobDetails.providerId);
            const awardedBid = jobBids.find(b => b.status === 'Awarded');
    
            if (!assignedProvider || !awardedBid) return null;
    
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award /> Awarded Provider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={assignedProvider.logoUrl} alt={`${assignedProvider.name} logo`} />
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
                        <CardTitle>Bids Received</CardTitle>
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
                    <CardTitle>Bids Received ({submittedBids.length})</CardTitle>
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
                                    {isClient && <Button onClick={() => handleAwardBid(bid.id, bid.providerId)}>Award Job</Button>}
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
    const reportSubmitted = ['Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'].includes(jobDetails.status);
    const resourceAssignmentLocked = isInspector && ['In Progress', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed', 'Paid'].includes(jobDetails.status);
    const technique = allNdtTechniques.find(t => t.id.toUpperCase() === jobDetails.technique);
    
    const backLink = isAdmin ? "/dashboard/all-jobs" : isAuditor ? "/dashboard/inspections" : "/dashboard/my-jobs";
    const backText = isAdmin ? "All Jobs" : isAuditor ? "Inspections" : "My Jobs";


    return (
        <TooltipProvider>
            <div>
                <Button asChild variant="outline" size="sm" className="mb-4">
                     <Link href={constructUrl(backLink)}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to {backText}
                    </Link>
                </Button>

                <Accordion type="single" collapsible className="w-full mb-6">
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline p-4 bg-muted/50 rounded-md">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
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
                                            <Briefcase />
                                            {jobDetails.title}
                                        </CardTitle>
                                        <CardDescription>ID: {jobDetails.id} &bull; for {jobDetails.client}</CardDescription>
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
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{jobDetails.location}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2" />
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

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">Documents & Reports</CardTitle>
                                <CardDescription>View all documents and reports associated with this job.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allDocuments.length === 0 ? (
                                    <div className="relative aspect-[4/3] sm:aspect-video bg-muted/30 rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
                                        <FileUp className="w-16 h-16 text-muted-foreground/70" />
                                        <p className="mt-4 text-sm font-medium text-muted-foreground">No documents have been uploaded for this job yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">Available Documents ({allDocuments.length})</h3>
                                            <Button onClick={() => setIsViewerOpen(true)}>
                                                <Maximize className="mr-2 h-4 w-4" />
                                                View All Documents
                                            </Button>
                                        </div>
                                        <ScrollArea className="space-y-2 rounded-md border p-2 max-h-48">
                                            {allDocuments.map((doc) => (
                                                <div key={doc.name} className="flex items-center gap-2 p-2">
                                                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    <span className="text-sm font-medium truncate" title={doc.name}>{doc.name}</span>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </div>
                                )}
                                
                                {isClient && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Upload Clarification Documents</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Need to provide extra drawings, photos, or documents to the service provider? Upload them here.
                                            </p>
                                            <div className="p-4 border rounded-md space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <Input id="clarification-docs" type="file" multiple accept={ACCEPTED_FILE_TYPES} className="flex-grow" />
                                                    <Button variant="secondary">
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Upload
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Max 10MB per file.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            {isInspector && (
                                <CardFooter className="flex justify-end gap-2">
                                    <Button disabled={reportSubmitted}>
                                        {reportSubmitted ? <><CheckCircle className="mr-2"/>Report Submitted</> : 'Generate Digital Report'}
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><History /> Job Activity Log</CardTitle>
                                <CardDescription>A detailed, chronological log of all events for this job.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <JobActivityLog history={jobDetails.history} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MessageSquare /> Communication</CardTitle>
                                <CardDescription>Review messages and exchange information about the job.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6 max-h-96 overflow-y-auto p-4 border rounded-md bg-muted/20">
                                    {jobDetails.messages && jobDetails.messages.length > 0 ? (
                                        jobDetails.messages.map((message, index) => (
                                            <div key={index} className="flex gap-4">
                                                <Avatar>
                                                    <AvatarFallback>{message.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="font-semibold">{message.user}</p>
                                                        <p className="text-xs text-muted-foreground">{message.role} · {format(new Date(message.timestamp), GLOBAL_DATETIME_FORMAT)}</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{message.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Start the conversation!</p>
                                    )}
                                </div>
                                <div className="mt-6 space-y-2">
                                    <Label htmlFor="new-message">Your Message</Label>
                                    <Textarea id="new-message" placeholder="Type your message here..." />
                                    <div className="flex justify-end">
                                        <Button>Send Message</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {isReviewable && !reviewSubmitted && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Leave a Review</CardTitle>
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
                                    <CardTitle>Your Review</CardTitle>
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
                                        <h4 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /> Technicians</h4>
                                        {isInspector && (
                                            <Button variant="outline" size="sm" onClick={openTechDialog} disabled={resourceAssignmentLocked}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Manage
                                            </Button>
                                        )}
                                    </div>
                                    {assignedTechnicians.length > 0 ? (
                                        <ul className="space-y-2 pl-2">
                                            {assignedTechnicians.map(tech => (
                                                <li key={tech.id} className="text-sm text-muted-foreground">{tech.name} - {tech.level}</li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-sm text-muted-foreground pl-2">No technicians assigned.</p>}
                                </div>
                                <Separator />
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold flex items-center gap-2"><Wrench className="h-5 w-5 text-muted-foreground" /> Equipment</h4>
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
                                                    <span>{equip.name}</span>
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
                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><ShieldCheck className="h-5 w-5 text-muted-foreground" /> Auditor</h4>
                                    {(jobDetails.workflow === 'level3' || jobDetails.workflow === 'auto') ? (
                                        <p className="text-sm text-muted-foreground pl-2">Alex Chen (NDT Auditors LLC)</p>
                                    ) : <p className="text-sm text-muted-foreground pl-2">No auditor required for standard workflow.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Technician Assignment Dialog */}
                <Dialog open={isTechDialogOpen} onOpenChange={setIsTechDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign Technicians</DialogTitle>
                            <DialogDescription>Select the technicians to assign to this job.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-64 p-1">
                            <div className="space-y-2 p-3">
                            {technicians.map(tech => (
                                <div key={tech.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`tech-${tech.id}`} 
                                        checked={tempSelectedTechs.includes(tech.id)}
                                        onCheckedChange={(checked) => {
                                            setTempSelectedTechs(prev => checked ? [...prev, tech.id] : prev.filter(id => id !== tech.id))
                                        }}
                                    />
                                    <Label htmlFor={`tech-${tech.id}`} className="flex-grow">{tech.name} <span className="text-muted-foreground">({tech.level})</span></Label>
                                    <Badge variant={tech.status === 'Available' ? 'success' : 'default'}>{tech.status}</Badge>
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
                    <DialogContent>
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

                <UniformDocumentViewer 
                    isOpen={isViewerOpen}
                    onOpenChange={setIsViewerOpen}
                    documents={allDocuments}
                    title={`Documents for ${jobDetails.title}`}
                    description="Securely view all documents associated with this job."
                />
            </div>
        </TooltipProvider>
    );
}
    

    

    

    