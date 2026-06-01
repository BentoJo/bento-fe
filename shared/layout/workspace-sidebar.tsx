"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  BarChart3,
  Users,
  Archive,
  ScrollText,
  Settings,
  CircleHelp,
  ChevronsUpDown,
} from "lucide-react";
import { BrandLogo } from "@/shared/layout/brand-logo";
import { cn } from "@/shared/lib/utils";

interface WorkspaceSidebarProps {
  workspaceId: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** match exact pathname for the root nav item to avoid always-active */
  exact?: boolean;
}

export function WorkspaceSidebar({ workspaceId }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const base = `/w/${workspaceId}`;

  const mainNav: NavItem[] = [
    { label: "Home", href: base, icon: Home, exact: true },
    { label: "Boards", href: `${base}/boards`, icon: LayoutGrid },
    { label: "Analytics", href: `${base}/analytics`, icon: BarChart3 },
    { label: "Users", href: `${base}/users`, icon: Users },
    { label: "Archive", href: `${base}/archive`, icon: Archive },
    { label: "Auditing Log", href: `${base}/auditing-log`, icon: ScrollText },
  ];

  const bottomNav: NavItem[] = [
    { label: "Report Problem", href: `${base}/report-problem`, icon: CircleHelp },
    { label: "Settings", href: `${base}/settings`, icon: Settings },
  ];

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center px-4 py-5">
        <BrandLogo />
      </div>

      {/* Workspace switcher (static for now) */}
      {/* TODO(BE): wire to listUserWorkspaces for a real switcher dropdown. */}
      <div className="px-3">
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2.5",
            "bg-sidebar-accent/40 text-left text-sm transition-colors",
            "hover:bg-sidebar-accent/60",
          )}
        >
          <span className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-sidebar-foreground/50">
              Your App
            </span>
            <span className="truncate font-medium">Bento</span>
          </span>
          <ChevronsUpDown className="size-4 text-sidebar-foreground/50" />
        </button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col px-3">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wide text-sidebar-foreground/40">
          Workspace
        </p>
        <ul className="flex flex-col gap-1">
          {mainNav.map((item) => (
            <NavLink key={item.label} item={item} active={isActive(item)} />
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-1 pb-4">
          {bottomNav.map((item) => (
            <NavLink key={item.label} item={item} active={isActive(item)} />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="size-4 shrink-0" />
        {item.label}
      </Link>
    </li>
  );
}
