# DXF2BIM — prior art: what is new, what we learned, and what using others costs
*[← Back to the **2D Drawings → BIM guide**](DXF2BIMGuide.md) · [The yellow list](DXF2BIM_Yellow_List.md)*

*Researched 2026-10-18 from vendor and project pages (links below). Search was limited: no patent or academic-literature search was done, and **we have not run any of these tools on our drawings**, so there is no head-to-head benchmark here. Vendor claims are the vendors' own. Prices are list prices seen on the dates of the pages and change; verify before relying on them.*

## 1. What already exists

| Tool | What it does with a 2D CAD set | What the user prepares | Fee / licence (as found) |
|---|---|---|---|
| **WiseBIM AI** (Revit add-in) | Turns a 2D plan into Revit **walls, doors, windows and slabs** in its first release. Takes DWG, DXF, PDF, JPEG, TIFF, PNG. ([AEC Magazine](https://aecmag.com/news/ai-generates-revit-models-from-2d-plans), [Architosh](https://architosh.com/2024/05/wisebim-ai-from-2d-plans-to-revit-bim-models/)) | Set the drawing **scale**; set parameters: which elements to detect, wall height (from the level or a default), window sill and opening height, door height, slab thickness. Walls are mandatory. | Add-in listed at **$49 / month** on the [Autodesk App Store](https://marketplace.autodesk.com/apps/ecaecc60-e0de-452d-8ccf-88c96dbe6486), **plus Revit** (about **$3,005 / year** single-user annual per third-party price pages such as [Renderahouse](https://www.renderahouse.com/blog/revit-pricing); other sites list lower or older figures). |
| **ARCHLine.XP Blueprint** | Generates a BIM model from DWG floor plans; filters the drawing and looks for patterns it can identify as walls, doors and windows. The vendor puts recognition for CAD drawings at **90–95 %** and warns that patterns such as pergolas can mislead it. ([ARCHLine.XP help](https://help.archlinexp.com/hc/en-us/articles/21074468259089-Generating-Walls-on-CAD-Files), as quoted in search results; the page itself was not retrievable) | Not stated in what we could read. | Not found. |
| **CYPE** (IFC Builder, CYPE Architecture) | Automatic conversion of DXF/DWG templates into **walls, partitions and floor slabs**. ([CYPE](https://info.cype.com/en/new-feature/automatic-generation-of-3d-bim-models-from-dxf-dwg-drawings/)) | Prepare DXF/DWG as templates. | Needs the extra **"Automatic entry" licence module**; the page gives no price. |
| **Revit / ArchiCAD (manual trace)** | The standard route: the CAD set is linked and **traced by hand**. (Our own research note, `RESEARCH_2D_TO_3D_APPROACHES.md`.) | A modeller's time. | Revit as above. |
| **CrossBIM** (open source, student project) | Structural categories only (columns, beams, slabs, footings); user types layer name + dimensions per category into a web form; output IFC4 through Xbim. We read the source: the DXF and IFC core is a prebuilt DLL with no source in the repository, no licence file, no provenance, no gap report. ([CrossBIM](https://github.com/AMostafaH/CrossBIM)) | Layer name and dimensions per category. | Free to look at; no licence file means no stated right to reuse. |
| **IfcOpenShell / Bonsai** | Open BIM toolkit and Blender add-in. The DXF script in [IfcOpenShell issue #1950](https://github.com/IfcOpenShell/IfcOpenShell/issues/1950) maps lines, arcs, circles and polylines to IFC curves only: **no walls, no extrusion, no heights**. | Scripting. | **LGPL-3.0** (most components); Bonsai is **GPL-3.0** ([repository](https://github.com/IfcOpenShell/IfcOpenShell)). |
| **ezdxf** | Python DXF reader/writer. **MIT**. DWG only through the external ODA File Converter. ([ezdxf](https://github.com/mozman/ezdxf)) | Scripting. | Free. |
| **Open Design Alliance Drawings SDK** | The commercial way to read **DWG** natively. | Integration work. | Annual membership: **Commercial $3,000 first year / $2,250 renewal** (limited commercial use; the FAQ ties it to fewer than 100 copies of the end-user product per year), **Sustaining $7,500 / $4,500** (unlimited distribution, web/SaaS), **Founding $37,500 / $18,000** (source code). If the subscription ends, the right to distribute ODA-based products ends. ([ODA pricing](https://www.opendesign.com/pricing.md), [FAQ](https://www.opendesign.com/faq/question/how-can-i-join-open-design-alliance-and-use-your-sdks.md)) |
| **co2tools** | DXF → STL extrusion per part from a YAML config; manufacturing panels, no IFC. ([co2tools](https://github.com/Mambix/co2tools)) | A YAML file. | Free. |

## 2. What we do that we have not found elsewhere

*"Not found" means not found in this search, not "does not exist".* Each item is something you can check in the tool.

1. **No guessing, and the gaps are the product.** A value the drawing does not state is a visible **yellow** setting with its basis ([the yellow list](DXF2BIM_Yellow_List.md)), never a silent default. The vendor tools above apply default heights and thicknesses at generation; ours records which ones were applied, how sure the source is (**std** or **guess**), and keeps your overrides **inside the drawing set** as markings.
2. **Provenance on every body.** Each element carries the sheet, the entity handle, the layer and how each size was obtained (drawn, derived, assumed). It survives into the IFC (`Pset_Dxf2Bim`) and the database.
3. **Deterministic, no AI on your drawings.** Same drawings, same markings, same model, byte for byte; no recognition rate to quote because nothing is recognised by a model. The price is that you state the few facts a drawing cannot.
4. **Proof against an answer key.** The Duplex was written to a standard 2D set and rebuilt within 1 mm of the source model (96 wall pieces, 2 slabs, 1 roof, 14 doors, 22 windows). Where there is no 3D model (the shed), the rebuilt model is written back to 2D and compared with the original sheets: columns, grid lines and doors within 0.02 mm. We do not claim this for "any DXF".
5. **The settings travel in the DXF itself** (layer `DXF2BIM-MARK`, plain text), so the file stays an ordinary DXF in any CAD program. No sidecar.
6. **Structure sets from typed layers, with evidence tint.** Columns, footings, beams, wall panels, fans, nets, door swings and truss bars are built from layers you type; derived and assumed bodies can be shown amber and red.
7. **Zero install, in a browser, MIT.** The reader, the Modeller, the Viewer and the 4D/5D page run in a browser tab; the output is an IFC4 file plus a database the Viewer opens directly.
8. **One chain to cost and schedule.** The same database opens in the Viewer and on the 4D/5D page (estimates, stated as such).

## 3. What we learned from others

| From | What we took | What we did differently |
|---|---|---|
| **WiseBIM AI** | The user must fix the **scale** first and give default heights, sill, thickness per class. | Units are **confirmed by you** (the file header is shown, never applied by itself); the defaults are a registry of 41 listed settings, not parameters buried in a dialog. |
| **ARCHLine.XP Blueprint** | Pattern recognition meets limits (the vendor warns about pergolas). | We chose not to recognise: a layer name is not evidence, so **you type what each layer is**. |
| **CYPE** | Treat the DXF as a **template** and keep a separate module for it. | Our reader is one module set, MIT, not a paid add-on. |
| **CrossBIM** | The simplest honest tables: **layer → dimensions per category**, typed by the user. | Readable source, provenance, gap reporting; the tables live in the DXF, not a web form. |
| **IfcOpenShell issue #1950** | A 2D drawing mapped to **curves** is easy and unhelpful; the missing pieces are extrusion and heights. | Heights come from elevations and stated ranges; where nothing states one, a listed default. |
| **ezdxf** | A mature DXF writer is worth reusing: our Python reference writer (the oracle for the standard 2D set) uses it. | The browser path has its own small DXF writer, checked entity-for-entity against the Python one. |
| **ODA** | DWG is a separate, paid problem. | We ask for **DXF** (a Save As in BricsCAD or AutoCAD); we never read DWG. |
| **Our own Rosetta Stones** | A building is certified by placing every element at the **same coordinates** as a reference. | Tiers: vocabulary, placement (1 mm), integrity, and a compositional tier for buildings with no reference (the shed). |

## 4. What using others would cost, against ours

| Route | Money | Effort you carry |
|---|---|---|
| **Revit + WiseBIM AI** | about $3,005 + $588 per year (Revit annual + add-in at $49 × 12), at the prices above | Scale, detection parameters, then **fixing the model by hand** (the vendor does not state an accuracy figure). Walls, doors, windows, slabs only. |
| **Revit/ArchiCAD manual trace** | the Revit subscription above | the longest: a modeller traces everything |
| **ARCHLine.XP Blueprint or CYPE module** | not found / extra module, price not published | prepare the template; correct misrecognised patterns |
| **Build your own on ODA** | **$3,000 first year, $2,250 renewal** (Commercial, limited use), up to $7,500 / $4,500 for web distribution | all of it: you write the building logic; the SDK only reads the file |
| **Build your own on ezdxf + IfcOpenShell** | $0 licence (MIT, LGPL-3.0) | all of the building logic, plus LGPL obligations if you ship it |
| **This pipeline** | **$0**, MIT | state the facts in [the yellow list, part A](DXF2BIM_Yellow_List.md): units, set name, level, datum, which layer is what, heights nothing draws, areas to leave out; review the listed defaults |

**Read the table as orders of magnitude, not a quote.** Our effort is real: on the shed it took stating the facts once (about nine typed layers, five datums, two ranges, one exclusion) and reviewing nine yellow defaults. What the others save you in typing they spend in guessing, and what they ask in fees we do not ask.
