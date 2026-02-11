
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const SeyonNexaLogo = () => (
    <div className="flex items-center gap-2 text-white">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-md">
            <span className="font-bold text-lg">EN</span>
        </div>
        <div>
            <div className="font-bold leading-tight">SEYON NEXA</div>
            <div className="text-xs tracking-widest">LABS</div>
        </div>
    </div>
);


export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/#solutions', label: 'Solutions' },
    { href: '/platform-workflow', label: 'How It Works' },
    { href: '/#features', label: 'Features' },
    { href: '/contact', label: 'Contact' },
  ];

  const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-primary">
        {children}
    </Link>
  );

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
        <Link href="/">
          <SeyonNexaLogo />
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground",
                  pathname === link.href && "font-bold text-primary-foreground"
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
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Menu className="h-6 w-6"/>
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                           <SeyonNexaLogo />
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col items-start space-y-4">
                        {navLinks.map((link) => (
                           <MobileNavLink key={link.label} href={link.href}>{link.label}</MobileNavLink>
                        ))}
                    </div>
                     <div className="mt-8 pt-6 border-t">
                      <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                          <Link href="/signup">Get Started</Link>
                      </Button>
                   </div>
                </SheetContent>
              </Sheet>
           </div>
           <div className="hidden md:flex items-center space-x-2">
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
           </div>
        </div>
      </div>
    </header>
  );
}
