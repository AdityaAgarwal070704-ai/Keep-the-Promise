/**
 * Browser Notification API only fires while this tab (or its service worker,
 * which we don't register in the MVP) is alive — there is no reliable way
 * for a website to wake a fully closed browser/phone. So this module is
 * scoped to "best effort while the app is open" and the UI is honest about
 * that limit. A future native/mobile push layer can implement the same
 * `notifyReminder` signature and swap in behind this module.
 */

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function notifyReminder(shutdownTime: string): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification("5 minutes to keep the promise.", {
      body: `You said you'd disconnect at ${shutdownTime}.`,
      tag: "ktp-reminder",
      requireInteraction: true,
    });
  } catch {
    // Some mobile browsers throw on `new Notification`; the in-app banner
    // is the fallback and always renders regardless.
  }
}
