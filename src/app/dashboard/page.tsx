
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
import { PieChart, Pie, Cell, Tooltip, Bar, XAxis, YAxis, CartesianGrid, BarChart, ResponsiveContainer, LabelList } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import Link from 'next/link';
import { useMobile } from "@/hooks/use-mobile";
import React, { useState, useEffect, useMemo } from "react";
import { format, differenceInDays, isAfter, isToday, isWithinInterval, isValid } from "date-fns";
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, cn, safeParseDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { writeBatch, doc, collection, query, where, getDoc, orderBy, limit, setDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from "lucide-react";
import type { Job, Review, PlatformUser, Subscription, Payment, JobPayment, UserAuditLog, NDTServiceProvider, AuditFirm, Client, Bid, Inspection } from '@/lib/types';


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

const DashboardSkeleton = () => (
    <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28" />
            ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
    </div>
);


// --- CLIENT DASHBOARD ---
const assetStatusChartConfig = {
  operational: { label: "Operational", color: "hsl(var(--chart-2))" },
  inspection: { label: "Requires Inspection", color: "hsl(var(--chart-4))" },
  repair: { label: "Under Repair", color: "hsl(var(--chart-5))" },
  decommissioned: { label: "Decommissioned", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const jobStatusChartConfig = {
  count: {
    label: "Jobs",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


const ClientDashboard = () => {
    const searchParams = useSearchParams();
    const isMobile = useMobile();
    const [today, setToday] = useState<Date | undefined>(undefined);
    const { user: authUser, firestore } = useFirebase();

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );

    useEffect(() => {
        setToday(new Date());
    }, []);

    const jobsQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'jobs'), where('clientCompanyId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const assetsQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'assets'), where('companyId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const providersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'companies'), where('type', '==', 'Provider')) : null, [firestore]);
    
    const { data: clientJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    const { data: currentClientAssets, isLoading: isLoadingAssets } = useCollection<any>(assetsQuery);
    const { data: serviceProviders, isLoading: isLoadingProviders } = useCollection<NDTServiceProvider>(providersQuery);
    
    const stats = useMemo(() => {
        const totalAssets = currentClientAssets?.length || 0;
        const assetsRequiringInspection = currentClientAssets?.filter(a => a.status === 'Requires Inspection').length || 0;
        const reportsForReview = clientJobs?.filter(j => j.status === 'Client Review' || j.status === 'Audit Approved').length || 0;
        const activeJobs = clientJobs?.filter(j => ['In Progress', 'Scheduled', 'Assigned'].includes(j.status)).length || 0;
        return { totalAssets, assetsRequiringInspection, reportsForReview, activeJobs };
    }, [clientJobs, currentClientAssets]);

    const jobsForReview = useMemo(() => clientJobs?.filter(j => j.status === 'Client Review' || j.status === 'Audit Approved').slice(0, 5) || [], [clientJobs]);
    
    const assetStatusData = useMemo(() => {
        if (!currentClientAssets) return [];
        const statusCounts: {[key: string]: number} = {
            operational: 0,
            inspection: 0,
            repair: 0,
            decommissioned: 0,
        };

        currentClientAssets.forEach(asset => {
            if (asset.status === 'Operational') statusCounts.operational++;
            else if (asset.status === 'Requires Inspection') statusCounts.inspection++;
            else if (asset.status === 'Under Repair') statusCounts.repair++;
            else if (asset.status === 'Decommissioned') statusCounts.decommissioned++;
        });

        return Object.entries(statusCounts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name: name,
                value,
                fill: `var(--color-${name})`,
            }));
    }, [currentClientAssets]);
    
    const jobStatusData = useMemo(() => {
        if (!clientJobs) return [];
        const statusOrder: Job['status'][] = ['Posted', 'Assigned', 'Scheduled', 'In Progress', 'Report Submitted', 'Under Audit', 'Audit Approved', 'Client Review', 'Client Approved', 'Completed'];
        const statusCounts = clientJobs.reduce((acc, job) => {
            acc[job.status] = (acc[job.status] || 0) + 1;
            return acc;
        }, {} as Record<Job['status'], number>);
        
        return statusOrder
            .filter(status => statusCounts[status] > 0)
            .map(status => ({ name: status, count: statusCounts[status] }));
    }, [clientJobs]);
    
    const schedule = useMemo(() => {
        if (!today || !clientJobs) return [];
        const nextSevenDays = new Date(today);
        nextSevenDays.setDate(today.getDate() + 7);
        
        return clientJobs
            .filter(j => {
                const startDate = safeParseDate(j.scheduledStartDate);
                return startDate && isWithinInterval(startDate, { start: today, end: nextSevenDays });
            })
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
    
    const isLoading = isLoadingJobs || isLoadingAssets || isLoadingProviders || isLoadingProfile;
    if (isLoading) {
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
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Asset Health Overview</CardTitle>
                        <CardDescription>A summary of your asset portfolio's current status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={assetStatusChartConfig} className="mx-auto aspect-square h-[250px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie data={assetStatusData} dataKey="value" nameKey="name" innerRadius={60}>
                                <LabelList
                                    dataKey="value"
                                    className="fill-background"
                                    stroke="none"
                                    fontSize={12}
                                />
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Job Status Breakdown</CardTitle>
                        <CardDescription>An overview of jobs currently in the workflow.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={jobStatusChartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={jobStatusData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} angle={-30} textAnchor="end" height={60} interval={0} fontSize={10} />
                                <YAxis />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                                    <LabelList position="top" offset={4} className="fill-foreground" fontSize={12} />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
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
                                        <TableCell>{serviceProviders?.find(p => p.id === job.providerCompanyId)?.name || 'N/A'}</TableCell>
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
                                        <TableCell>{serviceProviders?.find(p => p.id === job.providerCompanyId)?.name || 'N/A'}</TableCell>
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
        </div>
    );
};


// --- INSPECTOR DASHBOARD ---
const InspectorDashboard = () => {
    const searchParams = useSearchParams();
    const [today, setToday] = useState<Date | undefined>(undefined);
    const { user: authUser, firestore } = useFirebase();

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser])
    );
    
    useEffect(() => {
        setToday(new Date());
    }, []);
    
    const jobsQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'jobs'), where('providerCompanyId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const equipmentQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'equipment'), where('providerId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const myBidsQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'bids'), where('inspectorId', '==', authUser.uid)) : null, [firestore, authUser]);

    const { data: providerJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    const { data: providerEquipment, isLoading: isLoadingEquip } = useCollection<any>(equipmentQuery);
    const { data: myBids, isLoading: isLoadingBids } = useCollection<Bid>(myBidsQuery);

    const stats = useMemo(() => {
        const openBids = myBids?.filter(b => ['Submitted', 'Shortlisted'].includes(b.status)) || [];
        return {
            activeAssignments: providerJobs?.filter(j => j.status === 'In Progress').length || 0,
            openBidsCount: openBids.length,
            equipmentAlerts: providerEquipment?.filter(e => e.status === 'Calibration Due' || e.status === 'Out of Service').length || 0,
            reportsToSubmit: providerJobs?.filter(j => {
                const endDate = safeParseDate(j.scheduledEndDate);
                return (j.status === 'In Progress' && endDate && isAfter(new Date(), endDate)) || j.status === 'Completed';
            }).length || 0,
    }}, [providerJobs, providerEquipment, myBids]);

    const schedule = useMemo(() => {
        if (!today || !providerJobs) return [];
        const nextSevenDays = new Date(today);
        nextSevenDays.setDate(today.getDate() + 7);
        
        return providerJobs
            .filter(j => {
                const startDate = safeParseDate(j.scheduledStartDate);
                return startDate && isWithinInterval(startDate, { start: today, end: nextSevenDays });
            })
            .sort((a, b) => new Date(a.scheduledStartDate!).getTime() - new Date(b.scheduledStartDate!).getTime());
    }, [providerJobs, today]);

    const isLoading = isLoadingJobs || isLoadingEquip || isLoadingBids || isLoadingProfile;

    if (isLoading) {
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
    const { firestore, user } = useFirebase();

    const jobsQuery = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return query(collection(firestore, 'jobs'), where('workflow', 'in', ['level3', 'auto']));
    }, [firestore, user]);

    const { data: jobs, isLoading } = useCollection<Job>(jobsQuery);
    const { data: serviceProviders, isLoading: isLoadingProviders } = useCollection<any>(useMemoFirebase(() => firestore ? query(collection(firestore, 'companies'), where('type', '==', 'Provider')) : null, [firestore]));

    const auditQueue = useMemo(() => jobs?.filter(j => j.status === 'Report Submitted') || [], [jobs]);
    const auditsCompleted = useMemo(() => jobs?.filter(j => j.status === 'Audit Approved').length || 0, [jobs]);
    const averageReviewTime = "22h"; // Placeholder

    const getSortableTimestamp = (job: Job): number => {
        const historyItem = job.history?.find(h => h.statusChange === 'Report Submitted');
        const date = safeParseDate(historyItem?.timestamp);
        return date ? date.getTime() : 0;
    };
    
     if (isLoading || isLoadingProviders) {
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
                                const submittedDate = safeParseDate(job.history?.find(h => h.statusChange === 'Report Submitted')?.timestamp);

                                return (
                                <TableRow key={job.id}>
                                    <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{serviceProviders?.find(p => p.id === job.providerCompanyId)?.name || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="secondary">{job.techniques.join(', ')}</Badge></TableCell>
                                    <TableCell>{submittedDate ? format(submittedDate, GLOBAL_DATE_FORMAT) : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild>
                                            <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>Audit Report</Link>
                                        </Button>
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
    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(useMemoFirebase(() => isReady ? query(collection(firestore, 'jobs')) : null, [isReady, firestore]));
    const { data: userAuditLog, isLoading: isLoadingAuditLog } = useCollection<UserAuditLog>(useMemoFirebase(() => isReady ? query(collection(firestore, 'userAuditLogs'), orderBy('timestamp', 'desc'), limit(4)) : null, [isReady, firestore]));
    
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
            const seedData = await import('@/lib/seed-data');

            // 1. Top-level collections
            const topLevelCollections = [
                { name: 'companies', data: seedData.allCompanies },
                { name: 'users', data: seedData.allUsers.map(({ password, ...user }) => user) },
                { name: 'userAuditLogs', data: seedData.userAuditLog },
                { name: 'jobAuditLogs', data: seedData.jobAuditLog },
                { name: 'billingAuditLogs', data: seedData.billingAuditLog },
                { name: 'payments', data: seedData.payments },
                { name: 'subscriptions', data: seedData.subscriptions },
                { name: 'jobPayments', data: seedData.jobPayments },
                { name: 'products', data: seedData.productsData },
                { name: 'plans', data: seedData.subscriptionPlans },
                { name: 'techniques', data: seedData.NDTTechniques },
                { name: 'manufacturers', data: seedData.manufacturersData },
                { name: 'events', data: seedData.ndtEvents },
                { name: 'reviews', data: seedData.reviews },
                { name: 'jobs', data: seedData.jobsData },
                { name: 'assets', data: seedData.clientAssets },
                { name: 'bids', data: seedData.bidsData },
                { name: 'inspections', data: seedData.inspectionsData },
                { name: 'tasks', data: seedData.tasks },
                { name: 'notifications', data: seedData.notifications },
            ];

            console.log("[SEED] Preparing top-level collections...");
            topLevelCollections.forEach(({ name, data }) => {
                data.forEach((item: any) => batch.set(doc(firestore, name, item.id), item));
                console.log(`  - ✅ Prepared ${data.length} documents for ${name}.`);
            });
            
            await batch.commit();
            toast({
                title: "Database Seeded Successfully!",
                description: "All collections have been populated with the correct nested structure.",
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
        activeJobs: jobs?.filter(j => j.status === 'Posted' || j.status === 'Assigned' || j.status === 'In Progress').length || 0,
    };

    const userGrowthData = useMemo(() => {
        if (!users) return [];
        
        const usersByMonth: { [key: string]: number } = {};
        const monthOrder: string[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            usersByMonth[monthKey] = 0;
            monthOrder.push(monthKey);
        }
        
        users.forEach(user => {
            if (!user.createdAt) return;
            const date = safeParseDate(user.createdAt);
            if (date && isValid(date)) {
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
    
    const isLoading = isLoadingUsers || isLoadingCompanies || isLoadingJobs || isLoadingAuditLog;

    if (isLoading) {
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
                 <Card className="relative overflow-hidden">
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", "bg-card-color-4")} />
                    <CardContent className="p-4 flex items-center justify-between ml-1.5">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                        <p className="text-3xl font-bold">N/A</p>
                        <p className="text-xs text-muted-foreground mt-1">Feature temporarily disabled</p>
                    </div>
                    <div className={cn("p-3 rounded-full text-white", "bg-card-color-4")}>
                        <Eye className="h-6 w-6" />
                    </div>
                    </CardContent>
                </Card>
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

const ManufacturerDashboard = () => {
    const searchParams = useSearchParams();

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Manufacturer Dashboard</CardTitle>
                    <CardDescription>Welcome to the NDT Exchange Manufacturer Portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This is your central hub for managing products and viewing market insights.</p>
                </CardContent>
                 <CardFooter>
                    <Button asChild>
                        <Link href={constructUrl('/dashboard/my-products', searchParams)}>Manage My Products</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}


// --- MAIN DASHBOARD COMPONENT ---
export default function DashboardPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    const renderDashboardByRole = () => {
        switch (role) {
            case 'inspector': return <InspectorDashboard />;
            case 'admin': return <AdminDashboard />;
            case 'auditor': return <AuditorDashboard />;
            case 'manufacturer': return <ManufacturerDashboard />;
            case 'client': default: return <ClientDashboard />;
        }
    };

    return <div>{renderDashboardByRole()}</div>;
}
