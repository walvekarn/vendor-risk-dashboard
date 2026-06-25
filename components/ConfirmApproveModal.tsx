"use client";

interface ConfirmApproveModalProps {
  vendorName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmApproveModal({
  vendorName,
  onConfirm,
  onCancel,
}: ConfirmApproveModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          Confirm approval
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          This vendor (<strong>{vendorName}</strong>) has high risk. Are you
          sure you want to approve?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
