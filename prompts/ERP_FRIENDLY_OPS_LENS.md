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
- [ ] Spec written (this file).
- [ ] Odoo 17 container started, login verified, demo data present.
- [ ] Flow (c) measured on both (the Libero flow, since its film already gives the twin side).
- [ ] FO-n candidate list with numbers.
