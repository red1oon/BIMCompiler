# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** TWO tasks, in this order, and nothing else:
1. **T1b + §4D_HOST_BEFORE_HOSTED** — make the 4D build order TRUE.
2. **§CPE_BE_HERE_WHEN** — pin a point on the camera path to a moment in that timeline.
**The order is a dependency, not a preference.** Task 2 solves pacing so the camera arrives when
something is being built. If the timeline still installs a window before its wall, task 2 aims the
camera at a moment that is wrong — precisely and confidently wrong. Do not start task 2 until task 1's
gate is green. If you can only finish one, finish task 1.

**Read the log after every run.** Proof on this project is `§`-tagged console output and NUMBERS.
For anything continuous (camera position, tilt, rate, arrival time) it is the numbers computed from
real object state, never a screenshot and never "the film looks right" — CLAUDE.md's FUNDAMENTAL LAW.
**Spec before code, including test code.** Every witness must name the issue it proves or disproves,
and must be able to show the RED. **Answer the ⛔ blocking questions before building.**
Honour this block until this file is DONE.

---

## Task 1 — T1b + §4D_HOST_BEFORE_HOSTED: make the build order true
**Read first:** `prompts/GANTT_ACCURACY.md` §4D_HOST_BEFORE_HOSTED (the whole section, including the
struck-through mechanism — it shows what was already ruled out) and `prompts/4D_CAPTURE_AND_FALLBACK.md`
§2.1 + §5.2 (T1b) + line ~359.

**The finding, from a user watching a baked Hospital film 2026-07-29:** a window revealed before its
supporting wall. It reads like a scheduler bug and is not one.

**The reframe that matters — do not skip it.** Hospital's captured IFC programme carries **deps +
element links 46/46**, early/late 45/46, float 44/46, is_critical 45/46 — and **our schema discards all
of it**. So `viewer/schedule_gate.js` is heuristically re-deriving an order a planner already stated.
**This is the fallback running on a building that did not need a fallback.**

**Two tracks, in this order:**
- **1a — T1b (the higher value, already specced, never built).** Widen the schema to capture deps +
  early/late + float + is_critical, and let a captured programme's own dependencies drive the order.
  ⚠ **Boundary, unchanged:** capture and replay CPM, **never recompute float**. Reading a planner's
  stated dependencies is not us solving CPM and must not become that.
- **1b — the hosting gate, FALLBACK ONLY.** For buildings with no programme, add HOST-BEFORE-HOSTED as
  a third constraint beside `schedule_gate.js`'s two passes. ⚠ **Strict Z cannot express this** — a wall
  CONTAINS its window (0.0→3.0 vs 0.9→2.1 inside it); containment is not ordinal. The existing Z
  stacking matrix (PASS A/B, ε=0.05m) is correct and must not be replaced to fix a relation it was never
  meant to carry. ⚠ **Check the cheap cause FIRST:** trade `seq` ordering in PASS B may be the whole
  defect. ⚠ The host link must be EXTRACTED (IFC relationship or measured containment), never inferred
  from proximity — that is invention, forbidden by the Prime Directive.

**Gates:** W-HOST-ORDER (`start_ts(host) <= start_ts(hosted)` for every hosted element on Hospital;
report the violation count BEFORE and after — before must be > 0 or you never reproduced it),
W-HOST-NO-REGRESSION (bottom-up character survives; `§GANTT_MINI` phase spans do not collapse),
W-HOST-COVERAGE (how many elements have a derivable host; the rest keep their order and are COUNTED).

**The demonstration is already set up, and it is not the proof.** The user still holds the authored
Hospital path. Re-bake that exact path and compare against `BIM_MaxQ_Hospital_1785273910881.mp4`
(1852×960, 1186 frames, 79.067 s — user-accepted reference). Same camera, same duration, one variable.
Correct order puts the façade closing over the exposed services **in front of the lens** instead of
before it. ⚠ Re-bake from the SAVED path — confirm `§CPE_OPEN src=authored` and unchanged band/hose
counts first, or the comparison is worthless. The films demonstrate; **W-HOST-ORDER proves.**

**Honesty tiers move with this:** captured deps → tier 1 (*linked schedule*); the geometric gate stays
tier 2 (*this model's derived 4D*). Never "a construction programme" for tier 2. See
`prompts/CINEMA_PATH_EDITOR.md` §5.

---

## Task 2 — §CPE_BE_HERE_WHEN: be HERE when THAT is being built

> ⚠ **DOC DISCREPANCY — FLAGGED 2026-08-27, NOT RESOLVED. Check this before starting Task 2.**
> This file still calls Task 2 open (see its closing line, written 2026-07-31). **The file it names
> as its own authority disagrees.** `prompts/CINEMA_PATH_EDITOR.md:284` — committed, and that file
> was git-touched 2026-08-24, i.e. *after* this one's last edit — records:
> *"§CPE_BE_HERE_WHEN (spec, not built — folded into the later 'be here when' family, superseded)."*
> It names **no successor tag**, so what "the later family" is has NOT been established, and the CPE
> lane's own current open item is `§CPE_AIM_DEPTH_BUILDUP`, not this.
> **Do not start building Task 2 on this file's word, and do not close it on that one line either** —
> resolve which is true first, in `CINEMA_PATH_EDITOR.md` (that lane owns the tag; this file only ever
> pointed at it). Recorded per the same "flag a doc discrepancy, don't re-litigate" precedent as
> `prompts/CPM_FLOAT_GAP.md:30`. Found by a citation sweep during the 2026-08-27 prompt-consolidation
> pass, which is also why §DIAGNOSIS below is now archived.
>
> **2026-08-27 (later, same pass) — ONE CANDIDATE SUCCESSOR FOUND. It is a LEAD, NOT A RULING.**
> A full search of `CINEMA_PATH_EDITOR.md` for the fold still finds **no statement anywhere that
> names a successor to `§CPE_BE_HERE_WHEN`** — so the fold remains unestablished and Task 2 is still
> not closed here. The one section covering the identical question is
> **`prompts/CINEMA_PATH_EDITOR.md:834-884` — Part F, `§CPE_STICK_TIME_SYNC`, F2** (*"sync a pin's
> timing to when the selected element is actually built"*, user 2026-08-04, i.e. **later** than
> §CPE_BE_HERE_WHEN's 2026-07-29 spec — consistent with "the later family", but nothing says so).
> ⚠ **F2 does not close Task 2 even if it IS the successor:** F2 is itself headed *"open question, do
> NOT guess"* and turns on an unmade design call — **(a)** retime the path to force arrival at
> `F × totalSec` vs **(b)** read-only comparison; its own gate `G-TIME-SYNC-1` is written as
> *"once F2's question is settled"*. F2 does name the primitive as already built and witnessed
> (`_ghostGroundArm`, `cinema_maxq.js` ~L211-217, rank→film-fraction, gated by G-GG-12).
> ➡ **Whoever resolves this: start at Part F, not from scratch — but the successor claim needs the
> CPE lane to state it, not this file to infer it.** Recorded so the next session does not repeat
> the search; **no successor was invented to close Task 2.**

**Read first:** ~~`prompts/CINEMA_PATH_EDITOR.md` §CPE_BE_HERE_WHEN (the full section)~~ ⛔ **BROKEN
POINTER — CORRECTED 2026-08-27. That section is NO LONGER in `CINEMA_PATH_EDITOR.md`** (verified: zero
`# §CPE_BE_HERE_WHEN` headings there; only the one-line status entry at `:284` quoted in the block
above). **The full section text is at
`prompts/archive/CINEMA_PATH_EDITOR_full_history_2026-07-26_to_2026-08-03.md:4162`** — *"the shot the
demo caught by ACCIDENT, made authorable (user, 2026-07-29)"*, running ~`:4162-4204`.
Still valid: **§CPE_WHEN_HERE** (item 7 in `prompts/CINEMA_DELIGHT_BATCH.md:303` — the READ direction
this inverts, confirmed present) and §CPE_SPEED_RAMP.

**The origin:** the user's published demo caught the façade panelling going on and a glimpse of inner-room
services *by accident* — two clocks coincided. Drag one band and it is gone. Task 2 makes that
authorable: pin a path point to a timeline moment and let PACING solve for it.

**Possible only since 2026-07-29:** §CPE_BUILDUP_FOLLOW_TM made the target stand still. Before it, the
reveal was re-keyed to the camera path, so "when is this built" moved with every band drag.

⚠ **Carry §CPE_SPEED_RAMP's law:** fold the constraint **INTO the cost integrand, never as a multiplier
after it**, or §CPE_EVEN_TURN's turn-per-frame bound breaks and the jerk returns. That lane cost several
sessions and three dead ends — do not re-learn it. **The peak-deg/frame witness is the gate.**
⚠ **The honest limit is a REQUIREMENT, not a caveat:** where the schedule lacks that ordering there is no
window to arrive in, and the feature must report *"no such window on this building"*. **It must never
nudge the schedule** — that would be the camera authoring the build order again, which the user
explicitly ruled out on 2026-07-29 (*"do not bake anything for TM.. it is user's own plan"*).

**Witness sketch:** `§CPE_BE_HERE_WHEN target=<guid|room|phase> window=<iso>..<iso> cameraT=<f>
cursorAt=<iso> offsetDays=<n> hit=1|0 peakTurnDeg=<n> (bound=<n>)` — plus the unchanged jerk gate.
Report failure to hit the window as a NUMBER, never by silently landing nearby.

---

## ⛔ Blocking questions — ANSWERED 2026-07-29, before any build
1. **Task 1a — captured vs fallback:** **captured always wins.** When a building has both, the geometric
   fallback does not run on it at all; no divergence display. Matches the tier-1/tier-2 honesty split
   already in `CINEMA_PATH_EDITOR.md` §5 — keep it that simple.
2. **Task 2 — target grain:** **phase.** `_sfxPhases` already derives phase changes per tick — cheapest,
   and the target is "be here when THIS PHASE is building," not one specific element. Room/element grain
   not pursued for the first build.
3. **Task 2 — miss handling:** **bake anyway, report the miss.** Deliver the film with the closest
   achievable arrival; report `offsetDays` and whether `peakTurnDeg` stayed inside `bound` as numbers, so
   the miss is visible rather than silent. Editor does not refuse.

## State this builds on (all merged to `bim-ootb` main, 2026-07-29)
CPE **v16**, MAXQ **v17**, sw **v882**. PRs #1081–#1084. `tmFollowTimeline()` is the single verb both
Preview and bake use; `§CPE_BUILDUP_SOURCE mode=S|T` logs the choice unconditionally.
**Not in scope here:** `prompts/CINEMA_FIND_TO_FILM.md` (the other promoted POC), the panel's hardcoded
`— 3 bands` header, and the two incompatible `tasks` schemas — all recorded, none belong in this file.

---

## §DIAGNOSIS 2026-07-30 — ARCHIVED (superseded: D2 + D3 measured WRONG below, and Task 1 is CLOSED)

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** The 2026-07-30 diagnosis of Task 1 (**D0** never built · **D1** the shipped Hospital extract carries no programme at all, `schedules/tasks/task_sequences/task_elements` all 0, so 1a is a bim-compiler extraction task not a viewer one · **D2** the `storey='Unknown'` bucket holding 7 openings · **D3** §STOREY-Z landing on the display side only · **D4** W-HOST-ORDER unmeasurable without `rel_fills_element`/`rel_voids_element`). **D2 and D3 were both ruled factually WRONG the next day by §STAGE A §A.2 immediately below** — §STOREY-Z *does* reach the gate (`reassigned=9457`), and the 7 Unknown openings do NOT schedule at project start (`firstOpeningDay=295.56` vs the building's earliest wall at day 261.15); *"D2 read line 113-114 and stopped before line 116. The diagnosis was never run; it was reasoned from source."* §STAGE A then found the real defect, and Task 1 shipped and CLOSED on 2026-07-31 (see the ✅ section at the end of this file). Full text, incl. **D1**'s measured table (the one finding still cited, as a historical analogy, by `prompts/JKR_SKATA_COMPLIANCE_LANE.md`): `prompts/archive/RESUME_4D_TRUTH_AND_BE_HERE_WHEN_archived_2026-08-27.md`.

---

## §STAGE A 2026-07-30 — GATE NOT PASSED: the specced defect does not reproduce; a much larger one does

**Worker session. No production code changed.** The Stage A gate ("W-HOST-ORDER must report >0 BEFORE
the change, or stop") was run honestly and came back **0**. Per the standing rule — *a witness that
cannot show RED is not a witness, and you do not build a fix for a defect you failed to reproduce* —
Stage A and Stage B were **not implemented**. What follows is the spec that was written first, the
measurements that closed the gate, and the real defect those measurements found instead.

Measured against `~/bim-ootb/buildings/Hospital_extracted.db` (+ 5 more buildings) and `origin/main`
`be88cce`. Every number below comes from `tests/test_host_order.js` (new, committed to `bim-ootb`
branch `fix/4d-host-before-hosted`) running the REAL deployed `viewer/schedule_gate.js`.

### A.0 Spec written before any code (the contract this session held itself to)

- **W-HOST-ORDER (crude proxy, as specced in the brief).** Count seq-7 openings (`IfcWindow`/`IfcDoor`)
  whose `start_ts` precedes the earliest seq-6 wall (`IfcWall`/`IfcWallStandardCase`) in the building.
  *Proves/disproves:* "openings in a wall-less storey bucket fall through the per-Level trade gate and
  schedule at project start." **Must be >0 before, 0 after.**
- **W-HOST-ORDER (real, per-host).** Derive host by MEASURED bbox containment from `element_transforms`
  (`center_*`/`bbox_*`) — opening bbox ⊆ host bbox inflated by `tol` on every axis. Never proximity.
  Ambiguous (>1 candidate) ⇒ **no host, counted, never guessed.** Assert `start_ts(host) <= start_ts(hosted)`.
- **W-HOST-COVERAGE.** hosted / ambiguous / noHost out of 571 openings, swept over `tol ∈ {0, .05, .1, .25, .5}` m
  so the coverage number is visibly tolerance-sensitive rather than a single cherry-picked figure.
- **W-HOST-NO-REGRESSION.** Run the whole element build twice — with and without §STOREY-Z — and compare
  per-storey first-wall / first-opening days numerically. Bottom-up character must survive.
- **Reveal semantics (checked, not assumed).** `viewer/time_machine.js:1132-1157` puts an element on screen
  at `op.start_ts` (as `frontier`), so **start order IS reveal order** and `start_ts` is the correct thing
  to assert on. Confirmed before writing any assertion.

### A.1 The gate: RED was never reached — every form of W-HOST-ORDER is already 0

| witness | tol | hosted | ambiguous | noHost | **violations** |
|---|---|---|---|---|---|
| crude proxy (opening before FIRST wall) | – | – | – | – | **0 / 571** |
| per-host, measured containment | 0.00 m | 433 | 47 | 91 | **0 / 433** |
| per-host, measured containment | 0.05 m | 488 | 51 | 32 | **0 / 488** |
| per-host, measured containment | 0.25 m | 486 | 68 | 17 | **0 / 486** |
| per-host, measured containment | 0.50 m | 452 | 110 | 9 | **0 / 452** |
| **widened superset** — EVERY 3D-overlapping wall must precede | 0.05 m | 565 | 0 | 6 | **0 / 565** |

The crude proxy is also 0 on **Duplex, HHS_Office_Federated, Terminal, LTU_AHouse, JKR** — with and
without §STOREY-Z. It is not merely 0 on Hospital; it is **structurally incapable of going RED**, because
`geoGate` + the project-wide `§CREW-CAP` crew pool already push every seq-7 element hundreds of days past
the first seq-6 wall regardless of bucket. Stage B's constraint `start_ts(host) <= start_ts(hosted)` is
**already satisfied for every derivable host at every tolerance**. Adding it would be a no-op.

### A.2 Two factual corrections to §DIAGNOSIS 2026-07-30 (D2 and D3 are wrong)

**D3 is wrong at the code level.** §STOREY-Z is **already reaching the gate**. `assignStoreyByZ` is applied
at `viewer/time_machine.js:3269` while the `elements` array is built, and *that same array* is what is
handed to `ScheduleGate.computeSchedule` at `viewer/time_machine.js:3358-3359`. There is exactly ONE
`computeSchedule` call site in the repo. Measured: `reassigned=9457` on Hospital. There is no
raw-vs-reassigned split between Gantt and gate — the "one identity derived two ways" C2 shape does not
apply here. **Stage A's premise is void; there is nothing to single-source.**

**D2's mechanism does not occur.** The 7 `storey='Unknown'` openings do **not** schedule at project start.
Measured with §STOREY-Z force-disabled, so the raw bucket is genuinely wall-less:

```
§PER_STOREY Unknown   walls=0  firstWallDay=n/a   openings=7  firstOpeningDay=295.56
            (earliest wall anywhere in the building = day 261.15)
```

`tg` does stay at `baseMs` for that bucket exactly as D2 says — but `start = Math.max(geoGate(el), tg,
slot.time)` (`schedule_gate.js:116`), and the other two terms dominate. D2 read line 113-114 and stopped
before line 116. **The diagnosis was never run; it was reasoned from source.**

### A.3 What the user actually saw — RED, reproduced, 2211/2211

The user reported *"a window revealed before its supporting wall."* It was not an `IfcWindow`.

`viewer/rates/sequence_rules.json` classifies by IFC class alone:
`IfcMember` → **seq 3**, `IfcPlate` → **seq 4** (both *Superstructure*, `STEEL_ERECTOR`);
`IfcWall`/`IfcWallStandardCase` → seq 6; `IfcWindow`/`IfcDoor`/**`IfcCurtainWall`** → seq 7.
`seq <= 4` routes an element into **PASS A, the structural pass**.

On Hospital that classification is materially wrong:

- **2211 / 2211** `IfcPlate` are named `System Panel:**Glazed**:…` — curtain-wall glazing.
- **7122 / 7127** `IfcMember` are named `Curtain Wall:Profilit-…Framing…` — curtain-wall mullions.
- All 9333 **have meshes** (`element_instances`) — they are on screen.

So the entire glazed façade is erected as *structure*:

```
§CLASS_SPAN  (reveal start day; project = 1335 days)
  IfcMember            n=7127  seq=3  Superstructure  min=13.2  p50=84.4  max=146.6
  IfcPlate             n=2211  seq=4  Superstructure  min=14.1  p50=90.2  max=146.1
  IfcWall              n= 158  seq=6  Architecture    min=261.2 p50=274.0 max=281.4
  IfcWallStandardCase  n=1310  seq=6  Architecture    min=261.2 p50=270.8 max=281.5
  IfcWindow            n= 131  seq=7  Architecture    min=289.4 p50=291.2 max=295.3
  IfcCurtainWall       n= 178  seq=7  Architecture    min=281.6 p50=283.4 max=285.3

§W-FACADE-ORDER glazed panels revealed BEFORE the FIRST wall in the building = 2211/2211
§W-FACADE-ORDER panelsWithTouchingWall=1445  violations=1445/1445  worstLateDays=251.19
   e.g. glazed 3sbXgwO310x8BAlsfLa$g4 @day14.13 vs touching IfcWallStandardCase @day264.73 late=250.6d
   e.g. glazed 3sbXgwO310x8BAlsfLa$WY @day14.13 vs touching IfcWall            @day261.68 late=247.5d
```

**A glazed panel appears on day 14. The wall it physically touches appears on day 265.** That is the
window-before-its-wall the user saw, 251 days wide, on 1445 measured touching pairs. This IS the RED the
gate was looking for — it was just never going to be found by looking at `IfcWindow`.

**Corollary, same root cause:** `IfcCurtainWall` (seq 7, day 281-285) is scheduled **~250 days after its own
`IfcPlate`/`IfcMember` children** (seq 4/3, day 14-146). The IFC aggregate is built after its parts. Note
the 178 `IfcCurtainWall` rows have **no `element_transforms` row and no `element_instances` row** — the gate
sees them at world origin (`COALESCE(...,0)`), ~169 m below a building whose median Z is 168.9 m, with a
zero-area footprint, and they are never rendered. A fix must target `IfcPlate`/`IfcMember`, not the container.

**Fleet scope — and the trap that makes this NOT a one-line fix.** A raw `IfcPlate` count is misleading;
what matters is whether the plate is glazing or genuinely structural. Measured by name:

| building | `IfcPlate` | glazing? | witness verdict |
|---|---|---|---|
| Hospital | 2211 | 2211 × `System Panel:Glazed` | **RED** 2211/2211 before any wall; 1445/1445 touching pairs; worst **251.19 d** |
| HHS_Office_Federated | 629 | 438 × `Systemelement:**Verglasung**` (German) | **RED** 154/438 before any wall; 145/145 touching pairs; worst **20.58 d** |
| Terminal | 33,324 | **0** — all `Metal Deck` | **GREEN** — seq 4 is *correct* here; witness does not false-positive |
| LTU_AHouse / JKR / Duplex | 145 / 120 / 0 | – | crude + per-host witnesses all 0 |

So the defect is confirmed on **two independent buildings**, and Terminal proves a blanket
"`IfcPlate` is not structure" reclassification would be **wrong** — its 33,324 metal-deck plates belong in
Superstructure exactly where they are. Note also that HHS names its glazing `Verglasung`: **a name-based
rule is locale-dependent** and will silently miss buildings authored in other languages. The witness
therefore prints `§PLATE_UNMATCHED` (count + name breakdown of every `IfcPlate` its regex did *not* claim)
so that blind spot is always a number on the log rather than a silent omission. This is the concrete
evidence behind the ⛔ decision below: the robust discriminator is the IFC decomposition
(`IfcCurtainWall` ⊃ `IfcPlate`/`IfcMember`), which is **not in this schema** — a bim-compiler extraction task.

### A.4 Why this was NOT fixed in this session

The fix is a **class→sequence reclassification**, not a scheduling-gate change — a different file
(`viewer/rates/sequence_rules.json`), a different blast radius, and a decision that is not the worker's to
make. `IfcPlate`/`IfcMember` at seq 3-4 is *correct* for structural steel plates, gusset plates and bracing;
it is wrong only when the element is curtain-wall fabric. Distinguishing them requires a rule the brief did
not authorise and this session will not invent. **⛔ BLOCKED on one decision:** may the sequence lookup be
widened beyond `ifc_class` — e.g. to consult `element_name` (`/glazed|curtain wall/i`), or to consult the
IFC decomposition (`IfcCurtainWall` ⊃ `IfcPlate`/`IfcMember`, which is **not extracted** into this schema
and would be a bim-compiler task)? Both are EXTRACTION, not invention; the choice between them is an
architecture call.

Whatever is chosen, `tests/test_host_order.js` already gates it: today it prints `§VERDICT RED`, and it is
the artifact that turns green. `viewer/schedule_gate.js` and `viewer/rates/sequence_rules.json` are both
precached (`viewer/sw.js:192`, `CACHE_VERSION` currently `v884`) — the fix commit must bump it. This
session changed no precached file, so no bump was made.

### A.5 Deliverables

- `bim-ootb` branch **`fix/4d-host-before-hosted`** (off `origin/main` `be88cce`), worktree `/tmp/wt-4dorder`
  — adds `tests/test_host_order.js` only. **Zero production files touched.** Not wired into CI
  (`.github/workflows/ci.yml` runs an explicit list; nothing globs `tests/`).
- Stage B not started — correctly gated off by Stage A.

---

## ✅ TASK 1 CLOSED (2026-07-31) — user-confirmed live, glazed façade no longer beats its host wall

The ⛔ A.4 decision was answered by the user directly: name-based reclassification is metadata
tuning, not architecture — `sequence_rules.json` is "an editable JSON meant for that purpose,"
no separate authorization needed. Built same-session, shipped, confirmed working live on Hospital.

**What actually shipped — THREE fixes, not one, because the classification bug had two independent
consumers and one silent no-op:**

1. **`rates/sequence_rules.json` `NAME_OVERRIDES`** — `glazed_curtainwall_facade`: `IfcPlate`/`IfcMember`
   whose `element_name` matches `/glaz|glass|verglas|vitrage|vidrio|curtain|mullion/i` move from their
   structural class default to Architecture/seq7 (the same slot as `IfcWindow`/`IfcCurtainWall`). Pattern
   was widened past the original A.3 `GLAZE_RE` (which only matched `IfcPlate`) after measuring the
   remaining unmatched names on all 8 buildings: Hospital's `Curtain Wall:...Framing`/`Curtain System`
   `IfcMember` mullions and Clinic's `Rectangular/Circular Mullion` needed bare `curtain`/`mullion`, not
   `curtain.?wall`. **Measured zero false positives on all 8 shipped buildings** — Terminal's 33,324
   `Metal Deck` `IfcPlate`, JKR's `jkrST_str-fr_st_chs` steel framing, LTU_AHouse's `Beam Planed Timber`
   all correctly stay structural. Known reported (not silently dropped) blind spot: HHS's German
   `Rechteckiger Pfosten` (curtain-wall posts) — deliberately not covered by a generic "post" pattern,
   too ambiguous against real structural posts.
2. **Two independent consumers, both needed the fix** — this was NOT found until building it:
   - `viewer/time_machine.js` `matchRule`/`injectGantt` (the generative fallback, what A.1-A.3 measured).
   - `viewer/schedule_author.js` `materializeDefault` — a **second, separate** class→phase classifier
     that groups elements into the 6 WBS phase-buckets the "Generate first draft"/Regenerate authoring
     UI writes to `tasks`/`task_elements`. Its own header says "REPLICATES time_machine.js matchRule
     EXACTLY" but that was a comment, not a mechanism — it never saw the name override until patched
     separately. **This is the path the user was actually exercising** (`§AUTHOR_MATERIALIZE` in every
     console dump in this thread), not the generative fallback A.1-A.3 tested.
3. **A third bug found only by testing the live flow, not just `tests/test_host_order.js`:**
   `time_machine.js`'s `§PLAYBACK-STAGGER` block (`:3454-3489`) — once a schedule is 100% authored/
   captured, it re-derives each element's fine timing by sorting elements WITHIN a phase-task bucket by
   raw `center_z` only, no trade order. A window/glazed panel and its host wall routinely have near-
   identical `center_z` (the opening sits inside the wall's height span), so cz-only sort left **662/1445
   touching glazed-panel/wall pairs still violating** even after fix #2 correctly bucketed them into the
   same phase. Changed the sort key to `(seq, cz)` — same discipline as `schedule_gate.js` PASS B — 662→0.
4. **A fourth bug — the reason the first deploy "didn't work" (user report, same session):**
   `viewer.html` never calls `initRateTemplate()`/`loadSequenceRules()` — only `mep_report.html` and
   `boq_charts.html` do. So `rates/sequence_rules.json` is **never fetched** by the actual viewer;
   `rates.js`'s own hardcoded in-file `SEQUENCE_RULES`/`SEQUENCE_DEFAULT` objects are what really run,
   and the JSON is a "someday, if fetched" override that in practice never fires for Time Machine or the
   Author wizard. Confirmed by the total ABSENCE of any `§RATES_JSON` log line across every console dump
   in this thread. Fix #1 alone was **inert** until the same override was also hardcoded directly into
   `rates.js`'s `SEQUENCE_NAME_OVERRIDES` (same convention as the existing hardcoded `SEQUENCE_RULES`).

**Witnesses (real deployed code, Hospital):**
- `tests/test_host_order.js` §W-FACADE-ORDER: 2211/2211 glazed-before-any-wall, 1445/1445 touching
  violations (worst 251.19d late) → **0/1445**, GREEN.
- `tests/test_facade_stagger_order.js` (new) §ZORDER_FACADE: cz-only sort 662/1445 RED → `(seq,cz)`
  sort **0/1445**, GREEN.
- `tests/test_schedule_gate.js` unaffected (0 floating, unchanged) — confirms the fix didn't touch the
  support gate.
- Zero regressions: Duplex/Terminal/LTU_AHouse/JKR all show `nameOverridden=0`, still GREEN.
- **User-confirmed live** on the actual Hospital viewer session after the 4th fix: "yes it is working."

**Deliverables:** bim-ootb PR #1098 (fixes 1-3, merged) + PR #1100 (fix 4, merged), `sw.js`
`CACHE_VERSION` v885→v886→v887, both deployed to GH Pages and verified.

**Precondition for Task 2 (`§CPE_BE_HERE_WHEN`) is now met** — the timeline no longer installs a
window before its wall, so pinning a camera arrival to "when this is being built" now aims at a
correct moment. Task 2 itself is untouched by this session.

> ⛔ **CORRECTED 2026-08-27 — this line used to end "still open". THAT CLAIM IS STALE; DO NOT ACT ON
> IT.** It was written 2026-07-31. `prompts/CINEMA_PATH_EDITOR.md:284` — the file this task names as
> its own authority, edited *later* — records `§CPE_BE_HERE_WHEN` as *"spec, not built — folded into
> the later 'be here when' family, superseded."*
> **The true current status is UNRESOLVED, and is deliberately not asserted either way here.** See the
> full ⚠ DOC DISCREPANCY block at the head of Task 2 above, which owns this question. Resolve it in
> `CINEMA_PATH_EDITOR.md` (that lane owns the tag; this file only ever pointed at it) — do not close
> Task 2 on one changelog line, and do not start building it on this file's stale word.

**Lesson for next session touching `rates.js`/`sequence_rules.json`:** editing the JSON alone proves
nothing about what the live viewer does — check whether the consuming page actually calls
`loadSequenceRules()` before treating a JSON edit as shipped. See
`project_rates_json_viewer_never_fetched_landmine.md`.
