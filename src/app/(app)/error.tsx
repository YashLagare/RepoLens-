"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error caught:", error);
  }, [error]);

  return (
    <main className="app-page">
      <div className="app-panel my-8 space-y-4 p-8 text-center sm:p-12">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10">
          <AlertTriangle className="size-7 text-rose-500" />
        </div>
        <h1 className="app-title text-2xl font-semibold sm:text-3xl">
          Unable to load this section
        </h1>
        <p className="mx-auto max-w-lg text-sm text-[color:var(--app-muted)]">
          {error.message || "A server-side error occurred while processing this request."}
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-[color:var(--app-muted)]/70">
            Reference code: {error.digest}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => reset()}
            className="gap-2 bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
          >
            <RefreshCw className="size-4" />
            Reload section
          </Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <Home className="size-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
