"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { formatTime12h } from "@/lib/date";
import { isNotificationSupported, requestNotificationPermission } from "@/lib/notifications";
import {
  getPermissionServerSnapshot,
  getPermissionSnapshot,
  refreshPermission,
  subscribePermission,
} from "@/lib/notificationPermissionStore";
import { getDataSnapshot, resetAllData, setProfile } from "@/lib/dataStore";
import { isPushConfigured, sendSubscriptionToServer, subscribeToPush } from "@/lib/push";
import { usePromiseState } from "@/lib/usePromiseState";

export default function SettingsPage() {
  const state = usePromiseState();
  const router = useRouter();
  const permission = useSyncExternalStore(
    subscribePermission,
    getPermissionSnapshot,
    getPermissionServerSnapshot
  );
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  if (!state.hydrated) {
    return <div className="flex-1" />;
  }

  const notificationsOn = state.profile.notificationSetting === "on" && permission === "granted";

  async function enableNotifications() {
    const result = await requestNotificationPermission();
    refreshPermission();
    setProfile({
      ...getDataSnapshot().profile,
      notificationSetting: result === "granted" ? "on" : "off",
    });
  }

  function disableNotifications() {
    setProfile({ ...getDataSnapshot().profile, notificationSetting: "off" });
  }

  function handleResetData() {
    if (
      window.confirm(
        "Reset all local data? This deletes your commitments, habits, and history from this device."
      )
    ) {
      resetAllData();
      router.push("/");
    }
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-6 px-2 font-serif italic text-2xl text-foreground">Settings</h1>

      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border">
        <SettingRow label="Nightly shutdown">
          <input
            type="time"
            value={state.profile.defaultShutdownTime}
            onChange={(e) =>
              setProfile({ ...getDataSnapshot().profile, defaultShutdownTime: e.target.value })
            }
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground [color-scheme:dark]"
            aria-label="Default nightly shutdown time"
          />
        </SettingRow>
        <p className="px-4 pb-4 -mt-2 text-xs text-muted">
          Applies to future nights. Tonight&apos;s promise, if already locked, stays as
          committed —{" "}
          {formatTime12h(
            state.tonight?.shutdownTime ?? state.profile.defaultShutdownTime
          )}
          .
        </p>

        <SettingRow label="Timezone">
          <span className="text-sm text-muted">{state.profile.timezone}</span>
        </SettingRow>

        <SettingRow label="Notifications">
          {!isNotificationSupported() ? (
            <span className="text-sm text-muted">Not supported in this browser</span>
          ) : permission === "denied" ? (
            <span className="text-sm text-muted">Blocked in browser settings</span>
          ) : (
            <button
              type="button"
              onClick={notificationsOn ? disableNotifications : enableNotifications}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                notificationsOn
                  ? "bg-accent text-background"
                  : "border border-border text-muted hover:text-foreground"
              }`}
            >
              {notificationsOn ? "On" : "Off"}
            </button>
          )}
        </SettingRow>
        {permission === "denied" && (
          <p className="px-4 pb-4 -mt-2 text-xs text-muted">
            You previously blocked notifications for this site. The in-app reminder still
            works whenever you have the tab open — to re-enable browser notifications, allow
            them for this site in your browser&apos;s settings.
          </p>
        )}

        {isPushConfigured() && (
          <>
            <SettingRow label="Push notifications (experimental)">
              <button
                type="button"
                onClick={async () => {
                  setPushStatus("Requesting…");
                  const sub = await subscribeToPush();
                  refreshPermission();
                  if (!sub) {
                    setPushStatus("Not supported in this browser.");
                    return;
                  }
                  const result = await sendSubscriptionToServer(sub);
                  setPushStatus(result.message);
                }}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition hover:text-foreground"
              >
                Enable
              </button>
            </SettingRow>
            {pushStatus && <p className="px-4 pb-4 -mt-2 text-xs text-muted">{pushStatus}</p>}
          </>
        )}

        <SettingRow label="Accountability">
          <span className="text-sm text-muted">Coming soon</span>
        </SettingRow>

        <SettingRow label="Privacy">
          <span className="text-sm text-muted">Your data stays on this device.</span>
        </SettingRow>

        <div className="p-4">
          <button
            type="button"
            onClick={handleResetData}
            className="text-sm text-danger transition hover:opacity-80"
          >
            Reset local data
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}
