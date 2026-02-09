'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown, Menu, Snowflake } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/platform-features', label: 'Features' },
    {
      label: 'Resources',
      isDropdown: true,
      isActive: ['/manufacturers', '/providers'].includes(pathname) || pathname === '/',
      items: [
        { href: '/#techniques', label: 'NDT Techniques' },
        { href: '/manufacturers', label: 'Manufacturers' },
        { href: '/providers', label: 'Providers' },
      ]
    },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Pricing & Contact' },
  ];

  const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-primary">
        {children}
    </Link>
  );

  const MobileNavAccordion = ({ title, items, ...props }: { title: string, items: { href: string, label: string }[] }) => (
      <Accordion type="single" collapsible className="w-full" {...props}>
        <AccordionItem value={title.toLowerCase()} className="border-b-0">
          <AccordionTrigger className="py-2 text-lg font-medium hover:no-underline">{title}</AccordionTrigger>
          <AccordionContent className="pl-4">
              <div className="flex flex-col items-start space-y-4 mt-2">
                {items.map((link) => (
                    <MobileNavLink key={link.label} href={link.href}>{link.label}</MobileNavLink>
                ))}
              </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
  )

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
        <Link href="/" className="flex items-center gap-3">
          <Snowflake className="h-10 w-auto text-white" />
          <span className="text-xl font-headline font-bold text-primary-foreground whitespace-nowrap">NDT Exchange</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            if (link.isDropdown) {
              return (
                <DropdownMenu key={link.label}>
                    <DropdownMenuTrigger className={cn(
                        "flex items-center gap-1 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground focus:outline-none",
                        link.isActive && "font-bold text-primary-foreground"
                    )}>
                        {link.label}
                        <ChevronDown className="relative top-[1px] h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {link.items?.map((item) => (
                            <DropdownMenuItem key={item.label} asChild>
                                <Link href={item.href}>{item.label}</Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
              )
            }
            return (
              <Link
                key={link.label}
                href={link.href!}
                className={cn(
                  "text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground",
                  pathname === link.href && "font-bold text-primary-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center space-x-2">
           <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                        <Menu className="h-6 w-6"/>
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                            <Link href="/" className="flex items-center gap-3">
                              <Snowflake className="h-10 w-auto text-indigo-500" />
                              <span className="text-xl font-headline font-bold text-card-foreground whitespace-nowrap">NDT Exchange</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col items-start space-y-4">
                        {navLinks.map((link) => {
                            if (link.isDropdown) {
                                return <MobileNavAccordion key={link.label} title={link.label} items={link.items!} />
                            }
                            return (
                                <MobileNavLink key={link.label} href={link.href!}>{link.label}</MobileNavLink>
                            )
                        })}
                    </div>
                     <div className="mt-8 pt-6 border-t">
                      <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                          <Link href="/signup">Sign Up</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full mt-2" onClick={() => setMobileMenuOpen(false)}>
                          <Link href="/login">Login</Link>
                      </Button>
                   </div>
                </SheetContent>
              </Sheet>
           </div>
           <div className="hidden md:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
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
              <Button variant="ghost" asChild className="hover:bg-primary-foreground/10">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Sign Up</Link>
              </Button>
           </div>
        </div>
      </div>
    </header>
  );
}
