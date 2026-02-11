
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { FeatureCard } from '@/app/components/feature-card';
import { 
    FolderKanban, 
    Gavel, 
    ShieldCheck, 
    Search, 
    FileText, 
    HardHat,
    Building
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Platform Features for Asset Integrity Management',
  description: 'Explore the powerful, purpose-built tools for asset lifecycle management, procurement, provider operations, and advanced reporting on NDT EXCHANGE.',
};

export default function PlatformFeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-20 md:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                                A Toolbox for Total Asset Integrity
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                                Explore the purpose-built tools that streamline every aspect of the asset integrity lifecycle, from procurement and management to reporting and compliance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Client Features Section */}
                <section id="client-features" className="py-20 bg-card">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-block bg-primary/10 text-primary p-4 rounded-full w-fit">
                                <Building className="w-10 h-10" />
                            </div>
                            <h2 className="mt-6 text-3xl font-headline font-semibold text-primary">For Asset Owners: Centralized Control</h2>
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                                Gain unparalleled visibility and control over your asset portfolio and inspection programs.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<FolderKanban className="w-8 h-8 text-primary" />}
                                title="Asset Lifecycle Management"
                                description="Maintain a single source of truth for every asset. Store documents, track complete inspection and repair history, and manage compliance from a central hub."
                                cardClass="hover:border-primary/20"
                                iconContainerClass="bg-primary/10"
                            />
                            <FeatureCard
                                icon={<Gavel className="w-8 h-8 text-primary" />}
                                title="Streamlined Procurement"
                                description="Post jobs to a competitive marketplace, receive and compare transparent bids from qualified providers, and award contracts with confidence and full traceability."
                                cardClass="hover:border-primary/20"
                                iconContainerClass="bg-primary/10"
                            />
                            <FeatureCard
                                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                                title="Compliance & Reporting"
                                description="Automate inspection scheduling with calendar alerts, track compliance status across your entire fleet, and generate detailed analytical reports on cost and asset health."
                                cardClass="hover:border-primary/20"
                                iconContainerClass="bg-primary/10"
                            />
                        </div>
                         <div className="mt-12 text-center">
                            <Button asChild variant="outline">
                                <Link href="/asset-management">Learn About Asset Management</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Provider Features Section */}
                <section id="provider-features" className="py-20">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-block bg-accent/10 text-accent p-4 rounded-full w-fit">
                            <HardHat className="w-10 h-10" />
                        </div>
                        <h2 className="mt-6 text-3xl font-headline font-semibold text-accent">For NDT Providers: Operational Efficiency</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Optimize your operations, find new opportunities, and deliver superior service with a professional toolkit.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <FeatureCard
                        icon={<HardHat className="w-8 h-8 text-accent" />}
                        title="Unified Operations Hub"
                        description="Manage your entire operation from one dashboard. Maintain a roster of technicians with their certifications and a full inventory of your equipment with calibration tracking."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<Search className="w-8 h-8 text-accent" />}
                        title="Marketplace Access"
                        description="Discover a continuous stream of job opportunities from qualified asset owners. Filter jobs by technique and location to find the perfect match for your expertise."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                      <FeatureCard
                        icon={<FileText className="w-8 h-8 text-accent" />}
                        title="Professional Digital Reporting"
                        description="Utilize standardized, technique-specific templates to generate high-quality, consistent digital reports. Impress clients and streamline your submission process."
                        cardClass="hover:border-accent/20"
                        iconContainerClass="bg-accent/10"
                      />
                    </div>
                     <div className="mt-12 text-center">
                        <Button asChild variant="outline">
                            <Link href="/provider-tools">Explore Provider Tools</Link>
                        </Button>
                    </div>
                  </div>
                </section>
                
                {/* CTA Section */}
                <section className="py-20 bg-card">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Ready to Elevate Your Workflow?
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Experience the future of asset integrity management. Start your free trial today.
                    </p>
                    <div className="mt-8">
                      <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/signup">Start Your Free Trial</Link>
                      </Button>
                    </div>
                  </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
