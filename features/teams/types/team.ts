/**
 * Teams contracts — mirror of bento-be-gateway team endpoints.
 * Base: /v1/workspace/{workspaceId}/teams. Keep in sync with the gateway.
 */

import type { PaginationMeta } from "@/shared/types/workspace";

export type { PaginationMeta };

/** A team row as returned by the list endpoint. */
export interface TeamListItem {
  id: string;
  name: string;
  icon?: string;
  isArchived: boolean;
  membersCount: number;
}

/** Full team payload from create/get/update. */
export interface TeamResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isArchived?: boolean;
  membersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListTeamsRequest {
  page?: number;
  limit?: number;
  search?: string;
  includeArchived?: boolean;
}

export interface ListTeamsResponse {
  teams: TeamListItem[];
  pagination: PaginationMeta;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  icon?: string;
}

/**
 * A team member row. The backend currently returns only `userId`.
 * TODO(BE): enrich with IAM profile (name, email, avatar) so the UI can
 * show real member identities instead of opaque user ids.
 */
export interface TeamMember {
  userId: string;
  joinedAt: string;
}

export interface ListTeamMembersResponse {
  members: TeamMember[];
  pagination: PaginationMeta;
}

export interface AddTeamMemberRequest {
  workspaceMemberId: string;
}

export interface BulkAddTeamMembersRequest {
  userIds: string[];
}
