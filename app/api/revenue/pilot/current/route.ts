import strategyRail from "@/receipts/revenue/FARDARTER-DRIVE-STRATEGY-RAIL-V6-19.json";
import standingControl from "@/receipts/revenue/FARDARTER-DRIVE-CONTROL-HEAD-V6-18.json";
import ownerRouting from "@/receipts/revenue/FARDARTER-DRIVE-OWNER-ROUTING-V6-17.json";
import applicationSurface from "@/receipts/revenue/FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15.json";
import publicOffer from "@/receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json";
import production from "@/receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json";
import { getPublicAuditInterest } from "@/lib/revenue/public-audit-interest";

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const publicInterest = await getPublicAuditInterest();
  const current = strategyRail.currentTruth;

  return Response.json(
    {
      schemaVersion: "1.7.0",
      status: current.issue133.publicState,
      applicationControlProjection: {
        controlId: "FARDARTER-DRIVE-APPLICATION-CONTROL-PROJECTION-V6-20",
        version: "6.20.0",
        state: "REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION",
        stablePagePath: "/github-control-tower-audit",
        successorPagePath: "/github-control-tower-audit/current",
        stableApiPath: "/api/revenue/pilot",
        successorApiPath: "/api/revenue/pilot/current",
        rewriteMode: "NEXT_BEFORE_FILES_INTERNAL_REWRITE",
        historicalV615SourcePreserved: true,
        sourceUpdateCreatesDeployment: false,
        repositorySourceIsCurrentlyDeployed: false,
        sourceEqualsDeployedApplicationSource: false,
        futurePromotionOwner:
          strategyRail.publicAuthorityMap.providerEvidenceOwner,
      },
      strategyAuthority: {
        controlId: strategyRail.controlId,
        version: strategyRail.controllerVersion,
        state: strategyRail.repository.postMergeState,
        manifestDigest: strategyRail.manifestDigest,
        rootStrategyDocument: strategyRail.strategyDocument.path,
        rootStrategyDocumentSha256: strategyRail.strategyDocument.sha256,
        currentSourceAuthority:
          strategyRail.publicAuthorityMap.currentSourceAuthority,
      },
      standingControl: {
        controlId: standingControl.controlId,
        version: standingControl.controllerVersion,
        state: standingControl.repository.postMergeState,
        manifestDigest: standingControl.manifestDigest,
        preservedImmutable: strategyRail.predecessor.preservedImmutable,
      },
      historicalStrategyRail: {
        issueNumber: strategyRail.issue141.issueNumber,
        title: strategyRail.issue141.title,
        state: strategyRail.issue141.state,
        role: strategyRail.issue141.role,
        bodyState: strategyRail.issue141.bodyState,
        currentAuthorityFromOriginalBodyAllowed:
          strategyRail.issue141.currentAuthorityFromOriginalBodyAllowed,
        automaticBodyRewriteAllowed:
          strategyRail.issue141.automaticBodyRewriteAllowed,
        originalV4OperatingBase:
          strategyRail.issue141.originalV4OperatingBase,
      },
      publicOffer: {
        version: publicOffer.controllerVersion,
        issueNumber: current.issue133.issueNumber,
        state: current.issue133.publicState,
        primaryAuditPriceUsd: publicOffer.offer.primaryAuditPriceUsd,
        manifestDigest: publicOffer.manifestDigest,
        bodySha256: current.issue133.bodySha256,
        automaticRewriteAllowed: current.issue133.automaticRewriteAllowed,
        fitApprovalBinding: false,
      },
      production: {
        applicationState: current.production.applicationState,
        controlState: current.production.controlState,
        deployedApplicationSource:
          current.production.deployedApplicationSource,
        deployId: current.production.deployId,
        providerState: current.production.providerState,
        verifiedRouteCount: current.production.verifiedRouteCount,
        exactBodyMatchCount: current.production.exactBodyMatchCount,
        repositoryRelationship:
          current.production.repositoryRelationship,
        sourceGap: current.production.sourceGap,
        repositorySourceIsCurrentlyDeployed: false,
        futurePromotionRequiresSeparateProviderEvidence: true,
      },
      routingAndNotification: {
        routeCount: ownerRouting.routes.length,
        notificationEventCount:
          ownerRouting.notificationPolicy.allowedEvents.length,
        silenceConditionCount:
          ownerRouting.notificationPolicy.silenceConditions.length,
        maximumNotificationsPerFingerprint:
          ownerRouting.notificationPolicy.maximumNotificationsPerFingerprint,
        sameFingerprintAction:
          strategyRail.routingAndNotification.sameFingerprintAction,
        nativeGitHubFirstResponseOwner:
          strategyRail.routingAndNotification.nativeGitHubFirstResponseOwner,
        gmailOwner:
          strategyRail.routingAndNotification.gmailOwner,
        providerEvidenceAndMutationOwner:
          strategyRail.routingAndNotification
            .providerEvidenceAndMutationOwner,
        publicFingerprintExposureAllowed: false,
      },
      canonical: current.canonical,
      consent: current.consent,
      capacity: current.capacity,
      money: current.money,
      privateContinuity: current.privateContinuity,
      scaleHorizons: strategyRail.scaleHorizons,
      publicInterest: {
        openFitCheckRequests: publicInterest.publicRequestCount,
        sourceState: publicInterest.sourceState,
        sourceUrl: publicInterest.sourceUrl,
        countedAsOrders: false,
        reservesCapacity: false,
      },
      legacyCompatibility: {
        applicationSurfaceControlId: applicationSurface.controlId,
        applicationSurfaceVersion: applicationSurface.controllerVersion,
        applicationSurfaceSchemaVersion:
          applicationSurface.surface.apiSchemaVersion,
        originalPageSha256: applicationSurface.surface.pageSha256,
        originalApiSha256: applicationSurface.surface.apiSha256,
        productionManifestDigest: production.manifestDigest,
        originalV615SourceRemainsHistoricalEvidence: true,
      },
      evidenceBoundary: {
        repositorySourceEqualsDeployedApplicationSource: false,
        sourceProjectionCreatesDeployment: false,
        publicOfferOrContactProvesConsent: false,
        historicalIssueBodyOverridesReviewedCurrentAuthority: false,
        fitApprovalCreatesOrder: false,
        fitApprovalCreatesContract: false,
        fitApprovalStartsWork: false,
        capacityEqualsDemand: false,
        capacityEqualsOrders: false,
        capacityEqualsRevenue: false,
        digestProvesConsent: false,
        receivedCashRequires: "PAID_SETTLED",
        automaticCanonicalAdvance: false,
        automaticCapacityActivation: false,
        automaticProductionPromotion: false,
        scaleHorizonIsAchievedOutcome: false,
        privateReferencesExposed: false,
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
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
