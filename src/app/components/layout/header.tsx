'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Bell, Globe, QrCode, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearch } from '@/app/components/layout/search-provider';
import { useQRScanner } from '@/app/components/layout/qr-scanner-provider';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';


const userDetails = {
    client: { name: 'John Doe', role: 'Project Manager', fallback: 'JD', company: 'Global Energy Corp.', location: 'Houston, TX', address: '123 Energy Corridor' },
    inspector: { name: 'Maria Garcia', role: 'Level II Inspector', fallback: 'MG', company: 'TEAM, Inc.', location: 'Sugar Land, TX', address: '1 Fluor Daniel Dr' },
    admin: { name: 'Admin User', role: 'Platform Admin', fallback: 'AU', company: 'NDT EXCHANGE', location: 'Platform HQ', address: '123 Digital Way' },
    auditor: { name: 'Alex Chen', role: 'Compliance Auditor', fallback: 'AC', company: 'NDT Auditors LLC', location: 'Washington, D.C.', address: '456 Gov Ave' },
    manufacturer: { name: 'OEM User', role: 'Product Manager', fallback: 'OM', company: 'Evident Scientific', location: 'Waltham, MA', address: '48 Woerd Ave' },
};

const AppHeader = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { auth, firestore } = useFirebase();
    const { user, isUserLoading } = useUser();
    const role = searchParams.get('role') || 'client';
    const { searchQuery, setSearchQuery } = useSearch();
    const { setScanOpen } = useQRScanner();
    
    const currentUser = useMemo(() => {
        return userDetails[role as keyof typeof userDetails] || userDetails.client;
    }, [role]);

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast.success('Logged Out', {
                description: 'You have been successfully logged out.',
            });
            router.push('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
            toast.error('Logout Failed', {
                description: 'An error occurred while logging out.',
            });
        }
    };

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
            <SidebarTrigger />

            <div className="hidden md:flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-lg font-semibold font-headline whitespace-nowrap">{currentUser.company}</h1>
                    <span className="text-base font-medium text-muted-foreground">({currentUser.location})</span>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{currentUser.address}</p>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2">
                <form className="flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search assets, jobs..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>

                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setScanOpen(true)}>
                    <QrCode className="h-5 w-5 text-primary" />
                    <span className="sr-only">Scan QR Code</span>
                </Button>

                <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                    <Link href={constructUrl('/dashboard/messages')}>
                        <>
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <span className="sr-only">Messages</span>
                        </>
                    </Link>
                </Button>
                
                <Separator orientation="vertical" className="h-6" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="sr-only">Select language</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem>English</DropdownMenuItem>
                    <DropdownMenuItem>Español</DropdownMenuItem>
                    <DropdownMenuItem>Deutsch</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{currentUser.fallback}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            {currentUser.name}
                            <div className="text-xs font-normal text-muted-foreground">
                                {currentUser.role}, {currentUser.company}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={constructUrl('/dashboard/settings')}>Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={constructUrl('/dashboard/support')}>Support</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

export default AppHeader;
