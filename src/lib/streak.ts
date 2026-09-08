import { Commitment } from "./types";
import { addDaysKey, dateAtTime, todayKey } from "./date";

/**
 * A commitment left as "committed" past its shutdown time was never
 * confirmed, so it's resolved to "broken" lazily, on read.
 */
export function resolveStatuses(
  commitments: Commitment[],
  now: Date = new Date()
): Commitment[] {
  return commitments.map((c) => {
    if (c.status !== "committed") return c;
    const deadline = dateAtTime(c.date, c.shutdownTime);
    if (now.getTime() > deadline.getTime()) {
      return { ...c, status: "broken" as const };
    }
    return c;
  });
}

export function computeStreak(
  commitments: Commitment[],
  now: Date = new Date()
): number {
  const resolved = resolveStatuses(commitments, now);
  const byDate = new Map(resolved.map((c) => [c.date, c.status]));

  const today = todayKey(now);
  let cursor = byDate.get(today) === "kept" || byDate.get(today) === "broken"
    ? today
    : addDaysKey(today, -1);

  let streak = 0;
  while (byDate.get(cursor) === "kept") {
    streak += 1;
    cursor = addDaysKey(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive "kept" calendar dates in the whole history. */
export function computeLongestStreak(
  commitments: Commitment[],
  now: Date = new Date()
): number {
  const resolved = resolveStatuses(commitments, now);
  const keptDates = resolved
    .filter((c) => c.status === "kept")
    .map((c) => c.date)
    .sort();

  let longest = 0;
  let current = 0;
  let prevDate: string | null = null;
  for (const date of keptDates) {
    if (prevDate && addDaysKey(prevDate, 1) === date) {
      current += 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prevDate = date;
  }
  return longest;
}

export function computeKeptPercentage(
  commitments: Commitment[],
  now: Date = new Date()
): number {
  const resolved = resolveStatuses(commitments, now).filter(
    (c) => c.status === "kept" || c.status === "broken"
  );
  if (resolved.length === 0) return 0;
  const kept = resolved.filter((c) => c.status === "kept").length;
  return Math.round((kept / resolved.length) * 100);
}

export function findCommitment(
  commitments: Commitment[],
  dateKey: string
): Commitment | undefined {
  return commitments.find((c) => c.date === dateKey);
}
