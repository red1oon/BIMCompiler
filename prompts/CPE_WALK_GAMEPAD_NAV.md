# ⚠ DO NOT REMOVE — scope: spec only, no implementation yet. Read the log after every run.

# CPE Walk — Gamepad/Joystick Navigation (flag planted 2026-08-08)

## Origin
User idea: extend `viewer/cpe_walk.js`'s POV walk mode (§CPE_WALK_EDIT_V1, shipped PR bim-ootb#1243,
ruled live §CPE_WALK_UX_V2 PR#1248 + §CPE_WALK_SCRUB_SPAWN PR#1249) with a standard-mapping game
controller as an alternate input device, alongside trackpad-first (§CPE_WALK_GLIDE) and WASD+mouse.

**Prior art check (web search, 2026-08-08, not yet verified against live docs/repos — see
§VERIFY):** established pattern in proprietary desktop BIM (BIMx "Gamer Mode" — native gamepad +
SpaceMouse; Navisworks CtrlWiz/NavisGame — Xbox controller plugins; Revit RevGame — joystick
plugin), but **not found** in FOSS/browser IFC viewers (web-ifc-viewer, xeokit-bim-viewer,
BlenderBIM/IfcOpenShell inherit Blender's mouse/NDOF nav, FreeCAD is mouse/touchpad/SpaceNavigator
only — the one gamepad-adjacent FreeCAD project, HyperController, is a custom Arduino 8DOF rig, not
an off-the-shelf-controller plugin). If accurate, a Gamepad-API-driven walk mode in this Viewer would
be a genuine flag among FOSS/web BIM tools, not a catch-up feature. **This claim is a search-engine
snapshot, not extracted from source — treat as directional until an implementation session
independently confirms via each project's own repo/docs, per PRIME RULE (no invention).**

## Why a joystick differs from the existing inputs (settled in conversation, restated here)
- **Trackpad look (§CPE_WALK_GLIDE)** is relative/position-based: finger-move delta drives
  pointer-lock yaw/pitch (`cpe_walk.js:177 _yaw -= e.movementX * MOUSE_SENSITIVITY`). Physical pad
  travel is finite — a long turn runs the finger off the edge, forcing lift-and-reposition (the
  "exhausted → reset" the user described). This is inherent to relative/delta input, not a bug.
- **A standard-mapping gamepad's analog stick is absolute/rate-based:** `axes[i]` reports a fixed
  physical deflection (-1..1), spring-centred at rest. Hold the stick over and the rate stays
  constant indefinitely — no travel limit, no reset gesture needed. Mapping is `deflection →
  turn-rate` (multiply by dt each `_tick`), not `delta → look-offset`.
- **Keyboard (WASD) cannot substitute for this**: `keydown`/`keyup` are binary, a stick axis is
  continuous — keyboard can fake "full push" or "no push," never partial deflection. This also
  matters for the witness plan below (§VERIFY) — synthetic tests must feed continuous axis values,
  not simulate keypresses.

## Scope (v1, standard-mapping only)
Only gamepads reporting `mapping === "standard"` (Xbox/PlayStation/most generic USB-BT pads) are
in scope. Non-standard devices (`mapping === ""` — flight sticks, off-brand joysticks) report raw
axis/button order that varies per device; explicitly OUT of scope for v1, named as a follow-on if
ever requested.

## Proposed mapping (draft — confirm against `cpe_walk.js`'s existing constants before implementing)
- **Left stick** (`axes[0]`,`axes[1]`) → replaces WASD's `move` vector in `_tick()` (:244-260):
  `move = right*axes[0] + fwd*-axes[1]`, scaled by `WALK_SPEED_MPS * dt` same as today (no new
  speed constant — reuse the existing one so keyboard/gamepad feel identical).
- **Right stick** (`axes[2]`,`axes[3]`) → replaces pointer-lock mouse-look's yaw/pitch delta
  (`_onMouseMove` :172-178): `_yaw -= axes[2] * GAMEPAD_LOOK_RATE * dt`, `_pitch -= axes[3] * ...`,
  same clamp. New constant, NOT `MOUSE_SENSITIVITY` (that's a per-pixel delta gain, wrong unit for
  a per-second rate) — needs its own tuning pass.
- **Right/left trigger or a face button** → glide accel/decel, replacing wheel/pinch
  (§CPE_WALK_GLIDE) — open question, see §VERIFY.
- **A button (`buttons[0]`)** → `_doSnap()` (plant stick + release), same action as Enter/Space/click.
- **B button (`buttons[1]`) or Start** → `stop()`, same as Escape.
- Dead-zone: standard ~0.15 threshold on all axes before any input registers (avoid drift from
  worn/imprecise sticks) — needs its own constant, not reusing any existing tolerance in the file.

## Architecture note for the implementation session (testability, per project whitebox rule)
Write the axis→motion mapping as a **pure function** taking a `{axes, buttons}`-shaped object, NOT
a function that calls `navigator.getGamepads()` internally. `navigator.getGamepads()` only returns
entries for physically-connected hardware — there is no way to fake "a gamepad is connected" from
JS — so a witness with no real controller attached can still assert the maths by handing the pure
function synthetic axis values (e.g. `{axes:[0.3,-0.7,0,0], buttons:[{pressed:false}]}`) and
checking the resulting `move`/`yaw`/`pitch` deltas numerically. The `_tick()` loop itself (which
DOES call `getGamepads()`) stays a thin, mostly-unwitnessable wrapper — same pattern the file
already uses for the WASD path (`_keys` object is orthogonal to the DOM listener that sets it).

## Load/impact model (confirmed against real code, 2026-08-08)
- **Plug-and-play:** yes, no driver/config needed — standard-mapping controllers fire the browser's
  own `gamepadconnected` event on connect.
- **Zero cost when unused:** gate on the SAME `_active` flag `_tick()` already checks (`cpe_walk.js`
  `_tick()` returns immediately unless walk mode is mounted — :244) — gamepad polling piggybacks on
  that existing loop, so it costs nothing while the walk panel is closed. Within `_tick()`, only call
  `navigator.getGamepads()` if a `gamepadconnected` listener has fired at least once (flag it; don't
  scan the array every frame on the chance a pad exists) — near-zero cost with no controller present.
- **NOT lazy-loaded as a separate chunk** — `cpe_walk.js` itself loads eagerly today
  (`viewer.html:828 <script src="cpe_walk.js?v=4">`, precached `sw.js:118`), same as the rest of the
  file's WASD/mouse-look/wheel-glide code: always-loaded, dormant until `start()`. Gamepad support
  should follow the SAME convention — added inside `cpe_walk.js`, not a new dynamically-imported
  module — unless a future session deliberately wants to deviate from that established pattern.

## §VERIFY — open questions before implementation (spec-first: these block coding, not blocked BY it)
1. Confirm `mapping/xeokit/web-ifc-viewer/FreeCAD` prior-art claims above against live sources
   (repo search / changelogs), not just the search-engine summary already gathered.
2. Trigger vs face-button for glide accel — test on a real controller before committing to the
   mapping (triggers are naturally analog and fit "speed," but confirm feel).
3. Does `_tick()`'s existing `MAX_DT` clamp and `dt`-based scaling need any changes for gamepad
   polling cadence, or is it already frame-rate-agnostic enough to reuse verbatim? (Read
   `cpe_walk.js:244-260` again at implementation time — likely reuse as-is, confirm not assume.)
4. Vibration/haptics (`GamepadHapticActuator`) — out of scope for v1, name explicitly if raised later.

## Status
✅ v1 SHIPPED (2026-08-08) — PR bim-ootb#1251 (Sonnet agent, worktree `/tmp/wt-cpe-gamepad`,
branch `feat/cpe-walk-gamepad`), pushed clean/MERGEABLE. `cpe_walk.js` +130/-2 LOC (within the
~80-150 estimate above), witness `witness_cpe_walk_gamepad.js` 15/15 PASS — real numeric
assertions on the pure `_gamepadMap(pad, dt)` function via Node `vm` sandbox (no hardware needed,
per this doc's own testability design), plus a supplementary Puppeteer load-check (zero console
errors, real browser). `sw.js` CACHE_VERSION v965→v966, `viewer.html` script version v4→v5.
Left stick=move (reuses `WALK_SPEED_MPS`), right stick=look (new `GAMEPAD_LOOK_RATE` = 120°/sec,
**untuned — no physical controller in the implementing environment, needs a live-feel pass**),
A=snap, B/Start=stop, 0.15 dead-zone, standard-mapping only. Judgment calls beyond the spec: glide
via trigger/button (§VERIFY Q2) NOT implemented, named follow-on below; added an
already-connected-before-mount check (`gamepadconnected` only fires at physical connect time, a
real API gotcha, not spec'd but needed for correctness).

## Follow-on — WebXR VR headset pairing (investigated 2026-08-08, NOT yet spec'd/implemented)
User's next idea: pair this with a VR headset ("first free BIM goggles with joystick"). Dispatched
a read-only investigation agent to de-risk the two real unknowns before writing that spec:

**Render-loop conflict — NON-ISSUE, precedent already covers it.** `main.js`'s idle-park
(`_rafId`/`_awake`-gated `requestAnimationFrame`, main.js:661-930) is main.js's only entry point,
but NOT the only rAF loop in the codebase — `cpe_walk.js` (this file, its own `_tick()` chain,
:315-362), `time_machine.js` (`_bgBuildRaf`, `_giConvergeRaf`), and `effects.js` (`_stillAORAF`,
`_stillRefineRAF`) all already run independent, self-gated rAF loops alongside main.js's idle-park
with zero edits to `_needsRender`/`animate()`. WebXR's hard requirement —
`renderer.setAnimationLoop(callback)` instead of manual rAF, continuous at 72-120Hz while a
session is open — fits the identical pattern: a new module calls `setAnimationLoop(xrTick)` on
`sessionstart`, `setAnimationLoop(null)` + hand back to idle-park on `sessionend`. Same
`THREE.WebGLRenderer` instance reused both modes (`renderer.xr.enabled=true` is a flag, not a
second renderer). Continuous rendering during an open headset session is inherent to VR
presentation, not a regression of the idle-park optimization (whose purpose — background-tab
battery savings — is moot while a user is actively wearing a headset).

**"First free BIM headset + gamepad" — narrower than first framed, but the narrow claim holds.**
Checked four VR-capable BIM/IFC viewers found by websearch, not just their snippets:
- `VR_IFC_file_viewer` (GitHub, dominuszagare) — CC BY-NC-ND (source-visible, not freely reusable),
  VR hand-controllers only ("expects... a trigger and grip button"), unmaintained (22 commits).
- `BIMXplorer` — paid commercial product (`/pricing` page), hand-controllers only.
- `ifcXR` — paid, "$2/model" beyond a signup-gated free tier, no gamepad mentioned.
- `bimefy.com` VR Viewer — free VR nav, but its "joystick-based navigation" is the VR
  controller's OWN built-in thumbstick, not a separate physical gamepad; requires account signup.
- **None combine a headset with a separate physical gamepad/joystick as a paired input** — that
  specific combination is unaddressed by all four. "Free BIM viewer with VR nav" alone is NOT
  novel (bimefy already ships it); the defensible claim is narrower: "headset + separate physical
  gamepad, free, no signup."
- `bim-ootb` itself confirmed genuinely free/open: root `LICENSE` is plain MIT, deployed live at
  an HTTPS OCI URL (`deploy/OCI_UPLOAD.md:271`) with no account/paywall — satisfies both the "free"
  framing and WebXR's secure-context requirement.

**Status:** investigation only — no spec written yet for the WebXR lane. Next session picking this
up: write a dedicated spec (own file or a new section here) covering XR session entry/exit UX,
controller→locomotion mapping (reusing `_gamepadMap`'s shape where the WebXR controller's own
`.gamepad`-shaped input matches), and a testability plan (Chrome's WebXR emulator extension can
fake headset+controller poses without hardware — better coverage than raw Gamepad API, which has
no fake-device path at all).
