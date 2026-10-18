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
| `column.height` | IfcColumn | m | **3.0** | guess | storey height when no elevation gives it | 2.7, 3.0, 3.6 |
| `column.size` | IfcColumn | m | **0.3** | guess | square section when a column symbol gives none | 0.2, 0.25, 0.3, 0.4 |
| `ceiling.thickness` | IfcCovering | m | **0.012** | guess | board thickness when a ceiling is implied | 0.009, 0.012, 0.015 |
| `floorfinish.thickness` | IfcCovering | m | **0.02** | guess | floor finish thickness when implied | 0.01, 0.02, 0.05 |
| `net.thickness` | IfcCovering | m | **0.005** | guess | netting sheet thickness; the area is drawn | 0.002, 0.005, 0.01 |
| `curtainwall.mullion` | IfcCurtainWall | m | **0.05** | guess | typical mullion width | 0.05, 0.06 |
| `door.height` | IfcDoor | m | **2.1** | guess | typical door set height; plans do not draw it | 2.0, 2.1, 2.4 |
| `door.thickness` | IfcDoor | m | **0.04** | guess | typical leaf thickness for a leaf drawn as one line | 0.04, 0.05 |
| `door.width` | IfcDoor | m | **0.9** | guess | typical single leaf; used only for a door tag with no drawn swing or gap | 0.8, 0.9, 1.0 |
| `fan.depth` | IfcFan | m | **0.3** | guess | housing depth; the diameter is drawn | 0.2, 0.3, 0.4 |
| `footing.depth` | IfcFooting | m | **0.4** | guess | pad footing thickness | 0.3, 0.4, 0.6 |
| `footing.length` | IfcFooting | m | **1.2** | guess | pad footing plan length when no schedule gives it | 1.0, 1.2, 1.5 |
| `footing.width` | IfcFooting | m | **1.2** | guess | pad footing plan width | 1.0, 1.2, 1.5 |
| `member.size` | IfcMember | m | **0.04** | guess | square envelope for a member with no label or size | 0.04, 0.05, 0.075 |
| `section.spacing` | IfcMember | text | **column pitch** | guess | a section drawn once repeats at the column pitch from its cut | column pitch, 2 x column pitch |
| `pile.diameter` | IfcPile | m | **0.3** | guess | typical bored pile diameter | 0.3, 0.45, 0.6 |
| `pile.length` | IfcPile | m | **12.0** | guess | no pile length is drawn on a layout | 6, 12, 18 |
| `plate.thickness` | IfcPlate | m | **0.00635** | std | 1/4 in, the thickness the truss section's own label states (a plate with no label takes it) | 0.00476, 0.00635, 0.0095 |
| `railing.height` | IfcRailing | m | **1.0** | guess | typical guard height | 0.9, 1.0, 1.1 |
| `railing.post_spacing` | IfcRailing | m | **1.2** | guess | typical post spacing | 1.0, 1.2, 1.5 |
| `ramp.slope` | IfcRamp | ratio | **0.0833** | guess | 1:12, a typical accessible ramp | 0.0625, 0.0833, 0.1 |
| `roof.slope_deg` | IfcRoof | deg | **15.0** | guess | typical light roof pitch; used only when no gable or section gives the slope | 10, 15, 17.5, 22.5 |
| `synth.column.belowgrade.size` | IfcColumn | m | **0** | guess | 0 = not stated: no below-grade column is built; a column schedule that states the section (e.g. 14 x 14 in = 0.3556) sets it, an explicit value overrides the schedule | |
| `synth.column.grade_to_base` | IfcColumn | m | **0.6096** | guess | grade to the column base (plinth): 2 ft, the datum read from a column detail | |
| `synth.roof.overhang` | IfcRoof | m | **0.0** | guess | the roof is cut at the gable planes until an overhang is stated | 0, 0.4572, 0.6 |
| `synth.roof.sheet_thickness` | IfcRoof | m | **0.0254** | guess | display thickness of a roofing sheet (1 in); the cost is by area | 0.0254, 0.05 |
| `synth.slab.footprint` | IfcSlab | text | **outermost grid lines** | guess | the slab edge is taken at the outermost grid lines of the base plan | outermost grid lines |
| `synth.slab.thickness` | IfcSlab | m | **0.25** | std | rate pack: 'RC Slab 250mm' (viewer/rates/cidb2024_my.json IfcSlab) | 0.15, 0.2, 0.25 |
| `stair.going` | IfcStair | m | **0.25** | guess | typical tread depth | 0.25, 0.28, 0.3 |
| `stair.riser` | IfcStair | m | **0.175** | guess | typical riser height; a stair symbol carries no riser | 0.15, 0.175, 0.19 |
| `stair.width` | IfcStair | m | **1.0** | guess | typical flight width | 0.9, 1.0, 1.2 |
| `panel.plane` | IfcWall | text | **end grid line, centred** | guess | an elevation panel is placed on the outermost grid line of its face, centred | end grid line, centred |
| `wall.base` | IfcWall | m | **0.0** | guess | floor level of the storey |  |
| `wall.height` | IfcWall | m | **3.0** | guess | typical storey wall height; not stated by a plan | 2.4, 2.7, 3.0, 3.6 |
| `wall.thickness` | IfcWall | m | **0.15** | std | rate pack: 'Blockwork Wall 150mm' (viewer/rates/cidb2024_my.json IfcWall) | 0.1, 0.115, 0.15, 0.2, 0.225 |
| `window.height` | IfcWindow | m | **1.2** | guess | typical window height | 1.0, 1.2, 1.5 |
| `window.sill` | IfcWindow | m | **0.9** | guess | typical sill height above the floor | 0.9, 1.0, 1.1 |
| `window.width` | IfcWindow | m | **1.2** | guess | typical window width; used when a plan symbol gives no width | 0.9, 1.2, 1.5 |

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
