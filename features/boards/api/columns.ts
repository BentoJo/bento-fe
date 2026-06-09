import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  Column,
  CreateColumnRequest,
  ListColumnsResponse,
  ReorderColumnRequest,
  UpdateColumnRequest,
  BulkReorderColumnsRequest,
} from "@/features/boards/types/board";
import { unwrap } from "@/shared/lib/api/unwrap";

/**
 * Columns API (EXPECTED gateway @Controller('workspace/:wid/boards/:boardId/columns'),
 * global prefix /api/v1). Gateway wraps gRPC payloads as
 * { success, message, data }, so we unwrap `.data.data`.
 *
 * TODO(BE): gateway board/column/card REST not implemented yet — these paths
 * are the expected contract. Functions may throw; callers (hooks) catch.
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
): Promise<ListColumnsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListColumnsResponse>>(
      columnsPath(workspaceId, boardId),
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
