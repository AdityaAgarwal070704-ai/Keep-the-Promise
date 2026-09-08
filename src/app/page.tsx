"use client";

import { useState } from "react";
import { Landing } from "@/components/Landing";
import { SetupTime } from "@/components/SetupTime";
import { CommitmentScreen } from "@/components/CommitmentScreen";
import { Dashboard } from "@/components/Dashboard";
import { usePromiseState } from "@/lib/usePromiseState";

type OnboardingStep = "landing" | "time" | "commit";

export default function Home() {
  const state = usePromiseState();
  const [step, setStep] = useState<OnboardingStep>("landing");
  const [pendingTime, setPendingTime] = useState("23:00");

  if (!state.hydrated) {
    return <div className="flex-1" />;
  }

  if (!state.profile.onboarded) {
    if (step === "landing") {
      return <Landing onGetStarted={() => setStep("time")} />;
    }
    if (step === "time") {
      return (
        <SetupTime
          value={pendingTime}
          onChange={setPendingTime}
          onContinue={() => setStep("commit")}
        />
      );
    }
    return (
      <CommitmentScreen
        shutdownTime={pendingTime}
        onCommit={() => state.commitTonight(pendingTime)}
      />
    );
  }

  return (
    <Dashboard
      phase={state.phase}
      tonight={state.tonight}
      streak={state.streak}
      defaultShutdownTime={state.profile.defaultShutdownTime}
      now={state.now}
      onCommitTonight={state.commitTonight}
      onConfirmShutdown={state.confirmShutdown}
    />
  );
}
