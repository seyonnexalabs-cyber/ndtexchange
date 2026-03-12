
'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn, safeParseDate } from '@/lib/utils';
import { useMemo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Payment, Subscription, Plan, PlatformUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PricingTable } from '@/app/components/pricing-table';

const ClientFormattedDate = ({ date, formatString }: { date: Date | null, formatString: string }) => {
    const [formatted, setFormatted] = useState<string | null>(null);
    useEffect(() => {
        if (date) {
            setFormatted(format(date, formatString));
        }
    }, [date, formatString]);

    if (!formatted) return null;
    return <>{formatted}</>;
};

const PaymentHistory = ({ companyName }: { companyName: string }) => {
    const { firestore } = useFirebase();
    const paymentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('companyName', '==', companyName), orderBy('date', 'desc')) : null, [firestore, companyName]);
    const { data: companyPayments, isLoading } = useCollection<Payment>(paymentsQuery);
    
    const subscriptionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'subscriptions'), where('companyName', '==', companyName)) : null, [firestore, companyName]);
    const { data: companySubscriptions } = useCollection<Subscription>(subscriptionsQuery);
    
    if (isLoading) {
        return <Skeleton className="h-48" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>A record of your subscription payments to NDT EXCHANGE.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Invoice</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companyPayments && companyPayments.length > 0 ? companyPayments.map(payment => {
                            const sub = companySubscriptions?.find(s => s.id === payment.subscriptionId);
                            const paymentDate = safeParseDate(payment.date);
                            return (
                                <TableRow key={payment.id}>
                                    <TableCell><ClientFormattedDate date={paymentDate} formatString={GLOBAL_DATE_FORMAT} /></TableCell>
                                    <TableCell>${payment.amount.toLocaleString()}</TableCell>
                                    <TableCell>{sub?.plan || 'N/A'}</TableCell>
                                    <TableCell><Badge variant={payment.status === 'Succeeded' ? 'success' : 'destructive'}>{payment.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">Download</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No payment history found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
};


export default function BillingPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const { firestore } = useFirebase();

    const { data: plans, isLoading: isLoadingPlans } = useCollection<Plan>(useMemoFirebase(() => firestore ? collection(firestore, 'plans') : null, [firestore]));

    const currentUser = useMemo(() => userDetails[role as keyof typeof userDetails] || userDetails.client, [role]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handlePlanSelect = (plan: Plan, priceInCents: number, billingCycle: 'monthly' | 'yearly') => {
        if (priceInCents === Infinity) {
             const mailtoHref = `mailto:sales@ndtexchange.com?subject=Subscription Upgrade Request: ${plan.name} Plan&body=Hello, I'm interested in upgrading to the ${plan.name} plan. Please provide me with more details.`;
             window.location.href = mailtoHref;
        } else {
            const options = {
                "key": "rzp_test_SCmu4c9MVES9Ei", // Public Test Key
                "amount": priceInCents,
                "currency": 'USD',
                "name": "NDT EXCHANGE",
                "description": `Subscription for ${plan.name} (${billingCycle})`,
                "image": "https://placehold.co/128x128/3B82F6/FFFFFF/png?text=NDT",
                "handler": function (response: any){
                    toast.success("Payment Successful!", {
                        description: `Payment ID: ${response.razorpay_payment_id}`,
                    });
                },
                "prefill": {
                    "name": currentUserProfile?.name,
                    "email": currentUserProfile?.email,
                },
                "theme": {
                    "color": "#3B82F6"
                }
            };
    
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        }
    };

    const plansByAudience = useMemo(() => {
        if (!plans) return [];
        let audience: 'Client' | 'Provider' | 'Auditor' = 'Client';
        switch (role) {
            case 'client': audience = 'Client'; break;
            case 'inspector': audience = 'Provider'; break;
            case 'auditor': audience = 'Auditor'; break;
        }
        return plans.filter(p => p.audience === audience && p.isPublic);
    }, [plans, role]);

  return (
    <div className="space-y-6">
        <Link
            href={constructUrl('/dashboard/settings')}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
            <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
            Back to Settings
        </Link>
      <div className="flex items-center gap-4">
        <CreditCard className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-2xl font-headline font-semibold">Subscription Plans</h1>
            <p className="text-muted-foreground">
                Choose a plan that fits your needs.
            </p>
        </div>
      </div>
      
        <section id="pricing" className="py-8 space-y-8">
            {role === 'admin' ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Subscription Management</CardTitle>
                        <CardDescription>You are viewing this page as a platform administrator. To manage plans, go to the main subscriptions page.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href={constructUrl('/dashboard/subscriptions')}>Manage All Subscriptions</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : role === 'auditor' ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Auditor & Regulator Access</CardTitle>
                        <CardDescription>Your access is managed through Client or Enterprise accounts.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <PricingTable 
                    plans={plansByAudience}
                    onPlanSelect={(plan, price, cycle) => handlePlanSelect(plan, price, cycle)}
                    currentPlanName={currentPlanName}
                    isLoading={isLoadingPlans || isLoadingSubscriptions || isLoadingProfile}
                />
            )}
           <p className="text-center text-muted-foreground mt-8 text-sm">
              All subscription plans are billed annually. Pricing is usage-based, determined by factors like platform hosting, data storage, and number of users. <strong>Please note: we process payments for platform subscriptions, but we do not process payments for the NDT jobs themselves.</strong> Contact our sales team for a detailed quote tailored to your needs.
           </p>
        </section>
        {(role === 'client' || role === 'inspector') && currentUserProfile && (
            <section id="payment-history">
                <PaymentHistory companyName={currentUserProfile.company} />
            </section>
        )}
    </div>
  );
}
