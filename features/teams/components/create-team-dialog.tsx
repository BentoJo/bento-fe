"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { createTeam, updateTeam } from "@/features/teams/api/teams";
import {
  teamSchema,
  type TeamFormValues,
} from "@/features/teams/validation/team";
import type { TeamListItem } from "@/features/teams/types/team";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";

interface CreateTeamDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this team instead of creating a new one. */
  team?: TeamListItem | null;
  onSaved?: () => void;
}

const EMPTY: TeamFormValues = { name: "", description: "", icon: "" };

export function CreateTeamDialog({
  workspaceId,
  open,
  onOpenChange,
  team,
  onSaved,
}: CreateTeamDialogProps) {
  const isEdit = Boolean(team);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, reset, setError } =
    useForm<TeamFormValues>({ defaultValues: EMPTY });

  // Re-seed the form whenever the dialog opens (or the target team changes).
  useEffect(() => {
    if (open) {
      reset(
        team
          ? { name: team.name, description: "", icon: team.icon ?? "" }
          : EMPTY,
      );
    }
  }, [open, team, reset]);

  const iconValue = watch("icon");
  const nameValue = watch("name");
  const previewName = nameValue?.trim() ? nameValue.trim() : "New Team";

  // @hookform/resolvers is NOT installed — validate manually with zod
  // (matches the existing create-workspace dialog pattern).
  const onSubmit = handleSubmit(async (values) => {
    const parsed = teamSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (path === "name" || path === "description" || path === "icon") {
          setError(path, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    const description = parsed.data.description?.trim();
    const icon = parsed.data.icon?.trim();
    const body = {
      name: parsed.data.name,
      ...(description ? { description } : {}),
      ...(icon ? { icon } : {}),
    };

    setIsSubmitting(true);
    try {
      if (isEdit && team) {
        await updateTeam(workspaceId, team.id, body);
        toast.success(`Team "${parsed.data.name}" updated.`);
      } else {
        await createTeam(workspaceId, body);
        toast.success(`Team "${parsed.data.name}" created.`);
      }
      reset(EMPTY);
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      toast.error(
        getErrorMessage(err) ||
          (isEdit ? "Failed to update team." : "Failed to create team."),
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(EMPTY);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Team" : "Create New Team"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this team's name, description, or icon."
              : "Group members into a team to assign work together."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Icon + preview */}
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xl">
              {iconValue?.trim() ? (
                <span aria-hidden>{iconValue.trim()}</span>
              ) : (
                <Users className="size-6 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {previewName}
              </p>
              <p className="text-xs text-muted-foreground">Team preview</p>
            </div>
          </div>

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="team-name">Team Name</FieldLabel>
                <Input
                  {...field}
                  id="team-name"
                  placeholder="e.g Design Team"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="icon"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="team-icon">Icon (optional)</FieldLabel>
                <Input
                  {...field}
                  id="team-icon"
                  placeholder="e.g 🎨"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
                {!fieldState.error && (
                  <FieldDescription>
                    An emoji or short label. Icon-set picker coming soon.
                  </FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="team-description">
                  Description (optional)
                </FieldLabel>
                <Textarea
                  {...field}
                  id="team-description"
                  placeholder="What is this team responsible for?"
                  rows={3}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="mt-1 flex justify-end gap-3">
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
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Team"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
