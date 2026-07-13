import { NextResponse } from "next/server";

const jsonBody = (schema: Record<string, unknown>) => ({ required: true, content: { "application/json": { schema } } });

export function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "JP / Hviti Service Bridge API",
      version: "11.0.0",
      description: "Local-first single and batch mission orchestration with validation, policy, route control, receipts, event integrity, health, and explicit user approval boundaries.",
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/service-bridge/manifest": { get: { summary: "Read the Service Bridge manifest", responses: { "200": { description: "Manifest" } } } },
      "/api/service-bridge/health": { get: { summary: "Read runtime health and capabilities", responses: { "200": { description: "Healthy" }, "503": { description: "Degraded" } } } },
      "/api/service-bridge/receipt": { get: { summary: "Read the consolidated system receipt", responses: { "200": { description: "System receipt" } } } },
      "/api/service-bridge/validate": { post: { summary: "Validate one mission", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Validation result" }, "400": { description: "Invalid payload" } } } },
      "/api/service-bridge/validate-batch": { post: { summary: "Validate up to 100 missions", requestBody: jsonBody({ type: "object", required: ["missions"], properties: { missions: { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/Mission" } } } }), responses: { "200": { description: "Batch result" }, "413": { description: "Batch too large" } } } },
      "/api/service-bridge/policy/evaluate": { post: { summary: "Evaluate mission policy", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Policy decision" } } } },
      "/api/service-bridge/orchestrate": { post: { summary: "Run single-mission orchestration", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Orchestration result" }, "422": { description: "Mission incomplete" } } } },
      "/api/service-bridge/orchestrate-batch": { post: { summary: "Run orchestration across up to 100 missions", requestBody: jsonBody({ type: "object", required: ["missions"], properties: { missions: { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/Mission" } } } }), responses: { "200": { description: "Batch orchestration result" }, "413": { description: "Batch too large" } } } },
      "/api/service-bridge/plan": { post: { summary: "Generate a controlled route plan", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Route plan" }, "422": { description: "Mission requires completion" } } } },
      "/api/service-bridge/queue": { post: { summary: "Analyze and prioritize up to 250 missions", requestBody: jsonBody({ type: "object", required: ["missions"], properties: { missions: { type: "array", maxItems: 250, items: { $ref: "#/components/schemas/Mission" } } } }), responses: { "200": { description: "Ranked queue" }, "413": { description: "Queue too large" } } } },
      "/api/service-bridge/receipt/mission": { post: { summary: "Create a deterministic mission receipt", requestBody: jsonBody({ $ref: "#/components/schemas/Mission" }), responses: { "200": { description: "Mission receipt" }, "422": { description: "Incomplete mission receipt" } } } },
      "/api/service-bridge/receipt/verify": { post: { summary: "Verify a mission receipt digest", requestBody: jsonBody({ $ref: "#/components/schemas/MissionReceipt" }), responses: { "200": { description: "Digest valid" }, "422": { description: "Digest mismatch" } } } },
      "/api/service-bridge/events/append": { post: { summary: "Append a chained event", requestBody: jsonBody({ $ref: "#/components/schemas/EventAppendRequest" }), responses: { "200": { description: "Event created" } } } },
      "/api/service-bridge/events/verify": { post: { summary: "Verify event content and ordering", requestBody: jsonBody({ type: "object", required: ["events"], properties: { events: { type: "array", items: { $ref: "#/components/schemas/ChainEvent" } } } }), responses: { "200": { description: "Chain valid" }, "422": { description: "Chain changed or broken" } } } },
      "/api/service-bridge/openapi": { get: { summary: "Read this OpenAPI document", responses: { "200": { description: "OpenAPI 3.1 document" } } } },
    },
    components: { schemas: {
      Mission: { type: "object", required: ["id", "title", "service", "target", "action", "owner", "state", "priority", "permission", "evidence", "fallback"], properties: { id: { type: "string" }, title: { type: "string" }, service: { type: "string" }, target: { type: "string" }, action: { type: "string" }, owner: { type: "string" }, state: { type: "string", enum: ["draft", "preflight", "awaiting-approval", "ready", "verified", "closed"] }, priority: { type: "integer", minimum: 1, maximum: 10 }, budget: { type: "string" }, permission: { type: "string" }, evidence: { type: "string" }, fallback: { type: "string" }, next: { type: "string" }, query: { type: "string" }, location: { type: "string" }, updatedAt: { type: "string", format: "date-time" } } },
      MissionReceipt: { type: "object", required: ["schema", "issuedAt", "mission", "validation", "approvalBoundary", "integrity"], properties: { schema: { const: "jp-hviti-service-bridge-receipt/v1" }, issuedAt: { type: "string", format: "date-time" }, mission: { $ref: "#/components/schemas/Mission" }, validation: { type: "object" }, approvalBoundary: { type: "object" }, integrity: { type: "object", required: ["algorithm", "digest"], properties: { algorithm: { const: "SHA-256" }, digest: { type: "string", pattern: "^[a-f0-9]{64}$" } } } } },
      ChainEvent: { type: "object", required: ["id", "missionId", "type", "occurredAt", "actor", "data", "previousDigest", "digest"], properties: { id: { type: "string" }, missionId: { type: "string" }, type: { type: "string" }, occurredAt: { type: "string", format: "date-time" }, actor: { type: "string" }, data: { type: "object" }, previousDigest: { type: ["string", "null"] }, digest: { type: "string", pattern: "^[a-f0-9]{64}$" } } },
      EventAppendRequest: { type: "object", required: ["missionId", "type", "actor"], properties: { missionId: { type: "string" }, type: { type: "string" }, actor: { type: "string" }, data: { type: "object" }, previousEvent: { anyOf: [{ $ref: "#/components/schemas/ChainEvent" }, { type: "null" }] } } },
    } },
    "x-jp-hviti-approval-law": { externalActionsRequireExplicitApproval: true, externalActionCompletedByApi: false },
    "x-orchestration-stages": ["validate", "policy", "route", "receipt", "next-action"],
    "x-orchestration-modes": ["single", "batch"],
    "x-integrity-limitations": { signed: false, notarized: false, blockchain: false, authoritativeTimestamp: false, externalActionProof: false },
  });
}
