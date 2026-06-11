"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import {
  buildMonthMatrix,
  formatMonthLabel,
  isSameDay,
  nextMonth,
  prevMonth,
  toDateKey,
  WEEKDAY_LABELS,
  type MonthDay,
  type YearMonth,
} from "@/features/calendar/utils/month";
import { listWorkspaceCardsByDate } from "@/features/boards/api/cards";
import type { Card } from "@/features/boards/types/board";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface CalendarViewProps {
  workspaceId: string;
}

type ViewMode = "month" | "week" | "day";

function toISODate(year: number, month: number, day: number): string {
  // month is 0-indexed; toISOString would need UTC, just build manually
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function viewRange(
  viewMode: ViewMode,
  view: YearMonth,
  today: { year: number; month: number; day: number },
): { from: string; to: string } {
  if (viewMode === "month") {
    // Cover the full 6-week grid (may include prev/next month days)
    const matrix = buildMonthMatrix(view.year, view.month);
    const first = matrix[0][0];
    const last = matrix[5][6];
    return {
      from: toISODate(first.year, first.month, first.day),
      to: toISODate(last.year, last.month, last.day),
    };
  }
  if (viewMode === "week") {
    // Week containing "today"
    const d = new Date(today.year, today.month, today.day);
    const dow = d.getDay();
    const sun = new Date(d);
    sun.setDate(d.getDate() - dow);
    const sat = new Date(sun);
    sat.setDate(sun.getDate() + 6);
    return {
      from: toISODate(sun.getFullYear(), sun.getMonth(), sun.getDate()),
      to: toISODate(sat.getFullYear(), sat.getMonth(), sat.getDate()),
    };
  }
  // day
  return {
    from: toISODate(today.year, today.month, today.day),
    to: toISODate(today.year, today.month, today.day),
  };
}

function cardDateKey(card: Card): string | null {
  // Prefer startDate, fall back to dueDate
  return card.startDate
    ? card.startDate.slice(0, 10)
    : card.dueDate
      ? card.dueDate.slice(0, 10)
      : null;
}

function isOverdue(card: Card): boolean {
  if (!card.dueDate || card.isCompleted) return false;
  return new Date(card.dueDate) < new Date();
}

export function CalendarView({ workspaceId }: CalendarViewProps) {
  const today = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }, []);

  const [view, setView] = useState<YearMonth>({
    year: today.year,
    month: today.month,
  });
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const weeks = useMemo(
    () => buildMonthMatrix(view.year, view.month),
    [view.year, view.month],
  );

  // Group cards by their date key for quick lookup
  const cardsByDate = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const card of cards) {
      const key = cardDateKey(card);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(card);
    }
    return map;
  }, [cards]);

  const overdueCards = useMemo(
    () => cards.filter(isOverdue),
    [cards],
  );

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    setFetchError(null);
    const { from, to } = viewRange(viewMode, view, today);
    try {
      const res = await listWorkspaceCardsByDate(workspaceId, from, to);
      setCards(Array.isArray(res?.cards) ? res.cards : []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load cards.");
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, view, viewMode, today]);

  useEffect(() => {
    void load();
  }, [load]);

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
            aria-label="Previous"
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
            aria-label="Next"
            onClick={goNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Right: view mode + today */}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={goToday}>
            Today
          </Button>
          {(["day", "week", "month"] as ViewMode[]).map((m) => (
            <Button
              key={m}
              type="button"
              variant={viewMode === m ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => setViewMode(m)}
            >
              {m}
            </Button>
          ))}
          {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Overdue banner */}
      {overdueCards.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-sm text-warning">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            {overdueCards.length} overdue task
            {overdueCards.length !== 1 ? "s" : ""}:{" "}
            {overdueCards
              .slice(0, 3)
              .map((c) => c.title)
              .join(", ")}
            {overdueCards.length > 3 ? ` and ${overdueCards.length - 3} more` : ""}
          </span>
        </div>
      )}

      {/* Month grid */}
      {viewMode === "month" && (
        <MonthGrid
          weeks={weeks}
          today={today}
          cardsByDate={cardsByDate}
          view={view}
        />
      )}

      {/* Week view */}
      {viewMode === "week" && (
        <WeekView today={today} cardsByDate={cardsByDate} />
      )}

      {/* Day view */}
      {viewMode === "day" && (
        <DayView today={today} cardsByDate={cardsByDate} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Month grid
// ---------------------------------------------------------------------------

function MonthGrid({
  weeks,
  today,
  cardsByDate,
  view,
}: {
  weeks: MonthDay[][];
  today: { year: number; month: number; day: number };
  cardsByDate: Record<string, Card[]>;
  view: YearMonth;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
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

      <div className="grid grid-cols-7">
        {weeks.flat().map((cell) => {
          const isToday = isSameDay(cell, today.year, today.month, today.day);
          const key = toDateKey(cell.year, cell.month, cell.day);
          const dayCells = cardsByDate[key] ?? [];

          return (
            <div
              key={cell.key}
              className={cn(
                "min-h-[7rem] border-b border-r border-border p-2",
                cell.inCurrentMonth ? "bg-card" : "bg-muted/30",
              )}
            >
              <div className="flex justify-end">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-sm",
                    isToday
                      ? "bg-primary font-semibold text-primary-foreground"
                      : cell.inCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                  aria-current={isToday ? "date" : undefined}
                >
                  {cell.day}
                </span>
              </div>
              {/* Card chips */}
              <div className="mt-1 flex flex-col gap-0.5">
                {dayCells.slice(0, 3).map((card) => (
                  <CardChip key={card.id} card={card} />
                ))}
                {dayCells.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayCells.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week view
// ---------------------------------------------------------------------------

function WeekView({
  today,
  cardsByDate,
}: {
  today: { year: number; month: number; day: number };
  cardsByDate: Record<string, Card[]>;
}) {
  const days = useMemo(() => {
    const d = new Date(today.year, today.month, today.day);
    const dow = d.getDay();
    const result: { year: number; month: number; day: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(d);
      cur.setDate(d.getDate() - dow + i);
      result.push({
        year: cur.getFullYear(),
        month: cur.getMonth(),
        day: cur.getDate(),
      });
    }
    return result;
  }, [today]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-semibold text-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const key = toDateKey(d.year, d.month, d.day);
          const dayCells = cardsByDate[key] ?? [];
          const isToday =
            d.year === today.year &&
            d.month === today.month &&
            d.day === today.day;
          return (
            <div
              key={key}
              className={cn(
                "min-h-[8rem] border-r border-border p-2",
                isToday && "bg-primary/5",
              )}
            >
              <div className="flex justify-end">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs",
                    isToday
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-foreground",
                  )}
                >
                  {d.day}
                </span>
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayCells.slice(0, 4).map((card) => (
                  <CardChip key={card.id} card={card} />
                ))}
                {dayCells.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayCells.length - 4} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day view
// ---------------------------------------------------------------------------

function DayView({
  today,
  cardsByDate,
}: {
  today: { year: number; month: number; day: number };
  cardsByDate: Record<string, Card[]>;
}) {
  const key = toDateKey(today.year, today.month, today.day);
  const todayCards = cardsByDate[key] ?? [];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-base font-semibold text-foreground mb-3">
        Today — {new Date(today.year, today.month, today.day).toLocaleDateString(
          undefined,
          { weekday: "long", month: "long", day: "numeric", year: "numeric" },
        )}
      </h2>
      {todayCards.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks due or starting today.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todayCards.map((card) => (
            <li key={card.id}>
              <CardChip card={card} full />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card chip
// ---------------------------------------------------------------------------

function CardChip({ card, full = false }: { card: Card; full?: boolean }) {
  const overdue = isOverdue(card);
  return (
    <div
      className={cn(
        "rounded px-1.5 py-0.5 text-[11px] font-medium truncate",
        full ? "text-xs py-1 px-2" : "",
        overdue
          ? "bg-destructive/15 text-destructive"
          : card.isCompleted
            ? "bg-success/15 text-success line-through"
            : "bg-primary/10 text-primary",
      )}
      title={card.title}
    >
      {card.title}
      {overdue && " ⚠"}
    </div>
  );
}
