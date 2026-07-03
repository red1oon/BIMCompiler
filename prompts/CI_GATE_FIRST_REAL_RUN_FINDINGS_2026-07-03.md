# ⚠ DO NOT REMOVE — CI gate's first real run: findings, 2026-07-03
# Scope: the `system-is-real` CI gate (added de59bcb81, 2026-06-13) had never actually executed past its
# install step until today's fix (bc PR #31, merged). This doc records what that first real run revealed,
# so a future session scopes the fix instead of re-diagnosing from zero. Read the log after every run.

## What was fixed (already merged, don't redo)
Root cause of 3 weeks of CI failure: `.gitignore` excluded root `/package.json` + `/package-lock.json`
(added `c29bd3e34`, 2026-04-23 — 7 weeks *before* the CI workflow started assuming they were committed).
Every push-to-master died at `npm ci` (`ENOENT package.json`). Un-ignored + committed both as-is — bc PR #31.

## What that fix revealed — the gate has likely NEVER produced a real green run
First actual execution of `scripts/system_is_real.sh` in CI (run 28657114204): **380/547 checks passed, 167
failed.** This is not a regression from the package.json fix — it's the gate's true, previously-invisible
baseline. Two structural causes explain most of the 167, plus a small tail of genuine unrelated debt:

1. **Playwright/Browser E2E fails outright, no detail surfaced** (`✗ browser E2E` with a blank message).
   `.github/workflows/ci.yml` has no `npx playwright install` (or `--with-deps`) step anywhere — only
   `npm ci` for node deps. Playwright needs its own browser-binary download separate from `npm install`.
   Near-certain root cause for the bulk of the 167 (cascading: one missing binary → every Playwright-driven
   check in that regime fails). **Not yet confirmed by reading the raw Playwright launch error** — the
   wrapper script only prints ✓/✗, no stack trace. Next step: run `npx playwright install --with-deps
   chromium` locally in a clean env (or add the step to ci.yml on a throwaway branch) and re-run to confirm.

2. **"Version Fingerprint" check is structurally inapplicable to a CI runner** — it compares the git
   checkout's file hashes against a *live deployed* OCI bucket URL (`bim-ootb-full/sandbox/`). CI never runs
   a deploy step, so this will mismatch on every single run forever, regardless of code correctness. Current
   run reports 60 "DRIFTED FILES" — these aren't real drift, they're "this commit was never deployed," which
   is true of every CI checkout by design. This check belongs in the LOCAL pre-deploy discipline (per
   `docs/OCI_UPLOAD.md`), not as part of an automated PR/push gate that can't deploy.

3. **Smaller, real, pre-existing debt** (unrelated to 1/2, don't conflate): a Button Wiring Audit section
   flags a few unwired buttons (📊 export, Export Excel z-index/scoping) and the dev BOQ Excel export has
   some formatting-check misses (async writeBuffer, per-cell header fill, missing sheets). Genuine but small;
   lower priority than 1/2 since they're actual counted failures, not systemic false-fails.

4. **`audit_specs.js` WARN (correctly non-gating, already by design)** — 1 violation:
   `38-sh-dx-2d-runtime.spec.js` has 5 SKIP paths (tests that test nothing). Pre-existing debt, surfaced not
   gated, per the workflow's own stated design (`docs/TestArchitecture.md` §Anti-Drift). Not urgent, but a
   real, cheap fix if anyone's in that spec file.

## The decision this needs (user, not a coding call) — deferred 2026-07-03
User chose "merge the package.json fix now, document the rest for later" rather than committing to one of:
- **(a) Narrow the fail-fast gate** — downgrade the live-fingerprint check and (until Playwright is wired)
  the browser-E2E check to WARN-not-FAIL, same tier as `audit_specs.js` already gets, so the gate reflects
  what it can actually verify headlessly today. Smallest change, makes the gate meaningful again quickly,
  but narrows what it catches.
- **(b) Wire real Playwright into CI** — add the browser install step, then actually work through however
  many of the 167 are real once the binary-missing noise clears. Bigger scope, gets to a genuinely green
  headless gate, but unknown size until step 1 (browser install) isolates the real failure count.
- Whichever is picked, do NOT just re-enable a hard fail-fast on the current 167 without first separating
  "structurally can't pass in CI" (fingerprint) from "genuinely broken" (the rest) — conflating them is how
  a 3-week-invisible gate turns into a permanently-red one nobody trusts, which is the same failure class as
  the bug just fixed.

## Evidence trail
Full raw log: CI run `28657114204` (bim-compiler), artifact `system_is_real-log` (download via
`gh run download 28657114204 -n system_is_real-log`). PR #31 (merged, the package.json fix only — this doc's
findings are NOT in that PR, intentionally, per the user's "merge now, document separately" call.
