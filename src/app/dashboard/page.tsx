
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Building, Briefcase, BellRing, Users, ShieldCheck, BarChart3, Eye, FileCheck, CheckCircle, Clock, Calendar, AlarmClock, Wrench, History } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Bar, XAxis, YAxis, CartesianGrid, BarChart, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { assets as clientAssets, jobs, inspections, technicians, inspectorAssets, Job, Inspection, allUsers, adminActivityLog } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- Client Dashboard ---
const clientChartData = [
  { status: "Operational", key: "operational", count: clientAssets.filter(a => a.status === 'Operational').length, fill: "var(--color-operational)" },
  { status: "Requires Inspection", key: "inspection", count: clientAssets.filter(a => a.status === 'Requires Inspection').length, fill: "var(--color-inspection)" },
  { status: "Under Repair", key: "repair", count: clientAssets.filter(a => a.status === 'Under Repair').length, fill: "var(--color-repair)" },
];

const clientChartConfig = {
  count: { label: "Assets" },
  operational: { label: "Operational", color: "hsl(var(--chart-2))" },
  inspection: { label: "Requires Inspection", color: "hsl(var(--chart-4))" },
  repair: { label: "Under Repair", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

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

const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

const ClientDashboard = () => {
    const isMobile = useIsMobile();
    
    // Filter data specifically for the client
    const clientJobs = useMemo(() => jobs.filter(j => j.client === 'Global Energy Corp.'), []);
    const clientJobIds = useMemo(() => clientJobs.map(j => j.id), [clientJobs]);
    const clientInspections = useMemo(() => inspections.filter(i => clientJobIds.includes(i.jobId)), [clientJobIds]);
    
    // Calculate card metrics directly
    const totalAssetsCount = clientAssets.length;
    const activeJobsCount = clientJobs.filter(j => ['Posted', 'Assigned', 'Scheduled', 'In Progress', 'Report Submitted', 'Under Audit', 'Client Review'].includes(j.status)).length;
    const upcomingInspectionsCount = clientInspections.filter(i => new Date(i.date) > new Date() && i.status === 'Scheduled').length;
    const overdueJobsCount = clientJobs.filter(j => j.scheduledStartDate && new Date(j.scheduledStartDate) < new Date() && !['Completed', 'Paid'].includes(j.status)).length;
    
    const recentActivities = useMemo(() => 
        [...clientInspections, ...clientJobs]
            .sort((a, b) => new Date((b as any).date || (b as any).postedDate).getTime() - new Date((a as any).date || (a as any).postedDate).getTime())
            .slice(0, 5), 
        [clientInspections, clientJobs]
    );
  
    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAssetsCount}</div>
                        <p className="text-xs text-muted-foreground">Managed by your company</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeJobsCount}</div>
                        <p className="text-xs text-muted-foreground">Posted or in progress</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Inspections</CardTitle>
                        <BellRing className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingInspectionsCount}</div>
                        <p className="text-xs text-muted-foreground">Due within 30 days</p>
                    </CardContent>
                </Card>
                <Card className="bg-destructive/10 border-destructive text-destructive-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">Overdue Jobs</CardTitle>
                        <AlarmClock className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{overdueJobsCount}</div>
                        <p className="text-xs text-destructive/80">Require immediate attention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Recent Activity</CardTitle>
                        <CardDescription>An overview of recent inspections and job updates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isMobile ? (
                            <div className="space-y-4">
                                {recentActivities.map(activity => {
                                     if ('technique' in activity && 'assetName' in activity) { // Inspection
                                        const inspection = activity as Inspection;
                                        return (
                                            <Card key={`insp-${inspection.id}`} className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-medium">{inspection.technique} on {inspection.assetName}</div>
                                                    <Badge variant="outline">Inspection Report</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-2">Date: {format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</div>
                                                <div className="text-sm text-muted-foreground">Status: <Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge></div>
                                            </Card>
                                        )
                                     } else if ('client' in activity) { // Job
                                        const job = activity as Job;
                                        return (
                                            <Card key={`job-${job.id}`} className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="font-medium">{job.title}</div>
                                                    <Badge variant="outline">Job Posted</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-2">Posted: {format(new Date(job.postedDate), GLOBAL_DATE_FORMAT)}</div>
                                                {job.scheduledStartDate && <div className="text-sm text-muted-foreground mt-1">Scheduled: {format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT)}</div>}
                                                <div className="text-sm text-muted-foreground mt-1">Status: <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge></div>
                                            </Card>
                                        )
                                     }
                                     return null;
                                })}
                            </div>
                        ) : (
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivities.map(activity => {
                                if ('technique' in activity && 'assetName' in activity) { // It's an inspection
                                    const inspection = activity as Inspection;
                                    return (
                                    <TableRow key={`insp-${inspection.id}`}>
                                        <TableCell><Badge variant="outline">Inspection Report</Badge></TableCell>
                                        <TableCell className="font-medium">{inspection.technique} on {inspection.assetName}</TableCell>
                                        <TableCell>{format(new Date(inspection.date), GLOBAL_DATE_FORMAT)}</TableCell>
                                        <TableCell><Badge variant={inspectionStatusVariants[inspection.status]}>{inspection.status}</Badge></TableCell>
                                    </TableRow>
                                    )
                                } else if ('client' in activity) { // It's a job
                                    const job = activity as Job;
                                    return (
                                    <TableRow key={`job-${job.id}`}>
                                        <TableCell><Badge variant="outline">Job Posted</Badge></TableCell>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.scheduledStartDate ? `Sch: ${format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT)}` : `Post: ${format(new Date(job.postedDate), GLOBAL_DATE_FORMAT)}`}</TableCell>
                                        <TableCell><Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge></TableCell>
                                    </TableRow>
                                    )
                                }
                                return null;
                                })}
                            </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline">Asset Status</CardTitle>
                        <CardDescription>Distribution of asset operational status.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer
                        config={clientChartConfig}
                        className="mx-auto aspect-square h-[250px]"
                        >
                        <PieChart>
                            <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                            data={clientChartData}
                            dataKey="count"
                            nameKey="key"
                            innerRadius={60}
                            strokeWidth={5}
                            >
                                {clientChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey="key" />}
                                className="-mt-4"
                             />
                        </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


// --- Inspector Dashboard ---
const InspectorDashboard = () => {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }
    
    // Filter data specifically for the inspector's company
    const providerJobs = useMemo(() => jobs.filter(j => j.providerId === 'provider-03'), []);
    const providerTechnicians = useMemo(() => technicians.filter(t => t.providerId === 'provider-03'), []);
    const providerEquipment = useMemo(() => inspectorAssets, []);

    // Job Stats
    const activeJobs = useMemo(() => providerJobs.filter(j => j.status === 'In Progress'), [providerJobs]);
    const upcomingJobs = useMemo(() => providerJobs.filter(j => ['Assigned', 'Scheduled'].includes(j.status)), [providerJobs]);
    
    const activeAndUpcomingJobs = useMemo(() =>
        providerJobs
            .filter(j => ['In Progress', 'Assigned', 'Scheduled'].includes(j.status))
            .sort((a, b) => new Date(a.scheduledStartDate || a.postedDate).getTime() - new Date(b.scheduledStartDate || b.postedDate).getTime())
    , [providerJobs]);

    // Technician Stats
    const availableTechnicians = useMemo(() => providerTechnicians.filter(t => t.status === 'Available'), [providerTechnicians]);
    const onAssignmentTechnicians = useMemo(() => providerTechnicians.filter(t => t.status === 'On Assignment'), [providerTechnicians]);

    // Equipment Stats
    const availableEquipment = useMemo(() => providerEquipment.filter(e => e.status === 'Available'), [providerEquipment]);
    const inUseEquipment = useMemo(() => providerEquipment.filter(e => e.status === 'In Use'), [providerEquipment]);
    const calibrationDue = useMemo(() => providerEquipment.filter(e => e.status === 'Calibration Due'), [providerEquipment]);
    const outOfServiceEquipment = useMemo(() => providerEquipment.filter(e => ['Out of Service', 'Under Service'].includes(e.status)), [providerEquipment]);


    return (
        <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Jobs Section */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Jobs Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-2 border rounded-lg">
                                <p className="text-2xl font-bold">{activeJobs.length}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                            <div className="p-2 border rounded-lg">
                                <p className="text-2xl font-bold">{upcomingJobs.length}</p>
                                <p className="text-xs text-muted-foreground">Upcoming</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Next Upcoming Job:</h4>
                            {upcomingJobs.length > 0 ? (
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground">{upcomingJobs[0].title}</p>
                                    <p>Client: {upcomingJobs[0].client}</p>
                                    <p>Date: {upcomingJobs[0].scheduledStartDate ? format(new Date(upcomingJobs[0].scheduledStartDate), GLOBAL_DATE_FORMAT) : 'Not Scheduled'}</p>
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No upcoming jobs.</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                           <Link href={constructUrl('/dashboard/my-jobs')}>Manage All Jobs</Link>
                        </Button>
                    </CardFooter>
                </Card>

                 {/* Technicians Section */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Technician Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-2 border rounded-lg">
                                <p className="text-2xl font-bold">{availableTechnicians.length}</p>
                                <p className="text-xs text-muted-foreground">Available</p>
                            </div>
                            <div className="p-2 border rounded-lg">
                                <p className="text-2xl font-bold">{onAssignmentTechnicians.length}</p>
                                <p className="text-xs text-muted-foreground">On Assignment</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-2">Available Technicians:</h4>
                            {availableTechnicians.length > 0 ? (
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {availableTechnicians.slice(0, 3).map(tech => (
                                        <li key={tech.id} className="flex justify-between">
                                            <span>{tech.name}</span>
                                            <span>{tech.level}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No technicians available.</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full">
                           <Link href={constructUrl('/dashboard/technicians')}>Manage Technicians</Link>
                        </Button>
                    </CardFooter>
                </Card>

                 {/* Equipment Section */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-primary" />
                            Equipment Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                             <div className="p-2 border rounded-lg">
                                <p className="text-2xl font-bold">{availableEquipment.length}</p>
                                <p className="text-xs text-muted-foreground">Available</p>
                            </div>
                             <div className="p-2 border rounded-lg">
                                <p className="text-2xl font-bold">{inUseEquipment.length}</p>
                                <p className="text-xs text-muted-foreground">In Use</p>
                            </div>
                            <div className="p-2 border rounded-lg border-destructive/50 bg-destructive/10">
                                <p className="text-2xl font-bold text-destructive">{calibrationDue.length}</p>
                                <p className="text-xs text-destructive/80">Calibration Due</p>
                            </div>
                            <div className="p-2 border rounded-lg">
                                <p className="text-2xl font-bold">{outOfServiceEquipment.length}</p>
                                <p className="text-xs text-muted-foreground">Out of Service</p>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-sm mb-2">Needs Attention:</h4>
                            {calibrationDue.length > 0 ? (
                                 <ul className="space-y-1 text-sm text-muted-foreground">
                                    {calibrationDue.slice(0, 2).map(equip => (
                                        <li key={equip.id} className="flex justify-between">
                                            <span>{equip.name}</span>
                                            <span className="text-destructive font-medium">Due: {format(new Date(equip.nextCalibration), GLOBAL_DATE_FORMAT)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">All equipment is up to date.</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" className="w-full">
                           <Link href={constructUrl('/dashboard/equipment')}>Manage Equipment</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Active & Upcoming Jobs
                    </CardTitle>
                    <CardDescription>A list of your current and scheduled jobs.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {activeAndUpcomingJobs.map(job => (
                                <Card key={job.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium">{job.title}</div>
                                        <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">Client: {job.client}</div>
                                    {job.scheduledStartDate && <div className="text-sm text-muted-foreground mt-1">Date: {format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT)}</div>}
                                    <CardFooter className="p-0 pt-4 flex justify-end">
                                        <Button asChild variant="ghost" size="sm">
                                           <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {activeAndUpcomingJobs.length === 0 && <div className="text-center text-muted-foreground py-4">No active or upcoming jobs.</div>}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Scheduled Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeAndUpcomingJobs.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.client}</TableCell>
                                        <TableCell>{job.scheduledStartDate ? format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT) : 'Not Scheduled'}</TableCell>
                                        <TableCell><Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`)}>View Job</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {activeAndUpcomingJobs.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No active or upcoming jobs.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


// --- Admin Dashboard ---
const adminChartData = [
  { month: "Jan", revenue: 1860 },
  { month: "Feb", revenue: 3050 },
  { month: "Mar", revenue: 2370 },
  { month: "Apr", revenue: 730 },
  { month: "May", revenue: 2090 },
  { month: "Jun", revenue: 2140 },
];
const adminChartConfig = { revenue: { label: "Revenue", color: "hsl(var(--accent))" } } satisfies ChartConfig;

const AdminDashboard = () => {
    return (
         <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allUsers.length}</div>
                        <p className="text-xs text-muted-foreground">+5 this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{serviceProviders.length}</div>
                        <p className="text-xs text-muted-foreground">+2 new this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'Completed').length}</div>
                        <p className="text-xs text-muted-foreground">In the last 30 days</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,234.56</div>
                        <p className="text-xs text-muted-foreground">This month (commission)</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={adminChartConfig} className="h-[250px] w-full">
                        <BarChart data={adminChartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Recent Admin Activity
                    </CardTitle>
                    <CardDescription>
                        A log of recent user management changes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>Target User</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Performed By</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {adminActivityLog.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={
                                            log.action === 'Admin Promotion' ? 'default' :
                                            log.action === 'User Disabled' ? 'destructive' :
                                            'secondary'
                                        }>{log.action}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{log.targetUserName}</TableCell>
                                    <TableCell>{log.targetCompany}</TableCell>
                                    <TableCell>{format(new Date(log.timestamp), GLOBAL_DATETIME_FORMAT)}</TableCell>
                                    <TableCell>{log.adminName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

// --- Auditor Dashboard ---
const AuditorDashboard = () => {
    const jobsUnderAudit = jobs.filter(j => j.status === 'Under Audit');
    const jobsAwaitingReview = jobs.filter(j => j.status === 'Report Submitted' && j.workflow === 'level3');
    const isMobile = useIsMobile();

    const auditQueue = [...jobsAwaitingReview, ...jobsUnderAudit];

    return (
         <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Awaiting Audit</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobsAwaitingReview.length}</div>
                        <p className="text-xs text-muted-foreground">New reports submitted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Currently Under Audit</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobsUnderAudit.length}</div>
                        <p className="text-xs text-muted-foreground">Active reviews</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Audits Completed</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'Audit Approved').length}</div>
                        <p className="text-xs text-muted-foreground">In the last 7 days</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Audit Queue</CardTitle>
                    <CardDescription>Jobs that require your review and approval.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {auditQueue.map(job => (
                                <Card key={job.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium">{job.title}</div>
                                        <Badge variant={job.status === 'Report Submitted' ? 'destructive' : 'secondary'}>{job.status === 'Report Submitted' ? 'Awaiting Review' : 'Under Audit'}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">Technique: {job.technique}</div>
                                    <div className="text-sm text-muted-foreground">Submitted: {format(new Date(job.scheduledStartDate || job.postedDate), GLOBAL_DATE_FORMAT)}</div>
                                </Card>
                            ))}
                            {auditQueue.length === 0 && <div className="text-center text-muted-foreground py-4">The audit queue is empty.</div>}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Technique</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobsAwaitingReview.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.technique}</TableCell>
                                        <TableCell>{format(new Date(job.scheduledStartDate || job.postedDate), GLOBAL_DATE_FORMAT)}</TableCell>
                                        <TableCell><Badge variant="destructive">Awaiting Review</Badge></TableCell>
                                    </TableRow>
                                ))}
                                {jobsUnderAudit.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.technique}</TableCell>
                                        <TableCell>{format(new Date(job.scheduledStartDate || job.postedDate), GLOBAL_DATE_FORMAT)}</TableCell>
                                        <TableCell><Badge variant="secondary">Under Audit</Badge></TableCell>
                                    </TableRow>
                                ))}
                                {(jobsAwaitingReview.length === 0 && jobsUnderAudit.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">The audit queue is empty.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


export default function DashboardPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';

    const renderDashboardByRole = () => {
        switch (role) {
            case 'inspector':
                return <InspectorDashboard />;
            case 'admin':
                return <AdminDashboard />;
            case 'auditor':
                return <AuditorDashboard />;
            case 'client':
            default:
                return <ClientDashboard />;
        }
    };

    return (
        <div>
            {renderDashboardByRole()}
        </div>
    );
}
