
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Search, Users, Waves, Scan, Magnet, Droplets, Eye, Thermometer, Ear, Globe, Radio } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="text-2xl font-headline font-bold text-primary">
            NDT Exchange
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-foreground hover:text-primary">
              Features
            </Link>
            <Link href="#techniques" className="text-sm font-medium text-foreground hover:text-primary">
              Techniques
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary">
              About
            </Link>
            <Link href="/manufacturers" className="text-sm font-medium text-foreground hover:text-primary">
              Manufacturers
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Select language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Español</DropdownMenuItem>
                <DropdownMenuItem>Deutsch</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

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
                The Future of Non-Destructive Testing
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/90">
                Connect with certified inspectors, manage your assets, and ensure compliance with our all-in-one NDT platform.
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
                A Powerful Platform for NDT Professionals
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                NDT Exchange provides the tools you need to streamline operations, from asset management to final reporting.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8 text-accent" />}
                title="Asset Management"
                description="Keep track of all your equipment, structures, and components with detailed histories and document storage."
              />
              <FeatureCard
                icon={<Search className="w-8 h-8 text-accent" />}
                title="NDT Job Marketplace"
                description="Find certified inspectors or post job requests. Our intelligent matching connects you with the right professionals."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-accent" />}
                title="Inspection Workflows"
                description="From scheduling to digital report generation, manage the entire inspection process with custom checklists and approval flows."
              />
              <FeatureCard
                icon={<ShieldCheck className="w-8 h-8 text-accent" />}
                title="Security & Compliance"
                description="Built with security in mind, featuring role-based access, audit logs, and compliance with industry standards."
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
                title="Ultrasonic Testing (UT/PAUT)"
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
                title="Magnetic Particle (MT)"
                description="Detecting surface and near-surface flaws in ferromagnetic materials by creating a magnetic field."
              />
               <FeatureCard
                icon={<Droplets className="w-8 h-8 text-accent" />}
                title="Penetrant Testing (PT)"
                description="Locating surface-breaking defects in non-porous materials using a liquid penetrant and developer."
              />
               <FeatureCard
                icon={<Eye className="w-8 h-8 text-accent" />}
                title="Visual Testing (VT/RVI)"
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
                icon={<Thermometer className="w-8 h-8 text-accent" />}
                title="Advanced & Other Methods"
                description="Support for Eddy Current (ET), Leak Testing (LT), and Microwave Testing."
                isHighlighted
              />
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} NDT Exchange. All Rights Reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <Link href="/terms" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Terms & Conditions</Link>
              <Link href="/privacy" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, isHighlighted = false }: { icon: React.ReactNode, title: string, description: string, isHighlighted?: boolean }) {
  return (
    <Card className={cn(
        "text-center transition-all",
        isHighlighted && "border-accent bg-accent/5 shadow-lg shadow-accent/10"
    )}>
      <CardHeader>
        <div className="mx-auto bg-accent/10 p-4 rounded-full w-fit">
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
