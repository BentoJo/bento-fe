"use client";

import { create } from "zustand";

import { moveCard as apiMoveCard } from "@/features/boards/api/cards";
import type { Card, Column } from "@/features/boards/types/board";

/**
 * Global Zustand store for the current Kanban board.
 *
 * Holds the board's columns + cards and provides an optimistic moveCard action:
 *   1. Update local state immediately (UI feels instant).
 *   2. Call the API.
 *   3. Roll back on failure.
 *
 * Populate this store via `setBoardData` after the board loads.
 * The KanbanBoard component calls `setBoardData` on initial load + after any
 * refetch, so the store always mirrors the canonical server state between
 * optimistic operations.
 */

interface BoardStoreState {
  workspaceId: string;
  boardId: string;
  columns: Column[];
  cardsByColumn: Record<string, Card[]>;

  /** Hydrate the store after a server fetch. */
  setBoardData: (
    workspaceId: string,
    boardId: string,
    columns: Column[],
    cardsByColumn: Record<string, Card[]>,
  ) => void;

  /**
   * Optimistically moves a card to a new column at a given index.
   * Calls the moveCard API in the background; rolls back on failure.
   * Returns `true` if the API call succeeded, `false` otherwise.
   */
  moveCardOptimistic: (
    cardId: string,
    toColumnId: string,
    toIndex: number,
  ) => Promise<boolean>;
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  workspaceId: "",
  boardId: "",
  columns: [],
  cardsByColumn: {},

  setBoardData(workspaceId, boardId, columns, cardsByColumn) {
    set({ workspaceId, boardId, columns, cardsByColumn });
  },

  async moveCardOptimistic(cardId, toColumnId, toIndex) {
    const { workspaceId, boardId, cardsByColumn } = get();

    // Find source column and card
    let fromColumnId: string | null = null;
    let card: Card | null = null;

    for (const [colId, cards] of Object.entries(cardsByColumn)) {
      const found = cards.find((c) => c.id === cardId);
      if (found) {
        fromColumnId = colId;
        card = found;
        break;
      }
    }

    if (!card || !fromColumnId) return false;
    if (fromColumnId === toColumnId) return true; // no-op

    // Snapshot for rollback
    const snapshot = { ...cardsByColumn };
    const snapshotFrom = [...(cardsByColumn[fromColumnId] ?? [])];
    const snapshotTo = [...(cardsByColumn[toColumnId] ?? [])];

    // Build optimistic next state
    const nextFrom = snapshotFrom.filter((c) => c.id !== cardId);
    const updatedCard: Card = { ...card, columnId: toColumnId };
    const nextTo = [...snapshotTo];
    const safeIndex = Math.min(toIndex, nextTo.length);
    nextTo.splice(safeIndex, 0, updatedCard);

    set({
      cardsByColumn: {
        ...cardsByColumn,
        [fromColumnId]: nextFrom,
        [toColumnId]: nextTo,
      },
    });

    try {
      await apiMoveCard(workspaceId, boardId, cardId, {
        columnId: toColumnId,
        position: safeIndex + 1, // 1-indexed
      });
      return true;
    } catch {
      // Roll back
      set({ cardsByColumn: snapshot });
      return false;
    }
  },
}));
