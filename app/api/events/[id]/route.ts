import { NextResponse } from "next/server";
import { supabase, type Recurrence } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const { data, error } = await supabase()
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

type PatchBody = {
  title?: string;
  category_id?: string | null;
  start_date?: string;
  recurrence?: Recurrence;
  reminder_days_before?: number[];
  notes?: string | null;
};

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = (await req.json()) as PatchBody;
  const { data, error } = await supabase()
    .from("events")
    .update(body)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const { error } = await supabase().from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
