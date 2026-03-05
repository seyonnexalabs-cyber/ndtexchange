

'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, HardHat, ShieldCheck, Calendar as CalendarIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, cn, safeParseDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, query, where, doc, setDoc, updateDoc } from 'firebase/firestore';
import type { Job, JobPayment, PlatformUser } from '@/lib/types';


const createPaymentSchema = (isClient: boolean, getJobById: (id: string) => Job | undefined) => {
    return z.object({
        jobId: z.string({ required_error: "Please select a job." }),
        payeeType: z.enum(['Provider', 'Auditor']).optional(),
        amount: z.coerce.number().positive({ message: "Please enter a positive amount." }),
        paymentDate: z.date({ required_error: "Please select a payment date." }),
        notes: z.string().optional(),
    }).refine(data => {
        if (!isClient || !data.jobId) return true;
        const job = getJobById(data.jobId);
        if (job && (job.workflow === 'level3' || job.workflow === 'auto')) {
            return !!data.payeeType;
        }
        return true;
    }, {
        message: "Please specify if this payment is for the Provider or Auditor.",
        path: ["payeeType"],
    });
};

type PaymentFormValues = z.infer<ReturnType<typeof createPaymentSchema>>;

const RecordPaymentForm = ({ 
    jobsForPayment, 
    role, 
    onCancel, 
    onSubmit,
    allJobs
}: { 
    jobsForPayment: Job[], 
    role: string, 
    onCancel: () => void, 
    onSubmit: (values: PaymentFormValues) => void,
    allJobs: Job[]
}) => {
    const paymentSchema = useMemo(() => createPaymentSchema(role === 'client', (id) => allJobs.find(j => j.id === id)), [role, allJobs]);
    
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentDate: new Date(),
        },
    });

    const selectedJobId = form.watch('jobId');
    const selectedJob = allJobs.find(j => j.id === selectedJobId);

    const requiresAuditorOption = role === 'client' && selectedJob && (selectedJob.workflow === 'level3' || selectedJob.workflow === 'auto');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                 <FormField
                    control={form.control}
                    name="jobId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a job to pay" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {jobsForPayment.length > 0 ? jobsForPayment.map(job => (
                                        <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                    )) : <SelectItem value="none" disabled>No eligible jobs found</SelectItem>}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {requiresAuditorOption && (
                     <FormField
                        control={form.control}
                        name="payeeType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment For</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a payee" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Provider">Service Provider</SelectItem>
                                        <SelectItem value="Auditor">Auditor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount Paid</FormLabel>
                             <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="number" placeholder="5000.00" className="pl-8" {...field} />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Payment Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, GLOBAL_DATE_FORMAT)
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g., Final payment via wire transfer" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Record Payment</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


const paymentStatusVariants: Record<JobPayment['status'], 'success' | 'outline'> = {
    'Paid': 'success',
    'Pending': 'outline',
};

const PaymentsPage = () => {
    const isMobile = useMobile();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const { toast } = useToast();
    const { firestore, user } = useFirebase();

    const { data: jobPayments } = useCollection<JobPayment>(useMemoFirebase(() => (firestore && user) ? collection(firestore, 'jobPayments') : null, [firestore, user]));
    const { data: currentUser } = useDoc<PlatformUser>(useMemoFirebase(() => firestore && user ? doc(firestore, 'users', user.uid) : null, [firestore, user]));
    const { data: allCompanies } = useCollection<any>(useMemoFirebase(() => (firestore && user) ? collection(firestore, 'companies') : null, [firestore, user]));
    
    const jobsQuery = useMemoFirebase(() => {
        if (!firestore || !currentUser?.companyId) return null;
        if (role === 'client') {
            return query(collection(firestore, 'jobs'), where('clientCompanyId', '==', currentUser.companyId));
        }
        return null;
    }, [firestore, currentUser, role]);
    const { data: jobs } = useCollection<Job>(jobsQuery);
    
    const { filteredPayments, title, canRecordPayment } = useMemo(() => {
        if (!jobPayments || !currentUser) return { filteredPayments: [], title: 'Payment Tracking', canRecordPayment: false };

        const currentUserCompany = currentUser.company;
        let payments: JobPayment[] = [];
        let pageTitle = 'Payment Tracking';
        let showRecordButton = false;

        switch (role) {
            case 'admin':
                payments = jobPayments;
                pageTitle = 'All Job Payments';
                break;
            case 'client':
                payments = jobPayments.filter(p => p.payer === currentUserCompany);
                pageTitle = 'Payments Made';
                showRecordButton = true;
                break;
            case 'inspector':
                payments = jobPayments.filter(p => p.payee === currentUserCompany && p.payeeType === 'Provider');
                pageTitle = 'Payments Received';
                break;
            case 'auditor':
                payments = jobPayments.filter(p => p.payee === currentUserCompany && p.payeeType === 'Auditor');
                pageTitle = 'Audit Fees Received';
                break;
        }
        
        return { filteredPayments: payments.sort((a, b) => {
            const dateA = safeParseDate(a.paidOn);
            const dateB = safeParseDate(b.paidOn);
            if (!dateA || !dateB) return 0;
            return dateB.getTime() - dateA.getTime();
        }), title: pageTitle, canRecordPayment: showRecordButton };
    }, [role, jobPayments, currentUser]);

    const jobsForPayment = useMemo(() => {
        if (!jobs || !currentUser) return [];

        const currentUserCompany = currentUser.company;
        const paymentEligibleStatuses = ['Client Approved', 'Completed', 'Audit Approved'];
        if (role === 'client') {
            return jobs.filter(j => paymentEligibleStatuses.includes(j.status));
        }
        return [];
    }, [role, jobs, currentUser]);

    const handleFormSubmit = async (values: PaymentFormValues) => {
        if (!jobs || !currentUser || !firestore || !allCompanies) return;
        const job = jobs.find(j => j.id === values.jobId);
        if (!job) return;

        const provider = allCompanies.find(c => c.id === job.providerCompanyId);
        // This is a simplification. A real app would have a dedicated auditor assignment.
        const auditor = allCompanies.find(c => c.type === 'Auditor'); 

        let payeeName = '';
        let payeeType: 'Provider' | 'Auditor' = 'Provider';

        if (values.payeeType === 'Provider') {
            payeeName = provider?.name || 'Unknown Provider';
            payeeType = 'Provider';
        } else if (values.payeeType === 'Auditor') {
            payeeName = auditor?.name || 'NDT Auditors LLC';
            payeeType = 'Auditor';
        } else {
            // Default to provider if type is not specified (e.g., standard workflow)
            payeeName = provider?.name || 'Unknown Provider';
        }

        const newPaymentRef = doc(collection(firestore, 'jobPayments'));
        
        const newPaymentData: Omit<JobPayment, 'id'> = {
            jobId: values.jobId,
            jobTitle: job.title,
            amount: values.amount,
            payer: currentUser.company,
            payee: payeeName,
            payeeType: payeeType,
            paidOn: format(values.paymentDate, 'yyyy-MM-dd'),
            status: 'Paid',
        };

        try {
            await setDoc(newPaymentRef, { id: newPaymentRef.id, ...newPaymentData });

            // If paying the provider, and not an auditor, update the job status.
            if (payeeType === 'Provider' && job.status !== 'Paid') {
                const jobDocRef = doc(firestore, 'jobs', job.id);
                await updateDoc(jobDocRef, { status: 'Paid' });
            }

            toast({
                title: "Payment Recorded",
                description: `A payment of $${values.amount.toLocaleString()} for job "${job.title}" has been recorded.`,
            });
            setIsRecordPaymentOpen(false);
        } catch (error) {
            console.error("Error recording payment: ", error);
            toast({
                variant: "destructive",
                title: "Failed to record payment",
                description: "An error occurred while saving the payment record."
            });
        }
    };

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }
    
    const DesktopView = () => (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Job Title</TableHead>
                        {role === 'admin' && <TableHead>From (Payer)</TableHead>}
                        {role === 'admin' && <TableHead>To (Payee)</TableHead>}
                        {role === 'client' && <TableHead>To (Payee)</TableHead>}
                        {(role === 'inspector' || role === 'auditor') && <TableHead>From (Payer)</TableHead>}
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPayments.map(payment => {
                        const paymentDate = safeParseDate(payment.paidOn);
                        return (
                            <TableRow key={payment.id}>
                                <TableCell className="font-extrabold text-xs">{payment.jobId}</TableCell>
                                <TableCell className="font-medium">{payment.jobTitle}</TableCell>
                                {role === 'admin' && <TableCell>{payment.payer}</TableCell>}
                                {role === 'admin' && (
                                    <TableCell className="flex items-center gap-2">
                                        {payment.payeeType === 'Provider' ? <HardHat className="w-4 h-4 text-muted-foreground" /> : <ShieldCheck className="w-4 h-4 text-muted-foreground" />}
                                        {payment.payee}
                                    </TableCell>
                                )}
                                {role === 'client' && <TableCell>{payment.payee}</TableCell>}
                                {(role === 'inspector' || role === 'auditor') && <TableCell>{payment.payer}</TableCell>}
                                <TableCell>${payment.amount.toLocaleString()}</TableCell>
                                <TableCell>{paymentDate ? format(paymentDate, GLOBAL_DATE_FORMAT) : 'N/A'}</TableCell>
                                <TableCell><Badge variant={paymentStatusVariants[payment.status]}>{payment.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={constructUrl(`/dashboard/my-jobs/${payment.jobId}`)}>View Job</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );

    const MobileView = () => (
        <div className="space-y-4">
            {filteredPayments.map(payment => {
                 const paymentDate = safeParseDate(payment.paidOn);
                 return (
                 <Card key={payment.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{payment.jobTitle}</CardTitle>
                            <Badge variant={paymentStatusVariants[payment.status]}>{payment.status}</Badge>
                        </div>
                        <CardDescription>
                            Job ID: <span className="font-extrabold text-foreground">{payment.jobId}</span> <br/>
                            {role === 'client' 
                                ? `To: ${payment.payee} (${payment.payeeType})` 
                                : `From: ${payment.payer}`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">${payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Paid on {paymentDate ? format(paymentDate, GLOBAL_DATE_FORMAT) : 'N/A'}</p>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={constructUrl(`/dashboard/my-jobs/${payment.jobId}`)}>View Job Details</Link>
                        </Button>
                    </CardFooter>
                 </Card>
            )})}
        </div>
    );
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                    <DollarSign className="text-primary" />
                    {title}
                </h1>
                {canRecordPayment && (
                    <Button onClick={() => setIsRecordPaymentOpen(true)}>Record a Payment</Button>
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
             <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Record a Payment</DialogTitle>
                        <DialogDescription>
                            Log an offline payment for a completed job to keep your records up to date.
                        </DialogDescription>
                    </DialogHeader>
                    <RecordPaymentForm
                        jobsForPayment={jobsForPayment}
                        role={role}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsRecordPaymentOpen(false)}
                        allJobs={jobs || []}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentsPage;
