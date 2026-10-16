# ⚠ ARCHIVED — Time Machine Movie Export, retired 2026-07-18

Full code preserved as `TM_MOVIE_EXPORT_RETIRED_2026-07-18.patch` (raw `git show` output of the
shipped commit) in this same folder — apply with `git apply` or read directly for reference.
Live spec/session history: `prompts/PHOTOREAL_STILL_RENDER.md` §IMPLEMENTATION SPEC and the
session records dated 2026-07-17/18.

## What this was
A batch movie-export feature for Time Machine: capture one Alt+S-quality still per
`_cineStoryboard` beat (later redesigned mid-session to a fixed-timeline/orbit-camera/Shadow-mode
variant), stitch into a webm via a proxy canvas + `MediaRecorder`. Shipped to production as PR
#849 (`a25418e`), replacing the `#tm-share` button with "Export Movie."

## Why retired
Live user testing across the session surfaced real, compounding friction:
- Beats played in the storyboard's spatial-flight order (foundation-up, left-to-right sweep, built
  for smooth Drone Pilot camera motion), not chronological — didn't read as "start from timeline."
- A real SSAO composer-sizing bug produced a solid white band across captured frames; took 4
  targeted fix attempts before isolating the actual cause (composer render targets never resized
  after a `pixelRatio` change) by bypassing the composer entirely as a diagnostic.
- Dropping Alt+S (its 16-sample TAA) for cheaper Shadow-mode capture fixed the timing problem
  (~85-175ms/frame vs Alt+S's 400-800ms) but produced visibly grainy output — no anti-aliasing at
  all in that pipeline.
- The sun/day-night formula hit a literal zenith angle (elevation=90°) at the sample's midpoint
  hour, washing out the sky — required decoupling "sun time" from "construction time" entirely.

Against all that friction, the user's own live-playback experience (Time Machine + Alt+G, already
auto-engaging real N8AO ambient occlusion per PR #836/#837) already looked good, and reusing an
external/OS-level screen recorder over that live view is free, gives the user full control over
camera angle, timing, and starting point, and needs zero further engineering. Verdict: **more
pragmatic to screen-record the live interactive experience than to keep building/fixing a scripted
batch exporter.**

## What shipped alongside, reverted together
- `effects.js`: `A.startStillRefine(onComplete)` completion-callback plumbing (additive, harmless
  when unused, but nothing calls it once export is gone) — reverted.
- `main.js`: `!APP._tmExportActive` gate on the incidental-touch-cancel wiring — reverted (the
  thing it protected no longer exists).
- `time_machine.js`: the whole export loop, IDB frame store (`bim_ootb_tm_export`), UI button —
  reverted; `#tm-share` restored.
- **Kept**, not reverted: `universal_history.js`'s `§WHOLE-LANDED origin=` logging addition — a
  genuinely useful, unrelated fix (a bug report pasting only `db=` can't tell localhost from
  production; this session lost real time to exactly that ambiguity) — reapplied on top of the
  revert commit.
- **Kept**, separately shipped, not reverted: PR #848 (`§TM_GI_HOLD_CAMGUARD` ghosting fix) — a
  real, validated, independent bug fix found while investigating this lane, unrelated to the
  export mechanism itself.

## Two more standing fixes from the same closing session (2026-07-18)
- **Alt+G auto-engage retired.** PR #836/#837 had Time Machine auto-turn-on Alt+G N8AO on every
  open, unconditionally, no opt-out — inconsistent with Shadow/sky already being correctly
  user-choice-only (`§TM_SUN_INHERIT`: "Don't force sun cycle — respect user's shadow/sky
  choice"). User: "its up to user to turn Shadow, G and audio." Alt+G is now purely a manual
  keypress again, matching the other two.
- **Yellow frontier edge-box removed.** The `BatchedMesh` frontier marker (`_tmEdgeYellow`, bright
  yellow wireframe cube, `depthTest:false`) shone through walls/floors on real buildings —
  user: "seems to bleed badly for Hospital." Removed entirely, unconditionally (not gated behind
  an export-specific flag, since the export feature it was scoped for no longer exists and the
  bleed-through was a real live annoyance on its own). The material-tint glow on single-mesh
  frontier elements (`applyHighlight`, follows the exact real geometry, not a box) is untouched.

## If revisited later
The real, reusable findings from this lane (worth reading before rebuilding, not just for
sentiment):
1. `renderAtTime(cursorMs, opts)` can take an options bag (`noHighlight`, phase filtering) without
   disturbing the default call signature — a clean extension point if a scripted capture mode is
   ever wanted again.
2. The SSAO composer-sizing bug is real and still present in the live composer path if anyone else
   ever calls `renderer.setPixelRatio()` without a matching `A._composer.setSize()` /
   `A._ssaoPass.setSize()` call — not something this retirement fixed, just discovered and
   avoided by not using the composer path at all in the (now-reverted) capture loop.
3. Sun-cycle time should be decoupled from whatever "content" timestamp a batch process is
   iterating over — sampling real op timestamps directly produces jarring lighting swings; a
   separate, smoothly-advancing synthetic clock reads as intentional instead.
