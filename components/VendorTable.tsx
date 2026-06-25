"use client";

import { useMemo, useState } from "react";
import { isOverdue } from "@/lib/critical-tasks";
import type { Vendor } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { VendorRowActions } from "./VendorRowActions";

type SortKey = "riskScore" | "lastReviewDate" | "vendorName";
type SortDir = "asc" | "desc";

interface VendorTableProps {
  vendors: Vendor[];
  onApprove: (vendor: Vendor) => void;
  onReviewNow: (vendor: Vendor) => void;
  onEscalate: (vendor: Vendor) => void;
}

export function VendorTable({
  vendors,
  onApprove,
  onReviewNow,
  onEscalate,
}: VendorTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("riskScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedVendors = useMemo(() => {
    const list = [...vendors];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "riskScore") cmp = a.riskScore - b.riskScore;
      else if (sortKey === "lastReviewDate")
        cmp = a.lastReviewDate.localeCompare(b.lastReviewDate);
      else cmp = a.vendorName.localeCompare(b.vendorName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [vendors, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "riskScore" ? "desc" : "asc");
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-700">Vendor Name</th>
            <th className="px-4 py-3 font-medium text-gray-700">Category</th>
            <th className="px-4 py-3 font-medium text-gray-700">Sub Category</th>
            <th className="px-4 py-3 font-medium text-gray-700">
              <button
                type="button"
                onClick={() => toggleSort("riskScore")}
                className="hover:underline"
              >
                Risk Score {sortKey === "riskScore" && (sortDir === "desc" ? "↓" : "↑")}
              </button>
            </th>
            <th className="px-4 py-3 font-medium text-gray-700">Risk Details</th>
            <th className="px-4 py-3 font-medium text-gray-700">Severity</th>
            <th className="px-4 py-3 font-medium text-gray-700">
              <button
                type="button"
                onClick={() => toggleSort("lastReviewDate")}
                className="hover:underline"
              >
                Last Review {sortKey === "lastReviewDate" && (sortDir === "desc" ? "↓" : "↑")}
              </button>
            </th>
            <th className="px-4 py-3 font-medium text-gray-700">SLA</th>
            <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedVendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {vendor.vendorName}
              </td>
              <td className="px-4 py-3 text-gray-600">{vendor.category}</td>
              <td className="px-4 py-3 text-gray-600">{vendor.subCategory}</td>
              <td className="px-4 py-3 text-gray-900">{vendor.riskScore}</td>
              <td className="max-w-xs px-4 py-3 text-gray-600 truncate" title={vendor.riskDetails}>
                {vendor.riskDetails}
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={vendor.severity} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                <span>{vendor.lastReviewDate}</span>
                {isOverdue(vendor.lastReviewDate, vendor.sla) && (
                  <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                    Overdue
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{vendor.sla}</td>
              <td className="px-4 py-3">
                <VendorRowActions
                  vendor={vendor}
                  onApprove={onApprove}
                  onReviewNow={onReviewNow}
                  onEscalate={onEscalate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
