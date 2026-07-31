import { readFile } from "node:fs/promises";

const workflowPath = ".github/workflows/revenue-experiment.yml";
const packagePath = "package.json";
const workflow = await readFile(workflowPath, "utf8");
const pkg = JSON.parse(await readFile(packagePath, "utf8"));

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

for (const required of [
  "name: Verify Fardarter Drive v6.13 unified control",
  "node-version: 24",
  "Validate unified authority, production, contact, consent, Drive, capacity, money, and product",
  "FARDARTER-DRIVE-GITHUB-FIRST-RESPONSE-V6-9.json",
  "FARDARTER-DRIVE-DEPLOYMENT-LINEAGE-V6-10.json",
  "FARDARTER-DRIVE-PROMOTION-CANDIDATE-V6-11.json",
  "FARDARTER-DRIVE-PRODUCTION-RECONCILIATION-V6-12.json",
  "FARDARTER-DRIVE-GDRIVE-V6-13.json",
  "FARDARTER-DRIVE-UNIFIED-CONTROL-V6-13.json",
  "fardarter-drive-github-first-response-v6-9.schema.json",
  "fardarter-drive-deployment-lineage-v6-10.schema.json",
  "fardarter-drive-promotion-candidate-v6-11.schema.json",
  "fardarter-drive-production-reconciliation-v6-12.schema.json",
  "fardarter-drive-gdrive-v6-13.schema.json",
  "fardarter-drive-unified-control-v6-13.schema.json",
  "Fardarter Drive v6.13 JSON syntax: PASS",
  "controller_version=6.13.0",
  "unified_control_manifest_digest=2f33a58938a480b70ce9ea26e24c74677e6294e93729412e3fb81db006e5e29c",
  "drive_receipt_digest=8680243c828c6503d2aadd76b361cfea41482ec17f8fa29018947abcef3f3ea4",
  "production_control_version=6.12.0",
  "production_reconciliation_digest=1e8aa2af8bb3af332185b7419c63e2c1ad8c19c866e45b62fe04a2fc969932ee",
  "production_application=DEPLOYED_AND_VERIFIED",
  "production_control_state=RECONCILED",
  "deployed_application_source=88bd8dc89a0bd95f42c7e1a21dccc56fe9dc7334",
  "verified_deploy_id=6a6ba0366ebec6650d843ac3",
  "immutable_route_readback=18/18",
  "repository_head_relationship=CONTROL_AHEAD_OF_DEPLOYED_APPLICATION_SOURCE",
  "deployment_verification_owner=FARDARTER_DRIVE_LIVE_WATCH",
  "github_contact_identity=GITHUB_ISSUE_AUTHOR",
  "github_contact_channel=EXACT_GITHUB_ISSUE_THREAD",
  "github_first_response_owner=NATIVE_V6_9_WORKFLOW",
  "gmail_authenticated_sender=justin.rackham@gmail.com",
  "private_drive_state=CONNECTED_PRIVATE",
  "private_drive_known_documents=17",
  "canonical_head_sequence=1",
  "human_accepted=0",
  "active_deliveries=0",
  "orders=0",
  "verified_revenue_usd=0",
  "settled_cash_usd=0",
  "consent_package_state=NO_PACKAGE",
  "consent_decision=AWAITING_COUNTERPARTY_EVIDENCE",
  "control_decision=HOLD_FOR_GENUINE_EXTERNAL_INPUT",
  "public_deployment=DEPLOYED_AND_VERIFIED",
  "consequential_effects=ZERO",
]) {
  assert(workflow.includes(required), `aggregate revenue receipt missing ${required}`);
}

for (const stale of [
  "name: Verify Fardarter Drive v6.7 consent evidence",
  "controller_version=6.7.0",
  "public_deployment=UNVERIFIED",
  "Fardarter Drive v6.7 JSON syntax: PASS",
]) {
  assert(!workflow.includes(stale), `stale aggregate revenue receipt remains: ${stale}`);
}

assert(
  workflow.includes("permissions:\n  contents: read") &&
    !workflow.includes("issues: write") &&
    !workflow.includes("deploy --") &&
    !workflow.includes("netlify deploy") &&
    !workflow.includes("send_email"),
  "aggregate revenue verification must remain read-only and non-executing",
);

assert(
  pkg.scripts["fardarter:revenue-receipt:check"] ===
    "node scripts/check-fardarter-revenue-receipt-v6-13.mjs" &&
    pkg.scripts["revenue:verify"].includes("npm run fardarter:revenue-receipt:check"),
  "aggregate revenue receipt verifier is not integrated",
);

console.log(
  JSON.stringify(
    {
      status: "PASS",
      control: "FARDARTER-DRIVE-REVENUE-RECEIPT-V6-13",
      controllerVersion: "6.13.0",
      production: "DEPLOYED_AND_VERIFIED/RECONCILED",
      canonical: "1/1",
      consent: "NO_PACKAGE/AWAITING_COUNTERPARTY_EVIDENCE",
      drive: "CONNECTED_PRIVATE/17",
      decision: "HOLD_FOR_GENUINE_EXTERNAL_INPUT",
      staleReceiptRemoved: true,
    },
    null,
    2,
  ),
);
