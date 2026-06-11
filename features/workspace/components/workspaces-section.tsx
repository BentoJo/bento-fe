import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { WorkspaceCard } from "@/features/workspace/components/workspace-card";
import type { WorkspaceListItem } from "@/shared/types/workspace";

interface WorkspacesSectionProps {
  title: string;
  icon?: React.ReactNode;
  workspaces: WorkspaceListItem[];
  isLoading?: boolean;
  /** When set and there is room, render a "View All" link. */
  viewAllHref?: string;
  /** Message shown when the list is empty and not loading. */
  emptyMessage: string;
  /** Mark all cards as starred (use for a favorites-only section). */
  starred?: boolean;
  /** Predicate to determine per-card star state. Takes precedence over `starred`. */
  isFavorite?: (id: string) => boolean;
  /** Called when the user clicks the star on a card. */
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="mt-1 h-8 w-20 rounded-md" />
    </div>
  );
}

export function WorkspacesSection({
  title,
  icon,
  workspaces,
  isLoading = false,
  viewAllHref,
  emptyMessage,
  starred = false,
  isFavorite,
  onToggleFavorite,
  className,
}: WorkspacesSectionProps) {
  const hasItems = workspaces.length > 0;

  return (
    <section className={cn("rounded-2xl border border-border bg-card/40 p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon}
          {title}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-primary hover:underline"
          >
            View All
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : hasItems ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.id}
              workspace={ws}
              starred={isFavorite ? isFavorite(ws.id) : starred}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
