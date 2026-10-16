# ⚠ DO NOT REMOVE — Scope & Protocol
**Scope:** SPEC ONLY. No code in this document, no code produced by writing it — every design section
below is marked PROPOSAL and stops at pseudocode/shape sketches. This is the remedy spec for a
CONFIRMED, witnessed silent-data-loss bug in the LIVE `crud_overlay.js` write path (not a hypothesis —
see §Problem). **Log Mandate:** any witness run against this spec writes a `.log` file and the log is
READ before any pass/fail conclusion — exit code alone is never evidence (CLAUDE.md, Universal Session
Protocol). Honour this block until every item in §Requirements is `✅ DONE (witness)` or
`⛔ BLOCKED: <one question>`.

---

## §Problem (WITNESSED)

**The bug, restated from the witnessed source, not re-derived:** `build/erp/crud_overlay.js`
`_sidePersist()` (lines 1081–1093) exports the ENTIRE in-memory `sql.js` sidecar database and does an
unconditional `put()` of that whole blob to ONE fixed IndexedDB record:

```
SIDE_DBNAME = 'glassbowl_kernel_ops', SIDE_STORE = 'log', SIDE_KEY = 'kernel_ops.db'   // crud_overlay.js:1068
var buf = SIDE.export().buffer;
db.transaction(SIDE_STORE, 'readwrite').objectStore(SIDE_STORE).put(buf, SIDE_KEY);   // crud_overlay.js:1088
```

`withSidecar()` (crud_overlay.js:1096–1119) hydrates `SIDE` from that ONE key **once per page-load**
and holds it in memory thereafter. Every `commitCrud`/`commitProcess` call re-exports and re-`put()`s
the WHOLE blob (crud_overlay.js:1601 `_sidePersist()` inside `commitCrudSealed`; :1186 inside
`commitProcess`). No version/generation is ever checked before the `put()`.

**Witnessed live, real two-tab browser run, 2026-07-19** (`prompts/ERP_MULTIUSER_CONCURRENCY_POC.md`
§Results; full log `build/erp/witness_e2e_crud_blob_race.log`, 1174 lines, read before this summary
per Log Mandate). Two Playwright tabs of ONE `BrowserContext`, real UI clicks (`page.fill`/`page.click`
on the real Save button), real `erp/idempiere.html` → real `crud_overlay.js`, `c_order` id=101:

- **S2 (baseline, clean):** both tabs hydrate the identical starting sidecar —
  `§E2E-HYDRATE tab=A tip=GENESIS ops=0` / `§E2E-HYDRATE tab=B tip=GENESIS ops=0` (log:348-349).
- **S3 (disjoint-field race — worse than predicted):** tab A edits `description`, tab B (hydrated
  before A's save) edits `grandtotal` — a DIFFERENT column, no logical conflict. Both individually
  report success:
  ```
  §CRUD-PERSIST key=c_order id=101 op=CRUD_UPDATE cols=description ... sealed=1 verifyChain=ok   (log:710, tab A)
  §CRUD-PERSIST key=c_order id=101 op=CRUD_UPDATE cols=grandtotal  ... sealed=1 verifyChain=ok   (log:739, tab B)
  §E2E-VERIFY-FINAL fields_present=grandtotal expected=description,grandtotal values={"grandtotal":4242.42}
  🔴 S3 ISSUE CONFIRMED: the predicted blob-clobber occurred — description LOST (final ops=1)   (log:759-761)
  ```
  A's whole committed, `verifyChain=ok` op is GONE from a fresh third tab's read — not a
  column-level conflict resolution, a total op loss.
- **S4 (same-field conflict — exactly as predicted):** both tabs edit `grandtotal`, tab A first
  (`1111.11`), tab B second (`2222.22`, composed against B's own pre-A in-memory state):
  ```
  §E2E-SAVE tab=A grandtotal=1111.11 committed=true gateVerdict=PASS      (log:1137)
  §E2E-SAVE tab=B grandtotal=2222.22 committed=true gateVerdict=PASS      (log:1167)
  §E2E-VERIFY-FINAL grandtotal=2222.22 ops=1 tip=2306ba51...              (log:1169)
  🟢 S4 final persisted grandtotal = B's value — last-tab-to-save silently wins   (log:1170)
  ```
  The owner/CAS gate (`§CRUD-GATE ... verdict=PASS`, log:1114,1144) ran for both writes and PASSED
  both — no rejection anywhere. `ops=1`, not 2: A's row was never present in B's exported blob, same
  underlying mechanism as S3.
- **S6 regression (unaffected, confirms this PoC touched no product code):**
  `node scripts/poc_crud_ownergate.js` exit 0, G1–G5 unchanged.

**Net:** two real browsers, real UI, real signed/chain-verified commits — the UI told both users their
save succeeded, and one was silently wrong, with no error surfaced to either.

---

## §Root Cause

**Storage granularity vs concurrency control — two different layers, and only one of them exists
today.** A traditional RDBMS's unit of write is a row inside a shared file, coordinated by a lock
manager + WAL; concurrency control (OCC via a version column, or pessimistic `SELECT...FOR UPDATE`)
sits ABOVE that row-level substrate. Here, the unit of write is **the entire file**. `_sidePersist()`
is a read-modify-write of the WHOLE database — the textbook lost-update anomaly, at the worst possible
granularity.

**Why every existing engine-level witness passed and still missed this
(`prompts/ERP_MULTIUSER_CONCURRENCY_POC.md` §Current State table — `poc_distributed.js`,
`poc_crud_ownergate.js`, `test_kernel_sync.js`, etc.):** every one of them is a single Node.js process
holding two in-memory data structures and calling functions on them in sequence. None of them ever
persist through IndexedDB, and none of them ever run two independent JS execution contexts against a
shared browser storage origin. The bug lives entirely in the seam between "commit passed
`verifyChain`" (proven, engine-level, real) and "commit reached durable storage intact" (never
exercised until `witness_e2e_crud_blob_race.js`). This is the same "engine-proven ≠ UI-proven" lesson
already logged twice in this project (`feedback_test_real_user_path_not_seams.md`) — a third instance,
now at the storage layer instead of a DOM seam.

**Why row-level CAS could not have fixed it, even in principle.** `CORE.gateOp` (crud_overlay.js:425–
437) IS a correct owner+CAS check — the whole S6 regression suite proves it works as designed. But
`gateOp` runs against each tab's OWN in-memory view (via `_gateCtxFor`, crud_overlay.js:1531–1544,
which reads `rec`/`CORE.tipValues(db,...)` off that tab's own `SIDE`) and is checked **before** the
seal, entirely inside one JS execution context. It has no visibility into the OTHER tab's write at
all — there is no shared "current record version" for it to compare against, because there is no
record-level storage: the physical unit `_sidePersist()` writes is the whole file, one level below
where any row/column CAS could possibly intervene. Perfect OCC on `grandtotal` still loses S3 — the
loss is BELOW the row layer, in the export/`put()` call that has no idea rows exist.

**The compounding factor: `claimed_by` cannot serve as that missing version, even conceptually.**
`crud_ops.json`'s `c_order` entry declares `"ownerGated": true, "cas": "claimed_by"`
(build/erp/crud_ops.json, the `c_order` block — the `"cas"` key at that line points at `claimed_by`).
But the op-class semantics of `claimed_by` are defined in `bim-ootb erp/erp_replay.js:61–64`:

```js
} else if (op.op_type === 'CLAIM') {
  var cur = <SELECT claimed_by FROM documents WHERE uuid=?>;
  if (cur) { rejected.push({ why: 'already claimed by ' + cur }); return; }   // first claimant wins
  db.run('UPDATE documents SET claimed_by=? WHERE uuid=?', [op.actor, op.target]);
}
```

`claimed_by` is set ONCE, at claim time, and does not change on a field edit. It is
G-SINGLE-WRITER/G-RESERVATION (`docs/DistributedERP.md` §4) — an exclusive lease per **user**
(`sessionActor()`, crud_overlay.js:1273–1279, reads `window.APP.actor` = the `AD_User` id set once
per page-load). Two tabs of ONE login share the same `APP.actor` by construction, so
`ctx.actor === ctx.owner` trivially, and the "CAS" comparison in `gateOp` (line 432–435) reads
`ctx.casCurrent` against `ctx.casExpected` — both derived from the SAME unchanged `claimed_by` value —
so it also trivially passes. `crud_ops.json`'s `"cas"` key is a **mislabel**: there is no column
anywhere in the write path that changes on every write, which is the one property CAS requires. This
is why S4 shows `gateVerdict=PASS` for both tabs (log:1114,1144) exactly as the PoC's extraction
predicted, not as a surprise.

## ⚠ §FILE PROVENANCE — TWO DIVERGENT COPIES OF `crud_overlay.js` (found 2026-07-19, READ FIRST)

**There are two copies of `crud_overlay.js` in this tree and they are NOT the same file.** Every
line-number citation in this spec and in `ERP_MULTIUSER_CONCURRENCY_POC.md` must state WHICH.

**THREE divergent copies, not two** (corrected again 2026-07-20 — the "stale local copy" framing below
was itself incomplete). All three carry the IDENTICAL defective `_sidePersist` whole-blob `put()`:

| Copy | Lines | `_sidePersist` | `_serializeCommit` | Role — ALL THREE ARE REACHABLE |
|---|---|---|---|---|
| **`/home/red1/bim-ootb/erp/crud_overlay.js`** | **2493** | **1632** | **1725 (EXISTS)** | **LIVE deploy source** (`feedback_deploy_from_bimootb.md`). Loaded by BOTH `erp/idempiere.html:603` AND `erp/glassbowl.html:880` (`?v=6`). **The only copy the S3/S4/S5 witnesses ran against.** |
| `/home/red1/bim-compiler/build/erp/crud_overlay.js` | 1841 | 1081 | absent | **NOT dead — it is what every bim-compiler Node witness `require()`s**, incl. `poc_crud_ownergate.js:36` (the S6 regression floor), `poc_crud_group.js`, `poc_so_complete_ui.js`, `poc_docaction_full.js`, `test_crud_overlay.js`, `test_crud_writeloop_overlay.js`. Loaded by `build/erp/glassbowl.html:858`, precached `build/erp/sw.js:14`. Froze 2026-07-03. |
| `/home/red1/bim-compiler/docs/crud_overlay.js` | **627** | **446** | absent | **PUBLISHED LIVE ON `gh-pages`** (confirmed: `git ls-tree origin/gh-pages` lists `crud_overlay.js` + `glassbowl.html`; `mkdocs.yml docs_dir: docs`). Frozen **2026-06-02** (`96d3b7f08`). Its own header: *"attaches to glassbowl's **bubbles** BY KEY … E2 is DRY-RUN"* — the original **bubble-era** fossil. Loaded by `docs/glassbowl.html:856`, precached `docs/sw.js:14`. |

**Two consequences that change the test architecture, not just the citations:**
1. **S6's regression floor tests the wrong file.** `poc_crud_ownergate.js` requires the 1841-line
   bim-compiler copy; S3/S4/S5 exercised the 2493-line bim-ootb copy. "Engine green + UI red" was
   partly an artifact of the two halves testing *different files*. Any fix must state which copy each
   witness binds to.
2. **The defect is live on `gh-pages` in a 2026-06-02 fossil** that no witness in this lane has ever
   touched — same `SIDE_DBNAME`/`SIDE_STORE`/`SIDE_KEY`, same unconditional
   `.put(buf, SIDE_KEY)` (docs:433/446/453). Fixing only bim-ootb leaves the published Glassbowl
   surface defective.

**Correction to a correction (this section supersedes the earlier draft's claim).** An earlier pass of
this spec asserted that `_serializeCommit` "does not exist" and was a phantom citation. **That was
wrong, and wrong in the dangerous direction — it turned a true fact into a false one.** It exists at
`bim-ootb/erp/crud_overlay.js:1725`, with the comment *"run a signed commit EXCLUSIVELY."* The grep
that "disproved" it searched the stale `bim-compiler` copy. Root cause: the original PoC briefing
labelled its citations `build/erp/crud_overlay.js:1632` while the line numbers were in fact
**bim-ootb's** file — a mislabel, not a hallucination.

**What this does and does not change:**
- **Findings, witnesses, and evidence: UNAFFECTED.** The defective mechanism is byte-identical in both
  copies — `SIDE_DBNAME='glassbowl_kernel_ops', SIDE_STORE='log', SIDE_KEY='kernel_ops.db'` and the
  unconditional `.objectStore(SIDE_STORE).put(buf, SIDE_KEY)` (bim-ootb:1619/1639,
  bim-compiler:1068/1088). The witnesses ran against the LIVE copy. S3/S4/S5 stand exactly as reported.
- **`_serializeCommit` existing makes the finding STRONGER, not weaker.** The live code has an explicit
  "run a signed commit EXCLUSIVELY" mutex, and the data loss **reproduced anyway** — because that mutex
  is a per-JS-context `Promise` chain and cannot span tabs. Someone already saw the serialization
  hazard, guarded it at the layer they could see, and the guard has no jurisdiction across tabs.
  That is the whole finding in miniature.
- **This spec must be implemented against the bim-ootb copy**, and F3's commit lock must be built
  around / replace `_serializeCommit:1725` — not added as if no mutex existed.
- ✅ ANSWERED 2026-07-20 (was: is the `build/erp` copy dead?) — **No. It is the file every
  bim-compiler Node witness requires, including the S6 regression floor.** Deleting it breaks the
  test suite. See the 3-copy table above. The drift is not neglect: development MIGRATED to bim-ootb
  (`build/erp` froze 2026-07-03, `docs/` froze 2026-06-02) while the witnesses stayed pointed at the
  copy left behind.
- ⛔ BLOCKED: **does the fix land in all three copies, or does the duplication get collapsed first?**
  Three divergent copies of a file with a confirmed silent-data-loss bug is the real finding here.
  Patching three files keeps the drift alive; collapsing to one shared source is the correct
  engineering answer but is a refactor with its own blast radius across two repos, `gh-pages`, two
  `sw.js` precache lists, and six witness scripts. Needs a user call — this is scope, not technique.
- ⛔ BLOCKED: **the `gh-pages` copy is a 2026-06-02 bubble-era fossil that is PUBLISHED and
  defective.** Is the published Glassbowl surface still intended to be live/reachable by users at
  all? If yes it needs the fix (and its own witness — none exists). If it is a demo relic, it should
  be unpublished rather than fixed. Do not guess: `gh-pages` publishing is guard-railed
  (`DOCS_DEPLOY_POLICY.md`, `safe_gh_deploy.sh`) and removing a live page trips the no-shrink seatbelt
  deliberately.

---

## §Design (PROPOSAL)

⚠ Everything below is PROPOSED — none of it exists in the tree today. Pseudocode only, no
implementation.

### The move: append-only per-op records, `add()` not `put()`

Today the sidecar's `kernel_ops` table (schema: `build/erp/kernel_ops.js:10–22`, columns include
`id`, `op_uuid`, `timestamp`, `op_type`, `parameters`, `prev_hash`, `op_hash`, `sig`, `gid`,
`branch_id`) lives entirely INSIDE one `sql.js` in-memory `Database`, and the ONLY thing IndexedDB
ever sees is that whole database's exported byte buffer. The proposal moves the persistence unit down
one level, from "the file" to "the row":

- Add a NEW IndexedDB object store, e.g. `ops` (`autoIncrement: true` keyPath), in the same
  `glassbowl_kernel_ops` database.
- On every successful `commitGroup` (crud_overlay.js:1598/1183, unchanged call site), instead of (or
  in addition to, during migration — §Migration) exporting the whole `SIDE` and `put()`-ing it,
  `add()` each newly-inserted `kernel_ops` row (the ones `commitGroup` just wrote, already carrying
  their staged `prev_hash`/`op_hash`/`sig`, per `kernel_ops.js:268` "STAGE off the last sealed tip")
  as ONE new record in the `ops` store.
- `add()` (never `put()`) onto an `autoIncrement` store: IndexedDB's own write-transaction queuing
  against a given object store is what gives two tabs' concurrent `add()` calls DIFFERENT,
  non-colliding, monotonically-increasing keys — this is a platform guarantee, not new code. Tab A's
  op and tab B's op become two distinct records; neither can physically overwrite the other. This is
  what makes S3 (disjoint-field loss) **structurally impossible** rather than merely defended against.

### Hydration = read-all + replay (already-existing kernel machinery, not new)

`withSidecar()` (crud_overlay.js:1096) currently builds `SIDE` from one blob
(`new SQL.Database(new Uint8Array(buf))`). The proposed hydration instead:
1. Opens the `ops` store, reads every record in key order (cheap — IDB cursor scan).
2. Builds an empty `SIDE` (`K.ensureTable(SIDE)`, unchanged), then `INSERT`s each record's row back
   into `kernel_ops` in the SAME order it was originally sealed (the records already carry their
   sealed `prev_hash`/`op_hash`/`sig` — replay does not re-seal them, it restores them verbatim).
3. `K.verifyChain(SIDE)` (unchanged, `kernel_ops.js:376`) walks the restored rows and confirms the
   chain — this function is REUSED exactly as it exists today; nothing about chain verification
   changes, only where the rows came from.

### Why the store change alone is necessary but not sufficient — and what closes the gap

Per-record storage fixes S3 (both tabs' rows physically persist). It does **not**, by itself, fix
the LOGICAL problem S4 exposes: `commitGroup` seals a new op's `prev_hash` against
`_lastSealedTip(db)` (`kernel_ops.js:189–193`), read from tab B's OWN in-memory `SIDE` — which, if B
hydrated before A committed, is STALE. Two tabs could each physically `add()` a row that successfully
persists, yet both claim the SAME `prev_hash` — a forked chain, not a merge, and `verifyChain`
(`kernel_ops.js:376–...`, checks `storedPrev !== prev` per row) would now find a genuine break instead
of silently losing data. That is progress (loud failure beats silent loss) but not yet correct
behaviour. Closing this requires §Cross-tab coordination below — the lock's job is specifically to
make the "read current tip → seal → append" sequence behave, for one `BrowserContext`, as if it were
single-threaded, which is exactly the invariant a linear hash chain needs. **This spec deliberately
does NOT invent a merge/fork-resolution algorithm** — that is the cross-device (relay) problem
`docs/DistributedERP.md` §0's "union signed logs → total-order → replay" already names as solved
differently and out of scope here (see §Cross-tab coordination boundary).

**Reuse, not invention, for the reseal step itself:** `kernel_ops.js` already has an incremental
seal-from-tip primitive, `sealFrom(db, fromTip)` (`kernel_ops.js:183–211`) — "seal ONLY the rows from
the last sealed tip forward, never the whole log," used today by `commitGroup`. The proposed fix does
**not** add new sealing logic; it ensures the `db` handed to that EXISTING machinery reflects the
truly-current persisted tip (via a fresh IDB read under the lock, see below) instead of a possibly
-stale in-memory carryover. The bug is entirely in *what tip `sealFrom`/`commitGroup` is shown*, never
in the sealing math itself, which the S6 regression already proves correct.

### Compaction, not deletion

`SIDE.export()` (the current whole-blob mechanism) is **demoted, not removed**: periodically (e.g.
every N ops, or on tab idle), under the same lock, a tab may fold all `ops` records into a fresh
`sql.js` Database, record a `{generation, foldedThroughSeq, tipHash}` marker, and persist ONE snapshot
record keyed by generation — purely as a hydration-speed cache (avoid replaying thousands of tiny
records from a cold start every page load). Per `DistributedERP.md` §0's root truth ("a fact is a fold
over a signed sequence, never a stored guarded scalar"), the snapshot is itself just a memoized fold —
safe to discard and rebuild, **never authoritative**, and **never a replacement for the raw `ops`
records**, several of which are read directly today by audit-trail features that need the FULL history
(`changeLog`, crud_overlay.js:~1287; `fieldLineage`; `history()`, crud_overlay.js:1751–1758) — deleting
compacted-away raw rows would silently break those. This spec does not propose a raw-row deletion/
archival policy (see §Risks).

### How this satisfies `DistributedERP.md` §0

§0's root truth: *"A fact is a fold over a signed sequence — never a stored, guarded scalar."* Today's
`_sidePersist()` violates this at the storage layer even though the FACTS it stores (op-log rows) are
correctly modeled as a signed sequence everywhere else in this codebase — the contradiction the PoC
doc already named ("the storage layer is currently contradicting the project's own doctrine",
`ERP_MULTIUSER_CONCURRENCY_POC.md` §Remedy Direction point 1). The append-only `ops` store makes the
STORAGE layer match the FACT model that was already correct one level up: state is the fold/replay of
an append-only sequence of individually-durable records, exactly as §0's mapping table already
requires ("Merge concurrent edits → union signed logs → total-order → replay", `DistributedERP.md`
line 105).

---

## §Cross-tab coordination (PROPOSAL)

**The mutex:** `navigator.locks.request('erp-sidecar-commit', async () => { ... })` (Web Locks API, no
new dependency) wraps the critical section inside `commitCrud`/`commitProcess`:
1. Refresh `SIDE`'s view of `kernel_ops` from the `ops` store's latest records (read-all-since-last-
   known-id, or full re-hydrate — either is correct, the former is cheaper).
2. Run `_gateForOwnedWrite` (crud_overlay.js:1554) against this freshly-refreshed tip — this is what
   makes F5 (§Requirements) possible: a real version-CAS check (§Lease vs Version) now compares against
   the ACTUAL current value, not a value frozen at page-load.
3. `commitGroup` (unchanged) seals against the now-current tip.
4. `add()` the new row(s) to the `ops` store.
5. Release the lock.

Two tabs racing `commitCrud` now queue on step 1–4 instead of racing `_sidePersist()`'s `put()` — the
lock turns the whole critical section atomic FOR THIS BrowserContext, which is exactly the invariant
a single linear hash chain requires, without inventing a merge algorithm.

**Sibling-tab freshness — `BroadcastChannel`:** after step 4/5, `postMessage({type:'tip-advanced', ...})`
on a `BroadcastChannel('erp-sidecar')`; other tabs of the SAME `BrowserContext` listen and refresh their
own read-only views (e.g. a reopened form should show the tip value, not a stale one) — a UX/freshness
layer, not the correctness fix (correctness comes from step 1's refresh-under-lock at COMMIT time,
which happens regardless of whether a sibling tab is listening).

**Proven boundary, not re-derived:** `teams/tests/witness_e2e_dual_presence_modeller.js`
(`§BC-CONTROL`, cited in `ERP_MULTIUSER_CONCURRENCY_POC.md` §Current State) already proved
`BroadcastChannel` does **not** cross two separate `BrowserContext`s, even same-origin — a raw
platform fact. So this whole §Cross-tab coordination section covers **same-BrowserContext, multi-tab
only** (the PoC's Case 1/2, S3/S4). The cross-device case (Case 3/S5 — two real users/devices, separate
storage origins entirely) needs the relay (`erp_sync.js`/`erp_relay_server.js`) wired into this store,
which is explicitly OUT OF SCOPE here (same open question the PoC doc already left ⛔, restated not
re-litigated in §Open Questions below).

---

## §Lease vs Version (PROPOSAL)

**Keep `claimed_by` exactly as it is** — it correctly implements G-SINGLE-WRITER/G-RESERVATION
(`DistributedERP.md` §4) as a per-user exclusive lease, and `erp_replay.js:61–64`'s CLAIM semantics are
NOT touched by this spec. If a claim can go stale (a user closes their laptop mid-edit), add
G-LEASE-EXPIRY (already named in the guard table, `DistributedERP.md` line 179) as a SEPARATE,
later-scoped concern — not attempted here.

**Add a real version column**, e.g. a per-record `_opSeq` (the highest `ops`-store key that has
touched this `(table,id)`) or a content op-hash of the record's latest tip — something that changes on
**every** write, which is the one property CAS requires and `claimed_by` structurally cannot provide
(§Root Cause). This becomes `ctx.casCurrent`/`ctx.casExpected` in `_gateCtxFor`
(crud_overlay.js:1531–1544) for the version check, running ALONGSIDE the existing owner check — `gateOp`
(crud_overlay.js:425–437) already has a `reason: 'cas'` REJECT path; this proposal feeds it a value
that can actually differ between two writes, instead of the always-equal `claimed_by`.

**Rename the mislabelled key.** `crud_ops.json`'s `c_order` entry currently declares
`"ownerGated": true, "cas": "claimed_by"` — the single `"cas"` key is doing double duty for BOTH the
lease column AND (nominally, ineffectively) the version check. Split it: keep `"ownerGated"`/lease
resolution pointed at `claimed_by` (owner check, unchanged), add a separate key (e.g.
`"casVersion": "_opSeq"`) for the new version column, so the JSON no longer reads as if `claimed_by`
covers Case 2 (same-actor conflicting write) when it structurally cannot.

**The oracle precedent, named not invented:** iDempiere's own `PO.save()` uses an `Updated` timestamp
column for optimistic locking — the SAME shape being proposed here (a value that changes on every
write, checked before the write lands), on the SAME oracle this project already declares authoritative
(`crud_overlay.js:396–399` already stamps `Updated`/`UpdatedBy` "iDempiere PO.save() parity" on every
`CRUD_UPDATE` — the column exists in the schema today, just isn't yet wired as the CAS comparison
value). This is not a new idea for this codebase; it is the same convention already partially applied,
finished.

---

## §Migration

**Mandatory, per the task's constraint — real users have existing `kernel_ops.db` whole-blob sidecars
in IndexedDB today**, and this changes the format they're stored in.

**Read path (on `withSidecar` open, EVERY time — idempotent, best-effort, never blocks):**
1. Check the `ops` store for a migration marker record (e.g. key `'migrated-from-blob'`).
2. If absent AND the OLD `log` store's `kernel_ops.db` key (crud_overlay.js:1068) still holds data:
   read the old blob, `new SQL.Database(new Uint8Array(oldBuf))`, `SELECT * FROM kernel_ops ORDER BY
   id` (the table schema is unchanged — same `K.ensureTable`), and `add()` each row into the new `ops`
   store, in order, inside one IDB transaction (or a small idempotent batch). Write the migration
   marker LAST, only on success.
3. If the marker is already present, skip straight to the new read-all-and-replay hydration
   (§Design). This is the SAME shape as `bim-ootb modeller/str_walker_outliner.js:497–514
   _applyPendingPatch(buf, dbFile)` / `bim-ootb viewer/scene.js:759 A._applyPendingPatch` — applied on
   every open, cheap to no-op via the marker check, a failed migration falls back to the OLD read path
   (never blocks opening, never silently drops data) rather than a one-shot irreversible upgrade.

**The old blob is NEVER deleted by this migration** — only read. It stays as a safety net until a
separate, explicitly-decided cleanup policy exists (§Open Questions — deleting a user's only durable
copy of their op-log is a destructive operation this spec does not authorize unilaterally, per this
project's destructive-ops discipline).

**Downgrade / old-tab-still-open case, named honestly, not solved:** if a tab running OLD code (this
session's pre-fix `crud_overlay.js`) is still open when a NEW-code tab has already migrated and moved
to appending into the `ops` store, the OLD tab's `_sidePersist()` will keep `put()`-ing a stale
whole-blob export into the OLD `log`/`kernel_ops.db` key. This does NOT corrupt the NEW `ops` store
(different object store — the old tab literally cannot reach it), so the S3/S4 total-op-loss failure
class does not reproduce. But the OLD tab's OWN edits, made after migration, would never reach the new
store and would be invisible to any NEW-code tab or future hydration — a narrower version of the same
class of problem, scoped to the deploy-transition window only. The clean mitigation is the existing
SW-update-toast convention (`feedback_sw_update_toast.md`) prompting the old tab to reload before its
next save — but that convention today gates on CACHE version, not SIDECAR SCHEMA version, and wiring
schema-version-awareness into it is a real but separate piece of work, named as an open question below
rather than hand-waved as solved by this spec.

---

## §Requirements

Numbered, single, falsifiable statements.

- **F1.** Each committed op is persisted as an individually-addressed IndexedDB record (`add()`), never
  folded into a single whole-DB blob overwritten by `put()`. Two tabs' concurrent commits cannot
  physically destroy each other's already-persisted record.
- **F2.** `withSidecar()` hydration reconstructs `SIDE` by reading ALL persisted `ops` records (in
  their assigned order) and replaying them into a fresh `kernel_ops` table, not by reading one fixed
  blob key.
- **F3.** A cross-tab mutex (`navigator.locks.request()`) serializes the "refresh tip → gate → seal →
  append" critical section inside `commitCrud`/`commitProcess`, so two tabs of one `BrowserContext`
  never both seal an op against the same stale tip.
- **F4.** Inside the lock, a tab refreshes its view of the current persisted tip from IndexedDB before
  composing/gating its next op — it never trusts a possibly-stale in-memory `SIDE` carried from an
  earlier point in the page's lifetime.
- **F5.** A same-field, cross-tab conflicting write (the S4 shape) is now DETECTABLE: a real
  version/op-hash value (not `claimed_by`) changes on every write, so the CAS check inside
  `_gateForOwnedWrite`/`gateOp` compares the writer's read-time baseline against the CURRENT persisted
  value and can REJECT a stale write, instead of silently overwriting it.
- **F6.** `claimed_by` remains the per-user G-SINGLE-WRITER lease exactly as `erp_replay.js:61–64`
  defines it today — F5's version check is a SEPARATE field, never a repurposing of `claimed_by`.
- **F7.** `crud_ops.json`'s `c_order` entry no longer has a single `"cas"` key that points at
  `claimed_by` as if it were a version column; the version-CAS key is named and pointed separately.
- **F8.** Sibling tabs of the SAME `BrowserContext` are notified via `BroadcastChannel` when the tip
  advances, so an idle tab's next read reflects the latest committed state without a manual reload;
  this notification does NOT and cannot cross a separate `BrowserContext` (per `§BC-CONTROL`).
- **F9.** The whole-DB export (`SIDE.export()`) is retained only as a periodic compaction snapshot
  carrying a generation number, used solely to bound hydration cost — it is never the write path, and
  compaction never deletes the raw `ops` records the audit-trail features (`changeLog`, `fieldLineage`,
  `history()`) read directly.
- **F10.** An existing whole-blob `kernel_ops.db` sidecar (a pre-migration user) is read once, its rows
  replayed into the new `ops` store under an idempotent migration marker, and the OLD blob key is left
  untouched (never deleted) as a safety net.
- **F11.** `scripts/poc_crud_ownergate.js` G1–G5 continue to pass unmodified, AND the now-confirmed S3/S4
  loss scenarios in `scripts/witness_e2e_crud_blob_race.js` no longer lose data: S3's final read shows
  BOTH `description` and `grandtotal`; S4's final state is either an explicit reject on the second write
  or an ordered/merged outcome — never silent last-write-wins with `ops=1`.

---

## §Witnesses

Each witness script: `⚠ DO NOT REMOVE` header naming the issue it proves/disproves (per CLAUDE.md
"Tests expose issues"), run via `bash build/erp/run_witness.sh scripts/<name>.js`, full output →
`build/erp/<name>.log`, log read before any pass/fail claim, `🟢`/`🔴` `verdict()` per assertion,
`process.exit(fails ? 1 : 0)` — same convention `poc_crud_ownergate.js` and
`witness_e2e_crud_blob_race.js` already use.

| Req | Witness | `§` tags + expected values |
|---|---|---|
| F1 | `W-OPLOG-APPEND` | `§OPLOG-APPEND tab=<A\|B> key=<autoKey> op_uuid=<uuid>` from two concurrent tabs — assert the two `key` values DIFFER and both later appear in a `§OPLOG-READALL count=2` from a third tab |
| F2 | `W-OPLOG-HYDRATE` | `§OPLOG-HYDRATE ops=<n> tip=<hash> source=readAll` — assert `n` equals the total `§OPLOG-APPEND` lines observed across all tabs in the run |
| F3+F4 | `W-COMMIT-LOCK` | `§COMMIT-LOCK tab=<X> tipBefore=<hash> tipAfter=<hash>` for both tabs — assert tab B's `tipBefore` (read inside the lock, AFTER acquiring it) equals tab A's `tipAfter`, proving no stale-tip read slipped through |
| F5 | `W-CAS-VERSION-REJECT` | re-run the S4 shape: `§CRUD-GATE key=c_order ownerGated=Y verdict=REJECT reason=version actor=<id> owner=<id> casVersion=<expected>≠<current>` for tab B's second write — issue proved/disproved: does the same-actor same-field conflict now get caught, replacing S4's `verdict=PASS` regression |
| F6 | `W-LEASE-UNCHANGED` | static: `git diff` (or equivalent) shows zero byte change to `erp_replay.js`'s `CLAIM` branch (lines 61–64) — regression guard that this spec did not touch lease semantics |
| F7 | `W-CAS-LABEL-RENAME` | static grep: `crud_ops.json`'s `c_order` entry has NO `"cas": "claimed_by"` pair; a `"casVersion"` (or equivalent) key names a column ≠ `claimed_by` |
| F8 | `W-BROADCAST-REFRESH` | `§BC-TIP-REFRESH tab=B receivedFrom=A tip=<hash>` in a same-`BrowserContext` sibling tab after another tab's commit; a companion `§BC-CONTROL`-style assertion (or direct citation of the already-proven finding) that a SEPARATE `BrowserContext` receives nothing |
| F9 | `W-COMPACTION-SNAPSHOT` | `§OPLOG-COMPACT generation=<n> foldedThrough=<seq> rawOpsRetained=<count>` before/after a compaction pass — assert `rawOpsRetained` does not shrink, and `changeLog`/`fieldLineage`/`history()` output is byte-identical before and after compaction for a fixture record |
| F10 | `W-MIGRATION-SELFHEAL` | a pre-seeded fixture: a REAL exported blob from today's `_sidePersist()` format, opened by the NEW code — `§OPLOG-MIGRATE from=blob to=ops migrated=<n> marker=set` then `§OPLOG-BLOB-PRESERVED unchanged=true` — assert `migrated` equals the fixture's row count and the old key reads back byte-identical |
| F11 | `W-REGRESSION-FLOOR` | re-run `scripts/witness_e2e_crud_blob_race.js`: `§E2E-VERIFY-FINAL fields_present=description,grandtotal` (S3, both present) and S4's final state shows a reject or ordered outcome, never `ops=1` last-write-wins; AND `node scripts/poc_crud_ownergate.js` exit 0, G1–G5 lines unchanged |

---

## §Risks

- **This changes the persistence FORMAT of the live, deployed ERP write path** — `crud_overlay.js` is
  loaded by both `erp/glassbowl.html` and `erp/idempiere.html` in production (`bim-ootb`), not a dev-
  only surface. A migration bug could corrupt or hide a REAL user's existing `kernel_ops` history — the
  single highest-severity risk this spec carries, which is why F10/W-MIGRATION-SELFHEAL is mandatory,
  not optional, and why the old blob is never deleted (§Migration).
- **Write amplification, not yet measured.** Per-op IndexedDB `add()` calls replace one whole-blob
  `put()` per commit — for a session with many small edits, this is many more, smaller IDB
  transactions. Whether this is faster or slower than today's whole-export approach in practice is
  unmeasured; needs its own timing witness before implementation, not assumed here.
- **`navigator.locks.request()` browser-support / worker-interaction is asserted, not verified in this
  spec pass.** Needs its own compatibility witness (the target browsers this project already supports)
  before implementation begins.
- **This touches the SIGNED kernel core (`kernel_ops.js`, W-CHAIN), not just the UI overlay.** Even
  though the proposal reuses `sealFrom`/`commitGroup`/`verifyChain` unchanged (§Design), the CALLER's
  contract with them (what `db` state is guaranteed to represent when they're invoked) changes — this
  is Sacred-Files-adjacent and should get its own focused witness pass on `kernel_ops.js` behaviour,
  separate from the UI-layer witnesses above.
- **Compaction/growth has no archival policy** — raw `ops` records are never deleted by this spec
  (§Design, F9), so long-lived, high-edit-volume records grow the `ops` store without bound. This is
  named, not solved (§Open Questions).

---

## §Open Questions

- ⛔ BLOCKED: When F5's version-CAS rejects a same-actor, same-field, cross-tab conflict (the S4
  shape), should the UI surface it as a REJECT-and-retype (mirroring the existing non-owner reject
  toast, `_gateReject`, crud_overlay.js:1547–1551) or attempt an automatic field-level merge/rebase?
  This is the SAME question the PoC doc already left open 2026-07-19
  (`ERP_MULTIUSER_CONCURRENCY_POC.md` §Open Questions) — still open here, needs a user decision before
  F5 is implemented one way or the other.
- ⛔ BLOCKED: Should the OLD whole-blob `kernel_ops.db` IndexedDB key ever be deleted post-migration
  (storage cleanup), or retained indefinitely as a safety net? No retention/cleanup policy exists in
  this project's doctrine for a superseded sidecar format, and deleting a user's only other copy of
  their op-log is destructive — needs a decision before any deletion code is written.
- ⛔ BLOCKED: Is wiring schema-version-awareness into the existing SW-update-toast convention
  (`feedback_sw_update_toast.md`) — so an old-code tab left open across this deploy doesn't silently
  write into a superseded store (§Migration, downgrade case) — in scope for THIS fix, or a separate
  follow-on task? The mechanism named in §Migration is the right shape but is not itself specced in
  implementation detail here.
- ⛔ BLOCKED (inherited from the PoC doc, restated not re-litigated): is real cross-device sync for
  this store (Case 3/S5 — wiring `erp_sync.js`/`erp_relay_server.js` into the SAME `ops` store this
  spec defines) an actual roadmap item, or is same-device-only intentional for this surface? This
  spec's Web Locks/BroadcastChannel design explicitly does not cover it (§Cross-tab coordination
  boundary) — now doubly relevant since the underlying storage format is changing at the same time.
- ⛔ BLOCKED: what bounds the `ops` store's growth for a long-lived, frequently-edited record (§Risks)
  — a time-based archival window, a max-row compaction-and-truncate policy (which would need to
  reconcile with `changeLog`/`fieldLineage` needing full history, §Design), or "not a problem at
  today's scale, revisit later"? Not decided here; named so it isn't silently assumed away.

---

## §Post-Fix Actions (do WHEN this fix lands — user directive 2026-07-20)

- **Add the live-persistence caveat to `docs/MigrateComparisonPaper.md`.** The paper's storage-primitive
  numbers (`§BENCH sqljs N=1000 ops ONE commit = 208.45ms / 0.2084ms/op`, `build/erp/bench_oplog_pg.log`;
  `linear to 20M ops`; `314 B/op`) measure the **batched, in-memory engine fold** — they do NOT include
  the live single-Save persistence path, which today calls `_sidePersist()` = whole-DB `SIDE.export()`
  + unconditional IndexedDB `put(wholeBlob)` on **every** commit. That is O(total DB size) per save
  (→ O(N²) over a session), un-benchmarked, and the paper's own honesty row already defers it
  ("Postgres durability/concurrency DEFERRED to the install"). Caveat text should state: (a) the
  headline per-op figures are the batched engine, (b) pre-fix the live per-Save write re-serialized
  the whole DB, (c) this fix makes each Save an O(1) ~314 B append so the shipped product actually
  tracks the paper's curve. **Write the caveat only once THIS fix is live** — so the caveat and its
  resolution ship together and the paper never documents a problem it has already fixed (or claims a
  fix not yet live). This is a `propose-before-editing-docs` file: draft the paragraph, show it, then
  publish via `scripts/safe_gh_deploy.sh` (never bare `mkdocs gh-deploy`).

---

## §Implementation 2026-07-20 — F1/F2/F3/F10 CORE landed (committed locally, NOT pushed/merged/deployed)

**Scope done, exactly as briefed:** F1 (append ops as individual IndexedDB records), F2 (read-all
hydration), F3 (commit lock via `navigator.locks`), F10 (migration of the pre-fix whole-blob record).
F5-F9 (real CAS/version-column reject, `claimed_by`/`cas` relabel, `BroadcastChannel` sibling refresh,
compaction snapshot policy) deliberately NOT touched — left clean for a later session, per the task's
own boundary, not half-built.

**Where:** `/home/red1/bim-ootb/erp/crud_overlay.js` + `/home/red1/bim-ootb/erp/kernel_ops.js`, in a
FRESH worktree `/tmp/wt-oplog-append` (branch `fix/oplog-append-only`, off `origin/main` @ `fa7b4ef`),
commit `49798d2`. **Committed locally only — not pushed, no PR, no merge into bim-ootb main, no deploy**
(task boundary; worker doesn't push, per `feedback_worker_no_push_watchdog_pushes.md`).

**Design landed, mirroring §Design/§Cross-tab coordination above almost verbatim:**
- `kernel_ops.js` gained 5 new pure/IDB-mechanics exports (the "store mechanics" the task asked to live
  there): `rowsByIds`, `allRowsPlain`, `replayRowsInto` (row-shape, sql.js-side — `replayRowsInto` uses
  `INSERT OR REPLACE` keyed by `id`, which is what lets a later snapshot of the same row — e.g. after
  undo/redo flips `undone` — correctly supersede an earlier one on replay, without ever violating F1's
  "IndexedDB record itself is only ever `add()`-ed, never `put()`" guarantee) and `appendOpsRecords`/
  `readAllOpsRecords` (generic IDB store mechanics, not tied to any one caller's DB/store names).
  `sealFrom`/`commitGroup`/`verifyChain` are REUSED completely unchanged, exactly as the spec required —
  zero new sealing logic. `§KERNEL_OPS_LOADED` bumped v12→v13.
- `crud_overlay.js` gained a new `ops` IndexedDB object store (autoIncrement) alongside the legacy `log`
  store in the SAME `glassbowl_kernel_ops` database (`SIDE_DBVERSION` 1→2, `_sideIdb`'s
  `onupgradeneeded` adds `ops` idempotently, never touches/deletes `log`). `_sidePersist(K, db, ids)`
  replaced the old `SIDE.export().buffer` + unconditional `put()` entirely — it now snapshots exactly
  the row ids a commit just touched (`K.rowsByIds`) and `add()`s them (`K.appendOpsRecords`). A new
  `_hydrateSide(idbDb, SQL, K, cb)` is the single F2+F10 hydration/migration path (idempotent marker
  `'migrated-from-blob'` in the OLD `log` store; legacy blob explode-once via `K.allRowsPlain` +
  `K.appendOpsRecords`, then straight to read-all via `K.readAllOpsRecords` + `K.replayRowsInto`). A new
  `_withFreshSide(K, task)` is F3/F4: wraps `task(freshDb, done)` in `navigator.locks.request(
  'erp-sidecar-commit', ...)`, re-hydrating SIDE fully (via `_hydrateSide`) BEFORE handing it to the
  caller — `commitCrud`/`_commitCrudSealed` and `commitProcess` were rewired through it (gate + seal +
  `_sidePersist` all now run inside the lock, `done()` called on every terminal path so the lock isn't
  released early). No-`navigator.locks` browsers fall back to unlocked (logged once, not silent).

**Witnessed, BEFORE (unfixed `origin/main` @ `fa7b4ef`, fast-forwarded clean first) vs AFTER (this
worktree) — same scripts, `OPLOG_WITNESS_ROOT` env var added to both so one script serves both runs:**

| Witness | BEFORE | AFTER |
|---|---|---|
| S3 `§E2E-VERIFY-FINAL` | `fields_present=grandtotal` (description LOST) | `fields_present=description,grandtotal` (both survive) |
| S4 `§E2E-VERIFY-FINAL` | `ops=1` (A's commit vanished, B silently won) | `ops=2` (both signed ops chained; B's *value* still wins the same FIELD, as expected — F5's CAS-reject is explicitly NOT in this CORE) |
| N10 `§N10-FINAL` | `survivors=1/10 chainValid=true` | `survivors=10/10 chainValid=true` |
| S6 `poc_crud_ownergate.js` | exit 0 (bim-compiler stale copy, untouched either way) | exit 0, unchanged |

Logs: `build/erp/witness_e2e_crud_blob_race.{BEFORE,AFTER}.log`,
`build/erp/witness_e2e_n10_concurrent_today.{BEFORE,AFTER}.log` (bim-compiler). Full runs:
`OPLOG_WITNESS_ROOT=/tmp/wt-oplog-append bash build/erp/run_witness.sh scripts/witness_e2e_crud_blob_race.js`
(8/8 🟢) and `...witness_e2e_n10_concurrent_today.js` (5/5 🟢, exit 0).

**New witness `W-OPLOG-MIGRATE`** (`scripts/witness_oplog_migrate.js`, bim-compiler) — seeds a REAL
pre-fix whole-blob sidecar (built with the real `commitGroup`, exported/`put()` the same way the old
`_sidePersist()` did, 5 real signed ops) via `page.evaluate()` BEFORE the fixed page's own
`withSidecar()` has ever run this page-load (the spec's own witness table names exactly this fixture
shape for F10), then opens the sidecar for the first time through the REAL, unmodified
`window.__crud.withSidecar()` path. Result: `§OPLOG-MIGRATE legacyOps=5 migratedOps=5 chainValid=true`,
`§OPLOG-BLOB-PRESERVED unchanged=true`, old blob byte-length-identical after migration, and a SECOND
fresh tab hydrates the same 5 ops with NO re-migration (idempotent marker honoured) — 10/10 🟢, exit 0.
Log: `build/erp/witness_oplog_migrate.log` / `.AFTER.log`.

**A real bug found and fixed mid-witnessing (Log Mandate in action, not swept under):** the first
migration-witness run showed 1/10 🔴 — `kernel_ops.js`'s `appendOpsRecords` resolves with the array of
assigned IndexedDB autoKeys (needed so `_sidePersist` can log each key), but `crud_overlay.js`'s
migration branch logged that ARRAY directly as `migratedOps=` (e.g. `1,2,3,4,5` instead of `5`) —a
string-concat bug, not a data-loss bug (the actual migration was already 100% correct: `hydratedCount=5,
chainOk=true` passed from the FIRST run). Fixed by reading `keys.length`. Also fixed, same pass: the N10
witness's own RAW-PATH corruption probe hardcoded `indexedDB.open('glassbowl_kernel_ops', 1)` — a
version LOWER than this fix's new schema (v2) throws `VersionError` and made the probe itself
unreadable, misreporting a clean AFTER run as "RAW/APP DISAGREEMENT." Fixed to open with no version arg
and to read the NEW `ops` store (the probe's ORIGINAL job — bypass the app to catch real corruption —
otherwise no longer meant anything once F1 moved where commits land).

**Known gap, named not hidden:** `foldBackDocOp`/`foldForwardDocOp` (undo/redo) call the new
`_sidePersist` with the ids `CORE.foldBackGroup`/`foldForwardGroup` touched, so a same-tab undo/redo
still round-trips correctly through replay's `INSERT OR REPLACE`. They are OUTSIDE `_withFreshSide`'s
cross-tab lock (the spec scopes F3 to `commitCrud`/`commitProcess` only) — cross-tab undo/redo ordering
is unproven and not claimed here.

**Not done, correctly:** F5 (real CAS/version-column reject — S4's *same-field* last-write-wins is
UNCHANGED by design, exactly as the CORE boundary specified), F6/F7 (`claimed_by`/`cas` rename), F8
(`BroadcastChannel` sibling-tab refresh — a sibling tab showing a stale value until its own next
read/commit is a known, accepted gap of this CORE pass), F9 (compaction/snapshot policy — the `ops`
store grows unboundedly, same as the spec's own §Risks already named, unresolved by design here).
