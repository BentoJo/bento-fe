import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Reveal } from "@/features/landing/components/reveal";

interface FinalCtaProps {
  isAuthenticated: boolean;
}

export function FinalCta({ isAuthenticated }: FinalCtaProps) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-[#0F172A] to-[#020617] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.35),transparent)] blur-3xl" />
            <div className="absolute right-1/4 bottom-0 h-56 w-[400px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.25),transparent)] blur-3xl" />
          </div>

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Ready when you are
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Start organizing today
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-[#94A3B8] sm:text-lg">
              Create your first workspace in minutes. No credit card, no
              password — just a secure email code and you&apos;re in.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
                      Get started
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
        </Reveal>
      </div>
    </section>
  );
}
