import { requireAuth } from "@/shared/lib/auth/server";
import { KanbanBoard } from "@/features/boards/components/kanban-board";

/**
 * Kanban board view page (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 * Auth is enforced by the workspace layout; we require it here too so the page
 * is safe in isolation. Renders inside the existing WorkspaceShell.
 */
export default async function BoardPage({
  params,
}: {
  params: Promise<{ workspaceId: string; boardId: string }>;
}) {
  await requireAuth();
  const { workspaceId, boardId } = await params;

  return <KanbanBoard workspaceId={workspaceId} boardId={boardId} />;
}
