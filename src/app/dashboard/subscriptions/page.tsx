

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { jobs, subscriptions as initialSubscriptions, Subscription, clientData, payments as allPayments, Payment } from "@/lib/placeholder-data";
import { serviceProviders } from '@/lib/service-providers-data';
import { auditFirms } from '@/lib/auditors-data';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Mail, Users, Database, Edit, MoreVertical, Briefcase, Calendar as CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDateInput } from '@/components/ui/custom-date-input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { subscriptionPlans as initialPlans, Plan, subscriptionPlanDetails } from '@/lib/subscription-plans';
import { Switch } from '@/components/ui/switch';


const subscriptionSchema = z.object({
  id: z.string().optional(),
  companyId: z.string({ required_error: "Please select a company." }),
  plan: z.string(),
  status: z.enum(['Active', 'Trialing', 'Past Due', 'Canceled', 'Payment Failed']),
  startDate: z.date(),
  endDate: z.date().optional(),
  userLimit: z.coerce.number().min(1, "User limit must be at least 1."),
  dataLimitGB: z.coerce.number().min(1, "Data limit must be at least 1 GB."),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

const SubscriptionForm = ({ 
    formId,
    onSubmit, 
    defaultValues,
    isEditing
}: { 
    formId: string, 
    onSubmit: (values: SubscriptionFormValues) => void,
    defaultValues?: Partial<SubscriptionFormValues>,
    isEditing: boolean
}) => {
    const form = useForm<SubscriptionFormValues>({
        resolver: zodResolver(subscriptionSchema),
        defaultValues: defaultValues,
    });

    const plan = form.watch('plan');
    const userLimit = form.watch('userLimit');
    const dataLimitGB = form.watch('dataLimitGB');
    
    // Effect to update limits when a standard plan is chosen
    useEffect(() => {
        const planDetails = Object.values(subscriptionPlanDetails).find(p => p.name === plan);
        if (plan && plan !== 'Custom' && planDetails) {
            if (form.getValues('userLimit') !== planDetails.userLimit) {
                form.setValue('userLimit', planDetails.userLimit);
            }
            if (form.getValues('dataLimitGB') !== planDetails.dataLimitGB) {
                form.setValue('dataLimitGB', planDetails.dataLimitGB);
            }
        }
    }, [plan, form]);

    // Effect to set plan to "Custom" if limits are manually changed
    useEffect(() => {
        const planDetails = Object.values(subscriptionPlanDetails).find(p => p.name === plan);
        if (plan && plan !== 'Custom' && planDetails) {
            if (userLimit !== planDetails.userLimit || dataLimitGB !== planDetails.dataLimitGB) {
                form.setValue('plan', 'Custom');
            }
        }
    }, [userLimit, dataLimitGB, plan, form]);

    const allCompanies = useMemo(() => {
        return [
            ...clientData.map(c => ({ id: c.id, name: c.name, type: 'Client' })),
            ...serviceProviders.map(p => ({ id: p.id, name: p.name, type: 'Provider' })),
            ...auditFirms.map(a => ({ id: a.id, name: a.name, type: 'Auditor' }))
        ].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditing}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {allCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Plan</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {initialPlans.map(p => (
                                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                    ))}
                                    <SelectItem value="Custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Trialing">Trialing</SelectItem>
                                    <SelectItem value="Past Due">Past Due</SelectItem>
                                    <SelectItem value="Canceled">Canceled</SelectItem>
                                    <SelectItem value="Payment Failed">Payment Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <FormControl><CustomDateInput {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date (Optional)</FormLabel>
                                <FormControl><CustomDateInput {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="userLimit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>User Limit</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="dataLimitGB"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data Limit (GB)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    );
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

const getContactEmailForSubscription = (subscription: Subscription) => {
    const client = clientData.find(c => c.id === subscription.companyId);
    return client?.contactEmail || '';
};

type MailtoDetails = { link: string; text: string; variant: 'destructive' | 'secondary' | 'default' | 'outline' | 'ghost' | 'link' | null | undefined };

const SubscriptionsDesktopView = ({ 
    onEdit,
    getMailtoLink,
    selectedSubscriptions,
    setSelectedSubscriptions,
    allSubscriptions
}: { 
    onEdit: (subscription: Subscription) => void;
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
                            <TableCell className="font-extrabold">{sub.id}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{sub.userCount} / {sub.userLimit}</span>
                                    <Progress value={(sub.userCount / sub.userLimit) * 100} className="w-20 h-2"/>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span>{sub.dataUsageGB} / {sub.dataLimitGB} GB</span>
                                    <Progress value={(sub.dataUsageGB / sub.dataLimitGB) * 100} className="w-20 h-2"/>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(sub)}>
                                            <Edit className="mr-2 h-4 w-4"/> Edit
                                        </DropdownMenuItem>
                                        {showContactButton && (
                                            <DropdownMenuItem asChild>
                                                 <Link href={link}>
                                                    <Mail className="mr-2 h-4 w-4" /> {text}
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </Card>
);

const SubscriptionsMobileView = ({ 
    onEdit,
    getMailtoLink,
    selectedSubscriptions,
    setSelectedSubscriptions,
    allSubscriptions
}: { 
    onEdit: (subscription: Subscription) => void;
    getMailtoLink: (sub: Subscription) => MailtoDetails,
    selectedSubscriptions: string[],
    setSelectedSubscriptions: React.Dispatch<React.SetStateAction<string[]>>,
    allSubscriptions: Subscription[]
}) => (
    <div className="space-y-4">
        {allSubscriptions.map(sub => {
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
                        <CardDescription>{sub.plan} Plan &bull; ID: <span className="font-extrabold text-foreground">{sub.id}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4" /> Users</span>
                                <span>{sub.userCount} / {sub.userLimit}</span>
                            </div>
                            <Progress value={(sub.userCount / sub.userLimit) * 100} className="h-2"/>
                        </div>
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground flex items-center gap-1"><Database className="w-4 h-4" /> Data</span>
                                <span>{sub.dataUsageGB} / {sub.dataLimitGB} GB</span>
                            </div>
                            <Progress value={(sub.dataUsageGB / sub.dataLimitGB) * 100} className="h-2"/>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    Manage
                                    <MoreVertical className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(sub)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Edit
                                </DropdownMenuItem>
                                {showContactButton && (
                                    <DropdownMenuItem asChild>
                                        <Link href={link}>
                                            <Mail className="mr-2 h-4 w-4" /> {text}
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                {allPayments.map(payment => (
                    <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.date), GLOBAL_DATE_FORMAT)}</TableCell>
                        <TableCell className="font-medium">{payment.companyName}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge variant={paymentStatusStyles[payment.status]}>{payment.status}</Badge></TableCell>
                        <TableCell className="font-extrabold text-xs">{payment.subscriptionId}</TableCell>
                    </TableRow>
                ))}
                 {allPayments.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No payment history found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Card>
);

const PaymentHistoryMobileView = () => (
    <div className="space-y-4">
        {allPayments.map(payment => (
            <Card key={payment.id}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle>{payment.companyName}</CardTitle>
                        <Badge variant={paymentStatusStyles[payment.status]}>{payment.status}</Badge>
                    </div>
                    <CardDescription>Subscription: <span className="font-extrabold text-foreground">{payment.subscriptionId}</span> &bull; Paid: {format(new Date(payment.date), GLOBAL_DATE_FORMAT)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${payment.amount.toLocaleString()}</p>
                </CardContent>
            </Card>
        ))}
         {allPayments.length === 0 && (
            <div className="text-center p-10 text-muted-foreground">
                No payment history found.
            </div>
        )}
    </div>
);

const PlanManagementView = () => {
    const [plans, setPlans] = useState<Plan[]>(initialPlans);
    const { toast } = useToast();

    const handlePlanStatusChange = (planId: string, isActive: boolean) => {
        setPlans(prevPlans => prevPlans.map(p => p.id === planId ? { ...p, isActive } : p));
        toast({
            title: `Plan ${isActive ? 'Enabled' : 'Disabled'}`,
            description: `${plans.find(p => p.id === planId)?.name} will now be ${isActive ? 'visible' : 'hidden'} on the public pricing page.`
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Plan Management</CardTitle>
                <CardDescription>Enable or disable subscription plans to control their visibility on the public pricing page.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Plan Name</TableHead>
                            <TableHead>Audience</TableHead>
                            <TableHead>Price (USD)</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Assets/Equip.</TableHead>
                            <TableHead>Marketplace</TableHead>
                            <TableHead>Reporting</TableHead>
                            <TableHead>API</TableHead>
                            <TableHead>Branding</TableHead>
                            <TableHead>Public</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map(plan => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell>{plan.audience}</TableCell>
                                <TableCell>{plan.price.monthly.USD}</TableCell>
                                <TableCell>{plan.userLimit}</TableCell>
                                <TableCell>{plan.dataLimitGB} GB</TableCell>
                                <TableCell>
                                    {plan.audience === 'Client' ? plan.assetLimit : plan.equipmentLimit}
                                </TableCell>
                                <TableCell>
                                    {plan.marketplaceAccess ? (plan.biddingLimit === 'Unlimited' ? 'Unlimited Bids' : (plan.biddingLimit > 0 ? `${plan.biddingLimit} bids/mo` : 'Post Jobs')) : 'N/A'}
                                </TableCell>
                                <TableCell>{plan.reportingLevel}</TableCell>
                                <TableCell>{plan.apiAccess ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-muted-foreground" />}</TableCell>
                                <TableCell>{plan.customBranding ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-muted-foreground" />}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={plan.isActive}
                                        onCheckedChange={(checked) => handlePlanStatusChange(plan.id, checked as boolean)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default function SubscriptionsPage() {
    const isMobile = useMobile();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const [activeTab, setActiveTab] = useState("subscriptions");
    const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
    const [isBulkMailOpen, setBulkMailOpen] = useState(false);
    const { toast } = useToast();
    
    const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        if (role && role !== 'admin') {
            router.replace(`/dashboard?${searchParams.toString()}`);
        }
    }, [role, router, searchParams]);

    const handleAddClick = () => {
        setEditingSubscription(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setIsFormOpen(true);
    };
    
    const closeDialog = () => {
        setIsFormOpen(false);
        setEditingSubscription(null);
    }
    
    const handleFormSubmit = (values: SubscriptionFormValues) => {
        const company = [...clientData, ...serviceProviders, ...auditFirms].find(c => c.id === values.companyId);
        
        if (editingSubscription) {
            // Update existing subscription
            setSubscriptions(prev => prev.map(s => 
                s.id === editingSubscription.id 
                    ? { 
                        ...s,
                        ...values,
                        companyName: company?.name || s.companyName, 
                        startDate: format(values.startDate, 'yyyy-MM-dd'), 
                        endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : undefined 
                      } 
                    : s
            ));
            toast({ title: "Subscription Updated", description: `The subscription for ${company?.name} has been updated.` });
        } else {
            // Create new subscription
            const newSubscription: Subscription = {
                id: `SUB-${Date.now()}`,
                companyId: values.companyId,
                companyName: company?.name || 'Unknown Company',
                plan: values.plan,
                status: values.status,
                startDate: format(values.startDate, 'yyyy-MM-dd'),
                endDate: values.endDate ? format(values.endDate, 'yyyy-MM-dd') : undefined,
                userCount: 0,
                dataUsageGB: 0,
                userLimit: values.userLimit,
                dataLimitGB: values.dataLimitGB,
            };
            setSubscriptions(prev => [newSubscription, ...prev]);
            toast({ title: "Subscription Created", description: `A new subscription has been created for ${company?.name}.` });
        }
        closeDialog();
    };

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
    }, [isBulkMailOpen, selectedSubscriptions, subscriptions]);

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

    if (role !== 'admin') {
        return null;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-headline font-semibold flex items-center gap-3">
                        <DollarSign className="text-primary" />
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
                        <Button className="w-full sm:w-auto" onClick={handleAddClick}>Create Subscription</Button>
                    </div>
                )}
            </div>
            
            <Tabs defaultValue="subscriptions" onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="subscriptions">Company Subscriptions</TabsTrigger>
                    <TabsTrigger value="plans">Plan Management</TabsTrigger>
                    <TabsTrigger value="payment-history">Payment History</TabsTrigger>
                </TabsList>
                <TabsContent value="subscriptions">
                     {isMobile 
                        ? <SubscriptionsMobileView 
                            onEdit={handleEditClick}
                            getMailtoLink={getMailtoLink} 
                            selectedSubscriptions={selectedSubscriptions} 
                            setSelectedSubscriptions={setSelectedSubscriptions}
                            allSubscriptions={subscriptions}
                          /> 
                        : <SubscriptionsDesktopView 
                            onEdit={handleEditClick}
                            getMailtoLink={getMailtoLink}
                            selectedSubscriptions={selectedSubscriptions} 
                            setSelectedSubscriptions={setSelectedSubscriptions}
                            allSubscriptions={subscriptions}
                          />
                    }
                </TabsContent>
                <TabsContent value="plans">
                    <PlanManagementView />
                </TabsContent>
                <TabsContent value="payment-history">
                    {isMobile ? <PaymentHistoryMobileView /> : <PaymentHistoryDesktopView />}
                </TabsContent>
            </Tabs>
            
            <Dialog open={isFormOpen} onOpenChange={closeDialog}>
                <DialogContent className="flex flex-col max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>{editingSubscription ? 'Edit Subscription' : 'Create New Subscription'}</DialogTitle>
                        <DialogDescription>
                             {editingSubscription
                                ? `Editing subscription for ${editingSubscription.companyName}.`
                                : 'Create a new subscription plan for a company.'}
                        </DialogDescription>
                    </DialogHeader>
                     <div className="flex-grow overflow-y-auto px-6">
                        <SubscriptionForm
                            formId="subscription-form"
                            onSubmit={handleFormSubmit}
                            defaultValues={editingSubscription ? {
                                ...editingSubscription,
                                startDate: new Date(editingSubscription.startDate),
                                endDate: editingSubscription.endDate ? new Date(editingSubscription.endDate) : undefined,
                            } : { startDate: new Date(), userLimit: 5, dataLimitGB: 5, plan: 'Free Trial', status: 'Trialing' }}
                            isEditing={!!editingSubscription}
                        />
                     </div>
                     <DialogFooter className="p-6 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" form="subscription-form">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
