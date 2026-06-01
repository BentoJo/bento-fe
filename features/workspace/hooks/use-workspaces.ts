"use client";

import { useCallback, useEffect, useState } from "react";

import { listUserWorkspaces } from "@/features/workspace/api/workspace";
import type {
  ListUserWorkspacesRequest,
  PaginationMeta,
  WorkspaceListItem,
} from "@/shared/types/workspace";

interface UseWorkspacesResult {
  workspaces: WorkspaceListItem[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches the current user's workspaces from the gateway.
 * Real data only — the API returns { id, name, logoUrl?, isArchived, roleId }.
 */
export function useWorkspaces(
  params: ListUserWorkspacesRequest = {},
): UseWorkspacesResult {
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize params so the effect doesn't re-run on every render.
  const { page, limit, search, includeArchived } = params;

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listUserWorkspaces({
        page,
        limit,
        search,
        includeArchived,
      });
      setWorkspaces(Array.isArray(res?.workspaces) ? res.workspaces : []);
      setPagination(res?.pagination ?? null);
    } catch (err) {
      setWorkspaces([]);
      setPagination(null);
      setError(err instanceof Error ? err.message : "Failed to load workspaces.");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, includeArchived]);

  useEffect(() => {
    void load();
  }, [load]);

  return { workspaces, pagination, isLoading, error, refetch: load };
}
