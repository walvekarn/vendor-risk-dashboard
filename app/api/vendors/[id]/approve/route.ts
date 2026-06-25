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
  if (vendor.status !== "pending_review" && vendor.status !== "in_review") {
    return NextResponse.json(
      { error: "Vendor is not in a state that can be approved" },
      { status: 400 }
    );
  }

  const previousStatus = vendor.status;
  const updated = updateVendorStatus(id, {
    status: "approved",
    lastReviewDate: new Date().toISOString().slice(0, 10),
    reviewedBy: getActor(),
  });
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  appendAuditLog({
    actor: getActor(),
    action: "approve",
    vendorId: id,
    vendorName: vendor.vendorName,
    previousStatus,
    newStatus: "approved",
  });

  return NextResponse.json(updated);
}
