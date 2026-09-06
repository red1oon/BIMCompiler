# PROGRESS — Current Development State

## ⚡ §RESUME_PROTOCOL — when an agent dies on a rate limit
A 429 terminates the agent but still fires a task-notification carrying the reset time. Parse it →
record the agent + its last finding in `prompts/AGENT_QUEUE.md` §MID-FLIGHT → schedule a wakeup just
past the reset → resume by `SendMessage` to the agent id (never re-dispatch fresh) → tell the user.
Full text and the reasoning: `prompts/AGENT_QUEUE.md` §RESUME_PROTOCOL.

## 📋 The live worklist is `prompts/AGENT_QUEUE.md` — not this file
It carries §LIVE (which agent owns which files), the waves, the ⛔USER decisions, and the standing
constraints. A session picking up work reads that; PROGRESS.md is state, not queue.

## Current State — 2026-09-06 (session 3, later) — ⚠ RESUME HERE: 4 PRs merged today, #1690 awaits the user

**User relayed a Sonnet review with advice on the three open items; taken as the go for 1 and 3, 2 built
as a separate non-auto-merged PR** (its "dim the fill" advice named no sourced value; the sourced lever
is `plScale` 0.5 → 1.0). Detail: `prompts/MEP_CLASH_REVEAL_MOVIE.md` "The three follow-ons — MEASURED".
- **`#1689` MERGED** (sw v1153) — `§CLASH_MARKER_OVERLAP_BOX`: each marker is the oriented box of the
  real overlap solid, red/blue halves; markers W11 270/270 matched. `§CLASH_FILM_FLAT_FILTER` (Option 3):
  the film drops flat overlaps, 271 → 270, card says "1 flat touch dropped". Verdicts untouched.
- **`#1690` OPEN, NOT auto-merged — ⛔USER take/leave** (sw v1154) — `§PL_TOPOUT_UNPIN`: past topout the
  bake's fixtures ease 0.5 → 1.0 (nav Night Mode's tuned value) over the sun's own window; pre-topout
  byte-identical. Witness 8/8 on real staging (poolSum 200 → 400). If taken: merge, then a fresh-profile
  82–92 s clip on `main` shows all four of today's features together.
- Pre-existing finding: `tools.js` `(A._nightPLScale || 1)` cannot express a 0 scale (poolSum 400 at 0).

## Current State — 2026-09-06 (session 3) — earlier today (#1685 verified, #1686 + #1688 merged, ⛔USER §TOUCH_BY_THICKNESS)

**Done this session, all witnessed, detail in `prompts/MEP_CLASH_REVEAL_MOVIE.md` (three new dated sections at the end):**
- **`§SUN_ARC_TOPOUT_SNAP` VERIFIED** on a fresh Chrome profile (`--profile /tmp/silent-bake-fresh-<epoch>`) —
  elevation 14.5° at u=0.419, 6.0° from u=0.441, held to the clip end; last night's "still 34.5" was the
  stale-SW trap exactly as suspected. `#1685` was already merged. Clip `~/Downloads/cll/Hospital_topout_snap_verify_clip82-92s_2026-09-06.mp4`.
- **`#1686` MERGED** — `§P2.4` label 3rd row `[tol mm / clash mm]` + `§CLASH_HUD_CARD` "271 mesh-true clashes
  flagged · 1,478 bbox candidates · 81.7% false". Labels witness 15 → 19 claims (P9a/P9b/H0/H1). sw v1151.
- **`#1688` MERGED (`273e1c59`, both checks green)** — `§MESH_OVERLAP_DEPTH`: the exact box of the overlap solid on every
  mesh-true pair (`depthMeshM`, `overlapMaxM`, `overlapA/B`, `overlapCenter`, `overlapExact`, `overlapFlat`);
  the label now reads the mesh figure — the shown pair is `[50mm / 50mm]`, the OBB proxy said 344 mm. Hospital:
  SAT overstated by a median 2.78×, ≥3× on 3,185 of 6,749 pairs, worst 600×. Verdicts UNCHANGED. New I6 green
  on both buildings, red on main. sw v1152.

**⛔USER `§TOUCH_BY_THICKNESS`** (spec, end of the MEASURED section): make a flat overlap (< 1 mm thick) a
touch instead of a clash? Fixes S7b (RED on main today) and drops 752 Terminal / 37 Hospital / 1 film pairs —
but the witness oracle cannot judge multi-shell IFC meshes (3 formulations tried, each disagreed on ~200
pairs where the geometry shows real overlap). Options 1/2/3 listed there. Built, measured, reverted to
annotation-only pending the call.

**Pre-existing RED on main, now recorded (not from this session's code):** narrowphase witness S7b
(face-to-face cubes → CLASH), I3 n=223 Terminal / 326 Hospital, I1 n=2 Terminal — one hole: a coplanar-edge
contact yields edge-length intersection segments, so "segment > 1 mm" ≠ interpenetration.

**Still open from before:** PL "real play" post-topout is a design lever (`§BAKE_FILL_PIN` pins ambient/hemi/
PL regardless of sun elevation; at 6° the sun 4.4 + hemi 0.617 still dwarf a 200-fixture pool ≈ 1.0 each) — ⛔USER,
not more measurement. The real-overlap MARKER shape (oriented box from `overlapCenter`+`overlapA`) is a
`clash_film.js`-only change now that the data exists — waits for a go since it changes the film's look.

**Trap, still live:** `cli_silent_bake.js` reuses `/tmp/silent-bake-profile-<port>` across runs and its
`sw=` env line is read off the file on disk, not the active service worker — pass a fresh `--profile` on any
verification bake.

## Previous 2026-09-06 sessions — ARCHIVED into `prompts/MEP_CLASH_REVEAL_MOVIE.md` "Step 4 — CLOSED 2026-09-06"
GPU driver fixed (Secure Boot MOK); 5 PRs merged (`#1676/#1678/#1679/#1684/#1683`), revert tag
`pre-clash-pl-merge-2026-09-06` on `04e3dee2`; `#1681/#1682` merged earlier; eslint.globals.json fix.

## Current State — 2026-09-04 (later)

### ERP lane — `§C2.3` DRAINED TO ZERO: all five ranked items closed, 4 PRs merged, sw v792
bim-ootb **#1669 · #1672 · #1673 · #1675**, every one CI-green. Three new witnesses, each RED on plain
`origin/main` first: `W-CALLOUT-CAMPAIGN` **29/0** (was 9 PASS / 20 FAIL) · `W-ADFORM-TRXMATERIAL`
**19/0** (was INCONCLUSIVE) · `W-AGENT-ZIP-SYNC` **11/0** (was 1 FAIL).
- **E-1, the callout campaign** #1669 — live dispatch on the nine O2C/P2P tables **3 → 51 of 78
  bindings**. The 3 is not a typo: **nothing had ever called `AdCallout.installDefaultHandlers()`**, so
  six engine line callouts had never fired in a browser and `§IC.3`'s "28 = 36%" counted a paper
  registry. Nine new atoms incl. all five `CalloutPayment.*`, with `invoiceopen`/`invoicediscount`/
  `paymenttermdiscount` ported from the PL/pgSQL. → `AGENT_QUEUE.md` §CALLOUT-CAMPAIGN
- **Form #2 of 49** #1672 — AD_Form 103 `VTrxMaterial`, read face of the `M_Transaction` ledger.
  → §ADFORM-TRXMATERIAL
- **Four stale live witnesses** #1673 — all GREEN, **none a product defect**; three named the wrong
  thing. Surfaced a CLASS: **12 more default to a `/tmp/wt-*` worktree that is GONE**. → §STALE-WITNESSES §SW.2
- **The last two tracked binaries** #1675 — `preview_demo.db` built from its own `.dump`; both
  `*_agent.zip` built by `deploy-pages.yml`. Found a live defect: **`odoo_agent.zip` shipped without
  `odoo_agent/extract_model.js`**. → §PREVIEW-DEMO-FROM-SQL · §AGENT-ZIPS-BUILT
- **`§AZ.3` answered** #1677 — `idempiere_agent.zip` nests. Not cosmetic: `about_diy.js:199` had always
  printed `cd idempiere_agent && …` while the zip put the files at the ROOT, so the command the app
  prints could not run. New claim `E1` checks the offer's `cd <name>` against the zip's top level.
- 🔴 **`§PAGES-SERVES-THE-BRANCH`** #1680 — **READ IT FIRST NEXT SESSION.** Pages here is
  `build_type: legacy`, source `{branch: main, path: /}`: it serves the **tracked files on `main`**, and
  the artifact `deploy-pages.yml` uploads is **published by nothing**. Untracking the zips in #1675
  404'd both live downloads; `erp/version.json` has been 404 since it was introduced; the minify step
  (claimed **−36.9% gz**) has never reached a user. Zips re-tracked, `W-AGENT-ZIP-SYNC` **15/0** with a
  new `A0a` (*the zip is PRESENT*). **Verified by `curl`, not inferred:** both `200`, both extract to
  their own folder, `diff -r` clean. **Standing rule: a deploy is not verified by a green workflow —
  fetch the URL.**
**⛔ Next** (nothing on `§C2.3` remains): the 12-witness stale-root class (`§SW.2`) · the 27 callout
bindings still undispatched (`§CC.7`; four are `navigate*` atoms that should leave the denominator,
not be ported) · 47 of 49 forms with no renderer · **⛔USER `§PZ.3`: switch Pages to
`build_type: workflow`?** (it would make version.json + minification live for the first time, and make
the site stop updating whenever the workflow fails). Full restart brief: `AGENT_QUEUE.md` §RESTART.

## Previous State — 2026-09-04 (earlier) — ARCHIVED to its spec section

### ERP lane — `§CLOSE.4`'s five open items closed, bim-ootb #1661-#1666, sw v789.
Six witnesses (`W-KIND2-READBACK` · `W-DICT-LAZY` 10/10 · `W-INOUT-CALLOUT-ATOMS` 9/9 ·
`W-ADFORM-VMATCH` 16/16 · `§DIGEST` 46 rows), five defects nobody asked for, three stale hygiene
premises. Full detail: `prompts/AGENT_QUEUE.md` §ERP-SESSION-CLOSE-2. **Its ⛔ list (§C2.3) is
DRAINED — see the block above.** Two of its numbers did not survive re-measurement: the
"37-binding gap" was 50, and the "36% dispatch" was really 4% live.

## Previous State — 2026-09-03

### ERP lane, 2026-09-02/03 — 5 PRs, sw v777 (superseded above; full detail `prompts/AGENT_QUEUE.md` §ERP-SESSION-CLOSE)
The five document windows render their own AD tab (c_order 8→56 fields, c_payment 4→78, DisplayLogic
0→28/61, val-rule-filtered FK pickers); three shipped defects found by the new instruments; `W-ERP-TWIN`,
`W-MULTIHOST-SYNC` and `W-RELAY-AUTH` became standing gates. Its ⛔ list is settled: `W-SCALE-FORECAST`'s
0.8× batch was fixed at #1638 (3.53× median) and `W-AD-DISPLAYLOGIC-LIVE` was a stale witness, not a
product failure. **S-2 (no relay deployed) is still the real barrier to multi-writer, not S-1.**

### 4D / viewer lane — 23 PRs merged 2026-09-02/03, release v1.58.0 — DONE, detail in the spec docs
`§TM_REVEAL_TILED` #1605 (dead air 44-71% → **0.0%**) · `§CACHE_PLAYED_LAYER` #1607 · DAY-0
`PASS=5 FAIL=8` → **`PASS=8 FAIL=5`** #1551/#1615/#1625 (all 8 attributed; the "regression" premise
retired) · `§SUN_FILL_RATIO` #1622 (1.0453 → **0.2388**) · `§MEP_COLOR_SURVIVES_PHOTOREAL` #1621
(40,634 colourless MEP → 0) · `§DUCT_SILHOUETTE` #1631 (21.3 → **3.4 mm**) · `§CPE_AIM_DEPTH` RETIRED
#1619 (90.657° → **0.000°**) · B-2 support consolidation #1627-#1630 (**keep the AND**) · 5D constants
→ JSON #1616 · nine vacuous `§` tags guarded #1608.
→ `prompts/4D_GANTT_TM_REFACTOR.md` · `4D_MODEL_INTEGRITY.md` · `PHOTOREAL_STILL_RENDER.md` ·
`CINEMA_DISCIPLINE_REVEAL.md` · `CINEMA_PATH_EDITOR.md`
⚠ **Clinic landing:** local/live `SYSNOVA/index.html` still diverge 105 lines both ways — do NOT
upload wholesale.

## ⛔ OPEN
- **Interior lighting / liveliness** — running. **"Lively" is variance, not brightness** (user: *"it
  should be lively, so far it has never been though lighting has been bright"*). Measured on two real
  bakes bracketing #1622: CV **0.344 → 0.430**, spread 42.9 → 59.1 — but the **bright register
  drained** (brightest fifth 140.7 → 79.2). Lead: *the still's near-field boost never fires.*
- **§Z.3 Clinic ground-slab appears late, then persists on scrub-back** — untouched; two named hypotheses in `LTU_TERMINAL_CLINIC_RENDER_CORRUPTION.md` §Z.
- **A-28 §CPE_REVEAL_ARCH_HOLD overshoot (TOP of the queue, user-set 2026-09-03)** — #1633 shipped, user
  sees the ARCH strip at the LAST stick of round 2, not the first. **Suspect 1 (two reveal clocks) is
  DISPROVEN by code read:** `beats.flyback` IS `tF` (`effects.js:8656`/`:7624`) and both callers pass the
  same film fraction (`cinema_maxq.js:1511`, `cinema_path_editor.js:2532`). Next: `_flyBackPose` direction,
  then whether `cpeRevealApplyVisual`'s write survives the per-frame staging rebuild. Detail in `AGENT_QUEUE.md` A-28.
- **§FILM_UNSUPPORTED** — not started; take the short `--frames` re-scope, not a full bake.
- **§LIGHT_SHAFT (D-5)** — specced, queued behind the lighting lane (shares `effects.js`).
- ⛔USER decisions (12 open) in `AGENT_QUEUE.md`: calibration lever (Hospital 318→940 d), LFS 8.53 GB pay-vs-rewrite, sub-element slab splitting, Terminal's 673 `Ceiling Level NN` elements.

## Standing constraints added 2026-09-02/03
- **Bakes are a proven, expensive facility, NOT a measurement tool.** Never launch a film to settle a number — ask first. Keep every `§` line on the bake path intact.
- **4D generation is building-independent.** No per-building constants or name-branching. Audited clean:
  every building name in the scheduling files sits in a comment; the only non-comment hits are the IFC
  classes `IfcFlowTerminal`/`IfcAirTerminal`/`IfcFireSuppressionTerminal`.
- **DBs stay on OCI, GH Pages serves the app.** Settled: GitHub hard-rejects any file >100 MB; every major DB exceeds it.
- **A witness's own harness is a suspect before the product is.** Four red live witnesses this session
  (`§STALE-WITNESSES`): every one was the instrument, and three printed an error naming a DOM node or a
  business gate while the PAGE was logging the real cause. Read the page log, not the harness verdict.
- **Beware checks that cannot fail.** Five now: `eslint | tail` returning tail's exit code, a witness
  reading its own comment block, a 0-byte log from a buffered `page.evaluate`, a `(none above = clean)`
  line printed unconditionally — and A-28's 6/6-green witness that never judged a caller.

## Older session log
Archived to `prompts/archive/PROGRESS_sessions_archived_2026-09-01.md` (2026-08-29 → 2026-08-14); the
2026-09-01/02 entries are superseded above. Per-lane detail lives in each lane's own `prompts/*.md`.
