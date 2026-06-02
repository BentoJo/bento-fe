"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Columns3,
  Eye,
  Filter,
  KanbanSquare,
  ListFilter,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { moveCard } from "@/features/boards/api/cards";
import { useBoard } from "@/features/boards/hooks/use-board";
import type { Card, Column } from "@/features/boards/types/board";
import { CreateTaskDrawer } from "@/features/boards/components/create-task-drawer";
import { TaskCard } from "@/features/boards/components/task-card";
import { TaskDetailsDialog } from "@/features/boards/components/task-details-dialog";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface KanbanBoardProps {
  workspaceId: string;
  boardId: string;
}

export function KanbanBoard({ workspaceId, boardId }: KanbanBoardProps) {
  const { board, columns, cardsByColumn, isLoading, error, refetch } = useBoard(
    workspaceId,
    boardId,
  );

  const [createForColumn, setCreateForColumn] = useState<Column | null>(null);
  const [detailsCard, setDetailsCard] = useState<Card | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const boardName = board?.name ?? "Board";

  // Native HTML5 DnD: optimistically move a card to a new column.
  const handleDrop = async (targetColumn: Column) => {
    const cardId = draggingCardId;
    setDraggingCardId(null);
    setDragOverColumnId(null);
    if (!cardId) return;

    const card = findCard(cardsByColumn, cardId);
    if (!card || card.columnId === targetColumn.id) return;

    const position = (cardsByColumn[targetColumn.id]?.length ?? 0) + 1;
    try {
      // Optimistic: the move API is best-effort; we refetch to reconcile.
      await moveCard(workspaceId, boardId, cardId, {
        columnId: targetColumn.id,
        position,
      });
      toast.success("Task moved.");
      refetch();
    } catch (err) {
      // TODO(BE): card move endpoint not wired yet — degrade gracefully.
      toast.error(
        err instanceof Error ? err.message : "Failed to move task.",
      );
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href={`/w/${workspaceId}/boards`}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Boards
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{boardName}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {board?.icon?.trim() ? (
                <span aria-hidden>{board.icon.trim()}</span>
              ) : (
                <KanbanSquare className="size-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {boardName}
              </h1>
              <p className="text-xs text-muted-foreground">
                {board?.visibility === "private" ? "Private board" : "Public board"}
              </p>
            </div>
          </div>

          {/* Header actions — visual only, not wired. TODO(BE). */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Eye className="size-4" />
              View All Sprints
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Filter className="size-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <ListFilter className="size-4" />
              Sort
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80"
              disabled
            >
              <Columns3 className="size-4" />
              Manage Columns
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {/* Board body */}
      {isLoading ? (
        <BoardSkeleton />
      ) : columns.length === 0 ? (
        <EmptyBoard />
      ) : (
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {columns
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((column) => {
              const cards = cardsByColumn[column.id] ?? [];
              const isOver = dragOverColumnId === column.id;
              return (
                <div
                  key={column.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverColumnId(column.id);
                  }}
                  onDragLeave={() => setDragOverColumnId(null)}
                  onDrop={() => void handleDrop(column)}
                  className={
                    "flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-muted/30 p-3 transition-colors" +
                    (isOver
                      ? " border-primary bg-primary/5"
                      : " border-border")
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {column.name}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {cards.length}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Add task to ${column.name}`}
                      onClick={() => setCreateForColumn(column)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {cards.map((card) => (
                      <TaskCard
                        key={card.id}
                        card={card}
                        draggable
                        onDragStart={() => setDraggingCardId(card.id)}
                        onDragEnd={() => setDraggingCardId(null)}
                        onClick={() => setDetailsCard(card)}
                      />
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="mt-1 w-full justify-center gap-2 border border-dashed border-border text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setCreateForColumn(column)}
                  >
                    <Plus className="size-4" />
                    Add Task
                  </Button>
                </div>
              );
            })}

          {/* Add Column — visual; column create is wired via API but no inline
              composer yet. TODO(BE)/TODO(FE): inline column composer. */}
          <button
            type="button"
            disabled
            className="flex h-fit w-72 shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"
          >
            <Plus className="size-4" />
            Add Column
          </button>
        </div>
      )}

      {/* Create Task drawer */}
      <CreateTaskDrawer
        workspaceId={workspaceId}
        boardId={boardId}
        column={createForColumn}
        columns={columns}
        open={Boolean(createForColumn)}
        onOpenChange={(open) => !open && setCreateForColumn(null)}
        onCreated={refetch}
      />

      {/* Task details */}
      <TaskDetailsDialog
        workspaceId={workspaceId}
        boardId={boardId}
        card={detailsCard}
        open={Boolean(detailsCard)}
        onOpenChange={(open) => !open && setDetailsCard(null)}
      />
    </div>
  );
}

function findCard(
  cardsByColumn: Record<string, Card[]>,
  cardId: string,
): Card | undefined {
  for (const list of Object.values(cardsByColumn)) {
    const found = list.find((c) => c.id === cardId);
    if (found) return found;
  }
  return undefined;
}

function BoardSkeleton() {
  return (
    <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function EmptyBoard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <KanbanSquare className="size-7 text-muted-foreground/70" />
      </div>
      <p className="text-base font-medium text-foreground">No columns yet</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This board has no columns. Columns and tasks will appear here once the
        board service is connected.
      </p>
      {/* TODO(BE): gateway board/column/card REST not implemented yet. */}
    </div>
  );
}
