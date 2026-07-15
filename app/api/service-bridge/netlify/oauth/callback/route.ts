import { NextRequest, NextResponse } from "next/server";

import { validateNetlifyOAuthCallback } from "@/lib/service-bridge-netlify-oauth-callback";

export function GET() {
  return NextResponse.json({
    schema: "jp-hviti-netlify-oauth-callback-capabilities/v1",
    exactConfirmation: "APPROVE NETLIFY CALLBACK <connection-id>",
    controls: {
      stateValidationRequired: true,
      pkceVerifierValidationRequired: true,
      timingSafeDigestComparison: true,
      encryptedClientSecretRequired: true,
      plaintextSecretsAccepted: false,
      automaticTokenExchangeAllowed: false,
    },
    externalActionCompleted: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = validateNetlifyOAuthCallback({
      connectionId: String(payload?.connectionId ?? ""),
      code: String(payload?.code ?? ""),
      returnedState: String(payload?.returnedState ?? ""),
      expectedStateDigest: String(payload?.expectedStateDigest ?? ""),
      verifier: String(payload?.verifier ?? ""),
      expectedVerifierDigest: String(payload?.expectedVerifierDigest ?? ""),
      redirectUri: String(payload?.redirectUri ?? ""),
      confirmation: String(payload?.confirmation ?? ""),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Netlify OAuth callback validation request.",
        callbackValidated: false,
        tokenExchangePerformed: false,
        tokenReceived: false,
        tokenStored: false,
        externalActionCompleted: false,
      },
      { status: 400 },
    );
  }
}
