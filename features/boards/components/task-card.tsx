"use client";

import { CalendarDays, MessageSquare, Paperclip } from "lucide-react";

import type { Card, CardPriority } from "@/features/boards/types/board";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";

interface TaskCardProps {
  card: Card;
  onClick?: () => void;
  /** Native HTML5 drag start — wired by the board for cross-column moves. */
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

const PRIORITY_STYLES: Record<CardPriority, string> = {
  low: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

const PRIORITY_LABEL: Record<CardPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function formatDate(value?: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(userId: string): string {
  return userId.slice(0, 2).toUpperCase();
}

export function TaskCard({
  card,
  onClick,
  onDragStart,
  onDragEnd,
  draggable,
}: TaskCardProps) {
  const priority = card.priority;
  const due = formatDate(card.dueDate);
  const progress =
    typeof card.progress === "number"
      ? Math.max(0, Math.min(100, card.progress))
      : null;
  const assignees = card.assignees ?? [];
  const labels = card.labels ?? [];

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="flex cursor-pointer flex-col gap-2.5 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {/* Top row: priority pill + due date */}
      <div className="flex items-center justify-between gap-2">
        {priority ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
              PRIORITY_STYLES[priority],
            )}
          >
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
            {PRIORITY_LABEL[priority]}
          </span>
        ) : (
          <span />
        )}
        {due ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {due}
          </span>
        ) : null}
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-card-foreground">
          {card.title}
        </p>
        {card.description ? (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {card.description}
          </p>
        ) : null}
      </div>

      {/* Labels */}
      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {labels.map((label) => (
            <span
              key={label.id}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={
                label.color
                  ? { backgroundColor: `${label.color}1a`, color: label.color }
                  : undefined
              }
            >
              {label.name}
            </span>
          ))}
        </div>
      ) : null}

      {/* Progress bar */}
      {progress !== null ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{progress === 100 ? "Progress" : "Pending"}</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* Footer: avatars + counts */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {assignees.length > 0 ? (
          <AvatarGroup>
            {assignees.slice(0, 3).map((a) => (
              <Avatar key={a.userId} className="size-6 border border-background">
                <AvatarFallback className="text-[10px]">
                  {initials(a.userId)}
                </AvatarFallback>
              </Avatar>
            ))}
            {assignees.length > 3 ? (
              <AvatarGroupCount className="size-6 text-[10px]">
                +{assignees.length - 3}
              </AvatarGroupCount>
            ) : null}
          </AvatarGroup>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {typeof card.commentsCount === "number" ? (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {card.commentsCount}
            </span>
          ) : null}
          {typeof card.attachmentsCount === "number" ? (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="size-3.5" />
              {card.attachmentsCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
