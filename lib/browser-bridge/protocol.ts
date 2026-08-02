export const browserBridgeStates = [
  "DRAFT",
  "PREPARED",
  "BROWSER_OPENING",
  "HANDOFF_REQUIRED",
  "AUTHENTICATED",
  "FILLING",
  "FILLED_VERIFIED",
  "HUMAN_APPROVAL_REQUIRED",
  "SUBMIT_AUTHORIZED",
  "SUBMITTING",
  "CONFIRMED",
  "BLOCKED",
  "OUTCOME_UNKNOWN",
  "CANCELLED"
] as const;

export type BrowserBridgeState = (typeof browserBridgeStates)[number];

export type BrowserBridgeActor = "agent" | "human" | "provider" | "system";

export type BrowserBridgeEvent = {
  id: string;
  at: string;
  actor: BrowserBridgeActor;
  from: BrowserBridgeState;
  to: BrowserBridgeState;
  reason: string;
  evidence?: string[];
};

export type BrowserBridgeReceipt = {
  missionId: string;
  state: BrowserBridgeState;
  truthState: string;
  sequence: number;
  submitActions: number;
  confirmationReference?: string;
  events: BrowserBridgeEvent[];
};

const transitionTable: Record<BrowserBridgeState, readonly BrowserBridgeState[]> = {
  DRAFT: ["PREPARED", "BLOCKED", "CANCELLED"],
  PREPARED: ["BROWSER_OPENING", "HANDOFF_REQUIRED", "BLOCKED", "CANCELLED"],
  BROWSER_OPENING: ["HANDOFF_REQUIRED", "AUTHENTICATED", "BLOCKED", "OUTCOME_UNKNOWN", "CANCELLED"],
  HANDOFF_REQUIRED: ["AUTHENTICATED", "BLOCKED", "CANCELLED"],
  AUTHENTICATED: ["FILLING", "BLOCKED", "CANCELLED"],
  FILLING: ["FILLED_VERIFIED", "BLOCKED", "OUTCOME_UNKNOWN", "CANCELLED"],
  FILLED_VERIFIED: ["HUMAN_APPROVAL_REQUIRED", "BLOCKED", "CANCELLED"],
  HUMAN_APPROVAL_REQUIRED: ["SUBMIT_AUTHORIZED", "BLOCKED", "CANCELLED"],
  SUBMIT_AUTHORIZED: ["SUBMITTING", "BLOCKED", "CANCELLED"],
  SUBMITTING: ["CONFIRMED", "OUTCOME_UNKNOWN", "BLOCKED"],
  CONFIRMED: [],
  BLOCKED: [],
  OUTCOME_UNKNOWN: [],
  CANCELLED: []
};

export function canTransition(from: BrowserBridgeState, to: BrowserBridgeState) {
  return transitionTable[from].includes(to);
}

export function assertTransition(from: BrowserBridgeState, to: BrowserBridgeState) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid browser-bridge transition: ${from} -> ${to}`);
  }
}

export function appendBrowserBridgeEvent(
  receipt: BrowserBridgeReceipt,
  event: Omit<BrowserBridgeEvent, "id">
): BrowserBridgeReceipt {
  assertTransition(receipt.state, event.to);

  if (event.from !== receipt.state) {
    throw new Error(`Receipt state mismatch: expected ${receipt.state}, received ${event.from}`);
  }

  const submitActions = event.to === "SUBMITTING" ? receipt.submitActions + 1 : receipt.submitActions;

  if (submitActions > 1) {
    throw new Error("Exactly-once guard rejected a second submission action.");
  }

  const nextSequence = receipt.sequence + 1;

  return {
    ...receipt,
    state: event.to,
    sequence: nextSequence,
    submitActions,
    events: [
      ...receipt.events,
      {
        ...event,
        id: `${receipt.missionId}:${String(nextSequence).padStart(4, "0")}`
      }
    ]
  };
}

export function requiredActorForState(state: BrowserBridgeState): BrowserBridgeActor {
  switch (state) {
    case "HANDOFF_REQUIRED":
    case "HUMAN_APPROVAL_REQUIRED":
      return "human";
    case "AUTHENTICATED":
    case "FILLING":
    case "FILLED_VERIFIED":
    case "SUBMIT_AUTHORIZED":
    case "SUBMITTING":
      return "agent";
    case "CONFIRMED":
      return "provider";
    default:
      return "system";
  }
}

export function isTerminalBrowserBridgeState(state: BrowserBridgeState) {
  return transitionTable[state].length === 0;
}
