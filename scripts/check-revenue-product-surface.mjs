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
]);

const experiment = JSON.parse(experimentText);
const publication = JSON.parse(publicationText);
const slotsRemaining = Math.max(
  experiment.offer.capacity - experiment.metrics.orders,
  0,
);

assert(experiment.status === "PUBLISHED", "product surface requires PUBLISHED experiment state");
assert(experiment.channel.publicationAuthorized === true, "GitHub publication must be authorized");
assert(experiment.channel.outreachAuthorized === false, "direct outreach must remain unauthorized");
assert(publication.issueNumber === 133, "publication receipt must point to Issue #133");
assert(publication.directOutreachSent === 0, "publication receipt must record zero direct outreach");
assert(experiment.offer.priceUsd === 100, "pilot price must remain $100 USD");
assert(experiment.offer.capacity === 5, "pilot capacity must remain five audits");
assert(experiment.offer.grossTargetUsd === 500, "gross target must remain $500 USD");
assert(slotsRemaining >= 0 && slotsRemaining <= experiment.offer.capacity, "computed slot count is invalid");
assert(experiment.money.netCashUsd === 0, "product snapshot must not claim unverified cash");

for (const [label, source] of [["page", page], ["api", api]]) {
  assert(source.includes("revenue-experiment.sample.json"), `${label} must import the canonical experiment record`);
  assert(source.includes("JP-REV-001-PUBLICATION.json"), `${label} must import the publication receipt`);
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
assert(page.includes("does not create a contract"), "product page must preserve the contract boundary");
assert(page.includes("does not create a contract"), "product page must preserve the no-contract boundary");
assert(page.includes("capacity reservation"), "product page must explain that fit checks do not reserve capacity");
assert(page.includes("credentials"), "product page must warn against credential disclosure");
assert(page.includes("payment data"), "product page must warn against payment-data disclosure");
assert(page.includes("Public fit checks"), "product page must display the public-interest class");
assert(page.includes('"@type": "Service"'), "product page must publish Service structured data");
assert(page.includes('"@type": "FAQPage"'), "product page must publish FAQ structured data");
assert(page.includes("/api/revenue/pilot"), "product page must expose the machine-readable snapshot");

assert(api.includes("publicInterest"), "API must expose public interest separately");
assert(api.includes("countedAsOrders: false"), "API must not count fit checks as orders");
assert(api.includes("reservesCapacity: false"), "API must not reserve capacity from fit checks");
assert(api.includes("publicFitCheckCountsAsOrder: false"), "API evidence boundary must deny fit-check/order equivalence");
assert(api.includes("publicFitCheckReservesCapacity: false"), "API evidence boundary must deny fit-check reservation");
assert(api.includes('receivedCashRequires: "PAID_SETTLED"'), "API must declare the received-cash evidence state");
assert(api.includes("openingAnIssueCreatesContract: false"), "API must not imply a contract from issue intake");
assert(api.includes("earningsGuaranteed: false"), "API must not imply guaranteed earnings");
assert(api.includes('"Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600"'), "API must use bounded public revalidation");

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
const combined = `${page}\n${openGraph}\n${api}\n${home}\n${sitemap}\n${robots}\n${interest}`.toLowerCase();
for (const phrase of forbiddenPublicClaims) {
  assert(!combined.includes(phrase), `forbidden public claim found: ${phrase}`);
}

console.log("Revenue product surface: PASS");
console.log("Route: /github-control-tower-audit");
console.log("Status API: /api/revenue/pilot");
console.log("Discovery: /sitemap.xml + /robots.txt + generated Open Graph image");
console.log(`Price: $${experiment.offer.priceUsd}`);
console.log(`Slots remaining: ${slotsRemaining}/${experiment.offer.capacity}`);
console.log("Public fit checks: live GitHub count, never orders or reservations");
console.log(`Verified settled cash: $${experiment.money.netCashUsd}`);
console.log(`Publication issue: #${publication.issueNumber}`);
