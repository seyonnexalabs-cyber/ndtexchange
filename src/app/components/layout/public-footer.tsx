import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PublicFooter() {
    const platformLinks = [
        { href: '/#features', label: 'Features' },
        { href: '/#techniques', label: 'Techniques' },
        { href: '/login', label: 'Login / Dashboard' },
        { href: '/contact', label: 'Pricing & Contact' },
    ];

    const resourcesLinks = [
        { href: '/manufacturers', label: 'OEM Directory' },
        { href: '/providers', label: 'Provider Directory' },
    ];

    const companyLinks = [
        { href: '/about', label: 'About Us' },
        { href: '/terms', label: 'Terms & Conditions' },
        { href: '/privacy', label: 'Privacy Policy' },
    ];

    return (
        <footer className="bg-primary text-primary-foreground border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold">
                            <ShieldCheck className="w-8 h-8" />
                            NDT Exchange
                        </Link>
                        <p className="mt-4 text-sm text-primary-foreground/80">
                            The premier marketplace for Non-Destructive Testing services.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:col-span-3 gap-8">
                        <div>
                            <h3 className="font-semibold tracking-wider uppercase">Platform</h3>
                            <ul className="mt-4 space-y-2">
                                {platformLinks.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold tracking-wider uppercase">Resources</h3>
                            <ul className="mt-4 space-y-2">
                                {resourcesLinks.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold tracking-wider uppercase">Company</h3>
                            <ul className="mt-4 space-y-2">
                                {companyLinks.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-primary-foreground/20 pt-8">
                    <p className="text-sm text-center text-primary-foreground/80">
                        &copy; {new Date().getFullYear()} NDT Exchange. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
