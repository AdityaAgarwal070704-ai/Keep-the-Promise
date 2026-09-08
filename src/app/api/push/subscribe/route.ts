import { NextResponse } from "next/server";

/**
 * Accepts a browser PushSubscription. Storing it (and later matching it
 * against due commitments from a scheduler) requires a real database — see
 * README.md "Push notifications". Until KV_REST_API_URL / KV_REST_API_TOKEN
 * (or an equivalent store) is configured, this deliberately reports that it
 * isn't wired up yet rather than pretending to persist anything.
 */
export async function POST(request: Request) {
  const hasStorage = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

  if (!hasStorage) {
    return NextResponse.json(
      {
        message:
          "Push notifications aren't fully configured on this deployment yet — the in-app reminder still works while the app is open.",
      },
      { status: 501 }
    );
  }

  // Reached only once KV_REST_API_URL / KV_REST_API_TOKEN are set. Persisting
  // and later dispatching the subscription still needs a scheduler (e.g. a
  // Vercel Cron hitting a /api/push/dispatch route) — see README.md.
  const subscription = await request.json().catch(() => null);
  if (!subscription?.endpoint) {
    return NextResponse.json({ message: "Invalid subscription." }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Storage is configured, but dispatch scheduling is not implemented yet." },
    { status: 501 }
  );
}
