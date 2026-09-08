"use client";

import { Calendar } from "@/components/Calendar";
import { HistoryTable } from "@/components/HistoryTable";
import { usePromiseState } from "@/lib/usePromiseState";

export default function HistoryPage() {
  const state = usePromiseState();

  if (!state.hydrated) {
    return <div className="flex-1" />;
  }

  if (state.history.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <h1 className="font-serif italic text-3xl text-foreground">Your story starts tonight.</h1>
        <p className="text-sm text-muted">Keep tonight&apos;s promise to begin your history.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-6 px-2 font-serif italic text-2xl text-foreground">History</h1>

      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <Stat label="Current streak" value={state.streak} />
        <Stat label="Longest streak" value={state.longestStreak} />
        <Stat label="Promise kept" value={`${state.keptPercentage}%`} />
      </div>

      <div className="mb-6">
        <Calendar commitments={state.history} now={state.now} />
      </div>

      <HistoryTable history={state.history} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border px-3 py-4">
      <p className="text-2xl font-medium text-foreground">{value}</p>
      <p className="mt-1 text-[11px] tracking-wide text-muted uppercase">{label}</p>
    </div>
  );
}
