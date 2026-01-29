

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { jobPayments, JobPayment, jobs, Job, subscriptions, Subscription, clientData, payments, Payment } from "@/lib/placeholder-data";
import { serviceProviders } from '@/lib/service-providers-data';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Briefcase, Calendar, Building, HardHat, ShieldCheck, Calendar as CalendarIcon, Users, Database, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


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
                            <CalendarComponent
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

const userDetails = {
    client: { company: 'Global Energy Corp.' },
    inspector: { company: 'TEAM, Inc.' },
    auditor: { company: 'NDT Auditors LLC' },
    admin: { company: 'NDT Exchange' },
};

const subscriptionStatusStyles: { [key in Subscription['status']]: 'success' | 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Active: 'success',
    Trialing: 'default',
    'Past Due': 'destructive',
    Canceled: 'outline',
    'Payment Failed': 'destructive',
};

const paymentStatusStyles: { [key in Payment['status']]: 'success' | 'destructive' } = {
    Succeeded: 'success',
    Failed: 'destructive',
};

const planUserLimits: {[key: string]: number} = {
    'Client': 10,
    'Provider': 50,
    'Enterprise': 200,
    'Free Trial': 5,
};

const planStorageLimits: {[key: string]: number} = {
    'Client': 20,
    'Provider': 100,
    'Enterprise': 500,
    'Free Trial': 5,
};

const getContactEmailForSubscription = (subscription: Subscription) => {
    const client = clientData.find(c => c.id === subscription.companyId);
    return client?.contactEmail || '';
};

type MailtoDetails = { link: string; text: string; variant: 'destructive' | 'secondary' | 'default' | 'outline' | 'ghost' | 'link' | null | undefined };

const SubscriptionsDesktopView = ({ 
    getMailtoLink,
    selectedSubscriptions,
    setSelectedSubscriptions,
    allSubscriptions
}: { 
    getMailtoLink: (sub: Subscription) => MailtoDetails,
    selectedSubscriptions: string[],
    setSelectedSubscriptions: React.Dispatch<React.SetStateAction<string[]>>,
    allSubscriptions: Subscription[]
}) => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">
                        <Checkbox
                            checked={selectedSubscriptions.length === allSubscriptions.length && allSubscriptions.length > 0}
                            onCheckedChange={(checked) => {
                                setSelectedSubscriptions(checked ? allSubscriptions.map(s => s.id) : []);
                            }}
                            aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription ID</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Data Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allSubscriptions.map(sub => {
                    const userLimit = planUserLimits[sub.plan] || 1;
                    const storageLimit = planStorageLimits[sub.plan] || 1;
                    
                    const { link, text, variant } = getMailtoLink(sub);
                    const showContactButton = sub.status !== 'Active' && link !== '#';

                    return (
                        <TableRow key={sub.id} data-state={selectedSubscriptions.includes(sub.id) && "selected"}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedSubscriptions.includes(sub.id)}
                                    onCheckedChange={(checked) => {
                                        setSelectedSubscriptions(
                                            checked 
                                            ? [...selectedSubscriptions, sub.id] 
                                            : selectedSubscriptions.filter(id => id !== sub.id)
                                        );
                                    }}
                                    aria-label="Select row"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{sub.companyName}</TableCell>
                            <TableCell>{sub.plan}</TableCell>
                            <TableCell><Badge variant={subscriptionStatusStyles[sub.status]}>{sub.status}</Badge></TableCell>
                            <TableCell className="font-mono font-semibold">{sub.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{sub.userCount} / {userLimit}</span>
                                    <Progress value={(sub.userCount / userLimit) * 100} className="w-20 h-2"/>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{sub.dataUsageGB} / {storageLimit} GB</span>
                                    <Progress value={(sub.dataUsageGB / storageLimit) * 100} className="w-20 h-2"/>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {showContactButton ? (
                                    <Button asChild variant={variant} size="sm">
                                        <Link href={link}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            {text}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm">Manage</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </Card>
);

const SubscriptionsMobileView = ({ 
    getMailtoLink,
    selectedSubscriptions,
    setSelectedSubscriptions,
    allSubscriptions
}: { 
    getMailtoLink: (sub: Subscription) => MailtoDetails,
    selectedSubscriptions: string[],
    setSelectedSubscriptions: React.Dispatch<React.SetStateAction<string[]>>,
    allSubscriptions: Subscription[]
}) => (
    <div className="space-y-4">
        {allSubscriptions.map(sub => {
            const userLimit = planUserLimits[sub.plan] || 1;
            const storageLimit = planStorageLimits[sub.plan] || 1;
            
            const { link, text, variant } = getMailtoLink(sub);
            const showContactButton = sub.status !== 'Active' && link !== '#';

            return (
                <Card key={sub.id} className="relative">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="pr-12">
                                <CardTitle>{sub.companyName}</CardTitle>
                                <Badge variant={subscriptionStatusStyles[sub.status]} className="mt-2">{sub.status}</Badge>
                            </div>
                             <Checkbox
                                checked={selectedSubscriptions.includes(sub.id)}
                                onCheckedChange={(checked) => {
                                    setSelectedSubscriptions(
                                        checked 
                                        ? [...selectedSubscriptions, sub.id] 
                                        : selectedSubscriptions.filter(id => id !== sub.id)
                                    );
                                }}
                                aria-label="Select row"
                                className="absolute top-4 right-4 h-5 w-5"
                            />
                        </div>
                        <CardDescription>{sub.plan} Plan &bull; ID: <span className="font-mono font-semibold text-foreground">{sub.id}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4" /> Users</span>
                                <span>{sub.userCount} / {userLimit}</span>
                            </div>
                            <Progress value={(sub.userCount / userLimit) * 100} className="h-2"/>
                        </div>
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground flex items-center gap-1"><Database className="w-4 h-4" /> Data</span>
                                <span>{sub.dataUsageGB} / {storageLimit} GB</span>
                            </div>
                            <Progress value={(sub.dataUsageGB / storageLimit) * 100} className="h-2"/>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                         {showContactButton ? (
                            <Button asChild variant={variant} size="sm">
                                <Link href={link}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    {text}
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm">Manage Subscription</Button>
                        )}
                    </CardFooter>
                </Card>
            )
        })}
    </div>
);


const PaymentHistoryDesktopView = () => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.map(payment => (
                    <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.date), GLOBAL_DATE_FORMAT)}</TableCell>
                        <TableCell className="font-medium">{payment.companyName}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={paymentStatusStyles[payment.status]}>{payment.status}</Badge></TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{payment.subscriptionId}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
);

const PaymentHistoryMobileView = () => (
    <div className="space-y-4">
        {payments.map(payment => (
            <Card key={payment.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle>{payment.companyName}</CardTitle>
                        <Badge variant={paymentStatusStyles[payment.status]}>{payment.status}</Badge>
                    </div>
                    <CardDescription>Subscription: <span className="font-mono font-semibold text-foreground">{payment.subscriptionId}</span> &bull; Paid: {format(new Date(payment.date), GLOBAL_DATE_FORMAT)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${payment.amount.toLocaleString()}</p>
                </CardContent>
            </Card>
        ))}
    </div>
);

export default function SubscriptionsPage() {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState("subscriptions");
    const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
    const [isBulkMailOpen, setBulkMailOpen] = useState(false);
    const { toast } = useToast();

    const getMailtoLink = (sub: Subscription): MailtoDetails => {
        const contactEmail = getContactEmailForSubscription(sub);
        if (!contactEmail) return { link: '#', text: 'Manage', variant: 'secondary' };

        let subject = '';
        let body = '';
        let text = 'Contact User';
        let variant: MailtoDetails['variant'] = 'secondary';

        switch (sub.status) {
            case 'Trialing':
                subject = `Your NDT Exchange Trial is Ending Soon`;
                body = `Dear ${sub.companyName} team,\n\nWe hope you're enjoying your trial of NDT Exchange. To ensure uninterrupted access to your account and data, please contact us to upgrade to a full plan before your trial ends on ${sub.endDate ? format(new Date(sub.endDate), GLOBAL_DATE_FORMAT): ''}.\n\nWe're here to help you choose the best plan for your needs.\n\nThank you,\nThe NDT Exchange Team`;
                text = 'Encourage Upgrade';
                variant = 'default';
                break;
            case 'Past Due':
                subject = `Action Required: Your NDT Exchange Subscription is Past Due`;
                body = `Dear ${sub.companyName} team,\n\nOur records indicate that your NDT Exchange subscription payment is currently past due. To avoid any service interruption, please contact us to resolve this issue.\n\nThank you,\nThe NDT Exchange Team`;
                text = 'Resolve Issue';
                variant = 'destructive';
                break;
            case 'Payment Failed':
                subject = `Urgent: NDT Exchange Subscription Payment Failed`;
                body = `Dear ${sub.companyName} team,\n\nWe were unable to process the payment for your NDT Exchange subscription. Please update your payment information or contact us immediately to avoid service disruption.\n\nThank you,\nThe NDT Exchange Team`;
                text = 'Resolve Issue';
                variant = 'destructive';
                break;
            case 'Canceled':
                subject = `Regarding Your Canceled NDT Exchange Subscription`;
                body = `Dear ${sub.companyName} team,\n\nWe noticed your subscription to NDT Exchange has been canceled. We'd appreciate any feedback you have, and we'd love to welcome you back. Please let us know if there's anything we can do to help.\n\nThank you,\nThe NDT Exchange Team`;
                text = 'Contact User';
                variant = 'secondary';
                break;
            default:
                return { link: '#', text: 'Manage', variant: 'secondary' };
        }

        const link = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return { link, text, variant };
    };
    
    const bulkMailSummary = useMemo(() => {
        if (!isBulkMailOpen) return null;

        const summary: {[key: string]: {count: number, template: string}} = {
            'Trialing': { count: 0, template: 'Trial Ending Reminder' },
            'Past Due': { count: 0, template: 'Past Due Notice' },
            'Payment Failed': { count: 0, template: 'Payment Failed Notice' },
            'Canceled': { count: 0, template: 'Canceled Subscription Win-back' },
        };

        selectedSubscriptions.forEach(subId => {
            const sub = subscriptions.find(s => s.id === subId);
            if (sub && sub.status in summary) {
                summary[sub.status as keyof typeof summary].count++;
            }
        });

        return summary;
    }, [isBulkMailOpen, selectedSubscriptions]);

    const handleBulkEmailSend = () => {
        if (selectedSubscriptions.length === 0) {
            toast({
                variant: 'destructive',
                title: "No subscriptions selected",
                description: "Please select one or more subscriptions to send a bulk email."
            });
            return;
        }
        toast({
            title: "Mail Merge Initiated",
            description: `A mail merge has been initiated for ${selectedSubscriptions.length} companies.`
        });
        setBulkMailOpen(false);
        setSelectedSubscriptions([]);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <DollarSign/>
                        Subscription Management
                    </h1>
                </div>
                {activeTab === 'subscriptions' && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                         <Button
                            variant="outline"
                            disabled={selectedSubscriptions.length === 0}
                            onClick={() => setBulkMailOpen(true)}
                            className="w-full sm:w-auto"
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Bulk Email ({selectedSubscriptions.length})
                        </Button>
                        <Button className="w-full sm:w-auto">Create Subscription</Button>
                    </div>
                )}
            </div>
            
            <Tabs defaultValue="subscriptions" onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="payment-history">Payment History</TabsTrigger>
                </TabsList>
                <TabsContent value="subscriptions">
                     {isMobile 
                        ? <SubscriptionsMobileView 
                            getMailtoLink={getMailtoLink} 
                            selectedSubscriptions={selectedSubscriptions} 
                            setSelectedSubscriptions={setSelectedSubscriptions}
                            allSubscriptions={subscriptions}
                          /> 
                        : <SubscriptionsDesktopView 
                            getMailtoLink={getMailtoLink}
                            selectedSubscriptions={selectedSubscriptions} 
                            setSelectedSubscriptions={setSelectedSubscriptions}
                            allSubscriptions={subscriptions}
                          />
                    }
                </TabsContent>
                <TabsContent value="payment-history">
                    {isMobile ? <PaymentHistoryMobileView /> : <PaymentHistoryDesktopView />}
                </TabsContent>
            </Tabs>
            
             <Dialog open={isBulkMailOpen} onOpenChange={setBulkMailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Mail Merge</DialogTitle>
                        <DialogDescription>
                            You are about to send status-specific emails to {selectedSubscriptions.length} selected companies. Please review the summary below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <h4 className="font-semibold">Email Breakdown:</h4>
                        {bulkMailSummary && Object.entries(bulkMailSummary).map(([status, data]) => {
                            if (data.count === 0) return null;
                            return (
                                <div key={status} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">{data.template}:</span>
                                    <span className="font-medium">{data.count} companies</span>
                                </div>
                            )
                        })}
                         {bulkMailSummary && Object.values(bulkMailSummary).every(v => v.count === 0) && (
                            <p className="text-sm text-muted-foreground text-center">
                                No companies selected with a status that has a bulk email template.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setBulkMailOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkEmailSend} disabled={bulkMailSummary && Object.values(bulkMailSummary).every(v => v.count === 0)}>Confirm & Send</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
