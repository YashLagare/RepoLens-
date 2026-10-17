import type {
  IssueCategory,
  IssueSeverity,
  ReportIssue,
} from "@/lib/analysis/report-types";
import { SEVERITY_ORDER } from "@/lib/analysis/report-types";

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  architecture: "Architecture",
  security: "Security",
  performance: "Performance",
  codeQuality: "Code Quality",
  testing: "Testing",
};

export const SEVERITY_LABELS: Record<IssueSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as IssueCategory[];
export const ALL_SEVERITIES = Object.keys(SEVERITY_LABELS) as IssueSeverity[];

export function severityVariant(
  severity?: IssueSeverity | string,
): "destructive" | "secondary" | "outline" {
  if (severity === "critical" || severity === "high") return "destructive";
  if (severity === "medium") return "secondary";
  return "outline";
}

export function sortIssues(issues: ReportIssue[]): ReportIssue[] {
  if (!Array.isArray(issues)) return [];
  return [...issues].sort((a, b) => {
    const orderA = a?.severity && SEVERITY_ORDER[a.severity] !== undefined ? SEVERITY_ORDER[a.severity] : 99;
    const orderB = b?.severity && SEVERITY_ORDER[b.severity] !== undefined ? SEVERITY_ORDER[b.severity] : 99;
    const severityDiff = orderA - orderB;
    if (severityDiff !== 0) return severityDiff;
    const catA = String(a?.category ?? "");
    const catB = String(b?.category ?? "");
    return catA.localeCompare(catB);
  });
}

export function filterIssues(
  issues: ReportIssue[],
  options: {
    severity?: IssueSeverity | "all";
    category?: IssueCategory | "all";
  },
): ReportIssue[] {
  return sortIssues(issues).filter((issue) => {
    if (
      options.severity &&
      options.severity !== "all" &&
      issue.severity !== options.severity
    ) {
      return false;
    }
    if (
      options.category &&
      options.category !== "all" &&
      issue.category !== options.category
    ) {
      return false;
    }
    return true;
  });
}

export function countBySeverity(issues: ReportIssue[]) {
  return ALL_SEVERITIES.reduce(
    (acc, severity) => {
      acc[severity] = issues.filter(
        (issue) => issue.severity === severity,
      ).length;
      return acc;
    },
    {} as Record<IssueSeverity, number>,
  );
}
