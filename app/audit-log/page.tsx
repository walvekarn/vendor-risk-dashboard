"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuditLogEntry } from "@/lib/types";

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-log");
      if (!res.ok) throw new Error("Failed to fetch audit log");
      const data = await res.json();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const handleExport = useCallback(() => {
    const headers = [
      "Timestamp",
      "Actor",
      "Action",
      "Vendor ID",
      "Vendor Name",
      "Previous Status",
      "New Status",
      "Details",
    ];
    const rows = entries.map((e) =>
      [
        e.timestamp,
        e.actor,
        e.action,
        e.vendorId,
        e.vendorName,
        e.previousStatus,
        e.newStatus,
        e.details ?? "",
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
              <p className="mt-1 text-sm text-gray-500">
                Compliance actions (approve, review, escalate)
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </a>
              <button
                type="button"
                onClick={handleExport}
                className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-gray-600">Loading audit log...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actor</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Action</th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Vendor Name
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Previous Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    New Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No audit entries yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {new Date(e.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{e.actor}</td>
                      <td className="px-4 py-3 text-gray-900">{e.action}</td>
                      <td className="px-4 py-3 text-gray-900">
                        {e.vendorName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {e.previousStatus}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {e.newStatus}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                        {e.details ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
