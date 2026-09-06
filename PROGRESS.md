# PROGRESS — Current Development State

## ⚡ §RESUME_PROTOCOL — when an agent dies on a rate limit
A 429 terminates the agent but still fires a task-notification carrying the reset time. Parse it →
record the agent + its last finding in `prompts/AGENT_QUEUE.md` §MID-FLIGHT → schedule a wakeup just
past the reset → resume by `SendMessage` to the agent id (never re-dispatch fresh) → tell the user.
Full text and the reasoning: `prompts/AGENT_QUEUE.md` §RESUME_PROTOCOL.

## 📋 The live worklist is `prompts/AGENT_QUEUE.md` — not this file
It carries §LIVE (which agent owns which files), the waves, the ⛔USER decisions, and the standing
constraints. A session picking up work reads that; PROGRESS.md is state, not queue.

## Current State — 2026-09-06 (later) — ⚠ RESUME HERE, GPU back, 5 PRs merged, one fix mid-verify

**GPU driver fixed** (Secure Boot MOK enrolled, `nvidia-smi` confirms RTX 4060 live) — the blocker
below is CLOSED, kept for history only.

**5 PRs merged to `bim-ootb` main tonight** (`fa71f162` tip): `#1676` mesh-true narrowphase,
`#1678` clash pulses, `#1679` clash labels, `#1684` PL buildup gate + intensity heuristic, `#1683`
Alt+S shadow-map leak fix. Real defect found+fixed along the way: `eslint.globals.json` never listed
3 new cross-file globals, red-flagging all 4 chain PRs' CI though the code ran correctly — fixed with
one JSON entry each. `sw.js` version collision (`#1676`/`#1683` both bumped v1142→v1143) resolved
per house rule, final v1149. **Revert point: tag `pre-clash-pl-merge-2026-09-06` on `04e3dee2`.**
Full detail: `prompts/MEP_CLASH_REVEAL_MOVIE.md` "Step 4 — CLOSED 2026-09-06".

**Two small features speced+built this session, both correct, neither merged yet:**
- `#1685` (`feat/clash-film-p4`, open PR, NOT merged) — `§SUN_ARC_TOPOUT_SNAP`: past the plan's
  topout, the sun arc eases to the dramatic 6° Alt+S angle instead of crawling there at the film's
  last frame. Pre-topout branch is untouched code (zero regression to outdoor shadow-sun correlation,
  by construction). **NOT YET VERIFIED ON A REAL BAKE** — see the trap below.
- `§P2.4` (clash-label tolerance/mm row) and `§CLASH_HUD_CARD` (reveal-round clash count) — SPECCED
  in `MEP_CLASH_REVEAL_MOVIE.md`, plumbing fully traced (both are small, data already exists), but
  **NOT IMPLEMENTED** — paused mid-investigation of the mesh-overlap-depth question (see below)
  before coding started. `git status` clean, nothing half-written on disk.

**⛔ REAL TRAP FOUND, next session must know this before baking anything:** `cli_silent_bake.js`
reuses a PERSISTENT Chrome profile dir keyed only by port (`/tmp/silent-bake-profile-8544` by
default, `cli_silent_bake.js:42`) across every separate invocation. The `§CLI_BAKE_ENV sw=vNNNN` log
line is **not proof of what's actually served** — it's read straight off the `sw.js` FILE ON DISK via
regex (`cli_silent_bake.js:125`), not from the browser's active service worker. After many bakes
tonight on the same port, a verification bake of the `§SUN_ARC_TOPOUT_SNAP` fix (commit `e56d1520`,
clip 1:22–1:32/u=0.4188–0.4699) came back showing the OLD un-snapped elevation values
(`elevation=34.5` at tNorm=0.419, exactly the pre-fix linear formula) — confirmed NOT a code bug by a
3-frame debug bake with an inline `console.log` that never fired at all, meaning the browser was
running stale cached JS the whole time, most likely an already-ACTIVE older service worker from an
earlier bake in the same profile dir that hadn't been superseded (a new SW registers but doesn't
necessarily take control mid-session). **Fix for next session: pass `--profile
/tmp/silent-bake-fresh-$(date +%s)` (or any not-yet-used path) on the verification bake so a truly
fresh profile with no prior SW registration is used** — do not trust `sw=` in the env log as proof of
what's actually loaded. Re-verify `#1685` this way before trusting or merging it.

**Also flagged, not yet resolved, needs a user decision not more investigation:** PL "real play"
(user requirement) is a SEPARATE lever from the sun-timing fix — `§BAKE_FILL_PIN` keeps
ambient/hemi/PL scale pinned to the Alt+S baseline regardless of sun elevation, so snapping the sun
alone does not guarantee the point-lights read as dominant indoors. Not attempted this session;
flagged in `§SUN_ARC_TOPOUT_SNAP`'s spec as open.

**Mesh-overlap real depth (not the OBB/SAT proxy `severityM` — user's own catch, correct and
important):** confirmed by code read that `severityM` is 100% the pre-mesh-stage OBB box depth,
untouched by real triangle geometry even on a verified mesh-true CLASH. A true depth needs a new
pass over the already-computed-then-discarded intersection segments in `clash_narrow.js`'s
`enumerateContact` (segments exist, just aren't kept) — user agreed: do depth first, park full CSG
solid shape. Scoped, not started.

## Previous State — 2026-09-06 (earlier) — GPU driver blocker, now resolved (see above)
enrollment (NOT the 590/595 "conflict" theory from earlier tonight, that was cruft, ruled out by a
separate session). User is doing MOK enroll + reboot themselves; a separate session runs the 590
package cleanup after. Until that lands, no real-GPU bake/witness is possible here — confirmed by
two independent agents tonight hitting `NO_GL`/`nvidia-smi` failure. Full trace: `prompts/
CPE_4D_PERF_MEM_STUDY.md` §R17 + its 2026-09-06 correction; GPU/Chrome signature catalogued as a
NEW 4th cause in the `project_machine_chrome_firefox_gpu_launchers` memory file.

**Shipped tonight, all open PRs on `bim-ootb`, none merged — user reviews:**
- `#1683` — Alt+S GPU memory leak (128 MB sun shadow map never released after teardown), draft.
  Also disproved the original dispatch theory (retained textures/programs are NOT a compounding leak).
- `#1682` — dead man-days/cost HUD cards fixed (`_hrCost` now populates on the schedule cache-hit path).
- `#1681` — **already merged** — sun-arc indoor-brightness fix (pins fill to Alt+S baseline for the
  whole bake arc), shipped before this session even dispatched for it.
- `#1684` — buildup light gate (no light before construction), disclosed type-based intensity
  heuristic (real wattage data confirmed absent from every shipped DB), clash-marker occlusion
  shine-through fix. All witnessed GREEN. Stacked on `#1678`→`#1679`.

**Next when GPU is back:** run the saved, validated verification bake command (documented in
`MEP_CLASH_REVEAL_MOVIE.md`, `--clip 0.1021:0.1532` = seconds 20-30 of the REAL 195.8s film, not the
stale 278.8s DB value) — confirms markers shine through + label selection, produces the demo clip
for the user to watch. Then: review/merge the PR chain above in order, and pick up the still-open
`§CLASH_FILM_P3` backlog (mesh-true CSG intersection volume, mm overlap on label, discipline
walkthrough beat, the clash-matrix HUD grid itself — cost cards are done, the matrix isn't).

**To come back to this exact conversation** (not just this file): `claude --resume` (or
`--continue` for the latest) in the same terminal — that restores the live thread itself; this
PROGRESS.md entry + memory are the fallback for a genuinely fresh session instead.

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
