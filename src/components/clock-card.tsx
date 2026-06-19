"use client";
import React, { useEffect, useRef } from "react";

interface ClockCardProps {
  timezone: string;
}

const ClockCard = ({ timezone }: ClockCardProps) => {
  const hourRef = useRef<SVGLineElement>(null);
  const minuteRef = useRef<SVGLineElement>(null);
  const secondRef = useRef<SVGLineElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  const tzAbbr = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")?.value ?? "";

  useEffect(() => {
    let raf: number;

    const toXY = (deg: number, r: number) => {
      const rad = (deg - 90) * (Math.PI / 180);
      return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
    };

    const setHand = (el: SVGLineElement | null, deg: number, r: number) => {
      if (!el) return;
      const { x, y } = toXY(deg, r);
      el.setAttribute("x2", String(x));
      el.setAttribute("y2", String(y));
    };

    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const timeFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const tick = () => {
      const now = new Date();
      const parts = fmt.formatToParts(now);
      const get = (type: string) =>
        parseInt(parts.find((p) => p.type === type)?.value ?? "0");

      const h = get("hour") % 12;
      const m = get("minute");
      const s = get("second");
      const ms = now.getMilliseconds();

      const ss = s + ms / 1000;
      const mm = m + ss / 60;
      const hh = h + mm / 60;

      setHand(hourRef.current, hh * 30, 28);
      setHand(minuteRef.current, mm * 6, 37);
      setHand(secondRef.current, ss * 6, 40);

      if (timeRef.current) {
        timeRef.current.textContent = timeFmt.format(now);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [timezone]);

  const marks = Array.from({ length: 60 }).map((_, i) => {
    const isHour = i % 5 === 0;
    const rad = (i * 6 - 90) * (Math.PI / 180);
    const r1 = isHour ? 37 : 41;
    return {
      x1: 50 + r1 * Math.cos(rad),
      y1: 50 + r1 * Math.sin(rad),
      x2: 50 + 44 * Math.cos(rad),
      y2: 50 + 44 * Math.sin(rad),
      isHour,
    };
  });

  return (
    <div className="h-52 rounded-xl border bg-[hsl(0,0%,100%)] dark:bg-card flex flex-col gap-2.5 p-3">
      <div className="flex-1 rounded-lg bg-black/[0.045] dark:bg-white/[0.03] flex items-center justify-center">
        <svg width="110" height="110" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          {marks.map((mk, i) => (
            <line
              key={i}
              x1={mk.x1} y1={mk.y1} x2={mk.x2} y2={mk.y2}
              stroke="currentColor"
              strokeWidth={mk.isHour ? 1.5 : 0.6}
              opacity={mk.isHour ? 0.5 : 0.25}
            />
          ))}
          <line ref={hourRef} x1="50" y1="50" x2="50" y2="22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line ref={minuteRef} x1="50" y1="50" x2="50" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line ref={secondRef} x1="50" y1="50" x2="50" y2="10" strokeWidth="0.8" strokeLinecap="round" style={{ stroke: "hsl(var(--border))" }} />
          <circle cx="50" cy="50" r="2" fill="currentColor" />
          <circle cx="50" cy="50" r="1" style={{ fill: "hsl(var(--border))" }} />
        </svg>
      </div>
      <div className="flex items-center gap-1.5 px-0.5">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span ref={timeRef} className="text-xs font-medium tabular-nums">
          --:-- --
        </span>
        <span className="text-xs font-medium text-muted-foreground">• {tzAbbr}</span>
      </div>
    </div>
  );
};

export default ClockCard;
