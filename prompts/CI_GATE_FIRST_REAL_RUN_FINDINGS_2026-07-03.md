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

---

# ▶ §2026-09-15 — RE-MEASURED. The warning at the bottom of this file came true.

This file closed by warning that conflating "structurally can't pass in CI" with "genuinely broken" is
"how a 3-week-invisible gate turns into a permanently-red one nobody trusts." That is now the fact:

**`ci.yml` has NEVER produced a green run. Every one of its last 200 runs failed** (`gh run list
--workflow=ci.yml --limit 200` → 198 `failure`, 2 in-flight), back to the oldest listed, 2026-07-05.
PRs #101-#106 all merged through a red gate because there is no other option. A gate that has never
been green is not a gate; it is a 10-minute tax on every push.

**The 2026-07-03 diagnosis above was half right, and the half it got wrong is the expensive half.**
Hypothesis 1 blamed missing Playwright binaries for "the bulk of the 167". Measured today: Browser E2E
(§15) is now a WARN tier and contributes ~0. Hypothesis 2 (live-fingerprint structurally inapplicable)
was right AND was acted on — §9b/§13/§15 are WARN now. But the checks that actually produce the
failures were never separated, because nobody counted them by section.

## The measured breakdown — run `34907896124`, 150 failed of 558. Reproduced LOCALLY, and the ONE
## difference is itself the proof.

Local `CI=1 node deploy/dev/test_all.js`: **exit 1, 149 failed of 561** — every section below matches
CI's count exactly (94/36/6/5/4/3/1), so none of it is a CI-environment artifact. The single
discrepancy is §14, which fails in CI and PASSES locally: that is precisely the `spawnSync ETIMEDOUT`
already classified as runner env, and it accounts for the whole 150-vs-149 gap. (561 vs 558 checks:
the local run was on `fable/meshdb-livewire`, which carries 3 more checks than master.)

| n | section | verdict |
|---|---|---|
| **94** | §8b OCI Live (bim-ootb root) | **CANNOT EVER PASS** — see below |
| **36** | §8 OCI Live (bim-ootb-full/sandbox/) | wrong enumeration source — see below |
| 6 | §12 S210 Deployment Safety | ⚠ candidate REAL |
| 5 | §4 onclick → window exports | 5/5 FALSE POSITIVE |
| 4 | §11 Button Wiring Audit | test follows a refactored-away UI |
| 3 | §10 URL Integrity | ⚠ candidate REAL |
| 1 | §6 No Stale References | FALSE POSITIVE — it matched a code COMMENT |
| 1 | §14 Rollback Dry Run | `spawnSync /bin/sh ETIMEDOUT` — runner env, not product |

**130 of 150 (87%) are two checks asserting a deployment layout that does not exist.**

### §8b (94) — asserts a frozen April demo is a full mirror
`BASE_DEMO` is the `bim-ootb` bucket ROOT, and §8b requires all 109 `deploy/dev/*.js` to be 200 there.
Measured: that root holds **15** `.js` (`city config excel issues loader main measure panels picking
scene sitecam streaming tools tour walk`), **last modified 2026-04-21/22 and untouched since** — a
frozen legacy demo, never a mirror. 109 − 15 = 94, exactly the failure count. **This check has been
arithmetically impossible since the day it was written** (`f129504a8`, 2026-05-04).

### §8 (36) — right bucket, wrong local directory
`test_all.js` lives in `deploy/dev/` and uses `DIR = __dirname`, so it enumerates the **dev** tree and
demands every file in it be live. But the bucket mirrors the *deploy* trees, and it is IN SYNC:

| local dir | `.js` | present in `bim-ootb-full/o/sandbox/` | missing |
|---|---|---|---|
| `deploy/dev/` | 109 | 73 | **36** ← the failures |
| `deploy/sandbox/` | 22 | **22** | **0** |
| `deploy/live/` | 52 | **52** | **0** |

Nothing is undeployed. `deploy/dev/` legitimately carries 36 files that were never meant to ship, and
the bucket carries 34 `.js` the dev tree does not have. §9b's own remediation hint already names the
right source — `--file deploy/sandbox/${f}` — while the code it sits next to reads `deploy/dev/`.

### §9b is a SILENT-SUBSTITUTION BUG, not just a noisy warning (§PRIME LESSON shape)
§9b fetches with `curl -s` and **never checks the status code**. For a missing object it hashes the
404 body and prints it as live content. Proven: the OCI error body
`{"code":"ObjectNotFound","message":"The object 'sandbox/blank_open.js' was not found...}` has
md5[:8] = **`fff4de49`** — byte-for-byte the value the CI log reports as `live=fff4de49` for that file.
**So a DELETED object is indistinguishable from a DRIFTED one, and both are non-gating WARNs.** Fixing
§8's enumeration without fixing this would hide real deletions behind a warning.

### The 10 false positives, named so nobody re-chases them
- **§4 (5/5).** The check is `mainJs.includes('window.'+fn)` — it greps **only `main.js`**. All four
  named handlers are exported, just elsewhere: `toggleAllPanels` `panels.js:787` · `toggleMobilePill`
  `panels.js:957` · `addScissorsBookmark` `index.html:568` · `deleteScissorsBookmark` `index.html:588`.
  The 5th, **`if`**, is a regex artifact: `onclick="if (...)"` matches `/onclick="(\w+)\(/`.
- **§6 (1/1).** `no landing2.html references` matches a **comment** — `import_db_builder.js:11`,
  "// Both landing2.html and import.js call buildImportDBs". The check greps raw source, comments included.
- **§11 (4/4, probable).** It looks for a literal 📊 emoji button in HTML; that UI became an SVG icon
  button (`panels.js:901`, id `report`), and `export4D5D` IS wired (`main.js:121`, called `scene.js:682`).

### The only candidates worth a product look: 9 of 150
§12 (6) and §10 (3), both about the same artifact: **`deploy/dev/boq_charts.html` is dated Jun 4** and
lacks what the checks expect (PACKAGE 1 SUBSTRUCTURE, per-discipline sheets, chart embedding, async
`save4D`/`save5D`, per-cell header fill), plus §10's `export4D5D` greedy base regex (302 chars instead
of 82 when `?db=&lib=` is present). Unverified against the DEPLOYED copy — that is the next step, and it
must compare like with like (the §8 mistake in miniature).

## THE DECISION THIS NEEDS (still the user's, still not a coding call)
The 2026-07-03 options (a)/(b) are now moot — Playwright was never the problem. The live choice is:

- **(a) Point the existence checks at the deploy trees and re-gate.** §8 enumerates `deploy/live/` +
  `deploy/sandbox/` instead of `deploy/dev/`; §8b is DELETED (its target is a frozen April demo, it can
  never pass and asserts nothing true); §9b gains an HTTP-status check so "absent" stops masquerading as
  "drift". Expected result: 130 failures → 0, leaving ~20 to triage honestly, of which 10 are already
  proven false positives. **This is the smallest change that makes the gate mean something.**
- **(b) Leave it red and stop pretending.** Make `system-is-real` non-blocking, so nobody reads a red X
  as signal. Honest, costs nothing, fixes nothing.
- **(c) Delete the OCI existence checks from CI entirely** — a PR gate cannot deploy, so "is it live?" is
  a pre-deploy discipline (`docs/OCI_UPLOAD.md`), not a gate on a checkout that was never deployed. This
  is hypothesis 2's argument extended from drift to existence, where it applies just as well.

⚠ **Do NOT "fix" the 36 by uploading `deploy/dev/` to the bucket.** That would push 36 undeployed
development files into the live sandbox to make a wrong test green.

## Evidence trail
CI run `34907896124`, artifact `system_is_real-log` (`gh run download 34907896124 -n system_is_real-log`).
Bucket state read live from the OCI list API 2026-09-15. Local reproduction: `CI=1 node
deploy/dev/test_all.js` on this checkout — same failure census, section for section.
