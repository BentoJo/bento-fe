import { requireAuth } from "@/shared/lib/auth/server";
import { WorkspaceShell } from "@/shared/layout/workspace-shell";

/**
 * Workspace layout (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await requireAuth();
  const { workspaceId } = await params;

  return (
    <WorkspaceShell
      workspaceId={workspaceId}
      user={{
        firstName: session.user?.firstName,
        lastName: session.user?.lastName,
        avatarUrl: session.user?.avatarUrl,
      }}
    >
      {children}
    </WorkspaceShell>
  );
}
