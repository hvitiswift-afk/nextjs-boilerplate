import type { Metadata } from "next";

import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json";
import fardarterDrive from "@/receipts/revenue/FARDARTER-DRIVE-V6.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import capacityOverride from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json";
import publicOffer from "@/receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json";
import unifiedControl from "@/receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json";
import productionReconciliation from "@/receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json";
import {
  getPublicAuditInterest,
  publicAuditRequestsUrl,
} from "@/lib/revenue/public-audit-interest";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 900;

const applicationProjectionVersion = "6.15.0";
const canonicalUrl = `${getSiteUrl()}/github-control-tower-audit`;
const requestUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/new?template=control-tower-audit-request.yml";
const issueUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/133";
const publicOfferControlUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/200";
const applicationControlUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/203";

export const metadata: Metadata = {
  title: "GitHub Control Tower Audit | Fardarter Drive™ v6.15 source projection",
  description:
    "A $100 fixed-scope GitHub repository audit with a reviewed v6.14 public offer, verified v6.12 production evidence, canonical 1/1 truth, private continuity, and an explicit repository-source versus deployed-application boundary.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "GitHub Control Tower Audit — Fardarter Drive™ v6.15 source projection",
    description:
      "Public offer open for verified fit checks; repository source is projected separately from the verified deployed application.",
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
    question: "Is this v6.15 repository source already live?",
    answer:
      "No. This is a repository-source truth projection. Verified production remains the separately evidenced application source and deploy shown on this page. A later promotion requires exact provider evidence and separate authorization.",
  },
  {
    question: "What can automation accept?",
    answer:
      "A qualifying controlled request may enter FIT_APPROVED_FOR_SCOPE_DRAFT. This is nonbinding and does not create an order, reservation, contract, invoice, payment obligation, deadline, indemnity agreement, or paid work start.",
  },
  {
    question: "How does GitHub contact work?",
    answer:
      "The requester’s GitHub account is the identity and the exact request issue is the channel when permission is checked. The native workflow may post one public-safe clarification; it does not prove consent.",
  },
  {
    question: "What is the standard capacity?",
    answer:
      "Fardarter Drive v6 provides 1,000 total slots with 100 standard ACTIVE deliveries. New starts pause at the effective active ceiling while intake and drafting may continue.",
  },
  {
    question: "Can active capacity go above 100?",
    answer:
      "Above 100 is allowed, but only through a complete receipted override. The baseline remains INACTIVE_NO_RECEIPT and approval alone never activates capacity.",
  },
  {
    question: "Is Google Drive public?",
    answer:
      "No. Google Drive continuity is CONNECTED_PRIVATE. Public records expose status and document count only; private URLs, IDs, identities, signatures, provider records, counsel notes, and evidence stay private.",
  },
  {
    question: "Is the package indemnity-proof?",
    answer:
      "No. The package is indemnity- and liability-ready for counsel review, but it is not indemnity-proof and does not guarantee enforceability or outcomes.",
  },
] as const;

export default async function GitHubControlTowerAuditPage() {
  const publicInterest = await getPublicAuditInterest();
  const { offer, metrics, money, experimentId } = experiment;
  const slotsRemaining = Math.max(offer.capacity - metrics.orders, 0);
  const standardActiveCeiling = fardarterDrive.capacityModel.standardActiveCeiling;
  const effectiveActiveCeiling = publicOffer.capacity.effectiveActiveCeiling;
  const activeDeliveries = publicOffer.capacity.activeDeliveries;
  const activeHeadroom = publicOffer.capacity.activeHeadroom;
  const backpressureActive = activeDeliveries >= effectiveActiveCeiling;
  const publicRequestValue =
    publicInterest.publicRequestCount === null
      ? "Unavailable"
      : String(publicInterest.publicRequestCount);
  const deployedSource =
    productionReconciliation.repository.deployedApplicationSource;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: offer.name,
      description:
        "A fixed-scope GitHub repository operations audit with evidence-gated acceptance, source/deployment separation, capacity, and execution.",
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
              Public offer #{publicOffer.publicOfferIssue}
            </a>
            <a className="transition hover:text-cyan-100" href={publicOfferControlUrl}>
              v6.14 offer control
            </a>
            <a className="transition hover:text-cyan-100" href={applicationControlUrl}>
              v6.15 source control
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
              {publicOffer.offer.publicState} • source projection v{applicationProjectionVersion} • public offer v{publicOffer.controllerVersion}
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              One offer. Separate source, production, consent, and money truth.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              A fixed-scope GitHub operations audit with 1,000 total slots, 100 standard ACTIVE deliveries, verified production evidence, nonbinding fit intake, private continuity, and an explicit repository-source versus deployed-application boundary.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-cyan-200 px-6 py-3 font-bold text-black" href={requestUrl}>
                Request a public-safe fit check
              </a>
              <a className="rounded-full border border-white/20 px-6 py-3 font-bold" href={issueUrl}>
                Review current public offer
              </a>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/45">
              This repository source is not itself proof of a new deployment. A request may enter FIT_APPROVED_FOR_SCOPE_DRAFT after bounded checks, but that state creates no order, reservation, contract, invoice, payment, work start, consent, or canonical event.
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
              <Metric label="Offer" value={publicOffer.offer.publicState} />
              <Metric label="Production" value={publicOffer.production.applicationState} />
              <Metric label="Control" value={publicOffer.production.controlState} />
              <Metric label="Canonical" value={`${publicOffer.canonical.eventHeadSequence}/${publicOffer.canonical.reconciliationSequence}`} />
              <Metric label="SCOPE_DRAFTED" value={String(publicOffer.canonical.scopeDrafted)} />
              <Metric label="Consent" value={publicOffer.consent.packageState} />
              <Metric label="Slots left" value={`${slotsRemaining.toLocaleString("en-US")}/${offer.capacity.toLocaleString("en-US")}`} />
              <Metric label="100 standard ACTIVE" value={`${activeDeliveries}/${standardActiveCeiling}`} />
              <Metric label="Active headroom" value={String(activeHeadroom)} />
              <Metric label="Orders" value={String(publicOffer.money.orders)} />
              <Metric label="Current gross" value={usd.format(publicOffer.money.verifiedGrossRevenueUsd)} />
              <Metric label="Settled cash" value={usd.format(publicOffer.money.verifiedSettledCashUsd)} />
              <Metric label="Public fit checks" value={publicRequestValue} />
              <Metric label="Drive documents" value={String(publicOffer.drive.knownDocumentCount)} />
              <Metric label="Override" value={publicOffer.capacity.overrideState} />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/60">
              <strong className="text-white">Source boundary:</strong>{" "}
              repository controls are ahead of deployed application source <span className="font-mono">{deployedSource.slice(0, 12)}…</span>. This page source requires a separate exact provider promotion before it may be described as live.
            </div>
          </aside>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-12 lg:grid-cols-2">
          <StateCard
            title="Public operating offer"
            state={`v${publicOffer.controllerVersion} / ${publicOffer.offer.publicState}`}
            text="Issue #133 is the reviewed current public offer. Dynamic fit-check counts are interest only and never orders or capacity reservations."
          />
          <StateCard
            title="Repository application source"
            state={`v${applicationProjectionVersion} / SOURCE_ONLY`}
            text="This source projects reviewed truth but creates no provider deployment. Future promotion remains separately authorized and evidenced."
          />
          <StateCard
            title="Verified production"
            state={`${publicOffer.production.applicationState} / ${publicOffer.production.controlState}`}
            text={`The verified production source remains ${deployedSource.slice(0, 12)}… at deploy ${publicOffer.production.deployId}, with 18/18 route and exact-body readback.`}
          />
          <StateCard
            title="Canonical and consent"
            state={`${publicOffer.canonical.eventHeadSequence}/${publicOffer.canonical.reconciliationSequence} • ${publicOffer.consent.packageState}`}
            text="SCOPE_DRAFTED=1, HUMAN_ACCEPTED=0, ACTIVE=0, event 2 absent, and consent remains AWAITING_COUNTERPARTY_EVIDENCE."
          />
          <StateCard
            title="GitHub contact"
            state={`${publicOffer.contact.identityModel} / ${publicOffer.contact.channelModel}`}
            text="The native workflow is the sole first-response writer and may post at most one bounded public-safe clarification per qualifying external issue."
          />
          <StateCard
            title="Google Drive continuity"
            state={`${googleDriveReceipt.state} / ${unifiedControl.drive.knownDocumentCount} known documents`}
            text="CONNECTED_PRIVATE records retain work packages and evidence without publishing private Drive references."
          />
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-emerald-200">Source versus production</p>
          <h2 className="mt-3 text-3xl font-black">Repository truth can advance without silently changing the live application.</h2>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            The verified deployed application remains source <span className="font-mono">{deployedSource}</span>. Repository control is {publicOffer.production.repositoryRelationship}. Any future production promotion requires an exact target commit, provider deploy ID, authoritative immutable URL, complete route readback, preserved rollback, no private-reference exposure, and separate approval.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Boundary label="Repository projection" value="6.15.0 / SOURCE_ONLY" />
            <Boundary label="Verified deploy" value={publicOffer.production.deployId} />
            <Boundary label="Verified routes" value={`${publicOffer.production.verifiedRouteCount}/${publicOffer.production.verifiedRouteCount}`} />
            <Boundary label="Source equals deployed source" value="FALSE" />
            <Boundary label="Automatic promotion" value="FALSE" />
            <Boundary label="Deployment owner" value={unifiedControl.authoritySeparation.deploymentVerificationOwner} />
          </div>
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
              <Boundary label="Current override state" value={capacityOverride.state} />
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
            Final contract acceptance, buyer consent, payment, paid delivery start, refunds, disputes, admissions, waivers, releases, banking, billing, domains, credentials, access controls, provider deployment, and destructive external actions remain independently gated. Indemnity and liability language remains counsel-reviewed and not indemnity-proof.
          </p>
          <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-sm leading-7 text-white/60">
            Authority v{authorityReceipt.authorityVersion} retains the legacy 1,000-slot / 100 standard ACTIVE baseline. The current reviewed public offer, canonical state, consent state, production evidence, and private continuity are projected from v6.14, v6.13, and v6.12 receipts rather than inferred from that legacy baseline.
          </div>
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
