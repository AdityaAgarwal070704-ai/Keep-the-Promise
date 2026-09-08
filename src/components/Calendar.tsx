"use client";

import { useState } from "react";
import {
  addMonths,
  daysInMonth,
  formatMonthLabel,
  formatTime12h,
  isoWeekday,
  monthKey,
  todayKey,
} from "@/lib/date";
import type { Commitment } from "@/lib/types";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface CalendarProps {
  commitments: Commitment[];
  now: Date;
}

export function Calendar({ commitments, now }: CalendarProps) {
  const currentMonth = monthKey(todayKey(now));
  const [month, setMonth] = useState(currentMonth);
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = new Map<string, Commitment>();
  for (const c of commitments) byDate.set(c.date, c);

  const today = todayKey(now);
  const dates = daysInMonth(month);
  const leadingBlanks = isoWeekday(dates[0]);

  const resolvedThisMonth = dates
    .map((d) => byDate.get(d))
    .filter((c): c is Commitment => Boolean(c) && c!.status !== "committed");
  const monthStats = {
    kept: resolvedThisMonth.filter((c) => c.status === "kept").length,
    total: resolvedThisMonth.length,
  };

  const selectedCommitment = selected ? byDate.get(selected) : undefined;

  return (
    <div className="rounded-2xl border border-border p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-raised hover:text-foreground"
        >
          ‹
        </button>
        <p className="text-sm font-medium text-foreground">{formatMonthLabel(month)}</p>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
          disabled={month >= currentMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-raised hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
        >
          ›
        </button>
      </div>

      {monthStats.total > 0 && (
        <p className="mb-3 text-center text-xs text-muted">
          {monthStats.kept} / {monthStats.total} promises kept ·{" "}
          {Math.round((monthStats.kept / monthStats.total) * 100)}% consistency
        </p>
      )}

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="pb-1 text-[11px] text-muted">
            {d}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {dates.map((date) => {
          const c = byDate.get(date);
          const isFuture = date > today;
          const isToday = date === today;
          const day = Number(date.slice(-2));

          let dot = "bg-transparent border border-border/60";
          if (c?.status === "kept") dot = "bg-accent";
          else if (c?.status === "broken") dot = "bg-danger/70";
          else if (isToday && c?.status === "committed") dot = "border-2 border-accent";

          return (
            <button
              key={date}
              type="button"
              disabled={isFuture}
              onClick={() => setSelected(date === selected ? null : date)}
              aria-pressed={selected === date}
              aria-label={`${date}${c ? `, ${c.status}` : ", no commitment"}`}
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-xs transition ${
                isFuture ? "text-muted/30" : "text-muted hover:bg-surface-raised"
              } ${selected === date ? "bg-surface-raised" : ""}`}
            >
              <span className={isToday ? "font-semibold text-foreground" : ""}>{day}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${isFuture ? "" : dot}`} />
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 border-t border-border pt-3 text-center text-sm">
          {selectedCommitment ? (
            <p className="text-foreground">
              {formatTime12h(selectedCommitment.shutdownTime)} ·{" "}
              <span
                className={
                  selectedCommitment.status === "kept" ? "text-accent-strong" : "text-danger"
                }
              >
                {selectedCommitment.status === "kept" ? "Kept" : "Broken"}
              </span>
            </p>
          ) : (
            <p className="text-muted">No commitment that night.</p>
          )}
        </div>
      )}
    </div>
  );
}
