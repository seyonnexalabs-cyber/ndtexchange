'use client';

import React from 'react';
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { useEditorReadOnly } from '@udecode/plate-common';
import { Bold, Italic, Underline } from 'lucide-react';

import { MarkToolbarButton } from './mark-toolbar-button';
import { TurnIntoDropdownMenu } from './turn-into-dropdown-menu';

export function FixedToolbarButtons() {
  const isReadOnly = useEditorReadOnly();

  return (
    <div className="flex w-full items-center">
      {!isReadOnly && (
        <>
          <TurnIntoDropdownMenu />

          <MarkToolbarButton tooltip="Bold (⌘+B)" nodeType={MARK_BOLD}>
            <Bold />
          </MarkToolbarButton>
          <MarkToolbarButton tooltip="Italic (⌘+I)" nodeType={MARK_ITALIC}>
            <Italic />
          </MarkToolbarButton>
          <MarkToolbarButton
            tooltip="Underline (⌘+U)"
            nodeType={MARK_UNDERLINE}
          >
            <Underline />
          </MarkToolbarButton>
        </>
      )}
    </div>
  );
}
