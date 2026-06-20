"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatedSpan } from "@/components/ui/terminal";

type Line =
  | { type: "input"; text: string; id: number }
  | { type: "output"; text: string; error?: boolean; id: number };

interface TerminalProps {
  name?: string;
  github?: string;
  linkedin?: string;
  resume?: string;
  email?: string;
}

let lineId = 0;
const nextId = () => ++lineId;

export function InteractiveTerminal({
  name = "Suhayb",
  github,
  linkedin,
  resume,
  email,
}: TerminalProps) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>(() => [
    { type: "output", text: `Welcome to ${name.split(" ")[0]}'s portfolio.`, id: nextId() },
    { type: "output", text: 'Type "help" for available commands.', id: nextId() },
    { type: "output", text: "", id: nextId() },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "/" && !isTyping && !open) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
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

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function processCommand(cmd: string): { newLines: Line[]; clear?: boolean; close?: boolean } {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").toLowerCase();

    const out = (text: string, error = false): Line => ({ type: "output", text, error, id: nextId() });

    switch (command) {
      case "help":
        return {
          newLines: [
            out(""),
            out("  help               show this message"),
            out("  whoami             about me"),
            out("  ls                 list page sections"),
            out("  cd <section>       scroll to section"),
            out("  open <target>      github / linkedin / resume / email"),
            out("  blog               navigate to /blog"),
            out("  clear              clear terminal"),
            out("  exit               close terminal"),
            out(""),
          ],
        };

      case "whoami":
        return {
          newLines: [
            out(name),
            out("Engineer. Developer. Student."),
            out("Building web apps, solving problems one step at a time."),
          ],
        };

      case "ls":
        return {
          newLines: [
            out("work/  education/  skills/  projects/  volunteering/  writing/  contact/"),
          ],
        };

      case "cd": {
        const map: Record<string, string> = {
          work: "work", experience: "work",
          education: "education",
          skills: "skills",
          projects: "projects",
          volunteering: "volunteering", volunteer: "volunteering",
          contact: "contact",
          writing: "writing", blog: "writing",
          about: "about",
          home: "hero", "~": "hero",
        };
        if (!arg) { scrollToSection("hero"); return { newLines: [out("~")] }; }
        const section = map[arg];
        if (!section) return { newLines: [out(`cd: ${arg}: No such directory`, true)] };
        scrollToSection(section);
        return { newLines: [out(`→ ${arg}/`)] };
      }

      case "open": {
        const targets: Record<string, string | undefined> = {
          github,
          linkedin,
          resume,
          email: email ? `mailto:${email}` : undefined,
          mail: email ? `mailto:${email}` : undefined,
        };
        const url = targets[arg];
        if (!url) {
          const available = Object.keys(targets).filter((k) => targets[k]).join(", ");
          return { newLines: [out(`open: unknown '${arg}'. Try: ${available}`, true)] };
        }
        window.open(url, "_blank");
        return { newLines: [out(`Opening ${arg}…`)] };
      }

      case "blog":
        router.push("/blog");
        return { newLines: [out("Navigating to /blog…")] };

      case "resume":
        if (resume) { window.open(resume, "_blank"); return { newLines: [out("Opening resume…")] }; }
        return { newLines: [out("No resume link available.", true)] };

      case "clear":
        return { newLines: [], clear: true };

      case "exit": case "q": case "quit":
        return { newLines: [], close: true };

      case "":
        return { newLines: [] };

      default:
        return {
          newLines: [
            out(`command not found: ${command}`, true),
            out('Type "help" to see available commands.'),
          ],
        };
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (cmd) setHistory((h) => [cmd, ...h.slice(0, 49)]);
    setHistoryIdx(-1);

    const { newLines, clear, close } = processCommand(cmd);

    if (close) { setOpen(false); setInput(""); return; }

    const inputLine: Line = { type: "input", text: cmd, id: nextId() };

    if (clear) {
      setLines([]);
    } else {
      setLines((prev) => [...prev, inputLine, ...newLines]);
    }
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(idx);
      setInput(history[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? "" : history[idx]);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9995] flex items-center justify-center px-4"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
      <div
        className="relative border-border bg-background w-full max-w-[640px] rounded-xl border shadow-2xl overflow-hidden font-mono text-[13px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="border-border flex items-center gap-x-2 border-b p-4">
          <button
            onClick={() => setOpen(false)}
            className="h-2.5 w-2.5 rounded-full bg-red-500 hover:brightness-90 transition-[filter]"
            aria-label="Close terminal"
          />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="ml-2 flex-1 text-center text-[11px] text-muted-foreground/50 select-none">
            {name.toLowerCase().split(" ")[0]}@portfolio — bash
          </span>
        </div>

        {/* Output */}
        <div ref={outputRef} className="p-4 h-80 overflow-y-auto scrollbar-none">
          <code className="grid gap-y-0.5">
            {lines.map((line) =>
              line.type === "input" ? (
                <AnimatedSpan key={line.id} startOnView={false}>
                  <span className="flex gap-2">
                    <span className="text-green-500 select-none">❯</span>
                    <span className="text-foreground">{line.text}</span>
                  </span>
                </AnimatedSpan>
              ) : (
                <AnimatedSpan key={line.id} startOnView={false}>
                  <span
                    className={cn(
                      "leading-5",
                      line.error ? "text-red-400" : "text-muted-foreground"
                    )}
                  >
                    {line.text || " "}
                  </span>
                </AnimatedSpan>
              )
            )}
          </code>
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-border flex items-center gap-2 border-t px-4 py-3"
        >
          <span className="text-green-500 select-none">❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 caret-green-500"
            placeholder="type a command…"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </form>
      </div>
    </div>
  );
}
