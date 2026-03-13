'use client';

import React from 'react';
import { PlateContent } from '@udecode/plate-common';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const editorVariants = cva(
  cn(
    'relative overflow-x-auto whitespace-pre-wrap break-words',
    'min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    '[&_[data-slate-placeholder]]:text-muted-foreground [&_[data-slate-placeholder]]:!opacity-100',
    '[&_[data-slate-placeholder]]:top-[auto_!important]',
    '[&>div]:!min-height-[inherit] [&>div]:!height-auto'
  ),
  {
    variants: {
      variant: {
        default: 'border-input',
        ghost: 'border-none focus-visible:ring-0 focus-visible:ring-offset-0',
      },
      size: {
        default: 'text-sm',
        sm: 'text-xs',
        lg: 'text-base',
        xl: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Editor = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PlateContent> & VariantProps<typeof editorVariants>
>(({ variant, size, className, ...props }, ref) => {
  return (
    <div ref={ref} className="relative w-full">
      <PlateContent
        className={cn(editorVariants({ variant, size }), className)}
        {...props}
      />
    </div>
  );
});
Editor.displayName = 'Editor';

export { Editor };
