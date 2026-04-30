import { createGoblinControlDeckHealth } from "./goblin-control-deck-health";
import { createGoblinControlDeckManifest } from "./goblin-control-deck-manifest";
import { createGoblinReceiptLedger } from "./goblin-receipt-ledger";

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
  checks: {
    manifestActive: boolean;
    healthHealthy: boolean;
    ledgerActive: boolean;
    noDuplicateReceipts: boolean;
    fullLawCoverage: boolean;
  };
  receipt: {
    id: "receipt-goblin-audit-report-031";
    kind: "llm-goblin-audit-report";
    status: "active";
  };
};

export function createGoblinAuditReport(): GoblinAuditReport {
  const manifest = createGoblinControlDeckManifest();
  const health = createGoblinControlDeckHealth();
  const ledger = createGoblinReceiptLedger();

  const checks = {
    manifestActive: manifest.status === "active",
    healthHealthy: health.status === "healthy",
    ledgerActive: ledger.status === "active",
    noDuplicateReceipts: ledger.duplicateReceiptIds.length === 0,
    fullLawCoverage: ledger.lawCoveragePercent === 100,
  };

  const status = Object.values(checks).every(Boolean) ? "pass" : "attention";

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
    checks,
    receipt: {
      id: "receipt-goblin-audit-report-031",
      kind: "llm-goblin-audit-report",
      status: "active",
    },
  };
}
