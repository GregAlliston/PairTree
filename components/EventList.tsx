"use client";

import Link from "next/link";
import { Repeat } from "lucide-react";
import type { Category, EventRecord } from "@/lib/types";
import {
  bucketFor,
  daysUntil,
  formatDate,
  humanCountdown,
  nextOccurrence,
  type Bucket,
} from "@/lib/recurrence";

type Props = { events: EventRecord[]; categories: Category[] };

type Enriched = EventRecord & {
  nextDate: string | null;
  daysUntil: number | null;
};

const BUCKET_LABELS: Record<Bucket, string> = {
  overdue: "Overdue",
  thisWeek: "This week",
  thisMonth: "This month",
  later: "Later",
};

const DATE_FMT = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function enrich(events: EventRecord[]): Enriched[] {
  return events
    .map((e) => {
      const next = nextOccurrence(e.startDate, e.recurrence);
      return {
        ...e,
        nextDate: next ? formatDate(next) : null,
        daysUntil: next ? daysUntil(next) : null,
      } satisfies Enriched;
    })
    .sort((a, b) => {
      if (a.nextDate === null) return 1;
      if (b.nextDate === null) return -1;
      return a.nextDate.localeCompare(b.nextDate);
    });
}

export function EventList({ events, categories }: Props) {
  const enriched = enrich(events);
  const categoryById = new Map(categories.map((c) => [c.id, c] as const));

  const grouped: Record<Bucket, Enriched[]> = {
    overdue: [],
    thisWeek: [],
    thisMonth: [],
    later: [],
  };
  for (const e of enriched) {
    if (e.daysUntil === null) continue;
    grouped[bucketFor(e.daysUntil)].push(e);
  }

  const orderedBuckets: Bucket[] = ["overdue", "thisWeek", "thisMonth", "later"];

  return (
    <div className="space-y-6">
      {orderedBuckets.map((bucket) =>
        grouped[bucket].length === 0 ? null : (
          <section key={bucket} className="space-y-2">
            <h2 className="label px-1">{BUCKET_LABELS[bucket]}</h2>
            <ul className="space-y-2">
              {grouped[bucket].map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  category={e.categoryId ? categoryById.get(e.categoryId) : undefined}
                />
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}

function EventCard({
  event,
  category,
}: {
  event: Enriched;
  category: Category | undefined;
}) {
  const color = category?.color ?? "#8a8a94";
  const days = event.daysUntil ?? 0;
  const urgent = days <= 1 && days >= 0;
  const overdue = days < 0;
  const dateLabel = event.nextDate
    ? DATE_FMT.format(new Date(event.nextDate + "T00:00:00"))
    : "—";

  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="card block p-4 hover:bg-surface-hover transition relative overflow-hidden"
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: color }}
        />
        <div className="flex items-center justify-between gap-4 pl-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{event.title}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted">
              {category && (
                <span
                  className="pill"
                  style={{
                    background: `${color}1f`,
                    color,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: color }}
                  />
                  {category.name}
                </span>
              )}
              {event.recurrence !== "none" && (
                <span className="inline-flex items-center gap-1 text-muted">
                  <Repeat size={11} />
                  {event.recurrence}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p
              className={`text-sm font-semibold ${
                overdue
                  ? "text-danger"
                  : urgent
                    ? "text-accent"
                    : "text-text"
              }`}
            >
              {humanCountdown(days)}
            </p>
            <p className="text-xs text-muted mt-0.5">{dateLabel}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}
