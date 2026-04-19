import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
};

export type Recurrence = "none" | "yearly" | "monthly";

export type EventRow = {
  id: string;
  title: string;
  category_id: string | null;
  start_date: string; // YYYY-MM-DD
  recurrence: Recurrence;
  reminder_days_before: number[];
  notes: string | null;
  created_at: string;
};
