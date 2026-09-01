<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# RESUME — film review handoff, 2026-09-02

```
# ⚠ DO NOT REMOVE
SCOPE: the open items from the 2026-09-01/02 film session. Read §PREMISE-CHECK FIRST — the top
item is one where doing exactly what was asked would REGRESS two fixed bugs, and the user has not
yet been given that correction in a form they acted on. Verification here is `§`-tagged numbers,
never screenshots (CLAUDE.md FUNDAMENTAL LAW). Read the log after every run. Honour until DONE.
```

**How this session ended:** the user asked for a fresh session to take over. Nothing below is
half-built — the items are specced, measured or diagnosed, and each says which.

---

## §PREMISE-CHECK — the camera-aim ask, and why a literal revert is the wrong move

**User, 2026-09-02:** *"I prefer the previous (before yesterday's changes) as it follows path
direction. I am not sure which is which but can we revert to before such changes yesterday? What
will be the remaining influence on cam angle then?"* and earlier: *"its best to leave alone its
pointing along its path as more intutive when pathing and user change of head at intended better
angles is all needed, to stay simple and predictable."*

**⚠ Reverting yesterday's changes does NOT deliver path-following. It restores two fixed defects.**
Yesterday (2026-09-01) touched aim twice, and BOTH reduce camera movement:
- **#1597 §CPE_CORR_BRANCH** — fixed a **110.44°** single-frame snap caused by a 2π branch flip in
  `_cpeCorrDirBlend`. Reverting reinstates the snap.
- **#1598 §CPE_AIM_DEPTH_FREEZE** — froze the blend-from gaze at correction-window edges; in-window
  max step **13.114 → 7.791 deg/sample (−41%)**, jerk 2.387 → 0.841. Reverting reinstates the wobble.

**The thing that actually deviates from path direction is `§CPE_AIM_DEPTH`, which is OLDER** — it
became the SOLE exception to path-follow on 2026-08-14 (`§CPE_AIM_SIMPLIFY`, PR #1344), when
`§CPE_AIM_DENSITY` was retired outright. Its trigger is a forward raycast: when clearance ahead is
under 3-8 m it turns toward depth. Verified firing in the 2026-09-01 measurements: 28/91 probes,
turning the gaze **83.45°**.

**So the real ask is: retire `§CPE_AIM_DEPTH` too, leaving pure path-follow.** Do NOT do this as a
silent revert — it is a POLICY change and it has a known cost: depth exists for the dead-end
"nose against the wall" case, measured as still firing. Spec it, name what is lost, then ship.

**What would still influence the camera angle afterwards (the user's own question, answered from
the code — re-verify before relying on it):**
1. **Path-follow** — the walk's own direction. Becomes the only automatic rule.
2. **`§CPE_AIM_PIN`** — a pinned band's Voronoi zone overrides path-follow outright. This is the
   user's own authored head-turn and is exactly what they said they want to keep.
3. **The authored correction window** — ramp/hold/decay, with §CPE_CORR_BRANCH + §CPE_AIM_DEPTH_FREEZE
   making it fixed-to-fixed. This is the "some meters ahead and behind to hold the angle and to ease
   between paths beyond" the user described; it already exists and MEASURES 33.4% window reach
   against an authored 34%.
4. **The dive-in and the closing orbit beats** — beyond the first/last stick. **User: these have
   their own orbit and facing set, are "perfectly fine and must remain undisturbed."** Do not touch
   `_cinemaPathPlan`'s beat framing.

---

## §MEP_SYNTHETIC_PALETTE — better colour rules where the model has no material names

**User, 2026-09-02:** *"On Hospital or any building having zero usable material_name, can the
synthetic colouring be more MEP standard? Ie certain piping has diff coluring that is impressive as
i see in other apps movies… All i want is minimalist better coluring surface rules."*

**MEASURED, do not re-derive (2026-09-01):**
- Hospital `material_name` = **6,664 rows, 100% `≈`-prefixed synthetic colour approximations**
  (`≈ Grey`, `≈ Off-White`) — useless as material identity. Clinic 16,071, same shape. Terminal by
  contrast is **48,428/48,428 real names, 41 distinct, zero `≈`**.
- Because of this `§CPE_MATERIAL_KEY` (PR #1595) is a **proven NO-OP on Hospital** —
  `elements_changed=0`. It is NOT the cause of any Hospital appearance change.
- `TRIPLANAR_MAT` has only **three texture sets**: concrete, plaster, metal.

**So the lane is: a DISCIPLINE/SYSTEM-keyed colour rule for models with no usable names.** The data
that exists to key on is `discipline`, `ifc_class`, and element/system name text — not material.
Authored presentation is IN SCOPE (the user has ruled this twice), but the KEY must be extracted,
never the assignment invented per element.

**Prior art to reuse, not re-invent:** `§SUNGLASS` (`tools.js:614-775`) already has a 100-tick dial
with discipline bands (ticks 56-65) and, as of PR #1594, the rule that ordinal groupings get a ramp
and categorical groupings get distinct hues. An MEP-standard palette is a new categorical table in
that existing structure, not a new mechanism.

**Witness must show it is minimalist, not just colourful:** assert the number of distinct hues
actually used, per building, and that each maps to a named discipline/system class. A palette that
needs 40 hues to be readable has failed the "minimalist" requirement the user stated.

---

## §NON_DIRECTIONAL_FILL — the term the user asked about, and the real cause of the darker MEP

**User, 2026-09-02:** *"Thus can solve non directional fill which i am not sure what it means."**

**Plain answer to give them:** "non-directional fill" is light arriving from everywhere at once —
the ambient term plus the sky dome — as opposed to the sun, which arrives from one direction. It is
what stops the shadowed side of a wall from going pure black. **It is a LIGHTING quantity, not a
colour one, so better colour rules do not "solve" it** — but they do reduce how much the film has to
rely on lighting for readability, which is the useful half of the user's instinct.

**The darker MEP is v1119, not the material work.** `§WALL_SIDE_AND_LIGHT_FLOOR` (PR #1601) cut
**ambient 0.785 → 0.386 and hemisphere 1.257 → 0.617** (joint k=0.491) to make sun-facing and
away-facing walls differ. Measured effect: away-face irradiance 1.756 → 0.966. Interiors were
protected to a measured floor (retention mean 0.822 / p25 0.833) and the target contrast was
CLAMPED at that floor — a declared conflict, already documented. If the user wants MEP lighter, that
is a knob with a stated trade, not a bug.

---

## §OPEN — smaller items, each with its evidence

1. **PR #1602 is MERGED** (`d37eb109` on `origin/main`, 2026-09-01T12:36:55Z) — the CLI silent bake
   plus `§NIGHT_BAKE_POOL`. So `cli_silent_bake.js` is now at the bim-ootb repo root, and the perf
   fix is live for the interactive Alt+C bake too, since it is gated on `A._maxqActive` (any bake,
   not headless-only). **⚠ The interactive gain is PREDICTED, never measured** — headless went
   26.4 → 1.27 s/frame, and the user's own bake was 2.26 s/frame before. Measuring one real Alt+C
   bake against that 2.26 baseline is a bounded, high-value task and the user cares about it
   ("it's bad bake if far above 2 hrs").
2. **`§CPE_PIE_HOLD` contradicts its own documentation.** The full Hospital bake logged
   `heldFrames=283/2027 (14%)`, but `CINEMA_PATH_EDITOR.md` asserts the hold will NOT fire on
   Hospital because Finisher ops run to the last day ("that is correct, not a bug"). One of the two
   is wrong. Settle it and fix whichever it is — an assertion in the file that measurement disagrees
   with is exactly what §0a warns about.
3. **Local vs OCI DB divergence — user-reported, unverified.** The local
   `buildings/HospitalAjaibPath.db` renders green solar panels; the OCI-served copy reportedly does
   not. User: *"indicate diff between local and OCI which should not be."* Needs a checksum/row
   comparison to say which is stale. See `project_split_db_live_vs_probe_landmine.md`.
4. **Saved-path workflow is SETTLED — do not re-open.** User, 2026-09-02: *"just saved a DB first
   with a path in it, and that is it. No need of passing argument. Simple. Agreed."* The DB's
   `cinema_path` table is the default source; `--plan` / `--override` exist but are not the path the
   user wants to use. The earlier confusion was that the DB held an OLD 3-band 81.9 s path while the
   user's elaborate one was only in browser IndexedDB, which a fresh headless profile cannot see.
5. **Three overlay specs are written and unstarted** — `prompts/INFORMATIVE_FILM_OVERLAYS.md`:
   `§FILM_UNSUPPORTED` (build first — detection already runs, no flicker risk),
   `§CLASH_QUALIFY` (gates the clash overlay; viewer clash is broad-phase R-tree only today),
   `§FILM_CLASH_IN_FRAME`, `§FILM_CRITICAL_PATH` (BLOCKED — `cpm_schedule.js` computes no float).

---

## §MEASURED — facts from this session, do not re-derive

- **Full Hospital silent bake: 2,027 frames, 42.7 min, 1.27 s/frame, `unconverged=0`, zero timeouts.**
  `§CLI_BAKE_FFPROBE codec=h264 1854x962 frames=2027 fps=15/1 durationSec=135.133 bitrate=5337070`,
  90.2 MB. Before `§NIGHT_BAKE_POOL` the same run projected to ~9 h at 26.4 s/frame with 27% of
  frames captured UNCONVERGED.
- **Root cause of that 12x:** the in-frustum fixture census changes nearly every frame, every
  add/remove changes the scene's point-light COUNT, which is a shader DEFINE — so three.js recompiled
  every program. Count-stable frames fold in 0.8-1.3 s; count-changed frames cost 13-53 s.
- `§CLI_BAKE_POSECHECK frames=2027 maxErrVsOverridePlanM=0 (MATCH) meanDistVsDerivedPlanM=80.07` —
  the stored path provably drove the camera.
- Headless real GPU: `--use-angle=gl-egl` + `__EGL_VENDOR_LIBRARY_FILENAMES=10_nvidia.json`
  (wired as `--gpu real`). Plain headless = SwiftShader; vulkan = no context.
- WebCodecs **H.264 encode works headless** — no webm fallback needed.
- Merged 2026-09-01: #1586 #1587 #1588 #1590 #1592 #1594 #1595 #1597 #1598 #1599 #1601 (sw v1108→v1119).
- Docs deployed 2026-09-02 via `scripts/safe_gh_deploy.sh` (guard PASS, 290→290 files, canaries 200).
