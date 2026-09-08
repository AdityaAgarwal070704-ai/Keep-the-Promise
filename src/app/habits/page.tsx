"use client";

import { useState } from "react";
import Link from "next/link";
import { HabitRow } from "@/components/HabitRow";
import { formatTime12h } from "@/lib/date";
import { useHabits } from "@/lib/useHabits";
import { usePromiseState } from "@/lib/usePromiseState";

export default function HabitsPage() {
  const promise = usePromiseState();
  const habits = useHabits();
  const [newHabit, setNewHabit] = useState("");

  if (!promise.hydrated || !habits.hydrated) {
    return <div className="flex-1" />;
  }

  function submitNewHabit() {
    if (!newHabit.trim()) return;
    habits.createHabit(newHabit);
    setNewHabit("");
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-6 px-2 font-serif italic text-2xl text-foreground">My Habits</h1>

      <Link
        href="/"
        className="mb-4 flex items-center justify-between rounded-2xl border border-accent/40 bg-surface px-4 py-4 transition hover:border-accent/70"
      >
        <div>
          <p className="text-foreground">Nightly Shutdown</p>
          <p className="text-xs text-muted">
            Disconnect by {formatTime12h(promise.profile.defaultShutdownTime)} · Daily
          </p>
        </div>
        {promise.streak > 0 && (
          <span className="text-accent-strong">
            🔥 {promise.streak} {promise.streak === 1 ? "night" : "nights"}
          </span>
        )}
      </Link>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitNewHabit();
        }}
        className="mb-6 flex gap-2"
      >
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="What do you want to keep doing?"
          aria-label="New habit name"
          className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-medium text-background transition hover:bg-accent-strong"
        >
          Add
        </button>
      </form>

      {habits.habits.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-foreground">Nothing here yet.</p>
          <p className="text-sm text-muted">Start with one small promise.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.habits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              onToggleToday={() => habits.toggleToday(h.id)}
              onRename={(name) => habits.renameHabit(h.id, name)}
              onSetFrequency={(f) => habits.setFrequency(h.id, f)}
              onDelete={() => habits.removeHabit(h.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
