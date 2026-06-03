"use client";

interface GrainProps {
  opacity?: number;
}

export function Grain({ opacity = 0.06 }: GrainProps) {
  return (
    <div
      aria-hidden="true"
      className="grain-overlay"
      style={{ opacity }}
    />
  );
}
