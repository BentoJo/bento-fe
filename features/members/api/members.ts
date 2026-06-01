import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  InviteMemberRequest,
  ListInvitesRequest,
  ListInvitesResponse,
  ListMembersRequest,
  ListMembersResponse,
  UpdateMemberRoleRequest,
  WorkspaceInvite,
} from "@/features/members/types/member";

/**
 * Workspace members API (gateway global prefix /api/v1).
 * Gateway wraps gRPC payloads as { success, message, data }, so we unwrap `.data.data`.
 * Note: list endpoints are POST (body carries pagination / search filters).
 */
const BASE = "/v1/workspace";

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

export async function listMembers(
  workspaceId: string,
  body: ListMembersRequest = {},
): Promise<ListMembersResponse> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<ListMembersResponse>>(
      `${BASE}/${workspaceId}/members`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load members.");
  }
}

export async function inviteMember(
  workspaceId: string,
  body: InviteMemberRequest,
): Promise<WorkspaceInvite> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<WorkspaceInvite>>(
      `${BASE}/${workspaceId}/members/invite`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to send invite.");
  }
}

export async function listInvites(
  workspaceId: string,
  body: ListInvitesRequest = {},
): Promise<ListInvitesResponse> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<ListInvitesResponse>>(
      `${BASE}/${workspaceId}/invites`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load invites.");
  }
}

export async function removeMember(
  workspaceId: string,
  memberId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${BASE}/${workspaceId}/members/${memberId}`,
    );
  } catch (error) {
    fail(error, "Failed to remove member.");
  }
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  body: UpdateMemberRoleRequest,
): Promise<void> {
  try {
    await getClientAxios().put(
      `${BASE}/${workspaceId}/members/${memberId}/role`,
      body,
    );
  } catch (error) {
    fail(error, "Failed to update member role.");
  }
}
