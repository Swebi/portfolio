"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const imgCanvasCache = new WeakMap<HTMLImageElement, HTMLCanvasElement>();

function getOrCreateCanvas(img: HTMLImageElement): HTMLCanvasElement | null {
  if (imgCanvasCache.has(img)) return imgCanvasCache.get(img)!;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    imgCanvasCache.set(img, canvas);
    return canvas;
  } catch {
    return null;
  }
}

function sampleLuminance(e: MouseEvent): number {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el) return 0;

  const img = (el.tagName === "IMG" ? el : el.closest("img")) as HTMLImageElement | null;
  if (img && img.complete && img.naturalWidth > 0) {
    const canvas = getOrCreateCanvas(img);
    if (canvas) {
      try {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const rect = img.getBoundingClientRect();
          const px = Math.round((e.clientX - rect.left) * (img.naturalWidth / rect.width));
          const py = Math.round((e.clientY - rect.top) * (img.naturalHeight / rect.height));
          const data = ctx.getImageData(Math.max(0, px), Math.max(0, py), 1, 1).data;
          const [r, g, b] = [data[0], data[1], data[2]];
          return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        }
      } catch {
        imgCanvasCache.delete(img);
      }
    }
  }

  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    const m = bg.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      const a = m[3] !== undefined ? parseFloat(m[3]) : 1;
      if (a > 0.05) {
        return (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) / 255;
      }
    }
    node = node.parentElement;
  }

  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const bm = bodyBg.match(/[\d.]+/g);
  if (bm && bm.length >= 3) {
    return (0.299 * +bm[0] + 0.587 * +bm[1] + 0.114 * +bm[2]) / 255;
  }
  return 0;
}

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [light, setLight] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const dotX = useSpring(x, { stiffness: 2000, damping: 70 });
  const dotY = useSpring(y, { stiffness: 2000, damping: 70 });
  const ringX = useSpring(x, { stiffness: 200, damping: 22 });
  const ringY = useSpring(y, { stiffness: 200, damping: 22 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setLight(sampleLuminance(e) > 0.5);
    };

    const onOver = (e: MouseEvent) => {
      if (
        (e.target as Element).closest(
          "a, button, [role='button'], input, textarea, select, label"
        )
      ) {
        setHovering(true);
      }
    };

    const onOut = (e: MouseEvent) => {
      if (
        !(e.relatedTarget as Element | null)?.closest(
          "a, button, [role='button'], input, textarea, select, label"
        )
      ) {
        setHovering(false);
      }
    };

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [x, y]);

  const color = light ? "black" : "white";

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[99999]"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: color,
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: clicking ? 0.5 : 1,
        }}
        transition={{ duration: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[99998]"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          borderColor: color,
          borderWidth: 1,
          borderStyle: "solid",
        }}
        animate={{
          width: clicking ? 20 : hovering ? 48 : 32,
          height: clicking ? 20 : hovering ? 48 : 32,
          opacity: visible ? (hovering ? 0.6 : 0.3) : 0,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />
    </>
  );
}
