import { useState } from "react";
import { formatTime12h } from "@/lib/date";

interface CommitmentScreenProps {
  shutdownTime: string;
  onCommit: () => Promise<void> | void;
}

export function CommitmentScreen({ shutdownTime, onCommit }: CommitmentScreenProps) {
  const [committing, setCommitting] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">
          Tonight&apos;s promise
        </p>
        <h1 className="font-serif italic text-3xl leading-tight text-foreground sm:text-4xl">
          I will disconnect by {formatTime12h(shutdownTime)}.
        </h1>
        <p className="text-sm text-muted">No moving the goalpost tonight.</p>
      </div>

      <button
        type="button"
        disabled={committing}
        onClick={async () => {
          setCommitting(true);
          await onCommit();
        }}
        className="w-full max-w-sm rounded-full bg-accent px-8 py-4 text-base font-medium tracking-wide text-background transition hover:bg-accent-strong active:scale-[0.98] disabled:opacity-60"
      >
        {committing ? "Locking it in…" : "I COMMIT"}
      </button>
    </div>
  );
}
