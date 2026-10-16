# ⚠ DO NOT REMOVE — Scope & Protocol
**Scope:** SPEC ONLY — no code in this document or produced by writing it. This PoC proves ONE
thing not yet proven anywhere in the repo: that the *live product UI* (`erp/glassbowl.html` /
`erp/idempiere.html`, the real `crud_overlay.js` write path) survives **two real, concurrent
browser sessions** editing ERP data — not two identities simulated sequentially inside one Node
process (which is what every existing `poc_*.js` concurrency witness already does, see §Current
State). **Log Mandate:** every witness run in this lane writes a `.log` file and the log is READ
before any pass/fail conclusion is drawn — exit code alone is never evidence (CLAUDE.md, Universal
Session Protocol). Honour this block until every item in §Spec is `✅ DONE (witness)` or
`⛔ BLOCKED: <one question>`.

---

## §Scope

**Proves:** whether the deployed `crud_overlay.js` write path (`erp/glassbowl.html`,
`erp/idempiere.html` — both load it, `bim-ootb erp/idempiere.html:603`,
`erp/glassbowl.html:880`) holds its documented guarantees when driven by **two real Playwright
`BrowserContext`s** (= two real users/devices, isolated storage per Playwright/Chromium semantics)
or **two real tabs of one `BrowserContext`** (= one user, two windows, shared `IndexedDB`) —
mirroring the exact two-shape split `teams/tests/witness_e2e_dual_presence_modeller.js` already
uses for presence (§SEP-* / §SAME-*), applied here to **data writes** instead of presence dots.

**Does NOT cover** (named so no session re-derives these as "missing"):
- The *engine-level* determinism/merge/CAS proofs — those are DONE and are not re-litigated here
  (`poc_distributed.js`, `poc_crud_ownergate.js`, `poc_quorum_cas.js`, `poc_blackout_resume.js`,
  `test_kernel_sync.js`/`test_kernel_rebase.js`/`test_kernel_relay.js`/`test_kernel_replica.js` —
  all §Current State below). This PoC is the *missing UI-driven layer on top of* that proven
  engine, per the project's own "engine-proven ≠ UI-proven" lesson
  (`feedback_test_real_user_path_not_seams.md`, confirmed twice already — Walk tool, then Teams).
- Cross-device sync over a real network relay (`erp_relay_server.js`, `teams/erp/erp_sync.js`) —
  those are engine-proven (§Current State) but **not wired into `crud_overlay.js`'s IndexedDB
  sidecar at all**; wiring them is a separate, larger feature, named as an open question below
  (§Open Questions Q3), not attempted here.
- New accounting/BOM/geometry values — non-invent; this PoC edits fields already exercised by
  `poc_crud_ownergate.js` (`c_order.grandtotal`) and does not synthesize new business data.
- Login/auth hardening, RBAC, or any change to `AD_Role`/`AD_User` — out of scope; the PoC uses
  real existing demo users from `SES.buildContext`'s user list as-is.

---

## §Current State (EXTRACTED)

**The doctrine (read, not re-derived):** `docs/DistributedERP.md` §4 defines the guard set —
`G-IDENTITY`, `G-EXCLUSIVE-DISPATCH`, `G-SINGLE-WRITER`, `G-RESERVATION`, `G-ORDERED-HANDOFF`,
`G-LEASE-EXPIRY`, `G-READ-ANYWHERE-WRITE-OWNER` — and §9 is the adversarial suite (durability,
forgery, freshness/double-spend, ownership/contention, determinism, the irreducible floor,
privacy), each row citing a Node-run witness. §6 names the "dumb post office" (facilitator: accept
+ order + persist + relay, no business logic). `docs/internal/ERP.md` §0.20/§0.21 wired
G-IDENTITY (edge-minted UUID as an op input) into the kernel, 2026-06-01.

**Engine-level concurrency witnesses that exist and pass (all Node.js, in-process, no real
browser — this is the gap this PoC closes):**

| Witness | File | What it proves |
|---|---|---|
| W-OWNER / Merge / G-IDENTITY | `scripts/poc_distributed.js` | two devices' logs union with no PK clash; owner-gate + CAS at the op-class level |
| **W-CRUD-GATE** | `scripts/poc_crud_ownergate.js` | the LIVE UI write funnel's owner-gate/CAS (`CORE.gateOp` in `build/erp/crud_overlay.js:413-429`) rejects a wrong-owner or stale-CAS `c_order` edit BEFORE the seal, sidecar unchanged; landed live via bim-compiler commit `5ceb0c11d` ("erp(crud): SO full document process in UI... W-CRUD-GATE", 2026-06-13) |
| W-SYNC-FSM / W-REBASE | `scripts/test_kernel_sync.js`, `scripts/test_kernel_rebase.js` | schema+chain gates on sync; SQLSync-style rebase (rewind→apply-server-order→replay-pending→re-seal); "two devices → IDENTICAL chain tip" |
| W-RELAY | `scripts/test_kernel_relay.js` | idempotent HTTP push/pull convergence over a dumb facilitator (`build/erp/erp_relay_server.js`) |
| W-REPLICA | `scripts/test_kernel_replica.js` | 3 real static hosts (GH/OCI/local) replay to an identical, signed chain tip |
| §ORDER-HONEST | `scripts/poc_blackout_resume.js` | net books reconstructible from disjoint per-branch logs after a lost sequencer (`maxDiff=0c`) |
| §CAS-SLIVER / `poc_quorum_cas.js` | `scripts/poc_quorum_cas.js` | the one residual (cross-branch CAS arbitration order) bounded to a quorum-RTT window |
| §DETECT/§ATTRIBUTABLE | `scripts/poc_equivocation.js` | a facilitator handing different clients different op orders is caught and attributed |
| W-ERP-SYNC | `bim-ootb teams/erp/erp_sync.js` + `teams/tests/poc_teams_erp_sync.js` | one-branch-per-role ERP sync over the Teams transport (§S8) — engine only, **not wired into `crud_overlay.js`** |

**The ONE real two-browser-context witness in either repo, and what it does NOT prove:**
`teams/tests/witness_e2e_dual_presence_modeller.js` (bim-ootb, PR #661) drives two REAL Playwright
`BrowserContext`s (and, in a second scenario, two tabs of one context) against the live Modeller
`#b-teams`/`#teams-pill` UI. It proves two things relevant here and one hard limit:
1. `§BC-CONTROL`: **`BroadcastChannel` never crosses two separate `BrowserContext`s**, even
   same-origin — a raw platform fact, proven with no app code (memory:
   `project_teams_e2e_no_ui_finding.md` Finding 3).
2. Two tabs of the SAME context DO share `BroadcastChannel` — the one case it covers.
3. **It is presence-only** ("who's here" dots) — it makes zero data writes and does not touch
   `crud_overlay.js`, `kernel_ops`, or IndexedDB. No witness in either repo exercises a real
   second `BrowserContext` performing a CRUD write.

**Honest gap this PoC closes.** Every "two devices/two users" claim in the doctrine above is
proven by one Node.js process holding two in-memory data structures and calling functions on them
in sequence — never by two independent browser processes racing against a shared store. That
distinction matters concretely here, because of a mechanism this session found by reading the live
write path (not previously logged as a finding anywhere):

> ⚠ **CITATION CORRECTION 2026-07-19 — read `ERP_OPLOG_APPEND_ONLY_FIX.md` §FILE PROVENANCE.**
> Every `build/erp/crud_overlay.js:<n>` line number in this document is actually a line number in
> **`/home/red1/bim-ootb/erp/crud_overlay.js`** (2493 lines, the LIVE file the witnesses ran
> against). The `bim-compiler/build/erp/` copy is a STALE 1841-line divergent file (857-line diff)
> where `_sidePersist` is at 1081, not 1632. The defective mechanism is identical in both, so all
> findings and witnesses stand — but do not edit code by these line numbers without checking which
> file. Also: `_serializeCommit` DOES exist (bim-ootb:1725, *"run a signed commit EXCLUSIVELY"*);
> it is a per-JS-context Promise mutex, which is why it could not prevent the cross-tab loss.

**`crud_overlay.js` `_sidePersist()` (bim-ootb:1632) is an unconditional whole-blob
overwrite, not a CAS.** The sidecar op-log lives in a **separate in-memory `sql.js` `Database`**
per page-load (`withSidecar`, ~line 1644, hydrates once from IndexedDB when the page opens), and
every commit calls `_sidePersist()`, which does:
```
var buf = SIDE.export().buffer;                       // whole-DB export, not incremental
db.transaction(SIDE_STORE, 'readwrite')
  .objectStore(SIDE_STORE).put(buf, SIDE_KEY);          // unconditional PUT — no version/CAS check
```
`SIDE_DBNAME='glassbowl_kernel_ops'`, `SIDE_KEY='kernel_ops.db'` are **fixed** — same-origin tabs
share this one IndexedDB record. `_serializeCommit` (~line 1723, a `Promise` chain) only serializes
commits **within one JS execution context** — it cannot and does not coordinate across tabs/
processes. So: if Tab A and Tab B both hydrate `SIDE` from the same starting blob, A commits +
persists (blob v1 contains A's op), then B — still holding its OWN in-memory `SIDE` from before A's
write — commits + persists (blob v2, derived from B's stale state, containing B's op but NOT A's)
→ **B's blob write silently overwrites A's**, even though both commits individually passed
`verifyChain` and the T4 owner-gate/CAS (which only checks the *logical* record fields inside each
process's own already-loaded view, never the physical IndexedDB generation). This is a **plausible,
previously-unwitnessed bug shape**, not a confirmed one — §Spec S3/S4 below test it. It is exactly
the "last-write-wins at the storage layer" failure the doctrine's root truth (§0 `DistributedERP.md`)
is designed to avoid at the *fact* level (`QtyOnHand=Σ movements`) — but the *op-log itself*, at the
IndexedDB blob layer, has no equivalent fold-not-overwrite protection today.

**`cas: "claimed_by"` is a LEASE column, not a version column (EXTRACTED 2026-07-19, resolves the
former Q3).** `crud_ops.json:72-73` declares `c_order` as `ownerGated:true, "cas":"claimed_by"`. But
the op-class semantics of `claimed_by` are defined in `bim-ootb erp/erp_replay.js:61-64`:
```js
} else if (op.op_type === 'CLAIM') {
  var cur = <SELECT claimed_by FROM documents WHERE uuid=?>;
  if (cur) { rejected.push({ why: 'already claimed by ' + cur }); return; }   // first claimant wins
  db.run('UPDATE documents SET claimed_by=? WHERE uuid=?', [op.actor, op.target]);
}
```
`claimed_by` is set ONCE, at claim time, and does **not** change when a field like `grandtotal` is
edited. That is **pessimistic locking** — `G-RESERVATION` / `G-SINGLE-WRITER` (`DistributedERP.md`
§4) — an exclusive writer lease. Compare-and-swap requires a value that changes on EVERY write (a
version counter / timestamp / op-hash); a lease token cannot detect "someone modified this since you
read it", only "someone else owns this". **Consequences, both settled by this extraction, not
assumed:**
1. The column is **per-USER by construction** — the claimant is `op.actor` = `APP.actor` =
   the `AD_User` id (`crud_overlay.js sessionActor()` ~line 1273). Two tabs of ONE login are the
   same claimant by definition, so the gate cannot distinguish them. The two-tabs case is not a
   gap in the design — it is **outside the design**; a single user in two concurrent sessions was
   never modelled.
2. `claimed_by` guards **WHO writes. Nothing in the system guards WHICH VERSION they wrote over.**
   Case 1 (§Concurrency Model) is therefore covered by nothing at all, and the `"cas"` key name in
   `crud_ops.json` is a **mislabel** that makes T4 read as if it covers Case 2 when it structurally
   cannot.

**Multi-user login is real, not stubbed** — this makes the PoC expressible today with no product
change: `erp/idempiere.html` `loginStep1()` (~line 1048) lets a user pick from a real `AD_User`
list (`SES.buildContext`); `applySession()` (~line 1093) sets `window.APP.actor = _session.user.id`
per page-load. `crud_overlay.js sessionActor()` (~line 1273) reads exactly that. So two tabs CAN
log in as two genuinely different real `AD_User` rows and carry two different `APP.actor` values —
nobody has run this.

---

## §Concurrency Model

Derived from the write path actually read above, not from generic CRDT theory. Three real cases:

**Case 1 — Two tabs, one `BrowserContext` (one user, two windows), same order, non-conflicting
fields.** Both hydrate `SIDE` from the same IndexedDB blob at open. Both edit *different* columns
of the same `c_order` row and save. Expected-safe per doctrine (disjoint writes "union trivially",
`DistributedERP.md` §3) — but the blob-overwrite mechanism above means the SECOND tab's persist
physically replaces the FIRST tab's blob wholesale, which contains the first tab's committed op
only if B's in-memory `SIDE` already contained it (it doesn't, unless B reloaded after A's commit).
**This is the case S3 tests** — a plausible silent-loss bug hiding inside a "should be fine"
scenario.

**Case 2 — Two tabs, one `BrowserContext`, same order, conflicting field (both change
`grandtotal`).** Same blob mechanism as Case 1. The T4 owner-gate/CAS is declared on `c_order`
(`crud_ops.json:72-73`) but **cannot fire here, and this is now known by extraction rather than
predicted**: per §Current State, `claimed_by` is a *lease*, per-USER, set once at claim time. Both
tabs carry the same `APP.actor`, so the owner check passes trivially (`actor === owner`), and the
"CAS" comparison reads a column that did not change between A's write and B's — so it also passes.
**There is no version/generation value anywhere in the write path for a real CAS to compare.** The
expected outcome is therefore (b) — silent acceptance, last persist wins — and S4's job is to
*witness* that, not to discover it. **This is the case S4 tests.**

**Case 3 — Two separate `BrowserContext`s (two real users/devices), same order.** Separate
IndexedDB per context (Playwright/Chromium isolation — the same isolation `§BC-CONTROL` already
proved for `BroadcastChannel`). There is **no sync path between them at all** today — `erp_sync.js`
/ `erp_relay_server.js` are not wired to `crud_overlay.js`'s sidecar. So two real users editing the
"same" order in two real sessions produce two **permanently divergent** sidecars — not a race, a
total silent fork, with no reconciliation until a human manually re-syncs (which no UI affordance
exists for on this path). **This is the case S5 names** (an honest gap, not a bug — the doctrine
never claimed offline-cross-device sync was wired here; it claimed it was *engine-proven
elsewhere* — the PoC's job is to make that gap visible in the actual product, not to fix it).

**Offline edit + reconnect** — not applicable in the sync-FSM sense (`erp_sequencer`/`rebase`)
because that machinery isn't reachable from the live UI (§Current State). The closest live
analogue is Case 3: a session that never talks to another session is indistinguishable from "went
offline and never reconnected." No reconnect path exists to test.

**Last-write-wins vs merge** — the doctrine's answer (`DistributedERP.md` §0 root truth) is
*neither*: derived facts (`QtyOnHand`) fold; the op-log itself unions and total-orders. That answer
is proven at the engine level (`poc_distributed.js`) but, per the mechanism found above, the live
IndexedDB sidecar currently behaves as **whole-blob last-write-wins** for anything not captured in
one tab's own in-memory state — the opposite of the doctrine, at the one seam nobody had looked at.

---

## §Spec

Numbered, testable, each a single falsifiable statement.

- **S1.** Two Playwright `BrowserContext`s can each independently log in
  (`loginStep0`→`loginStep1`→`loginStep2`) as two different real `AD_User` rows on
  `erp/idempiere.html`, each ending with a distinct `window.APP.actor`.
- **S2.** Two tabs of the SAME `BrowserContext`, both opened on `erp/glassbowl.html`, both
  hydrate `SIDE` from the identical starting IndexedDB blob (same op count, same tip hash) before
  either edits anything.
- **S3.** Two tabs of one `BrowserContext` (Case 1: same order, DIFFERENT non-conflicting fields,
  e.g. tab A edits `documentno`-adjacent free field, tab B edits `grandtotal`) each independently
  save. AFTER both saves, a fresh third tab (or a reload of either) reading the sidecar shows
  **BOTH** edits present. (Falsifies to: one edit is silently missing — the blob-clobber bug named
  in §Current State.)
- **S4.** Two tabs of one `BrowserContext` (Case 2: same order, SAME field `grandtotal`, tab A
  saves first, tab B — still holding its pre-A in-memory state — saves second) — tab B's save is
  **accepted with no rejection** (`§CRUD-GATE` either absent or `verdict=PASS`), and the final
  persisted `grandtotal` is B's value. **Predicted by extraction, not open:** `claimed_by` is a
  per-user lease that does not change per edit (§Current State), so neither the owner check nor the
  "CAS" check can fire between two tabs of one login. S4 exists to convert that reasoning into a
  witnessed fact. (Falsifies to: a rejection DOES appear — meaning some guard not found in the read
  is active, and the §Current State extraction is wrong and must be corrected.)
- **S5.** Two separate `BrowserContext`s (Case 3: two real users/devices), each editing the same
  order independently, produce two sidecars whose tips diverge (`verifyChain` tip A ≠ tip B) with
  **no error, warning, or UI affordance surfaced to either user** — naming the cross-device fork as
  a real, currently-silent gap (not asserting it should be fixed here).
- **S6.** The existing single-process witness `scripts/poc_crud_ownergate.js` (G3/G4/G5) continues
  to PASS unmodified — this PoC is additive, it does not touch `crud_overlay.js` gate logic, so the
  already-proven single-process owner-gate/CAS behaviour must not regress.

---

## §Witnesses

| Spec | Witness | `§` log tags + expected values |
|---|---|---|
| S1 | `W-MULTIUSER-LOGIN` | `§E2E-LOGIN ctx=1 user=<AD_User.Name> actor=<id>` and `§E2E-LOGIN ctx=2 user=<AD_User.Name> actor=<id>`, asserted `actor` values differ |
| S2 | `W-SIDECAR-HYDRATE` | `§E2E-HYDRATE tab=A tip=<hash> ops=<n>` / `§E2E-HYDRATE tab=B tip=<hash> ops=<n>` — assert equal before either edits |
| S3 | `W-CRUD-BLOB-RACE-DISJOINT` | `§E2E-SAVE tab=A field=<col> committed=<bool>` / `...tab=B...`; then `§E2E-VERIFY-FINAL fields_present=<col1,col2> expected=<col1,col2>` — issue proved/disproved: does the second tab's `_sidePersist` blob-overwrite silently drop the first tab's already-committed, chain-verified op |
| S4 | `W-CRUD-BLOB-RACE-CONFLICT` | `§E2E-SAVE tab=A grandtotal=<v1> committed=true` then `§E2E-SAVE tab=B grandtotal=<v2> committed=<bool> gateVerdict=<PASS|REJECT|absent>`; final `§E2E-VERIFY-FINAL grandtotal=<v>` — issue proved/disproved: does same-actor same-field cross-tab conflict get caught by anything, or silently resolve to whichever tab persisted last |
| S5 | `W-CROSS-DEVICE-FORK` | `§E2E-TIP ctx=1 tip=<hash>` / `§E2E-TIP ctx=2 tip=<hash>` after both edit independently — asserted to DIFFER, with `§E2E-NO-SURFACE` confirming neither page emitted any error/toast/warning event (`overlay:committed` or console `warn`) referencing the divergence |
| S6 | (regression, no new witness) | `node scripts/poc_crud_ownergate.js` exit 0, all G1-G5 lines unchanged |

Each witness script: `⚠ DO NOT REMOVE` header naming the issue it proves/disproves (per
`CLAUDE.md` "Tests expose issues"), runs via `bash build/erp/run_witness.sh scripts/<name>.js`
(full output → `build/erp/<name>.log`, log read before any pass/fail claim — Log Mandate), and per
project convention a `🟢`/`🔴` `verdict()` line per assertion, `process.exit(fails ? 1 : 0)`.

---

## §Test Harness

Reuse, don't invent: `teams/tests/witness_e2e_dual_presence_modeller.js` (bim-ootb) is the existing,
proven pattern for exactly this shape of test and should be copied/adapted, not redesigned:
- A throwaway `http.createServer` serving the repo root (no external test server dependency).
- `require('playwright')`, with the same fallback the existing witness uses
  (`require('/home/red1/bim-ootb/tests/node_modules/playwright')`) since Playwright is not a
  top-level dependency everywhere in the tree.
- `browser.newContext()` **twice** for S1/S5 (two real separate users/devices — Playwright's
  per-context storage partition IS the isolation mechanism, already proven by `§BC-CONTROL` to
  match real separate-profile behaviour for `BroadcastChannel`, and by extension for IndexedDB,
  which is likewise partitioned per storage origin+context in Chromium).
- One `context.newPage()` **twice** for S2/S3/S4 (two tabs, one user, shared IndexedDB — the
  `§SAME-*` shape in the existing witness).
- Real UI interaction only, per the project's own prior finding
  (`feedback_test_real_user_path_not_seams.md`): `page.click`/`page.fill` on the actual login flow,
  edit ring, and Save button — **no `page.evaluate()` reaching into `crud_overlay.js` internals**
  to fake a commit. The whole point of this PoC is that the previous concurrency proofs were all
  internals-only.
- Read final state via the SAME `§`-log convention `crud_overlay.js` already emits
  (`§CRUD-PERSIST`, `§CRUD-GATE`, `§CRUD process committed`) captured with
  `page.on('console', ...)`, matching `docs/archive/TestArchitecture.md` §Browser Testing (`§`-tag
  is primary evidence; Playwright drives the click path, does not replace the log read).
- No new test framework, no new server, no new browser-automation dependency — every piece above
  already exists in the repo today.

---

## §Remedy Direction (PROPOSAL — not extracted, not yet specced as work)

⚠ Everything in this section is **proposed standard practice, not repo fact** — none of it exists in
the tree today. It is recorded here so the witness results land against a named direction instead of
an open question. No implementation until S3/S4 report.

**The failure class, named precisely:** `_sidePersist()` is a read-modify-write of the ENTIRE
database file. That is the textbook **lost-update anomaly** at the worst possible granularity. A
traditional RDBMS cannot exhibit it — its unit of write is a row inside a shared file, coordinated by
a lock manager + WAL. Concurrency control (OCC via a `Version`/`Updated` column — which **iDempiere's
own `PO.save()` does**, and iDempiere is this project's declared oracle — or pessimistic
`SELECT ... FOR UPDATE`) sits ABOVE that. **No amount of row-level CAS fixes a whole-file
overwrite** — perfect OCC on `grandtotal` still loses Case 1, because the loss is below the row layer.

1. **Append ops as individual IndexedDB records; stop persisting a whole-DB blob.** Today: one store,
   one fixed key (`kernel_ops.db`), `put()` of a full export. Instead: an op store keyed by
   sequence/hash, written with `add()`. Tab A writes `#41a`, Tab B writes `#41b` — different keys,
   **neither can physically clobber the other**. Hydration = read all op records + replay (what the
   kernel already does). The whole-DB export survives only as a compaction snapshot carrying a
   generation number. This makes the clobber *structurally impossible* rather than *defended
   against*, and it is exactly what `DistributedERP.md` §0 already mandates ("the op-log unions and
   total-orders") — the storage layer is currently contradicting the project's own doctrine.
2. **Cross-tab coordination via primitives already in the browser** (no new dependency):
   `navigator.locks.request()` (Web Locks API) as a real cross-tab mutex around commit — the native
   equivalent of a row lock; plus `BroadcastChannel` to notify sibling tabs to refresh their `SIDE`.
   `§BC-CONTROL` already proved `BroadcastChannel` works WITHIN one `BrowserContext` (Case 1/2 scope)
   and correctly does NOT cross contexts — which is why it is useless for Case 3/S5, which needs the
   relay.
3. **Un-conflate the two concepts.** Keep `claimed_by` as the inter-USER exclusive lease it actually
   is (add `G-LEASE-EXPIRY` if a claim can go stale). Add a SEPARATE real version/op-hash column for
   stale-write detection, and rename the `crud_ops.json` `"cas"` key so it stops pointing at a lease
   column — that mislabel is what made T4 read as covering Case 2 when it structurally cannot.

Payoff order: **(1) is the fix** — it eliminates the failure class. (2) is correctness+UX on top.
(3) is cleanup that stops the next reader being misled the same way.

---

## §Open Questions

- ⛔ BLOCKED: Should S4's finding (if it lands on outcome (b) — same-actor same-field cross-tab
  conflict is silently accepted with no rejection) be filed as a bug fix (extend the T4 gate to
  cover intra-actor multi-session CAS, e.g. a session/tab-id component in the CAS key) or accepted
  as a documented limitation of the current single-actor-per-login model? This PoC's job is to name
  the finding, not decide the remedy — needs a user call once the witness result is in hand.
- ⛔ BLOCKED: Is real cross-device sync for the live CRUD sidecar (wiring `teams/erp/erp_sync.js` /
  `erp_relay_server.js` into `crud_overlay.js`'s IndexedDB path, closing Case 3/S5's silent fork) an
  actual roadmap item, or is single-device-only intentional for this surface today? The engine-side
  transport exists and is proven (W-ERP-SYNC) but wiring it into the live write path is a
  nontrivial feature, not a PoC-sized task — needs a priority call, not assumed here.
- ✅ RESOLVED 2026-07-19 (was: is `claimed_by` per-SESSION or per-USER?) — **per-USER, and it is a
  lease, not a CAS**. Settled by extraction from `erp_replay.js:61-64` + `crud_ops.json:72-73`, see
  §Current State. No user decision was needed; the code says it. Two tabs of one login are the same
  claimant by construction, and no version column exists anywhere in the write path.

---

## §Results 2026-07-19 — S2/S3/S4 witnessed, REAL two-tab browser run

**Witness:** `scripts/witness_e2e_crud_blob_race.js` (bim-compiler) — a REAL two-Playwright-tab,
one-`BrowserContext` run against the LIVE product UI (`bim-ootb/erp/idempiere.html`, real
`crud_overlay.js` write path, real `ad_seed.db` row `c_order` id=101 / documentno 80001). Login via
the app's own `?login=SuperUser` zero-click entry (`_tryAutoLogin`); record opened via the app's own
`?window=143&record=101` deep link (`_landOnRecord`); edits driven by `page.fill()` on the real
`data-col` inputs + `page.click()` on the real, visible `#idmp-toolbar` Save button. NO
`page.evaluate()` faked any commit — the only `evaluate()` calls read already-persisted IndexedDB
state via the app's own published `window.__crud.kernelDb()`/`core.tipValues()` API (the same calls
`idempiere.html` itself makes). Log: `build/erp/witness_e2e_crud_blob_race.log` (1173 lines) — READ
before trusting this summary (Log Mandate). Run: `bash build/erp/run_witness.sh
scripts/witness_e2e_crud_blob_race.js` — exit 1 (1/8 assertions 🔴, all three below EXPECTED-shaped 🔴s
per the file's own header, not a harness defect).

**S2 / W-SIDECAR-HYDRATE — CONFIRMED clean (no bug here).**
```
§E2E-HYDRATE tab=A tip=GENESIS ops=0
§E2E-HYDRATE tab=B tip=GENESIS ops=0
🟢 S2 tab A and tab B hydrate the IDENTICAL starting blob (same tip, same op count)
```

**S3 / W-CRUD-BLOB-RACE-DISJOINT — BUG CONFIRMED, worse than the falsification wording implied.**
Tab A edited `description`, tab B (already hydrated before A's save) edited `grandtotal` — a
DIFFERENT column. Both individually reported a successful signed commit:
```
§CRUD-PERSIST key=c_order id=101 op=CRUD_UPDATE cols=description ... sealed=1 verifyChain=ok   (tab A)
§CRUD-PERSIST key=c_order id=101 op=CRUD_UPDATE cols=grandtotal  ... sealed=1 verifyChain=ok   (tab B)
§E2E-VERIFY-FINAL fields_present=grandtotal expected=description,grandtotal values={"grandtotal":4242.42}
🔴 S3 ISSUE CONFIRMED: the predicted blob-clobber occurred — description LOST (final ops=1)
```
A fresh THIRD tab's read-the-tip shows **`description` is gone entirely** — not merely "grandtotal
wins on conflict" (there was no conflict, different columns) but **A's whole committed, chain-verified
op vanished** because B's `_sidePersist()` exported B's own stale in-memory `SIDE` (which never
contained A's op) and overwrote the IndexedDB blob wholesale. Both tabs' own consoles reported
`committed:true` / `verifyChain:ok` — **the UI told both users their save succeeded, and one of them
was wrong**, with no error surfaced to either. This is the disjoint-field case the spec called
"plausible, previously-unwitnessed" — now witnessed.

**S4 / W-CRUD-BLOB-RACE-CONFLICT — CONFIRMED exactly as predicted by extraction.**
```
§E2E-SAVE tab=A grandtotal=1111.11 committed=true gateVerdict=PASS
§E2E-SAVE tab=B grandtotal=2222.22 committed=true gateVerdict=PASS
§E2E-VERIFY-FINAL grandtotal=2222.22 ops=1 tip=2306ba51de2f7cc751bb111b5cde6465311cea529a0dd60e1341936bd79927cc
🟢 S4 final persisted grandtotal = B's value — last-tab-to-save silently wins
```
The owner/CAS gate ran for both (`ownerGated=Y`) and PASSed both — no rejection anywhere, matching
the §Current State extraction (`claimed_by` is a per-user lease, both tabs are the same actor, no
version column exists to CAS against). Final state: A's `1111.11` is gone, B's `2222.22` silently
won, `ops=1` (not 2 — A's row was never in B's exported blob at all, same underlying mechanism as S3).

**S6 regression — PASS, unmodified.** `node scripts/poc_crud_ownergate.js` exit 0, G1-G5 lines
unchanged (`build/erp/poc_crud_ownergate.log`); this PoC touched no product code.

**Net verdict: the predicted bug is REAL, witnessed live in the real browser UI, not just read from
the source.** Both S3 and S4 land on the "issue confirmed" branch, not the disproof branch — S3's
finding is strictly worse than what was predicted (total op loss, not just column-level clobber,
since the mechanism operates at the whole-DB-export granularity regardless of which columns
changed). §Open Questions' two ⛔ items (fix-vs-document Case 2; wire cross-device sync) remain
genuinely open — this session only witnessed, per its own boundary, and made no product change.

---

## §Results 2026-07-19 (cont.) — S1/S5 witnessed, REAL two-BrowserContext run

**Witness:** `scripts/witness_e2e_multiuser_login_fork.js` (bim-compiler) — two genuinely SEPARATE
Playwright `BrowserContext`s (not two tabs of one, per §Test Harness) against the LIVE product UI
(`bim-ootb/erp/idempiere.html`). S1 drives the REAL click-through login funnel
(`#idmp-login-clients`/`#idmp-login-users` rows + the real `#idmp-login-ok` button) — no `?login=`
shortcut — to two real, distinct `AD_User` rows in client 11 GardenWorld (`GardenAdmin`=101,
`GardenUser`=102 — the only two GardenWorld users with `hasRoles=true`, verified via sqlite3 against
`ad_seed.db` before writing the file; the other three GardenWorld users have zero `ad_user_roles`
rows and render as disabled/unclickable). S5 reuses the same real deep-link + `page.fill()`/
`page.click()` Save pattern S3/S4 already proved clean (`?login=SuperUser&window=143&record=101`,
same actor in both contexts, deliberately — isolates the storage-partition variable under test from
the unrelated owner-gate-reject confound a non-owner actor would introduce; S1 already separately
proves distinct-actor login works). Log: `build/erp/witness_e2e_multiuser_login_fork.log` (615
lines) — READ in full before this summary (Log Mandate). Run: `bash build/erp/run_witness.sh
scripts/witness_e2e_multiuser_login_fork.js` — **exit 0, 11/11 🟢**.

**S1 / W-MULTIUSER-LOGIN — CONFIRMED clean.**
```
§E2E-LOGIN ctx=1 user=GardenAdmin actor=101
§E2E-LOGIN ctx=2 user=GardenUser actor=102
🟢 S1 ctx=1 reached a real logged-in actor (GardenAdmin) — actor=101
🟢 S1 ctx=2 reached a real logged-in actor (GardenUser) — actor=102
🟢 S1 ctx=1 and ctx=2 actor values DIFFER (two genuinely distinct real AD_User identities) — ctx1.actor=101 ctx2.actor=102
```
Two separate `BrowserContext`s independently drove `loginStep0`(tenant)→`loginStep1`(user)→
`loginStep2`(role/org)→real Log-In-button click, each landing on its own `window.APP.actor`
(confirmed also via the app's own `§ACTOR login user=101 app.actor=101 client=11 org=0` /
`§ACTOR login user=102 app.actor=102 client=11 org=11` lines). Multi-user login is real and reachable
by the actual click path, not just the `?login=` demo shortcut.

**S5 / W-CROSS-DEVICE-FORK — CONFIRMED exactly as predicted (Case 3, §Concurrency Model).**
```
§E2E-SAVE ctx=1 grandtotal=7777.77 committed=true
§E2E-SAVE ctx=2 grandtotal=8888.88 committed=true
§E2E-TIP ctx=1 tip=0dc04c3b8e95cd7417c5ad4cafbb20013020178fd0b1ef1c6ef1b4742b2cda0c ops=1 grandtotal=7777.77
§E2E-TIP ctx=2 tip=43aaf1c33d65eb8011476a22b63d28b0fbdb20fbe43dc9c6935db5dee9274c42 ops=1 grandtotal=8888.88
🟢 S5 ctx=1 and ctx=2 sidecar tips DIVERGE (predicted: no sync path exists between separate contexts)
🟢 S5 each context privately kept ITS OWN edit (A=7777.77, B=8888.88) — a true silent fork, not a merge or a shared last-write-wins
§E2E-NO-SURFACE ctx=1 warn/err=[] toasts=["UPDATE Order — saved (signed)"]
§E2E-NO-SURFACE ctx=2 warn/err=[] toasts=["UPDATE Order — saved (signed)"]
🟢 S5 §E2E-NO-SURFACE — no console warning/error on EITHER page references divergence/conflict/staleness
🟢 S5 §E2E-NO-SURFACE — no toast shown to EITHER user references divergence/conflict/staleness
🟢 S5 §E2E-NO-SURFACE — BOTH users instead saw the NORMAL success toast ("saved (signed)")
```
Both contexts' own `§CRUD-GATE` line read `verdict=PASS actor=100 owner=100 cas=claimed_by` — the
gate ran and passed cleanly on both (same actor, same owner, no rejection). Each context sealed its
own chain (`§KRN_CHAIN verify OK len=1`), persisted its own 20.0KB sidecar blob, and each read back
ONLY its own edit — `ops=1` on both sides, never 2, confirming there is truly no reconciliation, not
merely a race. Zero console `warning`/`error` on either page (empty arrays, not filtered-to-empty),
zero `pageerror` events, and the only toast either user saw was the normal
`"UPDATE Order — saved (signed)"` success toast — the UI told both users their private, now-permanently-
diverged edit succeeded, identically to what a real conflict-free save looks like. This is the silent
fork named in §Concurrency Model Case 3, now witnessed live rather than read from the source.

**Net verdict: both S1 and S5 land exactly on their predicted branch — no disproof.** S1 shows the
real login path reaches two genuinely distinct identities; S5 shows two real devices editing the same
order fork permanently and silently, with the UI actively telling both users "saved" and nothing else.
Together with the already-witnessed S2/S3/S4, all four Case 1/2/3 concurrency shapes named in
§Concurrency Model are now witnessed live in the real product UI, not just read from source. This
session made no product change and did not touch `prompts/ERP_OPLOG_APPEND_ONLY_FIX.md` (owned by a
concurrent session) — §Open Questions' two ⛔ items remain open, now with S5's live confirmation behind
the second one.

---

## §N-User Concurrency (2026-07-20)

Extends S1–S6 (above) from N=2 to N=10, and from "is the bug real" to "what does setting up N real
users actually require." Nothing above is re-derived — this section builds strictly on the already-
witnessed S1–S6 findings plus new extraction (the T6/W-CROSS-TAB-PERSIST fact below, not previously
logged anywhere in this file).

### §Setup Architecture

**What EXISTS today, cited:**
1. **Real multi-user login/identity — PROVEN (S1).** `erp/idempiere.html` `loginStep0→1→2` (~line 1048)
   lets any real `AD_User` row log in; `applySession()` (~line 1093) sets `window.APP.actor`;
   `crud_overlay.js sessionActor()` (~line 1273) reads it. S1 drove the REAL click-through funnel (not
   the `?login=` shortcut) to two distinct real users in client 11 GardenWorld (`GardenAdmin`=101,
   `GardenUser`=102 — verified against `ad_seed.db` as the only two with `hasRoles=true`). This part of
   "N users" is real and reachable **today, no product change needed**.
2. **No shared install/tenant server exists at all — this is deliberate doctrine, not a gap.**
   `docs/DistributedERP.md` §8 (~line 378) names the model it explicitly REJECTS: *"a standard
   corporate ERP install is three always-on tiers, per tenant, 24/7"* (app server + DB server +
   cache/LB). This project's whole thesis (§0, §6) is the opposite: each device/browser is a
   self-contained kernel over `sql.js`, with a **"dumb post office"** relay (§6) as the only
   server-side component, doing pure sequencing, no business logic. **Consequence for "N users
   sharing one dataset" today:** there is no "shared dataset" to point N users at — every browser
   loads its own local `ad_seed.db` and its own local, per-origin IndexedDB sidecar
   (`glassbowl_kernel_ops`/`kernel_ops.db`). S5 already proved this partition is real at the storage
   layer (two `BrowserContext`s, two permanently divergent tips, §BC-CONTROL-equivalent isolation).
   "N users on N devices" today = **N independent local copies**, not N seats into one install.
3. **The relay ("dumb post office") is engine-built, not wired.** `build/erp/erp_relay_server.js`
   (bim-compiler; the live-equivalent doesn't exist in bim-ootb's `erp/` at all — confirmed by search,
   this session) exposes exactly the contract `DistributedERP.md` §6 describes: `POST /push`
   (idempotent by `op_uuid`), `GET /snapshot?after=N`, `GET /head`, `GET /health` — proven by
   `scripts/test_kernel_relay.js` (W-RELAY, §Current State). `teams/erp/erp_sync.js` (bim-ootb, 114
   lines) is the client-side counterpart, proven by `teams/tests/poc_teams_erp_sync.js` (W-ERP-SYNC)
   over the **Teams** transport only. Neither is imported by `crud_overlay.js` or `idempiere.html`
   (grep-confirmed, this session and prior) — the CRUD sidecar has zero network code.
4. **NEW THIS SESSION — a proven fix PATTERN for the same-context bug already SHIPPED elsewhere in
   this exact codebase, just not wired to the CRUD sidecar.** `erp/kernel_ops.js`'s OWN generic
   IndexedDB persist path (`_persistToIdb`, ~line 125, used by `pos_lens.js`/`kanban_host.js`'s
   `bim_ootb_cache`/`dbs` cache — a *different* consumer, not `crud_overlay.js`) is guarded:
   `navigator.locks.request('krn_persist:'+dbUrl, ...)` serializes same-origin tabs, and
   `_storedTipIsAncestor(db, storedTip)` (~line 109) refuses to persist unless the currently-stored
   tip is an ancestor of this tab's own chain — i.e. exactly the CAS/version check §Current State
   above says is missing. This is **T6 / W-CROSS-TAB-PERSIST**, SHIPPED in bim-ootb PR #623 (kernel
   v9→v10, 2026-07-03, `prompts/KERNEL_HARDENING_BATCH1_SPEC.md` §STATUS line 17-18), witnessed
   9/9 red-before/green-after in `erp/tests/witness_cross_tab_persist.js` (§T6-GUARD-TRUTH /
   §T6-NO-CLOBBER / §T6-FAST-FORWARD). **`crud_overlay.js`'s `_sidePersist()` does NOT call
   `_persistToIdb` and does NOT use `_storedTipIsAncestor`** — it opens its OWN separate IndexedDB
   database (`glassbowl_kernel_ops`, not `bim_ootb_cache`) and does a raw unconditional `put()`
   (§Current State above, confirmed again by this session's `witness_e2e_n10_concurrent_today.log`).
   The concurrent session's `prompts/ERP_OPLOG_APPEND_ONLY_FIX.md` (read, not edited, per this
   session's boundary) specs an append-only-records redesign from scratch; this finding says a
   **cheaper alternative already exists and is proven** — wiring `_sidePersist()`/`withSidecar()` to
   the same tip-guard pattern `_persistToIdb` already uses, rather than only the larger storage
   redesign. Named here as an extraction fact for whoever picks up gate item (1); not a redesign
   proposal of this SPEC-ONLY session's own (§Boundaries).

**What must be BUILT for N users to share ONE logical dataset (both required, neither optional):**
- **Same-context regime fix** — either wire `crud_overlay.js`'s `_sidePersist()` to the SHIPPED T6
  tip-guard pattern (fact 4 above) or land the append-only per-op-record redesign already specced in
  `ERP_OPLOG_APPEND_ONLY_FIX.md`. Fixes Regime (a) below only.
- **Relay wiring** — connect `teams/erp/erp_sync.js` / `build/erp/erp_relay_server.js` (proven, fact 3
  above) into `crud_overlay.js`'s write path so N separate devices actually exchange ops instead of
  maintaining silently-forked local copies. Fixes Regime (b) below only. This is the standing ⛔ from
  the original PoC (§Open Questions), unchanged by this session.

### §Two Concurrency Regimes

**(a) Same-context N-tab** — one user, N browser windows/tabs, ONE shared storage origin (shared
IndexedDB). This is §Concurrency Model Case 1/2, scaled: S3/S4 witnessed it at N=2 (2026-07-19); this
session's `W-N10-CONCURRENT-TODAY` (§Results below) witnesses it at N=10. **Fixed by:** the
same-context fix above (T6-pattern wiring OR append-only redesign) — **no relay involvement needed**,
this regime never leaves one browser's storage origin.

**(b) N-context (N devices/users)** — N separate storage origins (`BrowserContext` isolation, the same
partition §BC-CONTROL already proved for `BroadcastChannel` and S5 proved for IndexedDB itself). This
is §Concurrency Model Case 3. **Fixed by:** the relay wiring above only — a same-context fix (T6 or
append-only) does nothing here, because there is no shared storage for a local guard to protect; the
divergence is across two entirely separate machines/browsers with no channel between them at all today.

Both regimes are real and independently gated — landing only one still leaves the other's failure mode
live. A truthful "N-user setup" guide needs both landed and witnessed (§Gate).

### §Target Witness `W-N10-CONVERGE` (DEFINE ONLY — not built this session, per §Boundaries)

**Purpose:** once BOTH gate items (§Gate) land, prove that 10 real `BrowserContext`s (S1's proven
distinct-`AD_User` login pattern, or 10 same-actor devices — either is valid), each performing ONE
real signed UI write, all converge through the relay to ONE identical signed chain tip, with every
contributed op accounted for (no silent loss — the exact failure this session's `W-N10-CONCURRENT-
TODAY` finds at N=10 in the *unfixed* same-context regime, now asked of the *fixed* cross-device
regime).

**Design sketch (for whoever builds it — NOT built here):** launch `build/erp/erp_relay_server.js` on
an ephemeral port (the same pattern `scripts/test_kernel_relay.js` already uses for W-RELAY); 10
`BrowserContext`s, each logging in for real (S1's click-through pattern) and performing ONE real
`page.fill`/`page.click` Save on a distinct field or record; each context's (now relay-wired)
`crud_overlay.js` pushes its committed op(s) to the relay and pulls the relay's canonical order back;
after all 10 finish plus a settle window, read all 10 contexts' local sidecar tips.

**Exact `§` log tags + expected values (proposed, matching this project's `§`-tag convention):**
```
§N10C ctx=<i> actor=<id> wrote=<field>=<val> pushed=<bool>              — per-context, per-write
§N10C-CONVERGE ctx=<i> finalTip=<hash> opsSeen=<n>                      — per-context, post-settle
§N10C-VERDICT allTipsEqual=<bool> totalOps=<n> lostOps=<n>              — closing summary
```
Expected on a PASS: all 10 `finalTip` values IDENTICAL; every context's `opsSeen=10` (all 10
contributions visible everywhere, not just its own); `allTipsEqual=true totalOps=10 lostOps=0`.
**Falsifies to:** any two tips differ, any context's `opsSeen<10`, or `lostOps>0` — any of which means
the relay wiring reintroduced a version of the same silent-loss bug this whole lane exists to close.

### §Guide Skeleton (POST-GATE — do NOT write this into `ERPUserGuide.md` yet, §Boundaries)

Each bullet is the FUTURE guide's likely content, tagged with the witness that must be green before
that specific sentence is true. None of these are true to write today.

- *"Each user installs the app (PWA) once per device and logs in as their own account."* — gated by:
  **nothing — TRUE TODAY**, per S1 (`W-MULTIUSER-LOGIN`, already witnessed 2026-07-19). The only line
  in this skeleton not behind a future gate.
- *"Multiple browser windows on one device are safe to use at once without any special setup."* — gated
  by: the same-context fix (T6-pattern wiring or append-only redesign) landing AND a rerun of
  S3/S4/`W-N10-CONCURRENT-TODAY` showing 0 loss (today they show loss at both N=2 and N=10).
- *"Point every device at your organization's shared relay address to see everyone's changes."* — gated
  by: the relay-wiring feature (§Gate item 2) actually being built — today `crud_overlay.js` has no
  relay client code of any kind to point anywhere.
- *"Once connected, your changes and everyone else's converge automatically — no manual re-sync
  needed."* — gated by: `W-N10-CONVERGE` (above) green.
- *"If two people edit the same record at the same moment, [documented conflict behavior]."* — gated
  by: the ⛔ open question in §Open Questions ("fix as intra-actor CAS extension, or document as a
  limitation?") being resolved by the user, AND whichever remedy is chosen being landed + witnessed.
  This bullet cannot be written honestly until that decision exists, independent of the two gate items.

### §Gate

A truthful ERPUserGuide "how multi-user is set up" section cannot be written until **both** land:
1. **The same-context fix** — `prompts/ERP_OPLOG_APPEND_ONLY_FIX.md`'s append-only redesign, OR
   (newly identified this session, cheaper) wiring `crud_overlay.js`'s `_sidePersist()` to the
   already-SHIPPED T6/W-CROSS-TAB-PERSIST tip-guard pattern in `kernel_ops.js` (`_persistToIdb`/
   `_storedTipIsAncestor`, PR #623). Stops same-store silent loss within one device.
2. **Relay wiring** — connecting `teams/erp/erp_sync.js`/`build/erp/erp_relay_server.js` (engine-proven,
   W-RELAY/W-ERP-SYNC) into the live `crud_overlay.js` sidecar. Gives cross-device CONVERGENCE. This
   remains a real, unbuilt feature — the standing ⛔ from the original PoC, unchanged by this session.

Today, 10 users on 10 devices = 10 permanent forks, no convergence (S5, confirmed again in spirit by
this session's same-context finding at N=10). Documenting a "setup" for that would invent a capability
that does not exist (Prime Directive). The guide section is the POST-GATE deliverable, not a task for
this or any session until both items above are `✅ DONE (witness)`.

---

## §Results 2026-07-20 — `W-N10-CONCURRENT-TODAY` witnessed, REAL 10-tab browser run

**Witness:** `scripts/witness_e2e_n10_concurrent_today.js` (bim-compiler) — adapts
`witness_e2e_crud_blob_race.js`'s proven harness (real Playwright, one `BrowserContext`, real
`page.fill`/`page.click`, `§`-log capture) to **10 tabs** racing the SAME key: `c_order` id=101,
column `grandtotal`, live `bim-ootb/erp/idempiere.html` → real `crud_overlay.js`. All 10 tabs open
and hydrate BEFORE any edits (the S4 "Case 2" precondition, scaled 10x); each fills a distinct,
traceable value (`100000+i`); all 10 Saves fire via `Promise.all` with a 40ms-per-tab stagger so the
export()+put() traffic genuinely overlaps rather than running strictly serial. **New question beyond
S3/S4 (N=2):** does 10-way contention merely LOSE ops (clean last-write-wins) or can it CORRUPT the
IndexedDB blob (torn/unreadable)? Answered via TWO independent final reads on a fresh 11th tab: the
APP-PATH (`window.__crud.kernelDb()`, the same read S3/S4/S5 used — but this path silently falls back
to an EMPTY db on any constructor failure, `crud_overlay.js` `withSidecar` build(), so it alone cannot
tell "lost" from "corrupted") and a RAW-PATH (reads the raw `ArrayBuffer` straight out of IndexedDB and
reconstructs a DB from it using the page's own already-loaded `SQL.Database` constructor, bypassing
that fallback entirely — a constructor throw here is real, un-maskable corruption). Log:
`build/erp/witness_e2e_n10_concurrent_today.log` (2026 lines) — READ in full before this summary (Log
Mandate; grepped for `§N10`/`§CRUD-PERSIST`/`§CRUD-GATE`/🔴/🟢 to pull the signal out of ~2000 lines of
per-tab app-boot noise, all 10 tabs' boot sequences logged identically). Run: `bash
build/erp/run_witness.sh scripts/witness_e2e_n10_concurrent_today.js` — **exit 0, 5/5 harness
assertions PASS** (exit 0 is correct per this file's own header: loss is an EXPECTED finding, not a
harness failure — see the file's own exit-code contract).

```
§N10 tab=0 wrote=100000 committed=true   (repeats tab=1..9, ALL 10 committed=true)
...
§N10 tab=9 wrote=100009 committed=true
🟢 all 10 tabs individually reported a successful signed commit (own verifyChain=ok, own owner-gate PASS) — 10/10 committed=true
§N10-RAW bytes=20480 rawOps=1 ctorErr=none agreesWithAppPath=true (appOps=1)
§N10-FINAL survivors=1/10 chainValid=true tip=94ccf38442a1d1b949715f5240f7f808d1640ee9f0ef6bdba39b706acef811fd detail=winner=tab9 val=100009 rawCtorErr=none rawAppAgree=true
🟢 CLEAN: raw-path and app-path agree (1 op(s) persisted, no constructor error) — the blob is structurally VALID; this is loss-only (last-write-wins), not corruption.
```
Every one of the 10 tabs' OWN console independently reported `§CRUD-GATE ... verdict=PASS` and
`§KRN_CHAIN verify OK len=1` and `§CRUD-PERSIST ... sealed=1 verifyChain=ok` — all 10 users would have
seen a normal success, identical to S3/S4/S5's finding. **Only 1 of the 10 writes survived** (tab 9,
the last to fire in the stagger order) — 9 of 10 real, individually-signed, individually-chain-valid
commits are gone from the final state, with zero indication to any of the other 9 users. **The blob is
NOT corrupted**: raw-path reconstruction from the persisted bytes succeeded with no constructor error,
and its op count (`rawOps=1`) exactly agrees with the app-path's own read (`appOps=1`) —
`window.KernelOps.verifyChain()` on the final blob returns `ok=true len=1`, a clean, internally
consistent, tamper-evident chain. **Answer to the discovery question: loss-only, not corruption.**
10-way same-key contention scales the SAME clean last-write-wins mechanism S3/S4 found at N=2 — it
does not degrade into torn writes at N=10. This is consistent with IndexedDB's `put()` being
transactionally atomic by spec (no partial-write state is observable), which this witness now confirms
empirically at 10-way contention rather than assumes from the spec. **Net effect: 90% data loss at
N=10 (vs 50% at N=2), same mechanism, worse blast radius, still clean/silent, never corrupt.** This
sharpens (does not change) the case for gate item 1 in §Gate above — the failure mode gets worse with
more concurrent users, not different in kind.

This session made no product change, did not touch `ERPUserGuide.md`, and did not edit
`ERP_OPLOG_APPEND_ONLY_FIX.md`/`ERP_CRUD_OVERLAY_ONE_SOURCE.md`/`ERP_BUSINESS_CYCLE_E2E.md` (all owned
by concurrent sessions, read-only where read at all).

---

## §Relay Wiring 2026-07-20 — `W-N-CONVERGE` witnessed, S5 REVERSED (N=2 and N=10, real browser)

**Built on top of the append-only fix** (`fix/oplog-append-only`, commit `49798d2`, worktree
`/tmp/wt-oplog-append`, NOT pushed/merged) — this session layers the relay wiring onto the SAME branch,
per its own instructions, closing §Gate item 2 (the standing ⛔ from the original PoC and from
§N-User Concurrency).

**What was wired (all in the worktree, `erp/`):**
- `erp/erp_relay_client.js` and `erp/erp_sync_fsm.js` — copied in **byte-identical, unmodified** from
  `bim-compiler build/erp/` (the engine-proven push/snapshot/head client + the proven `rebase()` —
  rewind→apply-canonical-order→replay-pending→re-seal, W-RELAY/W-REBASE, `scripts/test_kernel_relay.js`/
  `scripts/test_kernel_rebase.js`). No merge/seal logic was reimplemented.
- `erp/erp_sync_relay.js` (NEW) — a thin, caller-agnostic transport module: reads `?relay=<url>` off the
  query string (same idiom as `?login=`/`?window=`/`?record=`), exposes `pushRows()` (fire-and-forget
  registration of just-committed ops with the relay, dedup by `op_uuid`), and mounts a minimal
  `#erp-sync-pill` button (opt-in — only appears when `?relay=` is present) that calls
  `window.__crud.syncNow()`.
- `erp/crud_overlay.js` — two additions: (1) `_sidePersist()` now also calls the new `_relayPush()` right
  after it appends to the local `ops` IndexedDB store — the "push after commit" leg. (2) a new
  `syncNow()` function (exposed as `window.__crud.syncNow` and `window.crudSyncNow`) that reuses
  `_withFreshSide`'s SAME cross-tab lock a commit already uses, calls `window.ErpSyncFSM.rebase()`
  **verbatim** against the freshly-hydrated sidecar + the relay client, then snapshots the merged
  canonical table (`K.allRowsPlain` — the SAME primitive F10's legacy-blob migration already uses) and
  appends it as NEW records into the append-only `ops` store (`K.appendOpsRecords`, `add()`-only, never a
  `put()`/blob overwrite) so a reload or sibling tab converges too.
- `erp/idempiere.html` — three new `<script>` tags after `crud_overlay.js` (`erp_relay_client.js`,
  `erp_sync_fsm.js`, `erp_sync_relay.js`). Inert with no `?relay=` param — zero behavior change from the
  append-only-fix baseline for every existing witness/user.
- `build/erp/erp_relay_server.js` (bim-compiler) used **as-is**, spun up as a real localhost HTTP server
  the Playwright-driven pages actually POST/GET to (CORS already handled by the server, unmodified).

**Witness:** `scripts/witness_e2e_n_converge.js` (bim-compiler, NOT yet committed — see §Boundaries note
below) — adapts `witness_e2e_multiuser_login_fork.js`'s S5 harness (real `browser.newContext()` ×N, real
`page.fill()`/`page.click()` on the live `?login=SuperUser&window=143&record=101` deep link, same
`c_order` id=101 `grandtotal` field) but points `ROOT` at the FIXED worktree
(`/tmp/wt-oplog-append`, not live `bim-ootb`) and appends `&relay=<url>` to the deep link. The Sync step
is a REAL `page.click('#erp-sync-pill')` — no `page.evaluate()` shortcut anywhere for a commit or a sync;
the only `evaluate()` calls read already-persisted state via `window.__crud.kernelDb()`/`core.tipValues()`
(same convention as S3/S4/S5). Run: `bash build/erp/run_witness.sh scripts/witness_e2e_n_converge.js`.

**N=2 result — exit 0, 10/10 🟢.** Log: `build/erp/witness_e2e_n_converge.log` (479 lines, read in full —
Log Mandate; 0 occurrences of 🔴, no thrown/timeout errors). Two SEPARATE `BrowserContext`s each save
`grandtotal` (ctx1=7777.77, ctx2=8888.88) — PRE-SYNC tips DIVERGE exactly as S5 found (the reproduced
baseline). Both auto-push on commit (`§SYNC_RELAY push accepted=1`). After clicking `#erp-sync-pill` on
both (then both again, mirroring `test_kernel_relay.js`'s own two-pass convergence dance):
```
§N-CONVERGE contexts=2 tipsEqual=true totalOps=2 lost=0
```
Both contexts land on the IDENTICAL tip (`bad6c4655e7d…`), both see `ops=2` (BOTH contributed ops
present — the union, not a last-write-wins loss), and the final `grandtotal` (8888.88, ctx2's op, later
in the relay's canonical order) is IDENTICAL on both sides — this is normal field-level resolution by a
shared total order, not data loss: the op-log itself retained both signed ops.

**N=10 result — exit 0, 34/34 🟢 (stretch goal, also clean).** `N_CONVERGE=10 node
scripts/witness_e2e_n_converge.js` (10 SEPARATE `BrowserContext`s, values `700000.00..700099.00`). Log:
`build/erp/witness_e2e_n_converge_n10.log` (2367 lines, read in full — Log Mandate; grepped, 0 occurrences
of 🔴, no THREW/Unhandled/TimeoutError; the only non-🟢 noise is pre-existing app-boot chatter identical
across all 10 tabs — `§SYSTEM-TENANT insert-fail … UNIQUE constraint` idempotent-seed messages and
`§BIM_OVERLAY none (NotFoundError)`, both present in the baseline app boot sequence, unrelated to this
change, same class of noise the prior `witness_e2e_n10_concurrent_today.js` (unfixed-regime) run also had
to grep past):
```
§N-CONVERGE contexts=10 tipsEqual=true totalOps=10 lost=0
```
All 10 contexts converge to the SAME tip, all 10 see `ops=10` (every one of the 10 contributed writes
present, zero lost) — a direct reversal of `W-N10-CONCURRENT-TODAY`'s 2026-07-20 same-context finding
(90% loss at N=10, unfixed regime) for the CROSS-DEVICE regime this session's wiring targets.

**Local commit:** `fix/oplog-append-only`, worktree `/tmp/wt-oplog-append` — the relay-wiring files
(`erp/crud_overlay.js`, `erp/idempiere.html`, `erp/erp_relay_client.js`, `erp/erp_sync_fsm.js`,
`erp/erp_sync_relay.js`) are committed on top of `49798d2`. **NOT pushed, no PR, no merge, no deploy**
(per this session's boundaries — the orchestrator pushes the whole append-only + relay story together
once the guide is written).

**§Boundaries note:** `scripts/witness_e2e_n_converge.js` and this dated section are the only bim-compiler
changes; per this session's instruction to commit ONLY on `fix/oplog-append-only`, the new witness script
is left **uncommitted** in the bim-compiler working tree (not a bim-ootb file, out of that branch's scope)
for the orchestrator to pick up alongside this file's edit.

**Known simplification, named honestly (not hidden):** `ErpSyncFSM.rebase()` is reused verbatim and only
reads/writes the 6 core columns (`op_uuid,timestamp,op_type,parameters,input_guids,output_guid`) — a
rebase drops `gid`/`branch_id` (DocAction op-groups un-group after a sync) and re-signs every op under
the LOCAL device's own signer key (a `sig` cannot survive a canonical re-`id`, the same limitation
`test_kernel_relay.js`'s own proven rebase already has — full per-device signature attribution needs the
opt-in T2 content-addressed `_sigv:2` scheme, not wired here, out of this session's scope). Neither
affects this witness's `c_order.grandtotal` single-field-edit shape (no groups involved), but a future
session wiring a DocAction (Complete/Close) through this same relay path should know groups don't survive
a rebase today.

---

## §DocAction Cross-Device Attribution (2026-07-21) — SPEC for the guide's own named gap

`ERPUserGuide.md`'s "Working at the same time" section (written 2026-07-20, `feedback_user_guide_quality_bar`
discipline: don't promise what isn't built) says outright: *"Cross-device Sync is proven today for field
edits... It does not yet carry full per-person, per-step attribution of document actions... across
devices... that is the next piece we are building (opt-in per-step signing)."* This section specs that
piece, closing the loop the doc opened. **Extraction only below — nothing invented; two ALREADY-BUILT,
ALREADY-WITNESSED primitives exist in bim-ootb and are simply not wired to the ERP-relay path yet:**

1. **Per-device signing already exists and is LIVE today.** `erp/erp_signer.js` mints one real ECDSA
   P-256 keypair per device (non-extractable private key, IndexedDB custody, `installSigner()` called
   from `idempiere.html:536`'s script load), and `KernelOps.setSigner()` wires it in — `sealChain`
   signs each new op, `verifyChain` checks it (`kernel_ops.js:181-203,282-297,589-606`). This is real,
   proven, per-device — it is NOT invented for this spec.
2. **Multi-device roster verification already exists and is ALREADY WITNESSED — for a DIFFERENT sync
   path.** `erp/erp_key_epochs.js` (ported from `scripts/poc_rotate.js` W-ROTATE, `DistributedERP.md`
   §228/§290/§445) is an HQ-signed device roster + key-epoch map (ROTATE/REVOKE, burn-not-reattribute),
   `verifyEpochSigsOps(ops, {roster})` walks a log verifying each op under the KEY THAT WAS ACTIVE AT
   ITS SEQUENCE — exactly "who really signed this DocAction step, on which device" — witnessed 9/9 in
   `erp/tests/witness_roster_verify.js` (`§RV-ROSTER/§RV-ROTATE/§RV-HISTORY/§RV-FUTURE/§RV-REVOKE/
   §RV-RENUMBER-EPOCH/§RV-IMPORT-FORGE/§RV-IMPORT-RENUMBER`). **But it is wired ONLY into
   `teams/erp/erp_sync.js`'s `importBranch` (`opts.roster`, line ~69) — the Teams transport — never
   into `erp_sync_fsm.js`'s `rebase()` / `erp_sync_relay.js`'s `syncNow()`, the ERP-relay path this
   guide's section actually documents.** Two separate sync stacks in this codebase; the attribution
   primitive was built for one and not ported to the other.
3. **The actual gap, precisely located:** `erp_sync_fsm.js` `rebase()` (`erp/erp_sync_fsm.js:167-184`)
   does `SELECT op_uuid,timestamp,op_type,parameters,input_guids,output_guid` (6 columns — no `sig`,
   `gid`, or `branch_id`), `DELETE FROM kernel_ops`, then re-`INSERT`s only those 6 columns per canonical
   row. Consequence, read directly off this code (not assumed): every rebased op arrives with `sig=NULL`
   and `gid=NULL`; `kernel.sealChain(db)` then signs every row lacking a sig (`kernel_ops.js:293`,
   `if (_signer && !sig)`) — which after a rebase is now ALL of them — under the PULLING device's own
   key. The pulling device's chain becomes internally valid and single-key-verifiable, but the
   ORIGINAL per-device authorship of every op that came from elsewhere is destroyed, and any op that
   was part of a DocAction fan-out group (`commitGroup(db, groupOps, {gid})`, `crud_overlay.js:1906`,
   `foldBackGroup`, `crud_overlay.js:473-495`) loses its `gid` and un-groups into independent ops — a
   Complete's ship+invoice+status no longer fold/undo together after a sync.
4. **No `signed_by`/kid field is stamped on ops today at all.** `erp_key_epochs.js`'s epoch walk reads
   `p.signed_by` out of `op.parameters` (`erp_key_epochs.js:104`) — a per-op field the Teams import path
   presumably relies on its callers to stamp, but `crud_overlay.js`'s `_commitMeta()` (line 323-326) only
   ever adds `{branch_id}` (Blue Future); no code path stamps `signed_by` into a live-UI-committed op's
   parameters. Wiring the roster verifier onto the ERP-relay path needs this stamped first — it is not
   an oversight in the roster module, it is simply not called yet from this write path.

> ⚠ **CITATION CORRECTION 2026-07-21 — found while implementing S7, before any code was written for it.**
> Point 1 above ("per-device signing already exists and is LIVE today") is **wrong for the two files this
> whole lane is about.** `erp/erp_signer.js` defines `window.ErpSigner` and IS `<script>`-loaded by both
> `erp/idempiere.html:536` and `erp/glassbowl.html:870` — but **neither page ever calls
> `ErpSigner.installSigner(KernelOps)`** (grep-confirmed across both files, this session). `installSigner()`
> IS called on other pages (`erp/erp.html:224-226`, `erp/kanban_lens.html:245`, `erp/kanban_host.js:66`,
> `erp/rule_fold.js:85`, `erp/period_close_ui.js:46`, `erp/spike_writepath.html:77`) — just not the live
> product UI. Consequence, read directly off `kernel_ops.js`: `_signer` stays `null` on `idempiere.html`/
> `glassbowl.html` forever, so `sealChain`'s `if (_signer && !sig)` never fires (every `sig` column is
> permanently NULL) and `verifyChain`'s `if (_signer && !(await _signer.verify(...)))` never fires either —
> **the live product signs nothing and verifies no signature today,** running on chain-hash tamper-evidence
> only (real and already proven, `§CRUD-PERSIST ... verifyChain=ok` throughout this whole lane's witnesses —
> but hash-chain integrity ≠ signature authenticity; the guide's "steps are re-signed under the receiving
> device's key" phrasing describes what a REBASE would do to a sig IF one existed, which today it doesn't).
> This makes Phase 1 below one step earlier than originally scoped: install the signer before anything can
> be preserved through a rebase at all.

### §Spec (falsifiable, continuing the S-numbering above)

- **S7 (Phase 1 — install the signer + turn on v2 content-signing + rebase preserves attribution).**
  `idempiere.html` calls `ErpSigner.installSigner(window.KernelOps)` on boot (the same best-effort,
  non-blocking idiom `erp.html:224-226` already uses — copy, not invent) followed by
  `KernelOps.setContentSigning(true)` (already proven safe — `witness_t7_incremental.js:125` calls this
  as "production posture since T2/#630"; v2 is required because a v1 sig attests the position-dependent
  chain hash, `_sigBase`, `kernel_ops.js:238`, which CANNOT survive a rebase's reorder by construction —
  only a v2 content-hash sig can). After two devices each commit a DocAction Complete (a real
  `commitGroup` fan-out, `gid` set) and both relay-sync via `syncNow()`, a rebased device's `kernel_ops`
  table for BOTH devices' ops shows: (a) `gid` intact — `foldBackGroup` undoes the whole group, not one
  row; (b) every op's `sig` is non-NULL and IDENTICAL to what it was before the rebase — `sealChain`
  does not re-sign a row that already has one (`kernel_ops.js:293`); (c) `verifyChain` still reports
  `ok:true` post-rebase (proving the preserved v2 sig actually still verifies against the recomputed
  chain, not just that the bytes didn't change). (Falsifies to: `gid` NULL post-rebase — breaking group
  fold/undo across a sync — or `sig` changed/reset/failed-verify, meaning attribution was destroyed.)
- **S8 (Phase 2 — roster-gated verify on the ERP-relay path, reusing `erp_key_epochs.js` as-is).** Given
  two devices, each with its own real `erp_signer.js` keypair and a `signed_by` kid stamped on its own
  ops (the one new stamp needed, added to `_commitMeta()` or the kernel's own op-stamp path — NOT a new
  crypto primitive), and a roster object `{device_id→pubJwk, genesisKid}` available to both (constructed
  directly in the witness for S8, exactly as `witness_roster_verify.js` already does — HQ-signed roster
  DISTRIBUTION over the relay is explicitly Phase 3, not attempted here), `erp_key_epochs.verifyEpochSigsOps`
  run against the POST-REBASE canonical log on either device returns `ok:true`, correctly attributing
  each op to its real originating device's kid — not the puller's. (Falsifies to: verification fails, or
  every op attributes to one device regardless of who actually signed it.)
- **S9 (regression).** `witness_roster_verify.js` (Teams path) and `witness_e2e_n_converge.js` (ERP-relay
  path, N=2/N=10) both continue to PASS unmodified — S7/S8 add columns/stamps, they do not change either
  existing sync stack's already-witnessed behavior.

### §Explicitly NOT this spec (named so no session re-derives it as missing)

- **Phase 3 — HQ-signed roster DISTRIBUTION over the ERP relay** (so two real devices that have never
  met learn each other's pubkeys/kids without an out-of-band step) is a real, separate, larger feature —
  the relay today (`erp_relay_client.js`/`erp_relay_server.js`) only ever moves ops, never a roster
  object. S8 constructs its roster directly (test-only), matching how `witness_roster_verify.js` already
  does it for the Teams path. Roster distribution is the next-next gate, not this one.
- **ROTATE/REVOKE UI** (a user-facing "rotate my device key" or "revoke a lost device" gesture) — the
  engine primitive is proven (`§RV-ROTATE`/`§RV-REVOKE`), no UI exists on either sync stack; out of scope.
- Rewriting `ERPUserGuide.md`'s honest-limit callout — stays exactly as written until S7 AND S8 are both
  `✅ DONE (witness)`; per this project's own §Gate convention (`§N-User Concurrency` above), the guide
  update is the POST-GATE deliverable, not a task for the session that specs or partially lands this.

### §Results 2026-07-21 — S7 `W-REBASE-ATTRIB` witnessed, REAL 2-context browser run — ✅ DONE

**Built:** branch `fix/rebase-preserves-sig-gid`, worktree `/tmp/wt-rebase-sig` (bim-ootb, off `origin/main`
— PR #928/W-SO-CHILD-BIND already merged in, confirmed at HEAD). Three files, three separate divergent
copies of the SAME 6-column mapping bug, found one at a time by actually running the witness rather than
assumed from a single read:
1. `erp/idempiere.html` — now calls `ErpSigner.installSigner(window.KernelOps).then(() =>
   KernelOps.setContentSigning(true))` on boot (copy of `erp.html:224-226`'s idiom). **Was never called at
   all** — corrected mid-implementation (see the CITATION CORRECTION above); the live product signed
   nothing before this.
2. `erp/erp_sync_fsm.js` `rebase()` — SELECT/INSERT now carry `gid`/`branch_id`/`sig` (were silently
   dropped, blanking every rebased op's group + signature).
3. `erp/erp_sync_relay.js` `pushRows()` — **found only by running the witness**, not by the initial read:
   an INDEPENDENT whitelist at the push boundary (before an op ever reaches the relay) was ALSO dropping
   the same three columns — fixing #2 alone was not sufficient, since rebase() can only preserve what the
   relay's canonical snapshot already contains, and this function is what puts ops into the relay. A third
   divergent copy of the identical 6-column list, matching this whole lane's own recurring pattern ("3
   divergent bubble-era copies", commit `53c07ccb0`).

**Witness:** `scripts/witness_e2e_rebase_attrib.js` (bim-compiler) — two SEPARATE Playwright
`BrowserContext`s, real `?login=SuperUser&window=143&record=101&relay=<url>` deep link, real
`page.fill()`/`page.click()` Save + real `#erp-sync-pill` click (same harness shape as
`witness_e2e_n_converge.js`). Run: `WITNESS_ROOT=/tmp/wt-rebase-sig bash build/erp/run_witness.sh
scripts/witness_e2e_rebase_attrib.js` — **exit 0, 27/27 🟢** (log: `build/erp/witness_e2e_rebase_attrib.log`,
read in full — Log Mandate, 0 occurrences of 🔴).

```
🟢 ctx=1 real ECDSA-P256 device signer installed on boot (was never called before this fix)
🟢 ctx=1 PRE-SYNC — committed op has a non-NULL gid / non-NULL sig / verifyChain ok
🟢 POST-SYNC — both contexts converge to the IDENTICAL signed chain tip
🟢 ctx=1's op keeps its ORIGINAL gid on ctx=2 (group survives rebase)
🟢 ctx=1's op keeps its ORIGINAL sig on ctx=2 (not blanked/re-signed under the puller's key)
🟢 ctx=1 POST-SYNC verifyChain correctly FAILS on the PEER device's foreign-keyed sig (names the S8 gap)
```

**Honest correction to S7's own falsification clause, found only by running it:** the spec above predicted
POST-SYNC `verifyChain` would report `ok:true` once a v2 sig survives a rebase. It does NOT, and that
turned out to be the CORRECT, expected outcome, not a defect: `verifyChain`'s `_signer.verify()` is a
**single per-device signer** — ctx1's installed key can only verify signatures ITS OWN private key made.
Once ctx2's real signature genuinely survives onto ctx1's device (proven — gid/sig byte-identical
pre/post-sync, 8/8 preservation assertions 🟢), ctx1's `verifyChain` correctly reports `{ok:false,
why:'group torn', opFail:'signature'}` on that foreign op — it has no way to know ctx2's public key. Before
this fix, `verifyChain` trivially reported `ok:true` everywhere (no sig ever survived a rebase to disagree
with, and no signer was ever installed at all) — this fix does not regress that into a new bug; it makes
the REAL, previously-invisible gap visible: **cross-device attribution needs `erp_key_epochs.js`'s
roster-gated verify (checks each op under the key that actually signed it) wired onto this path — exactly
S8, not yet built.** The witness's own final assertion was corrected in-session to test for this exact
failure shape rather than the originally-predicted (wrong) `ok:true`.

**State:** landed — `fix/rebase-preserves-sig-gid` merged via
[bim-ootb PR #930](https://github.com/red1oon/bim-ootb/pull/930) (auto-merge, same pattern as PR #928).

### ⚠ §Spec CORRECTION 2026-07-21 (found by probing before implementing S8, not assumed) — S8 as originally
### written CANNOT use `erp_key_epochs.js`'s `verifyEpochSigsOps` as-is

S8's original wording said "reusing `erp_key_epochs.js` as-is." **That is wrong — verified by a standalone
probe (`node` script, `erp_key_epochs.js` + `kernel_ops.js` loaded directly, no browser) before writing any
production code for it.** `verifyEpochSigsOps`'s walk (`erp_key_epochs.js:100-131`) enforces a SINGLE
`activeKid` at every position in the log: a normal op's `signed_by` MUST equal the current `activeKid` or
it is REJECTED outright (`'op signed by non-active key ... — superseded key cannot sign new ops'`,
line 127) — the ONLY way a second key becomes valid is an explicit `ROTATE` op counter-signed by the
outgoing key. Probe result, two devices (`DEV_A`, `DEV_B`) each committing one op, NO rotation between
them (exactly what two real concurrent devices produce once the relay merges their independent commits):
```
§EPOCH verify FAIL at id=2 why=op signed by non-active key DEV_B (active=DEV_A) — superseded key cannot sign new ops
```
**This module is a single-writer KEY-ROTATION/REVOCATION trust root** (device handoff, compromise
recovery — its actual, correct, already-witnessed job for the Teams `importBranch` path, where one branch
genuinely has one signer at a time). It is architecturally NOT a multi-device concurrent-attribution
verifier. Wiring it onto the ERP-relay path as S8 originally imagined would have REJECTED every op from
whichever device didn't happen to be `genesisKid` — actively breaking the N-device convergence
`witness_e2e_n_converge.js`/`W-N10-CONCURRENT-TODAY` already proved works. This is exactly the kind of
mismatch this project's own `feedback_verify_branch_conditions_before_applying_convention_fix.md` discipline
exists to catch — grep memory / probe the actual code before porting a convention, don't assume "the
primitive that solves signing" solves EVERY signing-shaped problem.

**Corrected S8: a NEW, much simpler per-op independent verifier** — `erp_key_epochs.js`
`verifyMultiDeviceOps(ops, {pubByKid, verify})`. No `activeKid`, no `ROTATE`/`REVOKE` state machine: each
v2 (content-signed) op's `signed_by` kid is looked up directly in the roster and its sig is checked against
THAT kid's own pubkey, independent of every other op's signer — the correct model for "N devices, all
simultaneously valid, in any relay-merged order." `ROTATE`/`REVOKE`/`verifyEpochSigsOps` are UNTOUCHED and
remain correct for their own single-writer-handoff use case (Teams `importBranch`) — this is an ADDITION,
not a replacement.

**Also newly required (not previously named):** no code path stamps `signed_by` into a live op's
`parameters` at all — `kernel_ops.js`'s `_stampSigv()` (the existing, proven, additive seam that already
stamps `_sigv:2`) needs `setSigner(signer, kid)` to accept the device's own kid (its `pubKeyHex`, already
computed by `erp_signer.js installSigner()`) and stamp `signed_by:kid` alongside `_sigv:2` — same pattern,
same seam, no new call sites in `crud_overlay.js`.

### §Results 2026-07-21 — S8 (corrected) `W-MULTI-DEVICE-VERIFY` witnessed, REAL 2-context browser run — ✅ DONE

**Built** on top of `fix/rebase-preserves-sig-gid` (same worktree/branch, PR #930 landing separately for
S7 — S8 layered on before the PR merged, so it ships in the same PR): four small, additive changes, each
probed/tested standalone BEFORE wiring into the full browser witness (cheap `node` probes caught the
architecture mismatch above AND confirmed the corrected design, before any Playwright run):
1. `erp/kernel_ops.js` — `setSigner(signer, kid)` now takes an optional second arg, stored as
   `_signerKid`; `_stampSigv()` stamps `signed_by:kid` alongside `_sigv:2` (same additive gate, only for
   v2 rows — a v1 sig can't survive a rebase regardless, so attribution would be moot).
2. `erp/erp_signer.js` `installSigner()` — exports the public key as BOTH the existing SPKI hex
   (`API.pubKeyHex`, used as the stable `signed_by` kid) and, newly, JWK (`API.pubKeyJwk`, the verifiable
   key material a roster needs — `erp_snapshot_sign.js verifyTip` imports JWK, not the SPKI hex).
3. `erp/erp_key_epochs.js` — NEW function `verifyMultiDeviceOps(ops, {roster, verify})`: per-op
   INDEPENDENT verification (each op's `signed_by` kid looked up directly in a flat roster, sig checked
   against that kid's own pubkey) — no `activeKid`, no rotation state, the corrected model for N
   simultaneously-valid devices. `verifyEpochSigsOps`/`verifyEpochSigs`/`ROTATE`/`REVOKE` are UNTOUCHED,
   confirmed by re-running `witness_roster_verify.js` unmodified — exit 0, ALL PASS, 0 🔴 (S9 regression).
4. Node-side-only roster verification in the witness (Phase 3 — HQ-signed roster DISTRIBUTION over the
   relay — stays explicitly out of scope; the witness constructs the roster directly, same convention
   `witness_roster_verify.js` already uses for the Teams path). No new `<script>` tag added to
   `idempiere.html` — the STAMPING is live (via #1/#2), the VERIFYING is witness-side for now.

**Witness:** `scripts/witness_e2e_rebase_attrib.js` extended (same file, same 2-`BrowserContext` harness
as S7) — captures each context's real `pubKeyHex`/`pubKeyJwk`, and after the real sync/rebase, runs
`verifyMultiDeviceOps` against the POST-SYNC merged log on BOTH sides. Run: `WITNESS_ROOT=/tmp/wt-rebase-sig
bash build/erp/run_witness.sh scripts/witness_e2e_rebase_attrib.js` — **exit 0, 37/37 🟢** (log read in
full — Log Mandate, 0 occurrences of 🔴).

```
🟢 ctx=1 S8 — roster-gated multi-device verify passes on the POST-SYNC merged log (real content-sig, real ops, both concurrently-active devices)
🟢 ctx=1 S8 — all 2 ops correctly attributed (none anonymous)
🟢 ctx=1 S8 — the 2 attributions resolve to 2 DISTINCT devices (not all collapsed onto one puller's key, the pre-S7 failure mode)
🟢 ctx=1 S8 NEGATIVE — a tampered roster entry (wrong pubkey for a real kid) is REJECTED, not silently accepted
```
(identical 4 assertions repeat for ctx=2, reading the SAME merged log from the other side)

**Net result — the loop the guide opened is closed, honestly:** `ERPUserGuide.md`'s "Working at the same
time" section named "opt-in per-step signing" as the next piece for cross-device DocAction attribution.
That piece is now built and witnessed: two real devices, real UI clicks, real relay sync, real signatures
— each op is correctly, verifiably attributed to the device that actually signed it, post-sync, on both
sides, with a tampered attribution correctly rejected. `verifyChain`'s own single-signer check still (and
correctly) cannot do this itself — `verifyMultiDeviceOps` is the piece that closes it, reusing
`erp_key_epochs.js`'s existing content-hash/roster-verify primitives rather than inventing new crypto.

**What's still explicitly open (named, not silently dropped):**
- **Phase 3 — HQ-signed roster DISTRIBUTION over the relay.** Two devices that have never met still need
  an out-of-band step to learn each other's `pubKeyJwk`. Not attempted here, same as originally scoped.
- **Wiring `verifyMultiDeviceOps` into the live UI** (a real "Verify attribution" affordance, or an
  automatic check on `syncNow()`) — today it only runs witness-side. A live wiring is a UI/UX decision
  (where does a failed attribution surface to a user?), not assumed here.
- **DocAction group attribution specifically** (Complete/Void/Close, not just a field edit) — this
  witness proves the mechanism on a `CRUD_UPDATE`; a DocAction's `commitGroup` fan-out uses the exact same
  `_stampSigv`/`signed_by` seam (proven generic, not table-specific), so the mechanism transfers, but has
  not been separately witnessed on a real DocAction Complete click (blocked, unrelated: the DocAction CO
  button doesn't currently render on this build's Sales Order, per `ERP_BUSINESS_CYCLE_E2E.md`).

**Guide update:** still NOT touched this session — per §Gate, the guide update is the deliberate next
step now that both S7 and S8 are `✅ DONE (witness)`, not a byproduct of landing them.
