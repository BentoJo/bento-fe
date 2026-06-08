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
import { cairo } from "@/shared/lib/fonts";
import Switch from "@/shared/components/svgs/Switch";
import { Cairo } from "next/font/google";
import Edit from "@/shared/components/svgs/Edit";
import Dashboard from "@/shared/components/svgs/Dashboard";
import { ActiveMembersPanel } from "./active-member-panel";
import PlusIcon from "@/shared/components/svgs/PlusIcon";
import Schedule from "@/shared/components/svgs/Schedule";
import { DaySchedulePanel } from "./day-schedule";


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
    <div className="flex flex-col mx-12 gap-6 p-4 lg:p-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={` ${cairo.className} font-bold text-3xl text-foreground `}>
            Welcome {firstName},{" "}
            <span >Let&apos;s do some</span>{" "}
            <span className="text-primary">Tasks!</span>
          </h1>
        </div>
        <Button variant="default" className={`gap-2 p self-start ${cairo.className}`}>
          <Switch className="size-4" />
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
      <div className="  gap-5 xl:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex gap-6">
            <ProfileCard
              name={fullName}
              email={user.email}
              isOwner={isWorkspaceOwner(overview, user.id)}
            />
            <LastWeekProgressPanel />
          </div>
          <div className="flex gap-6">
            <DaySchedulePanel />

            <ActiveMembersPanel/>
          </div>

        </div>

        
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
    <Card className="rounded-[12px] w-2/7 border border-[#E2E8F0] bg-white shadow-none">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="h-[140px] w-[140px] shrink-0 border border-[#CBD5E1]">
            <AvatarImage src="" alt={name ?? "Profile"} />
            <AvatarFallback className="text-6xl">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Right Side */}
          <div className="flex flex-1 flex-col justify-center">
            {name ? (
              <h2
                className={`${cairo.className} text-[24px] font-bold leading-none text-[#0F172A]`}
              >
                {name}
              </h2>
            ) : (
              <Skeleton className="h-8 w-48" />
            )}

            <p
              className={`mt-5 text-[16px] font-bold text-[#64748B]`}
            >
              UI/UX Designer
            </p>

            <p
              className={` mt-1 text-[12px] font-bold text-[#2563EB]`}
            >
              Design team
            </p>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 flex items-center justify-between">
          <span
            className={`${cairo.className} text-[14px] font-bold w-1/2 text-center text-[#2563EB]`}
          >
            Workspace Owner
          </span>

          <Button variant="default" className={`gap-2 w-1/2 self-start ${cairo.className}`}>
            <Edit className="size-4"/>
            Edit Profile
          </Button>
        </div>
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
    <Card className="rounded-[12px] border p-4 w-3/4 border-[#E2E8F0] bg-white shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`flex items-center gap-2 text-[24px] ${cairo.className} font-bold text-[#0F172A]`}>
          <Dashboard className="size-4" />
          Last week progress
        </CardTitle>

        <div className="rounded-[8px] bg-[#DBEAFE] px-4 py-2 text-sm font-medium text-[#2563EB]">
          Urgent Tasks
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[180px]">
          <div className="flex h-full flex-col">
            {/* Bars Area */}
            <div className="flex flex-1 items-end justify-between px-2">
              {[
                { day: "Mon", value: 22 },
                { day: "Tue", value: 11 },
                { day: "Wed", value: 24 },
                { day: "Thu", value: 18 },
                { day: "Fri", value: 2 },
                { day: "Sat", value: 5 },
                { day: "Sun", value: 20 },
              ].map((item) => (
                <div
                  key={item.day}
                  className="flex flex-col items-center justify-end"
                >
                  <div
                    className="w-[120px] rounded-t-[8px] bg-[#2563EB] transition-all"
                    style={{
                      height: `${item.value * 3.5}px`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X Axis */}
            <div className="mt-1 border-t border-[#94A3B8]" />

            {/* Days */}
            <div className="flex justify-between px-2 pt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="flex w-[120px] justify-center"
                >
                  <span className="text-[12px] font-medium text-[#334155]">
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TODO(BE): no day-schedule / events endpoint yet.
 * Graceful empty state, no mock events.
 */
function DaySchedulePanelFunction() {
  return (
    <Card className="bg-card shadow-sm w-2/3 p-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={`flex items-center gap-2 text-[24px] ${cairo.className} font-bold text-[#0F172A]`}>
          <Schedule className="size-4" />
          Day schedule
        </CardTitle>
        <Button variant="default" className={`gap-2 p self-start ${cairo.className}`}>
          <PlusIcon className="size-4" />
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

