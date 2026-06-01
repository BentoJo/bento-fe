import { requireAuth } from "@/shared/lib/auth/server";
import { CalendarView } from "@/features/calendar/components/calendar-view";

/**
 * Calendar page (server component).
 * Next 16: dynamic route `params` is a Promise and must be awaited.
 * Auth is also enforced by the workspace layout; we require it here too so the
 * page is safe in isolation. Renders inside the existing WorkspaceShell.
 *
 * FE-only: the gateway exposes no calendar/events endpoint yet, so the view
 * renders an empty month grid. See CalendarView for the TODO(BE) note.
 */
export default async function CalendarPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  await requireAuth();
  const { workspaceId } = await params;

  return <CalendarView workspaceId={workspaceId} />;
}
