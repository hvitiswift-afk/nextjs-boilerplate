import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V6.json";
import fardarterDrive from "@/receipts/revenue/FARDARTER-DRIVE-V6.json";
import googleDriveReceipt from "@/receipts/revenue/FARDARTER-DRIVE-GDRIVE-V6.json";
import capacityOverride from "@/receipts/revenue/FARDARTER-DRIVE-CAPACITY-OVERRIDE-V6.sample.json";
import publicationReceipt from "@/receipts/revenue/JP-REV-001-PUBLICATION.json";
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
  const effectiveActiveCeiling = fardarterDrive.capacityModel.effectiveActiveCeiling;
  const activeDeliveries = fardarterDrive.currentEvidence.activeDeliveries;

  return Response.json(
    {
      schemaVersion: "1.5.0",
      experimentId: experiment.experimentId,
      status: experiment.status,
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
        orders: experiment.metrics.orders,
        slotsRemaining,
        activeDeliveries,
        standardActiveCeiling,
        effectiveActiveCeiling,
        activeHeadroom: Math.max(effectiveActiveCeiling - activeDeliveries, 0),
        backpressureActive: activeDeliveries >= effectiveActiveCeiling,
        deliveriesAccepted: experiment.metrics.deliveriesAccepted,
      },
      capacityOverride: {
        above100Allowed: fardarterDrive.capacityModel.aboveStandardAllowed,
        standardActiveCeiling,
        effectiveActiveCeiling,
        state: capacityOverride.state,
        activationTarget: "CAPACITY_OVERRIDE_ACTIVE",
        requestedActiveCeiling: capacityOverride.requestedActiveCeiling,
        approvedActiveCeiling: capacityOverride.approvedActiveCeiling,
        activationRequiresCompleteReceipt:
          fardarterDrive.capacityModel.activationRequiresCompleteReceipt,
        activationRequiresCanonicalMerge: true,
        automaticActivation: false,
        mayExceed100: true,
        mayExceedTotalPlanningCapacity: false,
        totalPlanningCapacity: fardarterDrive.capacityModel.totalPlanningCapacity,
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
        grossRevenueUsd: experiment.money.grossRevenueUsd,
        feesUsd: experiment.money.feesUsd,
        refundsUsd: experiment.money.refundsUsd,
        netCashUsd: experiment.money.netCashUsd,
      },
      fardarterDrive: {
        driveId: fardarterDrive.driveId,
        name: fardarterDrive.name,
        controllingIssues: fardarterDrive.controllingIssues,
        currentEvidence: fardarterDrive.currentEvidence,
        capacityModel: fardarterDrive.capacityModel,
        acceptanceModel: fardarterDrive.acceptanceModel,
        executionModel: fardarterDrive.executionModel,
        horizons: fardarterDrive.horizons,
        progressionRules: fardarterDrive.progressionRules,
        legalRisk: fardarterDrive.legalRisk,
        claims: fardarterDrive.claims,
      },
      authority: {
        receiptId: authorityReceipt.receiptId,
        version: authorityReceipt.authorityVersion,
        authorizedBy: authorityReceipt.authorizedBy,
        authorizedAt: authorityReceipt.authorizedAt,
        revoked: authorityReceipt.revoked,
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
      nextControlledAction: fardarterDrive.nextControlledAction,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
