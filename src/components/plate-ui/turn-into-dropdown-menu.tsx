'use client';
import React from 'react';
import {
  useContent,
  useEditorState,
  useElement,
  useSetNodes,
} from '@udecode/plate-common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from '@/components/plate-ui/dropdown-menu';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';

import { Icons } from '@/components/icons';

import { ToolbarButton } from './toolbar';

const items = [
  {
    value: ELEMENT_PARAGRAPH,
    label: 'Paragraph',
    icon: Icons.paragraph,
  },
  {
    value: ELEMENT_H1,
    label: 'Heading 1',
    icon: Icons.h1,
  },
  {
    value: ELEMENT_H2,
    label: 'Heading 2',
    icon: Icons.h2,
  },
  {
    value: ELEMENT_H3,
    label: 'Heading 3',
    icon: Icons.h3,
  },
  {
    value: ELEMENT_BLOCKQUOTE,
    label: 'Quote',
    icon: Icons.blockquote,
  },
];

const defaultItem = items.find((item) => item.value === ELEMENT_PARAGRAPH)!;

export function TurnIntoDropdownMenu(
  props: React.ComponentPropsWithoutRef<typeof ToolbarButton>
) {
  const editor = useEditorState();
  const element = useElement();
  const { getBlockAbove } = useContent();
  const setNodes = useSetNodes();
  const openState = useOpenState();

  const [value, setValue] = React.useState(defaultItem.value);

  const selectedItem =
    items.find((item) => item.value === value) ?? defaultItem;
  const { icon: SelectedIcon } = selectedItem;

  React.useEffect(() => {
    const block = getBlockAbove({
      match: {
        type: items.map((item) => item.value),
      },
    });

    setValue(block ? block[0].type : ELEMENT_PARAGRAPH);
  }, [editor.selection, getBlockAbove]);

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          pressed={openState.open}
          tooltip="Turn into"
          isDropdown
          {...props}
        >
          <SelectedIcon className="h-5 w-5" />
          <Icons.chevronDown className="ml-2 h-4 w-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuLabel>Turn into</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          className="flex flex-col gap-0.5"
          value={value}
          onValueChange={(type) => {
            setNodes({ type });
          }}
        >
          {items.map(({ value: itemValue, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={itemValue}
              value={itemValue}
              className="min-w-[180px]"
            >
              <Icon className="mr-2 h-5 w-5" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
