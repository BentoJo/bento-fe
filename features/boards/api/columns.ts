import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import {
  Column,
  CreateColumnRequest,
  ListColumnsResponse,
  ReorderColumnRequest,
  UpdateColumnRequest,
  BulkReorderColumnsRequest,
  ListCardsResponse,
  Card,
  CardAssignee,
} from "@/features/boards/types/board";
import { unwrap } from "@/shared/lib/api/unwrap";

function mapCardAssignee(a: CardAssignee): CardAssignee {
  if (!a) return a;
  return {
    ...a,
    userId: a.boardMemberId || a.teamId || "",
  };
}

function mapCard(card: Card): Card {
  if (!card) return card;
  return {
    ...card,
    description: card.descriptionText || undefined,
    visibility: card.isPrivate ? "private" : "public",
    progress: card.progress ? parseInt(card.progress, 10) || 0 : 0,
    assignees: card.assignees?.map(mapCardAssignee),
  };
}


/**
 * Columns API (Gateway @Controller('workspace/:wid/boards/:boardId/columns')).
 * All responses are unwrapped via the unwrap() helper to extract data.data.
 */
const BASE = "/v1/workspace";

function columnsPath(workspaceId: string, boardId: string): string {
  return `${BASE}/${workspaceId}/boards/${boardId}/columns`;
}

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

export async function listColumns(
  workspaceId: string,
  boardId: string,
  includeArchived?: boolean,
): Promise<ListColumnsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListColumnsResponse>>(
      columnsPath(workspaceId, boardId),
      { params: { includeArchived } },
    );
    return unwrap<ListColumnsResponse>(res);
  } catch (error) {
    fail(error, "Failed to load columns.");
  }
}

export async function createColumn(
  workspaceId: string,
  boardId: string,
  body: CreateColumnRequest,
): Promise<Column> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<Column>>(
      columnsPath(workspaceId, boardId),
      body,
    );
    return unwrap<Column>(res);
  } catch (error) {
    fail(error, "Failed to create column.");
  }
}

export async function updateColumn(
  workspaceId: string,
  boardId: string,
  columnId: string,
  body: UpdateColumnRequest,
): Promise<Column> {
  try {
    const res = await getClientAxios().put<ApiEnvelope<Column>>(
      `${columnsPath(workspaceId, boardId)}/${columnId}`,
      body,
    );
    return unwrap<Column>(res);
  } catch (error) {
    fail(error, "Failed to update column.");
  }
}

export async function deleteColumn(
  workspaceId: string,
  boardId: string,
  columnId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${columnsPath(workspaceId, boardId)}/${columnId}`,
    );
  } catch (error) {
    fail(error, "Failed to delete column.");
  }
}

export async function reorderColumn(
  workspaceId: string,
  boardId: string,
  columnId: string,
  body: ReorderColumnRequest,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${columnsPath(workspaceId, boardId)}/${columnId}/reorder`,
      body,
    );
  } catch (error) {
    fail(error, "Failed to reorder column.");
  }
}

export async function bulkReorderColumns(
  workspaceId: string,
  boardId: string,
  body: BulkReorderColumnsRequest,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${columnsPath(workspaceId, boardId)}/reorder`,
      body,
    );
  } catch (error) {
    fail(error, "Failed to bulk reorder columns.");
  }
}

export async function archiveColumn(
  workspaceId: string,
  boardId: string,
  columnId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${columnsPath(workspaceId, boardId)}/${columnId}/archive`,
    );
  } catch (error) {
    fail(error, "Failed to archive column.");
  }
}

export async function unarchiveColumn(
  workspaceId: string,
  boardId: string,
  columnId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${columnsPath(workspaceId, boardId)}/${columnId}/unarchive`,
    );
  } catch (error) {
    fail(error, "Failed to unarchive column.");
  }
}

export async function restoreColumn(
  workspaceId: string,
  boardId: string,
  columnId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${columnsPath(workspaceId, boardId)}/${columnId}/restore`,
    );
  } catch (error) {
    fail(error, "Failed to restore column.");
  }
}

export async function listColumnCards(
  workspaceId: string,
  boardId: string,
  columnId: string,
  params: { page?: number; limit?: number } = {},
): Promise<ListCardsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListCardsResponse>>(
      `${columnsPath(workspaceId, boardId)}/${columnId}/cards`,
      { params },
    );
    const data = unwrap<ListCardsResponse>(res);
    return {
      ...data,
      cards: data.cards.map(mapCard),
    };
  } catch (error) {
    fail(error, "Failed to load column cards.");
  }
}
