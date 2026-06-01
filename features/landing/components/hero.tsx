import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BrowserFrame } from "@/features/landing/components/browser-frame";
import { capabilityChips } from "@/features/landing/data/content";

interface HeroProps {
  isAuthenticated: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40">
      {/* layered radial glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,0.28),transparent)] blur-3xl" />
        <div className="absolute left-1/4 top-40 h-[400px] w-[400px] rounded-full bg-[radial-gradient(closest-side,rgba(96,165,250,0.18),transparent)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-[#94A3B8] backdrop-blur">
            <Sparkles className="size-3.5 text-blue-400" />
            Passwordless project management for modern teams
          </span>
        </div>

        <h1 className="mx-auto mt-7 max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 sm:text-6xl lg:text-7xl">
          Manage work the way{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
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
              className="h-12 bg-blue-500 px-7 text-base text-white hover:bg-blue-500/85"
            >
              <Link href="/home">
                Open App <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="lg"
                className="h-12 bg-blue-500 px-7 text-base text-white hover:bg-blue-500/85"
              >
                <Link href="/auth/register">
                  Get started — it&apos;s passwordless
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 border-white/15 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>

        {/* capability chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#64748B] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 motion-safe:delay-500">
          {capabilityChips.map((chip, i) => (
            <span key={chip} className="flex items-center gap-2">
              {i > 0 && (
                <span className="hidden size-1 rounded-full bg-[#334155] sm:inline-block" />
              )}
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* hero preview */}
      <div className="mx-auto mt-16 max-w-6xl px-5 sm:px-8">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 motion-safe:duration-1000 motion-safe:delay-300">
          <div className="motion-safe:animate-[float_6s_ease-in-out_infinite]">
            <BrowserFrame
              src="/landing/preview-board.png"
              alt="ManeJo Kanban board with columns and cards"
              priority
              sizes="(min-width: 1024px) 1100px, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
