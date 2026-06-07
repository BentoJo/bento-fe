"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/shared/layout/brand-logo";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { cn } from "@/shared/lib/utils";
import Close_arrow from "../components/svgs/Close-Arrow";
import Home from "../components/svgs/Home";
import Board from "../components/svgs/Board";
import Calendar from "../components/svgs/Calendar";
import Analytics from "../components/svgs/Analytics";
import Users from "../components/svgs/Users";
import Archive from "../components/svgs/Archive";
import Audit from "../components/svgs/Audit";
import Settings from "../components/svgs/Settings";
import Report from "../components/svgs/Report";
import Shield from "../components/svgs/Sheild";
import { cairo } from "../lib/fonts";

interface WorkspaceSidebarProps {
  workspaceId: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export function WorkspaceSidebar({ workspaceId }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const base = `/w/${workspaceId}`;

  const workspaceNav: NavItem[] = [
    { label: "Home", href: base, icon: Home, exact: true },
    { label: "Boards", href: `${base}/boards`, icon: Board },
    { label: "Calendar", href: `${base}/calendar`, icon: Calendar },
  ];

  const adminNav: NavItem[] = [
    { label: "Analytics", href: `${base}/analytics`, icon: Analytics },
    { label: "Users", href: `${base}/users`, icon: Users },
    { label: "Archive", href: `${base}/archive`, icon: Archive },
    { label: "Auditing Log", href: `${base}/auditing-log`, icon: Audit },
  ];

  const bottomNav: NavItem[] = [
    { label: "Report Problem", href: `${base}/report-problem`, icon: Report },
    { label: "Settings", href: `${base}/settings`, icon: Settings },
  ];

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <aside
      className="flex h-[calc(100vh-24px)] w-[264px] shrink-0 flex-col m-3 mr-0 rounded-2xl text-white overflow-hidden"
      style={{ background: "#010D1E" }}
    >
      {/* ── Header: Logo + collapse arrow ── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-6 mb-[40px] ">
        <BrandLogo width={130} height={32} />
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/5"
          aria-label="Collapse sidebar"
        >
          <Close_arrow />
        </button>
      </div>

      {/* ── Workspace Switcher ── */}
      <div className="px-4 pb-3">
        <WorkspaceSwitcher workspaceId={workspaceId} />
      </div>

      {/* ── Your Role row ── */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xs font-medium text-[#94A3B8]">Your Role :</span>
        <div className="flex items-center gap-1.5">
          <Shield/>
          <span className="text-xs font-medium text-[#94A3B8]">Admin</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className={` ${cairo.className} flex flex-1 flex-col px-4 mt-2 gap-2 overflow-y-auto `}>

        {/* Workspace section */}
        <SectionLabel label="Workspace " />
        <ul className="space-y-0.5 mb-4">
          {workspaceNav.map((item) => (
            <NavLink key={item.label} item={item} active={isActive(item)} />
          ))}
        </ul>

        {/* Admin section */}
        <SectionLabel label="Admin" />
        <ul className="space-y-0.5">
          {adminNav.map((item) => (
            <NavLink key={item.label} item={item} active={isActive(item)} />
          ))}
        </ul>

        {/* Bottom nav pushed to bottom */}
        <div className="mt-auto pt-4 pb-4 border-t border-white/5">
          <ul className="space-y-0.5">
            {bottomNav.map((item) => (
              <NavLink key={item.label} item={item} active={isActive(item)} />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

/* ── Section label with divider line ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="text-xs font-medium text-[#94A3B8] whitespace-nowrap">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#1E293B]" />
    </div>
  );
}

/* ── Nav link with left active indicator ── */
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li className={`flex items-center gap-2 ${cairo.className}`}>
      {/* Left blue indicator bar */}
      <div className="w-[3px] flex-shrink-0 flex items-center justify-center" style={{ height: 40 }}>
        {active && (
          <div
            className="w-[4px]  rounded-full bg-[#3B82F6]"
            style={{ height: 30 }}
          />
        )}
      </div>

      <Link
        href={item.href}
        className={cn(
          "flex flex-1 items-center gap-3 ${cairo.className} rounded-[8px] px-3 transition-all duration-150",
          "h-[40px]",
          active
            ? "bg-[#3B82F6]/10 text-white"
            : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            active ? "text-white" : "text-[#94A3B8]"
          )}
        />
        <span
          className={cn(
            "text-[14px] font-semibold leading-none",
            active ? "text-white" : "text-[#94A3B8]"
          )}
        >
          {item.label}
        </span>
      </Link>
    </li>
  );
}