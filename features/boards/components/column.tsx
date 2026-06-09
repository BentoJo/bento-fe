"use client";

import { AlertCircle, CheckCircle2, Plus } from "lucide-react";

import type { Card, Column as ColumnType } from "@/features/boards/types/board";
import { TaskCard } from "@/features/boards/components/task-card";
import { Button } from "@/shared/components/ui/button";

interface ColumnProps {
  column: ColumnType;
  cards: Card[];
  workspaceId: string;
  boardId: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (column: ColumnType) => void;
  onDragStartCard: (cardId: string) => void;
  onDragEndCard: () => void;
  onCardClick: (card: Card) => void;
  onAddTaskClick: (column: ColumnType) => void;
}

export default function Column({
  column,
  cards,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStartCard,
  onDragEndCard,
  onCardClick,
  onAddTaskClick,
}: ColumnProps) {
  // Select icon based on column name
  const getColumnIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("backlog")) {
      return <AlertCircle className="size-4 text-muted-foreground" />;
    }
    if (lower.includes("completed") || lower.includes("done")) {
      return <CheckCircle2 className="size-4 text-success" />;
    }
    return null;
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(column)}
      className={
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors" +
        (isDragOver ? " border-primary bg-primary/5" : " border-border")
      }
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-1">
          {getColumnIcon(column.name)}
          <span className="text-sm font-semibold text-foreground">
            {column.name}
          </span>
          <span className="text-xs text-muted-foreground">
            ({cards.length})
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add task to ${column.name}`}
          onClick={() => onAddTaskClick(column)}
          className="border-gray cursor-pointer"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <hr className="border-t border-border" />

      {/* Cards List */}
      {cards.length > 0 ? (
        <div className="flex flex-col space-y-3 p-3 overflow-y-auto max-h-[calc(100vh-280px)] px-1.5">
          {cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              draggable
              onDragStart={() => onDragStartCard(card.id)}
              onDragEnd={onDragEndCard}
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      ) : (
        <></>
      )}

      {/* Bottom Add Task Button */}
      <div className="px-3 pb-3">
        <Button
          variant="ghost"
          className="mt-1 cursor-pointer bg-blue-100! text-[#2563EB]! font-bold w-full justify-center gap-2 hover:bg-[#2563EB] border-border text-sm"
          onClick={() => onAddTaskClick(column)}
        >
          <Plus className="size-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
}
