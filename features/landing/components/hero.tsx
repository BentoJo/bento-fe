import Link from "next/link";
import { ArrowRight, Check, Flag } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BrowserFrame } from "@/features/landing/components/browser-frame";
import { HeroSpotlight } from "@/features/landing/components/hero-spotlight";

interface HeroProps {
  isAuthenticated: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40">
      {/* background: radial glows + grid + noise */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[620px] w-[960px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,0.30),transparent)] blur-3xl" />
        <div className="absolute left-[18%] top-44 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.18),transparent)] blur-3xl" />
        <div className="absolute right-[14%] top-56 h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.14),transparent)] blur-3xl" />
        {/* dotted grid */}
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(70%_55%_at_50%_25%,black,transparent)]" />
        {/* interactive cursor-follow glow */}
        <HeroSpotlight />
      </div>

      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold leading-[0.98] tracking-tight text-white motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 sm:text-7xl lg:text-[5.25rem]">
          Manage work the way{" "}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            your team thinks.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[#94A3B8] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 motion-safe:delay-150 sm:text-lg">
          Workspaces, boards, and Kanban cards that move as fast as you do.
          Bring your team together with role-based access, rich tasks, and
          real-time collaboration — all without a single password.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 motion-safe:delay-300 sm:flex-row">
          {isAuthenticated ? (
            <Button
              asChild
              size="lg"
              className="group/cta h-12 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-7 text-base text-white shadow-lg shadow-blue-900/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-700/40"
            >
              <Link href="/home">
                Open App
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="lg"
                className="group/cta h-12 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-7 text-base text-white shadow-lg shadow-blue-900/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-700/40"
              >
                <Link href="/auth/register">
                  Get started — it&apos;s passwordless
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-white/15 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* hero preview with floating glass accents */}
      <div className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <div className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 motion-safe:duration-1000 motion-safe:delay-300">
          <div className="motion-safe:animate-[float_6s_ease-in-out_infinite]">
            <BrowserFrame
              src="/landing/preview-board.png"
              alt="ManeJo Kanban board with columns and cards"
              priority
              sizes="(min-width: 1024px) 1100px, 100vw"
            />
          </div>

          {/* floating accents (decorative) — outer handles entrance, inner floats */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* Task completed toast — top left */}
            <div className="absolute -left-3 top-10 hidden motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700 motion-safe:delay-700 sm:block lg:-left-10">
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0F172A]/90 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md motion-safe:animate-[float_5s_ease-in-out_infinite]">
                <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="size-4" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">Task completed</p>
                  <p className="text-[10px] text-[#64748B]">Design onboarding</p>
                </div>
              </div>
            </div>

            {/* avatar stack chip — top right */}
            <div className="absolute -right-2 top-24 hidden motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700 motion-safe:delay-[850ms] sm:block lg:-right-8">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0F172A]/90 px-3 py-2 shadow-xl shadow-black/40 backdrop-blur-md motion-safe:animate-[float_6.5s_ease-in-out_infinite]">
                <div className="flex -space-x-2">
                  {[
                    "from-blue-500 to-blue-600",
                    "from-violet-500 to-purple-600",
                    "from-emerald-400 to-teal-500",
                  ].map((g, i) => (
                    <span
                      key={i}
                      className={`flex size-6 items-center justify-center rounded-full border-2 border-[#0F172A] bg-gradient-to-br ${g} text-[9px] font-semibold text-white`}
                    >
                      {["A", "M", "S"][i]}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium text-[#CBD5E1]">+3 members</span>
              </div>
            </div>

            {/* Sprint pill — bottom left */}
            <div className="absolute bottom-16 -left-2 hidden motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700 motion-safe:delay-1000 sm:block lg:-left-12">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0F172A]/90 px-3.5 py-2 shadow-xl shadow-black/40 backdrop-blur-md motion-safe:animate-[float_7s_ease-in-out_infinite]">
                <Flag className="size-3.5 text-amber-400" />
                <span className="text-xs font-medium text-white">Sprint 12</span>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">
                  4 days left
                </span>
              </div>
            </div>

            {/* mini priority card — bottom right */}
            <div className="absolute -right-3 bottom-12 hidden motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700 motion-safe:delay-[1150ms] sm:block lg:-right-10">
              <div className="w-44 rounded-2xl border border-white/10 bg-[#0F172A]/90 p-3 shadow-xl shadow-black/40 backdrop-blur-md motion-safe:animate-[float_5.8s_ease-in-out_infinite]">
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
                    Frontend
                  </span>
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                    High
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-white">
                  Build drag &amp; drop
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full w-3/4 rounded-full bg-gradient-to-r from-blue-400 to-violet-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
