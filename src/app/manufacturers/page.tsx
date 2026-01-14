
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShieldCheck, Globe, Waves, Scan, Magnet, Droplets, Eye, Thermometer, Ear } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const manufacturers = [
  {
    technique: "Ultrasonic Testing (UT, PAUT, TOFD)",
    icon: <Waves className="w-6 h-6 text-accent" />,
    companies: [
      "Evident Scientific (formerly Olympus)",
      "Eddyfi Technologies",
      "Sonatest",
      "Zetec",
      "Baker Hughes (formerly GE Inspection Technologies)",
    ]
  },
  {
    technique: "Visual Testing (VT / RVI)",
    icon: <Eye className="w-6 h-6 text-accent" />,
    companies: [
      "Evident Scientific (formerly Olympus)",
      "Baker Hughes (Everest VIT)",
      "viZaar",
    ]
  },
  {
    technique: "Radiographic Testing (RT)",
    icon: <Scan className="w-6 h-6 text-accent" />,
    companies: [
      "Fujifilm",
      "Yxlon (Comet Group)",
      "Carestream NDT",
      "VJ Technologies",
    ]
  },
  {
    technique: "Eddy Current Testing (ET)",
    icon: <Thermometer className="w-6 h-6 text-accent" />,
    companies: [
      "Evident Scientific (formerly Olympus)",
      "Zetec",
      "Foerster Instruments",
    ]
  },
  {
    technique: "Magnetic Particle (MT) & Penetrant Testing (PT)",
    icon: <Magnet className="w-6 h-6 text-accent" />,
    companies: [
      "Magnaflux",
      "Parker Research Corp",
    ]
  },
    {
    technique: "Acoustic Emission (AE)",
    icon: <Ear className="w-6 h-6 text-accent" />,
    companies: [
      "MISTRAS Group",
      "Vallen Systeme",
    ]
  },
  {
    technique: "Acoustic Pulse Reflectometry (APR)",
    icon: <Waves className="w-6 h-6 text-accent" />,
    companies: [
      "Talcyon",
    ]
  }
];

export default function ManufacturersPage() {
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
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary">
              About
            </Link>
            <Link href="/manufacturers" className="text-sm font-medium text-foreground hover:text-primary font-bold">
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
        <section className="py-20 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-headline font-bold">
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
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="p-6">
                            <Accordion type="multiple" defaultValue={[manufacturers[0].technique]} className="w-full">
                                {manufacturers.map((m) => (
                                    <AccordionItem value={m.technique} key={m.technique}>
                                        <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                                            <div className="flex items-center gap-4">
                                                {m.icon}
                                                {m.technique}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pl-4">
                                            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                                                {m.companies.map(company => <li key={company}>{company}</li>)}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
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
