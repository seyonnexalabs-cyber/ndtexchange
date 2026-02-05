'use client';

import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Phone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import * as React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ContactPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-providers');
  const [showCustomSubject, setShowCustomSubject] = useState(false);

  const handleSubjectChange = (value: string) => {
    setShowCustomSubject(value === 'other');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        <section className="relative py-20 md:py-24 text-primary-foreground">
           <div className="absolute inset-0">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
            <div className="absolute inset-0 bg-primary/60" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Flexible Plans for Every Role
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                Find the right plan for your role in the NDT ecosystem. Get started for free today.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <Alert className="max-w-3xl mx-auto bg-primary/10 border-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary font-semibold">
                    14-Day Free Trial for Inspectors & NDT Companies. No credit card required. Clients & Level-III are free during MVP.
                  </AlertDescription>
                </Alert>
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              <PricingCard
                plan="Client"
                price="Free"
                description="For asset owners managing critical infrastructure. Free during our MVP phase."
                features={[
                  "Full Asset Lifecycle Management",
                  "Secure Document & Data Vault",
                  "Post jobs to a global marketplace",
                  "Transparent bidding & awarding process",
                  "Advanced historical reporting",
                ]}
                isFeatured={false}
                theme="client"
                ctaText="Get Started Free"
                ctaLink="/login?role=client"
              />
              <PricingCard
                plan="Provider Operations"
                price="From $49"
                description="Digitize your internal operations and team management."
                features={[
                  "Includes a 14-day free trial",
                  "Technician Roster Management",
                  "Equipment Inventory & Calibration Tracking",
                  "QR Code Generation for Equipment",
                  "Internal Job & Schedule Management",
                  "Standard Digital Reporting Tools",
                  "Email & Community Support",
                ]}
                isFeatured={false}
                theme="inspector"
              />
              <PricingCard
                plan="Provider Marketplace"
                price="From $149"
                description="Includes Operations, plus full marketplace access."
                features={[
                  "Includes a 14-day free trial",
                  "All Provider Operations features",
                  "Access to Exclusive Job Marketplace",
                  "Submit Unlimited Competitive Bids",
                  "Public Company Profile",
                  "Direct Client Communication",
                  "Priority Email & Phone Support",
                ]}
                isFeatured={true}
                theme="inspector"
              />
              <PricingCard
                plan="Auditor / Regulator"
                price="By Invite"
                description="For independent Level III auditors and regulatory bodies."
                features={[
                    "Secure, read-only access to job data",
                    "Participate in Level III review workflows",
                    "Tamper-proof audit trail of inspection lifecycle",
                    "Provide expert oversight and ensure compliance",
                    "Direct communication with clients",
                    "Access via client invitation",
                ]}
                isFeatured={false}
                theme="auditor"
                ctaText="By Invitation Only"
                ctaLink="#contact-form"
                ctaDisabled={true}
              />
            </div>
             <p className="text-center text-muted-foreground mt-8 text-sm">
                The prices shown are starting points. Your final subscription cost is usage-based, determined by factors like the number of users and data storage needs. Contact our sales team for a detailed quote tailored to your business. Auditor access is by invitation from Client accounts.
             </p>
          </div>
        </section>

        <section id="contact-form" className="py-20 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-headline font-semibold text-primary">
                            Get in Touch
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Have questions about our platform or pricing? We'd love to hear from you.
                        </p>
                    </div>
                    <form className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="Your Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="you@company.com" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="role">You are a...</Label>
                            <Select name="role">
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="client">Client / Asset Owner</SelectItem>
                                    <SelectItem value="provider">NDT Service Provider</SelectItem>
                                    <SelectItem value="auditor">Auditor / Regulator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subject-select">Subject</Label>
                            <Select onValueChange={handleSubjectChange}>
                                <SelectTrigger id="subject-select">
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pricing">Pricing Inquiry</SelectItem>
                                    <SelectItem value="support">Technical Support</SelectItem>
                                    <SelectItem value="general">General Question</SelectItem>
                                    <SelectItem value="other">Other...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {showCustomSubject && (
                            <div className="space-y-2 animate-in fade-in duration-300">
                                <Label htmlFor="custom-subject">Custom Subject</Label>
                                <Input id="custom-subject" placeholder="Please specify your subject" autoFocus />
                            </div>
                        )}
                         <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px]" />
                        </div>
                        <div className="text-right">
                             <Button type="submit">Send Message</Button>
                        </div>
                    </form>
                    <div className="text-center mt-12 text-muted-foreground">
                        <p className="flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" /> sales@ndtexchange.com
                        </p>
                         <p className="flex items-center justify-center gap-2 mt-2">
                            <Phone className="w-4 h-4" /> (555) 123-4567
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function PricingCard({ plan, price, description, features, isFeatured, theme, ctaText = 'Get a Quote', ctaLink = '#contact-form', ctaDisabled = false }: {
  plan: string;
  price: string;
  description: string;
  features: string[];
  isFeatured: boolean;
  theme: 'client' | 'inspector' | 'auditor' | 'admin';
  ctaText?: string;
  ctaLink?: string;
  ctaDisabled?: boolean;
}) {
  const isPrefixed = price.startsWith("From ");

  return (
    <Card className={cn("flex flex-col", `${theme}-theme`, isFeatured ? "border-primary ring-2 ring-primary shadow-lg" : "")}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{plan}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="pt-4">
          {isPrefixed ? (
            <div className="flex items-baseline justify-center gap-x-1">
              <span className="text-xl font-semibold text-muted-foreground">From</span>
              <span className="text-4xl font-bold">{price.replace('From ', '')}</span>
              <span className="text-sm text-muted-foreground self-end">/mo</span>
            </div>
          ) : (
            <>
              <span className="text-4xl font-bold">{price}</span>
              {price !== "Custom" && price !== "By Invite" && price !== "Free" && <span className="text-sm text-muted-foreground">/mo</span>}
            </>
          )}
        </div>
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
            className={cn("w-full", isFeatured && "bg-accent hover:bg-accent/90 text-accent-foreground")} 
            variant={isFeatured ? 'default' : 'outline'} 
            asChild={!ctaDisabled}
            disabled={ctaDisabled}
        >
          {ctaDisabled ? <span>{ctaText}</span> : <Link href={ctaLink}>{ctaText}</Link>}
        </Button>
      </CardFooter>
    </Card>
  );
}
