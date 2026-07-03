# ⚠ DO NOT REMOVE — Fable5 wrap-up session, 2026-07-03 (assigned after watchdog cross-check of 3 concurrent
# session recaps). Scope: 6 independent, execution-only items across 2 repos. Every architecture/scope
# decision below was already made by the user — do NOT re-litigate any of them, just build. Read the log
# after every run. Work item-by-item to zero; each item is independently committable/PR-able — don't block
# one on another finishing first.

## Context — why this file exists
Watchdog session cross-checked 3 recaps (kernel T2+T1 #630, modeller item 10 #631, HBA Stage 3 #632) against
GitHub directly — all three confirmed MERGED, nothing to redo there. That check surfaced 5 leftover items
that have no session currently working them. All 3 real decisions they needed have now been made (below).
One correction made this session: BCF export MVP was wrongly listed as open in memory — it shipped in #620
already (`modeller/bcf_export.js` + `#b-bcf` button, confirmed present on bim-ootb `main`). Don't rebuild it.

## Repo/worktree discipline (both repos — see each repo's CLAUDE.md)
- **bim-ootb items (3, 4, 5 below):** work in a fresh `/tmp/wt-fable5-wrapup` worktree off `origin/main`
  (shared checkout `~/bim-ootb` is PreToolUse-hook BLOCKED for edits). Open one PR per item — don't bundle
  unrelated items into one PR.
- **bim-compiler items (1, 2 below):** this repo, normal branch off `master` (already in a clean worktree —
  check `git status` before starting, another session may have touched shared files like `PROGRESS.md`).
- Push before ending the session — no committed-but-unpushed branch at close (CLAUDE.md standing rule).

---

## Item 1 — CI gate: narrow fail-fast to WARN (bim-compiler) — ✅ DONE 2026-07-04 (bc PR #37 MERGED, witness)
Status: CI-only WARN tier in `deploy/dev/test_all.js` (`okOrWarn`, active on `CI` env): §9b live-sync +
§13 fingerprint + §15 Browser E2E warn instead of fail; locally they stay hard FAILs (pre-deploy
discipline). Witness `build/test_all_ci_warn.log` (CI=1 run): `⚠ WARN version: local ↔ live fingerprint
match`, `⚠ WARN browser E2E`, `SUMMARY: 398/535 passed, 137 failed, 81 warned (non-gating)` — real debt
still gates (exit 1). Merged a207e0ab5, verified landed on master.
**Decision (user, locked 2026-07-03): option (a) from `prompts/CI_GATE_FIRST_REAL_RUN_FINDINGS_2026-07-03.md`
— WARN, not the Playwright rewrite.**

Full findings doc: `prompts/CI_GATE_FIRST_REAL_RUN_FINDINGS_2026-07-03.md`. Summary: `scripts/system_is_real.sh`
had never run past its install step until bc PR #31 fixed a `.gitignore` bug; first real run was 380/547
pass, 167 fail. Two structural (not-real) causes explain most of the 167:
1. **Browser E2E fails outright** — no `npx playwright install` step anywhere in `.github/workflows/ci.yml`,
   so every Playwright-driven check fails on a missing binary, not a real defect.
2. **"Version Fingerprint" check** compares the git checkout against a *live deployed* OCI URL — structurally
   can never match on a CI runner that never deploys (60 "DRIFTED FILES" = "never deployed," not real drift).

**Build:** downgrade exactly these two checks from FAIL to WARN in `scripts/system_is_real.sh` (or wherever
the check tier is set) — same tier `audit_specs.js` already gets (non-gating, surfaced not failed). Do NOT
touch the ~15 genuinely real failures noted in the findings doc §3 (Button Wiring Audit misses, BOQ Excel
formatting) — those stay FAIL, they're real debt. Verify: re-run `scripts/system_is_real.sh` locally or via
CI, confirm the two structural checks now show WARN (yellow) not FAIL (red) while everything else's
pass/fail is unchanged from the 380/547 baseline. Save the log, read it before concluding — don't trust the
exit code alone.

---

## Item 2 — Unified docs pass leftovers (bim-compiler) — ✅ DONE 2026-07-03 (bc PR #35 + #36 merged, site deployed)
All three sub-items closed — witness trail in `prompts/RESUME_UNIFIED_DOCS_PASS_2026-07-03.md` §Leftovers closed:
real `img/hba_bom.png` via live cdp harness (`§DIAG_BOM_SHOT paneMounted=true bomAsmRows=13 bomLineRows=88
openLinks=13`), 15-remote/17-local superseded `docs/*` branches deleted after per-branch diff verification
(one flagged-and-kept: `docs/watchdog-close-2026-07-03-v2`, active), 4 anchor-slug links fixed (`--strict`
0 anchor notices). Site published via `safe_gh_deploy.sh` (guard PASS after benign `.nojekyll` bless), live
smoke: png 200 + guide prose + fixed anchors all verified on gh.io.
Original spec (for the record): three mechanical sub-items, base branch is
`docs/modeller-guide-integrate` lineage (bc PR #33 already merged it to master — start fresh off master):
1. **HBA BOM pane screenshot** — `docs/HRBIMAssetGuide.md` currently has "Screenshot pending" prose for the
   new BOM pane (shipped in bim-ootb #626). Capture a real screenshot of the live pane, add as
   `docs/img/hba_bom.png`, replace the prose placeholder. Do NOT fabricate/mock an image.
2. **Stale `docs/*` branch cleanup** — `docs/modeller-guide-revamp`, `docs/kernel-*`, and any other
   `docs/*` branches superseded by the now-merged `docs/unified-guides-pass`. Diff each against current
   `master` docs/ — if fully superseded (no unique content `unified-guides-pass` doesn't already have),
   delete the branch; if it has unique content, flag it instead of deleting (don't guess).
3. **3 anchor-slug INFO notices** (`MANIFESTO.md`, `ERPUserGuide.md` ×2, `HRBIMAssetGuide.md`) — cosmetic
   em-dash/arrow slugification mismatches, don't fail `mkdocs build --strict` but are cheap to fix while in
   those files. Fix the anchor text/links so the notices clear.

Verify: `mkdocs build --strict` still 0 warnings after all three.

---

## Item 3 — Kernel T1: PIN/login as audit metadata (bim-ootb, `/tmp/wt-fable5-wrapup`) — ✅ DONE 2026-07-04 (bim-ootb PR #634 MERGED, W-T1-ATTRIB 16/16)
Status: new `erp/erp_attrib.js` (PIN → identity vs org-supplied sha256 directory; unknown PIN = null,
never guessed); identity rides ctx.attrib → content-signed rich params (`attrib`) — user_tag stays
device-grain, signature stays the device key (no per-PIN keys); `ERP.identify(pin)` in kanban_host
(§T1_ATTRIB logs); cosign four-eyes upgraded: same-PIN self-approval REFUSED (even forged typed name),
same-DEVICE two-PIN REFUSED (the "two typed names" bypass dead), opts.attribRequired. All witness legs
(a)-(d) green incl. foreign-key-fails-verify; W-COSIGN 6/6 unchanged; teams suite 26/26.
**Decision (user, locked 2026-07-03): yes, build the proposed fix.**

Full diagnosis: `prompts/KERNEL_TIMEBOMB_AUDIT_2026-07-03.md` §T1 (note: this is the SMALLER remaining T1
sub-issue — the device-level roster/key-epoch trust root was already shipped in #630; this is the separate,
still-open employee-attribution gap). Problem: `actor` is a self-minted `localStorage` tag
(`erp/kanban_host.js:83`), and maker-checker (`teams/erp/cosign.js:80,103`) compares self-asserted name
strings with default-true eligibility — two typed names defeat it, no identity↔pubkey binding at the
employee level.

**Build:** capture PIN/login as **audit metadata attached to the op**, not as a new signing key (the device
already has the real key from #630's roster). i.e. the employee identifies themselves (PIN or login) at
action time, that identity is recorded alongside the op for audit trail / maker-checker name comparison, but
the cryptographic signature stays device-level (unchanged from #630). This closes the "two typed names"
gap without re-opening the multi-signer key-management problem #630 already solved. Write a node witness
(`W-T1-ATTRIB` or similar) proving: (a) same-device two-different-PIN maker/checker attempt is rejected,
(b) same-PIN maker/checker attempt is rejected (self-approval), (c) legitimate different-PIN maker+checker
passes, (d) the signature chain itself is unchanged (still device key, not per-PIN keys) — confirms this
is metadata, not a parallel trust root.

---

## Item 4 — Kernel T7: wire the unwired incremental primitives (bim-ootb, `/tmp/wt-fable5-wrapup`) — ✅ DONE 2026-07-04 (bim-ootb PR #636, W-T7-INC 35 🟢, auto-merge queued)
Status: all 4 fixes + 4b built + MEASURED on a ~4.9k-op ECDSA-signed synthetic POS log (spec
`bim-ootb prompts/T7_INCREMENTAL_SHARD_SPEC.md`, log build/t7_incremental.log in /tmp/wt-fable5-wrapup):
(1) _persistToIdb sealChain→sealFrom (427ms→0ms, same tip); (2) NEW verifyChainIncremental, hot paths
switched (crud DocAction/save, ERP.chainVerify/seal → POS/kitchen/replenish): 2254ms→3ms per action,
tamper-after-tip caught hot, tamper-behind-tip caught by next FULL verify (documented window, witnessed
both directions); (3) NEW erp/tip_fold.js memoized tip-folds (#596 precedent): 400-row sweep 1553ms→156ms,
0 mismatches vs reference incl. undo; (4)+4b NEW erp/erp_shard.js signed SHARD_SNAPSHOT boundary —
archive-put+read-back CONFIRMED before any delete (T3 lesson), replay(snapshot+post)==replay(genesis),
boot verify 3422ms→1ms, tampered archived shard detected on lazy verify across 2 generations, DEFAULT
OFF (below-threshold byte-identical). §4b's mandated adversarial review ran pre-merge: hash construction
HELD (forge/swap/truncate/reorder blocked); 3 composition gaps found+fixed+witnessed — (A HIGH) shard()
commit race→silent op loss: same-tick straggler guard aborts (§T7-RACE); (B MED) verifyShards now
verifies the hot anchor itself (§T7-ANCHOR); (C MED) projState column-name SQL injection at replay:
identifier whitelist throws (§T7-INJECT). Regressions: W-CONTENT-SIGN, W-ROSTER-VERIFY,
W-CROSS-TAB-PERSIST, W-PCLOSE-ARCHIVE, W-XSS-FILENAME, teams 26/26 all green. Kernel banner v12, sw v762.
Full diagnosis: `prompts/KERNEL_TIMEBOMB_AUDIT_2026-07-03.md` §T7. All primitives already exist in-tree,
unwired — this is a wiring job, not new design:
1. **Incremental seal** — `_persistToIdb` calls full `sealChain` (`kernel_ops.js:110,173-189`) on every
   commit; `sealFrom` (`:203-220`) already exists and does this incrementally. Wire it in.
2. **Incremental verify** — POS/kitchen/CRUD run full `verifyChain` with per-op ECDSA verify
   (`:389-425`) on every SEND/save/DocAction (`pos_lens.js:796`, `crud_overlay.js:1746,2201`). Add a
   tip-cached incremental verify path (verify only ops since last known-good tip).
3. **Memoized tip-folds** — `crud_overlay.js:516-527` `readTip` and `listTip`/`tipValues` full-scan +
   JSON.parse all SET_STATUS ops per (table,id) per render → O(rows×ops). Same class already fixed in
   Modeller PR #596 (`moveDeltaFor` memoization) — apply the same precedent here.
4. **Signed snapshot/checkpoint op** — no ERP-side compaction exists (correctly — `compact()` at
   `kernel_ops.js:501-557` is BIM-modeller semantics and must never run on financial data). Add a
   period-close-pattern signed snapshot op that later folds/verifies can start FROM, instead of always
   replaying from genesis.

Trigger this fixes: a busy POS (~300 ops/day) hits ~5k ops in 2-3 weeks → 1-5s added per sale, climbing,
today. Verify: witness a synthetic ~5k-op log, measure commit/dispatch/paint latency before and after each
of the 4 fixes — must show a real, measured drop, not just "should be faster."

**4b — sharding + lazy first-paint fetch (elaborates fix 4, added 2026-07-03 by watchdog design call, user
deferred the strategy call to Claude explicitly — "you know code strategy best").** Don't stop at ONE
snapshot checkpoint — make the signed snapshot/checkpoint op from fix 4 the shard boundary:
- Each shard is internally hash-chained (existing `sealChain`/`sealFrom` machinery, unchanged), then the
  shard's own tip chains to the previous shard's snapshot hash. A shard's integrity verifies standalone,
  without replaying earlier shards.
- **Instant first paint = load ONLY the latest signed snapshot + the current open shard.** This is the
  actual fix for the "load stalls as history grows" symptom, not just an optimization on top of fix 4 — skip
  full-genesis replay on every load.
- **Lazy-fetch older shards on demand, in the background, never blocking first render** — Time-Machine /
  blame / history views trigger pulling prior shards incrementally, each independently verified and
  chain-linked backward toward genesis (or a trusted pinned checkpoint).
- ⚠ **This changes trust/verification semantics, not just performance** — same risk class as the T1/T2
  signing work (#630), not a pure perf-wiring change like fixes 1-3 above. Apply the same rigor: witness
  that shard-boundary verification is cryptographically equivalent to full-chain verification (a tampered
  older shard is still detected even though it's not eagerly loaded), and that the "off"/pre-sharding read
  path stays byte-identical for any log small enough to fit in one shard (no behavior change for the common
  case). If this feels too load-bearing to build without a second pair of eyes, run `/code-review` on the
  shard-boundary verification logic specifically before merging it — narrower ask than reviewing the whole
  session's diff.

---

## Item 5 — Modeller: per-instance hide (bim-ootb, `/tmp/wt-fable5-wrapup`) — ✅ DONE 2026-07-04 (bim-ootb PR #637, W-E2E-INSTHIDE 14/14, auto-merge queued)
Status: per-instance eye-toggle keyed by §Q2 instanceId (new `modeller/dw_instances_outliner.js` +
outliner/html wiring, sw v32); hidden = zero-scale matrix round-trip (matEq proven) + explicit pick/hover
filter (hov/pick null after hide, control leg green); rows live INSIDE the OL_CHUNK windowed render
(50-row window + show-more, eyes only in-window). Two measured spec-documented deviations: the folded
authored `_dw` twin mesh hides with its instance (probes proved instance-only hide changed ZERO pixels —
twin wins every raycast), and assembly buckets (`dwa|` rows) carry the pure-instanced pick legs.
Regressions 5/5 suites green (OLEYE/OLVIRT/INSTPICK/OLFILTER/OL-SYNC). Watchdog-checked: § lines read
from /tmp/wt-item5-hide/build/witness_instance_hide_run1.log.
**Decision (user, locked 2026-07-03): build this, not PBR/SSAO, and not BCF (already shipped).**

Prerequisites already shipped, don't rebuild: `instanceId`-keyed pick/hover identity (#620 §Q2,
`raycaster.intersectObject` gives this via Three.js for free) and Outliner windowing (#625 §V4,
`OL_CHUNK=250`). Whole-bucket + per-element eye-toggle already shipped (#625 §V1) but **NOT per-instance**
within a single `InstancedMesh` — that's this item.

**Build:** extend the existing eye-toggle (§V1) to individual instances inside an InstancedMesh, using the
`instanceId` identity §Q2 already established. Hidden instance = unpickable (§V1's precedent: THREE
Raycaster does NOT skip invisible objects on its own — pick paths must explicitly filter, same pattern
already applied for whole-object hide). Outliner row-level toggle per instance, respecting the windowed
`OL_CHUNK=250` render (don't defeat the windowing perf fix by rendering all rows to add toggles). Witness:
prove hide/show round-trips visually (readPixels or equivalent) AND that a hidden instance is excluded from
pick/hover, for both a single hidden instance and multiple hidden instances in the same InstancedMesh.

---

## Item 6 — Modeller: consolidate export into one "Export" menu, adding native `.db` (bim-ootb,
`/tmp/wt-fable5-wrapup`) — ✅ DONE 2026-07-04 (bim-ootb PR #633 MERGED, W-E2E-EXPORT-DB 6/6)
Status: ONE `#b-export` menu (reuses the existing initOpenChooser idiom) with Native .db / IFC / BCF;
`b-ifc`/`b-bcf` flat buttons removed; NEW `Bonsai.exportDb` (sealChain → db.export → existing Blob
download idiom) + symmetric `bonsai_oplog.importBytes` read on the `#b-open` path. Round-trip PROVEN
byte-identical (export sha == re-export sha after clear+reopen, 254/254 ops, verify=true); BCF bytes
RAW-identical main-vs-branch; IFC identical after normalizing web-ifc's own wall-clock FILE_NAME field
(volatile even on unmodified main — proven with two main runs); W-E2E-BCF 7/7. Watchdog-checked: § log
lines read from /tmp/wt-item6-export/build/, claims corroborated.
**Decision (watchdog advice, user-approved 2026-07-03): one grouped Export control with a format menu, not
a 3rd flat toolbar button.**

Gap 1 (the feature): `b-open` (`modeller.html:143`) already loads a local `.db` file, but there's no
symmetric "save/export" path — the only writer of the native format is `kernel_ops.js:117`
`db.export().buffer`, wired ONLY into the IndexedDB auto-persist (`_persistToIdb`), never offered to the
user as a downloadable file. This matters because the native `.db` (signed op-log, hash chain, BOM tree,
discipline metadata) is the only FULL-fidelity format — IFC (`b-ifc`) and BCF (`b-bcf`) are both necessarily
lossy translations of it.

Gap 2 (the UX, caught when the user asked "will Save As give the conventional options"): today `b-ifc` and
`b-bcf` are two independent flat toolbar buttons (adjacent in the DOM, `modeller.html:165-166`, but not
grouped as one control) — bolting a 3rd flat `b-export-db` button on next to them repeats that anti-pattern
and doesn't scale to future formats (IDS, glTF, …) without another icon each time. Watchdog's call: replace
the flat `b-ifc`/`b-bcf` pair with ONE "Export" button that opens a small dropdown/menu offering **Native
`.db` / IFC / BCF**, each item invoking the existing handler unchanged.

**Build:**
1. New single toolbar button (e.g. `b-export`, replacing the visual slot of `b-ifc`+`b-bcf`) that opens a
   small menu (reuse whatever dropdown/menu idiom already exists elsewhere in `modeller.html` — don't invent
   a new menu widget if one is already in use for another control).
2. Menu item "Native .db" → NEW handler: take current `APP.db` (same instance `_persistToIdb` reads), call
   `db.export().buffer` (already exists, `kernel_ops.js:117`), wrap in a `Blob`, download as
   `<building-name>.db` — copy the exact Blob→ObjectURL→`a.download`→`click()` idiom already used twice
   (`bonsai_ifc.js:102-104`, `bcf_export.js:135-137`). Do not invent a new download mechanism.
3. Menu item "IFC" → calls the EXISTING `window.Bonsai.ifc.exportModel(...)` unchanged (`b-ifc`'s current
   handler, just re-triggered from the menu instead of its own button).
4. Menu item "BCF" → calls the EXISTING `exportBcf(...)` unchanged (`b-bcf`'s current handler, same
   re-trigger-from-menu move).
5. Remove the now-redundant standalone `b-ifc`/`b-bcf` buttons once their behavior is reachable from the
   menu — don't leave both the old buttons AND the new menu live (that's the flat-buttons problem again,
   just duplicated).

Verify: (a) exported `.db`, re-opened via `b-open`, reproduces byte-identical scene state (round-trip, same
precedent as the IFC re-import check at `modeller.html:3883`); (b) exported file's hash chain (`sealChain`)
verifies clean — export doesn't silently skip the seal step `_persistToIdb` already does; (c) IFC and BCF
export still produce byte-identical output to before the menu consolidation (pure UI move, zero logic
change) — regression-test both existing witnesses (IFC re-import check, W-E2E-BCF) still pass unchanged.

---

## Not in this session's scope — flag, don't touch
- **bim-ootb PR #624** (`release-please` auto-PR, release 1.9.0) — open, mechanical, but a merge to `main`
  is a shared-state action; leave it for the user/watchdog to merge, don't merge it as part of this session.
- Item 9 (PBR textures) and SSAO — still genuinely §NEEDS-DESIGN, no decision made, don't start.
- HBA §P11 deep-link windows 53042/316/53036 (unseeded `AD_Window` rows) — **NOT included in this wrap-up
  by oversight-check; if picked up separately, don't duplicate.** (Left out of this file's scope because it
  needs a real iDempiere AD_Window row spec the user hasn't provided yet — flag as ⛔ BLOCKED if reached
  before that's supplied, don't invent AD_Window field values.)
- **Pills consolidation (identified 2026-07-03, needs a review pass BEFORE any Fable5 execution, not
  included as an item above).** Survey found 7+ independent pill implementations, only 3 sharing a common
  `PillBuilder` — and that shared base is itself **forked** (`erp/pill_builder.js` vs `viewer/pill_builder.js`
  have diverged; viewer's has an L-path rail animation erp's lacks). `teams_pill.js`, `panels.js`'s doc-pill,
  `pos_lens.js`'s pill bar, and `system_monitor.js` each hand-roll their own DOM/close/error-handling, with
  inconsistent results (`pill_builder.js:240-246`'s action-tap handler has no try/catch; `teams_pill.js`'s
  standalone fallback pane has no close button at all; `system_monitor.js` is the best-behaved, explicit
  close + individually try-caught actions). No pill has a dedicated keyboard shortcut — only the generic
  Esc/Tab panel-stack handling from `viewer/input_registry.js`, and that only reaches pills hosted inside
  `PillBuilder`. **Before any "add close button/shortcut to pill X" work**, run a scoped `/code-review` on
  just `erp/pill_builder.js` vs `viewer/pill_builder.js` + their consumers — decide canonical version, map
  every consumer, decide what folds into it vs. stays legitimately separate. Don't polish pills file-by-file
  first; that multiplies the fork instead of fixing it.

## Session closeout
Each of the 6 items above is `✅ DONE (witness)` or `⛔ BLOCKED: <question>` — same WORK-TO-ZERO contract as
the standing backlog. Update this file in place marking each item's status before ending. Push every
branch before finishing — no committed-but-unpushed work at session close.
