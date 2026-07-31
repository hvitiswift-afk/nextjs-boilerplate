import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json";
import fardarterDrive from "@/receipts/revenue/FARDARTER-DRIVE-V6.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import capacityOverride from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json";
import publicationReceipt from "@/receipts/revenue/JP-REV-001-PUBLICATION.json";
import publicOffer from "@/receipts/revenue/FARDARTER-DRIVE-PUBLIC-OFFER-V6-14.json";
import unifiedControl from "@/receipts/revenue/FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json";
import productionReconciliation from "@/receipts/revenue/FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json";
import { getPublicAuditInterest } from "@/lib/revenue/public-audit-interest";

export const dynamic = "force-static";
export const revalidate = 900;

export async function GET() {
  const publicInterest = await getPublicAuditInterest();
  const slotsRemaining = Math.max(
    experiment.offer.capacity - experiment.metrics.orders,
    0,
  );
  const grantStates = Object.fromEntries(
    authorityReceipt.grants.map((grant) => [grant.grantId, grant.state]),
  );
  const standardActiveCeiling = fardarterDrive.capacityModel.standardActiveCeiling;
  const effectiveActiveCeiling = publicOffer.capacity.effectiveActiveCeiling;
  const activeDeliveries = publicOffer.capacity.activeDeliveries;
  const deployedApplicationSource =
    productionReconciliation.repository.deployedApplicationSource;

  return Response.json(
    {
      schemaVersion: "1.6.0",
      experimentId: experiment.experimentId,
      status: publicOffer.offer.publicState,
      applicationSurface: {
        controlId: "FARDARTER-DRIVE-APPLICATION-SURFACE-V6-15",
        version: "6.15.0",
        state: "REPOSITORY_SOURCE_ONLY_PENDING_SEPARATE_PROVIDER_PROMOTION",
        repositoryBaseAtPreparation: "f461e7dc0724010265bbb439b4cfb857660c095f",
        pagePath: "/github-control-tower-audit",
        apiPath: "/api/revenue/pilot",
        sourceEqualsDeployedApplicationSource: false,
        sourceUpdateCreatesDeployment: false,
        futurePromotionOwner:
          unifiedControl.authoritySeparation.deploymentVerificationOwner,
      },
      publicOffer: {
        version: publicOffer.controllerVersion,
        issueNumber: publicOffer.publicOfferIssue,
        state: publicOffer.offer.publicState,
        primaryAuditPriceUsd: publicOffer.offer.primaryAuditPriceUsd,
        manifestDigest: publicOffer.manifestDigest,
        issueTitle: publicOffer.publicIssue.targetTitle,
        requestTitlePrefix: publicOffer.publicIssue.requestTitlePrefix,
        fitApprovalBinding: publicOffer.offer.fitApprovalBinding,
      },
      production: {
        controlVersion: publicOffer.production.controlVersion,
        reconciliationDigest: publicOffer.production.reconciliationDigest,
        applicationState: publicOffer.production.applicationState,
        controlState: publicOffer.production.controlState,
        deployedApplicationSource,
        deployId: publicOffer.production.deployId,
        verifiedRouteCount: publicOffer.production.verifiedRouteCount,
        exactBodyMatchCount: publicOffer.production.exactBodyMatchCount,
        repositoryRelationship:
          publicOffer.production.repositoryRelationship,
        sourceGap:
          productionReconciliation.stateClassification.sourceGap,
        repositorySourceIsCurrentlyDeployed: false,
        futurePromotionRequiresSeparateProviderEvidence: true,
      },
      canonical: {
        eventHeadSequence: publicOffer.canonical.eventHeadSequence,
        eventHeadDigest: publicOffer.canonical.eventHeadDigest,
        reconciliationSequence: publicOffer.canonical.reconciliationSequence,
        reconciliationDigest: publicOffer.canonical.reconciliationDigest,
        scopeDrafted: publicOffer.canonical.scopeDrafted,
        humanAccepted: publicOffer.canonical.humanAccepted,
        active: publicOffer.canonical.active,
        event2Present: publicOffer.canonical.event2Present,
      },
      consent: {
        packageState: publicOffer.consent.packageState,
        decision: publicOffer.consent.decision,
        independentVerificationPerformed:
          publicOffer.consent.independentVerificationPerformed,
        eligibleForCanonicalApplication:
          unifiedControl.consent.eligibleForCanonicalApplication,
        publicOfferOrContactProvesConsent:
          publicOffer.consent.publicOfferOrContactProvesConsent,
      },
      contact: {
        identityModel: publicOffer.contact.identityModel,
        channelModel: publicOffer.contact.channelModel,
        nativeWorkflowSoleWriter:
          publicOffer.contact.nativeWorkflowSoleWriter,
        maxAutomaticFirstResponsesPerIssue:
          publicOffer.contact.maxAutomaticFirstResponsesPerIssue,
        publicEmailRequired: publicOffer.contact.publicEmailRequired,
        repeatedUnsolicitedFollowUpAllowed:
          publicOffer.contact.repeatedUnsolicitedFollowUpAllowed,
        deliveryOrSilenceProvesConsent:
          publicOffer.contact.deliveryOrSilenceProvesConsent,
      },
      privateContinuity: {
        state: publicOffer.drive.state,
        version: publicOffer.drive.continuityVersion,
        knownDocumentCount: publicOffer.drive.knownDocumentCount,
        ownerOnly: publicOffer.drive.ownerOnly,
        shared: publicOffer.drive.shared,
        publicPrivateReferencesExposed:
          publicOffer.drive.publicPrivateReferencesExposed,
        receiptDigest: publicOffer.drive.receiptDigest,
      },
      offer: {
        name: experiment.offer.name,
        priceUsd: experiment.offer.priceUsd,
        firstMilestoneUsd: experiment.offer.firstMilestoneUsd,
        grossTargetUsd: experiment.offer.grossTargetUsd,
        capacity: experiment.offer.capacity,
        maxConcurrentDeliveries: experiment.offer.maxConcurrentDeliveries,
        deliveryWindowBusinessDays:
          experiment.offer.deliveryWindowBusinessDays,
        scopeLimits: experiment.offer.scopeLimits,
      },
      availability: {
        fitApprovedRequests: fardarterDrive.currentEvidence.fitApprovedRequests,
        orders: publicOffer.money.orders,
        slotsRemaining,
        activeDeliveries,
        standardActiveCeiling,
        effectiveActiveCeiling,
        activeHeadroom: publicOffer.capacity.activeHeadroom,
        backpressureActive: activeDeliveries >= effectiveActiveCeiling,
        deliveriesAccepted: experiment.metrics.deliveriesAccepted,
      },
      capacityOverride: {
        above100Allowed: fardarterDrive.capacityModel.aboveStandardAllowed,
        standardActiveCeiling,
        effectiveActiveCeiling,
        state: publicOffer.capacity.overrideState,
        activationTarget: "CAPACITY_OVERRIDE_ACTIVE",
        requestedActiveCeiling: capacityOverride.requestedActiveCeiling,
        approvedActiveCeiling: capacityOverride.approvedActiveCeiling,
        activationRequiresCompleteReceipt:
          fardarterDrive.capacityModel.activationRequiresCompleteReceipt,
        activationRequiresCanonicalMerge: true,
        automaticActivation: false,
        mayExceed100: true,
        mayExceedTotalPlanningCapacity: false,
        totalPlanningCapacity: publicOffer.capacity.totalPlanningSlots,
        rollbackCeiling: capacityOverride.backpressure.rollbackCeiling,
      },
      publicInterest: {
        openFitCheckRequests: publicInterest.publicRequestCount,
        sourceState: publicInterest.sourceState,
        sourceUrl: publicInterest.sourceUrl,
        countedAsOrders: false,
        reservesCapacity: false,
      },
      money: {
        settlementState: experiment.money.settlementState,
        grossRevenueUsd: publicOffer.money.verifiedGrossRevenueUsd,
        feesUsd: experiment.money.feesUsd,
        refundsUsd: experiment.money.refundsUsd,
        netCashUsd: publicOffer.money.verifiedSettledCashUsd,
        receivedCashRequires: publicOffer.money.receivedCashRequires,
      },
      legacyCompatibility: {
        driveId: fardarterDrive.driveId,
        driveName: fardarterDrive.name,
        controllingIssues: fardarterDrive.controllingIssues,
        acceptanceModel: fardarterDrive.acceptanceModel,
        executionModel: fardarterDrive.executionModel,
        horizons: fardarterDrive.horizons,
        progressionRules: fardarterDrive.progressionRules,
        authorityReceiptId: authorityReceipt.receiptId,
        authorityVersion: authorityReceipt.authorityVersion,
        googleDriveState: googleDriveReceipt.state,
      },
      authority: {
        capacity1000: grantStates.CAPACITY_1000,
        standardActiveLimit100: grantStates.STANDARD_ACTIVE_LIMIT_100,
        above100ActiveOverride: grantStates.ABOVE_100_ACTIVE_OVERRIDE,
        nonbindingFitAcceptance: grantStates.NONBINDING_FIT_ACCEPTANCE,
        preapprovedReversibleExecution:
          grantStates.PREAPPROVED_REVERSIBLE_EXECUTION,
        googleDrivePrivateContinuity:
          grantStates.GOOGLE_DRIVE_PRIVATE_CONTINUITY,
        relevantExactOutreach: grantStates.RELEVANT_EXACT_OUTREACH,
        verifiedMerge: grantStates.VERIFIED_MERGE,
        fixedSiteDeployment: grantStates.FIXED_SITE_DEPLOYMENT,
        contractAcceptance: grantStates.CONTRACT_ACCEPTANCE,
        indemnityAndLiabilityTerms:
          grantStates.INDEMNITY_AND_LIABILITY_TERMS,
        paymentExecution: grantStates.PAYMENT_EXECUTION,
        paidDeliveryStart: grantStates.PAID_DELIVERY_START,
        refundDisputeAdmissionOrIrreversibleAction:
          grantStates.REFUND_DISPUTE_ADMISSION_OR_IRREVERSIBLE_ACTION,
      },
      automatedFitAcceptance: {
        state: fardarterDrive.acceptanceModel.automatedState,
        binding: false,
        mayCreateOrder: false,
        mayReserveCapacity: false,
        mayAcceptFinalContract: false,
        mayRequestOrConfirmPayment: false,
        mayStartPaidDelivery: false,
      },
      approvedExecution: {
        state: fardarterDrive.executionModel.state,
        oneShotPerIssue: fardarterDrive.executionModel.oneShotPerIssue,
        permittedClasses: fardarterDrive.executionModel.permittedClasses,
        automaticPaidWorkStart: false,
        standardActiveCeiling,
        effectiveActiveCeiling,
      },
      googleDriveContinuity: {
        state: googleDriveReceipt.state,
        folderTitle: googleDriveReceipt.folderTitle,
        documentTitles: googleDriveReceipt.documents.map(
          (document) => document.title,
        ),
        knownDocumentCount: publicOffer.drive.knownDocumentCount,
        publicFolderUrlExposed: googleDriveReceipt.publicFolderUrlExposed,
        publicFileIdsExposed: googleDriveReceipt.publicFileIdsExposed,
        createPrivateWorkPackageAfterFitApproval:
          googleDriveReceipt.automation
            .createPrivateWorkPackageAfterFitApproval,
        validateCapacityOverride:
          googleDriveReceipt.automation.validateCapacityOverride,
        activateOverrideWithoutCompleteReceipt: false,
        workPackageCreatesContract: false,
        workPackageCreatesPaymentObligation: false,
        workPackageStartsPaidDelivery: false,
      },
      publication: {
        issueNumber: publicationReceipt.issueNumber,
        publicationUrl: publicationReceipt.publicationUrl,
        publishedAt: publicationReceipt.publishedAt,
        directOutreachSent: publicationReceipt.directOutreachSent,
      },
      evidenceBoundary: {
        receivedCashRequires: "PAID_SETTLED",
        repositorySourceEqualsDeployedApplicationSource: false,
        applicationSurfaceUpdateCreatesDeployment: false,
        publicOfferOrContactProvesConsent: false,
        capacityEqualsDemand: false,
        capacityEqualsCustomerCount: false,
        capacityEqualsOrders: false,
        capacityEqualsRevenue: false,
        above100CapacityIsAllowed: true,
        capacityOverrideActivatesWithoutReceipt: false,
        capacityOverrideMayExceedTotalPlanningCapacity: false,
        fitApprovedCreatesOrder: false,
        fitApprovedCreatesContract: false,
        fitApprovedStartsWork: false,
        documentDraftCreatesContract: false,
        invoiceDraftCreatesPaymentObligation: false,
        googleDriveFileCreatesSignature: false,
        googleDriveWorkPackageStartsPaidDelivery: false,
        horizonAmountIsAchievedRevenue: false,
        horizonAmountIsValuation: false,
        automaticStagePromotion: false,
        templateIsIndemnityProof: false,
        indemnityAndLiabilityTermsRequireCounselReview: true,
        buyerConsentRequiredForBindingAgreement: true,
        earningsGuaranteed: false,
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
