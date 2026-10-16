# ARCHIVED 2026-08-11 — 4D_SCHEDULE_PERFECTION.md big-element-support-coverage sub-lane (CLOSED)
# Retired from prompts/4D_SCHEDULE_PERFECTION.md after Part 1 shipped+merged (bim-ootb PR #1277).
# Full arc kept verbatim for provenance/search: STUDY (diagnosis) → CORRECTION (self-correction after
# deeper verification) → SPEC (the fix) → OPEN QUESTIONS EXTRACTED (real numbers, not guesses) →
# Gap-B DECIDED (design call) → Part 1 SHIPPED (PR #1277, 26/26 witness PASS, zero regressions).
# Two items were lifted forward into the live doc, NOT closed by this archive:
#   - Part 2 (per-bucket rescale redesign, options A/B/C) — still open, user decision pending.
#   - Gap A (`IfcPile` has no SEQUENCE_RULES entry) — still latent, no building models it yet.
# Origin: user asked "is the root cause clear for a Fable agent to resolve?" then "draft the spec",
# then "run those" (the 3 open questions), then "yes you decide that" (Gap B), then dispatched
# implementation to a Fable-model agent — this file is that whole chain, start to shipped PR.

## ▶ STUDY 2026-08-11: why big/tall elements can still read "supported" — architecture
diagnosis, NOT a fix. User's framing, verbatim intent: the small residual counts (floating=8 etc.)
are isolated-outlier noise and explicitly NOT the concern here — the real question is why *large*
elements end up unsupported or start before their real foundation is laid, and whether that's a
patch-over-patch symptom rather than something fixable by chasing another counter to zero. Three
parallel research passes (read-only, origin/main@268a85f, no code touched) traced the four layers
that decide build order, in order:

1. **Initial scheduling — pure class lookup, zero geometry.** `rates.js:160-199` `SEQUENCE_RULES` +
   `schedule_author.js:480` `matchRule` assign every element's phase/sequence by IFC-class substring
   match only. The one per-element geometric override, `_promoteRoofLoadPath` (below), only relabels
   which phase a slab falls in — no layer here derives order from what an element actually sits on.
2. **`_ogSupportGuard`** (`time_machine.js:4357-4406`) — code's own comment (`4212-4221`) calls itself
   a corrective pass run because band overlap was *measured* to create real violations pre-fix
   (Terminal 447, Hospital 1,929). Converges via up to 16 global sweeps over ALL elements (not a
   single local pass — does ripple-resolve chains). But its bearing test is unbounded upward
   (`S.tz >= T.bz - GAP`, no ceiling, `4368-4371`): a multi-storey column registers as "carrying"
   every element above it at every level within its footprint, not just what it structurally touches.
   That inflates the push count — root reading of the witness log's `pushed=34493/48428` (71% of
   Terminal) is less "71% of the building was wrong" and more "layer 1 has ~no relationship to real
   support order, so nearly everything needs correcting."
3. **Support DAG** (`schedule_gate.js`) — the soundest layer: `auditFloating` (`513-548`) requires
   completeness (`se` = max end over *every* qualifying support found, Kahn indeg=0 needs ALL
   resolved), not existence of one. But detection is scoped to two class pools only (struct seq≤4 +
   walls, `308-310`) — anything outside is architecturally invisible: `se===0` (zero pool candidates)
   is silently NOT flagged floating (`545`). PR #1276's `edgeContained` tightening (S must top in E's
   LOWER HALF, not just "below E's top", `315`) fixed real cycles but as a side effect makes it easier
   for a large element whose only detected support was that near-top containment to fall through to
   invisible rather than flagged.
4. **Roof/load-path classifier** (`_promoteRoofLoadPath`, `time_machine.js:3407-3476`) — deliberately
   depth-1 only, by design: comment at `3444-3448` says full recursion was tried and measured to
   collapse ("the whole building becomes 'roof'"). It can never check whether a wall's OWN chain down
   to its foundation is finished before treating it as a valid roof-bearing wall — one hop up, no
   further. The audit meant to catch its false negatives (`§SUPPORT_CHECK`/M6, `4074-4082`) only
   checks elements the classifier ALREADY promoted — a slab it fails to promote reads `floating=0`,
   clean, even if built completely out of real-world order.

**Root cause, not a checklist item:** none of the four layers share a real per-building notion of
"storey" or "foundation complete" — storeys/levels are not rows in `elements_meta` in any shipped DB
(confirmed earlier in this doc, item-4 precondition section). Order is inferred one local pairwise-
geometry pass at a time, with independent patches (guard → DAG → promotion → audit) stitched onto a
class-only initial guess, instead of one dependency graph built once from real bottom-up causality
(foundation → columns → walls → floor → roof, per real storey). That absence is what lets a large/
tall element look resolved under one layer's narrow test while the thing underneath it is still open.
**Explicitly not scoped here:** no fix proposed or attempted — user asked for the "how is this so"
diagnosis first, "further study needed to find out a more elegant holistic solution" before any code
changes. Next session: use this four-layer map as the starting frame rather than re-deriving it.

## ▶ CORRECTION to the STUDY above, same day, before the spec below
Deeper read of `computeSchedule` (`schedule_gate.js:90-...`) shows the STUDY overstated the gap.
`computeSchedule` IS a real generative geometric scheduler — bearing/contained/hang gates,
`§4D_BAND_MONOTONIC` per-storey-per-trade banding (derived from real `base_z` medians per storey,
"THE RANK IS EXTRACTED, NEVER INVENTED" per its own header comment), crew-capacity constraints — and
its own comment calls its output "the schedule layer's proven truth (floating=0)"
(`time_machine.js:4196-4197`). The class-based `rates.js` table does NOT drive raw element ordering;
it only assigns each element to a named task/phase BUCKET for Gantt display. Elements are ordered
WITHIN their bucket by the generative `ls` (computeSchedule start), preserving real support order
(`time_machine.js:4256-4257`, `§4D_LAYER_TRUTH`). What actually breaks CROSS-bucket order is a
separate step: each bucket's generative `[ls,le]` span gets affinely rescaled into its own
class-derived phase window independently of every other bucket (`time_machine.js:4274-4293`) —
losing the relationship between elements in DIFFERENT buckets even though order INSIDE one bucket
survives intact. `_ogSupportGuard` exists specifically to repair that self-inflicted cross-bucket
damage (comment at `4212-4221` says so directly) via a real 16-sweep global fixpoint, not a shallow
patch. Retracting "zero geometry awareness" and "storeys aren't schedulable nodes" as overstated —
`§4D_BAND_MONOTONIC` already derives real per-storey ranks from geometry. Replaced by the narrower,
now-verified defect the spec below targets. Also retracting the unverified "no groundable/foundation
class exists" implication: `IfcFooting`/`IfcPile` ARE in `rates.js` (`phase:'Substructure',
sequence:1`) — foundations are already the deliberate root of the sequence, not a modeled gap.

## ▶ SPEC 2026-08-11: close the two verified coverage seams a big element can fall through
(User: "the 8 hanging items are isolated outliers, ignore them — it's the big things that end up
without support or start too early while the foundation isn't fully laid, examine how this is so."
This spec is the "how, concretely" + a scoped fix — no code written yet, per Spec-First.)

### The real defect: two seam gaps, not a missing DAG
`computeSchedule` + `_ogSupportGuard` together are a real, evolved, geometry-aware pipeline (see
correction above) — not the naive class-only guess the STUDY first described. Verified against
current code, two SPECIFIC places let a large element bypass support checking entirely, both at the
SEAM between two locally-correct, narrow-scoped passes, not inside either pass's own logic:

1. **`auditFloating`'s zero-candidate blind spot** (`schedule_gate.js:513-548`) — an element that
   overlaps no cell in either scoped support pool (struct seq≤4 + walls) reads as NOT floating,
   unconditionally (`se===0` short-circuits before the flag check). A large/aggregate element sitting
   outside both pools' footprints (large MEP/civil run, or any XY position with no wall/struct
   neighbor recorded) schedules with LITERALLY NO support check applied — foundation laid or not,
   nothing ever looked.
2. **`§SUPPORT_CHECK`/M6's promoted-only scope** (`time_machine.js:4074-4082`, self-documented in its
   own comment) — the audit built to catch wall-vs-roof-slab violations only runs on slabs the
   depth-1 load-path classifier ALREADY promoted to roof role. A slab the classifier fails to promote
   — expected behavior, per its own comment at `3444-3448`: full recursion was tried and "the whole
   building becomes roof," so it's deliberately capped at depth 1, meaning false negatives are a known
   cost — is invisible to the one audit built to catch exactly this mistake.

Both are the same shape: a big element falls through the gap BETWEEN two passes, not a bug inside
either. This is the concrete, verified mechanism for "a big thing started before its foundation was
laid, with zero errors or warnings anywhere in the pipeline" — an absence of any check, not a wrong
answer from one.

### Part 1 — close the two seams (small, additive, no architecture change, no dependency on Part 2)
1a. `auditFloating`: when a scoped-pool scan finds zero candidates for an element whose bbox is
    above the size threshold in Open Question 1, emit `§SUPPORT_UNCHECKED guid=.. cls=.. vol=..`
    instead of silently passing. Warn-only at first — do NOT auto-block scheduling (risk of a false
    positive on legitimately-groundless classes, see 1c) — count real occurrences on shipped
    buildings before deciding gate-vs-warn (EXTRACT the real rate, don't guess it).
1b. `§SUPPORT_CHECK`/M6: widen its slab pool from "already seq>4 promoted" to "every `IfcSlab` AND
    every element above the Open-Question-1 size threshold," independent of promotion status. Surfaces
    load-path false negatives directly, without touching the classifier itself.
1c. Exempt list: any element at `phase==='Substructure'` (`seq===1` — `IfcFooting`/`IfcPile`/slab-on-
    grade) is legitimately groundless by definition (rests on unmodeled soil, not another element) —
    auto-exempt from both 1a and the new witness below, never flagged.
1d. New witness `witness_big_element_support_coverage.js`: for every element above the size threshold
    in each shipped building, assert it has ≥1 recorded support candidate OR is Substructure-exempt
    (1c). This is the witness that actually targets "big things without support" directly, instead of
    the existing floating counters which the user already ruled out as the wrong metric.

### Part 2 — phase-window rescale design (bigger, needs a decision before implementing, not started)
The rescale-then-patch design (generative order → independent per-bucket rescale → global guard
repair) works but is convoluted enough to need correcting 71% of Terminal's 48,428 elements on every
run. One known bug either way: `_ogSupportGuard`'s bearing test is unbounded upward
(`time_machine.js:4368-4371`, `S.tz >= T.bz - GAP` has no ceiling) — a tall column reads as "carrying"
everything above it at every level in its footprint, not just what it actually touches. Net effect is
OVER-conservative (delays more than necessary) — the opposite direction from "starts too early" — but
still a real correctness bug worth fixing regardless of which option below is chosen. Three options,
none started, genuinely your call:
  **A. One global rescale instead of one independent rescale per bucket.** Order preserved by
     construction; the guard becomes unnecessary. Cost: per-phase target windows (calendar-editable
     in the Schedule Author wizard, `tasks.schedule_start/finish`) would no longer independently
     control a phase's duration — needs redesigning how a user-edited phase window interacts with one
     global timeline. Highest risk, biggest structural payoff.
  **B. Derive each bucket's allowed window/lag from real cross-bucket generative dependencies**
     (replacing `§PHASE_OVERLAP_BAND`'s storey-count-based lag guess) instead of assigning windows
     independently and patching after. Keeps per-phase editability, removes the GUESS that causes the
     71% correction rate at its source. Medium risk.
  **C. Keep the current three-stage pipeline as intentional; fix only the one verified bug** (bound
     the bearing test to the element's own `top_z + GAP`, not infinity); add Part 1's witnesses.
     Lowest risk, smallest change. Doesn't reduce the 71% correction rate but makes what IS corrected
     verifiably right-sized instead of over-conservative.
Recommendation if asked to default: **C first, unconditionally** — it doesn't foreclose A or B later
and fixes a real bug either way. A/B are a separate decision on top, not a prerequisite.

### Open questions — need EXTRACT before Part 1 can be precisely specced, not invented
1. **Size threshold for "big"** — not measured yet. Before implementing 1a/1b/1d: pull bbox volume
   (or z-span or footprint area — pick whichever correlates best with "structurally significant" once
   measured, don't assume) distribution across Terminal/Hospital/Duplex/HHS/Clinic, use a measured
   percentile (e.g. top 5%) as the cutoff, log the actual number reached — don't hardcode a guess.
2. **Substructure-exempt coverage** — confirm every shipped building actually tags its footings/
   slab-on-grade as `phase==='Substructure'` via the existing class match (rather than, say, an
   `IfcSlab` footing that gets matched to a different generic slab rule first) before relying on 1c
   as the exemption test — a mismatch here would make the new witness noisy with false positives on
   its first real run.
3. **Is `_cap.win[_tid]` (the per-task window Part 2 options A/B would change) user-edited on any LIVE
   building today, or still 100% auto-generated from `rates.js` everywhere?** Determines whether
   Option A's "loses independent per-phase calendar control" cost is real (already relied on) or
   theoretical (feature exists, unused so far) — check the `tasks` table content on a real shipped
   building's DB before treating it as a hard blocker.

**Nothing in this spec has been implemented.** Next session: resolve Open Questions 1-3 (extraction,
not more design), then implement Part 1 (1a-1d) as one self-contained PR with its own witness: the
concrete "big element without support" bug class the user asked about. Part 2 is a separate decision
point — surface options A/B/C, get the call, then implement C at minimum regardless of A/B's outcome.

## ▶ OPEN QUESTIONS 1-3 EXTRACTED, 2026-08-11 (same day) — real numbers, two real gaps found
All three run against real shipped `~/bim-ootb/buildings/*_extracted.db` fixtures (Terminal, Hospital,
Duplex, HHS, Clinic), scripts + full logs in `/tmp/claude-1000/.../scratchpad/`
(`measure_bbox_volume.js` → `q1_volume_distribution.log`, `check_substructure_coverage.js` →
`q2_substructure_coverage.log`, inline node one-off → `q3_tasks_table.log`) — reproducible, not
one-off numbers to trust blind.

**Q1 — size threshold, ANSWERED cleanly.** bbox volume (`bbox_x*bbox_y*bbox_z`) across 135,630 real
elements, 5 buildings: **p95 = 1.556 m³**, **p99 = 11.808 m³**. Sanity-checked: the p95 cutoff's
6,785 "big" elements are a healthy structural mix (IfcWallStandardCase 1565, IfcBeam 1513, IfcSlab
668, IfcColumn 441, IfcFooting 410, IfcWall 394, plus MEP/finishes) — no single outlier class
dominates either cutoff. **Use p95=1.556 m³ for Part 1's threshold** — the p99 list is nearly the
same class mix, just fewer, so p95 gives more real coverage without pulling in noise.

**Q2 — Substructure-exempt coverage, ANSWERED with 2 real gaps, NOT a clean confirmation.** Ran the
real `matchRule` (copied verbatim from `schedule_author.js:17-26`) against every distinct class
actually present in the 5 buildings:
- Only **`IfcFooting`** (`phase=Substructure, seq=1`) is both defined AND actually modeled anywhere.
  `IfcReinforcingBar` is also defined `Substructure` but wasn't present as its own class in any
  shipped `elements_meta` (rebar is likely folded into concrete elements at this LOD).
- **Gap A: `IfcPile` has NO `SEQUENCE_RULES` entry at all** — the `rate:850/EA` line found earlier
  was from a cost table, not the sequence table. If any building ever models `IfcPile` as its own
  class, it would silently fall through to the DEFAULT rule (`Architecture, seq=6`) — structurally
  wrong (a pile is substructure) but currently LATENT, not live: `IfcPile` is absent as a class from
  all 5 shipped buildings today, so nothing is actually misscheduled by this yet.
- **Gap B: Terminal and HHS model ZERO Substructure-phase elements at all** (no `IfcFooting`, nothing
  else qualifies) — 2 of 5 real buildings have NO real content that the Part 1c exemption
  (`phase==='Substructure'`) would ever match. Any element in those two buildings that is genuinely
  groundless (e.g. the lowest slab, resting on unmodeled soil with no footing modeled beneath it) has
  NO exemption path today and would be flagged by the new witness (1d) as a false positive.
  **Part 1c needs a second exemption clause**, not just "is Substructure-phase": something like "is
  the lowest-base_z element in its XY footprint AND its own building has zero real Substructure-phase
  elements at all" — this itself is a new small EXTRACT/measure task (does "lowest in footprint" ever
  wrongly exempt something that DOES have real support just not yet indexed?) before 1c can be
  written safely on Terminal/HHS. Flagging, not solving, here.
- No substring-collision risk found (`IfcWall`/`IfcWallStandardCase` etc. all resolve correctly via
  longest-match) — that half of Q2 is clean.

**Q3 — is `_cap` (the per-task rescale window) live-populated anywhere, ANSWERED cleanly, changes
Part 2's urgency.** `_cap` (`time_machine.js:3460-3486`) only activates if the building's own `tasks`
table has real leaf rows with non-null `schedule_start`/`schedule_finish` — its own comment says so
("If absent/empty/unparseable... `_cap` stays null → generative path runs EXACTLY as before").
Checked all 5 shipped `extracted.db` files directly: **`_cap` is null on every one of them, today.**
Terminal has no `tasks` table at all. Hospital/Duplex/HHS/Clinic have a `tasks` table, but it's the
OLDER schema (`start_date`/`finish_date`/`duration_days` — no `schedule_start`/`schedule_finish`/
`is_summary` columns `_cap`'s query selects) with **0 rows** — `_cap`'s try/catch swallows the column
error and returns null the same as "absent." Also checked `buildings/patches/*.sql` (this project's
runtime-patch mechanism) for any `INSERT INTO tasks`/`schedule_start` — none found. **So today, on
every currently-shipped building, the rescale-then-guard machinery (Part 2's whole subject) never
runs at all — the raw `computeSchedule` generative output is what a fresh user actually sees.** The
71%-correction figure and the pre-fix "Terminal 447 / Hospital 1,929" violation counts must have come
from either a live-authored session (Schedule Author wizard run in-browser, not persisted to these
static fixtures) or the witnesses' own synthetic `_allScheduled` construction (confirmed: that's
exactly what `witness_gantt_refold_yield.js` does — builds `_allScheduled` directly, bypasses `tasks`
entirely) — not something baked into any file on disk today. **Practical effect on Part 2: it is
real, reachable code (a user who runs the Schedule Author wizard or imports a P6/MSP schedule DOES
hit it), but it is not live-active on any of today's shipped default building experiences** — lowers
Part 2's urgency relative to Part 1, which (via `auditFloating`/`§SUPPORT_CHECK`) runs unconditionally
on every building regardless of `_cap` state. Answers Open Question 3 directly: not "user-edited
today" and not "100% auto-generated either" — **not populated at all, on any shipped fixture,
currently.**

### Net effect on next steps
Part 1 is now precisely specced and ready to implement: threshold=1.556 m³ (p95), with 1c's exemption
needing the small additional design named under Gap B above before the witness (1d) can run clean on
Terminal/HHS without false positives — resolve that one sub-point first (it's a design decision, not
another extraction), then implement 1a-1d as one PR. Part 2 stays a real, named, un-started decision
(A/B/C) but is now correctly understood as gated behind schedule-authoring usage, not the default
path — lower priority than Part 1, take up only after Part 1 ships and only if/when authored
schedules are actually in active use on a real building (worth one more EXTRACT check, live browser
session or IndexedDB export, before investing in A/B — not assumed either way).

## ▶ Gap B exemption DECIDED, 2026-08-11 (user: "yes you decide that")
Considered and rejected: a "lowest-`base_z` element in its own XY footprint" fallback exemption for
Terminal/HHS. Rejected because that predicate is computationally the SAME test as "zero support
candidates found" (both reduce to "nothing satisfies `edgeBelow`/contained/carrier below this
element") — using it to auto-exempt would silently suppress exactly the population 1a/1d exist to
surface, on exactly the 2 buildings where a real extraction gap is most likely. An invented geometric
proxy can't distinguish "genuinely rests on unmodeled ground" from "floating due to a real bug,"
because both have the identical signature by construction.

**Decided instead: annotate, don't suppress.** `1c`'s exemption stays exactly `phase==='Substructure'`
(unchanged, correct on Hospital/Duplex/Clinic where footings ARE modeled). Additionally, compute one
new per-building boolean once — `buildingModelsSubstructure` (true iff the building has ≥1 real
element resolving to `phase==='Substructure'` via `matchRule`, same check as Q2's extraction script) —
and attach it to every `§SUPPORT_UNCHECKED` finding (1a) and every witness (1d) result row. This is
metadata only: it changes nothing about whether a finding fires, only how a reviewer should weight it
— a `buildingModelsSubstructure=false` finding on Terminal/HHS is flagged as "this building never
modeled a foundation layer at all, treat with that context" rather than silently hidden or treated as
equally alarming as the same finding on a building that DOES model footings. Consistent with this
project's non-invention discipline: surface the real extracted fact, don't algorithmically guess
around a data gap.

### Part 1 implementation — DISPATCHED 2026-08-11, ~/bim-ootb, branch `feat/big-element-support-coverage`
Full spec above (threshold 1.556 m³, 1a/1b/1c/1d, this Gap-B decision) handed to an implementation
agent (model: Fable 5). Not yet witnessed/merged as of this line — see next session's append for
outcome, or `gh pr list` / `git log` on `~/bim-ootb` for current status if this line is stale.

## ▶ Part 1 SHIPPED 2026-08-11 — PR #1277 MERGED (auto-squash, fast-checks + e2e both SUCCESS)
Implemented exactly as specced above (1a/1b/1c/1d + the Gap-B annotate-don't-suppress decision), by
the dispatched Fable 5 agent, branch `feat/big-element-support-coverage` (worktree pruned post-merge).
Threshold = 1.556 m³ (the measured p95), shipped as `ScheduleGate.BIG_ELEMENT_VOL` (single exported
source of truth — schedule_gate.js constant, time_machine.js reads it). 1a = zero-candidate
(`!hasBearing && !hasHang`) big elements emit `§SUPPORT_UNCHECKED guid/cls/vol/buildingModelsSubstructure`
+ optional collector arg (5th param, additive like collectGuids); floating return byte-identical.
1b = `§ROOF_GATE` gained a THIRD counter pair `bigElems=N lateVsWallCarriers=M` (reported not gated —
the existing roofSlabs gate and otherSlabs measurement untouched; the STUDY's "promoted-only" M6 claim
was already fixed by the earlier role-blind widening, so 1b's real delta was the big-element pool).
1c = `seq===1` (verified ⟺ `phase==='Substructure'`: only IfcFooting/IfcReinforcingBar carry seq 1
in rates/sequence_rules.json, zero name-overrides assign it) — works across ALL auditFloating callers
including `_buildXrayElements` elements, which carry seq but not phase. New summary line
`§SUPPORT_UNCHECKED_SUMMARY n=../.. buildingModelsSubstructure=..` on the live §SUPPORT_CHECK path.

**1d witness (`viewer/tests/witness_big_element_support_coverage.js`) — 26 PASS / 0 FAIL**, run
measure-first then baselines LOCKED (repo convention, cf. floating=8). Real counts, split by
`buildingModelsSubstructure` (bms):
- bms=false (no foundation layer modeled — expected, per Q2): **Terminal 279 unchecked / 1,333 big**
  (IfcSlab:236, IfcBeam:22, IfcDuctSegment:8, IfcColumn:7) · **HHS 21 / 239** (IfcFlowSegment:11, IfcSlab:5)
- bms=true: **Hospital 503 / 4,314** (IfcDuctSegment:139, IfcPlate:83, IfcDuctFitting:60, IfcBeam:48)
  · **Duplex 6 / 49** (IfcSlab:4) · **Clinic 22 / 442** (IfcWallStandardCase:10, IfcFlowSegment:4)
- **Total 831 unchecked / 6,377 big (13%)** — the real occurrence rate the 1a gate-vs-warn decision
  was waiting on. Notable: Terminal's 236 unchecked IfcSlab (near-identical ~2.70 m³ volumes, likely
  one repeated family) and Hospital's MEP-heavy mix suggest the unchecked population is mostly
  large MEP runs + slab families outside both support pools — consistent with the spec's prediction.

**Regressions: zero, logs read not just exit codes** — `witness_tm_geo_order_cycles` 5/5
(cycles=0, floating=8 EXACT, n=48428) · `witness_gantt_lock_integrity` 19/19 (§LI_COST 63,415
elements 764 ms, floating=0; Duplex breach-detect 1→0→1 sequence intact). Logs saved to session
scratchpad (`bigsup_measure.log`, `bigsup_baseline.log`, `regress_tm_geo.log`, `regress_lock.log`).

**Not touched, still open:** Part 2 (per-bucket rescale design — options A/B/C, user decision
pending; C recommended as unconditional first step whenever taken up) and the latent Gap A
(`IfcPile` has no SEQUENCE_RULES entry — absent from all shipped buildings today). Next natural
step if pursued: eyeball a sample of Terminal's 236 unchecked slabs / Hospital's 139 duct segments
to decide whether 1a should ever graduate from warn to gate — decide on these real counts, not
re-guessed ones.
