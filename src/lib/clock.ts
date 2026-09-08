"use client";

const CLOCK_SERVER_SNAPSHOT = new Date(0);

let current = new Date();
const listeners = new Set<() => void>();
let started = false;

function tick() {
  current = new Date();
  listeners.forEach((l) => l());
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  setInterval(tick, 15_000);
}

export function subscribeClock(listener: () => void): () => void {
  ensureStarted();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getClockSnapshot(): Date {
  return current;
}

export function getClockServerSnapshot(): Date {
  return CLOCK_SERVER_SNAPSHOT;
}
