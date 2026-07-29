import type { Metadata } from "next";

import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/JP-REV-001-AUTHORITY.json";
import publicationReceipt from "@/receipts/revenue/JP-REV-001-PUBLICATION.json";
import {
  getPublicAuditInterest,
  publicAuditRequestsUrl,
} from "@/lib/revenue/public-audit-interest";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 900;

const canonicalUrl = `${getSiteUrl()}/github-control-tower-audit`;

export const metadata: Metadata = {
  title: "GitHub Control Tower Audit | JP Systems",
  description:
    "A $100 fixed-scope GitHub repository operations audit with ten total pilot slots, bounded automation, and explicit evidence gates.",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "GitHub Control Tower Audit",
    description:
      "Turn stale pull requests, duplicate issues, unclear checks, and deployment boundaries into an exact operating sequence.",
    type: "website",
    url: canonicalUrl,
  },
};

const issueUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/133";
const requestUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/new?template=control-tower-audit-request.yml";
const statusApiUrl = "/api/revenue/pilot";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const faqItems = [
  {
    question: "Does opening a GitHub issue reserve a pilot slot?",
    answer:
      "No. A public issue is a fit-check request only. It does not reserve capacity, create an order, form a contract, or create a payment obligation.",
  },
  {
    question: "What part of intake is automated?",
    answer:
      "Only exact-prefix audit-request issues may receive bounded labels and one idempotent acknowledgement. Automation cannot accept fit or scope, create an order, reserve capacity, request payment, start delivery, or issue a refund.",
  },
  {
    question: "How can ten slots exist with only two active deliveries?",
    answer:
      "Ten is the total pilot capacity. No more than two audits may be active at once. Additional work starts pause whenever the active-delivery limit is reached.",
  },
  {
    question: "Do you need repository credentials?",
    answer:
      "No credentials should be posted. The pilot uses a public repository or a separately authorized read-only path, and sensitive information stays outside public issues.",
  },
  {
    question: "When does money count as received?",
    answer:
      "Only when an agreed external payment provider confirms settlement. Comments, labels, reactions, pledges, invoices, pending transfers, and screenshots do not count as received cash.",
  },
  {
    question: "Are the $500 milestone and $1,000 target guaranteed?",
    answer:
      "No. Five $100 settled audits form the first $500 milestone, and ten form the expanded $1,000 gross target. Neither is a sales forecast, profit claim, or earnings guarantee.",
  },
] as const;

export default async function GitHubControlTowerAuditPage() {
  const publicInterest = await getPublicAuditInterest();
  const { offer, metrics, money, channel, status, experimentId } = experiment;
  const slotsRemaining = Math.max(offer.capacity - metrics.orders, 0);
  const percentFilled = Math.min(
    Math.round((metrics.orders / offer.capacity) * 100),
    100,
  );
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
        "A fixed-scope GitHub repository operations audit for creators, maintainers, and small teams.",
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
          <div className="flex flex-wrap items-center gap-4">
            <a className="transition hover:text-cyan-100" href={issueUrl}>
              Launch issue #{publicationReceipt.issueNumber}
            </a>
            <a
              className="transition hover:text-cyan-100"
              href={publicAuditRequestsUrl}
            >
              Public fit checks
            </a>
            <a className="transition hover:text-cyan-100" href={statusApiUrl}>
              JSON status
            </a>
          </div>
        </nav>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              {status} • GitHub inbound • {slotsRemaining} of {offer.capacity} total slots available
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              Turn a tangled GitHub repository into an exact operating sequence.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              A fixed-scope repository operations audit for creators, maintainers,
              small companies, and project owners dealing with stale pull
              requests, duplicate issues, unclear checks, mixed experiments, or
              uncertain deployment boundaries.
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
                href={issueUrl}
              >
                Review pilot receipt
              </a>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
              Opening an issue may trigger bounded automated labels and one
              acknowledgement. It does not create a contract, invoice, payment
              obligation, deadline, delivery commitment, order, work start, or
              capacity reservation. Do not place credentials, payment data,
              customer identities, or confidential records in a public issue.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.055] p-7 shadow-2xl shadow-cyan-950/40">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/65">
                  Fixed-scope pilot
                </p>
                <p className="mt-2 text-5xl font-black text-cyan-100">
                  {usd.format(offer.priceUsd)}
                </p>
                <p className="mt-2 text-white/55">per accepted audit scope</p>
              </div>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-xs text-white/60">
                {experimentId}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Slots left" value={`${slotsRemaining}/${offer.capacity}`} />
              <Metric label="Active limit" value={String(offer.maxConcurrentDeliveries)} />
              <Metric label="Orders" value={String(metrics.orders)} />
              <Metric label="Public fit checks" value={publicRequestValue} />
              <Metric label="First milestone" value={usd.format(offer.firstMilestoneUsd)} />
              <Metric label="Expanded target" value={usd.format(offer.grossTargetUsd)} />
              <Metric label="Settled cash" value={usd.format(money.netCashUsd)} />
              <Metric
                label="Delivery window"
                value={`${offer.deliveryWindowBusinessDays} business days`}
              />
              <Metric label="Accepted deliveries" value={String(metrics.deliveriesAccepted)} />
            </div>

            <p className="mt-3 text-xs leading-5 text-white/40">
              Public fit checks are counted from exact-prefix GitHub issues. They
              are interest signals only and are never orders, revenue, or reserved
              capacity. Ten total slots do not override the two-active-delivery cap.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.18em] text-white/45">
                <span>Total pilot capacity</span>
                <span>{percentFilled}% ordered</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300"
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/60">
              <strong className="text-white">Authority state:</strong> publication
              and bounded exact-prefix acknowledgement are active under authority
              v{authorityReceipt.authorityVersion}; direct outreach is {channel.outreachAuthorized ? "authorized" : "not authorized"}; only provider-confirmed settled payments count as received cash.
            </div>
          </aside>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-200">
              Buyer outcome
            </p>
            <h2 className="mt-3 text-3xl font-black">What the audit delivers</h2>
            <p className="mt-4 leading-7 text-white/60">
              One public-safe Markdown report that separates what is current,
              blocked, stale, superseded, or ready for a controlled next action.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {offer.deliverables.map((deliverable, index) => (
              <article
                key={deliverable}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"
              >
                <span className="font-mono text-xs text-cyan-200/70">
                  0{index + 1}
                </span>
                <p className="mt-3 font-semibold text-white/80">{deliverable}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-3">
          <ScopeCard
            title="Pilot boundary"
            items={[
              `${offer.scopeLimits.repositories} repository`,
              `Up to ${offer.scopeLimits.maxOpenPullRequests} open pull requests`,
              `Up to ${offer.scopeLimits.maxOpenIssues} open issues`,
              `${offer.scopeLimits.clarificationRounds} clarification round`,
              `No more than ${offer.maxConcurrentDeliveries} active deliveries`,
            ]}
          />
          <ScopeCard title="Explicit exclusions" items={offer.exclusions} />
          <ScopeCard
            title="Transaction boundary"
            items={[
              "Human fit and written scope before an order",
              "External provider confirms settlement",
              "GitHub issues, labels, comments, and screenshots are not payment evidence",
              "JP approval is required before delivery starts",
              "Expanded implementation receives a separate scope and price",
            ]}
          />
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

        <section className="rounded-[2rem] border border-fuchsia-200/20 bg-fuchsia-200/[0.055] p-7 sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-100/70">
                Start with fit, not payment
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Describe the repository problem with public-safe information.
              </h2>
              <p className="mt-4 max-w-3xl leading-7 text-white/65">
                Automation may acknowledge the request, but JP reviews fit first.
                Scope, price, due date, cancellation terms, delivery destination,
                active capacity, and payment method are confirmed separately in
                writing before work begins.
              </p>
            </div>
            <a
              className="inline-flex justify-center rounded-full bg-fuchsia-200 px-6 py-3 font-bold text-black transition hover:bg-white"
              href={requestUrl}
            >
              Open the audit request form
            </a>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 py-10 text-sm text-white/40">
          <span>
            Snapshot: {experimentId} • Issue #{publicationReceipt.issueNumber} • authority v{authorityReceipt.authorityVersion}
          </span>
          <span>
            First milestone {usd.format(offer.firstMilestoneUsd)} • expanded target {usd.format(offer.grossTargetUsd)} • not an earnings forecast
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

function ScopeCard({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <h2 className="text-xl font-black text-cyan-100">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-white/60">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden="true" className="text-cyan-300">
              ◆
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
