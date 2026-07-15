import { createHash, randomBytes } from "node:crypto";

export type NetlifyOAuthPlanInput = {
  connectionId: string;
  redirectUri: string;
  scopes?: string[];
  confirmation: string;
};

const allowedScopes = new Set([
  "sites:read",
  "sites:write",
  "deploys:read",
  "deploys:write",
]);

function base64url(value: Buffer) {
  return value.toString("base64url");
}

export function createNetlifyOAuthPlan(input: NetlifyOAuthPlanInput) {
  const connectionId = input.connectionId.trim();
  if (!connectionId) throw new Error("connectionId is required.");

  const redirect = new URL(input.redirectUri);
  if (!['https:', 'http:'].includes(redirect.protocol)) {
    throw new Error("redirectUri must use http or https.");
  }

  const expected = `APPROVE NETLIFY CONNECTION ${connectionId}`;
  if (input.confirmation.trim() !== expected) {
    throw new Error(`Exact confirmation required: ${expected}`);
  }

  const scopes = [...new Set(input.scopes ?? [...allowedScopes])];
  for (const scope of scopes) {
    if (!allowedScopes.has(scope)) throw new Error(`Unsupported Netlify scope: ${scope}`);
  }

  const state = base64url(randomBytes(32));
  const verifier = base64url(randomBytes(48));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const stateDigest = createHash("sha256").update(state).digest("hex");
  const verifierDigest = createHash("sha256").update(verifier).digest("hex");

  return {
    schema: "jp-hviti-netlify-oauth-plan/v1",
    connectionId,
    createdAt: new Date().toISOString(),
    redirectUri: redirect.toString(),
    scopes,
    pkce: {
      method: "S256",
      challenge,
      verifierStorageRequired: true,
      verifierDigest,
    },
    state: {
      stateStorageRequired: true,
      stateDigest,
    },
    secretHandling: {
      tokenVisibleInChat: false,
      tokenCommittedToRepository: false,
      encryptedSecretStoreRequired: true,
      rotationSupported: true,
      revocationSupported: true,
    },
    nextActions: [
      "Store the state and PKCE verifier in an encrypted, expiring server-side session.",
      "Redirect the user to Netlify authorization using the configured OAuth client.",
      "Validate callback state before exchanging the authorization code.",
      "Store returned credentials only in an encrypted secret store.",
      "Discover or create a site after the connection is verified.",
    ],
    truthBoundary: {
      planCreated: true,
      oauthClientConfigured: false,
      authorizationStarted: false,
      authorizationCompleted: false,
      tokenReceived: false,
      tokenStored: false,
      siteCreated: false,
      deploymentStarted: false,
      externalActionCompleted: false,
    },
  };
}
