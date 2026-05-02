import fs from "node:fs";

const samplePath = "examples/griploom-science-source-rail.sample.json";
const receipt = JSON.parse(fs.readFileSync(samplePath, "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const sourceByName = new Map(receipt.sources.map((source) => [source.name, source]));
const physorg = sourceByName.get("Phys.org");
const iflscience = sourceByName.get("IFLScience");
const ftlscience = sourceByName.get("FTLScience");

assert(receipt.id === "receipt-griploom-science-source-rail-001", "science source rail receipt id is required");
assert(receipt.kind === "griploom-science-source-rail", "science source rail kind is required");
assert(receipt.rule === "Science news opens the gate. Primary evidence carries the beam.", "science rule must match");
assert(Array.isArray(receipt.intake_flow), "intake flow must be an array");
assert(receipt.intake_flow.includes("label_uncertainty"), "intake flow must label uncertainty");
assert(receipt.intake_flow.includes("publish_sourced_summary"), "intake flow must publish only sourced summaries");

assert(physorg?.status === "active", "Phys.org must be active");
assert(physorg?.url === "https://phys.org/", "Phys.org URL must be canonical");
assert(physorg?.requires_primary_crosscheck_for_strong_claims, "Phys.org strong claims must require primary crosscheck");

assert(iflscience?.status === "active", "IFLScience must be active");
assert(iflscience?.url === "https://www.iflscience.com/", "IFLScience URL must be canonical");
assert(iflscience?.allowed_use.includes("popular_science"), "IFLScience must be tagged as popular science");
assert(iflscience?.requires_primary_crosscheck_for_strong_claims, "IFLScience strong claims must require primary crosscheck");

assert(ftlscience?.status === "unverified", "FTLScience must remain unverified until canonical source is confirmed");
assert(ftlscience?.url === "pending", "FTLScience URL must remain pending until confirmed");
assert(ftlscience?.allowed_use.includes("candidate_only"), "FTLScience must be candidate-only while unverified");

assert(receipt.claim_rules?.news_articles_are_not_primary_evidence, "news articles must not be treated as primary evidence");
assert(receipt.claim_rules?.label_speculative_or_single_study_claims, "speculative or single-study claims must be labeled");
assert(receipt.claim_rules?.date_every_current_or_research_dependent_claim, "current/research-dependent claims must be dated");
assert(receipt.tags.includes("SOURCE_PRIMARY_NEEDED"), "SOURCE_PRIMARY_NEEDED tag is required");
assert(receipt.tags.includes("SOURCE_UNVERIFIED"), "SOURCE_UNVERIFIED tag is required");

console.log(JSON.stringify({
  id: "check-griploom-science-source-rail-sample",
  status: "passed",
  file: samplePath,
  rule: receipt.rule
}, null, 2));
