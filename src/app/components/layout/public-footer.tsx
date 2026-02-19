
import Link from 'next/link';
import { LogoIcon } from '@/app/components/icons';

export default function PublicFooter() {
    const platformLinks = [
        { href: '/login', label: 'Dashboard' },
        { href: '/platform-workflow', label: 'How It Works' },
        { href: '/request-demo', label: 'Request a Demo' },
        { href: '/help', label: 'Help' },
    ];

    const managementLinks = [
        { href: '/asset-management', label: 'Client Assets' },
        { href: '/provider-tools', label: 'Provider Tools' },
    ];

    const resourcesLinks = [
        { href: '/#techniques', label: 'NDT Techniques' },
        { href: '/manufacturers', label: 'Manufacturers' },
        { href: '/providers', label: 'Providers' },
        { href: '/auditors', label: 'Auditors' },
        { href: '/ndt-4-0', label: 'NDT 4.0' },
    ];

    const companyLinks = [
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact Us' },
        { href: '/terms', label: 'Terms & Conditions' },
        { href: '/privacy', label: 'Privacy Policy' },
    ];

    return (
        <footer className="bg-primary text-primary-foreground border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-3">
                            <LogoIcon className="h-10 w-auto" />
                            <span className="text-xl font-headline font-bold text-primary-foreground whitespace-nowrap">NDT EXCHANGE</span>
                        </Link>
                        <p className="mt-4 text-sm text-primary-foreground/80">
                            The premier marketplace for Non-Destructive Testing services.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:col-span-4 gap-8">
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
                            <h3 className="font-semibold tracking-wider uppercase">Management</h3>
                            <ul className="mt-4 space-y-2">
                                {managementLinks.map(link => (
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
                        &copy; {new Date().getFullYear()} NDT EXCHANGE. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
