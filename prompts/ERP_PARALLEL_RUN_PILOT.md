# ⚠ DO NOT REMOVE
**Scope:** Parallel-run pilot — a real customer's iDempiere database (one past year, ~100 users, with plugins) run
side by side on this machine: real iDempiere = the reference, our local-first ERP = under test. Measures how
close we are to "as solid as iDempiere" on REAL data, and ranks the porting backlog by real usage.
**Law:** `CLAUDE.md §AD-LAYER LAW` (generic AD engine, X-of-N, witness what the user sees). Ledger baseline:
`docs/internal/ERP_EQUIVALENCE_LEDGER.md §PORT-COVERAGE`. Read the log after every run — exit code is not evidence.
**Data rule:** customer data stays on THIS machine. Never commit it, never push it to GitHub/OCI, never publish it in
an artifact. Logs carry ids and totals, never names. Email backups are encrypted before they leave.
Honour this block until every item is ✅ DONE (witness) or ⛔ BLOCKED.

# ERP PARALLEL-RUN PILOT (spec 2026-10-04)

## §0 Inputs (from red1)
| # | Input | Status |
|---|---|---|
| I1 | `pg_dump` of the customer DB (one past year) | ⛔ awaiting |
| I2 | iDempiere version (exact build) | ⛔ awaiting |
| I3 | Plugin jars + source if available | ⛔ awaiting |
| I4 | User mix: users per window / role, peak concurrency | ⛔ awaiting |

## §1 Reference stand-up
Restore I1 into a NEW database in the local `postgres` container (never over `idempiere`). Run the matching
iDempiere server (I2) with the plugins (I3) installed. Witness `§PILOT-REF`: server up, login works, row counts per
core table, plugin bundles ACTIVE.

## §2 Plugin inventory
For each plugin: what it adds — AD rows (2Pack), model classes, callouts, processes, validators/event handlers,
reports. Witness `§PILOT-PLUGIN name=… ad=… java_classes=… hooks=…`. Each becomes a Ninja-module candidate
(Ninja = the ONE extension enabler, `§AD-LAYER LAW` rule 6) or a named gap.

## §3 Import + usage-weighted coverage
Import the DB into our ERP (existing Migrate/Install path). Score `§PORT-COVERAGE` areas against WHAT THIS YEAR
ACTUALLY USED: doc types and counts, callouts fired (by column touched), processes run (AD_PInstance),
workflows (AD_WF_Process), posting types (Fact_Acct by AD_Table_ID). Witness `§PILOT-USAGE area=… used=N ported=X`.
Output = the porting backlog ranked by real frequency.

## §4 Year replay — the solidity test
Re-enter the year's documents through BOTH systems in date order (same inputs, same DocActions). Compare per month:
GL (Fact_Acct sums per account), stock (M_StorageOnHand / M_Transaction), open AR/AP, document statuses + numbers.
Witness `§PILOT-REPLAY month=… gl_diff=… stock_diff=… arap_diff=… docs=ok/total` — any non-zero diff names the
missing rule (ledger trap #). A month whose documents could not be driven prints INCONCLUSIVE, not PASS.

## §5 100-user simulation over the relay
Headless clients (per I4 mix) editing through the relay (`erp/erp_sync_relay.js` + clients) concurrently.
Measure: conflicts and how they resolve, DocumentNo gaps/duplicates, sync latency, per-client memory/DB size.
Witness `§PILOT-LOAD users=… conflicts=… docno_dup=… docno_gap=… p95_sync_ms=… mem_mb=…`.

## §6 Email backup
Build (not yet existing — relay has no email path): encrypted signed backup → email; restore from the email copy
alone on a wiped client. Witness `§PILOT-BACKUP sent=… restored_ops=… tip_match=…`.

## §7 Report
One page: X-of-N on this customer's real usage, replay diffs by month, load numbers, backup round-trip, the
ranked porting backlog. No claim beyond what the § lines show.

## §8 Jasper reports → Ninja Excel (added 2026-10-04, red1)
**Ask:** the customer's few Jasper reports (GL entries across the ~100 users) convert to red1's Ninja Excel way.
**Input I5:** the `.jrxml` files (+ subreports, any scriptlet jars/images) — ⛔ awaiting, arrive with I1-I3.
**Target:** `erp/ninja_excel.js` workbook = BACKUP (filled sample) / Input (params) / Process (SQL rows), run
over the folded client db, verify-by-example in integer cents (`internal/NinjaExcelAdaptation.md`).
**Conversion = extract, never author:** per jrxml — `queryString` → Process rows; `parameter` → Input rows
(incl. iDempiere-passed AD_Client_ID / AD_Org_ID / RECORD_ID / AD_PInstance_ID); `field`/`group`/`variable`
(sums, counts, resets) → Process aggregates + layout cells.
**Oracle:** run the SAME report on the reference iDempiere (Jasper plugin `org.adempiere.report.jasper` is in the
local source) with the same params → its output fills BACKUP; the Ninja workbook must reproduce it to the cent.
Witness `§PILOT-JASPER report=… rows=… cents_diff=0 params=…`.
**Traps to inventory per report (each a named gap until handled):** `$P!{}` dynamic SQL, subreports, scriptlets
(Java code), Java expressions in variables/print-when, Jasper-side sorting/grouping not in SQL, i18n resource
bundles, iDempiere context tokens. Report that hits one → ⛔ with the one construct named, never a silent rewrite.
