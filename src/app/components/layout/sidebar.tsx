'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building,
  Briefcase,
  ClipboardList,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
  BarChart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';

const userDetails = {
  client: { name: 'John Doe', role: 'Project Manager', avatar: 'user-avatar-client', fallback: 'JD' },
  inspector: { name: 'Jane Smith', role: 'Level II Inspector', avatar: 'user-avatar-inspector', fallback: 'JS' },
  admin: { name: 'Admin User', role: 'Platform Admin', avatar: 'user-avatar-admin', fallback: 'AU' },
};

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['client', 'inspector', 'admin'] },
  { href: '/dashboard/assets', label: 'Assets', icon: Building, roles: ['client', 'inspector'] },
  { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase, roles: ['client', 'inspector', 'admin'] },
  { href: '/dashboard/inspections', label: 'Inspections', icon: ClipboardList, roles: ['client', 'inspector', 'admin'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart, roles: ['admin'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['client', 'inspector', 'admin'] },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';

  const currentUser = useMemo(() => {
    return userDetails[role as keyof typeof userDetails] || userDetails.client;
  }, [role]);

  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => item.roles.includes(role));
  }, [role]);

  const handleLogout = () => {
    router.push('/login');
  };

  const constructUrl = (base: string) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${base}?${params.toString()}`;
  }


  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href={constructUrl("/dashboard")} className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-sidebar-primary" />
            <h1 className="text-xl font-headline font-bold text-sidebar-foreground">
                NDT Exchange
            </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')}
                tooltip={{ children: item.label }}
              >
                <Link href={constructUrl(item.href)}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
         <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src={`https://picsum.photos/seed/${currentUser.avatar}/100/100`} alt="User" />
                <AvatarFallback>{currentUser.fallback}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <p className="font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser.role}</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
            </Button>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
