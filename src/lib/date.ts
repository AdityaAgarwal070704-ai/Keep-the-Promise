/**
 * All scheduling here runs against the device's own clock, so "local time"
 * never needs an explicit conversion: a Date built from local components is
 * already correct for the user's timezone, including across DST changes.
 */

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function keyToDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return todayKey(date);
}

/** Builds a local Date for HH:mm on the given calendar date. */
export function dateAtTime(dateKey: string, hhmm: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function reminderTimeFor(shutdownTime: string): string {
  const mins = (timeToMinutes(shutdownTime) - 5 + 24 * 60) % (24 * 60);
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}

export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
}

export function formatDateLabel(dateKey: string): string {
  return keyToDate(dateKey).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getTimezoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "your local timezone";
  }
}

/** 0 (Mon) .. 6 (Sun) — ISO-style, so week math doesn't have to special-case Sunday. */
export function isoWeekday(dateKey: string): number {
  const jsDay = keyToDate(dateKey).getDay(); // 0 (Sun) .. 6 (Sat)
  return (jsDay + 6) % 7;
}

export function isWeekend(dateKey: string): boolean {
  const wd = isoWeekday(dateKey);
  return wd === 5 || wd === 6;
}

/** Monday of the week containing dateKey, as a YYYY-MM-DD key. */
export function weekStartKey(dateKey: string): string {
  return addDaysKey(dateKey, -isoWeekday(dateKey));
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function addMonths(monthKeyStr: string, delta: number): string {
  const [y, m] = monthKeyStr.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function formatMonthLabel(monthKeyStr: string): string {
  const [y, m] = monthKeyStr.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/** All date keys in a month, in order. */
export function daysInMonth(monthKeyStr: string): string[] {
  const [y, m] = monthKeyStr.split("-").map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${monthKeyStr}-${pad(i + 1)}`);
}
