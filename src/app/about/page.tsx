
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Building, UserCheck, CheckCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const metadata: Metadata = {
  title: 'About Us | NDT Exchange',
  description: 'Learn about NDT Exchange, the purpose-built digital ecosystem connecting asset owners with certified NDT professionals to ensure operational continuity and grow businesses.',
};

export default function AboutPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-providers');

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
                Connecting the World of Asset Integrity
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/90">
                NDT Exchange is a purpose-built digital ecosystem where asset owners ensure operational continuity and certified NDT professionals find opportunities to grow their business.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                    Who We Serve
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Our platform is built to create a transparent, efficient, and reliable digital ecosystem for every stakeholder in the Non-Destructive Testing industry.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                <Card className="p-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-accent/10 p-4 rounded-full w-fit">
                                <Building className="w-8 h-8 text-accent" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For Asset Owners (Clients)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Managing asset integrity is complex and crucial. NDT Exchange simplifies the process of procuring inspection services, giving you confidence and control.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Ensure Operational Continuity:</strong> Proactively manage asset health by connecting with a global network of certified inspection professionals.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Streamline Procurement:</strong> Post jobs, evaluate competitive bids, and award contracts with full transparency and confidence.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Protect Intellectual Property:</strong> Centralize all asset data, reports, and documentation in a secure-by-design vault that prevents data leakage.</span></li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="p-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-accent/10 p-4 rounded-full w-fit">
                                <UserCheck className="w-8 h-8 text-accent" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For NDT Providers (Inspectors)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Focus on what you do best: providing expert inspection services. Our platform helps you find work, manage your team, and streamline your operations.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Grow Your Business:</strong> Access a steady stream of inspection jobs from qualified asset owners looking for your specific expertise and certifications.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Optimize Your Operations:</strong> Manage your team, equipment, and certifications all in one place, reducing administrative overhead and improving efficiency.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Deliver Excellence:</strong> Use professional digital reporting tools to provide high-quality, consistent deliverables that impress clients.</span></li>
                        </ul>
                    </CardContent>
                </Card>
                 <Card className="p-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-accent/10 p-4 rounded-full w-fit">
                                <Globe className="w-8 h-8 text-accent" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For Auditors & Regulators</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Ensure compliance and maintain oversight with tools designed for transparency and traceability across the inspection lifecycle.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Provide Expert Oversight:</strong> Participate in workflows requiring Level III review, offering your expertise to uphold the highest standards of quality and safety.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Ensure Full Compliance:</strong> Access a complete, tamper-proof audit trail of the entire inspection lifecycle, from job creation to final approval.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Work with Confidence:</strong> Review all documentation in a secure, read-only environment specifically designed for compliance and data integrity.</span></li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

         <section className="bg-card py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-primary">
              Ready to Join NDT Exchange?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Experience the future of asset integrity management. Start your 30-day free trial today. No credit card required, full access to all features.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/contact">Start Your Free Trial</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
