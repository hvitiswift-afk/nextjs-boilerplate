import { setTimeout as delay } from "node:timers/promises";

function mapSubmission(row) {
  if (!row) return null;
  return {
    key: row.idempotency_key,
    payloadDigest: row.payload_digest,
    state: row.state,
    submissionActions: Number(row.submission_actions),
    readinessDigest: row.readiness_digest,
    referenceId: row.reference_id,
    confirmationDigest: row.confirmation_digest,
    evidence: row.evidence,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    version: Number(row.version),
  };
}

function mapReceiptEvent(row) {
  if (!row) return null;
  return {
    idempotencyKey: row.idempotency_key,
    sequence: Number(row.sequence),
    at: new Date(row.created_at).toISOString(),
    type: row.event_type,
    data: row.event_data,
    previousHash: row.previous_hash,
    hash: row.event_hash,
  };
}

function createTransaction(client) {
  return {
    async insertSubmissionIfAbsent(record) {
      const result = await client.query(
        `insert into matadata_intake_submissions (
           idempotency_key, payload_digest, state, submission_actions, readiness_digest,
           reference_id, confirmation_digest, evidence, created_at, updated_at, version
         ) values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)
         on conflict (idempotency_key) do nothing
         returning idempotency_key`,
        [
          record.key,
          record.payloadDigest,
          record.state,
          record.submissionActions,
          record.readinessDigest,
          record.referenceId,
          record.confirmationDigest,
          record.evidence == null ? null : JSON.stringify(record.evidence),
          record.createdAt,
          record.updatedAt,
          record.version,
        ],
      );
      return result.rowCount === 1;
    },

    async getSubmissionForUpdate(key) {
      const result = await client.query(
        `select * from matadata_intake_submissions
         where idempotency_key = $1
         for update`,
        [key],
      );
      return mapSubmission(result.rows[0]);
    },

    async updateSubmission(record, expectedVersion) {
      const result = await client.query(
        `update matadata_intake_submissions
         set state = $2,
             submission_actions = $3,
             readiness_digest = $4,
             reference_id = $5,
             confirmation_digest = $6,
             evidence = $7::jsonb,
             updated_at = $8,
             version = $9
         where idempotency_key = $1 and version = $10
         returning *`,
        [
          record.key,
          record.state,
          record.submissionActions,
          record.readinessDigest,
          record.referenceId,
          record.confirmationDigest,
          record.evidence == null ? null : JSON.stringify(record.evidence),
          record.updatedAt,
          record.version,
          expectedVersion,
        ],
      );
      if (result.rowCount !== 1) {
        throw new Error(`Transactional version conflict for ${record.key}.`);
      }
      return mapSubmission(result.rows[0]);
    },

    async getLastReceiptEventForUpdate(key) {
      const result = await client.query(
        `select * from matadata_intake_receipt_events
         where idempotency_key = $1
         order by sequence desc
         limit 1
         for update`,
        [key],
      );
      return mapReceiptEvent(result.rows[0]);
    },

    async insertReceiptEvent(entry) {
      const result = await client.query(
        `insert into matadata_intake_receipt_events (
           idempotency_key, sequence, event_type, event_data,
           previous_hash, event_hash, created_at
         ) values ($1, $2, $3, $4::jsonb, $5, $6, $7)
         returning *`,
        [
          entry.idempotencyKey,
          entry.sequence,
          entry.type,
          JSON.stringify(entry.data || {}),
          entry.previousHash,
          entry.hash,
          entry.at,
        ],
      );
      return mapReceiptEvent(result.rows[0]);
    },
  };
}

export function createPostgresIntakeRepository(pool, { maxTransactionRetries = 3 } = {}) {
  if (!pool || typeof pool.connect !== "function" || typeof pool.query !== "function") {
    throw new Error("A pg-compatible Pool is required.");
  }

  return {
    async transact(callback) {
      for (let attempt = 1; attempt <= maxTransactionRetries; attempt += 1) {
        const client = await pool.connect();
        try {
          await client.query("begin isolation level serializable");
          const result = await callback(createTransaction(client));
          await client.query("commit");
          return result;
        } catch (error) {
          await client.query("rollback").catch(() => {});
          const retryable = error?.code === "40001" || error?.code === "40P01";
          if (!retryable || attempt === maxTransactionRetries) throw error;
          await delay(25 * attempt);
        } finally {
          client.release();
        }
      }
      throw new Error("The transactional retry loop exited unexpectedly.");
    },

    async getSubmission(key) {
      const result = await pool.query(
        `select * from matadata_intake_submissions where idempotency_key = $1`,
        [key],
      );
      return mapSubmission(result.rows[0]);
    },

    async getReceiptEvents(key) {
      const result = await pool.query(
        `select * from matadata_intake_receipt_events
         where idempotency_key = $1
         order by sequence asc`,
        [key],
      );
      return result.rows.map(mapReceiptEvent);
    },
  };
}
