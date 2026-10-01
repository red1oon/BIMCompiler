<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — MODELLER MASTER: the single entry point for "make the Modeller work"

```
SCOPE: the DAGeVu Modeller (bim-ootb `modeller/*`) as a WHOLE — every objective below must be met, not
a subset. This file is the INDEX + CONTRACT; the 15 per-topic files it triages stay authoritative for
their own detail. Read the log after every run (Log Mandate). Read the §PRIME LESSON before any
diagnosis. Created 2026-07-30 at the user's instruction: "triage the modeller prompts/# consolidate
them to some master prompts/# ... so that with that prompt we be launching a dedicated session to
study deeply how to make the Modeller work", and "all the objectives of the Modeller must be met.. as
i have no time to sight, i rely on a good vibe coder to do so."
```

## ⚖ §STRATEGY-ASSEMBLE-HANDOFF — the governing product direction (red1 2026-09-27). Ranks everything below.
> *"Our strategy is to leave fine detail creative authoring to those models that users are familiar with but to bring to
> us to assemble and hand off all the rest."*

**The true parametry is ours (red1, same day: "able to take any created model, those aesthetic bits and we refine it
more better").** Authoring tools hold parameters only for what the author typed in; we EXTRACT the grammar from any authored
model — BOM sets, bay ratios, storey heights, MEP densities, host↔filling relations — keep its aesthetic parts at LOD400, and
refine from that grammar. This is the Red Pill / "New from Reference" idea already written up: `docs/RED_PILL.md` §1 and
`docs/internal/NEW_FROM_REFERENCE.md` §1 (IFC → SQLite → verified reconstruction is the inverse; grammar → refined design is
the forward path). The Modeller is NOT a creative authoring tool. Users author in Revit/ArchiCAD; the Modeller must do three things well:
1. **IN — faithful import:** authored LOD400 geometry and relations survive (openings, fills, layers, anchors). A user's OWN
   IFC must get what the residents get — whether the local-IFC open path writes `rel_fills_host` is UNVERIFIED (measure it).
2. **ASSEMBLE — edits on authored parts:** walkers generating MEP, BOM assembly, grid stretch, slide/insert openings,
   copy/array along a host, the universal handle set (§SLOPE-HANDLES) along measured build lines.
3. **OUT — hand-off:** IFC export carrying storeys, Psets, materials (§IFC-EXPORT-DEPTH), plus 4D/5D and ERP.
**No original object making (red1, same day: "we dispense off with original object making. We take any object and mould
it further").** Every object in the Modeller starts as an existing authored object — from a resident, a user's IFC, or the
extracted catalog/BOM libraries — and is MOULDED (stretch, slide, cut, copy, handles). Decided consequences:
- The Sketch tool (`#b-sketch`, `bonsai_sketch.js` + planegcs) is the LIFEBELT (red1: "we may create basic design from scratch,
  but it is just a lifebelt"): basic from-scratch design when no source object exists. Keep it working (its witnesses stay
  green); fix it when it breaks; do not grow it toward a full authoring tool — the main path is always mould-an-existing-object.
- **A sketched object is a PLACEHOLDER that a final crafted object replaces** (red1: "it can be a placeholder, where a final
  well crafted object replaces it"). This does NOT reopen the no-box rule: that rule bans a box SILENTLY standing in for
  missing geometry. A placeholder is DECLARED — created deliberately by the user, flagged on its op (`placeholder:true`),
  visibly marked, counted apart from LOD400 elements, and tagged as a placeholder on export. Automatic fallbacks stay refused.
- **REPLACE verb (not built — measured 0 hits for replace/swap in modeller/):** swap a placeholder (or any object) for a
  crafted one from any source as ONE signed op, keeping its placement and relations (host, fills, cuts). Queued after
  insert-with-opening, which it shares code with.
- A catalog product with no real source mesh is not an object to mould ⇒ insert REFUSED, never a box (answers the row-14
  question: rebind from the extraction source in the restored BOM libraries; what cannot be rebound stays unavailable).
- Insert-with-opening = place a COPY of an existing authored door/window (any source) into a wall, cutting its opening.
- The slide witness's sketched-wall case (S8 plain-extrude) is not a priority case.
**Out of scope (do not list as gaps):** from-scratch wall drawing, type/family editing, dimension constraints, stair/railing/
curtain generators, documentation sheets.
**Queue, in order (decided 2026-09-27):** (a) §SLIDE-REAL-WALLS Phase B (in progress) · (b) §IFC-EXPORT-DEPTH — the OUT half is
thin today (products carry geometry + class only) · (c) IN-check: open a third-party IFC locally and measure that its
openings/fills/storeys survive · (d) insert-with-opening · (e) §SLOPE-HANDLES · (f) row 14 catalog rebind from the restored
`library/DX_BOM.db`/`SH_BOM.db` (May 22 backups, restored locally 2026-09-27).

## 🔎 §VISION-REVIEW 2026-09-28 — every shipped Modeller feature vs §STRATEGY-ASSEMBLE-HANDOFF (asked by red1)
Inventory: bim-ootb main toolbar (28 buttons) + 39 `modeller/*.js` modules, read 2026-09-28.
**Aligned:** Open (IN) · grid drag + openings anchor/ride (ASSEMBLE) · move / multi-select / snap · item drag + host snap ·
room move · walkers generating MEP from mined patterns, LOD400-or-refuse · Cut on authored walls · Insert library component
("assemble, don't draw") · Save + gate · Export (OUT, but thin) · World History / Connect / Teams (process + future sharing) ·
X-ray. Red Pill "New from Reference" (grammar → design) is the vision itself, not object making.
**CONFLICTS (fix):**
- C1 **LOD button (`#b-lod`, 200⇄300) + `lodFor(...,'200')` default** — LOD200 IS the box; the rule is LOD400 or refuse. The
  insert path still starts every catalog component as a box (`foldInsert` `boxArrays(c.bbox)` unless lod==='300').
  → retire the 200 state; an insert shows its real mesh or is refused (same fix as row 14 / §CATALOG-REBIND).
- C2 **ModellerGuide.md:216** tells users an insert "lands as a LOD-200 box that lazily refines" — the doc teaches the
  banned fallback. → rewrite with C1.
- C3 **Scale handles + typed `x1.5` (`GEOM_SCALE`) stretch ANY insert's mesh**, incl. real authored doors/furniture —
  that distorts authored geometry (a 1.5× door = a stretched door, not a wider real door). OK for plain extrusions (a wall
  lengthens = more wall), wrong for crafted objects. → gate scale to plain-extrusion hosts; crafted objects are
  REPLACED (the REPLACE verb) or edited via measured handles, never stretched.
**DRIFT (outside the vision, keep as lifebelt, do not grow):** Sketch/Extrude/Constrain (documented as the main way to
"draw a wall" in the guide — relabel as the lifebelt/placeholder path) · Fillet (fine creative detail) · Route sweep
(`#b-route`, manual MEP drawing — the walkers are the main path). None is flagged `placeholder:true` yet (the declared-
placeholder rule is not built).
**REDUNDANT / OVERLAPPING:**
- R1 §SLOPE-HANDLES vs the SHIPPED gizmo handles (MODELLER_DIRECT_MANIPULATION.md P1/H2/H3: move axis, rotate ring, scale
  cubes, snap) — the universal handle set must GENERALISE these, not add a second handle system.
- R2 Routing: `modeller/routewalker.js` + `viewer/routewalker.js` (duplicate, handed to Viewer lane) + `disc_walker.routeChains`
  + manual `#b-route` — four ways to make a run; one engine should own it.
- R3 Five outliners (`bonsai_outliner`, `bom_tree_outliner`, `building_parts_outliner`, `dw_instances_outliner`,
  `str_walker_outliner`) — row 5's incremental unification call stands; not re-litigated here.
**Vision now answers an old blocked row:** row 29 (`CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`, grid ⊗ BOM as one substrate,
"is this still the intended architecture?") — the extracted grammar (BOM sets + bay ratios + grid) IS "the true parametry
is ours" ⇒ aligned; move it from ⛔ to the queue after the catalog rebind.
**Queue impact:** C1+C2 join row 14 (catalog rebind) and move up — they are live no-box violations, ahead of §SLOPE-HANDLES.
C3 lands with the REPLACE verb.

## ▶ §RESUME 2026-09-30 — START HERE (supersedes §RESUME 2026-09-27 as entry point; read that block second).
## A corrected "Close the Modeller Gap" session prompt. Every status below was checked on 2026-09-30 against bim-ootb
## `origin/main` @ `3f962fb7` and this file on bim-compiler `origin/master` @ `659524c4e`.

**Why this block exists:** red1 pasted an outside draft prompt ("Close the Modeller Gap", written by DeepSeek). Its rules
were right, but its work list was the **2026-07-30 status column** of §OPEN LIST. That column is superseded by §SWEEP
2026-09-15 and §STRATEGY-ASSEMBLE-HANDOFF 2026-09-27. Launch sessions from THIS block, not from that draft.

**What that draft had WRONG (all verified closed or changed — do NOT redo):**
- Row 34 anchor save: ✅ bim-ootb #1787 MERGED 2026-09-27 (W-E2E-ANCHOR-SAVE-ROUNDTRIP 6/6). IFC half: #1747.
- Rows 19, 23, 24, 28, 32: ✅ closed in §SWEEP (#73, #1704, #1738). Row 23's D3 wording is dead; what is left open is the
  `ELEC over-count 1754 vs real 833 = 2.11×` finding. **→ 2026-09-30: that 2.11× was the legacy walk; the production walk measures
  0.91–1.05× (§SESSION 2026-09-30). Stale.**
- Row 12 `rel_fills_host`: ✅ #1749. Row 36 empty IFC export: ✅ #1747 (the export is still THIN — see §IFC-EXPORT-DEPTH).
- Row 29 (grid ⊗ BOM): NOT blocked any more. §VISION-REVIEW says it fits the strategy → it joins the queue after the catalog rebind.
- Row 14: its Dining_Chair example no longer reproduces (upright, 1.227 m). §STRATEGY answers the row: rebind the mesh from the
  restored BOM libraries, or refuse the insert. Never a box.
- Per-layer slab colours: optional in the LOD400 file. PBR / BCF import (row 25): deferred by design. Neither is Tier-1 work.

**THE QUEUE — in this order (§STRATEGY queue + §VISION-REVIEW move-up). Nothing outside it without red1's word:**
1. **§SLIDE-REAL-WALLS Phase B** (spec + Phase M result: `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §SLIDE-REAL-WALLS).
   Order SampleHouse 7 → Duplex 36 → SampleCastle 5.
   **→ SampleHouse ✅ DONE 2026-09-30b (W-E2E-SLIDE-REAL 9/0 LIVE, #1793): 2 slideable after M5 (5 refused, brep bodies carry
   their openings). Duplex 36 (M5-clean) and SampleCastle 5 = next sessions.** Witness W-SLIDE-REAL-WALL, RED on today's main (refusal).
   Check first whether a Phase B branch already exists (§STRATEGY said "in progress" on 2026-09-27; on 2026-09-30 no
   branch and no main commit found by grep).
1b. **§GRID-SPAN-GATE (row 38, red1 2026-10-02)** — wire the EXISTING span check into the grid drag, then "split the bay". Spec in row 38.
2. **§IFC-EXPORT-DEPTH** — storeys, materials, Psets, void relations. Round-trip witness on Duplex.
3. **IN-check** — open a third-party IFC locally and measure that its openings, fills and storeys survive (does the local
   open path write `rel_fills_host`?). Measure only; the gap found becomes its own row.
4. **Insert-with-opening** — on the Phase B substrate.
5. **Row 14 catalog rebind + C1 + C2** (no-box violations, live): retire LOD200 (`#b-lod`, `foldInsert` `boxArrays`);
   rewrite `ModellerGuide.md:216`. A product with no real mesh → insert REFUSED.
6. **§SLOPE-HANDLES** — generalise the shipped gizmo handles (R1). Do not build a second handle system.
7. **REPLACE verb + C3** (gate scale to plain-extrusion hosts only). Declared placeholders (`placeholder:true`).
8. **Row 29** grid ⊗ BOM (`CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`).

**⚖ CORE BEFORE LOOKS (red1 2026-09-30: *"I rather focus on the core Modeller operationality rather than aesthetic unless
the building blocks are confidently well WITNESSED and tested"*).** Work on how the Modeller LOOKS is PARKED: row 13 (N8AO /
§ROW13-RESCOPE), row 11's on-screen colour, per-layer slab colours, row 25 PBR, lighting/shadow tuning. It unparks only
when the core witness net is green on bim-ootb main with no known-red entries. Today it is not: W-E2E-INSTHIDE H1-rig ·
dw_rot_units · git_history · terminal_walk · render_fidelity · W-DISC-DENSITY D3/D4 (list in §RESUME 2026-09-27; net state in
`WITNESS_INTERFACE_FRAMEWORK.md` §MODELLER-NET-AUDIT). Each known red counts as core work: fix it, or re-point the witness
RED-first with the reason written down. Never delete it to get green.
**→ 2026-09-30 (§SESSION 2026-09-30 below): all six worked — git_history ✅ 8/0 · INSTHIDE ✅ 17/0 · dw_rot_units ✅ · terminal_walk ✅ 11/0 ·
render_fidelity ✅ (was a stale claim) · DISC-DENSITY D3/D4/D4b ✅ with D4c answered 2026-09-30 (option b, per discipline once its router is proven — build slice queued).
Three of them hid product bugs (twin-hide dead, walk facing dropped, band envelope on raw origins) — all fixed on that PR.**
**Still open, and worth doing BETWEEN queue items only when they are cheap:** row 6 (Terminal 0 MEP — accept or fix) ·
row 10 (Terminal open speed on the LIVE URL; local was 20,592 ms headless — do not diff that against the old 14 s) ·
row 11 material DATA only (names/RGB into the IFC export — queue item 2; on-screen colour is aesthetic, parked) · row 22 (revert-a-RED, rtree prune) ·
the §XEDGE residual 11 · ~~the ELEC 2.11× over-count~~ (stale 2026-09-30 — legacy-walk number; production 0.91–1.05×).
**Do not start:** anything cosmetic (see CORE BEFORE LOOKS) · row 7 (heavy, red1's word first) · rows 25, 26, 30 (deferred) · the SampleCastle sporenkap refusal
(honest, stays RED) · re-opening rows 1 and 4, the ARC-only filter, or the renderer LOD audit.
**⛔ red1's calls — ask ONCE each, then move on:** row 15 (220 MB `component_library.db`: GH or OCI?) · row 21 · row 27 · row 31.

**Rules for the session (from the draft, plus what it left out):**
- The §PRIME LESSON order for any "looks wrong" report: curl every live asset (size + magic header) → read what the code
  substitutes when an asset is missing → check SW version + precache → only then explain.
- Spec paragraph first, naming the falsifier. If none can be named → ⛔ with the one question.
- RED-first: show the witness fail on unmodified main. Then prove the fix FIRES (grep a real `§` line), then prove it on
  the LIVE URL for anything user-visible (real bytes, not a 200).
- Bump `modeller/sw.js` `CACHE_VERSION` on every served change — read it from the file (it was **v64** @ `3f962fb7`).
- DB changes: SQL patch + self-heal loader, never a binary. One commit per fix. Never soften a gate.
- Worktrees: run `git worktree list` first and reuse one if it exists; new ones go in `/tmp/wt-*`; never edit `~/bim-ootb`.
  At close, prune only worktrees that have 0 commits ahead, are clean, and have no live process in them. The 13 listed in §RESUME 2026-09-15 hold real work — leave them.
- Sub-agents run on Sonnet. Findings go in THIS file (a dated section), not `MEMORY.md`. Push before you end —
  0 commits ahead of origin.
- Mark every item in its own row: `✅ DONE (witness)` or `⛔ BLOCKED: <one question>`. Rows closed elsewhere must be
  closed in the table too.

**Report at session end — this format only:**
```
§ SESSION <date>
Worktree: <path> · branch: <name> · sw: v<NNN>
Done:     ✅ <item> — <one line> · witness: <name> (<n/n>) · PR/commit: <ref>
Blocked:  ⛔ <item> — <the one question>
Stale-claims found: <file:line> claimed open, verified shipped at <sha>
Next session starts at: <queue item>
```
"Is it done?" is binary: yes only if every queue item is ✅. Otherwise no, and name the blocker.

## ▶ §SESSION 2026-09-30 — Part A of red1's "make the CORE witness net trustworthy" prompt: the six known reds, to zero.
## Measured on bim-ootb `origin/main` @ `8311ba5f` (baseline logs first), fixed on branch `fix/modeller-core-net`
## (worktree `/tmp/wt-mnet-core`), bim-ootb PR **#1792 — MERGED 2026-09-30 10:04 UTC as `5c5b01b4`**. Every number below is read from a saved run log.
**Method (the prompt's, kept):** re-run each red on unmodified main → root-cause from code + `§` lines → fix the code
RED→GREEN, or re-point the witness RED-first with the reason in its header. Nothing deleted, nothing loosened. **Three of
the six were hiding PRODUCT bugs behind an INCONCLUSIVE or empty-population witness** — the §CRISIS shape again.

| item | on main 8311ba5f | cause (file) | what shipped | now |
|---|---|---|---|---|
| **git_history** | 7/1 — G6 `active=[1,2] want=[1,4]` | `modeller_history.js` `_restore`: a commit node replays through the LIFO boundary (`O.undo()/O.redo()`); a direct switch between two non-trunk tips leaves {B,C} freshly undone beside D, so the lowest-id-undone pick was B | **§MHIST-SWITCH-TARGETED** — when the boundary's own pick is not one of the node's `ids`, replay them through the existing `setUndone` (§MHIST-ROWS); the linear path is untouched (gridundo U6 still 8/0). `§MHIST_TARGETED` logs the divergence | ✅ **8/0** |
| **W-E2E-INSTHIDE H1-rig** | 2/1 INCONCLUSIVE — no pose found, so H1–H9 had not run since 2026-09-26 | rig: the ARC walls/slabs occluded every twin. **PRODUCT (found once the rig ran):** `modeller.html` `_dwTwinFids` matched `placement.z` exactly, but since §LIVEWIRE a hash placement commits its SEAT there and the centre in `_dw.cz` → 0 twins → the eye hid only the instance = **zero visible change on every LOD400 walk fixture** (§I5b-TWIN's own measurement: instance-only = 0/12 pixels) | **§I5b-TWIN-CZ** (match the centre). Rig: §IH-ISOLATE (ARC hidden for the walk leg, re-applied after every eye click — `_applyHidden` resets all visible), §IH-FRONT (frontmost object by raycast replaces the 24-px readPixels hashes: two reads with no scene change differed = PIXEL-AS-PROOF), controls H1-pre / H3-ctl / H5-pre, the camera re-posed after every real click (the select fly moved it). `FALSIFY=1` → H1/H2/H3 RED | ✅ **17/0** |
| **dw_rot_units** | 1/5 — `recs=0`: SampleHouse ELEC refuses under §WALK-LOD400-ONLY (28 hashless legacy placements), the witness judged nothing | **PRODUCT:** `disc_walker.js` `placeSchedule` wrote each wall-anchored device's facing (`_schedFacing`/`_snapToWall`) to `rot`; the renderer (`makeRotationZ(p.yaw)`) and the commit (`placement.rot = p.yaw·180/π`) read `yaw` → **all 102 Duplex ELEC fixtures were drawn and signed at 0°** | **§SCHED-YAW** — emit `yaw` = the facing in the mesh's own frame: the thin horizontal axis (read off the vertex buffer — receptacle `031416…` is 0.0587 m deep on local X, `23c614…`/`4730c9…` on local Y) is the depth and turns onto the wall normal. Witness re-pointed to the Duplex ELEC production walk: 58 wall-anchored; R2 preview / R3 signed rot **39/58 → 58/58**; R4 measures the folded WORLD footprint against the wall run | ✅ **6/0** (R4 52/52 flat along the wall; RED with main's `disc_walker.js`: 3/3 — R2/R3 39/58, R4 33/52) |
| **terminal_walk** | 5/5 — FP/ELEC `placed=0` on SampleHouse | the witness asserted a HOUSE loads `terminal_rules.db` (contradicts the Walker Doctrine) and that FP/ELEC place >0 there — under LOD400-only both refuse (FP 17 + ELEC 28 hashless legacy placements, `§DW-LOD400-REFUSE`) | re-pointed to the building class the rules were mined for: Terminal resident (FP **974** / ELEC **744** LOD400 fixture instances == placed, routed tubes counted apart, gate flags == red instances) + one house claim (duplex_rules.db loaded at WALK time, FP → honest refuse, 0 instances, no box). `FALSIFY=1` blanks `resolveHashes` → T4/T5/T6/T7 RED (run, 5/5 red as designed) | ✅ **11/0** |
| **render_fidelity** | GREEN — SH 646 / DX 186 / SC 74 / HHS 311 tris/element, verdict REAL ×4; `BREAK=1` trips ×4 (now `tris=2 hardFail=N`: §GEO-SERVED-DEGRADED draws nothing) | **STALE CLAIM** — nothing to fix | — | ✅ stale |
| **W-DISC-DENSITY D3/D4** | 5/3 — D3 `ELEC 33/35 FP 368/703` (graded **35 of 878** ELEC: measured-band placements carry a Terminal `storey_scope`, not a substrate storey — scope-blind), D4 vacuous, D4b ACMV −28% (the whole-disc oracle counted duct runs) | re-baselined on the LOD400 production walk: D3 grades each banded placement against ITS band's ARC envelope + the engine's logged `§NOSPACES-TOPUP`; D4/D4b per CLASS. **That exposed PRODUCT:** `placeMeasured` built its band bbox + cells from RAW `element_transforms.center` (§BUG-A: the placement-line origin) → top-up grid points up to **9.9 m outside the real building** (OFFBOX PLB 47 / ELEC 142 / FP 79 / ACMV 93) | **§BAND-MIDPOINT** — envelope + cells on `_trueMidpoint` (cached per guid); the COUNT keeps the miner's raw-bbox parity. D3 OFFBOX **0** ×4; fixture classes 0.89–1.84×; ACMV/FP terminals **0 / 7 / −1 %** | ✅ D3 · D4 · D4b · **⛔ D4c** (below) |
| **ELEC 2.11× over-count** | — | **STALE:** 2.11× was the LEGACY walk the witness no longer drives (§NET-AUDIT WRONG-PATH, 2026-09-27). Production measured-band walk: ELEC **878/833 = 1.05×** at 8311ba5f, **761/833 = 0.91×** after §BAND-MIDPOINT; per class LightFixture 0.89×, ElectricAppliance 1.84× (35/19) | FINDING line re-worded; the per-class verdict is D4 | ✅ stale |

**⛔ BLOCKED — the one question (D4c):** `placeMeasured` places RUN classes as banded fixtures because `rule_placement` carries their
mined rows: PLB/IfcPipeSegment **748 vs 3,821 real (0.20×)**, ACMV/IfcDuctSegment 268/568 (0.47×), IfcDuctFitting 464/713 (0.65×).
Keep them as the Stage-1 fill, or exclude Segment/Fitting classes from the fixture walk and leave runs to the router (§MEP-ROUTE-DISC)?
W-DW-DENSITY-TE stays **8/1** (D4c RED, honestly labelled) until answered.
**✅ ANSWERED 2026-09-30 (red1): option (b), PER DISCIPLINE, gated on proof.** Placing fixtures (stage 1) and routing
runs (stage 2) are the two stages of ONE walk, like normal MEP practice: terminals first, then distribution. Runs come from the
router only. The rule is: exclude `*Segment`/`*Fitting` run classes from `placeMeasured` for a discipline ONLY once
its router is witnessed drawing that discipline's runs on the real Open → Walk path (router runs vs real count per class,
before/after). PLB qualifies now (the guide's W-MEP-OPENPATH table: Duplex 18 runs, Terminal 2,915). ACMV/ELEC/FP keep the
stage-1 pieces until their routers are proven. The code has had patterns since §MEP-ROUTE-DISC 2026-09-26, but the live
guide still says "placed but not yet routed". Measure which is true first. red1 also asked: the re-route after a fixture or
gridline move (MEP stays visible, `W-MEP-REROUTE`) is fine "if it is not costly". Its cost at Terminal scale is UNMEASURED;
measure it in the same slice.
**Regression on the touched paths (history restore · `_dwTwinFids` · `placeSchedule` yaw · `placeMeasured` midpoints), all on the
branch, serial:** gridundo 8/0 · delete 8/0 · undo_resurrect 5/0 · mep_reroute 9/0 · oleye 5/0 · instpick **8/0** (two earlier runs
7/1 on P4 ROW-FRAMES with Δtarget 30.4 m then 3.6 m — the 1.5 s wait vs the 1.1 s fly; 8/0 on unmodified main too → timing flake,
not this branch) · walk 8/0 · dw_oplog 6/0 · dedup_render 4/0 · walk_lod400_only 7/0 · livewire 12/12 · storey_band SC=PASS
DUPLEX=PASS (placed=102 outliers=0) · walk_all 13/0.
**Served change:** `modeller.html` · `disc_walker.js` · `modeller_history.js` → `sw.js` CACHE_VERSION **v64 → v65**. Live proof (real bytes,
`https://red1oon.github.io/bim-ootb/modeller/`, fetched after the merge): `sw.js` `CACHE_VERSION = 'v65'`, `modeller.html` carries
`§I5b-TWIN-CZ`, `disc_walker.js` carries `§SCHED-YAW` ×4.
**Stale claims found:** this file :122-123 and :169-170 listed `render_fidelity` as red — GREEN at 8311ba5f; :97 / :129 / row 23 "ELEC
2.11× over-count" — a legacy-walk number, not the production walk's.
**Part B (§SLIDE-REAL-WALLS Phase B):** STARTED, not finished — handed to a Sonnet session: **§HANDOFF-SLIDE-SH 2026-09-30** below.

## ▶ §SESSION 2026-09-30b — §SLIDE-REAL-WALLS Phase B on SampleHouse (from §HANDOFF-SLIDE-SH) + one gesture = one undo.
## Opus session on red1's word (2026-09-30). bim-ootb worktree `/tmp/wt-slide`, branches below; bim-compiler `fix/slide-sh-uncut-check`.
## Every number is read from a saved run log (scratchpad `slide/`), not from memory.

**SPEC §ONE-GESTURE-ONE-UNDO (written before the fix).** A *gesture* = everything ONE user action commits: one Move-gizmo
release / arrow nudge / rotate / scale / item-drag drop / Accept click — the primary op for every selected target PLUS every
induced rider (hosted-by door/window rides, fills-opening rides, GEOM_CUT_MOVE voids). The group boundary lives in ONE place:
`bonsai_oplog.js commitGesture()` — one signed `gesture-grp-N` gid that `O.undo()/O.redo()` already treat as one LIFO step (§P8)
and `modeller_history.js` records as ONE node. Rule: a gesture that lands >1 row commits through it; a 1-row gesture keeps
`commit()` byte-unchanged. **Falsifier:** real Open Duplex → real click on a wall that hosts fillings (asked of
`SdgCascade.ridersFor`) → Move tool → real X-arrow drag → ONE Ctrl+Z must return active length to pre-gesture and every
centre (wall + riders) to pre ≤1e-6 m; ONE Ctrl+Y re-applies all rows; Save after the undo not blocked.

**SPEC §CUT-THROUGH.** A GEOM_CUT void face flush (|Δ|<0.1 mm) with the parent's bounding face is pushed 1 cm outward before the
OCCT boolean. The region removed INSIDE the parent is unchanged; it removes the float32-vs-float64 coplanar skin.
**Falsifier:** W-E2E-SLIDE-REAL E3 — a thickness-axis ray through each opening centre must pass the host mesh.

**SPEC M5 §UNCUT-IS-SOLID (generator).** The "uncut" host body must be SOLID at every IfcOpeningElement of its host: a line through
each opening box centre along the host's thickness axis crosses the uncut body ≥2 times; one miss refuses the whole host, named.
**Falsifier:** W-SLIDE-REAL-WALL W7 on the pre-M5 patch → cuts=[0,0,0,2,2,0,0] (RED, `SLIDE_PATCH=<old patch>`).

| item | result | witness (log) | PR |
|---|---|---|---|
| Frame trap (handoff step 1) | Witness re-pointed to the SERVED pair (`SampleHouse_ARC.db` + served `SampleHouse_geo.db`, fetched from the app's own registry). **Correction to the handoff:** `element_transforms.center` in `*_ARC.db` is the vertex CENTROID, not the AABB midpoint (Wy4: served world y∈[-1.3914,-1.1014] vs center±bbox/2 = [-1.3627,-1.0727]) → W2 checks position vs the served baked fold and extent vs `bbox_*`, never center±bbox/2. Also: sql.js MEMFS owns the passed buffer → each Database now gets its own copy. | W-SLIDE-REAL-WALL | #1793 |
| **M5 — 5 of the 7 "slideable" SampleHouse openings were NOT slideable** | Browser E5 caught it: after sliding a window on host 23 the open span was `[-1.53,1.22]` = old ∪ new. Cause: hosts `3cUkl32yn9qRSPvBJVyWy4` / `…Ww5` are **IfcFacetedBrep** bodies exported WITH their openings in the faces — disabling IfcRelVoidsElement subtraction leaves them holed (0 triangles over any opening centre). Phase M's "tris uncut ≠ cut" could not see it. Generator M5 now refuses such hosts (line through each opening centre must cross the uncut body ≥2×): **SampleHouse 7 → 2 slideable** (host `…WXt`, IfcBooleanClippingResult, 2 doors). Duplex probe with M5: **36/38 still slideable**, 0 M5 refusals (2 tessellation-failed, as Phase M). | W-SLIDE-REAL-WALL **9/0** (pre-M5 patch `SLIDE_PATCH=…` → **1/8**, W7 cuts=[0,0,0,2,2,0,0]) | #1793 + bim-compiler this PR |
| §CUT-THROUGH (worker) | Flush void faces pushed 1 cm out: the IFC opening is exactly wall-deep and doors start at the wall base → a 0.3 µm float32 skin closed every hole. `§CUT-THROUGH cut=… flushFaces=3` in the page log. | W-E2E-SLIDE-REAL E3 (without the fix: **0/2 open**) | #1793 |
| Browser proof (handoff step 3) | Real Open: `§SLIDE-SEED uncutHosts=1/1 openings=2 cuts=2`, host promoted, 0 `§LAYER-SOLID-SEED-REFUSE`, world AABB Δ=0; real `#b-itemdrag` drag of door fid 11: `GEOM_MOVE dy=0.455` + `GEOM_CUT_MOVE cutId=39 dy=0.455`, one `gesture-grp-39`; open span `[-0.53,0.27]` → `[-0.07,0.73]`, old centre solid / new open; one Ctrl+Z → len 42→40, door Δ=2.1e-9, spans back; the 5 brep-host fillings still refuse. | W-E2E-SLIDE-REAL **9/0 local, 9/0 LIVE** (v66) | #1793 |
| Re-point (handoff step 4) | `witness_opening_slide.js` S0 → sketched plain-extrude host: S1–S7 now JUDGE (was 7 INCONCLUSIVE every run) **11/0**. `witness_e2e_opening_slide.js` O0 → REAL-SPLIT (5 refuse / 2 form) **8/0**; its `exitItemDrag` guard never fired (module-scoped) — now clicks the button. | W-DAGEVU-SLIDE, W-E2E-OPENING-SLIDE | #1793 |
| **One gesture = one undo** | RED on LIVE main v65: Duplex wall #112 + riders 73/42: 196→199, one Ctrl+Z → 198, residual **0.417 m** (G2/G4). Fix: `modeller.html _commitUserGesture` — move/rotate/scale gestures with >1 row go through `commitGesture` (item-drag already did). App log: `§ONE-GESTURE gid=gesture-grp-197 rows=3` · `§GESTURE-UNDO … rows=3 active=196` · `§GESTURE-REDO … rows=3`. Save after undo: `§SAVE_SNAPSHOT`, no block. | W-E2E-GESTURE-UNDO **6/0 local + LIVE** (v67); W-FIRST-STEPS **9/0/0 LIVE** | #1794 |

**Regression (serial, on the combined branch):** gridundo 8/0 · delete 8/0 · move 7/0 · rotate 7/0 · scale 7/0 · dm_rotscale 12/0 ·
cut 6/0 · cut_move(e2e) 12/0 · cut_move.mjs 26/0 · arc_editable 9/0 · gesture_undo(node) 9/0 · sdg_cascade 7/0 · undo_resurrect 5/0; CI e2e green on both PRs.
**Live bytes:** `sw.js` v67; `bonsai_kernel_worker.js` carries `§CUT-THROUGH`; the patch carries 3 `slide_*` inserts; `modeller.html` carries `_commitUserGesture` ×4.
**Stale claims:** `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §SLIDE-REAL-WALLS Phase M table "SampleHouse slideable 7" → **2** (M5); this file §HANDOFF-SLIDE-SH "3 hosts / 7 openings / canCut ×3" → 1 / 2 / 1.
**Not done / found, left for its own row:** multi-select Delete still commits one row per id (N undo steps); autoroute/fixture placement commit per op — not user single-gesture edits in this sense, not changed.
**Next session:** Duplex (36 slideable, M5-clean) → SampleCastle (5). Regenerate with `gen_slide_host_patch.py` (M5 included), append to `Duplex_ARC.db.sql`, extend W-SLIDE-REAL-WALL / W-E2E-SLIDE-REAL per building.

**⇒ §HANDOFF-SLIDE-SH below is DONE for SampleHouse (✅ §SESSION 2026-09-30b above, bim-ootb #1793/#1794). Kept for history; its host/opening counts are superseded by M5 (1 host / 2 openings).**

## ▶ §HANDOFF-SLIDE-SH 2026-09-30 — §SLIDE-REAL-WALLS Phase B, SampleHouse only. Started by Fable 2026-09-30, handed to a
## Sonnet session on red1's word (save Fable tokens). Everything below is measured; nothing here has run in a browser yet.
**Where the work is:** bim-ootb branch `feat/slide-real-walls-sh` @ `e8acba00` (ONE "WIP:" commit, pushed, **NO PR**, worktree
`/tmp/wt-slide` — REUSE it). It branched from main `d5977e4e`, i.e. BEFORE #1792 landed → `git merge origin/main` first; `sw.js`
will conflict → keep the higher CACHE_VERSION, then bump to **v66** for this change. bim-compiler: the generator is on master
(this PR).
**Built so far (file → what it does):**
- bim-compiler `scripts/gen_slide_host_patch.py` — per `IfcRelFillsElement` re-measures the Phase M rules (box opening,
  through-wall, bake == opening subtraction, frame proof) and emits `slide_hosts` (the host's UNCUT body — verts float32 /
  faces int32 — in the SERVED mesh frame: world − `element_transforms.center`, rotated by −`rotation_z`; hash sha256[:16]) +
  `slide_openings` (the opening's own solid as a WORLD box c1/c2 = the GEOM_CUT `void`). Run:
  `python3 scripts/gen_slide_host_patch.py --ifc reference/residential/Ifc4_SampleHouse.ifc --bldg SampleHouse --arc-db <modeller/SampleHouse_ARC.db> --geo-db <served SampleHouse_geo.db: curl GEO_BASE/SampleHouse_geo.db?v=3> --out <patch> --append`
  → `§SLIDE-PATCH-SUMMARY fills=7 slideable=7 hosts=3 openings=7` (uncut 121/144/12 tris vs baked 106/106/44; frame Δ ≤ 1 mm).
- bim-ootb `modeller/patches/SampleHouse_ARC.db.sql` — the generated section appended (13.6 KB, `X'hex'` blobs, 47 statements).
  The existing loader (`str_walker_outliner.js _applyPendingPatch`) applies it to the ARC db on every open — NOT yet seen in a browser.
- bim-ootb `modeller/arc_editable.js` §SLIDE-SEED — `_slideTables(db)` reads both tables (uncut blob recentred by
  `RealGeometry.recenter`, the fold's §ARC-ANCHOR contract); `buildSeedOps` folds a slide host with `realGeomHash` = the uncut
  hash + `params.slideHost = true`, asset flagged `uncut: true`; `seedArc` then commits ONE `GEOM_CUT {parent: host fid,
  void: {c1, c2}, slide: {opening, filling, fillingFid}, provenance: 'ifc:opening-box'}` per opening as its own idempotent group
  `arcseed-cuts-<name>` (after the hosts, parent from the bridge; `outputGuid` = the opening guid), logs
  `§SLIDE-SEED building=SampleHouse uncutHosts=3/3 openings=7 cuts=7`, returns `slideCutIds / slideCutOps / slide`.
- bim-ootb `modeller/bonsai_library.js` — `registerRealGeometry` keeps `uncut`; new `isUncutBody(hash)`.
- bim-ootb `modeller/bonsai_kernel.js` `_insertCutLayerSeed` — an uncut real body with no layer index seeds as ONE range
  (buildTriFace + sewAndSolidify, the "single-range seed" the Phase M verdict named) → `Bonsai.canCut(host)` **true ×3** (node).
- bim-ootb `modeller/bonsai_itemdrag.js` — `beginSlideSession` accepts `ctx.uncutHostOf(host)` beside `plainBoxOf`; the production
  ctx passes `uncutHostOf` (= `Library.isUncutBody` on the op's `realGeomHash`). The §CUT-MOVE rider machinery is unchanged.
- bim-ootb `modeller/tests/witness_slide_real_wall.js` — **W-SLIDE-REAL-WALL** (pure node: `SampleHouse_extracted.db` + the patch):
  W0 control (main's substrate refuses 7/7 — RED-first built in) · W1 patch applies · W2 seed-uncut · W3 cuts · W4 sessions · W5 ops · W6 replay.
**Verified vs not:** VERIFIED (node, `scratchpad/slide/w_slide1.log`): W0 ✓ (refused 7/7 without the tables), W1 ✓ (3 hosts, 7 openings),
W6 ✓ (second seedArc adds 0 rows, 46→46); seed log `uncutHosts=3/3 cuts=7`; `canCut=[true,true,true]`; for the 2 fillings that reached
W4/W5 a slide session FORMED carrying exactly its own cut (`§ITEMDRAG §SLIDE host=1 axis=x t∈[-9.577,2.808] … §CUT-MOVE cuts=#41(F=1)`)
and `resolveDrop` produced `GEOM_MOVE {dx:0.2}` + ONE `GEOM_CUT_MOVE {cutId:41, parent:host, dx:0.2}` rider — the mechanism works
end to end in node. NOT verified: W2/W3/W4/W5 as written (3/4 RED for the frame trap below), anything in a browser (loader → seed →
worker fold with the void subtracted → the re-cut host vs the baked mesh → a real drag moving the hole → Ctrl+Z), the live site.
**Exact next step:** (1) fix the witness's frame TRAP: `modeller/SampleHouse_extracted.db` `base_geometries` blobs are in the
create_shape/placement local frame, while the SERVED `SampleHouse_geo.db` (what production AND the generator use) is world −
center — the two differ by **4.5087 / 7.9520 / 5.4646 m** on the 3 hosts (exactly the numbers the generator's first run refused
with). So the node control's baked fold cannot be the W2 reference: compare the uncut fold's WORLD AABB against
`element_transforms` center ± bbox/2 (DB truth), and compute W3's inside/through and `wallFills` from the UNCUT host boxes (then all
7 fillings reach W4/W5, not 2). (2) `cd /tmp/wt-slide && node modeller/tests/witness_slide_real_wall.js` → expect 7/0.
(3) Browser witness on the e2e harness (`t.open('SampleHouse')`): assert `§SLIDE-SEED … cuts=7` on the real Open; the 3 host fids
are in `Bonsai._computeSeeds(ops).promoted` and no `§LAYER-SOLID-SEED-REFUSE`; the rendered host is the worker solid (tris ≠ the
uncut buffer, world AABB == `element_transforms`); a REAL item-tool drag of a door commits `GEOM_MOVE` + `GEOM_CUT_MOVE`; after the
fold a point at the OLD hole centre is inside solid and at the NEW one is open (raycast, numbers); Ctrl+Z restores. (4) Re-point
`witness_opening_slide.js` S0 — once the patch is live its "every real host refuses" claim is RED by design; it becomes the
sketched-host (plain-extrude) witness. (5) `sw.js` v66, PR, merge, live bytes.
**Traps hit:** ifcopenshell `use-world-coords=False` is NOT the shipped local frame (the shipped one is world − center, R(−rz),
from the DB row — verify with the generator's frame check, never assume) · the IFC is in mm (placement matrix) while
`create_shape` geometry comes back in m · the patch goes to the ARC db only (the geo db is untouched; the uncut blobs live in the
ARC db tables — by design) · GEOM_CUT rows carry `outputGuid` = the opening guid (the ARC bridge is built from the host ops only,
unaffected) · `git merge origin/main` will conflict on `sw.js`.
**Witness state:** W-SLIDE-REAL-WALL written (node); RED on main's substrate proven by its own W0 control (7/7 refuse); 3/4 on the
WIP for the frame reason above; no e2e witness yet.

## ▶ §RESUME 2026-09-27 — (superseded as entry point by 2026-09-30 above; read it second)
- **Merged/merging:** bim-ootb #1786 (root JS tidy, MERGED) · #1787 (row 34 anchor save, MERGED) · **#1788** (net-audit
  batches 1-3 + pattern rows 1/3/6/8 + room-inject + LOD400-or-refuse everywhere: walks, re-open fold, assemblies,
  geometry-less seed; auto-merge on — verify it landed). Detail + numbers: `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md`
  §FOLD-NO-BOX-DONE; witness-net state: `WITNESS_INTERFACE_FRAMEWORK.md` §MODELLER-NET-AUDIT.
- **⛔ red1 decisions pending:** (1) slide an opening along a REAL wall? (today refused: every real host has the opening
  baked in; #1710's slide was never user-reachable) · (2) catalog inserts with no mesh / at LOD200 still fold boxes
  (527/794 products) — refuse them (removes LOD200 + those products) or rebind meshes first (row 14 / §CATALOG-REBIND,
  also needs `library/DX_BOM.db` + `SH_BOM.db` restored — 0 bytes locally).
- **Known red, pre-existing on main:** W-E2E-INSTHIDE H1-rig (no fixture pose); node dw_rot_units · git_history ·
  terminal_walk · render_fidelity; W-DISC-DENSITY D3/D4 need re-baselining on the LOD400 walk (§WALK-LOD400-ONLY note).
  **→ all worked 2026-09-30, see §SESSION 2026-09-30 (render_fidelity was already green — a stale claim).**
- Worktrees: `/tmp/wt-mnet-audit` (PR #1788 branch) and `/tmp/wt-mnet-base` (detached main, comparison) — prune both
  once #1788 is merged; `/tmp/wt-bc-netaudit` = this docs branch.

**▶ 2026-09-27 BACKLOG (red1 direction): §SLOPE-HANDLES — drag an axis / apex / edge of a sloped element along its natural build
lines, as the industry does (Revit sub-element + slope-arrow editing, ArchiCAD pet-palette offset-edge / move-node, SketchUp
push-pull). Measured state on bim-ootb main: NO face/edge/vertex handles exist (0 hits for push-pull/faceDrag/edgeDrag/vertexDrag);
grid drag is orthogonal-plan only and §ROTATION-GUARD refuses tilted elements; `dagevu_engine.js:23` AngleEdge ⛔ PAUSED "no
measured roof-slope data"; row 30 (roof height scale, wrong axis, dead). Industry default to honour: a stretch KEEPS THE PITCH
(ridge rises); apex-proportional is an explicit scale, never the default. Data path (non-invent): the slope plane is measurable
from the source mesh's own face normals / the IFC's extrusion direction — measure first (Phase M), like §SLIDE-REAL-WALLS.
Sequence: after §SLIDE-REAL-WALLS and insert-with-opening (same host/cut substrate).
**DESIGN (red1 2026-09-27: "a universal handler set that is abstract to accommodate any natural handling"):** ONE handle
abstraction, not a tool per element type. Every element EXPOSES handles derived from its own extracted geometry; each handle =
`{ kind: point|edge|face|axis, anchor (where it sits), dofs: the natural build lines it may move along (wall long axis,
slope-plane down-direction, ridge line, extrusion direction, grid line), invariants it must keep (pitch, thickness, face
offset), constrain(candidate) → { delta } | refusal }` — exactly the shape `HostFillEdge.constrain()` already has (1-DOF along
the host, delta-honest bounds, never a clamp). Cascades stay DAGeVu edges (anchor/ride). Existing drags become instances:
grid-line drag = axis handle on a grid line; opening slide = edge handle on the host long axis; roof stretch = edge handle on the
eave keeping pitch; apex drag = point handle on the ridge (explicit pitch change). Handles are only offered where their build
line is MEASURED from the source (no measured slope ⇒ no slope handle — refused, never guessed).**

## ▶ §RESUME 2026-09-26b — (superseded as entry point by 2026-09-27 above; read it second). Then §RESUME 2026-09-26 below, then §STRATEGY 2026-09-24.
## Every number was measured on the combined branch bim-ootb `feat/modeller-next-0926`. Specs: `prompts/Modeller/NEXT_0926/`.

**▶ "resume Modeller session" (red1's trigger phrase) — do exactly this, in order:**
1. Read this block, then the §RESUME 2026-09-26 block and §STRATEGY 2026-09-24 below (method rules + traps).
2. State of the world at the 2026-09-26 reboot: **everything is merged** — bim-ootb main `b0826a5a` (#1769, sw v50),
   BIMCompiler master (#125 + this note). No Modeller work lives in any `/tmp/wt-*` worktree; nothing is unpushed.
3. ⏸ 2026-09-26c: red1 said HOLD on headless runs (Alt+S testing on :8624); still not re-run. First task: run the five witnesses NOT yet re-run on merged main (held so red1's Alt+S on :8624 stayed light) in a
   fresh worktree off origin/main, with `NODE_PATH=~/bim-ootb/tests/node_modules:~/bim-compiler/node_modules` and the
   gitignored `Terminal_arcstr_proof.db` + `Terminal_plates_proof.db` copied from `~/bim-ootb/modeller/`:
   `witness_e2e_walk_all_disciplines.js` · `witness_e2e_walk.js` (5/3 on the pre-#1769 base) · `witness_e2e_save.js` ·
   `witness_route_pattern_bridge.js` (6/4 red since #846 — expected, it is NEXT 1 below) · `witness_e2e_walkall_terminal_scale.js`.
   Compare each red against origin/main `1069c70c` before calling it a regression. **Ask the photoreal session / red1
   before a heavy headless run if red1 is testing Alt+S** (headless Chrome slows the look port).
4. Then work the NEXT list below in order. Data calls: decide them yourself (simplest sourced option, checked against
   the `*_silent.db` references) — red1 wants "simple and workable … visually and generally correct".
5. Merge convention: one combined branch, one PR at session end (bim-ootb auto-merges on green checks); update this block.

**§WITNESS RE-RUN 2026-09-26c (merged main `b0826a5a`, logs in session scratchpad/wit/):** W-E2E-WALK-ALL 13/0 (63 s) ·
W-E2E-WALK 8/0 (9 s) · W-SAVE-COMPLETEIT 11/0 (11 s) · W-TERMINAL-WALKALL-PERF 6/0 (100 s; Walk-ALL 73.6 s, PLB 2,915/2,915 +
FP 623/623 + ACMV 807/807 signed, 1 group each) · W-ROUTE-PATTERN-BRIDGE 6/4 (P3-P6, the known NEXT #1 retarget).
**🔴 NEW FINDING (scope-blind green):** the Modeller's catalog has been EMPTY since #550 (2026-06-27, modeller/ split).
`modeller/bonsai_library.js:34` fetches `modeller/dagevu_catalog.json`; the file stayed at `viewer/dagevu_catalog.json`
(live: modeller URL 404, viewer URL 200 / 274,212 B). Log: `§LIBRARY catalog loaded products=0`. Effect measured on Terminal:
every bend fitting fails to fold — 726× `GEOM_INSERT unknown component FITTING_ELBOW_GENERIC` + 468× `…TEE_GENERIC`
(= 2 × the 597 in `§BEND disc=PLB joints=597`). So §PRODUCTIVITY's "597 fittings" are signed rows that never render, and
W-TERMINAL-WALKALL-PERF T6 NO-ERROR does not see it. Any catalog insert (picker, assemblies) is likewise unresolvable.
**→ FIXED, bim-ootb PR #1770 (`fix/modeller-catalog-path` @ 22c123fa, auto-merge on; spec SPEC_CATALOG_PATH.md):** catalog +
geometries fetched from `../viewer/`; sw v51; a 2nd latent bug it exposed — `_dwUpgradeFitMeshes`'s scrubTo wiped the dwRoot tube
layer (Duplex tubes 33 → 0) — now redraws like every other re-fold. New T7 FOLD-CLEAN: base 1,194 unknown / 0 products → 0 / 837.
9-witness sweep base = fix (only T7 moved); Duplex fittings real mesh 3/3 (was 0/3). Cost: W-WALK-GESTURE 7 → 47 s, W-MEP-REROUTE 16 → 46 s.

**⚖ DECISION (red1 2026-09-26): the tiled roof is PREFAB ARC/STR the user reshapes along its axis like any other element; walkers
FILL IN services (MEP).** → no roof walk row in the Outliner (bim-ootb PR #1785, §ROOF-PREFAB); the engine keeps the §ROOF-PATTERN
verdict so no fabricated plates can return. Do not re-open "generate the roof" without red1.
**Assessment 2026-09-26 (asked by red1) — next priorities (specs written: WITNESS_INTERFACE_FRAMEWORK.md §MODELLER-NET-AUDIT · MODELLER_BOM_CATALOG_SPEC.md §CATALOG-REBIND · this file §IFC-EXPORT-DEPTH):** (1) audit the witness net for scope-blind / vacuous / wrong-path checks
(every defect found this session hid behind a green witness: empty catalog 3 months, roof row never worked); (2) data quality:
restore `library/DX_BOM.db` + `SH_BOM.db`, rebind catalog meshes (row 14); (3) IFC export depth (Psets, storeys, materials).

**▶ 2026-09-26e (resumed) — rows 8 + 22 closed, row 14 parked.** Row 8 → **bim-ootb PR #1782**: roof walk returns a VERDICT
(present / refuse), never the band fill; the Outliner roof row had NEVER walked for a user (discWalk upper-cased 'roof' → 'ROOF',
§DISC-CASE fix); W-ROW8-ROOF-PATTERN 1/6/1 → 7/0, W-E2E-ROOF-PATTERN 2/1 → 3/0, 10 regression witnesses base = fix. Row 22 part 2 →
UBBL clauses read from the gazette (UBBL_RULES_GATE.md §SOURCED, hash-pinned); only room size is checkable on today's data, and the
shipped demo applied bedroom minimums to every room → **PR #1781** (§UBBL-TIERS: real violations = any-room floor 43(b)/43/44 proviso;
"would fail if habitable" = 42(1)/42(2)/44(1)(a); Duplex 8 false violations → 0, 10 "check"). By-laws 181 (exit ≥ 700 mm) and 168(5)
(door swing) need escape-route / swing data we do not extract. **Row 14 PARKED:** catalog meshes are bound by a name/footprint
heuristic (many are the wrong part — e.g. two different roofs share one flat-roof mesh), and `library/DX_BOM.db` + `SH_BOM.db` are
0-byte locally, so the catalog cannot be regenerated safely; needs those libraries restored + a mesh re-binding pass (Fable-sized).
Not the Viewer's concern: only the Modeller reads `viewer/dagevu_catalog.json`.

**NEXT #1-#5 DONE; #6 handed over.** One combined bim-ootb branch (row 7 + #2/#3 + #4 + #5).
| item | result (base → fix) | spec |
|---|---|---|
| Row 7 grid | red1 picked **0.1039 (true centres)**, then **"on the beams"** (median line fit). The bridge reads true mesh centres via `CrossEdges.readBoxes` (#1744's reader, not re-derived) and re-inits after the geo fetch (§STRWALK-GEO — without it the fix never fires on split residents). Terminal: facade gridlines on the beam lines (0 mm, were 107/161 mm off), 131/158 columns exact (was 92), grid 18×10 and membership unchanged, skeleton column z fixed (63 off, max 3.944 m). Headline RMS 0.0939 → **0.1323**: it now measures only by-design facade eccentricity; **no estimator lowers it without minting fake lines** (measured). Wall-bearing semi-grid unchanged (mean). | SPEC_ROW7.md |
| #2 re-route signed | 1 m Duplex move: 0 new signed rows → keep 16 / new 5 / retire 6, bend fittings re-derived (3 kept / 2 new / 2 retired); one Ctrl+Z / Ctrl+Y, no new rows. `bonsai_oplog.undo/redo` skip rows a re-route owns (`_treeOwned`). W-MEP-REROUTE 5/3 → 9/0 | SPEC_MEP_SIGN.md |
| #3 sign all | `DW_CHAIN_COMMIT_CAP` 60 → Infinity. The old "1.6-2 s per sweep" was the per-sweep-commit era. Terminal PLB 60 → 2,915 signed, walk 16.5 → 24.0 s. **Hospital 60 → 19,331, PLB walk 69.6 → 123.2 s, +19k solids — kept (every step signed), red1 may re-cap big buildings.** | SPEC_MEP_SIGN.md |
| #4 ACMV/ELEC/FP | `_RW_PATTERN_DISC` covers all four; 10 sourced rows added to `mep_rw.db` ad_mep_pattern (FP_TERMINAL_01 ×4, ACMV_TERMINAL_01 ×3 from SJTII_Terminal; ELEC_DUPLEX_01 ×3 from Ifc2x3_Duplex); products FP_Drop_Pipe 21.3 mm · Terminal_Rect_Duct_150x150 · Duplex_EMT_Conduit_29. Combined: Terminal runs signed **4,345/4,345** (PLB 2,915 + FP + ACMV). Engine-measured zeros kept as EXPECTED 0 gates (SampleCastle FP/ACMV, ELEC on Duplex/Terminal). | SPEC_MEP_ROUTE_DISC.md |
| #5 NNCHAIN | N4/N6 retargeted to the routePattern bridge's identity (rule/kinds/product/path) and id-targeted setUndone. 6/2 → 8/0. Test-only. | SPEC_NNCHAIN.md |
| #6 viewer routewalker | **Handed over to the Viewer lane, not taken**: `viewer/routewalker.js` has the same vertical-post clash box at 3 sites that §RW-RUNBOX (L2) fixed in `modeller/routewalker.js`. | — |

**§PRODUCTIVITY now (one Walk ALL Services, combined branch):** Duplex 221 generated (185 fixtures + 33 runs signed + 3 fittings) / 29 flagged · SampleCastle 525 / 9 · Terminal 9,284 (4,342 + 4,345 signed + 597) / 60.

**Combined-branch witnesses:** W-ROW7-TRUE-CENTRE 6/0 · W-ROW7-GRID-BASELINE 5/0 (pinned to the mean fit it recorded) · W-E2E-ROW7-GEO-REINIT 6/0 · W-MEP-REROUTE 9/0 · W-WALK-GESTURE 4/0 · W-ROUTER-NNCHAIN 8/0 · W-MEP-OPENPATH 33/0 (M5-M7 per discipline, M8 all-signed). STR/grid: STR-REWALK-COMMIT 9/0 · GRIDMOVE-REAL 8/0 · STR-INTO-ARC 11/0 · STRWALK-SMOKE 9/0 (row 7 branch).

**DATA CALLS — DECIDED (red1 2026-09-26: "keep things simple and workable and not worry about the finer points as long
bigger issues are resolved ie visually and generally correct. The silent DBs are references u can work with").** All five
stay at the shipped default: FP starts at the seed door (as CW) · ACMV one product 150×150 (the mode in Terminal 53/420 AND in
the Hospital_silent reference, 437 of 4,816 IfcDuctSegment) · ACMV mains + drops, no plant step · ELEC mains only · Hospital
signs every run. Rule going forward: take the simplest sourced option, check it against the `*_silent.db` references
(Hospital_silent, HHS_Office_Federated_silent), ask red1 only when something is visibly or generally wrong.

**NEXT, ranked:** 1. ✅ DONE 2026-09-26c — bim-ootb PR #1771 (test-only): W-ROUTE-PATTERN-BRIDGE 6/4 → 10/0 ×2 (engine seam now uses the production `{schedule:true, geoDb}` opts; P6 = coverage honesty on unmapped STR; waits for the ARC seed). Found on the way → **FIXED, PR #1779 (§WALK-AFTER-SEED)**: the Walk row is usable 4.4 s (Duplex) / 24.0 s (Terminal) before the ARC seed commits; a Walk in that window signed its rows before the seed's and lost its layer. Walks now await `window.__arcSeedReady`; W-WALK-AFTER-SEED base 1/3 → 4/0; W-E2E-WALK's early op-log read fixed (8/0 ×2) · 2. ✖ RETIRED 2026-09-26c (red1: the Java backend is deprecated — OOTB is a JS PWA with no Java; memory java-bridge SUPERSEDED 2026-08-06). The 10 rows live in bim-ootb `modeller/mep_rw.db`, which is the source of truth; nothing to carry into `IFCtoERP.java` · 3. HospitalGarage grid (140 columns off-lattice: 15×102, colRMS 1.20 m — the 1D axis clustering doesn't describe it; its own row) — ✅ DONE 2026-09-26c (Fable agent) — bim-ootb PR #1774: ONE lattice rotated −2.000° (= the IfcSite placement, 0 IfcGrid in the IFC); `swDetectRotation` (all-pairs mod-90 mode + support gate) → 15×103 / 1.193 m / 6 exact → **17×29 / 0.0607 m / 132 of 140 exact**; Terminal unchanged; Hospital refused by the support gate (wings at −5°/+10°). Open: the authoring grid still drags world-axis lines (fine at 2°; a rotated authoring grid is its own row). Spec SPEC_ROW7_HGARAGE.md · 4. ✅ DONE 2026-09-26c — bim-ootb PR #1772: a plain Ctrl+Y resurrected the lowest-id undone row (an undone walk's row, or a deleted row) instead of the edit. Rows a history node leaves undone now sit in `oplog._treeUndone`, skipped by redo(). W-UNDO-RESURRECT base 3/2 → 5/0; 7-witness sweep base = fix (spec SPEC_UNDO_RESURRECT.md) · 5. then the older rows from §RESUME 2026-09-26. **Row 9 ✅ 2026-09-26c — bim-ootb PR #1773:** edit-time ORANGE toast gets an Accept
button → one signed gesture (Save's own heal ops, shared `_healOps`), one hop, re-checked; W-ORANGE-ACCEPT base 1/1 → 5/0, Save/gate
witnesses base = fix. Accept follows Save's heal rule (moves the UNMOVED partner) — in the witness it moved a wall 0.5 m and raised 2
new RED, reported not applied; red1 may want the heal to move the pulled element instead (not changed). **Stale witness found:**
W-SAVE-BLOCKED-HEAL-INDUCED 0/2 on main — its fixture needs "unrelated" neighbours, none exist since §XEDGE-3AXIS (every Duplex element
has edges) → **fixed PR #1778** (fixture found by simulating the real gate; 7/0). **Row 22:** part 1 ✅ PR #1775 (RED toast → one-click Revert = one Ctrl+Z, only while the edit is still latest; W-RED-REVERT base 1/1 → 4/0) ·
part 3 ✅ PR #1776 (§GATE-SCALE: the gate's `seen` map threw RangeError past ~300 moved on Terminal; spatial grid → identical results,
100 moved 3,119 → 10 ms, 1,000 moved 40 ms; W-GATE-SCALE base 4/1 → 5/0) · part 2 ⛔ BLOCKED: *which gazetted UBBL clause + value for corridor width and door swing?* UBBL_RULES_GATE.md §1b verified only By-Laws 39/42; its corridor/stair/dead-end figures have conflicting sources and no door-swing clause is cited — building a named check on them would invent the number. **Row 11 ✅ PR #1777** (§COLOR-PARITY: the element's authored `material_rgba`
r,g,b, the Viewer's rule; palette only for NULL — W-COLOR-PARITY base 3/1 (all 196 Duplex + 1,077 HHS on the palette) → 4/0, fallback
leg INCONCLUSIVE: no NULL rgba in either). Stale/red witnesses seen, not touched: W-E2E-CUT C6 (pixel, red on main). **Row 8** — Fable agent measured it; parent review changed the outcome (spec SPEC_ROW8_ROOF_PERELEMENT.md §REVIEW). Today's roof walk is a
BULK FILL (Terminal 10,584 of 33,324 plates at the flat band-mid z, RMS 2.627 m) and FABRICATES arrays elsewhere (Clinic 331 on glazing,
Hospital 47,526). But Terminal's 33,324 real plates are `discipline='ARC'` — the seed already puts them on screen, so a "per-element walk"
would only re-place them (RMS 0 by identity, 33k duplicate rows). Fix: a tessellating row (fill ≥ 0.5, derived) measures the array and
reports `§ROOF-PATTERN-PRESENT … nothing to generate` (0 placed) or REFUSES — never the fill. W-ROW8-ROOF-PATTERN (node) base 1/6/1 →
7/0. Branch feat/row8-roof-perelement (/tmp/wt-row8-roof), committed locally, NOT pushed — its browser regression runs wait on the GPU
(paused 2026-09-26 for the photoreal lane's Alt+S runs). Also **W-E2E-CUT C6 → PR #1780** (it compared pixels after a re-select click
that hit another element; now the cut element's own mesh fingerprint: changed by the cut, restored exactly by the undo). **Rows 13/25** stay deferred by design (§OPEN LIST).
**Row 14 ⛔ BLOCKED — re-sourced 2026-09-26c, the row's premise is wrong.** Measured over `viewer/dagevu_catalog.json` × `dagevu_geometries.json`
(794 products with a real mesh; `§ROW14-CATALOG`): 201 mesh extents == declared w/d/h (Z-up) · 52 same numbers, axes permuted · 14
placeholder dims (d=h=1) · 527 no match. The permuted ones are mostly the METADATA's order, not the mesh (SLAB_SH_SIMPLE whd 0.165/13.97/5.77,
mesh 13.97×5.77×0.17 Z-up — correct slab); Dining_Chair h=0.45 but its mesh is 1.227 m tall and ROLE__CHAIR_A (same mesh) says h=1.227.
So "bake an axis permutation into the vertices, witness tallest-axis==h" would bake BAD METADATA into good meshes. The measured fix is the
other way: for mesh-bearing products take w/d/h FROM the mesh extents (non-invent; changes LOD-200 proxy box sizes). The catalog files are the
Viewer's (`viewer/`), so it is cross-lane. *Question for red1: OK to derive the shared catalog's w/d/h from the real mesh extents (Modeller +
Viewer proxy sizes change), instead of the row's vertex bake?*

**NEW TRAPS:**
- **sql.js: two `new SQL.Database(sameBuffer)` share storage** — a DROP on one showed in the other (measured). Always pass a fresh `new Uint8Array(fs.readFileSync(...))` per db in node witnesses.
- **Signing everything makes walks commit later.** W-WALK-GESTURE went 1/3 once under load, snapshotting before the walk's history node existed. Wait on `__dwRowsByDisc[disc].walk` + `ModellerHistory.pending()`, not `__dwWalks`.
- **A Terminal-scale commit blocks the page > 180 s** — puppeteer `protocolTimeout` 900 s in W-MEP-OPENPATH, or a finished walk reads as walked=false.

## ▶ §RESUME 2026-09-26 — (superseded as entry point by 2026-09-26b above). Then read §STRATEGY 2026-09-24 (the thesis + lanes) and §RESUME 2026-09-21
## (method rules + traps). Written at session close; every number was measured on merged main.

**WHERE IT STANDS.** The generate-then-edit loop runs end to end on the real Open path. A bare ARC building → "Walk ALL
Services" places fixtures, routes plumbing, and SIGNS it at measured Duplex pipe sizes. One Ctrl+Z undoes the whole walk.
Moving a fixture re-routes its pipes. Merged + live: bim-ootb **#1762** (§STRATEGY L0-L7 + §XEDGE-3AXIS) and **#1768**
(§GATE-STOREY-FLOOR + §PRODUCTIVITY + cut-layers witness aim); BIMCompiler **#121 #122 #123**; docs site deployed.

**MEASURED §PRODUCTIVITY** (one Walk ALL Services, generated / flagged for review): Duplex 206/29 · SampleCastle 514/9 ·
Hospital 39,979/22 · Terminal 7,854/60 · HHS/Clinic/HospitalGarage/SampleHouse 0 flagged. This proves "little left to fix",
NOT "X times faster" (there is no hand-modelling baseline).

**CLOSED THIS STRETCH (don't re-open):** next-list #1 residual 11 (the rx/ry guard, 11 → 0) · #4 datums 802→657→643 =
CORRECTIONS (138 → 0 not-real planes on the live render) · row 6 re-framed + routed · L6 PLB stays unattached (red1) ·
Cut on a layered wall PROVEN (W-E2E-CUT-LAYERS 10/0; the old L3 red was the witness's aim, not the pick).

**NEXT, ranked (my recommendation; red1 had not picked one at close):**
1. **Row 7 — grid residual** (the "drag and the building follows" handle). ⚠ DECISION OUTSTANDING: chase **0.1039 m**
   (true mesh centres, the honest number) or 0.0939 m (what ships, flattered by the anchor defect in
   `str_walker_bridge.js:22/38/50`). Recommended: 0.1039. Confirm with red1, then run it as ONE Fable session (tough).
2. Re-routed runs are unsigned and bend fittings are not re-derived after a move (§MEP-REROUTE scope note).
3. Terminal signs 60 of 2,915 runs (DW_CHAIN_COMMIT_CAP, occt-bounded).
4. Route ACMV / ELEC / FP. They are placed but not routed; the pattern bridge covers CW/SP only.
5. Retarget W-ROUTER-NNCHAIN N4/N6 (it expects guid-carrying nn runs).
6. `viewer/routewalker.js`: same vertical-post clash box at 3 sites. VIEWER scope, not the Modeller's; hand it over, don't take it.
Then the older rows: 9 (apply ORANGE suggestions) · 22 (one-click revert, UBBL checks, rtree at scale) · 11 (real colours) ·
8 (roof per-element) · 13/25 (SSAO/outline, PBR, BCF import) · 14 (re-source its example first).
Blocked on red1: 15 (220 MB component_library.db: GH or OCI?) · 27 · 29 · 21/26/31 (never requested).

**DISPATCH (red1):** Opus by default; Fable agents for genuinely tough items (red1, 2026-09-25). A Fable agent WILL hit the
usage limit mid-run: resume it with its own context after the reset, never restart it.

**NEW TRAPS / METHOD (each cost a wrong answer first):**
- **An all-zero count is a claim, not a result.** "0 flagged" on 8 residents was the gate sinking fixtures underground.
  Cross-check any all-green number against the app's own per-step log before reporting it.
- **A same-line `// comment` can swallow object keys.** A scripted edit silently dropped 4 DiscWalker API exports and
  `node --check` passed. After any scripted edit to an object literal, grep the diff for mid-line `//` and check exports with
  `node -e "require(...)"`.
- **Snapshot after the ASYNC re-fold, not at the row flip.** With signed GEOM_SWEEP rows, undo/redo finish later. Wait on
  `ModellerHistory.pending()` + two macrotasks (W-WALK-GESTURE).
- **Witnesses that read the op-log length early race the seed** (read 0) under load. W-E2E-WALK and W-E2E-WALK-IFCOPEN do
  this. A base red with "oplog 0→N" is that race, not a regression.
- **A walk also commits routed-network rows** (sweeps + bend fittings). Any "op-log grew by placed count" assertion must count
  them from the op-log.
- **Do not "improve" routewalker pairing to next-nearest.** Measured: Duplex 18 fixtures → 110 runs, reaching 50 m targets.

## ▶ §STRATEGY 2026-09-24 — read SECOND (after §RESUME 2026-09-26). How the Modeller closes the gap: GENERATE, then EDIT MINIMALLY.
## The §RESUME 2026-09-21 block below is still current for its method rules and traps, so read it second.
## Every number here was measured on bim-ootb origin/main b8f844fb on the REAL user open path.

**THE THESIS (user, 2026-09-24):** *"start with blank ARC and walk route, edit minimally, making this more
productive than normal work."* We do not try to out-draw Revit or ArchiCAD by hand. The user opens an
ARC-only building. The walkers GENERATE the structure and services from measured rules. The user corrects
the result with a few handles (grid, seed, drag), and every step is a signed op. So **an ARC-only
substrate is the INPUT, not a defect.** A gap matters only if it BREAKS THIS LOOP:

```
1 Open ARC → 2 Walk (place) → 3 Route → 4 Sign → 5 Review (gate) → 6 Edit minimally → 7 Re-walk / re-route → 8 Save / Export
```

### Where the loop stands (measured; the evidence is in "§MEP EVIDENCE" below)
| step | state | evidence |
|---|---|---|
| 1 Open | ✅ all 8 residents | Terminal opens in 20.0 s, Hospital 17.8 s, the rest < 3 s; 0 pageerror |
| 2 Walk / place | ✅ works, at scale | Terminal Walk-ALL 66 s → 4,342 MEP fixtures (774 host-bound); Duplex reproduces W-E2E-WALK-ALL exactly (185) |
| 3 Route | 🔴 **BROKEN on 7 of 8** | chainSegs 0 on every resident except SampleCastle (32, and only via a fallback) |
| 4 Sign | 🟧 fixtures yes, networks never | fixtures are signed GEOM_INSERTs, verifyChain true; SampleCastle's 32 runs are refused 32/32 (no real cross-section product, WalkerDoctrine §8) |
| 5 Review | 🟧 partial | the gate runs before commit; no "accept this walk" step (it commits at once, `modeller.html:3805/3807`) |
| 6 Edit minimally | 🟧 | move works and is signed; **undo removes ONE fixture, then the whole generated layer vanishes from the canvas** |
| 7 Re-walk / re-route | 🔴 MEP none | a grid move moves generated fixtures like plain elements; no MEP re-route hook. STR does re-walk (W-E2E-STR-REWALK-COMMIT 9/9) |
| 8 Save / Export | ✅ young | IFC export full-building since #1747; no materials, property sets, storeys or openings yet |

**Read the table as the plan.** Steps 3, 4, 6 and 7 are where "more productive than normal work" is lost
today. Everything else is either working or polish.

### ▶ LANE STATUS 2026-09-24 (executed the same day; bim-ootb branch `feat/mep-loop`, NOT pushed yet, merges at session end)
| lane | state | evidence (baseline → fix, side by side on the same tree) |
|---|---|---|
| L0 | ✅ `2e52451d` | W-MEP-OPENPATH on main: 8/5, M0 control reproduces Walk-ALL 185 |
| L1+L2 | ✅ `30f51c20` | PLB runs on the real walk: Duplex 0 → 18 · Terminal 0 → 2,893 · SampleCastle 32 → 18 (a pairing-order effect; both variants pass the correct box). Run length median 2.2–3 m, max 24.9 m. A "try next-nearest on clash" variant was MEASURED and REJECTED (Duplex 18 fixtures → 110 runs). W-MEP-OPENPATH 8/5 → 10/3 |
| L4 | ✅ `54c7cf5a` | The real Ctrl+Z after a walk used to do NOTHING to the walk (not in the history tree). Now one node "Walk PLB (23)": Ctrl+Z → 0/23 rows, layer off; Ctrl+Y → all back. W-WALK-GESTURE 2/2 → 4/0 |
| L5 | ✅ `b78f2b4c` | a 1 m move of a routed fixture re-routes 22 → 21 runs ending at its new spot; Ctrl+Z routes back (±1 mm). W-MEP-REROUTE 3/2 → 5/0. Re-routed runs unsigned (waits on L3); bend fittings not re-derived (follow-up) |
| L3 | ✅ `2ec5f1b7` (red1: "Use measured Duplex pipes") | CW = Duplex "Pipe Types:Cold Water" 25.4 mm (mains size; ½" branches nearly as common — stated simplification), SP = "Pipe Types:Waste" 48.3 mm (41/43). Runs now SIGN: Duplex 18/18, SampleCastle 18/18, Terminal 60/2,915 (existing commit cap). W-MEP-OPENPATH 13/0 | Needs ONE named CW and ONE SP pipe product. The July audit in `routewalker.js` (RW_REAL_CROSSSECTION comment) found none clean; picking one extracted Duplex pipe as "the" cold-water pipe is a data call |
| L6 | ✅ **CLOSED by red1 2026-09-24: keep PLB unattached.** | PLB → CW+SP shims agree on host (IfcWall, SIDE) but not height (CW 1000, SP 600). No change; bim-compiler W-DWWALK-HOSTBIND W4 (PLB stays unbound) remains the contract. Do not re-open without red1. |
| L7 | ✅ `2ec5f1b7` (red1: "MEP only in Walk ALL") | Walk ALL skips STR/roof (own rows stay), row reads "Walk ALL Services"; Terminal Walk ALL 81 s → 61 s |
Every lane was regression-swept against its own pre-change commit (12–15 witnesses each): no witness moved except the one the lane targets.
Recorded, not fixed: `viewer/routewalker.js` has the same vertical-post clash box at 3 sites (Viewer scope).

### THE LANES — in order. Each one closes one break, and is proven on the real open path, not a fixture.
Rule for every lane: spec first, run the baseline on unmodified main, wait on a condition, prove it FIRES on
merged main (see the 09-21 method rules).

**L0 — Land the instrument (small, do first).** Turn this session's open-path probe into a committed witness,
`W-MEP-OPENPATH`: per resident × discipline, placed / host-bound / chainSegs (and their source) / tubes / signed
GEOM_SWEEP. Instrument control built in: Duplex must reproduce W-E2E-WALK-ALL's 185. Without it, every lane
below is judged by hand. *Done when:* it runs on 8 residents and prints today's table (below) as its baseline.

**L1 — Route on the production path (the #1 break).** `_discWalkOne` always calls `dwWalk(…,{schedule:true})`
(`modeller.html:3769`). The schedule branch and the measured-band branch return early
(`disc_walker.js:~2185/~2195`), calling only `route`+`routeChains`, so the §CAMPAIGN M1 `routePattern` bridge
(`:~2281`) is never reached. Smallest step: give both early returns the same bridge fallback, and log the
empty-but-not-refused case (`§WALK-PATTERN EMPTY` — today it is silent). *Done when:* W-MEP-OPENPATH shows
chainSegs > 0 for PLB on Duplex and Terminal, and W-ROUTE-PATTERN-BRIDGE is re-run.

**L2 — Repair the bridge (decayed 55 → 0 on Duplex, July).** Bisect: #683 = 55 → #684 = 34 → 670bf0f3 (§LIVEWIRE,
07-10) = 1 → #846 = 0. Cause measured: routewalker's OWN clash-skip (`routewalker.js:~539/~687 → _rwClashesWithArc
~820`) drops ~95% of pairs (Duplex 141 with an empty envelope vs 6 with the ARC; SampleCastle 316 vs 32). It is the
mis-oriented clash box that `disc_walker.js:1474-1487` already describes and fixes only in its post-filter.
Smallest step: orient routewalker's clash box along the run axis, the same AABB `_envelopeClash` uses, then
re-measure 141 → N. W-ROUTE-PATTERN-BRIDGE (6/4, red since ≤ #846) is the witness. **L1 without L2 routes almost nothing.**

**L3 — Make a generated network signable.** `RW_REAL_CROSSSECTION` (`routewalker.js:54-60`) holds only
FP_Drop_Pipe, so every CW/SP run is refused and never enters the op-log. `component_library.db` has 3,788 Pipe and
555 Duct rows, but they are all per-instance Terminal dumps, not a reusable product. Smallest step (DATA): register
ONE measured CW and ONE measured SP pipe product, sourced from a real IFC (non-invent; name the source row).
⚠ If no clean source exists, stop and ask red1 which product to use. Do not synthesize one.
*Done when:* a user walk writes ≥ 1 GEOM_SWEEP that verifies.

**L4 — A walk is ONE gesture.** Today `Bonsai.oplog.undo()` pops one fixture ('dwwalk-<disc>-N' gids are not gesture
gids), and `doUndo`/`doRedo` (`modeller.html:3554/3565`) never call `_redrawAllDiscWalks`, so after one Ctrl+Z the
generated layer disappears (SampleCastle tubes 32 → 0, still 0 after redo). The comment at `modeller.html:586-588`
claiming undo/redo re-applies it is STALE. Smallest step: redraw on undo/redo, and treat dwwalk/dwchain/dwfit gids
as one gesture group in `_isGestureGid`. *Done when:* Walk → Ctrl+Z removes the whole walk, Ctrl+Y restores it,
tubes visible both times. (W-E2E-WALK W6 stays green only because it uses scrubTo.)

**L5 — Re-route after an edit (the O15/O16 end-state for services).** Mirror the STR wrapper around
`gridmove.commit` (`str_walker_outliner.js:918-968`): after a grid move or GEOM_MOVE touches `_dw` fids, re-run the
bridge for that discipline from the moved placements, and sign the result. Measured today: `gridmove.commit('gx0',
0.3)` on Duplex moves 18 generated fixtures, `__dwWalks`/`__dwChains` go stale, no re-route. *Done when:* a
gridline drag on Duplex moves a PLB run and its new route is in the op-log. This is also the first piece of O16's
"drag in plan → services re-route". **O15 and O16 are one mechanism; L5 is its MEP leg.**

**L6 — Host-binding holes.** PLB host-binds 0 on all 8 residents: `rule_shim` keys CW/SP, never PLB, in both rules
DBs. Smallest step: resolve PLB → CW/SP shims through the same `_RW_PATTERN_DISC` mapping the bridge uses.
Separately, schedule-path placements record no host guid (`disc_walker.js:553-563`), so Duplex's fixtures cannot be
audited bound-vs-floating. Record it; fix it only if the audit is needed.

**L7 — ⛔ NEEDS red1's OK: what "Walk-ALL" means on big buildings.** On the terminal_rules residents, Walk-ALL
includes `roof` (IfcPlate, n_measured 33,324) and STR. HHS 42,960 plates, Hospital 47,526, so 46k–67k signed rows and
90–160 s walks, mostly not MEP. Taking roof/STR out of the MEP roster CHANGES existing behaviour, so it is red1's
call, not a lane to start alone.

**NEXT after the lanes (2026-09-24):** the productivity number (generated vs edits needed), re-deriving bend fittings on a
re-route, retarget/retire W-ROUTER-NNCHAIN N4/N6 (it expects guid-carrying nn runs), the Terminal chain commit cap
(60 of 2,915 runs signed), and the Viewer copy of routewalker.js (same clash-box bug, 3 sites).

**Engine-ready but not wired (after L1-L5, not before):** space-scoped walk (pick a room → walk it;
`_discWalkOne` passes only {schedule, geoDb, avoid}, `modeller.html:3769`) and the walker guards (they exist only in
bim-compiler `deploy/dev/walker_guards.js`, 0 hits in bim-ootb's `disc_walker.js`).

### The non-MEP gaps, placed on the same loop
- **Step 6, grid residual (row 7).** Unchanged, still its own heavy session, and it must first pick 0.0939 or 0.1039 (see 09-21).
- **Step 6, what touches what.** The residual 11 is FIXED on branch `fix/xedge-3axis` @ 511c1ca1 (bim-ootb, not
  pushed yet): 11 → 0, it was the rx/ry guard 11 of 11, and the "1,301 no-blob" suspect was a hash-vs-guid unit
  error. It merges at session end. Side effect: datums 657 → 643, which bears on next-list #4 and is not claimed as a correction.
- **Step 6, Cut on a layered wall is NOT proven.** W-E2E-CUT-LAYERS is 4/1 at L3: the click selects nothing
  (fid=null), twice. It could be the witness's aim or a real defect. Measure it before the guide ever claims it works.
- **Step 8, export depth.** IFC carries shapes and classes only. The status line reads `walls=0` for an opened building
  (`modeller.html:~3042`). Small, honest next items; they don't block the loop.
- **2D drawings.** 2D/PDF sheets are a deliberate deferral (§2D-AND-PDF), not a gap. The 2D value is O16's round-trip,
  which is L5 seen in plan.
- **Hand solid-modelling (fillet, push/pull, exact booleans).** Deliberately NOT pursued. It is the "normal work" the
  thesis replaces. The kernel stays `ops → mesh` (FeatureComparison.md).
- **Test net.** CI is never green (09-21 trap). Retarget or retire W-ROUTER-NNCHAIN (3/5): it expects a real nn-network
  from an MEP-bearing Terminal, which is the wrong test for an ARC-only strategy, and W-MEP-ROUTE-RENDER already covers
  that render seam, 12/12.

**§PRODUCTIVITY — measured 2026-09-25 (one "Walk ALL Services", W-MEP-OPENPATH ALL):** generated / flagged for review
(an unresolved clash, ≤1 edit each): SampleHouse 60/0 · Duplex 206/29 (15.7%) · SampleCastle 514/9 (1.8%) · HHS 3,415/0 ·
Clinic 5,140/0 · Hospital 39,979/22 (0.1%) · HospitalGarage 13,965/0 · Terminal 7,854/60 (1.4%). This is "little left to fix", NOT
"X times faster": there is no measured hand-modelling baseline. ⚠ The first run read 0 flagged EVERYWHERE. That was a gate
defect, not a result: the clash gate's global yield floor let FP's foundation-level sprinklers drag it to -1.257 m, and 20 Duplex
fixtures were "resolved" by sinking them ~1 m underground. Fixed as §GATE-STOREY-FLOOR (bim-ootb, W-GATE-STOREY-FLOOR: sunk 30/9/60 → 0).
Lesson: a "zero problems" measurement gets an instrument check against the app's own per-step log before it is believed.

The productivity claim needs its own number (original note below). "More productive than normal work" is so far a thesis, not a
measurement. Once L1-L5 hold, record per resident: fixtures + runs generated vs user edits needed to reach a network
the gate accepts. Until then, do not state it as a result.

**Dispatch (red1, 2026-09-24: "stick to Opus").** Every lane runs in Opus, in order L0 → L1+L2 → L4 → L6 → L5.
L1+L2 go together. L3 is data plus a possible red1 question. L7 is red1.

### §MEP EVIDENCE — the real open path, Walk-ALL (2026-09-24, bim-ootb b8f844fb)
Instrument control first: Duplex reproduced W-E2E-WALK-ALL (ACMV 19 / ELEC 102 / PLB 18 / FP 46 = 185) and W-E2E-WALK
(ELEC 102). bim-compiler W-BORROW-FP 6/6 reproduced SampleCastle's 247 FP. The fleet ELEC counts in
RESUME_DISC_WALKER_ENVELOPE_BOUND.md reproduce to the unit. Rules DBs match WalkerDoctrine §1/§2 on every resident.

| resident (rules) | ACMV | ELEC | PLB | FP | chainSegs | tubes |
|---|---|---|---|---|---|---|
| SampleHouse (duplex) | 4 / 4 bound | 28 / 17 | 11 / 0 | 17 / 16 | 0 (bridge silently empty) | 0 |
| Duplex (duplex, schedule path) | 19 | 102 | 18 | 46 / 29 | 0 (bridge never reached) | 0 |
| SampleCastle (duplex) | 12 / 12 | 270 / 269 | 84 / 0 | 126 / 125 | **32** (routePattern, CW 10 + SP 22), refused 32/32 for signing | 32 |
| HHS (terminal) | 1368 / 196 | 722 / 12 | 426 / 0 | 721 / 118 | 0 | 0 |
| Clinic (terminal) | 938 / 771 | 406 / 140 | 605 / 0 | 751 / 236 | 0 | 0 |
| HospitalGarage (terminal) | 4007 / 0 | 2756 / 49 | 3226 / 0 | 3310 / 143 | 0 | 0 |
| Hospital (terminal) | 5126 / 1510 | 3190 / 192 | 4036 / 0 | 4428 / 662 | 0 | 0 |
| Terminal (terminal) | 1375 / 407 | 896 / 110 | 969 / 0 | 1102 / 257 | 0 | 0 |

(Cells are placed / host-bound. The complex residents also walk STR 264–2,252 and roof 10,584–47,526 — see L7.)
Existing witnesses on origin/main: W-E2E-WALK 8/8 · W-E2E-WALK-ALL 13/13 · W-E2E-STR-REWALK-COMMIT 9/9 ·
W-MODELLER-DISC-WALK 8/8 · W-MEP-ROUTE-RENDER 12/12 · W-DISC-DENSITY 8/8 (needs the gitignored
`Terminal_arcstr_proof.db`; ELEC still 2.11× over, row 23) · W-ROUTE-PATTERN-BRIDGE **6/4** · W-ROUTER-NNCHAIN **3/5**.
The probe scripts were session scratch, not committed. That is why L0 exists.

### Corrections this evidence makes elsewhere (made here; the other files are left as-is, pointed to)
- **Row 6 is re-framed.** It is not "Terminal serves 0 MEP": that 0 is the input. It is now "generated routing is
  unreachable on the production walk path, and no generated network is ever signed" = lanes L1-L3. *Done when:* a real
  user Walk on Terminal AND Duplex renders ≥ 1 routed PLB run that is also in the signed op-log.
- **09-21 trap "playwright is NOT installed" is WRONG.** It is at `~/bim-ootb/tests/node_modules/playwright` (1.59.1).
  Witnesses with a bare `require('playwright')` need `NODE_PATH=~/bim-ootb/tests/node_modules`.
- **`prompts/Modeller/DISC_Walker/` (26 files) is now harvested.** Stale claims found: RESUME_MODELLER_WALK_SUBSTRATE
  "Duplex 0→55, chainSegs unchanged after M2" (bisect: 55→34→0); RESUME_MEP_SAMPLECASTLE "SC 2372 ARC envelopes baked in
  mep_rw.db" (it has 0; the 2,372 come from the building db); RESUME_TERMINAL_RULE_MINING's "124 rows / 47 avoidance"
  (now 37 / 10) and its Terminal-rules-on-houses model (contradicted by WalkerDoctrine, and the doctrine wins);
  SPEC_MESH_FIT_GRAFT / SPEC_SEAM_HEALING code lives only on unmerged feature branches.

## ▶ §RESUME 2026-09-21 — read THIRD (after §RESUME 2026-09-26 and §STRATEGY 2026-09-24 above). Supersedes the 2026-09-15 block below, which is kept for its
## history but is NO LONGER the entry point. Written at session close; every number below was measured.

**WHAT THIS SESSION DID.** The 2026-09-15 block ordered a re-verify sweep of the 34-row §OPEN LIST. That
sweep ran, and then four of the rows it surfaced were actually fixed. Merged: bim-ootb **#1738 #1744
#1747 #1749 #1750 #1753**; bim-compiler **#105-#118**.

| row | was | now |
|---|---|---|
| 36 | IFC export emitted an **empty file** for every resident (592 bytes, 0 products) | ✅ #1747 — Duplex 196→196, SampleCastle 3,225→3,225, round-tripped through re-import |
| 12 | `rel_fills_host` on 3 of 8 residents → **#1706's anchor/ride engine inert on 5** | ✅ #1749/#1750 — 943 new rideable edges; ride now works on **7 of 8** |
| 35 | the LIVE guide contradicted shipped behaviour for a week | ✅ site consolidated onto master (#106) + published; verified live |
| 28 | "293 tilted elements render with IDENTITY" | ✅ does NOT reproduce — 230 genuinely rotated, **0 dropped** (#1738) |
| 24 | `smoke_arc_only.js` silently ran 1 of 2 buildings | ✅ root cause `e2e_harness.js:349` `process.exit()` (#1738) |
| 19 · 23 · 32 | verified-open | ✅ closed / re-pointed — see §SWEEP |
| 7 | "0.104 m residual, needs a heavy session" | **re-measured** (#1753) — baseline not stale, the shipped path under-reports it. See the row. |

**THE ONE PATTERN WORTH INHERITING: `element_transforms.center_xyz` is the IFC placement ANCHOR, not the
volumetric centre.** Any consumer treating `[center ± bbox/2]` as a world box is displaced — measured
median 78 mm, up to 425 mm. **Three consumers found:**
1. `cross_edges.js` — **FIXED** (#1744). 843 of 9,817 abuts edges were wrong; now 11.
2. `str_walker_bridge.js:22/38/50` — row 7's grid. Re-measured, **not** fixed (see row 7).
3. `scripts/compile_rooms.py` — Viewer room injection. **Recorded, unmeasured.** Its exposure is NOT
   uniform: `door_dims` reads extents only and is safe (934/934 correct); the position readers are not.
   `SPATIAL_DEPENDENCY_GRAPH.md` §ANCHOR-SUBSTRATE-SIBLINGS. **Measure before touching.**

**WHAT TO CHASE NEXT, ranked.** Detail in §SWEEP FOLLOW-THROUGH and the rows themselves.
1. ✅ **DONE 2026-09-24 on branch `fix/xedge-3axis` (§STRATEGY, non-MEP gaps): the rx/ry guard, 11 of 11.** **The residual 11** (#1744's honest RED). Two suspects, never measured apart: `_readBoxes`' `rx/ry`
   guard — whose stated premise is the same false claim corrected in #1738, so it fires on real data and
   the 3-axis path it distrusts is now itself witnessed, making it probably liftable — and the 1,301 of
   3,225 elements with no resolvable blob. **Measure which, before changing either.**
2. **Row 7's heavy session** — now has what it lacked: it must decide WHETHER it chases 0.0939 m (what
   ships) or 0.1039 m (the honest number). Starting without that decision is how it stalls again.
3. **Row 6** — Terminal serves 0 MEP on the real open path.
4. ✅ **CLOSED 2026-09-25 — CORRECTIONS, 0 box-caused artifacts** (802 → 657 → 643). Method: independent
   re-derivation of the datum definition (cross_edges.js deriveDatumsAnchored: ≥3 faces within 50 mm, greedy window),
   instrument-checked (reproduces 802/657/643 exactly from the shipped boxes; live mesh boxes == current boxes within
   1.2 µm on 3,225/3,225), then each datum tested on the LIVE render (≥3 supports within 50 mm of its plane):
   OLD 802 → **138 not real**; #1744's 657 → 5 not real (all its tilted-guard boxes); current **643 → 0 not real**, 2 unclear
   (held only by aggregate ghost rows, no mesh), 3 real alignments not emitted because the greedy window cuts them (a
   property of the definition, identical in the Python oracle — a spec note for red1, not a defect). #1744 also lost 6
   real planes and made 1 spurious one through the rx/ry guard; #1762 restored/removed all 7. 76 count changes are
   re-clusterings (plane kept, merged with a neighbour ≤ 97 mm). Row 7 stays un-linked. Evidence: session scratch
   probe_datums.js + analyze_run2-4.log (two runs, identical). The original line read: Datums 802 → 657 (SampleCastle, from #1744). Still unverified as a *correction* rather than a new
   artifact. ⚠ It does NOT bear on row 7 — I claimed it did and that is retracted (#118).
5. Rows 8 · 9 · 11 · 13 · 14 · 22 · 25. **Row 14's cited example does not reproduce** — re-source it or
   its witness is green on arrival.
6. Blocked on the user, nothing built: 15 · 21 · 26 · 27 · 29 · 31.

**METHOD RULES THIS SESSION PAID FOR. Each one cost a wrong answer first.**
- **Diff against a BASELINE before claiming — or clearing — a regression.** Running 11 witnesses on the
  fix AND on unmodified `origin/main`, side by side, is what caught `witness_e2e_save` breaking (green →
  3/2) *and* proved four other failures were pre-existing. Without the baseline both conclusions were
  unavailable.
- **Never re-derive a transform you can read.** `cross_edges.js` re-implemented "world = centre + R·vert"
  and called it "the same final numbers, fewer steps". It was wrong for 798 of 934 elements. #1747's IFC
  export instead reads the renderer's own baked world vertices, so parity is structural.
- **Wait on a CONDITION, not a duration.** My own witness lied twice: a fixed sleep, then "name matches
  and the bridge stopped changing" — which the PREVIOUS building's untouched bridge satisfies, because
  `__dwName` flips at open START while `__arcFidByGuid` is rebuilt later. Null the globals, wait for
  repopulation (#1750). **Any witness opening more than one resident needs this.**
- **The instrument check comes FIRST, and it is not a formality.** Two probes measured the wrong quantity
  and looked conclusive: comparing a rendered AABB to `element_transforms.bbox_*` proves nothing, because
  `extractIFCtoDB.py:181` defines those columns AS the world AABB. Both W-ARC-3AXIS and
  W-ROW7-GRID-BASELINE now open with a control that voids the run if the decode is wrong.
- **Prove a fix FIRES on merged main, not that it shipped.** A sibling session had two commits stranded
  by auto-merge in one night. Every fix here was re-run against `origin/main` after merging.
- **Docs publish ONLY via `scripts/safe_gh_deploy.sh`.** CLAUDE.md bans bare `mkdocs gh-deploy`; I
  reached for it twice before reading that, and was blocked both times — correctly. The guard caught a
  real deletion (`glassbowl_data.db`) that I had also found by hand.

**TRAPS — state of the world, so nobody re-discovers these.**
- **CI `system-is-real` has NEVER been green — 198 of its last 200 runs failed, back to 2026-07-05.**
  A red X on a bim-compiler PR is **no signal**; check whether the failure is new before believing it.
  87% of it is unpassable by construction. Fully diagnosed in `LFS_QUOTA_AUDIT.md` (#107).
- ~~**`playwright` is NOT installed**~~ ⚠ WRONG, corrected 2026-09-24: it is at `~/bim-ootb/tests/node_modules` (1.59.1); set `NODE_PATH` for bare requires (§STRATEGY). Original: `witness_str_into_arc`, `witness_green_report`,
  `witness_modeller_xedge_lens`, `witness_arc_editable_smoke`, `sdg_gate/cascade_smoke` crash on
  `Cannot find module 'playwright'`. Pre-existing, unrelated to any change here. `puppeteer` IS available
  (resolved from `~/bim-compiler/node_modules`), which is how every witness here ran headless.
- **Gitignored local fixtures.** `modeller/Terminal_arcstr_proof.db` (.gitignore:49) and
  `docs/glassbowl_data.db` exist on the primary checkout's DISK but not in git, so a fresh `/tmp/wt-*`
  has a 0-byte placeholder. That is why W-ROW7-GRID-BASELINE prints INCONCLUSIVE rather than passing over
  an empty population, and why a docs deploy from a fresh worktree aborts. Not a bug — know it.
  `glassbowl_data.db` now also has a durable OCI copy (`§GLASSBOWL-OCI`).
- **Terminal declares ZERO void/fill relations in its source IFC.** Its ride gap is a SOURCE DATA gap,
  asserted in W-RFH-RESIDENTS F4. **Do not "fix" it by fabricating edges.**

**HYGIENE.** This session created and pruned **21** worktrees; **0** of mine remain. 33 `/tmp/wt-*`
survive from other sessions — not mine to prune, and several hold unpushed work (see the 2026-09-15
block's table). `.claude/worktrees/agent-*` are harness-managed; never remove those by hand.

## ▶ §RESUME 2026-09-15 — ⚠ SUPERSEDED by §RESUME 2026-09-21 above. Kept for its history (the worktree
## table is still the current one); it is NOT the entry point. Written by the session that did NOT touch
## the Modeller, so you inherit facts, not a handover story.

**WHAT THE LAST SESSION DID, AND WHY IT MATTERS TO YOU: nothing in `modeller/`.** It ran the Viewer 4D/5D
lane (`TM_4D5D_VARIANCE_LANE.md` §S7 — the construction window on an element). Merged to bim-ootb `main`:
#1731 #1732 #1733 #1735 #1736 #1737; to bim-compiler `master`: #101 #102. Touched `viewer/*` and
`tests/audit_sw_precache.js` only. **No `modeller/` file was edited, so nothing below is stale because of
it** — but two of its by-products are yours to know:
- `viewer/sw.js` is at **`CACHE_VERSION` v1177**. Bump from there, never from a remembered number.
- `tests/audit_sw_precache.js` was hardened (#1737): it now strips comments before pairing quotes, so an
  apostrophe or a `]` in a `PRECACHE_ASSETS` comment no longer silently drops every later entry. Before
  that fix it reported files unchanged for months as "unlisted" and said nothing about the real cause. If
  you add a modeller asset to a precache list, that gate is trustworthy again.

**VERIFIED NOW, not carried forward from prose (2026-09-15):**
- `modeller/tests/` holds **216 witnesses**. Last `modeller/*` work landed **2026-09-11**: the §DAGEVU
  relationship-edge engine and the cut-move arc (`#171x` series — GEOM_CUT_MOVE, GEOM_CUT_RESIZE, cut
  frame under a 90°-multiple GEOM_ROTATE, §DAGEVU-SLIDE).
- **Nothing is in flight.** Both modeller worktrees (`/tmp/wt-dagevu-engine` `feat/dagevu-slide`,
  `/tmp/wt-dagevu-resume-doc` `docs/resume-dagevu-engine`) are `ahead=0 dirty=0` — fully pushed, clean,
  prunable. No one is mid-edit.

**⚠ THE §OPEN LIST BELOW WAS HARVESTED 2026-07-30 AND IS ~6 WEEKS STALE.** Its 34 rows predate the entire
DAGeVu engine arc. **That sweep has now been DONE — see §SWEEP 2026-09-15 immediately below this block.**
All 34 rows were re-marked against `origin/main` @ `3e8c6be2`; 8 moved, 2 new rows were found, and 4
witnesses were actually run. **Read §SWEEP's verdict column, not the 2026-07-30 status column** — where
they disagree, §SWEEP is the measurement and the old column is prose. Do not trust row ordering as
priority. Row 34's "NEXT SESSION START HERE" is spent: it is answered in §SWEEP (and it split in two).

**Row 34 ("anchor export/save leak") — ANSWERED 2026-09-15, both code paths read. Full verdict in
§SWEEP.** Short form: the IFC path cannot leak an anchor because it never handles `GEOM_INSERT` at all —
but that also means it exports NONE of the ARC seed (now row 36, the bigger finding). The Save / Native
`.db` path DOES carry the anchors, because `exportDb` is a raw byte dump of the whole signed op-log with
zero filtering; whether that is a leak or correct behaviour is a call, and it is unwitnessed either way.
`saveModelDb` named in the row does not exist — the real path is `runSave() → Bonsai.exportDb()`.

**HYGIENE — swept 2026-09-15, partly done, and the remainder is NOT yours to prune.** The sweep ran over
all 22 outstanding `/tmp/wt-*` worktrees: **14 pruned** (the 5 this session created, plus 9 verified
`ahead=0 dirty=0` — including both dagevu ones). **13 remain, and every one of them holds real work:**

| state | worktrees | why it stays |
|---|---|---|
| unpushed commits (`no-remote` branch) | `wt-bake-perf` · `wt-batch-class-paint` · `wt-idb-cache-timeout` · `wt-krn-persist-race` · `wt-rule-findings-film` · `wt-storey-cut` · `wt-storey-reveal-list` | the branch was never pushed — pruning DESTROYS the commits |
| merged but dirty | `wt-bake-schedguard` (3) · `wt-buildup-placed` (27) · `wt-scrapbook` (1) | uncommitted changes on top of a merged branch |
| ahead and dirty | `wt-88-ab` (56 ahead, 4 dirty) · `wt-v87` (2 ahead, 17 dirty) · `wt-storey-reveal` (73 dirty) | someone's live in-progress work |

**Do not prune any of the 13 without the owner's word.** `wt-storey-cut` alone carries 359 dirty files.
If you add worktrees, prune YOUR OWN at close (`ahead=0` AND `dirty=0`), and leave these alone.

**METHOD RULES THIS LANE EARNED THE HARD WAY LAST SESSION — they apply here unchanged:**
- **A number that decides scope gets measured before it decides anything.** Three times in one session a
  plausible figure stood in for a measurement: a timing taken from the wrong function, a code comment's
  cap turned into a prediction, and a cross-file diff read as code drift. All three were wrong, all three
  were caught only because something forced a re-check.
- **A diff that decides scope must hold every variable but one.** The third of those varied two — the file
  AND the code version — then blamed the code. In THIS lane that trap is live: `*_extracted.db` and
  `*_silent.db` are different files with different completeness (Hospital: 64,150 transforms vs 63,917).
  Never diff across two building DBs and attribute the difference to code.
- **Prove a fix FIRES, not just that it shipped** — grep a real log line, never "code changed".

## ▶ §SWEEP 2026-09-15 — the re-verify sweep §RESUME ordered, DONE. All 34 rows re-marked against
## bim-ootb `origin/main` @ `3e8c6be2` by grep/sqlite, plus 4 witnesses actually RUN. **Rows 24 and 28 were
## then CLOSED the same day by bim-ootb #1738 — see their rows.** Read this table,
## not the 2026-07-30 status column below it — where they disagree, this one is the measurement.

**Method, so the next session can falsify any line here:** every verdict below names either a file:line on
`origin/main`, a `sqlite3` count off the SHIPPED resident DB, a live `curl` + content-hash, or a witness
run with its own PASS/FAIL line. No verdict rests on a code comment (two comments turned out to be wrong —
rows 28 and 35). Witnesses run through `modeller/tests/e2e_harness.js`, which resolves puppeteer 24.42.0
out of `~/bim-compiler/node_modules` — no install needed, and **"needs a browser" was not a reason to skip
any of this.**

### CHANGED ROWS — the 8 that moved. Everything not listed here is unchanged from 2026-07-30.

| # | 2026-07-30 | 2026-09-15 verdict | the evidence |
|---|---|---|---|
| 19 | verified-open | ✅ **CLOSED** | `move-gizmo.png` was recaptured in bim-compiler **#73** (2026-08-07). Verified where the user sees it, not on master: `GET https://red1oon.github.io/BIMCompiler/img/modeller/move-gizmo.png` → HTTP 200, **423,928 B**, content sha1 **`22a794f4df215ec50231aa642b904303f72d4006`** == the `origin/master` blob. A 200 alone would not have been evidence (§PRIME LESSON) — the hash is. |
| 32 | verified-open (RED on main) | ✅ **CLOSED** | **#1704** (2026-09-10) routed soft-delete through `modeller_history.js`'s tree. RAN it: `W-E2E-DELETE: 8 PASS / 0 FAIL`, **D4 green** (`len 195→195 meshFid175=0`). The witness's own D4 header now records the supersession. |
| 23 | verified-open (D3 drift) | ✅ **the named defect is FIXED — RE-POINT the row** | RAN `witness_disc_density.js`: `§DW-DENSITY-TE: 8 PASS / 0 FAIL`, **D3 ENVELOPE = 100% on all four** (PLB 26/26, ELEC 1754/1754, FP 996/996, ACMV 1444/1444) against the row's 94.3 / 92.0 / 94.8. **But the witness prints a DIFFERENT live finding it does not fail on:** `⚠ FINDING ELEC over-count 1754 vs real 833 = 2.11× — density-transfer drift (ARC footprint ≠ disc coverage area)`. That is the open item now; the D3 wording is dead. |
| 24 | ✅ **CLOSED 2026-09-18 — see §SWEEP.** Root cause `e2e_harness.js:349` `process.exit()`; fixed in bim-ootb #1738 (§MULTIRUN). `§SMOKE-ALL runs=2/2`, SampleCastle was never broken | ✅ **ROOT-CAUSED AND FIXED** — bim-ootb **#1738** | Reproduced exactly: `smoke_arc_only.js` prints Duplex (`meshCount=196`, 2 PASS / 0 FAIL) and **exits 0** with the SampleCastle iteration never running. Cause: **`modeller/tests/e2e_harness.js:349`** — `runE2E` ends with `process.exit(fail ? 1 : 0)`, so the first `await runE2E(...)` never returns. Nothing is wrong with SampleCastle. **Generalised trap: ANY witness file that calls `runE2E` more than once is silently single-run and still exits 0.** `smoke_arc_only.js` is the only such caller today. **FIXED in #1738 (§MULTIRUN):** additive `opts.noExit` makes `runE2E` resolve with `{name, pass, fail}`; the exit stays the default so every single-run witness is byte-unchanged (regression-checked: green still exits 0, red still exits 1). `smoke_arc_only.js` now tallies both runs and refuses with exit 1 if one was skipped — `§SMOKE-ALL runs=2/2 4 PASS / 0 FAIL`. **SampleCastle was never broken**: `meshCount=3290`, 2/0. |
| 34 | verified-open ("NEXT SESSION START HERE") | ⛔ **ANSWERED — and it splits in two, one of them bigger than the question** | **(a) IFC export CANNOT leak an anchor.** `bonsai_ifc.js` `build()` handles exactly three op types — `GEOM_EXTRUDE_POLY` (:112), `GEOM_CUT` (:123), `GEOM_ARRAY` (:142). Anchors are `GEOM_INSERT` (`arc_editable.js:227`) → never reached. **(b) …but so is EVERY ARC-seeded element** (`arc_editable.js:342` is also `GEOM_INSERT`), so an IFC export of an opened resident exports **none of the seed**. That is a far larger finding than the anchor question and it is now row 36. **(c) Save / Native .db DOES carry anchors, by construction.** `modeller.html:3068` — `exportDb` = `await O.db.export()`, a raw byte dump of the whole signed op-log DB, zero filtering; `runSave()` calls that same writer (`modeller.html:2908`). Grep for `anchor` across `sdg_save.js` + `save_catalog.js` + the save path: **zero hits**. `saveModelDb` named in the row **does not exist** — the path is `runSave() → Bonsai.exportDb()`. Whether (c) is a leak is a real call, not a bug report: the anchors are signed ops tagged `anchorOnly:true` / `provenance:'void_anchor'` and re-open as invisible anchors, so a "full-fidelity" dump arguably SHOULD carry them. **Either way it is unwitnessed.** |
| 28 | verified-open (contradiction) | ✅ **DOES NOT REPRODUCE — CLOSED with a guard** (bim-ootb **#1738**) | New witness `witness_arc_3axis_rotation.js` (W-ARC-3AXIS), run on the FULL population of the shipped `SampleCastle_ARC.db`: `§ARC3AXIS-TILTED {n:293, real:293, seeded:293, pre:63, applied:230, dropped:0, other:0}` against a control of `§ARC3AXIS-FLAT {n:2405, real:2354, seeded:0, pre:2354, dropped:0}`. All 293 carry `placement.rotX/rotY` in their `GEOM_INSERT`; **230 genuinely need the rotation and get it** (their pre-placement mesh extent differs from their authored world AABB); 63 are already world-aligned; **0 dropped**. The 2026-07-10 finding predates **§GEO-SERVED (#1090)** — before that the Modeller drew bounding boxes, and a box has no orientation to lose. RED-first: neutering `place()`'s `pl.rotX \|\| pl.rotY` branch flips exactly 230 to dropped and takes R4+R5 RED (exit 1), control untouched. ⚠ **A WRONG TEST WAS TRIED FIRST AND LOOKED CONCLUSIVE** — comparing the rendered world AABB against `element_transforms.bbox_*` proves nothing, because `extractIFCtoDB.py:181` defines those columns AS the world AABB; the discriminating quantity is the PRE-PLACEMENT mesh bbox. That near-miss is written into the witness header so it is not repeated. `arc_editable.js`'s false comment ("0 non-zero rotation_x/rotation_y rows") corrected in the same PR: it is 293, all `rotation_y = ±π/2` exactly, across IfcCovering 125 · IfcWindow 80 · IfcWall 32 · IfcDoor 28 · IfcWallStandardCase 21 · IfcRailing 7. |
| 12 | verified-open | verified-open — **and its blast radius grew** | `rel_fills_host` ships as a SQL patch, never in the binary (so sqlite on `*_ARC.db` says "no table" for all 8 — that is the wrong instrument). Real census of `modeller/patches/*_ARC.db.sql`: **Duplex 54 · SampleCastle 83 · SampleHouse 11 mentions; Clinic, Garage, HHS, Hospital, Terminal = 0.** Exactly the five the row named. **New consequence the row predates:** `dagevu_engine.js:62` builds every `HostFillEdge` from a REAL `rel_fills_host` row, so **#1706's anchor-by-default engine — the headline of the whole DAGeVu arc — is inert on 5 of the 8 residents.** |
| 10 | re-measure | **RE-MEASURED (local only)** | RAN `witness_e2e_terminal_open.js`: `7 PASS / 0 FAIL`, **`§OPEN openMs=20592`**, 35,552 ARC elements seeded exactly, `verifyChain ok len=35552` in 1,176 ms. Signing is still a visible phase — 3 of the 8 distinct status lines are `signing 3000/13500/25500 of 35552`. ⚠ **This is headless-swiftshader on localhost. Do NOT set it against the old 14 s profile and call it a regression — different rig, and that is exactly the "hold every variable but one" trap §RESUME warns about. The LIVE number is still unmeasured**, and §RESUME's own rule says the live URL is where this has to be proven. |


### §ROW-12 FOLLOW-THROUGH — two things worth carrying forward (2026-09-18)

**Garage's source was ambiguous and the ambiguity was RESOLVED BY MEASUREMENT, not by picking.** Its
recorded `source_file` (`HospitalGarage_ARC.ifc`) is not on disk. Two candidates matched 5/5 GUIDs —
`HospitalGarage_IFC4.ifc` and `HospitalGarage_IFC2x3.ifc` — and they produce DIFFERENT `opening_guid`s, so
picking one blind would have been a coin flip presented as a fact. The 36 FILLED `host|filling` pairs, the
only ones the engine rides, are byte-identical across both schemas, so the choice is immaterial *for the
ride*. If anything ever needs `opening_guid` itself, this is unresolved and must be settled first.

**The witness raced, and it took two wrong conditions to get right — worth knowing before writing the next
multi-building witness.** `__dwName` flips at the START of an open, but `__arcFidByGuid` is rebuilt LATER,
in the geo-fetch continuation. So "the name matches and the bridge stopped changing" is satisfied by the
PREVIOUS building's untouched bridge, silently: the first re-run against merged main reported Hospital
`rideable=0` against an expected 506, with `bridge=1950` — Clinic's size. The data was correct the whole
time. The fix is to NULL `__arcFidByGuid`/`swXEdges` before opening and wait for repopulation, so a
non-empty bridge is necessarily this building's (bim-ootb #1750). **Any witness that opens more than one
resident needs this; a fixed sleep will pass locally and lie later.**

### §SWEEP FOLLOW-THROUGH 2026-09-18 — what is actually left, ranked

Rows 19, 23, 24, 28, 32 and 35 are now marked closed IN THE TABLE ITSELF, not just here — a row that
still reads `verified-open` after being closed is the same stale-claim trap this file exists to kill.

**The largest genuinely-open item is row 36, and it was found by accident.** IFC export handles only
`GEOM_EXTRUDE_POLY`/`GEOM_CUT`/`GEOM_ARRAY`; every ARC-seeded element is a `GEOM_INSERT`, so exporting an
opened resident emits **none of the building**. Nobody has ever reported it, which suggests nobody has
tried the feature on a resident. Ranked above the rest because it is a headline capability that silently
produces an empty file.

**Row 12 is the second, and its blast radius grew:** `rel_fills_host` ships for Duplex/SampleCastle/
SampleHouse only, and `dagevu_engine.js:62` builds every `HostFillEdge` from a real row — so **#1706's
anchor-by-default engine, the headline of the whole DAGeVu arc, is inert on 5 of the 8 residents.**

**Two threads §XEDGE-GEOWIRE (bim-ootb #1744) opened and did not close:**
- **The residual 11.** G4 is honestly RED at 11 of 12,983 on SampleCastle, deliberately not relaxed.
  Two suspects, unmeasured apart: `_readBoxes`' `rx/ry` guard (whose stated premise is the same false
  claim corrected in #1738 — 293 such rows exist, so the guard fires on real data and the 3-axis path it
  distrusts is now itself witnessed, making it probably liftable), and the 1,301 of 3,225 elements with
  no resolvable blob.
- **Datums 802 → 657 on SampleCastle.** Plausibly correct — anchor-displaced faces were manufacturing
  false alignment clusters — but still UNVERIFIED as a *correction* rather than a new artifact.
  ⚠ **RETRACTED 2026-09-21, the row-7 half of this claim was WRONG.** I wrote that it "bears directly on
  row 7 because that grid is built from these datums". It is not: `str_walker.js` derives its OWN emergent
  grid by 1D-clustering column centres and has ZERO references to `CrossEdges`/`swXEdges`. The two
  derivations are unrelated and #1744 did not move row 7's baseline. Row 7 was re-measured anyway
  (bim-ootb #1753) and the real finding is different — see row 7. The datum question itself stays open.

**A sibling consumer of the same substrate defect is on record but unmeasured:** `scripts/compile_rooms.py`
(Viewer room injection) reads `center_*`/`bbox_*` straight off `element_transforms` with no rotation and no
blob resolution. Exposure is NOT uniform — `door_dims` reads extents only and is safe (934/934 correct);
`storey_doors`/`storey_z_anchors`/stair footprints read positions and are exposed. See
`SPATIAL_DEPENDENCY_GRAPH.md` §ANCHOR-SUBSTRATE-SIBLINGS. Measure before touching it.

**Unchanged and still open:** 6 (Terminal 0 MEP), 7, 8, 9, 11, 13, 14, 22, 25. **Row 10 half-answered** —
re-measured at `openMs=20592` on 35,552 elements, but LOCAL headless only; the live number §RESUME asks
for is still unmeasured, and the old 14 s figure must not be diffed against it (different rig).
**Blocked on the user, nothing built:** 15, 21, 26, 27, 29, 31. **Deferred by design:** 30.

⚠ **Row 14's cited example does not reproduce** — Dining_Chair measures 0.443/0.427/**1.227** m, upright,
not "z=0.14 lying on its side". The item stands; re-source the example or its witness is green on arrival.

### NEW ROWS found by the sweep

| # | obj | item | proof required | status |
|---|---|---|---|---|
| 35 | O13 | **The LIVE guide contradicts shipped behaviour — and the fix is NOT a plain deploy.** The published ModellerGuide says *"Hosted doors and windows **ride**, never distort"* (1 hit live; **0** hits of "ANCHORED by default") — but **#1706** (2026-09-11) made openings **anchor by default with ride opt-in**, the exact reverse. Master fixed the text in `2c232661c`. ⚠ **DO NOT just run `mkdocs gh-deploy` from master — it would take live pages OFFLINE.** Measured 2026-09-15: the site was deployed from **`fable/meshdb-livewire` @ `58e7f344a`**, NOT from master, and `58e7f344a` is **not an ancestor of master** — they are two partly-overlapping doc trees, not old-vs-new. Deploying master would delete **11** published files, including two public pages that are live and in the fable branch's `mkdocs.yml` nav today (both HTTP 200): `docs/SpatialCompilationPaper.md` (the academic paper, 735 lines) and `docs/4DGenerator.md` — neither has ever existed on master. Master would add 4 files (`internal/LAST_MILE_PROBLEM.md`, `internal/PROJECT_CHRONOLOGY.md`, `internal/VibeProgramming.md`, `glassbowl_data.db`). This is the same two-production-paths shape `LFS_QUOTA_AUDIT §6.1` already recorded | **a decision first — which branch owns the published site** — then reconcile the two doc trees onto it, deploy, and re-curl: assert "ANCHORED by default" present, "ride, never distort" gone, and `SpatialCompilationPaper`/`4DGenerator` still HTTP 200 | ✅ **DONE 2026-09-18.** Site consolidated onto master (BIMCompiler #106 — 3-way against the merge-base, zero conflicts, 11 fable-only files ported) and published via `scripts/safe_gh_deploy.sh` (NOT bare `mkdocs gh-deploy`, which CLAUDE.md bans). Guard PASS live=290 → new=292 superset; all 7 canaries 200. Verified live: "ANCHORED by default" 1 hit, "ride, never distort" 0 hits, `SpatialCompilationPaper`+`4DGenerator` still 200 |
| 36 | O1/O8 | **IFC export ignores `GEOM_INSERT` entirely**, so exporting an opened resident emits nothing from the ARC seed (see row 34b). `bonsai_ifc.js` `build()` covers `GEOM_EXTRUDE_POLY`/`GEOM_CUT`/`GEOM_ARRAY` only; every seeded element is `GEOM_INSERT` (`arc_editable.js:342`) | open Duplex → Export ▸ IFC → count products in the emitted file vs the 196 seeded meshes; RED-first against current main | verified-open — found by the row-34 read, never previously stated |

### ROWS RE-CONFIRMED UNCHANGED (spot-checked, no movement)

- **✅ still shipped:** row 2 (`docs/ModellerGuide.md:164` "What a wall is made of" — **and live**: HTTP 200, 128,351 B, 3 hits) · rows 3 + 33 (Duplex `geoV: 6`, `str_walker_outliner.js:52`) · row 4 (§ANCHOR, 7 hits in `arc_editable.js`) · row 16 (`bonsai:refold`/`_paintSel`, 11 hits) · row 17 (`__ALL__`, 5 hits) · row 18 (`modeller.html:4095/4146/4150`).
- **verified-open, unmoved:** row 5 (one §ONE-DISC-TAB hit at `modeller.html:4811`; no unification slice built) · row 6 (`Terminal_ARC.db` still served — 35,552 elements across 13 classes, **0** Pipe/Duct/Cable/Flow rows) · row 7 (`witness_str_into_arc.js:5` still cites RMSE 0.104 m) · row 8 (#1245's `witness_e2e_gridmove_roof.js` is roof grid RECOMPOSE — not the per-element plate walk this row asks for) · row 9 (`sdg_gate.js:106` still calls apply "a future accept-gated op") · row 11 (`arc_editable.js:27-31` — colour stays the cosmetic PALETTE, only alpha recovered) · row 13 (`modeller.html:424` and `:1036` still name the un-vendored EffectComposer) · row 25 (no BCF import, no PBR texture code).
- **row 15** — the figures check out: `library/component_library.db` is **220 MB** with `component_definitions` = `component_geometries` = **23,888** rows, and there is still no `createDbWorker` anywhere in `modeller/`. ⛔ still the user's hosting call (GH vs OCI).
- **row 22 splits three ways:** one-click revert of a RED — not found, open. UBBL named checks — **partially shipped**, `sdg_gate.js:139-154` implements By-Law 42 (area ≥ 6.5 m², headroom ≥ 2.5 m) but the file itself marks it `STATIC, not part of evaluate()'s delta contract`. rtree prune — `cross_edges.js:38` replaced the Python rtree query, but `disc_walker.js:929` still records that Terminal has no `elements_rtree` and falls back to the raw unverified centre; open.
- **row 30** — still dead code (`bonsai_gridmove.js:166` hardcodes `ifcClass: 'IfcWall'`, so `isRoof` is always false). ⚠ **but it is now a one-liner**: `classByFid` is computed and used as a filter nine lines earlier (`:157`) — the real class is in hand at the emit site and thrown away. Still needs its own design pass; noting only that the blocker named in `GRID_ROTATION_GUARD.md §8` has dissolved.
- **⛔ still blocked on the user, nothing built:** rows 21, 26, 27, 29, 31. Greps for `siblingCluster` / external-IFC import / `DUAL_MODEL` return zero hits in `modeller/`.
- **row 14** — the item is real (no axis-permutation bake in `scripts/extract_dagevu_catalog.py`) but ⚠ **its cited example no longer reproduces**: Dining_Chair (hash `5e4c8c071b267e91`) measures **0.443 / 0.427 / 1.227 m** in `viewer/dagevu_geometries.json` — tallest axis IS z, upright. The row's "z=0.14, lying on its side" is stale. Re-source the example from a part that still fails before writing the `tallest-axis == h` witness, or the witness will be green on arrival and prove nothing.

## ⚖ THE USER IS NOT REVIEWING. YOU ARE THE ONLY CHECK.
The user has explicitly said they have no time to inspect this work. That REMOVES the safety net; it
does not lower the bar. Therefore, in this lane:
- **Every claim carries its own `§`-tagged log line or it is not done.** No exceptions, no "should work".
- **No screenshot, no "looks right", ever, as proof of anything** — that is FUNDAMENTAL LAW in
  `CLAUDE.md`. Numbers computed from real object state, read programmatically.
- **Prove it where the USER will see it — the live URL — not only on localhost.** See §PRIME LESSON.
- **A witness that cannot fail is not a witness.** Every test names the issue it proves, and must be
  shown failing on the pre-fix code.
- **Report only finished, verified outcomes.** One line each. Not plans, not progress.

## 🔴 §PRIME LESSON — read before diagnosing ANYTHING (learned the hard way, 2026-07-29/30)
The Modeller rendered every element as a bounding box on the LIVE site for months while every local
measurement said "real geometry, 215/215". Cause was two faults stacked:
1. **Hosting** — `modeller/mesh.db` is Git-LFS-tracked and **GitHub Pages does not resolve LFS**. The
   browser got HTTP **200** with a **134-byte** text stub (`version https://git-lfs.github.com/spec/v1`).
2. **Silent substitution** — with no mesh store at all, `arc_editable.js`'s hard-fail guard was SKIPPED
   (it only fires when a store exists but one element's link is broken), so every element fell back to
   `boxArrays(rawBox)`, its measured bounding box. The only log line was a `console.warn`, which
   DevTools hides by default.

**The diagnostic order this burns in — apply it to every "the Modeller looks/behaves wrong" report:**
1. `curl` every asset the live page needs. Check real size and magic header. **A 200 is not evidence.**
2. Read what the code does when an asset is missing or junk. **If it substitutes anything — a box, a
   default, a placeholder — that silent substitution IS a bug in its own right,** worse than the missing
   file. Fix both; fixing only the file leaves the trap armed.
3. Check the service-worker `CACHE_VERSION` and whether the file is precached. A landed fix that a
   cached script overrides reads to the user as "still broken".
4. Only then explain — one line, naming the asset and the substitution.

**Do NOT start with:** local DB queries, triangle counts, part-count comparisons, material/lighting
audits, or LOD definitions. None of those can see a deployment fault, so none of them can answer.

**Fixed 2026-07-30, both faults** (bim-ootb PR #1090 merged + #1091 cache bump): each resident now has
its own small geo file on object storage (Duplex 1.3MB instead of a shared 120MB; all 8 residents
resolve 100% of their element hashes, verified), and `_assertRealGeoDb()` refuses non-SQLite bytes,
names an LFS stub explicitly, and logs as `console.error`. Guard witnessed 4/4 against real live bytes.
⚠ **`modeller/mesh.db` is now DEAD WEIGHT in git** — nothing fetches it. Do not re-point anything at it.

## 🎯 THE OBJECTIVES — "the Modeller works" means ALL of these, measured
Derived from the 15 files below + `[[project_modeller_vision_lock]]`. Each line: the objective, then
where its detail lives. **None of these may be quietly dropped to make a report look finished.**

| # | objective | authoritative file |
|---|---|---|
| O1 | **Real authored geometry renders — never a substitute**, on the LIVE site, for every resident | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` |
| O2 | **LOD400 means fabrication level** — an authored multi-layer wall is not one block (see §LOD400-ENVELOPE) | same, §LOD400-ENVELOPE + §LOD400-DISPATCH |
| O3 | **ONE coherent surface** — the Outliner leads (Building▸Storey▸Room▸disc▸class▸element), not 3 unlabelled tabs | `RESUME_MODELLER_UX_OUTLINER_PILL.md` |
| O4 | **Direct manipulation** — select · hover · move-on-axis · multi-select · snap · rotate | `MODELLER_DIRECT_MANIPULATION.md`, `RESUME_MODELLER_P3.md`, `RESUME_MODELLER_POLISH.md` |
| O5 | **Material at Viewer standard** — glass reads as glass; reflection/grain/roughness/light rig parity | `MODELLER_RENDER_MATERIAL_PARITY.md` |
| O6 | **Placement anchor semantics correct** — elements seat where the source says, not where a box implies | `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` |
| O7 | **Insert from the REAL BOM catalog**, not a hardcoded 3-component fixture | `MODELLER_BOM_CATALOG_SPEC.md` |
| O8 | **Save = validated snapshot promotion** (CompleteIt-shaped), not a raw dump | `MODELLER_SAVE_COMPLETEIT.md` |
| O9 | **Conformity gate** — RED/ORANGE planner's gate on edits | `RESUME_MODELLER_CONFORMITY_GATE.md` |
| O10 | **Spatial Dependency Graph as authoring truth** — typed cross-edges, host/filling rides its wall | `RESUME_GRAPH_MODELLER_INTEGRATION.md` |
| O11 | **Opens at Terminal scale** without a signing stall; roof/IfcPlate fast placement | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` |
| O12 | **Zoom-to-selection parity** with the Viewer Find panel | `MODELLER_ZOOM_TO_SELECTION.md` |
| O13 | **Guide-worthy** — the public guide's screenshots are honest and current | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` |
| O14 | **Competitive polish** — outline-pass selection, shadows/AO, BCF/IFC interop | `RESUME_MODELLER_COMPETITIVE_POLISH.md` |
| O15 | **3D Grid editing is the primary handle** — drag a gridline and the building RECOMPOSES (stretch, not scale); openings stay host-bound; rotated bays stay square; no state leaks between clears | the 9 `GRID_*.md` files + `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` — triaged below |
| O16 | **2D views ARE the drawings, and they are an INPUT surface** — orthographic elevations F/B/L/R + sections flatten ALL geometry, storey markers at real Z; end-state: drag a gridline in plan → write Δ to DB → recompile → services re-route | `[[project_2d_views_roadmap]]`; ⛔ **PDF/DXF sheet export is NOT yet an objective** — see §2D-AND-PDF below |

## 📋 TRIAGE — the 15 files, 3,742 lines total. Consolidation rule: this MASTER owns the OPEN LIST and
## the objectives; each file keeps its own history and detail. **Do not delete any of them.**

| file | lines | owns | first action for the study session |
|---|---|---|---|
| `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` | 599 | O1, O2 — geometry truth, the envelope defect, §GEO-SERVED history | its `§START HERE` + `§LOD400-ENVELOPE` are current; harvest OPEN items 1–6 |
| `RESUME_GRAPH_MODELLER_INTEGRATION.md` | 398 | O10 — graph/cross-edges into authoring | harvest open items |
| `MODELLER_BOM_CATALOG_SPEC.md` | 393 | O7 — real catalog INSERT | check whether the 3-component fixture still ships |
| `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` | 376 | O13 — guide screenshots + the old "geometry hell" thread | ⚠ its geometry-hell verdict is SUPERSEDED by §LOD400-ENVELOPE |
| `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` | 309 | O11 — open speed, roof/IfcPlate | re-measure at real Terminal scale, live |
| `RESUME_MODELLER_UX_OUTLINER_PILL.md` | 236 | O3 — one-surface UX | the 3-surface unification was DESCOPED, not shipped — decide |
| `MODELLER_RENDER_MATERIAL_PARITY.md` | 229 | O5 — material | glass opacity DONE; reflection/grain/roughness/lights NOT ported |
| `RESUME_MODELLER_COMPETITIVE_POLISH.md` | 208 | O14 — polish research (design only, no code) | ~11 quick wins already identified; rank them |
| `MODELLER_DIRECT_MANIPULATION.md` | 184 | O4 — the manipulation core | spine reported DONE; verify on the LIVE site |
| `MODELLER_ZOOM_TO_SELECTION.md` | 148 | O12 — camera parity | small, well-specified |
| `RESUME_MODELLER_ARC_ANCHOR_PLACEMENT.md` | 139 | O6 — anchor semantics | verify the flip actually shipped |
| `RESUME_MODELLER_POLISH.md` | 98 | O4 follow-ups | harvest |
| `RESUME_MODELLER_P3.md` | 87 | O4 multi-select | reported fully ✅ — confirm, then retire to a pointer |
| `RESUME_MODELLER_CONFORMITY_GATE.md` | 77 | O9 — RED/ORANGE gate | harvest |
| `MODELLER_SAVE_COMPLETEIT.md` | 61 | O8 — Save semantics | harvest |
| dir `prompts/Modeller/` | — | `COMPETITIVE_FREECAD_INTEROP.md`, `DISC_Walker/` | read, fold pointers in here |

### O15 — the GRID family, added 2026-07-30 (reviewer gap: the first harvest swept only `MODELLER_*`/
### `RESUME_MODELLER_*` filenames, so 10 files / 1,613 lines covering the Modeller's PRIMARY HANDLE were
### never triaged. The grid is how a user edits the building; it cannot be a single row in the queue.)

| file | lines | owns | first action |
|---|---|---|---|
| `GRID_ROTATION_GUARD.md` | 445 | rotated-bay correctness — the deepest of the family (20 done-marks) | verify the guard shipped, then harvest its 5 remaining |
| `GRID_ROTATED_SCALE_HARDENING.md` | 260 | scale hardening in `bonsai_kernel_worker.js` + its own witness | mostly ✅ — confirm, retire to a pointer if so |
| `GRID_KINEMATICS_SANDBOX_PROOF.md` | 233 | the 3D authoring-grid system proof (`bonsai_grid.js`, `grid_kinematics.js`) | this is the doctrine file for O15 — read FIRST |
| `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md` | 162 | **grid ⊗ BOM as ONE authoring substrate** — 6 open, 0 done | spec-only, never built; decide if it is still the intended architecture |
| `GRID_PREDRAG_PREVIEW_SAVE_COMPLETEIT.md` | 151 | master design dialogue (reference only) — feeds O8 + pre-drag preview | reference; do not build from it directly |
| `GRID_SMART_ELEMENT_SCOPE.md` | 136 | which elements a drag legitimately takes with it | harvest — 10 open |
| `GRID_CLEAR_STATE_LEAK_FIX_ROUND2.md` | 100 | state leaking across a grid clear, round 2 | claims ✅ 2026-07-04 with "PR TBD" — **verify it actually landed** |
| `GRID_CLEAR_STATE_LEAK_FIX.md` | 72 | round 1 of the same | superseded by round 2 — confirm, then pointer |
| `GRID_PREDRAG_GREENORANGE_PREVIEW.md` | 54 | green/orange pre-drag preview | states shipped — confirm |
| plus queue row 7 | — | 🟥 the grid-lock crux, 0.104 m residual | already ranked; its own heavy session |

**Harvest rule for these, same as before:** verify against shipped code before listing anything as open —
two of these files claim DONE with no PR reference, which is exactly the stale-claim shape the first pass
found 11 of. Add the surviving rows to §OPEN LIST tagged `O15`.
**✅ HARVESTED 2026-07-30 (same day):** surviving rows = **28–31** in §OPEN LIST. Everything else in this
table verified SHIPPED against origin/main — including both suspect ✅s ("PR TBD" landed; tilt-guard merged
as PR #722 squash) — see the O15 stale-claims block. The one contradiction finding: row 28 (code present,
live measurement says inert).

### §2D-AND-PDF — the vision question, answered 2026-07-30 (user: *"Vision from there on can we do 2D
### professional drawing exporting to PDF?"*)

**Recorded position (`[[project_2d_views_roadmap]]`), unchanged:** *"The 2D views ARE the architectural
drawings. Full-screen + print-screen replaces export for now… No DXF/PDF export needed yet."* So PDF is a
**deliberate deferral, not a missing capability**, and the roadmap deliberately aims PAST export:

> *"End state: drag grid lines → write Δ to DB (like DXFSyncVerb) → recompile building → RouteWalker
> recomputes MEP. This is the BIM Designer Browser round-trip: 2D view is both output AND input surface."*

That is the same handle as O15 seen in plan. **O15 and O16 are one mechanism, two views — do not build
them as separate features.**

**Substrate that already exists** (verify each before assuming, per §PRIME LESSON): orthographic
elevations F/B/L/R, cross-sections showing slab/ceiling/roof heights, storey markers from
`detectStoreys()` at real Z, subtle gridlines with click-a-bay highlight (`viewer/elevation.js`).
Requirements already fixed by the roadmap: an elevation must flatten **ALL** geometry onto the view plane
(no empty spaces), and stairs must read from every side like a real drawing.

**⛔ NOT an objective until the user says so.** Professional PDF sheets = sheet frame + titleblock + real
scale + dimension strings + line-weight hierarchy — a genuinely new lane, not a small addition, and it
would be the first thing this product exports for print. Do NOT start it off this file. If greenlit it
becomes O17 with its own spec; until then the answer to "can we?" is **yes, and the 2D substrate is
already there — but the recorded priority is the round-trip, not the printout.**

## 🚚 THE DISPATCH — model allocation, stated honestly
Per `[[feedback_model_allocation_mastermind_vs_execution]]`:
- **Fable5 — YES for the wide mechanical pass, and it is the right tool for it.** Reading 3,742 lines
  across 15 files, extracting every open item verbatim with its file + section, de-duplicating,
  detecting claims that contradict shipped code, and filling in §OPEN LIST below. Long-context,
  mechanical, high-volume, fully specified. Fable5 does NOT write memory files.
- **Sonnet — required for the architecture calls**, of which at least three are already known and
  cannot be delegated to a mechanical pass: (a) §LOD400-ENVELOPE's one-mesh-per-element vs N-sub-instances
  decision; (b) whether the descoped 3-surface Outliner unification is still wanted; (c) whether a
  void-consumed host becomes a non-rendered logical anchor.
- **The user's own call** on anything that changes what the product IS, not how it is built.

**Sequence:** Fable5 harvest → §OPEN LIST filled and ranked → Sonnet takes the 3 calls → Fable5 builds
the mechanical items to zero → each item marked `✅ DONE (witness)` or `⛔ BLOCKED: <the one question>`.

## 📌 §OPEN LIST — FILLED 2026-07-30 (Fable5 harvest, all 15 files + `prompts/Modeller/`, every row
## verified against bim-ootb `origin/main` by grep/sqlite — not carried forward from prose)
Format, one row per item, ranked most-blocking first:

`| # | objective | item, in one plain line | source file §section | proof required | status |`

| # | obj | item | source | proof required | status |
|---|---|---|---|---|---|
| 1 | O2 | ⛔ ARCH CALL (a): layered-wall representation — N sub-instances per layer vs ONE layered mesh + per-layer index (file recommends b) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LOD400-DISPATCH` step 2 | the choice stated in one line, recorded in that file | ✅ CALL MADE 2026-07-30 — **(b) one layered mesh + `component_geometry_layers` index**, recorded in the source file §LOD400-DISPATCH; row 3 unblocked |
| 2 | O2 | the plain-English "what a wall is made of" guide subsection — the user's PRIMARY asked-for deliverable, [[feedback_terse]] binding | same, step 1 | subsection in `docs/ModellerGuide.md` (zero "layer" hits there today) | ✅ DONE 2026-07-30 — "What a wall is made of" committed after §Realistic glass; deploy via `safe_gh_deploy.sh` post-merge |
| 3 | O2 | §LOD400-LAYERS-REAL: slice the authored envelope at authored layer thicknesses; ship layers+`surface_styles` to residents (patch + self-heal loader); then the Modeller half of the gate refuses envelopes | same, §THE FIX items 2–3 | `witness_lod400_envelope.py` gate GREEN; 7-layer wall `2O2Fr$t4X7Zf8NOew3FNbT` renders 7 slabs summing to authored total; falsified by removing one layer row | ✅ extractor half DONE 2026-07-30 (PR #57 merged; W-LOD400-ENVELOPE **12/12 exit 0 on Duplex, independently re-run by the orchestrator**, refusals: DX 0, SC 1 honest `sporenkap` pitched-roof → SC still exits 1 by design). ✅ **FULLY DONE 2026-07-30 — residents half shipped (bim-compiler PR #59 + bim-ootb PR #1096, both MERGED):** layer tables → `patches/Duplex_ARC.db.sql` self-heal; rebuilt `Duplex_geo.db` (layered buffers under the EXISTING hashes via per-guid measured change-of-basis — fresh hashes match 0/155 shipped, see the §LOD400-LAYERS-RESIDENTS record) uploaded to OCI + byte-verified live; `arc_editable.js` §LAYER-GATE refusal armed (schema-detected, Duplex only; SC untouched by design); geoV 3→4, sw v40→v41; W-E2E-LAYERS-RESIDENTS **8/8 against the LIVE geo URL** (party wall 124 tris / 7 rows Σ0.550 m / slabs 16-41-193-50-193 mm; falsification fires; unpatched residents byte-identical). Per-layer render COLOR deliberately not wired (needs face-group materials through the fold payload — own slice; data already ships). ⚠ **WATCHDOG CORRECTION 2026-07-30 (live-queried): the party wall renders 5 slabs, NOT 7** — layers 5-6 (Metal Stud 41mm, outer Plasterboard 16mm) have `face_count=0`, `face_start=124` = past the buffer end. 4 empty rows / 229 total, on 2 of 71 walls (both 7-layer, both opening-cut). The witness was BLIND BY CONSTRUCTION: thickness-sum (0.550) and face-count-sum (124) both reconcile while two layers are missing — a green computed over the wrong quantity, the same shape as §PRIME LESSON. → row 33 |
| 4 | O1 | ⛔ ARCH CALL (c): should a VOID-CONSUMED host become a non-rendered logical anchor (SC `stretchRide` reach 9/74 because 65/71 hosts are void-consumed) | `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE` OPEN 1 | doctrine analysis + recommendation recorded; **user's word before any build** | ✅ DONE (witness) 2026-07-30 — BOTH halves merged. Extractor: PR #58 (W-VOID-ANCHOR-EXTRACT 7/7, RED-falsified; SC patch independently verified: 65 anchors, instances unchanged 3225). bim-ootb: PR #1095 (W-E2E-VOID-ANCHOR 19/19, RED-first baseline committed; **reach 9/74 → 74/74**, rider dx == host delta exactly, filling mesh moved rigidly; guardrail proven surface-by-surface: visible 3225=3225, Outliner 3342/3418 identical, pick rays hit-for-hit identical through 8 anchor meshes, gmAudit/§SAVE_BASELINE/§XEDGE-ALL identical; one honest non-masked count: commitSeedGroup ops=3290, anchors named by §ANCHOR lines; CACHE_VERSION v39→v40) |
| 5 | O3 | ⛔ ARCH CALL (b): the descoped 3-surface Outliner unification — ARC tree + STR Walker tab still separate on main | `RESUME_MODELLER_UX_OUTLINER_PILL.md` + LOD400 §NIGHT 3 | re-scope verdict recorded (still wanted? safe incremental path?) | ✅ CALL MADE 2026-07-30 — unify INCREMENTALLY, 6 slices via the proven §ONE-DISC-TAB wrap, recorded in `RESUME_MODELLER_UX_OUTLINER_PILL.md`; slices 1-2 buildable now, no user decision load-bearing |
| 6 | O10 | ⚠ RE-FRAMED 2026-09-24 → §STRATEGY L1-L3 (the 0 MEP is the INPUT; the gap is routing + signing). Original: §8E-3 substrate gap: the shipped "Open Terminal" resident (`Terminal_ARC.db`) is ARC-only, 0 MEP — a real user's walk renders no routed network; the witness sidesteps via `Terminal_meta.db` | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §DONE 2026-07-11 finding 1 | routed tubes render on the REAL user open path (or the gap recorded as accepted) | verified-open — RESIDENTS still serve `Terminal_ARC.db` |
| 7 | O10/O3 | grid-lock-to-ARC/STR crux — 0.104 m RMSE baseline residual on the emergent grid; prerequisite for RosettaStone-through-grid + clean fold | `RESUME_MODELLER_UX_OUTLINER_PILL.md` 🟥 | its own HEAVY investigation session, per-axis measured findings | **RE-MEASURED 2026-09-21 — bim-ootb #1753, W-ROW7-GRID-BASELINE 5/5.** The baseline is NOT stale, but the shipped measurement path UNDER-REPORTS it. On `Terminal_arcstr_proof.db` (158 columns, geometry 158/158, same metric as `witness_green_report.js:57-61`): **anchor centres → colRMS 0.0939 m; true mesh centres → 0.1039 m.** The recorded 0.104 matches the CORRECTED figure to 3 dp, not the shipped path's 0.0939 — correcting the substrate makes the residual **worse by 10.0 mm**, i.e. the anchor defect was FLATTERING it. Grid topology is unaffected (18×10 either way), so this is a residual story, not a grid-shape one. Cause: `str_walker_bridge.js:22/38/50` reads `center_x/y` = the placement ANCHOR; the offset VARIES per column (p50 19.7 mm, p90 148.1 mm, max 225.6 mm on 0.75 m columns), so it does not cancel even though the grid is derived from the same centres it measures. **Before the heavy session starts it must decide WHICH number it is chasing.** Still verified-open as a defect; the baseline question is closed |
| 8 | O10 | roof plates walked PER-ELEMENT on the measured pattern (user accepted 1.3% count err; gate = positional) — also the cadence source that tightens #7 | same 🟧 | plate-centre spacing uniformity measured; per-element pass-bar RMS sub-metre | verified-open |
| 9 | O10 | backprop APPLY: accept-gated hop-by-hop application of ORANGE suggestions (flagging shipped #647; applying not built) | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §USEFUL-DIFF 2 + `sdg_gate.js:106` | one accepted ORANGE fires one signed op, one hop, witnessed | verified-open (partially shipped) |
| 10 | O11 | Terminal open speed: staged pre-sealed rows + incremental `sealFrom` HAVE shipped since the 14 s profile — re-measure on the LIVE URL, then decide if Candidate C (batch-sign bulk classes) is still needed | `RESUME_MODELLER_TERMINAL_LOAD_LOD400.md` ⛔ signing | live `§STAT-TRACE` numbers on the real URL | re-measure — `kernel_ops.js:210/404` supersedes the old profile |
| 11 | O5 | full colour-parity: Modeller still paints the cosmetic PALETTE; real `material_rgba` RGB unused (only alpha recovered) | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | real per-element colour, before/after on Duplex + HHS glazing, witness | verified-open — `arc_editable.js:30-31` says so in its own comment |
| 12 | O1 | `rel_fills_host` missing on ALL five new residents (Clinic/Hospital/HHS/Garage/Terminal); the fresh `Clinic_extracted.db` ALSO lacks the table | LOD400 §START HERE OPEN 2 | `gen_rel_fills_host_patch.py` per building once its source IFC is locatable; guide Grid-Stretch sentence extended | ✅ **DONE 2026-09-18 — bim-ootb #1749 + #1750.** All five sources WERE locatable, each identified by the DB's own `project_metadata.source_file` rather than a filename guess. Recovered verbatim via the existing `gen_rel_fills_host_patch.py`: **HHS 218 edges / 99 rideable · Clinic 403 / 302 · Hospital 665 / 506 · Garage 220 / 36** — 943 new rideable host↔filling edges, every one matching its generator-predicted reach EXACTLY on the live scene (Duplex, for scale, is 36/38). **Terminal is deliberately NOT patched:** its source `TerminalMerged.ifc` (567 MB, identified by 5/5 GUID match) declares ZERO `IfcRelVoidsElement`/`IfcRelFillsElement` — the author never authored a void/fill chain, so the generator refused to write a file rather than invent one. That is a SOURCE DATA GAP, asserted in W-RFH-RESIDENTS F4 so nobody 'fixes' it by fabricating edges. So §DAGEVU's anchor/ride now works on **7 of 8 residents**, with the 8th explained by its own data. Witness W-RFH-RESIDENTS 15/15, RED-first |
| 13 | O14 | ~~SSAO + OutlinePass selection — blocked on vendoring EffectComposer~~ **RE-SCOPED 2026-09-30 (§ROW13-RESCOPE below): ambient occlusion = reuse the Viewer's Alt+G N8AO path; OutlinePass dropped** | `RESUME_MODELLER_COMPETITIVE_POLISH.md` §NEEDS-DESIGN 6/7 | lazy N8AO in the Modeller behind the same key + witness | verified-open, **not blocked but PARKED** (CORE BEFORE LOOKS, 2026-09-30) — see §ROW13-RESCOPE |
| 14 | O7 | per-mesh furniture orientation normalize-at-extraction (metadata lies: Dining_Chair z=0.14, FURN_DESK z=2.0) | `MODELLER_BOM_CATALOG_SPEC.md` §ALSO QUEUED | bake axis-permutation into vertices; witness tallest-axis==h | verified-open — no bake code in `extract_dagevu_catalog.py` |
| 15 | O7 | full 23,888-part library via httpvfs range-load — ⛔ BLOCKED: **where does the 220 MB `component_library.db` live (GH vs OCI)? user's call** | same §BUILD LEGS L1–L3 + §OPEN | W-LIBDB-RANGE: bytes-read ≪ 220 MB | verified-open — no `createDbWorker` anywhere in `modeller/` |
| 16 | O1 | §SEL-TINT-REFOLD: an authoritative re-fold drops the selection tint while `_selSet` still holds the mesh | LOD400 §START HERE OPEN 4 | tint survives cut/undo re-fold, witnessed | ✅ DONE 2026-07-30 (bim-ootb PR #1094, MERGED + LIVE-verified): `bonsai:refold` event + `_paintSel` repaint at the true choke point (+ shadow-flag re-apply, same root cause); witness `witness_e2e_sel_tint_refold.js` proven RED on unmodified main first, 9/9 with fix; W-E2E-CUT C6 now pixel-EXACT |
| 17 | O1 | Walk-ALL row reuses the singular tooltip | LOD400 §START HERE OPEN 3 | one string | ✅ DONE 2026-07-30 (PR #1094, LIVE-verified byte-fetch): conditional on `__ALL__` row; W-E2E-WALK-ALL A9 asserts both rendered titles |
| 18 | O1 | Terminal-scale proxy-mode downgrade silent to the user | LOD400 §START HERE OPEN 5 | toast/badge on the batch-hold fallback | ✅ DONE 2026-07-30 (PR #1094): once-per-run toast via existing `toast()`; B3 asserts n=1 where per-disc would be 4; A10 negative control 0 below threshold; walk-all suite 13/13. CACHE_VERSION v38→v39 same commit |
| 19 | O13 | `move-gizmo.png` recapture (wide shot amid close-up neighbors) — parked in the retired `GUIDE_VISUAL_QUALITY.md` lane | `RESUME_MODELLER_GUIDE_SCREENSHOT_FIX.md` §NIGHT 1 | recaptured close-up, opened + live-verified | ✅ **CLOSED 2026-09-15 — see §SWEEP** (recaptured bim-compiler #73; live bytes sha `22a794f4`, 423,928 B) |
| 20 | O13 | one live-bytes sweep: guide screenshots + claims vs the LIVE site (all captures were localhost) | master §KNOWN TRAPS | content-hash/curl pass against live gh-pages | ✅ DONE 2026-07-30: `§GUIDE-LIVE-SWEEP imgs=33 bad=0` + `§GUIDE-LIVE-HASH checked=33 mismatch=0` — every live guide image byte-identical to origin/master; live page carries the new wall section (3 hits) |
| 21 | O1/O7 | multi-part window sibling-clustering as a BOM — creates NEW relations (an authoring act, not recovery) | LOD400 §NEW ARCHITECTURE QUESTION | design call | ⛔ BLOCKED: user's design call, unscoped |
| 22 | O9 | gate residuals: one-click revert of a RED · UBBL named checks · rtree prune at Terminal scale | `RESUME_MODELLER_CONFORMITY_GATE.md` §NEXT | each its own witness | verified-open (door-crush + abuts-realign + Save-gating SHIPPED — see stale-claims) |
| 23 | O10 | W-DW-DENSITY-TE D3 density drift (ELEC 94.3 / FP 92.0 / ACMV 94.8 vs ≥99%) — find what shifted, decide the band | `RESUME_GRAPH_MODELLER_INTEGRATION.md` §RESOLVED note | re-run + named cause | ✅ **the named D3 drift is FIXED — see §SWEEP** (D3 ENVELOPE 100% on all four discs). Row re-pointed at the live finding the witness still prints: ELEC over-count 1754 vs oracle 833 = 2.11× **→ 2026-09-30: stale (legacy walk); production measured-band walk 0.91–1.05×, per-class D4 green; the witness's one open RED is D4c (run classes as fixtures, ⛔ red1) — §SESSION 2026-09-30** |
| 24 | O5 | `smoke_arc_only.js` SampleCastle iteration produced no output/screenshot — flagged, never chased | `MODELLER_RENDER_MATERIAL_PARITY.md` §Still-open | root-caused or cleared | verified-open (flag only) |
| 25 | O14 | PBR texture maps (biggest lift) · per-instance hide + full virtualization · BCF IMPORT (export MVP shipped #620) | `RESUME_MODELLER_COMPETITIVE_POLISH.md` items 9, §DECISIONS 2, §COMPETITIVE | — | verified-open (deferred by design, in this order) |
| 26 | O4 | solid-scale B-rep (occt `Copy=true` recompile or shape-lifecycle rework) | `RESUME_MODELLER_POLISH.md` 3b | — | ⛔ user-gated deferred ("only if authored-wall scaling becomes a real need") |
| 27 | O14 | accept an EXTERNAL (FreeCAD/neutral) IFC → snap to substrate → walkers complete it | `prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md` §4 | — | ⛔ BLOCKED: future feature, user greenlight |
| 28 | O15 | render-layer tilt gap: **293** tilted elements in the shipped `SampleCastle_ARC.db` (post-embed-8) measured rendering with IDENTITY transforms live 2026-07-10 — yet `§ARC-3AXIS` code exists on main (`arc_editable.js:231` passes rotX/rotY, `bonsai_library.js:78` applies the Euler); the branch is not firing on this data and nobody knows why | `GRID_ROTATION_GUARD.md` §5 | re-measure fids 933/1291/2514 on today's main; if still identity, trace why the tilt branch never fires; witness vs analytic 3-axis AABB | ✅ **DOES NOT REPRODUCE — CLOSED 2026-09-18, see §SWEEP.** W-ARC-3AXIS on all 293: seeded 293, genuinely rotated 230, **0 dropped**, against a 2,354-element control. The 2026-07-10 finding predates §GEO-SERVED (#1090), when the Modeller still drew boxes. Guarded by W-ARC-3AXIS (bim-ootb #1738) |
| 29 | O15 | ⛔ `CONSTRUCTION_GRID_BOM_DUAL_MODEL.md`: grid ⊗ BOM as ONE authoring substrate — spec-only, 3-stage build plan + 5 witnesses, 0 built (except W-TYPICAL-N 26/26 which already exists via `bom_extract`) | that file §STATUS/NEXT | — | ⛔ BLOCKED: user — is this still the intended architecture? (Watchdog-flagged 2026-07-30) |
| 30 | O15 | `WALL_HEIGHT_SCALE` cascade hardcodes `axis:'y'` as vertical (Y-up assumption, wrong for the Z-up Modeller) — dead code today (`isRoof` always false) but armed the day roof/ifcClass support arrives | `GRID_ROTATION_GUARD.md` §8 note | own design pass when roofs become grid-governed | deferred — documented in-code, in-file, and here |
| 32 | O1 | `witness_e2e_delete` D4 is RED on unmodified bim-ootb main — found (not caused) by the rows-16-18 session, diagnosed pre-existing, left untouched | rows-16-18 report 2026-07-30 (PR #1094 findings) | root-cause + fix or re-point the witness, RED-first discipline | ✅ **CLOSED — see §SWEEP.** bim-ootb #1704 (2026-09-10) routed soft-delete through the history tree; W-E2E-DELETE re-run 8 PASS / 0 FAIL, D4 green |
| 33 | O2 | **empty-slab refusal (Watchdog directive):** an empty layer slab must be a REFUSAL, not an announced row. Extractor: per-layer assertion `face_count > 0` in `compile_layer_geometry()`/witness — any empty slab ⇒ loud refuse (element stays gated RED), never ship partial; then re-slice the 2 affected 7-layer walls — root-cause first: the shipped diagnosis says the authored body spans 0.493 m of the 0.550 m set (§LAYER-PARTIAL, "layers belong to the neighbour wall"), the Watchdog hypothesizes opening-boolean-cut leaves last slices outside remaining material — MEASURE which is true on `2O2Fr$t4X7Zf8NOew3FNbT` before fixing; if the source genuinely doesn't author those layers' material there, the refusal stands and the wall is honestly RED until resolved | Watchdog live-query 2026-07-30 + `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §ROW33-EMPTY-SLAB-REFUSAL | witness gains per-row `face_count>0`; the 2 walls either 7 real slabs or loud RED; falsify by re-introducing an empty row | ✅ DONE 2026-07-30 (extractor half; W-LOD400-ENVELOPE **16/16**, RED-first: pre-fix code fails exactly the 4 new checks): root cause MEASURED — the Watchdog's opening-cut hypothesis is **FALSE** (both walls carry ZERO openings; an authored `IfcPolygonalBoundedHalfSpace` clip at the layer-4/5 boundary trims the neighbour-side stud+plasterboard — Revit unit-demising, material genuinely absent) → refusal stands per the directive; empty slab now raises `LayerRefusal`, `verify_layer_geometry` refuses `face_count<=0` rows, Duplex gate honestly RED 2/80 exit 1 BY DESIGN (like sporenkap — do not soften). Residents half ✅ SHIPPED same day (bim-ootb PR #1099): live `Duplex_geo.db` partial ship withdrawn — trimmed hashes reverted to original envelopes, geoV 4→5, sw v41→v42, W-E2E-LAYERS-RESIDENTS **8/8 vs LIVE** RED-first; the live Modeller refuses both walls loudly (`§LAYER-ENVELOPE-REFUSE` ×2, ops 196→194, hardfail 0/194). FULLY DONE**⚖ EXCEPTION RULING 2026-07-31 (user + Watchdog, supersedes the refusal end-state):** an honest whole-layer subset IS LOD400 ("legit material part of the wall… not a blocky fall back") — kept `face_count>0` per row, DROPPED count==layer_count; the two walls came BACK as 5 real slabs (bim-compiler #62: gate GREEN 0/80, W-LOD400-ENVELOPE 15/15 RED-first; bim-ootb #1102: geo v6, 196 meshes refused=0, W-E2E-LAYERS-RESIDENTS 8/8 vs LIVE). See §ROW33-EXCEPTION |
| 34 | O1/O8 | **anchor export/save leak — the guardrail's unchecked surface (Watchdog directive):** anchors are proven invisible to render/Outliner/picks/audits, but NOTHING checked whether the 65 phantom ops leave in an EXPORT — `bonsai_ifc.js` IFC export and `sdg_save.js`/`saveModelDb` physical snapshot both fold from the op-log where `commitSeedGroup ops=3290` includes them | Watchdog 2026-07-30; guardrail spec in `RESUME_MODELLER_LOD400_REAL_GEOMETRY.md` §START HERE OPEN 1 (✅ APPROVED block — "every count" includes exports) | witness: IFC export + Save snapshot with anchors present are element-identical to pre-anchor baseline (or anchors explicitly excluded + §ANCHOR-tagged in both paths); RED-first against current main | ✅ DONE (witness) 2026-09-27 — IFC half already closed by #1747 (E4 ANCHORS-OUT); Save half proven by bim-ootb #1787 W-E2E-ANCHOR-SAVE-ROUNDTRIP 6/6 (SampleCastle save→re-open: 65 anchors stay invisible, visible 3225 / gate 3225 / IFC 3225+65 identical, verify=true; falsify one stripped flag → 64/3226/verify=false). No leak. See LOD400 file §ROW34-ANCHOR-SAVE |
| 31 | O15 | oblique (non-orthogonal) grids — the scale-hardening lane's one genuinely open question; a NEW feature never requested | `GRID_ROTATED_SCALE_HARDENING.md` §3 | — | ⛔ BLOCKED: user interest; do not build unasked |
| 35 | O15 | **drag handle for walked fixtures** (red1 2026-09-30, Q4: "keep the POC simple"; NOT built now). A walked fixture (instanced) is identify-only: click → `walked PLB · FlowTerminal … (generated — identify only)`, Move stays disabled (measured, W-FIRST-STEPS-MEP step 5), Drag Item refuses walked items, and a gridline drag moves walls + hosted riders only (guide: "fixtures stay put"). So the MEP re-route (`W-MEP-REROUTE`, 524 ms on live Duplex) can only be driven by the engine's signed GEOM_MOVE today. | move a walked fixture by hand → the network re-routes; `W-FIRST-STEPS-MEP` step 5 driven by the gesture instead of the engine commit | `TM_4D5D_VARIANCE_LANE.md` §S9, First Steps Part 3 | ⬜ not built |
| 36 | O1 | **§GEOM-KEEP-RG — a Walk erased the building (FIXED 2026-09-30, bim-ootb #1801):** after `Walk PLB` the Duplex ARC meshes went 196 → 27 (214 × `§BONSAI insert fold fail … LOD400-REFUSE realGeomHash … not registered`). Root cause `bonsai_library.js` `ensureMesh` lazy catalog load did `this._geom = j`, wiping the `rg:` real meshes registered at seed; the next refold refused every ARC insert. Found only because the first-steps screenshot showed an empty grid. | `W-FIRST-STEPS-MEP` step 3/7 assert `buildingMeshes >= 196` after the walk and after undoing it | `witness_first_steps_mep.js` | ✅ fixed + witnessed (local 8/8) |
| 37 | O1 | x-ray state after a walk: the walk's x-ray reveal restores to SOLID (174 solid meshes) and the pipes then sit inside the opaque building; even the X-ray pill's glass still takes the click, so a pipe cannot be clicked/selected by hand (measured: 0 unobstructed points, sweep meshes did not select with the ARC hidden). After undoing the walk the x-ray was seen ON (196 glass) in one run — re-measure. | click a pipe → selected; x-ray state restored after undo | W-FIRST-STEPS-MEP step 4 note | ⬜ open |
| 38 | O15 | **§GRID-SPAN-GATE — a grid drag must not stretch a structural bay past its span limit** (red1 2026-10-02: "columns have to bear load as industry stds. We cannot drag long leaving columns stretched out"; "those coloring is brilliant"; "display ie 'limit for this column. Add one more?' when user hovers over the red"). EXISTS, unwired: `str_walker.js:192-215` `SW_SPAN_RULES` (Eurocode-cited preliminary rules — STEEL max 18 m, depth≈L/20, δ≤L/360; RC max 12 m, depth≈L/12, δ≤L/250) + `swCheckGirder` → GREEN/ORANGE/RED, used today only by the STR walker tab (`str_walker_bridge.js:331`). `bonsai_gridmove.js`/`sdg_gate.js` have NO span check. BUILD: (1) during a gridline drag, colour every bay the drag widens/narrows with `swCheckGirder` live (no new thresholds — the table is the only source; material from the building's measured beam/column class, else ⛔ refuse to colour rather than guess); (2) ORANGE hover = the required preliminary depth (span/ratio); (3) RED hover = "Limit for this column span (<max> m, <material>). Add one more?" → one click inserts a column line at the bay midpoint, columns COPIED from the building's own existing column type/section (never invented); cancel keeps the drag refused at the limit; (4) every message carries "preliminary — the structural engineer confirms". Applies only where the grid comes from columns (column-framed); wall-bearing bays use no beam rule. | `str_walker.js` §REGULATORY HANDLER; `GRID_KINEMATICS_SANDBOX_PROOF.md` | witness: drag a Garage (real IfcColumn 140 / IfcBeam 195 in its ARC) gridline across the RC/steel limit → `§GRID-SPAN` lines show GREEN→ORANGE→RED at the exact table spans; hover text carries the limit; "Add one more" adds N columns == lines crossed, each a copy of the measured type, bay spans halve, colour returns GREEN; undo = one step (§ONE-GESTURE-ONE-UNDO); RED-first: today's main colours nothing | verified-open — queued as item 1b |

### STALE-CLAIMS — verified SHIPPED on origin/main; do NOT re-open (grep-verified 2026-07-30)
- **O12 zoom-to-selection**: SHIPPED — `§ZOOM-SEL` (#711), `modeller.html:1057`, `witness_e2e_zoom_to_selection.js` exists. The triage's "small, well-specified" read was stale.
- **O8 Save = CompleteIt-shaped**: SHIPPED — `sdg_save.js` + `modeller.html:2539-2690` (auto-heal, RED block, heal-induced clarity, 'Clean, saving…'), witnesses `witness_e2e_save.js`/`witness_e2e_save_blocked_focus.js`. DocAction question ANSWERED in code: Save does NOT call `erp/ad_docfsm.js` (mirrors its Error/Clean contract only) — `sdg_save.js:8`.
- **O11 op-log autosave quota**: SHIPPED — IndexedDB fallback (`§AUTOSAVE_FIX`, `bonsai_oplog.js:25-26`, `witness_e2e_autosave_idb_fallback.js`).
- **door width/crush RED**: SHIPPED — `sdg_gate.js:99` + witness A7 (the GRAPH file's "still missing" is stale).
- **backprop first slice**: abuts-realign ORANGE flags SHIPPED (#647) — only the accept-gated APPLY remains (row 9).
- **World History wiring**: SHIPPED — mount at `modeller.html:221` + `witness_modeller_worldhist_pill.js`.
- **disc-walker envelope-bound + yaw render**: SHIPPED — envelope-bound cells + `§DW-CAP` (`disc_walker.js:644-673`), `§DW-ROT-UNIT` yaw fix (`modeller.html:4053-4058`); guide Walk-ALL section re-landed (`docs/ModellerGuide.md:493`).
- **O6 anchor semantics**: DONE (PR #613, W-ANCHOR-SWEEP 15/15). Its parked "viewer can't stream a raw modeller extraction (`elements_meta.building` missing)" note: fixed at source, bim-compiler `dcd5260e9`/`74e0e3551` (§KUL001).
- **§LODHELL-FIX-2 dead no-boolean tier**: DELETED (`extractIFCtoDB.py:1179` records the deletion).
- **O4 direct-manipulation spine + H1 top-view Z-drag + polish batch**: all shipped (PRs #423-#631 arc) — the 2026-07-07 correction in `MODELLER_DIRECT_MANIPULATION.md` already said so; re-confirmed.
- **Resident roster changed under the triage**: RESIDENTS is now EIGHT per-building split entries (SH/DX/SC/HHS/Clinic/Hospital/Garage/Terminal, each `geoDb` on object storage, `str_walker_outliner.js:51-58`) — any older "4 residents"/"mesh.db" wording in the 15 files is historical.

**O15 stale-claims (grid family, verified 2026-07-30 — grep/sqlite against origin/main, do NOT re-open):**
- **Smart element scope**: SHIPPED — `_STRUCTURAL_CLASSES`/`_localityRadius` (`bonsai_gridmove.js:64/109`) + `witness_gridmove_smart_scope.js` on main. The triage's "harvest — 10 open" was stale; the file's own §4 records DONE 2026-07-09.
- **Green/orange pre-drag preview**: SHIPPED — `toggleOverride`/`applyOverrides` in `bonsai_gridmove.js` + `witness_e2e_grid_greenorange.js`.
- **Clear-state-leak rounds 1+2**: SHIPPED — all three `onClear()` wires live in `bClear.onclick` (`modeller.html:516`) + `witness_grid_clear_leak_round2.js`. The round-2 file's "PR TBD" resolved: it landed. Its cross_edges anchor-correction fork was ALSO resolved separately — PR #650 (real per-element AABB).
- **Tilt-guard + axis-scope**: MERGED as PR #722 (squash `3252d50`) — `_hasTilt`/`tiltXRad` + the x/y/z skip are on main, `witness_grid_tilt_guard.js` shipped, `W-GRID-SCALE-YAW-HARDENING` 21/21. The file's own §6-§9 "not merged, per instruction" is stale (it predated the push-pause lift). The remote branch `fix/grid-tilt-guard` is now redundant.
- **Kinematics sandbox**: all four tiers + the §3 worker-fold gap DONE 2026-07-09 per its own §5; `witness_grid_rotation_guard.js`/kinematics witnesses on main.
- **Scale hardening**: MERGED PR #721; only its §3 (oblique grids, row 31) stays open.

Rules that produced this list (keep for the next harvest):
- **Verbatim, with its home.** Never paraphrase an open item away from its file/section pointer.
- **Verify before listing.** A file claiming something is open may be stale — check the shipped code
  first (that mistake has already been made here: a 21-commit-stale checkout made shipped code read as
  missing). Mark each row `verified-open` or `stale-claim`.
- **Contradictions are findings.** Where two files disagree, list both and say which the code supports.
- **Live-vs-local is a first-class check** for anything user-visible — see §PRIME LESSON.
- **WORK-TO-ZERO** (`CLAUDE.md`): work top-to-bottom, never stop to report "parked", never loop on a
  blocked item — mark it `⛔` with the ONE question and move to the next.

### §ROW13-RESCOPE — 2026-09-30 (red1: "review whether EffectsComposer is deprecated … alt-g … good enough")
Measured on bim-ootb `origin/main` @ `3f962fb7`:
- **The "not vendored" blocker is stale.** `viewer/lib/` already ships `EffectComposer.js`, `SSAOPass.js`, `OutlinePass.js`
  (three's own, r184 headers) and `postprocessing-n8ao.bundle.js` (pmndrs composer + N8AO). The three core is **r186**
  (`viewer/lib/three.core.min.js` `REVISION="186"`). `modeller.html:434` and `:1078` still say "not in the vendored build".
- **EffectComposer is not deprecated for WebGL.** The r186 deprecation is WebGPU-only: `PostProcessing` → `RenderPipeline`
  (`three.webgpu.min.js` warns: *"PostProcessing" has been renamed to "RenderPipeline"*). Viewer and Modeller both draw with
  `WebGLRenderer`.
- **Use the Viewer's proven path, not SSAOPass.** `viewer/effects_gi_poc.js` (Alt+G) builds the pmndrs composer + N8AO
  **lazily on first press** (§GI_POC_LAZY — no GPU cost for sessions that never press it), skips mobile, and stays live
  while the camera moves. Alt+S is the slow still-only path. Its AO tuning history (§PHOTO_AO_DARK, radius/intensity) applies.
- **OutlinePass: dropped.** The Modeller's EdgesGeometry selection outline (`modeller.html:1078`) already does the job
  without a composer.
**Slice:** lazy-load the same bundle in the Modeller behind the same key; fix the two stale comments. **Witness:** `§` line
with composer built=false before the first press / true after, AO pass present, and frame time on Terminal (35,552
elements) before vs after — RED-first = the key does nothing on today's main. **Open, unmeasured:** N8AO frame cost at
Terminal scale; whether the Viewer's AO numbers suit the Modeller's lighting.

## 🚧 KNOWN TRAPS — do not rediscover these
- **`console.warn` is invisible** in DevTools' default filter. Failure paths use `console.error`.
- **A 12-triangle mesh is not proof of a fake box.** A plain extruded rectangle IS 12 triangles. But a
  fake box CANNOT carry a door/window cut — that is the real discriminator.
- **Both a fake proxy box and a plain wall's real shape are 12 triangles**, so the 2026-07-02 fake-box
  fix looked dramatic on SampleCastle and invisible on Duplex. Neither observation is a regression.
- **Guide screenshots were taken on localhost.** They are not evidence about the live site.
- **`disc_walker.dwInit` defaults to `terminal_rules.db`** — a residential caller must pass
  `duplex_rules.db` (Walker Doctrine, `CLAUDE.md`).
- **Never edit the shared `~/bim-ootb` checkout** — a PreToolUse hook blocks it. Work in a `/tmp/wt-*`
  worktree, and reuse an existing one (`git worktree list`) before creating another.
- **DB changes ship as a SQL patch + self-heal loader, never a committed binary** (`CLAUDE.md`).


## §IFC-EXPORT-DEPTH — SPEC, 2026-09-26. Priority 3 (builds on §IFC-EXPORT-SEED below).
Today the export carries shapes + classes only (status reads `walls=0` for an opened building, `modeller.html:~3042`).
A user hands the IFC to the next tool, so depth decides whether our output is usable. Add, each from data we already hold:
(1) IfcBuildingStorey containment (storey names on every seeded/walked element); (2) IfcMaterial from `material_rgba`/material
names (the §COLOR-PARITY source); (3) Psets — at minimum the element's extracted properties and, for walked MEP, the signed
provenance (`_dw.prov`, rule id, pipe product); (4) opening/void relations for cut walls. **Witness:** round-trip — export
Duplex → re-open with the same IFC extractor → per-class counts, storey assignment, material and Pset presence equal to the
source (numbers per class, base = today's export). Validate against IfcOpenShell (the user's fork is prior art).

## ▶ §IFC-EXPORT-SEED — SPEC for row 36 (2026-09-18). Written before any code.

**MEASURED DEFECT, not inferred.** Open Duplex — 196 elements on screen — then call `Bonsai.ifc.build()`:

```
§OPLOG      {"GEOM_INSERT":196}  total=196
§ON-SCREEN  meshes=196
§EXPORTED   {"walls":0,"openings":0,"rels":0,"arrays":0,"bytes":592}
```

**592 bytes. Zero products.** A user who opens a resident and picks Export ▸ IFC gets an empty IFC4 file
with a header and nothing else. `bonsai_ifc.js build()` branches on exactly three op types —
`GEOM_EXTRUDE_POLY` (:112), `GEOM_CUT` (:123), `GEOM_ARRAY` (:142) — and **every ARC-seeded element is a
`GEOM_INSERT`** (`arc_editable.js:342`). The three handled types match zero ops in a real resident.

### What to build
Handle `GEOM_INSERT` in `build()`. Per element, emit one IFC product typed from `params.ifc_class`.

**Geometry: reuse the RENDERER'S OWN vertices — do not re-derive the transform.** This is the direct
lesson of §XEDGE-GEOWIRE, learned today at the cost of 843 wrong edges: `cross_edges.js` re-implemented
"world = centre + R·vert", called it "the same final numbers, fewer steps", and was wrong for 798 of 934
elements. The folded scene meshes already carry **world-space positions baked into the geometry** —
measured: every mesh's `matrixWorld` is identity and `geometry.boundingBox` equals
`Box3.setFromObject`, max delta `0.000e+0` over 3,290 meshes. So the export reads
`mesh.geometry.attributes.position` for the fid and emits those coordinates verbatim. Byte-parity with
what the user sees is then structural, not something a witness has to chase.

**Encoding:** `IfcTriangulatedFaceSet` over an `IfcCartesianPointList3D` — both confirmed present in the
vendored web-ifc build, along with every class below. This is IFC4's native triangle-mesh form; no
tessellation, no approximation.

**Class map** (`params.ifc_class` → entity), extracted from the resident, never invented. Duplex's real
census: `IfcWallStandardCase` 56 · `IfcFurnishingElement` 61 · `IfcSlab` 21 · `IfcWindow` 24 · `IfcDoor`
14 · `IfcCovering` 13 · `IfcRailing` 4 · `IfcStairFlight` 2 · `IfcWall` 1. An unmapped class falls to
`IfcBuildingElementProxy` — the honest IFC answer for "a real product whose specific type this exporter
does not model", and it is COUNTED and `§`-logged, never silent.

### Binding constraints
1. **Anchors are excluded.** `params.anchorOnly` elements are invisible ride anchors; the user's binding
   condition is that they stay out of EVERY count, pick, audit — and an export is an audit. Duplex has 0,
   SampleCastle has 65, so this is not theoretical. Skipped and counted separately.
2. **No silent substitution.** An element whose mesh cannot be resolved is NOT quietly emitted as a
   bounding box. It is counted and named in the `§IFC-SEED` line. A box standing in for authored geometry
   is the §PRIME LESSON fault this file opens with.
3. **The three existing op types keep working byte-identically.** `GEOM_EXTRUDE_POLY`/`GEOM_CUT`/
   `GEOM_ARRAY` and their witness (`W-IFC-ROUNDTRIP` via `reimport()`) are untouched.

### The witness — W-IFC-EXPORT-SEED
Claims, each naming the issue it proves:
- **E1 NOT-EMPTY** — exporting Duplex yields > 0 products. RED today at exactly 0/592 bytes.
- **E2 COUNT-EXACT** — products == non-anchor `GEOM_INSERT` ops. Not "> 0": the exact number, so a
  partial export cannot pass.
- **E3 REAL-GEOMETRY** — re-import the emitted bytes and assert the triangle count of a named element
  matches the scene mesh's. Proves shapes, not just product rows.
- **E4 ANCHORS-EXCLUDED** — on SampleCastle (65 anchors), products == ops − 65.
- **E5 NO-BOX-SUBSTITUTION** — the `§IFC-SEED` line's fallback count is 0 on Duplex (196/196 resolve), and
  any non-zero value is reported, never hidden.

### Out of scope, stated so it is not mistaken for done
Materials/colours, property sets, spatial hierarchy (`IfcRelContainedInSpatialStructure`), and re-cutting
openings as `IfcOpeningElement` against seeded hosts. This slice makes the export carry the building's
real shape; it does not make it a fully-furnished IFC. Row 36 stays open until that is stated in the row.

## ▶ §GRID-SPAN-GATE — SPEC 2026-10-02 (row 38, queue item 1b). Written before any code.
**MEASURED before building (HospitalGarage, real Open, headless; log `§STRWALK-INIT` / `swbTabData`):**
(a) **The authoring grid is NOT column-derived on the real Open path.** After Open, `Bonsai.grid` is still the default
A–D × 1–3 (`xs=[0,4,8,12]`) — nowhere near the building (columns sit at x≈135, y≈171). The STR walker measured a column-framed
lattice (`grid=17×29`, rot −2.000°, 140 columns, 228 girders) but nothing hands it to `Bonsai.grid`. A span gate on today's grid
would colour nothing real. → Build step 0 below wires it, honestly (only when the walker is column-framed AND the grid is still
the untouched default; a user-authored grid is never replaced).
(b) Material is not in `elements_meta.material_name` (NULL for all 335 STR column/beam rows); it IS in `element_name`
("Concrete-Square-Column:24 x 24", "Precast-Rectangular Beam:15 x 28 …") → **RC**. Read by keyword over the building's own
IfcColumn/IfcBeam names (`concrete|precast|reinforced` → RC; `steel|wide flange|W-shape|HSS` → STEEL); mixed or neither →
`§GRID-SPAN material=unknown refused`, no colour.
(c) The scene's 140 IfcColumn are the walker's skeleton (`provenance derived:grid`, bbox boxes). The building's real column mesh
is `element_instances.geometry_hash` of the source IfcColumn → the geo db (`resolveHashes`). "Add one more" copies THAT (same
hash), never a box; no resolvable hash → refuse, reason named.
(d) Garage girder spans (walker): 5.486 m ×74, 16.764 m ×83 … Table: RC depthRatio 12, max 12 m.

**Definitions (one source each, nothing invented).**
- **Bay** = a walker girder piece (its two end datums). Span = |u(to) − u(from)| in the LATTICE frame (θ-aware, same frame
  `swReWalk` uses). Signal = `swCheckGirder(span, {material, proposedDepth})`, `proposedDepth` = the building's MEASURED median
  beam depth (`_state.section.depth`, 0.535 m on Garage). So **ORANGE** ⇔ span > depth × depthRatio (0.535×12 = 6.42 m),
  **RED** ⇔ span > `SW_SPAN_RULES[mat].maxBeamSpan` (12 m). Both thresholds are the table × a measured number.
- **Fold, not memory.** Gate spans = pristine walker base (`_state.base0`) + the ACTIVE op-log (GEOM_GRID_MOVE deltas, and
  `params.spanSplit` columns, in order, ≤ cursor) — so Ctrl+Z / Ctrl+Y / scrub revert spans deterministically (the walker's own
  `_state.base` is imperative and is NOT undone; the gate never reads it).
- **Add one more** = one `GEOM_INSERT` per girder piece of the over-limit bay, at the bay midpoint on that girder's datum, copy of
  the girder's FROM column (`realGeomHash`, measured bbox, yaw, colour) with `params.spanSplit = {axis, index, pos, girder, srcGuid}`.
  "Lines crossed" = the perpendicular gridlines carrying a girder in that bay = number of pieces split = columns added. The new
  line is folded into `Bonsai.grid` (`foldFromOplog` handles `spanSplit`), so the grid shows it and `gx/gy` indices stay right.
- **Gesture.** Release on RED does NOT commit; it opens the prompt. **Add one more** → ONE `commitGesture` =
  [GEOM_GRID_MOVE + riders (as today) + the added GEOM_INSERTs] → one Ctrl+Z. **Cancel** → the drag commits at the clamped delta
  (widest affected bay = max span). Wall-bearing walker state → gate off (`§GRID-SPAN system=wall-bearing skip`).
- Every message carries "preliminary — the structural engineer confirms".

**Witness W-GRID-SPAN-GATE** (`modeller/tests/witness_grid_span_gate.js`, real Open, real mouse, one `§GRID-SPAN` line per step).
RED-first: on main the gate does not exist → G1 (grid column-derived) and every colour step FAIL. Falsifier: `GSG_BREAK=1`
(page flag `__gsgBreakRule`, rule table lookup returns an unbounded limit) must turn the witness RED.
