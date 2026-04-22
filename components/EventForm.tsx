"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import type { Category, EventRecord, Recurrence } from "@/lib/types";
import { addEvent, deleteEvent, updateEvent } from "@/lib/store";

type Props =
  | { mode: "create"; categories: Category[]; event?: undefined }
  | { mode: "edit"; categories: Category[]; event: EventRecord };

const REMINDER_PRESETS: { label: string; days: number[] }[] = [
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
  const [categoryId, setCategoryId] = useState<string>(event?.categoryId ?? "");
  const [startDate, setStartDate] = useState(
    event?.startDate ?? new Date().toISOString().slice(0, 10),
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    event?.recurrence ?? "yearly",
  );
  const [reminderKey, setReminderKey] = useState(
    remindersToKey(event?.reminderDaysBefore ?? [7, 1]),
  );
  const [notes, setNotes] = useState(event?.notes ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      categoryId: categoryId || null,
      startDate,
      recurrence,
      reminderDaysBefore: reminderKey
        .split(",")
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n)),
      notes: notes.trim() || null,
    };
    if (mode === "create") {
      addEvent(payload);
    } else {
      updateEvent(event.id, payload);
    }
    router.push("/");
  }

  function onDelete() {
    if (mode !== "edit") return;
    if (!confirm("Delete this event?")) return;
    deleteEvent(event.id);
    router.push("/");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="label">Title</span>
        <input
          className="input"
          required
          autoFocus={mode === "create"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Car insurance renewal"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="label">Category</span>
        <select
          className="input"
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

      <label className="block space-y-1.5">
        <span className="label">Date</span>
        <input
          type="date"
          className="input"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="label">Repeats</span>
        <select
          className="input"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as Recurrence)}
        >
          <option value="none">One-off</option>
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="label">Remind me</span>
        <select
          className="input"
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

      <label className="block space-y-1.5">
        <span className="label">Notes</span>
        <textarea
          className="input min-h-[90px] resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Policy number, account, link…"
        />
      </label>

      <div className="flex items-center justify-between gap-3 pt-3">
        {mode === "edit" ? (
          <button type="button" onClick={onDelete} className="btn-danger">
            <Trash2 size={16} />
            Delete
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn-primary">
          {mode === "create" ? "Add event" : "Save"}
        </button>
      </div>
    </form>
  );
}
