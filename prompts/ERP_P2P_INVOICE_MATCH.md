# ⚠ DO NOT REMOVE — scope: build the Procure-to-Pay closer — Material Receipt (Stage 7) + Vendor
# Invoice/three-way match (Stage 8) — on the live iDempiere surface (bim-ootb `erp/idempiere.html` +
# `erp/crud_overlay.js` + `erp/erp_engine.js`). Read the log after every run (regenerate via
# `bash build/erp/run_witness.sh scripts/witness_p2p_invoice_match.js` from bim-compiler). Spec-first:
# every fix below is EXTRACTED from the real iDempiere Java source at
# `~/idempiere-dev-setup/idempiere` before a line of JS is written — never invented.

**2026-07-22** — scoped OUT of `prompts/ERP_BUSINESS_CYCLE_E2E.md`'s closed O2C lane (its `§Closed`
section named this as a separate project). Implementation branch: bim-ootb `feat/p2p-invoice-3way-match`
(worktree `/tmp/wt-p2p-invoice-match`).

## THE QUESTION

Can a real user complete the P2P closer — Purchase Order → Material Receipt → Vendor Invoice, with a
genuine three-way match (PO ⋈ Receipt ⋈ Invoice) — through the live iDempiere UI, and if the two
structural gaps named in `ERP_BUSINESS_CYCLE_E2E.md` (`§Closed`) are real, what EXACTLY does the real
Java do instead of the SO-only paths already ported?

## §Extract — real Java ground truth (`~/idempiere-dev-setup/idempiere`, read before any JS written)

**Confirms the existing SO-only gates are NOT bugs.** `org.compiere.process.InOutGenerate` (Generate
Shipments) and `org.compiere.process.InvoiceGenerate` (Generate Invoices) — already ported faithfully in
`erp/ad_process.js` (`inoutGenGate`/`invoiceGenGate`, both citing real line numbers) — genuinely hard-select
`IsSOTrx='Y'` in the real Java too. There is no PO-side twin of these batch processes. **Do not touch either
gate.** The Purchase side uses a completely different, already-identified real mechanism:

1. **Material Receipt lines** come from `org.compiere.process.CreateFromInOut` (window-level "Create Lines
   From" action) → `MInOut.createLineFrom()` (`MInOut.java:3206`). The Receipt HEADER (BPartner, Warehouse,
   doc type Receipt) is entered manually first; then the user picks open PO lines from a selection screen,
   enters/adjusts qty, and `createLineFrom` copies `M_Product_ID`, UOM, `M_AttributeSetInstance_ID`,
   `C_OrderLine_ID` (the match link) and other order-line fields straight from `C_OrderLine` — qty is the
   only free input.

2. **Vendor Invoice lines** come from the mirror process `org.compiere.process.CreateFromInvoice` →
   `MInvoice.createLineFrom()` (`MInvoice.java:3262`) → `MInvoiceLine.setShipLine()`/`setOrderLine()`
   (`MInvoiceLine.java:330`/`286`). **Price (`PriceEntered`/`PriceActual`/`PriceLimit`/`PriceList`), tax, and
   line amount are ALWAYS copied from the PO/Receipt line — never freely typed.** Only qty is user-adjustable.
   `GrandTotal` is the roll-up of these copied line amounts — this is exactly consistent with `c_invoice`'s
   existing `grandtotal` field note in `crud_ops.json` ("derived by replaying the log... not entered"): adding
   line-item creation via Create-From does NOT violate that guarantee, because the price still isn't typed.

3. **`M_MatchPO`** rows are created at DOCUMENT-COMPLETION time, not by a separate matching UI —
   `MInOut.completeIt()` (`MInOut.java:2079-2096`): for each receipt line with `C_OrderLine_ID != 0`, calls
   `MMatchPO.create(null, sLine, movementDate, qty=sLine.getMovementQty())`, stamping
   `M_InOutLine_ID`/`C_OrderLine_ID`/`M_Product_ID`/`Qty`. (Edge case: invoice-created-before-shipment also
   creates `MMatchPO` from `MInvoice.completeIt()`, `MInvoice.java` ~line 2134 — NAMED-DEFERRED here, see
   §Fix sequencing below; the mainline receipt-first path is what this lane witnesses.)

4. **`M_MatchInv`** rows are created the same way at completion time — `MInvoice.completeIt()`
   (`MInvoice.java:2085-2109`): for each purchase invoice line with `M_InOutLine_ID != 0` and a completed
   receipt, `qty = min(receiptLine.MovementQty, invoiceLine.QtyInvoiced)`, `new MMatchInv(line, dateInvoiced,
   qty).save()`. **This exact shape is already ported** in `erp/erp_engine.js`'s `completeInvoice()`
   (lines 266-274, citing "real Java line ~2075") — it has simply never been wired to the live UI's doc-action
   fanout (`completeFanout` in `crud_overlay.js` is hard-gated to `op.key === 'c_order'` only, line 1894-1895).

5. **Three-way match has no separate validator process.** It is the natural join of `M_MatchPO` and
   `M_MatchInv` both pointing at the same `M_InOutLine_ID` — confirmed by `MMatchPO.java`'s own cross-reference
   logic (`beforeSave`, lines 1004-1041) and its hard invariant (lines 1105-1116): if a `MMatchPO` row has both
   `M_InOutLine_ID` and `C_InvoiceLine_ID` set, a corresponding `M_MatchInv` row for that pair MUST already
   exist, else `IllegalStateException`. **This shared-`m_inoutline_id` linkage is the witness proof for Stage
   8** — not a new report/process.

## §Design — the JS port (mirrors the real Java 1:1, reuses existing O2C-lane machinery)

| Real Java | JS port target | Reuses |
|---|---|---|
| `CreateFromInOut` picker + `createLineFrom` | New "Create Receipt Lines from PO" picker in `idempiere.html`, modeled on `renderOrderPicker` (2414-2469) but sourced from `c_orderline` WHERE parent `issotrx='N' AND docstatus='CO'` | picker UI shape, `applyOpGroup` commit wrapper |
| `MInOut.completeIt()` → `MMatchPO.create` | New `completeReceipt(receipt, lines, policy)` in `erp_engine.js`, same shape as `completeInvoice` | `completeInvoice`'s CREATE_LINE-only (no buildDoc) pattern |
| `CreateFromInvoice` picker + `createLineFrom`/`setShipLine` | New "Create Invoice Lines from PO/Receipt" picker, same shape as the Receipt picker, sourced from `m_inoutline` for a Purchase receipt | same picker shape again |
| `MInvoice.completeIt()` → `MMatchInv` | **Already written**, `erp_engine.js:266-274` `completeInvoice()` — just needs wiring | — |
| fan-out gate | Generalize `completeFanout` (`crud_overlay.js:1894-1922`) from `op.key === 'c_order'`-only to also branch `m_inout` → `completeReceipt`, `c_invoice` → `completeInvoice` | `applyOpGroup`/`commitGroup`, unchanged |

**Explicitly NOT doing:** touching `inoutGenGate`/`invoiceGenGate`/`InOutGenerate`/`InvoiceGenerate` (real
Java confirms these are Sales-only, full stop); adding a freely-typed `grandtotal`/price field anywhere
(violates the extracted price-copy rule and the existing anti-invent note); building a general
"three-way-match report" (real Java has none — the shared FK linkage in the op-log IS the proof).

## §Correction — no new picker needed for lines (found mid-build, before any wrong code shipped)

The original plan above (Fix 2/4: a custom "Create Lines From PO" picker, committing via `CREATE_LINE`/
`applyOpGroup`) was WRONG and was built, then discarded, before landing: `M_InOutLine` (real AD_Tab 297
"Receipt Line") and `C_InvoiceLine` (real AD_Tab 291 "Invoice Line") already have live AD_Field dictionary
rows exposing `C_OrderLine_ID`/`M_InOutLine_ID`/`M_Product_ID`/qty (verified directly against `ad_seed.db`,
not assumed) — meaning `crud_overlay.js`'s GENERIC AD-dictionary-driven CRUD (`foldCrudSpec`, "S2B: AD-folded
CRUD spec, general not curated") already supports creating both line types manually, the same generic
mechanism `C_OrderLine` itself already uses (PR #956's "child-tab parent-FK" fix works on ANY table, not
just `c_order`'s children). **No new UI code is needed to create the lines — a user can already navigate
the Receipt/Invoice's Line child-tab and enter `c_orderline_id` + product + qty by hand.**

A second, more serious problem surfaced by writing (and discarding) that picker first: `completeFanoutOrder`'s
own established pattern — `db.exec('SELECT * FROM c_order WHERE c_order_id=...')` against the raw `withBundle`
db — **only ever finds a SEED row.** A manually-created record (Receipt, Invoice, or its lines) exists ONLY
as `CRUD_CREATE` ops in the sidecar's `kernel_ops` (confirmed: `commitCrud`/`_commitCrudSealed` write only to
the sidecar, never to the raw bundle; `listTip`'s own doc-comment: "Created rows get a SYNTHETIC negative
pk" — and the witness log's own Stage 6/7 lines show real receipt/PO ids as negative, e.g. `id=-5`). The SAME
class of bug the O2C lane's own `§Fix 2026-07-21` (picker overlay gap) already found and fixed for
`renderOrderPicker` — just recurring here in `completeFanout`'s NEW branches, caught before shipping instead
of after. **Fixed**: `completeFanoutReceipt`/`completeFanoutInvoice` now fold via `CORE.listTip` against the
sidecar (the exact convention `renderOrderPicker` already established), not a raw bundle SELECT.

Price/tax auto-copy-from-the-PO-line (real Java's `setShipLine`/`setOrderLine`) is NOT ported — a user must
type price manually on the invoice line for now. NAMED-DEFERRED (a convenience gap, not a blocker): the
structural requirement for a real three-way match is the `c_orderline_id`/`m_inoutline_id` LINKAGE, which the
existing generic form already lets a user set; the amount typed doesn't need to be faked to prove the match
mechanics work.

## §Fix sequencing (witness after each layer, same cadence as the O2C lane)

1. Header fields: `m_warehouse_id`/`c_bpartner_id`/`c_order_id` on `m_inout`, `c_bpartner_id`/`c_order_id` on
   `c_invoice` + `"create"` verb on `c_invoice`. **DONE.**
2. Per-window `movementtype`/`issotrx` derivation for a manually-created `m_inout` (AD_Tab 296 "Material
   Receipt" 's real WhereClause is `MovementType IN ('V+')`, not `IsSOTrx`, unlike `c_order`/`c_invoice` —
   a NEW seam, `MInOut.movementTypeFromWindow`) + the equivalent `issotrx`-from-window seam for `c_invoice`
   (`MInvoice.issotrxFromWindow`, `c_invoice`'s tabs DO use `IsSOTrx` directly so the EXISTING `_createIsSOTrx`
   thread just needed a table-specific consumer hook). **DONE** — no new picker needed (see §Correction).
3. `completeReceipt` (erp_engine.js) + `completeFanout` generalized (was `c_order`-only) to dispatch `m_inout`
   → `M_MatchPO` emitted on Receipt CO, reading via listTip fold (not raw bundle). **DONE, unwitnessed.**
5. `completeFanout` dispatch for `c_invoice` → `completeInvoice()` (already written in the O2C lane) now
   actually runs → `M_MatchInv` emitted on Invoice CO, same listTip-fold fix. **DONE, unwitnessed.**
6. End-to-end witness: drive PO → Receipt(CO) → Invoice(CO) through the real UI (manually entering
   `c_orderline_id`/`m_inoutline_id` on each line via the existing generic child-tab form); confirm `MATCH_PO`
   and `MATCH_INV` CREATE_LINE ops in the op-log share the same `m_inoutline_id` (the three-way-match
   invariant), `verifyChain=ok`. **NEXT.**

Each numbered item lands as its own PR, `§Fix` section appended below, dated, most recent first — same
discipline as `ERP_BUSINESS_CYCLE_E2E.md`.

## §Fix — 2026-07-23, Fixes 1/2/3 WITNESSED end-to-end; Fix 5's exact remaining layer found

Witness: `scripts/witness_p2p_invoice_match.js` (bim-compiler), run against `/tmp/wt-p2p-invoice-match`
(bim-ootb `feat/p2p-invoice-3way-match`). Full log: `build/erp/witness_p2p_invoice_match.log`.

**PROVEN, real signed op-log evidence** (`§P2P-MATCH` line, `build/erp/witness_p2p_invoice_match.log:1608`):
```
M_MatchPO rows=[{"op_type":"CREATE_LINE","table":"M_MatchPO","c_orderline_id":108,"m_inoutline_id":-5,
  "m_product_id":123,"qty":1,"_sv":1,"_sigv":2,"signed_by":"3059301306072a8648ce..."}]
```
A real user: opened a real seed Purchase Order's line (104/108), created a Material Receipt header through
the live UI with the new `m_warehouse_id`/`c_bpartner_id`/`c_order_id` fields (§Fix 1 — confirmed shown on
the form, `§P2P-FORM` line), had `movementtype`/`issotrx` correctly auto-derived from the window
(§Fix 2 — `§AD-MODELVAL-LIVE table=m_inout verb=create ... derived={"movementtype":"V+","issotrx":"N",...}`),
created a Receipt Line linked to the real PO line via the (unlocked, manually-fillable) `c_orderline_id`
field, then hit Complete — and `completeFanoutReceipt`/`completeReceipt` (§Fix 3) emitted a REAL,
cryptographically signed `M_MatchPO` CREATE_LINE op, `verifyChain=ok`. **Stage 7 (Material Receipt) is
UNBLOCKED, for real, proven — not asserted.**

The Vendor Invoice side (§Fix 1's `c_invoice` "create" verb + §Fix 2's `issotrxFromWindow`) is ALSO proven
working the same way — header form mounts, `issotrx` correctly derives to `'N'`
(`derived={"issotrx":"N",...}`), the invoice reaches CO through the real DocAction bar. But
`§INVOICE-FANOUT invoice=-8 issotrx=N lines=1 matchInvOps=0` — **zero** `M_MatchInv` ops, because the
invoice LINE's `m_inoutline_id`/`c_orderline_id` fields could not be set: `§P2P-FILL m_inoutline_id
value=-5 result=locked`.

**Root cause, EXTRACT-verified, not a bug in this lane's own code:** queried `ad_seed.db` directly —
`AD_Field` for `C_InvoiceLine_ID`'s `M_InOutLine_ID`/`C_OrderLine_ID` columns (`AD_Tab_ID=291`) both carry
`IsReadOnly='Y'` at the FIELD level (hard lock, not merely `IsUpdateable='N'` — `foldCrudSpec`'s own
readonly rule, `crud_overlay.js` ~line 692, only relaxes `IsUpdateable='N'` on CREATE, never `IsReadOnly='Y'`
regardless of verb). **This is a faithful port of real iDempiere**, confirmed by the earlier Java extract
(`ERP_P2P_INVOICE_MATCH.md §Extract` point 2): these two columns are ONLY ever set by
`MInvoiceLine.setShipLine()`/`setOrderLine()` — i.e. by the `CreateFromInvoice` PROCESS, never by a user
typing into the form directly, in the real product too. (By contrast, `M_InOutLine`'s own
`C_OrderLine_ID` — the field that DID work above — is NOT `IsReadOnly='Y'` on `AD_Tab_ID=297`, confirmed;
that asymmetry in the real AD dictionary is exactly why Stage 7 could be closed by a plain form fill while
Stage 8 cannot.)

**What Fix 5 actually needs (not yet built):** a SMALL, targeted seed mechanism — not the abandoned generic
picker (§Correction above), and not a relaxation of the readonly lock (that would be inventing a UI real
iDempiere doesn't have) — that pre-fills `m_inoutline_id`/`c_orderline_id`/copied-price into the
c_invoiceline New form's value BEFORE it renders, the same class of mechanism `idempiere.html buildForm()`'s
existing `seedVals` already uses for a child tab's locked PARENT-link column (PR #956,
`ERP_BUSINESS_CYCLE_E2E.md §Fix 2026-07-22 "order-LINE parent-FK"`) — generalized to a PEER cross-reference
FK instead of the tab's own parent link, triggered from a real AD_Process entry point that already exists
in the seed (`AD_Process 200143 "Create lines from Invoice"`, `org.compiere.process.CreateFromInvoice`,
mandatory para `C_Invoice_ID`) rather than a bare New-form click. Scoped as its own next dated `§Fix`, not
implemented yet.

**Status:** Fix 1/2/3 done, witnessed, real. Fix 5 (M_MatchInv) has its exact remaining blocker named with
file:line-level precision — no rediscovery needed for whoever picks it up next.

---

## §Fix — 2026-09-04, **Fix 5 BUILT**: `CreateFromInvoice` is the missing line-maker, not a seed hack

`AGENT_QUEUE.md §E.ORDER` item 1 / `§E.GAPS` **E-5**. Spec written BEFORE the code (Spec-First).

### §Fix5.1 CORRECTION to the 2026-07-23 scoping — the shape was one step off
The 2026-07-23 entry proposed *"a small, targeted seed mechanism … that pre-fills
`m_inoutline_id`/`c_orderline_id`/copied-price into the c_invoiceline New form's value BEFORE it
renders."* **Re-reading the Java says the form is not involved at all.** In real iDempiere
`CreateFromInvoice` **inserts finished lines**; the user never sees, and never types into, those
columns — which is exactly why `AD_Field` locks them `IsReadOnly='Y'`. EXTRACTED:

- `org.compiere.process.CreateFromInvoice.createLines()` (`org.adempiere.base.process`) reads a
  **selection** of receipt/order/RMA lines and, per row, calls
  `invoice.createLineFrom(C_OrderLine_ID, M_InOutLine_ID, M_RMALine_ID, M_Product_ID, C_UOM_ID, QtyEntered)`.
- `MInvoice.createLineFrom` (`MInvoice.java:3262`) builds an `MInvoiceLine`, sets Qty/QtyInvoiced, resolves
  the receipt line, and calls **`invoiceLine.setShipLine(inoutLine)`** — *"overwrites"* in its own comment.
- `MInvoiceLine.setShipLine` is the whole field-copy rule, and it is what we port verbatim:
  `M_InOutLine_ID`, `C_OrderLine_ID`, `M_RMALine_ID`, `Line`, `IsDescription`, `Description`,
  `M_Product_ID`, `C_UOM_ID`, `M_AttributeSetInstance_ID`, `C_Charge_ID` (only when there is no product);
  then **only when `C_OrderLine_ID != 0`** — `PriceEntered` (`oLine.PriceEntered` when
  `sLine.sameOrderLineUOM()`, else `oLine.PriceActual`), `PriceActual`, `PriceLimit`, `PriceList`,
  `C_Tax_ID`, `LineNetAmt`, `C_Project_ID`.
- `MInOutLine.sameOrderLineUOM()` = `C_OrderLine_ID > 0 && oLine.C_UOM_ID == sLine.C_UOM_ID`.

So Fix 5 is **an AD_Process handler**, the same KIND-2 shape `InvoiceGenerate` / `InOutGenerate` already
use in `ad_process.js` — not a UI seed, and not a relaxation of the readonly lock (which would invent a
screen real iDempiere does not have). The 2026-07-23 read of the blocker was right; only the remedy moves.

### §Fix5.2 WHY THIS IS THE LAST PIECE — the rest of the chain already exists and is witnessed
`erp_engine.completeInvoice` (`erp_engine.js:266`) already emits one `M_MatchInv` per invoice line that
carries `m_inoutline_id`, and `crud_overlay.completeFanoutInvoice` (`:1592`) already runs it on the live
Complete. The measured `§INVOICE-FANOUT invoice=-8 issotrx=N lines=1 matchInvOps=0` was **not** a fanout
bug: it was `lines=1` where that one line had no `m_inoutline_id`, because nothing could create such a
line. Fix 5 supplies the line-maker; the fanout then fires on its own.

### §Fix5.3 THE PORT — `registerCreateFromInvoice(engine)` in `ad_process.js`
Handler key `org.compiere.process.CreateFromInvoice` (`AD_Process 200143`,
`value='C_Invoice_CreateFromProcess'`, mandatory para `C_Invoice_ID` — all four verified in `ad_seed.db`).
`ctx` seams, mirroring the existing handlers: `fetchInvoice(info)`, `fetchReceiptLines(info)`,
`fetchOrderLine(id)`, `fetchProduct(id)` (optional).
- **GATE** (each returns a reason, never a fabricated line): no invoice → `@NotFound@ @C_Invoice_ID@`
  (the Java's own message); invoice already `Processed='Y'` or not `DR`/`IP` → refused, because real
  iDempiere reaches CreateFrom only from a drafted invoice's toolbar; empty selection → the Java's
  `@NotSupported@` branch (`getAD_InfoWindow_ID() > 0` is its selection precondition).
- **PER SELECTED RECEIPT LINE** → one `CREATE_LINE` op on `C_InvoiceLine` carrying exactly the
  `setShipLine` field set above, `qtyentered`/`qtyinvoiced` = the selection's qty (default: the receipt
  line's own `qtyentered`), and the price block only when the receipt line has a `c_orderline_id`.
- **NAMED-DEFERRED, never silent** — flagged in the result, the same law `InOutGenerate` follows for its
  non-F/A DeliveryRules: (1) `M_RMALine_ID` selections (the RMA corpus); (2) the cross-UOM branch, which
  needs `MUOMConversion`; (3) `setPrice()`/`setTax()` when there is no order line, which needs the
  price-list engine; (4) `invoice.updateFrom(order)`'s payment-schedule copy.

### §Fix5.4 THE WITNESS — `W-CREATEFROM-INVOICE`, arms that can each fail
`scripts/poc_createfrom_invoice.js`, over the REAL `ad_process.js` + `erp_engine.js`, fixtures read from
the real receipt/order rows the P2P lane already builds — no authored prices, no authored qtys:
1. **LINES CREATED** — N selected receipt lines → N `C_InvoiceLine` `CREATE_LINE` ops.
2. **SHIPLINE COPY IS EXACT** — every column `setShipLine` sets is present and equals the source row's
   value (product, uom, line, description, ASI) — compared field-by-field against the fixture, not spot-checked.
3. **PRICE FROM THE ORDER LINE** — `priceentered/priceactual/pricelimit/pricelist/c_tax_id/linenetamt`
   equal the linked `C_OrderLine`'s, and `priceentered` follows the `sameOrderLineUOM` branch.
4. **THE CHAIN CLOSES** — feeding those lines to `erp_engine.completeInvoice` on an `issotrx='N'` invoice
   emits **`matchInvOps === N`**, each `M_MatchInv` pointing at the right `m_inoutline_id` and qty. This
   is the arm that turns the lane's measured `matchInvOps=0` into a pass.
5. **GATES REFUSE** — no invoice / completed invoice / empty selection each return `ok:false` with the
   named reason and **zero** ops. A handler that cannot refuse is not a gate.
6. **DEFERRALS ARE DECLARED** — an RMA-line selection and a no-order-line selection both come back
   flagged in `result.deferred`, not silently dropped.

### §Fix5.5 RESULT 2026-09-04 — **Fix 5 CLOSED.** `W-CREATEFROM-INVOICE` 16/16, `matchInvOps 0 → 10`
```
§CREATEFROM-AD proc=200143 value=C_Invoice_CreateFromProcess classname=org.compiere.process.CreateFromInvoice isreport=N para=["C_Invoice_ID(Y)"]
§CREATEFROM-FIXTURE receipt=105 issotrx=N docstatus=CO lines=10 allLinked=true invoice=105 issotrx=N docstatus=DR bpartnerMatch=true
§CREATEFROM-INVOICE invoice=105 selected=10 linesCreated=10 withInOutLine=10 withOrderLine=10 deferred=["updateFrom(order)-payment-schedule(MOrderPaySchedule)"]
§CREATEFROM-COPY  fields=m_inoutline_id,c_orderline_id,line,isdescription,description,m_product_id,c_uom_id,m_attributesetinstance_id +qtyentered/qtyinvoiced  rows=10 mismatches=0
§CREATEFROM-PRICE cols=priceactual,pricelimit,pricelist,c_tax_id,linenetamt rows=10 mismatches=0 priceEnteredBranchMismatches=0
§INVOICE-FANOUT invoice=105 issotrx=N lines=10 matchInvOps=10 linkMismatches=0     ← the lane measured 0
§CREATEFROM-GATES noInvoice="@NotFound@ @C_Invoice_ID@" completed="not drafted…" emptySelection="@NotSupported@…"
🟢 W-CREATEFROM-INVOICE PASS — 16 PASS / 0 FAIL
```
Fixtures are REAL rows: purchase receipt **M_InOut 105** (`issotrx='N'`, CO, 10 lines all linked to real
`C_OrderLine`s) from `glassbowl_data.db`, and the real `C_Invoice 105` header put back into the DR/`Processed=N`
state a user's freshly created vendor invoice is in. No authored qty, no authored price.

**The witness earned its keep on the first run — it caught a real defect in the port.** `shipLineFields`
initially wrote `sLine.m_attributesetinstance_id || null`, which collapses a legitimate **0 to NULL**;
`setShipLine` calls the plain setters and does not translate. It failed on **all 10** rows
(`m_attributesetinstance_id op=null src=0`) and is fixed — the copy is verbatim, and only the BRANCH tests
use the Java's own `== 0` semantics. Two of the three first-run failures were the witness's own bugs
(column case from `SELECT *`, and a seed path with no `ad_process` table); the third was the product.

**Live-registered, end of chain verified by the app's own log** — not asserted:
`§AD-PROC-LIVE handlers=[… org.compiere.process.InvoiceGenerate,org.compiere.process.CreateFromInvoice]`
(`poc_ad_process_live` against the branch, still 🟢 PASS).

Regression: 20 `ad_process`-judging witnesses run before and after — **18 PASS / 2 FAIL, identical set,
0 regressions** (`poc_access_harden`, `poc_proc_picker` fail on the pre-change file too).

**Shipped:** bim-ootb `feat/erp-createfrom-invoice` — `erp/ad_process.js` + `erp/idempiere.html` wiring +
`erp/sw.js` v779→**v780**.

**⬜ Named-deferred, declared in `result.deferred`, not silently dropped:** the RMA-line corpus
(`setRMALine`), the cross-UOM branch (`MUOMConversion`), `setPrice()`/`setTax()` when a receipt line has no
order line (the price-list engine), and `invoice.updateFrom(order)`'s payment-schedule copy
(`MOrderPaySchedule`). **⬜ Still UI-side:** nothing yet drives this process from a screen — the handler is
registered and dispatchable, but the Info-Window selection UI that real iDempiere's CreateFrom dialog
provides is not built. Stage 8's engine is closed; its dialog is a separate, bounded item.

---

## §Fix — 2026-09-04b, **the CreateFrom ENTRY POINT**: the last piece of the UI three-way match

`AGENT_QUEUE.md §ERP-SESSION 2026-09-04c` ⬜ NEXT, and §Fix5.5's own named residual: *"nothing yet drives
this process from a screen — the handler is registered and dispatchable, but the Info-Window selection UI
that real iDempiere's CreateFrom dialog provides is not built."* Spec written BEFORE the code.

### §CF.1 WHY THIS IS THE ONLY PIECE LEFT — measured, not asserted
`witness_p2p_invoice_match.js` on `origin/main` today: stages **1/2/3 PASS**, **4a PASS**
(`M_MatchPO count=1`), **4b FAIL** (`M_MatchInv count=0`). The reason is one line:
```
§P2P-FILL m_inoutline_id value=-5 result=locked
§INVOICE-FANOUT invoice=-9 issotrx=N lines=1 matchInvOps=0
```
`AD_Field` locks `C_InvoiceLine.M_InOutLine_ID` `IsReadOnly='Y'` on tab 291 — **faithfully**: in real
iDempiere only `CreateFromInvoice` ever sets it (§Fix5.1's extract). `erp_engine.completeInvoice` emits a
match for every invoice line that HAS one, so the whole chain is already built and proven headless
(`W-CREATEFROM-INVOICE` 16/16). What is missing is the screen that runs the process.

### §CF.2 WHAT REAL iDempiere DOES, and what we build
`CreateFromInvoice.doIt` refuses unless `getAD_InfoWindow_ID() > 0` — **the Info Window IS the selection**.
The user opens a drafted vendor invoice, hits *Create From*, picks receipt lines, and the process inserts
them. We build the same shape with the pieces this app already has:
- **`renderCreateFromPicker(proc)`** — the same bespoke-pane pattern `renderOrderPicker` /
  `renderProjectPicker` already use off `openProcess`'s classname branch.
  1. **Invoice** — a `<select>` of **drafted vendor invoices** (`issotrx='N'`, DocStatus `DR`/`IP`),
     folded through `CORE.listTip` + `CORE.readTip` exactly as `renderOrderPicker` folds orders, so an
     invoice created in this session is offered. (Not doing so would repeat the very gap
     `ERP_FK_PICKER_SIDECAR.md` just closed.)
  2. **Lines** — on invoice pick, the candidate receipt lines: `M_InOutLine` whose header is
     `issotrx='N'`, DocStatus `CO`/`CL`, and **the same `C_BPartner_ID` as the invoice** — again folded.
     One row per line with a checkbox and a **Qty** input defaulted to the line's own `qtyentered`,
     which is precisely the Info Window's Qty column that `createLines()` reads.
  3. **Run** → `runProcess(proc, { C_Invoice_ID: id, selection: [{m_inoutline_id, qty}] }, id)`. The
     handler already accepts exactly this (`info.params.selection`, §Fix5.3) — **no handler change**.
- **`_procCtx` gains four accessors**, all sidecar-folded: `fetchInvoice`, `fetchReceiptLines`,
  `fetchOrderLine`, `fetchProduct`. These are the seams §Fix5.3 already specified.
- **`renderProcResult` gains one branch**: a result whose ops are all `C_InvoiceLine` `CREATE_LINE` and
  which has no `r.header` (this process ADDS to an existing document, it does not build one) renders the
  preview table + the SAME `§GENPROCESS-CONFIRM` *Confirm & Post* button, committing through the same
  `window.__crud.applyOpGroup`. Preview-then-confirm, like the other generators.

**Not built, and named:** a real Info Window (this is a purpose-built pane, as every other process in this
app is), multi-invoice selection, and the RMA/order-only selection sources — `createLines()` accepts
`C_Order_ID` and `M_RMA_ID` selections too; we offer the **receipt** source, which is the P2P mainline and
the only one `M_MatchInv` needs.

### §CF.3 THE PROOF — the lane's own end-to-end witness, not a new one
`witness_p2p_invoice_match.js` Stage 3 stops typing the invoice line by hand (it cannot — the column is
locked) and instead drives **the real screen**: open the process, pick the invoice, tick the receipt line,
Run, Confirm & Post, then Complete the invoice. **Stage 4b/4c go green or the entry point does not work.**
That is a stronger claim than any unit arm: `M_MatchPO` and `M_MatchInv` must end up sharing the same
`M_InOutLine_ID`, which is the three-way-match invariant this whole lane exists to prove.

### §CF.4 ACCEPTANCE
- `§P2P stage=4 ThreeWayMatch` reports **4a, 4b and 4c all 🟢**, with a non-empty
  `sharedInOutLineId`.
- `W-CREATEFROM-INVOICE` 16/16 unchanged (the handler is untouched).
- `W-PARITY-VALRULE` 23/23 and `W-PARITY-FIELDSET` 30/30 unchanged (`idempiere.html` is theirs too).

### §CF.5 RESULT 2026-09-04 — **the three-way match closes through the real UI. `§P2P stage=4 … PASS`.**
```
§P2P stage=1 PurchaseOrder   PASS   §P2P stage=2 MaterialReceipt PASS
§P2P stage=3 VendorInvoice   PASS   §P2P stage=4 ThreeWayMatch   PASS
   🟢 4a M_MatchPO count=1 · 🟢 4b M_MatchInv count=1 · 🟢 4c shared M_InOutLine_ID — shared=true
```
The path, entirely through the screen:
```
§CREATEFROM-LIVE invoices offered=1 ids=[-9]
§CREATEFROM-LIVE candidates invoice=-9 bpartner=120 lines=11 ids=[107,…,116,-5]
§P2P-CREATEFROM ticked m_inoutline_id=-5 of 11 offered
§CREATEFROM-LIVE run proc=200143 Record_ID(C_Invoice_ID)=-9 selection=[{"m_inoutline_id":-5,"qty":2}]
§CREATEFROM-LIVE fetchReceiptLines selected=1 resolved=1 unresolved=0
§CREATEFROM-INVOICE invoice=-9 selected=1 linesCreated=1 withInOutLine=1 withOrderLine=1
§CREATEFROM-COMMIT translating 1 CREATE_LINE → CRUD_CREATE for c_invoiceline
§GENPROCESS-CONFIRM table=C_InvoiceLine committed=Y gid=af825c97… ops=1 verifyOk=true
§INVOICE-FANOUT invoice=-9 issotrx=N lines=1 matchInvOps=1        ← was lines=1 matchInvOps=0
```
Both the fresh sidecar invoice (`-9`) and the fresh receipt line (`-5`) are offered — the pane folds
through `listTip`/`readTip`, so it does not re-open the gap `ERP_FK_PICKER_SIDECAR.md` closed.

**A real defect the first run exposed, worth the §-line it cost.** The engine proposes in ENGINE
vocabulary (`CREATE_LINE`); `crud_core.listTip` folds **only** `CRUD_CREATE/UPDATE/DELETE`. So the first
attempt committed perfectly — `§GENPROCESS-CONFIRM committed=Y ops=11 verifyOk=true` — and the very next
Complete still read `§INVOICE-FANOUT invoice=-9 lines=0 matchInvOps=0`: **eleven signed, verified,
unreadable rows.** A committed invoice line is a RECORD the CRUD layer owns (the grid reads it, the user
can edit it, the fan-out folds it), so the commit seam now translates to exactly the shape
`crud_core.buildOp('create')` produces — same op_type, same fields, `stdDefaults` from the same
`window.APP.*` that `sessionActor()` reads. Every value is the engine op's own; nothing is invented.
**⬜ The same mismatch applies to every KIND-2 generator** (`InvoiceGenerate`, `InOutGenerate`,
`ProjectGenOrder` all Confirm & Post raw `CREATE_LINE`/`CREATE_DOCUMENT`) — named here, not fixed, because
each needs its own witness run to prove what it currently is and is not readable by.

**Also corrected in the pane before shipping:** candidates default **unchecked**. The first run
pre-ticked all 11 and invoiced the vendor's entire completed history on one click.

**Regression:** `W-PARITY-VALRULE` 23/23 · `W-PARITY-FIELDSET` 30/30 (run from inside the worktree) ·
`poc_ad_process_live`, `poc_ad_displaylogic_live`, `poc_genpo_live`, `poc_minout_live`,
`poc_payment_live`, `poc_ad_menu_prf_live` all 🟢 against the branch · `W-CREATEFROM-INVOICE` 16/16
unchanged (the handler was not touched).
