import type { Metadata } from "next";

import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V5.json";
import fardarterDrive from "@/receipts/revenue/FARDARTER-DRIVE-V5.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V5.json";
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
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/146";

export const metadata: Metadata = {
  title: "GitHub Control Tower Audit + Fardarter Drive™ v5 | JP Systems",
  description:
    "A $100 fixed-scope GitHub repository audit with 100 total slots, a 10-active-delivery limit, nonbinding fit acceptance, bounded execution, and private Google Drive continuity.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "GitHub Control Tower Audit + Fardarter Drive™ v5",
    description:
      "Current evidence, nonbinding fit acceptance, bounded execution, private Drive continuity, and unachieved scale horizons.",
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
      "A qualifying controlled request may enter FIT_APPROVED_FOR_SCOPE_DRAFT. This is nonbinding and does not create an order, reservation, contract, invoice, payment obligation, deadline, indemnity agreement, or work start.",
  },
  {
    question: "What can automation execute?",
    answer:
      "It may run pre-approved reversible repository preparation, validators, production builds, receipts, private Google Drive work-package drafts, read-only analysis, and confirmed-target deployment after validation and immutable readback.",
  },
  {
    question: "How do 100 total slots and 10 active deliveries work?",
    answer:
      "One hundred is the planning envelope. No more than 10 deliveries may be ACTIVE. New work starts pause automatically at the active limit while intake, fit review, and draft preparation may continue.",
  },
  {
    question: "Is Google Drive public?",
    answer:
      "No. Google Drive continuity is CONNECTED_PRIVATE. Public GitHub records may name the private folder and document titles, but do not publish Drive URLs, file IDs, buyer identities, signatures, provider receipts, counsel notes, or confidential delivery records.",
  },
  {
    question: "Is the system indemnity-proof?",
    answer:
      "No. It is indemnity- and liability-ready for counsel review, but it is not indemnity-proof. Final terms depend on verified parties, facts, jurisdiction, insurance, negotiated language, informed consent, and applicable law.",
  },
  {
    question: "When does money count as received?",
    answer:
      "Only provider-confirmed PAID_SETTLED evidence counts as received cash. An issue, label, draft, invoice, Drive file, pending transfer, comment, or screenshot does not prove settlement.",
  },
] as const;

export default async function GitHubControlTowerAuditPage() {
  const publicInterest = await getPublicAuditInterest();
  const { offer, metrics, money, status, experimentId } = experiment;
  const slotsRemaining = Math.max(offer.capacity - metrics.orders, 0);
  const backpressureActive =
    fardarterDrive.currentEvidence.activeDeliveries >=
    offer.maxConcurrentDeliveries;
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
        "A fixed-scope GitHub repository operations audit with evidence-gated acceptance and execution.",
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
          <a
            className="font-mono uppercase tracking-[0.3em] text-cyan-200 transition hover:text-white"
            href="/"
          >
            JP Systems
          </a>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-cyan-100" href={issueUrl}>
              Public offer #{publicationReceipt.issueNumber}
            </a>
            <a className="transition hover:text-cyan-100" href={controlIssueUrl}>
              v5 control #146
            </a>
            <a
              className="transition hover:text-cyan-100"
              href={publicAuditRequestsUrl}
            >
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
              {status} • Fardarter Drive™ v5 • {slotsRemaining} of {offer.capacity} total slots available
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              Accept fit, prepare safely, and execute only what the evidence authorizes.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              A fixed-scope GitHub operations audit with 100 total slots, a 10 active
              delivery limit, nonbinding automated fit acceptance, bounded verified
              execution, and private Google Drive continuity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="rounded-full bg-cyan-200 px-6 py-3 font-bold text-black transition hover:bg-white"
                href={requestUrl}
              >
                Request a public-safe fit check
              </a>
              <a
                className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-cyan-200/60 hover:text-cyan-100"
                href={controlIssueUrl}
              >
                Review v5 authority
              </a>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/45">
              A request may enter FIT_APPROVED_FOR_SCOPE_DRAFT after bounded checks.
              That state is nonbinding: it does not create an order, reservation,
              contract, invoice, payment obligation, deadline, indemnity agreement,
              waiver, release, or paid work start.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.055] p-7 shadow-2xl shadow-cyan-950/40">
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/65">
              Current evidence
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-black text-cyan-100">
                  {usd.format(offer.priceUsd)}
                </p>
                <p className="mt-2 text-white/55">per separately accepted scope</p>
              </div>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-xs text-white/60">
                {experimentId}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Slots left" value={`${slotsRemaining}/${offer.capacity}`} />
              <Metric label="10 active" value={`${fardarterDrive.currentEvidence.activeDeliveries}/${offer.maxConcurrentDeliveries}`} />
              <Metric label="Fit-approved" value={String(fardarterDrive.currentEvidence.fitApprovedRequests)} />
              <Metric label="Orders" value={String(metrics.orders)} />
              <Metric label="Public fit checks" value={publicRequestValue} />
              <Metric label="Current gross" value={usd.format(money.grossRevenueUsd)} />
              <Metric label="Settled cash" value={usd.format(money.netCashUsd)} />
              <Metric label="Gross capacity target" value={usd.format(offer.grossTargetUsd)} />
              <Metric label="Backpressure" value={backpressureActive ? "ACTIVE" : "OPEN"} />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/60">
              <strong className="text-white">Authority v{authorityReceipt.authorityVersion}:</strong>{" "}
              fit acceptance and bounded preparation execution are active. Final
              commercial acceptance, payment settlement, paid work start, counsel
              terms, refunds, disputes, admissions, and irreversible actions remain
              separately gated.
            </div>
          </aside>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <StateCard
            title="Automated acceptance"
            state="FIT_APPROVED_FOR_SCOPE_DRAFT"
            text="A qualifying request may enter a private scope-drafting queue. It remains nonbinding and does not reserve capacity or begin work."
          />
          <StateCard
            title="Approved execution"
            state={fardarterDrive.executionModel.state}
            text="Pre-approved reversible repository preparation, validators, builds, receipts, private draft packages, read-only analysis, and confirmed-target readback may execute."
          />
          <StateCard
            title="Google Drive continuity"
            state={googleDriveReceipt.state}
            text="Private Google Drive continuity stores working drafts and restricted evidence. Public GitHub receipts expose no Drive URL, file ID, identity, signature, or provider record."
          />
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-200">
            Capacity and execution control
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <h2 className="text-3xl font-black">100 total slots. No more than 10 active.</h2>
              <p className="mt-4 leading-7 text-white/60">
                New paid work starts pause automatically when 10 deliveries are ACTIVE.
                Intake, fit review, analysis, and draft preparation may continue while
                the start queue is paused. Capacity is planning authority—not demand,
                customers, orders, revenue, or valuation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fardarterDrive.executionModel.permittedClasses.map((item) => (
                <article
                  key={item}
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-sm leading-6 text-white/65"
                >
                  {item}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-200">
            Google Drive continuity
          </p>
          <h2 className="mt-3 text-3xl font-black">CONNECTED_PRIVATE</h2>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            The connected private folder is titled {googleDriveReceipt.folderTitle}. It
            contains the v5 authority charter and acceptance/execution register.
            Private work packages may be created after fit approval, but a Google Drive
            file is not a signature, contract, invoice payment, settlement record, or
            paid work start.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {googleDriveReceipt.documents.map((document) => (
              <article
                key={document.title}
                className="rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.035] p-5"
              >
                <p className="font-bold text-cyan-100">{document.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{document.purpose}</p>
                <p className="mt-3 font-mono text-xs text-white/35">PRIVATE REFERENCE • URL NOT PUBLISHED</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-200">
            Fardarter Drive™ scale
          </p>
          <h2 className="mt-3 text-3xl font-black">Aspirational horizons — not achieved revenue</h2>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            The $10,000 current capacity target and the $1 million, $1 billion,
            $1 trillion, and $1 quadrillion horizons remain unachieved, nonforecast,
            and nonguaranteed. Increasing slots or the active limit does not prove any
            higher stage.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fardarterDrive.horizons.map((horizon) => (
              <article
                key={horizon.stageId}
                className="rounded-3xl border border-fuchsia-200/15 bg-fuchsia-200/[0.035] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-fuchsia-200/70">
                    {horizon.stageId}
                  </span>
                  <span className="rounded-full bg-black/30 px-2 py-1 text-xs text-white/45">
                    not achieved
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-fuchsia-100">
                  {formatScaleUsd(horizon.amountUsd)}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">{horizon.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-amber-200/20 bg-amber-200/[0.05] p-7">
            <p className="font-mono text-sm uppercase tracking-[0.22em] text-amber-100/75">
              Legal boundary
            </p>
            <h2 className="mt-3 text-2xl font-black">Indemnity-ready, not indemnity-proof</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Automation may prepare alternatives but may not select or accept
              indemnity, liability-cap, governing-law, arbitration, insurance, waiver,
              release, or admission terms. A final agreement requires the relevant
              facts, buyer consent, JP approval, and counsel review when appropriate.
            </p>
          </article>
          <article className="rounded-[2rem] border border-emerald-200/20 bg-emerald-200/[0.05] p-7">
            <p className="font-mono text-sm uppercase tracking-[0.22em] text-emerald-100/75">
              Financial boundary
            </p>
            <h2 className="mt-3 text-2xl font-black">PAID_SETTLED or it is not received cash</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              A draft, invoice, issue, label, Drive file, comment, pending transfer, or
              screenshot does not prove payment. Only the agreed external provider can
              establish PAID_SETTLED evidence.
            </p>
          </article>
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-200">
            Clear before purchase
          </p>
          <h2 className="mt-3 text-3xl font-black">Frequently asked questions</h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 open:border-cyan-200/30"
              >
                <summary className="cursor-pointer font-bold text-white/85">
                  {item.question}
                </summary>
                <p className="mt-4 text-sm leading-6 text-white/60">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-10 text-sm text-white/40">
          <span>
            {fardarterDrive.driveId} • authority v{authorityReceipt.authorityVersion} • issue #146
          </span>
          <span>
            {metrics.orders} orders • {usd.format(money.grossRevenueUsd)} gross • {usd.format(money.netCashUsd)} settled
          </span>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-2 font-bold text-white/85">{value}</p>
    </div>
  );
}

function StateCard({
  title,
  state,
  text,
}: {
  title: string;
  state: string;
  text: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
        {state}
      </p>
      <h2 className="mt-3 text-xl font-black text-white/90">{title}</h2>
      <p className="mt-4 text-sm leading-6 text-white/60">{text}</p>
    </article>
  );
}
