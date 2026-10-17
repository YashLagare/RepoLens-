import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[color:var(--app-line)] bg-[color:var(--app-surface)] shadow-xs">
        <FileQuestion className="size-8 text-[color:var(--app-accent-deep)]" />
      </div>
      <h1 className="app-title mt-6 text-3xl font-bold sm:text-4xl">
        Page or Project Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-[color:var(--app-muted)]">
        The page or repository analysis you requested could not be found or you may not have access to it.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants(),
            "gap-2 bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white hover:opacity-90",
          )}
        >
          <Home className="size-4" />
          Back to Dashboard
        </Link>
        <Link
          href="/projects/new"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Analyze a Repository
        </Link>
      </div>
    </div>
  );
}
