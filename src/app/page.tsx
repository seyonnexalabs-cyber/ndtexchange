
import { Button } from '@/components/ui/button';
import { CheckCircle, ShieldCheck, Search, Users, Globe, Building, UserCheck, FolderKanban, History, CalendarCheck, QrCode } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import UserActivityDiagram from '@/app/components/inspection-lifecycle';
import type { Metadata } from 'next';
import { ndtTechniques } from '@/lib/ndt-techniques-data';
import { FeatureCard } from '@/app/components/feature-card';

export const metadata: Metadata = {
  title: 'NDT Exchange | Asset Integrity & Inspection Marketplace',
  description: 'The premier digital ecosystem where asset owners ensure operational continuity and certified NDT professionals find new opportunities to grow their business. Start your 30-day free trial today.',
};

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
  const industryImages = {
    oilgas: PlaceHolderImages.find(p => p.id === 'industry-oilgas'),
    powergen: PlaceHolderImages.find(p => p.id === 'industry-powergen'),
    chemical: PlaceHolderImages.find(p => p.id === 'industry-chemical'),
    manufacturing: PlaceHolderImages.find(p => p.id === 'industry-manufacturing'),
    aerospace: PlaceHolderImages.find(p => p.id === 'industry-aerospace'),
    infrastructure: PlaceHolderImages.find(p => p.id === 'industry-infrastructure'),
  }

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
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-foreground">
                Connecting Asset Integrity with NDT Expertise
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/90">
                The premier digital ecosystem where asset owners ensure operational continuity and certified NDT professionals find new opportunities to grow their business. Start your 30-day free trial today.
              </p>
              <div className="mt-10">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/contact">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                        How It Works: A Collaborative Workflow
                    </h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Our platform orchestrates a seamless workflow between asset owners, service providers, and auditors, ensuring transparency and efficiency at every stage.
                    </p>
                </div>
                <div className="mt-12">
                    <UserActivityDiagram />
                </div>
            </div>
        </section>

        <section className="py-20 bg-card">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center">
                    <h2 className="text-3xl font-headline font-semibold text-primary">
                        Built for Every Role in Asset Integrity
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Our platform is built to create a transparent, efficient, and reliable digital ecosystem for every stakeholder in the Non-Destructive Testing industry.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 mt-12">
                    <FeatureCard
                        icon={<Building className="w-8 h-8 text-accent" />}
                        iconContainerClass="bg-accent/10"
                        title="For Asset Owners (Clients)"
                        description="Managing asset integrity is complex and crucial. NDT Exchange simplifies the process of procuring inspection services, giving you confidence and control."
                    >
                        <ul className="space-y-3 text-left">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Ensure Operational Continuity:</strong> Proactively manage asset health by connecting with a global network of certified inspection professionals.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Streamline Procurement:</strong> Post jobs, evaluate competitive bids, and award contracts with full transparency and confidence.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Protect Intellectual Property:</strong> Centralize all asset data, reports, and documentation in a secure-by-design vault that prevents data leakage.</span></li>
                        </ul>
                    </FeatureCard>
                    <FeatureCard
                        icon={<UserCheck className="w-8 h-8 text-accent" />}
                        iconContainerClass="bg-accent/10"
                        title="For NDT Providers (Inspectors)"
                        description="Focus on what you do best: providing expert inspection services. Our platform helps you find work, manage your team, and streamline your operations."
                    >
                       <ul className="space-y-3 text-left">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Grow Your Business:</strong> Access a steady stream of inspection jobs from qualified asset owners looking for your specific expertise and certifications.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Optimize Your Operations:</strong> Manage your team, equipment, and certifications all in one place, reducing administrative overhead and improving efficiency.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Deliver Excellence:</strong> Use professional digital reporting tools to provide high-quality, consistent deliverables that impress clients.</span></li>
                        </ul>
                    </FeatureCard>
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-accent" />}
                        iconContainerClass="bg-accent/10"
                        title="For Auditors & Regulators"
                        description="Ensure compliance and maintain oversight with tools designed for transparency and traceability across the inspection lifecycle."
                    >
                        <ul className="space-y-3 text-left">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Provide Expert Oversight:</strong> Participate in workflows requiring Level III review, offering your expertise to uphold the highest standards of quality and safety.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Ensure Full Compliance:</strong> Access a complete, tamper-proof audit trail of the entire inspection lifecycle, from job creation to final approval.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span><strong>Work with Confidence:</strong> Review all documentation in a secure, read-only environment specifically designed for compliance and data integrity.</span></li>
                        </ul>
                    </FeatureCard>
                </div>
            </div>
        </section>
        
        <section id="industries" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                Serving Critical Industries
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Our platform is engineered to meet the demanding asset integrity needs of the world's most critical sectors.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Oil & Gas"
                description="Manage pipelines, refineries, and offshore platforms with confidence, ensuring compliance and preventing costly downtime."
                cardClass="hover:border-primary/20"
                imageUrl={industryImages.oilgas?.imageUrl}
                imageHint={industryImages.oilgas?.imageHint}
                altText={industryImages.oilgas?.description}
              />
              <FeatureCard
                title="Power Generation"
                description="Oversee the integrity of boilers, turbines, and cooling systems in nuclear, fossil fuel, and renewable energy facilities."
                 cardClass="hover:border-primary/20"
                imageUrl={industryImages.powergen?.imageUrl}
                imageHint={industryImages.powergen?.imageHint}
                altText={industryImages.powergen?.description}
              />
              <FeatureCard
                title="Chemical Processing"
                description="Ensure the safety and reliability of pressure vessels, storage tanks, and complex piping systems in chemical plants."
                 cardClass="hover:border-primary/20"
                imageUrl={industryImages.chemical?.imageUrl}
                imageHint={industryImages.chemical?.imageHint}
                altText={industryImages.chemical?.description}
              />
              <FeatureCard
                title="Manufacturing"
                description="Maintain the quality and safety of production lines, from raw material processing to final assembly, with thorough NDT."
                 cardClass="hover:border-primary/20"
                imageUrl={industryImages.manufacturing?.imageUrl}
                imageHint={industryImages.manufacturing?.imageHint}
                altText={industryImages.manufacturing?.description}
              />
              <FeatureCard
                title="Aerospace & Defense"
                description="Meet the stringent requirements of the aerospace industry by managing inspections for airframes, engines, and components."
                 cardClass="hover:border-primary/20"
                imageUrl={industryImages.aerospace?.imageUrl}
                imageHint={industryImages.aerospace?.imageHint}
                altText={industryImages.aerospace?.description}
              />
              <FeatureCard
                title="Public Infrastructure"
                description="Ensure the longevity and safety of public assets like bridges, railways, and municipal water systems through regular integrity checks."
                 cardClass="hover:border-primary/20"
                imageUrl={industryImages.infrastructure?.imageUrl}
                imageHint={industryImages.infrastructure?.imageHint}
                altText={industryImages.infrastructure?.description}
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                A Powerful, Unified Platform
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                NDT Exchange is more than a marketplace; it's a comprehensive ecosystem designed to manage the entire lifecycle of asset integrity, offering unparalleled security, efficiency, and connectivity for every stakeholder.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Building className="w-8 h-8 text-primary" />}
                title="Comprehensive Asset Hub"
                description="Centralize your asset data in one secure hub. Track components, store historical inspection reports, manage documentation like drawings and certificates, and schedule future inspections with ease. Get a complete, 360-degree view of your asset's health and history."
                cardClass="hover:border-primary/20"
                iconContainerClass="bg-primary/10"
              />
              <FeatureCard
                icon={<Search className="w-8 h-8 text-accent" />}
                title="Dynamic NDT Marketplace"
                description="Tap into a dynamic marketplace to find certified NDT professionals or post job requests to a network of vetted providers. Our intelligent matching system helps you connect with the right expertise for your specific needs, ensuring quality and reliability."
                cardClass="hover:border-accent/20"
                iconContainerClass="bg-accent/10"
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-destructive" />}
                title="Secure Workflows"
                description="Experience unparalleled data security. Our platform features role-based access, a secure document viewer that prevents unauthorized downloads and screenshots, and comprehensive audit trails for every action. Maintain compliance and protect your sensitive intellectual property with confidence."
                cardClass="hover:border-destructive/20"
                iconContainerClass="bg-destructive/10"
              />
            </div>
          </div>
        </section>
        
        <section id="techniques" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                A Wide Spectrum of NDT Techniques
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                From conventional methods to advanced technologies, our platform supports the techniques you need. Highlighted cards represent non-invasive methods, a key advantage that ensures your assets are not damaged during testing.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ndtTechniques.map(technique => {
                  const techImage = PlaceHolderImages.find(p => p.id === technique.imageId);
                  return (
                      <FeatureCard
                          key={technique.id}
                          imageUrl={techImage?.imageUrl}
                          imageHint={techImage?.imageHint}
                          altText={techImage?.description}
                          title={technique.title}
                          description={technique.description}
                          isHighlighted={technique.isHighlighted}
                      />
                  );
              })}
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
