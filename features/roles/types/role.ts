/**
 * Workspace roles & permissions contracts.
 *
 * Mirrors the gateway endpoints (global prefix /api/v1, base /workspace):
 *   POST   /{workspaceId}/roles
 *   GET    /{workspaceId}/roles
 *   PUT    /{workspaceId}/roles/{authzRoleId}
 *   GET    /{workspaceId}/roles/{authzRoleId}/permissions
 *   POST   /{workspaceId}/roles/{authzRoleId}/permissions
 *   DELETE /{workspaceId}/roles/{authzRoleId}/permissions
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

/** Request of POST /{workspaceId}/roles */
export interface CreateRoleRequest {
  name: string;
  scopeType: 'workspace';
}

/** Response of POST /{workspaceId}/roles */
export interface CreateRoleResponse {
  roleId: string;
}

/** Request of PUT /{workspaceId}/roles/{authzRoleId} */
export interface UpdateRoleRequest {
  name?: string;
  isEditable?: boolean;
  isDeletable?: boolean;
}

/** Response of PUT /{workspaceId}/roles/{authzRoleId} */
export interface UpdateRoleResponse {
  success: boolean;
}

/** Request of POST /{workspaceId}/roles/{authzRoleId}/permissions */
export interface AssignPermissionsRequest {
  permissionIds: string[];
}

/** Response of POST /{workspaceId}/roles/{authzRoleId}/permissions */
export interface AssignPermissionsResponse {
  success: boolean;
}

/** Request of DELETE /{workspaceId}/roles/{authzRoleId}/permissions */
export interface RemovePermissionsRequest {
  permissionIds: string[];
}

/** Response of DELETE /{workspaceId}/roles/{authzRoleId}/permissions */
export interface RemovePermissionsResponse {
  success: boolean;
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

/**
 * A single permission descriptor returned by GET /{workspaceId}/permissions.
 * TODO(BE): getPermissions must be exposed by Workspace Service + gateway.
 */
export interface WorkspacePermission {
  id: string;
  name: string;
  description?: string;
}

/** Response of GET /{workspaceId}/permissions. */
export interface GetWorkspacePermissionsResponse {
  permissions: WorkspacePermission[];
}
