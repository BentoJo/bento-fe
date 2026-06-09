/**
 * Boards / Columns / Cards (Kanban) contracts.
 *
 * Modeled from the bento-be-ws protos + the ManeJo Kanban designs.
 *
 * WIRE-LATER: the gateway does NOT yet expose board / column / card REST
 * endpoints (only ws gRPC has them). These types describe the EXPECTED gateway
 * contracts so the API layer + UI can be wired the moment the routes land.
 * Every hook that consumes these MUST degrade to an empty state on error.
 * TODO(BE): gateway board/column/card REST not implemented yet.
 */

import type { PaginationMeta } from "@/shared/types/workspace";

export type { PaginationMeta };

export type CardPriority = "low" | "medium" | "high";
export type Visibility = "public" | "private";

/** A label/tag attached to a card. */
export interface CardLabel {
  id: string;
  workspaceId: string;
  name: string;
  icon?: string | null;
  type: string;
  createdBy: string;
  createdAt: string;
  color?: string; // Legacy UI field
}

/** A card assignee. */
export interface CardAssignee {
  id: string;
  cardId: string;
  assigneeType: string;
  boardMemberId?: string | null;
  teamId?: string | null;
  assignedBy: string;
  createdAt: string;
  userId: string; // Legacy UI field
}

/** A comment on a card. */
export interface CardComment {
  id: string;
  workspaceId: string;
  cardId: string;
  parentCommentId?: string | null;
  workspaceMemberId: string;
  contentText?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

/** A checklist item. */
export interface ChecklistItem {
  id: string;
  workspaceId: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  completedBy?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

/** A checklist on a card. */
export interface CardChecklist {
  id: string;
  workspaceId: string;
  cardId: string;
  title: string;
  position: number;
  createdBy: string;
  createdAt: string;
  items: ChecklistItem[];
}

/** A board as returned by the boards list / get endpoints. */
export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  isPrivate: boolean;
  visibility?: Visibility; // Legacy UI field
  icon?: string | null;
  isArchived: boolean;
  isFavorite?: boolean;
  membersCount?: number;
  createdAt: string;
  updatedAt?: string | null;
}

/** A column within a board. */
export interface Column {
  id: string;
  workspaceId: string;
  boardId: string;
  name: string;
  position: number;
  isArchived: boolean;
  cardsCount?: number;
  createdAt: string;
  updatedAt?: string | null;
}

/** A card (task) within a column. */
export interface Card {
  id: string;
  workspaceId: string;
  boardId: string;
  columnId: string;
  title: string;
  descriptionText?: string | null;
  description?: string; // Legacy UI field
  priority: CardPriority;
  isCompleted: boolean;
  progress: any; // Backend is string, UI expects number
  isPrivate: boolean;
  visibility?: Visibility; // Legacy UI field
  position: number;
  createdBy: string;
  isArchived: boolean;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string | null;
  commentsCount?: number; // Legacy UI field
  attachmentsCount?: number; // Legacy UI field
  checklistDone?: number; // Legacy UI field
  checklistTotal?: number; // Legacy UI field
  status?: string; // Legacy UI field
  // UI helper fields (may be populated by separate calls)
  labels?: CardLabel[];
  assignees?: CardAssignee[];
  comments?: CardComment[];
  checklists?: CardChecklist[];
}

/* ----------------------------- Boards requests ---------------------------- */

export interface ListBoardsRequest {
  page?: number;
  limit?: number;
  search?: string;
  includeArchived?: boolean;
}

export interface ListBoardsResponse {
  boards: Board[];
  pagination: PaginationMeta;
}

export interface CreateBoardRequest {
  name: string;
  isPrivate?: boolean;
  icon?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  isPrivate?: boolean;
  icon?: string | null;
}

export interface ListFavoriteBoardsResponse {
  boards: {
    boardId: string;
    name: string;
    icon?: string | null;
    isPrivate: boolean;
  }[];
  pagination: PaginationMeta;
}

/* ----------------------------- Columns requests --------------------------- */

export interface ListColumnsResponse {
  columns: Column[];
}

export interface CreateColumnRequest {
  name: string;
  position?: number;
}

export interface UpdateColumnRequest {
  name?: string;
}

export interface ReorderColumnRequest {
  newPosition: number;
}

export interface BulkReorderColumnsRequest {
  columns: { columnId: string; position: number }[];
}

/* ------------------------------ Cards requests ---------------------------- */

export interface ListCardsResponse {
  cards: Card[];
}

export interface CreateCardRequest {
  columnId: string;
  title: string;
  descriptionText?: string;
  startDate?: string;
  dueDate?: string;
  priority?: string;
  isPrivate?: boolean;
  position?: number;
}

export interface UpdateCardRequest {
  columnId: string;
  title?: string;
  descriptionText?: string;
  startDate?: string;
  dueDate?: string;
  priority?: string;
  isCompleted?: boolean;
  progress?: string;
  isPrivate?: boolean;
}

export interface MoveCardRequest {
  columnId: string;
  position: number;
}

export interface ListCardCommentsResponse {
  comments: CardComment[];
  pagination: PaginationMeta;
}

export interface CreateLabelRequest {
  name: string;
  icon?: string;
  type?: string;
}

export interface ListLabelsResponse {
  labels: CardLabel[];
}

export interface AddCommentRequest {
  contentText: string;
  parentCommentId?: string;
}

export interface CreateChecklistRequest {
  title: string;
  position?: number;
}

export interface AddChecklistItemRequest {
  title: string;
  position?: number;
}
