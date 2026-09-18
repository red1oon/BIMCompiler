# ⚠ DO NOT REMOVE — LARGE-DB BAKE lane. Read the log after every run (CLAUDE.md Log Mandate: exit code
is not evidence). Scope: making a film bake of a 100k+-element building (LTU_AHouse, 122,330 elements,
761 MB `_silent.db`) start in seconds instead of minutes and finish in an hour instead of a night,
without per-building constants. Every claim below traces to a `§` line in a named log. Written
2026-09-14 by the Fable session from its own probes and from the retired Sonnet session's logs.

> **SESSION OPENER — paste this to start the session:**
> *Read `bim-compiler/prompts/LARGE_DB_BAKE.md` top to bottom (~250 lines). Then §128.10 of
> `MEP_CLASH_REVEAL_MOVIE.md` for the bake command, tap files and the storey-reveal witnesses, and
> CPE_4D_PERF_MEM_FINDINGS.md §8 for the measured causes this file ranks. Work §3 top to bottom to zero
> (CLAUDE.md WORK-TO-ZERO). One bake at a time. Never judge from frames.*

**COMMITTED 2026-09-15 (Sonnet):** §8.7 (`cc78ba7e`), L1 (`5dd2a16e`), L2 (`1aa2d29d`), L3+L4
(`741e3bf6`) all landed on `feat/storey-section-cut` in `/tmp/wt-storey-cut`, each its own commit, none
squashed. The storey-reveal fix (§128.8/9 + item 15 + item 16) landed separately as `e26336d0`. Branch
not yet pushed/PR'd. A parallel session is queuing the 480p ×3 deliveries + §129 in its own worktree
off this branch.

**ONE-LINE STATE (2026-09-14):** LTU loads and bakes clean (sidecar bug §8.7 fixed, four buildings PASS
the storey-reveal witnesses), but a LTU clip bake spends 627 s before its first frame — 560 s of it in
egress path legalization that the other three buildings answer from a precomputed table LTU's DB does
not carry — and then 3.3 s per 640x360 frame, 20 re-renders each. Nothing about LTU is a memory or
transfer problem: sql.js opens the 761 MB file in 1 ms, a bare page moves two copies of it in 1.5 s,
the machine has 31 GB and an 8 GB GPU. Three fixes from today sit UNCOMMITTED on three branches (§4).
REVIEW 2026-09-16 16:00 (Fable, reviewer; every value read from the named log under /tmp/wt-storey-cut/out/):
L1 CLOSED — `ltu_l1_raster_check.log` `§PATH_LEGAL_RASTER storeys=VÅNING 1..4`, first `§SUN_ARC_STEP +67.9 s` (was +627.2 s,
same clip); control `ltu_neg_control_noraster.log` `§PATH_LEGAL_NO_RASTER legalizations=69248 calls=8168 ms=693655`; sweep
`witness_ltu_walkable_raster.log` pass=5 fail=0 fixed=93 newlyBroken=0. Left: the patch `.sql` copy in the read-only main
checkout. L2 CLOSED — `ltu_l2_persist_check2.log` 0 `§CACHE_WRITE_OK`/`§KRN_PERSIST`/`§CACHE_PUT`, `§KRN_PERSIST_SKIP`; control
`ltu_l2_persist_check.log` still had `§KRN_PERSIST` 1; gantt gate: `l7_hhs_check.log` 0 `§CACHE_PUT`, 2 `§CACHE_SKIP key=`
(`hires_hhs.log` had 2 `§CACHE_PUT`). L3 CLOSED — `ltu_l3_stillbudget_check.log` `taa=2 ao=3` 1.75 s/frame vs 3.38; default
control `l7_fix_final.log` (final code, no flag) `taa=8 ao=12` 3.22 s/frame, HHS 0.43, Terminal 0.59. L4 PARTIAL — leak found
and fixed (`cinema_maxq.js:1255` gaze window sized by run-local nFrames → `_frameRange.total`); post-fix `l4_fix_k1/k2a_poses.json`
5/5 poses identical (pre-fix dump: 0/5, max delta 11.29); the `§FRAME_HASH` seam pair with encode + ffprobe is still OWED before
any K=3 delivery. L7 (item 16, 07:48) — HOSPITAL PASS: `l7_hospital_check.log` rungs=8, `inversions=0`, ARM/LABEL/RESTORE PASS, ARCH FAIL =
the same ARC/STR residue numbers as `fix_hosp.log`, and `§CLASH_FILM_BUILD trueClash=270` with 0 `Statement closed` — the first
Hospital bake ever with a clash film (masked by L2, not fixed). HHS/Terminal rechecks print `§STOREY_RUNG_LADDER` 1:1, all PASS.
Controls now real: `l7_ltu_ctrl_rejectguard.log` `tops=[2.70,8.06,2.99,18.57] inversions=1 => FAIL`; `l7_ltu_ctrl_meannearest.log`
reproduces item 15's grouping. LTU (`l7_ltu_fixed_orbit.log`): Plan 1/Plan 2/Storey 3 now on their level, but `§STOREY_RUNG_GROUPED
VÅNING 1+{…,VÅN 2}, VÅNING 2+{…,VÅN 3}, VÅNING 3+{…,VÅN 4}` is one rung LOW for VÅN 2/3/4 (4,853 elements). Mechanism, from
element_transforms: the rungs are room centres ≈ 0.35 m above each floor, and `_ladderBandIndex` tests base z against the rung,
so 65-73 % of VÅNING 2/3/4's OWN elements fall below their own rung (hidden only by the exact-name shortcut); against the floor
planes 6.00/9.25/12.30 (wall/column base-z peaks) every label lands on its named level (VÅN 2 70 %, VÅN 3 90 %, VÅN 4 84 %,
Plan 1/2 99 %, Storey 3 88 %). Rule: band boundaries = the floor plane between consecutive datums (median bottom of slab-class
elements lying between them; wall-base peak as fallback), then per-member banding (item 14 b). The deriver's `geomIdx` has the
same bias; its declared path only escapes it via a non-zero declared z, which LTU's 38 rows lack. CLASH: `l7_fix_final.log` `§CLASH_FILM_BUILD trueClash=120`, 0 `Statement closed` — masked in bakes by
L2 (findings §8.6 says so); live editor still exposed; krn-persist fires-proof still OWED on `/tmp/wt-krn-persist-race`.
Storey window (for the record): `§STOREY_REVEAL_WINDOW windowStartFrac=0.5200 orbitStartFrac=0.9700 realWindowSec=70.24`;
RISE_GROW already at cap, `RISE_GROW_MAX=0` would shrink it. COMMITTED 2026-09-15 ~10:50 on `feat/storey-section-cut`
(no remote branch yet): cc78ba7e §8.7 sidecar · 5dd2a16e L1 (+patch, +witness) · 1aa2d29d L2 · 741e3bf6 L3+L4 · e26336d0
§128.8/9 + items 15/16 (L7 rung vote — VÅN 2/3/4 still one rung low, see above). New worktree `/tmp/wt-loadpath` on
`feat/loadpath-ledger` @ e26336d0: a Sonnet agent managed by the reviewer runs Lane A (HHS/Terminal/Hospital full films at
854x480@24, red1: "480p will do") then MEP §129 (load path + ledger ticker), bakes gated behind the LTU 1080p24 bake
(`out/LTU_FULL_1080p24.log`). LTU FULL 1080p24 DONE 12:19: `§CLI_BAKE_WALL totalSec=8131 aborted=no fileOk=true`, ffprobe
3747 frames 1920x1080@24, 183 MB, first frame +59.2 s, 2.15 s/frame mean at the default budget, 0 persist/cache writes,
`§CLASH_FILM_BUILD trueClash=120`, LABEL/ARCH PASS, `§STOREY_CUT_BOUNDS inversions=0`; copied byte-identical to
`~/Downloads/LTU_AHouse_FULL_1080p24_2026-09-15.mp4`. TWO FAILS, full-run-only like MEP item 9(ii): `§STOREY_ARM_BASELINE
zeroScaleRows=118/10427 heldByTimeMachine=0 => FAIL` at tNorm 0.836 (the post-L7 window is 0.836→0.952) and
`§STOREY_CUT_RESTORE_WITNESS membersLeftOff=118/122330 byDisc={ARC:36 STR:82} => FAIL` — instanced IfcSlab/IfcColumn (ARC,
VÅNING 2/3) and 45x120 timber IfcBeam (STR, VÅN 4) already zero-scale when the reveal armed, never restored; no other § line
names those guids, so the owner that zeroed them is unidentified (not the TM, not the disc filter: `discRevealKey=""`).
Clip runs from 0.9 never see it (the wrapper's `§BAKE_SCOPE_PEAK` goes to `.launch.txt`, LTU memPeak=6.0G). SAME CLASS on
Terminal's 480p24 full run (`/tmp/wt-loadpath/out/Terminal_FULL_480p24.log` `zeroScaleRows=18/35392 … => FAIL`, `membersLeftOff=
18/48428 {ARC:5 STR:13}`, held back from Downloads) and Hospital (12, item 9) — three buildings, full runs only: systemic,
unattributed. 480p DELIVERIES: HHS PASS (`HHS_Office_Federated_FULL_480p24.log`, 3131 frames, memPeak=1.3G, in Downloads).
§129.1 LOAD PATH first sighting: `HHS_loadpath_clip_0.22-0.32_480p10.log` `§LOADPATH_CHAIN hopsDrawn=19 hopsSweep=19 => PASS`,
`§LOADPATH_HOLD … cursorDayBefore==After => PASS`, `§LOADPATH_RESTORE materialsRestored=475/475 planesLeft=0 => PASS`; controls
`hopsDrawn=18 hopsSweep=19 => FAIL` and `materialsRestored=0/475 planesLeft=456 => FAIL` on cue; 130 frames, in Downloads. BUT the
pick rule as specified (deepest chain) chose an `IfcMember storey=Unknown hops=19`: 15 stair members stacked, then slab, column,
slab, stair flight — a balustrade, not a load path; 19 hops in the 8 s cap. Spec refined and DONE through v7 (2026-09-15 ~17:30, MEP §129.1/§129.4): pick = load-bearing classes
only; no clip planes, rest ghosted by material, chain drawn as solid clones; camera cuts to a static pose whose distance is
found by bisection on the projected corners. `/tmp/wt-loadpath/out/HHS_loadpath_v7.log`: PICK `IfcSlab Level 2 hops=5
skippedNonStructural=3`, CHAIN 5/5, `§LOADPATH_CAMERA fitMode=bisection targetMatchesCentre=true`, VISIBLE `solid=5 hidden=0
clipped=0`, FRAMING `inFrame=true heightFrac=0.623`, HOLD, RESTORE `clonesReverted=5/5 cameraRestored=true` — all PASS; four
controls FAIL on their own witness only (`ctrl_break_support` hopsDrawn=4/5, `ctrl_skip_restore` 0/869, `ctrl_hide_rest`
hidden=456, `ctrl_frame_off` inFrame=false). Clip `~/Downloads/HHS_loadpath_clip_0.22-0.32_480p10.mp4` (130 frames), awaiting
red1's sighting — SIGHTED and REJECTED ("not scene path correct… no scene cut"; "where are the $ and Id countdown"; all
under the Measure toggle). v8 (≈19:30, spec §129 v8b, builder restarted once after a context overflow): camera holds the
film's own pose, hold point searched forward from topout (80 % of building in frame, else best), ONE near-side section plane
on the ghost materials, stack as solid clones; `HHS_loadpath_v8.log`: `§LOADPATH_SHOT tNorm=0.2601 buildingInFrame=0.500
best=true`, VISIBLE `solid=5 nearSideClipped=456 beyondVisible=437`, FRAMING `hopsIntersecting=4/5`, HOLD `cameraMoved=false`,
RESTORE `clonesReverted=5/5` — 6/6 PASS; `§COST_ODOMETER_FINAL cost=801577 total=801577 hours=13038.4 => PASS` (rates exist).
Controls: break-support/skip-restore/hide-rest/co-freeze FAIL on cue; frame-off and clip-all DID NOT FAIL (control-side:
the tap must offset the hop boxes; the clip-all plane must sit beyond every ghosted object's own box) — fix in progress.
LEDGER: the preflight seals a COPY correctly (`§KRN_CHAIN verified=6883/6883`, source md5 unchanged), but `HHS_ledger_v8.log`
prints `INCONCLUSIVE sealed=3/6884` because the bake re-injects the schedule (`§KERNEL_OPS_SCHED_VERSION stale genVersion=38
current=39 — cleared 6880 ops`) and destroys the seals on load; fix = seal in-page after injection in bake mode (`sealedBy=
bake`) DONE. §129 STATUS 20:50 — ALL THREE BEATS PASS ON HHS AND LTU, seven controls FAIL on cue: `HHS_loadpath_v8d.log`
(6/6 PASS, FRAMING `hopsIntersecting=2/5` under a real THREE.Frustum test that replaced a corner-span heuristic which counted
boxes behind the camera as in shot; `§COST_ODOMETER_FINAL 801577/801577 PASS`; `§LEDGER_TICKER sealedBy=bake 6884/6884 PASS`),
`HHS_ledger_v8b_ctrl_flip.log` (`verified=2/6884 brokenAt=3 chainTip=broken => FAIL`), `LTU_loadpath_v8b.log` (21 hops: 7
slabs, 7 columns, 6 beams, 1 wall; `hopsIntersecting=8/21`; `solid=21 beyondVisible=7978`; ledger 122333/122333 PASS; cost
`INCONCLUSIVE reason=norates`; memPeak=5.9G; LTU's real topoutU=0.4366, not 0.271). Clips in ~/Downloads:
`HHS_loadpath_clip_0.22-0.32_480p10.mp4`, `HHS_ledger_clip_0.00-0.32_480p10.mp4`, `LTU_AHouse_loadpath_clip_0.42-0.50_480p10.mp4`.
Open: red1's sighting; the 8 s hold cap vs 21 hops (0.38 s/layer); the ledger tip is run-specific because the bake re-injects
the schedule (durable seal = at save time with a current genVersion, data lane); `§LOADPATH_SHOT buildingInFrame=0.500 best=true`
on both buildings = no frame after topout reaches 80 % from the current paths. Code uncommitted on `feat/loadpath-ledger`
(/tmp/wt-loadpath: cpe_load_path.js, cpe_ledger_ticker.js, cpe_resource_panel.js, cinema_maxq.js, main.js, viewer.html,
cli_silent_bake.js, scripts/loadpath_ledger_preflight.js). SIGHTING ROUND 2 (2026-09-15 evening → 2026-09-16 00:40): red1's
findings (resume jump; cost/ledger not in the HUD proper and obscured; label overlap; only what is on screen; others OFF
during the freeze; bottom-up solid layers; chain must descend; cost above ledger inside the pie HUD, toggle text 4D/5D)
are MEP §129.6 items 1–8 + 6b, all implemented (three builder agents, two lost to context overflow) and PROVEN on HHS:
`HHS_loadpath_v10b.log` 16/16 PASS — `§LOADPATH_RESUME tFilmArm=tFilmRelease=0.246357 stepAtResume=0.0000`, chain
column L3→L2→L1→L1→slab→ground `monotone=true rejectedAscending=8`, `§LOADPATH_STACK` 1/5..5/5 bottom-up, `§LOADPATH_LABELS
overlaps=0`, `§LOADPATH_FOCUS painted=0`, `§HUD_LAYOUT overlaps=0 overflow=0 costAboveLedger=true`, cost FINAL once, ledger
6884/6884, 190 frames = 130 + 60 inserted. Twelve controls FAIL on their own witness (no-clock-freeze measures the jump:
stepAtResume=23.6 vs 0.56); one wart: the hud_force_overlap tap also flips FOCUS painted=9 (registers dummy overlay rects)
— control-side, not fixed yet. Clip `~/Downloads/HHS_loadpath_clip_0.22-0.32_480p10.mp4` = v10b. Known: the pie panel
gives rows 98 px, so the ledger row is ellipsis-truncated (`pie.ledger` w=93). LTU not re-baked since v8b (its 21-hop
zigzag chain is now rejected by the descend rule; support-sweep finding filed in §129.4). TERMINAL SIGHTING CLIP READY
2026-09-16 ~04:10 after rounds 3–9 (MEP §129.7 + §129.4): `~/Downloads/Terminal_loadpath_clip_0.1508-0.2032_480p10.mp4`
= `/tmp/wt-loadpath/out/Terminal_loadpath_r9.log`, 124 frames = 44 + 80 hold, ALL witnesses PASS: `§LOADPATH_HOLD_INSERT
armTn=0.1851 holdFrameStart=28 armFrameTn=0.184921 armTnMatch=true`, `pickSource=live visibleHopsLive=5/6`, FRAMING
`hopsIntersecting=5/6 memberPx=[888.5,…]`, CLONES 6/6 maxOffset=0.00, LABELS centre n=5, BACKDROP fade PASS, HUD
overlaps=0 overflow=0, FOCUS painted=0, ledger full re-seal 48433/48433 PASS, RESUME tFilmArm=0.184921; frame-off control
FAIL on cue. Rounds 3–9 fixed, each proven by a bake: centred ladder; thick/near pick; pie rows below the pie (no widening,
truncation allowed by ruling); backdrop fade out before / in after the freeze; ghost 0.20; chain must descend (Terminal
rejected 220 zigzags + 282 single-hop); clones placed from the source instance's world matrix (was ifc2three); ledger
full re-seal in bake mode (Terminal's stale pre-sealed BUILDING_OPEN at id 48431 broke a partial seal); backdrop witness vs
the frame's own expected value; and the ROOT of five identical FRAMING 0/7 rounds — cinema_maxq.js computed the hold's
start frame as armTn×(clipFrames−1), ignoring the clip's in/out (Terminal armed at tn 0.1605 instead of 0.1851; HHS at
0.2464 instead of 0.2601, masked by a slow camera) — now mapped through the clip grid with `armTnMatch`, and the final pick
is made at the arm frame on the live camera. Four builder agents (three lost to context overflow at ~900k tokens).
ROUNDS 10–12 (2026-09-16, to ~09:30; MEP §129.7 item 8, §129.8): pie panel = exclusive pie band + full-width rows pinned
to the panel bottom (§HUD_LAYOUT_STABLE); SHINE-THROUGH is the default look (no ghost/cut/fade; ghost behind a flag);
visibility = raycast unoccluded fraction; two stacks far→near; ladders beside stacks; whole HUD fades out/in inside the
hold; info card spec'd (§129.8 item 6). HHS SIGHTING CLIP `~/Downloads/HHS_loadpath_clip_0.2432-0.2770_480p10.mp4` =
`HHS_loadpath_r12.log`, 104 frames: FOCUS painted=0, HUD_FADE 5/0/5/1, HUD overlaps=0 pieExclusive rowsFullWidth,
rows stable, clones 0.00, resume exact, ledger 6884/6884, cost 801577 — all PASS; the drawn stack is the 5-column ladder,
BUT the raycast was blind (`memberVis=[0,0,0,0,0]`, `near=none pickSource=none`, silent fallback to the probe pick):
HHS containers are BatchedMesh and the reverse lookup read `hit.instanceId` only, never `hit.batchId` → pick proof
INCONCLUSIVE. Controls: look_ghost, rows_float, hud_no_fade FAIL on cue; pick_occluded/one_stack inconclusive until the
raycast sees. ROUNDS 13–14 (to ~13:30): HUD fade now applied AT THE COMPOSITE call (the R12 fade witness had passed on a variable the
compositor overwrote with opacity=1 — red1's eyes caught it), row fonts restored to 10 px, info card drawn and PASS
(`§LOADPATH_CARD lines=3 rect=13,13,292,52`), raycast diagnostics printed: `raysCast=35158 hitsTotal=30351 selfHits=29`
— rays hit geometry but almost never their own member because sample points sit on BOX faces (a ray through empty box
space hits the wall behind and counts as occlusion); `pickSource=none` still printed with a stack drawn. SIGHTING CLIP now
= `HHS_loadpath_r14.log` (full design: shine-through, HUD fade, card, no cut), pick proof still INCONCLUSIVE. Controls:
no_focus_hold FAIL with compositeAlpha=1.00 (closes the composite gap), hud_no_fade, rows_float, look_ghost, break_support
FAIL on cue. ROUNDS 15–16 DONE (~16:00): `HHS_loadpath_r16.log` ALL 25 witness lines PASS (pickSource=frustum-fallback with the
occluder named; unwrappedDraws=0 counted on the capture ctx; fiveDY stable; black backdrop in shine mode). 18-control
sweep + Terminal/Hospital normal runs were in flight at the bake session. Hand-off for a new reviewer session:
prompts/LOADPATH_REVIEWER_RESUME.md. One bake at a time.

REVIEW 2026-09-16 (Fable, reviewer, continuing the hand-off): 18-control sweep completed, all correct
(2 controls needed real fixes: __hudForceOverlap's §HUD_LAYOUT never sampled ledger/cost/pie rects —
fixed via a second §HUD_LAYOUT_ARM sample at the arm frame, mid-hold sample now honestly INCONCLUSIVE
instead of vacuously true; __lpNoClockFreeze broke the reveal sequence under the frame-splice mechanism
— fixed with a frame-index-only pacing signal kept separate from the fSec-based one the control
deliberately breaks). Separately found and fixed a REAL, deterministic hang: Terminal_loadpath_r16 froze
forever at frame 30/124 (arm-time `_pickTwoStacks` raycasting an unbounded ~50k-instance universe) —
fixed with an instance-count-gated fallback to honest frustum-only ranking above 20k instances, verified
clean on HHS/Terminal/Hospital. All 5 originally-identified control findings (hud_force_overlap,
lp_backdrop_no_restore, lp_clip_all, lp_hide_rest, lp_no_clock_freeze) fixed and independently verified
against real bake logs — lp_backdrop_no_restore took 3 attempts (a zero-tolerance grid-snap-vs-continuous
boundary check in `_backdropFadeT` meant the backdrop never truly reached black in ANY hold, on ANY
building, not just this control — fixed with a 1-frame epsilon).
red1 SIGHTED the resulting HHS clip and rejected it — three real, previously-unverified defects, found by
reading code after being told to stop asking what red1 saw and re-derive it: (1) Cost/Ledger text drawn
after its own alpha scope was already restored — full opacity throughout the freeze regardless of
everything else fading; (2) the freeze's "fade off" scope only ever covered ground/sky/skyline by name —
staffage (confirmed present) and anything else non-building was never touched; (3) Round 16's own
Cost/Ledger-into-separate-`hud.fiveD`-box split was red1's own session's invented decision, never a real
requirement — reverted. Builder round implemented: Cost/Ledger merged back into the single pie panel
(content-driven height, no reserved space, same discipline as the trade list); the alpha bug fixed
structurally by the merge; the freeze fade generalized to "ALL ELSE FADE OFF" — every scene object that
is not the load-path beat's own clone and not a real building element (reusing the file's own
reverse-guid classifier; merged-mesh buckets and sprite-based staffage both handled, found by reading
streaming.js/effects.js, not guessed) now fades with ground/sky/skyline, no hand-picked list. New witness
`§LOADPATH_BACKDROP allElseCount=N allElseAtBlack=n/N` (INCONCLUSIVE if the population is empty, never a
silent PASS) and `§LOADPATH_CONTEXT_OFF hud=... backdrop=...` tying HUD-suppression and backdrop-fade
into one combined verdict. `node --check` clean on all 4 touched files; NOT YET BAKE-VERIFIED — red1
paused the session here to suspend the machine; resume by having the bake session run one HHS normal run
and checking the new witness lines for real. Still open, explicitly deferred to this reviewer's own
design judgment: the freeze-time label styling (thick black stroke-outline, no background plate — red1
called it messy/unprofessional, wants a clean cinematic panel instead). Worktree /tmp/wt-loadpath,
branch feat/loadpath-ledger, nothing committed.

REVIEW 2026-09-17 (Fable, reviewer, same session continuing overnight): freeze visual redesign locked
down after a design discussion with red1 and implemented — ladder labels get a 70%-opaque black
background plate (was a black stroke-outline, called messy) with plain white/near-white fill text, no
stroke; leader lines are yellow (#f5c518, brighter #ffd83d for the current hop); the info card's own
redundant stroke-outline removed (it already had a plate); non-stack building elements get their base
material colour swapped to white during the hold (texture map cleared so it doesn't show through),
SAME lighting/shadow rig untouched so 3D form still reads — the highlighted stack's own shine-through
rendering is completely unchanged. New `_applyWhiten`/`_restoreWhiten` pair follows the same clone-per-
material/Map/restore discipline as `_applyGhost`/`_restoreGhost`, explicitly excludes last night's
"all else" fade population (avoids the two mechanisms fighting over the same material's ownership),
and restores in LIFO order (whiten before ghost) at both `_restore()` and `_forceRestore()` so ghost
mode's own A/B control still unwinds to the true original, not a white clone.
`HHS_loadpath_r22` (first real bake of the whole tonight+overnight fix set) surfaced one genuine
regression from the Cost/Ledger merge: `§HUD_LAYOUT_ARM overlaps=1` — the merged panel's cost/ledger
rows started 2px into the trade list's own bottom edge, a real off-by-`rowH/2` error in the row Y math
(`afterListY` used a text-baseline-center offset without accounting for the registered rect extending
`rowH/2` above that center). Fixed (`cpe_resource_panel.js`), re-baked as `HHS_loadpath_r23`: 26 PASS,
0 FAIL, clean 73s completion, independently verified by both this session and the bake session
separately (each caught the same regression from its own full-log read, not a targeted grep) — this is
the first HHS bake since red1's original rejection that is genuinely clean end to end, including the
witnesses that actually prove the two behaviours red1 asked for: `§LOADPATH_BACKDROP_POPULATION
allElseCount=7 materials=7`, `§LOADPATH_BACKDROP allElseCount=7 allElseAtBlack=7/7 faded restored=true`,
`§LOADPATH_CONTEXT_OFF hud=PASS(...) backdrop=PASS(...) => PASS` (a real combined verdict requiring
both halves, not printed if either side is vacuous).
Known, disclosed, NOT yet closed: the whiten pass (building → white) and the label restyle have NO
witness of their own — both were verified once by direct code read, not by anything a future bake
would catch if it regressed. red1 flagged this gap themselves; two witnesses proposed
(`§LOADPATH_WHITEN` restore-count proof; a label-draw-call spec-conformance check) but not yet
authorized. Also proposed, not yet authorized: leader-line draw-on animation, a light vignette during
the freeze. Still fully open, unrelated to tonight: `§CLI_BAKE_POSECHECK` — camera-path fidelity has
never been numerically proven under any `--clip` bake, this session or any prior one; the check
honestly bails to INCONCLUSIVE rather than risk a wrong verdict. Terminal/Hospital/LTU not yet re-run
against tonight's changes (HHS-only so far). Nothing committed — still red1's word to give.

REVIEW 2026-09-17 continued (Fable, same session — red1-56/the separate bake session has closed up
entirely on red1's own instruction; ONE session now does both review and baking directly, no more
cross-session bake relay): red1 caught two more real, previously-uncaught issues on the r23 clip,
both root-caused and fixed with real witness proof, following red1's own explicit instruction —
"solve systematically, ensure it is WITNESSED" — witness added BEFORE/alongside each fix, not after.
(1) The rolling "reveal round" ending-cards HUD panel (`bigStatsCompositeOntoCanvas`,
`cpe_resource_panel.js`) was still using the OLD pre-Round-16 worst-case row reservation
(`_scanMaxResourceRows()`, via `shownRows=undefined`) — never received the same "size for rows
actually shown" fix the main resource panel got, so it was permanently oversized relative to its
real content whenever it drew (this is what red1 called "inflated, doesn't restore its original
size" — not a state leak, a different unfixed formula). Fixed: passes the real row count now, same
discipline as the main panel. Witness: the existing panel-height correctness formula
(`expectedPanelH`/`panelHOk`, previously only checked once during the load-path hold) is now ALSO
checked on every distinct content-state CHANGE across the WHOLE film via `§HUD_LAYOUT_STABLE`'s own
already-every-frame sampler (red1's own instruction: "why check every frame if it's a loop? check
before and after" — implemented as change-detection, not per-frame, matching this file's existing
"log once per CHANGE" convention) — new field `panelHFormula=PASS/FAIL/INCONCLUSIVE
statesChecked=N`, now gates `§HUD_LAYOUT_STABLE`'s own overall verdict. Confirmed on a REAL bake that
actually exercises the reveal round (`HHS_loadpath_r25.log`: `§CPE_STATS_TAIL reveal round entered...
revolvedFrames=22/104 (21% of the film)`, `§HUD_LAYOUT_STABLE ... panelHFormula=PASS statesChecked=3
=> PASS`) — not just fixed in theory, proven against the exact previously-buggy code path.
(2) The "instanceColor multiplies material.color, whitening might be invisible" concern raised
during investigation of red1's "still lingering" report — DEFINITIVELY RESOLVED, not left as a
hypothesis. Added the missing `§LOADPATH_WHITEN` witness (this pass previously had NO log line at
all — `_lp.whitenResult` was computed and never printed, the same "code ran, nothing proves it" gap
as (1)): `whitened=N materialsRestored=N/N instanceColorMeshes=M instanceColorRestored=M/M`, vacuous-
guarded. Real bake data (`HHS_loadpath_r24.log`/`r25.log`, identical both times): `whitened=412
materialsRestored=412/412 instanceColorMeshes=0 instanceColorRestored=0/0 => PASS` — 412 real
materials whitened and correctly restored, and ZERO of them carry a per-instance colour override
that would have made the whitening multiplicatively invisible. The fix also NOW HANDLES the
instanceColor case properly regardless (backs up and neutralises the whole `instanceColor` buffer
via direct typed-array copy, restored the same way) — proven correct via a mock-scene test during
implementation, and confirmed to be a no-op-in-practice on real HHS data via these two real bakes.
This whole investigation started from a real, sourced concern (`hba_lens.js:60`'s own comment:
"un-set instanceColor multiplies WHITE (identity)", confirming the mechanism exists elsewhere in
this codebase) — worth the real check, not a wasted detour, even though it came back negative for
HHS specifically.
Both `HHS_loadpath_r24`/`r25`: 27 PASS, 0 FAIL each, full log read.
NEW DESIGN WORK, SPEC LOCKED WITH RED1, NOT YET IMPLEMENTED: a genuine 3D-depth problem with the
highlighted stack itself (red1, 2026-09-17: "the way the stack is not really giving the impression
of 3D space... the stack is thin"). Locked spec: a section-cut clip plane, facing the camera,
positioned just BEHIND the stack's own depth (never clipping the stack itself, regardless of its own
extent) — everything between the camera and that plane is cut away; the cut surface and everything
behind it get the SAME concrete/white material treatment already built (same lighting/Alt-S baseline
untouched); the stack itself is completely unchanged (current rainbow/shine-through coloring +
labels, exactly as-is) so it reads clearly against the now-uniform cut surface. Needs a real, solid-
looking cut face (a filled cap where the plane intersects geometry, standard stencil-buffer technique
— a bare clip plane on any thin-shell geometry would show nothing at the cut, not a solid face).
Witness-first, per red1's own instruction — spec the witness before writing the code, not after.
Not started yet as of this entry.
Full hand-off doc for anyone else picking this up: `prompts/LOADPATH_FREEZE_POLISH_RESUME.md`
(written 2026-09-17, kept deliberately minimal to avoid drift — read it, not this whole file, unless
genuinely stuck). Still fully open, unrelated to tonight: `§CLI_BAKE_POSECHECK` (camera-path fidelity
never proven under `--clip`, any building, ever). Terminal/Hospital/LTU still not re-run against
tonight's changes. Nothing committed.

REVIEW 2026-09-17 continued — MAJOR real fix, root-caused via a real diagnostic, not guessed: the
"all-else fade off" population (`allElseCount=7`, believed clean all session) was undercounting
badly. `§PHOTO_PROPS built windowLights=4824` (skyline window-light glow, a `THREE.Points` object)
fires early in the film, but a targeted diagnostic proved `pointsInScene=0` at the EXACT moment
`_backdropCapture()` takes its one-time snapshot — the object genuinely doesn't exist/isn't visible
yet at that early moment (photo-staging visibly flickers on/off/on while settling, per real log
timestamps), and the snapshot, taken once at `A.loadPathBuild` time by design (`_bd`'s own comment:
re-capturing OPACITY mid-fade would corrupt the "original" baseline for the rest of the hold), never
refreshes — so anything that only exists/settles after that early moment was silently excluded for
the entire rest of the film, EVERY SESSION UNTIL NOW, without the count ever being wrong enough
(7) to look obviously suspicious. Also caught `isPoints` itself missing from `_allElseObjects()`'s
type predicate (`isMesh|isInstancedMesh|isBatchedMesh|isSprite` — never `isPoints`), a second,
independent gap.
Fix: `isPoints` added to the predicate; AND a new `_backdropTopUp()` — safe per the ORIGINAL comment's
own admission ("the population scan alone is safe to redo at any point," only the opacity capture
isn't) — called every frame `_backdropApply(t)` runs while `t` is still EXACTLY 0 (by
`_backdropFadeT`'s own definition, nothing has started fading for ANYTHING yet at that instant), adds
any object `_allElseObjects()` now finds that isn't already tracked, with its own CURRENT (genuinely
still-unfaded) opacity as its baseline — additive only, never touches an already-captured entry.
Real result, `HHS_loadpath_r28.log`: population grew `7→47 objects` / `7→51 materials` across two
top-up events (`added=43` then `added=1`, as photo-staging finished settling), and
`§LOADPATH_BACKDROP allElseCount=47 allElseAtBlack=51/51 faded restored=true => PASS` — all 51
materials, not 7, now genuinely proven to reach full black and restore correctly. 27 PASS, 0 FAIL,
every other tonight's-fix witness (`§LOADPATH_WHITEN`, `§HUD_LAYOUT_ARM`, `§HUD_LAYOUT_STABLE`
panelHFormula) unchanged and still clean.
This is very likely THE explanation for red1's original, repeated "still lingering" report — a
massively undercounted background population, not a fundamentally broken fade mechanism (the fade
math itself was always correct; it just wasn't running on most of what needed it).
Section-cut (3D depth item, spec in `prompts/LOADPATH_FREEZE_POLISH_RESUME.md`) — red1 authorized
proceeding ("go ahead on 5"), witness-first per red1's own instruction, in progress next.

## §0 GIVEN — measured, do not re-derive

| what | LTU_AHouse | Hospital | HHS | source |
|---|---|---|---|---|
| elements / scene objects | 122,330 / 7,967 | 63,415 / 4,899 | 6,880 / 411 | `§CLI_BAKE_LOADED`, `§PERF_TRAVERSE objs=` |
| DB on disk | 761 MB (643 MB `component_geometries`) | 308 MB | 77 MB | dbstat |
| sql.js open / export (node) | 1 ms / 252 ms, RSS 0.8→1.6 GB | — | — | scratch probe 2026-09-14 |
| bake startup to first frame | **627 s** | 171 s (120 s of it the pre-§8.6 R-tree timeout) | ~25 s | `§SUN_ARC_STEP` first line |
| of which egress `§PATH_LEGAL` | **560 s, 8,012 legalizations + 3,000 detour lines** | 1.2 s, 50 | 0.2 s, 2 | `out/ltu_storey_lowres.log`, `fix_hosp.log`, `fix_hhs.log` |
| `storey_walkable_raster` table in the DB | **absent** | present | present | sqlite_master; `§PATH_LEGAL_RASTER storeys=…` prints only where present |
| seconds per frame, 640x360@10 | 3.30 | 1.11 before / 1.33 in / 1.47 after the reveal window | 0.41 | `§SUN_ARC_STEP` timestamps |
| per-frame TAA refine / AO | 3,006 ms / 1,338 ms | 1,160 / 510 | small | `§STILL_REFINE elapsedMs`, `§PHOTO_AO totalMs` |
| still budget | `taa=8 ao=12` = 20 renders/frame, not on the CLI | same | same | `§MAXQ_FRAME_BUDGET`, `cinema_maxq.js:503` |
| Time Machine per frame | 1.3 ms (delta mode) | 0.8 ms | — | `§PERF_TRAVERSE` |
| JS heap during bake | 1.2 GB | — | — | `[heap] usedMB=1185` |
| memory scope peak, one LTU page | not captured in that run; read it from the next scoped LTU bake | 7.6 GB (Terminal clip) | 2.2 GB | `§BAKE_SCOPE_PEAK` |
| full LTU clip 0.52:0.97, 702 frames @640x360 | 2,632 s total: 633 s startup + 2.88 s/frame | | | `out/ltu_storey_lowres_full.log` |
| GPU | RTX 4060 Laptop, 8 GB; ~1.7 GB in use with one LTU page | | | `nvidia-smi` |
| RAM | 31 GB, ~23 GB available idle | | | `free -g` |
| full 1080p24 estimate | 4,346 frames × ~5 s ≈ 6 h + startup | HHS measured 0.65 s/frame at 1080p24 | | extrapolation, flagged |
| storey groups the reveal sees | 18 (for 5 physical levels) | 7 | 3 | `§STOREY_REVEAL_LIST n=` |

Clip-to-frame mapping (`cinema_maxq.js:1201, :1851`): a clip renders `round(N·span)` frames at
`tn_i = i/(n−1)` across `[in,out]` inclusive — a clip is NOT a frame-exact subset of the full film
(both ends land on a frame; the step differs from the full film's `1/(N−1)`). Matters for §2-L4.

## §1 What large-DB baking is NOT blocked by (verified today, do not re-open)
- sql.js and the 761 MB file: open 1 ms, query instant, export 252 ms (node, same library family).
- The renderer and a 761 MB ArrayBuffer: fetch → arrayBuffer → second fetch → second 761 MB copy → timers, 1.5 s in a bare page.
- Range streaming (`A._useRangeStream` / `httpvfs`): not needed for any of the above; the geometry has to be in memory to render anyway.
- IndexedDB caching: it is a hazard for a bake (a 761 MB `put` whose transaction never completes; a 760 MB `KRN_PERSIST` export), never a benefit — a bake profile is disposable. See L2.
- The Time Machine: 1.3 ms/frame. Activation is fast when the DB carries a captured schedule (`§CPE_BUILDUP_SOURCE source=captured`, LTU); it regenerates only when the persisted copy disagrees (§8.6).

## §2 RANKED LEVERS — each with its owner lane, its witness, and what "done" prints
**L1 — Precompute LTU's walkable raster (owner: PATH_LEGAL_SEGMENTS lane; 560 s → seconds).**
`common/room_graph.js:803` does a read-only lookup of the offline-precomputed per-storey raster when the
DB has `storey_walkable_raster`; without it every room→exit path is legalized from scratch. Hospital,
HHS and Terminal got theirs through the `buildings/patches/<db>.sql` self-heal patches (generated by
the `witness_<building>_walkable_raster.js` family in `~/bim-ootb`) and then SAVED into their `_silent.db`.
LTU has no patch and no table. DO: generate LTU's raster patch with the same generator, apply it, re-save
`LTU_AHouse_silent.db` (or ship `patches/LTU_AHouse_silent.db.sql`), and add ONE line to the bake so
the absence is never silent again: when the egress rule runs with no raster, print
`§PATH_LEGAL_NO_RASTER building=… legalizations=… ms=…`. WITNESS: `§PATH_LEGAL_RASTER storeys=…` present on
LTU; `§PATH_LEGAL` count and first-frame time before/after (633 s on the full clip run; target < 70 s).
**L2 — Bake mode persists nothing (owner: viewer load path, `scene.js`/`kernel_ops.js`/`time_machine.js`).**
One gate, `A._bakeOwned` (the bake already marks the Time Machine "silent, bake-owned"), that turns off:
the `cachedFetch` IDB write (761 MB structured clone, the transaction that never commits, and the reason
for today's 400 MB gate), `_persistToIdb` (760 MB export + IDB; also the trigger of §8.6's race), and the
gantt `§CACHE_PUT`. WITNESS: a bake log with zero `§CACHE_WRITE_OK`, `§KRN_PERSIST`, `§CACHE_PUT` lines
and `§CACHE_SKIP reason=bake`. Keeps Sonnet's `§CACHE_WRITE_HANG` timeout and `§CACHE_WRITE_SKIP_TOO_LARGE`
gate for the live viewer, where they still matter.
**L3 — Still budget on the CLI (owner: MEP_CLASH_REVEAL_MOVIE lane, `cinema_maxq.js:503`).**
`--still-budget taa,ao`; quick-check preset `2,3` (5 renders/frame instead of 20), delivery budget
chosen by the user per film. WITNESS: `§MAXQ_FRAME_BUDGET taa=.. ao=..` and seconds/frame from
`§SUN_ARC_STEP`; expected ~3× on LTU's per-frame.
**L4 — Parallel clip baking with frame-exact ranges (owner: `cli_silent_bake.js` + `cinema_maxq.js`).**
Frames are a pure function of `tFilm`; the page encodes with a keyframe at frame 0 of every bake
(`cinema_maxq.js:983`). Add `--frame-range a:b` that renders frames `a..b-1` of the FULL film at
`tn_i = i/(N−1)` (not the `--clip` remap), run K bakes on K ports under one `bake_scope.sh` each, concat
with `ffmpeg -f concat -c copy`. Capacity today: 3 LTU pages by RAM (measure `§BAKE_SCOPE_PEAK` of one
first), 4 by VRAM. WITNESS: bytes-identical frames at every seam between a K=1 and a K=3 bake of the
same 60-frame span (frame hashes printed as `§FRAME_HASH i=… sha=…`); `ffprobe` frame count = N.
**L5 — Staging churn per frame (owner: CPE_4D_PERF_MEM_FINDINGS §3 R1 / §2c, already spec'd).**
`SETTLE_MS=250` + full photo-staging teardown/rebuild per frame ≈ 660 ms/frame unattributed at 1080p.
Do after L3 so the measurement is of the same budget.
**L6 — Draw calls: batch key without storey (owner: streaming.js `:2210` bucket key).** §128.9 moved the
storey reveal to per-member label banding, so a batch no longer needs to be single-storey. LTU: 7,967
meshes for 122k elements, 18 storey labels multiplying the buckets. WITNESS: `renderer.info.render.calls`
before/after and `§STOREY_LABEL_WITNESS` still PASS.
**L7 — LTU's storeys: 18 labels for 5 physical levels, and the reveal's band ladder is not monotone
(owner: data = extraction / 4D_MODEL_INTEGRITY; guard + witness = the storey-reveal leg).**
User on the 0.52:0.97 clip (2026-09-14): "does not reveal the opening floor slabs and a bit others, it
ended up few last storeys correct." The log names why: `§STOREY_REVEAL_LIST n=18` (Ref./VÅN N/VÅNING N/
Storey N/Plan N/TAKPLAN for 5 levels; `§S18_STOREY_MERGE_FAIL no such column: elevation`), and
`§STOREY_CUT_BOUNDS base=0.81 tops=[0.70,0.70,4.39,4.65,2.70,7.64,5.44,8.03,8.84,8.06,10.90,11.09,2.99,
13.16,8.81,11.93,15.07,18.57] fromSlab=9 fromMidpointFallback=8`. Read as bands: the ground-slab pass
sweeps [0.81 -> 0.70], a negative band, so the opening floor slabs never sweep in; the ceiling then DROPS
five times (4.65->2.70, 7.64->5.44, 8.84->8.06, 11.09->2.99 at TAKPLAN, whose "slab bottom" is a
slab-on-grade the groundwork rule reclassified, and 13.16->8.81), re-clipping storeys already revealed;
only the last slots, whose tops finally ascend (11.93, 15.07, 18.57), read correctly. §122's premise
"the ceiling is monotone" is false on this building. All four witnesses PASS because none checks the
ladder. TWO halves, both real: (a) DATA: ship `elevation` in `spatial_structure` for federated exports so
§S18 merges the labels (`§STOREY_DATUM` already resolves them into `bandsUsed=5` for the 4D ruler; the
reveal should group labels by that same datum band, one ruler for the film); (b) LEG: the ladder must be
monotone by construction and say so, `§STOREY_CUT_BOUNDS ... inversions=N` with a FAIL verdict when N>0
or base>tops[0] (expected today on LTU: inversions=5, base>tops[0]=true), and a zero-height band must never
get a slot. Also the window: 18 groups asked for 1,318 s of reveal (`§STOREY_REVEAL_RUNWAY
wantShapeSec=1318`) and RISE_GROW gave them 120 s of a 181 s film; merging to 5 groups shrinks that to what
the ruling intends. Not fatal, the user's words; do it after L1-L4.
**L8 — §8.6 fix 2 (persist gate) for the LIVE editor** stays as filed; for bakes it is subsumed by L2.

## §3 EXECUTION ORDER (work to zero; spec → witness → implement → one bake → read the log)
1. L1 raster for LTU. Prove: first frame < 70 s on the 0.52:0.97 clip, `§PATH_LEGAL_RASTER` present.
2. L2 bake-owned persistence off. Prove: the zero-line witness above; the 400 MB gate never fires in a bake.
3. L3 still-budget CLI. Prove: quick preset seconds/frame on LTU and HHS; no change with the default.
4. L4 frame-range + concat + runner. Prove: seam equivalence witness; then a full LTU 1080p24 in K=3.
5. L5, L6 in that order, each with its before/after number. L7 is a data ticket for the extraction lane.
6. Commit order (§4) before any of this if the user wants the branches merged first.

## §4 REVIEW OF THE RETIRED SESSION'S WORK (2026-09-14) — all correct, all uncommitted, some duplicated
- `feat/storey-section-cut` (`/tmp/wt-storey-cut`): Fable's §128.8/§128.9 storey reveal + three witnesses;
  Sonnet's §8.7 sidecar fix (both call sites, plus the `FATAL_RX` gotcha: the sidecar probe must be a plain
  `fetch`, never `cachedFetch`, or the CLI aborts on the expected 404) and a COPY of the IDB gate/timeout.
  LTU verified: `§STOREY_LABEL_WITNESS 121635/121635`, `§STOREY_ARM_BASELINE 0/7959`,
  `§STOREY_CUT_RESTORE_WITNESS 0/122330`, `§CLI_BAKE_WALL fileOk=true`. This is the umbrella branch: PR it.
- `fix/idb-cache-write-timeout` (`/tmp/wt-idb-cache-timeout`): the ORIGINAL of the IDB gate/timeout and a
  duplicate of the sidecar fix. Its hunks are inside the umbrella; confirm with a diff and drop the branch
  rather than merge twice.
- `fix/krn-persist-race` (`/tmp/wt-krn-persist-race`): the §8.6 write-loop fix (re-prepare per chunk,
  ROLLBACK on throw) + `exportsSurvived=` counter. Verified only weakly: run 1 printed `exportsSurvived=0`
  (the race did not fire that run), run 2 hit `§GANTT_CACHE_HIT`. The fix is right by construction; its
  "fires" proof needs a run where an export lands mid-loop. PR separately.
- Item 12 in MEP §128.10 ("localize first, bake from the saved copy") is right and is L1's premise.
- The earlier "0 % CPU wedge" reading was the wrong process; the LTU renderer ran at 700–790 % CPU to a
  V8 OOM (§8.7). Sonnet's own §CACHE_WRITE_HANG finding (put succeeds, transaction never completes at
  761 MB) is real and separately reproduced (`§CACHE_WRITE_OK` then silence) — L2 removes it from bakes.

## §5 GOTCHAS THAT COST TIME TODAY
- `pkill -f`/`pgrep -f` patterns that appear literally in your own command kill your own shell (exit 144).
  Build patterns at runtime from variables, exclude `$$` and `$PPID`, or use fresh ports/profiles and
  let old runs die on their watchdog.
- Every LTU page peaks at several GB; the host killed a background job for low memory once today. One
  LTU bake at a time until `§BAKE_SCOPE_PEAK` has been read for one.
- `--clip` is not frame-exact (§0). `--frames N` is a frame COUNT, not a range.
- Puppeteer console pipes go silent when the renderer is busy or dead; the CLI waits its full 15-minute
  load timeout on a crashed page. `Target.getTargets` titles and `sendBeacon` are the two channels that
  still work; `page.evaluate` timing out ≠ blocked (the LTU case was 700 % CPU).
- `bake_scope.sh` is mandatory (§91.4); a run without it shows no `§BAKE_SCOPE_PEAK`.

## §6 DO NOT
Finish range streaming for this; add per-building constants; gate on DB size; treat frames as evidence;
run two LTU bakes at once; commit `.db` files.

## §7 SESSION RESULTS (2026-09-14 evening, Sonnet) — L1/L2/L3 DONE and bake-verified, L4 PARTIAL, do not ship K-way yet

**L1 DONE.** `node scripts/build_storey_walkable_raster.js ~/Downloads/LTU_AHouse_silent.db "" out.sql` ran
in 20 s, built 4 storeys (VÅNING 1-4, 69/66/75/58% coverage), applied directly to
`~/Downloads/LTU_AHouse_silent.db` (the file every worktree symlinks to) and copied to
`buildings/patches/LTU_AHouse_silent.db.sql` for provenance. Standalone G2/G3-style sweep before shipping:
baseline DETOUR_FAIL 4.1%→1.0% with the raster, fixed=93 newlyBroken=0 (PASS, same invariant as the four
sibling witnesses). `common/room_graph.js`'s `_legalizePath` now accumulates `graph._legalizeStats`
(calls/legalized/detoured/ms); `viewer/egress_sanity.js`'s `evaluate()` prints
`§PATH_LEGAL_NO_RASTER building=… legalizations=… calls=… ms=…` once, at the end of its rule 2/3 sweep,
whenever `graph.rasters` is empty and at least one legalization ran — the absence is never silent again.
BAKE WITNESS (`LTU_AHouse_silent`, clip 0.9187:0.9500, 640x360@10): `§PATH_LEGAL_RASTER
storeys=VÅNING 1,VÅNING 2,VÅNING 3,VÅNING 4` present; first `§SUN_ARC_STEP` 67.9 s (was 627 s, target <70 s
— hit); **zero** `§PATH_LEGAL`/`§PATH_LEGAL_DETOUR*` lines fired at all — with a raster, `escapeRoute()`'s
own exit detection now succeeds for 394/397 rooms directly (`viaFallback=0`), so the expensive
from-scratch-legalization fallback this lever targets is barely ever reached, not just faster.
`§STOREY_LABEL_WITNESS`/`§STOREY_ARM_BASELINE`/`§STOREY_CUT_RESTORE_WITNESS` all still PASS (no regression
to §128.8/§128.9). Files: `common/room_graph.js`, `viewer/egress_sanity.js` (worktree `/tmp/wt-storey-cut`).

**L2 DONE.** `A._bakeOwned = !!window.__MAXQ_SILENT` set at the top of `scene.js` (that flag is already
true from `evaluateOnNewDocument`, before page scripts run, in every CLI bake — the earliest possible
signal, well before Time Machine ever activates). Gated behind it: `scene.js` `cachedFetch`'s IDB write
(both the size-gated and normal paths; `§CACHE_SKIP reason=bake`), `viewer/kernel_ops.js`'s
`_persistToIdb`, `erp/kernel_ops.js`'s `_persistToIdb` (own `§KRN_PERSIST_SKIP reason=bake`), and
`time_machine.js`'s `cachePut` (gantt/movie/hrCost; `§CACHE_SKIP key=… reason=bake`). **Found via the bake
log, not by reading code first:** `viewer/kernel_ops.js` is DEAD — `viewer.html` loads only
`../erp/kernel_ops.js` (its own comment at ~line 952 says so), so the first fix landed in an unloaded file
and `§KRN_PERSIST` kept firing from the ERP copy until that was found and patched too. Left the
viewer/kernel_ops.js fix in place (harmless, consistent) but flag the dead file itself as a live drift
matching CLAUDE.md's "duplicate, disagreeing implementations" warning — not fixed, out of this session's
scope. BAKE WITNESS: zero `§CACHE_WRITE_OK`, zero `§KRN_PERSIST` (only `§KRN_PERSIST_SKIP reason=bake`),
zero `§CACHE_PUT`; `§CACHE_SKIP reason=bake` present for both the 761 MB DB and `ad_seed.db`; storey
witnesses still PASS. Files: `viewer/scene.js`, `viewer/kernel_ops.js`, `erp/kernel_ops.js`,
`viewer/time_machine.js` (worktree `/tmp/wt-storey-cut`).

**L3 DONE.** `--still-budget taa,ao` CLI flag (validated `a,b` pair) threads through `bakeOpts.stillBudget`
→ `__maxqBake`'s `start({...stillBudget})` → `A._stillBudget`, overriding the hardcoded 8/12; absent flag
is byte-identical to before (confirmed: every L1/L2 bake above ran with no override and printed the
unchanged default). BAKE WITNESS: `--still-budget 2,3` → `§MAXQ_FRAME_BUDGET taa=2 ao=3 (CLI override)`;
seconds/frame 3.1-3.3 s → 1.7-1.8 s (~1.8×); total wall on the same 49-frame clip 189-227 s → 112 s;
`§CLI_BAKE_STILL_BUDGET taa=2 ao=3` logged once at bake start. Files: `viewer/cinema_maxq.js`,
`cli_silent_bake.js` — landed in BOTH `/tmp/wt-storey-cut` (tested there, alongside L1/L2) and
`/tmp/wt-bake-perf` (identical diff, that worktree's stated ownership of these two files for its own PR).

**L4 UPDATE (2026-09-15, Sonnet) — root cause found and fixed, see the follow-up paragraph after this one.**

**L4 PARTIAL (original write-up, kept for the diagnostic trail) — do NOT run the K=3 full-1080p24 delivery yet, a real seam artifact would land in the film.**
Built: `--frame-range a:b` CLI flag (mutually exclusive with `--clip`, refused at the arg parser),
`_frameRange = {a,b,total}` in `cinema_maxq.js`, the render loop's `_tn` now reads
`(frameRange.a+i)/(frameRange.total-1)` (the FULL film's own step, bypassing `_tFilm`/`--clip`'s different
grid per §0), and a `§FRAME_HASH i=<globalIndex> sha=<sha256×16hex>` line per captured frame (hashes the
ENCODED blob, keyed by global index) as the seam-equivalence witness §2's L4 spec asks for. **The witness
did its job and failed a real bug:** two `--frame-range` bakes of the SAME global frame (a=780) with
different `b` (781 vs 785 vs 790, i.e. different LOCAL frame counts for the run) rendered visibly
different camera framing — confirmed with a pixel diff (mean abs ~33/255, clearly structural, not
exposure) and side-by-side crop — despite `§SUN_ARC_STEP`'s logged `tNorm`/`elevation` matching to 3
decimal places between the two runs. Fixed one confirmed leak on the way (`_filmSecFull` fell through to
the post-narrowed, run-local `nFrames/fps` instead of `frameRange.total/fps` — the same class of bug
`--clip` already guards against, per that code's own comment "a full bake is unchanged … when no clip is
set") but it changed nothing measurably (identical pixel diff before/after the fix, 32.7-32.8). Isolated
so far: (a) two IDENTICAL `--frame-range 780:781` invocations, separate processes, are byte-identical —
the renderer is deterministic when nothing about the run differs; (b) camera pose is a real, structural
shift, not TAA/AO noise (`accumulateIndex` converges to the same count in both runs). Not yet isolated:
WHERE in `A.cinemaPathPlan` (effects.js) a LOCAL, run-relative frame count leaks into what should be a
pure function of `(duration, override)`. Next step for whoever picks this up: dump/diff the `plan` object
itself (waypoints/bands) built for `--frame-range 780:790` vs `780:785` before any frame is rendered —
everything upstream of that call is now proven identical between the two runs, so the bug is inside
`cinemaPathPlan` itself. CLI plumbing, tNorm math and the frame-hash witness are otherwise ready to reuse
once this is found. Files: `viewer/cinema_maxq.js`, `cli_silent_bake.js` (worktree `/tmp/wt-storey-cut`
only — not yet ported to `/tmp/wt-bake-perf`, unlike L3, until the seam bug is fixed).

**L4 FIXED (2026-09-15, Sonnet, bisection lead per Fable's suggestion).** Not inside `cinemaPathPlan` after
all — a temp `§L4_PLAN_DUMP` right after `plan = A.cinemaPathPlan(...)` proved the plan object
(waypoints/bands/beats/naturalTotal) is byte-identical between `--frame-range 780:790` and `780:785`
(removed once the real site was found). The camera POSITION was always correct (pure `_tn`); only the
LOOK-AT target moved. Root cause: `_blendedGazeTarget`'s `gazeBlendHalf = 1.5 / Math.max(1, nFrames - 1)`
(cinema_maxq.js, "§57.5 — smooth the camera's LOOK DIRECTION across a small tNorm window") sizes its
sampling window in units of "one frame of THIS run" — correct for a normal/`--clip` bake, where `nFrames`
IS the run's own frame count, but wrong in frame-range mode, where `nFrames` has already been narrowed to
the LOCAL slice (`b-a`). A 10-frame run and a 5-frame run blended gaze direction over 17% vs 37% of the
WHOLE FILM's arc instead of ~0.17% each — two completely different, run-size-dependent windows, explaining
why position matched but framing didn't. Fix: `gazeBlendHalf = 1.5 / Math.max(1, (_frameRange ?
_frameRange.total : nFrames) - 1)` — one line, `_clip`/normal bakes untouched (`_frameRange` is null
there). WITNESS: `--frame-range 780:790` (K=1) vs `780:785`+`785:790`+`790:795` (K=3 split) on the same
`--no-buildup --no-clash --no-storey-reveal --no-label --no-reveal --no-measure --still-budget 2,3` config
— 13/15 `§FRAME_HASH` values byte-identical. The 2 remaining mismatches are the FIRST frame of each
parallel sub-process (785 in the 2nd worker, 790 in the 3rd) with a pixel diff an order of magnitude
smaller than the original bug (mean abs 3.4/255 vs 32.7/255 before the fix) — consistent with the SAME
per-process staging warm-up settle every bake's own frame 0 already pays relative to frame 1 (see
`§MAXQ_WARM` / the warm-up fold before the frame loop), not a camera/pose defect. Not chased further this
session — if a K-way delivery needs ZERO residual, the cheap mitigation is each worker rendering one
throwaway "priming" frame before its real range starts and discarding it, so the warm-up cost never lands
in a delivered frame. **Correction to the L3 write-up above:** L4 (the whole `--frame-range` feature, not
just this fix) was never ported to `/tmp/wt-bake-perf` — only L3's `--still-budget` lives there. L4 exists
only in `/tmp/wt-storey-cut`. Since that worktree is the umbrella branch (§4), this is fine as-is; no port
needed unless someone specifically wants `--frame-range` on `wt-bake-perf`'s own branch. Still open before
a real K=3 1080p24 delivery: run the same K=1-vs-K=3 comparison at DEFAULT quality (8/12, not the 2,3 test
budget) at least once, since the residual's magnitude was only measured at the degraded test budget.

**Housekeeping:** `~/Downloads/LTU_AHouse_silent.db.pre-raster-backup` (726 MB, pre-L1 copy) still sits
next to the live file — an attempted cleanup was blocked by a safety gate (shared-scratch + backup-file
guard); safe to delete once the raster patch is trusted. All code changes above are UNCOMMITTED, per
standing instruction (§4's own "commit only when the user says" carries forward).
