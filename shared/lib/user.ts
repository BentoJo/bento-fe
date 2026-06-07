import type { UserSummary } from "@/shared/types/workspace";

/**
 * Display name for an embedded user summary, degrading gracefully:
 * "First Last" → email → id → "Unknown". Use everywhere a member identity
 * is shown so the UI never falls back to raw user ids.
 */
export function userFullName(user?: Partial<UserSummary> | null): string {
  if (!user) return "Unknown";
  const name = [user.firstName, user.lastName]
    .filter((p) => p && p.trim())
    .join(" ")
    .trim();
  return name || user.email || user.id || "Unknown";
}

/** Two-letter avatar initials: name → email → id. */
export function userInitials(user?: Partial<UserSummary> | null): string {
  if (!user) return "?";
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim();
  if (initials) return initials.toUpperCase();
  return (user.email ?? user.id ?? "?").slice(0, 2).toUpperCase();
}
