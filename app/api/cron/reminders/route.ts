import { NextResponse } from "next/server";
import { supabase, type EventRow } from "@/lib/supabase";
import { daysUntil, nextOccurrence } from "@/lib/recurrence";
import { sendPush, type StoredSubscription } from "@/lib/webpush";

export const dynamic = "force-dynamic";

function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-cron-secret");
  const bearer = req.headers.get("authorization");
  return header === secret || bearer === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const db = supabase();
  const [{ data: events, error: evErr }, { data: subs, error: subErr }] =
    await Promise.all([
      db.from("events").select("*"),
      db.from("push_subscriptions").select("endpoint,p256dh,auth"),
    ]);
  if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 });
  if (subErr)
    return NextResponse.json({ error: subErr.message }, { status: 500 });

  const subscriptions = (subs ?? []) as StoredSubscription[];
  if (subscriptions.length === 0) {
    return NextResponse.json({ checked: events?.length ?? 0, sent: 0 });
  }

  let sent = 0;
  const failures: { endpoint: string; statusCode?: number }[] = [];

  for (const ev of (events ?? []) as EventRow[]) {
    const next = nextOccurrence(ev.start_date, ev.recurrence);
    if (!next) continue;
    const days = daysUntil(next);
    if (!ev.reminder_days_before.includes(days)) continue;
    const body =
      days === 0
        ? `Today: ${ev.title}`
        : days === 1
          ? `Tomorrow: ${ev.title}`
          : `In ${days} days: ${ev.title}`;
    for (const sub of subscriptions) {
      const res = await sendPush(sub, {
        title: "Life Admin reminder",
        body,
        url: "/",
      });
      if (res.ok) sent += 1;
      else failures.push({ endpoint: sub.endpoint, statusCode: res.statusCode });
    }
  }

  // Clean up subscriptions the push service has permanently rejected.
  const gone = failures
    .filter((f) => f.statusCode === 404 || f.statusCode === 410)
    .map((f) => f.endpoint);
  if (gone.length) {
    await db.from("push_subscriptions").delete().in("endpoint", gone);
  }

  return NextResponse.json({
    checked: events?.length ?? 0,
    sent,
    removed: gone.length,
  });
}
