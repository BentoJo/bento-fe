import {
  Kanban,
  Users,
  ShieldCheck,
  MailCheck,
  ListChecks,
  CalendarRange,
  type LucideIcon,
} from "lucide-react";

export type Accent = "blue" | "violet" | "cyan" | "emerald" | "amber" | "rose";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: Accent;
}

/** gradient + glow classes per accent, used across feature tiles & icons */
export const accentStyles: Record<
  Accent,
  { tile: string; glow: string; ring: string }
> = {
  blue: {
    tile: "from-blue-500 to-blue-600",
    glow: "bg-blue-500/25",
    ring: "group-hover:border-blue-500/40",
  },
  violet: {
    tile: "from-violet-500 to-purple-600",
    glow: "bg-violet-500/25",
    ring: "group-hover:border-violet-500/40",
  },
  cyan: {
    tile: "from-cyan-400 to-sky-500",
    glow: "bg-cyan-400/25",
    ring: "group-hover:border-cyan-400/40",
  },
  emerald: {
    tile: "from-emerald-400 to-teal-500",
    glow: "bg-emerald-400/25",
    ring: "group-hover:border-emerald-400/40",
  },
  amber: {
    tile: "from-amber-400 to-orange-500",
    glow: "bg-amber-400/25",
    ring: "group-hover:border-amber-400/40",
  },
  rose: {
    tile: "from-rose-400 to-pink-500",
    glow: "bg-rose-400/25",
    ring: "group-hover:border-rose-400/40",
  },
};

export const features: Feature[] = [
  {
    icon: Kanban,
    title: "Kanban Boards",
    description:
      "Drag-and-drop cards across columns and watch work flow from idea to done.",
    accent: "blue",
  },
  {
    icon: Users,
    title: "Workspaces & Teams",
    description:
      "Group boards into workspaces and bring the right people into every project.",
    accent: "violet",
  },
  {
    icon: ShieldCheck,
    title: "Roles & Permissions",
    description:
      "Admin, Editor, Viewer, and custom roles with fine-grained, per-resource access.",
    accent: "emerald",
  },
  {
    icon: MailCheck,
    title: "Passwordless Login",
    description:
      "Sign in with a secure one-time email code. No passwords to leak or forget.",
    accent: "cyan",
  },
  {
    icon: ListChecks,
    title: "Rich Tasks",
    description:
      "Checklists, comments, labels, attachments, assignees, and due dates on every card.",
    accent: "amber",
  },
  {
    icon: CalendarRange,
    title: "Calendar & Insights",
    description:
      "See due dates on a calendar and track progress with analytics and audit logs.",
    accent: "rose",
  },
];

export interface Step {
  number: string;
  title: string;
  description: string;
}

export const steps: Step[] = [
  {
    number: "01",
    title: "Create a workspace",
    description:
      "Spin up a home for your team in seconds. Organize everything by project, squad, or client.",
  },
  {
    number: "02",
    title: "Invite your team",
    description:
      "Add members by email and assign roles. Everyone lands exactly where they should — nothing more.",
  },
  {
    number: "03",
    title: "Plan on boards",
    description:
      "Build boards, columns, and cards. Drag tasks through your workflow and ship with confidence.",
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "What is ManeJo?",
    answer:
      "ManeJo (Manage Jordan) is a Kanban-based project and work-management platform. Organize work into workspaces, boards, columns, and cards, collaborate with your team in real time, and keep everything moving.",
  },
  {
    question: "Do I need a password?",
    answer:
      "No. ManeJo is fully passwordless. You sign in with a secure one-time code sent to your email — there is no password to create, remember, or have stolen.",
  },
  {
    question: "How do roles and permissions work?",
    answer:
      "Every member gets a role — Admin, Editor, or Viewer — or a custom role you define. Roles map to fine-grained permissions, so you control exactly who can view, edit, or manage each part of a workspace.",
  },
  {
    question: "Can I organize multiple teams and projects?",
    answer:
      "Yes. Create as many workspaces as you need, group boards inside them, and build teams of members. Each workspace stays cleanly separated with its own boards, members, and access rules.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is built in. Passwordless OTP authentication removes the most common attack vector, role-based access controls limit exposure, and an audit log keeps a record of important activity across your workspace.",
  },
];

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];
