import currentHead from "@/receipts/revenue/FARDARTER-DRIVE-CURRENT-CONTROL-HEAD-V6-21.json";
import applicationProjection from "@/receipts/revenue/FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20.json";
import strategyRail from "@/receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json";
import standingControl from "@/receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json";
import publicOffer from "@/receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json";

export const dynamic = "force-static";

export async function GET() {
  const current = currentHead.currentTruth;

  return Response.json({
    schemaVersion: "1.8.0",
    publicProjection: {
      controlId: "FARDARTER-DRIVE-PUBLIC-CONTROL-HEAD-PROJECTION-V6-22",
      version: "6.22.0",
      pagePath: "/github-control-tower-audit/control-head",
      apiPath: "/api/revenue/control-head",
      state: "REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION",
      modifiesV620StableRoutes: false,
      sourceUpdateCreatesDeployment: false,
      futurePromotionOwner: "FARDARTER_DRIVE_LIVE_WATCH",
    },
    currentControlHead: {
      controlId: currentHead.controlId,
      version: currentHead.controllerVersion,
      state: currentHead.repository.postMergeState,
      manifestDigest: currentHead.manifestDigest,
      repositoryMergeReadback: "606a42545e8c1638b8a90e9522295d61be6cb6ab",
      activeRevenueJob: currentHead.topLevelRevenue.activeJobName,
      activeRevenueControllerVersion:
        currentHead.topLevelRevenue.activeControllerVersion,
    },
    applicationControlProjection: {
      controlId: applicationProjection.controlId,
      version: applicationProjection.controllerVersion,
      state: current.applicationSource.state,
      manifestDigest: applicationProjection.manifestDigest,
      stablePagePath: applicationProjection.surface.stablePagePath,
      stableApiPath: applicationProjection.surface.stableApiPath,
      rewriteMode: applicationProjection.surface.rewriteMode,
      apiSchemaVersion: applicationProjection.surface.apiSchemaVersion,
      stableRoutesModifiedByV622: false,
      repositorySourceEqualsDeployedApplicationSource: false,
    },
    strategyAuthority: {
      controlId: strategyRail.controlId,
      version: strategyRail.controllerVersion,
      state: strategyRail.repository.postMergeState,
      manifestDigest: strategyRail.manifestDigest,
      rootStrategyDocumentSha256: strategyRail.strategyDocument.sha256,
    },
    standingControl: {
      controlId: standingControl.controlId,
      version: standingControl.controllerVersion,
      state: standingControl.repository.postMergeState,
      manifestDigest: standingControl.manifestDigest,
    },
    publicOffer: {
      version: publicOffer.controllerVersion,
      issueNumber: publicOffer.publicOfferIssue,
      state: current.issue133.publicState,
      primaryAuditPriceUsd: publicOffer.offer.primaryAuditPriceUsd,
      manifestDigest: publicOffer.manifestDigest,
      bodySha256: current.issue133.bodySha256,
      automaticRewriteAllowed: false,
    },
    historicalStrategyRail: current.issue141,
    production: {
      ...current.production,
      repositorySourceIsCurrentlyDeployed: false,
      publicProjectionCreatesDeployment: false,
      futurePromotionRequiresSeparateProviderEvidence: true,
    },
    routingAndNotification: currentHead.routingAndNotification,
    canonical: current.canonical,
    consent: current.consent,
    capacity: current.capacity,
    money: current.money,
    privateContinuity: current.privateContinuity,
    evidenceBoundary: {
      publicProjectionProvesDeployment: false,
      sourceProjectionProvesConsent: false,
      sourceProjectionCreatesOrder: false,
      sourceProjectionStartsWork: false,
      digestProvesConsent: false,
      automaticCanonicalAdvance: false,
      automaticCapacityActivation: false,
      automaticProductionPromotion: false,
      privateReferencesExposed: false,
      receivedCashRequires: "PAID_SETTLED",
    },
    actualEffects: {
      orders: 0,
      activeDeliveries: 0,
      verifiedGrossRevenueUsd: 0,
      verifiedSettledCashUsd: 0,
    },
    projectedEffects: {
      orders: 0,
      activeDeliveries: 0,
      verifiedGrossRevenueUsd: 0,
      verifiedSettledCashUsd: 0,
    },
    nextControlledAction:
      "HOLD_FOR_GENUINE_EXTERNAL_INPUT_OR_SEPARATELY_AUTHORIZED_EXACT_PRODUCTION_PROMOTION",
  });
}
