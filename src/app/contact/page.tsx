'use client';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building, HardHat, Eye, Cloud, GitBranch, Cpu, Send, Mail, Phone } from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { subscriptionPlans } from '@/lib/subscription-plans';

function PricingCard({ plan, price, description, features, isFeatured = false, ctaText, ctaLink = '#', popularBadge = false }: {
  plan: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  ctaText: string;
  ctaLink?: string;
  popularBadge?: boolean;
}) {
  return (
    <Card className={cn("flex flex-col h-full", isFeatured && "border-primary ring-2 ring-primary shadow-lg")}>
       {popularBadge && (
            <div className="py-1.5 px-3 bg-primary text-primary-foreground text-sm font-semibold rounded-t-lg text-center">
                ⭐ Most Chosen
            </div>
       )}
      <CardHeader>
        <CardTitle className="text-xl font-headline">{plan}</CardTitle>
        <div className="pt-2">
            <span className="text-3xl font-bold">{price}</span>
            {price.toLowerCase() !== 'free' && !price.toLowerCase().includes('custom') && <span className="text-muted-foreground">/ month</span>}
        </div>
        <CardDescription className="pt-2 !mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
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
  inquiryType: z.enum(["pricing", "partnership", "support", "general", "oem-listing"], {required_error: 'Please select an inquiry type.'}),
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
    type Currency = 'USD' | 'EUR' | 'INR';
    const [currency, setCurrency] = React.useState<Currency>('USD');
    
    const [activePlans, setActivePlans] = useState(() => subscriptionPlans.filter(p => p.isActive && p.isPublic));

    const priceToNumber = (price: string) => {
        if (price.toLowerCase() === 'free') return 0;
        const match = price.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : Infinity;
    };

    const clientPlans = useMemo(() => activePlans
        .filter(p => p.audience === 'Client')
        .sort((a, b) => priceToNumber(a.price.monthly[currency]) - priceToNumber(b.price.monthly[currency])), 
    [activePlans, currency]);
    
    const providerPlans = useMemo(() => activePlans
        .filter(p => p.audience === 'Provider')
        .sort((a, b) => priceToNumber(a.price.monthly[currency]) - priceToNumber(b.price.monthly[currency])), 
    [activePlans, currency]);

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
        <section className="py-20 md:py-24 bg-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                Simple, Transparent Pricing for the NDT Industry
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                Start free. Scale as your inspections, teams, and projects grow.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                  14-Day Free Trial • No credit card required • Clients & Level‑III are free.
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
          </div>
        </section>

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
                     {/* 3. CLIENT (ASSET OWNER) PRICING */}
                    <section id="asset-owner-pricing" className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-headline font-semibold text-primary">For Asset Owners & Clients</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Gain secure access to inspection data across vendors, projects, and shutdowns.</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                            {clientPlans.map(plan => (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan.name}
                                    price={plan.price.monthly[currency]}
                                    description={plan.description}
                                    features={plan.features}
                                    isFeatured={plan.isFeatured}
                                    ctaText="Get Started"
                                    ctaLink="/signup"
                                />
                            ))}
                        </div>
                    </section>
                </TabsContent>

                 <TabsContent value="ndt-companies" className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 4. NDT COMPANY & INSPECTOR PRICING */}
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
                                    price={plan.price.monthly[currency]}
                                    description={plan.description}
                                    features={plan.features}
                                    isFeatured={plan.isFeatured}
                                    popularBadge={plan.isPopular}
                                    ctaText="Get Started"
                                    ctaLink="/signup"
                                />
                            ))}
                        </div>
                    </section>
                 </TabsContent>
                
                 <TabsContent value="auditors" className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 5. LEVEL-III / AUDITOR ACCESS */}
                    <section id="auditor-pricing" className="mb-16">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl font-headline font-semibold text-primary">For Level-III & Auditors</h2>
                        </div>
                        <Card className="max-w-4xl mx-auto">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">{auditorPlan?.name || 'Free Access'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <ul className="mx-auto max-w-md space-y-3 text-center">
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

        
        {/* 7. SHUTDOWN MAINTENANCE PRICING */}
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-semibold text-primary">Shutdown Maintenance Events</h2>
                </div>
                 <Card className="max-w-2xl mx-auto bg-accent/10 border-accent">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-accent">$300 per shutdown event</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ul className="mx-auto max-w-md space-y-3">
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Multi-vendor coordination</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Asset-wise inspection visibility</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Live shutdown progress tracking</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Central report repository</li>
                             <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Consolidated asset inspection view with vendor equipment traceability during shutdowns</li>
                        </ul>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button asChild><Link href="#contact-form">Plan a Shutdown</Link></Button>
                    </CardFooter>
                </Card>
            </div>
        </section>

        {/* 8. TRUST & ASSURANCE SECTION */}
        <section className="py-20 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                         <h2 className="text-3xl font-headline font-semibold text-primary">Trust & Assurance</h2>
                         <div className="mt-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full"><GitBranch className="w-6 h-6 text-primary"/></div>
                                <div>
                                    <h4 className="font-semibold">Industry-Aligned Workflows</h4>
                                    <p className="text-muted-foreground text-sm">Built for how the NDT industry actually works.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full"><Cloud className="w-6 h-6 text-primary"/></div>
                                <div>
                                    <h4 className="font-semibold">Secure Cloud Infrastructure</h4>
                                    <p className="text-muted-foreground text-sm">Your data is protected with enterprise-grade security.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-full"><Cpu className="w-6 h-6 text-primary"/></div>
                                <div>
                                    <h4 className="font-semibold">Pilot-Friendly Pricing</h4>
                                    <p className="text-muted-foreground text-sm">Start small and scale as you see value. No long-term contracts.</p>
                                </div>
                            </div>
                         </div>
                    </div>
                     <div className="p-8 border-l-4 border-primary bg-background">
                        <p className="text-lg italic text-muted-foreground">“NDT EXCHANGE simplified multi‑vendor inspections during shutdowns.”</p>
                        <p className="mt-4 font-semibold">- Plant Manager, Oil & Gas Sector</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* 9. FAQ SECTION */}
        <section id="faq" className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-semibold text-primary">Frequently Asked Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Do clients have to pay?</AccordionTrigger>
                        <AccordionContent>
                        Client access is free for basic use. Paid plans are available for unlimited assets and advanced features.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Is Level-III really free?</AccordionTrigger>
                        <AccordionContent>
                        Yes, to ensure audit credibility. Auditors are invited to jobs by clients or providers.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>How does NDT EXCHANGE make money?</AccordionTrigger>
                        <AccordionContent>
                        NDT EXCHANGE operates on a subscription (SaaS) model. We charge a monthly or annual fee for access to our platform features, depending on the plan you choose. We do not take a commission on jobs awarded through the marketplace.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Can pricing change later?</AccordionTrigger>
                        <AccordionContent>
                        Early users will be grandfathered into favorable pricing.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <p className="text-center text-sm text-muted-foreground mt-12">
                    Prices are shown in local currency for convenience. Final billing currency depends on billing location.
                </p>
            </div>
        </section>
        
        {/* 10. FINAL CTA / CONTACT FORM */}
        <section id="contact-form" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                Have a Question?
                </h2>
                <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">
                    If you have questions about pricing or partnerships, please use the form below. Ready to sign up? <Link href="/signup" className="text-primary font-semibold underline">Create an account</Link>. OEMs interested in a free listing in our directory can also use this form.
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
