import experiment from "@/examples/revenue-experiment.sample.json";
import publicationReceipt from "@/receipts/revenue/JP-REV-001-PUBLICATION.json";

export const dynamic = "force-static";

export function GET() {
  const slotsRemaining = Math.max(
    experiment.offer.capacity - experiment.metrics.orders,
    0,
  );

  return Response.json(
    {
      schemaVersion: "1.0.0",
      experimentId: experiment.experimentId,
      status: experiment.status,
      offer: {
        name: experiment.offer.name,
        priceUsd: experiment.offer.priceUsd,
        grossTargetUsd: experiment.offer.grossTargetUsd,
        capacity: experiment.offer.capacity,
        deliveryWindowBusinessDays:
          experiment.offer.deliveryWindowBusinessDays,
        scopeLimits: experiment.offer.scopeLimits,
      },
      availability: {
        orders: experiment.metrics.orders,
        slotsRemaining,
        qualifiedConversations: experiment.metrics.qualifiedConversations,
        deliveriesAccepted: experiment.metrics.deliveriesAccepted,
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
        earningsGuaranteed: false,
      },
      nextControlledAction: experiment.nextControlledAction,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    },
  );
}
