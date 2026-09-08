interface LandingProps {
  onGetStarted: () => void;
}

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
      <button
        type="button"
        onClick={onGetStarted}
        className="w-full max-w-sm rounded-full bg-accent px-8 py-4 text-base font-medium text-background transition hover:bg-accent-strong active:scale-[0.98]"
      >
        Get Started
      </button>
    </div>
  );
}
