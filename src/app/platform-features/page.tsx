
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { FeatureCard } from '@/app/components/feature-card';
import { Building, HardHat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Features for Asset Owners and NDT Providers',
  description: 'Explore the powerful, purpose-built tools for asset owners and NDT service providers. Manage assets, teams, and equipment all in one unified platform.',
};

export default function PlatformFeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-20 md:py-32 bg-primary/10">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                                A Unified Platform for Total Asset Integrity
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                                Powerful, purpose-built tools for both asset owners and service providers to streamline operations, ensure compliance, and grow their business.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-12">
                            {/* Client Features */}
                            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                                <div className="bg-primary/10 text-primary p-4 rounded-full w-fit">
                                    <Building className="w-10 h-10" />
                                </div>
                                <h2 className="mt-6 text-3xl font-headline font-semibold text-primary">For Asset Owners (Clients)</h2>
                                <p className="mt-4 text-lg text-muted-foreground">Go beyond simple NDT. Our platform provides a complete, 360-degree view of your asset's health, history, and documentation in one secure, centralized location.</p>
                                <Button size="lg" asChild className="mt-8">
                                    <Link href="/asset-management">Explore Asset Management</Link>
                                </Button>
                            </div>
                            
                            {/* Provider Features */}
                            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                               <div className="bg-accent/10 text-accent p-4 rounded-full w-fit">
                                    <HardHat className="w-10 h-10" />
                                </div>
                                <h2 className="mt-6 text-3xl font-headline font-semibold text-accent">For NDT Providers (Inspectors)</h2>
                                <p className="mt-4 text-lg text-muted-foreground">Move beyond spreadsheets. Our platform provides a dedicated suite of tools to manage your team and equipment, improving efficiency and ensuring your resources are always ready.</p>
                                <Button size="lg" asChild className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                                    <Link href="/provider-tools">Explore Provider Tools</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="py-20 bg-card">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Ready to Take Control?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Experience the future of asset integrity management. Start your 30-day free trial today.
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
