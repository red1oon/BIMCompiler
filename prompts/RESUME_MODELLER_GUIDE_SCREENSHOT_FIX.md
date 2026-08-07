# RESUME — ModellerGuide screenshots + SampleCastle "geometry hell" (2026-07-01, DO NOT re-touch fix/arc-rotation-full-axes)

```
# ⚠ DO NOT REMOVE
SCOPE: this card now covers TWO related-but-separate threads. Read both sections before touching anything.
A NEW session is picking this up — the branch `fix/arc-rotation-full-axes` (bim-ootb, /tmp/wt-arc-rot-fix) is
COMMITTED and DONE FOR THIS PASS — do not edit it further without re-reading §THREAD 2 first; a separate session
(walker/geometry fix, worktree /tmp/wt-lod400-bug2 or similar) owns the broader SampleCastle "geometry hell"
investigation. Coordinate, don't collide — see prior card history below for what already happened.
```

## §THREAD 1 — ModellerGuide screenshots (§F2) — see prior findings, UNCHANGED, still needs a fix
The original defect this card was written for: several of the 21 §F2 guide-frame screenshots are nonsense —
`cut-select.png`/`cut-open.png` show a random roof crop with no wall/cut visible, `route-spine.png`/
`sketch-profile.png` are unrecognizable wall-corner close-ups, `route-run.png` is a confusing interior angle,
and `gizmo.png`/`scale-stretched.png`/`rotate-yaw.png` are real captures but never actually zoom to the element
(all three are near-identical wide whole-building shots). Root cause hypothesis unchanged: the `shotClip()`/
`shotPts()`/`bboxScreen()` helpers in `modeller/tests/e2e_harness.js` (bim-ootb, landed PR #590) likely pick the
wrong element/camera-state at capture time. **This thread has NOT been touched since the last card** — full
detail (findings table, live-state pointers, root-cause hypothesis) is preserved below in §ORIGINAL CARD.

## §THREAD 2 — SampleCastle "geometry hell" (NEW this session, 2026-07-01 afternoon)
User asked to smoke-test SampleCastle and take its first (ARC-only) guide screenshot — explicitly scoped to
NOT touch walker screenshots, since a separate session owns walker confirmation.

### What was found (real, verified, not invented)
1. **All 4 residents (SampleHouse/Duplex/SampleCastle/Terminal) open cleanly** on current `main` (bim-ootb
   `351992e`, PR #594 already merged) — real non-zero mesh counts, only benign 404 console errors. Confirmed
   both by this session's own capture (SampleCastle meshCount=3317, matches) and by another session's
   `witness_all4_open.js` run (log: `/tmp/claude-1000/-home-red1-bim-compiler/f378776b-.../scratchpad/logs/witness_all4_open.log`).
2. **But the SampleCastle render still shows small clusters of geometry that look visually disconnected** from
   the main building mass in the default "frame all" isometric view — a cube stack, scattered thin fragments,
   a floating triangle+cylinder, off to one side. Screenshot:
   `/tmp/claude-1000/-home-red1-bim-compiler/3d026321-.../scratchpad/samplecastle-workspace-open.png` (and the
   post-fix rescreenshot, pixel-identical: `samplecastle-after-rotfix.png` — both in an ephemeral session
   scratchpad, will not survive session end; re-capture if needed, see §HOW below).
3. **DB forensics on `deploy/buildings/SampleCastle_extracted.db` (bim-compiler copy) found nothing wrong** —
   the "far away" elements are just a real second/third wing of the castle (full walls/windows/slabs/beams at
   x≈18-23 and y≈19-25), not corruption. That DB copy also has **zero** rows with non-zero rotation_x/rotation_y.
   **This was a dead end — don't re-walk it.**
4. **The REAL finding: `modeller/SampleCastle_extracted.db` (the modeller's OWN copy, bim-ootb — a SEPARATE
   file from the bim-compiler deploy copy, per memory `feedback_modeller_gh_vs_viewer_oci_data`) has 497 of
   3317 elements with non-zero rotation_x/rotation_y.** These were being SILENTLY rendered upright (yaw-only)
   by `modeller/arc_editable.js`'s ARC-seed path, which only ever read `rotation_z` — `rotation_x`/`rotation_y`
   were read nowhere in that code and simply discarded, with no log, no count, no audit trail.
5. **Code-level comparison (pure code read, no data): the Modeller's ARC-seed does NOT follow the Viewer's
   rotation model.** `viewer/streaming.js` (e.g. line 748) applies a full 3-axis Euler:
   `_euler.set(el.rotX, el.rotZ, -el.rotY)` (raw radians, no conversion). `modeller/arc_editable.js`'s
   `buildSeedOps` (even after the already-merged §ARC-ROT-UNIT radians→degrees fix, PR #594) only ever
   selected/used `rotation_z`, fed through `bonsai_library.js`'s `place()` which is yaw-only (single 2D
   cos/sin rotation about Z) — there is no code path anywhere for `rotation_x`/`rotation_y` to apply.

### What was done about it (bim-ootb, branch `fix/arc-rotation-full-axes`, worktree `/tmp/wt-arc-rot-fix`)
**Committed, NOT pushed** (commit `16a37a5`, base = `origin/main` @ `351992e`). This is an **audit fix, not a
3D-tilt implementation**:
- `buildSeedOps` now also reads `rotation_x`/`rotation_y` and counts (`tilted`) any element where either is
  non-zero — these are elements this yaw-only ARC seed structurally cannot represent correctly.
- A new `§ARC-YAW-ONLY` log line surfaces the count (`building=SampleCastle tilted=497 ...`) instead of the
  prior total silence.
- **Placement math is UNCHANGED** — still yaw-only. This does NOT fix the tilt; it makes the gap visible and
  measured. Implementing real 3-axis rotation would mean either extending `place()`'s single-yaw model (used
  by many OTHER callers — catalog drops, gizmo GEOM_ROTATE deltas — a much bigger, riskier change) or a
  parallel path for tilted ARC elements specifically. **That decision was deliberately NOT made this session**
  — scope was audit-only, per the non-invent/no-silent-gap doctrine.
- Verified non-regressing: `node modeller/tests/witness_arc_editable.js` → 10/10 unchanged (SampleHouse has 0
  tilted rows, so the new log line doesn't even fire there). Screenshot of SampleCastle before/after this
  commit is pixel-identical (confirms this commit only adds auditing, changes nothing rendered).

### §RESUME — what a new session should do next
1. **Confirm `fix/arc-rotation-full-axes` (bim-ootb, commit `16a37a5`) is still there and still applies
   cleanly** — `git -C ~/bim-ootb fetch origin && git -C /tmp/wt-arc-rot-fix log --oneline -3` (recreate the
   worktree if it's gone: `git -C ~/bim-ootb worktree add /tmp/wt-arc-rot-fix fix/arc-rotation-full-axes`).
2. **Decide whether the 497 tilted SampleCastle elements are worth a real fix now**, or whether they're a
   minority of small fixtures (railings/coverings, going by the earlier DB outlier scan) that don't materially
   change the guide screenshot. Re-run the `§ARC-YAW-ONLY` log against `modeller/SampleCastle_extracted.db`
   (NOT the bim-compiler deploy copy — they differ) to get the actual guid list of tilted elements, then
   cross-reference `ifc_class` to see if they're mostly cosmetic (railings) or structural (walls/slabs) — that
   determines urgency.
3. **Coordinate with whichever session owns the broader "geometry hell"/walker fix** before extending
   `place()` to support real 3-axis rotation — that's a cross-cutting change (affects every ARC-seeded
   building, not just SampleCastle) and should not be done in parallel with other in-flight geometry fixes on
   the same files (`arc_editable.js`, `modeller.html` were both mid-edit in a sibling worktree
   `/tmp/wt-lod400-bug2` earlier this session — that worktree was found to be STALE/superseded and was left
   untouched per user instruction; re-check its state before assuming it's still irrelevant).
4. **§THREAD 1 (guide screenshots) is still fully open** — nobody has touched `e2e_harness.js`'s crop helpers
   yet. See §ORIGINAL CARD below for the full findings table and root-cause hypothesis.

## §THREAD 2 UPDATE (2026-07-01, later same day) — SC ARC screenshot BLOCKED, fail-hard per user
Recaptured the SampleCastle ARC-open frame fresh (`~/bim-ootb` main `351992e`, real `open()` click sequence, 2×DPR,
3317 meshes, 0 errors) to add to the guide. **It still visibly shows the floating/disconnected fragments from the
497-tilted-element rotation bug** (§THREAD 2 above) — small cube clusters and thin panels scattered off the main
mass. **User instruction: if the underlying bug is not fixed, FAIL HARD — do not embed it.** So: the SC ARC
screenshot is NOT added to `docs/ModellerGuide.md`. This item is **⛔ BLOCKED on the other session's
walker/rotation-tilt fix** (see §RESUME step 3 above — coordinate, don't parallel-fix). Once that lands, recapture
via the repro below and embed then.

## §THREAD 1 RE-CHECK (2026-07-01, same session) — "recapture all 21 frames" commit did NOT fix the composition bugs
Commit `59746bf5b` ("§F2 — recapture all 21 guide frames to one 2× DPR standard") re-encoded the images at higher
resolution but the camera-framing defect is unchanged — verified by re-opening the PNGs: `cut-select.png` still a
random roof/cube crop (no wall/selection), `gizmo.png` still a wide whole-building shot (not an element close-up),
`route-spine.png` still an unrecognizable wall-corner close-up. §THREAD 1 is **still open**; not touched further
this session (out of scope for this turn) — the harness (`shotClip`/`bboxScreen` in `e2e_harness.js`) still needs
the real fix described in §RESUME steps 1-3 below.

## §THREAD 2 PUSHBACK (2026-07-02) — "second wing, not a bug" claim does NOT hold up against the real DB
The rotation-fix session (`/tmp/wt-arc-rot-fix`, `fix/arc-rotation-full-axes`, commit `b06e64b`) landed a real
3-axis rotation fix (10/10 `witness_arc_editable.js` green, no regression, untilted elements hit an unchanged
byte-identical branch) — but then told the user the remaining scattered fragments in
`W-ARC-TILT-WHOLE-after-3axis-fix.png` are "a separate, already-explained real second wing of the castle (not a
bug)". **Checked against the actual DB the modeller renders (`modeller/SampleCastle_extracted.db`, NOT the
bim-compiler deploy copy) — this does not hold:**
- Of 59 elements sitting far outside the main building mass, **38 (64%) have non-zero `rotation_x`/`rotation_y`**
  vs. 502/3583 (14%) tilted overall — tilted elements are **6.6× more likely** to be >15m from the building
  centroid than untilted ones (23.7% vs 3.6%). Being tilted and being scattered are strongly correlated, not
  independent facts.
- The original "second wing" conclusion was forensics on `deploy/buildings/SampleCastle_extracted.db` (the copy
  with **zero** tilted rows) at x≈18-23/y≈19-25. The actual scattered fragments in the live modeller render sit
  at x=42.9, x=-41, x=-26.7 — a different DB, different coordinates. The "not a bug" claim is reapplying an old
  finding from the wrong database to a different set of points.
- Some tilted outliers have suspicious exact-right-angle compound rotations — e.g. an `IfcWindow` with
  `rotation_x=90° AND rotation_y=90°` simultaneously, `IfcStair` at `rotation_x=90°, rotation_z=180°` — patterns
  more consistent with an **axis-swap/extraction bug** upstream (IFC→DB) than genuine architectural tilt.
**Verdict: needs re-investigation by that session, not a wave-off.** SC guide screenshot stays ⛔ BLOCKED — not
embedded, per user's fail-hard instruction, until this is actually resolved (not just rotation-fixed).

## §THREAD 2 EMBED-THEN-RETRACT (2026-07-02) — do NOT re-embed without reading this
bim-ootb PR #595 merged to `main` (`e4ce58f` — **confirmed actually merged and pushed**, `git -C ~/bim-ootb fetch
origin && git merge --ff-only origin/main` → `147d098`, fix commits present). PR #595's third commit (`901bb08`)
swapped `modeller/SampleCastle_extracted.db` for a plain-file copy of bim-compiler's `deploy/buildings/
SampleCastle_extracted.db`, on the theory the modeller's own re-extracted copy (PR #543, 497 tilted rows, a
duplicate-coordinate cluster) was corrupted. **I verified that swap looked clean** (0 duplicate-coordinate
clusters, 0 tilted rows, `witness_arc_editable.js` 10/10, real `e2e_harness.js` capture meshCount=3225 matching
the PR claim, visually coherent castle, zero floating fragments) and **embedded**
`docs/img/modeller/samplecastle-arc-open.png` into `ModellerGuide.md` — **then retracted it in the same session**
after `PROGRESS.md` (edited concurrently by the walker-fix session) surfaced a newer, contradicting finding in
`prompts/RESUME_SAMPLECASTLE_DB_PROVENANCE.md`:
- **Ground-truthed directly against the original source IFC via `ifcopenshell`** (not inferred): a real
  `IfcWindow` (guid `2pFYENFv91ygvyAeZOYi93`) has true world rotation matrix `[[0,-1,0],[0,0,1],[-1,0,0]]` — a
  genuine 90° compound tilt. PR #543's modeller-own extraction captured this correctly; bim-compiler's
  `deploy/buildings/` copy (the one `901bb08` swapped TO) silently reports it as upright (zero rotation).
- The "duplicate-coordinate cluster" I and the rotation-fix session both read as corruption is, per that same
  ground-truth check, **real IFC structure** — multiple elements legitimately sharing one placement node.
- **Conclusion: `901bb08`'s swap likely regressed the modeller from more-accurate data (PR #543) to less-accurate
  data (bim-compiler's flatter copy).** My "clean, no floating fragments" render is clean *because* it's
  silently flattening real tilts to zero — the fragments weren't noise, some of them were correctly-tilted
  geometry that the flatter DB simply omits/flattens.
- `RESUME_SAMPLECASTLE_DB_PROVENANCE.md` believed `901bb08` was still local/unpushed ("committed not pushed") —
  **that's now stale/wrong; it is merged to origin/main.** The regression (if it is one) is already on trunk, not
  sitting safely on a local branch. Flag this to whoever owns that resume card — the urgency is higher than that
  doc assumes.
- **Action taken:** un-embedded the image from `ModellerGuide.md`, deleted the untracked
  `docs/img/modeller/samplecastle-arc-open.png` capture. §THREAD 2 is back to ⛔ BLOCKED — now on the DB
  provenance decision (`RESUME_SAMPLECASTLE_DB_PROVENANCE.md §RESUME`: user wants a visual deep-link + orange
  highlight of all 497 tilted elements before deciding which DB version is right), not on the rotation-fix code
  (which is separately confirmed correct and NOT in question).

**CORRECTION (2026-07-02, later)**: the "ground-truthed genuine 90° tilt" claim above is itself now walked back —
the user actually looked at the flagged window element in the app and it's a thin, long, border-like sub-piece
(a sill/trim member), not the window pane — a sill naturally sits at a different orientation than the pane, so
the rotation-matrix reading may have been technically accurate but mischaracterized as "a real tilt" without
checking what the piece visually is. Same failure mode as the "second wing" pushback earlier in this file: don't
trust a data-only reading (mine or another session's) over an actual look at the geometry. Whether the DB-swap
regression is real is now genuinely unresolved, not settled either way — but it's moot for §THREAD 2 below
regardless, since that whole DB-version question was superseded by the fake-box-geometry bug the same day (see
next paragraph) — don't re-open the tilt-accuracy question to unblock the SC screenshot; it's blocked on the
real-geometry fix, not on this.

**SUPERSEDED same day**: `RESUME_SAMPLECASTLE_DB_PROVENANCE.md` is now closed — the DB-version question turned
out to be the wrong question. Real root cause (found by the walker-fix session): the Modeller rendered EVERY
element as a fake 12-triangle bounding box, regardless of which DB version — `boxCount=3225, otherCount=0` for
SampleCastle, missed by all 32 `witness_*.js` files (none check mesh shape). Every SC screenshot in this whole
saga (mine included) was a box-render, not real geometry — "looks clean" / "looks scattered" were never a
reliable signal either way. Fix in progress at bim-ootb `/tmp/wt-sc-tilt-visual` (`feat/samplecastle-tilt-
visual-proof`), NOT yet merged (conflicts with already-merged #595, needs rebase; Terminal geometry still an
open gap). Full detail: `prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`.

## §THREAD 2 ✅ DONE FOR REAL (2026-07-02, third attempt) — real-geometry fix confirmed merged + embedded
bim-ootb `main` now at `8449306` — the real-geometry fix (PR #598) AND a follow-on placement fix (PR #613,
`§ARC-ANCHOR`, `W-MV-PARITY` 12/12) are both merged. Independently re-verified before embedding, not trusted from
text: `git -C ~/bim-ootb merge --ff-only origin/main`, `node modeller/tests/witness_arc_editable.js` → 10/10,
`node modeller/tests/witness_e2e_mv_parity.js` → 12/12 (Modeller↔Viewer cross-app spatial parity, maxDC~1e-6m —
this is the witness that would have caught the earlier fake-box/mis-placement bugs). Fresh real-click capture
(`e2e_harness.js` `open()`, 2×DPR) shows genuine detailed geometry — roof dormers, window frames/mullions,
wood-toned door trim, skylights — not boxes. The one small isolated-looking object near the building was traced
by raycast (not assumed) to an `AxesHelper` (the scene's world-origin UI marker, always present) plus one small
legitimate element (fid 2367) near world origin — not scattered/corrupted data this time. **Embedded**
`docs/img/modeller/samplecastle-arc-open.png` in `ModellerGuide.md`, same spot (before "### What a walk actually
places"). `mkdocs build --strict` exit 0, 22/22 image refs resolve. **§THREAD 2 is closed.**

## §HOW — reproducing the SampleCastle screenshot (all scratchpad captures are ephemeral, will not survive session end)
```js
// minimal repro — open SampleCastle, screenshot at 2x DPR, log §ARC-YAW-ONLY etc.
// serve ROOT = the worktree with the fix (or ~/bim-ootb for pre-fix baseline)
// puppeteer: headless swiftshader (--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader)
// pg.click('#b-open') -> pg.click('#m-open-panel .mo-row[data-key="SampleCastle"]')
// wait window.__dwBuf, sleep ~2500ms, click #b-fit, sleep 600ms, screenshot
```
Full working script pattern: see this session's transcript or reconstruct from `modeller/tests/e2e_harness.js`'s
`open()` method (same click sequence).

---

## §ORIGINAL CARD (preserved verbatim — §THREAD 1 detail, still current)

### THE LESSON (read this before doing anything else)
`node witness_e2e_X.js` going green only proves the **assertions** held (op-log, atomicity, pixel-diff-changed).
It proves NOTHING about whether the **captured crop is legible / shows what the caption claims**. This whole
chain — 5 merged PRs across 2 repos, a live deploy, 7/7 canaries green — shipped broken frames because every
verification step checked file existence/size/witness-pass, never the image content. This is the same failure
shape as memory `feedback_test_real_user_path_not_seams` (seam-green while the real thing is broken) — same
root cause, different layer (screenshot content vs. app behavior). **The only real check is opening the PNG.**

### §STATE — what's actually live right now
- **bim-compiler PR #10** (guide + all 21 §F2 frames) merged into `docs/hba-guide-rewrite` @ `a5afeae45`, deployed.
- **bim-compiler PR #11** removed 10 unrelated *orphaned* pre-§F2 images (different bug, already clean). Current
  tip: `47511142a` on `docs/hba-guide-rewrite`.
- **bim-ootb PR #590** landed the witness `shot()` instrumentation + the (buggy) crop helpers on `main`.
- `docs/hba-guide-rewrite` is **330+ commits ahead of `master`** with no open PR back — it is the de facto guide
  trunk right now, not `master`. Branch/deploy off it, not `master`, until someone reconciles the two.
- Live: https://red1oon.github.io/BIMCompiler/ModellerGuide/ — canaries all 200, `mkdocs build --strict` = 0.
  Both of those checks are **necessary, not sufficient**.

### §FINDINGS — visual audit of the 21 §F2 frames (real eyes on the PNGs)
| Frame | Verdict | What's actually wrong |
|---|---|---|
| `workspace-open.png` | ✅ good | Full HMI (Outliner+toolbar+scrubber) legible, matches caption |
| `insert-catalog.png` | ✅ good | Catalog panel armed, status bar reads correctly |
| `seedtrunk-entry.png` | ✅ good | Popup dialog crisp and on-topic |
| `fillet-edges2.png` | ✅ good | Cube + edge markers + status line "fillet: 1 edge(s) selected" — legible |
| `cut-select.png` | ❌ **broken** | Random crop of the roof/floor slab near an unrelated furniture cube — no wall, no selection highlight visible |
| `cut-open.png` | ❌ **broken** | Near-identical to `cut-select.png` — no visible opening/cut |
| `route-spine.png` | ❌ **broken** | Nonsense close-up of a wall-corner/floor-slab; unrecognizable as a route spine |
| `sketch-profile.png` | ❌ **broken** | Same composition bug as `route-spine.png` — unrecognizable as a sketch profile |
| `route-run.png` | ❌ **broken** | Confusing interior camera angle; doesn't show the swept run result; status line text overlaps |
| `gizmo.png` | ⚠ marginal | Real capture but a wide whole-building shot with a tiny gizmo icon — NOT the "element close-up" the spec (G4) demanded |
| `scale-stretched.png` | ⚠ marginal | Same composition bug as `gizmo.png` — nearly pixel-identical framing |
| `rotate-yaw.png` | ⚠ marginal | Same composition bug as `gizmo.png`/`scale-stretched.png` |
| everything else (`insert-placed`, `sketch-wall`, `fillet-rounded`, `gridstretch-before/after`, `delete-gone`, `seedtrunk-trunk`, `move-gizmo`, `walk-fixtures`) | **NOT YET VISUALLY CHECKED** | Do a full pass, don't assume clean |

**Net: at least 5 of 21 frames are unusable, 3 more fail the spec's own "element close-up" bar, ~9 unverified.
This is currently live and user-visible.**

### §RESUME steps for §THREAD 1
1. Re-verify the findings above yourself before acting — open each PNG fresh (pull via
   `git show origin/docs/hba-guide-rewrite:docs/img/modeller/<name>.png`).
2. Root cause is almost certainly in `modeller/tests/e2e_harness.js`'s `shotClip()`/`shotPts()`/`bboxScreen()`
   (bim-ootb PR #590, commit `346ac59`, now on `main`). Read that diff first.
3. Fix in a fresh bim-ootb worktree off `origin/main` (never edit `~/bim-ootb` directly — hook-blocked). Re-run
   the affected witness(es) and **open the resulting PNG and eyeball it** — don't just check exit code.
4. Recaptured frames go into `docs/img/modeller/*.png` on a fresh bim-compiler branch off
   `origin/docs/hba-guide-rewrite`. `mkdocs build --strict` = 0, PR, merge, redeploy via
   `scripts/safe_gh_deploy.sh` (never bare `mkdocs gh-deploy`) — the deploy guard blesses by **exact path**, a
   trailing-slash prefix does NOT match.

### §NON-INVENT — what NOT to do
Do not paper over a bad crop by hand-editing/cropping the PNG in an image tool without re-running the witness —
that's compositing, not capture. Fix the harness, re-run the witness, re-capture for real. Same principle
applies to §THREAD 2: do not fabricate a tilt-fix without re-deriving it from the real `rotation_x/rotation_y`
data — the `§ARC-YAW-ONLY` audit line exists precisely so nobody has to guess.

## §THREAD 1 ✅ DONE (2026-07-02) — both threads now closed
A concurrent bim-ootb session independently fixed the root cause (`e2e_harness.js` `shotClip`/`pick`/new
`frameElement`/`clearGround`, PR #608, commit `7d4f8223e` on the bim-compiler side) and committed the 8
recaptured frames directly to `docs/img/modeller/` (`cut-select`, `cut-open`, `gizmo`, `rotate-yaw`,
`scale-stretched`, `route-spine`, `route-run`, `sketch-profile`). Found this mid-session while independently
recapturing the same 8 frames myself (`~/bim-ootb/modeller/tests/e2e_shots/W-E2E-*`) — **eyeballed both sets**,
they're equivalently good/legible; reverted my redundant copies (`git checkout --`) rather than clobber
already-committed work with a second, arbitrary capture of the same fix.
**Full visual audit of all 21 §F2 frames + the SC ARC frame, done by actually opening every PNG (not trusting
witness-pass or PR text):**
- The 8 previously-broken frames: now legible real close-ups (wall selection visible for cut-select/cut-open,
  tight gizmo/yaw-ring/scale-handle close-ups with real wall+door context for gizmo/rotate-yaw/scale-stretched,
  a real L-shaped spine and swept run with status line `swept run #254 verify=true tris=20` for
  route-spine/route-run, a clean closed rectangle for sketch-profile).
- The 9 originally-unverified frames (`insert-placed`, `sketch-wall`, `fillet-rounded`, `gridstretch-before/
  after`, `delete-gone`, `seedtrunk-trunk`, `move-gizmo`, `walk-fixtures`): all legible. `insert-placed` /
  `delete-gone` are intentionally whole-building crops per PR #608's own design split ("whole-building-result
  frames are clean canvas crops") — not a defect, don't "fix" them into close-ups later.
- Also passed the guide text itself for step detail: Move/Scale/Rotate/Grid-Stretch/Delete previously had prose
  only (unlike every other tool section) — converted to the same numbered-step format as Insert/Sketch/Route/
  Cut/Fillet, content unchanged (just restructured), `mkdocs build --strict` still exit 0.
**Both §THREAD 1 and §THREAD 2 are now closed.**

## 🔎 2026-07-02 NIGHT — watchdog quality-review pass reopens this card (independent front-to-back re-read +
every one of the 22 images actually opened, no edits made)

**Overall the prose and on-ramp are genuinely solid** — one voice throughout, SVG diagram → workspace tour →
"first five minutes" walkthrough → tool sections in the right order, mkdocs nav/cross-links all consistent.
But the prior "all legible" call on `move-gizmo.png` doesn't hold up under a second, closer look, and there
are real coverage gaps against what's actually shipped now. Sized and assigned (per
[[feedback_model_allocation_mastermind_vs_execution]] — all of these are well-specified, no open design
question, **all Fable5**):

1. **`move-gizmo.png` is a composition regression, not "legible" as previously logged.** It's a wide whole-
   building shot with a barely-visible gizmo, while `gizmo.png`/`scale-stretched.png`/`rotate-yaw.png` right
   next to it in the same "Transform" section are all tight close-ups (the PR #608 fixed style). It wasn't in
   that recapture batch's list of 8 — looks like a leftover from the original broken-crop set that the prior
   pass's "all legible" sweep missed. **Fable5: recapture with the same harness fix used for its neighbors.**
2. **Coverage gap — Walk-All-Disciplines is entirely undocumented** (zero hits outside `archive/`/`internal/`
   across all of `docs/*.md`). Tracked jointly with the bim-ootb-side finding in
   `prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §NIGHT item 4. **Fable5: new subsection + screenshot.**
3. **Coverage gap — Grid-Stretch section never states hosted doors/windows ride along** (§STRETCH-RIDE, this
   session's own fix). Move and Delete both explicitly cover hosted-fill behavior; Grid-Stretch doesn't.
   **Fable5: one sentence.**
4. **`gridstretch-before.png`/`-after.png` are stylistically jarring** vs. every other frame — an abstract
   bare-grid panel with "A/B/1/2" labels, no app UI chrome, while every other frame shows the full Duplex in
   the real app. Confirmed via pixel diff they're real (not duplicates, 12% differ) but the size change reads
   as nearly imperceptible at guide scale. **Fable5: crop tighter or annotate the delta.**
5. **`seedtrunk-trunk.png` — the routed corridor trunk is easy to miss** against the dense forest of walked
   fixtures (thin white lines, low contrast). **Fable5: highlight color, or a tighter crop.**
6. **9 orphaned, unreferenced PNGs in `docs/img/modeller/`** — leftovers from an earlier naming convention,
   safe to delete: `cut-cut.png`, `delete-deleted.png`, `fillet-edges.png`, `gridstretch-stretched.png`,
   `insert-inserted.png`, `rotate-rotated.png`, `route-swept.png`, `scale-scaled.png`, `seedtrunk-popup.png`,
   `seedtrunk-routed.png`. **Fable5: `git rm`.**

Everything else (workspace-open, insert-catalog/placed, sketch-profile/wall, route-spine/run, cut-select/open,
fillet-edges2/rounded, samplecastle-arc-open, seedtrunk-entry) re-confirmed legible, correctly cropped, matches
its caption — no further action needed there. **This card stays open until items 1-6 land; archive only then.**

## 2026-07-09 — items 1/2/4/5/6 DONE, item 1 (orphans) already independently done, item 3 DEFERRED

Picked this card back up. Found `prompts/GUIDE_VISUAL_QUALITY.md` (uncommitted, same working tree) mid-flight:
a 2026-07-08 decision to swap the WHOLE guide's demo building Duplex→SampleCastle, Batch A/B dispatched to a
background agent in `/tmp/wt-viewer-rpr-port` (bim-ootb, branch touching `witness_e2e_move.js` etc. — idle, no
running process, but claimed territory). Batch A explicitly names `move-gizmo` — **item 3 is deliberately
DEFERRED to that lane, not done here**, to avoid duplicate/colliding recaptures (coordinate, don't collide, per
this card's own header). `gridstretch` is explicitly OUT of that lane's scope (kept isolated/synthetic, not
swapped) — so item 5 was safe to do here.

- **Item 6 (orphans)**: already done by another session (bim-compiler `620d8f7cc`, same 10 files) before I
  applied mine — no conflict, reconciled for free.
- **Item 2 (Grid-Stretch hosted-fill sentence)**: added — confirmed true first via `bonsai_gridmove.js`'s
  `§STRETCH-RIDE` (a hosted opening rides its wall, never divorces/scales, on grid-stretch too).
- **Item 4 (Walk-All-Disciplines undocumented)**: new "Walk ALL Disciplines" subsection added (after the
  walk-fixtures paragraph, before "One engine, two standards"), with a fresh real capture
  (`walk-all-disciplines.png` — Outliner "▶▶ Walk ALL Disciplines" row clicked for real, `window.__dwAllDone`
  awaited; Duplex result ACMV=10/ELEC=267/PLB=81/FP=166, 524 total, matches the on-screen Outliner readout).
- **Item 5 (gridstretch before/after mismatch)**: recaptured BOTH from the same session so they're internally
  consistent (full app chrome on both, not "after" chrome vs "before" bare panel). Used the existing tested
  `#b-clear`-first recipe (`witness_e2e_gridstretch.js`'s own proven X1-X6), not a real-Duplex-context variant —
  see `GUIDE_VISUAL_QUALITY.md`'s 2026-07-09 status entry for why (a no-clear attempt mis-picked and committed a
  stray `GEOM_MOVE` instead of `GEOM_GRID_MOVE`; root cause not chased, out of this card's scope, flagged there
  instead for whoever next touches grid-move arming).
- **Item 6 (seedtrunk-trunk low visibility)**: recaptured showing the ACTUAL routed trunk (5,546 segments; the
  previously-embedded image was honestly re-captioned by an earlier session as pre-route/"0 routed" but never
  re-shot). Hiding the ELEC fixtures via `Bonsai.setDiscVisible('ELEC', false)` had no visible effect (only 4 of
  presumably-more InstancedMesh buckets toggled — not chased further). Fixed the actual complaint instead by
  recolouring the trunk `LineSegments` hot-pink for the capture only (no op committed, no app-code change) —
  its default colour (`DW_COLOR.ELEC`, gold) is the same family as the ELEC fixture boxes, which is exactly why
  it read as low-contrast. An overhead/plan-view alternate was tried and rejected (lost full-building context
  and the status-line chrome without actually reading clearer).
- `mkdocs build --strict` — exit 0, no new broken refs.

**Card status (CORRECTED same session, see below): items 1/2/5 DONE. Items 4 and 6 RETRACTED — the screenshots
they added turned out to showcase two real, confirmed disc_walker.js/modeller.html bugs (fixtures placed outside
the building; walked-fixture rotation never rendered), not composition issues. Item 3 (move-gizmo) intentionally
left for the SampleCastle-swap lane — do not re-attempt here; check `GUIDE_VISUAL_QUALITY.md` for that lane's status.**

## 2026-07-09 later same day — items 4 and 6 RETRACTED: real placement/rotation bugs, not screenshot bugs

The user looked at the deployed `walk-all-disciplines.png` and said "MEP seem to be outside the building" —
confirmed numerically, not just visually: 65/267 (24%) of Duplex's walked ELEC fixtures land outside the real
building envelope via `disc_walker.js`'s `hostBind()` SIDE-mount branch (world-AABB-based wall "thickness" calc,
rotation-unaware). Separately, `modeller.html`'s `_renderDiscWalk()` never applies the computed per-fixture yaw
at all (translation-only instance matrix) — the "long boxes not formed in any piping" / "rotation not conveyed"
the user also spotted. Both are real, permanent (not mid-animation) bugs in the app, confirmed by direct code
read + live data probes, not screenshot artifacts. Per this card's own "fail hard, do not embed it" policy
(§THREAD 2, 2026-07-01): retracted both additions (`ef0cd7d6a` + `346d5356d`) — removed the Walk-All-Disciplines
subsection/image, reverted `seedtrunk-trunk.png`/caption to the prior honest "pre-route, 0 routed" state.
Redeployed + live-verified. Grid-Stretch's sentence + the gridstretch chrome-consistency fix (item 5) are
unaffected and stay.

**Full bug writeup, Java-precedent comparison, witness-suite blind-spot analysis, and next-session plan:**
`prompts/Modeller/DISC_Walker/RESUME_DISC_WALKER_ENVELOPE_BOUND.md`'s 2026-07-09 dated section — that is now the
canonical doc for this thread. Do not re-derive; do not re-attempt items 4/6's screenshots until that doc's §NEXT
items 3/4 (the actual code fixes, numeric-witness-gated, spec-first) land.

## 2026-08-07 — §3D-GRID-EDITOR ✅ SHIPPED (PR bim-compiler#70 + #71, both merged, live-verified) — user re-scoped this session to chase this ONE feature first, ahead of the broader stale-frame audit / room-move / item-drag brief

**Re-scope, verbatim intent:** user interrupted mid-session to prioritize a new "3D Grid Editor" ModellerGuide
subsection with real witness proof over the originally-dispatched stale-frame audit + room-move/item-drag work.
That broader brief (see the MISSION this session was given) is **NOT started** — this section covers ONLY the
grid-editor work; the rest is ⛔ carried to whoever picks this card up next, not abandoned.

### What shipped
- **New test** `modeller/tests/witness_e2e_gridmove_real.js` (bim-ootb, NOT yet upstreamed/committed there — it
  lives only in the ephemeral worktree `/tmp/wt-guide-recapture` this session used; **⛔ open item: push this
  test to bim-ootb** so it's not lost — see §NEXT below). Real-user E2E of the Grid-Stretch tool against
  Duplex's **actual loaded geometry** (not the existing synthetic `#b-clear` scratch-wall demo
  `witness_e2e_gridstretch.js` already covers, which stays in the guide as-is — deliberately not replaced,
  see GUIDE_VISUAL_QUALITY.md's own "arguably clearer uncluttered" note).
- **Final run: 8/8 § assertions green** (`/tmp/claude-1000/.../scratchpad/logs/witness_gridmove_real_FID106_run6.log`,
  not preserved past session end — rerun to reproduce, recipe below). Real numbers, not asserted-then-forgotten:
  - Real `pg.mouse` down→move→up on gridline "2" (world y=-6.80, wall106's own measured far edge) landed at
    **delta=0.5000 m** exactly.
  - Wall106's (`IfcWallStandardCase`, ground floor, real `rel_fills_host` host of a real `IfcDoor`) *rendered*
    Y-extent grew **2.920 m → 3.420 m** — matches the committed op's delta to <1cm, read off the live mesh
    post-commit, not assumed from the drag input.
  - Hosted door rode **0.273 m** (not 0.500 m) — §STRETCH-RIDE's anchored-proportional mapping, asserted against
    the door's OWN rider row (`GEOM_MOVE {parent:doorFid, induced:'hosted-by'}`), not just "did something move."
  - **One** `GEOM_GRID_MOVE` + **9** induced rider `GEOM_MOVE`s landed as one gesture group (`opLen 196→206`),
    `verifyChain=true`, one `undoToCursor` scrub restored cursor AND wall extent byte-exact.
  - §SCALE_CHECK_FIX drag-session cache-once line cited from the log (not re-profiled) per the re-scope's
    "cite the log line, don't profile" instruction.
- **Two new real captures** embedded in `docs/ModellerGuide.md` under a new "On a real building, not a diagram"
  subsection (Transform → Grid-Stretch): `docs/img/modeller/grid-editor-before.png` / `-after.png`. Real
  interior view (Duplex ground floor near the stair), NOT the drag-camera (see §CAMERA-LESSON below) — a
  separate `closeCam` placement used only for the two still frames, before/after the live gesture.
- `mkdocs build --strict` exit 0. **Live, verified**: both images 200,
  `curl .../ModellerGuide/ | grep "On a real building"` finds the new section text on the deployed page.

### §CAMERA-LESSON (real finding, worth keeping — chased numerically, not by re-eyeballing)
Every "dolly in on the wall from the whole-building fit direction" attempt (the harness's own `frameElement()`,
proven elsewhere in this guide) and a straight-overhead plan view both rendered a **flat, textureless plane
filling the frame** — traced to Duplex's sloped roof (z≈6.0–6.6): both camera strategies approached or looked
through it at close range. Fix: pick a **ground-floor** wall (wall106, not the first-tried wall98 which is
Level-1/z:3.1-6.0) so the grid line (always z=0, `bonsai_grid.js`) and the wall are vertically co-located, AND
use a manually-placed **interior** camera (`closeCam`: 2.2m into the room, at the wall's own mid-height) for
the STILL SHOTS only. The live drag gesture itself still needs `frameElement()`'s camera (or any camera that
keeps the ground plane, z=0, on-screen) — the app's pointerdown/pointermove raycast a z=0 plane unconditionally
regardless of which floor the dragged wall is on, so a close interior camera (whose target sits off the ground
plane) can arm Move-Grid but the down/up screen points never land on a gridline and the gesture silently no-ops
(`opLen` unchanged) — measured twice before finding this. Sequence that works: frameElement's camera for
G3/G4 (the real gesture) → reposition to closeCam only for the "before"/"after" screenshots, taken with no
gesture live.

### §UNRELATED BLOCKER found + fixed en route: master was NOT a gh-pages superset
`scripts/safe_gh_deploy.sh` aborted the first deploy attempt — gh-pages (last deployed from `fable/meshdb-livewire`
@ `1afdb06e5`) has `JKR_SKATA.md` + `OFFLINE_INSTALL_GUIDE.md` + a richer `IFC_ExportGuide.md` that `master` never
had (pre-existing gap, unrelated to this session's change). Per the deploy guard's own documented resolution
("become the superset, never force"): cherry-picked the 5 real already-authored commits that account for the gap
from `fable/meshdb-livewire` onto a fresh branch off master (PR bim-compiler#71, merged) — no invented content,
no app-code changes, just docs + 2 new standalone python export-helper scripts that shipped alongside the
original IFC_ExportGuide commit. Guard now PASSes; **if the next docs deploy still finds it merged, don't
re-chase this — it's closed.**

### §NEXT — what a resuming session should do
1. **⛔ Push `witness_e2e_gridmove_real.js` to bim-ootb** (currently only in an ephemeral worktree,
   `/tmp/wt-guide-recapture`, branch is a detached HEAD off `origin/main` — will be lost if that worktree is
   pruned). Recipe to reproduce if the worktree is already gone: open Duplex, wait for `window.__arcGuidByFid`
   to populate (poll, not a fixed sleep — see §CAMERA-LESSON commit for why), measure wall106
   (`IfcWallStandardCase`, y:[-9.73,-6.80], ground floor, hosts a door), `Bonsai.grid.define({xs:[1.5,3.5],
   ys:[-9.73,-6.80], xlabels:['A','B'], ylabels:['1','2']})`, `frameElement(106, 0.22)`, click `#b-gridmove`,
   real mouse drag on gridline "2" by +0.5m, assert per the numbers above.
2. **The ORIGINAL mission's tasks 1-4 are still fully open** (stale-frame audit of the 2026-07-03/07-07/07-09
   batch, coverage cross-check, room-move + item-drag guide sections) — this session did NOT reach them. Not
   ⛔-blocked on anything, just not started; pick up from the mission brief's own task list.
3. Prune `/tmp/wt-guide-recapture` and `/tmp/wt-guide-land` if still present and clean/fully-pushed by the time
   you read this (this session's own closeout should have done it — if not, verify before removing, per the
   worktree-hygiene standing rule).

### §AUDIT (partial — one-look verdicts only, NO recaptures executed this session; time ran out after the grid-editor lane above)
Opened the highest-risk stale candidates directly (real eyes, per the mission's audit step) rather than
inferring purely from capture date:
- **`cut-select.png` (2026-07-03) — ❌ STALE, recommend recapture.** Real close-up of a wall corner with a
  window: the glazing renders as a flat pale opaque panel, no visible see-through/depth — matches the
  PRE-glass-parity-fix look (fix landed 2026-07-12), not the transparent glass `glass-window-transparent.png`
  (07-11) or the guide's own "Realistic glass" section show. `cut-open.png` is the same wall/window context —
  same verdict, not opened separately (would be redundant).
- **`move-gizmo.png` (2026-07-08) — ❌ STALE, recommend recapture.** Still the wide whole-building shot flagged
  as a "composition regression" back on 2026-07-02 (its neighbours `gizmo.png`/`scale-stretched.png`/
  `rotate-yaw.png` got BOTH the close-up harness fix AND the glass-parity recapture on 07-13; `move-gizmo` was
  explicitly deferred to the later-retired SampleCastle-swap lane and never circled back). Fix pattern is
  proven and sitting right next to it in the same guide section — mirror whatever `witness_e2e_move.js`
  capture recipe produced `gizmo.png`'s close-up framing.
- **`insert-catalog.png` (2026-07-09) — borderline, NOT recaptured.** SampleCastle backdrop shows small window
  panes that may or may not be pre-fix (hard to call at that render distance/angle), but the caption's subject
  is the Insert catalog panel + ghost preview, not the glass — low material impact either way. Left as-is,
  disclosed rather than silently skipped.
- **`fillet-edges2/rounded`, `route-run/spine`, `sketch-profile/wall/dims-square/dims-angled/weld/circle/
  circle-extruded` (07-03/07-07) — ✅ OK, not recaptured, none needed.** All use `t.clearGround()` /
  `#b-clear` per `witness_e2e_*.js` (confirmed by reading the scripts, not assumed) — synthetic scratch
  geometry, no real building glass ever in frame, so the glass-parity fix date is irrelevant to these.
- **`workspace-open.png` (07-08, user's own manual capture)** — not opened this session ("replace only if
  clearly stale" per the mission; no evidence gathered either way, genuinely unknown, not ⛔ — just unchecked).
- **`snap-to-geometry.png`, `multiselect-marquee.png`, `gridstretch-before/after.png`** — confirmed out of
  scope per the mission brief (synthetic-by-design), untouched.
- **Orphan found, not cleaned up:** `docs/img/modeller/sketch-extruded.png` exists on disk but is NOT
  referenced anywhere in `ModellerGuide.md` (grepped) — a leftover from the same naming-convention cleanup
  the 2026-07-09 pass did for 9 other orphans. Cheap `git rm` for whoever's next, not done here (out of the
  grid-editor lane's diff).

### §NOT STARTED (⛔ — explicit, not silently dropped)
- Recapturing `cut-select.png`/`cut-open.png`/`move-gizmo.png` (verdicts above, fix pattern known, not executed).
- Coverage cross-check of the full module list in the original mission brief against guide sections (only
  room-move/item-drag were confirmed gaps before this session started; the fuller sweep wasn't run).
- **Room-move (`bonsai_roommove.js`) and item-drag (`bonsai_itemdrag.js`) new guide sections** — the mission's
  other named gap, spec at `prompts/Modeller/ROOM_MOVE_AND_ITEM_DRAG_SPEC.md`, code shipped on bim-ootb
  `origin/main` per the dispatching session's own witnesses (`witness_room_move.js` 10/10,
  `witness_room_move_roundtrip.js` 7/7, `witness_item_drag_gate.js` 9/9, all green at tip `a06223e`) — guide
  text + captures not written.

## 2026-08-07 (round 2) — stale-frame recapture + Grid-Stretch behavior facts + roof witness — ✅/⛔ table

Picked up the round-1 handoff's §NOT STARTED list (items 1-3 of the round-2 mission). Room-move/item-drag
(§NOT STARTED item 4, mission task 6) was **not reached** — time went to a real regression found in item 1 and
a from-scratch roof witness in item 3; both took longer than a straight recapture. Leaving item 4 ⛔ for the
next session, same spec pointer as above, code+witnesses already shipped and green.

| Item | Verdict | Evidence |
|---|---|---|
| `move-gizmo.png` recapture | ✅ DONE | Ported `witness_e2e_move.js` (bim-ootb) from a standalone script to `e2e_harness.js` (same rig as `witness_e2e_rotate.js`/`witness_e2e_scale.js`) so it gets a real `t.frameElement`+`t.shotClip` close-up. Found + fixed 2 real issues en route: (a) `pick({prefer:'wall'})` landed on a genuinely TILTED insert (Duplex fid69, `IfcWindow` with `placement.rotY=90°`) that a size-only heuristic can't detect — a gizmo's per-axis handle is LOCAL to the insert (same as `scale.js`'s documented `scaleX` behavior), so a world-axis drag on it produced an unrecorded 1.2m off-axis render shift; added `pick({axisSafe:true})` filtering on near-zero `rotX`/`rotY`. (b) `t.drag()`'s screen-linear interpolation drifts off a true world-axis line under perspective (measured `dy=-0.095m` on one run) — switched to per-point world-axis projection, matching `rotate.js`/`scale.js`'s existing pattern. Final clean run: 7/7 green, `delta=[1.1,0,0]` axis-pure. bim-ootb PR #1245 merged (CI e2e-tests green — confirms local flakiness below was environment, not logic). New `docs/img/modeller/move-gizmo.png` live. |
| `cut-select.png`/`cut-open.png` recapture | ⛔ **found a real regression, did not embed** | Re-ran `witness_e2e_cut.js` (unmodified logic) twice — both times it honestly reproduces the ORIGINAL 2026-07-01 bug (flat gray slab, no wall/window/selection visible), not the currently-live "wall+window+door" frame. Root cause, numerically confirmed: of Duplex's "wallish" candidates, **zero** currently pass the production cut-eligibility gate (`Bonsai._insertCutBox`, `bonsai_kernel.js:152-169` — requires every vertex of the fold to lie on an axis-aligned box's face planes). Every window/door-bearing wall's fold has extra opening-reveal geometry, so it's honestly refused as non-box; the only 2 elements that pass are a windowless foundation wall (fid81, 8.8×0.42×1.25m, T/FDN layer) and a flat floor slab (fid32). A fresh capture would DOWNGRADE the guide vs. what's already live. Per the mission's fail-hard doctrine: left `cut-select.png`/`cut-open.png` **untouched** (still the pre-existing, better images). This needs an app-code fix (either `_insertCutBox` learning to subtract known opening geometry, or a different cut-target selection strategy) — out of a guide-screenshot lane's scope. ⛔ open question for whoever owns `bonsai_kernel.js`: should the cut gate accept a wall-with-openings by cutting through its already-carved fold, or should Duplex's DB be re-checked for why the box gate is now stricter than it used to be? |
| Grid-Stretch behavior facts | ✅ DONE | Added a 4-item plain-language list to the "On a real building, not a diagram" subsection (wall recompose classification / ATTACH+EDGE+SPAN, `§GRAB-LOCALITY` blast-radius bounding, hosted-filling ride, furniture/fixture exclusion) — cited straight from the Watchdog's code-review facts in the mission brief, no new claims. bim-compiler PR #73 merged. |
| Roof witness + guide sentence | ✅ DONE | Duplex has **zero** `IfcRoof` rows (checked `elements_meta`) — SampleHouse is the only resident with a real, axis-aligned one (fid 20, rot=0, X-span 14.8410m). New `witness_e2e_gridmove_roof.js` (bim-ootb): grid lines authored at the roof's own measured X edges (SPAN classification, same shape as the wall-SPAN case `witness_e2e_gridmove_real.js` already proves), real mouse drag +0.5000m on the far line. Result: roof's rendered X-extent grew **14.8410m → 15.3410m**, exactly +0.5000m, near edge unchanged (anchored), `recomposed=8` (`§STRETCH-RIDE riders=7`), undo byte-exact. 8/8 green, reproduced twice. Guide sentence + a real capture (`grid-editor-roof.png` — the barrel-vault roof visibly overhanging past its wall, status line reading the exact numbers) added right after the existing Duplex wall-drag case. bim-ootb PR #1245 + bim-compiler PR #73, both merged. |
| Deploy | ✅ DONE | `mkdocs build --strict` exit 0. First deploy attempt soft-aborted on `move-gizmo.png` shrinking 563671B→423928B (a real, intentional close-up recrop, not a wipe) — re-ran with `ALLOW_SHRINK=1 paths="img/modeller/move-gizmo.png"` per the guard's own documented escape hatch. Guard PASS, published, all 7 canaries 200. Live-verified past CDN propagation lag: `move-gizmo.png` (423928B), `grid-editor-roof.png` (200), and the new guide text (`recomposed=8`, `Only the grabbed bay moves`, `roof stretched 0.5 m`) all confirmed live at `https://red1oon.github.io/BIMCompiler/`. |
| Room-move / item-drag guide sections | ⛔ **not reached** | Same spec/witness pointers as round 1's §NOT STARTED entry above — code + witnesses already shipped and green on bim-ootb `origin/main`, only the guide text/captures are missing. Next session: same recipe pattern as this round's roof section (find real element → `pg.mouse` real drag → `§`-log the numbers → close-up capture → cite in guide). |

**Environment note (not a code finding, but explains this session's repeated retries):** late in this session
`uptime` load average hit ~29 (5 concurrent Claude Code sessions observed via `ps aux`), and headless Chrome
under `--use-angle=swiftshader` started crashing mid-run ("Target closed" / "detached Frame") — confirmed
NOT caused by this session's changes: `witness_e2e_rotate.js` (untouched all session) crashed identically
under the same load. bim-ootb's own CI (`e2e-tests`, a clean runner) came back green on the exact same
commits, closing the loop. If a future session sees the same crash signature on THIS shared dev machine, check
`uptime`/`ps aux` for concurrent sessions before assuming a regression.

**Worktrees used this round:** `/tmp/wt-guide-recapture` (bim-ootb, branch `fix/guide-recapture-batch2`, now
merged — safe to prune) and `/tmp/wt-docs-two-apps` (bim-compiler, repurposed from an already-clean/unrelated
worktree onto branch `docs/guide-recapture-batch2`, now merged — safe to prune). Both pruned at session close
per the worktree-hygiene standing rule (checked: 0 ahead, 0 dirty, not live-occupied by another session, before
removing).

## 2026-08-07 (round 3) — cut-gate root-caused to architecture-scale (⛔ stop, not a fix), room-move/item-drag guide sections landed

Picked up the round-2 handoff's two open items: the cut-gate regression and the room-move/item-drag guide
gap. This session was explicitly authorized to touch bim-ootb app code (unlike round 1/2) — used that to
root-cause the cut gate properly instead of re-documenting the same symptom, then made the stop/continue
call the mission itself specified for an architecture-scale finding.

| Task | Verdict | Evidence |
|---|---|---|
| 1. Cut-gate root-cause | ⛔ **root-caused, NOT a bug, architecture-scale — stopping per the mission's own criterion** | Not a regression in the accidental-bug sense: `Bonsai._insertCutBox` (`bonsai_kernel.js:152`, PR #608/`afa644b`, 2026-07-01) was deliberately built box-only — "rotated/non-box inserts return null … a measured future-work boundary, never an invented shape" (its own commit message). It predates two LATER, separately-good features that together starved its usable surface: §REAL-GEOM ("no silent box fallback", 2026-07-02) made real per-element mesh the default render for virtually every insert, and §LOD400-LAYERS (PR #1096, 2026-07-30) gave Duplex's multi-layer walls genuine compound multi-slab geometry ("the Duplex party wall … rendered as one 14-triangle envelope box presented as real geometry — the exact fallback §LOD400-ENVELOPE forbids"). Neither commit revisited the cut path. Measured fresh this session (`/tmp/wt-cut-diag`, `diag_cut_gate.js`, log saved): of 47 Duplex "wallish" GEOM_INSERT candidates, exactly **2 are cuttable** (fid77/fid79, `sz=4.20×0.43×1.25`, `tris=12` — plain envelope boxes with no registered real geometry) and **45 are refused** — every refused one has real multi-triangle geometry (`tris=40..424`, never 12). This corroborates round 2's independent finding (fid81 windowless foundation wall + floor slab fid32) almost exactly — same conclusion via a different fid seed order. **Why this stops here rather than getting fixed:** the worker's B-rep model is 1-box-per-feature (`bonsai_kernel_worker.js` `buildSolids` seedBoxes / `solids.get(op.parent)` — a single shape per parent id). A wall-with-window-reveal's real mesh is a box-minus-notch (not decomposable into stacked axis-aligned boxes); a multi-layer wall's real mesh IS decomposable per-layer (`component_geometry_layers(geometry_hash, layer_seq, face_start, face_count)` — each layer's own AABB is derivable from its face range) but making the cut path handle even that requires N seed boxes per feature, N boolean cuts, and an N-solid merge back into one rendered mesh — a structural change to the worker's solids-map keying, not a gate tweak. Combined with the window-reveal case (which needs real mesh-to-B-rep sewing, not box decomposition), this is the mission's own named stop condition: "requires general CSG on arbitrary meshes and the existing cut path is box-only by construction." **⛔ Architecture question for whoever owns `bonsai_kernel_worker.js` next:** is it worth building N-box-per-feature CSG (covers layered walls, not window reveals) as an incremental step, or does cut need real mesh-to-B-rep sewing to matter for Duplex at all? Not decided here — no code changed on this task, spec-first discipline held (no half-honest cut built).|
| 2. Recapture `cut-select.png`/`cut-open.png` | ⛔ **stays blocked** | Dependent on Task 1; Task 1 did not land a fix. Images left untouched (still round-1/2's pre-existing state, no re-attempt, no downgrade). |
| 3. Room Move + Item Drag guide sections | ✅ **DONE** | Added `### Room Move` / `### Item Drag` to `docs/ModellerGuide.md` (bim-compiler PR #75, merged). Both engine modules (`bonsai_roommove.js`/`bonsai_itemdrag.js`) are shipped on bim-ootb `origin/main` (PR #1224/#1245) and proven by pure-node witnesses re-run fresh this session (logs saved): `witness_room_move.js` **10/10** (members=16 via rel_contained_in_space=12 + derived-footprint=4, T6 rigid-translation maxErr=2.38e-7m), `witness_room_move_roundtrip.js` **7/7** (R2 roundtrip maxResidual=0.000000mm over 16 members), `witness_item_drag_gate.js` **9/9** (G1/G2 WalkerGapError session refusal with zero op-log rows, G4 collision refusal naming the conflicting fids, G7 valid drop = exactly one `GEOM_MOVE` with a real-wall-face `snappedPos`). **No screenshot** — grepped `modeller.html` end to end: both files are `<script>`-loaded (lines 286-287) and NOTHING else in the app calls `window.Bonsai.roommove`/`itemdrag` — no button, no Outliner grab gesture, no canvas pointer listener. There is no clickable/draggable UI surface today, so no real user interaction exists to capture; fabricating one would violate the no-invent rule. Sections are marked inline "*(engine-ready — not yet on the toolbar)*" so a reader isn't misled into hunting for a control that doesn't exist. This is the exact, named blocker the mission anticipated for this case.|
| 4. Land + deploy + record | ✅ **DONE** | `mkdocs build --strict` exit 0 (worktree `/tmp/wt-guide-roommove`, fresh off `origin/master`). bim-compiler PR #75 merged (`0403d80d2`). `scripts/safe_gh_deploy.sh`: guard PASS (275→275 files, within tolerance, no shrink/delete), published, all 7 canaries 200. Live-verified past propagation lag by polling `https://red1oon.github.io/BIMCompiler/ModellerGuide/` until it actually served the new text: "Room Move", "Item Drag", "GEOM_ROOM_MOVE", "not yet on the toolbar" all present. This section itself is the dated record (per this doc's own append-only convention).|

**Worktrees used this round:** `/tmp/wt-cut-diag` (bim-ootb, detached at `origin/main`, diagnostic-only, no
commits — safe to remove outright) and `/tmp/wt-guide-roommove` (bim-compiler, branch
`docs/roommove-itemdrag-guide`, merged via #75 — safe to prune).

## 2026-08-07 (round 4) — Room Move + Item Drag UI WIRED (bim-ootb PR #1247), guide's "not yet on the toolbar" markers removed, real screenshots landed

Picked up round 3's exact named blocker (task 3 above: "no clickable/draggable UI surface today"). This
session's mission was the UI wiring itself, so did that first (bim-ootb), then closed the guide out to match.

| Task | Verdict | Evidence |
|---|---|---|
| 1. Wire Room Move into the UI | ✅ **DONE** | Grab target = a new **⛶** glyph on the Outliner's room node (spec §2.1 "implementer's choice" — an `IfcSpace` is never `GEOM_INSERT`-seeded, confirmed by grep, so there is nothing to raycast-pick in the 3D canvas; the Outliner is the only real grab target). `bom_tree.js`/`bom_tree_outliner.js` now carry the room's real IfcSpace guid through to the render node (storey-scoped, extracted not invented — the guid was already read off `spatial_structure`, just discarded before this session). Drag continues on the canvas ground plane, mirroring `bonsai_gridmove.js`'s arm→preview→commit structure exactly; grab happens via the Outliner click rather than a toolbar button (the op stays UI-agnostic per spec). One signed `GEOM_ROOM_MOVE` per release; refusals (§2.7 — bad guid, zero-member room) surface via the status bar, never swallowed.|
| 2. Wire Item Drag into the UI | ✅ **DONE** | Dedicated `#b-itemdrag` toolbar button (mirrors `bonsai_gridmove.js`'s arm/cancel pattern) — deliberately NOT folded into the existing `#b-move` gizmo tool, because Move is ungated axis-constrained direct manipulation (already shipped, W-BONSAI-MOVE) while Item Drag needs a genuinely different contract (resolver-gated session start, collision/host `canDropAt` validation, snap-back on refusal); mixing them would have silently changed Move's own behavior. Session start gated by the real placement resolver (`WalkerGapError` = the item never lifts). Real, load-bearing finding made fixing this: the pointermove handler originally raycast against the world z=0 ground plane regardless of the grabbed item's height — correct for a floor item, wrong for a WALL/CEILING-hosted one (a sink at z≈1.3m does not share (x,y) with whatever the SAME screen pixel hits at z=0 unless the camera is dead top-down). Fixed to raycast a horizontal plane at the item's own pre-drag height. Both new modes added to `inSelectCtx()`'s exclusion list so the generic canvas select/marquee handlers don't double-fire during an armed drag — the exact collision risk this mission's own brief flagged on this shared pointer surface.|
| 3. New E2E witnesses (real pointer input) | ✅ **DONE** | `witness_e2e_roommove_ui.js` **9/9** (real Duplex): a real click on a real ⛶ glyph arms a non-empty member session; a real mouse down→move→move→up on the canvas commits exactly one `GEOM_ROOM_MOVE`, dz=0; the committed member list is byte-identical to the grab-time session; a real member's rendered AABB centre shifted by exactly the committed delta; one scrub undo restores it exactly. `witness_e2e_itemdrag_ui.js` **8/8** (real Duplex), three real scenarios: (A) a real Drag-Item arm + real canvas pick on already-placed content refuses cleanly (zero ops) — this is §3.2's own anticipated v1 outcome (Q5, resolved against live code in `bonsai_itemdrag.js`'s own header): no already-committed element carries a UI-recoverable product hint today, since the identity rides only on a transient `_rw`/`_dw` sidecar object, never persisted to `kernel_ops`; (B) a grab via a caller-held hint (the only honest way to reach the MATCH path in a browser today, same reasoning the pure-node witness uses) + a real drag to a wall face found by scanning with the engine's own `canDropAt()` as the oracle commits one `GEOM_MOVE`, the dragged mesh's rendered centre landing on the exact committed delta; (C) the same grab dropped onto another real element's box refuses the commit and leaves the mesh exactly where it started. Regression sweep green on the same shared canvas pointer surface: `witness_e2e_gridmove_real.js` 8/8, `witness_arc_editable.js` 10/10. Pure-node engine witnesses re-confirmed unaffected: `witness_room_move.js` 10/10, `witness_room_move_roundtrip.js` 7/7, `witness_item_drag_gate.js` 9/9. All logs saved, read before this record was written.|
| 4. bim-ootb PR + merge | ✅ **DONE** | PR bim-ootb#1247, `feat/roommove-itemdrag-ui` → `main`, auto-merge armed (`gh pr merge --auto --squash`) and confirmed merged before starting the guide half.|
| 5. Guide text — remove "not yet on the toolbar", add real navigation steps | ✅ **DONE** | `docs/ModellerGuide.md` `### Room Move` / `### Item Drag`: dropped the `*(engine-ready — not yet on the toolbar)*` marker from both headings, added numbered step-by-step navigation matching the UI actually built (Outliner ⛶ glyph for Room Move; **Drag Item** toolbar button for Item Drag), and a short note on Item Drag explaining WHY a plain pick refuses on today's data (the Q5 finding above) rather than leaving that as an unexplained gap. Cited both new E2E witnesses alongside the existing pure-node ones.|
| 6. Real captures | ✅ **DONE** | Two new images, both 2×DPR, 0 console errors (`NO-ERROR` assertion green in the witness runs that produced them), real Duplex, real pointer sequences — captured via a small `capture_guide_roommove_itemdrag.js` utility (NOT the audited witnesses; their own screenshots inherited whatever camera state `#b-fit` happened to leave, a steep close roof-corner crop, legible for nothing — one-look protocol caught this on the first pass, one recapture with deliberate `frameElement` framing fixed it). `docs/img/modeller/room-move.png` — the Outliner's ⛶ next to room "A101" grabbed, live drag status line visible. `docs/img/modeller/item-drag.png` — Drag Item armed, live "valid drop — release to commit" status line. Real, honest finding kept out of the embedded captions to avoid a tangent, logged here instead: committing even a small (~0.1m) room-move or a cross-room item-drop on this particular Duplex furniture layout reliably trips the (separate, already-shipped) conformity gate — tried 5 different rooms across 2 delta sizes, all clashed — because this floor plan's furniture already sits close to its walls; this is the gate doing its job, not a defect in Room Move/Item Drag, and out of this task's scope to tune.|
| 7. Build + verify | ✅ **DONE** | `mkdocs build --strict` exit 0, no new broken refs/anchors (checked the build log specifically for `ModellerGuide`/`room-move`/`item-drag` — none). Both PNGs confirmed present under `site/img/modeller/` and referenced from the built `ModellerGuide/index.html`.|

**Net: the round-3 blocker is closed for real** — Room Move and Item Drag are now on the toolbar/Outliner,
proven end-to-end with real pointer input, and the guide shows the real UI instead of describing a feature
with no click-path.

**Worktrees used this round:** `/tmp/wt-guide-roommove` (bim-ootb, branch `feat/roommove-itemdrag-ui`,
merged via bim-ootb#1247 — safe to prune) and `/tmp/wt-guide-roommove-docs` (bim-compiler, branch
`docs/roommove-itemdrag-toolbar` — prune after this PR merges).
