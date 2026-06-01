import { cn } from "@/shared/lib/utils";
import { features, accentStyles, type Feature } from "@/features/landing/data/content";
import { Reveal } from "@/features/landing/components/reveal";

/** layout span per index for the asymmetric bento grid (lg breakpoint) */
const spans = [
  "lg:col-span-2 lg:row-span-2", // Kanban (hero tile)
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2", // wide tile
];

function MiniBoard() {
  const cols = [
    { dot: "bg-slate-400", cards: ["bg-white/10", "bg-white/[0.07]"] },
    { dot: "bg-blue-400", cards: ["bg-blue-500/20", "bg-white/10"] },
    { dot: "bg-emerald-400", cards: ["bg-emerald-500/15"] },
  ];
  return (
    <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-xl border border-white/10 bg-[#0B1220]/60 p-3">
      {cols.map((col, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", col.dot)} />
            <span className="h-1.5 w-8 rounded-full bg-white/15" />
          </div>
          {col.cards.map((c, j) => (
            <div key={j} className={cn("rounded-md p-2", c)}>
              <span className="block h-1.5 w-3/4 rounded-full bg-white/25" />
              <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-white/15" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  const Icon = feature.icon;
  const accent = accentStyles[feature.accent];
  const isHero = index === 0;

  return (
    <Reveal
      delay={(index % 3) * 80}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06]",
        accent.ring,
        spans[index],
        isHero && "sm:col-span-2 lg:p-8"
      )}
    >
      {/* border glow on hover */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          accent.glow
        )}
      />

      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
          accent.tile,
          isHero ? "size-14" : "size-12"
        )}
      >
        <Icon className={isHero ? "size-7" : "size-6"} />
      </div>

      <h3
        className={cn(
          "mt-5 font-semibold text-white",
          isHero ? "text-2xl" : "text-lg"
        )}
      >
        {feature.title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#94A3B8]">
        {feature.description}
      </p>

      {isHero && <MiniBoard />}
    </Reveal>
  );
}

export function FeatureGrid() {
  return (
    <section id="features" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Everything in one place
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A complete toolkit for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              getting work done
            </span>
          </h2>
          <p className="mt-4 text-pretty text-[#94A3B8]">
            From boards to permissions, ManeJo gives every team the structure
            to plan, the flexibility to move, and the control to stay secure.
          </p>
        </Reveal>

        <div className="mt-16 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
