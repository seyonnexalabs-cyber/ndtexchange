
import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type HoneycombHeroProps = {
  children: React.ReactNode;
  className?: string;
  imageId?: string;
  imageIds?: string[];
};

const defaultHeroImageIds = [
  'tech-ut',
  'tech-rt',
  'tech-mt',
  'tech-pt',
  'tech-vt',
  'tech-ae',
  'event-01',
  'event-02',
  'event-03',
];

const pickHeroImage = (imageId?: string, imageIds?: string[]) => {
  if (!PlaceHolderImages) return undefined;

  const available = PlaceHolderImages.filter((img) => !!img.imageUrl);

  if (imageId) {
    const found = available.find((img) => img.id === imageId);
    if (found) return found;
  }

  const candidates = (imageIds?.length
    ? available.filter((img) => imageIds.includes(img.id))
    : available.filter((img) => defaultHeroImageIds.includes(img.id))) || [];

  if (candidates.length > 0) {
    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index];
  }

  return available.find((img) => img.id === 'hero-pattern-bg') || available[0];
};

const HoneycombHero = ({ children, className, imageId, imageIds }: HoneycombHeroProps) => {
  const heroImage = pickHeroImage(imageId, imageIds);

  return (
    <section className={cn('relative w-full overflow-hidden flex items-center justify-center py-20 md:py-28', className)}>
      {heroImage ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description || 'Hero background image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 90vw"
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Crect width='10' height='6' fill='%23f3f4f6'/%3E%3C/svg%3E"
            data-ai-hint={heroImage.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-slate-900/30 to-black/40 backdrop-blur-sm" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="honeycomb" x="0" y="0" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                <path d="M28 0 L56 16.16 V48.5 L28 64.66 L0 48.5 V16.16 Z" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
                <circle cx="28" cy="0" r="3" fill="hsl(var(--primary))" />
                <circle cx="56" cy="16.16" r="3" fill="hsl(var(--primary))" />
                <circle cx="56" cy="48.5" r="5" fill="hsl(var(--primary))" />
                <circle cx="28" cy="64.66" r="3" fill="hsl(var(--primary))" />
                <circle cx="0" cy="48.5" r="3" fill="hsl(var(--primary))" />
                <circle cx="0" cy="16.16" r="6" fill="hsl(var(--primary))" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#honeycomb)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-slate-900/20" />
        </div>
      )}

      <div className="relative z-10 text-center px-4 container mx-auto">
        {children}
      </div>
    </section>
  );
};

export default HoneycombHero;
