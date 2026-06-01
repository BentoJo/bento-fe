import { cn } from "@/shared/lib/utils";
import { steps } from "@/features/landing/data/content";
import { Reveal } from "@/features/landing/components/reveal";

const circleGradients = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-400 to-teal-500",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-24 sm:py-32">
      <style>{`
        @keyframes manejo-dash {
          to { background-position: 28px 0; }
        }
      `}</style>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From zero to organized in{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              three steps
            </span>
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* animated dashed connecting line (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-7 hidden h-px lg:block"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(96,165,250,0.5) 50%, transparent 50%)",
              backgroundSize: "28px 1px",
              backgroundRepeat: "repeat-x",
              animation: "manejo-dash 1.2s linear infinite",
            }}
          />

          <ol className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.number}
                delay={i * 120}
                className="relative text-center lg:text-left"
              >
                <div className="flex items-center justify-center lg:justify-start">
                  <span
                    className={cn(
                      "relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-lg shadow-blue-950/50 ring-4 ring-[#020617]",
                      circleGradients[i]
                    )}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-[#94A3B8]">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
