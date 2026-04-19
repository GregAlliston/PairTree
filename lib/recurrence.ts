import type { Recurrence } from "./supabase";

const MS_PER_DAY = 86_400_000;

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function daysInMonth(year: number, monthZeroBased: number): number {
  return new Date(Date.UTC(year, monthZeroBased + 1, 0)).getUTCDate();
}

/**
 * Return the next occurrence (UTC date) of a recurring event on or after `from`.
 * For `none`, returns the start date only if it's on or after `from`, else null.
 * Day-of-month is clamped for short months (Jan 31 monthly → Feb 28/29).
 */
export function nextOccurrence(
  startIso: string,
  recurrence: Recurrence,
  from: Date = todayUTC(),
): Date | null {
  const start = parseDate(startIso);
  if (recurrence === "none") {
    return start.getTime() >= from.getTime() ? start : null;
  }

  const startDay = start.getUTCDate();
  const startMonth = start.getUTCMonth();
  let year = from.getUTCFullYear();

  if (recurrence === "yearly") {
    const candidate = (y: number) => {
      const d = daysInMonth(y, startMonth);
      return new Date(Date.UTC(y, startMonth, Math.min(startDay, d)));
    };
    let c = candidate(year);
    if (c.getTime() < from.getTime()) c = candidate(year + 1);
    // Walk forward if start year is itself in the future.
    while (c.getTime() < start.getTime()) {
      year += 1;
      c = candidate(year);
    }
    return c;
  }

  // monthly
  let month = from.getUTCMonth();
  year = from.getUTCFullYear();
  const candidate = (y: number, m: number) => {
    const d = daysInMonth(y, m);
    return new Date(Date.UTC(y, m, Math.min(startDay, d)));
  };
  let c = candidate(year, month);
  if (c.getTime() < Math.max(from.getTime(), start.getTime())) {
    // advance month by month until we're on or after max(from, start)
    const target = Math.max(from.getTime(), start.getTime());
    while (c.getTime() < target) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      c = candidate(year, month);
    }
  }
  return c;
}

export function daysUntil(date: Date, from: Date = todayUTC()): number {
  return Math.round((date.getTime() - from.getTime()) / MS_PER_DAY);
}

export function humanCountdown(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0 && days < 7) return `In ${days} days`;
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 31) return `In ${Math.round(days / 7)} weeks`;
  if (days < 365) return `In ${Math.round(days / 30)} months`;
  return `In ${Math.round(days / 365)} years`;
}

export type Bucket = "overdue" | "thisWeek" | "thisMonth" | "later";

export function bucketFor(days: number): Bucket {
  if (days < 0) return "overdue";
  if (days <= 7) return "thisWeek";
  if (days <= 31) return "thisMonth";
  return "later";
}
