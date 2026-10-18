"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, Loader2, Trash2 } from "lucide-react";
import * as React from "react";

export type ConfirmDialogVariant = "destructive" | "warning" | "default";

export interface ConfirmDialogProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Element that triggers the dialog (uncontrolled or convenience) */
  trigger?: React.ReactNode;
  /** Main heading */
  title: React.ReactNode;
  /** Description or explanatory warning body */
  description: React.ReactNode;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Visual variant affecting badge colors and confirm button variant */
  variant?: ConfirmDialogVariant;
  /** Custom icon override in header badge */
  icon?: React.ReactNode;
  /** Indicates an async action is in flight */
  loading?: boolean;
  /** Callback triggered when confirm button is clicked */
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  /** Optional custom content rendered below the description */
  children?: React.ReactNode;
  /** Custom width / class for dialog content */
  contentClassName?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  icon,
  loading = false,
  onConfirm,
  children,
  contentClassName,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  function handleOpenChange(next: boolean) {
    if (loading) return; // Prevent closing while action is in flight
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }

  // Choose badge style and icon according to variant
  const badgeConfig = React.useMemo(() => {
    switch (variant) {
      case "destructive":
        return {
          wrapperClass:
            "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ring-1 ring-rose-500/25",
          defaultIcon: <Trash2 className="size-4.5" aria-hidden />,
          confirmVariant: "destructive" as const,
        };
      case "warning":
        return {
          wrapperClass:
            "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/25",
          defaultIcon: <AlertTriangle className="size-4.5" aria-hidden />,
          confirmVariant: "default" as const,
        };
      default:
        return {
          wrapperClass:
            "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 ring-1 ring-cyan-500/25",
          defaultIcon: <Info className="size-4.5" aria-hidden />,
          confirmVariant: "default" as const,
        };
    }
  }, [variant]);

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger render={trigger as React.ReactElement} /> : null}

      <DialogContent
        showCloseButton={!loading}
        className={cn(
          "sm:max-w-md p-6 gap-5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl",
          contentClassName,
        )}
      >
        <DialogHeader className="gap-3.5 text-left">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                badgeConfig.wrapperClass,
              )}
            >
              {icon ?? badgeConfig.defaultIcon}
            </span>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </DialogTitle>
          </div>

          <DialogDescription className="text-sm leading-relaxed text-muted-foreground pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        {children ? <div className="py-1">{children}</div> : null}

        <DialogFooter className="gap-2 pt-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={badgeConfig.confirmVariant}
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "w-full sm:w-auto font-medium transition-opacity",
              variant === "destructive" &&
                "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700",
              variant === "default" &&
                "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
