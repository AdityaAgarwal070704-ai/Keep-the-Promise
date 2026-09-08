# Keep the Promise

> You said you'd stop. We help you keep your word.

A commitment-based habit tracker built around one hero behavior — disconnecting
from your devices at a time you chose, before sleep — with a lightweight
multi-habit tracker alongside it. Not a sleep tracker, not a screen-time app: a
private commitment tool.

**Core loop:** Set a time → Commit → Get reminded 5 minutes out → Confirm
you're shutting down → See your streak.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- No backend for the core product — see "Persistence" below
- No new runtime dependencies added (no `web-push`, no DB client) — see
  "Push notifications" for why

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Architecture

Everything lives under `src/lib/`:

- `types.ts` — `Profile`, `Commitment` (the nightly shutdown), `Habit` +
  `Checkin` (generic habits, one-tap check-in).
- `date.ts` — local-time and week/month helpers. Everything runs against the
  device's own clock, so there's no timezone conversion to get wrong: a
  `Date` built from local components is already correct for the user, DST
  included.
- `storage.ts` — pure `loadData`/`saveData`/`clearAllData` over
  `localStorage`, with a small migration from the previous schema version.
  This is the only file a real backend would need to reimplement.
- `dataStore.ts` / `clock.ts` / `notificationPermissionStore.ts` — external
  stores (read via `useSyncExternalStore`) that make persisted data, the
  ticking clock, and live `Notification.permission` safe to read during
  React's render without hydration mismatches or manual "mounted" flags.
- `streak.ts` — the nightly-shutdown streak: resolves an unconfirmed, overdue
  commitment to `broken`, and computes current streak / longest streak /
  kept-percentage from commitment history (no separate streak table).
- `habitStreak.ts` — frequency-aware streak engine for generic habits.
  Daily/weekdays habits walk backward day by day, skipping non-required days
  (weekends) without breaking the streak; `times_per_week` habits walk
  backward week by week (Monday-start), requiring N check-ins per elapsed
  week. In both cases the current, still-in-progress period never breaks the
  streak on its own — only a fully-elapsed required period with no check-in
  does. Verified against seeded data during development (see git history).
- `usePromiseState.ts` / `useHabits.ts` — the hooks every screen reads from.
- `notifications.ts` / `push.ts` — see below.

Routes: `/` (home dashboard), `/habits`, `/history`, `/settings`.

## Persistence: localStorage, by design

Commitments, habits, check-ins and preferences all live in the browser — no
account, no login, no server. That's a deliberate scope cut: it means zero
third-party accounts to provision and a working, deployable product today, at
the cost of being single-device.

`storage.ts` is the one file standing between this and a real backend. Adding
per-user cloud sync means reimplementing its two functions against a
database, adding auth so users only ever see their own data, and everything
in `dataStore.ts` upward is unaffected.

## Notifications: what's real vs. what needs configuration

**Working today:** the five-minute reminder shows as an in-app banner (the
"5 minutes to keep the promise" screen) and, where the browser grants
permission, a `Notification` while the tab is open (`notifications.ts`).
Settings honestly reflects permission state, including a denied/blocked
explanation, and never re-prompts after a denial (the browser itself refuses
to). This has no dependency on push infrastructure and works right now.

**What genuine background push (tab/app fully closed) requires, and why it
isn't wired up end-to-end:**

1. A service worker to receive and display push events — **built**,
   `public/sw.js`.
2. A client flow to request a real `PushSubscription` — **built**,
   `src/lib/push.ts`, gated behind `NEXT_PUBLIC_VAPID_PUBLIC_KEY` so it stays
   invisible/inactive until actually configured (it does not appear in
   Settings otherwise — see "Do not fake features" below).
3. Server-side storage of subscriptions, keyed per device — **not
   implemented**. This needs a real database; `src/app/api/push/subscribe/route.ts`
   exists and honestly returns HTTP 501 until `KV_REST_API_URL` /
   `KV_REST_API_TOKEN` (or an equivalent store) are configured.
4. A scheduler that, every minute or so, finds commitments due in 5 minutes
   across all subscribed devices and sends the push — **not implemented**.
   This is the hard part on Vercel: Hobby-plan Cron Jobs only run daily, not
   at per-user reminder times, so this needs either a Pro-plan Cron (minute
   granularity) or an external scheduler (e.g. a GitHub Actions cron, or
   cron-job.org) hitting a dispatch endpoint every minute. It also requires
   commitment data to exist server-side at all, which today it doesn't
   (commitments are local-only per point above) — so this is a bigger change
   than "add a cron job."

**To activate what's built:** generate a VAPID keypair (e.g.
`npx web-push generate-vapid-keys`), set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and
`VAPID_PRIVATE_KEY` in Vercel, provision a KV/Redis store and set
`KV_REST_API_URL`/`KV_REST_API_TOKEN`, then build out the subscription
storage and a `/api/push/dispatch` route + scheduler. None of this is faked
in the meantime — the "Push notifications" row in Settings simply doesn't
render until the public key exists, and the API route says plainly that it
isn't configured rather than pretending to succeed.

## Accountability: not implemented

The PRD's accountability-partner feature needs real multi-user
infrastructure (auth, server-stored commitments, an authorized invite/accept
flow, and row-level authorization so a partner sees only what's explicitly
shared) that doesn't exist in this local-only build. Rather than fake an
invite flow with no real security behind it, Settings shows "Coming soon" and
this is left undone. A future pass would need: an auth provider, a database,
an invite-token table, and server-side ownership checks on every read.

## Multiple habits

`/habits` lists the nightly shutdown (read-only summary, linking home — its
lock/reminder ceremony stays on the home screen) plus any generic habits you
add. Adding a habit is a single text input + Enter/Add. Each habit supports
one-tap check-in, inline rename, frequency (`daily` / `weekdays` /
`times_per_week`), and delete with a confirmation.

## Calendar / heatmap

`/history` shows current streak, longest streak, and kept-percentage, plus a
month calendar (kept/broken/no-commitment per day, click a date for detail,
future months disabled) for the nightly-shutdown commitment specifically —
scoped to that habit since it has the richest, most consistent daily
history; generic habits show their streak inline on `/habits` instead.

## Non-goals (see the PRD)

No AI coaching, no health/wearable integrations, no social feed/followers/
leaderboards, no payments, no XP/coins/badges. The product stays focused on
one thing: keeping a promise to yourself.
