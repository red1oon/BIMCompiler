# What's New

*← Back to [User Guide](USER_GUIDE.md) · [Home](index.md)*

A running log of shipped, user-visible changes across the Modeller, Viewer, ERP/POS, and HBA facilities
module. Internal engineering work (kernel hardening, data-model migrations, CI fixes) isn't listed here —
only things you'd actually notice using the app. See each app's guide for full how-to detail.

## 2026-11-02

**Modeller — 2D drawings to BIM**
- **Properties panel on an opened building.** Open a `.db` or `.ifc` and select a part to see its class,
  type and `Pset_*Common` values. A raw IFC is read once and reused. See
  **[Properties: what a part carries](DXF2BIMGuide.md#5a-properties-what-a-part-carries)**.

## 2026-10-31

**Modeller — 2D drawings to BIM**
- **Load Summary** for your structural engineer (**Export ▸ Load Summary…**): own weight of every part and the
  load on each footing, from the drawn sizes — not a design check. See **[Load Summary](DXF2BIMGuide.md#7-load-summary-for-your-structural-engineer)**.
- **Regulatory Report** (**Export ▸ Regulatory Report…**) — a short form of the facts a model cannot give
  (plot area, setbacks, occupancy, soil …); empty boxes read *not stated*, nothing is guessed. See
  **[Regulatory Report](DXF2BIMGuide.md#8-regulatory-report-what-you-hand-in)**.
- **Analytical model export** (STAAD.Pro `.std` plus open JSON), now read from the IFC so it also works on
  any IFC. See **[Analytical model](DXF2BIMGuide.md#9-analytical-model-staad-for-your-structural-engineer)**.
- The **Sheet view** now draws every dimension and the notes sheet. See
  **[See a whole sheet: Sheet](DXF2BIMGuide.md#2a-see-a-whole-sheet-sheet)**.

**ERP**
- **Test Harness** button on the Terms page — a recorded run of the Team-mode terms; open terms are listed
  first and never shown green. See **[How to verify the terms](TermsHowToVerify.md)**.

## 2026-10-28

**Modeller**
- **Copy & paste** — `Ctrl+C`, then `Ctrl+V` places the copy at the pointer; copies carry their edits,
  holes and hosted doors. See **[Copy & paste](ModellerGuide.md#copy-paste)**.
- **Add a bay** for repeating-bay buildings. See
  **[Add a bay](ModellerGuide.md#add-a-bay-repeating-bay-buildings)**.

## 2026-10-27

**BIM Viewer**
- **Your own 4D / 5D references** — pull out the rate pack, 4D template or sequence rules, edit them, use
  them, or reset to the shipped copy. The guide now states which app each copy takes effect in. See
  **[Your own 4D / 5D references](BIMUserGuide.md#your-own-4d-5d-references-rates-durations-sequence)**.

## 2026-10-26

**Modeller — 2D drawings to BIM**
- The **Sheet view**, **Arrange**, doors and windows tagged by width, evidence colours, and
  **Export > Viewer database** are all in the step-by-step guide. See
  **[DXF2BIM User Guide](DXF2BIMGuide.md)**.

## 2026-10-22

**ERP**
- **Attribute Set Instances (lots)** — one editor to create them; orders and shipments follow one
  mandatory-lot rule; shipments pick lots by guarantee date; receipts fill negative stock first and
  auto-generate a lot; batch-lot reversal on shipment returns.
- **Physical inventory** — confirming Difference or Scrapped Qty now creates the inventory documents and
  posts them.
- **Replenish Report** — the iDempiere report is ported, and the POS lens shares its order-quantity
  calculation. See **[Replenishment](ERPUserGuide.md#replenishment-p-4)**.

**Modeller — 2D drawings to BIM**
- New step-by-step guide for turning 2D drawings (DXF) into a BIM building: yellow = values the program
  guessed, datums, wall tops, blocking items. See **[DXF2BIM User Guide](DXF2BIMGuide.md)**.

## 2026-10-17

**BIM Viewer**
- **Offline** has a row in the Settings panel. See **[Fully Offline / Air-Gapped Install](OFFLINE_INSTALL_GUIDE.md)**.
- **BCF 2.1 export** in the Viewer — one topic per saved Issue.
- 4D: architecture is now installed by its real size, not one flat rate per element, so durations follow
  the size of the work. See
  **[Author the 4D/5D schedule](TimeMachine.md#author-the-4d5d-schedule-build-it-up-from-the-model-live)**.

## 2026-10-13

**ERP / POS**
- **Customer / Vendor RMA** window works through the generic model path.
- **POS order cycle** — six gaps against iDempiere fixed, plus the Info Product search ported.
  See **[ERP User Guide](ERPUserGuide.md)**.

## 2026-10-08

**BIM Viewer — road models**
- **Speed zones** — speed limits derived from ATJ 8/86, coloured zones, a sign list, and the speed number
  painted on each speed-limit sign.
- **Road standards** — sign codes checked against ATJ 2A/85, advance sign placement, roundabout and
  signal-junction approach zones. Open it from the Inspect menu or press `j`.
- **Chainage** is read from the model's own markers: station ribbon, ticks, hover chip and bottom strip.
- **The Road Report** — press `R` on a road model for a dashboard, plus `.txt` and PDF. See
  **[Open Model Check](CivilWorksGuide.md#step-9-open-model-check)**.
- **Cut & Fill overlay** (orange cut, blue fill) and Inspect panels for EW and RW.

See the **[Civil Works guide](CivilWorksGuide.md)** for all of the above.

## 2026-10-07

**BIM Viewer — road models**
- **Long section (profile lens)** and **Profile PDF / PNG**. See
  **[Long section](CivilWorksGuide.md#step-7-long-section-the-road-profile-lens)** and
  **[Profile sheets](CivilWorksGuide.md#step-7a-the-profile-sheets-profile-pdf-and-a-png)**.
- **Cross section** — a real mid-plane cut as a PNG and a Section sheet, with a live draggable popup while
  you scrub. See **[Cross section](CivilWorksGuide.md#step-8-cross-section-a-slice-at-one-chainage)**.
- Signage is priced in the 5D cost (RM 800 per sign, cited to a Selangor 2023 tender).
- No fake city skyline around a road any more.

## 2026-10-06

**BIM Viewer — road models**
- **Earthworks volume** on the ground-works card, in the model check report and on the 4D/5D page. See
  **[Earthworks volume](CivilWorksGuide.md#step-5-earthworks-volume)**.
- **Road film** (Alt+C) is rebuilt: one drive, build-up by half-way, a junction close-up, data cards on
  quiet stretches, and road checks shown as worked formulas, each tagged VALID or SPECULATIVE.
- A road and a bridge now share one civil programme in 4D.
- Open → Merge carries element properties for new elements, and a merge into an already-drawn building
  draws the new rows.

## 2026-10-05

**BIM Viewer — road models**
- **Import** handles large civil models at real size, with civil disciplines and a progress line on the
  status bar.
- **Alt+C highway mode** drives the road at dusk with the lamps on; Fly Tour flies the road junction to
  junction.
- **Time Machine** shows a discipline breakdown for civil models; 5D prices civil items from the JKR
  Schedule of Rates pack.
- **Clash pairs for civil models**, and box-only rows are hidden when a pair has 1000 or more box hits.
- **Measure**: double-click now sizes the whole element — highlight, area, and length × width × height along
  its own axes. See **[Inspect drawer](BIMUserGuide.md#inspect-drawer-measure-clash-x-ray-section-time-machine-4d5d-fly-tour)**.
- A merged scene is one model: reopening streams every building and Find lists all disciplines.

## 2026-10-02

**Modeller**
- **Grid span colours** while you drag a grid line, **Add one more** in one gesture, and a column-derived
  grid for Move Grid. See **[Grid span colours](ModellerGuide.md#grid-span-colours)**.
- **One gesture = one undo** — moving, rotating or scaling with hosted riders (doors, windows) is a single
  undo step.
- **History threads** — the history bar can show a category or element thread and step through it
  (read-only). See **[History](ModellerGuide.md#history-the-slider-is-the-timeline)**.

## 2026-09-24

**BIM Viewer**
- **Alt+S bounce light** is live on desktop with WebGPU, and is also used in the film bake. The still's
  **Close** button now ends the still and returns to the Viewer. See
  **[Sun, sky and shadow while the film records](BIMUserGuide.md#sun-sky-and-shadow-while-the-film-records)**.
- Films use the earlier, brighter fill light again, so interiors are no longer gloomy.

## 2026-09-13

**BIM Viewer**
- **Construction window on the element** — the panel, the hover card and the pill show when an element is
  scheduled to be built. See **[Time Machine](TimeMachine.md)**.

## 2026-09-08

**BIM Viewer**
- **Measure in the film** (Alt+C) — a Measure checkbox adds datum, slab, linear and indoor beats and
  walkable storey cards. See **[Cinema Film-Maker](BIMUserGuide.md#cinema-film-maker-altc-the-bim-ootb-film-maker)**.
- Clash sets, the storey reveal under X-ray and Measure totals now appear in the film's ending.

## 2026-09-06

**BIM Viewer**
- **Triangle-exact clash verdicts** — the bounding-box list was 33.7 % false on Terminal. Each pair now
  shows the true overlap box and the true clash depth. See **[Clash Detection](CLASH_DETECTION.md)**.

## 2026-09-04

**ERP**
- A completed receipt now moves stock.
- The three-way match closes through the real UI (Create From Invoice).
- A **Form** framework with iDempiere's Match form (VMatch) working end to end.
- The clipboard relay is revived.

## 2026-09-03

**ERP**
- **iDempiere field parity** — the five document windows now show the full AD field set (Sales Order
  8 → 56 fields, Payment 4 → 78), with Yes/No and list editors, validation rules on foreign-key
  pickers and whole-row mandatory checks. See **[ERP User Guide](ERPUserGuide.md)**.

**BIM Viewer**
- Large ducts show their outline, not just their shading.
- Gantt edits that would break a link now show a toast explaining the clamp.

## 2026-09-02

**ERP**
- **Signed backup / restore** of the offline database in the app, and an OK dialog after both System
  Monitor resets.

## 2026-08-27

**BIM Viewer**
- The 4D programme is now generated from a **4D template** file — the same task grid drives the Gantt and
  the movie. See **[Author the 4D/5D schedule](TimeMachine.md#author-the-4d5d-schedule-build-it-up-from-the-model-live)**.

## 2026-08-16

**BIM Viewer**
- **Discipline Reveal** in the Film-Maker (**Alt+C**) now flies smoothly back to the start of the
  walk instead of cutting there instantly, orders its discipline-by-discipline parade smallest
  elements first with MEP last, and cross-blends briefly between each discipline instead of
  swapping instantly. See
  **[Discipline Reveal — walk it twice, once dressed, once bare](BIMUserGuide.md#discipline-reveal-walk-it-twice-once-dressed-once-bare)**.

## 2026-08-12

**BIM Viewer**
- **Buildings now cast their real shadow in a recorded film.** The main building and its rooftop plant
  previously cast nothing during a film bake — only the distant skyline did. Shadows now fall correctly
  from the whole model, throughout the sun's noon-to-dusk travel, while the 4D construction reveal runs.
- The Film-Maker's sun/sky/shadow behaviour is now documented — see
  **[Sun, sky and shadow while the film records](BIMUserGuide.md#sun-sky-and-shadow-while-the-film-records)**.
- **Alt+S** (photographic still) and **Alt+J** (optional bounce light) are now listed in the Viewer
  cheat-sheet.

## 2026-07-03

**Modeller**
- Press **`T`** or **`S`** with an element selected to jump straight to the rotate ring or scale cubes,
  without first tapping Move.
- The Outliner now dims non-matching elements on the canvas while you filter, auto-expands to reveal a
  selected row's ancestors, and shows a highlighted outline around whatever's selected.
- Elements now cast real shadows on the canvas.
- A floating readout follows your cursor mid-drag on Move/Scale/Rotate, showing the live delta before you
  release.
- New **BCF 2.1 export** — share your current view and selection as a `.bcfzip` file that opens correctly
  in other BIM tools (Navisworks, Solibri, BIMcollab, Revit, Trimble Connect).

**HBA facilities module**
- **Presence** now reflects real attendance sessions (hours worked, confirmed/unconfirmed) instead of a
  simplified stand-in — see [HR/BIM Asset Guide](HRBIMAssetGuide.md).
- New **BOM pane** — every room's assembly (contained elements + recipe quantities), deep-linking into
  iDempiere's Bill of Materials window.

**ERP / POS**
- New **Kitchen Display** — a live queue of orders waiting to be served, oldest first.
- **Generate Replenishment** is now a staged, reviewable action: generate a suggestion list, edit or
  deselect rows, then confirm — nothing reorders automatically after a sale anymore.

---

*Older changes aren't yet backfilled into this log — check each guide's own content for anything not listed
above.*
