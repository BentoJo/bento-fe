import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  GetRolePermissionsResponse,
  GetWorkspaceRolesResponse,
  WorkspaceRole,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  AssignPermissionsRequest,
  AssignPermissionsResponse,
  RemovePermissionsRequest,
  RemovePermissionsResponse,
} from "@/features/roles/types/role";

/**
 * Workspace roles API (gateway @Controller('workspace'), global prefix /api/v1).
 * Gateway wraps gRPC payloads as { success, message, data }, so we unwrap `.data.data`.
 */
const BASE = "/v1/workspace";

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

/** POST /{workspaceId}/roles */
export async function createRole(
  workspaceId: string,
  data: CreateRoleRequest,
): Promise<string> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<CreateRoleResponse>>(
      `${BASE}/${workspaceId}/roles`,
      data,
    );
    return res.data.data.roleId;
  } catch (error) {
    fail(error, "Failed to create role.");
  }
}

/** PUT /{workspaceId}/roles/{authzRoleId} */
export async function updateRole(
  workspaceId: string,
  authzRoleId: string,
  data: UpdateRoleRequest,
): Promise<boolean> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<UpdateRoleResponse>>(
      `${BASE}/${workspaceId}/roles/${authzRoleId}`,
      data,
    );
    return res.data.data.success;
  } catch (error) {
    fail(error, "Failed to update role.");
  }
}

/** POST /{workspaceId}/roles/{authzRoleId}/permissions */
export async function assignPermissionsToRole(
  workspaceId: string,
  authzRoleId: string,
  data: AssignPermissionsRequest,
): Promise<boolean> {
  try {
    const res = await getClientAxios().post<
      ApiEnvelope<AssignPermissionsResponse>
    >(`${BASE}/${workspaceId}/roles/${authzRoleId}/permissions`, data);
    return res.data.data.success;
  } catch (error) {
    fail(error, "Failed to assign permissions.");
  }
}

/** DELETE /{workspaceId}/roles/{authzRoleId}/permissions */
export async function removePermissionsFromRole(
  workspaceId: string,
  authzRoleId: string,
  data: RemovePermissionsRequest,
): Promise<boolean> {
  try {
    const res = await getClientAxios().delete<
      ApiEnvelope<RemovePermissionsResponse>
    >(`${BASE}/${workspaceId}/roles/${authzRoleId}/permissions`, { data });
    return res.data.data.success;
  } catch (error) {
    fail(error, "Failed to remove permissions.");
  }
}

/** GET /{workspaceId}/roles */
export async function listRoles(
  workspaceId: string,
): Promise<{ workspaceId: string; roles: WorkspaceRole[] }> {
  try {
    const res = await getClientAxios().get<
      ApiEnvelope<GetWorkspaceRolesResponse>
    >(`${BASE}/${workspaceId}/roles`);
    const data = res.data.data;
    return {
      workspaceId: data?.workspaceId ?? workspaceId,
      roles: Array.isArray(data?.roles) ? data.roles : [],
    };
  } catch (error) {
    fail(error, "Failed to load roles.");
  }
}

/** GET /{workspaceId}/roles/{authzRoleId}/permissions */
export async function getRolePermissions(
  workspaceId: string,
  authzRoleId: string,
): Promise<string[]> {
  try {
    const res = await getClientAxios().get<
      ApiEnvelope<GetRolePermissionsResponse>
    >(`${BASE}/${workspaceId}/roles/${authzRoleId}/permissions`);
    const permissions = res.data.data?.permissions;
    return Array.isArray(permissions) ? permissions : [];
  } catch (error) {
    fail(error, "Failed to load role permissions.");
  }
}

/** DELETE /{workspaceId}/roles/{authzRoleId} — only non-system roles. */
export async function deleteRole(
  workspaceId: string,
  authzRoleId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${BASE}/${workspaceId}/roles/${authzRoleId}`,
    );
  } catch (error) {
    fail(error, "Failed to delete role.");
  }
}
