'use client';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building, HardHat, Eye, Send, Mail, Phone, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

type Currency = 'USD' | 'EUR' | 'INR';

const exchangeRates: Record<Currency, { rate: number; symbol: string; locale: string }> = {
    USD: { rate: 1, symbol: '$', locale: 'en-US' },
    EUR: { rate: 0.92, symbol: '€', locale: 'de-DE' },
    INR: { rate: 83.5, symbol: '₹', locale: 'en-IN' },
};

const formatPrice = (priceInCents: number, currency: Currency) => {
    if (priceInCents === 0) return 'Free';
    if (priceInCents === Infinity) return 'Custom';

    const convertedAmount = (priceInCents / 100) * exchangeRates[currency].rate;
    
    return new Intl.NumberFormat(exchangeRates[currency].locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(convertedAmount);
};


function PricingCard({ plan, priceUSD, currency, description, features, isFeatured = false, ctaText, ctaLink = '#', popularBadge = false }: {
  plan: string;
  priceUSD: number;
  currency: Currency;
  description: string;
  features: string[];
  isFeatured?: boolean;
  ctaText: string;
  ctaLink?: string;
  popularBadge?: boolean;
}) {

  const displayPrice = formatPrice(priceUSD, currency);

  return (
    <Card className={cn("flex flex-col h-full", isFeatured && "border-primary ring-2 ring-primary shadow-lg")}>
       {popularBadge && (
            <div className="py-1.5 px-3 bg-primary text-primary-foreground text-sm font-semibold rounded-t-lg text-center">
                ⭐ Most Chosen
            </div>
       )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-headline">{plan}</CardTitle>
        <CardDescription className="pt-2 !mt-2 h-10">{description}</CardDescription>
        <div className="pt-4">
            <span className="text-4xl font-bold">{displayPrice}</span>
            {priceUSD > 0 && priceUSD !== Infinity && <span className="text-muted-foreground">/ month</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
            className="w-full" 
            variant={isFeatured ? 'default' : 'outline'} 
            asChild
        >
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

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


const featureCategories = [
  { 
    category: 'Core Features', 
    features: [
      { name: 'User Seats', prop: 'userLimit', type: 'value' },
      { name: 'Data Storage', prop: 'dataLimitGB', type: 'value', suffix: ' GB' },
      { name: 'Marketplace Access', prop: 'marketplaceAccess', type: 'boolean' },
    ]
  },
  {
    category: 'Client Features',
    features: [
      { name: 'Managed Assets', prop: 'assetLimit', type: 'value' }
    ]
  },
  {
    category: 'Provider Features',
    features: [
      { name: 'Equipment Inventory', prop: 'equipmentLimit', type: 'value' },
      { name: 'Marketplace Bids', prop: 'biddingLimit', type: 'value', suffix: ' / month' },
    ]
  },
  {
    category: 'Advanced Features',
    features: [
      { name: 'Reporting Level', prop: 'reportingLevel', type: 'value' },
      { name: 'Custom Branding', prop: 'customBranding', type: 'boolean' },
      { name: 'API Access', prop: 'apiAccess', type: 'boolean' },
    ]
  }
];

const FeatureComparisonTable = ({ plans, audience }: { plans: Plan[], audience: 'Client' | 'Provider' }) => {
    return (
        <div className="mt-20">
            <h2 className="text-3xl font-headline font-semibold text-center mb-10">Feature Comparison</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="w-1/3 py-4 font-semibold text-lg"></th>
                            {plans.map(plan => (
                                <th key={plan.id} className="w-1/3 md:w-auto p-4 text-center">
                                    <h4 className="text-lg font-semibold">{plan.name}</h4>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {featureCategories.map(category => {
                            const relevantFeatures = category.features.filter(feature => {
                                if (audience === 'Client' && category.category === 'Provider Features') return false;
                                if (audience === 'Provider' && category.category === 'Client Features') return false;
                                return true;
                            });

                            if (relevantFeatures.length === 0) return null;

                            return (
                                <React.Fragment key={category.category}>
                                    <tr className="bg-muted/30">
                                        <th colSpan={plans.length + 1} className="p-3 font-semibold text-base">{category.category}</th>
                                    </tr>
                                    {relevantFeatures.map(feature => (
                                        <tr key={feature.name} className="border-b">
                                            <td className="p-4 font-medium">{feature.name}</td>
                                            {plans.map(plan => {
                                                const value = (plan as any)[feature.prop];
                                                let displayValue: React.ReactNode;

                                                if (feature.type === 'boolean') {
                                                    displayValue = value ? <Check className="mx-auto text-primary" /> : <X className="mx-auto text-muted-foreground" />;
                                                } else {
                                                    displayValue = value === 'Unlimited' || value === Infinity ? 'Unlimited' : `${value}${feature.suffix || ''}`;
                                                }

                                                return (
                                                    <td key={`${plan.id}-${feature.prop}`} className="p-4 text-center text-muted-foreground">
                                                        {displayValue}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default function ContactPage() {
    const [currency, setCurrency] = React.useState<Currency>('USD');
    
    const [activePlans, setActivePlans] = useState(() => subscriptionPlans.filter(p => p.isActive && p.isPublic));

    const priceToNumber = (priceInCents: number) => {
        if (priceInCents === 0) return 0;
        if (priceInCents === Infinity) return Infinity;
        return priceInCents;
    };

    const clientPlans = useMemo(() => activePlans
        .filter(p => p.audience === 'Client')
        .sort((a, b) => priceToNumber(a.price.monthlyUSD) - priceToNumber(b.price.monthlyUSD)), 
    [activePlans]);
    
    const providerPlans = useMemo(() => activePlans
        .filter(p => p.audience === 'Provider')
        .sort((a, b) => priceToNumber(a.price.monthlyUSD) - priceToNumber(b.price.monthlyUSD)), 
    [activePlans]);

    const auditorPlan = useMemo(() => activePlans.find(p => p.audience === 'Auditor'), [activePlans]);


    useEffect(() => {
        // This effect runs only on the client side, after hydration
        const userLocale = navigator.language.toLowerCase();

        if (userLocale.includes('in')) {
            setCurrency('INR');
        } 
        else if (['de', 'fr', 'es', 'it', 'nl', 'pt', 'fi', 'at', 'be', 'cy', 'ee', 'gr', 'ie', 'lv', 'lt', 'lu', 'mt', 'sk', 'si'].some(prefix => userLocale.startsWith(prefix))) {
            setCurrency('EUR');
        }
        else {
            setCurrency('USD');
        }
    }, []);

    return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        {/* 1. HERO SECTION */}
        <HoneycombHero>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                Simple, Transparent Pricing for Every Role
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                Whether you're an asset owner, service provider, or auditor, we have a plan that fits your needs. Start free and scale as you grow.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                  14-Day Free Trial • No credit card required • Clients & Level‑III are free to start.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/signup">Start Your Free Trial</Link>
                  </Button>
                  <Button size="lg" asChild variant="outline">
                    <Link href="#pricing-tabs">View Plans Below</Link>
                  </Button>
              </div>
            </div>
        </HoneycombHero>

        <div id="pricing-tabs" className="py-20">
             <Tabs defaultValue="asset-owners" className="w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col md:flex-row justify-center md:justify-between items-center gap-4">
                    <TabsList className="grid w-full max-w-xl md:w-auto grid-cols-3">
                        <TabsTrigger value="asset-owners" className="gap-2"><Building /> Asset Owners</TabsTrigger>
                        <TabsTrigger value="ndt-companies" className="gap-2"><HardHat /> NDT Companies</TabsTrigger>
                        <TabsTrigger value="auditors" className="gap-2"><Eye /> Level‑III & Auditors</TabsTrigger>
                    </TabsList>
                    <div className="flex justify-center gap-2">
                        {(['USD', 'EUR', 'INR'] as Currency[]).map((c) => (
                            <Button key={c} variant={currency === c ? 'default' : 'outline'} onClick={() => setCurrency(c)} size="sm">
                                {c} ({c === 'USD' ? '$' : c === 'EUR' ? '€' : '₹'})
                            </Button>
                        ))}
                    </div>
                </div>
                
                <TabsContent value="asset-owners" className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <section id="asset-owner-pricing" className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-headline font-semibold text-primary">For Asset Owners & Clients</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Gain secure access to inspection data across vendors, projects, and shutdowns.</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                            {clientPlans.map(plan => (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan.name}
                                    priceUSD={plan.price.monthlyUSD}
                                    currency={currency}
                                    description={plan.description}
                                    features={plan.features}
                                    isFeatured={plan.isFeatured}
                                    popularBadge={plan.isPopular}
                                    ctaText="Get Started Free"
                                    ctaLink="/signup"
                                />
                            ))}
                        </div>
                        <FeatureComparisonTable plans={clientPlans} audience="Client" />
                    </section>
                </TabsContent>

                 <TabsContent value="ndt-companies" className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <section id="ndt-company-pricing" className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-headline font-semibold text-primary">For NDT Companies & Inspectors</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Digitize inspections, reports, equipment, and collaboration with clients.</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                            {providerPlans.map(plan => (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan.name}
                                    priceUSD={plan.price.monthlyUSD}
                                    currency={currency}
                                    description={plan.description}
                                    features={plan.features}
                                    isFeatured={plan.isFeatured}
                                    popularBadge={plan.isPopular}
                                    ctaText="Start Free Trial"
                                    ctaLink="/signup"
                                />
                            ))}
                        </div>
                        <FeatureComparisonTable plans={providerPlans} audience="Provider" />
                    </section>
                 </TabsContent>
                
                 <TabsContent value="auditors" className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <section id="auditor-pricing" className="mb-16">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl font-headline font-semibold text-primary">For Level-III & Auditors</h2>
                        </div>
                        <Card className="max-w-4xl mx-auto">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">{auditorPlan?.name || 'Free Access'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <ul className="mx-auto max-w-md space-y-3">
                                    {(auditorPlan?.features || []).map(feature => (
                                         <li key={feature} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>{feature}</li>
                                    ))}
                                </ul>
                                <p className="mt-4 text-center text-sm text-muted-foreground">Level-III access is included to ensure industry-grade credibility and compliance.</p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button asChild><Link href="/signup">Request Level-III Access</Link></Button>
                            </CardFooter>
                        </Card>
                    </section>
                 </TabsContent>
            </Tabs>
        </div>

        {/* FAQ SECTION */}
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
        
        {/* FINAL CTA / CONTACT FORM */}
        <section id="contact-form" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                Have a Question?
                </h2>
                <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">
                    To request a demo, inquire about pricing, or discuss partnerships, please use the form below. Ready to sign up? <Link href="/signup" className="text-primary font-semibold underline">Create an account</Link>.
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
