'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#asset-management', label: 'Asset Management' },
    { href: '/#techniques', label: 'Techniques' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const resourcesLinks = [
      { href: '/manufacturers', label: 'Manufacturers' },
      { href: '/providers', label: 'Providers' },
  ]
  const isResourcesActive = resourcesLinks.some(link => pathname === link.href);

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-6">
        <Link href="/" className="text-2xl font-headline font-bold text-primary">
          NDT Exchange
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium text-foreground hover:text-primary",
                (pathname === link.href || (pathname === '/' && link.href.startsWith('/#'))) && "font-bold"
              )}
            >
              {link.label}
            </Link>
          ))}
           <DropdownMenu>
                <DropdownMenuTrigger className={cn(
                    "flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary focus:outline-none",
                    isResourcesActive && "font-bold"
                )}>
                    Resources
                    <ChevronDown className="relative top-[1px] h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {resourcesLinks.map((link) => (
                        <DropdownMenuItem key={link.label} asChild>
                            <Link href={link.href}>{link.label}</Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
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
            <Link href="/contact">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
