import type { Vendor } from "./types";

/**
 * Parse SLA string to duration in days.
 * e.g. "30 days" -> 30, "90 days" -> 90, "Annual" -> 365
 */
export function parseSlaToDays(sla: string): number {
  const normalized = sla.trim().toLowerCase();
  if (normalized === "annual") return 365;
  const match = normalized.match(/^(\d+)\s*days?$/);
  if (match) return parseInt(match[1], 10);
  const numOnly = normalized.match(/^(\d+)/);
  if (numOnly) return parseInt(numOnly[1], 10);
  return 365; // default
}

/**
 * Next review due = lastReviewDate + SLA duration.
 * Overdue if that date is before today.
 */
export function isOverdue(lastReviewDate: string, sla: string): boolean {
  const date = new Date(lastReviewDate);
  if (isNaN(date.getTime())) return false;
  const days = parseSlaToDays(sla);
  const due = new Date(date);
  due.setDate(due.getDate() + days);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * SPEC §4.2: Critical if any of:
 * - Overdue SLA
 * - Status = escalated
 * - Severity = high AND (pending_review OR in_review)
 */
export function isCritical(vendor: Vendor): boolean {
  if (vendor.status === "escalated") return true;
  if (vendor.severity === "high" && (vendor.status === "pending_review" || vendor.status === "in_review"))
    return true;
  return isOverdue(vendor.lastReviewDate, vendor.sla);
}
