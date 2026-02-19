
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { FeatureCard } from '@/app/components/feature-card';
import { Target, Zap, LineChart, Handshake } from 'lucide-react';
import InteractiveHexagonGrid from '@/app/components/interactive-hexagon-grid';

export const metadata: Metadata = {
  title: 'OEM Solutions | NDT EXCHANGE',
  description: 'Connect with a targeted audience of NDT professionals and asset owners. Showcase your products, generate qualified leads, and integrate with digital inspection workflows on NDT EXCHANGE.',
};

export default function OEMSolutionsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 bg-muted overflow-hidden hexagon-grid-container">
                    <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                                    Connect with the Heart of the NDT Industry
                                </h1>
                                <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                                    Showcase your equipment to a dedicated audience of asset owners and service providers at the exact moment they're planning and executing inspections.
                                </p>
                                <div className="mt-8">
                                    <Button size="lg" asChild>
                                        <Link href="/contact">Partner With Us</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="oem-benefits" className="py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-headline font-semibold text-accent">Why Partner with NDT EXCHANGE?</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Move beyond traditional marketing. Place your products directly into the digital workflow of your ideal customers.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <FeatureCard
                        icon={<Target className="w-8 h-8 text-accent" />}
                        title="Reach a Targeted Audience"
                        description="Your equipment is seen by NDT professionals and asset integrity managers who are actively planning and executing inspection jobs. No wasted marketing spend."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<Zap className="w-8 h-8 text-accent" />}
                        title="Generate Qualified Leads"
                        description="Connect with users who are specifying equipment for upcoming projects. Our platform identifies purchase signals, delivering high-intent leads directly to your sales team."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<LineChart className="w-8 h-8 text-accent" />}
                        title="Gain Market Insights"
                        description="Understand how and where your equipment is being used. Get anonymized data on which industries and job types specify your products, helping you refine your market strategy."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                    </div>
                  </div>
                </section>
                
                {/* How it Works Section */}
                <section className="py-20 bg-card">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-headline font-semibold text-primary">Become Part of the Digital Workflow</h2>
                             <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                                Integrate your brand and products seamlessly into the inspection process.
                            </p>
                        </div>
                        <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">1</span>
                                    <span>List in Our Manufacturer Directory</span>
                                </h3>
                                <p className="text-muted-foreground pl-12">
                                    Feature your company in our curated <Link href="/manufacturers" className="text-primary underline">NDT Manufacturers Directory</Link>, organized by technique, making it easy for users to discover your brand while researching solutions.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">2</span>
                                    <span>Integrate into Equipment Management</span>
                                </h3>
                                <p className="text-muted-foreground pl-12">
                                    When NDT Providers add equipment to their inventory, they can select your brand and model, making your products a permanent part of their digital toolkit.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">3</span>
                                    <span>Get Specified in Reports</span>
                                </h3>
                                <p className="text-muted-foreground pl-12">
                                    Your equipment name and model appear directly on the final digital inspection reports delivered to asset owners, increasing brand visibility and trust.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">4</span>
                                    <span>Receive Qualified Leads</span>
                                </h3>
                                <p className="text-muted-foreground pl-12">
                                    Opt-in to receive notifications when users are searching for equipment you provide, creating a direct line to potential customers at their moment of need.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="p-8 md:p-12 bg-accent/10 rounded-lg max-w-4xl mx-auto border border-accent/20">
                        <div className="mx-auto bg-accent p-4 rounded-full w-fit mb-6">
                            <Handshake className="w-10 h-10 text-accent-foreground" />
                        </div>
                        <h2 className="text-3xl font-headline font-semibold text-accent">
                          Partner with NDT EXCHANGE
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                          Ready to increase your market presence and connect directly with the NDT community? Contact our partnership team to learn more about our OEM solutions.
                        </p>
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/contact">Become a Partner</Link>
                          </Button>
                        </div>
                    </div>
                  </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
