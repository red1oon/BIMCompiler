# ⚠ DO NOT REMOVE — film7 v2 beat table (EN): BIG PICTURE, REAL SCREENS ONLY, no illustration cards. One through-line: source books -> migrate -> twin books.
# NO digit typed in a voiced line: numbers are {fact:id} from facts7_resolve.js. waits="legacy" = needs the legacy iDempiere web-UI capture (owner has not yet allowed the login); NOT built.
# screens: rec/ = record7.js stills of the twin page; twin/ = record_v2_twin.js (twin Trial Balance report run, a real screen); term = real agent output rendered in a terminal window (to build).
# Parity honesty: iDempiere legacy-vs-twin books ARE witnessed (§IDO LOAD books-are-the-source, mig_idempiere_open.log). Odoo / SAP / BC: twin vs the export file's rows only, never vs a vendor screen.
ITEMS = [
 ("beat", "legacy_books", dict(waits="legacy", screen="legacy:account_viewer_or_trial_balance", title="Moving your old books", src="§IDO-SOURCE (mig_idempiere_open.log): legacy GardenWorld ledger at the cut-over",
   detail="F: This is the old books? | M: A legacy iDempiere, read only. {fact:ido_tb_accounts} accounts. Customers owed {fact:ido_ar_total}, suppliers {fact:ido_ap_total}, the bank {fact:ido_bank_total}.")),
 ("beat", "method", dict(screen="rec/ido_01_summary.png", src="spec: owner statement 2026-11-11; method per the iDempiere wiki 'Establish Opening Balances' (§B3-SCOUT)",
   detail="M: The method is the one Steven Sackett of Adaxa Australia came up with: the opening journal goes through clearing accounts, then one phantom sale or purchase per open item, so the books land on the closing balances. | F: And here? | M: One file, one summary, nothing written yet.")),
 ("beat", "process", dict(screen="rec/ido_02_done.png", strip="checked against the source: {ido_verify_judged} checks", src="§MIG-VERIFY (record.log ido_verify_line)",
   detail="F: Then Process? | M: One press. The books are checked against the source, {fact:ido_verify_judged} checks, and none failed.")),
 ("beat", "twin_books", dict(screen="twin/twin_trial_balance_run.png", src="§MIG-OPEN / §MIG-CLEAR / §IDO-SOURCE (mig_idempiere_open.log); twin Trial Balance report (twin.log TWINSCREEN)",
   detail="F: And our books? | M: Our trial balance. The bank is {fact:ido_bank_total}, the same. Customers came across as {fact:ido_ar_in} of invoices; {fact:ido_ar_left} is a euro invoice, left on the holding account, not converted yet. The legacy side was compared with ours, account by account.")),
 ("beat", "odoo", dict(screen="rec/odoo_03_done.png", strip="{odoo_open_docs} open documents · customers owe {odoo_ar_open} · suppliers are owed {odoo_ap_open}", src="§FILMREC odoo_open_docs/odoo_ar_open/odoo_ap_open (record.log)",
   detail="F: And Odoo? | M: The same way, from one export file. {fact:odoo_open_docs} open documents; customers owe {fact:odoo_ar_open}, suppliers are owed {fact:odoo_ap_open}. Checked against the file's own rows, not against an Odoo screen.")),
 ("beat", "sapbc", dict(waits="terminal", alpha=True, screen="term:sap_agent + rec/sap_02_done.png", src="§SAP-OPEN (prep.log); §MIG-CLEAR (mig_sapbc_open.log)",
   detail="F: SAP and Business Central? | M: Alpha, on a test ledger. The agent only reads: {fact:sap_agent_calls} calls, nothing written. Our form takes the file; the holding account keeps {fact:sbo_ar_left}.")),
 ("beat", "refusal", dict(screen="rec/odoo_06_refusal.png", strip="left on the receivables holding account: {rf_amount}", src="§FILMREC rf_amount (record.log)",
   detail="F: If a document is missing? | M: It refuses and says by how much: {fact:rf_amount} stuck on the holding account. Fix the file, run it again in the same company.")),
 ("beat", "recovered", dict(screen="rec/odoo_07_recovered.png", src="§FILMREC rc_resume_ok (record.log)",
   detail="M: Same company, corrected file: it completes, and checks the books again. The same file twice says nothing to do.")),
 ("beat", "scope", dict(screen="twin/twin_trial_balance_run.png", src="spec §3 rule 4 (named limits)",
   detail="M: What moves is the balances forward and every open item. Closed history stays in the old system, read only. Payments on account, foreign currency, and open orders are not brought in.")),
]
