'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/#features', label: 'Features', page: '/' },
    { href: '/#techniques', label: 'Techniques', page: '/' },
    { href: '/about', label: 'About' },
    { href: '/manufacturers', label: 'Manufacturers' },
    { href: '/providers', label: 'Providers' },
  ];

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-6">
        <Link href="/" className="text-2xl font-headline font-bold text-primary">
          NDT Exchange
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            // Only render home-specific links on the homepage
            if (link.page && pathname !== link.page) {
                return null;
            }
            return (
                 <Link 
                    key={link.label}
                    href={link.href} 
                    className={cn(
                        "text-sm font-medium text-foreground hover:text-primary",
                        pathname === link.href && "font-bold"
                    )}
                >
                    {link.label}
                </Link>
            )
          })}
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
  );
}
