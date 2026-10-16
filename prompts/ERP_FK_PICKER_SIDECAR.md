# ⚠ DO NOT REMOVE — scope guard
# ERP FK PICKER vs SIDECAR ROWS — a row you just created must be offerable in the next FK picker.
# Scope: the EDITABLE foreign-key <select> in crud_overlay.populateRefs. Nothing else — not the grid,
# not the info window, not the val-rule engine itself (which is correct and stays untouched).
# READ THE LOG (`§FKFOLD`, `§VALRULE`) before any conclusion. Exit code is NOT evidence.
# Honour this block until the lane is DONE.

Opened 2026-09-04, from a measured line — not a hunch. Found while fixing the P2P end-to-end witness
(`ERP_STOCK_EFFECT.md` §E4.7), which is where the diagnosis chain is recorded.

## §FK.1 THE DEFECT, in the app's own words
```
§VALRULE col=c_orderline_id vr=203 rule="C_OrderLine of Order" table=c_orderline
         before=117 after=0 offered=0 verdict=applied ctx={"C_Order_ID":-1}
```
Read it left to right: the val rule is **correct** — iDempiere's `C_OrderLine of Order` filters the
PO-line picker to the order being received against. That order is the one the user **just created**, so
its id is the sidecar's `-1`. The picker's candidate query runs `SELECT … FROM c_orderline WHERE …`
against the **raw bundle**, which has no such row. 117 candidates → **0 offered**.

**User-visible consequence:** create a Purchase Order → create a Material Receipt against it → the PO-line
picker is **empty**, and the receipt line cannot be linked at all. The three-way match is unreachable
through the UI for any document created in this session.

`crud_overlay.js` **already documents this exact gap** for the neighbouring case — §ORDERLINE-PARENT-FK:
*"The full LIST query below is scoped to the raw base table and can NEVER include a synthetic/overlay-only
row (a freshly created parent, negative pk)."* That fix short-circuited the **read-only** parent-link FK.
The **editable** FK was left on the raw query, where it was merely incomplete — until `AD_Val_Rule`
filtering (#1626) turned "incomplete" into "empty".

This is the **third** instance of one class the docs already name twice (`ERP_BUSINESS_CYCLE_E2E.md`
§Fix 2026-07-21 for `renderOrderPicker`, §Fix 2026-07-22 for the parent FK): **a read that goes to the raw
bundle cannot see what this session wrote.**

## §FK.2 THE FIX — same query, folded source. One predicate, not two.
`_fkFoldSource(db, t, pk)` returns the table the picker should query:
- **Gate first.** One indexed probe of the sidecar (`kernel_ops` LIKE `"table":"<t>"`). No CRUD ops for
  this table ⇒ return `t` unchanged. The common case pays one query and is byte-identical to before.
- **Otherwise** materialise `CORE.listTip(SIDE, t, pk, baseRows, null).rows` — the app's own fold, already
  used by `completeFanoutReceipt`, `renderOrderPicker` and `_foldOrderRow` — into a TEMP table, and point
  the SAME `SELECT`, with the SAME val-rule `WHERE`, the SAME `refWhere` and the SAME `LIMIT 200`, at it.
  Creates, updates and tombstones all come along, because `listTip` already handles them.
- **The admitted set moves with it.** §P3.6's invariant is that the OFFERED set and the ACCEPTED set are
  one set *by construction*; if the offered list folds and the `f.admitted` probe does not, a folded row
  would be offered and then rejected by `validateField`. Both now read `src`.
- **Any failure degrades to the raw bundle and says so** (`§FKFOLD … FAILED … → raw bundle`) — never worse
  than today, never silent.

**Deliberately NOT changed:** the val-rule engine (`ad_valrule.js`), the rule SQL, the unresolved-token
`noRows` semantics, the List/`AD_Ref_List` branch, and the read-only parent-FK short-circuit. Only the
row SOURCE moves.

## §FK.3 THE PROOF — what actually exists, stated honestly
The §FK.2 spec listed seven headless arms. `_fkFoldSource` lives inside `crud_overlay.js`, a browser
module that is not node-loadable, so a headless unit witness would have to judge a COPY — the exact defect
`W-ERP-TWIN` exists to prevent. The proof is therefore the LIVE one, and it is a real assertion, not an
observation: `witness_p2p_invoice_match.js` Stage 2 now reads the picker's own option list and
**throws** when it is empty —
```
if (!offered.length) throw new Error('c_orderline_id picker offered NOTHING for the fresh PO — the §FKFOLD fold did not reach it');
```
The remaining spec arms are covered by instruments that already exist and were re-run: **predicate
unchanged** and **admitted == offered** are `W-PARITY-VALRULE`'s subject (23/23), and **no sidecar ops ⇒
no change** is the gate's own early return, exercised by every other table in those same 23 checks.

## §FK.4 RESULT 2026-09-04 — CLOSED, and it took three wrong guesses to find the real cause
```
BEFORE §VALRULE col=c_orderline_id vr=203 … before=117 after=0 offered=0 verdict=applied ctx={"C_Order_ID":-1}
AFTER  §VALRULE col=c_orderline_id vr=203 … before=117 after=1 offered=1 verdict=applied ctx={"C_Order_ID":-1}
       §P2P-PICKER c_orderline_id offered=["-2"]        ← the PO line the user created seconds earlier
```
**Three failed hypotheses, each disproven by the app's own log rather than by reasoning** — recorded
because the last one is a trap anyone folding rows into SQL will hit:
1. *"the temp table breaks table-qualified column refs"* — REAL, and fixed by aliasing
   (`__fk_fold AS c_orderline`); an AD_Val_Rule's Code is genuine iDempiere SQL and vr 203 is literally
   `C_OrderLine.C_Order_ID=@C_Order_ID@`. Measured before the alias:
   `offered=118 verdict=where-failed:no such column: C_OrderLine.C_Order_ID` — it had silently
   **offered all 117 unrelated lines**. Necessary, but not sufficient: still `offered=0` after.
2. *"`CREATE TABLE AS SELECT … WHERE 0` loses column affinity"* — plausible, and the temp table is now
   built from `PRAGMA table_info` for that reason, but NOT the cause: measured, this bundle's columns
   carry **no declared type at all**, so neither table has affinity.
3. **THE ACTUAL CAUSE — column-name CASE.** `cols` are the BUNDLE's names, which carry the AD's
   CamelCase (`C_OrderLine_ID`); a `listTip`-created row's keys are the op's lowercase field names
   (`c_orderline_id`). `r[c]` therefore bound **NULL for every column of every folded row**. It hid
   perfectly: base rows are built from those same `cols` so they inserted correctly, and the counts all
   looked right — `attempted=118 inserted=118 failed=0 tableCount=118` — while the fold did nothing.
   Only printing the stored row exposed it: `[null,"null",null,"null"]` where the JS row read
   `c_orderline_id=-2 c_order_id=-1 typeof=number`. The bind is now case-insensitive.

**Regression:** `W-PARITY-VALRULE` **23/23**, `W-PARITY-FIELDSET` **30/30** — both re-run from inside the
branch worktree, because these two derive their ROOT from `__dirname` and **silently ignore `ERP_ROOT`**
(they were first run against `~/bim-ootb` by mistake; the instrument had to be checked before the result
was believed). 27 `crud_overlay`-judging witnesses before and after: **25 PASS / 2 FAIL, identical set, 0
regressions** (`poc_report_open`, `test_crud_overlay` fail on the pre-change file too).

**Shipped:** bim-ootb `fix/erp-fk-picker-sidecar` — `erp/crud_overlay.js` + `erp/sw.js`.
