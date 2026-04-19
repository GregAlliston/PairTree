import webpush from "web-push";

let configured = false;

function configure() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !subject) {
    throw new Error(
      "Missing VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT env vars",
    );
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export type StoredSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPush(
  sub: StoredSubscription,
  payload: { title: string; body: string; url?: string },
): Promise<{ ok: true } | { ok: false; statusCode?: number; error: string }> {
  configure();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    return { ok: false, statusCode: e.statusCode, error: e.message ?? "unknown" };
  }
}
