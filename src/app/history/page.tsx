"use client";

import { Header } from "@/components/Header";
import { HistoryTable } from "@/components/HistoryTable";
import { usePromiseState } from "@/lib/usePromiseState";

export default function HistoryPage() {
  const state = usePromiseState();

  if (!state.hydrated) {
    return <div className="flex-1" />;
  }

  return (
    <>
      <Header streak={state.streak} />
      <HistoryTable history={state.history} />
    </>
  );
}
