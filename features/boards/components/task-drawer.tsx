"use client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckSquare,
  Upload,
  Square,
} from "lucide-react";
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
import ColsManage from "@/shared/components/svgs/ColsManage";

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
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);

  const { control, handleSubmit, reset, setError } = useForm<TaskFormValues>({
    defaultValues: emptyValues(),
  });

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
          ...(parsed.data.startDate
            ? { startDate: parsed.data.startDate }
            : {}),
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
          (mode === "edit"
            ? "Failed to update task."
            : "Failed to create task."),
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
          max-h-[calc(100vh-5rem)]
          flex flex-col
          rounded-2xl
          p-0
          gap-0
          overflow-hidden
          data-[state=open]:slide-in-from-bottom-2
          data-[state=closed]:slide-out-to-bottom-2
        "
      >
        <DialogHeader className="border-b border-border p-5 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClipboardList className="size-8 bg-primary/10 p-2 rounded-sm text-primary" />
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Scrollable Form Body Container with Hidden Scrollbar */}
          <div
            className="
              flex-1 
              overflow-y-auto 
              p-5 
              flex 
              flex-col 
              gap-5
              scrollbar-none
              [&::-webkit-scrollbar]:hidden
            "
          >
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
                    className="border border-[#E2EBF6] rounded-lg p-4 h-12"
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
                  <FieldLabel htmlFor="task-description">
                    Description
                  </FieldLabel>
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

            <hr className="bg-[#E2EBF6]" />

            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <LabelIcon className="size-4" />
              Task Properties
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            {isEditing ? (
              <>
                <hr className="bg-[#E2EBF6]" />
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAdditionalOpen(!isAdditionalOpen)}
                    className="flex cursor-pointer items-center justify-between w-full text-sm font-semibold text-foreground hover:opacity-90 transition-opacity"
                  >
                    <span className="flex items-center gap-2">
                      <ColsManage className="size-4 text-foreground" />
                      Additional Details
                    </span>
                    {isAdditionalOpen ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </button>

                  {isAdditionalOpen && (
                    <div className="flex flex-col gap-6 pl-1 animate-in fade-in duration-200">
                      {/* Labels Sub-section */}
                      <div className="flex flex-col gap-2.5">
                        <p className="text-sm font-semibold text-foreground">
                          Labels
                        </p>
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* You can map over already associated card labels here */}
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Open Workspace Labels selection popover/modal
                              toast.info(
                                "Workspace labels selection coming soon!",
                              );
                            }}
                            className="inline-flex items-center gap-1 bg-[#E8F1FF] hover:bg-[#D4E6FF] text-[#1A73E8] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Plus className="size-3.5" />
                            Add Label
                          </button>
                        </div>
                      </div>

                      {/* Checklists Sub-section */}
                      <div className="flex flex-col gap-2.5">
                        <p className="text-sm font-semibold text-foreground">
                          Checklists
                        </p>
                        {isEditing ? (
                          <div className="flex flex-col gap-3">
                            {/* Interactive Edit Checklist UI */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg border border-dashed">
                              <CheckSquare className="size-4" />
                              <span className="font-medium text-foreground/80">
                                Checklist Title
                              </span>
                            </div>
                            <button
                              type="button"
                              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start pl-1"
                            >
                              <Square className="size-3.5" />
                              Add Checkbox
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
                            Checklists can be customized after the task has been
                            created.
                          </p>
                        )}
                      </div>

                      {/* Attachments Sub-section */}
                      <div className="flex flex-col gap-2.5">
                        <p className="text-sm font-semibold text-foreground">
                          Attachments
                        </p>
                        {isEditing ? (
                          <div className="border-2 border-dashed border-[#E2EBF6] rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 bg-background hover:bg-muted/10 transition-colors cursor-pointer group">
                            <input
                              type="file"
                              className="hidden"
                              id="file-upload"
                              multiple
                            />
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                Drag & drop images here
                              </p>
                              <p className="text-xs text-muted-foreground">
                                or click to browse
                              </p>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="mt-2 bg-[#E8F1FF] hover:bg-[#D4E6FF] text-[#1A73E8] gap-1.5 font-semibold shadow-none rounded-lg"
                                onClick={() =>
                                  document
                                    .getElementById("file-upload")
                                    ?.click()
                                }
                              >
                                <Upload className="size-3.5" />
                                Choose Files
                              </Button>
                              <p className="text-[11px] text-muted-foreground mt-2">
                                Supports: JPG, PNG, WebP (Max 5MB each)
                              </p>
                            </label>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
                            File uploads are available once the task is created.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <></>
            )}
          </div>

          {/* Locked Static Footer */}
          <div className="flex justify-end gap-3 border-t border-border bg-popover px-5 py-4 shrink-0">
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
