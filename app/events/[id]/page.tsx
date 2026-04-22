"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { EventForm } from "@/components/EventForm";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const snap = useStore();
  if (!snap) return null;
  const event = snap.events.find((e) => e.id === params.id);
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
        <h1 className="text-xl font-semibold">Edit event</h1>
      </header>
      {event ? (
        <EventForm mode="edit" event={event} categories={snap.categories} />
      ) : (
        <p className="text-sm text-muted">Event not found.</p>
      )}
    </div>
  );
}
