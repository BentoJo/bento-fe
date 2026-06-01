import { ShieldCheck, Pencil, Eye, Check, X, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Reveal } from "@/features/landing/components/reveal";

interface Permission {
  label: string;
  allowed: boolean;
}

interface Role {
  icon: LucideIcon;
  name: string;
  description: string;
  tile: string;
  permissions: Permission[];
}

const roles: Role[] = [
  {
    icon: ShieldCheck,
    name: "Admin",
    description: "Full control over the workspace, members, and settings.",
    tile: "from-blue-500 to-blue-600",
    permissions: [
      { label: "Manage members & roles", allowed: true },
      { label: "Create & delete boards", allowed: true },
      { label: "Edit workspace settings", allowed: true },
    ],
  },
  {
    icon: Pencil,
    name: "Editor",
    description: "Create and move work without touching workspace settings.",
    tile: "from-violet-500 to-purple-600",
    permissions: [
      { label: "Create & move cards", allowed: true },
      { label: "Manage tasks & comments", allowed: true },
      { label: "Edit workspace settings", allowed: false },
    ],
  },
  {
    icon: Eye,
    name: "Viewer",
    description: "Read-only access for stakeholders and clients.",
    tile: "from-emerald-400 to-teal-500",
    permissions: [
      { label: "View boards & progress", allowed: true },
      { label: "Create or edit cards", allowed: false },
      { label: "Manage members", allowed: false },
    ],
  },
];

export function RolesHighlight() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8 sm:p-12">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Roles &amp; access
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Fine-grained control,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                zero guesswork
              </span>
            </h2>
            <p className="mt-4 text-pretty text-[#94A3B8]">
              Start with Admin, Editor, and Viewer — or define custom roles with
              exactly the permissions your team needs. Everyone sees only what
              they should.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {roles.map((role, i) => {
              const Icon = role.icon;
              return (
                <Reveal
                  key={role.name}
                  delay={i * 90}
                  className="rounded-2xl border border-white/10 bg-[#0F172A]/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-white/20"
                >
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                      role.tile
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {role.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                    {role.description}
                  </p>

                  <ul className="mt-5 space-y-2.5 border-t border-white/5 pt-5">
                    {role.permissions.map((perm) => (
                      <li
                        key={perm.label}
                        className={cn(
                          "flex items-center gap-2.5 text-sm",
                          perm.allowed ? "text-[#CBD5E1]" : "text-[#475569]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full",
                            perm.allowed
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/5 text-[#475569]"
                          )}
                        >
                          {perm.allowed ? (
                            <Check className="size-3" />
                          ) : (
                            <X className="size-3" />
                          )}
                        </span>
                        {perm.label}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={150} className="mt-8 text-center text-sm text-[#64748B]">
            Need something different? Build{" "}
            <span className="font-medium text-[#CBD5E1]">custom roles</span> with
            per-resource permissions in a few clicks.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
