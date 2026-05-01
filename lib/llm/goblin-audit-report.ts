import { createGoblinControlDeckHealth } from "./goblin-control-deck-health";
import { createGoblinControlDeckManifest } from "./goblin-control-deck-manifest";
import { createGoblinReceiptLedger } from "./goblin-receipt-ledger";

export type GoblinAuditCheckName =
  | "manifestActive"
  | "healthHealthy"
  | "ledgerActive"
  | "noDuplicateReceipts"
  | "fullLawCoverage";

export type GoblinAuditChecks = Record<GoblinAuditCheckName, boolean>;

export type GoblinAuditReport = {
  product: "Goblin LLM Audit Report";
  status: "pass" | "attention";
  manifestReceiptId: string;
  healthReceiptId: string;
  ledgerReceiptId: string;
  routeTotal: number;
  receiptTotal: number;
  lawCoveragePercent: number;
  duplicateReceiptIds: string[];
  layerCount: number;
  dashboardCount: number;
  apiCount: number;
  checkCount: number;
  passedCheckCount: number;
  failingChecks: GoblinAuditCheckName[];
  checks: GoblinAuditChecks;
  receipt: {
    id: "receipt-goblin-audit-report-036";
    kind: "llm-goblin-audit-report";
    status: "active";
  };
};

export function createGoblinAuditReport(): GoblinAuditReport {
  const manifest = createGoblinControlDeckManifest();
  const health = createGoblinControlDeckHealth();
  const ledger = createGoblinReceiptLedger();

  const checks: GoblinAuditChecks = {
    manifestActive: manifest.status === "active",
    healthHealthy: health.status === "healthy",
    ledgerActive: ledger.status === "active",
    noDuplicateReceipts: ledger.duplicateReceiptIds.length === 0,
    fullLawCoverage: ledger.lawCoveragePercent === 100,
  };

  const failingChecks = (Object.entries(checks) as Array<[GoblinAuditCheckName, boolean]>)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);
  const checkCount = Object.keys(checks).length;
  const passedCheckCount = checkCount - failingChecks.length;
  const status = failingChecks.length === 0 ? "pass" : "attention";

  return {
    product: "Goblin LLM Audit Report",
    status,
    manifestReceiptId: manifest.receipt.id,
    healthReceiptId: health.receipt.id,
    ledgerReceiptId: ledger.receipt.id,
    routeTotal: ledger.routeTotal,
    receiptTotal: ledger.receiptTotal,
    lawCoveragePercent: ledger.lawCoveragePercent,
    duplicateReceiptIds: ledger.duplicateReceiptIds,
    layerCount: ledger.layerTotals.length,
    dashboardCount: health.dashboardCount,
    apiCount: health.apiCount,
    checkCount,
    passedCheckCount,
    failingChecks,
    checks,
    receipt: {
      id: "receipt-goblin-audit-report-036",
      kind: "llm-goblin-audit-report",
      status: "active",
    },
  };
}
