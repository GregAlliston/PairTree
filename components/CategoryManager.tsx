"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { addCategory, deleteCategory } from "@/lib/store";

const COLORS = [
  "#60a5fa",
  "#f59e0b",
  "#ec4899",
  "#a78bfa",
  "#10b981",
  "#ef4444",
  "#6366f1",
  "#eab308",
  "#22d3ee",
  "#f97316",
];

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addCategory({ name: trimmed, color, icon: "calendar" });
    setName("");
  }

  function onDelete(id: string) {
    if (!confirm("Delete this category? Events will be uncategorised.")) return;
    deleteCategory(id);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="card p-4 space-y-3.5">
        <label className="block space-y-1.5">
          <span className="label">New category</span>
          <input
            className="input"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Utilities"
          />
        </label>
        <div className="space-y-1.5">
          <span className="label">Colour</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select colour ${c}`}
                className={`w-8 h-8 rounded-full transition ${
                  color === c
                    ? "ring-2 ring-offset-2 ring-offset-surface ring-text"
                    : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary">
          Add category
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="card p-3.5 flex items-center gap-3">
            <span
              className="inline-block w-3 h-3 rounded-full shrink-0"
              style={{ background: c.color }}
            />
            <span className="font-medium flex-1">{c.name}</span>
            <button
              type="button"
              onClick={() => onDelete(c.id)}
              className="text-muted hover:text-danger p-1.5 -mr-1"
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
