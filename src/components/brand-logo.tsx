import { cn } from "@/lib/utils";
import { SearchCode } from "lucide-react";

type BrandIconProps = {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "accent" | "white" | "landing";
};

/**
 * Reusable icon mark for RepoLens combining an inspection lens with code syntax glyphs.
 */
export function BrandIcon({
  size = "md",
  variant = "accent",
  className,
  iconClassName,
}: BrandIconProps) {
  const sizeMap = {
    sm: "size-6 rounded-md",
    md: "size-7 rounded-lg",
    lg: "size-8 rounded-xl",
  };

  const iconSizeMap = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-4.5",
  };

  const variantStyles = {
    accent:
      "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xs shadow-cyan-500/25 border border-cyan-400/30",
    landing:
      "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xs shadow-cyan-500/25 border border-cyan-400/20",
    white:
      "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-xs shadow-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-transform",
        sizeMap[size],
        variantStyles[variant],
        className,
      )}
      aria-hidden
    >
      <SearchCode
        className={cn(iconSizeMap[size], "stroke-[2.2]", iconClassName)}
      />
    </span>
  );
}
