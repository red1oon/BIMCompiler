# ⚠ DO NOT REMOVE — UI/UX LANE (single session card, Sonnet-runnable), rebuilt 2026-06-13
# Paste-to-start: `proceed with prompts/UI_UX_LANE.md`
# Scope: THREE self-contained UX tracks — A Testing Pills · B POS Compact · C WH Walk — ALL absorbed
#   here (former prompts/ERP_TESTING_PILL_UX.md, POS_PANEL_UX_COMPACT.md, WH_WALK_UX.md are stubs now).
# READ THE LOG after every run (exit ≠ evidence). ALL poc_* via `bash build/erp/run_witness.sh scripts/poc_X.js`.
# NON-NEGOTIABLE: spec-first · witness-led · NON-INVENT (extract ids/rows, never invent) · newVerbs=[]
#   (presentation only — NO engine/fold changes anywhere in this lane) · Lucide-only icons (pill-icon
#   consistency) · bim-ootb edits ONLY in /tmp/wt-* off FRESH origin/main · ONE PR per track · sw bump
#   once per train · orphan-check every squash · sw.js = conflict magnet (keep both hunks, higher version).
# STATE AT WRITING (post FOLLOW-UP ROUND 2, 2026-06-14): erp sw v684 (#313 Sound-FX pill) · viewer sw v657
#   (#311 WH cross-reload resume) · pos_lens.js?v=9 · wh_walk.js?v=8 · idmp_pills.js?v=12 · pills_idmp.json?v=31
#   · icons.js?v=10 · ROUND 2 all ✅ (see §FOLLOW-UP ROUND 3 STATE block + the # DONE blocks below).

## ⚠ PRE-PINNED FACTS (verified in code 2026-06-13 — do NOT rediscover these wrong)
1. **Viewer icons live in `viewer/panels.js`** (inline `ICONS` map, `var I = ICONS` ~line 1104).
   There is NO `viewer/icons.js`. ERP icons = `erp/icons.js` (keys incl. clock/shoppingCart/scan/doc;
   NO banknote/package/rotateCcw yet — add Lucide paths there/in panels.js as needed).
2. **SFX:** `viewer/sfx.js` exposes `SFX.play(id)` (line ~522) which resolves `_ui[id]` from
   `sfx.json ui_sounds` rows — an id absent from sfx.json plays NOTHING (silent, no crash).
   EXTRACT the available ids from the shipped sfx.json first; if confirm/qty/skip rows don't exist,
   add ui_sounds rows there (data, not code) — never hardcode synth rows into wh_walk.js.
3. **The live witnesses click REAL ids** — `poc_wh_pos_pick_live.js` drives `#pos-float-tender`,
   `#pos-float-deliverlater`, `#pos-float-bp`, `.pos-card[data-pid=…]`, `#wh-qty-minus/-ok`, and greps
   `§POS-DELIVERLATER` (no hyphen before LATER) / `§WH SRC` / `§WH PICK-COMPLETE`. Track B/C restyling
   MUST keep those ids + §-lines (or update the witness in the SAME train and re-run it).
4. **Regression commands (the real names):**
   - `WT_ROOT=<wt> bash build/erp/run_witness.sh scripts/poc_wh_pos_pick_live.js` — the whole POS→walk
     loop (serves the worktree ROOT: /erp/ + /viewer/ same origin; default WT_ROOT=/tmp/wt-poswalk —
     point it at YOUR track's worktree).
   - `WT_ROOT=<wt> bash build/erp/run_witness.sh scripts/poc_wh_walk_live.js` — W-WH-LIVE (replenish
     walk; 26 verdicts; fresh IDB → pos-docs=0 → no chooser).
   - `ERP_ROOT=<wt>/erp node scripts/poc_pos_live.js` — W-POS-LIVE (Tender + §POS-CENT).
5. **`wh_walk.js` truth vs. the dictated C-items:** `advance()` ALREADY calls
   `renderStrip()+focusStep()` (camera flies to the next bin after every confirm), and `confirmQty()`
   already calls `closeScan()`. Diff the OBSERVED complaint against this before coding C-3 — the real
   gap is likely "picker must re-tap *Confirm bin* per step", not a missing fly. Witness-led: reproduce
   first, then fix what's actually broken.
6. **IDB:** open `bim_ootb_cache` via the shared `_openCacheDB()` in wh_walk.js (NO hardcoded version —
   the v1-vs-scene.js-v2 VersionError already bit once, fixed in #283). Sidecar key `idmp_kanban_proj`.
7. eslint no-undef CI gate is real — lazy UMD globals must be declared in `eslint.globals.json`
   (POSCore/InOutConfirm already are; add new ones you introduce).

---

## Track A — Testing Pills UX coherence
**Worktree `/tmp/wt-testing-pill-ux` · files: `erp/erp_pills.js`, `erp/erp.html` (verifyLedger ~line
425), `erp/pills.json`, `docs/ERPUserGuide.md §13` (bim-compiler).**
Context: two complementary testing pills — `verify` (checkList icon; KernelOps.verifyChain on the live
op-log; currently a 3s TOAST) and `doc-cycle` (check icon; 13 in-memory engine tests; a proper card).
Make them one visual family.

- **A-1 Verify Ledger toast → card** (`#verify-card`, same chrome as `#doc-cycle-card`): title
  "Verify Ledger"; summary row `✓ N ops — chain intact` / `✗ Tamper at op N — <reason>` (one row per
  verified segment if the chain is long); pill tap toggles open/close (the doc-cycle pattern).
  Witness `§VERIFY-CARD ok=<bool> len=<n>`.
- **A-2 Shared chrome:** both cards duplicate `.dc-row/.dc-pass/.dc-fail/.dc-total` CSS — extract one
  `.erp-test-card` block in `_injectStyle()` (erp_pills.js). Pure CSS consolidation, zero behaviour.
- **A-3 Tooltips** (pills.json `title`): verify = "Verify Ledger — hash-chain tamper check on your
  live op-log"; doc-cycle = "Doc Cycle — 13 engine tests (always green)".
- **A-4 ERPUserGuide §13** updated to the card output (A-1 changed the described UX) →
  `mkdocs gh-deploy` from bim-compiler (publishes red1oon.github.io/BIMCompiler/; NOT bim-ootb).
- **Regression before PR:** `§DOC-CYCLE total=13 pass=13` still logs on pill tap.
- **Train:** ONE PR; bump erp_pills.js ?v= in erp.html + erp sw v663→next.

---

## Track B — POS Panel UX Compact
**Worktree `/tmp/wt-pos-compact` · files: `erp/pos_lens.js` (float panel + scan handler),
`erp/icons.js` (add banknote/package), `docs/ERPUserGuide.md §7`.** pos_core.js should NOT need
touching (presentation only).
Design target — total is the hero, everything else folds:
```
┌──────────────────────────────────┐
│ ▸ Ordered items    (3)      [›]  │  ← collapsible drawer (collapsed per new sale, not persisted)
├──────────────────────────────────┤
│         RM 47.50                 │  ← MAIN FIGURE — large, centred, always visible (sticky)
│   [banknote]      [package]      │  ← icon buttons: Tender cash / Deliver later
├──────────────────────────────────┤
│ ▸ Replenishment    (2)      [›]  │  ← collapsible drawer
└──────────────────────────────────┘
```
- **B-1 Ordered items drawer** — header `▸ Ordered items (N)`, tap to expand (CSS max-height
  transition, no page scroll). `§POS-DRAWER-ITEMS open=<bool> count=<n>`.
- **B-2 Replenishment drawer** — same treatment. `§POS-DRAWER-REPL open=<bool> count=<n>`.
- **B-3 Icon action buttons** — Tender + Deliver-later become icon-only (Lucide banknote/package added
  to erp/icons.js), flanking the total, `title=` tooltips. ⚠ KEEP ids `#pos-float-tender` /
  `#pos-float-deliverlater`, the existing handlers VERBATIM, and the deliver-later DICTIONARY GATE
  (door absent when no docsubtypeso='SO' doctype — `§POS-DELIVERLATER door=on/off` line stays).
  `§POS-ICON-TENDER` / `§POS-ICON-DELIVER` on tap.
- **B-4 Barcode scan close-focus** — (1) hint overlay on scanner open: "Hold steady · 10–15 cm from
  barcode" → `§POS-SCAN-HINT shown=true`; (2) capability-guarded macro focus after getUserMedia:
  `track.getCapabilities().focusMode` contains 'macro' → `applyConstraints({advanced:[{focusMode:
  'macro'}]})` silent-catch (Chrome-only, Safari degrades) → `§POS-FOCUS-MACRO applied=<bool>`;
  (3) ERPUserGuide §7 note: "Barcode scan works best at 10–15 cm… some phones need macro mode" →
  mkdocs gh-deploy.
- **Regression before PR:** `WT_ROOT=/tmp/wt-pos-compact bash build/erp/run_witness.sh
  scripts/poc_wh_pos_pick_live.js` (P1–P4 prove door+tender+persist through the NEW chrome) +
  `ERP_ROOT=/tmp/wt-pos-compact/erp node scripts/poc_pos_live.js`. If the panel restyle breaks a
  selector the witness clicks, fix the witness in the same train — never ship red.
- **Train:** ONE PR; pos_lens.js ?v=5→6 in idempiere.html (+erp.html if it loads it) + erp sw bump.

---

## Track C — WH Walk UX (6 items, live-demo observations)
**Worktree `/tmp/wt-wh-walk-ux` · files: `viewer/wh_walk.js` (all items), `viewer/panels.js` (ICONS
map for C-5 glyph; whwalk entry needs NO change), `erp/sfx`-side none — sfx.json rows only (C-6).**

- **C-1 Auto-engage on WH building load** (`§WH_AUTOSTART gate=true open=auto`): after the gate poll
  sets `W.gate=true`, call `open()` so the walk starts without hunting for the pill (the pill stays
  for manual close/reopen). ⚠ Timing: the poll fires when `A.db` exists but geometry may still be
  streaming — defer the auto-open until the scene is ready (e.g. wait for the same signal
  poc_wh_walk_live waits on, §BBOX_CLEARED, or poll `A.scene` children) so the first fly-to isn't
  into an empty scene. Note: when POS docs exist, auto-open pops the source chooser — intended.
- **C-2 Zoom pull-back** (`§WH_ZOOM dist=<n> min=6`): focusStep formula
  `Math.max(b.sx,b.sy,b.sz)*1.5+0.5, min 2.5` lands on the bin face → change to `*4 + 0.5, min 6`.
  Verify visually on the GardenWorld warehouse db; tune if bins are large.
- **C-3 Fast-confirm flow** (`§WH_AUTOADVANCE`): dictated as "auto-advance + fly to next bin after qty
  OK" — but see PRE-PINNED FACT 5: advance() already flies and the scan closes. REPRODUCE the observed
  friction first (likely: the next step requires re-tapping "Confirm bin" to reopen the scan screen).
  Candidate fix: after confirmQty, auto-open the scan screen for the NEXT step (keep the per-bin
  refuse gate — the act-at-the-bin discipline is the spec, don't bypass scanInput).
- **C-4 Route-list drawer** (`§WH_ROUTE_DRAWER open=<bool> steps=<n> done=<n>`): `div#wh-route-drawer`
  above `#wh-strip`; header `▸ Movement (N steps, N remaining)` tap-toggles; rows
  `[ ] <bin value> – qty× <product>`; current step `→` + `#1d4a2e` background; done `✓` dimmed;
  collapsed by default, auto-expands once at walk start.
- **C-5 Switch source mid-walk** (`§WH_SOURCE_SWITCH posDocs=<n> selected=<m_inout_id>`): `↺`
  (Lucide rotateCcw, add to the panels.js ICONS map: `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0
  0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`) on the strip beside ⌂ — ONLY rendered when posDocs>0
  (data-gate idiom: absent, not greyed). Tap = re-run `readPosSidecarDocs()` → `chooseSource()` →
  `draftFromPosDoc()` → rebuild route from step 0. ⚠ An in-progress walk's confirmed steps live in
  the op log (signed) — switching abandons the remainder; log it honestly (`§WH SOURCE_SWITCH
  abandoned=<k> steps`), never silently drop.
- **C-6 Audio feedback** (`§WH_AUDIO event=<confirm|qty|skip> sfx=<played|absent>`): bin confirm
  (scanInput MATCH path) / qty confirm / skip → `if (window.SFX && SFX.play) SFX.play('<id>')`.
  Per PRE-PINNED FACT 2: ids resolve from sfx.json ui_sounds — EXTRACT existing ids or add rows there;
  affirmative actions only (no audio on close/home).
- **Regression before PR:** `WT_ROOT=/tmp/wt-wh-walk-ux bash build/erp/run_witness.sh
  scripts/poc_wh_walk_live.js` (W-WH-LIVE — ⚠ C-1 auto-open will change its flow: it opens the lens
  via the pill; adapt the witness to tolerate already-open, in the same train) + `WT_ROOT=… …
  poc_wh_pos_pick_live.js` (the full loop through the new UX).
- **Train:** ONE PR; wh_walk.js ?v=3→4 (+panels.js ?v= if ICONS touched) + viewer sw v648→next.

---

## Session order + bank
```
Track A → witnesses green → PR (auto-merge, orphan-check) →
Track B → witnesses green → PR →
Track C → witnesses green → PR → bank
```
Bank at end: ERPUserGuide §7/§13 already updated in-track + `mkdocs gh-deploy` once · lane-master
`prompts/FRONTEND_LANE_MASTER.md` entry → ✅ with PR numbers · memory (`project_erp_mobile_ui_fixes` /
`project_spatial_picking` one-liners) · fill `# DONE` below (every claim needs its §-line + log path).
WORK-TO-ZERO: every item ✅ or ⛔ with ONE named fact; never re-parked.

## # DONE (2026-06-13 — all three tracks shipped, one session)

### Track A — Testing Pills UX coherence ✅ (bim-ootb PR #287, erp sw v665)
- A-1 Verify Ledger toast → card `#verify-card` (erp_pills.js `_verifyLedgerCard`): summary row
  `✓ N ops — chain intact` / `✗ Tamper at op N — <reason>`, pill toggles open/close.
  §-line: `§VERIFY-CARD ok=<bool> len=<n>` (and `§VERIFY-CARD action=close` on dismiss).
- A-2 Shared chrome: `.erp-test-card` / `.erp-test-card-x` extracted in `_injectStyle()`; both
  `#verify-card` + `#doc-cycle-card` carry `class="erp-test-card"`. Pure CSS, zero behaviour.
- A-3 Tooltips in pills.json `title=`: verify="Verify Ledger — hash-chain tamper check on your live
  op-log"; doc-cycle="Doc Cycle — 13 engine tests (always green)".
- A-4 ERPUserGuide §13 updated to card UX + `mkdocs gh-deploy` (red1oon.github.io/BIMCompiler/).
- Regression: `§DOC-CYCLE total=13 pass=13` unchanged (logic untouched). erp_pills.js?v=34,
  pills.json?v=29, sw v664→v665. `node --check` clean; CI e2e+fast green.

### Track B — POS Panel UX Compact ✅ (bim-ootb PR #288, erp sw v666)
- B-1 Ordered-items drawer (collapsed per new sale). Log: `§POS-DRAWER-ITEMS open=<bool> count=<n>`.
- B-2 Replenishment drawer. Log: `§POS-DRAWER-REPL open=<bool> count=<n>`.
- B-3 Tender + Deliver-later → 48px icon buttons (Lucide `banknote`/`package` added to erp/icons.js),
  flanking the centred total; ids `#pos-float-tender`/`#pos-float-deliverlater` + handlers + the
  deliver-later dictionary gate (`§POS-DELIVERLATER door=on/off`) all kept VERBATIM.
- B-4 Scan hint "Hold steady · 10–15 cm from barcode" (`§POS-SCAN-HINT shown=true`) +
  capability-guarded macro focus after getUserMedia (`§POS-FOCUS-MACRO applied=<bool>`). ERPUserGuide
  §7 panel-layout + scan tip + `mkdocs gh-deploy`.
- Regression (worktree-served): `W-WH-POS-PICK-LIVE PASS` (P1–P4 door/tender/persist through the new
  chrome) + `W-POS-LIVE PASS` (`§POS-CENT … maxDiff=0c`, Tender path byte-identical). pos_lens.js?v=6,
  icons.js?v=6, sw v664→v666 (synced over Track A's v665 on merge: kept higher version, bodies
  identical). `node --check` clean; logs `build/erp/poc_wh_pos_pick_live.log` + `poc_pos_live.log`.

### Track C — WH Walk UX ✅ (bim-ootb PR #289, viewer sw v649)
- C-1 Auto-engage on WH building load, deferred until geometry ready (`A._bboxCleared`); pill kept for
  manual close/reopen. Log: `§WH_AUTOSTART gate=true open=auto`. Witnessed in `poc_wh_walk_live.log`.
- C-2 Zoom pull-back: focusStep `dist *1.5+0.5→*4+0.5`, `min 2.5→6`. Log: `§WH_ZOOM dist=6.0 min=6`.
- C-3 Fast-confirm: after qty OK, auto-open NEXT step's scan once the fly settles (per-bin refuse gate
  `scanInput` untouched). Log: `§WH_AUTOADVANCE step=2/3 scan=auto-open`.
- C-4 Route-list drawer above the strip (`▸ Movement N steps/N remaining`, current `→` green, done `✓`
  dimmed; auto-expands once at start). Log: `§WH_ROUTE_DRAWER open=false steps=3 done=0` (toggle).
- C-5 `↺` switch-source mid-walk (Lucide rotateCcw added to panels.js ICONS; data-gated posDocs>0,
  absent not greyed). Abandons remainder honestly (`§WH SOURCE_SWITCH abandoned=<k> steps`); main line
  `§WH_SOURCE_SWITCH posDocs=<n> selected=<id>`. Button visibility witnessed `state=shown` (posDocs=1).
- C-6 Audio earcons on bin/qty/skip — NEW sfx.json ui_sounds rows `wh_confirm`/`wh_qty`/`wh_skip`
  (data, network-first). Logs: `§WH_AUDIO event=confirm|qty|skip sfx=played`.
- Witnesses adapted IN THE SAME TRAIN (bim-compiler scripts, all green): poc_wh_walk_live.js
  (tolerate C-1 already-open; +§C-1/§C-4 verdicts) + poc_wh_pos_pick_live.js (C-1 guards; +C-5
  feature-tolerant button verdict). `W-WH-LIVE PASS` + `W-WH-POS-PICK-LIVE PASS`; `npx eslint viewer`
  exit 0 (no-undef gate). wh_walk.js?v=4, panels.js?v=40, sw v648→v649.

NON-INVENT held throughout: presentation only, newVerbs=[], no engine/fold changes; ids extracted,
icons Lucide-only. WORK-TO-ZERO: every item ✅.

---

## ✅ RESUME DONE (2026-06-13, Opus) — Track C live-fixes + Track D POS minimalist BOTH SHIPPED + MERGED
- **Track C live-test fixes ✅ (bim-ootb PR #290, viewer sw v650, wh_walk.js?v=5):**
  - C-fix-1 dropped the C-3 auto-scan-reopen — `confirmQty` now `advance()` (was `advance(true)`); the
    `autoScan` param is gone from `advance()`. Clean flow: pick → scan closes → camera flies → picker
    walks → taps Confirm bin → scan opens. (`§WH_AUTOADVANCE` retired.)
  - C-fix-2 whole-pick framing: `focusStep` fits the UNION AABB of the REMAINING route bins (progressive —
    widens at start, tightens as picks complete). Fit uses `tan(fov/2)*min(aspect,1)` so portrait phones
    get the tighter HORIZONTAL fov (the 16m bin span was clipping with the naive vertical-fov fit), 1.3×
    margin, single-bin fallback. `§WH_ZOOM fit=whole bins=N dist=D`. Verified by bin-geometry maths
    (101@x=0.6, 102@x=16.6 in a 24×15m warehouse). W-WH-LIVE + W-WH-POS-PICK-LIVE green.
- **Track D POS minimalist ✅ (bim-ootb PR #293, erp sw v668 [synced over #292's v667], pos_lens.js?v=7,
  icons.js?v=7):**
  - D-1 orange (ordered-items) + green (replenishment) edge-rim drawers, FULLY TEXTLESS, tap-to-expand,
    meaning in `title=` hover (`§POS-DRAWER-ITEMS/REPL`).
  - D-2 total = hero, flanked by scan (left, `#pos-pill-scan` add-item) + banknote (right). `$` no longer
    commits — opens the receipt-preview modal `#pos-pay-modal` ([QR demo] · [#pos-pay-ok = manual pay →
    Complete] · [Cancel]). **Commit moved from `#pos-float-tender` → `#pos-pay-ok`** (engine byte-identical).
  - D-3 ⋯ dock (`#pos-dock`, reveal-up, outside-click-closes, z-index 9550 ABOVE the panel): home · import ·
    receipt · deliver-later (still dictionary-gated). Deliver-later moved OFF the total row into the dock,
    id+handler+gate verbatim.
  - D-4 cart pill `#pos-pill-payment` toggles the panel open/close (`§POS-FLOAT toggle=`).
  - D-5 deliver-later POC opens the WH walk in a NEW TAB (`§POS-DELIVERLATER walk-tab=opened`).
  - icons.js +`qrCode` (verbatim Lucide). Witnesses updated SAME TRAIN (tap `#pos-float-tender` → wait modal
    → `#pos-pay-ok`; P2 empty-cart deliver-later via dispatchEvent since it's now in the collapsed dock):
    W-POS-LIVE PASS (`§POS-CENT maxDiff=0c`) + W-WH-POS-PICK-LIVE PASS. Localhost screenshots shown, user go.
  - ERPUserGuide §7 (+§9 deliver-later) updated to the new chrome + `mkdocs gh-deploy`.
- sw.js conflict magnet hit (PR #292 also bumped erp→v667): resolved = took v668, KEPT BOTH precache hunks
  (pos_lens.js mine + crud_overlay.js?v=4/crud_ops.json theirs), chained both version comments. Orphan-check
  PASS (origin/main e820d2d carries v668 + pos_lens?v=7). Both worktrees removed.

---

## ▶▶▶ (historical) NEXT SONNET SESSION — these were the resume items, now ✅ DONE above
Tracks A/B/C ABOVE are SHIPPED + MERGED (see # DONE). THIS resume block = the user's live-test follow-ups
(2026-06-13). Order: **Track C live-test fixes FIRST** (viewer/wh_walk.js — quick, fixes a regression I
caused), **then Track D POS minimalist** (erp/pos_lens.js — the bigger restyle). Two separate PRs (different
surfaces: viewer vs erp). NON-NEGOTIABLE (same as A–C): spec-first · witness-led · NON-INVENT · newVerbs=[]
(presentation only, NO engine/fold changes) · Lucide-only icons · bim-ootb edits in /tmp/wt-* off FRESH
origin/main · ONE PR per track · sw bump · orphan-check after squash · sw.js conflict magnet (keep both
hunks, higher version). ⚠ UI-ITERATION (feedback_wait_for_permission_ui): rim colors / flank layout / zoom
framing are tune-by-eye — build on localhost, SCREENSHOT for the user, get "ok/go" BEFORE deploy. State at
writing: erp sw v666 (pos_lens.js?v=6), viewer sw v649 (wh_walk.js?v=4), origin/main tip b18640b.

## ▶ Track C — LIVE-TEST FIXES (user, 2026-06-13, after v649 shipped — do these BEFORE Track D)
Two findings from the user testing the shipped warehouse walk. Both are tuning/flow, presentation only.
- **C-fix-1 "I'm at this bin" flow janky** — ROOT CAUSE = my C-3 auto-scan. `confirmQty` does
  `closeScan(); …; advance(true)` → the scan screen CLOSES then AUTO-REOPENS after the ~1s fly, so the
  next bin's "✓ I'm at this bin" pops up BEFORE the picker has walked there (vouching prematurely) + a
  jarring close→reopen flash. The manual-confirm IS the act-at-the-bin gesture; auto-presenting it
  defeats the discipline. FIX (recommended): drop the auto-scan-reopen — `advance(true)`→`advance()` in
  confirmQty (KEEP the fly; advance() already flies). After a pick: scan closes, camera flies to the
  next bin, picker taps "Confirm bin"/lit-3D-bin → scan opens → "I'm at this bin". Restores the clean
  flow the user had pre-C3. (C-3's "re-tap friction" was actually the honest arrival gesture — wrong
  call.) Update the witness: drop the §WH_AUTOADVANCE expectation. Keep C-1/C-2/C-4/C-5/C-6.
- **C-fix-2 zoom STILL too near** — C-2's `*4+0.5, min 6` frames ONE bin too tight. User wants the WHOLE
  pick in frame ("fit screen the whole pickup items… see them relative to each other… or a sense of
  it"). FIX: frame the UNION AABB of all route bins (or all remaining steps), keep the CURRENT bin lit
  bright (`_box` 0x4fc3f7) + rack overlay, so the picker sees the whole layout with the active bin
  highlighted. Compute union of `_aabb(step.m_locator_id)` over `W.steps`; fit camera distance to that
  box (fov-based fit, margin ~1.3×). Falls back to single-bin frame if only 1 routable bin. §WH_ZOOM
  becomes `§WH_ZOOM fit=whole bins=<n> dist=<d>`. Tune on the GardenWorld warehouse by eye (localhost).
  ⚠ UI-ITERATION: propose the framing on localhost, show the user, tune before deploy.

## ▶ Track D — POS Minimalist Refinement (RESUME, NEXT SESSION — user dictation 2026-06-13)
**Worktree `/tmp/wt-pos-minimal` off FRESH origin/main · files: `erp/pos_lens.js`, `erp/icons.js`,
`docs/ERPUserGuide.md §7`. Presentation only, newVerbs=[], ids/handlers verbatim, Lucide-only.**
⚠ UI-ITERATION RULE (feedback_wait_for_permission_ui): this is aesthetic back-and-forth — PROPOSE each
visual (rim colors, flank layout, dock) + WAIT for "ok/go" before edit+deploy; don't auto-ship guesses.
Build on the shipped Track B chrome (erp sw v666, pos_lens.js?v=6). Goal = barest hero-total surface.

Target after D (user-locked 2026-06-13, payment flow revised):
```
  ┌══════════════════════════════════┐   ← ORANGE rim = Ordered items (FULLY textless, tap to expand)
  │  [scan]     47.50        [$]     │   ← scan LEFT (add item) · total hero · $ RIGHT (pay → preview)
  └══════════════════════════════════┘   ← GREEN rim  = Replenishment (FULLY textless, tap to expand)
        ship-later + home + import + receipt-reopen → ⋯ dock (bottom-right), collapsed by convention

  tap [$] → RECEIPT PREVIEW modal (pre-completion):
  ┌────────────────────────────┐
  │  Receipt preview            │
  │  2 × Garden Hose    19.00   │
  │  1 × Spade          28.50   │
  │  ──────────────────         │
  │  TOTAL              47.50   │
  │   [QR]    [OK]    [Cancel]  │   ← QR = pay code · OK = manual pay → COMPLETE · Cancel = back to cart
  └────────────────────────────┘
```

- **D-1 Edge-rim drawers, FULLY TEXTLESS** (replace the `▸ Ordered items (N)` / `▸ Replenishment (N)`
  text headers): top edge = bright ORANGE rim (Ordered items), bottom edge = bright GREEN rim
  (Replenishment). Tap the rim to expand/collapse its body. NO text, NO count badge (user chose fully
  textless 2026-06-13). Meaning lives in `title=` hover ("Ordered items (N)" / "Replenishment (N)") +
  ERPUserGuide §7. Keep `§POS-DRAWER-ITEMS`/`§POS-DRAWER-REPL open count` (chrome-only). The rim = the
  tap target (thick top/bottom border that brightens on hover/active).
- **D-2 Total flanked by TWO icons only — scan (left) + $ pay (right) → receipt-preview pay modal:**
  - LEFT = **barcode scan** (Lucide `scan`) → opens the scan overlay to add a product to the cart
    (promote the existing `#pos-pill-scan` action to this flanking spot). User note: keep this scan flow
    NEATER than the WH pick (see Track C live-test "process not neat, get lost").
  - RIGHT = **$ pay note** (Lucide `banknote`, keep) → does NOT commit on tap anymore; it OPENS the
    **receipt-preview pay modal** (merge the existing §P-11 `_showReceipt` overlay + the DEMO pay-QR into
    ONE pre-completion preview): shows the receipt lines + total, with THREE actions inside —
    - **[QR]** (Lucide `qrCode`) → show the DEMO payment QR (customer scans to pay; watermark DEMO ONLY).
    - **[OK]** (Lucide `check`) = **manual pay → COMPLETE the sale**: fire the EXISTING commit (the
      current `#pos-float-tender` handler: buildSaleGroup → commitGroup → `_showReceipt` final). This is
      THE Complete (was the unlabelled banknote button). `§POS-SALE …` unchanged.
    - **[Cancel]** (Lucide `xmark`) → dismiss the preview, back to cart, NO commit.
  - ⚠ WITNESS IMPACT: `poc_wh_pos_pick_live.js` + `poc_pos_live.js` currently click `#pos-float-tender`
    to complete. After this change the commit moves to the modal's **[OK]** — give it a stable id
    `#pos-pay-ok` and update the witnesses IN THE SAME TRAIN (tap $ → wait modal → tap #pos-pay-ok).
    Engine/op-group byte-identical; only the gesture path changes (preview→confirm).
  - Total stays the centred hero between the two flanking icons.
- **D-3 Ship-later + rest of toolbar → ⋯ pill dock** — **Deliver-later (`#pos-float-deliverlater`,
  package) moves OFF the total row INTO the ⋯ dock** (user: "not common; I'll demo that killer feature in
  a video"). KEEP its id + handler + door dictionary-gate (`§POS-DELIVERLATER door=on/off`) VERBATIM —
  only its location changes (dock entry, still data-gated: present only when docsubtypeso='SO'). The
  album-screen `#pos-pill-bar` (home/import/receipt-reopen) also collapses into the SAME bottom-right ⋯
  dock convention as erp/idmp/viewer (pill_builder.js idiom, reveal-up, outside-click-closes, collapsed
  default). Consistency per feedback_pill_icon_consistency. (scan = the exception, promoted to the left
  flanking icon per D-2.)
- **D-4 Cart pill closes the panel (BUG)** — reproduce first: the header ✕ (`#pos-float-close-btn`)
  closes, but the pill that SUMMONS the panel (`#pos-pill-payment`) must also TOGGLE it shut when
  already open (tap-again-to-close, the dock convention — same control opens AND closes). `§POS-FLOAT
  toggle=close`. Confirm exactly which "cart icon" the user means while reproducing.
- **D-5 Ship-later opens the WH Walk in a NEW TAB (demo POC, intended)** — after deliver-later commits +
  persists the op-log, `window.open('../viewer/viewer.html?db=../buildings/warehouse_gardenworld.db',
  '_blank')` IN THE SAME click handler (user gesture → no popup block). User mimics walking to fetch,
  closes the tab → back at POS. POC-only (real flow = in-app nav, named v2). `§POS-DELIVERLATER …
  walk-tab=opened`. ⚠ verify the warehouse db short-URL resolves on Pages (in-repo, project_spatial_picking).
- **D-6 Full POS order-cycle check** — witness the COMPLETE cycle end-to-end through the new chrome:
  Tender path (C_Order CO + M_InOut CO + C_Invoice CO + backflush + replenishment) AND deliver-later
  path (order CO + shipment DR → WH walk → pick-complete CO). `W-POS-LIVE` + `W-WH-POS-PICK-LIVE` stay
  green; add a cycle-completeness assertion if not already covered (the 9-op group from §7 ERPUserGuide).
- **Regression before PR:** `WT_ROOT=/tmp/wt-pos-minimal bash build/erp/run_witness.sh
  scripts/poc_wh_pos_pick_live.js` + `ERP_ROOT=/tmp/wt-pos-minimal/erp node scripts/poc_pos_live.js`
  (fix any selector the restyle moves IN THE SAME TRAIN; #pos-float-tender/#pos-float-deliverlater/
  #pos-float-bp/.pos-card stay clickable). **Train:** ONE PR; pos_lens.js ?v=6→7 (+icons.js if touched)
  + erp sw bump; mkdocs gh-deploy once for §7.

### ⊕ Coder's UX take (asked 2026-06-13) — recorded for the resume session
- **Strongest idea = D-5 (ship-later → WH tab).** That's the omnichannel "wow" a legacy, install-bound
  ERP can't match in a browser: sell at the till → physically pick at the warehouse → same SIGNED ledger
  closes it. LEAD the demo with this loop; it's the long-tail convincer, not the minimalism itself.
- **D-2 + D-3 (flank icons + ⋯ dock): low-risk yes.** Pure consistency with the established convention;
  declutters without hiding anything operative.
- **D-1 (edge-rim, no text): gorgeous for a NARRATED demo, risky for an UNATTENDED cashier.** POS is
  touch-first (no hover) and legacy users expect labels — a bare colored rim has weak affordance ("what's
  the green line?"). **USER OVERRULED my count-badge suggestion → FULLY TEXTLESS is the locked decision
  (build that, do NOT re-add a badge).** For POC/demo it's a net win (the reveal-on-tap is a delight
  beat); flag a future Settings "labels on/off" for real-cashier mode only if the user asks later.
- **The actual long-tail argument is NOT "look how minimal."** Skeptics read minimal as "toy." It's
  "this consumer-grade surface is a REAL C_Order posting to fact_acct TO THE CENT, zero install" — so the
  demo narration should tap the clean surface and REVEAL the rigor underneath (the signed op-group, the
  §POS-CENT balanced posting, the real doctypes). Minimalism + provable rigor = "the future"; minimalism
  alone = "cute". Keep the Verify-Ledger / Doc-Cycle proof pills one tap away during the POS demo.

---

## ⟳ FOLLOW-UP ROUND 2 — live-test observations (user-dictated 2026-06-14, NOT yet built)
# Recorded VERBATIM-faithful from the user after using the deployed surface (post erp sw v675 / viewer
# v654). RULES UNCHANGED: presentation-only · newVerbs=[] · NON-INVENT (extract ids/rows) · Lucide-only ·
# reproduce-first (open the LIVE surface, confirm the complaint, THEN fix what's actually broken — do NOT
# guess) · keep the witnessed ids + §-lines (or update the witness IN THE SAME train) · ONE PR per surface.
# ⚠ Where an item is ambiguous about WHICH control, the implementer CONFIRMS against the live surface
#   before coding — never invent the target. Do not add design the user did not ask for.

### B/D-R2 — POS panel (pos_lens.js, idempiere.html) — corrections to Track D minimalist
- **R2-1 Top "running total" bar.** The POS panel's TOP row currently shows the shopping-cart icon on a
  BLANK bar. Make that row SHOW THE RUNNING TOTAL (live cart total updates as items ring). The cart icon
  stays; the blank space becomes the total.
- **R2-2 Scan-QR on the right of that top bar.** Put the scan-item (QR) button at the RIGHT side of that
  same top-total bar. (Promote/move the existing scan action here.)
- **R2-3 Drop the rim pay panel → ONE single Pay icon on the right.** "No more on the pay panel with
  rims" — retire the rim-edge pay treatment; the only pay control is a SINGLE Pay icon on the right.
  ⚠ Reproduce which element the user calls "the pay panel with rims" (the D-1 edge-rim drawers and/or the
  D-2 receipt-preview modal) before removing — keep the COMMIT engine path byte-identical (§POS-CENT).
- **R2-4 Pay panel must be DRAGGABLE.** The pay panel should be drag-repositionable (the float-panel
  drag idiom already used elsewhere — extract it, do not invent a new one).
- **R2-5 BUG: Pay icon stopped working.** The Pay icon no longer fires the sale completion. Reproduce
  (likely a regression from the Track D modal-id move `#pos-float-tender`→`#pos-pay-ok`, or this lane's
  v675 dispose change) → restore Complete (buildSaleGroup → commitGroup → receipt). Witness must click the
  REAL working id and reach `§POS-SALE`/`§POS-CENT`.
- **R2-6 POS dock pill icons (the 3-icon pill).**
  - 2nd icon (import a NEW product) → use an "arrow-into-tray" / clearer NEW glyph, **or simply `(+)`**.
    (User offered the choice; pick a Lucide line glyph matching the chosen sense — no unicode.)
  - 3rd icon → "you invented a new icon; NO — STICK TO THE WH WALK ICON" (the `route` glyph now in
    erp/icons.js, shipped v675) and have it LEAD TO THE WH WALK IN A NEW TAB (the D-5 ship-later → WH-tab
    behavior, but surfaced with the route icon, not an invented one). ⚠ Reproduce which dock entry is
    "the 3rd icon" before swapping.

### C-R2 — WH Walk (viewer/wh_walk.js, viewer.html) — corrections + new behavior
- **C-R2-1 Tap a pick-list item → show it in scene + frame to it.** The bottom route/pick panel lists
  the items to pick; tapping a line should HIGHLIGHT that bin in the 3D scene and FLY/FRAME the camera to
  it if it's outside the current view (reuse the existing per-step `focusStep`/fly-to — do not invent).
- **C-R2-2 Big running "picked" counter, top-LEFT.** A LARGE running number = orderlines picked, starting
  at 0. Bright color (AMBER) while in progress; turns BRIGHT GREEN when it reaches the total (all picked).
- **C-R2-3 Remove the existing top-left EXIT icon.** There is presently a top-left icon that exits —
  remove it (the ⌂/home or ✕ in the strip — reproduce which; the exit affordance is the X per C-R2-6).
- **C-R2-4 Tap the highlighted box in scene → opens its scan screen.** Tapping the lit/target bin in 3D
  opens that bin's scan screen. AND make "Confirm bin" act as an AUTO-CONFIRM pick (confirm the pickup
  WITHOUT going through the scan overlay); each press marks that line DONE.
- **C-R2-5 No main 3-dot pill behind to jump off.** While in WH walk, do NOT show the main 3-dot pill
  (the BIM/idmp dock) behind the walk — the walk is its own mode (walk-mode already hides `#mobile-pill`;
  confirm nothing else 3-dot remains reachable behind).
- **C-R2-6 Finish conditions.** The walk FINISHES when ALL items are green (fully picked). OR pressing X
  = simply EXIT with a half-pick (or any partial) and return to the shop cart — no forced completion.
- **C-R2-7 Shop cart settles payment even on incomplete pick.** The shop cart can settle payment even if
  the pick is incomplete — it's for records (some items may miss the shipment). That becomes back-order
  processing = the ERP's job (NOT this UI's concern; do not block payment on pick completeness).
- **C-R2-8 Resume same WH-walk state within the same sale.** Anytime, while still on the SAME sale,
  pressing WH Walk RETURNS to the state it left (half-pick etc.) — persist/restore the in-progress walk
  for that sale (the sidecar op-log already records confirmed picks; restore from it, do not re-draft).
- **C-R2-9 Minimalist scan window.** Reorganise the scan window to a more minimalist / modern look.

### R2-AUDIO — audio feedback where there is none (POS + WH Walk, user 2026-06-14)
- Add audio feedback to the key actions that currently have NONE — at minimum: POS ring-item / Pay /
  sale-complete, and any WH-walk gesture not already sounded. ⚠ NON-INVENT path (PRE-PINNED FACT #2):
  drive `SFX.play(id)` (viewer/sfx.js) / the ERP equivalent, resolving ids from `sfx.json ui_sounds`
  rows — EXTRACT the ids that already exist first (`wh_confirm`/`wh_qty`/`wh_skip` shipped v649); if a
  needed row is absent (e.g. pos ring/pay/complete), ADD it as DATA in sfx.json — never hardcode a synth
  tone in pos_lens.js/wh_walk.js. Reproduce which actions are currently silent before wiring. Keep it
  subtle (common HMI earcon, not noise); a mute/settings affordance only if the user later asks.

### Open question to resolve at implementation (do NOT invent — ASK if blocked)
- R2-3 / R2-6 / C-R2-3 each name a control by ROLE, not id — confirm the exact element on the live
  surface (reproduce-first). If any target is genuinely ambiguous after reproduction, ask ONE question
  rather than guess (per the user's "no inventing further without asking").

---

## # DONE — FOLLOW-UP ROUND 2 (2026-06-14, Opus — reproduced-first on the live surface, then built)

### C-R2 WH Walk ✅ SHIPPED + MERGED — bim-ootb PR #307 (viewer sw v655; on origin/main, layered to v656 by #296), wh_walk.js?v=7
Witnesses (bim-compiler, same train): **W-WH-LIVE 37/37 + W-WH-POS-PICK-LIVE 18/18**, `npx eslint viewer/wh_walk.js` exit 0. Presentation-only, engine byte-identical.
- C-R2-1 tap a route-list row → `focusStep` frames that bin (`§WH_ROUTE_TAP`; rows are real DOM nodes).
- C-R2-2 big running picked-counter top-left `#wh-pick-counter` (bare count; AMBER→GREEN when all picked; a skip is done-but-not-picked, never green).
- C-R2-3 `#wh-home` removed from the strip — exit = ✕ only.
- C-R2-4 strip "Confirm" = `autoConfirmPick` (default qty, no scan overlay, `§WH_AUTOCONFIRM`); the 3D-bin tap still opens scan (QR/typed/short-pick).
- C-R2-5 walk hides BOTH `#mobile-pill` AND its ⋯ `#mobile-trigger` (hiding only the strip left the ⋯ reachable bottom-right — the live-test bug).
- C-R2-6 ✕ exits with any partial pick kept (no forced completion); all-resolved still auto-completes.
- C-R2-7 STRUCTURAL (no code): the POS sale is already CO at deliver-later time, so the walk never blocks payment; a short/skip pick → back-order is the ERP's job (completeShipmentOps moves on-hand by PICKED).
- C-R2-8 re-open within the same session RESUMES preserved `W.steps`+`W.done`+`W.idx` (`§WH RESUME`); never re-drafts. (In-session resume; cross-reload restore-from-oplog NOT done — deferred.)
- C-R2-9 minimalist scan window (clean card chrome; same `#wh-*` ids + logic).

### B/D-R2 + R2-AUDIO POS ✅ BUILT + WITNESSED — bim-ootb PR #308 (erp sw v679→**v680** after sw.js conflict-magnet resolve vs the concurrent ERP_AUDIT_CHANGELOG v679; kept BOTH precache adds sfx.json+user_names.js, chained both notes), pos_lens.js?v=9, icons.js?v=10
**Auto-merge ENABLED, CI running** (gate BLOCKED=checks pending, not a conflict). Witnesses **W-POS-LIVE (§POS-CENT maxDiff=0c) + W-WH-POS-PICK-LIVE** green post-merge; `eslint` exit 0; drag `§POS-FLOAT-DRAG moved=Y`; sfx engine loads on the ERP page (`§SFX_INIT enabled=true sounds=3`, `§POS-AUDIO sfx=played`). Engine/commit path byte-identical.
- R2-1 top bar shows the live RUNNING TOTAL (`#pos-top-total`) — was the cart icon on a blank bar (cart icon stays, toggles the pay panel).
- R2-2 scan-QR (`#pos-pill-scan`) on the RIGHT of that top bar.
- R2-3 rim pay-panel RETIRED (orange/green edge drawers + receipt-preview modal `#pos-pay-modal`/`#pos-pay-ok` gone) → ONE single Pay icon `#pos-float-tender` on the right, completes directly.
- R2-4 the pay panel is DRAGGABLE by its grab header (ported `_makeDraggable` idiom).
- R2-5 BUG: reproduced — the old banknote did nothing with no partner (empty-partner gate returned before the modal opened). FIX = partner is DEFAULTED (`§POS-PARTNER-DEFAULT`); **user said default = 'Standard'** (name-match bp 112, else first-active). Single Pay icon now completes out of the box.
- R2-6 dock glyphs: import → `(+)` plus; deliver-later → `route` (the WH-walk icon, not invented) — still opens the walk in a new tab.
- R2-AUDIO subtle POS earcons `pos_ring`/`pos_pay`/`pos_complete` via the SAME viewer synth engine loaded on idempiere.html reading NEW `erp/sfx.json` (enabled + `ui_clicks:false` → only the explicit POS earcons, no per-button spam). Rows are DATA in sfx.json (+viewer/sfx.json). Guarded `pos_lens._sfx` no-ops if absent (`§POS-AUDIO`).

### ⬜ RESUME ITEMS (carry to next session)
1. ✅ **POS PR #308 LANDED** (orphan-check 2026-06-14: `origin/main:erp/sw.js` carries `CACHE_VERSION='v680'` + `pos_lens.js?v=9` + `icons.js?v=10`; `pos-pay-modal`/`pos-pay-ok` = 0 refs — modal retired as shipped. No orphan).
2. ✅ **ERPUserGuide §7 synced + published** (2026-06-14): replaced the stale "Payment panel layout (sw v667 — minimalist)" + retired the "receipt-preview pay flow" heading → new "top-bar total + single Pay" layout (`#pos-top-total` running total · `#pos-pill-scan` right · single `#pos-float-tender` Pay completes directly · draggable `§POS-FLOAT-DRAG` · Standard-partner default `§POS-PARTNER-DEFAULT` · dock `(+)`/`route` glyphs · R2-AUDIO earcon note). `mkdocs gh-deploy --force` pushed gh-pages `128a0a6f..2cfc26b1`; built `site/ERPUserGuide/index.html` carries new §7, old heading 0 occurrences. → red1oon.github.io/BIMCompiler/.
3. ✅ **R2-AUDIO control SHIPPED** — bim-ootb PR #313 (erp sw v684). Resolved per user ("why not use the pill audio icon in BIM"): surfaced the SAME Sound-FX speaker pill as the BIM viewer on idempiere.html (pills_idmp.json +audio order 8.7, volume2 glyph; IdmpPillActions.audio → window.toggleSfx + builder.sync(); IdmpPillActive.audio → __sfx.isOn()). Choice persists (localStorage sfx_on overrides erp/sfx.json), so the user controls on/off — no judgment-call default. Witness poc_idmp_pills.js §AUDIO-PILL (renders + pointerup flips __sfx.isOn true→false + lit follows; §A-RESULT PASS); served the worktree ROOT so sfx.js loads cross-dir, EXPECT updated to the real 16-pill registry. Auto-merge enabled.
4. ✅ **Cross-reload WH resume (C-R2-8)** SHIPPED + MERGED — bim-ootb PR #311 (wh_walk.js?v=8, viewer sw v657). Orphan-check 2026-06-14: origin/main carries v657 + wh_walk.js?v=8 + idmp_whwalk_progress. Spec below.
   Witness W-WH-POS-PICK-LIVE: step-1 SHORT pick → `§WH PROGRESS-SAVE picked=1/2` → page.reload() →
   re-pick still-DR shipment → `§WH RESUME-RELOAD restored=1/2` → counter=1 → `PICK-COMPLETE picked=2/3
   diffs=0 chainOk=Y` (restored W.done seals identically). W-WH-LIVE regression green (movement path
   unchanged); eslint exit 0. New IDB key `idmp_whwalk_progress` (UI-state cache, NOT the signed blob);
   pos-inout scope (completePos folds W.done, not the op-log). Auto-merge enabled.

---

## C-R2-8 CROSS-RELOAD RESUME — SPEC (2026-06-14, Opus — spec-first)
**Issue:** mid-walk picks survive a lens close→reopen (in-session, `§WH RESUME`, W is module-scope) but
NOT a PAGE RELOAD — `W.opDb` is a fresh in-memory db each load (wh_walk.js:114) and `draftFromPosDoc`
resets `W.done` to nulls (buildRoute:270); per-step pick annotations are NOT written to the IDB sidecar
until COMPLETION (`writebackToSidecar`, src='oplog' gated, :741). So reloading mid-sale loses the picks.
**Root cause proven by code** (no guess): the persisted blob `idmp_kanban_proj` holds the SALE doc (DR),
re-offered by the chooser on reload, but carries none of the in-progress pick state.

**Scope (NON-INVENT, newVerbs=[], no engine/fold change):** pos-inout SALE walks only (C-R2-8 = "same
SALE"). `completePos` folds `pickedByLine` from `W.done` (:666) — NOT the op-log — so restoring `W.done`
is sufficient for a correct sealed completion; no signed-op replay needed (movement-route resume, which
DOES fold the op-log at complete():787, stays out of scope — its completion would need op replay).

**Design — a SEPARATE lightweight UI-state cache (never mutate the signed kanban blob mid-walk):**
- New IDB key `idmp_whwalk_progress` in the existing `dbs` store (structured-clone JS object, no SQL):
  `{ "<m_inout_id>": { picks: { "<lineKey>": {qty,short,skipped,reason} }, idx, ts } }`,
  `lineKey = String(s.line.line)+'@'+String(s.m_locator_id)` (route-order-independent).
- `_persistWalkProgress()` — after each confirmQty / skip (pos-inout only): rebuild picks from
  `W.steps`+`W.done`, put under `String(W.doc.id)`. `§WH PROGRESS-SAVE inout=<id> picked=<n>`.
- `restoreWalkProgress()` — in `open()` after `buildRoute()` when `W.doc.kind==='pos-inout'`: read the
  key, match each saved pick to a step by lineKey → set `W.done[i]`; `W.idx`=first undone.
  `§WH RESUME-RELOAD inout=<id> restored=<n>/<steps>`. No entry → no-op (clean first walk).
- `_clearWalkProgress(id)` — on completion success: delete the entry (hygiene; the sidecar writeback
  already removes the doc from the chooser). `§WH PROGRESS-CLEAR inout=<id>`.

**Witness (whitebox §-first):** extend `scripts/poc_wh_pos_pick_live.js` — after W3 (step-1 confirmed),
`page.reload()` → re-open walk → re-pick the SAME shipment in the chooser → assert
`§WH RESUME-RELOAD … restored=1` + the picked-counter shows 1 → continue to step 2 → W4 PICK-COMPLETE
fold `diffs=0` UNCHANGED (proves the restored W.done seals identically). Train: ONE PR (viewer surface),
`wh_walk.js?v=7→8` + viewer sw bump; `npx eslint viewer/wh_walk.js` exit 0.

---

## ⟳ FOLLOW-UP ROUND 3 — live-test observations (paste-to-start)
# Paste-to-start: `proceed with prompts/UI_UX_LANE.md §FOLLOW-UP ROUND 3`
# RULES (unchanged): presentation-only · newVerbs=[] · NON-INVENT (extract ids/rows) · Lucide-only ·
#   reproduce-first (open the LIVE surface, confirm the complaint, THEN fix) · witness-led (§-log first) ·
#   bim-ootb edits in /tmp/wt-* off FRESH origin/main · ONE PR per surface · sw bump · orphan-check after squash.
# Where an item names a control by ROLE not id, CONFIRM against the live surface before coding — never invent.

## STATE AT WRITING (post ROUND 2, 2026-06-14)
- erp sw v684 (#313 Sound-FX pill) · viewer sw v657 (#311 WH cross-reload resume)
- pos_lens.js?v=9 · wh_walk.js?v=8 · idmp_pills.js?v=12 · pills_idmp.json?v=31 · icons.js?v=10
- ROUND 2 all ✅: (1) POS #308 orphan-checked · (2) ERPUserGuide §7 synced + gh-deploy ·
  (3) Sound-FX speaker pill on idempiere.html (the BIM audio pill; persists via localStorage sfx_on) ·
  (4) WH cross-reload resume (idmp_whwalk_progress IDB cache, restores W.done for the same sale).

## LIVE-VERIFY FIRST (before dictating ROUND 3 — reproduce on the deployed surface)
- [ ] POS — Sound-FX speaker pill toggles the earcons (ring/pay/complete); a mute sticks across reload.
- [ ] POS — top-bar running total updates as items ring; single Pay completes; pay panel drags.
- [ ] WH walk — pick an item → reload the page → reopen the SAME sale → picked counter restored.
- [ ] WH walk — tap a route row frames that bin; ✕ exits keeping a partial pick.

## ROUND 3 — dictated observations (verbatim, 2026-06-15) — POS register completeness
# User dictation (verbatim intent): "Keep the panel one bar line slim thus the rims are needed.
# Do not want them expanded." · "check that adding items do create its underlying records. And that
# payment has a button to processIt/Complete the Order." · "we forgot to have a previous sales records,
# as cashier need to recall what was sold or previous sale to be reverted. Organise it well in the scene."
# · "backflush should be a late process … it is an EODA … thus in the pill, organise such. Unicenta
# plugin already that way, learn from it." · "WH walk, also do your own as a user." · "Issues arise when
# you are not driving it as a user." → DRIVE EVERY CHANGE AS A USER (browser screenshots), not just witnesses.
#
# NON-INVENT GROUND (all extracted, witnessed):
#  - Doc chain proven: W-POS-{RING,HOLD,WR,REGISTER,BACKFLUSH,DELIVERLATER,VOID,REPLENISH} all green.
#  - Rim panel = restore e820d2d/v667 edge-rim drawers (.pos-rim-top orange #e65c00 = items drawer;
#    .pos-rim-bottom green #2e7d32 = replenish drawer); collapsed by default; total back INSIDE slim center bar.
#  - Pay = SET_STATUS CO = processIt (already wired §R2-3); keep R2: single Pay, draggable, partner-default, earcons.
#  - Previous Sales = query op-log kernel_ops CREATE_DOCUMENT C_Order; Revert = DocFSM VO (CO→VO,
#    reversePosting nets 0c, shipment C- negated → on-hand restored). Engine ready (ad_docfsm.js, W-POS-VOID).
#  - EODA = the late End-of-Day fold (POSLens.md §195 "fold the day: sales, stock, reorder, variance";
#    §206 "AutoBOMOrder + Replenishment Report → the fold"). MOVE backflush OUT of pos_core.completionOps
#    (per-sale CONSUME, lines ~118-126) INTO the EOD fold. New witness poc_pos_eoda.js: EOD CONSUME ==
#    Σ per-sale explodeBOM (nothing lost), qty spine moves ONCE at close, chainOk=Y.
#
# REFINEMENT (user 2026-06-15, round 2 of dictation):
#  - Big central total: KEEP large (easy to read the clocking-up total; handy to press).
#  - Pay needs an OK-CONFIRM before commit (R2-3 retired the modal; user wants confirm-to-pay back).
#  - Bottom GREEN rim = PREVIOUS SALES (recall + Revert/Void), NOT replenishment.
#  - Replenishment leaves the panel entirely → it is an EODA op.
#  - EODA = CLOSE CASH (Unicenta/any-POS close-till): one press → BOM backflush → Generate Replenishment
#    Report (iDempiere ops). The REPORT is issued from the MENU, not the panel.
#  - Cashier daily routine: open cash POS → sales → (send WH to collect if needed) → close till. All records generated.
#  - HISTORY LINE: record each sale (+ each ship/pick) as a history event (shared history_bar.js). POC volume
#    is light (few sales/day × few demo days = trivial; bounded by cache/client lifetime, TBD-not-spec'd).
#
# A. [x] Slim rim-drawer pay panel restored (items-rim / big total+Pay / bottom-rim), R2 bits kept.
#        DONE+user-driven: §POS-R3-SHAPE rims=true both collapsed total-in-panel 175.75 panelH=168;
#        shots r3_pos_{1_slim,2_items,3_replenish}.png. (bottom rim repurposes to Previous Sales in B.)
# A2.[ ] Pay → OK-confirm before commit (no direct complete on a stray tap).
# B. [ ] Bottom green rim = Previous-Sales recall drawer + per-sale Revert(Void). Replenish OUT of panel.
# C. [ ] EODA = Close Cash control: BOM backflush (moved off per-sale) → Generate Replenishment Report
#        (iDempiere ops, issued from menu). New witness poc_pos_eoda.js.
# D. [ ] History line records each sale + ship/pick (shared history_bar.js).
# E. [ ] WH walk user-drive (phone) + POS day-loop user-drive — screenshots, friction logged, fixed; deploy.
# Worktree: /tmp/wt-r3-pos (branch feat/r3-pos-eoda off origin/main @ 25b5b4b, sw v689).
