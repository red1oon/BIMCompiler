# ⚠ DO NOT REMOVE — Geometry Truth Chain: DB file → loader → rendered scene, witnessed at every link
# SCOPE: ONE generality — the app must PROVE that what it renders is the real data, instead of
#   trusting it. Two links, two witnesses, one lane: (link 1) load-time IDENTITY — which DB copy
#   actually loaded and is it the authoritative one; (link 2) render-time FIDELITY — did real
#   geometry actually reach the scene, or box-proxies. Every recurring "building has no X" /
#   "low LOD again" mystery of the past month broke one of these two links; nothing witnessed
#   either. Implementation in bim-ootb (viewer/ + modeller/ loaders + tests/); spec lives here.
#   (Supersedes/merges the two 2026-07-19 spec files DB_IDENTITY_MANIFEST_WITNESS.md and
#   RENDER_FIDELITY_TRIPWIRE.md — user 2026-07-20: "aren't they pertaining to the same
#   generality?" Yes. One chain, one file.)
# Read the log after every run — exit code is not evidence. §-witness lines are the deliverable.

## BACKSTORY — why this chain, and why now
**2026-07-01, the scar (link 2 broken, invisible):** the Modeller rendered EVERY element as a
12-triangle bounding box — 100% fake geometry — while the real meshes (`component_geometries`,
keyed by `geometry_hash`) sat unread in the SAME .db. Measured live: SampleCastle `boxCount=3225,
otherCount=0`. **All 32 Modeller witnesses stayed green** — every one asserts something a box
satisfies IDENTICALLY to the real mesh (counts, bbox centres/extents, pixel-diffs). The only
detector that fired was the user's eye on a screenshot ("this cannot be true"). The fix that
followed was deep (`modeller/real_geometry.js`, `§GEOM-HARDFAIL` loud+skip never-silent-box) — but
no witness was ever taught to SEE fake-vs-real, so the suite is exactly as blind today. Memory:
`project_modeller_lod400_real_geometry`, `feedback_test_real_user_path_not_seams`,
`feedback_no_fake_lod_unbreakable` (UNBREAKABLE rule this chain enforces mechanically).

**All month, the other break (link 1, also invisible):** buildings exist as MULTIPLE unversioned DB
copies with silently different contents, and no loader ever declared which copy it resolved.
Confirmed casualties: HHS "0 stairs" published to a scoreboard then flipped to 20 (two copies
disagreed; the NEWER mtime was the emptier one — `project_db_snapshot_divergence_landmine`); a full
session burned testing Hospital trees against `modeller/Hospital_ARC.db` — 14,641 meta rows, ZERO
geometry, only boxes CAN render from it (`prompts/HOSPITAL_TREES_NOT_RENDERING.md`).

**2026-07-19, the trigger:** user reports the Modeller "keep falling back to low LOD when this was
cleared so deeply." That is the chain failing somewhere between file and screen — and today neither
link can say which. Identity answers "wrong data?"; fidelity answers "wrong render?"; together the
whole mystery class becomes a two-line log read.

**Why automatable only now:** the old blocker — "big buildings won't stream in a test window" (a
2-min Playwright ceiling reached 29% of Hospital) — was disproven 2026-07-19: the full
63,182-element Hospital streams headless in ~6 min (small buildings in seconds) via puppeteer +
`--use-gl=angle --use-angle=swiftshader`, polling `streamedCount` to completion with NO progress
ceiling. Working harness pattern: `HOSPITAL_TREES_NOT_RENDERING.md` §RESOLVED.

## SPEC
### S0 — Diagnose the live Modeller low-LOD complaint FIRST (cheapest, answers the user)
Open the Modeller on the building(s) the user sees fall back to low LOD. Read from the console:
`§GEOM-HARDFAIL` / `§BLOB_MISS` counts + WHICH DB file path was loaded. Record the verdict here:
- misses > 0 → **link 1 (data plane)**: that entry path resolves a geometry-less/partial copy. Fix
  = repair the pairing for that path (point at the full extracted DB, or regenerate the ARC subset
  WITH its `component_geometries`) — NOT a rendering change.
- misses = 0 and still boxes → **link 2 (code)**: genuine regression in the real-geometry layer →
  STOP, record findings here, open a separate fix lane (diagnose-in-session, fix-in-other-session).

### S0 RESULT 2026-07-20 — ✅ DONE. Link 1 is CLEAN; link 2 is BLIND (and the spec's own premise was wrong)
Measured, not argued. Data plane first (`sqlite3`, no browser), then live headless Modeller
(`/tmp/wt-sandbox` @ `localhost:8399`, playwright-core + swiftshader; probe kept at
`scratchpad/probe_geom_truth.js`, logs `s0_probe*.log` / `s0_red.log`).

**(a) Link 1 (identity/pairing) — CLEAN, 100% coverage on all 8 Modeller residents.** The ARC dbs
carry NO `component_geometries` BY DESIGN: `str_walker_outliner.js` RESIDENTS pairs every one of
them with a SHARED `modeller/mesh.db` (9,198 geometries, all 8 buildings present), and the mesh link
lives in `element_instances(guid, geometry_hash)` — NOT in `elements_meta` (which has no hash column
at all). Joining each ARC db's `element_instances` against `mesh.db.component_geometries`:

| resident | ARC db | meta | instances | distinct hashes | covered | cov% |
|---|---|---|---|---|---|---|
| SampleHouse | SampleHouse_ARC.db | 60 | 58 | 46 | 58 | **100%** |
| Duplex | Duplex_ARC.db | 218 | 215 | 155 | 215 | **100%** |
| SampleCastle | SampleCastle_ARC.db | 3342 | 3225 | 1924 | 3225 | **100%** |
| HHS | HHS_ARC.db | 2560 | 2527 | 619 | 2527 | **100%** |
| Clinic | Clinic_ARC.db | 2620 | 2586 | 1467 | 2586 | **100%** |
| Hospital | Hospital_ARC.db | 14641 | 14409 | 3568 | 14409 | **100%** |
| HospitalGarage | Garage_ARC.db | 1271 | 1252 | 476 | 1252 | **100%** |
| Terminal | Terminal_ARC.db | 35552 | 35552 | 917 | 35552 | **100%** |

⚠ **This CORRECTS this file's own BACKSTORY.** The claim "`modeller/Hospital_ARC.db` — 14,641 meta
rows, ZERO geometry, only boxes CAN render from it" is **FALSE as stated**: it reads the ARC db in
isolation and misses the `mesh.db` pairing, under which Hospital resolves 14,409/14,409. The lost
session it cost was a *pairing-blindness* casualty — which is precisely the argument FOR `§DB_IDENTITY`
(S2), but it means the S1/S2 manifest MUST record the **pair** (meta db + its geo substrate + join
coverage), never a bare per-file `geo=` count. A per-file count would have "confirmed" the same
wrong conclusion. The VERIFICATION section's red case is retargeted accordingly (see below).

**(b) Live fidelity census — GREEN, and the 2026-07-01 scar is measurably dead.** Triangle census
over `window.A.scene` after a full ARC seed:

| building | elements | tris | tris/element | blobMiss | hardFail | verdict |
|---|---|---|---|---|---|---|
| SampleHouse | 38 | 24,564 | 646.4 | 0 | 0 | REAL |
| Duplex | 196 | 24,852 | 126.8 | 0 | 0 | REAL |
| SampleCastle | 3,225 | 237,504 | 73.6 | 0 | 0 | REAL |
| HHS | 1,077 | 335,240 | 311.3 | 0 | 0 | REAL |

SampleCastle's `elements=3225` is the **exact** 2026-07-01 scar population (`boxCount=3225,
otherCount=0`). All-boxes would be 3225 × 12 = **38,700** tris; measured **237,504** = 6.1× that.
Real geometry, proven numerically for the first time.

**(c) 🔴 THE FINDING — the existing "no silent box" guard is BLIND to whole-substrate loss.**
Fault injection (no DB touched — resident's `geoDb` repointed to a nonexistent file, so the loader
takes its documented meta-only fallback), Duplex:

`§GEOM_TRUTH_PROBE building=Duplex geoDb=NO_SUCH_mesh.db elements=196 tris=2354 trisPerElement=12.0 blobMiss=0 hardFail=0`

- **`trisPerElement = 12.0` EXACTLY** — the 12-triangle box signature, hit dead-on. Against green
  Duplex's 126.8 that is a **10.6× separation**: the metric the spec proposed works, unambiguously.
- **`hardFail=0` and `blobMiss=0` — BOTH GUARDS STAYED SILENT while rendering 100% box proxies.**
  `§GEOM-HARDFAIL` (`arc_editable.js:159`) only fires when the db *has* a geometry substrate but an
  individual element's link into it is broken. When the substrate is absent ENTIRELY, `buildSeedOps`
  falls back to the ARC db itself, nothing has a mesh, nothing is "broken" — and it reports
  `total=0`, i.e. **"all clean" while 100% fake**. The only signal was one `console.warn`
  (`§STRWALK-OPEN geoDb fetch failed … seeding meta-only`), which no witness asserts on.

That is the 2026-07-01 scar shape, still fully live today, and it settles the design: **`§GEOM-HARDFAIL`
is NOT sufficient as the S3 fidelity witness — the triangle census is load-bearing, not a nice-to-have.**
S3 MUST assert on tris/element, and S2 MUST warn on a *substrate* that failed to load, not only on
per-element misses.

**S0 verdict per the spec's own fork:** misses = 0 AND geometry is real → the low-LOD complaint is
**NOT** reproducible on the 8 residents at `origin/main` in a headless full seed. It is therefore
neither a stale-copy (link 1) nor a general real-geometry regression (link 2) on this path. The
live-site path is NOT yet ruled out — the deployed Modeller may serve a different `mesh.db`, and a
`geoDb` fetch failure there (404 / SW cache miss / partial IDB) reproduces (c) EXACTLY: silent
boxes, zero warnings in any witness. **That is the leading hypothesis and S2's `§DB_IDENTITY` is
what makes it a one-line log read instead of a session.** ⛔ BLOCKED for user confirmation:
*which building + which URL (live GH-Pages vs localhost) shows the low-LOD fallback?* — proceeding
with S1–S3 regardless, since they are what turns that answer into evidence.

### S1 — Link 1a: `buildings_manifest.json` (per app root that serves DBs)
Building name → { authoritative db path/URL, expected `elements_meta` count, expected geometry rows
(`component_geometries` or paired `_geo.db`/`_library.db`), sha256 optional first pass — counts
alone already catch every casualty above }. GENERATED by a small read-only script, never hand-typed;
regenerate on demand; commit the JSON (text, not a DB binary — the DB-binary ban is unaffected).

### S2 — Link 1b: `§DB_IDENTITY` witness in every loader
(Viewer `streaming.js`/`db_resolve.js`; Modeller's DB open path.) On every building open, ONE line:
`§DB_IDENTITY name=<building> path=<resolved db> meta=<n> geo=<n> manifest=<match|MISMATCH|absent>`
- two cheap COUNT(*) queries at open time; MISMATCH → loud `console.warn` + status-bar hint,
  non-blocking (never brick a load, just make divergence impossible to miss); `absent` allowed and
  logged — additive, zero behavior change.

### S3 — Link 2: `§RENDER_FIDELITY` tripwire witness (headless, `tests/witness_render_fidelity.js`)
After a FULL load of a canonical building, evaluate in-page:
- `§BLOB_MISS` line count (must be 0) and `§GEOM-HARDFAIL` count (Modeller; must be 0);
- triangle census: walk the scene (BatchedMesh/InstancedMesh/Mesh), sum index counts — 12
  tris/element box populations are unmistakable vs real meshes (the 2026-07-01 numbers prove the
  metric separates the states). NOT screenshots/counts/pixel-diffs — those are exactly the
  assertions boxes already passed.
Emit ONE line per building:
`§RENDER_FIDELITY building=<name> tris=<n> elements=<n> trisPerElement=<x> blobMiss=<n> hardFail=<n> verdict=REAL|FAKE|PARTIAL`
Thresholds from measured baselines recorded in this file on first green run, never invented.
Fixtures: default Duplex + SampleCastle + BimWhale_Advanced (seconds-to-~1min, covers standalone/
instanced/batched + real RPC entourage); manual flag adds Hospital + Terminal fulls (~6 min each).
Local DBs exist for all five (`deploy/buildings/`). Standalone `node tests/…` against a worktree
server (same pattern as the 2026-07-19 staffage witnesses); CI-wiring optional second step (repo
truth model is local-discipline-first, `docs/TestArchitecture.md` §Truth Model).

### S1–S3 RESULT 2026-07-20 — ✅ ALL THREE BUILT, GREEN **and** RED witnessed
Branch `feat/geometry-truth-chain` (bim-ootb), worktree `/tmp/wt-geom-truth`, server :8412.
Logs: `s1_manifest.log`, `s3_green.log`, `s3_red.log`.

**S1 ✅ `scripts/gen_buildings_manifest.js` → `modeller/buildings_manifest.json`.** Generated, never
hand-typed. Parses the RESIDENTS table out of the shipped `str_walker_outliner.js` (so the manifest
can never describe a pairing the app doesn't actually use) and COUNTs each pair out of the real DBs.
Records `geoCovered`/`geoMissing` — the JOIN across the pair — as authoritative, plus
`geoRowsInMetaDb` (0 = HEALTHY for ARC residents) so the S0(a) misread can't recur. `--check` mode
re-derives and exits 1 on drift (CI-able). All 8 residents 100%; `mesh.db` = 9,198 geometries.

**S2 ✅ `§DB_IDENTITY` in `str_walker_outliner.js`** (in `_seedArcEditable`, the one point where the
meta db AND the resolved substrate are both open — so counts are the ACTUALLY-resolved state).
Log-only, never blocks a load. Green line:
`§DB_IDENTITY name=Duplex path=Duplex_ARC.db meta=218 inst=215 geo=215/215 substrate=mesh.db substrateRows=9198 manifest=match`
Two independent loud paths: `manifest=MISMATCH` (wrong copy), and a `geo=0` guard that fires even
when the manifest is absent (the silent-box state).

**S3 ✅ `modeller/tests/witness_render_fidelity.js`** — triangle census, both directions.

GREEN (exit 0, 4/4 REAL, all `manifest=match`, zero warns):
| building | tris | elements | tris/element | verdict |
|---|---|---|---|---|
| SampleHouse | 24,564 | 38 | 646.4 | REAL |
| Duplex | 24,852 | 196 | 126.8 | REAL |
| SampleCastle | 237,504 | 3,225 | 73.6 | REAL |
| HHS | 335,240 | 1,077 | 311.3 | REAL |

RED (fault injection at the loader seam — resident `geoDb` repointed to a nonexistent file; **NO DB
file touched**, honouring the 2026-07-19 directive):
| building | tris | elements | tris/element | verdict | old guards |
|---|---|---|---|---|---|
| Duplex | 2,354 | 196 | **12.0** | FAKE | hardFail=0 blobMiss=0 (SILENT) |
| SampleCastle | 38,702 | 3,225 | **12.0** | FAKE | hardFail=0 blobMiss=0 (SILENT) |

**SampleCastle RED = 38,702 tris vs the predicted 3,225 × 12 = 38,700 — the 2026-07-01 scar
reproduced numerically to within 2 triangles.** Both new witnesses trip on it; both pre-existing
guards stay green. That is the blind spot, now covered.

**Baselines (measured, never invented):** box signature = 12.0 tris/element exactly; lowest real
fixture = 73.6. Threshold `REAL_MIN_TPE = 24` (2× box) sits with ~3× margin on both sides.
`PARTIAL` verdict covers mixed populations between the two.

### S2 VIEWER HALF 2026-07-20 — ✅ DONE (was MISSED in the first pass; user caught it)
S2 names BOTH loaders — "(Viewer `streaming.js`/`db_resolve.js`; Modeller's DB open path.)" — and the
first pass (`76f5d1b`) shipped only the Modeller half without flagging the omission. Corrected in
bim-ootb `ee9ca9b`. **This is the half on the production data plane**, so the miss mattered:

**The viewer blind spot, which is worse than the Modeller's.** Viewer building DBs live on **OCI**,
not in the page tree, and `db_resolve.js` **SELF-HEALS a 404** by rewriting `buildings/<file>` to the
OCI base and retrying (`§DB_404_OCI_RETRY`, `scene.js:668`). **That heal silently changes WHICH COPY
loads.** It logged that a rewrite happened and never what came back — so a heal onto a divergent or
emptier OCI copy is completely invisible. That is precisely the HHS "0 stairs published, then flipped
to 20" casualty this file's own backstory cites. It also covers the viewer's silent-box state:
`§SPLIT_GEO_FALLBACK_META` sets `libDb = meta db` and renders bboxes only, logging a reason but **no
counts** — so "geometry unavailable" and "geometry fine" produced equally calm logs.

Wired at all 4 branches where `libDb` finally resolves (split-geo / split-fallback-extracted /
split-fallback-meta / single-db). Keyed on db-url+building so a building switch reports again.
Witnessed live (headless, Duplex):
`§DB_IDENTITY name=Ifc2x3_Duplex_Federated path=/buildings/Duplex_extracted.db meta=1122 inst=1119 geo=1119/1119 libDb=self(meta) libRows=814 healedAssets=[Duplex_positions.bin] at=single-db`
Two things that line surfaces for free: the OCI heal DID fire this load (for a positions asset), and
the internal building name (`Ifc2x3_Duplex_Federated`) ≠ the file name (`Duplex_extracted.db`).

**Self-caught defect:** the first cut recorded only the LAST healed asset, so a healed
`positions.bin` printed as `healed=YES` beside a db path — reading as "the DB was swapped" when it
was not. Now reports the asset list explicitly. (The witness caught this, which is the point.)

### 📌 FINDING 2026-07-20 — `deploy/live/` is a STALE snapshot and is NOT what serves production
Raised by the user ("are you aware of `master:deploy/live/streaming.js`?"). Verified:

| | lines | `db_resolve.js` |
|---|---|---|
| `master:deploy/live/streaming.js` | 705 | **absent** |
| `bim-ootb/viewer/streaming.js` | 2,176 | present |
| **live GH Pages** `red1oon.github.io/bim-ootb/viewer/` | **2,176** (byte-count match) | **200 OK** |

**The live site serves the bim-ootb copy**, so `deploy/live/` is a ~3× divergent stale snapshot
(last promoted `06553cc90`), not the production path — and correctly NOT where §S2 belongs
(PRIME RULE forbids editing it anyway). Recorded because it is the same divergence class this whole
spec exists to kill, but for CODE instead of data: two copies of `streaming.js`, no version marker,
and the smaller/older one carries the more authoritative-sounding name (`deploy/live/`). Anyone
grepping `deploy/live/` for `§DB_IDENTITY` will correctly not find it and could wrongly conclude the
viewer is uninstrumented. ⛔ Whether to re-promote or retire `deploy/live/` is a user call
(OUT OF SCOPE here) — but it should not sit at 3× stale under the name "live".

### ⛔ SIDE-FINDING 2026-07-20 — `witness_e2e_lod_match.js` A3/A4 are RED ON `origin/main` (pre-existing, NOT this lane)
Ran as a regression check on the S2 edit (it exercises the same ARC seed path). It FAILS — and fails
**byte-identically on an untouched `origin/main` checkout** (`/tmp/wt-sandbox` @ `2b67445`), so it is
NOT a regression from this work. Recorded, not fixed (diagnose-in-session, fix-in-other-session):
```
❌ A3 doorSig={verts:3230, tris:1476} dbTruth={verts:762, tris:1476}
❌ A4 otherSig={verts:2532, tris:1248} dbTruth={verts:634, tris:1248}
```
**Read the numbers: `tris` match EXACTLY in both (1476=1476, 1248=1248); only `verts` diverge**
(~4.2× and ~4.0×). Triangles are the geometry-truth signal and they are correct — the meshes ARE
real (`§GEOM-HARDFAIL total=0 of 38 realResolved=38/38`, and this lane's own census independently
rates SampleHouse REAL at 646.4 tris/element). So this is near-certainly **witness GIGO on the
vert-count expectation** (a render-side split/dedup changes vert counts while preserving triangles —
the db's `vertex_count` is not the post-upload buffer's vert count), i.e. the test's ground truth is
wrong, not the code. Same shape as `feedback_witness_gigo_facing` ("fix the test"). ⛔ Needs its own
lane; do NOT "fix" the renderer to satisfy it without first re-deriving what `verts` SHOULD be.

### ❌ RETRACTED 2026-07-20 — the two sections below are WRONG. SampleCastle IS a live regression.
**Do not act on the "RESOLVED" / "TRACE" conclusions that follow.** They are kept verbatim, not
deleted, because HOW they went wrong is the lesson. The open item moved to
`prompts/Modeller/DISC_Walker/EMBED_8_ARC_BUILDINGS_MESH_DB.md` §OPEN REGRESSION —
**and was itself CLOSED later the same day** (§CLOSED 2026-07-20, that file): a data+code witness
pass (SQL byte-diff + live `§DB_IDENTITY`/`§GEOM-HARDFAIL`/`§BLOB_MISS`/triangle-census, no
screenshots) found both links clean on `origin/main` HEAD — verdict is a stale client-side cache in
the reporting browser, not a code/data regression. Go to that file's §CLOSED section for the numbers.

**What overturned them:** `/home/red1/bim-compiler/docs/img/modeller/workspace-open.png` (committed
2026-07-08). Its Outliner reads `SampleCastle-ARC (3342)`, status bar `3342 features` — same building,
same element count as today — and the render has pitched gabled roofs, dormers, recessed mullioned
windows, a bay projection. **SampleCastle was NOT blocky. The user's report was correct.**

**Why every measurement below was right and the conclusion still wrong:** a ~45% box fraction is
entirely compatible with that detailed image — walls/slabs/coverings are *legitimately* boxes; the
visible detail lives in the other 55%. So the box fraction NEVER discriminated between the good and
bad states, and matching rendered-vs-expected (1,498 vs 1,501) proved nothing about the regression.
**The session never LOOKED at the current render** — it answered "is the data present" (yes) and
reported that as "does it look right" (not established). The user had to say so twice.

**The standing rule this establishes:** for any *"renders wrong / blocky / low LOD"* report, **LOOK at
the render FIRST and diff it against the last known-good image in `docs/img/`.** Never open with
triangle counts. A count-only witness suite is precisely how the 2026-07-01 all-box scar stayed green
for a month — and §RENDER_FIDELITY below inherits that blind spot: it graded SampleCastle
`verdict=REAL` at 73.6 tris/element while the user could see with their eyes that it was wrong.
⚠ §S3's verdict must gain a visual/known-good-image comparison before it can be trusted on this class.

### ❌ WRONG (kept for the lesson) — the low-LOD complaint: SampleCastle is FAITHFUL, the DATA is coarse
User reported low LOD on **SampleCastle** via the pill-rail **Open** (the resident path S0 tested).
Measured, and it closes the month-long mystery.

**The distribution, not the mean.** SampleCastle renders **1,498 of 3,226 meshes at EXACTLY 12
triangles — 46.4%**. Histogram: `12:1498, 13-24:465, 25-50:640, 51-100:306, 101-500:215, 500+:102`
(min 2, max 7,676). A near-half box population — invisible behind the 73.6 average that S3 graded REAL.

**But those boxes are REAL.** Source `mesh.db` holds **866 of 1,924** distinct SampleCastle
geometries with a 144-byte faces blob = 12 triangles; instances resolving to a ≤12-tri real mesh:
**1,501**. Rendered 12-tri meshes: **1,498**. **Expected 1,501 vs rendered 1,498 — a match.**
The renderer is not substituting proxies; SampleCastle's IFC genuinely models ~46% of its elements
as box-shaped solids. **"Low LOD" is a true observation about the DATA, not a loader/render fault.**
Nothing to fix in the Modeller. Any real remedy is upstream (re-extract at higher LOD), a user call.

Box fractions are structural across the fleet, all legitimate (`boxInstancesExpected`, manifest):
`Terminal 2.0% · Duplex 25.6% · SampleHouse 37.9% · HHS 38.6% · SampleCastle 46.5% · HospitalGarage
53.4% · Hospital 58.1% · Clinic 58.9%`.

**Full fleet census — all 8 residents REAL, `blobMiss=0 hardFail=0 manifest=match` everywhere:**
| building | tris | elements | tris/elem |
|---|---|---|---|
| SampleHouse | 24,564 | 38 | 646.4 |
| Duplex | 24,852 | 196 | 126.8 |
| SampleCastle | 237,504 | 3,225 | 73.6 |
| HHS | 335,240 | 1,077 | 311.3 |
| Clinic | 100,041 | 1,950 | 51.3 |
| HospitalGarage | 78,445 | 496 | 158.2 |
| Hospital | 4,666,161 | 6,929 | 673.4 |
| Terminal | 4,330,819 | 35,552 | 121.8 |

### ⚠ SELF-CAUGHT FLAW IN S3 — a mean hides a bimodal population (FIXED)
S3 graded SampleCastle `verdict=REAL` from 73.6 tris/element while **46% of it was boxes**. The
aggregate metric this spec proposed CANNOT distinguish "all real, some genuinely blocky" from
"partly proxy-substituted" — the exact class of blindness the chain exists to kill, one level up.
Had proxies genuinely leaked in, S3 would have passed them.

**Fix:** `boxInstancesExpected` added to the S1 manifest (instances whose REAL mesh is ≤12 tris,
counted from source). The sharp test is **rendered-12-tri vs expected-12-tri**, not the mean:
equal ⇒ faithful (SampleCastle 1,498 vs 1,501); **rendered ≫ expected ⇒ proxy leakage**. This also
makes the RED case sharper — full substrate loss reads as rendered=100% vs expected=46%.
⛔ Remaining: wire the comparison into `witness_render_fidelity.js`'s verdict (manifest side done).

### ❌ WRONG (kept for the lesson) — TRACE 2026-07-20 — "blocky in the source IFC, nothing broke"
> ⚠ RETRACTED — see the RETRACTED banner above. The IFC facts in this section are accurate; the
> INFERENCE ("therefore nothing broke") does not follow, because the source has always had ~43% box
> solids AND rendered detailed on 2026-07-08. The regression is downstream of the IFC.
User directive: *"SC was never blocky, investigate what broke it during mesh.db formulation."* Traced
per-element to the source file. **The premise is disproven — by `Ifc2x3_SampleCastle.ifc` itself.**

**Element-level trace** (`IfcRailing`, a class where a 12-tri box looks obviously wrong):
| element | IFC entity | source Brep faces | extracted | verdict |
|---|---|---|---|---|
| `3pp$tut394gvh1elE1QUg0` "afscheiding" (partition) | `#450923` → `#450889 'Body','Brep'` → `#450877` | **6** | 144B = 12 tris | ✅ faithful |
| `27$YR6LvnA1f4dzXk05qPo` "traphek" (stair rail) | `#267823` → `#267793 'Body','Brep'` → `#267781` | **264** | 11,712B = 976 tris | ✅ faithful |

The "box" railings are Dutch **`afscheiding`** = partition/barrier panels — genuinely 6-faced solids
in the IFC. The detailed ones are **`traphek`** = stair railings, and they extract with full detail.
Both representations carry BOTH a `'Body'/'Brep'` AND a `'Box'/'BoundingBox'` shape rep, so the
extractor is NOT mistakenly grabbing the BoundingBox — it correctly reads `'Body'` in both cases.

**Population-level confirmation** (all 4,202 `IFCCLOSEDSHELL` entities in the source):
`6 faces (a box): 1,785 = 42.5%` · then `8f×492, 10f×309, 12f×296, 7f×261, 9f×166`.
**42.5% of the source IFC's solids are 6-faced boxes** — matching the ~45% measured in every
downstream copy (extracted 45%, library 47%, mesh.db 45%; small deltas are dedup collapsing
duplicate box geometries at different rates).

**Verdict: the entire chain IFC → extracted.db → library → mesh.db → render is FAITHFUL.** No
regression at any link. SampleCastle is a coarsely-modelled building at source (~43% box solids),
and every layer has been honestly reproducing that. The earlier `1,498 rendered vs 1,501 expected`
match now has its upstream justification too, so "no fix needed" is EVIDENCED, not assumed.

**Correction to this file's own earlier claim:** the trace section previously flagged `IfcWindow 66 /
IfcDoor 47 / IfcRailing 42` boxes as *"a railing is never a 12-triangle box → per-element extraction
failure."* **That inference was wrong** — it reasoned from class NAME instead of checking the source,
which is the exact non-extract shortcut this project forbids. The mixed within-class population is
real modelling variety (partition panels vs stair railings sharing `IfcRailing`), not a defect.

⛔ Remaining honest gap: this traced 2 elements individually + 4,202 shells in aggregate. It did NOT
verify every one of the 1,501 box instances maps to a 6-face source shell. The aggregate match
(42.5% vs 45%) makes a systematic defect implausible, but a per-GUID exhaustive join was not run.
Any future "building has no X" / "renders wrong" report MUST quote its `§DB_IDENTITY` line and (if
render-side) its `§RENDER_FIDELITY` line. The memory rule "name the exact source file path"
(`project_db_snapshot_divergence_landmine`) becomes mechanical instead of remembered.

## VERIFICATION (the tests must expose the issue, BOTH directions — read the log)
- Green: Duplex, BimWhale_Advanced, Hospital-full → `§DB_IDENTITY manifest=match` + `§RENDER_FIDELITY
  verdict=REAL blobMiss=0`, baselines recorded here, zero warns.
- Red (MANDATORY — a tripwire never shown to trip is not a tripwire): **RETARGETED 2026-07-20 by S0(a)** —
  the original red case (load `modeller/Hospital_ARC.db`, expect `geo=0`) is INVALID: that db is
  geometry-less by design and pairs with `mesh.db` for 100% coverage, so "geo=0" is the CORRECT
  reading of a HEALTHY pair, and asserting it would have hard-coded the very pairing-blindness that
  cost the session. The real red case is **substrate loss**, already demonstrated live in S0(c):
  repoint a resident's `geoDb` at a nonexistent file (fault injection, no DB edited) →
  `§DB_IDENTITY … geo=0 manifest=MISMATCH` warn fires AND `§RENDER_FIDELITY verdict=FAKE
  trisPerElement≈12`, exit non-zero. Measured baseline for this assertion: Duplex green 126.8 vs
  broken 12.0. Note the red case must ALSO prove the old guards are insufficient — `hardFail=0`
  and `blobMiss=0` in that same run — otherwise the new witness looks redundant when it is not.
- Identity needs NO full stream (COUNT queries at open) — don't repeat the 2-min-streaming-timeout
  dead end; full streams are for the fidelity link only.

## OUT OF SCOPE
- No DB file edits/regeneration beyond what S0's verdict demands (user standing directive
  2026-07-19: do not touch DBs; inform the user first if a DB change is needed).
- Deduplicating the divergent DB copies themselves — a data-pipeline decision for the user.
