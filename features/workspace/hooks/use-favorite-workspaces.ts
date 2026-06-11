"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bento:favorite-workspaces";

function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage may be unavailable (private browsing quota, etc.)
  }
}

interface UseFavoriteWorkspacesResult {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

/**
 * Client-side favorite workspace persistence via localStorage.
 * Safe for SSR: localStorage is only accessed in effects and event handlers.
 */
export function useFavoriteWorkspaces(): UseFavoriteWorkspacesResult {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Hydrate from localStorage once on mount (client-only).
  useEffect(() => {
    setFavoriteIds(readFromStorage());
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((fid) => fid !== id)
        : [...prev, id];
      writeToStorage(next);
      return next;
    });
  }, []);

  return { favoriteIds, isFavorite, toggleFavorite };
}
