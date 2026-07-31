import type { Metadata } from "next";

import currentHead from "@/receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json";
import applicationProjection from "@/receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json";
import strategyRail from "@/receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json";
import standingControl from "@/receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json";
import publicOffer from "@/receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

const projectionVersion = "6.22.0";
const canonicalUrl = `${getSiteUrl()}/github-control-tower-audit/control-head`;
const publicOfferUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/133";
const historicalStrategyUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/141";
const currentHeadIssueUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/223";
const projectionIssueUrl =
  "https://github.com/hvitiswift-afk/nextjs-boilerplate/issues/226";

export const metadata: Metadata = {
  title: "Fardarter Drive™ current control head | Source projection v6.22",
  description:
    "Public-safe repository source projecting the reconciled v6.21 current control head without changing the immutable v6.20 stable routes or claiming deployment.",
  alternates: { canonical: canonicalUrl },
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PublicControlHeadPage() {
  const current = currentHead.currentTruth;

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
            <a className="transition hover:text-cyan-100" href={currentHeadIssueUrl}>
              v6.21 current head
            </a>
            <a className="transition hover:text-cyan-100" href={projectionIssueUrl}>
              v6.22 source rail
            </a>
            <a className="transition hover:text-cyan-100" href="/api/revenue/control-head">
              JSON status
            </a>
          </div>
        </nav>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              public source projection v{projectionVersion} • current head v{currentHead.controllerVersion}
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
              One current head. Every evidence layer kept separate.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              This source-only surface projects the reconciled v6.21 current control head,
              its immutable application, strategy, standing, offer, production, canonical,
              consent, capacity, money, routing, and privacy layers.
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-white/45">
              The v6.20 stable buyer-facing page, pilot API, rewrite configuration, and exact
              hashes remain unchanged. This v6.22 route does not deploy, prove consent, create
              an order, reserve capacity, confirm payment, start work, or append a canonical event.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-cyan-200/20 bg-cyan-200/[0.055] p-7 shadow-2xl shadow-cyan-950/40">
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/65">
              Current evidence
            </p>
            <p className="mt-3 text-4xl font-black text-cyan-100">
              {currentHead.repository.postMergeState}
            </p>
            <p className="mt-2 break-all font-mono text-xs text-white/45">
              {currentHead.manifestDigest}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric label="Offer" value={current.issue133.publicState} />
              <Metric label="Application" value={current.applicationSource.state} />
              <Metric label="Strategy" value={currentHead.predecessors.strategyAuthority.state} />
              <Metric label="Standing" value={currentHead.predecessors.standingControl.state} />
              <Metric label="Production" value={current.production.applicationState} />
              <Metric label="Canonical" value={`${current.canonical.eventHeadSequence}/${current.canonical.reconciliationSequence}`} />
              <Metric label="Consent" value={current.consent.packageState} />
              <Metric label="ACTIVE" value={`${current.capacity.activeDeliveries}/${current.capacity.effectiveActiveCeiling}`} />
              <Metric label="Headroom" value={String(current.capacity.activeHeadroom)} />
              <Metric label="Orders" value={String(current.money.orders)} />
              <Metric label="Gross" value={usd.format(current.money.verifiedGrossRevenueUsd)} />
              <Metric label="Settled" value={usd.format(current.money.verifiedSettledCashUsd)} />
            </div>
          </aside>
        </section>

        <section className="grid gap-5 border-t border-white/10 py-12 md:grid-cols-2">
          <LayerCard
            title="Current control head"
            state={`v${currentHead.controllerVersion} / ${currentHead.repository.postMergeState}`}
            text={`Manifest ${currentHead.manifestDigest}. Repository merge readback is recorded separately and does not imply provider deployment.`}
          />
          <LayerCard
            title="Buyer-facing application source"
            state={`v${applicationProjection.controllerVersion} / ${current.applicationSource.state}`}
            text={`The immutable v6.20 stable paths remain backed by schema ${applicationProjection.surface.apiSchemaVersion} and rewrite ${applicationProjection.surface.rewriteMode}.`}
          />
          <LayerCard
            title="Strategy authority"
            state={`v${strategyRail.controllerVersion} / ${strategyRail.repository.postMergeState}`}
            text={`Strategy manifest ${strategyRail.manifestDigest}; root strategy document SHA-256 ${strategyRail.strategyDocument.sha256}.`}
          />
          <LayerCard
            title="Standing operational control"
            state={`v${standingControl.controllerVersion} / ${standingControl.repository.postMergeState}`}
            text="The v6.18 standing control remains immutable predecessor evidence and is not repointed by this projection."
          />
          <LayerCard
            title="Reviewed public offer"
            state={`Issue #${publicOffer.publicOfferIssue} / ${current.issue133.publicState}`}
            text={`The exact v6.14 offer remains read-only at ${usd.format(publicOffer.offer.primaryAuditPriceUsd)} per separately accepted scope.`}
          />
          <LayerCard
            title="Verified production"
            state={`${current.production.applicationState} / ${current.production.controlState}`}
            text={`Production remains deploy ${current.production.deployId} from source ${current.production.deployedApplicationSource.slice(0, 12)}… with 18/18 verified routes and exact-body matches.`}
          />
          <LayerCard
            title="Canonical and consent"
            state={`${current.canonical.eventHeadSequence}/${current.canonical.reconciliationSequence} • ${current.consent.packageState}`}
            text="SCOPE_DRAFTED=1, HUMAN_ACCEPTED=0, ACTIVE=0, event 2 absent, and independent counterparty evidence remains required."
          />
          <LayerCard
            title="Routing and privacy"
            state={`${currentHead.routingAndNotification.routeCount}/${currentHead.routingAndNotification.notificationEventCount}/${currentHead.routingAndNotification.silenceConditionCount}/${currentHead.routingAndNotification.maximumNotificationsPerFingerprint}`}
            text={`Private continuity remains ${current.privateContinuity.state}, owner-only and unshared across ${current.privateContinuity.knownDocumentCount} known documents. No private references or fingerprints are public.`}
          />
        </section>

        <section className="border-t border-white/10 py-12">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-emerald-200">
            Next controlled action
          </p>
          <p className="mt-4 max-w-5xl text-2xl font-black">
            HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION
          </p>
          <p className="mt-4 max-w-4xl leading-7 text-white/60">
            Provider evidence and mutation remain exclusively owned by FARDARTER_DRIVE_LIVE_WATCH.
            Repository source, pull-request builds, and this public projection are not deployment evidence.
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
