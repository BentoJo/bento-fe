"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";

import {
  addBoardMember,
  listBoardMembers,
  removeBoardMember,
  type BoardMember,
} from "@/features/boards/api/board-members";
import { listMembers } from "@/features/members/api/members";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { userFullName, userInitials } from "@/shared/lib/user";

interface BoardMembersDialogProps {
  workspaceId: string;
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Notified after any add/remove so callers can refresh counts. */
  onChanged?: () => void;
}

/**
 * Manage the members of an existing board: list current members, add workspace
 * members not yet on the board, and remove members. Backed by the gateway's
 * /workspace/:wid/boards/:bid/members endpoints.
 */
export function BoardMembersDialog({
  workspaceId,
  boardId,
  open,
  onOpenChange,
  onChanged,
}: BoardMembersDialogProps) {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [wsMembers, setWsMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId || !boardId) return;
    setIsLoading(true);
    const [bm, wm] = await Promise.allSettled([
      listBoardMembers(workspaceId, boardId, { limit: 100 }),
      listMembers(workspaceId, { page: 1, limit: 100 }),
    ]);
    setBoardMembers(
      bm.status === "fulfilled" && Array.isArray(bm.value?.members)
        ? bm.value.members
        : [],
    );
    setWsMembers(
      wm.status === "fulfilled" && Array.isArray(wm.value?.members)
        ? wm.value.members
        : [],
    );
    setIsLoading(false);
  }, [workspaceId, boardId]);

  useEffect(() => {
    if (open) {
      setSearch("");
      void load();
    }
  }, [open, load]);

  const boardUserIds = useMemo(
    () => new Set(boardMembers.map((m) => m.user?.id).filter(Boolean)),
    [boardMembers],
  );

  // Workspace members not yet on the board, filtered by search.
  const addable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wsMembers.filter((m) => {
      if (boardUserIds.has(m.userId)) return false;
      if (!q) return true;
      const haystack = [
        userFullName(m.user ?? { id: m.userId }),
        m.user?.email ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [wsMembers, boardUserIds, search]);

  const handleAdd = async (userId: string) => {
    setBusyUserId(userId);
    try {
      await addBoardMember(workspaceId, boardId, userId);
      toast.success("Member added to board.");
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to add member.");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setBusyUserId(userId);
    try {
      await removeBoardMember(workspaceId, boardId, userId);
      toast.success("Member removed from board.");
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to remove member.");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="size-5 text-primary" />
            Board Members
          </DialogTitle>
          <DialogDescription>
            Add or remove workspace members for this board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Current members */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Current Members ({boardMembers.length})
            </p>
            <ScrollArea className="max-h-40">
              {isLoading ? (
                <p className="py-3 text-sm text-muted-foreground">Loading...</p>
              ) : boardMembers.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">
                  No members on this board yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {boardMembers.map((m) => (
                    <li
                      key={m.user.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-7">
                          {m.user.avatarUrl && (
                            <AvatarImage
                              src={m.user.avatarUrl}
                              alt={userFullName(m.user)}
                            />
                          )}
                          <AvatarFallback className="text-[10px]">
                            {userInitials(m.user)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm text-foreground">
                            {userFullName(m.user)}
                          </span>
                          {m.user.email && (
                            <span className="truncate text-xs text-muted-foreground">
                              {m.user.email}
                            </span>
                          )}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${userFullName(m.user)}`}
                        disabled={busyUserId === m.user.id}
                        onClick={() => void handleRemove(m.user.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {busyUserId === m.user.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <UserMinus className="size-4" />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Add members */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Add Workspace Members
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9"
              />
            </div>
            <ScrollArea className="max-h-40">
              {isLoading ? (
                <p className="py-3 text-sm text-muted-foreground">Loading...</p>
              ) : addable.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">
                  No members available to add.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {addable.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => void handleAdd(m.userId)}
                        disabled={busyUserId === m.userId}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted disabled:opacity-60"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Avatar className="size-7">
                            {m.user?.avatarUrl && (
                              <AvatarImage
                                src={m.user.avatarUrl}
                                alt={userFullName(m.user)}
                              />
                            )}
                            <AvatarFallback className="text-[10px]">
                              {userInitials(m.user ?? { id: m.userId })}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm text-foreground">
                              {userFullName(m.user ?? { id: m.userId })}
                            </span>
                            {m.user?.email && (
                              <span className="truncate text-xs text-muted-foreground">
                                {m.user.email}
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground">
                          {busyUserId === m.userId ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Plus className="size-3.5" />
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
