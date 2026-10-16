<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — INTERNAL NOTES: FreeCAD competitive read + interop handoff feature (research only, no code)

```
SCOPE: research/positioning notes only, triggered by a FreeCAD 1.1.2 release-notes read (2026-07-26).
No code changes in this doc. Two parts: (1) where we stand vs FreeCAD's product shape, (2) a spec sketch
for a NOT-YET-BUILT future feature — accept a FreeCAD-authored (or other neutral-format) building as
"outside fine design," snap it onto our substrate, and let our walkers complete the rest.
```

## §1 — Positioning recap (don't duplicate — canonical table already exists)

The real competitive-disclosure table already lives in `docs/ModellerKernelFold.md` (lines ~55-80,
"Capability | BIM OOTB (this work) | Bonsai/IfcOpenShell | FreeCAD"). Two rows matter most for this note:

- **Opens a complete, real, production IFC and edits it in place** — us: ✅, Bonsai: ✅, FreeCAD: *partial*
  (BIM workbench + NativeIFC editing exists, but it's file-linked live editing, not a signed op-log).
- **Dependency graph recovered from real IFC relations** (not a generic parametric-feature DAG) — us: ✅,
  Bonsai: ❌, FreeCAD: ❌. FreeCAD's own Dependency Graph is real but is a *general-CAD feature tree*
  (sketch→pad→boolean within one authored document), not derived from a building's actual IFC relations,
  and carries no delta-based RED/ORANGE conformity gate.

**FreeCAD 1.1.2 itself** (release read 2026-07-26) is a maintenance/security release — XXE hardening,
injection-escaping fixes, crash fixes across Sketcher/BIM/CAM/TechDraw/FEM. Nothing in it changes the
table above. FreeCAD's speed model stays manual feature-by-feature authoring across a broad general-CAD
workbench set; ours stays "open a ready-made twin, let walkers auto-complete the rest of the disciplines"
(`project_modeller_rosettastone_mission` memory, `RESUME_GRAPH_MODELLER_INTEGRATION.md` §VISION-LOCK).
We are not chasing FreeCAD's authoring breadth (Sketcher/PartDesign/CAM/FEM/Assembly) — that's a
deliberately different product category, not a gap to close.

## §2 — FreeCAD's save/export format inventory (verified against FreeCAD/FreeCAD source tree, 2026-07-26)

Extracted from the actual module list (`gh api repos/FreeCAD/FreeCAD/contents/src/Mod/...`), not from
memory or the (bot-blocked) wiki — non-invent, source-traced.

| Format | FreeCAD module | Direction | Notes |
|---|---|---|---|
| **FCStd** (native) | core | R/W | Proprietary zip container (XML doc + BREP shapes). Not a neutral interchange target — never worth parsing directly. |
| **IFC** (IFC2X3/IFC4/IFC4X3 per prefs) | `BIM/nativeifc` (`ifc_openshell.py` — same IfcOpenShell library the wider OSArch ecosystem, incl. Bonsai, uses) | R/W, **live-linked** (NativeIFC: the IFC file *is* the document, edited via IfcOpenShell, not round-tripped through FCStd) | This is FreeCAD's real BIM interchange format and the one to target for handoff — see §4. |
| **STEP / IGES** | `Import` (`ReaderStep.cpp`/`WriterStep.cpp`, `ReaderIges.cpp`/`WriterIges.cpp`) | R/W | Mechanical B-rep interchange — precision solids, no BIM semantics (no IfcWall/storey/etc). |
| **DXF** | `Draft` (`importDXF.py`) | R/W | 2D drafting interchange, natively handled. |
| **DWG** | `Draft` (`importDWG.py`) | **not native** — no DWG parser in FreeCAD at all | Verified from source: `importDWG.py` is a thin shim that shells out to a separate, NOT-bundled external converter binary (LibreDWG, or Autodesk-licensed ODA File Converter/Teigha, or QCAD's `dwg2dwg`), which converts DWG→DXF first; `importDXF.py` then does the real work. If no converter is installed, import fails outright ("No suitable external DWG converter has been found"). DWG stays Autodesk's proprietary format — FreeCAD doesn't reverse-engineer it, it depends on the user separately installing a third-party converter. Not a peer capability to native DXF; corrected here after being stated too flatly in an earlier pass. |
| **SVG** | `Draft` (`importSVG.py`) | R/W | 2D. |
| **DAE (Collada) / OBJ / 3DS / glTF-family mesh formats** | `BIM/importers` (`importDAE.py`, `importOBJ.py`, `import3DS.py`) + `Mesh` workbench | R/W (mesh-tessellated, not B-rep) | Loses parametric/solid precision on the way in — mesh only. |
| **gbXML** | `BIM/importers` (`importGBXML.py`) | R/W | Energy-analysis interchange, not geometry-authoring. |
| **SH3D (Sweet Home 3D)** | `BIM/importers` (`importSH3D*.py`) | R | Residential-furnishing tool interop, niche. |
| **JSON / SHP / WebGL** | `BIM/importers` | R/W (varies) | Misc/niche exporters. |
| **BCF** | *not in FreeCAD core* | — | No native BCF module found in `src/Mod/BIM` or repo-wide grep. Community add-ons exist (opensourceBIM's FreeCAD-BCF), but it is **not shipped in core** the way our own `bcf_export.js` (BCF 2.1, `.bcfzip`, shipped 2026-07-03, `project_modeller_competitive_polish` memory) is a first-class, in-product feature. This is a real, cite-able edge for us, not hype. |

**Bottom line for interop targeting:** IFC is the only format on this list that is (a) a neutral standard,
(b) carries real BIM semantics (storeys/walls/openings/relations — the thing our graph-recovery needs),
and (c) is FreeCAD's own mature, native, live-linked export path. STEP/DXF/mesh formats are all
lossy-of-semantics for this purpose (geometry without the IFC relational graph our conformity/walker
pipeline depends on). **Any "accept outside fine design" feature should target IFC in, not FCStd or STEP.**

## §3 — Our own current interop state (what exists today, verified against `~/bim-ootb/modeller/`)

- **Export**: `bonsai_ifc.js` — op-log → real IFC4 file via web-ifc. Honest scoped subset by the file's own
  header comment: wall/opening geometry + voids relation; Psets/materials/owner-history/full spatial
  containment are deliberately dropped. Has `reimport(bytes)` — re-reads its **own exported bytes** to
  prove a round-trip (used by the W-KERNEL-WEBIFC witness), NOT a general "open any IFC" path.
- **Export**: `bcf_export.js` — real BCF 2.1 `.bcfzip`, own STORE-method zip writer, Info-ZIP-validated,
  real extracted IfcGuids only (W-E2E-BCF 7/7).
- **Import**: the Modeller's "Open" (📂) loads **`extracted.db`** — our own compiled artifact (already
  IFC-extracted + BOM-graph-built by the Java/JS compiler pipeline), not a raw external IFC file. There is
  currently **no path that accepts an arbitrary third-party IFC** (FreeCAD-authored or otherwise) and turns
  it into an editable ARC substrate. This is the actual gap the user's "future feature" question is asking
  about — confirmed absent, not assumed.

## §4 — Future feature sketch: accept outside fine design → snap to our substrate → walkers finish it

**NOT BUILT. Spec sketch only**, written so a future session doesn't have to re-derive the shape from
scratch. Follows the project's existing architecture rather than inventing a new one — the walker system
was already designed to fill in "everything not ARC" (`project_modeller_vision_lock` item 4: "every
non-ARC discipline = a WALKER that FILLS the ARC space"), so an externally-authored ARC shell is not a new
mechanism, it's a new *entry point* into the same pipeline.

**Intended shape (three stages, each reusing an existing seam):**

1. **Generalize `reimport()` into a real "Open external IFC" import.** Today it only re-parses bytes this
   same module just wrote. The web-ifc read path underneath it doesn't care about provenance — the work is
   relaxing the caller's assumption ("this file came from our own export") and mapping arbitrary
   IfcWall/IfcOpening/IfcSpace/etc. entities from a THIRD-PARTY file (e.g. FreeCAD BIM workbench's IFC4
   export) into the same in-memory op-log/feature shape our own compiler pipeline produces. Sizing unknown
   until scoped — flag, don't estimate here.
2. **Run the SAME graph-recovery + conformity gate on the imported building as on our own `extracted.db`.**
   `ArcEditable.gmAudit()` / the geomapping-confidence layer (`docs/ModellerKernelFold.md` §2's "Dependency
   graph recovered from real IFC relations") is what makes a building *walkable*, not just displayable. An
   imported foreign IFC must pass through this exact step — treat it as **unverified until it clears
   RED/ORANGE**, the same first-open audit discipline the project already applies to its own extractions.
   This is also the honest answer to "can we trust hand-authored geometry" — we don't special-case trust,
   we gate it the same way as everything else (non-invent, measured not assumed).
3. **Once graph-recovered and signed, hand off to the existing walker chain — no new code needed here.**
   STR/MEP/4D/5D/ERP already "crawl RouteWalk against the ARC" regardless of where the ARC came from
   (vision-lock's own framing: "open a bare ARC → it completes itself"). If stage 2 lands cleanly, stage 3
   is not a build item — it's the walker architecture doing exactly the job it was already built for.

**Recommended user-facing framing, if/when built:** *"Do your fine joinery/precision authoring in FreeCAD
(Sketcher/PartDesign/Arch), export IFC, open it here — our walkers auto-complete structure, services, and
scheduling around it."* That's a genuine complementary-tools story (their authoring precision + our
completion speed), not a feature-parity chase.

**Open items, not decided/sized here (next session scopes them, doesn't invent answers):**
- How much of FreeCAD's IFC export (Psets, materials, storey containment — richer than our own scoped
  export subset) do we actually need to READ vs. can safely ignore on import?
- Does a foreign import get the SAME "ARC = sole editable substrate" treatment, or does it need its own
  provenance flag surfaced in the Outliner (so a user can tell "this ARC came from FreeCAD, not our
  extraction pipeline") — leans toward yes, for the same non-invent transparency reason geomapping
  confidence is surfaced today, but this is a design call for whoever picks this up.
- Test target for a first witness: export a small FreeCAD BIM-workbench sample (e.g. one of their own
  tutorial houses) to IFC4, import it here, confirm STR/MEP walkers fire on it the same way they do on
  Terminal/SC — that would be the RosettaStone-style proof for this feature.

## §5 — Aside: is FreeCAD's DWG converter (LibreDWG/ODA/QCAD) something we could adopt? (researched, not pursued)

Raised in-session: since FreeCAD's DWG support is just a shim to an external converter (§2 table), could
*we* use the same converter to gain DWG capability? Researched, verified by license — **only one of the
three is actually free/open; the other two are dead ends for us:**

| Converter | License | Verdict for us |
|---|---|---|
| **LibreDWG** | GPLv3+ (GNU project) | Only genuinely open option of the three. |
| **ODA File Converter** (Teigha) | Proprietary. Free download, but free use is **non-commercial only**; commercial redistribution requires a paid ODA membership (capped at 100 copies per tier). | Not redistributable by us without paying ODA. |
| **QCAD's `dwg2dwg`** | Paid QCAD Professional add-on — and it just wraps the same ODA/Teigha library underneath. | Same dead end as ODA, repackaged. |

**LibreDWG has two real caveats, not a slam dunk:**
1. **GPLv3 vs. our MIT license, and we're browser-deployed.** FreeCAD is a desktop app shelling out to a
   locally-installed binary — clean separation, no license contamination. We'd have to compile LibreDWG to
   WASM and ship it client-side to get the same capability in a browser. That's legally workable as a
   *separate* GPL module bundled alongside our MIT JS (same pattern as other GPL-WASM bundling in the wild)
   but the WASM-linking GPL boundary isn't fully settled case law — flag for a real license check before
   ever shipping it, don't assume it's clean.
2. **It only buys 2D drafting geometry, no BIM semantics.** LibreDWG reads DWG entities, not
   IfcWall/storey/relations. It would not feed the §4 walker-handoff pipeline — DWG/DXF import is a
   separate, lower-value interop path (a 2D drawing) from full-building IFC import.

**Verdict: not worth pursuing DWG specifically.** §6 below found we don't even need to — DXF (no GPL, no
external converter, already fully in our own toolchain) covers the same "professional CAD interop" need
that prompted this detour, and DXF is what FreeCAD, AutoCAD, and QCAD all read natively without any
converter at all. DWG only matters if a counterparty insists on that exact proprietary extension, which
is a real-world possibility worth remembering but not worth building for pre-emptively.

## §6 — DXF: we already have real export, but NOT from the Modeller's live 3D Grid editor

Checked directly (2026-07-26) rather than assumed, since DXF looked promising after §5 — **the honest split
is two separate subsystems, easy to conflate:**

- **`2D_Layout/python/drawing_writer_dxf.py` is real and already built** (4541 lines, not a stub) — writes
  professional DXF from the **compiled `output.db`** using `ezdxf` (Python, **MIT-licensed** — confirmed via
  search, no GPL/proprietary-converter tangent needed at all, unlike DWG). Ships AIA-standard layers
  (`A-WALL-FULL`, `A-GRID`, `A-ANNO-DIMS`, etc.), real DIMSTYLE/LTSCALE, model-space mm coordinates — the
  file's own docstring explicitly targets **"open in FreeCAD, QCAD, AutoCAD, LibreCAD"**. `2D_006_dxf_output.txt`
  (now in `prompts/done/`) + `OPEN_ISSUES.txt`'s closed I-41 confirm it passed an ezdxf audit (0 errors).
  There's also **DXF read tooling already**: `dxf_read_positions.py` + `dxf_to_svg.py` in the same folder
  (position-extraction scope, not full BIM-graph reconstruction — but real, existing code, not a gap).
- **This is an OFFLINE Python pipeline over the compiled DB snapshot** — `output.db`/`extracted.db` →
  section-cut (`section_cut.py`) → floor-plan/elevation views → DXF/SVG. It runs *outside* the browser.
- **The Modeller's live 3D Grid editor (browser JS) has NO DXF export at all** — confirmed by grep, zero
  `dxf` hits anywhere in `~/bim-ootb/modeller/*.js`. Its only export paths are `bonsai_ifc.js` (IFC4) and
  `bcf_export.js` (BCF 2.1), per §3. So **"as we home in via the 3D Grid editor, do we export to DXF
  anyway" is NO for the live editing session** — the DXF capability that exists lives in a different,
  disconnected subsystem (offline Python, not the signed op-log the Modeller edits live).
- **Also worth flagging: DXF is inherently 2D.** Even if wired into the Modeller, "3D Grid editor → DXF"
  would really mean *projecting/sectioning* the live 3D state into a 2D floor-plan/elevation (exactly what
  `section_cut.py` already does from a static DB) — not a native 3D export of the whole building. Don't
  let "we have DXF" get conflated with "we have a 3D interchange format" — IFC still owns that role (§2/§4).

**So where DXF actually helps, concretely:**
1. **It's the safer near-term interop win over DWG** — same "opens natively in FreeCAD/AutoCAD/QCAD" value
   §5 was chasing, zero license risk (`ezdxf` is MIT, not GPL), and we already have working read+write code
   for it — nothing to build from scratch, unlike the LibreDWG-WASM detour.
2. **It does NOT replace the §4 IFC-import feature.** DXF read only gets 2D drafting geometry back, no
   IfcWall/storey/relations for the walker chain to crawl. It's a good fit for a narrower, real use case —
   "user hand-refines a 2D detail/plan in FreeCAD and we round-trip that drawing" — not for "accept a whole
   outside-authored building and let our walkers complete the rest," which still needs IFC (§4).
3. **Genuinely open item, not decided here:** whether the Modeller's live 3D Grid editor should gain its
   OWN DXF export (new client-side JS work, projecting live op-log state to 2D) versus just pointing users
   at the existing offline `2D_Layout` pipeline for DXF deliverables (already works, zero new code, but
   requires a compiled `output.db` snapshot rather than the live in-browser session). Flag for whoever picks
   this up — don't default to "build it in the Modeller" without weighing the already-working offline path.

Resolved below (§7) into a two-tier spec, following the same install-unlocks-more framing raised in this
session — see §8/§9 for the real, tested groundwork that makes Tier 2 concrete rather than aspirational.

## §7 — SPEC (NOT BUILT): DXF export for the 3D Grid editor, two tiers

Scoped 2026-07-26, in response to the open item above. Two tiers, not one design, because the two paths
have genuinely different fidelity/dependency tradeoffs and both are real, reusable options — pick one to
build first, don't assume it's an either/or.

### Tier 1 — client-side, zero-install, honestly-scoped (same pattern as `bonsai_ifc.js`/`bcf_export.js`)

Follows the project's own established precedent: both existing Modeller exporters are **hand-rolled,
dependency-free, deliberately scoped** client-side writers (`bonsai_ifc.js`'s own header: *"HONEST SCOPE:
geometry envelope + wall/opening shell + voids relation... dropped by design"*; `bcf_export.js` is its own
STORE-method zip writer, no library). DXF should follow the same shape, not reach for an npm dependency.

1. **Section-cut algorithm: port, don't invent.** `2D_Layout/python/section_cut.py` already has a *proven*
   mesh-slicing pipeline — `slice_mesh(vertices, faces, cut_z)` → `chain_segments()` → `classify_contour()`
   — real geometric slicing of tessellated mesh data at a Z-plane, not a "walls are already flat profiles"
   shortcut (checked the actual source before assuming the simpler shape — it's genuinely more general than
   that, handles roofs/slabs/any mesh, not just prismatic walls). The Modeller already holds every element's
   live THREE.js mesh (vertices/faces) in memory — arguably an EASIER data source to slice than
   `section_cut.py`'s path of deserializing blob columns from a DB, since there's no blob-parsing step at
   all client-side. Port the three functions above from Python to JS operating on `THREE.BufferGeometry`.
2. **DXF writer: minimal ASCII, hand-rolled.** DXF is an openly-documented, text-based format (unlike DWG —
   §5) — a minimal writer emitting `HEADER`/`TABLES`(layers)/`ENTITIES` sections with `LWPOLYLINE` per
   contour is a bounded, well-precedented task (this is literally what `drawing_writer_dxf.py` already does
   with `ezdxf`, just without the library — same output shape, no dependency). Model-space mm, matching
   `drawing_writer_dxf.py`'s own convention (`§14` — no paper-scale factor, DXF handles scale via DIMSCALE).
3. **Honest scope for v1, stated up front (don't silently under-deliver):** floor-plan cut only (one Z per
   storey, mirroring `section_cut.py`'s own `cut_z`/`storey_name` params), ARC substrate only (matches
   "ARC = sole editable substrate" — vision-lock item 1), no AIA layer taxonomy / no DIMSTYLE / no
   dimension annotations in v1 — geometry-only LWPOLYLINEs on a small fixed layer set. This is the same
   scoping discipline as `bonsai_ifc.js`'s IFC subset, not a shortcut unique to this feature.
4. **Available to every user, no install required** — this is the tier that keeps DXF export inside the
   project's "runs fully client-side" identity (`docs/ModellerKernelFold.md`'s own disclosure table row).

### Tier 2 — self-hosted only, full professional fidelity, reuses the 4541-line pipeline as-is

This is the concrete version of the user's own framing this session ("letting users install our app, they
can get this to work from their machines") — grounded against the REAL, now-tested self-host mechanism in
§8, not a hypothetical installer.

1. **Don't duplicate `drawing_writer_dxf.py` — call it.** It already ships AIA layers, real DIMSTYLE/LTSCALE,
   JKR logo/legend template support, and passed its own ezdxf audit (§6). Tier 1's port is deliberately
   thin; this tier is where full professional fidelity actually lives, and rebuilding that in JS would be
   pure duplication of proven, working code — against the project's own reuse discipline.
2. **The self-host installer (§8) already guarantees Python3 is present** on the user's machine (the DIY
   script installs it via `winget` on Windows, requires it up front on Mac/Linux) — currently used ONLY to
   run a dumb `python3 -m http.server` static file server. Extending that local Python process with one
   small local endpoint (e.g. a `BaseHTTPRequestHandler` route, no new framework needed) that accepts a
   POSTed DB snapshot and shells out to `drawing_writer_dxf.py`, returning the resulting `.dxf` bytes, turns
   "install our app" into a genuine capability unlock — mirrors the EXACT pattern already shipped for ERP
   agents (`about_diy.js`'s own doctrine: *"the browser cannot reach your DB/Docker, so you run a small
   agent natively"*) — same shape, new capability, not a new architecture.
3. **DB snapshot source: reuse Save, don't invent a second exporter.** The Modeller already has a proven
   fold path from live op-log → physical DB (`A._exportBuildingDb`, `W-SAVE-FOLD` witness, per
   `MODELLER_SAVE_COMPLETEIT.md`). Tier 2's "export DXF" button is: run that same fold → POST the resulting
   DB bytes to the local endpoint → download the returned DXF. No new serialization format.
4. **Pure browser / GH-Pages / PWA users see this feature as install-gated** (button present, tooltip
   "requires Run it yourself (DIY) — see About"), not silently missing — same honest-affordance pattern the
   project already uses for other install-gated capabilities.

**REVISED (2026-07-26): reframed, not rejected — Tier 1 = Part 1 (ship first), Tier 2 = Part 2 (advanced,
offered only to already-convinced/self-hosting users).** Full Part 1/Part 2 installation strategy is the
user's own explicit direction this session, recorded canonically in `prompts/ABOUT_BOX_CONSOLIDATE.md`
`§2026-07-26 STRATEGY` (that doc owns installation strategy; this doc owns the DXF feature spec — don't
duplicate the reasoning, read it there). Short version as it applies to this feature:

1. **Tier 1 is the Part-1-appropriate version** — client-side, zero install, matches the project's own
   "runs fully client-side" edge (`docs/ModellerKernelFold.md`), ships with no dependency on the self-host
   mechanism being fixed first. This is what ships for the wow-moment.
2. **Tier 2 is real Part 2 material, not a bad idea** — full AIA-layer/DIMSTYLE fidelity via the proven
   4541-line `drawing_writer_dxf.py`, reached through a local Python bridge once a user is ALREADY
   self-hosting (Part 2, by definition, is for the convinced/invested). It should NOT be built before Part 1
   is solid, and Part 1 solid means `mesh.db`-over-LFS-zip is fixed first (§8/`ABOUT_BOX_CONSOLIDATE.md`
   Part 2 audit) — building Tier 2 on top of a self-host mechanism that doesn't yet reliably deliver real
   geometry would be building Part 2 on a cracked Part 1 foundation.
3. **Python doesn't disappear from the project either way** — `drawing_writer_dxf.py` keeps serving its own
   persona (professional CD-set deliverables from the compiler's `output.db`) regardless of whether Tier 2
   ever gets built. Tier 2 was always an optional bridge between two personas, not a requirement.

**Build order:** Tier 1 (Part 1) first, always. Tier 2 (Part 2) is legitimate future work, sequenced AFTER
`mesh.db`/`bonsai_kernel.js` are fixed (Part 1 hygiene) — not rejected, just correctly ordered. Neither tier
is built; this section remains a spec only.

## §8 — Installer / self-host: MOVED to its canonical spec, `prompts/ABOUT_BOX_CONSOLIDATE.md`

Housekeeping correction (2026-07-26): the installer/self-host mechanism (`~/bim-ootb/common/about_diy.js`)
already has its own canonical spec — cited in that file's own header comment — with dated audit sections
tracking exactly this kind of finding. The live-test writeup that was here has been moved there
(`§2026-07-26 AUDIT PART 3`) instead of duplicated across two docs. Read it there for the full findings;
short version relevant to §7 below:

- **A real download→serve→headless-Chromium-load test was run end-to-end** (first execution witness for
  this flow — a prior 2026-07-22 audit in that file had flagged none existed). Landing shell boots fine.
  One new bug found: `index.html:180` references `viewer/bonsai_kernel.js`, 404s — real file is at
  `modeller/bonsai_kernel.js`. Not fixed (found via a scratch test, not the shared checkout).
- **⚠ Important correction to what "self-host works" means — a MORE SERIOUS pre-existing bug applies:**
  that same canonical doc's `§2026-07-22 AUDIT PART 2` already found that `modeller/mesh.db` (115MB, the
  shared geometry for ALL 8 Modeller buildings) is Git-LFS-tracked, and GitHub's zip-archive endpoint
  (exactly what the installer downloads) does **not** resolve LFS pointers. **Today, self-hosting gives you
  every Modeller building with structure/metadata but NO real mesh geometry — silent, no error.** My
  2026-07-26 test never caught this because it only checked landing-page boot, not an actual building load
  — that gap is explicitly still open per the canonical doc, not resolved by this session's testing.

**This directly bears on §7 Tier 2 below — see the revised recommendation.**

## §9 — IFC importer with merge capability: checked live 2026-07-26 — it exists, is wired, and PASSES

Flagged this session as "not checked, was the major intent." Checked for real rather than assumed clean or
assumed broken — **the code is live on `origin/main` and a real end-to-end witness passes**, which
contradicts the standing assumption that this was still stale/unlanded (the resurrect spec,
`prompts/LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md`, was written 2026-07-05 against a genuinely stale branch
— but the functionality has since landed through some other path; the stale branch itself no longer even
exists on the remote).

**Confirmed present, current `~/bim-ootb` `origin/main`:**
- `import_own.js:604` + `viewer/import.js:267` — real `importMultiIFC(files)`: N dropped IFC files → one
  merged building record (concatenated elements/geometries/transforms), including a real georef-rebase
  federation frame fix (`§GEOREF_REBASE`, dated in-code to a 2026-07-12 fix — i.e. actively maintained since
  the resurrect spec was written, not abandoned) and a site-identity correction pass. Wired into both
  `index.html` and `modeller/modeller.html`.
- `modeller/save_catalog.js` — the `{meta, versions:[], latestVersion}` per-project shape from the resurrect
  spec is live.
- **The name-similarity "merge as a new version" popup from `LANDING_VERSION_MERGE_PROMPT.md` is ALSO
  built** — `_findSimilarProject()`/`_confirmVersionMerge()` in `import_own.js`, gated behind the exact
  "strip a trailing version-ish suffix" rule that spec flagged as an open design call (`_stripVersionSuffix()`).

**Ran the real end-to-end witness just now, not just confirmed the code exists:**
`tests/witness_landing_version_merge_e2e.js` — real headless Chromium, real `<input type=file>` drop
events, real IndexedDB (no mocked functions). 4 sequential drops on one catalog: baseline import → similar
stem (`_v2` suffix) → popup → ACCEPT → merges into version 2 → different building → new separate record →
similar stem again (`_final` suffix) → popup → DECLINE → new separate record, original left untouched.
**Result: `§E2E_RESULT pass=true`, exit 0.** Final state matched exactly: merged record has
`versions=2 latestVersion=1`; declined drop created a separate `exists=true versions=1` record without
touching the first.

**Bottom line:** the "major intent" — drop your own IFC(s), even multiple, even as new versions of an
existing building, no card/list UI — is real, live, and just re-verified with fresh evidence, not
inherited-on-trust from an old spec file. Nothing to build here; this section exists so the next session
doesn't re-open a spec that already shipped.

## §10 — SPEC (NOT BUILT): a "blank building" landing entry for open-your-own (IFC/DB now, DXF/OBJ later)

User's ask this session: the buildings landing page should offer a blank/no-building entry into the Viewer,
whose sole purpose is opening the user's own file — scoped to **IFC/DB only for now**, DXF/OBJ explicitly
deferred (§7's DXF work doesn't need to be done first, but full DXF *import* is a separate, larger effort
than §7's export spec and OBJ import isn't scoped anywhere yet — don't conflate the three).

**Grounding against what already exists (don't design from scratch):**
- The landing app-shell (`prompts/LANDING_APP_SHELL_SPEC.md` §7/§8) already has a **`Sample.db` section**
  ("curated/hosted buildings, as-is list") and a separate **`Open` pill** (`folderOpen` — "re-open a saved
  `.db` + bulk import-all-from-disc + Merge/New — **NO chooser card**", per that spec's own table). The
  no-card constraint is load-bearing across this whole area (§9's resurrect spec: card/list UI was
  dropped for a security-perception reason and must not reappear in any form) — a "blank building" entry
  must respect the same constraint: ONE tile/entry point, not a picker surface.
- §9 confirms `importMultiIFC()` + the Open pill's import-from-disc path are real and live — a blank-canvas
  entry doesn't need new import machinery, it needs a new **navigation entry point** that lands on the
  Viewer with nothing pre-loaded, where the already-existing Open pill / drop-zone is immediately visible.
- **Simplest-consistent shape:** add one additional tile in the `Sample.db` list section (alongside the
  curated buildings), labeled distinctly (e.g. "Blank — bring your own"), that navigates straight to
  `viewer.html`/`modeller.html` with no `?db=`/`?building=` param — same viewer chrome as any other open
  building, just nothing loaded, Open pill and drop-zone already live. No new merge/open logic — 100% reuse
  of §9's already-proven import path.

**RESOLVED (user confirmed 2026-07-26): "DB" = our own compiled `.db` format.** Not a raw third-party
IFC-derived DB — so this does NOT tie into §4's still-NOT-BUILT third-party-IFC-import gap. The Open pill's
existing import-from-disc path already handles this format; a blank-canvas entry needs zero new import
logic, only the navigation entry point below. §4 (accept an outside FreeCAD/etc. IFC) stays a separate,
larger, still-unbuilt future item — don't conflate the two just because both start with "open a file."

**Still open, not decided here:**
- Viewer or Modeller as the blank-canvas destination — the user's "opens up the viewer" phrasing suggests
  `viewer.html`, but check whether the 3D Grid editor (Modeller) is meant to be reachable the same way, or
  whether Viewer-first-then-promote-to-Modeller is the intended flow (matches "ARC = sole edited substrate,
  open a whole building" framing elsewhere, but a genuinely blank canvas has no ARC to open into yet — this
  needs a real decision, not a default).
