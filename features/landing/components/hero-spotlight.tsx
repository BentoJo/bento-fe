"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive cursor-following glow for the hero background.
 * A persistent soft radial light that tracks the pointer across the hero.
 * Listens on window so it never blocks clicks; rAF-throttled.
 */
export function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(520px circle at var(--mx, 50%) var(--my, 32%), rgba(59,130,246,0.32), rgba(139,92,246,0.16) 40%, transparent 70%)",
      }}
    />
  );
}
