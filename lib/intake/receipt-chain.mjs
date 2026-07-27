import { sha256, stableJson } from "./contract.mjs";

const ZERO_HASH = "0".repeat(64);

export class ReceiptChain {
  #entries = [];
  #head = ZERO_HASH;

  append(type, data = {}, at = new Date().toISOString()) {
    if (!type || typeof type !== "string") throw new Error("A receipt event type is required.");
    const body = {
      index: this.#entries.length,
      at,
      type,
      data,
      previousHash: this.#head,
    };
    const hash = sha256(stableJson(body));
    const entry = Object.freeze({ ...body, hash });
    this.#entries.push(entry);
    this.#head = hash;
    return structuredClone(entry);
  }

  verify() {
    let previousHash = ZERO_HASH;
    const failures = [];
    this.#entries.forEach((entry, index) => {
      const body = {
        index: entry.index,
        at: entry.at,
        type: entry.type,
        data: entry.data,
        previousHash: entry.previousHash,
      };
      const expectedHash = sha256(stableJson(body));
      if (entry.index !== index) failures.push({ index, code: "INDEX_MISMATCH" });
      if (entry.previousHash !== previousHash) failures.push({ index, code: "PREVIOUS_HASH_MISMATCH" });
      if (entry.hash !== expectedHash) failures.push({ index, code: "ENTRY_HASH_MISMATCH" });
      previousHash = entry.hash;
    });
    return {
      ok: failures.length === 0,
      entryCount: this.#entries.length,
      head: this.#head,
      failures,
    };
  }

  snapshot() {
    return {
      algorithm: "sha256(stable-json(event))",
      seed: ZERO_HASH,
      head: this.#head,
      entries: this.#entries.map((entry) => structuredClone(entry)),
    };
  }
}
