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
  name: string;
  color?: string;
}

/** A card assignee. The backend currently exposes only a userId. */
export interface CardAssignee {
  userId: string;
}

/** A board as returned by the boards list / get endpoints. */
export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  isPrivate: boolean;
  icon?: string;
  isArchived: boolean;
  isFavorite?: boolean;
  membersCount?: number;
  createdAt: string;
  updatedAt?: string;
}

/** A column within a board. */
export interface Column {
  id: string;
  workspaceId: string;
  boardId: string;
  name: string;
  position: number;
  isArchived: boolean;
  createdAt: string;
}

/** A card (task) within a column. */
export interface Card {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description?: string;
  priority?: CardPriority;
  status?: string;
  visibility?: Visibility;
  startDate?: string;
  dueDate?: string;
  progress?: number;
  labels?: CardLabel[];
  assignees?: CardAssignee[];
  commentsCount?: number;
  attachmentsCount?: number;
  checklistDone?: number;
  checklistTotal?: number;
  createdAt?: string;
  updatedAt?: string;
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
  isPrivate: boolean;
  icon?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  isPrivate?: boolean;
  icon?: string;
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
  position?: number;
}

export interface ReorderColumnRequest {
  position: number;
}

/* ------------------------------ Cards requests ---------------------------- */

export interface ListCardsResponse {
  cards: Card[];
}

export interface CreateCardRequest {
  columnId: string;
  title: string;
  description?: string;
  priority?: CardPriority;
  status?: string;
  visibility?: Visibility;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateCardRequest {
  columnId?: string;
  title?: string;
  description?: string;
  priority?: CardPriority;
  status?: string;
  visibility?: Visibility;
  startDate?: string;
  dueDate?: string;
  progress?: number;
}

export interface MoveCardRequest {
  columnId: string;
  position: number;
}
