"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getBoard } from "@/features/boards/api/boards";
import { listColumns } from "@/features/boards/api/columns";
import { listCards } from "@/features/boards/api/cards";
import type { Board, Card, Column } from "@/features/boards/types/board";

interface UseBoardResult {
  board: Board | null;
  columns: Column[];
  cards: Card[];
  /** Cards grouped by columnId for convenient rendering. */
  cardsByColumn: Record<string, Card[]>;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Loads a single board + its columns + its cards (grouped by column).
 *
 * WIRE-LATER: the gateway does not expose boards/columns/cards yet, so every
 * fetch degrades to a graceful EMPTY state — the board view never crashes.
 * TODO(BE): gateway board/column/card REST not implemented yet.
 */
export function useBoard(
  workspaceId: string,
  boardId: string,
): UseBoardResult {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!workspaceId || !boardId) return;
    setIsLoading(true);
    setError(null);

    // Each fetch fails independently → partial data still renders.
    const [boardRes, columnsRes, cardsRes] = await Promise.allSettled([
      getBoard(workspaceId, boardId),
      listColumns(workspaceId, boardId),
      listCards(workspaceId, boardId),
    ]);

    if (boardRes.status === "fulfilled") {
      setBoard(boardRes.value ?? null);
    } else {
      setBoard(null);
    }

    if (columnsRes.status === "fulfilled") {
      const list = columnsRes.value?.columns;
      setColumns(Array.isArray(list) ? list : []);
    } else {
      setColumns([]);
    }

    if (cardsRes.status === "fulfilled") {
      const list = cardsRes.value?.cards;
      setCards(Array.isArray(list) ? list : []);
    } else {
      setCards([]);
    }

    // Surface board-level errors (e.g. "Not a board member") immediately.
    // Fall back to a generic error only when EVERYTHING failed (backend unwired).
    if (boardRes.status === "rejected") {
      const reason = boardRes.reason;
      setError(
        reason instanceof Error ? reason.message : "Failed to load board.",
      );
    } else if (
      columnsRes.status === "rejected" &&
      cardsRes.status === "rejected"
    ) {
      const reason = columnsRes.reason;
      setError(
        reason instanceof Error ? reason.message : "Failed to load board.",
      );
    }

    setIsLoading(false);
  }, [workspaceId, boardId]);

  useEffect(() => {
    void load();
  }, [load]);

  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, Card[]> = {};
    for (const col of columns) grouped[col.id] = [];
    for (const card of cards) {
      if (!grouped[card.columnId]) grouped[card.columnId] = [];
      grouped[card.columnId].push(card);
    }
    return grouped;
  }, [columns, cards]);

  return {
    board,
    columns,
    cards,
    cardsByColumn,
    isLoading,
    error,
    refetch: load,
  };
}
