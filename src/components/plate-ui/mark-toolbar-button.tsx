'use client';
import React from 'react';
import { useMarkToolbarButton, useMarkToolbarButtonState } from '@udecode/plate-common';

import { ToolbarButton } from './toolbar';

export const MarkToolbarButton = React.forwardRef<
  React.ElementRef<typeof ToolbarButton>,
  Omit<React.ComponentPropsWithoutRef<typeof ToolbarButton>, 'value' | 'onClick'> & {
    nodeType: string;
    clear?: string | string[];
  }
>(({ clear, nodeType, ...rest }, ref) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props } = useMarkToolbarButton(state);

  return <ToolbarButton ref={ref} {...props} {...rest} />;
});
MarkToolbarButton.displayName = 'MarkToolbarButton';
