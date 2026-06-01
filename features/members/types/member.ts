/**
 * Workspace members & invites — feature-local types.
 *
 * BACKEND REALITY: the member list returns ONLY { id, userId, authzRoleId, joinedAt }.
 * There is NO name / email / phone / job-field / avatar on a member record.
 * Do NOT fabricate those fields anywhere in the UI.
 * TODO(BE): enrich the member list with IAM user profile data
 * (display name, email, phone, job field, avatar).
 */

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
