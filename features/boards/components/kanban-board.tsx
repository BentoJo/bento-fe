"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";

import { useBoard } from "@/features/boards/hooks/use-board";
import { useColumnActions } from "@/features/boards/hooks/use-column";
import { useBoardStore } from "@/features/boards/store/board-store";
import type { Card, Column } from "@/features/boards/types/board";
import { TaskDrawer } from "@/features/boards/components/task-drawer";
import { TaskDetailsDialog } from "@/features/boards/components/task-details-dialog";
import { ColumnsList } from "@/features/boards/components/columns-list";
import { ManageColumnsDialog } from "@/features/boards/components/manage-columns-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input"; // used in EmptyBoard
import { Skeleton } from "@/shared/components/ui/skeleton";

interface KanbanBoardProps {
  workspaceId: string;
  boardId: string;
}

export function KanbanBoard({ workspaceId, boardId }: KanbanBoardProps) {
  const router = useRouter();
  const { board, columns, cardsByColumn, isLoading, error, refetch } = useBoard(
    workspaceId,
    boardId,
  );

  // Task 3: redirect to boards list if user is not a board member
  const redirectedRef = useRef(false);
  useEffect(() => {
    if (
      error &&
      !redirectedRef.current &&
      error.toLowerCase().includes("not a board member")
    ) {
      redirectedRef.current = true;
      toast.error("You are not a member of this board.");
      router.push(`/w/${workspaceId}/boards`);
    }
  }, [error, workspaceId, router]);

  const [detailsCard, setDetailsCard] = useState<Card | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [taskDrawer, setTaskDrawer] = useState<{
    open: boolean;
    mode: "create" | "edit";
    card: Card | null;
    column: Column | null;
  }>({ open: false, mode: "create", card: null, column: null });

  useEffect(() => {
    const handler = (e: CustomEvent<Card>) => {
      setTaskDrawer({ open: true, mode: "edit", card: e.detail, column: null });
    };
    window.addEventListener("open-edit-task", handler as EventListener);
    return () =>
      window.removeEventListener("open-edit-task", handler as EventListener);
  }, []);

  // Task 7: board store for optimistic DnD
  const { setBoardData, moveCardOptimistic, cardsByColumn: storeCardsByColumn } =
    useBoardStore();

  // Keep store in sync with server data after each load/refetch
  useEffect(() => {
    if (!isLoading && columns.length > 0) {
      setBoardData(workspaceId, boardId, columns, cardsByColumn);
    }
  }, [isLoading, columns, cardsByColumn, workspaceId, boardId, setBoardData]);

  // Use store-derived cardsByColumn for rendering (gives optimistic updates)
  const displayCardsByColumn =
    Object.keys(storeCardsByColumn).length > 0
      ? storeCardsByColumn
      : cardsByColumn;

  // Task 4: after inline card creation, refetch board and open details dialog
  const handleCardCreated = (card: Card) => {
    refetch();
    setDetailsCard(card);
  };

  const boardName = board?.name ?? "Board";

  const handleDrop = async (targetColumn: Column) => {
    const cardId = draggingCardId;
    setDraggingCardId(null);
    setDragOverColumnId(null);
    if (!cardId) return;

    const card = findCard(displayCardsByColumn, cardId);
    if (!card || card.columnId === targetColumn.id) return;

    const toIndex = displayCardsByColumn[targetColumn.id]?.length ?? 0;
    const ok = await moveCardOptimistic(cardId, targetColumn.id, toIndex);
    if (!ok) {
      toast.error("Failed to move task. Changes reverted.");
      refetch();
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
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <Eye className="size-4" />
              View All Sprints
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <Filter className="size-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
            >
              <ListFilter className="size-4" />
              Sort
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80 hover:text-white cursor-pointer"
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
          cardsByColumn={displayCardsByColumn}
          refetch={refetch}
          onCardClick={(card) => setDetailsCard(card)}
          onCardCreated={handleCardCreated}
          onDragStartCard={(cardId) => setDraggingCardId(cardId)}
          onDragEndCard={() => setDraggingCardId(null)}
          dragOverColumnId={dragOverColumnId}
          setDragOverColumnId={setDragOverColumnId}
          handleDrop={handleDrop}
        />
      )}

      {/* Edit Task drawer (create flow now handled inline in Column) */}
      <TaskDrawer
        mode={taskDrawer.mode}
        cardToEdit={taskDrawer.card}
        workspaceId={workspaceId}
        boardId={boardId}
        column={taskDrawer.column}
        columns={columns}
        open={taskDrawer.open}
        onOpenChange={(open) => {
          if (!open) {
            setTaskDrawer({ open: false, mode: "create", card: null, column: null });
          }
        }}
        onCreated={refetch}
        onUpdated={refetch}
      />

      {/* Task details */}
      <TaskDetailsDialog
        workspaceId={workspaceId}
        boardId={boardId}
        card={detailsCard}
        open={Boolean(detailsCard)}
        onOpenChange={(open) => !open && setDetailsCard(null)}
        onMutated={refetch}
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
  const { createColumn, isSubmitting } = useColumnActions(
    workspaceId,
    boardId,
    refetch,
  );

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
        Get started by creating a column (e.g., &quot;To Do&quot;, &quot;In
        Progress&quot;, &quot;Completed&quot;).
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(false)}
            disabled={isSubmitting}
          >
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