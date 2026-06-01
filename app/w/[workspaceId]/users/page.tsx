import { requireAuth } from "@/shared/lib/auth/server";
import { UsersManagement } from "@/features/members/components/users-management";

/**
 * Users / Members management page (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 * Renders inside the existing workspace shell (app/w/[workspaceId]/layout.tsx).
 */
export default async function UsersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  await requireAuth();
  const { workspaceId } = await params;

  return <UsersManagement workspaceId={workspaceId} />;
}
