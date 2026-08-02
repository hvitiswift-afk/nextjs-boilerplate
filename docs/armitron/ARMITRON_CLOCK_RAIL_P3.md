# Armitron Clock Rail P3

## Identity

- Component: `VSHARP-COMP-ARMITRON-001`
- Protocol: `JP-XYZ-VSHARP-ARMITRON-COMPONENT/1`
- Owner and concept direction: JP / Justin Lee Rackham
- Scope: standard engineering component within the JP V# ecosystem
- Default timezone: `America/Detroit`

Armitron is the shared timebase, watchdog, timer-window, cooldown, lockout,
deadline, failover, manual-event, and receipt-timestamp layer. It does not
claim direct control of a physical watch.

## Clock matrix

Every Armitron receipt samples all registered modes:

- observed local sources: `wall`, `monotonic`, `high_resolution`
- timer modes: `chronograph`, `countdown`, `interval`, `alarm`, `second_timezone`
- V# profiles: `atomic`, `ionic`, `sonic`, `phonic`, `positronic`, `nuclear`,
  `neutronic`, `synthezoid`, `gray`, `ray`, `orbital`, `quartz`, `circadian`,
  `domain`, `facility`, `oracle`, and `nexter`

The `--clock` option selects the primary operating view. It never removes the
rest of the matrix from the receipt.

## Truth boundaries

- Wall, monotonic, and high-resolution values are observations of the local
  operating system or current process.
- Atomic mode carries the cesium-133 reference value `9,192,631,770 Hz`, but
  defaults to `REFERENCE_PROFILE_UNCONNECTED`. It is not a claim that the
  machine is synchronized to an atomic laboratory.
- Ionic mode defaults to `SYMBOLIC_IONIC_COUNTDOWN_UNCONNECTED`. It does not
  claim a trapped-ion or optical-clock connection.
- Gray Clock maps a bounded tick to binary-reflected Gray code. It is a stable
  state representation, not a more accurate source of time.
- Ray Clock is a radial phase and uncertainty representation. It does not mean
  ionizing radiation.
- Sonic, phonic, positronic, nuclear, neutronic, synthezoid, orbital, quartz,
  circadian, domain, facility, oracle, and nexter are V# control profiles unless
  a separately verified adapter states otherwise.
- Exact integer storage is not evidence of physical accuracy. Receipts include
  uncertainty and connection state.

## Receipt contract

Each start, end, or failure receipt includes:

- lane: browser, email, GitHub, or general
- event and action state
- wall time and Unix nanoseconds
- monotonic and high-resolution companions
- timezone
- uncertainty
- source, authentication, connection, traceability, and leap-indicator states
- the complete clock matrix
- watchdog health and duration when wrapping a command
- prior digest and current digest

Secrets are redacted. Resolved email addresses are replaced with SHA-256
identifiers. Runtime receipts are stored under `.armitron/`, which is ignored by
git.

## Browser lane

```bash
node tools/browser-bridge/p1/armitron-browser.mjs help
node tools/browser-bridge/p1/armitron-browser.mjs doctor
node tools/browser-bridge/p1/armitron-browser.mjs run
```

Default primary view: `gray`. Override locally with
`JP_ARMITRON_BROWSER_CLOCK`.

## Gmail lane

```bash
node tools/gmail-bridge/p2/armitron-email.mjs help
node tools/gmail-bridge/p2/armitron-email.mjs accounts
node tools/gmail-bridge/p2/armitron-email.mjs authorize \
  --role enterprise-facing \
  --expect-email "$JP_GMAIL_ENTERPRISE_EMAIL"
```

Default primary view: `atomic`. Atomic remains an unconnected reference profile
unless a real traceability adapter is verified. Override locally with
`JP_ARMITRON_EMAIL_CLOCK`.

The Gmail OAuth bridge still requires each account owner to complete Google
sign-in, MFA or human verification, and OAuth consent. Armitron records the
handoff and result; it does not bypass authentication.

## GitHub lane

```bash
node tools/armitron/v23/armitron-wrap.mjs \
  --lane github \
  --clock atomic \
  -- npm run build
```

The `Armitron Clock Rail P3 Verify` workflow automatically runs the verifier,
exercises browser and email help paths through their lane wrappers, runs the
application build through the GitHub lane, and uploads the clock receipts.

## Verification

```bash
node scripts/check-armitron-clock-p3.mjs
```

The verifier checks:

- complete clock registry
- one-bit adjacency for Gray Clock transitions
- cesium reference constant
- Atomic and Ionic truth boundaries
- unknown-clock fail-closed behavior
- receipt digest chaining
- secret redaction and email hashing
- browser, email, and GitHub lane wrappers
- watchdog health

Verified GitHub Actions result on August 2, 2026:

- workflow: `Armitron Clock Rail P3 Verify`
- run: `30768793435`
- head: `634425e7b1c4c819c2779017f0379e2365ab5fc8`
- conclusion: `success`
- artifact: `armitron-clock-p3-verification`
- artifact ID: `8839834290`
- digest: `sha256:864f565bec64d8a7119e58a6f8c5a8827c03e45cf1df8be281986e7c401017c4`
- retention through: `2026-09-01T21:51:44Z`

The Gmail P2 verification, Next.js build, and existing repository lineage gates
also passed on the same head.

## Phone and Google OAuth state

The code and CI can be developed from this session, but the current Google
installed-app OAuth callback must execute on the same desktop as the local
companion. A phone-only session cannot receive that desktop loopback callback.
The bridge is therefore prepared and verified while both account grants remain
`LOCAL_OAUTH_NOT_RUN` until JP has access to a desktop.

A future Google Cloud connector should automate project, API, consent-screen,
and OAuth-client administration through an explicit connected service. No such
connector is currently claimed or emulated here. This is tracked in issue #266.
