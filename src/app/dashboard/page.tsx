
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Building, Briefcase, BellRing, Users, ShieldCheck, BarChart3, Eye, FileCheck, CheckCircle, Clock, Calendar, AlarmClock, Wrench, History, Check, X, FileText, Settings2, Award, Database } from "lucide-react";
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
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { useMobile } from "@/hooks/use-mobile";
import React, { useState, useEffect, useMemo } from "react";
import { format, differenceInDays, isAfter, isToday, isWithinInterval, isValid } from "date-fns";
import { GLOBAL_DATE_FORMAT, GLOBAL_DATETIME_FORMAT, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { writeBatch, doc, collection, query, where, getDoc, orderBy, limit, setDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Job, Review, PlatformUser, Subscription, Payment, JobPayment, UserAuditLog, NDTServiceProvider, AuditFirm, Client, Bid, Inspection } from "@/lib/types";
import { jobs as seedJobs, inspectorAssets, allUsers, userAuditLog as userAuditLogData, jobAuditLog as jobAuditLogData, billingAuditLog as billingAuditLogData, reviews as reviewsData, subscriptions as subscriptionsData, clientData, payments as paymentsData, jobPayments as jobPaymentsData, jobChats, serviceProviders, auditFirms, NDTTechniques, manufacturersData, clientAssets, bidsData, inspectionsData } from "@/lib/seed-data";
import { Skeleton } from "@/components/ui/skeleton";


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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Managed Assets</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAssets}</div>
                        <p className="text-xs text-muted-foreground">Assets in your portfolio</p>
                    </CardContent>
                </Card>
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
    
    const jobsQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'jobs'), where('providerId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const techniciansQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'users'), where('companyId', '==', userProfile.companyId)) : null, [firestore, userProfile]);
    const equipmentQuery = useMemoFirebase(() => userProfile?.companyId ? query(collection(firestore, 'equipment'), where('providerId', '==', userProfile.companyId)) : null, [firestore, userProfile]);

    const { data: providerJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    const { data: providerTechnicians, isLoading: isLoadingTechs } = useCollection<PlatformUser>(techniciansQuery);
    const { data: providerEquipment, isLoading: isLoadingEquip } = useCollection<any>(equipmentQuery);

    const stats = useMemo(() => ({
        activeAssignments: providerJobs?.filter(j => j.status === 'In Progress').length || 0,
        availableTechnicians: providerTechnicians?.filter(t => t.workStatus === 'Available').length || 0,
        equipmentAlerts: providerEquipment?.filter(e => e.status === 'Calibration Due' || e.status === 'Out of Service').length || 0,
        reportsToSubmit: providerJobs?.filter(j => (j.status === 'In Progress' && j.scheduledEndDate && isAfter(new Date(), new Date(j.scheduledEndDate))) || j.status === 'Completed').length || 0,
    }), [providerJobs, providerTechnicians, providerEquipment]);

    const schedule = useMemo(() => {
        if (!today || !providerJobs) return [];
        const nextSevenDays = new Date(today);
        nextSevenDays.setDate(today.getDate() + 7);
        
        return providerJobs
            .filter(j => j.scheduledStartDate && isWithinInterval(new Date(j.scheduledStartDate), { start: today, end: nextSevenDays }))
            .sort((a, b) => new Date(a.scheduledStartDate!).getTime() - new Date(b.scheduledStartDate!).getTime());
    }, [providerJobs, today]);

    if (isLoadingJobs || isLoadingTechs || isLoadingEquip || !userProfile) {
        return <DashboardSkeleton />;
    }

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
                    {isMobile ? (
                        <div className="space-y-4">
                            {schedule.map(job => {
                                const assignedTechs = providerTechnicians?.filter(u => job.technicianIds?.includes(u.id));
                                return (
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
                                        <p><strong>Client:</strong> {job.client}</p>
                                        <p><strong>Job ID:</strong> <span className="font-extrabold">{job.id}</span></p>
                                        <p><strong>Technicians:</strong> {assignedTechs?.map(t => t.name).join(', ')}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild variant="outline" size="sm" className="w-full">
                                            <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>View Job</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )})}
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
                                    <TableHead>Client</TableHead>
                                    <TableHead>Technicians</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedule.map(job => {
                                    const assignedTechs = providerTechnicians?.filter(u => job.technicianIds?.includes(u.id));
                                    return (
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
                                            <TableCell>{assignedTechs?.map(t => t.name).join(', ')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={constructUrl(`/dashboard/my-jobs/${job.id}`, searchParams)}>View Job</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {schedule.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center">No jobs scheduled in the next 7 days.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


// --- AUDITOR DASHBOARD ---
const AuditorDashboard = () => {
    const searchParams = useSearchParams();
    const isMobile = useMobile();
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

    const schedule = useMemo(() => {
        if (!today || !jobs) return [];
        const nextSevenDays = new Date(today);
        nextSevenDays.setDate(today.getDate() + 7);
        
        return jobs
            .filter(j => j.scheduledStartDate && isWithinInterval(new Date(j.scheduledStartDate), { start: today, end: nextSevenDays }))
            .sort((a, b) => new Date(a.scheduledStartDate!).getTime() - new Date(b.scheduledStartDate!).getTime());
    }, [jobs, today]);
    
     if (isLoading) {
        return <DashboardSkeleton />;
    }

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
                                <TableHead>Job ID</TableHead>
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
                                    <TableCell className="font-extrabold text-xs">{job.id}</TableCell>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{serviceProviders.find(p => p.id === job.providerId)?.name || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="secondary">{job.techniques.join(', ')}</Badge></TableCell>
                                    <TableCell>{format(new Date(job.history?.find(h => h.statusChange === 'Report Submitted')?.timestamp || Date.now()), GLOBAL_DATE_FORMAT)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild>
                                            <Link href={constructUrl(`/dashboard/reports/${job.inspections[0]?.report!.id}`, searchParams)}>Audit Report</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
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
    const isMobile = useMobile();
    const [isSeeding, setIsSeeding] = useState(false);
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const role = searchParams.get('role');
    
    const isReady = firestore && user && role === 'admin';

    const { data: users, isLoading: isLoadingUsers } = useCollection<PlatformUser>(useMemoFirebase(() => isReady ? collection(firestore, 'users') : null, [isReady, firestore]));
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<any>(useMemoFirebase(() => isReady ? collection(firestore, 'companies') : null, [isReady, firestore]));
    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(useMemoFirebase(() => isReady ? collection(firestore, 'jobs') : null, [isReady, firestore]));
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
    
        const seedCollection = async (collectionName: string, data: any[], idField = 'id', customizer?: (item: any) => any) => {
            console.log(`[SEED] Starting: ${collectionName} (${data.length} docs)...`);
            let count = 0;
            for (const item of data) {
                try {
                    const itemData = customizer ? customizer(item) : item;
                    const docId = item[idField];
                    const docRef = doc(firestore, collectionName, docId);
                    await setDoc(docRef, itemData);
                    count++;
                } catch (error: any) {
                    console.error(`[SEED] ❌ Failed to write document: ${collectionName}/${item[idField]}`, error);
                    toast({
                        variant: "destructive",
                        title: `Seeding Failed on: ${collectionName}/${item[idField]}`,
                        description: `Error: ${error.message}. Check console for details.`,
                    });
                    throw new Error(`Failed to seed ${collectionName}`);
                }
            }
            console.log(`[SEED] ✅ Success: Seeded ${count}/${data.length} documents into ${collectionName}.`);
        };

        const allCompanies = [...clientData, ...serviceProviders, ...auditFirms];
    
        try {
            console.group("Step 1: Foundational & Company Data");
            await seedCollection('techniques', NDTTechniques);
            await seedCollection('manufacturers', manufacturersData);
            await seedCollection('companies', allCompanies);
            console.groupEnd();
            
            console.group("Step 2: Users & Roles");
            await seedCollection('users', allUsers, 'id', (user) => {
                const { password, ...userToSave } = user;
                return { ...userToSave, createdAt: new Date(user.createdAt) };
            });
            const adminUser = allUsers.find(u => u.email === 'admin@ndtexchange.com');
            if (adminUser) {
                await setDoc(doc(firestore, 'roles_admin', adminUser.id), { isAdmin: true });
                console.log(`[SEED] ✅ Success: roles_admin seeded.`);
            }
            console.groupEnd();

            console.group("Step 3: Financial & Subscription Data");
            await seedCollection('subscriptions', subscriptionsData);
            await seedCollection('payments', paymentsData);
            await seedCollection('jobPayments', jobPaymentsData);
            console.groupEnd();

            console.group("Step 4: Core Operational Data");
            await seedCollection('assets', clientAssets);
            await seedCollection('equipment', inspectorAssets);
            await seedCollection('jobs', seedJobs.map(({ bids, inspections, ...job }) => job));
            console.groupEnd();

            console.group("Step 5: Subcollection Data");
            const subcollectionBatch = writeBatch(firestore);
            bidsData.forEach(bid => {
                const bidRef = doc(firestore, 'jobs', bid.jobId, 'bids', bid.id);
                subcollectionBatch.set(bidRef, bid);
            });
            inspectionsData.forEach(inspection => {
                 if (!inspection.assetId || inspection.assetId === 'N/A') {
                    console.warn(`[SEED] Skipping inspection ${inspection.id} due to invalid assetId.`);
                    return;
                }
                const { report, ...inspectionData } = inspection;
                const inspectionRef = doc(firestore, 'assets', inspection.assetId, 'inspections', inspection.id);
                subcollectionBatch.set(inspectionRef, inspectionData);
                if(report) {
                    const reportRef = doc(firestore, 'reports', report.id);
                    subcollectionBatch.set(reportRef, report);
                }
            });
            await subcollectionBatch.commit();
            console.log(`[SEED] ✅ Success: Bids and Inspections/Reports subcollections seeded.`);
            console.groupEnd();
            
            console.group("Step 6: Relational & Log Data");
            await seedCollection('reviews', reviewsData, 'id', (review) => ({ ...review, date: new Date(review.date) }));
            await seedCollection('userAuditLogs', userAuditLogData, 'id', (log) => ({ ...log, timestamp: new Date(log.timestamp) }));
            await seedCollection('jobAuditLogs', jobAuditLogData, 'id', (log) => ({ ...log, timestamp: new Date(log.timestamp) }));
            await seedCollection('billingAuditLogs', billingAuditLogData, 'id', (log) => ({ ...log, timestamp: new Date(log.timestamp) }));
            console.groupEnd();
            
            console.group("Step 7: Chat Data");
            const chatBatch = writeBatch(firestore);
            jobChats.forEach(chat => {
                // The chat object itself is not stored; only its messages are, under the correct job.
                chat.messages.forEach(msg => {
                    const msgRef = doc(firestore, 'jobs', chat.jobId, 'messages', msg.id);
                    chatBatch.set(msgRef, {
                        senderId: msg.senderId,
                        text: msg.text,
                        timestamp: new Date(msg.timestamp),
                    });
                });
            });
            await chatBatch.commit();
            console.log(`[SEED] ✅ Success: Job messages seeded into subcollections.`);
            console.groupEnd();
    
            toast({
                title: "Database Seeded Successfully!",
                description: "All collections have been populated.",
            });
    
        } catch (error) {
            console.error("Seeding process stopped due to an error.", error);
        } finally {
            setIsSeeding(false);
            console.log("%c--- Database Seed Finished ---", "color: #3B82F6; font-size: 16px; font-weight: bold;");
        }
    };
    
    const stats = {
        totalUsers: users?.length || 0,
        totalProviders: companies?.filter(c => c.type === 'Provider').length || 0,
        pendingReviews: pendingReviews,
        activeJobs: jobs?.filter(j => j.status === 'Posted' || j.status === 'Assigned' || j.status === 'In Progress').length || 0,
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
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </CardContent>
                </Card>
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
