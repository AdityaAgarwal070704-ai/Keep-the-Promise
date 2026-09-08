"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Habit, HabitFrequency } from "./types";
import {
  DATA_SERVER_SNAPSHOT,
  addHabit,
  deleteHabit,
  getDataServerSnapshot,
  getDataSnapshot,
  subscribeData,
  toggleCheckin,
  updateHabit,
} from "./dataStore";
import { getClockServerSnapshot, getClockSnapshot, subscribeClock } from "./clock";
import { computeHabitStreak, HabitStreakInfo } from "./habitStreak";
import { todayKey } from "./date";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface HabitWithStreak extends Habit {
  streak: HabitStreakInfo;
}

export function useHabits() {
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);
  const now = useSyncExternalStore(subscribeClock, getClockSnapshot, getClockServerSnapshot);
  const hydrated = data !== DATA_SERVER_SNAPSHOT;
  const today = todayKey(now);

  const habits: HabitWithStreak[] = useMemo(
    () =>
      data.habits
        .filter((h) => h.active)
        .map((h) => ({ ...h, streak: computeHabitStreak(h, data.checkins, now) })),
    [data.habits, data.checkins, now]
  );

  const createHabit = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const habit: Habit = {
      id: makeId(),
      name: trimmed,
      frequency: { type: "daily" },
      active: true,
      createdAt: new Date().toISOString(),
    };
    addHabit(habit);
  }, []);

  const renameHabit = useCallback((habitId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateHabit(habitId, { name: trimmed });
  }, []);

  const setFrequency = useCallback((habitId: string, frequency: HabitFrequency) => {
    updateHabit(habitId, { frequency });
  }, []);

  const removeHabit = useCallback((habitId: string) => {
    deleteHabit(habitId);
  }, []);

  const toggleToday = useCallback(
    (habitId: string) => {
      toggleCheckin(habitId, today);
    },
    [today]
  );

  return {
    hydrated,
    habits,
    today,
    createHabit,
    renameHabit,
    setFrequency,
    removeHabit,
    toggleToday,
  };
}
