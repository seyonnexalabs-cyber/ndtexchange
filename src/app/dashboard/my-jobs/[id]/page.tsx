
'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { ChevronLeft, FileText, Printer, Save, AlertTriangle, User, Users, Calendar, HardHat, Building, CheckCircle, XCircle, Maximize, FileUp, Award, ShieldCheck, MessageSquare, Star, Gavel, Clock, Factory, DollarSign, Workflow, UserCheck, Briefcase, MapPin, Wrench, Folder, File, Edit, MoreVertical, ChevronRight } from 'lucide-react';
import { format, parseISO, differenceInDays, addDays, isValid } from 'date-fns';
import Image from 'next/image';
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, ACCEPTED_FILE_TYPES, cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JobActivityLog from '@/app/dashboard/my-jobs/components/job-history';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, serverTimestamp, query, where, limit, getDocs, doc, collectionGroup, updateDoc, writeBatch, documentId, setDoc, arrayUnion, addDoc } from 'firebase/firestore';
import type { Bid, Job, JobDocument, NDTServiceProvider, Client, Review, NDTTechnique, PlatformUser, Inspection } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success', 'Revisions Requested': 'destructive'
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
                                    <p className="text-xs text-muted-foreground">Submitted on {format(safeParseDate(bid.submittedDate)!, GLOBAL_DATE_FORMAT)}</p>
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

const BidsSummaryCard = ({ job, bids, onViewAllClick }: { job: Job, bids: Bid[], onViewAllClick: () => void }) => {
    const awardedBid = bids.find(b => b.status === 'Awarded');
    const latestBid = bids[0]; // Assumes bids are sorted by date
    const bidToShow = awardedBid || latestBid;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg">Bids</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                {bidToShow ? (
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Bidder</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>{bidToShow.providerName}</TableCell>
                                <TableCell>${bidToShow.amount.toLocaleString()}</TableCell>
                                <TableCell><Badge variant={bidToShow.status === 'Awarded' ? 'success' : 'secondary'}>{bidToShow.status}</Badge></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">No bids submitted yet.</p>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={onViewAllClick}>View Bids</Button>
            </CardFooter>
        </Card>
    );
};

const MessagesSummaryCard = ({ onOpenMessagesClick }: { onOpenMessagesClick: () => void }) => (
    <Card className="flex flex-col">
        <CardHeader><CardTitle className="text-lg">Messages</CardTitle></CardHeader>
        <CardContent className="flex-grow space-y-4 text-sm">
            <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8"><AvatarFallback>You</AvatarFallback></Avatar>
                <div className="rounded-lg bg-primary text-primary-foreground p-2"><p>Inspection is in progress now.</p></div>
            </div>
             <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8"><AvatarFallback>NDT</AvatarFallback></Avatar>
                <div className="rounded-lg bg-muted p-2"><p>Got it. Keep us updated.</p></div>
            </div>
        </CardContent>
        <CardFooter>
            <Input placeholder="Type a message..." onClick={onOpenMessagesClick} readOnly />
        </CardFooter>
    </Card>
);

const TechniciansSummaryCard = ({ job, onManageClick }: { job: Job, onManageClick: () => void }) => (
    <Card className="flex flex-col">
        <CardHeader><CardTitle className="text-lg">Technicians</CardTitle></CardHeader>
        <CardContent className="flex-grow space-y-2">
            {(job.assignedTechnicians && job.assignedTechnicians.length > 0) ? job.assignedTechnicians.map(tech => (
                <div key={tech.id} className="flex items-center gap-3 rounded-md border p-2">
                    <Avatar className="h-10 w-10"><AvatarFallback>{tech.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                    <div>
                        <p className="font-semibold">{tech.name}</p>
                        <p className="text-xs text-muted-foreground">{tech.level || 'Technician'}</p>
                    </div>
                </div>
            )) : <p className="text-sm text-muted-foreground">No technicians assigned yet.</p>}
        </CardContent>
        <CardFooter>
            <Button variant="outline" className="w-full" onClick={onManageClick}>Manage Technicians</Button>
        </CardFooter>
    </Card>
);

export default function JobDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') || 'client';
    const { toast } = useToast();
    const { firestore, user: authUser, isUserLoading: isAuthLoading } = useUser();
    
    const [activeTab, setActiveTab] = React.useState('overview');
    const [reviewingBid, setReviewingBid] = React.useState<(Bid & { provider: NDTServiceProvider }) | null>(null);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser]));

    const jobRef = useMemoFirebase(() => (firestore && id ? doc(firestore, 'jobs', id) : null), [firestore, id]);
    const { data: job, isLoading: isLoadingJob, error: jobError } = useDoc<Job>(jobRef);

    const bidsQuery = useMemoFirebase(() => (firestore && id ? query(collection(firestore, 'jobs', id, 'bids'), orderBy('submittedDate', 'desc')) : null), [firestore, id]);
    const { data: bids, isLoading: isLoadingBids } = useCollection<Bid>(bidsQuery);
    
    const { data: allCompanies, isLoading: isLoadingCompanies } = useCollection<any>(useMemoFirebase(() => (firestore ? collection(firestore, 'companies') : null), [firestore]));
    
    const { provider, auditor, client } = useMemo(() => {
        if (!allCompanies || !job) return { provider: null, auditor: null, client: null };
        return {
            provider: allCompanies.find(c => c.id === job.providerCompanyId),
            auditor: allCompanies.find(c => c.id === job.auditorCompanyId),
            client: allCompanies.find(c => c.id === job.clientCompanyId),
        };
    }, [allCompanies, job]);

    const isAuthorized = React.useMemo(() => {
        if (!job || !currentUserProfile) return false;
        if (role === 'admin') return true;
        if (role === 'client') return job.clientCompanyId === currentUserProfile.companyId;
        if (role === 'inspector') return job.status === 'Posted' || job.providerCompanyId === currentUserProfile.companyId;
        if (role === 'auditor') return job.auditorCompanyId === currentUserProfile.companyId;
        return false;
    }, [job, currentUserProfile, role]);

    const handleAwardBid = async (awardedBidId: string, providerCompanyId: string) => {
        if (!job || !bids || !firestore || !currentUserProfile) return;
        
        try {
            const batch = writeBatch(firestore);
            bids.forEach(bid => {
                const bidRef = doc(firestore, 'jobs', job.id, 'bids', bid.id);
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
            await batch.commit();

            toast({ title: "Job Awarded!", description: "The job has been awarded. The provider will be notified." });
            setReviewingBid(null);
        } catch (error) {
            console.error("Error awarding job:", error);
            toast({ variant: "destructive", title: "Awarding Failed" });
        }
    };
    
    const handleReviewBid = (bid: Bid) => {
        const provider = allCompanies?.find(p => p.id === bid.providerCompanyId);
        if (provider) setReviewingBid({ ...bid, provider });
    };

    const isLoading = isLoadingJob || isLoadingBids || isLoadingProfile || isLoadingCompanies;

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
    
    const isClient = role === 'client';
    const isAdmin = role === 'admin';

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
                    <Button variant="outline"><Edit className="mr-2"/>Edit Job</Button>
                    <Button variant="outline">Update Status</Button>
                    <Button variant="ghost" size="icon"><MoreVertical /></Button>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">Client:</span> {client?.name || job.client}</span>
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">Provider:</span> {provider?.name || 'N/A'}</span>
                <span className="text-muted-foreground"><span className="font-semibold text-foreground">Auditor:</span> {auditor?.name || 'N/A'}</span>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="bids">Bids</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="technicians">Technicians</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Job Overview</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex"><strong className="w-32">Job Information:</strong> <span className="text-muted-foreground">{job.description}</span></li>
                                    <li className="flex"><strong className="w-32">Location:</strong> <span className="text-muted-foreground">{job.location}</span></li>
                                    <li className="flex"><strong className="w-32">Scheduled Date:</strong> <span className="text-muted-foreground">{job.scheduledStartDate ? format(safeParseDate(job.scheduledStartDate)!, 'PPP') : 'Not Scheduled'}</span></li>
                                    <li className="flex items-start"><strong className="w-32 shrink-0">Attachments:</strong> 
                                        <div className="flex flex-wrap gap-2">
                                            {job.documents?.map(doc => (
                                                <Button key={doc.name} variant="outline" size="sm" className="h-auto py-1 px-2"><FileText className="mr-2 h-3.5 w-3.5"/>{doc.name}</Button>
                                            ))}
                                        </div>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                        <div className="grid lg:grid-cols-3 gap-6">
                           <BidsSummaryCard job={job} bids={bids || []} onViewAllClick={() => setActiveTab('bids')} />
                           <MessagesSummaryCard onOpenMessagesClick={() => setActiveTab('messages')} />
                           <TechniciansSummaryCard job={job} onManageClick={() => setActiveTab('technicians')} />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="bids" className="mt-6">
                    <BidsSection job={job} bids={bids || []} allCompanies={allCompanies || []} onReviewBid={handleReviewBid} isClient={isClient} isAdmin={isAdmin} />
                </TabsContent>
                 <TabsContent value="messages" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground p-8">Full chat implementation coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="technicians" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Assigned Technicians</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground p-8">Technician management UI coming soon.</p>
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
        </div>
    );
}
