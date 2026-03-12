'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Plan } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

type BillingCycle = 'monthly' | 'yearly';
type Currency = 'USD' | 'EUR' | 'INR' | 'GBP' | 'CAD';

const exchangeRates: Record<Currency, { rate: number; symbol: string; locale: string }> = {
    USD: { rate: 1, symbol: '$', locale: 'en-US' },
    EUR: { rate: 0.93, symbol: '€', locale: 'de-DE' },
    INR: { rate: 83.5, symbol: '₹', locale: 'en-IN' },
    GBP: { rate: 0.79, symbol: '£', locale: 'en-GB' },
    CAD: { rate: 1.37, symbol: 'C$', locale: 'en-CA' },
};


interface PricingTableProps {
    plans: Plan[];
    onPlanSelect: (plan: Plan, price: number, billingCycle: BillingCycle) => void;
    currentPlanName?: string;
    isLoading?: boolean;
}

export function PricingTable({ plans, onPlanSelect, currentPlanName, isLoading }: PricingTableProps) {
    const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('monthly');
    const [currency, setCurrency] = React.useState<Currency>('USD');
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const formatPrice = (priceInCents: number) => {
        if (priceInCents === 0) return 'Free';
        if (priceInCents === Infinity) return 'Custom';

        const baseAmount = priceInCents / 100;
        const convertedAmount = baseAmount * exchangeRates[currency].rate;
        
        return new Intl.NumberFormat(exchangeRates[currency].locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(convertedAmount);
    };

    if (isLoading) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96" />)}
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-center space-x-4 mb-12">
              <Label htmlFor="billing-cycle">Monthly</Label>
              <Switch id="billing-cycle" checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
              <Label htmlFor="billing-cycle" className="flex items-center">
                Yearly
                <Badge variant="secondary" className="ml-2">Save ~16%</Badge>
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
                {plans.map((plan) => {
                    const priceValue = billingCycle === 'monthly' ? plan.price.monthlyUSD : plan.price.yearlyUSD;
                    const isCurrent = plan.name === currentPlanName;
                    
                    const priceDisplay = isMounted ? formatPrice(priceValue) : <Skeleton className="h-10 w-24 inline-block" />;
                    const ctaText = isCurrent ? 'Current Plan' : priceValue === Infinity ? 'Contact Sales' : 'Get Started';

                    return (
                        <Card key={plan.id} className={cn("flex flex-col transition-all hover:shadow-lg hover:-translate-y-1", plan.isFeatured && "border-primary ring-2 ring-primary", isCurrent && "border-accent ring-2 ring-accent/50")}>
                            <CardHeader className="text-center">
                                {plan.isPopular && <Badge className="mb-2 w-fit mx-auto">Popular</Badge>}
                                <p className="font-semibold text-primary">{plan.audience}</p>
                                <CardTitle className="text-2xl font-headline">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="text-center mb-6">
                                        <span className="text-4xl font-bold">{priceDisplay}</span>
                                        {priceValue > 0 && priceValue !== Infinity && <span className="text-sm text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
                                    </div>
                                    <ul className="space-y-3 text-sm">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start">
                                                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => onPlanSelect(plan, priceValue, billingCycle)} className="w-full" variant={plan.isFeatured ? 'default' : 'outline'} disabled={isCurrent}>
                                    {ctaText}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}