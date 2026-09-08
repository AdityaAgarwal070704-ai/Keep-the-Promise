export type CommitmentStatus = "committed" | "kept" | "broken";

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

export interface Profile {
  onboarded: boolean;
  timezone: string;
  defaultShutdownTime: string;
  notificationsEnabled: boolean;
}

export interface AppData {
  profile: Profile;
  commitments: Commitment[];
}
