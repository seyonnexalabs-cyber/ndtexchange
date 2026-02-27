
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { FeatureCard } from '@/app/components/feature-card';
import { Cloud, BrainCircuit, Share, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import HoneycombHero from '@/components/ui/honeycomb-hero';

export const metadata: Metadata = {
  title: 'NDT 4.0 - The Future of Asset Integrity',
  description: 'Learn about NDT 4.0, the next evolution of non-destructive testing, leveraging IoT, AI, and digital twins to create a connected, predictive, and intelligent asset management ecosystem.',
};

export default function NDT40Page() {
    const coreTechnologies = [
        {
            icon: <Share className="w-8 h-8 text-primary" />,
            title: 'IIoT & Connectivity',
            description: 'Sensors and smart devices continuously collect real-time data on asset health and environmental conditions, streaming it to a central platform.'
        },
        {
            icon: <Cloud className="w-8 h-8 text-primary" />,
            title: 'Cloud & Big Data',
            description: 'Vast amounts of data from inspections, sensors, and operational history are stored and processed in the cloud, forming a rich dataset for analysis.'
        },
        {
            icon: <BrainCircuit className="w-8 h-8 text-primary" />,
            title: 'AI & Machine Learning',
            description: 'Algorithms analyze historical and real-time data to identify patterns, predict potential failures, and recommend optimal inspection intervals (Risk-Based Inspection).'
        },
        {
            icon: <Copy className="w-8 h-8 text-primary" />,
            title: 'Digital Twins',
            description: 'A virtual replica of a physical asset is created and continuously updated with live data, allowing for simulations, what-if analysis, and optimized maintenance planning.'
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <HoneycombHero>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                            Embracing NDT 4.0: The Future of Asset Integrity
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            NDT 4.0 is the application of Industry 4.0 principles to non-destructive testing. It represents a shift from reactive inspections to a predictive, data-driven, and interconnected ecosystem for managing asset health.
                        </p>
                    </div>
                </HoneycombHero>

                 {/* Core Technologies Section */}
                <section className="py-16">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-headline font-semibold text-primary">Core Technologies of NDT 4.0</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                            NDT 4.0 integrates several key technologies to create a holistic and intelligent asset management framework.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                      {coreTechnologies.map(tech => (
                        <FeatureCard
                            key={tech.title}
                            icon={tech.icon}
                            title={tech.title}
                            description={tech.description}
                            cardClass="hover:border-primary/20 text-center"
                            iconContainerClass="bg-primary/10"
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* How NDT EXCHANGE Fits In Section */}
                <section className="py-16 bg-card">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-headline font-semibold text-primary">
                                    How NDT EXCHANGE Enables NDT 4.0
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    Our platform isn't just a marketplace; it's the foundational layer for your NDT 4.0 strategy. We provide the collaborative tissue that connects every stakeholder and every piece of data.
                                </p>
                            </div>
                            <div className="space-y-6">
                                <Card className="bg-background">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Centralized Data Hub</CardTitle>
                                        <CardDescription>NDT EXCHANGE acts as the single source of truth, consolidating inspection reports, asset history, and job data from multiple vendors into one secure, accessible location.</CardDescription>
                                    </CardHeader>
                                </Card>
                                <Card className="bg-background">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Structured Digital Reporting</CardTitle>
                                        <CardDescription>By standardizing how data is captured and reported, our platform transforms static PDF reports into structured data ready for AI-driven analysis and predictive modeling.</CardDescription>
                                    </CardHeader>
                                </Card>
                                <Card className="bg-background">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Ecosystem Connectivity</CardTitle>
                                        <CardDescription>We provide the digital infrastructure that connects asset owners, service providers, auditors, and even equipment manufacturers, creating the collaborative network essential for NDT 4.0.</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="py-16">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                      Begin Your NDT 4.0 Journey
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                      Take the first step towards a predictive, data-driven asset integrity program.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                      <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/signup">Start Your Free Trial</Link>
                      </Button>
                      <Button size="lg" asChild variant="outline">
                        <Link href="/request-demo">Request a Demo</Link>
                      </Button>
                    </div>
                  </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
