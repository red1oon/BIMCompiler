# SPEC — grid_kinematics.js: guard against oblique-rotated elements (a dormant, not-yet-live gap)

```
# ⚠ DO NOT REMOVE
SCOPE: EXACTLY these 3 files, nothing else — modeller/grid_kinematics.js, modeller/bonsai_gridmove.js,
one new modeller/tests/witness_grid_rotation_guard.js. Sibling to prompts/GRID_KINEMATICS_SANDBOX_PROOF.md
(the 4-tier numeric sandbox, DONE+MERGED PR #718) and prompts/GRID_SMART_ELEMENT_SCOPE.md (class allowlist
+ grab-locality, DONE). This is a THIRD, narrower, independent hardening pass found while reviewing that
work — not a rescue, not urgent (see §0 "is this live" below). Pure node only, no browser/puppeteer/e2e
change. Read the log after every run. EXPLICIT NON-GOAL, do not drift toward it: this does NOT attempt to
make grid-drag SCALE geometrically correct for a rotated element (that needs bonsai_kernel_worker.js's fold
to do a local-axis stretch — rotate/scale/rotate-back — a separate, larger, NOT-yet-specced effort). This
spec is a GUARD ONLY: stop an obliquely-rotated element from being misclassified, nothing more.
```

## §0 — Why this exists, and the exact diagnosis (verified, not re-derivable-needed — read this, don't re-investigate it)

**The gap:** `grid_kinematics.js`'s `_findBestGrid` computes `lo = pos - halfExtent` / `hi = pos + halfExtent`
from an element's WORLD AABB and treats those as the element's real physical edges for
ATTACH/EDGE_LEFT/EDGE_RIGHT/SPAN classification. For an element rotated by a multiple of 90°, AABB edge ==
real edge, so this is correct (confirmed: `prompts/GRID_KINEMATICS_SANDBOX_PROOF.md` Tier 1's 98 hand-computed
assertions all use un-rotated or 90°-aligned fixtures and are all correct). For ANY other rotation angle, the
AABB's `lo`/`hi` only touch the true rotated shape at a single corner, not along a full edge — a grid line
can land "inside" the AABB (or exactly at `lo`/`hi`) without actually touching the real wall body at all. This
is provable by construction (standard OBB-vs-AABB geometry: a rotated rectangle's AABB always encloses MORE
area than the rectangle itself, except at 90°-multiples where they coincide) — do not re-derive this, just
build the fixture in §3 that demonstrates it numerically.

**Is this live today? NO — verified, not assumed.** A direct query of all 3 shipped sample buildings' real
`element_transforms` (Duplex 253 elements, SampleHouse 39, SampleCastle 3225) found **zero real structural
elements** (`IfcWall`/`IfcSlab`/`IfcColumn`/etc.) rotated off a 90°-multiple. Only 2 `IfcFurnishingElement`
rows in SampleHouse are (35–37°), and furniture is already excluded from grid governance by
`GRID_SMART_ELEMENT_SCOPE.md`'s class allowlist. **This is a hardening fix for a proven latent gap, not an
active bug** — treat it accordingly: correct and contained, not urgent, not a green-light to expand scope.

**⚠ A real cross-file conflict was found and resolved while writing this spec — read this before touching
any rotation-related code in this codebase, it will trip you otherwise:** an earlier draft of this task
wrongly assumed `rotation_y` was the yaw axis (contaminated by a DIFFERENT subsystem's log —
`bim-compiler/scripts/witness_rotation_convention.js`, part of the disc_walker/RosettaStone lane, which is
a SEPARATE codebase/schema from the Modeller). The Modeller's OWN authoritative sources all agree with each
other and say otherwise:
- `modeller/real_geometry.js`'s own documented ground truth (line ~40): `world = center + R(rotation_z)·rawVerts`.
- `modeller/arc_editable.js`'s `buildSeedOps` (§ARC-YAW-ONLY comment, ~line 135): "This ARC-seed path only
  ever fed rotation_z through place()'s single yaw... rotation_x/rotation_y were read nowhere... Real ARC
  content is upright in every building measured so far (0 non-zero rotation_x/rotation_y rows)."
- `prompts/CROSS_EDGES_REAL_AABB_FIX.md` (2026-07-04, unrelated fix, same underlying fact): "every building
  measured so far has `rotation_x=rotation_y=0`, so only yaw is implemented."
**`element_transforms.rotation_z` (radians) is the one true yaw axis in this schema.** `rotation_x`/
`rotation_y` are confirmed always 0 on real ARC content across all 3 buildings, and — separately — are
ALREADY dropped/audited upstream by `arc_editable.js`'s `§ARC-YAW-ONLY` counter (`tilted`) at ARC-seed time,
so a live mesh reaching `grid_kinematics.js` is structurally GUARANTEED upright (rotation_x=rotation_y=0
baked in) by the time it exists — **this guard therefore only ever needs to consider the yaw (Z) value, not
a full 3-axis tilt.** Do not add rotation_x/rotation_y handling to grid_kinematics.js — it would be dead code
for a case that cannot reach it, and would contradict this section if you did.

**Where the yaw value actually lives, reachable from `bonsai_gridmove.js`:** `arc_editable.js`'s
`buildSeedOps` (line ~229) commits it as **`parameters.placement.rot`, in DEGREES** (`rot: rz * 180 /
Math.PI` — a radians→degrees conversion happens AT THAT BOUNDARY, already). This lives in the exact same
`GEOM_INSERT` `kernel_ops` rows that `bonsai_gridmove.js`'s existing `_buildClassByFid()` already queries for
`ifc_class` (`SELECT id, parameters FROM kernel_ops WHERE op_type='GEOM_INSERT'`) — no new data source, no
new query pattern, just read one more field (`p.placement && p.placement.rot`) from the SAME already-parsed
JSON in that SAME existing loop. **⚠ UNITS: `placement.rot` is DEGREES. Convert to radians at the
`bonsai_gridmove.js` boundary before handing it to the engine** — do not let a degrees/radians mismatch slip
through silently; this exact bug class (radians treated as degrees) is what
`prompts/RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` already once found and fixed elsewhere in this codebase —
do not reintroduce its mirror image here.
**Symmetry with the existing class-allowlist precedent:** a synthetic/hand-authored wall (e.g.
`GEOM_EXTRUDE_POLY`, not `GEOM_INSERT`) has no row in this query at all — exactly like it already has no
`ifc_class` entry today (`_buildClassByFid()`'s documented "UNKNOWN, stays eligible" case). The new yaw
lookup must be symmetric: absent → `undefined` → the engine treats the element exactly as it does today
(unguarded, eligible). This is additive, not a behavior change for anything that isn't ARC-seeded.

## §1 — THE FIX (fully designed already — implement exactly this, do not redesign)

1. **`grid_kinematics.js`**: add ONE new OPTIONAL per-element field, `yawRad` (radians). It MUST default to
   `undefined` for every existing caller/fixture — purely additive, zero signature break.
2. In `_classifyElement` (or `_findBestGrid` — whichever is the single cleanest point; read both before
   picking), for the 'x' and 'z' axes only (NOT 'y' — 'y' is height, unaffected by in-plan yaw): if
   `elem.yawRad` is defined and its distance to the nearest multiple of `Math.PI/2` exceeds a tolerance of
   `0.01` radians (~0.57°, the same tolerance already used to empirically verify §0's "zero live cases"
   claim — reuse this exact number, it is not arbitrary), SKIP classification for that element on that axis
   entirely: return null from `_findBestGrid` for it, the SAME code path as "no grid found nearby" today.
   Do NOT throw. Do NOT add a new command type. Do NOT log an error (a quiet skip, matching how "not
   attached" already behaves silently) — a summary count in the existing per-drag console log is fine and
   welcome, a per-element log line is not (would spam a real building's console).
   **Verify, don't assume, before implementing:** confirm that an element skipped this way correctly falls
   through to the EXISTING Phase 3 `_classifyInterior`/`_bayProportionalDelta` path (bay-proportional by
   center position only — no extent/edge math, so it is already rotation-safe as-is). Read that code path
   first; if it turns out NOT to be safe for a yaw-skipped element for some reason not anticipated here, that
   is a **surprise — STOP per §2, do not patch around it.**
3. **`bonsai_gridmove.js`**: extend the existing `GEOM_INSERT` parameters read (same query as
   `_buildClassByFid()`, ideally the SAME pass over the SAME parsed JSON — do not add a second SQL query for
   this alone) to also produce a `fid -> yawRad` map, converting `placement.rot` (degrees) to radians. Wire
   this into `elementData()`'s per-element object as `yawRad`.

## §2 — GUARDRAILS (binding on whoever/whatever executes this — read before writing a line of code)

- **File allowlist is absolute:** `modeller/grid_kinematics.js`, `modeller/bonsai_gridmove.js`,
  `modeller/tests/witness_grid_rotation_guard.js`. Touching any other file is out of scope, full stop — not
  even a "quick adjacent fix."
- **No browser, no puppeteer, no e2e, no screenshot.** Pure node only — this is a Tier-1/Tier-2-style sandbox
  addition (see `GRID_KINEMATICS_SANDBOX_PROOF.md` §2), not a browser change.
- **No push, no PR, no merge, no deploy, no OCI, no touching any other git branch/worktree.** Commit locally
  on the working branch only, then stop.
- **Do not spawn a sub-agent, sub-task, or background workflow.** One bounded, direct pass, by whoever picks
  this file up. If the work feels like it needs to fan out into multiple independent investigations, that is
  itself a stop-and-report trigger below, not a reason to parallelize.
- **STOP AND REPORT — do not improvise past any of these, do not go looking for a workaround:**
  1. If §1 step 3's data lookup does NOT find a real, reachable `placement.rot` field on real `GEOM_INSERT`
     rows when actually queried against a real building (Duplex/SampleHouse/SampleCastle) — do not invent a
     new data source, do not add a new DB column, do not touch `arc_editable.js`. Stop, report exactly what
     was found instead, wait for a decision.
  2. If any of the 3 existing witnesses below regress even ONE assertion after the change — do not "fix"
     `grid_kinematics.js` further to force them green. Revert the change and report the conflict. A
     regression on the unrotated case is the one outcome this task must never produce, and forcing a witness
     green after a real regression is worse than reporting the regression honestly.
  3. If `_classifyInterior`'s bay-proportional path turns out NOT to be rotation-safe on inspection (§1 step
     2's "verify, don't assume" instruction) — stop, report the specific reason, do not attempt a fix to that
     path (it is out of this task's file allowlist).
  4. If implementing this reveals ANOTHER place in `grid_kinematics.js` or `bonsai_gridmove.js` that assumes
     axis-alignment and looks similarly wrong for a rotated element — do NOT fix it under this task. Name it
     in the final report as a candidate follow-up, nothing more. Scope creep here is exactly the failure mode
     this guardrail section exists to prevent.
  - In every stop case: commit nothing broken, leave the working tree in whatever state makes the surprise
    easiest to review (uncommitted diff is fine), and write a short, specific report — not a summary of
    everything explored, just the one fact that triggered the stop and the working tree's exact state.

## §3 — DELIVERABLE / DONE WHEN

- `modeller/grid_kinematics.js` and `modeller/bonsai_gridmove.js` edited per §1, nothing else touched.
- New `modeller/tests/witness_grid_rotation_guard.js` (pure node, same style as
  `modeller/tests/witness_grid_kinematics_pure.js` — hand-computed fixtures, exact assertions, numbers worked
  out in comments BEFORE the assertion, no screenshots). Must prove, with real numbers:
  - (a) a synthetic wall rotated exactly 90°/180°/270° classifies EXACTLY as an unrotated wall would — the
    critical regression bar, must be byte-identical behavior.
  - (b) a synthetic wall rotated 45° at a position that WOULD have produced a false ATTACH/EDGE/SPAN under
    the old (unguarded) math instead produces NO attach-map entry on that axis for that element (falls
    through to interior).
  - (c) an element with `yawRad` undefined (every existing fixture/caller) is completely unaffected.
- All of these re-run clean, tail output pasted into the final report, not just exit codes:
  - `node modeller/tests/witness_grid_kinematics_pure.js` — must stay 98/98
  - `node modeller/tests/witness_gridmove_adapter_fakes.js` — must stay 4/4
  - `node modeller/tests/witness_grid_kinematics_real_duplex.js` — must stay 8/8
  - `node modeller/tests/witness_grid_rotation_guard.js` — must be 100% green (new)
- Working tree committed locally on the pre-made branch (title/message left to whoever executes this) — NOT
  pushed, NOT PR'd (see §2).

## §4 — ✅ DONE (2026-07-10) — built + witnessed; MERGED 2026-07-10 as bim-ootb PR #720 (`67742b2`)

Built in `/tmp/wt-grid-rotation-guard` (branch `fix/grid-rotation-guard`, off fresh `origin/main`), commit
`0f8786d`. All 3 allowlisted files touched, nothing else (`viewer/grid_kinematics.js` confirmed untouched —
0 diff lines). Every claim below independently re-verified (logs re-run, diff re-read), not just trusted:
`W-GRID-ROTATION-GUARD` 33/33, `W-GRIDKINEMATICS-PURE` 98/98, `W-GRIDMOVE-ADAPTER-FAKES` 4/4,
`W-GRIDKINEMATICS-REAL-DUPLEX` 8/8. §1 step 3's data lookup succeeded: real `placement.rot` present on every
seed op across all 3 buildings (Duplex 253/253, SampleHouse 39/39, SampleCastle 3225/3225), zero oblique
structural elements on `main` today — §0's "dormant, not live" claim holds, confirmed against current data
AT THE TIME. **⚠ That data premise has since changed — see the CORRECTION block below, its own expiration
condition has now fired.** PR #720 merged directly into `origin/main` (`67742b2`) — verified via
`gh pr view 720` (`state: MERGED`) and `git log origin/main`, not just the PR author's report.

**⚠ CORRECTION TO §0, found during execution (own it, don't bury it) — a real expiration condition on the
"dormant" claim, named per this file's own §2 trigger 4, NOT fixed under this task:** §0 claimed a live mesh
reaching `grid_kinematics.js` is "structurally GUARANTEED upright" because tilt is "already dropped/audited
upstream by `arc_editable.js`'s §ARC-YAW-ONLY counter." That was an incomplete reading of `arc_editable.js` —
it has a SECOND, separately-active branch (`buildSeedOps`, ~line 212, `if (rx || ry) { ... }`, tagged
`§ARC-3AXIS`) that seeds GENUINELY tilted elements using a DIFFERENT placement shape entirely:
`{x,y,z,rotX,rotY,rotZRad}` (raw radians) instead of the yaw-only `{x,y,z,rot}` (degrees) this guard's
`bonsai_gridmove.js` lookup reads. §ARC-YAW-ONLY does not, in fact, drop tilt universally — it only describes
the code path taken when `rx` and `ry` are both zero.
- **Verified against THIS worktree's actual current `SampleCastle_extracted.db` (fresh off `origin/main`,
  not assumed from the code comment): 3225 elements, ZERO with `rotation_x`/`rotation_y` nonzero.** The
  `§ARC-3AXIS` comment's own citation ("497/3317 on modeller/SampleCastle_extracted.db") refers to a
  DIFFERENT, richer snapshot — almost certainly the unmerged `feat/embed-8-arc-buildings` branch's
  regenerated data (see `RESUME_DISC_WALKER_ENVELOPE_BOUND.md`), not what's on `main` today. So §0's dormancy
  claim is CONFIRMED TRUE for current shipped data, not stale — but its justification ("structurally
  guaranteed") was wrong; the real justification is "empirically zero, same caveat as the rest of §0."
- **Expiration condition, explicit:** if/when `feat/embed-8-arc-buildings` (or any future re-extraction with
  better geometry fidelity) merges to `main`, SampleCastle would gain ~497 genuinely-tilted elements that
  THIS guard's `placement.rot`-only lookup would never see (wrong field name, wrong shape, wrong units) — the
  guard would silently stay inert for them rather than protecting them, the exact failure mode this whole
  spec exists to prevent, just deferred rather than closed.
- **NOT fixed here, deliberately** — handling genuine 3-axis tilt needs real design work first (what does
  ATTACH/EDGE/SPAN even mean for a tilted element; does bay-proportional fallback still apply), not just
  reading one more field — matches this file's own explicit non-goal. **Follow-up trigger, not a standing
  task:** re-check this the next time `feat/embed-8-arc-buildings` (or an equivalent richer extraction) is
  about to merge — don't let this guard's dormancy assumption go stale silently when that happens.

**⚠ TRIGGERED, 2026-07-10 (Watchdog re-check) — the expiration condition above has now fired, not just a
future risk.** `feat/embed-8-arc-buildings` merged to `origin/main` (`6068fab`) BEFORE PR #720 (`67742b2`)
landed. Direct query against the CURRENT shipped `~/bim-ootb/modeller/SampleCastle_ARC.db` (post-merge,
`element_transforms` table): **293 elements now carry non-zero `rotation_x`/`rotation_y`** — up from the 0
this guard was authored and witnessed against. This means §0's "dormant, not live" claim is **no longer true
for current shipped data** — it was true only for the pre-embed-8 snapshot the guard's own witnesses ran
against. **Not yet determined:** whether any of these 293 tilted elements are actually reachable via
`_findBestGrid`'s ATTACH/EDGE/SPAN classification in the live grid-drag UI (if none are ever grid-dragged in
practice, the guard's inertness is harmless; if any are, the guard is now silently NOT protecting them, the
exact failure mode it exists to prevent). This is a concrete, bounded verification task — not a design
question — and should be picked up before treating PR #720/#721 as fully closed on the dormancy premise.

## §5 — ⚠ VERIFIED LIVE, 2026-07-10 — 3 of the 293 ARE reachable TODAY; guard confirmed inert on them; NOT fixed (report-only, per this file's own §2 rule 4)

Ran a real headless-Chrome puppeteer session (not code-reading) against the live shipped `SampleCastle_ARC.db`
scene, using `modeller/tests/e2e_harness.js`. Static-analysis correction first: the 60 tilted+structural-class
guids' live `kernel_ops.id` (the fid `bonsai_gridmove.js` actually keys on) is a sequential integer, reached
only via `window.__arcFidByGuid` — not the raw IFC guid. Re-verified with the correct key:

- `yawRadByFid` is confirmed `undefined` live for all 60 candidates (matches the static read: the §ARC-3AXIS
  `{rotX,rotY,rotZRad}` placement shape has no `.rot` field for `_buildInsertMaps()` to find).
- SampleCastle ships with a **pre-populated grid** on load (`xs=[0,4,8,12]`, `ys=[0,3,6]`, `active:false`) —
  not empty, not user-authored-on-demand. `_buildEngine()`'s classification runs against these real lines the
  moment grid-move is entered.
- **3 of the 60 DO get ATTACH classified in the CURRENT shipped scene, as shipped, no user setup needed:**
  fid 933 (`IfcWall`, guid `1AD2j$SNTAhBnN$NNYqXG4`) → `gx0`/x/ATTACH; fid 1291 (`IfcRailing`, guid
  `1bsL1PPGP0xxu5vLj_m07q`) → `gx3`/x/ATTACH; fid 2514 (`IfcWall`, guid `33iRUNUF92df$CutlVAdNZ`) → `gx0`/x/ATTACH.
- A 4th, fid 3055 (`IfcRailing`, guid `3ke5ra4iT7aPGg739tq0zL`), was confirmed reachable on-demand by placing a
  gridline at its live edge → `EDGE_RIGHT` fired immediately, `yawSkipCount=0` throughout — the guard never
  engages for any of these.
- **The reason this isn't visibly wrong yet, found by the same probe:** for every sampled element,
  `mesh.matrixWorld` is IDENTITY and `mesh.rotation` is `[0,0,0]` — the `rotation_x`/`rotation_y` values
  recorded in `element_transforms` are **not currently wired into the rendered/authored mesh transform at
  all**. `elementData()`'s AABB therefore exactly equals the true (unrotated, as-rendered) world size — the
  ATTACH hits above are geometrically CORRECT relative to what's on screen today. This is NOT the guard
  working; it's the guard being irrelevant because the tilt data is itself inert at the render layer, a
  separate, deeper gap than anything this spec scoped.

**Net answer to §4's open question: reachable = YES, not merely theoretical — 3 elements hit today, a 4th on
one gridline placement.** The guard is confirmed silently NOT protecting them (exactly the failure mode named
as the risk). It is currently harmless only because a DIFFERENT, unrelated piece of the pipeline (mesh
rendering) hasn't wired up `rotation_x`/`rotation_y` yet either — if that ever changes (or if `bboxX`/`bboxY`
in `elementData()` is ever computed from `element_transforms` directly instead of the live THREE mesh, which
would immediately reflect the un-rendered tilt), these exact elements would silently misclassify. **Not fixed
here — this is a fix decision, not an execution task:** does the guard need a second axis (X/Y roll/pitch, not
just Z-yaw) added, or is "rendering doesn't apply rotation_x/rotation_y yet" itself the thing to fix upstream
first? Bring back for a scoping decision before touching `grid_kinematics.js`/`bonsai_gridmove.js` again.

## §6 — ✅ DONE (2026-07-10) — §ROTATION-GUARD-3AXIS built + witnessed; NOT pushed, no PR (Watchdog's call)

Decision taken: extend the guard (roll/pitch axis), same additive/optional-field pattern as the original,
no design work (no attempt at a correct rotate-scale-rotate for X/Y tilt — that stays out of scope). Built in
`/tmp/wt-grid-tilt-guard` (branch `fix/grid-tilt-guard`, off fresh `origin/main` including PR #720/#721),
commit `98cf709`.

`grid_kinematics.js`: new OPTIONAL `tiltXRad`/`tiltYRad` per element. Unlike yaw, NOT exempted at 90°-multiples
— `_hasTilt()` checks distance from ZERO (a roll/pitch about a horizontal axis can swap which local dimension
faces "up" even at an exact 90°, unlike in-plane yaw which never moves the vertical axis). Same YAW_TOL=0.01,
same x/z-only scope as the existing yaw skip. New `getTiltSkipCount()`, attributed independently from
`getYawSkipCount()`. `bonsai_gridmove.js`: `_buildInsertMaps()` now also reads `placement.rotX`/`rotY` (already
radians) from the §ARC-3AXIS shape — the one field `yawRadByFid` never saw. `bonsai_kernel_worker.js`: the
SCALE fold REFUSES (shape left unchanged) when a command carries non-negligible `tiltXRad`/`tiltYRad`.

**Witness: W-GRID-TILT-GUARD 28/28** (new, `modeller/tests/witness_grid_tilt_guard.js`) — includes the exact
real SampleCastle fid=3055 shape/position as a hand-computed fixture, proving it classified before the fix and
falls to interior after. **Live re-verification against the real shipped `SampleCastle_ARC.db`** (throwaway
probe, not committed): fids 933/1291/2514/3055 — the 4 found reachable in §5 — now produce **zero** attach-map
hits, `tiltSkipCount=120` across the real scene (60 structural tilted elements × x/z axes, exact match). Zero
regression: every pre-existing witness re-run clean (`W-GRIDKINEMATICS-PURE` 98/98, `W-GRIDMOVE-ADAPTER-FAKES`
4/4, `W-GRIDKINEMATICS-REAL-DUPLEX` 8/8, `W-GRID-ROTATION-GUARD` 33/33, `W-GRIDMOVE-SMARTSCOPE` 6/6,
`W-GRID-INSERT` 6/6); `W-GRID-SCALE-YAW-HARDENING` stays at its **pre-existing** 19/21 (confirmed present
before this change too — same 2 failures, unrelated, not touched).

**Explicitly NOT fixed here, named per this file's own §2 rule 4 — do not pick these up under this task:**
1. The render-layer gap: `mesh.matrixWorld` stays IDENTITY for these tilted elements — `rotation_x`/`rotation_y`
   aren't wired into rendering at all yet (§5's other open question). Still open.
2. A separate, pre-existing axis-naming mismatch, newly visible while implementing this: the shared engine's
   x/z-only skip scope assumes `y`=height, but the modeller's own adapter uses `x`/`y` as its two REAL plan
   axes (`z` never has grid lines) — so a tilted (or obliquely-yawed) element's `y`-axis classification was
   NEVER covered by either guard, before or after this fix. Not introduced here — same scope as the original
   PR #720 — but worth a scoping look given this file's whole point is closing exactly this kind of gap.

Not pushed, no PR, no merge — stays local on `fix/grid-tilt-guard` until reviewed (Watchdog also owns
reconciling with the still-unpushed `fix/grid-rotation-guard`/`fix/grid-scale-yaw-hardening` branches).

## §7 — ✅ WATCHDOG VERIFIED, 2026-07-10 — all claims reproduced independently; PUSHED (not merged)

Independently re-ran every claim in §6, from scratch, not trusting the worker's report:
- **Diff of `98cf709` vs `origin/main`** — exactly 4 files touched (`grid_kinematics.js`, `bonsai_gridmove.js`,
  `bonsai_kernel_worker.js`, new `tests/witness_grid_tilt_guard.js`) — respects both this file's AND
  `GRID_ROTATED_SCALE_HARDENING.md`'s allowlists combined, nothing extra. `_hasTilt` (distance-from-zero, no
  90°-exemption) confirmed matches the described reasoning.
- **`node modeller/tests/witness_grid_tilt_guard.js`: 28/28**, read the full tail — G1 really is the real
  `fid=3055` shape/position (classifies EDGE_RIGHT without `tiltYRad`, falls to interior with it), W1-W3 really
  are real occt-wasm `generalTransform` calls (AABB byte-identical between the refused-tilt output and an
  unscaled fixture).
- **Live re-verification against the real, byte-identical (`md5sum`-confirmed) shipped
  `~/bim-ootb/modeller/SampleCastle_ARC.db`**: ran the worker's own uncommitted
  `probe_tilt_guard_closed.js` myself — fids 933/1291/2514/3055 all produce zero attach-map hits,
  `tiltSkipCount=120` exactly as claimed (60 tilted structural elements × x/z axes).
- **Zero-regression, reproduced exactly**: `W-GRIDKINEMATICS-PURE` 98/98, `W-GRIDMOVE-ADAPTER-FAKES` 4/4,
  `W-GRIDKINEMATICS-REAL-DUPLEX` 8/8, `W-GRID-ROTATION-GUARD` 33/33, `W-GRIDMOVE-SMARTSCOPE` 6/6,
  `W-GRID-INSERT` 6/6 — all clean. `W-GRID-SCALE-YAW-HARDENING` reproduced at **19/21, same 2 failures**
  (`B2 dragGrid produced commands for all 3 spanning walls` / `B2 fid1 command carries yawRad ≈ 0.5235988`).
  Confirmed pre-existing, not introduced: built a separate worktree off `98cf709^` (== `origin/main` ==
  `c32692e`, the tip before this fix — branch was exactly 1 commit ahead) and re-ran the SAME unmodified
  witness there — **identical 19/21, identical 2 failure messages**. Not this task's doing.

**§ITEM 5 — the axis-convention claim (item 7b below / §6 note 2): CONFIRMED REAL, a genuine open gap —
not a worker misunderstanding.** Read the actual code, not just the claim:
- `grid_kinematics.js` (line ~262, `_findBestGrid`) is written for the VIEWER's THREE.js convention where
  **Y = height** (its own comment: "Y = height in Three.js"; `dragGrid` explicitly special-cases `axis==='y'`
  as "no bay-proportional on Y axis"). The yaw/tilt skip only ever fires for `axis === 'x' || axis === 'z'` —
  correct under THAT convention (x/z are the two plan axes, y is vertical).
- But the **Modeller's own scene is Z-up**, documented explicitly in TWO places: `real_geometry.js` (line 4-6,
  "the Modeller's own coordinate convention (arc_editable.js/bonsai_library.js) is Z-up... unlike the Viewer's
  Y-up convention") and `modeller.html` (line 383-389, `camera.up.set(0, 0, 1)`, "ONE consistent Z-up
  convention for the whole 3D scene").
- `bonsai_grid.js`'s authoring grid (the actual source of every gridline `bonsai_gridmove.js` feeds the
  engine) confirms this concretely: `render()` draws every gridline as `THREE.Vector3(x, y, 0)` — X and Y are
  BOTH real plan coordinates, Z is fixed at 0 (its own header: "render it on the XY sketch plane"). And
  `_buildEngine()` in `bonsai_gridmove.js` (line ~151-152) only ever emits `axis:'x'` and `axis:'y'` grid
  lines from `G.xs`/`G.ys` — **`axis:'z'` is never populated in the Modeller, at all.**
- Net: in the Modeller's real usage, the guard's `axis === 'x' || axis === 'z'` skip protects one real plan
  axis (x) and one axis that structurally never has a grid line (z) — while the SECOND real plan axis the
  Modeller actually uses (y) is never checked. This is the SAME scope as PR #720 originally shipped, not
  introduced by `98cf709` — confirmed by reading `67742b2`'s original `_classifyElement` axis-loop, unchanged
  in this regard by any of the 3 commits in this saga.
- **Live exploitability, checked directly** (throwaway Watchdog probe against the real shipped
  `SampleCastle_ARC.db`, deleted after use, not committed): of the 60 real tilted/oblique-yawed structural
  elements, **0 currently land within ATTACH_TOL of SampleCastle's y-axis grid** (`gy0/gy1/gy2` at y=0,3,6) —
  so this specific building's current grid + current tilted-element positions do not exercise the gap today.
  This mirrors the EXACT "dormant, not live, but real" pattern this whole guard lineage has repeatedly found —
  it is not evidence the gap is fake, only that this snapshot doesn't happen to trip it. **Verdict: TRUE,
  confirmed real, a genuine pre-existing scope gap in PR #720/#721 (not this fix) — currently dormant on
  today's shipped data, same standing as every other dormancy claim in this file. Named, not fixed (per §2's
  own file-allowlist rule) — a candidate follow-up spec, not a standing task.**

**Action taken:** pushed `fix/grid-tilt-guard` to `origin` (bim-ootb) at `98cf709` — no PR opened, no merge,
per this project's worker-commits/Watchdog-pushes convention.

## §8 — ✅ DONE (2026-07-10) — §AXIS-SCOPE fix built + witnessed; NOT pushed (Watchdog's call)

Decision taken on §7's item 5 finding: extend the guard's skip condition to also cover axis 'y' (the
Modeller's real second plan axis), keep the existing 'z' term untouched (harmless dead code, not worth the
risk of removing). Built on the SAME branch (`fix/grid-tilt-guard`, continuing from the pushed `98cf709`),
new commit `c485560`.

`grid_kinematics.js`: `_classifyElement`'s skip condition changed from `axis==='x'||axis==='z'` to
`axis==='x'||axis==='y'||axis==='z'` — one added term, nothing else touched in the check itself. Added a
`§AXIS-SCOPE` comment explaining the Y-up-vs-Z-up discrepancy in place. Also added a documentation-only note
at the `WALL_HEIGHT_SCALE` cascade site (still hardcodes `axis:'y'` as "vertical") recording that this
assumption is wrong for a Z-up caller if that cascade ever fires — confirmed it currently CANNOT fire for the
Modeller (`isRoof` is always false: `bonsai_gridmove.js`'s `elementData()` hardcodes `ifcClass:'IfcWall'` for
every element it emits). Not fixed — named as a further deferred follow-up, needs its own design pass if the
Modeller ever gains real roof/ifcClass support.

**`bonsai_kernel_worker.js`: independently verified, NO code change needed** — item 2 of the task. Traced
where axis:'y' `SCALE` commands actually originate for the Modeller: the general EDGE/ATTACH-driven
`_computeScaleCommand` (reachable, real) passes through whatever axis the classification happened on — so a
real axis:'y' `SCALE` command IS a genuine horizontal stretch for the Modeller, exactly the case needing the
rotate-scale-rotate-back guard. Checked the worker's existing composed-matrix branch
(`oblique && (c.axis === 'x' || c.axis === 'y')`) via `git show c32692e` (the untouched PR #721 commit): it
ALREADY included 'y' from day one, correctly (its own inline comment says "yaw is about Z in this worker's
frame" — already Z-up-correct). My own tilt-refusal check (added in `98cf709`) already applies unconditionally
regardless of axis. The ONLY stale claim was `GRID_ROTATED_SCALE_HARDENING.md`'s own §0 prose describing the
SEPARATE `WALL_HEIGHT_SCALE` cascade origin's hardcoded `axis:'y'` as "vertical, yaw-safe" — that specific
origin is confirmed dead code for the Modeller (same `isRoof`-always-false reason above), so no live bug there
either. Net: zero code changes needed in `bonsai_kernel_worker.js` for this task.

**Witness:** `W-GRID-ROTATION-GUARD` **34/34** (R6 rewritten to assert the CORRECTED behavior — an oblique
element no longer ATTACHes on y either — plus the `caseB()` skip-count assertions corrected from 2 to 3 for
x+y+z). `W-GRID-TILT-GUARD` **29/29** (G1/G4/G5 updated the same way for tilt). **Live re-verification against
the real shipped `SampleCastle_ARC.db`** (throwaway probe, not committed): `tiltSkipCount` 120 → 180 (60 tilted
structural elements × x/y/z, up from x/z only), **zero** of the 60 tilted elements get a y-axis attach-map hit
post-fix, and **212** ordinary (non-tilted) real elements still legitimately attach on y — zero regression on
real content. Matches §7's own live-check finding (0/60 tilted elements land on a y-grid line today) — today's
real-world effect of this fix is protective-but-currently-inert, the same "real but dormant" pattern as every
prior finding in this lineage.

**Bonus, unplanned fix — corrects an earlier claim in this file's own §6:** §6 described
`W-GRID-SCALE-YAW-HARDENING`'s pre-existing 19/21 (2 failures) as "confirmed present before this change too...
unrelated, not touched." That was true for `98cf709` alone, but this `c485560` fix (built on top of it)
**resolves both failures as a side effect** — now 21/21. Root cause, traced: an obliquely-yawed wall's
y-position was incorrectly ATTACHing on y (ungated before this fix), marking it "governed" and silently
excluding it from Phase 3's bay-proportional interior fallback, so dragging its x-axis gridline produced ZERO
command for it at all. It now correctly falls through to a bay-proportional TRANSLATE. Not a coincidence — the
SAME axis-scope bug this task fixes was the actual cause of that "unrelated" pre-existing failure.

**Full regression, 206/206 clean:** `W-GRIDKINEMATICS-PURE` 98/98, `W-GRIDMOVE-ADAPTER-FAKES` 4/4,
`W-GRIDKINEMATICS-REAL-DUPLEX` 8/8, `W-GRID-ROTATION-GUARD` 34/34, `W-GRID-SCALE-YAW-HARDENING` 21/21,
`W-GRIDMOVE-SMARTSCOPE` 6/6, `W-GRID-INSERT` 6/6, `W-GRID-TILT-GUARD` 29/29.

Not pushed, no PR, no merge — stays local on `fix/grid-tilt-guard` (commit `c485560`, on top of the already-
pushed `98cf709`) until the Watchdog reviews.

## §9 — ✅ WATCHDOG VERIFIED, 2026-07-10 — `c485560` reproduced independently on every claim; PUSHED (not merged)

Read the full `c485560` diff directly (not the commit message) before running anything. Confirmed the diff is
exactly 3 files: `grid_kinematics.js`'s skip-condition line (`'x'||'z'` → `'x'||'y'||'z'`) + two comments
(the skip site and a documentation-only note at the dead `WALL_HEIGHT_SCALE` site), and the two test files.
`bonsai_kernel_worker.js` has **zero diff** in this commit — not even listed in `git show --stat`. The "no code
change needed" claim is literally true, not just asserted.

**Claim 2 (`bonsai_kernel_worker.js` needs no fix) — independently re-derived, not trusted from the commit
message.** Read the SCALE branch myself: line `else if (oblique && (c.axis === 'x' || c.axis === 'y')) {` routes
into the composed rotate→scale→rotate-back matrix. Ran `git show c32692e -- modeller/bonsai_kernel_worker.js`
myself (the original PR #721 merge, untouched since) — that exact line, with that exact axis pairing, was
present in the very first version of this branch, comment and all ("yaw is about Z in this worker's frame").
Nothing was added or backdated. Verdict: correct, no fix needed here — confirmed with my own eyes on the
original commit, not the worker's citation of it.

**Claim 3 (R6/G1/G4/G5 test-assertion flips) — reasoned from first principles, verdict: legitimate correction,
not test-tampering.** Chain of independently-checked facts: (a) `modeller.html` line 449's own comment states
"geometry is Z-up but camera.up stays Y" — confirmed Z-up is real, not asserted. (b) `bonsai_gridmove.js` lines
151-152 show its `_buildEngine()` only ever pushes grid lines with `axis:'x'` (from `G.xs`) or `axis:'y'` (from
`G.ys`) — `axis:'z'` is never emitted, confirmed by grep, not by trusting the comment. (c) Given (a)+(b), 'z' in
this file's own convention is the vertical/height axis (also confirmed by `_hasTilt`'s own comment at line 717:
"a pure Z-yaw never moves the vertical axis" — internally consistent with z=height here), and 'x'/'y' are the
two real horizontal plan axes. (d) The rotation-mixing formula for an oblique Z-yaw is symmetric in x and y by
construction — see `bonsai_kernel_worker.js`'s own composed-matrix math (`l00 = sx·cos²+sy·sin²`, `l11 =
sx·sin²+sy·cos²`, symmetric under swapping the two in-plan axes). There is nothing in that formula, or in the
AABB-vs-OBB misclassification argument this file's own R3-R5 already prove for x, that privileges x over y — a
45°-yawed wall's AABB-derived half-extent on y is exactly as unreliable as its half-extent on x, for the
identical reason. So a y-axis ATTACH/EDGE/SPAN classification on an obliquely-yawed element is exactly as
"false" as the x-axis case R3-R5 already established, and R6/G1/G4/G5 asserting the OLD ("y survives") behavior
was encoding the bug, not documenting a real invariant. The flip to "y no longer survives" is the correct fix
being reflected in its own test, not a convenient rewrite to force green. I checked for an asymmetry that might
make x's proof not transfer to y and found none — the guard's only real axis-count subtlety is that 'z' (this
file's actual height axis) never has a grid line to test against, which is exactly why 'z' stays in the
condition as harmless dead code rather than getting its own witness case.

**Claim 4 (live SampleCastle_ARC.db numbers) — reproduced myself, not re-quoted.** Ran the worker's own
uncommitted `tests/probe_axis_scope_closed.js` unmodified: got `tiltSkipCount:180`, `yHitsForGuarded:0`,
`yHitsOrdinary:212`, `guardedCount:60` — exact match to the claim. Then swapped in the pre-fix `98cf709` version
of `grid_kinematics.js` only (via `git show 98cf709:modeller/grid_kinematics.js`) and re-ran the same probe
unmodified: got `tiltSkipCount:120` — confirming the 120→180 delta is real and attributable to exactly this
code change, not fixture drift.

**Claim 5 (the "bonus" `W-GRID-SCALE-YAW-HARDENING` 19/21→21/21 fix) — traced the causal mechanism through the
actual code, not accepted on the strength of a passing count.** Reproduced 19/21 on the pre-fix `grid_kinematics.js`
myself, isolated the 2 failures to `witness_grid_scale_yaw_hardening.js`'s `B2` block (`fid1` missing from the
drag-command output, and the follow-on check on its undefined command). Read `B2`'s fixture: `fid=1` is the
30°-yawed wall (oblique), its mesh has world y-center 0.1, and the fixture's grid has `ys:[0,3]` — so
`|0.1−0|=0.1` is inside `ATTACH_TOL(0.5)` of grid line `gy0=0`. Traced `dragGrid`/`_classifyElement`/
`_classifyInterior` line by line: pre-fix, since y wasn't in the skip set, `fid1` got a spurious y-axis ATTACH
(marking it `_governed`) despite the oblique yaw already correctly skipping its x-axis classification; being
`_governed` (via an axis irrelevant to the x-grid drag under test) excludes it from `_classifyInterior`'s
bay-proportional fallback in Phase 3 — so `dragGrid('gx1', …)` produced literally zero command for `fid1`. Ran
the post-fix code and confirmed `fid1` now gets `{"a":"TRANSLATE","yaw":0.523...}` — a real bay-proportional
command, mechanically traced end to end, not a coincidental pass. §6's "pre-existing, unrelated" characterization
is genuinely corrected, not just re-labeled.

**Claim 6 (206/206 full regression):** ran all 8 witness files myself, read the log tails (not exit codes),
grepped each for any non-"0 FAIL" failure marker — zero found. Sums to 206/206 exactly as claimed.

**Verdict: every claim holds. Pushed `fix/grid-tilt-guard` (c485560) to origin/bim-ootb — fast-forward from the
already-pushed `98cf709`. No PR opened, no merge to main, per instruction.**
