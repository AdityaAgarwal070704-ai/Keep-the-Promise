# Keep the Promise

> You said you'd stop. We help you keep your word.

A focused habit tracker for one thing: disconnecting from your devices at a
time you chose, before sleep. Not a sleep tracker, not a screen-time app —
a private commitment tool built around a single nightly loop:

**Set a time → Commit → Get reminded 5 minutes out → Confirm you're
shutting down → See your streak.**

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- No backend — see "Persistence" below

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Architecture

All logic lives under `src/lib/`:

- `types.ts` — the `Profile` / `Commitment` data model.
- `date.ts` — local-time helpers. Everything runs against the device's own
  clock, so there's no timezone conversion to get wrong: a `Date` built from
  local components is already correct for the user, DST included.
- `storage.ts` — pure `loadData`/`saveData` over `localStorage`. This is the
  only file a real backend would need to reimplement.
- `dataStore.ts` / `clock.ts` — small external stores (read via
  `useSyncExternalStore`) that make the persisted data and the ticking clock
  safe to read during React's render without hydration mismatches or
  manual "mounted" flags.
- `streak.ts` — resolves an unconfirmed, overdue commitment to `broken`, and
  computes the current streak from commitment history (no separate streak
  table).
- `notifications.ts` — see below.
- `usePromiseState.ts` — the one hook every screen reads from; derives the
  night's phase (`no-commitment` / `locked` / `warning` / `kept` / `broken`)
  from the data + clock stores.

## Persistence: localStorage, by design

This MVP keeps everything in the browser (`localStorage`) — there's no
account, no login, no server. That's a deliberate scope cut, not an
oversight: it means zero third-party accounts to set up and a working,
deployable product today, at the cost of being single-device (a promise
made on your phone doesn't show up on your laptop).

`storage.ts` is the one file standing between this and a real backend. If
per-user cloud sync is needed later, that file's two functions
(`loadData`/`saveData`) get reimplemented against a database, everything in
`dataStore.ts` upward is unaffected, and an auth layer gates access so users
only ever see their own commitments.

## Notifications: an honest limitation

The five-minute reminder uses the browser `Notification` API, requested
contextually when you first commit. This **only fires while the tab is open
in that browser** — there is no way for a plain website to wake a fully
closed browser or phone, on any platform. We don't pretend otherwise:

- The in-app banner (the "5 minutes to keep the promise" screen) is the
  reliable fallback and always renders regardless of notification support
  or permission.
- `notifications.ts` isolates the browser Notification calls behind a small
  API (`notifyReminder`, `requestNotificationPermission`). A future native
  or web-push implementation slots in behind that same API without touching
  the rest of the app:

  ```
  Commitment → Scheduled Reminder → Notification Service → Web Push / Native Push
  ```

## Non-goals (see the PDR)

No auth, no multiple habits, no gamification beyond the streak count, no
AI coaching, no health integrations. The product is deliberately small:
prove whether people will make and keep one nightly promise.
