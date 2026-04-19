import { supabase, type Category } from "@/lib/supabase";
import { EventForm } from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const { data } = await supabase()
    .from("categories")
    .select("*")
    .order("name");
  const categories = (data ?? []) as Category[];
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">New event</h1>
      <EventForm categories={categories} mode="create" />
    </div>
  );
}
