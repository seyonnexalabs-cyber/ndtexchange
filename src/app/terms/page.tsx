
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function TermsPage() {
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
            Terms and Conditions
          </h1>
          <div className="space-y-6 text-muted-foreground">
            <p>
              Welcome to NDT Exchange. These terms and conditions outline the rules and regulations for the use of NDT Exchange's Website, located at ndtexchange.com.
            </p>
            <p>
              By accessing this website we assume you accept these terms and conditions. Do not continue to use NDT Exchange if you do not agree to take all of the terms and conditions stated on this page.
            </p>
            
            <h2 className="text-2xl font-headline text-foreground pt-4">1. Definitions</h2>
            <p>
              The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.
            </p>

            <h2 className="text-2xl font-headline text-foreground pt-4">2. License to Use Website</h2>
            <p>
              Unless otherwise stated, NDT Exchange and/or its licensors own the intellectual property rights for all material on NDT Exchange. All intellectual property rights are reserved. You may access this from NDT Exchange for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
            <p>You must not:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Republish material from NDT Exchange</li>
              <li>Sell, rent or sub-license material from NDT Exchange</li>
              <li>Reproduce, duplicate or copy material from NDT Exchange</li>
              <li>Redistribute content from NDT Exchange</li>
            </ul>

            <h2 className="text-2xl font-headline text-foreground pt-4">3. User Content</h2>
            <p>
              In these Terms and Conditions, “Your User Content” shall mean any audio, video, text, images or other material you choose to display on this Website. By displaying Your User Content, you grant NDT Exchange a non-exclusive, worldwide, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
            </p>
            
            <h2 className="text-2xl font-headline text-foreground pt-4">4. Limitation of Liability</h2>
            <p>
              In no event shall NDT Exchange, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. NDT Exchange, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
            </p>
            
            <h2 className="text-2xl font-headline text-foreground pt-4">5. Governing Law & Jurisdiction</h2>
            <p>
              These Terms will be governed by and interpreted in accordance with the laws of the State/Country, and you submit to the non-exclusive jurisdiction of the state and federal courts located in State/Country for the resolution of any disputes.
            </p>
          </div>
        </div>
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
