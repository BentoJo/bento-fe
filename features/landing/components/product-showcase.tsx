import { cn } from "@/shared/lib/utils";
import { Check } from "lucide-react";
import { BrowserFrame } from "@/features/landing/components/browser-frame";

interface ShowcaseRow {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  src: string;
  alt: string;
}

const rows: ShowcaseRow[] = [
  {
    eyebrow: "Workspace dashboard",
    title: "See the whole picture at a glance",
    description:
      "Your workspace dashboard surfaces boards, activity, and progress so you always know where things stand.",
    bullets: [
      "Boards and recent activity in one view",
      "Progress and insights as work moves",
      "Jump straight into any project",
    ],
    src: "/landing/preview-dashboard.png",
    alt: "ManeJo workspace dashboard overview",
  },
  {
    eyebrow: "Teams & members",
    title: "The right people, the right access",
    description:
      "Invite members by email, organize them into teams, and assign roles that map to fine-grained permissions.",
    bullets: [
      "Invite teammates with secure email codes",
      "Group members into teams",
      "Assign Admin, Editor, Viewer, or custom roles",
    ],
    src: "/landing/preview-users.png",
    alt: "ManeJo team members and roles management",
  },
  {
    eyebrow: "Calendar",
    title: "Never miss a due date again",
    description:
      "Every card with a due date lands on a shared calendar, so deadlines and sprints stay visible to the whole team.",
    bullets: [
      "Due dates mapped to a month view",
      "Plan sprints across the team",
      "Stay ahead of what's coming next",
    ],
    src: "/landing/preview-calendar.png",
    alt: "ManeJo calendar with task due dates",
  },
];

export function ProductShowcase() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-24 px-5 sm:px-8 sm:gap-32">
        {rows.map((row, i) => {
          const reversed = i % 2 === 1;
          return (
            <div
              key={row.title}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={cn(reversed && "lg:order-2")}>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                  {row.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {row.title}
                </h3>
                <p className="mt-4 text-pretty leading-relaxed text-[#94A3B8]">
                  {row.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {row.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-3 text-sm text-[#CBD5E1]"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
                        <Check className="size-3" />
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(reversed && "lg:order-1")}>
                <BrowserFrame
                  src={row.src}
                  alt={row.alt}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
