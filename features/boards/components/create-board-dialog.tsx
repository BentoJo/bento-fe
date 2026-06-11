"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Globe,
  KanbanSquare,
  Loader2,
  Lock,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { createBoard } from "@/features/boards/api/boards";
import { addBoardMember } from "@/features/boards/api/board-members";
import { listMembers } from "@/features/members/api/members";
import type { WorkspaceMember } from "@/features/members/types/member";
import type { CreateBoardRequest } from "@/features/boards/types/board";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { userFullName, userInitials } from "@/shared/lib/user";
import {
  boardSchema,
  type BoardFormValues,
} from "@/features/boards/validation/board";
import { getErrorMessage } from "@/shared/types/api/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { cn } from "@/shared/lib/utils";

interface CreateBoardDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const ICON_CHOICES = ["📋", "🗂️", "🚀", "🎯", "🧩", "📌"];

const EMPTY: BoardFormValues = { name: "", isPrivate: true, icon: "" };

export function CreateBoardDialog({
  workspaceId,
  open,
  onOpenChange,
  onCreated,
}: CreateBoardDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workspace members available to add to the new board.
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [pickedUserIds, setPickedUserIds] = useState<string[]>([]);

  const { control, handleSubmit, watch, reset, setError } =
    useForm<BoardFormValues>({ defaultValues: EMPTY });

  const loadMembers = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await listMembers(workspaceId, { page: 1, limit: 100 });
      setMembers(Array.isArray(res?.members) ? res.members : []);
    } catch {
      setMembers([]);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (open) {
      reset(EMPTY);
      setPickedUserIds([]);
      setMemberSearch("");
      void loadMembers();
    }
  }, [open, reset, loadMembers]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [userFullName(m.user ?? { id: m.userId }), m.user?.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [members, memberSearch]);

  const nameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      map.set(m.userId, userFullName(m.user ?? { id: m.userId }));
    }
    return map;
  }, [members]);

  const toggleMember = (userId: string) =>
    setPickedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );

  const nameValue = watch("name");
  const iconValue = watch("icon");
  const isPrivate = watch("isPrivate");
  const previewName = nameValue?.trim() ? nameValue.trim() : "New Board";

  const onSubmit = handleSubmit(async (values) => {
    const parsed = boardSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path === "name" || path === "icon") {
          setError(path, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    const icon = parsed.data.icon?.trim();
    const body: CreateBoardRequest = {
      name: parsed.data.name,
      isPrivate: parsed.data.isPrivate,
      ...(icon ? { icon } : {}),
    };

    setIsSubmitting(true);
    try {
      const board = await createBoard(workspaceId, body);

      // Add the picked workspace members to the freshly created board.
      // Best-effort: the board already exists, so a member failure shouldn't
      // discard it — surface a partial warning instead.
      let failedMembers = 0;
      if (pickedUserIds.length > 0 && board?.id) {
        const results = await Promise.allSettled(
          pickedUserIds.map((userId) =>
            addBoardMember(workspaceId, board.id, userId),
          ),
        );
        failedMembers = results.filter((r) => r.status === "rejected").length;
      }

      if (failedMembers > 0) {
        toast.warning(
          `Board created, but ${failedMembers} member(s) could not be added.`,
        );
      } else {
        toast.success(`Board "${parsed.data.name}" created.`);
      }

      reset(EMPTY);
      setPickedUserIds([]);
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to create board.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Create New Board
          </DialogTitle>
          <DialogDescription>
            Set up the details for your new board.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-6 p-5 md:grid-cols-[1fr_280px]"
        >
          {/* Left: form */}
          <div className="flex flex-col gap-5">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="board-name">Board Name</FieldLabel>
                  <Input
                    {...field}
                    id="board-name"
                    placeholder="e.g. Design Team"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Visibility */}
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Visibility</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <VisibilityOption
                      active={field.value === true}
                      onClick={() => field.onChange(true)}
                      icon={<Lock className="size-4" />}
                      title="Private"
                      desc="Only invited members can view this board"
                    />
                    <VisibilityOption
                      active={field.value === false}
                      onClick={() => field.onChange(false)}
                      icon={<Globe className="size-4" />}
                      title="Public"
                      desc="Any workspace member can view this board"
                    />
                  </div>
                </Field>
              )}
            />

            {/* Board Icon */}
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Board Icon</FieldLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    {ICON_CHOICES.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => field.onChange(ic)}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-lg border text-lg transition-colors",
                          field.value === ic
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted",
                        )}
                      >
                        {ic}
                      </button>
                    ))}
                    {/* Upload coming soon. TODO(BE): board icon upload. */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled
                    >
                      <Plus className="size-4" />
                      Upload New
                    </Button>
                  </div>
                </Field>
              )}
            />

            {/* Add Members — pick workspace members to add on creation. */}
            <Field>
              <FieldLabel>Add Members</FieldLabel>

              {pickedUserIds.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {pickedUserIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-foreground"
                    >
                      {nameByUserId.get(id) ?? id.slice(0, 8)}
                      <button
                        type="button"
                        onClick={() => toggleMember(id)}
                        aria-label={`Remove ${nameByUserId.get(id) ?? id}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search workspace members..."
                  className="pl-9"
                />
              </div>

              <ScrollArea className="max-h-40 rounded-lg border border-border">
                {filteredMembers.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-muted-foreground">
                    No workspace members found.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1 p-1">
                    {filteredMembers.map((m) => {
                      const active = pickedUserIds.includes(m.userId);
                      return (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => toggleMember(m.userId)}
                            className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Avatar className="size-7">
                                {m.user?.avatarUrl && (
                                  <AvatarImage
                                    src={m.user.avatarUrl}
                                    alt={userFullName(m.user)}
                                  />
                                )}
                                <AvatarFallback className="text-[10px]">
                                  {userInitials(m.user ?? { id: m.userId })}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex min-w-0 flex-col">
                                <span className="truncate text-sm text-foreground">
                                  {userFullName(m.user ?? { id: m.userId })}
                                </span>
                                {m.user?.email && (
                                  <span className="truncate text-xs text-muted-foreground">
                                    {m.user.email}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "flex size-6 items-center justify-center rounded-full border",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-muted-foreground",
                              )}
                            >
                              <Plus className="size-3.5" />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </ScrollArea>
            </Field>
          </div>

          {/* Right: live preview */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Board Preview</p>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-base">
                    {iconValue?.trim() ? (
                      <span aria-hidden>{iconValue.trim()}</span>
                    ) : (
                      <KanbanSquare className="size-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {previewName}
                    </p>
                    <span className="text-[11px] text-primary">
                      {isPrivate ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
                <Star className="size-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Created by you</p>
                <p>Created just now</p>
              </div>
            </div>
          </div>

          {/* Footer spanning full width */}
          <div className="flex justify-end gap-3 border-t border-border pt-4 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Board"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VisibilityOption({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          active ? "text-primary" : "text-foreground",
        )}
      >
        {icon}
        {title}
      </span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}
