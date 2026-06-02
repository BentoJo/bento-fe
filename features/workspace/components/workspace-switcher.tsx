"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, LayoutGrid } from "lucide-react";

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

interface WorkspaceSwitcherProps {
  workspaceId: string;
}

/** Sidebar workspace switcher — lists the user's workspaces and switches between them. */
export function WorkspaceSwitcher({ workspaceId }: WorkspaceSwitcherProps) {
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
            "flex w-full items-center justify-between rounded-lg px-3 py-2.5",
            "bg-sidebar-accent/40 text-left text-sm transition-colors hover:bg-sidebar-accent/60",
          )}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
              {initial}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[10px] uppercase tracking-wide text-sidebar-foreground/50">
                Workspace
              </span>
              <span className="truncate font-medium">{currentName}</span>
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/50" />
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
              className="gap-2"
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
        <DropdownMenuItem onSelect={() => router.push("/home")} className="gap-2">
          <LayoutGrid className="size-4" />
          All workspaces
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/home")} className="gap-2">
          <Plus className="size-4" />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
