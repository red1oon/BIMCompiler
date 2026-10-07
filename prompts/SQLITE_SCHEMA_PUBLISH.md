# ⚠ DO NOT REMOVE
**Scope:** define, publish and enforce ONE written schema for BIM-OOTB building databases (`*_extracted.db`,
`*_meta.db`, `*_geo.db`). Proposal stage — nothing below is implemented. Every count here comes from a
survey script run against the real files; **read the log after every run** (`§SCHEMA_SURVEY`, `§SCHEMA_FILE`,
`§SCHEMA_TABLE`, later `§SCHEMA_CHECK`). Honour until every item in §6 is ✅ or ⛔.

---

## §1 What "publishing the schema" means (2026-10-07)
User asked (2026-10-07): *"What it takes to publish our schema … What is meant publishing the schema?"* then *"Ok do it."*

A published schema is one public document that lets anyone open a BIM-OOTB database in any language **without
reading our code**: every table and column with type and meaning, the IFC source of each, the byte layout of BLOBs,
units and axes, a version number stamped in the file, and a compatibility rule. That Open's Fragments publishes its
FlatBuffers schema; we publish nothing — the gap named in the "What Makes BIM Open" doc
(claude.ai/code/artifact/855e2d22-4d15-4713-a578-33b9f49d583f).

## §2 Measured state — survey 2026-10-07
Script: session scratchpad `schema_survey.py` + `perfile.py` (read-only, `mode=ro`), run over
`~/bim-ootb/buildings/*.db` (27 files; the served copies — only 2 DBs are tracked in bim-ootb `origin/main`,
the rest are distributed via OCI). Second pass over `bim-compiler/deploy/buildings/` (35 files) agrees on the drift.

**Headline:** 28 distinct table names across 27 files; `user_version` = 0 in **27 of 27** (no version stamp anywhere).

| Finding | Evidence (§ log) |
|---|---|
| `elements_meta` has 3 layouts (13× no `id`, 4× `id`+`element_type`+`building`, 1× no `building`) | `§SCHEMA_TABLE elements_meta layouts=3` |
| Viewer reads geometry from `component_geometries`; `tools/extract.py` writes `base_geometries` (1 of 27 files has it) | viewer `scene.js` 17× `FROM component_geometries`; `§SCHEMA_TABLE base_geometries in=1/27` |
| `spatial_structure` 6 layouts; `rel_contained_in_space` column order differs (13× `space_guid,element_guid`, 2× reversed) | `§SCHEMA_TABLE` |
| `tasks` 2 layouts: 9× simple (7 cols), 4× CPM (18 cols) | `§SCHEMA_TABLE tasks layouts=2` |
| `guid` is not always a bare 22-char IFC GlobalId: federated files prefix it (`T0_Terminal_<GlobalId>`, 34–36 chars); HHS has 9 non-IFC sensor rows (`IOTDEV-TEMP-HHS`); warehouse 3–18 chars | `§SCHEMA_FILE … guidlen=` |
| `project_metadata` keys vary: some have `source_file`, some `source_uri`, LTU_AHouse_meta has only view keys, 3 full files have no table | `§SCHEMA_FILE … meta_keys=` |
| `material_rgba` = text `"r,g,b,a"`, floats 0–1; JKR stores `''` | `§SCHEMA_FILE … rgba=` |
| `rotation_x/y/z` all 0 on Hospital (63,917 rows) — rotation is baked into vertices | sqlite3 count, 2026-10-07 |
| 2 files are 0 bytes: `Duplex_meta.db`, `SampleCastle_extracted.db` | `ls -la` |
| Geometry BLOBs: vertices float32 LE xyz centred on element (`extract.py` `v_centered`), faces written int32, read by viewer as `Uint32Array` (`scene.js:2203-2204`), optional `normals` float32 (`scene.js:2242`) | code read |
| App-state tables ride in building files: `scene_state`, `cinema_path`, `kernel_ops`, `storey_walkable_raster`, `rooms_meta` | `§SCHEMA_TABLE` |

## §3 Proposed canonical layout — v1 (DRAFT, awaiting §4 decisions)
Name in-file: `project_metadata.schema_name = 'ootb-building'`, `schema_version = '1'`, and `PRAGMA user_version = 1`.

**File kinds:** `<B>_extracted.db` = core + geometry. Split pair for mobile: `<B>_meta.db` = core,
`<B>_geo.db` = geometry. Auxiliary files (`city_index*`, `*_rooms`, `*_silent*`, `HospitalAjaibPath`) are out of v1 scope.

**Conventions:** metres; IFC world axes, Z up; text UTF-8; BLOBs little-endian.

### Core module (required in `_extracted` and `_meta`)
| Table | Columns (type) | Meaning / IFC source |
|---|---|---|
| `project_metadata` | `key TEXT PK, value TEXT` | required keys: `schema_name`, `schema_version`, `building_name`, `source_file`, `import_date` (ISO 8601) |
| `elements_meta` | `guid TEXT PK, ifc_class TEXT NOT NULL, discipline TEXT, storey TEXT, element_name TEXT, element_type TEXT, material_name TEXT, material_rgba TEXT, building TEXT` | `guid` = IFC GlobalId, or `<prefix>_<GlobalId>` in federated files (prefix declared in `project_metadata.guid_prefix`); non-IFC rows flagged (see D5). `material_rgba` = `"r,g,b,a"` 0–1 or NULL, never `''` |
| `element_transforms` | `guid TEXT PK, center_x/y/z REAL, rotation_x/y/z REAL, bbox_x/y/z REAL, transform_source TEXT NULL` | centre = world position the centred mesh is placed at; bbox = axis-aligned size (m) |
| `element_instances` | `guid TEXT PK, geometry_hash TEXT` | many elements → one shared mesh |

### Geometry module (required in `_extracted` and `_geo`)
| `component_geometries` | `geometry_hash TEXT PK, vertices BLOB, faces BLOB, normals BLOB NULL, building TEXT` | vertices float32×3 per point, centred; faces uint32×3 per triangle; normals float32×3 or NULL; hash = first 16 hex of SHA-256(vertices‖faces) |

### Optional modules (present = must match; absent = fine)
- **Spatial:** `spatial_structure(guid, type, name, parent_guid, object_type, predefined_type, [center_*, size_*, elevation, room_guid])`, `rel_contained_in_space(element_guid, space_guid)`, `rel_aggregates(parent_guid, child_guid)`, `elements_rtree` (SQLite R*Tree).
- **4D:** `schedules`, `tasks`, `task_sequences`, `task_elements`, `calendars`.
- **5D/BOM:** `qto_cache`, `m_bom`, `m_bom_line`.
- **Edit history:** `kernel_ops`.

**Compatibility rule:** adding a table or a nullable column = minor (same `user_version`); readers MUST ignore
unknown tables/columns. Renaming, removing or changing a type/BLOB layout = bump `user_version`.

## §4 Decisions only the user can make (⛔ until answered)
- **D1** Geometry table name: `component_geometries` (what the viewer reads, in most files) — recommended; then `tools/extract.py` changes to match.
- **D2** `elements_meta` key: `guid` as primary key, drop/ignore `id` — recommended.
- **D3** Canonical `tasks`: the 18-column CPM layout — recommended; simple layout deprecated.
- **D4** App-state tables (`scene_state`, `cinema_path`, `storey_walkable_raster`, `rooms_meta`, `surface_styles`, `material_layers`): excluded from the spec as `x_` application extensions, or specified? Recommend excluded (readers ignore).
- **D5** Non-IFC rows (HHS sensors): allow with `project_metadata` / a column flag, or move to a separate table? Recommend a separate optional table.
- **D6** Where the spec lives: `bim-ootb/docs/DB_SCHEMA.md` (public) — recommended.

## §5 Witness design (spec before code)
`scripts/schema_check.py <db>` (bim-compiler; read-only) prints one `§SCHEMA_CHECK file=… kind=… version=… core=PASS|FAIL
geometry=… modules=[…] missing=[…]` line per file. Must report **INCONCLUSIVE** for a 0-byte, unreadable or
LFS-stub file (never PASS), and **FAIL** naming the first mismatched column. Issue it proves: *a file that claims
`ootb-building` v1 matches §3 exactly.*

## §6 Work list
1. ⛔ D1–D6 answered by user.
2. ☐ Write `bim-ootb/docs/DB_SCHEMA.md` from §3 + decisions.
3. ☐ `scripts/schema_check.py` per §5; run on all files; log read.
4. ☐ `tools/extract.py` + browser import write v1 (stamp `user_version`, required metadata keys).
5. ☐ Existing files brought to v1 by `.sql` patches via the self-heal loader (`buildings/patches/*.sql`) — never binary commits.
6. ☐ 0-byte `Duplex_meta.db`, `SampleCastle_extracted.db`: find their real source or delete (user call).
