# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** fix the cinematic Tour (`[WALK] START cinematic tour`, `viewer/tour.js` `A._startFlyTour`)
freezing after it reports it started, on `LTU_AHouse` (122k elements) live at
`https://red1oon.github.io/bim-ootb/`. Nothing else — this is a targeted one-file fix, not a Tour
redesign.
**Read the log after every run.** The witness is: after clicking Fly Tour, the camera position must
actually change across consecutive real animation frames — not just the console log saying the tour
started. A log line claiming success is not evidence; camera movement is.
**Status: ✅ DONE (retired to done/ 2026-07-20). Shipped live v825, §2 A/B-CONFIRMED (§9); no adverse live report since (user retested the same build extensively same day). The §5 streaming-rebuild finding moved to `prompts/TM_STREAM_REBUILD_COALESCE.md` — the one still-open item.** Original resolution status:** §2 CONFIRMED by A/B witness on LTU_AHouse
(fix present = camera moves continuously; fix absent = tour freezes after one 0.2-unit twitch — §9).
Fix merged bim-ootb PR #914 (squash `a71a699`), witness-criterion tightening PR #915. Awaiting the
user's own live check; if the live symptom persists post-v825, that is a NEW finding, not this bug.
**Spec-first:** §2 (root cause), §7 (the Hospital test-setup trap), §9 (verification record) before
touching anything further.

---

## 1. Symptom (as reported live, LTU_AHouse, 2026-07-20)
User: "Still stuck." Console log (paraphrased, full log had this session's context) showed:
- `[TOUR] §FLY_ROUTE storeys=5 stops=10/11 skipped=1 ... pts=90 illegalChords=4/83`
- `[WALK] GraphRoute: 11 stops, 90 pts, stairs ↑`
- `[WALK] FlyPath: 84 pts, 1139m, 7 seg(s)`
- `[TOUR] §TOUR_PATH {"actions":[...25 actions, flyPath durations totalling several minutes...]}`
- `[WALK] Tour: 25 actions, 4 storeys, 84 interior pts`
- `[WALK] START cinematic tour: 25 actions`
- immediately followed by: `§IDLE_GATE wake` → `§IDLE_GATE park — rAF chain stopped (self-parking, 0 frames)`
- then only unrelated activity (`§SFX_SUSPEND idle`, a 17.4s `§BVH_DEFERRED` background build) — no
  further tour/camera activity ever logged. The camera does not move.

So the route-planning and tour-script construction all completed successfully (real geometry, real
door-legality checks, a real 84-point flight path) — the tour object is fully built and `walkMode` is
supposedly driving it. It just never visibly plays.

**Two other warnings in the same log are RED HERRINGS, already handled gracefully by existing code —
do not chase them:**
- `§HELPERS_QUERY_ERR no such table: storey_walkable_raster` — `viewer/effects.js:911,3164` and
  `viewer/navigate_find.js:960` already document this table as "patch-shipped for only 3 of 11
  buildings, NOT dependable" — its absence is an expected, tolerated case, not a bug.
- `§PATH_LEGAL_DETOUR_FAIL storey=VÅNING 1/3 no legal detour among 202/240 doors` (repeated) — this is
  route-planning DEGRADING gracefully (falls back / logs and continues); the tour still finished
  building a valid 25-action script afterward (`[WALK] Tour: 25 actions...`). Not the freeze cause.

## 2. Root cause (traced this session, high confidence)
`viewer/tour.js` `A._startFlyTour` (~line 114-144) builds the tour and does:
```js
A.walkMode = true;
A.walkActions = tour;
... // walkActionIdx, walkActionT, etc.
A.wlog(`START cinematic tour: ${tour.length} actions`);
```
**It never calls `A.markDirty()` (or any other wake) after setting `walkMode = true`.**

Compare `viewer/main.js`'s render loop (`animate()`, ~line 808-820) — the §IDLE-PARK mechanism:
```js
var _awake = _needsRender || APP.streaming || APP.walkModeActive || APP.walkMode ||
             APP.flyActive || _orbiting || _pipelinesCompiling;
if (!_awake) {
  _rafId = null;               // the chain STOPS — nothing is scheduled
  ... log §IDLE_GATE park ...
  return;                      // <-- no requestAnimationFrame call. Nothing will call animate() again
}                               //     until something explicitly restarts it.
_rafId = requestAnimationFrame(animate);
... // controls.update(), walkTick()/flyTick(), etc. — the actual per-frame work
```
`APP.markDirty = () => { _needsRender = true; _startLoop(); };` (`main.js:660`) is the ONLY way to
restart a chain that has already self-parked (`_rafId == null`) — it's the officially documented
pattern (comments already in the file: `main.js:812` "markDirty()/controls/input revive it via
_startLoop", `tour.js:25` "revive the rAF chain on programmatic resume", `tour.js:36` "revive the rAF
chain (a parked...)" — that SECOND comment is on the OTHER tour path, `toggleFlyAround`, which DOES
call `markDirty()` correctly; `_startFlyTour` is the one path that's missing it).

**The failure sequence:** the viewer had gone idle (self-parked, `_rafId = null`) at some point before
the tour started — plausible on a 122k-element building sitting still while the Fly Tour route/legality
computation runs (visible in the log: several `§IDLE_GATE park` cycles fire in the seconds *before*
tour start, e.g. during BVH/streaming settle). When `_startFlyTour` then sets `A.walkMode = true`, it
is setting a flag that `_awake` *would* read as true — but nothing calls `requestAnimationFrame(animate)`
again to re-evaluate `_awake` in the first place, because the chain is stopped. `walkMode` sits true,
unread, forever, and `walkTick()`/`flyTick()` (which actually move the camera along the flight path)
never run a single time. This matches every observed symptom exactly: route+script build to completion
and log success, then total silence with zero camera movement.

## 3. A draft fix (UNVERIFIED — this session tried it, verification failed for an unrelated reason, §7)
In `viewer/tour.js`, in `A._startFlyTour`, immediately after `A.walkMode = true;` (and also on the
`orbit fly` fallback branch further down, which sets `A.flyActive = false` only, and separately after
whatever sets `A.flyActive = true` in that fallback if it needs the same treatment — check both exit
paths of this function), add:
```js
if (A.markDirty) A.markDirty();
```
This mirrors the exact pattern already correct in `toggleFlyAround` (same file, ~line 25 and ~line 36).
**Do not just paste this in blind** — re-read the full `_startFlyTour` function body first (it has an
early-return branch for "no walk data — using orbit fly" that sets different flags); make sure the wake
call is placed so BOTH the walkMode-tour path and the orbit-fallback path revive the loop, not just one.

## 4. Verification — this is the part that actually needs care
**Non-witness:** "the fix compiles" / "the log says the tour started." Both were already true before
the fix and the bug still existed. The ONLY real proof is the camera's world position changing across
consecutive animation frames after clicking Fly Tour, starting from a genuinely idle (parked) state.

**W-TOUR-WAKE (blocking).** Reproduce the exact bug precondition first: load a building, let the viewer
go idle (wait for `§IDLE_GATE park` in the console, or force it — do NOT skip this: if the loop is
already awake for some other reason when you test, you will get a false pass), THEN start the Fly Tour.
Confirm via `console.log`/a probe: (a) `§IDLE_GATE wake` fires (or the loop was already running) — the
important part is that `_rafId` becomes non-null, (b) `APP.camera.position` differs at t=0 vs t=2s vs
t=5s into the tour — actual numbers, not just "it looks like it's flying" from a screenshot. A
Puppeteer witness (see `viewer/witness_*.js` for the house style — e.g. drive `page.evaluate` to snapshot
`APP.camera.position` before/after a delay, click the Fly Tour button via its real DOM id, same
convention already used by this project's other witness scripts) is the right shape here; a manual
screenshot-only check is not sufficient per this project's Log Mandate.

**Test on LTU_AHouse specifically, not a substitute building — §7 shows why this matters more than it
sounds.** (`https://red1oon.github.io/bim-ootb/viewer/viewer.html?db=/buildings/LTU_AHouse_extracted.db`
or via OCI URL) since that's where the bug was reported — but also spot-check on a smaller building
(Hospital/Terminal) since the idle-park timing that exposes this bug may depend on how long streaming/
BVH work keeps the loop naturally awake before the user clicks Fly Tour; a small building may reach idle
faster or slower, changing whether the race is hit at all.

## 5. Separate, secondary finding from the same testing session — do NOT conflate with §2's fix
A different log excerpt from the same LTU_AHouse session (Time Machine + Shadow, not Tour) showed, while
`LTU_AHouse` was still progressively streaming in (`§PROGRESSIVE_FLUSH at=500/122330` → `54500/122330` →
`102500/122330`), TEN-PLUS repeated cycles of:
```
§PERF_INCR_INDEX built meshes=<growing> events=<growing> ms=50-159
§PERF_TRAVERSE ms=20-41 objs=<growing> skipped=0 mode=full span=0h cand=0
```
Each streaming batch bumps `A._metaGen` (new geometry), which correctly invalidates the Time Machine's
`§PERF_INCR` event index (`_tmSceneSig` change → `_tmBuildEventIndex()` rebuild → `_incrPrimed=false` →
next pass forced `mode=full`) — this is CORRECT behavior per the index-staleness design, not a bug, but
it means every one of these ~10+ streaming batches costs a real 50-160ms rebuild + 20-40ms full traverse
on a 122k-element building, stacking up real CPU time specifically because Time Machine was turned ON
*while streaming was still in progress*. This is the exact interaction already flagged as a known risk in
`prompts/TM_INCREMENTAL_RENDER_PERF.md` §Phase 3 ("a bbox↔mesh swap bumps `A._metaGen` → rebuilds the
event index (108ms)... fatal if it happens per playback tick — needs targeted per-mesh invalidation, not
a global `_metaGen` bump") — except here it's streaming batches doing the bumping, not a DLOD swap.
**Out of scope for THIS file's fix** (§1-4 above is the Tour freeze); noted here so it isn't lost, and
because turning TM on early during a big building's load is a real, reproducible way to make LTU feel
sluggish that a user testing "why is this slow" might otherwise blame on the Tour bug or vice versa. If
picked up separately: the fix shape is almost certainly "don't force a full TM rebuild on every streaming
batch — coalesce/debounce the metaGen-triggered rebuild, or defer it until streaming completes."

## 6. Scope boundaries
- **In:** the one missing `markDirty()` call (both exit paths of `_startFlyTour`) + the witness that
  proves the render loop actually revives and the camera actually moves.
- **Out:** §5's streaming/TM interaction (separate lane, cite this file if picked up), the
  `storey_walkable_raster`/`m_bom_line` missing-table warnings (already handled gracefully, not bugs),
  any redesign of the Tour route/legality logic (`PATH_LEGAL_DETOUR_FAIL` — that's an existing, accepted
  degradation path, not part of this freeze).

## 7. This session's verification attempt — FAILED, and why that's not evidence either way
This session wrote the §3 draft fix (in an untracked scratch worktree, `/tmp/wt-tour-fix` on this
machine — NOT committed or pushed anywhere; if that path is gone by the time you read this, the diff
is fully reproducible from §3, it's two `if (A.markDirty) A.markDirty();` lines) and tried to verify it
with a Puppeteer witness (`witness_tour_wake.js`, same scratch worktree) that: loads a building, waits
for genuine `§IDLE_GATE park`, calls `window.toggleFlyAround()`, waits for `walkMode` to flip true, then
samples camera position over several seconds.

**Result: `walkMode` never became `true` at all** — `flyActive=true walkMode=false` after the toggle,
meaning `A.buildTour()` returned nothing (fell into the "No walk data — using orbit fly" branch, §2's
code excerpt, NOT the `walkMode` branch this fix targets). The test was run against **Hospital**, not
LTU_AHouse. This is almost certainly a **test-building mismatch, not evidence about the fix**:
Hospital apparently lacks whatever room-graph/corridor data `buildTour()` needs to produce a real tour,
while the ORIGINAL bug report's log (§1) shows LTU_AHouse clearly has that data (`FLY_ROUTE storeys=5
stops=10/11`, `84 interior pts`, a fully-built 25-action script) — LTU_AHouse is where `buildTour()`
actually succeeds and where `walkMode` actually goes true, i.e. the ONLY building this session had
direct evidence would even reach the code path being fixed.

**What this means for the next session:** re-run the SAME witness shape, but point it at LTU_AHouse
(or confirm via console which building actually gets a non-empty `buildTour()` result first). Do not
conclude anything about §2's diagnosis from this session's Hospital run — it never tested the actual
code path in question. If LTU_AHouse also fails to reach `walkMode=true` in a headless/Puppeteer
context specifically (as opposed to a live browser), that would be a NEW, separate finding (headless
swiftshader environment issue, not the reported live bug) — distinguish the two before concluding
anything.

## 8. Provenance
Diagnosed 2026-07-20 from a live user report on `LTU_AHouse` (`https://red1oon.github.io/bim-ootb/`)
during the same session that shipped `TM_INCREMENTAL_RENDER_PERF.md` Phase 2 (bim-ootb PR #909, #912).
Root cause traced via direct code reading (`viewer/tour.js`, `viewer/main.js` `animate()`/`markDirty`).
A draft fix was written and an attempt to verify it failed for a test-setup reason, not a disproof —
see §7. Handed over 2026-07-20 UNFIXED, UNVERIFIED: next session's job is to confirm §2 first.

**Independent corroboration (Fable-model pass, same day):** re-derived the same root cause from a fresh
read of `viewer/tour.js`/`main.js` while investigating `TM_INCREMENTAL_RENDER_PERF.md` §0c's "lethargy"
report, and called the §2 hypothesis "solid" — this is a second, independent reading agreeing with §2,
not just this session's own conclusion. Still UNVERIFIED against a real repro (§7) — corroboration on
the diagnosis is not the same as confirmation the §3 fix actually resolves it. Fable also flagged the
Tour freeze as the likely explanation for "missing frames" reading as general lethargy in §0c's report
— a plausible link between the two files, not yet confirmed either.

## 9. RESOLUTION (2026-07-20, Fable session) — §2 confirmed A/B, fix shipped v825
**Fix (bim-ootb PR #914, squash `a71a699`, live v825):** exactly §3's shape — `if (A.markDirty)
A.markDirty();` after `walkMode = true` in `_startFlyTour` AND on the orbit-fallback exit path.
The third exit (zero fly targets → `flyActive=false`) needs no wake: nothing animates. Includes
sw.js v824→v825 + `sw.js?v=530`.

**W-TOUR-WAKE, fixed build (LTU_AHouse, localhost:8414 serving `/tmp/wt-tour-fix`):** streaming
drained → genuine `§IDLE_GATE park` observed in page logs (the §4 precondition, not skipped) →
`toggleFlyAround()` → `walkMode === true` (real tour branch, `§FLY_ROUTE storeys=5 stops=10/11
... pts=90` — same route signature as §1's live report) → camera samples at 2s intervals:
`(180,240,180) → (358.5,478.2,358.5) → (336.4,449.6,336.5) → (316.4,424.4,316.7) →
(297.9,402.1,298.4)` — continuous movement, every sample distinct. PASS, zero PAGEERROR.

**Control (same worktree, `tour.js` restored to pre-fix `58a9f2a` content, same witness, same
building):** `walkMode === true`, route built identically — then camera `(383.02,510.70,383.02)`
twitched once to `(382.81,510.69,382.81)` during planning and stayed BIT-IDENTICAL across the
final three samples (6s). The freeze, reproduced headless. Fix present vs absent is the only
variable → §2 is the confirmed cause, not just a correlated hypothesis.

**Witness lesson → PR #915:** the original `moved` check compared samples against baseline only,
so the control's single pre-freeze twitch scored PASS (exit 0) despite the freeze being plainly
visible in the samples. Tightened to require movement between the LAST two samples — on the
recorded data: fixed PASS, control FAIL. Read the samples, not the exit code (Log Mandate held;
the exit code alone would have called the control a pass).

**§7's headless caveat is now answered:** LTU_AHouse DOES reach `walkMode=true` under headless
swiftshader — the Hospital failure was purely the missing room-graph data, as §7 suspected.
