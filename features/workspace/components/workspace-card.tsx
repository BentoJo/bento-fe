import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoreHorizontal, Star } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { WorkspaceListItem } from "@/shared/types/workspace";

interface WorkspaceCardProps {
  workspace: WorkspaceListItem;
  /** Visual-only filled star (favorites section). No favorites flag in the API yet. */
  starred?: boolean;
}

function initial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "W";
}

export function WorkspaceCard({ workspace, starred = false }: WorkspaceCardProps) {
  const { id, name, logoUrl, roleId } = workspace;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-sm font-semibold text-primary">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={40}
              height={40}
              className="size-full object-cover"
            />
          ) : (
            initial(name)
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Star
            className={cn(
              "size-4",
              starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground/50",
            )}
            aria-hidden
          />
          <MoreHorizontal className="size-4" aria-hidden />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="truncate text-sm font-semibold text-foreground" title={name}>
          {name}
        </h3>
        {/* roleId shown as-is — no role-name endpoint wired yet. */}
        <Badge variant="secondary" className="max-w-full">
          <span className="truncate" title={roleId}>
            {roleId}
          </span>
        </Badge>
      </div>

      <Button asChild size="sm" className="mt-1 w-fit">
        <Link href={`/w/${id}`}>
          <ArrowUpRight className="size-4" />
          Open
        </Link>
      </Button>
    </div>
  );
}
