import { NextRequest, NextResponse } from "next/server";
import { roundTrip } from "../../../lib/outpost-entry";

type ReceiptStatus = "draft" | "recorded" | "verified" | "rejected";

type ReceiptRecord = {
  id: string;
  source: "manual" | "paypal" | "stripe" | "cloud" | "deployment";
  status: ReceiptStatus;
  amount?: number;
  currency?: string;
  description: string;
  createdAt: string;
  outpostReturnUrl: string;
};

const sample: ReceiptRecord = {
  id: "receipt-demo",
  source: "manual",
  status: "draft",
  description: "Demo receipt spine record. No payment was processed.",
  createdAt: new Date().toISOString(),
  outpostReturnUrl: "/api/outpost/entry/receipt-demo/return"
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Receipt Spine",
    note: "Receipts are records only. This route does not process payments or store card data.",
    receipts: [sample]
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" && body.id.trim().length > 0 ? body.id.trim() : `receipt-${Date.now()}`;
  const description = typeof body.description === "string" ? body.description : "Manual receipt record.";

  const receipt: ReceiptRecord = {
    id,
    source: body.source === "paypal" || body.source === "stripe" || body.source === "cloud" || body.source === "deployment" ? body.source : "manual",
    status: "recorded",
    amount: typeof body.amount === "number" ? body.amount : undefined,
    currency: typeof body.currency === "string" ? body.currency : undefined,
    description,
    createdAt: new Date().toISOString(),
    outpostReturnUrl: `/api/outpost/entry/${id}/return`
  };

  const trip = roundTrip({
    id,
    kind: "receipt",
    payload: receipt,
    createdAt: receipt.createdAt
  });

  return NextResponse.json({
    ok: true,
    system: "Receipt Spine",
    receipt,
    trip,
    warning: "No payment was processed. Store payment secrets only in provider dashboards."
  });
}
