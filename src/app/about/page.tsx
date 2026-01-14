import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Building, UserCheck, CheckCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="text-2xl font-headline font-bold text-primary">
            NDT Exchange
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-sm font-medium text-foreground hover:text-primary">
              Features
            </Link>
            <Link href="/#techniques" className="text-sm font-medium text-foreground hover:text-primary">
              Techniques
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary font-bold">
              About
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
        <section className="py-20 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Connecting the World of Asset Integrity
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-foreground/80">
                NDT Exchange is a purpose-built platform designed to bridge the gap between asset owners who require critical inspection services and the certified NDT providers who deliver them.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-headline font-semibold text-primary">
                    Our Mission
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    To create a transparent, efficient, and reliable digital ecosystem for the Non-Destructive Testing industry, ensuring safety and compliance for critical infrastructure worldwide.
                </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2">
                <Card className="p-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-accent/10 p-4 rounded-full w-fit">
                                <Building className="w-8 h-8 text-accent" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For Asset Owners (Clients)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Managing asset integrity is complex and crucial. NDT Exchange simplifies the process of procuring inspection services, giving you confidence and control.</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span>Easily post job requests to a marketplace of vetted NDT professionals.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span>Review bids, compare provider qualifications, and award jobs with confidence.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span>Centralize all your asset data, inspection reports, and compliance documentation in one secure place.</span></li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="p-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                           <div className="bg-accent/10 p-4 rounded-full w-fit">
                                <UserCheck className="w-8 h-8 text-accent" />
                            </div>
                            <CardTitle className="text-2xl font-headline">For NDT Providers (Inspectors)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Focus on what you do best: providing expert inspection services. Our platform helps you find work, manage your team, and streamline your operations.</p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span>Access a marketplace of inspection jobs that match your certifications and location.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span>Manage your technicians, equipment, and certifications efficiently.</span></li>
                            <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" /><span>Utilize digital reporting tools to deliver high-quality, consistent results to your clients.</span></li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

         <section className="bg-card py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold text-primary">
              Ready to Join?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Whether you're managing critical assets or providing expert inspection services, NDT Exchange is your partner in ensuring safety and quality.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Get Started Now</Link>
              </Button>
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
