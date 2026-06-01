"use client";

import { useCallback, useEffect, useState } from "react";

import { listMembers } from "@/features/members/api/members";
import { listRoles } from "@/features/roles/api/roles";
import type { WorkspaceRole } from "@/features/roles/types/role";
import type {
  ListMembersRequest,
  PaginationMeta,
  WorkspaceMember,
} from "@/features/members/types/member";

interface UseMembersResult {
  members: WorkspaceMember[];
  roles: WorkspaceRole[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches workspace members and the workspace role catalog together.
 * Roles are needed to resolve each member's `authzRoleId` to a human-readable
 * role NAME (the member record only carries the id).
 *
 * Real data only — the member list returns { id, userId, authzRoleId, joinedAt }.
 */
export function useMembers(
  workspaceId: string,
  params: ListMembersRequest = {},
): UseMembersResult {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [roles, setRoles] = useState<WorkspaceRole[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stabilize params so the effect doesn't re-run on every render.
  const { page, limit, search } = params;

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        listMembers(workspaceId, { page, limit, search }),
        listRoles(workspaceId),
      ]);
      setMembers(Array.isArray(membersRes?.members) ? membersRes.members : []);
      setPagination(membersRes?.pagination ?? null);
      setRoles(Array.isArray(rolesRes?.roles) ? rolesRes.roles : []);
    } catch (err) {
      setMembers([]);
      setPagination(null);
      setRoles([]);
      setError(err instanceof Error ? err.message : "Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, page, limit, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { members, roles, pagination, isLoading, error, refetch: load };
}
