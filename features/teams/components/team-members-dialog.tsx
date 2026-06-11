"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  addTeamMember,
  listTeamMembers,
  removeTeamMember,
} from "@/features/teams/api/teams";
import { listMembers } from "@/features/members/api/members";
import type { TeamListItem, TeamMember } from "@/features/teams/types/team";
import type { WorkspaceMember } from "@/features/members/types/member";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { userFullName, userInitials } from "@/shared/lib/user";

interface TeamMembersDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamListItem | null;
  /** Called after a member is added/removed so the list can refresh counts. */
  onChanged?: () => void;
}

export function TeamMembersDialog({
  workspaceId,
  open,
  onOpenChange,
  team,
  onChanged,
}: TeamMembersDialogProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Workspace member picker state
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [isLoadingWsMembers, setIsLoadingWsMembers] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const teamId = team?.id;

  const loadTeamMembers = useCallback(async () => {
    if (!workspaceId || !teamId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listTeamMembers(workspaceId, teamId);
      setMembers(Array.isArray(res?.members) ? res.members : []);
    } catch (err) {
      setMembers([]);
      setError(err instanceof Error ? err.message : "Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, teamId]);

  const loadWorkspaceMembers = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoadingWsMembers(true);
    try {
      const res = await listMembers(workspaceId, { limit: 100 });
      setWorkspaceMembers(Array.isArray(res?.members) ? res.members : []);
    } catch {
      setWorkspaceMembers([]);
    } finally {
      setIsLoadingWsMembers(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (open && teamId) {
      setPickerSearch("");
      setPickerOpen(false);
      void loadTeamMembers();
      void loadWorkspaceMembers();
    }
  }, [open, teamId, loadTeamMembers, loadWorkspaceMembers]);

  // Workspace members NOT already on this team
  const currentMemberUserIds = useMemo(
    () => new Set(members.map((m) => m.user.id)),
    [members],
  );

  const availableMembers = useMemo(() => {
    const search = pickerSearch.trim().toLowerCase();
    return workspaceMembers.filter((wm) => {
      if (currentMemberUserIds.has(wm.userId)) return false;
      if (!search) return true;
      const name = userFullName(wm.user).toLowerCase();
      const email = (wm.user?.email ?? "").toLowerCase();
      return name.includes(search) || email.includes(search);
    });
  }, [workspaceMembers, currentMemberUserIds, pickerSearch]);

  const handleAdd = async (wm: WorkspaceMember) => {
    if (!workspaceId || !teamId) return;
    setIsAdding(true);
    setPickerOpen(false);
    try {
      await addTeamMember(workspaceId, teamId, { workspaceMemberId: wm.id });
      toast.success(`${userFullName(wm.user)} added to team.`);
      await loadTeamMembers();
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to add member.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!workspaceId || !teamId) return;
    setRemovingId(userId);
    try {
      await removeTeamMember(workspaceId, teamId, userId);
      toast.success("Member removed from team.");
      await loadTeamMembers();
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="size-5 text-primary" />
            {team ? `${team.name} — Members` : "Team Members"}
          </DialogTitle>
          <DialogDescription>
            Add or remove workspace members from this team.
          </DialogDescription>
        </DialogHeader>

        {/* Member picker */}
        <div className="relative flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            disabled={isAdding || isLoadingWsMembers}
            className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {isAdding || isLoadingWsMembers ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Users className="size-4" />
              )}
              {isAdding
                ? "Adding…"
                : isLoadingWsMembers
                  ? "Loading members…"
                  : "Add workspace member…"}
            </span>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </button>

          {pickerOpen ? (
            <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
              <div className="border-b border-border p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search members…"
                    className="pl-8"
                  />
                </div>
              </div>
              <ScrollArea className="max-h-52">
                {availableMembers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {pickerSearch
                      ? "No matching members."
                      : "All workspace members are already on this team."}
                  </p>
                ) : (
                  <ul>
                    {availableMembers.map((wm) => (
                      <li key={wm.id}>
                        <button
                          type="button"
                          onClick={() => void handleAdd(wm)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <Avatar className="size-7 shrink-0">
                            {wm.user?.avatarUrl && (
                              <AvatarImage
                                src={wm.user.avatarUrl}
                                alt={userFullName(wm.user)}
                              />
                            )}
                            <AvatarFallback className="text-xs">
                              {userInitials(wm.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {userFullName(wm.user)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {wm.user?.email}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </div>
          ) : null}
        </div>

        {/* Current team member list */}
        <div className="rounded-lg border border-border">
          {error ? (
            <div className="flex items-center gap-2 p-4 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <UserRound className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">
                No members yet
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Use the picker above to add workspace members to this team.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <ul className="divide-y divide-border">
                {members.map((m) => (
                  <li
                    key={m.user.id}
                    className="flex items-center justify-between gap-3 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9">
                        {m.user.avatarUrl && (
                          <AvatarImage
                            src={m.user.avatarUrl}
                            alt={userFullName(m.user)}
                          />
                        )}
                        <AvatarFallback>{userInitials(m.user)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {userFullName(m.user)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {m.user.email}
                          {m.joinedAt
                            ? ` · Joined ${formatDate(m.joinedAt)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${userFullName(m.user)}`}
                      onClick={() => void handleRemove(m.user.id)}
                      disabled={removingId === m.user.id}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      {removingId === m.user.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
