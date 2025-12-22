"use client";

import * as RadixPopover from "@radix-ui/react-popover";
import { ReactNode } from "react";

type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const Popover = ({
  trigger,
  children,
  open,
  onOpenChange,
}: PopoverProps) => {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>

      <RadixPopover.Portal>
        <RadixPopover.Content
          side="bottom"
          align="center"
          sideOffset={12}
          className="
            z-50
            w-full
            max-w-[420px]
            rounded-2xl
            bg-white
            p-5
            shadow-[0_10px_25px_rgba(0,0,0,0.12)]
            outline-none
            animate-popover
          "
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
