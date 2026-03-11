
'use client';

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { LogoIcon } from '@/components/ui/icons';


export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/ecosystem', label: 'Ecosystem' },
    { href: '/events', label: 'Events' },
    { href: '/platform-workflow', label: 'Workflow' },
    { href: '/temadesigner', label: 'Tube Designer' },
    { href: '/request-demo', label: 'Request a Demo' },
    { href: '/help', label: 'Help' },
  ];

  const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-primary">
        {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoIcon className="h-10 w-auto text-primary" />
          <span className="text-xl font-bold tracking-tighter text-foreground font-headline">
            NDT EXCHANGE
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground hover:text-primary",
                  pathname === link.href && "font-semibold text-primary"
                )}
              >
                {link.label}
              </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-2">
           <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-foreground">
                        <Menu className="h-6 w-6"/>
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                           <Link href="/" className="flex items-center gap-3">
                                <LogoIcon className="h-8 w-auto text-primary" />
                                <span className="text-lg font-bold text-foreground tracking-tighter font-headline">NDT EXCHANGE</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col items-start space-y-4">
                        {navLinks.map((link) => (
                           <MobileNavLink key={link.label} href={link.href}>{link.label}</MobileNavLink>
                        ))}
                    </div>
                     <div className="mt-8 pt-6 border-t space-y-2">
                        <Button asChild className="w-full" variant="outline" onClick={() => setMobileMenuOpen(false)}>
                            <Link href="/login">Dashboard</Link>
                        </Button>
                        <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                            <Link href="/signup">Get Started</Link>
                        </Button>
                   </div>
                </SheetContent>
              </Sheet>
           </div>
           <div className="hidden md:flex items-center space-x-2">
              <Button
                asChild
                variant="outline"
              >
                <Link href="/login">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
           </div>
        </div>
      </div>
    </header>
  );
}
