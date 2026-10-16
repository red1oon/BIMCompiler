# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** TM Phase 3 — cap the GPU frame cost of Time Machine playback on large buildings (LTU
122k+) by rendering the INACTIVE construction set as bbox proxies and real mesh only for the active
window. This file is the spec `TM_INCREMENTAL_RENDER_PERF.md` §0 references as "TM_DLOD_SCALE.md
(to author)". Implementation target: a Sonnet session; everything needed is named here — do not
rediscover, do not re-litigate §1's settled history.
**Read the log after every run.** Witnesses in §6; every claim needs its § line. Exit code is not
evidence. The acceptance bar for the OFF state is ZERO behavioural change (same as Phases 1-2).
**Status:** ✅ DONE (shipped, deployed, user-accepted 2026-07-20; camguard fix merged 2026-07-21,
PR #927 `ee57a3e` on `main`). Live at `red1oon.github.io/bim-ootb`. Final design differs from the
original spec — see §9 (redesigned mid-session after live testing surfaced a real gap the spec
didn't anticipate). Original implementation notes kept in §8 for the reasoning trail; §9 is the
shipped truth; §10 is the box↔real orbit bug found the same day — root-caused, fixed, and merged;
nothing further open on this file.

## 8. Implementation notes (2026-07-20 session)
- Reused `LARGE_BUILDING = 50000` (time_machine.js:471, already computed into `_isLargeBuilding` at
  `_finishActivate`) as `DLOD_TM_MIN_ELEMENTS` instead of a fresh DB count query — this constant
  already matched the spec's own default, meaning the earlier survey had found it too.
- Pick-exclusion (§4): the actual proven mechanism is `userData.isBboxPlaceholder` (checked at
  `picking.js:257`, set by `_drawBboxPlaceholders`) — NOT `_buildMergedGhost`'s ghost boxes, which do
  NOT set that flag and are not actually proven pick-transparent. Corrected citation; box meshes here
  set `isBboxPlaceholder = true` to reuse the real mechanism.
- Material: solid `MeshLambertMaterial` (color + slight emissive 0.15), NOT `_drawBboxPlaceholders`'
  actual wireframe/0.4-opacity look (spec's own §2 citation of that file's "look" doesn't match what's
  actually there — that one IS wireframe too). Went with the spec's explicit textual ask ("solid,
  discipline-colored, slightly emissive") over the mismatched citation.
- New: `_dlodBuildBoxes` (lazy per-building box index, guid→{mesh,idx,matrix,visible}, disposed on
  building switch or TM deactivate), `_dlodUpdateBoxes` (per-tick sync with change-tracking — only
  `setMatrixAt`+`needsUpdate` on instances whose visibility flipped, not the whole index every tick),
  `_dlodEngaged` (toggle && `_isLargeBuilding` && `!app.streaming`).
- The 3 `renderAtTime` traverse branches (single-mesh/BatchedMesh/InstancedMesh) each got one
  AND-ed `hideForProxy` condition into their existing visibility test — when `_dlodProxyOn` is false
  (default), `hideForProxy` is always false and the branch is byte-identical to pre-change code. This
  is the actual mechanism W-DLOD-EQUIV needs to hold, not a separate code path.
- Toggle edge: reused the existing `window.__forceFull` test hook (already built for W-INCR-EQUIV) to
  force a full traverse on click — the incremental-delta path would otherwise skip nearly every mesh
  at a same-cursor re-render and leave the toggle visually unapplied. Caught by re-reading the
  `_incrOK`/span-zero logic before wiring the pill handler, not by testing it broken first.
- UI: `◧ LOD` pill in the TM panel header, `display:none` unless `_isLargeBuilding`, gated/reset at
  `_finishActivate` (mirrors the existing `tm-var` ⚖ gate pattern) and at `deactivate()`.
- Verified headless: `node --check` clean; the `dlod_visibility_only` / `§WB_DLOD_VIS` guard test
  (tests/whitebox_regression.js:646, reads `streaming.js`+`dlod.js` only) still passes — neither file
  was touched. A standalone pure-logic self-test (18/18 pass) confirmed the OFF-path is legacy-identical
  and the ON-path never double-draws or leaves a gap (§5.5), across all frontier/recent/lookahead
  combinations — script not committed (scratchpad-only), logic is what's committed.
- **NOT run: W-DLOD-EQUIV, W-DLOD-PROXY, W-DLOD-NO-REBUILD, W-DLOD-PERF.** All four need a real
  browser against the actual LTU DB (§6 says headless is blind to GPU/THREE — correct, no way around
  it from this CLI). Next step is the user's machine: open LTU in Time Machine, click ◧ LOD, scrub/play,
  read `§DLOD_TM`/`§DLOD_TM_BUILD`/`§DLOD_TM_GATE` console lines, compare `§PERF_TRAVERSE`/renderer.info
  draw calls at cursor≈95% with the pill on vs off.

## 1. Settled history — why this design and not the other one (do NOT re-litigate)
Three different things have been called "DLOD" in this codebase. Be precise:
1. **Geometry-swap DLOD (S261 lineage — RETRACTED, stays retracted).** All elements resident as
   bboxes, `BatchedMesh.setGeometryAt()` swaps real geometry near camera, LRU eviction. Died on:
   edge-on flicker on thin elements, TM visibility fights, pick broken until promotion completes.
   `viewer/streaming.js:19,109,158` hard-set `A._useDlodPath=false`; the whitebox test
   `dlod_visibility_only` (`deploy/dev/tests/whitebox_regression.js` ~645, `§WB_DLOD_VIS`) asserts
   `noSwapPath && noPromote`. **This spec does NOT touch `setGeometryAt` and does NOT re-enable
   `_useDlodPath` — the guard test must stay green unmodified.**
2. **Frustum visibility culling (S262/S274 — SHIPPED, `viewer/dlod.js`).** Skips off-frustum slots.
   Useless for wide views (TM playback, aerial tours see the whole building in frustum). Keep as-is;
   independent of this spec (S262 doctrine: TM controls visibility, DLOD-culling controls its own —
   do not couple them; `_dlodPaused` is a dead field, leave it).
3. **THIS SPEC: representation-by-activity.** Built-but-inactive elements render as discipline
   boxes; the active construction window renders real mesh. Swap axis = construction time (cursor
   window), not camera distance → coarse, user-paced, no per-frame promotion churn. No geometry
   swap: real meshes stay resident with per-slot visibility OFF; boxes are SEPARATE InstancedMesh
   objects. Everything S261 died of is structurally absent.

**Corrections this survey established (recorded 2026-07-20, fix citations when touched):**
- `TM_INCREMENTAL_RENDER_PERF.md` "LTU 125k = 8 draw calls" is UNCORROBORATED — the measured healthy
  state is ~15-16K draw calls (S280c `§S280c` logs, S263). Do not design against "8".
- Its §0b "streaming/eviction (shipped)" overstates: only dispose-on-building-switch exists. True
  memory-bounded eviction died with S261. At 122k, FULL geometry for the whole building is resident
  in GPU memory today; this spec reduces DRAW cost, not resident memory — say so honestly in any
  external claim. Memory-bounded residency is a separate future phase (§7).

## 2. Existing mechanisms to reuse (wiring inventory — all shipped, all proven)
- **Box proxy renderer:** `viewer/navigate_find.js:1413` `_buildMergedGhost()` — per-discipline
  `THREE.InstancedMesh` unit boxes scaled from DB `center_*`/`bbox_*` columns; proven >50k (Alt+X).
  Reuse the BUILD PATTERN (per-discipline instanced boxes from elements_meta), not the literal
  wireframe ghost material — Phase-3 boxes should be solid, discipline-colored, slightly emissive
  (match `_drawBboxPlaceholders`' look in `viewer/streaming.js` ~187, the load-time placeholder
  system users already understand as "not yet detailed").
- **Per-slot visibility:** TM already drives `setVisibleAt(slot)` (BatchedMesh) and zero-scale
  `setMatrixAt` (InstancedMesh) per element — `viewer/time_machine.js` `renderAtTime()` branches.
  The inactive set is hidden by EXACTLY this mechanism; no new hide path.
- **The event index** (`_tmBuildEventIndex`, `_evMesh`) already knows which meshes have events in
  any cursor window — the active-window membership test is a lookup, not a new scan.
- **Activity sets:** `renderAtTime` already maintains `frontier{}` / `recent{}` / `placed{}` per
  tick — the active window IS frontier ∪ recent (+ optional lookahead, §4). No new bookkeeping.

## 3. Definition — the active window
- ACTIVE (real mesh): elements in `frontier{}` or `recent{}` at the cursor, plus a lookahead band:
  elements whose `start_ts` falls within `LOOKAHEAD_TICKS * tickMs()` after the cursor (default 6 —
  what's about to build is what the eye tracks; tune with a witness number, not by feel).
- INACTIVE-BUILT (box): in `placed{}` but not ACTIVE.
- UNBUILT: hidden (exactly as today).
- **Engage gate:** proxy mode engages only when `elements_meta count > DLOD_TM_MIN_ELEMENTS`
  (default 50000) AND the user has the toggle ON (§4). Hospital/Duplex never see it; LTU does.

## 4. UX contract
- A TM-panel pill toggle "◧ LOD" (OFF by default in v1). OFF = today's rendering, bit-identical
  (§6 W-DLOD-EQUIV gates this). ON = boxes for INACTIVE-BUILT.
- Toggling is user-paced — it MAY do one full-cost rebuild (like a shadow toggle edge; reuse the
  `_lastShadowOn` edge-detection pattern from Phase 2, `time_machine.js` ~892).
- Boxes must NOT respond to picking as real elements (the S261 pick trap): reuse the ghost meshes'
  existing pick-exclusion (`_buildMergedGhost` instances are already pick-transparent — verify and
  cite the mechanism in the PR).
- `feedback_no_fake_lod_unbreakable.md` (UNBREAKABLE: no non-LOD400 shown as real geometry): boxes
  must read as obviously-proxy (placeholder styling, §2), never as modelled mass.

## 5. Landmines (each one already bit an earlier phase — read before coding)
1. **`_metaGen` bump = 50-159ms index rebuild** (measured live, LTU). The box InstancedMeshes are
   NOT TM-tracked meshes: never register them in `_batchMeta`/`_instanceMeta`, never bump
   `A._metaGen` when flipping box instance visibility. If the index rebuilds during playback, the
   design has failed (`§PERF_INCR_INDEX` count is a witness gate, §6).
2. **Cursor calling convention** (#912, #916): any new render entry point takes the target cursor
   as an ARGUMENT; zero direct `_cursor` assignments (audit: `grep '_cursor = ' viewer/time_machine.js`
   must return only the declaration + `renderAtTime` internal line 974).
3. **Equivalence witnesses don't test call sites** (#912 lesson): W-DLOD-EQUIV must drive the REAL
   UI (pill clicks, ▶, ⏮, slider), not only `__tmSetCursor`.
4. **Streaming interplay:** while `APP.streaming`, batches rebuild meshes and bump `_metaGen` (the
   documented, still-unfixed rebuild-per-batch cost — `TOUR_WALKMODE_IDLE_PARK_STUCK.md` §5). v1:
   proxy mode simply refuses to engage until streaming drains (same doctrine as Fly Tour's
   `§FLY_STREAM_WAIT`). Do not try to solve the streaming-rebuild coalescing here.
5. **Double-draw:** an element must never show box AND real mesh. W-DLOD-PROXY diffs the union.

## 6. Witnesses (all blocking; Hospital for logic, LTU for scale; headless is blind to GPU — frame
numbers come from the user's machine via `window.__tmTrav` + a `§DLOD_TM` stats line)
- **W-DLOD-EQUIV:** toggle OFF → visible-guid set + per-slot visibility identical to pre-change
  build across the #909 sweep (19 cursors, fwd/back/scrub/jumps, shadows on). `mismatch=0`.
- **W-DLOD-PROXY:** toggle ON → real-mesh visible set == ACTIVE set exactly; box instance count ==
  |INACTIVE-BUILT|; union disjoint. Log `§DLOD_TM active=<n> boxed=<n> unbuilt=<n> mode=on|off`.
- **W-DLOD-NO-REBUILD:** `§PERF_INCR_INDEX` fires ZERO times during 60 ticks of proxy-mode playback
  (post-streaming). One rebuild allowed at toggle edge.
- **W-DLOD-PERF (user hardware):** `§PERF_TRAVERSE` + renderer.info draw-call/triangle counts at
  cursor=95% with proxy OFF vs ON on LTU. The claim to beat: near-end heaviness (user report
  2026-07-20). No % target invented — measure first (MEASURE BEFORE ESTIMATING, TM file §0).

## 7. Explicit non-goals (v1)
- No camera-distance promotion, no `setGeometryAt`, no eviction/memory-residency work (S261 stays
  dead; memory ceiling is its own future spec — measure 250k/500k footprint AFTER this ships).
- No Fly-Tour/walk-mode integration yet: the tour benefits automatically only via whatever TM
  window is active. A follow-up MAY render far-storey boxes during tours using the same proxy —
  separate spec, after W-DLOD-PERF numbers exist (route-planning cost is already solved by
  `TOUR_ROUTE_CACHE.md`).
- No default-ON. Default flips only after the user's own hardware numbers say so.

## 9. Shipped design (final, 2026-07-20 — supersedes §3's time-window definition)
Live testing on LTU (day159, 106K/122K elements placed) immediately surfaced what §1's "swap axis
= construction time, not camera distance" doctrine implied but nobody had felt yet: a pure
time-window swap boxes almost the WHOLE building the instant it engages this late in a build,
including whatever the camera is pointed at. User reaction: "it turns all to BBxs meshes even
facing cam, a lost of LOD400." Correct diagnosis, not a bug — the axis really was time-only. Fixed
by changing the axis to view, per user's explicit choice (asked 3-way: keep pure time-based / add
camera-distance as a 2nd filter / just widen the window — picked "add camera-distance").

**Final rule** (replaces §3 entirely):
- FRONTIER (building now) and RECENT (just finished, amber linger): always real. Unchanged.
- Everything else that's PLACED (built): real ONLY if in-view — distance ≤50m from camera AND
  inside the camera frustum. This is the exact LOD0/LOD2 boundary the retracted S261 design used
  (`prompts/done/S261_DLOD_MILLION.md` line 24) — reused, not invented. Out-of-view placed → box.
- Box material: wireframe (`MeshBasicMaterial`, opacity 0.4), NOT solid — user ask after seeing solid
  boxes read as "detail missing" rather than "not yet detailed." Matches `_drawBboxPlaceholders`'
  actual established look (the spec's original §2/§4 citations of that file's look were wrong — it
  IS wireframe, solid was never justified by that citation in the first place).
- Position + bbox-radius cached once per guid at box-build time (`_dlodBoxIndex[guid].pos/.radius`)
  — the in-view test is a cheap distance+frustum check against a cached `Vector3`, no per-tick
  `getWorldPosition`/matrix-decompose. Frustum built once per tick from reused scratch objects
  (`_dlodFrustum`/`_dlodPSM`/`_dlodSphere`), mirroring `dlod.js`'s own module-level reuse pattern.
- Pill icon: the same wireframe-cube SVG as the existing Bounding-Box/Alt+X pill (`panels.js` 'box'
  icon), not a unicode glyph — user ask, reads as "this shows boxes" at a glance.
- `LOOKAHEAD_TICKS`/`_dlodLookahead` from the original design is gone — it was actually DEAD CODE
  even before this redesign: `hideForProxy` required `isPlaced`, and an element can never be both
  `isPlaced` (finished) and in the lookahead band (not yet started) at once, so the lookahead
  condition never once fired. Worth knowing if anyone greps old commits for it.
- Debug marker added: `im.userData.isDlodTmProxy = true` on every DLOD box — `isBboxPlaceholder`
  (reused for the proven pick-exclusion, `picking.js:257`) is shared with `_drawBboxPlaceholders`'
  load-time boxes, which use the identical `BoxGeometry` + wireframe material, so there was no way
  to `scene.traverse` and tell the two apart. This is why an early post-ship verification attempt
  (checking "are boxes really hidden when OFF") produced a false positive — it was counting ordinary
  load-time placeholders, not DLOD boxes. Use `isDlodTmProxy` for any future check, not `isBboxPlaceholder` alone.

**Shipped as 4 PRs** (bim-ootb): #918 (original time-window implementation) → #919 (solid→wireframe)
→ #920 (time-window→view-based redesign, the real fix) → #922 (isDlodTmProxy debug tag, chore).
All merged to `main`, GitHub Pages redeployed each time (`sw.js` CACHE_VERSION v827→v830,
`viewer.html`'s `time_machine.js?v=` 60→63). W-DLOD-EQUIV/PROXY/NO-REBUILD/PERF (§6) were never run
as formal witnesses — verification was live-hardware user testing instead, which is what actually
caught the real gap (§6's headless framing wouldn't have found it). User accepted final result
2026-07-20: "its nice now... seems faster and full bbxes seems to give near and frustum and recent
full LOD400s, which is good enough."

## 10. ⛔ OPEN BUG found in continued live use (2026-07-20, same day, orbiting LTU) — READ FIRST

**User's exact reports, in order:**
1. "DLOD comes on but it turns all to BBxs meshes even facing cam" → led to §9's view-based redesign.
2. Then, orbiting LTU with the redesign live: "when we turn the LTU around the wireframe that is
   nearest to us disappears because it is making way for the LOD400 full meshes but those don't
   appear until we retoggle the box."
3. Confirmed direction: **"LOD400 to bbx is OK, vice versa is not, unless retoggle."** — turning
   AWAY from an element (real → box) works correctly every time; turning TOWARD one (box → real)
   silently fails and leaves nothing visible (not even the box) until the ◧ pill is clicked off/on.

**Root cause — found, not yet fixed.** `_dlodInView(g)` (`viewer/time_machine.js:506` on `main`
HEAD `bbf8c9e`) is a pure function of **camera state** (position + frustum, rebuilt fresh every
`renderAtTime` call, `~line 1195-1220`). But the real-mesh visibility decision that reads it lives
inside `renderAtTime`'s **BatchedMesh** (`~1322`) and **InstancedMesh** (`~1380`) traverse branches,
both gated by the `§PERF_INCR` incremental-delta skip:
```
if (_incrOK && !_tmHasEventIn(_evMesh[obj.id], _dLo, _dHi)) { _perfSkipped++; return; }
```
`_tmHasEventIn` asks "did this mesh's **construction-time** state change between the previous cursor
and this one?" — it has no concept of camera movement. Orbiting the camera without advancing/
scrubbing the TM cursor means `_dLo`/`_dHi` collapse to the same instant, `_tmHasEventIn` returns
false for every mesh (nothing was built or finished in a zero-width window), so `_incrOK` mode
**skips the branch entirely before it ever reaches `_dlodInView`** — the mesh's visibility is left
exactly as it was the previous tick. Meanwhile `_dlodUpdateBoxes` (`~584`, the box-visibility sync)
has **no such guard** — it unconditionally re-evaluates every box every call. So on a pure
camera-only tick: the box correctly re-checks and hides (now in-view), but the real mesh's
`setVisibleAt`/`setMatrixAt` restore never runs (skipped by `_incrOK`) — net result, nothing is
visible in that spot until a forced-full pass happens to run (exactly what the ◧ pill's click
handler does via `window.__forceFull = true`, which is why retoggling "fixes" it).

The single-mesh branch (`obj.userData.guid`, `~1250`) does **NOT** have this skip (its own comment,
`~1227`, says so explicitly: "unconditional, never skipped regardless of `_incrOK`") — so this bug
is specific to **BatchedMesh/InstancedMesh-consolidated** elements, which is exactly how LTU's 122K
elements are stored (`"13611 instanced groups"`, per the in-app status bar) — matches the user's
report precisely; a small single-mesh-only building would likely not show this.

**Why this wasn't caught earlier:** every witness/test run so far drove the cursor (scrub/play) —
none tested "hold the cursor still, only orbit the camera," the exact case a real user does
constantly while watching playback. The `§PERF_INCR` guard was designed and tuned entirely around
construction-time events (Phase 1/2 of TM_INCREMENTAL_RENDER_PERF.md) before DLOD's camera-dependent
visibility axis existed — it's not wrong for its original purpose, it's just now missing a second
trigger condition DLOD introduced.

**Not fixed yet. Directions to weigh, not a chosen answer:**
- (a) When `_dlodOn` is true, force `_incrOK = false` unconditionally (mirror `_shadowJustToggled`'s
  pattern but for every tick, not just the edge) — simplest, but gives up delta-mode's perf win for
  the ENTIRE tick, on every tick, whenever the toggle is on, even during pure cursor scrub where nothing
  camera-related changed. Defeats part of the point of DLOD's own perf goal.
- (b) Detect "camera moved since last tick" (position or orientation delta) as ITS OWN edge condition,
  same shape as `_shadowJustToggled` — force one full pass on a camera-move tick, only when `_dlodOn`.
  Closer to the actual trigger, but "how much movement counts" needs a real threshold, and orbit
  controls fire continuously while dragging, not just at rest — worth checking whether that means a
  full pass on EVERY frame during a drag (probably yes, which may be the correct/needed behavior, or
  may reproduce (a)'s cost — measure before assuming either way).
- (c) Track a per-guid "last _dlodInView result" cache (mirroring `_dlodBoxIndex[guid].visible` which
  already exists for boxes) and, inside the incremental-skip branches, ALSO bypass the skip
  specifically for a guid whose cached in-view state disagrees with a fresh `_dlodInView(g)` check —
  most surgical (only re-visits meshes that actually flipped), but adds a second state cache to keep
  in sync with the box index's, and needs its own invalidation on building switch (same class of bug
  `_dlodBoxIndex`/`_dlodBoxBld` mismatch already had to guard against once, see §8/§9).
None of these is obviously right — this needs the same kind of care (and probably the same "ask the
user which tradeoff" pattern) as the box-visibility redesign in §9 did. **Whichever is picked must
re-verify §9's W-DLOD-EQUIV invariant still holds when `_dlodProxyOn` is false** (this bug's fix must
not touch anything on the OFF path).

**Fixed (2026-07-21, direction (b) chosen and implemented) — PR #927, bim-ootb
`fix/dlod-tm-camguard` (`8ef3216`), pushed but NOT yet merged.** Direction (b) turned out to already
have a proven precedent in this exact file: `_giHoldCamSig`/`_giScheduleHoldConverge` (~line 747,
`§TM_GI_HOLD_CAMGUARD`, ported PR #816) solved the identically-shaped problem — "an accumulation/
visibility decision needs to re-trigger on camera movement alone" — using a cheap position+quaternion
string signature compared every tick, no arbitrary movement threshold. That answers (b)'s open
question ("how much movement counts") for free: none needed, just a string-diff.

Change: a new `_dlodLastCamSig` (module-level, reset to `null` on TM `deactivate()` and whenever
`_dlodOn` is false so a later re-engage never compares against a stale pose). Inside the `_incrOK`
computation (`~line 1236`), when `_dlodOn` is true, call `_giHoldCamSig(app)` and compare against
`_dlodLastCamSig`; a mismatch sets `_dlodCamMoved = true`, which is AND-ed into `_incrOK` (forcing a
full traverse pass for that tick only, same mechanism the ◧ pill's `window.__forceFull` already uses
for the toggle edge). When `_dlodOn` is false, `_dlodCamMoved` is always false — `_incrOK`'s formula
is otherwise unchanged, so the OFF path is byte-identical (W-DLOD-EQUIV preserved).

Verified so far (CLI-only, per this file's own repeated note that headless is blind to GPU/THREE):
`node --check` clean; `tests/whitebox_regression.js` pass=13/37 identical to unmodified `origin/main`
baseline (remaining fails are pre-existing fixture/path issues in a fresh worktree, unrelated to this
diff — confirmed by running the same suite against `origin/main` unmodified and getting the same
count); a standalone pure-logic self-test of the exact committed boolean shape (5/5, scratchpad-only,
mirrors §8's earlier 18/18 self-test) confirms: orbit-only tick forces full pass while DLOD is on;
DLOD-off path never influenced by camera position; first DLOD-engage tick doesn't spuriously force
full; re-engage after an OFF tick (sig reset) doesn't spuriously force full against a stale pose.

**Confirmed and merged (2026-07-21):** live-hardware orbit test passed (demo:
youtu.be/juwOrpqKhFE, "Time Machine Box Proxy Fixed"), PR #927 merged to `main` (`ee57a3e`). §10
closed.
