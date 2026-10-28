import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  FolderCode,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export type ProjectNavTab =
  | "overview"
  | "report"
  | "issues"
  | "explorer"
  | "chat";

type ProjectNavProps = {
  projectId: string;
  activeTab: ProjectNavTab;
  reportReady?: boolean;
  chatReady?: boolean;
  className?: string;
};

export function ProjectNav({
  projectId,
  activeTab,
  reportReady = true,
  chatReady = true,
  className,
}: ProjectNavProps) {
  const tabs = [
    {
      id: "overview" as const,
      href: `/projects/${projectId}`,
      label: "Overview",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: "report" as const,
      href: `/projects/${projectId}/report`,
      label: "Health Report",
      icon: ShieldCheck,
      visible: reportReady,
    },
    {
      id: "issues" as const,
      href: `/projects/${projectId}/issues`,
      label: "Issues",
      icon: AlertTriangle,
      visible: reportReady,
    },
    {
      id: "explorer" as const,
      href: `/projects/${projectId}/explorer`,
      label: "Code Explorer",
      icon: FolderCode,
      visible: true,
    },
    {
      id: "chat" as const,
      href: `/projects/${projectId}/chat`,
      label: "AI Chat",
      icon: Sparkles,
      visible: chatReady,
    },
  ];

  return (
    <nav
      aria-label="Project views"
      className={cn("flex flex-wrap items-center gap-1.5 sm:gap-2", className)}
    >
      {tabs
        .filter((tab) => tab.visible)
        .map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[linear-gradient(135deg,#06b6d4_0%,#0e7490_100%)] text-white shadow-xs"
                  : "border border-[color:var(--app-line)] bg-[color:var(--app-surface)] text-[color:var(--app-muted)] hover:border-[color:var(--app-accent)]/40 hover:bg-[color:var(--app-accent)]/[0.06] hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 sm:size-4 shrink-0",
                  isActive ? "text-white" : "text-[color:var(--app-muted)]",
                )}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}
