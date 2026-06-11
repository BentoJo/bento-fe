"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { Card, Column as ColumnType } from "@/features/boards/types/board";
import Column from "@/features/boards/components/column";
import { useColumnActions } from "@/features/boards/hooks/use-column";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface ColumnsListProps {
  workspaceId: string;
  boardId: string;
  columns: ColumnType[];
  cardsByColumn: Record<string, Card[]>;
  refetch: () => void;
  onCardClick: (card: Card) => void;
  /** Called after a new card is created inline — opens the details dialog. */
  onCardCreated: (card: Card) => void;
  onDragStartCard: (cardId: string) => void;
  onDragEndCard: () => void;
  dragOverColumnId: string | null;
  setDragOverColumnId: (columnId: string | null) => void;
  handleDrop: (column: ColumnType) => void;
}

export function ColumnsList({
  workspaceId,
  boardId,
  columns,
  cardsByColumn,
  refetch,
  onCardClick,
  onCardCreated,
  onDragStartCard,
  onDragEndCard,
  dragOverColumnId,
  setDragOverColumnId,
  handleDrop,
}: ColumnsListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const { createColumn, isSubmitting } = useColumnActions(
    workspaceId,
    boardId,
    refetch,
  );

  const handleCreate = async () => {
    if (!newColumnName.trim()) return;
    const position = columns.length + 1;
    const col = await createColumn({
      name: newColumnName.trim(),
      position,
    });
    if (col) {
      setNewColumnName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto pb-4 items-start">
      {columns
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((column) => {
          const cards = cardsByColumn[column.id] ?? [];
          const isOver = dragOverColumnId === column.id;
          return (
            <Column
              key={column.id}
              column={column}
              cards={cards}
              workspaceId={workspaceId}
              boardId={boardId}
              isDragOver={isOver}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumnId(column.id);
              }}
              onDragLeave={() => setDragOverColumnId(null)}
              onDrop={handleDrop}
              onDragStartCard={onDragStartCard}
              onDragEndCard={onDragEndCard}
              onCardClick={onCardClick}
              onCardCreated={(card) => {
                refetch();
                onCardCreated(card);
              }}
            />
          );
        })}

      {/* Add Column Button / Composer */}
      {isCreating ? (
        <div className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <Input
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="Enter column name..."
            autoFocus
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
              if (e.key === "Escape") setIsCreating(false);
            }}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Column"}
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
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex h-fit w-72 shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:bg-muted/30 cursor-pointer transition-colors"
        >
          <Plus className="size-4" />
          Add Column
        </button>
      )}
    </div>
  );
}
