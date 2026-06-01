"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Search, Star } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { CreateWorkspaceButton } from "@/features/workspace/components/create-workspace-button";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { WorkspacesSection } from "@/features/workspace/components/workspaces-section";
import { PendingInvitationsSection } from "@/features/workspace/components/pending-invitations-section";

interface HomeContentProps {
  firstName?: string;
}

export function HomeContent({ firstName }: HomeContentProps) {
  const { workspaces, isLoading, error, refetch } = useWorkspaces();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workspaces;
    return workspaces.filter(
      (ws) =>
        ws.name.toLowerCase().includes(q) ||
        ws.roleId.toLowerCase().includes(q),
    );
  }, [workspaces, query]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome Back
            {firstName ? (
              <>
                , <span className="text-primary">{firstName}</span>
              </>
            ) : null}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your workspaces.
          </p>
        </div>
        <CreateWorkspaceButton onCreated={refetch} />
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-2xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by workspace name or role..."
          className="h-11 rounded-lg pl-9"
          aria-label="Search workspaces"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Favorites — no favorites flag in the API, graceful empty state. */}
          <WorkspacesSection
            title="Favorite Workspaces"
            icon={<Star className="size-4 text-muted-foreground" />}
            workspaces={[]}
            isLoading={false}
            emptyMessage="No favorites yet"
            starred
          />

          {/* Your Workspaces — real data. */}
          <WorkspacesSection
            title="Your Workspaces"
            icon={<LayoutGrid className="size-4 text-muted-foreground" />}
            workspaces={filtered}
            isLoading={isLoading}
            viewAllHref="/home"
            emptyMessage={
              error
                ? error
                : query.trim()
                  ? "No workspaces match your search."
                  : "You don't have any workspaces yet. Create one to get started."
            }
          />
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          <PendingInvitationsSection />
        </div>
      </div>
    </div>
  );
}
