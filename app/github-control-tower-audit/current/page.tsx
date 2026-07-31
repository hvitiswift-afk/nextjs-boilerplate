import type { Metadata } from "next";

import strategyRail from "@/receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json";
import standingControl from "@/receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json";
import ownerRouting from "@/receipts/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json";
import applicationSurface from "@/receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json";
import publicOffer from "@/receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json";
import production from "@/receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json";
import {
  getPublicAuditInterest,
  publicAuditRequestsUrl,
} from "@/lib/revenue/public-audit-interest";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 900;

const projectionVersion = "6.20.0";
const canonicalUrl = `${getSiteUrl()}/github-control-tower-audit`;
const requestUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/new?template=control-tower-audit-request.yml";
const publicOfferUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/133";
const historicalStrategyUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/141";
const projectionControlUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/220";

export const metadata: Metadata = {
  title: "GitHub Control Tower Audit | Fardarter Drive™ v6.20 source projection",
  description:
    "Buyer-facing repository source that separates current strategy authority, standing operational control, the reviewed public offer, verified production, canonical state, consent, capacity, money, and private continuity.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "GitHub Control Tower Audit — Fardarter Drive™ v6.20 source projection",
    description:
      "Current v6.19 strategy authority and v6.18 standing control, projected without claiming a new deployment.",
    type: "website",
    url: canonicalUrl,
  },
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function GitHubControlTowerAuditCurrentPage() {
  const publicInterest = await getPublicAuditInterest();
  const current = strategyRail.currentTruth;
  const deployedSource = current.production.deployedApplicationSource;
  const routing = strategyRail.routingAndNotification;

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f5efe2]">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 text-sm text-white/60">
          <a className="font-mono uppercase tracking-[0.3em] text-cyan-200" href="/">
            JP Systems
          </a>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-cyan-100" href={publicOfferUrl}>
              Public offer #133
            </a>
            <a className="transition hover:text-cyan-100" href={historicalStrategyUrl}>
              Historical rail #141
            </a>
            <a className="transition hover:text-cyan-100" href={projectionControlUrl}>
              v6.20 source control
            </a>
            <a className="transition hover:text-cyan-100" href={publicAuditRequestsUrl}>
              Public fit checks
            </a>
            <a className="transition hover:text-cyan-100" href="/api/revenue/pilot">
              JSON status
            </a>
          </div>
        </nav>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              source projection v{projectionVersion} • strategy v{strategyRail.controllerVersion} • standing control v{standingControl.controllerVersion}
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              Current authority, without pretending source is production.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              The reviewed public offer remains open for verified fit checks. This repository source now projects the current strategy, standing control, routing, canonical, consent, capacity, money, privacy, and production layers separately.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-full bg-cyan-200 px-6 py-3 font-bold text-black" href={requestUrl}>
                Request a public-safe fit check
              </a>
              <a className="rounded-full border border-white/20 px-6 py-3 font-bold" href={publicOfferUrl}>
                Review the exact public offer
              </a>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/45">
              This v6.20 source projection does not deploy, prove buyer consent, create an order, reserve ACTIVE capacity, confirm payment, start work, or append a canonical event.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.055] p-7 shadow-2xl shadow-cyan-950/40">
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/65">Current evidence</p>
            <p className="mt-3 text-5xl font-black text-cyan-100">
              {usd.format(publicOffer.offer.primaryAuditPriceUsd)}
            </p>
            <p className="mt-2 text-white/55">per separately accepted scope</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Offer" value={current.issue133.publicState} />
              <Metric label="Strategy" value={strategyRail.repository.postMergeState} />
              <Metric label="Standing" value={standingControl.repository.postMergeState} />
              <Metric label="Production" value={current.production.applicationState} />
              <Metric label="Canonical" value={`${current.canonical.eventHeadSequence}/${current.canonical.reconciliationSequence}`} />
              <Metric label="Consent" value={current.consent.packageState} />
              <Metric label="ACTIVE" value={`${current.capacity.activeDeliveries}/${current.capacity.effectiveActiveCeiling}`} />
              <Metric label="Headroom" value={String(current.capacity.activeHeadroom)} />
              <Metric label="Orders" value={String(current.money.orders)} />
              <Metric label="Gross" value={usd.format(current.money.verifiedGrossRevenueUsd)} />
              <Metric label="Settled" value={usd.format(current.money.verifiedSettledCashUsd)} />
              <Metric
                label="Fit checks"
                value={
                  publicInterest.publicRequestCount === null
                    ? "Unavailable"
                    : String(publicInterest.publicRequestCount)
                }
              />
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/60">
              <strong className="text-white">Deployment boundary:</strong>{" "}
              verified production remains source <span className="font-mono">{deployedSource.slice(0, 12)}…</span> at deploy{" "}
              <span className="font-mono">{current.production.deployId}</span>. Repository main and this source projection are not automatically live.
            </div>
          </aside>
        </section>

        <section className="grid gap-5 border-t border-white/10 py-12 md:grid-cols-2">
          <LayerCard
            title="Current strategy authority"
            state={`v${strategyRail.controllerVersion} / ${strategyRail.repository.postMergeState}`}
            text={`Manifest ${strategyRail.manifestDigest}. The current root strategy document is SHA-256 ${strategyRail.strategyDocument.sha256}.`}
          />
          <LayerCard
            title="Standing operational control"
            state={`v${standingControl.controllerVersion} / ${standingControl.repository.postMergeState}`}
            text="The v6.18 control head remains the immutable operational predecessor. v6.20 does not repoint or rewrite it."
          />
          <LayerCard
            title="Reviewed public offer"
            state={`Issue #${current.issue133.issueNumber} / ${current.issue133.publicState}`}
            text="Issue #133 remains the exact v6.14 public offer. It is read-only and is not rewritten for this source projection."
          />
          <LayerCard
            title="Historical strategy rail"
            state={`Issue #${strategyRail.issue141.issueNumber} / ${strategyRail.issue141.role}`}
            text="Issue #141 stays open with its original v4 body preserved as history. Its old capacity and deployment language is not current authority."
          />
          <LayerCard
            title="Repository application source"
            state={`v${projectionVersion} / SOURCE_ONLY`}
            text="The original v6.15 source files remain hash-verifiable. Stable paths internally rewrite to this versioned v6.20 successor source."
          />
          <LayerCard
            title="Verified production"
            state={`${current.production.applicationState} / ${current.production.controlState}`}
            text={`Production remains deploy ${current.production.deployId} with ${current.production.verifiedRouteCount}/${current.production.verifiedRouteCount} route and exact-body verification.`}
          />
          <LayerCard
            title="Routing and notification"
            state={`${routing.routeCount}/${routing.notificationEventCount}/${routing.silenceConditionCount}/${routing.maximumNotificationsPerFingerprint}`}
            text="Native v6.9 remains the sole GitHub first-response writer. Identical private decision fingerprints suppress duplicate notifications."
          />
          <LayerCard
            title="Canonical and consent"
            state={`${current.canonical.eventHeadSequence}/${current.canonical.reconciliationSequence} • ${current.consent.packageState}`}
            text="SCOPE_DRAFTED=1, HUMAN_ACCEPTED=0, ACTIVE=0, event 2 absent, and consent remains awaiting independently verified counterparty evidence."
          />
          <LayerCard
            title="Capacity and money"
            state={`${current.capacity.totalPlanningSlots} planning / ${current.capacity.effectiveActiveCeiling} effective ACTIVE`}
            text={`ACTIVE ${current.capacity.activeDeliveries}; headroom ${current.capacity.activeHeadroom}; override ${current.capacity.overrideState}; orders/gross/settled remain 0 / $0 / $0.`}
          />
          <LayerCard
            title="Private continuity"
            state={`${current.privateContinuity.state} / ${current.privateContinuity.knownDocumentCount} known documents`}
            text="Owner-only and unshared. No private Drive URL, file ID, identity evidence, signature, banking record, provider-private evidence, or decision fingerprint is public."
          />
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-fuchsia-200">Scale horizons</p>
          <h2 className="mt-3 text-3xl font-black">Planning classifications, not achieved outcomes.</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategyRail.scaleHorizons.map((horizon) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5" key={horizon.stage}>
                <p className="font-mono text-xs text-white/45">{horizon.stage}</p>
                <p className="mt-2 text-2xl font-black">{usd.format(horizon.amountUsd)}</p>
                <p className="mt-2 text-sm text-white/55">{horizon.classification}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-amber-200/80">
                  {horizon.status}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-emerald-200">Next controlled action</p>
          <p className="mt-4 max-w-5xl text-2xl font-black">
            HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION
          </p>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            Provider evidence and mutation remain exclusively owned by FARDARTER_DRIVE_LIVE_WATCH. Any future promotion requires an exact target, real provider evidence, authoritative immutable readback, rollback preservation, privacy verification, and separate human authorization.
          </p>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-white/85">{value}</p>
    </div>
  );
}

function LayerCard({
  title,
  state,
  text,
}: {
  title: string;
  state: string;
  text: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      <p className="text-sm uppercase tracking-[0.18em] text-white/40">{title}</p>
      <p className="mt-3 break-words font-mono text-sm text-cyan-100">{state}</p>
      <p className="mt-4 leading-7 text-white/60">{text}</p>
    </article>
  );
}
