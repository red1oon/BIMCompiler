# Legacy-as-Oracle Adapter — a small contract for migrating, testing and reverse-engineering an ERP

> **Status: published draft, 2026-10-10 (v0.1).** A specification and a first measured result, not a finished product — read §11 (limits) and §12 (prior art) before citing.
> Every number below was measured on a **local pilot copy of iDempiere** (GardenWorld seed), not on a customer system. Where something is not
> proven, it is said so in §11. Full working record: `prompts/SQLiteIDEMPIERE.md` (§-numbers cited below). Reference code: `scripts/bridge/`.

## 1. The idea in one paragraph

When you replace an ERP, the old system already knows the right answers — it has decades of business rules inside it. Instead of writing the new system's tests from
your own expectations (which share your blind spots), **feed the same facts to both systems and let the old one be the judge.** The only piece you need per legacy
system is a thin **adapter**: a way to submit documents *as a normal user* and read results back. The adapter is a fixed contract; a new business document is added
as **data** (a descriptor plus web-service configuration), not as code. Every difference between the two systems is then a **numbered, classified, reversible** finding.

## 2. Roles and the one rule

| Role | Meaning |
|---|---|
| **Legacy** | The system being replaced. Stays in use. Is the **oracle**. Is never modified except through its own legal door (its web services). |
| **New system** (here: a SQLite kernel) | The system being built. Does the daily work; its results are re-created in legacy so both systems end with the same books. |
| **Adapter** | The contract in §3. Carries facts from the new system to legacy and brings results back. |

> **Cardinal rule.** The new system must be **indistinguishable** from legacy: same operations, same results, same books, same look and feel.
> A difference is never "a legacy quirk we choose not to copy"; the only remedy is to change the new system. An exclusion exists **only** if the owner exempts it in their
> own words, recorded with a date. The runner enforces this: a quirk entry without an `exemption` is refused (`§QUIRK_REFUSED`) and the difference stays a gap.

Why strict: the aim is *zero impact on users*. Any accepted divergence is, by definition, an impact.

## 3. The adapter contract

Six calls. Nothing in them knows what an order, an asset or an invoice *is*.

| Call | Direction | Guarantee |
|---|---|---|
| `submit(descriptorName, payload[, uid])` | new → legacy | **Local-first.** Queues the document; makes **no** network call. |
| `drain()` | new → legacy | Sends queued documents **in order, one transaction each** (header + lines + doc-action in a single server call). Never auto-resends a send whose outcome is unknown (§6). |
| `baseline(rules)` / `pull(rules)` | legacy → new | Reads what legacy users did since the last point, fetches the whole document, hands it to the new system's own rule (`rules.apply`). **Exactly once** per legacy document; the adapter's own documents are not echoed back. |
| `read(readType, filter)` | legacy → new | Read-only rows through a read-only web-service type. |
| `compare(scenarios, spec, quirks)` | both | The differential runner (§5). |
| `status()` | local | Outbox / inbox state for any UI. |

Properties the contract fixes (all witnessed, §11):
- **Transport allow-list.** Only the legacy system's stock web-service operations are used. No SQL, no custom tables, no plugin is required on legacy.
- **Stateless login on every call**, credentials held only by the adapter, failures typed (§6).
- **Isomorphic.** No Node-only module at top level; persistence is injected (file path or `{load(), save(bytes)}` adapter, e.g. IndexedDB/OPFS in a browser).
- **Frozen.** Adding a model must not change the adapter's code (checked by a witness that diffs the adapter files).

## 4. A model is data: the descriptor

Header + optional lines + doc-action is the common shape of document models. The descriptor says how a payload maps onto it:

```json
{ "composite": "<registered composite web-service type>",
  "header":    { "serviceType": "BridgeCreateMovement", "table": "M_Movement",
                 "fields": { "C_DocType_ID": {"const": 143}, "MovementDate": {"path": "date"}, "Description": {"path": "note"} } },
  "lines":     { "serviceType": "BridgeCreateMovementLine", "table": "M_MovementLine", "parent": "M_Movement_ID",
                 "from": "lines", "lineNo": {"col": "Line", "step": 10},
                 "fields": { "M_Locator_ID": {"path": "from"}, "M_LocatorTo_ID": {"path": "to"},
                             "M_Product_ID": {"path": "product"}, "MovementQty": {"path": "qty"} } },
  "docAction": { "serviceType": "BridgeCompleteMovement", "table": "M_Movement", "action": "CO" },
  "expect":    { "serviceType": "QueryMMovement", "cols": { "DocStatus": {"const": "CO"} } } }
```

- Values are `const` or `path` into the payload. **Nothing is invented**: a missing path is an error, not a default.
- Parent links are resolved *inside* the server transaction (`@<Table>.<Table>_ID`), so a failing line leaves **nothing** behind (measured: `@IsRolledBack:true`, document count unchanged).
- `expect` is a read-back check against legacy; a mismatch marks the document `DIVERGED`, never silently fixed.
- The legacy side of a model is **web-service configuration** (types, field whitelists, role access) — about 30 lines of SQL on the iDempiere pilot; the file doubles as the proposal text for the legacy administrator.

## 5. Differential runner: normalise, compare, classify

Each scenario supplies `facts`, a `legacy(facts)` and a `local(facts)` adapter function. Each returns a **flat result**: `{ key: scalar }` — e.g. `docstatus`, `lines`
(product:qty:amount), `total_cents`, `shipments`, `invoices`, `stock_delta`, `postings` (account:Dr/Cr, folded per account), `postings_shipment`, tax keys. The runner compares
a declared list of keys and classifies:

| Verdict | Meaning | Action |
|---|---|---|
| `MATCH` | Equal on every compared key. | Keep as a regression scenario. |
| `SQLITE-GAP` (new-system gap) | Legacy's result differs. | **Fix the new system**; the scenario that exposed it is the regression test. |
| `LEGACY-QUIRK` | Legacy misbehaves **and the owner exempted it** (words + date + evidence). | Recorded; otherwise refused. |
| `INCONCLUSIVE` | A side cannot produce its reference (e.g. legacy's own posting errored). | Listed, never counted as a pass or a gap. |
| `ERROR` | A harness fault, not a verdict about the new system. | Fix the harness. |

Rules of evidence: a key not yet comparable is **listed** (`§SCN_NOT_COMPARED`), never skipped silently; every comparison has a **negative control** (a deliberately wrong new-system result must be caught);
a run prints `INCONCLUSIVE`, not `PASS`, when nothing was judged.

## 6. Failure semantics (what makes it safe to re-run)

| Failure | Type | State | Behaviour |
|---|---|---|---|
| Server unreachable / refused connection | `NOT_SENT` | stays `QUEUED` | retry with a cap, then `PARKED`; nothing lost |
| Timeout or reset after the call began | `AMBIGUOUS` | `PARKED` | **never auto-resent** (undecidable ⇒ park, not guess) |
| Bad credentials | `AUTH` | stays `QUEUED` | the whole drain stops after **one** attempt (no lock-out loop) |
| Server validation / business refusal | `FAULT` / `IsError` | `REJECTED` + server text | later documents still flow (no poison message) |
| Crash while sending | — | `SENDING` found at start ⇒ `PARKED` | the state is persisted *before* the call |

The id map keeps legacy's identifiers and document numbers next to the new system's own; they are linked, never forced equal.

## 7. Coming back: the change feed

For the reference implementation the feed is iDempiere's own `AD_ChangeLog`, read through a read-only web-service type: a watermark on the change id, a **trailing re-read window**
(a lower id can commit after a higher one — a negative-control witness shows a zero-width window misses it), de-duplication on (change id, column), grouping per record save,
and detection of a document reaching a target status. Documents are fetched whole and replayed through the new system's own rules, not copied as rows. A **baseline** step sets the starting point
without replaying history. Any ERP with a comparable feed (updated-since query, audit table, event stream) can supply the same four functions.

## 8. Dictionary diff and the triage loop

Most "differences" in a faithful rebuild are not rules but **data**: configuration rows, dictionary metadata, missing columns. `dict_diff` reads the same dictionary rows from legacy and from the new system
and, from the **legacy values**, emits a reviewable patch: `INSERT … WHERE NOT EXISTS`, `UPDATE`, and `ALTER TABLE … ADD COLUMN` guarded by a schema check. It **never deletes**.
Look and feel is treated the same way when the UI is generated from the dictionary: window / tab / field / column metadata is compared and counted as "X of N windows identical" — numbers, not screenshots.

Triage after each run: **DATA/SCHEMA** gaps → generate and apply the patch, re-run; whatever remains is a **RULE** gap → a person decides nothing (the cardinal rule decides): extract the rule from the legacy source or
documentation with a citation, implement, prove no regression (existing tests identical before and after), commit with a short decision record that can be reverted in one step.

## 9. Porting the adapter to another ERP

| You provide | Notes |
|---|---|
| Transport | A programmatic way to create records **as a normal user** and read results back (SOAP/REST/OData/RPC). Direct DB access alone lets you compare outcomes but not drive inputs. |
| Typed failures | Map the system's errors onto the §6 types. |
| Read types | Read-only queries for documents, postings, stock, dictionary tables. |
| Change feed | The §7 four functions (or run in "compare-only" mode without DOWN). |
| Normalisers | Turn each system's result into the flat keys of §5. |
| Descriptors | One per model, as data (§4). |

Everything else — queueing, parking, ordering, de-duplication, the runner, the classification, the logs, the patch generator — is reused unchanged.

## 10. Reference implementation

`scripts/bridge/` — `legacy_link.js` (the facade), `ad_client.js` (iDempiere ADInterface transport, composite = one server transaction), `store.js` (outbox, state, id map, inbox), `doc_writer.js` (descriptor → operations),
`pusher.js`, `changelog_tracker.js`, `replay.js`, `reconcile.js`, `dict_diff.js`, `check_genericity.sh` (the layer files must contain no application words), `run_all.sh` (runs every witness, persists the log, prints the triage line).
Pilot configuration SQL: `scripts/bridge/pilot/`. Run: `scripts/bridge/run_all.sh` against a local iDempiere copy; read the `§` lines, not the exit code.

## 11. What has been measured (local pilot, 2026-10-09/10) — and what has not

| Claim | Evidence |
|---|---|
| Legacy-as-oracle finds what self-referential tests miss | The new system's existing test suite (99 witnesses re-run around each fix) was green throughout, while the differential runner found **12 rule/data gaps that were then fixed** (shipment cost-of-goods posting; deliver-later shipment; void and its tax reversal; credit hold; costed-quantity refusal; period control; price-list version by date; stray accounting schema; tax; second-currency books; zero/negative quantity). Each has a numbered decision record (`SQLiteIDEMPIERE.md` §27, §30, §33–§50). |
| Model-as-data | A second model (Inventory Move) ran through the unchanged adapter with ~30 lines of configuration SQL and a ~10-line descriptor: legacy movement completed, stock moved between locators, a bad line rejected atomically (`§55`). |
| Atomicity | A failing line returned `@IsRolledBack:true`; legacy document count unchanged. |
| Re-run safety | Crash after the server committed ⇒ document parked, **0 resends, 0 duplicates**; unreachable server ⇒ queued, capped, nothing lost; bad password ⇒ one attempt. |
| Look and feel, dictionary level | 350 of 370 windows identical to legacy before patches, 370 of 370 with the generated patches (scratch copy). |
| Enforcement | A quirk without an exemption is refused (control both ways). |

**Not proven / limits (read these before relying on it):**
- The scenario corpus is small (about 20 scenarios; the pilot has 34 document tables plus masters and reports). Coverage is only as wide as the scenarios — **unknown unknowns stay unknown**.
- Only what is reachable through the web services is tested: reports, print layouts and screen *runtime* behaviour (callouts, display logic, defaults) are not measured.
- The oracle was a local copy of the demo dataset, not a production-sized or production-configured system. Volume, concurrency and performance are untested.
- Following the cardinal rule means copying legacy's behaviour, **including its defects**, unless the owner exempts them.
- Header-only masters and three-level documents (batch → journal → line) need small additions to the descriptor model; not built.
- Delivery of the fixes into the shipped application, and running the adapter inside a browser (CORS, packaging), are not done.

## 12. Prior art

No prior-art search has been done for this document. The ingredients are established techniques — differential testing, golden-master / characterization testing, shadow or parallel running, the strangler pattern, anti-corruption layers.
The claim worth testing is the **combination**: a minimal fixed adapter contract, models added as data, an enforced no-divergence rule with a refusal mechanism, and a measured gap ledger. Do not describe it as novel before a search is made.

---
*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
