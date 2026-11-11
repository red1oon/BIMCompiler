# PROVENANCE — film "Migrating Legacy Accounting" (EN)

Every number on a card or in the voice is `{fact:id}` in `beats7.py`, resolved by `facts7_resolve.js` from a log line written in the session that built the film
(`/tmp/count_logs/mig_*.log` from `erp/tests/run_migration_lane.sh` SLOW=1 + `witness_migration_trade.js`; `record.log` from `record7.js`). Stills are the REAL page, numbers inside them are the page's own.

| fact | value | beats | source (file:line) | § line |
|---|---|---|---|---|
| bc_si101_cut | 600.00 | bc_tpl | mig_sapbc_open.log:37 | `§SBO-CHECK case=BC-DATE key=oracle-equal OK rule="at 2026-06-30 the reader's TB, open items and banks equal the oracle at that date (SI-101 is open fo` |
| bc_si101_early | 1000.00 | bc_tpl | mig_sapbc_open.log:37 | `§SBO-CHECK case=BC-DATE key=oracle-equal OK rule="at 2026-06-30 the reader's TB, open items and banks equal the oracle at that date (SI-101 is open fo` |
| books_verify_judged | 9 | books | record.log:35 | `§FILMREC FACT odoo_verify_line="§MIG-VERIFY verdict=PASS judged=9 failed=0" src=§MIG-VERIFY` |
| gate_counts_tables | 12 | gate2 | record.log:49 | `§FILMREC FACT gate_counts_tables=12 src=tables counted` |
| gate_problem_rows | 1 | gate | record.log:45 | `§FILMREC FACT gate_problem_rows=1 src=DOM summary problem rows` |
| idf_columns | 145 | ido_tpl | mig_idempiere_falsifier.log:304 | `§IDF-COLUMNS PASS sheets_judged=27 columns_judged=145 rows_compared=477 allowed_by_class={"GardenWorld contract-default-only C_BPartner.C_BP_Group_ID>` |
| idf_rows | 477 | ido_tpl | mig_idempiere_falsifier.log:304 | `§IDF-COLUMNS PASS sheets_judged=27 columns_judged=145 rows_compared=477 allowed_by_class={"GardenWorld contract-default-only C_BPartner.C_BP_Group_ID>` |
| ido_ar_in | 161.12 | ido_ar | mig_idempiere_open.log:54 | `shipped> §MIG-OPEN documents=5/5 partners=3 differing=0 not_ok=0 AR=161.12 AP=-6949.00 verdict=PASS` |
| ido_ar_left | 269.24 | ido_ar | mig_idempiere_open.log:50 | `shipped> §MIG-CLEAR AR account=AR-CLEAR balance=269.24 expected=269.24 verdict=PASS` |
| ido_ar_total | 430.36 | ido_ar | mig_idempiere_open.log:1 | `§IDO-SOURCE db=idempiere_test client=11 cutover=2026-11-10 currency=USD tb_accounts=20 tb_sum=0.00 AR=430.36 AP=-6949.00 BANK=148.00 open_docs=6 broug` |
| ido_tb_accounts | 20 | ido_tb | mig_idempiere_open.log:1 | `§IDO-SOURCE db=idempiere_test client=11 cutover=2026-11-10 currency=USD tb_accounts=20 tb_sum=0.00 AR=430.36 AP=-6949.00 BANK=148.00 open_docs=6 broug` |
| odoo_ap_open | 13410.15 | odoo_open | record.log:39 | `§FILMREC FACT odoo_ap_open="13410.15" src=sum of the tenant open invoices (AP)` |
| odoo_ar_open | 4005.00 | odoo_open | record.log:38 | `§FILMREC FACT odoo_ar_open="4005.00" src=sum of the tenant open invoices (AR, credit notes negative)` |
| odoo_clear_zero | 0.00 | books | record.log:40 | `§FILMREC FACT odoo_clear_zero="0.00" src=Fact_Acct of the clearing accounts` |
| odoo_open_docs | 19 | odoo_open | record.log:37 | `§FILMREC FACT odoo_open_docs=19 src=c_invoice rows of the tenant` |
| rf_amount | 2002.50 | refusal | record.log:53 | `§FILMREC FACT rf_amount="2002.50" src=amount_residual of the removed open invoice INV/2026/00007` |
| sap_agent_calls | 33 | sap_agent | mig_sapbc_open.log:18 | `§SBO-CHECK case=SAP-READER key=read-only OK rule="the mock Service Layer saw only GET and POST Login / Logout / CompanyService_GetAdminInfo (33 calls)` |
| sbo_ar_left | 200.00 | sapbc | mig_sapbc_open.log:100 | `shipped> §MIG-CLEAR AR account=AR-CLEAR balance=200.00 expected=200.00 verdict=PASS` |
| trd_judged | 26 | trade | mig_migration_trade.log:46 | `§TRD-VERDICT PASS judged=26 failed=0 blocked=0 cases=["PASS","PASS","PASS","PASS","PASS","PASS"]` |
| trd_pay | 2002.50 | trade | mig_migration_trade.log:44 | `§TRD-CHECK case=ONETRX key=allocation-posts OK rule="payment + Complete in ONE Trx: the allocation posts (Posted Y, not E "account not resolvable"), R` |

## Non-numeric facts (names, treatments) — cited spec text, not log values
- Source-table names (Odoo account.move.line, iDempiere Fact_Acct, SAP JournalEntries, BC G/L Entry), amount-left fields (amount_residual, DocTotal minus PaidToDate, Remaining Amt. (LCY), invoiceOpen) and bank treatments: spec §1/§2 of prompts/FILM_NARRATION.md (branch prompts/film-migrating-accounting), each from the MIGRATE_INSTALL_TENANT.md spec sections it cites.
- Books card (beat `books`): `odoo_books` and `odoo_tb_sum` lines of record.log (Fact_Acct of the tenant read back after Process).
- ALPHA label: spec §3 rule 2; `§SBO-CONN verdict=INCONCLUSIVE` in mig_sapbc_open.log.
- Stills: record.log `§FILMREC SHOT` lines (page rects beside each png).
