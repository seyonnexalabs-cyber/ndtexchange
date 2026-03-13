'use client';

import React from 'react';

import { cn } from '@/lib/utils';

import { Toolbar } from './toolbar';

export const FixedToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <Toolbar
      ref={ref}
      className={cn(
        'sticky left-0 top-0 z-50 w-full justify-between rounded-t-lg border-b border-border bg-background/95 backdrop-blur',
        className
      )}
      {...props}
    />
  );
});
FixedToolbar.displayName = 'FixedToolbar';
