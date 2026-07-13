import type { ServiceMission } from "@/lib/service-bridge";
import type { ServiceBridgeEvent } from "@/lib/service-bridge-events";
import { verifyEventChain } from "@/lib/service-bridge-events";

export type MissionProjection = {
  missionId: string | null;
  state: Partial<ServiceMission>;
  appliedEvents: number;
  ignoredEvents: Array<{ id: string; reason: string }>;
  chainValid: boolean;
  headDigest: string | null;
  closed: boolean;
  externalActionCompleted: false;
};

export function projectMissionFromEvents(events: ServiceBridgeEvent[]): MissionProjection {
  const verification = verifyEventChain(events);
  const state: Partial<ServiceMission> = {};
  const ignoredEvents: Array<{ id: string; reason: string }> = [];
  let missionId: string | null = null;
  let appliedEvents = 0;
  let closed = false;

  for (const event of events) {
    if (!missionId) missionId = event.missionId;
    if (event.missionId !== missionId) {
      ignoredEvents.push({ id: event.id, reason: "MISSION_ID_MISMATCH" });
      continue;
    }

    switch (event.type) {
      case "MISSION_CREATED":
      case "FIELD_UPDATED":
      case "POLICY_DECIDED":
      case "APPROVAL_RECORDED":
      case "ROUTE_OPENED":
      case "VERIFICATION_RECORDED":
      case "ROLLBACK_RECORDED":
        Object.assign(state, event.data);
        appliedEvents += 1;
        break;
      case "MISSION_CLOSED":
        Object.assign(state, event.data, { state: "closed" });
        appliedEvents += 1;
        closed = true;
        break;
      default:
        ignoredEvents.push({ id: event.id, reason: "UNSUPPORTED_EVENT_TYPE" });
    }
  }

  return {
    missionId,
    state,
    appliedEvents,
    ignoredEvents,
    chainValid: verification.valid,
    headDigest: verification.headDigest,
    closed,
    externalActionCompleted: false,
  };
}
