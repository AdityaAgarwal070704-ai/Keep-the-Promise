import { AppData } from "./types";
import { getTimezoneLabel } from "./date";

const STORAGE_KEY = "ktp:v2";
const LEGACY_STORAGE_KEY = "ktp:v1";

function defaultData(): AppData {
  return {
    profile: {
      onboarded: false,
      timezone: getTimezoneLabel(),
      defaultShutdownTime: "23:00",
      notificationSetting: "off",
    },
    commitments: [],
    habits: [],
    checkins: [],
  };
}

function migrateProfile(
  rawProfile: Record<string, unknown> | undefined,
  base: AppData["profile"]
): AppData["profile"] {
  if (!rawProfile) return base;
  const notificationSetting =
    rawProfile.notificationSetting === "on" || rawProfile.notificationSetting === "off"
      ? rawProfile.notificationSetting
      : rawProfile.notificationsEnabled
        ? "on"
        : "off";
  return { ...base, ...rawProfile, notificationSetting };
}

/**
 * Pure read/write of the persisted app data. `dataStore.ts` layers caching
 * and change notification on top of these two functions; swapping in a real
 * backend later means reimplementing just this file.
 */
export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    const base = defaultData();
    return {
      profile: migrateProfile(parsed.profile, base.profile),
      commitments: Array.isArray(parsed.commitments) ? parsed.commitments : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      checkins: Array.isArray(parsed.checkins) ? parsed.checkins : [],
    };
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}
