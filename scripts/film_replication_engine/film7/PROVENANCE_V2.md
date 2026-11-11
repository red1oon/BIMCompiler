# PROVENANCE v2 (prep, legacy screens pending)
- Credit sentence (beat `method`): owner's statement 2026-11-11; method as in the iDempiere wiki "Establish Opening Balances" (prompts/MIGRATE_INSTALL_TENANT.md §B3-SCOUT). Source note, not a witness value.
- Legacy-side figures (beat `legacy_books`): numbers from `§IDO-SOURCE` (logs/mig_idempiere_open.log via facts7.resolved.json: ido_tb_accounts, ido_ar_total, ido_ap_total, ido_bank_total) until the legacy screen is captured.
- Twin side: twin Trial Balance report run (logs/twin_v2.log `TWINSCREEN twin_trial_balance RUN`): bank 148.00, receivable 161.12, payable -6949.00, "balanced=true" (equal to ido_bank_total / ido_ar_in / ido_ap_total). Legacy-vs-twin books are witnessed by `§IDO-CHECK case=LOAD key=books-are-the-source`.
- Dropped as screens (not illustrated): twin "Open Items (Aging)" (process classname blank, not ported: `Failed to create new process instance`), Odoo/SAP/BC vendor screens (none witnessed against ours), trade flow (witness is Node-level; the twin has Payment and Receipt (235) and Sales Order (129) windows but no UI driver is built).

## Built v2 (EN_v2.mp4, 163.7 s, 12 beats, 0 cards) — what is a real screen
- Legacy iDempiere Account Viewer (test instance :8108, GardenWorld, read only, GardenAdmin demo user): legacy_ar / legacy_bank stills. verify_v2 asserts the on-screen subtotals (bank 248.00-100.00, receivable 581.41-151.05) equal the witnessed §IDO-SOURCE bank/AR; PASS.
- Twin: forms (record.log), Trial Balance report run (twin.log), Payment and Receipt / Sales Order windows (opened, blank new record; NOT driven to a payment/order through the UI: that needs a generic window-edit driver that does not exist yet; the trade is witnessed at model level, §TRD-VERDICT).
- SAP: real agent CLI output rendered from the actual process (term_shot.js; the on-screen "calls=8" is the terminal's own line, fact sap_term_calls). BC: no program exists; only its form (alpha).
- Placeholder not rendered: `aging` (twin Open Items (Aging), another worker's port).

## Update (cards, aging, BC, trade finding)
- Cards: owner's exception, exactly two, silent holds (opening 3.6 s, closing 5.0 s, fades 0.4 s, PLAYBOOK C look); closing wording is one line `CLOSING_TEXT` in beats_v2.py, swap + `build_v2.py closing <dir>`.
- Aging beat: twin Open Items (Aging) run, 1 open item 161.12 = §MIG-OPEN AR (verify_v2 asserts); report checked `§OPENITEMS-VERDICT` (mig_openitems.log).
- BC: the form reading its Excel package (the real route; no program exists). ALPHA.
- Trade through the windows (record_v2_trade.js, generic window-edit driver: New, fill by AD column, Save, docstatus): the Payment window REJECTS Save: "Mandatory: C_BankAccount_ID". Cause: ad_modelval.js:626 `Number(r.c_bankaccount_id) > 0`, a faithful port of MPayment.java:696 `getC_BankAccount_ID() <= 0`, but the migrated tenant's rows are in the twin's local negative id space (bank accounts -80/-78/-76, invoices -161...), so every locally created bank account fails the legacy test. Defect for the twin owner, not a driver gap; not filmed (not "as shipped" story).
- Odoo's own screens: needs a login to the local Odoo (:8069); not attempted under the "no further logins" instruction. Dropped.
