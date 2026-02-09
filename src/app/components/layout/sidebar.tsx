

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
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building,
  Briefcase,
  ClipboardList,
  Settings,
  LogOut,
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
  CreditCard,
  History,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT } from '@/lib/utils';
import { LogoIcon } from '@/app/components/icons';


const userDetails = {
  client: { name: 'John Doe', role: 'Project Manager', fallback: 'JD', company: 'Global Energy Corp.' },
  inspector: { name: 'Maria Garcia', role: 'Level II Inspector', fallback: 'MG', company: 'TEAM, Inc.' },
  admin: { name: 'Admin User', role: 'Platform Admin', fallback: 'AU', company: 'NDT Exchange' },
  auditor: { name: 'Alex Chen', role: 'Compliance Auditor', fallback: 'AC', company: 'NDT Auditors LLC' },
  common: { name: 'User', role: 'Not specified', fallback: 'U', company: 'NDT Exchange' },
};

const clientMenu = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'assets', href: '/dashboard/assets', label: 'My Assets', icon: Building },
      { id: 'my-jobs-client', href: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase },
    ]
  },
  {
    title: 'Marketplace',
    items: [
      { id: 'find-providers', href: '/dashboard/find-providers', label: 'Find Providers', icon: Users },
      { id: 'find-auditors', href: '/dashboard/find-auditors', label: 'Find Auditors', icon: Eye },
      { id: 'post-job', href: '/dashboard/my-jobs/post', label: 'Post New Job', icon: PlusCircle },
    ]
  },
  {
    title: 'Tools',
    items: [
      { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText },
      { id: 'calendar', href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
      { id: 'messages', href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { id: 'payments', href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
    ]
  },
  {
    title: 'Account',
    items: [
      { id: 'support', href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
      { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  }
];

const inspectorMenu = [
    {
    title: 'Workspace',
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'my-jobs-inspector', href: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase },
      { id: 'post-job', href: '/dashboard/my-jobs/post', label: 'Create Job', icon: PlusCircle },
    ]
  },
  {
    title: 'Marketplace',
    items: [
        { id: 'find-jobs', href: '/dashboard/find-jobs', label: 'Find Jobs', icon: Search },
        { id: 'my-bids', href: '/dashboard/my-bids', label: 'My Bids', icon: Gavel },
    ]
  },
  {
    title: 'Company',
    items: [
      { id: 'technicians', href: '/dashboard/technicians', label: 'Technicians', icon: Users },
      { id: 'equipment', href: '/dashboard/equipment', label: 'Equipment', icon: Wrench },
    ]
  },
  {
    title: 'Tools',
    items: [
      { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText },
      { id: 'calendar', href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
      { id: 'messages', href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { id: 'payments', href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
    ]
  },
   {
    title: 'Account',
    items: [
      { id: 'support', href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
      { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  }
];

const adminMenu = [
  {
    title: 'Platform',
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
      { id: 'reviews', href: '/dashboard/reviews', label: 'Reviews', icon: Star },
      { id: 'audit-log', href: '/dashboard/audit-log', label: 'Audit Log', icon: History },
    ]
  },
  {
    title: 'Management',
    items: [
      { id: 'users', href: '/dashboard/users', label: 'Users', icon: Users },
      { id: 'clients', href: '/dashboard/clients', label: 'Clients', icon: Building },
      { id: 'providers', href: '/dashboard/providers', label: 'Providers', icon: Users },
      { id: 'auditors', href: '/dashboard/auditors', label: 'Auditors', icon: Eye },
      { id: 'all-jobs', href: '/dashboard/all-jobs', label: 'All Jobs', icon: Briefcase },
      { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText },
      { id: 'subscriptions', href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
      { id: 'payments', href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
    ]
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  }
];

const auditorMenu = [
   {
    title: 'Workspace',
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText },
    ]
  },
  {
    title: 'Tools',
    items: [
      { id: 'messages', href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { id: 'payments', href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
    ]
  },
  {
    title: 'Account',
    items: [
      { id: 'support', href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
      { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ]
  }
];


const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, setOpenMobile, state } = useSidebar();

  const validRoles = ['client', 'inspector', 'admin', 'auditor'];
  const roleParam = searchParams.get('role');
  const planParam = searchParams.get('plan');

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
    if (!role) return [];
    
    let menu;
    switch (role) {
      case 'client':
        menu = clientMenu;
        break;
      case 'inspector':
        if (planParam === 'operations') {
          // For "Operations Only" plan, filter out the "Marketplace" group
          menu = inspectorMenu.filter(group => group.title !== 'Marketplace');
        } else {
          // For "Marketplace" plan (or default), show all items
          menu = inspectorMenu;
        }
        break;
      case 'admin':
        menu = adminMenu;
        break;
      case 'auditor':
        menu = auditorMenu;
        break;
      default:
        menu = [];
    }
    return menu;
  }, [role, planParam]);

  const activeItem = useMemo(() => {
    if (!pathname || !menuItems.length) return null;

    const allItems = menuItems.flatMap(group => group.items);

    if (pathname === '/dashboard') {
        return allItems.find(item => item.href === '/dashboard');
    }
    
    // Exact match first
    const exactMatch = allItems.find(item => item.href === pathname);
    if(exactMatch) return exactMatch;

    const matchingItems = allItems.filter(
      (item) => item.href && item.href !== '/dashboard' && pathname.startsWith(item.href)
    );

    if (matchingItems.length === 0) {
      return allItems.find(item => item.href === pathname);
    }
    if (matchingItems.length === 1) return matchingItems[0];
    
    // Find the item with the longest href, which is the most specific match
    return matchingItems.reduce((best, current) => 
        (current.href && best.href && current.href.length > best.href.length) ? current : best
    );
  }, [pathname, menuItems]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const constructUrl = (base: string) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${base}?${params.toString()}`;
  }

  const getPlanDetails = () => {
    if (!role) return null;
    switch (role) {
      case 'client':
        return { name: 'Client Pro', expiry: '2025-01-15' };
      case 'inspector':
        return { name: planParam === 'operations' ? 'Provider Operations' : 'Provider Marketplace', expiry: '2025-01-15' };
      case 'auditor':
        return { name: 'Auditor Access', expiry: 'N/A' };
      case 'admin':
        return { name: 'Platform Admin', expiry: 'N/A' };
      default:
        return null;
    }
  };

  const planDetails = getPlanDetails();

  if (!role) {
    return null; // Render nothing while redirecting
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex items-center group-data-[state=expanded]:justify-start group-data-[state=collapsed]:justify-center">
        <Link href={constructUrl("/dashboard")} onClick={handleLinkClick} className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-indigo-500 shrink-0" />
            <h1 className="text-xl font-headline font-bold text-card-foreground group-data-[state=collapsed]:hidden whitespace-nowrap">
                NDT Exchange
            </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((group, groupIndex) => (
            <div key={group.title}>
              <h3 className="px-3 py-2 text-sm font-semibold tracking-wide text-card-foreground/90 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:text-center">
                <span className="group-data-[state=expanded]:inline">{group.title}</span>
                <span className="hidden group-data-[state=collapsed]:inline">{group.title[0]}</span>
              </h3>
              {group.items.map((item: any) => {
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.id === activeItem?.id}
                      tooltip={{ children: item.label }}
                    >
                      <Link href={item.href ? constructUrl(item.href) : '#'} onClick={handleLinkClick}>
                        <item.icon className="text-primary" />
                        <span>{item.label}</span>
                        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {groupIndex < menuItems.length -1 && <SidebarSeparator className="my-1 group-data-[state=collapsed]:hidden" />}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border flex flex-col gap-3">
        {state === 'expanded' && planDetails && (
          <div>
            <p className="text-xs font-semibold text-card-foreground/70">Current Plan</p>
            <p className="font-semibold text-sm">{planDetails.name}</p>
            {planDetails.expiry !== 'N/A' && (
              <p className="text-xs text-card-foreground/70 mt-1">
                Expires on {format(new Date(planDetails.expiry), GLOBAL_DATE_FORMAT)}
              </p>
            )}
             <Link href={constructUrl('/dashboard/billing')} onClick={handleLinkClick} className="text-xs text-primary hover:underline font-medium mt-2 block">
                Manage Subscription
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
