"use client";

import { useCallback, useState } from "react";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { deleteRole } from "@/features/roles/api/roles";
import { useRoles } from "@/features/roles/hooks/use-roles";
import type { WorkspaceRole } from "@/features/roles/types/role";
import { RolePermissionsDialog } from "@/features/roles/components/role-permissions-dialog";
import Label from "@/shared/components/svgs/Label";
import PlusIcon from "@/shared/components/svgs/PlusIcon";
import UsersIcon from "@/shared/components/svgs/UsersIcon";

/** Built-in role descriptions (no description field on the contract). */
const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: "Full system access with all permissions.",
  editor: "Can manage content and view users.",
  viewer: "Read-only access to content.",
};

function describeRole(roleName: string): string {
  return ROLE_DESCRIPTIONS[roleName.trim().toLowerCase()] ?? "";
}

function roleIcon(roleName: string) {
  switch (roleName.trim().toLowerCase()) {
    case "admin":
      return Shield;
    case "editor":
      return Pencil;
    case "viewer":
      return Eye;
    default:
      return ShieldCheck;
  }
}

interface RoleRowProps {
  role: WorkspaceRole;
  onViewPermissions: (role: WorkspaceRole) => void;
  onDelete: (role: WorkspaceRole) => void;
  isDeleting: boolean;
}

function RoleRow({
  role,
  onViewPermissions,
  onDelete,
  isDeleting,
}: RoleRowProps) {
  const Icon = roleIcon(role.roleName);
  const description = describeRole(role.roleName);

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto]",
        isDeleting && "pointer-events-none opacity-50",
      )}
    >
      {/* Icon + name + description */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {role.roleName.slice(0, 1).toUpperCase() +
              role.roleName.slice(1).toLocaleLowerCase()}
          </h3>
          {description ? (
            <p className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {/* Created By / role type */}
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
          <Shield className="size-3.5 text-muted-foreground" aria-hidden />
          Role Type
        </p>
        <Badge variant={role.isSystemRole ? "secondary" : "outline"}>
          {role.isSystemRole ? "Built-in Role" : "Custom"}
        </Badge>
      </div>

      {/* Users number — no count endpoint available */}
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
          <UsersIcon className="size-3.5 text-muted-foreground" aria-hidden />
          Users Number
        </p>
        {/* TODO(BE): no "assigned to N users" count endpoint. */}
        <p className="text-xs text-muted-foreground">—</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${role.roleName}`}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onViewPermissions(role)}>
              <Eye className="size-4" aria-hidden />
              View permissions
            </DropdownMenuItem>
            {!role.isSystemRole ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(role)}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function RoleManagement({ workspaceId }: { workspaceId: string }) {
  const { roles, isLoading, error, refetch } = useRoles(workspaceId);
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (role: WorkspaceRole) => {
      if (role.isSystemRole) return;
      setDeletingId(role.authzRoleId);
      setDeleteError(null);
      try {
        await deleteRole(workspaceId, role.authzRoleId);
        refetch();
      } catch (err) {
        setDeleteError(
          err instanceof Error ? err.message : "Failed to delete role.",
        );
      } finally {
        setDeletingId(null);
      }
    },
    [workspaceId, refetch],
  );

  return (
    <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-none">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1  ">
            <div className="flex items-center gap-2">
              <Label className="h-5 w-5 text-[#334155]" />
              <div>
                <h2 className="text-[24px] font-bold text-[#0F172A]">
                  Role Management
                </h2>
              </div>
            </div>
            <p className="text-[14px] pl-8 text-[#64748B]">
              Manage workspace roles and control access permissions.
            </p>
          </div>
        </div>

        {/* TODO(BE): no create-role endpoint (only from-authz references an
            existing authz role) — disabled until a contract exists. */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button
                  className="
                          h-10
                          rounded-[8px]
                          bg-[#2563EB]
                          px-4
                        text-white
                        hover:bg-[#1D4ED8]
                        "
                >
                  <PlusIcon className="size-4" width={24} height={24} />
                  Create new Role
                </Button>
              </span>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Body */}
      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-22 w-full rounded-xl" />
          ))
        ) : error ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border py-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
            <Shield className="size-8 text-muted-foreground/50" aria-hidden />
            <p className="text-sm font-medium text-foreground">No roles yet</p>
            <p className="text-sm text-muted-foreground">
              This workspace has no roles configured.
            </p>
          </div>
        ) : (
          <>
            {deleteError ? (
              <p className="text-sm text-destructive">{deleteError}</p>
            ) : null}
            {roles.map((role) => (
              <RoleRow
                key={role.authzRoleId}
                role={role}
                onViewPermissions={setSelectedRole}
                onDelete={handleDelete}
                isDeleting={deletingId === role.authzRoleId}
              />
            ))}
          </>
        )}
      </div>

      <RolePermissionsDialog
        workspaceId={workspaceId}
        role={selectedRole}
        onOpenChange={(open) => {
          if (!open) setSelectedRole(null);
        }}
      />
    </section>
  );
}
