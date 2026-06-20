"use client";

import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { ShadowIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

export const ModeToggle = forwardRef<HTMLButtonElement, Record<string, unknown>>(
  function ModeToggle({ ...props }, ref) {
    const { theme, setTheme } = useTheme();

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      const x = e.clientX;
      const y = e.clientY;

      if (!("startViewTransition" in document)) {
        setTheme(nextTheme);
        return;
      }

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = (document as unknown as { startViewTransition: (cb: () => void) => { ready: Promise<void> } }).startViewTransition(() => {
        setTheme(nextTheme);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      });
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        type="button"
        size="icon"
        className="size-12"
        onClick={handleToggle}
        {...props}
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
        <ShadowIcon className="hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
      </Button>
    );
  }
);
