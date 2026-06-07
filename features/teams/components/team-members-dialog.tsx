"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";

import {
  addTeamMember,
  listTeamMembers,
  removeTeamMember,
} from "@/features/teams/api/teams";
import type { TeamListItem, TeamMember } from "@/features/teams/types/team";
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
  const [memberId, setMemberId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const teamId = team?.id;

  const load = useCallback(async () => {
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

  useEffect(() => {
    if (open && teamId) {
      setMemberId("");
      void load();
    }
  }, [open, teamId, load]);

  const handleAdd = async () => {
    const id = memberId.trim();
    if (!id || !workspaceId || !teamId) return;
    setIsAdding(true);
    try {
      await addTeamMember(workspaceId, teamId, { workspaceMemberId: id });
      toast.success("Member added to team.");
      setMemberId("");
      await load();
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
      await load();
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
            Add or remove members of this team.
          </DialogDescription>
        </DialogHeader>

        {/* Add member.
            TODO(BE)/UX: this takes a raw workspaceMemberId for now — it needs a
            proper member picker that lists workspace members with names/avatars. */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Input
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Workspace member ID"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAdd();
                }
              }}
              disabled={isAdding}
            />
            <Button
              type="button"
              onClick={() => void handleAdd()}
              disabled={isAdding || !memberId.trim()}
              className="shrink-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/80"
            >
              {isAdding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a workspace member ID. A searchable member picker is coming soon.
          </p>
        </div>

        {/* Member list */}
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
                Add a workspace member to this team using the field above.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-72">
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
                          {m.joinedAt ? ` · Joined ${formatDate(m.joinedAt)}` : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove member"
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
