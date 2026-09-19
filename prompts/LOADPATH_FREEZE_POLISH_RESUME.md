# ⚠ DO NOT REMOVE — LOAD-PATH FREEZE-FRAME POLISH: hand-off (written 2026-09-17 by the outgoing
reviewer session). Read the log after every run (CLAUDE.md Log Mandate). Never judge from frames —
every claim traces to a `§` line you read yourself, not to a description of one, not to what red1
says they see (their eyes are the final arbiter of LOOK rulings, but that's a ruling on a fix's
result, never a substitute for you tracing the cause in code/logs first).

## §129.18-34 SESSION (2026-09-18/19) — cut-in/out, HUD timing, panel/info-card polish, the ground
bug, dynamic grid ink, committed+pushed. Picked up from §129.17 below. Do not re-open any of these.

**§129.18-26 (HUD/table redesign, done before this write-up's own visible window but confirmed via
code+bakes since):** ladder replaced with a fixed per-stack info panel (`_drawStackInfoPanel`),
bottom-up row order (hop1 at the panel's own bottom, matching "each layer rests on the one below
it"), totals (RM cost, days) moved into the header only, summed straight across revealed hops.

**§129.27 Instant cut, front-loaded HUD (2026-09-18, red1: "the background sky ground, building
that needs to cut out... separate from HUD overlays" / "the fade in by HUD happens before the
freeze cuts back... don't fade them back after the cut, before"):** backdrop/section-cut/whiten are
now a hard instant snap at arm AND release (no more ramp either direction) — `cpe_load_path.js`'s
`_backdropApply`/`_sectionCutApply` call sites. HUD is the only thing that still eases: its own
`_hudFadeT` (cinema_maxq.js, decoupled from the old shared `A._loadPathFadeT`) ramps out over the
FIRST `fadeSec` after arm and back IN over the LAST `fadeSec` of the hold's own known `durSec` —
front-loaded, so HUD is already back to alpha=1 exactly at release, never straddling the cut. Also
collapsed release from a multi-frame "stays armed to sweep back" delay to a single true instant —
root-caused as the likely cause of an earlier reported black-frame glitch at switch-back (camera
already moving past still-cut geometry during that old delay window). Verified on all 4 buildings.

**§129.28/§129.30 Stack panel avoidance (red1: "the stack lines box to avoid the stack itself" then
"the stack label box is obscured by the top-left info box, thus it has one more target to avoid"):**
`_stackScreenBox` (screen-space bbox of the stack's own currently-SOLID hops, via `_solidSetFor` —
not a naive index check, which would invert under `__lpTopDown`) steps the panel left when it would
overlap the stack, and down when that lands it on the info card (`_infoCardLayout`, factored out so
both the panel's avoidance check and the card's own draw share one computed rect, never two).

**§129.29 Info-card alpha bug (found in a code review, not reported by red1):** was `1 -
A._loadPathHudAlpha` — inverted, so the card went blank right at arm/pre-release (when HUD alpha is
near 1) and only showed mid-hold. Per §129.12's own RECONCILIATION ruling the card is part of the
frozen scene, same as the ladder/panel — draws unconditionally now, no HUD-alpha gate.

**§129.32 Info-card font (red1: "font size independent like the other HUDs from resolution
change"):** was `Math.max(9, Math.round(17*k))`, `k` capped at 1.6 — grew slower than every other
HUD. Now `Math.max(12, Math.round(h*0.026))`, matching `cpe_day_counter.js`'s own formula exactly.

**§129.33 THE GROUND BUG — real, confirmed only by a FULL unclipped movie bake (red1: "the Sun...
is not casting light... the ground is all white [then] all dark" → traced to ground, not sun →
"let go of the ground... it's going out of its bound loop").** `_backdropApply`'s call in
`loadPathApplyVisual` ran UNCONDITIONALLY every frame of the whole film from the moment load-path
finished building (near frame 0 — building only needs the pre-computed plan, no playback progress)
to the last frame — never bounded to its own hold. Outside the hold it always passed `t=0`, which
still forces `mat.transparent=true` and re-pins ground/sky opacity every frame, permanently blocking
any OTHER system that legitimately touches those materials later (construction's own opacity ramp,
the day-to-dusk sun arc). Every earlier clip-based bake (this whole project's history, not just this
session) was too narrow to ever run far enough from the hold to hit this — only a full movie could.
Checked whiten/cut (properly scoped, arm-to-release only) and HUD fade (computes every frame but
resolves to a true no-op outside its window) — NOT affected, this was isolated to backdrop. **Fix:**
`if (inWindow || _lp.armed) _backdropApply(...)` — same discipline whiten already used. Verified via
a wide (arm-2s to release+15s) low-res Hospital bake: ground correct before arm, during the hold,
AND 25s past release (previously stuck black by then). Two of three verification attempts hit an
unrelated `createImageBitmap`/"source image could not be decoded" WebCodecs flake at the final
encode step (all 390 frames converged fine each time; likely cumulative GPU/IndexedDB strain from a
full day of back-to-back bakes) — third attempt delivered clean, `unconverged=0`.

**§129.31 Load-path gets its own Alt-C checkbox (red1: "give it its own checkbox"):** was folded
under Measure since 2026-09-15 (`_loadPath = !!_measure && ...`) — an unrelated checkbox ("setting-
out drawing") silently gated a completely different feature. New `cpe-load-path` checkbox
(`cinema_path_editor.js`: HTML, change handler, save/restore/census, `_buildOverride`). Runtime:
`_loadPath = (_ov.loadPath !== undefined) ? !!_ov.loadPath : !!_measure` — explicit value wins
either way, `undefined` (every path saved before this checkbox existed) falls back to the OLD
Measure-gated behaviour, so no bake made before today silently loses the feature. The CLI's own
`--load-path`/`--no-load-path` tri-state flag already existed and merges through unchanged.

**§129.34 Dynamic grid ink (red1, after noticing the ground bug's own black-ground side effect made
the Measure grid read better: "apply dynamic contrast ie dark when ground earth is light first sec
and light whenever it is dark ie end of film"):** `cpe_flythru_datum.js`'s `_datumInk(tNorm)` lerps
ink from a dark slate (t=0, bright early ground) to the original light ink (t=1, dusk), halo the
opposite polarity throughout — same "one ink, ground/storey differ by weight not hue" principle
spec §24.1.2 already established, just no longer frozen to one instant. Wired into both the 3D line
materials (`flythruDatumAt`, updated per-frame) and the 2D bubbles/text (`flythruDatumCompositeOntoCanvas`,
same tNorm computed independently from its own filmSec/filmSecFull). Syntax-checked, spot-verified
dark ink present in a real frame near film-start; the light-ink (dusk) end was NOT independently
re-confirmed with its own frame check — do that before calling this fully closed if it matters.

**Also found, reported, NOT fixed (a real, separate, pre-existing gap):** the Hospital FULL-MOVIE
bake's own `§STOREY_ARCH_WITNESS` failed — 968 elements across 6 storeys sit in the wrong discipline
pass (or none), so they never appear during the Reveal round. Confirmed absent from every earlier
CLIPPED bake today (none were wide enough to reach this check) — first surfaced by the same full-
movie run that found the ground bug. Metadata/classification gap, not a code bug in anything touched
this session.

**Verification matrix:** HHS/Hospital/LTU/Terminal all re-baked low-res after §129.27-33 landed —
clean. Hi-res (1920x1080/24fps) done for HHS (clean) and Hospital clip (clean) and Hospital FULL
MOVIE (4963 frames, 2h37m, `unconverged=0`, 41 PASS/1 FAIL — the storey-arch gap above, unrelated).
LTU hi-res hit a REAL 1/384 unconverged-frame defect (memory pressure, 8.5G RAM+1.5G swap peak) —
delivered anyway per red1's own call, NOT re-verified clean — re-bake if a guaranteed-clean LTU
hi-res deliverable is ever needed. Terminal hi-res was explicitly dropped by red1 (not needed).

**Committed and pushed (2026-09-19):** `316a08ff` on `feat/loadpath-ledger`, `e26336d0..316a08ff`,
17 files (6287 insertions/119 deletions) — every `M`/`??` source file EXCLUDING `out/`'s ~689 bake
artifacts (now gitignored). This branch had never been pushed before today. Cross-session context:
red1-8e (feat/georef-sunpath-compass) test-merged ahead of time — 8 shared files, only 3 real
conflicts (`main.js`/`viewer.html`: both append a line at the same spot; `sw.js`: the documented
CACHE_VERSION/PRECACHE_ASSETS magnet, resolve per this file's own CLAUDE.md rule — keep both
precache additions, take the higher version), everything else auto-merges clean including
`cinema_maxq.js` despite both branches touching it. red1-8e owns that merge, not this lane.

**§129.35 CLOSE-OUT (2026-09-19, git admin pass) — the georef merge HAS landed, and the freeze
bridge is now published.** State verified directly, not relayed:
- **bim-ootb#1751 AND #1752 are both MERGED to main** (`05ce4059`, `4284ee9f`). #1751 was squash-
  merged mid-flight, which is why the 18 later commits looked stranded — #1752 carried them and also
  landed. `git diff origin/main origin/feat/georef-sunpath-compass` is now EMPTY: nothing is off main.
- **The one line that lane asked for is shipped:** `window.__drawUnlessHold = _drawUnlessHold;` beside
  its own definition, `viewer/cinema_maxq.js:1177` on `feat/loadpath-ledger`, commit `5125f0da`,
  pushed. main's own `_hudHold` (cinema_maxq.js:778) reads it off `window` and falls back to `fn(1)`
  when absent, so the compass rose / sun clock draw normally on main today and start honouring the
  load-path freeze the moment this branch merges — no edit needed on their side. Witnessed, not just
  shipped: loading the file under a stubbed `window` leaves `window.__drawUnlessHold` a callable
  function handing `alpha=1` to its drawer (`§EXPORT_WITNESS PASS`). `node --check` and eslint clean.
- **`feat/loadpath-ledger` is 70 ahead / 22 behind `origin/main`, and has NO PR open.** Those two
  facts are the whole remaining git state of this lane. The merge direction is now the reverse of
  what §129.18-34 above assumed: georef is IN main, loadpath is the branch that has to come to it.
- **Three cross-lane lessons from the georef session, worth obeying here:** (1) a stale preview bake
  renders OLD code and bumping `CACHE_VERSION` does NOT fix it — the bake reuses
  `/tmp/silent-bake-profile-<port>`, which holds the service worker; `rm -rf` it before trusting any
  visual check. (2) `--gpu sw` is ~107 s/frame, `--gpu real` ~0.86 s/frame — there is an RTX 4060 on
  this box; never bake `sw`. (3) a witness calling a draw function proves NOTHING about whether the
  bake's own CALL SITE runs — their overlay never drew on a buildup-off bake while every witness
  passed. Distrust any "the witness proves it renders" claim, including the ones above this line.

**NEXT STEP, for whichever session picks this up:** merge `origin/main` into `feat/loadpath-ledger`
(22 commits behind, including both sun PRs), then run a FRESH combined bake across both features
together (sun-path compass + load-path freeze) on at least one building, full log read, before
opening the PR — this lane has only ever been verified with loadpath-ledger in isolation, and the
freeze/compass interlock above has never been exercised in a real bake, only witnessed statically.
Expect the documented `main.js`/`viewer.html`/`sw.js` conflicts (both lanes append at the same spot;
for `sw.js` keep BOTH precache additions and take the higher `CACHE_VERSION`).

## §129.14 BLACK-PATCH FIXED AND VERIFIED (2026-09-18) — root cause found, fixed, witnessed, and
confirmed visually against the actually-delivered mp4 (§129.11's own discipline). Do not re-open.

**Root cause:** `_backdropFadeT` (`cpe_load_path.js`) computed the fade-OUT ramp by comparing live
`fSec` against the absolute `holdEndSec`. That is only correct if `fSec` advances continuously
through the whole hold — it doesn't. The beat's own clock-freeze (§129.6 item 1, cinema_maxq.js)
PINS `fSec` at `holdStartSec` for the entire spliced hold, then resumes counting up FROM THAT SAME
PINNED VALUE once release happens — so `fSec` has to count through the WHOLE `(holdEndSec -
holdStartSec)` span AGAIN, in real POST-RELEASE film-time, before it ever crosses `holdEndSec` and
the 0.5s ramp even starts. Measured on a 6-second hold: the backdrop population (52/52 `_bd.items` —
ground, sky-adjacent materials, and the 40 `_photoSkyline` silhouette boxes together) stayed pinned
at `opacity=0` for ~6 MORE real seconds after the camera had already visually resumed moving — not
the intended 0.5s symmetric fade. `A._sky`'s own separate hide/show restore (`.visible`, not
`fSec`-gated at all — flips instantly at the true frame-splice release) was unaffected by this bug,
which is exactly why sky/ground looked fine in §129.11/§129.12's own diagnostic while this
opacity-driven population (dominated visually by the skyline silhouette boxes) stayed stuck black.

**Fix:** `_backdropFadeT` now takes a 6th param, `releaseFSec` — the real `fSec` captured ONCE, at
the true frame-splice release (`A._loadPathReleaseTFilm * _lp.filmSecFull`, computed at the call
site in `loadPathApplyVisual`). Ramp-out is now `1 - (fSec - releaseFSec) / fadeSec`, anchored to
the REAL release moment, never to the stale `holdEndSec` threshold `fSec` may take several seconds
to naturally re-cross. `null` while still held (no genuine release yet) → returns 1, unchanged.

**Verified three ways, not just "code changed":**
1. **Witness, before/after** — `§LOADPATH_BACKDROP_APPLY_DIAG` (kept as a standing regression check):
   pre-fix, `staleDespiteHighBaseline=46/52` held for 20+ consecutive post-release frames
   (`HHS_loadpath_r76`); post-fix, `t` ramps `0.80→0.60→0.39→0.19→0.00` over exactly 5 frames (0.5s
   @ 10fps) and `staleDespiteHighBaseline=0` on every sample (`HHS_loadpath_r80`).
2. **Raycast at the exact black-patch screen points** — pre-fix: `liveOpacity=0` still at
   `postRelFrame=5` (0.5s past release). Post-fix, same points, same bake setup: `liveOpacity=0.20`
   at `postRelFrame=1`, `liveOpacity=1` (fully restored) by `postRelFrame=5` — matches the witness
   exactly.
3. **Real frames extracted from the delivered mp4** (never skipped, per §129.11's own lesson) —
   pre-fix (`r79`, frame 85, 3 frames post-release): a hard, flat, solid black rectangular block
   where the skyline should be, occluding the sky and every window-light sparkle behind it. Post-fix
   (`r80`, same frame index): individual dark silhouette buildings, visible window-light sparkle
   texture, blue sky between gaps — the correct dusk-skyline look, restored.

**Also found along the way, IMPORTANT for future clip-window choices:** the resume doc's own standard
bake clip (`0.2432:0.2770`) ends BEFORE the hold's natural release point for a 6-second hold — it was
too narrow to ever observe a genuine post-release frame at all; every "postRelFrame" sample taken
under that clip was actually end-of-bake teardown, not real post-hold playback. Diagnosing/verifying
release behaviour needs a clip wide enough to contain `holdEndSec` plus the fade margin — this session
used `0.2432:0.3300` (verified against the real `§LOADPATH_HOLD_INSERT`/`§CPE_APPLIED` numbers, not
guessed). Use a similarly-widened clip for any future release-behaviour check on this beat.

No regressions: `HHS_loadpath_r80`, 35 PASS / 0 FAIL, full log read, same 5 pre-existing
unrelated errors as the `r68` baseline (`§S18_STOREY_MERGE_FAIL`/`§TPL_LAYER_SELFCHECK`/
`§HELPERS_QUERY_ERR` — schema gaps outside this beat's scope, confirmed present identically before
this session touched anything). Nothing committed yet (per standing rule).

## §129.13 BLACK-PATCH OBJECT IDENTIFIED (2026-09-17, superseded by §129.14 above — kept for its own
diagnostic trail, not a live task) — real evidence, root cause NOT yet nailed down at the time this
was written. Picks up §129.12's own "not yet done: extend the raycast to fire post-release" — that's
now done, on `HHS_loadpath_r73`/`r74`.

**What was built:** `A._loadPathDiagRaycast` (`cpe_load_path.js`) now takes an optional `tag` param
(logged as `§LOADPATH_DIAG_RAYCAST <tag> ...`) and reports `liveOpacity`/`liveTransparent`/`bdCaptured`
(the backdrop population's OWN captured baseline for that exact material, if any) alongside the
existing fields. `cinema_maxq.js` now fires it at `postRelFrame` 1/5/11 (not just once at mid-hold),
reusing the same `_pxPts2` sample points (which already include `[0.41,0.21]`/`[0.35,0.12]`, the two
points aimed at `r71`'s black patch).

**What it found, `HHS_loadpath_r74.log`, both candidate points, real values, not inferred:**
- **midHold and postRelFrame=1/5** — both points hit the SAME class of object: an unnamed, plain
  `THREE.Mesh` (`MeshBasicMaterial`, `matColor≈0x221d22`, near-black, not matching any known beat's
  ink/tint constant — checked `HALL_TINT`/`INK` across `cpe_indoor_beats.js`, `cpe_flythru_cues.js`,
  `cpe_flythru_datum.js`, none match, so this is NOT `indoorHallTint` or a Measure-beat mesh; most
  likely a photo-staging skyline/context prop). `inBackdropPop=true`, `bdCaptured=origOpacity=1
  origTransparent=false` — a CORRECT, uncorrupted baseline (opaque, not transparent, before the
  freeze). Live state: `liveOpacity=0 liveTransparent=true` — correctly faded during the hold, but
  **still fully faded at postRelFrame=5** (0.5s past release, the SAME window sky/ground already
  proved fully restored in by `postRelFrame` 7 in `§129.11`'s own diagnostic). This is a genuine
  stuck-invisible object, not a misread — the baseline it should be restoring TO is right there in
  the log, and it isn't reaching it.
- **postRelFrame=11** — the raycast at the SAME two screen points now hits a DIFFERENT, unrelated
  object (a real building element, `IfcPlate`, camera has resumed moving by then) — expected, not a
  clue either way; the dark object is simply no longer under that screen coordinate by frame 11 in
  THIS bake's camera framing (matches this file's own standing caution that framing shifts bake to
  bake — don't assume frame 11 in `r71` and `r74` show the same thing).
- `_backdropApply(t)`/`_backdropTopUp()` (`cpe_load_path.js` ~2526/2500) run every frame,
  unconditionally, driven by `fSec` alone (confirmed by reading the code, not assumed) — the SAME
  per-frame loop that correctly restores sky/ground restores nothing for this one entry. Its captured
  baseline is provably correct (`origOpacity=1`), so this is not a poisoned-capture repeat of the
  Points/`pointsInScene=0` bug already fixed — something ELSE is either re-clobbering this specific
  material's opacity every frame after the loop sets it, or the mesh's actual rendered `.material` is
  being swapped out from under the tracked reference (its `matUUID` differs between the midHold sample
  and the postRelFrame=5 sample — `ddbca76c…` vs `8f948f8b…` — for what LOOKS like the same object at
  the same screen point, which is itself suspicious and unexplained).

**NOT done, don't assume otherwise:** the actual root cause (competing writer vs. material-identity
churn) is NOT identified — only the symptom and the object class are. `git grep`-ing for other systems
that touch `MeshBasicMaterial`/backdrop-population objects' `.opacity` or reassign `.material` on a
per-frame basis (LOD/distance fade, photo-staging shimmer, occlusion-proxy swap in `dlod_nav.js`) is
the next real step — not attempted this session, ran out of budget after the identification pass.
**Do not apply the indoorHallTint hide-outright pattern here without first understanding why sky/
ground (the OTHER items in the exact same `_bd.items` loop) restore fine and this one doesn't** — a
blind hide/restore-via-`.visible` patch might mask the symptom without fixing whatever's actually
fighting the restore, and could paper over a bug that affects more than this one object.

## §129.12 SESSION CONTINUATION HAND-OFF (2026-09-17, mid-session — outgoing session's OWN context
prompted this write-up, not a natural stopping point). Read §129.11 below FIRST if you haven't
already — it's the single most important thing in this file. This section is what happened AFTER it,
in the SAME session, picking up from "everything's clean" (`r68`).

### DONE and CONFIRMED since r68 (do not re-litigate)
- **Sky patch (top-right, seen after r64)** — FIXED. `A._sky` is a physically-based Sky ShaderMaterial
  that ignores `material.opacity` entirely; hidden outright (`A._sky.visible=false`, same
  hide-not-fade pattern as `indoorHallTint`) instead of relying on the opacity fade. Confirmed via
  `r66`/`r68` frame extraction.
- **Concrete grey, not white** (red1: "better than white") — one shared constant
  `CONCRETE_GREY_HEX = 0xb8b8b2` (`cpe_load_path.js`, top of file near `BACKDROP_FADE_SEC`), read by
  every site that sets the freeze colour (material clone, cap plane, per-slot instance-colour
  neutralize, the fade-lerp target `_WHITE_COLOR` — name kept, value changed). Confirmed visually.
- **Label plates: pure white, 100% opaque** (red1: "falling on black anyway... to be more legible") —
  was 50%-opaque (`rgba(255,255,255,0.5)`), now `rgba(255,255,255,1)`. BOTH the ladder labels
  (~line 3530) AND the info card (~line 3673) — the card was missed on an EARLIER pass in this same
  session, caught by red1 directly ("not even following the label schema just given"), fixed once
  already, then this opacity bump applied to both together.
- **Info card enlarged** (red1: "enlarge the explanation info panel") — `_drawInfoCard`'s base font
  size `13 -> 17` (~30% larger); `pad`/`rowH`/the card's own rect all derive from this ONE number, so
  the whole plate scaled proportionally, not just the text.
- **Fade-out symmetry, ground/sky restore — INVESTIGATED, NOT a bug.** Red1 asked whether the 0.5s
  fade-IN is matched by an equally-smooth fade-OUT at release, and separately reported the backdrop
  (silhouette/sky/ground) "seems to not return." Both checked with real, correlated diagnostics
  (`§LOADPATH_PIXEL_DIAG_FINAL postRelFrame=N skyVisible=...`, added this session, fires for 15 frames
  after release): `A._sky.visible=true` from the very FIRST post-release frame, and silhouette
  brightness genuinely ramps up smoothly frame over frame (e.g. one sampled point: 143 -> 141 -> 140
  -> 147 -> 183 across `postRelFrame` 0/2/4/7/11). Red1 confirmed after seeing this ("my bad if it
  does restore… no need add a sec"). **The fade-OUT itself is still an instant snap, not a mirrored
  0.5s ramp** — that specific gap was never closed (see §129.11-era notes above: extending it means
  keeping the cut/whiten alive briefly after the camera resumes moving, and the cut plane's own
  geometry — computed once, frozen, relative to the ARM camera pose — would need to either keep
  tracking the new moving camera or accept a few stale-but-fading frames; not attempted this session).

### OPEN — mid-diagnosis when this hand-off was written, do NOT assume closed
**A solid black rectangular gap in the skyline/silhouette persists well after release** (seen in
`r71`, the +1s-extended-clip bake, frame ~92 — 11 frames past release — while everything AROUND it,
including sky and ground, had already visibly returned). This is DIFFERENT from the sky/ground
question above, which IS confirmed fine. Red1's own words for this general class, from earlier in the
session: "silhouette building openings and sky/ground seems to not return" — the sky/ground half is
resolved; the "building openings" half may be THIS.

**What's already ruled out:** the renderer's clear colour is NOT stuck (real sky is visibly blue in
the same frame, at a different screen position) — if the clear colour fade were broken, the WHOLE
background would read black, not one rectangular patch. This points at ONE SPECIFIC object/mesh
(most likely a skyline silhouette panel, matching the `indoorHallTint`/`A._sky` pattern of "some one
object the backdrop population never quite catches or never quite restores") still stuck, not a
systemic fade issue.

**What was in progress, not yet run:** two new sample points were added to BOTH pixel-diagnostic point
lists (`cinema_maxq.js`, `_pxPts`/`_pxPts2`, the `[0.41, 0.21], [0.35, 0.12]` entries near the end of
each array) aimed at that black patch's approximate screen position (from the `r71` frame it was
found in — re-verify the exact position against a fresh frame before trusting these blindly, camera
framing can shift bake to bake). **Not yet done: extend `A._loadPathDiagRaycast`'s trigger to ALSO
fire during the post-release window** (it currently only fires once, at mid-hold, via
`A._loadPathMidHoldThisFrame` — see `cinema_maxq.js` ~line 1232) so it can identify WHAT object is
sitting at that black patch, the same way `indoorHallTint` and the sky were identified earlier this
session. That is the very next step — don't re-derive the approach, the raycast infrastructure and
the "hide outright during the hold, restore at release" fix pattern are both already proven; this is
just finding the NEXT object that needs the same treatment.

### §129.17 Backdrop fade SYNCED with HUD/cut-whiten — no more "backdrop jumps ahead" (2026-09-18)
Red1, after watching the §129.16 clips: "the back[drop] still wipes as it is not grouped together
with HUD/overlay that does fade off/on... the fade back in also shows the background cuts in without
syncing with the rest" / "ensure it is same fade effect, not a wipe."

**Root cause, confirmed via a real extracted frame before touching any code** (`HHS_loadpath_r81`,
one frame before arm): the skyline silhouette was ALREADY fully black — sparkle-lit dusk buildings,
no sky visible — while the building/HUD were still completely normal, full colour, no fade started
at all. Backdrop's arm-side fade ran on a DIFFERENT CLOCK than everything else: `_backdropFadeT` was
`fSec`-driven, ramping over `[holdStartSec-fadeSec, holdStartSec]` — i.e. it FINISHED fading to black
BEFORE arm even happened. HUD's own fade-out and the section-cut/whiten's `_cutT` are both
`elapsed`-driven (the hold's own internal clock, since `fSec` freezes during the hold — see §129.14),
starting AT arm and ramping over the FIRST second of the hold. Two genuinely different transitions,
on two different clocks, landing at two different times — the backdrop "arrives" a full second before
the others even leave, which reads as an abrupt cut/wipe rather than one unified fade, exactly as
red1 described.

**Fix:** `_backdropFadeT`'s signature changed from `(fSec, holdStartSec, holdEndSec, fadeSec, fps,
releaseFSec)` to `(elapsed, inWindow, fSec, fadeSec, releaseFSec)`. Arm-side is now `elapsed`-driven,
identical curve to `_cutT` (`Math.min(1, elapsed/fadeSec)`), gated on `inWindow` — cannot start before
arm any more, same structural constraint cut/whiten already had (its clones don't exist pre-arm
either). Release-side is UNCHANGED — already correctly anchored to the true release `fSec` since
§129.14/§129.16, which already matched cut/whiten's own release timing. Net effect: backdrop, HUD,
and cut/whiten now all start their arm-side fade together, at arm, over the same 1.0s.

**A real, verified regression caught along the way, not shipped blind:** the very first version of
this fix produced `§LOADPATH_BACKDROP restored=false => FAIL` on `HHS_loadpath_r82`. Root cause:
`A._loadPathReleaseTFilm` (the value the new release-branch keys off) gets SET inside the `else if
(_lp.armed)` block, which runs AFTER `_backdropApply` in the same function — so on the exact release
frame, `_backdropApply` still saw `releaseFSec=null`, fell through to the "not armed" branch, and
returned `t=0` (fully restored) one frame early. Fixed with a same-frame fallback: `_releaseFSec`
uses the current frame's own `fSec` when this IS detectably the release frame
(`!inWindow && _lp.armed && _lp.showLadder`) but `A._loadPathReleaseTFilm` hasn't been written yet.
Re-baked and confirmed `restored=true` afterward — the fix is verified against its own regression,
not just re-asserted.

**Verified clean on all three buildings**, witness AND real frames, not one or the other:
HHS `r83` (36 PASS/0 FAIL, same 2 baseline errors), Hospital `r21` (41 PASS/0 FAIL, same 1 baseline
error), Terminal `r22` (37 PASS/0 FAIL, same 3 baseline errors). `§LOADPATH_BACKDROP restored=true`,
`§LOADPATH_CUT_FADE_END depthBackToNoOp=true colorBackToOrig=true`, `§LOADPATH_HUD_FADE` all PASS on
every build. A real frame extracted one step before arm on EACH building shows a fully normal, lit
scene — no premature black backdrop — and a frame at the fade's own midpoint shows sky, ground,
building, and HUD all transitioning together. Nothing committed (per standing rule).

### §129.16 Both fades to 1.0s + REAL symmetric cut/whiten release fade + label auto-sizing (2026-09-18)
Three changes, all red1-directed, all verified on HHS/Hospital/Terminal (`r81`/`r20`/`r21`):
- **`BACKDROP_FADE_SEC` 0.5→1.0s** (`cpe_load_path.js`) and **`HUD_FADE_SEC` 0.5→1.0s**
  (`cinema_maxq.js`) — red1: "give the fade a full sec... user perception be a more smoother flow."
  Drives backdrop AND the section-cut/whiten sweep (shares the same constant).
- **The section-cut/whiten mechanism now has a REAL symmetric fade at release, not an instant snap**
  — the exact "bigger, riskier change nobody asked for" flagged and deferred back in §129 OPEN ITEM,
  now explicitly asked for ("there is a wipe instead of a fade off of the rest... ensure both ends
  are proper fades"). Mechanism: `_lp.armed` now stays true for up to `_cutFadeSec` PAST true release
  so `_sectionCutApply` can sweep the plane depth + whiten colours back toward original every frame
  (mirrors the fade-in, driven off `_lp.releaseFadeStartFSec`) instead of everything vanishing in one
  frame. Deliberately DECOUPLED from the ladder/card and the sky/indoor-annotation hide-outright
  restore, which still fire at the EXACT true-release instant (already-proven-correct timing,
  untouched) via a NEW `_lp.showLadder` flag — only the cut/whiten visual itself was slow to un-snap.
  New witness `§LOADPATH_CUT_FADE_END` (mirrors the existing `_START`/`_MID`) proves the plane
  genuinely reaches the no-op depth AND the colour genuinely reaches its ORIGINAL value, not just
  that code ran: verified PASS on all three buildings (`depthBackToNoOp=true colorBackToOrig=true`,
  `relElapsed≈1.01s` against `fadeSec=1.0`).
- **Label plates now auto-size to their own text** — `_drawStackLadder` used a fixed `w*0.16` guess
  for the plate width, unrelated to the actual label string; a long storey name ("GROUND FLOOR
  LEVEL") overflowed both sides, and where that overflow fell outside the canvas it was clipped
  outright — missing leading characters, "the background of each label not in full" per red1's own
  report. Now measures every label THIS stack will actually draw (`ctx.measureText`, bold-weight
  upper bound) and sizes the plate to the widest, +padding. Confirmed on Terminal — the SAME
  "IfcSlab · GROUND FLOOR LEVEL · hop 1/7" label that was previously truncated now renders fully
  legible with a fully-covering white plate.
- **Test-clip convention refined again**: 2s before real arm, 2s after the fade genuinely COMPLETES
  (`holdEndSec + fadeSec + 2`, not just `holdEndSec + 2` — the margin has to grow with the fade
  duration or the trailing buffer gets eaten by the fade itself). Recomputed fresh per building from
  each one's own real `armFrameTn`/`filmSecFull` (never reused from a prior fadeSec's numbers):
  HHS `0.2443:0.3287`, Hospital `0.3994:0.4760`, Terminal `0.1650:0.3198`.
- **No regressions, all three**: HHS `r81` 36 PASS/0 FAIL (same 2 pre-existing baseline errors),
  Hospital `r20` 41 PASS/0 FAIL (same 1 pre-existing baseline error — `m_bom_line`, present in `r19`
  too, just missed by an earlier grep, not new), Terminal `r21` 37 PASS/0 FAIL (same 3 pre-existing
  baseline errors). Real frames extracted from all three delivered mp4s (never skipped) confirm a
  genuine smooth colour dissolve at both ends, no visible hard "wipe" boundary, no black patch, and
  fully-legible labels. Nothing committed (per standing rule).

### §129.15 Ladder line-crossing FIXED + Terminal verified + tighter test-clip convention (2026-09-18)
- **Ladder leader lines used to cross** — `_ladderLayoutBesideStack` (`cpe_load_path.js` ~3473)
  ordered labels by FIXED hop-index (`.reverse()`, highest hop always drawn topmost) instead of by
  where each hop's own anchor actually projects on screen. Under perspective, a taller/farther hop
  can land below a shorter/nearer one on screen even though its hop-index is higher — since label
  order never moved with it, its leader line had to cross whichever line WAS drawn into the
  screen-correct slot. Confirmed NOT a stacking-order bug — `§LOADPATH_CHAIN monotone=true
  descents=9 ascents=0` already proved the real 4D support order is correct; this was purely a
  label/anchor mismatch. **Fix:** sort by the anchor's own projected screen-Y instead of hop-index
  (`hopScreens.slice().sort((a,b)=>a.py-b.py)`). Verified on `Terminal_loadpath_r20` — real extracted
  frame shows all 7 leader lines clean, parallel, non-crossing.
- **A separate, real finding along the way (not fixed, reported only):** a hop's leader line anchors
  to its clone mesh's world-position CENTER. For a normal-height element that's fine, but Hospital's
  own hop1 (`IfcColumn`, guid `32_WgUcDv2qB6QdC2oDrMz`) is a continuous 34m-tall column (DB-verified:
  `element_transforms` bbox_z=34.02, Z-range [156.6,190.6]) whose center (Z=173.6) sits ~8m ABOVE the
  slab it's chained to (hop2, `IfcSlab`, Z-range [165.36,165.81]) — so its leader line visually points
  well clear of the slab even though the element genuinely does span through/support it. Not touched
  this session — red1 wants to decide the anchor convention (contact point vs. object center) before
  any change.
- **Test-clip convention corrected** — red1: the wide clips used to verify HHS/Hospital (§129.14)
  included far more of the hold than needed and made bakes slow (Hospital's took ~15 min). Confirmed
  via code (`_lpFrameForArmTn`, cinema_maxq.js ~1843: the arm frame index is CLAMPED to
  `[0, nOrig-1]`, so the clip MUST start at or before the true arm point or `armTnMatch` fails) that
  the clip can't be tightened to bracket only the release — it has to cover arm-to-release-plus-
  margin, the hold itself is unavoidable in between. New convention: exactly 2s before the real arm
  (`holdStartSec`, read from the DB's own `§LOADPATH_HOLD_INSERT`/`§CPE_APPLIED` numbers, never
  guessed) and 2s after the real release (`holdEndSec`), computed fresh per building — NOT reusing
  an old standard clip's own margins. `Terminal_loadpath_r20`: `--clip 0.1648:0.3076` (holdStartSec≈
  15.84s, holdEndSec≈23.84s, filmSecFull=84.0s) — 36 PASS/0 FAIL, `armTnMatch=true`, same 3
  pre-existing schema-gap errors as Terminal's own prior baseline (`m_bom_line`/`elevation` — unrelated).
  Both this session's fixes verified: `§LOADPATH_BACKDROP_APPLY_DIAG` clean 5-frame ramp
  (`staleDespiteHighBaseline=0`), and a real extracted post-release frame shows full scene restored,
  no black patch. **All three buildings (HHS, Hospital, Terminal) now verified clean against both
  fixes.** Nothing committed yet (per standing rule).

### Hospital — VERIFIED against the §129.14 fix (2026-09-18), fresh bake + fix together
`Hospital_loadpath_r19`, `--db Hospital_silent --clip 0.3498:0.4230` (widened from the standard
`0.3498:0.3722` — that clip real-spans only 4.4s but Hospital's own hold is 10s, so like HHS it never
reached genuine release; confirmed via `§LOADPATH_HOLD_INSERT framesInserted=100`/`§CPE_APPLIED
total=195.8s` from the existing `Hospital_loadpath_r18` log before choosing the new window, not
guessed). **40 PASS, 0 FAIL, 0 error/warn lines at all** (cleaner than HHS's own baseline — Hospital's
schema doesn't carry the `elevation`/`m_bom_line` gaps HHS has). Full log read, not grepped.
`§LOADPATH_BACKDROP_APPLY_DIAG` (the fix's own regression witness) shows the SAME clean 5-frame
(`t: 0.80→0.60→0.39→0.19→0.00`) restore, `staleDespiteHighBaseline=0` throughout — matches HHS
exactly, fix generalizes. Real frames extracted from the delivered mp4 (never skipped): a mid-hold
frame (black backdrop, 10-layer ladder, concrete-grey whiten, correct) and a frame 5 steps
post-release (full lit scene restored, HUD back, no black patch anywhere). Existing `§LOADPATH_
BACKDROP allElseCount=46 allElseAtBlack=52/52 fadeOutFrames=5 restored=true => PASS` confirms the
same from the beat's own built-in witness. **Hospital is done — the freeze-frame feature set (HUD
merge, whiten/section-cut, background-fade generalization, backdrop fade-out fix) holds on Hospital,
no regression.**

### Multi-building verification (red1: "test bakes also for Terminal and Hospital")
- **Terminal — bake DONE, NOT YET visually verified.** `out/Terminal_loadpath_r19.log`/`.mp4`,
  `--db Terminal_silent --clip 0.1508:0.2032` (same clip window this project's own history already
  used for Terminal many times — confirmed against existing `*.launch.txt` files before trusting it,
  per this file's own standing caution). **36 PASS, 0 FAIL, no errors** — but per this session's OWN
  hard-won §129.11 lesson, a clean witness log is NOT sufficient proof by itself: extract real frames
  (`ffmpeg -i out/Terminal_loadpath_r19.mp4 frame_%03d.png`) and look at a hold frame AND a few
  post-release frames directly before calling this done. Not yet done as of this hand-off.
- **Hospital — NOT YET RUN.** `--db Hospital_silent --clip 0.3498:0.3722` (same caution — confirmed
  against existing launch history, re-verify before trusting blindly if it's been a while).

### Housekeeping
Nothing committed all session (per standing rule — commit only when red1 says so, only after red1
has sighted the result). Worktree `/tmp/wt-loadpath` has a LARGE number of uncommitted changes by
now across `cpe_load_path.js`, `cinema_maxq.js`, `viewer/effects.js`, `viewer/scene.js`,
`rule_findings_film.js`, `clash_labels.js` — if picking this up fresh, `git status`/`git diff` in that
worktree before doing anything else, don't assume a clean tree.

## §129.11 THE REAL ROOT CAUSE — A VIDEO-ENCODER BUG, NOT A SCENE/HUD BUG (2026-09-17, found this
session after red1 reported, repeatedly and correctly, that fix after fix produced "not a single
change" in the delivered mp4 despite every witness reading PASS). **Read this before touching
anything below — it explains why r29 through r63 all "witnessed clean" while red1 kept seeing the
old, broken frame.**

**What was actually true the whole time:** the section-cut/whiten pass, the backdrop fade, the HUD
suppression, and the label colour fix were ALL CORRECT, from the very first attempt, at the JS/canvas
level. Proven exhaustively, not assumed — raycasting the frozen camera to the exact object rendered
at a stuck pixel, reading `getColorAt` at the renderer's OWN reported slot id, a live magenta colour
override that never reached the screen either, and finally a pixel readback taken at the TRUE end of
`_captureFrame`'s own compositing (right before `c.toBlob()`) that read back CORRECT, fully-suppressed
values for every one of these frames.

**What was actually broken:** `_stitchMp4()` (`cinema_maxq.js`, the WebCodecs H.264 path) built ONE
canvas (`cv`) OUTSIDE its per-frame loop and REUSED it for every `new VideoFrame(cv, …)` call across
all ~104 frames. Chrome's hardware `VideoEncoder`, given the SAME canvas/GPU-texture object reference
on consecutive `encode()` calls, can skip re-uploading it and silently re-encode STALE content — a
real, reproducible WebCodecs footgun, not a guess: a pixel read taken from IndexedDB immediately
before `encode()` (i.e. the data ACTUALLY handed to the encoder) was provably correct and per-frame-
distinct at every index checked, yet the DECODED mp4 (via `ffmpeg -i out.mp4 frame_%03d.png`, the
same way red1 was sighting it) kept showing the pre-fade, pre-fix frame — from roughly frame 21
(the arm frame, legitimately still full-HUD) all the way through the rest of the hold, unmoving.

**The fix:** create `cv`/`cx` FRESH, inside the loop, once per frame, instead of once before it.
Nothing else changed. `HHS_loadpath_r64` (first bake with this fix) is the first one where `ffmpeg`-
extracted frames actually show what the witnesses always said was there: HUD gone, backdrop black,
labels black-on-white, ladder/card white-on-white-50%. Confirmed on frame 50 AND frame 70 (5 hops
revealed), not just one lucky frame.

**Lesson for every future round in this file:** a live in-browser pixel readback (this session's
`§LOADPATH_PIXEL_DIAG_FINAL`, `§LOADPATH_DIAG_RAYCAST`, `§STITCH_PIXEL_DIAG`) proves the RENDER is
correct. It does NOT prove the DELIVERED FILE is correct — those are now two separably-broken things,
proven separately broken once already. **Always `ffmpeg`-extract and actually open a frame from the
delivered mp4 itself before calling a fix done**, in addition to (never instead of) reading witnesses.

**Sky patch (found after r64) — ALSO FIXED.** Root cause: `A._sky` (three.js's physically-based Sky
shader, `ShaderMaterial`) computes its own colour from atmosphere uniforms and — like most sky-dome
shaders — outputs a hardcoded opaque alpha in its own fragment shader; it never reads three.js's
generic `material.opacity` uniform at all, so the backdrop's opacity-based fade (correct for every
ordinary material) provably never touched it. Same fix pattern as `indoorHallTint`: hide it outright
(`A._sky.visible = false`) during the hold instead of relying on a fade mechanism it was never wired
to obey. Confirmed via `r66`/`r68` frame extraction — full black background, no patch.

**Concrete grey, not white (red1, 2026-09-17: "better than white").** The freeze's "concrete" colour
target is now `CONCRETE_GREY_HEX = 0xb8b8b2` (one shared constant, `cpe_load_path.js`), not pure
white — every site that swaps colour during the hold (material clone, cap plane, per-slot instance-
colour neutralize, the fade-lerp target) reads it. Confirmed visually (`r68`, e.g. `full_030.png`) —
real lit concrete-grey slabs, not white.

**A red herring worth recording so nobody re-chases it:** a raycast at one sample point found an
`InstancedMesh` with `matColor=ffb300` (amber) and `instanceMeta=no-instanceMeta-for-mesh` (not a
tracked building element) sitting geometrically along that ray. It is correctly IN the backdrop's own
fade population (`inBackdropPop=true`) and correctly faded — the pixel value that looked "off" at
that exact coordinate is just a normal PBR lighting highlight on the STACK's own lit slab edge
(confirmed by cropping and looking directly — no amber dot present in the actual frame). Not a bug;
the raycast hit something geometrically present but visually occluded/irrelevant at that pixel.

**Status as of `r68`: nothing outstanding.** Full log 35 PASS / 0 FAIL / no errors, and every visual
claim in this section verified by extracting real frames from the delivered mp4 and looking at them
directly — never from a witness log alone (see §129.11's own lesson on why that specific discipline
matters more than usual in this file).

**Diagnostic scaffolding left in place, all off by default, safe to leave or strip:**
`§LOADPATH_PIXEL_DIAG_PRE_HUD`/`_FINAL` (cinema_maxq.js, always-on during a hold — cheap, keep),
`§LOADPATH_DIAG_RAYCAST`/`A._loadPathDiagRaycast` (fires once per hold, cheap, keep),
`§STITCH_PIXEL_DIAG` (gated behind `window.__lpDebugStitchPixels`, off unless a `--tap` sets it),
`§RULE_FILM_ALPHA_DEBUG` (gated behind `window.__lpDebugAlphaLog`, same). None of these run unless
explicitly enabled except the two PIXEL_DIAG/RAYCAST lines, which are cheap and worth keeping as a
standing regression check.

## ROLE
You are picking up the load-path/ledger-ticker beat (§129 in MEP_CLASH_REVEAL_MOVIE.md) mid-session
— the outgoing session handed off here specifically because ITS OWN context ran low, not because the
work reached a natural stopping point. `HHS_loadpath_r29` just finished baking and has only had a
quick check (PASS/FAIL count + 3 headline witness lines), not the full-log read this project's own
standing rules require — **do that first**, before anything else, including trusting anything else
in this file about r29 being "clean." Big structural bugs (Terminal hang, Round 17, the whole HUD/
backdrop/whiten rewrite) are fixed and witness-proven — do not re-derive or re-litigate the DONE list
below, read it once, trust it. What's left: the section-cut feature (spec locked, not started) and
Terminal/Hospital/LTU re-verification (not started, real gap — see its own section below).

## WHERE THINGS ARE
- Worktree `/tmp/wt-loadpath`, branch `feat/loadpath-ledger`, base `e26336d0`. Nothing committed yet
  — commit only when red1 says so, and only after red1 has sighted the result.
- Main files: `viewer/cpe_load_path.js` (load-path beat logic, backdrop fade, whiten pass, labels/
  card drawing), `viewer/cpe_resource_panel.js` (pie/cost/ledger/roster HUD panel), `viewer/
  cinema_maxq.js` (per-frame render loop, HUD-fade wrapper `_drawUnlessHold`, witness call sites).
- Bake command (HHS, swap `--db`/`--clip` for other buildings):
  `cd /tmp/wt-loadpath && bash /tmp/wt-bake-perf/bake_scope.sh node cli_silent_bake.js --db
  HHS_Office_Federated_silent --out /tmp/wt-loadpath/out/<tag>.mp4 --gpu real --width 854 --height
  480 --fps 10 --clash --storey-reveal --buildup --label --reveal --measure --clip 0.2432:0.2770
  --port <fresh 98xx>`. Run this DIRECTLY yourself via the Bash tool — red1's own instruction
  (2026-09-17): no separate bake session/peer to delegate to any more. The two-session split (a
  reviewer messaging a separate bake-runner) cost real time tonight to a peer correctly refusing to
  act on a relayed "red1 said go" instead of hearing it directly — one session doing both roles
  removes that whole failure class. Pick a fresh `--port` each run (increment from whatever the
  highest port already used in `/tmp/wt-loadpath/out/*.launch.txt` is), and if a bake hangs, check
  `ps aux | grep cli_silent_bake` / kill it yourself the same way a bake session would have. One bake
  at a time regardless of who runs it. `LARGE_DB_BAKE.md`'s own REVIEW log (search "2026-09-16"/
  "2026-09-17" entries) has the full timeline if you need more than this file gives you — read it
  only if genuinely stuck, not as a first step.
- `HHS_loadpath_r29.log`/`.mp4` is the last fully-clean witness run: 27 PASS, 0 FAIL, full log read,
  confirmed twice in a row (r28 then r29, same numbers both times — red1 explicitly asked for a
  second confirmation bake, this is it). This exact clip (0.2432:0.2770) straddles the film's own
  topout boundary (0.260), so it ALREADY exercises the reveal-round/rolling-cards phase for real
  (`§CPE_STATS_TAIL revolvedFrames=22/104`) — no separate wider bake is needed to test anything
  involving that phase. **INSPECT r29 YOURSELF before doing anything else** — the outgoing session
  ran it right at a context/handoff boundary and did only a quick check (PASS/FAIL count + the 3
  headline witness lines), not the full "read every line, not a grep" pass this project's own
  standing rules require. Start new numbering from r30.

## DONE — do not re-open
- Terminal's deterministic frame-31 hang: fixed (instance-count-gated raycast fallback), verified on
  Terminal/HHS/Hospital.
- Round 17 (5 control-tap findings from the original 18-control sweep): all fixed, all verified.
- Cost/Ledger merged back into ONE HUD panel (no separate `hud.fiveD` box) — red1's own ruling,
  reverted a prior session's invented split. Alpha-fade bug on the row text fixed as part of the
  merge. A real regression from the merge itself (2px overlap between the trade list and the cost
  row, `§HUD_LAYOUT_ARM overlaps=1`) was found and fixed (`cpe_resource_panel.js`, `afterListY`
  math) — confirmed `overlaps=0` on r23.
- Freeze backdrop generalized from a hand-picked ground/sky/skyline list to "every scene object that
  is not the load-path beat's own clone and not a real building element" (staffage, context/skyline
  buildings, ground, sky — classified via this file's own reverse-guid building-element check).
  Witnessed for real: `§LOADPATH_BACKDROP_POPULATION allElseCount=7 materials=7`,
  `§LOADPATH_BACKDROP allElseCount=7 allElseAtBlack=7/7 faded restored=true => PASS` (vacuous-guarded
  — reads INCONCLUSIVE if the population were ever empty, not a silent PASS), `§LOADPATH_CONTEXT_OFF
  hud=PASS backdrop=PASS => PASS` (a real combined verdict, not printed unless BOTH halves are OK).
- Freeze visual spec locked and implemented (agreed with red1 over several turns, don't re-propose
  alternatives without cause): ladder labels get a 70%-opaque black background plate (was a raw
  black stroke-outline, called messy) with white/near-white fill text, no stroke; leader lines are
  yellow (`#f5c518`, brighter `#ffd83d` for the current hop); the info card's own redundant stroke
  removed (it already had a plate). Non-stack building elements get their base material colour
  swapped to white during the hold via a new `_applyWhiten`/`_restoreWhiten` pair (same clone-per-
  material/Map/restore discipline as `_applyGhost`/`_restoreGhost`, LIFO-restored before it so ghost
  mode's own A/B control still unwinds correctly) — same lighting/shadow rig untouched, texture map
  cleared so it doesn't show through white. The highlighted stack's own shine-through rendering
  (`_buildChainClones`/`SHINE_RENDER_ORDER`/`SHINE_EMISSIVE_LIFT`/per-hop colouring) is UNCHANGED and
  out of scope for items 1/2 below — item 3 below may legitimately need to touch it, with red1's own
  sign-off already given on the specific change.
- Rolling "reveal round" ending-cards panel (`bigStatsCompositeOntoCanvas`, `cpe_resource_panel.js`)
  was using the OLD pre-Round-16 worst-case row reservation (`_scanMaxResourceRows()` via
  `shownRows=undefined`) instead of its real, live row count — permanently oversized relative to its
  actual content (red1: "inflated, doesn't restore its original size" — a different unfixed formula,
  not a state leak). Fixed: passes the real row count now, same discipline as the main panel.
  WITNESSED for real, not just fixed in theory: the panel-height correctness formula
  (`expectedPanelH`/`panelHOk`, previously only checked once during the load-path hold) now ALSO
  runs on every distinct content-state CHANGE across the whole film (red1's own instruction — "why
  check every frame if it's a loop? check before and after" — implemented as change-detection, not
  per-frame, matching this file's own "log once per CHANGE" convention), via `§HUD_LAYOUT_STABLE`'s
  new `panelHFormula=PASS/FAIL/INCONCLUSIVE statesChecked=N` field, which now gates that witness's
  overall verdict. Proven on `HHS_loadpath_r25.log` against a bake that genuinely exercises the
  reveal round (`§CPE_STATS_TAIL revolvedFrames=22/104`): `panelHFormula=PASS statesChecked=3 =>
  PASS`.
- The "instanceColor multiplies material.color, whitening might be invisible" concern (raised while
  investigating red1's "still lingering" report) — DEFINITIVELY RESOLVED WITH REAL DATA, not left as
  a hypothesis. Added the missing `§LOADPATH_WHITEN` witness (`whitened=N materialsRestored=N/N
  instanceColorMeshes=M instanceColorRestored=M/M`, vacuous-guarded — this pass previously had NO log
  line at all). Real bake data, `HHS_loadpath_r24.log`/`r25.log`, identical both times: `whitened=412
  materialsRestored=412/412 instanceColorMeshes=0 instanceColorRestored=0/0 => PASS` — 412 real
  materials whitened and restored correctly, and ZERO of them carry a per-instance colour override
  that would have made the whitening invisible. The fix ALSO now handles the instanceColor case
  properly regardless of this result (backs up/neutralises/restores the whole `instanceColor` buffer
  via direct typed-array copy) — so this stays correct even if a future building/scene DOES have
  per-instance colour on its building elements, not just "safe because HHS happens not to."
- **THE major one — "background complete fade off" was genuinely broken, not a red1 misperception.**
  The all-else fade population (`allElseCount`) had been undercounted at 7 objects ALL SESSION. Root
  cause, found via a real diagnostic (not guessed): `_backdropCapture()` takes its ONE population
  snapshot at `A.loadPathBuild` time (early, deliberately — re-snapshotting material OPACITY mid-fade
  would corrupt the "original" baseline, see `_bd`'s own comment), but photo-staging's skyline
  window-lights/glow-points (`THREE.Points` objects, confirmed via `§PHOTO_PROPS built
  windowLights=4824`) hadn't finished settling into the scene yet at that early moment — a targeted
  diagnostic proved `pointsInScene=0` at the exact instant of capture. Also: `isPoints` was never in
  `_allElseObjects()`'s own type filter at all — a second, independent gap. Fixed both: added
  `isPoints` to the filter, and added `_backdropTopUp()` — safe per the ORIGINAL comment's own
  admission that the population SCAN (not the opacity capture) is safe to redo anytime — called every
  frame while `t` is still EXACTLY 0 (nothing has started fading for anything yet, by
  `_backdropFadeT`'s own definition), adding any newly-visible object with ITS OWN current (genuinely
  still-unfaded) opacity, additive only, never touching an already-captured entry. Real result,
  confirmed twice (`r28`, `r29`): population `7→47-48 objects / 7→51 materials`,
  `§LOADPATH_BACKDROP allElseAtBlack=51/51 restored=true => PASS`. This is very likely THE actual
  explanation for red1's repeated "still lingering" report — the fade math was always correct, it
  just wasn't running on most of what needed it.

## RECONCILIATION (2026-09-17, red1, direct — written down because it wasn't last time)
Red1 dictated the full freeze-frame visual contract in one pass and asked for it in writing before
anything else, after finding this file's own outgoing hand-off had let three separate items go
unrecorded/unconfirmed across sessions. Settled, hardened, do not re-litigate:
1. **Section-cut clip plane** — see OPEN ITEM below. The only genuinely unbuilt piece.
2a. **Background fade** — silhouette/skyline, sunlit sky, ground fade to black over 0.5s at freeze
   start (and back at release). Matches §129.7 item 6. ALREADY BUILT AND WITNESSED — see DONE list's
   "background complete fade off" entry (51/51 on r28/r29, after 12 straight prior bakes stuck at
   7/7 objects because the skyline window-light Points were never scanned at all).
2b. **HUD/overlay removal** — ALL HUD (status box, pie/cost/ledger panel, path map, roster, clash
   labels, room titles, daycounter) fades to `painted=0` during the freeze. ALREADY BUILT AND
   WITNESSED (`§LOADPATH_FOCUS painted=0` on r29). **Red1 confirmed explicitly (2026-09-17): the
   load-path ladder (labels + leader lines) and the info card are PART OF THE FROZEN SCENE, not
   HUD — they stay on through the freeze.** Matches the written spec (§129.8 items 4/6 in
   MEP_CLASH_REVEAL_MOVIE.md) exactly. Do not remove them when building item 1.
3. **Frozen building → concrete/white** — non-stack elements swap to white material during the
   hold (`_applyWhiten`/`_restoreWhiten`). ALREADY BUILT AND WITNESSED (412/412 on r24/r25/r28/r29).
   The section-cut's cut face and everything behind it (item 1) reuse this SAME white material —
   no new material system. The stack's own rainbow shine-through colouring and its ladder/card
   (2b above) stay completely unchanged by item 1.

Net: items 2a/2b/3 are DONE, confirmed, do not touch. Item 1 (section-cut) is the sole remaining
piece — implement it now, witness-first, per red1's own process rule below, and take it to zero in
one pass rather than another partial round.

## DONE (2026-09-17, THIS session) — section-cut, whiten, backdrop, HUD suppression, label colours
Everything the "OPEN ITEM" below describes IS implemented, and — critically, see §129.11 above —
IS confirmed correct in the actually-delivered mp4, not just in witness logs. `HHS_loadpath_r64` is
the reference clean bake. What shipped, concretely:
- **Section-cut clip plane** — `_placeSectionCutPlane`/`_sectionCutApply` (cpe_load_path.js). Plane
  sits just behind the stack's farthest hop (`§LOADPATH_CUT marginM>0`), fades in over 0.5s of the
  hold's own elapsed clock (fade-OUT at release is still an instant snap — see its own note below).
- **Solid cut face, not a hole** — real stencil-buffer technique (`_buildCutCap`), companion back/
  front-face meshes per element + one cap plane, `stencilFunc=NOTEQUAL`. Needed `stencil:true` added
  to the WebGLRenderer AND to the EffectComposer's own render target (`viewer/effects.js`) — the
  composer's default target has no stencil buffer, a real, separate bug from the cap logic itself.
  Coverage: regular Mesh + InstancedMesh covered directly; BatchedMesh containers and InstancedMesh
  containers are UNBATCHED into individual per-element clones during the hold instead (see next item)
  and picked up by the SAME cap mechanism as regular meshes as a result.
- **Whiten (concrete/white)** — `_applyWhiten` clones + fades material.colour. The population that
  actually needed fixing was BatchedMesh/InstancedMesh containers: their real per-item colour (baked
  via `setColorAt`/`_colorsTexture`, the SAME mechanism `cpe_storey_reveal.js`/`hba_lens.js` use for
  their own tinting) multiplies with `material.colour` — white × real-colour = real-colour, unchanged.
  Neutralizing that value in place did NOT work (exhaustively proven not to reach the screen — see
  §129.11's own note on how thoroughly this was checked before concluding it needed a bigger fix).
  Final fix: HIDE the container (`visible=false`) and draw its real elements as individual, ordinary
  `THREE.Mesh` clones instead (`_buildBatchedElementClones`, real API —
  `getGeometryIdAt`/`getGeometryRangeAt`/`getMatrixAt` — read from this project's own three.js source
  at runtime, not guessed) — the same technique the STACK itself already used, proven, no per-item-
  colour machinery left to fight. `§LOADPATH_BATCH_UNPACK containers=411 elements=6839 failed=0`.
- **Background fade to black** — already correct; the ONE real gap was `indoorHallTint` (a floor-
  decal annotation mesh, `cpe_indoor_beats.js`, no guid, invisible to this beat's own building-element/
  backdrop classification) turning visible MID-HOLD off its own `_tnFilm`-driven timeline, well after
  the one-time population scan already ran. Fixed two ways: `A.indoorBeatsAt`'s own per-frame update
  is skipped outright while a hold is active (cinema_maxq.js), AND the backdrop's own population
  top-up (previously gated to `t===0` only) now runs every hold frame, so anything ELSE that turns up
  late gets caught the same way, not just this one mesh.
- **HUD suppression** — `_drawUnlessHold` was always correctly computing `alpha=0`; TWO compositors
  ignored the `alpha` it passed and set `ctx.globalAlpha` from their OWN state instead
  (`rule_findings_film.js`'s `ruleFindingsFilmCompositeOntoCanvas`, `clash_labels.js`'s
  `clashLabelsCompositeOntoCanvas`) — an ABSOLUTE assignment that silently clobbered the ambient fade.
  Both now take an `ambientAlpha` param and multiply it in. Found by extending the existing draw-
  instrument to record the REAL `ctx.globalAlpha` at each draw call, not just whether it happened
  inside the wrapper's time window (`§LOADPATH_FOCUS alphaClobber=[...]`, names the offending layer).
- **Label plate colours** — was white text on 70%-opaque black (both the ladder labels AND the info
  card — the card was missed on the first pass, red1 caught it: "not even following the label schema
  just given"). Now black text (`#000`/`#14181d`) on a 50%-opaque WHITE plate, both places
  (`cpe_load_path.js`, the ladder-label draw loop and `_drawInfoCard`).

## OPEN ITEM (SUPERSEDED — kept for its own implementation notes/history, see DONE above)

### The stack does not read as occupying real 3D space — SPEC LOCKED WITH RED1, NOT YET IMPLEMENTED
Red1's own diagnosis (2026-09-17, more precise than this file's own outgoing session guessed): the
stack reads as THIN — not a shading/lighting problem, a genuine lack of visible volume/depth no
matter how it's lit. Fix, red1's own words, locked down over several turns — implement EXACTLY this,
do not re-propose alternatives:
- **A section-cut clip plane**, facing the camera, positioned just BEHIND the stack's own depth
  (never in front of it, never clipping the stack itself regardless of the stack's own extent).
  Everything between the camera and that plane is cut away — the whole near-side facade layer at the
  stack's depth is gone, so the camera looks straight into a real cross-section of the building.
- **The cut surface and everything behind it**: the SAME concrete/white material treatment already
  built and proven (the whiten pass, above) — same lighting/shadow rig, same Alt-S baseline,
  completely untouched. This is very likely largely a MATTER OF WHERE the clip plane sits relative to
  what's already whitened, not a new material system.
  - **Must produce a genuinely SOLID-looking cut face, not a hole.** A bare clip plane on any
    thin-shell wall/slab geometry (common in BIM models) shows nothing at all where it's cut — no
    surface, just empty space revealing whatever is further behind. Needs a filled cap at the clip
    boundary (standard technique: a stencil-buffer pass, or a second, opaque cap-plane mesh rendered
    exactly at the clip boundary wherever real geometry is cut) so the section reads as a genuine
    solid slice, which is the entire point red1 is asking for.
- **The stack itself: completely unchanged.** Current rainbow/shine-through per-hop colouring and
  labels stay exactly as built — it must read clearly against the now-uniform cut surface, by
  contrast, not by being altered itself.
- Existing infrastructure to reuse, not reinvent: `_placeCutPlane` (`cpe_load_path.js`, currently used
  by the OLD ghost-mode look, `window.__lpLookGhost=1`, to clip the rest of the building near the
  camera) is prior art for clip-plane placement in this exact file — read it before writing a new
  one, even though its PURPOSE here is different (this is a permanent, load-bearing part of the
  default look, not an A/B control-only path).

**Process, per red1's own explicit instruction ("solve systematically... ensure it is WITNESSED" /
"proceed do the WITNESS and then code")**: write the witness spec FIRST — what §-tagged value would
prove (a) the clip plane is genuinely positioned just behind the stack (not in front of it, not
touching it) for every hop currently revealed, (b) nothing between the camera and that plane is still
rendering solid/uncut, (c) the cut face reads as solid (not a hole) wherever real geometry crosses the
plane, (d) the stack's own render is provably unaffected by any of this — THEN implement against that
spec, THEN prove each line against a real bake before calling it done. Do not implement first and
retrofit a witness after, and do not present a finished visual to red1 without the witness numbers to
go with it.

**STATUS UPDATE (2026-09-17): DONE — see "DONE" section above.** Kept the paragraphs above only for
their own implementation reasoning/spec detail, not as a live task list.

## ALSO OPEN — not started, real gap, don't let it slide
**Terminal/Hospital/LTU have NOT been re-baked against ANY of tonight's fixes.** Every single fix in
the DONE list above (HUD merge, all-else-fade generalization + the Points/top-up fix, whiten,
rolling-cards sizing, the freeze visual redesign) has ONLY ever been proven on HHS. There is zero
evidence any of it holds — or doesn't regress something — on the other three buildings. Red1 flagged
this explicitly as one where "hand-waving" is a real risk for this project; don't let it happen here.
Once item 3 (section-cut) is done and witnessed on HHS, this is the next thing to do, not an
afterthought — bake command is the same, just swap `--db`/`--clip` (Terminal: `Terminal_silent`,
`0.1508:0.2032`; Hospital: `Hospital_silent`, `0.3498:0.3722`; LTU: `LTU_AHouse_silent`,
`0.42:0.50` — these clip windows are from earlier in this same project's history, re-confirm them
against an existing `*.launch.txt` in `/tmp/wt-loadpath/out/` before trusting them blindly).

## STANDING RULES (unchanged from the rest of this project)
- Never ask red1 what they see on screen. If a witness and red1's own report disagree, the witness
  is wrong or incomplete — go re-derive the truth from code/logs, the same way the resolved
  instanceColor/rolling-cards items above were worked. This has been the pattern all session and it
  has been right every single time it was tested.
- Read the FULL log after every bake, not a targeted `=> PASS|FAIL` grep — `§CLI_BAKE_POSECHECK`'s
  `INCONCLUSIVE ... check by hand` line was sitting in every single clip-windowed bake this entire
  project and was missed for hours by exactly that shortcut. It is STILL open (structural gap in
  `cli_silent_bake.js:778`, unrelated to anything in this file) — not this session's job unless red1
  explicitly assigns it, but don't let a bake's PASS/FAIL summary alone stand in for having read it.
- A peer/builder's "verified"/"fixed" claim is a hypothesis, not a fact — re-check it against the
  actual code or a real log yourself before repeating it to red1. This session's own builders got
  it wrong on the first attempt more than once (a backdrop-fade bug took three real attempts before
  the actual root cause was found); the fixes that held were the ones re-verified independently, not
  the ones merely reported as done.
- One bake at a time. Never commit without red1's explicit word, and only after they've sighted the
  result themselves.

## §129.46 CORRECTED — ITS FIRST VERSION WAS WRONG. READ THE CORRECTION AT THE END OF THIS SECTION
## BEFORE THE BODY. (2026-09-19, red1 on the delivered LTU film): "the shadows are not
## corelating to the clock on the wall"

red1's own words, and explicitly parked: "Just take note, don't fix yet." This section is the note.
Nothing below is a diagnosis — it is what the LTU bake's log says, gathered while it was fresh.

**The sun genuinely moves on that film.** §SUN_ONE, first and last frame of the 1681:

    tNorm=0.000  elevation=24.2   skyAzimuth=50.7
    tNorm=1.000  elevation=-11.7  skyAzimuth=294.1

A 243-degree azimuth swing, and the sun ends up 11.7 degrees BELOW THE HORIZON. So the light the
compass and clock are drawn from is sweeping properly; whatever the shadows are doing, they are not
being starved of a moving sun.

**But the bake's own shadow path never armed on this building.** Counted over the whole LTU log:

    §PHOTO_SHADOW enabled   0        (HHS's 1080p bake: 1)
    §PHOTO_AO               0
    §TM_SHADOW_INHERIT      0
    §SHADOW_FRONTIER        0
    §SUN_ONE_LIGHT          0
    §PHOTO_PREWARM          2

`_enablePhotoShadows()` returns early on three conditions — the user's own Shadow mode already on,
or a missing `A.sun`/`A.renderer`/`A.scene` — and it is called from one place, inside
`_applyPhotoStaging`. `§PHOTO_AO` at 0 says the still-refine AO pass did not run either, which
points at the staging pass as a whole rather than at the shadow arming specifically. A bake with no
photo staging would still produce a film; it would just carry whatever lighting the scene already
had, which is a very good way for shadows to stop tracking a clock that IS advancing.

**Two things this note deliberately does NOT claim.** That the above is the cause of what red1 saw
— no frame has been compared, and a shadow can look wrong for reasons that have nothing to do with
which code path armed it. And that it is the same fault as §129.45 (the bias that detached shadows
from column bases on HHS): that one is about shadows that ARE being cast, this is about a path that
appears not to have run at all. They may be unrelated, and merging them would repeat exactly the
mistake §129.45's own commit records — conflating two faults because both involve shadows.

**The elevation ending at -11.7 degrees is worth its own look** whenever this is picked up. A sun
below the horizon is legitimate at 59.3N in late autumn, and §SUN_ONE_ALL_DARK exists to judge
that over a whole run — but it printed nothing here, so the all-dark tally did not report either.

**Where to start when it is unparked:** whether `_applyPhotoStaging` ran at all on LTU, before
anything about shadows. Everything above is one missing call away from being explained.


### §129.46b THE CORRECTION — I READ THE WRONG LOG, AND RED1'S EYES CAUGHT IT

Everything in §129.46 above that says the shadow path "never armed" IS WRONG. Kept, not deleted,
because the way it went wrong is the lesson.

red1, on being told the path never ran: **"No, i see the shadows running well and long.."** They
were right and the log I quoted was the wrong file. `out/ltu_lowres.log` is the SHELL REDIRECT —
stdout only, which carries just the claim-filtered summary. The real 6.3 MB firehose is written by
`cli_silent_bake.js` itself to `<out>.log`, beside the mp4. Shadow tags are not in CLAIM_RX, so
they never appear in the filtered file, and counting them there returns 0 for something that ran
thousands of times. From the REAL log:

    §PHOTO_SHADOW enabled casters=7967 sunDist=5000 env=967 texelPerM=2.1     (x2)
    §PHOTO_SHADOW_BIAS worldBias=4.492m bias=-2.275e-4 range=19750m texel=0.472m grazeElev=6
    §PHOTO_AO ... (5,047 lines)
    §SUN_ONE_LIGHT frames=1562 lit=1191 dark=371

CLAUDE.md's Log Mandate says read the log after every run. It does not say WHICH log, and that is
the gap this fell into: a filtered view of a log looks exactly like a log. **Check the file size
before trusting a zero** — 6.3 MB against 40 KB would have said it immediately.

### §129.46c WHAT THE REAL NUMBERS SAY — §129.45 IS THE LEAD, AND LTU IS ITS BEST TEST

LTU's shadow frustum is `env=967` against HHS's 180, because the building is far bigger. That makes
each shadow texel 0.472 m instead of 0.0879 m, and the frozen bias that §129.45 diagnoses comes out
at **4.492 m** instead of HHS's 0.836 m. A depth bias separates a shadow from its caster by
bias/tan(elevation), so on LTU, whose sun runs 24.2 -> -11.7 deg:

    24.2 deg -> 10 m      10 deg -> 25 m      5 deg -> 51 m      2 deg -> 129 m

Which is exactly red1's report: shadows "running well and long", but tens of metres away from what
is casting them, so they do not agree with the clock. HHS's 0.9 m at its film start was the mild
case of the same fault. **LTU is now the better verification target for §129.45 than HHS**, because
the effect is about five times larger.

### §129.46d ALSO TO FIX LATER (red1: "the other session said earlier there is a more correct Sun
### path, the night lighting")

Two pointers, both from red1-29's `prompts/NIGHT_AND_FIXTURE_LIGHTING.md` — not re-derived here:
- **§SHADOW_REAL_SUN.** The Alt+C bake's shadows DO follow the real sun when `--sun-compass` is on
  (via §SUN_ONE driving `A.updateSky`, effects.js ~2690-2733). The INTERACTIVE Shadow+Ground toggle
  (`tools.js A.toggleShadow`) does NOT — it is a separate call site that was never wired to real
  sun position. That gap is still open.
- **The night/fixture lighting lane** is that same document. §129.41 (windows relight at topout)
  landed from it today; its §116 boundary text needed updating as a result.

**Everything in this section is PARKED at red1's instruction — note, do not fix.**

## §129.48-PROVISIONAL — red1: "the recent buggy fix is more like the last 24 hrs not 5 days, so
## take note it may be trash" (2026-09-19)

**Recorded so it can be reverted cleanly, not defended.**

The DATE trace is right and it is not the whole story. `git log -L` on the block:
- the `origE`/`origEI` snapshot is `0ba039fe`, **2026-05-25**, on main — it has always meant
  "the material BEFORE night glow", four months unchanged;
- the §118 relight that READS it is `f87e1a28`, **2026-09-14**, this lane only, never on main.

But what made it matter is **24 hours old and mine**: §129.41/§129.47 gave the film a mid-film
relight for the first time. Before that the fixtures were off from the last stick to the end, so
that `_want === 1` branch essentially never ran during a film. A five-day-old mistake that nothing
executed is not the same as a defect; my change is what turned it into one.

**Why §129.48 may be trash, stated by me rather than discovered later.** It caches `glowE`/`glowEI`
at apply time and restores that snapshot. But the values already have exactly one owner — the night
glow applier, which sets `0xffe4b5 @ 0.3` for lights and `0xfff8ec @ 0.55` for windows and logs
§NIGHT_GLOW_REASSERT. Caching them is a SECOND copy of state that the applier can change without
this copy knowing, which is the drift this project keeps writing witnesses about. The smaller fix is
probably to let the reassert run at relight instead of restoring anything — that keeps one owner.
The larger question is whether a "relight" should be restoring a snapshot at all.

**Do not treat §129.48 as settled.** It is unverified in any bake at the time of writing. If the
Hospital bake shows the windows lit, it works but may still be the wrong shape; if it shows them
dark, revert `d56e3962` and try the reassert route rather than patching the snapshot further.

**What is NOT in question:** §129.49's witness change. The old bar ("something is emitting") passed
while `emissiveMatsLit` was 0/4 and 0/8, and that is a defect in the test regardless of which fix
turns out to be right.

## §129.53 SESSION HANDOFF (2026-09-20) — READ THIS FIRST

Branch `feat/loadpath-ledger` in `/tmp/wt-loadpath`, pushed, clean. 90+ commits ahead of main.
red1-29 is HOLDING a merge to main at red1's word — check with red1 before landing anything.

### The one thing to do first
Run a FULL hi-res Hospital and read the log: `cd /tmp/wt-loadpath && ./scripts/bake_hires_offline.sh
Hospital_silent` (~1h20, self-delivers to ~/Downloads, three delivery checks). Every fix below is
in the tree; the last hi-res was killed to free context before it finished.

### Fixed AND proven in a bake
- §129.39 freeze card drew at 10px (ctx.font never set). Witness `witness_card_font.js`, control fails.
- §129.40 load-path chains must BEAR (contact + plan overlap), §129.42 storey span leads the ranking.
  Witness `witness_loadpath_bearing.js`. Terminal picks a 4-storey chain now.
- §129.44 compass rose anchored to `A.groundIfcZ` (was 30.7 m underground on Terminal).
- §129.47 lights relight at the ORBIT START, not topout. Off-window was 0.77% of the film.
- §129.48 relight restored PRE-GLOW dark values; now restores the glow. `emissiveMats 0/8 -> 8/8`.
- §129.49 lights witness fails per FAMILY — one lit family no longer covers a dark one.
- §129.50 DLOD proxy stands down for the discipline reveal (ARC was coming back one frame later).
- §129.51c a proxy engage/disengage edge forces one full TM pass. WITHOUT THIS §129.51/51b WERE
  INERT: standing the proxy down stopped it hiding more but never un-hid what it had hidden.
  Proven: `§STOREY_ARM_BASELINE armedObjsOff=0/4899 zeroScaleRows=0/25013` (was 457 / 4544).
- Georef migrations for all four film DBs (§GEOREF_PATCH_WITNESS PASS dbs=10/10 checks=150).

### Fixed, NOT yet seen in a bake
- §129.45 shadow contact: the grazing term moved to `normalBias`, depth bias back to 0.305 m.
  Predicted base gap 34 m -> 12.5 m at the film's end. NOT visually verified.
- §129.52 the big-stats card was handed the SAME `_stackY` as the pie panel and drew on top of it.

### Open, with evidence
- `§STOREY_CUT_RESTORE_WITNESS membersLeftOff=1689/63182` — down from 2981, NOT zero. The arm is
  now clean, so these are switched off DURING the storey reveal and not put back. Different, smaller
  fault from the proxy one. Read it from a FULL bake; a clip distorts this number badly.
- §HUD_LAYOUT IS NEARLY BLIND. Only 5 things register a rect: loadpath.card, loadpath.infopanel,
  loadpath.label, pie.band, pie.list. The stat card, storey card, room title, day counter, clock,
  sun readout and path map register NONE — so every `overlaps=0` today was silent about most of the
  screen. §129.52 was found by eye, not by the witness. Closing this is the highest-value test work.
- Per-frame cost grew 478 ms (09-15) -> ~864 ms (today) on HHS full 480p. The RENDERER is unchanged
  (still-refine 382->393 ms, AO 170->171 ms across four days) — the growth is overlay compositing,
  ~300 ms/frame. Clean test: bake HHS with the 09-15 flag set and compare.
- LARGE_DB_BAKE.md §8: `frustumPct` is 98-99% normally, so frustum culling is dead — EXCEPT inside
  the load-path freeze, where the unpack takes LTU to held=134,037 visible=126,065 and frustumPct
  falls to 34.8% at 9.4 s/frame. That window is the one place culling would pay.
- §129.46 LTU shadows do not track the solar clock. Parked by red1.

### Rules this session earned the hard way
- **"If the bug is older than a day, it is not it."** red1's rule killed three of my theories, each
  time pointing at innocent month-old code. The real cause was always something changed that day.
- **Read the RIGHT log.** `out/<name>.log` is the claim-filtered stdout; the 6 MB firehose is written
  beside the mp4. Counting tags in the wrong one returns 0 for things that ran thousands of times.
  Check the file size before trusting a zero.
- **A clip is not a film.** `--frame-range` never renders the earlier frames, so proxy/buildup state
  at the window differs. It made a fix look worse, then made a broken fix look right.
- **A green witness can be covering an unmeasured area.** `emissiveMats 0/8` sat inside a PASS for a
  whole day; `overlaps=0` still covers only 5 of ~12 overlays.

## §129.54 THE HI-RES BAKE SCRIPT WAS RUNNING ON HALF ITS FLAGS (2026-09-20, found on picking this
## prompt back up — this is why "the one thing to do first" had to be fixed before it could be done)

`scripts/bake_hires_offline.sh` put its explanatory `#` comment lines BETWEEN the `\`-continued
lines of the `node cli_silent_bake.js` command. **A comment inside a `\`-continued command ends the
command.** Bash ran the args above the comment as the command, then tried to run the args below it
as a command of their own.

Measured with a `node` shim on the real script (not reasoned about):

| | args reaching node |
|---|---|
| before | **14** — `--db --out --gpu real --width 1920 --height 1080 --fps 24`, then `--dlod-proxy: command not found`, exit 127 |
| after  | **26** — the full list, `--dlod-proxy --reveal --buildup --label --measure --clash --load-path --ledger --cost --storey-reveal --sun-compass --day tr` |

**It never failed loudly.** `cinema_maxq.js` falls back to the DB's stored `cinema_path` for any
flag the CLI does not set (`§CLI_BAKE_RESOLVED source=db:cinema_path`), so a film still came out —
just not the film the command line asked for. And `--dlod-proxy` has **no stored equivalent at
all**: it is a CLI-level flag (`cli_silent_bake.js:137`, `page.evaluateOnNewDocument('window.
__dlodProxyBake = 1')`), so the whole point of §129.50/51c was simply never switched on in any
hi-res bake.

Window: this file's own 2026-09-19 20:12 edit (the one that added the `--dlod-proxy --reveal` line
and its comment block) through 2026-09-20 05:24. Every hi-res bake in that window is suspect. The
HHS 09-19 11:08 delivery predates the break and is fine (`§CLI_BAKE_RESOLVED source=db:cinema_path
… buildup=1 … loadPath=1 ledger=1 cost=1 sunCompass=1` in its own log).

Fixed in `c7db9260` — comments kept, moved ABOVE the command, with a ⚠ line saying why they must
stay there. Proof the fix took, from the very next run's own log:

```
before (05:24):  §CLI_BAKE_BUILDUP_RESOLVED on=1 source=stored-path
after  (05:31):  §CLI_BAKE_BUILDUP_RESOLVED on=1 source=cli
before (05:24):  §CLI_BAKE_OPENING kept=load-camera (Measure off — the datum gate does not apply)
after  (05:31):  §CLI_BAKE_OPENING kept=saved-view … bubbles=37/37 overalls=3/3 drawn=71 FULL
```

**The rule this earns:** `bash -n` says nothing about this — the script is syntactically valid, it
just means something else. A flag list is only proven by a run that ECHOES IT BACK, either from a
`node` shim or from the bake's own `§CLI_BAKE_RESOLVED` census. Read that census line on every
bake before believing the film is the film you asked for.

## §129.55 SPEC — CLOSE THE §HUD_LAYOUT BLIND SPOTS (written 2026-09-20, spec BEFORE code per
## CLAUDE.md Spec-First; the §129.53 hand-off names this "the highest-value test work")

### The issue this must prove or disprove
**Issue:** `§HUD_LAYOUT overlaps=0` is not evidence that the HUD does not overlap, because most of
the HUD never registers a rect. §129.52 (the big-stats card drawn on top of the pie panel) sat
under a green `overlaps=0` and was found BY EYE. The test to write is the one that would have
turned §129.52 red.

### What registers today (read from the code, 2026-09-20)
Real rects — `A._hudLayoutRegister(name, x, y, w, h, parent?, truncated?)`:

- `cpe_resource_panel.js:1084` `resource-panel` (outer plate)
- `cpe_resource_panel.js:858` `pie.band` (parent `'resource-panel'`, hardcoded)
- `cpe_resource_panel.js:1076` `pie.list` (parent `'resource-panel'`)
- `cpe_resource_panel.js:324` each list row, e.g. `pie.cost`/`pie.ledger` (parent `'resource-panel'`)
- `cpe_load_path.js:3974/4081/4268` `loadpath.infopanel.*`, `loadpath.label.*`, `loadpath.card`

Everything else registers only `_drawUnlessHold`'s **0,0,1,1 placeholder** (`cinema_maxq.js:1167`),
which the witness explicitly skips (`if ((a.w <= 1 && a.h <= 1) || …) continue;` at line 849). So
these layers are in the registry by NAME only and contribute nothing to `overlaps`/`overflow`:
`hud.status`, `roomtitle.fallback`, `hud.pathmap`, `daycounter`, `suncompass.clock`,
`suncompass.readout`, `hud.pie`, `roster` (the stat/storey card), `measure.box`, `measure.*`,
`clash.labels`.

### The one thing that makes this cheap
Four of them **already publish their real rect** and nobody reads it into the registry —
`_rowAdvance` consumes it for layout and drops it:

- `cpe_path_overview.js:183` `A.pathOverviewLastBox`
- `cpe_day_counter.js:109` `A.dayCounterLastBox`
- `cpe_sun_compass.js:692/753/754` `A.sunClockLastBox`
- `cpe_sun_compass.js:628` `A.sunReadoutLastBox`
- (`cpe_resource_panel.js:1092` `A.resourcePanelLastBox` — already registered as `resource-panel`)

### The change
**A. `_drawUnlessHold(name, fn, boxFn)`** — NEW optional third arg, a function returning this
frame's real rect for that layer. When it returns a box with `w > 1 && h > 1`, register THAT under
`name` instead of the 0,0,1,1 marker. No `boxFn`, or a box that is absent/degenerate → the existing
placeholder, unchanged. The existing `alpha > 0` guard ("a drawer that painted nothing must not
register a rect") is kept as-is and now gates the real rect too.

**B. Wire the four that already publish** — `hud.pathmap`, `daycounter`, `suncompass.clock`,
`suncompass.readout`, at their `_drawUnlessHold` call sites in `cinema_maxq.js`.

**C. Two that must start publishing:**
- `A.filmBoxesDrawStatus` (`cpe_film_boxes.js:190`) → `A.filmBoxesStatusLastBox` from its own
  `L.status`, set only when it actually draws. Wire `hud.status`.
- `A.filmBoxesDrawMeasure` (`cpe_film_boxes.js:309`) → `A.filmBoxesMeasureLastBox` from `L.measure`,
  set only on a frame that draws an entry, cleared on the idle/linger-expired return. Wire
  `measure.box`.

**D. `hud.pie` stays a placeholder ON PURPOSE.** `resourcePanelCompositeOntoCanvas` already
registers the identical geometry as `resource-panel`; registering it a second time under a second
name would be a rect overlapping itself — a permanent false FAIL. Written down so the next reader
does not "fix" the gap.

**E. `roster` (the stat card / storey card) needs an owner rect, and this is the §129.52 catch.**
`bigStatsCompositeOntoCanvas` (`cpe_resource_panel.js:880`) draws its own plate from the same
`_box()` (`B.x/B.y/B.bw/B.bh`) and publishes nothing. It gets `A.bigStatsLastBox` and registers as
`stats-panel`.
  - `_pie` and `_drawList` hardcode `parent = 'resource-panel'`. They are SHARED by both panels, and
    both panels can draw in the same frame, so a card-owned `pie.band` currently claims a parent that
    may not exist or, worse, belong to the other panel. Both take an **owner name** instead, passed
    down from whichever composite is drawing. No new geometry, no new numbers.
  - With `resource-panel` and `stats-panel` both real and unrelated, §129.52's defect — the card
    handed the same `_stackY` as the pie panel — is two unrelated rects at the same origin, which
    is exactly what `_hudRectsOverlap` counts. **That is the issue this change proves.**

### Test — and it must fail before it passes
`witness_hud_layout_coverage.js`, node-runnable, no browser (the overlap rule is pure arithmetic
and the coverage fact is in the log text — bim-ootb rule: slice the predicate, do not claim "needs
a browser"):

1. **COVERAGE** — parse `§HUD_LAYOUT` / `§HUD_LAYOUT_ARM` `items=[name:x,y,w,h …]` out of a bake
   log. For every layer that drew this frame, assert it registered a rect with `w > 1 && h > 1`.
   Exempt, by name and with the reason above: `hud.pie`, and any layer whose drawer legitimately
   published nothing.
   - **Control:** the same parser over a PRE-fix log must report the blind layers as blind. A run
     that cannot show the "before" as red is not evidence.
2. **§129.52 REGRESSION** — the pure rect arithmetic, straight from `_hudRectsOverlap`'s own rule:
   `resource-panel` and `stats-panel` at the same `_stackY` ⇒ `overlaps >= 1`; stacked with the
   `_stackY += resourcePanelLastBox.h + _gapY` advance ⇒ `overlaps == 0`.

### Out of scope, deliberately
`clash.labels` and the per-beat `measure.*` cue overlays paint many small marks, not one plate;
giving them a single rect would be an invented number. They stay placeholders and stay listed as
uncovered, honestly, rather than being papered over.

### NOT MERGED, NOT AUTHORISED TO MERGE
Same standing rule as the rest of this branch: `feat/loadpath-ledger` is HELD at red1's word.

### §129.55 DONE (2026-09-20) — implemented exactly as spec'd above, bim-ootb `3b9f41fa`
`viewer/cinema_maxq.js` + `viewer/cpe_resource_panel.js` + `viewer/cpe_film_boxes.js`, witness
`viewer/tests/witness_hud_layout_coverage.js` (W-HUD-LAYOUT-COVERAGE, 285 lines, node, no browser).

```
after : §HUD_COVERAGE PASS fails=0  inconclusive=0  wiredLayers=6 exempt=hud.pie,roster
before: §HUD_COVERAGE FAIL fails=15 inconclusive=1
```
The control's Part C is the no-op proof: on the pre-fix tree it reads **INCONCLUSIVE — "the card
publishes nothing, so this leg cannot fire"**, so the §129.52 check cannot go green by accident on
code that registers no card rect.

Two traps this hit, both worth keeping:
- `_hudHold` is a one-line alias for `_drawUnlessHold` and **drops extra arguments**. Adding the
  third param to the wrapper alone left `suncompass.clock`/`suncompass.readout` silently unwired.
- A `vm` sandbox with `has: () => true` hands the module a STUB for `Math`, so every
  `Math.round(h * 0.36)` in the real geometry returns 0 and every published rect reads `0,0,0,0`.
  Real built-ins first, stub only for what is genuinely absent. (`witness_card_font.js` has the
  same sandbox shape — it happens not to exercise a path that needs `Math`, but it is one edit away
  from the same silent zero.)

**Still uncovered, on purpose and stated honestly:** `clash.labels` and the per-beat `measure.*`
cue overlays. They paint many small marks, not one plate; a single rect for them would be an
invented number.

### §129.54 CLOSED — the flags reach node, read from the running bake's own log
`Hospital_silent_hires_2026-09-20_0531`, commit `c7db9260`:
```
§CLI_BAKE_DLOD_PROXY requested — distant already-built elements render as instanced boxes
§CLI_BAKE_RESOLVED source=db:cinema_path bands=4 total=278.8s buildup=1 roomTitle=1 reveal=1
  dayCounter=tr clash=1 storeyReveal=1 measure=1 loadPath=1 ledger=1 cost=1 sunCompass=1 sunDate=-
```
4,963 frames at ~0.79 s/frame. ⚠ That census line is in the **firehose** beside the mp4
(`/tmp/bake_<db>_<stamp>.log`), NOT in `out/<name>.log` — the §129.53 "read the RIGHT log" rule
applies to this line specifically.

## §129.56 SPEC — THE DLOD PROXY HAS NO PER-FRAME CENSUS (2026-09-20, red1 asked "isn't DLOD
## engaged in this hi res bake?" and the log could not answer it)

### The issue this must prove or disprove
**Issue:** `§DLOD_TM active=… boxed=… mode=on` looks like a measurement and is not one. It prints
ONLY on an engage/disengage EDGE — `time_machine.js:846`, `if (forceFull) console.log(…)`, where
`forceFull = (_lastProxyEngaged !== engaged)`. On the Hospital hi-res bake it therefore fired
exactly once, at the moment the proxy switched on, at frame 0 before the buildup had placed
anything: `§DLOD_TM active=1 boxed=0 mode=on`. A reader sees `boxed=0` and cannot tell "the proxy
is doing nothing" from "the proxy had nothing to do yet". Same blind-witness class as §HUD_LAYOUT
(§129.55): a tag shaped like a number that only ever reports one instant.

### What is already there and costs nothing
`boxed` is ALREADY computed correctly on every pass, forceFull or not — the loop's early-continue
branch still counts it (`if (!forceFull && b.visible === wantVisible) { if (wantVisible) boxed++;
continue; }`). Only the PRINT is gated. So this is a logging change, not a measurement change: no
new traversal, no new state, nothing added to the per-frame cost the §129.53 hand-off is already
watching (478 ms -> ~864 ms on HHS).

### The change
`§DLOD_TM_CENSUS`, emitted from the SAME place, wall-clock throttled (red1: "in timer to avoid
spam"), default one line every 2,000 ms:

```
§DLOD_TM_CENSUS boxed=<n>/<indexed> candidates=<c> frontier=<f> passes=<p> since=<ms>ms mode=on|off
```

- `boxed`      — proxy boxes VISIBLE this pass, i.e. real meshes standing down. The existing count.
- `indexed`    — size of `_dlodBoxIndex`, counted in the loop already running (never `Object.keys`).
- `candidates` — placed AND not frontier AND not recent: what the proxy was ALLOWED to box this
                 pass. `boxed < candidates` means the frustum/distance test kept them real, which is
                 a different fact from "nothing was eligible", and today neither is visible.
- `frontier`   — the frontier size the edge line already prints, kept for continuity.
- `passes`/`since` — how many TM passes the throttle swallowed and over how long, so the real
                 per-frame rate is recoverable from a throttled line. A census that hid its own
                 sampling rate would be the same lie in a smaller font.

The edge line stays exactly as it is. This is added beside it, never in place of it.

### Test — and what would make it a lie
A logging-only change cannot be proven by a unit test of the logger; the thing that must be proven
is that the line FIRES IN A REAL BAKE with a number that moves (bim-ootb rule: prove a fix fires,
not just that it shipped). So:
- **PASS** = a bake log contains ≥2 `§DLOD_TM_CENSUS` lines, at least one with `boxed>0`, and
  `passes` summing to roughly the frame count of the span it covers.
- **FAIL/blind** = `boxed=0` on every line for a Hospital-sized building, which would mean the
  proxy really is inert and §129.50/51c never engaged — the exact question that could not be
  answered today.
- ⚠ **NOT YET WITNESSED when written.** The 05:31 Hospital hi-res bake was already running and its
  page loaded the OLD `time_machine.js`; this line cannot appear in it. Status is SHIPPED, NOT
  PROVEN until a bake started after this commit is read.

### Why it is safe to land while a bake is running
`viewer.html:1019` loads `time_machine.js` as a plain `<script src=…?v=79>`, fetched once at page
load. The only dynamic `import()`s in the viewer are the three.js / postprocessing bundles under
`lib/`. An edit on disk cannot reach a page that has already loaded.

## §129.57 SPEC — THE FREEZE RE-RENDERS 199 FRAMES THAT ARE ALREADY BYTE-IDENTICAL (2026-09-20,
## red1: "almost black, minimal elements on canvas. Can cut down bake time?" — yes, 22.9 min)

### The issue this must prove or disprove
**Issue, MEASURED not assumed.** The bake already hashes every encoded frame (`§FRAME_HASH i=<n>
sha=<...>`). Over the 3,381 frames of the killed 2026-09-20 Hospital hi-res bake:

```
byte-identical to the frame before  :  199 / 3381
  inside the load-path freeze       :  199
  everywhere else in the film       :    0
```

All 199 are in the freeze, and each cost **6,892 ms** to produce. **199 x 6.892 s = 22.9 min of GPU
time spent re-deriving bytes that already existed.**

### The shape of the freeze, read off the hashes
```
frames 1923-1947 (25)   HUD fade-in        every frame distinct
frames 1948-2163        9 hop reveals      2 distinct frames per hop, then 23 IDENTICAL
frames 2164-2187 (24)   HUD fade-out       every frame distinct
                        -> 66 distinct, 199 duplicates
```

Why nothing moves for 23 frames at a time, from the code and the log together:
- **Camera** pinned at `armPose` for the whole hold (`§LOADPATH_ARM armPose=[-23.55,-0.07,-9.29]`).
- **Sun** frozen: `§SUN_ONE elevation=26.5` on all 264 in-window samples, first to last.
- **Scene** frozen: `held=73892` constant, `visible` moves 68,979 -> 68,987 across the whole window
  — 8 objects, the hop clones.
- **The reveal step is idempotent and early-returns.** `_revealStackStep` (`cpe_load_path.js`)
  computes `revealed = floor(stackElapsed) + 1` and then `if (revealed === stack.revealedHops)
  return;`. So it mutates exactly once per second of hold. ⚠ This is also why the "landing glow"
  (`GLOW_SEC = 1.0`, a lerp over `1 - age/GLOW_SEC`) shows for ONE frame instead of fading over a
  second — the lerp is only ever evaluated on the step frame. That is a separate LOOK question,
  noted here and not fixed by this spec.

### The change
Inside the hold ONLY, when nothing that drives the picture has changed since the last frame, hand
the encoder the **previous encoded blob** instead of calling `_captureFrame` at all. That skips the
base render, the 20-render still fold (`taa=8 ao=12`) and the HUD draw together — the whole
6,892 ms, not a part of it.

**A. `A._loadPathVisualRev` — a mutation counter, not a predicted list of drivers.**
Every load-path function that ACTUALLY changes what is drawn bumps it: `_revealStackStep` past its
own early-return, arm, release, and any content change in the card/info panel. The bake reads the
counter; it never tries to guess what the load path might animate.

This is the part that makes the change safe against future edits. If the landing glow is ever fixed
to animate over its full `GLOW_SEC`, `_revealStackStep` will mutate every frame, bump the counter
every frame, and frame reuse will switch itself off — with no edit to the bake loop and no stale
picture. A hand-written list of "things that change" would have silently frozen that animation.

**B. The frame key**, built in `cinema_maxq.js`'s own bake loop from values it already has:
`inHold` · `A._loadPathHudAlpha` · `A._loadPathVisualRev` · camera pose · sun tNorm · day cursor.
`hudAlpha` is what correctly forces a real render through the 49 fade frames at either edge.

**C. Gated to the hold.** Outside `_lpHoldCtl.inHold`, never reuse — matching the measurement
exactly (0 duplicates anywhere else). `window.__noFrameReuse = 1` disables it entirely, which is
the control the witness below needs.

**D. Census.** `§FRAME_REUSE` per reuse run and one end-of-bake total, so a bake states how many
frames it skipped and which frames they were. A saving that cannot be read back out of the log is
not a saving anybody can check.

### Expected effect
```
freeze window   30.4 min  ->  ~7.5 min
whole bake      ~2h50     ->  ~2h27
picture quality unchanged — the frames are already identical
```

### Test — and the one that can actually fail
1. **W-FRAME-REUSE (node, no browser)** — drives the key/reuse logic over a synthetic hold that
   reproduces the measured shape (25 fade-in frames, 9 hops x (2 distinct + 23 held), 24 fade-out)
   and asserts exactly 66 renders and 199 reuses. Control: with `__noFrameReuse` it must do 265
   renders and 0 reuses. Also asserts that bumping the rev counter EVERY frame (the "glow was
   fixed" case) collapses reuse to 0 — the self-correcting property is the whole safety argument,
   so it is tested, not asserted in prose.
2. **BYTE-EXACT GATE (needs a bake)** — re-bake and diff the `§FRAME_HASH` sequence against the
   2026-09-20 run frame-for-frame. Identical = the reuse never froze anything real. A single
   differing hash = the key is too coarse. This is the real proof and it is NOT run yet:
   ⚠ **red1 has paused baking** while another session lands the Escape Route ending
   (`feat/escape-route-reveal`, worktree `/tmp/wt-escape-route`) so the two ship in one film.
   §129.57 is SHIPPED, NOT PROVEN until that combined bake's hash sequence is compared.
   The reference hashes are in `/tmp/bake_Hospital_silent_2026-09-20_0531.log` — ⚠ that file is in
   `/tmp` and will not survive a reboot. Copy it before the next bake or the gate loses its
   baseline.
