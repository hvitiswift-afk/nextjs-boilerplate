import { createHash, randomUUID } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { appendReceipt } from '../v23/armitron-clock.mjs';
import { resolveLink, resolveUniverse } from './world-registry.mjs';

export const ACTIVITY_TYPES = Object.freeze([
  'message',
  'reply',
  'current_event',
  'forecast',
  'backcast',
  'commitment',
  'proposal',
  'warning',
  'outcome',
  'code_patch',
  'code_commit',
  'test_result',
  'artifact_transfer',
  'generic_exchange',
  'market_observation',
  'trade_proposal',
  'trade_execution_receipt',
  'control',
  'arrival_receipt',
  'closure_receipt'
]);

export const SETTLEMENT_STATES = Object.freeze([
  'CREATED',
  'FENCED',
  'AUTHORIZED_PRIVATE',
  'HANDOFF_REQUIRED',
  'BLOCKED',
  'DISPATCHED_INTERNAL',
  'ARRIVED',
  'READBACK_CONFIRMED',
  'CLOSED'
]);

export const CSHARP_FENCES = Object.freeze([
  'TRUTH_PROVENANCE',
  'IDENTITY_TARGET',
  'PRIVACY_MINIMIZATION',
  'CAPABILITY',
  'REVERSIBILITY',
  'CONSEQUENCE',
  'HUMAN_GATE',
  'DUPLICATE_IDEMPOTENCY',
  'READBACK',
  'CLOSURE'
]);

export const HIGH_IMPACT_ACTIVITIES = new Set([
  'trade_execution_receipt'
]);

const DEFAULT_LEDGER = '.armitron/v25/vtc-exchange.jsonl';
const FINANCIAL_EXECUTION_FIELDS = Object.freeze([
  'brokerProvider',
  'accountReference',
  'instrument',
  'side',
  'orderType',
  'quantity',
  'timeInForce',
  'providerOrderReference'
]);

function sha256(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function redact(value, key = '') {
  if (value === null || value === undefined) return value;
  if (/password|passkey|secret|token|cookie|authorization|mfa|otp|captcha|recovery|private.?key|card|cvv|cvc/i.test(key)) {
    return '[REDACTED]';
  }
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redact(child, childKey)]));
  }
  if (typeof value === 'string') {
    return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (email) => `email-sha256:${sha256(email.toLowerCase())}`);
  }
  return value;
}

async function readLedger(ledgerPath) {
  try {
    const text = await readFile(ledgerPath, 'utf8');
    return text.split('\n').filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function appendLedger(ledgerPath, record) {
  await mkdir(path.dirname(ledgerPath), { recursive: true, mode: 0o700 });
  await appendFile(ledgerPath, `${JSON.stringify(record)}\n`, { mode: 0o600 });
}

function status(ok, block = true) {
  return ok ? 'PASS' : block ? 'BLOCK' : 'HOLD';
}

function fence(layer, fence, ok, rule, evidence, reason, block = true) {
  return {
    layer,
    fence,
    status: status(ok, block),
    rule,
    evidence: redact(evidence),
    reason
  };
}

function financialExecutionComplete(payload) {
  return FINANCIAL_EXECUTION_FIELDS.every((field) => payload?.[field] !== undefined && payload?.[field] !== null && String(payload[field]).trim() !== '');
}

export function evaluateTenFences(input) {
  const isFinancialExecution = input.activityType === 'trade_execution_receipt';
  const highImpact = HIGH_IMPACT_ACTIVITIES.has(input.activityType) || input.externalAction === true;
  const protectedHuman = input.humanGate === true || input.legalEffect === true || input.paymentEffect === true;
  const financialComplete = !isFinancialExecution || financialExecutionComplete(input.payload);
  const providerTradeReadback = !isFinancialExecution || (
    input.providerReadback === true &&
    input.jpTargetSpecificApproval === true &&
    financialComplete
  );

  const results = [
    fence(0, 'TRUTH_PROVENANCE', input.sourceTruth === true, 'Facts require a source or explicit assumption label.', input.evidenceClass, 'Truth or provenance is missing.'),
    fence(1, 'IDENTITY_TARGET', input.targetVerified === true && Boolean(input.targetUniverseId), 'Exact destination universe and owner are required.', input.targetUniverseId, 'Destination is not exact or verified.'),
    fence(2, 'PRIVACY_MINIMIZATION', input.minimumPrivateData === true, 'Use the least private data necessary.', input.minimumPrivateData, 'Private-data scope is excessive.'),
    fence(3, 'CAPABILITY', input.capabilityAvailable === true, 'A supported adapter and active world link must exist.', input.capabilityAvailable, 'No supported execution capability.'),
    fence(4, 'REVERSIBILITY', input.reversible === true || input.activityType.endsWith('_receipt'), 'Automatic transfer must be reversible, nonbinding, or a receipt.', input.reversible, 'Transfer is irreversible or externally binding.'),
    fence(5, 'CONSEQUENCE', !highImpact || (isFinancialExecution && providerTradeReadback), 'High-impact activity requires exact target-specific authority and provider evidence.', input.activityType, 'High-impact or external activity lacks protected authority.'),
    fence(6, 'HUMAN_GATE', !protectedHuman || input.jpTargetSpecificApproval === true, 'Protected judgment and consequential acceptance remain JP-only.', protectedHuman, 'A protected human step has not been completed.'),
    fence(7, 'DUPLICATE_IDEMPOTENCY', input.duplicateClear === true, 'Duplicate and unknown prior outcomes must be blocked.', input.idempotencyKeyHash, 'Duplicate or unknown prior outcome.'),
    fence(8, 'READBACK', input.readbackAvailable === true, 'Destination or provider readback must be available.', input.readbackAvailable, 'No authoritative readback surface.', false),
    fence(9, 'CLOSURE', input.closurePlan === true && input.returnRoute === true, 'Arrival, settlement, return route, and terminal closure must be defined.', { closurePlan: input.closurePlan, returnRoute: input.returnRoute }, 'Transfer lacks an explicit closure or return route.', false)
  ];

  const blocked = results.some((item) => item.status === 'BLOCK');
  const held = results.some((item) => item.status === 'HOLD');
  return {
    overallStatus: blocked ? 'BLOCK' : held ? 'HOLD' : 'PASS',
    finalAuthority: blocked
      ? 'JP_TARGET_SPECIFIC_REQUIRED'
      : held
        ? 'JP_REVIEW_REQUIRED'
        : 'AUTO_PRIVATE_REVERSIBLE',
    fenceResults: results,
    financialExecutionProtected: isFinancialExecution,
    financialExecutionFieldsComplete: financialComplete
  };
}

export function createEnvelope(registry, input) {
  if (!ACTIVITY_TYPES.includes(input.activityType)) throw new Error(`Unsupported activity type: ${input.activityType}`);
  const source = resolveUniverse(registry, input.sourceUniverse);
  const target = resolveUniverse(registry, input.targetUniverse);
  if (source.universeId === target.universeId) throw new Error('Cross-world exchange requires different source and target universes.');
  if (source.world === target.world && input.allowIntraWorld !== true) {
    throw new Error('This exchange requires distinct worlds; set allowIntraWorld only for a deliberate same-world transfer.');
  }
  const link = resolveLink(registry, source.universeId, target.universeId, input.linkActivity ?? input.activityType);
  if (source.world !== target.world && !input.transformPlan) {
    throw new Error('Cross-world transfers require an explicit transformPlan.');
  }
  const createdAt = input.createdAt ?? new Date().toISOString();
  const idempotencyKey = String(input.idempotencyKey ?? randomUUID());
  const base = {
    schemaVersion: 'armitron.vtc.exchange-envelope.v25',
    envelopeId: `ENV-${randomUUID()}`,
    createdAt,
    source: {
      world: source.world,
      universeId: source.universeId,
      universeNumber: source.number,
      universeName: source.name
    },
    target: {
      world: target.world,
      universeId: target.universeId,
      universeNumber: target.number,
      universeName: target.name
    },
    linkId: link.linkId,
    transferGate: link.gate,
    activityType: input.activityType,
    subject: String(input.subject ?? '').trim(),
    payload: redact(input.payload ?? {}),
    payloadHash: sha256(canonical(input.payload ?? {})),
    transformPlan: input.transformPlan ?? null,
    evidenceClass: input.evidenceClass ?? 'USER_REPORTED_OR_LOCAL_OBSERVATION',
    evidence: Array.isArray(input.evidence) ? input.evidence.map(String) : [],
    sourceOccurredAt: input.sourceOccurredAt ?? null,
    observedAt: input.observedAt ?? createdAt,
    triggerAt: input.triggerAt ?? null,
    expiresAt: input.expiresAt ?? null,
    idempotencyKeyHash: sha256(idempotencyKey),
    settlementState: 'CREATED',
    returnRoute: {
      required: true,
      sourceUniverseId: target.universeId,
      targetUniverseId: source.universeId
    },
    truthBoundary: 'SOFTWARE_NAMESPACE_TRANSFER_NOT_PHYSICAL_OR_IDENTITY_TRANSFER'
  };
  base.digest = sha256(canonical(base));
  return base;
}

export async function fenceEnvelope(registry, envelope, options = {}) {
  const ledgerPath = path.resolve(options.ledgerPath ?? process.env.JP_VTC_EXCHANGE_LEDGER ?? DEFAULT_LEDGER);
  const records = await readLedger(ledgerPath);
  const duplicate = records.some((record) => record.idempotencyKeyHash === envelope.idempotencyKeyHash && record.envelopeId !== envelope.envelopeId);
  const decision = evaluateTenFences({
    activityType: envelope.activityType,
    targetUniverseId: envelope.target.universeId,
    payload: envelope.payload,
    sourceTruth: options.sourceTruth ?? envelope.evidenceClass !== 'UNLABELED',
    targetVerified: options.targetVerified ?? true,
    minimumPrivateData: options.minimumPrivateData ?? true,
    capabilityAvailable: options.capabilityAvailable ?? true,
    reversible: options.reversible ?? !['trade_execution_receipt'].includes(envelope.activityType),
    externalAction: options.externalAction ?? false,
    legalEffect: options.legalEffect ?? false,
    paymentEffect: options.paymentEffect ?? envelope.activityType === 'trade_execution_receipt',
    humanGate: options.humanGate ?? envelope.activityType === 'trade_execution_receipt',
    jpTargetSpecificApproval: options.jpTargetSpecificApproval ?? false,
    duplicateClear: !duplicate,
    idempotencyKeyHash: envelope.idempotencyKeyHash,
    readbackAvailable: options.readbackAvailable ?? true,
    providerReadback: options.providerReadback ?? false,
    closurePlan: options.closurePlan ?? true,
    returnRoute: Boolean(envelope.returnRoute?.required),
    evidenceClass: envelope.evidenceClass
  });

  const priorDigest = records.at(-1)?.recordDigest ?? null;
  const record = {
    ...envelope,
    recordType: 'fenced_exchange',
    settlementState: decision.overallStatus === 'PASS'
      ? 'AUTHORIZED_PRIVATE'
      : decision.overallStatus === 'HOLD'
        ? 'HANDOFF_REQUIRED'
        : 'BLOCKED',
    controlDecision: decision,
    priorDigest
  };
  record.recordDigest = sha256(canonical(record));
  await appendLedger(ledgerPath, record);
  await appendReceipt({
    lane: 'multiverse_exchange',
    action: 'VTC_ENVELOPE_FENCED',
    status: record.settlementState,
    eventId: record.envelopeId,
    details: {
      sourceWorld: record.source.world,
      targetWorld: record.target.world,
      sourceUniverseId: record.source.universeId,
      targetUniverseId: record.target.universeId,
      activityType: record.activityType,
      overallStatus: decision.overallStatus,
      finalAuthority: decision.finalAuthority,
      idempotencyKeyHash: record.idempotencyKeyHash,
      recordDigest: record.recordDigest
    }
  });
  return record;
}

export async function appendArrivalReceipt(envelopeRecord, input = {}, options = {}) {
  if (!['AUTHORIZED_PRIVATE', 'DISPATCHED_INTERNAL', 'HANDOFF_REQUIRED'].includes(envelopeRecord.settlementState)) {
    throw new Error(`Envelope cannot arrive from settlement state ${envelopeRecord.settlementState}.`);
  }
  const ledgerPath = path.resolve(options.ledgerPath ?? process.env.JP_VTC_EXCHANGE_LEDGER ?? DEFAULT_LEDGER);
  const records = await readLedger(ledgerPath);
  const priorDigest = records.at(-1)?.recordDigest ?? null;
  const arrival = {
    schemaVersion: 'armitron.vtc.arrival-receipt.v25',
    recordType: 'arrival_receipt',
    receiptId: `ARR-${randomUUID()}`,
    envelopeId: envelopeRecord.envelopeId,
    createdAt: new Date().toISOString(),
    destinationUniverseId: envelopeRecord.target.universeId,
    destinationAccepted: input.destinationAccepted === true,
    providerReadback: input.providerReadback === true,
    arrivalSummary: String(input.arrivalSummary ?? '').trim(),
    transformedPayloadHash: input.transformedPayloadHash ?? envelopeRecord.payloadHash,
    settlementState: input.destinationAccepted === true ? 'ARRIVED' : 'HANDOFF_REQUIRED',
    priorDigest
  };
  arrival.recordDigest = sha256(canonical(arrival));
  await appendLedger(ledgerPath, arrival);
  return arrival;
}

export async function appendClosureReceipt(envelopeRecord, arrivalReceipt, input = {}, options = {}) {
  if (arrivalReceipt.envelopeId !== envelopeRecord.envelopeId) throw new Error('Closure receipt envelope mismatch.');
  if (arrivalReceipt.destinationAccepted !== true) throw new Error('Cannot close an unaccepted transfer.');
  const ledgerPath = path.resolve(options.ledgerPath ?? process.env.JP_VTC_EXCHANGE_LEDGER ?? DEFAULT_LEDGER);
  const records = await readLedger(ledgerPath);
  const priorDigest = records.at(-1)?.recordDigest ?? null;
  const closure = {
    schemaVersion: 'armitron.vtc.closure-receipt.v25',
    recordType: 'closure_receipt',
    receiptId: `CLOSE-${randomUUID()}`,
    envelopeId: envelopeRecord.envelopeId,
    arrivalReceiptId: arrivalReceipt.receiptId,
    createdAt: new Date().toISOString(),
    destinationReadbackConfirmed: input.destinationReadbackConfirmed === true,
    returnRouteRecorded: input.returnRouteRecorded === true,
    terminalState: input.destinationReadbackConfirmed === true && input.returnRouteRecorded === true ? 'CLOSED' : 'HANDOFF_REQUIRED',
    correctionOf: input.correctionOf ?? null,
    priorDigest
  };
  closure.recordDigest = sha256(canonical(closure));
  await appendLedger(ledgerPath, closure);
  return closure;
}

export function createCurrentEventPayload(input) {
  if (!input.sourceUrl || !input.headline || !input.observedAt) {
    throw new Error('Current-event payload requires sourceUrl, headline, and observedAt.');
  }
  return {
    headline: String(input.headline),
    sourceUrl: String(input.sourceUrl),
    publisher: input.publisher ?? null,
    eventOccurredAt: input.eventOccurredAt ?? null,
    observedAt: String(input.observedAt),
    factSummary: String(input.factSummary ?? ''),
    inference: input.inference ?? null,
    confidence: input.confidence ?? 'UNASSESSED',
    correctionReference: input.correctionReference ?? null
  };
}

export function createTradeProposalPayload(input) {
  return {
    instrument: String(input.instrument ?? ''),
    market: input.market ?? null,
    thesis: String(input.thesis ?? ''),
    side: input.side ?? 'UNSPECIFIED',
    quantity: input.quantity ?? null,
    priceOrLimit: input.priceOrLimit ?? null,
    timeInForce: input.timeInForce ?? null,
    riskBudget: input.riskBudget ?? null,
    simulationOnly: input.simulationOnly !== false,
    executionAuthority: 'JP_TARGET_SPECIFIC_REQUIRED',
    brokerProvider: input.brokerProvider ?? null,
    accountReference: input.accountReference ?? null
  };
}
