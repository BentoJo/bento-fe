"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  Globe,
  KanbanSquare,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  archiveBoard,
  deleteBoard,
  unarchiveBoard,
  favoriteBoard,
  unfavoriteBoard,
} from "@/features/boards/api/boards";
import { useBoards } from "@/features/boards/hooks/use-boards";
import type { Board } from "@/features/boards/types/board";
import { CreateBoardDialog } from "@/features/boards/components/create-board-dialog";
import { getErrorMessage } from "@/shared/types/api/errors";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface BoardsListProps {
  workspaceId: string;
}

const PAGE_SIZE = 12;

export function BoardsList({ workspaceId }: BoardsListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { boards, isLoading, error, refetch } = useBoards(workspaceId, {
    page: 1,
    limit: PAGE_SIZE,
    search: search || undefined,
    includeArchived,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Boards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize work into Kanban boards with columns and tasks.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 self-start bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          Create Board
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-sm:max-w-sm sm:w-1/2"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a board ..."
            className="pl-9 w-full focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none"
          />
        </form>
        <Button
          type="button"
          variant={includeArchived ? "default" : "outline"}
          size="sm"
          className="gap-2 self-start"
          onClick={() => setIncludeArchived((v) => !v)}
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
            <BoardCardSkeleton key={i} />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <EmptyState
          searching={Boolean(search)}
          onCreate={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              workspaceId={workspaceId}
              board={board}
              onMutated={refetch}
            />
          ))}
        </div>
      )}

      <CreateBoardDialog
        workspaceId={workspaceId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
      />
    </div>
  );
}
function BoardCard({
  workspaceId,
  board,
  onMutated,
}: {
  workspaceId: string;
  board: Board;
  onMutated: () => void;
}) {
  const router = useRouter();
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

  const handleNavigate = () => {
    router.push(`/w/${workspaceId}/boards/${board.id}`);
  };

  const handleArchiveToggle = () =>
    run(async () => {
      if (board.isArchived) {
        await unarchiveBoard(workspaceId, board.id);
        toast.success(`Board "${board.name}" unarchived.`);
      } else {
        await archiveBoard(workspaceId, board.id);
        toast.success(`Board "${board.name}" archived.`);
      }
    }, "Failed to update board.");

  const handleFavoriteToggle = () =>
    run(async () => {
      if (board.isFavorite) {
        await unfavoriteBoard(workspaceId, board.id);
      } else {
        await favoriteBoard(workspaceId, board.id);
      }
    }, "Failed to update favorite.");

  const handleDelete = () =>
    run(async () => {
      await deleteBoard(workspaceId, board.id);
      toast.success(`Board "${board.name}" deleted.`);
    }, "Failed to delete board.");

  return (
    <Card
      onClick={handleNavigate}
      className="group w-full max-w-75 relative overflow-hidden bg-card py-4 transition-shadow cursor-pointer"
    >
      {/* HEADER */}
      <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-2 pb-2">
        {/* Logo (NOT clickable, no pointer) */}
        <div className="flex size-11 items-center justify-center cursor-pointer rounded-lg bg-primary/10 text-xl">
          {board.icon?.trim() ? (
            <span aria-hidden>{board.icon.trim()}</span>
          ) : (
            <KanbanSquare className="size-5 text-primary cursor-default" />
          )}
        </div>

        {/* Dropdown ONLY interactive */}
        <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Board actions"
                disabled={busy}
                className="cursor-pointer text-muted-foreground"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44 z-50">
              <DropdownMenuItem asChild>
                <Link href={`/w/${workspaceId}/boards/${board.id}`}>
                  <KanbanSquare className="size-4" />
                  Open board
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => void handleFavoriteToggle()}>
                <Star
                  className={
                    board.isFavorite
                      ? "size-4 fill-warning text-warning"
                      : "size-4"
                  }
                />
                {board.isFavorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => void handleArchiveToggle()}>
                {board.isArchived ? (
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
        </div>
      </CardHeader>

      {/* CONTENT (no pointer cursor anywhere) */}
      <CardContent className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-card-foreground">
            {board.name}
          </span>

          {board.isFavorite ? (
            <Star className="size-3.5 fill-warning text-warning cursor-default" />
          ) : null}

          {board.isArchived ? (
            <Badge variant="secondary" className="font-normal cursor-default">
              Archived
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="gap-1 font-normal text-muted-foreground cursor-default"
          >
            {board.isPrivate === true ? (
              <Lock className="size-3" />
            ) : (
              <Globe className="size-3" />
            )}
            {board.isPrivate === true ? "Private" : "Public"}
          </Badge>

          {typeof board.membersCount === "number" ? (
            <span className="text-xs text-muted-foreground cursor-default">
              {board.membersCount}{" "}
              {board.membersCount === 1 ? "member" : "members"}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function BoardCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="size-11 rounded-lg" />
        <Skeleton className="size-7 rounded-md" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-24" />
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
        <KanbanSquare className="size-7 text-muted-foreground/70" />
      </div>
      <p className="text-base font-medium text-foreground">
        {searching ? "No boards match your search" : "No boards yet"}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {searching
          ? "Try a different search term."
          : "Create your first board to organize work into a Kanban view."}
      </p>
      {!searching ? (
        <Button
          onClick={onCreate}
          className="mt-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/80"
        >
          <Plus className="size-4" />
          Create Board
        </Button>
      ) : null}
    </div>
  );
}
