"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail, MessageSquareWarning, LogOut, Loader2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { BrandLogo } from "@/shared/layout/brand-logo";
import { useLogout } from "@/features/auth/hooks/use-logout";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Paths that should mark this item active. */
  match: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: Home, match: ["/home"] },
  { label: "Invitations", href: "/home", icon: Mail, match: ["/invitations"] },
  {
    label: "Report Problem",
    href: "#",
    icon: MessageSquareWarning,
    match: [],
  },
];

export function GlobalSidebar() {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-6">
        <BrandLogo width={120} height={32} />
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match.some(
            (m) => pathname === m || pathname.startsWith(`${m}/`),
          );
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border/60 p-3">
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          aria-label="Log out"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          ) : (
            <LogOut className="size-4 shrink-0" />
          )}
          <span>{isLoggingOut ? "Logging out…" : "Log out"}</span>
        </button>
      </div>
    </aside>
  );
}