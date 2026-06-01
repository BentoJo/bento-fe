import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  Card,
  CreateCardRequest,
  ListCardsResponse,
  MoveCardRequest,
  UpdateCardRequest,
} from "@/features/boards/types/board";

/**
 * Cards API (EXPECTED gateway @Controller('workspace/:wid/boards/:boardId/cards'),
 * global prefix /api/v1). Gateway wraps gRPC payloads as
 * { success, message, data }, so we unwrap `.data.data`.
 *
 * TODO(BE): gateway board/column/card REST not implemented yet — these paths
 * are the expected contract. Functions may throw; callers (hooks) catch.
 */
const BASE = "/v1/workspace";

function cardsPath(workspaceId: string, boardId: string): string {
  return `${BASE}/${workspaceId}/boards/${boardId}/cards`;
}

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

export async function listCards(
  workspaceId: string,
  boardId: string,
): Promise<ListCardsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListCardsResponse>>(
      cardsPath(workspaceId, boardId),
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to load cards.");
  }
}

export async function createCard(
  workspaceId: string,
  boardId: string,
  body: CreateCardRequest,
): Promise<Card> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<Card>>(
      cardsPath(workspaceId, boardId),
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to create task.");
  }
}

export async function updateCard(
  workspaceId: string,
  boardId: string,
  cardId: string,
  body: UpdateCardRequest,
): Promise<Card> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<Card>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}`,
      body,
    );
    return res.data.data;
  } catch (error) {
    fail(error, "Failed to update task.");
  }
}

export async function deleteCard(
  workspaceId: string,
  boardId: string,
  cardId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${cardsPath(workspaceId, boardId)}/${cardId}`,
    );
  } catch (error) {
    fail(error, "Failed to delete task.");
  }
}

export async function moveCard(
  workspaceId: string,
  boardId: string,
  cardId: string,
  body: MoveCardRequest,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${cardsPath(workspaceId, boardId)}/${cardId}/move`,
      body,
    );
  } catch (error) {
    fail(error, "Failed to move task.");
  }
}
