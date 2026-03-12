
'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, ChevronLeft } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

function PricingCard({ plan, price, yearlyPrice, description, features, isFeatured, isCurrent = false, onUpgradeClick, billingCycle }: { 
    plan: string; 
    price: number; 
    yearlyPrice: number; 
    description: string; 
    features: string[], 
    isFeatured?: boolean, 
    isCurrent?: boolean,
    billingCycle: 'monthly' | 'yearly';
    onUpgradeClick: (plan: string, priceLabel: string) => void
}) {
  const displayPrice = billingCycle === 'monthly' ? price : yearlyPrice;
  const displayLabel = displayPrice === 0 ? 'Free' : (displayPrice === Infinity ? 'Custom' : `$${(displayPrice / 100).toFixed(2)}`);
  const isCustom = displayPrice === Infinity;
  const isFree = displayPrice === 0;
  const savings = (price > 0 && yearlyPrice > 0 && billingCycle === 'yearly') ? Math.round((1 - yearlyPrice / (price * 12)) * 100) : null;

  return (
    <Card className={cn("flex flex-col", isFeatured ? "border-primary ring-2 ring-primary shadow-lg" : "", isCurrent && "bg-muted")}>
      <CardHeader className="text-center">
        {isCurrent && <div className="text-sm font-bold text-primary">CURRENT PLAN</div>}
        {isFeatured && !isCurrent && <div className="text-sm font-semibold text-accent">POPULAR</div>}
        <CardTitle className="text-2xl font-headline">{plan}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="pt-4">
            <span className="text-4xl font-bold">{displayLabel}</span>
            {displayLabel !== "Custom" && displayLabel !== "Free" && <span className="text-sm text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
        </div>
        {savings && savings > 0 && (
            <div className="mt-1 text-xs text-emerald-600">Save {savings}% annually</div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-primary mr-3 mt-1 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
            className={cn("w-full", isFeatured && "bg-accent hover:bg-accent/90 text-accent-foreground")} 
            variant={isCurrent ? 'outline' : isFeatured ? 'default' : 'outline'} 
            disabled={isCurrent}
            onClick={() => !isCurrent && onUpgradeClick(plan, displayLabel)}
        >
            {isCurrent ? "This is your current plan" : (isCustom ? 'Contact Sales' : 'Pay with Razorpay')}
        </Button>
      </CardFooter>
    </Card>
  );
}


const ClientPlans = ({ onUpgradeClick, plans, billingCycle, currentPlanName }: { onUpgradeClick: (plan: string, price: string) => void, plans: Plan[], billingCycle: 'monthly' | 'yearly', currentPlanName: string }) => (
    <>
        {plans.filter(p => p.audience === 'Client' && p.isPublic).map(plan => (
            <PricingCard
                key={plan.id}
                plan={plan.name}
                price={plan.price.monthlyUSD}
                yearlyPrice={plan.price.yearlyUSD}
                description={plan.description}
                features={plan.features}
                isCurrent={plan.name === currentPlanName}
                isFeatured={plan.isFeatured}
                billingCycle={billingCycle}
                onUpgradeClick={onUpgradeClick}
            />
        ))}
    </>
);

const ProviderPlans = ({ onUpgradeClick, plans, billingCycle, currentPlanName }: { onUpgradeClick: (plan: string, price: string) => void, plans: Plan[], billingCycle: 'monthly' | 'yearly', currentPlanName: string }) => (
    <>
       {plans.filter(p => p.audience === 'Provider' && p.isPublic).map(plan => (
            <PricingCard
                key={plan.id}
                plan={plan.name}
                price={plan.price.monthlyUSD}
                yearlyPrice={plan.price.yearlyUSD}
                description={plan.description}
                features={plan.features}
                isCurrent={plan.name === currentPlanName}
                isFeatured={plan.isFeatured}
                billingCycle={billingCycle}
                onUpgradeClick={onUpgradeClick}
            />
        ))}
    </>
);

const AuditorView = ({ constructUrl }: { constructUrl: (url: string) => string }) => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
            <CardTitle>Auditor & Regulator Access</CardTitle>
            <CardDescription>Your access is managed through Client or Enterprise accounts.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                As an auditor, your firm is typically granted access to specific jobs or assets by a Client company that holds an Enterprise plan. There is no separate subscription plan for auditors. If a client needs to grant you access, they can do so through their Enterprise account settings.
            </p>
        </CardContent>
         <CardFooter>
            <Button asChild variant="outline">
                <Link href={constructUrl("/dashboard/settings")}>
                    Back to Settings
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

const AdminView = ({ constructUrl }: { constructUrl: (url: string) => string }) => (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
            <CardTitle>Platform Subscription Management</CardTitle>
            <CardDescription>You are viewing this page as a platform administrator.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                As an administrator, you manage the subscription plans for all users on the platform. This page is typically for clients and providers to manage their own subscriptions. To manage all platform subscriptions, please visit the <Link href={constructUrl("/dashboard/subscriptions")} className="text-primary underline">Subscription Management</Link> page.
            </p>
        </CardContent>
         <CardFooter>
            <Button asChild variant="outline">
                <Link href={constructUrl("/dashboard/settings")}>
                    Back to Settings
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

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
    const { firestore, user: authUser } = useFirebase();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const { data: currentUserProfile, isLoading: isLoadingProfile } = useDoc<PlatformUser>(
        useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [authUser, firestore])
    );

    const { data: plans, isLoading: isLoadingPlans } = useCollection<Plan>(useMemoFirebase(() => firestore ? query(collection(firestore, 'plans'), where('isActive', '==', true)) : null, [firestore]));
    
    const { data: userSubscriptions, isLoading: isLoadingSubscriptions } = useCollection<Subscription>(useMemoFirebase(() => (firestore && currentUserProfile?.companyId) ? query(collection(firestore, 'subscriptions'), where('companyId', '==', currentUserProfile.companyId), where('status', 'in', ['Active', 'Trialing'])) : null, [firestore, currentUserProfile?.companyId]));
    
    const currentSubscription = (userSubscriptions && userSubscriptions.length > 0) ? userSubscriptions[0] : null;
    const currentPlanName = currentSubscription?.plan || '';

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

    const handleUpgradeClick = (plan: string, price: string) => {
        if (price === "Custom") {
             const mailtoHref = `mailto:sales@ndtexchange.com?subject=Subscription Upgrade Request: ${plan} Plan&body=Hello, I'm interested in upgrading to the ${plan} plan. Please provide me with more details.`;
             window.location.href = mailtoHref;
        } else {
            const amountInCents = Number(price.replace(/[^0-9.-]+/g,"")) * 100;
        
            const options = {
                "key": "rzp_test_SCmu4c9MVES9Ei", // Public Test Key
                "amount": amountInCents,
                "currency": 'USD',
                "name": "NDT EXCHANGE",
                "description": `Subscription for ${plan}`,
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

  const renderPlansByRole = () => {
    if (isLoadingPlans || isLoadingSubscriptions || isLoadingProfile) {
        return [...Array(3)].map((_, i) => <Skeleton key={i} className="h-96" />);
    }
    switch(role) {
        case 'client':
            return <ClientPlans onUpgradeClick={handleUpgradeClick} plans={plans || []} billingCycle={billingCycle} currentPlanName={currentPlanName} />;
        case 'inspector':
            return <ProviderPlans onUpgradeClick={handleUpgradeClick} plans={plans || []} billingCycle={billingCycle} currentPlanName={currentPlanName} />;
        case 'auditor':
            return <AuditorView constructUrl={constructUrl} />;
        case 'admin':
            return <AdminView constructUrl={constructUrl} />;
        default:
             return <ClientPlans onUpgradeClick={handleUpgradeClick} plans={plans || []} billingCycle={billingCycle} currentPlanName={currentPlanName} />;
    }
  }

  return (
    <div className="space-y-6">
        <Link
            href={constructUrl('/dashboard/settings')}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
            <ChevronLeft className="mr-2 h-4 w-4 text-primary" />
            Back to Settings
        </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-primary" />
          <div>
              <h1 className="text-2xl font-headline font-semibold">Subscription Plans</h1>
              <p className="text-muted-foreground">
                  Choose a plan that fits your needs.
              </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
            <Button size="sm" variant={billingCycle === 'monthly' ? 'default' : 'ghost'} onClick={() => setBillingCycle('monthly')}>Monthly</Button>
            <Button size="sm" variant={billingCycle === 'yearly' ? 'default' : 'ghost'} onClick={() => setBillingCycle('yearly')}>Yearly</Button>
        </div>
      </div>
      
      <section id="pricing" className="py-8 space-y-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {renderPlansByRole()}
          </div>
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

    