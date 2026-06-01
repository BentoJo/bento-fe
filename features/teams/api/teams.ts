import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  ListTeamMembersResponse,
  ListTeamsRequest,
  ListTeamsResponse,
  TeamMember,
  TeamResponse,
  UpdateTeamRequest,
} from "@/features/teams/types/team";

/**
 * Teams API (gateway @Controller('workspace/:wid/teams'), global prefix /api/v1).
 * Gateway wraps gRPC payloads as { success, message, data }, so we unwrap `.data.data`.
 */
const BASE = "/v1/workspace";

function teamsPath(workspaceId: string): string {
  return `${BASE}/${workspaceId}/teams`;
}

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

export async function listTeams(
  workspaceId: string,
  params: ListTeamsRequest = {},
): Promise<ListTeamsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListTeamsResponse>>(
      teamsPath(workspaceId),
      { params },
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load teams.");
  }
}

export async function createTeam(
  workspaceId: string,
  body: CreateTeamRequest,
): Promise<TeamResponse> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<TeamResponse>>(
      teamsPath(workspaceId),
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to create team.");
  }
}

export async function getTeam(
  workspaceId: string,
  teamId: string,
): Promise<TeamResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<TeamResponse>>(
      `${teamsPath(workspaceId)}/${teamId}`,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load team.");
  }
}

export async function updateTeam(
  workspaceId: string,
  teamId: string,
  body: UpdateTeamRequest,
): Promise<TeamResponse> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<TeamResponse>>(
      `${teamsPath(workspaceId)}/${teamId}`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to update team.");
  }
}

export async function deleteTeam(
  workspaceId: string,
  teamId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(`${teamsPath(workspaceId)}/${teamId}`);
  } catch (error) {
    fail(error, "Failed to delete team.");
  }
}

export async function archiveTeam(
  workspaceId: string,
  teamId: string,
): Promise<void> {
  try {
    await getClientAxios().post(`${teamsPath(workspaceId)}/${teamId}/archive`);
  } catch (error) {
    fail(error, "Failed to archive team.");
  }
}

export async function unarchiveTeam(
  workspaceId: string,
  teamId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${teamsPath(workspaceId)}/${teamId}/unarchive`,
    );
  } catch (error) {
    fail(error, "Failed to unarchive team.");
  }
}

export async function restoreTeam(
  workspaceId: string,
  teamId: string,
): Promise<void> {
  try {
    await getClientAxios().post(`${teamsPath(workspaceId)}/${teamId}/restore`);
  } catch (error) {
    fail(error, "Failed to restore team.");
  }
}

export async function listTeamMembers(
  workspaceId: string,
  teamId: string,
  params: { page?: number; limit?: number } = {},
): Promise<ListTeamMembersResponse> {
  try {
    const res = await getClientAxios().get<
      ApiEnvelope<ListTeamMembersResponse>
    >(`${teamsPath(workspaceId)}/${teamId}/members`, { params });
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load team members.");
  }
}

export async function addTeamMember(
  workspaceId: string,
  teamId: string,
  body: AddTeamMemberRequest,
): Promise<TeamMember> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<TeamMember>>(
      `${teamsPath(workspaceId)}/${teamId}/members`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to add team member.");
  }
}

export async function removeTeamMember(
  workspaceId: string,
  teamId: string,
  userId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${teamsPath(workspaceId)}/${teamId}/members/${userId}`,
    );
  } catch (error) {
    fail(error, "Failed to remove team member.");
  }
}
