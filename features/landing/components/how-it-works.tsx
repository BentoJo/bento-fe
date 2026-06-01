import { steps } from "@/features/landing/data/content";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From zero to organized in{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              three steps
            </span>
          </h2>
        </div>

        <div className="relative mt-16">
          {/* connecting line (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent lg:block"
          />
          <ol className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {steps.map((step) => (
              <li key={step.number} className="relative text-center lg:text-left">
                <div className="flex items-center justify-center gap-4 lg:justify-start">
                  <span className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-[#0F172A] text-lg font-bold text-blue-400 shadow-lg shadow-blue-950/40">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-[#94A3B8]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
