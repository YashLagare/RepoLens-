"use client";

import { ActionAlert } from "@/components/ui/action-alert";
import { Button } from "@/components/ui/button";
import {
  generateReportAction,
  retryFullAnalysis,
  type RetryState,
} from "@/lib/actions/analysis";
import { RefreshCw, RotateCw } from "lucide-react";
import { useActionState, useState } from "react";

const initialState: RetryState = {};

export function GenerateReportButton({
  projectId,
  label = "Generate health report",
  variant = "default",
}: {
  projectId: string;
  label?: string;
  variant?: "default" | "outline";
}) {
  const [state, formAction, pending] = useActionState(
    generateReportAction,
    initialState,
  );
  const [dismissed, setDismissed] = useState(false);
  const showError = Boolean(state.error) && !dismissed;

  return (
    <form
      action={(formData) => {
        setDismissed(false);
        formAction(formData);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="projectId" value={projectId} />
      {showError && state.error ? (
        <ActionAlert
          title="Couldn't generate report"
          message={state.error}
          onDismiss={() => setDismissed(true)}
        />
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        variant={variant === "outline" ? "outline" : "default"}
        className={
          variant === "default"
            ? "bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90 inline-flex items-center gap-2"
            : "inline-flex items-center gap-2 border-[color:var(--app-line)] hover:bg-[color:var(--app-accent)]/10"
        }
      >
        <RotateCw className={`size-4 shrink-0 ${pending ? "animate-spin" : ""}`} />
        {pending
          ? label.toLowerCase().includes("regenerate")
            ? "Regenerating..."
            : "Generating..."
          : label}
      </Button>
    </form>
  );
}

export function RetryFullAnalysisButton({
  projectId,
  label = "Re-index repository",
}: {
  projectId: string;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(
    retryFullAnalysis,
    initialState,
  );
  const [dismissed, setDismissed] = useState(false);
  const showError = Boolean(state.error) && !dismissed;

  return (
    <form
      action={(formData) => {
        setDismissed(false);
        formAction(formData);
      }}
      className="space-y-3"
    >
      <input type="hidden" name="projectId" value={projectId} />
      {showError && state.error ? (
        <ActionAlert
          title="Couldn't restart analysis"
          message={state.error}
          onDismiss={() => setDismissed(true)}
        />
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        variant="outline"
        className="inline-flex items-center gap-2 border-[color:var(--app-line)] hover:bg-[color:var(--app-accent)]/10"
      >
        <RefreshCw className={`size-4 shrink-0 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Re-indexing..." : label}
      </Button>
    </form>
  );
}
