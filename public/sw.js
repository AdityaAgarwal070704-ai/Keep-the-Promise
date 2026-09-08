// Minimal push service worker. Registered by src/lib/push.ts, only once a
// VAPID public key is configured (NEXT_PUBLIC_VAPID_PUBLIC_KEY). It does not
// schedule anything itself — it just displays whatever push event the server
// sends. See README.md "Push notifications" for what else this needs.

self.addEventListener("push", (event) => {
  let payload = { title: "Keep the Promise", body: "5 minutes to keep the promise." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON payload — fall back to the default copy above.
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: "ktp-reminder",
      requireInteraction: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow("/");
    })
  );
});
