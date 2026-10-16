# Local-First Prior Art — How Others Did It, Their Weaknesses, Our Workarounds
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*

> **See also:** [Browser-Scale Benchmark](BrowserScaleBenchmark.md) — how large our one-tab, local-first app is today, measured render and memory numbers, the memory threshold, and the claims we can cite against other projects.


**Scope.** Research companion to `ERP.md §0.20` (secured/durable next phase). For each production
local-first system: *how it works*, *its documented weakness*, and *the workaround our architecture
(`kernel_ops` deterministic semantic verbs + two-domain async split + native SQL + BIM/ERP unification)
opens*. Researched 2026-05-31; sources at end. Non-invent: weaknesses are each system's *own documented*
trade-offs, not our characterisation.

---

## The one lever that changes everything: **deterministic replay of semantic verbs**

Every system below pays a tax our prime directive (deterministic, non-invent) waives for free. Their
common problem: **the server and the client run *different code*** (or different merge rules), so they must
either (a) hand-code conflict logic per mutation, (b) overwrite the user's optimistic state when the server
disagrees, or (c) implement business logic *twice* (client + backend). Because `kernel_ops` verbs are
**deterministic and replayable** (proven: `replay-hash == live-hash`, §0.16/§0.19), the **same kernel runs
in both domains** (`ERP.md §701` — "the same core runs under sql.js (browser) and server"). Server result
== client result *by construction*. That single property neutralises the central weakness of Replicache,
PowerSync, and ElectricSQL at once.

---

## Per-system: mechanism → weakness → our workaround

### 1. Replicache — server re-runs mutations as authority
- **How:** client mutators run optimistically; push endpoint **re-executes** them on the canonical store;
  pull **rebases** (rewind to last confirmed state → apply server patch → replay pending mutations).
- **Documented weakness:** the docs state the server *"is not necessarily expected to compute the same
  result"* as the client → on rebase, **optimistic changes can be overwritten** (flicker / lost work);
  mutators must be re-execution-safe (run ≥3×); conflict logic is **hand-coded per mutator**; **no
  zero-server mode** — a backend of authority is mandatory (offline operation works, but a server remains the source of truth).
- **Our workaround:** determinism removes the divergence — our verbs compute the *same* effect on both
  sides, so there is **no "server disagrees → overwrite"** case and **no per-mutator conflict code**. And
  we *do* have a true offline-only mode (single-user, zero server) that Replicache structurally cannot.

### 2. ElectricSQL — retreated to read-path-only sync
- **How:** syncs data **out of** Postgres to clients via HTTP "Shapes" (read path). **Writes are NOT in the
  sync engine** — you send them through "your existing REST API."
- **Documented weakness:** this is an explicit *retreat* — the blog admits bidirectional sync's
  "conflict resolution / consistency / operational complexity" is "fundamentally difficult," so they
  **sidestepped writes entirely.** Result: **two disjoint paths** (sync for reads, your API for writes),
  no unified model — reads sync from Postgres via logical replication, while writes live outside the sync engine in your own API.
- **Our workaround:** the op-log is **symmetric** — the ops you *push* are the same ops that drive *reads*
  (one model, the log). We never need a separate write API, and there's no Postgres coupling (sql.js *is*
  the store).

### 3. PowerSync — server authority, writes through your backend
- **How:** Postgres→SQLite via logical replication; op-history kept in the **PowerSync Service** (not your
  DB); **writes routed through your own backend** so you apply business logic / authz / validation; causal
  consistency.
- **Trade-off (by design):** the backend is the write authority (default last-write-wins), so write-side
  business logic and conflict policy live **server-side** — the client writes optimistically to local SQLite
  but is not the authority. Symmetric, offline-authoritative write logic is out of scope.
- **Our workaround:** the "business logic on the write path" *is* our deterministic kernel — **authored
  once, run on both sides.** No double-implementation, no client/server rule drift (the thing PowerSync
  makes you maintain by hand).

### 4. LiveStore — nearest neighbour *on the data layer* (event-sourced, SQLite-materialised)
- **How:** events in an eventlog → **materialised into reactive client SQLite** via materialisers;
  git-inspired sync; pluggable sync backend (Cloudflare / Electric / S2).
- **Documented weakness:** **BETA (v0.4)**; requires a sync-provider backend (no hosted service);
  *"doesn't sync with existing databases," "doesn't scale for unbounded data," "no P2P,"* and explicitly
  **"not batteries-included — no built-in auth or file uploads."**
- **Our position (not a workaround — an honest delta):** LiveStore is our nearest neighbour **on the data
  layer** (event → reactive SQLite materialisation), the way SQLSync (§6) is our nearest neighbour **on the
  determinism lever** (one reducer both sides) — together they show we hold **no technique novelty** on either
  axis in isolation. Conceptually almost identical at the data layer. Differentiators are *application-level*:
  we span **BIM geometry +
  ERP** under one log, ship a real **domain reduction** (iDempiere AD → 5 tables + verbs), and are
  **batteries-included** (AD-derived rules/validation). LiveStore is infrastructure; we are an application
  on the same idea. Its "no auth / doesn't scale unbounded" gaps confirm these are **industry-wide**, not
  ours alone.

### 5. CRDTs (Automerge 3.0 / Yjs) — guaranteed convergence
- **How:** mathematical merge → all replicas converge with no central referee.
- **Documented weakness (from the CRDT literature):** *"CRDTs can only handle invariants that do **not**
  depend on the most up-to-date version"* → they **cannot enforce business invariants** (transactional
  edits, permissions); the field says use **OT or server-authoritative sequencing** for those. Also: **no
  built-in access control**, tombstone/GC overhead, and *"hard to use beyond what the library anticipated."*
- **Our workaround:** we already chose the right tool (§0.18c) — a **semantic op-CRDT (CmRDT) carrying ERP
  intent**, with a **designated-owner node at document-handoff seams** (§18.7). That *is* the
  "server-authoritative sequencing for invariants" the literature prescribes. We do **not** put money-
  touching invariants under generic LWW (which silently loses an allocation). So the #1 CRDT weakness is
  sidestepped by design, not patched.

### 6. SQLSync (Carl Sverre) — deterministic reducer + git-style rebase (our true nearest neighbour on the lever)
- **How:** mutations are ops; a **reducer compiled to WASM runs identically on client and server**; on
  reconnect the client **rewinds → applies the server-ordered log → replays pending local ops** (a git-style
  rebase). The server is the sequencer/authority that assigns the canonical op order.
- **Documented weakness:** the reducer is **Rust compiled to WASM** (custom build, opaque to inspection);
  a **server of authority is mandatory** (it owns the sequence — no zero-server total order); the SQLite is a
  replica driven by the reducer, so you don't query/extend it with arbitrary SQL the way a native store allows.
- **Our position (validation, not a workaround):** SQLSync's *"same reducer both sides → server result ==
  client result by construction"* **is our determinism lever, already shipped by someone else** — it is a
  closer neighbour than LiveStore (§4) for the *one-kernel-both-sides* claim, and it tempers any
  "first to our knowledge" framing of that lever specifically. Our deltas: kernel verbs are **plain JS over
  real sql.js** (full joins/FK, runs server-side as-is, no WASM toolchain) and we add **W-CHAIN/W-SIGN**
  (SQLSync has no tamper-evidence). **What we lack that SQLSync has:** the **multi-writer total order** — we
  order by local `id` rowid (two devices both emit id 1,2,3 with diverging chains and no merge path in
  `kernel_ops.js`). **Borrow:** adopt SQLSync's rebase loop *as* our §0.20 owner-seam protocol — the server
  assigns the sequence, the client rebases pending ops on top. We are already set up for it: `sealChain()` is a
  **full recompute**, so after a rebase re-orders ops under the server's sequence we simply re-seal and the
  hash chain stays valid. This gives multi-writer ordering **without** a row-level CRDT and **preserves
  invariant rejection** (the server reducer can refuse an op) — the thing cr-sqlite (§7) structurally cannot.

### 7. cr-sqlite / Vulcan (vlcn.io) — row-level CRDT, decentralized, no sequencer
- **How:** a C extension compiled to WASM turns ordinary tables into **CRRs** (conflict-free replicated
  relations) — per-row/per-column causal merge keyed on a `site_id` + a logical clock (`crsql_db_version`).
  Two offline writers merge automatically with **no central referee**.
- **Documented weakness:** it is **state/LWW-flavoured per column** — it carries **no intent**, so it inherits
  the core CRDT limit (§5): it **cannot enforce business invariants** (it will converge to a consistent but
  *wrong* number — e.g. silently allow a double-allocation of the same pallet); no built-in access control;
  tombstone/GC overhead.
- **Our workaround / fit:** for **money-touching ops, cr-sqlite is the wrong tool** — same reason we rejected
  generic LWW (§5, §0.18c): we keep `documents`/`journal` invariants at the deterministic kernel + owner seam,
  not under automatic row-merge. **But its primitive is the right one for the *other half* of our unified log:**
  **BIM geometry edits are commutative-ish and LWW-safe** (a moved grid line has no double-spend invariant), so
  a **two-tier merge** — cr-sqlite-style `site_id`+clock auto-merge for *geometry* ops, owner-seam serialization
  for *money* ops — fits our BIM+ERP-under-one-log unification cleanly. This is the concrete decentralized-multi-
  writer path we currently lack, applied **only where it's safe**. Never route `Fact_Acct` through it.

---

## Cross-cutting weaknesses (RxDB's "downsides" list) — ours vs theirs

| Industry weakness (RxDB) | Their exposure | Our angle |
|---|---|---|
| **Initial full-dataset download** | must replicate whole dataset to client | **Already solved** — split-DB streaming (positions/metadata/geometry tiers; `initbubble.json` 2KB) → lazy fetch, never download all |
| **Non-persistent storage** (Safari evicts after 7 days) | universal browser gap | Mitigate same way: `navigator.storage.persist()` + the signed op-log spilled to **any durable replica** — cloud *or* the user's own email/social (`DistributedERP.md §5.2b`). **The source of truth is the signed log itself, not a host** — determinism replays any replica to identical state, so the local copy is disposable (W-PERSIST). Shared gap, no magic |
| **Conflict resolution complexity** | hand-rolled per collection | Semantic op-CRDT + owner node (§18.7) — concentrated at few seams, not per-collection |
| **Eventual consistency unsafe for finance** | "risk in banking/financial apps" | money-touching invariants are **serialised at the one total-order / CAS seam** (`DistributedERP.md §5-6`) + enforced by the deterministic kernel on replay — **not** routed through a re-running server; single-user offline is safe (one writer). We do **not** pretend offline multi-writer finance is safe |
| **Schema migration to N offline clients** | "weeks-long unpredictable windows" | Partial lever: compiled-AD **manifest** (recompile UI structure) + **forward-only rules / frozen-effects** replay (§0.16). **Shared hard problem — honest about it** |
| **No SQL joins / relational limits** | document-CRDT systems can't join | **We are stronger here** — sql.js is real SQLite: full joins + FK (the AD/BOM spine). Native relational, not a document store |

---

## Summary — where we genuinely win, and where we just share the pain

**Real workarounds (our architecture removes their tax):**
1. **Deterministic semantic verbs → one kernel both sides** — kills Replicache's overwrite-on-rebase,
   PowerSync's double-implementation, and ElectricSQL's split read/write model in one stroke.
2. **Symmetric op-log** — reads and writes are the same ops; no separate write API.
3. **Semantic op-CRDT + owner node** — enforces business invariants CRDTs structurally cannot.
4. **Native SQL + relational** — joins/FK that document-CRDT systems lack.
5. **Split streaming** — instant first paint vs full-dataset download.

**Shared weaknesses — no magic, be honest (these become the §0.20 phase work):**
- Browser-storage eviction → `persist()` + cloud-of-truth (W-PERSIST).
- Cross-client schema migration → compiled-AD manifest + forward-only rules (partial).
- Tamper-evidence is *nobody's* default → our distinctive add: hash-chain/sign the log (W-CHAIN/W-SIGN).
- Secured multi-user **needs a trust anchor** — every system above has a server; ours is the async
  **server domain** (§0.20), reached only when single-user/offline no longer suffices.

**Concrete borrows for the §0.20 phase (from §6/§7, the two systems we hadn't logged):**
1. **Multi-writer ordering = SQLSync's rebase loop** (§6) — server assigns canonical sequence, client
   rewinds → applies server log → replays pending local ops. We currently order by local `id` only; this fills
   the deferred owner-seam total order **and keeps invariant rejection** (server reducer refuses bad ops).
   Cheap for us because `sealChain()` already full-recomputes — rebase, then re-seal.
2. **Two-tier merge = cr-sqlite primitive *only* for geometry** (§7) — `site_id`+logical-clock auto-merge for
   BIM/geometry ops (LWW-safe, no invariant); owner-seam serialization for money ops. Decentralized multi-writer
   exactly where it's safe, never on `journal`/`Fact_Acct`.
3. **Incremental storage = OPFS** (PowerSync/Notion, storage axis below) — replace `kernel_ops.js`'s
   whole-DB `db.export()`→IndexedDB blob (O(db size) per debounce, the I-D cost) with OPFS SAHPool incremental
   writes. Free perf win, independent of any sync work.

---

## The other axis — SQLite-WASM *at scale* (storage/engine, not sync) — added 2026-06-03

The systems above are **sync** frameworks. A separate question: who runs a **large relational app fully in
SQLite-WASM**, and what does it cost? The canonical production example is **Notion** — and its architecture is
*our doctrine, shipped at scale.*

- **Notion** (the existence proof): SQLite→WASM in a **Web Worker** (UI thread unburdened), a **SharedWorker**
  routing every tab's queries to one active tab's worker, on the **OPFS SAHPool VFS**. **Postgres stays the
  canonical source of truth** (logical replication + WAL → the browser SQLite is a disposable **projection**).
  ([Notion blog](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite),
  [HN](https://news.ycombinator.com/item?id=40949489)) — this validates [DistributedERP](DistributedERP.md)'s
  *"the operator's install is the system of record; the browser is a projection"* (`ENGINE_FULL_ERP_ISSUES.md` §I-A).
  Notion chose **server-of-record + local projection**, NOT local-first-authoritative.

The hard constraints (each maps to one of our engine issues):

| SQLite-WASM finding | Source | Maps to |
|---|---|---|
| **OPFS storage limit: "generous but differ per environment"** — no fixed cap stated on the current page (an earlier reading here said ~2 GB, up from 512 MB; re-checked 2026-10-06, that figure is no longer on the cited page). In practice the ceiling is per-tab memory — measured in [Browser-Scale Benchmark](BrowserScaleBenchmark.md) | [sqlite.org/wasm persistence](https://sqlite.org/wasm/doc/trunk/persistence.md) | I-A storage is bounded per browser → gravity-sharding ([DistributedERP §13](DistributedERP.md)) not optional at full-AD scale |
| **OPFS = one read/write txn at a time** | [PowerSync state-of-persistence](https://powersync.com/blog/sqlite-persistence-on-the-web) | **single-writer holds at the *storage* layer too** — reinforces G-SINGLE-WRITER / I-E from below |
| **Multi-MB JS strings = measurable WASM-bridge cost** | [sqlite.org/wasm](https://sqlite.org/wasm/doc/trunk/persistence.md) | **exactly I-D** (projection 52→336 KB re-export) — keep state *in* SQLite, don't marshal big strings out |
| **SAHPool VFS = 3–4× I/O; 8–16 MB page cache = big win** | [PowerSync](https://powersync.com/blog/sqlite-persistence-on-the-web) | free wins for the engine-perf lane (Agent E) *before* any algorithmic change |
| **Needs SharedArrayBuffer + COOP/COEP headers; Safari <17 out** | [sqlite.org/wasm persistence](https://sqlite.org/wasm/doc/trunk/persistence.md) | a deploy gate (OCI/GH-pages must send the headers) |

**Why SQLite, not DuckDB-WASM or PGlite.** [DuckDB-WASM](https://motherduck.com/blog/duckdb-wasm-in-browser/) is
OLAP (TB via Parquet range-requests) — wrong shape for transactional ERP. [PGlite](https://pglite.dev/) (full
Postgres-in-WASM) is tempting for *server-side* logic in-browser, but iDempiere's business logic is **Java, not
PL/pgSQL**, so it does not shortcut the callout port — and it is heavier than we need. SQLite-WASM (relational +
R-tree + small footprint) is the right tier; the prior art confirms it.

**Sources (storage axis):** [Notion WASM SQLite](https://www.notion.com/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite) ·
[SQLite WASM persistence](https://sqlite.org/wasm/doc/trunk/persistence.md) ·
[PowerSync — SQLite persistence on the web](https://powersync.com/blog/sqlite-persistence-on-the-web) ·
[DuckDB-WASM](https://motherduck.com/blog/duckdb-wasm-in-browser/) · [PGlite](https://pglite.dev/).

---

**Sources:** [RxDB — downsides of offline-first](https://rxdb.info/downsides-of-offline-first.html) ·
[Replicache — how it works](https://doc.replicache.dev/concepts/how-it-works) ·
[ElectricSQL — local-first with your existing API](https://electric.ax/blog/2024/11/21/local-first-with-your-existing-api) ·
[PowerSync vs ElectricSQL](https://powersync.com/blog/electricsql-vs-powersync) ·
[LiveStore](https://livestore.dev/) ·
[SQLSync](https://github.com/orbitinghail/sqlsync) ·
[cr-sqlite (vlcn.io)](https://github.com/vlcn-io/cr-sqlite) ·
[CRDT survey (Weidner)](https://mattweidner.com/2023/09/26/crdt-survey-4.html) · [Automerge](https://automerge.org/).
