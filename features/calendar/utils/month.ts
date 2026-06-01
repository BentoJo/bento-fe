/**
 * Pure date helpers for building a month calendar grid.
 *
 * No external date library — plain `Date` math only. All functions are pure
 * and deterministic given their inputs; callers should compute "today" / the
 * initial month client-side (see calendar-view.tsx) to stay SSR-safe.
 *
 * Convention: `month` is 0-indexed (0 = January, 11 = December), matching the
 * native `Date` API. Weeks run Sunday -> Saturday to match the design.
 */

export const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** A single day cell in the month matrix. */
export interface MonthDay {
  /** Full year of this cell (may belong to the prev/next month). */
  year: number;
  /** 0-indexed month of this cell. */
  month: number;
  /** Day of the month, 1-31. */
  day: number;
  /** True when this cell belongs to the month being displayed. */
  inCurrentMonth: boolean;
  /** Stable `YYYY-MM-DD` key for React keys / lookups. */
  key: string;
}

/** A year/month pair used to drive navigation. */
export interface YearMonth {
  year: number;
  /** 0-indexed month. */
  month: number;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Build a stable `YYYY-MM-DD` key (month is 0-indexed input). */
export function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

/** Number of days in a given 0-indexed month. */
export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month === last day of this month.
  return new Date(year, month + 1, 0).getDate();
}

/** Weekday index (0 = Sun .. 6 = Sat) of the first day of the month. */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Build a fixed 6-week (42 cell) month matrix, Sunday -> Saturday.
 *
 * Always returns 6 rows of 7 cells so the grid height is stable across months,
 * padding with trailing/leading days from the adjacent months.
 */
export function buildMonthMatrix(year: number, month: number): MonthDay[][] {
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = firstWeekdayOfMonth(year, month);

  // Start from the cell that sits in the top-left of the grid. This may be a
  // day from the previous month. Using a single rolling Date avoids edge cases
  // around month/year boundaries.
  const start = new Date(year, month, 1 - leadingBlanks);

  const weeks: MonthDay[][] = [];
  const cursor = new Date(start);

  for (let week = 0; week < 6; week += 1) {
    const row: MonthDay[] = [];
    for (let dow = 0; dow < 7; dow += 1) {
      const cy = cursor.getFullYear();
      const cm = cursor.getMonth();
      const cd = cursor.getDate();
      row.push({
        year: cy,
        month: cm,
        day: cd,
        inCurrentMonth: cm === month && cy === year,
        key: toDateKey(cy, cm, cd),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
  }

  // Reference totalDays so linters don't flag it; it documents intent and is
  // implicitly validated by the matrix containing every day of the month.
  void totalDays;

  return weeks;
}

/** Move to the previous month, rolling the year over at January. */
export function prevMonth({ year, month }: YearMonth): YearMonth {
  return month === 0
    ? { year: year - 1, month: 11 }
    : { year, month: month - 1 };
}

/** Move to the next month, rolling the year over at December. */
export function nextMonth({ year, month }: YearMonth): YearMonth {
  return month === 11
    ? { year: year + 1, month: 0 }
    : { year, month: month + 1 };
}

/** Human-readable label, e.g. "June 2026". */
export function formatMonthLabel({ year, month }: YearMonth): string {
  return `${MONTH_LABELS[month]} ${year}`;
}

/** Equality check for two day cells against a year/month/day triple. */
export function isSameDay(
  cell: MonthDay,
  year: number,
  month: number,
  day: number,
): boolean {
  return cell.year === year && cell.month === month && cell.day === day;
}
