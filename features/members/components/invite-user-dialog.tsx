"use client";

import { useState } from "react";
import { Loader2, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { inviteMember } from "@/features/members/api/members";
import type { WorkspaceRole } from "@/features/roles/types/role";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteUserDialogProps {
  workspaceId: string;
  roles: WorkspaceRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited?: () => void;
}

export function InviteUserDialog({
  workspaceId,
  roles,
  open,
  onOpenChange,
  onInvited,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [authzRoleId, setAuthzRoleId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  function reset() {
    setEmail("");
    setAuthzRoleId("");
    setMessage("");
    setEmailError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next && !submitting) reset();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError("You must enter a valid email.");
      return;
    }
    if (!authzRoleId) {
      toast.error("Please select a role.");
      return;
    }
    setEmailError(null);
    setSubmitting(true);
    try {
      await inviteMember(workspaceId, {
        email: trimmed,
        authzRoleId,
        message: message.trim() || undefined,
      });
      toast.success(`Invitation sent to ${trimmed}.`);
      reset();
      onOpenChange(false);
      onInvited?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            Invite User
          </DialogTitle>
          <DialogDescription className="sr-only">
            Invite a new user to this workspace by email and assign a role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(emailError)}
              autoFocus
            />
            <p
              className={
                emailError ? "text-xs text-destructive" : "text-xs text-muted-foreground"
              }
            >
              {emailError ?? "You must enter a valid email."}
            </p>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={authzRoleId} onValueChange={setAuthzRoleId}>
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No roles available
                  </div>
                ) : (
                  roles.map((role) => (
                    <SelectItem key={role.authzRoleId} value={role.authzRoleId}>
                      {role.roleName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Team (disabled — invite endpoint has no team field) */}
          {/* TODO(BE): invite endpoint accepts no team field; wire up once
              the gateway supports inviting directly into a team. */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-team" className="text-muted-foreground">
              Team (optional)
            </Label>
            <Select disabled>
              <SelectTrigger id="invite-team">
                <SelectValue placeholder="Coming soon" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>

          {/* Personal message */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-message">Personal Message (optional)</Label>
            <Textarea
              id="invite-message"
              placeholder="Add a short welcome message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Invitations expire after 14 days.
          </p>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
