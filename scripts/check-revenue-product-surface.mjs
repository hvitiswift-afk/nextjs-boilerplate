import { readFile } from "node:fs/promises";

const paths = {
  page: "app/github-control-tower-audit/page.tsx",
  api: "app/api/revenue/pilot/route.ts",
  home: "app/page.tsx",
  experiment: "examples/revenue-experiment.sample.json",
  publication: "receipts/revenue/JP-REV-001-PUBLICATION.json",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [page, api, home, experimentText, publicationText] = await Promise.all([
  readFile(paths.page, "utf8"),
  readFile(paths.api, "utf8"),
  readFile(paths.home, "utf8"),
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
  assert(source.includes("Math.max"), `${label} must compute non-negative slot availability`);
}

assert(page.includes("issues/133"), "product page must link to the launch issue");
assert(page.includes("control-tower-audit-request.yml"), "product page must link to the controlled request form");
assert(page.includes("not an earnings forecast"), "product page must preserve the earnings boundary");
assert(page.includes("does not create a contract"), "product page must preserve the contract boundary");
assert(page.includes("credentials"), "product page must warn against credential disclosure");
assert(page.includes("payment data"), "product page must warn against payment-data disclosure");
assert(page.includes("/api/revenue/pilot"), "product page must expose the machine-readable snapshot");

assert(api.includes('receivedCashRequires: "PAID_SETTLED"'), "API must declare the received-cash evidence state");
assert(api.includes("openingAnIssueCreatesContract: false"), "API must not imply a contract from issue intake");
assert(api.includes("earningsGuaranteed: false"), "API must not imply guaranteed earnings");
assert(api.includes('"Cache-Control": "public, max-age=0, must-revalidate"'), "API must require revalidation");

assert(home.includes('href="/github-control-tower-audit"'), "homepage must link to the product surface");
assert(home.includes("Open $100 GitHub Audit"), "homepage must expose the pilot CTA");

const forbiddenPublicClaims = [
  "guaranteed income",
  "guaranteed revenue",
  "tax deductible donation",
  "security certified",
  "payment received",
];
const combined = `${page}\n${api}\n${home}`.toLowerCase();
for (const phrase of forbiddenPublicClaims) {
  assert(!combined.includes(phrase), `forbidden public claim found: ${phrase}`);
}

console.log("Revenue product surface: PASS");
console.log(`Route: /github-control-tower-audit`);
console.log(`Status API: /api/revenue/pilot`);
console.log(`Price: $${experiment.offer.priceUsd}`);
console.log(`Slots remaining: ${slotsRemaining}/${experiment.offer.capacity}`);
console.log(`Verified settled cash: $${experiment.money.netCashUsd}`);
console.log(`Publication issue: #${publication.issueNumber}`);
