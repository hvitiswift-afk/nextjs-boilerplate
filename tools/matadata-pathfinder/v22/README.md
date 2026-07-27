# MATADATA OpenAI Pathfinder V2.4

V2.4 stages a human-gated, exactly-once submission runner for the reviewed non-confidential MATADATA Cybersecurity Grant Program application.

## Human boundary

JP personally completes CAPTCHA, identity, signature, human-verification, and applicant-acknowledgment steps. Pathfinder may fill the reviewed application and perform no more than one authorized Submit click after all validation gates pass. Direct remote taps on OpenAI's Submit control are blocked.

## Repairs carried forward

- 13 unique application fields, resolved by stable control `name` first.
- Every control is resolved afresh for each fill attempt and again for verification.
- Project title and its helper text are treated as one field.
- Every field is reverified before acknowledgment and immediately before Submit.
- Interactive-control and official-terms-text-only acknowledgment presentations are supported.
- JP's personal acknowledgment and three stable acknowledgment observations are required.
- Trusted OpenAI origin checks, in-run and cross-run locks, and positive confirmation evidence remain mandatory.

## V2.4 canonical textarea verification

The V2.3 run stopped safely after acknowledgment with `submitClicks: 0` because OpenAI returned the funding textarea with one additional terminal line break: expected length 960, observed length 961. V2.4 compares textarea values canonically:

- exact content is accepted;
- CRLF and CR line endings are normalized to LF;
- one additional terminal line break is accepted for a textarea only;
- spaces, changed words, added paragraphs, deleted text, multiple extra line breaks, and all other substantive differences remain blocking errors.

The field manifest records both raw and canonical hashes, lengths, length delta, and comparison mode.

## Integrity

- Package SHA-256: `3fd7760d1237ecef90db65a1ba6a5b90e6b4ad88a411626528b3ff12f4c07ea4`
- Runner SHA-256: `491c542b849a33c4f6caa8df24525566b07e820d6cd45eda1a47489729ae48ab`
- Runner gzip SHA-256: `6c36a3917bf109599310d7d31e17fb60696808b6062032ec7ce9345104918e35`
- Application SHA-256: `54a4f19763f3d5ac2cbddc57d946f30fe4a7cd3938908c570443c5996120812a`
- Package file: `package.tar.gz`

Pull-request updates run offline preflight only. A live run requires a separate commit-bound one-submit authorization and execution-title edit.
