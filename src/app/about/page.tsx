
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Building, UserCheck, CheckCircle, Globe, Workflow, Users, DatabaseZap } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import HoneycombHero from '@/components/ui/honeycomb-hero';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about NDT EXCHANGE, the purpose-built digital ecosystem connecting asset owners with certified NDT professionals to ensure operational continuity and grow businesses.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-grow">
        <HoneycombHero imageId="event-02">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                Connecting the World of Asset Integrity
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                NDT EXCHANGE is a purpose-built digital ecosystem where asset owners ensure operational continuity and certified NDT professionals find opportunities to grow their business.
              </p>
            </div>
        </HoneycombHero>

        <section className="py-16">
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
                <Card className="p-2 group">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <Building className="w-8 h-8 text-primary icon-hover-effect" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For Asset Owners (Clients)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Managing asset integrity is complex and crucial. NDT EXCHANGE simplifies the process of procuring inspection services, giving you confidence and control.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Ensure Operational Continuity:</strong> Proactively manage asset health by connecting with a global network of certified inspection professionals.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Streamline Procurement:</strong> Post jobs, evaluate competitive bids, and award contracts with full transparency and confidence.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Protect Intellectual Property:</strong> Centralize all asset data, reports, and documentation in a secure-by-design vault that prevents data leakage.</span></li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="p-2 group">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <UserCheck className="w-8 h-8 text-primary icon-hover-effect" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For NDT Providers (Inspectors)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Focus on what you do best: providing expert inspection services. Our platform helps you find work, manage your team, and streamline your operations.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Grow Your Business:</strong> Access a steady stream of inspection jobs from qualified asset owners looking for your specific expertise and certifications.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Optimize Your Operations:</strong> Manage your team, equipment, and certifications all in one place, reducing administrative overhead and improving efficiency.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Deliver Excellence:</strong> Use professional digital reporting tools to provide high-quality, consistent deliverables that impress clients.</span></li>
                        </ul>
                    </CardContent>
                </Card>
                 <Card className="p-2 group">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <Globe className="w-8 h-8 text-primary icon-hover-effect" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For Auditors & Regulators</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Ensure compliance and maintain oversight with tools designed for transparency and traceability across the inspection lifecycle.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Provide Expert Oversight:</strong> Participate in workflows requiring Level III review, offering your expertise to uphold the highest standards of quality and safety.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Ensure Full Compliance:</strong> Access a complete, tamper-proof audit trail of the entire inspection lifecycle, from job creation to final report.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Work with Confidence:</strong> Review all documentation in a secure, read-only environment specifically designed for compliance and data integrity.</span></li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                    Our Unique Approach: A Connected Ecosystem
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    While other platforms may offer project management or data storage, NDT EXCHANGE is built on a different philosophy: we connect the entire asset integrity ecosystem.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                <Card className="p-2 group">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <Workflow className="w-8 h-8 text-primary icon-hover-effect" />
                            </div>
                            <CardTitle className="text-2xl font-headline">Marketplace & Management in One</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>We are the only platform that seamlessly integrates a competitive service procurement marketplace with a robust suite of operational management tools for both asset owners and service providers. This eliminates silos and creates a single, end-to-end workflow from job creation to final report.</p>
                    </CardContent>
                </Card>
                <Card className="p-2 group">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <Users className="w-8 h-8 text-primary icon-hover-effect" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For the Entire Industry</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>NDT EXCHANGE is designed for every stakeholder. Clients gain control over their assets, Providers find work and manage operations, Auditors ensure compliance, and OEMs connect with their user base. This network effect creates unparalleled value and efficiency for everyone.</p>
                    </CardContent>
                </Card>
                 <Card className="p-2 group">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <DatabaseZap className="w-8 h-8 text-primary icon-hover-effect" />
                            </div>
                            <CardTitle className="text-2xl font-headline">Built for NDT 4.0</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>We treat your data as a valuable asset from day one. By enforcing structured digital reporting instead of just storing static files, our platform paves the way for advanced analytics, predictive maintenance, and the full realization of NDT 4.0 principles.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

         <section className="bg-background py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-primary">
              Ready to Join NDT EXCHANGE?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Experience the future of asset integrity management. Start your 14-day free trial today.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Sign Up for a Free Trial</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
