'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { FileText, ClipboardList } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate } from "@/lib/utils";
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Inspection, Job, PlatformUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function InspectionsPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore, user: authUser } = useFirebase();
    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );
    const isMobile = useIsMobile();
    
    // Fetch inspections that are scheduled but do not have a report yet.
    const inspectionsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUserProfile) return null;
        let q = query(collection(firestore, 'inspections'), where('status', '==', 'Scheduled'));
        // Inspectors see inspections assigned to them, clients see all for their jobs.
        // For simplicity, we'll filter client-side based on jobs.
        return q;
    }, [firestore, currentUserProfile]);

    const { data: allPendingInspections, isLoading: isLoadingInspections } = useCollection<Inspection>(inspectionsQuery);
    
    const jobsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUserProfile?.companyId) return null;
        const field = role === 'client' ? 'clientCompanyId' : 'providerCompanyId';
        return query(collection(firestore, 'jobs'), where(field, '==', currentUserProfile.companyId));
    }, [firestore, currentUserProfile, role]);

    const { data: userJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const inspectionsToDo = React.useMemo(() => {
        if (!allPendingInspections || !userJobs) return [];
        const userJobIds = new Set(userJobs.map(j => j.id));
        return allPendingInspections.filter(inspection => userJobIds.has(inspection.jobId));
    }, [allPendingInspections, userJobs]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    };

    const isLoading = isLoadingProfile || isLoadingInspections || isLoadingJobs;

    if (isLoading) {
        return (
            <div>
                <Skeleton className="h-8 w-1/3 mb-6" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                <ClipboardList className="text-primary"/>
                Pending Inspections
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Inspection Work Queue</CardTitle>
                    <CardDescription>A list of all inspections that are scheduled and need a report to be filed.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {inspectionsToDo.map(inspection => {
                                const inspectionDate = safeParseDate(inspection.date);
                                return (
                                    <Card key={inspection.id}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{inspection.assetName}</CardTitle>
                                            <CardDescription>For Job: {inspection.jobId.substring(0,7)}...</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <p><strong>Technique:</strong> <Badge variant="secondary">{inspection.technique}</Badge></p>
                                            <p><strong>Scheduled Date:</strong> <ClientFormattedDate date={inspectionDate} formatString={GLOBAL_DATE_FORMAT} /></p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full">
                                                <Link href={constructUrl(`/dashboard/reports/new?jobId=${inspection.jobId}&inspectionId=${inspection.id}`)}>
                                                    <FileText className="mr-2 h-4 w-4" /> Start Report
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Technique</TableHead>
                                    <TableHead>Scheduled Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inspectionsToDo.map(inspection => {
                                    const inspectionDate = safeParseDate(inspection.date);
                                    const job = userJobs?.find(j => j.id === inspection.jobId);
                                    return (
                                    <TableRow key={inspection.id}>
                                        <TableCell className="font-medium">{inspection.assetName}</TableCell>
                                        <TableCell>{job?.title || inspection.jobId}</TableCell>
                                        <TableCell><Badge variant="secondary">{inspection.technique}</Badge></TableCell>
                                        <TableCell><ClientFormattedDate date={inspectionDate} formatString={GLOBAL_DATE_FORMAT} /></TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild>
                                                <Link href={constructUrl(`/dashboard/reports/new?jobId=${inspection.jobId}&inspectionId=${inspection.id}`)}>
                                                    <FileText className="mr-2 h-4 w-4" /> Start Report
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )})}
                            </TableBody>
                        </Table>
                    )}
                    {inspectionsToDo.length === 0 && (
                        <div className="text-center p-10">
                            <h3 className="text-lg font-semibold">All caught up!</h3>
                            <p className="text-muted-foreground mt-1">There are no inspections currently awaiting a report.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}