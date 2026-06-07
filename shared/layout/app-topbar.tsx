"use client";

import { Bell, HelpCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import Search from "../components/svgs/Search";
import Help from "../components/svgs/Help";
import Notifications from "../components/svgs/Notification";

interface TopbarUser {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

function initials(user: TopbarUser): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

export function AppTopbar({ user }: { user: TopbarUser }) {
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
          <Notifications className="size-4" />
        </button>

        <Avatar className="size-10">
          {user.avatarUrl ? (
            <AvatarImage
              src={user.avatarUrl}
              alt={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
            />
          ) : null}

          <AvatarFallback className="text-xs font-medium">
            {initials(user)}
          </AvatarFallback>
        </Avatar>

      </div>
      
    </header>
  );
}

