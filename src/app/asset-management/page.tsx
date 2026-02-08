
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AssetLifecycleDiagram from '@/app/components/asset-lifecycle';
import { FeatureCard } from '@/app/components/feature-card';
import { FolderKanban, History, CalendarCheck, QrCode, TrendingUp, TriangleAlert } from 'lucide-react';
import ShutdownPhases from '@/app/components/shutdown-phases';


export const metadata: Metadata = {
  title: 'Total Lifecycle Asset Management for Clients',
  description: 'Discover a powerful, unified platform to manage the entire lifecycle of your critical assets. Centralize data, track history, and ensure compliance with NDT Connect.',
};

export default function AssetManagementPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-providers');

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32">
                    <div className="absolute inset-0">
                        {heroImage && (
                            <Image
                                src={heroImage.imageUrl}
                                alt="An industrial facility with large storage tanks, representing asset management."
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
                            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary-foreground">
                                Total Lifecycle Asset Management
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                                Go beyond simple NDT. Our platform provides a complete, 360-degree view of your asset's health, history, and documentation in one secure, centralized location.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Workflow Diagram Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-headline font-semibold text-primary">
                                A Streamlined Asset Integrity Workflow
                            </h2>
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                                From creation to decommissioning, our platform provides the tools to manage every stage of your asset's lifecycle with clarity and control.
                            </p>
                        </div>
                        <AssetLifecycleDiagram />
                    </div>
                </section>

                 {/* Shutdown Maintenance Section */}
                <section className="py-20 bg-card">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-headline font-semibold text-primary">
                                Master Your Shutdown & Turnaround Maintenance
                            </h2>
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                                NDT Connect provides a purpose-built toolkit to support all 5 phases of a successful shutdown, from initial scope definition to post-event evaluation.
                            </p>
                        </div>
                        <ShutdownPhases />
                    </div>
                </section>

                {/* Other Maintenance Strategies Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-headline font-semibold text-primary">
                                Beyond Turnarounds: A Complete Maintenance Toolkit
                            </h2>
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                                Our platform also supports proactive and reactive maintenance strategies to ensure you're prepared for any scenario.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-2 max-w-4xl mx-auto">
                            <FeatureCard
                                icon={<TrendingUp className="w-8 h-8 text-primary" />}
                                title="Predictive & Condition-Based"
                                description="Leverage historical data and trend analysis to move from reactive to proactive maintenance. Schedule inspections based on asset condition to prevent failures before they happen."
                                cardClass="hover:border-primary/20"
                                iconContainerClass="bg-primary/10"
                            />
                            <FeatureCard
                                icon={<TriangleAlert className="w-8 h-8 text-destructive" />}
                                title="Breakdown & Emergency Maintenance"
                                description="When the unexpected happens, quickly find and dispatch qualified local inspectors. Our marketplace gives you immediate access to a network of professionals ready to respond."
                                cardClass="hover:border-destructive/20"
                                iconContainerClass="bg-destructive/10"
                            />
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="asset-management-features" className="py-20 bg-card">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-headline font-semibold text-primary">
                        The Ultimate Asset Integrity Hub
                      </h2>
                      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Our platform empowers you with the tools needed for comprehensive asset integrity management, all in one place.
                      </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                      <FeatureCard
                        icon={<FolderKanban className="w-8 h-8 text-primary" />}
                        title="Centralized Document Vault"
                        description="Securely store and manage all asset-related documents like P&IDs, historical reports, and fabrication certificates in one easy-to-access vault."
                        cardClass="hover:border-primary/20"
                        iconContainerClass="bg-primary/10"
                      />
                      <FeatureCard
                        icon={<History className="w-8 h-8 text-primary" />}
                        title="Complete Lifecycle History"
                        description="Gain a full, tamper-proof audit trail of every inspection, repair, and status change, providing unparalleled traceability for compliance and decision-making."
                        cardClass="hover:border-primary/20"
                        iconContainerClass="bg-primary/10"
                      />
                      <FeatureCard
                        icon={<CalendarCheck className="w-8 h-8 text-primary" />}
                        title="Automated Scheduling & Alerts"
                        description="Stay ahead of maintenance with automated reminders for upcoming inspections. Prevent costly oversights and ensure your assets are always in compliance."
                        cardClass="hover:border-primary/20"
                        iconContainerClass="bg-primary/10"
                      />
                      <FeatureCard
                        icon={<QrCode className="w-8 h-8 text-primary" />}
                        title="QR Code Asset Tagging"
                        description="Instantly access an asset's full history and documentation in the field by scanning a simple QR code, streamlining on-site work for your team and providers."
                        cardClass="hover:border-primary/20"
                        iconContainerClass="bg-primary/10"
                      />
                    </div>
                  </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Ready to Take Control of Your Assets?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Experience the future of asset integrity management. Start your free trial today.
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
