"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { BrandLogo } from "@/shared/layout/brand-logo";
import { cn } from "@/shared/lib/utils";
import CloseArrow from "../components/svgs/Close-Arrow";
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
  const [collapsed, setCollapsed] = useState(false);
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
      className={cn(
        "m-3 mr-0 flex h-[calc(100vh-24px)] shrink-0 flex-col overflow-hidden rounded-2xl bg-[#010D1E] text-white transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[88px]" : "w-[264px]",
      )}
    >
      <div
        className={cn(
          "mb-10 flex items-center px-6 pb-6 pt-6 transition-all duration-300",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-[130px] opacity-100",
          )}
        >
          <BrandLogo width={130} height={32} />
        </div>

        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((current) => !current)}
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
        >
          <span
            className={cn(
              "flex transition-transform duration-300",
              collapsed && "rotate-180",
            )}
          >
            <CloseArrow />
          </span>
        </button>
      </div>

      <div
        className={cn(
          "flex px-4 pb-3 transition-all duration-300",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        <WorkspaceSwitcher workspaceId={workspaceId} collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "flex items-center px-5 py-4 transition-all duration-300",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <span
          className={cn(
            "whitespace-nowrap text-xs font-medium text-[#94A3B8] transition-all duration-200",
            collapsed ? "w-0 opacity-0" : "opacity-100",
          )}
        >
          Your Role :
        </span>
        <div className="flex items-center gap-1.5">
          <Shield />
          <span
            className={cn(
              "whitespace-nowrap text-xs font-medium text-[#94A3B8] transition-all duration-200",
              collapsed ? "hidden" : "opacity-100",
            )}
          >
            Admin
          </span>
        </div>
      </div>

      <nav
        className={cn(
          cairo.className,
          "mt-2 flex flex-1 flex-col gap-2 overflow-y-auto px-4",
        )}
      >
        <SectionLabel label="Workspace" collapsed={collapsed} />
        <ul className="mb-4 space-y-0.5">
          {workspaceNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              active={isActive(item)}
              collapsed={collapsed}
            />
          ))}
        </ul>

        <SectionLabel label="Admin" collapsed={collapsed} />
        <ul className="space-y-0.5">
          {adminNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              active={isActive(item)}
              collapsed={collapsed}
            />
          ))}
        </ul>

        <div className="mt-auto border-t border-white/5 pb-4 pt-4">
          <ul className="space-y-0.5">
            {bottomNav.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                active={isActive(item)}
                collapsed={collapsed}
              />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

function SectionLabel({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 px-1 transition-all duration-200",
      )}
    >
      <span className={`whitespace-nowrap text-xs font-medium text-[#94A3B8] ${collapsed ? "hidden" : ""}`}>
        {label}
      </span>
      <div className="h-px flex-1 bg-[#1E293B]" />
    </div>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <li
      className={cn(
        cairo.className,
        "flex items-center",
        collapsed ? "gap-1" : "gap-2",
      )}
    >
      <div
        className="flex w-[3px] shrink-0 items-center justify-center"
        style={{ height: 40 }}
      >
        {active && (
          <div
            className="w-[4px] rounded-full bg-[#3B82F6]"
            style={{ height: 30 }}
          />
        )}
      </div>

      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex h-[40px] items-center rounded-[8px] transition-all duration-200",
          collapsed ? "w-[40px] justify-center px-0" : "flex-1 gap-3 px-3",
          active
            ? "bg-[#3B82F6]/10 text-white"
            : "text-[#94A3B8] hover:bg-white/5 hover:text-white",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            active ? "text-white" : "text-[#94A3B8]",
          )}
        />
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap text-[14px] font-semibold leading-none transition-all duration-200",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            active ? "text-white" : "text-[#94A3B8]",
          )}
        >
          {item.label}
        </span>
      </Link>
    </li>
  );
}
