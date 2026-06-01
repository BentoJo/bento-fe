"use client";

import {
  BarChart3,
  CalendarClock,
  Plus,
  Repeat2,
  Users,
  Pencil,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { OverviewStats } from "@/features/workspace/components/overview-stats";
import { BoardsPreview } from "@/features/workspace/components/boards-preview";
import { useWorkspaceOverview } from "@/features/workspace/hooks/use-workspace-overview";

interface DashboardUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface WorkspaceDashboardProps {
  workspaceId: string;
  user: DashboardUser;
}

export function WorkspaceDashboard({
  workspaceId,
  user,
}: WorkspaceDashboardProps) {
  const { overview, isLoading, error } = useWorkspaceOverview(workspaceId);
  const firstName = user.firstName ?? "there";
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome {firstName},{" "}
            <span className="text-muted-foreground">Let&apos;s do some</span>{" "}
            <span className="text-primary">Tasks!</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in your workspace.
          </p>
        </div>
        <Button variant="outline" className="gap-2 self-start">
          <Repeat2 className="size-4" />
          Switch Workspace
        </Button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {/* Main grid: content + right rail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <ProfileCard
              name={fullName}
              email={user.email}
              isOwner={isWorkspaceOwner(overview, user.id)}
            />
            <LastWeekProgressPanel />
          </div>

          <OverviewStats overview={overview} isLoading={isLoading} />

          <BoardsPreview
            workspaceId={workspaceId}
            boards={overview?.boardsPreview}
            isLoading={isLoading}
          />

          <DaySchedulePanel />
        </div>

        <ActiveMembersPanel />
      </div>
    </div>
  );
}

/**
 * Owner flag is approximated from the canEditWorkspace permission since the
 * overview response does not include ownerId.
 * TODO(BE): expose ownerId / role name on the overview so we can label
 * "Workspace Owner" precisely.
 */
function isWorkspaceOwner(
  overview: ReturnType<typeof useWorkspaceOverview>["overview"],
  _userId: string | undefined,
): boolean {
  return Boolean(overview?.permissions?.canEditWorkspace);
}

function ProfileCard({
  name,
  email,
  isOwner,
}: {
  name?: string;
  email?: string;
  isOwner: boolean;
}) {
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar className="size-16">
          <AvatarImage src="" alt={name ?? "Profile"} />
          <AvatarFallback className="text-lg">
            {initials || "?"}
          </AvatarFallback>
        </Avatar>
        {name ? (
          <p className="text-base font-semibold text-card-foreground">{name}</p>
        ) : (
          <Skeleton className="h-5 w-28" />
        )}
        <Badge variant="secondary" className="font-normal">
          {isOwner ? "Workspace Owner" : "Member"}
        </Badge>
        {email ? (
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        ) : null}
        <Button variant="outline" size="sm" className="mt-1 w-full gap-2">
          <Pencil className="size-3.5" />
          Edit profile
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * TODO(BE): no endpoint yet for weekly progress / activity history.
 * Rendered as a graceful "coming soon" empty state — NO fake chart data.
 */
function LastWeekProgressPanel() {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Last week progress
        </CardTitle>
        <Badge variant="outline" className="font-normal text-muted-foreground">
          Coming soon
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
          <BarChart3 className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-card-foreground">
            No progress data yet
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Weekly activity insights will appear here once available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TODO(BE): no day-schedule / events endpoint yet.
 * Graceful empty state, no mock events.
 */
function DaySchedulePanel() {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Day schedule</CardTitle>
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <Plus className="size-3.5" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
          <CalendarClock className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-card-foreground">
            No events scheduled
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Scheduling is coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TODO(BE): no active-members / presence endpoint yet.
 * The overview only returns totalMembers (a count), not a member list,
 * so we render an empty state instead of inventing members.
 */
function ActiveMembersPanel() {
  return (
    <Card className="h-fit bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Active Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
          <Users className="size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium text-card-foreground">
            No member activity
          </p>
          <p className="max-w-[14rem] text-xs text-muted-foreground">
            Live member presence is coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
