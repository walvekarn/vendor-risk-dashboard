import {
  appendAuditLog,
  getActor,
  getVendorById,
  updateVendorStatus,
} from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vendor = getVendorById(id);
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const previousStatus = vendor.status;
  const updated = updateVendorStatus(id, { status: "in_review" });
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  appendAuditLog({
    actor: getActor(),
    action: "review_now",
    vendorId: id,
    vendorName: vendor.vendorName,
    previousStatus,
    newStatus: "in_review",
  });

  return NextResponse.json(updated);
}
