import { requireAuth } from "@/shared/lib/auth/server";
import { BoardsList } from "@/features/boards/components/boards-list";

/**
 * Boards list page (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 * Auth is enforced by the workspace layout; we require it here too so the page
 * is safe in isolation. Renders inside the existing WorkspaceShell.
 */
export default async function BoardsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  await requireAuth();
  const { workspaceId } = await params;

  return <BoardsList workspaceId={workspaceId} />;
}
