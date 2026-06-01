"use client";

import { Controller, useForm } from "react-hook-form";
import {
  LayoutGrid,
  Loader2,
  Plus,
  Star,
  Upload,
  Users,
} from "lucide-react";

import {
  createWorkspaceSchema,
  type CreateWorkspaceValues,
} from "@/features/workspace/validation/create-workspace";
import { useCreateWorkspace } from "@/features/workspace/hooks/use-create-workspace";
import type { WorkspaceResponse } from "@/shared/types/workspace";
import { cn } from "@/shared/lib/utils";
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
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (workspace: WorkspaceResponse) => void;
}

const SOON = "Coming soon";

// TODO(BE): icon-set picker is not supported yet — these are display-only tiles.
const ICON_TILE_COUNT = 5;

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const { create, isSubmitting } = useCreateWorkspace();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
  } = useForm<CreateWorkspaceValues>({
    defaultValues: { name: "", logoUrl: "" },
  });

  // Live preview source — updates as the user types the name.
  const nameValue = watch("name");
  const previewName = nameValue?.trim() ? nameValue.trim() : "New Workspace";

  // @hookform/resolvers is NOT installed in this project, so we validate
  // manually with zod's safeParse inside the submit handler (matches the
  // existing auth forms, which use plain react-hook-form without a resolver).
  const onSubmit = handleSubmit(async (values) => {
    const parsed = createWorkspaceSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path === "name" || path === "logoUrl") {
          setError(path, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    const logoUrl = parsed.data.logoUrl?.trim();
    const workspace = await create({
      name: parsed.data.name,
      ...(logoUrl ? { logoUrl } : {}),
    });

    if (workspace) {
      reset({ name: "", logoUrl: "" });
      onOpenChange(false);
      onCreated?.(workspace);
    }
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({ name: "", logoUrl: "" });
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Create New Workspace
          </DialogTitle>
          <DialogDescription>
            Set up a workspace to organize your team, tasks, and projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="grid gap-8 px-6 pb-2 md:grid-cols-[1.4fr_1fr]">
            {/* Left column — form fields */}
            <div className="flex flex-col gap-6">
              {/* Workspace Name (wired) */}
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ws-name">Workspace Name</FieldLabel>
                    <Input
                      {...field}
                      id="ws-name"
                      placeholder="e.g Design Team"
                      autoFocus
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                    {!fieldState.error && (
                      <FieldDescription>
                        This is the name of your workspace.
                      </FieldDescription>
                    )}
                  </Field>
                )}
              />

              {/* Workspace URL (disabled — TODO(BE): slug/URL not supported yet) */}
              <Field data-disabled>
                <FieldLabel className="flex items-center gap-2">
                  Workspace URL
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {SOON}
                  </span>
                </FieldLabel>
                <div className="flex w-full items-center overflow-hidden rounded-md border border-input opacity-60">
                  <span className="shrink-0 select-none bg-muted px-2.5 py-2 text-sm text-muted-foreground">
                    manejo.app/workspace/
                  </span>
                  <input
                    disabled
                    placeholder="e.g.design-team"
                    className="h-9 w-full min-w-0 bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <FieldDescription>
                  This will be your workspace URL.
                </FieldDescription>
              </Field>

              {/* Workspace Icon (disabled — TODO(BE): icon-set picker not supported yet) */}
              <Field data-disabled>
                <FieldLabel className="flex items-center gap-2">
                  Workspace Icon
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {SOON}
                  </span>
                </FieldLabel>
                <FieldDescription className="-mt-1">
                  Choose an icon that represents this Workspace.
                </FieldDescription>
                <div className="flex flex-wrap items-center gap-2 pt-1 opacity-60">
                  {Array.from({ length: ICON_TILE_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      aria-hidden
                      className={cn(
                        "flex size-10 items-center justify-center rounded-md border",
                        i === 0
                          ? "border-primary/50 bg-primary/5"
                          : "border-input",
                      )}
                    >
                      <LayoutGrid className="size-4 text-muted-foreground" />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                    className="h-10"
                  >
                    <Upload className="size-4" />
                    Upload New
                  </Button>
                </div>
              </Field>

              {/* Invite Members (disabled — TODO(BE): invites not supported yet) */}
              <Field data-disabled>
                <FieldLabel className="flex items-center gap-2">
                  Invite Members
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {SOON}
                  </span>
                </FieldLabel>
                <div className="flex items-center gap-2 pt-1 opacity-60">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      aria-hidden
                      className="size-8 rounded-full border border-input bg-muted"
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled
                    className="rounded-full"
                    aria-label="Add member"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </Field>
            </div>

            {/* Right column — live preview */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-foreground">
                Workspace Preview
              </span>
              <div className="relative rounded-lg border border-border bg-card p-4 shadow-xs">
                <Star className="absolute top-3 right-3 size-4 text-muted-foreground" />
                <div className="flex size-12 items-center justify-center rounded-md bg-primary/10">
                  <LayoutGrid className="size-6 text-primary" />
                </div>
                <p className="mt-3 truncate font-semibold text-foreground">
                  {previewName}
                </p>
                <p className="text-xs text-muted-foreground">Owner</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  <span>0 Members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
