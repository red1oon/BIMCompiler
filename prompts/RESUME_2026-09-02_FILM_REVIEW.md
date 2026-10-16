<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# RESUME — film review handoff, 2026-09-02

```
# ⚠ DO NOT REMOVE
SCOPE: the open items from the 2026-09-01/02 film session. Read §PREMISE-CHECK FIRST — the top
item is one where doing exactly what was asked would REGRESS two fixed bugs, and the user has not
yet been given that correction in a form they acted on. Verification here is `§`-tagged numbers,
never screenshots (CLAUDE.md FUNDAMENTAL LAW). Read the log after every run. Honour until DONE.
```

**How this session ended:** the user asked for a fresh session to take over. Nothing below is
half-built — the items are specced, measured or diagnosed, and each says which.

---

## §SESSION_2026-09-02B — WORKED TO ZERO. Status of every item in this file.

| item | status | evidence |
|---|---|---|
| §PREMISE-CHECK / aim retirement | **✅ DONE (witness) 2026-09-02** — `§CPE_AIM_DEPTH` RETIRED, branch `fix/retire-aim-depth`, `witness_cpe_aim_retire.js` 7/7 depth-OFF with the depth-ON arm as a failing red control | §AIM_RETIRED_DONE below: gaze vs look-ahead chord **150.075° → 0.000°** (HHS), **163.114° → 0.000°** (Duplex) |
| §MEP_SYNTHETIC_PALETTE | **✅ DONE** — bim-ootb **PR #1604**, witness `W-MEP-DISC-PALETTE` **24/24** | 3 buildings, hues counted |
| §NON_DIRECTIONAL_FILL | **✅ DONE** — explanation to relay, nothing to build | attribution correction stands |
| §OPEN 1 — Alt+C perf | **✅ CLOSED** — gating code-verified + pool confirmed firing in a real windowed bake; the before/after A/B is **CANCELLED by user directive**, not outstanding | §OPEN 1 below |
| §OPEN 2 — §CPE_PIE_HOLD contradiction | **✅ SETTLED** — bim-ootb **PR #1603 (MERGED)** + §PIE_HOLD_PREDICATE here | live §CPE_RESOURCE_HOLD |
| §OPEN 3 — local vs OCI | **✅ ANSWERED** — the DB is NOT the cause; the deployed **viewer is v387/v505 vs local v1120** | §OPEN 3 below |
| §OPEN 4 — saved-path workflow | **✅ SETTLED already**, not re-opened | — |
| §OPEN 5 — three overlay specs | **⛔ NOT STARTED, deliberately** — `§FILM_UNSUPPORTED`'s acceptance gate is a full bake, which the user has just ruled out; a cheaper re-scope is named | §OPEN 5 below |

**⚠ STANDING CONSTRAINT ADDED THIS SESSION — bakes are not a measurement tool.**
User, 2026-09-02: *the silent bake worked well last night, so it need not be re-tested to that
extent; it keeps launching as a side effect.* Treat `cli_silent_bake.js` as a **proven, expensive
facility**, not a probe. Do not launch a film to settle a number. **Keep the `§`-logging intact and
observable** — do not remove, mute or wrap any `§` line on the bake path; preserving the
instrumentation is the ask, re-running the film is not. If a bake is genuinely the only way to
settle a specific numeric claim, **state the claim and ask first.**

---

## §PREMISE-CHECK — the camera-aim ask, and why a literal revert is the wrong move

**User, 2026-09-02:** *"I prefer the previous (before yesterday's changes) as it follows path
direction. I am not sure which is which but can we revert to before such changes yesterday? What
will be the remaining influence on cam angle then?"* and earlier: *"its best to leave alone its
pointing along its path as more intutive when pathing and user change of head at intended better
angles is all needed, to stay simple and predictable."*

**⚠ Reverting yesterday's changes does NOT deliver path-following. It restores two fixed defects.**
Yesterday (2026-09-01) touched aim twice, and BOTH reduce camera movement:
- **#1597 §CPE_CORR_BRANCH** — fixed a **110.44°** single-frame snap caused by a 2π branch flip in
  `_cpeCorrDirBlend`. Reverting reinstates the snap.
- **#1598 §CPE_AIM_DEPTH_FREEZE** — froze the blend-from gaze at correction-window edges; in-window
  max step **13.114 → 7.791 deg/sample (−41%)**, jerk 2.387 → 0.841. Reverting reinstates the wobble.

**The thing that actually deviates from path direction is `§CPE_AIM_DEPTH`, which is OLDER** — it
became the SOLE exception to path-follow on 2026-08-14 (`§CPE_AIM_SIMPLIFY`, PR #1344), when
`§CPE_AIM_DENSITY` was retired outright. Its trigger is a forward raycast: when clearance ahead is
under 3-8 m it turns toward depth. Verified firing in the 2026-09-01 measurements: 28/91 probes,
turning the gaze **83.45°**.

**So the real ask is: retire `§CPE_AIM_DEPTH` too, leaving pure path-follow.** Do NOT do this as a
silent revert — it is a POLICY change and it has a known cost: depth exists for the dead-end
"nose against the wall" case, measured as still firing. Spec it, name what is lost, then ship.

**What would still influence the camera angle afterwards (the user's own question, answered from
the code — re-verify before relying on it):**
1. **Path-follow** — the walk's own direction. Becomes the only automatic rule.
2. **`§CPE_AIM_PIN`** — a pinned band's Voronoi zone overrides path-follow outright. This is the
   user's own authored head-turn and is exactly what they said they want to keep.
3. **The authored correction window** — ramp/hold/decay, with §CPE_CORR_BRANCH + §CPE_AIM_DEPTH_FREEZE
   making it fixed-to-fixed. This is the "some meters ahead and behind to hold the angle and to ease
   between paths beyond" the user described; it already exists and MEASURES 33.4% window reach
   against an authored 34%.
4. **The dive-in and the closing orbit beats** — beyond the first/last stick. **User: these have
   their own orbit and facing set, are "perfectly fine and must remain undisturbed."** Do not touch
   `_cinemaPathPlan`'s beat framing.

---

## §AIM_DEPTH_RETIREMENT — the spec, the quantified loss, and the ONE question for the user
**Status 2026-09-02: ✅ BUILT AND WITNESSED. The result, the measured before/after and the
`§CPE_STICK_HOLD` decision are in §AIM_RETIRED_DONE immediately after this section — read that for
what SHIPPED. Everything below is the SPEC as it was written before the build, kept verbatim because
its line references and its quantified loss are what the build was checked against; the two
corrections the build found are: `§CPE_AIM_DEPTH_FREEZE` did NOT become a near-no-op (it is a
correction-window guard and is kept as-is), and item (d)'s "not measured" distribution was NOT
needed — the chord-identity measurement settles the question directly. No bake was run for any of
it (user directive 2026-09-02).**

### The change, in one line
`viewer/effects.js:8340-8368`: the aim chain reads `if (_pin) { …pin… } else { …§CPE_AIM_DEPTH… }`.
Retirement = **drop the `else` branch**. `_lx/_ly/_lz` then keep the path-follow value set at
`:8319-8324`, and the correction window at `:8383` still applies on top. Nothing else in `_beat3Pose`
moves. VERIFIED by reading the file 2026-09-02, not from memory.

### What survives — the user's own question, answered against the code
1. **Path-follow** (`_lookAhead`, `effects.js:8290-8294`, `_AH_FRAC = 0.15` arc-length look-ahead).
   Becomes the only automatic rule. This is the "follows path direction" the user asked for.
2. **`§CPE_AIM_PIN`** — `effects.js:6532-6559` + apply at `:8340-8345`. **Zero dependency on depth**;
   it is the `if` branch, depth is the `else`. The user's authored head-turns are untouched.
3. **The correction window** — `§CPE_CORR_BRANCH` (`_resolveCorrBranch` `:6644-6702`,
   `_cpeCorrDirBlend` `:6795-6808`) is **entirely unaffected**: it needs only *a* stable uncorrected
   direction, and path-follow is more stable than depth, not less. `§CPE_AIM_DEPTH_FREEZE`
   (`:6663-6669`, `:6779-6784`) becomes a near-no-op but **MUST BE KEPT** — it still guards any
   moving from-direction where a window overlaps a pinned zone or the `_openU` seam blend.
4. **The dive-in and the closing orbit** — untouched *by construction*, not by care: `_pinLookAtAt`,
   `_aimDepthApply` and `_cpeCorrectionAt` are called **only** from `_beat3Pose`. Beat 1
   (`:8011-8032`) runs no aim rule at all, and `_orbitPose` (`:7930-7971`) hard-wires the gaze to the
   pivot. `_cinemaPathPlan`'s beat framing is not edited.

### THE LOSS, QUANTIFIED — this is the part that needs a decision

**(a) The rule is NOT a dead-end rescue. It is a "something within 8 m" rule.** From the shipped
formula, `effects.js:7286-7288`:
`clearM = clamp(envelope × 0.06, 3, 8)` → **8.0 m on Hospital** (envelope 147 m), 3.0 m on Duplex.
`w = 1 − smoothstep(fwdClear / clearM)`, and `_cinemaSmoothstep(t) = t²(3−2t)` (`effects.js:5844`).
Evaluated exactly, on Hospital:

| forward clearance | authority `w` the rule takes over the gaze |
|---|---|
| 0.5 m (nose against the wall) | **0.989** |
| 1.0 m | 0.957 |
| 2.0 m | 0.844 |
| **4.0 m** | **0.500** |
| 6.0 m | 0.156 |
| 8.0 m + | 0.000 |

**Half the rule's authority is already spent at 4 m of clearance** — an ordinary hospital corridor,
not a dead end. So the genuine "nose against the wall" rescue is only the `fwdClear → 0` tail; the
rest is the deviation the user is objecting to. This is the strongest argument for retirement and it
comes from the formula alone.

**(b) On record (2026-09-01, do not re-derive): 28/91 probes fire, gaze turned 83.45°.** Live
re-sighting 2026-09-02 on the Hospital path: `§CPE_AIM_DEPTH e3=0.039 trigger=fwdClear
subject=(7.8,88.0,177.3) perpDeg=53.9 blend=0.82` — 0.82 authority within the first 4% of the walk.

**(c) A SECOND cost the earlier handoff did not name — `§CPE_STICK_HOLD` loses its aim half.**
`_holdBoostAt(w3)` (`effects.js:8687-8698`) exists **solely** to feed `_aimDepthApply`'s `boost`
argument (`:8303` → `:8364`), and its gate is `_aimDepthSeries.has`. Retire depth and a stick-hold
becomes a pure *rate dip with a frozen gaze* — precisely the defect §CPE_STICK_HOLD's second half was
built to fix. The motion half (`_holdBuild`/`_holdMap`, `:8595-8667`) is independent and survives.
**This must be decided at the same time, not discovered afterwards.**

**(d) Not measured, and deliberately not measured:** what FRACTION of the 28 firing probes are true
dead ends (`fwdClear` < ~1 m, w > 0.95) versus mild (4-8 m, w ≤ 0.5). That single distribution would
say exactly how much real rescue is lost. It is a read-only `A._probeAimDepth(e3)` sweep — **a probe,
not a bake** — and is the one bounded measurement worth taking if the user wants the residual closed.

### Cost of ownership if retired
Dead code to remove: `_aimForwardClear` `7241-53`, `_aimDepthWeight` `7274-90`, `_aimDepthSubject`
`7297-319`, `_aimDepthBuild` `7345-85`, `_aimDepthAt` `7386-97`, `_aimDepthApply` `7413-63`, the
constants `7213-34`, `_aimLatch`, `_aimBuildupCursorAt`, `A._probeAimDepth`, and the then-orphaned
`_aimGrid`/`_aimGridFrom` `7115-40` (**keep `_densPoints` `7053-65`** — §CPE_NOISE_LAW reads it).
Witnesses that go RED and must be retired or re-scoped: `tests/test_aim_depth.js`,
`tests/test_aim_density_zspan.js`, `witness_cpe_aim_depth_buildup.js`, `witness_cpe_hose.js` F1/F2,
`witness_cpe_corr_brush.js` G-FRZ-3 (self-degrades to VACUOUS, will not fail hard),
`witness_cpe_stick_hold.js`. Also required in the same PR: `EFFECTS_V` (`effects.js:5870-5887`, it
names §CPE_AIM_DEPTH twice), `sw.js CACHE_VERSION`, `viewer.html effects.js?v=`.
This **contradicts the standing recommendation** at `CINEMA_PATH_EDITOR.md:4311` ("§CPE_AIM_DEPTH —
recommendation: KEEP, but freeze inside a correction window"), which must be superseded by an
explicit ruling, not silently overridden.

### ~~⛔ THE ONE QUESTION FOR THE USER~~ — ANSWERED, and the item is BUILT. See §AIM_RETIRED_DONE.
> ~~Retire `§CPE_AIM_DEPTH` so the walk is pure path-follow (plus your pins and your correction
> windows)?~~ **The direction was already on record twice** (*"its best to leave alone its pointing
> along its path as more intuitive when pathing and user change of head at intended better angles is
> all needed, to stay simple and predictable"* / *"I prefer the previous… as it follows path
> direction"*), so parking this on a question was invented gating — see `AGENT_QUEUE.md`'s own
> re-classification note. Both named costs were handled, not merely accepted: (1) the dead-end
> rescue is gone, and the rule's own arithmetic shows that tail was the SMALL part of what it did;
> (2) `§CPE_STICK_HOLD`'s aim half is REMOVED with a stated replacement, not left dead — see below.

---

## §AIM_RETIRED_DONE — ✅ BUILT AND WITNESSED 2026-09-02. `§CPE_AIM_DEPTH` is retired.

**Branch `fix/retire-aim-depth`, bim-ootb. Witness `witness_cpe_aim_retire.js` — 7/7 on the
depth-OFF arm on every building measured, with the depth-ON arm run as the red control and FAILING
A-1 as designed. sw `CACHE_VERSION` v1125→v1126, `viewer.html effects.js?v=29→30`, eslint clean
(`./node_modules/.bin/eslint viewer modeller` exit 0). NO BAKE was run — every number below comes
from the product's own read-only pose hooks (`A._cpeBeat3GazeDebug` IS `_beat3Pose`), in headless
Chrome, with no frame rendered and no screenshot taken.**

### What shipped
`viewer/effects.js`: 450 lines removed, 114 added. `_beat3Pose`'s aim chain was
`if (_pin) {…} else {…§CPE_AIM_DEPTH…}` — the `else` is gone, so an unpinned stretch of the walk is
now plain path-follow. Removed outright (not flag-disabled): `_aimCells`/`_aimGridFrom`/`_aimGrid`
(§CPE_AIM_GRID), `_bkGuidEnds`/`_aimGuidEnds`/`_aimPlacedPoints`/`_aimBuildupCursorAt`
(§CPE_AIM_DEPTH_BUILDUP), the `_AIM_DEPTH_*` constants, `_aimForwardClear`, `_aimDepthWeight`,
`_aimDepthSubject`, `_aimLatch`, `_aimDepthSeries`/`_aimDepthBuild`/`_aimDepthAt`,
`A._probeAimDepth`, `_aimDepthApply`. `_densPoints`/`_densityAt`/`_noiseRadius` STAY — §CPE_NOISE_LAW
owns them. **KEPT deliberately: §CPE_AIM_DEPTH_FREEZE (#1598) and §CPE_CORR_BRANCH (#1597)** — both
REDUCE camera movement and neither is an aim rule; this was NOT done as a revert of 2026-09-01.

### ⚠ THE `§CPE_STICK_HOLD` DECISION, stated plainly — a held beat is now a PURE RATE DIP
`_holdBoostAt` existed **only** to feed `_aimDepthApply`'s `boost`, gated on `_aimDepthSeries.has`.
It is **removed, not left orphaned**, and **not replaced by a new rule**. Every candidate replacement
is a new automatic gaze rule needing new invented constants (how far to swing, toward what, over how
long) — which is exactly the class of thing being retired and what the PRIME RULE forbids. The
motion half (`_holdBuild`/`_holdMap`) is untouched and still integrates to exactly the authored
seconds. **The consequence, measured not asserted: across the plateau the gaze is CONSTANT**, because
every surviving gaze rule is indexed by `e3` (travel) and a hold stops travel. **The replacement is
`§CPE_AIM_PIN`** — pin the held band and the parked camera holds the authored angle for the authored
seconds; that is the "user change of head at intended better angles" the directive itself names.
`witness_cpe_stick_hold.js` G-SH-5 was **re-scoped to assert the frozen gaze** rather than quietly
passing a weaker test, and G-SH-6 was turned into the retirement's red control.

### MEASURED — deviation from the path, before and after, two arms per building
**The gated claim is the CHORD identity, not the tangent, and the distinction is measured, not
stylistic.** "Follows path direction" means the gaze IS the walk's own arc-length look-ahead
(`_lookAhead`, `_AH_FRAC = 0.15`, `_ahN = 240` — reconstructed exactly from those product constants).
Deviation from the *instantaneous* tangent is a different quantity and is **not** expected to fall
everywhere: where the walk doubles back inside the 15 % look-ahead window the chord legitimately
points across the turn, and those are precisely the short-forward-clearance pockets §CPE_AIM_DEPTH
used to fire in. Both numbers are printed; only the one that carries the claim is gated.

| building | arm | gaze vs look-ahead CHORD (the claim) | deviation from path TANGENT (info) |
|---|---|---|---|
| **Hospital — REAL stored path** (70.68 m walk) | depth-ON | max **90.657°**, mean **86.207°** | max 95.753°, mean 85.127° |
| | depth-OFF | max **0.000°**, mean **0.000°** | max **51.936°**, mean **6.930°** |
| **HHS_Office_Federated** (60.90 m walk) | depth-ON | max **150.075°**, mean **65.870°** | max 115.010°, mean 46.327° |
| | depth-OFF | max **0.000°**, mean **0.000°** | max 175.046°, mean 38.342° |
| **Duplex** (33.44 m walk) | depth-ON | max **163.114°**, mean **84.992°** | max 174.872°, mean 72.482° |
| | depth-OFF | max **0.000°**, mean **0.000°** | max 106.576°, mean 34.790° |

**The gaze is now EXACTLY the look-ahead chord — 0.000° on all three buildings** (301 judged samples
on Hospital, 451 on each of the others). Mean tangent deviation falls everywhere
(85.13→6.93, 46.33→38.34, 72.48→34.79). **On Hospital's real authored path the tangent MAX falls too**
(95.75→51.94); on the two SYNTHESIZED-band routes it rises, because a route derived from three
auto-picked waypoints doubles back inside the 15 % look-ahead window far more than an authored one.
Gating on the tangent max would have scored the change as a regression on those fixtures — noted so a
later session does not "fix" it. **Hospital is the row that answers the user's ask directly.**

⚠ **Only Hospital carries a real `cinema_path`.** HHS and Duplex have none, so the witness synthesizes
three bands from the plan's own flown waypoints and SAYS SO (`bandSrc=synthesized-from-plan-waypoints`)
— the route is the building's own, but it is not user-authored. Do not read those two rows as
stored-path evidence.

**✅ HOSPITAL, ON ITS REAL STORED PATH — MEASURED, and it is the headline.** ⚠ **RETRACTION: an
earlier revision of this section said this arm "did not complete" and named it as the one gap. That
was WRONG and is corrected here rather than quietly edited away.** The run had in fact completed; it
was read as a 0-byte log by a polling loop of mine while a second attempt had truncated the file, and
I reported the absence instead of re-checking. The commit message on bim-ootb #1620
("swiftshader cannot load Hospital") is overstated for the same reason and cannot be rewritten —
it is merged; **treat this paragraph as the correction of record.** What IS true from those attempts,
and worth keeping: `python3 -m http.server` genuinely cannot serve a Hospital page load (this repo's
own `scripts/_fast_static_server.js` header, §S78) — use the fast server, and `GPU_REAL=1` (the
`--gpu real` wiring) is now on the witness.

**⚠ One thing I deliberately do NOT claim, because the artifacts cannot settle it: which rasteriser
produced the depth-ON arm.** The depth-OFF arm was run under `GPU_REAL=1`; the ON log survived a
swiftshader attempt and a real-GPU attempt on the same output path and the witness records no
renderer string, so attribution is not recoverable. **It does not affect a single number below** —
the gaze chain is pure JS and `§CPE_AIM_DEPTH`'s only raycast went through three-mesh BVH on the CPU,
so the rasteriser cannot move these values. Naming an attempt I cannot verify is the same mistake as
the retraction above, one layer down; the fix is the same per-stage `§`-logging named at the end.

`buildings/HospitalAjaibPath.db`, `storedPath=true bands=3(db:cinema_path)`, 70.68 m walk, 82 s,
63,182 elements, `§CPE_AIM_DEPTH_SERIES active=65/65 maxBlend=0.94` on the depth-ON arm:

| Hospital (REAL stored path) | gaze vs look-ahead CHORD | deviation from path TANGENT |
|---|---|---|
| depth-ON | max **90.657°**, mean **86.207°** | max 95.753°, mean 85.127° |
| depth-OFF | max **0.000°**, mean **0.000°** | max **51.936°**, mean **6.930°** |

**On the real authored path BOTH numbers fall, max and mean — mean tangent deviation drops 12×,
85.127° → 6.930°.** That is the cleanest statement of the user's ask there is: on a path they
actually authored, the camera now points along it. The synthesized-band runs above show a rising
tangent MAX only because a route derived from three auto-picked waypoints doubles back inside the
15 % look-ahead window far more than an authored one does — so the Hospital row is evidence that the
rising-max effect is an artefact of the synthetic fixture, not a property of the change.
`§CPE_AIM_DEPTH` was active on **65/65** probes here with `maxBlend=0.94`: it governed essentially the
whole Hospital walk, which is exactly what the user was seeing.

Hospital's own gate row: **7/7 PASS on depth-OFF**, depth-ON 4 pass / 1 fail (A-1, by design).
Pin 0.000° in-zone over 234 samples with 1.71e-6° bleed; correction window **33.8 %** against the
authored 34 % with **0.0000°** outside it; dive **0.00 m / 1.48e-6°** and closing orbit
**0.00 m / 1.71e-6°** arm-to-arm, with only the walk beat moving (6.951 m / 90.537°).

**Still open, and it is an instrumentation defect not a measurement gap:** the witness prints only
after its single `page.evaluate` returns, so a long run shows a 0-byte log and cannot say where it
is — which is precisely what produced the wrong report above. **A witness that cannot report its own
progress or its own failure is not a witness (framework rule 4).** Next session: forward per-stage
progress through the `p.on('console')` hook that already exists.

### The four things that had to survive — each verified, none assumed
1. **Path-follow** is the only automatic rule (A-1, above).
2. **`§CPE_AIM_PIN`** (A-3): a pin on band 1 aims the gaze at its target to **0.000°** inside the
   band's Voronoi zone (268 HHS / 354 Duplex in-zone samples), and outside the zone the gaze is
   unchanged from the unpinned run to **1.7–1.9 × 10⁻⁶ deg** — no bleed.
3. **The authored correction window** (A-4): reach **33.3 %** (HHS) / **32.6 %** (Duplex) of the walk
   against an authored 34 % (ramp 4 / hold 12 / decay 18); peak authored deviation 41.6° / 76.8°;
   outside the window **0.0448° / 0.0000°** over 600+ samples. A-4b runs #1597's own witness-only
   `A._cpeCorrBranchOff` A/B in the same run — VACUOUS (the near-antipodal wrap is not exercised on
   these plans) with non-regression judged and **stated as scope-blind**, never passed off as proof.
4. **Dive-in and closing orbit** (A-5): sampled through the plan's own `poseAt` over the whole film
   and diffed arm-to-arm by the plan's own beat boundaries — **dive max position delta 0.00 m and
   gaze delta 1.5–1.7 × 10⁻⁶ deg; closing orbit identical to the same figures.** The WALK is the only
   beat that moved (1.6–1.9 m / 152–172°), which is what a non-NO-OP looks like.
   `_cinemaPathPlan`'s beat framing was not edited — confirmed by `git diff` hunk ranges as well.

### Housekeeping done in the same commit
- **DELETED** (they would have gone on PASSING against a rule that no longer exists — a green witness
  judging nothing is §CRISIS-class): `tests/test_aim_depth.js`, `tests/test_aim_density_zspan.js`
  (both pure-math replicas of the removed functions), `witness_cpe_aim_depth_buildup.js`.
- **RE-SCOPED, with the withdrawal PRINTED rather than silently skipped:** `witness_cpe_hose.js`
  F1/F2 (now: the gaze follows the path + the rule leaves no trace), `witness_cpe_corr_brush.js`
  G-FRZ-3 (prints `§CPE_AIM_FREEZE_DEADEND RETIRED`; G-FRZ-1/2/4 unaffected — the freeze is kept),
  `witness_cpe_stick_hold.js` G-SH-5/G-SH-6.
- **`§CPE_AIM_LATCH` renamed to `§CPE_BEAT3_END_DIR`** where it tags the surviving Beat 3→4 hand-off.
  The tag named the retired weight running-max; leaving it on an unrelated live mechanism would tell
  the next session the latch survived. The line is not suppressed — same measurement, accurate name.
- Stale comments corrected in `viewer/cinema_path_editor.js` and `viewer/time_machine.js`
  (`tmGuidEndTs` STAYS — `effects.js:4479`'s glow-lens gate is a live independent consumer, checked).
- `prompts/CINEMA_PATH_EDITOR.md` §CPE_AIM_DEPTH's standing "KEEP" recommendation is explicitly
  SUPERSEDED there, not silently overridden.

---

## §MEP_SYNTHETIC_PALETTE — better colour rules where the model has no material names

**User, 2026-09-02:** *"On Hospital or any building having zero usable material_name, can the
synthetic colouring be more MEP standard? Ie certain piping has diff coluring that is impressive as
i see in other apps movies… All i want is minimalist better coluring surface rules."*

**MEASURED, do not re-derive (2026-09-01):**
- Hospital `material_name` = **6,664 rows, 100% `≈`-prefixed synthetic colour approximations**
  (`≈ Grey`, `≈ Off-White`) — useless as material identity. Clinic 16,071, same shape. Terminal by
  contrast is **48,428/48,428 real names, 41 distinct, zero `≈`**.
- Because of this `§CPE_MATERIAL_KEY` (PR #1595) is a **proven NO-OP on Hospital** —
  `elements_changed=0`. It is NOT the cause of any Hospital appearance change.
- `TRIPLANAR_MAT` has only **three texture sets**: concrete, plaster, metal.

**So the lane is: a DISCIPLINE/SYSTEM-keyed colour rule for models with no usable names.** The data
that exists to key on is `discipline`, `ifc_class`, and element/system name text — not material.
Authored presentation is IN SCOPE (the user has ruled this twice), but the KEY must be extracted,
never the assignment invented per element.

**Prior art to reuse, not re-invent:** `§SUNGLASS` (`tools.js:614-775`) already has a 100-tick dial
with discipline bands (ticks 56-65) and, as of PR #1594, the rule that ordinal groupings get a ramp
and categorical groupings get distinct hues. An MEP-standard palette is a new categorical table in
that existing structure, not a new mechanism.

**Witness must show it is minimalist, not just colourful:** assert the number of distinct hues
actually used, per building, and that each maps to a named discipline/system class. A palette that
needs 40 hues to be readable has failed the "minimalist" requirement the user stated.

---

### ✅ BUILT 2026-09-02 — `§MEP_DISC_PALETTE`, bim-ootb PR #1604, witness `W-MEP-DISC-PALETTE`

**⚠ THE WORD "STANDARD" IS NOT CLAIMED, AND MUST NOT BE.** The user asked for "more MEP standard"
colouring "like other apps". **No MEP colour convention exists anywhere in the model data** —
Hospital's 6,664 `material_name` rows are 100% `≈`-prefixed synthetic, and there is **no
`IfcSystem`/`system` column on any shipped building DB** (grepped 2026-09-02). Any disc→colour
mapping is therefore an **AUTHORED CHOICE**, and it is labelled as such in the spec, in the code
comment, and in the witness header. Authoring presentation is in scope (the user has ruled so
twice); calling an authored palette an industry standard would be exactly the drift the PRIME RULE
exists to stop.

**What is extracted vs authored, stated separately:**
- **EXTRACTED (the key):** `elements_meta.discipline` — non-null on 100% of rows on all six shipped
  buildings (Hospital 6 discs, Clinic 6, JKR 7, LTU_AHouse 8, HHS 3, Duplex 5).
- **AUTHORED (the assignment):** the disc→colour map. **Not authored here** — it reuses
  `A.DISC_COLORS` (`viewer/config.js:43-49`) VERBATIM, the same 12-entry table the discipline HUD
  bars, bbox placeholders, `city.js` and `measure.js` already paint with. **The win is CONSISTENCY,
  not novelty:** a discipline now gets the same colour in the film that the viewer's own legend gives
  it. Every discipline present on every shipped building is already in that table, so the earthTone
  fallback is dead on all of them.

**Two defects fixed (both measured, not asserted):**
1. **COVERAGE.** `§SUNGLASS`'s discipline band groups on `mesh.userData.disc`, but streaming.js's
   InstancedMesh path never set it — so **every InstancedMesh fell into the `'Unknown'` bucket** and
   took one flat colour, on exactly the instance-heavy MEP geometry the user wants coloured. (PR
   #1594 corroborates without naming it: it reported "7 discs" on Clinic whose DB holds 6 — the 7th
   was `Unknown`.) ⚠ That branch buckets by GEOMETRY HASH ALONE, so instances are NOT guaranteed to
   share a discipline; the key is set **only when the set is verified uniform**, and mixed sets are
   left unkeyed and COUNTED rather than painted a discipline they do not all belong to.
2. **MINIMALISM + IDENTITY.** The band painted `earthTone[i % 10]` by ALPHABETIC rank, so a
   discipline's colour depended on which OTHER disciplines happened to be present, and never matched
   the viewer's own legend.

**MEASURED (Clinic, `viewer/tests/witness_mep_disc_palette.log`) — hues COUNTED, never eyeballed:**
- `§MEP_DISC_COVERAGE instancedMeshes uniformDisc=516 mixedDisc=1` → **516/517 InstancedMeshes now
  carry a real discipline key, where ALL 517 were `'Unknown'` before.** The `'Unknown'` bucket fell
  to **2 of 705** meshes. The 1 mixed set was correctly left unpainted.
- **MINIMALIST: `distinctHues=7 discs=7`** — one hue per group, zero collisions, against a
  `legendSize=12` ceiling. Nothing near the 40-hue soup the user pushed back on.
- **IDENTITY: 6/6 exact hex match** against `A.DISC_COLORS` (ACMV `#cc4444`, ARC `#4488ff`, ELEC
  `#cccc44`, MEP `#44cc44`, PLB `#8844cc`, STR `#44cccc`).
- **Hue count invariant across the whole band:** ticks 56-65 → `counts=[7,7,7,7,7,7,7,7,7,7]` (the
  `sub` parameter deepens saturation and darkens; it never re-hues).
- **RED CONTROL** — the witness recomputes the OLD earthTone cycle and asserts it does NOT reproduce
  the legend. Without that gate passing, none of the above could fail and the witness would be
  worthless.
- Self-failure paths built in: `VACUOUS` when a building yields no discipline group or no
  InstancedMesh, `INCONCLUSIVE` (never PASS) when streaming never completed or nothing was judged.

**Not verified by looking at anything.** No frame, no screenshot, no film was used to judge this
palette — every verdict above is a number read back off the real scene graph after calling the real
`A.updateAmbience(56..65)`. Whether the result is *attractive* is genuinely not settled by this
witness, and is not claimed to be.

---

## §NON_DIRECTIONAL_FILL — the term the user asked about, and the real cause of the darker MEP
**✅ DONE 2026-09-02 — this is an explanation to deliver, not work to do. Nothing to build. The
answer below is relayed to the user verbatim; the attribution correction at the end of this section
(darker MEP = v1119's light-floor cut, NOT `§CPE_MATERIAL_KEY`, which is a measured no-op on
Hospital) stands and must not be re-litigated.**

**User, 2026-09-02:** *"Thus can solve non directional fill which i am not sure what it means."**

**Plain answer to give them:** "non-directional fill" is light arriving from everywhere at once —
the ambient term plus the sky dome — as opposed to the sun, which arrives from one direction. It is
what stops the shadowed side of a wall from going pure black. **It is a LIGHTING quantity, not a
colour one, so better colour rules do not "solve" it** — but they do reduce how much the film has to
rely on lighting for readability, which is the useful half of the user's instinct.

**The darker MEP is v1119, not the material work.** `§WALL_SIDE_AND_LIGHT_FLOOR` (PR #1601) cut
**ambient 0.785 → 0.386 and hemisphere 1.257 → 0.617** (joint k=0.491) to make sun-facing and
away-facing walls differ. Measured effect: away-face irradiance 1.756 → 0.966. Interiors were
protected to a measured floor (retention mean 0.822 / p25 0.833) and the target contrast was
CLAMPED at that floor — a declared conflict, already documented. If the user wants MEP lighter, that
is a knob with a stated trade, not a bug.

---

## §OPEN — smaller items, each with its evidence

1. **PR #1602 is MERGED** (`d37eb109` on `origin/main`, 2026-09-01T12:36:55Z) — the CLI silent bake
   plus `§NIGHT_BAKE_POOL`. So `cli_silent_bake.js` is now at the bim-ootb repo root.
   **✅ CLOSED 2026-09-02 — the code claim is CONFIRMED by reading the file; the perf A/B is
   CANCELLED BY USER DIRECTIVE and is NOT outstanding work.**
   - **Gating, verified not assumed:** `viewer/tools.js:1712` is `if (A._maxqActive) {`, and
     `viewer/cinema_maxq.js:994` sets `A._maxqActive = true` for ANY bake. The interactive Alt+C
     bake therefore takes the same frozen-pool path as the headless one. `git diff
     d16646db..d37eb109 -- viewer/tools.js` is **52 insertions and nothing else** — the entire
     delta is the §NIGHT_BAKE_POOL block, so the two share one code path exactly.
   - **Confirmed firing in a real WINDOWED bake** (`--gpu headful`, a real Chrome window on the
     desktop — the Alt+C environment, not headless): `§CLI_BAKE_GL renderer="ANGLE (NVIDIA …
     RTX 4060 …, OpenGL 4.5.0)"` → `§NIGHT_BAKE_POOL created n=200`, and
     `§MAXQ_QUALITY frames=80 unconverged=0 hiddenPauses=0`. So the fix is live on the interactive
     path, measured, not predicted.
   - **⛔ NOT MEASURED, AND NOT TO BE:** the before/after per-frame delta on the windowed path. The
     pool-OFF arm was killed mid-run. **User directive 2026-09-02: "the silent bake worked well last
     night, so it need not be re-tested to that extent" — bakes are a proven, expensive facility and
     were being reached for as a routine measurement tool.** Do NOT restart it. This is closed as
     *declined*, not as blocked.
   - **⚠ Do NOT quote a cross-mode number as if it settled the perf question.** The windowed 80-frame
     arm read `§CLI_BAKE_FRAMES poses=80 meanMs=2711 p50Ms=1688 worstMs=10802`, versus 1,364 ms mean
     on the headless 80-frame arm and 1,264 ms on the full headless film. That comparison conflates
     headless-vs-windowed, a different film length, and a different session — it isolates NOTHING and
     must not be reported as "the Alt+C bake is slower". The only valid isolation would have been
     pool-ON vs pool-OFF in the same mode, which is the arm that was cancelled.
2. **`§CPE_PIE_HOLD` contradicts its own documentation.** The full Hospital bake logged
   `heldFrames=283/2027 (14%)`, but `CINEMA_PATH_EDITOR.md` asserts the hold will NOT fire on
   Hospital because Finisher ops run to the last day ("that is correct, not a bug"). One of the two
   is wrong. Settle it and fix whichever it is — an assertion in the file that measurement disagrees
   with is exactly what §0a warns about.
3. **Local vs OCI divergence — ✅ ANSWERED 2026-09-02, and the DB is NOT the cause.**
   User: *"indicate diff between local and OCI which should not be."* Measured by HTTP HEAD + a
   row-level diff of the actual objects (no bake, no browser):
   - **`buildings/HospitalAjaibPath.db` → HTTP 404 on OCI.** The path DB the films are baked from
     **was never uploaded**. There is no "OCI copy" of it to diverge.
   - **`Hospital_meta.db`: OCI 64,150 rows vs local 63,415 — the 735 extra rows are ALL
     `IfcOpeningElement`** (ARC 665 / STR 70), i.e. voids. **Every one of the 63,415 shared rows is
     byte-identical, including every `material_rgba` (0 differing rows).** Local is a strict subset:
     openings were pruned locally. **Element colour therefore cannot differ because of this DB** —
     which disproves the DB as the cause of the green-solar-panel report.
   - `Hospital_extracted.db`: OCI copy is dated **2026-06-05** and differs in size from local
     (263,307,264 vs 264,642,560) — stale, but not what the split-DB viewer path loads.
     `Hospital_meta.db`/`Hospital_geo.db` are served gzip (OCI_UPLOAD.md rule 8), so their
     `Content-Length` is the COMPRESSED size and must not be compared against a local raw size.
   - **THE ACTUAL DIVERGENCE IS THE VIEWER CODE, and it is enormous:** deployed
     `sw.js CACHE_VERSION` is **`v387` on `bim-ootb-live`** and **`v505` on `bim-ootb-dev`**, against
     **`v1120` on local `main`**. The OCI-served viewer is 700+ versions behind, so essentially every
     rendering change of the last months — including §WALL_SIDE_AND_LIGHT_FLOOR (v1119) and the whole
     material/palette line — is simply absent there. Anything "looks different on OCI" should be
     attributed here first, and the fix is a viewer deploy, not a DB upload.
4. **Saved-path workflow is SETTLED — do not re-open.** User, 2026-09-02: *"just saved a DB first
   with a path in it, and that is it. No need of passing argument. Simple. Agreed."* The DB's
   `cinema_path` table is the default source; `--plan` / `--override` exist but are not the path the
   user wants to use. The earlier confusion was that the DB held an OLD 3-band 81.9 s path while the
   user's elaborate one was only in browser IndexedDB, which a fresh headless profile cannot see.
5. **Three overlay specs are written and unstarted** — `prompts/INFORMATIVE_FILM_OVERLAYS.md`:
   `§FILM_UNSUPPORTED` (build first — detection already runs, no flicker risk),
   `§CLASH_QUALIFY` (gates the clash overlay; viewer clash is broad-phase R-tree only today),
   `§FILM_CLASH_IN_FRAME`, `§FILM_CRITICAL_PATH` (BLOCKED — `cpm_schedule.js` computes no float).
   **STATUS 2026-09-02: STILL UNSTARTED, and deliberately not begun this session — NOT abandoned.**
   `§FILM_UNSUPPORTED` is correctly ranked first (detection already ships warn-only:
   `§SUPPORT_UNCHECKED_SUMMARY n=177/63182` on Hospital, 236 on Terminal). Its own witness contract
   (`witness_film_unsupported.js`) requires asserting that the marked count over a WHOLE FILM equals
   that `n=`, and that each mark lands within one frame of the element's placement — i.e. **its
   acceptance test is a full bake**, which is exactly what the 2026-09-02 user directive rules out
   ("the silent bake worked well last night, it need not be re-tested to that extent"). Starting the
   feature without being able to run its gate would ship an unverified overlay onto the film path.
   **Next session: either (a) get an explicit go for ONE bake as that feature's acceptance run, or
   (b) re-scope the witness to assert the mark set against `§SUPPORT_UNCHECKED_SUMMARY` on a
   short `--frames` run instead of a full film.** (b) is likely sufficient and is the cheaper path.

---

## §MEASURED — facts from this session, do not re-derive

- **Full Hospital silent bake: 2,027 frames, 42.7 min, 1.27 s/frame, `unconverged=0`, zero timeouts.**
  `§CLI_BAKE_FFPROBE codec=h264 1854x962 frames=2027 fps=15/1 durationSec=135.133 bitrate=5337070`,
  90.2 MB. Before `§NIGHT_BAKE_POOL` the same run projected to ~9 h at 26.4 s/frame with 27% of
  frames captured UNCONVERGED.
- **Root cause of that 12x:** the in-frustum fixture census changes nearly every frame, every
  add/remove changes the scene's point-light COUNT, which is a shader DEFINE — so three.js recompiled
  every program. Count-stable frames fold in 0.8-1.3 s; count-changed frames cost 13-53 s.
- `§CLI_BAKE_POSECHECK frames=2027 maxErrVsOverridePlanM=0 (MATCH) meanDistVsDerivedPlanM=80.07` —
  the stored path provably drove the camera.
- Headless real GPU: `--use-angle=gl-egl` + `__EGL_VENDOR_LIBRARY_FILENAMES=10_nvidia.json`
  (wired as `--gpu real`). Plain headless = SwiftShader; vulkan = no context.
- WebCodecs **H.264 encode works headless** — no webm fallback needed.
- Merged 2026-09-01: #1586 #1587 #1588 #1590 #1592 #1594 #1595 #1597 #1598 #1599 #1601 (sw v1108→v1119).
- Docs deployed 2026-09-02 via `scripts/safe_gh_deploy.sh` (guard PASS, 290→290 files, canaries 200).
