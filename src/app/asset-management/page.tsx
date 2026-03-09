
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import AssetLifecycleDiagram from '@/app/components/asset-lifecycle';
import { FeatureCard } from '@/app/components/feature-card';
import { FolderKanban, History, CalendarCheck, QrCode, TrendingUp, TriangleAlert } from 'lucide-react';
import ShutdownPhases from '@/app/components/shutdown-phases';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HoneycombHero from '@/components/ui/honeycomb-hero';


export const metadata: Metadata = {
  title: 'Total Lifecycle Asset Management for Clients',
  description: 'Discover a powerful, unified platform to manage the entire lifecycle of your critical assets. Centralize data, track history, and ensure compliance with NDT EXCHANGE.',
};

export default function AssetManagementPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />

            <main className="flex-grow">
                {/* Hero Section */}
                <HoneycombHero className="py-16 md:py-28">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
                            Total Lifecycle Asset Management
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                            Go beyond simple NDT. Our platform provides a complete, 360-degree view of your asset's health, history, and documentation in one secure, centralized location.
                        </p>
                    </div>
                </HoneycombHero>

                {/* Workflow Diagram Section */}
                <section className="py-16">
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
                <section className="py-16 bg-card">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-headline font-semibold text-primary">
                                Master Your Shutdown & Turnaround Maintenance
                            </h2>
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                                NDT EXCHANGE provides a purpose-built toolkit to support all 5 phases of a successful shutdown, from initial scope definition to post-event evaluation.
                            </p>
                        </div>
                        <ShutdownPhases />
                    </div>
                </section>

                {/* Other Maintenance Strategies Section */}
                <section className="py-16">
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

                <section className="py-16 bg-card">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-headline font-semibold text-primary">
                        Ensuring Compliance with Industry Standards
                      </h2>
                      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Our platform is built with a deep understanding of the critical standards that govern asset integrity in the refinery and process industries.
                      </p>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Pressure Vessels</CardTitle>
                          <CardDescription>Fixed Equipment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold">Design & Construction (New)</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">ASME Section VIII, Div 1:</span> Design-by-Rule for vessels up to 3,000 psi.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">In-Service Inspection</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API 510:</span> Governs internal/external inspections, repairs, and rerating.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Auxiliary Standard</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API RP 572:</span> Best practices for conducting inspections.</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Piping Systems</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold">Design & Construction (New)</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">ASME B31.3:</span> Global standard for process piping design and testing.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">In-Service Inspection</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API 570:</span> Specifies inspection and repair for metallic and FRP piping.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Auxiliary Standard</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API RP 574:</span> Guidance for inspecting components like valves and fittings.</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Aboveground Storage Tanks</CardTitle>
                          <CardDescription>ASTs</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold">Design & Construction (New)</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API 650:</span> For welded steel tanks operating at low pressures.</p>
                            <p className="text-muted-foreground mt-2"><span className="font-bold text-foreground">API 620:</span> For large, low-pressure storage tanks, including refrigerated and heated tanks.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">In-Service Inspection & Design</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API 653:</span> Tank Inspection, Repair, Alteration, and Reconstruction. This standard covers the maintenance inspection, repair, alteration, relocation, and reconstruction of steel aboveground storage tanks used in the petroleum and chemical industries.</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Cross-Cutting Standards</CardTitle>
                          <CardDescription>Recommended Practices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div>
                            <h4 className="font-semibold">Damage Mechanisms</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API RP 571:</span> Identifies mechanisms like sulfidation, creep, and CUI.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Risk-Based Inspection (RBI)</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API RP 580/581:</span> Framework to adjust inspection intervals based on risk.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Fitness-for-Service (FFS)</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">API 579-1 / ASME FFS-1:</span> Evaluate if flawed equipment can remain in service.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Digital Data Standard</h4>
                            <p className="text-muted-foreground"><span className="font-bold text-foreground">ASTM E2339 (DICONDE):</span> Standard for interoperable storage of NDT data, which guides our future data strategy.</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>
                
                {/* Features Section */}
                <section id="asset-management-features" className="py-16 bg-background">
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
                <section className="py-16">
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
