'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';
import Link from 'next/link';
import { useSearch } from './search-provider';


const userDetails = {
    client: { name: 'John Doe', role: 'Project Manager', avatar: 'user-avatar-client', fallback: 'JD', company: 'Global Energy Corp.', location: 'Houston, TX', address: '123 Energy Corridor' },
    inspector: { name: 'Jane Smith', role: 'Level II Inspector', avatar: 'user-avatar-inspector', fallback: 'JS', company: 'TEAM, Inc.', location: 'Sugar Land, TX', address: '1 Fluor Daniel Dr' },
    admin: { name: 'Admin User', role: 'Platform Admin', avatar: 'user-avatar-admin', fallback: 'AU', company: 'NDT Exchange', location: 'Palo Alto, CA', address: '123 Main St' },
    auditor: { name: 'Alex Chen', role: 'Compliance Auditor', avatar: 'user-avatar-auditor', fallback: 'AC', company: 'NDT Auditors LLC', location: 'Washington, D.C.', address: '456 Gov Ave' },
};

const AppHeader = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    const { searchQuery, setSearchQuery } = useSearch();
    
    const currentUser = useMemo(() => {
        return userDetails[role as keyof typeof userDetails] || userDetails.client;
    }, [role]);

    const handleLogout = () => {
        router.push('/login');
    };

    const constructUrl = (base: string) => {
        const params = new URLSearchParams(searchParams.toString());
        return `${base}?${params.toString()}`;
    }

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="md:hidden"/>

            <div className="hidden md:flex flex-col justify-center">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-lg font-semibold font-headline whitespace-nowrap">{currentUser.company}</h1>
                    <span className="text-base font-medium text-muted-foreground">({currentUser.location})</span>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{currentUser.address}</p>
            </div>

            <div className="flex flex-1 items-center gap-4 md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
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
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

export default AppHeader;
