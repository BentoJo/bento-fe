/**
 * Workspace contracts — mirror of bento-be-gateway
 * (src/shared/types/workspace/workspace.ts). Keep in sync with the gateway.
 */

export interface CreateWorkspaceRequest {
  name: string;
  logoUrl?: string;
}

export interface UpdateWorkspaceRequest {
  workspaceId: string;
  name?: string;
  logoUrl?: string | null;
  logoKey?: string | null;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GetWorkspaceRequest {
  workspaceId: string;
}

export interface TransferWorkspaceOwnershipRequest {
  workspaceId: string;
  newOwnerId: string;
}

export interface ListUserWorkspacesRequest {
  page?: number;
  limit?: number;
  search?: string;
  includeArchived?: boolean;
}

export interface WorkspaceListItem {
  id: string;
  name: string;
  logoUrl?: string;
  isArchived: boolean;
  /** Role id only — resolve to a name via the roles endpoint when available. */
  roleId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUserWorkspacesResponse {
  workspaces: WorkspaceListItem[];
  pagination: PaginationMeta;
}

export interface BoardPreview {
  id: string;
  name: string;
  visibility: string;
  columnsCount: number;
  cardCount: number;
}

export interface WorkspacePermissions {
  canCreateBoard: boolean;
  canInviteMembers: boolean;
  canEditWorkspace: boolean;
}

export interface GetWorkspaceOverviewResponse {
  totalBoards: number;
  totalMembers: number;
  totalTeams: number;
  totalCards: number;
  completedCards: number;
  overdueCards: number;
  boardsPreview: BoardPreview[];
  permissions: WorkspacePermissions;
  lastUpdatedAt: string;
}
