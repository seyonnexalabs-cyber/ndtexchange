
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
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import type { Payment, Subscription, Plan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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
    features: string[]; 
    isFeatured?: boolean; 
    isCurrent?: boolean;
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
        {plans.filter(p => p.audience === 'Client').map(plan => (
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
       {plans.filter(p => p.audience === 'Provider').map(plan => (
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


// Simplified user details for pre-filling payment form
const userDetails = {
    client: { name: 'John Doe', email: 'john.d@globalenergy.corp', company: 'Global Energy Corp.', currency: 'USD' },
    inspector: { name: 'Jane Smith', email: 'jane.s@acmeinspection.com', company: 'TEAM, Inc.', currency: 'USD' },
    auditor: { name: 'Alex Chen', email: 'alex.c@ndtauditors.gov', company: 'NDT Auditors LLC', currency: 'USD' },
    admin: { name: 'Admin User', email: 'admin@ndtexchange.com', company: 'NDT EXCHANGE', currency: 'USD' },
    manufacturer: { name: 'OEM User', email: 'oem.user@evident.com', company: 'Evident Scientific', currency: 'USD' },
};


export default function BillingPage() {
    const searchParams = useSearchParams();
    const role = (searchParams.get('role') || 'client').toLowerCase();
    const { firestore } = useFirebase();

    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const currentUser = useMemo(() => userDetails[role as keyof typeof userDetails] || userDetails.client, [role]);

    const plansQuery = useMemoFirebase(() => {
        if (!firestore) return null;

        const planCollection = collection(firestore, 'plans');

        if (role === 'admin') {
            // Admin can see all plans and manage active/public flags.
            return query(planCollection, orderBy('audience', 'asc'), orderBy('price.monthlyUSD', 'asc'));
        }

        return query(
            planCollection,
            where('isActive', '==', true),
            where('isPublic', '==', true),
            orderBy('audience', 'asc'),
            orderBy('price.monthlyUSD', 'asc')
        );
    }, [firestore, role]);

    const { data: plans, isLoading: isLoadingPlans, error: plansError } = useCollection<Plan>(plansQuery);

    const { data: userSubscriptions, isLoading: isLoadingSubscriptions, error: subscriptionsError } = useCollection<Subscription>(useMemoFirebase(() => firestore ? query(collection(firestore, 'subscriptions'), where('companyName', '==', currentUser.company), where('status', 'in', ['Active', 'Trialing'])) : null, [firestore, currentUser.company]));
    
    const [lastPlansUpdatedAt, setLastPlansUpdatedAt] = useState<Date | null>(null);

    useEffect(() => {
        if (plans && plans.length > 0) {
            setLastPlansUpdatedAt(new Date());
        }
    }, [plans]);

    const currentSubscription = (userSubscriptions && userSubscriptions.length > 0) ? userSubscriptions[0] : null;
    const currentPlanName = currentSubscription?.plan || '';

    const createNewPlan = async () => {
        if (!firestore) return;
        try {
            const newPlan: Omit<Plan, 'id'> = {
                name: 'New Plan',
                audience: 'Client',
                price: { monthlyUSD: 5000, yearlyUSD: 50000 },
                description: 'New plan created by administrator',
                priceDescription: 'Default price',
                userLimit: 5,
                dataLimitGB: 100,
                assetLimit: 10,
                biddingLimit: 10,
                equipmentLimit: 10,
                marketplaceAccess: true,
                reportingLevel: 'Basic',
                apiAccess: false,
                customBranding: false,
                isPublic: false,
                isActive: false,
                isFeatured: false,
                isPopular: false,
                features: ['Custom plan content'],
            };

            await addDoc(collection(firestore, 'plans'), newPlan);
            toast.success('New plan added; refresh to see it.');
        } catch (error) {
            toast.error('Failed to add plan.');
            console.error(error);
        }
    };

    const editPlan = async (plan: Plan) => {
        if (!firestore) return;
        try {
            const newName = window.prompt('Plan name', plan.name);
            if (!newName) return;

            const monthly = Number(window.prompt('Monthly USD (cents)', String(plan.price.monthlyUSD)));
            if (Number.isNaN(monthly)) return;

            const yearly = Number(window.prompt('Yearly USD (cents)', String(plan.price.yearlyUSD)));
            if (Number.isNaN(yearly)) return;

            await updateDoc(doc(firestore, 'plans', plan.id), {
                name: newName,
                'price.monthlyUSD': monthly,
                'price.yearlyUSD': yearly,
            });
            toast.success('Plan updated.');
        } catch (error) {
            toast.error('Failed to update plan.');
            console.error(error);
        }
    };

    const togglePlanFlag = async (plan: Plan, flag: 'isActive' | 'isPublic' | 'isFeatured') => {
        if (!firestore) return;
        try {
            await updateDoc(doc(firestore, 'plans', plan.id), { [flag]: !plan[flag] });
            toast.success(`${flag} set to ${!plan[flag] ? 'true' : 'false'}`);
        } catch (error) {
            toast.error(`Failed to toggle ${flag}.`);
            console.error(error);
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const createOrUpdateSubscription = async (planObj: Plan, paymentInfo?: { paymentId: string; amountUSD: number; status: 'Succeeded' | 'Failed' }) => {
        if (!firestore) return;

        const companyId = currentUser.company.replace(/\s+/g, '-').toLowerCase();
        const now = new Date();
        const startDate = now.toISOString();
        const trialDays = planObj.trialPeriodDays ?? (planObj.price.monthlyUSD === 0 && planObj.price.yearlyUSD === 0 ? 30 : 0);
        const status = planObj.price.monthlyUSD === 0 && planObj.price.yearlyUSD === 0 ? 'Trialing' : 'Active';
        const endDate = trialDays > 0 ? new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000)).toISOString() : null;

        // Query existing active/trial subscription
        const existingSubQuery = query(
            collection(firestore, 'subscriptions'),
            where('companyName', '==', currentUser.company),
            where('status', 'in', ['Active', 'Trialing'])
        );
        const existingSub = await getDocs(existingSubQuery);

        let subscriptionId: string;
        const baseSubscriptionData = {
            companyId,
            companyName: currentUser.company,
            plan: planObj.name,
            status,
            startDate,
            endDate,
            userCount: 1,
            dataUsageGB: 0,
            userLimit: planObj.userLimit === 'Unlimited' ? 999999 : planObj.userLimit,
            dataLimitGB: planObj.dataLimitGB === 'Unlimited' ? 999999 : planObj.dataLimitGB,
            createdAt: now,
            createdBy: currentUser.email,
            modifiedAt: now,
            modifiedBy: currentUser.email,
        };

        if (!existingSub.empty) {
            const latestSub = existingSub.docs[0];
            subscriptionId = latestSub.id;
            await updateDoc(doc(firestore, 'subscriptions', subscriptionId), {
                ...baseSubscriptionData,
                modifiedAt: now,
                modifiedBy: currentUser.email,
            });
        } else {
            const subsDoc = await addDoc(collection(firestore, 'subscriptions'), baseSubscriptionData);
            subscriptionId = subsDoc.id;
        }

        if (paymentInfo && paymentInfo.status === 'Succeeded') {
            await addDoc(collection(firestore, 'payments'), {
                subscriptionId,
                companyName: currentUser.company,
                amount: paymentInfo.amountUSD,
                date: new Date().toISOString(),
                status: 'Succeeded',
                createdAt: now,
                createdBy: currentUser.email,
            });
        }

        await addDoc(collection(firestore, 'billingAuditLog'), {
            timestamp: now,
            companyName: currentUser.company,
            action: planObj.price.monthlyUSD === 0 && planObj.price.yearlyUSD === 0 ? 'Subscription Started' : 'Payment Succeeded',
            details: paymentInfo ? `Plan set to ${planObj.name} with payment ${paymentInfo.amountUSD} USD` : `Plan set to ${planObj.name}`,
        });

        toast.success(`Subscription updated to ${planObj.name}`);
    };

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    const handleUpgradeClick = async (planName: string, priceLabel: string) => {
        const selectedPlan = plans?.find(p => p.name === planName);
        if (!selectedPlan) {
            toast.error('Selected plan could not be found.');
            return;
        }

        if (priceLabel === 'Custom') {
            const mailtoHref = `mailto:sales@ndtexchange.com?subject=Subscription Upgrade Request: ${selectedPlan.name} Plan&body=Hello, I'm interested in upgrading to the ${selectedPlan.name} plan. Please provide me with more details.`;
            window.location.href = mailtoHref;
            return;
        }

        const selectedPrice = billingCycle === 'monthly' ? selectedPlan.price.monthlyUSD : selectedPlan.price.yearlyUSD;

        if (selectedPrice === 0) {
            await createOrUpdateSubscription(selectedPlan);
            return;
        }

        const amountInCents = selectedPrice; // Razorpay expects smallest currency unit for USD

        const options = {
            key: 'rzp_test_SCmu4c9MVES9Ei',
            amount: amountInCents,
            currency: currentUser.currency,
            name: 'NDT EXCHANGE',
            description: `Subscription for ${selectedPlan.name}`,
            image: 'https://placehold.co/128x128/3B82F6/FFFFFF/png?text=NDT',
            handler: async function (response: any) {
                toast.success('Payment Successful!', {
                    description: `Payment ID: ${response.razorpay_payment_id}`,
                });

                await createOrUpdateSubscription(selectedPlan, {
                    paymentId: response.razorpay_payment_id,
                    amountUSD: selectedPrice / 100,
                    status: 'Succeeded',
                });
            },
            prefill: {
                name: currentUser.name,
                email: currentUser.email,
            },
            theme: {
                color: '#3B82F6',
            },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

  const renderPlansByRole = () => {
    if (isLoadingPlans || isLoadingSubscriptions) {
        return [...Array(3)].map((_, i) => <Skeleton key={i} className="h-96" />);
    }

    if (plansError || subscriptionsError) {
        return (
            <Card className="col-span-full border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Could not load plans</CardTitle>
                    <CardDescription>{plansError?.message || subscriptionsError?.message || 'Please try again later.'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </CardContent>
            </Card>
        );
    }

    switch(role) {
        case 'client':
            return <ClientPlans onUpgradeClick={handleUpgradeClick} plans={plans || []} billingCycle={billingCycle} currentPlanName={currentPlanName} />;
        case 'inspector':
            return <ProviderPlans onUpgradeClick={handleUpgradeClick} plans={plans || []} billingCycle={billingCycle} currentPlanName={currentPlanName} />;
        case 'auditor':
            return <AuditorView constructUrl={constructUrl} />;
        case 'admin':
            return (
                <div className="col-span-full">
                    <AdminView constructUrl={constructUrl} />
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Admin Plan Manager</CardTitle>
                            <CardDescription>Manage subscription plans for the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex justify-end">
                                <Button onClick={createNewPlan}>Add New Plan</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Audience</TableHead>
                                            <TableHead>Monthly</TableHead>
                                            <TableHead>Yearly</TableHead>
                                            <TableHead>Active</TableHead>
                                            <TableHead>Public</TableHead>
                                            <TableHead>Featured</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(plans || []).map(plan => (
                                            <TableRow key={plan.id}>
                                                <TableCell>{plan.name}</TableCell>
                                                <TableCell>{plan.audience}</TableCell>
                                                <TableCell>${(plan.price.monthlyUSD / 100).toFixed(2)}</TableCell>
                                                <TableCell>${(plan.price.yearlyUSD / 100).toFixed(2)}</TableCell>
                                                <TableCell>{plan.isActive ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{plan.isPublic ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{plan.isFeatured ? 'Yes' : 'No'}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button size="sm" variant="outline" onClick={() => editPlan(plan)}>Edit</Button>
                                                    <Button size="sm" variant={plan.isActive ? 'secondary' : 'outline'} onClick={() => togglePlanFlag(plan, 'isActive')}>{plan.isActive ? 'Deactivate' : 'Activate'}</Button>
                                                    <Button size="sm" variant={plan.isPublic ? 'secondary' : 'outline'} onClick={() => togglePlanFlag(plan, 'isPublic')}>{plan.isPublic ? 'Make Private' : 'Make Public'}</Button>
                                                    <Button size="sm" variant={plan.isFeatured ? 'secondary' : 'outline'} onClick={() => togglePlanFlag(plan, 'isFeatured')}>{plan.isFeatured ? 'Unset Featured' : 'Set Featured'}</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        default:
             return <ClientPlans onUpgradeClick={handleUpgradeClick} plans={plans || []} billingCycle={billingCycle} currentPlanName={currentPlanName} />; // Default to client view
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
              <p className="text-muted-foreground">Choose a plan that fits your needs.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
          <Button size="sm" variant={billingCycle === 'monthly' ? 'default' : 'outline'} onClick={() => setBillingCycle('monthly')}>Monthly</Button>
          <Button size="sm" variant={billingCycle === 'yearly' ? 'default' : 'outline'} onClick={() => setBillingCycle('yearly')}>Yearly</Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {lastPlansUpdatedAt ? `Plans updated ${Math.floor((Date.now() - lastPlansUpdatedAt.getTime()) / 1000)}s ago` : 'Waiting for plan updates...'}
      </div>
      
      <section id="pricing" className="py-8 space-y-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {renderPlansByRole()}
          </div>
           <p className="text-center text-muted-foreground mt-8 text-sm">
              All subscription plans are billed annually. Pricing is usage-based, determined by factors like platform hosting, data storage, and number of users. <strong>Please note: we process payments for platform subscriptions, but we do not process payments for the NDT jobs themselves.</strong> Contact our sales team for a detailed quote tailored to your needs.
           </p>
      </section>
        {(role === 'client' || role === 'inspector') && (
            <section id="payment-history">
                <PaymentHistory companyName={currentUser.company} />
            </section>
        )}
    </div>
  );
}
