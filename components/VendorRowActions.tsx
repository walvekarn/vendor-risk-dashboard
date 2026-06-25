"use client";

import type { Vendor } from "@/lib/types";

interface VendorRowActionsProps {
  vendor: Vendor;
  onApprove: (vendor: Vendor) => void;
  onReviewNow: (vendor: Vendor) => void;
  onEscalate: (vendor: Vendor) => void;
}

export function VendorRowActions({
  vendor,
  onApprove,
  onReviewNow,
  onEscalate,
}: VendorRowActionsProps) {
  if (vendor.status === "approved") {
    return <span className="text-sm text-gray-500">Reviewed</span>;
  }
  if (vendor.status === "escalated") {
    return <span className="text-sm text-amber-600">Escalated</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(vendor.status === "pending_review" || vendor.status === "in_review") && (
        <button
          type="button"
          onClick={() => onApprove(vendor)}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
        >
          Approve
        </button>
      )}
      {vendor.status === "pending_review" && (
        <button
          type="button"
          onClick={() => onReviewNow(vendor)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          Review now
        </button>
      )}
      {(vendor.status === "pending_review" || vendor.status === "in_review") && (
        <button
          type="button"
          onClick={() => onEscalate(vendor)}
          className="rounded-md border border-amber-600 bg-white px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50"
        >
          Escalate
        </button>
      )}
    </div>
  );
}
