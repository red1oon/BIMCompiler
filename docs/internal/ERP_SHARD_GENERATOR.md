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
