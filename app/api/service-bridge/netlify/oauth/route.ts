import { NextRequest, NextResponse } from "next/server";

import { createNetlifyOAuthPlan } from "@/lib/service-bridge-netlify-oauth";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-netlify-oauth-capabilities/v1",
    supportedScopes: [
      "sites:read",
      "sites:write",
      "deploys:read",
      "deploys:write",
    ],
    exactConfirmation: "APPROVE NETLIFY CONNECTION <connection-id>",
    controls: {
      pkceRequired: true,
      stateValidationRequired: true,
      encryptedSecretStoreRequired: true,
      tokenVisibleInChat: false,
      automaticAuthorizationAllowed: false,
      automaticDeploymentAllowed: false,
    },
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const plan = createNetlifyOAuthPlan({
      connectionId: String(payload?.connectionId ?? ""),
      redirectUri: String(payload?.redirectUri ?? ""),
      scopes: Array.isArray(payload?.scopes)
        ? payload.scopes.map((item: unknown) => String(item))
        : undefined,
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Netlify OAuth planning request.",
        planCreated: false,
        authorizationStarted: false,
        authorizationCompleted: false,
        tokenReceived: false,
        tokenStored: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
