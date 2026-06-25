"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmApproveModal } from "@/components/ConfirmApproveModal";
import { EscalateModal } from "@/components/EscalateModal";
import { Filters } from "@/components/Filters";
import { SummaryCards } from "@/components/SummaryCards";
import { VendorTable } from "@/components/VendorTable";
import { isCritical } from "@/lib/critical-tasks";
import type { Severity, Vendor } from "@/lib/types";

export default function Home() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [showOnlyEscalated, setShowOnlyEscalated] = useState(false);
  const [confirmVendor, setConfirmVendor] = useState<Vendor | null>(null);
  const [escalateVendor, setEscalateVendor] = useState<Vendor | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vendors");
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      setVendors(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  let filteredVendors = severityFilter === "all"
    ? vendors
    : vendors.filter((v) => v.severity === severityFilter);
  if (showOnlyEscalated) {
    filteredVendors = filteredVendors.filter((v) => v.status === "escalated");
  }
  const tableVendors = criticalOnly
    ? filteredVendors.filter((v) => isCritical(v))
    : filteredVendors;

  const handleApprove = useCallback(
    async (vendor: Vendor) => {
      if (vendor.riskScore > 70) {
        setConfirmVendor(vendor);
        return;
      }
      await doApprove(vendor.id);
    },
    []
  );

  const doApprove = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/vendors/${id}/approve`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Approve failed");
        }
        setConfirmVendor(null);
        await fetchVendors();
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Approve failed");
      }
    },
    [fetchVendors]
  );

  const handleConfirmApprove = useCallback(() => {
    if (confirmVendor) {
      doApprove(confirmVendor.id);
    }
  }, [confirmVendor, doApprove]);

  const handleReviewNow = useCallback(
    async (vendor: Vendor) => {
      try {
        const res = await fetch(`/api/vendors/${vendor.id}/review`, {
          method: "POST",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Review now failed");
        }
        await fetchVendors();
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Review now failed");
      }
    },
    [fetchVendors]
  );

  const handleEscalateOpen = useCallback((vendor: Vendor) => {
    setEscalateVendor(vendor);
  }, []);

  const handleEscalateSubmit = useCallback(
    async (reason: string) => {
      if (!escalateVendor) return;
      try {
        const res = await fetch(`/api/vendors/${escalateVendor.id}/escalate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ escalationReason: reason }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Escalate failed");
        }
        setEscalateVendor(null);
        await fetchVendors();
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Escalate failed");
      }
    },
    [escalateVendor, fetchVendors]
  );

  const handleExport = useCallback(() => {
    const headers = [
      "Vendor Name",
      "Category",
      "Sub Category",
      "Risk Score",
      "Risk Details",
      "Severity",
      "Last Review Date",
      "SLA",
      "Status",
    ];
    const rows = tableVendors.map((v) =>
      [
        v.vendorName,
        v.category,
        v.subCategory,
        v.riskScore,
        v.riskDetails,
        v.severity,
        v.lastReviewDate,
        v.sla,
        v.status,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendor-risk-scorecard.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [tableVendors]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vendor Risk Scorecard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Compliance team dashboard
              </p>
            </div>
            <a
              href="/audit-log"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Audit log
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setCriticalOnly(true);
              setSeverityFilter("all");
              setShowOnlyEscalated(false);
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Review pending vendors
          </button>
          <button
            type="button"
            onClick={() => {
              setShowOnlyEscalated(true);
              setCriticalOnly(false);
              setSeverityFilter("all");
            }}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View escalated
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading vendors...</p>
        ) : (
          <>
            <SummaryCards vendors={vendors} />
            <div className="mt-6">
              <Filters
                severity={severityFilter}
                criticalOnly={criticalOnly}
                showOnlyEscalated={showOnlyEscalated}
                onSeverityChange={setSeverityFilter}
                onCriticalOnlyChange={setCriticalOnly}
                onShowOnlyEscalatedChange={setShowOnlyEscalated}
              />
            </div>
            <div className="mt-6">
              <VendorTable
                vendors={tableVendors}
                onApprove={handleApprove}
                onReviewNow={handleReviewNow}
                onEscalate={handleEscalateOpen}
              />
            </div>
          </>
        )}
      </div>

      {confirmVendor && (
        <ConfirmApproveModal
          vendorName={confirmVendor.vendorName}
          onConfirm={handleConfirmApprove}
          onCancel={() => setConfirmVendor(null)}
        />
      )}
      {escalateVendor && (
        <EscalateModal
          vendorName={escalateVendor.vendorName}
          onSubmit={handleEscalateSubmit}
          onCancel={() => setEscalateVendor(null)}
        />
      )}
    </main>
  );
}
