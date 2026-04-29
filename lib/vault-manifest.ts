export type VaultManifestEndpoint = {
  name: string;
  method: "GET" | "POST";
  path: string;
  purpose: string;
  approvalAuthority: boolean;
};

export type VaultManifest = {
  system: "Goblin + Fabian Stone Vault";
  version: "0.1.0";
  endpoints: VaultManifestEndpoint[];
  law: readonly string[];
  spine: readonly string[];
};

export const VAULT_MANIFEST_ENDPOINTS: VaultManifestEndpoint[] = [
  {
    name: "Stone Vault Health",
    method: "GET",
    path: "/api/vault/health",
    purpose: "Diagnose durable table availability and counts.",
    approvalAuthority: false
  },
  {
    name: "Unified Vault Ledger",
    method: "GET",
    path: "/api/vault/ledger",
    purpose: "Read memory, approval, progress, outpost, and receipt records together.",
    approvalAuthority: false
  },
  {
    name: "Execution Worker",
    method: "POST",
    path: "/api/execute",
    purpose: "Classify execution intent and route it to progress or approval.",
    approvalAuthority: false
  },
  {
    name: "Approval Gate",
    method: "POST",
    path: "/api/approval",
    purpose: "Create visible approval records for Violet Gate review.",
    approvalAuthority: true
  },
  {
    name: "Approval Decision",
    method: "POST",
    path: "/api/approval/decision",
    purpose: "Explicitly approve or reject an existing pending approval record.",
    approvalAuthority: true
  },
  {
    name: "Progress Lantern",
    method: "POST",
    path: "/api/progress",
    purpose: "Record normalized progress evidence.",
    approvalAuthority: false
  },
  {
    name: "Outpost Entry Bridge",
    method: "POST",
    path: "/api/outpost/entry",
    purpose: "Create outbound and inbound Outpost 2099-2100 round-trip records.",
    approvalAuthority: false
  },
  {
    name: "Outpost Return Door",
    method: "GET",
    path: "/api/outpost/entry/{id}/return",
    purpose: "Record an Outpost return entry for an existing entry id.",
    approvalAuthority: false
  }
];

export const VAULT_MANIFEST_LAW = [
  "The manifest is a map, not an authorization.",
  "Only Violet Gate can approve consequence-bearing execution.",
  "Approval creation and approval decision are separate visible acts.",
  "Health, ledger, progress, outpost, and receipt records are evidence.",
  "Every durable route should be discoverable without guessing."
] as const;

export const VAULT_MANIFEST_SPINE = [
  "HyperIntent",
  "Provider Adapter Hall",
  "Provider Memory",
  "Memory Vault",
  "Stone Vault Schema Indexes",
  "Unified Vault Ledger Read Model",
  "Unified Vault Ledger API",
  "Stone Vault Health API",
  "Vault Manifest",
  "Execution Worker API",
  "Execution Memory Persistence",
  "Approval Vault Persistence",
  "Approval Decision API",
  "Progress Vault Persistence",
  "Outpost Vault Persistence",
  "Receipt Records",
  "Violet Gate",
  "Outpost 2099-2100",
  "Return Door",
  "Enclave"
] as const;

export function getVaultManifest(): VaultManifest {
  return {
    system: "Goblin + Fabian Stone Vault",
    version: "0.1.0",
    endpoints: VAULT_MANIFEST_ENDPOINTS,
    law: VAULT_MANIFEST_LAW,
    spine: VAULT_MANIFEST_SPINE
  };
}
