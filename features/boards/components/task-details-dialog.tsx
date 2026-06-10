"use client";
import { useState } from "react";
import {
  CalendarDays,
  CheckSquare,
  Edit,
  Flag,
  Paperclip,
  Send,
  Square,
  Tag,
  User,
  Trash2,
  Archive,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

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
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import ThreeDotsIcon from "@/shared/components/svgs/ThreeDots";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { archiveCard } from "@/features/boards/api/cards";
import { useCardActions } from "../hooks/use-card";

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
  workspaceId,
  boardId,
  card,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  const [comment, setComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isWatching, setIsWatching] = useState(false); // Initialized locally as requested

  // Hook instance for handling delete
  const { deleteCard, isSubmitting } = useCardActions(
    workspaceId,
    boardId,
    () => {
      onOpenChange(false); // Close parent task details on successful deletion
    },
  );

  if (!card) return null;

  const done = card.checklistDone ?? 0;
  const total = card.checklistTotal ?? 0;
  const checklistPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const labels = card.labels ?? [];
  const assignees = card.assignees ?? [];

  // Action execution methods
  const handleDelete = async () => {
    const success = await deleteCard(card.id);
    if (success) {
      setShowDeleteConfirm(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveCard(workspaceId, boardId, card.id);
      toast.success("Task archived.");
      onOpenChange(false); // Close task dialog
    } catch (err) {
      toast.error("Failed to archive task." + err);
    }
  };

  const toggleWatch = () => {
    const nextState = !isWatching;
    setIsWatching(nextState);
    toast.success(
      nextState
        ? "You are now watching this task."
        : "Stopped watching this task.",
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85dvh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
          <DialogHeader
            actions={
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-0 cursor-pointer h-9 w-9 p-0"
                    >
                      <ThreeDotsIcon className="text-[#64748B]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={toggleWatch}
                      className="cursor-pointer gap-2"
                    >
                      {isWatching ? (
                        <>
                          <EyeOff className="size-4 text-muted-foreground" />
                          <span>Stop watching</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-4 text-muted-foreground" />
                          <span>Watch card</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleArchive}
                      className="cursor-pointer gap-2"
                    >
                      <Archive className="size-4 text-muted-foreground" />
                      <span>Archive card</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="destructive"
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive hover:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete card</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("open-edit-task", { detail: card }),
                    );
                  }}
                  className="border-0 cursor-pointer h-9 w-9 p-0"
                >
                  <Edit className="text-[#64748B] size-4" />
                </Button>
              </div>
            }
            className="flex flex-row items-center justify-between gap-2 border-b border-border p-5"
          >
            <div className="flex items-center gap-2">
              {card.status ? (
                <Badge variant="secondary" className="font-normal">
                  {card.status}
                </Badge>
              ) : null}

              <DialogTitle className="text-lg font-semibold text-foreground border px-3 rounded-md">
                {card.title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_280px]">
            {/* Left side column wrapper */}
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
                  <p className="text-xs text-muted-foreground">
                    {done} of {total} items complete.
                  </p>
                )}
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

            {/* Right side Metadata column */}
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
                            ? {
                                backgroundColor: `${l.color}1a`,
                                color: l.color,
                              }
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
                <span className="text-sm text-muted-foreground">—</span>
              </MetaRow>
            </aside>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation mini-Dialog Box */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md p-6 gap-1">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground my-2">
            Are you sure you want to delete this task? This action{" "}
            <span className="text-destructive font-bold">
              {" "}
              cannot be undone !
            </span>
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
