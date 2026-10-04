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

## §9 Three POS stations over the relay → admin folds a GROUP report (added 2026-10-04, red1)
**Ask:** "simulate 3 party relay using this machine, OCI and GitHub as POS stations and see if an 'admin' can fold
all changes to make a group stock report or financial performance statement."
**Already proven (do not redo):** W-REPLICA (`scripts/test_kernel_replica.js`) — ONE snapshot served by 3 LOCAL
stand-in origins replays to the same tip (read replica, single writer); W-N-CONVERGE N=2/N=10 real browser; S7
W-REBASE-ATTRIB (bim-ootb PR #930) — rebase keeps per-device sig + gid. `prompts/ERP_MULTIUSER_CONCURRENCY_POC.md`.
**Not proven:** three real hosts each WRITING (each a POS station, own org/warehouse, own key), and an admin who
pulls all three logs and folds a group report whose numbers equal real iDempiere's.
**Phase A — relay + fold integrity (now):** each station rings N POS sales; relay; admin pulls. Witness
`§PILOT-GROUP-RELAY station=… ops_sent=… ops_at_admin=… sig_ok=… gid_intact=… docno_dup=…` + admin tip identical
across hosts. **Phase B — report values (after the model layer's POS chain matches):** group stock (on-hand per
warehouse/product) and financial performance (P&L from Fact_Acct by account, per org + consolidated) vs the SAME
sales entered in the reference iDempiere (one org per station). Witness `§PILOT-GROUP-REPORT kind=stock|pl
org=…|ALL cents_diff=… qty_diff=…`. Hosts: use only the relay/host paths that already exist
(`docs/DistributedERP.md §6`, `erp_sync_relay.js`, OCI dev bucket per `deploy/OCI_UPLOAD.md §RULES`, never
deploy/live). Missing host write path → ⛔ naming it, never improvised infra.

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


---

## §R 2026-10-04 — REHEARSAL on this machine's own iDempiere (GardenWorld). Read this first.

**Setup, not customer data.** Reference = the locally built iDempiere 13 (build 2024-12-24, `~/idempiere-dev-setup`) running a COPY
of the `idempiere` DB (`createdb -T idempiere idempiere_pilot`; the original is never written). Ours = `bim-ootb origin/main
fcaaa411` served from `/tmp/wt-pilot` into headless Chromium (`--disable-gpu`), driven through the generic AD surfaces only
(window → tab → New → `[data-col]` fields → Save → DocAction bar button). Harness = `scripts/pilot/` (all numbers below are from the saved
logs in `scripts/pilot/logs/`, read, not recalled).

### §R.0 FIRST CASE — "when a POS sale occurs, are we aware of ALL changes? prove it table and line-record level"
**Method (cannot miss a table).** `pilot_tablediff.js snap` copies EVERY base table of schema `adempiere` (925) into a snapshot schema;
`diff` compares whole rows by PRIMARY KEY (full-row multiset for PK-less tables) in one plpgsql pass — no reliance on `Updated`.
Input: one POS Order (doctype 135 `WR`, BP 112, product 130 ×2 @47.50, PaymentRule `B` cash, DateOrdered 2006-12-15 = an open period),
created through iDempiere's own ADInterface web-service layer (`ModelADServiceImpl.createData` = `PO.save()` with hooks; `setDocAction` =
`po.processIt(CO)`), exactly the inputs typed into our UI. Log: `logs/pos_one/run.log` (`§PILOT-POS-DIFF`, `§PILOT-POS-CMP`).

**Result: iDempiere changed 24 tables for ONE POS sale (26 on the very first run: + `c_acctprocessor`/`c_acctprocessorlog`
async-post stamps); our signed op-group changed 8, and 0 of 24 tables fully MATCH.** Per table / per column (MATCH none; verdict key:
MISSING-IN-OURS = table/rows absent, PARTIAL = present but columns/rows differ, N/A = harness artifact of the WS login):

| table | iDempiere changed | ours (signed op-group) | verdict | owning Java | trap |
|---|---|---|---|---|---|
| ad_changelog | ins 27 / upd 0 | ins 0 | MISSING-IN-OURS | model/PO.java:3294-3309 session.changeLog (column audit on update) | 11 (+ ours: op-log is the audit trail, no AD_ChangeLog rows) |
| ad_sequence | ins 0 / upd 20 [currentnext] | ins 0 | MISSING-IN-OURS | model/PO.java:3149-3162,3579-3603 DB.getDocumentNo + :3528 DB.getNextID (nextidfunc) ; MSequence.java:176-188 | 7 |
| ad_session | ins 3 / upd 0 | ins 0 | N/A-HARNESS-ARTIFACT |  |  |
| ad_user | ins 0 / upd 1 [datelastlogin,updated] | ins 0 | N/A-HARNESS-ARTIFACT |  |  |
| c_allocationhdr | ins 1 / upd 0 | ins 0 | MISSING-IN-OURS | model/MPayment.java:966 testAllocation / :2298 allocateIt (auto-allocate payment to invoice) | 5 |
| c_allocationline | ins 1 / upd 0 | ins 0 | MISSING-IN-OURS | model/MPayment.java:2298 allocateIt | 5 |
| c_bpartner | ins 0 / upd 1 [actuallifetimevalue,updated] | ins 0 | MISSING-IN-OURS | model/MBPartner.java:711 setTotalOpenBalance, :762 setActualLifeTimeValue; MAllocationHdr.java:357,963; MOrder.java credit/SO_CreditUsed | 5 |
| c_invoice | ins 1 / upd 0 | ins 1 / upd [posted] | PARTIAL | model/MInvoice.java:502-503 DateInvoiced/DateAcct from the order's invoice date (ours stamps today); :1449 setIsPaid via MPayment.testAllocation; approveIt | 5 + 9 (date/period) |
| c_invoiceline | ins 1 / upd 0 | ins 1 | PARTIAL | model/MInvoiceLine.java:308 setOrderLine copies LineNetAmt; beforeSave computes TaxAmt/LineTotalAmt (calculator); processed via MInvoice.completeIt | 1 |
| c_invoicetax | ins 1 / upd 0 | ins 1 | PARTIAL | model/MInvoice.java:2030 calculateTaxTotal / MInvoiceTax.get (Processed flag set at completeIt) | 1 |
| c_order | ins 1 / upd 0 | ins 1 / upd [docstatus] | PARTIAL | model/MOrder.java:1619,1624 prepareIt copies C_DocTypeTarget_ID->C_DocType_ID; :2180-2184 completeIt forces DeliveryRule=F for POS/WI; model/MOrderLine.java:999->:1070 updateHeaderTax rolls TotalLines/GrandTotal; process/DocumentEngine.java:344 setProcessed + approve/DocAction=CL | 1 (roll-ups) + 2 (DocAction path) |
| c_orderline | ins 1 / upd 0 | ins 1 | PARTIAL | model/MOrderLine.java:230-237 setHeaderInfo copies BP/currency; :321,681 setDiscount; QtyDelivered/QtyInvoiced updated by MInOut.completeIt (:1699-1741) and MInvoice.completeIt; Processed by DocumentEngine | 1 + 3 |
| c_ordertax | ins 1 / upd 0 | ins 0 | MISSING-IN-OURS | model/MOrderLine.java:999 afterSave -> :1070 updateHeaderTax -> calculator.updateOrderTax | 1 (0/100 afterSave hooks fired) |
| c_payment | ins 1 / upd 0 | ins 0 | MISSING-IN-OURS | model/MInvoice.java:2009-2062 (completeIt: PaymentRule=Cash -> new MPayment, saveEx, processIt) | 5 (+2: DocAction runs real model code) |
| fact_acct | ins 18 / upd 0 | ins 5 | PARTIAL | acct/Doc.java:246 postImmediate; Doc_Invoice/Doc_InOut/Doc_Payment/Doc_Allocation createFacts | 9 (2/20 Doc_* on page) |
| m_cost | ins 0 / upd 6 [currentqty,updated] | ins 0 | MISSING-IN-OURS | acct/DocLine.java:791-831 getProductCosts / model/MCost.java (queue+average update) | 4 |
| m_costdetail | ins 2 / upd 0 | ins 0 | MISSING-IN-OURS | acct/Doc_InOut.java:363-424 MCostDetail.createShipment (at post time) | 4 |
| m_costhistory | ins 6 / upd 0 | ins 0 | MISSING-IN-OURS | model/MCost.java / MCostDetail.process (history row per cost change) | 4 |
| m_costqueue | ins 0 / upd 2 [currentqty,updated] | ins 0 | MISSING-IN-OURS | model/MCostQueue.java via MCostDetail.createShipment (FIFO/LIFO queue depletion) | 4 |
| m_inout | ins 1 / upd 0 | ins 1 / upd [posted] | PARTIAL | model/MInOut.java:647-648 MovementDate/DateAcct from order (ours stamps today); :652 DeliveryRule copied from order; :1609 approveIt | 3 + 9 |
| m_inoutline | ins 1 / upd 0 | ins 1 | PARTIAL | model/MInOut.java:2194 setProcessed(true) cascade (completeIt) | 3 |
| m_inoutlinema | ins 1 / upd 0 | ins 0 | MISSING-IN-OURS | model/MInOut.java:1766-1770 MInOutLineMA (material-policy allocation, completeIt) | 3 |
| m_storageonhand | ins 0 / upd 1 [qtyonhand,updated] | ins 0 | MISSING-IN-OURS | model/MInOut.java:1785,1874,1907 MStorageOnHand.add (completeIt) | 3 |
| m_transaction | ins 1 / upd 0 | ins 0 | MISSING-IN-OURS | model/MInOut.java:1798,1939 new MTransaction (completeIt) | 3 |

Column-level (non-MATCH):

| table | column | verdict | iDempiere | ours |
|---|---|---|---|---|
| c_invoice | ispaid | VALUE-DIFF | "Y" | "N" |
| c_invoice | dateacct | VALUE-DIFF | "2006-12-15T00:00:00" | "2026-10-04" |
| c_invoice | documentno | MISSING-COL | "200004" |  |
| c_invoice | isapproved | MISSING-COL | "Y" |  |
| c_invoice | dateinvoiced | VALUE-DIFF | "2006-12-15T00:00:00" | "2026-10-04" |
| c_invoiceline | taxamt | MISSING-COL | 5.7 |  |
| c_invoiceline | isprinted | MISSING-COL | "Y" |  |
| c_invoiceline | processed | MISSING-COL | "Y" |  |
| c_invoiceline | linetotalamt | MISSING-COL | 100.7 |  |
| c_invoicetax | processed | MISSING-COL | "Y" |  |
| c_order | posted | MISSING-COL | "Y" |  |
| c_order | dateacct | MISSING-COL | "2006-12-15T00:00:00" |  |
| c_order | docaction | MISSING-COL | "CL" |  |
| c_order | processed | MISSING-COL | "Y" |  |
| c_order | documentno | VALUE-DIFF | "80004" | "10000000" |
| c_order | grandtotal | VALUE-DIFF | 100.7 | 0 |
| c_order | isapproved | MISSING-COL | "Y" |  |
| c_order | totallines | VALUE-DIFF | 95 | 0 |
| c_order | c_doctype_id | VALUE-DIFF | 135 | 0 |
| c_order | deliveryrule | VALUE-DIFF | "F" | "A" |
| c_orderline | discount | VALUE-DIFF | 5 | 0 |
| c_orderline | processed | VALUE-DIFF | "Y" | "N" |
| c_orderline | qtyinvoiced | VALUE-DIFF | 2 | 0 |
| c_orderline | qtydelivered | VALUE-DIFF | 2 | 0 |
| c_orderline | c_bpartner_id | MISSING-COL | 112 |  |
| c_orderline | c_currency_id | MISSING-COL | 100 |  |
| c_orderline | datedelivered | MISSING-COL | "2006-12-15T00:00:00" |  |
| m_inout | dateacct | VALUE-DIFF | "2006-12-15T00:00:00" | "2026-10-04" |
| m_inout | documentno | MISSING-COL | "600006" |  |
| m_inout | isapproved | MISSING-COL | "Y" |  |
| m_inout | deliveryrule | VALUE-DIFF | "F" | "A" |
| m_inout | movementdate | VALUE-DIFF | "2006-12-15T00:00:00" | "2026-10-04" |
| m_inoutline | processed | MISSING-COL | "Y" |  |

fact_acct multiset (table/schema/account/dr/cr): matched 5; MISSING ["319/schema200000/430/63.53/0.00","319/schema200000/742/0.00/63.53","335/schema101/509/100.70/0.00","335/schema101/511/0.00/100.70","335/schema200000/509/85.60/0.00","335/schema200000/511/0.00/85.60","318/schema200000/596/0.00/4.85","318/schema200000/758/0.00/80.75","318/schema200000/518/85.60/0.00","735/schema101/511/100.70/0.00","735/schema101/518/0.00/100.70","735/schema200000/511/85.60/0.00","735/schema200000/518/0.00/85.60"]; EXTRA []


Reading it: the document headers/lines exist in ours (order, line, shipment, invoice, invoice line, invoice tax, 5 of 18 fact lines — the schema-101
set for shipment cost + invoice, **to the cent**), but ours is not aware of: the **cash payment + allocation** the POS invoice creates (MInvoice.java:2009-2062),
the **second accounting schema** (every document posts twice in GardenWorld: schema 101 USD and 200000 EUR — 9 of the 13 missing fact lines),
**stock** (storageonhand −2, m_transaction, m_inoutlinema), **costing** (m_costdetail/m_cost/m_costqueue/m_costhistory), **order tax + header roll-ups**
(grandtotal 100.7 / totallines 95 stay 0 on our header; c_ordertax absent — trap 1), **BP balances** (SO_CreditUsed, TotalOpenBalance, lifetime value — trap 5),
**document numbers** (ours `10000000` from the generic sequence vs iDempiere `80004` from the doctype's own sequence; shipment/invoice get none — trap 7),
**dates** (ours stamps today 2026-10-04 on shipment/invoice instead of the order's 2006-12-15 — wrong period), POS `DeliveryRule`→`F`, `C_DocType_ID` copy, and `Processed`/`Approved`/`DocAction=CL`/`Posted` on the order.
The only places ours is "ahead": none (EXTRA=0 at table level).

### §R.1 Reference stand-up (§1) — ✅ DONE (witness)
`logs/pilot_ref_witness.log`: `§PILOT-REF webui=200 base=http://localhost:8088 db=idempiere_pilot client=11 adinterfaceLogin=OK` + row counts per core table.
Plugins: INCONCLUSIVE (GardenWorld stock build has none; enumerate via OSGi console when a customer build is stood up).
**Port 8088 (http) / 8444 (https) / OSGi console 12612.** Server copy `~/idempiere-pilot/server` (log `~/idempiere-pilot/server.log`).
Start `~/idempiere-pilot/start.sh`; stop `~/idempiere-pilot/stop.sh`. Login GardenAdmin / GardenAdmin (client GardenWorld, role GardenWorld Admin).
Known startup warning: `DB.isBuildOK build 13.0.0.202601182106 vs DB 20080428-1232` (the dev DB was never version-stamped) — harmless here, not hidden.
Web-service route needs per-table `WS_WebServiceType` + column whitelist rows (`pilot_ws_setup.js`, ids 900000+, pilot DB only; refuses `idempiere`).

### §R.2 Usage profile (§3) — ✅ DONE (witness): `logs/pilot_usage_gardenworld.log` (run on the pristine `idempiere` DB, read-only)
GardenWorld is small: 313 orders (305 Standard SO, 4 PO, 3 POS, 1 On-Credit), 8 invoices, 9 shipments/receipts, 2 payments, 2 allocations, 2 GL journals,
300 fact lines over 8 posting tables, 22 AD_PInstance rows, 11 AD_WF_Process rows (10×workflow 131, 1×116), 0 void/reverse docs.
`§PILOT-USAGE area=callouts_on_populated_tables used=92 ported=18/92`; model hook classes on populated tables 16/105 have ANY port (beforeSave only);
27 ColumnSQL virtual columns on 11 populated tables ported 0; posting: M_InOut 8, M_MatchInv 18, C_Invoice 8 (page: preview only), C_AllocationHdr 2, C_Payment 2,
C_BankStatement 1, M_Movement 1, GL_Journal 2 — all headless-only on the page. Ranked backlog, top 10 (`used` = rows of the owning table / docs of that kind; ranking blends areas, read it as a worklist not a score):
1 CalloutOrder.priceList (642) · 2 MElementValue hooks (379) · 3 MCost hooks (362) · 4 M_Cost ColumnSQL ×2 (362) · 5 CalloutAssignment.product (360) · 6 MPeriod hooks (360) ·
7 CalloutOrder.tax (332) · 8 CalloutOrder.charge (332) · 9 CalloutOrder.navigateOrderLine (332) · 10 MOrderLine afterSave/delete hooks (332).
**Ledger correction found by this run (F-LEDGER-4):** §PORT-COVERAGE row 4 counts 7 callout handlers; the page also registers 11 inline in
`crud_overlay.js _ensureHostCallouts` (CalloutOrder.bPartner, CalloutInOut.bpartner/docType/orderLine/product/qty, CalloutPayment.docType/invoice/order/charge/amounts) → 18. `pilot_usage.js` unions both.

### §R.3 Replay rehearsal (§4) — small slice, 7 cases, 13 DocActions + 24 record creates, every step driven on BOTH sides (0 steps INCONCLUSIVE for driving)
Route: iDempiere ADInterface (cited above — least-invent: it is iDempiere's own model layer); ours = UI. Compared per case with the same snapshot/diff.
Cases (`scripts/pilot/scenarios/`): pos_one · c2_oncredit (WI: auto shipment+invoice) · c3_standard (SO 2 lines) · c4_so_chain (SO→Shipment→AR Invoice→Payment, 11 steps) ·
c5_po_chain (PO→Receipt→AP Invoice) · c6_closed_period (probe, below) · c7_void (CO then VO).

| case | create steps | doc actions | steps ours drove | ref tables changed | MISSING-IN-OURS tables | PARTIAL tables | VALUE-DIFF cols | MISSING cols/fact-lines | EXTRA cols | harness-n/a |
|---|---|---|---|---|---|---|---|---|---|---|
| c2_oncredit | 2 | 1 | 3/3 | 20 | 10 | 8 | 12 | 20 | 0 | 2 |
| c3_standard | 3 | 1 | 4/4 | 9 | 5 | 2 | 7 | 7 | 0 | 2 |
| c4_so_chain | 7 | 4 | 11/11 | 26 | 17 | 7 | 15 | 24 | 6 | 2 |
| c5_po_chain | 6 | 3 | 9/9 | 26 | 18 | 6 | 22 | 12 | 8 | 2 |
| c6_closed_period | 2 | 1 | 3/3 | 9 | 5 | 2 | 8 | 3 | 4 | 2 |
| c7_void | 2 | 2 | 4/4 | 9 | 5 | 2 | 4 | 8 | 3 | 2 |
| pos_one | 2 | 1 | 3/3 | 24 | 14 | 8 | 15 | 31 | 0 | 2 |

§PILOT-REPLAY-TOTAL docsDriven=13 createSteps=24 cases=7

| missing table (across cases) | cases | owning Java | trap |
|---|---|---|---|
| ad_changelog | 7 | model/PO.java:3294-3309 session.changeLog (column audit on update) | 11 (+ ours: op-log is the audit trail, no AD_ChangeLog rows) |
| ad_sequence | 7 | model/PO.java:3149-3162,3579-3603 DB.getDocumentNo + :3528 DB.getNextID (nextidfunc) ; MSequence.java:176-188 | 7 |
| c_ordertax | 6 | model/MOrderLine.java:999 afterSave -> :1070 updateHeaderTax -> calculator.updateOrderTax | 1 (0/100 afterSave hooks fired) |
| c_bpartner | 5 | model/MBPartner.java:711 setTotalOpenBalance, :762 setActualLifeTimeValue; MAllocationHdr.java:357,963; MOrder.java credit/SO_CreditUsed | 5 |
| m_cost | 4 | acct/DocLine.java:791-831 getProductCosts / model/MCost.java (queue+average update) | 4 |
| m_costdetail | 4 | acct/Doc_InOut.java:363-424 MCostDetail.createShipment (at post time) | 4 |
| m_costhistory | 4 | model/MCost.java / MCostDetail.process (history row per cost change) | 4 |
| m_inoutlinema | 4 | model/MInOut.java:1766-1770 MInOutLineMA (material-policy allocation, completeIt) | 3 |
| m_storageonhand | 4 | model/MInOut.java:1785,1874,1907 MStorageOnHand.add (completeIt) | 3 |
| m_transaction | 4 | model/MInOut.java:1798,1939 new MTransaction (completeIt) | 3 |
| m_storagereservation | 4 | model/MOrder.java:1657 -> :1925-2024 reserveStock -> MStorageReservation.add (MStorageReservation.java:244,263,340); released on VO by MOrder.voidIt | 3 |
| m_storagereservationlog | 4 | model/MStorageReservation.java:340 add (reservation log row per change) | 3 |
| c_invoicetax | 3 | model/MInvoice.java:2030 calculateTaxTotal / MInvoiceTax.get (Processed flag set at completeIt) | 1 |
| fact_acct | 3 | acct/Doc.java:246 postImmediate; Doc_Invoice/Doc_InOut/Doc_Payment/Doc_Allocation createFacts | 9 (2/20 Doc_* on page) |
| m_costqueue | 3 | model/MCostQueue.java via MCostDetail.createShipment (FIFO/LIFO queue depletion) | 4 |
| c_allocationhdr | 2 | model/MPayment.java:966 testAllocation / :2298 allocateIt (auto-allocate payment to invoice) | 5 |
| c_allocationline | 2 | model/MPayment.java:2298 allocateIt | 5 |
| m_matchinv | 1 | model/MInOut.java:2062 / MInvoice.java:2101 new MMatchInv | 3 (+P2P invoice match lane) |
| m_matchpo | 1 | model/MInOut.java:2083,2113 MMatchPO.create (receipt completeIt); MInvoice.java:2136 | 3 |
| t_fact_acct_history | 1 | model/MFactAcct.java:79-85 (copy of prior Fact_Acct rows before a back-dated re-post) | 9 |
| c_payment | 1 | model/MInvoice.java:2009-2062 (completeIt: PaymentRule=Cash -> new MPayment, saveEx, processIt) | 5 (+2: DocAction runs real model code) |


Diffs by kind, each mapped to a rule (Java file:line verified by grep; trap # = ledger §PORT-COVERAGE (b)):
- **Rolled-up money missing (trap 1)** — header GrandTotal/TotalLines 0 on our order and invoice, C_OrderTax/C_InvoiceTax absent (MOrderLine.java:999→:1070; MInvoice.java:2030).
- **Stock/reservation absent (trap 3)** — no storageonhand/transaction/storagereservation(+log)/inoutlinema/matchpo/matchinv rows; c3 `qtyreserved` 3 vs 0; c7 void releases nothing (MOrder.java:1925-2024, MInOut.java:1785-2113).
- **Costing absent (trap 4)** — m_costdetail/m_cost/m_costqueue/m_costhistory (Doc_InOut.java:363-424, DocLine.java:791-831). Our cost-valued shipment GL (74.74) matches schema 101 only because the engine reads the seed's average.
- **Posting scope (trap 9)** — only docs generated by our Order fan-out post; **manually created + completed Shipment/Invoice/Payment/Receipt/AP-invoice post NOTHING in ours** (c4, c5, c6: `fact_acct` 16/12/4 ref vs 0 ours); only schema 101 ever posts (schema 200000 missing); Payment/Allocation GL absent.
- **Payment/allocation (trap 5)** — payment not auto-created for PaymentRule cash; a typed payment cannot be linked to its invoice in the UI (`c_invoice_id` picker has no option), so no allocation, `IsPaid`/`IsAllocated` stay N, BP open balance not updated.
- **Document numbering (trap 7)** — wrong sequence (ours `10000000…` generic vs doctype sequence), shipment/invoice/payment numbered from one flat counter, none on fan-out docs; 21 AD_Sequence rows advance in iDempiere, 0 in ours.
- **Dates (trap 9)** — child docs stamped today (2026-10-04) instead of order/invoice date (MInvoice.java:502-503, MInOut.java:647-648); `DateAcct` not on the order form at all.
- **Defaults/derived columns** — DeliveryRule F for POS/WI (MOrder.java:2180-2184), `C_DocType_ID` copy (MOrder.java:1619), line `Discount`/`C_BPartner_ID`/`C_Currency_ID` (MOrderLine.java:230-237,321), `Processed`/`IsApproved`/`DocAction=CL` flags after complete.
- **Period control (trap 6, c6)** — iDempiere completed AND posted an AR invoice dated 2001-03-15 although `C_PeriodControl` says Closed: its `C_AcctSchema.AutoPeriodControl=Y` (OpenHistory 10000 d) decides (MPeriod.java:735-760). Ours completed it too (c6: `SET_STATUS CO`, `§AD-DOCFSM-LIVE ... periodOpen=true(no-dateacct→assume-open)`) because the invoice form carries no `DateAcct`, so `_periodOpen` (idempiere.html, reads `C_PeriodControl` only) is never evaluated; had a DateAcct been present it would apply the PeriodControl rows, not the AcctSchema auto-control. **New rule not in ledger: period-open is an AcctSchema-level auto-control, not just period-control rows.**
- **New (not in ledger): UI line entry** — an invoice line typed with PriceEntered 60 saved PriceActual 0 / LineNetAmt 0 in c6 (ours `CalloutInvoice.amt` did not derive PriceActual from PriceEntered on a manually typed line with no order link).
- **Harness artifact, not a gap**: ad_session/ad_user rows are the WS login; ad_changelog 8-27 rows are PO.java:3294-3309 (ours keeps the signed op-log instead — equivalent audit, different table).
Hard limit of this slice: GardenWorld has no multi-currency/period-close/plugin traffic; those traps stay un-measured until the customer DB (I1) lands.

### §R.4 Harness (§4 deliverable) — `scripts/pilot/` (customer DB = env change, not new code)
`PILOT_PG_DB=<restored db> PILOT_CLIENT_ID=<n> PILOT_WS_BASE=<url> PILOT_WS_USER/PASS/ROLE/ORG/WH PILOT_OOTB=<bim-ootb worktree>`; then
`node pilot_ws_setup.js [tables]` (registers WS types in the NON-reference DB) → `node pilot_usage.js` (§PILOT-USAGE/BACKLOG) →
`node pilot_replay.js <case>…` (snapshot → ref run → diff → ours run → compare; outputs `~/.cache/pilot/<case>/`) → `node pilot_report.js` / `pilot_report_pos.js`.
Files: `pilot_cfg.js pilot_ref.js pilot_run_ref.js pilot_ours.js pilot_run_ours.js pilot_tablediff.js pilot_compare_pos.js pilot_usage.js pilot_ws_setup.js pilot_ref_witness.js pilot_report*.js`, data `data/` (owner map, ported sets — provenance in `ported.json`).
Scenario = JSON steps (`create`/`docaction`, `@ref` links, per-step `ui` window/tab hint) — the same file drives both systems. A customer year replay = a generator that emits these steps from the DB's documents (next).

### §R.5 Open / ⛔
- ⛔ I1–I4 (customer dump, version, plugins, user mix) still awaited — §1 plugin enumeration, §2, §5, §6 untouched. 
- ⛔ BLOCKED: **one question** — the replay compares to iDempiere's results; for the year replay, should "ours" be judged against the reference-stock behaviour (iDempiere = oracle, as CLAUDE.md §AD-LAYER LAW rule 7 says) even where the customer has custom plugins that change the reference? (default: yes, plugin deltas listed separately.)
- Not done: §5 100-user load, §6 email backup (spec'd, not built); usage ranking weights are blunt (rows-of-owning-table), a refinement needs customer frequency data.

## §9-R Phase A result (2026-10-04, run id 202610040658)
**Harness:** bim-ootb `erp/tests/pilot_{lib,hosts,group_relay_live,report}.js` (PR #1838, harness only). Logs: `prompts/erp_pilot_logs/phaseA_202610040658.{run,report,stations}.txt` (read in full). Playwright `--disable-gpu`, no screenshots.
**Host roles found in code (cited):** the ONLY host that accepts a station's writes over the wire is the Node relay `build/erp/erp_relay_server.js` (POST /push, persist+order, `createRelayServer`). OCI and GitHub are static hosts: `erp_replica_client.js:5-9` ("Hosts don't run logic — they STORE+SERVE the snapshot blob. A 'write' = the owner re-publishes a new snapshot (OCI put / GH push)"); the browser relay client posts only to `?relay=` (`erp_sync_relay.js:36-60`). So OCI/GH cannot be a live relay for a station. Existing owner-publish paths used (no new bucket/repo): OCI `bim-ootb-dev/sandbox/erp/` (new object names, GET-first 404 check, `--content-type application/json`, no `--force`); GH `red1oon/BIMCompiler` branch `mock/relay-snapshot` Contents API (`witness_multihost_sync.js:192-214`).
**Real vs stand-in:** north = host `here`, REAL (live relay). south = persist+fetch on OCI REAL; its live relay role = STAND-IN (a 2nd local relay process, port 29202). east = persist+fetch on GH REAL; live relay role = STAND-IN (port 29203). Admin's own relay = local (29204). "Relay through OCI/GH" does not exist today: ⛔ no write path for a static host as relay (not built, per rule).
**POS path:** the POS lens (`pos_lens.js`, pill) writes to `window.ERP.opDb` (Kanban store, `idempiere.html:5703`), which has NO relay push (only `crud_overlay.js` sidecar calls `ErpSyncRelay.pushRows`, `crud_overlay.js:2205-2211`) and takes `SELECT * FROM c_pos LIMIT 1` (`pos_lens.js:409`, one station, org 12). ⛔ POS-lens sales are not relayable and cannot pick an org. Used instead: POS Order doc type through the Sales Order window UI (S20 path): header org+warehouse+BP 118+doctype, line product 123 qty 1/2/1/3/2 @61.75, Complete -> shipment+invoice+GL in 3 signed groups = 14 ops/sale.
**Org/warehouse (seed):** Store North org 50002/wh 50003, Store South 50004/50004, Store East 50005/50005 (`ad_seed.db` ad_org, m_warehouse; picker filters warehouse by org).
**Per-station relay table (all from run.log):**
| station | host | org/wh | sales | ops_sent | at relay | at admin | sig_ok | gid_intact | docno_dup |
|---|---|---|---|---|---|---|---|---|---|
| north | here (real) | 50002/50003 | 5/5 | 70 | 70 | 70 | 70 | 70 | 1 |
| south | OCI (real storage) | 50004/50004 | 5/5 | 70 | 70 | 70 | 70 | 70 | 1 |
| east | GH (real storage) | 50005/50005 | 5/5 | 70 | 70 | 70 | 70 | 70 | 1 |
Host fetch-back md5 matched for OCI and GH. Admin fold: 210 ops, `verifyMultiDeviceOps` ok attributed=210 anonymous=0 (each op under its station's key; roster of 3 kids). Single-signer `verifyChain` on the admin = `group torn/signature` (known S8 limit, expected). Admin tip `b9ca6477cb217c63`, identical when the folded log was re-read from here, OCI and GH (all_equal=true, 3 hosts, node replay through the real kernel == admin browser tip).
**Completeness/attribution: COMPLETE and ATTRIBUTABLE at op level. FAIL at document level (verdict FAIL per station):** (1) `§PILOT-ID-CLASH` every station allocates local ids -1,-15,-29,-43,-57 (order) — 5 of 5 `c_order:<id>` targets are completed by 3 different stations; the fold has 3 different documents under the same key. (2) `§PILOT-DOCNO-CLASH` all 15 orders carry DocumentNo `10000000` — also constant WITHIN a station (every sale), not only across. Both are model-layer defects (id/DocumentNo allocation), not relay defects; grouped reports must therefore be derived by gid, not by record id.
**Raw group report (UNVERIFIED, Phase B compares to real iDempiere; derived by gid from admin folded ops):** stock product 123: wh 50003/50004/50005 each seed 0, shipped 9 -> on-hand -9 each (seed stock exists only in wh 103 = 20; stations had none). P&L cents per org (identical per org): Revenue 41000 cr 55575, CoGs 51100 dr 46305, AR 12110 dr 55575, Product asset 14120 cr 46305; consolidated revenue 166725, CoGs 138915, profit 27810 (9 units x 61.75 / 51.45 per station x3; arithmetic matches), ledger balanced.
**Objects put (all dev, listed):** OCI `bim-ootb-dev/sandbox/erp/pilot_phaseA/202610040658/{south,admin}/relay_snapshot.json` (+ dry-run none); GH `red1oon/BIMCompiler@mock/relay-snapshot:pilot_phaseA/202610040658/{east,admin}/relay_snapshot.json`. Demo GardenWorld data only, no customer data.
**⛔ list:** (a) static hosts have no relay write path; (b) POS lens ops are not relayed and have no org choice; (c) local negative ids and DocumentNo collide across (and within) stations — needs the model-layer owner; (d) Phase B (compare to reference iDempiere) waits for the model layer.

## §DECISIONS 2026-10-04 (red1: "Go with yes first. If anything amiss I can easily direct its correction")
- **Plugins vs reference:** ours is judged against STOCK iDempiere behaviour; each customer plugin's effect on the
  reference is listed separately as a plugin delta (§2), not folded into the pass/fail.
