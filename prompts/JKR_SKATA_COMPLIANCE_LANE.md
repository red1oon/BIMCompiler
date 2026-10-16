# ⚠ DO NOT REMOVE — LANE: JKR / SKATA / PeDATA asset-code compliance
# Scope: (a) can we SAY whether a dataset is compliant, (b) a feature to MAKE it compliant.
# PRIME RULE: EXTRACT ONLY. A classification code is authored or extracted — never guessed from a name.
# Read the log after every run. Opened 2026-07-30 from a user ask; nothing built yet.

## §WHAT SKATA IS (researched 2026-07-30 — web summary only, NOT the primary spec)
**SKATA = Sistem Kod Aset Tak Alih** — Malaysia's Fixed/Immovable Asset Code System. Paired with
**PeDATA** (government asset collection + labelling). It is a *classification/coding* standard covering:
building codes · building level codes · space/area codes · component object codes.

**The mandate:** since **1 July 2025**, BIM is mandatory for Malaysian projects ≥ **RM10 million**
(public *and* private) under the Construction 4.0 Strategic Plan. Deliverables must follow **CIDB BIM
Guidelines** and hand over **LOD 500** models carrying full asset data conforming to **PeDATA and SKATA**
classification codes. JKR (Jabatan Kerja Raya) publishes its own BIM Requirements/Piawaian on top.

⛔ **BLOCKED — we do not have the primary source.** Everything above is a secondary web summary. The
*shape of a valid code* (field widths, segment order, allowed values) is not known to this repo and cannot
be invented. Before any validator is written, someone must supply the actual JKR/CIDB SKATA + PeDATA
specification. **This blocks the CHECKER. It does NOT block the schema column (see §PHASING).**

## §THIS IS A DIFFERENT AXIS FROM OUR EXISTING COMPLIANCE WORK
`docs/archive/STANDARDS_COMPLIANCE_SRS.md` and `prompts/UBBL_RULES_{GATE,RECON}.md` cover **UBBL** —
*is the building lawful* (geometric/dimensional: room areas, egress, corridor widths). SKATA/PeDATA is
*is the asset data coded correctly for government handover* (classification/nomenclature). Same word
"compliance", orthogonal problems. **Zero mentions of SKATA/PeDATA/CIDB-codes exist in this repo**
(grepped 2026-07-30). This lane is new ground, not an extension of the UBBL lane.

## §ARE OUR DATASETS COMPLIANT? — measured 2026-07-30
**No — and not in the "fails a check" sense. There is nowhere to put the answer.**

```
sqlite> .schema elements_meta            -- JKR_extracted.db, and identical in every shipped building
CREATE TABLE elements_meta (guid TEXT PRIMARY KEY, ifc_class TEXT, element_name TEXT,
  storey TEXT, discipline TEXT, material_name TEXT, material_rgba TEXT, building TEXT);
```
**No classification-code column of any kind.** `spatial_structure` carries `object_type` +
`predefined_type`, but those are IFC enum fields, not asset codes. So the honest status is: *the extract
discards asset classification entirely* — the same shape as the T1b finding in
`RESUME_4D_TRUTH_AND_BE_HERE_WHEN.md` §DIAGNOSIS D1 (a planner stated it; our schema dropped it).

**And our own JKR building already visibly fails level coding.** `JKR_extracted.db` carries TWO storey
naming conventions in ONE model:
```
01 Ground Floor Level   |  01 Aras Satu
02 1st Floor Level      |  02 Aras Dua
03 Water Tank Floor Level  |  00 Aras Tanah  |  03 Aras Rasuk Bumbung
04 Water Tank Roof Level
```
English and Malay, mixed, for the same building. SKATA specifies building-level codes; this is two
conventions and no code. Note `01 Ground Floor Level` vs `01 Aras Satu` are *different floors* sharing
the `01` prefix — so even the prefix is not a reliable key. **This is a real, reproducible test case and
it is already in the fleet** (`~/bim-ootb/buildings/JKR_extracted.db`, 194MB, 2026-07-12).

## §THE FEATURE — two halves, as the user framed it
1. **"if our data set are compliant or not"** — a CHECKER. Per building: how many elements/spaces/levels
   carry a valid code, how many don't, reported as a number, never a vibe. Same discipline as
   W-HOST-COVERAGE: the un-coded remainder is COUNTED, not hidden.
2. **"a feature to infuse it to be"** — an AUTHORING path. Assign/import codes, store them, export them
   back out with the handover model. ⚠ **Codes are authored or extracted, never inferred from
   `element_name`.** Guessing a SKATA code from a free-text label is exactly the failure mode already
   recorded in this repo (the glazed-façade name-rule, and HHS's `Rechteckiger Pfosten` blind spot).

**Surface (user, 2026-07-30): the Measure long-click element info panel.** That is `info-panel`
(`viewer/picking.js:651`; also read by `viewer/share.js:227,365`) — it already shows guid + ifc_class per
element, and it is where someone auditing a handover model would actually look. Add the code + a
present/missing state there.

## §PHASING — and why the timing is urgent
The `rel_aggregates` extraction change (RESUME_4D §STAGE B follow-on) is **about to re-extract and
re-upload the building fleet to OCI**. Local DBs are ~4.0GB across two trees; an OCI cycle is not free.

**Adding the classification column in the SAME extraction pass costs one schema line. Adding it later
costs a second full re-extract + re-upload of every building.** The two changes are the same kind of
change to the same file.

- **Phase 0 — decide NOW, before the 4D re-extract ships:** does `elements_meta` (and/or
  `spatial_structure`) get a nullable `classification_code` / `classification_system` column in this pass?
  This does **not** require the SKATA spec — a nullable text column holds whatever the spec turns out to
  demand. **Recommendation: yes, take the free ride.**
- **Phase 1 — extract what the IFC already carries.** `IfcClassificationReference` / `IfcRelAssociatesClassification`
  is where a compliant authoring tool already puts these. EXTRACT it; do not synthesise it. Report coverage
  per building as a number (expect near-zero on our current set — that IS the finding).
- **Phase 2 — the checker.** ⛔ blocked on the primary SKATA/PeDATA spec.
- **Phase 3 — the authoring path + the `info-panel` surface.**

## §OPEN QUESTIONS FOR THE USER
1. Can you supply the actual JKR/CIDB **SKATA + PeDATA** specification documents? Phase 2 cannot start
   without them and must not be guessed at.
2. Is the target **JKR-specific** (their BIM Requirements) or the broader **CIDB/Construction 4.0**
   mandate? They overlap but are not the same deliverable.
3. Is this for **winning JKR work** (must match their submission checklist exactly) or a **general
   compliance feature** (looser, sellable across jurisdictions — the `STANDARDS_COMPLIANCE_SRS.md`
   framing already anticipates UK/BCA/NCC)? That changes how hard-coded the code format should be.

## Sources (secondary — see the ⛔ above)
- https://jkrbim.my/ — JKR BIM CPAB official site
- https://infinitywave.io/blog/malaysia-bim-mandate-2025/ — the 1 July 2025 RM10m mandate, LOD 500,
  PeDATA + SKATA conformance
- https://theedgemalaysia.com/node/724693 — JKR BIM adoption scale (455 projects)

---

## §ARCHITECTURE 2026-07-30 — layering, patch-vs-binary, and the version-marker gap
User questions: (1) how do we mark which DB has a fix, and is SQL-migration-to-OCI better practice than
shipping an updated DB? (2) can classification injection ride with room topology as a general feature?
(3) is the injection an abstract layer, locale-updatable, not hard-set?

### A. Patch beats binary, and the machine already exists — measured
`viewer/scene.js:1223` `A._applyPendingPatch()` is LIVE, called from `streaming.js:1984` (split/meta path)
and `:2130` (single-DB path). Convention: `buildings/patches/<dbFile>.sql`, fetched from the same directory
the DB came from. **Eight patches already ship** (Hospital_extracted, Hospital_meta, Terminal_extracted,
Terminal_meta, HHS_Office_Federated, JKR_extracted, …). There is also a provenance manifest convention
(`oci-patch-provenance/1`) recording engine SHA, served-DB etag, artifact md5, a verification command with
its exit code, and a PASS/FAIL verdict.

**The ratio settles the question:**
```
Hospital_extracted.db        263,307,264 bytes   (served object, per manifest)
its existing patch .sql          226,962 bytes   → ~1160x smaller
our rel_aggregates payload    ~9,527 rows        → est. <1MB  → still ~300x smaller
```
**The decisive argument is not size, it is the cache.** `scene.js:1218-1219`: the IDB cache always stores
the RAW server bytes; only the buffer handed to `SQL.Database` is patched. So a patch reaches an existing
user **without invalidating their cached 251MB copy**. Replacing the binary forces a full re-download for
every user who already has it — the exact bandwidth failure `SEAM_IDENTITY_AUDIT.md` F1 was about.
**Ship the patch. Reserve a new binary for a genuine re-extraction (new geometry), not a data fix.**

### B. ⚠ THE GAP — nothing marks which fixes a DB carries
Measured on the shipped Hospital DB:
```
sqlite> SELECT * FROM project_metadata;
building_name|Hospital
import_date|2026-05-02
```
**No version row, no patch level, no applied-patch list.** And `_applyPendingPatch` applies the patch on
EVERY load unconditionally, relying on each script being idempotent (`scene.js:1220`). That works, but:
- you cannot ask a DB which fixes it has;
- `§PATCH_APPLY` proves the script RAN, not that the data is now correct;
- one patch file per DB means a second fix must be hand-merged into the same file, with no record of what
  is already in it — this WILL drift once there are two authors;
- the manifest records provenance server-side; nothing is written INTO the DB.

**Recommendation:** every patch script's first act is to write its own identity into `project_metadata`
(e.g. `patch_level`, or an append-only `applied_patches` row carrying id + date + engine SHA). Cheap,
idempotent, and it makes "which DB has this fix" answerable from the DB itself instead of by inference.
This is the same one-identity-no-owner shape as the audit's C1/C2 clusters.

### C. Three layers — and yes, it rides with room topology
| layer | what | changes when | ships as |
|---|---|---|---|
| 1 · base extract | geometry + raw IFC facts | re-extraction only | big binary, OCI |
| 2 · overlay | room topology, `rel_aggregates`, classification BINDINGS (which code on which element) | independently of geometry | **SQL patch + self-heal loader** |
| 3 · scheme | what a valid code LOOKS like per jurisdiction | when a standard changes | **locale JSON, no DB at all** |

Layer 2 answers the user's "together with room topology" — room topology and classification bindings are
the same *kind* of thing (derived/authored facts layered over immutable geometry, changing on their own
cadence). They should share ONE patch file and ONE loader, not grow a third mechanism. ⚠ Note the repo
already has TWO overlay mechanisms — the SQL patch above AND sidecar DBs (`Terminal_rooms.db` carries its
own `elements_meta`/`spatial_structure`/`rel_contained_in_space`/`m_bom`). Adding a third would be a
textbook `SEAM_IDENTITY_AUDIT.md` C4 repeat. **Pick one; the patch path is the one with a live loader.**

Layer 3 answers "abstract, manageable later, not hard-set": the scheme is DATA, so a new jurisdiction is a
new JSON file and touches **zero building DBs**. Phase C already built this locale-keyed. It also makes the
feature opt-in — no scheme configured for a locale ⇒ no compliance UI, zero cost to users who don't need it.

**The split that matters:** binding (layer 2, per-model) must stay separate from scheme (layer 3, per
jurisdiction). Fuse them and a standards revision forces re-patching every building.

---

## §PRIMARY SPEC OBTAINED — 2026-07-31. The ⛔ BLOCKER ABOVE IS LIFTED.
**SKATA Versi 2.0** (Dec 2011), *Kerajaan Malaysia — Sistem Kod Aset Tak Alih Kerajaan*, issued by
**Urusetia JPAK, Pejabat Ketua Pengarah Kerja Raya Malaysia**. 97 pages, real text layer (not scanned).
Source: `https://jpak.jkr.gov.my/jpak/documents/dasar/SISTEM%20KOD%20ASET%20TAK%20ALIH%20(SKATA).pdf`
Text extracted to `reference/SKATA_v2.0_extracted_text.txt`. Public document on JKR's own portal.

### The structure — TWO code families, not one (this changes our schema)
- **DPA — Kod Daftar Premis Aset** (§3.3): level-1 code, identifies **location + ownership** of a premise.
  **4 to 9 segments.** One code per PREMISE (building), *not* per element.
- **DAK — Kod Daftar Aset Khusus** (§3.4): level-2 code, identifies **construction and components**.
  **9 to 11 segments.** Explicitly "digunakan sebagai panduan pelabelan pada aset atau komponen" —
  the labelling guide for assets/components. **This is the per-element code.**

**DPA format for a Building (§5.1.1.1), verbatim:**
```
9 999 999 AAA 99 99 99 AA 9999
 1. Kod Kumpulan Agensi        1 digit
 2. Kod Kementerian            3 digits
 3. Kod Jabatan                3 digits
 4. Kod Negara                 3 alpha   (MYS)
 5. Kod Negeri                 2 digits
 6. Kod Daerah                 2 digits
 7. Kod Mukim                  2 digits
 8. Kod Kategori Premis Aset   2 alpha   (BA)
 9. Nombor ID                  4 digits
```
Notation, stated in the doc: **`9` = integer position, `A` = alphabetic position.** That is itself a
pattern language and maps 1:1 onto our `segments[]` design — the Phase C shape was right.

Worked examples carried in the doc: `1 101 113 MYS 01 02 02 BA 0003` · `1 105 101 00001` ·
`1 105 101 00001 01 02` · `1 141 108 MYS 10 07 04 HJ 0001` · `1 147 103 MYS 08 02 UF LPG015`

### ⚠ SCHEMA GAP THIS EXPOSES
Our new `elements_meta.classification_code` covers only the **DAK** half. **DPA is a per-BUILDING code**
(agency/ministry/department/country/state/district/mukim/category/ID) and belongs in `project_metadata`,
not on every element row. Adding it per-element would repeat the same value 63,415 times. **Fix before
the patch ships.**

### ⚠ SKATA IS NOT SELF-CONTAINED (§PENAFIAN, p.i)
It defers to two upstream standards that version independently: **DDSA** (Data Dictionary Sektor Awam)
and **MS 1759** (Malaysia Standard Feature and Attribute Codes). The doc states these "akan berlaku
perubahan dan pengemaskian dari semasa ke semasa" — they change over time, reviewed by the Jawatankuasa
Kerja SKATA. **So the scheme file MUST carry a version + upstream-dependency block.** This vindicates
keeping schemes as versioned data rather than compiled-in rules.

### Coverage limit of THIS reading — be honest in pass 2
Read and transcribed: §3.3, §3.4, §5.1.1.1 (DPA for Bangunan). **The DAK structure (the per-element one
we most need) and the remaining ~90 pages of category tables are NOT yet transcribed.** Do not write the
real `skata.json` from this section alone — it defines the premise code, not the component code.

---

# ⏸ PARKED 2026-07-31 — READ THIS SECTION FIRST WHEN A REAL SUBMISSION LANDS

**Status: no actual JKR submission exercise exists yet.** This lane was researched and scaffolded ahead of
demand, deliberately. Nothing here is urgent until a real deliverable appears. When it does, start here.

## §RESUME — the five things to do, in order
1. **Read `reference/SKATA_v2.0_extracted_text.txt`** (97pp, full text). Transcribe the **DAK** structure
   (§3.4 onward) — the per-element code. Only DPA (§5.1.1.1) was transcribed in 2026-07-31. **Do not write
   the real `config/classification/schemes/skata.json` from the DPA section alone** — DPA is the premise
   code, DAK is the component code, and they are different shapes.
2. **Move DPA to `project_metadata`.** `elements_meta.classification_code` covers only DAK.
   DPA is ONE code per building (agency/ministry/dept/country/state/district/mukim/category/ID) — putting
   it per-element repeats one value 63,415 times. Fix before any patch ships.
3. **Add version + upstream-dependency metadata to every scheme file.** SKATA defers to **DDSA** and
   **MS 1759**, which version independently (§PENAFIAN, p.i).
4. **Fix the verdict semantics** — see §VERDICT-FLAW below. Do this before anyone sees a GREEN.
5. **Then** the authoring path (§TIERS below) and the `info-panel` surface.

## §VERDICT-FLAW — known, unfixed, do not ship a verdict until it is
`build/classification_checker.py` computes `verdict = "GREEN" if invalid == 0 else "RED"`. **Coverage is
not an input.** A building with one well-formed code and 63,916 uncoded elements reports **GREEN**. The
uncoded count is printed on the same line, but the word is doing work it has not earned.
**Fix:** either rename to `§CLASSIFY_WELLFORMED` (an honest narrow claim) or require both axes for GREEN.
A screenshot of a GREEN at 7% coverage would be technically true and materially false.

## §TIERS — the authoring model (decided 2026-07-31, not yet built)
Re-extraction recovers ONLY what the modeller authored. Hospital: **7.11%**. The other **92.89% is not in
the IFC either** — nobody ever wrote it. So extraction is not the path for the bulk; authoring is.
Three provenance tiers, using the `provenance` column the extractor already has:

| tier | source | mechanism | risk |
|---|---|---|---|
| `ifc:recovered` | authored in the IFC | extraction | none — it is the model's own data |
| `derived:sibling` | another type of the same `ifc_class` **in this model** carries a code | **pure SQL join** | low — generalising the model's own assertion, not a guess |
| `derived:ai` | no coded sibling; reason from the scheme's category tables | one-time LLM pass per building | needs human review |

**HARD RULE:** the handover export must **refuse to emit `derived:*` as authored**. In 4D a wrong schedule
is embarrassing; in a government asset register a wrong code is a false statement on a regulatory
deliverable. Default it, show it, let the user edit it — never let a proposal launder into tier 1.
⚠ Open question for whoever builds this: `ifc_class` may be too coarse a join key. Hospital has
`Pipe Types:Standard`, `Threaded Under 65mm` and `PVC` all as `IfcPipeSegment` — plausibly three different
codes. If so tier 2 shrinks and the AI share grows. **Measured in §TIER-COVERAGE (pending).**

## §WHERE THE GRUNT WORK ACTUALLY IS — the type-level insight
The code is **not** applied to a finished model. It is set on the **family TYPE** in the authoring tool,
once, and every instance inherits it. Revit chain, end to end:
```
UniformatClassifications.txt  (Manage → Additional Settings → Assembly Code)
   → "Assembly Code" TYPE parameter on each family type      ← the ONLY manual step
   → every instance of that type inherits it, free
   → IFC exporter mapping writes IfcRelAssociatesClassification   ← silent-loss step
   → extractIFCtoDB.py §CLASSIFY reads it back
```
**Step 5 is a silent-loss trap:** if the exporter is not told to write the parameter, the code exists in
Revit and is absent from the IFC — indistinguishable from "nobody coded it".

**The leverage number, measured on Hospital:** 63,415 instances → **339 distinct types**. The **top 20
types cover 39,152 instances = 61.7%**. Nobody codes 63,415 things; they code a few hundred, once.
Any tool we build MUST report at TYPE level ranked by instance count — "234 of 339 types uncoded" is a
worklist; "59,371 uncoded elements" is despair. Top 10 Hospital types are MEP repetition
(`Pipe Types:Standard` 5,950 · `Pipe Types:Threaded Under 65mm` 5,758 · `M_Elbow - Generic:Standard` 3,115
· `Curtain Wall:Storefront` 2,626 · `Round Duct:Taps` 2,490 …).
**The real multiplier is the round-trip:** export type→code as CSV the BIM Manager loads back into the
`.rte` TEMPLATE. Fixing the model helps one job; fixing the library helps every future one.

## §DERIVED vs EXTRACTED — the principle that decides what ships
The test: **can it be regenerated without the original IFC?**

| | regenerable | ships as | verified |
|---|---|---|---|
| 4D schedule | ✅ from `sequence_rules.json` + `elements_meta` | code + JSON | `time_machine.js:3363-3376` writes ELEMENT_PLACE ops to the **in-memory** db; shipped `tasks` table is **0 rows** |
| room topology | ✅ from geometry | code | `A.ensureRooms` = "the ONE shared injection core", `navigate_find.js:928` |
| `rel_aggregates` | ❌ only in `IfcRelAggregates` | **data** | — |
| `classification_code` | ❌ authored in the IFC | **data** | — |
Derived things restore themselves on every load; extracted facts cannot. **A patch ships the fact, never
the derivation.** Re-running a script without the fact faithfully reproduces the same wrong answer.

## §THE DB IS A LOSSY PROJECTION — the structural root of this whole lane
The DB is source-of-truth for what it *contains*, but it is **not complete**. The extractor decided once
which IFC facts to keep; everything else is gone and recoverable only from the IFC. Five separate round
trips were forced in one session (2026-07-30/31): classification codes (entirely dropped) ·
`rel_aggregates.parent_class` · `rel_fills`/`rel_voids` (made W-HOST-ORDER unmeasurable) · schedule deps
46/46 + early/late/float/is_critical (T1b) · the 233 geometry-less aggregate containers.

**Measured, Hospital (`dbstat`):**
```
component_geometries  239,124,480 bytes   ← 91% of the file
elements_meta           7,503,872
element_transforms      5,607,424
element_instances       3,006,464
indexes                ~7,585,792
                       ── semantics + transforms + indexes ≈ 9% ──
```
`rel_aggregates` (9,527 rows) is **~0.2%** of the DB. **We have been rationing the cheap part.**
**RECOMMENDATION (open, not yet actioned): stop curating semantics. Geometry stays curated — it is 91% and
genuinely expensive. Extract EVERY IFC relationship wholesale, once, so the next new question does not
cost a fleet re-extraction. Archive the source IFC beside each DB so provenance stops being a `find`.**

## §JKR — the Malaysian test building, and its origin defect
**Source IFCs (found 2026-07-31):** `~/Downloads/OPEN SOURCE BIM/JKR_Project.zip` plus IFC4 discipline
files in `~/Downloads/OPEN SOURCE BIM/IFC 4/` — `jkrST25-5a_…` (STR), `jkrEL23-5a_…` (ELEC),
`jkrME23_5a_SP_…`, `jkrME23_5a_FP_…` (FP). The filenames are themselves a JKR naming convention
(`jkr` + discipline + year + revision) and may be worth reading as a compliance artifact in their own right.

**⚠ ORIGIN DEFECT — measured, unfixed:**
```
JKR      x[271,392 .. 271,453]  y[721,363 .. 721,405]   ← projected national-grid coordinates
Hospital x[    -12 ..      90]  y[      1 ..     152]   ← model-local, correct
```
The building is ~61m × 42m but sits **271 km from the origin**. float32 precision degrades badly out there
(z-fighting, jitter, unreliable picking). `project_metadata` carries **no `georef_offset_*` rows** despite
`building_name = 'jkr_aligned'` — so the rebase either never happened or was never recorded.
`viewer/import_db_builder.js` already has the `georef_offset_x/y/z` convention; it was not applied here.
**Fix when JKR is re-extracted: rebase to a local origin and RECORD the offset**, so the true world
position stays recoverable. Do not silently discard the survey coordinates.

**JKR also carries the level-naming test case** — 5 colliding storey prefixes, `02` alone naming six
distinct floors (`02 1st Floor Level`, `02 Ground Floor Level`, `02 First  Floor` [double space],
`02.5 Hvac Level 1`, `02A Ceiling Level`, `02 Aras Dua`), English and Malay mixed in one model. Any
level-code checker must survive this. It is the single best compliance test asset we hold.

## §WHAT EXISTS TODAY (branch `feat/rel-aggregates-classification`, pushed)
- `DAGCompiler/python/extractIFCtoDB.py` — `§CLASSIFY` (IFC4 `.Identification` + IFC2x3 `.ItemReference`;
  handling only the IFC4 name makes every 2x3 building extract as 100% NULL and look like a clean pass),
  widened `rel_aggregates` with `parent_class`
- `config/classification/locales.json` — locale→scheme registry, 4-step resolution order
- `config/classification/schemes/uniformat.json` — `verified-from-data`, 15 observed codes.
  ⚠ `D4090` is 5 chars where 14 others are 8 — a fixed-width validator would reject a REAL code. That is
  why `permitted_lengths` is a list.
- `config/classification/schemes/skata.example.json` — **EXAMPLE-NOT-SPECIFIED**, checker hard-refuses a
  verdict for it (verified working). Replace using the real spec per §RESUME step 1.
- `build/classification_checker.py` — `§CLASSIFY_CHECK`, mechanism complete, see §VERDICT-FLAW
- `reference/SKATA_v2.0_extracted_text.txt` — the primary spec, text-extracted

## §STILL OPEN
- ⛔ **PeDATA spec not obtained.** SKATA is one half; PeDATA (asset collection + labelling) is the other.
- Fleet: only Hospital re-extracted. **7.11% is a Hospital number, never quote it fleet-wide.**
- Source IFCs available for 6 of 9 shipped buildings (Hospital, Clinic, Duplex, HHS, LTU_AHouse, Terminal
  via `~/Downloads/TerminalMerged.ifc`) + JKR now located. `Hospital_3` and `TermRooms` still unlocated.
- `§TIER-COVERAGE` measurement was dispatched 2026-07-31 and may append below this section.

---

## §PIVOT 2026-07-31 — this lane is CLOSED-AS-PARKED; the forward work moved to buildingSMART
**User directive:** *"So we leave it at that. Update the prompts to pivot to that buildingSMART viability."*

**What redirected it.** We checked how Autodesk Revit satisfies local authorities. **It doesn't** — Revit
holds no local-authority compliance certification in any jurisdiction. What Autodesk certifies is
*data-exchange fidelity* via buildingSMART (IFC4 Architectural + Structural Reference Exchange export;
IFC2x3 Coordination View 2.0 ARC/STR/MEP import+export). The largest BIM vendor on earth, facing every
jurisdiction, certifies **"I don't corrupt your data"** and leaves lawfulness to the practice.

So the credential worth pursuing is **buildingSMART IFC certification**, not "SKATA certified" — which
likely does not exist as a software category. **New lane: `prompts/BUILDINGSMART_IFC_CERTIFICATION.md`.**
Viability is good: the Global certification service is stated to be free, and the entry gate is technical
(produce an IFC that validates clean) rather than commercial.

**This lane is NOT wasted and NOT deleted.** Everything above stands as the *facilitation* layer — the
thing that helps a client reach compliance rather than claiming it for them. It stays fully resumable
per §RESUME the moment a real submission exercise appears. Nothing here needs redoing.

**One thread carries directly across:** §THE DB IS A LOSSY PROJECTION is now the central risk of the
certification lane, not a footnote — anything the extractor drops cannot survive a round trip, by
construction. The first build there (`W-IFC-ROUNDTRIP`) exists precisely to measure that.
