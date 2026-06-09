"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut, MailOpen } from "lucide-react";

import { useLogout } from "@/features/auth/hooks/use-logout";
import { cn } from "@/shared/lib/utils";
import { BrandLogo } from "@/shared/layout/brand-logo";
import CloseArrow from "../components/svgs/Close-Arrow";
import Home from "../components/svgs/Home";
import Report from "../components/svgs/Report";
import { cairo } from "../lib/fonts";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  match: string[];
}

const GLOBAL_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: Home, match: ["/home"] },
  {
    label: "Invitations",
    href: "/invitations",
    icon: MailOpen,
    match: ["/invitations"],
  }
];

export function GlobalSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  return (
    <aside
      className={cn(
        "m-3 flex h-[calc(100vh-24px)] shrink-0 flex-col overflow-hidden rounded-[16px] bg-[#010D1E] px-6 py-4 text-white transition-[width,padding] duration-300 ease-in-out",
        collapsed ? "w-22 px-4" : "w-70",
      )}
    >
      <div
        className={cn(
          "mt-2 flex items-center transition-all duration-300",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-37.5 opacity-100",
          )}
        >
          <BrandLogo width={150} height={37} />
        </div>

        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((current) => !current)}
          className="flex size-9 items-center justify-center rounded-lg transition hover:bg-white/5 cursor-pointer"
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

      <nav className={cn(cairo.className, "mt-10 flex flex-1 flex-col")}>
        <ul className="space-y-3">
          {GLOBAL_ITEMS.map((item) => {
            const active = item.match.some(
              (m) => pathname === m || pathname.startsWith(`${m}/`),
            );

            return (
              <NavLink
                key={item.label}
                item={item}
                active={active}
                collapsed={collapsed}
              />
            );
          })}
        </ul>

        <div className="mt-auto pb-2">
          <Link
            type="button"
            href="/report-problem"
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex h-[42px] w-full items-center rounded-[8px] text-[#94A3B8] transition-all duration-200 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-60 cursor-pointer",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
            )}
          >
            <Report />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-[16px] font-semibold leading-none transition-all duration-200",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              Report a Problem
            </span>
          </Link>
          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex h-[42px] w-full items-center rounded-[8px] text-[#94A3B8] transition-all duration-200 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-60 cursor-pointer",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
            )}
          >
            {isLoggingOut ? (
              <Loader2 className="size-5 shrink-0 animate-spin" />
            ) : (
              <LogOut className="size-5 shrink-0" />
            )}
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-[16px] font-semibold leading-none transition-all duration-200",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </nav>
    </aside>
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
    <li className={cn("flex items-center", collapsed ? "gap-1" : "gap-2")}>
      <div
        className="flex w-[3px] shrink-0 items-center justify-center"
        style={{ height: 42 }}
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
          "flex h-[42px] items-center rounded-[8px] transition-all duration-200",
          collapsed ? "w-full justify-center px-0" : "flex-1 gap-3 px-3",
          active
            ? "bg-[#3B82F6]/10 text-white"
            : "text-[#94A3B8] hover:bg-white/5 hover:text-white",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="size-5 shrink-0" />
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap text-[16px] font-semibold leading-none transition-all duration-200",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          )}
        >
          {item.label}
        </span>
      </Link>
    </li>
  );
}
