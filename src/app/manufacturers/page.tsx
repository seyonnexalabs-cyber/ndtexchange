
import * as React from 'react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Building } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ndtTechniques } from '@/lib/ndt-techniques-data';
import { FeatureCard } from '@/app/components/feature-card';

export const metadata: Metadata = {
  title: 'NDT Equipment Manufacturers Directory | NDT Exchange',
  description: 'A curated list of prominent Original Equipment Manufacturers (OEMs) for various NDT techniques, including UT, RT, ET, MT, PT, and more.',
};

export default function ManufacturersPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-manufacturers');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-grow">
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
                Leading NDT Equipment Manufacturers
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                A curated list of prominent Original Equipment Manufacturers (OEMs) who are at the forefront of Non-Destructive Testing technology. This list focuses on manufacturers, not resellers or service companies.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {ndtTechniques.map((technique) => {
                        const techImage = PlaceHolderImages.find(p => p.id === technique.imageId);
                        return (
                            <FeatureCard
                                key={technique.id}
                                imageUrl={techImage?.imageUrl}
                                imageHint={techImage?.imageHint}
                                altText={techImage?.description}
                                title={technique.title}
                            >
                                <ul className="space-y-3 text-left">
                                    {technique.companies.map(company => (
                                        <li key={company.name} className="flex items-center">
                                            <Link href={company.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary group w-full">
                                               <Building className="w-4 h-4 mr-3 shrink-0" />
                                               <span className="flex-grow">{company.name} {company.description && <span className="text-xs text-muted-foreground/70">({company.description})</span>}</span>
                                               <LinkIcon className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    ))}
                                    {technique.companies.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No specific OEMs listed for this category.</p>
                                    )}
                                </ul>
                            </FeatureCard>
                        )
                    })}
                </div>
                 <div className="mt-16 text-center text-sm text-muted-foreground max-w-4xl mx-auto p-4 border rounded-lg bg-card">
                    <p className="font-semibold">Disclaimer</p>
                    <p className="mt-2">
                        The manufacturers and links listed on this page are provided for informational purposes only. NDT Exchange is an independent platform and is not affiliated with, endorsed by, or sponsored by any of the companies listed. All company names, logos, and trademarks are the property of their respective owners.
                    </p>
                </div>
            </div>
        </section>

        <section className="bg-card py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-primary">
              Ready to Join NDT Exchange?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Experience the future of asset integrity management. Start your 30-day free trial today. No credit card required, full access to all features.
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
