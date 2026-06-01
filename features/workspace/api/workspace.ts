import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  CreateWorkspaceRequest,
  GetWorkspaceOverviewResponse,
  ListUserWorkspacesRequest,
  ListUserWorkspacesResponse,
  TransferWorkspaceOwnershipRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
} from "@/shared/types/workspace";

/**
 * Workspace API (gateway @Controller('workspace'), global prefix /api/v1).
 * Gateway wraps gRPC payloads as { success, message, data }, so we unwrap `.data.data`.
 */
const BASE = "/v1/workspace";

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

export async function createWorkspace(
  body: CreateWorkspaceRequest,
): Promise<WorkspaceResponse> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<WorkspaceResponse>>(
      `${BASE}/create`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to create workspace.");
  }
}

export async function listUserWorkspaces(
  body: ListUserWorkspacesRequest = {},
): Promise<ListUserWorkspacesResponse> {
  try {
    const res = await getClientAxios().post<
      ApiEnvelope<ListUserWorkspacesResponse>
    >(`${BASE}/me/workspaces`, body);
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load workspaces.");
  }
}

export async function getWorkspaceById(
  workspaceId: string,
): Promise<WorkspaceResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<WorkspaceResponse>>(
      `${BASE}/${workspaceId}`,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load workspace.");
  }
}

export async function getWorkspaceOverview(
  workspaceId: string,
): Promise<GetWorkspaceOverviewResponse> {
  try {
    const res = await getClientAxios().get<
      ApiEnvelope<GetWorkspaceOverviewResponse>
    >(`${BASE}/${workspaceId}/overview`);
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load workspace overview.");
  }
}

export async function updateWorkspace(
  body: UpdateWorkspaceRequest,
): Promise<WorkspaceResponse> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<WorkspaceResponse>>(
      `${BASE}/${body.workspaceId}`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to update workspace.");
  }
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  try {
    await getClientAxios().delete(`${BASE}/${workspaceId}`);
  } catch (error) {
    fail(error, "Failed to delete workspace.");
  }
}

export async function restoreWorkspace(workspaceId: string): Promise<void> {
  try {
    await getClientAxios().post(`${BASE}/${workspaceId}/restore`);
  } catch (error) {
    fail(error, "Failed to restore workspace.");
  }
}

export async function transferWorkspaceOwnership(
  body: TransferWorkspaceOwnershipRequest,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${BASE}/${body.workspaceId}/transfer-ownership`,
      { newOwnerId: body.newOwnerId },
    );
  } catch (error) {
    fail(error, "Failed to transfer ownership.");
  }
}
