import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck, Search, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
            <Link href="#pricing" className="text-sm font-medium text-foreground hover:text-primary">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium text-foreground hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/dashboard">Get Started</Link>
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
                  <Link href="/dashboard">Explore the Dashboard</Link>
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
      </main>

      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} NDT Exchange. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-center">
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
