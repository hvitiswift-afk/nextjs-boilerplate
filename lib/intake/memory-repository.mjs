function clone(value) {
  return value == null ? value : structuredClone(value);
}

function cloneMap(map) {
  return new Map([...map.entries()].map(([key, value]) => [key, clone(value)]));
}

export function createMemoryIntakeRepository() {
  let submissions = new Map();
  let events = new Map();
  let lock = Promise.resolve();

  async function transact(callback) {
    const previous = lock;
    let release;
    lock = new Promise((resolve) => {
      release = resolve;
    });
    await previous;

    const pendingSubmissions = cloneMap(submissions);
    const pendingEvents = cloneMap(events);
    const tx = {
      async insertSubmissionIfAbsent(record) {
        if (pendingSubmissions.has(record.key)) return false;
        pendingSubmissions.set(record.key, clone(record));
        return true;
      },
      async getSubmissionForUpdate(key) {
        return clone(pendingSubmissions.get(key) || null);
      },
      async updateSubmission(record, expectedVersion) {
        const current = pendingSubmissions.get(record.key);
        if (!current) throw new Error(`Unknown idempotency key: ${record.key}.`);
        if (current.version !== expectedVersion) {
          throw new Error(`Version conflict for ${record.key}: expected ${expectedVersion}, found ${current.version}.`);
        }
        pendingSubmissions.set(record.key, clone(record));
        return clone(record);
      },
      async getLastReceiptEventForUpdate(key) {
        const list = pendingEvents.get(key) || [];
        return clone(list.at(-1) || null);
      },
      async insertReceiptEvent(entry) {
        const list = pendingEvents.get(entry.idempotencyKey) || [];
        if (list.some((item) => item.sequence === entry.sequence)) {
          throw new Error(`Duplicate receipt sequence ${entry.sequence} for ${entry.idempotencyKey}.`);
        }
        list.push(clone(entry));
        pendingEvents.set(entry.idempotencyKey, list);
        return clone(entry);
      },
    };

    try {
      const result = await callback(tx);
      submissions = pendingSubmissions;
      events = pendingEvents;
      return clone(result);
    } finally {
      release();
    }
  }

  return {
    transact,
    async getSubmission(key) {
      await lock;
      return clone(submissions.get(key) || null);
    },
    async getReceiptEvents(key) {
      await lock;
      return clone(events.get(key) || []);
    },
    async snapshot() {
      await lock;
      return {
        submissions: [...submissions.values()].map(clone),
        receiptEvents: [...events.values()].flat().map(clone),
      };
    },
  };
}
