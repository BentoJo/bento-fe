"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronRight,
  Columns3,
  Eye,
  Filter,
  KanbanSquare,
  ListFilter,
  Plus,
} from "lucide-react";

import { useBoard } from "@/features/boards/hooks/use-board";
import { useCardActions } from "@/features/boards/hooks/use-card";
import { useColumnActions } from "@/features/boards/hooks/use-column";
import type { Card, Column } from "@/features/boards/types/board";
import { CreateTaskDrawer } from "@/features/boards/components/create-task-drawer";
import { TaskDetailsDialog } from "@/features/boards/components/task-details-dialog";
import { ColumnsList } from "@/features/boards/components/columns-list";
import { ManageColumnsDialog } from "@/features/boards/components/manage-columns-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  const { moveCard: moveCardAction } = useCardActions(workspaceId, boardId, refetch);

  const boardName = board?.name ?? "Board";

  // Native HTML5 DnD: move a card to a new column.
  const handleDrop = async (targetColumn: Column) => {
    const cardId = draggingCardId;
    setDraggingCardId(null);
    setDragOverColumnId(null);
    if (!cardId) return;

    const card = findCard(cardsByColumn, cardId);
    if (!card || card.columnId === targetColumn.id) return;

    const position = (cardsByColumn[targetColumn.id]?.length ?? 0) + 1;
    await moveCardAction(cardId, {
      columnId: targetColumn.id,
      position,
    });
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
                {board?.isPrivate === true ? "Private board" : "Public board"}
              </p>
            </div>
          </div>

          {/* Header actions */}
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
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer"
              onClick={() => setManageColumnsOpen(true)}
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
        <EmptyBoard
          workspaceId={workspaceId}
          boardId={boardId}
          refetch={refetch}
        />
      ) : (
        <ColumnsList
          workspaceId={workspaceId}
          boardId={boardId}
          columns={columns}
          cardsByColumn={cardsByColumn}
          refetch={refetch}
          onCardClick={(card) => setDetailsCard(card)}
          onAddTaskClick={(col) => setCreateForColumn(col)}
          onDragStartCard={(cardId) => setDraggingCardId(cardId)}
          onDragEndCard={() => setDraggingCardId(null)}
          dragOverColumnId={dragOverColumnId}
          setDragOverColumnId={setDragOverColumnId}
          handleDrop={handleDrop}
        />
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

      {/* Manage Columns Dialog */}
      <ManageColumnsDialog
        workspaceId={workspaceId}
        boardId={boardId}
        columns={columns}
        open={manageColumnsOpen}
        onOpenChange={setManageColumnsOpen}
        refetch={refetch}
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

function EmptyBoard({
  workspaceId,
  boardId,
  refetch,
}: {
  workspaceId: string;
  boardId: string;
  refetch: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const { createColumn, isSubmitting } = useColumnActions(workspaceId, boardId, refetch);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const col = await createColumn({ name: name.trim(), position: 1 });
    if (col) {
      setName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <KanbanSquare className="size-7 text-muted-foreground/70" />
      </div>
      <p className="text-base font-medium text-foreground">No columns yet</p>
      <p className="max-w-sm text-sm text-muted-foreground mb-2">
        Get started by creating a column (e.g., &quot;To Do&quot;, &quot;In Progress&quot;, &quot;Completed&quot;).
      </p>
      {isCreating ? (
        <div className="flex items-center gap-2 max-w-xs">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Column name..."
            className="h-9"
            autoFocus
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
              if (e.key === "Escape") setIsCreating(false);
            }}
          />
          <Button size="sm" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="size-4" />
          Create Column
        </Button>
      )}
    </div>
  );
}
