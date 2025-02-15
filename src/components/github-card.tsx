"use client";
import { useTheme } from "next-themes";
import React from "react";
import GitHubCalendar from "react-github-calendar";

const GithubCard = () => {
  let { theme } = useTheme();
  const colorScheme = theme === "light" || theme === "dark" ? theme : undefined;

  return (
    <div className="flex justify-center items-center relative max-w-[600px] w-[90vw]  min-h-[220px] bg-card dark:bg-card hover:bg-gray-50 p-5 border rounded-xl [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] ">
      <GitHubCalendar
        username="swebi"
        colorScheme={colorScheme}
        hideColorLegend={true}
        hideTotalCount={true}
      />
    </div>
  );
};

export default GithubCard;
