"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 shadow-xs">
        <AlertTriangle className="size-8 text-rose-500" />
      </div>
      <h1 className="app-title mt-6 text-3xl font-bold sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-[color:var(--app-muted)]">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      {error.digest ? (
        <p className="mt-1 font-mono text-xs text-[color:var(--app-muted)]/70">
          Error digest: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="gap-2 bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90"
        >
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <Home className="size-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
