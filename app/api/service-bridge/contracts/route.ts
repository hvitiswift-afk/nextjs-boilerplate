import { NextResponse } from "next/server";

import { summarizeContractCatalog } from "@/lib/service-bridge-contract-catalog";

export function GET() {
  return NextResponse.json(summarizeContractCatalog());
}
