import type { Vendor } from "@/lib/types";

interface SummaryCardsProps {
  vendors: Vendor[];
}

export function SummaryCards({ vendors }: SummaryCardsProps) {
  const total = vendors.length;
  const low = vendors.filter((v) => v.severity === "low").length;
  const medium = vendors.filter((v) => v.severity === "medium").length;
  const high = vendors.filter((v) => v.severity === "high").length;
  const pending = vendors.filter(
    (v) => v.status === "pending_review" || v.status === "in_review"
  ).length;
  const escalated = vendors.filter((v) => v.status === "escalated").length;

  const cards = [
    { label: "Total Vendors", value: total },
    { label: "Low Risk", value: low, color: "text-green-600" },
    { label: "Medium Risk", value: medium, color: "text-amber-600" },
    { label: "High Risk", value: high, color: "text-red-600" },
    { label: "Pending Review", value: pending },
    { label: "Escalated", value: escalated },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${card.color ?? "text-gray-900"}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
