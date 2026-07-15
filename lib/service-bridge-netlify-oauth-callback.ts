import { createHash, timingSafeEqual } from "node:crypto";

export type NetlifyOAuthCallbackInput = {
  connectionId: string;
  code: string;
  returnedState: string;
  expectedStateDigest: string;
  verifier: string;
  expectedVerifierDigest: string;
  redirectUri: string;
  confirmation: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeHexEqual(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) {
    return false;
  }
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export function validateNetlifyOAuthCallback(input: NetlifyOAuthCallbackInput) {
  const connectionId = input.connectionId.trim();
  if (!connectionId) throw new Error("connectionId is required.");
  if (!input.code.trim()) throw new Error("authorization code is required.");
  if (!input.returnedState.trim()) throw new Error("returnedState is required.");
  if (!input.verifier.trim()) throw new Error("PKCE verifier is required.");

  const redirectUri = new URL(input.redirectUri);
  if (!["https:", "http:"].includes(redirectUri.protocol)) {
    throw new Error("redirectUri must use http or https.");
  }

  const expectedConfirmation = `APPROVE NETLIFY CALLBACK ${connectionId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const stateValid = safeHexEqual(
    sha256(input.returnedState),
    input.expectedStateDigest.toLowerCase(),
  );
  const verifierValid = safeHexEqual(
    sha256(input.verifier),
    input.expectedVerifierDigest.toLowerCase(),
  );

  if (!stateValid) throw new Error("OAuth state validation failed.");
  if (!verifierValid) throw new Error("PKCE verifier validation failed.");

  const exchangePayloadDigest = sha256(
    JSON.stringify({
      connectionId,
      codeDigest: sha256(input.code),
      verifierDigest: sha256(input.verifier),
      redirectUri: redirectUri.toString(),
    }),
  );

  return {
    schema: "jp-hviti-netlify-oauth-callback-validation/v1",
    connectionId,
    validatedAt: new Date().toISOString(),
    validation: {
      stateValid,
      verifierValid,
      redirectUriValid: true,
      exactConfirmationValid: true,
    },
    exchangePlan: {
      tokenEndpointCallAllowed: true,
      authorizationCodeDigest: sha256(input.code),
      exchangePayloadDigest,
      clientSecretRequiredFromEncryptedStore: true,
      plaintextClientSecretAcceptedInRequest: false,
      plaintextAccessTokenReturnedByThisPlanner: false,
    },
    storagePlan: {
      encryptedSecretStoreRequired: true,
      persistAccessTokenDigestOnlyInReceipt: true,
      tokenRotationSupported: true,
      tokenRevocationSupported: true,
      sessionValuesMustExpire: true,
    },
    truthBoundary: {
      callbackValidated: true,
      tokenExchangePerformed: false,
      tokenReceived: false,
      tokenStored: false,
      NetlifyConnected: false,
      siteCreated: false,
      deploymentStarted: false,
      externalActionCompleted: false,
    },
  };
}
