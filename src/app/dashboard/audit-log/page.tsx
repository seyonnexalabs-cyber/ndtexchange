
'use client';

import * as React from 'react';
import { userAuditLog, jobAuditLog, billingAuditLog, UserAuditLog, JobAuditLog, BillingAuditLog } from '@/lib/placeholder-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, User, Briefcase, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { GLOBAL_DATETIME_FORMAT } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


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

export default function AuditLogPage() {
    const isMobile = useIsMobile();

    const UserLog = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target User</TableHead>
                        <TableHead>Target Company</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userAuditLog.map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs">{format(new Date(log.timestamp), GLOBAL_DATETIME_FORMAT)}</TableCell>
                            <TableCell>{log.actorName}</TableCell>
                            <TableCell><Badge variant={userActionStyles[log.action]}>{log.action}</Badge></TableCell>
                            <TableCell>{log.targetUserName}</TableCell>
                            <TableCell>{log.targetCompany}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );

     const JobLog = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobAuditLog.map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs">{format(new Date(log.timestamp), GLOBAL_DATETIME_FORMAT)}</TableCell>
                            <TableCell className="font-medium">{log.jobTitle}</TableCell>
                            <TableCell>{log.actorName}</TableCell>
                            <TableCell><Badge variant={jobActionStyles[log.action]}>{log.action}</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{log.details}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );

     const BillingLog = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {billingAuditLog.map(log => (
                        <TableRow key={log.id}>
                            <TableCell className="text-xs">{format(new Date(log.timestamp), GLOBAL_DATETIME_FORMAT)}</TableCell>
                            <TableCell className="font-medium">{log.companyName}</TableCell>
                            <TableCell><Badge variant={billingActionStyles[log.action]}>{log.action}</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{log.details}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <History />
                    Platform Audit Log
                </h1>
            </div>

            <Tabs defaultValue="user-management" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4">
                    <TabsTrigger value="user-management" className="gap-2"><User /> User Management</TabsTrigger>
                    <TabsTrigger value="job-activity" className="gap-2"><Briefcase /> Job Activity</TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2"><DollarSign /> Billing & Subscriptions</TabsTrigger>
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
