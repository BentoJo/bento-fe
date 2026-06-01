"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  archiveTeam,
  deleteTeam,
  unarchiveTeam,
} from "@/features/teams/api/teams";
import { useTeams } from "@/features/teams/hooks/use-teams";
import type { TeamListItem } from "@/features/teams/types/team";
import { CreateTeamDialog } from "@/features/teams/components/create-team-dialog";
import { TeamMembersDialog } from "@/features/teams/components/team-members-dialog";
import { getErrorMessage } from "@/shared/types/api/errors";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface TeamsManagementProps {
  workspaceId: string;
}

const PAGE_SIZE = 12;

export function TeamsManagement({ workspaceId }: TeamsManagementProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [includeArchived, setIncludeArchived] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamListItem | null>(null);
  const [membersTeam, setMembersTeam] = useState<TeamListItem | null>(null);

  const { teams, pagination, isLoading, error, refetch } = useTeams(
    workspaceId,
    { page, limit: PAGE_SIZE, search: search || undefined, includeArchived },
  );

  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? teams.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Teams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Group workspace members into teams to assign and track work together.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 self-start bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          Create Team
        </Button>
      </div>

      {/* Toolbar: search + filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a team ..."
            className="pl-9"
          />
        </form>
        <Button
          type="button"
          variant={includeArchived ? "default" : "outline"}
          size="sm"
          className="gap-2 self-start"
          onClick={() => {
            setPage(1);
            setIncludeArchived((v) => !v);
          }}
        >
          <Archive className="size-4" />
          {includeArchived ? "Hiding archived" : "Show archived"}
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          searching={Boolean(search)}
          onCreate={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              workspaceId={workspaceId}
              team={team}
              onEdit={() => setEditTeam(team)}
              onManageMembers={() => setMembersTeam(team)}
              onMutated={refetch}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && teams.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {teams.length} of {total} teams
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {pagination?.page ?? page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Dialogs */}
      <CreateTeamDialog
        workspaceId={workspaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={refetch}
      />
      <CreateTeamDialog
        workspaceId={workspaceId}
        open={Boolean(editTeam)}
        onOpenChange={(open) => !open && setEditTeam(null)}
        team={editTeam}
        onSaved={refetch}
      />
      <TeamMembersDialog
        workspaceId={workspaceId}
        open={Boolean(membersTeam)}
        onOpenChange={(open) => !open && setMembersTeam(null)}
        team={membersTeam}
        onChanged={refetch}
      />
    </div>
  );
}

function TeamCard({
  workspaceId,
  team,
  onEdit,
  onManageMembers,
  onMutated,
}: {
  workspaceId: string;
  team: TeamListItem;
  onEdit: () => void;
  onManageMembers: () => void;
  onMutated: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>, fallback: string) => {
    setBusy(true);
    try {
      await fn();
      onMutated();
    } catch (err) {
      toast.error(getErrorMessage(err) || fallback);
    } finally {
      setBusy(false);
    }
  };

  const handleArchiveToggle = () =>
    run(async () => {
      if (team.isArchived) {
        await unarchiveTeam(workspaceId, team.id);
        toast.success(`Team "${team.name}" unarchived.`);
      } else {
        await archiveTeam(workspaceId, team.id);
        toast.success(`Team "${team.name}" archived.`);
      }
    }, "Failed to update team.");

  const handleDelete = () =>
    run(async () => {
      await deleteTeam(workspaceId, team.id);
      toast.success(`Team "${team.name}" deleted.`);
    }, "Failed to delete team.");

  return (
    <Card className="gap-0 overflow-hidden bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-xl">
          {team.icon?.trim() ? (
            <span aria-hidden>{team.icon.trim()}</span>
          ) : (
            <UsersRound className="size-5 text-primary" />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Team actions"
              disabled={busy}
              className="text-muted-foreground"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onManageMembers}>
              <Users className="size-4" />
              Manage members
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void handleArchiveToggle()}>
              {team.isArchived ? (
                <>
                  <ArchiveRestore className="size-4" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="size-4" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => void handleDelete()}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-card-foreground">
            {team.name}
          </p>
          {team.isArchived ? (
            <Badge variant="secondary" className="font-normal">
              Archived
            </Badge>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onManageMembers}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Users className="size-4" />
          {team.membersCount} {team.membersCount === 1 ? "member" : "members"}
        </button>
      </CardContent>
    </Card>
  );
}

function TeamCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="size-11 rounded-lg" />
        <Skeleton className="size-7 rounded-md" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

function EmptyState({
  searching,
  onCreate,
}: {
  searching: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <UsersRound className="size-7 text-muted-foreground/70" />
      </div>
      <p className="text-base font-medium text-foreground">
        {searching ? "No teams match your search" : "No teams yet"}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {searching
          ? "Try a different search term."
          : "Create your first team to group members and organize work."}
      </p>
      {!searching ? (
        <Button
          onClick={onCreate}
          className="mt-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          Create Team
        </Button>
      ) : null}
    </div>
  );
}
