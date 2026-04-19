import { notFound } from "next/navigation";
import { supabase, type Category, type EventRow } from "@/lib/supabase";
import { EventForm } from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabase();
  const [{ data: event }, { data: cats }] = await Promise.all([
    db.from("events").select("*").eq("id", id).single(),
    db.from("categories").select("*").order("name"),
  ]);
  if (!event) return notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Edit event</h1>
      <EventForm
        categories={(cats ?? []) as Category[]}
        mode="edit"
        event={event as EventRow}
      />
    </div>
  );
}
