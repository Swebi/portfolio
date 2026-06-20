"use client";

import { useState } from "react";
import { MailIcon, CheckIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve();
}

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (copied) return;
    try {
      await copyToClipboard(email);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleClick}
          aria-label="Copy email address"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "size-12 relative"
          )}
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
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? "Copied!" : "Email"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
