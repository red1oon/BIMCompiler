# PROVENANCE — film "Migrating Legacy Accounting" (EN)

Every number on a card or in the voice is `{fact:id}` in `beats7.py`, resolved by `facts7_resolve.js` from a log line written in the session that built the film
(`/tmp/count_logs/mig_*.log` from `erp/tests/run_migration_lane.sh` SLOW=1 + `witness_migration_trade.js`; `record.log` from `record7.js`). Stills are the REAL page, numbers inside them are the page's own.

| fact | value | beats | source (file:line) | § line |
|---|---|---|---|---|
| ido_ap_total | -6949.00 | legacy_bank | mig_idempiere_open.log:1 | `§IDO-SOURCE db=idempiere_test client=11 cutover=2026-11-10 currency=USD tb_accounts=20 tb_sum=0.00 AR=430.36 AP=-6949.00 BANK=148.00 open_docs=6 broug` |
| ido_ar_in | 161.12 | aging, twin_books | mig_idempiere_open.log:54 | `shipped> §MIG-OPEN documents=5/5 partners=3 differing=0 not_ok=0 AR=161.12 AP=-6949.00 verdict=PASS` |
| ido_ar_left | 269.24 | twin_books | mig_idempiere_open.log:50 | `shipped> §MIG-CLEAR AR account=AR-CLEAR balance=269.24 expected=269.24 verdict=PASS` |
| ido_ar_total | 430.36 | legacy_ar | mig_idempiere_open.log:1 | `§IDO-SOURCE db=idempiere_test client=11 cutover=2026-11-10 currency=USD tb_accounts=20 tb_sum=0.00 AR=430.36 AP=-6949.00 BANK=148.00 open_docs=6 broug` |
| ido_bank_total | 148.00 | legacy_bank | mig_idempiere_open.log:1 | `§IDO-SOURCE db=idempiere_test client=11 cutover=2026-11-10 currency=USD tb_accounts=20 tb_sum=0.00 AR=430.36 AP=-6949.00 BANK=148.00 open_docs=6 broug` |
| ido_tb_accounts | 20 | legacy_bank | mig_idempiere_open.log:1 | `§IDO-SOURCE db=idempiere_test client=11 cutover=2026-11-10 currency=USD tb_accounts=20 tb_sum=0.00 AR=430.36 AP=-6949.00 BANK=148.00 open_docs=6 broug` |
| ido_verify_judged | 9 | process | record.log:110 | `§FILMREC FACT ido_verify_line="§MIG-VERIFY verdict=PASS judged=9 failed=0" src=§MIG-VERIFY` |
| odoo_ap_open | 13410.15 | odoo | record.log:39 | `§FILMREC FACT odoo_ap_open="13410.15" src=sum of the tenant open invoices (AP)` |
| odoo_ar_open | 4005.00 | odoo | record.log:38 | `§FILMREC FACT odoo_ar_open="4005.00" src=sum of the tenant open invoices (AR, credit notes negative)` |
| odoo_open_docs | 19 | odoo | record.log:37 | `§FILMREC FACT odoo_open_docs=19 src=c_invoice rows of the tenant` |
| oi_judged | 19 | aging | mig_openitems.log:33 | `§OPENITEMS-VERDICT PASS judged=19 failed=0` |
| pay_ui_amt | 161.12 | trade | trade.log:23 | `§FILMREC TRADE payments-after [{"no":"10000007","s":"CO","amt":161.12,"alloc":"Y","p":"Y","inv":-161}]` |
| pay_ui_books | 17656.44 | trade | trade.log:25 | `§FILMREC TRADE books-after-payment [{"dr":17656.44,"cr":17656.44,"n":34}]` |
| rf_amount | 2002.50 | refusal | record.log:53 | `§FILMREC FACT rf_amount="2002.50" src=amount_residual of the removed open invoice INV/2026/00007` |
| sap_term_calls | 8 | sap | term_sap.txt:16 | `§SAP-AGENT done calls=8 read_only=Y sets=9 rows=13` |
| sbo_ar_left | 200.00 | sapbc | mig_sapbc_open.log:100 | `shipped> §MIG-CLEAR AR account=AR-CLEAR balance=200.00 expected=200.00 verdict=PASS` |
| trd_judged | 26 | trade | mig_migration_trade.log:46 | `§TRD-VERDICT PASS judged=26 failed=0 blocked=0 cases=["PASS","PASS","PASS","PASS","PASS","PASS"]` |

## Non-numeric facts (names, treatments) — cited spec text, not log values
- Source-table names (Odoo account.move.line, iDempiere Fact_Acct, SAP JournalEntries, BC G/L Entry), amount-left fields (amount_residual, DocTotal minus PaidToDate, Remaining Amt. (LCY), invoiceOpen) and bank treatments: spec §1/§2 of prompts/FILM_NARRATION.md (branch prompts/film-migrating-accounting), each from the MIGRATE_INSTALL_TENANT.md spec sections it cites.
- Books card (beat `books`): `odoo_books` and `odoo_tb_sum` lines of record.log (Fact_Acct of the tenant read back after Process).
- ALPHA label: spec §3 rule 2; `§SBO-CONN verdict=INCONCLUSIVE` in mig_sapbc_open.log.
- Stills: record.log `§FILMREC SHOT` lines (page rects beside each png).
