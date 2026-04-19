import Link from "next/link";
import { supabase, type Category, type EventRow } from "@/lib/supabase";
import {
  bucketFor,
  daysUntil,
  formatDate,
  humanCountdown,
  nextOccurrence,
} from "@/lib/recurrence";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";

export const dynamic = "force-dynamic";

type EnrichedEvent = EventRow & {
  next_date: string | null;
  days_until: number | null;
};

async function loadData(): Promise<{
  events: EnrichedEvent[];
  categoryById: Map<string, Category>;
}> {
  const db = supabase();
  const [{ data: eventsData }, { data: catsData }] = await Promise.all([
    db.from("events").select("*"),
    db.from("categories").select("*"),
  ]);
  const events = ((eventsData ?? []) as EventRow[]).map((e) => {
    const next = nextOccurrence(e.start_date, e.recurrence);
    return {
      ...e,
      next_date: next ? formatDate(next) : null,
      days_until: next ? daysUntil(next) : null,
    } satisfies EnrichedEvent;
  });
  events.sort((a, b) => {
    if (a.next_date === null) return 1;
    if (b.next_date === null) return -1;
    return a.next_date.localeCompare(b.next_date);
  });
  const categoryById = new Map<string, Category>();
  for (const c of (catsData ?? []) as Category[]) categoryById.set(c.id, c);
  return { events, categoryById };
}

const BUCKET_LABELS: Record<string, string> = {
  overdue: "Overdue",
  thisWeek: "This week",
  thisMonth: "This month",
  later: "Later",
};

export default async function HomePage() {
  let events: EnrichedEvent[] = [];
  let categoryById = new Map<string, Category>();
  let loadError: string | null = null;
  try {
    const data = await loadData();
    events = data.events;
    categoryById = data.categoryById;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load";
  }

  const grouped: Record<string, EnrichedEvent[]> = {
    overdue: [],
    thisWeek: [],
    thisMonth: [],
    later: [],
  };
  for (const e of events) {
    if (e.days_until === null) continue;
    grouped[bucketFor(e.days_until)].push(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <EnableNotificationsButton />
        <Link href="/events/new" className="btn-primary">
          + New event
        </Link>
      </div>

      {loadError && (
        <div className="card border-red-500/50 text-red-300">
          <p className="text-sm font-medium">Couldn&apos;t load events</p>
          <p className="text-xs text-muted mt-1">{loadError}</p>
          <p className="text-xs text-muted mt-2">
            Check your <code>.env.local</code> and Supabase migration.
          </p>
        </div>
      )}

      {!loadError && events.length === 0 && (
        <div className="card text-center">
          <p className="text-sm">No events yet.</p>
          <p className="text-xs text-muted mt-1">
            Add a birthday, renewal, or deadline to get started.
          </p>
        </div>
      )}

      {(["overdue", "thisWeek", "thisMonth", "later"] as const).map((bucket) =>
        grouped[bucket].length === 0 ? null : (
          <section key={bucket} className="space-y-2">
            <h2 className="text-xs uppercase tracking-wider text-muted px-1">
              {BUCKET_LABELS[bucket]}
            </h2>
            <ul className="space-y-2">
              {grouped[bucket].map((e) => {
                const cat = e.category_id
                  ? categoryById.get(e.category_id)
                  : undefined;
                return (
                  <li key={e.id}>
                    <Link
                      href={`/events/${e.id}`}
                      className="card flex items-center justify-between gap-3 hover:border-accent/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{e.title}</p>
                        <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
                          {cat && (
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ background: cat.color }}
                            />
                          )}
                          <span>{cat?.name ?? "Uncategorised"}</span>
                          {e.recurrence !== "none" && (
                            <span>· {e.recurrence}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {e.days_until !== null
                            ? humanCountdown(e.days_until)
                            : "—"}
                        </p>
                        <p className="text-xs text-muted">{e.next_date}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
