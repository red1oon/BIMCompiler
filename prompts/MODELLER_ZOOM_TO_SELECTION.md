# ⚠ DO NOT REMOVE — scope: port the Viewer Find panel's zoom-to-frame-selection camera behavior into the Modeller, read the log after every run

**Why this exists:** user asked whether selecting an element in the Modeller zooms/reframes the camera to
face it, "following Find Panel in Viewer" — i.e. port the EXACT mechanism the Viewer's Find panel already
uses to frame a result, not the different Auto-Pivot/precision-cam system (that's orbit-pivot-recenter on
`Q`, a separate, NOT-in-scope feature — do not build or reference it). Confirmed by direct code search
(2026-07-08, before writing this spec): zero camera-focus/zoom/frame code exists anywhere in
`modeller.html` today — this is a genuine port, not a tweak.

## Exact ground truth — the SOURCE mechanism (Viewer, `viewer/navigate_find.js`, do not modify this file)

```js
var _lerpId = 0, _lerpHooked = false;
function _lerpCam(center, dist) {
  if (!A.camera || !A.controls || typeof THREE === 'undefined') return;
  // §FLY-YIELD: the moment the user grabs the controls (OrbitControls 'start'), cancel any in-flight
  // fly — otherwise the lerp keeps writing target+position and fights the pull ("hits back").
  if (!_lerpHooked && A.controls.addEventListener) {
    A.controls.addEventListener('start', function() { _lerpId++; });
    _lerpHooked = true;
  }
  var myId = ++_lerpId;
  var end = center.clone().add(new THREE.Vector3(0.5, 0.5, 0.7).normalize().multiplyScalar(dist));
  var start = A.camera.position.clone();
  var t = 0;
  function anim() {
    if (myId !== _lerpId) return;
    t += 0.04; if (t > 1) t = 1;
    var e = 1 - Math.pow(1 - t, 3);
    A.camera.position.lerpVectors(start, end, e);
    A.controls.target.copy(center);
    A.controls.update();
    if (A.markDirty) A.markDirty();
    if (t < 1) requestAnimationFrame(anim);
  }
  anim();
}
function _zoomToBox(center, size, factor) {
  _lerpCam(center, Math.max(size.x, size.y, size.z) * (factor || 3) + 1);
}
function _fitDistForBox(size) {
  var dir = new THREE.Vector3(0.5, 0.5, 0.7).normalize();
  var fwd = dir.clone().negate();
  var right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
  var up = new THREE.Vector3().crossVectors(right, fwd).normalize();
  var hx = size.x / 2, hy = size.y / 2, hz = size.z / 2, hW = 0, hH = 0, hD = 0, c = new THREE.Vector3();
  for (var sx = -1; sx <= 1; sx += 2) for (var sy = -1; sy <= 1; sy += 2) for (var sz = -1; sz <= 1; sz += 2) {
    c.set(sx * hx, sy * hy, sz * hz);
    hW = Math.max(hW, Math.abs(c.dot(right))); hH = Math.max(hH, Math.abs(c.dot(up))); hD = Math.max(hD, Math.abs(c.dot(fwd)));
  }
  var tanV = Math.tan((A.camera.fov || 50) * Math.PI / 360);
  var tanH = tanV * (A.camera.aspect || 1);
  return (Math.max(hH / tanV, hW / tanH) + hD * 0.3) * 1.03;
}
function _zoomToBoxFill(center, size, tag, mult) {
  if (!A.camera || !size) return false;
  var dist = _fitDistForBox(size) * (mult || 1);
  _lerpCam(center, dist);
  console.log('[RP-TB] §' + (tag || 'GROUP_ZOOM') + ' fill dist=' + dist.toFixed(1) + ' mult=' + (mult || 1) +
    ' size=' + size.x.toFixed(1) + 'x' + size.y.toFixed(1) + 'x' + size.z.toFixed(1));
  return true;
}
function _zoomToGroup(set) {
  var bb = _bboxOfGuids(set); if (!bb || !A.camera) return false;
  return _zoomToBoxFill(bb.center, bb.size, 'GROUP_ZOOM');
}
```
This is the proven pattern to port: a 0.3s eased camera-position lerp toward a point offset from the
target's center along a fixed iso-angle direction, at a distance computed to FILL the viewport (frustum-fit
via FOV/aspect against the box's projected extent, not a naive bounding-sphere fit — the code comments
explain why the naive version undersells the frame). `FLY-YIELD` (cancel on user grabbing OrbitControls) is
load-bearing — port it, don't drop it, or a user rotating mid-fly will fight the animation.

**⚠ Z-up vs Y-up — verify, do not blindly copy the offset vector.** `modeller.html` (~line 383) states "ONE
consistent Z-up convention for the whole 3D scene: OrbitControls then orbits LEVEL about +Z." The Viewer's
`_lerpCam`/`_fitDistForBox` use a fixed offset direction `(0.5, 0.5, 0.7)` and `up = (0,1,0)` in `_fitDistForBox`'s
right/up basis construction — these assume the VIEWER's own up-axis convention. Before porting, check what
axis convention `modeller.html`'s OWN camera/controls setup actually uses (Z-up per the comment) and adapt
the offset direction AND the `up` vector used in `_fitDistForBox`'s basis construction accordingly, so the
resulting frame is a sensible iso angle in the MODELLER's actual coordinate system, not a sideways/upside-down
frame from blindly copying Y-up constants into a Z-up scene. Verify empirically (screenshot or hand-check the
resulting camera position/orientation makes sense for a known element), don't assume the port is correct
just because it compiles.

## Ground truth — the TARGET (Modeller, `modeller/modeller.html`)

- Camera/controls already exist at module scope (~lines 388/395): `const camera = new THREE.PerspectiveCamera(55, ...)`,
  `const controls = new THREE.OrbitControls(camera, canvas)` — same shape as the Viewer's `A.camera`/`A.controls`,
  just local `const`s instead of namespaced on a global object. Reference them directly (this file doesn't need
  an `A.` indirection layer the way the Viewer's shared module does).
- Selection state already exists: `selectedIds` (a `Set` of feature ids, ~line 940), `selectedId` (primary/anchor,
  used by "every single-target path (cut/fillet/lod/frame)" per the comment at ~line 937 — note "frame" is
  already named there as a FUTURE consumer of the primary selection, consistent with this task), `selMeshes()`
  (~line 942, returns the actual THREE mesh objects for the current selection).
- Single-mesh bbox pattern already in use: `new THREE.Box3().setFromObject(selectedMesh)` (~line 478) — for
  MULTI-select, union `Box3`s across `selMeshes()`'s results the same way the Viewer's `_bboxOfGuids` unions
  across a GUID set (check `_bboxOfGuids` in `navigate_find.js` for the exact union-box shape to mirror, or
  just `.union()` each mesh's own `Box3` — THREE.js's own `Box3.union()` method is the standard tool here,
  don't hand-roll a bbox merge).
- The natural integration point is wherever the selection actually changes and already logs `§MODELLER select`
  (~lines 985-995, `setSelectionIds`) — call the new zoom-to-selection function from there, so it fires
  automatically on every real selection change (click, marquee, Outliner pick — anywhere `setSelectionIds` is
  the entry point), mirroring how Find's zoom fires automatically when a result gets selected/framed in the
  Viewer. This is the explicit behavior requested: "following Find Panel in Viewer" (automatic on select, not
  a separate manual trigger/hotkey).

## Task

1. Port `_lerpCam`, `_zoomToBox` (or just `_zoomToBoxFill`/`_fitDistForBox` if you only need the fill-frame
   variant — check whether the Modeller wants the simple `maxDim*factor` heuristic or the full frustum-fit;
   default to the frustum-fit version since it's the more correct/complete one and the simple one exists in
   the source only as a lighter-weight alternative, not because it's better) into `modeller.html`, adapted for
   the Z-up convention per the warning above, referencing the Modeller's own `camera`/`controls` consts
   directly (no `A.` namespace needed).
2. Add a bbox-from-current-selection helper (union `Box3` across `selMeshes()`), mirroring `_bboxOfGuids`'s
   shape but sourced from the Modeller's own selection mechanism, not GUIDs-in-a-set the Viewer's way.
3. Wire it into `setSelectionIds` (or wherever the actual selection-change entry point is — confirm the exact
   function, cite its line number in your report) so selecting ANY element(s) — single click, marquee
   multi-select, or a pick originating from the Outliner — triggers the same zoom-to-fill-frame behavior,
   automatically, matching Find's automatic behavior in the Viewer.
4. Skip the fly (no-op, do not error) when nothing is selected (empty `selectedIds`) — mirror the Viewer's own
   `if (!bb || !A.camera) return false;` guard shape.
5. Do NOT build Auto-Pivot, do NOT add a keybinding/toggle for this — the requested behavior is automatic-on-
   select only, matching Find's own always-automatic framing, not a sticky/manual mode.

## Verification required before reporting done

- Real Puppeteer interaction (mirror `e2e_harness.js`'s `t.open(key)` pattern used throughout this session) —
  open a resident (Duplex or SampleCastle), record the camera's starting position, click/select a SPECIFIC
  known element far from the current view, and assert via hand-derived checks: (a) the camera position
  actually changed toward the selected element's real bbox center (not just "some property fired") — compute
  the expected end position independently using the SAME frustum-fit math as the source (or a simplified but
  correct equivalent) and compare against the camera's final position within a reasonable tolerance, (b) the
  selected element is genuinely closer to filling the viewport after the fly than before (a real, measurable
  claim — e.g. compare the element's on-screen projected bbox size before/after, not just "camera moved"),
  (c) selecting a SECOND, different element re-triggers a new fly to the new target (not stuck on the first),
  (d) grabbing/rotating the OrbitControls mid-fly cancels the in-flight animation cleanly (the `FLY-YIELD`
  behavior) — a real interaction test, not just code inspection.
  Same numeric rigor as every other witness this session — hand-computed expected values, not eyeballed
  screenshots (screenshots for human skim only, never cited as the proof).
- Regression: confirm existing selection-dependent features still work correctly after this change (cut/
  fillet/lod/"frame" consumers of `selectedId` named in the code comment at ~line 937 — run whatever existing
  witnesses touch selection, e.g. sketch/circle/arc/tangent witnesses that rely on selection state, to confirm
  nothing broke).
- Name the new witness `modeller/tests/witness_e2e_zoom_to_selection.js`, `t.assert`/K-numbered convention.
- Do NOT deploy or push — commit on a fresh worktree branch cut from `origin/main`, suggest branch name
  `feat/modeller-zoom-to-selection`. Report back: exact diff, the Z-up adaptation you made and how you
  verified it produces a sensible frame (not just "it compiled"), full witness output, regression results.

## §TYPESET — ADDENDUM 2026-11-09: a walked TYPE row selects + frames its whole set (Witness: W-E2E-TYPESET-ZOOM)
> Owner, 2026-11-09: *"The elements created in the Outliner panel on left should be able to be seen to be populated and type set can be selected where the canvas should zoom to."* (MODELLER_MASTER §RESUME 2026-11-10, prep item 1.)

**Issue (code read on bim-ootb `16b3c205`):** a Walked Fixtures class row (`dwc|<disc>|<cls>`, also `dwac|`, the disc group `dwg|`/`dwga|`, and the category header) selects and zooms NOTHING.
- The click goes to `selectSubtree` / `selectGroup` (`modeller/bonsai_outliner.js:340-390`), which push only numeric featureIds. A `dwp|` leaf is skipped by design ("unresolvable leaf … SKIPPED, never guessed"), so the set is empty and the click is a logged no-op.
- `zoomToSelection` (`modeller.html:1220`) reads `selBox()`, which is feature meshes only. Walked instances are InstancedMesh rows, outside that model.
- GAP 2: the class row shows no count. Its label is the bare class name (`dw_instances_outliner.js:42`), though the module's own header (line 15) specifies `LightFixture (230)`.

**Rule (one owner of framing, no second zoom):**
1. `selectGroup` / `selectSubtree` collect `n.dwp` leaves next to the featureIds. ≥1 featureId → unchanged (`selectMany`). 0 featureIds and ≥1 walked leaf → `Bonsai.selectInstanceSet(leaves)`. Neither → the existing logged no-op.
2. `selectInstanceSet` (modeller.html, beside `pickInstance`) is a replace-select: it clears the feature selection and any single instance pick, then for each leaf resolves its record → `_instRefMap()` twins and takes `refs[0]` (the same twin `frameInstanceRow` uses).
   - An instance hidden by the eye (`im.userData.dwHidden`) is not tinted and not framed; it is counted as `hidden`.
   - Each shown instance is tinted with the pick tint `0x4fc3f7` (`_instTint`, the existing per-instance tint that saves and restores the prior colour).
   - Its world box is `geometry.boundingBox` × its instance matrix × `im.matrixWorld`. The union of those boxes is framed by the SAME `_fitDistForBox` + `_lerpCam` that `zoomToSelection` uses; that tail is factored into one `_zoomToBox(box, tag)` both call.
3. Clearing: `clearInstPick()` also untints the set, so Escape, a feature pick and a new instance pick clear it with no new path.
4. Log `§INSTSET-SELECT key=<row id> n=<leaves> tinted=<n> hidden=<n> unresolved=<n>` and the existing `§ZOOM-SEL fill …` line (tag `instset`).
5. GAP 2: the class row label carries its count, `LightFixture (230)`, from the same fold (`byCls[cls].length`). No other label changes.

**Witness W-E2E-TYPESET-ZOOM** (Duplex, production `discWalk('ELEC')`, real mouse click on the class row):
- T1 SET-TINTED: every instance of the clicked class is tinted `0x4fc3f7`; count = the class's leaf count in `__dwWalks`. On main this reads 0 (the RED control, run first).
- T2 FRAME-FILL: after the fly settles, `controls.target` = the union box centre ≤ 1e-3, and camera distance = the frustum-fit distance recomputed in the witness from the box size, FOV and aspect, ≤ 1e-3. All 8 projected corners lie inside NDC [-1, 1], and the larger projected extent is ≥ 0.8 (the box fills the frame).
- T3 HIDDEN-EXCLUDED: hide one instance by its eye, click the class row again: that instance is not tinted, tinted = n − 1, and `§INSTSET-SELECT … hidden=1`. (Its exclusion from the frame is the same `hidden` branch in code; not separately asserted.)
- T4 CLEAR: Escape restores every tinted instance's prior colour.
- T5 COUNT-LABEL: every rendered class row's label ends `(<n>)` with n = its leaf count.
- T6 FEATURE-PATH-UNCHANGED: a non-walked category click still goes through `selectMany` (`§OLGROUPSELECT … n>0`).
- M1 (measurement, no pass/fail): after the walk, whether the Walked Fixtures header is in the DOM, expanded, and inside the Outliner's visible scroll window. If it is collapsed or off-screen, that is a follow-up fix with its own claim.
- Regression: `witness_e2e_zoom_to_selection.js`, `witness_e2e_instpick.js`, `witness_e2e_instance_hide.js`.
- **M1 MEASURED on main `16b3c205` (RED run, log `01_red_main`):** the header is present and expanded but at y = 8159 px while the Outliner view spans 84-822 px, so it is off-screen after a walk. GAP 2 is real. Rule 6 added: a category registered `revealOnGrow` scrolls its header into view when its leaf count rises in a paint (`§OL-REVEAL cat= leaves=`); Walked Fixtures registers it. Claim **T7 REVEAL-ON-WALK**: after the walk the header is inside the view and `§OL-REVEAL cat=dwinst` is logged.
- RED run on main: T1 tinted 0/102, T2 target 11.5 m off, T3/T4/T5 fail, T6 passes (bomtree n=196). 2 PASS / 5 FAIL, as the issue predicts.
- **Found while building (first fix run, log `02_green`):** a class row clicked DURING the §D64 build-up reveal tinted only 62 of 102. Cause: `_instTint` created the colour buffer at the live `im.count`, which the reveal grows from a few to the full set over ~9 s (measured, log `04_probe_ver`: 18/102 at 1.7 s, 102/102 at 9 s). Rule 7: the buffer is sized to the bucket capacity (`instanceMatrix.count`); a short one is grown with its values kept. Claim **T0 MID-REVEAL-TINT**: click while the reveal shows fewer than all; after it ends, every instance is tinted.
- T2's corner test was replaced by an instance-centre test. Measured: the frustum-fit rule fits the box's projected extents, so a near AABB corner can land past NDC ±1 (extent 0.883 with a corner outside). The claim is now that every instance centre projects inside NDC and the box half-extent is ≥ 0.8.

**RESULT 2026-11-09 (bim-ootb branch `feat/outliner-typeset-zoom`, local headless swiftshader):** W-E2E-TYPESET-ZOOM **9 PASS / 0 FAIL** (log `05_green`): T7 header at y 84 in view 84-822, `§OL-REVEAL cat=dwinst leaves=102`; T0 clicked at 18/102 shown → 102/102 tinted; T1 102/102; T2 Δtarget 8.9e-16, dist 18.6789 = recomputed 18.6789, 102/102 centres in NDC, extent 0.884; T3 101/102 with `hidden=1`; T4 0 left after Escape; T5 `FlowTerminal (102)`; T6 bomtree n=196 unchanged. RED on main: 2 PASS / 5 FAIL (log `01_red_main`). Logs in the session scratchpad `tsz/`.
- **Regressions on the branch (logs `R_*`):** W-E2E-INSTHIDE 17/0, W-E2E-OL-GROUPSELECT 8/0, W-E2E-OLEYE 5/0, W-E2E-OLVIRT 5/0, band-no-host page exit 0. Two reds were **identical on main `16b3c205`** (logs `B_*`), so they were not caused by this change:
  - W-E2E-INSTPICK P1 read the bucket counts mid-reveal (3,7,16,22,3,4 vs dwSub lengths). The witness now waits for the reveal to end: **8/0** (on main it stopped at 1/1).
  - W-E2E-ZOOMSEL K5 (2nd-element end off by ~0.07 m) and K7 (camera drift 0.21-0.30 after deselect): **still open on main**, cause not traced. Not touched by this PR.

## §SINGLE-FRAME — ADDENDUM 2026-11-09: a walked leaf is framed at a size you can see, from below when it hangs under a ceiling (Witness: W-E2E-SINGLE-FRAME)
> MODELLER_MASTER §RESUME 2026-11-10 prep item 2; owner on the film: *"When a walker is clicked, the visual effect is not shown"*, and *"we cannot even see a single sprinkler."*
**Issue (code read, bim-ootb `09017997`):** `Bonsai.frameInstanceRow` (`modeller.html` ~1393) calls `_frameTo(point, 1.5)`: distance `max(1.5, 2) × 1.8 = 3.6 m` from ABOVE, whatever the element's size. Measured in the walk-film rehearsal (§FILM-WALK-BEFORE-AFTER, Duplex): FP heads at overview medianPx 0.9; the type-set frame 2.2 px. A head under its ceiling seen from above is hidden by the ceiling.
**Rule (one framing owner: `_fitDistForBox` + `_lerpCam`, no third camera path):**
1. The leaf's world box = its instance box (geometry box × instance matrix × `matrixWorld`, as §TYPESET).
2. Distance = `_fitDistForBox(size) × CONTEXT`. `CONTEXT = 8` is a presentation constant (the element fills about 1/8 of the frame height, so the room around it stays in view: owner, *"maintaining canvas in frame for realism"*), floored so the camera stays beyond `camera.near × 4`.
3. Direction: the iso direction `ZOOM_ISO_DIR` (1, −1, 1.3). When the record's `mount` is `BOTTOM` (it hangs under a ceiling or slab), the z component is flipped: (1, −1, −1.3), so the camera looks UP at it from inside the room.
4. Still selects through `pickInstance` (unchanged). Log `§FRAME-LEAF disc= i= mount= dist= dir=up|down size=`.
**Witness W-E2E-SINGLE-FRAME** (Duplex, production walk, real Outliner leaf click):
- S1 SIZE: after the fly, the leaf's projected box height is in [1/16, 1/4] of the canvas height (RED on main: a 0.06-0.3 m device at 3.6 m).
- S2 BELOW: for a `mount=BOTTOM` leaf, camera z < the element's z, and the first ray hit from the camera toward the element's centre is that instance (raycast on the scene).
- S3 ABOVE: a non-BOTTOM leaf keeps the camera above (z > element z).
- S4 TARGET: `controls.target` = the instance box centre ≤ 1e-3.
- Regression: W-E2E-INSTPICK P4/P5, W-E2E-TYPESET-ZOOM, W-E2E-ZOOMSEL (K5/K7 already red on main).

## §FACING — ADDENDUM 2026-11-09: the close-up stands in front of the device's mount face (the shim's anchor facing) (Witness: W-E2E-SINGLE-FRAME F1-F3)
> Owner, 2026-11-09: *"recall an old strategy we did, Shim, anchor facing, depends on direction."*
**Issue (measured, film rehearsal 2 on Duplex):** all 6 ELEC close-ups were skipped as `occluded=both`. Each ELEC fixture also has a signed folded mesh at the same spot (W-E2E-INSTPICK P2: "the instanced bucket is a decorative twin ... behind the folded mesh"), so the ray test's first hit was the device's own twin. The §SINGLE-FRAME side choice (mount BOTTOM → below, else above, ray test) ignored the facing the walker already knows.
**Where facing is already decided (code read, `disc_walker.js`):** schedule walk `_schedFacing` / `_snapToWall` → `rot` = the wall normal INTO the room, for wall-anchored rows (`yaw` set only then). Shim host-bind: `mount` BOTTOM (hangs under), TOP (sits on), SIDE (pushed from the wall centreline to the room-side face along `perp`), CENTER.
**Rule:**
1. The walker writes `face = [nx, ny, nz]` on each placement where facing is decided: wall-anchored schedule rows `[cos rot, sin rot, 0]`; host-bind SIDE `[perp/|perp|, 0]`; BOTTOM `[0, 0, −1]`; TOP `[0, 0, 1]`. No facing → no `face` (never guessed). It is a new field only: positions, counts and commits are unchanged.
2. `frameInstanceRow` stands in front of the face: horizontal face → direction `normalize(nx, ny, 0.35)` (in front, a little above); `face` down → the §SINGLE-FRAME from-below direction; `face` up or none → the iso direction from above.
3. The ray test stays as a guard only. A first hit inside the device's own box (grown by 2 cm) counts as the device, which covers its folded twin. Blocked → the other side, logged.
4. `§FRAME-LEAF … face=<nx,ny,nz|-> dir=front|up|down`.
**Claims added to W-E2E-SINGLE-FRAME:** F1 every wall-anchored schedule placement carries `face` = `[cos rot, sin rot, 0]` (≤1e-9), every BOTTOM bind `[0,0,−1]`; F2 a wall-faced leaf's camera lies on the face side (dot(camera − centre, face) > 0) and its first ray hit is inside the device's box; F3 walk counts unchanged (`§DISC-WALK placed/provisional` equal to main's).
