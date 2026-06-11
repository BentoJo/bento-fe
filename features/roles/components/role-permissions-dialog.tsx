"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  assignPermissionsToRole,
  getPermissions,
  getRolePermissions,
  removePermissionsFromRole,
} from "@/features/roles/api/roles";
import type { WorkspacePermission, WorkspaceRole } from "@/features/roles/types/role";
import { getErrorMessage } from "@/shared/types/api/errors";

interface RolePermissionsDialogProps {
  workspaceId: string;
  /** The role to inspect / edit. When non-null the dialog is open. */
  role: WorkspaceRole | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Groups permission descriptors by the prefix of their `name` field
 * (segment before the first ":" or "."), e.g. "board:create" -> "board".
 */
function groupByPrefix(
  permissions: WorkspacePermission[],
): Record<string, WorkspacePermission[]> {
  const groups: Record<string, WorkspacePermission[]> = {};
  for (const p of permissions) {
    const sep = p.name.search(/[:.]/);
    const group = sep > 0 ? p.name.slice(0, sep) : "general";
    (groups[group] ??= []).push(p);
  }
  return groups;
}

export function RolePermissionsDialog({
  workspaceId,
  role,
  onOpenChange,
}: RolePermissionsDialogProps) {
  // All available permissions (from getPermissions — may not be implemented BE yet)
  const [allPermissions, setAllPermissions] = useState<WorkspacePermission[]>([]);
  const [allPermsLoading, setAllPermsLoading] = useState(false);
  const [allPermsError, setAllPermsError] = useState<string | null>(null);

  // Permissions currently assigned to this role (ids as strings)
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [rolePermsLoading, setRolePermsLoading] = useState(false);
  const [rolePermsError, setRolePermsError] = useState<string | null>(null);

  // Local toggle state — tracks which ids the user has checked/unchecked this session
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const authzRoleId = role?.authzRoleId;

  // Load all available permissions and the role's current permissions in parallel
  useEffect(() => {
    if (!authzRoleId) return;
    let active = true;

    // Load all workspace permissions
    setAllPermsLoading(true);
    setAllPermsError(null);
    getPermissions(workspaceId)
      .then((perms) => {
        if (active) setAllPermissions(perms);
      })
      .catch((err: unknown) => {
        if (active) {
          setAllPermsError(
            getErrorMessage(err) ||
              "Could not load permission catalogue. The backend endpoint may not be implemented yet.",
          );
        }
      })
      .finally(() => {
        if (active) setAllPermsLoading(false);
      });

    // Load the role's currently assigned permissions
    setRolePermsLoading(true);
    setRolePermsError(null);
    getRolePermissions(workspaceId, authzRoleId)
      .then((ids) => {
        if (active) {
          const s = new Set(ids);
          setAssignedIds(s);
          setPendingIds(new Set(s));
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setRolePermsError(
            getErrorMessage(err) || "Failed to load role permissions.",
          );
        }
      })
      .finally(() => {
        if (active) setRolePermsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [workspaceId, authzRoleId]);

  // Reset pending state on close
  useEffect(() => {
    if (!role) {
      setAllPermissions([]);
      setAssignedIds(new Set());
      setPendingIds(new Set());
      setAllPermsError(null);
      setRolePermsError(null);
    }
  }, [role]);

  const isLoading = allPermsLoading || rolePermsLoading;

  const isDirty = useMemo(() => {
    if (pendingIds.size !== assignedIds.size) return true;
    for (const id of pendingIds) {
      if (!assignedIds.has(id)) return true;
    }
    return false;
  }, [pendingIds, assignedIds]);

  const togglePermission = (id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleReset = () => setPendingIds(new Set(assignedIds));

  const handleSave = async () => {
    if (!authzRoleId || !isDirty) return;
    setIsSaving(true);
    try {
      const toAssign = [...pendingIds].filter((id) => !assignedIds.has(id));
      const toRemove = [...assignedIds].filter((id) => !pendingIds.has(id));

      if (toAssign.length > 0) {
        await assignPermissionsToRole(workspaceId, authzRoleId, {
          permissionIds: toAssign,
        });
      }
      if (toRemove.length > 0) {
        await removePermissionsFromRole(workspaceId, authzRoleId, {
          permissionIds: toRemove,
        });
      }

      setAssignedIds(new Set(pendingIds));
      toast.success("Role permissions updated.");
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  // Grouped view of all available permissions
  const groups = useMemo(() => groupByPrefix(allPermissions), [allPermissions]);
  const groupNames = useMemo(() => Object.keys(groups).sort(), [groups]);

  // If getPermissions is unavailable (BE not implemented), fall back to showing
  // the role's already-assigned permissions as read-only badges.
  const showFallbackReadOnly = !allPermsLoading && allPermsError !== null;

  return (
    <Dialog open={role !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
            {role?.roleName ?? "Role"} — Permissions
          </DialogTitle>
          <DialogDescription>
            Toggle permissions assigned to this role, then save.
          </DialogDescription>
        </DialogHeader>

        {/* Backend dependency notice */}
        {allPermsError ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium">Permission catalogue unavailable</p>
              <p className="text-xs">
                {allPermsError} — Showing currently assigned permissions
                read-only. Full toggle management will be available once
                the backend exposes GET /v1/workspace/&#123;id&#125;/permissions.
              </p>
            </div>
          </div>
        ) : null}

        <ScrollArea className="max-h-[50vh] pr-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : rolePermsError ? (
            <div className="flex items-center gap-2 py-6 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {rolePermsError}
            </div>
          ) : showFallbackReadOnly ? (
            // Read-only fallback when getPermissions is not yet implemented
            <FallbackReadOnly assignedIds={assignedIds} />
          ) : allPermissions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <KeyRound className="size-8 text-muted-foreground/50" aria-hidden />
              <p className="text-sm text-muted-foreground">
                No permissions are defined for this workspace yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {groupNames.map((group) => (
                <div key={group} className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group}
                  </h4>
                  <ul className="space-y-1">
                    {groups[group].map((perm) => {
                      const checked = pendingIds.has(perm.id);
                      return (
                        <li key={perm.id}>
                          <button
                            type="button"
                            onClick={() => togglePermission(perm.id)}
                            className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                          >
                            <span
                              className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input bg-background"
                              }`}
                              aria-hidden
                            >
                              {checked ? (
                                <Check className="size-3" />
                              ) : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-foreground">
                                {perm.name}
                              </span>
                              {perm.description ? (
                                <span className="block truncate text-xs text-muted-foreground">
                                  {perm.description}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer: only show save/reset when full edit mode is available */}
        {!showFallbackReadOnly && !isLoading && !rolePermsError ? (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSave()}
              disabled={!isDirty || isSaving}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/80"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Read-only fallback: shows currently assigned permission ids as badges. */
function FallbackReadOnly({ assignedIds }: { assignedIds: Set<string> }) {
  const ids = [...assignedIds].sort();
  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <KeyRound className="size-8 text-muted-foreground/50" aria-hidden />
        <p className="text-sm text-muted-foreground">
          No permissions assigned to this role.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {ids.map((id) => (
        <Badge key={id} variant="secondary">
          {id}
        </Badge>
      ))}
    </div>
  );
}
