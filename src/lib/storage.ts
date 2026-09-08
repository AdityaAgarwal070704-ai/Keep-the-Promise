import { AppData } from "./types";
import { getTimezoneLabel } from "./date";

const STORAGE_KEY = "ktp:v1";

function defaultData(): AppData {
  return {
    profile: {
      onboarded: false,
      timezone: getTimezoneLabel(),
      defaultShutdownTime: "23:00",
      notificationsEnabled: false,
    },
    commitments: [],
  };
}

/**
 * Pure read/write of the persisted app data. `dataStore.ts` layers caching
 * and change notification on top of these two functions; swapping in a real
 * backend later means reimplementing just this file.
 */
export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as AppData;
    return {
      profile: { ...defaultData().profile, ...parsed.profile },
      commitments: Array.isArray(parsed.commitments) ? parsed.commitments : [],
    };
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
