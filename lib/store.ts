import { isCritical } from "./critical-tasks";
import { getSeverity } from "./severity";
import type { AuditLogEntry, Vendor } from "./types";

const ACTOR = "compliance-user";

function createSeedVendors(): Vendor[] {
  const raw = [
    {
      id: "1",
      vendorName: "Acme Cloud Inc",
      category: "Technology",
      subCategory: "Cloud Hosting",
      riskScore: 72,
      riskDetails: "Expired SOC2, no BCP documentation",
      lastReviewDate: "2024-06-15",
      sla: "90 days",
      status: "pending_review" as const,
    },
    {
      id: "2",
      vendorName: "Global Legal LLP",
      category: "Professional Services",
      subCategory: "Legal",
      riskScore: 28,
      riskDetails: "Minor contract gaps",
      lastReviewDate: "2025-01-10",
      sla: "Annual",
      status: "approved" as const,
    },
    {
      id: "3",
      vendorName: "Metro Facilities",
      category: "Facilities",
      subCategory: "Cleaning",
      riskScore: 55,
      riskDetails: "Pending insurance renewal",
      lastReviewDate: "2024-09-01",
      sla: "60 days",
      status: "in_review" as const,
    },
    {
      id: "4",
      vendorName: "DataFlow Analytics",
      category: "Technology",
      subCategory: "Data Processing",
      riskScore: 88,
      riskDetails: "No DPA, GDPR concerns",
      lastReviewDate: "2023-11-20",
      sla: "30 days",
      status: "escalated" as const,
    },
    {
      id: "5",
      vendorName: "SecurePay Ltd",
      category: "Finance",
      subCategory: "Payments",
      riskScore: 45,
      riskDetails: "Audit findings open",
      lastReviewDate: "2025-02-01",
      sla: "90 days",
      status: "pending_review" as const,
    },
    {
      id: "6",
      vendorName: "Office Supplies Co",
      category: "Operations",
      subCategory: "Procurement",
      riskScore: 18,
      riskDetails: "No issues",
      lastReviewDate: "2025-02-28",
      sla: "Annual",
      status: "approved" as const,
    },
    {
      id: "7",
      vendorName: "DevTools Software",
      category: "Technology",
      subCategory: "Software",
      riskScore: 62,
      riskDetails: "Delayed penetration test",
      lastReviewDate: "2024-08-12",
      sla: "60 days",
      status: "pending_review" as const,
    },
    {
      id: "8",
      vendorName: "HealthFirst Partners",
      category: "HR",
      subCategory: "Benefits",
      riskScore: 78,
      riskDetails: "PHI handling review overdue",
      lastReviewDate: "2024-03-01",
      sla: "30 days",
      status: "pending_review" as const,
    },
  ];
  return raw.map((v) => ({
    ...v,
    severity: getSeverity(v.riskScore),
  }));
}

let vendors: Vendor[] = createSeedVendors();
const auditLog: AuditLogEntry[] = [];

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getVendors(): Vendor[] {
  return [...vendors];
}

export function getVendorsFiltered(filters: {
  severity?: "low" | "medium" | "high";
  criticalOnly?: boolean;
}): Vendor[] {
  let list = getVendors();
  if (filters.severity) {
    list = list.filter((v) => v.severity === filters.severity);
  }
  if (filters.criticalOnly) {
    list = list.filter((v) => isCritical(v));
  }
  return list;
}

export function getVendorById(id: string): Vendor | undefined {
  return vendors.find((v) => v.id === id);
}

export function updateVendorStatus(
  id: string,
  updates: Partial<Pick<Vendor, "status" | "lastReviewDate" | "reviewedBy" | "escalationReason" | "escalatedAt" | "escalatedBy">>
): Vendor | null {
  const idx = vendors.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  vendors[idx] = { ...vendors[idx], ...updates };
  return vendors[idx];
}

export function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const full: AuditLogEntry = {
    ...entry,
    id: nextId(),
    timestamp: new Date().toISOString(),
  };
  auditLog.push(full);
  return full;
}

export function getAuditLog(options?: { vendorId?: string; limit?: number }): AuditLogEntry[] {
  let list = [...auditLog].reverse();
  if (options?.vendorId) {
    list = list.filter((e) => e.vendorId === options.vendorId);
  }
  if (options?.limit) {
    list = list.slice(0, options.limit);
  }
  return list;
}

export function getActor(): string {
  return ACTOR;
}
