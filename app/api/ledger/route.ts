import { NextResponse } from "next/server";

const modules = [
  {
    name: "Goblin Router",
    route: "/api/goblin",
    role: "Classify, route, verify, and keep the Open Loop visible."
  },
  {
    name: "Fabian Architect",
    route: "/api/fabian",
    role: "Decompose intent and draft hyperscripts."
  },
  {
    name: "Progress Lantern",
    route: "/api/progress",
    role: "Report task state as visible progress events."
  },
  {
    name: "Violet Gate",
    route: "/api/approval",
    role: "Create approval records before consequence-bearing actions."
  },
  {
    name: "Outpost Entry Bridge",
    route: "/api/outpost/entry",
    role: "Create reversible entries with round-trip paths."
  },
  {
    name: "Return Door",
    route: "/api/outpost/entry/{id}/return",
    role: "Return an entry from Outpost 2099-2100 to the enclave."
  },
  {
    name: "Receipt Spine",
    route: "/api/receipt",
    role: "Record receipt events without processing payments or storing card data."
  }
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Goblin + Fabian Ledger Index",
    outpost: "2099-2100",
    law: [
      "No secrets in source.",
      "No hidden payments.",
      "No silent deploys.",
      "No irreversible action without approval.",
      "Every Outpost entry receives a return path."
    ],
    modules
  });
}
