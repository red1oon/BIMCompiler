# ⚠ DO NOT REMOVE — PATTERN REVIEW (read-only, 2026-09-27)

Scope: `/tmp/wt-mnet-audit` @ `ee18f81c` (branch test/modeller-net-audit) — `modeller/`, `viewer/lib/`, `common/`, `viewer/navigate_find.js`, `viewer/scene.js`. No code changed. Every number below is a `grep -c`/`wc -l`/`diff` measurement or a cited line. Sizes: modeller.html 7,180 lines; disc_walker.js 2,525; routewalker.js 1,486; room_walker.js 1,510; str_walker_outliner.js 1,085; modeller/tests 236 files / 28,608 LOC.

## 1. Ranked table (rank = harm evidence × savings ÷ risk)

| # | Pattern | Instances (measured) | Harm evidence | Fix | Risk | Effort |
|---|---------|---------------------|---------------|-----|------|--------|
| 1 | Re-fold destroys all per-mesh state; each decoration re-applies itself separately | kernel clears group (bonsai_kernel.js:353); 3 refold listeners (modeller.html:667, 1101, 1412); 3 more decorations NOT re-applied: eye-hide (1216-1222), instance-hide (§I5), dim filter (1354-1370); `_applyHidden` only called from toggle (bonsai_outliner.js:674) | 3 fixed bugs (sel tint, shadows, x-ray) + latent: refold reveals eye-hidden meshes while Outliner still shows them hidden | ONE decoration registry keyed by featureId, applied inside `_buildMesh`/after fold; kernel owns `meshByFid` | med | M |
| 2 | Same building buffer re-parsed into a fresh SQL.Database per consumer | `new SQL.Database(__dwBuf)` at 12 sites (str_walker_outliner 151/580/600/696, building_parts_outliner 107, modeller.html 1457/2091/3851/3930/4370/4851/5013); geoBuf 5 sites. One Open = 4 building parses + 3 geo parses + 3 replays of `composeGhostsFromAggregates`+anchor-DELETE (str_walker_outliner 179-186, 581-582, 602-603) | §XEDGE-GEOWIRE 7-week silent regression was an ORDERING bug between two of these opens (cross_edges.js:67-72) | One prepared substrate handle `{db, geo}` owned by str_walker_outliner, opened once per Open, closed at onClear | med | M |
| 3 | Geometry index / world AABB re-derived per call, no cache | `_readBoxes` called 3× per `deriveAll` (cross_edges.js:232, 276, 317), each calling `_buildRealVerts`→`buildGeometryIndex` (184, 148); 0 cache vars in file. Per Open: 2 deriveAll (seed+geo) = 6 box reads, +1 index for a log count (str_walker_outliner.js:556), +1 in arc_editable.js:214 → 5 index builds, 6 box scans | cross_edges header measures 48k Terminal substrate; every extra pass is O(n) over it | Build boxes once per `deriveAll`, pass to the 3 derive fns; share index with arc_editable | low | S |
| 4 | 4 modules exist as drifted copies in both apps | routewalker.js 1486 vs 1293 lines (289 diff lines); kernel_ops.js 610 vs 597 (99); grid_kinematics.js 770 vs 674 (100); real_placement_resolver.js 143 vs 143 (2). Viewer loads all 4 copies (html=1, sw=1 each) | Pattern-1 in the brief: capability lands in one app only; IDB-version drift bug already hit one copy (kernel_ops.js:118-122) | Move to `common/` (room_walker.js precedent: modeller loads `../viewer/lib/room_walker.js`, sw.js:73) | med | M |
| 5 | Witness infrastructure duplicated per file | 236 tests: 73 harness, 104 direct puppeteer, 28 playwright; 131 own `createServer` (129 own MIME map); 104 own `puppeteer.launch` (105 swiftshader arg copies); 69 own `__sceneReady` wait; 29 own `__dwBuf` wait; 20 own fly-settle; 843 sleep/setTimeout | Brief item 6: most flakiness from this; harness already has flySettle (e2e_harness.js:401-405) | Make every witness use `runE2E`; playwright ones get a thin adapter | low | L |
| 6 | Linear scene scans for a featureId | 16× `g.children.find(o => o.isMesh && o.userData.featureId === fid)` in modeller.html; 8× inline dwRoot find despite `_dwRoot()` (3952); 5 independent meshByFid builders (html 1070, 6047; gridmove 241; roommove 279; bonsai_ifc 127); 3 AABB snapshot builders (`_gateBoxes` 2719, gridmove `_buildBoxByFid` 249-258, roommove) | §SCALE_CHECK_FIX (html:1917) measured O(n)/command/frame at 35,818 elements; fixed only for gmTint | Kernel-owned `Map<fid,mesh>` maintained in `foldChainToScene`/`author`; one `boxByFid()` | low | S |
| 7 | Room-truth policy forked 3 ways | RoomWalker.walk (room_walker.js:1474) → RM_ rows; rwLoadRooms (routewalker.js:821, storey hard-coded 'Ground Floor' 834); spacesOf (disc_walker.js:244) EXCLUDES RM_ (255). Viewer ensureRooms has version-stale + in-frame guards (navigate_find.js:958-992); modeller `_injectRoomsIfNone` has neither (str_walker_outliner.js:133-146) | Brief items 1+5. Consequence: rooms injected for 6/8 residents are invisible to the disc walker (RM_ filter) — walk fixtures still see 0 rooms | One `rooms.js` in common/: source→policy→rows; both apps call it | med | M |
| 8 | Modeller re-runs room compile on every Open | openResident caches RAW bytes (str_walker_outliner.js:978 "cache RAW server bytes, not the patched buffer"); `_injectRoomsIfNone` walks + `db.export()` each Open (144); Viewer persists (§NEEDLE_PERSIST navigate_find.js:1130) | Same input → same output every Open; cost is RoomWalker.walk + full export per resident | Persist post-inject buffer keyed on ROOM_WALKER_V (viewer pattern) | low | S |
| 9 | Three commit paths duplicate verify/cache/fold/emit | `commit` 318-367, `commitGesture` 374-388, `commitSeedGroup` 411-431 (bonsai_oplog.js); each: commitGroup→`_opsCache=null`→verifyChain→fold→_emit | Brief item 3: signing shape `{op_type, params}` at 322 hid `_rw`; any new field must be threaded into 3 places | One `_commitCore(opsArray, gid, {verify, leaf})` | low | S |
| 10 | guid↔fid bridge resolved ad hoc at every site | `__arcFidByGuid`/`__arcGuidByFid` read at 30+ sites in 12 files; 16 `isNaN(+id)` resolution idioms; anchor exclusion copied 3× (bonsai_outliner.js:448, 686, 747) | Brief item 4 (adjacency lens keyed fid vs guid) | `Bonsai.identity.fid(idOrGuid)` / `.guid(fid)` with anchor rule inside | low | S |
| 11 | modeller.html monolith: 1,566 lines of URL-param self-tests | 41 `if (qs.get(...)==='demo')` blocks from line 5612 to 7178; 58 `window.__*` test hooks; 163 `window.__*` globals defined | Ships test code to production; harness-based witnesses already cover these paths | Move blocks to `modeller/selftests.js` loaded only when `?selftest` | low | S |
| 12 | 12 hand-rolled `indexedDB.open('bim_ootb_cache')` in modeller | kernel_ops 126, oplog 84/109/114/129, str_walker_outliner 331/336/358/379, disc_walker 135, routewalker 1453, html 5212 | Version drift bug (kernel_ops.js:118-122): edits silently never persisted | One `idb_cache.js` in common/ | low | S |
| 13 | Two AABB clash gates in the two MEP walkers | routewalker `_rwAabbOverlap`/`_rwClashesWithArc` (862, 889); disc_walker `_envelopeClash` (1579), `_clashAt` (519); disc_walker.js:843 self-describes as "analogue of RouteWalker's arc_envelope" | No fixed bug; divergence risk when tolerances change (sdg_gate.js:168 already copies cross_edges TOL "non-invent reuse") | One `aabb.js` (overlaps/penetration/clash) | low | S |
| 14 | Disc-walk bucket rebuild removes without dispose | `_clearDiscWalk` root.remove (html:3960), also 4312, 4505, 4888, 4903; only 5 `.dispose()` calls in whole file | GPU geometry/material leak per redraw; `_redrawAllDiscWalks` fires on every scrub/commit (4709) | dispose geometry+material in the 5 clear sites | low | S |
| 15 | Small helper copies | `overlaps()` byte-identical in bonsai_itemdrag.js:123 and cut_move.js:50; `bboxOf` identical in real_geometry.js:24 and bonsai_library.js:56; `_rows` in 4 files (disc_walker 72, seed_trunk 24, building_parts_outliner 93, room_walker 109); `_esc` 2×, 15 inline `replace(/'/g,"''")`; 3 base64 decoders | None fixed; low harm | Fold into common/ util | low | S |

## 2. Detail per row

### 1. Re-fold drops per-mesh state
- Root: `foldChainToScene` clears the group with `while (g.children.length) g.remove(g.children[0])` (bonsai_kernel.js:353) and rebuilds every mesh via `_buildMesh` (284-290) with default material, `visible=true`, no shadow flags. `_redrawAllDiscWalks` (modeller.html:4709-4721) is a SECOND rebuild site for walked buckets; it calls `_xrayReapply` directly (4721) instead of announcing.
- Re-applied today: x-ray (667), selection tint (1101), shadows (1412). Both tint and shadows also listen on `bonsai:oplog` (1094, 1407) → double runs per commit.
- Not re-applied: `setFeatureVisible` (1216-1222, comment "Visibility is a session LENS: a re-walk/re-fold ... resets it"), `setPlacementVisible` (§I5, same wording), `dimExcept` (1354-1370). The Outliner's `_hidden` set survives, but `_applyHidden` (bonsai_outliner.js:679) runs only from `_toggleHide` (674); `refresh()` (187) only repaints → UI shows hidden, scene shows visible.
- Consolidation: `Bonsai.decor = { tint, shadow, xray, hidden, dim }` applied by one `applyDecor(mesh)` inside `_buildMesh`, plus one post-fold pass for bucket-level state. Kills 3 listeners and the 3 latent gaps at once. Also replace the O(n²) clear (`remove` = indexOf+splice per child — three.js source; unverified in vendored minified build) with `g.clear()`.

### 2. Building buffer re-parsed per consumer
- Per Open with geo: parse __dwBuf at str_walker_outliner.js:151 (open), 580 (`_reDeriveXEdgesWithGeo`), 600 (`_reinitStrWalkWithGeo`), 696 (`_seedArcEditable`); parse geoBuf at 551 (inside `_deriveXEdges` 'geo'), 601, 698. Each of 580/600 re-runs `composeGhostsFromAggregates` + `DELETE ... void_anchor` (581-582, 602-603) copying 179-186.
- Later consumers re-open again per action: disc walk (html:3851), room grab (2091), bridge route (4851), storey floors (4370), parts outliner (building_parts_outliner.js:107).
- Fix: `Substrate.get()` → `{db, geo}` prepared once (ghosts composed, anchors blinded), shared read-only; `_seedArcEditable` alone needs the un-blinded handle (documented at 165-171) → give it `Substrate.raw()`.

### 3. Cross-edge / geometry index re-derivation
- `deriveAll` (cross_edges.js:358-367) → `deriveDatumsAnchored`, `deriveAdjacency`, `deriveSpans` each call `_readBoxes(db, opts.geoDb)` (232, 276, 317) → `_buildRealVerts` (184) → `RealGeometry.buildGeometryIndex` (148). No cache (`grep -c "_cache\|memo"` = 0).
- `_deriveXEdges` builds the index a 4th time only to log a count (str_walker_outliner.js:556); `arc_editable.js:214` a 5th.
- Fix: `deriveAll` reads boxes once, passes `{boxes, idx}` down; expose `idx` for the §XEDGE-GEO log and `seedArc`.

### 4. Copied modules across apps
- `comm` of basenames: grid_kinematics.js, kernel_ops.js, real_placement_resolver.js, routewalker.js (sw.js shares a name only: 163 vs 1,134 lines).
- Drift measured with `diff | grep -c '^[<>]'`: routewalker 289, kernel_ops 99, grid_kinematics 100, real_placement_resolver 2.
- Precedent already in tree: modeller loads `../viewer/lib/room_walker.js` (modeller.html src, sw.js:73) and `../viewer/dagevu_catalog.json` (bonsai_library.js:37, after the 3-month empty-catalog defect noted at 33-36).
- Fix: promote the 4 to `common/`, one owner; both `sw.js` precache the common path.

### 5. Witness infrastructure
- Counts in `modeller/tests`: 236 .js; harness users 73 (only 1 also creates a server); direct puppeteer 104 (102 hard-code `path.join(HOME,'bim-compiler','node_modules','puppeteer')`); playwright 28 (5 different require spellings, all under `~/bim-ootb/tests/node_modules`).
- Duplicated per file: static server 131 (8-9 lines each ≈ 1,100 lines), MIME map 129, browser launch 104+28, `__sceneReady` wait 69, `__dwBuf` wait 29, fly-settle 20; 843 `setTimeout|sleep` occurrences.
- Harness already owns the settled-camera oracle (`e2e_harness.js:223-226, 401-405`) that fixed W-E2E-RSARM/W-E2E-SCALE races.
- Fix: `runE2E` for all; a `runPW` adapter exposing the same `pick/proj/flySettle` for the 28 playwright files. Delete per-file servers.

### 6. Linear scene scans
- modeller.html: 76 `.children.forEach/find/filter/traverse`; 16 exact `featureId === fid` finds (1180, 1207, 1218, 1438, 1606, 2174-fallback, 6298 …); 8 dwRoot finds although `_dwRoot()` exists (3952).
- 5 fid→mesh index builders and 3 fid→AABB builders (gridmove comment 249-250 admits `_gateBoxes` is "the SAME shape").
- Fix: kernel maintains `this._byFid` during `meshes.forEach(md => …)` (bonsai_kernel.js:356) and `buildOne` (362); expose `Bonsai.meshFor(fid)`, `Bonsai.boxFor(fid)`. This is also the natural home for row 1's decoration re-apply.

### 7. Three room sources, three policies
- RoomWalker → `spatial_structure` RM_ rows (room_walker.js:1210, 1345-1403).
- `rwLoadRooms` → `mep_rw.db building_room`, storey literal `'Ground Floor'` (routewalker.js:834), used by html:3306.
- `spacesOf` → `elements_meta` IfcSpace, fallback `spatial_structure` with `guid NOT LIKE 'RM\_%'` (disc_walker.js:244-262). room_habitability.js:10-11 documents this as a deliberate stricter filter.
- Divergent guards: viewer recompiles on `rooms_meta.version !== ROOM_WALKER_V` and out-of-frame rooms (navigate_find.js:958-1000); modeller only checks `COUNT(*) > 0` (str_walker_outliner.js:135-136).
- Consequence (inferred from the two cited filters, not observed live): a resident that only has injected RM_ rooms still walks with 0 spaces.
- Fix: `common/rooms.js` exporting `roomsFor(db, {policy:'real'|'any'})` + `ensureRooms(db, {persist})`; both apps and both walkers call it.

### 8. Room compile per Open
- str_walker_outliner.js:964-981: cache hit returns RAW bytes → `_applyPendingPatch` → `_openBuffer` → `_injectRoomsIfNone` (walk + `db.export()` 144) every time. Viewer writes the compiled result back (§NEEDLE_PERSIST). Fix: persist `{buf, ROOM_WALKER_V}` after inject, same key.

### 9. Commit path triplication — bonsai_oplog.js 318-367 / 374-388 / 411-431; the signed payload is built at 322 (`{ op_type, params }`) and again by callers of the other two. Fix: single core; callers pass `{ops, gid, verify, leaf}`.

### 10. Identity bridge — 30+ raw reads of `window.__arcFidByGuid/__arcGuidByFid` (bonsai_outliner.js ×12, gridmove ×3, roommove, itemdrag, ifc, bcf_export, sdg_cascade, str_walker_outliner, html ×6); 16 `isNaN(+id)` resolves; anchor exclusion in 3 places. Fix: `Bonsai.identity` module set by arc_editable.js:408, cleared by str_walker_outliner.js:1068.

### 11. modeller.html — one inline script 346-7178 (~6,830 lines), 193 top-level functions, 215 distinct § tags, 43 `_geomOps()` call sites. The tail 5612-7178 (1,566 lines, 41 blocks) is `?x=demo` self-test code. Fix: split that tail first (zero behaviour risk), then extract per-§ sections (x-ray 548-680, selection 1053-1240, disc-walk render 3952-4900) as scripts.

### 12. IDB openers — 12 sites in modeller (listed in table). kernel_ops.js:118-122 records the drift bug ("edit was silently never persisted"). Fix: `common/idb_cache.js` with the version-less open + upgrade path str_walker_outliner.js:331-340 already implements.

### 13. Two clash gates — routewalker.js:862-899 (centre/size, tol) vs disc_walker.js:1579-1591 (segment-box vs envelope) vs 519-530 (per-placement). Fix: `aabb.js` with `overlap(a,b,tol)` returning per-axis vector (sdg_gate.js:15 shape) so callers derive bool/penetration.

### 14. Bucket clear without dispose — html:3960, 4312, 4505, 4888, 4903 call `root.remove(o)` on InstancedMesh/LineSegments; geometry/material disposed only in `_dropOutline` (1066). Fix: `_disposeObj(o)` helper at the 5 sites.

### 15. Helper copies — listed in table; ~60 lines total.

## 3. Not worth it
- Per-mesh `MeshStandardMaterial` (bonsai_kernel.js:284): deliberate, enables per-mesh dim/tint without bleed (html:1343 comment). Keep.
- `sdg_gate.js:15 overlaps()` returns a per-axis vector — different contract from itemdrag/cut_move's boolean; only the latter two are true duplicates.
- `bonsai_gridmove.js` vs `grid_kinematics.js`: wrapper vs engine (gridmove:188-189). `str_walker.js` vs `str_walker_bridge.js`: bridge wraps walker. Not duplicates.
- `common/` is 11/14 viewer-only (room_graph.js 2,287 lines, hallway_backbone.js …): misnomer, no harm.
- `_geomOps()` memo (bonsai_oplog.js:302-303, invalidated at 324): correct as is.
- Five outliner category modules (bonsai/bom_tree/building_parts/dw_instances/str_walker): plugin shape, fine.
- LEAF optimistic append vs full re-fold (bonsai_oplog.js:352-361): already the right split.

## 4. Unverified
- THREE `Object3D.remove` being indexOf+splice (O(n²) group clear): from three.js source knowledge; not located in the vendored minified build.
- Row 7 consequence (injected RM_ rooms invisible to disc walker) is inferred from disc_walker.js:255 filter + str_walker_outliner.js:144 export; not run.
- Wall-clock cost of rows 2/3/8 not measured (no runs allowed); counts only.
- Whether the 4 viewer copies in row 4 are the SOURCE or the STALE side of the drift — not determined.
- `bar_model.js`: no references found in modeller/ or tests (grep = 0); nothing to remove there.

## Orchestrator notes (2026-09-27, after the read-only review)
- Spot-checked + CONFIRMED: row 4 (modeller vs viewer copies: routewalker.js 1486/1293 lines, 289 diff lines; kernel_ops.js 99;
  grid_kinematics.js 100; real_placement_resolver.js 2) and row 1 (exactly 3 `bonsai:refold` re-apply listeners, modeller.html
  667/1101/1412; `_applyHidden` runs only from the eye toggle).
- CORRECTION to row 7's inferred consequence: disc_walker `spacesOf()` excluding `RM_` compiled rooms is DELIBERATE doctrine
  (WalkerDoctrine §14 / its own comment: synthetic rooms are guesses, never schedule input) — not a defect. The fork of room
  SOURCES (mep_rw.db building_room with a literal 'Ground Floor' storey) is still a real consolidation candidate.
- No code changed. Nothing here is scheduled; red1 picks rows.
