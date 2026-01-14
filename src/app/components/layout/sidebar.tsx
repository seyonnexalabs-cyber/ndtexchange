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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/assets', label: 'Assets', icon: Building },
    { href: '/dashboard/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/inspections', label: 'Inspections', icon: ClipboardList },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
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
                <Link href={item.href}>
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
                <AvatarImage src="https://picsum.photos/seed/user-avatar/100/100" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <p className="font-semibold truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">Level III Inspector</p>
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
