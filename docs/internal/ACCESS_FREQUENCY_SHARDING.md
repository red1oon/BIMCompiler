# Access-Frequency Sharding — warm/cold split + on-demand loader (spec)

> Routed from `prompts/ERP_DATA_SHARDING_SESSION.md §QUEUED` (2026-06-13), prompted by
> [Fold-Engine Constraints Analysis](FoldEngineConstraints.md) (mobile OOM @200 MB · genesis @25 s).
> This is a **finer cut of the already-designed T0/T1/T2 tiers** (`IDEMPIERE_DATA_STREAMING_SPEC.md`),
> NOT a new system. **DATA + scripts only** — the renderer fold/UI is not edited.

## 1. Name mapping (brief → ours)
The brief's L0/L1/L2 map onto the shipped tier model — do not invent new tier names:

| brief | ours | source | when | budget |
|-------|------|--------|------|--------|
| **L0 init-bubble** | **T0** | `ad_seed.db` (precached) + `initbubble.json` | boot, **sync** | <1 s paint |
| **L1 warm** | **T1** | `warm_db` (open/active docs + masters) | async after paint → `ATTACH` | best-effort |
| **L2 cold** | **T2** | `cold_db` (closed/voided/archived) | **on-demand only** → `ATTACH`, `DETACH` after idle | never on boot |

T0 is already shipped (`bim-ootb/erp/initbubble.json` exists; the dictionary closure is in `ad_seed.db`).
This task adds the **access-frequency split** of the data below the dictionary, and the **loader** that
streams warm async / cold on-demand.

## 2. The split rule (non-invent — grounded in `ad_full.db`)
Source of truth = `build/erp/ad_full.db` (925 tables) + the iDempiere checkout. Every boundary traces to a
real column/value; nothing synthesized.

- **Dictionary class (`ad_*`, `*_v`, `*_trl`)** → **T0**. The scaffold the renderer always reads; already
  in `ad_seed.db`. Not re-sharded here.
- **Document tables carrying `DocStatus`** (34 tables, verified by `pragma_table_info`) split by status:
  - **warm → T1:** `DocStatus NOT IN ('CL','VO')` — drafted/in-progress/completed (the live working set).
  - **cold → T2:** `DocStatus IN ('CL','VO')` — closed + voided (read rarely, only on history drill).
  - Observed values in seed: `c_order` CO=7/CL=1, `c_invoice` CO=8. `CL`=Closed, `VO`=Voided, `CO`=Completed,
    `DR`=Drafted, `IP`=In-Process.
- **Master tables (no `DocStatus`)** referenced by the init-bubble (`C_BPartner`, `M_Product`,
  `M_Product_Category`, `M_Warehouse`, `C_ElementValue`, `M_ProductPrice`, `C_BP_Group`) → **T1** (small,
  hot, whole-table). Other reference/master tables stream via the existing T1 range path (out of scope here).
- **Genuinely cold, period-bound data → T2:**
  - **period-closed `fact_acct`**: rows whose `C_Period_ID` has `c_periodcontrol.periodstatus IN ('C','P')`
    (`C`=Closed, `P`=Permanently closed; `O`=Open, `N`=Never-opened are NOT cold). *Note:* `fact_acct` is
    **empty in `ad_full.db`** (postings live in the test/glassbowl DBs) → the rule is declared and exercised
    against whatever rows are present; absent → reported `rows=0`, never synthesized.
  - **archives**: `ad_archive`, `ad_archive_blob` (whole).

### ⚠ Reconciliation #1 — `T_*` are NOT cold shards (carried from the brief)
The brief listed "`T_*` reports" as L2/cold. **`T_*` tables are in-memory fold scratch / temp selection
tables with no persisted rows to shard** (`t_report`, `t_trialbalance`, `t_aging`, `t_selection`, … 23 of
them; see the reporting/GAP_CLOSURE lane — `foldStatement`/`foldPrint` produce them in-memory, `maxDiff=0c`).
They have nothing to ship to T2. The real cold candidates are **closed/voided docs + period-closed
`fact_acct` + archives** (above). `sharding_boundaries.json` reflects this — `T_*` are explicitly
`tier:"none", reason:"in-memory fold, not persisted"`.

### ⚠ Reconciliation #2 — read what's shipped
`initbubble.json` already exists (the L0/T0 layer is done) and serving (T0/T1/T2 + `DataSource`) is already
designed — "do NOT re-solve serving". This task adds **only** the access-frequency split + the loader.

## 3. `sharding_boundaries.json` (the artifact)
Per-table tier + split predicate. Schema:
```json
{
  "version": 1,
  "source": "build/erp/ad_full.db",
  "tierMap": { "L0": "T0", "L1": "T1", "L2": "T2" },
  "rules": [ { "match": "...", "tier": "...", "warmWhere": "...", "coldWhere": "...", "reason": "..." } ],
  "tables": [
    { "table": "c_order", "tier": "T1", "coldTier": "T2",
      "warmWhere": "DocStatus NOT IN ('CL','VO')", "coldWhere": "DocStatus IN ('CL','VO')" }
  ]
}
```
A table with both `tier` and `coldTier` is **partitioned**: warm rows go to `warm_db`, cold rows to
`cold_db`, by the two `WHERE` clauses (mutually exclusive + exhaustive over the table).

## 4. `build/erp/shard_loader.js` (the loader)
Engine-agnostic (browser sql.js OR node better-sqlite3) via a small `adapter` seam — mirrors the
`DataSource` rule "the caller must not know where rows come from".

```
new ShardLoader({ boundaries, adapter, idleMs=300000 })
  .init()                 // T0 sync: assumes base db (ad_seed) already open; returns paint-ready immediately
  .loadWarm()             // T1 async: ATTACH warm_db AS warm; resolves when attached
  .loadCold({onDemand})   // T2: ATTACH cold_db AS cold ONLY if onDemand===true; arms a 5-min idle DETACH timer
  .read(table, where)     // shard resolver + cross-shard merge IN JS (never loads a full T2 table into memory)
  .touchCold()            // reset idle timer (any cold read defers DETACH)
  .tick(nowMs)            // drive the idle-timeout deterministically in the POC (no wall-clock dependency)
```
- **Cross-shard merge in JS:** `read()` queries each attached shard that owns a partition of the table and
  concatenates rows in JS — it never `SELECT *` a whole cold table into memory; it pushes the caller's
  `where` down to each shard.
- **`DETACH` after idle:** `loadCold` records the load time; `tick(now)` (or a real timer in the browser)
  `DETACH cold` once `now - lastColdTouch > idleMs`. POC drives `tick` deterministically.
- **Falsifier hook:** the loader NEVER attaches cold inside `init()`/`loadWarm()`. A cold read requires an
  explicit `loadCold({onDemand:true})`; `read()` of a cold-only table without it returns `coldMissing=true`
  (the POC asserts this — see §FALSIFIER).

## 5. `scripts/poc_sharding.js` + `build/erp/poc_sharding.log` (the witness)
Mobile-emulated (UA string + 4× CPU throttle simulated by a busy-spin scale factor logged, not faked). Steps:
1. Build three shard DBs from `ad_full.db` per `sharding_boundaries.json`: `t0` (dictionary+masters subset),
   `warm_db`, `cold_db`. Real rows only.
2. `init()` → assert paint uses **T0 only**, `§` paint-time < 1 s, cold NOT attached.
3. warm query → `loadWarm()` auto-fires → `§` warm attached, rows from warm partition.
4. cold nav → `loadCold({onDemand:true})` → `§` cold attached on demand; `tick(now+idleMs+1)` → `§` detached.
5. cross-shard read of a partitioned table == `union(warm,cold)` rows → `§` equal.
6. **§FALSIFIER:** if cold is ever attached without `onDemand` (during init/loadWarm), or a cold read
   succeeds without an explicit `loadCold` → **FAIL**.

Witnesses: `§SHARD-FREQ paint=<ms> tier=T0 coldAttached=N`, `§SHARD-FREQ warm attached rows=<n>`,
`§SHARD-FREQ cold onDemand attached rows=<n> detachedAfterIdle=Y`, `§SHARD-FREQ crossShard union==Y`,
`§FALSIFIER coldWithoutDemand=<none|FAIL>`. OVERALL=PASS only if all hold.

## 6. On close
Flip the relevant rows of `FoldEngineConstraints.md` Phase-4 scorecard (Max DB size / Mobile memory) to
✅ Implemented (access-frequency split + on-demand loader land the size mitigation). DATA + scripts only;
renderer untouched; EXPLICIT GO before any deploy.

## 7. Update 2026-10-14 — cold = CL, VO **and RE** (see ERP_SHARD_GENERATOR.md §12.1)
§2's `DocStatus NOT IN ('CL','VO')` warm rule and `gen_sharding_boundaries.js` (`WARM`/`COLD`) miss **RE** (Reversed). iDempiere's `MInvoice.voidIt()` treats CL, RE, VO identically as terminal ("Document Closed"). On the real tenant `idempiere_pilot`, 352 of the 353 invoices referencing voided orders are `RE`; leaving them warm pinned 177 of 179 candidate orders warm. Cold-eligible statuses are now CL,VO,RE, and a unit also stays warm while any live (non-terminal) row references it (ERP_SHARD_GENERATOR.md §10 reverse closure). `gen_sharding_boundaries.js` NOT yet updated.
