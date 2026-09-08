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

export function findCommitment(
  commitments: Commitment[],
  dateKey: string
): Commitment | undefined {
  return commitments.find((c) => c.date === dateKey);
}
