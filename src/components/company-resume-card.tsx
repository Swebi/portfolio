"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface WorkRole {
  id: string;
  roleTitle: string;
  period: string;
  description: string;
}

interface CompanyResumeCardProps {
  logoUrl: string;
  company: string;
  href?: string;
  location?: string;
  roles: WorkRole[];
}

// Layout math:
// Left column:  flex-none flex-col items-center → width = size-12 = 48px
//               avatar center at 24px from card left
//               line (w-px) centered in 48px → also at 24px ✓
// Right column: ml-4 (16px) → starts at 64px from card left
// Dot:          size-2 (8px, r=4px), center at 24px → left edge = 20px from card
//               from role item (64px): 20-64 = -44px = -left-11

export function CompanyResumeCard({
  logoUrl,
  company,
  href,
  location,
  roles,
}: CompanyResumeCardProps) {
  return (
    <Card className="flex">
      {/* Left column: avatar + vertical line centered below it */}
      <div className="flex-none flex flex-col items-center">
        <Avatar className="border size-12 mt-3 bg-muted-background dark:bg-foreground shrink-0">
          <AvatarImage src={logoUrl} alt={company} className="object-contain" />
          <AvatarFallback>{company[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* Right column */}
      <div className="flex-grow ml-4 pr-4 flex flex-col">
        {/* Company header */}
        <div className="mt-3 mb-3">
          {href ? (
            <Link
              href={href}
              className="font-bold leading-none text-sm hover:underline"
            >
              {company}
            </Link>
          ) : (
            <h3 className="font-bold leading-none text-sm">{company}</h3>
          )}
          {location && (
            <p className="font-sans text-xs text-muted-foreground mt-0.5">
              {location}
            </p>
          )}
        </div>

        {/* Role items.
            -ml-10 + pl-10 shifts the border-l left to avatar center (24px from card)
            while keeping the text content aligned with the company name (64px). */}
        <div className="-ml-10 border-l border-border pl-10 space-y-3 pb-3 pt-[5px]">
          {roles.map((role) => (
            <RoleItem key={role.id} role={role} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function RoleItem({ role }: { role: WorkRole }) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="relative">
      {/* Dot on the timeline line. z-10 ensures it renders above the left-column line.
          size-2 (8px, r=4px): center at 24px from card → left edge = 20px → -left-11 */}
      <span className="absolute z-10 -left-11 top-[5px] size-2 rounded-full bg-foreground ring-2 ring-background" />

      <div
        className={cn("group", role.description && "cursor-pointer")}
        onClick={() => role.description && setIsExpanded((p) => !p)}
      >
        <div className="flex items-center justify-between gap-x-2">
          <h4 className="inline-flex items-center font-medium leading-none text-xs sm:text-sm text-muted-foreground">
            {role.roleTitle}
            {role.description && (
              <ChevronRightIcon
                className={cn(
                  "size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100",
                  isExpanded ? "rotate-90" : "rotate-0"
                )}
              />
            )}
          </h4>
          <span className="text-xs sm:text-sm tabular-nums text-muted-foreground text-right shrink-0">
            {role.period}
          </span>
        </div>

        {role.description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isExpanded ? 1 : 0,
              height: isExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 text-xs sm:text-sm whitespace-pre-wrap"
          >
            {role.description}
          </motion.div>
        )}
      </div>
    </div>
  );
}
