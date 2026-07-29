import experiment from "@/examples/revenue-experiment.sample.json";
import authorityReceipt from "@/receipts/revenue/JP-REV-001-AUTHORITY.json";
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

  return Response.json(
    {
      schemaVersion: "1.2.0",
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
      authority: {
        receiptId: authorityReceipt.receiptId,
        version: authorityReceipt.authorityVersion,
        authorizedBy: authorityReceipt.authorizedBy,
        authorizedAt: authorityReceipt.authorizedAt,
        revoked: authorityReceipt.revoked,
        automatedIntake: {
          state: "AUTHORIZED_ACTIVE",
          exactTitlePrefix: "[Audit request]:",
          mayLabel: true,
          mayAcknowledgeOnce: true,
          mayCreateOrder: false,
          mayReserveCapacity: false,
          mayAcceptContract: false,
          mayRequestPayment: false,
          mayStartDelivery: false,
        },
        directOutreach: "NOT_AUTHORIZED",
        contractAcceptance: "HUMAN_APPROVAL_REQUIRED",
        paymentExecution: "EXTERNAL_PROVIDER_ONLY",
        deliveryStart: "HUMAN_APPROVAL_REQUIRED",
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
        earningsGuaranteed: false,
      },
      nextControlledAction: experiment.nextControlledAction,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    },
  );
}
