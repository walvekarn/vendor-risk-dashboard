import {
  appendAuditLog,
  getActor,
  getVendorById,
  updateVendorStatus,
} from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vendor = getVendorById(id);
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  let body: { escalationReason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const reason = typeof body.escalationReason === "string" ? body.escalationReason.trim() : "";
  if (!reason) {
    return NextResponse.json(
      { error: "Escalation reason is required" },
      { status: 400 }
    );
  }
  if (reason.length < MIN_REASON_LENGTH) {
    return NextResponse.json(
      { error: `Escalation reason must be at least ${MIN_REASON_LENGTH} characters` },
      { status: 400 }
    );
  }
  if (reason.length > MAX_REASON_LENGTH) {
    return NextResponse.json(
      { error: `Escalation reason must be at most ${MAX_REASON_LENGTH} characters` },
      { status: 400 }
    );
  }

  const previousStatus = vendor.status;
  const now = new Date().toISOString();
  const updated = updateVendorStatus(id, {
    status: "escalated",
    escalationReason: reason,
    escalatedAt: now,
    escalatedBy: getActor(),
  });
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  appendAuditLog({
    actor: getActor(),
    action: "escalate",
    vendorId: id,
    vendorName: vendor.vendorName,
    previousStatus,
    newStatus: "escalated",
    details: reason,
  });

  return NextResponse.json(updated);
}
