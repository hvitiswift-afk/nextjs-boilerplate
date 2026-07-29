import { readFile } from "node:fs/promises";

const paths = {
  page: "app/github-control-tower-audit/page.tsx",
  openGraph: "app/github-control-tower-audit/opengraph-image.tsx",
  api: "app/api/revenue/pilot/route.ts",
  home: "app/page.tsx",
  sitemap: "app/sitemap.ts",
  robots: "app/robots.ts",
  interest: "src/lib/revenue/public-audit-interest.ts",
  siteUrl: "src/lib/site-url.ts",
  experiment: "examples/revenue-experiment.sample.json",
  publication: "receipts/revenue/JP-REV-001-PUBLICATION.json",
  authority: "receipts/revenue/JP-REV-001-AUTHORITY.json",
  intakeWorkflow: ".github/workflows/audit-request-intake.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [
  page,
  openGraph,
  api,
  home,
  sitemap,
  robots,
  interest,
  siteUrl,
  experimentText,
  publicationText,
  authorityText,
  intakeWorkflow,
] = await Promise.all([
  readFile(paths.page, "utf8"),
  readFile(paths.openGraph, "utf8"),
  readFile(paths.api, "utf8"),
  readFile(paths.home, "utf8"),
  readFile(paths.sitemap, "utf8"),
  readFile(paths.robots, "utf8"),
  readFile(paths.interest, "utf8"),
  readFile(paths.siteUrl, "utf8"),
  readFile(paths.experiment, "utf8"),
  readFile(paths.publication, "utf8"),
  readFile(paths.authority, "utf8"),
  readFile(paths.intakeWorkflow, "utf8"),
]);

const experiment = JSON.parse(experimentText);
const publication = JSON.parse(publicationText);
const authority = JSON.parse(authorityText);
const slotsRemaining = Math.max(
  experiment.offer.capacity - experiment.metrics.orders,
  0,
);

assert(experiment.schemaVersion === "1.2.0", "product surface requires revenue schema 1.2.0");
assert(experiment.status === "PUBLISHED", "product surface requires PUBLISHED experiment state");
assert(experiment.channel.publicationAuthorized === true, "GitHub publication must be authorized");
assert(experiment.channel.outreachAuthorized === false, "direct outreach must remain unauthorized");
assert(publication.issueNumber === 133, "publication receipt must point to Issue #133");
assert(publication.directOutreachSent === 0, "publication receipt must record zero direct outreach");
assert(authority.authorityVersion === "3.0.0", "authority receipt must be version 3.0.0");
assert(authority.authorizedBy === "JP", "authority receipt must identify JP");
assert(authority.revoked === false, "authority receipt must remain active");
assert(experiment.authorityReceiptPath === paths.authority, "experiment must link the canonical authority receipt");
assert(experiment.offer.priceUsd === 100, "pilot price must remain $100 USD");
assert(experiment.offer.quantityTarget === 10, "quantity target must be ten");
assert(experiment.offer.capacity === 10, "pilot capacity must be ten audits");
assert(experiment.offer.maxConcurrentDeliveries === 2, "active delivery limit must remain two");
assert(experiment.offer.firstMilestoneUsd === 500, "first milestone must remain $500 USD");
assert(experiment.offer.grossTargetUsd === 1000, "expanded gross target must remain $1,000 USD");
assert(slotsRemaining >= 0 && slotsRemaining <= experiment.offer.capacity, "computed slot count is invalid");
assert(experiment.metrics.orders === 0, "public baseline must not claim orders");
assert(experiment.money.netCashUsd === 0, "product snapshot must not claim unverified cash");

for (const [label, source] of [["page", page], ["api", api]]) {
  assert(source.includes("revenue-experiment.sample.json"), `${label} must import the canonical experiment record`);
  assert(source.includes("JP-REV-001-PUBLICATION.json"), `${label} must import the publication receipt`);
  assert(source.includes("JP-REV-001-AUTHORITY.json"), `${label} must import the authority receipt`);
  assert(source.includes("getPublicAuditInterest"), `${label} must use the live public-interest source`);
  assert(source.includes("Math.max"), `${label} must compute non-negative slot availability`);
}

assert(interest.includes("api.github.com/repos/hvitiswift-afk/nextjs-boilerplate/issues"), "interest source must use the public repository issue API");
assert(interest.includes('const auditRequestTitlePrefix = "[Audit request]:"'), "interest source must use the controlled request prefix");
assert(interest.includes("issue.pull_request === undefined"), "interest source must exclude pull requests");
assert(interest.includes("countedAsOrders: false"), "interest source must not count fit checks as orders");
assert(interest.includes("reservesCapacity: false"), "interest source must not reserve capacity");
assert(interest.includes("next: { revalidate: 900 }"), "interest source must use bounded revalidation");

assert(page.includes("issues/133"), "product page must link to the launch issue");
assert(page.includes("control-tower-audit-request.yml"), "product page must link to the controlled request form");
assert(page.includes("not an earnings forecast"), "product page must preserve the earnings boundary");
assert(page.includes("does not create a contract"), "product page must preserve the no-contract boundary");
assert(page.includes("capacity reservation"), "product page must explain that fit checks do not reserve capacity");
assert(page.includes("credentials"), "product page must warn against credential disclosure");
assert(page.includes("payment data"), "product page must warn against payment-data disclosure");
assert(page.includes("Public fit checks"), "product page must display the public-interest class");
assert(page.includes("Active limit"), "product page must display the active-delivery limit");
assert(page.includes("First milestone"), "product page must display the first milestone");
assert(page.includes("Expanded target"), "product page must display the expanded gross target");
assert(page.includes("authorityReceipt.authorityVersion"), "product page must display authority version evidence");
assert(page.includes('"@type": "Service"'), "product page must publish Service structured data");
assert(page.includes('"@type": "FAQPage"'), "product page must publish FAQ structured data");
assert(page.includes("inventoryLevel"), "structured offer data must expose computed availability");
assert(page.includes("/api/revenue/pilot"), "product page must expose the machine-readable snapshot");

assert(api.includes('schemaVersion: "1.2.0"'), "API must expose schema version 1.2.0");
assert(api.includes("firstMilestoneUsd"), "API must expose the first milestone");
assert(api.includes("maxConcurrentDeliveries"), "API must expose the active-delivery cap");
assert(api.includes("publicInterest"), "API must expose public interest separately");
assert(api.includes("countedAsOrders: false"), "API must not count fit checks as orders");
assert(api.includes("reservesCapacity: false"), "API must not reserve capacity from fit checks");
assert(api.includes("publicFitCheckCountsAsOrder: false"), "API evidence boundary must deny fit-check/order equivalence");
assert(api.includes("publicFitCheckReservesCapacity: false"), "API evidence boundary must deny fit-check reservation");
assert(api.includes("githubLabelProvesPayment: false"), "API must deny label/payment equivalence");
assert(api.includes("automatedAcknowledgementAcceptsScope: false"), "API must deny acknowledgement/scope equivalence");
assert(api.includes("automatedAcknowledgementStartsDelivery: false"), "API must deny acknowledgement/work-start equivalence");
assert(api.includes('receivedCashRequires: "PAID_SETTLED"'), "API must declare the received-cash evidence state");
assert(api.includes('directOutreach: "NOT_AUTHORIZED"'), "API must publish the outbound authority boundary");
assert(api.includes('contractAcceptance: "HUMAN_APPROVAL_REQUIRED"'), "API must publish the contract gate");
assert(api.includes('paymentExecution: "EXTERNAL_PROVIDER_ONLY"'), "API must publish the payment gate");
assert(api.includes('deliveryStart: "HUMAN_APPROVAL_REQUIRED"'), "API must publish the delivery gate");
assert(api.includes('"Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600"'), "API must use bounded public revalidation");

assert(intakeWorkflow.includes("issues:"), "intake automation must use the issues event");
assert(intakeWorkflow.includes("startsWith(github.event.issue.title, '[Audit request]:')"), "intake automation must use the exact request prefix");
assert(intakeWorkflow.includes("issues: write"), "intake automation needs only bounded issue write access");
assert(intakeWorkflow.includes("jp-audit-intake-v1"), "intake automation must use an idempotency marker");
assert(intakeWorkflow.includes("not-an-order"), "intake automation must label requests as not orders");
assert(intakeWorkflow.includes("comments.some"), "intake automation must prevent duplicate acknowledgements");
assert(intakeWorkflow.match(/createComment/g)?.length === 1, "intake automation must have one comment path");
assert(!intakeWorkflow.includes("pull_request_target"), "intake automation must not use pull_request_target");

assert(sitemap.includes("/github-control-tower-audit"), "sitemap must include the product route");
assert(sitemap.includes("getSiteUrl"), "sitemap must use the canonical site helper");
assert(robots.includes("sitemap.xml"), "robots policy must publish the sitemap location");
assert(robots.includes("getSiteUrl"), "robots policy must use the canonical site helper");
assert(siteUrl.includes("lichburn-v0-2-8.netlify.app"), "site helper must preserve the confirmed Netlify fallback");
assert(openGraph.includes("ImageResponse"), "product surface must provide a generated social image");
assert(openGraph.includes("experiment.offer.priceUsd"), "social image must use canonical price data");
assert(openGraph.includes("experiment.offer.capacity"), "social image must use canonical capacity data");

assert(home.includes('href="/github-control-tower-audit"'), "homepage must link to the product surface");
assert(home.includes("Open $100 GitHub Audit"), "homepage must expose the pilot CTA");

const forbiddenPublicClaims = [
  "guaranteed income",
  "guaranteed revenue",
  "tax deductible donation",
  "security certified",
  "payment received",
];
const combined = `${page}\n${openGraph}\n${api}\n${home}\n${sitemap}\n${robots}\n${interest}\n${intakeWorkflow}`.toLowerCase();
for (const phrase of forbiddenPublicClaims) {
  assert(!combined.includes(phrase), `forbidden public claim found: ${phrase}`);
}

console.log("Revenue authority product surface: PASS");
console.log("Route: /github-control-tower-audit");
console.log("Status API: /api/revenue/pilot");
console.log("Discovery: /sitemap.xml + /robots.txt + generated Open Graph image");
console.log(`Price: $${experiment.offer.priceUsd}`);
console.log(`First milestone: $${experiment.offer.firstMilestoneUsd}`);
console.log(`Expanded gross target: $${experiment.offer.grossTargetUsd}`);
console.log(`Slots remaining: ${slotsRemaining}/${experiment.offer.capacity}`);
console.log(`Maximum active deliveries: ${experiment.offer.maxConcurrentDeliveries}`);
console.log(`Authority version: ${authority.authorityVersion}`);
console.log("Automated intake: exact-prefix labels + one acknowledgement; never order/reservation/payment/work start");
console.log("Public fit checks: live GitHub count, never orders or reservations");
console.log(`Verified settled cash: $${experiment.money.netCashUsd}`);
console.log(`Publication issue: #${publication.issueNumber}`);
