'use client';

import React from 'react';
import {
  flip,
  offset,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';
import {
  FloatingToolbar as FloatingToolbarPrimitive,
  floatingToolbarStore,
} from '@udecode/plate-selection';

import { cn } from '@/lib/utils';

import { Toolbar } from './toolbar';

export interface FloatingToolbarProps
  extends React.ComponentPropsWithoutRef<typeof Toolbar> {
  state?: any;
}

const floatingOptions: UseVirtualFloatingOptions = {
  placement: 'top-start',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: [
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
      ],
    }),
  ],
};

const FloatingToolbar = React.forwardRef<
  React.ElementRef<typeof FloatingToolbarPrimitive>,
  FloatingToolbarProps
>(({ state, children, ...props }, ref) => {
  const {
    open,
    style,
    updated,
    contentRef,
  } = floatingToolbarStore.use.state(state);

  return (
    <FloatingToolbarPrimitive
      ref={ref}
      state={state}
      floatingOptions={floatingOptions}
      {...props}
    >
      <Toolbar
        ref={contentRef}
        className={cn(
          'absolute z-50 whitespace-nowrap border bg-popover px-1 opacity-0 shadow-md print:hidden',
          open &&
            'opacity-100'
        )}
        style={style}
      >
        {children}
      </Toolbar>
    </FloatingToolbarPrimitive>
  );
});
FloatingToolbar.displayName = 'FloatingToolbar';

export { FloatingToolbar };
