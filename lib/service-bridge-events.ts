import { sha256 } from "@/lib/service-bridge-receipts";

export type ServiceBridgeEvent = {
  id: string;
  missionId: string;
  type:
    | "MISSION_CREATED"
    | "FIELD_UPDATED"
    | "POLICY_DECIDED"
    | "APPROVAL_RECORDED"
    | "ROUTE_OPENED"
    | "VERIFICATION_RECORDED"
    | "ROLLBACK_RECORDED"
    | "MISSION_CLOSED";
  occurredAt: string;
  actor: string;
  data: Record<string, unknown>;
  previousDigest: string | null;
  digest: string;
};

export function createServiceBridgeEvent(input: Omit<ServiceBridgeEvent, "digest">) {
  return {
    ...input,
    digest: sha256(input),
  } satisfies ServiceBridgeEvent;
}

export function verifyEventChain(events: ServiceBridgeEvent[]) {
  const failures: Array<{
    index: number;
    id: string;
    reason: string;
    expected?: string | null;
    actual?: string | null;
  }> = [];

  events.forEach((event, index) => {
    const { digest, ...payload } = event;
    const calculated = sha256(payload);

    if (calculated !== digest) {
      failures.push({
        index,
        id: event.id,
        reason: "EVENT_DIGEST_MISMATCH",
        expected: digest,
        actual: calculated,
      });
    }

    const expectedPrevious = index === 0 ? null : events[index - 1].digest;
    if (event.previousDigest !== expectedPrevious) {
      failures.push({
        index,
        id: event.id,
        reason: "PREVIOUS_DIGEST_MISMATCH",
        expected: expectedPrevious,
        actual: event.previousDigest,
      });
    }
  });

  return {
    valid: failures.length === 0,
    eventCount: events.length,
    headDigest: events.at(-1)?.digest ?? null,
    failures,
    signed: false,
    notarized: false,
    limitation:
      "This verifies local event ordering and content integrity only. It is not a digital signature, trusted timestamp, blockchain, identity proof, or proof that an external action occurred.",
    externalActionCompleted: false as const,
  };
}
