# ⚠ DO NOT REMOVE — Scope: Precision Cam — Auto-Pivot (re-center orbit on drag-end)
# Read the log after every run. No inventions. Honour until DONE.

## Origin
Extends the Feather / Precision Camera drawer born in `prompts/done/S265_UI_AESTHETICS.md`
(§120, §300: "Feather (Precision Camera): tap=Fine toggle, long-press=Reset chip").
Code lives in `deploy/dev/precision_cam.js` (tagged `// S265:`). Single file, no copies → additive, no drift.

## Problem
The drawer's 🎯 **Reset** re-anchors the orbit pivot (`controls.target`) to a point a **fixed
10 units ahead** of the camera (`precision_cam.js:59`) — geometry-blind. If the model sits at a
different distance, you orbit around empty space in front of/behind it. After panning around, the
pivot drifts and orbit no longer spins around what you're actually looking at.

## Feature — 🏺 Pivot (Auto-Pivot toggle)
A **third drawer button**, a sticky toggle (mirrors 🪶 Fine, not one-shot 🎯 Reset). While ON:
- Each time a drag finishes (OrbitControls `'end'` event), re-anchor `controls.target` to the
  **nearest surface to the screen-centre**. A single dead-centre ray misses anything not exactly
  under the crosshair, so sample concentric NDC rings (centre, r=0.06, 0.12, 0.18 × 8 dirs),
  radiating outward, and take the first ring that hits → the nearest-to-centre surface wins.
- Fallbacks in order: all rings miss → scene bounding-box centroid (`Box3.setFromObject`) →
  point-10-ahead (same as Reset) so it never throws.
- Witness logs the ring radius at which it hit (`hit=mesh r=0.06`) for insight.
- Re-anchor fires once immediately on toggle-ON so the pivot snaps right away.
- Only writes `controls.target` then `controls.update()` + `markDirty()` — identical mechanism to
  Reset, different landing point. Camera does NOT jump (OrbitControls keeps the camera offset when
  target moves), so the view is stable while the spin axis follows the scene.

## Mechanism note (why no view jump)
`OrbitControls.update()` recomputes `camera.position = target + offset`. Moving `target` alone and
calling `update()` shifts the orbit pivot without moving the camera — same as the existing
`resetOrbit()`. This is reuse of a proven path, only the target value differs.

## Scope guard — NO impact
Confined to `deploy/dev/precision_cam.js`: +1 button in drawer `innerHTML`, +1 `pointerup` handler,
+1 toggle fn pair (`pivotOn`/`pivotOff`) + `recenterPivot()`, +1 `window.toggleCamPivot` export.
Does NOT touch Fine, Reset, toolbar wiring, render loop, or any other file. The `'end'` listener is
attached on toggle-ON and removed on toggle-OFF (no always-on overhead).

## Witness (whitebox §-log — prove before deploy, per CLAUDE.md)
W-PIVOT-TOGGLE : `§pivot ON` on enable, `§pivot OFF` on disable.
W-PIVOT-RECENTER : after every drag-end while ON, exactly one
  `§pivot recenter target=(x,y,z) hit=mesh|bbox|ahead` — proves target moved to the resolved centre
  and which resolution path fired. Orbit-drag → hit=mesh (or bbox); empty-space view → hit=ahead.

## Test (names the issue it proves)
- ISSUE: "orbit pivot drifts off the model after panning." PROOF: with Pivot ON, pan away then read
  `§pivot recenter` — target lands on the visible surface (hit=mesh), not 10-ahead. With Pivot OFF,
  no `§pivot recenter` line appears (listener detached).
- Browser §-log first (read the console log), Playwright only for wiring (button exists, toggles).

## Steps
1. Implement in `precision_cam.js` per spec above.
2. Syntax check (`node -c`), verify all `§` tags exist, save test log, read the log.
3. Confirm with user before any deploy (deploy/dev flow per CLAUDE.md).

## DONE
(append evidence: § log lines proving W-PIVOT-TOGGLE + W-PIVOT-RECENTER)

Shipped 2026-06-04→2026-06-06 to the canonical viewer (`bim-ootb/viewer/precision_cam.js`, this repo's
`deploy/dev/precision_cam.js` copy was the original build location) — PR #101 (base feature), #103
(keyboard cluster: `A`=Reset, `Q`=Pivot, `CapsLock`=Fine), #104 (homes on selected element), #108
(top-centre icon notices), #109/#111 (fallback hardening — building meshes only, never sky/ground).
Full behavioral detail lives in memory `project_precision_pivot.md`, not restated here.

## 2026-07-27 — CLOSED: no automated trigger for anything. `A`/`Q`/Fine are manual only.

Un-archived from `prompts/archive/` the same day (a "make Auto-Pivot always active" investigation
found the code but not this spec — a `git grep` for "Caps Lock" across `prompts/**/*.md` is what
found it). Several same-day attempts at automating a recenter — `Q` default-on (#1033), reverted
(#1034) for drifting the view and defeating Reset; an ambient mechanism gated on idle+count that
first mistakenly called `Q`'s `recenterPivot()` (#1039), was corrected to call `A`'s `resetOrbit()`
(#1040), had its Q/Fine check hardened (#1041) — were all tried, then **fully reverted (#1048)**
after real use showed the pivot going haywire regardless of the safeguards. Git holds that whole
chain (PRs #1033/#1034/#1039/#1040/#1041/#1048); no need to replay it here.

**Final requirement, stated directly by the user: `A` is manual only, no automated trigger of any
kind.** `viewer/precision_cam.js` is restored byte-for-byte to `08c0809` (#1034) — `Q`/`A`/Fine are
exactly the original spec above, nothing automated added. The one change from the original spec that
IS kept: Fine wins over Auto-Pivot's own recenter (`_onEnd` checks `_pivot && !_fine`, from #1033) —
independent of the automation attempts, still correct on its own merits. Do not revisit "always
active" for this feature without the user raising it fresh.
