"use client";

import {
  LayoutGrid,
  Users,
  UsersRound,
  ListChecks,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import type { GetWorkspaceOverviewResponse } from "@/shared/types/workspace";

interface OverviewStatsProps {
  overview: GetWorkspaceOverviewResponse | null;
  isLoading: boolean;
}

interface StatDef {
  key: keyof GetWorkspaceOverviewResponse;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const STATS: StatDef[] = [
  { key: "totalBoards", label: "Boards", icon: LayoutGrid, accent: "text-primary" },
  { key: "totalMembers", label: "Members", icon: Users, accent: "text-primary" },
  { key: "totalTeams", label: "Teams", icon: UsersRound, accent: "text-primary" },
  { key: "totalCards", label: "Tasks", icon: ListChecks, accent: "text-primary" },
  { key: "completedCards", label: "Completed", icon: CheckCircle2, accent: "text-success" },
  { key: "overdueCards", label: "Overdue", icon: AlertTriangle, accent: "text-warning" },
];

export function OverviewStats({ overview, isLoading }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = overview ? Number(overview[stat.key] ?? 0) : 0;
        return (
          <Card key={stat.key} className="bg-card shadow-sm">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </span>
                <Icon className={cn("size-4", stat.accent)} />
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <span className="text-2xl font-semibold text-card-foreground">
                  {value}
                </span>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
