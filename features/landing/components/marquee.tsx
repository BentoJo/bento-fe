const chips = [
  "Kanban",
  "Sprints",
  "Roles & Permissions",
  "Passwordless",
  "Real-time",
  "Checklists",
  "Labels",
  "Attachments",
  "Calendar",
  "Audit log",
  "Teams",
  "Boards",
];

function ChipRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {chips.map((chip) => (
        <li
          key={chip}
          className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#CBD5E1] backdrop-blur-sm"
        >
          <span className="size-1.5 rounded-full bg-gradient-to-br from-blue-400 to-violet-500" />
          {chip}
        </li>
      ))}
    </ul>
  );
}

/**
 * Capability marquee — seamless horizontal scroll of capability chips.
 * Reduced-motion: the animation is disabled and chips wrap statically.
 */
export function Marquee() {
  return (
    <section aria-label="Capabilities" className="relative py-10">
      <style>{`
        @keyframes manejo-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .manejo-marquee-track {
          display: flex;
          width: max-content;
          animation: manejo-marquee 38s linear infinite;
        }
        .manejo-marquee-mask:hover .manejo-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .manejo-marquee-track {
            animation: none;
            flex-wrap: wrap;
            width: 100%;
            justify-content: center;
            gap: 0.75rem;
          }
          .manejo-marquee-track > ul[aria-hidden="true"] {
            display: none;
          }
        }
      `}</style>

      <div className="manejo-marquee-mask relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="manejo-marquee-track px-4">
          <ChipRow />
          <ChipRow ariaHidden />
        </div>
      </div>
    </section>
  );
}
