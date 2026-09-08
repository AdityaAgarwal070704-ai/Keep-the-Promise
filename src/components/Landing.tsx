interface LandingProps {
  onGetStarted: () => void;
}

const STEPS = [
  { label: "Step 1", text: "Choose your time." },
  { label: "Step 2", text: "Make the promise." },
  { label: "Step 3", text: "Get the five-minute warning." },
  { label: "Step 4", text: "Keep your word." },
];

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between px-6 py-16 text-center">
      <div />
      <div className="flex max-w-sm flex-col items-center gap-6">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">
          Keep the Promise
        </p>
        <h1 className="font-serif italic text-4xl leading-tight text-foreground sm:text-5xl">
          Your night is yours.
        </h1>
        <p className="text-balance text-base leading-relaxed text-muted">
          Make one promise to tomorrow-you. Choose a time to disconnect, and
          keep your word.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-6">
        <ol className="grid grid-cols-2 gap-x-4 gap-y-3 text-left">
          {STEPS.map((step) => (
            <li key={step.label} className="text-xs text-muted">
              <span className="tracking-[0.2em] text-muted/70 uppercase">{step.label}</span>
              <p className="mt-0.5 text-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onGetStarted}
          className="w-full rounded-full bg-accent px-8 py-4 text-base font-medium text-background transition hover:bg-accent-strong active:scale-[0.98]"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
