"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  deleteWorkspace,
  getWorkspaceById,
  transferWorkspaceOwnership,
  updateWorkspace,
} from "@/features/workspace/api/workspace";
import { getErrorMessage } from "@/shared/types/api/errors";
import type {
  UpdateWorkspaceRequest,
  WorkspaceResponse,
} from "@/shared/types/workspace";

interface UseWorkspaceSettingsResult {
  workspace: WorkspaceResponse | null;
  isLoading: boolean;
  loadError: string | null;
  isSaving: boolean;
  isDeleting: boolean;
  isTransferring: boolean;
  refetch: () => void;
  /** Updates name/logoUrl. Returns the updated workspace, or null on failure. */
  update: (
    body: Omit<UpdateWorkspaceRequest, "workspaceId">,
  ) => Promise<WorkspaceResponse | null>;
  /** Deletes (archives) the workspace. Returns true on success. */
  remove: () => Promise<boolean>;
  /** Transfers ownership to another user. Returns true on success. */
  transfer: (newOwnerId: string) => Promise<boolean>;
}

/**
 * Loads a workspace and exposes update/delete/transfer actions with toasts.
 * Wraps the existing workspace API (no new endpoints).
 */
export function useWorkspaceSettings(
  workspaceId: string,
): UseWorkspaceSettingsResult {
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const activeRef = useRef(true);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getWorkspaceById(workspaceId);
      if (activeRef.current) setWorkspace(data);
    } catch (err) {
      if (activeRef.current) {
        setLoadError(getErrorMessage(err) || "Failed to load workspace.");
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

  const update = useCallback(
    async (
      body: Omit<UpdateWorkspaceRequest, "workspaceId">,
    ): Promise<WorkspaceResponse | null> => {
      if (!workspaceId) return null;
      setIsSaving(true);
      try {
        const updated = await updateWorkspace({ workspaceId, ...body });
        if (activeRef.current) setWorkspace(updated);
        toast.success("Workspace updated.");
        return updated;
      } catch (err) {
        toast.error(getErrorMessage(err) || "Failed to update workspace.");
        return null;
      } finally {
        if (activeRef.current) setIsSaving(false);
      }
    },
    [workspaceId],
  );

  const remove = useCallback(async (): Promise<boolean> => {
    if (!workspaceId) return false;
    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceId);
      toast.success("Workspace deleted.");
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to delete workspace.");
      return false;
    } finally {
      if (activeRef.current) setIsDeleting(false);
    }
  }, [workspaceId]);

  const transfer = useCallback(
    async (newOwnerId: string): Promise<boolean> => {
      if (!workspaceId) return false;
      setIsTransferring(true);
      try {
        await transferWorkspaceOwnership({ workspaceId, newOwnerId });
        toast.success("Ownership transferred.");
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err) || "Failed to transfer ownership.");
        return false;
      } finally {
        if (activeRef.current) setIsTransferring(false);
      }
    },
    [workspaceId],
  );

  return {
    workspace,
    isLoading,
    loadError,
    isSaving,
    isDeleting,
    isTransferring,
    refetch: load,
    update,
    remove,
    transfer,
  };
}
