import type { Severity } from "./types";

/**
 * SPEC §2.2: Low < 40, Medium 40–70, High > 70
 */
export function getSeverity(riskScore: number): Severity {
  if (riskScore < 40) return "low";
  if (riskScore <= 70) return "medium";
  return "high";
}

export const SEVERITY_LABELS: Record<
  Severity,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "bg-green-100 text-green-800",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-800",
  },
  high: {
    label: "High",
    className: "bg-red-100 text-red-800",
  },
};
