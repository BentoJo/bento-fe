"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import {
  createCard as apiCreateCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  moveCard as apiMoveCard,
} from "@/features/boards/api/cards";
import type {
  Card,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
} from "@/features/boards/types/board";
import { getErrorMessage } from "@/shared/types/api/errors";

interface UseCardActionsResult {
  createCard: (body: CreateCardRequest) => Promise<Card | null>;
  updateCard: (cardId: string, body: UpdateCardRequest) => Promise<Card | null>;
  deleteCard: (cardId: string) => Promise<boolean>;
  moveCard: (cardId: string, body: MoveCardRequest) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Custom hook providing card (task) CRUD and move mutations.
 * Calls the API gateway and triggers an optional `onSuccess` callback (e.g. refetch board).
 */
export function useCardActions(
  workspaceId: string,
  boardId: string,
  onSuccess?: () => void,
): UseCardActionsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown, fallback: string) => {
    const message = getErrorMessage(err) || fallback;
    setError(message);
    toast.error(message);
    return message;
  }, []);

  const createCard = useCallback(
    async (body: CreateCardRequest): Promise<Card | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const card = await apiCreateCard(workspaceId, boardId, body);
        toast.success(`Task "${card.title}" created.`);
        onSuccess?.();
        return card;
      } catch (err) {
        handleError(err, "Failed to create task.");
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  const updateCard = useCallback(
    async (cardId: string, body: UpdateCardRequest): Promise<Card | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const card = await apiUpdateCard(workspaceId, boardId, cardId, body);
        toast.success("Task updated.");
        onSuccess?.();
        return card;
      } catch (err) {
        handleError(err, "Failed to update task.");
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  const deleteCard = useCallback(
    async (cardId: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        await apiDeleteCard(workspaceId, boardId, cardId);
        toast.success("Task deleted.");
        onSuccess?.();
        return true;
      } catch (err) {
        handleError(err, "Failed to delete task.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  const moveCard = useCallback(
    async (cardId: string, body: MoveCardRequest): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        await apiMoveCard(workspaceId, boardId, cardId, body);
        onSuccess?.();
        return true;
      } catch (err) {
        handleError(err, "Failed to move task.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [workspaceId, boardId, onSuccess, handleError],
  );

  return {
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    isSubmitting,
    error,
  };
}
