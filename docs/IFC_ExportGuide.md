# IFC Export Guide — for the BIM author

**Who this is for:** the modeller exporting IFC from Revit (or ArchiCAD/Tekla) for delivery into
this pipeline.

**Why it exists:** every number below is measured, on this fleet, from real delivered files. One
project's export (KUL070-SWC-01, a datacentre) produced a 2.0 GB IFC that needed **~19 GB of RAM**
just to open, and failed extraction twice. Another project's model with **1.85× more elements**
(LTU_AHouse, 122,667 elements) opened in **1.8 GB** and has been live for months. The difference was
entirely in how they were exported. Nothing below is a preference — each rule has a measured cost.

---

## The one number that decides everything: entities per element

An IFC is a list of STEP entities (`#1234=IFCFACE(...)`). Every toolchain that reads IFC — ours,
Solibri, Navisworks, any viewer — must hold **all of them** in memory before it can read the first
element. Cost on this fleet: **~520 bytes per entity**.

| model | elements | entities | **entities per element** | RAM to open |
|---|---|---|---|---|
| LTU_AHouse (ARC part) | ~50,000 | 3,527,143 | **~29** | 1.8 GB ✅ |
| KUL CONTAINMENT | 21,009 | 774,041 | **~37** | 0.4 GB ✅ |
| KUL EQUIPMENT | 292 | 26,103,308 | **~89,000** | 12.6 GB ⚠ |
| KUL OVERALL | 66,214 | 37,716,099 | **~570** | ~19 GB ❌ failed |

**Target: under ~50 entities per element.** Above ~200 you are shipping a file that many tools
cannot open at all. The rest of this guide is how to stay under it.

---

## The hard wall nobody warns you about: 4 GB, and it fails *quietly*

Browser-based viewers (ours, and every other IFC viewer built on WebAssembly) run in a **32-bit
address space**. That is a hard ceiling of **4,294,901,760 bytes** — not a setting, not a licence
tier, not something a bigger laptop fixes.

Measured on KUL OVERALL.ifc (2,045 MB), 2026-07-29:

| stage | result |
|---|---|
| parse the file | ✅ succeeds in 17 s — and consumes **~3.4 GB of the 4 GB budget on its own** |
| find the elements | ✅ all **66,214** found, perfectly |
| build the geometry | ❌ dies at element **#3,956** — `Cannot enlarge memory` |
| what the user sees | a building with **3,955 elements** and **no error message** |

**That is the part that matters: it does not crash.** It opens. It renders. It looks like a
building. It is missing **94 %** of the model — including *every single MEP element in the file* —
and nothing on screen says so. A reviewer can sign off on a model that is almost entirely absent.

Two consequences for you as the author:

1. **A file over ~1 GB cannot be delivered as one piece to any browser viewer.** Not "will be slow" —
   *cannot*, structurally. The parse alone eats most of the address space before geometry starts.
2. **Steps 1 and 3 below are what buy the headroom back.** Solids instead of tessellation cuts the
   entity count ~20×; per-discipline export keeps each file's parse cost small enough that geometry
   still has room to build. They are the same fix, from two directions.

For reference, the sibling file exported the right way — KUL CONTAINMENT.ifc, 57 MB — imports
**21,009 of 21,009 elements, zero losses**, from the identical pipeline on the identical machine.

---

## Step 1 — Export SOLIDS, not tessellation ← biggest single win

This is 95.6% of the problem in the KUL OVERALL file:

| entity | count | share |
|---|---|---|
| IFCPOLYLOOP | 9,662,607 | 25.6% |
| IFCFACEOUTERBOUND | 9,568,919 | 25.4% |
| IFCFACE | 9,568,919 | 25.4% |
| IFCCARTESIANPOINT | 7,238,139 | 19.2% |
| **raw triangle soup, total** | **36.0 M** | **95.6%** |

A wall exported as a *solid* is roughly 10 entities (a profile + an extrusion + a placement). The
same wall exported as *tessellation* is hundreds to thousands of faces, loops and points. Same
geometry on screen, two orders of magnitude apart in file cost — and once tessellated, the
parametric intent is gone forever and cannot be recovered downstream.

**Revit → File → Export → IFC → Modify setup:**

1. **IFC Version:** `IFC 2x3 Coordination View 2.0` **or** `IFC 4 Design Transfer View`.
   - ❌ **Do NOT use `IFC 4 Reference View`** — that MVD *mandates* tessellated geometry. It is the
     single most likely cause of a file like KUL OVERALL.
2. Tab **Additional Content** → leave *Export 2D plan view elements* **unchecked**.
3. Tab **Property Sets** → see Step 2.
4. Tab **Level of Detail** → *Level of detail for some element geometry* = **Low**.
   Only affects elements that must be tessellated anyway (sweeps, complex families). Low vs High on
   those can be a 4–8× difference in face count.
5. Tab **Advanced**:
   - ✅ **Export solid models when possible** ← the switch that matters most.
   - ✅ *Use family and type name for reference*
   - ❌ *Use active view when creating geometry* (silently drops anything hidden in that view)

**Special note on manufacturer/vendor families.** KUL EQUIPMENT is 292 elements carrying 8.8 million
triangles — **30,137 triangles per element**, versus 18 for the containment model. That is scanned or
CAD-imported vendor geometry (generators, chillers, switchgear) placed unmodified. It cost **68
minutes** to extract 292 objects. Before placing a vendor family: check its face count, and replace
detailed internals with a simplified representation for anything that is not being fabricated from
this model. A generator needs an accurate footprint and clearance envelope — it does not need its
bolt threads.

---

## Step 2 — Turn off property sets you are not contractually delivering

Measured on KUL CONTAINMENT: **19.4% of the entire file** was property-set machinery —
`IFCPROPERTYSET` 64,974 + `IFCRELDEFINESBYPROPERTIES` 64,973 + `IFCPROPERTYSINGLEVALUE` 20,308.

**Revit → Export IFC → Property Sets tab:**

| option | setting | why |
|---|---|---|
| Export Revit property sets | ❌ **off** | every Revit parameter on every element, mostly internal |
| Export IFC common property sets | ⚠ on only if the BEP asks | Pset_WallCommon etc. — legitimate if required |
| Export base quantities | ❌ off unless doing QTO handover | IfcElementQuantity per element |
| Export schedules as property sets | ❌ **off** | duplicates whole schedules into every element |
| Export only schedules containing 'IFC'… | ✅ on, if the above must stay on | limits the damage |

**Be deliberate, not reflexive.** If the BEP requires asset data (equipment tags, manufacturer,
model, serial, warranty) for FM handover, that data is the *point* of the delivery — keep it. Just
do not ship all 400 internal Revit parameters to get the 6 that matter.

---

## Step 3 — Export per discipline, never one merged federated file

**This is how every model in this pipeline that works was delivered:**

| project | files | largest single file |
|---|---|---|
| LTU_AHouse | **9** (ARC, STR, AIR, DUCT, PLB, COOL, SAN, HEAT, VOID) | 172.9 MB ✅ |
| Hospital | **7** (ARC, MECH, SPR, PLB, ELE, STR, FIRE) | 76.6 MB ✅ |
| Clinic | **5** (Architectural, Plumbing, HVAC, Structural, Electrical) | 53.2 MB ✅ |
| KUL070 | CONTAINMENT ✅, EQUIPMENT ✅, **+ OVERALL ❌** | 2045 MB ❌ |

KUL070 already delivered correct per-discipline files — CONTAINMENT and EQUIPMENT both extracted
clean. Then it *also* delivered OVERALL, a merged superset containing both plus everything else. That
merged file is the only one in the entire fleet that has ever failed to open.

**A federated model is assembled by the receiving tool, not by the sender.** All parts share the
project coordinate system, so they align automatically on import — verified on KUL: CONTAINMENT and
EQUIPMENT report site offsets of `(-2942.6, -14421.4)` and `(-2952.5, -14423.6)`, agreeing to within
10 m, and overlay correctly with no manual registration.

**Rule of thumb: no single IFC over ~250 MB.** If a discipline exceeds that, split it again by
level or by zone/scope box.

---

## Step 4 — Do not export what nobody consumes

Measured non-model payload in KUL CONTAINMENT beyond property sets: **13.6%** was port machinery —
`IFCDISTRIBUTIONPORT` 43,187 + `IFCRELCONNECTSPORTTOELEMENT` 43,187 + `IFCRELCONNECTSPORTS` 19,142.
Ports describe logical MEP connectivity. They are legitimate data — but confirm somebody downstream
actually reads them before shipping 105,516 entities of it.

Also review, in Revit's export options:
- **Export parts as building elements** — off unless parts are the deliverable
- **Export bounding box** — off
- **Export rooms/spaces in 3D views** — on only if room data is required
- **Export linked files as separate IFCs** — ✅ **on** (this is Step 3, enforced automatically)
- Purge unused families/types before exporting

Combined effect on KUL CONTAINMENT of removing property sets + ports + classifications + groups:
**56.7 MB → 31.1 MB, a 45.2% reduction, with zero loss of geometry, materials or placement**
(verified: identical GUID set, identical geometry-hash set, identical transforms).

---

## Step 5 — Check the file before you send it

On any machine with Python and IfcOpenShell:

```bash
python3 DAGCompiler/python/strip_ifc_nonessential.py YOUR_FILE.ifc --stats-only
```

Prints the entity histogram, total entity count, and RAM forecast in seconds — it never parses the
model, so it works on files too big to open. Read the result:

| entities per element | verdict |
|---|---|
| **< 50** | good — send it |
| **50–200** | acceptable; check whether tessellation is being used where solids would do |
| **> 200** | **do not send** — go back to Step 1; a downstream tool will fail to open it |

If the histogram is dominated by `IFCPROPERTYSET` → Step 2. If by
`IFCPOLYLOOP`/`IFCFACE`/`IFCCARTESIANPOINT` → Step 1. If the file is simply large but the ratio is
healthy → Step 3, split it.

---

## Receiving side — what we do when a file arrives anyway

These exist so a bad export is recoverable, not so it is acceptable:

| tool | purpose |
|---|---|
| `DAGCompiler/python/strip_ifc_nonessential.py` | removes data our model never reads. `--tier meta` (property sets/quantities) or `--tier model` (+ ports, classifications, documents, groups, presentation layers, annotations). Streaming, proven lossless. |
| `DAGCompiler/python/split_ifc_by_discipline.py` | splits a merged file into per-discipline parts by reference closure. Bitset-based: ~4.7 MB RAM per part regardless of file size. |
| `DAGCompiler/python/extractIFCtoDB.py` | the extraction itself — native IfcOpenShell, CLI, no browser and no wasm memory ceiling. |

**Neither recovery tool fixes tessellation.** Stripping KUL OVERALL removed only 1.4% of its
entities, because its bulk *is* the triangle soup. Once a model is exported tessellated, the
parametric geometry is gone — the only fix is a re-export from Revit with **Export solid models
when possible** enabled.
