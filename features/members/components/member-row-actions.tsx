"use client";

import { useState } from "react";
import { Eye, Loader2, Pencil, XCircle } from "lucide-react";
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
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { removeMember, updateMemberRole } from "@/features/members/api/members";
import type { WorkspaceMember } from "@/features/members/types/member";
import { userFullName } from "@/shared/lib/user";
import type { WorkspaceRole } from "@/features/roles/types/role";

interface MemberRowActionsProps {
  workspaceId: string;
  member: WorkspaceMember;
  roleName: string;
  roles: WorkspaceRole[];
  onChanged?: () => void;
}

export function MemberRowActions({
  workspaceId,
  member,
  roleName,
  roles,
  onChanged,
}: MemberRowActionsProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(member.authzRoleId);
  const [savingRole, setSavingRole] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleRoleSave() {
    if (selectedRoleId === member.authzRoleId) {
      setRoleOpen(false);
      return;
    }
    setSavingRole(true);
    try {
      await updateMemberRole(workspaceId, member.id, {
        authzRoleId: selectedRoleId,
      });
      toast.success("Member role updated.");
      setRoleOpen(false);
      onChanged?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update member role.",
      );
    } finally {
      setSavingRole(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeMember(workspaceId, member.id);
      toast.success("Member removed.");
      setRemoveOpen(false);
      onChanged?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member.",
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <TooltipProvider>
      {/* View */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-primary"
            onClick={() => setViewOpen(true)}
            aria-label="View member"
          >
            <Eye className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>

      {/* Edit role */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-warning"
            onClick={() => {
              setSelectedRoleId(member.authzRoleId);
              setRoleOpen(true);
            }}
            aria-label="Change role"
          >
            <Pencil className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Change role</TooltipContent>
      </Tooltip>

      {/* Remove */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={() => setRemoveOpen(true)}
            aria-label="Remove member"
          >
            <XCircle className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove</TooltipContent>
      </Tooltip>
      </TooltipProvider>

      {/* View dialog — only the data we actually have. */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Member details</DialogTitle>
            <DialogDescription>
              {userFullName(member.user ?? { id: member.userId })}
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="truncate">
              {userFullName(member.user ?? { id: member.userId })}
            </dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate">{member.user?.email ?? "—"}</dd>
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="truncate font-mono text-xs">{member.userId}</dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd>{roleName}</dd>
            <dt className="text-muted-foreground">Joined</dt>
            <dd>
              {member.joinedAt
                ? new Date(member.joinedAt).toLocaleDateString()
                : "—"}
            </dd>
          </dl>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change role dialog */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Update this member&apos;s workspace role.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`role-${member.id}`}>Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id={`role-${member.id}`}>
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
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setRoleOpen(false)}
              disabled={savingRole}
            >
              Cancel
            </Button>
            <Button onClick={handleRoleSave} disabled={savingRole} className="gap-2">
              {savingRole ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              This member will lose access to the workspace. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setRemoveOpen(false)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removing}
              className="gap-2"
            >
              {removing ? <Loader2 className="size-4 animate-spin" /> : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
