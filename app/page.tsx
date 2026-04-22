"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Settings2, Inbox } from "lucide-react";
import { useStore } from "@/lib/store";
import { EventList } from "@/components/EventList";

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: "long" });
const LONG = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
});

export default function HomePage() {
  const snap = useStore();
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="flex items-end justify-between gap-4">
        <div className="min-h-[56px]">
          {today && (
            <>
              <p className="label">{WEEKDAY.format(today)}</p>
              <h1 className="text-3xl font-semibold tracking-tight mt-0.5">
                {LONG.format(today)}
              </h1>
            </>
          )}
        </div>
        <Link
          href="/categories"
          aria-label="Categories"
          className="text-muted hover:text-text p-2 -mr-2"
        >
          <Settings2 size={20} />
        </Link>
      </header>

      {!snap ? (
        <div className="card p-6 text-muted text-sm">Loading…</div>
      ) : snap.events.length === 0 ? (
        <EmptyState />
      ) : (
        <EventList events={snap.events} categories={snap.categories} />
      )}

      <Link
        href="/events/new"
        className="btn-primary w-full py-3 text-base shadow-card"
      >
        <Plus size={18} />
        Add event
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-8 text-center space-y-3">
      <div className="mx-auto w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
        <Inbox size={22} className="text-accent" />
      </div>
      <div>
        <p className="font-medium">Nothing scheduled</p>
        <p className="text-sm text-muted mt-1">
          Add your first event — a birthday, a renewal, a deadline.
        </p>
      </div>
    </div>
  );
}
