# Unity Health Hacks

Evidence-first health education and lifestyle-support platform under active development.

## Current source model

- **Public baseline:** `main` remains the protected public 9.3 source until an explicitly verified promotion.
- **Active development:** `development/uhh-9-5-integrated` is the current 9.5 implementation branch.
- **Durable project/recovery record:** Google Drive / My Drive holds appropriate governance, evidence, decisions, checkpoints, recovery metadata, and audit receipts.
- **Source code and engineering history:** GitHub is authoritative.
- **Runtime / hosting / structured state:** use the verified platform appropriate to each function; do not force Drive to act as a database, queue, runtime, or code mirror.

Always direct-read the current branch head before making changes. Do not roll back to a SHA copied from an older handoff.

## Development rules

1. Facts first. Transparency always. Assumptions never.
2. Do not represent unfinished capabilities as live.
3. Source-regression green does **not** equal hosted-runtime, device, customer-flow, commerce, or release green.
4. Production AI, sensitive-health storage, live checkout, and unfinished paid capabilities stay disabled until their specific architecture, safety, privacy, security, business, and acceptance gates are proven.
5. Preserve evidence-first health wording. Do not add unsupported diagnosis, cure, treatment, guaranteed-outcome, or fear-based claims.
6. Do not create work simply to create work. Fix real defects, verify them, preserve the result, and move forward.

## Tier One regression

The controlled GitHub Actions workflow is:

`.github/workflows/uhh-tier-one-regression.yml`

It provides deterministic source-level checks for the current development baseline, including source integrity, local links/assets, accessibility semantics, keyboard/navigation safeguards, privacy/security boundaries, ingredient/food-tool regressions, service-worker safeguards, and 9.5 identity checks.

A successful run proves only the checks executed against that exact commit.

## Current product posture

The 9.5 branch is an implementation/test build intended for continued owner review, revision, rejuvenation, and feature development. Current product areas include goal-first routing, the 30-day foundation, gut/microbiome education, food and ingredient tools, Guardian prototypes, daily/member experience concepts, learning content, membership/support architecture, safety/evidence standards, and future program expansion.

Pricing, final paid tiers, production Guardian/AI, secure member health data, commerce, detailed Days 31–90, and other unfinished capabilities must remain truthfully labeled until they are specifically approved and verified.

## Recovery rule

Do not depend on a ChatGPT conversation for recovery. Before continuing development:

1. Read the current UHH recovery/authority record in Drive.
2. Read the live GitHub branch heads.
3. Confirm the exact source commit and regression status.
4. Confirm any runtime/deployment state separately before making runtime-green claims.
5. Continue only from the newest verified descendant.

**Build → test → verify → fix → learn → improve → preserve → move forward.**
