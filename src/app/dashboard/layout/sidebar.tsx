

'use client';

import {
  LayoutDashboard, Building, Briefcase, ClipboardList, Settings, Users, Eye, Search,
  FileText, Calendar, MessageSquare, Wrench, Gavel, Star, PlusCircle, LifeBuoy,
  CreditCard, History, DollarSign, ShieldCheck, Factory, Settings2, Database, BarChart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useMemo, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { GLOBAL_DATE_FORMAT, safeParseDate, cn } from '@/lib/utils';
import { LogoIcon } from '@/components/ui/icons';
import { useUser } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Logo } from '@/app/components/logo';

type MenuItem = {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
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
      { id: 'temadesigner', href: '/dashboard/temadesigner', label: 'Tube Designer', icon: Settings2 },
      { id: 'tankdesigner', href: '/dashboard/tank-designer', label: 'Tank Designer', icon: Database },
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
      { id: 'report-templates', href: '/dashboard/reports/templates', label: 'Report Templates', icon: FileText },
    ]
  },
  {
    title: 'Tools',
    items: [
      { id: 'temadesigner', href: '/dashboard/temadesigner', label: 'Tube Designer', icon: Settings2 },
      { id: 'tankdesigner', href: '/dashboard/tank-designer', label: 'Tank Designer', icon: Database },
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
            <p className="text-xs text-muted-foreground mt-1">
                Expires on ...
            </p>
        );
    }
    
    return (
        <p className="text-xs text-muted-foreground mt-1">
            Expires on {format(date, GLOBAL_DATE_FORMAT)}
        </p>
    );
};


const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();

  const validRoles = ['client', 'inspector', 'admin', 'auditor', 'manufacturer'];
  const roleParam = searchParams.get('role');
  const planParam = searchParams.get('plan');
  
  useEffect(() => {
    if (isUserLoading) return;
    if (!user && pathname !== '/login') {
        router.replace('/login');
        return;
    }
    if (user && (!roleParam || !validRoles.includes(roleParam as string))) {
      router.replace('/login');
    }
  }, [roleParam, router, user, isUserLoading, pathname]);
  
  const role = (roleParam && validRoles.includes(roleParam)) ? roleParam : null;

  const menuItems = useMemo(() => {
    if (!role) return [];
    let menu: MenuGroup[] = [];
    switch (role) {
      case 'client': menu = clientMenu; break;
      case 'inspector':
        menu = planParam === 'operations'
          ? inspectorMenu.filter(group => group.title !== 'Marketplace')
          : inspectorMenu;
        break;
      case 'admin': menu = adminMenu; break;
      case 'auditor': menu = auditorMenu; break;
      case 'manufacturer': menu = manufacturerMenu; break;
      default: menu = [];
    }
    return menu;
  }, [role, planParam]);

  const activeItem = useMemo(() => {
    if (!pathname || !menuItems.length) return null;
    const allItems = menuItems.flatMap(group => group.items);
    if (pathname === '/dashboard') {
        return allItems.find(item => item.id === 'dashboard');
    }
    const matchingItems = allItems.filter(
      item => item.href && item.href !== '/dashboard' && pathname.startsWith(item.href)
    );
    if (matchingItems.length === 0) return null;
    return matchingItems.reduce((best, current) => 
        (current.href.length > best.href.length) ? current : best
    );
  }, [pathname, menuItems]);
  
  const constructUrl = (base: string) => {
    const params = new URLSearchParams(searchParams.toString());
    return `${base}?${params.toString()}`;
  }

  const getPlanDetails = () => {
    if (!role) return null;
    switch (role) {
      case 'client': return { name: 'Client Pro', expiry: '2025-01-15' };
      case 'inspector': return { name: planParam === 'operations' ? 'Provider Operations' : 'Provider Marketplace', expiry: '2025-01-15' };
      default: return null;
    }
  };

  const planDetails = getPlanDetails();
  
  if (!role || isUserLoading) {
    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold font-headline">
                    <LogoIcon className="h-6 w-6 text-primary" />
                    <span className="text-foreground">NDT EXCHANGE</span>
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href={constructUrl("/dashboard")} className="flex items-center gap-3">
          <Logo iconClassName="h-8 w-auto text-primary" textClassName="text-xl text-foreground" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {menuItems.map((group) => (
                <div key={group.title} className="mb-2">
                    <h3 className="px-2 py-2 text-xs font-semibold tracking-wide text-muted-foreground">{group.title}</h3>
                    {group.items.map((item) => {
                        const isActive = activeItem?.id === item.id;
                        return (
                            <Link
                                key={item.id}
                                href={constructUrl(item.href)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
                                    isActive && "bg-primary text-primary-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "opacity-75" : "text-primary")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        {planDetails && (
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>{planDetails.name}</CardTitle>
              {planDetails.expiry !== 'N/A' && (
                <CardDescription>
                  Expires on <ClientExpiryDate expiry={planDetails.expiry} />
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full" asChild>
                  <Link href={constructUrl('/dashboard/subscriptions')}>Manage</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppSidebar;
