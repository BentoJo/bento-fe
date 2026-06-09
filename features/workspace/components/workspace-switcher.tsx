"use client";

import { useRouter } from "next/navigation";
import { Check, Plus, LayoutGrid } from "lucide-react";

import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import Dropdown_Arrow from "@/shared/components/svgs/DropDown_Arrow";

interface WorkspaceSwitcherProps {
  workspaceId: string;
  collapsed?: boolean;
}

/** Sidebar workspace switcher — lists the user's workspaces and switches between them. */
export function WorkspaceSwitcher({
  workspaceId,
  collapsed = false,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const { workspaces, isLoading } = useWorkspaces();

  const current = workspaces.find((w) => w.id === workspaceId);
  const currentName = current?.name ?? (isLoading ? "Loading…" : "Workspace");
  const initial = (current?.name ?? "W").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center rounded-lg py-2.5",
            "bg-sidebar-accent/40 text-left text-sm transition-colors hover:bg-sidebar-accent/60 cursor-pointer",
            collapsed
              ? "size-10 justify-center px-0"
              : "w-full justify-between px-3",
          )}
          title={collapsed ? currentName : undefined}
        >
          <span
            className={cn(
              "flex min-w-0 items-center",
              collapsed ? "justify-center" : "gap-2.5",
            )}
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 bg-cover bg-center text-xs font-bold text-white"
              style={
                current?.logoUrl
                  ? { backgroundImage: `url(${current.logoUrl})` }
                  : undefined
              }
            >
              {current?.logoUrl ? null : initial}
            </span>
            <span
              className={cn(
                "flex min-w-0 flex-col overflow-hidden transition-all duration-200",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              <span className="truncate font-medium">{currentName}</span>
            </span>
          </span>
          <Dropdown_Arrow
            className={cn(
              "size-4 shrink-0 text-sidebar-foreground/50 transition-all duration-200",
              collapsed ? "hidden" : "opacity-100",
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Your workspaces
        </DropdownMenuLabel>
        {workspaces.length === 0 && !isLoading ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">
            No workspaces yet.
          </p>
        ) : (
          workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onSelect={() => router.push(`/w/${w.id}`)}
              className="gap-2 cursor-pointer"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold">
                {w.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{w.name}</span>
              {w.id === workspaceId ? (
                <Check className="ml-auto size-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/home")} className="gap-2 cursor-pointer">
          <LayoutGrid className="size-4" />
          All workspaces
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/home")} className="gap-2 cursor-pointer">
          <Plus className="size-4" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
