import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  Board,
  CreateBoardRequest,
  ListBoardsRequest,
  ListBoardsResponse,
  UpdateBoardRequest,
  ListFavoriteBoardsResponse,
} from "@/features/boards/types/board";
import { unwrap } from "@/shared/lib/api/unwrap";

/**
 * Boards API (Gateway @Controller('workspace/:wid/boards')).
 * All responses are unwrapped via the unwrap() helper to extract data.data.
 */
const BASE = "/v1/workspace";

function boardsPath(workspaceId: string): string {
  return `${BASE}/${workspaceId}/boards`;
}

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

function mapBoard(board: Board): Board {
  if (!board) return board;
  return {
    ...board,
    visibility: board.isPrivate ? "private" : "public",
  };
}

export async function listBoards(
  workspaceId: string,
  params: ListBoardsRequest = {},
): Promise<ListBoardsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListBoardsResponse>>(
      boardsPath(workspaceId),
      {
        params: {
          ...params,
          page: params.page ?? 1,
          limit: params.limit ?? 20,
        },
      },
    );
    const data = unwrap<ListBoardsResponse>(res);
    return {
      ...data,
      boards: data.boards.map(mapBoard),
    };
  } catch (error) {
    fail(error, "Failed to load boards.");
  }
}

export async function listFavoriteBoards(
  workspaceId: string,
  params: { page?: number; limit?: number } = {},
): Promise<ListFavoriteBoardsResponse> {
  try {
    const res = await getClientAxios().get<
      ApiEnvelope<ListFavoriteBoardsResponse>
    >(`${boardsPath(workspaceId)}/favorites`, { params });
    return unwrap<ListFavoriteBoardsResponse>(res);
  } catch (error) {
    fail(error, "Failed to load favorite boards.");
  }
}

export async function createBoard(
  workspaceId: string,
  body: CreateBoardRequest,
): Promise<Board> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<Board>>(
      boardsPath(workspaceId),
      body,
    );
    return mapBoard(unwrap<Board>(res));
  } catch (error) {
    fail(error, "Failed to create board.");
  }
}

export async function getBoard(
  workspaceId: string,
  boardId: string,
): Promise<Board> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<Board>>(
      `${boardsPath(workspaceId)}/${boardId}`,
    );
    return mapBoard(unwrap<Board>(res));
  } catch (error) {
    fail(error, "Failed to load board.");
  }
}

export async function updateBoard(
  workspaceId: string,
  boardId: string,
  body: UpdateBoardRequest,
): Promise<Board> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<Board>>(
      `${boardsPath(workspaceId)}/${boardId}`,
      body,
    );
    return mapBoard(unwrap<Board>(res));
  } catch (error) {
    fail(error, "Failed to update board.");
  }
}

export async function deleteBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(`${boardsPath(workspaceId)}/${boardId}`);
  } catch (error) {
    fail(error, "Failed to delete board.");
  }
}

export async function archiveBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${boardsPath(workspaceId)}/${boardId}/archive`,
    );
  } catch (error) {
    fail(error, "Failed to archive board.");
  }
}

export async function unarchiveBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${boardsPath(workspaceId)}/${boardId}/unarchive`,
    );
  } catch (error) {
    fail(error, "Failed to unarchive board.");
  }
}

export async function restoreBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${boardsPath(workspaceId)}/${boardId}/restore`,
    );
  } catch (error) {
    fail(error, "Failed to restore board.");
  }
}

export async function favoriteBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${boardsPath(workspaceId)}/${boardId}/favorite`,
    );
  } catch (error) {
    fail(error, "Failed to favorite board.");
  }
}

export async function unfavoriteBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${boardsPath(workspaceId)}/${boardId}/unfavorite`,
    );
  } catch (error) {
    fail(error, "Failed to unfavorite board.");
  }
}
