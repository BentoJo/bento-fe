import { cn } from "@/shared/lib/utils";
import { Reveal } from "@/features/landing/components/reveal";

interface Stat {
  value: string;
  label: string;
  gradient: string;
}

const stats: Stat[] = [
  {
    value: "0",
    label: "passwords — secure email OTP",
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    value: "3 + custom",
    label: "roles with fine-grained permissions",
    gradient: "from-violet-400 to-fuchsia-400",
  },
  {
    value: "Unlimited",
    label: "boards, columns & cards",
    gradient: "from-emerald-400 to-teal-400",
  },
  {
    value: "Real-time",
    label: "collaboration across your team",
    gradient: "from-amber-400 to-rose-400",
  },
];

export function StatCallouts() {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 80}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm sm:text-left"
            >
              <div
                className={cn(
                  "bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl",
                  stat.gradient
                )}
              >
                {stat.value}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
