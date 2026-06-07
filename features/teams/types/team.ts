/**
 * Teams contracts — mirror of bento-be-gateway team endpoints.
 * Base: /v1/workspace/{workspaceId}/teams. Keep in sync with the gateway.
 */

import type { PaginationMeta, UserSummary } from "@/shared/types/workspace";

export type { PaginationMeta, UserSummary };

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
 * A team member row. The gateway enriches each member with the IAM user
 * profile (`user`), so the UI shows real identities instead of opaque ids.
 */
export interface TeamMember {
  user: UserSummary;
  joinedAt: string;
}

export interface ListTeamMembersResponse {
  members: TeamMember[];
  pagination: PaginationMeta;
}

export interface AddTeamMemberRequest {
  workspaceMemberId: string;
}

/** Response from POST .../members — the added member, enriched with `user`. */
export interface AddTeamMemberResponse {
  id: string;
  teamId: string;
  user: UserSummary;
  joinedAt: string;
}

export interface BulkAddTeamMembersRequest {
  userIds: string[];
}
