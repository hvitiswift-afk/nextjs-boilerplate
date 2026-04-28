import type { Hyperscript, ProgressEvent, ApprovalRecord } from "./hyperscript";

export type OutpostDirection = "to-outpost" | "from-outpost" | "round-trip";

export type OutpostEntryKind =
  | "hyperscript"
  | "progress"
  | "approval"
  | "receipt"
  | "log"
  | "memory"
  | "deployment";

export type OutpostEntry<TPayload = unknown> = {
  id: string;
  kind: OutpostEntryKind;
  direction: OutpostDirection;
  origin: "enclave" | "edge" | "server-tower" | "outpost-2099-2100";
  destination: "enclave" | "edge" | "server-tower" | "outpost-2099-2100";
  payload: TPayload;
  createdAt: string;
  returnPath?: string;
};

export type OutpostRoundTrip<TPayload = unknown> = {
  outbound: OutpostEntry<TPayload>;
  inbound: OutpostEntry<TPayload>;
};

export function toOutpost<TPayload>(entry: Omit<OutpostEntry<TPayload>, "direction" | "origin" | "destination" | "returnPath">): OutpostEntry<TPayload> {
  return {
    ...entry,
    direction: "to-outpost",
    origin: "enclave",
    destination: "outpost-2099-2100",
    returnPath: `/api/outpost/entry/${entry.id}/return`
  };
}

export function fromOutpost<TPayload>(entry: Omit<OutpostEntry<TPayload>, "direction" | "origin" | "destination">): OutpostEntry<TPayload> {
  return {
    ...entry,
    direction: "from-outpost",
    origin: "outpost-2099-2100",
    destination: "enclave"
  };
}

export function roundTrip<TPayload>(entry: Omit<OutpostEntry<TPayload>, "direction" | "origin" | "destination" | "returnPath">): OutpostRoundTrip<TPayload> {
  const outbound = toOutpost(entry);
  const inbound = fromOutpost({
    ...entry,
    id: `${entry.id}:return`,
    createdAt: new Date().toISOString()
  });

  return { outbound, inbound };
}

export function entryFromHyperscript(hyperscript: Hyperscript): OutpostRoundTrip<Hyperscript> {
  return roundTrip({
    id: hyperscript.id,
    kind: "hyperscript",
    payload: hyperscript,
    createdAt: new Date().toISOString()
  });
}

export function entryFromProgress(event: ProgressEvent): OutpostRoundTrip<ProgressEvent> {
  return roundTrip({
    id: event.id,
    kind: "progress",
    payload: event,
    createdAt: event.createdAt
  });
}

export function entryFromApproval(record: ApprovalRecord): OutpostRoundTrip<ApprovalRecord> {
  return roundTrip({
    id: record.id,
    kind: "approval",
    payload: record,
    createdAt: record.createdAt
  });
}
