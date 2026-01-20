
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { jobPayments, JobPayment } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Briefcase, Calendar, Building, HardHat } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';

const paymentStatusVariants: Record<JobPayment['status'], 'success' | 'outline'> = {
    'Paid': 'success',
    'Pending': 'outline',
};

const userDetails = {
    client: { company: 'Global Energy Corp.' },
    inspector: { company: 'TEAM, Inc.' },
    auditor: { company: 'NDT Auditors LLC' },
    admin: { company: 'NDT Exchange' },
};

const PaymentsPage = () => {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    
    const { filteredPayments, title, canRecordPayment } = useMemo(() => {
        const currentUserCompany = userDetails[role as keyof typeof userDetails]?.company;
        let payments: JobPayment[] = [];
        let pageTitle = 'Payment Tracking';
        let showRecordButton = false;

        if (role === 'admin') {
            payments = jobPayments;
            pageTitle = 'All Job Payments';
        } else if (role === 'client') {
            payments = jobPayments.filter(p => p.client === currentUserCompany);
            pageTitle = 'Payments Made';
            showRecordButton = true;
        } else if (role === 'inspector') {
            payments = jobPayments.filter(p => p.provider === currentUserCompany);
            pageTitle = 'Payments Received';
            showRecordButton = true;
        }
        
        return { filteredPayments: payments, title: pageTitle, canRecordPayment: showRecordButton };
    }, [role]);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }
    
    if (role === 'auditor') {
        return (
            <div className="text-center p-10 border rounded-lg">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-headline">Payment Tracking</h2>
                <p className="mt-2 text-muted-foreground">Payment tracking between clients and providers is not applicable to the auditor role.</p>
            </div>
        );
    }

    const DesktopView = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job Title</TableHead>
                        {role === 'admin' && <TableHead>Client</TableHead>}
                        {role === 'admin' && <TableHead>Provider</TableHead>}
                        {role === 'inspector' && <TableHead>From Client</TableHead>}
                        {role === 'client' && <TableHead>To Provider</TableHead>}
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPayments.map(payment => (
                        <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.jobTitle}</TableCell>
                            {role === 'admin' && <TableCell>{payment.client}</TableCell>}
                            {role === 'admin' && <TableCell>{payment.provider}</TableCell>}
                            {role === 'inspector' && <TableCell>{payment.client}</TableCell>}
                            {role === 'client' && <TableCell>{payment.provider}</TableCell>}
                            <TableCell>${payment.amount.toLocaleString()}</TableCell>
                            <TableCell>{format(new Date(payment.paidOn), GLOBAL_DATE_FORMAT)}</TableCell>
                            <TableCell><Badge variant={paymentStatusVariants[payment.status]}>{payment.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={constructUrl(`/dashboard/my-jobs/${payment.jobId}`)}>View Job</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );

    const MobileView = () => (
        <div className="space-y-4">
            {filteredPayments.map(payment => (
                 <Card key={payment.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{payment.jobTitle}</CardTitle>
                            <Badge variant={paymentStatusVariants[payment.status]}>{payment.status}</Badge>
                        </div>
                        <CardDescription>
                            {role === 'client' ? `To: ${payment.provider}` : `From: ${payment.client}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">${payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Paid on {format(new Date(payment.paidOn), GLOBAL_DATE_FORMAT)}</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={constructUrl(`/dashboard/my-jobs/${payment.jobId}`)}>View Job Details</Link>
                        </Button>
                    </CardFooter>
                 </Card>
            ))}
        </div>
    );
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <DollarSign/>
                    {title}
                </h1>
                {canRecordPayment && (
                    <Button>Record a Payment</Button>
                )}
            </div>

            {filteredPayments.length > 0 ? (
                isMobile ? <MobileView /> : <DesktopView />
            ) : (
                 <div className="text-center p-10 border rounded-lg">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-headline">No Payments Found</h2>
                    <p className="mt-2 text-muted-foreground">There are no payment records to display for your account.</p>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
