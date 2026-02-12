

import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, UserCheck, Globe, CheckCircle, HardHat, Factory } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { NDTTechniques as NDTTechniqueData } from '@/lib/ndt-techniques-data';
import UserActivityDiagram from '@/app/components/inspection-lifecycle';
import { FeatureCard } from '@/app/components/feature-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { clientData, serviceProviders, auditFirms } from '@/lib/seed-data';

export const metadata: Metadata = {
  title: 'NDT EXCHANGE | The Digital Marketplace for Asset Integrity',
  description: 'The premier marketplace connecting asset owners with certified NDT professionals. Streamline procurement, manage assets, and grow your NDT business.',
};

export default function HomePage() {
  const pillars = [
    {
      icon: <Building className="w-8 h-8 text-primary" />,
      title: 'For Asset Owners',
      description: 'A complete toolkit to manage asset integrity, from procurement to decommissioning.',
      link: '/asset-management',
      features: [
          "Centralize all asset data and history in a secure IP vault.",
          "Streamline inspection procurement with a competitive marketplace.",
          "Automate compliance tracking and reporting."
      ]
    },
    {
      icon: <HardHat className="w-8 h-8 text-primary" />,
      title: 'For NDT Providers',
      description: 'Find new opportunities and streamline your operations with professional tools.',
      link: '/provider-tools',
      features: [
        "Access a marketplace of inspection jobs from qualified clients.",
        "Manage your team, equipment, and certifications in one place.",
        "Use professional digital tools to deliver high-quality reports."
      ]
    },
     {
      icon: <Factory className="w-8 h-8 text-primary" />,
      title: 'For Equipment OEMs',
      description: 'Showcase your products to a targeted audience of NDT professionals and asset owners.',
      link: '/oem-solutions',
      features: [
        "Position your brand in front of active buyers.",
        "Generate qualified sales leads from the NDT community.",
        "Integrate your equipment with digital inspection workflows."
      ]
    },
  ];
  
  const manufacturerCount = 10; // This should be dynamic in a real app

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-24 bg-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-center mx-auto">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
                The Digital Marketplace for Asset Integrity
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                A purpose-built ecosystem connecting asset owners with certified NDT professionals. Streamline procurement, manage assets, and grow your NDT business.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
                <Button size="lg" variant="outline">
                  <Link href="/platform-workflow">How It Works</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                        A Unified Platform for the Entire NDT Ecosystem
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Whether you own the asset, perform the inspection, or manufacture the equipment, NDT EXCHANGE provides the tools you need.
                    </p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {pillars.map((pillar, index) => (
                        <Card key={index} className="text-center flex flex-col p-2">
                           <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    {pillar.icon}
                                </div>
                                <CardTitle className="mt-4 text-2xl font-headline">{pillar.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow text-left">
                                <p className="text-muted-foreground mb-4 text-center">{pillar.description}</p>
                                 <ul className="space-y-3">
                                    {pillar.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 shrink-0" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="justify-center pt-6">
                                <Button variant="secondary" asChild>
                                    <Link href={pillar.link}>Learn More</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                Trusted by the Industry
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Join a growing ecosystem of asset owners, service providers, and technology leaders.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-bold text-accent">{clientData.length}+</p>
                <p className="mt-2 text-lg font-semibold text-muted-foreground">Clients</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-accent">{serviceProviders.length}+</p>
                <p className="mt-2 text-lg font-semibold text-muted-foreground">Service Providers</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-accent">{auditFirms.length}+</p>
                <p className="mt-2 text-lg font-semibold text-muted-foreground">Auditors</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-accent">{manufacturerCount}+</p>
                <p className="mt-2 text-lg font-semibold text-muted-foreground">OEM Partners</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                  <h2 className="text-3xl font-headline font-semibold text-primary">
                      A Seamless Inspection Lifecycle
                  </h2>
                  <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                      Our platform provides a clear, collaborative, and auditable path for every inspection, connecting asset owners, NDT providers, and auditors at every stage.
                  </p>
              </div>
              <UserActivityDiagram />
          </div>
        </section>
        
        {/* NDT Techniques Section */}
        <section id="techniques" className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                Supporting a Wide Range of NDT Techniques
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Our platform supports all major non-destructive testing methods, connecting you with providers certified in the specific techniques you need.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {NDTTechniqueData.filter(tech => tech.isHighlighted).map((technique) => {
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
                    )
                })}
            </div>
             <div className="mt-12 text-center">
                <Button asChild variant="outline">
                    <Link href="/manufacturers">View All Techniques & Manufacturers</Link>
                </Button>
            </div>
          </div>
        </section>

         {/* Call to Action Section */}
        <section className="bg-primary/90 py-20 text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold">
              Ready to Join NDT EXCHANGE?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
              Experience the future of asset integrity management. Start your 14-day free trial today.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
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
