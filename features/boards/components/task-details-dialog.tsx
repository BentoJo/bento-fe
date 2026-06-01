"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  Flag,
  Paperclip,
  Send,
  Square,
  Tag,
  User,
} from "lucide-react";

import type { Card, CardPriority } from "@/features/boards/types/board";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";

interface TaskDetailsDialogProps {
  workspaceId: string;
  boardId: string;
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIORITY_LABEL: Record<CardPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(userId: string): string {
  return userId.slice(0, 2).toUpperCase();
}

export function TaskDetailsDialog({
  card,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  const [comment, setComment] = useState("");

  if (!card) return null;

  const done = card.checklistDone ?? 0;
  const total = card.checklistTotal ?? 0;
  const checklistPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const labels = card.labels ?? [];
  const assignees = card.assignees ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="flex flex-row items-center gap-2 border-b border-border p-5">
          {card.status ? (
            <Badge variant="secondary" className="font-normal">
              {card.status}
            </Badge>
          ) : null}
          <DialogTitle className="text-lg font-semibold text-foreground">
            {card.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_280px]">
          {/* Left: description, checklist, comments */}
          <div className="flex flex-col gap-5 p-5">
            {card.description ? (
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            ) : null}

            {/* Checklist */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Checklists{" "}
                  <span className="text-muted-foreground">
                    {done}/{total}
                  </span>
                </h3>
                <span className="text-xs text-muted-foreground">
                  {checklistPct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
              {total === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No checklist items.
                </p>
              ) : (
                // Items themselves are not exposed by the list payload yet;
                // we render the summary. TODO(BE): include checklist items.
                <p className="text-xs text-muted-foreground">
                  {done} of {total} items complete.
                </p>
              )}
              {/* Toggle is present but no-op until backend is wired. */}
              <button
                type="button"
                disabled
                className="flex w-fit items-center gap-2 text-xs text-muted-foreground"
              >
                <Square className="size-4" />
                Add an item (soon)
              </button>
            </section>

            <Separator />

            {/* Comments */}
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Comments
              </h3>
              <p className="text-xs text-muted-foreground">
                {typeof card.commentsCount === "number"
                  ? `${card.commentsCount} comment${card.commentsCount === 1 ? "" : "s"}.`
                  : "No comments yet."}
              </p>
              {/* TODO(BE): comments endpoint not wired — the box is a no-op. */}
              <div className="flex items-center gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  disabled
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled
                  aria-label="Send comment"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </section>
          </div>

          {/* Right: meta */}
          <aside className="flex flex-col gap-4 border-t border-border p-5 md:border-t-0 md:border-l">
            <MetaRow icon={<Tag className="size-4" />} label="Labels">
              {labels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {labels.map((l) => (
                    <span
                      key={l.id}
                      className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                      style={
                        l.color
                          ? { backgroundColor: `${l.color}1a`, color: l.color }
                          : undefined
                      }
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )}
            </MetaRow>

            <MetaRow icon={<User className="size-4" />} label="Assignee">
              {assignees.length > 0 ? (
                <div className="flex -space-x-2">
                  {assignees.slice(0, 4).map((a) => (
                    <Avatar
                      key={a.userId}
                      className="size-6 border border-background"
                    >
                      <AvatarFallback className="text-[10px]">
                        {initials(a.userId)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
            </MetaRow>

            <MetaRow icon={<Flag className="size-4" />} label="Priority">
              <span className="text-sm text-foreground">
                {card.priority ? PRIORITY_LABEL[card.priority] : "—"}
              </span>
            </MetaRow>

            <MetaRow icon={<CalendarDays className="size-4" />} label="Start">
              <span className="text-sm text-foreground">
                {formatDate(card.startDate)}
              </span>
            </MetaRow>

            <MetaRow icon={<CalendarDays className="size-4" />} label="Due">
              <span className="text-sm text-foreground">
                {formatDate(card.dueDate)}
              </span>
            </MetaRow>

            <MetaRow
              icon={<Paperclip className="size-4" />}
              label="Attachments"
            >
              <span className="text-sm text-foreground">
                {typeof card.attachmentsCount === "number"
                  ? card.attachmentsCount
                  : 0}
              </span>
            </MetaRow>

            <MetaRow icon={<CheckSquare className="size-4" />} label="Sprint">
              {/* TODO(BE): sprint not exposed in card payload yet. */}
              <span className="text-sm text-muted-foreground">—</span>
            </MetaRow>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium text-muted-foreground",
        )}
      >
        {icon}
        {label}
      </span>
      <div className="text-right">{children}</div>
    </div>
  );
}
