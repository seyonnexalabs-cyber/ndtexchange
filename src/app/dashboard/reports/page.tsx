'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import type { Job, PlatformUser, Inspection } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Filter, X, Settings2, BarChart2, DollarSign, Star, History } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { format, isToday } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { useSearch } from '@/app/components/layout/search-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';


const inspectionStatusVariants: Record<Inspection['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Scheduled': 'secondary',
    'Completed': 'success',
    'Requires Review': 'destructive'
};

const jobStatusVariants: Record<Job['status'], 'success' | 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Draft': 'outline', 'Posted': 'secondary', 'Assigned': 'default', 'Scheduled': 'default', 'In Progress': 'default',
    'Report Submitted': 'secondary', 'Under Audit': 'secondary', 'Audit Approved': 'success', 'Client Review': 'secondary',
    'Client Approved': 'success', 'Completed': 'success', 'Paid': 'success', 'Revisions Requested': 'destructive'
};

const AnalyticalReports = ({ constructUrl }: { constructUrl: (path: string) => string }) => {
    const reportTypes = [
        {
            title: 'Asset Inspection History',
            description: 'Generate a detailed history of all inspections for selected assets over time.',
            link: constructUrl('/dashboard/reports/asset-history'),
            icon: <History className="h-8 w-8" />,
        },
        {
            title: 'Job Cost & Duration Analysis',
            description: 'Analyze costs and timelines for completed jobs to identify trends and optimize procurement.',
            link: constructUrl('/dashboard/reports/job-cost-analysis'),
            icon: <DollarSign className="h-8 w-8" />,
        },
        {
            title: 'Provider Performance Review',
            description: 'Compare performance metrics like cost, duration, and client feedback for service providers.',
            link: constructUrl('/dashboard/reports/provider-performance'),
            icon: <Star className="h-8 w-8" />,
        },
        {
            title: 'Custom Report Builder',
            description: 'Select your own data points and filters to create a fully customized report from scratch.',
            link: constructUrl('/dashboard/reports/custom-report-builder'),
            icon: <Settings2 className="h-8 w-8" />,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><BarChart2 className="text-primary"/> Analytical Reports</CardTitle>
                <CardDescription>Generate high-level reports for analysis and business intelligence.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                    {reportTypes.map((report) => (
                        <Link key={report.title} href={report.link}>
                            <div className="group flex items-start gap-4 rounded-lg border p-4 h-full transition-all hover:bg-accent hover:text-accent-foreground">
                                <div className="p-2 bg-primary/10 text-primary rounded-md group-hover:bg-accent-foreground group-hover:text-accent">
                                    {report.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{report.title}</h3>
                                    <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/80">{report.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


const ReportList = ({ inspections, role, constructUrl }: { inspections: any[], role: string, constructUrl: (path: string) => string }) => {
    const isMobile = useMobile();
    
    if (inspections.length === 0) {
        return (
            <div className="text-center p-10 border rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-headline">No Reports Found</h2>
                <p className="mt-2 text-muted-foreground">There are no reports that match the current criteria.</p>
            </div>
        );
    }
    
    return isMobile ? (
        <div className="space-y-4">
            {inspections.map(inspection => {
                const inspectionDate = new Date(inspection.date);
                return (
                    <Card key={inspection.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{inspection.assetName}</CardTitle>
                                    <p className="font-extrabold text-xs text-muted-foreground">{inspection.jobId}</p>
                                </div>
                                <Badge variant={jobStatusVariants[inspection.job.status]}>{inspection.job.status}</Badge>
                            </div>
                            <CardDescription>
                                <Badge variant="secondary" shape="rounded">{inspection.technique}</Badge>
                                <span className="mx-1.5">by</span>
                                {inspection.assignedTechnicians.length > 0 
                                    ? inspection.assignedTechnicians.map((t: any) => t.name).join(', ') 
                                    : inspection.inspector
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                Report Date: {format(inspectionDate, GLOBAL_DATE_FORMAT)}
                                {isToday(inspectionDate) && <Badge>Today</Badge>}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href={constructUrl(`/dashboard/reports/${inspection.report!.id}`)}>View Report</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    ) : (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Technique</TableHead>
                        <TableHead>Inspector(s)</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inspections.map(inspection => {
                        const inspectionDate = new Date(inspection.date);
                        return (
                        <TableRow key={inspection.id}>
                            <TableCell className="font-extrabold text-xs">{inspection.jobId}</TableCell>
                            <TableCell className="font-medium">{inspection.assetName}</TableCell>
                            <TableCell><Badge variant="secondary" shape="rounded">{inspection.technique}</Badge></TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    {inspection.assignedTechnicians.length > 0 
                                        ? inspection.assignedTechnicians.map((t: any) => <span key={t.id}>{t.name}</span>)
                                        : <span>{inspection.inspector}</span>
                                    }
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{format(inspectionDate, GLOBAL_DATE_FORMAT)}</span>
                                    {isToday(inspectionDate) && <Badge>Today</Badge>}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={jobStatusVariants[inspection.job.status]}>{inspection.job.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={constructUrl(`/dashboard/reports/${inspection.report!.id}`)}>View Report</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </Card>
    );
};


export default function ReportsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const tabParam = searchParams.get('tab');
    const { searchQuery } = useSearch();
    const { firestore, user } = useFirebase();

    const jobsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Simplified query for demo purposes. A real app would filter by user's company.
        return collection(firestore, 'jobs');
    }, [firestore, role]);
    
    const inspectionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collectionGroup(firestore, 'inspections');
    }, [firestore]);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: jobs } = useCollection<Job>(jobsQuery);
    const { data: allInspectionsData } = useCollection<Inspection>(inspectionsQuery);
    const { data: allUsers } = useCollection<PlatformUser>(usersQuery);
    
    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const allInspections = useMemo(() => {
        if (!allInspectionsData || !jobs) return [];
        let relevantJobs = jobs;
        // In a real app, you would get companyId from the logged in user's profile
        if (role === 'client') {
            relevantJobs = jobs.filter(j => j.clientCompanyId === 'client-01');
        } else if (role === 'inspector') {
            relevantJobs = jobs.filter(j => j.providerId === 'provider-03');
        }
        const relevantJobIds = new Set(relevantJobs.map(j => j.id));

        return allInspectionsData
            .filter(inspection => relevantJobIds.has(inspection.jobId))
            .map(inspection => ({
                ...inspection,
                job: jobs.find(j => j.id === inspection.jobId)
            }))
            .filter(inspection => inspection.job && inspection.report);
    }, [role, allInspectionsData, jobs]);

    const augmentedAndFilteredInspections = useMemo(() => {
        if (!allUsers) return allInspections;
        const augmented = allInspections.map(inspection => {
            const assignedTechnicians = inspection.job?.technicianIds
                ?.map(techId => allUsers.find(t => t.id === techId))
                .filter((t): t is PlatformUser => !!t) ?? [];
            return { ...inspection, assignedTechnicians };
        });

        return augmented.filter(inspection => {
            const searchMatch = !searchQuery ||
                inspection.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inspection.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (inspection.assignedTechnicians.length > 0
                    ? inspection.assignedTechnicians.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    : inspection.inspector.toLowerCase().includes(searchQuery.toLowerCase())
                );
            
            return searchMatch;
        });
    }, [allInspections, allUsers, searchQuery]);
    
    const reportsForAuditorQueue = useMemo(() => augmentedAndFilteredInspections.filter(i => i.job.status === 'Report Submitted' && ['level3', 'auto'].includes(i.job.workflow)), [augmentedAndFilteredInspections]);
    const auditorHistory = useMemo(() => augmentedAndFilteredInspections.filter(i => i.job.status === 'Audit Approved'), [augmentedAndFilteredInspections]);
    const reportsForClientReview = useMemo(() => augmentedAndFilteredInspections.filter(i => ['Client Review', 'Audit Approved'].includes(i.job.status)), [augmentedAndFilteredInspections]);
    const inspectorRevisions = useMemo(() => augmentedAndFilteredInspections.filter(i => i.job.status === 'Revisions Requested'), [augmentedAndFilteredInspections]);

    const roleConfig = useMemo(() => {
        switch(role) {
            case 'auditor': return {
                title: "Reports",
                tabs: [
                    { value: "queue", label: `Audit Queue (${reportsForAuditorQueue.length})`, data: reportsForAuditorQueue },
                    { value: "history", label: `History (${auditorHistory.length})`, data: auditorHistory },
                ],
                defaultTab: tabParam || "queue",
            };
            case 'client': return {
                title: "Reports",
                tabs: [
                    { value: "all", label: `All Reports (${augmentedAndFilteredInspections.length})`, data: augmentedAndFilteredInspections },
                    { value: "review", label: `Awaiting My Review (${reportsForClientReview.length})`, data: reportsForClientReview },
                    { value: 'analytics', label: 'Generate Reports', data: [] }
                ],
                defaultTab: tabParam || "all",
            };
            case 'inspector': return {
                title: "My Reports",
                tabs: [
                    { value: "all", label: `All Reports (${augmentedAndFilteredInspections.length})`, data: augmentedAndFilteredInspections },
                    { value: "revisions", label: `Revisions Requested (${inspectorRevisions.length})`, data: inspectorRevisions },
                ],
                defaultTab: tabParam || "all",
            };
            case 'admin': return {
                title: "Platform Reports",
                tabs: [
                    { value: "all", label: `All Reports (${augmentedAndFilteredInspections.length})`, data: augmentedAndFilteredInspections },
                    { value: 'analytics', label: 'Generate Reports', data: [] }
                ],
                defaultTab: tabParam || "all",
            };
            default: return { title: "Reports", tabs: [], defaultTab: 'all' };
        }
    }, [role, tabParam, augmentedAndFilteredInspections, reportsForAuditorQueue, auditorHistory, reportsForClientReview, inspectorRevisions]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <FileText className="text-primary" />
                        {roleConfig.title}
                    </h1>
                </div>
            </div>
            <Tabs defaultValue={roleConfig.defaultTab}>
                <TabsList className="mb-4">
                    {roleConfig.tabs.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {roleConfig.tabs.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        {tab.value === 'analytics' ? (
                            <AnalyticalReports constructUrl={constructUrl} />
                        ) : (
                            <ReportList
                                inspections={tab.data}
                                role={role}
                                constructUrl={constructUrl}
                            />
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
