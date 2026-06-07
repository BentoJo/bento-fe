"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { BrandLogo } from "@/shared/layout/brand-logo";
import { useLogout } from "@/features/auth/hooks/use-logout";
import Close_arrow from "../components/svgs/Close-Arrow";
import Home from "../components/svgs/Home";
import Board from "../components/svgs/Board";
import Calendar from "../components/svgs/Calendar";
import Analytics from "../components/svgs/Analytics";
import Users from "../components/svgs/Users";
import Archive from "../components/svgs/Archive";
import Audit from "../components/svgs/Audit";
import Shield from "../components/svgs/Sheild";
import Settings from "../components/svgs/Settings";
import Report from "../components/svgs/Report";
import { cairo } from "../lib/fonts";
import Dropdown_List from "../components/svgs/Dropdown_List";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match: string[];
  section?: "workspace" | "admin" | "bottom";
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
    match: ["/home"],
    section: "workspace",
  },
  {
    label: "Board",
    href: "/board",
    icon: Board,
    match: ["/board"],
    section: "workspace",
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
    match: ["/calendar"],
    section: "workspace",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: Analytics,
    match: ["/analytics"],
    section: "admin",
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    match: ["/users"],
    section: "admin",
  },
  {
    label: "Archive",
    href: "/archive",
    icon: Archive,
    match: ["/archive"],
    section: "admin",
  },
  {
    label: "Auditing Log",
    href: "/audit-log",
    icon: Audit,
    match: ["/audit-log"],
    section: "admin",
  },
  {
    label: "Report Problem",
    href: "/report-problem",
    icon: Report,
    match: ["/#"],
    section: "bottom",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    match: ["/settings"],
    section: "bottom",
  },
];


const bottomItems = NAV_ITEMS.filter(
  (item) => item.section === "bottom",
);


export function GlobalSidebar() {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  const workspaceItems = NAV_ITEMS.filter(
    (item) => item.section === "workspace",
  );

  const adminItems = NAV_ITEMS.filter(
    (item) => item.section === "admin",
  );

  return (
    <aside className="flex h-[calc(100vh - 16px)] w-[280px] shrink-0 flex-col m-3 rounded-[16px] bg-[#010D1E] px-6 py-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mt-2">
        <BrandLogo width={150} height={37} />

        <button className="rounded-lg p-2 transition hover:bg-white/5">
          <Close_arrow />
        </button>
      </div>

      {/* Workspace Selector */}
      <div className="mt-10">
        <button className="flex w-full items-center justify-between rounded-[8px] border border-[#1E293B] bg-[#0F172A] px-4 py-3 text-sm  font-medium">
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span className={`${cairo.className} text-[16px] font-semibold`}>Bento</span>
          </div>

          <Dropdown_List className="size-4" />
        </button>
      </div>

      {/* Role */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-[#94A3B8]">
          <span>Your Role :</span>

          <div className="flex items-center gap-2">
            <Shield width={16} height={16} />
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* Workspace Section */}
      <div className="mt-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="text-sm font-medium text-[#94A3B8]">
            Workspace
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        <nav className="space-y-3">
          {workspaceItems.map((item) => {
            const isActive = item.match.some(
              (m) => pathname === m || pathname.startsWith(`${m}/`),
            );

            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center"
              >
                {/* Active Indicator */}
                <div className="flex w-4 justify-center">
                  {isActive && (
                    <div className="h-[30px] w-[4px] rounded-full bg-[#3B82F6]" />
                  )}
                </div>

                {/* Navigation Item */}
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-[42px] flex-1 items-center gap-2 rounded-[8px] px-3 transition-all",
                    isActive
                      ? "bg-[#3B82F6]/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-7 shrink-0" />

                  <span
                    className={`${cairo.className} text-[16px] font-semibold`}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Admin Section */}
      <div className="mt-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="text-sm font-medium text-[#94A3B8]">
            Admin
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        <nav className="space-y-3">
          {adminItems.map((item) => {
            const isActive = item.match.some(
              (m) => pathname === m || pathname.startsWith(`${m}/`),
            );

            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center"
              >
                {/* Active Indicator */}
                <div className="flex w-4 justify-center">
                  {isActive && (
                    <div className="h-[30px] w-[4px] rounded-full bg-[#3B82F6]" />
                  )}
                </div>

                {/* Navigation Item */}
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-[42px] flex-1 items-center gap-2 rounded-[8px] px-3 transition-all",
                    isActive
                      ? "bg-[#3B82F6]/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-7 shrink-0" />

                  <span
                    className={`${cairo.className} text-[16px] font-semibold`}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6">
        <nav className="space-y-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;

            const isActive = item.match.some(
              (m) => pathname === m || pathname.startsWith(`${m}/`),
            );

            return (
              <div
                key={item.label}
                className="flex items-center"
              >
                <div className="flex w-4 justify-center">
                  {isActive && (
                    <div className="h-[30px] w-[4px] rounded-full bg-[#3B82F6]" />
                  )}
                </div>

                <Link
                  href={item.href}
                  className={cn(
                    "flex h-[42px] flex-1 items-center gap-2 rounded-[8px] px-3 transition-all",
                    isActive
                      ? "bg-[#3B82F6]/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="size-5 shrink-0" />

                  <span
                    className={`${cairo.className} text-[16px] font-semibold`}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>


      </div>
    </aside>
  );
}
