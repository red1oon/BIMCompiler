# ARCHIVED 2026-08-27 — the superseded §DIAGNOSIS block from `prompts/RESUME_4D_TRUTH_AND_BE_HERE_WHEN.md`
# Moved verbatim, nothing edited, nothing lost. This is NOT a live task list and NOT a resume pointer.
#
# Why this block: it is a diagnosis of Task 1, and **Task 1 is `✅ CLOSED (2026-07-31)`** by that
# file's own final section — user-confirmed live, four fixes shipped as bim-ootb PR #1098 + #1100.
# It is closed TWICE OVER: the very next section, `§STAGE A 2026-07-30` §A.2, ruled two of its five
# findings factually WRONG the day after they were written —
#   *"D3 is wrong at the code level. §STOREY-Z is already reaching the gate … Stage A's premise is
#    void; there is nothing to single-source."*
#   *"D2's mechanism does not occur … D2 read line 113-114 and stopped before line 116. The diagnosis
#    was never run; it was reasoned from source."*
# — and §STAGE A then found the real defect (the glazed façade at seq 3/4) that Task 1 actually
# shipped a fix for. A session reading the parent file top-to-bottom was hitting 86 lines of a
# storey-bucket theory, two fifths of it retracted on the next page, before reaching either the real
# cause or the closure.
#
# CHECKED BEFORE MOVING (2026-08-27 citation sweep over `prompts/`, `docs/`, `PROGRESS.md`,
# `CLAUDE.md`, the memory store and `~/bim-ootb`): the only citation of this block from outside its
# own file is `prompts/JKR_SKATA_COMPLIANCE_LANE.md:39`, which invokes **D1** as a HISTORICAL analogy
# — *"the same shape as the T1b finding in `RESUME_4D_TRUTH_AND_BE_HERE_WHEN.md` §DIAGNOSIS D1 (a
# planner stated it; our schema dropped it)"* — not as the current answer to an open question. D1 is
# reproduced in full below and the pointer left in the parent file names it, so that reference still
# resolves.
#
# ⛔ DELIBERATELY LEFT IN THE PARENT FILE — `§STAGE A 2026-07-30` (A.0–A.5), and this is not a close
# call: it is **still cited as current by SHIPPED CODE**. `bim-ootb/tests/test_host_order.js:2` and
# `tests/test_facade_stagger_order.js:3` both name it as their spec-of-record, BOTH print
# *"See bim-compiler prompts/RESUME_4D_TRUTH_AND_BE_HERE_WHEN.md §STAGE A"* in their failure output
# (`:366` / `:132`), and the shipped data file `bim-ootb/viewer/rates/sequence_rules.json:19` cites
# **§STAGE A A.3/A.4** by name in its `reason` field as the rationale for the
# `glazed_curtainwall_facade` override. Archiving it would break a live failure message.
#
# ALSO LEFT IN THE PARENT FILE: the `⚠ DO NOT REMOVE` scope block; **Task 1's spec** (its ⚠
# boundaries — capture-and-replay-CPM-never-recompute, host links EXTRACTED never inferred from
# proximity — are standing rules, not history); **Task 2 `§CPE_BE_HERE_WHEN`, which is still OPEN**
# (the parent file's last line: *"Task 2 itself is untouched by this session; still open"*, and every
# file that cites it defers it); the `⛔ Blocking questions — ANSWERED 2026-07-29` block; `## State
# this builds on`; and the whole `✅ TASK 1 CLOSED (2026-07-31)` record.

## Contents
1. §DIAGNOSIS 2026-07-30 — D0–D4, why Task 1 was still open (D2 and D3 later measured WRONG)  *(was lines 107–192)*

---

# ▶ ARCHIVED BLOCK — §DIAGNOSIS 2026-07-30 (D0–D4; D2 and D3 later measured WRONG by §STAGE A A.2)
# (verbatim from prompts/RESUME_4D_TRUTH_AND_BE_HERE_WHEN.md lines 107–192, 2026-08-27)

## §DIAGNOSIS 2026-07-30 — why Task 1 is still open, measured on the shipped Hospital DB

Diagnosis only. No code changed. Read against `~/bim-ootb/buildings/Hospital_extracted.db` and
`origin/main` `be88cce`.

### D0 — Task 1 was never built
`git grep -iE "HOST_BEFORE_HOSTED|W-HOST-ORDER"` over all of `bim-ootb` returns **zero** production hits.
The recent merged work (#1088 §CACHE_KEY, #1089 §CPE_ROOM_TITLE, #1090/#1091 §GEO-SERVED) is a different
lane. Nothing has yet touched the build order, so the window-before-wall the user saw on 2026-07-29 is
unchanged and expected. **The gate has not run RED yet, let alone green.**

### D1 — the reframe in Task 1a does not apply to the shipped Hospital
The spec says Hospital "carries deps + element links 46/46 … and our schema discards all of it," concluding
this is "the fallback running on a building that did not need a fallback." **Measured, the shipped extract
carries no programme at all:**
```
Hospital_extracted.db :  schedules 0 | tasks 0 | task_sequences 0 | task_elements 0
Hospital_meta.db      :  schedules 0 | tasks 0 | task_sequences 0 | task_elements 0
```
The tables exist (`task_sequences` even has `predecessor_id/successor_id/sequence_type/lag_days`) and are
empty; `tasks` has no early/late/float/is_critical columns. So the 46/46 deps are in the **source IFC**, not
in what the viewer loads. **Consequence for planning: T1b (1a) cannot change what the user sees until
Hospital is re-extracted.** Only track 1b — the fallback gate — moves today's film. The dependency order
stated in the ⚠ block still holds for *correctness*, but 1a is a compiler-side task, not a viewer-side one.

### D2 — the cheap cause the spec told us to check first: **it is the storey bucket, not the trade order**
Trade order is already correct. `viewer/rates/sequence_rules.json`:
`IfcWall`/`IfcWallStandardCase` → **seq 6** (MASON); `IfcWindow`/`IfcDoor` → **seq 7** (CARPENTER).
Both are `seq > 4`, so both land in `schedule_gate.js` PASS B, whose per-Level trade gate
(`:110–120`) makes trade *k* wait for every lower trade in its own phase bucket. Wall-before-window **is**
expressed — *within a bucket*.

The bucket is `collapsePhase(el.storey)` — the raw `elements_meta.storey`. Measured on Hospital:

| storey | walls (seq 6) | windows+doors (seq 7) |
|---|---|---|
| Level 1 | 311 | 180 |
| Level 2 | 209 | 121 |
| Level 3 | 310 | 96 |
| Level 4 | 336 | 88 |
| Level 5 | 254 | 73 |
| Level 6 | 35 | 5 |
| Level 7 | 8 | 1 |
| Level 7A | 5 | 0 |
| **Unknown** | **0** | **7** |

**`storey='Unknown'` holds 7 openings and zero walls.** Their `phaseTrade['Unknown']` bucket has no seq<7
entry, so `tg` stays at `baseMs` (`schedule_gate.js:113–114`) and all 7 are scheduled **at project start** —
ahead of every wall in the building. That is a window before its supporting wall, produced by bucketing,
not by the trade table.

### D3 — why a fix already exists and still did not help: it landed on the display side
PR #869 (`926bd20`) added **§STOREY-Z**: reassign no-storey elements to the nearest real storey by median Z.
It lives in `viewer/time_machine.js:3243–3292` (inside the mini-Gantt data prep) and in
`viewer/lib/room_walker.js:203,225`. **It is not in `viewer/schedule_gate.js`.**

So the same feature holds two notions of "which storey is this element on": the **Gantt** reassigns and
looks correctly cascading; the **gate that computes the reveal order** buckets on the un-reassigned raw
storey. The picture and the order disagree, and the picture is the one that looks right. This is the same
shape as `prompts/SEAM_IDENTITY_AUDIT.md` §CLUSTERS **C2** — one identity derived two ways, the display
fixed and the computation missed.

### D4 — W-HOST-ORDER as specced is **not measurable** on the shipped DB
The gate wants `start_ts(host) <= start_ts(hosted)` per hosted element. Hospital's tables are:
`component_geometries, project_metadata, spatial_structure, element_instances, qto_cache, task_elements,
element_transforms, rel_contained_in_space, task_sequences, elements_meta, schedules, tasks`.
There is **no `rel_fills_element` / `rel_voids_element`** — the wall↔window host relation was never
extracted. `rel_contained_in_space` is space containment, a different relation.
So the witness cannot be written against the current extract without either (a) extracting the IFC
relationship compiler-side, or (b) deriving containment geometrically — and (b) must be *measured*
containment (window bbox inside wall bbox), never proximity, per the Prime Directive.

### What this means for the next session
1. **The 7 `Unknown`-storey openings are a real, cheap, measurable defect** — and the honest first move is
   to make W-HOST-ORDER report RED on them before touching anything. Reproduce first (§GUARDRAILS).
2. **§STOREY-Z belongs in one place**, called by both the Gantt and the gate. That is a smaller change than
   1b and may be most of what the user actually sees.
3. **7 of 571 openings is not obviously the whole defect.** The user saw *a* window before *its* wall; these
   7 are ahead of *every* wall. Whether the remaining 564 are ordered correctly relative to their own hosts
   is exactly what D4 says we cannot yet measure. **Do not close Task 1 on the strength of D2 alone.**
4. Task 1a is re-scoped: it is a **bim-compiler extraction** task (capture deps + host relations into the
   schema), not a viewer task. It cannot be witnessed on today's shipped Hospital.

**Not verified in this pass:** that these 7 are the elements the user saw in the baked film. That needs the
film or a §-logged run, and this pass ran neither.

