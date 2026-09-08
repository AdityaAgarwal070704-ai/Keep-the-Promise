export type CommitmentStatus = "committed" | "kept" | "broken";

/** The nightly digital-shutdown commitment. Always exactly one per local date. */
export interface Commitment {
  id: string;
  /** Local calendar date this promise belongs to, YYYY-MM-DD. */
  date: string;
  /** 24h "HH:mm" in the device's local time. */
  shutdownTime: string;
  /** 24h "HH:mm", five minutes before shutdownTime. */
  reminderTime: string;
  status: CommitmentStatus;
  committedAt: string;
  completedAt?: string;
  /** Set once the in-app/browser reminder has fired, so it never fires twice. */
  reminderFiredAt?: string;
}

export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekdays" }
  | { type: "times_per_week"; count: number };

/** A generic, user-created habit (one-tap check-in). The nightly shutdown is
 * modeled separately via Commitment, since it has its own lock/reminder flow. */
export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  active: boolean;
  createdAt: string;
}

/** One completed day for a generic habit. */
export interface Checkin {
  id: string;
  habitId: string;
  /** Local calendar date, YYYY-MM-DD. */
  localDate: string;
  completedAt: string;
}

export type NotificationSetting = "on" | "off";

export interface Profile {
  onboarded: boolean;
  timezone: string;
  defaultShutdownTime: string;
  notificationSetting: NotificationSetting;
}

export interface AppData {
  profile: Profile;
  commitments: Commitment[];
  habits: Habit[];
  checkins: Checkin[];
}
