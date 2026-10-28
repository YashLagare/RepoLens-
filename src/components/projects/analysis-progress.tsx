"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { ANALYSIS_STEPS } from "@/lib/analysis/progress-steps";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AlertCircle } from "lucide-react";

type ProgressState = {
  id: string;
  name: string;
  status: "queued" | "processing" | "completed" | "failed";
  progressStep: string | null;
  progressPercent: number;
  errorMessage: string | null;
  framework: string | null;
  fileCount: number;
  report: { healthScore: number } | null;
  isStalled?: boolean;
};

export function AnalysisProgress({
  projectId,
  initial,
}: {
  projectId: string;
  initial: ProgressState;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const startedRef = useRef(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStalled, setIsStalled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/projects/${projectId}/status`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const text = await response.text();
        if (!text || cancelled) return;

        try {
          const data = JSON.parse(text) as ProgressState & { isStalled?: boolean };
          if (!cancelled && data && data.status) {
            setState(data);
            if (data.isStalled) {
              setIsStalled(true);
            } else if (data.status === "completed" || data.status === "failed") {
              setIsStalled(false);
            }
          }
        } catch {
          // Ignore transient non-JSON / HTML responses
        }
      } catch {
        // Ignore network hiccups; will retry on next poll
      }
    }

    const timer = window.setInterval(() => {
      void poll();
    }, 1500);

    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [projectId]);

  useEffect(() => {
    if (startedRef.current) return;
    if (state.status === "completed" || state.status === "failed") return;
    if (state.status === "processing" && state.progressPercent >= 30) return;

    startedRef.current = true;

    void (async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/analyze`, {
          method: "POST",
        });

        let data: {
          ok?: boolean;
          error?: string;
          status?: ProgressState["status"];
          progressStep?: string;
          progressPercent?: number;
        } | null = null;

        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            // Non-JSON or HTML response (e.g. Vercel 504 Gateway Timeout)
            if (!response.ok) {
              setStartError(
                "Execution took longer than serverless host limit. Your code progress is saved — click Resume below.",
              );
              setIsStalled(true);
              return;
            }
          }
        }

        if (data) {
          if (!response.ok && data.error) {
            setStartError(data.error);
            return;
          }
          if (data.status) {
            setState((current) => ({
              ...current,
              status: data.status ?? current.status,
              progressStep: data.progressStep ?? current.progressStep,
              progressPercent: data.progressPercent ?? current.progressPercent,
            }));
          }
        } else if (!response.ok) {
          setStartError(
            "Execution paused by serverless timeout. Click Resume below to continue.",
          );
          setIsStalled(true);
        }
      } catch {
        // Network error / connection drop
        setIsStalled(true);
      }
    })();
  }, [projectId, state.progressPercent, state.status]);

  useEffect(() => {
    if (state.status === "completed") {
      const timer = window.setTimeout(() => {
        router.push(`/projects/${projectId}/report`);
      }, 1200);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, projectId, router]);

  async function retry(force = false) {
    setStartError(null);
    setIsStalled(false);
    startedRef.current = true;
    setState((current) => ({
      ...current,
      status: "processing",
      progressStep: "Resuming analysis...",
      progressPercent: Math.max(current.progressPercent, 30),
      errorMessage: null,
    }));

    try {
      const response = await fetch(
        `/api/projects/${projectId}/analyze${force ? "?force=true" : ""}`,
        { method: "POST" },
      );

      let data: {
        ok?: boolean;
        error?: string;
        status?: ProgressState["status"];
        progressStep?: string;
        progressPercent?: number;
      } | null = null;

      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          if (!response.ok) {
            setStartError(
              "Execution timed out. Click Resume again to continue to the next step.",
            );
            setIsStalled(true);
            return;
          }
        }
      }

      if (data) {
        if (!response.ok && data.error) {
          setStartError(data.error);
          return;
        }
        if (data.status) {
          setState((current) => ({
            ...current,
            status: data.status ?? current.status,
            progressStep: data.progressStep ?? current.progressStep,
            progressPercent: data.progressPercent ?? current.progressPercent,
          }));
        }
      }
    } catch {
      setIsStalled(true);
    }
  }

  return (
    <div className="space-y-5">
      <div className="app-panel p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="app-kicker">Current step</p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              {state.progressStep ?? "Waiting to start..."}
            </p>
          </div>
          <p className="app-title text-4xl tabular-nums text-[color:var(--app-accent-deep)]">
            {state.progressPercent}%
          </p>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-[color:var(--app-line)]/60">
          <div
            className="app-progress-fill h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, state.progressPercent)}%` }}
          />
        </div>

        <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ANALYSIS_STEPS.filter((step) => step.id !== "done").map((step) => {
            const complete =
              state.status === "completed" ||
              state.progressPercent >= step.percent;
            const active =
              !complete &&
              state.status !== "failed" &&
              state.progressPercent >= step.percent - 20 &&
              state.progressPercent < step.percent;

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors",
                  complete &&
                    "border-[color:var(--app-line)] bg-[color:var(--app-accent)]/[0.04]",
                  active &&
                    "border-[color:var(--app-accent)] bg-[color:var(--app-accent)]/[0.08]",
                  !complete &&
                    !active &&
                    "border-[color:var(--app-line)]/50 bg-[color:var(--app-surface)]/30 opacity-70",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    complete &&
                      "border-[color:var(--app-accent)] bg-[color:var(--app-accent)] text-white shadow-xs",
                    active &&
                      "border-[color:var(--app-accent)] text-[color:var(--app-accent-deep)] ring-2 ring-[color:var(--app-accent)]/20 animate-pulse",
                    !complete &&
                      !active &&
                      "border-[color:var(--app-line)] text-[color:var(--app-muted)]",
                  )}
                >
                  {complete ? "✓" : active ? "…" : ""}
                </span>
                <span
                  className={cn(
                    "truncate",
                    complete || active
                      ? "font-medium text-foreground"
                      : "text-[color:var(--app-muted)]",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="app-panel grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-3 sm:divide-x sm:divide-[color:var(--app-line)]">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-[color:var(--app-muted)]">
            Framework
          </p>
          <p className="text-base font-semibold tracking-tight text-foreground">
            {state.framework ?? "Detecting..."}
          </p>
        </div>
        <div className="space-y-0.5 sm:ps-6">
          <p className="text-xs font-medium text-[color:var(--app-muted)]">
            Source files
          </p>
          <p className="text-base font-semibold tracking-tight text-foreground">
            {state.fileCount || "—"}
          </p>
        </div>
        <div className="space-y-0.5 sm:ps-6">
          <p className="text-xs font-medium text-[color:var(--app-muted)]">
            Health score
          </p>
          <p className="text-base font-semibold tracking-tight text-[color:var(--app-accent-deep)]">
            {state.report
              ? `${state.report.healthScore}/100`
              : "Calculating..."}
          </p>
        </div>
      </div>

      {state.status === "failed" || startError || isStalled ? (
        <div className="app-panel space-y-3 border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isStalled || startError?.includes("timed out") || startError?.includes("limit")
                  ? "Execution paused by cloud timeout"
                  : (startError ?? state.errorMessage ?? "Analysis paused.")}
              </p>
              <p className="mt-1 text-xs text-[color:var(--app-muted)]">
                {isStalled || startError?.includes("timed out") || startError?.includes("limit")
                  ? "Serverless containers have strict execution limits. Your code chunks and progress are safely preserved in the database. Click Resume to continue without restarting from scratch."
                  : "An unexpected issue interrupted analysis. Click Retry to continue."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              onClick={() => void retry(true)}
              className="bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
            >
              {state.progressPercent >= 45 ? "Resume analysis" : "Retry analysis"}
            </Button>
            <Link
              href={`/projects/${projectId}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Open overview
            </Link>
          </div>
        </div>
      ) : null}

      {state.status === "completed" ? (
        <div className="app-panel p-5 text-sm">
          Analysis complete. Redirecting to the health report...
          <div className="mt-3">
            <Link
              href={`/projects/${projectId}/report`}
              className={cn(
                buttonVariants(),
                "bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90",
              )}
            >
              View report now
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
