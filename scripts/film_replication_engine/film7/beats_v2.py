# ⚠ DO NOT REMOVE — film7 v2 beat table (EN): BIG PICTURE, REAL SCREENS ONLY, no illustration cards. One through-line: source books -> migrate -> twin books.
# No digit typed in a voiced line: numbers are {fact:id} (facts7_resolve.js, this session's logs). Legacy screen = the iDempiere test instance :8108 (base seed, GardenWorld, read only); its Account Viewer figures are ASSERTED
# against the witnessed §IDO-SOURCE values by verify_v2.py (bank 248.00-100.00 == ido_bank_total; receivable 581.41-151.05 == ido_ar_total), so no parity is implied that is not checked.
# image kinds as build7: ("shot", file, label) | ("two", fa, la, fb, lb); crops come from the sidecar json beside each still. waits= marks a placeholder NOT rendered.
ALPHA = "ALPHA · test-supplied ledger"
ITEMS = [
 # the owner's two chapter cards (explicit exception to "no cards"): ONE opening, ONE closing, silent holds (PLAYBOOK C: 3.6 s plain dark card, 0.4 s fades, no voice over a card)
 ("card", "part2", dict(dur=3.6, kicker="Part II of Leaving Others for Kernel ERP", l1="Migrating", l2="Accounting", line="")),
 ("beat", "legacy_ar", dict(image=("shot", "legacy_ar.png", "Moving your old books · legacy iDempiere, Account Viewer (read only)"), strip="customers owed, net: {ido_ar_total}", src="legacy screen + §IDO-SOURCE AR (mig_idempiere_open.log)",
   short="F: This is the old books? | M: A legacy iDempiere, read only. Customers owed {fact:ido_ar_total}.",
   detail="F: This is the old books? | M: A legacy iDempiere, read only, in its own Account Viewer. Customers owe {fact:ido_ar_total} net.")),
 ("beat", "legacy_bank", dict(image=("shot", "legacy_bank.png", "legacy iDempiere · the bank account"), strip="bank, net: {ido_bank_total}", src="legacy screen + §IDO-SOURCE BANK (mig_idempiere_open.log)",
   short="F: And the bank? | M: {fact:ido_bank_total}, net.",
   detail="F: And the bank? | M: The checking account nets to {fact:ido_bank_total}. Suppliers are owed {fact:ido_ap_total}. {fact:ido_tb_accounts} accounts in all.")),
 ("beat", "method", dict(image=("shot", "ido_01_summary.png", "Our twin · one file, one summary, nothing written yet"), src="spec: owner statement 2026-11-11; iDempiere wiki 'Establish Opening Balances' (§B3-SCOUT)",
   short="M: The method is the phantom single-transaction one. Nothing is written yet.",
   detail="M: The method is the one Steven Sackett of Adaxa Australia came up with: the opening journal goes through clearing accounts, then one phantom sale or purchase per open item, so the books land on the closing balances. | F: And here? | M: One file, one summary, nothing written yet.")),
 ("beat", "process", dict(image=("shot", "ido_02_done.png", "Our twin · Process"), strip="books checked against the source: {ido_verify_judged} checks", src="§MIG-VERIFY (record.log ido_verify_line)",
   short="F: Then Process? | M: One press, and the books are checked.",
   detail="F: Then Process? | M: One press. The books are checked against the source, {fact:ido_verify_judged} checks, and none failed.")),
 ("beat", "twin_books", dict(image=("shot", "twin_trial_balance_run.png", "Our twin · Trial Balance"), strip="receivable {ido_ar_in} came across · holding account keeps {ido_ar_left}", src="twin Trial Balance run (twin.log); §MIG-OPEN / §MIG-CLEAR (mig_idempiere_open.log)",
   short="F: And our books? | M: The same, with {fact:ido_ar_left} left on the holding account.",
   detail="F: And our books? | M: Our trial balance, the same figures. Customers came across as {fact:ido_ar_in} of invoices. {fact:ido_ar_left} is a euro invoice, left on the holding account, not converted yet. The books add up.")),
 ("beat", "aging", dict(image=("shot", "twin_open_items_run.png", "Our twin · Open Items (Aging)"), strip="open customer invoice: {ido_ar_in}  ·  checked {oi_judged} ways against legacy", src="twin Open Items run (twin2.log); §OPENITEMS-VERDICT (mig_openitems.log); §IDO-SOURCE/§MIG-OPEN AR",
   short="F: And what is still owed? | M: The open-items report shows the invoice, {fact:ido_ar_in}.",
   detail="F: And what is still owed? | M: Our open-items report lists the customer invoice that came across: {fact:ido_ar_in}, the same invoice the old viewer shows. The report itself was checked against legacy {fact:oi_judged} ways.")),
 ("beat", "odoo", dict(image=("shot", "odoo_03_done.png", "Odoo's file · our twin"), strip="{odoo_open_docs} open documents · customers owe {odoo_ar_open} · suppliers are owed {odoo_ap_open}", src="§FILMREC odoo_open_docs/odoo_ar_open/odoo_ap_open (record.log)",
   short="F: And Odoo? | M: The same, from one file.",
   detail="F: And Odoo? | M: The same, from one export file. {fact:odoo_open_docs} open documents; customers owe {fact:odoo_ar_open}, suppliers are owed {fact:odoo_ap_open}. Checked against the file's own rows, not against an Odoo screen.")),
 ("beat", "sap", dict(alpha=True, image=("shot", "term_sap.png", "SAP Business One · the agent, in a terminal"), strip="{sap_term_calls} calls, read only (the line the terminal prints)", src="§SBO-CHECK SAP-READER read-only (mig_sapbc_open.log); term.log",
   short="F: SAP? | M: Alpha, on a test ledger. The agent only reads.",
   detail="F: And SAP? | M: Alpha, on a test ledger. The agent only reads: {fact:sap_term_calls} calls, nothing written.")),
 ("beat", "bc", dict(alpha=True, image=("shot", "bc_01_summary.png", "Business Central · our form reads its Excel package · ALPHA"), src="record.log bc form (BC has no program: the package is its real route)",
   short="F: And Business Central? | M: No program: its Excel package.",
   detail="F: And Business Central? | M: It has no program to run. You export its configuration package, an Excel file, and our form reads it. Alpha, on a test ledger.")),
 ("beat", "sapbc", dict(alpha=True, image=("two", "sap_02_done.png", "SAP Business One · ALPHA", "bc_02_done.png", "Business Central · ALPHA"), strip="holding account keeps {sbo_ar_left} in the test ledger", src="§MIG-CLEAR AR (mig_sapbc_open.log)",
   short="M: Both load. The holding account keeps {fact:sbo_ar_left}.",
   detail="M: Business Central has no program, only its Excel package. Both load into our forms, and the holding account keeps {fact:sbo_ar_left} of the test ledger.")),
 ("beat", "trade", dict(image=("two", "twin_payment_window_a.png", "Payment and Receipt window", "twin_salesorder_window_a.png", "Sales Order window"), strip="trade check on the migrated books: {trd_judged} checks passed", src="§TRD-VERDICT (mig_migration_trade.log); windows: twin.log TWINSCREEN",
   short="F: Can I trade on it? | M: {fact:trd_judged} checks passed.",
   detail="F: Can I trade on it? | M: These are the windows. The trade check ran on the migrated books, paying a moved invoice of {fact:trd_pay} and then a new sale: {fact:trd_judged} checks passed. It was run on the model, not by clicking these windows.")),
 ("beat", "refusal", dict(image=("shot", "odoo_06_refusal.png", "A missing document: the books check refuses"), strip="left on the receivables holding account: {rf_amount}", src="§FILMREC rf_amount (record.log)",
   short="F: If a document is missing? | M: It refuses and says by how much.",
   detail="F: If a document is missing? | M: It refuses and says by how much: {fact:rf_amount} stuck on the holding account. Fix the file, run it again in the same company.")),
 ("beat", "recovered", dict(image=("shot", "odoo_07_recovered.png", "The corrected file, same company"), src="§FILMREC rc_resume_ok (record.log)",
   short="M: Same company, it completes.",
   detail="M: Same company, corrected file: it completes and checks the books again. The same file twice says nothing to do.")),
 ("beat", "scope", dict(image=("shot", "twin_trial_balance_run.png", "Our twin · the books after"), src="spec §3 rule 4 (named limits)",
   short="M: Balances and open items move. History stays.",
   detail="M: What moves is the balances forward and every open item. Closed history stays in the old system, read only. Payments on account, foreign currency, and open orders are not brought in.")),
]
CLOSING_TEXT = "A healthy ERP is one that you can take out."   # FINAL, owner-approved wording, verbatim: the ONE line to change, then `build_v2.py closing <dir>` re-renders only that card
_w = CLOSING_TEXT.split(); _h = (len(_w) + 1) // 2
ITEMS.append(("card", "closing_card", dict(dur=5.0, kicker="", l1=" ".join(_w[:_h]), l2=" ".join(_w[_h:]), line="")))
ITEMS = [i for i in ITEMS]
