
'use client';

import { LogoIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
}

export const Logo = ({ className, iconClassName, textClassName }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoIcon className={cn("h-10 w-auto text-[#0038b8]", iconClassName)} />
      <span 
        className={cn(
            "font-display text-[22px] font-normal tracking-tighter text-[#0038b8]", 
            textClassName
        )}
      >
        NDT EXCHANGE
      </span>
    </div>
  );
};
