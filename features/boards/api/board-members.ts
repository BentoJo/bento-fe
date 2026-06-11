import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import { unwrap } from "@/shared/lib/api/unwrap";
import type { UserSummary } from "@/shared/types/workspace";
import type { PaginationMeta } from "@/features/boards/types/board";

/**
 * Board members API (Gateway @Controller('workspace') →
 * /workspace/:workspaceId/boards/:boardId/members).
 * Responses are wrapped as { success, message, data }; unwrap() extracts data.data.
 */
const BASE = "/v1/workspace";

function membersPath(workspaceId: string, boardId: string): string {
  return `${BASE}/${workspaceId}/boards/${boardId}/members`;
}

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

/** A board member as returned by the list endpoint (IAM profile embedded). */
export interface BoardMember {
  user: UserSummary;
  overrideRoleId?: string | null;
  joinedAt: string;
}

export interface ListBoardMembersResponse {
  members: BoardMember[];
  pagination: PaginationMeta;
}

export async function listBoardMembers(
  workspaceId: string,
  boardId: string,
  params: { page?: number; limit?: number; search?: string } = {},
): Promise<ListBoardMembersResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListBoardMembersResponse>>(
      membersPath(workspaceId, boardId),
      { params },
    );
    const data = unwrap<ListBoardMembersResponse>(res);
    return {
      members: Array.isArray(data?.members) ? data.members : [],
      pagination: data?.pagination,
    };
  } catch (error) {
    fail(error, "Failed to load board members.");
  }
}

export async function addBoardMember(
  workspaceId: string,
  boardId: string,
  userId: string,
  overrideRoleId?: string,
): Promise<void> {
  try {
    await getClientAxios().post(membersPath(workspaceId, boardId), {
      userId,
      ...(overrideRoleId ? { overrideRoleId } : {}),
    });
  } catch (error) {
    fail(error, "Failed to add board member.");
  }
}

export async function removeBoardMember(
  workspaceId: string,
  boardId: string,
  userId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${membersPath(workspaceId, boardId)}/${userId}`,
    );
  } catch (error) {
    fail(error, "Failed to remove board member.");
  }
}
