import { cn } from "@/shared/lib/utils";
import { MessageSquare, Paperclip, CheckSquare } from "lucide-react";

type Priority = "high" | "medium" | "low";

interface MockCard {
  title: string;
  priority: Priority;
  labels: string[];
  assignees: string[];
  comments?: number;
  attachments?: number;
  checklist?: string;
}

interface MockColumn {
  name: string;
  accent: string;
  cards: MockCard[];
}

const priorityStyles: Record<Priority, string> = {
  high: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const labelStyles = [
  "bg-blue-500/20 text-blue-300",
  "bg-violet-500/20 text-violet-300",
  "bg-cyan-500/20 text-cyan-300",
];

const columns: MockColumn[] = [
  {
    name: "To Do",
    accent: "bg-slate-400",
    cards: [
      {
        title: "Design onboarding flow",
        priority: "high",
        labels: ["Design"],
        assignees: ["AB", "MK"],
        comments: 3,
        checklist: "2/5",
      },
      {
        title: "Research competitor boards",
        priority: "low",
        labels: ["Research"],
        assignees: ["SL"],
        attachments: 2,
      },
    ],
  },
  {
    name: "In Progress",
    accent: "bg-blue-400",
    cards: [
      {
        title: "Build Kanban drag & drop",
        priority: "high",
        labels: ["Frontend", "Core"],
        assignees: ["JD", "AB"],
        comments: 8,
        checklist: "6/8",
      },
      {
        title: "Wire passwordless OTP",
        priority: "medium",
        labels: ["Auth"],
        assignees: ["MK"],
        attachments: 1,
      },
    ],
  },
  {
    name: "Done",
    accent: "bg-emerald-400",
    cards: [
      {
        title: "Set up workspace roles",
        priority: "medium",
        labels: ["Backend"],
        assignees: ["SL", "JD"],
        comments: 2,
        checklist: "4/4",
      },
    ],
  },
];

const avatarColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
];

export function KanbanMockup() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            The board experience
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Cards that carry{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              real context
            </span>
          </h2>
          <p className="mt-4 text-pretty text-[#94A3B8]">
            Priorities, labels, assignees, checklists, comments, and
            attachments — everything your team needs, right on the card.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-72 -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(37,99,235,0.18),transparent)] blur-2xl"
          />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]/60 p-4 backdrop-blur-sm sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {columns.map((column) => (
                <div
                  key={column.name}
                  className="rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", column.accent)} />
                      <span className="text-sm font-semibold text-white">
                        {column.name}
                      </span>
                    </div>
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-[#64748B]">
                      {column.cards.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {column.cards.map((card) => (
                      <article
                        key={card.title}
                        className="rounded-lg border border-white/10 bg-[#0F172A] p-3 shadow-sm transition-colors hover:border-blue-500/30"
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          {card.labels.map((label, li) => (
                            <span
                              key={label}
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                                labelStyles[li % labelStyles.length]
                              )}
                            >
                              {label}
                            </span>
                          ))}
                        </div>

                        <h4 className="mt-2 text-sm font-medium leading-snug text-white">
                          {card.title}
                        </h4>

                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                              priorityStyles[card.priority]
                            )}
                          >
                            {card.priority}
                          </span>

                          <div className="flex items-center gap-2.5 text-[11px] text-[#64748B]">
                            {card.checklist && (
                              <span className="flex items-center gap-1">
                                <CheckSquare className="size-3" />
                                {card.checklist}
                              </span>
                            )}
                            {card.comments ? (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="size-3" />
                                {card.comments}
                              </span>
                            ) : null}
                            {card.attachments ? (
                              <span className="flex items-center gap-1">
                                <Paperclip className="size-3" />
                                {card.attachments}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-3 flex -space-x-2">
                          {card.assignees.map((initials, ai) => (
                            <span
                              key={initials}
                              className={cn(
                                "flex size-6 items-center justify-center rounded-full border-2 border-[#0F172A] text-[10px] font-semibold text-white",
                                avatarColors[
                                  (initials.charCodeAt(0) + ai) %
                                    avatarColors.length
                                ]
                              )}
                            >
                              {initials}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}

                    <button
                      type="button"
                      disabled
                      aria-hidden
                      tabIndex={-1}
                      className="w-full rounded-lg border border-dashed border-white/10 py-2 text-xs text-[#475569]"
                    >
                      + Add a card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
