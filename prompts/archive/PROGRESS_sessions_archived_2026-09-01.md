# PROGRESS — archived session log (cut 2026-09-01)
# ⚠ DO NOT REMOVE — historical trail only. Live state lives in ../../PROGRESS.md.
# Archived because PROGRESS.md had grown to 717 lines against its 80-line budget
# (CLAUDE.md Session Closeout). Nothing here was deleted, only moved.

## Superseded — 2026-08-27 (4D MODEL INTEGRITY), kept for historical trail only
**DAY-0 integrity is at ZERO.** `§W_D0` (`bim-ootb viewer/tests/witness_day0_integrity.js`)
**14 PASS / 0 FAIL / 2 INCONCLUSIVE** — **STALE, see Current State above.**
**⚖ USER RULING 2026-08-27 — canonical model is the TEMPLATE PATH (`instantiateTemplate`).**
bim-ootb #1550/#1552/#1553/#1551 MERGED — `§TPL_MODEL`, `§STOREY_DATUM`, datum-is-floor, TM
wiring traced sound (`instantiateTemplate` → `_writeTemplateSchedule` → `buildTaskIndex` →
`gantt_model.buildTasks`). Full detail: `4D_MODEL_INTEGRITY.md` §L.

> **Rule:** PROGRESS.md is a thin status file. No specs here — specs live in `docs/` and `prompts/`. Keep this file under 80 lines.
> ⚠ Over budget (750+ lines) — the archiving pass on `## OPEN`'s oldest items is still owed
> (each needs a still-open-vs-DONE check by a session that owns its context before compressing).

## ▶ NEW LANE 2026-08-26 — BIMEyes STRUCTURAL ORACLE (the 4D judge)

`prompts/BIMEYES_STRUCTURAL_ORACLE.md` (S1–S14). Owns the JUDGE; `4D_BAR_MODEL.md` owns the
SCHEDULER. Handed to the dev session for second opinion 2026-08-26.
**Read §S14 FIRST — it withdraws §S13's headline as self-certifying.**
Settled by measurement this session: IFC carries no vertical support relation (§S7, POC on the
source IFCs) · 100% of played-timeline floating is manufactured by `_tmRescaleToTaskWindow` (§S8b)
· intra-bar gravity is 10.2/28.9/**69.3**% (Duplex/HHS/Terminal) so bar separation alone cannot
work (§S10) · removing the election REDUCES band inversions 21–41% (§S13) · the stacking fix
already exists in `remapSolveToTasks:884`, which §13.1 marks "delete, zero risk" (§S14).
bim-ootb branches: `probe/intrabar-share`, `probe/support-dag`, `feat/support-set-e1` (env-gated,
default path untouched). PR #1545 (both probes) MERGED.
⛔ Next is D1 — ONE reachability judge rooted at the ground datum. Until it exists every scheduler
change produces two numbers and an argument.

Also 2026-08-26: the Spatial Compilation paper is PUBLISHED at
https://red1oon.github.io/BIMCompiler/SpatialCompilationPaper/ with a Provenance section
(priority date 2026-03-30 04:48:48 +0800, tags `paper-spatial-compilation-v1`,
`paper-first-published`, Wayback snapshot taken).

## ▶ 2026-08-27/29 restart trail — SUPERSEDED, see Current State at top
The `§FUTURE item 2` "bars too short" block (3x calibration, `min_days` question) that stood here
BLOCKED is resolved as part of the `§PHASE_WATERMARK_FLOOR` work above — see
`4D_GANTT_TM_REFACTOR.md` for the full trail. `4D_MODEL_INTEGRITY.md` §I's stale "where inside its
task?" citation (`fix/tpl-layer-order`, now merged) still needs its own fix, not done yet.

**ERP T-0 (`prompts/RESUME_ERP_T0_TRUTH_MAINTENANCE.md`) — 5 of 7 items closed 2026-08-24.**
Remaining, both genuinely multi-session: item 5 (Form-screen renderer) and item 7 (the 454/476-
unported-process corpus). Read that file before starting either.

## Session 2026-08-17 (Fable, marathon) — 4D Gantt lane S1-S22 all shipped+merged, closed
Full trail in `prompts/4D_GANTT_TM_REFACTOR.md`. Root causes fixed, each independently verified
(PR + numbers, not claims): crew-unaware CPM tail compression ("stack hell", S6), Terminal/LTU
`meta.db` transform self-corruption (S10/S11, proven via r-tree self-contradiction not just
cross-file disagreement), missing `IfcBuildingStorey.Elevation`/parentage extraction for
Clinic/Terminal/Hospital (S18/S21 — federated storey-name-soup was the real driver of residual
clustering, S15), a live root-cause misdiagnosis caught before shipping (S13.7 measured dead legacy
code, retracted, redirected — S14.0), the dead legacy 11-pass repair pipeline finally deleted after
its own witnesses were redesigned first (S19/S20, -1153 net lines), and a real Gantt-drag
invisible-after-scrub bug (S22 — clock-unit mismatch between TM's internal clock and real-calendar
dates, not any of 3 initially-suspected rendering candidates). Fleet floating held 0/7 throughout.
Standing rules added: `§PATHS NOT TO TAKE` (8 dead ends + the "don't call a DB corrupt without
self-contradiction/source proof" rule) and a mechanical reachability-proof gate for any future
root-cause probe. **Open, named not fixed:** `HHS_Office_Federated` surfaced live with the same
missing-elevation gap as a third building — not yet diagnosed whether it costs anything (its own
storey ladder looks clean). LTU's elevation gap also still open (parentage already correct).

## Session 2026-08-16 (Sonnet, continued) — §MIRROR_ROOM_PROBE SHIPPED (bim-ootb#1407); 3 costed items queued for next session
Alt+S glossy/metal materials now reflect a real one-time room-capture instead of only the static
sky (PR #1407, merged). 3 follow-ups found+costed, not started: §MIRROR_TRUE_REFLECT (real per-
mirror reflection, mirrors wrongly swept into the pipe/duct sky-tint exemption, ~1-3h depending on
material exclusivity), §TRIPLANAR_MEP_GAPS (grain texture missing on IfcFlowController/
MovingDevice/etc — reads as "selective" on piping, ~30-45min), §EXTERIOR_FLAT_SHADOW (not
investigated — AO-by-design vs real shadow-frustum gap, needs a live check first). Full detail:
`prompts/PHOTOREAL_STILL_RENDER.md` ▶RESUME §OPEN TASKS.

## Session 2026-08-16 night (Fable, same session) — §S10 ROOT CAUSE: live ran on corrupted Terminal_meta.db transforms; PATCHED (#1412)
§DB_SPLIT_DETECT redirects live to meta/geo pairs; Terminal_meta had 2,074 per-element-corrupted
transforms (walls 11.3m off) — capped every engine fix on screen. Self-heal patch ships the repair;
live-verified: groundwork n=233 both recipes, first-5-days = piles→plate→grade beams→columns,
§LAYER_BUILDUP 0/12. LTU same corruption ×16 worse (33,528 rows, 291m) — HELD for pair regeneration.
Hospital/Clinic pairs clean. Trail: prompts/4D_GANTT_TM_REFACTOR.md §S10_RESULTS.

## Session 2026-08-16 late (Fable, same session) — §S9 GROUNDWORK_SLAB shipped (#1410); §S10 live-parity gap MEASURED
Ground plate + grade beams now classify Substructure (fixpoint, datum-invariant): Terminal frame
beams <2d 16→0 engine-side, early window = piles→plate→columns→frame. Fleet 0/7 all hard gates.
⛔ HEADLINE: live viewer schedules a DIFFERENT element set than the probes (29/233 reclass live;
125 slab classification deltas, different z-frame) — §S10 in 4D_GANTT_TM_REFACTOR.md is the
prerequisite lane; explains bakes still showing old symptoms (user's Clinic report incl).

## Session 2026-08-16 evening (Fable) — 4D Gantt lane S6+S7 SHIPPED (bim-ootb #1406, #1408): stack hell + editor corruption fixed
S6 §S6_CREW_PASS: crew-aware CPM forward pass — §CREW_FEASIBILITY 6/7 buildings violating → 0/7;
Terminal roof 10,950 elements 0.5d→11.1d spread; stagger big-task-thin-bars 4→0 (Terminal), 8→0
(Hospital); live v1049/gantt-v31 verified. S7 §S7_OUTLIER_DELTA: drag collapsed 437 + INVERTED 217
outlier ops per gesture → 0/0, sw v1051. S8 parked (user ruling). Full trail:
`prompts/4D_GANTT_TM_REFACTOR.md` §S6_RESULTS/§S7_RESULTS.

## Session 2026-08-16 (Sonnet) — Alt+S/photo lane's 3 OPEN TASKS all CLOSED: bim-ootb PRs #1391/#1393 merged
§ALTS_MEM_HOG: real Alt+S exit only hid the photo-prop tree (~30 lights, skyline meshes, sparkle
sprites), never disposed it — 42 leftover scene objects + textures/geometries/programs never back
to baseline. Fixed (`_disposePhotoProps()` on real exit); verified flat across 2 repeat cycles
(PR #1391). §GROUND_RECT_ARTIFACT: user called false alarm before attribution finished; redirected
to §GROUND_EARTH_DEFAULT — Alt+S/Alt+C bake ground texture 'paved'→'earth', Shadow-cycle reordered
to lead with 'earth' (PR #1393). LTU Alt+C bbox fence: witnessed live on a real plan build —
`§CINEMA_BBOX_FENCE excluded=13/9712` fires, no saved/authored path, dive settles just above real
floor (not the pre-fix -24 dive) — no code change needed. Full trail: `prompts/PHOTOREAL_STILL_RENDER.md`.

## Session 2026-08-16 (Sonnet dispatch) — Gantt-shape refactor S1-S5 CLOSED: bim-ootb PRs #1401-#1405, floating 0/7 held throughout, S2 Terminal bar-shape ⛔ open question + S4 10s target not reached (both reported, not silently dropped) — full evidence in `prompts/4D_GANTT_TM_REFACTOR.md`.

## Session 2026-08-16 (Fable, continued) — Gantt-shape refactor SPEC'D OUT: prompts/4D_GANTT_TM_REFACTOR.md
User (Terminal preview): "still not uniform layer by layer… not properly staggered… many stacked up
equi-shaped." Measured via new headless stagger probe (bim-ootb PR #1400, scripts/probe_gantt_stagger.js):
49/72 Terminal tasks = identical 1-2-day bars at day 149-150 (Superstructure_05: 10,355 elems/1 day);
cause 1 = E4 chains 22 non-stacked federated pseudo-levels (Kedai gates the main hall), cause 2 = bars
are non-straggler slivers on wall-carried buildings (14,129 stragglers = the mass). Verdict REFACTOR
not rewrite (floating-0 engine + one-truth locked); full spec with M1 (3m-band E4), M2 (Tukey robust-
envelope bars), M3 (layer-by-layer as monotone band-median metric), M4 (activation ≤10s), staged
S0-S5 with numeric bars + Sonnet dispatch rules → `prompts/4D_GANTT_TM_REFACTOR.md`. S0 done (#1400).

## Session 2026-08-16 (Fable, continued) — §ZONE_WINDOW_DAGWINS_CLIP: readable bars + epoch fix (bim-ootb PR #1399)
User post-#1398: "mem eats, hangs a bit, schedule looks gibberish." Reproduced headlessly (Hospital):
all 35 task bars full-project-width — min/max windows smeared by 11,215 dag-wins stragglers. Fixed:
straggler times clamped into group envelope for WINDOW AUTHORING only (ops keep physics truth,
stragglers ride outside bars — §TIER_DAG_WINS counted-never-hidden); §CAP_RESCALE_SKIP (display-
authored windows never re-spaced — gap-clamp made 4,712 violations, rigid shift 537, both measured+
rejected); §CPM_DISPLAY_EPOCH reuse rigid-shift (uncovered ops were landing in 1970 —
epochShiftDays=20672.7 live). Live cascade now Substructure Aug16-18→Super Aug17-23→Arch Aug22-Oct17.
Fleet probe 7/7, gate_4d 7/7, W-ZDA 16/16, W-MZ 39/39. Cache v29/sw v1047. ⛔ named not fixed:
20s TM activation (7.2s kernel_ops write loop, double generative run), +~390MB heap during it.
Full trail: `prompts/4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` §ZONE_WINDOW_DAGWINS_CLIP.

## Session 2026-08-16 (Fable, continued) — §CPM_DISPLAY SHIPPED: live viewer floating 0/48,428 (bim-ootb PR #1398)
User previewed Terminal, still saw danglings (shipped pipeline's §CJP floating=259 live), ruled
"resolve till zero" + "gantt needle is the truth". Stage-4 step 1 wired CPM into the watched path:
one shared `_displayTimeline` for both consumers, §CPM_DISPLAY_ONE_TRUTH one-shot reuse (killed a
THIRD two-schedules instance: two element recipes, 151d vs 121d makespans), §ZONE_ENVELOPE_DAYS
floor/ceil windows, §CAP_RESCALE_IDENTITY affine-not-respace (the rescale alone manufactured 4,712
violations from a 0-floating input — measured). Verified: node probe 0/7 buildings final floating;
LIVE headless Terminal §CROSSTASK floating=0/48,428 (was 259); gate_4d 7/7; W-ZDA 16/16 (+W-ZDA-6);
W-MZ 39/39. `?cpm4d=0` reverts. Cache v28/sw v1046. Retirement steps 2-5 still propose-first.
Full trail: `prompts/4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` §CPM_DISPLAY.

## Session 2026-08-16 (Fable) — §CPM_SPEC stages 1-3 BUILT+MEASURED: fleet floating 0/7 (bim-ootb PR #1396)
The redesign session `4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` called for. Spec-first (§CPM_SPEC
appended), then side-by-side `viewer/cpm_schedule.js` + `scripts/probe_cpm_schedule.js` — one
dependency DAG (support/host/discipline/storey edges + crew lower bound), one Kahn pass over the
SCC condensation. §CPM_STRAGGLER_MEMBERSHIP (dag-wins stragglers never feed gate milestones) makes
hammock cycles impossible by construction — measured cycleDrops 0 on all 7. **Floating 0 on ALL 7
buildings incl. 0 structural** (raw 21–1,401 each; shipped pipeline's residual 133 fleet-wide);
§CPM_GATE_CHECK 0; §CPM_PARITY exact; storey order improves-or-matches RAW everywhere (JKR 9→2,
Terminal 7→3, LTU 10→4, Hospital 1→0), residuals decomposed to federated storey-ladders (no
federation column in extracted DBs — named data limit) + straggler medians. Terminal wall-clock
387ms vs 1,467ms for ONE `_tierAuditRegate` call. Stage 4 (retiring the 11 passes) PROPOSED only —
§STAGE4_RETIREMENT_PROPOSAL, wire-in order + open question (zone authoring seam) written. Full
trail: `prompts/4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` §CPM_STAGE13_RESULTS.

## Session 2026-08-16 — §STOREY_ORDER_REPORT chase: thread 2 SHIPPED (bim-ootb#1395), thread 1 rejected
Two-thread session on `prompts/4D_SCHEDULE_PERFECTION.md`'s handoff. **Thread 1 (storey-by-storey
build order):** root-caused to `_twoTierRemap`'s `_tier1Serialize` uniform per-zone shift; a
precedented per-element-clamp fix (mirroring `§TIER2_PER_ELEMENT_CLAMP`) was built, measured fleet-wide,
and REJECTED — floating regressed +81% on 3/4 buildings tested for a partial storey-order win. Reverted,
nothing shipped, next lever named (a third mechanism, not yet found). **Thread 2 (remaining 265
floating):** new `§CJP_DECOMP_EXP8` probe instrumentation found 90% of Clinic's residual (the "+31
anomaly") was sub-day rounding noise against `_cjpJudgeParity`'s zero-tolerance window-edge check.
Fixed with a 1-day tolerance bounded to the window's own rounding quantum — MEASURED fleet-wide, zero
regressions: floating 265→133 (-49.8%), Duplex+HHS closed to 0, Clinic's anomaly resolved (91→9).
Witness updated (30/30+20/20 pass). Shipped bim-ootb PR #1395 (merged). Next lever: per-task minimal
end-nudge on the now-cleaner 133 (genuine undersized-window population, Hospital's Superstructure-per-
level the clear example) — NOT the rejected EXP5a global fixpoint, one bounded pass, measured. Full
trail: `prompts/4D_SCHEDULE_PERFECTION.md` §TIER1_PER_ELEMENT_CLAMP EXP + §CJP_DAY_ROUNDING_TOL.

## Session 2026-08-15 (continued) — §VIEWER_MEMORY_LEAK reopened → narrowed, render pipeline cleared
Reopened after a live 83%-system-memory event mid-Hospital-bake (tab killed before a reading could be
taken). Full static code trace of the entire MaxQ per-frame lifecycle (`cinema_maxq.js` frame loop,
`effects.js` staging/AO/triplanar/night-lights start+teardown, `scene.js` updateSky/PMREM) — every
allocation either fires once per bake behind a correct guard, is memoized+disposed properly, or is
dead-code no-op (`_setTriplanarActive` does nothing now). Confirmed empirically on the real target
building at the real incident's config: Hospital, night lights raised to 198-200, 2 completed bake
frames — `renderer.info.memory` dead flat throughout (793s). **Verdict: not a rendering-pipeline
leak.** Narrows the open question to why memory pressure builds despite flat tracked GPU counters —
named IndexedDB frame-blob accumulation (nothing frees captured-frame blobs until the whole bake
finishes) as the concrete next lead, not yet measured. bim-compiler `b6c4bb391`. Full trail:
`prompts/VIEWER_MEMORY_LEAK.md`.

## Session 2026-08-15 (continued) — §OG_HANG_UNBOUND SHIPPED, bim-ootb PR #1382
The still-open `_ogSupportSweep` hang-reach-cap decision was made and closed directly (user: "I only
direct" / "you know the issues") — unbounded, matching `hangGate`/`_contactGraph`, since the real risk
a distance cap stood in for is already caught by the Gantt-window-bound guard (PR #1376). Built as a
proper two-tier structure (tight direct-mount band, then unbounded nearest-plane fallback) mirroring
`hangGate`'s own proven shape. Measured all 7 buildings: floating 3244→3090 (-154, -4.7%), window
fidelity byte-identical everywhere — zero cost, real gain, confirms the design reasoning exactly. Full
witness suite clean. Full 3-way carrier-code merge NOT attempted this pass — on direct reading,
`hangGate` is a closure embedded in the generative engine's single-pass loop, structurally bigger than
the derisk study estimated; this PR closed the actual bug without forcing that. Full trail:
`prompts/4D_SCHEDULE_PERFECTION.md` §OG_HANG_UNBOUND.

## Session 2026-08-15 (continued) — §MEP_PROXY_PHASE_RECLASS built+measured, NOT SHIPPED
Built the fix named in §FLOATING_TIMING_ROOT_CAUSE: one new `rates.js`/`sequence_rules.json` name
override moving MEP-named `IfcBuildingElementProxy` (boilers/valves/dampers/etc) off the early
Architecture slot onto MEP Rough-in, matching their correctly-typed siblings. Pattern measured clean
before writing (caught+fixed one false positive: bare "panel" matched 39 bathroom stall partitions).
**But the real, full-pipeline result (not just the raw generative schedule) is net +28 WORSE across 7
buildings** (Hospital +17, LTU_AHouse +12, both the largest) — moving ~2,600 elements into Hospital's
MEP Rough-in zone disturbed OTHER, previously-correct real MEP elements sharing that zone/window (new
floating: Valve 0→8, PipeFitting 0→15, DuctSegment 0→2), outweighing the targeted population's own
real improvement (proxy 44→29). Third time this session a single-layer fix (radius, rescale,
now classification) produced a different result once measured through the whole pipeline — confirms
the problem is structural (zone/window/repair architecture), not any one lever. NOT shipped — kept in
`/tmp/wt-mep-reclass` (uncommitted) as a starting point. Full trail:
`prompts/4D_SCHEDULE_PERFECTION.md` §MEP_PROXY_PHASE_RECLASS.

## Session 2026-08-15 (continued) — §FLOATING_TIMING_ROOT_CAUSE: biggest lever found, not shipped
User: "MEP in the gantt chart schedule is quite late, thus it does not arise when ARCH/STR is way
advancing" — checked directly, user half right. Real MEP genuinely starts late (day 164-287) as
expected. But the specific floating equipment (boilers/valves/etc) isn't on that track — it's tagged
as a generic catch-all class and defaults to the SAME early slot as walls/doors (day 116). 56% of that
catch-all population on Hospital (3,197/5,729) is real MEP wearing the wrong early time slot; **85%
(712/834) of Hospital's still-floating equipment is exactly this mistagged population.** Fix named, not
shipped: one more name-based reclassify entry in `viewer/rates.js` (same proven mechanism as 3 already-
shipped entries there) — bigger than any repair-layer patch shipped today, fixes the scheduling at the
source. Not yet measured on other 6 buildings, not implemented (Spec-First — read-only this pass). Full
trail: `prompts/4D_SCHEDULE_PERFECTION.md` §FLOATING_TIMING_ROOT_CAUSE.

## Session 2026-08-15 (continued) — §MIDAIR_REPAIR_CONTACTGRAPH_DEDUP SHIPPED, bim-ootb PR #1378
Zero-risk step (a) from §CARRIER_DEDUP_DERISK_STUDY: `_midairRepair` had a byte-identical inlined
duplicate of `_contactGraph`'s scan logic — replaced with a direct call. Verified byte-identical across
all 7 buildings (`witness_midair_zero.js` 38/38, every field unchanged except wall-clock timing).
`witness_og_guard_bearing_bound.js` 9/9, `witness_gantt_og_grid_perf.js` 3/3, `gate_4d.sh` pass=7/
fail=0. No cache-version bump (internal-only change).

## Session 2026-08-15 (continued) — §CARRIER_DEDUP_DERISK_STUDY: candidate #3 confirmed real work
User: "#3, can we study further to derisk it?" Found a 4th copy (`_midairRepair` has a byte-identical
inline duplicate of `_contactGraph` — 100% accidental, zero-risk, ship alone first). The real 3-way
divergence (`hangGate`/`_contactGraph`/`_ogSupportSweep`) is bigger than the known hang-band number:
3 different predicate SHAPES, `hangGate`'s own "0.5-9.5m" fallback is actually UNBOUNDED (today's
§OG_HANG_BAND fix didn't match it, it introduced a 4th new capped behavior), and eligibility is
inverted (hangGate=BIG-only, _ogSupportSweep=no restriction). **Verdict: naive one-behavior merge
confirmed unsafe, same risk class as candidate #2** — real correctness decisions on 2 axes hide inside
it. A parameterized refactor (3 explicit configs, each verified against its own baseline) stays
low-risk but is real work. Recommend: ship the zero-risk `_midairRepair` dedup alone first; the
parameterized 3-way refactor needs one open question settled by the user first (should
`_ogSupportSweep`'s hang reach be capped at all, given `hangGate`'s own fallback isn't?). Full study:
`prompts/4D_SCHEDULE_PERFECTION.md` §CARRIER_DEDUP_DERISK_STUDY.

## Session 2026-08-15 (continued) — §CPM_GENERATOR_UPSTREAM_SPEC, scoping only, awaiting user go
User: "why not fix it to sustain any constraints expected in general of a gantt schedule?" — i.e. why
patch the display/repair layer instead of the generator. Root cause traced: `computeSchedule` is
already a real, compliant CPM engine (real support-DAG + real labor-rate pacing) — compliance is lost
in two LATER steps that discard its output: `deriveZones` groups elements into tasks by
`(phase, storey)` only (throws away the finer trade-precedence structure, the real source of Q2's
clustering), and §GANTT_TASK_WINDOW_FIDELITY's rescale repositions each task independently with zero
cross-task awareness (scrambles the generator's already-correct ordering, which `_ogSupportSweep` then
has to repair). New finding: `_ogSupportSweep`/`_contactGraph`/`hangGate` are 3 independent
reimplementations of "what is my real carrier" — already measurably drifted once (`hangGate`'s
0.5–9.5m band shipped 2026-08-11, `_ogSupportSweep`'s copy was still 0.5m until today). 24 files
reference this area (blast radius). Recommended: dedupe the 3 carrier copies first (proven pattern,
PR #1374), then fix the rescale's per-task independence. A 3rd candidate (regroup tasks by real
precedence) resembles an already-rejected lever — flagged, not assumed OK. Full spec:
`prompts/4D_SCHEDULE_PERFECTION.md` §CPM_GENERATOR_UPSTREAM_SPEC.

## Session 2026-08-15 (continued) — §GANTT_WINDOW_FIDELITY_AND_SPREAD: real regression found+fixed
User: "correlating exactly to TM Gantt timeline? spread evenly within each bar?" Q1: re-measured
§OG_HANG_BAND (#1375) per building (not just Hospital) — clean on 5/7, but real on LTU_AHouse
(window violations 16→526, overshoot up to **79.1 days**) and Duplex (52→199, sub-day). Root cause:
`_ogSupportSweep` had no task-window awareness at all. **Fixed, bim-ootb PR #1376, MERGED**: the
hang-repair (not bearing) now refuses a push that would exit the target's own Gantt task window —
element stays honestly floating instead. Measured all 7: +117 floating (3063→3180, +3.8%) for max
overshoot everywhere dropping to ≤0.78d (was up to 79d). `_GANTT_CACHE_VERSION` 22→23. Q2: traced
"not spread evenly" to one exact mechanism (Hospital TASK_Architecture_Level_4: 4350 elements split
1571@day0-12 / 0@day13-132 / 2779@day133-135) — `phaseTrade[storey][seq]` cross-discipline trade
gate in `schedule_gate.js`, confirmed DELIBERATE documented design (§4D_BAND_MONOTONIC header), not
a bug — ruled OUT as a fix target, not attempted. Likely same root as the already-named
`§TIER2_AFTER_TIER1` dead-air item, now much more precisely characterized. Full trail:
`prompts/4D_SCHEDULE_PERFECTION.md` §GANTT_WINDOW_FIDELITY_AND_SPREAD.

## Session 2026-08-15 (continued) — §GANTT_GAP_CLAMP_SPREAD SHIPPED, bim-ootb PR #1377, MERGED
User: "It is a simple spread it evenly" → "divide by it or shrink to it" → "trace to source, refactor
if need be." 3 levers tried+rejected with numbers first (pure rank spread, multiplicative restretch —
both broke real dependency margins ~same as the two earlier repair-layer dead ends). Shipped: clamp
only gaps >500x a task's OWN median real gap, redistribute removed slack as an additive (never
shrinking) pad — reduces to the identity when nothing needs clamping. Measured all 7: Hospital's
reported task (120-day dead gap) now near-uniform; 4/7 buildings byte-identical window fidelity, JKR
improved both axes, LTU traded a small fidelity cost (99.98%→99.94%) for a large spread gain, Terminal
unchanged fidelity but worse spread shape (named, not chased further — needs a local not task-wide
outlier detector). `_GANTT_CACHE_VERSION` 23→24. Full trail: `prompts/4D_SCHEDULE_PERFECTION.md`
§GANTT_GAP_CLAMP_SPREAD.

## Session 2026-08-15 (session close) — 4 real bugs shipped, 1 real gap named+bounded, not solved
bim-ootb PRs #1364 (`_cap` shadowing crash), #1365 (revert #1364's scale-mismatched bolt-on),
#1368 (§GANTT_TASK_WINDOW_FIDELITY — elements now placed within their own Gantt task's authored
window, not a global rescale), #1372 (§XRAY_STAGING_REMOVED — nothing shows before its support
finishes, ghosted or solid). All verified via real fresh-browser probes, not screenshots.
**§OG_HANG_BAND — FOUND, FIXED, SHIPPED (bim-ootb PR #1375):** the 1510-float root cause was
`_ogSupportSweep`'s hang-repair reusing the 0.5m bearing tolerance as its search radius, far tighter
than what the judge already accepts as real (measured real gaps: p50=2.00m, 812/821 within 9.5m —
reused the already-cited `§HANG_NEAREST` band, not a new guess). Widened to 9.5m. All 7 buildings:
4339→3063 floating (-29%), Hospital 1581→611 (-61%), proxy class 1012→55 (-95%). The earlier
"reclassify IfcBuildingElementProxy's phase" hypothesis (previous entry below) was checked against
real geometry and DISPROVEN first (only 9/5729 touch MEP-only carriers). A 3rd repair-layer lever
(fixpoint repair before window computation) was also tried and ruled out (1581→2406, worse).
Residual 3063 named, dominant class now `IfcFooting` (unmoved, different relation, unexplored).
`_GANTT_CACHE_VERSION` 21→22, `sw.js` v1031→v1032. Full trail: `prompts/4D_SCHEDULE_PERFECTION.md`
§OG_HANG_BAND.
**Scoped then SHIPPED** (2026-08-15): `prompts/4D_SCHEDULE_PERFECTION.md` §TIME_MACHINE_CONSOLIDATION_SPEC
scoped the 9,016-line file (158 commits, 7 separable concerns). §SCHEDULE_CLASSIFY_DEDUP implemented
the recommended first step — bim-ootb PR #1374 (OPEN): collapsed `time_machine.js`'s 2 duplicate
`matchRule`/`matchNameOverride` closures into one shared pair delegating to `schedule_author.js`'s
canonical, already-exported versions. Narrower than the spec's literal "new file, ~150-250 lines"
ask — `assignStoreyByZ`/`getInstallSecs` turned out NOT to be real 3-way duplicates on closer read
(already shared/delegating) — so zero edits to `schedule_author.js`, no conflict surface against the
parallel floating-MEP PR. Verified zero behavior change: `witness_class_fallback_blackbox.js`
rewritten, 321,509 elements/8 buildings/0 disagreements; 5 other slice-based witnesses updated,
numbers byte-identical to `main`; `scripts/gate_4d.sh` pass=7 fail=0. Full concern-based split
(LARGE, 17+ files) still deferred until this file's churn settles.

## Session 2026-08-15 (continued) — §HOSPITAL_LIGHTING_STILL_FLOATING FOUND+FIXED+SHIPPED, bim-ootb PR #1364
Real root cause, not the ones chased below: `injectGantt()` had a `var _cap` name collision — a
crew-demand loop's local number silently clobbered the captured-native-schedule descriptor object of
the same name, crashing that overlay's application on EVERY run (caught+swallowed by injectGantt's
own `.catch`, confirmed live in the user's own v1029 production console, same crash signature).
Fixing it exposed a second real gap: `_ogSupportSweep` (the captured path's own repair) has a
narrower carrier pool than `_contactGraph`'s (#1338-broadened) — 11/1523 lighting/electrical elements
floated the FIRST time that path ever actually ran. Closed by running `_midairRepair` as a final pass
after it. Re-measured 0/1523 floating, real fresh-browser probe, twice. `_GANTT_CACHE_VERSION` 19→20.
Full trail: `prompts/4D_SCHEDULE_PERFECTION.md` §HOSPITAL_LIGHTING_STILL_FLOATING.

## Session 2026-08-15 — Gantt/canvas desync + Gantt self-heal SHIPPED; Hospital lighting still floats, unexplained
Chased "Gantt Chart not followed" (user's own smoking-gun read of a live mp4) to two real, separate
bugs, both fixed+merged: **#1355 §GANTT_SHIFT_HOURS_DESYNC** (Gantt bars authored at 8h/day while
canvas plays 24h/day, measured 2.93x gap, matches the ratio exactly) + **#1359 §GANTT_SCHEDULE_STALE**
(the authored Gantt had no version-based self-heal at all, unlike kernel_ops — `schedules.gen_version`
now mirrors `_GANTT_CACHE_VERSION`, 6 safety cases verified incl. baselined/captured schedules never
touched). Also found+fixed the local `~/bim-ootb` checkout was 75 commits stale (sw.js v939 vs v1029)
— resynced. Full trail: `prompts/4D_SCHEDULE_PERFECTION.md` §GANTT_SHIFT_HOURS_DESYNC/§GANTT_SCHEDULE_
STALE/§HOSPITAL_LIGHTING_STILL_FLOATING.
- **⛔ OPEN, real bake evidence, all obvious causes ruled out with hard numbers:** post-fix, a live
  MaxQ bake on Hospital still shows ~100+ lighting/electrical fixtures floating. Measured directly:
  schedule math is provably correct for this whole class (1522/1523 zero violations), render path
  is a clean pass-through (no separate bug), pace/staleness/topout all fixed. Next session: check
  whether the LIVE session's own `kernel_ops` is stale (`§KERNEL_OPS_SCHED_VERSION stale` in console)
  before chasing anything new — if fresh, pull the exact floating GUID and diff element-by-element.

## Session 2026-08-14 — HHS stair root-caused + fixed, closing perf/dead-code pass, both SHIPPED+MERGED
Continuation of 2026-08-13's handed-off "3rd level hanging doors" item — chased the stairs half of it
(doors half still open, see below). Two bim-ootb PRs merged, `witness_midair_zero.js` 38/0 and
`witness_tier_serial_display.js` 57/0 clean throughout, full trail in `prompts/4D_SCHEDULE_PERFECTION.md`
SESSION 6-7.
- **#1345 §STAIR_FLIGHT_GRID_VISIBILITY**: root cause one level deeper than 2026-08-13 had it —
  `IfcStairFlight` was never inserted into `schedule_gate.js`'s own support-visibility index
  (`structIdxGrid`/`grid`), so anything resting on a stair flight (a landing, e.g. HHS's Day-50
  report) found zero real support and scheduled unconstrained. Fixed with one narrow predicate
  mirroring the already-shipped `isPromotedSlab` pattern. HHS landing FINAL display gap: -40.85d →
  -0.11d. Two regressions caught and fixed BEFORE shipping (a DAG-cycle explosion from a pool-status
  omission, and a false witness regression from over-widening `auditFloating`) — see the PR/prompts
  file for the full self-correction trail.
- **#1347 chore**: removed a 95-line dead duplicate `_midairRepair` (JS hoisting silently shadowed
  it since 2026-08-12, already named as a known defect, never cleaned up) + de-duplicated a redundant
  `geoGate`/`wallGate` double-scan in `placeNonst`. Both verified byte-identical (witness pass/fail
  counts unchanged).
- **⛔ Named, MEASURED, not fixed — real find, next session's target**: `_tierAuditRegate`'s
  full-array-rescan fixpoint is the dominant cost of the WHOLE 4D generation pipeline on large
  buildings — ~78-90% of Terminal's 19.8s total gen time (9 sweeps × full O(n) rescan each, 85% of
  elements pushed), not element-count-driven (Hospital, more elements, remaps 7x faster). Needs a
  worklist/dirty-queue rewrite + its own equivalence witness — too large for a closing pass. Full
  numbers and concrete next steps in `prompts/4D_SCHEDULE_PERFECTION.md` SESSION 7.
- **⛔ STILL OPEN, not touched this session**: the "hanging doors" half of 2026-08-13's original
  report (only stairs were chased). Also: `_twoTierRemap` isn't support-DAG-aware for stair flights
  (can display flight 2 before flight 1) — papered over by `_midairRepair` for the shipped movie, the
  intermediate stage is still wrong. Both named, not folded into either PR above.

## Session 2026-08-13 — 4D "hanging in mid air": 3 real fixes shipped, 1 elusive item handed off
User: "solve this... you are the expert" → "chase till zero" → "THINGS STILL HANGING IN MID AIR" →
"the 3rd level again.. with the hanging doors." Three bim-ootb PRs merged, all gate_4d.sh clean:
- **#1333 §TIER2_PER_ELEMENT_CLAMP + §SHIFT_HOURS**: killed MEP dead-air (Hospital MEP Final
  occupancy 22%→105.4%) and reverted M1's 8h/day default back to 24h per user ruling — Hospital
  2020d live→369.2d, all 7 buildings shrank 1.7x–5.5x.
- **#1338 §GROUNDED_OVERRIDE_FIX**: found and fixed a pre-existing (not caused by #1333) audit bug —
  `_midairRepair`/`_midairAudit` let "grounded" (nothing below in an element's own tight footprint)
  silently override 1,105 real floating violations across 7 buildings (worst gaps 878.8d LTU_AHouse,
  172.3d Hospital) that `witness_midair_zero`'s "0 floating" had never actually checked.
- Architecture/Superstructure's own low occupancy: crew-scaling tested, ruled out (only ~7% crew
  utilization — not a capacity problem), points at a genuine critical-path effect, not yet traced.
- **⛔ OPEN, handed to next session**: "3rd level hanging doors" (likely HHS) — the shipped door/
  host-wall mechanism checks clean at both 8h and 24h shift, node-side. Full handoff with the exact
  next steps (live bake + render-sync check, not more node-side probing) at the top of
  `prompts/4D_SCHEDULE_PERFECTION.md`. New reusable probe: `scripts/probe_midair_grounded_and_doors.js`.

## Session 2026-08-12 — §MAIN_BUILDING_SHADOW SOLVED after 5 sessions stuck (bim-ootb PR #1302, MERGED)
Main building + rooftop fixtures cast no shadow in a MaxQ bake while skyline props and Time Machine's
Shadow mode both did. Root cause: `shadow.bias` is NORMALISED depth (`shadowCoord.z += shadowBias`
over [0,1] across near..far), so its world-space size is `bias x (far-near)`. `_enablePhotoShadows`
copied `toggleShadow`'s `-0.0005`, but toggleShadow moves the sun to ~150 m (range 609 m = 0.305 m)
while the photo path cannot move it (updateSky/Sky/lensflare read `A.sun.position`, sunDist=5000,
range 19,748 m = 9.874 m). 32.4x. Erases any caster under `casterHeight/sin(elevation)` ~ 8.1 m tall
at the 55 deg film opening — every rooftop fixture and a short building's ground shadow — while the
tall skyline props cleared it. Prior PRs #1293/#1295/#1298/#1299/#1300 all fixed real but different
bugs; none touched the depth comparison. Fix holds the WORLD-space bias (floor 0.305 m, raised to
`texel/tan(lowest arc elevation)` against grazing-sun acne). Paired A/B, only bias changed: 1,665 px
darkened at 55 deg, 12,095 at dusk, 0 brightened either. User confirmed shadows now seen. Also fixed
a stale-`matrixWorld` read that made `§PHOTO_SHADOW_FRUSTUM_COVERAGE` untrustworthy as evidence.
Full record: `prompts/PHOTOREAL_STILL_RENDER.md` §MAIN_BUILDING_SHADOW. Witnesses:
`scripts/witness_shadow_bias_{ab,postfix}.js`. sw.js v991->v992.
Also this session: user manual updated + published (BIMUserGuide "Sun, sky and shadow while the film
records" + Alt+S/Alt+J in the cheat-sheet + What's New entry) via `safe_gh_deploy.sh`, guard PASS
283->283 files, canaries 200, content verified live. And `prompts/PHOTOREAL_STILL_RENDER.md`
§SUN_START_TIME written SPEC-ONLY (fixed 6h film + one start-time setting, default 12:00, range
06:00-12:00 since 6h from any later start ends below the horizon; PHOTO_SUN_ELEVATION_START/_END
become elevationForHour() using TM's existing sine) and §WEATHER_ADVANCED_MODE written SPEC-ONLY (Twinmotion/Lumion parity ask): most machinery already
shipped (fog save/restore, §PHOTO_PUDDLE wet ground, §LAYER2_HDRI swap, §SUN_ARC, staffage) — the gap
is only clouds/precipitation/snow-accumulation/overcast; start at a Phase 1 overcast preset. Includes
the corrected finding that the MaxQ IndexedDB frame store is SCRATCH (deleted at both ends of every
bake) so there is no second-bake speedup today, and the dusk-shadow cosine-law answer (shadows ARE
cast on the roof, drowned by unshadowed fill the staging itself boosts; dusk drama and shadow contrast
are the same dial). NOT STARTED — user closed the session judging current realism good enough.

## Session 2026-08-11 — CPE POV walk "toppled/upside-down" camera FIXED+SHIPPED (bim-ootb PR #1292, MERGED)
User report: walk-mode camera rolls/flips easily, should behave like canvas mouse/finger nav. Root
cause: `cpe_walk.js` used THREE's default Euler `'XYZ'` order — pitch composes around WORLD X after
yaw, so any diagonal mouse move bakes real roll into the camera (OrbitControls never has this; it
uses clamped spherical coords). Fix: `'YXZ'` order (three.js's own PointerLockControls convention,
mathematically roll-free for any yaw/pitch) + fresh-spawn branch now re-levels immediately instead of
only on resume. Built in `/tmp/wt-cpe-walk-rollsnap` (worktree, pruned post-merge), not the shared
dirty checkout. Witness: new `witness_cpe_walk_roll_snap.js` 3/3 PASS, confirmed FAILS 2/3 on pre-fix
code (right.y up to 0.66 — a real regression catch, not a tautology); full regression unaffected
(`witness_cpe_walk_edit.js` 24/24, `witness_cpe_walk_ctrldrag_fix.js` 4/4). sw.js v983→v984. Full
diagnosis + fix record: `prompts/CPE_POV_WALK_PATHING.md` §CPE_WALK_ROLL_SNAP.

## Session 2026-08-11 — Modeller-vs-Revit competitive positioning: clipboard spec written, no code touched
Chat-only strategic session (bim-compiler root; target code is bim-ootb `modeller/` — nothing there edited,
read-only Explore verification only). Chain: why Revit/ArchiCAD don't bind IFC at placement time
(strategic — IFC is a competitor-neutral schema, not their moat) → what a Revit modeller's daily-routine
presets (office template, type catalogs, groups/copy-paste) already solve vs. the grunt work that survives
(project-specific Pset/classification filling, precedent-matched type selection) → recorded as
`prompts/PREFAB_LASSO_MACRO_LIBRARY_DIALOGUE.md` §6 (2026-08-11), extending its existing Revit-positioning
thread rather than forking a new doc. Picked the §4a static clipboard as the one safe-to-build item (pure
addition, no existing code touched) and split it into a real, grounded build spec:
`prompts/MODELLER_CLIPBOARD_COPY_PASTE.md`. An Explore pass against `bim-ootb origin/main` (`9197a09`)
corrected the original design's assumptions: `expandAssembly` doesn't fit a live-selection copy;
`foldInsert` + `arc_editable.js buildSeedOps()`'s non-catalog path does; signed-op-group commit is
`commitGesture` (grid-stretch's own pattern, undo/redo for free), not `commitSeedGroup`; DAG-guided
severance-aware pick needs new code, deferred out of scope. **⛔ BLOCKED: dispatch needs a user go + a check
that no other concurrent session already owns Modeller work** (cross-repo dispatch rule, see
`feedback_diagnose_in_session_fix_in_other_session` memory) — do not dispatch cold, ask first. Pset/
classification-mining track separately flagged, not started: check `DAGCompiler`/`internal/UNMERGED` source
IFCs directly for Pset presence before assuming a new mining pass is needed (user steer, 2026-08-11).

## Session 2026-08-10 — §NOGEO_COMPOSE push-to-zero items 1-3 ✅ SHIPPED+LIVE (bim-ootb #1266/#1267/#1268)
HHS_Office_Federated 41 ghosts→0 and Clinic 43→0 (a 4th affected building the checklist never listed —
found by sweeping the ghost query over EVERY shipped DB, not just JKR; JKR itself is 0). Real
`IfcRelAggregates` pairs only, no computed values; OCI uploads all `§GATE_VERDICT UPLOAD_VERIFIED`;
production `§LIVE_WITNESS PASS composed=41` / `composed=43` on the real GH-Pages viewer + live OCI bytes.
W-NOGEO-COMPOSE is now a committed re-runnable witness (`tests/witness_nogeo_compose.js`, 9/9 PASS
against the project's OWN bundled `sql-wasm.wasm`). Landmine caught pre-upload: `buildings/patches/` and
`viewer/buildings/patches/` are NOT the same file for HHS — uploading the root copy would have deleted
the live `spatial_structure` fix; uploaded the superset. Items 4-5 (extractor root-fix) still OPEN, now
with the storey-aggregate precondition measured safe. Full record + 2 new ⛔ (LTU_AHouse_meta 337 ghosts
= different class, needs a user decision; Modeller has NO compose port, 7 DBs) —
`prompts/4D_SCHEDULE_PERFECTION.md` §NOGEO_COMPOSE (2026-08-10 second-session section).

## Session 2026-08-10 — CPE walk ctrl-drag exit SHIPPED; Viewer prompts audit + 4D consolidation plan (SHIPPED — see 2026-08-15 correction below)
§CPE_WALK_CTRL_DRAG_EXIT (bim-ootb PR #1261, MERGED+LIVE): Ctrl-held-drag during POV walk mode was
exiting walk unexpectedly — OrbitControls stayed live on the same canvas and threw `setPointerCapture`
InvalidStateError under pointer lock; Ctrl+drag's context-menu path forced an unplanned Pointer-Lock
release. Fixed by disabling `A.controls` + suppressing `contextmenu` for the walk-mode duration
(mirrors the existing TM-lock pause/restore pattern). Witnessed 24/24 regression + 4/4 new gates.
Separately: wrote `prompts/VIEWER_PROMPTS_LANE_OVERLAP_AUDIT.md` (survey of all Viewer-space prompt
files for cross-lane file collisions — notes only, no fixes; headline finding was that the survey's
own OPEN/CLOSED status labels were unreliable, 2 of 3 spot-checked were already stale). Then planned
a `time_machine.js` promotion-classifier consolidation + Modeller ghost-compose port (full plan
archived in `prompts/archive/4D_SCHEDULE_PERFECTION_full_history_2026-08-03_to_2026-08-12.md`).
**[CORRECTED 2026-08-15 — this line was stale]: the promotion-classifier dedup shipped**, PR #1272
(2026-08-10) + PR #1347 (`_midairRepair` dead-dup removal), both MERGED. It only ever closed a
duplication/DRY item, never `§TM_GEO_ORDER_CYCLES`. The separate, much bigger 2026-08-15
"consolidate/split 5000+ lines" ask is a different scope and is still open — see that session's line
above (§TIME_MACHINE_CONSOLIDATION_SPEC).

## Session 2026-08-08 — §27 (Viewer perf/crash) chased to ZERO, 2 PRs SHIPPED+MERGED+LIVE
User-priority WORK-TO-ZERO item from `FLY_TOUR_DLOD_SCALE.md` §27 (overrode Watchdog's "stop here").
§26 `_boxIndex` null-deref crash on rapid DLOD-nav `o`/`o` toggle: idempotency-guard fix in
`dlod_nav.js`'s restore-drain, live-witnessed on real GPU (exact field stack trace reproduced
pre-fix, zero crashes post-fix) — bim-ootb PR #1259 MERGED. §BVH_DEFERRED 41-54s stall: user
correctly suspected the just-concluded night-lighting session's own un-merged fix
(`§NIGHT_STILL_BOOST_GATE_FIX`, nav mode silently running ~200 lights instead of 30) — controlled
real-GPU A/B isolated it exactly (buggy+busy interaction never finished within 90s; fixed+busy
finished in 9.8s; light count alone, idle, was cheap either way) — bim-ootb PR #1255 MERGED, no new
code needed. Both confirmed clean in a live field session afterward (`nightLights=30`, clean single
disengage/engage pair on rapid toggle). Full detail: `prompts/Viewer/FLY_TOUR_DLOD_SCALE.md` §28.

## Session 2026-08-07→08 — 4D construction-integrity lane worked to zero, 3 PRs SHIPPED+MERGED+LIVE (v971)
§GEOMETRIC_SUPPORT_ORDER (bim-ootb #1242): placement order = geometry DAG (Kahn), seq demoted to
tiebreak, shifted 8→0, cycles logged, Duplex small-regime covered, sortSeq hack removed as subsumed.
§GANTT_LOCK_INTEGRITY (#1244): 🔓→🔒 refuses on breach, names floaters, Undo clears; witness 19/19
(watchdog-corrected from a 22/22 transcription error). §GANTT_STALE_CACHE (#1257): warm-open double
load killed (live user log RED-reproduced → single-pass). All verified served on GH Pages (minified,
v971). Next named: §TM_GEO_ORDER_CYCLES (Terminal live: 24,353 Kahn leftovers + floating=33 on the
tm-promotion pass — author pass 0/0 same log) + schedule-persistence decision (blocks warm reuse).
Full detail: `prompts/4D_SCHEDULE_PERFECTION.md` (dated 2026-08-07/08 sections).

## Session 2026-08-07→08 — CPE "walk finger mode" LANE CLOSED, 6 PRs shipped+merged, viewer v971 LIVE
Walk-in-POV stick authoring end-to-end: bim-ootb #1243 (walk v1) → #1246 (shoes on B frame) →
#1248 (walk-stretch spawn + trackpad glide + Enter/Space plant) → #1249 (scrub accelerator) →
#1234 (DPR-double, had sat unmerged a day) → #1258 (duplicate-stick guard, same-spot click =
auto-Esc). User-validated live on Terminal 48k ("no lag", replan 118ms). User guide "Walk finger
mode" section + stick@13% screenshot deployed (guard PASS, canaries 200). Full context + open
threads: **`prompts/CPE_POV_WALK_PATHING.md` 🏁 top block** (aim-pin click still disabled, DLOD
flip-storm lever untouched, gamepad/XR lanes = other sessions').

## Session 2026-08-07 — 4D engine upgrade lane, 4 PRs SHIPPED+MERGED (bim-ootb #1236/#1237/#1239/#1240)
§DEQ_V1 (zero floating all classes, bearing+hang) · §GANTT_SINGLE_LOAD (cold open one pass) ·
§4D_LAYER_TRUTH (staged 284→0, no-geometry parked) · §GANTT_RETIME_RESYNC (edit blackout fixed).
Full detail + witness numbers: `prompts/4D_SCHEDULE_PERFECTION.md` (dated 2026-08-07 sections).
Next: GH Pages deploy pipeline to pick up main; Hospital hanging-beams still needs fresh evidence.

## Session 2026-08-06 — Room-pathing: §SPINE-BRIDGE-CLUSTER + §REVISIT_FORCED, both SHIPPED+MERGED
Continued from `prompts/Viewer/FindRooms/RESUME_ROOMPATH_DETOUR_BACKTRACK.md` (now fully CLOSED,
all 4 items resolved). Root-caused LTU_AHouse's `V1R1→V4R1` NO_PATH: `§ROOM-SPINE-BRIDGE` only
bridged zero-degree rooms, so a 2-room door-pair island (degree 1, no route to the corridor) was
never even attempted. Fixed by bridging per connected-component instead of per-node degree — bim-ootb
PR #1200, `origin/main` @ `5a68932`. Fleet POC gate: 6 such components/12 rooms, all on LTU_AHouse,
zero elsewhere (Hospital/Clinic/Terminal/JKR/HHS/TermRooms). Regression: 89,627 existing room pairs
0 lost/0 changed, 3,500 newly connected (LTU only).

Second, unrelated finding while closing the length-guard UX question (`§NOREVISIT-LENGTH-GUARD`,
kept as-is by user decision): the revisit-guard's "no alternative exists at all" outcome logged
nothing, indistinguishable from a clean detour. One-line log-only fix (`§PATH_LEGAL_DETOUR_REVISIT_
FORCED`), behavior-unchanged by construction, spot-verified byte-identical route — bim-ootb PR
#1210, `origin/main` @ `8574e51`. Real occurrence: 437 fleet-wide (318 LTU, 119 Clinic).
Full detail: `prompts/Modeller/DISC_Walker/OCCUPANT_PATHFINDER.md §SPINE-BRIDGE-CLUSTER` +
`§PATH_LEGAL_DETOUR_REVISIT_FORCED`. Nothing left open in the resume doc.

## Session 2026-08-05 — §CLASS_UNMATCHED_INHERITED (schema-exhaustive tier-2 fallback) SHIPPED
Watchdog/reviewer session, continued from `RESUME_SESSION_2026-08-05_WATCHDOG.md`. Verified+landed the
dev session's §CLASS_UNMATCHED_FALLBACK fix (bim-ootb PR #1186, #1187 — real IFC4 hierarchy, not
guessed; witness confirmed 3→0 then 5→0 unmatched classes across 7 buildings). Then spec'd+built the
schema-exhaustive follow-on: `prompts/BUILDINGSMART_IFC_SCHEMA_CLASSIFICATION.md`, PR bim-ootb#1191
(auto-merge armed, pending CI at session close) — `tools/dump_ifc_schema_hierarchy.py` walks
`ifcopenshell`'s real IFC2X3/IFC4/IFC4X3 schema (1006 classes) into `viewer/rates/
ifc_schema_hierarchy.json`; `matchRule()` (all 3 copies) gets a tier-2 ancestor-walk fallback below
the existing explicit `SEQUENCE_RULES` tier. Ground truth verified against buildingSMART's own raw
`.exp` file, not an AI summary of it (caught+documented a real WebFetch hallucination in the process —
see the spec's §THE WEBFETCH LESSON). Witnessed: `witness_schema_exhaustive_fallback.js` (NEW, P3)
tier1=132/tier2=53/tier3=821, pass=6/fail=0; full named regression 205/205; re-verified after a real
`sw.js` merge conflict against a concurrently-landed PR #1190.

**Follow-on spec'd, not built:** `prompts/CLASSIFICATION_EXACT_LOOKUP_BLINDSPOT.md` — 6 consumers
(`boq_charts.html`'s crew chart, `proj_fold.js`'s ERP push, `variation_order.js`, `export_5d.js`'s
`WORK_PACKAGES`, `schedule_read_4d.js` fallback) do exact `SEQUENCE_RULES[cls]` lookup, never call
`matchRule()`, so they get NEITHER tier 1 substring matching NOR tier 2 — silently miss any
`...Type`-suffixed class or the 58 real occurrence classes still unclassified (named in the parent
spec). Not a regression from today's work — pre-existing, just newly surfaced by the blast-radius check.

**Dev session picked up the follow-on live during this session's closeout**, working directly in
`/tmp/wt-ifc-schema-classification` (same branch as open PR #1191) — left untouched throughout
(watchdog-role, no git ops on another session's in-progress worktree). Per their own P1 update to
`CLASSIFICATION_EXACT_LOOKUP_BLINDSPOT.md`: `classify()` exported from `schedule_author.js`
(pass-through wrapper around `matchRule`'s real tier 1→2→3), new `witness_schema_exhaustive_classify.js`
5/5 pass (byte-identical to `matchRule` across all 1006 classes, tier split pinned 132/53/821), existing
`witness_schema_exhaustive_fallback.js` still 6/6 unchanged. Not yet committed/pushed as of this
session's close. Next session: check PR #1191 merged, then check P1's commit status before starting P2
(wire `boq_charts.html`'s crew chart + `proj_fold.js`'s ERP push through `classify()`).

## Session 2026-08-03 — Offline install doc shipped, docs-publish blocked
`docs/OFFLINE_INSTALL_GUIDE.md` added (Viewer + iDempiere/ERP only, Modeller deliberately excluded —
its mesh.db LFS bug is unrelated), linked from `USER_GUIDE.md`, committed+pushed to
`fable/meshdb-livewire` (`3b0afe3d2`). ⛔ **Live docs-site publish still BLOCKED**: `scripts/safe_gh_deploy.sh`
aborted on a 13-file merge conflict vs `origin/master` (`PROGRESS.md`, `extractIFCtoDB.py`,
several `prompts/*.md`, a witness file) — unrelated to this doc, guard correctly refused to auto-pick a
side. Needs a human merge call before the new page (or any docs change) goes live.

## Current State
**Gate:** `./scripts/run_RosettaStones.sh` — S190 fleet: 116/157 PASS, 4 ALL GREEN (BR,MO,RL,WI). 21 buildings. 9-gate system.
| PFX | EL | GATES | Notes |
|-----|----|-------|-------|
| BR·MO·RL·WI | 33·2791·1·1 | 9/9 | ALL GREEN |
| DX | 1169 | 8/9 | MetadataMissing (IfcOpeningElement) |
| SH | 65 | 8/9 | MetadataMissing (generative MEP) |
| TE | 48428 | 8/10 | C8 mesh diversity, GEO no pairs (federated) |

**Pipeline:** 11 stages. 77 verbs. 7403 products (ERP.db). 4-DB architecture.
▶ **PUSH PAUSE LIFTED (2026-07-17)** — push freely; `CLAUDE.md` §⏸ PUSH PAUSE.

⚠ `~/bim-ootb` main checkout is stale + conflicts on `merge origin/main` (tried+aborted 07-26); its local
commits are NOT unique so nothing is at risk — **never measure from it**, use a fresh `origin/main` worktree.

▶ **Roompath openings-backfill lane CLOSED 2026-08-03** — `prompts/Viewer/FindRooms/
RESUME_FLEET_OPENINGS_BACKFILL.md` §LANE STATE: extractor openings fix permanent, 9/9 DBs
ghost-shaped, §HM v3 two-layer metric is the headline (fleet draw backlog 157 links; buildings
healthy in record). Next session resumes at its NEXT SESSION block. Hospital_3 DB rm'd (user;
backup /tmp/db_bak_2026-08-02/). **Separate detour-backtrack lane also CLOSED 2026-08-06** —
`RESUME_ROOMPATH_DETOUR_BACKTRACK.md`, see session entry above (PR #1178, #1200, #1210 merged).
The BIG room-pathing effort (Clinic 49.3%, axis resweep) below is still open, unaffected by either.

▶ **In-flight work is NOT listed here — read it from git; every hand-written copy has been wrong.**
`gh pr list --state open` · unmerged-no-PR: `for b in $(git for-each-ref --format='%(refname:short)'
refs/heads/); do n=$(git rev-list --count origin/main..$b); [ "$n" -gt 0 ] && echo "$n $b"; done | sort -rn`.
0 commits only-on-this-disk (both repos, re-verified 07-30). Undelivered: `lane/hr-overlay`, `lane/teams-overlay`.

## OPEN — to be assigned to sessions (user dispatches from this list, check before starting cold)
- ▶▶ **4D SUPPORT INVARIANT** — `prompts/GANTT_ACCURACY.md` §ELEMENT_CPM. Ruling 2026-08-02: support
  wins but NOT merged (support 6,778→0, floating 0, but band regresses 29,824→34,595 — band is
  user-confirmed live). Root cause: storey-LABEL ladder wrong in 1,735/81,722 support edges (2.1%), by
  elevation **zero**. 4 engine shapes already measured and rejected — don't retry. NEXT: move BOTH the
  trade gate and the band gate onto the elevation key (band alone isn't enough — trade still keys on
  label, 23,121 elements sit in two groupings, barrier deadlocks). Engine/support-extraction/crew-pool
  built and reusable.
- ▶ **ROOM PATHING** — `prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md`, read `ROOM_PATHING_SUBSTRATE.md` FIRST (new: concept,
  invariants, every failed trial, prior art, §0 index of all 30 lane docs), then resume at §21.44. ⚠ Everything before §21.33 is SUPERSEDED/disproven — don't
  re-derive. Three defects found and fixed 2026-08-02: §PRECARVE (retention 84%/43%→100%/100%), the
  unhosted-void admission (default `W:3.0`), and the door pierce (6*RES→10*RES). **LTU stranded
  107→18/277, unroutable 87.7%→18.4% — beats the room-graph baseline 32.4% AND survives the
  phantom-adjacency cap test (share 104%→20%).** Standing 4-witness gate all green: §T1–T5 (retention
  100%/100%), §O3, §SC3 breaks 11/34→9/14, §CB5 sealed suites 9/23→7/8.
  ⛔ **Clinic still short: 50/186 @ 49.3%.** §21.43/§21.44 (2026-08-02) — resume at **§21.44**, three
  things now SETTLED, do not re-derive: (a) §21.41's doorway-merge **falsified before coding** (it
  separates — 0.0% of >10 m² pockets misclassify — but reaches 1 of 8 far-end groups; §C40c's "41 far
  ends" were 41 records over 8 groups); (b) §21.41's root cause **retracted** — doorway pockets carry
  2–5 door-matched openings each, the graph does not die in them; (c) the `rel_contained_in_space`
  "free win" **retracted, it is circular** — written by our own `compile_rooms.py:1295`, 100% `RM_*`/`≈`
  rows, 1 space per door. This lane still has NO independent oracle. **NEW ROOT CAUSE (§21.43): the
  void carve is TRANSPOSED** — `_rasterizeSpine` max/min-normalises every void long-along-world-x, so
  46% of Clinic's doors and 57% of LTU's are carved 90° wrong (rotation can't correct it: the
  `COALESCE(t.rotation_z,0)` column is selected with no alias, so 0 of 3,167 voids and 0 of 4,979 walls
  ever carry it — harmless only because the fixtures store world AABBs). **The correct fix makes every
  metric worse** (§O3 phantom 20% PASS→94% FAIL, LTU 18.4%→23.0%, Clinic 49.3%→50.4%): the wrong carve
  over-removes wall and that is what was merging pockets, so `W:3.0` and `pierce=10*RES` were both
  swept against a geometric error and 18.4% is not a clean win. NEXT: joint (W, pierce) re-sweep on
  corrected axes — patch kept unapplied at `roompath_diagnostics/patch_21_43_transpose.diff`;
  worker prompt ready at `prompts/Viewer/FindRooms/RESUME_ROOMPATH_AXIS_RESWEEP.md` (Fable-class).
  19 witnesses on bim-ootb `review/roompath-redundancy`, worktree `/tmp/wt-roompath` live/clean/pushed
  — REUSE it. Nothing deployed; engine byte-unchanged. Blocks `datacentre_cabling.md` cable-pathing.
- ▶ **MODELLER** — dispatch from `prompts/MODELLER_MASTER.md` (⚠ landmine found compacting this file
  2026-08-02: that file is NOT on this branch, only on unmerged `fix/lod400-envelope-hardfail` — merge or
  recreate it before dispatching from it). ✅ LIVE-DEFECT CLOSED: Modeller drew bounding-box fallbacks on
  the live site for months (Git-LFS `mesh.db` unresolved on GH Pages, failure hidden behind
  DevTools-filtered `console.warn`) — fixed via per-resident geo files + `_assertRealGeoDb()` guard + sw
  v37→v38, bim-ootb #1090/#1091 merged. Curl-the-served-bytes lesson now standing in `feedback_terse`.
- `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LOD400-ENVELOPE` (PR #56) — done: `rel_material_layer_set`
  edge + P10 gate, witness 8/8. OPEN: §LOD400-LAYERS-REAL (slice the envelope at authored thickness) —
  needs the one-mesh-per-element vs N-sub-instances call first. Old §LODHELL FINDING 1 verdict is
  SUPERSEDED, don't re-cite. ⚠ 2026-08-03 merge with `origin/master` brought in a large parallel batch
  of already-shipped LOD400-layers work (rows 3/4/16-34, PRs #56-#65, `MODELLER_MASTER.md` restored) —
  this bullet is stale against it, needs a re-read+rewrite next session. One gap found merging (anchor
  `elements_meta` rows wrote `building=NULL`) — ✅ FIXED same session, witness 7/7, see WATCHDOG
  CORRECTIONS item 3 in that file.
- `RESUME_HR_BIM_ASSET.md` §07-06c · `RESUME_WORLD_HISTORY_DEDUP_RESTORE.md` §07-06 · `PILL_DRAWER_REORGANIZATION.md` · `OPEN_BUTTON_IFC_BCF_MERGE.md` · `SPARSE_WALL_ROOM_INFERENCE.md` Ph1 · `XRAY_FIXTURE_CLASSIFICATION_FIX.md` · `FUNCTIONAL_SPACE_MGMT_NEXT_SESSION.md`.
- `PHOTOREAL_STILL_RENDER.md` — §MAXQ_OFFLINE_RUNNER 5/5, PR #1015 (viewer untouched; left: agent +
  Shift+Alt+C POST, read its 🧭 PICK-UP BRIEF) · §CINEMA_TURN_SLERP landed #1018 7/7, open: D2 walk-out
  corner whip (19.8°/frame, ungated) · §CINEMA_HALL_CANDIDATE unparked, recheck vs Clinic v3 **207 rooms**
  (not 118) · §MAXQ_SURFACELESS_FRAMEBUFFER **downgraded**. Also `ROOM_LENS_VISUAL_HIGHLIGHT_SPEC.md §25/§14`.
- **Fly-Tour** — `Viewer/FLY_TOUR_CORRIDOR_GRAPH.md`, read its last §-sections, do NOT re-derive (scrubber
  11/11). Next: ⛔ `§SCRUB_PREPARE_STALL` (1.67s, root-caused) · D2/D5/D6/D7 · `§OPENING_BEAT_SEEK_GAP`
  (gate invalid, needs a ratio).
- **`VIEWER_FIND_PANEL_ROOM_ACCURACY.md §14`** log-precision-first MUST land BEFORE live-diagnosing Terminal's "disciplines disappeared".
- ▶ **NEXT: `Viewer/FLY_TOUR_CORRIDOR_GRAPH.md §STAKEHOLDER_STROLL` S4** — glazing metric (windows
  TE 236/HO 131/CL 58/LTU 976; curtain wall HO 178/CL 31) → S5 jerk softener (95th-pct −50%, profile
  FIRST). ⚠ S2 forked `deploy/dev/room_graph.js` from bim-ootb `common/room_graph.js` — needs porting back.
- Small opens: Terminal Aras 03/04 raster refresh (Clinic/Terminal/LTU ship NO raster table — blocks G1) · `docs/userguide-roompath-fixed` no PR · HBA IoT 1/2/0 (CCTV dbl-click, camera-POV fly-to ⛔ needs facing vector, mobile card-stack) `RESUME_HBA_MOBILE_CARD_STACK.md` · `PREFAB_LASSO_MACRO_LIBRARY_DIALOGUE.md` §6 → spec split out as `MODELLER_CLIPBOARD_COPY_PASTE.md`, ⛔ BLOCKED on dispatch go · Kernel op-log T4+T5 BROWSER-GATED `KERNEL_HARDENING_BATCH1_SPEC.md §STATUS` · Modeller onboarding `ARC_GEO_FETCH_SPEC.md §NEXT` item 2 · ⛔ `DV_*_rules.sql` append-only exempt? `CODEBASE_QUALITY_AUDIT_2026-07-02.md §TRIAGE` · Modeller polish: PBR textures (9), SSAO (needs EffectComposer), ARC occupancy drift 99%→92-95% (`project_arc_meshreadpixels_branch_unmerged.md`) · §CPE_ROOM_TITLE_MULTI (`prompts/CINEMA_PATH_EDITOR.md`, specced 07-02 not built) — caption several rooms in view with a level prefix instead of one ray-picked room.
- ▶ **KUL070 datacentre** — `prompts/datacentre_cabling.md` (cabling) / `prompts/IFC_LARGE_PRIVATE_STRESS_TEST.md`
  (ingestion, §KUL009-13). Ingestion CLOSED: the 62,500 "missing" elements were the wasm32 4GB ceiling
  (not the call stack) — 8-way split → 87,333-element DB, 0 orphans. ⚠ §KUL013: `center_*` is the
  placement ORIGIN not the AABB centre (median 11.31 m off) — `disc_walker.routeChains` misuses it, 0.00%
  vs 90.07% precision, needs its own session. Cabling: engineer confirmed all 3 pain points, wants
  auto-routing first. **⛔ NEXT SESSION PRECONDITION: review ROOMS pathing first** — cable pathing
  inherits the same A*/polyline/highlight engine and its unmeasured redundant-path defects (today 8/119
  runs traversable = 6.7%, not the 41% name-resolution figure). Ship F1/F2/F6 first — none need a
  pathing engine.

- ▶ **Parked lane carried over from the master branch (2026-07-29 list):** `prompts/CINEMA_FIND_TO_FILM.md`
  — specced, not started, no code owed. (The other three of that list — §HOVER_NAME, §CPE_ROOM_TITLE,
  §4D_TRUTH TASK 1 — have since shipped; see Archive.)

## Archive — DONE/shipped (one-line pointers only; detail lives in the named prompts file)
- ✅ §CINEMA_TURN_SLERP LANDED (#1018, 7/7) — look-back 180° snap fixed by rotating gaze direction — `PHOTOREAL_STILL_RENDER.md §CINEMA_TURN_SLERP`.
- ✅ R5-A SETTLED (07-26): the sandbox is LOCAL — OCI `sandbox/` frozen; `deploy/dev` on localhost IS the sandbox, DBs from `~/bim-ootb/buildings`. Don't re-open.
- ✅ §LODHELL + Modeller guide + stranded-branch sweep (07-27/28) #1051/#1062/#1065 — `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §START HERE (⛔ 1 user design call left).
- ✅ Alt+C flicker + MaxQ salvage (07-25/26) #1004/#1005/#1011 — `PHOTOREAL_STILL_RENDER.md`.
- ✅ §TOUR_HIGHLIGHT_LANE → ZERO (07-26) #1012-#1014, Terminal 8/92→0/84 — T4/exits is its own track `§G1-EXTERIOR-DOOR-LANE`.
- ✅ §STAKEHOLDER_STROLL S1+S2+S3 (07-26) 28/28, 37/37, 55/55, gate G6 — `FLY_TOUR_CORRIDOR_GRAPH.md` §S1/§S2/§S3 (⚠ landmines there, do not re-derive).
- ✅ Room→Path LIVE (07-25/26) #1006-#1010, Hospital 69.4%→91.2% — `VIEWER_FIND_PANEL_ROOM_ACCURACY.md §17` · ✅ Occupant-pathfinder #997/#998.
- ✅ Blank Viewer landing card + local `.db` Open (07-27/28) #1068/#1070 — `Viewer/BLANK_VIEWER_LANDING_CARD.md`.
  🟢 unresolved, non-blocking (from master): an idempiere-seed-db status message seen at the Viewer,
  source not located; user says pick up only if it resurfaces.
- ✅ §HOVER_NAME (12/12, #1085) · §CPE_ROOM_TITLE (#1089, gap closed #1092, user-confirmed on a real bake 07-30).
- ✅ §4D_FACADE_ORDER (07-31) #1098/#1100, sw v885→v887, user-confirmed — `RESUME_4D_TRUTH_AND_BE_HERE_WHEN.md` §TASK 1 CLOSED.
- ✅ §CACHE_KEY re-download (07-30, #1088) Hospital 251MB refetch per click → 0 network on load B, W-DB-CACHE-KEY 16/16 — `HISTORY_PERSIST_RECALL.md` §VERIFY-FIRST ITEM 1.
- ✅ §SEAM_IDENTITY_AUDIT F2 (07-31) #1106/#1109 — IDB version drift; F1/F3–F18 still open, un-triaged — `SEAM_IDENTITY_AUDIT.md`.
- ✅ O13 guide text (07-31) PR #64 — `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` (⚠ do not re-attempt either screenshot without reading it).
- ✅ 2026-08-02 batch LANDED #1129 `fc58210` — §4D_BAND_MONOTONIC (29,824→0 non-structure inversions), §CPE_DAY_COUNTER, §CPE_GHOST_PULL, room-title dwell/lead; sw v913, gantt cache 7, verified served.
- ✅ 4D ordering CONFIRMED live on a real Hospital bake (07-02) — §CPE_DAY_COUNTER_POS #1130 sw v914, §CPE_GAZE_ACQUIRE #1131 sw v915 (0.90s vs 2.00s cap, bit-identical). `feat/element-cpm` NOT merged — tracked live in OPEN §4D SUPPORT INVARIANT, don't re-open here.
- 🟡 P2P Material Receipt unblocked, signed M_MatchPO (07-23) PR #972 open; M_MatchInv NOT closed — `ERP_P2P_INVOICE_MATCH.md`.
- ⛔ Hospital **missing walls on one side** — unproven hypothesis was the re-fetch race; re-verify on a clean `§CACHE_HIT` now the re-fetch is gone.
- Older DONE: `prompts/archive/PROGRESS_DONE_ARCHIVE_pre_2026-07-23.md` / `_pre_2026-07-17.md` / `_pre_2026-07-05.md` / `_pre_2026-06-14.md`.

## OCI Deployment · Reference
Live: `bim-ootb-live` (landing+viewer+single DBs); viewer CODE is served from **GH Pages**, DBs+patches
from OCI `bim-ootb`. `deploy/dev/` canonical. SOP `deploy/OCI_UPLOAD.md` — **§RULES 6: patches go via
`scripts/oci_patch_gate.js`.** Docs: https://red1oon.github.io/BIMCompiler/ · `internal/OCI_SETUP.md`

