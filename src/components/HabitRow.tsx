"use client";

import { useState } from "react";
import { frequencyLabel } from "@/lib/habitStreak";
import type { HabitFrequency } from "@/lib/types";
import type { HabitWithStreak } from "@/lib/useHabits";

interface HabitRowProps {
  habit: HabitWithStreak;
  onToggleToday: () => void;
  onRename: (name: string) => void;
  onSetFrequency: (frequency: HabitFrequency) => void;
  onDelete: () => void;
}

export function HabitRow({
  habit,
  onToggleToday,
  onRename,
  onSetFrequency,
  onDelete,
}: HabitRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [freqType, setFreqType] = useState(habit.frequency.type);
  const [freqCount, setFreqCount] = useState(
    habit.frequency.type === "times_per_week" ? habit.frequency.count : 3
  );

  const { streak } = habit;
  const checkLabel = habit.streak.doneToday ? "Mark not done" : "Mark done";

  function saveEdits() {
    onRename(name);
    if (freqType === "times_per_week") {
      onSetFrequency({ type: "times_per_week", count: freqCount });
    } else {
      onSetFrequency({ type: freqType });
    }
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleToday}
          aria-pressed={streak.doneToday}
          aria-label={`${checkLabel}: ${habit.name}`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
            streak.doneToday
              ? "border-accent bg-accent text-background"
              : "border-border text-transparent hover:border-muted"
          }`}
        >
          ✓
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-foreground">{habit.name}</p>
          <p className="text-xs text-muted">
            {frequencyLabel(habit)}
            {streak.current > 0 && (
              <span className="text-accent-strong">
                {" "}
                · 🔥 {streak.current} {streak.current === 1 ? "night" : "nights"}
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 px-2 py-1 text-xs text-muted transition hover:text-foreground"
        >
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {editing && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-muted">
            Frequency
            <select
              value={freqType}
              onChange={(e) => setFreqType(e.target.value as HabitFrequency["type"])}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="times_per_week">Times per week</option>
            </select>
          </label>

          {freqType === "times_per_week" && (
            <label className="flex flex-col gap-1 text-xs text-muted">
              Times per week
              <input
                type="number"
                min={1}
                max={7}
                value={freqCount}
                onChange={(e) => setFreqCount(Number(e.target.value))}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              />
            </label>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${habit.name}"? This removes its history too.`)) {
                  onDelete();
                }
              }}
              className="text-xs text-danger transition hover:opacity-80"
            >
              Delete habit
            </button>
            <button
              type="button"
              onClick={saveEdits}
              className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-background transition hover:bg-accent-strong"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
