"use client";

import { useCallback, useEffect, useState } from "react";

import { listRoles } from "@/features/roles/api/roles";
import type { WorkspaceRole } from "@/features/roles/types/role";

interface UseRolesResult {
  roles: WorkspaceRole[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches the workspace's roles from the gateway.
 * Real data only — the API returns { authzRoleId, roleName, isSystemRole }[].
 */
export function useRoles(workspaceId: string): UseRolesResult {
  const [roles, setRoles] = useState<WorkspaceRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId) {
      setRoles([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await listRoles(workspaceId);
      setRoles(Array.isArray(res?.roles) ? res.roles : []);
    } catch (err) {
      setRoles([]);
      setError(err instanceof Error ? err.message : "Failed to load roles.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { roles, isLoading, error, refetch: load };
}
