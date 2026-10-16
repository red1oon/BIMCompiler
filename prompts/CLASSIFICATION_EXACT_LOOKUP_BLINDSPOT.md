# ⚠ DO NOT REMOVE — LANE: exact-lookup consumers bypass matchRule's tier 1+2 entirely
# Opened 2026-08-05, spun out of a Find Panel blast-radius check on §CLASS_UNMATCHED_INHERITED
# (bim-ootb PR #1191). NOT a §CLASS_UNMATCHED_FALLBACK/§CLASS_UNMATCHED_INHERITED regression — those
# only ever touched the 3 matchRule() copies. This is a SEPARATE, pre-existing population of
# consumers that never went through matchRule at all, in any prior fix (#1186/#1187/#1191).
# PRIME RULE: EXTRACT ONLY. Every line/consumer below is grepped and read directly, not inferred.
#
# ██ STATUS 2026-08-05: CODE-COMPLETE + WITNESSED (P1-P4, §BUILD PLAN below). NOT YET MERGED. ██
# See §SESSION HANDOFF at the bottom for what a future session needs to know before touching this again.

## §WHAT'S ALREADY COVERED — don't re-litigate
- Find Panel's Phase axis (`viewer/navigate_find.js`) — reads `kernel_ops`, populated by
  `time_machine.js`'s `injectGantt()`, which IS one of the 3 `matchRule` copies, wired for tier 1+2 by
  construction (`rates.js:555`'s eager `IFC_SCHEMA_HIERARCHY` preload exists specifically so the live
  viewer path gets it). Confirmed unaffected/safe.
- `boq_charts.html`'s three stale hardcoded `PHASE_ORDER` arrays (`generateSchedule`,
  `audit4DSchedule`, `buildScheduleFromOps`) — different bug (wrong phase ORDER, not missing
  CLASSIFICATION), already fixed and shipped: `4D_SCHEDULE_PERFECTION.md` §GANTT_EDIT/BOQ4D,
  `witness_boq_charts_real_schedule.js` 91/91, 6 buildings. Do not re-open.
- `schedule_diff.js:144`'s 3-arg `matchRule()` call — structurally moot, `cls` there is a free-text P6
  activity name, not a real IFC class; `hierarchy[cls]` could never match regardless of arg count.

## §THE GAP — 6 consumers, exact `SEQUENCE_RULES[cls]` dictionary lookup, zero substring/tier-2
None of these call `matchRule()`. They do `rules[cls]` / `SR[cls]` / `SEQUENCE_RULES[cls]` — an exact
key match. `SEQUENCE_RULES` has no `...Type`-suffixed keys at all (no `IfcDoorType`, `IfcSensorType`,
etc. as literal keys — only `matchRule`'s substring test bridges those to their base-name entry). So
every one of these silently lands on ITS OWN generic default the moment a `...Type`-suffixed class, or
any of the 58 real occurrence classes named in the parent lane as still-unclassified (`IfcPile`,
`IfcVehicle`, `IfcTendon`, etc.), shows up — **with no `§CLASS_UNMATCHED*` log line at all**, unlike
`matchRule`'s tier 3. These consumers don't even get the visibility win #1186 shipped, let alone #1191's
tier 2.

**Higher priority — live on real authored schedules, not fallback-only:**
- `viewer/boq_charts.html:1808,1813` — the resource/crew-count chart. Runs on `scheduleData` regardless
  of whether it came from a real authored schedule or the fallback generator (BOQ4D's redirect fixed
  the SCHEDULE data source, not this downstream per-class resource re-lookup for the chart). A real
  authored building with an unclassified class would show wrong crew/equipment counts here today.
- `viewer/proj_fold.js:150` — feeds the "BIM→Project" ERP push, triggered from *inside* the Find Panel
  itself (`navigate_find.js:1921-1937`, `_pushToErp`). User-facing, one hop from the panel already
  confirmed safe — worth closing so the whole Find-Panel-adjacent surface is consistent.
- `viewer/rates.js:247` `getPhase()` → consumed by `viewer/variation_order.js:133,154,176` (S222
  Variation Order Excel export) — a real financial/contractual document.
- `viewer/rates.js:267` `WORK_PACKAGES` → consumed by `viewer/export_5d.js:234-244` (5D BOQ "Work
  Packages" export sheet). **Structurally different from the other 5** — not even keyed off
  `SEQUENCE_RULES`, it's a 4th, fully separate hardcoded classification: 6 packages, each an explicit
  `classes: [...]` membership array matched by `.includes()`. Unmatched classes land in a synthesized
  "PACKAGE 6: OTHER" bucket (`export_5d.js:237-240`) — silent, no log, and this list has its own
  independent maintenance burden separate from `SEQUENCE_RULES`'s 57 keys.

**Lower priority — bounded to the intentionally-preserved fallback-only path:**
- `viewer/boq_charts.html:477` (`generateSchedule()`) and `:908` (`buildScheduleFromOps()`) — both
  confirmed by direct read to run ONLY "because no real schedule is authored for this building"
  (`:471`) / only when `resolve4D` has no authored schedule to prefer (BOQ4D §B4). Per BOQ4D's own
  explicit ruling ("Do NOT patch `generateSchedule()` into a second engine — it stays exactly as-is, as
  the no-authored-schedule FALLBACK only"), these are lower risk by design — worth fixing for
  consistency, not urgent the way the two "higher priority" items are.
- `viewer/schedule_read_4d.js:140,186` — fallback path only; the PRIMARY path (task-name parsing) already
  inherits `matchRule`'s real classification via the persisted task name string, so this only fires
  when a task name doesn't parse cleanly.

## §MEASURED EXPOSURE
Same 58 real occurrence classes named in `BUILDINGSMART_IFC_SCHEMA_CLASSIFICATION.md`'s parent lane
(`IfcPile`, `IfcVehicle`, `IfcTendon`, `IfcFastener`, `IfcKerb`, `IfcRail`, etc.) plus any
`...Type`-suffixed class — none of these are caught by any of the 6 consumers above even after #1191,
because none of them call `matchRule()` at all.

## §PROPOSED FIX (spec only — not yet implemented, not yet approved)
Export a single `classify(cls, hierarchy)` helper from `schedule_author.js` (wrapping the existing
`matchRule` tier 1→2→3 logic, already proven and witnessed) and route all 5 `SEQUENCE_RULES`-based
consumers through it instead of a raw dictionary lookup — same "N independent copies" discipline this
whole lane already runs on, don't grow a 4th/5th/6th copy of the matching logic itself.

`WORK_PACKAGES` is the one structurally different case: decide whether to retire its own hardcoded
`classes: [...]` lists in favor of DERIVING packages from `SEQUENCE_RULES`' own `phase` field (the same
derivation `proj_fold.js:140`'s `phaseSeq` already does, and the same one `4D_SCHEDULE_PERFECTION.md`
§B0 used to fix `boq_charts.html`'s phase order) — this would collapse a 4th classification system into
the same one substrate, rather than adding a 4th consumer of the shared helper.

## §BUILD PLAN
- **P1 ✅ DONE (witness)** — `bim-ootb` PR #1196 (`fix/exact-lookup-classify-p1`), base=
  `feat/ifc-schema-classification` (stacked on OPEN #1191, not `main` — `classify()` wraps
  `matchRule`'s real tier 1→2→3 which only exists on that branch). Added
  `classify(cls, hierarchy, rules, dflt)` to `viewer/schedule_author.js`
  (pure pass-through to the existing `matchRule`, rules/dflt/hierarchy default from the same `window.*`
  globals its other exports already default from; trailing `rules`/`dflt` overrides exist only so a
  Node witness can drive it without a `window` to read from — real browser call sites just do
  `classify(cls)` or `classify(cls, hierarchy)`). Exported via `ScheduleAuthor.classify`.
  New witness `viewer/tests/witness_schema_exhaustive_classify.js`: for all 1006 real IFC schema
  classes, asserts `classify()` returns the byte-identical rule object + console.warn as `matchRule()`
  (G-H, 0 mismatches) and pins the tier split to the existing witness's own baseline — tier1=132,
  tier2=53, tier3=821 (G-I) — plus a no-`hierarchy`-arg call still resolves tier 1 correctly (G-J).
  5/5 pass. Reran `witness_schema_exhaustive_fallback.js` unchanged — still 6/6, confirming `matchRule`
  itself untouched. `eslint viewer/schedule_author.js` clean. No consumer wired yet — P2 does that.
- **P2 ✅ DONE (witness)** — same PR #1196. Wired both higher-priority live consumers through
  `classify()`, replacing the raw `SEQUENCE_RULES[cls]`/`SR[cls]` exact-key lookups:
  - `boq_charts.html:1808/1813` (crew chart) → `window.ScheduleAuthor.classify(cls,
    window.IFC_SCHEMA_HIERARCHY)`.
  - `proj_fold.js` — all 3 internal `SR[cls]` sites (not just the one line originally named), via a
    local `classifyCls()` resolved LAZILY inside `foldProjectOrder` — `viewer.html` loads
    `proj_fold.js` (:868) BEFORE `schedule_author.js` (:932), so a top-level capture of
    `global.ScheduleAuthor` would have frozen at `undefined` forever. Found and fixed before it shipped.
  - **Found + preserved a real contract**: `classify()`'s tier-3 default is `phase:'Architecture'`, but
    proj_fold.js's OWN pre-existing fallback was `'Unsequenced'` — and `time_machine.js:4376` +
    `poc_dashboard_variance.js:31` both filter `WHERE Name<>'Unsequenced'` to keep un-grounded costs
    out of the phase dashboard's committed-amount total. Routing tier-3 straight through would have
    silently collapsed that bucket into `'Architecture'`, leaking ungrounded costs into a real phase's
    total. Fixed: `classifyCls()` detects a genuine tier-3 hit (via the `§CLASS_UNMATCHED` warn, not
    `§CLASS_UNMATCHED_INHERITED`) and remaps it back to `'Unsequenced'` locally — tier 1/2 (the actual
    fix) pass through unchanged.
  - `navigate_find.js`'s ERP-push call site now also passes `hierarchy` so proj_fold's tier 2 fires
    live from the Find Panel, not just in tests.
  - Witnesses: `witness_exact_lookup_p2.js` (real `foldProjectOrder` against real `erp/ad_seed.db` —
    IfcTank tier 2 → MEP Rough-in/PLUMBER, IfcDoorType tier 1 substring → Architecture/CARPENTER,
    IfcActor genuine tier 3 → still Unsequenced, dashboard filter still correct, no-hierarchy callers
    degrade identically to pre-fix) 8/8 pass. `witness_exact_lookup_p2_boqchart.js` (the literal
    shipped `boq_charts.html` block, sliced verbatim via `vm`, not reimplemented) 3/3 pass. Reran
    `witness_schema_exhaustive_fallback.js` (6/6), `bake_gw_hospital_seed.js` (7/7, PlannedAmt golden
    unchanged), `witness_whatif_authored_sync.js` (9/9) — zero regression on real fixtures.
- **P3 ✅ DONE (witness)** — same PR #1196. Two items:
  - `rates.js getPhase()` (the ONE shared helper behind `variation_order.js:133/154/176`) now routes
    through `classify()` — fixes all 3 call sites without touching `variation_order.js` itself.
  - `WORK_PACKAGES` resolved as **derive, not retire**: extracted first (not assumed) that all 15
    non-empty rate templates' `work_packages` `classes:[...]` arrays are byte-identical to `rates.js`'s
    own default, same PACKAGE 1–6 order. Added a positional `phase` field (SEQUENCE_RULES' own field)
    to `rates.js`'s default + all 15 template JSONs (mechanical insertion, translated name/color/
    classes untouched). `export_5d.js`'s Work Package sheets now group by the real `classify()` tier
    1→2→3 result. Genuinely-unclassified rows still land in their own OTHER package — now `PACKAGE 7`
    (found + fixed a pre-existing id collision: OTHER previously reused `PACKAGE 6`, already taken by
    MEP FINAL FIX).
  - Witnesses (both vm-sliced literal shipped code, not reimplemented): `witness_exact_lookup_p3_
    getphase.js` 4/4, `witness_exact_lookup_p3_workpackages.js` 7/7. Reran all 6 earlier witnesses
    (schema-exhaustive ×2, P2 ×2, GW hospital fold — PlannedAmt golden unchanged, confirming the JSON
    edits didn't touch SEQUENCE_RULES/LABOR_RATES, whatif sync) — zero regression.
- **P4 ✅ DONE (witness) — LANE CLOSED**. Same PR #1196. The final two fallback-only sites:
  - `schedule_read_4d.js`'s `readTasks()` — 2 sites (resource/discipline tally, majority-phase
    fallback). A local `classifyCls()` returns `null` on genuine tier-3 (not the generic default),
    preserving today's "skip, don't count" behavior for truly unclassified classes.
  - `boq_charts.html generateSchedule()` (:477) — straight substitution, no tier-3 distinction needed
    (`DEFAULT_RULE` was already the same generic fallback).
  - `boq_charts.html buildScheduleFromOps()` (:908) — same tier-3-preserving pattern as
    `schedule_read_4d.js`, so kernel_ops's discipline Set isn't polluted by genuine unclassifieds.
  - Witnesses: `witness_exact_lookup_p4_scheduleread.js` (real `readTasks()` on a real sql.js fixture —
    3× genuine-tier-3 elements do NOT hijack the majority-phase vote despite outnumbering the real
    classes 3-to-1) 3/3, `witness_exact_lookup_p4_boqchart.js` (both sliced blocks) 5/5. Reran the full
    regression set including the ROOT-level `witness_boq_charts_real_schedule.js` (91/91, Hospital+
    Terminal, 48000+ real elements) — zero regression across the whole lane.

All 6 originally-identified exact-lookup consumers, plus `WORK_PACKAGES`' 4th separate classification
system, now route through the real `matchRule` tier 1→2→3 via `classify()`. Nothing left in this lane.
- Full existing regression suite must stay green at every step (this lane's own standing discipline).

## §RELATED
- `prompts/4D_SCHEDULE_PERFECTION.md` §CLASS_UNMATCHED_FALLBACK, §GANTT_EDIT/BOQ4D — the classification
  fix and the (separate, already-closed) phase-order fix this lane must not duplicate
- `prompts/BUILDINGSMART_IFC_SCHEMA_CLASSIFICATION.md` — the tier 1→2→3 substrate this lane extends
  coverage of, not a new mechanism

## §SESSION HANDOFF (read this first if picking this lane back up)
**Where the code lives**: `bim-ootb` branch `fix/exact-lookup-classify-p1`, PR **#1196**
(https://github.com/red1oon/bim-ootb/pull/1196), 4 commits (P1/P2/P3/P4), all pushed. Worktree used
this session (`/tmp/wt-exact-lookup-p2` → recreated as `/tmp/wt-exact-lookup-p4`) has been pruned
(fully pushed, clean) — recreate with `git worktree add <path> fix/exact-lookup-classify-p1` if you
need to touch this code again; don't assume a worktree still exists.

**Why it's not merged yet — and why that's expected, not stalled**: PR #1196's BASE is
`feat/ifc-schema-classification` (PR **#1191**, itself still OPEN as of 2026-08-05), not `main`.
`classify()` (P1) is a thin wrapper around the 4-arg `matchRule(cls, rules, dflt, hierarchy)` tier
1→2→3 signature that #1191 introduces — that signature does not exist on `main` yet. **Merge order
matters: #1191 must merge first, then #1196 can merge on top (or get rebased onto `main` if #1191's
shape changes during its own review).** Check `gh pr view 1191 --repo red1oon/bim-ootb --json state`
before assuming either PR's status — both were last confirmed OPEN this session.

**What's genuinely done**: all 6 originally-identified exact-lookup consumers (§THE GAP above) plus
`WORK_PACKAGES`' separate classification system now route through the real `matchRule` tier 1→2→3 via
`classify()`. 8 new witness files, all passing, all driving REAL required code or literal shipped
blocks sliced via `vm` (never reimplemented) — see the P1-P4 entries in §BUILD PLAN above for exact
counts. Full existing regression suite (schema-exhaustive, GW Hospital fold, whatif sync, the
root-level `witness_boq_charts_real_schedule.js` 91/91 against real Hospital+Terminal fixtures)
reran clean at every step — zero regression introduced.

**What's genuinely NOT done — the one honest gap**: no live-browser exercise. Every witness in this
lane is headless (`node ...witness_*.js`), per the project's FUNDAMENTAL LAW (code/math is the proof,
not screenshots) — that's the correct verification method, not a shortcut, but it means nobody has
clicked the actual crew chart, ERP push button, Variation Order export, or Work Package Excel sheet in
a running browser session yet. PR #1191 itself carries the identical open item ("Live-browser exercise
— not yet done, same open item as prior fixes in this lane"). If a future session wants to close that
gap: `localhost:8399` (the standing bim-ootb sandbox), load Hospital or Terminal, exercise the Find
Panel → BIM→Project push, the boq_charts.html crew chart and Work Packages export, and the Variation
Order export — and read the `§CLASS_UNMATCHED*` console lines while doing it, not the pixels.

**If #1191 merges before you return here**: rebase `fix/exact-lookup-classify-p1` onto `main` (or
retarget the PR base to `main` once #1191's own commits are on `main`), rerun the full witness list
named above, then it's mergeable. No code changes should be needed — this was written against #1191's
shipped `matchRule` signature, not a moving target.
