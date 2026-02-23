

'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Building, Briefcase, BellRing, Users, ShieldCheck, BarChart3, Eye, FileCheck, CheckCircle, Clock, Calendar, AlarmClock, Wrench, History, Check, X, FileText, Settings2, Award, Database, Gavel } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Bar, XAxis, YAxis, CartesianGrid, BarChart, ResponsiveContainer, Line, LineChart, LabelList } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { useMobile } from "@/hooks/use-mobile";
import React, { useState, useEffect, useMemo } from "react";
import { format, differenceInDays, isAfter, isToday, isWithinInterval, isValid } from "date-fns";
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { writeBatch, doc, collection, query, where, getDoc, orderBy, limit, setDoc, collectionGroup, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { jobs, inspectorAssets, allUsers, userAuditLog, jobAuditLog, billingAuditLog, reviews, subscriptions, clientData, payments, jobPayments, jobChats, serviceProviders, auditFirms, NDTTechniques, manufacturersData, clientAssets, inspectionsData, productsData, notifications } from "@/lib/seed-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import type { Job, Review, PlatformUser, Subscription, Payment, JobPayment, UserAuditLog, NDTServiceProvider, AuditFirm, Client, Bid, Inspection } from "@/lib/types";


// --- SHARED COMPONENTS & CONFIGS ---

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success', 'Revisions Requested': 'destructive'
};

const constructUrl = (base: string, searchParams: URLSearchParams) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${base}?${params.toString()}`;
};

const getRelativeDateBadge = (date: Date, today: Date | undefined) => {
    if (!today) return null;
    const diff = differenceInDays(date, today);
    if (diff < 0) return null; // In the past
    if (diff === 0) return <Badge>Today</Badge>;
    if (diff === 1) return <Badge variant="secondary">Tomorrow</Badge>;
    if (diff > 1 && diff <= 7) return <Badge variant="outline">in {diff} days</Badge>;
    return null;
};

const ClientFormattedDate = ({ timestamp, formatString = 'dd-MMM p' }: { timestamp: any, formatString?: string }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if (!timestamp) return;
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        setFormattedDate(format(date, formatString));
    }, [timestamp, formatString]);

    return <>{formattedDate || '...'}</>;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  footer,
  color,
  iconBg,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  footer?: React.ReactNode;
  color: string;
  iconBg: string;
}) => (
  <Card className="relative overflow-hidden">
    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", color)} />
    <CardContent className="p-4 flex items-center justify-between ml-1.5">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {footer && <p className="text-xs text-muted-foreground mt-1">{footer}</p>}
      </div>
      <div className={cn("p-3 rounded-full text-white", iconBg)}>
        <Icon className="h-6 w-6" />
      </div>
    </CardContent>
  </Card>
);

// --- CLIENT DASHBOARD ---
const clientChartConfig = {
  operational: { label: "Operational", color: "hsl(var(--chart-2))" },
  inspection: { label: "Requires Inspection", color: "hsl(var(--chart-4))" },
  repair: { label: "Under Repair", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const ClientDashboard = () => {
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const [today, setToday] = useState<Date | undefined>(undefined);
    const { user: authUser, firestore } = useFirebase();
    const [userProfile, setUserProfile] = useState<PlatformUser | null>(null);

    useEffect(() => {
        setToday(new Date());
        if (authUser && firestore) {
            getDoc(doc(firestore, 'users', authUser.uid)).then(docSnap => {
                if (docSnap.exists()) setUserProfile(docSnap.data() as PlatformUser);
            });
        }
    }, [authUser, firestore]);

    const jobsQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'jobs'), where('clientCompanyId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const assetsQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'assets'), where('companyId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    
    const { data: clientJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    const { data: currentClientAssets, isLoading: isLoadingAssets } = useCollection<any>(assetsQuery);
    
    const stats = useMemo(() => {
        const totalAssets = currentClientAssets?.length || 0;
        const assetsRequiringInspection = currentClientAssets?.filter(a => a.status === 'Requires Inspection').length || 0;
        const reportsForReview = clientJobs?.filter(j => j.status === 'Client Review' || j.status === 'Audit Approved').length || 0;
        const activeJobs = clientJobs?.filter(j => ['In Progress', 'Scheduled', 'Assigned'].includes(j.status)).length || 0;
        return { totalAssets, assetsRequiringInspection, reportsForReview, activeJobs };
    }, [clientJobs, currentClientAssets]);

    const jobsForReview = useMemo(() => clientJobs?.filter(j => j.status === 'Client Review' || j.status === 'Audit Approved').slice(0, 5) || [], [clientJobs]);
    
    const assetStatusByLocationData = useMemo(() => {
        if (!currentClientAssets) return [];
        const locations = [...new Set(currentClientAssets.map(a => a.location))];
        return locations.map(location => {
            const assetsInLocation = currentClientAssets.filter(a => a.location === location);
            return {
                location: location,
                operational: assetsInLocation.filter(a => a.status === 'Operational').length,
                inspection: assetsInLocation.filter(a => a.status === 'Requires Inspection').length,
                repair: assetsInLocation.filter(a => a.status === 'Under Repair').length,
            };
        });
    }, [currentClientAssets]);
    
    const schedule = useMemo(() => {
        if (!today || !clientJobs) return [];
        const nextSevenDays = new Date(today);
        nextSevenDays.setDate(today.getDate() + 7);
        
        return clientJobs
            .filter(j => j.scheduledStartDate && isWithinInterval(new Date(j.scheduledStartDate), { start: today, end: nextSevenDays }))
            .sort((a, b) => new Date(a.scheduledStartDate!).getTime() - new Date(b.scheduledStartDate!).getTime());
    }, [clientJobs, today]);
    
    const getNextStep = (status: Job['status']) => {
        switch(status) {
            case 'Client Review':
                return <Badge variant="secondary">Review Report</Badge>;
            case 'Audit Approved':
                return <Badge variant="success">Final Approval</Badge>;
            default:
                return <Badge variant="outline">Review</Badge>;
        }
    };
    
    if (isLoadingJobs || isLoadingAssets || !userProfile) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Managed Assets" 
                    value={stats.totalAssets} 
                    icon={Building} 
                    footer="Assets in your portfolio"
                    color="bg-card-color-1"
                    iconBg="bg-card-color-1"
                />
                 <StatCard 
                    title="Requires Inspection" 
                    value={stats.assetsRequiringInspection} 
                    icon={AlarmClock} 
                    footer="Assets needing attention"
                    color="bg-card-color-4"
                    iconBg="bg-card-color-4"
                />
                <StatCard 
                    title="Reports For Review" 
                    value={stats.reportsForReview} 
                    icon={FileCheck} 
                    footer="Awaiting your approval"
                    color="bg-card-color-3"
                    iconBg="bg-card-color-3"
                />
                <StatCard 
                    title="Active Jobs" 
                    value={stats.activeJobs} 
                    icon={Briefcase} 
                    footer="Jobs in progress or scheduled"
                    color="bg-card-color-2"
                    iconBg="bg-card-color-2"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Reports Awaiting Review</CardTitle>
                    <CardDescription>These jobs are awaiting your review and approval to move forward.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {jobsForReview.map(job => (
                                <Card key={job.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base">{job.title}</CardTitle>
                                            {getNextStep(job.status)}
                                        </div>
                                        <CardDescription>ID: <span className="font-bold text-foreground">{job.id}</span></CardDescription>
                                    </CardHeader>
                                    <CardFooter>
                                        <Button asChild variant="outline" size="sm" className="w-full">
                                            <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>Review Job</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                                {jobsForReview.length === 0 && (
                                <div className="h-24 text-center text-muted-foreground flex items-center justify-center">No jobs require your action at this time.</div>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job ID</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Next Step</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobsForReview.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{serviceProviders.find(p => p.id === job.providerId)?.name || 'N/A'}</TableCell>
                                        <TableCell>{getNextStep(job.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>Review Job</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {jobsForReview.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No jobs require your action at this time.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Upcoming Job Schedule (Next 7 Days)</CardTitle>
                    <CardDescription>Your upcoming scheduled jobs.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {schedule.map(job => (
                                <Card key={job.id}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{job.title}</CardTitle>
                                        <CardDescription>
                                            <div className="flex items-center gap-2">
                                                <span>{job.scheduledStartDate ? format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                                {job.scheduledStartDate && getRelativeDateBadge(new Date(job.scheduledStartDate), today)}
                                            </div>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-1">
                                        <p><strong>Job ID:</strong> <span className="font-extrabold">{job.id}</span></p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild variant="outline" size="sm" className="w-full">
                                            <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>View Job</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {schedule.length === 0 && (
                                <div className="h-24 text-center text-muted-foreground flex items-center justify-center">No jobs scheduled in the next 7 days.</div>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Job ID</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedule.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span>{job.scheduledStartDate ? format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                                {job.scheduledStartDate && today && isToday(new Date(job.scheduledStartDate)) && <Badge>Today</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                        <TableCell>{job.title}</TableCell>
                                        <TableCell>{serviceProviders.find(p => p.id === job.providerId)?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>View Job</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {schedule.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">No jobs scheduled in the next 7 days.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Asset Status by Location</CardTitle>
                    <CardDescription>An overview of your fleet's operational status across all sites.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={clientChartConfig} className="h-[300px] w-full">
                        <BarChart accessibilityLayer data={assetStatusByLocationData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="location"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.substring(0, 10)}
                                angle={-30}
                                textAnchor="end"
                                height={50}
                            />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="operational" stackId="a" fill="var(--color-operational)" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="inspection" stackId="a" fill="var(--color-inspection)" />
                            <Bar dataKey="repair" stackId="a" fill="var(--color-repair)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
};


// --- INSPECTOR DASHBOARD ---
const InspectorDashboard = () => {
    const searchParams = useSearchParams();
    const [today, setToday] = useState<Date | undefined>(undefined);
    const { user: authUser, firestore } = useFirebase();
    const [userProfile, setUserProfile] = useState<PlatformUser | null>(null);

    useEffect(() => {
        setToday(new Date());
        if (authUser && firestore) {
            getDoc(doc(firestore, 'users', authUser.uid)).then(docSnap => {
                if (docSnap.exists()) setUserProfile(docSnap.data() as PlatformUser);
            });
        }
    }, [authUser, firestore]);
    
    const jobsQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'jobs'), where('providerId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const equipmentQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'equipment'), where('providerId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const myBidsQuery = useMemoFirebase(() => authUser ? query(collectionGroup(firestore, 'bids'), where('inspectorId', '==', authUser.uid)) : null, [firestore, authUser]);

    const { data: providerJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    const { data: providerEquipment, isLoading: isLoadingEquip } = useCollection<any>(equipmentQuery);
    const { data: myBids, isLoading: isLoadingBids } = useCollection<Bid>(myBidsQuery);

    const stats = useMemo(() => {
        const openBids = myBids?.filter(b => ['Submitted', 'Shortlisted'].includes(b.status)) || [];
        return {
            activeAssignments: providerJobs?.filter(j => j.status === 'In Progress').length || 0,
            openBidsCount: openBids.length,
            equipmentAlerts: providerEquipment?.filter(e => e.status === 'Calibration Due' || e.status === 'Out of Service').length || 0,
            reportsToSubmit: providerJobs?.filter(j => (j.status === 'In Progress' && j.scheduledEndDate && isAfter(new Date(), new Date(j.scheduledEndDate))) || j.status === 'Completed').length || 0,
    }}, [providerJobs, providerEquipment, myBids]);

    const schedule = useMemo(() => {
        if (!today || !providerJobs) return [];
        const nextSevenDays = new Date(today);
        nextSevenDays.setDate(today.getDate() + 7);
        
        return providerJobs
            .filter(j => j.scheduledStartDate && isWithinInterval(new Date(j.scheduledStartDate), { start: today, end: nextSevenDays }))
            .sort((a, b) => new Date(a.scheduledStartDate!).getTime() - new Date(b.scheduledStartDate!).getTime());
    }, [providerJobs, today]);

    if (isLoadingJobs || isLoadingEquip || isLoadingBids || !userProfile) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <StatCard 
                    title="Active Assignments" 
                    value={stats.activeAssignments} 
                    icon={Briefcase} 
                    footer="Jobs currently in progress"
                    color="bg-card-color-1"
                    iconBg="bg-card-color-1"
                />
                 <StatCard 
                    title="Open Bids" 
                    value={stats.openBidsCount} 
                    icon={Gavel} 
                    footer="Awaiting client decision"
                    color="bg-card-color-2"
                    iconBg="bg-card-color-2"
                />
                 <StatCard 
                    title="Reports to Submit" 
                    value={stats.reportsToSubmit} 
                    icon={FileText} 
                    footer="Awaiting report submission"
                    color="bg-card-color-3"
                    iconBg="bg-card-color-3"
                />
                 <StatCard 
                    title="Equipment Alerts" 
                    value={stats.equipmentAlerts} 
                    icon={Wrench} 
                    footer="Needs calibration or service"
                    color="bg-card-color-4"
                    iconBg="bg-card-color-4"
                />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your Schedule (Next 7 Days)</CardTitle>
                    <CardDescription>Upcoming job assignments for your team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Technicians</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.map(job => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{job.scheduledStartDate ? format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT) : 'N/A'}</span>
                                            {job.scheduledStartDate && today && isToday(new Date(job.scheduledStartDate)) && <Badge>Today</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                    <TableCell>{job.title}</TableCell>
                                    <TableCell>{job.client}</TableCell>
                                    <TableCell>{job.technicianIds?.length || 0} assigned</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>View Job</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {schedule.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center">No jobs scheduled in the next 7 days.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};


// --- AUDITOR DASHBOARD ---
const AuditorDashboard = () => {
    const searchParams = useSearchParams();
    const [today, setToday] = useState<Date | undefined>(undefined);
    const { firestore, user } = useFirebase();

    useEffect(() => { setToday(new Date()) }, []);
    
    const jobsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'jobs'), where('workflow', 'in', ['level3', 'auto']));
    }, [firestore, user]);

    const { data: jobs, isLoading } = useCollection<Job>(jobsQuery);

    const auditQueue = useMemo(() => jobs?.filter(j => j.status === 'Report Submitted') || [], [jobs]);
    const auditsCompleted = useMemo(() => jobs?.filter(j => j.status === 'Audit Approved').length || 0, [jobs]);
    const averageReviewTime = "22h"; // Placeholder

    const getSafeDate = (ts: any): Date | null => {
        if (!ts) return null;
        if (ts.toDate) return ts.toDate(); // Firestore Timestamp
        const d = new Date(ts);
        return isValid(d) ? d : null;
    };
    
    const getSortableTimestamp = (job: Job): number => {
        const historyItem = job.history?.find(h => h.statusChange === 'Report Submitted');
        const date = getSafeDate(historyItem?.timestamp);
        return date ? date.getTime() : 0;
    };
    
     if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <StatCard 
                    title="Reports in Queue" 
                    value={auditQueue.length} 
                    icon={Clock} 
                    footer="Awaiting your review"
                    color="bg-card-color-1"
                    iconBg="bg-card-color-1"
                />
                 <StatCard 
                    title="Average Review Time" 
                    value={averageReviewTime} 
                    icon={Eye} 
                    footer="Last 30 days"
                    color="bg-card-color-2"
                    iconBg="bg-card-color-2"
                />
                <StatCard 
                    title="Audits Completed (7d)" 
                    value={auditsCompleted} 
                    icon={CheckCircle} 
                    footer="Reports approved this week"
                    color="bg-card-color-3"
                    iconBg="bg-card-color-3"
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your Audit Queue</CardTitle>
                    <CardDescription>Jobs that require your review and approval. Sorted by the oldest first.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job ID</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditQueue.sort((a,b) => getSortableTimestamp(a) - getSortableTimestamp(b)).map(job => {
                                const reportId = job.inspections?.find(insp => insp.report)?.report?.id;
                                const submittedDate = getSafeDate(job.history?.find(h => h.statusChange === 'Report Submitted')?.timestamp);

                                return (
                                <TableRow key={job.id}>
                                    <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{serviceProviders.find(p => p.id === job.providerId)?.name || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="secondary">{job.techniques.join(', ')}</Badge></TableCell>
                                    <TableCell>{submittedDate ? format(submittedDate, GLOBAL_DATE_FORMAT) : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        {reportId ? (
                                            <Button asChild>
                                                <Link href={constructUrl(`/dashboard/reports/${reportId}`, searchParams)}>Audit Report</Link>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" disabled>No Report</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )})}
                            {auditQueue.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center">Your audit queue is empty. Great job!</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};


// --- ADMIN DASHBOARD ---
const userGrowthChartConfig = { users: { label: "New Users", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

const getLogIcon = (action: string) => {
    if (action.includes('Invited')) return <Users className="h-4 w-4" />;
    if (action.includes('Disabled')) return <X className="h-4 w-4" />;
    if (action.includes('Promotion')) return <Award className="h-4 w-4" />;
    return <History className="h-4 w-4" />;
}

const AdminDashboard = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSeeding, setIsSeeding] = useState(false);
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const role = searchParams.get('role');
    
    const isAdminUser = user && (user.uid === 'i947NWP5Hfb3Tpe5P6XcrjODRIJ2' || user.uid === '8ulGMzDhV1VgocwqptGCpV6Dkkl1');
    const isReady = firestore && user && role === 'admin' && isAdminUser;
    
    useEffect(() => {
        if (role === 'admin' && user && !isAdminUser) {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'You do not have permission to view the admin dashboard.',
            });
            router.replace('/dashboard');
        }
    }, [role, user, isAdminUser, router, toast]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<PlatformUser>(useMemoFirebase(() => isReady ? collection(firestore, 'users') : null, [isReady, firestore]));
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<any>(useMemoFirebase(() => isReady ? collection(firestore, 'companies') : null, [isReady, firestore]));
    const { data: jobsData, isLoading: isLoadingJobs } = useCollection<Job>(useMemoFirebase(() => isReady ? collection(firestore, 'jobs') : null, [isReady, firestore]));
    const { data: userAuditLog, isLoading: isLoadingAuditLog } = useCollection<UserAuditLog>(useMemoFirebase(() => isReady ? query(collection(firestore, 'userAuditLogs'), orderBy('timestamp', 'desc'), limit(4)) : null, [isReady, firestore]));
    
    const { data: allReviews, isLoading: isLoadingReviews } = useCollection<Review>(useMemoFirebase(() => isReady ? collection(firestore, 'reviews') : null, [isReady, firestore]));
    const pendingReviews = useMemo(() => allReviews?.filter(r => r.status === 'Pending').length || 0, [allReviews]);
    
    const handleSeedDatabase = async () => {
        if (!firestore) {
            toast({ variant: "destructive", title: "Error", description: "Firestore is not available." });
            return;
        }
        setIsSeeding(true);
        toast({ title: "Database Seeding Started", description: "This may take a minute. Check the browser console for detailed progress." });
        console.clear();
        console.log("%c--- Starting Database Seed ---", "color: #3B82F6; font-size: 16px; font-weight: bold;");

        try {
            const batch = writeBatch(firestore);

            const safeNewDate = (dateString?: string): Date | undefined => {
                if (!dateString) return undefined;
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? undefined : date;
            };

            console.log(`[SEED] Preparing: techniques, manufacturers, products...`);
            NDTTechniques.forEach(item => batch.set(doc(firestore, 'techniques', item.id), item));
            manufacturersData.forEach(item => batch.set(doc(firestore, 'manufacturers', item.id), item));
            productsData.forEach(item => batch.set(doc(firestore, 'products', item.id), item));
            console.log(`[SEED] ✅ Prepared simple collections.`);

            console.log(`[SEED] Preparing: companies...`);
            [...clientData, ...serviceProviders, ...auditFirms].forEach(item => batch.set(doc(firestore, 'companies', item.id), item));
            console.log(`[SEED] ✅ Prepared companies.`);

            console.log(`[SEED] Preparing: users...`);
            allUsers.forEach(user => {
                const { password, ...userToSave } = user;
                const createdAtDate = safeNewDate(user.createdAt as string);
                batch.set(doc(firestore, 'users', user.id), {
                    ...userToSave,
                    createdAt: createdAtDate || serverTimestamp()
                });
            });
            console.log(`[SEED] ✅ Prepared users.`);
            
            console.log(`[SEED] Preparing: assets, equipment...`);
            clientAssets.forEach(asset => {
                const assetWithDates = {
                    ...asset,
                    history: (asset.history || []).map(h => ({ ...h, timestamp: safeNewDate(h.timestamp) || serverTimestamp() })),
                    installationDate: safeNewDate(asset.installationDate),
                    createdAt: safeNewDate(asset.createdAt as string || undefined),
                    modifiedAt: safeNewDate(asset.modifiedAt as string || undefined)
                };
                batch.set(doc(firestore, 'assets', asset.id), assetWithDates);
            });
            inspectorAssets.forEach(equip => {
                 const equipWithDates = {
                    ...equip,
                    history: (equip.history || []).map(h => ({ ...h, timestamp: safeNewDate(h.timestamp) || serverTimestamp() })),
                    createdAt: safeNewDate(equip.createdAt as string || undefined),
                    modifiedAt: safeNewDate(equip.modifiedAt as string || undefined)
                 };
                 batch.set(doc(firestore, 'equipment', equip.id), equipWithDates);
            });
            console.log(`[SEED] ✅ Prepared assets and equipment.`);
            
            console.log(`[SEED] Preparing: subscriptions, payments, reviews...`);
            subscriptions.forEach(sub => batch.set(doc(firestore, 'subscriptions', sub.id), { ...sub, startDate: safeNewDate(sub.startDate), endDate: safeNewDate(sub.endDate) }));
            payments.forEach(p => batch.set(doc(firestore, 'payments', p.id), { ...p, date: safeNewDate(p.date) }));
            jobPayments.forEach(p => batch.set(doc(firestore, 'jobPayments', p.id), { ...p, paidOn: safeNewDate(p.paidOn) }));
            reviews.forEach(r => batch.set(doc(firestore, 'reviews', r.id), { ...r, date: safeNewDate(r.date as string) }));
            console.log(`[SEED] ✅ Prepared subscriptions, payments, reviews.`);

            console.log(`[SEED] Preparing: audit logs...`);
            userAuditLog.forEach(log => batch.set(doc(firestore, 'userAuditLogs', log.id), { ...log, timestamp: safeNewDate(log.timestamp as string) }));
            jobAuditLog.forEach(log => batch.set(doc(firestore, 'jobAuditLogs', log.id), { ...log, timestamp: safeNewDate(log.timestamp as string) }));
            billingAuditLog.forEach(log => batch.set(doc(firestore, 'billingAuditLogs', log.id), { ...log, timestamp: safeNewDate(log.timestamp as string) }));
            console.log(`[SEED] ✅ Prepared audit logs.`);
            
            console.log(`[SEED] Preparing: notifications...`);
            notifications.forEach(n => {
                const notifRef = doc(firestore, 'users', n.userId, 'notifications', n.id);
                batch.set(notifRef, { ...n, timestamp: safeNewDate(n.timestamp) });
            });
            console.log(`[SEED] ✅ Prepared notifications.`);

            console.log(`[SEED] Preparing: jobs and subcollections...`);
            jobs.forEach(job => {
                const { bids, inspections, ...jobData } = job;
                const jobRef = doc(firestore, 'jobs', job.id);
                
                const jobDataWithDates = {
                    ...jobData,
                    postedDate: safeNewDate(jobData.postedDate as string),
                    createdAt: safeNewDate(jobData.createdAt as string),
                    modifiedAt: safeNewDate(jobData.modifiedAt as string),
                    bidExpiryDate: safeNewDate(jobData.bidExpiryDate as string),
                    scheduledStartDate: safeNewDate(jobData.scheduledStartDate as string),
                    scheduledEndDate: safeNewDate(jobData.scheduledEndDate as string),
                    history: (jobData.history || []).map(h => ({...h, timestamp: safeNewDate(h.timestamp as string)}))
                };
                
                batch.set(jobRef, jobDataWithDates);

                bids.forEach(bid => {
                    const bidRef = doc(firestore, 'jobs', bid.jobId, 'bids', bid.id);
                    batch.set(bidRef, { ...bid, submittedDate: safeNewDate(bid.submittedDate) });
                });

                jobChats.filter(c => c.jobId === job.id).forEach(chat => {
                    chat.messages.forEach(msg => {
                        const msgRef = doc(firestore, 'jobs', chat.jobId, 'messages', msg.id);
                        batch.set(msgRef, { ...msg, timestamp: safeNewDate(msg.timestamp) });
                    });
                });
            });
            console.log(`[SEED] ✅ Prepared: jobs and subcollections.`);

            console.log(`[SEED] Preparing: inspections and reports...`);
            inspectionsData.forEach(inspection => {
                if (!inspection.assetId || inspection.assetId === 'N/A') return;
                const { report, ...inspectionData } = inspection;
                const inspectionRef = doc(firestore, 'assets', inspection.assetId, 'inspections', inspection.id);
                
                const inspectionDataWithDate = {
                    ...inspectionData,
                    date: safeNewDate(inspectionData.date),
                    report: report ? {
                        ...report,
                        submittedOn: safeNewDate(report.submittedOn),
                        documents: report.documents || [],
                    } : undefined
                };
                batch.set(inspectionRef, inspectionDataWithDate);

                if (report) {
                    const reportRef = doc(firestore, 'reports', report.id);
                    batch.set(reportRef, { ...report, submittedOn: safeNewDate(report.submittedOn) });
                }
            });
            console.log(`[SEED] ✅ Prepared: inspections and reports.`);

            const adminUser = allUsers.find(u => u.email === 'admin@ndtexchange.com');
            if (adminUser) batch.set(doc(firestore, 'roles_admin', adminUser.id), { isAdmin: true });
            const seyonUser = allUsers.find(u => u.email === 'seyonnexalabs@gmail.com');
            if (seyonUser) batch.set(doc(firestore, 'roles_admin', seyonUser.id), { isAdmin: true });

            await batch.commit();

            toast({
                title: "Database Seeded Successfully!",
                description: "All collections have been populated. Please refresh the page.",
            });
        } catch (error: any) {
            console.error("Seeding process stopped due to an error.", error);
            toast({
                variant: 'destructive',
                title: "Seeding Failed",
                description: `An error occurred: ${error.message}`,
            });
        } finally {
            setIsSeeding(false);
            console.log("%c--- Database Seed Finished ---", "color: #3B82F6; font-size: 16px; font-weight: bold;");
        }
    };
    
    const stats = {
        totalUsers: users?.length || 0,
        totalProviders: companies?.filter(c => c.type === 'Provider').length || 0,
        pendingReviews: pendingReviews,
        activeJobs: jobsData?.filter(j => j.status === 'Posted' || j.status === 'Assigned' || j.status === 'In Progress').length || 0,
    };

    const userGrowthData = useMemo(() => {
        if (!users) return [];
        
        const usersByMonth: { [key: string]: number } = {};
        const monthOrder: string[] = [];

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            usersByMonth[monthKey] = 0;
            monthOrder.push(monthKey);
        }
        
        users.forEach(user => {
            if (!user.createdAt) return;
            const date = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
            if (isValid(date)) {
                const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
                if (monthKey in usersByMonth) {
                    usersByMonth[monthKey]++;
                }
            }
        });

        return monthOrder.map(month => ({
            name: month,
            users: usersByMonth[month],
        }));
    }, [users]);
    
    if (isLoadingUsers || isLoadingCompanies || isLoadingJobs || isLoadingReviews || isLoadingAuditLog) {
        return <DashboardSkeleton />;
    }

    if (role === 'admin' && user && !isAdminUser) {
        return (
            <div className="flex h-full w-full items-center justify-center p-10">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view the admin dashboard.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
         <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Users" 
                    value={stats.totalUsers} 
                    icon={Users} 
                    footer="+5 this month"
                    color="bg-card-color-1"
                    iconBg="bg-card-color-1"
                />
                <StatCard 
                    title="Total Providers" 
                    value={stats.totalProviders} 
                    icon={ShieldCheck} 
                    footer="+2 new this month"
                    color="bg-card-color-2"
                    iconBg="bg-card-color-2"
                />
                <StatCard 
                    title="Active Jobs" 
                    value={stats.activeJobs} 
                    icon={Briefcase} 
                    footer="In marketplace or in progress"
                    color="bg-card-color-3"
                    iconBg="bg-card-color-3"
                />
                 <StatCard 
                    title="Pending Reviews" 
                    value={stats.pendingReviews} 
                    icon={Eye} 
                    footer="Awaiting moderation"
                    color="bg-card-color-4"
                    iconBg="bg-card-color-4"
                />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">New User Growth</CardTitle>
                        <CardDescription>Monthly new user registrations on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={userGrowthChartConfig} className="h-[250px] w-full">
                            <BarChart data={userGrowthData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="users" fill="var(--color-users)" radius={4}>
                                    <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><History /> Recent Activity</CardTitle>
                        <CardDescription>A log of recent user management changes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-6">
                            <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                            {userAuditLog?.map(log => (
                                <div key={log.id} className="relative mb-6 pl-8">
                                    <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                        <div className="text-primary">{getLogIcon(log.action)}</div>
                                    </div>
                                    <p className="text-sm font-medium">{log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.targetUserName} ({log.targetCompany})</p>
                                    <ClientFormattedDate timestamp={log.timestamp} />
                                </div>
                            ))}
                        </div>
                         <Button asChild variant="secondary" className="w-full mt-4">
                            <Link href={constructUrl('/dashboard/audit-log', searchParams)}>View Full Audit Log</Link>
                        </Button>
                    </CardContent>
                </Card>
             </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Database Management
                    </CardTitle>
                    <CardDescription>
                        Use this tool to populate your Firestore database with the initial placeholder data. This is useful for development and testing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive">
                        <strong>Warning:</strong> This will overwrite any existing data in the collections with the same document IDs.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSeedDatabase} disabled={!firestore || isSeeding}>
                        {isSeeding ? 'Seeding...' : 'Seed Database'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28" />
            ))}
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    </div>
);


// --- MAIN DASHBOARD COMPONENT ---
export default function DashboardPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    const renderDashboardByRole = () => {
        switch (role) {
            case 'inspector': return <InspectorDashboard />;
            case 'admin': return <AdminDashboard />;
            case 'auditor': return <AuditorDashboard />;
            case 'client': default: return <ClientDashboard />;
        }
    };

    return <div>{renderDashboardByRole()}</div>;
}
