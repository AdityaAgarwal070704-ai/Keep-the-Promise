"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { usePromiseState } from "@/lib/usePromiseState";
import { HabitsIcon, HistoryIcon, HomeIcon, SettingsIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/habits", label: "Habits", Icon: HabitsIcon },
  { href: "/history", label: "History", Icon: HistoryIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { hydrated, profile, streak } = usePromiseState();

  const showChrome = hydrated && profile?.onboarded;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {showChrome && (
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <Link href="/" className="font-serif italic text-lg text-foreground">
            Keep the Promise
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-5 text-sm sm:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted transition hover:text-foreground"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {streak > 0 && (
              <span className="text-accent-strong" aria-label={`${streak} night streak`}>
                🔥 {streak}
              </span>
            )}
          </div>
        </header>
      )}

      <main className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</main>

      {showChrome && (
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-10 flex items-stretch border-t border-border bg-background sm:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition ${
                  active ? "text-accent-strong" : "text-muted"
                }`}
              >
                <item.Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
