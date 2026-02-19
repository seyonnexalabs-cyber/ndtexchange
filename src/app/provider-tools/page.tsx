
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import ProviderWorkflowDiagram from '@/app/components/provider-workflow';
import { FeatureCard } from '@/app/components/feature-card';
import { Users, Wrench, QrCode, Search, FileText, Gavel } from 'lucide-react';
import HoneycombHero from '@/components/ui/honeycomb-hero';


export const metadata: Metadata = {
  title: 'Operations Hub & Marketplace for NDT Service Providers',
  description: 'Find jobs, manage your team and equipment, and streamline your NDT operations with powerful tools for team and equipment management.',
};

export default function ProviderToolsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <HoneycombHero className="py-20 md:py-32">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                            Grow and Streamline Your NDT Business
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            From finding new clients in our marketplace to managing your day-to-day operations, our platform is your end-to-end solution for growth and efficiency.
                        </p>
                    </div>
                </HoneycombHero>
                
                 {/* Grow Business Section */}
                <section id="provider-marketplace" className="py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-headline font-semibold text-accent">Grow Your Business in the Marketplace</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Connect with a global network of asset owners actively seeking your expertise.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <FeatureCard
                        icon={<Search className="w-8 h-8 text-accent" />}
                        title="Find Qualified Jobs"
                        description="Discover a continuous stream of job opportunities from qualified asset owners. Filter jobs by technique and location to find the perfect match for your expertise."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<Gavel className="w-8 h-8 text-accent" />}
                        title="Submit Competitive Bids"
                        description="Use our structured bidding process to clearly present your technical qualifications, certifications, and pricing to win more work."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<FileText className="w-8 h-8 text-accent" />}
                        title="Deliver Professional Reports"
                        description="Utilize standardized, technique-specific templates to generate high-quality, consistent digital reports that impress clients and streamline your submission process."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                    </div>
                  </div>
                </section>

                {/* Workflow Diagram Section */}
                <section className="py-20 bg-card">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-headline font-semibold text-accent">
                                An Integrated Operations Hub
                            </h2>
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                                From onboarding technicians to optimizing equipment usage in the field, our platform provides the tools to manage your entire operational lifecycle.
                            </p>
                        </div>
                        <ProviderWorkflowDiagram />
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="provider-features" className="py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-headline font-semibold text-accent">
                        The Ultimate Toolkit for NDT Providers
                      </h2>
                      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Our platform empowers you with the tools needed for comprehensive team and equipment management.
                      </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <FeatureCard
                        icon={<Users className="w-8 h-8 text-accent" />}
                        title="Technician Roster Management"
                        description="Maintain a central database of your inspectors, their qualifications, and certifications. Track availability and assign the right person to the right job."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<Wrench className="w-8 h-8 text-accent" />}
                        title="Equipment & Calibration Tracking"
                        description="Log all your NDT equipment, from UT machines to yokes. Track calibration schedules with automated reminders to prevent costly non-compliance."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<QrCode className="w-8 h-8 text-accent" />}
                        title="QR Code Equipment Tagging"
                        description="Instantly access an equipment's full history and checkout status in the field by scanning a simple QR code, streamlining on-site work for your team."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                    </div>
                  </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-card">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Ready to Optimize Your Operations?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Start your free trial today. No credit card required, full access to all features.
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
