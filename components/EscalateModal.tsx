"use client";

import { useState } from "react";

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

interface EscalateModalProps {
  vendorName: string;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

export function EscalateModal({
  vendorName,
  onSubmit,
  onCancel,
}: EscalateModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Escalation reason is required.");
      return;
    }
    if (trimmed.length < MIN_LENGTH) {
      setError(`Please enter at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Please enter at most ${MAX_LENGTH} characters.`);
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Escalate vendor</h3>
        <p className="mt-1 text-sm text-gray-600">
          Escalating: <strong>{vendorName}</strong>
        </p>
        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="escalation-reason" className="block text-sm font-medium text-gray-700">
            Escalation reason (required, 10–500 characters)
          </label>
          <textarea
            id="escalation-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Describe why this vendor is being escalated..."
          />
          <p className="mt-1 text-xs text-gray-500">
            {reason.length} / {MAX_LENGTH}
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Escalate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
