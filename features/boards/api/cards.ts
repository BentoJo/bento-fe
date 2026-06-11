import { getClientAxios } from "@/shared/lib/api/client";
import { getErrorMessage } from "@/shared/types/api/errors";
import type { ApiEnvelope } from "@/shared/types/api/response";
import type {
  Card,
  CreateCardRequest,
  ListCardsResponse,
  MoveCardRequest,
  UpdateCardRequest,
  CardAssignee,
  CardLabel,
  CardComment,
  CardChecklist,
  ListCardCommentsResponse,
  CreateLabelRequest,
  ListLabelsResponse,
  AddCommentRequest,
  CreateChecklistRequest,
  AddChecklistItemRequest,
  ChecklistItem,
} from "@/features/boards/types/board";
import { unwrap } from "@/shared/lib/api/unwrap";

/**
 * Cards API (Gateway @Controller('workspace/:wid/boards/:boardId/cards')).
 * All responses are unwrapped via the unwrap() helper to extract data.data.
 */
const BASE = "/v1/workspace";

function cardsPath(workspaceId: string, boardId: string): string {
  return `${BASE}/${workspaceId}/boards/${boardId}/cards`;
}

function fail(error: unknown, fallback: string): never {
  throw new Error(getErrorMessage(error) || fallback);
}

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
    status: card.columnId, // Fallback for UI; should ideally be column name
    assignees: card.assignees?.map(mapCardAssignee),
  };
}

// ---------------------------
// CARD CRUD
// ---------------------------

export async function listCards(
  workspaceId: string,
  boardId: string,
  includeArchived?: boolean,
): Promise<ListCardsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListCardsResponse>>(
      cardsPath(workspaceId, boardId),
      { params: { includeArchived } },
    );
    const data = unwrap<ListCardsResponse>(res);
    return {
      ...data,
      cards: data.cards.map(mapCard),
    };
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
    return mapCard(unwrap<Card>(res));
  } catch (error) {
    fail(error, "Failed to create task.");
  }
}

export async function getCard(
  workspaceId: string,
  boardId: string,
  cardId: string,
): Promise<Card> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<Card>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}`,
    );
    return mapCard(unwrap<Card>(res));
  } catch (error) {
    fail(error, "Failed to load task.");
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
    return mapCard(unwrap<Card>(res));
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

export async function archiveCard(
  workspaceId: string,
  boardId: string,
  cardId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${cardsPath(workspaceId, boardId)}/${cardId}/archive`,
    );
  } catch (error) {
    fail(error, "Failed to archive card.");
  }
}

export async function restoreCard(
  workspaceId: string,
  boardId: string,
  cardId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${cardsPath(workspaceId, boardId)}/${cardId}/restore`,
    );
  } catch (error) {
    fail(error, "Failed to restore card.");
  }
}

// ---------------------------
// ASSIGNEES
// ---------------------------

export async function listCardAssignees(
  workspaceId: string,
  boardId: string,
  cardId: string,
): Promise<CardAssignee[]> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<{ assignees: CardAssignee[] }>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}/assignees`,
    );
    return unwrap<{ assignees: CardAssignee[] }>(res).assignees;
  } catch (error) {
    fail(error, "Failed to load assignees.");
  }
}

export async function addCardAssignee(
  workspaceId: string,
  boardId: string,
  cardId: string,
  body: { assigneeType: string; boardMemberId?: string; teamId?: string },
): Promise<CardAssignee> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<CardAssignee>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}/assignees`,
      body,
    );
    return unwrap<CardAssignee>(res);
  } catch (error) {
    fail(error, "Failed to add assignee.");
  }
}

export async function removeCardAssignee(
  workspaceId: string,
  boardId: string,
  cardId: string,
  assigneeId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${cardsPath(workspaceId, boardId)}/${cardId}/assignees/${assigneeId}`,
    );
  } catch (error) {
    fail(error, "Failed to remove assignee.");
  }
}

// ---------------------------
// LABELS (card level)
// ---------------------------

export async function addCardLabel(
  workspaceId: string,
  boardId: string,
  cardId: string,
  labelId: string,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${cardsPath(workspaceId, boardId)}/${cardId}/labels`,
      { labelId },
    );
  } catch (error) {
    fail(error, "Failed to add label.");
  }
}

export async function removeCardLabel(
  workspaceId: string,
  boardId: string,
  cardId: string,
  labelId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${cardsPath(workspaceId, boardId)}/${cardId}/labels/${labelId}`,
    );
  } catch (error) {
    fail(error, "Failed to remove label.");
  }
}

// ---------------------------
// COMMENTS
// ---------------------------

export async function listCardComments(
  workspaceId: string,
  boardId: string,
  cardId: string,
  params: { page?: number; limit?: number } = {},
): Promise<ListCardCommentsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListCardCommentsResponse>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}/comments`,
      { params },
    );
    return unwrap<ListCardCommentsResponse>(res);
  } catch (error) {
    fail(error, "Failed to load comments.");
  }
}

export async function addComment(
  workspaceId: string,
  boardId: string,
  cardId: string,
  body: AddCommentRequest,
): Promise<CardComment> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<CardComment>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}/comments`,
      body,
    );
    return unwrap<CardComment>(res);
  } catch (error) {
    fail(error, "Failed to add comment.");
  }
}

export async function deleteComment(
  workspaceId: string,
  boardId: string,
  cardId: string,
  commentId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${cardsPath(workspaceId, boardId)}/${cardId}/comments/${commentId}`,
    );
  } catch (error) {
    fail(error, "Failed to delete comment.");
  }
}

// ---------------------------
// CHECKLISTS
// ---------------------------

export async function listCardChecklists(
  workspaceId: string,
  boardId: string,
  cardId: string,
): Promise<CardChecklist[]> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<{ checklists: CardChecklist[] }>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}/checklists`,
    );
    const checklists = unwrap<{ checklists: CardChecklist[] }>(res).checklists;
    // proto3 omits empty `repeated` fields, so `items` may be absent — normalize
    // to an array so the UI can safely .map()/.length over it.
    return (Array.isArray(checklists) ? checklists : []).map((c) => ({
      ...c,
      items: Array.isArray(c.items) ? c.items : [],
    }));
  } catch (error) {
    fail(error, "Failed to load checklists.");
  }
}

export async function createChecklist(
  workspaceId: string,
  boardId: string,
  cardId: string,
  body: CreateChecklistRequest,
): Promise<CardChecklist> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<CardChecklist>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}/checklists`,
      body,
    );
    const cl = unwrap<CardChecklist>(res);
    return { ...cl, items: Array.isArray(cl.items) ? cl.items : [] };
  } catch (error) {
    fail(error, "Failed to create checklist.");
  }
}

export async function addChecklistItem(
  workspaceId: string,
  boardId: string,
  cardId: string,
  checklistId: string,
  body: AddChecklistItemRequest,
): Promise<ChecklistItem> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<ChecklistItem>>(
      `${cardsPath(workspaceId, boardId)}/${cardId}/checklists/${checklistId}/items`,
      body,
    );
    return unwrap<ChecklistItem>(res);
  } catch (error) {
    fail(error, "Failed to add checklist item.");
  }
}

export async function toggleChecklistItem(
  workspaceId: string,
  boardId: string,
  cardId: string,
  checklistId: string,
  itemId: string,
  isCompleted: boolean,
): Promise<void> {
  try {
    await getClientAxios().post(
      `${cardsPath(workspaceId, boardId)}/${cardId}/checklists/${checklistId}/items/${itemId}/toggle`,
      { isCompleted },
    );
  } catch (error) {
    fail(error, "Failed to toggle checklist item.");
  }
}

export async function deleteChecklistItem(
  workspaceId: string,
  boardId: string,
  cardId: string,
  checklistId: string,
  itemId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(
      `${cardsPath(workspaceId, boardId)}/${cardId}/checklists/${checklistId}/items/${itemId}`,
    );
  } catch (error) {
    fail(error, "Failed to delete checklist item.");
  }
}

// ---------------------------
// LABELS (workspace level)
// ---------------------------

export async function listWorkspaceLabels(
  workspaceId: string,
): Promise<ListLabelsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListLabelsResponse>>(
      `${BASE}/${workspaceId}/labels`,
    );
    const data = unwrap<ListLabelsResponse>(res);
    // proto3 may omit an empty `labels` array — normalize.
    return { labels: Array.isArray(data?.labels) ? data.labels : [] };
  } catch (error) {
    fail(error, "Failed to load workspace labels.");
  }
}

export async function createLabel(
  workspaceId: string,
  body: CreateLabelRequest,
): Promise<CardLabel> {
  try {
    const res = await getClientAxios().post<ApiEnvelope<CardLabel>>(
      `${BASE}/${workspaceId}/labels`,
      body,
    );
    return unwrap<CardLabel>(res);
  } catch (error) {
    fail(error, "Failed to create label.");
  }
}

export async function deleteLabel(
  workspaceId: string,
  labelId: string,
): Promise<void> {
  try {
    await getClientAxios().delete(`${BASE}/${workspaceId}/labels/${labelId}`);
  } catch (error) {
    fail(error, "Failed to delete label.");
  }
}

// ---------------------------
// CALENDAR (workspace level)
// ---------------------------

export async function listWorkspaceCardsByDate(
  workspaceId: string,
  from: string,
  to: string,
): Promise<ListCardsResponse> {
  try {
    const res = await getClientAxios().get<ApiEnvelope<ListCardsResponse>>(
      `${BASE}/${workspaceId}/calendar`,
      { params: { from, to } },
    );
    return unwrap<ListCardsResponse>(res);
  } catch (error) {
    fail(error, "Failed to load calendar cards.");
  }
}
