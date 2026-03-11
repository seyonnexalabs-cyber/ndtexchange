
import React from 'react';
import { cn } from '@/lib/utils';

type HoneycombHeroProps = {
  children: React.ReactNode;
  className?: string;
};

const HoneycombHero = ({ children, className }: HoneycombHeroProps) => {
  return (
    <section className={cn('relative w-full overflow-hidden flex items-center justify-center py-20 md:py-28 bg-primary text-primary-foreground', className)}>
        <div className="absolute inset-0 z-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern 
                  id="honeycomb" 
                  x="0" 
                  y="0" 
                  width="56" 
                  height="97" 
                  patternUnits="userSpaceOnUse"
                  patternTransform="scale(1.5)"
                >
                  <path 
                    d="M28 0 L56 16.16 V48.5 L28 64.66 L0 48.5 V16.16 Z" 
                    fill="none" 
                    stroke="hsl(var(--primary-foreground))" 
                    strokeWidth="1"
                  />
                  <circle cx="28" cy="0" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="56" cy="16.16" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="56" cy="48.5" r="5" fill="hsl(var(--primary-foreground))" /> {/* Larger node */}
                  <circle cx="28" cy="64.66" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="0" cy="48.5" r="3" fill="hsl(var(--primary-foreground))" />
                  <circle cx="0" cy="16.16" r="6" fill="hsl(var(--primary-foreground))" /> {/* Variation in size */}
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#honeycomb)" />
            </svg>
        </div>

      <div className="relative z-10 text-center px-4 container mx-auto">
        {children}
      </div>
    </section>
  );
};

export default HoneycombHero;
