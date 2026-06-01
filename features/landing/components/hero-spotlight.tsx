"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive cursor-following glow for the hero background.
 * Listens on window (never blocks clicks), reveals a soft radial glow that
 * tracks the pointer while it's over the hero, and fades out when it leaves.
 * Desktop/pointer only.
 */
export function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.style.setProperty("--op", inside ? "1" : "0");
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
      className="pointer-events-none absolute inset-0 -z-10 hidden transition-opacity duration-300 md:block"
      style={{
        opacity: "var(--op, 0)",
        background:
          "radial-gradient(560px circle at var(--mx, 50%) var(--my, 30%), rgba(59,130,246,0.18), rgba(139,92,246,0.10) 38%, transparent 66%)",
      }}
    />
  );
}
