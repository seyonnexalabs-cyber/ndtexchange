'use client';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { subscriptionPlans } from '@/lib/seed-data';
import HoneycombHero from '@/components/ui/honeycomb-hero';
import { PricingTable } from '@/app/components/pricing-table';

const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  companyName: z.string().min(2, "Company name is required."),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["asset-owner", "ndt-company", "auditor", "oem-other"]),
  inquiryType: z.enum(["demo", "pricing", "partnership", "support", "general", "oem-listing"]),
  message: z.string().min(10, "Please provide a brief message (min. 10 characters)."),
});


const ContactForm = () => {
    const form = useForm<z.infer<typeof contactFormSchema>>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: { name: '', companyName: '', email: '', message: '' },
    });

    function onSubmit(data: z.infer<typeof contactFormSchema>) {
        toast("Inquiry Sent", { description: "Thank you for contacting us. We will get back to you shortly." });
        console.log(data);
        form.reset();
    }

    return (
        <Card>
            <CardContent className="p-4">
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
    const router = useRouter();

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

    return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        <HoneycombHero>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary-foreground">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                Whether you're an asset owner, service provider, or auditor, we have a plan that fits your needs. Start free and scale as you grow.
              </p>
            </div>
        </HoneycombHero>

        <section id="pricing-intro" className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-6 md:grid-cols-3">
                    {['Client', 'Provider', 'Auditor'].map(audience => (
                        <Card key={audience} className="border hover:border-primary transition-all">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">{audience}</CardTitle>
                                <CardDescription>{
                                    audience === 'Client'
                                        ? 'Asset owners, operators, and EPC teams.'
                                        : audience === 'Provider'
                                            ? 'Service providers, inspection firms, and contractors.'
                                            : 'Solo/firm auditors and regulatory reviewers.'
                                }</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {subscriptionPlans.filter(p => p.audience === audience && p.isActive && p.isPublic).slice(0, 2).map(plan => (
                                        <li key={plan.id} className="flex justify-between">
                                            <span>{plan.name}</span>
                                            <span className="font-semibold">{plan.price.monthlyUSD === 0 ? 'Free' : `$${(plan.price.monthlyUSD / 100).toFixed(0)}/mo`}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section id="pricing-table" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <PricingTable 
                plans={allPlans}
                onPlanSelect={() => router.push('/signup')}
            />
          </div>
        </section>

        <section id="faq" className="py-16 bg-card">
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
                        Towards the end of your 30-day free trial, we will contact you to discuss paid plan options. If you choose not to subscribe, your account will transition to the free access tier so your data remains available.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
        
        <section id="contact-form" className="py-16 bg-muted/30">
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