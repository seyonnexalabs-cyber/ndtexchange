'use client';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Send, Mail, Phone, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { subscriptionPlans, type Plan } from '@/lib/subscription-plans';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Currency = 'USD' | 'EUR' | 'INR' | 'GBP' | 'CAD';
type BillingCycle = 'monthly' | 'yearly';

const exchangeRates: Record<Currency, { rate: number; symbol: string; locale: string }> = {
    USD: { rate: 1, symbol: '$', locale: 'en-US' },
    EUR: { rate: 0.93, symbol: '€', locale: 'de-DE' },
    INR: { rate: 83.5, symbol: '₹', locale: 'en-IN' },
    GBP: { rate: 0.79, symbol: '£', locale: 'en-GB' },
    CAD: { rate: 1.37, symbol: 'C$', locale: 'en-CA' },
};

const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  companyName: z.string().min(2, "Company name is required."),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["asset-owner", "ndt-company", "auditor", "oem-other"], {required_error: 'Please select your role.'}),
  inquiryType: z.enum(["demo", "pricing", "partnership", "support", "general", "oem-listing"], {required_error: 'Please select an inquiry type.'}),
  message: z.string().min(10, "Please provide a brief message (min. 10 characters)."),
});


const ContactForm = () => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof contactFormSchema>>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: { name: '', companyName: '', email: '', message: '' },
    });

    function onSubmit(data: z.infer<typeof contactFormSchema>) {
        toast({ title: "Inquiry Sent", description: "Thank you for contacting us. We will get back to you shortly." });
        console.log(data);
        form.reset();
    }

    return (
        <Card>
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl><Input placeholder="Your Company Inc." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl><Input type="tel" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                           control={form.control}
                           name="role"
                           render={({ field }) => (
                               <FormItem>
                                   <FormLabel>You are a...</FormLabel>
                                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                                       <FormControl><SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger></FormControl>
                                       <SelectContent>
                                           <SelectItem value="asset-owner">Asset Owner / Client</SelectItem>
                                           <SelectItem value="ndt-company">NDT Company / Inspector</SelectItem>
                                           <SelectItem value="auditor">Auditor / Level-III</SelectItem>
                                           <SelectItem value="oem-other">OEM / Other</SelectItem>
                                       </SelectContent>
                                   </Select>
                                   <FormMessage />
                               </FormItem>
                           )}
                       />
                        <FormField
                           control={form.control}
                           name="inquiryType"
                           render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Reason for Contact</FormLabel>
                                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                                       <FormControl><SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger></FormControl>
                                       <SelectContent>
                                            <SelectItem value="demo">Request a Demo</SelectItem>
                                           <SelectItem value="pricing">A Pricing Quote</SelectItem>
                                           <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                                           <SelectItem value="oem-listing">OEM Listing Inquiry</SelectItem>
                                           <SelectItem value="support">Technical Support</SelectItem>
                                           <SelectItem value="general">A General Inquiry</SelectItem>
                                       </SelectContent>
                                   </Select>
                                   <FormMessage />
                               </FormItem>
                           )}
                       />
                         <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="How can we help you?" className="min-h-[100px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg">Send Inquiry <Send className="ml-2" /></Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default function ContactPage() {
    const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('monthly');
    const [currency, setCurrency] = React.useState<Currency>('USD');
    
    useEffect(() => {
        // This effect runs only on the client side, after hydration
        const userLocale = navigator.language.toLowerCase();
        if (userLocale.includes('in')) setCurrency('INR');
        else if (['de', 'fr', 'es', 'it', 'nl', 'pt', 'fi', 'at', 'be', 'cy', 'ee', 'gr', 'ie', 'lv', 'lt', 'lu', 'mt', 'sk', 'si'].some(prefix => userLocale.startsWith(prefix))) setCurrency('EUR');
        else if (userLocale.includes('gb')) setCurrency('GBP');
        else if (userLocale.includes('ca')) setCurrency('CAD');
        else setCurrency('USD');
    }, []);

    const allPlans = useMemo(() => {
      const activePlans = subscriptionPlans.filter(p => p.isActive && p.isPublic);
      const audienceOrder = ['Client', 'Provider', 'Auditor'];
      const priceToNumber = (priceInCents: number) => priceInCents === Infinity ? Infinity : priceInCents;
      
      return activePlans.sort((a, b) => {
        const audienceIndexA = audienceOrder.indexOf(a.audience);
        const audienceIndexB = audienceOrder.indexOf(b.audience);
        if (audienceIndexA !== audienceIndexB) return audienceIndexA - audienceIndexB;
        return priceToNumber(a.price.monthlyUSD) - priceToNumber(b.price.monthlyUSD);
      });
    }, []);

    const featureCategories = useMemo(() => [
        { category: 'Core Features', features: [
            { name: 'User Seats', prop: 'userLimit' },
            { name: 'Data Storage', prop: 'dataLimitGB', suffix: ' GB' },
            { name: 'Marketplace Access', prop: 'marketplaceAccess', type: 'boolean' },
        ]},
        { category: 'Client Features', features: [
            { name: 'Managed Assets', prop: 'assetLimit' }
        ]},
        { category: 'Provider Features', features: [
            { name: 'Equipment Inventory', prop: 'equipmentLimit' },
            { name: 'Marketplace Bids', prop: 'biddingLimit', suffix: '/ month' },
        ]},
        { category: 'Advanced Features', features: [
            { name: 'Reporting Level', prop: 'reportingLevel' },
            { name: 'Custom Branding', prop: 'customBranding', type: 'boolean' },
            { name: 'API Access', prop: 'apiAccess', type: 'boolean' },
        ]}
    ], []);
    
    const formatPrice = (priceInCents: number) => {
        if (priceInCents === 0) return 'Free';
        if (priceInCents === Infinity) return 'Custom';

        const baseAmount = priceInCents / 100;
        const finalAmount = billingCycle === 'yearly' ? baseAmount * 10 : baseAmount;
        const convertedAmount = finalAmount * exchangeRates[currency].rate;
        
        return new Intl.NumberFormat(exchangeRates[currency].locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(convertedAmount);
    };

    return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        <HoneycombHero>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                Whether you're an asset owner, service provider, or auditor, we have a plan that fits your needs. Start free and scale as you grow.
              </p>
            </div>
        </HoneycombHero>

        <section id="pricing-table" className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="billing-cycle">Monthly</Label>
                        <Switch id="billing-cycle" checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
                        <Label htmlFor="billing-cycle" className="flex items-center">Yearly <Badge variant="secondary" className="ml-2">Save 16%</Badge></Label>
                    </div>
                     <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(exchangeRates).map(([code, {symbol}]) => (
                                <SelectItem key={code} value={code}>{code} ({symbol})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="w-1/4 p-4 text-left font-semibold text-lg"></th>
                                {allPlans.map(plan => (
                                    <th key={plan.id} className={cn("w-1/5 p-4 text-center border-l", plan.isFeatured && "border-primary")}>
                                        <h3 className="text-lg font-bold">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    </th>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <th className="p-4 text-left font-semibold">Price</th>
                                {allPlans.map(plan => (
                                     <td key={plan.id} className={cn("p-4 text-center border-l", plan.isFeatured && "border-primary")}>
                                        <p className="text-3xl font-bold">{formatPrice(plan.price.monthlyUSD)}</p>
                                        <p className="text-sm text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</p>
                                    </td>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {featureCategories.map(category => {
                                // Don't render the category if no plans have any of its features
                                const hasFeatureInCategory = allPlans.some(plan => 
                                    category.features.some(feature => (plan as any)[feature.prop] !== undefined && (plan as any)[feature.prop] !== 0 && (plan as any)[feature.prop] !== false)
                                );

                                if (!hasFeatureInCategory) return null;

                                return (
                                <React.Fragment key={category.category}>
                                    <tr className="bg-muted/30">
                                        <th colSpan={allPlans.length + 1} className="p-3 font-semibold text-base">{category.category}</th>
                                    </tr>
                                    {category.features.map(feature => {
                                        // Don't render the feature row if no plan uses it
                                        const hasFeature = allPlans.some(plan => (plan as any)[feature.prop] !== undefined && (plan as any)[feature.prop] !== 0 && (plan as any)[feature.prop] !== false);
                                        if(!hasFeature) return null;

                                        return (
                                            <tr key={feature.name} className="border-b">
                                                <td className="p-4 font-medium">{feature.name}</td>
                                                {allPlans.map(plan => {
                                                    const value = (plan as any)[feature.prop];
                                                    let displayValue: React.ReactNode;

                                                    if (feature.type === 'boolean') {
                                                        displayValue = value ? <Check className="mx-auto text-primary" /> : <X className="mx-auto text-muted-foreground" />;
                                                    } else {
                                                        const formattedValue = value === 'Unlimited' || value === Infinity ? 'Unlimited' : `${value}${feature.suffix || ''}`;
                                                        displayValue = (value === undefined || value === 0 || value === false) ? <X className="mx-auto text-muted-foreground" /> : formattedValue;
                                                    }
                                                    
                                                    return (
                                                         <td key={plan.id} className={cn("p-4 text-center text-muted-foreground border-l", plan.isFeatured && "border-primary")}>
                                                            {displayValue}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </React.Fragment>
                            )})}
                            <tr className="">
                                <td className="p-4"></td>
                                {allPlans.map(plan => (
                                    <td key={plan.id} className={cn("p-4 text-center border-l", plan.isFeatured && "border-primary")}>
                                        <Button asChild variant={plan.isFeatured ? 'default' : 'outline'} className="w-full">
                                            <Link href="/signup">Get Started</Link>
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <section id="faq" className="py-20 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-semibold text-primary">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Do clients have to pay?</AccordionTrigger>
                        <AccordionContent>
                        Our "Client Access" plan is completely free and allows you to post jobs, manage a substantial number of assets, and use our core features. Paid plans are available for organizations that require management for unlimited assets, advanced analytics, and more data storage.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                        <AccordionTrigger>What does "Marketplace Access" mean for providers?</AccordionTrigger>
                        <AccordionContent>
                        All provider plans include access to our job marketplace. The primary difference is the number of bids you can submit per month. Our "Company Growth" plan offers unlimited bidding.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>How does NDT EXCHANGE make money?</AccordionTrigger>
                        <AccordionContent>
                        NDT EXCHANGE operates on a subscription (SaaS) model. We charge a monthly or annual fee for access to our platform's premium features, depending on the plan you choose. We do not take a commission on jobs awarded through the marketplace.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger>What happens at the end of my free trial?</AccordionTrigger>
                        <AccordionContent>
                        Towards the end of your 14-day free trial, we will contact you to discuss paid plan options. If you choose not to subscribe, your account will be transitioned to our free "Starter" or "Access" plan, so you won't lose your data.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
        
        <section id="contact-form" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                Have a Question?
                </h2>
                <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">
                    To request a demo, inquire about enterprise pricing, or discuss partnerships, please use the form below. Ready to sign up? <Link href="/signup" className="text-primary font-semibold underline">Create an account</Link>.
                </p>
            </div>
            <div className="max-w-2xl mx-auto grid grid-cols-1 gap-12 items-start">
                <div className="space-y-6 text-center md:text-left">
                    <h3 className="text-2xl font-headline font-semibold">Contact Information</h3>
                    <p className="text-muted-foreground">
                        Our team is available to answer your questions. We aim to respond to all inquiries within one business day.
                    </p>
                    <div className="space-y-4 inline-block text-left">
                        <div className="flex items-center gap-4">
                            <Mail className="w-5 h-5 text-primary" />
                            <div>
                                <h4 className="font-semibold">General & Sales Inquiries</h4>
                                <a href="mailto:pilot@ndtexchange.com" className="text-primary hover:underline">pilot@ndtexchange.com</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone className="w-5 h-5 text-primary" />
                            <div>
                                <h4 className="font-semibold">Phone</h4>
                                <p className="text-muted-foreground">Contact details available upon request.</p>
                            </div>
                        </div>
                    </div>
                </div>
                 <div>
                    <ContactForm />
                </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}