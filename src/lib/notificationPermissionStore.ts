"use client";

import { getPermission } from "./notifications";

type Permission = ReturnType<typeof getPermission>;

const SERVER_SNAPSHOT: Permission = "unsupported";

let current: Permission = SERVER_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInit() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  current = getPermission();
}

export function subscribePermission(listener: () => void): () => void {
  ensureInit();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPermissionSnapshot(): Permission {
  ensureInit();
  return current;
}

export function getPermissionServerSnapshot(): Permission {
  return SERVER_SNAPSHOT;
}

/** Call after requesting permission or subscribing to push, since the
 * browser has no change event for Notification.permission. */
export function refreshPermission(): void {
  current = getPermission();
  listeners.forEach((l) => l());
}
