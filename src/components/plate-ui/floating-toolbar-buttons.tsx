'use client';

import React from 'react';
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';

import { MarkToolbarButton } from './mark-toolbar-button';
import { Bold, Italic, Underline } from 'lucide-react';

export function FloatingToolbarButtons() {
  return (
    <>
      <MarkToolbarButton nodeType={MARK_BOLD} tooltip="Bold (⌘+B)">
        <Bold />
      </MarkToolbarButton>
      <MarkToolbarButton nodeType={MARK_ITALIC} tooltip="Italic (⌘+I)">
        <Italic />
      </MarkToolbarButton>
      <MarkToolbarButton
        nodeType={MARK_UNDERLINE}
        tooltip="Underline (⌘+U)"
      >
        <Underline />
      </MarkToolbarButton>
    </>
  );
}
