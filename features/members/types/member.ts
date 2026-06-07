/**
 * Workspace members & invites — feature-local types.
 *
 * The gateway enriches each member with the IAM user profile (`user`) when it
 * can resolve it. It may still be absent if the IAM lookup degraded, so treat
 * `user` as optional and fall back via the `userFullName`/`userInitials` helpers.
 */

import type { UserSummary } from "@/shared/types/workspace";

export type { UserSummary };

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** A single workspace member as returned by POST /members. */
export interface WorkspaceMember {
  id: string;
  userId: string;
  authzRoleId: string;
  joinedAt: string;
  /** IAM profile, embedded by the gateway when resolvable. */
  user?: UserSummary | null;
}

export interface ListMembersRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListMembersResponse {
  members: WorkspaceMember[];
  pagination: PaginationMeta;
}

/** Invite status as reported by the gateway. */
export type InviteStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "revoked"
  | string;

export interface WorkspaceInvite {
  id: string;
  email: string;
  authzRoleId: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

export interface ListInvitesRequest {
  page?: number;
  limit?: number;
  status?: InviteStatus;
  search?: string;
}

export interface ListInvitesResponse {
  invites: WorkspaceInvite[];
  pagination: PaginationMeta;
}

export interface InviteMemberRequest {
  email: string;
  authzRoleId: string;
  message?: string;
}

export interface UpdateMemberRoleRequest {
  authzRoleId: string;
}
