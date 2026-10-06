# CWRoadBakeIssues — Civil Works road film: open Time Machine build-up issues (dump for an outside reviewer)

# ⚠ DO NOT REMOVE
- **Scope:** a self-contained relay of the open build-up defects in the Civil Works (road) Alt+C film, for a second
  AI (DeepSeek) to look for a clue. Read-only dump. No fix is claimed here. Owner lane: `CIVIL_HIGHWAY_JELAPANG.md`.
- **Read the log after every run.** Every number below is copied from a bake log line (`§` tags); none is re-derived.
- Written 2026-10-06 from bake v6 (`~/Videos/CivilWorks_film_v6_page.log` / `_cli.log`), code at bim-ootb `origin/main` 9f19b6e3.

## 0. What the system is (one paragraph for the reviewer)
A browser-only BIM viewer (three.js + sql.js, no server). An IFC model is extracted into ONE SQLite file. A
"Time Machine" (`viewer/time_machine.js`, ~10k lines) replays a 4D schedule (`kernel_ops`: one op per element with
`start_ts`/`end_ts`) and decides, every tick, which element is drawn. Elements are mostly drawn through three.js
**BatchedMesh** / **InstancedMesh** (one object holds thousands of elements; per-element on/off via
`setVisibleAt(slot)` or a zero-scale instance matrix). A headless bake (`cli_silent_bake.js`, Playwright + real GPU)
steps the cursor across 1,469 frames and records an MP4. The algorithm was built and tuned on BUILDINGS
(Hospital, Terminal, houses). The road model (19,892 elements, 19,559 scheduled, 14 disciplines, 15 IFC files from
Civil 3D + Revit) is its first civil/linear model.

## 1. Symptom list (user-reported, from watching v6)
| # | symptom | where |
|---|---|---|
| S1 | "the road seems has portions not there" | narrated film 55 s ≈ source frame ~1401 (closing orbit, build should be complete) |
| S2 | day counter stuck | §CPE_DAY_COUNTER `day=18 of=79` from frame 120 to 600 (≈32 s of film) |
| S3 | clock not seen | no clock HUD in the film |
| S4 | film "duration too short" for a 79/80-day programme | 98 s film |
| S5 | sky reflections / ghost boxes on horizon | residual 9.5 % frames flagged (separate lane, not in this dump) |

## 2. What the log rules OUT (do not chase these)
- **Not unplaced elements.** `§TIME_MACHINE ON — 19559 ops, 80 days`; per-day `§COST_ODOMETER` stops at `day=79
  placed=19531/19559`, but `§COST_ODOMETER_FINAL cost=1336814 total=1336814 => PASS` — all cost booked ⇒ all placed.
  The "28 missing" was a log-read slip (last day not logged).
- **Not ops coverage.** `§TM_OPS_CHECK total=19559 place=19559`; `§CPE_BUILDUP_SOURCE covered=19559/19559 pct=100%`.
- **Not the DLOD proxy.** `§DLOD_TM_GATE elements=9706 threshold=50000 large=false` ⇒ `_isLargeBuilding=false` ⇒
  `_dlodEngaged()` returns false ⇒ the `HideForProxy` terms below are all false on this model.
- **`§FRAME_COST held=425 visible=254 inFrustum=4` is NOT evidence of culling.** It counts helper objects too, and
  its `inFrustum` tests `geometry.boundingSphere` (the base geometry) of an InstancedMesh, not its instances.

## 3. ISSUE A (prime suspect for S1) — staged slots are never revisited after their wait ends
### Evidence
```
§XRAY_EDGES n=402809 ms=1292.6 staged=12112/19559 (elements whose last support carrier finishes after their own reveal)
§PERF_INCR_INDEX built meshes=416 events=58677 ms=12.0
§CPE_BUILDUP_PLACED frame=661 guid=1Bu2u5_c17kPc0rcYqJtWC storey="FRL ABT B" op=frontier visible=true  host=BM — drawn
§CPE_BUILDUP_PLACED frame=662 guid=1Bu2u5_c17kPc0rcYqJtWC storey="FRL ABT B" op=placed   visible=false host=BM — mesh exists, left hidden
§CPE_BUILDUP_PLACED_SUMMARY watched=8 drawn=4 neverDrawn=[FRL ABT A, CROSSHEAD PIER 14, TOP DECK SLAB, DECKSLAB]  (all op=placed, mesh=found)
```
62 % of the road is "X-ray staged". A watched slab is drawn while it is the build frontier, goes hidden the very next
frame once it is merely `placed`, and 4 of 8 watched slabs are never drawn again before the film ends.

### The visibility gate (BatchedMesh branch; Single and Instanced branches have the same shape)
```js
// time_machine.js ~1751
var bHideForProxy = _dlodOn && !!placed[bg] && !frontier[bg] && recent[bg] === undefined && !_dlodInView(bg); // false here
var bStaged = !frontier[bg] && (_tmXraySolidifyTs[bg] !== undefined && cursorMs < _tmXraySolidifyTs[bg]);
var bShow = (placed[bg] || frontier[bg] || recent[bg] !== undefined) && !bHideForProxy && !bStaged;
if (bShow) obj.setVisibleAt(sid, true); else obj.setVisibleAt(sid, false);
```
So a placed element is hidden while `cursor < solidifyTs` ("its support is not finished yet").

### The delta skip in front of it
```js
// time_machine.js ~1742 — whole BatchedMesh/InstancedMesh objects are skipped when nothing in them changed
if (_incrOK && !_tmHasEventIn(_evMesh[obj.id], _dLo, _dHi)) { _perfSkipped++; return; }
```
```js
// time_machine.js ~1370 — the per-mesh event index
function _tmBuildEventIndex(app, lingerMs) {
  var guidT = Object.create(null);
  for (var i = 0; i < _ops.length; i++) {
    var op = _ops[i]; var g = op.output_guid || (op.input_guids && op.input_guids[0]);
    if (!g) continue;
    (guidT[g] || (guidT[g] = [])).push(op.start_ts, op.end_ts, op.end_ts + lingerMs);   // ← own times only
  }
  // ... per mesh: concatenate guidT of every member guid, sort → _evMesh[meshId]
}
```
**Suspected defect:** the index holds each element's OWN start/end/linger, but NOT `_tmXraySolidifyTs[guid]` (the time
a staged element is allowed to appear — set from ANOTHER element's end). When that moment arrives and the host mesh
has no own event in `(_dLo,_dHi]`, the mesh is skipped and the slot keeps its hidden state. On buildings this was
masked (few staged, dense events per mesh); on the road, 12,112 staged elements in 416 meshes.
**Candidate one-line fix (NOT built, NOT witnessed):** in `_tmBuildEventIndex`, also push `_tmXraySolidifyTs[g]` when
defined. Risk: it also changes buildings (needs fleet proof).
**Question for the reviewer:** is there a second path that can leave a slot hidden (e.g. a full pass that never runs
again after `_incrPrimed`; `mode=full` ran only twice in an earlier 1,958-tick building bake)?

### Why 62 % is staged at all — the support rule was written for buildings
```js
// time_machine.js ~4012 _buildXraySupportCache — CELL=4 m XY grid, EPS=0.05, GAP=0.5 m
// carrier pool: seq<=4 (structure) ∪ IfcSlab with seq>4
// S carries T if: S.base_z < T.base_z - EPS && S.top_z >= T.base_z - GAP && XY-bbox overlap
// T is staged until max(end of its carriers) if that is later than T's own end
```
On a road, almost everything is an `IfcBuildingElementProxy` or a long slab whose XY bbox overlaps hundreds of
neighbours; pavement layers, kerbs, drains and earthworks all "carry" one another by this vertical-overlap rule. The
rule has no notion of a linear corridor, so long bboxes (a 200 m pavement strip) make many false "carriers" whose ends
are late. **Question:** what is a sound "is supported by" relation for a linear model — chainage-local (split by
station), or skip staging when the carrier's XY footprint is far bigger than the element's?

## 4. ISSUE B (S2 + S4) — day counter holds day 18 for 32 s
```
§CPE_BUILDUP_PACING mode=work ops=19559 — t=0.10 now means 10% of the ELEMENTS placed, not 10% of the days elapsed
§CPE_WORK_SCHEDULE workInFirst10%OfCalendar=3.6%
§CPE_DAY_COUNTER frame=120 day=18 ... frame=600 day=18 of=79      (v5 earlier: "day 18 holds 8–44 s while 8,029 pieces land")
```
The film is paced by elements placed, not calendar days. Day 18 places ~8,000 ground-treatment pieces (GEOTECH
9,145), so the counter rightly sits on day 18 while 40 % of the film plays. Not a code bug — a pacing choice that
reads as "stuck". **Question:** blend (e.g. film time = max of element fraction and calendar fraction, or a cap of N
frames per day) without breaking the element-reveal invariants?
Also: `§TIME_MACHINE … 80 days` vs `§CPE_DAY_COUNTER of=79` — one-off in the day count (inclusive/exclusive end).

## 5. ISSUE C (S3) — no clock / sun from the site
```
§GEOREF_SITE lat=unknown lon=unknown elev=unknown (source=unknown)
§SUN_COMPASS off — not requested for this bake
§SUN_ARC_STEP tNorm=0.000 elevation=15.0 (start=15 civil end=6)
```
The model has no `project_metadata.site_latitude/longitude`, so the real sun path (NOAA, offline) has no place;
the bake used a fixed civil sun arc. `--sun-compass` was not passed. Planned cheap fix for the film: a mock site
(Kuantan, Pahang) written as `site_latlong_source='mock_film'`, then bake with `--sun-compass`.

## 6. Files to read (bim-ootb, origin/main)
`viewer/time_machine.js` (gate ~1660–1840, `_tmBuildEventIndex` ~1370, `_buildXraySupportCache` ~4012,
`_dlodEngaged` ~710) · `viewer/cinema_maxq.js` (`_logFrameCost`, pacing ~300–500) · `viewer/streaming.js` ~4160
(site lat/lon) · `cli_silent_bake.js` (flags). Prior related study: `bim-compiler/prompts/4D_MODEL_INTEGRITY.md` §O
(W-TMV-1..6, `§TM_VIS_AUDIT` — the delta skip suspected the OTHER way round on a building).

## 7. What would settle Issue A without a 25-min bake
A node witness that slices `_tmBuildEventIndex`/`_tmHasEventIn` and the gate from the source text, builds
`_tmXraySolidifyTs` from the real `kernel_ops` of CivilWorksPath.db, replays the 1,469 frame cursors with the delta
skip, and counts slots that end hidden while the gate (evaluated fully) says shown. Expected if the suspicion is right:
> 0 on the road, ≈ 0 on Hospital/Terminal.

## 8. STATUS 2026-10-06 late — Issue A fix BUILT, civil-only
bim-ootb PR #1919 (`fix/cw-solidify-event`, sw v1598, auto-merge set): `_tmBuildEventIndex` also indexes `_tmXraySolidifyTs`
**only when `isCivilModel()`** (user: "a flag that it is only for 'CW' type and not building … subset treatment of a DocType").
Witness `viewer/tests/witness_cw_solidify_event.js` PASS: gate false on Hospital/Duplex/LTU_AHouse/Terminal/Clinic (civilRows=0),
true on CivilWorksPath (14,820); building index byte-identical to main; bug reproduced on main (skip) and fixed (visit) on a
synthetic mesh. NOT yet proven on the real road: the user's Alt+C preview on localhost:8411 (worktree /tmp/wt-erp-clip) must
log `§CW_SOLIDIFY_EVENT civil=true added=N>0` and show the full build. Issue B (pacing) next, after that proof.
