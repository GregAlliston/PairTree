"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { CategoryManager } from "@/components/CategoryManager";

export default function CategoriesPage() {
  const snap = useStore();
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center gap-2">
        <Link
          href="/"
          className="text-muted hover:text-text -ml-2 p-2"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold">Categories</h1>
      </header>
      {snap && <CategoryManager categories={snap.categories} />}
    </div>
  );
}
