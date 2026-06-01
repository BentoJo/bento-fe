import { AppTopbar } from "@/shared/layout/app-topbar";
import { WorkspaceSidebar } from "@/shared/layout/workspace-sidebar";

interface ShellUser {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

interface WorkspaceShellProps {
  workspaceId: string;
  user: ShellUser;
  children: React.ReactNode;
}

/**
 * App shell for the inside-a-workspace experience:
 * dark navy sidebar + a light main column (topbar + page content).
 */
export function WorkspaceShell({
  workspaceId,
  user,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <WorkspaceSidebar workspaceId={workspaceId} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
