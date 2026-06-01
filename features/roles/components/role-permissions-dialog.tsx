"use client";

import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getRolePermissions } from "@/features/roles/api/roles";
import type { WorkspaceRole } from "@/features/roles/types/role";

interface RolePermissionsDialogProps {
  workspaceId: string;
  /** The role to inspect. When non-null the dialog is open. */
  role: WorkspaceRole | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Groups a flat permission string list by its prefix (segment before the
 * first ":" or "."), e.g. "board:create" -> group "board".
 */
function groupPermissions(permissions: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const perm of permissions) {
    const sep = perm.search(/[:.]/);
    const group = sep > 0 ? perm.slice(0, sep) : "general";
    (groups[group] ??= []).push(perm);
  }
  return groups;
}

export function RolePermissionsDialog({
  workspaceId,
  role,
  onOpenChange,
}: RolePermissionsDialogProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authzRoleId = role?.authzRoleId;

  useEffect(() => {
    if (!authzRoleId) return;
    let active = true;
    setIsLoading(true);
    setError(null);
    setPermissions([]);

    getRolePermissions(workspaceId, authzRoleId)
      .then((perms) => {
        if (active) setPermissions(perms);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load permissions.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [workspaceId, authzRoleId]);

  const groups = groupPermissions(permissions);
  const groupNames = Object.keys(groups).sort();

  return (
    <Dialog open={role !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
            {role?.roleName ?? "Role"} permissions
          </DialogTitle>
          <DialogDescription>
            Permissions granted to this role.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-destructive">{error}</p>
          ) : permissions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <KeyRound className="size-8 text-muted-foreground/50" aria-hidden />
              <p className="text-sm text-muted-foreground">
                No permissions assigned to this role.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupNames.map((group) => (
                <div key={group} className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {groups[group].map((perm) => (
                      <Badge key={perm} variant="secondary">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
