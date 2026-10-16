<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# DISC WALKER BRANCH CLOSEOUT — verify + report on 3 stale-but-open PRs, then investigate the guide-screenshot bug (2026-07-11, Sonnet-scoped, FABLE-assigned)

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb repo only. This is a VERIFY-AND-REPORT task, not a rewrite — the hard analytical work
named "DiscWalk" in this project's memory is ALREADY DONE (see "What's already closed" below). Read this
whole file before touching anything — most of what looks like open backlog here has already landed; do
not re-diagnose it. PUSH PAUSE IS IN EFFECT (bim-compiler CLAUDE.md §⏸, standing 2026-07-11) — commit
locally, verify on localhost, do NOT push, do NOT open a PR, do NOT merge any existing open PR, until the
user/MANAGER explicitly lifts it. This session's OWNER (Sonnet, this file's author) reviews your findings
before anything gets merged — you report, you don't merge.
```

## Why this file exists
The user asked (2026-07-11) to look into "the DiscWalk task" and get a prompt file scoped for a Fable
session, since project memory (`project_disc_walker_grid_guard_marathon_2026-07-10.md`) describes it as
"tough" — a 2026-07-10 marathon that left 6 branches verified+pushed but unmerged, plus an unsolved
Z-datum bug flagged as "the actual next real gap, ahead of anything else." **Investigating fresh
(2026-07-11) found that framing is now STALE — the hard part is done.** This file scopes what's
genuinely left: re-verification of 3 small stale PRs (mechanical, Fable-suited) + one genuinely
undiagnosed bug (the guide screenshots).

## What's ALREADY CLOSED (do not re-diagnose, re-litigate, or redo this work)
- **§TE-ARC-DATUM (the Z-datum bug the memory called "the actual next real gap"): FULLY DONE, MERGED,
  BOTH REPOS.** bim-compiler: `build/disc_walker.js placeMeasured()` now measures the band→substrate
  z-offset at WALK TIME from `rule_frame_ref` (per-class mean-z refs) instead of a baked one-frame
  constant — merged to bim-compiler `master` via PR #40 (`b202eb44b`). bim-ootb: ported (commit `4ff22c0`,
  branch `fix/dw-datum-port`), verified `W-DW-DATUM` 4/4 on the SHIPPED `Terminal_ARC.db`
  (`zOff=-0.060 measured, 10 ref classes, MAD 0.024`, falsifier DROP `rule_frame_ref` reproduces the
  original collapse 1865→642), merged via PR #726 (squash commit `3d09ad6`) — **confirmed already an
  ancestor of `~/bim-ootb` local `main` right now** (verify: `git merge-base --is-ancestor 3d09ad6 main`).
- **`fix/dw-rot-units` (radians-in-a-degrees-field bug): MERGED.** PR #723 (squash commit `81f2dbd`) —
  also already an ancestor of local `main`. Do not re-port or re-verify this one; it's live.
- **SampleCastle rooms:** CLOSED as a non-issue same marathon — `disc_walker` never needed room/IfcSpace
  data for SC; the whole investigation thread was chasing the wrong branch of the problem. Nothing to do.
- **Room-mode (schedule-driven per-room walk, `fable/modeller-lod400-livewire`/`fable/meshdb-livewire`):
  MERGED** to both repos' mains 2026-07-10, independent of the above.

## ▶ IN-PROGRESS UPDATE (2026-07-11, Sonnet, same day — checked before any Fable dispatch)
**Task 1 is partially done already — do NOT redo the merges, only finish the verification.** Found three
worktrees already built exactly per the Method below, each with the target branch already merged into a
fresh checkout off current main:
- `/tmp/wt-verify-grid-tilt` (branch `verify/grid-tilt`) — `fix/grid-tilt-guard` merged in clean.
- `/tmp/wt-verify-oracle` (branch `verify/oracle`) — `fix/terminal-oracle-source` merged in clean.
- `/tmp/wt-verify-dwprobe` (branch `verify/dwprobe`) — `fable/dwprobe-dedup` merged in, but hit a REAL
  conflict (main had moved further than my dry-run check caught) — resolved KEEP-BOTH (§8E-3
  `_dwProbeMatch` + `__dwOcclusionProbe` rename coexist) + repointed `witness_mep_route_render` to the
  renamed probe. Two untracked PNGs sit in this worktree (`mep_route_render_duplex.png`/`_terminal.png`) —
  leftover from running THAT witness, harmless, can be ignored or cleaned up.

**What's NOT done yet in any of the three: the actual witness re-run + logged PASS/FAIL.** No fresh log
evidence found for any of them as of this check. **Remaining work is exactly steps 2-3 of the Method
below, nothing earlier** — cd into each existing worktree (do NOT rebuild it), run that branch's own named
witness, log the real output, report per-branch PASS/FAIL. If `wt-verify-dwprobe`'s KEEP-BOTH resolution
introduced anything unexpected, that's exactly the kind of regression this step exists to catch — check it
for real, don't assume the conflict resolution was correct just because it applied cleanly.

Once all 3 report green: this is a call for whoever holds Manager's git-admin mandate
(`prompts/MANAGER.md` — "PR work, including the merge decision, is Manager's job... once independently
verified, merge it") — not something to merge from inside this task.

## What's ACTUALLY still open — Task 1: verify + report on 3 stale PRs (no merge, no push)
Three branches are pushed, have OPEN GitHub PRs, and per the 2026-07-10 memory were "independently
verified+pushed" — but main has moved on since (each is 17-21 commits behind current `main` as of
2026-07-11). A stale "green" claim is not evidence (this project's own hard-learned lesson, same memory
file: "a worker's 'all green' report is not evidence until reproduced from a checkout that inherits
NOTHING from wherever the worker actually ran it"). Re-verify each FRESH:
1. `fix/grid-tilt-guard` (PR #722, local commits `98cf709`+`c485560`) — extends the grid-drag
   rotation/tilt guard to catch X/Y tilt AND the Modeller's real 2nd plan axis (`'y'`, not `'z'` — Z-up
   convention). Witness: check the commit for the exact witness name (grid/rotation guard tests).
2. `fable/dwprobe-dedup` (PR #724, local commits `43d713a`/`3367afb`/`52fea0e`) — dedupes a
   double-defined `window.__dwPixelProbe`, fixes a crash-on-uncaught-rejection in
   `witness_modeller_disc_walk.js`, removes a `NODE_PATH` env dependency. Witness:
   `witness_modeller_disc_walk.js` and whatever the probe-dedup's own check is.
3. `fix/terminal-oracle-source` (PR #725, local commit `c1b4f9e`) — repoints
   `witness_disc_density.js`/`witness_disc_clash.js` from a stale `Terminal_ARC.db` (0-MEP-rows since the
   embed-8 ARC-only strip) to `Terminal_meta.db` (the intended oracle, per the witnesses' own header
   comments). Witness: `witness_disc_density.js`, `witness_disc_clash.js`.

**Method (per branch, do NOT skip steps):**
- `git worktree list` first (Worktree Hygiene) — reuse `/tmp/wt-dwrot`/`/tmp/wt-grid-tilt-guard`/
  `/tmp/wt-dwprobe-dedup` etc. ONLY if genuinely idle (check `git status --short` in each — if dirty or
  mid-work, leave it, make a fresh one instead). A pre-merge conflict dry-run already ran clean for all 3
  against current main (`git merge-tree <merge-base> main <branch>` — no conflict markers) — that's a
  necessary, not sufficient, check; still re-run the real witness.
- Build a FRESH worktree off CURRENT `origin/main` (`git fetch origin && git worktree add /tmp/wt-<name>
  -b verify/<name> origin/main`), merge the target branch into IT (not the other way around), run its
  witness there, log the real output.
- Report per branch: PASS/FAIL with exact witness counts, any regression found (name it, don't paper over
  it), and whether local git merge was clean.
- **Do NOT merge into `~/bim-ootb` main, do NOT push, do NOT touch the GitHub PRs.** Report back to this
  session (Sonnet reviews, decides what happens next — possibly a simple `gh pr merge` once you confirm
  green, but that's a call for after your report, not something to do unilaterally).

## Task 2 — diagnose the guide-screenshot camera bug (genuinely undiagnosed, real investigative work)
2026-07-10: a local-only branch `fable/combined-guide-shots` (worktree `/tmp/wt-combined-guide`, still
present, DO NOT reuse it directly — it's stale, missing the 2 branches above and predates current main;
build fresh) merged the (then-)4 unmerged branches and produced 2 candidate guide screenshots. **Both
reviewed directly (real image bytes, not a caption) and both FAIL:**
- `duplex_elec_lod400_walk.png` — camera zoomed in tight on one ceiling fan, entire frame washed out to
  near-white/gray, no building context. Looks like an exposure/lighting bug in the capture, not a framing
  choice.
- `samplehouse_elec_rotation_fix.png` — camera appears positioned INSIDE a large dome/sphere mesh, filling
  almost the whole frame; raw browser UI (toolbar icons, a scrubber reading "76/76 · FlowController")
  visible in-shot. A broken/accidental mid-navigation capture, not a posed shot.

Root cause (bad camera-positioning script vs. an actual rendering defect surfacing only in this camera
path) was named as "the next concrete question" and never chased. Your job: chase it.
1. Find the actual screenshot-capture script used for `duplex_elec_lod400_walk.png` /
   `samplehouse_elec_rotation_fix.png` (search `modeller/tests/` for a guide-shot generator — likely near
   `guide_shots/` or referencing `frameElement`/`overheadTo`/camera-fly helpers from `e2e_harness.js`).
2. Reproduce BOTH bad shots fresh (fresh worktree off current main + the 3 branches above merged in) —
   confirm they're STILL bad post-merge (main has moved; the bug may already be gone, or may not be).
3. If still bad: is it (a) a camera-math bug in the capture script (wrong target/distance/up-vector — this
   project's own prior "camera-inside-mesh" incident, 2026-07-10, already diagnosed+avoided elsewhere per
   `feedback_screenshot_ui_before_deploy` / the material-parity session's own citation of it) or (b) a real
   rendering defect (something about ELEC LOD400 device meshes or the SampleHouse rotation-fix content
   itself breaks under ANY camera) — tell them apart by trying a DIFFERENT, known-good camera framing
   (e.g. this repo's own `t.frameElement`/`t.overheadTo` helpers from `modeller/tests/e2e_harness.js`,
   already used successfully in `MODELLER_RENDER_MATERIAL_PARITY.md`'s own screenshots this session) on
   the SAME content. If the known-good framing also fails, it's (b), not (a).
4. Fix whichever it is, or if it's (b) and out of your depth, STOP and report exactly what you found —
   don't guess-patch a rendering defect blind.

## Explicitly OUT OF SCOPE (named, not assigned — flag if you trip over it, don't fix it)
- **Stale radians in old signed op-log rows** (pre-dating the `dw-rot-units` fix, `81f2dbd`) — flagged in
  the 2026-07-10 memory as UNSAFE to blind-migrate (can't numerically distinguish bogus-radians from
  legit-small-degrees) and needing a per-row re-derivation from source `element_transforms.rotation_z`,
  not a data patch. This is a real, separate, harder design task — do not attempt it here, name it if you
  encounter it live.
- Any NEW material/rendering/Outliner work — that's `MODELLER_RENDER_MATERIAL_PARITY.md`'s lane (closed
  this session), don't touch those files here.

## DONE WHEN
Task 1: all 3 branches re-verified fresh with real witness output (PASS/FAIL, exact counts), reported
back — not merged, not pushed. Task 2: the guide-screenshot bug's root cause identified (camera-script vs.
rendering defect) and either fixed+re-screenshotted or clearly reported as blocked with what's known.
Findings appended to this file (a fresh dated section) so the next session — Sonnet reviewing, or whoever
picks up the actual merge/push decision — has the real current state, not a day-old memory snapshot.

---

## FINDINGS — 2026-07-11 (Fable, this file executed; nothing merged, nothing pushed, PUSH PAUSE honoured)

**Context that moved under the run:** `main` advanced TWICE during the session (f0f0994 `#738` → 9b62c4f
`#740` — a concurrent session is actively merging). Task-1 verifies ran off f0f0994; the Task-2 combined
worktree ran off 9b62c4f. All logs saved in the session scratchpad; durable artifacts are on local branches
`verify/dwprobe` and `verify/guide` (objects in `~/bim-ootb/.git`, survive `/tmp` cleanup).

### Task 1 — 3 stale PRs re-verified fresh (worktree off current origin/main, branch merged IN)

**1. `fix/grid-tilt-guard` (PR #722) — ✅ PASS, merge clean.**
`W-GRID-TILT-GUARD` **29/29** (`witness_grid_tilt_guard.js`, fresh worktree `/tmp/wt-verify-grid-tilt`,
branch `verify/grid-tilt`). No regressions. Mergeable as-is.

**2. `fable/dwprobe-dedup` (PR #724) — ✅ verifies to its own documented tallies, BUT the merge is NO
LONGER CLEAN and needs a semantic resolution (worked out + proven here, on branch `verify/dwprobe`):**
- **Conflict:** `modeller/modeller.html` — main's §8E-3 fix (`_dwProbeMatch`) edited the same second
  `__dwPixelProbe` definition the branch renames to `__dwOcclusionProbe`. The prompt's "dry-run ran
  clean" note is stale.
- **Resolution (KEEP BOTH, committed as `79acdb0` on `verify/dwprobe`):** keep §8E-3's `_dwProbeMatch` +
  comment, apply the rename, AND repoint `modeller/tests/witness_mep_route_render.js` (new on main,
  landed AFTER the branch was cut) from `__dwPixelProbe` → `__dwOcclusionProbe` — it asserts the
  occlusion shape (`dwPainted`), which the rename would otherwise silently take away (R9–R11 would fail).
- **Witnesses on the resolved merge:** `W-DW-PIXELPROBE` **6/6** (census probe reachable again — on
  current main it is still shadowed and that witness asserts fields the shadowing probe doesn't return);
  `W-UX-DISC` **6/2** — EXACTLY the branch's documented expected tally
  (`WITNESS_HARNESS_HYGIENE_DWPROBE.md` §2): B5/B6 red = SampleCastle exposes no `[data-disc="MEP"]`
  node, **pre-existing on pristine main** (reproduced: pure-main run also fails B5 and additionally
  CRASHES with the uncaught rejection the branch fixes); `§MEP-ROUTE-RENDER` **12/12** with the repoint.
- **Two side-findings:** (a) `witness_mep_route_render.js` has a bare `require('playwright')` — the same
  NODE_PATH disease the branch cured in 3 other witnesses, freshly reintroduced on main; had to run it
  with `NODE_PATH=~/bim-ootb/tests/node_modules`. (b) B5's "SC has no MEP disc node" traces to the
  embed-8 ARC-only residents (disc nodes seed from the resident meta rows) — witness expectation vs.
  product direction is a Sonnet call, not fixed here.

**3. `fix/terminal-oracle-source` (PR #725) — ✅ PASS, merge clean, tallies match its commit message
EXACTLY.** `W-DW-DENSITY-TE` **7/1** (D4 ELEC 1988/833=2.39×, FP 1.14×, ACMV 1.07× — real ratios; the
one red is D3 ENVELOPE 93–94% vs ≥99%, the commit's own documented separate placement-accuracy finding)
and `W-DW-CLASH-TE` **10/0** (S8 stage2=0.06% vs real-TE=2.17%, 40/1845 sampled). Worktree
`/tmp/wt-verify-oracle`. **Run prerequisite discovered:** both witnesses also fetch
`modeller/Terminal_arcstr_proof.db`, which is deliberately gitignored — a fresh worktree 404s it and
sql.js dies with "file is not a database"; copy it from `~/bim-ootb/modeller/` first. Note the branch
commits `Terminal_meta.db` (18MB, plain non-LFS binary) — consistent with existing resident-DB practice
in this repo (`Terminal_ARC.db` is likewise tracked), flagged for awareness only.

### Task 2 — guide-screenshot bug: **(a) capture-script camera/styling bug. NOT a rendering defect. Fixed.**

Capture script found: `modeller/tests/guide_shots_combined.js` (committed only on
`fable/combined-guide-shots`). Reproduced fresh off current main + all 3 branches (worktree
`/tmp/wt-verify-guide`, branch `verify/guide`):
- `samplehouse_elec_rotation_fix.png` **no longer reproduces as broken** — the same script now yields a
  clean top-down plan shot (no dome, no browser UI). The 2026-07-10 capture came from the stale combined
  branch's state.
- `duplex_elec_lod400_walk.png` still reproduced exactly as described. Discriminating probe
  (`guide_shot_probe.js`, committed on `verify/guide`): **P1** wide/no-xray = clean render, 102 LOD400
  devices — content provably fine; **P2** wide + the script's xray override = whole frame washes milky →
  the wash follows the OVERRIDE (`opacity 0.05` on every ARC mesh + `depthWrite=false`, layers stack);
  **P3** the shot's own `dist=12` close-up, no xray = camera parked OUTSIDE the shell staring at a
  frame-filling wall (fixtures are interior). Original bad shot = P3's wall turned into P2's 5%-opacity
  veil with one ceiling fan behind it.
- **Fix (`guide_shots_combined_fixed.js`, committed on `verify/guide`):** replace the glass veil with a
  CUTAWAY (hide non-disc meshes above the subject hood — shot 2's own proven technique; 69 meshes), camera
  steeper into the interior (`dir [0.7,-0.7,1.15] dist 15`), clip margin 70→150, and hide the `#hist`/
  `#stat` fixed-position chrome (it overlays the canvas and leaks into bottom-edge clips — this was shot
  2's "scrubber in frame" mechanism). Result verified by eye (real image bytes, not the log):
  `guide_shots/duplex_elec_lod400_walk_fixed.png` = crisp dollhouse cutaway, ~15 gold LOD400 ELEC devices
  (fans/pendants/panels) in full room context, zero console errors. Both final candidates committed on
  `verify/guide`.

### For Sonnet's merge/push decision (when PUSH PAUSE lifts)
- #722 and #725: green, conflict-free — straight merges.
- #724: use `verify/dwprobe`'s resolution (`79acdb0`) or redo it per the bullet above — do NOT let a
  naive conflict resolution drop either the rename or `_dwProbeMatch`, and do NOT forget the
  `witness_mep_route_render.js` repoint.
- Cleanup after review: `verify/grid-tilt`, `verify/dwprobe`, `verify/oracle`, `verify/guide` branches +
  their `/tmp/wt-verify-*` worktrees are this session's; safe to remove once their evidence is consumed.
- Unassigned follow-ups surfaced: bare `require('playwright')` in `witness_mep_route_render.js`;
  W-UX-DISC B5/B6 expectation vs ARC-only SC residents.

## ▶ MANAGER VERIFICATION RESULT (2026-07-11, git-admin mandate — witnesses run, merge decisions made)

**#722 (`fix/grid-tilt-guard`) — MERGED.** Synced with current origin/main in `/tmp/wt-grid-tilt-guard`
(clean merge), re-ran both witnesses post-sync: `witness_grid_tilt_guard.js` 29/29,
`witness_grid_rotation_guard.js` 34/34. Pushed, auto-merge armed and completed.

**#725 (`fix/terminal-oracle-source`) — MERGED as #741 (superseded, #725 closed).** Used the
already-built `/tmp/wt-verify-oracle` (had its fixture files generated correctly; a fresh worktree
I tried first was missing `Terminal_arcstr_proof.db`, a generated fixture not a code bug — don't
repeat that path, reuse the existing worktree). `witness_disc_clash.js` 10/10 clean.
`witness_disc_density.js` 7/8 — the 1 fail (D3 envelope, 91-93% vs ≥99%) is a **pre-existing**,
already-documented finding (PROGRESS.md archive, surfaced by PR #638, unrelated to this branch's
own job of repointing the oracle DB, which is confirmed working). Pushed as `verify/oracle` →
PR #741, auto-merge armed.

**#724 (`fable/dwprobe-dedup`) — NOT MERGED, real regression found in the KEEP-BOTH resolution.**
`witness_modeller_disc_walk.js` in `/tmp/wt-verify-dwprobe`: 6/8, with **B5 (SampleCastle exposes
an MEP disc node) and B6 (click MEP → honest refusal) both failing** — the MEP disc node is now
**absent from the UI entirely** (click times out, node not found), not just failing to refuse
honestly. This witness historically scored 8/8 per `prompts/RESUME_MODELLER_UX_OUTLINER_PILL.md`
line 26 ("SampleCastle MEP → no anchors → refuse, 0 fabricated. Witness W-UX-DISC 8/8") — so this
is a real regression from that baseline, not a pre-existing gap. Very likely caused by the
`_dwProbeMatch`/`__dwOcclusionProbe` rename in the KEEP-BOTH conflict resolution breaking whatever
gates the MEP disc node's render/visibility on SampleCastle specifically. **Needs a real fix before
merge** — flagging back to whoever owns this branch (Sonnet 1's DiscWalk lane), not merging or
patching it myself (lane engineering, not Manager's admin scope). `/tmp/wt-verify-dwprobe` left
as-is (uncommitted work in progress, do not prune).

## ▶ SONNET VERIFICATION — NOT a regression, #724 is safe to merge (2026-07-11)

**Checked, don't repeat:** ran `NODE_PATH=~/bim-ootb/tests/node_modules node
modeller/tests/witness_modeller_disc_walk.js` directly against **pristine `origin/main` @ `9b62c4f`**
(current tip, zero relation to `fable/dwprobe-dedup` or the KEEP-BOTH merge — no worktree, no branch
merged in, the actual shared checkout as-is). **Reproduces the IDENTICAL failure**: B5 fails (no
`[data-disc="MEP"]` node), B6 throws the same uncaught-rejection timeout. This is conclusive — the
branch/merge is provably NOT the cause; Manager's "historically 8/8, so this is a regression from that
baseline" reasoning compared against a stale baseline without re-checking whether pristine main had
already drifted off it independently (the exact inverse of this project's usual "stale green isn't
evidence" trap).

**Actual root cause, also checked:** `sqlite3 modeller/SampleCastle_ARC.db "SELECT discipline,
count(*) FROM elements_meta GROUP BY discipline"` → `ARC|3342` only, **zero MEP rows**. SampleCastle's
shipped resident DB is now ARC-only — matches Fable's own side-finding ("traces to the embed-8 ARC-only
residents"). The witness's B5/B6 expectation (written when SampleCastle still shipped MEP data) is
STALE relative to current product data, not broken by any code change in this branch or its merge.

**Verdict: #724 is clear to merge on the SAME terms as #722/#725** — the B5/B6 failure is real but
unrelated, pre-existing on main independent of this branch, and out of scope for a "verify the branch"
task. Dispatched as its own small follow-up (see `WITNESS_SAMPLECASTLE_MEP_STALE.md`) rather than fixed
inline here — don't block #724's merge on it.

## ▶ CORRECTION (2026-07-11, Manager) — #724 verdict above was WRONG, now merged

**My earlier "real regression" verdict on #724 was a mistake, corrected here rather than silently
edited away.** Sonnet 1 disputed it with a concrete counter-test (pristine `origin/main` @ `9b62c4f`,
zero relation to the branch, reproduces the identical B5/B6 failure). I independently re-verified
both parts before accepting the correction: (1) `sqlite3 modeller/SampleCastle_ARC.db "SELECT
discipline, COUNT(*) FROM elements_meta GROUP BY discipline"` → `ARC|3342` only, zero MEP rows,
confirmed directly; (2) ran `witness_modeller_disc_walk.js` on the shared `~/bim-ootb` checkout at
`main` (confirmed via `git branch --contains fable/dwprobe-dedup` that `main` does NOT contain the
branch) — B5 fails identically, `#bo-tree [data-disc="MEP"]` times out, same as in the branch's own
worktree. Root cause: `SampleCastle_ARC.db` is genuinely ARC-only (data staleness, likely the
embed-8 ARC-only strip mentioned elsewhere this session), not the KEEP-BOTH merge. My mistake was
comparing against a remembered "8/8 historically" baseline without checking whether pristine main
had already drifted off it independently — the same shortcut named earlier this session ("your
review was not strong"), now a second confirmed instance of the same pattern: flag a symptom,
under-verify before asserting a cause. **#724 merged** (auto-merge armed) on the same terms as
#722/#741. All 3 branches from Task 1 are now resolved.

## ▶ FINAL CLOSEOUT (2026-07-17/18, Sonnet) — Task 2's guide-shot bug chased to its actual root causes, all fixed

Picked back up from this file's own Task 2 verdict ("capture-script camera/styling bug, NOT a rendering
defect. Fixed.") to actually get a clean SampleCastle guide shot shipped — the SampleCastle swap this file's
own PUSH-PAUSE-era session had already tried and reverted (`177194f63` → `da27f8598`, both 2026-07-13).
**That revert was correct** — three more bugs sat between "camera fixed" and "SampleCastle looks good",
found one at a time by actually looking at real image bytes each step, not assumed from logs:

1. **bim-ootb PR #838** — the guide-shot script's OWN "0 console errors" gate was tripping on the self-heal
   patch-loader's benign 404 (permanent by design — most buildings ship no patch). Fixed by correlating
   against real network responses instead of guessing from Chromium's URL-less console text.
2. **bim-ootb PR #844** — `_commitDiscWalk`'s cat[0] fallback (an unmatched fixture class borrowed the
   catalog's FIRST item regardless of class — a full-height Column for an electrical outlet). This was the
   literal cause of SampleCastle's "wall spikes" under X-ray. New witness `witness_dw_honest_fallback.js`.
3. **bim-ootb PR #846** — X-ray reveal's glass/glow classification was completely broken for EVERY building
   (not just SampleCastle) since an unrelated material-parity change gave ARC elements a cosmetic colour
   too, defeating `_fixtureColorMap()`'s "has colour = fixture" test. Fixed by keying off the `_dw`/`_rw`
   op tag instead (pulled in from the already-existing, unmerged `fix/xray-fixture-classification` branch —
   see `XRAY_FIXTURE_CLASSIFICATION_FIX.md`'s own closing note). Layered a real depth-adaptive-opacity fix
   on top for the alpha-accumulation question that branch's own file had raised and left open.
4. **bim-ootb PR #851** — the double-render bug `DW_FIXTURE_DOUBLE_RENDER_FINDING.md` had flagged
   "NOT YET INVESTIGATED" turned out to be real: visually confirmed as z-fighting (a ceiling light z-fought
   into a garbled oval next to a clean fan). Fixed — see that file's own closing note for the two
   regressions caught (broken pick, broken X-ray-restore) before the fix was declared done.

**`docs/ModellerGuide.md` (bim-compiler) updated twice, both shipped:**
- `walk-fixtures.png` swapped to a real SampleCastle X-ray walk (commit `ebfb9b7b6`) — the swap this file
  originally deferred, now safe because #844+#846+#851 are all in.
- Two new close-ups added (commit `5e4c1ec89`): a real Duplex ceiling-fan LOD400 mesh vs a SampleCastle
  honest-box fallback, replacing a stale guide claim that every fixture is "still a box stand-in."

**This file's own arc is done.** Everything Task 1 and Task 2 named is either merged or explicitly flagged
open below — nothing left silently unresolved.

**Genuinely still open, not fixed here:**
- `witness_e2e_instpick.js` P2/P2b/P3 (click-to-identify) — confirmed broken on pristine `origin/main`
  before any of this file's fixes touched anything (`git stash` verified). Real, pre-existing, unrelated.
- Ambient occlusion for the Modeller's own viewport — considered (came up discussing why Modeller
  screenshots look flatter than the Viewer's Alt+G N8AO pass), deliberately not built. If ever picked up,
  mirror the Viewer's own gated-toggle pattern exactly (`toggleGIPreview()`), never touching the
  interactive edit/grid-drag path. Noted in `DW_FIXTURE_DOUBLE_RENDER_FINDING.md` too.
