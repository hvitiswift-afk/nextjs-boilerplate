import { NextResponse } from "next/server";

const jsonBody = (schema: Record<string, unknown>) => ({ required: true, content: { "application/json": { schema } } });

export function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "JP / Hviti Service Bridge API",
      version: "13.0.0",
      description: "Local-first orchestration, recovery, explicit authority resolution, and gated local persistence with no automatic external action.",
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/service-bridge/manifest": { get: { summary: "Read the manifest", responses: { "200": { description: "Manifest" } } } },
      "/api/service-bridge/health": { get: { summary: "Read health", responses: { "200": { description: "Healthy" }, "503": { description: "Degraded" } } } },
      "/api/service-bridge/validate": { post: { summary: "Validate one mission", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Validation" } } } },
      "/api/service-bridge/validate-batch": { post: { summary: "Validate mission batch", requestBody: jsonBody({ $ref: "#/components/schemas/MissionBatch" }), responses: { "200": { description: "Batch validation" }, "413": { description: "Too large" } } } },
      "/api/service-bridge/policy/evaluate": { post: { summary: "Evaluate policy", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Policy decision" } } } },
      "/api/service-bridge/orchestrate": { post: { summary: "Orchestrate one mission", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Orchestration" }, "422": { description: "Incomplete" } } } },
      "/api/service-bridge/orchestrate-batch": { post: { summary: "Orchestrate mission batch", requestBody: jsonBody({ $ref: "#/components/schemas/MissionBatch" }), responses: { "200": { description: "Batch orchestration" }, "413": { description: "Too large" } } } },
      "/api/service-bridge/plan": { post: { summary: "Generate route plan", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Plan" }, "422": { description: "Incomplete" } } } },
      "/api/service-bridge/queue": { post: { summary: "Prioritize queue", requestBody: jsonBody({ $ref: "#/components/schemas/MissionQueue" }), responses: { "200": { description: "Queue" }, "413": { description: "Too large" } } } },
      "/api/service-bridge/receipt": { get: { summary: "Read system receipt", responses: { "200": { description: "Receipt" } } } },
      "/api/service-bridge/receipt/mission": { post: { summary: "Create mission receipt", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Receipt" }, "422": { description: "Incomplete" } } } },
      "/api/service-bridge/receipt/verify": { post: { summary: "Verify receipt", requestBody: jsonBody({ $ref: "#/components/schemas/MissionReceipt" }), responses: { "200": { description: "Valid" }, "422": { description: "Mismatch" } } } },
      "/api/service-bridge/events/append": { post: { summary: "Append event", requestBody: jsonBody({ $ref: "#/components/schemas/EventAppendRequest" }), responses: { "200": { description: "Event" } } } },
      "/api/service-bridge/events/verify": { post: { summary: "Verify event chain", requestBody: jsonBody({ $ref: "#/components/schemas/EventChain" }), responses: { "200": { description: "Valid" }, "422": { description: "Broken" } } } },
      "/api/service-bridge/events/project": { post: { summary: "Project mission state from event chain", requestBody: jsonBody({ $ref: "#/components/schemas/EventChain" }), responses: { "200": { description: "Projection" }, "422": { description: "Invalid chain" } } } },
      "/api/service-bridge/events/reconcile": { post: { summary: "Reconcile snapshot with projected history", requestBody: jsonBody({ $ref: "#/components/schemas/ReconciliationRequest" }), responses: { "200": { description: "Consistent" }, "409": { description: "Conflict" } } } },
      "/api/service-bridge/events/resolve": { post: { summary: "Create an explicit authority resolution packet", requestBody: jsonBody({ $ref: "#/components/schemas/ResolutionRequest" }), responses: { "200": { description: "Resolution packet" }, "400": { description: "Invalid authority or missing reason" } } } },
      "/api/service-bridge/events/persist": { post: { summary: "Create a gated local persistence plan", requestBody: jsonBody({ $ref: "#/components/schemas/PersistenceRequest" }), responses: { "200": { description: "Persistence plan" }, "400": { description: "Invalid resolution or confirmation" } } } },
      "/api/service-bridge/openapi": { get: { summary: "Read this document", responses: { "200": { description: "OpenAPI" } } } },
    },
    components: { schemas: {
      Mission: { type: "object", required: ["id", "title", "service", "target", "action", "owner", "state", "priority", "permission", "evidence", "fallback"], properties: { id: { type: "string" }, title: { type: "string" }, service: { type: "string" }, target: { type: "string" }, action: { type: "string" }, owner: { type: "string" }, state: { type: "string", enum: ["draft", "preflight", "awaiting-approval", "ready", "verified", "closed"] }, priority: { type: "integer", minimum: 1, maximum: 10 }, budget: { type: "string" }, permission: { type: "string" }, evidence: { type: "string" }, fallback: { type: "string" }, next: { type: "string" }, query: { type: "string" }, location: { type: "string" }, updatedAt: { type: "string", format: "date-time" } } },
      MissionBatch: { type: "object", required: ["missions"], properties: { missions: { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/Mission" } } } },
      MissionQueue: { type: "object", required: ["missions"], properties: { missions: { type: "array", maxItems: 250, items: { $ref: "#/components/schemas/Mission" } } } },
      MissionReceipt: { type: "object" },
      ChainEvent: { type: "object", required: ["id", "missionId", "type", "occurredAt", "actor", "data", "previousDigest", "digest"] },
      EventAppendRequest: { type: "object", required: ["missionId", "type", "actor"] },
      EventChain: { type: "object", required: ["events"], properties: { events: { type: "array", items: { $ref: "#/components/schemas/ChainEvent" } } } },
      ReconciliationRequest: { type: "object", required: ["snapshot", "events"], properties: { snapshot: { $ref: "#/components/schemas/Mission" }, events: { type: "array", items: { $ref: "#/components/schemas/ChainEvent" } } } },
      ResolutionRequest: { type: "object", required: ["snapshot", "events", "authority", "actor", "reason"], properties: { snapshot: { $ref: "#/components/schemas/Mission" }, events: { type: "array", items: { $ref: "#/components/schemas/ChainEvent" } }, authority: { type: "string", enum: ["snapshot", "projection", "manual"] }, actor: { type: "string" }, reason: { type: "string" }, manualState: { type: "object" } } },
      ResolutionPacket: { type: "object", required: ["schema", "missionId", "authority", "actor", "reason", "resolvedState", "mutationApplied", "requiresExplicitPersistence", "externalActionCompleted"], properties: { schema: { const: "jp-hviti-service-bridge-resolution/v1" }, missionId: { type: "string" }, authority: { type: "string", enum: ["snapshot", "projection", "manual"] }, actor: { type: "string" }, reason: { type: "string" }, resolvedState: { type: "object" }, mutationApplied: { const: false }, requiresExplicitPersistence: { const: true }, externalActionCompleted: { const: false } } },
      PersistenceRequest: { type: "object", required: ["resolution", "currentMissions", "confirmation"], properties: { resolution: { $ref: "#/components/schemas/ResolutionPacket" }, currentMissions: { type: "array", items: { $ref: "#/components/schemas/Mission" } }, confirmation: { type: "string", pattern: "^PERSIST .+$" } } },
    } },
    "x-jp-hviti-approval-law": { externalActionsRequireExplicitApproval: true, externalActionCompletedByApi: false },
    "x-orchestration-stages": ["validate", "policy", "route", "receipt", "next-action"],
    "x-orchestration-modes": ["single", "batch"],
    "x-recovery-stages": ["event-chain", "verify", "project", "reconcile", "resolve-authority", "plan-persistence", "explicit-local-write"],
    "x-authority-options": ["snapshot", "projection", "manual"],
    "x-persistence-confirmations": ["PERSIST <mission-id>", "APPLY LOCAL <mission-id>"],
    "x-silent-overwrite-allowed": false,
    "x-automatic-mutation-allowed": false,
    "x-external-persistence-allowed": false,
    "x-integrity-limitations": { signed: false, notarized: false, blockchain: false, authoritativeTimestamp: false, externalActionProof: false },
  });
}
