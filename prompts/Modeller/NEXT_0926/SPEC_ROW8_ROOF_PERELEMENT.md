# ⚠ DO NOT REMOVE — SPEC ROW 8: roof plates walked PER-ELEMENT on the measured pattern (O10)
SCOPE: bim-ootb `modeller/disc_walker.js` `placeMeasured()` only (the §NOSPACES measured-band placer the Outliner
"roof" row reaches via `_discWalkOne → dwWalk(disc,{schedule:true})`). Walk ALL Services keeps skipping roof/STR (L7).
No rules-DB change, no `.db` binary, no viewer/ change. **Read the log after every run** — the `§ROOF-PATTERN*` and
`§ROW8-*` lines are the evidence; a green exit code is not.
Written 2026-09-26 before any code. Every number below was measured on bim-ootb origin/main `2b570a26` (#1777) with the
gitignored `Terminal_plates_proof.db` / `Terminal_ARC.db` (same frame: Δ=0.0 over all 33,324 guids).

## 1. MEASURED STATE (the shipped walk, `dwWalk('roof', Terminal_ARC.db, {schedule:true})`, Node, terminal_rules.db)
Log: session scratchpad `wit/measure_roof_base.log` (script `measure_roof.js`).
```
§DW §NOSPACES-TOPUP roof/IfcPlate band=[18.30,27.03] +10483 measured-cadence grid positions (ARC cells 101 < count 31344)
§DW §DW-CAP roof/IfcPlate ... placed=10584 of 31344 (envelope is the ceiling)
§ROW8-POSERR Terminal real=33324 walked=10584 count_err=-68.24% rms=2.627 p50=2.409 p95=4.168 max=4.667 within1m=20.5%
§ROW8-POSERR-SPLIT Terminal dz_rms=2.610 dz_p95=4.165 dxy_rms=0.296 dxy_p95=0.576
§ROW8-CADENCE Terminal/real   n=33324 nn_median=0.150 p05=0.150 p95=0.150 sd=0.003 cv=0.021
§ROW8-CADENCE Terminal/walked n=10584 nn_median=0.450 p05=0.450 p95=0.450 sd=0.027 cv=0.062
§ROW8-POSERR Clinic real=172 walked=331 count_err=92.44% rms=638.003 p50=15.605 within1m=0.0%
§ROW8-WALK HHS placed=0  (§NOSPACES-NOCELLS — honest 0 in Node; the browser run of 2026-09-24 measured 42,960)
```
**Verdict: NOT per-element. It is a bulk area fill** — 101 quantised ARC cells + a uniform top-up grid at the row's
cadence, all at the flat band-mid z (22.67 m) under a canopy that curves 18.36→27.09 m. 2.6 m RMS, almost all vertical.
Count is −68 % (envelope cap), not the accepted 1.3 %. On Clinic it places 331 plates where the building has 172
0.03 m-thick vertical glazing panels — a fabricated array (the row's own fallback rule forbids exactly this).

**The real pattern (one-shot the row asked for, `wit/lattice_roof.log`, script `lattice_roof.js`):**
- unit: `0.50×0.15×0.11` modal share **96.6 %** (32,203/33,324); rotation 0 on every plate.
- x is a clean **0.495 m lattice** (191 unique x; modal Δx 0.495 ×72) in a few phase patches (0.175/0.180/0.125/0.130…).
- along y the plates are **contiguous on the curved surface**: 3-D NN spacing 0.150 m, cv 0.021 (projected Δy shrinks
  with slope, so y is not a planar lattice: 583 unique y).
- the surface is z=f(x,y), NOT z=f(x): 1-D x-strip profile residual **1.158 m** (the simplification
  `swDeriveTessellation` makes and documents); quadric 1.288 m; 1 m height-field p95 0.070 m but RMS 0.550 / max 5.44 m
  because some cells hold two canopy layers. **No compact measured surface exists in the substrate other than the
  plate array itself** (the two `IfcRoof` rows sit at z 4.65 — a different roof; the band's non-generatable ARC is
  the mezzanine: 68 walls, 19 proxies, 9 doors).
- cadence tie-in to row 7: 0.495 × 12 = 5.94 ≈ 6 m bay, 0.15 × 53 = 7.95 ≈ 8 m bay (the STR grid is 6×8).

**Other terminal_rules residents:** HHS 629 / Clinic 172 / Hospital 2,211 `IfcPlate` are glazing/curtain panels
(HHS 1.99×0.03×2.84, Hospital 0.19×0.97×1.86; NN cv 0.32 / 1.25), not a roof tessellation. Terminal is the only
resident carrying the pattern the roof rule was mined from.

**Also measured:** `arc_editable.seedArc` seeds `discipline='ARC'`, which includes all 33,324 plates — the real roof is
already on screen verbatim when Terminal opens; the roof walk is the RosettaStone/regeneration leg, not the only source.

## 2. THE SMALLEST CHANGE — §ROOF-PATTERN: a tessellating class walks per element on the building's own measured array
Precedent this follows: `swDeriveTessellation(plates)` / `swbCanopyOps(plates)` already take the real plate cloud as the
measured pattern; red1 2026-06-27 (row 8) "walk them PER-ELEMENT on the measured pattern … gate is positional"; red1
2026-07-01 (TERMINAL_LOAD_LOD400) "use the exact real per-plate positions we already have … don't resurrect generative
estimation". PRIME RULE: copy patterns you find.

In `placeMeasured`, per `rule_placement` row, BEFORE the ARC-cell/top-up fill:
1. **Tessellating test (derived from the row's own measured numbers — no class whitelist):**
   `fill = bbox_dx·bbox_dy·n_measured / src_storey_area_m2`. roof/IfcPlate = 0.898. A row with `fill ≥ 0.5` is a class
   that tiles a surface contiguously; its elements ARE the only measured description of that surface. Every other row
   in terminal_rules (fill ≪ 0.5) and every duplex_rules row takes the existing path, byte-identical (witness R0).
2. **Measure the target's own array of that class in the site-frame band (± one unit height):** modal bbox (cm-rounded)
   share, 3-D nearest-neighbour spacing median + cv (grid-hash, O(n)), x-lattice cadence (modal Δ of unique x).
   Array gate: share ≥ 0.5 AND modal bbox within 20 % of the rule's `bbox_dx/dy/dz` AND nn median within 20 % of the
   rule's finer spacing (`min(spacing_x_m, spacing_y_m)` = 0.15) AND cv ≤ 0.10.
   Log `§ROOF-PATTERN disc/class n= unit= share= nn= cv= sx=` (this IS the row's "spacing uniformity measured").
3. **PASS → per element:** one placement per measured row at its recorded centre `(center_x, center_y, center_z)`,
   its own `bbox_x/y/z`, its own `element_instances.geometry_hash` when the substrate has one (Terminal: 18 real
   meshes, resolvable in the open building's `Terminal_geo.db` — the same registry the seed uses; the rule-binding
   hash is the fallback), `prov: 'placed:measured-pattern'`, `src: <guid>`. `z` is the centre; `_commitDiscWalk`
   stores the seat (`z − bz/2`) so the folded box centre lands on the recorded centre.
4. **FAIL → REFUSE, never the fill:** population present but not arrayed → `§ROOF-PATTERN-REFUSE … irregular/
   non-arrayed: represent as one surface, never a fake array` (the row's explicit fallback); no rows of the class in
   the band → `§ROOF-PATTERN-NOPLATES … a tessellating class has no other measured surface`. Both return 0 placements
   for that rule row and `dwWalk` reports it through the existing `§WALK-NOSPACES placed=0` → `§DISC-WALK roof REFUSE`.

Intentional behaviour change (stated, measured): HHS/Hospital/Clinic roof walks go from fabricated arrays
(42,960 / 47,526 / 331 in the 2026-09-24 browser measure) to REFUSE 0; Terminal goes 10,584 → 33,324 at RMS 0.
Not built (out of scope, recorded): Candidate C one-parent batch row for the 33k signed rows; a generative
strip-tiling reconstruction (would be a lossy re-encoding of the same cloud — a copy with extra steps).

## 3. WITNESS — `modeller/tests/witness_row8_roof_pattern.js` (W-ROW8-ROOF-PATTERN), Node, engine-level
Issue it proves/disproves: **"the roof walk is a bulk area fill (2.6 m RMS, −68 % count), not per-element on the
measured pattern; and it fabricates plate arrays on buildings that have no roof tessellation."** RED-first on
origin/main (numbers in §1), then GREEN on the fix. Same-file base/fix side by side.
- R0 TESSELLATING-ROW — exactly one rule_placement row in terminal_rules.db and zero in duplex_rules.db has fill ≥ 0.5,
  and it is roof/IfcPlate (fill logged). Proves the gate is derived, not a whitelist, and reaches no MEP row.
- R1 PATTERN-MEASURED — `§ROOF-PATTERN` on Terminal reports n=33324, share ≥ 0.9, nn 0.150 ± 0.01, cv ≤ 0.05,
  sx 0.495 ± 0.005 (the row's "spacing uniformity measured").
- R2 PER-ELEMENT-COUNT — placed == 33,324 (|err| ≤ 1.3 %, red1's ceiling). RED today 10,584.
- R3 POSITIONAL — nearest walked-to-real centre RMS ≤ 1.0 m (p95, max reported; expect 0.000). RED today 2.627.
- R4 CADENCE-PARITY — walked NN median within 5 % of real (0.150). RED today 0.450.
- R5 NO-FAKE-ARRAY — Clinic and HHS: placed 0 with `§ROOF-PATTERN-REFUSE` or `-NOPLATES`; no `§NOSPACES-TOPUP` line
  for roof. RED today (Clinic 331).
- R6 FALSIFIER — Terminal with its IfcPlate rows deleted → 0 placed, `§ROOF-PATTERN-NOPLATES`, no top-up (fabricates
  nothing).
- R7 OTHER-DISCS-UNCHANGED — ELEC/FP/ACMV/PLB `placeMeasured` placements on Terminal_ARC.db are byte-identical
  base vs fix (count + sorted (x,y,z) hash).
- INCONCLUSIVE (never PASS) when Terminal_ARC.db is missing or has 0 IfcPlate rows.
Browser leg (`witness_e2e_roof_pattern.js`, W-E2E-ROOF-PATTERN, puppeteer, protocolTimeout 1200 s — a Terminal-scale
commit blocks the page > 180 s): open the real Terminal resident, click Outliner row `[data-bnode="dw-roof"]`,
wait on `window.__dwWalks.roof` + `ModellerHistory.pending()`; assert E1 `__dwWalks.roof.length == 33324`,
E2 signed rows committed in the walk group == 33,324, E3 nearest committed-op centre (`_dw.cz`, x, y) to real RMS ≤ 1 m,
E4 no pageerror, wall time logged. This is the end of the chain.

## 4. REGRESSION RISK + the runs required (base = pristine copy of origin/main, fix = worktree)
- `placeMeasured` is shared by every terminal_rules discipline → R7 above + W-DW-DATUM, W-DW-LIVEWIRE, W-MEP-OPENPATH,
  W-DISC-DENSITY, W-E2E-WALK-ALL, W-TERMINAL-WALKALL-PERF, W-STR-CANOPY (touches nothing here, run as control),
  W-E2E-GRIDMOVE-ROOF (IfcRoof gridmove, unrelated, control). Expect base = fix on all.
- 33,324 signed rows on a Terminal roof walk (3× today's 10,584; below the 42,960/47,526 the app already did on
  HHS/Hospital, which now refuse). Measured by the browser leg; not hidden.
- Anchor-vs-centre: `element_transforms.center_*` is the placement anchor (row 7 measured 20–226 mm on columns); for
  rot-0 plates the walked box is centred on it. Sub-metre gate unaffected; recorded, not chased.
- `?v=` of `disc_walker.js` bumped in `modeller.html`; `sw.js` CACHE_VERSION bumped.

## §REVIEW 2026-09-26 (parent session) — the walk must not re-place the building's own plates
The agent's first cut returned the measured array's own rows as placements (own guid, centre, bbox) → on Terminal an exact
second copy of 33,324 plates the ARC seed has ALREADY committed (`elements_meta.discipline='ARC'` for all 33,324 — R3). RMS 0
there is identity, not generation, and it would sign 33k duplicate rows. Changed: an arrayed, present tessellation logs
`§ROOF-PATTERN-PRESENT … nothing to generate` and places 0; refusals (NOPLATES / REFUSE) unchanged. The row's real wins stand:
no more band fill (Terminal 10,584 plates at RMS 2.627 m), no more fabricated arrays (Clinic 331, Hospital 47,526, HHS).
W-ROW8-ROOF-PATTERN after review: R0 R1 R2(NO-DUPLICATE) R3(SEEDED) R5 R6 R7 — 7/0 with ROW8_BASE_HASH=26433a29.
Open (not a blocker): a roof walk on a building whose ARC lacks the plates has no measured surface to place them on → REFUSE.
Generating a roof there (lattice + height-field) is a separate, lossy build (1 m cells RMS 0.55 m) — red1's call.
