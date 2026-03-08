
import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const HoneycombHero = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const heroImage = PlaceHolderImages?.find(p => p.id === 'hero-pattern-bg');
  
  return (
    <section className={cn("relative w-full overflow-hidden flex items-center justify-center py-20 md:py-24", className)}>
      {heroImage ? (
        <>
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          </div>
        </>
      ) : (
        <>
          {/* Fallback SVG Background Pattern */}
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
                    stroke="hsl(var(--primary))" 
                    strokeWidth="1"
                  />
                  <circle cx="28" cy="0" r="3" fill="hsl(var(--primary))" />
                  <circle cx="56" cy="16.16" r="3" fill="hsl(var(--primary))" />
                  <circle cx="56" cy="48.5" r="5" fill="hsl(var(--primary))" /> {/* Larger node */}
                  <circle cx="28" cy="64.66" r="3" fill="hsl(var(--primary))" />
                  <circle cx="0" cy="48.5" r="3" fill="hsl(var(--primary))" />
                  <circle cx="0" cy="16.16" r="6" fill="hsl(var(--primary))" /> {/* Variation in size */}
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#honeycomb)" />
            </svg>
          </div>
        </>
      )}

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 container mx-auto">
        {children}
      </div>
    </section>
  );
};

export default HoneycombHero;
