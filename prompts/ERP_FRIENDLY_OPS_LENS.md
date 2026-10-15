# ⚠ DO NOT REMOVE — scope: observe Odoo (then ERPNext) to find user-friendlier OPERATIONS and offer them as an OPT-IN lens over the Kernel ERP. READ THE LOG after every run.
Started 2026-10-15 on the owner's word ("proceed on our observation of Odoo et al to adopt more user friendly ops").

## 1. Rules this spec lives under (no new ones invented)
- **TWIN CARDINAL RULE (CLAUDE.md):** the default SQLite ERP stays equal to legacy iDempiere, L&F included. A friendlier operation is therefore a **lens the user switches on**, never a change to the default screens or results. The parallel run (`scripts/bridge/run_all.sh`) must stay green with the lens OFF, and the lens ON must produce the **same books** (same documents, same posting) by fewer or easier gestures.
- **Licence (README / `erp/lens/odoo/README.md`):** Odoo CE is LGPL-3.0, ERPNext GPL-3.0; both are incompatible with GPLv2-only. We observe behaviour (run it, record the gestures and executed rows) and write our own code. No Odoo/ERPNext source, schema or templates copied into `erp/`. Odoo Enterprise: never.
- **Primal law:** the user's eyes are never the test instrument. Friendliness is measured as numbers (gestures, screens, fields typed, errors), asserted by a witness.

## 2. What "friendlier" means here (measurable)
For one business flow F and one actor: **G(F)** = count of discrete gestures (click, key chord, typed field) from a fresh window to the finished, posted result; **S(F)** = screens/windows opened; **M(F)** = mandatory fields the user must fill that the system could have defaulted; **R(F)** = places the user must remember a number from one screen to type on another.
A lens op qualifies when it lowers at least one of G/S/M/R for the same final books (diff = 0 on `fact_acct` and stock) and breaks none of the others.

## 3. Method (per flow)
1. Pick the flow. First set: (a) sales order → ship → invoice → pay, (b) purchase → receive → vendor bill, (c) manufacturing order → issue → receive (the Libero film flow, 43 clicks measured on the twin: `erp/tests/film_mfg_intro.js`, `§ERP_FILM_CURSOR clicks=43`).
2. Record the twin's G/S/M/R with the film recorder's click log (already numeric).
3. Run the same flow on a throwaway Odoo 17 (docker `odoo` + `odoo-db`, local only) with Playwright, recording the same four numbers and the executed rows (document states, stock moves, journal items) as a static oracle (`out/odoo_<flow>.json`). ERPNext second, same shape.
4. List every place Odoo needs fewer gestures. Each becomes a named candidate `FO-n` with: what it does (behaviour only), which twin verb already exists, what is missing.
5. Implement each accepted candidate once in the generic AD layer (AD-LAYER LAW: no per-window code), behind the lens switch. Witness RED then GREEN: (i) lens OFF == legacy, (ii) lens ON books == lens OFF books, (iii) G/S/M/R strictly lower.

## 4. Candidate ideas to test (hypotheses, NOT findings until measured)
Confirm-and-do-next buttons that chain the follow-on documents (ship, invoice) in one step; smart buttons showing counts of related documents; quick-create of a partner or product inside a field; sensible defaults for warehouse, price list and UOM; one-step Produce for a manufacturing order (issue + receive in one go); inline editable lines; chatter-style activity log on a record. The twin already has Zoom Across, Posted view and POS document types, so first check what exists.

## 5. Status
- [x] Spec written (this file).
- [x] Odoo 17.0.1.3 started 2026-10-15 (docker `odoo` + `odoo-db`, localhost:8069, db `odoodemo`, admin/admin). Installed: sale_management, purchase, stock, account. **`mrp` is NOT installed**, so flow (c) needs `mrp` installed into this throwaway DB first; start with flows (a) and (b).
- [ ] Flow (c) measured on both (the Libero flow, since its film already gives the twin side).
- [ ] FO-n candidate list with numbers.

## 6. Lane split against the ERPNext work (so the two lenses never overlap)
The ERPNext column already exists in `prompts/ERP_FIRST_SETUP_GUIDE.md §FS-ERPNEXT` (docs-only, first-setup/onboarding, ERP-depth session). Split by **lifecycle phase**, and record the owner on every `FO-n`:
| Phase | Owner lens | Examples |
|---|---|---|
| Setup / onboarding (tenant, company, chart of accounts, fiscal year, users and roles, naming series, form customisation) | **ERPNext/Frappe** (ERP-depth session, §FS-ERPNEXT) | setup wizard, doctype customise, naming series |
| Day-to-day operations on documents (create, chain, find, correct) | **Odoo** (this lane) | see candidates below |
Rule: a candidate whose job is "get a new client running" goes to the ERPNext lane; one whose job is "work the documents of an already-running client" goes here. A candidate that fits both is claimed in this table by whoever writes it first; the other session reads the table before starting.
ERP-wide Odoo candidates beyond Manufacturing (all hypotheses until measured): FO-A next-step buttons that chain follow-on documents; FO-B smart buttons with counts of related records; FO-C quick-create inside a field; FO-D saved filters, group-by and favourites on every list; FO-E bank reconciliation widget for payments vs statement lines; FO-F activity/chatter log with scheduled follow-ups on a record; FO-G defaults and on-change that remove mandatory typing; FO-H pivot/graph views from any list. Unclaimed until measured.

## 7. Observation log - Odoo 17.0.1.3 Manufacturing Order (2026-10-15, local throwaway `odoodemo`, `mrp` installed by the owner's OK)
Recorder `scripts/odoo_observe/mo_flow.js` (Playwright, gestures counted as `§ODOO_GESTURE`, login excluded), RPC helper `scripts/odoo_observe/rpc.py`, log `build/erp/logs_odoo_observe/mo_flow_2026-10-15.log`. Product: `[FURN_8522] Table Top` (BOM 3: 2 x Wood Panel per unit), quantity 100, component stock set to 10000 off-camera by RPC (same as the twin film's off-camera prerequisite).
**Measured (§ODOO_GESTURES):** new order to a *Confirmed* order = **7 gestures** (apps menu, Manufacturing, New, type product, pick product, type quantity, Confirm) = 5 clicks + 2 typed fields.
**Facts read from the live form/RPC (not assumptions):**
- FO-M1 picking the product alone filled BOM, planned components ("Wood Panel 2.00 / 200.00" once quantity is 100), start/finish dates and responsible, with 0 extra gestures. The twin's callout fills routing/BOM/UOM/batch size, but the component lines exist only after Save (the explosion runs in afterSave). Candidate for the lens: show the planned component list before save (display only; the saved result must stay identical to legacy).
- FO-M2 Confirm reserved the components itself (picking type `reservation_method=at_confirm`, `reservation_state=assigned`, "Check availability" never needed with stock present).
- FO-M3 the order form carries the next actions as buttons on the record (Produce All, Plan, Unreserve, Scrap, Mass Produce, Cancel) plus a "Product Moves" button for the related stock moves. Compare Zoom Across in the twin.
- OPEN: completing the order in the driver is NOT yet reproduced. Observed: "Produce All" raised a Consumption Warning (consumed 0.00 of expected) and then "You produced less than initial demand" (backorder), and typing 100 into the produce quantity was reset to 1.00 by the form's on-change. Until a clean full-quantity completion is recorded, no completed-order gesture count is claimed for Odoo. Do not read the 7 as "Odoo is faster", only as "order to Confirmed".
- Twin side not yet isolated: the film's 43 clicks cover the whole story; the per-beat count for create+complete (beats b5+b5b) still has to be read from the recorder log before comparing.
Throwaway data left behind in `odoodemo`: MOs WH/MO/00007-00014 (some in progress) and component stock 10000; disposable.

## 8. Integrity contract for lens operations (owner directive 2026-10-15)
> *"our .save() equivalent must have same overriding doc event rules. All in respective layers for similar ease of maintenance. ... happening only in own Kernel ERP lane ... unless we can also likewise setup same sequence of events. That be solid ground to report model integrity on."*
1. **One write path.** A lens op never writes a table itself. Every record it creates or changes goes through the twin's `.save()` (`erp/model_layer.js`: model `beforeSave` -> `BEFORE_NEW|BEFORE_CHANGE` validators -> write -> model `afterSave` -> `AFTER_NEW|AFTER_CHANGE`, lines ~296-302, 484-493) and every document state change through the doc-action engine (`erp/ad_docfsm.js` plus the model's `docActions`). The event rules live in those layers only, never in the lens, so there is one place to maintain.
2. **Layers.** UI lens (what the user sees and clicks) -> generic AD layer (callouts, defaults, access) -> model layer (`.save()` and events) -> doc layer (doc-action FSM) -> kernel op-log. A lens module may call downward only through each layer's public entry point. A lens needing a new rule adds it to the layer that owns it (AD-LAYER LAW), not to the lens.
3. **Scope.** Lens ops exist only in the Kernel ERP lane. Legacy iDempiere is unchanged and has no lens. The integrity claim therefore compares the twin's event sequence for a lens gesture with the sequence legacy produces for the equivalent plain gestures.
4. **The report = event-sequence equality (`§EVENT_SEQ`).** Add one ordered trace line per fired event at the two existing choke points (`fire()` in `model_layer.js`, the doc-action dispatcher): `§EVENT_SEQ op=<n> table=<t> id=<k> event=<BEFORE_NEW|AFTER_SAVE|DOCACTION:CO|...>`. Witness, per lens op: (a) the sequence from the lens gesture equals the sequence from the equivalent un-lensed gestures, event for event, in order; (b) wherever the legacy pilot can run the same business step (`scripts/pilot`, WS types), its model-event order is read once and the twin's must equal it; where legacy cannot be driven, the claim is labelled "twin-internal" and not "legacy-equal". (c) `fact_acct`, stock and document numbers equal. Verdict prints `INCONCLUSIVE`, never PASS, if the sequence was empty or a table was not exercised.
5. **What is reported.** Per candidate FO-n: gestures before/after, `§EVENT_SEQ` equal Y/N (count of events compared), books equal Y/N, legacy-checked Y/N. Model integrity is claimed only on the rows where all are Y.

## 9. §EVENT_SEQ built (2026-10-15)
`erp/model_layer.js`: `ev()` traces `M.beforeSave`, `V.<timing>`, `WRITE_INSERT|UPDATE|DELETE`, `M.afterSave`, `M.before/afterDelete` and `DOC:<action>`/`DOC:prepareIt|completeIt|post|<method>` when `env.eventSeq` is set (off = no events, no log). `ML.eventSeq(trx)` returns `event@table` strings (ids left out on purpose). Witness `erp/tests/witness_event_seq.js` (W-EVENT-SEQ): 9 judged / 0 failed; expected orders are hand-written from PO.saveNew/saveUpdate/delete; E5 proves an empty trace is INCONCLUSIVE; `EVSEQ_BREAK=bypass` (a lens that writes the table directly) goes RED on E6 and exits 1. Full `erp/tests/witness_*.js` run: 12 fail + 1 timeout, ALL identical on a clean origin/main (core_untouched, dashboard_*, fn_parity, goal_engine, gridtab_live, nc5bcd_gainloss, quicksetup, setup_lens, window_lens); nothing new red. Next: the first lens op (FO-C quick-create or FO-M1) is implemented against this witness.
