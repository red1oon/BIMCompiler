# ⚠ DO NOT REMOVE — scope: spec only, no implementation yet. Read the log after every run.

# CPE Walk — WebXR VR Headset Pairing (flag planted 2026-08-08)

## Origin
Follow-on to `prompts/CPE_WALK_GAMEPAD_NAV.md` (§CPE_WALK_GAMEPAD_NAV, shipped bim-ootb PR #1251,
MERGED — standard-mapping gamepad as a third walk-mode input alongside trackpad-first and WASD).
User's next idea: pair a VR headset with that gamepad support — positioning claim "first free BIM
viewer with a headset + separate physical joystick." Two real uncertainties were investigated
BEFORE this spec (2026-08-08, read-only agent, no code touched) — do not re-investigate, both are
answered below with citations.

## Investigation findings (settled — do not re-derive)
**Render-loop conflict: non-issue.** `main.js`'s idle-park (`_rafId`/`_awake`-gated
`requestAnimationFrame`, main.js:661-930) is main.js's only render entry point, but NOT the only
rAF loop in the codebase — `cpe_walk.js`'s own `_tick()` (:315), `time_machine.js`'s `_bgBuildRaf`/
`_giConvergeRaf`, and `effects.js`'s `_stillAORAF`/`_stillRefineRAF` all already run independent,
self-gated rAF loops beside main.js's idle-park with zero edits to `_needsRender`/`animate()`.
WebXR's hard requirement — `renderer.setAnimationLoop(callback)` instead of manual rAF, continuous
at 72-120Hz while a session is open — fits the SAME pattern: a new module calls
`setAnimationLoop(xrTick)` on `sessionstart`, `setAnimationLoop(null)` + hand back to idle-park on
`sessionend`. Same `THREE.WebGLRenderer` instance reused both modes (`renderer.xr.enabled=true` is
a flag toggle, not a second renderer instance). Continuous rendering during an open headset session
is inherent to VR presentation, not a regression — idle-park's purpose (background-tab battery
savings) is moot while a user is actively wearing a headset.

**Positioning claim: narrower than first framed, but the narrow claim holds.** Checked 4 VR-capable
BIM/IFC viewers directly (not just search snippets): `VR_IFC_file_viewer` (CC BY-NC-ND, VR
hand-controllers only, unmaintained), `BIMXplorer` (paid), `ifcXR` (paid, $2/model beyond a
signup-gated free tier), `bimefy.com` VR Viewer (free but signup-gated, its "joystick nav" is the
headset controller's OWN thumbstick, not a separate physical gamepad). **None combine a headset
with a separate physical gamepad/joystick.** "Free BIM viewer with VR nav" alone is NOT novel
(bimefy ships that already) — the defensible claim is narrower: **headset + separate physical
gamepad, free, no signup.** `bim-ootb` confirmed genuinely free/open: root `LICENSE` is plain MIT,
deployed live over HTTPS at an OCI URL (`deploy/OCI_UPLOAD.md:271`), no account/paywall — satisfies
both the "free" framing and WebXR's secure-context requirement.

## Intent — stopgap flag-plant, not a polished feature (2026-08-08)
No VR headset or gamepad has actually been purchased/tested against yet at spec time. The goal of
this lane is explicitly a minimal working stub — feature-detection + session lifecycle real, the
two hardware-dependent pieces (controller mapping, rig-vs-camera pose) left as short, obviously
incomplete placeholders — not a fully-built feature guessed at without real hardware to verify
against. This is a deliberate "plant the flag, let the community/a future session with real
equipment carry it forward" scope, not under-investment — do not read the stub boundary below as
something to "finish properly" without first getting real hardware to test against; guessing the
undecided pieces would produce silently-wrong behavior (see §VERIFY item 3), which is worse than an
honest gap.

## Scope (v1)
Add WebXR as a FOURTH walk-mode input device, alongside trackpad-first (§CPE_WALK_GLIDE),
WASD+mouse, and gamepad (§CPE_WALK_GAMEPAD_NAV) — not a replacement for any of them, matching this
subsystem's existing "input device" framing (`cpe_walk.js`'s own header: "POV walk is an INPUT
DEVICE for the existing stick edit, not a new authoring model").

## Real shipped code to build on (verified 2026-08-08 against `origin/main` post-merge, not guessed)
`viewer/cpe_walk.js` already has, from PR #1251:
- `_gamepadMap(pad, dt)` (:266) — pure function, `{axes, buttons}` in, `{moveFwd, moveRight,
  yawDelta, pitchDelta, snap, stop}`-shaped output out (exact field names: read the function before
  wiring, this spec doesn't repeat them to avoid drift from the real source). Exposed for testing
  as `_gamepadMapForTest` (:571).
- `GAMEPAD_DEADZONE = 0.15` (:79), `GAMEPAD_LOOK_RATE = Math.PI*(120/180)` rad/sec (:78).
- `_gpConnected` flag (:105) gating `_tick()`'s `navigator.getGamepads()` poll (:334) — connect-cost
  pattern to replicate for XR session state.

**Key reuse point:** a WebXR `XRInputSource`'s `.gamepad` property is a `Gamepad`-shaped object
(same `axes[]`/`buttons[]` interface) for controllers that expose thumbstick/trigger input. If the
VR controller's own locomotion (thumbstick-glide) is wanted, **`_gamepadMap()` may be directly
reusable** on `inputSource.gamepad` — confirm the axes-index layout matches the standard Gamepad
mapping (WebXR controller profiles use `xr-standard` mapping, which is NOT guaranteed to be
axis-index-identical to the "standard" Gamepad mapping `_gamepadMap` was written against — VERIFY
before assuming direct reuse, don't invent that they match without checking a real controller
profile, e.g. via the `immersive-web/webxr-input-profiles` registry).

## Proposed architecture (draft — mirrors the gamepad PR's pattern deliberately)
1. New file `viewer/cpe_xr.js` (or extend `cpe_walk.js` directly — decide at implementation time
   based on how much code a `_walkMount`-parallel XR mount/unmount actually needs; the gamepad
   feature stayed inside `cpe_walk.js` because it was small — XR's session lifecycle + rig object
   is a bigger unit, may warrant its own file, matching the `cpe_walk.js`-is-its-own-file precedent
   from §CPE_WALK_EDIT_V1 rather than growing `cinema_path_editor.js`).
2. An XR "enter" button (real user-gesture required, same trust constraint pointer-lock already
   hit in §CPE_WALK_CHROME_POC — a synthetic click cannot start an XR session either, only a
   trusted one) calls `navigator.xr.requestSession('immersive-vr')`.
3. On `sessionstart`: `renderer.xr.setSession(session)`, `renderer.xr.enabled = true`,
   `renderer.setAnimationLoop(_xrTick)`. Camera control shifts from directly moving `_vfCam`
   (today's pattern) to moving a parent "rig" `Object3D` that `_vfCam` (or the XR camera) is
   parented under — WebXR tracks head pose directly onto the camera; the app can only move the RIG,
   never the camera itself. This is a real structural difference from every existing input mode in
   `cpe_walk.js`, which all move `_vfCam.position`/`.quaternion` directly — needs care at the seam
   where `_doSnap()` reads the walked pose (must read the CAMERA's world position, post-rig-offset,
   not the rig's position, or snaps will land at the wrong point).
4. On `sessionend`: `renderer.setAnimationLoop(null)`, `renderer.xr.enabled = false`, hand back to
   `_startLoop()`/idle-park (exact call TBD — read `main.js`'s idle-park entry point at
   implementation time, don't guess the function name here).
5. Controller mapping: left/right `XRInputSource.gamepad` → locomotion + snap, reusing
   `_gamepadMap()` if the axis layout matches (see VERIFY above), else a small XR-specific adapter
   function with the same pure-function shape (`{axes,buttons}` in, deltas out) for the same
   testability reason.

## Testability (per project's FUNDAMENTAL LAW — numeric §-log proof, never screenshots)
Same constraint as gamepad: `navigator.xr` session state can't be faked from plain JS, no headset
in the implementing environment. Two real options, better than gamepad's "no fake-device path at
all":
- **Chrome's WebXR API Emulator extension** fakes headset + controller poses for dev testing
  without hardware — install it in the browser used for any live/Puppeteer verification pass, and
  it should make real `navigator.xr.requestSession()` calls succeed with synthetic pose data.
- Regardless of emulator availability, any pure mapping function (the `_gamepadMap()` reuse or a
  new XR-specific adapter) stays unit-testable with synthetic `{axes,buttons}` objects exactly like
  `witness_cpe_walk_gamepad.js` already does — that numeric proof doesn't depend on the emulator at
  all, only the session-lifecycle/rig-parenting wiring does.

## §VERIFY — open questions before implementation (spec-first: these block coding, not blocked BY it)
1. Does `xr-standard` controller mapping's `axes[]` order match the "standard" Gamepad mapping
   `_gamepadMap()` was built against, closely enough to reuse directly? Check a real profile (e.g.
   `immersive-web/webxr-input-profiles` on GitHub) before assuming yes.
2. Exact idle-park hand-back call at `sessionend` — read `main.js`'s current entry point at
   implementation time (this spec deliberately does not name it, to avoid citing a stale name).
3. Rig-vs-camera pose read at `_doSnap()` time — confirm which object holds the correct world pose
   post-XR-parenting before wiring the snap action; get this wrong and every VR-mode snap silently
   lands at the wrong position with no error.
4. UX for entering/exiting XR while `cpe_walk.js`'s existing walk mode (trackpad/WASD/gamepad) is
   already active — same mode, alternate input, or a distinct toggle? Not decided here.
5. Freeze-overlay / TM-lock / B-viewfinder machinery (§CPE_WALK_CANVAS_FREEZE, §CPE_WALK_TM_LOCK) —
   does "review the frozen main view while walking" even make sense in a headset (user's view IS
   the headset, there's no separate screen to show a frozen backdrop to)? Likely needs its own UX
   answer, not a direct port of the desktop pattern — flag for the implementing session, don't
   assume either way here.

## Status
✅ v0 STUB SHIPPED (2026-08-08) — PR bim-ootb#1253 (Sonnet agent, worktree
`/tmp/wt-cpe-xr-stub`, branch `feat/cpe-walk-webxr-stub`), pushed clean/MERGEABLE. New file
`viewer/cpe_xr.js` (100 lines, deliberately lightweight per the Intent section above) +
`viewer.html`/`sw.js`/`cinema_path_editor.js` wiring (+22 lines total, mirrors the existing
walk-toggle button pattern). Witness `witness_cpe_xr_stub.js` 5/5 PASS + a puppeteer smoke load
(zero console errors, `isSupported()` correctly resolves false with no XR runtime present).

**Real (no open question, built for real):** `CpeXr.isSupported()` (feature detection), the Enter
VR button (hidden unless supported — confirmed at source level, `display:none` cleared only inside
the resolved promise), `enter()`'s trusted-click `requestSession`, full `sessionstart`/`sessionend`
wiring (`renderer.xr.enabled`, `setSession`, `setAnimationLoop`, hand-back to idle-park via
`APP.markDirty()` — the real entry point, confirmed by reading `main.js:693`, not guessed), and
`_xrTick()` rendering directly.

**Honestly stubbed (§VERIFY items 1 and 3, exactly as scoped):** `_xrControllerMap(inputSource,
dt)` returns an all-zero/false no-op, warns once (`§CPE_XR_CONTROLLER_STUB`); `_xrReadWorldPose()`
returns `null`, called from nowhere — not wired into any snap/marker action, so it cannot produce
the "silently lands in the wrong place" failure the spec warned about.

**Known real gap, stated plainly by the implementing agent, not glossed over:** session lifecycle
(`sessionstart`/`sessionend`/`_xrTick`) is verified by code review + load/syntax checks only — no
headset or WebXR emulator was available in the implementing environment, so it has never been
exercised against a real XR session. First real headset test is the next real milestone here, not
another spec/stub pass.

⛔ Still blocked from a real feature: §VERIFY items 1 (controller axis-mapping reuse) and 3
(rig-vs-camera pose) need real hardware to resolve — do not guess them without a device, per the
Intent section above.
