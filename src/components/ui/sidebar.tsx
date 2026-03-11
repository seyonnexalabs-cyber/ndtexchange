
"use client"

import * as React from "react"
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarContextProps {
  isCollapsed: boolean
  isMobile: boolean
  setOpenMobile: (isOpen: boolean) => void
  state: 'expanded' | 'collapsed'
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: "icon" | "button"
  defaultCollapsed?: boolean
  children: React.ReactNode
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsible = "button", defaultCollapsed = false, children, ...props }, ref) => {
    const isClient = typeof window !== "undefined";
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const [isMobile, setIsMobile] = React.useState(false);
    const [openMobile, setOpenMobile] = React.useState(false);

    React.useEffect(() => {
      if (!isClient) return;
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, [isClient]);

    const state = isCollapsed ? 'collapsed' : 'expanded';

    const contextValue = { isCollapsed, isMobile, setOpenMobile, state };

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            className={cn(
              "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
              !isMobile && isCollapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]",
              isMobile && "w-[var(--sidebar-width-mobile)]",
              isMobile && !openMobile && "hidden",
              "group"
            )}
            data-state={state}
            {...props}
          >
            {children}
          </div>
          {isMobile && openMobile && (
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpenMobile(false)} />
          )}
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-14 items-center border-b border-sidebar-border", className)} {...props} />
  )
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)} {...props} />
  )
)
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props} />
  )
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"


interface SidebarMenuButtonProps extends React.ComponentProps<typeof Button> {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: React.ComponentProps<typeof Tooltip>;
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, tooltip, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    const button = (
      <Button
        ref={ref}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "h-10 justify-start gap-3 rounded-md text-base",
            isCollapsed && "size-10 shrink-0 justify-center p-0",
            className
        )}
        {...props}
      />
    )
    if(isCollapsed && tooltip) {
        return (
            <Tooltip {...tooltip}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right">{tooltip.children}</TooltipContent>
            </Tooltip>
        )
    }

    return button
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuBadge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => {
        const { isCollapsed } = useSidebar()
        return (
            <span 
                ref={ref}
                className={cn(
                    "ml-auto text-xs font-semibold",
                    isCollapsed && "absolute right-0.5 top-0.5 size-2 rounded-full border-2 border-sidebar-background bg-primary p-0",
                    className
                )}
                {...props}
            />
        )
    }
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr ref={ref} className={cn("my-2 border-border/20", className)} {...props} />
  )
)
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-auto", className)}
      {...props}
    />
  )
)
SidebarFooter.displayName = "SidebarFooter"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
  SidebarFooter,
}
