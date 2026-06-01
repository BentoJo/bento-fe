import { requireAuth } from "@/shared/lib/auth/server";
import { TeamsManagement } from "@/features/teams/components/teams-management";

/**
 * Teams page (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 * Auth is also enforced by the workspace layout; we require it here too so the
 * page is safe in isolation. Renders inside the existing WorkspaceShell.
 */
export default async function TeamsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  await requireAuth();
  const { workspaceId } = await params;

  return <TeamsManagement workspaceId={workspaceId} />;
}
