export type MemoryVaultKind =
  | "hyperscript"
  | "progress"
  | "approval"
  | "receipt"
  | "outpost-entry"
  | "uv7"
  | "health"
  | "ledger"
  | "note";

export type MemoryVaultRecord<TPayload = unknown> = {
  id: string;
  kind: MemoryVaultKind;
  title: string;
  payload: TPayload;
  createdAt: string;
  outpostReturnUrl?: string;
  tags: string[];
};

export type MemoryVaultIndex = {
  system: "Memory Vault";
  outpost: "2099-2100";
  records: MemoryVaultRecord[];
  law: string[];
};

export function createMemoryRecord<TPayload>(input: {
  id: string;
  kind: MemoryVaultKind;
  title: string;
  payload: TPayload;
  tags?: string[];
  outpostReturnUrl?: string;
}): MemoryVaultRecord<TPayload> {
  return {
    id: input.id,
    kind: input.kind,
    title: input.title,
    payload: input.payload,
    createdAt: new Date().toISOString(),
    outpostReturnUrl: input.outpostReturnUrl,
    tags: input.tags ?? []
  };
}

export function createMemoryVault(records: MemoryVaultRecord[] = []): MemoryVaultIndex {
  return {
    system: "Memory Vault",
    outpost: "2099-2100",
    records,
    law: [
      "No secrets in source.",
      "No hidden payments.",
      "No silent deploys.",
      "No irreversible action without approval.",
      "Every important record receives an Outpost return path."
    ]
  };
}
