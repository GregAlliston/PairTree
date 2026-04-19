"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

type State = "idle" | "unsupported" | "enabled" | "denied" | "working";

export function EnableNotificationsButton() {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setState("enabled");
    else if (Notification.permission === "denied") setState("denied");
  }, []);

  async function enable() {
    try {
      setState("working");
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error("VAPID public key not configured");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error(await res.text());
      setState("enabled");
    } catch {
      setState("idle");
    }
  }

  if (state === "unsupported") {
    return (
      <span className="text-xs text-muted">
        Notifications unsupported in this browser
      </span>
    );
  }
  if (state === "enabled") {
    return <span className="text-xs text-muted">Reminders on</span>;
  }
  if (state === "denied") {
    return (
      <span className="text-xs text-muted">
        Reminders blocked — enable in browser settings
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={enable}
      disabled={state === "working"}
      className="btn-ghost text-xs"
    >
      {state === "working" ? "Enabling…" : "Enable reminders"}
    </button>
  );
}
