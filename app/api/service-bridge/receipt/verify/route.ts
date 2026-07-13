import { NextRequest, NextResponse } from "next/server";

import { verifyMissionReceipt } from "@/lib/service-bridge-receipts";

export async function POST(request: NextRequest) {
  try {
    const receipt = await request.json();
    const result = verifyMissionReceipt(receipt);

    return NextResponse.json(
      {
        checkedAt: new Date().toISOString(),
        ...result,
      },
      { status: result.valid ? 200 : 422 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON receipt payload." },
      { status: 400 },
    );
  }
}
