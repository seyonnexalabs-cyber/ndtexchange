
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function PrivacyPage() {
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
            <Link href="/manufacturers" className="text-sm font-medium text-foreground hover:text-primary">
              Manufacturers
            </Link>
             <Link href="/providers" className="text-sm font-medium text-foreground hover:text-primary">
              Providers
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

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-8">
            Privacy Policy
          </h1>
          <div className="space-y-6 text-muted-foreground">
            <p>
              Your privacy is important to us. It is NDT Exchange's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
            </p>
            
            <h2 className="text-2xl font-headline text-foreground pt-4">1. Information We Collect</h2>
            <p>
                <strong>Log data:</strong> When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.
            </p>
            <p>
                <strong>Personal Information:</strong> We may ask for personal information, such as your: Name, Email, Social media profiles, Phone/mobile number, Work address. This data is collected for the purpose of providing our service, and to communicate with you.
            </p>

            <h2 className="text-2xl font-headline text-foreground pt-4">2. Legal Bases for Processing</h2>
            <p>
                We will process your personal information lawfully, fairly and in a transparent manner. We collect and process information about you only where we have legal bases for doing so.
            </p>
            
            <h2 className="text-2xl font-headline text-foreground pt-4">3. Security of Your Personal Information</h2>
            <p>
                When we collect and process personal information, and while we retain this information, we will protect it within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
            </p>

            <h2 className="text-2xl font-headline text-foreground pt-4">4. Your Rights and Controlling Your Personal Information</h2>
            <p>
                You always retain the right to withhold personal information from us, with the understanding that your experience of our website may be affected. We will not discriminate against you for exercising any of your rights over your personal information. If you do provide us with personal information you understand that we will collect, hold, use and disclose it in accordance with this privacy policy. You retain the right to request details of any personal information we hold about you.
            </p>

          </div>
        </div>
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
