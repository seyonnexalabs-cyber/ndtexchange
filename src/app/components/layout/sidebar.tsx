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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';
import { useJobPost } from '@/app/dashboard/my-jobs/job-post-provider';

const userDetails = {
  client: { name: 'John Doe', role: 'Project Manager', avatar: 'user-avatar-client', fallback: 'JD', company: 'Global Energy Corp.' },
  inspector: { name: 'Jane Smith', role: 'Level II Inspector', avatar: 'user-avatar-inspector', fallback: 'JS', company: 'TEAM, Inc.' },
  admin: { name: 'Admin User', role: 'Platform Admin', avatar: 'user-avatar-admin', fallback: 'AU', company: 'NDT Exchange' },
  auditor: { name: 'Alex Chen', role: 'Compliance Auditor', avatar: 'user-avatar-auditor', fallback: 'AC', company: 'NDT Auditors LLC' },
};

const allMenuItems = [
  // Common
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['client', 'inspector', 'admin', 'auditor'] },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['client', 'inspector', 'admin', 'auditor'] },
  
  // Client
  { id: 'assets', href: '/dashboard/assets', label: 'My Assets', icon: Building, roles: ['client'] },
  { id: 'post-job', action: 'post-job', label: 'Post New Job', icon: PlusCircle, roles: ['client'] },
  { id: 'my-jobs-client', href: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase, roles: ['client'] },
  
  // Common across roles but handled differently or with different data
  { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['client', 'inspector', 'admin'] },
  { id: 'calendar', href: '/dashboard/calendar', label: 'Calendar', icon: Calendar, roles: ['client', 'inspector'] },
  { id: 'messages', href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, roles: ['client', 'inspector'], badge: 3 },
  
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
  const role = searchParams.get('role') || 'client';
  const { setJobPostOpen } = useJobPost();

  const currentUser = useMemo(() => {
    return userDetails[role as keyof typeof userDetails] || userDetails.client;
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

  }, [role, pathname]);

  const handleLogout = () => {
    router.push('/login');
  };

  const constructUrl = (base: string) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${base}?${params.toString()}`;
  }

  const handleAction = (action?: string) => {
    if (action === 'post-job') {
      // This will only work if the currently rendered page is using the context.
      // We will ensure MyJobsPage has the provider.
      router.push(constructUrl('/dashboard/my-jobs'));
      setTimeout(() => setJobPostOpen(true), 100);
    }
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
          {menuItems.map((item) => {
            if (item.action) {
              return (
                 <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleAction(item.action)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={item.href && (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard'))}
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
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
         <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarFallback>{currentUser.fallback}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
                <p className="font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser.role}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser.company}</p>
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
