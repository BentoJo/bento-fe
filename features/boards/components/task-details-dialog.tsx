"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  CalendarDays,
  CheckSquare,
  Edit,
  Eye,
  EyeOff,
  Flag,
  Loader2,
  Paperclip,
  Plus,
  Send,
  Square,
  Tag,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type {
  Card,
  CardAssignee,
  CardChecklist,
  CardComment,
  CardLabel,
  CardPriority,
  ChecklistItem,
} from "@/features/boards/types/board";
import {
  addCardAssignee,
  addCardLabel,
  addChecklistItem,
  addComment,
  archiveCard,
  createChecklist,
  createLabel,
  deleteCard,
  deleteChecklistItem,
  deleteComment,
  listCardAssignees,
  listCardChecklists,
  listCardComments,
  listCardLabels,
  listWorkspaceLabels,
  removeCardAssignee,
  removeCardLabel,
  toggleChecklistItem,
  updateCard,
} from "@/features/boards/api/cards";
import { listMembers } from "@/features/members/api/members";
import type { WorkspaceMember } from "@/features/members/types/member";
import { listTeams } from "@/features/teams/api/teams";
import type { TeamListItem } from "@/features/teams/types/team";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { userFullName, userInitials } from "@/shared/lib/user";
import ThreeDotsIcon from "@/shared/components/svgs/ThreeDots";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface TaskDetailsDialogProps {
  workspaceId: string;
  boardId: string;
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional: called after a mutation so the parent board can refetch. */
  onMutated?: () => void;
}

const PRIORITY_LABEL: Record<CardPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITY_STYLE: Record<CardPriority, string> = {
  low: "bg-success/10 text-success border-success/40",
  medium: "bg-warning/10 text-warning border-warning/40",
  high: "bg-destructive/10 text-destructive border-destructive/40",
};

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(value?: string | null): string {
  return (value ?? "?").slice(0, 2).toUpperCase();
}

/** ISO/date string -> "YYYY-MM-DD" for <input type="date">. */
function toDateInput(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TaskDetailsDialog({
  workspaceId,
  boardId,
  card,
  open,
  onOpenChange,
  onMutated,
}: TaskDetailsDialogProps) {
  // Editable title / description
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  // Comments
  const [comments, setComments] = useState<CardComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentsBusy, setCommentsBusy] = useState(false);

  // Labels
  const [cardLabels, setCardLabels] = useState<CardLabel[]>([]);
  const [wsLabels, setWsLabels] = useState<CardLabel[]>([]);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [labelsBusy, setLabelsBusy] = useState(false);

  // Assignees
  const [assignees, setAssignees] = useState<CardAssignee[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [assigneesBusy, setAssigneesBusy] = useState(false);

  // Checklists
  const [checklists, setChecklists] = useState<CardChecklist[]>([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [addingChecklistId, setAddingChecklistId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [checklistsBusy, setChecklistsBusy] = useState(false);

  // Misc
  const [isWatching, setIsWatching] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const loadedCardId = useRef<string | null>(null);

  // Load all card data when dialog opens or card changes
  const loadCardData = useCallback(
    async (c: Card) => {
      if (loadedCardId.current === c.id) return;
      loadedCardId.current = c.id;

      setTitleDraft(c.title);
      setDescDraft(c.descriptionText ?? "");
      setCardLabels(c.labels ?? []);
      setAssignees(c.assignees ?? []);
      setChecklists(c.checklists ?? []);
      setComments(c.comments ?? []);

      // Load details in parallel
      const [
        commentsRes,
        cardLabelsRes,
        wsLabelsRes,
        assigneesRes,
        checklistsRes,
        membersRes,
        teamsRes,
      ] = await Promise.allSettled([
        listCardComments(workspaceId, boardId, c.id, { limit: 50 }),
        listCardLabels(workspaceId, boardId, c.id),
        listWorkspaceLabels(workspaceId),
        listCardAssignees(workspaceId, boardId, c.id),
        listCardChecklists(workspaceId, boardId, c.id),
        listMembers(workspaceId, { page: 1, limit: 50 }),
        listTeams(workspaceId, { page: 1, limit: 50 }),
      ]);

      if (commentsRes.status === "fulfilled") {
        setComments(commentsRes.value?.comments ?? []);
      }
      if (cardLabelsRes.status === "fulfilled") {
        setCardLabels(cardLabelsRes.value ?? []);
      }
      if (wsLabelsRes.status === "fulfilled") {
        setWsLabels(wsLabelsRes.value?.labels ?? []);
      }
      if (assigneesRes.status === "fulfilled") {
        setAssignees(assigneesRes.value ?? []);
      }
      if (checklistsRes.status === "fulfilled") {
        setChecklists(checklistsRes.value ?? []);
      }
      if (membersRes.status === "fulfilled") {
        setMembers(membersRes.value?.members ?? []);
      }
      if (teamsRes.status === "fulfilled") {
        setTeams(teamsRes.value?.teams ?? []);
      }
    },
    [workspaceId, boardId],
  );

  useEffect(() => {
    if (open && card) {
      loadedCardId.current = null; // reset so a new card always reloads
      void loadCardData(card);
    }
    if (!open) {
      loadedCardId.current = null;
      setEditingTitle(false);
      setEditingDesc(false);
      setShowLabelPicker(false);
      setShowAssigneePicker(false);
      setNewChecklistTitle("");
      setAddingChecklistId(null);
    }
  }, [open, card, loadCardData]);

  if (!card) return null;

  // -------------------------------------------------------------------------
  // Metadata mutations
  // -------------------------------------------------------------------------

  const saveTitle = async () => {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === card.title) {
      setEditingTitle(false);
      return;
    }
    setIsBusy(true);
    try {
      await updateCard(workspaceId, boardId, card.id, {
        columnId: card.columnId,
        title: trimmed,
      });
      card.title = trimmed;
      toast.success("Title updated.");
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update title.");
    } finally {
      setIsBusy(false);
      setEditingTitle(false);
    }
  };

  const saveDesc = async () => {
    const trimmed = descDraft.trim();
    setIsBusy(true);
    try {
      await updateCard(workspaceId, boardId, card.id, {
        columnId: card.columnId,
        descriptionText: trimmed || undefined,
      });
      card.descriptionText = trimmed || undefined;
      toast.success("Description updated.");
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update description.");
    } finally {
      setIsBusy(false);
      setEditingDesc(false);
    }
  };

  const savePriority = async (priority: CardPriority) => {
    if (priority === card.priority) return;
    setIsBusy(true);
    try {
      await updateCard(workspaceId, boardId, card.id, {
        columnId: card.columnId,
        priority,
      });
      card.priority = priority;
      toast.success("Priority updated.");
      onMutated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update priority.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const saveDate = async (field: "startDate" | "dueDate", value: string) => {
    const iso = value ? new Date(value).toISOString() : undefined;
    setIsBusy(true);
    try {
      await updateCard(workspaceId, boardId, card.id, {
        columnId: card.columnId,
        [field]: iso,
      });
      card[field] = iso;
      toast.success("Date updated.");
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update date.");
    } finally {
      setIsBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Comments
  // -------------------------------------------------------------------------

  const handleAddComment = async () => {
    const text = commentInput.trim();
    if (!text) return;
    setCommentsBusy(true);
    try {
      const newComment = await addComment(workspaceId, boardId, card.id, {
        contentText: text,
      });
      setComments((prev) => [...prev, newComment]);
      setCommentInput("");
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment.");
    } finally {
      setCommentsBusy(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentsBusy(true);
    try {
      await deleteComment(workspaceId, boardId, card.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment.");
    } finally {
      setCommentsBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Labels
  // -------------------------------------------------------------------------

  const handleAttachLabel = async (labelId: string) => {
    if (cardLabels.some((l) => l.id === labelId)) return;
    setLabelsBusy(true);
    try {
      await addCardLabel(workspaceId, boardId, card.id, labelId);
      const label = wsLabels.find((l) => l.id === labelId);
      if (label) setCardLabels((prev) => [...prev, label]);
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add label.");
    } finally {
      setLabelsBusy(false);
    }
  };

  const handleDetachLabel = async (labelId: string) => {
    setLabelsBusy(true);
    try {
      await removeCardLabel(workspaceId, boardId, card.id, labelId);
      setCardLabels((prev) => prev.filter((l) => l.id !== labelId));
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove label.");
    } finally {
      setLabelsBusy(false);
    }
  };

  const handleCreateLabel = async () => {
    const name = newLabelName.trim();
    if (!name) return;
    setLabelsBusy(true);
    try {
      const label = await createLabel(workspaceId, { name });
      setWsLabels((prev) => [...prev, label]);
      setNewLabelName("");
      // Immediately attach to card
      await addCardLabel(workspaceId, boardId, card.id, label.id);
      setCardLabels((prev) => [...prev, label]);
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create label.");
    } finally {
      setLabelsBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Assignees
  // -------------------------------------------------------------------------

  // Members are matched by workspaceMemberId (= WorkspaceMember.id), since the
  // assignee row itself stores a board-member id we can't compare against.
  const isAssigned = (workspaceMemberId: string) =>
    assignees.some(
      (a) =>
        a.assigneeType === "member" &&
        a.workspaceMemberId === workspaceMemberId,
    );

  // Lookups to resolve an assignee to a real name/avatar from the lists we
  // already loaded (workspace members + teams).
  const memberByWsId = useMemo(() => {
    const m = new Map<string, WorkspaceMember>();
    for (const x of members) m.set(x.id, x);
    return m;
  }, [members]);
  const teamById = useMemo(() => {
    const m = new Map<string, TeamListItem>();
    for (const x of teams) m.set(x.id, x);
    return m;
  }, [teams]);

  const describeAssignee = (
    a: CardAssignee,
  ): { name: string; avatarUrl?: string | null } => {
    if (a.assigneeType === "team") {
      const t = a.teamId ? teamById.get(a.teamId) : undefined;
      return { name: t?.name ?? "Team" };
    }
    const member = a.workspaceMemberId
      ? memberByWsId.get(a.workspaceMemberId)
      : undefined;
    return {
      name: userFullName(member?.user ?? { id: a.workspaceMemberId ?? a.id }),
      avatarUrl: member?.user?.avatarUrl,
    };
  };

  const removeAssignee = async (a: CardAssignee) => {
    setAssigneesBusy(true);
    try {
      await removeCardAssignee(workspaceId, boardId, card.id, a.id);
      setAssignees(await listCardAssignees(workspaceId, boardId, card.id));
      onMutated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove assignee.",
      );
    } finally {
      setAssigneesBusy(false);
    }
  };

  const handleToggleMember = async (member: WorkspaceMember) => {
    const existing = assignees.find(
      (a) => a.assigneeType === "member" && a.workspaceMemberId === member.id,
    );
    setAssigneesBusy(true);
    try {
      if (existing) {
        await removeCardAssignee(workspaceId, boardId, card.id, existing.id);
      } else {
        // The add endpoint returns an ack ({success}), not the assignee row —
        // refetch the real list so the UI has valid assignee objects.
        await addCardAssignee(workspaceId, boardId, card.id, {
          assigneeType: "member",
          boardMemberId: member.id,
        });
      }
      setAssignees(await listCardAssignees(workspaceId, boardId, card.id));
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update assignee.");
    } finally {
      setAssigneesBusy(false);
    }
  };

  const handleAddTeam = async (team: TeamListItem) => {
    // Avoid assigning the same team twice.
    if (assignees.some((a) => a.assigneeType === "team" && a.teamId === team.id))
      return;
    setAssigneesBusy(true);
    try {
      await addCardAssignee(workspaceId, boardId, card.id, {
        assigneeType: "team",
        teamId: team.id,
      });
      setAssignees(await listCardAssignees(workspaceId, boardId, card.id));
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add team.");
    } finally {
      setAssigneesBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Checklists
  // -------------------------------------------------------------------------

  const handleCreateChecklist = async () => {
    const title = newChecklistTitle.trim();
    if (!title) return;
    setChecklistsBusy(true);
    try {
      const cl = await createChecklist(workspaceId, boardId, card.id, { title });
      setChecklists((prev) => [...prev, { ...cl, items: [] }]);
      setNewChecklistTitle("");
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create checklist.");
    } finally {
      setChecklistsBusy(false);
    }
  };

  const handleAddItem = async (checklistId: string) => {
    const title = newItemTitle.trim();
    if (!title) return;
    setChecklistsBusy(true);
    try {
      const item = await addChecklistItem(workspaceId, boardId, card.id, checklistId, {
        title,
      });
      setChecklists((prev) =>
        prev.map((cl) =>
          cl.id === checklistId ? { ...cl, items: [...cl.items, item] } : cl,
        ),
      );
      setNewItemTitle("");
      setAddingChecklistId(null);
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      setChecklistsBusy(false);
    }
  };

  const handleToggleItem = async (
    checklistId: string,
    item: ChecklistItem,
  ) => {
    const nextVal = !item.isCompleted;
    // Optimistic update
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map((i) =>
                i.id === item.id ? { ...i, isCompleted: nextVal } : i,
              ),
            }
          : cl,
      ),
    );
    try {
      await toggleChecklistItem(
        workspaceId,
        boardId,
        card.id,
        checklistId,
        item.id,
        nextVal,
      );
      onMutated?.();
    } catch (err) {
      // Rollback
      setChecklists((prev) =>
        prev.map((cl) =>
          cl.id === checklistId
            ? {
                ...cl,
                items: cl.items.map((i) =>
                  i.id === item.id ? { ...i, isCompleted: item.isCompleted } : i,
                ),
              }
            : cl,
        ),
      );
      toast.error(err instanceof Error ? err.message : "Failed to toggle item.");
    }
  };

  const handleDeleteItem = async (checklistId: string, itemId: string) => {
    setChecklistsBusy(true);
    try {
      await deleteChecklistItem(workspaceId, boardId, card.id, checklistId, itemId);
      setChecklists((prev) =>
        prev.map((cl) =>
          cl.id === checklistId
            ? { ...cl, items: cl.items.filter((i) => i.id !== itemId) }
            : cl,
        ),
      );
      onMutated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item.");
    } finally {
      setChecklistsBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete / Archive
  // -------------------------------------------------------------------------

  const handleDelete = async () => {
    setIsBusy(true);
    try {
      await deleteCard(workspaceId, boardId, card.id);
      toast.success("Task deleted.");
      onMutated?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task.");
    } finally {
      setIsBusy(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleArchive = async () => {
    setIsBusy(true);
    try {
      await archiveCard(workspaceId, boardId, card.id);
      toast.success("Task archived.");
      onMutated?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive task.");
    } finally {
      setIsBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Checklist stats
  // -------------------------------------------------------------------------

  const totalItems = checklists.reduce((s, cl) => s + cl.items.length, 0);
  const doneItems = checklists.reduce(
    (s, cl) => s + cl.items.filter((i) => i.isCompleted).length,
    0,
  );
  const checklistPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85dvh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
          <DialogHeader
            actions={
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-0 cursor-pointer h-9 w-9 p-0"
                    >
                      <ThreeDotsIcon className="text-[#64748B]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setIsWatching((v) => !v)}
                      className="cursor-pointer gap-2"
                    >
                      {isWatching ? (
                        <>
                          <EyeOff className="size-4 text-muted-foreground" />
                          <span>Stop watching</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-4 text-muted-foreground" />
                          <span>Watch card</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => void handleArchive()}
                      className="cursor-pointer gap-2"
                    >
                      <Archive className="size-4 text-muted-foreground" />
                      <span>Archive card</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="destructive"
                      className="cursor-pointer gap-2"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete card</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Edit modal removed — everything is edited inline here. */}
              </div>
            }
            className="flex flex-row items-center justify-between gap-2 border-b border-border p-5"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {card.status ? (
                <Badge variant="secondary" className="font-normal shrink-0">
                  {card.status}
                </Badge>
              ) : null}

              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    className="h-8 text-base font-semibold"
                    autoFocus
                    disabled={isBusy}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveTitle();
                      if (e.key === "Escape") setEditingTitle(false);
                    }}
                  />
                  <Button size="sm" onClick={() => void saveTitle()} disabled={isBusy}>
                    {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingTitle(false)}
                    disabled={isBusy}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <DialogTitle
                  className="text-lg font-semibold text-foreground border px-3 rounded-md cursor-pointer hover:bg-muted/40 truncate"
                  onClick={() => setEditingTitle(true)}
                  title="Click to edit title"
                >
                  {card.title}
                </DialogTitle>
              )}
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_280px]">
            {/* Left column */}
            <div className="flex flex-col gap-5 p-5">
              {/* Description */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Description</h3>
                  {!editingDesc && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditingDesc(true)}
                    >
                      <Edit className="size-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingDesc ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={descDraft}
                      onChange={(e) => setDescDraft(e.target.value)}
                      rows={4}
                      className="text-sm"
                      disabled={isBusy}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => void saveDesc()} disabled={isBusy}>
                        {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingDesc(false)}
                        disabled={isBusy}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : card.descriptionText ? (
                  <p
                    className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/40 rounded p-1 -m-1"
                    onClick={() => setEditingDesc(true)}
                  >
                    {card.descriptionText}
                  </p>
                ) : (
                  <p
                    className="text-sm text-muted-foreground italic cursor-pointer hover:bg-muted/40 rounded p-1 -m-1"
                    onClick={() => setEditingDesc(true)}
                  >
                    No description. Click to add one.
                  </p>
                )}
              </section>

              <Separator />

              {/* Checklists */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <CheckSquare className="size-4" />
                    Checklists
                    <span className="text-muted-foreground font-normal">
                      {doneItems}/{totalItems}
                    </span>
                  </h3>
                  <span className="text-xs text-muted-foreground">{checklistPct}%</span>
                </div>

                {totalItems > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${checklistPct}%` }}
                    />
                  </div>
                )}

                {checklists.map((cl) => (
                  <div key={cl.id} className="flex flex-col gap-1.5 pl-1">
                    <p className="text-xs font-semibold text-foreground">{cl.title}</p>
                    {cl.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 group">
                        <button
                          type="button"
                          onClick={() => void handleToggleItem(cl.id, item)}
                          className="shrink-0"
                          disabled={checklistsBusy}
                        >
                          {item.isCompleted ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4 text-muted-foreground" />
                          )}
                        </button>
                        <span
                          className={cn(
                            "text-sm flex-1",
                            item.isCompleted && "line-through text-muted-foreground",
                          )}
                        >
                          {item.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDeleteItem(cl.id, item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={checklistsBusy}
                          aria-label="Delete item"
                        >
                          <X className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                    {addingChecklistId === cl.id ? (
                      <div className="flex items-center gap-2 pl-6">
                        <Input
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                          placeholder="Item title..."
                          className="h-7 text-xs"
                          autoFocus
                          disabled={checklistsBusy}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleAddItem(cl.id);
                            if (e.key === "Escape") setAddingChecklistId(null);
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => void handleAddItem(cl.id)}
                          disabled={checklistsBusy}
                        >
                          {checklistsBusy ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-1"
                          onClick={() => setAddingChecklistId(null)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setNewItemTitle("");
                          setAddingChecklistId(cl.id);
                        }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pl-6 self-start"
                        disabled={checklistsBusy}
                      >
                        <Plus className="size-3.5" />
                        Add item
                      </button>
                    )}
                  </div>
                ))}

                {/* New checklist */}
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="New checklist title..."
                    className="h-8 text-xs"
                    disabled={checklistsBusy}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCreateChecklist();
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0"
                    onClick={() => void handleCreateChecklist()}
                    disabled={checklistsBusy || !newChecklistTitle.trim()}
                  >
                    {checklistsBusy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Plus className="size-3.5" />
                    )}
                  </Button>
                </div>
              </section>

              <Separator />

              {/* Comments */}
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Comments ({comments.length})
                </h3>
                {comments.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {comments.map((c) => (
                      <li key={c.id} className="flex flex-col gap-0.5 group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {c.workspaceMemberId.slice(0, 8)}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={commentsBusy}
                            aria-label="Delete comment"
                          >
                            <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                        <p className="text-sm text-foreground">{c.contentText}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No comments yet.</p>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={commentsBusy}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAddComment();
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={commentsBusy || !commentInput.trim()}
                    onClick={() => void handleAddComment()}
                    aria-label="Send comment"
                  >
                    {commentsBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
              </section>
            </div>

            {/* Right sidebar */}
            <aside className="flex flex-col gap-4 border-t border-border p-5 md:border-t-0 md:border-l">
              {/* Labels */}
              <MetaRow icon={<Tag className="size-4" />} label="Labels">
                <div className="flex flex-col gap-1.5 items-end">
                  {cardLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {cardLabels.map((l) => (
                        <span
                          key={l.id}
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
                          style={
                            l.color
                              ? { backgroundColor: `${l.color}1a`, color: l.color }
                              : undefined
                          }
                        >
                          {l.name}
                          <button
                            type="button"
                            onClick={() => void handleDetachLabel(l.id)}
                            disabled={labelsBusy}
                            aria-label={`Remove ${l.name}`}
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowLabelPicker((v) => !v)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showLabelPicker ? "Close" : "+ Add label"}
                  </button>

                  {showLabelPicker && (
                    <div className="w-full rounded-lg border border-border bg-popover p-2 shadow-sm flex flex-col gap-1 max-h-40 overflow-y-auto">
                      {wsLabels.length === 0 && (
                        <p className="text-xs text-muted-foreground px-1">
                          No workspace labels yet.
                        </p>
                      )}
                      {wsLabels.map((l) => {
                        const attached = cardLabels.some((cl) => cl.id === l.id);
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() =>
                              attached
                                ? void handleDetachLabel(l.id)
                                : void handleAttachLabel(l.id)
                            }
                            disabled={labelsBusy}
                            className={cn(
                              "flex items-center gap-2 rounded px-2 py-1 text-xs text-left hover:bg-muted transition-colors",
                              attached && "bg-primary/10",
                            )}
                          >
                            <span className="truncate flex-1">{l.name}</span>
                            {attached && <CheckSquare className="size-3 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                      <div className="flex items-center gap-1 mt-1 border-t border-border pt-1">
                        <Input
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder="New label..."
                          className="h-6 text-xs"
                          disabled={labelsBusy}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleCreateLabel();
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-6 px-2 shrink-0"
                          onClick={() => void handleCreateLabel()}
                          disabled={labelsBusy || !newLabelName.trim()}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </MetaRow>

              {/* Assignees */}
              <MetaRow icon={<User className="size-4" />} label="Assignee">
                <div className="flex flex-col gap-1.5 items-end w-full">
                  {assignees.length > 0 ? (
                    <ul className="flex flex-col gap-1 w-full">
                      {assignees.map((a) => {
                        const d = describeAssignee(a);
                        return (
                          <li
                            key={a.id}
                            className="flex items-center justify-end gap-1.5 group"
                          >
                            <Avatar className="size-6 border border-background">
                              {d.avatarUrl ? (
                                <AvatarImage src={d.avatarUrl} alt={d.name} />
                              ) : null}
                              <AvatarFallback className="text-[10px]">
                                {initials(d.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm text-foreground max-w-[140px]">
                              {d.name}
                              {a.assigneeType === "team" ? " (team)" : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => void removeAssignee(a)}
                              disabled={assigneesBusy}
                              aria-label={`Remove ${d.name}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="size-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAssigneePicker((v) => !v)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showAssigneePicker ? "Close" : "+ Assign"}
                  </button>

                  {showAssigneePicker && (
                    <div className="w-full rounded-lg border border-border bg-popover p-2 shadow-sm flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {members.length === 0 && (
                        <p className="text-xs text-muted-foreground px-1">
                          No members found.
                        </p>
                      )}
                      {members.map((m) => {
                        const assigned = isAssigned(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => void handleToggleMember(m)}
                            disabled={assigneesBusy}
                            className={cn(
                              "flex items-center gap-2 rounded px-2 py-1 text-xs text-left hover:bg-muted transition-colors",
                              assigned && "bg-primary/10",
                            )}
                          >
                            <Avatar className="size-5">
                              {m.user?.avatarUrl && (
                                <AvatarImage src={m.user.avatarUrl} />
                              )}
                              <AvatarFallback className="text-[9px]">
                                {userInitials(m.user ?? { id: m.userId })}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate flex-1">
                              {userFullName(m.user ?? { id: m.userId })}
                            </span>
                            {assigned && <CheckSquare className="size-3 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                      {teams.length > 0 && (
                        <>
                          <p className="text-xs font-medium text-muted-foreground px-1 pt-1">
                            Teams
                          </p>
                          {teams.map((team) => (
                            <button
                              key={team.id}
                              type="button"
                              onClick={() => void handleAddTeam(team)}
                              disabled={assigneesBusy}
                              className="flex items-center gap-2 rounded px-2 py-1 text-xs text-left hover:bg-muted transition-colors"
                            >
                              <Users className="size-4 text-primary" />
                              <span className="truncate flex-1">{team.name}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </MetaRow>

              {/* Priority — editable */}
              <MetaRow icon={<Flag className="size-4" />} label="Priority">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={isBusy}
                      className={cn(
                        "inline-block rounded border px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors",
                        card.priority
                          ? PRIORITY_STYLE[card.priority]
                          : "text-muted-foreground",
                      )}
                    >
                      {card.priority ? PRIORITY_LABEL[card.priority] : "Set priority"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {(["low", "medium", "high"] as CardPriority[]).map((p) => (
                      <DropdownMenuItem
                        key={p}
                        onClick={() => void savePriority(p)}
                        className="gap-2 cursor-pointer"
                      >
                        <Flag
                          className={cn(
                            "size-3.5",
                            p === "high" && "text-destructive",
                            p === "medium" && "text-warning",
                            p === "low" && "text-success",
                          )}
                        />
                        {PRIORITY_LABEL[p]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </MetaRow>

              {/* Dates — editable */}
              <MetaRow icon={<CalendarDays className="size-4" />} label="Start">
                <input
                  key={`start-${card.id}`}
                  type="date"
                  defaultValue={toDateInput(card.startDate)}
                  disabled={isBusy}
                  onChange={(e) => void saveDate("startDate", e.target.value)}
                  className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground"
                />
              </MetaRow>

              <MetaRow icon={<CalendarDays className="size-4" />} label="Due">
                <input
                  key={`due-${card.id}`}
                  type="date"
                  defaultValue={toDateInput(card.dueDate)}
                  disabled={isBusy}
                  onChange={(e) => void saveDate("dueDate", e.target.value)}
                  className="rounded border border-input bg-background px-2 py-0.5 text-xs text-foreground"
                />
              </MetaRow>

              <MetaRow icon={<Paperclip className="size-4" />} label="Attachments">
                <span className="text-sm text-foreground">
                  {typeof card.attachmentsCount === "number"
                    ? card.attachmentsCount
                    : 0}
                </span>
              </MetaRow>
            </aside>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md p-6 gap-1">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground my-2">
            Are you sure you want to delete this task? This action{" "}
            <span className="text-destructive font-bold">cannot be undone!</span>
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void handleDelete()}
              disabled={isBusy}
            >
              {isBusy ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0">
        {icon}
        {label}
      </span>
      <div className="text-right min-w-0">{children}</div>
    </div>
  );
}
