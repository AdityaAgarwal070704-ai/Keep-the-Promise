"use client";

/**
 * Real Web Push client plumbing (service worker registration + a genuine
 * PushSubscription), gated behind NEXT_PUBLIC_VAPID_PUBLIC_KEY. Without that
 * key configured — which requires generating a VAPID keypair and wiring up
 * server-side storage + a scheduler, see README.md "Push notifications" —
 * this intentionally stays inactive rather than pretending to work.
 */

export function getVapidPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
}

export function isPushConfigured(): boolean {
  return Boolean(getVapidPublicKey());
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const vapidKey = getVapidPublicKey();
  if (!isPushSupported() || !vapidKey) return null;

  const registration = await navigator.serviceWorker.register("/sw.js");
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
  });
}

export async function sendSubscriptionToServer(
  subscription: PushSubscription
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data.message ?? (res.ok ? "Subscribed." : "Request failed.") };
  } catch {
    return { ok: false, message: "Network error while reaching the server." };
  }
}
