"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/use-logout";
import Search from "../components/svgs/Search";
import Help from "../components/svgs/Help";
import Notifications from "../components/svgs/Notification";

interface TopbarUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string | null;
}

function initials(user: TopbarUser): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

export function AppTopbar({ user }: { user: TopbarUser }) {
  const { logout, isLoggingOut } = useLogout();
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return (
    <header className="flex h-[98px] shrink-0 items-center gap-4 bg-white px-7 border-b-1 border-[#E2E8F0] ">
      {/* Search */}
      <div className="flex w-[500px] h-[50px] border border-[#E2E8F0] rounded-[12px] px-4 items-center">
        <Search
          className="
          pointer-events-none
          size-5
          text-[#94A3B8]
        "
        />
        <Input
          type="search"
          placeholder="Search for task, board or user"
          aria-label="Search"
          className="

      text-[13px]
      text-[#0F172A]

      placeholder:text-[#94A3B8]
    "
        />
      </div>

      {/* Right Side */}
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Help"
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            "border border-[#E2E8F0]",
            "bg-white",
            "text-[#2563EB]",
            "transition-colors hover:bg-[#F8FAFC]",
          )}
        >
          <Help className="size-4" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            "border border-[#E2E8F0]",
            "bg-white",
            "text-[#2563EB]",
            "transition-colors hover:bg-[#F8FAFC]",
          )}
        >
          <Notifications className="size-4" fill="#2563EB" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User menu"
              className="cursor-pointer rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar className="size-10">
                {user.avatarUrl ? (
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={fullName || "User avatar"}
                  />
                ) : null}
                <AvatarFallback className="text-xs font-medium">
                  {initials(user)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              {fullName && (
                <span className="font-semibold text-foreground">{fullName}</span>
              )}
              {user.email && (
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {user.email}
                </span>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="size-4" />
                View Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/profile/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="size-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
      
    </header>
  );
}

