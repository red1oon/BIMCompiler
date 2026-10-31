# How to verify the terms (Team mode)

Team mode makes a short list of promises: the **terms**. Each one is backed by a test, and each test carries a deliberately broken
case that must be refused. A term counts as met only when its test passes **and** every broken case was seen being refused. You do not need the
author to check this; you need Node 18 or newer and the two repositories checked out. No network is used.

Spec and history: `prompts/TEAMWORK_FRAMEWORK.md` §48 (lexicon, ledger, runner).

## 1. Run it

```
node scripts/witness_terms.js --json /tmp/terms.json
```

Read the **last line**. The state on 2026-10-31 (bim-ootb main):

```
§TERMS_VERDICT PASS enforced=10 open=3 witness_failed=0 uncontrolled=0 browser=judged 5/skipped 0
```

| Exit | Meaning |
|---|---|
| 0 | every runnable term met |
| 1 | a test failed, or a broken case was not seen refused (`UNCONTROLLED`) |
| 2 | nothing was judged |

Open terms never change the exit code: they are stated, not hidden, and they are never shown as met.

## 2. The three layers

| Layer | What runs | Needs |
|---|---|---|
| engine | the comm engine in Node (this repo) | nothing else |
| ootb | Node witnesses inside the bim-ootb tree (real model modules) | `~/bim-ootb` (or `--ootb <dir>`) |
| browser | the real `erp/idempiere.html` in headless Chromium, with real clicks | bim-ootb + its Playwright (`tests/node_modules/playwright`) |

`--browser 0` skips the browser layer on purpose. A skipped layer is reported as `SKIPPED` with its reason and the row says
`engine only (browser SKIPPED)`. It is never read as a pass.

## 3. Read the table

Open terms come first. A row is `ENFORCED` only if every test printed its own PASS line and every named broken case (a line proving the defect
was refused) is in the test's log. Logs: `build/scriptor/terms_run/*.log`.

## 4. Make it say NO

A checker you have not seen fail is not a checker.

- Copy the logs, change one refusal line, and judge the copy without re-running:
  ```
  cp -r build/scriptor/terms_run /tmp/terms_mut
  sed -i "s/X7 C's DocAction (CL) is REFUSED at fold/X7 C's DocAction (CL) is MERGED at fold/" /tmp/terms_mut/witness_team_executors.log
  node scripts/witness_terms.js --reuse 1 --logs /tmp/terms_mut
  ```
  Expected: `BUNDLE (Complete) … UNCONTROLLED`, `control NOT FOUND: page: clicked CL refused at fold`, exit 1.
- `node scripts/witness_terms.js --selftest 1`: a blank log must match no test verdict and no refusal line.

## 5. In the app

The Team chip has two buttons:

- **Terms** shows the recorded run (`erp/team_terms.json`) and the command above to reproduce it.
- **Seatbelt** checks, before you Process a document, nine things that decide whether the result will reach the team as you expect. It
  advises and never blocks; a document processed under a warning is logged.

## 6. What is not promised (yet)

The open rows of the table. On 2026-10-31: a bounded Visit size as the team grows (per-device mailboxes), sealing in the real relay layer
(tested in the simulator only), and key roles with a signing threshold.
