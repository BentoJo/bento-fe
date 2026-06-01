import { requireAuth } from "@/shared/lib/auth/server";
import { WorkspaceSettings } from "@/features/settings/components/workspace-settings";

/**
 * Workspace settings page (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 * Auth is enforced by the workspace layout (requireAuth); we also guard here.
 * Rendered inside the existing WorkspaceShell from the parent layout.
 */
export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  await requireAuth();
  const { workspaceId } = await params;

  return <WorkspaceSettings workspaceId={workspaceId} />;
}
