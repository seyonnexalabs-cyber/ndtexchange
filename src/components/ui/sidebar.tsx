import * as React from 'react';

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsible?: 'icon' | 'text';
  isOpen?: boolean;
}

export const Sidebar = ({ children, collapsible, isOpen = true, className, ...props }: SidebarProps) => {
  const baseClasses = 'flex flex-col h-screen bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700';
  return (
    <aside className={[baseClasses, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </aside>
  );
};

export const SidebarHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={['px-4 py-3 border-b border-slate-200 dark:border-slate-700', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </div>
);

export const SidebarContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={['flex-1 overflow-y-auto', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </div>
);

export const SidebarMenu = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <nav className={['px-2 py-3 space-y-1', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </nav>
);

export const SidebarMenuItem = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={['rounded-md', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </div>
);

export const SidebarMenuButton = ({ children, className, asChild, isActive, tooltip, ...props }: { children: React.ReactNode; className?: string; asChild?: boolean; isActive?: boolean; tooltip?: any; [key: string]: any }) => {
  const activeClasses = isActive ? 'bg-slate-300 dark:bg-slate-800 font-semibold' : '';
  if (asChild) {
    return (
      <span className={['w-full text-left px-3 py-2 rounded-md', activeClasses, className].filter(Boolean).join(' ')} {...props}>
        {children}
      </span>
    );
  }
  return (
    <button className={['w-full text-left px-3 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800', activeClasses, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </button>
  );
};

export const SidebarFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={['px-4 py-3 border-t border-slate-200 dark:border-slate-700', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </div>
);

export const SidebarMenuBadge = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-800', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </span>
);

export const SidebarSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={['border-slate-200 dark:border-slate-700', className].filter(Boolean).join(' ')} {...props} />
);

export const useSidebar = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);
  const [state, setState] = React.useState<'expanded' | 'collapsed'>('expanded');

  React.useEffect(() => {
    setState(isOpen ? 'expanded' : 'collapsed');
  }, [isOpen]);

  return {
    isOpen,
    setOpen: setIsOpen,
    toggle: () => setIsOpen(prev => !prev),
    isMobile,
    setOpenMobile: (open: boolean) => setIsMobile(open),
    state,
  };
};
