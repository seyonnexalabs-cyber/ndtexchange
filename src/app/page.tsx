
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import UserActivityDiagram from '@/app/components/inspection-lifecycle';
import { Building, UserCheck, Globe, CheckCircle, HardHat } from 'lucide-react';
import { ndtTechniques } from '@/lib/ndt-techniques-data';
import { FeatureCard } from '@/app/components/feature-card';

export const metadata: Metadata = {
  title: 'The Digital Marketplace for Asset Integrity',
  description: 'NDT Exchange is a purpose-built digital ecosystem connecting asset owners with certified NDT professionals to ensure operational continuity and grow businesses.',
};

export default function HomePage() {
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
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary-foreground">
                The Digital Marketplace for Asset Integrity
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                NDT Exchange is a purpose-built ecosystem where asset owners ensure operational continuity and certified NDT professionals find opportunities to grow their business.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/contact">Get Started</Link>
                  </Button>
                  <Button size="lg" asChild variant="outline" className="bg-background/20 text-white border-white hover:bg-background/30">
                    <Link href="/platform-features">Learn More</Link>
                  </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What is NDT Exchange Section - REVISED */}
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                        The Operating System for Asset Integrity
                    </h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        NDT Exchange is more than a marketplace. It's a unified platform providing dedicated toolsets for every stakeholder in the inspection lifecycle.
                    </p>
                </div>

                <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-x-12 items-start">
                    {/* Client Features */}
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <div className="bg-primary/10 text-primary p-4 rounded-full w-fit">
                            <Building className="w-10 h-10" />
                        </div>
                        <h3 className="mt-6 text-2xl font-headline font-semibold text-primary">For Asset Owners</h3>
                        <p className="mt-4 text-lg text-muted-foreground">A complete, 360-degree view of your asset's health, history, and documentation in one secure, centralized location.</p>
                        <Button asChild className="mt-6">
                            <Link href="/asset-management">Explore Asset Management</Link>
                        </Button>
                    </div>
                    
                    {/* Provider Features */}
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                       <div className="bg-accent/10 text-accent p-4 rounded-full w-fit">
                            <HardHat className="w-10 h-10" />
                        </div>
                        <h3 className="mt-6 text-2xl font-headline font-semibold text-accent">For NDT Providers</h3>
                        <p className="mt-4 text-lg text-muted-foreground">A dedicated suite of tools to manage your team and equipment, improving efficiency and ensuring your resources are always ready.</p>
                        <Button asChild className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Link href="/provider-tools">Explore Provider Tools</Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-headline font-semibold text-primary">
                        Connected by a Transparent Marketplace
                    </h3>
                    <p className="mt-2 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Our core engine is a digital marketplace that streamlines procurement and connects clients with qualified inspectors through a standardized workflow.
                    </p>
                </div>
                <UserActivityDiagram />
            </div>
        </section>

        {/* Who We Serve Section */}
        <section id="who-we-serve" className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                    A Platform For Everyone
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Our platform is built to create a transparent, efficient, and reliable digital ecosystem for every stakeholder in the NDT industry.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                <Card className="p-2 transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <Building className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For Asset Owners (Clients)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Managing asset integrity is complex and crucial. NDT Exchange simplifies the process of procuring inspection services, giving you confidence and control.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Ensure Operational Continuity:</strong> Proactively manage asset health by connecting with a global network of certified inspection professionals.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Streamline Procurement:</strong> Post jobs, evaluate competitive bids, and award contracts with full transparency and confidence.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Protect Intellectual Property:</strong> Centralize all asset data, reports, and documentation in a secure-by-design vault that prevents data leakage.</span></li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="p-2 transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <UserCheck className="w-8 h-8 text-primary" />
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
                 <Card className="p-2 transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-4 rounded-full w-fit">
                                <Globe className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For Auditors & Regulators</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Ensure compliance and maintain oversight with tools designed for transparency and traceability across the inspection lifecycle.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Provide Expert Oversight:</strong> Participate in workflows requiring Level III review, offering your expertise to uphold the highest standards of quality and safety.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Ensure Full Compliance:</strong> Access a complete, tamper-proof audit trail of the entire inspection lifecycle, from job creation to final approval.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span><strong>Work with Confidence:</strong> Review all documentation in a secure, read-only environment specifically designed for compliance and data integrity.</span></li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* NDT Techniques Section */}
        <section id="techniques" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                Supporting All Major NDT Techniques
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Our platform is designed to accommodate all major Non-Destructive Testing methods, connecting you with providers who have the specific expertise you need.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ndtTechniques.filter(t => t.isHighlighted).map((technique) => {
                const techImage = PlaceHolderImages.find(p => p.id === technique.imageId);
                return (
                  <FeatureCard
                    key={technique.id}
                    imageUrl={techImage?.imageUrl}
                    imageHint={techImage?.imageHint}
                    altText={techImage?.description}
                    title={technique.title}
                    description={technique.description}
                  />
                );
              })}
            </div>
            <div className="mt-12 text-center">
                <Button variant="outline" asChild>
                    <Link href="/manufacturers">Explore More Techniques & Manufacturers</Link>
                </Button>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-primary">
              Ready to Join NDT Exchange?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Experience the future of asset integrity management. Start your 30-day free trial today.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/contact">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
