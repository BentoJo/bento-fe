import type { ReactNode } from "react";

import { GlobalSidebar } from "@/shared/layout/global-sidebar";
import { AppTopbar } from "@/shared/layout/app-topbar";

interface ShellUser {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}


export function GlobalShell({
  user,
  children,
}: {
  user: ShellUser;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <GlobalSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar user={user} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
