"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import {
  createColumn as apiCreateColumn,
  updateColumn as apiUpdateColumn,
  deleteColumn as apiDeleteColumn,
  reorderColumn as apiReorderColumn,
  bulkReorderColumns as apiBulkReorderColumns,
} from "@/features/boards/api/columns";
import type {
  Column,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnRequest,
  BulkReorderColumnsRequest,
} from "@/features/boards/types/board";
import { getErrorMessage } from "@/shared/types/api/errors";

interface UseColumnActionsResult {
  createColumn: (body: CreateColumnRequest) => Promise<Column | null>;
  updateColumn: (columnId: string, body: UpdateColumnRequest) => Promise<Column | null>;
  deleteColumn: (columnId: string) => Promise<boolean>;
  reorderColumn: (columnId: string, body: ReorderColumnRequest) => Promise<boolean>;
  bulkReorderColumns: (body: BulkReorderColumnsRequest) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Custom hook providing column CRUD and reordering mutations.
 * Calls the API gateway and triggers an optional `onSuccess` callback (e.g. refetch board).
 */
export function useColumnActions(
  workspaceId: string,
  boardId: string,
  onSuccess?: () => void,
): UseColumnActionsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown, fallback: string) => {
    const message = getErrorMessage(err) || fallback;
    setError(message);
    toast.error(message);
    return message;
  }, []);

  const createColumn = useCallback(
    async (body: CreateColumnRequest): Promise<Column | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const col = await apiCreateColumn(workspaceId, boardId, body);
        toast.success(`Column "${col.name}" created.`);
        onSuccess?.();
        return col;
      } catch (err) {
        handleError(err, "Failed to create column.");
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  const updateColumn = useCallback(
    async (columnId: string, body: UpdateColumnRequest): Promise<Column | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const col = await apiUpdateColumn(workspaceId, boardId, columnId, body);
        toast.success(`Column updated.`);
        onSuccess?.();
        return col;
      } catch (err) {
        handleError(err, "Failed to update column.");
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  const deleteColumn = useCallback(
    async (columnId: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        await apiDeleteColumn(workspaceId, boardId, columnId);
        toast.success("Column deleted.");
        onSuccess?.();
        return true;
      } catch (err) {
        handleError(err, "Failed to delete column.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  const reorderColumn = useCallback(
    async (columnId: string, body: ReorderColumnRequest): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        await apiReorderColumn(workspaceId, boardId, columnId, body);
        onSuccess?.();
        return true;
      } catch (err) {
        handleError(err, "Failed to reorder column.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  const bulkReorderColumns = useCallback(
    async (body: BulkReorderColumnsRequest): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        await apiBulkReorderColumns(workspaceId, boardId, body);
        onSuccess?.();
        return true;
      } catch (err) {
        handleError(err, "Failed to reorder columns.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
    bulkReorderColumns,
    isSubmitting,
    error,
  };
}
