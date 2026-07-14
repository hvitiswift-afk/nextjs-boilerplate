import { NextRequest, NextResponse } from "next/server";

import { createDeploymentReadinessReport } from "@/lib/service-bridge-deployment";

export async function GET(request: NextRequest) {
  const commitSha = request.nextUrl.searchParams.get("commit");
  return NextResponse.json(createDeploymentReadinessReport({ commitSha }));
}
