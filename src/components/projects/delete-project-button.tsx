"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";

export interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
  variant?: "icon" | "button";
  buttonVariant?: "ghost" | "destructive" | "outline";
  buttonSize?: "default" | "sm" | "xs" | "icon" | "icon-sm" | "icon-xs";
  className?: string;
  redirectOnDelete?: boolean;
}

export function DeleteProjectButton({
  projectId,
  projectName,
  variant = "icon",
  buttonVariant,
  buttonSize,
  className,
  redirectOnDelete = false,
}: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function handleTriggerClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  async function handleConfirmDelete(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    setPending(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        toast.error(data?.error ?? "Failed to delete project");
        setPending(false);
        return;
      }

      toast.success(`Deleted ${projectName}`);
      setOpen(false);
      setPending(false);

      if (redirectOnDelete) {
        router.push("/dashboard");
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete project",
      );
      setPending(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant={buttonVariant ?? "ghost"}
          size={buttonSize ?? "icon-sm"}
          aria-label={`Delete ${projectName}`}
          title={`Delete ${projectName}`}
          disabled={pending}
          onClick={handleTriggerClick}
          className={cn(
            "text-[color:var(--app-muted)] transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:text-destructive",
            className,
          )}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant={buttonVariant ?? "outline"}
          size={buttonSize ?? "sm"}
          disabled={pending}
          onClick={handleTriggerClick}
          className={cn(
            "border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/10",
            className,
          )}
        >
          <Trash2 className="mr-1.5 size-3.5" />
          Delete project
        </Button>
      )}

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
        variant="destructive"
        loading={pending}
        title="Delete repository?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {projectName}
            </span>{" "}
            and its vector embeddings? All source files, parsed AST chunks, and
            generated health reports will be permanently removed. This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete repository"
        cancelLabel="Keep repository"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
