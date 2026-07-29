# Fardarter Drive™ Indemnity and Liability Readiness

**Status:** internal planning and counsel-review framework  
**Binding effect:** none by itself  
**Legal representation:** none  
**Indemnity-proof claim:** prohibited

This document improves issue spotting, evidence retention, negotiation readiness, and drafting consistency. It cannot guarantee enforceability, eliminate liability, replace insurance, or substitute for legal advice.

## 1. Required facts before drafting

Do not finalize indemnity or liability terms until these facts are resolved:

- complete legal name and address of each party;
- entity type and jurisdiction of organization;
- signatory identity and authority;
- exact service, product, repository, deliverables, dependencies, and exclusions;
- whether buyer materials, instructions, specifications, code, data, brands, or content are used;
- private-data, confidentiality, security, export, sanctions, accessibility, employment, tax, and regulatory implications;
- expected contract value, foreseeable loss categories, insurance, and risk tolerance;
- governing law, venue, dispute forum, and available remedies;
- subcontractors, third-party services, open-source licenses, and platform terms.

Unknown facts remain unknown. Do not fill them with assumptions.

## 2. Authority and consent gate

A final agreement must record:

- each party's authority to enter the agreement;
- the buyer's authority to provide repositories, instructions, specifications, data, and content;
- informed acceptance of scope, price, due date, cancellation/refund terms, delivery destination, and risk allocation;
- the exact version accepted by both parties;
- effective date and signature or another legally reviewed acceptance mechanism.

Generated text, GitHub activity, a fit-check issue, a label, a payment screenshot, an invoice draft, or silence does not establish acceptance.

## 3. Indemnity drafting checklist

Counsel should determine whether indemnity is mutual, one-way, limited, or inappropriate. A draft should make explicit:

- **covered claims:** third-party claims only or also direct claims;
- **trigger:** breach, negligence, infringement, law violation, buyer-provided materials, unauthorized instructions, or another defined event;
- **covered losses:** judgments, approved settlements, reasonable defense costs, or specifically defined losses;
- **causal standard:** arising from, caused by, or to the extent caused by;
- **exclusions:** the indemnified party's own acts, unauthorized changes, misuse, continued use after notice, or combinations not supplied by the indemnifying party;
- **notice:** timing, required information, and consequences of delayed notice;
- **defense control:** who selects counsel and controls strategy;
- **cooperation:** documents, witnesses, and reasonable assistance;
- **settlement approval:** no admission, nonmonetary obligation, or settlement without defined consent;
- **insurance interaction:** primary, excess, waiver, subrogation, or proof-of-coverage rules where appropriate;
- **survival:** how long obligations continue;
- **nonwaivable exceptions:** any matters that applicable law or counsel determines cannot or should not be limited.

Never label a clause “indemnity-proof,” “lawsuit-proof,” or universally enforceable.

## 4. Limitation-of-liability checklist

Counsel should consider:

- aggregate cap basis: fees paid, fees payable, insurance proceeds, fixed amount, or another negotiated measure;
- time window used to calculate the cap;
- whether separate caps apply to confidentiality, data, intellectual property, indemnity, or security obligations;
- treatment of indirect, incidental, special, consequential, exemplary, punitive, lost-profit, lost-revenue, lost-data, or business-interruption damages;
- carve-outs for fraud, intentional misconduct, bad faith, unauthorized disclosure, infringement, payment obligations, or other matters;
- whether remedies are exclusive or cumulative;
- whether the allocation is conspicuous and mutually understood;
- whether the cap remains commercially meaningful relative to risk and insurance.

A liability cap should not be described as effective until the final agreement is accepted and enforceability is assessed for the relevant facts and law.

## 5. Warranties, disclaimers, and no-reliance

A final draft should clearly distinguish:

- factual promises expressly included in the scope;
- acceptance criteria;
- professional or reasonable-care standard, if agreed;
- buyer responsibilities and dependencies;
- third-party platform availability and terms;
- open-source and third-party components;
- no guarantee of revenue, financing, valuation, deployment approval, legal compliance, security certification, or a particular business result;
- statements excluded from reliance, subject to applicable law;
- remedies for a missing promised section versus a new or expanded request.

Do not disclaim facts that are knowingly false or use a disclaimer to contradict a specific affirmative representation.

## 6. Buyer-provided materials and instructions

The agreement should require the buyer to represent, as appropriate, that it:

- has authority to request the work;
- has rights to provide repositories, code, content, data, marks, instructions, and specifications;
- will not provide credentials or unlawful, confidential, regulated, or third-party material without an approved secure process;
- will review deliverables before consequential use;
- remains responsible for production decisions, deployment, legal compliance, and business judgment unless the final agreement explicitly assigns a responsibility elsewhere.

A buyer representation is evidence to preserve, not a substitute for due diligence when warning signs appear.

## 7. Security, confidentiality, and data boundary

Before private or regulated data enters scope, resolve:

- permitted data categories;
- access method and least privilege;
- retention and deletion schedule;
- encryption and secure transfer;
- incident notification;
- subprocessors and third-party services;
- backup and recovery;
- audit records;
- applicable privacy, sector, location, and contractual requirements.

The current public GitHub pilot prohibits credentials, payment data, customer identity, confidential records, and protected health information in public issues.

## 8. Insurance and financial protection

At larger risk or scale, evaluate with qualified advisers:

- professional liability/errors and omissions;
- cyber liability;
- commercial general liability;
- workers' compensation and employment coverage;
- directors and officers coverage;
- intellectual-property or media liability;
- contractual-liability coverage and exclusions;
- limits, deductibles, retroactive dates, exclusions, and certificates.

An indemnity promise without financial capacity or suitable insurance may not provide practical protection.

## 9. Dispute, refund, and claim handling

No automated system may:

- admit fault or liability;
- waive rights;
- accept a demand;
- issue or promise a refund;
- respond substantively to a chargeback or legal claim;
- agree to settlement, arbitration, venue, or governing law;
- disclose privileged, confidential, payment, or identity records.

Required response rail:

```text
preserve evidence
→ acknowledge receipt without admission when approved
→ identify agreement and provider records
→ notify insurer or counsel when required
→ evaluate cure, revision, refund, dispute, defense, or settlement options
→ obtain JP approval
→ execute through the proper provider or legal process
→ preserve final receipt
```

## 10. Evidence and version lock

Preserve privately when applicable:

- final proposal and scope version;
- buyer authority and acceptance;
- contract version and signatures;
- provider settlement receipt;
- repository URL, visibility, and snapshot SHA;
- inputs and buyer-provided specifications;
- delivery artifact hash or immutable reference;
- acceptance, revision, cancellation, refund, or dispute record;
- notices, claim correspondence, insurer/counsel instructions, and resolution.

Public receipts should use anonymous or non-sensitive references.

## 11. Automated drafting boundaries

Automation may:

- populate known factual fields;
- create options and issue checklists;
- detect missing terms;
- compare versions;
- generate redacted, public-safe receipts;
- prevent send or acceptance when required fields are missing.

Automation may not:

- invent party identity, authority, jurisdiction, insurance, or legal conclusions;
- choose a binding indemnity or liability allocation without review;
- sign, accept, or send a final agreement without the defined approval;
- treat a draft invoice as payment due or settled;
- treat a horizon as achieved revenue;
- claim the resulting document is indemnity-proof.

## 12. Counsel review trigger

Obtain qualified legal review when any of these applies:

- indemnity or liability language will be binding;
- a private repository, personal data, regulated data, confidential information, or credentials are involved;
- work affects production, safety, employment, finance, health, critical infrastructure, or legal rights;
- the buyer requests warranties, insurance, ownership transfer, exclusivity, noncompete, arbitration, or unusual remedies;
- contract value or possible loss exceeds the current low-risk pilot assumption;
- cross-border, tax, export, sanctions, licensing, or consumer-law issues arise;
- a claim, threatened claim, refund demand, chargeback, subpoena, or dispute exists.

## 13. Readiness state

```text
Template prepared                 YES
Binding indemnity accepted        NO
Liability cap accepted            NO
Governing law selected            NO
Insurance confirmed               NO
Counsel review completed          NO
Indemnity-proof status claimed    NO
```

## Next controlled action

Use the agreement draft only as a counsel-review and negotiation checklist. Lock exact facts, preserve buyer consent, and keep final acceptance, payment, work start, refunds, disputes, and legal risk allocation behind authority v4 gates.
