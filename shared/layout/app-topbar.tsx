"use client";

import { Bell, HelpCircle, Search } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

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
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for task, board or user"
          className="h-9 rounded-lg bg-muted/60 pl-8"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Help"
          className={cn(
            "flex size-9 items-center justify-center rounded-full text-muted-foreground",
            "hover:bg-muted hover:text-foreground transition-colors",
          )}
        >
          <HelpCircle className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            "flex size-9 items-center justify-center rounded-full text-muted-foreground",
            "hover:bg-muted hover:text-foreground transition-colors",
          )}
        >
          <Bell className="size-5" />
        </button>
        <Avatar>
          {user.avatarUrl ? (
            <AvatarImage
              src={user.avatarUrl}
              alt={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
            />
          ) : null}
          <AvatarFallback>{initials(user)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
