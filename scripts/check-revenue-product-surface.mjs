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
  authority: "receipts/revenue/FARDARTER-DRIVE-AUTHORITY-V4.json",
  drive: "receipts/revenue/FARDARTER-DRIVE-V4.json",
  chain: "receipts/revenue/JP-REV-001-CHAIN-133-140.json",
  intakeWorkflow: ".github/workflows/audit-request-intake.yml",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const entries = await Promise.all(
  Object.entries(paths).map(async ([key, path]) => [key, await readFile(path, "utf8")]),
);
const text = Object.fromEntries(entries);

const experiment = JSON.parse(text.experiment);
const publication = JSON.parse(text.publication);
const authority = JSON.parse(text.authority);
const drive = JSON.parse(text.drive);
const chain = JSON.parse(text.chain);
const slotsRemaining = Math.max(
  experiment.offer.capacity - experiment.metrics.orders,
  0,
);

assert(experiment.schemaVersion === "1.2.0", "product surface requires revenue schema 1.2.0");
assert(experiment.status === "PUBLISHED", "product surface requires PUBLISHED experiment state");
assert(experiment.channel.publicationAuthorized === true, "GitHub publication must be authorized");
assert(experiment.channel.outreachAuthorized === false, "legacy experiment channel must not claim direct outreach");
assert(publication.issueNumber === 133, "publication receipt must point to Issue #133");
assert(publication.directOutreachSent === 0, "publication receipt must record zero direct outreach");
assert(authority.authorityVersion === "4.0.0", "authority receipt must be version 4.0.0");
assert(authority.authorizedBy === "JP", "authority receipt must identify JP");
assert(authority.revoked === false, "authority receipt must remain active");
assert(drive.driveId === "FARDARTER-DRIVE-V4", "product surface must use Fardarter Drive v4");
assert(chain.result === "CHAIN_RESOLVED", "product surface requires the resolved #133–#140 chain");
assert(experiment.offer.priceUsd === 100, "pilot price must remain $100 USD");
assert(experiment.offer.quantityTarget === 10, "quantity target must be ten");
assert(experiment.offer.capacity === 10, "pilot capacity must be ten audits");
assert(experiment.offer.maxConcurrentDeliveries === 2, "active delivery limit must remain two");
assert(experiment.offer.firstMilestoneUsd === 500, "first milestone must remain $500 USD");
assert(experiment.offer.grossTargetUsd === 1000, "current gross target must remain $1,000 USD");
assert(slotsRemaining >= 0 && slotsRemaining <= experiment.offer.capacity, "computed slot count is invalid");
assert(experiment.metrics.orders === 0, "public baseline must not claim orders");
assert(experiment.money.netCashUsd === 0, "product snapshot must not claim unverified cash");

for (const [label, source] of [["page", text.page], ["api", text.api]]) {
  assert(source.includes("revenue-experiment.sample.json"), `${label} must import the canonical experiment record`);
  assert(source.includes("JP-REV-001-PUBLICATION.json"), `${label} must import the publication receipt`);
  assert(source.includes("FARDARTER-DRIVE-AUTHORITY-V4.json"), `${label} must import authority v4`);
  assert(source.includes("FARDARTER-DRIVE-V4.json"), `${label} must import the Fardarter Drive record`);
  assert(source.includes("JP-REV-001-CHAIN-133-140.json"), `${label} must import the chain receipt`);
  assert(source.includes("getPublicAuditInterest"), `${label} must use the live public-interest source`);
  assert(source.includes("Math.max"), `${label} must compute non-negative slot availability`);
}

assert(text.interest.includes("api.github.com/repos/hvitiswift-afk/nextjs-boilerplate/issues"), "interest source must use the public repository issue API");
assert(text.interest.includes('const auditRequestTitlePrefix = "[Audit request]:"'), "interest source must use the controlled request prefix");
assert(text.interest.includes("issue.pull_request === undefined"), "interest source must exclude pull requests");
assert(text.interest.includes("countedAsOrders: false"), "interest source must not count fit checks as orders");
assert(text.interest.includes("reservesCapacity: false"), "interest source must not reserve capacity");
assert(text.interest.includes("next: { revalidate: 900 }"), "interest source must use bounded revalidation");

assert(text.page.includes("issues/133"), "product page must link to the launch issue");
assert(text.page.includes("issues/141"), "product page must link to Fardarter Drive Issue #141");
assert(text.page.includes("control-tower-audit-request.yml"), "product page must link to the controlled request form");
assert(text.page.includes("does not create a contract"), "product page must preserve the no-contract boundary");
assert(text.page.includes("capacity reservation"), "product page must explain that fit checks do not reserve capacity");
assert(text.page.includes("credentials"), "product page must warn against credential disclosure");
assert(text.page.includes("payment data"), "product page must warn against payment-data disclosure");
assert(text.page.includes("Public fit checks"), "product page must display the public-interest class");
assert(text.page.includes("Fardarter Drive™"), "product page must display Fardarter Drive");
assert(text.page.includes("Aspirational horizons — not achieved revenue"), "product page must distinguish horizons from revenue");
assert(text.page.includes("not indemnity-proof"), "product page must preserve the indemnity boundary");
assert(text.page.includes("authorityReceipt.authorityVersion"), "product page must display authority version evidence");
assert(text.page.includes('"@type": "Service"'), "product page must publish Service structured data");
assert(text.page.includes('"@type": "FAQPage"'), "product page must publish FAQ structured data");
assert(text.page.includes("inventoryLevel"), "structured offer data must expose computed availability");
assert(text.page.includes("/api/revenue/pilot"), "product page must expose the machine-readable snapshot");

assert(text.api.includes('schemaVersion: "1.3.0"'), "API must expose schema version 1.3.0");
assert(text.api.includes("firstMilestoneUsd"), "API must expose the first milestone");
assert(text.api.includes("maxConcurrentDeliveries"), "API must expose the active-delivery cap");
assert(text.api.includes("fardarterDrive"), "API must expose Fardarter Drive separately");
assert(text.api.includes("chainReceipt"), "API must expose the #133–#140 chain receipt");
assert(text.api.includes("publicInterest"), "API must expose public interest separately");
assert(text.api.includes("countedAsOrders: false"), "API must not count fit checks as orders");
assert(text.api.includes("reservesCapacity: false"), "API must not reserve capacity from fit checks");
assert(text.api.includes("documentDraftCreatesContract: false"), "API must deny draft/contract equivalence");
assert(text.api.includes("invoiceDraftCreatesPaymentObligation: false"), "API must deny invoice-draft/payment equivalence");
assert(text.api.includes("horizonAmountIsAchievedRevenue: false"), "API must deny horizon/revenue equivalence");
assert(text.api.includes("horizonAmountIsValuation: false"), "API must deny horizon/valuation equivalence");
assert(text.api.includes("templateIsIndemnityProof: false"), "API must deny indemnity-proof status");
assert(text.api.includes("indemnityAndLiabilityTermsRequireCounselReview: true"), "API must publish the counsel gate");
assert(text.api.includes("buyerConsentRequiredForBindingAgreement: true"), "API must publish the buyer-consent gate");
assert(text.api.includes('receivedCashRequires: "PAID_SETTLED"'), "API must declare the received-cash evidence state");
assert(text.api.includes('"Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600"'), "API must use bounded public revalidation");

assert(text.intakeWorkflow.includes("issues:"), "intake automation must use the issues event");
assert(text.intakeWorkflow.includes("startsWith(github.event.issue.title, '[Audit request]:')"), "intake automation must use the exact request prefix");
assert(text.intakeWorkflow.includes("issues: write"), "intake automation needs only bounded issue write access");
assert(text.intakeWorkflow.includes("jp-audit-intake-v1"), "intake automation must use an idempotency marker");
assert(text.intakeWorkflow.includes("not-an-order"), "intake automation must label requests as not orders");
assert(text.intakeWorkflow.includes("comments.some"), "intake automation must prevent duplicate acknowledgements");
assert(text.intakeWorkflow.match(/createComment/g)?.length === 1, "intake automation must have one comment path");
assert(!text.intakeWorkflow.includes("pull_request_target"), "intake automation must not use pull_request_target");

assert(text.sitemap.includes("/github-control-tower-audit"), "sitemap must include the product route");
assert(text.sitemap.includes("getSiteUrl"), "sitemap must use the canonical site helper");
assert(text.robots.includes("sitemap.xml"), "robots policy must publish the sitemap location");
assert(text.robots.includes("getSiteUrl"), "robots policy must use the canonical site helper");
assert(text.siteUrl.includes("lichburn-v0-2-8.netlify.app"), "site helper must preserve the confirmed Netlify fallback");
assert(text.openGraph.includes("ImageResponse"), "product surface must provide a generated social image");
assert(text.openGraph.includes("experiment.offer.priceUsd"), "social image must use canonical price data");
assert(text.openGraph.includes("experiment.offer.capacity"), "social image must use canonical capacity data");

assert(text.home.includes('href="/github-control-tower-audit"'), "homepage must link to the product surface");
assert(text.home.includes("Open $100 GitHub Audit"), "homepage must expose the pilot CTA");

const forbiddenPublicClaims = [
  "guaranteed income",
  "guaranteed revenue",
  "tax deductible donation",
  "security certified",
  "payment received",
  "indemnity-proof status achieved",
];
const combined = `${text.page}\n${text.openGraph}\n${text.api}\n${text.home}\n${text.sitemap}\n${text.robots}\n${text.interest}\n${text.intakeWorkflow}`.toLowerCase();
for (const phrase of forbiddenPublicClaims) {
  assert(!combined.includes(phrase), `forbidden public claim found: ${phrase}`);
}

console.log("Fardarter Drive revenue product surface: PASS");
console.log("Route: /github-control-tower-audit");
console.log("Status API: /api/revenue/pilot");
console.log("Discovery: /sitemap.xml + /robots.txt + generated Open Graph image");
console.log(`Price: $${experiment.offer.priceUsd}`);
console.log(`Current gross target: $${experiment.offer.grossTargetUsd}`);
console.log(`Slots remaining: ${slotsRemaining}/${experiment.offer.capacity}`);
console.log(`Maximum active deliveries: ${experiment.offer.maxConcurrentDeliveries}`);
console.log(`Authority version: ${authority.authorityVersion}`);
console.log(`Chain receipt: #${chain.chain[0].number}–#${chain.chain.at(-1).number}/${chain.result}`);
console.log("Higher horizons: unachieved, nonforecast, and not valuations");
console.log("Legal status: counsel-gated and not indemnity-proof");
console.log(`Verified settled cash: $${experiment.money.netCashUsd}`);
console.log(`Publication issue: #${publication.issueNumber}`);
