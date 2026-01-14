'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
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
  Eye,
  Search,
  FileText,
  Calendar,
  MessageSquare,
  Wrench,
  CheckCircle,
  Gavel,
  Star,
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
  auditor: { name: 'Alex Chen', role: 'Compliance Auditor', avatar: 'user-avatar-auditor', fallback: 'AC' },
};

const allMenuItems = [
  // Common
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['client', 'inspector', 'admin', 'auditor'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['client', 'inspector', 'admin', 'auditor'] },
  
  // Client
  { href: '/dashboard/assets', label: 'My Assets', icon: Building, roles: ['client'] },
  { href: '/dashboard/jobs', label: 'Job Marketplace', icon: Briefcase, roles: ['client'] },
  { href: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase, roles: ['client'] },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['client', 'inspector', 'admin'] },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar, roles: ['client', 'inspector'] },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, roles: ['client', 'inspector'], badge: 3 },
  { href: '/dashboard/inspections', label: 'Inspections', icon: ClipboardList, roles: ['admin', 'auditor'] },


  // Inspector
  { href: '/dashboard/find-jobs', label: 'Find Jobs', icon: Search, roles: ['inspector'] },
  { href: '/dashboard/my-bids', label: 'My Bids', icon: Gavel, roles: ['inspector'] },
  { href: '/dashboard/active-jobs', label: 'Active Jobs', icon: CheckCircle, roles: ['inspector'] },
  { href: '/dashboard/technicians', label: 'Technicians', icon: Users, roles: ['inspector'] },
  { href: '/dashboard/equipment', label: 'Equipment', icon: Wrench, roles: ['inspector'] },
  
  // Admin
  { href: '/dashboard/clients', label: 'Clients', icon: Users, roles: ['admin'] },
  { href: '/dashboard/providers', label: 'Providers', icon: ShieldCheck, roles: ['admin'] },
  { href: '/dashboard/all-jobs', label: 'All Jobs', icon: Briefcase, roles: ['admin'] },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star, roles: ['admin'] },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart, roles: ['admin'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
  
  // Auditor
  { href: '/dashboard/compliance', label: 'Compliance', icon: Eye, roles: ['auditor'] },
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
    // A bit of sorting to keep a sensible order
    const labelOrder = [
        'Dashboard', 
        // Client
        'My Assets', 'Job Marketplace', 'My Jobs',
        // Inspector
        'Find Jobs', 'My Bids', 'Active Jobs', 'Technicians', 'Equipment', 
        // Admin
        'Clients', 'Providers', 'All Jobs', 'Reviews', 'Analytics', 'Inspections', 'Users', 
        // Auditor
        'Compliance',
        // Common across multiple roles
        'Reports', 'Calendar', 'Messages',
        // Common last
        'Settings'
    ];

    return allMenuItems
        .filter(item => item.roles.includes(role))
        .sort((a, b) => {
            const aIndex = labelOrder.indexOf(a.label);
            const bIndex = labelOrder.indexOf(b.label);
            if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });

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
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
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
