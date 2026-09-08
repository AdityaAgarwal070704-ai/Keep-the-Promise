"use client";

import { useState } from "react";
import { SetupTime } from "./SetupTime";
import { CommitmentScreen } from "./CommitmentScreen";
import { formatTime12h } from "@/lib/date";
import type { Commitment } from "@/lib/types";
import type { NightPhase } from "@/lib/usePromiseState";

interface DashboardProps {
  phase: NightPhase;
  tonight: Commitment | undefined;
  streak: number;
  defaultShutdownTime: string;
  now: Date;
  onCommitTonight: (shutdownTime: string) => Promise<void> | void;
  onConfirmShutdown: () => void;
}

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

export function Dashboard({
  phase,
  tonight,
  streak,
  defaultShutdownTime,
  now,
  onCommitTonight,
  onConfirmShutdown,
}: DashboardProps) {
  if (phase === "no-commitment") {
    return (
      <NoCommitmentFlow
        now={now}
        defaultShutdownTime={defaultShutdownTime}
        onCommitTonight={onCommitTonight}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      {phase === "locked" && tonight && (
        <>
          <p className="text-sm text-muted">{greeting(now)}</p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs tracking-[0.3em] text-muted uppercase">
              Tonight&apos;s promise
            </p>
            <h1 className="font-serif italic text-4xl text-foreground sm:text-5xl">
              {formatTime12h(tonight.shutdownTime)}
            </h1>
            <p className="text-base text-muted">Disconnect.</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-accent-strong">Promise locked</p>
            <p className="text-sm text-muted">
              Reminder at {formatTime12h(tonight.reminderTime)}.
            </p>
          </div>
          <StreakLine streak={streak} />
        </>
      )}

      {phase === "warning" && tonight && (
        <>
          <p className="text-2xl" aria-hidden>
            🌙
          </p>
          <h1
            className="font-serif italic text-3xl text-foreground sm:text-4xl"
            aria-live="assertive"
          >
            5 minutes to keep the promise.
          </h1>
          <p className="text-sm text-muted">
            You said you&apos;d disconnect at {formatTime12h(tonight.shutdownTime)}.
          </p>
          <button
            type="button"
            onClick={onConfirmShutdown}
            className="w-full max-w-sm rounded-full bg-accent px-8 py-4 text-base font-medium text-background transition hover:bg-accent-strong active:scale-[0.98]"
          >
            I&apos;m shutting down
          </button>
        </>
      )}

      {phase === "kept" && tonight && (
        <KeptView tonight={tonight} streak={streak} now={now} />
      )}

      {phase === "broken" && (
        <>
          <h1
            className="font-serif italic text-3xl text-foreground sm:text-4xl"
            aria-live="polite"
          >
            The promise wasn&apos;t kept tonight.
          </h1>
          <p className="text-sm text-muted">Tomorrow is another night.</p>
        </>
      )}
    </div>
  );
}

function StreakLine({ streak }: { streak: number }) {
  if (streak <= 0) return null;
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs tracking-[0.3em] text-muted uppercase">Current streak</p>
      <p className="text-lg text-accent-strong">
        🔥 {streak} {streak === 1 ? "night" : "nights"}
      </p>
    </div>
  );
}

function KeptView({
  tonight,
  streak,
  now,
}: {
  tonight: Commitment;
  streak: number;
  now: Date;
}) {
  const justNow =
    tonight.completedAt &&
    now.getTime() - new Date(tonight.completedAt).getTime() < 10 * 60_000;

  return (
    <>
      <h1 className="font-serif italic text-3xl text-foreground sm:text-4xl" aria-live="polite">
        Promise kept.
      </h1>
      <p className="text-sm text-muted">You kept your word.</p>
      <p className="mt-2 text-lg text-accent-strong">
        🔥 {streak} {streak === 1 ? "night" : "nights"}
      </p>
      {justNow && <p className="text-sm text-muted">Good night.</p>}
    </>
  );
}

function NoCommitmentFlow({
  now,
  defaultShutdownTime,
  onCommitTonight,
}: {
  now: Date;
  defaultShutdownTime: string;
  onCommitTonight: (shutdownTime: string) => Promise<void> | void;
}) {
  const [step, setStep] = useState<"prompt" | "time" | "commit">("prompt");
  const [pendingTime, setPendingTime] = useState(defaultShutdownTime);

  if (step === "time") {
    return (
      <SetupTime
        value={pendingTime}
        onChange={setPendingTime}
        onContinue={() => setStep("commit")}
      />
    );
  }

  if (step === "commit") {
    return (
      <CommitmentScreen
        shutdownTime={pendingTime}
        onCommit={() => onCommitTonight(pendingTime)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <p className="text-sm text-muted">{greeting(now)}</p>
      <h1 className="font-serif italic text-3xl text-foreground sm:text-4xl">
        Tonight is still yours.
      </h1>
      <button
        type="button"
        onClick={() => setStep("time")}
        className="w-full max-w-sm rounded-full bg-accent px-8 py-4 text-base font-medium text-background transition hover:bg-accent-strong active:scale-[0.98]"
      >
        Set tonight&apos;s promise
      </button>
    </div>
  );
}
