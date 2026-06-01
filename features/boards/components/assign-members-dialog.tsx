"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, UserPlus, Users, X } from "lucide-react";

import { listMembers } from "@/features/members/api/members";
import type { WorkspaceMember } from "@/features/members/types/member";
import { listTeams } from "@/features/teams/api/teams";
import type { TeamListItem } from "@/features/teams/types/team";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface AssignMembersDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently selected member userIds. */
  selected?: string[];
  /** Called with the new selection when the user saves. */
  onSave?: (userIds: string[]) => void;
}

/**
 * Assign Members modal (search, selected chips, recent members, teams "Add All").
 *
 * BACKEND REALITY: the members list returns only { id, userId, authzRoleId } —
 * NO name / email / avatar. We display userIds and never fabricate identities.
 * TODO(BE): enrich member list with IAM profile (name, email, avatar).
 * Assigning to a card is NOT wired yet — onSave returns the selection to the
 * caller; persisting it awaits the gateway card-assignee endpoint.
 */
export function AssignMembersDialog({
  workspaceId,
  open,
  onOpenChange,
  selected = [],
  onSave,
}: AssignMembersDialogProps) {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [picked, setPicked] = useState<string[]>(selected);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    // Best-effort: members + teams load independently; failures → empty.
    const [m, t] = await Promise.allSettled([
      listMembers(workspaceId, { page: 1, limit: 20 }),
      listTeams(workspaceId, { page: 1, limit: 20 }),
    ]);
    setMembers(
      m.status === "fulfilled" && Array.isArray(m.value?.members)
        ? m.value.members
        : [],
    );
    setTeams(
      t.status === "fulfilled" && Array.isArray(t.value?.teams)
        ? t.value.teams
        : [],
    );
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    if (open) {
      setPicked(selected);
      setSearch("");
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.userId.toLowerCase().includes(q));
  }, [members, search]);

  const toggle = (userId: string) =>
    setPicked((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );

  const addTeam = (_team: TeamListItem) => {
    // TODO(BE): team member list isn't bundled here — wire team -> userIds
    // expansion once the gateway returns team members inline.
  };

  const handleSave = () => {
    onSave?.(picked);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <UserPlus className="size-5 text-primary" />
            Assign Members
          </DialogTitle>
          <DialogDescription>
            Search and select workspace members to assign to this task.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>

          {/* Selected chips */}
          {picked.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Selected ({picked.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {picked.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-foreground"
                  >
                    {id.slice(0, 8)}
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      aria-label={`Remove ${id}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Recent members */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Recent Members
            </p>
            <ScrollArea className="max-h-48">
              {isLoading ? (
                <p className="py-3 text-sm text-muted-foreground">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">
                  No members found.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {filtered.map((m) => {
                    const active = picked.includes(m.userId);
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => toggle(m.userId)}
                          className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
                        >
                          <span className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarFallback className="text-[10px]">
                                {m.userId.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-foreground">
                              {m.userId.slice(0, 12)}
                            </span>
                          </span>
                          <span
                            className={
                              "flex size-6 items-center justify-center rounded-full border " +
                              (active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground")
                            }
                          >
                            <Plus className="size-3.5" />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Teams */}
          {teams.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">Teams</p>
              <ul className="flex flex-col gap-1">
                {teams.map((team) => (
                  <li
                    key={team.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                        <Users className="size-3.5 text-primary" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm text-foreground">
                          {team.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {team.membersCount}{" "}
                          {team.membersCount === 1 ? "member" : "members"}
                        </span>
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-primary"
                      onClick={() => addTeam(team)}
                      // Team expansion not wired yet. TODO(BE).
                      disabled
                    >
                      <Plus className="size-3.5" />
                      Add All
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Invitations expire after 14 days.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
