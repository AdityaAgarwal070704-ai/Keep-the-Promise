import Link from "next/link";

interface HeaderProps {
  streak: number;
}

export function Header({ streak }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="font-serif italic text-lg text-foreground">
        Keep the Promise
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {streak > 0 && (
          <span className="text-accent-strong" aria-label={`${streak} night streak`}>
            🔥 {streak}
          </span>
        )}
        <Link href="/history" className="text-muted transition hover:text-foreground">
          History
        </Link>
      </nav>
    </header>
  );
}
