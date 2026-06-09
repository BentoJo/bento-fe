"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createCard } from "@/features/boards/api/cards";
import type { Column, CreateCardRequest } from "@/features/boards/types/board";
import {
  taskSchema,
  type TaskFormValues,
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

interface CreateTaskDrawerProps {
  workspaceId: string;
  boardId: string;
  /** The column the task is created in (its name preselects Status). */
  column: Column | null;
  columns: Column[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const RECURRING_OPTIONS = ["None", "Daily", "Weekly", "Monthly"];

function emptyValues(statusId?: string): TaskFormValues {
  return {
    title: "",
    description: "",
    status: statusId ?? "",
    visibility: "public",
    recurring: "None",
    startDate: "",
    dueDate: "",
  };
}

export function CreateTaskDrawer({
  workspaceId,
  boardId,
  column,
  columns,
  open,
  onOpenChange,
  onCreated,
}: CreateTaskDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setError } = useForm<TaskFormValues>({
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (open) reset(emptyValues(column?.id));
  }, [open, column, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = taskSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (
          path === "title" ||
          path === "description" ||
          path === "visibility"
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

    const body: CreateCardRequest = {
      columnId,
      title: parsed.data.title,
      ...(parsed.data.description?.trim()
        ? { description: parsed.data.description.trim() }
        : {}),
      visibility: parsed.data.visibility,
      ...(parsed.data.startDate ? { startDate: parsed.data.startDate } : {}),
      ...(parsed.data.dueDate ? { dueDate: parsed.data.dueDate } : {}),
    };

    setIsSubmitting(true);
    try {
      await createCard(workspaceId, boardId, body);
      toast.success(`Task "${parsed.data.title}" created.`);
      reset(emptyValues());
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      // TODO(BE): gateway card create not implemented yet.
      toast.error(getErrorMessage(err) || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  });

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

    data-[state=open]:slide-in-from-bottom-2
    data-[state=closed]:slide-out-to-bottom-2
  "
>
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClipboardList className="size-8 bg-primary/10 p-2 rounded-sm text-primary" />
            Create New Task
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
            name="description"
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

          <p className="text-sm font-semibold text-foreground">
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
            name="visibility"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Visibility</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(["public", "private"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => field.onChange(v)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                        field.value === v
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="task-start">
                    Start Date (Optional)
                  </FieldLabel>
                  <Input {...field} id="task-start" type="date" />
                </Field>
              )}
            />
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="task-due">Due Date</FieldLabel>
                  <Input {...field} id="task-due" type="date" />
                </Field>
              )}
            />
          </div>

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
                  Creating...
                </>
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
