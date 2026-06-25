export type Severity = "low" | "medium" | "high";

export type VendorStatus =
  | "pending_review"
  | "approved"
  | "escalated"
  | "in_review";

export type AuditAction = "approve" | "review_now" | "escalate";

export interface Vendor {
  id: string;
  vendorName: string;
  category: string;
  subCategory: string;
  riskScore: number;
  riskDetails: string;
  severity: Severity;
  lastReviewDate: string;
  sla: string;
  status: VendorStatus;
  reviewedBy?: string;
  escalationReason?: string;
  escalatedAt?: string;
  escalatedBy?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: AuditAction;
  vendorId: string;
  vendorName: string;
  previousStatus: string;
  newStatus: string;
  details?: string;
  metadata?: Record<string, unknown>;
}
