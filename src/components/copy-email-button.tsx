"use client";

import { forwardRef, useState } from "react";
import { MailIcon, CheckIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const CopyEmailButton = forwardRef<HTMLButtonElement, { email: string }>(
  function CopyEmailButton({ email, ...props }, ref) {
    const [copied, setCopied] = useState(false);

    async function handleClick() {
      if (copied) return;
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-label="Copy email address"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-12 relative"
        )}
        {...props}
      >
        <MailIcon
          className={cn(
            "size-4 absolute transition-all duration-200",
            copied ? "opacity-0 scale-50" : "opacity-100 scale-100"
          )}
        />
        <CheckIcon
          className={cn(
            "size-4 absolute transition-all duration-200 text-green-500",
            copied ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}
        />
      </button>
    );
  }
);
