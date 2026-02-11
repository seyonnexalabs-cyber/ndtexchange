
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Search, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { NDTTechniques } from '@/lib/placeholder-data';
import { ndtTechniques as NDTTechniqueData } from '@/lib/ndt-techniques-data';
import UserActivityDiagram from '@/app/components/inspection-lifecycle';

export const metadata: Metadata = {
  title: 'NDT EXCHANGE | The Digital Marketplace for Asset Integrity',
  description: 'The premier marketplace connecting asset owners with certified NDT professionals. Streamline procurement, manage assets, and grow your NDT business.',
};

export default function HomePage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  const solutions = [
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: 'For Asset Owners',
      description: 'Find qualified inspectors, manage competitive bids, and centralize all your asset inspection data in one secure platform.',
      link: '/asset-management'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: 'For NDT Providers',
      description: 'Access a marketplace of inspection jobs, manage your team and equipment, and deliver professional digital reports.',
       link: '/provider-tools'
    },
     {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'For Auditors & Regulators',
      description: 'Ensure compliance with a complete, tamper-proof audit trail of the entire inspection lifecycle.',
       link: '/about'
    },
  ];

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
            <div className="max-w-3xl text-center mx-auto">
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-foreground">
                The Digital Marketplace for Asset Integrity
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/90">
                A purpose-built ecosystem connecting asset owners with certified NDT professionals. Streamline procurement, manage assets, and grow your NDT business.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white">
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
                        A Unified Platform for All Stakeholders
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Whether you own the asset or perform the inspection, NDT EXCHANGE provides the tools you need.
                    </p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {solutions.map((solution, index) => (
                        <Card key={index} className="text-center p-2">
                           <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    {solution.icon}
                                </div>
                                <CardTitle className="mt-4 text-2xl font-headline">{solution.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{solution.description}</p>
                            </CardContent>
                            <CardFooter className="justify-center">
                                <Button variant="secondary" asChild>
                                    <Link href={solution.link}>Learn More</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* How it works Section */}
        <section className="py-20 bg-card">
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
        <section id="techniques" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                Supporting a Wide Range of NDT Techniques
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Our platform supports all major non-destructive testing methods, connecting you with providers certified in the specific techniques you need.
              </p>
            </div>
            <div className="mt-12 grid gap-x-6 gap-y-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {NDTTechniqueData.map((tech) => {
                const technique = NDTTechniques.find(t => t.id === tech.id);
                return (
                  <div key={tech.id} className="text-center group">
                    <Card className="p-4 bg-muted/30 transition-all group-hover:bg-accent/50 group-hover:-translate-y-1">
                      <p className="font-bold text-lg text-accent-foreground">{technique?.name}</p>
                      <p className="text-sm font-mono text-muted-foreground">{tech.id.toUpperCase()}</p>
                    </Card>
                  </div>
                )
              })}
            </div>
             <div className="mt-12 text-center">
                <Button asChild>
                    <Link href="/manufacturers">View Equipment Manufacturers</Link>
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
