
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Building, Briefcase, BellRing, Users, ShieldCheck, BarChart3, Eye, FileCheck, CheckCircle, Clock, Calendar, AlarmClock, Wrench } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip, Bar, XAxis, YAxis, CartesianGrid, BarChart, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { assets as clientAssets, jobs, inspections, technicians, inspectorAssets, Job, Inspection, allUsers } from "@/lib/placeholder-data";
import { serviceProviders } from "@/lib/service-providers-data";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { GLOBAL_DATE_FORMAT } from "@/lib/utils";

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
    
    // Filter data specifically for the inspector's company
    const providerJobs = useMemo(() => jobs.filter(j => j.providerId === 'provider-03'), []);
    const providerTechnicians = useMemo(() => technicians.filter(t => t.providerId === 'provider-03'), []);
    
    const activeJobs = useMemo(() => providerJobs.filter(j => j.status === 'In Progress').length, [providerJobs]);
    const upcomingJobs = useMemo(() => providerJobs.filter(j => ['Assigned', 'Scheduled'].includes(j.status)), [providerJobs]);
    const equipmentCalibrationDue = useMemo(() => inspectorAssets.filter(e => e.status === 'Calibration Due'), []);
    const availableTechnicians = useMemo(() => providerTechnicians.filter(t => t.status === 'Available'), [providerTechnicians]);

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeJobs}</div>
                        <p className="text-xs text-muted-foreground">Currently on assignment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingJobs.length}</div>
                        <p className="text-xs text-muted-foreground">Assigned or scheduled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Technicians</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableTechnicians.length} / {providerTechnicians.length}</div>
                        <p className="text-xs text-muted-foreground">Ready for assignment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Calibration Alerts</CardTitle>
                        <BellRing className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{equipmentCalibrationDue.length}</div>
                        <p className="text-xs text-muted-foreground">Equipment due for calibration</p>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Upcoming Jobs</CardTitle>
                        <CardDescription>Your next scheduled assignments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isMobile ? (
                            <div className="space-y-4">
                                {upcomingJobs.slice(0,5).map(job => (
                                    <Card key={job.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium">{job.title}</div>
                                            <Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">Client: {job.client}</div>
                                        <div className="text-sm text-muted-foreground">Location: {job.location}</div>
                                        {job.scheduledStartDate && <div className="text-sm text-muted-foreground mt-1">Scheduled: {format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT)}</div>}
                                    </Card>
                                ))}
                                {upcomingJobs.length === 0 && <div className="text-center text-muted-foreground py-4">No upcoming jobs.</div>}
                            </div>
                        ) : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {upcomingJobs.slice(0,5).map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.client}</TableCell>
                                        <TableCell>{job.scheduledStartDate ? format(new Date(job.scheduledStartDate), GLOBAL_DATE_FORMAT) : "Not Scheduled"}</TableCell>
                                        <TableCell><Badge variant={jobStatusVariants[job.status]}>{job.status}</Badge></TableCell>
                                    </TableRow>
                                ))}
                                {upcomingJobs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No upcoming jobs.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Available Technicians</CardTitle>
                        <CardDescription>Team members ready for new assignments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Certs</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {availableTechnicians.slice(0, 5).map(tech => (
                                    <TableRow key={tech.id}>
                                        <TableCell className="font-medium">{tech.name}</TableCell>
                                        <TableCell>{tech.level}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {tech.certifications.slice(0, 2).map(cert => <Badge key={cert} variant="secondary">{cert}</Badge>)}
                                                {tech.certifications.length > 2 && <Badge variant="outline">+{tech.certifications.length - 2}</Badge>}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {availableTechnicians.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">
                                            No technicians are currently available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </div>
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
