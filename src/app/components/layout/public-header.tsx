'use client';

import { Button } from '@/components/ui/button';
import { Menu, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { Logo } from '@/app/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/ecosystem', label: 'Ecosystem' },
    { href: '/events', label: 'Events' },
    { href: '/platform-workflow', label: 'Workflow' },
    { 
      label: 'Designers', 
      items: [
        { href: '/temadesigner', label: 'Tube Designer' },
        { href: '/tank-designer', label: 'Tank Designer' },
        { href: '/ndt-setup-builder', label: 'NDT Setup Builder' },
      ]
    },
    { href: '/request-demo', label: 'Request a Demo' },
    { href: '/help', label: 'Help' },
  ];

  const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-primary py-2 w-full">
        {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
              link.items ? (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger className={cn(
                      "flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary focus:outline-none",
                      link.items.some(item => pathname === item.href) && "font-semibold text-primary"
                  )}>
                    {link.label}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {link.items.map(item => (
                       <DropdownMenuItem key={item.label} asChild>
                         <Link href={item.href} className={cn(pathname === item.href && "font-semibold")}>
                           {item.label}
                         </Link>
                       </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.label}
                  href={link.href!}
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-primary",
                    pathname === link.href && "font-semibold text-primary"
                  )}
                >
                  {link.label}
                </Link>
              )
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
                           <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                                <Logo iconClassName="h-8" textClassName="text-xl" />
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col items-start space-y-1">
                        <Accordion type="single" collapsible className="w-full">
                        {navLinks.map((link) => (
                            link.items ? (
                            <AccordionItem value={link.label} key={link.label} className="border-b-0 w-full">
                                <AccordionTrigger className="text-lg font-medium text-foreground hover:text-primary hover:no-underline py-2">
                                {link.label}
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 pl-4">
                                <div className="flex flex-col items-start space-y-3">
                                    {link.items.map(item => (
                                    <MobileNavLink key={item.label} href={item.href}>{item.label}</MobileNavLink>
                                    ))}
                                </div>
                                </AccordionContent>
                            </AccordionItem>
                            ) : (
                            <MobileNavLink key={link.label} href={link.href!}>{link.label}</MobileNavLink>
                            )
                        ))}
                        </Accordion>
                    </div>
                     <div className="mt-8 pt-6 border-t space-y-2">
                        <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
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
              <Button>
                <Link href="/login">Dashboard</Link>
              </Button>
              <Button>
                <Link href="/signup">Get Started</Link>
              </Button>
           </div>
        </div>
      </div>
    </header>
  );
}
