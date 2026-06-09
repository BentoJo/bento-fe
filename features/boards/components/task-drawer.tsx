"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createCard, updateCard } from "@/features/boards/api/cards";
import type {
  Card,
  CardPriority,
  Column,
  CreateCardRequest,
  UpdateCardRequest,
} from "@/features/boards/types/board";
import {
  taskSchema,
  type TaskFormValues,
} from "@/features/boards/validation/board";
import { getErrorMessage } from "@/shared/types/api/errors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import LabelIcon from "@/shared/components/svgs/Label";

interface TaskDrawerProps {
  workspaceId: string;
  boardId: string;
  column: Column | null;
  columns: Column[];
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode?: "create" | "edit";
  cardToEdit?: Card | null;

  onCreated?: () => void;
  onUpdated?: () => void;
}

const RECURRING_OPTIONS = ["None", "Daily", "Weekly", "Monthly"];

const PRIORITY_STYLES: Record<CardPriority, string> = {
  low: "bg-success/10 border-[#89D3A0] text-[#008447]",
  medium: "bg-warning/10 border-[#FFD78D] text-[#F54900]",
  high: "bg-destructive/10 border-[#FF8B7C] text-[#B30909]",
};

const PRIORITY_LABEL: Record<CardPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_BASE_STYLE =
  "bg-transparent border border-border text-foreground hover:bg-muted/40";

function emptyValues(statusId?: string): TaskFormValues {
  return {
    title: "",
    descriptionText: "",
    status: statusId ?? "",
    isPrivate: false,
    priority: "medium",
    recurring: "None",
    startDate: "",
    dueDate: "",
  };
}

export function TaskDrawer({
  workspaceId,
  boardId,
  column,
  columns,
  open,
  onOpenChange,
  mode = "create",
  cardToEdit = null,
  onCreated,
  onUpdated,
}: TaskDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setError } = useForm<TaskFormValues>({
    defaultValues: emptyValues(),
  });

  // Populate form when opening in either mode
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && cardToEdit) {
      reset({
        title: cardToEdit.title ?? "",
        descriptionText: cardToEdit.description ?? "",
        status: cardToEdit.columnId ?? "",
        isPrivate: cardToEdit.isPrivate ?? false,
        priority: cardToEdit.priority ?? "medium",
        recurring: "None",
        startDate: cardToEdit.startDate ?? "",
        dueDate: cardToEdit.dueDate ?? "",
      });
    } else {
      reset(emptyValues(column?.id));
    }
  }, [open, mode, cardToEdit, column, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = taskSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (
          path === "title" ||
          path === "description" ||
          path === "isPrivate"
        ) {
          setError(path as keyof TaskFormValues, {
            type: "manual",
            message: issue.message,
          });
        }
      }
      return;
    }

    const columnId = parsed.data.status || column?.id;
    if (!columnId) {
      toast.error("Pick a status / column for this task.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "edit" && cardToEdit) {
        const body: UpdateCardRequest = {
          columnId,
          title: parsed.data.title,
          descriptionText: parsed.data.descriptionText?.trim() || undefined,
          isPrivate: parsed.data.isPrivate,
          priority: parsed.data.priority,
          startDate: parsed.data.startDate || undefined,
          dueDate: parsed.data.dueDate || undefined,
        };

        await updateCard(workspaceId, boardId, cardToEdit.id, body);
        toast.success(`Task "${parsed.data.title}" updated.`);
        onUpdated?.();
      } else {
        const body: CreateCardRequest = {
          columnId,
          title: parsed.data.title,
          ...(parsed.data.descriptionText?.trim()
            ? { description: parsed.data.descriptionText.trim() }
            : {}),
          isPrivate: parsed.data.isPrivate,
          priority: parsed.data.priority,
          ...(parsed.data.startDate ? { startDate: parsed.data.startDate } : {}),
          ...(parsed.data.dueDate ? { dueDate: parsed.data.dueDate } : {}),
        };

        await createCard(workspaceId, boardId, body);
        toast.success(`Task "${parsed.data.title}" created.`);
        onCreated?.();
      }

      reset(emptyValues());
      onOpenChange(false);
    } catch (err) {
      toast.error(
        getErrorMessage(err) ||
          (mode === "edit" ? "Failed to update task." : "Failed to create task."),
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const isEditing = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          fixed
          bottom-3
          right-3
          left-auto
          top-auto
          translate-x-0
          translate-y-0
          w-full
          max-w-md
          max-h-[calc(100vh-10rem)]
          overflow-y-auto
          flex flex-col
          rounded-2xl
          p-0
          gap-0
          data-[state=open]:slide-in-from-bottom-2
          data-[state=closed]:slide-out-to-bottom-2
        "
      >
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClipboardList className="size-8 bg-primary/10 p-2 rounded-sm text-primary" />
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 p-5">
          <p className="text-sm font-semibold text-foreground">
            General Information
          </p>

          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="task-title">Task Title</FieldLabel>
                <Input
                  {...field}
                  id="task-title"
                  placeholder="e.g. Redesign Landing Page"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="descriptionText"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="task-description">Description</FieldLabel>
                <Textarea
                  {...field}
                  id="task-description"
                  placeholder="Provide details about this task..."
                  rows={4}
                  aria-invalid={fieldState.invalid}
                  className="min-h-70"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <LabelIcon className="size-5" />
            Task Properties
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Status = column */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No columns
                        </SelectItem>
                      ) : (
                        columns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* Recurring — visual; not wired. TODO(BE). */}
            <Controller
              name="recurring"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Recurring (Optional)</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRING_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          {/* Visibility toggle */}
          <Controller
            name="isPrivate"
            control={control}
            render={({ field }) => {
              const options = [
                { value: false, label: "Public" },
                { value: true, label: "Private" },
              ] as const;

              return (
                <Field>
                  <FieldLabel>Visibility</FieldLabel>

                  <div className="grid grid-cols-2 gap-2">
                    {options.map((opt) => {
                      const isActive = field.value === opt.value;

                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors",
                            isActive
                              ? opt.value
                                ? "border-destructive bg-destructive/10 text-destructive"
                                : "border-success bg-success/10 text-success"
                              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40",
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              );
            }}
          />

          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-start">
                  Start Date (Optional)
                </FieldLabel>
                <Input
                  {...field}
                  id="task-start"
                  type="date"
                  className="border border-[#E2EBF6] rounded-lg p-4 h-12"
                />
              </Field>
            )}
          />
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="task-due">Due Date</FieldLabel>
                <Input
                  {...field}
                  id="task-due"
                  type="date"
                  className="border border-[#E2EBF6] rounded-lg p-4 h-12"
                />
              </Field>
            )}
          />
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Priority</FieldLabel>

                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((v) => {
                    const isActive = field.value === v;

                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => field.onChange(v)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm cursor-pointer font-semibold capitalize transition-colors",
                          isActive ? PRIORITY_STYLES[v] : PRIORITY_BASE_STYLE,
                        )}
                      >
                        {PRIORITY_LABEL[v]}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}
          />
          <div className="sticky bottom-0 -mx-5 mt-2 flex justify-end gap-3 border-t border-border bg-popover px-5 py-4">
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
                  {isEditing ? "Saving..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
