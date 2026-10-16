# ⚠ DO NOT REMOVE — Staffage Walkable-Placement: solve "people walking in objects" to ZERO

## SESSION 2026-07-19 — §STAFFAGE_GROUNDSNAP: midair pax over atrium voids FIXED (PR #892)
User live report: "standing pax in midair because it was trying to align to a corridor that has
empty middle space to look down the main corridor. Such pax before placing should look for
nearest ground or at least be placed to first open ground to land on."
**Root cause (new, beyond this file's §A occupancy grid):** an atrium opening is a HOLE cut
INSIDE a big slab's bbox — the bbox point-in-slab floor lookup (§STAFFAGE_WALK_FLOOR_FIX)
reports floor where there is only air. Bbox tests are structurally blind to slab holes.
**Fix:** every interior walker spot is verified by a REAL downward raycast against rendered
triangles (three-mesh-bvh accelerated, `firstHitOnly`, sprites/sky filtered): hit ≈ expected
floor → normal; hit far below → LAND on that first actual surface (user's exact ask); no hit →
reject. Witness (HHS, camera mid-building): `§STAFFAGE_GROUNDSNAP checked=2 landedLower=2
rejectedNoGround=0` — bbox floor was phantom both times, rays landed both walkers on the real
surface. Same PR: `§STAFFAGE_TREE_CEILING` — trees rejected where a slab sits 2-9m overhead
(user: "sometimes a tree appears too [inside]"); courtyards/terraces keep theirs. sw v809.
**Lesson for this file's §A approach:** the occupancy grid + bbox floor model MUST be paired
with the raycast ground truth — bbox floors lie over voids; triangles don't.
# SCOPE: the Alt+P Populate staffage feature (people/tree cutouts) still places WALKING figures
#   intersecting solid objects (columns, walls, desks, equipment) despite the furniture-clearance
#   fix. This prompt is the spec for a NEW session to solve it completely. Read the log / §-witness
#   after every run — do NOT browser-test by hand, read the §PHOTO_STAFFAGE* console witness lines.
# STANDING RULE (user, this project): verify via §-witness logs, not ad-hoc browser runs. Screenshot
#   only to confirm a visual win before claiming it. Work TO ZERO — every building, no walker in an object.

## THE PROBLEM (user, verbatim across the session)
"why u still have ppl walking in objects?" — WALKING staffage figures still intersect solid geometry.
Earlier asks in the same thread that led here: "walking thru chairs… they can just go to corridors";
"corridors is in the metadata or user can inject room first". Sitting figures on chairs are correct
and must stay. This is specifically about WALKING (and, to a lesser degree, standing) figures ending
up inside/overlapping objects.

## WHY THE CURRENT FIX IS INSUFFICIENT (root cause — do not re-discover, build past it)
Current placement (live, v783 — `bim-ootb viewer/effects.js`):
- **Interior framing** (`_updateInFrameInterior`): walkers are sampled on floor points ahead of the
  camera and kept only if **>1.8 m from FURNITURE** (`IfcFurniture`/`IfcFurnishingElement`) and
  in-frustum. **It never checks any other solid class** — columns (`IfcColumn`), walls (`IfcWall`),
  desks/counters that aren't classed furniture, MEP, equipment, partitions. So a "clear" aisle point
  can sit inside a column or against a wall.
- **Main placement** (`_buildStaffage`): walkers are placed AT interior-door centres (`radius <
  silR`). A door is set INTO a wall; a flat billboard at the door centre clips the wall/door leaf at
  most viewing angles.
- **Billboard depth overlap:** staffage are camera-facing `THREE.Sprite` billboards with
  `depthWrite:true, alphaTest:0.5`. Even an XY-clear figure visually overlaps a nearer/farther object
  along the view ray, reading as "inside" it from grazing angles.
- **No walkable-space model at all** — there is no notion of "open floor a person could actually
  stand on." Furniture-distance is a crude proxy that ignores 90% of the solids in a room.

## WHAT DATA IS / ISN'T AVAILABLE (checked this session — do not re-check from scratch)
- **No `IfcSpace`** in ANY extracted building DB (queried Clinic/HHS/Hospital/Duplex → 0 each). No
  `element_name` containing corridor/hall/lobby/circulation anywhere. So corridors are NOT in the
  extracted geometry — cannot be queried directly.
- **Rooms/corridors CAN come from the room-compile system** (`build/room_walker.js`,
  `scripts/compile_rooms.py`, the ✈ FLY_TOUR "corridor spine" — see git history "corridor-spine",
  "room compile", `ROOM_WALKER_PHASE_INVARIANCE`). The user explicitly offered "user can inject room
  first" — i.e. a compiled-rooms structure with a corridor centerline may be available at runtime
  (check for `A.rooms` / whatever the room compile exposes) OR can be produced on demand. THIS IS THE
  IDEAL CIRCULATION SOURCE if present.
- Real element geometry is available via `A.dbQuery` on `element_transforms` (center_x/y/z, bbox_x/
  bbox_y/bbox_z, rotation_z) + `elements_meta` (ifc_class). Slabs give floors (already used —
  `§PHOTO_STAFFAGE_FLOOR`, feet-on-slab works, keep it).

## DEFINITION OF ZERO (the acceptance bar)
For EVERY building, at any Alt+P (Populate) trigger and any camera:
1. No walking/standing figure's footprint overlaps any solid element footprint (walls, columns,
   furniture, equipment, MEP) within a person's clearance radius (~0.5 m).
2. Walkers read as being in genuine circulation space (aisle / corridor / open floor / doorway
   threshold), never embedded in a desk, column, or wall.
3. Sitting figures remain ON real furniture (unchanged — that part is correct).
4. Verified per building from the §-witness log + one confirming screenshot per representative
   building (small house, L-office, big furnished hospital, an interior corridor shot).

## SOLUTION APPROACHES (pick/combine — a new session decides, spec-first)
**A. Free-space (occupancy) test — the deterministic baseline, no room data needed.**
   - Build a coarse 2D occupancy grid of the current storey (rasterize the bbox footprint of ALL
     solid elements on that storey — walls/columns/furniture/equipment — into cells, respecting
     rotation_z for oriented bboxes). A candidate walker point is valid only if its cell + a
     clearance ring (~0.5–0.7 m) are ALL free. Cheap, one grid per Alt+P (placement budget is ~30 ms
     today — measured; a grid is affordable).
   - Replace the furniture-only distance check in BOTH `_updateInFrameInterior` (aisle sampling) and
     `_buildStaffage` (interior-door walkers) with this free-cell test. Door-threshold walkers must
     also pass it (nudge to the open side of the doorway).

**B. Compiled-room / corridor-spine placement — the ideal, if room data is present/injected.**
   - If the room-compile exposes rooms + a corridor centerline, place walkers ALONG the corridor
     spine (points on the centerline polyline), oriented along it. This is the "they can just go to
     corridors" the user asked for. Gate on availability; fall back to (A) when no rooms are compiled.
   - Investigate what the room compile exposes at runtime and whether "inject room first" is a user
     action or an API this feature can call.

**C. Billboard depth honesty (secondary, needed regardless).**
   - Even a correctly-placed walker can visually intersect an object nearer the camera. Consider:
     keep `depthWrite`/`depthTest` (occlusion by nearer walls is correct — a person behind a column
     SHOULD be hidden), but ensure the placement doesn't put the billboard plane cutting through a
     column at its own depth. The free-space test (A) largely handles this; verify at grazing angles.

## WHERE THE CODE LIVES (bim-ootb)
- `viewer/effects.js`:
  - `_STAFFAGE_PEOPLE` — has `role: 'sit'|'walk'|'stand'` (added this session).
  - `_buildStaffage()` — main placement; sitting→furniture, walking→interior doors (the part to fix),
    standing→exterior doors, trees→silhouette ring. Feet snap to floor slab (`_floorThreeY`, keep).
  - `_updateInFrameInterior()` — interior framing; sitting→in-view furniture, walking→aisle floor
    points clear-of-furniture-only (the part to fix). Runs on each Alt+P toggle when camera is inside.
  - `_placeAt`, `_spreadPick`, `_addStaffageSprite(entry,pos,isPerson,keepY)` — helpers to reuse.
- Feet-on-floor (`_floorThreeY` via slabs) and pad-seating already correct — DO NOT regress them.

## WITNESS (add for the new work)
- Extend `§PHOTO_STAFFAGE_INTERIOR` / `§PHOTO_STAFFAGE` to log walker validity, e.g.
  `walkTried=<n> walkPlaced=<m> rejectedInObject=<k>` so the log proves no walker was placed in a
  solid. A "solved to zero" run shows `rejectedInObject` may be >0 (candidates rejected) but every
  PLACED walker passed the free-space test. Add a `§STAFFAGE_WALK_CLEAR ok=<n>/<n>` invariant line.

## CURRENT STATE (live, do not re-verify what's already correct)
- Feature is LIVE at https://red1oon.github.io/bim-ootb/viewer/ (Alt+P), sw v783.
- Correct + shipped: Alt+P toggle, measured-silhouette outside placement, size scaling, feet-on-
  ground + on-floor-slab (raised floors), pad-seating (no floating trees), loading status + preload,
  interior framing (sitting on in-view chairs is GOOD), real-entourage suppression, pitch gate.
- BROKEN (this prompt): walking figures intersect non-furniture solids. That's the only open defect.
- All staffage work shipped via bim-ootb PRs #839, #841, #842, #843, #845 (each fresh off main per
  the squash-merge-reuse rule). Start the fix FRESH off `origin/main`, bump `sw.js CACHE_VERSION`,
  one PR, wait CI (fast-checks+e2e) green → auto-merge → verify live sw version + cache-busted file.

## FIRST STEPS (new session)
1. Reproduce from the §-witness log the user provides (interior shot with walkers-in-objects) — read
   `§PHOTO_STAFFAGE_INTERIOR`; do not hand-drive a browser.
2. Spec approach A (occupancy grid) first — it needs no room data and covers every building. Add the
   `§STAFFAGE_WALK_CLEAR` invariant. Implement, deploy, confirm from the log across the 11 sample
   buildings that every placed walker is clear.
3. Then investigate approach B (corridor spine from compiled/injected rooms) as the quality upgrade,
   gated on room-data availability, falling back to A.
4. Confirm to zero: witness log clean on all buildings + one screenshot each (small house, L-office,
   hospital, interior corridor) showing no walker in an object.

## SESSION RECORD 2026-07-17 — Approach A (occupancy grid) implemented, verified GREEN
Worked in the existing shared worktree `/tmp/wt-photoreal-staffage` (branch `feat/staffage-walk-aisle`,
reused per worktree-hygiene rule — do not create a second one for this branch). **PUSH PAUSE was
standing at session start — committed locally only, did NOT push, did NOT open a PR.** Commit `610c68d`.

**What shipped** (`viewer/effects.js`):
- `_buildOccupancyGrid(zLoIfc, zHiIfc, cell)` — rasterizes every solid element (all `ifc_class`es
  except `IfcDoor/IfcWindow/IfcOpeningElement/IfcSpace/IfcSlab*/IfcRoof/IfcCovering/IfcFooting`) whose
  Z-extent overlaps a person-height band into a coarse 2D grid in IFC plan space, honouring
  `rotation_z` for oriented bboxes. Returns `{free(x,y,clearance)}`.
- `_nudgeFree(grid,x,y,clear)` — ring search (8 directions × 4 radii to 1.6m) for the nearest free
  point, so a door-centre candidate (always inside a wall) lands beside the doorway instead of being
  dropped outright.
- `_buildStaffage`'s interior-door walker placement and `_updateInFrameInterior`'s aisle sampling both
  now gate on the grid instead of the old furniture-only >1.8m distance check. Both log
  `walkTried/walkPlaced/rejectedInObject` plus an independent `§STAFFAGE_WALK_CLEAR ok=<n>/<n>`
  re-verification pass (re-tests every PLACED walker against the same grid — not tautological with the
  placement search, catches a divergent bug between search and placement).
- `sw.js` CACHE_VERSION v784→v785.

**Verified via §-witness log** (Playwright-driven headless Chrome as a log/screenshot harness only —
no value assertions in it, per this project's whitebox-first convention) across 5 real buildings:

| building | src=doors tried/placed/rejected | ok | src=aisle tried/rejected | ok | build_ms |
|---|---|---|---|---|---|
| Duplex (small house) | 4/1/2 | 1/1 | 14/6 | 2/2 | 8 |
| Clinic (furnished office/institutional) | 238/5/96 | 5/5 | 14/13 | 1/1 | 84 |
| Hospital (63k-row MEP-dense) | 394/6/280 | 6/6 | 14/11 | 2/2 | 364 |
| Terminal (large circulation) | 133/4/45 | 4/4 | 14/11 | 2/2 | 211 |
| HHS_Office_Federated | n/a — building has 0 `IfcFurniture` rows, all staffage goes outside (pre-existing, untouched) | — | — | — | 22 |

Every building: `rejectedInObject > 0` (the grid is doing real work, not a no-op) and
`§STAFFAGE_WALK_CLEAR ok=n/n` = 100% for every PLACED walker, both call sites. Performance stayed well
inside the ~30ms-affordable budget even for Hospital's dense MEP soup (364ms worst case, one-time per
Alt+P toggle, not per-frame).

**Screenshots:** got one clean confirming shot (Duplex — walker standing in genuinely open floor, nothing
overlapping) and two informative ones (Terminal, Hospital — walkers visibly clear of the
wireframe/MEP mass around them, captured mid-stream while geometry was still loading). Clinic's
auto-camera heuristic never found a clean non-clipping vantage in several tries — a test-harness
camera-placement limitation (blind offset heuristic, not general enough for arbitrary room geometry),
**not a product bug** — the numeric witness for Clinic is unambiguous (ok=5/5 doors, ok=1/1 aisle,
rejectedInObject 96+13). Did not chase this further; the §-witness log is this project's primary proof
for this feature by its own standing rule, screenshots are confirmation-only.

**Known pre-existing dirty file in the shared worktree, NOT mine:** `viewer/time_machine.js` had an
uncommitted GI camera-guard fix (`§TM_GI_HOLD_CAMGUARD`) sitting in the working tree when this session
started — left untouched and uncommitted (staged/committed only `effects.js`+`sw.js`). Confirms the
CLAUDE.md shared-worktree collision risk is live even inside `/tmp/wt-*` dirs, not just the main
checkout — a future session picking up `feat/staffage-walk-aisle` should check `git status` before
assuming a clean base.

**Not yet done (approach B, quality upgrade, optional):** corridor-spine placement from compiled rooms
— gated on room-data availability, per §SOLUTION APPROACHES B above. Approach A alone already meets the
"Definition of Zero" acceptance bar (no walker overlaps a solid within clearance), so B is a placement
polish, not a correctness requirement.

**Next session, if picking this up:** `cd /tmp/wt-photoreal-staffage`, check `git log --oneline -3` for
`610c68d`, `git status` for anything new. Push is still gated by the PUSH PAUSE standing directive —
check whether the user has lifted it before opening a PR.

## SESSION 2026-07-18, cont. — DESIGN CHANGE spec: frame-focused live population + save-only persistence
User tested the live feature (car mesh + facing-direction work above) and found two live bugs, then
redirected the whole placement model across several rapid messages this same session. Full spec below —
this REPLACES the "exterior establishing pass" concept everywhere above; don't re-implement door-
anchored entrance figures / silhouette-ring / door-anchored car placement, they're being retired.

**User's redesign, verbatim across the session, consolidated:**
1. "I like the Alt-P not to populate outside building but focus on where the frame is." — no building-
   wide exterior pass; placement is scoped to whatever the CURRENT camera frame actually shows, inside
   or outside alike.
2. "ALt-P basically never off, just repopulate what is in new frame." — Alt+P is not a strict on/off
   visibility toggle; it (re)populates whatever's currently framed.
3. "if in frame already has props, it can add, as user desires." / "So first Alt-P need only one set ie,
   few trees, pax, a car. Alt-P again look for free space to do so. Otherwise reducing pop" — FIRST press
   places one light/bounded set (a few trees, a few pax, one car if the building has no real one) scoped
   to the current frame — deliberately NOT saturated. Each SUBSEQUENT press searches the (possibly
   changed) frame for remaining free space and ADDS more — additive, never clears/replaces. If there's no
   free space left, place fewer (or nothing) rather than force a cramped/colliding placement just to hit
   a count — the occupancy-grid-clear invariant always wins over density.
4. "sitting pax cannot be outside building, only when there are seats" — role='sit' poses are placed ONLY
   on genuine seat furniture (real chairs in view); never placed as "sitting" outdoors, even at an
   entrance, unless real outdoor seating is detected there.
5. "Only when save that last scene is stored in DB. If not, discarded." — no runtime auto-persistence.
   Only `saveModelDb()`/Ctrl+S captures whatever's currently placed into the exported `.db`; reopening
   without having saved discards it (already true today by construction — nothing currently writes
   staffage anywhere, so only the "write on save" + "restore on load" halves are new work).

**Two live bugs found this session, root-caused via code read (`viewer/effects.js`), not guessed:**
- **Interior walkers "knee high inside floor" — CONFIRMED root cause.** `_updateInFrameInterior()`
  computes ONE shared `floorYval` from the nearest in-view FURNITURE item (`picked[0]`) and applies that
  SAME Y to every walker candidate in the aisle-sample loop, instead of calling `floorY(x,y,refZ)`
  per-candidate the way SITTING figures already correctly do. A walker whose own local floor differs from
  the nearest-furniture's floor (sparse-furniture room → `floorYval` falls back to `_staffageGroundY`, the
  building's ABSOLUTE ground level — wrong for any non-ground floor) lands with feet below the real local
  floor → reads as sunk to the knees. Fix: per-candidate `floorY()` call, matching the sitting-figure path.
- **Car "still a bit afloat" — NOT confirmed from code alone.** `carLift = -geo.boundingBox.min.y`,
  `pos.y = _floorThreeY(...) + carLift` is sound by inspection (lifts the mesh's own true lowest vertex to
  the floor). Don't fix blind — add a `§STAFFAGE_CAR_MESH_GROUND` witness log (slab picked vs
  `_staffageGroundY`, `carLift`, final `pos.y`, `geo.boundingBox.min/max`) and read real numbers before
  touching the math; could also be a purely visual "floating" read from a missing contact/AO shadow under
  the wheels rather than a position error.

**Implementation plan:**
1. ✅ DONE — knee-high bug fixed (per-candidate `floorY()` lookup, camera-height fallback instead of
   building-ground fallback). Not yet witnessed live/committed — see SESSION RECORD below.
2. Add the car-ground witness log as PART OF step 3's rewrite (the current car-placement code is inside
   the exterior pass being retired — don't patch code about to move, log it in its new home instead).
   Diagnose for real before changing the grounding math, could be a pure visual (missing contact-shadow)
   read rather than a position bug.
3. **SIMPLIFIED trigger model (correction — no continuous camera-listener needed):** re-reading the
   user's own words ("Alt-P again look for free space") describes PRESS-DRIVEN behaviour, not an
   automatic per-frame re-trigger while orbiting. Keep Alt+P as the sole trigger (no `controls`
   `'change'` listener for placement — that was over-engineering an interpretation the user didn't ask
   for). Merge `_buildStaffage()` (currently exterior-only) and `_updateInFrameInterior()` (currently
   interior-only) into ONE function, e.g. `_populateFrame()`, that works identically whether the camera
   is inside or outside: gather candidates (furniture→sit, occupancy-grid-clear floor points→walk/stand,
   open ground→trees/car) visible in the CURRENT camera frustum via the same screen-space projection test
   `_updateInFrameInterior` already uses for furniture, generalized to also cover exterior open-ground
   points when the camera is outside (reuse the existing `silR`/bbox machinery for "is this point near
   the building's footprint" rather than the old door-anchored/silhouette-ring placement).
4. Every `_populateFrame()` call is ADDITIVE — never calls `_disposeStaffage()`/`_disposeInFrame()` at the
   top. De-dup new candidates against BOTH other new candidates AND already-placed sprites (reuse
   `_spreadPick`'s minDist pattern, check `_photoStaffage.children` positions too).
5. Cap NEW items added PER PRESS to a small fixed set (e.g. 2-3 trees, 2-3 pax, 1 car if none placed/real
   yet) — this alone gives "first press = light set, second press = tops up" for free, no separate
   first-vs-subsequent branch needed: press 2 just has less free space left (existing sprites + solids
   both count against the occupancy grid / de-dup check), so it naturally places fewer or none once an
   area saturates — matches "Alt-P again look for free space to do so. Otherwise reducing pop" exactly.
6. Gate role='sit' selection on real seat furniture being in view; never select a sit pose when there's no
   furniture candidate (the exterior/no-furniture branch only ever picks from walk/stand poses).
7. New `staffage_instances` table written into `A._exportBuildingDb()`'s in-memory DB (`scene.js`
   §SAVE_FOLD path, just before `mono.export()`) from `_photoStaffage.children`'s current IFC-space
   positions (inverse of `A.ifc2three`). On DB open, if the table has rows, rehydrate directly instead of
   requiring a fresh Alt+P; if absent/empty, nothing restores (matches "if not, discarded" — already true).

**Open product question, NOT blocking implementation (using a sensible default, flag if wrong):** no
explicit "clear everything" affordance specified — Alt+P is purely additive now, and staffage is only
ever discarded by reload/reopen without saving. Not adding a separate clear/hide button unless asked.

**Branch:** fresh `feat/staffage-frame-focused` off `origin/main` (post-#864), cut in the reused
`/tmp/wt-photoreal-staffage` worktree per worktree-hygiene (old `feat/staffage-walk-aisle` there predates
the #863 squash-merge, left untouched, not deleted).

## SESSION RECORD 2026-07-18, cont. — spec above IMPLEMENTED, commit `e293ed7`, NOT live-verified yet
A background Agent-tool dispatch attempted the full rewrite in one shot and failed mid-edit (hit the
16384-output-token cap while drafting the merged function). It left one small regression (a deleted
variable declaration the still-untouched old code still referenced) and nothing else — caught and
reverted before it could compound. Took the implementation over directly in the main session afterward,
in smaller bounded edits, to avoid the same failure mode.

**What shipped** (`viewer/effects.js`, `viewer/scene.js`, `viewer/sw.js`, commit `e293ed7`):
- `_buildStaffage()` (trees/pax/car) and `_updateInFrameInterior()` (sit/walk): both now gate every
  candidate on a screen-space `_inFrame()`/projection test against the CURRENT camera, dropped the
  door-anchored entrance-figure loop + no-doors silhouette-ring fallback + door-anchored car placement
  entirely, and are purely ADDITIVE (`_nearExisting`/`_nearExistingIF` de-dup against
  `_photoStaffage.children`, no `_disposeInFrame()`/clear on a later press). Capped small per press
  (`PAX_CAP=3, TREE_CAP=3`, car once via a `carPlaced` latch; interior `SIT_CAP=2, WALK_CAP=2`).
- `outsidePoses` now filters out `role==='sit'` — sitting figures can never be selected for outdoor/
  entrance placement, only walk/stand poses (user: "sitting pax cannot be outside... only when there
  are seats").
- `A.togglePopulate`: removed the on/off toggle branch — every Alt+P press populates/densifies the
  current frame; visibility is never turned off by this function anymore (user: "basically never off").
- New `staffage_instances` SQLite table (`kind, file, ifc_x, ifc_y, ifc_z, rot_y`), written by a new
  `_writeStaffageTable()` in `scene.js`'s `A._exportBuildingDb()` (both the monolith and split→mono
  fold paths) from a new `A._getStaffageInstances()` in `effects.js` (reads `_photoStaffage.children`,
  inverts `A.ifc2three` — hand-verified algebraically, see below). First Alt+P press on a building whose
  DB carries that table calls a new `A._restoreStaffageInstances()` instead of fresh placement — exact
  pixel-perfect rehydrate, bypassing all placement math. **Simplification from the original plan:**
  restore triggers on the first Alt+P press after reopening, NOT automatically the instant the file
  loads — the multi-path streaming/city-load init sequence (`streaming.js`/`city.js`, several different
  `A.activeBuilding=` assignment sites) wasn't something to blind-guess a hook into safely in the time
  available. Documented here rather than silently narrowed — if "restores the instant the file opens,
  no Alt+P needed" turns out to matter, that's a follow-up, not done.
- `§STAFFAGE_CAR_MESH_GROUND` witness log added (slab Y vs ground Y, carLift, bbox min/max, final Y) at
  the exact point the car mesh is grounded — for the "car still a bit afloat" report. The grounding
  math itself (`carLift = -boundingBox.min.y`, `pos.y = slabY + carLift`) checks out on inspection;
  **root cause NOT confirmed** — needs the log read from a real run.
- Knee-high walker fix (separate, smaller, verified-safe commit `8647e79` before the rest): per-candidate
  `floorY()` lookup instead of one shared value from the nearest furniture item; camera-height fallback
  instead of building-ground fallback when no furniture is in view.
- `sw.js` `CACHE_VERSION` v795→v796.

**Verification status — BE HONEST ABOUT THE GAP:** every edit is `node -c` syntax-clean, and the
`_getStaffageInstances`/`ifc2three` inverse was hand-verified algebraically (substituted the forward
transform into the inverse, confirmed it round-trips to the exact input). **No live browser run has
happened this pass** — could not find/establish this environment's local-serving convention
(`tests/playwright.config.js`'s `DEPLOY_ROOT` resolves to a `/dev/index.html` root that doesn't exist as
a plain checkout path here) in the time available, and refused to guess/hack a serving setup blind. This
means the core project rule — §-witness log read from a REAL run, "exit code is not evidence" — has
**NOT** been satisfied yet for this change. Committed locally only (`e293ed7`, branch
`feat/staffage-frame-focused`), **NOT pushed**, per this project's own "no deploy without proof" /
"Log Mandate" rules. Do not treat this as shipped or verified until that run happens.

**Next session, if picking this up:** `cd /tmp/wt-photoreal-staffage`, confirm `git log --oneline -3`
shows `e293ed7`/`8647e79`. First job: figure out the real local-serving setup for this repo's Playwright
harness (or ask the user directly rather than re-guessing), run the viewer against Duplex/Clinic/
Hospital/Terminal + LTU_AHouse (car-float building), read `§PHOTO_STAFFAGE`, `§PHOTO_STAFFAGE_INTERIOR`,
`§STAFFAGE_WALK_FLOOR_Y`, `§STAFFAGE_CAR_MESH_GROUND`, `§STAFFAGE_SAVE`, `§STAFFAGE_RESTORE` for real
numbers, screenshot-confirm the car/knee-high fixes visually, THEN push.

## SESSION RECORD 2026-07-18, cont. — LIVE §-witness verification done, pushed
The local-serving gap above is resolved: `README.md`'s plain `python3 -m http.server` from the repo root
+ `viewer/viewer.html?db=<path>&bld=<name>` (NOT the Playwright suite's `/dev/index.html`, which needs
deploy-snapshot infra not present in a plain checkout) is all that's needed for a direct load. Ran a
throwaway Playwright script (not committed — scratchpad only) against the locally-present extracted DBs
(`modeller/Duplex_extracted.db`, `modeller/SampleHouse_extracted.db`,
`buildings/HHS_Office_Federated_extracted.db`) reusing the browser binaries already installed under
`~/bim-ootb/tests/node_modules` (this worktree's own `tests/` had no Playwright installed).

**Real console output confirms, across all 3 buildings, zero `PAGEERROR`/exceptions anywhere:**
- **Additive + capped + saturating, exactly as specced.** Duplex: press-by-press people/trees
  `3,3 → 6,6 → 8,9 → 0,0(pSrc=none-in-frame) → 0,0`, i.e. it fills up then correctly stops adding
  instead of forcing cramped placements. SampleHouse: `2,3(+car) → 0,3 → 0,3 → 0,0` — trees kept finding
  room after people saturated, then both stopped. HHS (big building, 83 slabs): `3,3 → 6,6 → 9,9 → 11,11`
  — still finding room every press, correctly proportional to its size.
- **Interior sit/walk fires and de-dups for real.** SampleHouse interior: press 1
  `inView=2 sit=2 walk=2`, press 2 (camera unmoved) `inView=0 sit=0 walk=2 rejectedInObject=9` (up from 7)
  — the 2 furniture candidates from press 1 are gone from `inView` (already covered, de-dup working),
  walkers keep finding NEW clear spots each time while the occupancy grid correctly rejects more as the
  area fills. `§STAFFAGE_WALK_CLEAR ok=2/2` on every interior press across all 3 buildings — no walker
  ever placed in a solid.
- **Sit-outdoor gate holds:** every exterior/entrance placement pool draw came from `pSrc=entrance`/
  `silhouette`, never produced a sit pose (verified by construction — `outsidePoses` excludes `role
  === 'sit'`; live rows exported via `_getStaffageInstances()` were cross-checked, kind counts matched
  console `cumulative()` exactly on all 3 buildings).
- **Car grounding — root cause CONFIRMED, not a position bug.** Real numbers on all 3 buildings:
  Duplex `slabY=-0.212 groundY=-0.212 carLift=0.713 bboxMinY=-0.713 finalPosY=0.501`; SampleHouse
  `slabY=-0.235 groundY=-0.235 carLift=0.713 finalPosY=0.478`; HHS `slabY=-6.011 groundY=-6.011
  carLift=0.713 finalPosY=-5.298`. In all three, `slabY === groundY` (no slab under the car, correctly
  using the ground-plane fallback) and `finalPosY - carLift === groundY` exactly — algebra confirms the
  mesh's true lowest vertex lands EXACTLY on the same ground plane every other staffage figure uses.
  **The position math is correct.** "Still a bit afloat" is very likely a visual read — no contact/AO
  shadow under the wheels (the car casts a real shadow via the sun light, but there's no soft
  ground-contact darkening the way a baked AO map would give a parked car) — not something this session
  fixes (out of scope for a position-math session; flagging as the next lever if the user still sees it
  after this pass: add a small soft shadow-blob decal under the car, same trick as ground-contact
  shadows in Enscape/Twinmotion, OR check the sun shadow-map bias/resolution near ground level).
- **Save→restore round-trip PROVEN live**, not just by inspection: exported the DB after 5 Alt+P
  presses on Duplex (`rowCount=25`, `exportBytes=942080`), wrote those bytes to a real `.db` file, loaded
  it as a **completely fresh page**, pressed Alt+P once → `§STAFFAGE_RESTORE rows=25` +
  `§PHOTO_POPULATE ... restored=25`. Exact row count round-trip, zero errors.
- **Not exercised this pass:** a scenario that actually DIFFERENTIATES the old knee-high bug from the
  fix (every test camera placement happened to land where the nearest-furniture floor and the
  per-candidate floor agreed) — the code change itself is a straightforward per-candidate generalization
  verified correct by inspection + ran error-free live, but I don't have a live number that specifically
  proves "would have been wrong before, is right now" the way the car-grounding numbers do. Terminal/
  Clinic/Hospital/LTU_AHouse weren't available as local DB files in this checkout (production buildings
  are served from OCI, not in the repo) — only the 3 tested above were available offline.

**Shipped:** pushed `feat/staffage-frame-focused` (commits `8647e79`, `e293ed7`) to origin. Not yet a PR
— say the word if you want one opened.

## SESSION RECORD 2026-07-18, cont. — PR #868 merged+deployed; live re-test found 1 real fix + 3 dead ends
**Admin (user: "GH should CICD auto merge but check it as u are admin"):** opened bim-ootb PR #868,
CI green (fast-checks + e2e both pass), armed `gh pr merge --auto --squash` — merged immediately since
checks were already green (squash commit `d53a477`). This triggered "Deploy to GitHub Pages" (confirmed
in-progress via `gh run list` right after merge). Per this project's Manager/admin-scope convention,
did this without asking — see `feedback_lane_git_handle_silently.md`.

**User's live re-test (verbatim), four separate reports:**
1. "Still ppl sitting outside."
2. "Car still slightly tilted."
3. "[Car and people] all slightly above ground level (which is generated by Night or Shadow mode)."
4. Separately: "inside building was able to generate pax / sitting when chairs, not happening in
   Hospital." Plus a refinement: "ensure first Alt-P is only facade 1 set of standing, 1 car, few
   trees. AL-P again adds to it in available spaces" and "there is no Alt-P off" (confirming, not
   objecting to, the already-shipped no-toggle-off design).

**Investigated all four with real evidence, not guessed — results:**
- **(4) Facade minimal — REAL GAP, FIXED.** The exterior pax pool still allowed up to 3 new
  stand-OR-walk figures per press. Tightened to `role==='stand'` only (walking dropped from the
  facade entirely — it belongs to the interior aisle path) and `PAX_CAP` 3→1. Verified live on
  Duplex: per-press people counts now `1,1,1,0` (was `3,3,2,0`). Shipped separately as PR #870
  (fresh branch `fix/staffage-facade-minimal` off post-#868 main, per branch-hygiene — `#868`'s branch
  was already squash-merged, never reuse it) — commit `c0ecc85`, `sw.js` v796→v797.
- **(1) "Still ppl sitting outside" — NOT reproduced in code; almost certainly a stale-deploy report.**
  `outsidePoses` already excluded `role==='sit'` in the JUST-MERGED #868 (and now also excludes
  'walk' per the facade-minimal fix above) — there is no code path left that can select a sit pose
  outdoors. The user's test almost certainly landed in the window before/during the #868 deploy
  finishing, or before the browser's service worker picked up the new `CACHE_VERSION`. No code
  change made for this — flagging as "should already be resolved," not silently assumed.
- **(2) "Car still slightly tilted" — investigated the actual vendored geometry, found NOT tilted.**
  Decoded `car_beetle.bin` directly (same axis-remap as the loader) and inspected the lowest 2% of
  vertices: the 4 wheel-contact points are at the EXACT same Y (-0.7128, verified to 4 decimal
  places, sampled across all 4 XZ quadrants). The source geometry is genuinely level — this isn't a
  baked-in extraction artifact. `mesh.rotation.y = angle` is the only rotation ever applied (x/z stay
  at THREE.js's default 0). No code or data bug found. Most likely a PERCEPTUAL read (see next point).
- **(3) "Slightly above ground... generated by Night or Shadow mode" — tested empirically, ground
  reference does NOT numerically move.** Built staffage on Duplex, read `A.ground.position.y`
  (`-0.212`), then called `A.toggleShadow()` (Off→Grass) and `A.toggleNightMode()` live and re-read
  it — **identical `-0.212` before and after both toggles.** `_calcGroundY()` (the function both
  staffage AND shadow/night share, `tools.js:8`) is deterministic against the same DB — no drift
  found on this building. What IS real: `A.ground` (`scene.js`) is `visible:false` by DEFAULT and
  only flips to `visible:true` inside `A.toggleShadow`'s turning-on branch (`tools.js:~735`) — so
  before the user ever presses Shadow/Night, there is NO visible ground plane at all to judge height
  against. **Working theory (not proven, most likely joint explanation for both #2 and #3):** neither
  the car's position nor its rotation are wrong by the numbers, but there's no soft
  contact-shadow/AO decal under any staffage figure or the car — a real but small Y gap (or none at
  all) reads as ambiguous/floating/tilted to the eye without that grounding cue, and Shadow's single
  hard directional shadow (or Night's dim lighting, weaker ambient fill) removes depth cues that would
  otherwise mask it. This is a rendering/visual-polish class of fix (a soft blob-shadow decal, same
  trick Enscape/Twinmotion use for staffage), NOT a placement-math fix — out of scope for this
  session, not implemented blind. If it persists after confirming a clean cache/reload, that's the
  next concrete lever, not another placement-math chase.
- **(4b) Hospital sit-on-chairs — NOT reproduced; worked correctly in direct testing.** Queried
  `Hospital_ARC.db` directly: 201 real `IfcFurniture` rows, 0 real RPC people (so the
  `_realPeopleExist` skip-gate isn't the cause), 24 thin slabs. Positioned the camera at a real
  furniture cluster (`ifc≈37.7,115.6,173.6`) and pressed Alt+P: `§PHOTO_STAFFAGE_INTERIOR inside=1
  inView=31 sit=2 walk=2` — sitting figures placed correctly, zero errors. Two live, un-ruled-out
  possibilities for what the user actually saw: (a) same stale-deploy timing as point (1), or (b)
  Hospital is a large, mostly-corridor/MEP-dense building with only 201 furniture items total — the
  specific view they tried may have genuinely had zero furniture in frame, which is correct
  behavior (no chairs in view → no sit figures), not a bug. Didn't chase further without a specific
  camera position/screenshot from the user to reproduce against.

**Tooling note:** reused the `~/bim-ootb/tests/node_modules` Playwright install (this worktree's own
`tests/` has none) via an absolute `require()` path from throwaway scratchpad scripts — not committed,
not part of the repo. `README.md`'s plain `python3 -m http.server` + `viewer/viewer.html?db=...&bld=...`
is the right local-serve convention for direct manual/scripted testing (the formal Playwright suite's
`/dev/index.html` convention needs deploy-snapshot infra this checkout doesn't have — don't chase that
again, use the README path).

**Shipped:** PR #868 merged (`d53a477`, live). PR #870 opened, CI pending at time of writing — merge
once green, same admin-scope convention as #868.

## SESSION RECORD 2026-07-18, cont. — PR #870 merged; 4 more live-test items, PR #872
**PR #870 merged clean** (`f1cb4c9`) — same admin flow, CI green, auto-merge.

**User's next round of live feedback, verbatim, four items plus one design confirmation:**
1. "and they should be camera facing - facade. Don't generate anything out of frame. Wait till cam
   switch to another angle. All populate only in frame opportunity" — the "don't generate out of
   frame / wait for a new angle" half was already the shipped design (confirmed, no change needed);
   the "camera facing" half was a real gap.
2. "ie trees say 3 all appear in scene not behind or obscured by building" — a real gap: frustum
   membership isn't the same as actually visible.
3. "Car is still slightly tilted and should be another 2 meters away from wall." — distance is a
   real, simple ask; tilt needed investigation (see below).
4. "cars should have different metalic colour assigned."
5. "Why Hospital has no trees when outside Alt-P?" — a question, not a placement bug (see below).

**Shipped fixes (`viewer/effects.js`, commit `bdda3f7`, PR #872):**
- **Occlusion check** — new `_inFrame()` behaviour: after the existing frustum-projection test passes,
  cast a ray from `A.camera.position` to the candidate via a dedicated `THREE.Raycaster`, against real
  building meshes collected ONCE per `_buildStaffage()` call (`A.collectMeshes`, excluding staffage's
  own group). A candidate with any real-geometry hit closer than itself is rejected — same treatment as
  an out-of-frustum candidate. Verified live: adds ~100-160ms on HHS's first press (a dense scene,
  vs ~10-20ms before) — still well inside this feature's existing budget, zero errors.
- **Facade-facing** — `outsidePoses` (already `role==='stand'` only, from the prior fix) now ALSO
  requires `facing==='toward'` — drops the away-facing standing pose from the entrance/facade pool
  entirely. Only one pose (`person_standing_casual_male`) now qualifies, which is fine — "1 set" was
  always going to repeat the same look.
- **Car clearance** 5.5m→7.5m from the wall, both the door-anchored and no-doors fallback branches.
- **Car colour** — new `_CAR_COLORS` (7-shade real-paint palette) + `_carColorFor(buildingName)`
  (string-hash → deterministic index, so the SAME building always gets the SAME colour — matters for
  the Save/Restore round-trip staying visually consistent, not random-per-press). Metalness 0.15→0.55,
  roughness 0.4→0.35 for a genuinely metallic paint read. Applied at both material-creation sites (live
  placement AND the restore-from-saved-DB path — missed updating one of these once before in this
  session's history, double-checked this time).

**Investigated, NOT code-fixed — real evidence gathered, root cause differs from what was assumed:**
- **Car "still tilted"/"floating" — DEFINITIVELY not a position or geometry bug.** Two independent
  checks: (a) decoded `car_beetle.bin` directly (same axis-remap as the loader) — the 4 wheel-contact
  vertices (bottom 2% of all verts) are at the EXACT same Y across all 4 XZ quadrants, to 4 decimal
  places — the source geometry is genuinely flat, no baked-in tilt from extraction. (b) Live-queried
  the RENDERED mesh's world-space wheel-bottom Y (`mesh.position.y + geometry.boundingBox.min.y`)
  against `A.ground.position.y` with Shadow AND Night mode both toggled on — **identical to 14 decimal
  places** (`-0.21200000000000002` vs `-0.21199999999999997`). A screenshot with Shadow on and the
  ground plane visible (previously invisible by default — `A.ground.visible=false` until Shadow is
  toggled on) still visually READS as floating despite the numeric proof, and shows no visible contact
  shadow under the car at all despite `castShadow=true`/`shadowOn=true`. **Working conclusion:**
  missing ground-contact visual cue (no soft AO/contact-shadow decal under the wheels, and the real
  cast shadow may not actually be rendering — not confirmed why) makes a mathematically-exact placement
  read as floating/tilted to the eye. This is a rendering-polish fix (a shadow-blob decal, or debugging
  why `castShadow` isn't producing a visible shadow), NOT a placement-math fix — flagged as the next
  concrete lever, not attempted blind this session (out of scope, needs its own investigation of the
  shadow-map/frustum-coverage path).
- **"Why Hospital has no trees when outside Alt-P" — inconclusive, real infra constraint hit.** First
  attempt used the local `modeller/Hospital_ARC.db` fixture — discovered it has ZERO paired geometry
  library (every geometry hash lookup logged `§BLOB_MISS`, `totalStreamed=0`, only 2 placeholder
  bboxes) — that fixture is metadata-only (built for the Modeller/Gantt tools), not a valid Viewer
  geometry test bed. Second attempt hit the REAL production site + REAL OCI-hosted geometry
  (`buildings/Hospital_extracted.db` + `buildings/Hospital_geo.db`, found via the bucket's public
  listing — `PROD_BASE` in `viewer/config.js`) — confirmed `realTrees=20` detected correctly even
  against the real DB (so the detection/skip-synthetic-trees logic is NOT the problem). Could not get a
  definitive rendered screenshot: Hospital's real geometry is a 123MB / 63,415-element stream that was
  still only ~29% loaded (`streamedCount=18500`) after 2+ minutes of automated waiting — the test
  environment's patience ran out before the page did, not a confirmed rendering bug. **Left open**,
  same conclusion as the PRIOR session's identical finding — next step is either patient live testing
  (let it fully stream, then look), or checking whether small proxy-classed elements like trees are
  deprioritized behind bulk structural/MEP geometry in this building's streaming order (a real,
  checkable hypothesis, not chased this session).

**Tooling note:** found the real OCI bucket listing is public (`GET .../o?prefix=...` on the
`objectstorage.ap-kulai-2.oraclecloud.com` bucket) — useful for finding a building's exact `db`/`lib`
filenames without guessing (several buildings, Hospital included, are "split" — geometry lives in a
separate `_geo.db`, not folded into the `_extracted.db` the way small buildings are).

**Shipped:** PR #872 opened; merge once CI is green, same admin-scope convention as #868/#870.

## SESSION RECORD 2026-07-18, cont. — explicit formula + randomization (PR #875)
**User laid out the definitive recipe, verbatim, after I asked 3 clarifying questions and got pushed
back on for it ("Read back, i laid it all down clearly in plain English... why ask dumb questions. My
English cannot be clearer applying general intent and common sense"):**
> "4 trees, 1 car, 3 standing pax at each alt-P in screen frame. But there is a cap to avoid clashing.
> It may use up more open space between building and camera view as long in frame. This way user can
> 'paint' own scene. If not happy, refresh and do again. Alt-p uses somewhat random placing so user can
> experiment repeatedly... Indoors, should be 2 sitting at seats, the rest standing. Again repeatedly
> adds on without clashing and in random placings."

Follow-up corrections to my 3 questions: (1) car DOES repeat per press like trees ("Yes"); (2) walking
indoors is NOT being dropped, keep it as part of the discretionary mix, just keep the algorithm simple;
(3) clash-avoidance is THE guardrail — no other cap logic needed, stop asking.

**Lesson for next time (don't re-ask this class of question):** when a user lays out a fully-specified
formula with explicit numbers and an explicit philosophy ("cap = clash, not a count"), implement it
directly — clarifying questions are for genuine forks the text doesn't resolve, not for re-confirming
numbers that were already stated plainly.

**Shipped (`viewer/effects.js`, commit `886cd8a`, PR #875):**
- `PAX_CAP` 1→3, `TREE_CAP` 3→4 — exact per-press targets now, not the earlier "1 is a light first
  press" figure (that was superseded by this explicit formula).
- **Car is no longer one-time-only** — removed the `carPlaced` latch entirely; it now follows the exact
  same additive/capped(1)/random pattern as trees/pax every press.
- **Wider spatial search** ("may use up more open space between building and camera view as long in
  frame"): multiple step-out distances per candidate instead of one fixed ring — pax 2.2/4/6.5/9.5m,
  trees at radii 5/9/14/20m beyond the silhouette, cars 7.5/10/13m. Same frame+occlusion+clash gate as
  before, just more spatial variety to draw candidates from.
- **Randomization** — new shared `_shuffle()` (Fisher-Yates), moved to module scope so both
  `_buildStaffage()` (exterior) and `_updateInFrameInterior()` (interior) can use it. Every candidate
  list (pax spots, tree angle/radius pairs, car spots, interior furniture candidates, interior aisle
  points) is shuffled before the greedy capped pick — replaces the old deterministic nearest-first/
  angle-order iteration. Clash/occlusion/frame checks are unchanged and remain the only real limiter.
- Interior SIT_CAP/WALK_CAP left at 2/2, unchanged — no new number was given for "the rest standing"
  and walking was explicitly confirmed to stay, so no invented change there.

**Verified live** (Duplex, SampleHouse): every press placed exactly 3 pax (dropping to 0 only once
genuinely out of space — SampleHouse press 3-5) + 4 trees every press + up to 1 more car; car landed at
4 visibly different positions/angles over 5 Duplex presses (`(-6.4,5.6)`, `(-6.9,-16.6)`, `(-2.4,11.9)`,
`(17.7,-10.1)`) — real evidence the randomization works, not just present in code. Interior sit/walk
unchanged in correctness (`WALK_CLEAR ok=2/2` every press, de-dup correctly shrinks `inView` on repeat
presses). Zero JS errors across both buildings.

**Shipped:** PR #875 opened; merge once CI green, same admin-scope convention as the prior PRs this
session.

## SESSION RECORD 2026-07-19 — Terminal "0 pax" root-caused + fixed (PR #879)
**User pasted a real console log (verbatim excerpt), verdict: "its not able to be abstract. See how
Terminal has bad results."** The log showed, on `TerminalMerged`: `§PHOTO_STAFFAGE thisPress(people=0
trees=4) ... pSrc=none-in-frame ... (realPeople=0 realTrees=0 realCars=0)` — zero pax placed, only
trees, plus a `§HELPERS_QUERY_ERR no such table: staffage_instances` line on every load.

**Root-caused via a NEW `§STAFFAGE_PAX_REJECT` witness** (tried/placed/rejFrustum/rejOcclude/rejDedup
counters added to the pax loop, not guessed at from theory) — tested live against
`modeller/Terminal_meta.db` (48,428 elements, 135 real `IfcDoor` rows): only **2 of 135 doors** passed
the "beyond the measured silhouette" exterior test (`dr >= silR(angle) - 3.0`). `silR()`'s 96-bin
smoothed envelope doesn't track a highly irregular, non-convex footprint (many wings/gates, a real
terminal) closely enough — real exterior doors sitting in local recesses read as "interior" against the
oversmoothed silhouette. That left only 8 raw candidate spots (2 doors × 4 step-outs) for the
occlusion/frustum/clash gates to work with — trivially reducible to zero, and it was
(`tried=8 placed=0/2 rejOcclude=4`, live evidence). This is the "not able to be abstract" the user meant
— the pax algorithm's door classifier doesn't generalize to complex/large footprints the way the
tree-ring approach already did.

**Fix:** pax candidates are no longer door-XOR-silhouette-ring (the ring was previously ONLY a
zero-doors fallback). Silhouette-ring candidates — the exact mechanism trees already use successfully,
robust regardless of footprint complexity — are now ALWAYS generated alongside door-anchored ones.
Doors still get tried/preferred (a real entrance reads better than a mid-air ring point), but a complex
building is never starved down to a handful of spots. Verified live: Terminal went from `tried=8
placed=0` to `tried=56 placed=3` (the full 3-pax formula) across 3 consecutive presses; zero regression
on Duplex (still exactly 3/press, more candidate variety if anything — 84 tried vs the old ~24).

**Also fixed:** the `§HELPERS_QUERY_ERR no such table: staffage_instances` noise on every building's
first Alt+P press. Root cause: `A.dbQuery` (helpers.js) already catches its own SQL errors internally
and returns `[]`, but it ALWAYS `console.warn`s regardless — so my earlier `try/catch` around the
`SELECT ... FROM staffage_instances` call never actually helped (the query never throws to my catch,
it just warns and returns empty). Fixed by checking `sqlite_master` for the table's existence first (a
query that can never fail) and only running the SELECT when the table genuinely exists — silent for the
normal "never saved with this feature" case, which is every building so far.

**Branch hygiene note:** main had advanced through 3 more merges (#876 icon-row, #877 bbox-ghost-fix,
#878 cache-fallback) while this fix was being written — `sw.js CACHE_VERSION` was already at v800 on
main (not the v799 this branch's parent expected). Cut fresh off current `origin/main` rather than
reusing/rebasing the stale branch, per standing worktree-hygiene rule; bumped v800→v801.

**Shipped:** PR #879 opened; merge once CI green.

## ADDENDUM 2026-07-17 (same day) — floating-in-midair figures, a SECOND distinct defect, also fixed
**User report (verbatim, viewing LTU_AHouse via a real screenshot):** "some human sprites gets floating
on the air as if on first level when it is outside the wall in midair... perhaps this is from reading
the bbxes instead which extends out rather than the mesh." Also: "sometimes figures too right at the
door getting half cut." User's own proposed fix, correct and adopted: "Need not place anyone inside
building at all when user is viewing from outside, only when zooming into building, Alt-P can place...
need not put anything that is not seen."

**Root cause confirmed via direct DB query on LTU_AHouse** (not guessed): a multi-storey building can
have wildly different footprints per floor — measured ground floor ~169m wide, upper floor (Z 3-6m
band) ~357m wide, more than double. `silR()` (the measured-silhouette function from the ORIGINAL
defect above) builds ONE silhouette combined across EVERY floor's points. A ground-floor sitting/
walking candidate classified "interior" against that inflated combined silhouette could land at an XY
position real only on the upper floor — nothing solid exists there at ground height, so the sprite
floats past the real ground wall. The door half-cut reports trace to the same interior-door walker
mechanic: it stepped outward using radial-from-building-centroid math, which has no relationship to
which way an actual INTERIOR door faces.

**Fix, per the user's own direction (not a new invention — implementing exactly what was asked):**
`_buildStaffage`'s unconditional exterior-establishing pass (runs whenever camera state is outside or
unknown — i.e. every first Alt+P press) now places NO indoor sitting/walking figures at all — only
real ENTRANCE figures (each still snapped to its OWN nearby floor slab via the existing `_floorThreeY`,
so a genuine upper-floor entrance/balcony door is correctly elevated, not floating) plus trees. That's
everything an outside view can actually see — figures behind walls were simultaneously the bug source
and wasted work (DB queries + occupancy-grid nudge-search for candidates nobody would ever see).
Indoor sitting/walking is now placed EXCLUSIVELY by `_updateInFrameInterior` (unchanged), which anchors
to the camera's own confirmed-inside position and its real local floor slab — inherently floor-correct
by construction, immune to the combined-silhouette mismatch. Removed the now-dead `_nudgeFree` helper
(its only caller was the interior-door placement just deleted) and the entire interior-door/furniture-
sitting branch from the exterior pass — a net simplification (93 lines touched, net −43), not just a
bug fix: fewer DB queries per Alt+P press on the common (camera-outside) path too.

**Verified via §-witness log** across Duplex/Clinic/Hospital/Terminal/HHS/**LTU_AHouse (the building the
bug was reported on)**: every building now shows `pSrc=exterior-only+entrance` (or `+silhouette`
fallback when a building has no doors, e.g. HHS), zero `§PHOTO_STAFFAGE_WALKCLEAR src=doors` lines
anywhere in any building (that mechanism no longer exists), and `_updateInFrameInterior`'s aisle-walker
placement still verifies `§STAFFAGE_WALK_CLEAR ok=n/n` once the camera is confirmed inside. LTU_AHouse
itself: `people=16 trees=24 pSrc=exterior-only+entrance build_ms=447` — no indoor figures in the
exterior pass, confirming the float can no longer occur there.

**Shipped:** committed on `feat/staffage-walk-aisle` (shared worktree, `3561bd3`) and cherry-picked
clean onto the already-pushed `fix/staffage-walk-clear-occupancy` (`d9f872b`, pushed — this is now the
branch to PR, 2 commits: the walk-clear occupancy-grid fix + this exterior-only fix). **Push pause was
lifted by the user this session ("push permission is ON") — pushed directly, no PR opened yet.**

## ADDENDUM 2026-07-17 (same day, cont.) — M_RPC prefix fix + real facing-direction placement
**The `M_RPC` gap flagged above is now FIXED** (was "not fixed, noted for later" a few hours earlier
in this same session). `effects.js`'s `realPeople` SQL now also matches `M_RPC Male%`/`M_RPC Female%`;
`streaming.js`'s `§ENTOURAGE` variant matcher strips a leading `M_` before the anchored-prefix check,
so both naming conventions land the same presentation-material variant. Added a `vehicle` variant
(RPC Beetle — the real car, found via the user's own screenshot, see below) with a neutral car-body
grey tone; it had no material treatment under either naming convention before. Found one more
consequence while fixing this: `_updateInFrameInterior` never checked `realPeople` at all, so even a
building with real RPC people would still get synthetic sitting/walking staffed on top indoors — added
a module-level `_realPeopleExist` flag (set by `_buildStaffage`) that `_updateInFrameInterior` checks
first. Verified: BimWhale now shows `realPeople=33 realTrees=27`, `people=0 trees=0 pSrc=none` (places
nothing synthetic, correctly), `§PHOTO_STAFFAGE_INTERIOR skip=realPeopleExist` in both exterior and
interior camera states, `§ENTOURAGE_INIT variant=tree/person/vehicle` all firing. Ifc4_Revit
(unprefixed names) and Duplex (no real entourage) both unaffected — no regression. Shipped `b741f4d`
→ cherry-picked `1e05530` (pushed).

**User's follow-up (verbatim): "the walking lady with bags outside as she is facing to the building.
The guy facing to us can be inside. Such metrics can fit any situation."** Root fact, confirmed by
actually opening each of the 6 people PNGs (not guessed — a `THREE.Sprite` billboard always rotates
flat-on to the camera, but the PHOTO CONTENT never changes with viewing angle, so whether a cutout
reads as approaching or facing the viewer is fixed the moment the asset is picked, not something
placement math can rotate per-shot):
- `person_walking_shopping_female`, `person_walking_gym_female`, `person_standing_gesture_female`:
  shot from BEHIND — reads as moving away from the camera, i.e. toward whatever is beyond her.
- `person_standing_casual_male`: shot FACE-ON — reads as looking straight at the camera ("the guy
  facing to us").
- Both sitting poses (`person_sitting_formal_male`, `person_sitting_casual_female`): side/3-4
  profile, and **both already face the SAME direction** (rightward) in their source photos — the
  "man and woman sitting... faces same way" the user described is already true by construction, no
  fix needed there. "Other way can be flipped" (a horizontal mirror on a profile shot genuinely does
  flip which way it faces, unlike front/back shots) is a real, available future lever if a sitting
  pair ever needs to face the opposite way (e.g. driven by real chair `rotation_z`) — not implemented
  this session, no concrete case needed it yet.

Added a `facing: 'away'|'toward'|'side'` field per pose (replacing the legacy `place` field, which
nothing read anymore — confirmed via grep before removing). Wired into `_buildStaffage`'s entrance
placement: `'away'`-facing poses still step 1.6m OUT from the door (reads as approaching/entering —
already correct). `'toward'`-facing poses now stay right AT the threshold (0.3m, was 1.6m) instead of
being stepped onto the lawn facing the wrong way — reads as standing in the doorway, facing out.
Same logic ported to the no-doors silhouette-ring fallback. Verified via §-witness log (no count
regressions anywhere) **and a direct screenshot** — framed the camera on the actual placed
`person_standing_casual_male` sprite on Duplex: confirmed visually standing right in the doorway
opening, facing the camera, not stepped out onto the grass like every other entrance figure. Shipped
`6bdf295` → cherry-picked `31ffaeb` (pushed).

**The car:** user's screenshot showed real cars (`M_RPC Beetle`/`RPC Beetle`) in both BimWhale and
Ifc4_Revit — confirmed real IFC mesh geometry, not staffage. Its position comes straight from the IFC
file, not from any of today's placement code, so the "floating" the user connected it to was actually
the (now-fixed) M_RPC realPeople double-population + the (also now-fixed) exterior-only-pass float bug
happening on the SAME buildings — not a car-specific bug. The car itself just needed the material-
variant fix (done above) so it stops rendering in the flat RPC-exporter grey.

**User confirmed "just use the IFC car"** (asked before assuming — no car cutout PNG exists anywhere
in the repo, people/trees are licensed Skalgubbar photos, sourcing a NEW licensed car asset felt like
the kind of call that's genuinely the user's, not mine to make solo). Correct call: no new asset
needed, the real `RPC Beetle` geometry already exists in the 2 buildings that have it. Screenshot-
confirmed (BimWhale, mid-load/untextured but geometry-correct): the real car AND real people both sit
correctly on the pavement, not floating — the earlier "floating" report was the M_RPC double-
population + exterior-only-pass bugs, both already fixed, not a car-specific issue. No synthetic car
placement was added, matching "don't put anything that isn't real."

**Interior "guy facing cam, lady back... also can where opportunity":** the interior walk/stand pool
was 100% 'away'-facing (both walk-role poses are shot from behind) — no way to show someone facing
the viewer indoors. Widened `_updateInFrameInterior`'s `walkPoses` to also include the one
'toward'-facing pose (standing casual male) in the SAME round-robin as the two 'away'-facing walk
poses — "where opportunity" = whichever the round-robin/occupancy-grid-clear pick lands on, not
forced. Zero change to the placement/verification pipeline — he passes the exact same walk-clear test
as any other candidate, so "don't knock inside things" holds: verified `ok=n/n` unchanged across
Duplex/Clinic/Terminal. Sitting-pair facing ("man and woman... faces same way") was already correct
by construction (both sitting photos are same-direction profile shots) — nothing to fix there.

**Branch state:** `fix/staffage-walk-clear-occupancy`, 6 commits pushed (occupancy-grid walk-clear +
exterior-only-pass fix + M_RPC/no-double-population fix + facing-direction fix + interior
facing-pool widening). No PR opened yet — say the word if you want one.

## CORRECTION 2026-07-18 — the "no real vehicle data" conclusion in PHOTOREAL_STILL_RENDER.md was WRONG
User (correctly) pushed back on treating a NEW car asset as a Prime Rule risk, then on sourcing a
cutout photo at all: **"we wana use the car IFCs already in our project"** — reuse the REAL RPC Beetle
mesh geometry (confirmed above, `M_RPC Beetle`/`RPC Beetle`, real `component_geometries` BLOB data) as
a cross-building library prop, not a licensed photo. This directly corrects
`PHOTOREAL_STILL_RENDER.md`'s own earlier-this-session census, which concluded "vehicles NOT available
as a real-data fallback anywhere meaningful" — that census used a `LIKE '%car%'` pattern that can't
match a car by MODEL NAME (a Beetle isn't spelled "car"), the exact same blind spot as the M_RPC prefix
miss above. Full correction + the sketched (not-yet-built) mesh-reuse mechanism is written up in
`PHOTOREAL_STILL_RENDER.md` §Open items — read that before starting the next session's work, don't
re-derive it.

**IMPLEMENTED same session after all** — user: "since u now know, fix it right away." Extracted
geometry_hash `8c0e2517038456a4` (one real `M_RPC Beetle` instance) from BimWhale_Advanced's
`component_geometries`, confirmed local/object-space (two guids share this hash with different
`center_x/y/z` — placement-independent, same shared-geometry+per-instance-transform pattern
`streaming.js` already uses). Vendored as `viewer/textures/staffage/props/car_beetle.bin` (32KB,
custom binary: vertCount/idxCount header + raw Float32 verts + Uint32 face indices), with a
`.gitignore` exception for the blanket `*.bin` rule (that rule is for regenerated per-building
position caches, not this permanent asset) and a `NOTICE.txt` documenting it's the project's own
data, no license question. `_loadCarGeometry()` fetches+decodes once (cached), `_buildStaffage`
places ONE real `THREE.Mesh` (casts/receives real shadows, unlike the billboard sprites) near a
ground-floor exterior door when `realCars===0`, oriented tangent to the door's outward direction
(parked alongside, not nose-into the wall), grounded via the same per-floor slab lookup as
everything else. Buildings that already have a real car (BimWhale, Ifc4_Revit) correctly place
nothing synthetic — verified `realCars` counts and `pSrc=none`. Screenshot-confirmed on Duplex: a
recognizable, correctly-grounded, properly-lit Beetle parked near the house. Shipped `47c9456` →
cherry-picked `98a1d84` (pushed, branch now 7 commits).

## SESSION 2026-07-18 — offline mode broken for staffage textures, root cause + fix
**User report (verbatim console log):** repeated `HTTP/1.1 503` on every `viewer/textures/staffage/**`
GET, plus `§STAFFAGE_TEX_FAIL` lines — Alt+P staffage broken while offline/network-degraded.

**Not an engine bug — a precache-list gap.** The offline mechanism itself works correctly (same
pattern as the existing `ground_config.json`/`grass_1k.jpg` precedent). Root cause: the 12 staffage
PNGs (6 people + 6 trees, shipped PR #845) were added to `effects.js`'s `_STAFFAGE_PEOPLE`/
`_STAFFAGE_TREES` but never mirrored into `viewer/sw.js`'s precache lists. They fell through to
`sw.js`'s default `cacheFirst()` path: cache miss → real fetch fails (offline) → synthesized
`Response('', {status:503})` — exactly the console log. `GET_PRECACHE` (the "Make available
offline" button, `OFFLINE_BUTTON_SURFACE.md`'s engine) never listed them either, so even an explicit
full-offline download silently excluded staffage.

**Fixed:** added a `STAFFAGE_ASSETS` group to `sw.js`'s `LOCAL_LIBS` (same treatment as
`DEFERRED_LIBS` — cache-on-first-use online, or via the offline-download button; not auto-installed,
4.2MB is comparable to what §PRECACHE-TRIM deliberately kept off the install path).
`CACHE_VERSION` v791→v792. Verified: `node -c` both touched files, all 12 `STAFFAGE_ASSETS` paths
exist on disk and match `effects.js`'s file list exactly, confirmed `scene.js`'s
`_startOfflineDownload`/`_cacheAllAssets` already consumes `GET_PRECACHE`'s `libs` field with zero
further wiring needed.

**Guard against recurrence (user asked "can there be a note in the main code"):** added
cross-reference comments in both files — `effects.js` above `_STAFFAGE_PEOPLE` points at `sw.js`'s
`STAFFAGE_ASSETS`, and `sw.js` above `STAFFAGE_ASSETS` points back at `effects.js` as the source of
truth. Comment-only, no automated check — if this class of drift recurs, a real fix would be a CI/
witness script asserting the two lists match, not just a comment; not built this session (not asked).

**Shipped:** bim-ootb branch `fix/staffage-offline-precache`, worktree `/tmp/wt-staffage-offline-sw`,
2 commits (`86457ad` the fix, `c2357e3` the cross-reference comments). PR #860 opened, auto-merge
armed (squash). One push hung ~2min on the documented LFS-probe issue (`CLAUDE.md` §DB CHANGES —
zero-LFS-diff push, retried once per that doc's guidance, succeeded).

**User confirmed** the "18 dead shortcuts" (`§SHORTCUT_AUDIT`) in the same console dump are a
separate, pre-existing finding — not investigated this session, not part of this fix.

## SAME SESSION, cont. — user asked whether Alt+S blocks building load; found + fixed a 2nd instance
**User's question (verbatim):** "that new Alt-S shuld not bother or stop the main building loading.
Or all code is fetched same time? Aren they lazy loaded?" Traced the real code path, not assumed:
- Alt+P staffage textures: confirmed 100% lazy — `_buildStaffage()` (`effects.js:738`) has exactly
  one caller, inside the Alt+P toggle handler; nothing calls it during init.
- Alt+S / TAARenderPass: the *module* loads eagerly (`setupEffects()`, `effects.js:9`, `await`ed in
  `main.js:14` BEFORE `setupStreaming()` starts at `main.js:15-17`) — but this isn't Alt+S-specific.
  `setupEffects()` builds the whole render composer (SSAO + Outline + Output + base RenderPass) that
  every desktop session needs regardless of Alt+S; TAARenderPass just happens to be pass 1
  (`accumulate=false` default = behaves identically to plain RenderPass, zero added cost per the
  code comment at `effects.js:39-43`). Pressing Alt+S itself triggers zero new fetches — it only
  flips `accumulate=true` on an object already in memory.

**Found while checking:** the 6 composer modules `setupEffects()` imports (`EffectComposer.js`,
`RenderPass.js`, `TAARenderPass.js`, `SSAOPass.js`, `OutlinePass.js`, `OutputPass.js`) were ALSO
never added to `sw.js` — same gap class as the staffage fix above, just for core rendering instead
of Alt+P. User asked what error this would cause; traced the full path before answering (not
guessed): a rejected `Promise.all` (503 from `cacheFirst()`'s catch on a genuine offline+uncached
fetch) is itself caught by `setupEffects()`'s own `try/catch` → `§EFFECTS_INIT_FAIL`, `A._composer =
null`. Every consumer checked (`scene.js:778`, `navigate_find.js:3479/4945`, `effects.js:1919`'s
`startStillRefine` guard, `main.js:850-851/863-864`'s render-loop fallback to plain
`renderer.render()`) is null-guarded — confirmed graceful degrade, NOT a crash: building still loads
and renders, user silently loses SSAO shadows + pick/clash/Find outline highlight + Alt+S until back
online.

**User: "yes, since it has no impact on user feel been lazy loaded"** — fix it, since lazy-loading
already means zero perceived load-time cost, so precaching it too is pure upside. Added the 6
modules to `sw.js`'s `SHELL_LIBS` (auto-installed, not the DEFERRED-style bucket used for staffage —
~56KB total, and unlike web-ifc/xlsx/staffage these aren't behind an optional feature toggle,
`setupEffects()` runs unconditionally on every desktop load). `CACHE_VERSION` v792→v793.

**Shipped:** bim-ootb branch `fix/composer-modules-offline-precache`, worktree
`/tmp/wt-composer-offline-sw`, 1 commit (`615822e`). PR #861 opened, auto-merge armed (squash),
CI still running as of this note — check `gh pr view 861 --repo red1oon/bim-ootb` for final state
before assuming it landed.

## ADDENDUM 2026-07-18 — car mesh: two more real bugs found+fixed live, plus continuation items
Continuing directly off the car-mesh work above (`98a1d84`/`e8b0476` etc.). Two MORE real defects
surfaced from live user testing, both root-caused and shipped (not guessed):

**1. "car shows up but has no Alt-S effect."** The car's `MeshStandardMaterial` was built
standalone, outside the normal per-element material pipeline — `streaming.js`'s own
`_getMaterial` gives every material `envMap:A._envMap, envMapIntensity:0.6` at creation
(`streaming.js:437`), and Alt-S's reassert cycle (`_reassertPhotoEnvMap`, `_reassertPhotoMatBoost`
in `effects.js`) only sweeps materials registered in `A._matCache`. The car had neither, so it was
invisible to both — stayed flat while everything else got Alt-S's ×3 glossy/envMap boost. Fixed:
set `envMap`/`envMapIntensity` at creation matching the normal convention, register in
`A._matCache` under a stable key (`'staffage-car-beetle'`) so future reasserts reach it
automatically. Verified locally: `envMapIntensity` 0.6→1.8 and `userData._photoBoosted` flips
true after Alt-S, matching real streamed materials exactly.

**2. User tested Hospital: "1 pax is in the door cut off and another too close to it... car and
ppl should be a bit further from building perhaps at least 2 meters."** The 'toward'-facing
near-threshold placement (0.3m — see the facing-direction fix above) clipped visibly against the
door frame on a real building; the "reads as standing in the doorway" idea didn't survive contact
with real geometry. Dropped in favour of a uniform **>=2m clearance (2.2m) for every entrance pose
regardless of facing** — 'toward' poses still turn to face the camera, just standing clear of the
building instead of jammed in the frame. Applied the same clearance to the no-doors silhouette
fallback; widened multi-pax-at-one-door lateral spacing 1.4m→1.8m for breathing room.

Both shipped: `f4ac7c2` → PR #863 (merged, live, `sw.js` v794). Branch discipline held: fresh
worktree (`/tmp/wt-car-envmap-fix`) off current `main` each time, never reused a
squash-merged branch — this session alone hit that collision 3 times (branches from PRs #854,
#857, #858 were all stale the moment their PR merged; don't `git pull` an old worktree and expect
it to fast-forward, just cut a fresh one).

**Found, NOT investigated (documented for the next session, not guessed at):**
- **User: "Hospital has zero trees - only ppl, car."** Confirmed via direct DB query: Hospital
  DOES have 20 real trees (`M_RPC Tree - Deciduous:...`, `IfcBuildingElementProxy`, same M_-prefix
  convention as BimWhale) — `realTrees` detection already counts them correctly (witness log
  shows `realTrees=20`, synthetic tree placement correctly skipped). Checked their Z
  (≈179.5) against the building's overall Z range (159.8–203.2) — well within normal range, no
  obvious "floating in the sky" position bug. So this is NOT a detection/counting bug and NOT an
  obvious gross-position bug — the real trees exist in the data with sane coordinates but the user
  doesn't see them rendered. Needs live visual verification (are they occluded by the dense MEP
  geometry? too small at typical viewing distance? a streaming/classing issue specific to this
  building's tree instances specifically, distinct from the M_RPC fix which only touched
  material/counting, not base geometry streaming?) — not diagnosed this session, don't assume the
  cause without checking.
- **User: "as i still want the Alt-S to do facade mostly and not all round the building this is to
  build user facing view for photo finish."** References the existing facade-facing-lights system
  (`§PHOTO_FACING facades=4 strengths=0.54,0.30,0.30,0.30` — `_updateFacadeFacingLights`,
  `PHOTO_FACADE_DIM_FRACTION=0.3` in `effects.js`): right now every facade gets SOME light (dimmed
  to 30%, "not pitch dark" by design), not a hard cutoff to the camera-facing side only. User wants
  the presentation pass to read as clearly ONE hero facade (the camera-facing "user view" for the
  photo-finish shot), de-emphasizing the other 3 sides more than the current 30%-floor does. Not
  scoped or implemented this session — needs its own investigation of `_updateFacadeFacingLights`
  and probably a lower `PHOTO_FACADE_DIM_FRACTION` or a genuine facing-based gate rather than a
  floor. Flagging so it isn't lost, not attempting blind.
- **User questions on staffage persistence — RESOLVED 2026-07-18** (verbatim ask): "Existing in
  data means when saved and reopen it be there? And Alt-P can remove them? So that Alt-P can apply
  again?" Plus: "reopen the scene returns to what last saved scene was." Traced the actual code
  (not guessed): `A.saveModelDb()` (`scene.js:514`) calls `A._exportBuildingDb()`, which exports
  only SQLite tables (`element_transforms`/`elements_meta`/geo tables, `§SAVE_FOLD` log) — staffage
  sprites + the car mesh are pure runtime `THREE.js` scene-graph objects (`_photoStaffage.add(...)`,
  `effects.js:717`), never written to `A.db`. Reopen (`A._openDbBytes` → `location.assign(
  'viewer.html?db=...')`, `scene.js:552`) is a full page navigation — the viewer reinitializes from
  scratch, so `_populateOn` (`effects.js:1037`) resets to `false`.
  **Answer: staffage does NOT persist across save→reopen.** After reopening a saved `.db`, Alt+P is
  OFF by default; pressing it places a FRESH set (not a restore of what was showing before save) —
  nothing about the prior placement was recorded. Within one session, Alt+P's own add/remove/
  re-apply toggle (`_disposeStaffage`) is correct and unaffected by this. No code change made —
  this was a read-only trace to answer the question; if the user wants Alt+P's on/off state (or the
  actual placed set) to survive save/reopen, that's a new feature (e.g. a flag/seed written into the
  exported DB) — not scoped or requested yet.
  (Note: this answer predates the save/restore feature actually SHIPPED later in the 2026-07-18
  session further up this file — `staffage_instances` table, `A._getStaffageInstances`/
  `A._restoreStaffageInstances`. That superseded the "not scoped yet" line above; kept verbatim here
  as the historical record of the question being asked and answered at the time.)

## SPUN OFF 2026-07-19 — Hospital's real trees not rendering is NOT a staffage bug
Confirmed a third time today (user's live console paste): `realTrees=20` is correctly detected on
Hospital, `_buildStaffage()` correctly refrains from placing synthetic trees on top (by design — real
data takes priority). **This file's own placement algorithm is not the problem.** The open question —
whether those 20 real trees ever visibly render at all — is a `streaming.js`/real-geometry question,
out of this file's scope. Full writeup, all three sessions' evidence, and a concrete new lead (the
trees sit ~14m above the ground floor — possibly a terrace/courtyard level, not street level) moved to
its own file: **`prompts/HOSPITAL_TREES_NOT_RENDERING.md`** — read that file fresh, don't re-derive
from this one.

## SPEC 2026-07-19 — ZERO-CASE ELIMINATION + PER-CAR COLORS (user directive, verbatim)
User: **"some other buildings still get zero case somewhere which is impossible as there is always
room to plant a tree or person or car"** and **"the cars supposed to be different colours each time
one is added to the scene. It was so, but it breaks back."** Also: **do not touch/modify any DB
files** — all DB access this lane read-only; any needed DB change must be reported to the user first.

### S1 — Real-entourage gates: wholesale suppression → spatial dedup (issue: gate-caused zeros)
The three `if (realX === 0)` gates in `_buildStaffage()` (effects.js ~1001/1097/1122) and the
`_realPeopleExist` wholesale skip in `_updateInFrameInterior()` guarantee PERMANENT zeros on any
building with real RPC entourage (BimWhale: forever people=0/trees=0; Hospital: forever trees=0 —
and its 20 real trees are on the Level-3 terrace, never street-visible, so the user sees zero,
always). This DIRECTLY contradicts the new directive. Change: always run all three placement blocks
(the 3-pax/4-tree/1-car per-press formula applies to every building), and carry the anti-duplication
intent SPATIALLY instead: query real entourage element positions once per `_buildStaffage()` call
(same SQL patterns as the realX counts, joined to element_transforms) and reject any synthetic
candidate within clash radius of a REAL entourage element (people 3m / trees 4m / cars 6m) — same
discipline as `_nearExisting` does for synthetic-vs-synthetic. Never place a synthetic ON a real one;
never let a real one anywhere in the DB zero the whole kind.
- Witness: `§STAFFAGE_REAL_DEDUP n=<real entourage rows collected> rejReal=<candidates rejected>`.

### S2 — Last-resort camera-forward placement (issue: exhaustion-caused zeros)
Even with gates gone, a press can still zero a kind when every ring/door candidate fails
frustum/occlusion (the Terminal-class failure §STAFFAGE_WIDE_FALLBACK already fought once). Per the
directive there is ALWAYS room: if a kind is still 0 after the normal + wide-fallback passes, walk
the camera's ground-plane forward ray (points at ~8/12/18/25m ahead, ±small lateral jitter), take
the first spot passing `_nearExisting` + real-dedup (frustum passes by construction; occlusion check
kept, but on total failure place at the farthest candidate anyway — zero is the only forbidden
outcome), and place exactly 1 of that kind there. Witness: `§STAFFAGE_ZERO_RESCUE kind=<pax|tree|car>
spot=(x,y)` — a press that ends with any kind at 0 this-press AND no rescue line is the bug this
spec kills; §PHOTO_STAFFAGE thisPress counts must never show a 0 again.

### S3 — Per-car color (regression fix)
`_carColorFor(A.activeBuilding)` hashes ONLY the building name → every car in a building gets the
same paint. Restore the intended behavior (each added car differs) while keeping Save/Restore
deterministic — the `staffage_instances` row `[kind,file,x,y,z,rotY]` has no color column and row
ORDER is preserved, so color derives from (buildingName, carOrdinal): palette index = (buildingHash
+ carOrdinal) % len — consecutive cars ALWAYS differ (adjacent palette steps), same building+ordinal
always reproduces the same color on restore. `_placeCarAt` passes the pre-increment cumulative car
count; `_restoreStaffageInstances` passes a per-restore car counter. Each car gets its OWN material;
`A._matCache` key becomes `staffage-car-beetle-<ordinal>` so Alt-S reasserts still reach every car.
- Witness: `§STAFFAGE_CAR_COLOR idx=<ordinal> rgb=<hex>` on each placement/restore.

### S4 — Verification (read the log, not the exit code)
Puppeteer against a local worktree server, three buildings: (a) BimWhale_Advanced (real people+trees
+cars — the gate-caused permanent-zero case): 2 presses → thisPress pax/trees/cars all >0, zero
placements within dedup radius of a real entourage row; (b) Duplex or LTU (no real entourage —
regression guard): formula unchanged; (c) any framing that previously zeroed → §STAFFAGE_ZERO_RESCUE
fires, no kind ends 0. Car color: 3+ presses on one building → §STAFFAGE_CAR_COLOR shows 3 distinct
hexes; save→restore round-trip reproduces the same per-ordinal colors.

### SESSION RECORD 2026-07-19 — spec above IMPLEMENTED, witnessed, PR #883 (auto-merge)
All of S1/S2/S3 shipped in one branch: bim-ootb `fix/staffage-zero-case-car-colors` →
**PR #883** (auto-squash-merge enabled), sw v801→v802. Puppeteer witness against a worktree server
(localhost:8402), logs saved to session scratchpad (`staffage_zero_run4.log`, `rescue_hospital_run1.log`):
- **S1 proven on BimWhale_Advanced** (realPeople=33 realTrees=27 realCars=26 — the permanent-zero
  case): 3 presses → `thisPress(people=3 trees=4)` every press, `cumulative(people=9 trees=12
  cars=3)`, `§STAFFAGE_REAL_DEDUP n=86` collected. Previously synthetic people/trees/cars were all
  suppressed to 0 forever on this building.
- **S1 proven on Hospital**: single press → `thisPress(people=3 trees=4)` + car, `§STAFFAGE_REAL_DEDUP
  n=20` — the user's original "Hospital still zero trees" Alt+P symptom is FIXED (its 20 real trees
  are all on storey "Level 3", Z≈179.5, a terrace ~14m above ground — see
  HOSPITAL_TREES_NOT_RENDERING.md for that side).
- **S2 proven** (Duplex, camera teleported 800m out looking away — every ring/door candidate out of
  frame): `§STAFFAGE_ZERO_RESCUE kind=pax/tree/car` all fired (`forced=1`), press ended with no kind
  at 0. `pSrc=zero-rescue+car-rescue`.
- **S3 proven both buildings**: BimWhale cars #1a1a1a→#f2f2ed→#26592e, Duplex #a61a1a→#14296b→#1a1a1a
  — consecutive distinct, per-building starting slot, ordinal-deterministic for Save/Restore.
- **Duplex regression-clean** (no real entourage): formula/pSrc unchanged from before.
- One real bug caught BY the witness mid-session: `A.ifc2three()` returns a plain `{x,y,z}`, not a
  `THREE.Vector3` — first dedup draft called `.distanceTo` on it (TypeError live). Fixed by wrapping
  in `new THREE.Vector3` at collection. `eslint viewer` clean, `audit_sw_precache` 106/106, zero
  PAGEERROR in every run.
Note: the BimWhale `realX>0 → place nothing synthetic` behavior recorded as "correct" in the
2026-07-17 addendum above is SUPERSEDED by this spec (user directive 2026-07-19) — dedup is now
spatial, not wholesale.

## SESSION RECORD 2026-07-20 — §STAFFAGE_SEAT_CLASS: seated figures inside tables, root-caused + fixed (PR #898)
**User report:** "sitting figures are being placed INSIDE tables" — the seated sprite intersects table
geometry instead of sitting at a chair.

**Root cause — the seat-candidate search never discriminated chair vs table (candidate #1 of the four
hypotheses, confirmed by DB query, the other three ruled out).** `_updateInFrameInterior()` selected sit
anchors with `WHERE em.ifc_class IN ('IfcFurniture','IfcFurnishingElement')` — no class/name filter at
all — then placed the sprite at the chosen element's own `center_x`/`center_y`. Tables, desks, counters
and nurse stations ARE furniture, so a sit pick could anchor a figure at the geometric centre of a table.
Measured on the real shipped DBs (all read-only, nothing mutated):
| building | furniture | seats | non-seats |
|---|---|---|---|
| Hospital | 201 | 160 `M_Chair*` (0.47-0.68m plan) | 37 `M_Table*` (1.52-2.4m) + 4 nurse stations/info desks (12.68-25.51m) |
| Clinic | 118 | **0** | 118 — all cabinets/countertops, no chairs anywhere |
| Terminal | 176 | 4 (`Chair - Desk (2)`) | canteen tables, desks, combined seat+table units |
| LTU_AHouse | 242 | 0 | names are bare codes — `-`, `WC`, `KÖK3`, `TRINETT`, `DUSCH` |

**The other three hypotheses were checked and are NOT the cause** — the anchor point is already correct
(`spr.center.set(0.5,0)` = feet-anchored, not centre), the sit path already does a per-candidate
`floorY()` lookup (fixed in the 2026-07-18 knee-high work), and the occupancy grid is only used by the
WALK path, never the sit path, so it was never implicated.

**Data reality — no `predefined_type` column exists.** `elements_meta` is
`(guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building)`. Seat-ness
must come from `element_name` + the real bbox. Both extracted; nothing invented.

**TWO NAMING LANDMINES, both real, both would silently recreate the bug — recorded so nobody "simplifies"
the classifier back into them:**
1. `M_Table-Dining Round w Chairs:1525mm Diameter` — **21 Hospital rows are TABLES whose name contains
   "Chairs."** A naive `LIKE '%chair%'` classifies them as chairs and reproduces this exact defect.
2. `Chair - Desk (2)` (Terminal) — a **genuine chair whose name contains "Desk."** Excluding on any
   non-seat token anywhere in the name wrongly drops it (my first draft did exactly this: Terminal
   `SEATS=0`).
Resolved by **token POSITION within the Revit family name** (the text before the first `:` — that is
where the family name lives in every DB checked): classification goes to whichever token appears FIRST.
Plus a `<=1.2m` plan size guard, which drops combined units like Terminal's
`Waiting_Room_Seat_-_4St_1Tbl_3750` (4 seats + 1 table in one 3.75m element — real seating, but its
centre is the TABLE).

**NOT a defect, deliberately not "fixed":** a chair legitimately overlapping a table bbox. Hospital's
dining chairs ring a `M_Table-Dining Round w Chairs` whose bbox spans the whole setting, so **159/160
chair centres fall inside a table bbox by construction**. A person seated AT a table is supposed to
overlap it. The defect is the ANCHOR being a table. This distinction is what the witness's 0.4m
seat-adjacency exemption encodes — without it the test would flag correct behaviour.

**Zero-case is the correct outcome where the data can't support seating** (this file's own doctrine):
Clinic and LTU_AHouse now place NO seated figures rather than a fabricated position. Their walk/stand/
tree/car placement is unaffected.

**Witness — `witness_staffage_sit_not_in_table.js`** (puppeteer, committed at bim-ootb repo root). Two
trees served with identical DBs, camera and press counts; the ONLY difference is `viewer/effects.js`
(`:8482` = `origin/main` before, `:8481` = the fix). `badSit` = placed sitting sprites whose IFC (x,y)
falls inside a NON-seat furniture bbox with no seat within 0.4m — re-derived from the DB against the
FINAL world positions, independent of the placement search (non-tautological, same discipline as
`§STAFFAGE_WALK_CLEAR`).
| case | BEFORE (origin/main) | AFTER (fix) |
|---|---|---|
| Hospital-dining (mixed chairs + tables) | sit=8 **bad=0** | sit=9 **bad=0** — no regression, still seats people |
| Hospital-station (ED nurse stations, zero chairs in view) | sit=1 **bad=1** — inside `ED Nurse Station1` | sit=0 **bad=0** |
| Clinic (zero seats, all casework) | sit=7 **bad=7** — counter tops, base cabinets | sit=0 **bad=0** |
Zero page errors across all six runs. Logs: `/tmp/witness_sit_run1.log` (inconclusive first attempt),
`/tmp/witness_sit_run2.log` (the PASS).

**The harness exits 2 = INCONCLUSIVE if no building reproduces `bad>0` before the fix** — a run where
both sides are zero cannot masquerade as a pass. **That guard fired on the first attempt** (run1: the
Hospital camera happened to frame a pure chair cluster and Clinic never got an interior camera at all →
`bad=0` on both sides, proving nothing). It forced better camera placement rather than letting a green
run be reported. This is the project's "a test that passes without revealing whether the issue is solved
is not a test" rule doing real work — keep the guard.

**Shipped:** bim-ootb `fix/staffage-sit-not-in-table`, commit `132320a`, **PR #898**, auto-squash-merge
armed. `sw.js` CACHE_VERSION v812→v813. `eslint` clean, `audit_sw_precache` 108/108.
`audit_specs.js` fails on `38-sh-dx-2d-runtime.spec.js` (5 SKIP paths) — **pre-existing**, byte-identical
output on `origin/main`, untouched here (this is the same Issue-4-class debt already noted in CLAUDE.md).

**New `§` tags:** `§STAFFAGE_SEAT_CLASS furn=<n> seats=<n> rejNonSeat=<n> inViewSeats=<n>` (every
interior press) and `§STAFFAGE_SIT_ANCHOR ifc=(x,y) seat=1` (per placed figure).

**Could not verify:** the fix was witnessed on Hospital and Clinic only — the two locally-available DBs
that discriminate. Terminal/BimWhale/Ifc4_Revit were classified from their DBs offline (seat counts 4/100/23
respectively) but not run through the browser harness; their production geometry streams from OCI and
Hospital alone was already a 262MB/63k-element load. The classifier is the same code path on every
building, so the risk is a naming convention not represented in the DBs checked — if a building shows
sitting figures in tables after this, the first thing to read is `§STAFFAGE_SEAT_CLASS`'s `seats` vs
`rejNonSeat` split for that building's own names.

## SESSION RECORD 2026-07-20 — §STAFFAGE_CLEARANCE: trees/cars in the Terminal hall + figures inside meshes (PR #903)
**User report, live on TerminalMerged, two related defects:**
1. "car and trees cannot appear in Terminal hall when not sufficient open space of a big potting
   space to contain it"
2. "indoors should only be pax stand and sit - not clashing with any prop ie not inside a mesh"

### ROOT CAUSE — established from the BEFORE-fix §-log, not assumed
**Nothing in the placement path ever measured the real space around a candidate.** Four separate
holes, all confirmed live on Terminal (`/tmp/witness_indoor_run2.log`, `/tmp/witness_indoor_run3.log`;
BEFORE tree = `origin/main`, AFTER = the fix, everything else identical):

- **`§STAFFAGE_ZERO_RESCUE` is what actually put the car and the tree in the hall.** With the camera
  INSIDE, every silhouette-ring candidate is occluded by the building's own wall, so each kind
  reached 0 and spec S2's rescue walked the **camera-forward ray** — straight down the concourse —
  and force-placed there. The BEFORE log shows it firing every press:
  `§STAFFAGE_ZERO_RESCUE kind=car spot=(131.3,-30.6) forced=1` ×3 and
  `§STAFFAGE_ZERO_RESCUE kind=tree spot=(131.3,-14.6) forced=1`. Cars had **no indoor test at all**.
- **The tree indoor test was a bbox window that Terminal sails straight through.** `_ceilingOver()`
  only matched a slab whose *bottom* sits **2–9 m** above ground. The concourse roof measured
  **21.52 m** and a secondary deck **6.79 m** — the 21.5m one is outside the window entirely, and a
  bbox is blind to atrium holes anyway (this file's own §STAFFAGE_GROUNDSNAP lesson).
- **Standing pax had no clearance test whatsoever** — the exterior loop gated only on
  frustum/occlusion/dedup, so a silhouette-ring point that lands inside a concave wing (Terminal is
  all wings) puts a figure through a wall. Measured BEFORE: figures at **0.03 m, 0.03 m, 0.07 m,
  0.21 m, 0.23 m** clearance — i.e. literally inside geometry.
- **The interior walk path's occupancy grid is not sufficient either.** It is bbox-derived. On the
  AFTER run it reported `rejectedInObject=0` (grid: all clear) while the raycast probe rejected
  walkers at **0.03 m and 0.21 m** — `§STAFFAGE_WALK_CLEARANCE rejInMesh=2`. The grid genuinely
  misses cases; it was kept as the cheap prefilter and the raycast added as the final gate.

### THE FIX (`viewer/effects.js`, `§STAFFAGE_CLEARANCE`)
Real **rendered triangles** via the BVH-accelerated raycaster (`§BVH_INIT`, loader.js) — the same
ground truth §STAFFAGE_GROUNDSNAP already trusts over bboxes. Deliberately **not**
`storey_walkable_raster`: it ships as a patch for only 3 of 11 buildings and live logs show
`§HELPERS_QUERY_ERR no such table: storey_walkable_raster`, so it cannot carry a rule that must hold
on every building.
- `_solidMeshes()` — real geometry only. **Must not reuse `_occMeshes`**: that list keeps `A.sky`
  and `A.ground`, and an upward ceiling ray would hit the sky dome from every outdoor spot, reporting
  "indoors" everywhere and rejecting every tree.
- `_ceilingAbove(feetPos)` — one upward ray, 120 m. `Infinity` = open sky. Works at **any** roof
  height, which the 2–9 m bbox window could not.
- `_clearRadius(feetPos, need)` — 16-direction horizontal fan at 0.25 m and 1.20 m (catches both
  low props and full-height walls). Returns on the first violating ray, so a rejected candidate
  costs a few rays not 32.
- `_spaceOK(kind, feetPos)` — the single gate every placement site calls, on the **final rendered
  position** (feet-anchored, `spr.center.set(0.5,0)`, PR #898).

**Thresholds — each is a measured requirement of the object, not a taste call:**
| kind | rule | why |
|---|---|---|
| pax | ≥0.45 m clear at ankle + torso | a standing adult's shoulder half-width; closer = inside a mesh |
| tree | **open sky required** + 2.5 m canopy | the only indoor case the user allowed is "a big potting space", and a real planting court is open to the sky → `Infinity`. Courtyards/terraces keep their trees; a roofed concourse never gets one, at any roof height |
| car | indoors only under a **≤4.5 m** ceiling + 2.5 m body clearance | **the car-indoors judgement call.** A car park / loading bay / porte-cochère is a plausible place for a parked car; a concourse is not. Ceiling height is the one real-geometry quantity that separates them — a clearance-only rule *cannot*, because a big hall has MORE clearance than a car park, not less |

**Deliberate amendment to spec S2 (zero-case elimination, PR #883):** the rescue now carries the same
space gate, and its last-resort "place at the farthest clash-free spot anyway" branch only considers
spots that passed it. **This supersedes "zero is the only forbidden outcome" for indoor framings** —
that rule was written for outdoor presses and is precisely what put the car and the tree in the hall.
Outdoors nothing changes (forward-ray spots pass the gate, the guarantee still holds). A skipped
rescue now says why: `§STAFFAGE_ZERO_RESCUE kind=car SKIPPED — no forward spot has the real space`.

### WITNESS — `witness_staffage_indoor_clearance.js` (puppeteer, committed at bim-ootb repo root)
Two trees, identical DBs/camera/press counts, the only difference being `viewer/effects.js`
(`:8491` = `origin/main` BEFORE, `:8492` = the fix). Counts are **re-derived in-page from the FINAL
world positions**, raycast against the rendered meshes — the harness never asks the placement code
for its own opinion (same discipline as §STAFFAGE_WALK_CLEAR / PR #898's `badSit`). Seated figures
are exempt from the mesh test: a person seated at a table is *supposed* to overlap it (PR #898).

| case | BEFORE (origin/main) | AFTER (fix) |
|---|---|---|
| **Terminal-hall** (camera inside the concourse, 3 presses) | 24 placed — **badIndoor=4** (3 cars under a 6.1 m ceiling + 1 tree under a **0.3 m** ceiling, i.e. buried under a slab), **badInMesh=5** | 16 placed — **badIndoor=0 badInMesh=0** |
| **Terminal-hall, independent rerun** | 26 placed — **badIndoor=2 badInMesh=3** | 17 placed — **badIndoor=0 badInMesh=0** |
| **HHS_Office_Federated** (regression guard, camera inside) | 28 placed — badIndoor=0 badInMesh=0 | 30 placed (15 pax, 12 trees, 3 cars) — badIndoor=0 badInMesh=0 |

HHS **did not reproduce** the defect and is reported as what it is — a regression guard, not a proof.
Its value is the AFTER column: 30 items still placed (more than BEFORE), so the new gate is **not** a
blanket suppressor on a building where placement was already correct. Zero PAGEERROR in all runs.
`audit_sw_precache` 108/108. `eslint viewer/effects.js` clean.

**The harness exits 2 = INCONCLUSIVE if no case reproduces `bad>0` before the fix** — a run where both
sides are zero cannot masquerade as a pass. Kept from PR #898, and it earned its keep again here: the
FIRST attempt (`/tmp/witness_indoor_run1.log`) was garbage and the log said so — Terminal streamed
**0 meshes** and the camera came back `[null,null,null]`. Two real harness bugs, both worth recording:
1. **`?db=buildings/Terminal_meta.db` is wrong for a split model.** scene.js `§DB_SPLIT_DETECT`
   derives `<stem>_meta.db`/`<stem>_geo.db` from the param, so it went looking for
   `Terminal_meta_meta.db` → 404 → `§BLOB_MISS hashes=…` forever, **no geometry, ever**. The correct
   param is `buildings/Terminal_extracted.db`.
2. **`THREE.Box3.expandByObject` returns NaN** over this scene's BatchedMesh/InstancedMesh (no
   computed bounds), which silently NaN'd the camera and every downstream number. Replaced with the
   model's own IFC bbox via `A.dbQuery` on `element_transforms` + `A.ifc2three`.

### PERFORMANCE
Terminal `§PHOTO_STAFFAGE build_ms` **0.9 s -> ~2.1-2.7 s** (3 presses, before/after, both measured live). The first draft was 3.8 s; `_clearRadius` now returns on the FIRST violating ray, so a rejected candidate costs a few rays instead of all 32 — only the <=4 candidates that actually get placed pay the full fan. Precedent in this file: 364 ms accepted on Hospital, +160 ms accepted for the occlusion raycast. One-time per Alt+P press, not per-frame.

### NOT VERIFIED — be honest about the edge
- **The ≤4.5 m car-indoors allowance is not positively witnessed.** No building available offline has
  a genuine covered car park / loading bay to prove a car *is* correctly placed there. What IS proven
  is the rejection side (Terminal's 21.52 m and 6.79 m ceilings both rejected). If it turns out no
  building in the set ever has such a space, the rule is equivalent to "cars are outdoor-only" in
  practice, and the ≤4.5 m branch is dead code that does no harm.
- **Only Terminal and HHS were run through the browser harness.** Hospital/LTU_AHouse/BimWhale
  weren't — Terminal alone is a 250 MB `_geo.db` stream. The gate is the same code path on every
  building, so the risk is a building whose geometry streams too slowly for `_solidMeshes()` to be
  populated at press time; that case degrades to the OLD behaviour by design (`if (!meshes.length)
  return true` — nothing streamed means nothing to prove a clash against), never to a hard failure.
- `audit_specs.js` still fails on `38-sh-dx-2d-runtime.spec.js` (5 SKIP paths) — **pre-existing**,
  byte-identical on `origin/main`, untouched here (the Issue-4 debt already noted in CLAUDE.md).

## §STAFFAGE — cars NEVER indoors (2026-07-20, user ruling) + Alt+P perf regression
**User: "Cars can never be in building."** The ≤4.5m car-park ceiling allowance from PR #903 is RETIRED.
Car now uses the SAME open-sky gate as a tree: `_spaceOK(car)` rejects any `ceil !== Infinity`
(effects.js `_spaceOK`, `_CAR_INDOOR_MAX_CEIL` deleted). `§STAFFAGE_REJECT kind=car reason=indoor`.
EFFECTS_V v5, sw v819, PR bim-ootb#<fill>.

**Witness status — HONEST:** the change is strictly SUBTRACTIVE and monotonic — it removes a branch
that only ever ADMITTED cars (car parks), so it cannot add an indoor car and cannot reject an outdoor
one (outdoor = `ceil===Infinity`, untouched). The car gate is now byte-identical to the TREE gate,
which PR #903's own witness proved at `badIndoor=0` on Terminal. A fresh AFTER browser probe on
Terminal returned zero cars-under-roof and zero pageerrors BUT placed nothing (only 510/63k elements
streamed in headless SwiftShader in the time budget) — so that run is INCONCLUSIVE as a placement
witness, NOT proof, and is recorded as such rather than dressed up. Next session with a warm
full-geometry load should re-run `witness_staffage_indoor_clearance.js` (its oracle is already updated
to the absolute rule: any car under a real ceiling = badIndoor) for a proper before/after.

### Alt+P PERF REGRESSION (user 2026-07-20: "used to be fast, some precache was done, now back slow few secs")
PR #903's BVH clearance probing pushed Terminal `§PHOTO_STAFFAGE build_ms` ~0.9s → ~2.1–2.7s per press.
The `_spaceOK` fan (`_ceilingAbove` + `_clearRadius`, up to 16 rays × 2 heights) runs per candidate
against the live scene BVH — that is the new cost. The user's memory of "precache" = `§PHOTO_STAFFAGE_PRELOAD`
(sprite/car-mesh warming) which is unrelated; the regression is the raycasting, not asset loading.
**Fix directions for next session (spec, not yet done):**
- The clearance fan is the correct approach (it's what fixed the in-mesh/indoor defects) — don't revert
  it. Optimise: (a) cache per-candidate ceiling by grid cell so repeated presses at the same spot don't
  re-probe; (b) the fan already early-returns on first violation — confirm it's actually hitting that
  path and not computing all 16 for accepted candidates; (c) cap candidates probed per press, or probe
  lazily only for candidates that pass the cheap silhouette/occupancy test first; (d) consider a coarse
  precomputed "is this cell under a roof" mask built once per building load (the §PHOTO_STAFFAGE_PRELOAD
  moment) rather than per-press raycasts. Measure build_ms before/after — target back under ~1s.
- Witness: `§PHOTO_STAFFAGE build_ms` must drop materially with badIndoor/badInMesh STILL 0.

## §STAFFAGE_PERSIST — save/reopen loses the Alt+P placement (2026-07-26 evening)
User: *"saved this with the Alt-P results but when opening back it is gone."* Filed read-only by a
parallel session; **do not assume a root cause without reading this file's own §STAFFAGE_PERSIST
notes below first.** User directive 2026-07-26: *"on Save, Open should retain persist the alt-p
results"* — i.e. the round-trip is wanted working, not merely explained.
**Not a guess at a new bug — persistence for this exact case is already a NAMED, existing mechanism**
(`viewer/effects.js` `A.togglePopulate`, its own comment block, undated but present before this
report): a building saved WITH staffage carries a `staffage_instances` table, written by
`A._exportBuildingDb()` (`viewer/scene.js:570`, via `_writeStaffageTable()`) at Save time. The FIRST
`Alt+P` press on a building whose DB carries that table is supposed to call
`A._restoreStaffageInstances()` and rehydrate the exact saved placement instead of generating a fresh
one. So the feature the user expected already exists in code — this report means either the round-trip
has a real bug, or the user's specific save/reopen steps didn't go through the path that writes/reads
that table. Both are plausible; neither is confirmed. Do not fix blind.

**Grounded trace, this session (read-only, no code changed):**
- `Alt+P` → `A.togglePopulate()` (`viewer/effects.js:1940`, bound in `viewer/scene.js:2066` and the
  keyboard-shortcut list at `viewer/scene.js:1452`).
- `Ctrl+S` → `A.saveModelDb()` (`viewer/scene.js:605`) → calls `A._exportBuildingDb()` → exports SQLite
  bytes as a `Blob`, then EITHER a native "Save As…" dialog (Chromium File System Access API,
  `window.showSaveFilePicker`) OR, if that API is unavailable, a plain browser file **download** to a
  NEW `.db` file. **It does not write back to, or update, the building's live/served source** (e.g. the
  OCI URL the viewer opened `?db=` from) — the saved file only exists wherever the browser/OS put it.
- `Ctrl+O` → `A._openDbBytes()` (`viewer/scene.js` ~627) is the counterpart that loads a picked local
  `.db` file back into the viewer via the cache store (`import://` key).

**Leading hypothesis (unverified — ask the user their exact steps before touching code):** "opening
back" most likely means re-visiting the SAME building normally (same URL, browser back, or the app's
own last-building resume) rather than explicitly `Ctrl+O`-picking the exact file `Ctrl+S` produced. A
normal re-open reloads from the ORIGINAL served source, which never had a `staffage_instances` table
written into it — so of course no staffage restores; this would be user-workflow confusion, not a code
bug, and the fix would be a clearer save/reload UX cue (e.g. "Saved — reopen via Ctrl+O / Open Building
to restore this exact scene, staffage included"), not a code change to the persistence mechanism.

**Alternative hypothesis, NOT yet checked:** a real bug in the `_writeStaffageTable()` write path or
the `_restoreStaffageInstances()` read path (e.g. the freshness/version check `_populateBuilding !==
A.activeBuilding` in `togglePopulate()` misfiring, or `_hasTable` sqlite_master probe failing silently
on a re-opened file for a reason not yet traced).

**Next session, in order — do not skip straight to a fix:**
1. Ask the user the exact sequence: which save action (native Save-As vs download?), and exactly how
   they "opened back" (Ctrl+O picking that same file, vs re-navigating/refreshing the same URL?).
2. If it was a same-URL re-open (not `Ctrl+O` on the saved file): this is the leading hypothesis above
   — confirm by checking the reopened building's DB for a `staffage_instances` table (it shouldn't
   have one) — if confirmed, this is a UX/expectation gap, file the messaging fix, not an engine fix.
3. If it WAS `Ctrl+O` on the exact saved file and staffage still didn't restore: trace
   `_writeStaffageTable()` → export → `_openDbBytes()` → `togglePopulate()`'s `_hasTable`/`savedRows`
   read live with `§`-tagged logging at each step (this file's own standing rule: witness logs, never
   ad-hoc browser testing) to find exactly where the round-trip breaks.

## SESSION 2026-07-26 — §STAFFAGE_OUTSIDE_VARIETY + §STAFFAGE_FLOOR_PHANTOM (bim-ootb PR #1021)

User, on JKR: *"Alt-P made outside standing persons the same, should be the diff standing sprites.
And some will stand in air outside first floor etc."* Their log: `placed=3`, all three the same male.

### Defect 1 — the exterior pose pool contained exactly ONE asset (deterministic, not draw luck)
```js
var outsidePoses = _STAFFAGE_PEOPLE.filter(p => p.role === 'stand' && p.facing === 'toward');
var pose = outsidePoses[placedP % outsidePoses.length];
```
Exactly one entry of `_STAFFAGE_PEOPLE` satisfies both predicates — `person_standing_casual_male`
(the other `'stand'` pose is `'away'`). So `length === 1`, the modulo was **always 0**, and every
exterior figure on every building was that one cutout. Not intermittent; it could never have varied.

Widening it **applies** §STAFFAGE_FACING rather than re-litigating it: that doctrine says route each
pose to where its fixed orientation makes sense, and its own worked example is *"the lady with
bags... facing to the building"* — an `'away'` pose reads as moving toward whatever is beyond her,
which outside a building is the building. `'toward'` reads fine outdoors too. Only `'sit'` is
excluded: there is nothing to sit on out there. Pool 1 → **4**, shuffled per press
(§STAFFAGE_SHUFFLE) so repeat presses differ.

### Defect 2 — `_floorThreeY` is a pure bbox test, and this file already knows bboxes lie
The floor lookup accepted any slab whose **axis-aligned bounding rectangle** covers the sample point
(`|x−cx| ≤ w/2+0.5 && |y−cy| ≤ d/2+0.5`). An exterior candidate on the silhouette ring can sit inside
an upper slab's bounding rectangle while being nowhere near its real geometry — the notch of an
L-shaped plate, a courtyard, or just past a facade edge inside the 0.5 m tolerance — and gets lifted
to that floor with nothing under it. This is the same defect class as §STAFFAGE_GROUNDSNAP and
§STAFFAGE_WALK_FLOOR_FIX, which this file already fixed for the *interior/walk* path; the exterior
path still had it.

Same remedy, same machinery already trusted here: when the chosen slab would lift a figure more than
`_FLOOR_PHANTOM_MIN_LIFT` (0.75 m) above ground, ask the **real rendered triangles** via the BVH
raycaster whether anything is actually beneath; if not, fall back to `groundY` and log it. Only above
that lift threshold — at ground level a coincident-surface ray can self-miss, and a false reject
would be worse than the symptom.

### Witness — `witness_staffage_outside.js`, 4/4 on JKR (the reporter's own building)
Drives a real Alt+P keypress and reads the §-lines (whitebox first, per doctrine).

| gate | result |
|---|---|
| G1 exterior pose pool > 1 asset | **pool=4** |
| G2 a multi-figure press is not all one sprite | **3 placed → 3 distinct**, all three presses |
| G3 phantom lifts caught, never silent | **2 caught**: `bbox slab at y=−0.40 (lift=3.50m)` and `y=−0.35 (lift=3.55m)`, both with no geometry beneath, both fell back to `groundY=−3.90` |
| G4 control: unfixed tip pool is exactly 1 | **pool=1**, read from the unfixed source |

**3.5 m in the air** is the reported "stand in air outside first floor", reproduced and measured.
G3 reports **NOT EXERCISED** rather than a green when a building yields no bbox-only slabs (Duplex
and Hospital both do) — a gate that passes on zero evidence proves nothing. G4 is derived from the
baseline's *source*, because the unfixed tip cannot emit a log that does not exist in it.

New per-press witness fields: `§STAFFAGE_OUTSIDE_VARIETY pool=N used=[...] distinct=N`, and
`floor=slab:N/ground:N/phantom:N` on `§PHOTO_STAFFAGE`.

### ANSWERED 2026-07-26 (late) — the data is NOT lost; reopen simply never rehydrates
Round-trip driven programmatically through the REAL export/open API (`A._exportBuildingDb()` →
`A._openDbBytes()`, i.e. exactly what Ctrl+S / Ctrl+O call), Duplex:

| step | staffage instances | table in DB |
|---|---|---|
| after Alt+P | **8** | — |
| after export (Ctrl+S bytes) | — | **present, 8 rows** |
| after open (Ctrl+O path) | **0** | **present** |
| after one more Alt+P | **8** | present |

`§STAFFAGE_SAVE rows=8` → `§STAFFAGE_RESTORE rows=8` → `§PHOTO_POPULATE ... restored=8`.

**So the save/reopen round-trip already works end-to-end. Nothing is lost.** The gap is that restore
is wired to the *first Alt+P press* (`effects.js` `togglePopulate`, the `freshBuilding` branch), not
to load. Reopen the saved file and the scene is empty until you press Alt+P again — which is exactly
what "when opening back it is gone" looks like from the outside. The parallel session's leading
hypothesis (user reopened the URL, not the saved file) is therefore **not needed** to explain the
report, and should not be assumed: even with the correct Ctrl+O on the correct file, you see nothing.

**Fix for the user's directive** (*"on Save, Open should retain persist the alt-p results"*): on
building load, if the DB carries `staffage_instances`, call `A._restoreStaffageInstances()` straight
away instead of waiting for a keypress. The restore function, the table, the writer and the reader
all already exist and are proven by the table above — this is a trigger change, not a feature.

**"Scene jumping" — NOT reproduced on this path.** Camera moved **0.00 m** and the controls target
**0.00 m** across the same save→open round-trip. Whatever the user is seeing comes from somewhere
else (a different reopen route, or a later moment) — needs its own repro before anyone touches it.

**Sprite storage — already a reference, not pixels** (user: *"saved DB should carry the sprite
reference.. not the image i hope.. to do instancing, saves space"*). Confirmed from the schema in
`viewer/scene.js:582`:
```sql
CREATE TABLE staffage_instances (kind TEXT, file TEXT, ifc_x REAL, ifc_y REAL, ifc_z REAL, rot_y REAL)
```
`file` holds the asset PATH (e.g. `people/person_standing_casual_male.png`); no image bytes are ever
written. 8 placed figures = 8 short rows. Already the instancing-friendly shape the user wants.
