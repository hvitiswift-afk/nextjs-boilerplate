import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "JP / Hviti Service Bridge API",
      version: "5.0.0",
      description:
        "Local-first mission validation, planning, batch analysis, and queue prioritization. External actions always remain user-controlled.",
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/service-bridge/manifest": {
        get: { summary: "Read the Service Bridge manifest", responses: { "200": { description: "Manifest" } } },
      },
      "/api/service-bridge/validate": {
        post: {
          summary: "Validate one mission",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Mission" } } } },
          responses: { "200": { description: "Validation result" }, "400": { description: "Invalid payload" } },
        },
      },
      "/api/service-bridge/validate-batch": {
        post: {
          summary: "Validate up to 100 missions",
          requestBody: { required: true, content: { "application/json": { schema: { type: "array", maxItems: 100, items: { $ref: "#/components/schemas/Mission" } } } } },
          responses: { "200": { description: "Batch validation result" }, "413": { description: "Batch too large" } },
        },
      },
      "/api/service-bridge/plan": {
        post: {
          summary: "Generate a controlled route plan",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Mission" } } } },
          responses: { "200": { description: "Route plan" }, "422": { description: "Mission requires completion" } },
        },
      },
      "/api/service-bridge/queue": {
        post: {
          summary: "Analyze and prioritize up to 250 missions",
          requestBody: { required: true, content: { "application/json": { schema: { type: "array", maxItems: 250, items: { $ref: "#/components/schemas/Mission" } } } } },
          responses: { "200": { description: "Ranked mission queue" }, "413": { description: "Queue too large" } },
        },
      },
    },
    components: {
      schemas: {
        Mission: {
          type: "object",
          required: ["id", "title", "service", "target", "action", "owner", "state", "priority", "permission", "evidence", "fallback"],
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            service: { type: "string" },
            target: { type: "string" },
            action: { type: "string" },
            owner: { type: "string" },
            state: { type: "string", enum: ["draft", "preflight", "awaiting-approval", "ready", "verified", "closed"] },
            priority: { type: "integer", minimum: 1, maximum: 10 },
            budget: { type: "string" },
            permission: { type: "string" },
            evidence: { type: "string" },
            fallback: { type: "string" },
            next: { type: "string" },
            query: { type: "string" },
            location: { type: "string" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    "x-jp-hviti-approval-law": {
      externalActionsRequireExplicitApproval: true,
      externalActionCompletedByApi: false,
    },
  });
}
