import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase()
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

type CreateBody = { name?: string; color?: string; icon?: string };

export async function POST(req: Request) {
  const body = (await req.json()) as CreateBody;
  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const { data, error } = await supabase()
    .from("categories")
    .insert({
      name: body.name.trim(),
      color: body.color ?? "#60a5fa",
      icon: body.icon ?? "calendar",
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
