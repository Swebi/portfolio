"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function CompanyResumeCard({
  logoUrl,
  company,
  href,
  location,
  roles,
}: CompanyResumeCardProps) {
  return (
    <li className="relative ml-10 py-4">
      <div className="absolute -left-16 top-2">
        <Avatar className="size-12 bg-muted-background dark:bg-foreground">
          <AvatarImage src={logoUrl} alt={company} className="object-cover" />
          <AvatarFallback>{company[0]}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-1">
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
          <p className="font-sans text-sm text-muted-foreground">{location}</p>
        )}

        <div className="mt-2 space-y-4">
          {roles.map((role) => (
            <RoleItem key={role.id} role={role} />
          ))}
        </div>
      </div>
    </li>
  );
}

function RoleItem({ role }: { role: WorkRole }) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="relative">
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
          className="mt-2.5 text-xs sm:text-sm whitespace-pre-wrap"
        >
          {role.description}
        </motion.div>
      )}
      </div>
    </div>
  );
}
