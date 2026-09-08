"use client";

import { AppData, Checkin, Commitment, Habit, Profile } from "./types";
import { clearAllData, loadData, saveData } from "./storage";

/**
 * Stable placeholder returned during SSR and the initial client hydration
 * pass. useSyncExternalStore renders this on both, then swaps to the real
 * localStorage-backed snapshot in a client-only re-render — no manual
 * "mounted" state needed, and no hydration mismatch.
 */
export const DATA_SERVER_SNAPSHOT: AppData = {
  profile: {
    onboarded: false,
    timezone: "UTC",
    defaultShutdownTime: "23:00",
    notificationSetting: "off",
  },
  commitments: [],
  habits: [],
  checkins: [],
};

let cached: AppData | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeData(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDataSnapshot(): AppData {
  if (!cached) cached = loadData();
  return cached;
}

export function getDataServerSnapshot(): AppData {
  return DATA_SERVER_SNAPSHOT;
}

function commit(next: AppData) {
  cached = next;
  saveData(next);
  emit();
}

export function setProfile(profile: Profile): void {
  commit({ ...getDataSnapshot(), profile });
}

export function setCommitment(commitment: Commitment): void {
  const data = getDataSnapshot();
  const idx = data.commitments.findIndex((c) => c.id === commitment.id);
  const commitments =
    idx >= 0
      ? data.commitments.map((c) => (c.id === commitment.id ? commitment : c))
      : [...data.commitments, commitment];
  commit({ ...data, commitments });
}

export function setCommitments(commitments: Commitment[]): void {
  commit({ ...getDataSnapshot(), commitments });
}

export function addHabit(habit: Habit): void {
  const data = getDataSnapshot();
  commit({ ...data, habits: [...data.habits, habit] });
}

export function updateHabit(habitId: string, patch: Partial<Habit>): void {
  const data = getDataSnapshot();
  commit({
    ...data,
    habits: data.habits.map((h) => (h.id === habitId ? { ...h, ...patch } : h)),
  });
}

export function deleteHabit(habitId: string): void {
  const data = getDataSnapshot();
  commit({
    ...data,
    habits: data.habits.filter((h) => h.id !== habitId),
    checkins: data.checkins.filter((c) => c.habitId !== habitId),
  });
}

export function toggleCheckin(habitId: string, localDate: string): void {
  const data = getDataSnapshot();
  const existing = data.checkins.find(
    (c) => c.habitId === habitId && c.localDate === localDate
  );
  if (existing) {
    commit({
      ...data,
      checkins: data.checkins.filter((c) => c.id !== existing.id),
    });
    return;
  }
  const checkin: Checkin = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    habitId,
    localDate,
    completedAt: new Date().toISOString(),
  };
  commit({ ...data, checkins: [...data.checkins, checkin] });
}

export function resetAllData(): void {
  clearAllData();
  cached = null;
  emit();
}
