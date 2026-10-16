# ⚠ DO NOT REMOVE — scope: spec only, no implementation yet. Read the log after every run.

# WebXR Find/Select-in-VR — pointing at panel items from inside a headset (flag planted 2026-08-08)

## Origin
Third follow-on in this lane, after `CPE_WALK_GAMEPAD_NAV.md` (shipped, PR #1251) and
`CPE_WALK_WEBXR_VR.md` (v0 stub shipped, PR #1253). User's idea: the existing Find panel already
does most of "point at an item, the 3D view responds" — reuse that logic so the same
select-and-navigate/highlight behavior works from a VR controller pointing at a panel floating in
3D space, not just a mouse clicking a 2D HTML panel.

## What's real today (verified against `origin/main`, not assumed)
`viewer/navigate_find.js` is a large (5000+ line), real, working Find panel:
- DOM structure: `.find-tree-row` / `.find-acc-header` / `.find-acc-item` / `.find-result-item` —
  plain HTML `<div>`s with `pointerdown`/`pointerup` listeners (:236, :293-317, :4817-4857).
- Selection logic is mostly decoupled from the DOM binding — e.g. `_highlightGuids(set)` (:1447),
  `_highlightLensReset()` (:1422), and a fly-to-selection behavior logged at :5020
  (`flyTo=(x,y,z)`) are named, callable functions the click handlers invoke, not logic baked
  directly into the event listener. This is the reuse the user is pointing at, and it's real: the
  ACT of selecting-and-responding (highlight + fly camera) is already a function call away from
  any specific input device, not hardwired to mouse-click.

## The one honest blocker: this is an HTML DOM panel, and DOM does not render inside an immersive WebXR session
This is the critical fact that makes "just point at the panel in VR" NOT a direct port, and it
needs to be stated plainly rather than glossed over (per this project's non-invent rule — false
"it just works" framing here would waste an implementation session's time):
- An `immersive-vr` WebXR session renders ONLY the WebGL canvas in stereo inside the headset. The
  page's regular DOM (every `.find-tree-row`, every button) is NOT part of that render — it only
  ever appears on the flat 2D monitor outside the headset, invisible to someone wearing it.
- WebXR does have a `dom-overlay` feature, but it is built for `immersive-ar` (camera-passthrough)
  sessions, where a 2D overlay makes sense on top of a see-through camera feed. Its support for
  `immersive-vr` is inconsistent across browsers/headsets — **do not assume it works for VR without
  checking the actual runtime you're targeting (Quest Browser) first; this spec does not rely on
  it**, treat any working `dom-overlay`-in-VR support as a bonus, not the plan.
- So "point at the panel" REQUIRES rendering an actual 3D object standing in for the panel — a
  real Three.js mesh with the item list drawn onto it — not a DOM element positioned in 3D CSS
  space. This is genuinely new work, not a reuse of the existing panel's presentation layer, only
  of its underlying selection/highlight/fly-to LOGIC.

## Scope (v1) — a minimal slice, not a port of the whole Find panel
The full Find panel (accordion tree, drag-resize grip, multi-select, ERP push button, cost
sidebar) is real complexity — porting all of it to 3D is NOT simple and is explicitly OUT of scope
for v1. Minimal viable slice: **a flat list of N items** (e.g. the active clash list, or a single
level of Find results — decide which at implementation time based on what's most useful, not
decided here) rendered as ONE simple 3D panel, each row selectable, calling the SAME existing
highlight/fly-to functions the desktop panel already calls. No accordion, no drag-resize, no
multi-select, no ERP button in v1 — those stay desktop-only until this minimal slice is proven.

**Explicit division of labour (confirmed with the user 2026-08-08, locking this in rather than
leaving it implied):** searching/filtering/typing happens on the DESKTOP 2D Find panel, exactly as
it works today — the user builds their list of interest there first (a search term, a discipline
filter, whatever produces the clash-pair or type listing they want). VR receives that already-
resolved list as a read/select surface only — it does not search, filter, or accept text input of
its own. This is a deliberate scope boundary, not a placeholder to fill in later: **typing a
search term or working an accordion filter with a VR hand controller is a genuinely hard UI
problem** (text entry in VR is painful in even mature apps); "look at a pre-built list, point,
select" sidesteps that problem entirely rather than solving it. If a future session wants VR-native
search, that is a separate, much larger spec, not an extension of this one.

## Proposed architecture (draft)
1. **Panel rendering — reuse a technique already in this codebase, just repurposed.**
   `cpe_walk.js`'s freeze-overlay (`_captureFreeze()`) already draws onto a 2D `<canvas>` context
   for a screen-space overlay. The same 2D canvas-drawing technique (draw item labels with
   `ctx.fillText`) can feed a `THREE.CanvasTexture` mapped onto a `THREE.PlaneGeometry` — a real 3D
   object in the scene, not a screen overlay. This is a genuinely simple, low-risk piece — standard
   Three.js pattern, not experimental.
2. **Selection input — does NOT need the still-stubbed controller-axis mapping.** WebXR sessions
   have a native `select`/`selectstart`/`selectend` event (trigger-pull), separate from the raw
   `XRInputSource.gamepad` axes/buttons that `_xrControllerMap()` (stubbed, `§VERIFY` item 1 in
   `CPE_WALK_WEBXR_VR.md`) still needs real hardware to resolve. Panel-pointing can ship
   independently of that stub being filled in — worth noting as a scoping win, not a blocked
   dependency.
3. **Hit-testing:** a `THREE.Raycaster` built from the controller's pose (WebXR gives this
   directly) against the panel plane; translate the UV hit coordinate to a row index
   (`Math.floor(uv.y * N)` against N evenly-sized rows); call the SAME existing function the
   desktop click handler calls for that row (exact function TBD per which slice is chosen in
   Scope above — read the real handler at implementation time, don't guess the name here).
4. **A simple laser-pointer line** from controller to hit point — standard WebXR UI convention,
   small addition (a `THREE.Line` updated per frame), not hard.
5. **Panel placement — real open UX question, not decided here.** World-fixed (placed once, user
   walks/flies back to it — more comfortable, consistent with the "screen-locked HUDs can feel
   nauseating" caveat already raised for other VR work in this lane) vs. head-locked (always
   visible, follows the rig — more convenient, more clutter/comfort risk). Also ties directly to
   `CPE_WALK_WEBXR_VR.md`'s still-open `§VERIFY` item 3 (rig-vs-camera pose) — the panel needs to
   be positioned relative to WHICHEVER object turns out to hold the correct world transform, same
   unresolved question, not a new one.

## Testability (per project's FUNDAMENTAL LAW — numeric proof, no screenshots)
No headset available, same constraint as the rest of this lane. What CAN be tested without
hardware: the raycast-hit-to-row-index math is pure geometry — given a synthetic ray origin/
direction and a known plane transform, does the hit-test produce the correct row index? This is
unit-testable with plain `THREE.Raycaster`/`THREE.Plane` objects and no XR session at all, same
synthetic-input philosophy as `witness_cpe_walk_gamepad.js`. Canvas-texture generation can be
checked by rendering to an offscreen canvas and asserting pixel data at expected label positions
(lower-value test, optional). Full panel-in-headset interaction stays untested until real hardware
arrives, same honest gap already stated for the rest of this lane.

## §VERIFY — open questions before implementation
1. Which slice ships first (clash list vs. Find results vs. something else) — not decided here.
2. World-fixed vs. head-locked panel placement — real UX call, needs a decision or a first guess
   to be validated against real hardware, not invented in this document.
3. Inherits `CPE_WALK_WEBXR_VR.md`'s open rig-vs-camera question (§VERIFY item 3 there) — this
   spec does not re-resolve it, just flags that the panel's position depends on that answer.
4. `dom-overlay` for VR — worth a real capability check (not a search-engine guess) against the
   actual target runtime (Quest Browser) before ruling it out entirely; this spec assumes NOT
   available and designs around that, but confirming either way is cheap and worth doing early in
   implementation, not assumed permanently.

## Status
⛔ BLOCKED (by design, spec-first). This is a genuine, real capability to build (the underlying
selection/highlight/fly-to logic already exists and is reusable) — but it is NOT a "just point at
the existing panel" shortcut; it requires a new, real 3D panel-rendering piece. Scoped deliberately
small (one flat list, no accordion/multi-select/ERP) to match this lane's stopgap/lightweight
philosophy — do not expand scope to the full Find panel without the minimal slice being proven
against real hardware first.
