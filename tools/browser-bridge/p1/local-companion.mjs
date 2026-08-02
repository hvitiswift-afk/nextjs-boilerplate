#!/usr/bin/env node

// Human ↔ Agent Browser Bridge P1
// Concept origin and project direction: Justin Lee Rackham (JP), MATADATA.
// Digital Human is a consent-gated software composite of Digital Mind and
// Digital Body. It is not biological capture, mind-reading, legal identity
// transfer, automatic consent, or independent authority.

import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  appendBackwardLookingNote,
  generateNotesKey,
  readBackwardLookingNotes
} from "./secure-notes.mjs";
import { evaluatePressureIntent } from "./pressure-policy.mjs";

const DEFAULT_ENDPOINT = "http://127.0.0.1:9222";
const DEFAULT_MISSION = "examples/browser-bridge/github-enterprise-signup.mission.json";
const DEFAULT_RECEIPTS = ".browser-bridge/receipts/browser-bridge-p1.jsonl";
const DEFAULT_NOTES = ".browser-bridge/notes/backward-looking.enc.jsonl";
const DEFAULT_PROFILE = ".browser-bridge/chrome-profile";

const PROTECTED_CONTROL_PATTERN = /(pass(word|key)?|otp|2fa|mfa|captcha|human.?verification|liveness|biometric|signature|payment|card|cvv|cvc|recovery|legal|terms|consent|identity.?verification)/i;
const SECRET_AUTOCOMPLETE_PATTERN = /(current-password|new-password|one-time-code|cc-|webauthn)/i;

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const flags = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) {
      (flags._ ??= []).push(token);
      continue;
    }
    const key = token.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      index += 1;
    }
  }
  return { command, flags };
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isLoopbackHostname(hostname) {
  return ["127.0.0.1", "localhost", "::1", "[::1]"].includes(hostname);
}

function assertLoopbackEndpoint(endpoint) {
  const url = new URL(endpoint);
  if (!isLoopbackHostname(url.hostname)) {
    throw new Error(`Browser endpoint must be loopback-only; received ${url.hostname}.`);
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Browser endpoint must use HTTP or HTTPS on loopback.");
  }
  return url;
}

async function loadMission(path) {
  const text = await readFile(path, "utf8");
  const mission = JSON.parse(text);
  validateMission(mission);
  return { mission, text, hash: sha256(text) };
}

function validateMission(mission) {
  if (mission?.schemaVersion !== "browser-bridge.mission.v1") {
    throw new Error("Unsupported or missing browser mission schema.");
  }
  if (!mission.missionId || !mission.targetUrl || !Array.isArray(mission.allowedOrigins)) {
    throw new Error("Mission requires missionId, targetUrl, and allowedOrigins.");
  }
  const target = new URL(mission.targetUrl);
  if (!mission.allowedOrigins.includes(target.origin)) {
    throw new Error("Mission target origin is not allowlisted.");
  }
  if (!Array.isArray(mission.fields) || !Array.isArray(mission.humanOnlyGates)) {
    throw new Error("Mission requires fields and humanOnlyGates arrays.");
  }
  for (const field of mission.fields) {
    if (!field.key || !field.label) throw new Error("Every mission field requires key and label.");
    if (field.agentFillAllowed && field.protected === true) {
      throw new Error(`Protected field ${field.key} cannot permit agent fill.`);
    }
  }
}

function allowedOrigin(mission, candidateUrl) {
  const origin = new URL(candidateUrl).origin;
  if (!mission.allowedOrigins.includes(origin)) {
    throw new Error(`Origin ${origin} is outside the mission allowlist.`);
  }
  return origin;
}

function runtimeFieldValue(field, env = process.env) {
  if (!field.agentFillAllowed) return { available: false, reason: "agent-fill-disabled" };
  if (Object.hasOwn(field, "publicValue")) {
    return { available: true, value: String(field.publicValue), source: "reviewed-public-value" };
  }
  if (Array.isArray(field.candidateValues) && field.candidateValues.length > 0) {
    return { available: true, value: String(field.candidateValues[0]), source: "reviewed-candidate-value" };
  }
  if (field.privateRuntimeSource) {
    const value = env[field.privateRuntimeSource];
    if (!value) return { available: false, reason: `missing-runtime-source:${field.privateRuntimeSource}` };
    return { available: true, value: String(value), source: `runtime:${field.privateRuntimeSource}` };
  }
  return { available: false, reason: "no-value-source" };
}

async function appendReceipt(path, receipt) {
  await mkdir(dirname(path), { recursive: true });
  const record = {
    schemaVersion: "browser-bridge.receipt.v1",
    createdAt: new Date().toISOString(),
    ...receipt
  };
  record.digest = sha256(JSON.stringify(record));
  await appendFile(path, `${JSON.stringify(record)}\n`, { mode: 0o600 });
  return record;
}

async function prompt(message) {
  const readline = createInterface({ input, output });
  try {
    return await readline.question(message);
  } finally {
    readline.close();
  }
}

async function readStdinText() {
  let text = "";
  for await (const chunk of input) text += chunk;
  return text;
}

class CdpPage {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.socket = null;
  }

  async connect() {
    if (typeof WebSocket === "undefined") {
      throw new Error("Node.js 22+ with global WebSocket support is required.");
    }
    this.socket = new WebSocket(this.webSocketUrl);
    await new Promise((resolveOpen, rejectOpen) => {
      const timer = setTimeout(() => rejectOpen(new Error("Timed out connecting to Chrome DevTools.")), 10_000);
      this.socket.addEventListener("open", () => {
        clearTimeout(timer);
        resolveOpen();
      }, { once: true });
      this.socket.addEventListener("error", () => {
        clearTimeout(timer);
        rejectOpen(new Error("Chrome DevTools WebSocket connection failed."));
      }, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`${message.error.message} (${message.error.code})`));
      else waiter.resolve(message.result ?? {});
    });
    await this.call("Page.enable");
    await this.call("Runtime.enable");
  }

  call(method, params = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Chrome DevTools socket is not open.");
    }
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolveCall, rejectCall) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        rejectCall(new Error(`Chrome DevTools call timed out: ${method}`));
      }, 15_000);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolveCall(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          rejectCall(error);
        }
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.call("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: false
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Page evaluation failed.");
    }
    return result.result?.value;
  }

  async navigate(url) {
    await this.call("Page.navigate", { url });
    await new Promise((resolveWait) => setTimeout(resolveWait, 1_200));
  }

  async currentUrl() {
    return this.evaluate("location.href");
  }

  close() {
    this.socket?.close();
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.json();
}

async function connectPage(endpoint, targetUrl, { create = true } = {}) {
  const endpointUrl = assertLoopbackEndpoint(endpoint);
  const root = endpointUrl.toString().replace(/\/$/, "");
  let targets = await fetchJson(`${root}/json/list`);
  let target = targets.find((item) => item.type === "page" && item.url && new URL(item.url).origin === new URL(targetUrl).origin);

  if (!target && create) {
    const createUrl = `${root}/json/new?${encodeURIComponent(targetUrl)}`;
    target = await fetchJson(createUrl, { method: "PUT" });
  }
  if (!target?.webSocketDebuggerUrl) {
    throw new Error("No usable Chrome page target was found.");
  }

  const page = new CdpPage(target.webSocketDebuggerUrl);
  await page.connect();
  return page;
}

function discoveryExpression() {
  return `(() => {
    const protectedPattern = ${PROTECTED_CONTROL_PATTERN};
    const secretAutocompletePattern = ${SECRET_AUTOCOMPLETE_PATTERN};
    const controls = Array.from(document.querySelectorAll('input, select, textarea, [contenteditable="true"]'));
    const labelText = (element) => {
      const direct = element.labels ? Array.from(element.labels).map((item) => item.innerText).join(' ') : '';
      const aria = element.getAttribute('aria-label') || '';
      const labelledBy = (element.getAttribute('aria-labelledby') || '').split(/\\s+/).filter(Boolean)
        .map((id) => document.getElementById(id)?.innerText || '').join(' ');
      const parent = element.closest('label')?.innerText || '';
      const placeholder = element.getAttribute('placeholder') || '';
      return [direct, aria, labelledBy, parent, placeholder].filter(Boolean).join(' ').replace(/\\s+/g, ' ').trim().slice(0, 240);
    };
    return controls.map((element, index) => {
      const type = (element.getAttribute('type') || element.tagName.toLowerCase()).toLowerCase();
      const name = element.getAttribute('name') || '';
      const id = element.id || '';
      const autocomplete = element.getAttribute('autocomplete') || '';
      const label = labelText(element);
      const combined = [type, name, id, autocomplete, label].join(' ');
      const protectedControl = type === 'password' || protectedPattern.test(combined) || secretAutocompletePattern.test(autocomplete);
      const rawValue = 'value' in element ? String(element.value || '') : String(element.textContent || '');
      return {
        index,
        tag: element.tagName.toLowerCase(),
        type,
        name,
        id,
        autocomplete,
        label,
        protected: protectedControl,
        disabled: Boolean(element.disabled),
        required: Boolean(element.required),
        valuePresent: rawValue.length > 0,
        valueLength: protectedControl ? null : rawValue.length
      };
    });
  })()`;
}

function fillExpression(field, value) {
  const payload = JSON.stringify({
    key: field.key,
    label: field.label,
    aliases: field.matchAliases ?? [],
    value
  });
  return `(() => {
    const request = ${payload};
    const protectedPattern = ${PROTECTED_CONTROL_PATTERN};
    const secretAutocompletePattern = ${SECRET_AUTOCOMPLETE_PATTERN};
    const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const labelText = (element) => {
      const direct = element.labels ? Array.from(element.labels).map((item) => item.innerText).join(' ') : '';
      const aria = element.getAttribute('aria-label') || '';
      const labelledBy = (element.getAttribute('aria-labelledby') || '').split(/\\s+/).filter(Boolean)
        .map((id) => document.getElementById(id)?.innerText || '').join(' ');
      const parent = element.closest('label')?.innerText || '';
      const placeholder = element.getAttribute('placeholder') || '';
      return [direct, aria, labelledBy, parent, placeholder].filter(Boolean).join(' ').replace(/\\s+/g, ' ').trim();
    };
    const requestedTokens = [request.key, request.label, ...request.aliases].map(normalize).filter(Boolean);
    const controls = Array.from(document.querySelectorAll('input, select, textarea, [contenteditable="true"]'));
    const candidates = controls.map((element, index) => {
      const type = (element.getAttribute('type') || element.tagName.toLowerCase()).toLowerCase();
      const name = element.getAttribute('name') || '';
      const id = element.id || '';
      const autocomplete = element.getAttribute('autocomplete') || '';
      const label = labelText(element);
      const haystack = normalize([type, name, id, autocomplete, label].join(' '));
      const protectedControl = type === 'password' || protectedPattern.test([type, name, id, autocomplete, label].join(' ')) || secretAutocompletePattern.test(autocomplete);
      let score = 0;
      for (const token of requestedTokens) {
        if (!token) continue;
        if (normalize(name) === token || normalize(id) === token) score += 100;
        else if (haystack === token) score += 80;
        else if (haystack.includes(token)) score += 40;
        else {
          const words = token.split(' ').filter((word) => word.length > 2);
          score += words.filter((word) => haystack.includes(word)).length * 4;
        }
      }
      return { element, index, type, name, id, label, protectedControl, score };
    }).filter((candidate) => candidate.score > 0).sort((a, b) => b.score - a.score);

    if (!candidates.length) return { status: 'not-found', key: request.key };
    if (candidates.length > 1 && candidates[0].score === candidates[1].score) {
      return { status: 'ambiguous', key: request.key, topScore: candidates[0].score, candidateCount: candidates.length };
    }
    const candidate = candidates[0];
    const element = candidate.element;
    if (candidate.protectedControl) return { status: 'protected', key: request.key };
    if (element.disabled) return { status: 'disabled', key: request.key };

    const setNativeValue = (target, nextValue) => {
      const prototype = target instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      if (descriptor?.set) descriptor.set.call(target, nextValue);
      else target.value = nextValue;
    };

    if (element instanceof HTMLSelectElement) {
      const requested = normalize(request.value);
      const option = Array.from(element.options).find((item) => normalize(item.value) === requested || normalize(item.textContent) === requested)
        || Array.from(element.options).find((item) => normalize(item.textContent).includes(requested));
      if (!option) return { status: 'option-not-found', key: request.key };
      element.value = option.value;
    } else if (element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)) {
      const requested = normalize(request.value);
      const own = normalize([element.value, candidate.label, element.name, element.id].join(' '));
      if (element.type === 'radio' && requested && !own.includes(requested)) {
        const group = Array.from(document.querySelectorAll('input[type="radio"]')).filter((item) => item.name === element.name);
        const groupMatch = group.find((item) => normalize([item.value, labelText(item), item.id].join(' ')).includes(requested));
        if (!groupMatch) return { status: 'radio-option-not-found', key: request.key };
        groupMatch.checked = true;
        groupMatch.dispatchEvent(new Event('input', { bubbles: true }));
        groupMatch.dispatchEvent(new Event('change', { bubbles: true }));
        return { status: 'filled', key: request.key, control: 'radio', matchedBy: candidate.score };
      }
      element.checked = !['false', '0', 'no', 'off'].includes(requested);
    } else if (element.isContentEditable) {
      element.textContent = request.value;
    } else {
      setNativeValue(element, request.value);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    const liveValue = element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)
      ? String(element.checked)
      : String(element.value ?? element.textContent ?? '');
    return {
      status: 'filled',
      key: request.key,
      control: element.tagName.toLowerCase(),
      matchedBy: candidate.score,
      normalizedLength: normalize(liveValue).length
    };
  })()`;
}

function confirmationExpression(signals = {}) {
  const payload = JSON.stringify({
    urlIncludes: signals.urlIncludes ?? ["/enterprises/"],
    textIncludes: signals.textIncludes ?? ["enterprise"],
    rejectTextIncludes: signals.rejectTextIncludes ?? ["error", "could not create"]
  });
  return `(() => {
    const signals = ${payload};
    const url = location.href;
    const text = (document.body?.innerText || '').replace(/\\s+/g, ' ').slice(0, 20000).toLowerCase();
    const positiveUrl = signals.urlIncludes.some((item) => url.toLowerCase().includes(String(item).toLowerCase()));
    const positiveText = signals.textIncludes.every((item) => text.includes(String(item).toLowerCase()));
    const rejected = signals.rejectTextIncludes.some((item) => text.includes(String(item).toLowerCase()));
    return { confirmed: Boolean(positiveUrl && positiveText && !rejected), positiveUrl, positiveText, rejected, url };
  })()`;
}

async function doctor({ missionPath, endpoint, strictRuntime = true }) {
  const result = {
    node: process.version,
    nodeMajor: Number(process.versions.node.split(".")[0]),
    endpoint,
    loopback: false,
    missionValid: false,
    chromeReachable: false,
    runtimeFields: [],
    pass: false
  };
  if (result.nodeMajor < 22) throw new Error("Node.js 22 or newer is required.");
  assertLoopbackEndpoint(endpoint);
  result.loopback = true;
  const loaded = await loadMission(missionPath);
  result.missionValid = true;
  result.missionId = loaded.mission.missionId;
  result.missionHash = loaded.hash;
  for (const field of loaded.mission.fields) {
    if (!field.agentFillAllowed) continue;
    const runtime = runtimeFieldValue(field);
    result.runtimeFields.push({ key: field.key, available: runtime.available, source: runtime.source ?? runtime.reason });
  }
  const missing = result.runtimeFields.filter((item) => !item.available);
  if (strictRuntime && missing.length) {
    throw new Error(`Missing runtime values: ${missing.map((item) => item.key).join(", ")}`);
  }
  const version = await fetchJson(`${endpoint.replace(/\/$/, "")}/json/version`);
  result.chromeReachable = Boolean(version.Browser && version.webSocketDebuggerUrl);
  result.browser = version.Browser;
  result.pass = result.loopback && result.missionValid && result.chromeReachable && (!strictRuntime || missing.length === 0);
  return result;
}

async function discover({ missionPath, endpoint }) {
  const loaded = await loadMission(missionPath);
  const page = await connectPage(endpoint, loaded.mission.targetUrl);
  try {
    const currentUrl = await page.currentUrl();
    allowedOrigin(loaded.mission, currentUrl);
    const controls = await page.evaluate(discoveryExpression());
    return {
      missionId: loaded.mission.missionId,
      missionHash: loaded.hash,
      url: currentUrl,
      controls,
      protectedCount: controls.filter((item) => item.protected).length,
      ordinaryCount: controls.filter((item) => !item.protected).length
    };
  } finally {
    page.close();
  }
}

async function fillOrdinaryFields({ missionPath, endpoint, receiptsPath }) {
  const loaded = await loadMission(missionPath);
  const page = await connectPage(endpoint, loaded.mission.targetUrl);
  const results = [];
  try {
    const currentUrl = await page.currentUrl();
    const origin = allowedOrigin(loaded.mission, currentUrl);
    for (const field of loaded.mission.fields) {
      const runtime = runtimeFieldValue(field);
      if (!runtime.available) {
        results.push({ key: field.key, status: "skipped", reason: runtime.reason });
        continue;
      }
      if (field.protected || PROTECTED_CONTROL_PATTERN.test(`${field.key} ${field.label}`)) {
        results.push({ key: field.key, status: "protected" });
        continue;
      }
      const result = await page.evaluate(fillExpression(field, runtime.value));
      results.push({ ...result, valueSource: runtime.source });
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
    const receipt = await appendReceipt(receiptsPath, {
      missionId: loaded.mission.missionId,
      missionHash: loaded.hash,
      state: "ORDINARY_FIELDS_PROCESSED",
      url: currentUrl,
      origin,
      filledKeys: results.filter((item) => item.status === "filled").map((item) => item.key),
      blockedKeys: results.filter((item) => item.status !== "filled").map((item) => item.key),
      valuesStored: false
    });
    return { results, receipt };
  } finally {
    page.close();
  }
}

async function runMission({ missionPath, endpoint, receiptsPath }) {
  const loaded = await loadMission(missionPath);
  const doctorResult = await doctor({ missionPath, endpoint, strictRuntime: true });
  console.log(JSON.stringify({ phase: "doctor", ...doctorResult }, null, 2));

  const page = await connectPage(endpoint, loaded.mission.targetUrl);
  try {
    await page.navigate(loaded.mission.targetUrl);
    let currentUrl = await page.currentUrl();
    let origin = allowedOrigin(loaded.mission, currentUrl);
    await appendReceipt(receiptsPath, {
      missionId: loaded.mission.missionId,
      missionHash: loaded.hash,
      state: "NAVIGATED",
      url: currentUrl,
      origin,
      valuesStored: false
    });

    console.log("\nHUMAN HANDOFF 1");
    console.log("JP: complete GitHub sign-in, passkey/password, MFA, CAPTCHA, recovery, or identity checks personally.");
    await prompt("Press Enter only after the authenticated GitHub Enterprise signup form is visible... ");

    currentUrl = await page.currentUrl();
    origin = allowedOrigin(loaded.mission, currentUrl);
    const controls = await page.evaluate(discoveryExpression());
    console.log(JSON.stringify({
      phase: "authenticated-discovery",
      url: currentUrl,
      ordinaryControls: controls.filter((item) => !item.protected).length,
      protectedControls: controls.filter((item) => item.protected).length,
      controls
    }, null, 2));

    const fillResults = [];
    for (const field of loaded.mission.fields) {
      const runtime = runtimeFieldValue(field);
      if (!runtime.available) {
        fillResults.push({ key: field.key, status: "skipped", reason: runtime.reason });
        continue;
      }
      if (field.protected || PROTECTED_CONTROL_PATTERN.test(`${field.key} ${field.label}`)) {
        fillResults.push({ key: field.key, status: "protected" });
        continue;
      }
      fillResults.push({
        ...(await page.evaluate(fillExpression(field, runtime.value))),
        valueSource: runtime.source
      });
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }

    await appendReceipt(receiptsPath, {
      missionId: loaded.mission.missionId,
      missionHash: loaded.hash,
      state: "FILLED_AWAITING_HUMAN_REVIEW",
      url: currentUrl,
      origin,
      filledKeys: fillResults.filter((item) => item.status === "filled").map((item) => item.key),
      blockedKeys: fillResults.filter((item) => item.status !== "filled").map((item) => item.key),
      valuesStored: false
    });
    console.log(JSON.stringify({ phase: "ordinary-field-fill", results: fillResults }, null, 2));

    console.log("\nHUMAN HANDOFF 2");
    console.log("JP: review every value. Personally accept any legal terms, choose payment/trial options, and perform the final Create action.");
    console.log("The companion will not click a protected or legally consequential control.");
    await prompt("After GitHub shows a confirmation or enterprise settings page, press Enter for readback... ");

    currentUrl = await page.currentUrl();
    origin = allowedOrigin(loaded.mission, currentUrl);
    const confirmation = await page.evaluate(confirmationExpression(loaded.mission.confirmationSignals));
    const state = confirmation.confirmed ? "CONFIRMED" : "SUBMISSION_STATUS_UNKNOWN";
    const finalReceipt = await appendReceipt(receiptsPath, {
      missionId: loaded.mission.missionId,
      missionHash: loaded.hash,
      state,
      url: currentUrl,
      origin,
      confirmation,
      exactlyOnceActionCountClaimed: confirmation.confirmed ? 1 : null,
      blindRetryAllowed: false,
      valuesStored: false
    });
    console.log(JSON.stringify({ phase: "provider-readback", state, confirmation, finalReceipt }, null, 2));
    if (!confirmation.confirmed) process.exitCode = 2;
  } finally {
    page.close();
  }
}

async function launchChrome({ endpoint, chromePath, profilePath }) {
  const endpointUrl = assertLoopbackEndpoint(endpoint);
  const port = endpointUrl.port || "9222";
  const executable = chromePath || process.env.JP_CHROME_PATH;
  if (!executable) {
    throw new Error("Provide --chrome-path or set JP_CHROME_PATH. The companion never guesses an executable path.");
  }
  const profile = resolve(profilePath || DEFAULT_PROFILE);
  await mkdir(profile, { recursive: true });
  const child = spawn(executable, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
  ], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
  return { pid: child.pid, endpoint, profile, executable };
}

function help() {
  return `Human ↔ Agent Browser Bridge P1\n\nCommands:\n  launch       Start a dedicated local Chrome profile with loopback CDP.\n  doctor       Validate mission, runtime values, and Chrome connectivity.\n  discover     Print redacted live controls; secret values are never read.\n  fill         Fill and verify ordinary mission fields only.\n  run          Human sign-in → ordinary fill → human final gate → readback.\n  pressure     Evaluate a MATADATA pressure intent.\n  notes-key    Generate a base64 32-byte local notes key.\n  note         Encrypt a backward-looking note read from stdin.\n  read-notes   Decrypt backward-looking notes locally.\n\nCommon flags:\n  --mission ${DEFAULT_MISSION}\n  --endpoint ${DEFAULT_ENDPOINT}\n  --receipts ${DEFAULT_RECEIPTS}\n  --notes ${DEFAULT_NOTES}\n\nSensitive values belong in runtime environment variables, never mission files,\nlogs, screenshots, issue comments, or receipts.`;
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const missionPath = String(flags.mission || DEFAULT_MISSION);
  const endpoint = String(flags.endpoint || DEFAULT_ENDPOINT).replace(/\/$/, "");
  const receiptsPath = String(flags.receipts || DEFAULT_RECEIPTS);
  const notesPath = String(flags.notes || DEFAULT_NOTES);

  switch (command) {
    case "launch":
      console.log(JSON.stringify(await launchChrome({
        endpoint,
        chromePath: flags["chrome-path"],
        profilePath: flags.profile
      }), null, 2));
      break;
    case "doctor":
      console.log(JSON.stringify(await doctor({
        missionPath,
        endpoint,
        strictRuntime: !flags["allow-missing-runtime"]
      }), null, 2));
      break;
    case "discover":
      console.log(JSON.stringify(await discover({ missionPath, endpoint }), null, 2));
      break;
    case "fill":
      console.log(JSON.stringify(await fillOrdinaryFields({ missionPath, endpoint, receiptsPath }), null, 2));
      break;
    case "run":
      await runMission({ missionPath, endpoint, receiptsPath });
      break;
    case "pressure":
      console.log(JSON.stringify(evaluatePressureIntent({
        pressure: flags.level || flags.pressure || "1/128",
        targetCategory: flags.category || "ordinary",
        stableForMs: Number(flags["stable-ms"] || 0),
        released: Boolean(flags.released)
      }), null, 2));
      break;
    case "notes-key":
      console.log(generateNotesKey());
      break;
    case "note": {
      const loaded = await loadMission(missionPath);
      const text = await readStdinText();
      const result = await appendBackwardLookingNote({
        path: notesPath,
        missionId: loaded.mission.missionId,
        text,
        truthState: String(flags.state || "RETROSPECTIVE_UNVERIFIED"),
        evidence: String(flags.evidence || "").split(",").map((item) => item.trim()).filter(Boolean)
      });
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case "read-notes":
      console.log(JSON.stringify(await readBackwardLookingNotes({ path: notesPath }), null, 2));
      break;
    case "help":
    default:
      console.log(help());
      if (command !== "help") process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({
    status: "BLOCKED",
    error: error instanceof Error ? error.message : String(error),
    blindRetryAllowed: false
  }, null, 2));
  process.exitCode = 1;
});
