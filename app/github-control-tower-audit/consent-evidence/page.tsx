import Link from "next/link";

import { getCanonicalConsentEvidence } from "@/lib/revenue/canonical-consent-evidence";

export const dynamic = "force-dynamic";

const authorityBoundary = "System-development authorization is not buyer consent.";
const digestBoundary =
  "The digest alone does not prove consent, create an order, accept a contract, prove payment, start paid work, consume ACTIVE capacity, or append a canonical event.";

export default function ConsentEvidencePage() {
  const data = getCanonicalConsentEvidence();
  const missing = data.derived.missingRequiredEvidence;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Fardarter Drive™ v6.7
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Counterparty consent evidence attestation
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
        This surface reports evidence states without exposing buyer identity,
        signatures, private file references, or consent contents. {authorityBoundary}
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Package state", data.derived.packageState],
          ["Decision", data.derived.decision],
          ["Canonical head", String(data.canonical.eventHeadSequence)],
          ["Missing evidence", String(missing.length)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 break-words text-xl font-semibold">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold">Current decision</h2>
        <p className="mt-3 font-mono text-sm">AWAITING_COUNTERPARTY_EVIDENCE</p>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          No private package exists. Independent verification has not been performed,
          HUMAN_ACCEPTED remains zero, and canonical event 2 has not been appended.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold">Required private evidence</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.attestation.evidenceChecklist.map((item) => (
            <div key={item.evidenceId} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <p className="font-medium">{item.evidenceId}</p>
              <p className="mt-1 text-sm text-zinc-500">{item.state}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold">Attestation boundaries</h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          A public-safe attestation digest proves only that a metadata package was
          reviewed. {digestBoundary}
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-zinc-500">Manifest digest</dt>
            <dd className="mt-1 break-all font-mono text-sm">{data.manifest.manifestDigest}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Public attestation digest</dt>
            <dd className="mt-1 break-all font-mono text-sm">
              {data.attestation.publicSafeAttestation.attestationDigest}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold">Actual effects</h2>
        <p className="mt-3 font-mono text-sm">
          HUMAN_ACCEPTED 0 · orders 0 · ACTIVE 0 · gross $0 · settled $0
        </p>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Even a future independently verified package would remain noncanonical until
          a separate reviewed append-only merge and immutable readback.
        </p>
      </section>

      <nav className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link className="underline" href="/github-control-tower-audit/successor-readiness">
          Successor readiness
        </Link>
        <Link className="underline" href="/github-control-tower-audit/operations">
          Operations
        </Link>
        <Link className="underline" href="/api/revenue/consent-evidence">
          Consent evidence API
        </Link>
      </nav>
    </main>
  );
}
