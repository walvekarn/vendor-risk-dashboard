"use client";

import type { Severity } from "@/lib/types";

interface FiltersProps {
  severity: Severity | "all";
  criticalOnly: boolean;
  showOnlyEscalated: boolean;
  onSeverityChange: (value: Severity | "all") => void;
  onCriticalOnlyChange: (value: boolean) => void;
  onShowOnlyEscalatedChange: (value: boolean) => void;
}

export function Filters({
  severity,
  criticalOnly,
  showOnlyEscalated,
  onSeverityChange,
  onCriticalOnlyChange,
  onShowOnlyEscalatedChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="severity" className="text-sm font-medium text-gray-700">
          Severity
        </label>
        <select
          id="severity"
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value as Severity | "all")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="criticalOnly"
          checked={criticalOnly}
          onChange={(e) => onCriticalOnlyChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="criticalOnly" className="text-sm font-medium text-gray-700">
          Critical tasks only
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showOnlyEscalated"
          checked={showOnlyEscalated}
          onChange={(e) => onShowOnlyEscalatedChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
        />
        <label htmlFor="showOnlyEscalated" className="text-sm font-medium text-gray-700">
          Show only escalated
        </label>
      </div>
    </div>
  );
}
