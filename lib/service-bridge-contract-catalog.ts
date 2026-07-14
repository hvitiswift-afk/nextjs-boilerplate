export const SERVICE_BRIDGE_CONTRACT_VERSION = 19 as const;

export type ContractDomain =
  | "core"
  | "recovery"
  | "deployment"
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

export const serviceBridgeContracts: ServiceBridgeContract[] = [
  { id: "manifest", domain: "core", path: "/api/service-bridge/manifest", methods: ["GET"], schema: "jp-hviti-service-bridge-manifest/v19", controlled: false, externalActionCompleted: false },
  { id: "health", domain: "core", path: "/api/service-bridge/health", methods: ["GET"], schema: "jp-hviti-service-bridge-health/v19", controlled: false, externalActionCompleted: false },
  { id: "openapi", domain: "core", path: "/api/service-bridge/openapi", methods: ["GET"], schema: "openapi-3.1.0", controlled: false, externalActionCompleted: false },
  { id: "receipt", domain: "core", path: "/api/service-bridge/receipt", methods: ["GET"], schema: "jp-hviti-service-bridge-system-receipt/v19", controlled: false, externalActionCompleted: false },
  { id: "deployment", domain: "deployment", path: "/api/service-bridge/deployment", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-deployment-readiness/v1", controlled: true, externalActionCompleted: false },
  { id: "deployment-repair", domain: "deployment", path: "/api/service-bridge/deployment/repair", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-deployment-repair-plan/v1", controlled: true, externalActionCompleted: false },
  { id: "polyglot", domain: "polyglot", path: "/api/service-bridge/polyglot", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polyglot-plan/v2", controlled: false, externalActionCompleted: false },
  { id: "language-universe", domain: "polyglot", path: "/api/service-bridge/polyglot/universe", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-language-universe-route/v1", controlled: false, externalActionCompleted: false },
  { id: "polyglot-l4", domain: "polyglot", path: "/api/service-bridge/polyglot/l4", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polyglot-l4-stream/v1", controlled: false, externalActionCompleted: false },
  { id: "hypercube", domain: "polyglot", path: "/api/service-bridge/polyglot/hypercube", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-hyper-language-cube/v1", controlled: false, externalActionCompleted: false },
  { id: "hypercube-route", domain: "polyglot", path: "/api/service-bridge/polyglot/hypercube/route-plan", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-hyper-language-route/v1", controlled: false, externalActionCompleted: false },
  { id: "signal-fabric", domain: "signal", path: "/api/service-bridge/polyglot/fabric", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-signal-fabric-plan/v1", controlled: true, externalActionCompleted: false },
  { id: "modem", domain: "signal", path: "/api/service-bridge/polyglot/modem", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-modem-plan/v1", controlled: true, externalActionCompleted: false },
  { id: "ar", domain: "signal", path: "/api/service-bridge/polyglot/ar", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-ar-plan/v1", controlled: true, externalActionCompleted: false },
  { id: "scanner", domain: "signal", path: "/api/service-bridge/polyglot/scanner", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-scanner-plan/v1", controlled: true, externalActionCompleted: false },
  { id: "scanner-session", domain: "signal", path: "/api/service-bridge/polyglot/scanner/session", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-scanner-session-authorization/v1", controlled: true, externalActionCompleted: false },
  { id: "cognition", domain: "signal", path: "/api/service-bridge/polyglot/cognition", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-synthetic-cognition-mesh/v1", controlled: true, externalActionCompleted: false },
  { id: "bioacoustics", domain: "signal", path: "/api/service-bridge/polyglot/bioacoustics", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-bioacoustic-plan/v1", controlled: true, externalActionCompleted: false },
  { id: "polystructure", domain: "polystructure", path: "/api/service-bridge/polyglot/polystructure", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-bank/v1", controlled: true, externalActionCompleted: false },
  { id: "polystructure-id", domain: "identity", path: "/api/service-bridge/polyglot/polystructure/id", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-id/v1", controlled: false, externalActionCompleted: false },
  { id: "polystructure-id-verify", domain: "identity", path: "/api/service-bridge/polyglot/polystructure/id/verify", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-id-verification/v1", controlled: true, externalActionCompleted: false },
  { id: "polystructure-id-chain", domain: "identity", path: "/api/service-bridge/polyglot/polystructure/id/chain", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-id-chain-entry/v1", controlled: false, externalActionCompleted: false },
  { id: "concatenate", domain: "polystructure", path: "/api/service-bridge/polyglot/polystructure/concatenate", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-concatenation/v1", controlled: true, externalActionCompleted: false },
  { id: "bundle", domain: "polystructure", path: "/api/service-bridge/polyglot/polystructure/bundle", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-bundle/v1", controlled: true, externalActionCompleted: false },
  { id: "bundle-verify", domain: "integrity", path: "/api/service-bridge/polyglot/polystructure/bundle/verify", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-bundle-verification/v1", controlled: false, externalActionCompleted: false },
  { id: "merkle", domain: "integrity", path: "/api/service-bridge/polyglot/polystructure/merkle", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-merkle-tree/v1", controlled: false, externalActionCompleted: false },
  { id: "release", domain: "release", path: "/api/service-bridge/polyglot/polystructure/release", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-release-capsule/v1", controlled: true, externalActionCompleted: false },
  { id: "release-verify", domain: "release", path: "/api/service-bridge/polyglot/polystructure/release/verify", methods: ["GET", "POST"], schema: "jp-hviti-service-bridge-polystructure-release-verification/v1", controlled: false, externalActionCompleted: false },
];

export function summarizeContractCatalog() {
  const domains = Object.fromEntries(
    [...new Set(serviceBridgeContracts.map((contract) => contract.domain))].map((domain) => [
      domain,
      serviceBridgeContracts.filter((contract) => contract.domain === domain).length,
    ]),
  );

  return {
    schema: "jp-hviti-service-bridge-contract-catalog/v1",
    contractVersion: SERVICE_BRIDGE_CONTRACT_VERSION,
    endpointCount: serviceBridgeContracts.length,
    controlledEndpointCount: serviceBridgeContracts.filter((contract) => contract.controlled).length,
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
