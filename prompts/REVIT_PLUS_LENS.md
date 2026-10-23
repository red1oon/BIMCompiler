# ⚠ DO NOT REMOVE — Find "Lens" capability: Type-leaf isolate + data-gated Room/Material/Phase lenses (Eye icon)
# SCOPE: turn the Find panel into a faceted isolator. (1) The existing Discipline/Storey → Type tree
#   leaf, when tapped, ISOLATES (hides the rest) — no new data needed. (2) A re-extraction lane makes
#   material_name + IfcSpace survive into served DBs so the richer lenses have real data. (3) A side
#   "Lens" affordance (👁 Eye icon) appears ONLY for lenses whose data is truly present (probed at DB
#   load): Room, Material, Phase. Main toggle STAYS 2 (Storey | Discipline) — never grows, no clutter.
# STATE (2026-06-04 session 2) — Tasks 1-4 LANDED on the deploy/dev BACKUP (NOT yet ported to bim-ootb,
#   NOT deployed). Engine = UNIFY (filterByGuids). DESIGN PIVOT (user): the lens is NOT a separate 👁 chip —
#   it FOLDED INTO the toggle as a data-gated AXIS ROW: Storey · Discipline · Room · Material · Phase
#   (optional axes show only when their data is present; #find-outliner-bar built by _renderAxes()). Counts
#   (SQL COUNT) show on every group. Done + render-tested (no §BBOX_KEEP) + specs green (40: 4/4, 41: 3/3):
#   - TASK 1 Type-leaf → isolate (W-LEAF-ISOLATE): leaf tap refreshes item list AND isolates. §FILTER 427/695/1122.
#   - TASK 2 DATA: served Duplex = OCI bim-ootb-full geometry (renders, 80 distinct vtx sizes) + grafted
#     spatial_structure/rel_contained_in_space (21 rooms/61 rel) + material_name (98/1122, 15) from /tmp/duplex_ref.db
#     + room bbox (center/size per IfcSpace via scripts/extract_room_bbox.py). NOTE: extract.py --to reference
#     gives BBOX/cube geometry — NEVER use it for render geometry (it produced uniform cubes; reverted).
#   - TASK 3 ROOM lens = highlight room volume box (cyan THREE.Mesh at bbox) + X-RAY the rest (A.toggleXray);
#     tap room → brighten. MATERIAL/PHASE also highlight+xray (not isolate). §ROOM_LENS/§ROOM_SELECT/§MAT_SELECT.
#   - TASK 4 PHASE = REAL TM generator: window.tmGenerateTimeline (exposes injectGantt) → kernel_ops, group by
#     parameters.phase in construction order, lazy+cached. §PHASE_LENS gen=real source=kernel_ops phases=6.
#   - RATES → JSON: deploy/dev/rates/sequence_rules.json (SEQUENCE_RULES/LABOR_RATES/SEQUENCE_DEFAULT, verbatim);
#     rates.js loads it w/ sync hardcoded fallback (§RATES_JSON loaded=json rules=49); export_5d.js reads it.
# OPEN FOLLOW-UPS (next session): (a) Settings-editor registration of sequence_rules.json — the editor +
#   _jsonRegistry live ONLY in bim-ootb/viewer (NOT this backup); do it there. (b) Strip rate_per_day MONEY out
#   of sequence_rules.json → money belongs in the locale cost packs rates/*.json (USD=rsmeans, RM=cidb); keep
#   sequence_rules.json currency-free (phase + productivity only). (c) Cost/qty-in-Find in USD (rsmeans pack) —
#   AFTER rates.JSON registered. (d) Port all of the above into bim-ootb/viewer to actually deploy. (e) Phase/
#   Material highlight is BATCH-level outline on Duplex BatchedMesh (xray-dim is per-element); element-precise
#   outline needs new machinery. (f) Room "all rooms highlighted" uses bbox boxes (room mesh not in served DB).
# NON-NEGOTIABLE: NON-INVENT — a lens appears ONLY when its query returns rows; never a fake/empty lens.
#   Whitebox-first: the §-log line is the value proof, Playwright only drives/captures (docs/TestArchitecture.md
#   §Browser Testing). Read the log after every run. Every claim names a witness.
# READ FIRST: docs/RevitParity.md §A1/§A2 (the spec — UPDATE it as you build) · deploy/dev/navigate_find.js
#   (the tree: _buildStoreyTree/_buildDiscTree, the leaf onTap, the isolate bar) · deploy/dev/panels.js
#   (filterByGuids / listRooms / isolateRoom / filterStorey / filterDisc) · scripts/extract_per_building.py
#   (the slicer that DROPS spatial_structure + rel_contained_in_space — line ~64-86) · tools/extract.py
#   (--to reference: captures IfcSpace→spatial_structure:510, containment→rel_contained_in_space:598) ·
#   memory/reference_playwright_stale_server.md (why specs "never boot" here: kill stray :8080 server;
#   drive DB from the OCI landing-page URL) · tests/specs/40-find-isolate.spec.js (the witness pattern).

---

## THE SEAM (what's free now vs what needs data)

Measured on the served Duplex (1122 elements): **only Storey, Discipline, Type have data.**
`material_name` = 100% null · `material_rgba` = 86% null · `storey` = "Unknown" for 976/1122 (all MEP) ·
`tasks`/`task_elements` tables = EMPTY (4D is *generated* by Time Machine, not stored) · no `spatial_structure`.
The source IFC HAS the dropped data: 18 materials / 92 element→material assocs, 21 IfcSpace. So Material and
Room are an **extraction fix, not a caching trick** — and ONE re-extraction recovers BOTH.

---

## TASK 1 — Type leaf → isolate (HERE, no new data) · Witness W-LEAF-ISOLATE
The Disc→Type and Storey→Type tree leaves already render with counts. Today the leaf onTap runs a *search*
(`elType.value=…; runSearch()`). Change it to **isolate**: build the GUID set for that type (reuse the
existing `applyIsolate`/`_isolateGuidSet` path, or call `A.filterByGuids` directly) so tapping `IfcDoor`
hides everything else.
- **W-LEAF-ISOLATE:** tap a Type leaf → `§FILTER visible=<n> hidden=<m> total=<n+m>`, n = that type's count.
- Keep "Show all" reset working; close/open/mode-toggle still clears (already wired).

## TASK 2 — Re-extraction lane (the data gate) · Witness W-REEXTRACT  [parallel-safe: Python only]
The served `*_extracted.db` are sliced by `scripts/extract_per_building.py`, which creates only
elements_meta/element_transforms/element_instances/surface_styles — it never carries the room tables, and
material is lost upstream.
- Make `spatial_structure` + `rel_contained_in_space` **survive** into the per-building DB (copy them in the
  slicer; ensure the sandbox carries them, or graft from a fresh `extract.py --to reference` pass).
- Make `material_name` **non-null per element** (the source has 92 IfcRelAssociatesMaterial; carry the
  primary material name onto elements_meta).
- **W-REEXTRACT:** re-extracted Duplex reports `§REEXTRACT rooms=21 mat_nonnull=<n>/1122 guid_match=<all>`;
  `rel_contained_in_space.element_guid` ⊆ `elements_meta.guid` (already proven 61/61 for rooms).
- Honest caveat to log, not hide: room containment is SPARSE (~61/1122 — furnishings; walls/MEP are
  storey-contained in IFC). Surface an "(unassigned)" bucket; do NOT imply rooms are near-empty.

## TASK 3 — Lens affordance (👁 Eye icon, data-gated) · Witness W-LENS-PROBE / W-LENS-ISOLATE
Main toggle stays `[ Storey | Discipline ]`. At DB load, **probe** each candidate lens (does the query
return rows?). For each present lens, render an Eye-icon chip to the side (use a Lucide eye SVG, matching the
`_micSvg`/`_searchSvg` pattern in navigate_find.js). Plain building → no chips. Rich building → chips pop in.
- Lenses: **Room** (`spatial_structure` + `rel_contained_in_space`), **Material** (`elements_meta.material_name`),
  **Phase** (Task 4). Room/Material are plain `GROUP BY` → branch list → tap group → `filterByGuids` isolate
  (Room reuses `A.isolateRoom`; Material = isolate elements of that material_name).
- **W-LENS-PROBE:** `§LENS_PROBE room=<bool> material=<bool> phase=<bool>` — chip count == true count;
  NO chip for an absent lens (the non-invent guarantee, witnessed).
- **W-LENS-ISOLATE:** tapping any lens group → `§FILTER` reconciles visible+hidden=total.

## TASK 4 — Phase lens = Time Machine on tap · Witness W-PHASE-LAZY
Phase is NOT stored — Time Machine *generates* the timeline. Tapping the Phase lens shows status
**"timeline in progress…"**, lazily runs TM's existing generator (do NOT precompute on load), then groups by
the generated phases. Tapping a phase isolates its elements AND hands off to the TM Gantt.
- **W-PHASE-LAZY:** `§PHASE_LENS gen=lazy status="timeline in progress" phases=<k>` — generation fires on
  tap, never at load. (Confirm the TM handoff target with the user — Gantt-focus vs isolate-only vs both.)

## ENGINE DECISION — DECIDED 2026-06-04: UNIFY (user go)
Unify ALL lenses+toggles onto the one `filterByGuids` isolate (retire filterStorey/filterDisc — cleaner,
strip-not-add). Regression risk on shipped Storey/Disc behavior → MUST gate with a witness when Task 3
lands. Bolt-on rejected (two visibility mechanisms). Apply when Task 3 starts.

## DEPLOY / TEST
Localhost only until EXPLICIT GO. Whitebox §-log first; extend tests/specs/40-find-isolate.spec.js (boot via
the OCI landing-page URL or kill the stray :8080 server first — see memory ref). `node tests/audit_specs.js`
must not add violations. Update docs/RevitParity.md §A1/§A2 as built.

---

# APPENDIX — This session's ideas (RESUME the "Revit+" talk here after the tasks land)

The tasks above are the *bounded build*. The wider conversation that produced them — to pick up next:

- **The "Revit+" story** — our kernel/DOM lets us GROUP BY any axis instantly, isolate, and share as a URL:
  Revit's organization PLUS axes it can't give. Use "Revit+" as PITCH SHORTHAND ONLY ("Revit" is an Autodesk
  trademark — do NOT ship it as a UI label). UI label = **"Lens"** (project's existing `project_lens_family`).
- **Engine unify vs bolt-on** — the open decision above; settle it as part of resuming.
- **Selection → live quantity + COST in Find** — the highest-value Revit-pain fix not yet built: each Find
  group row shows count + estimated **cost in USD** (kills the schedule↔model disconnect — Revit's #1
  complaint). Default currency = **USD** — source rates from `rates/rsmeans2024_us.json` (declares
  `"currency":"USD"`, natively USD). Currency display already auto-syncs from the active pack's
  `meta.currency` (`rates.js:352`), so loading the US pack makes the app show USD. NOTE: do NOT use the
  unlabelled `A.MATERIAL_COSTS` fallback in config.js (values ≈RM, not currency-tagged) — pull from the USD
  pack. Count is free; cost = pack rate × qty (EA = count; M/M² need a qto length/area — the remaining gap). **DO THIS ONCE rates.JSON IS DONE** — gated on externalising
  `rates.js` (SEQUENCE/LABOR + cost rules) into an editable `rates.JSON` registered in the Settings JSON
  editor (see `prompts/SETTINGS_JSON_EDITOR.md §BACKLOG`, user 2026-06-04). Once rates load from that JSON,
  wire a cost column per Find group (type/storey/room/material/phase). The loudest Revit+ pains, in order:
  (1) this live selection cost/qty, (2) share-current-view-as-URL (isolate→deep-link), (3) MEP system trace
  (B2, graph walk over system_nodes/system_edges).
- **Engineer pain catalog** (what Revit users complain about → our wins): per-view modal Filters; Hide/Isolate
  resets & doesn't share; "everything in this room / on this system / in this phase" not native; rooms fragile;
  schedule↔model disconnect; slow on big/federated; can't filter across links. Maps 1:1 to lenses + URL-share.
- **Extraction gaps found (all systemic, all at extract_per_building.py / extraction):** material_name null,
  storey "Unknown" for 87% (MEP carries no storey — worth fixing so the Storey axis isn't one big bucket),
  task tables empty, rooms absent. Task 2 fixes material + rooms; storey-for-MEP and a System lens
  (system_nodes/system_edges, for MEP downstream trace — RevitParity B2) are follow-ons.
- **Ghost / Color** — DROPPED from active scope (per-element opacity/color on batched/instanced meshes is the
  expensive path; Isolate covers "focus by hiding"). Revisit only on concrete need.
- **RevitParity B-series (deferred)** — B1 Solar hours, B2 MEP trace, B3 egress code-check, B4 long-tail
  heat-loss (cited coefficients), B5 gbXML export. See docs/RevitParity.md.
- **Artifacts left for the executing session:**
  - `deploy/dev/buildings/Duplex_rooms_extracted.db` — grafted DX with 21 rooms (proves the join end-to-end).
  - `tests/specs/40-find-isolate.spec.js` — 3 passing whitebox tests (Isolate + room-contents isolate).
  - `/tmp/duplex_ref.db` — fresh reference extraction (ephemeral; re-run extract.py if gone).
  - `docs/RevitParity.md` — the umbrella spec (A1 status + corrected A2 inputs note).

## ⛔ DEVIATION found 2026-10-24 (guide refresh, `prompts/DOCS_GUIDE_REFRESH.md`) — W-PHASE-LAZY's user-visible state is wrong on first open
Spec W-PHASE-LAZY (above) expects `§PHASE_LENS gen=lazy status="timeline in progress"`. Live (HHS, 90 s watched, no network faults): the Phase axis
shows **"Timeline unavailable (generator not loaded)."** and keeps showing it; the log says `§PHASE_LENS gen=real source=kernel_ops
status="generator running async (chunk-yield); reopen to load"` then `async-done ok=true`. Cycling to another axis and back (reopen) shows the timeline:
Architecture Envelope 1334 · MEP Rough-in 2666 · Superstructure 1967 · Architecture 10 · Architecture Closeup 133 · MEP Final 727 · Finishes 43.
So generation works; only the first-open message is wrong (`nf_trees.js:622-640`, `_buildPhaseTree` renders the same text for every null, including
"still generating"). **Fix shape (viewer code, own worktree):** distinguish "running async" from "not loaded", show "Timeline generating…", and re-render
the tree when `async-done` fires instead of requiring a reopen; witness = open Phase once, assert the phase list appears with no second visit.
