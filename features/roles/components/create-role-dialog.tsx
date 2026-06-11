"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createRole } from "@/features/roles/api/roles";
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

interface CreateRoleDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateRoleDialog({
  workspaceId,
  open,
  onOpenChange,
  onCreated,
}: CreateRoleDialogProps) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("");
      setNameError(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setNameError("Role name is required.");
      return;
    }
    if (trimmed.length > 100) {
      setNameError("Role name must be 100 characters or fewer.");
      return;
    }
    setNameError(null);

    setIsSubmitting(true);
    try {
      await createRole(workspaceId, { name: trimmed, scopeType: "workspace" });
      toast.success(`Role "${trimmed}" created.`);
      handleOpenChange(false);
      onCreated?.();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to create role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Create New Role
          </DialogTitle>
          <DialogDescription>
            Add a custom role to this workspace. You can assign permissions
            after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
          <Field data-invalid={Boolean(nameError)}>
            <FieldLabel htmlFor="role-name">Role Name</FieldLabel>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Billing Manager"
              autoFocus
              aria-invalid={Boolean(nameError)}
              disabled={isSubmitting}
            />
            {nameError ? (
              <FieldError errors={[{ message: nameError }]} />
            ) : null}
          </Field>

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
                  Creating…
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
