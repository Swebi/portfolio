"use client";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import GitHubCalendar from "react-github-calendar";

const GithubCard = ({ username }: { username: string }) => {
  const { theme } = useTheme();
  const colorScheme = theme === "light" || theme === "dark" ? theme : undefined;
  const [total, setTotal] = useState<number | null>(null);

  return (
    <div className="rounded-xl border bg-[hsl(0,0%,100%)] dark:bg-card flex flex-col gap-2.5 p-3">
      <div className="rounded-lg bg-black/[0.045] dark:bg-white/[0.03] flex items-center justify-center p-4 min-h-[180px]">
        <GitHubCalendar
          username={username}
          colorScheme={colorScheme}
          hideColorLegend
          hideTotalCount
          transformData={(data) => {
            const count = data.reduce((sum, d) => sum + d.count, 0);
            setTimeout(() => setTotal(count), 0);
            return data;
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 px-0.5">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
          <circle cx="12" cy="12" r="3" />
          <line x1="0" y1="12" x2="9" y2="12" />
          <line x1="15" y1="12" x2="24" y2="12" />
        </svg>
        <span className="text-xs font-medium text-muted-foreground">
          {total !== null ? `${total.toLocaleString()} contributions this year` : "loading…"}
        </span>
      </div>
    </div>
  );
};

export default GithubCard;
