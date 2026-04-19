"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Category, EventRow, Recurrence } from "@/lib/supabase";

type Props =
  | { mode: "create"; categories: Category[]; event?: undefined }
  | { mode: "edit"; categories: Category[]; event: EventRow };

const REMINDER_PRESETS = [
  { label: "On the day", days: [0] },
  { label: "1 day before", days: [1] },
  { label: "1 week + 1 day before", days: [7, 1] },
  { label: "1 month + 1 week before", days: [30, 7] },
];

function remindersToKey(days: number[]): string {
  return [...days].sort((a, b) => b - a).join(",");
}

export function EventForm({ categories, mode, event }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(event?.title ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    event?.category_id ?? "",
  );
  const [startDate, setStartDate] = useState(
    event?.start_date ?? new Date().toISOString().slice(0, 10),
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    event?.recurrence ?? "yearly",
  );
  const [reminderKey, setReminderKey] = useState(
    remindersToKey(event?.reminder_days_before ?? [7, 1]),
  );
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const body = {
      title: title.trim(),
      category_id: categoryId || null,
      start_date: startDate,
      recurrence,
      reminder_days_before: reminderKey
        .split(",")
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n)),
      notes: notes.trim() || null,
    };
    const res = await fetch(
      mode === "create" ? "/api/events" : `/api/events/${event.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    setSubmitting(false);
    if (!res.ok) {
      const text = await res.text();
      setError(text || "Save failed");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function onDelete() {
    if (mode !== "edit") return;
    if (!confirm("Delete this event?")) return;
    setSubmitting(true);
    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    setSubmitting(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs text-muted">Title</span>
        <input
          className="input mt-1"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Car insurance renewal"
        />
      </label>

      <label className="block">
        <span className="text-xs text-muted">Category</span>
        <select
          className="input mt-1"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Uncategorised</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-muted">Date</span>
        <input
          type="date"
          className="input mt-1"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-xs text-muted">Repeats</span>
        <select
          className="input mt-1"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as Recurrence)}
        >
          <option value="none">One-off</option>
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-muted">Remind me</span>
        <select
          className="input mt-1"
          value={reminderKey}
          onChange={(e) => setReminderKey(e.target.value)}
        >
          {REMINDER_PRESETS.map((p) => (
            <option key={p.label} value={remindersToKey(p.days)}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-muted">Notes</span>
        <textarea
          className="input mt-1 min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Policy number, account, link…"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-between gap-3 pt-2">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="btn-ghost text-red-300 border-red-500/40"
          >
            Delete
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : mode === "create" ? "Create" : "Save"}
        </button>
      </div>
    </form>
  );
}
