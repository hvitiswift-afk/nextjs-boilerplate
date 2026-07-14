import { NextRequest, NextResponse } from "next/server";

import { projectLifecycleJournal } from "@/lib/service-bridge-lifecycle-projection";
import type { LifecycleEntry } from "@/lib/service-bridge-lifecycle";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const entries = payload?.entries as LifecycleEntry[];

    if (!Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Provide an entries array." },
        { status: 400 },
      );
    }

    const projection = projectLifecycleJournal(entries);
    return NextResponse.json(projection, {
      status: projection.journalValid ? 200 : 422,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid lifecycle projection payload.",
      },
      { status: 400 },
    );
  }
}
