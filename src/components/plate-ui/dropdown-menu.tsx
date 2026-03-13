'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

export const useOpenState = () => {
  const [open, setOpen] = React.useState(false);

  const onOpenChange = React.useCallback(
    (_value: boolean) => {
      // NOTE: We are setting the state with a delay to avoid issues with the cursor.
      setTimeout(() => {
        setOpen(_value);
      }, 0);
    },
    [setOpen]
  );

  return { open, onOpenChange };
};

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const DropdownMenuPrimitiveRoot = DropdownMenuPrimitive.Root;
export const DropdownMenuPrimitiveTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuPrimitivePortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuPrimitiveSub = DropdownMenuPrimitive.Sub;
