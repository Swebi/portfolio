"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "volunteering", label: "Volunteering" },
  { id: "contact", label: "Contact" },
];

export function SectionLabel() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      const trigger = window.scrollY + window.innerHeight * 0.35;
      let current = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= trigger) current = id;
      }
      setActive(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = SECTIONS.find((s) => s.id === active);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 pointer-events-none select-none">
      <div className="w-px h-10 bg-border rounded-full" />
      <AnimatePresence mode="wait">
        {current && (
          <motion.span
            key={current.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.45, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-[10px] font-medium tracking-widest uppercase text-foreground"
            style={{ writingMode: "vertical-rl" }}
          >
            {current.label}
          </motion.span>
        )}
      </AnimatePresence>
      <div className="w-px h-10 bg-border rounded-full" />
    </div>
  );
}
