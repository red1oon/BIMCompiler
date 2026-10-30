# DXF2BIM — the yellow list
*[← Back to the **2D Drawings → BIM guide**](DXF2BIMGuide.md)*

A 2D drawing carries only some of what a model needs. Everything it does not state is a **setting**: a **yellow** field that holds a *standard value* or a *typical-practice guess*, so you can see exactly what was assumed. **You can ignore the yellow list**: the defaults stay applied and the measurement is determined by them, but each one is listed, tagged, and never presented as the drawing's own statement. State a value and it is kept **inside your drawing set** as a marking (`@DEFAULT=<key>,<value>`, `@BY=user`); remove it and the default returns.

## A. What you are asked to state (the facts a drawing cannot give)

| Fact | Where you state it | Why a default would be wrong |
|---|---|---|
| **Units** of each sheet | Units section (the file header is shown, never applied by itself) | a wrong unit scales the whole model |
| **Set name** (e.g. `SHED`) and **view / level** of each sheet | Sheets section; suggestions from the title text wait for your tick | which plan is which storey |
| **Plan level** (e.g. 0) | Sheets section | defines the storey |
| **Height datum** per elevation: the z of a marked line (e.g. the plinth line is 0.6096 m = 2 ft above ground, read from the column detail) | Metadata → elevation sheet → `@Z` | no drawing says which line is the datum |
| **Which layer is what** (column, footing, grade beam, beam, wall-panel hatch, fan, net, door swing, truss bar, door frame) | Layers section (one choice per layer and view) | a layer *name* is not evidence of what is drawn |
| **Body heights nothing draws** (e.g. footing depth from a detail, beam depth range) | Body heights section → `@BODYZ` | no elevation shows a buried footing |
| **Areas to leave out** (e.g. an expansion-joint strip that looks like a beam) | Exclude areas → `@EXCLUDE` | the joint would become a false beam |
| **A stated size** where a label and the drawn length disagree (e.g. a beam drawn 10 in deep, labelled 12 in) | Stated sizes section → `@SIZE` | the label's number is used; you may correct it |
| **A details sheet** (optional): a sheet of notes and schedules with no body layers | add it to the set; nothing to type | its text states the concrete grade, casting ratios and the footing / column schedules; it is read, never guessed, and a column schedule's below-grade section replaces a typed setting |
| **Building type** (`General` or `Farming Shed`) | Element defaults → Building type | selects cited type-specific defaults |
| Anything in section B you know better | Element defaults → type a value and **Set** | the default is a guess or a standard value, not your fact |

## B. The defaults used when you state nothing

**std** = a value with a named source in this repository or the rate pack. **guess** = typical practice, to be confirmed. The list below is generated from `modeller/element_defaults.json` (the registry the Modeller reads); the Element defaults section in the editor shows the same rows with the value in force, highlights the ones used in your model, and tells you where each value came from (default, your choice, the drawing set, or the building type).

| Setting | Element | Unit | Default | Kind | Basis | Offered choices |
|---|---|---|---|---|---|---|
| `building.type` | Building | text | **General** | guess | the kind of building; it selects the type-specific defaults and organises the reference component library. A person states it (@DEFAULT=building.type,Farming Shed) | General, Farming Shed |
| `beam.depth` | IfcBeam | m | **0.45** | guess | section depth when no label or band gives it | 0.3, 0.45, 0.6 |
| `beam.width` | IfcBeam | m | **0.3** | guess | section width when no label or band gives it | 0.2, 0.25, 0.3 |
| `gradebeam.depth` | IfcBeam | m | **0.3** | guess | grade beam depth | 0.3, 0.45 |
| `gradebeam.width` | IfcBeam | m | **0.3** | guess | grade beam width when no label gives it | 0.2, 0.3 |
| `column.height` | IfcColumn | m | **3** | guess | storey height when no elevation gives it | 2.7, 3, 3.6 |
| `column.size` | IfcColumn | m | **0.3** | guess | square section when a column symbol gives none | 0.2, 0.25, 0.3, 0.4 |
| `synth.column.belowgrade.size` | IfcColumn | m | **0** | guess | 0 = not stated: no below-grade column is built; state the schedule's below-grade section (e.g. 0.3556 for 14 in) |  |
| `synth.column.grade_to_base` | IfcColumn | m | **0.6096** | guess | grade to the column base (plinth): 2 ft, the datum read from a column detail |  |
| `ceiling.thickness` | IfcCovering | m | **0.012** | guess | board thickness when a ceiling is implied | 0.009, 0.012, 0.015 |
| `floorfinish.thickness` | IfcCovering | m | **0.02** | guess | floor finish thickness when implied | 0.01, 0.02, 0.05 |
| `net.thickness` | IfcCovering | m | **0.005** | guess | netting sheet thickness; the area is drawn | 0.002, 0.005, 0.01 |
| `curtainwall.mullion` | IfcCurtainWall | m | **0.05** | guess | typical mullion width | 0.05, 0.06 |
| `door.height` | IfcDoor | m | **2.1** | guess | typical door set height; plans do not draw it | 2, 2.1, 2.4 |
| `door.operation_standard` | IfcDoor | text | **SINGLE_SWING_LEFT** | guess | the running standard of a 2D set's doors whose operation the model does not state (F7 D18): the majority side of the building's stated single-swing doors; drawn yellow on A-DOOR-DFLT | SINGLE_SWING_LEFT, SINGLE_SWING_RIGHT |
| `door.thickness` | IfcDoor | m | **0.04** | guess | typical leaf thickness for a leaf drawn as one line | 0.04, 0.05 |
| `door.width` | IfcDoor | m | **0.9** | guess | typical single leaf; used only for a door tag with no drawn swing or gap | 0.8, 0.9, 1 |
| `fan.blades` | IfcFan | count | **4** | guess | the drawing's rings give the housing and hub radii, not the blades; a propeller fan is drawn with this many radial paddles | 3, 4, 5, 6 |
| `fan.depth` | IfcFan | m | **0.3** | guess | housing depth; the diameter is drawn | 0.2, 0.3, 0.4 |
| `fan.housing_wall` | IfcFan | m | **0.02** | guess | the housing is a tube of the drawn outer radius; its wall is not drawn | 0.01, 0.02, 0.03 |
| `footing.depth` | IfcFooting | m | **0.4** | guess | pad footing thickness | 0.3, 0.4, 0.6 |
| `footing.length` | IfcFooting | m | **1.2** | guess | pad footing plan length when no schedule gives it | 1, 1.2, 1.5 |
| `footing.width` | IfcFooting | m | **1.2** | guess | pad footing plan width | 1, 1.2, 1.5 |
| `member.section` | IfcMember | text | *(empty)* | guess | a member whose label carries no section: empty = the most common section drawn on the same set for the same kind of member (load_summary.js, shown assumed); a label such as 1.5"x1.5"x1/4" Angle = that section; none = leave them unweighed |  |
| `member.size` | IfcMember | m | **0.04** | guess | square envelope for a member with no label or size | 0.04, 0.05, 0.075 |
| `profile.angle_heel` | IfcMember | text | **lower** | guess | which way an angle opens is not stated by a section label; the heel corner sits at the low side of the bar's normal (the b x b envelope is kept either way) | lower, upper |
| `profile.angle_mesh` | IfcMember | text | **label** | guess | a section bar whose label states one equal-leg angle (1.5"x1.5"x1/4" Angle) is built as that L section (t(2b-t) x length) instead of its b x b box; 'box' keeps the drawn prism | label, box |
| `section.spacing` | IfcMember | text | **column pitch** | guess | a section drawn once repeats at the column pitch from its cut | column pitch, 2 x column pitch |
| `pile.diameter` | IfcPile | m | **0.3** | guess | typical bored pile diameter | 0.3, 0.45, 0.6 |
| `pile.length` | IfcPile | m | **12** | guess | no pile length is drawn on a layout | 6, 12, 18 |
| `plate.thickness` | IfcPlate | m | **0.00635** | std | 1/4 in, the thickness the truss section's own label states (a plate with no label takes it) | 0.00476, 0.00635, 0.0095 |
| `railing.height` | IfcRailing | m | **1** | guess | typical guard height | 0.9, 1, 1.1 |
| `railing.post_spacing` | IfcRailing | m | **1.2** | guess | typical post spacing | 1, 1.2, 1.5 |
| `ramp.slope` | IfcRamp | ratio | **0.0833** | guess | 1:12, a typical accessible ramp | 0.0625, 0.0833, 0.1 |
| `roof.slope_deg` | IfcRoof | deg | **15** | guess | typical light roof pitch; used only when no gable or section gives the slope | 10, 15, 17.5, 22.5 |
| `synth.roof.overhang` | IfcRoof | m | **0** | guess | the roof is cut at the gable planes until an overhang is stated | 0, 0.4572, 0.6 |
| `synth.roof.sheet_thickness` | IfcRoof | m | **0.0254** | guess | display thickness of a roofing sheet (1 in); the cost is by area | 0.0254, 0.05 |
| `slab.edge_arc_sagitta` | IfcSlab | m | **0.005** | guess | an arc in a slab edge is read as straight facets no further than this from the arc (5 mm: under the reader's thinnest wall and the plank keyway) | 0.002, 0.005, 0.01 |
| `slab.edge_joint_close` | IfcSlab | m | **0.05** | guess | §D70.1 the plan's slab edge closes gaps and notches narrower than this (plank / modelling joints are not drawn: hollow-core joints are grouted monolithic, the open keyway about 3/4 in, Oldcastle Hollowcore Plank Pocket Guide 2019); 0.05 m = the reader's thinnest wall (CFG wall.min_thickness), measured joints <= 24.9 mm (JKR), the first wall gap 60 mm (HHS) |  |
| `slab.edge_void_min_area` | IfcSlab | m2 | **0.0645** | guess | §D70.1 a hole in the slab is drawn as an opening when at least a 254 mm (10 in) square: the producer shows openings larger than 10 in square on shop drawings, smaller ones are core-drilled in the field (Oldcastle Hollowcore Plank Pocket Guide 2019); a hole a column or wall drawn on the same plan fills (>= 0.9) is that element, never an opening |  |
| `slab.level_step_min` | IfcSlab | m | **0.1** | guess | slab tops closer than this are one level (the measured finishes are 25-50 mm); a step of this size or more is drawn as its own piece with its own top and thickness (A-FLOR-OTLN elevation / thickness, A-FLOR-LEVL line); 1 or more = one level per storey | 0.05, 0.1, 0.2, 1 |
| `slab.outline_when_not_rect` | IfcSlab | text | **walls_bounded** | guess | when the walls do not draw a rectangle, the slab is the area they bound on both axes (best effort, amber; HHS -10% against the model's floor slabs, a rectangle +163%); 'none' leaves the slab out and lists it | walls_bounded, none |
| `slab.underside_when_stepped` | IfcSlab | text | **longest_cut** | guess | when the section's slab under a level steps (finish on planks, a dropped wet area), the underside is the stack bottom under the longest cut (best effort, amber; JKR with STR: 84.33 under 77% of the cut); 'none' leaves it a conflict | longest_cut, none |
| `synth.slab.footprint` | IfcSlab | text | **outermost grid lines** | guess | the slab edge is taken at the outermost grid lines of the base plan | outermost grid lines |
| `synth.slab.thickness` | IfcSlab | m | **0.25** | guess | a guess: no sheet states the slab thickness. 250 mm is the slab line every rate pack's class table names ('RC Slab 250mm', the same 250 mm in all 16 country packs), a priced item, not a design value for this building (§D99) | 0.15, 0.2, 0.25 |
| `stair.going` | IfcStair | m | **0.25** | guess | typical tread depth | 0.25, 0.28, 0.3 |
| `stair.riser` | IfcStair | m | **0.175** | guess | typical riser height; a stair symbol carries no riser | 0.15, 0.175, 0.19 |
| `stair.width` | IfcStair | m | **1** | guess | typical flight width | 0.9, 1, 1.2 |
| `panel.plane` | IfcWall | text | **end grid line, centred** | guess | an elevation panel is placed on the outermost grid line of its face, centred | end grid line, centred |
| `wall.base` | IfcWall | m | **0** | guess | floor level of the storey |  |
| `wall.height` | IfcWall | m | **3** | guess | typical storey wall height; not stated by a plan | 2.4, 2.7, 3, 3.6 |
| `wall.thickness` | IfcWall | m | **0.15** | guess | a guess: no sheet states the wall thickness. 150 mm is the wall line every rate pack's class table names (the same 150 mm in all 16 country packs), a priced item, not a design value for this building (§D99) | 0.1, 0.115, 0.15, 0.2, 0.225 |
| `wall.top_when_unseen` | IfcWall | text | **slab_above** | guess | a wall no elevation shows runs from its floor to the slab underside above (the section states it); HHS Level 2 / 3 = the model, Level 1 0.3 m above the model's (its walls stop at a ceiling the drawings do not show); 'none' leaves such walls as asks | slab_above, none |
| `type.size_tie` | IfcWindow | text | **library_first** | guess | a size the library answers with several types (Duplex 819 x 759: SMALL_FIXED, CASEMENT) binds the library's first row (8 of the Duplex IFC's 12 are that type); an explicit binding or label always wins; 'none' leaves such fills as asks | library_first, none |
| `window.height` | IfcWindow | m | **1.2** | guess | typical window height | 1, 1.2, 1.5 |
| `window.sill` | IfcWindow | m | **0.9** | guess | typical sill height above the floor | 0.9, 1, 1.1 |
| `window.width` | IfcWindow | m | **1.2** | guess | typical window width; used when a plan symbol gives no width | 0.9, 1.2, 1.5 |
| `load.rc_steel_percent` | load | % by volume | **1** | guess | main reinforcement not drawn; BNBC 2012 Table 2.2.1 note: "for reinforced concrete, add 0.63 kN/m3 for each 1% by volume of main reinforcement" | 0.5, 1, 1.5, 2, 3 |
| `load.roof_sheet` | load | kN/m2 | **0.096** | guess | sheet thickness not drawn; BNBC 2012 Part 6 Ch 2 Table 2.2.2 "Steel, galvanized std. corrugated sheeting (incl. lap and fastenings) 0.8 mm thick 0.096" | 0.077, 0.096, 0.12 |
| `load.unit_weight.brick` | load | kN/m3 | **18.9** | std | BNBC 2012 Part 6 Ch 2 Table 2.2.1: "Brick 18.9" (modeller/reference/BNBC2012_P6C2_dead_load_tables.txt) |  |
| `load.unit_weight.concrete` | load | kN/m3 | **22.8** | std | BNBC 2012 Part 6 Ch 2 Table 2.2.1: "Concrete - stone aggregate (unreinforced) 22.8" (modeller/reference/BNBC2012_P6C2_dead_load_tables.txt) |  |
| `load.unit_weight.steel` | load | kN/m3 | **77** | std | BNBC 2012 Part 6 Ch 2 Table 2.2.1: "Steel 77.0" (modeller/reference/BNBC2012_P6C2_dead_load_tables.txt) |  |

Rule of resolution, strongest first: the drawing set's `@DEFAULT` marking → a choice made in the editor → the building type's cited override → the registry value above. A typo in a key is an error, never a silent default; a value that is not a non-negative number is refused and the default is used.

## C. Building type: Farming Shed

Stating `building.type = Farming Shed` switches on cited values (sources: the TNAU poultry-house construction guide, and a Bangladesh agricultural-university broiler-shed lecture; both medium confidence):

| Setting | Value | Basis |
|---|---|---|
| `door.height` | 1.83 | Farming Shed: preferred door 6 x 2.5 ft opening outward (TNAU) |
| `door.width` | 0.762 | Farming Shed: preferred door 6 x 2.5 ft (TNAU) |
| `synth.roof.overhang` | 1.0668 | Farming Shed: roof overhang at least 3.5 ft to keep rain out (TNAU) |

It also lists the components a farming shed is expected to contain (fans, nets/pads, doors, roof, slab) and the typical ranges used for the **Typology** advisories (open-sided width 15–25 ft, environment-controlled 40 ft and wider, eave 6–7 ft, centre 10–12 ft). Advisories compare and never change a body or a setting; a missing expected part is reported, never invented (an evaporative pad with no drawn length is not built).

## D. What *Complete the building* adds (amber, estimated)

Ticking **Complete the building** adds a floor slab and the gabled roof the drawings imply, and, where a column schedule states a section below grade, the **below-grade column parts** (footing top to grade at that section, grade to the base at the column's own section; `synth.column.*`). They are computed from drawn evidence plus the stated conventions `synth.slab.*` and `synth.roof.*` above, shown **amber** (derived), and their defaults are listed in yellow.

## E. How evidence is shown

| Evidence | Meaning | Where you see it |
|---|---|---|
| **drawn** | measured from the drawing | no mark |
| **derived** (amber) | computed from drawn evidence plus a stated convention (slab, roof, a panel that inherits a thickness label, a stated beam range, fans, nets, door swings) | *Evidence colours* checkbox on the import panel; `Provenance = derived` in the database |
| **assumed** (red) | no drawing evidence for the body's existence or position (e.g. a truss section drawn once, repeated along the building) | same checkbox; `Provenance = assumed` |
| yellow row | a value the drawing did not state and a default supplied | Metadata panel → *All defaults*; Accept all, or ignore |

By default the canvas shows each body in its **material's standard colour** (display convention, not a measurement): reinforced concrete grey, brick masonry brick red, profiled metal roofing light blue-grey, netting green, steel sections and plates dark blue-grey, extraction fans and door sets their own colours. A material with no colour in the palette is shown neutral grey and listed.

## F. Items the shed drawings left open (carried as yellow rows, never decided in code)

| Item | State |
|---|---|
| Truss spacing; whether the right half repeats the left | assumed: a truss at every column line (red), `section.spacing` |
| Roof sheet thickness and overhang | defaults 0.0254 m and 0 (`synth.roof.*`), overhang 1.0668 m under *Farming Shed* |
| Floor slab thickness and extent | 0.25 m (rate-pack standard), outermost grid lines |
| Fan depth; netting thickness | 0.3 m; 5 mm (the areas are drawn) |
| Door leaf thickness | 0.04 m for a leaf drawn as one line (two drawn lines give the real thickness) |
| Door height | **drawn** when the elevation's door-frame layer is typed (96 / 94 in on the shed), else 2.1 m |
| Four unlabelled 21.7 in swings with no open leaf | listed, not built (they sweep 75°, not a door's quarter turn) |
| Evaporative pads | not built: labelled, but no outline or length is drawn |
| False ceiling, slats (cross-section) | not built: labelled on the section, no closed plane, size or spacing is drawn |
| Polythene and compacted sand under the slab | not built: labelled, no thickness stated |
| Footing top: the detail section sums footing top to plinth to 84 in, the stated footing height (`@BODYZ`) puts it 69 in below the plinth | the stated value is kept; the 15 in difference is listed here |
| Beam reinforcement | not read: bars are labels on the section drawings, not a schedule (only the footing and column schedules are read) |
| 24 in "support wall" text against the 96 / 98 in brick drawn on the elevations | both kept; the brick is built as drawn |
| A beam drawn 10 in deep but labelled 12 in | conflict row; the label's number is used |
| `410'-0"` dimension text against 1,560 in drawn | conflict row in the dimension audit |
