import { ShieldCheck, Pencil, Eye, type LucideIcon } from "lucide-react";

interface Role {
  icon: LucideIcon;
  name: string;
  description: string;
  accent: string;
}

const roles: Role[] = [
  {
    icon: ShieldCheck,
    name: "Admin",
    description:
      "Full control over the workspace — manage members, roles, billing, and every board.",
    accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    icon: Pencil,
    name: "Editor",
    description:
      "Create and move cards, manage tasks, and collaborate — without touching workspace settings.",
    accent: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  },
  {
    icon: Eye,
    name: "Viewer",
    description:
      "Read-only access to boards and progress. Perfect for stakeholders and clients.",
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
];

export function RolesHighlight() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Roles & access
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Fine-grained control,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                zero guesswork
              </span>
            </h2>
            <p className="mt-4 text-pretty text-[#94A3B8]">
              Start with Admin, Editor, and Viewer — or define custom roles with
              exactly the permissions your team needs. Everyone sees only what
              they should.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.name}
                  className="rounded-2xl border border-white/10 bg-[#0F172A]/60 p-6 backdrop-blur-sm"
                >
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl border ${role.accent}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {role.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-[#64748B]">
            Need something different? Build{" "}
            <span className="text-[#CBD5E1]">custom roles</span> with
            per-resource permissions in a few clicks.
          </p>
        </div>
      </div>
    </section>
  );
}
