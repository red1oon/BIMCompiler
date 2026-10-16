# DXF2BIM — user guide (labels set what geometry cannot)

Status 2026-10-12: sandbox modules, not wired into the Modeller. Source of every rule below: `DXF2BIM_SPEC.md` (section numbers in brackets).

## 1. The rule
**The drawing's geometry gives the 3D outline. Anything the geometry cannot decide — which product, which schedule mark, which of two same-size types — is set by a LABEL you state.** The pipeline never guesses: an undecided element is left untyped and logged as a GAP with the candidates listed. You close the gap by labelling (or by an explicit binding table). A label sets the *type*; it never changes a measured size [§38 B4, §44].

## 2. What geometry decides, and what needs a label
| Decided by geometry (no label) | Needs a label |
|---|---|
| Wall footprint, thickness, length, openings in drawn gaps, window sizes from glazing, door width from arcs | Which product when ≥2 library entries have the same size (`GAP:type_unbound`, `candidates` lists them) |
| Heights, sills: from marked elevations (`@OPENING`, `@Z`) | Which of several STACKED openings (same plan footprint): add `z=` |
| A type, when exactly ONE library entry (or one in the preferred set) matches the size within `bind.size_tol` | A type the library does not hold at the measured size: the label binds and the size difference is reported (`GAP:type_size_mismatch`) |
| | Schedule marks (e.g. window "1") you want checked against the drawing (`@SCHEDULE`) |

## 3. Markings you write (text in layer `DXF2BIM-MARK`, one `@KEY=value` per text)
Plan view: `@SET @VIEW=PLAN @NAME @UNITS @LEVEL @GRIDX @GRIDY @REGION @EXCLUDE`; elevation: `@VIEW=ELEV @FACE @HAXIS @GRIDH @Z @OPENING` [§24-§36].
- `@LABEL=class,x,y,text` — `class` = `door|window|wall`; `x,y` a point on/in the element, in drawing units (`@UNITS`). `text` = a library id (binds the type) or a schedule mark [§44 L1].
- `@LABEL=class,x,y,z=<metres>,text` — add `z=` (absolute z, as `@Z`) when openings are stacked on one plan spot: the point alone is ambiguous and nothing is labelled [§44 L1b].
- `@SCHEDULE=text,door|window,w,h` or `@SCHEDULE=text,wall,t` — the size the drawing's schedule states for that mark, in drawing units. Used only to report a conflict with the measured size; never overrides it [§44 L2].
- `@TAG=class,text` (and `@TAG=class,z=<metres>,text` in a plan) — the same label, but placed BY POSITION: put the text on the drawing at the element; its insertion point is the position, no coordinates to type. In a PLAN the tag labels the element under it. In an ELEVATION it labels the opening of that class and face at that position and height (stacked openings are told apart by where you put the tag; no `z=` there) [§52].
- Canned labels: when a vocabulary is supplied (`{short code: library id}`), the tag text must be a code from it (case-sensitive); a typo is `GAP:label_unknown_text` and nothing is labelled. Use short canned codes on the drawing, the vocabulary turns them into library ids [§52 T2].
- `@ALLOWANCE=door|window,w,h` — "the drawn opening is the scheduled size PLUS this much" (rough opening over nominal), in drawing units, one pair per class. Used only when comparing a schedule with the measured size: a difference equal to the allowance is no conflict. You state it; it is never assumed. It does not affect library matching or walls [§57].
- Same point and text twice is fine; same point with two texts is `MARK:conflict`.

## 4. How to use the rule (workflow)
1. Run. Read the log (not the exit code): list the `DXF_GAP` ops.
2. For each `GAP:type_unbound` with candidates: decide the product from the drawing's legend/schedule/notes (or your knowledge), write `@LABEL=...,<library id>` at the element. With stacked openings add `z=`.
3. For `GAP:schedule_conflict`: the drawing disagrees with its own schedule (both values are in the gap). If the difference is a constant rough-opening allowance (e.g. +1.5 in on every opening), state it with `@ALLOWANCE`; otherwise decide which value is right; the pipeline will not.
4. For `GAP:type_size_mismatch`: the labelled type's size differs from the drawing; check the label or the library. The 3D keeps the drawn size.
5. For `GAP:label_unmatched / label_ambiguous / label_conflict`: move the point, add `z=`, or remove the duplicate.
6. Re-run until the gaps you care about are closed. Gaps are the to-do list.

## 4b. Standing rule: geometry, type and conflicts
- **Geometry is what is drawn and dimensioned.** The 3D outline keeps the measured or dimensioned size. A type, a label or a schedule never overwrites it [§38 B4].
- **The type comes from the schedule or your label.** It says which product the element is, not how big the drawing made it.
- **A difference is logged, not hidden.** `GAP:schedule_conflict` (or `type_size_mismatch`) holds both numbers. Close it by asking the drawing's author, then change ONE thing: the marking (e.g. re-mark the elevation opening) or the schedule entry.
- **Use `@ALLOWANCE` only for a constant margin** that repeats on every opening of a class (e.g. +1.5 in rough opening). Never to absorb a one-off or large difference: that would silence a real discrepancy.
- Worked case, Farmhouse window mark 1 (SPEC §56-§58): geometry stays 78 in high (elevation dimension chain and siding gap agree), type = schedule 30"x60" double hung, the 18 in difference stays an open conflict for the author.

## 5. Settings you must give (no defaults are invented)
- `bind.size_tol` (metres): size match tolerance. Missing → `GAP:no_dimension`, nothing is bound [§38 B3].
- `bind.prefer` (ordered set names): a set that breaks a size tie. Only chooses among size-equal candidates; never beats a label or an explicit binding [§42].
- `opening.gap_max` (and `gap_min`): needed for gap openings and for wall-stub orientation (§46); absent → stub rule off.
- A library as plain rows with ids (and optional `set`). Where the rows come from (embedded db, OCI, file) is outside the binder [§42].

## 6. Gap codes you will meet
| Code | Meaning | You do |
|---|---|---|
| `GAP:type_unbound` | 0 or several library entries fit the size (`candidates`, `prefer_narrowed`) | label it |
| `GAP:type_size_mismatch` | bound by label/explicit, size beyond tolerance (`delta`) | check label/library |
| `GAP:schedule_conflict` | schedule vs measured differ | decide, fix drawing or label |
| `GAP:type_request_incomplete` | a size is missing (e.g. door height, no elevation) | mark the elevation opening |
| `GAP:layers_sum_mismatch` | wall type layers do not add up to the measured thickness | check type |
| `GAP:type_unknown / type_binding_conflict` | explicit id not in library / two bindings disagree | fix the table |
| `GAP:label_*` | label hit nothing / several / contradicts an existing label; `label_unknown_text`: tag text not in the vocabulary | move the point/tag, add `z=` (plan) or place it at the opening's height (elevation), fix the code |
| `GAP:wall_orientation_ambiguous` | a wall stub has neighbours on both axes | informational; own axis kept |
| `GAP:no_dimension` | a required setting is missing (`need` says which) | give it |

## 7. Worked example (Duplex, `rosetta_dx_types.js`)
Twelve windows measure 819 x 759 mm. The library has two products of that size (`DUPLEX_SMALL_FIXED`, `DUPLEX_CASEMENT`). The geometry cannot tell them apart: all 12 are `type_unbound`. Each plan spot holds three stacked windows, so labels carry `z=`: `@LABEL=window,<x>,<y>,z=4.1,DUPLEX_CASEMENT`. After labelling, 22/22 windows and 30/30 walls bind to the type the source model says.

## 8. What is not built yet
- The Duplex labels and tags were generated from the SOURCE model (round trip) and written into copies of the drawings, then read back (SPEC §53-§54). Free drawing TEXT without the `@TAG` prefix (a legend or schedule as plain text) is not read; today you place `@LABEL`/`@TAG` markers. No tag palette/stamp or Modeller UI exists yet; doors tagged in elevations are untested.
- Wall types with the same thickness (417 mm exterior vs foundation) need a wall label; no level/category rule exists.
- Farmhouse (independent set, SPEC §55-§56): the drawing's own mark texts (`1`, `A`) and schedule rows were turned into `@TAG`/`@SCHEDULE` markers by a sandbox tool that only reads single-character marks next to classified openings; a general text reader does not exist. The tool found schedule conflicts the pipeline reports and does not resolve: plan gap = schedule width + 1.5 in (all three openings; stated with `@ALLOWANCE=window,1.5,0` and `@ALLOWANCE=door,1.5,0`, after which those conflicts disappear), window height 78 in measured vs 60 in scheduled (still reported). The drawing's notes say written dimensions take precedence over measurements; you decide which value is right.
- Types are not yet written into the Modeller's `ELEMENT_PLACE` params; the Modeller is not wired. Online library (OCI) loader not specified.
- Typed outline back to a 2D set (op→DXF) is not built.
