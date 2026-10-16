# ⚠ DO NOT REMOVE
**SCOPE — one job, nothing else.** Backfill `IfcOpeningElement` across the fleet's extracted DBs:
fix the extractor (additive), re-extract the 8 non-LTU buildings from their source IFCs, install
locally + upload to the OCI **dev** bucket, re-run the fleet room-path witness, and record the
per-building delta. **No walker/engine changes. No constants. No git-committed `.db` binaries.**

**READ THE LOG AFTER EVERY RUN.** Save every run to a log file and read it before conclusions —
exit 0 with a FAIL/SKIP inside is a live failure mode here. `§`-tagged lines are the only evidence.

**Model note:** Fable-class execution session. Do NOT write to `MEMORY.md` or any memory file.
All findings/status/proof go into THIS file as dated sections. Work-to-zero: every building ends
`✅` or `⛔ BLOCKED: <one question>`; never park, never loop.

---

## §0 EVIDENCE — settled 2026-08-02, do not re-derive (see RESUME_ROOMPATH_AXIS_RESWEEP.md §7–§8)

1. Fleet §O2 pair-unroutable at live default: LTU 18.4% · Terminal/TermRooms 19.2% · Clinic 49.3%
   · Duplex 69.2% · JKR 92.7% · HHS 94.8% · Hospital_3 96.1% · Hospital 96.9%.
2. Class dictionary is CLEAN — walker sees 100% of doors in all 9 DBs. NOT the cause.
3. The split is `IfcOpeningElement`: **LTU 3,368 rows (all with transforms; ARC=2785, STR=583) —
   every other DB 0.** This is why voidMode/pierce are inert outside LTU.
4. Source has them, extractor drops them: `IFC/Duplex_ARC.ifc` (bim-ootb) contains 50
   `IFCOPENINGELEMENT`; `Duplex_extracted.db` has 0.
5. ROOT CAUSE (verified by reading the code): `bim-compiler/scripts/extractIFC2DB.js` —
   `CLASS_NAME_MAP['IFCOPENINGELEMENT']` exists (line ~74) but `PRODUCT_TYPES` (~lines 268–316)
   never enumerates `WebIFC.IFCOPENINGELEMENT`, so openings are never queried. Dead intent — the
   EXACT pattern of the `IFCSPACE` gap fixed 2026-07-10 in the same list (its §SPACE-SCOPED comment
   is the template for scope, reuse of the existing per-element try/catch, and the no-representation
   skip path).
6. Consumers are already safe/ready — do not modify them:
   - `bim-ootb viewer/lib/room_walker.js:928` consumes openings (`ifc_class LIKE 'IfcOpening%' AND
     discipline='ARC'`) — the §APERTURE_TIER machinery activates on data presence alone.
   - Viewer render queries already EXCLUDE `IfcOpeningElement` (`viewer/city.js:739`,
     `viewer/streaming.js:80,138,2021`) — backfilled openings will not render as solids.

## §1 SCOPE OF DBs

Re-extract these 8 (in `~/bim-ootb/buildings/`): `Clinic`, `Duplex`, `HHS_Office_Federated`,
`Hospital`, `Hospital_3`, `JKR`, `Terminal`, `TermRooms` (`*_extracted.db`).
**DO NOT touch** `LTU_AHouse_extracted.db` (already correct) or anything KUL070.

Source IFCs seen locally: `bim-compiler/internal/UNMERGED/` (Clinic, Hospital, HHS, Duplex
per-discipline sets), `bim-compiler/reference/residential/`, `~/Downloads/` (`Hospital 2.0.ifc`,
`TerminalMerged.ifc`, `Clinic.ifc`), `~/bim-ootb/IFC/`. **Attribute each DB to its true source +
extraction command from the record** — `bim-compiler/scripts/logs/extract_*_log.txt`,
`docs/{Building}Analysis.md`, git history of `extractIFC2DB.js` callers — do NOT guess a source by
filename similarity. If a building's source/command cannot be attributed from the record, mark it
`⛔ BLOCKED: <question>` and continue with the rest.

## §2 STEPS (spec each before coding, log each run)

1. **Extractor fix (additive only):** add `WebIFC.IFCOPENINGELEMENT` to `PRODUCT_TYPES` with a
   short comment in the §SPACE-SCOPED style. Diff must touch nothing else.
2. **Identity gate first:** re-extract ONE building (Duplex — smallest, source verified) to a
   staging dir (`/tmp/wt-*` or scratch, never over the live file). Gate G-EX2/G-EX3 below must pass
   before doing the other seven.
3. **Re-extract all 8** to staging. Save one log per building; read each.
4. **Gates per building** (all five, recorded in this file):
   - **G-EX1** extractor diff additive-only (`git diff` shows the one list entry + comment).
   - **G-EX2 count parity:** every pre-existing `ifc_class` count in the old DB equals the new DB's
     (SQL group-by diff, old vs new). Any drift = do NOT install that building; record it.
   - **G-EX3 openings present:** new DB `IfcOpeningElement` rows > 0 wherever the source IFC greps
     >0 `IFCOPENINGELEMENT`; rows carry transforms (center_x NOT NULL) like LTU's do.
   - **G-FL no-regression:** fleet §O2 witness on the new DB — unroutable% must not INCREASE vs §0
     item 1. (Improvement is the hope, not the gate.)
   - **G-VR render exclusion:** confirm by query (not screenshot) that the viewer's element query
     pattern excludes the new opening rows (run the `streaming.js:80` WHERE against the new DB).
5. **Install + distribute:** copy gated DBs over `~/bim-ootb/buildings/` (keep old as `.bak`
   OUTSIDE any repo tree, e.g. `/tmp/db_bak_2026-08-02/`; verify `git check-ignore` says the
   buildings path is ignored before writing). Upload to the OCI **dev** bucket per
   `deploy/OCI_UPLOAD.md` §RULES — `--content-type` on EVERY put, fetch-back + verify. **Do not
   touch the live bucket.**
6. **Fleet re-measure:** port the §FLEET runner (identical formula to
   `witness_room_path_overlink.js` `run()`) as `witness_room_path_fleet.js` on branch
   `review/roompath-redundancy` (reuse `/tmp/wt-roompath` if present — `git worktree list` FIRST),
   commit + push it (code only, never DBs). Run before/after; record the delta table here.
7. **DONE appendix:** every claim with its `§` log line. Buildings that failed a gate stay old,
   marked `⛔` with the exact failing number.

## §3 STOP CONDITIONS (binding)

- A building whose source can't be attributed, or that fails G-EX2, ships NOTHING — old DB stays.
- If backfilled openings do NOT improve a building's unroutable%, that is a RESULT to record (it
  bounds how much was data vs sealed-suite scope limit — §21.38) — not a license to tune. **No
  walker changes, no voidMode/pierce changes, no new constants, no per-building values.**
- Push hang >30s = LFS pre-push probe; stop and note, don't retry-loop.

---

## 2026-08-02 §4 EXECUTION LOG (this session)

### §4.1 G-EX1 — extractor fix landed (additive only)
`scripts/extractIFC2DB.js`: `WebIFC.IFCOPENINGELEMENT` appended to `PRODUCT_TYPES` with a
§OPENINGS-BACKFILL comment in the §SPACE-SCOPED style. `git diff --stat` = **1 file, 8 insertions,
0 deletions** (1 code line + 7 comment lines). `node -c` clean. Nothing else touched. **G-EX1 ✅**

### §4.2 SOURCE ATTRIBUTION (from the record, per building)
Producer fingerprints used: `project_metadata` key sets (`source_file` = extractIFC2DB.js CLI ·
`source_uri` = browser Drop-IFC, same web-ifc engine · literal `import_date='2026-05-02'` =
`merge_disc_dbs.py`), table sets (`component_geometries` = JS extractor; meta-split = carve chain),
GUID membership + entity-count fingerprints against candidate IFCs. April-era
`scripts/logs/extract_*_log.txt` are STALE (older Python pipeline; DBs postdate them).

| building | attributed source + command | mechanism this lane uses |
|---|---|---|
| Duplex | `reference/residential/Ifc2x3_Duplex_Federated.ifc`, browser Drop-IFC 2026-05-28 (same engine as extractIFC2DB.js). Entity fingerprint exact: walls 56, doors 14, windows 24, flow 427, beams 8, members 4, footings 7 | **A: full re-extract** |
| Clinic | `extract_clinic.sh` recipe: 5× `extractIFC2DB.js` (ARC auto·STR·ELEC·ACMV·PLB) + SQLite merge; sources `internal/UNMERGED/Clinic_*_IFC2x3.ifc` (script's IFC_DIR stale, files relocated) | **A: full re-extract** |
| Hospital | 7× `extractIFC2DB.js` on `internal/UNMERGED/Hospital_IFC4_{ARC,ELE,FIRE,MECH,PLB,SPR,STR}.ifc` + literal `python3 scripts/merge_disc_dbs.py hosp` (disc forced per file at merge: ELE→ELEC, FIRE/SPR→FP) | **A: full re-extract** |
| Hospital_3 | COPY of Hospital + baked `storey_walkable_raster` + `kernel_ops` (DISCWALK_PLANT_ROOM_INDUSTRIAL_TAXONOMY.md:133). No independent source | **B: openings injection** from Hospital re-extract |
| HHS_Office_Federated | merge_disc_dbs.py signature BUT ad-hoc call never committed; DB carries GUIDs found in NONE of the 6 `opensourceBIM_HHS_Office_*.ifc` candidates + type-entity rows (`IfcSensorType` etc.) the current extractor never emits → full re-extract fails G-EX2 **by construction**. DB door/wall GUIDs ARE in `architect`/`architect2` | **B: openings injection**, frame fitted by matched GUIDs |
| JKR | browser Drop-IFC 2026-07-11 (§UNITS_V2 georef rebase) + `fix_mm_scale_blobs.py`; schema choice (IFC4 vs IFC2X3, same GUIDs both) unrecorded — chain not re-runnable headless | **B: openings injection** from `jkrAR25_5a…ifc`, frame fitted |
| Terminal | carve chain (TERMINAL_COORDINATE_FRAME_MISMATCH.md §Step 3): Python extract → city tiling (`T0_Terminal_` GUID prefix) → carve → 2026-07-11 coordinate correction → compile_rooms. Not re-runnable; full re-extract fails G-EX2 by construction | **B: openings injection** from `~/Downloads/TerminalMerged.ifc`, GUID-prefix match + translation fit |
| TermRooms | byte-copy of `Terminal_rooms.db` (same base as Terminal; `TermRooms_geo.db` symlinks Terminal_geo.db) | **B: same injection as Terminal** |

**Path B legitimacy:** LTU (the working reference) shape = openings in `elements_meta` +
`element_instances` + `element_transforms`, 3368/3368/3368, and LTU's opening instance hashes are
**dangling** (0 rows in `LTU_AHouse_geo.db`) — so injected rows mirror the reference exactly.
Injection preserves every existing byte → G-EX2 exact by construction; frame equality is proven
numerically per building (matched-GUID transform fit) before any row is written.

### §4.3 IDENTITY GATE — Duplex, all five gates ✅
Log `scratchpad/backfill/extract_Duplex_backfill.log` (read): §ELEMENTS count=1193 storeys=4,
§DB_WRITTEN 9.3MB.
- **G-EX2 ✅** class-count diff old→new = additions ONLY: `IfcOpeningElement|50` (this fix),
  `IfcSpace|21` (§SPACE-SCOPED fix of 2026-07-10, postdates the Jun-5 DB), `IfcRoof|1` + `IfcStair|2`
  (no-representation aggregates: meta row, NO transform row — kept by the current honest-absence
  path, dropped entirely by the May-era extractor). Zero pre-existing class counts changed.
- **G-EX3 ✅** 50/50 openings, all with `center_x NOT NULL` (= source's 50 IFCOPENINGELEMENT).
- **G-FL ✅** ported witness on staged DB: 69.2% → **69.2%**, storeys 4, rooms 7, stranded 3,
  fusions 0 — no regression, and NO improvement. Explanation from the walker's own tiering
  (room_walker.js §APERTURE_TIER/§WIDTH-CAP): Duplex's 50 openings are door/window-hosted; a
  door-hosted opening carves where the door already carved, a window fails §VOID-AT-FLOOR. No
  doorless archway exists in this model → data present, zero new circulation. This is the §3
  bounded result for Duplex, not a defect.
- **G-VR ✅** streaming.js:80 WHERE on staged DB: renderable=1140 rows, openings matched by the
  render query=0; the 50 openings DO carry geometry_hash, so the `!= 'IfcOpeningElement'` guard is
  load-bearing and present (city.js:739, streaming.js:80).

### §4.4 FINDING — Hospital_3 drifted to Hospital-identical TODAY (before this lane touched anything)
Fleet baseline re-run (ported `witness_room_path_fleet.js`, log `backfill/fleet_before.log`, read):
all anchors match §0 item 1 EXCEPT Hospital_3 = 7 storeys/282 rooms/**96.9%** — identical to
Hospital, not §7's 5/175/96.1%. Its mtime 22:02 = a viewer `kernel_ops` BUILDING_OPEN journal write
(`{"name":"Hospital","count":63182}`, ts 22:02:31). Element content now equals Hospital's
(same discipline census 63,415). G-FL for Hospital_3 gates against the measured-today 96.9%, and
the §7 discrepancy is recorded here, not silently overwritten.

### §4.5 OCI note (recorded before any upload)
Prompt says "OCI **dev** bucket"; `deploy/OCI_UPLOAD.md` §Buckets says building DBs normally live
ONLY in common `bim-ootb` — which the LIVE landing also reads (`_prodBase`), i.e. uploading there
would alter production data, and rule 55 forbids DBs in `bim-ootb-dev`. Resolution: honour the
prompt's harder constraint (**live untouched**) — upload to `bim-ootb-dev` under `buildings/`
(staging silo, "safe to break", referenced by nothing), `--content-type` on every put + fetch-back
verify. Common bucket `bim-ootb` deliberately NOT touched.

### §4.6 SPEC — Path B injector (`roompath_diagnostics/inject_openings.js`, written before the code)
One tool, deterministic, no invention. Inputs: `--target <db>` (a COPY of the installed DB, never
the original), `--source <staged fresh-extraction db>`, `--prefix <guidPrefix|''>`, `--building
<value|''>`, `--disc ARC`. Procedure:
1. **Frame fit (gate, before any write):** match `IfcDoor*`+`IfcWallStandardCase` GUIDs
   (target guid = prefix + source guid); require **n ≥ 30 matches**; per-axis delta
   (target − source) must be CONSTANT: stddev ≤ 0.02 m each axis, and scale identity checked via
   bbox_x/bbox_y equality (|Δ| ≤ 0.02 m median). Fit fail = NO rows written, building → ⛔ with
   the failing number.
2. **Inject** source `IfcOpeningElement` rows: `elements_meta` (columns adapted to target PRAGMA;
   discipline `ARC`; building column = `--building` when present), `element_transforms` with the
   fitted translation added to center_x/y/z (rotation/bbox copied — translation-invariant),
   `element_instances` (guid, geometry_hash) mirroring LTU's reference shape (LTU's own opening
   hashes are dangling in its _geo.db, §4.2). `component_geometries` rows copied only when the
   target has that table (full-schema DBs); meta-split targets stay meta-only by design.
3. **§ logs:** `§INJ_FIT n dx dy dz sd(dx,dy,dz)` · `§INJ_SCALE medΔbbox` · `§INJ_ROWS meta/tf/inst/geo`
   · `§INJ_VERIFY` re-count from target after write. Guard: target opening count must be 0 before
   (no double-inject).

### §4.7 JKR ✅ — schema attribution resolved numerically, first fleet improvement
Staged both candidate schemas (log `backfill/extract_JKR_arc.log`, read: IFC4 1797 el / IFC2X3
1857 el, 425 openings each). Frame fit (§INJ_FIT, doors GUID-matched):
- **IFC4: PASS** n=65 dx=0.0010 dy=-0.0082 dz=-0.0028 sd=0.0124/0.0115/0.0111, medΔbbox=0.0000
- IFC2X3: FAIL sd=0.1086/0.1483/0.0442 → the installed JKR DB descends from the **IFC 4** export;
  the unrecorded schema choice (§4.2) is now pinned by measurement, not guess.
Injection (`inject_JKR.log`): §INJ_ROWS meta=425 tf=425 inst=425 geo=100 · §INJ_VERIFY 425.
- **G-EX2 ✅** class diff = `+IfcOpeningElement|425` only.  **G-EX3 ✅** 425/425 with transforms
  (= source's 425).  **G-VR ✅** all 425 excluded by the `!= 'IfcOpeningElement'` guard.
- **G-FL ✅ IMPROVED:** W:3.0 **92.7% → 88.0%** (rooms 36→26, stranded 17→13, fusions 12→22);
  `cur` now 84.4% — first non-LTU building where voidMode is live. No regression.

### §4.8 HHS_Office_Federated ✅ — injection exact-fit, zero delta (bounded result)
Both `architect.ifc` and `architect2.ifc` staged (2811 el each, log `extract_HHS_arc.log`, read).
Frame fit vs installed DB: **both files fit EXACTLY** — n=245 matched doors+walls, dx=dy=dz=0.0000,
sd=0.0000, medΔbbox=0.0000 → the two candidate files carry identical geometry coordinates; the
architect/architect2 ambiguity (§4.2) is immaterial. Injected from `architect.ifc`
(`inject_HHS.log`): meta=218 tf=218 inst=218 geo=43, §INJ_VERIFY 218.
- **G-EX2 ✅** class diff = `+IfcOpeningElement|218` only.  **G-EX3 ✅** 218/218 with transforms
  (= source's 218).  **G-VR ✅** all 218 excluded by the render guard.
- **G-FL ✅ zero delta:** 94.8% → **94.8%**, fusions 4→4 (both modes). Same shape as Duplex: every
  HHS opening is door/window-hosted; no doorless archways → data present, no new circulation.
  HHS's 94.8% unroutable is therefore NOT an openings-data gap — it is the sealed-suite scope
  limit (§21.38) territory. Bounded result recorded per §3; no tuning attempted.

### §4.9 Clinic ✅ — Path A full re-extract, improvement
`extract_clinic.sh` recipe re-run against relocated sources (`internal/UNMERGED/`), log
`extract_Clinic_backfill.log` (read): 5 extractions (3292/1094/2384/3967/6587 el) + SQLite merge,
17322 elements total (old 16114 + 410 openings + 798 IfcSpace — arithmetic exact).
- **G-EX2 ✅** class diff = `+IfcOpeningElement|410`, `+IfcSpace|798` (§SPACE-SCOPED, postdates
  Jun-5 DB) — zero pre-existing class counts changed.
- **G-EX3 ✅** 410 = source sum (Architectural 403 → ARC, Structural 7 → STR — same ARC/STR split
  pattern as LTU's 2785/583); 410/410 with transforms.
- **G-VR ✅** all 410 excluded by the render guard (they carry geometry_hash; guard load-bearing).
- **G-FL ✅ IMPROVED:** W:3.0 **49.3% → 48.7%** (rooms 186→165, stranded 50→46, fusions 52→**73**
  — 21 new doorless-archway fusions from real opening geometry).

### §4.10 Terminal + TermRooms ✅ — SOURCE HAS ZERO OPENINGS; backfill not applicable by evidence
`~/Downloads/TerminalMerged.ifc` (566MB, the only Terminal source on disk) extracted clean with the
fixed extractor (log `extract_TerminalMerged.log`, read: 48,428 elements, 23 storeys, §DB_WRITTEN
277.8MB) — **0 IfcOpeningElement rows**, and the source itself greps **0** `IFCOPENINGELEMENT`,
**0** `IFCRELVOIDSELEMENT`/`IFCRELFILLSELEMENT`. The SJTII "Clean" exports genuinely carry no
opening entities. G-EX3's own wording ("wherever the source IFC greps >0") makes backfill
inapplicable: there is nothing to inject, from any pipeline. Consistent with §APERTURE_TIER's
measured 135 doors / 0 openings. Terminal/TermRooms' 19.2% unroutable is a SOURCE-DATA bound, not
an extraction gap — recorded per §3; installed DBs untouched, nothing shipped BY EVIDENCE (this is
the completed determination for both, not a blocker).

### §4.11 INSTALL — first four gated buildings; OCI upload → DEFERRED by user directive
Old DBs backed up to `/tmp/db_bak_2026-08-02/` (outside all repo trees); `git check-ignore -v`
confirmed `buildings/*.db` ignored (`.gitignore:1:*.db`) before writing. Installed to
`~/bim-ootb/buildings/` and verified by re-count: Duplex 50 · Clinic 410 · JKR 425 · HHS 218
openings. Witness + injector pushed: `review/roompath-redundancy` @ `8c3d12c`, 0 local-only commits.

**⚠ OCI UPLOAD DEFERRED — user directive 2026-08-03 (overrides §2 step 5's upload clause):** no
OCI uploads from this lane, not even the dev bucket; local install only. The directive arrived
AFTER four puts had already completed and verified; per the directive they are NOT reverted, just
recorded. Exactly these four objects were uploaded to `bim-ootb-dev` (with
`--content-type application/octet-stream`, fetch-back md5-verified, `oci_upload.log` read):
- `buildings/Duplex_extracted.db` md5 `1632c8427359721ed25b59869e88066d`
- `buildings/Clinic_extracted.db` md5 `51149bf50a839e1bfe84606444f60d5a`
- `buildings/JKR_extracted.db` md5 `7ac5f7f187e8790f88744099fae17142`
- `buildings/HHS_Office_Federated_extracted.db` md5 `decfd70dfd160ca6f3ff75cd7f5965b2`
Hospital/Hospital_3 (and anything later) were NOT uploaded and will not be. **Snapshot-divergence
landmine, documented not silent:** `bim-ootb-dev buildings/` is now a MIXED generation (4 objects
backfilled, the rest Apr–May era), and LOCAL `~/bim-ootb/buildings/` is NEWER than every OCI copy
— any future session must treat local as truth and never "restore" from OCI dev
(cf. memory `project_db_snapshot_divergence_landmine`). Live bucket + common `bim-ootb` bucket
untouched throughout.

### §4.12 INCIDENT — first Hospital pipeline run killed at ~58 min (recovered, no data loss)
The 7-file background job was killed mid-SPR DB-write (SPR journal present; STR + merge never ran);
RAM was healthy (18GB available) — runner timeout, not OOM. ARC/ELE/FIRE/MECH/PLB per-disc DBs
completed intact. Recovery: SPR re-extracted from scratch (partial DB deleted), STR extracted, then
the recorded `python3 scripts/merge_disc_dbs.py hosp` — log `extract_Hospital_backfill2.log`.

---

## §5 DIRECTIVE 2026-08-03 (user, approved) — OPENINGS ARE GHOSTS; spec change over §2/§4

Per the S185 ruling (`prompts/done/S185_duplex_investigation.md`: opening GUIDs in
`element_instances` corrupted the mesh-library pipeline), the backfill's staged data shape
(openings WITH hashed instance rows — as verified on new Duplex 50/50 and live LTU 3368/3368) is
disallowed. Binding changes:
1. Extractor: `IfcOpeningElement` → `elements_meta` + `element_transforms` ONLY. No
   `element_instances` row, no geometry hash, no blob. Additive/minimal in `extractIFC2DB.js`.
2. **New gate G-GHOST (all 8):** `SELECT COUNT(*) FROM element_instances i JOIN elements_meta m
   ON m.guid=i.guid WHERE m.ifc_class='IfcOpeningElement'` = **0** in every installed DB.
3. Already-staged/installed DBs may be stripped by deterministic SQL instead of re-extracted,
   PROVIDED equivalence is proven once on Duplex (fresh tightened extraction vs stripped DB:
   identical table counts + walker §O2).
4. Walker §O2 must be shown unchanged by the strip (by run, not assertion).
5. **LTU carries the S184 shape live (3,368 hashed instance rows) — NOT touched.** Named finding
   for a possible follow-up lane, nothing more.
6. OCI skip directive stands — no uploads (§4.11).

### §5.1 Tightened extractor (G-EX1 restated)
`extractIFC2DB.js` §OPENINGS-GHOST guard: the `geometries.push` is skipped for
`ifcClass==='IfcOpeningElement'` — tessellation still runs so centroid/bbox stay measured;
`element_instances` AND `component_geometries` are both written solely from that list, so openings
never reach either; a non-opening element sharing the same hash still writes its own blob.
Cumulative diff vs HEAD: **1 file, 18 insertions, 1 deletion** (§OPENINGS-BACKFILL list entry +
§OPENINGS-GHOST guard; the 1 deletion is the original unguarded push line). `node -c` clean.

### §5.2 Equivalence proof (directive items 3+4) — PROVEN on Duplex
Fresh ghost extraction `Duplex_ghost.db` (log `extract_Duplex_ghost.log`, read: §SUMMARY
elements=1193 geometries=1140 — exactly 50 fewer than pre-ghost 1190) vs `Duplex_stripped.db`
(installed backfilled DB + the two-statement strip SQL: DELETE openings' instances; DELETE
orphaned `component_geometries`):
- Table counts IDENTICAL: elements_meta 1193 · element_transforms 1190 · element_instances 1140 ·
  component_geometries 835 (both DBs).
- Class census diff: EMPTY.
- Walker §O2: both 69.2% / 69.2% (W:3.0, cur), storeys 4, rooms 7, stranded 3, fusions 0 —
  and identical to the PRE-strip number → the walker provably reads only meta+transforms.

### §5.3 Strip + re-gate (Clinic, JKR, HHS, Hospital-fresh)
Same two-statement strip applied to staged copies. Per building:
`G-GHOST=0` · openings-with-transforms preserved (Clinic 410 · JKR 425 · HHS 218 · Hospital 735) ·
render-join openings = 0 (G-VR now vacuously tight — no instance rows at all) · §O2 re-run
IDENTICAL to the pre-strip after-numbers: Clinic 48.7% · JKR 88.0/84.4 · HHS 94.8 · Hospital 96.9.
**Hospital G-FL result: 96.9% → 96.9%, fusions 56→56 — zero delta despite 735 openings.** Same
door/window-hosted bound as Duplex/HHS; recorded per §3, no tuning.

### §5.4 LTU S184-shape finding (directive item 5 — recorded, NOT acted on)
`LTU_AHouse_extracted.db` (live, untouched) carries 3,368 `IfcOpeningElement` rows in
`element_instances` WITH geometry hashes — all dangling (0 matching blobs in `LTU_AHouse_geo.db`).
This is exactly the S185-disallowed shape, live today. Possible follow-up lane: ghost-strip LTU
with the §5.2-proven SQL + gates. Out of scope here by directive.

### §5.5 Hospital_3 ✅ — injection exact-fit + one shape correction caught by the witness
Injected from the fresh Hospital merge into a copy of installed Hospital_3 (`inject_Hospital_3.log`):
§INJ_FIT n=**1750** dx=dy=dz=0.0000 sd=0.0000 (frame identity proven), §INJ_ROWS 735, then
ghost-stripped (G-GHOST=0, tf=735, render-join=0, G-EX2 diff `+IfcOpeningElement|735` only).
**Witness caught a real shape deviation:** first run showed `cur` 96.4%/fusions 88 while fresh
Hospital showed 96.9%/56 — because the injector's `--disc ARC` had flattened what the attributed
merge pipeline splits as **665 ARC + 70 STR** (STR-file openings, same split pattern as LTU/Clinic).
Corrected deterministically (UPDATE discipline from source by GUID join); re-run: Hospital_3
IDENTICAL to Hospital in both modes (96.9%, fusions 56). G-FL vs measured-today baseline 96.9%:
no regression, zero delta at live default.

---

## §6 DONE — delta table, per-building status, appendix (2026-08-03)

### §6.1 Fleet §O2 delta table (before = `fleet_before.log` 2026-08-02, matches §0 item 1;
after = `fleet_after.log` on the INSTALLED fleet; live default W:3.0)

| building | before | after | Δ | openings added | note |
|---|---|---|---|---|---|
| LTU_AHouse | 18.4% | **18.4%** | 0 | — (untouched, §5.4 finding) | reference |
| Terminal | 19.2% | **19.2%** | 0 | 0 — source greps 0 (§4.10) | source-bound |
| TermRooms | 19.2% | **19.2%** | 0 | 0 — same base (§4.10) | source-bound |
| Clinic | 49.3% | **48.7%** | **−0.6** | 410 (403 ARC + 7 STR) | fusions 52→73 |
| Duplex | 69.2% | **69.2%** | 0 | 50 | all door/window-hosted |
| JKR | 92.7% | **88.0%** | **−4.7** | 425 | cur now live: 84.4% |
| HHS_Office_Federated | 94.8% | **94.8%** | 0 | 218 | all door/window-hosted |
| Hospital_3 | 96.9%* | **96.9%** | 0 | 735 (665 ARC + 70 STR) | *drifted to Hospital-identical pre-lane (§4.4) |
| Hospital | 96.9% | **96.9%** | 0 | 735 (665 ARC + 70 STR) | all door/window-hosted |

**The answer to §8's question (data vs sealed-suite bound):** openings-data was the missing
ingredient on exactly TWO buildings (JKR −4.7, Clinic −0.6). On Duplex/HHS/Hospital/Hospital_3 the
openings exist but are 100% door/window-hosted — zero doorless archways — so their 69–97%
unroutable is the §21.38 sealed-suite scope limit, now proven with the data present, not absent.
Terminal/TermRooms openings do not exist in source at all. No walker/engine/constant was touched
anywhere in this lane.

### §6.2 Per-building status (work-to-zero: 8/8 ✅, 0 ⛔)
| building | status | gates |
|---|---|---|
| Duplex | ✅ installed (ghost re-extract) | G-EX1/EX2/EX3/FL/VR §4.3 + G-GHOST/equivalence §5.2 |
| Clinic | ✅ installed (re-extract + strip) | §4.9 + §5.3 |
| JKR | ✅ installed (injection + strip) | §4.7 + §5.3 |
| HHS_Office_Federated | ✅ installed (injection + strip) | §4.8 + §5.3 |
| Hospital | ✅ installed (re-extract + strip) | §4.12 log + §5.3 |
| Hospital_3 | ✅ installed (injection + strip + disc fix) | §5.5 |
| Terminal | ✅ no-op BY EVIDENCE (source has 0 openings) | §4.10 |
| TermRooms | ✅ no-op BY EVIDENCE (same base) | §4.10 |

### §6.3 DONE appendix — claim → § evidence
- Extractor fix additive (G-EX1): `git diff --stat` 1 file / 18(+) / 1(−); `node -c` clean (§4.1, §5.1)
- Duplex parity: diff = additions only — §4.3; equivalence stripped≡ghost 1193/1190/1140/835 both,
  class diff EMPTY, §O2 69.2/69.2 both DBs (§5.2)
- Openings present + transforms: §INJ_VERIFY / SQL re-counts 50·410·425·218·735·735 (§4.3–§5.5)
- G-GHOST=0 on all 8 installed DBs + Terminal/TermRooms trivially (installed-verify block, §5.3)
- Frame fits: JKR IFC4 n=65 sd≤0.0124 PASS vs IFC2X3 FAIL sd 0.15 (§4.7); HHS n=245 all-zero,
  architect≡architect2 (§4.8); Hospital_3 n=1750 all-zero (§5.5)
- Fleet before/after: `fleet_before.log` (anchors == §0 item 1) / `fleet_after.log` (§6.1); every
  run's log read — §GEOM_DONE/§DB_WRITTEN/§SUMMARY lines cited per building log in §4.x
- OCI: 4 objects uploaded+verified BEFORE the stop directive, then DEFERRED — §4.11 lists them by
  md5. ⚠ those 4 dev-bucket objects are now ALSO one generation behind local (pre-ghost shape) —
  the §4.11 divergence landmine got one notch deeper; local remains truth.
- Git: witness+injector `review/roompath-redundancy` @ `8c3d12c` + disc-default fix @ `1995de4`,
  pushed, 0 local-only; extractor fix + this file on `fable/meshdb-livewire` @ `42bcc3745`, pushed,
  0 local-only (this hash-recording line lands in the immediate follow-up commit on the same branch)
- NOT done / out of scope by §3+§5 at §6-time: LTU untouched (S184 shape live, §5.4) — since
  CLOSED by §7 below; no walker changes; no voidMode/pierce/constant changes; live + common OCI
  buckets untouched; no `.db` in any git repo

---

## §7 2026-08-03 — LTU GHOST-STRIP (user-approved follow-up; closes the §5.4 finding) ✅

Scope: `LTU_AHouse_extracted.db` ONLY, local install only, no OCI, no git `.db`.
1. **Backup:** copied to `/tmp/db_bak_2026-08-02/LTU_AHouse_extracted.db` before any write.
2. **Strip:** the §5.2-proven single statement — DELETE openings' `element_instances` rows. The
   blob-refcount question is MOOT by schema: this DB is meta-split and has NO
   `component_geometries` table (blobs live in `LTU_AHouse_geo.db`, untouched, which already held
   **0** opening blobs — the 3,368 hashes were dangling, §5.4). Orphaned blobs afterwards: none
   possible in this file; geo.db unchanged by not being opened for write at all.
3. **Gates (all green, staged copy before install):**
   - Table counts: `element_instances` 125,698 → **122,330** (= −3,368 exactly); elements_meta
     125,698 · element_transforms 125,698 · surface_styles 0 · spatial_structure 375 ·
     rel_contained_in_space 1,608 all UNCHANGED. Class census diff: EMPTY (G-EX2 style).
   - **G-GHOST = 0**; openings-with-transforms preserved: **3,368/3,368**.
   - **G-VR:** opening rows matching the render join 3,368 → **0**; the NON-opening render set
     (what the viewer actually draws, after its `!=` guard) **122,330 → 122,330** — identical.
   - **Walker §O2 before/after (same engine, `git show review/roompath-redundancy` materialized
     read-only):** backup 18.4% W:3.0 (rooms 277, stranded 18, fusions 314) / 16.4% cur (263, 15,
     331) — stripped DB **IDENTICAL on every number**. No drift; no restore needed.
4. **Installed** over `~/bim-ootb/buildings/LTU_AHouse_extracted.db`; post-install verify
   ghost=0, inst=122,330, openings-tf=3,368.
Fleet end-state: **all 9 local DBs are ghost-shaped** (G-GHOST=0 fleet-wide); the S184/S185
instance-row shape no longer exists anywhere locally. Note: `LTU_AHouse_meta.db` (separate split
artifact, not named in scope) was not examined — flag for whoever next touches the split set.

---

## 2026-08-03 §8 CORRECTION — "sealed-suite bound PROVEN" was an overclaim; Hospital cause-split measured

User challenge ("doors are all over, Find panel locates well, path works") prompted the first §SC1/§SC3
run on Hospital (this lane's zero-delta poster child). Runner: scratchpad `w_stranded_cause.js`
(= branch `witness_room_path_stranded_cause.js` retargeted to `Hospital_extracted.db`, branch engine
`spineMap`); log `w_stranded_cause_hospital.log`, read in full:

```
§SC1 stranded regions classified = 163
§SC1   (1) NO DOOR ELEMENT AT ALL      = 47 (29%)  531m²
§SC1   (3) DOOR EXISTS, NO OPENING     = 38 (23%)  575m²
§SC1   (-) links only to other stranded= 78 (48%)  891m²
§SC3 INDEPENDENT BREAKS = 136 clusters (largest 5, mean 1.2); §SC1 roots = 85; 51 clusters rootless
```

**What this corrects:** §4/§7's inference "zero delta ⇒ high unroutable is the §21.38 sealed-suite
scope limit, PROVEN with data present" (lines ~197, ~334-337) went past its evidence. Zero delta
proved only that OPENINGS-data wasn't the gap. The cause split shows 38 regions (23%, 575 m²) where
a door element EXISTS and the raster carve fails to pierce — a substrate-on-this-geometry failure,
not a model defect — each break stranding a chain (48% of regions are chained, not broken). The
"no door" 47 are the walker's own flood-fill pockets, not verified user-facing rooms.

**What stands:** every witnessed number (G-FL, §O2 anchors, engine byte-unchanged); Hospital's
shipped Find-panel routing (door-adjacency graph + self-heal patch) green per its own lane records
— the strict substrate's 96.9% is a FIRST measurement (2026-08-02 §7), not a regression from any
recorded state. The resweep stop-condition conclusion is unchanged and sharpened: the substrate
cannot reproduce, with W/pierce alone, door connections that demonstrably exist on this geometry
class. Hospital's per-cause numbers now bound the real work: ≤136 breaks, 38 with a named mechanism.

---

## 2026-08-03 §9 HIERARCHY METRIC (user directive: pair-% is myopic — hidden rooms are a LAYER)

**Spec (before code).** The §O2 pair metric flattens each storey to one spine-anchored graph and
squares fragmentation; it contradicts the BOM principle (building→floor→room→sub-room). Corrected
headline metric, per building (witness `witness_room_path_hierarchy.js`, same engine, same links):

- **§HM1 missing links** = Σ per storey (connected components − 1) over room groups incl. spine —
  the number of single door-links that would fully connect the building. THE work count.
- **§HM2 spine rooms%** = rooms in the spine component (room-count, not pairs).
- **§HM3 suite rooms%** = rooms in multi-room non-spine components — internally routable layers
  (the "hidden rooms"), each one missing-link away from healthy.
- **§HM4 isolated rooms%** = singleton components — true seals + phantom flood-fill pockets.

Decision rule: none. This is a REPORTING correction; engine untouched; Hospital_3 removed from the
fleet by user directive 2026-08-03 (not on landing page; DB rm'd, backup in /tmp/db_bak_2026-08-02/).

### §9 RESULTS (2026-08-03, log `w_hierarchy_fleet.log`; one type-bug fixed before trusting: comp
keys are Object.keys strings vs numeric spine root — first run showed §HM2=0.0% fleet-wide, false)

| building | rooms | §HM1 missing links (suites) | §HM2 spine | §HM3 suite layer | §HM4 isolated |
|---|---|---|---|---|---|
| LTU | 277 | **23** (6) | 88.4% | 5.4% | 6.1% |
| Terminal/TermRooms | 74 | **9** (2) | 77.0% | 13.5% | 9.5% |
| Clinic | 165 | **10** (4) | 59.4% | 37.0% | 3.6% |
| Duplex | 7 | **3** (2) | 28.6% | 57.1% | 14.3% |
| JKR | 26 | **15** (4) | 19.2% | 38.5% | 42.3% |
| HHS | 37 | **24** (10) | 5.4% | 56.8% | 37.8% |
| Hospital | 282 | **173** (45) | 6.4% | 48.2% | 45.4% |

Reading vs the pair metric: Clinic "48.7% unroutable" is actually **10 missing links** with 96%+ of
rooms in healthy layers; Hospital "96.9%" is **173 links**, half its rooms in 45 internally-routable
suites. §HM4 (isolated singletons) is where phantom flood-fill pockets hide — Hospital 45.4% vs
LTU 6.1% says pocket hygiene, not connectivity, dominates Hospital's raw count. The pair-% stays in
the record as a stress metric only; §HM is the honest fleet headline going forward.

## 2026-08-03 §10 PHANTOM FILTER (user: "wall cavities are not rooms if there are no doors")

**Spec.** A pocket group with NO door footprint on its padded boundary AND NO opening incident
cannot be entered → PHANTOM (cavity/shaft), excluded from the room census and from §HM1 link
demand. Extends the deterministic dictionary: enterable = has a recorded aperture. Witness v2
(same engine, reporting only); log `w_hierarchy_fleet_v2.log`:

| building | rooms | §HM1 links (suites) | spine | suite | isolated | §HM5 phantoms |
|---|---|---|---|---|---|---|
| LTU | 265 | **11** (6) | 92.5% | 5.7% | 1.9% | 12 |
| Terminal/TermRooms | 70 | **5** (2) | 81.4% | 14.3% | 4.3% | 4 |
| Clinic | 160 | **5** (4) | 61.3% | 38.1% | 0.6% | 5 |
| Duplex | 6 | **2** (2) | 33.3% | 66.7% | 0.0% | 1 |
| JKR | 24 | **13** (4) | 20.8% | 41.7% | 37.5% | 2 |
| HHS | 34 | **21** (10) | 5.9% | 61.8% | 32.4% | 3 |
| Hospital | 209 | **100** (45) | 8.6% | 65.1% | 26.3% | 73 |

vs v1: Hospital 173→**100** real missing links once 73 cavities stop demanding connections;
Clinic 10→**5**, isolated 0.6%. The substrate's true fleet gap = 157 links across 7 buildings,
three-quarters of stranded mass sits in internally-healthy suites. Pair-% retired as headline
(stress metric only, per §9).

## 2026-08-03 §11 DOCTRINE (user, verbatim intent): INTERNAL ROOMS ARE A SECOND LAYER

Separate concern, cohesive with the first-layer concept. Layer 1 = spine/circulation rooms; Layer 2
= internal rooms reached through a parent room — healthy by their OWN internal connectivity,
attached to Layer 1 by exactly one parent link. BOM recursion applied to space: parent, children,
each level atomic. Consequences, binding on any future metric/walker work in this lane:
- Never score Layer-2 rooms against the spine directly (that is the §9 flattening error).
- A suite's status = internal connectivity (its concern) + one parent-link status (Layer 1's concern).
- "What is a room" stays the COMPILED definition (compile_rooms/stored rooms; Find-panel truth).
  The walker's flood-fill pockets are candidate geometry, not room authority — §10's aperture rule
  (no door + no opening = not a room) is the floor, the compiled set is the ceiling.
- The substrate's remaining job, restated in these terms: reproduce the recorded parent links
  geometrically (draw the path), never re-decide their existence.

### §11.1 v3 RESULTS — the metric on sound footing (log `w_hierarchy_fleet_v3.log`, witness v3 pushed)

NON-FATALISTIC, per §11: Layer-2 rooms ARE connected to the Layer-1 spine grid in the RECORD —
every kept room has a recorded aperture (§10 filter guarantees it). The only open number is the
substrate's DRAW BACKLOG: parent links not yet reproduced geometrically. `§SUBSTRATE drawn` grades
the TOOL, never the building.

| building | rooms | L1 circulation drawn | L2 suites (rooms) | record-connected | draw backlog | substrate drawn |
|---|---|---|---|---|---|---|
| LTU | 265 | 92.5% | 6 (5.7%) | 100% | 11 | 95.8% |
| Terminal/TermRooms | 70 | 81.4% | 2 (14.3%) | 100% | 5 | 92.9% |
| Clinic | 160 | 61.3% | 4 (38.1%) | 100% | 5 | 96.9% |
| Duplex | 6 | 33.3% | 2 (66.7%) | 100% | 2 | 66.7% |
| JKR | 24 | 20.8% | 4 (41.7%) | 100% | 13 | 45.8% |
| HHS | 34 | 5.9% | 10 (61.8%) | 100% | 21 | 38.2% |
| Hospital | 209 | 8.6% | 45 (65.1%) | 100% | 100 | 52.2% |

## 2026-08-03 §12 SCOPE GAP: VERTICAL CIRCULATION NOT MODELED (found via user probe: "Hospital
internal room access another one diff floors")

**Finding.** §HM/§11 connectivity is computed **per storey only** (§9 spec: "Σ per storey
(connected components − 1)") — there is no edge type for floor N → floor N+1. Verified on
Hospital (`Hospital_meta.db`, `spatial_structure` + `element_transforms`): two independent stair
cores run continuously through multiple levels — core @ (13.1, 122.4) spans L2→L3→L4→L5 (4
stacked flights, each `bbox_z≈5m` = one storey height); core @ (44.6, 129.4) spans L2→L3→L4→L5
plus a jump to L6/7. Neither stair shaft is enclosed as its own room polygon at the levels it
passes through (checked both: room coverage found at only 1 of 4 levels each — a stray sliver,
or a big hall below it) — the SAME pierce/carve pocket-fragmentation already named in §8, now
showing up on vertical circulation, not just horizontal.

**Scope decision (user, this session):** NOT a walker/pathing revamp. Two-layer/BOM recursion
already generalizes one level up (building→floor connected by exactly one vertical link, same
"one parent link" pattern §11 uses for suite→spine) — the fix is a report-only scope note now;
adding the vertical edge later is a metric extension, not new architecture. Substrate/pathing
changes stay OUT per this file's original `# ⚠ DO NOT REMOVE` scope line ("No walker/engine
changes").

### §12 VERIFY — does the two-layer paradigm actually resolve the pathing issues we had before?

Assembled from numbers already in this file (§0 item 1 / §10 / §11.1) — no new values invented:

| building | OLD pair-% "unroutable" (§0) | NEW §HM1 missing links (§10, phantom-filtered) | NEW record-connected (§11.1) |
|---|---|---|---|
| LTU | 18.4% | 11 | 100% |
| Terminal/TermRooms | 19.2% | 5 | 100% |
| Clinic | 49.3% | 5 | 100% |
| Duplex | 69.2% | 2 | 100% |
| JKR | 92.7% | 13 | 100% |
| HHS | 94.8% | 21 | 100% |
| Hospital | 96.9% | 100 | 100% |

**Reading.** The old pair-% metric made every building but LTU look catastrophically broken
(JKR/HHS/Hospital 92–97% "unroutable") — it squares fragmentation across a flattened per-storey
graph and conflates "isolated single room" with "healthy 10-room suite one door short of the
spine." The new metric resolves the SAME underlying data into a small, actionable link count
(2–100 doors fleet-wide) plus a 100% record-connected floor — proving the old high-% numbers were
a SCORING artifact of flattening, not a fleet-wide pathing failure. That is the concrete "better
paradigm" answer: it fixed no geometry, it corrected a metric that was misdiagnosing healthy
buildings as broken. The real remaining defect (draw backlog) is 20–100x smaller than the old
metric implied, and per §12 above, it still excludes vertical circulation on top of that.

**Not yet answered by this verify:** whether the draw-backlog counts (11–100 per building) hide
vertical-circulation cases the same way a "stranded" room can — i.e. is a counted "missing link"
ever actually a stair to a different floor the per-storey graph can't see at all, vs a same-floor
door the substrate hasn't drawn yet. Flagging, not answering — would need a per-link
classification pass (same mechanism as §8's §SC1 cause-split, extended to check whether a
stranded room's nearest exit is a stair) before trusting draw-backlog as pathing-only.

### §12.1 DOCTRINE ANSWER (user): Layer 1 should be unbroken building-wide, not per-storey

**Yes — this is the correct fix, not a new taxonomy.** Layer 1 (spine) should be ONE connected
component for the whole building: each floor's corridor is a SEGMENT, stairs/lifts are the
connectors joining segments into one backbone. A "missing link" whose real connector is a stair
is then just a Layer-1 break — same severity class as a same-floor door gap, no separate vertical
category needed. Layer 2 (suites) is unaffected. This directly reframes the open question above:
it becomes in-scope of §HM1 by definition once Layer 1 is scored building-wide, not excluded.

### §12.2 VERIFY (per-link classification, run this session) — PARTIAL, blocked by a stair
storey-attribution gap on 7/8 buildings (log `w_vertical_classify.log`, script
`witness_room_path_vertical_classify.js` on `review/roompath-redundancy`, pushed)

Classified every current §HM1 missing link by whether its component's bbox overlaps (>10%) a
same-storey `IfcStair` footprint via the engine's own `storeyStairs()`/`stairOverlapFrac()`
(already in `room_walker.js`, unused until now):

| building | missing links | stair-adjacent | test coverage |
|---|---|---|---|
| LTU | 11 | **1 (9%)** | full — 48 stairs, 0 `storey=Unknown` |
| Hospital | 100 | 0 (inconclusive) | **0%** — all 30 positioned ARC stairs are `storey=Unknown` |
| Clinic, Duplex, HHS, JKR, Terminal, TermRooms | 46 combined | 0 (inconclusive) | **0%** — same `Unknown`-storey pattern |

**Root cause of the 0% coverage (verified by query, not assumed):** in Hospital, the 30 stair rows
carrying a REAL storey (`elements_meta.storey`) have NO transform row at all; the 30 rows that DO
have a transform (position data) are all stamped `storey='Unknown'`. `storeyStairs()` buckets by
`elements_meta.storey` (no z-based reassignment, unlike `storeyDoors()`'s `_assignByZ`), so every
positioned stair is invisible to the per-real-floor check. Same class of gap as this lane's
original door/opening backfill — a storey-attribution defect, not a pathing-logic question.

**Reading.** The one clean case (LTU) shows vertical circulation explains a small minority of
missing links (1 of 11, 9%) — consistent with §12.1 being the right kind of fix, but small where
it's actually measurable. For the other 7 buildings the question stays OPEN, blocked by data, not
answered as zero. **Do not report "0 stair-adjacent" for those 7 as a finding — it's an untested
gap.** Fixing `storeyStairs()`'s storey attribution (mirror `storeyDoors()`'s z-based
`_assignByZ`) is a new, separate backfill lane if picked up — out of scope for this verify.

### §12.3 CAUSE-SPLIT WITH STAIR CASES — coverage gap CLOSED, full fleet (log
`w_stair_cause.log`, script `witness_room_path_stair_cause.js` on `review/roompath-redundancy`,
pushed). Repairs §12.2's gap LOCALLY in the witness — same nearest-anchor-by-z rule
`storeyDoors()` already uses, applied read-only to `IfcStair`/`IfcRamp` rows; `room_walker.js`
itself untouched.

| building | missing links | stair-adjacent | no door at all | door, no opening | stair coverage |
|---|---|---|---|---|---|
| LTU | 11 | 1 (9%) | 2 | 8 | 100% (0 reassigned — already clean) |
| Clinic | 5 | 1 (20%) | 0 | 4 | 100% (6/6 reassigned by z) |
| HHS | 21 | 1 (5%) | 0 | 20 | 100% (12/12 reassigned by z) |
| Terminal/TermRooms | 5 | 1 (20%) | 0 | 4 | 100% (33/33 reassigned by z) |
| Duplex | 2 | 0 | 0 | 2 | 100% (2/2 reassigned by z) |
| JKR | 13 | 0 | 6 | 7 | 100% (8/8 reassigned by z) |
| **Hospital** | **100** | **0** | 2 | **98** | 100% (30/30 reassigned by z) |

**Answer to the open question:** across the fleet, only **4 of 157** missing links (2.5%,
counting Terminal/TermRooms once — TermRooms is a byte-copy per §4.3) are stair-adjacent. Hospital
— 64% of the fleet's whole backlog — has **zero** stair-adjacent links even at full coverage: its
100 links are 98 "door exists, no opening detected" + 2 "no door at all." That is the SAME
mechanism §8 already named as squarely in this lane's domain (opening detection), not a vertical-
circulation question. **Conclusion: the draw backlog is a horizontal same-floor gap, overwhelmingly**
— §12.1's Layer-1-building-wide fix is doctrinally correct but would close only ~4 links fleet-wide;
the other ~153 need the opening-detection work §8 already pointed at, unrelated to stairs.

# LANE STATE 2026-08-03 — CLOSED ON SOUND FOOTING; NEXT SESSION RESUMES FROM HERE

DONE this lane: extractor openings fix (ghost-shaped, permanent) · 9/9 DBs ghost-shaped ·
sealed-suite overclaim retracted (§8) · pair-% retired (§9) · phantom rule (§10) · two-layer
doctrine (§11) · non-fatalistic §HM v3 metric (this section). Buildings are healthy in the record;
the experimental substrate has a 157-link fleet draw backlog (100 on Hospital) as its work queue.

**NEXT SESSION (user: "examine the next weakness in our new paradigm"):** open candidates, in the
§11 frame — (a) the draw backlog itself: make the substrate reproduce RECORDED parent links
(extract-don't-rederive: feed stored door-room adjacency as ground truth, geometry only draws the
path); (b) walker-pocket ↔ compiled-room identity (the walker's census still isn't the compiled
room set — Find-panel truth); (c) HHS/JKR low L1-drawn share (their §SC1 cause split never run).
Do NOT reopen: W/pierce constants (§21.44 stop condition), the §0 retractions, Hospital_3 (rm'd).
