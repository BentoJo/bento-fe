/**
 * Workspace roles & permissions contracts.
 *
 * Mirrors the gateway endpoints (global prefix /api/v1, base /workspace):
 *   GET    /{workspaceId}/roles
 *   GET    /{workspaceId}/roles/{authzRoleId}/permissions
 *   DELETE /{workspaceId}/roles/{authzRoleId}
 *
 * Notes honored from the contract:
 *   - There is NO "create role with permissions" endpoint.
 *   - There is NO "assigned to N users" count.
 */

/** A single workspace role reference (points at an authz role). */
export interface WorkspaceRole {
  authzRoleId: string;
  roleName: string;
  /** System (built-in) roles cannot be deleted. */
  isSystemRole: boolean;
}

/** Response of GET /{workspaceId}/roles. */
export interface GetWorkspaceRolesResponse {
  workspaceId: string;
  roles: WorkspaceRole[];
}

/** Response of GET /{workspaceId}/roles/{authzRoleId}/permissions. */
export interface GetRolePermissionsResponse {
  permissions: string[];
}
