import { NextResponse } from "next/server";

const checks = [
  { name: "Goblin Router", route: "/api/goblin", status: "seeded" },
  { name: "Fabian Architect", route: "/api/fabian", status: "seeded" },
  { name: "Progress Lantern", route: "/api/progress", status: "seeded" },
  { name: "Violet Gate", route: "/api/approval", status: "seeded" },
  { name: "Ledger Index", route: "/api/ledger", status: "seeded" },
  { name: "Receipt Spine", route: "/api/receipt", status: "seeded" },
  { name: "Outpost Entry Bridge", route: "/api/outpost/entry", status: "seeded" },
  { name: "Return Door", route: "/api/outpost/entry/{id}/return", status: "seeded" }
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    system: "Goblin + Fabian Enclave Health",
    outpost: "2099-2100",
    openLoop: true,
    timestamp: new Date().toISOString(),
    checks,
    next: [
      "wire persistent memory vault",
      "connect provider adapters",
      "add execution worker behind approval gate",
      "add deployment receipt records"
    ]
  });
}
