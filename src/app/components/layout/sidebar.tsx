

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
  ShieldCheck,
  Factory,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMemo, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate } from '@/lib/utils';
import { LogoIcon } from '@/app/components/icons';
import { useUser } from '@/firebase';

type MenuItem = {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};


const userDetails = {
  client: { name: 'John Doe', role: 'Project Manager', fallback: 'JD', company: 'Global Energy Corp.' },
  inspector: { name: 'Maria Garcia', role: 'Level II Inspector', fallback: 'MG', company: 'TEAM, Inc.' },
  admin: { name: 'Admin User', role: 'Platform Admin', fallback: 'AU', company: 'NDT EXCHANGE' },
  auditor: { name: 'Alex Chen', role: 'Compliance Auditor', fallback: 'AC', company: 'NDT Auditors LLC' },
  manufacturer: { name: 'OEM User', role: 'Product Manager', fallback: 'OM', company: 'Evident Scientific' },
  common: { name: 'User', role: 'Not specified', fallback: 'U', company: 'NDT EXCHANGE' },
};

const clientMenu: MenuGroup[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Asset Management',
    items: [
      { id: 'assets', href: '/dashboard/assets', label: 'Asset Register', icon: Building },
      { id: 'compliance', href: '/dashboard/compliance', label: 'Compliance Tracker', icon: ShieldCheck },
      { id: 'calendar', href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
    ]
  },
  {
    title: 'Jobs',
    items: [
      { id: 'my-jobs-client', href: '/dashboard/my-jobs', label: 'My Jobs', icon: Briefcase },
      { id: 'post-job', href: '/dashboard/my-jobs/post', label: 'New Job', icon: PlusCircle },
    ]
  },
  {
    title: 'Marketplace',
    items: [
      { id: 'find-providers', href: '/dashboard/find-providers', label: 'Find Providers', icon: Users },
      { id: 'find-auditors', href: '/dashboard/find-auditors', label: 'Find Auditors', icon: Eye },
    ]
  },
  {
    title: 'Tools',
    items: [
      { id: 'temadesigner', href: '/dashboard/temadesigner', label: 'TEMA Designer', icon: Settings2 },
      { id: 'tasks', href: '/dashboard/tasks', label: 'My Tasks', icon: ClipboardList },
      { id: 'reports', href: '/dashboard/reports', label: 'Reports', icon: FileText },
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

const inspectorMenu: MenuGroup[] = [
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
      { id: 'temadesigner', href: '/dashboard/temadesigner', label: 'TEMA Designer', icon: Settings2 },
      { id: 'tasks', href: '/dashboard/tasks', label: 'My Tasks', icon: ClipboardList },
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

const adminMenu: MenuGroup[] = [
  {
    title: 'Platform',
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'tasks', href: '/dashboard/tasks', label: 'My Tasks', icon: ClipboardList },
      { id: 'analytics', href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
      { id: 'reviews', href: '/dashboard/reviews', label: 'Reviews', icon: Star },
      { id: 'audit-log', href: '/dashboard/audit-log', label: 'Audit Log', icon: History },
      { id: 'support', href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
    ]
  },
  {
    title: 'Management',
    items: [
      { id: 'users', href: '/dashboard/users', label: 'Users', icon: Users },
      { id: 'clients', href: '/dashboard/clients', label: 'Clients', icon: Building },
      { id: 'providers', href: '/dashboard/providers', label: 'Providers', icon: Users },
      { id: 'auditors', href: '/dashboard/auditors', label: 'Auditors', icon: Eye },
      { id: 'manufacturers', href: '/dashboard/manufacturers', label: 'Manufacturers', icon: Factory },
      { id: 'products', href: '/dashboard/products', label: 'Products', icon: Wrench },
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

const auditorMenu: MenuGroup[] = [
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
      { id: 'tasks', href: '/dashboard/tasks', label: 'My Tasks', icon: ClipboardList },
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

const manufacturerMenu: MenuGroup[] = [
    {
    title: 'Workspace',
    items: [
      { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'my-products', href: '/dashboard/my-products', label: 'My Products', icon: Wrench },
    ]
  },
  {
    title: 'Growth',
    items: [
      { id: 'market-insights', href: '/dashboard/market-insights', label: 'Market Insights', icon: BarChart },
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

const ClientExpiryDate = ({ expiry }: { expiry: string }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const date = safeParseDate(expiry);

    if (!isMounted || !date) {
        return (
            <p className="text-xs text-card-foreground/70 mt-1">
                Expires on ...
            </p>
        );
    }
    
    return (
        <p className="text-xs text-card-foreground/70 mt-1">
            Expires on {format(date, GLOBAL_DATE_FORMAT)}
        </p>
    );
};


const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { user, isUserLoading } = useUser();

  const validRoles = ['client', 'inspector', 'admin', 'auditor', 'manufacturer'];
  const roleParam = searchParams.get('role');
  const planParam = searchParams.get('plan');
  
  useEffect(() => {
    if (isUserLoading) {
        return; // Wait until the auth state is determined
    }

    // If there is no authenticated user, redirect to login page.
    if (!user) {
        router.replace('/login');
        return;
    }
    
    // If there is a user, but no valid role in the URL,
    // it's an inconsistent state. Redirect to login to re-establish the session.
    if (!roleParam || !validRoles.includes(roleParam as string)) {
      router.replace('/login');
    }
  }, [roleParam, router, user, isUserLoading]);
  
  const role = (roleParam && validRoles.includes(roleParam)) ? roleParam : null;

  const currentUser = useMemo(() => {
    if (!role) return userDetails.common;
    return userDetails[role as keyof typeof userDetails] || userDetails.common;
  }, [role]);

  const menuItems: MenuGroup[] = useMemo(() => {
    if (!role) return [];
    
    let menu: MenuGroup[];
    switch (role) {
      case 'client':
        menu = clientMenu;
        break;
      case 'inspector':
        if (planParam === 'operations') {
          // For "Operations Only" plan, filter out the "Marketplace" group
          menu = inspectorMenu.filter((group: MenuGroup) => group.title !== 'Marketplace');
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
      case 'manufacturer':
        menu = manufacturerMenu;
        break;
      default:
        menu = [];
    }
    return menu;
  }, [role, planParam]);

  const activeItem = useMemo(() => {
    if (!pathname || !menuItems.length) return null;

    const allItems: MenuItem[] = menuItems.flatMap((group: MenuGroup) => group.items);

    if (pathname === '/dashboard') {
        return allItems.find(item => item.href === '/dashboard');
    }
    
    // Exact match first
    const exactMatch = allItems.find(item => item.href === pathname);
    if(exactMatch) return exactMatch;

    const matchingItems = allItems.filter(
      (item: MenuItem) => item.href && item.href !== '/dashboard' && pathname.startsWith(item.href)
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
  
  if (!role || isUserLoading) {
    return (
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4 flex items-center group-data-[state=expanded]:justify-start group-data-[state=collapsed]:justify-center">
            <Link href={constructUrl("/dashboard")} onClick={handleLinkClick} className="flex items-center gap-3">
                <LogoIcon className="h-8 w-8 text-primary shrink-0" />
                <h1 className="text-xl font-headline font-bold text-card-foreground group-data-[state=collapsed]:hidden whitespace-nowrap">
                    NDT EXCHANGE
                </h1>
            </Link>
          </SidebarHeader>
        </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex items-center group-data-[state=expanded]:justify-start group-data-[state=collapsed]:justify-center">
        <Link href={constructUrl("/dashboard")} onClick={handleLinkClick} className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-primary shrink-0" />
            <h1 className="text-xl font-headline font-bold text-card-foreground group-data-[state=collapsed]:hidden whitespace-nowrap">
                NDT EXCHANGE
            </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((group: MenuGroup, groupIndex) => (
            <div key={group.title}>
              <h3 className="px-3 py-2 text-sm font-semibold tracking-wide text-card-foreground/90 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:text-center">
                <span className="group-data-[state=expanded]:inline">{group.title}</span>
                <span className="hidden group-data-[state=collapsed]:inline">{group.title[0]}</span>
              </h3>
              {group.items.map((item: MenuItem) => {
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.id === activeItem?.id}
                      tooltip={{ children: item.label }}
                    >
                      <Link href={item.href ? constructUrl(item.href) : '#'} onClick={handleLinkClick}>
                        <>
                            <item.icon className="text-primary" />
                            <span>{item.label}</span>
                            {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                        </>
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
        {state === 'expanded' && planDetails && role !== 'admin' && role !== 'auditor' && (
          <div>
            <p className="text-xs font-semibold text-card-foreground/70">Current Plan</p>
            <p className="font-semibold text-sm">{planDetails.name}</p>
            {planDetails.expiry !== 'N/A' && <ClientExpiryDate expiry={planDetails.expiry} />}
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
