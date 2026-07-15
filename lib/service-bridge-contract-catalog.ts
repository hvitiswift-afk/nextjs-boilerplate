export const SERVICE_BRIDGE_CONTRACT_VERSION = 19 as const;

export type ContractDomain =
  | "core"
  | "recovery"
  | "deployment"
  | "scheduler"
  | "integration"
  | "polyglot"
  | "signal"
  | "polystructure"
  | "identity"
  | "integrity"
  | "release";

export type ServiceBridgeContract = {
  id: string;
  domain: ContractDomain;
  path: string;
  methods: Array<"GET" | "POST">;
  schema: string;
  controlled: boolean;
  externalActionCompleted: false;
};

const contract = (
  id: string,
  domain: ContractDomain,
  path: string,
  methods: Array<"GET" | "POST">,
  schema: string,
  controlled = false,
): ServiceBridgeContract => ({
  id,
  domain,
  path,
  methods,
  schema,
  controlled,
  externalActionCompleted: false,
});

export const serviceBridgeContracts: ServiceBridgeContract[] = [
  contract("manifest", "core", "/api/service-bridge/manifest", ["GET"], "jp-hviti-service-bridge-manifest/v19"),
  contract("health", "core", "/api/service-bridge/health", ["GET"], "jp-hviti-service-bridge-health/v19"),
  contract("openapi", "core", "/api/service-bridge/openapi", ["GET"], "openapi-3.1.0"),
  contract("contracts", "core", "/api/service-bridge/contracts", ["GET"], "jp-hviti-service-bridge-contract-catalog/v1"),
  contract("validate", "core", "/api/service-bridge/validate", ["POST"], "jp-hviti-service-bridge-validation/v1"),
  contract("validate-batch", "core", "/api/service-bridge/validate-batch", ["POST"], "jp-hviti-service-bridge-batch-validation/v1"),
  contract("policy-evaluate", "core", "/api/service-bridge/policy/evaluate", ["POST"], "jp-hviti-service-bridge-policy-decision/v1", true),
  contract("orchestrate", "core", "/api/service-bridge/orchestrate", ["POST"], "jp-hviti-service-bridge-orchestration/v1", true),
  contract("orchestrate-batch", "core", "/api/service-bridge/orchestrate-batch", ["POST"], "jp-hviti-service-bridge-batch-orchestration/v1", true),
  contract("plan", "core", "/api/service-bridge/plan", ["POST"], "jp-hviti-service-bridge-plan/v1"),
  contract("queue", "core", "/api/service-bridge/queue", ["POST"], "jp-hviti-service-bridge-queue/v1"),
  contract("receipt", "core", "/api/service-bridge/receipt", ["GET"], "jp-hviti-service-bridge-system-receipt/v19"),
  contract("mission-receipt", "core", "/api/service-bridge/receipt/mission", ["POST"], "jp-hviti-service-bridge-mission-receipt/v1"),
  contract("receipt-verify", "core", "/api/service-bridge/receipt/verify", ["POST"], "jp-hviti-service-bridge-receipt-verification/v1"),

  contract("event-append", "recovery", "/api/service-bridge/events/append", ["POST"], "jp-hviti-service-bridge-event/v1"),
  contract("event-verify", "recovery", "/api/service-bridge/events/verify", ["POST"], "jp-hviti-service-bridge-event-chain-verification/v1"),
  contract("event-project", "recovery", "/api/service-bridge/events/project", ["POST"], "jp-hviti-service-bridge-event-projection/v1"),
  contract("event-reconcile", "recovery", "/api/service-bridge/events/reconcile", ["POST"], "jp-hviti-service-bridge-reconciliation/v1"),
  contract("event-resolve", "recovery", "/api/service-bridge/events/resolve", ["POST"], "jp-hviti-service-bridge-resolution/v1", true),
  contract("event-persist", "recovery", "/api/service-bridge/events/persist", ["POST"], "jp-hviti-service-bridge-persistence-plan/v1", true),
  contract("event-rollback", "recovery", "/api/service-bridge/events/rollback", ["POST"], "jp-hviti-service-bridge-rollback-plan/v1", true),
  contract("lifecycle", "recovery", "/api/service-bridge/lifecycle", ["POST"], "jp-hviti-service-bridge-lifecycle-entry/v1", true),
  contract("lifecycle-project", "recovery", "/api/service-bridge/lifecycle/project", ["POST"], "jp-hviti-service-bridge-lifecycle-projection/v1"),
  contract("lifecycle-apply", "recovery", "/api/service-bridge/lifecycle/apply", ["POST"], "jp-hviti-service-bridge-lifecycle-projection-apply-plan/v1", true),

  contract("deployment", "deployment", "/api/service-bridge/deployment", ["GET", "POST"], "jp-hviti-service-bridge-deployment-readiness/v1", true),
  contract("deployment-repair", "deployment", "/api/service-bridge/deployment/repair", ["GET", "POST"], "jp-hviti-service-bridge-deployment-repair-plan/v1", true),
  contract("scheduler", "scheduler", "/api/service-bridge/scheduler", ["GET", "POST"], "jp-hviti-service-bridge-scheduler-plan/v1", true),
  contract("netlify-oauth", "integration", "/api/service-bridge/netlify/oauth", ["GET", "POST"], "jp-hviti-netlify-oauth-plan/v1", true),

  contract("polyglot", "polyglot", "/api/service-bridge/polyglot", ["GET", "POST"], "jp-hviti-service-bridge-polyglot-plan/v2"),
  contract("language-universe", "polyglot", "/api/service-bridge/polyglot/universe", ["GET", "POST"], "jp-hviti-service-bridge-language-universe-route/v1"),
  contract("polyglot-l4", "polyglot", "/api/service-bridge/polyglot/l4", ["GET", "POST"], "jp-hviti-service-bridge-polyglot-l4-stream/v1"),
  contract("hypercube", "polyglot", "/api/service-bridge/polyglot/hypercube", ["GET", "POST"], "jp-hviti-service-bridge-hyper-language-cube/v1"),
  contract("hypercube-route", "polyglot", "/api/service-bridge/polyglot/hypercube/route-plan", ["GET", "POST"], "jp-hviti-service-bridge-hyper-language-route/v1"),

  contract("signal-fabric", "signal", "/api/service-bridge/polyglot/fabric", ["GET", "POST"], "jp-hviti-service-bridge-signal-fabric-plan/v1", true),
  contract("modem", "signal", "/api/service-bridge/polyglot/modem", ["GET", "POST"], "jp-hviti-service-bridge-modem-plan/v1", true),
  contract("ar", "signal", "/api/service-bridge/polyglot/ar", ["GET", "POST"], "jp-hviti-service-bridge-ar-plan/v1", true),
  contract("scanner", "signal", "/api/service-bridge/polyglot/scanner", ["GET", "POST"], "jp-hviti-service-bridge-scanner-plan/v1", true),
  contract("scanner-session", "signal", "/api/service-bridge/polyglot/scanner/session", ["GET", "POST"], "jp-hviti-service-bridge-scanner-session-authorization/v1", true),
  contract("cognition", "signal", "/api/service-bridge/polyglot/cognition", ["GET", "POST"], "jp-hviti-service-bridge-synthetic-cognition-mesh/v1", true),
  contract("bioacoustics", "signal", "/api/service-bridge/polyglot/bioacoustics", ["GET", "POST"], "jp-hviti-service-bridge-bioacoustic-plan/v1", true),

  contract("polystructure", "polystructure", "/api/service-bridge/polyglot/polystructure", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-bank/v1", true),
  contract("polystructure-id", "identity", "/api/service-bridge/polyglot/polystructure/id", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-id/v1"),
  contract("polystructure-id-verify", "identity", "/api/service-bridge/polyglot/polystructure/id/verify", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-id-verification/v1", true),
  contract("polystructure-id-chain", "identity", "/api/service-bridge/polyglot/polystructure/id/chain", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-id-chain-entry/v1"),
  contract("concatenate", "polystructure", "/api/service-bridge/polyglot/polystructure/concatenate", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-concatenation/v1", true),
  contract("bundle", "polystructure", "/api/service-bridge/polyglot/polystructure/bundle", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-bundle/v1", true),
  contract("bundle-verify", "integrity", "/api/service-bridge/polyglot/polystructure/bundle/verify", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-bundle-verification/v1"),
  contract("merkle", "integrity", "/api/service-bridge/polyglot/polystructure/merkle", ["GET", "POST"], "jp-hviti-service-bridge-merkle-tree/v1"),
  contract("release", "release", "/api/service-bridge/polyglot/polystructure/release", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-release-capsule/v1", true),
  contract("release-verify", "release", "/api/service-bridge/polyglot/polystructure/release/verify", ["GET", "POST"], "jp-hviti-service-bridge-polystructure-release-verification/v1"),
];

export function summarizeContractCatalog() {
  const domains = Object.fromEntries(
    [...new Set(serviceBridgeContracts.map((item) => item.domain))].map((domain) => [
      domain,
      serviceBridgeContracts.filter((item) => item.domain === domain).length,
    ]),
  );

  return {
    schema: "jp-hviti-service-bridge-contract-catalog/v1",
    contractVersion: SERVICE_BRIDGE_CONTRACT_VERSION,
    endpointCount: serviceBridgeContracts.length,
    controlledEndpointCount: serviceBridgeContracts.filter((item) => item.controlled).length,
    domains,
    contracts: serviceBridgeContracts,
    alignmentTarget: {
      manifest: SERVICE_BRIDGE_CONTRACT_VERSION,
      health: SERVICE_BRIDGE_CONTRACT_VERSION,
      receipt: SERVICE_BRIDGE_CONTRACT_VERSION,
      openapi: SERVICE_BRIDGE_CONTRACT_VERSION,
      runtimeChecker: SERVICE_BRIDGE_CONTRACT_VERSION,
    },
    truthBoundary: {
      catalogPublished: true,
      routeExistenceRuntimeVerified: false,
      schemasRuntimeVerified: false,
      buildVerified: false,
      externalActionCompleted: false,
    },
  };
}
