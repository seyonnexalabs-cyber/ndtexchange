'use client';

import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building, HardHat, Eye, Cloud, GitBranch, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// New pricing card component based on the user's new specs.
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
             {(price.startsWith("₹") && !price.includes("event")) && <span className="text-sm text-muted-foreground"> / month</span>}
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

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        {/* 1. HERO SECTION */}
        <section className="bg-card border-b py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
              Simple, Transparent Pricing for the NDT Industry
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free. Scale as your inspections, teams, and projects grow.
            </p>
             <p className="mt-4 text-sm text-muted-foreground">
                No credit card required • Level‑III access included • Marketplace free during MVP
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="#contact-form">Start Pilot / Request Access</Link>
                </Button>
                <Button size="lg" asChild variant="outline">
                  <Link href="#pricing-tabs">View Plans Below</Link>
                </Button>
            </div>
          </div>
        </section>

        <div id="pricing-tabs" className="py-20">
        <Tabs defaultValue="asset-owners" className="w-full">
            {/* 2. WHO IS THIS FOR? (ROLE SELECTOR) */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-center">
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                    <TabsTrigger value="asset-owners" className="gap-2"><Building /> Asset Owners</TabsTrigger>
                    <TabsTrigger value="ndt-companies" className="gap-2"><HardHat /> NDT Companies</TabsTrigger>
                    <TabsTrigger value="auditors" className="gap-2"><Eye /> Level-III & Auditors</TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="asset-owners" className="container mx-auto px-4 sm:px-6 lg:px-8">
                 {/* 3. CLIENT (ASSET OWNER) PRICING */}
                <section id="asset-owner-pricing" className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-headline font-semibold text-primary">For Asset Owners & Clients</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Gain secure access to inspection data across vendors, projects, and shutdowns.</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                        <PricingCard
                            plan="Client Access (MVP)"
                            price="₹0 – ₹3,000"
                            description="Best for: Plants, EPCs, pilot teams"
                            features={[
                                "Asset registry (up to 200 assets)",
                                "Read-only access to NDT reports",
                                "Vendor-shared reports",
                                "Asset inspection history",
                                "Web portal access",
                            ]}
                            ctaText="Start Free Access"
                        />
                        <PricingCard
                            plan="Client Plus"
                            price="₹5,000 – ₹8,000"
                            description="Best for: Multi-vendor operations"
                            features={[
                                "Everything in Client Access, plus:",
                                "Unlimited assets",
                                "Multiple vendors",
                                "Comments & approvals",
                                "Shutdown inspection view",
                            ]}
                            isFeatured={true}
                            ctaText="Upgrade to Plus"
                        />
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
                         <PricingCard
                            plan="Individual Inspector"
                            price="₹1,500"
                            description="Per inspector"
                            features={[
                                "Job assignments",
                                "Digital report creation",
                                "Mobile inspection workflows",
                                "Basic equipment tracking",
                            ]}
                            ctaText="Start as Inspector"
                        />
                        <PricingCard
                            plan="NDT Company"
                            price="₹5,000"
                            description="Per company"
                            features={[
                                "Up to 5 inspectors",
                                "Equipment & calibration tracking",
                                "Client-linked projects",
                                "Level-III review workflows",
                                "Report sharing via NDT Exchange",
                            ]}
                            isFeatured={true}
                            popularBadge={true}
                            ctaText="Start Company Pilot"
                        />
                        <PricingCard
                            plan="Company Growth"
                            price="₹10,000"
                            description="Per company"
                            features={[
                                "Up to 15 inspectors",
                                "Multi-site operations",
                                "Advanced report templates",
                                "Priority support",
                            ]}
                            ctaText="Upgrade to Growth"
                        />
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
                            <CardTitle className="text-2xl">FREE during MVP</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="mx-auto max-w-md space-y-3 text-center">
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Review & approval workflows</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Audit comments & traceability</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Certification reference access</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Cross-project oversight (limited)</li>
                            </ul>
                            <p className="mt-4 text-center text-sm text-muted-foreground">Level-III access is included to ensure industry-grade credibility and compliance.</p>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Button>Request Level-III Access</Button>
                        </CardFooter>
                    </Card>
                </section>
             </TabsContent>
        </Tabs>
        </div>


        {/* 6. EXCHANGE & MARKETPLACE PRICING */}
        <section className="py-20 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-semibold text-primary">NDT Exchange Marketplace</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Connect clients, inspectors, and vendors through a shared job & data exchange.</p>
                </div>
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <div className="border p-6 rounded-lg">
                        <h3 className="font-semibold text-xl">Job Listings & Bidding</h3>
                        <p className="text-3xl font-bold mt-2">₹0 – FREE (MVP)</p>
                        <ul className="mt-4 space-y-2 text-muted-foreground">
                            <li>Post jobs</li>
                            <li>Submit bids</li>
                            <li>Client shortlisting</li>
                            <li>Award marking</li>
                        </ul>
                    </div>
                     <div className="border p-6 rounded-lg">
                        <h3 className="font-semibold text-xl">Future Monetization (Transparent)</h3>
                        <p className="text-lg font-bold mt-2">Commission starts post‑MVP</p>
                        <ul className="mt-4 space-y-2 text-muted-foreground">
                            <li>2% success fee on awarded jobs (after pilot phase)</li>
                            <li>Premium access options later</li>
                        </ul>
                        <p className="mt-4 text-xs italic text-muted-foreground">No commissions during MVP. We grow only when you grow.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* 7. SHUTDOWN MAINTENANCE PRICING */}
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-semibold text-primary">Shutdown Maintenance Events</h2>
                </div>
                 <Card className="max-w-2xl mx-auto bg-accent/10 border-accent">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-accent">₹25,000 per shutdown event</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ul className="mx-auto max-w-md space-y-3">
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Multi-vendor coordination</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Asset-wise inspection visibility</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Live shutdown progress tracking</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary"/>Central report repository</li>
                        </ul>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button>Plan a Shutdown</Button>
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
                        <p className="text-lg italic text-muted-foreground">“NDT Exchange simplified multi‑vendor inspections during shutdowns.”</p>
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
                        Client access is free or nominal during MVP.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Is Level-III really free?</AccordionTrigger>
                        <AccordionContent>
                        Yes, to ensure audit credibility.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>When do commissions start?</AccordionTrigger>
                        <AccordionContent>
                        After successful MVP adoption.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Can pricing change later?</AccordionTrigger>
                        <AccordionContent>
                        Early users will be grandfathered.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
        
        {/* 10. FINAL CTA */}
        <section id="contact-form" className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-primary">
              Ready to digitize inspections and collaborate better?
            </h2>
            <p className="mt-2 text-muted-foreground">Industry-first platform, built for long-term trust</p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg">Start Pilot</Button>
              <Button size="lg" variant="outline">Talk to Us</Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
