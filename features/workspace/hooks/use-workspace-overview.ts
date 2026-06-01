"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWorkspaceOverview } from "@/features/workspace/api/workspace";
import type { GetWorkspaceOverviewResponse } from "@/shared/types/workspace";

interface UseWorkspaceOverviewResult {
  overview: GetWorkspaceOverviewResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Client hook that loads the workspace overview via the gateway.
 * Uses the next-auth session indirectly through getClientAxios (in the API layer).
 */
export function useWorkspaceOverview(
  workspaceId: string,
): UseWorkspaceOverviewResult {
  const [overview, setOverview] =
    useState<GetWorkspaceOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(true);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWorkspaceOverview(workspaceId);
      if (activeRef.current) setOverview(data);
    } catch (err) {
      if (activeRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load overview.");
      }
    } finally {
      if (activeRef.current) setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    activeRef.current = true;
    void load();
    return () => {
      activeRef.current = false;
    };
  }, [load]);

  return { overview, isLoading, error, refetch: load };
}
