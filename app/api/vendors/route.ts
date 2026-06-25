import { getVendorsFiltered } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity") as "low" | "medium" | "high" | null;
  const criticalOnly = searchParams.get("criticalOnly") === "true";

  const filters: { severity?: "low" | "medium" | "high"; criticalOnly?: boolean } = {};
  if (severity && ["low", "medium", "high"].includes(severity)) {
    filters.severity = severity;
  }
  if (criticalOnly) filters.criticalOnly = true;

  const vendors = getVendorsFiltered(filters);
  return NextResponse.json(vendors);
}
