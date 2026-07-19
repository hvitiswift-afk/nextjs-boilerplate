import type { Config, Context } from "@netlify/functions";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

type Proposal = {
  recipientAlias: string;
  message: string;
  purpose: string;
  state: "PREPARED" | "AUTHORIZED_ONCE" | "SIMULATED_PROVIDER_ACCEPTED" | "CANCELLED";
  digest: string;
  authorizationReceiptId?: string;
};

const proposals = new Map<string, Proposal>();

const sha256 = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const result = (id: JsonRpcRequest["id"], value: unknown) =>
  json({ jsonrpc: "2.0", id: id ?? null, result: value });

const error = (id: JsonRpcRequest["id"], code: number, message: string) =>
  json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, 400);

const tools = [
  {
    name: "sms_prepare",
    description: "Prepare a proposed SMS in simulated-only mode. Does not send.",
    inputSchema: {
      type: "object",
      properties: {
        recipient_alias: { type: "string" },
        message: { type: "string", maxLength: 1600 },
        purpose: { type: "string" },
      },
      required: ["recipient_alias", "message", "purpose"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "sms_preview",
    description: "Preview the exact prepared payload and authorization state.",
    inputSchema: {
      type: "object",
      properties: { proposal_id: { type: "string" } },
      required: ["proposal_id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "sms_authorize",
    description: "Record one-time authorization for an exact proposal. Does not send.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_id: { type: "string" },
        confirmation_phrase: { type: "string" },
        authorization_nonce: { type: "string" },
      },
      required: ["proposal_id", "confirmation_phrase", "authorization_nonce"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "sms_send_simulated",
    description: "Execute a simulated send. No provider or carrier is contacted.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_id: { type: "string" },
        authorization_receipt_id: { type: "string" },
      },
      required: ["proposal_id", "authorization_receipt_id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
  {
    name: "sms_status",
    description: "Read the current state of a proposal or simulated send.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  },
  {
    name: "sms_cancel",
    description: "Cancel a proposal before simulated dispatch.",
    inputSchema: {
      type: "object",
      properties: {
        proposal_id: { type: "string" },
        reason: { type: "string" },
      },
      required: ["proposal_id", "reason"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  },
];

const callTool = async (name: string, args: Record<string, unknown>) => {
  if (name === "sms_prepare") {
    const recipientAlias = String(args.recipient_alias ?? "");
    const message = String(args.message ?? "");
    const purpose = String(args.purpose ?? "");
    if (!recipientAlias || !message || !purpose) throw new Error("required field missing");

    const digest = await sha256(JSON.stringify({ recipientAlias, message, purpose }));
    const proposalId = `SIM-${digest.slice(0, 16)}`;
    proposals.set(proposalId, {
      recipientAlias,
      message,
      purpose,
      state: "PREPARED",
      digest,
    });

    return {
      proposal_id: proposalId,
      state: "PREPARED",
      live_sms: false,
      transport: "SIMULATED_ONLY",
      digest,
    };
  }

  const proposalId = String(args.proposal_id ?? args.id ?? "");
  const proposal = proposals.get(proposalId);
  if (!proposal) return { state: "NOT_FOUND", live_sms: false };

  if (name === "sms_preview") {
    return {
      proposal_id: proposalId,
      recipient_alias: proposal.recipientAlias,
      message: proposal.message,
      purpose: proposal.purpose,
      state: proposal.state,
      digest: proposal.digest,
      authorization_required: true,
      live_sms: false,
    };
  }

  if (name === "sms_authorize") {
    if (proposal.state !== "PREPARED") {
      return { state: "REJECTED_NOT_PREPARED", live_sms: false };
    }

    const phrase = String(args.confirmation_phrase ?? "");
    const nonce = String(args.authorization_nonce ?? "");
    if (phrase !== `AUTHORIZE ${proposalId}` || nonce.length < 8) {
      return { state: "REJECTED_MISMATCH", live_sms: false };
    }

    const authorizationReceiptId = `AUTH-${(await sha256(proposal.digest + nonce)).slice(0, 16)}`;
    proposal.state = "AUTHORIZED_ONCE";
    proposal.authorizationReceiptId = authorizationReceiptId;

    return {
      proposal_id: proposalId,
      state: proposal.state,
      authorization_receipt_id: authorizationReceiptId,
      live_sms: false,
    };
  }

  if (name === "sms_send_simulated") {
    if (proposal.state !== "AUTHORIZED_ONCE") {
      return { state: "BLOCKED_NOT_AUTHORIZED", live_sms: false };
    }

    if (proposal.authorizationReceiptId !== String(args.authorization_receipt_id ?? "")) {
      return { state: "BLOCKED_AUTHORIZATION_MISMATCH", live_sms: false };
    }

    proposal.state = "SIMULATED_PROVIDER_ACCEPTED";
    return {
      proposal_id: proposalId,
      state: proposal.state,
      transport: "SIMULATED_ONLY",
      provider_contacted: false,
      carrier_contacted: false,
      carrier_delivery: "UNVERIFIED",
      live_sms: false,
      receipt_id: `RCPT-${proposal.digest.slice(0, 16)}`,
    };
  }

  if (name === "sms_status") {
    return {
      proposal_id: proposalId,
      state: proposal.state,
      live_sms: false,
      carrier_delivery: "UNVERIFIED",
    };
  }

  if (name === "sms_cancel") {
    if (proposal.state === "SIMULATED_PROVIDER_ACCEPTED") {
      return { state: "ALREADY_FINAL", live_sms: false };
    }
    proposal.state = "CANCELLED";
    return {
      proposal_id: proposalId,
      state: proposal.state,
      reason: String(args.reason ?? ""),
      live_sms: false,
    };
  }

  throw new Error("unknown tool");
};

export default async (req: Request, _context: Context) => {
  if (req.method === "GET") {
    return json({
      service: "JP Live SMS Imperatus MCP Review",
      mode: "SIMULATED_ONLY",
      live_sms: false,
      deployment_claim: "endpoint response only; no app approval or mobile pairing",
      protocol: "MCP JSON-RPC over HTTPS",
    });
  }

  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let body: JsonRpcRequest;
  try {
    body = await req.json();
  } catch {
    return error(null, -32700, "Parse error");
  }

  if (body.jsonrpc !== "2.0" || !body.method) {
    return error(body.id, -32600, "Invalid Request");
  }

  if (body.method === "initialize") {
    return result(body.id, {
      protocolVersion: "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "jp-live-sms-imperatus-review", version: "117.0.0" },
    });
  }

  if (body.method === "notifications/initialized") {
    return new Response(null, { status: 202 });
  }

  if (body.method === "tools/list") {
    return result(body.id, { tools });
  }

  if (body.method === "tools/call") {
    const params = body.params ?? {};
    const name = String(params.name ?? "");
    const args = (params.arguments ?? {}) as Record<string, unknown>;
    try {
      const value = await callTool(name, args);
      return result(body.id, {
        content: [{ type: "text", text: JSON.stringify(value) }],
        structuredContent: value,
      });
    } catch (caught) {
      return error(body.id, -32000, caught instanceof Error ? caught.message : "tool error");
    }
  }

  return error(body.id, -32601, "Method not found");
};

export const config: Config = { path: "/mcp" };
