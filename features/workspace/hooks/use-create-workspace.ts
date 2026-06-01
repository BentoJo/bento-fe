"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { createWorkspace } from "@/features/workspace/api/workspace";
import { getErrorMessage } from "@/shared/types/api/errors";
import type {
  CreateWorkspaceRequest,
  WorkspaceResponse,
} from "@/shared/types/workspace";

interface UseCreateWorkspaceResult {
  /** Creates a workspace. Returns the created workspace, or null on failure. */
  create: (body: CreateWorkspaceRequest) => Promise<WorkspaceResponse | null>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Wraps the createWorkspace API call with submit/error state and a success
 * toast. Only { name, logoUrl? } are forwarded — the backend supports nothing
 * else yet. TODO(BE): extend once URL/slug, icon-set, and invites land.
 */
export function useCreateWorkspace(): UseCreateWorkspaceResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (body: CreateWorkspaceRequest): Promise<WorkspaceResponse | null> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const workspace = await createWorkspace(body);
        toast.success(`Workspace "${workspace.name}" created.`);
        return workspace;
      } catch (err) {
        const message =
          getErrorMessage(err) || "Failed to create workspace. Please try again.";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { create, isSubmitting, error };
}
