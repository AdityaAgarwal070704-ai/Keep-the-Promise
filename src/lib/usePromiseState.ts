"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { Commitment } from "./types";
import {
  DATA_SERVER_SNAPSHOT,
  getDataServerSnapshot,
  getDataSnapshot,
  setCommitment,
  setCommitments,
  setProfile,
  subscribeData,
} from "./dataStore";
import {
  getClockServerSnapshot,
  getClockSnapshot,
  subscribeClock,
} from "./clock";
import {
  computeKeptPercentage,
  computeLongestStreak,
  computeStreak,
  findCommitment,
  resolveStatuses,
} from "./streak";
import { dateAtTime, reminderTimeFor, todayKey } from "./date";
import { notifyReminder, requestNotificationPermission } from "./notifications";

export type NightPhase = "no-commitment" | "locked" | "warning" | "kept" | "broken";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function usePromiseState() {
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);
  const now = useSyncExternalStore(subscribeClock, getClockSnapshot, getClockServerSnapshot);
  const hydrated = data !== DATA_SERVER_SNAPSHOT;

  const today = todayKey(now);
  const resolvedCommitments = useMemo(
    () => resolveStatuses(data.commitments, now),
    [data.commitments, now]
  );
  const tonight = useMemo(
    () => findCommitment(resolvedCommitments, today),
    [resolvedCommitments, today]
  );
  const streak = useMemo(
    () => computeStreak(data.commitments, now),
    [data.commitments, now]
  );
  const longestStreak = useMemo(
    () => computeLongestStreak(data.commitments, now),
    [data.commitments, now]
  );
  const keptPercentage = useMemo(
    () => computeKeptPercentage(data.commitments, now),
    [data.commitments, now]
  );

  // Persist the lazily-resolved "broken" transition and fire the five-minute
  // reminder exactly once. This is a genuine side effect (storage write +
  // Notification API), so it belongs in an effect; it goes through the data
  // store rather than component state.
  useEffect(() => {
    if (!hydrated) return;
    let next = resolvedCommitments;
    if (
      tonight &&
      tonight.status === "committed" &&
      !tonight.reminderFiredAt &&
      now.getTime() >= dateAtTime(tonight.date, tonight.reminderTime).getTime()
    ) {
      notifyReminder(tonight.shutdownTime);
      next = next.map((c) =>
        c.id === tonight.id ? { ...c, reminderFiredAt: now.toISOString() } : c
      );
    }
    const changed =
      next.length !== data.commitments.length ||
      next.some((c, i) => c !== data.commitments[i]);
    if (changed) setCommitments(next);
  }, [hydrated, resolvedCommitments, tonight, now, data.commitments]);

  const phase: NightPhase = useMemo(() => {
    if (!tonight) return "no-commitment";
    if (tonight.status === "kept") return "kept";
    if (tonight.status === "broken") return "broken";
    if (now.getTime() >= dateAtTime(tonight.date, tonight.reminderTime).getTime()) {
      return "warning";
    }
    return "locked";
  }, [tonight, now]);

  const commitTonight = useCallback(
    async (shutdownTime: string) => {
      const permission = await requestNotificationPermission();
      const dateKey = todayKey(getClockSnapshot());
      const commitment: Commitment = {
        id: makeId(),
        date: dateKey,
        shutdownTime,
        reminderTime: reminderTimeFor(shutdownTime),
        status: "committed",
        committedAt: new Date().toISOString(),
      };
      setProfile({
        ...getDataSnapshot().profile,
        onboarded: true,
        defaultShutdownTime: shutdownTime,
        notificationSetting: permission === "granted" ? "on" : "off",
      });
      setCommitment(commitment);
    },
    []
  );

  const confirmShutdown = useCallback(() => {
    if (!tonight) return;
    setCommitment({
      ...tonight,
      status: "kept",
      completedAt: new Date().toISOString(),
    });
  }, [tonight]);

  const history = useMemo(
    () =>
      resolvedCommitments
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [resolvedCommitments]
  );

  return {
    hydrated,
    profile: data.profile,
    tonight,
    phase,
    streak,
    longestStreak,
    keptPercentage,
    history,
    now,
    commitTonight,
    confirmShutdown,
  };
}
