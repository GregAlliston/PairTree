"use client";

import { useEffect, useState } from "react";
import type { Category, EventRecord, Recurrence } from "./types";

const STORAGE_KEY = "life-admin.v1";
const STORAGE_VERSION = 1;

type State = {
  version: number;
  categories: Category[];
  events: EventRecord[];
};

type Listener = (s: State) => void;
const listeners = new Set<Listener>();
let state: State | null = null;

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function emptyState(): State {
  return { version: STORAGE_VERSION, categories: [], events: [] };
}

function defaultCategories(): Category[] {
  return [
    { id: uid(), name: "Insurance", color: "#60a5fa", icon: "shield" },
    { id: uid(), name: "Tax", color: "#f59e0b", icon: "receipt" },
    { id: uid(), name: "Birthday", color: "#ec4899", icon: "cake" },
    { id: uid(), name: "Anniversary", color: "#a78bfa", icon: "heart" },
    { id: uid(), name: "Vehicle", color: "#10b981", icon: "car" },
    { id: uid(), name: "Health", color: "#ef4444", icon: "stethoscope" },
    { id: uid(), name: "Subscription", color: "#6366f1", icon: "credit-card" },
  ];
}

function sampleEvents(categories: Category[]): EventRecord[] {
  const byName = (n: string) =>
    categories.find((c) => c.name === n)?.id ?? null;
  const today = new Date();
  const addDays = (d: Date, days: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  };
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const mk = (
    title: string,
    cat: string,
    offset: number,
    recurrence: Recurrence,
    notes: string | null = null,
  ): EventRecord => ({
    id: uid(),
    title,
    categoryId: byName(cat),
    startDate: iso(addDays(today, offset)),
    recurrence,
    reminderDaysBefore: [7, 1],
    notes,
    createdAt: now,
  });
  return [
    mk("Car insurance renewal", "Insurance", 6, "yearly", "Policy #AB-12345"),
    mk("Self-assessment deadline", "Tax", 24, "yearly"),
    mk("Mum's birthday", "Birthday", 42, "yearly"),
    mk("Gym membership", "Subscription", 3, "monthly"),
    mk("MOT", "Vehicle", 120, "yearly"),
  ];
}

function load(): State {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const cats = defaultCategories();
      const seeded: State = {
        version: STORAGE_VERSION,
        categories: cats,
        events: sampleEvents(cats),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as State;
    if (!parsed.version) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function persist(next: State) {
  state = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  for (const l of listeners) l(next);
}

function get(): State {
  if (!state) state = load();
  return state;
}

export function useStore() {
  const [snap, setSnap] = useState<State | null>(null);

  useEffect(() => {
    const initial = get();
    setSnap(initial);
    const listener: Listener = (s) => setSnap({ ...s });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return snap;
}

// Mutations — all no-ops server-side.

export function addEvent(input: Omit<EventRecord, "id" | "createdAt">): EventRecord {
  const cur = get();
  const ev: EventRecord = {
    ...input,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  persist({ ...cur, events: [...cur.events, ev] });
  return ev;
}

export function updateEvent(id: string, patch: Partial<EventRecord>): void {
  const cur = get();
  persist({
    ...cur,
    events: cur.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  });
}

export function deleteEvent(id: string): void {
  const cur = get();
  persist({ ...cur, events: cur.events.filter((e) => e.id !== id) });
}

export function addCategory(input: Omit<Category, "id">): Category {
  const cur = get();
  const cat: Category = { ...input, id: uid() };
  persist({ ...cur, categories: [...cur.categories, cat] });
  return cat;
}

export function deleteCategory(id: string): void {
  const cur = get();
  persist({
    ...cur,
    categories: cur.categories.filter((c) => c.id !== id),
    events: cur.events.map((e) =>
      e.categoryId === id ? { ...e, categoryId: null } : e,
    ),
  });
}

export function resetAll(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  state = null;
  persist(load());
}
