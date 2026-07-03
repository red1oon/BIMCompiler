# DAGeVu Modeller — User Guide
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*

DAGeVu is a **browser BIM authoring surface** that sits beside the read-only viewer. You don't edit a
dead file — every action (drop a component, cut a window, route a duct, move a wall) is **one signed
operation** folded into a verifiable hash-chain. The 3D you see is a pure *fold* of that operation log,
so **every edit is exact, reversible, and provable** — never invented. The same signed-log engine drives
the Kernel-ERP.

**Open it:** [red1oon.github.io/bim-ootb/viewer/modeller.html](https://red1oon.github.io/bim-ootb/viewer/modeller.html)
(desktop — the B-rep kernel is heavy). The **Home** pill returns to the Matrix landing.

> **Every tool on this page is proven by a real-user, end-to-end test** — the tool is driven through the
> production path with real mouse/keyboard and the result checked by numbers (the op-log, the scene graph,
> the pixels), not by eye. **The screenshots are real frames captured from those test runs** — nothing here
> is a mock-up.

---

## The big idea — open a building and edit it

Don't draw a model up from a blank grid. **📂 Open** a real building's **ARC** (architectural) model — its
*digital twin* — and edit *that*. The other disciplines and dimensions aren't re-drawn; they **follow**:
structure, MEP, the 4D schedule, the 5D cost and the ERP auto-complete by *crawling* against your ARC
(the **Walk** tools), and every edit and every follow is one signed operation the enterprise folds from.

<svg viewBox="0 0 820 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The modelling inversion: open a ready ARC twin, edit it, and the rest auto-completes from one signed op-log." style="max-width:100%;height:auto;font-family:system-ui,-apple-system,sans-serif">
  <rect x="0" y="0" width="820" height="320" fill="#fbfcfe"/>
  <text x="20" y="28" font-size="16" font-weight="700" fill="#1b2b3a">Open a ready ARC twin · edit · the rest auto-completes</text>
  <g font-size="12" fill="#16324a">
    <rect x="20" y="70" width="170" height="74" rx="8" fill="#e9f2fb" stroke="#3f78b5" stroke-width="1.5"/>
    <text x="105" y="98" text-anchor="middle" font-weight="700">📂 Open extracted.db</text>
    <text x="105" y="116" text-anchor="middle">the ARC twin</text>
    <text x="105" y="134" text-anchor="middle" fill="#5b6473">(real building, verbatim)</text>
    <rect x="232" y="70" width="170" height="74" rx="8" fill="#e9f2fb" stroke="#3f78b5" stroke-width="1.5"/>
    <text x="317" y="98" text-anchor="middle" font-weight="700">Edit the ARC</text>
    <text x="317" y="116" text-anchor="middle">move · cut · insert · grid</text>
    <text x="317" y="134" text-anchor="middle" fill="#5b6473">each a signed op</text>
    <rect x="444" y="70" width="170" height="74" rx="8" fill="#eef6ee" stroke="#5a9e5a" stroke-width="1.5"/>
    <text x="529" y="98" text-anchor="middle" font-weight="700">Followers crawl</text>
    <text x="529" y="116" text-anchor="middle">Walk · RouteWalk</text>
    <text x="529" y="134" text-anchor="middle" fill="#5b6473">STR · MEP regenerate</text>
    <rect x="656" y="70" width="144" height="74" rx="8" fill="#eef6ee" stroke="#5a9e5a" stroke-width="1.5"/>
    <text x="728" y="98" text-anchor="middle" font-weight="700">Auto-complete</text>
    <text x="728" y="116" text-anchor="middle">4D · 5D · ERP</text>
    <text x="728" y="134" text-anchor="middle" fill="#5b6473">the live twin</text>
  </g>
  <g fill="#3f78b5" font-size="20" font-weight="700">
    <text x="201" y="113">→</text><text x="413" y="113">→</text><text x="625" y="113">→</text>
  </g>
  <rect x="20" y="178" width="780" height="44" rx="8" fill="#1b1d23"/>
  <text x="410" y="199" text-anchor="middle" font-size="13" font-weight="700" fill="#dce6f4">ONE signed op-log</text>
  <text x="410" y="216" text-anchor="middle" font-size="11.5" fill="#aab4c4">every edit &amp; every follow is a signed fact — model · structure · MEP · 4D · 5D · ERP all fold from it</text>
  <text x="20" y="250" font-size="12" fill="#16324a" font-weight="700">Why it's faster</text>
  <text x="20" y="270" font-size="11.5" fill="#5b6473">Speed — you start complete (a real building), not a blank canvas.   ·   Completion — open a bare ARC and the rest fills itself in.</text>
  <text x="20" y="288" font-size="11.5" fill="#5b6473">Reuse — the real building is the substrate; you edit batches, never reconstruct.   ·   Trust — a verified twin, so editing starts from truth.</text>
  <text x="20" y="310" font-size="10.5" fill="#8a93a0">Open = ARC only (the single editable substrate). Structure / MEP / 4D / 5D / ERP are shown but derived — they regenerate against your ARC edits.</text>
</svg>

---

## The workspace

![The modeller workspace: the Outliner (left) over the BOM tree, the ARC building on the grid, the ⋯ pill toolbar down the right edge, and the history scrubber along the bottom](img/modeller/workspace-open.png)

- **Outliner** (left) — the BOM tree of the opened building (`Building → Level → Room → ARC → element`), plus the **Walk** rows and a live **find** filter. Collapse it with its chevron to free the canvas.
- **Canvas** (centre) — the 3D building on the construction grid. Click an element to select it; **Shift-drag** marquee-selects many. Elements cast real shadows onto each other and the ground, so massing and floor-to-floor relationships read correctly at a glance — not a flat, shadowless render.
- **Pill toolbar** (right edge) — an icon rail. Tap **⋯** (bottom-right) to fan the pills open; hover a pill for its name; **? Help** lists every tool + shortcut. `Esc` cancels any active mode.
- **History scrubber** (bottom) — the signed op-log *is* the timeline. Drag it to travel through every edit. The status line beneath it echoes what each op did (e.g. `scaled #183 X ×1.50  verify=true`).

**How to read it:** the op-log is the model, the 3D is a fold of it, and the slider is the single honest
retreat across every tool below.

---

## Getting started — your first five minutes

1. **Open the app** — [red1oon.github.io/bim-ootb/viewer/modeller.html](https://red1oon.github.io/bim-ootb/viewer/modeller.html)
   (desktop; the B-rep kernel is heavy). Tap **⋯** at the bottom-right to fan the pill toolbar open.
2. **Open a building** — tap **📂 Open** and pick a resident building (e.g. *Duplex*). Its **ARC** model loads
   onto the grid and its BOM tree fills the Outliner on the left. You're now editing a real building, not a
   blank canvas.
3. **Frame it** — press **`F`** (or tap **Fit**) to zoom the whole building into view.
4. **Select something** — click an element (a wall, a door). It highlights; the status line names it.
   **Shift-drag** to marquee-select many.
5. **Do one edit** — tap **Move**, drag an axis arrow, and release. Watch the status line print the signed op
   (e.g. `moved #142 Δ(0.50,0.00,0.00)  verify=true`). That edit is now one fact in the op-log.
6. **Undo it** — drag the **history scrubber** (bottom) one notch left. The edit reverses exactly, because the
   3D is a pure fold of the log. Drag right to redo.

That's the whole loop: **open → select → tool → commit → scrub**. Every tool below is a variation on it. Press
**? Help** any time for the live list of pills and shortcuts, or **`Esc`** to cancel a mode.

---

## Outliner — find, focus, and manage what's shown

The Outliner is more than a tree of rows — it's the fastest way to find an element and control what the
canvas shows, especially on a large building.

- **Click a row** to select that element and fly the camera to it — this works even for a row with no
  direct canvas widget of its own; it flies to the element's real position, not a fallback toast.
- **Selecting anything expands its ancestors automatically** — you never have to manually drill down
  through Building → Level → Room to see where a selected element sits in the tree.
- **The selected element gets a highlighted outline** on the canvas, in addition to the existing status-line
  name — easier to spot on a busy, similarly-coloured floor.
- **Type in the find filter** and the tree narrows to matches — everything that doesn't match **dims** on
  the canvas too, so filtering the list and seeing where those elements actually are happen together.
- **Toggle the eye icon** on any row to hide or show that element (and its children) on the canvas without
  deleting it — useful for looking inside a wall or floor you'd otherwise have to work around.
- The tree stays responsive on large buildings — rows render only as you scroll near them, so opening a
  building with thousands of elements doesn't stall the panel.

---

## Assemble & draw

### Insert — assemble from the catalog
*Commits `GEOM_INSERT`.*

The fastest way to build is to **assemble, not draw**.

1. Tap **Insert** (the cube pill) to open the **BOM catalog** on the left.
2. Search or filter (**All · Structure · Openings · Furniture · Sets**), then click a **component** — or a whole **Set** (an assembly that drops its entire recipe at once).
3. Aim on the grid (press **R** to rotate, set **Elev** for storey height) — a ghost previews the landing — then **click** to place.

![The Insert catalog armed — a component picked, ghost preview following the cursor on the grid](img/modeller/insert-catalog.png)

The component lands as one signed `GEOM_INSERT` (a LOD-200 box that lazily refines to its real library
mesh). An assembly drops as one grouped op of *N* seated, oriented parts — a door takes its host wall's
facing automatically. Undo removes it exactly.

![After the click — the component placed on the grid as a signed operation](img/modeller/insert-placed.png)

### Sketch → Extrude — draw a wall
*Commits `GEOM_EXTRUDE_POLY` (a real occt B-rep solid).*

1. Tap **Sketch** and click **≥3 points** on the grid to lay a closed profile.
2. Set the **depth**, then tap **Extrude**.

![Sketch — a closed profile laid on the grid, ready to extrude](img/modeller/sketch-profile.png)

The solved polygon is swept to depth and committed as one signed operation.

![Extrude — the profile pushed into a B-rep wall solid](img/modeller/sketch-wall.png)

### Route → Sweep-Run — lay a run / duct
*Commits `GEOM_SWEEP`.*

1. Tap **Route** and click **≥2 points** to lay a spine.
2. Set the **profile** size, then tap **Sweep-Run**.

![Route — a poly-line spine laid across the grid](img/modeller/route-spine.png)

The profile is swept along the spine (an occt pipe) as one signed op — the way MEP runs are authored.

![Sweep-Run — the profile swept along the spine into a run](img/modeller/route-run.png)

### Cut — open a wall
*Commits `GEOM_CUT` (a child of the selected wall).*

1. Click a wall to **select** it.
2. Tap **Cut** — a window void is derived from the wall and subtracted.

![Select the wall to open](img/modeller/cut-select.png)

The opening shows immediately; undo closes it to the exact original frame. (Cutting a seeded ARC wall
promotes its measured box to a B-rep just-in-time, so the subtraction is exact — never approximated.)

![Cut — a signed opening void subtracted from the wall](img/modeller/cut-open.png)

### Fillet — round a solid's edge
*Commits `GEOM_FILLET`.*

1. Select a B-rep solid and tap **Fillet** — its edges become pickable markers.
2. Click an edge (or several), set the **radius**, then tap **Apply**.

![Fillet — the solid's edges shown as pickable markers](img/modeller/fillet-edges2.png)

The picked edge is rounded in place (the wall's triangle count grows exactly where the round lands); undo
restores it.

![Apply — the picked edge rounded](img/modeller/fillet-rounded.png)

---

## Transform

Select an element and tap **Move** to raise the **transform gizmo** — the shared handle for moving,
scaling and rotating.

![The transform gizmo on a selected element — XYZ arrows (move), cube handles (scale), yaw ring (rotate)](img/modeller/gizmo.png)

While you drag any handle, a **floating readout** follows your cursor showing the live delta (distance
moved, scale factor, or degrees turned) — the same number the status line prints on release, just visible
mid-drag instead of only after.

### Move
*Commits `GEOM_MOVE {dx,dy,dz}`.*

1. Select an element to raise the transform gizmo.
2. Drag an **axis arrow** (X/Y/Z, grid-snapped) — or nudge with the arrow keys for a free move.
3. Release to commit. A moved host **drags its hosted fillings** (a door rides its wall); undo is exact to the micron.

![Move engaged on a selected element — dragging the X arrow moves it on that axis only (the commit is X-only, exact, reversible)](img/modeller/move-gizmo.png)

### Scale
*Commits `GEOM_SCALE {fx,fy,fz}`.*

1. Select a single component to raise the gizmo.
2. Drag a **cube handle** to stretch that axis — it's edge-anchored, so the opposite face stays put.
   The preview follows the element's own **local axes** (not the world grid), so a rotated element
   previews and commits identically — no snap-back or mismatch on release.
3. Release to commit. The rendered extent grows by exactly the committed factor (the status line reads the signed factor).

![Scale — dragging the cube handle stretched the element; the status line reads the signed factor](img/modeller/scale-stretched.png)

### Rotate
*Commits `GEOM_ROTATE {drot}`.*

1. Select an element to raise the gizmo.
2. Drag the yellow **yaw ring** to spin the selection about its centre — 15° snap, hold `Shift` for a free angle.
3. Release to commit. The rendered footprint turns by exactly the committed angle.

![Rotate — the yaw ring spins the element in place](img/modeller/rotate-yaw.png)

### Keyboard-arm a handle (`T` / `S`)

With an element selected, press **`T`** to arm the rotate ring or **`S`** to arm the scale cubes directly
— no need to first tap Move and then find the right handle. Arming is a pure affordance: the armed handle
lights at full opacity while the rest of the gizmo dims, and dragging it commits through the exact same
`GEOM_ROTATE`/`GEOM_SCALE` path as clicking the handle normally would. Press the same key again (or `Esc`)
to disarm. `R` is reserved for Insert, so it doesn't arm anything here.

### Grid-Stretch
*Commits `GEOM_GRID_MOVE`.*

1. Tap **Move Grid**.
2. Drag a **gridline**.
3. Release to commit. Walls attached to that line **recompose** — a span stretches, an attached wall translates — as one signed operation.

![Before — a wall spanning two gridlines](img/modeller/gridstretch-before.png)
![After — dragging the gridline stretched the attached wall by exactly the drag distance](img/modeller/gridstretch-after.png)

### Delete
*Soft-deletes from the signed log (reversible).*

1. Select the feature — its children (hosted fillings) come along.
2. Tap **Delete** (or press `Del`).
3. The feature hides from the model — the signed payload is never rewritten, so the chain stays valid. **Redo** (`Ctrl+Y`) brings it back exactly.

![Delete — the selected feature removed; Redo restores it](img/modeller/delete-gone.png)

---

## Generate — walkers fill the ARC

When you open a bare **ARC** building, the other disciplines *fill themselves in*. You pick a discipline
that is **absent** — Structure, Electrical, Fire-Protection, Plumbing, HVAC — and the modeller **walks**
it: it places that trade's elements at the **measured cadence** of a real coordinated building, chains the
runs it can, gates the clashes, and **honestly refuses** when the building has nothing to hang the trade
on. Nothing is invented — every placement uses a spacing/clearance rule *mined from a real IFC model*.

![Walk · ELEC — the walker placed 267 electrical fixtures across the Duplex at the measured residential cadence](img/modeller/walk-fixtures.png)

**One engine, two standards.** A single walker drives every discipline; the discipline is just a data
filter. It carries two measured rule-sets and auto-selects by building class:

| Building class | Standard used | Mined from | Why |
|---|---|---|---|
| House / residential (SampleHouse, Duplex, SampleCastle) | **residential** (`duplex_rules.db`) | the Duplex's *own* real MEP — 908 elements | tight residential cadence (~0.5 m trade separation) |
| Large / complex (airport, hospital) | **large-complex** (`terminal_rules.db`) | a real airport terminal | sparse, plenum-scale cadence |

On open you'll see `§DW-PROV` print the standard and its provenance, so you always know which rule-set is
driving the walk. The tables below are the **evidence** that the walk produces sensible numbers — every
figure traces to a witnessed `§`-log (no estimates).

![SampleCastle opened as its bare ARC twin — the largest of the residential-class buildings the tables below cover, 7 storeys / 3225 elements, real per-element geometry (dormers, window frames, skylights), before any walk](img/modeller/samplecastle-arc-open.png)

### What a walk actually places

Status-line results per discipline on the three residential buildings
(`build/logs/witness_disc_walk_generalize.log`). *Placed* = elements seated; *chains* = runs linked
end-to-end; the note is what the walk reported when a trade had nothing to route:

| Building (storeys) | Discipline | Placed | Chains | Honesty note |
|---|---|---:|---:|---|
| **SampleHouse** (3) | Fire-Protection | 55 | 0 | — |
| | Electrical | 159 | 0 | — |
| | Structure | 30 | 1 | members linked, no measured gap |
| | Plumbing | 6 | 0 | ~no pipes in a small house → honest |
| **Duplex** (5) | Fire-Protection | 303 | 0 | — |
| | Electrical | 771 | 0 | — |
| | Structure | 162 | 1 | members linked |
| | Plumbing | 10 | 0 | sparse → honest |
| **SampleCastle** (7) | Fire-Protection | 2 665 | 0 | — |
| | Electrical | 8 123 | 0 | — |
| | Structure | 1 836 | 1 | members linked |
| | Plumbing | 14 | 0 | sparse → honest |

Counts scale with footprint because the **cadence is constant** — the same measured spacing tiles a bigger
floor. Walking an *unknown* discipline returns **REFUSE — no measured rule** rather than guessing.

### Why the right standard matters — clash collapse

The walk gates clashes between the fixtures it placed. Using the **right** standard for the building class
collapses the phantom clashes a mismatched (too-wide) standard would raise — same layout, only the
clearance standard changes (`witness_disc_walk_duplex_generalize.log`, gated irreducible residual):

| Building | Residual @ large-complex standard | Residual @ residential standard | Collapse |
|---|---:|---:|---:|
| SampleHouse | 9 | **4** | 56 % |
| Duplex | 32 | **2** | 94 % |
| SampleCastle | 501 | **3** | 99.4 % |

Every residual is **flagged, none silent** — the walk never hides a clash to make the number look good.

### Does the residential standard reproduce a real house's MEP?

The residential standard was mined from the Duplex's own MEP, so the acid test is whether it *re-grows*
that MEP (`witness_duplex_rules.log`, `§DXM-RT`):

| Discipline | Verdict | What it means |
|---|---|---|
| Plumbing | ✅ **GREEN** (4/4 classes) | the bulk of a house's MEP reproduces — segments 0.93, fittings 0.85 |
| Electrical | 🟡 **WEAK** | fixtures (n = 89) GREEN; the sparse 8-segment conduit is honestly WEAK |
| HVAC | 🔴 **RED** (n = 2) | a house has ~no ductwork — honest RED, *not* a failure |

RED/WEAK here are **honesty**, not breakage: a single-family house genuinely has almost no ducting, so the
walk declines to fabricate it.

### Does it generalize to a building it never saw?

We routed the residential rules (mined from the Duplex) onto held-out buildings and scored each against
*that building's own pipes* (`witness_generalize_curve_*.log`, `§GC`). Precision is the **don't-fabricate**
score: of the joins the walker drew, how many land on a real pipe touch.

| Building | Type | In/out of domain | Segments | Precision @0.15 m | Fabricated |
|---|---|---|---:|---:|---:|
| Duplex *(self-consistency ceiling)* | house | — | 358 | **0.969** | 0 |
| **LTU_AHouse** | house | **in-domain** | 32 138 | **0.839** | 0 |
| WBDG_Office | office | out-of-domain | 2 241 | 0.749 | 0 |
| Clinic | healthcare | out-of-domain | 4 906 | 0.705 | 0 |
| HHS_Office | office | out-of-domain | 1 380 | 0.620 | 0 |

The model **degrades gracefully** and never collapses. On **every** building **0 joins were fabricated** and
**0 exceeded the gap bound**. An ARC-only building with no pipes routes **0**, never a guess.

### Seed-Trunk — route a service trunk

After walking a discipline, route its **service trunk** from a real entry.

1. In the Outliner, open the **Route trunk** row for the walked discipline.
2. A popup offers the real service **entry** elements (doors / stairs) — confirm the default or choose one.
3. Tap **Route ▶**.

![Route trunk — choose the service entry (a real door / stair) from the popup, then Route ▶](img/modeller/seedtrunk-entry.png)

A corridor-aware trunk is routed from that entry through the walked fixtures — around walls, through real
doors, up risers between storeys.

![The routed corridor trunk over the walked ELEC fixtures](img/modeller/seedtrunk-trunk.png)

> **Deeper proof.** The full mining, round-trip, boundary and generalization analysis lives in the resume
> cards `prompts/RESUME_DX_MEP_RESIDENTIAL_STANDARD.md`, `RESUME_TERMINAL_RULE_MINING.md` and
> `RESUME_DISC_WALKER_ENVELOPE_BOUND.md`, each backed by the witnessed `build/logs/` set summarised above.

---

## History — the slider *is* the timeline

- Drag the **history scrubber** back to undo, forward to redo — it scrubs the signed op-log and re-folds the
  geometry deterministically. It is a strict superset of the keyboard shortcuts.
- **`Ctrl+Z`** undo · **`Ctrl+Y`** (or `Ctrl+Shift+Z`) redo · **`Del`** delete selection · **`F`** fit · **`Esc`** cancel mode · **`R`** rotate a pending insert.
- Every retreat is exact because the geometry is a pure fold of the log — there is no separate "undo buffer"
  to drift out of sync.

---

## Share an issue — BCF export

Tap the **BCF** pill to export your current view as a **BCF 2.1** file (`.bcfzip`) — the open
buildingSMART format for exchanging issues between BIM tools. The export carries your live camera
viewpoint and the real `IfcGuid`s of whatever's selected, so the file opens correctly in Navisworks,
Solibri, BIMcollab, Revit (via plugin), or Trimble Connect — never a synthetic ID that only means
something inside this app. See [Clash Detection §8.5](CLASH_DETECTION.md#85-bcf-export) for exporting a
whole batch of detected clashes as one topic set.

---

## Toolbar — icon index

The toolbar is a **⋯ pill rail** at the right edge: tap **⋯** to fan the pills, hover for a name, and open
**? Help** for the live registry (icon · name · shortcut). `Esc` always cancels the current mode.

| Icon | Does |
|------|------|
| **⋯ Toolbar** | Fan the pills open / closed |
| **? Help** | Toolbar & shortcuts — the live pill registry |
| **Home** | Back to the Matrix landing |
| **Fit** | Zoom to fit — the selection, or the whole scene (`F`) |
| **Iso** | Cycle the view: Iso ⇄ Top |
| **Grid** | Show / add a construction grid |
| **Move Grid** | Drag a gridline — attached walls recompose (`GEOM_GRID_MOVE`) |
| **Move** | Transform gizmo — move / scale / rotate the selection (`M`) |
| **Sketch** | Start a 2D sketch |
| **Extrude** | Push a sketch profile into a solid (`GEOM_EXTRUDE_POLY`) |
| **Axis** | Set the constraint intent the solver enforces on the sketch |
| **Cut** | Cut an opening in the selected wall (`GEOM_CUT`) |
| **Route** | Lay a spine to sweep a profile along (e.g. an MEP run) |
| **Sweep Run** | Sweep the profile along the route (`GEOM_SWEEP`) |
| **Fillet** | Round a selected solid's picked edges (`GEOM_FILLET`) |
| **Apply** | Commit the pending fillet / chamfer |
| **Insert** | Insert a library component — assemble, don't draw (`GEOM_INSERT`) |
| **LOD 200** | Refine the selected component's level of detail (same signed row) |
| **IFC** | Export the authored model as IFC4 |
| **Undo / Redo** | Undo (`Ctrl+Z`) · Redo (`Ctrl+Y`) |
| **Delete** | Delete the selection (`Del`) |
| **Clear** | Empty the scene |
| **Sound** | Toggle authoring sound feedback |
| **Connect** | Connect Scene — share selection / timeline with the Viewer & ERP (opt-in) |

---

## Troubleshooting

Each row below is a real behaviour the tool suite exercised (and, where it was a defect, fixed) — not a
hypothetical. If you hit something else, **? Help** lists every tool and shortcut, and the history scrubber is
always a safe retreat.

| Symptom | Why | What to do |
|---|---|---|
| **A pill looks stuck in the top-left corner** and won't click | A mode-revealed pill (Extrude, Sweep-Run, Apply) is shown only after you start its mode; the rail lays them out on reveal. | Start the mode first (e.g. finish the Sketch before reaching for **Extrude**). The rail re-positions the pill as it appears — if one still looks stranded, toggle the **⋯** rail closed and open. |
| **Cut / Scale seems to do nothing on a wall from an opened building** | A seeded ARC wall is a *baked* box, not a B-rep. Cut promotes it to a B-rep just-in-time so the subtraction is exact; a rotated/non-box insert is refused up-front (logged) rather than approximated. | Nothing to do for a normal axis-aligned wall — the op commits and renders. If a specific insert is *refused*, it isn't box-like enough to cut exactly; sketch the void instead. |
| **A Walk seems to hang on a big building** | A discipline walk places hundreds of fixtures; they commit as **one batched signed group**, so a large walk takes a couple of seconds, not a frozen minute. | Wait for the batch — the status line reports the result when it lands (e.g. `ELEC — 267 placed across 5 storeys · 0 routed`). Scrub the slider back to clear them. |
| **I want to "make an opening" but there's no Opening tool** | Opening is not a separate authoring tool — the real "cut a window/door" is the **Cut** tool (`GEOM_CUT`). | Select the wall, tap **Cut**. `GEOM_OPENING` is only a legacy sample primitive, never a user action. |
| **Fillet won't pick an edge** | Fillet needs a **B-rep solid**; a seeded ARC insert has no worker edges to round. | Author a solid first (Sketch → Extrude), select it, then **Fillet** — its edges become pickable markers. |
| **An edit didn't land the way I expected** | Every edit is a signed op; nothing is silently applied. | Drag the **history scrubber** back one notch to undo it exactly, then retry. There is no separate undo buffer to drift out of sync. |

---

## Collaborate on the design — the Teams overlay

The Modeller shares **one signed op-log** with the Viewer and the Kernel-ERP, so the same **Teams overlay**
rides on it: git-style **design branches** ("you build that wing, I build this"), a **spatial merge gate**
that flags where two branches clash, identity-coloured **who-dots** on elements, and the tabbed Outliner
(Tree / Chat / Dashboard). Off by default, pixel-identical until you toggle it on.
→ **[Teams Overlay guide (with screenshots)](TeamsOverlayGuide.md).**

---

*Part of [BIM OOTB](USER_GUIDE.md). Copyright (c) 2025–2026 Redhuan D. Oon. MIT Licensed.*
