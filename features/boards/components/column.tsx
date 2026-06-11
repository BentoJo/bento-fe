"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import type { Card, Column as ColumnType } from "@/features/boards/types/board";
import { createCard } from "@/features/boards/api/cards";
import { TaskCard } from "@/features/boards/components/task-card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

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
  /** Called after a new card is created so parent can open details + refetch. */
  onCardCreated: (card: Card) => void;
}

export default function Column({
  column,
  cards,
  workspaceId,
  boardId,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStartCard,
  onDragEndCard,
  onCardClick,
  onCardCreated,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const openAdder = () => {
    setTitle("");
    setIsAdding(true);
    // focus on next tick after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelAdder = () => {
    setIsAdding(false);
    setTitle("");
  };

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      const card = await createCard(workspaceId, boardId, {
        columnId: column.id,
        title: trimmed,
      });
      setIsAdding(false);
      setTitle("");
      onCardCreated(card);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={openAdder}
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
      ) : null}

      {/* Inline title adder */}
      {isAdding ? (
        <div className="px-3 pb-3 pt-2 flex flex-col gap-2">
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="h-9"
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
              if (e.key === "Escape") cancelAdder();
            }}
          />
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80"
              onClick={() => void handleCreate()}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelAdder}
              disabled={isSubmitting}
              aria-label="Cancel"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className={`${cards.length > 0 ? "px-3 pb-3" : "p-3"}`}>
          <Button
            variant="ghost"
            className="mt-1 cursor-pointer bg-blue-100! text-[#2563EB]! font-bold w-full justify-center gap-2 hover:bg-[#2563EB] border-border text-sm"
            onClick={openAdder}
          >
            <Plus className="size-4" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}
