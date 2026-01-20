
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Search, Users, Waves, Scan, Magnet, Droplets, Eye, Thermometer, Ear, Globe, Radio, TestTube, Lightbulb, Building, UserCheck, FolderKanban, History, CalendarCheck, QrCode } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import * as React from 'react';
import PublicHeader from '@/app/components/layout/public-header';
import PublicFooter from '@/app/components/layout/public-footer';
import UserActivityDiagram from '@/app/components/inspection-lifecycle';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

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
                The premier digital ecosystem where asset owners ensure operational continuity and certified NDT professionals find new opportunities to grow their business.
              </p>
              <div className="mt-10">
                <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
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

        <section id="asset-management" className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-semibold text-primary">
                The Ultimate Asset Integrity Hub
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Go beyond simple NDT. Our platform provides a complete, 360-degree view of your asset's health, history, and documentation in one secure, centralized location.
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
              <FeatureCard
                icon={<Waves className="w-8 h-8 text-accent" />}
                title="Ultrasonic Testing (UT)"
                description="Using sound waves to detect internal flaws and measure thickness, including advanced Phased Array (PAUT) and TOFD methods."
                isHighlighted
              />
              <FeatureCard
                icon={<Scan className="w-8 h-8 text-accent" />}
                title="Radiographic Testing (RT)"
                description="Viewing a component's internal structure with X-rays or gamma rays to reveal hidden defects and discontinuities."
                isHighlighted
              />
               <FeatureCard
                icon={<Magnet className="w-8 h-8 text-accent" />}
                title="Magnetic Particle Testing (MT)"
                description="Detecting surface and near-surface flaws in ferromagnetic materials by creating a magnetic field."
              />
               <FeatureCard
                icon={<Droplets className="w-8 h-8 text-accent" />}
                title="Penetrant Testing (PT)"
                description="Locating surface-breaking defects in non-porous materials using a liquid penetrant and developer."
              />
               <FeatureCard
                icon={<Eye className="w-8 h-8 text-accent" />}
                title="Visual & Optical Testing (VT/RVI)"
                description="A direct or remote visual examination, using tools like videoscopes and borescopes to access hard-to-reach areas."
                isHighlighted
              />
              <FeatureCard
                icon={<Ear className="w-8 h-8 text-accent" />}
                title="Acoustic Emission (AE)"
                description="Listening for the high-frequency energy waves that materials release when they undergo stress, cracking, or corrosion."
                isHighlighted
              />
               <FeatureCard
                icon={<Radio className="w-8 h-8 text-accent" />}
                title="Acoustic Pulse Reflectometry (APR)"
                description="A non-invasive method for detecting blockages and defects in tubes by analyzing reflected sound waves."
                isHighlighted
              />
               <FeatureCard
                icon={<Radio className="w-8 h-8 text-accent" />}
                title="Electromagnetic Testing (ET)"
                description="Using principles of electromagnetism to detect flaws, such as Eddy Current, Alternating Current Field Measurement (ACFM), and Remote Field Testing (RFT)."
                isHighlighted
              />
               <FeatureCard
                icon={<TestTube className="w-8 h-8 text-accent" />}
                title="Leak Testing (LT)"
                description="Detecting and locating leaks in pressure-containing components using methods like bubble testing, pressure change, or mass spectrometry."
              />
              <FeatureCard
                icon={<Thermometer className="w-8 h-8 text-accent" />}
                title="Infrared & Thermal Testing (IR)"
                description="Detecting variations in temperature to identify material defects, electrical issues, or insulation gaps."
                isHighlighted
              />
               <FeatureCard
                icon={<Lightbulb className="w-8 h-8 text-accent" />}
                title="Other NDT Methods"
                description="Support for a variety of other methods including Guided Wave, Laser Testing (Shearography), and Neutron Radiography."
                isHighlighted
              />
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}

function FeatureCard({ icon, title, description, isHighlighted = false, iconContainerClass, cardClass }: { icon: React.ReactNode, title: string, description: string, isHighlighted?: boolean, iconContainerClass?: string, cardClass?:string }) {
  return (
    <Card className={cn(
        "text-center transition-all hover:shadow-lg hover:-translate-y-1 border",
        isHighlighted && "border-accent bg-accent/5",
        cardClass,
    )}>
      <CardHeader>
        <div className={cn("mx-auto p-4 rounded-full w-fit", iconContainerClass || 'bg-accent/10')}>
          {icon}
        </div>
        <CardTitle className="mt-4 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
