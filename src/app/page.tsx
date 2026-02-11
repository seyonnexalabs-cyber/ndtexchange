
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, UserCheck, Globe, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import { ndtTechniques as NDTTechniqueData } from '@/lib/ndt-techniques-data';
import UserActivityDiagram from '@/app/components/inspection-lifecycle';
import { FeatureCard } from '@/app/components/feature-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const metadata: Metadata = {
  title: 'NDT EXCHANGE | The Digital Marketplace for Asset Integrity',
  description: 'The premier marketplace connecting asset owners with certified NDT professionals. Streamline procurement, manage assets, and grow your NDT business.',
};

export default function HomePage() {
  const solutions = [
    {
      icon: <Building className="w-8 h-8 text-primary" />,
      title: 'For Asset Owners',
      description: 'A complete toolkit to manage asset integrity, from procurement to decommissioning.',
      link: '/asset-management',
      features: [
          "Ensure operational continuity by managing asset health.",
          "Streamline procurement with transparent bidding.",
          "Centralize all reports and data in a secure IP vault."
      ]
    },
    {
      icon: <UserCheck className="w-8 h-8 text-primary" />,
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
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: 'For Auditors & Regulators',
      description: 'Ensure compliance with tools designed for transparency and traceability.',
      link: '/platform-workflow',
      features: [
        "Participate in workflows requiring Level III review.",
        "Access a complete, tamper-proof audit trail of the inspection lifecycle.",
        "Review documentation in a secure, read-only environment."
      ]
    },
  ];

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
                        A Unified Platform for All Stakeholders
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Whether you own the asset or perform the inspection, NDT EXCHANGE provides the tools you need.
                    </p>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                    {solutions.map((solution, index) => (
                        <Card key={index} className="text-center flex flex-col p-2">
                           <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                                    {solution.icon}
                                </div>
                                <CardTitle className="mt-4 text-2xl font-headline">{solution.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow text-left">
                                <p className="text-muted-foreground mb-4 text-center">{solution.description}</p>
                                 <ul className="space-y-3">
                                    {solution.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 shrink-0" />
                                            <span className="text-muted-foreground text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="justify-center pt-6">
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
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {NDTTechniqueData.filter(tech => tech.isHighlighted).map((technique) => {
                    const techImage = PlaceHolderImages.find(p => p.id === technique.imageId);
                    return (
                        <FeatureCard
                            key={technique.id}
                            imageUrl={techImage?.imageUrl}
                            imageHint={techImage?.imageHint}
                            altText={technique.title}
                            title={`${technique.title} (${technique.id.toUpperCase()})`}
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
