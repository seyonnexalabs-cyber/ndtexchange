

'use client';
import * as React from 'react';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, FileText, Printer, Save, AlertTriangle, User, Users, Calendar, HardHat, Building, CheckCircle, XCircle, Maximize, FileUp, Award, ShieldCheck, MessageSquare, Star, Gavel, Clock, Factory, DollarSign, Workflow, UserCheck, Briefcase, MapPin, Wrench, Folder, Edit, MoreVertical, ChevronRight, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, cn, safeParseDate } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JobActivityLog from '../../my-jobs/components/job-history';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, serverTimestamp, query, where, limit, getDocs, doc, updateDoc, writeBatch, documentId, setDoc, arrayUnion, addDoc } from 'firebase/firestore';
import type { Bid, Job, JobDocument, NDTServiceProvider, Client, Review, NDTTechnique, PlatformUser, Inspection, TemaDesign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import WorkBreakdownTree from '../../my-jobs/components/work-breakdown-accordion';
import UniformDocumentViewer from '../../components/uniform-document-viewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import JobChatWindow from '../../my-jobs/components/job-chat-window';


const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success', 'Revisions Requested': 'destructive'
};

const ClientFormattedDate = ({ date, formatString }: { date: Date | null, formatString: string }) => {
    const [formatted, setFormatted] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (date) {
            setFormatted(format(date, formatString));
        }
    }, [date, formatString]);

    if (!formatted) return null;
    return <>{formatted}</>;
};

const BidsSection = ({ job, bids, allCompanies, onReviewBid, isClient, isAdmin }: { job: Job, bids: Bid[], allCompanies: any[], onReviewBid: (bid: Bid) => void, isClient: boolean, isAdmin: boolean }) => {
    if (!job || (!isClient && !isAdmin) || !bids) return null;

    if (bids.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" />Bids Received</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">No bids have been received for this job yet.</p></CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-primary" />Bids Received ({bids.length})</CardTitle>
                {job.status === 'Posted' && <CardDescription>Review the bids below and award the job to a provider.</CardDescription>}
                {job.status !== 'Posted' && <CardDescription>A historical record of all bids submitted for this job.</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {bids.map(bid => {
                    const provider = allCompanies?.find(p => p.id === bid.providerCompanyId);
                    if (!provider) return null;
                    const isAwarded = bid.status === 'Awarded';
                    const submittedDate = safeParseDate(bid.submittedDate);
                    return (
                        <div key={bid.id} className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4", isAwarded && "bg-green-500/10 border-green-500")}>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12"><AvatarFallback>{provider.name.charAt(0)}</AvatarFallback></Avatar>
                                <div>
                                    <p className="font-semibold">{provider.name}</p>
                                    <p className="text-sm text-muted-foreground">{provider.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 w-full sm:w-auto">
                                <div className="text-left sm:text-right flex-grow">
                                    <p className="font-bold text-lg">${bid.amount.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Submitted on <ClientFormattedDate date={submittedDate} formatString={GLOBAL_DATE_FORMAT} /></p>
                                </div>
                                {isAwarded ? (
                                    <Badge variant="success" className="gap-2"><Award className="h-4 w-4" />Awarded</Badge>
                                ) : job.status === 'Posted' ? (
                                    <Button onClick={() => onReviewBid(bid)}>Review Bid</Button>
                                ) : (
                                    <Badge variant="outline">{bid.status}</Badge>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default function JobDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const router = useRouter();
    const { firestore } = useFirebase();
    const { user: authUser, isUserLoading: isAuthLoading } = useUser();
    
    const [activeTab, setActiveTab] = React.useState('scope');
    const [reviewingBid, setReviewingBid] = React.useState<(Bid & { provider: NDTServiceProvider }) | null>(null);
    const [isViewerOpen, setIsViewerOpen] = React.useState(false);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser]));

    const { data: job, isLoading: isLoadingJob, error: jobError } = useDoc<Job>(useMemoFirebase(() => (firestore && id ? doc(firestore, 'jobs', id as string) : null), [firestore, id]));
    
    const userRole = currentUserProfile?.role?.toLowerCase();
    const isClient = userRole === 'client';
    const isAdmin = userRole === 'admin';

    const bidsQuery = useMemoFirebase(() => {
        if (!firestore || !job?.id) return null;
        if (isClient || isAdmin) {
            if (!job.clientCompanyId) return null;
            return query(collection(firestore, 'bids'), where('jobId', '==', job.id), where('clientCompanyId', '==', job.clientCompanyId));
        }
        return null;
    }, [firestore, job, isClient, isAdmin]);

    const { data: bids, isLoading: isLoadingBids } = useCollection<Bid>(bidsQuery);
    
    const sortedBids = React.useMemo(() => {
        if (!bids) return [];
        return [...bids].sort((a, b) => {
            const dateA = safeParseDate(a.submittedDate);
            const dateB = safeParseDate(b.submittedDate);
            if (!dateA || !dateB) return 0;
            return dateB.getTime() - dateA.getTime();
        });
    }, [bids]);

    const inspectionsQuery = useMemoFirebase(() => {
        if (!firestore || !job?.id || !currentUserProfile?.companyId) return null;
        const companyId = currentUserProfile.companyId;
        const companyField = userRole === 'client' ? 'clientCompanyId' : (userRole === 'inspector' ? 'providerCompanyId' : null);

        if (userRole === 'admin') {
            return query(collection(firestore, 'inspections'), where('jobId', '==', job.id));
        }
        
        if (!companyField) {
            return null;
        }
        
        return query(
            collection(firestore, 'inspections'),
            where('jobId', '==', job.id),
            where(companyField, '==', companyId)
        );
    }, [firestore, job, currentUserProfile, userRole]);
    
    const { data: inspections, isLoading: isLoadingInspections } = useCollection<Inspection>(inspectionsQuery);
    
    const { data: allCompanies, isLoading: isLoadingCompanies } = useCollection<any>(useMemoFirebase(() => (firestore ? collection(firestore, 'companies') : null), [firestore]));
    
    const { data: allNdtTechniques, isLoading: isLoadingTechniques } = useCollection<any>(useMemoFirebase(() => (firestore ? collection(firestore, 'techniques') : null), [firestore]));

    const [attachedDesigns, setAttachedDesigns] = React.useState<TemaDesign[]>([]);
    const [isLoadingDesigns, setIsLoadingDesigns] = React.useState(false);

    const designIdsString = React.useMemo(() => JSON.stringify(job?.temaDesignIds || []), [job?.temaDesignIds]);

    React.useEffect(() => {
        const designIds = job?.temaDesignIds;
        if (firestore && designIds && designIds.length > 0) {
            setIsLoadingDesigns(true);
            const designsRef = collection(firestore, 'designs');
            const q = query(designsRef, where(documentId(), 'in', designIds.slice(0, 10)));
            getDocs(q).then(snapshot => {
                const designs = snapshot.docs.map(doc => doc.data() as TemaDesign);
                setAttachedDesigns(designs);
            }).catch(err => {
                console.error("Error fetching attached designs:", err);
            }).finally(() => {
                setIsLoadingDesigns(false);
            });
        } else {
            setAttachedDesigns([]);
        }
    }, [firestore, designIdsString, job?.temaDesignIds]);
    
    const { provider, auditor, client } = React.useMemo(() => {
        if (!allCompanies || !job) return { provider: null, auditor: null, client: null };
        return {
            provider: allCompanies.find(c => c.id === job.providerCompanyId),
            auditor: allCompanies.find(c => c.id === job.auditorCompanyId),
            client: allCompanies.find(c => c.id === job.clientCompanyId),
        };
    }, [allCompanies, job]);

    const isAuthorized = React.useMemo(() => {
        if (!job || !currentUserProfile) return false;
        if (isAdmin) return true;
        if (isClient) return job.clientCompanyId === currentUserProfile.companyId;
        if (userRole === 'inspector') return job.status === 'Posted' || job.providerCompanyId === currentUserProfile.companyId;
        if (userRole === 'auditor') return job.auditorCompanyId === currentUserProfile.companyId;
        return false;
    }, [job, currentUserProfile, userRole, isAdmin, isClient]);

    const handleAwardBid = async (awardedBidId: string, providerCompanyId: string) => {
        if (!job || !bids || !firestore || !currentUserProfile) return;
        
        try {
            const batch = writeBatch(firestore);
            bids.forEach(bid => {
                const bidRef = doc(firestore, 'bids', bid.id);
                batch.update(bidRef, { status: bid.id === awardedBidId ? 'Awarded' : 'Not Selected' });
            });
            
            const jobRef = doc(firestore, 'jobs', job.id);
            batch.update(jobRef, { status: 'Assigned', providerCompanyId });
            
            const historyEntry = {
                user: currentUserProfile.name,
                timestamp: serverTimestamp(),
                action: `Awarded job to provider`,
                details: `Provider ID: ${providerCompanyId}`,
                statusChange: 'Assigned' as Job['status']
            };
            batch.update(jobRef, { history: arrayUnion(historyEntry) });

            const inspectionsQuerySnapshot = await getDocs(query(collection(firestore, "inspections"), where("jobId", "==", job.id)));
            inspectionsQuerySnapshot.forEach(inspectionDoc => {
                batch.update(inspectionDoc.ref, { providerCompanyId: providerCompanyId });
            });

            await batch.commit();

            toast.success("Job Awarded!", { description: "The job has been awarded. The provider will be notified." });
            setReviewingBid(null);
        } catch (error) {
            console.error("Error awarding job:", error);
            toast.error("Awarding Failed");
        }
    };
    
    const handleReviewBid = (bid: Bid) => {
        const provider = allCompanies?.find(p => p.id === bid.providerCompanyId);
        if (provider) setReviewingBid({ ...bid, provider: provider as NDTServiceProvider });
    };

    const handleStatusUpdate = async (newStatus: Job['status']) => {
        if (!firestore || !job || !currentUserProfile) return;
        try {
            const jobRef = doc(firestore, 'jobs', job.id);
            const historyEntry = {
                user: currentUserProfile.name,
                timestamp: new Date().toISOString(), 
                action: `Status changed to ${newStatus}`,
                statusChange: newStatus
            };
            await updateDoc(jobRef, { 
                status: newStatus,
                history: arrayUnion(historyEntry)
            });
            toast.success('Job Status Updated', {
                description: `The job is now marked as "${newStatus}".`,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Update Failed");
        }
    };

    const isLoading = isLoadingJob || isLoadingBids || isLoadingProfile || isLoadingCompanies || isLoadingInspections || isLoadingDesigns || isLoadingTechniques;
    const isAssignedProvider = userRole === 'inspector' && job?.providerCompanyId === currentUserProfile?.companyId;
    const canUpdateStatus = isClient || isAdmin || isAssignedProvider;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }
    
    if (jobError || !isAuthorized) {
        return (
            <div className="text-center p-10">
                <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Access Denied</AlertTitle><AlertDescription>{jobError?.message || "You do not have permission to view this job."}</AlertDescription></Alert>
            </div>
        )
    }

    if (!job) return notFound();
    
    const scheduledDate = job.scheduledStartDate ? safeParseDate(job.scheduledStartDate) : null;

    return (
        <div className="space-y-6">
            <nav className="text-sm text-muted-foreground flex items-center gap-2">
                <Link href={constructUrl("/dashboard/my-jobs")} className="hover:text-primary">My Jobs</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">Job Details</span>
            </nav>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl lg:text-3xl font-headline font-bold">{job.title}</h1>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={constructUrl(`/dashboard/my-jobs/${id}/edit`)}>
                            <Edit className="mr-2"/>Edit Job
                        </Link>
                    </Button>

                    {canUpdateStatus && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Update Status</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Change Status To</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => handleStatusUpdate('In Progress')}>In Progress</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusUpdate('Report Submitted')}>Report Submitted</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusUpdate('Completed')}>Completed</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open more menu" title="Open more menu"><MoreVertical /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Marketplace Listing</DropdownMenuItem>
                            <DropdownMenuItem>Print Job Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                Cancel Job
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">Client:</span> {client?.name || job.client}</span>
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">Provider:</span> {provider?.name || 'N/A'}</span>
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">Auditor:</span> {auditor?.name || 'N/A'}</span>
            </div>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Job Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">Job Description</h4>
                        <p className="mt-1 text-sm">{job.description || 'No description provided.'}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground">Location</h4>
                            <p className="mt-1 text-sm">{job.location}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground">Scheduled Date</h4>
                            <p className="mt-1 text-sm">{scheduledDate ? <ClientFormattedDate date={scheduledDate} formatString='PPP' /> : 'Not Scheduled'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground">Job Type</h4>
                            <p className="mt-1 text-sm capitalize">{job.jobType || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground">Industry</h4>
                            <p className="mt-1 text-sm">{job.industry || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground">Estimated Budget</h4>
                            <p className="mt-1 text-sm">{job.estimatedBudget || 'Not Specified'}</p>
                        </div>
                        <div className="lg:col-span-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Required Techniques</h4>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {job.techniques?.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Required Certifications</h4>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {job.certificationsRequired?.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="scope" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="scope">Work Breakdown</TabsTrigger>
                    {(isClient || isAdmin) && <TabsTrigger value="bids">Bids</TabsTrigger>}
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="audit">History</TabsTrigger>
                </TabsList>
                 <TabsContent value="scope" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Work Breakdown Structure</CardTitle>
                            <CardDescription>A tree view of all assets and inspections required for this job.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WorkBreakdownTree
                                inspections={inspections || []}
                                job={job}
                                constructUrl={constructUrl}
                                allNdtTechniques={allNdtTechniques || []}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="bids" className="mt-6">
                    <BidsSection job={job} bids={sortedBids} allCompanies={allCompanies || []} onReviewBid={handleReviewBid} isClient={isClient} isAdmin={isAdmin} />
                </TabsContent>
                <TabsContent value="messages" className="mt-6">
                    <div className="h-[60vh]">
                        <JobChatWindow job={job} />
                    </div>
                </TabsContent>
                <TabsContent value="documents" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Attached Documents</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {job.documents?.map(doc => (
                                    <button key={doc.name} className="flex w-full items-center gap-3 rounded-md border p-3 text-left hover:bg-muted" onClick={() => setIsViewerOpen(true)}>
                                        <FileText className="h-5 w-5 text-primary" />
                                        <p className="font-medium text-sm">{doc.name}</p>
                                    </button>
                                ))}
                                {(!job.documents || job.documents.length === 0) && (
                                    <p className="text-muted-foreground text-sm">No documents have been attached to this job.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="audit" className="mt-6">
                    <JobActivityLog history={job.history} />
                </TabsContent>
            </Tabs>
            
            <Dialog open={!!reviewingBid} onOpenChange={(open) => !open && setReviewingBid(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Review Bid from {reviewingBid?.provider.name}</DialogTitle>
                        <DialogDescription>Review the details of this bid before awarding the job. This action is final.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Bid Amount</p>
                            <p className="text-4xl font-bold">${reviewingBid?.amount.toLocaleString()}</p>
                        </div>
                        {reviewingBid?.comments && (
                            <div>
                                <p className="font-semibold text-sm">Provider's Comments:</p>
                                <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">"{reviewingBid.comments}"</blockquote>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setReviewingBid(null)}>Cancel</Button>
                        <Button onClick={() => handleAwardBid(reviewingBid!.id, reviewingBid!.providerCompanyId)}>
                            <Award className="mr-2 h-4 w-4" /> Award Job to {reviewingBid?.provider.name}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <UniformDocumentViewer 
                isOpen={isViewerOpen}
                onOpenChange={setIsViewerOpen}
                documents={job.documents || []}
                title={`Job Documents: ${job.title}`}
                description="Secure viewer for all documents related to this job."
            />
        </div>
    );
}
