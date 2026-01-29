
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Building, Briefcase, BellRing, Users, ShieldCheck, BarChart3, Eye, FileCheck, CheckCircle, Clock, Calendar, AlarmClock, Wrench, History, Check, X, FileText, Settings2, Award } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Bar, XAxis, YAxis, CartesianGrid, BarChart, ResponsiveContainer, Line, LineChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { assets as clientAssets, jobs, inspectorAssets, Job, Inspection, allUsers, userAuditLog } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useMemo } from "react";
import { format, differenceInDays, isAfter, isToday, isWithinInterval } from "date-fns";
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";


// --- SHARED COMPONENTS & CONFIGS ---

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success'
};

const constructUrl = (base: string, searchParams: URLSearchParams) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${base}?${params.toString()}`;
};


// --- CLIENT DASHBOARD ---
const clientChartConfig = {
  count: { label: "Assets" },
  operational: { label: "Operational", color: "hsl(var(--chart-2))" },
  inspection: { label: "Requires Inspection", color: "hsl(var(--chart-4))" },
  repair: { label: "Under Repair", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const ClientDashboard = () => {
    const searchParams = useSearchParams();
    const clientJobs = useMemo(() => jobs.filter(j => j.client === 'Global Energy Corp.'), []);
    
    const stats = useMemo(() => {
        const assetsRequiringInspection = clientAssets.filter(a => a.status === 'Requires Inspection').length;
        const reportsForReview = clientJobs.filter(j => j.status === 'Client Review' || j.status === 'Audit Approved').length;
        const activeJobs = clientJobs.filter(j => ['In Progress', 'Scheduled', 'Assigned'].includes(j.status)).length;
        const upcomingDeadlines = clientJobs.filter(j => j.bidExpiryDate && isAfter(new Date(j.bidExpiryDate), new Date())).length;
        return { assetsRequiringInspection, reportsForReview, activeJobs, upcomingDeadlines };
    }, [clientJobs]);

    const jobsForReview = useMemo(() => clientJobs.filter(j => j.status === 'Client Review' || j.status === 'Audit Approved').slice(0, 3), [clientJobs]);
    const assetStatusData = useMemo(() => [
      { status: "Operational", key: "operational", count: clientAssets.filter(a => a.status === 'Operational').length, fill: "var(--color-operational)" },
      { status: "Requires Inspection", key: "inspection", count: clientAssets.filter(a => a.status === 'Requires Inspection').length, fill: "var(--color-inspection)" },
      { status: "Under Repair", key: "repair", count: clientAssets.filter(a => a.status === 'Under Repair').length, fill: "var(--color-repair)" },
    ], []);

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assets Requiring Inspection</CardTitle>
                        <AlarmClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.assetsRequiringInspection}</div>
                        <p className="text-xs text-muted-foreground">Assets with status 'Requires Inspection'</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reports Awaiting Your Review</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.reportsForReview}</div>
                        <p className="text-xs text-muted-foreground">Inspection reports ready for approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <p className="text-xs text-muted-foreground">Jobs currently in progress or scheduled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
                        <p className="text-xs text-muted-foreground">Job bids expiring soon</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Action Required</CardTitle>
                        <CardDescription>These jobs are awaiting your review and approval to move forward.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobsForReview.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{serviceProviders.find(p => p.id === job.providerId)?.name || 'N/A'}</TableCell>
                                        <TableCell><Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>Review Job</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {jobsForReview.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No jobs require your action at this time.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline">Asset Status</CardTitle>
                        <CardDescription>Distribution of your asset fleet's operational status.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={clientChartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={assetStatusData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                                    {assetStatusData.map(entry => <Cell key={entry.key} fill={entry.fill} />)}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="status" />} className="-mt-4" />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


// --- INSPECTOR DASHBOARD ---
const InspectorDashboard = () => {
    const searchParams = useSearchParams();
    const providerJobs = useMemo(() => jobs.filter(j => j.providerId === 'provider-03'), []);
    const providerTechnicians = useMemo(() => allUsers.filter(u => u.role === 'Inspector' && u.providerId === 'provider-03'), []);
    const providerEquipment = useMemo(() => inspectorAssets.filter(e => e.providerId === 'provider-03'), []);

    const stats = useMemo(() => ({
        activeAssignments: providerJobs.filter(j => j.status === 'In Progress').length,
        availableTechnicians: providerTechnicians.filter(t => t.workStatus === 'Available').length,
        equipmentAlerts: providerEquipment.filter(e => e.status === 'Calibration Due' || e.status === 'Out of Service').length,
        reportsToSubmit: providerJobs.filter(j => (j.status === 'In Progress' && j.scheduledEndDate && isAfter(new Date(), new Date(j.scheduledEndDate))) || j.status === 'Completed').length,
    }), [providerJobs, providerTechnicians, providerEquipment]);

    const schedule = useMemo(() => {
        const today = new Date();
        const nextSevenDays = new Date();
        nextSevenDays.setDate(today.getDate() + 7);
        
        return providerJobs
            .filter(j => j.scheduledStartDate && isWithinInterval(new Date(j.scheduledStartDate), { start: today, end: nextSevenDays }))
            .sort((a, b) => new Date(a.scheduledStartDate!).getTime() - new Date(b.scheduledStartDate!).getTime());
    }, [providerJobs]);

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeAssignments}</div>
                        <p className="text-xs text-muted-foreground">Jobs currently in progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Technicians</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.availableTechnicians}</div>
                        <p className="text-xs text-muted-foreground">Ready for assignment</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reports to Submit</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.reportsToSubmit}</div>
                        <p className="text-xs text-muted-foreground">Jobs awaiting report submission</p>
                    </CardContent>
                </Card>
                 <Card className={stats.equipmentAlerts > 0 ? "bg-destructive/10 border-destructive text-destructive-foreground" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={cn("text-sm font-medium", stats.equipmentAlerts > 0 && "text-destructive")}>Equipment Alerts</CardTitle>
                        <Wrench className={cn("h-4 w-4", stats.equipmentAlerts > 0 ? "text-destructive" : "text-muted-foreground")} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", stats.equipmentAlerts > 0 && "text-destructive")}>{stats.equipmentAlerts}</div>
                        <p className={cn("text-xs", stats.equipmentAlerts > 0 ? "text-destructive/80" : "text-muted-foreground")}>Items needing calibration or service</p>
                    </CardContent>
                </Card>
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
                                <TableHead>Job Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Technicians</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.map(job => {
                                const assignedTechs = allUsers.filter(u => job.technicianIds?.includes(u.id));
                                return (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.scheduledStartDate ? format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT) : 'N/A'}</TableCell>
                                        <TableCell>{job.title}</TableCell>
                                        <TableCell>{job.client}</TableCell>
                                        <TableCell>{assignedTechs.map(t => t.name).join(', ')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>View Job</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {schedule.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">No jobs scheduled in the next 7 days.</TableCell></TableRow>}
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
    const auditQueue = useMemo(() => jobs.filter(j => j.status === 'Report Submitted' && (j.workflow === 'level3' || j.workflow === 'auto')), []);
    const auditsCompleted = useMemo(() => jobs.filter(j => j.status === 'Audit Approved').length, []);
    const averageReviewTime = "22h"; // Placeholder

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reports in Queue</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{auditQueue.length}</div>
                        <p className="text-xs text-muted-foreground">Reports awaiting your review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Review Time</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageReviewTime}</div>
                        <p className="text-xs text-muted-foreground">Average for the last 30 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Audits Completed (7d)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{auditsCompleted}</div>
                        <p className="text-xs text-muted-foreground">Reports approved in the last week</p>
                    </CardContent>
                </Card>
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
                                <TableHead>Job Title</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Technique</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {auditQueue.sort((a,b) => new Date(a.history?.find(h => h.statusChange === 'Report Submitted')?.timestamp || 0).getTime() - new Date(b.history?.find(h => h.statusChange === 'Report Submitted')?.timestamp || 0).getTime()).map(job => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{serviceProviders.find(p => p.id === job.providerId)?.name || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="secondary">{job.technique}</Badge></TableCell>
                                    <TableCell>{format(new Date(job.history?.find(h => h.statusChange === 'Report Submitted')?.timestamp || Date.now()), GLOBAL_DATE_FORMAT)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild>
                                            <Link href={constructUrl(`/dashboard/inspections/${job.inspections[0]?.id}`, searchParams)}>Audit Report</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {auditQueue.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">Your audit queue is empty. Great job!</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};


// --- ADMIN DASHBOARD ---
const adminUserGrowthData = [
  { month: "Jan", users: 12 }, { month: "Feb", users: 15 }, { month: "Mar", users: 20 },
  { month: "Apr", users: 22 }, { month: "May", users: 28 }, { month: "Jun", users: 35 },
];
const userGrowthChartConfig = { users: { label: "New Users", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

const getLogIcon = (action: string) => {
    if (action.includes('Invited')) return <Users className="h-4 w-4" />;
    if (action.includes('Disabled')) return <X className="h-4 w-4" />;
    if (action.includes('Promotion')) return <Award className="h-4 w-4" />;
    return <History className="h-4 w-4" />;
}

const AdminDashboard = () => {
    const stats = {
        totalUsers: allUsers.length,
        totalProviders: serviceProviders.length,
        pendingReviews: reviews.filter(r => r.status === 'Pending').length,
        activeJobs: jobs.filter(j => j.status === 'Posted' || j.status === 'Assigned' || j.status === 'In Progress').length,
    };
    
    return (
         <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div><p className="text-xs text-muted-foreground">+5 this month</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Providers</CardTitle><ShieldCheck className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.totalProviders}</div><p className="text-xs text-muted-foreground">+2 new this month</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Jobs Marketplace</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.activeJobs}</div><p className="text-xs text-muted-foreground">Jobs currently posted or in progress</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Reviews</CardTitle><Eye className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.pendingReviews}</div><p className="text-xs text-muted-foreground">Awaiting moderation</p></CardContent>
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
                            <BarChart data={adminUserGrowthData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis />
                                <Tooltip cursor={false} content={<ChartTooltipContent />} />
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
                            {userAuditLog.slice(0, 4).map(log => (
                                <div key={log.id} className="relative mb-6 pl-8">
                                    <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                        <div className="text-primary">{getLogIcon(log.action)}</div>
                                    </div>
                                    <p className="text-sm font-medium">{log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.targetUserName} ({log.targetCompany})</p>
                                    <p className="text-xs text-muted-foreground/80">{format(new Date(log.timestamp), 'dd-MMM p')}</p>
                                </div>
                            ))}
                        </div>
                         <Button asChild variant="secondary" className="w-full mt-4">
                            <Link href={constructUrl('/dashboard/audit-log', searchParams)}>View Full Audit Log</Link>
                        </Button>
                    </CardContent>
                </Card>
             </div>
        </div>
    );
};


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
