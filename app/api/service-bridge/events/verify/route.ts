import { NextRequest, NextResponse } from "next/server";

import { ServiceBridgeEvent, verifyEventChain } from "@/lib/service-bridge-events";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const events = (Array.isArray(payload) ? payload : payload?.events) as ServiceBridgeEvent[];

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "Provide an event array or an object with an events array." },
        { status: 400 },
      );
    }

    const result = verifyEventChain(events);

    return NextResponse.json(
      {
        checkedAt: new Date().toISOString(),
        ...result,
      },
      { status: result.valid ? 200 : 422 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON event-chain payload." },
      { status: 400 },
    );
  }
}
