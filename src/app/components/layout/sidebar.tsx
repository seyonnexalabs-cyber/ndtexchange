
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
  Gavel,
  Star,
  PlusCircle,
  LifeBuoy,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo, useEffect } from 'react';

const userDetails = {
  client: { name: 'John Doe', role: 'Project Manager', fallback: 'JD', company: 'Global Energy Corp.' },
  inspector: { name: 'Jane Smith', role: 'Level II Inspector', fallback: 'JS', company: 'TEAM, Inc.' },
  admin: { name: 'Admin User', role: 'Platform Admin', fallback: 'AU', company: 'NDT Exchange' },
  auditor: { name: 'Alex Chen', role: 'Compliance Auditor', fallback: 'AC', company: 'NDT Auditors LLC' },
  common: { name: 'User', role: 'Not specified', fallback: 'U', company: 'NDT Exchange' },
};

const allMenuItems = [
  // Common
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['client', 'inspector', 'admin', 'auditor'] },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['client', 'inspector', 'admin', 'auditor'] },
  { id: 'support', href: '/dashboard/support', label: 'Support', icon: LifeBuoy, roles: ['client', 'inspector', 'auditor'] },
  
  // Client
  { id: 'assets', href: '/dashboard/assets', label: 'My Assets', icon: Building, roles: ['client'] },
  { id: 'post-job', href: '/dashboard/my-jobs/post', label: 'Post New Job', icon: PlusCircle, roles: ['client'] },
  { id: 'my-jobs-client', href: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase, roles: ['client'] },
  
  // Common across roles but handled differently or with different data
  { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['client', 'inspector', 'admin'] },
  { id: 'calendar', href: '/dashboard/calendar', label: 'Calendar', icon: Calendar, roles: ['client', 'inspector'] },
  
  // Admin / Auditor Specific
  { id: 'inspections', href: '/dashboard/inspections', label: 'Inspections', icon: ClipboardList, roles: ['admin', 'auditor'] },

  // Inspector
  { id: 'find-jobs', href: '/dashboard/find-jobs', label: 'Find Jobs', icon: Search, roles: ['inspector'] },
  { id: 'my-bids', href: '/dashboard/my-bids', label: 'My Bids', icon: Gavel, roles: ['inspector'] },
  { id: 'my-jobs-inspector', href: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase, roles: ['inspector'] },
  { id: 'technicians', href: '/dashboard/technicians', label: 'Technicians', icon: Users, roles: ['inspector'] },
  { id: 'equipment', href: '/dashboard/equipment', label: 'Equipment', icon: Wrench, roles: ['inspector'] },
  
  // Admin
  { id: 'clients', href: '/dashboard/clients', label: 'Clients', icon: Users, roles: ['admin'] },
  { id: 'providers', href: '/dashboard/providers', label: 'Providers', icon: ShieldCheck, roles: ['admin'] },
  { id: 'all-jobs', href: '/dashboard/all-jobs', label: 'All Jobs', icon: Briefcase, roles: ['admin'] },
  { id: 'reviews', href: '/dashboard/reviews', label: 'Reviews', icon: Star, roles: ['admin'] },
  { id: 'analytics', href: '/dashboard/analytics', label: 'Analytics', icon: BarChart, roles: ['admin'] },
  { id: 'users', href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
  
  // Auditor
  { id: 'compliance', href: '/dashboard/compliance', label: 'Compliance', icon: Eye, roles: ['auditor'] },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const validRoles = ['client', 'inspector', 'admin', 'auditor'];
  const roleParam = searchParams.get('role');

  useEffect(() => {
    // If there is no role or the role is not a valid one, redirect to login
    if (!roleParam || !validRoles.includes(roleParam as string)) {
      router.replace('/login');
    }
  }, [roleParam, router]);
  
  const role = (roleParam && validRoles.includes(roleParam)) ? roleParam : null;

  const currentUser = useMemo(() => {
    if (!role) return userDetails.common;
    return userDetails[role as keyof typeof userDetails] || userDetails.common;
  }, [role]);

  const menuItems = useMemo(() => {
    // A bit of sorting to keep a sensible order
    const labelOrder = [
        'Dashboard', 
        // Client
        'My Assets', 'My Jobs', 'Post New Job',
        // Inspector
        'Find Jobs', 'My Bids', 'Technicians', 'Equipment', 
        // Admin
        'Clients', 'Providers', 'All Jobs', 'Reviews', 'Analytics', 'Inspections', 'Users', 
        // Auditor
        'Compliance',
        // Common across multiple roles
        'Reports', 'Calendar',
        // Common last items
        'Support',
        'Settings'
    ];

    if (!role) return [];

    const filteredItems = allMenuItems.filter(item => {
        return item.roles.includes(role);
    });

    return filteredItems
        .sort((a, b) => {
            const aIndex = labelOrder.indexOf(a.label);
            const bIndex = labelOrder.indexOf(b.label);
            if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });

  }, [role]);

  const activeItem = useMemo(() => {
    if (!pathname || !menuItems.length) return null;

    if (pathname === '/dashboard') {
        return menuItems.find(item => item.href === '/dashboard');
    }
    
    const matchingItems = menuItems.filter(
      (item) => item.href && item.href !== '/dashboard' && pathname.startsWith(item.href)
    );

    if (matchingItems.length === 0) {
      return menuItems.find(item => item.href === pathname);
    }
    if (matchingItems.length === 1) return matchingItems[0];
    
    // Find the item with the longest href, which is the most specific match
    return matchingItems.reduce((best, current) => 
        (current.href && best.href && current.href.length > best.href.length) ? current : best
    );
  }, [pathname, menuItems]);

  const handleLogout = () => {
    router.push('/login');
  };

  const constructUrl = (base: string) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${base}?${params.toString()}`;
  }

  if (!role) {
    return null; // Render nothing while redirecting
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href={constructUrl("/dashboard")} className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-headline font-bold text-card-foreground">
                NDT Exchange
            </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={item.id === activeItem?.id}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href ? constructUrl(item.href) : '#'}>
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
         <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarFallback>{currentUser.fallback}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <p className="font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-card-foreground/70 truncate">{currentUser.role}</p>
                <p className="text-xs text-card-foreground/70 truncate">{currentUser.company}</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto text-card-foreground hover:bg-accent hover:text-accent-foreground" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
            </Button>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
