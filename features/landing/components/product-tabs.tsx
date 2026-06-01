"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Kanban, LayoutDashboard, Users, CalendarRange } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Reveal } from "@/features/landing/components/reveal";

interface Tab {
  id: string;
  label: string;
  icon: typeof Kanban;
  title: string;
  blurb: string;
  src: string;
  alt: string;
}

const tabs: Tab[] = [
  {
    id: "boards",
    label: "Boards",
    icon: Kanban,
    title: "Kanban boards that move with you",
    blurb: "Drag cards across columns and watch work flow from idea to done.",
    src: "/landing/preview-board.png",
    alt: "ManeJo Kanban board with columns and cards",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    title: "The whole workspace at a glance",
    blurb: "Boards, activity, and progress surfaced the moment you log in.",
    src: "/landing/preview-dashboard.png",
    alt: "ManeJo workspace dashboard overview",
  },
  {
    id: "members",
    label: "Members",
    icon: Users,
    title: "The right people, the right access",
    blurb: "Invite by email, build teams, and assign roles in seconds.",
    src: "/landing/preview-users.png",
    alt: "ManeJo team members and roles management",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarRange,
    title: "Never miss a due date again",
    blurb: "Every card with a deadline lands on a shared team calendar.",
    src: "/landing/preview-calendar.png",
    alt: "ManeJo calendar with task due dates",
  },
];

const AUTO_ADVANCE_MS = 5000;

export function ProductTabs() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const select = useCallback((index: number) => {
    setActive(index);
    setPaused(true);
  }, []);

  useEffect(() => {
    if (paused) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % tabs.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  // keep auto-advance paused once the user has interacted; resume only when
  // the pointer leaves the whole module
  const wrapRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            One platform, every view
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See ManeJo from{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              every angle
            </span>
          </h2>
        </Reveal>

        <Reveal
          delay={100}
          className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2"
        >
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = i === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => select(i)}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "border-transparent bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-900/40"
                    : "border-white/10 bg-white/[0.04] text-[#94A3B8] hover:border-white/20 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </Reveal>

        <Reveal delay={150} className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-white">
            {tabs[active].title}
          </h3>
          <p className="mt-1 text-sm text-[#94A3B8]">{tabs[active].blurb}</p>
        </Reveal>

        <div
          ref={wrapRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative mx-auto mt-10 max-w-5xl"
        >
          {/* glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(55%_55%_at_50%_0%,rgba(59,130,246,0.32),transparent_70%)] blur-2xl"
          />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl shadow-blue-950/50 ring-1 ring-white/5">
            <div className="flex items-center gap-2 border-b border-white/5 bg-[#0B1220]/80 px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <div className="ml-4 hidden h-6 flex-1 items-center rounded-md border border-white/5 bg-white/5 px-3 text-[11px] text-[#64748B] sm:flex">
                app.manejo.io/{tabs[active].id}
              </div>
            </div>

            {/* crossfade stack */}
            <div className="relative aspect-[16/10] w-full">
              {tabs.map((tab, i) => (
                <Image
                  key={tab.id}
                  src={tab.src}
                  alt={tab.alt}
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  priority={i === 0}
                  className={cn(
                    "object-cover object-top transition-all duration-700 ease-out motion-reduce:transition-none",
                    i === active
                      ? "opacity-100 translate-x-0"
                      : "pointer-events-none opacity-0 translate-x-4"
                  )}
                />
              ))}
            </div>
          </div>

          {/* progress dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                type="button"
                aria-label={`Show ${tab.label}`}
                onClick={() => select(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active
                    ? "w-8 bg-gradient-to-r from-blue-400 to-violet-400"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
