import { getAuthSession } from "@/shared/lib/auth/server";
import { WorkspaceDashboard } from "@/features/workspace/components/workspace-dashboard";

/**
 * Workspace dashboard page (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 * Auth is enforced by the layout (requireAuth); we read the session here only
 * to pass the display name to the client dashboard (no SessionProvider in tree).
 */
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const session = await getAuthSession();

  return (
    <WorkspaceDashboard
      workspaceId={workspaceId}
      user={{
        id: session?.user?.id,
        firstName: session?.user?.firstName,
        lastName: session?.user?.lastName,
        email: session?.user?.email,
      }}
    />
  );
}
