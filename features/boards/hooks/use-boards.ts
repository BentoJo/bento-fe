"use client";

import { useCallback, useEffect, useState } from "react";

import { listBoards } from "@/features/boards/api/boards";
import type {
  Board,
  ListBoardsRequest,
  PaginationMeta,
} from "@/features/boards/types/board";

interface UseBoardsResult {
  boards: Board[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a workspace's boards from the (expected) gateway endpoint.
 *
 * WIRE-LATER: the gateway does not expose boards yet, so any error degrades to
 * a graceful EMPTY state — the page never crashes.
 * TODO(BE): gateway board/column/card REST not implemented yet.
 */
export function useBoards(
  workspaceId: string,
  params: ListBoardsRequest = {},
): UseBoardsResult {
  const [boards, setBoards] = useState<Board[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page, limit, search, includeArchived } = params;

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listBoards(workspaceId, {
        page,
        limit,
        search,
        includeArchived,
      });
      setBoards(Array.isArray(res?.boards) ? res.boards : []);
      setPagination(res?.pagination ?? null);
    } catch (err) {
      // Graceful degradation: backend not wired yet → empty board list.
      setBoards([]);
      setPagination(null);
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, page, limit, search, includeArchived]);

  useEffect(() => {
    void load();
  }, [load]);

  return { boards, pagination, isLoading, error, refetch: load };
}
