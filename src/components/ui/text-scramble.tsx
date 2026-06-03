"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export function TextScramble({
  text,
  className,
  delay = 0,
  speed = 55,
}: TextScrambleProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay, speed]);

  return (
    <span className={cn(className)}>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse opacity-70">|</span>
      )}
    </span>
  );
}
