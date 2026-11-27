# ⚠ DO NOT REMOVE
SCOPE: generic rule candidates mined from ONE well-documented private project (a Revit-exported drawing set, its written specifications and design report, and the author's own IFC models), kept as a Rosetta Stone. Read the log after every run; exit code is not evidence. **Sanitized public record.** No project, client, firm, sheet, room, layer or offset of the set appears here; the private originals stay local. Every row is a candidate from ONE design until a second building tests it.

## 0. Standing rules for this lane
- **A rules engine, not custom to any design (owner 2026-11-07):** a number from the private set is an observation that tests a rule, never the rule.
- **Mine it, never ship its values (owner 2026-11-14).** Order: this set first; other buildings only once it has yielded more rules, and only where a rule bears on the Shed add-bay idea (`bay_repeat`, `modeller/bay_add.js`). Nothing here is built or handed to the Modeller lane.
- **Roles:** this lane designs and mines; the Modeller lane builds.
- **Same-source caveat:** the sheets and the author's IFC property sets come from one Revit export. A match between them is a consistency check, not independent proof.

## 1. What was analysed (2026-11-14)
| Source | Depth | Result |
|---|---|---|
| Written specifications (3 parts) and a design report (44 pp) | read in full; electrical and life-safety pages re-read in context | **Thin:** mechanical, fire and life safety, ELV chapters and three specification parts are absent from the package. No HVAC or fire-protection criteria; one ventilation figure |
| A water-feature specification and an irrigation specification (the two spec tails) | read in context | best source for piping, pump-room, electrical and buried-pipe practice |
| ~340 drawing pages (text) | machine pass, rule-like rows read by hand; 93 pages the classifier had skipped (no recognised title) read afterwards | they are real pages; ~10 more rules |
| Reinforcement sheets (beam schedule, slab and wall notes) | 22-mark schedule parsed | side bars by depth; stirrups per mark |
| The author's IFC property sets (16 structure, 142 architecture) | census + targeted reads | stairs, wall acoustic rating by type, door fire rating, and **empty reinforcement sets** |
| Drawn dimension strings in the DXFs | 5,454 raw, 1,665 distinct | EQ test, facade module arithmetic, governing-sheet note |
| Not read | image-only report pages (no OCR installed); one accessibility sheet (vector); the Revit models (closed by the POC rule) | |

## 2. Ranked rule candidates (tested first)
Counts across the private rules file: 130 rows, **33 tested** (against this design's sheets or model, with a control), 1 inconclusive, 96 stated only.
| # | Rule | Evidence | Destination | Caveat |
|---|---|---|---|---|
| 1 | **Stair:** tread is a fixed stated value (280 mm), riser derives from floor-to-floor height capped at 180 mm, treads = risers - 1 | tread 280 on 14 of 14 stair records, riser max 180.0, treads = risers - 1 on 38 of 38 flights, risers = ceil(H/180) on 11 of 14 | edit gate + builder: a stair stretch recomputes the riser, never the tread | very likely Revit's own stair calculator output: a recovered Revit rule, not an independent design rule |
| 2 | **EQ typed on a dimension is a real equal-spacing constraint** | 20 of 20 EQ runs equal vs 18 % for other multi-dimension runs (control) | add-bay and drag edits keep equal pitch; reader parses EQ | the sheet trace of Revit's equal-spacing dimension |
| 3 | **Detector type follows room class** (smoke default, heat in kitchens and unconditioned plant, beam in large halls) | 28 of 35 on plan, 15 of 15 on the fire sheet | walker placement: NEW device rows (no detector device exists today) | one design; the "large hall" size is not stated |
| 4 | **Exposed runs parallel or square to building walls** | 0.81-1.00 of run length on 8 service sheets vs 0.09 chance; the rule came from a water-feature spec section, so it generalised | walker routing: one `params_json` key | threshold is a measurement, store it with its n |
| 5 | **Ceiling devices centre in the room or on the ceiling module**, by device kind | detectors, emergency, lights centre; cameras and service air do not | walker placement (exists): per-kind assignment | module size from lights only |
| 6 | **Egress and fire-access clearances** (stair width, soffit, fire path, exit separation >= 1/3 of the diagonal) | stair width: 38 of 38 flights above the stated minimum | edit gate (a wall or grid drag turns RED under the limit), like GridSpanGate | needs "which flights are egress" (no flag in the model); local template values |
| 7 | **Wall type row holds thickness, fire and acoustic rating together; a drag keeps the type** | thickness vs legend 81 of 87 (control 25); acoustic rating is one value per type on 48 of 48 types | wall drag keeps the row; typed property row | walls carry no fire rating in the model |
| 8 | **Stated figures can be recomputed** (area totals, stated arithmetic, spec figure vs sheet label) | all printed area totals recompute (one 1 m2 rounding; one digit transposition found); a pump set matches between spec and sheet | checker | cheap and general |
| 9 | **Facade run "n EQ. MODULES": module = overall / n** | 1.00-1.07 m on 5 of 6 runs; one 8-vs-6 label conflict on the same overall | checker; reviewer item | |
| 10 | **Level grammar:** a mark names the surface it measures | top-of-concrete marks vs model within 20 mm, 21 of 22 and 25 of 26 (controls 11, 9) | reader | firm's vocabulary |
| 11 | **A framing plan states whether a vertical member continues above or ends** | 27 of 31 and 14 of 17 (controls 15, 9) | reader; column edit | the IFC holds no such relation |
| 12 | **Side-face bars follow beam depth; stirrups are per mark, not derivable from the section** | 22 of 22 marks consistent; stirrups vary at one depth | edit principle: a stretch or copy keeps the mark's whole row; 5D bar quantities by mark x length | the model has no bar data, so only the sheet can check it |
| 13 | **Door tag encodes storey and room; door heights cluster; schedule rating vs model rating** | 67 of 67 tags fit two grammars; one height on 39 % of doors; the model lacks the sixty-minute doors the schedule lists | reader (door to room); checker | door identity not checked (no mark in the model) |
| 14 | **Ownership split:** the ceiling plan gives location, the service discipline gives quantity | tested on one ceiling plan | document / ERP rule | |

## 3. Next tier (stated, valuable if a second source confirms)
- **Piping, pump-room and electrical practice** (slope >= 1 % and no traps, cover over buried pipe, flange or union spacing, suction straight run, panel top height, tray spare capacity, starter by motor power): stated in one spec. Four walker-slot gaps: no slope key, no joint-spacing column, no pump-to-valve relation rows, no fill limit.
- **Buried-pipe practice** (trench width, bed and backfill layers, road-crossing ducts, warning tape, thrust block at every bend or end, valve box by ground cover, drip pitch and run limit): stated, no model to test it against. Element-by-condition gaps (tape, thrust block).
- **Sequence and lag rules** (deeper first, clear before dig, test before cover, cure and test holds, trench open at most 3 days): feed a schedule template (`4D_template.json`), not the walker.
- **Design codes stated on the structural cover sheet select the span/depth source:** this design is a US-code design; the Modeller span table cites Eurocode with an ACI cross-reference. Nothing contradicted (the span test is inconclusive); the rule source should be selectable from a stated code list as a data row.
- **Conflict handling and provisional labels:** conflicts go to a named role; some properties have a governing discipline; a sheet can state that its own numbers are not final.
- **Conflicts to report, not resolve:** two stated values for buried cover (a water-feature spec 90 cm vs a plumbing note 600 mm below floor) differ in context.

## 4. Findings that bound the idea
- **The set has no repeating bay:** grid pitches are irregular, no run of three equal pitches in any family, so `bay_repeat` (a typical bay repeating at least 3 times at one pitch) would refuse here. Inferred from pitches; `bay_add.js` was not run on it. This set is the negative case for add-bay; the Shed is the positive one.
- **The model's reinforcement property sets are empty shells** (the type mark only, no pitch or count) and the model has no reinforcing bars: reinforcement rules can only be checked against the sheets.
- **A beam "Span" property is the element's own length, not a support-to-support span:** a span-limit test on it is inconclusive; nothing is dictated for the code span table.
- **Dimension-to-model comparison by set matching is inconclusive** (three tests did not beat a shifted control); one agreement, the main grid pitch. A real test snaps each dimension's two endpoints to model elements through the sheet-to-model frame; not built.
- **XREF underlays duplicate dimensions 3.3x** in the DXFs: de-duplicate before any count.
- **A probable foundation pattern** (about 300 circular members ~11 m long below grade, probably piles) has median nearest-neighbour spacing 2.2 diameters and a dozen stacked positions (a model defect). Measured, not a stated rule; none promoted.
- **Typed text on a dimension can qualify a different quantity** from the one it measures (a "MIN 600" note on dimensions measuring 148-612 mm): keep it as a label, do not test the measured value against it.

## 5. Revit vs ours (advice 2026-11-14; Revit statements are general product knowledge, Revit was not run here)
- **Revit keeps the rule inside the model while a person draws:** in families and constraints, type parameters, stair calculation rules, routing preferences and sizing criteria, area schemes, schedules with calculated values. The output (sheets, IFC) carries the **result**, not the rule. The measurements show it: stair property sets hold the tread and riser values, the reinforcement sets hold only a mark, and the sheet words EQ, ALIGN, TYP, U.N.O., VIF are the visible trace of constraints the author set.
- **Specifications are text outside Revit:** linked by keynotes, type marks and assembly codes; Revit does not compute over spec wording. Code checking is done by add-ins, scripts or external checkers.
- **Ours reads the output and recovers the rule as data:** a row (SQLite or JSON) that a deterministic gate, reader, walker or checker applies to any IFC or DXF, offline, with a `§` log line as evidence.
- **What to copy from Revit:** calculated schedules (a checker that recomputes any printed total), typed rows with inheritance (a wall type), calculation rules and preferences (as `edits.*` rows and `rule_routing` keys), equal-spacing and alignment constraints (add-bay same pitch), sheet registers and revisions (the BIM Document lane, already built).
- **What Revit does not do for you:** compare a spec figure with a sheet label, report a cross-discipline conflict to a named role, give a rule an evidence score, run offline in a browser on someone else's model.

## 6. Where else the rules go, besides the walkers (ranked, each with an existing home)
1. **Edit gates** (drag wall, drag grid, add bay, stair stretch): egress clearances, keep the mark's row, wall keeps its type, stair recomputes the riser. Same pattern as GridSpanGate (RED / ORANGE / GREEN, "Add one more"); data in `element_defaults.json` `edits.*`.
2. **Checkers** (new, deterministic, any file): recompute printed totals, spec figure vs sheet label, rating inheritance, level mark vs model. An extension of the DXF set check.
3. **The reader (Gap Guide / DXF2BIM), rules as data:** sheet series, level grammar, ABOVE/BELOW words, support state, tag forms, EQ forms.
4. **4D and 5D templates:** sequence and lag rows; quantity rules (required-whether-drawn, equipment sets, bars by mark x length, mesh rings, finishes takeoff); the "sheets through our chain" billable measure.
5. **ERP BIM Document:** conflicts to a named role as an approval step, spec-vs-sheet agreement as a document check, issue states and credit at "Issued for construction" (already ruled).
6. **BOM defaults:** wall type, room class to enclosure and finish, detector kind by room.
7. **Jurisdiction packs:** every row marked "local template" (cover depths, lintel width, trench width, test pressures) plus a stated design-code list become a selectable pack next to the existing UBBL gate, not a universal default.

## 7. Open items (as at 2026-11-14)
1. OCR for the image-only report pages (install tesseract).
2. The endpoint-snapping dimension test (private sheet-to-model frame, local only).
3. A vector read of the one accessibility sheet.
4. Not yet read: three schedule sheets as tables; the Revit models.
5. Reviewer (owner forwards): the missing mechanical and fire chapters and specification parts, sprinklered yes/no, which grid governs where two disciplines differ by about 120 mm, the sixty-minute doors missing from the model, the facade module label conflict.
6. Owner decisions: the detector "large hall" size (no number stated); which flights are egress; whether to run a second-building test (Shed add-bay first) once this set has given more rules.
7. Order stands: this set first; nothing is built or handed over.
