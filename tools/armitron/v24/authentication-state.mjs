export const AUTH_STATES = Object.freeze([
  'UNAUTHENTICATED',
  'AUTHENTICATION_REQUIRED',
  'HUMAN_AUTHENTICATING',
  'AUTHENTICATED_PROVIDER_READBACK_PENDING',
  'AUTHENTICATED_PROVIDER_CONFIRMED',
  'AUTHENTICATION_FAILED',
  'EXPIRED',
  'REVOKED'
]);

export const PROTECTED_AUTH_GATES = Object.freeze([
  'password',
  'passkey',
  'mfa',
  'one_time_code',
  'captcha',
  'human_verification',
  'liveness',
  'biometric',
  'identity_attestation',
  'account_recovery'
]);

const TRANSITIONS = Object.freeze({
  UNAUTHENTICATED: new Set(['AUTHENTICATION_REQUIRED', 'REVOKED']),
  AUTHENTICATION_REQUIRED: new Set(['HUMAN_AUTHENTICATING', 'REVOKED']),
  HUMAN_AUTHENTICATING: new Set([
    'AUTHENTICATED_PROVIDER_READBACK_PENDING',
    'AUTHENTICATION_FAILED',
    'REVOKED'
  ]),
  AUTHENTICATED_PROVIDER_READBACK_PENDING: new Set([
    'AUTHENTICATED_PROVIDER_CONFIRMED',
    'AUTHENTICATION_FAILED',
    'EXPIRED',
    'REVOKED'
  ]),
  AUTHENTICATED_PROVIDER_CONFIRMED: new Set(['EXPIRED', 'REVOKED']),
  AUTHENTICATION_FAILED: new Set(['AUTHENTICATION_REQUIRED', 'REVOKED']),
  EXPIRED: new Set(['AUTHENTICATION_REQUIRED', 'REVOKED']),
  REVOKED: new Set(['AUTHENTICATION_REQUIRED'])
});

export function assertAuthState(value) {
  if (!AUTH_STATES.includes(value)) throw new Error(`Unsupported authentication state: ${value}`);
  return value;
}

export function transitionAuthentication(current, next, evidence = {}) {
  assertAuthState(current);
  assertAuthState(next);
  if (!TRANSITIONS[current].has(next)) {
    throw new Error(`Authentication transition is not allowed: ${current} -> ${next}`);
  }
  const humanStep = next === 'HUMAN_AUTHENTICATING';
  if (humanStep && evidence.humanPresent !== true) {
    throw new Error('Entering HUMAN_AUTHENTICATING requires explicit human presence.');
  }
  if (next === 'AUTHENTICATED_PROVIDER_READBACK_PENDING' && evidence.humanCompletedProtectedStep !== true) {
    throw new Error('Provider readback may begin only after the human completes protected authentication.');
  }
  if (next === 'AUTHENTICATED_PROVIDER_CONFIRMED') {
    if (!evidence.provider || !evidence.principal || !evidence.providerSessionReference) {
      throw new Error('Provider-confirmed authentication requires provider, principal, and provider session reference.');
    }
  }
  return {
    from: current,
    to: next,
    occurredAt: new Date().toISOString(),
    humanOnlyStep: humanStep,
    providerReadbackRequired: next === 'AUTHENTICATED_PROVIDER_READBACK_PENDING',
    evidence: {
      provider: evidence.provider ?? null,
      principal: evidence.principal ?? null,
      providerSessionReferenceHash: evidence.providerSessionReferenceHash ?? null,
      reason: evidence.reason ?? null
    }
  };
}

export function authenticationCapability(state) {
  assertAuthState(state);
  return {
    state,
    ordinaryAuthenticatedActionsAllowed: state === 'AUTHENTICATED_PROVIDER_CONFIRMED',
    protectedAuthenticationAutomationAllowed: false,
    providerReadbackPending: state === 'AUTHENTICATED_PROVIDER_READBACK_PENDING',
    reauthenticationRequired: ['UNAUTHENTICATED', 'AUTHENTICATION_REQUIRED', 'AUTHENTICATION_FAILED', 'EXPIRED', 'REVOKED'].includes(state)
  };
}
