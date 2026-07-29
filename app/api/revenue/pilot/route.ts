import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V4.json";
import fardarterDrive from "@/receipts/revenue/FARDARTER-DRIVE-V4.json";
import chainReceipt from "@/receipts/revenue/JP-REV-001-CHAIN-133-140.json";
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

  return Response.json(
    {
      schemaVersion: "1.3.0",
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
        orders: experiment.metrics.orders,
        slotsRemaining,
        activeDeliveryLimit: experiment.offer.maxConcurrentDeliveries,
        qualifiedConversations: experiment.metrics.qualifiedConversations,
        deliveriesAccepted: experiment.metrics.deliveriesAccepted,
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
      channel: {
        name: experiment.channel.name,
        publicationAuthorized: experiment.channel.publicationAuthorized,
        outreachAuthorized: experiment.channel.outreachAuthorized,
        inboundRequestPath: experiment.channel.inboundRequestPath,
      },
      fardarterDrive: {
        driveId: fardarterDrive.driveId,
        name: fardarterDrive.name,
        trademarkNotice: fardarterDrive.trademarkNotice,
        controllingIssues: fardarterDrive.controllingIssues,
        currentEvidence: fardarterDrive.currentEvidence,
        horizons: fardarterDrive.horizons.map((horizon) => ({
          stageId: horizon.stageId,
          amountUsd: horizon.amountUsd,
          label: horizon.label,
          classification: horizon.classification,
          achieved: horizon.achieved,
          forecast: horizon.forecast,
          guaranteed: horizon.guaranteed,
        })),
        progressionRules: fardarterDrive.progressionRules,
        legalRisk: fardarterDrive.legalRisk,
        claims: fardarterDrive.claims,
      },
      authority: {
        receiptId: authorityReceipt.receiptId,
        version: authorityReceipt.authorityVersion,
        authorizedBy: authorityReceipt.authorizedBy,
        authorizedAt: authorityReceipt.authorizedAt,
        supersedesForFutureActions:
          authorityReceipt.supersedesForFutureActions,
        historicalReceiptsRemainValid:
          authorityReceipt.historicalReceiptsRemainValid,
        revoked: authorityReceipt.revoked,
        scaleHorizonPublication:
          grantStates.SCALE_HORIZON_PUBLICATION,
        repositoryImplementation:
          grantStates.REPOSITORY_IMPLEMENTATION_AND_RECEIPTS,
        documentDraftAutomation:
          grantStates.DOCUMENT_DRAFT_AUTOMATION,
        relevantExactOutreach:
          grantStates.RELEVANT_EXACT_OUTREACH,
        automatedIntake: {
          state: grantStates.GITHUB_INBOUND_AUTOMATION,
          exactTitlePrefix: "[Audit request]:",
          mayLabel: true,
          mayAcknowledgeOnce: true,
          mayCreateOrder: false,
          mayReserveCapacity: false,
          mayAcceptContract: false,
          mayRequestPayment: false,
          mayStartDelivery: false,
        },
        verifiedMerge: grantStates.VERIFIED_MERGE,
        fixedSiteDeployment: grantStates.FIXED_SITE_DEPLOYMENT,
        contractAcceptance: grantStates.CONTRACT_ACCEPTANCE,
        indemnityAndLiabilityTerms:
          grantStates.INDEMNITY_AND_LIABILITY_TERMS,
        paymentExecution: grantStates.PAYMENT_EXECUTION,
        deliveryStart: grantStates.DELIVERY_START,
        refundDisputeOrAdmission:
          grantStates.REFUND_DISPUTE_OR_ADMISSION,
        consequentialAccountActions:
          grantStates.BANK_BILLING_DOMAIN_CREDENTIAL_OR_DESTRUCTIVE_ACTION,
      },
      chainReceipt: {
        receiptId: chainReceipt.receiptId,
        result: chainReceipt.result,
        firstObject: chainReceipt.chain[0].number,
        lastObject: chainReceipt.chain.at(-1)?.number,
        objectCount: chainReceipt.chain.length,
        items: chainReceipt.chain.map((item) => ({
          number: item.number,
          objectType: item.objectType,
          state: item.state,
          evidenceState: item.evidenceState,
          mergeCommitSha: item.mergeCommitSha,
        })),
      },
      publication: {
        issueNumber: publicationReceipt.issueNumber,
        publicationUrl: publicationReceipt.publicationUrl,
        publishedAt: publicationReceipt.publishedAt,
        directOutreachSent: publicationReceipt.directOutreachSent,
      },
      evidenceBoundary: {
        receivedCashRequires: "PAID_SETTLED",
        openingAnIssueCreatesContract: false,
        openingAnIssueCreatesPaymentObligation: false,
        publicFitCheckCountsAsOrder: false,
        publicFitCheckReservesCapacity: false,
        githubLabelProvesPayment: false,
        automatedAcknowledgementAcceptsScope: false,
        automatedAcknowledgementStartsDelivery: false,
        documentDraftCreatesContract: false,
        invoiceDraftCreatesPaymentObligation: false,
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
