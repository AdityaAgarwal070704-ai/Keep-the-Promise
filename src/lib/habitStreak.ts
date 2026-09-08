import { Checkin, Habit } from "./types";
import { addDaysKey, isWeekend, todayKey, weekStartKey } from "./date";

export interface HabitStreakInfo {
  current: number;
  longest: number;
  doneToday: boolean;
  requiredToday: boolean;
}

function isDailyRequired(habit: Habit, dateKey: string): boolean {
  if (habit.frequency.type === "weekdays") return !isWeekend(dateKey);
  return true;
}

function checkinDateSet(checkins: Checkin[], habitId: string): Set<string> {
  return new Set(checkins.filter((c) => c.habitId === habitId).map((c) => c.localDate));
}

/**
 * Daily/weekdays streak: walks backward from today. Non-required days (e.g.
 * weekends for a weekdays habit) are skipped without affecting the streak.
 * Today itself never breaks a streak while still in progress — only a
 * required day strictly in the past with no check-in does.
 */
function dailyLikeCurrentStreak(habit: Habit, dates: Set<string>, now: Date): number {
  const today = todayKey(now);
  let cursor = today;
  let streak = 0;
  while (true) {
    if (isDailyRequired(habit, cursor)) {
      if (dates.has(cursor)) {
        streak += 1;
      } else if (cursor !== today) {
        break;
      }
    }
    cursor = addDaysKey(cursor, -1);
  }
  return streak;
}

function dailyLikeLongestStreak(
  habit: Habit,
  dates: Set<string>,
  now: Date,
  createdAt: string
): number {
  const today = todayKey(now);
  let cursor = todayKey(new Date(createdAt));
  let longest = 0;
  let run = 0;
  let guard = 0;
  while (cursor <= today && guard < 366 * 5) {
    guard += 1;
    if (isDailyRequired(habit, cursor)) {
      if (dates.has(cursor)) {
        run += 1;
        longest = Math.max(longest, run);
      } else {
        run = 0;
      }
    }
    cursor = addDaysKey(cursor, 1);
  }
  return longest;
}

function weekCheckinCount(dates: Set<string>, weekStart: string): number {
  let count = 0;
  let d = weekStart;
  for (let i = 0; i < 7; i++) {
    if (dates.has(d)) count += 1;
    d = addDaysKey(d, 1);
  }
  return count;
}

/** The current (possibly still in-progress) week never breaks the streak
 * on its own — only a fully-elapsed week that missed quota does. */
function weeklyCurrentStreak(requiredCount: number, dates: Set<string>, now: Date): number {
  let weekCursor = weekStartKey(todayKey(now));
  let streak = 0;
  let isCurrentWeek = true;
  while (true) {
    const count = weekCheckinCount(dates, weekCursor);
    if (count >= requiredCount) {
      streak += 1;
    } else if (!isCurrentWeek) {
      break;
    }
    isCurrentWeek = false;
    weekCursor = addDaysKey(weekCursor, -7);
  }
  return streak;
}

function weeklyLongestStreak(
  requiredCount: number,
  dates: Set<string>,
  now: Date,
  createdAt: string
): number {
  const thisWeekStart = weekStartKey(todayKey(now));
  let weekCursor = weekStartKey(todayKey(new Date(createdAt)));
  let longest = 0;
  let run = 0;
  let guard = 0;
  while (weekCursor <= thisWeekStart && guard < 600) {
    guard += 1;
    const count = weekCheckinCount(dates, weekCursor);
    if (count >= requiredCount) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
    weekCursor = addDaysKey(weekCursor, 7);
  }
  return longest;
}

export function computeHabitStreak(
  habit: Habit,
  checkins: Checkin[],
  now: Date = new Date()
): HabitStreakInfo {
  const dates = checkinDateSet(checkins, habit.id);
  const today = todayKey(now);

  if (habit.frequency.type === "times_per_week") {
    const requiredCount = Math.max(1, habit.frequency.count);
    return {
      current: weeklyCurrentStreak(requiredCount, dates, now),
      longest: weeklyLongestStreak(requiredCount, dates, now, habit.createdAt),
      doneToday: dates.has(today),
      requiredToday: true,
    };
  }

  return {
    current: dailyLikeCurrentStreak(habit, dates, now),
    longest: dailyLikeLongestStreak(habit, dates, now, habit.createdAt),
    doneToday: dates.has(today),
    requiredToday: isDailyRequired(habit, today),
  };
}

export function frequencyLabel(habit: Habit): string {
  switch (habit.frequency.type) {
    case "daily":
      return "Daily";
    case "weekdays":
      return "Weekdays";
    case "times_per_week":
      return `${habit.frequency.count}x / week`;
  }
}
