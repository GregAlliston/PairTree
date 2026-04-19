import { NextResponse } from "next/server";
import { supabase, type EventRow, type Recurrence } from "@/lib/supabase";
import { formatDate, nextOccurrence, daysUntil } from "@/lib/recurrence";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase()
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (data as EventRow[]).map((e) => {
    const next = nextOccurrence(e.start_date, e.recurrence);
    return {
      ...e,
      next_date: next ? formatDate(next) : null,
      days_until: next ? daysUntil(next) : null,
    };
  });
  enriched.sort((a, b) => {
    if (a.next_date === null) return 1;
    if (b.next_date === null) return -1;
    return a.next_date.localeCompare(b.next_date);
  });
  return NextResponse.json(enriched);
}

type CreateBody = {
  title?: string;
  category_id?: string | null;
  start_date?: string;
  recurrence?: Recurrence;
  reminder_days_before?: number[];
  notes?: string | null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as CreateBody;
  if (!body.title || !body.start_date) {
    return NextResponse.json(
      { error: "title and start_date are required" },
      { status: 400 },
    );
  }
  const row = {
    title: body.title.trim(),
    category_id: body.category_id ?? null,
    start_date: body.start_date,
    recurrence: (body.recurrence ?? "none") as Recurrence,
    reminder_days_before: body.reminder_days_before ?? [7, 1],
    notes: body.notes ?? null,
  };
  const { data, error } = await supabase()
    .from("events")
    .insert(row)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
