"use client";

import Link from "next/link";
import { LayoutGrid, Columns3, SquareStack, Lock, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import type { BoardPreview } from "@/shared/types/workspace";

interface BoardsPreviewProps {
  workspaceId: string;
  boards: BoardPreview[] | undefined;
  isLoading: boolean;
}

export function BoardsPreview({
  workspaceId,
  boards,
  isLoading,
}: BoardsPreviewProps) {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Boards</CardTitle>
        <Link
          href={`/w/${workspaceId}/boards`}
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : !boards || boards.length === 0 ? (
          <EmptyBoards />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {boards.map((board) => (
              <BoardItem
                key={board.id}
                workspaceId={workspaceId}
                board={board}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BoardItem({
  workspaceId,
  board,
}: {
  workspaceId: string;
  board: BoardPreview;
}) {
  const isPrivate = board.visibility?.toLowerCase().includes("private");
  return (
    <Link
      href={`/w/${workspaceId}/boards/${board.id}`}
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border p-3",
        "transition-colors hover:border-primary/40 hover:bg-accent/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 truncate text-sm font-medium text-card-foreground">
          <LayoutGrid className="size-4 shrink-0 text-primary" />
          <span className="truncate">{board.name}</span>
        </span>
        <Badge variant="outline" className="shrink-0 gap-1 text-[10px]">
          {isPrivate ? (
            <Lock className="size-3" />
          ) : (
            <Globe className="size-3" />
          )}
          {board.visibility || "—"}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Columns3 className="size-3.5" />
          {board.columnsCount} columns
        </span>
        <span className="flex items-center gap-1">
          <SquareStack className="size-3.5" />
          {board.cardCount} cards
        </span>
      </div>
    </Link>
  );
}

function EmptyBoards() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
      <LayoutGrid className="size-8 text-muted-foreground/60" />
      <p className="text-sm font-medium text-card-foreground">No boards yet</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Boards created in this workspace will appear here.
      </p>
    </div>
  );
}
