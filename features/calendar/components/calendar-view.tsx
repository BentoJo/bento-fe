"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

import {
  buildMonthMatrix,
  formatMonthLabel,
  isSameDay,
  nextMonth,
  prevMonth,
  WEEKDAY_LABELS,
  type YearMonth,
} from "@/features/calendar/utils/month";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface CalendarViewProps {
  workspaceId: string;
}

/**
 * ManeJo Calendar — month grid (Sun–Sat, fixed 6 weeks).
 *
 * FE-only / wire-later: there is NO calendar/events endpoint on the gateway,
 * so the grid renders intentionally EMPTY with a "coming soon" note. The
 * toolbar controls (All Sprints / All Tasks / Filter / Add Task) are present
 * but disabled. Month navigation (prev / next / today) is fully client-side.
 *
 * TODO(BE): no calendar/events endpoint — once the gateway exposes events,
 * fetch per visible month and render colored chips in the day cells.
 */
export function CalendarView({ workspaceId }: CalendarViewProps) {
  // `workspaceId` will scope event fetches once a backend exists. It is part of
  // the public component contract today so the route stays stable.
  void workspaceId;

  // Compute "today" once, client-side, to stay SSR-safe (no Date in a server
  // component). This is the initial month and also drives the "today" highlight.
  const today = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }, []);

  const [view, setView] = useState<YearMonth>({
    year: today.year,
    month: today.month,
  });

  const weeks = useMemo(
    () => buildMonthMatrix(view.year, view.month),
    [view.year, view.month],
  );

  const goPrev = () => setView((v) => prevMonth(v));
  const goNext = () => setView((v) => nextMonth(v));
  const goToday = () => setView({ year: today.year, month: today.month });

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-2">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <span>Home</span>
          <span className="px-1.5">/</span>
          <span className="text-primary">Calendar</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Schedule meetings, track deadlines, and manage your time.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: month pager */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={goPrev}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[8.5rem] text-center text-base font-semibold">
            {formatMonthLabel(view)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={goNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Right: controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={goToday}>
            Today
          </Button>

          {/* All Sprints — visual only, no backend filter source yet */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                title="Sprint filtering coming soon"
              >
                All Sprints
                <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem disabled>All Sprints</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* All Tasks — visual only */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                title="Task filtering coming soon"
              >
                All Tasks
                <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem disabled>All Tasks</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Filtering coming soon"
          >
            <SlidersHorizontal className="size-4" />
            Filter
          </Button>

          {/* Add Task — present but disabled (no events/tasks endpoint) */}
          <Button
            type="button"
            size="sm"
            disabled
            title="Task creation coming soon — calendar backend not available yet"
          >
            <Plus className="size-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Empty-state note: events are not wired yet */}
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <CalendarDays className="size-4 shrink-0" />
        <span>
          Events and tasks are coming soon. The calendar is not connected to a
          backend yet, so no items are shown.
        </span>
      </div>

      {/* Month grid */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-3 py-2.5 text-center text-sm font-semibold text-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {weeks.flat().map((cell) => {
            const isToday = isSameDay(
              cell,
              today.year,
              today.month,
              today.day,
            );
            return (
              <div
                key={cell.key}
                className={[
                  "min-h-[7rem] border-b border-r border-border p-2",
                  cell.inCurrentMonth ? "bg-card" : "bg-muted/30",
                ].join(" ")}
              >
                <div className="flex justify-end">
                  <span
                    className={[
                      "flex size-7 items-center justify-center rounded-full text-sm",
                      isToday
                        ? "bg-primary font-semibold text-primary-foreground"
                        : cell.inCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground",
                    ].join(" ")}
                    aria-current={isToday ? "date" : undefined}
                  >
                    {cell.day}
                  </span>
                </div>
                {/* Day body intentionally empty — no events endpoint yet. */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
