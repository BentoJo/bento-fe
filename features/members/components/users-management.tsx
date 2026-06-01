"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Search,
  Shield,
  SlidersHorizontal,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { useMembers } from "@/features/members/hooks/use-members";
import { InviteUserDialog } from "@/features/members/components/invite-user-dialog";
import { MemberRowActions } from "@/features/members/components/member-row-actions";
import { listTeams } from "@/features/teams/api/teams";
import type { WorkspaceMember } from "@/features/members/types/member";
import type { WorkspaceRole } from "@/features/roles/types/role";

const PAGE_SIZE = 10;

interface UsersManagementProps {
  workspaceId: string;
}

export function UsersManagement({ workspaceId }: UsersManagementProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  // Debounce the search box -> server query.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { members, roles, pagination, isLoading, error, refetch } = useMembers(
    workspaceId,
    { page, limit: PAGE_SIZE, search: search || undefined },
  );

  // authzRoleId -> roleName lookup
  const roleNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of roles) map.set(r.authzRoleId, r.roleName);
    return map;
  }, [roles]);

  const resolveRoleName = (id: string) => roleNameById.get(id) ?? "Unknown";

  const total = pagination?.total ?? members.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6">
      {/* Breadcrumb + title */}
      <div>
        <nav className="text-xs text-muted-foreground">
          Home <span className="px-1">›</span>
          <span className="text-primary">Users</span>
        </nav>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">
          Users Management
        </h1>
      </div>

      <StatCards
        workspaceId={workspaceId}
        members={members}
        roles={roles}
        total={total}
        resolveRoleName={resolveRoleName}
        isLoading={isLoading}
      />

      {/* Search + filter + invite */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a User ..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2" disabled>
          {/* TODO(BE): advanced filtering not yet supported by the members endpoint. */}
          <SlidersHorizontal className="size-4" />
          Filter
        </Button>
        <Button className="gap-2" onClick={() => setInviteOpen(true)}>
          <UserPlus className="size-4" />
          Invite User
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <MembersTable
        workspaceId={workspaceId}
        members={members}
        roles={roles}
        resolveRoleName={resolveRoleName}
        isLoading={isLoading}
        onChanged={refetch}
      />

      {/* Pagination footer */}
      {!isLoading && members.length > 0 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {members.length} of {total} total Users
          </span>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      ) : null}

      <InviteUserDialog
        workspaceId={workspaceId}
        roles={roles}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={refetch}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat cards                                                          */
/* ------------------------------------------------------------------ */

function StatCards({
  workspaceId,
  members,
  roles,
  total,
  resolveRoleName,
  isLoading,
}: {
  workspaceId: string;
  members: WorkspaceMember[];
  roles: WorkspaceRole[];
  total: number;
  resolveRoleName: (id: string) => string;
  isLoading: boolean;
}) {
  const [teamCount, setTeamCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listTeams(workspaceId, { page: 1, limit: 1 })
      .then((res) => {
        if (active) setTeamCount(res?.pagination?.total ?? res?.teams?.length ?? 0);
      })
      .catch(() => {
        if (active) setTeamCount(null);
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);

  // Count members by resolved role name (case-insensitive contains).
  // NOTE: counts reflect the CURRENT page only when the list is paginated,
  // except "All Users" which uses the server total.
  const countRole = (needle: string) =>
    members.filter((m) =>
      resolveRoleName(m.authzRoleId).toLowerCase().includes(needle),
    ).length;

  const customRoles = roles.filter((r) => !r.isSystemRole).length;

  const cards = [
    { label: "All Users", value: total, icon: UserPlus },
    { label: "Admins", value: countRole("admin"), icon: Shield },
    { label: "Editors", value: countRole("editor"), icon: Edit3 },
    { label: "Viewers", value: countRole("viewer"), icon: Eye },
    { label: "Custom Roles", value: customRoles, icon: UsersIcon },
    {
      label: "Teams",
      value: teamCount,
      icon: UsersIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.label} className="shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="size-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-10" />
            ) : (
              <span className="text-2xl font-semibold text-foreground">
                {c.value === null ? "—" : c.value}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Members table                                                       */
/* ------------------------------------------------------------------ */

function MembersTable({
  workspaceId,
  members,
  roles,
  resolveRoleName,
  isLoading,
  onChanged,
}: {
  workspaceId: string;
  members: WorkspaceMember[];
  roles: WorkspaceRole[];
  resolveRoleName: (id: string) => string;
  isLoading: boolean;
  onChanged: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header row */}
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1.4fr_0.8fr_1fr] gap-3 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
        <span>Profile</span>
        <span>Field</span>
        <span>Phone</span>
        <span>Contact</span>
        <span>Role</span>
        <span className="text-right">Action</span>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : members.length === 0 ? (
        <EmptyState />
      ) : (
        members.map((m) => (
          <MemberRow
            key={m.id}
            workspaceId={workspaceId}
            member={m}
            roleName={resolveRoleName(m.authzRoleId)}
            roles={roles}
            onChanged={onChanged}
          />
        ))
      )}
    </div>
  );
}

function MemberRow({
  workspaceId,
  member,
  roleName,
  roles,
  onChanged,
}: {
  workspaceId: string;
  member: WorkspaceMember;
  roleName: string;
  roles: WorkspaceRole[];
  onChanged: () => void;
}) {
  const joined = member.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString()
    : "—";
  const shortId =
    member.userId.length > 12
      ? `${member.userId.slice(0, 8)}…${member.userId.slice(-4)}`
      : member.userId;
  const initials = member.userId.slice(0, 2).toUpperCase();

  return (
    <div className="grid grid-cols-[1.6fr_1fr_1fr_1.4fr_0.8fr_1fr] items-center gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0 hover:bg-muted/40">
      {/* Profile: generic avatar + truncated userId.
          TODO(BE): needs IAM user profile enrichment on member list
          (no name/email/phone/job-field/avatar available today). */}
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p
            className="truncate font-mono text-xs font-medium text-foreground"
            title={member.userId}
          >
            {shortId}
          </p>
          <p className="text-xs text-muted-foreground">Joined {joined}</p>
        </div>
      </div>

      {/* Field — not available on member record */}
      <span className="text-muted-foreground">—</span>
      {/* Phone — not available on member record */}
      <span className="text-muted-foreground">—</span>
      {/* Contact — not available on member record */}
      <span className="text-muted-foreground">—</span>

      {/* Role */}
      <div>
        <Badge variant="secondary" className="font-normal">
          {roleName}
        </Badge>
      </div>

      {/* Actions */}
      <MemberRowActions
        workspaceId={workspaceId}
        member={member}
        roleName={roleName}
        roles={roles}
        onChanged={onChanged}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[1.6fr_1fr_1fr_1.4fr_0.8fr_1fr] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-5 w-16" />
          <div className="flex justify-end gap-1">
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <UsersIcon className="size-8 text-muted-foreground/60" />
      <p className="text-sm font-medium text-card-foreground">No members yet</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Invite teammates to this workspace to see them listed here.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Window of page numbers around the current page (+ always show last).
  const pages: number[] = [];
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  for (let p = start; p <= Math.min(start + 2, totalPages); p++) pages.push(p);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="icon-sm"
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      {totalPages > start + 2 ? (
        <>
          <span className="px-1 text-muted-foreground">…</span>
          <Button
            variant={totalPages === page ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      ) : null}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
