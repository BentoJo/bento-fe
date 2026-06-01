"use client";

import { useCallback, useEffect, useState } from "react";

import { listTeams } from "@/features/teams/api/teams";
import type {
  ListTeamsRequest,
  PaginationMeta,
  TeamListItem,
} from "@/features/teams/types/team";

interface UseTeamsResult {
  teams: TeamListItem[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a workspace's teams from the gateway.
 * Real data only — the API returns { id, name, icon?, isArchived, membersCount }.
 */
export function useTeams(
  workspaceId: string,
  params: ListTeamsRequest = {},
): UseTeamsResult {
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize params so the effect doesn't re-run on every render.
  const { page, limit, search, includeArchived } = params;

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await listTeams(workspaceId, {
        page,
        limit,
        search,
        includeArchived,
      });
      setTeams(Array.isArray(res?.teams) ? res.teams : []);
      setPagination(res?.pagination ?? null);
    } catch (err) {
      setTeams([]);
      setPagination(null);
      setError(err instanceof Error ? err.message : "Failed to load teams.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, page, limit, search, includeArchived]);

  useEffect(() => {
    void load();
  }, [load]);

  return { teams, pagination, isLoading, error, refetch: load };
}
