
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Building, UserCheck, Globe, CheckCircle, HardHat } from 'lucide-react';
import { ndtTechniques } from '@/lib/ndt-techniques-data';
import { FeatureCard } from '@/app/components/feature-card';

export const metadata: Metadata = {
  title: 'The Digital Marketplace for Asset Integrity',
  description: 'NDT EXCHANGE is a purpose-built digital ecosystem connecting asset owners with certified NDT professionals to ensure operational continuity and grow businesses.',
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
                alt="NDT inspector working on an industrial pipeline"
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
                NDT EXCHANGE is a purpose-built ecosystem where asset owners ensure operational continuity and certified NDT professionals find opportunities to grow their business.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/signup">Sign Up Free</Link>
                  </Button>
                  <Button size="lg" asChild variant="outline" className="bg-background/20 text-white border-white hover:bg-background/30">
                    <Link href="/#features">Learn More</Link>
                  </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What is NDT EXCHANGE Section - REVISED */}
        <section id="features" className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                        The Operating System for Asset Integrity
                    </h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        NDT EXCHANGE is more than a marketplace. It's a unified platform providing dedicated toolsets for every stakeholder in the inspection lifecycle.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-2">
                    {/* Client Features */}
                    <Card className="flex flex-col items-center text-center p-8 transition-all hover:shadow-primary/10 hover:shadow-2xl hover:-translate-y-2">
                        <div className="bg-primary/10 text-primary p-4 rounded-full w-fit">
                            <Building className="w-10 h-10" />
                        </div>
                        <h3 className="mt-6 text-2xl font-headline font-semibold text-primary">For Asset Owners</h3>
                        <p className="mt-4 text-lg text-muted-foreground">A complete, 360-degree view of your asset's health, history, and documentation in one secure, centralized location.</p>
                        <Button size="lg" asChild className="mt-8">
                            <Link href="/asset-management">Explore Asset Management</Link>
                        </Button>
                    </Card>
                    
                    {/* Provider Features */}
                    <Card className="flex flex-col items-center text-center p-8 transition-all hover:shadow-accent/10 hover:shadow-2xl hover:-translate-y-2">
                       <div className="bg-accent/10 text-accent p-4 rounded-full w-fit">
                            <HardHat className="w-10 h-10" />
                        </div>
                        <h3 className="mt-6 text-2xl font-headline font-semibold text-accent">For NDT Providers</h3>
                        <p className="mt-4 text-lg text-muted-foreground">A dedicated suite of tools to manage your team and equipment, improving efficiency and ensuring your resources are always ready.</p>
                        <Button size="lg" asChild className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Link href="/provider-tools">Explore Provider Tools</Link>
                        </Button>
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
                    altText={technique.title}
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
              Ready to Join NDT EXCHANGE?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Experience the future of asset integrity management. Start your free trial today.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
