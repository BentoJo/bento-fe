"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Globe,
  KanbanSquare,
  Loader2,
  Lock,
  Plus,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { createBoard } from "@/features/boards/api/boards";
import type { CreateBoardRequest } from "@/features/boards/types/board";
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

  const { control, handleSubmit, watch, reset, setError } =
    useForm<BoardFormValues>({ defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

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
      visibility: parsed.data.isPrivate ? "private" : "public",
      ...(icon ? { icon } : {}),
    };

    setIsSubmitting(true);
    try {
      await createBoard(workspaceId, body);
      toast.success(`Board "${parsed.data.name}" created.`);
      reset(EMPTY);
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      // TODO(BE): gateway board create not implemented yet.
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

            {/* Invite Members — disabled "soon". */}
            <Field>
              <FieldLabel>Invite Members</FieldLabel>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="size-8 rounded-full border-2 border-background bg-muted"
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Invite members (coming soon)"
                  disabled
                >
                  <Plus className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground">Soon</span>
              </div>
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
