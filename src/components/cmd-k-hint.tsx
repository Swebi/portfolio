"use client";

import { forwardRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const CmdKHint = forwardRef<HTMLButtonElement, Record<string, unknown>>(
  function CmdKHint({ ...props }, ref) {
    function open() {
      const isMac = navigator.userAgent.includes("Mac");
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          metaKey: isMac,
          ctrlKey: !isMac,
          bubbles: true,
        })
      );
    }

    return (
      <button
        ref={ref}
        onClick={open}
        aria-label="Open command palette"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-12 font-mono text-[11px] tracking-[0.3em] pr-[0.3em]"
        )}
        {...props}
      >
        ⌘K
      </button>
    );
  }
);
