import { getTimezoneLabel } from "@/lib/date";

interface SetupTimeProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  title?: string;
}

export function SetupTime({ value, onChange, onContinue, title }: SetupTimeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <h1 className="font-serif italic text-3xl text-foreground sm:text-4xl">
          {title ?? "When does your night end?"}
        </h1>
        <p className="text-sm text-muted">
          Detected timezone: {getTimezoneLabel()}
        </p>
      </div>

      <label className="flex flex-col items-center gap-2">
        <span className="sr-only">Shutdown time</span>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-2xl border border-border bg-surface px-8 py-5 text-center text-4xl tabular-nums text-foreground [color-scheme:dark] focus-visible:outline-2 focus-visible:outline-focus"
          aria-label="Nightly shutdown time"
        />
      </label>

      <button
        type="button"
        onClick={onContinue}
        className="w-full max-w-sm rounded-full bg-accent px-8 py-4 text-base font-medium text-background transition hover:bg-accent-strong active:scale-[0.98]"
      >
        Continue
      </button>
    </div>
  );
}
