'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';
import Link from 'next/link';


const userDetails = {
    client: { name: 'John Doe', role: 'Project Manager', avatar: 'user-avatar-client', fallback: 'JD' },
    inspector: { name: 'Jane Smith', role: 'Level II Inspector', avatar: 'user-avatar-inspector', fallback: 'JS' },
    admin: { name: 'Admin User', role: 'Platform Admin', avatar: 'user-avatar-admin', fallback: 'AU' },
};

const AppHeader = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'client';
    
    const currentUser = useMemo(() => {
        return userDetails[role as keyof typeof userDetails] || userDetails.client;
    }, [role]);

    const pathSegments = pathname.split('/').filter(Boolean);
    let title = 'Dashboard';
    if (pathSegments.length > 1) {
      title = pathSegments[pathSegments.length -1].charAt(0).toUpperCase() + pathSegments[pathSegments.length -1].slice(1);
      if (title.match(/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/i) || title.match(/^ASSET-\d{3}$/i)) {
        title = "Asset Details"
      }
    }

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

            <h1 className="text-xl font-semibold hidden md:block font-headline">{title}</h1>

            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search assets, jobs..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        />
                    </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://picsum.photos/seed/${currentUser.avatar}/100/100`} alt="User" />
                                <AvatarFallback>{currentUser.fallback}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
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
