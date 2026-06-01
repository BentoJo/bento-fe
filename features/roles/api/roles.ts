import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  GetRolePermissionsResponse,
  GetWorkspaceRolesResponse,
  WorkspaceRole,
} from "@/features/roles/types/role";

/**
 * Workspace roles API (gateway @Controller('workspace'), global prefix /api/v1).
 * Gateway wraps gRPC payloads as { success, message, data }, so we unwrap `.data.data`.
 */
const BASE = "/v1/workspace";

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
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
