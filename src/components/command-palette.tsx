"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  FileTextIcon,
  GithubIcon,
  LinkedinIcon,
  BookOpenIcon,
  MailIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  FolderIcon,
  HeartIcon,
  SearchIcon,
  InstagramIcon,
  Twitter,
  Youtube,
  TerminalIcon,
} from "lucide-react";

type ActionFn = (router: ReturnType<typeof useRouter>) => void;

interface CommandItem {
  id: string;
  label: string;
  group: string;
  keywords: string[];
  action: ActionFn;
  Icon: React.ElementType;
}

interface CommandPaletteProps {
  github?: string;
  linkedin?: string;
  resume?: string;
  email?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: "smooth" });
}

export function CommandPalette({
  github,
  linkedin,
  resume,
  email,
  twitter,
  instagram,
  youtube,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    { id: "home", label: "Home", group: "Navigate", keywords: ["home", "main"], action: (r) => r.push("/"), Icon: HomeIcon },
    { id: "blog", label: "Blog", group: "Navigate", keywords: ["blog", "posts", "writing", "articles"], action: (r) => r.push("/blog"), Icon: BookOpenIcon },
    { id: "terminal", label: "Terminal", group: "Navigate", keywords: ["terminal", "bash", "cli", "command", "shell"], action: () => setTimeout(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true })), 50), Icon: TerminalIcon },
    { id: "work", label: "Work Experience", group: "Sections", keywords: ["work", "job", "experience", "career"], action: () => scrollTo("work"), Icon: BriefcaseIcon },
    { id: "education", label: "Education", group: "Sections", keywords: ["education", "school", "university", "degree"], action: () => scrollTo("education"), Icon: GraduationCapIcon },
    { id: "projects", label: "Projects", group: "Sections", keywords: ["projects", "portfolio", "apps", "builds"], action: () => scrollTo("projects"), Icon: FolderIcon },
    { id: "skills", label: "Skills", group: "Sections", keywords: ["skills", "tech", "stack", "technologies"], action: () => scrollTo("skills"), Icon: SearchIcon },
    { id: "contact", label: "Contact", group: "Sections", keywords: ["contact", "reach", "touch", "message"], action: () => scrollTo("contact"), Icon: MailIcon },
    { id: "volunteering", label: "Volunteering", group: "Sections", keywords: ["volunteer", "community", "organizations"], action: () => scrollTo("volunteering"), Icon: HeartIcon },
    ...(resume ? [{ id: "resume", label: "Resume", group: "Links", keywords: ["resume", "cv", "download"], action: () => window.open(resume, "_blank"), Icon: FileTextIcon }] : []),
    ...(github ? [{ id: "github", label: "GitHub", group: "Links", keywords: ["github", "code", "repos", "source"], action: () => window.open(github, "_blank"), Icon: GithubIcon }] : []),
    ...(linkedin ? [{ id: "linkedin", label: "LinkedIn", group: "Links", keywords: ["linkedin", "connect", "professional"], action: () => window.open(linkedin, "_blank"), Icon: LinkedinIcon }] : []),
    ...(twitter ? [{ id: "twitter", label: "Twitter / X", group: "Links", keywords: ["twitter", "x", "tweets"], action: () => window.open(twitter, "_blank"), Icon: Twitter }] : []),
    ...(instagram ? [{ id: "instagram", label: "Instagram", group: "Links", keywords: ["instagram", "photos", "ig"], action: () => window.open(instagram, "_blank"), Icon: InstagramIcon }] : []),
    ...(youtube ? [{ id: "youtube", label: "YouTube", group: "Links", keywords: ["youtube", "videos", "yt"], action: () => window.open(youtube, "_blank"), Icon: Youtube }] : []),
    ...(email ? [{ id: "email", label: "Email", group: "Links", keywords: ["email", "mail", "message"], action: () => window.open(`mailto:${email}`, "_blank"), Icon: MailIcon }] : []),
  ];

  const q = query.trim().toLowerCase();
  const filtered = q
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.includes(q))
      )
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  useEffect(() => { setSelectedIdx(0); }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        if (!open) { setQuery(""); setSelectedIdx(0); }
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keep selected item scrolled into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  function runItem(item: CommandItem) {
    item.action(router);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIdx]) runItem(filtered[selectedIdx]);
    }
  }

  if (!open) return null;

  let cursor = 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[18vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono select-none">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="px-4 pt-3 pb-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider select-none">
                {group}
              </p>
              {items.map((item) => {
                const idx = cursor++;
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={item.id}
                    data-idx={idx}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                      isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                    onClick={() => runItem(item)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                  >
                    <item.Icon className="size-4 text-muted-foreground shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
