"use client";

import { useState, type FormEvent } from "react";
import type { Category } from "@/lib/supabase";

const COLORS = [
  "#60a5fa",
  "#f59e0b",
  "#ec4899",
  "#a78bfa",
  "#10b981",
  "#ef4444",
  "#6366f1",
  "#eab308",
];

export function CategoryManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), color }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const text = await res.text();
      setError(text || "Failed");
      return;
    }
    const created = (await res.json()) as Category;
    setCategories((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setName("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="card space-y-3">
        <label className="block">
          <span className="text-xs text-muted">New category name</span>
          <input
            className="input mt-1"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Utilities"
          />
        </label>
        <div>
          <span className="text-xs text-muted">Colour</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select colour ${c}`}
                className={`w-7 h-7 rounded-full border-2 ${
                  color === c ? "border-text" : "border-transparent"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Adding…" : "Add category"}
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="card flex items-center gap-3">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: c.color }}
            />
            <span className="font-medium">{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
