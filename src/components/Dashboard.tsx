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
        defaultShutdownTime={defaultShutdownTime}
        onCommitTonight={onCommitTonight}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      {phase === "locked" && tonight && (
        <>
          <p className="text-xs tracking-[0.3em] text-muted uppercase">
            Promise locked
          </p>
          <h1 className="font-serif italic text-3xl text-foreground sm:text-4xl">
            Tonight · {formatTime12h(tonight.shutdownTime)}
          </h1>
          <p className="text-sm text-muted">
            We&apos;ll remind you at {formatTime12h(tonight.reminderTime)}.
          </p>
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
          <p className="text-sm text-muted">
            Streak resets. Tomorrow is another night.
          </p>
        </>
      )}
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
        {justNow ? "That's the promise." : "Promise kept."}
      </h1>
      <p className="text-sm text-muted">
        {justNow ? "See you tomorrow." : "You kept your word tonight."}
      </p>
      <p className="mt-2 text-lg text-accent-strong">
        🔥 {streak} {streak === 1 ? "night" : "nights"}
      </p>
    </>
  );
}

function NoCommitmentFlow({
  defaultShutdownTime,
  onCommitTonight,
}: {
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
      <h1 className="font-serif italic text-3xl text-foreground sm:text-4xl">
        Make tonight&apos;s promise
      </h1>
      <p className="max-w-xs text-sm text-muted">
        Choose the time you&apos;ll disconnect tonight.
      </p>
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
