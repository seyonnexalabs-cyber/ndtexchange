'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, User, Briefcase, DollarSign, PlusCircle, Award, Gavel, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserAuditLog, JobAuditLog, BillingAuditLog } from '@/lib/types';


const ClientFormattedDate = ({ timestamp }: { timestamp: string | Timestamp }) => {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
        setFormattedDate(format(date, GLOBAL_DATETIME_FORMAT));
    }, [timestamp]);

    return <span className="text-xs text-muted-foreground/80 shrink-0">{formattedDate || '...'}</span>;
};


const userActionStyles: { [key in UserAuditLog['action']]: 'default' | 'destructive' | 'secondary' | 'outline' } = {
    'User Invited': 'secondary',
    'User Disabled': 'destructive',
    'User Enabled': 'success',
    'Admin Promotion': 'default',
    'Admin Demotion': 'outline',
};

const jobActionStyles: { [key in JobAuditLog['action']]: 'default' | 'secondary' | 'outline' } = {
    'Job Created': 'secondary',
    'Bid Placed': 'outline',
    'Job Awarded': 'default',
    'Status Changed': 'outline',
    'Resource Assigned': 'secondary',
    'Report Submitted': 'default',
};

const billingActionStyles: { [key in BillingAuditLog['action']]: 'success' | 'destructive' | 'default' | 'secondary' | 'outline' } = {
    'Subscription Started': 'success',
    'Subscription Canceled': 'destructive',
    'Payment Succeeded': 'success',
    'Payment Failed': 'destructive',
    'Plan Changed': 'default',
};

const getUserEventIcon = (action: UserAuditLog['action']): React.ReactNode => {
    switch (action) {
        case 'User Invited': return <PlusCircle className="h-4 w-4" />;
        case 'Admin Promotion': return <Award className="h-4 w-4" />;
        default: return <User className="h-4 w-4" />;
    }
};

const getJobEventIcon = (action: JobAuditLog['action']): React.ReactNode => {
    switch(action) {
        case 'Job Created': return <PlusCircle className="h-4 w-4" />;
        case 'Bid Placed': return <Gavel className="h-4 w-4" />;
        case 'Job Awarded': return <Award className="h-4 w-4" />;
        case 'Report Submitted': return <FileText className="h-4 w-4" />;
        default: return <History className="h-4 w-4" />;
    }
};

const getBillingEventIcon = (action: BillingAuditLog['action']): React.ReactNode => {
    return <DollarSign className="h-4 w-4" />;
};


export default function AuditLogPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const { firestore } = useFirebase();

    const userAuditLogQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'userAuditLogs'), orderBy('timestamp', 'desc'));
    }, [firestore]);
    const { data: userAuditLog, isLoading: isLoadingUserLog } = useCollection<UserAuditLog>(userAuditLogQuery);

    const jobAuditLogQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'jobAuditLogs'), orderBy('timestamp', 'desc'));
    }, [firestore]);
    const { data: jobAuditLog, isLoading: isLoadingJobLog } = useCollection<JobAuditLog>(jobAuditLogQuery);

    const billingAuditLogQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'billingAuditLogs'), orderBy('timestamp', 'desc'));
    }, [firestore]);
    const { data: billingAuditLog, isLoading: isLoadingBillingLog } = useCollection<BillingAuditLog>(billingAuditLogQuery);


    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    if (role !== 'admin') {
        return null;
    }

    const LogSkeleton = () => (
        <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            ))}
        </div>
    );
    
    const UserLog = () => (
        <Card>
            <CardContent className="pt-6">
                <ScrollArea className="max-h-[60vh]">
                     <div className="relative pl-6">
                        <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                        {isLoadingUserLog ? <LogSkeleton /> : userAuditLog?.map(log => (
                            <div key={log.id} className="relative mb-8 pl-8">
                                <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                    <div className="text-primary">{getUserEventIcon(log.action)}</div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">{log.actorName} <span className="text-muted-foreground font-normal">from {log.actorCompany}</span></p>
                                    </div>
                                    <ClientFormattedDate timestamp={log.timestamp} />
                                </div>
                                <div className="mt-1">
                                    <p className="text-sm">
                                        <Badge variant={userActionStyles[log.action]}>{log.action}</Badge>
                                        <span className="text-muted-foreground ml-2">on user</span>
                                        <span className="font-medium mx-1.5">{log.targetUserName}</span>
                                        <span className="text-muted-foreground">({log.targetCompany})</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );

     const JobLog = () => (
        <Card>
           <CardContent className="pt-6">
                <ScrollArea className="max-h-[60vh]">
                     <div className="relative pl-6">
                        <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                        {isLoadingJobLog ? <LogSkeleton /> : jobAuditLog?.map(log => (
                            <div key={log.id} className="relative mb-8 pl-8">
                                <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                    <div className="text-primary">{getJobEventIcon(log.action)}</div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">{log.actorName} <span className="text-muted-foreground font-normal">({log.actorRole})</span></p>
                                    </div>
                                    <ClientFormattedDate timestamp={log.timestamp} />
                                </div>
                                <div className="mt-1">
                                    <p className="text-sm">
                                        <Badge variant={jobActionStyles[log.action]}>{log.action}</Badge>
                                        <span className="text-muted-foreground ml-2">on job</span>
                                        <span className="font-medium mx-1.5">{log.jobTitle}</span>
                                        <span className="font-extrabold text-xs">({log.jobId})</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 italic">"{log.details}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );

     const BillingLog = () => (
        <Card>
            <CardContent className="pt-6">
                <ScrollArea className="max-h-[60vh]">
                     <div className="relative pl-6">
                        <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2" />
                        {isLoadingBillingLog ? <LogSkeleton /> : billingAuditLog?.map(log => (
                            <div key={log.id} className="relative mb-8 pl-8">
                                <div className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary">
                                    <div className="text-primary">{getBillingEventIcon(log.action)}</div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">{log.companyName}</p>
                                    </div>
                                    <ClientFormattedDate timestamp={log.timestamp} />
                                </div>
                                <div className="mt-1">
                                    <p className="text-sm">
                                        <Badge variant={billingActionStyles[log.action]}>{log.action}</Badge>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 italic">"{log.details}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <History className="text-primary" />
                    Platform Audit Log
                </h1>
            </div>

            <Tabs defaultValue="user-management" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4">
                    <TabsTrigger value="user-management" className="gap-2"><User className="text-primary" /> User Management</TabsTrigger>
                    <TabsTrigger value="job-activity" className="gap-2"><Briefcase className="text-primary" /> Job Activity</TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2"><DollarSign className="text-primary" /> Billing Events</TabsTrigger>
                </TabsList>
                <TabsContent value="user-management">
                   <UserLog />
                </TabsContent>
                <TabsContent value="job-activity">
                    <JobLog />
                </TabsContent>
                <TabsContent value="billing">
                    <BillingLog />
                </TabsContent>
            </Tabs>
        </div>
    );
}
