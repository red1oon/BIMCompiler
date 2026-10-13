# ERP Shard Generator — `scripts/build_erp_shard.js` (spec)

Implements Layer 1 of `docs/ERP_DATA_COMPLETENESS_POLICY.md §3` and produces the shards
`docs/IDEMPIERE_DATA_STREAMING_SPEC.md` serves. The PG-extraction front-end is
`scripts/migrate_pg_to_sqlite.js` (LIVE); this is the **closure + shard** back-end they share.

Spec-first; witness-led; §-log first (READ the log before any conclusion); deterministic / NON-INVENT —
every row a real EXTRACT from `build/erp/ad_full.db` / the PG source, absent → reported "absent", never
synthesized. Branch off `origin/main`. EXPLICIT GO before any deploy.

Lane: DATA + scripts + witnesses only. Do NOT edit the renderer fold/UI
(`bim-ootb/erp/{idmp_session,idempiere,ad_parser,ad_data}.js/.html`). The right data lights up
System-login / client-switch / lazy modules on its own.

## §0 The two non-negotiables the user set (2026-06-02)
- **INSTANT is the bar.** Whatever the sharding strategy, boot stays instant: a SMALL T0 stays precached;
  modules stream lazily on touch. The 43 MB blob (`build/erp/ad_masters_<n>.db`, 835 tables) is exactly
  what this replaces. **Size budget: T0 ≤ ~13 MB** (today's curated seed = 12.7 MB / 378 tables is the
  ceiling); each T2 module shard small (target < a few MB), none oversized. Asserted in `§SHARD-SET`.
- **The VIEW / EDIT capability boundary (user, 2026-06-02).**
  - **VIEW (read) → browser shards, full 360°, instant.** While a user is just testing/browsing, sharding
    must allow **full 360° viewing** — every window openable, every row reachable by tier escalation
    (T0 shape → T1 range → T2 shard), nothing walled. The floor is a labeled *"fetching / not-yet-loaded"*,
    never *"you can't see this."* Closure guarantees no dangling while viewing. (Honest bound from policy
    §4: full-360 read is guaranteed **online** via T1 over the whole `ad_full`, and **offline** for visited/
    fetched shards — the tail is online-or-fetched, not bundled. Instant is preserved.)
  - **EDIT (write) → local install (the user's decision).** Editing/operational use crosses to the
    **installed system-of-record** (full DB on disk: local iDempiere `postgres:15`, `idempiere-dev-setup`).
    By the time someone edits, they've chosen to commit, so the install is the right path, not a limitation.
    Advise it in the Migrate ShowMe copy (overlay lane, follow-up — NOT done here). The browser GUIDES +
    REFLECTS + STREAMS; it never becomes the system of record. (Advanced exception, not re-solved here: the
    offline op-log write path of `docs/DistributedERP.md` — a separate capability, cross-ref only.)

## §0.1 Why closure = the unit of share (ties to `docs/DistributedERP.md`)
Two flows compose in our scheme: (a) the **update/diff flow** — business edits as an op-log,
`union signed logs → total-order → replay` shared as signed deltas via the post office
(`DistributedERP.md §3/§6`); and (b) the **base-copy flow** — the AD scaffold each user folds the UI
from, distributed as **closed shards** (this generator). Each user holds a closed T0 base + the module/
client shards they touch; updates ride the op-log on top. **"Share only what's needed" is safe ONLY
because the shard is referentially closed** — a carved subset renders standalone iff every FK resolves
inside it (or a sentinel); else the recipient dangles (a *wrong* value, forbidden by the policy). So this
closure generator is precisely what makes partial sharing valid. Open boundary (named, not solved):
schema migration to N offline copies — `DistributedERP.md:343`, dictionary-shard's problem, not the log's.

## §1 What it is
Given `ad_full.db` (the closed 927-table superset, `dangling=0`, coverage 296/305), a **root set**, and a
**mode**, walk the AD FK graph transitively and emit a referentially-CLOSED `.db` sized for a serving tier.
Every emitted shard is gated by `scripts/erp_shard_integrity.sh` → must print `§SHARD-CLOSURE … dangling=0`.

## §2 The FK graph (the closure relation) — MIRRORS the renderer, verified in `ad_full.db`
**The gate/engine edge MUST mirror `resolveFK`, not the AD metadata.** `ad_data.js:332–339` resolves a FK
**by convention only**: `columnName.replace(/_ID$/,'')` → tableName. It does **NOT** read `ad_ref_table` /
`ad_reference_value_id`. So the closure edge the renderer actually follows is: for every **displayed** FK
column (ref 18/19/30, `isdisplayed='Y'`) on a menu-reachable window's active tab whose name ends `_ID`,
target table = `ColumnName` minus `_ID`. (Asserting the `ad_ref_table` path would be an invented invariant
— it flagged 10 on `ad_full` vs the true 3.) The edge set = structural login/menu/window paths
(`ERP_DATA_COMPLETENESS_POLICY §1.1–§1.3`) ∪ these convention edges.
- **View-backed targets are materialized** (user decision 2026-06-02): when a target resolves to a PG
  **view** (e.g. `ad_allclients_v`, `ad_allroles_v`, `ad_allusers_v` — 12 real rows; back the "All Users/
  Roles/Tenants" admin windows), the engine extracts the view rows into the shard as a table. Real EXTRACT,
  non-invent. The gate then asserts `_v` targets like any other → true `dangling=0`.
- **Sentinels are roots, not dangles:** `AD_Client_ID=0`=System, `AD_Org_ID=0`=`*`(All) — no row required.

## §2.1 Re-baseline (hardened gate, resolveFK-mirror) — the triage
Distinct dangling FK-display targets, gate = convention-mirror: `ad_full.db`=**3** (all `_v` views),
`ad_masters_12.db` (43 MB blob)=**45**, `post_poc/ad_seed.db` (shipped T0)=**149** (146 base + 3 views).
Of the seed's 146 base-table dangles, **all 146 exist in `ad_full.db`** → engine closure fixes 100%; **0
irreducible**. The only non-base class = the 3 views → materialized per above. Bridge fully crossable.

## §3 Closure classes (how size stays instant)
Row-level whole-table closure would bloat → defeats instant. Two classes:
- **Dictionary class (`AD_*` metadata):** whole tables — the scaffold (windows/tabs/fields/refs). This is
  the existing curated seed, but now *provably* closed including the hardened FK check (§5).
- **Data class (business/master tables):** **row-level** closure — start from the seed's rows, follow each
  FK value to the referenced row, BFS to fixpoint. Only rows actually reachable land in the shard.

## §4 Modes (one engine, three products)
1. `--seed-login` → **regenerated `ad_seed.db`** = login ∪ dictionary closure. Root = `System` user → pulls
   `AD_Role 0 → AD_Client 0 → AD_Role_OrgAccess → AD_Window_Access` (rows verified present in `ad_full.db`).
   → System login works with ZERO renderer change (`hasRoles=true`). Witness `§IDEMPIERE-LOGIN system hasRoles=Y`.
2. `--module <menu-group>` → **T2 shard** (axis = AD menu-group; 332 active `W` windows under tree 10).
   Each module table pulls its FK-referenced master rows (data-class closure) so `resolveFK` never dangles.
   Witness `§SHARD-CLOSURE dangling=0` per shard + `§SHARD-SET` over the set.
3. `--rekey-client <src> <dst>` → **2nd-client seed** (D3). Root = all Client `<src>` rows (default 11) →
   data-class closure → re-key `AD_Client_ID <src>→<dst>` with a deterministic **PK offset** so both clients
   COEXIST (real EXTRACT of GardenWorld re-keyed for testing — non-invent; the FK-rewrite the migrate agent
   deliberately skips, `migrate_pg_to_sqlite.js:169`). Witness `§CLIENT-SWITCH client=<dst>:GardenWorld …`.

## §5 Gate hardening (DO FIRST — per user) — `scripts/erp_shard_integrity.sh §1.4`
Today the audit hardcodes `fk=0` — FK-display closure (`policy §1.4`) is **never asserted**, so every
`dangling=0` shipped so far was silent on FK closure. Replace the stub with a real check that mirrors
`resolveFK` (§2): for every *displayed* FK column (ref 18/19/30) of a menu-reachable window's active tabs
whose name ends `_ID`, resolve target = `ColumnName` minus `_ID`; count a dangle iff that target **is a
real `AD_Table`** (skip polymorphic names that aren't AD tables — `Record_ID` etc.) **but is absent** as a
physical table/view in the shard. Table-presence is the gate's assertion; per-field row resolution is the
engine's by-construction guarantee, not re-checked here. Re-baseline `ad_full`/blob/seed against the
stricter gate (some flip to NOT-CLOSED — that is the point). `_v` view targets are asserted (we materialize
them), not excluded.

## §6 Witnesses (§-log first; logs under repo `build/erp/logs/`, READ before concluding)
- `§SHARD-CLOSURE <db> login=0 menu=0 window=0 fk=0 sentinels=[org0,client0] dangling=0 tablesPresent=p/t`
  — the hard gate, now incl. real `fk`.
- `§SHARD-SET tiers=[T0:<tbls,MB>, T2:<n shards, axis=menu-group>] masters-in-T0=Y total=<MB> oversized=0`
  — the blob replaced by a small T0 + N closed module shards, none over budget.
- `§MIGRATE-CLOSURE source=<pg/instance> rootset=<…> closed-tables=N dangling=0` — extract is closed.
- `§IDEMPIERE-LOGIN system hasRoles=Y` — System login after the regenerated closed seed, renderer untouched.
- `§CLIENT-SWITCH client=<dst>:GardenWorld roles=K windows=W dangling=0` — re-key makes switch demonstrable.

## §7 Build order (dependency; each closes on its own witnesses; HOLD deploy for GO)
- **D1 (this arc):** §5 gate hardening → `--seed-login` engine → regenerated closed `ad_seed.db` →
  `§SHARD-CLOSURE dangling=0` + `§IDEMPIERE-LOGIN`. Foundation.
- **D2 (depends on D1) — DONE 2026-06-03 (§8a):** small T0 + 15 closed T2 module shards via
  `scripts/build_all_shards.js` (driver over `--module`) → `§SHARD-SET` no oversized shard, per-shard
  `§SHARD-COVERAGE` over T0∪shard, `§SHARD-MANIFEST`. (Built as a dedicated driver, not the migrate
  `--masters` route — `--masters` single-DB back-compat untouched.)
- **D3 (independent of D2) — DONE 2026-06-03 (§8b):** `--rekey-client 11 12` → client-switch demonstrable
  (`§CLIENT-SWITCH`, gate `dangling=0`).

## §8 Acceptance (D1) — MET 2026-06-02 (local, deploy HOLD-for-GO)
`build_erp_shard.js --seed-login` emits a regenerated `ad_seed.db` that passes the **hardened**
`§SHARD-CLOSURE dangling=0` (incl. real fk), System login works renderer-untouched (`§IDEMPIERE-LOGIN`),
and the seed is within the instant budget (≤ ~13 MB). Then STOP — no deploy without explicit GO.

**Witnessed** (`build/erp/logs/build_seed.log`, `gate_seed_gen.log`):
- `§SHARD-CLOSURE shard=ad_seed_gen.db login=0 menu=0 window=0 fk=0 dangling=0 tablesPresent=234/305` → CLOSED.
- `§IDEMPIERE-LOGIN system hasRoles=Y role0=1 windowAccess(role0)=223`.
- `§SHARD-GEN MB=8.2 budget<=13MB=Y` — projection (ad_column 8.47→0.97 MB, ad_field 6.93→1.50 MB, ad_element
  minimal) put detail cols on the lazy T1 tier. Covers 458 windows (vs old 370); 3 views materialized (12 rows).
- ~32% lighter than the shipped 12.1 MB seed → directly reduces the erp.html mobile Phase-2 data weight.
- Output local only (`build/erp/ad_seed_gen.db`). NOT deployed — `bim-ootb/erp/ad_seed.db` untouched, awaiting GO.

## §8a Acceptance (D2) — MET 2026-06-03 (local, deploy HOLD-for-GO)
The full T2 set is emitted by `scripts/build_all_shards.js` (driver over `build_erp_shard.js --module`),
each shard coverage-audited and the manifest emitted in one run. **17** top-level tree-10 groups are
DISCOVERED (non-invent; the brief's "18" was nominal) = 15 summary + 2 leaf-window roots; **15** produce a
shard, **2** are empty (`Manufacturing Management`, `Human Resource and Payroll` — 0 active W-windows →
`§SHARD-SKIP`, reported not synthesized). **No oversized shard.**

**Two design corrections this arc (the bloat the first cut shipped):**
1. **Dictionary NOT duplicated (the §3 rule, now enforced).** The first `--module` cut copied each window's
   tab tables WHOLE — re-shipping the `ad_column`/`ad_field`/`ad_element` scaffold (53k+ rows) into every
   shard → System Admin **34 MB**, App Dictionary **34 MB**, total **88 MB** (worse than the 43 MB blob).
   `buildModule` now SUBTRACTS the T0-resident dictionary class (`ad_*`/`_v` present in the seed), per the
   DataSource selection rule (T0 if the table is in `ad_seed.db`; `IDEMPIERE_DATA_STREAMING_SPEC §3`). A T2
   shard is now a **DELTA over T0** — only the data the dictionary streams in.
2. **Translations are T1, not T2.** `_trl` tab tables (translation sub-tabs) are deferred to the laziest
   T1 range tier (consistent with the seed's own column projection), not bundled in T2 (`trlDeferred` in the
   log). Together these took the set 88 → 34 → **10.46 MB** with zero loss on renderer-followed paths.

**Closure model shift (consequence of #1):** a T2 shard is a delta, so the standalone `erp_shard_integrity.sh`
`§SHARD-CLOSURE` is the wrong invariant for T2 (it would force re-bundling the dictionary). Closure for a
shard is asserted over the UNION **T0 ATTACH shard** by the new per-shard COVERAGE gate
(`scripts/erp_shard_coverage.js`) — exactly as the renderer sees it (precached seed + ATTACHed shard). The
T0 **seed** still passes standalone `§SHARD-CLOSURE dangling=0` (D1 intact).

**Witnessed** (`build/erp/logs/build_all_shards.log`):
- `§SHARD-SET tiers=[T0:8.2MB, T2:15 shards axis=menu-group] none-oversized=Y total=10.46MB maxShard=3.41MB empty=2`.
- `§SHARD-COVERAGE-SET shards=15 all-dangling=0=Y withDangle=0` — every shard offline-self-sufficient over
  T0∪shard. The 13 distinct `§SHARD-COVERAGE` `absentInSource` tab tables (`rv_*` report views, the 2
  unmaterialized `_v` admin views, `m_storage`, `fact_acct_balance`, …) are tables ABSENT from `ad_full.db`
  itself — reported, never synthesized; not a shard defect.
- `§SHARD-MANIFEST tables=660 residentT0=75 streamed=585 shards=15 hash=2c7c4ecef5802987` — the seam's
  `manifest()` payload (`build/erp/shards/manifest.json`): each `{table, menuGroup, resident, contentHash}`
  (per-table sha256), plus a `shards` index (menuGroup → file + whole-file hash). `resident` is computed
  vs the passed T0 (default `ad_seed_gen.db`, the thin seed-login → 75 resident); regenerate vs the
  deployable seed-demo before any deploy.
- New/changed scripts (DATA lane only): `scripts/build_all_shards.js` (driver), `erp_shard_coverage.js`
  (coverage gate), `build_shard_manifest.js` (manifest); `build_erp_shard.js` `buildModule` gains T0-dict
  subtraction + `_trl` deferral. Outputs LOCAL only (`build/erp/shards/`). Renderer fold untouched; serving
  (DataSource wiring) NOT re-solved — Host-lane handoff. STOP — no deploy without explicit GO.

## §8b Acceptance (D3) — MET 2026-06-03 (local, deploy HOLD-for-GO)
`build_erp_shard.js --rekey-client 11 12` clones GardenWorld's LOGIN/ACCESS subgraph as a 2nd coexisting
tenant. Per [[project_erp_shard_rekey]] PG carries only clients 0+11 — there is no genuinely-different
tenant to import — so D3 re-keys client 11 → 12 (real EXTRACT, only the surrogate keys offset; the
FK-rewrite `migrate_pg_to_sqlite.js:169` deliberately skips). Output `build/erp/ad_seed_rekey.db` (a
seed-demo base + the client-12 clone); HOLD-for-GO.

**Method (NON-INVENT, deterministic):** the 7 access tables (`ad_client` · `ad_org` · `ad_role` · `ad_user`
· `ad_user_roles` · `ad_role_orgaccess` · `ad_window_access`) are already whole in the seed (DICT_CORE).
Each client-11 row is re-inserted with `ad_client_id → 12`; `ad_org_id`/`ad_role_id`/`ad_user_id` → `+10M`
(`ERP_REKEY_OFFSET`, collision-asserted; max real id 200001 ≪ 10M); `ad_window_id` + audit cols
(`createdby`/`updatedby`) KEPT → they resolve to the retained client-11 rows. So 11 + 12 coexist and the
login graph stays closed. Business-data clone (`c_*`/`m_*` rows for client 12) is a heavier follow-up,
deliberately NOT bundled — the witness is the access surface (roles + windows).

**Witnessed** (`build/erp/logs/build_rekey.log`, `gate_rekey.log`):
- `§CLIENT-SWITCH client=12:GardenWorld roles=4 windows=414 src=11 out=ad_seed_rekey.db MB=8.7`.
- `§REKEY cloned ad_client=1 ad_org=9 ad_role=4 ad_user=6 ad_user_roles=9 ad_role_orgaccess=17 ad_window_access=1080 offset=10000000`.
- Gate `§SHARD-CLOSURE shard=ad_seed_rekey.db login=0 menu=0 window=0 fk=0 dangling=0` → CLOSED (both clients).
- Cross-check: client 11 intact (4 roles); client-12 role ids = src+10M (10000102/103, 10050004, 10200001);
  0 orphans on `ur→role` / `oa→org` / `role→client`; client-12 access-row content hash STABLE across reruns.
- Renderer untouched; output local only. STOP — no deploy without explicit GO.

## §9 Large-client PG→SQLite migration (SPEC, 2026-10-13 — no code yet)
> Question (user): can a ~10 GB client PG DB migrate to SQLite and shard into the browser? Sharding tiers
> (§1–§8, `IDEMPIERE_DATA_STREAMING_SPEC.md`, `ACCESS_FREQUENCY_SHARDING.md`) are designed and witnessed ONLY on the
> 45 MB `ad_full.db`. The gap is the front-end `scripts/migrate_pg_to_sqlite.js`, which was sized for the dictionary.

**Measured from the code (not assumed):**
- `pgCopy()` (`migrate_pg_to_sqlite.js:94-99`) uses `execFileSync` with `maxBuffer = 512 MB` (`:46`, comment: "largest
  table is ~11MB"), then `payload.split('\n')` (`:291`) → the WHOLE table's text sits in RAM, twice. Any table whose COPY
  text exceeds 512 MB throws `ENOBUFS`; below that it still costs ~2× table size in heap.
- Values are bound as TEXT into `NUMERIC`-affinity columns (`affinity()` `:134-140`) → SQLite coerces to INTEGER/REAL
  (IEEE double). Exact for amounts ≤15 significant digits; NOT proven for wider NUMERIC. Twin rule requires exact books.

**Unmeasured, industry-typical (labelled ESTIMATE; replace with `pg_total_relation_size` on the real client):**
largest iDempiere tables in a mature client: `fact_acct`, `m_transaction`, `m_costdetail`, `c_orderline`,
`c_invoiceline`, `m_storageonhand`, `ad_changelog`, `ad_pinstance*`, `ad_session`, `ad_attachment`/`ad_archive` (BLOB).
Expect `fact_acct` + `ad_changelog` + BLOB tables to dominate; each can individually exceed 512 MB at 10 GB total.

**Changes (≈ few dozen lines, same script — do NOT fork):**
1. Stream COPY: psql stdout is handed to a spool FILE (`execFileSync … stdio:[ignore,fd,inherit]`, stays synchronous), read back in
   8 MB chunks (utf8-safe, partial tail carried), inserted in transactions of `ERP_BATCH` rows (default 50 000). Heap bounded by chunk.
2. Build indexes AFTER load; `PRAGMA journal_mode=OFF; synchronous=OFF` during bulk load (rebuildable output).
3. NUMERIC: per column, read PG `numeric_precision/scale`; where a value does not round-trip through a double
   (`String(Number(s)) !== normalised(s)`), store TEXT/scaled-integer and log `§MIGRATE_NUMERIC_WIDE table col n`.
4. BLOB columns (`ad_attachment`, `ad_archive`, `ad_image`): out of the SQLite shard set; keep as content-addressed objects.
5. Cold set (policy §2 of `ACCESS_FREQUENCY_SHARDING.md`) is written to separate T2 files at load time, not post-split.

**Witnesses (each names the issue it proves):**
- `§MIGRATE_ROWS table rows_pg rows_sqlite` equal for EVERY table (silent row loss).
- `§MIGRATE_SUM table col sum_pg sum_sqlite` exact string match over all NUMERIC cols (float drift).
- `§MIGRATE_MEM peakRssMB` while migrating the largest table stays under a stated cap (proves streaming, not buffering).
- `§MIGRATE_VACUOUS` if a table/col set judged is empty → INCONCLUSIVE, never PASS.
- Shard stage: `§SHARD-SET` T0 ≤ 13 MB and `§SHARD-CLOSURE dangling=0` on the scaled DB.

**Bloat test bed (non-invent):** scale by REPLICATING real GardenWorld rows with re-keyed ids (same method as
`--rekey-client`, offset-asserted) into a SCRATCH PG database — never the working `idempiere` DB. Target ≥10 GB with
the real column shapes and index set. Browser side: headless Chromium, numeric readouts only (heap, OPFS bytes,
range-bytes-per-query, cold-start ms) vs the 200 MB mobile ceiling (`FoldEngineConstraints.md` §2 #1). Desktop
emulation cannot reproduce the iOS ~500 MB tab kill; that limit stays a cited figure, not a measured one.

### §9.1 RESULT 2026-10-13 — built + run (log: `build/erp/logs/{bloat10_build,migrate_bloat10}.log`)
- **Equivalence:** old vs streaming loader on GardenWorld, per-table sha256 over all rows: `§MIGRATE_EQUIV tables=925 differing=0`.
- **Bed:** `scripts/build_bloat_pg.js` → scratch PG `bloat10`: `§BLOAT_VERDICT PASS tablesOk=11 replicatedHeapGB=9.32 dbSize=11 GB`
  (fact_acct 12.7 M rows, m_costdetail 6.6 M, c_orderline 5.5 M …). Own PK re-keyed densely (`max + (g-1)*n0 + rank`, stays int4);
  FKs dropped, NOT re-keyed → tests size/memory/fidelity, NOT closure. Working `idempiere` DB untouched.
- **Migration of the 45.8 M-row, 9.3 GB-heap DB:** `§MIGRATE_VERDICT PASS rows-match-all-tables tables=925 peakRssMB=237`;
  `/usr/bin/time`: 23 m 18 s wall, max RSS 243 MB; SQLite output 9.62 GB. `§MIGRATE_ROWS FAIL` count = 0. `§MIGRATE_NUMERIC_WIDE` lines = 0.
- **Old loader, same job:** would throw at the 512 MB `maxBuffer` on any table whose COPY text exceeds it (fact_acct here ≈ 2.9 GB heap) — by code reading, not re-run.
- **NOT done / gaps (named):** (a) per-column exact SUM witness (`§MIGRATE_SUM`) not implemented — only row counts + wide-NUMERIC text count;
  (b) replicated rows repeat 300–300 real rows, so numeric-width coverage = GardenWorld's, not a real client's; (c) shard stage
  (`build_erp_shard.js` T0/T1/T2 split) NOT run on this DB; (d) browser/mobile measurement (httpvfs range bytes, heap, cold start) NOT run;
  (e) BLOB-table exclusion (item 4) and index-after-load (item 2: the loader creates no indexes at all) not applicable/implemented.

### §9.2 Range-read witness (SPEC, 2026-10-13 — written before the script)
**Issue it proves/disproves:** "a 9.6 GB SQLite on a dumb static host can serve keyed ERP queries to a browser reading only the
pages it needs." **Found while specifying:** `ad_full.db` and `bloat10.db` carry ZERO indexes (`sqlite_master type=index` = 0) —
so a keyed lookup would scan the table; at 12.7 M `fact_acct` rows that is GBs over HTTP. Hence loader flags `ERP_INDEX=1`
(recreate PG index column-lists after load) and `ERP_PAGE_SIZE` (match httpvfs `requestChunkSize`).
**Arms:** A = `bloat10.db` (no index, 4 KB pages) · B = `bloat10_idx.db` (PG indexes, 16 KB pages).
**Rig:** `scripts/range_read_witness.js` — Node static server with `Range` support that COUNTS bytes+requests per query window;
headless Chromium (puppeteer, CPU only, `Emulation.setCPUThrottlingRate(4)` as the mobile proxy) loads
`bim-ootb/viewer/lib/httpvfs.js` (`createDbWorker`, `serverMode:'full'`). Numbers only; no screenshots.
**Queries (each reports `§RANGE q=<name> ms bytes requests rows`):**
 Q1 `SELECT count(*) FROM ad_window` (dictionary) · Q2 `SELECT * FROM fact_acct WHERE fact_acct_id=?` (PK point lookup, 12.7 M rows) ·
 Q3 `SELECT * FROM c_orderline WHERE c_order_id=?` (master→detail drill) · Q4 `SELECT * FROM c_order WHERE c_order_id=?`.
**Asserts (VACUOUS-guarded):** rows>0 for every query else `INCONCLUSIVE`; arm B Q2 bytes < 1 % of table bytes (`§RANGE_RATIO`);
arm A Q2 bytes reported as-is (expected ≈ whole-table scan = the failure this witness exists to expose).
**Honest bound:** desktop Chromium + CPU throttle ≠ a phone; iOS ~500 MB tab kill stays a cited figure, not measured here.

### §9.3 RESULT 2026-10-13 — range-read witness (logs: `build/erp/logs/range_armA.log`, `range_armB.log`, `migrate_bloat10_idx.log`)
Rig: headless Chromium, CPU-only, 4× CPU throttle, `httpvfs` `serverMode:'full'`, Node static server with Range, bytes counted server-side (HEAD excluded).
| query | A: no index, 4 KB pages (9.85 GB file) | B: PG indexes, 16 KB pages (10.2 GB file) |
|---|---|---|
| Q1 dictionary count | 127 KB · 5 reqs | 16 KB · 1 req |
| Q2 `fact_acct` by PK (12.7 M rows) | **3.12 GB · 611 reqs · 14.6 s** (30 % of file) | **49 KB · 3 reqs · 11 ms** (`§RANGE_RATIO pct=0.0005`) |
| Q4 `c_order` by PK (2.1 M rows) | 711 MB · 146 reqs · 4.2 s | 131 KB · 6 reqs · 188 ms |
| Q3 `c_orderline` by `c_order_id` | invalid (0 rows: key came from a replicated order whose lines keep old FKs) | 1.37 GB · 317 reqs · 6.1 s · 16 587 rows — **no FK index in the bed**: `build_bloat_pg.js` drops all non-PK indexes on replicated tables |
- **Finding 1 (decisive):** unindexed, one keyed lookup moves GBs; indexed, it moves tens of KB. The loader now takes `ERP_INDEX=1` (`§MIGRATE_INDEX created=2047 sec=10`) and `ERP_PAGE_SIZE`. Any shipped large DB MUST use them; dictionary-size DBs ship unindexed today (`ad_full.db` indexes=0).
- **Finding 2:** FK indexes matter as much as PKs — master→detail drill is the AD engine's core move; Q3 shows the cost of missing one (a real PG client has them; the bed removed them).
- **Indexed migration:** `§MIGRATE_VERDICT PASS` 925 tables, 16 m 31 s, max RSS 231 MB, output 9.95 GB.
- **Gaps:** arm A used 4 KB chunks and B 16 KB (page size confounded with index; the 3.1 GB vs 49 KB gap is index-dominated). Arm A `open` line is invalid (HEAD was counted; fixed after). Q3 not re-run on A or B-with-FK-index. Not a phone: desktop Chromium + CPU throttle. Shard stage (T0/T1/T2 split) and cold-start under network throttle still NOT run.

## §10 Warm/cold split on RELATED rows — design + first try (2026-10-13, SPEC before script)
**Issue (found by reading `sharding_boundaries.json` / `gen_sharding_boundaries.js:46-105`):** today the split is per-table and
header-only. (1) Lines (`c_orderline`, `c_invoiceline`, `m_inoutline`) and dependents (`m_transaction`, `c_allocationline`) are NOT in the
map → unassigned; a cold header's lines have no tier. (2) `fact_acct` splits by PERIOD, docs by DOCSTATUS — two independent rules that
disagree (CL doc in an open period; CO doc in a closed period). (3) A warm row can reference a cold row (`c_invoice.c_order_id` → a closed
order; `c_allocationline` → a closed invoice); `resolveFK` then forces a cold ATTACH on a warm screen, defeating "cold never resident".
**Rule set (one owner per question, BOM principle — parent + children atomic):**
 R1 *Aggregate*: a header + all its lines + every dependent row owned by them (via `<hdr>_id`, `ad_table_id+record_id`, `*line_id`) is ONE unit; a unit is never split across tiers.
 R2 *Candidate*: unit is cold-eligible iff header `DocStatus IN ('CL','VO')` (period-closed `fact_acct` follows its OWNER unit; period only adds candidates for units already complete).
 R3 *Reverse closure*: cold set = greatest subset C of candidates such that NO row outside C references a unit in C. Computed by fixed point:
    repeat { pin to warm every candidate unit referenced by any warm row } until no change. Warm→cold edges = 0 by construction; cold→warm and cold→cold are fine (warm is always attached).
 R4 *Dependent rows* referencing several units are cold iff ALL their units are cold; otherwise warm and they pin the cold ones (via R3).
 SQL form for scale: each pass is one anti-join `UPDATE cand SET pinned=1 WHERE EXISTS (SELECT 1 FROM refs r JOIN warm w ON … )`; passes = longest chain of warm→cold references (small).
**Witnesses (INCONCLUSIVE when nothing judged):** `§SPLIT_UNITS`, `§SPLIT_PINNED n reasons`, `§SPLIT_ORPHANS=0` (every line/dependent has an owner unit or is reported),
`§SPLIT_WARM_TO_COLD=0` (re-checked from scratch after the fixed point), `§SPLIT_EXHAUSTIVE warm+cold == total` per table.
**Honest bound:** real data = GardenWorld (almost no closed docs) → policy run is mostly INCONCLUSIVE; a labelled STRESS run (extra
candidates = docs older than a cutoff date — a parameter, not invented rows) exercises the same graph machinery on the same real rows.
The REAL warm/cold ratio needs a real client's data.

### §10.1 RESULT 2026-10-13 — `scripts/shard_split_plan.js` on REAL GardenWorld rows (`new.db` = full migrate of `idempiere`; logs `build/erp/logs/split_*.log`)
Graph: 21 header tables, 12 line tables, dependents `fact_acct,m_transaction,m_costdetail,m_matchinv,m_matchpo`; 419 units, 1292 rows.
| mode | cold candidates | pinned warm by R3 | cold units | warm→cold refs: fixed-point | same under today's per-table rule | verdict |
|---|---|---|---|---|---|---|
| policy (DocStatus CL,VO) | 1 | 1 | 0 | 0 | 11 | INCONCLUSIVE (nothing left cold) |
| stress, dateacct < 2003-01-01 | 25 | 0 | 25 | 0 | 206 | PASS |
| stress, dateacct < 2004-01-01 | 36 | 2 | 34 | 0 | 763 | PASS |
- **The problem is real, not hypothetical:** the ONE closed order in GardenWorld (`c_order:102`) is referenced by a live invoice (`c_invoice:103`); R3 pins it warm (`§SPLIT_PINNED_WHY`). Today's per-table rule would have sent it cold and left 11 warm rows pointing at it.
- **Chains are real:** 2004 run pins `m_inout:108` (a draft `m_inoutconfirm` references it) in pass 1, then `c_order:108` (its shipment line references the order) in pass 2 — `passes=2`.
- **Postings follow their owner:** after letting `fact_acct` resolve through a dependent owner (`m_matchinv`, 76 rows), `fact_acct` splits 288 cold / 12 warm in the 2004 run; 2 dependents have no owner and stay warm (reported `§SPLIT_ORPHANS`).
- **Exhaustive:** warm+cold == total for every table. **Honest bound:** the stress cutoff is a parameter on real rows, not a client's real closed-doc share; policy mode shows the closed-doc share in GardenWorld is ~0, so the realistic ratio and chain depth need a real client. Fixed point verified here in JS; the SQL anti-join form for 10 GB is specced (§10) but NOT built/run.

### §10.2 SQL planner for scale (SPEC, 2026-10-13 — written before `scripts/shard_split_plan_sql.js`)
Same rules R1–R4 as the JS planner, set-based so it runs on the 10 GB file without loading rows into JS.
- Work DB `split.db` (writable) with the source ATTACHed read-only-in-practice (SELECT only). Unit code = `tblno*2^32 + id`.
- Tables: `cand(u)`, `cold(u)` (working set, starts = cand), `ue(src,dst)` distinct unit→unit refs (header/line FK cols; line→its own header excluded),
  `de(dep,dst)` distinct dependent→unit refs (`fact_acct` via `ad_table_id`+`record_id`, resolved through a dependent owner such as `m_matchinv` when that is the owner).
- Fixed point per pass: (a) `DELETE FROM cold WHERE u IN (SELECT dst FROM ue WHERE src NOT IN cold)`; (b) `DELETE FROM cold WHERE u IN (SELECT d2.dst FROM de d1 JOIN de d2 USING(dep) WHERE d1.dst NOT IN cold)`; stop when both change 0 rows.
- Independent re-check: `warm→cold` = count of `ue` rows with warm src / cold dst + dependents with a warm ref and a cold ref; must be 0.
- **Correctness gate before scale:** on a small re-keyed bed the SQL cold set must EQUAL the JS planner's cold set (`--dump-cold`, diff = empty) in policy and stress modes; only then run on 10 GB. `§SPLIT_EQUIV` reports it.
- Bed change that makes this meaningful: `build_bloat_pg.js` v2 re-maps every FK into another replicated table with the SAME copy index (copy g of an invoice → copy g of its order); `§BLOAT_FKCHECK … dangling=0`.

### §10.3 RESULT 2026-10-13 — re-keyed 11 GB bed + SQL split planner at scale (logs `build/erp/logs/{bloat10r_build,migrate_bloat10r,split10_*,range_armC}.log`)
- **Bed v2** (`build_bloat_pg.js`): every FK into another replicated table re-mapped with the SAME copy index; K = 29 138 copies of 23 tables; `§BLOAT_FKCHECK … dangling=0` on 6 edges; PG 12 GB; 8.74 M `fact_acct`, 9.67 M `c_orderline`, 9.12 M `c_order`, 17.5 M dependent→unit edges.
- **Migration** (`ERP_INDEX=1 ERP_PAGE_SIZE=16384`): `§MIGRATE_VERDICT PASS` 925 tables, 15 m 43 s, max RSS 246 MB, 10.93 GB, `§MIGRATE_INDEX created=2057`.
- **SQL planner, equivalence first:** on real GardenWorld, SQL cold set == JS cold set in all 3 modes (policy / <2003 / <2004; policy set empty in both).
- **SQL planner at 10 GB** (`shard_split_plan_sql.js`, max RSS 108 MB, work DB 0.7–0.9 GB):
| mode | candidates | pinned warm | cold units | warm→cold | wall | verdict |
|---|---|---|---|---|---|---|
| policy (CL,VO) | 29 139 | 29 139 | 0 | 0 | 72 s | INCONCLUSIVE (all pinned: each closed order has a live invoice, as in GardenWorld) |
| stress, dateacct < 2004-01-01 | 932 452 | 58 278 | 874 174 | 0 | 54 s | PASS (3 passes: shipment pinned, then its order) |
  Stress cold share: `fact_acct` 8.39 M of 8.74 M rows cold; `c_orderline` 758 k of 9.67 M; `m_transaction` 728 k of 816 k.
- **Range read on the FK-indexed bed** (`range_armC.log`): `fact_acct` PK 49 KB / 3 reqs / 12 ms; `c_orderline` by `c_order_id` **49 KB / 3 reqs / 11 ms** (was 1.37 GB with no FK index); `c_order` PK 98 KB / 185 ms; file 11.7 GB → closes the §9.3 Q3 gap.
- **Still NOT done:** warm/cold shard FILES are not written (plan only); the cutoff is a stress parameter; replicated data has GardenWorld's mix and decimal widths; no phone run; cold-start under network throttle not run.

### §10.4 Phone-proxy witness (SPEC, 2026-10-14 — written before `scripts/phone_sim_witness.js`)
**Issue it proves/disproves:** "a COLD start (nothing cached) of the first ERP window over a slow mobile link on the 11 GB file is usable, and the open path
(54 range requests / 0.9 MB on localhost) is not latency-bound." Estimate to confirm or kill: 54 sequential requests × 150 ms RTT ≥ 8 s.
**Proxies (NOT a phone; labelled in every log line):** headless Chromium, `Emulation.setCPUThrottlingRate(4)`, touch+phone UA, fresh profile per cold run;
network shaped SERVER-SIDE (per-request RTT delay + per-connection bytes/s cap) because CDP page throttling does not cover the dedicated worker httpvfs fetches from;
memory capped with a cgroup (`systemd-run --user --scope -p MemoryMax=…`) as a stand-in for a tab kill; Chromium RSS sampled every 200 ms (`peakRssMB`).
**Profiles:** `wifi` 20 ms RTT · 6 MB/s · `4g` 80 ms · 1.5 MB/s · `slow4g` 150 ms · 200 KB/s (= 1.6 Mbps, Lighthouse mobile default).
**First window = Sales Order** (numbers only): W1 `ad_window` by name · W2 `ad_tab` by window · W3 `ad_field` by first tab · W4 `c_order` by PK · W5 `c_orderline` by `c_order_id`.
**Reports:** `§PHONE profile chunk open{ms,reqs,bytes} W1..W5{ms,reqs,bytes} firstWindowMs totalBytes totalReqs peakRssMB`, cold (new browser) and repeat (same worker, in-session cache).
**Asserts:** every W* rows>0 else INCONCLUSIVE; `OOM/killed` is reported as FAIL with the cap, never PASS. Chunk 16 KB vs 64 KB compared to test fewer-requests-per-open.
**Honest bound:** desktop Chromium on this CPU ≠ a phone SoC; cgroup kill ≠ iOS jetsam; server-side shaping has fixed RTT, no loss/jitter.

### §10.5 RESULT 2026-10-14 — phone-proxy witness (`scripts/phone_sim_witness.js`; logs `build/erp/logs/phone_*.log`)
PROXY, not a phone: headless Chromium, 4× CPU throttle, server-side RTT + per-connection bandwidth shaping, 11.2 GB `bloat10r.db`, 16 KB pages. Fresh browser per cold run.
| profile | RTT · bandwidth | open (54 reqs, 0.9 MB) | cold first window (128 reqs, 2.1 MB) | repeat (same session) |
|---|---|---|---|---|
| none | 0 · off | 0.28 s | **0.53 s** | 9 ms · 0 reqs |
| wifi | 20 ms · 6 MB/s | 1.4 s | 3.1 s | 12 ms · 0 reqs |
| 4g | 80 ms · 1.5 MB/s | 4.7 s | 10.9 s | 10 ms · 0 reqs |
| slow4g | 150 ms · 200 KB/s | 8.6 s | **20.2 s** | 10 ms · 0 reqs |
| slow4g, 64 KB chunks | 150 ms · 200 KB/s | 21.4 s (3.5 MB) | 46.9 s (7.7 MB) | 10 ms |
- **Estimate confirmed:** the open is latency-bound — 54 requests × 150 ms ≈ 8.1 s predicted, 8.6 s measured. 64 KB chunks are WORSE (same request count, 4× the bytes): keep `requestChunkSize` = page size.
- **Memory:** whole-Chromium-tree RSS rose 39–123 MB above an empty page while using the 11 GB file (`dbDeltaMB`; slow4g/16 KB = 101 MB). Tree includes browser+GPU+network processes, so it overstates a single tab. The 200 MB mobile ceiling (FoldEngineConstraints §2) is not exceeded by the DB access itself; the cgroup-cap run was NOT done.
- **Cold-start dominated by the dictionary, not data:** at slow4g, `W3 ad_field by ad_tab_id` = 8.9 s / 57 reqs / 0.97 MB (≈ 44 % of queries). Real iDempiere's PG has NO index on `ad_field.ad_tab_id` either (only pkey, column, uu) — PG hides it with an in-memory scan; over range reads it costs requests.
- **NEGATIVE result, root cause UNCONFIRMED:** adding `CREATE INDEX ix_ad_field_tab ON ad_field(ad_tab_id)` (plan verified: `SEARCH … USING INDEX`) made W3 WORSE on slow4g: 45 s / 27 reqs / 8.7 MB. Hypothesis: httpvfs read-ahead grows the fetch on near-sequential page access; not tested. The index was dropped again. Do NOT ship an `ad_field` index on this evidence.
- **Design consequence (reasoned from the T0/T1/T2 spec, not run here):** the AD dictionary is T0 (precached `ad_seed.db`, 12.7 MB) and never range-read, so W1–W3 are not on the network in production. The network cost of the first DATA drill is the open + W4/W5: measured parts 8.6 s + ~1.4 s ≈ **~10 s on slow4g, first time only**, then 0 requests in-session. That composition is an ESTIMATE from measured parts, not a measured end-to-end run.
- **Not done:** cgroup memory-cap kill test; real phone; HTTPS/secure-context features (service worker, Web Crypto, OPFS) over LAN; jitter/packet loss; fewer-requests open (e.g. larger first fetch of the DB header + root pages) is an untested idea.

### §10.6 Demo service (2026-10-14) — `scripts/range_demo_server.js`
Static host with HTTP Range for one big SQLite file + a test page that runs open + W1–W5 in the VIEWER'S browser and POSTs numbers to the server log
(`§DEMO_REPORT`/`§DEMO_STEP`; the tester only taps a button — numbers, not eyes, are the evidence). Binds 0.0.0.0, URL carries a random token, serves only the page,
the db (read-only) and three httpvfs lib files; wrong/no token = 404 (checked). Verified end to end with headless Chromium over the LAN IP:
`open 54 reqs 880 KB · W1..W5 · totalMs=369`, `secureContext=false` (plain HTTP on a LAN address — service worker / Web Crypto / OPFS unavailable there, as predicted).
Limits: per-process byte counter is shared (one tester at a time); plain HTTP; LAN-only unless tunnelled; this serves the file, it does NOT shard it (shard-file writer not built).

### §10.7 RESULT 2026-10-14 — FIRST REAL PHONE RUN (log `build/erp/logs/range_demo_server.log`, `§DEMO_REPORT ip=192.168.1.14`)
Device: Android 10, Chrome 155, 8 cores, home Wi-Fi to the PC (`navigator.connection`: net=4g rtt=50 ms down=1.65 Mbps), plain HTTP (`secure=false`), ONE run, cold session.
`totalMs=10140`: open 5891 ms (54 reqs, 880 KB) · W1 175 (3) · W2 240 (5) · W3 fields 3251 (57) · W4 158 (3) · W5 198 (6). Requests and bytes are IDENTICAL to the desktop proxy (128 reqs, 2.1 MB) — they are deterministic.
- **Effective cost ≈ 55 ms per range request** on this phone (W1 58, W3 57, W4 53, W5 33 ms/req; open 109 ms/req incl. wasm instantiate). Matches the browser's own rtt=50 ms.
- **Proxy calibration:** the `wifi` profile (20 ms) predicted 3.1 s for the cold first window — real was 10.1 s (3.3× slower); the `4g` profile (80 ms) predicted 10.9 s — close. Use the `4g` row as the phone-on-Wi-Fi proxy.
- **Lever = request count, not bytes:** 128 requests → ~7 s of the 10.1 s. W3 alone (57 reqs) is 3.25 s. Dictionary steps W1–W3 (65 reqs ≈ 3.7 s) disappear if the dictionary is the precached T0 seed, as designed.
- **NOT measured:** phone memory (`deviceMemory` n/a in this browser), repeat-in-session, mobile data, iPhone, secure-context features, more than one run (no variance).

### §10.8 RESULT 2026-10-14 — what the 54-request open actually is (log: `range_read_witness.js` open lines; builder: scratchpad `mk.js`, not committed)
- **Cause = the schema, not the data.** `bloat10r.db`: 927 tables + 2 057 indexes, `sum(length(sql))` = 613 KB; the open reads that b-tree (54 reqs / 880 KB at 16 KB pages). SQLite parses the whole schema on open.
- **Controlled test (same GardenWorld rows, 16 KB pages, no indexes):** full 927-table file → open **34 reqs / 573 KB**; slim file with only the 23 document-graph tables → open **3 reqs / 64 KB** (≈ 11× fewer requests, 9× fewer bytes). Data volume is irrelevant to open cost.
- **Consequence:** per-module / per-tier shard files (the T2 design) are not only about size — a small schema makes each open ~3 requests. At the phone's measured ~55 ms/request (§10.7) the 54-request open (5.9 s) would be ≈ 0.2 s for a 3-request open. ESTIMATE from measured parts; slim file with its indexes and real 10 GB of rows not yet built or phone-tested.
- **Not tested:** slim file WITH indexes (adds ~38 index rows to the schema; expected small), the schema-heavy `ad_*` dictionary as a shard, any non-GardenWorld schema.

## §11 Shard-file writer (SPEC, 2026-10-14 — written before `scripts/shard_write.js`)
**Issue it proves/disproves:** the split plan (§10) can be MATERIALISED into two small-schema files — `warm.db` and `cold.db` — that (a) together hold exactly the source rows (no loss, no duplicate),
(b) open in ~3 range requests each (§10.8) even when 10 GB, (c) answer the same keyed lookups as the monolith.
**Input:** source SQLite (`bloat10r.db`) + the planner's work DB (`cold(u)` unit set, `depcold(dep)` dependent set) from `shard_split_plan_sql.js` (stress mode — labelled; policy mode leaves cold empty).
**Output (`outdir/`):** `warm.db`, `cold.db` (16 KB pages) each holding ONLY the split-graph tables (headers, lines, dependents) with their original DDL + PG-derived indexes; `manifest.json`
{table → warm/cold/source rows, file bytes, sha256}. Row routing: header → by its unit in `cold`; line → by its header's unit; dependent → by membership in `depcold`; dependents with no refs → warm.
**Witnesses (INCONCLUSIVE if nothing judged):** `§SHARD_ROWS table warm cold source` with `warm+cold==source` for EVERY table; `§SHARD_DISJOINT` (no pk in both); `§SHARD_OPEN file reqs bytes`
(range_read_witness open line: expect ≈3 reqs, schema ≪ 100 KB); `§SHARD_LOOKUP` sample order+lines+postings found in exactly one file and equal to the source row (sha of row JSON).
**Honest bound:** stress-mode cold set (date cutoff, parameter on real rows); dictionary/other 880 tables are NOT in these files (they are T0/other shards); one-shot writer, no incremental update.

### §11.1 RESULT 2026-10-14 — shard files written from the 11 GB bed (`scripts/shard_write.js`; logs `build/erp/logs/shard_write10.log`, `split10_for_writer.log`)
- **Plan:** stress cutoff 2004-01-01 (labelled stress): 932 452 candidates, 58 278 pinned warm, 874 174 cold units, `§SPLIT_VERDICT PASS` (67 s).
- **Write:** 110 s wall, max RSS 250 MB, 38 split-graph tables → `warm.db` 5.29 GB + `cold.db` 3.86 GB (16 KB pages, 99 indexes each, schema 42 KB each). `§SHARD_ROWS` warm+cold == source for all 38 tables (`mismatches=0`); `§SHARD_UNIT_INTACT lineOrphans=0` measured on the OUTPUT files; `§SHARD_WARM_TO_COLD total=0` over 8 real FK edges; `§SHARD_VERDICT PASS`.
- **Witness can fail (negative control, GardenWorld):** forcing the pinned `c_order:108` into the cold set made the writer report `warm->cold=1` and `FAIL`.
- **Open cost:** warm.db opens in **5 reqs / 98 KB**, cold.db **5 reqs / 82 KB** (monolith: 54 reqs / 880 KB). Desktop drill on warm.db (`DEMO_MODE=shard`): open + pick + order + lines + postings = **24 reqs / ~460 KB, 531 ms**.
- **Phone estimate (NOT measured):** 24 reqs × ~55 ms ≈ 1.3 s vs the monolith's 10.1 s.
- **Caveats:** stress-mode cold set; only split-graph tables in these files (880 other tables are not); shard-writer is one-shot; `warm.db` still 5.3 GB, so a phone reads it by range, not whole.

### §11.2 RESULT 2026-10-14 — shard files on the REAL phone (`range_demo_server_shard.log`, `§DEMO_REPORT ip=192.168.1.14`, ONE run)
Same Android 10 / Chrome 155 phone, `warm.db` (5.3 GB, 5-request open): `totalMs=4937` — open 2586 ms (5 reqs, 96 KB) · pick order 857 (3) · order 182 (3) · lines 675 (6) · postings 611 (7). 24 requests / 456 KB.
| | monolith 11 GB (§10.7) | `warm.db` shard | change |
|---|---|---|---|
| requests | 128 | 24 | 5.3× fewer |
| bytes | 2.1 MB | 0.46 MB | 4.6× fewer |
| total (cold) | 10.1 s | 4.9 s | 2.1× faster |
- **My estimate was wrong:** §11.1 predicted ≈ 1.3 s (24 reqs × 55 ms). It forgot the fixed start-up cost: 5 requests took 2.6 s to open (≈ 517 ms/req), so ≈ 2.5 s of the open is NOT range requests — most likely worker start + the 1.2 MB sqlite wasm download/compile on the phone (not isolated; `§DEMO_LIB` serve-time logging added to separate it next run).
- **Per-request cost varied between runs:** monolith queries 4022 ms / 74 reqs = 54 ms/req (browser reported rtt=50); shard queries 2325 ms / 19 reqs = 122 ms/req (browser reported rtt=100). Single samples on home Wi-Fi: network state differed, so the 2.1× is a floor-ish comparison, not a stable ratio. Needs ≥3 runs each.
- **Implication:** with the start-up cost fixed (~2.5 s, cacheable by the service worker in the real app), the remaining range-read cost is per-request × request count, which shards cut 5.3×.

### §11.3 RESULT 2026-10-14 — repeated real-phone runs (same Android 10 / Chrome 155 phone, home Wi-Fi, plain HTTP; logs `range_demo_server*.log`)
Cold first window, ms (`totalMs`, click → last query): **monolith 11 GB** (n=4): 8872 · 10390 · 9192 · 12455 → median 9.8 s, range 8.9–12.5 s. **`warm.db` shards** (n=3): 3504 · 2819 · 3417 → median 3.4 s, range 2.8–3.5 s.
- **Speed-up ≈ 2.9× on medians; worst shard run (3.5 s) is 2.5× faster than best monolith run (8.9 s).** Requests 128 → 24. Small n; one phone, one network.
- **Run-to-run noise is real:** monolith's slowest run (12.5 s) is the one where the browser reported rtt=100 ms (others 50 ms); shard run 3 also reported rtt=100 but stayed 3.4 s.
- **Steady-state per-request cost ≈ 45–56 ms** at rtt=50 (monolith query steps 3.6–4.1 s / 74 reqs; shard query steps 0.85–1.06 s / 19 reqs); 72 ms at rtt=100.
- **Open decomposition (server `§DEMO_LIB`):** the 1.24 MB `httpvfs-sql-wasm.wasm` took 1.0–2.1 s to serve to the phone (shard runs 1.8 / 1.0 / 1.4 s; monolith 1.3 / 2.1 / 1.4 s) — i.e. ~1.4 s of every cold open is the engine download, identical for both. Remainder of open: monolith 3.9–4.2 s for 54 reqs (≈ 74 ms/req incl. wasm compile + schema parse), shard 0.74–0.96 s for 5 reqs.
- **So the shard cold start ≈ 3.4 s = ~1.4 s engine download + ~0.8 s open + ~1.0 s of 19 query requests.** The demo serves libs `no-store`; in the real app the service worker would cache the engine (not measured here), leaving ≈ 2 s. NOT measured: repeat visit, mobile data, other phones, memory on the phone.

## §11.4 Repeat-visit test (SPEC, 2026-10-14 — written before the server change)
**Issue it proves/disproves:** how much of the 3.4 s cold shard start (§11.3) is the one-off ~1.4 s engine download, i.e. what a RETURNING user sees when the engine is already on the device.
**Method:** `range_demo_server.js` with `DEMO_CACHE_LIBS=1` sends `cache-control: public, max-age=3600` on the three lib files (page and db responses stay `no-store`). Tester loads the link, taps once (primes the cache), then reloads and taps again, 3 repeat runs per link.
**Proxy caveat (stated up front):** this is the browser HTTP cache standing in for the real app's service worker (service workers need a secure context; plain-HTTP LAN has none). Compiled-wasm reuse by Chrome's code cache is possible but not controlled/observed here.
**Witness:** server log. A repeat run shows a `§DEMO_REPORT` with NO preceding `§DEMO_LIB` lines (engine served from device cache); a primed run shows the 3 lib lines. A repeat run whose lib lines still appear is NOT counted as a repeat (INCONCLUSIVE for that run).
**Reports:** per link: repeat `totalMs` vs the same link's cold `totalMs` (§11.3), `open` ms, and the delta attributed to the engine download.
