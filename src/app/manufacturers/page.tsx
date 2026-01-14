
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Globe, Waves, Scan, Magnet, Eye, Thermometer, Ear, Link as LinkIcon, Building, TestTube, Lightbulb, Radio } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const manufacturers = [
  {
    technique: "Ultrasonic Testing (UT, PAUT, TOFD)",
    icon: <Waves className="w-8 h-8" />,
    color: "blue",
    companies: [
      { name: "Evident Scientific (Olympus)", url: "https://www.evidentscientific.com" },
      { name: "Eddyfi Technologies", url: "https://www.eddyfitechnologies.com" },
      { name: "Sonatest", url: "https://www.sonatest.com" },
      { name: "Zetec", url: "https://www.zetec.com" },
      { name: "Baker Hughes (Waygate Technologies)", url: "https://www.bakerhughes.com/waygate-technologies" },
      { name: "Proceq (Screening Eagle)", url: "https://www.screeningeagle.com" },
      { name: "TPAC", url: "https://www.tpac-ndt.com/" },
      { name: "Imagilent", url: "https://www.imagilent.com/" },
      { name: "DolphiTech", url: "https://www.dolphitech.com/" },
      { name: "Karl Deutsch", url: "https://www.karldeutsch.de/en/" },
    ]
  },
  {
    technique: "Radiographic Testing (RT, DR, CT)",
    icon: <Scan className="w-8 h-8" />,
    color: "purple",
    companies: [
      { name: "Fujifilm", url: "https://www.fujifilm.com/us/en/business/ndt" },
      { name: "Yxlon (Comet Group)", url: "https://www.yxlon.com" },
      { name: "Carestream NDT", url: "https://www.carestream.com/ndt" },
      { name: "VJ Technologies", url: "https://www.vjt.com" },
      { name: "Nikon Metrology", url: "https://www.nikonmetrology.com/en-gb/products/x-ray-ct-inspection" },
      { name: "Teledyne ICM", url: "https://www.teledyneicm.com/" },
      { name: "Rigaku", url: "https://www.rigaku.com/en/products/ct" },
      { name: "Vidisco", url: "https://www.vidisco.com/" },
    ]
  },
  {
    technique: "Electromagnetic Testing (ET, ACFM, RFT)",
    icon: <Radio className="w-8 h-8" />,
    color: "amber",
    companies: [
      { name: "Evident Scientific (Olympus)", url: "https://www.evidentscientific.com" },
      { name: "Zetec", url: "https://www.zetec.com" },
      { name: "Foerster Instruments", url: "https://www.foerstergroup.com" },
      { name: "UniWest", url: "https://uniwest.com/" },
      { name: "Eddyfi Technologies", url: "https://www.eddyfitechnologies.com" },
      { name: "ibg NDT Systems", url: "https://www.ibg-ndt.com/" },
    ]
  },
  {
    technique: "Magnetic Particle & Penetrant (MT/PT)",
    icon: <Magnet className="w-8 h-8" />,
    color: "red",
    companies: [
      { name: "Magnaflux", url: "https://www.magnaflux.com" },
      { name: "Parker Research Corp", url: "https://www.parkerndt.com" },
      { name: "Chemetall", url: "https://www.chemetall.com/en/products/non-destructive-testing.php" },
      { name: "Karl Deutsch", url: "https://www.karldeutsch.de/en/" },
      { name: "Sherwin Inc.", url: "https://sherwininc.com/" },
    ]
  },
  {
    technique: "Visual & Optical Testing (VT / RVI)",
    icon: <Eye className="w-8 h-8" />,
    color: "green",
    companies: [
      { name: "Evident Scientific (Olympus)", url: "https://www.evidentscientific.com" },
      { name: "Baker Hughes (Everest VIT)", url: "https://www.bakerhughes.com/waygate-technologies/remote-visual-inspection" },
      { name: "viZaar", url: "https://www.vizaar.com" },
      { name: "IT Concepts", url: "https://www.itc-ndt.com/" },
      { name: "Karl Storz", url: "https://www.karlstorz.com/industrial.htm" },
      { name: "Mitcorp", url: "https://www.mitcorp.com.tw/" },
    ]
  },
  {
    technique: "Acoustic Emission (AE)",
    icon: <Ear className="w-8 h-8" />,
    color: "sky",
    companies: [
      { name: "MISTRAS Group", url: "https://www.mistrasgroup.com" },
      { name: "Vallen Systeme", url: "https://www.vallen.de/en/" },
      { name: "Physical Acoustics Corp (PAC)", url: "https://www.pacndt.com/" },
      { name: "Score Atlanta Inc.", url: "https://www.score-atl.com/" },
    ]
  },
  {
    technique: "Acoustic Pulse Reflectometry (APR)",
    icon: <Waves className="w-8 h-8" />,
    color: "teal",
    companies: [
      { name: "Talcyon", url: "https://www.talcyon.com" },
    ]
  },
  {
    technique: "Leak Testing (LT)",
    icon: <TestTube className="w-8 h-8" />,
    color: "lime",
    companies: [
      { name: "Inficon", url: "https://www.inficon.com" },
      { name: "Pfeiffer Vacuum", url: "https://www.pfeiffer-vacuum.com" },
      { name: "LACO Technologies", url: "https://www.lacotech.com" },
      { name: "ATEQ", url: "https://www.ateq-leak-testing.com/" },
    ]
  },
  {
    technique: "Infrared & Thermal Testing (IR)",
    icon: <Thermometer className="w-8 h-8" />,
    color: "orange",
    companies: [
        { name: "Teledyne FLIR", url: "https://www.flir.com" },
        { name: "Fluke Corporation", url: "https://www.fluke.com" },
        { name: "Testo", url: "https://www.testo.com" },
    ]
  },
  {
    technique: "Other NDT Methods",
    icon: <Lightbulb className="w-8 h-8" />,
    color: "gray",
    companies: [
        { name: "GUL (Guided Ultrasonics Ltd.)", url: "https://www.guided-ultrasonics.com/", description: "Guided Wave UT" },
        { name: "Dantec Dynamics", url: "https://www.dantecdynamics.com/", description: "Laser Shearography" },
        { name: "Phoenix|x-ray (Waygate)", url: "https://www.bakerhughes.com/waygate-technologies/x-ray-and-ct-solutions/phoenix-x-ray", description: "Neutron Radiography" },
    ]
  }
];

const colorClasses = {
    blue: {
        card: "bg-blue-500/5",
        iconContainer: "bg-blue-500/10",
        icon: "text-blue-500"
    },
    purple: {
        card: "bg-purple-500/5",
        iconContainer: "bg-purple-500/10",
        icon: "text-purple-500"
    },
    amber: {
        card: "bg-amber-500/5",
        iconContainer: "bg-amber-500/10",
        icon: "text-amber-500"
    },
    red: {
        card: "bg-red-500/5",
        iconContainer: "bg-red-500/10",
        icon: "text-red-500"
    },
    green: {
        card: "bg-green-500/5",
        iconContainer: "bg-green-500/10",
        icon: "text-green-500"
    },
    sky: {
        card: "bg-sky-500/5",
        iconContainer: "bg-sky-500/10",
        icon: "text-sky-500"
    },
    teal: {
        card: "bg-teal-500/5",
        iconContainer: "bg-teal-500/10",
        icon: "text-teal-500"
    },
    lime: {
        card: "bg-lime-500/5",
        iconContainer: "bg-lime-500/10",
        icon: "text-lime-500"
    },
    orange: {
        card: "bg-orange-500/5",
        iconContainer: "bg-orange-500/10",
        icon: "text-orange-500"
    },
    gray: {
        card: "bg-gray-500/5",
        iconContainer: "bg-gray-500/10",
        icon: "text-gray-500"
    }
}

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
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {manufacturers.map((m) => {
                        const colors = colorClasses[m.color as keyof typeof colorClasses] || colorClasses.gray;
                        return (
                        <Card key={m.technique} className={cn("flex flex-col transition-shadow hover:shadow-lg", colors.card)}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                     <div className={cn("p-4 rounded-full w-fit", colors.iconContainer)}>
                                        {React.cloneElement(m.icon, { className: cn(m.icon.props.className, colors.icon)})}
                                    </div>
                                    <CardTitle className="text-xl font-headline">{m.technique}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3">
                                    {m.companies.map(company => (
                                        <li key={company.name} className="flex items-center">
                                            <Link href={company.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary group">
                                               <Building className="w-4 h-4 mr-3 shrink-0" />
                                               <span className="flex-grow">{company.name} {company.description && <span className="text-xs text-muted-foreground/70">({company.description})</span>}</span>
                                               <LinkIcon className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        )
                    })}
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

    