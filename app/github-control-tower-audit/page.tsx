import type { Metadata } from "next";

import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json";
import fardarterDrive from "@/receipts/revenue/FARDARTER-DRIVE-V6.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import capacityOverride from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json";
import publicationReceipt from "@/receipts/revenue/JP-REV-001-PUBLICATION.json";
import {
  getPublicAuditInterest,
  publicAuditRequestsUrl,
} from "@/lib/revenue/public-audit-interest";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 900;

const canonicalUrl = `${getSiteUrl()}/github-control-tower-audit`;
const requestUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/new?template=control-tower-audit-request.yml";
const issueUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/133";
const controlIssueUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/151";

export const metadata: Metadata = {
  title: "GitHub Control Tower Audit + Fardarter Drive™ v6 | JP Systems",
  description:
    "A $100 fixed-scope GitHub repository audit with 1,000 total slots, 100 standard ACTIVE deliveries, receipted above-100 capacity, nonbinding fit acceptance, one-shot execution, and private Google Drive continuity.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "GitHub Control Tower Audit + Fardarter Drive™ v6",
    description:
      "1,000 total planning slots, a 100-ACTIVE standard ceiling, allowed receipted capacity overrides, and evidence-first commercial boundaries.",
    type: "website",
    url: canonicalUrl,
  },
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatScaleUsd = (amountUsd: string) =>
  `$${amountUsd.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const faqItems = [
  {
    question: "What can automation accept?",
    answer:
      "A qualifying controlled request may enter FIT_APPROVED_FOR_SCOPE_DRAFT. This is nonbinding and does not create an order, reservation, contract, invoice, payment obligation, deadline, indemnity agreement, or paid work start.",
  },
  {
    question: "What is the standard capacity?",
    answer:
      "Fardarter Drive v6 provides 1,000 total slots with 100 standard ACTIVE deliveries. New starts pause at the effective active ceiling while intake and drafting may continue.",
  },
  {
    question: "Can active capacity go above 100?",
    answer:
      "Above 100 is allowed, but only through a complete receipted override. The override must record the exact ceiling, readiness, scope, expiration or review point, backpressure, rollback, and authorization. The baseline remains INACTIVE_NO_RECEIPT.",
  },
  {
    question: "What can automation execute?",
    answer:
      "One-shot execution may run approved validation, builds, receipts, private Drive drafting, read-only analysis, and capacity-headroom checks. It cannot silently activate an override or create a commercial or financial state.",
  },
  {
    question: "Is Google Drive public?",
    answer:
      "No. Google Drive continuity is CONNECTED_PRIVATE. Public records name document titles and status only; private URLs, IDs, identities, signatures, provider receipts, counsel notes, and readiness evidence stay private.",
  },
  {
    question: "Is the package indemnity-proof?",
    answer:
      "No. The package is indemnity- and liability-ready for counsel review, but it is not indemnity-proof and does not guarantee enforceability or outcomes.",
  },
] as const;

export default async function GitHubControlTowerAuditPage() {
  const publicInterest = await getPublicAuditInterest();
  const { offer, metrics, money, status, experimentId } = experiment;
  const slotsRemaining = Math.max(offer.capacity - metrics.orders, 0);
  const standardActiveCeiling = fardarterDrive.capacityModel.standardActiveCeiling;
  const effectiveActiveCeiling = fardarterDrive.capacityModel.effectiveActiveCeiling;
  const activeDeliveries = fardarterDrive.currentEvidence.activeDeliveries;
  const activeHeadroom = Math.max(effectiveActiveCeiling - activeDeliveries, 0);
  const backpressureActive = activeDeliveries >= effectiveActiveCeiling;
  const publicRequestValue =
    publicInterest.publicRequestCount === null
      ? "Unavailable"
      : String(publicInterest.publicRequestCount);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: offer.name,
      description:
        "A fixed-scope GitHub repository operations audit with evidence-gated acceptance, capacity, and execution.",
      url: canonicalUrl,
      offers: {
        "@type": "Offer",
        price: String(offer.priceUsd),
        priceCurrency: "USD",
        availability:
          slotsRemaining > 0
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/OutOfStock",
        inventoryLevel: {
          "@type": "QuantitativeValue",
          value: slotsRemaining,
        },
        url: requestUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/">
            JP Systems
          </a>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-cyan-100" href={issueUrl}>
              Public offer #{publicationReceipt.issueNumber}
            </a>
            <a className="transition hover:text-cyan-100" href={controlIssueUrl}>
              v6 control #151
            </a>
            <a className="transition hover:text-cyan-100" href={publicAuditRequestsUrl}>
              Public fit checks
            </a>
            <a className="transition hover:text-cyan-100" href="/api/revenue/pilot">
              JSON status
            </a>
          </div>
        </nav>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              {status} • Fardarter Drive™ v6 • {slotsRemaining} of {offer.capacity.toLocaleString("en-US")} total slots available
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              Scale the queue while every consequential state remains receipted.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              A fixed-scope GitHub operations audit with 1,000 total slots, 100 standard ACTIVE deliveries, nonbinding fit acceptance, one-shot execution, private Google Drive continuity, and an explicit capacity-override rail.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-cyan-200 px-6 py-3 font-bold text-black" href={requestUrl}>
                Request a public-safe fit check
              </a>
              <a className="rounded-full border border-white/20 px-6 py-3 font-bold" href={controlIssueUrl}>
                Review v6 authority
              </a>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/45">
              A request may enter FIT_APPROVED_FOR_SCOPE_DRAFT after bounded checks. That state is nonbinding and creates no order, reservation, contract, invoice, payment obligation, deadline, indemnity agreement, waiver, release, or paid work start.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.055] p-7 shadow-2xl shadow-cyan-950/40">
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/65">Current evidence</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-black text-cyan-100">{usd.format(offer.priceUsd)}</p>
                <p className="mt-2 text-white/55">per separately accepted scope</p>
              </div>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-xs text-white/60">
                {experimentId}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Slots left" value={`${slotsRemaining.toLocaleString("en-US")}/${offer.capacity.toLocaleString("en-US")}`} />
              <Metric label="100 standard ACTIVE" value={`${activeDeliveries}/${standardActiveCeiling}`} />
              <Metric label="Effective ceiling" value={String(effectiveActiveCeiling)} />
              <Metric label="Active headroom" value={String(activeHeadroom)} />
              <Metric label="Fit-approved" value={String(fardarterDrive.currentEvidence.fitApprovedRequests)} />
              <Metric label="Orders" value={String(metrics.orders)} />
              <Metric label="Public fit checks" value={publicRequestValue} />
              <Metric label="Current gross" value={usd.format(money.grossRevenueUsd)} />
              <Metric label="Settled cash" value={usd.format(money.netCashUsd)} />
              <Metric label="Gross capacity target" value={usd.format(offer.grossTargetUsd)} />
              <Metric label="Backpressure" value={backpressureActive ? "ACTIVE" : "OPEN"} />
              <Metric label="Override" value={capacityOverride.state} />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/60">
              <strong className="text-white">Authority v{authorityReceipt.authorityVersion}:</strong>{" "}
              1,000 total slots and the 100-ACTIVE standard ceiling are active. Above 100 is allowed through a complete receipted override. Current override state: INACTIVE_NO_RECEIPT.
            </div>
          </aside>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <StateCard
            title="Automated acceptance"
            state="FIT_APPROVED_FOR_SCOPE_DRAFT"
            text="A qualifying request may enter private scope drafting. It remains nonbinding and does not reserve capacity or begin paid work."
          />
          <StateCard
            title="One-shot execution"
            state={fardarterDrive.executionModel.state}
            text="Approved validation, builds, receipts, private drafting, read-only analysis, and headroom checks may execute once per controlling issue."
          />
          <StateCard
            title="Google Drive continuity"
            state={googleDriveReceipt.state}
            text="CONNECTED_PRIVATE records retain work packages and restricted capacity evidence without publishing private Drive references."
          />
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-200">Capacity override</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-3xl font-black">Above 100 is allowed—never silently.</h2>
              <p className="mt-4 leading-7 text-white/60">
                The standard effective ceiling is 100. A complete approval receipt may target CAPACITY_OVERRIDE_ACTIVE with an exact ceiling from 101 through 1,000. Approval alone is APPROVED_NOT_ACTIVE; canonical activation must be merged and independently read back.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Boundary label="Current override state" value="INACTIVE_NO_RECEIPT" />
              <Boundary label="Activation target" value="CAPACITY_OVERRIDE_ACTIVE" />
              <Boundary label="Automatic activation" value="FALSE" />
              <Boundary label="May exceed total 1,000" value="FALSE" />
              <Boundary label="Rollback ceiling" value={String(capacityOverride.backpressure.rollbackCeiling)} />
              <Boundary label="Capacity proves revenue" value="FALSE" />
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-200">Scale horizons</p>
          <h2 className="mt-3 text-3xl font-black">Planning targets—not achieved revenue</h2>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            The current gross capacity target is $100,000. The $1 million, $1 billion, $1 trillion, and $1 quadrillion values remain unachieved, nonforecast, and nonguaranteed. Automatic stage promotion is prohibited.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fardarterDrive.horizons.map((horizon) => (
              <article key={horizon.stageId} className="rounded-3xl border border-fuchsia-200/15 bg-fuchsia-200/[0.035] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-fuchsia-200/70">{horizon.stageId}</span>
                  <span className="rounded-full bg-black/30 px-2 py-1 text-xs text-white/45">not achieved</span>
                </div>
                <p className="mt-4 text-2xl font-black text-fuchsia-100">{formatScaleUsd(horizon.amountUsd)}</p>
                <p className="mt-2 text-sm text-white/55">{horizon.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-amber-200">Commercial and legal boundary</p>
          <h2 className="mt-3 text-3xl font-black">Preparation can automate; consequences stay evidenced.</h2>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            Final contract acceptance, payment, paid delivery start, refunds, disputes, admissions, waivers, releases, banking, billing, domains, credentials, access controls, and destructive external actions remain independently gated. Indemnity and liability language remains counsel-reviewed and not indemnity-proof.
          </p>
        </section>

        <section className="border-t border-white/10 py-12">
          <h2 className="text-3xl font-black">Frequently asked questions</h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
                <summary className="cursor-pointer font-bold text-white/85">{item.question}</summary>
                <p className="mt-4 text-sm leading-6 text-white/60">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-2 break-words font-bold text-white/85">{value}</p>
    </div>
  );
}

function StateCard({ title, state, text }: { title: string; state: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <h2 className="text-xl font-black text-cyan-100">{title}</h2>
      <p className="mt-3 break-words font-mono text-xs text-fuchsia-200">{state}</p>
      <p className="mt-4 text-sm leading-6 text-white/60">{text}</p>
    </article>
  );
}

function Boundary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-3 break-words font-mono text-sm font-bold text-cyan-100">{value}</p>
    </div>
  );
}
