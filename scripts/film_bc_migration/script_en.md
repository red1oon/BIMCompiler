<!-- ⚠ DO NOT REMOVE — Scope: storyboard + narration for the film "How to escape from your Business Central" (bim-compiler prompts/MIGRATE_INSTALL_TENANT.md §BC-SPEC / §BC RESULT,
     owner 2026-11-09: "Do a film, stating the licensing bit too, narrating as the previous Odoo run. Add whatever of importance"). Same house style and pipeline as
     scripts/film_odoo_migration (PLAYBOOK C, Kokoro F af_heart / M am_michael, captions burnt). Every number = a § fact of THIS recording (out/rec/facts.json) or of the
     model/fixture files — never typed. READ out/record.log, out/cards.log, out/build.log after each step. -->
# "How to escape from your Business Central" — alpha film, storyboard (~3:00, English)

**One idea:** the second door. Microsoft publishes Business Central's application code under the MIT licence — so its data model can be READ, not guessed, and a company's own
Excel export can be brought into the Kernel ERP without a live Business Central, a login or an API. Honest about what it is: an ALPHA, proven on Microsoft's own demo company.

| # | Beat | On screen | Narration (F asks / M answers) |
|---|---|---|---|
| 1 | Title | card: **How to escape from your Business Central** · *an alpha, read from Microsoft's own source* | — |
| 2 | The trap | card: the usual picture (you · their program · their database, rented) | F: My company runs on Business Central. Can I take my data out, without a consultant? M: Yes, and this film shows how we got there without ever logging in to one. |
| 3 | The licence | card: MIT — what it allows / what it does not | M: Microsoft publishes Business Central's application code under the MIT licence. Anyone may read it, copy it, change it and port it, as long as the notice stays. F: So anyone can run their own Business Central? M: No. The platform that runs that code stays Microsoft's, and so does the name. What the licence gives is the data model, in the open. |
| 4 | Read, not guessed | card: a real excerpt of Customer.Table.al + "15 tables · 988 fields · 0 differ" | M: So the migration reads it. Fifteen tables, nine hundred and eighty-eight fields: names, lengths, required fields, links. Every one checked against the source. |
| 5 | Microsoft's own demo | card: the Contoso/CRONUS company extracted from the demo source: customers, items, accounts | F: But you had no Business Central to test with. M: Microsoft's demo company is in the same source. We extracted it, and wrote it the way Business Central's own Excel export writes. |
| 6 | Act 1 | chapter: STEP 1 · Export to Excel · in Business Central | — |
| 7 | The file | card: the package layout (row 1 table id, row 3 captions, data from row 4) with the real demo rows | M: Step one happens in Business Central itself. Configuration Packages, add the tables, Export to Excel. No extension, no password, no API. |
| 8 | Act 2 | chapter: STEP 2 · Your own company | — |
| 9 | Login | shot: the new company on the login screen | M: Step two. Create your company in the ERP, the way iDempiere sets one up, and log in. |
| 10 | Act 3 | chapter: STEP 3 · Migrate from Business Central | — |
| 11 | Form | shot: file + cut-over date, units with PCS suggested as Each | M: Step three. Pick the file and the cut-over date. It even suggests the units: Business Central's code for piece is E-A, the same code the ERP uses for each. |
| 12 | Summary | shot: the summary | F: What will it do? M: A dry run of the real import, before anything is written. Every table says what goes in, and why anything would be refused. |
| 13 | Done | shot: Process done | M: Process. All of it goes in, or none of it. |
| 14 | It's there | shot: Business Partner window | M: <bp> partners, <pr> items, <ev> accounts and <il> stock lines from Microsoft's demo company, in the ERP's own windows. |
| 15 | Products | shot: Product window | — (silent hold) |
| 16 | Found by running | card: what the run found and fixed (items without a category; Refresh lost a typed date) | F: Did it just work? M: Not the first time. Business Central lets an item have no category; the ERP does not. It now does what iDempiere's own import does. And the screen forgot a typed date on Refresh. Both found by the run, both fixed. |
| 17 | Local first | shot: saved with the internet off (<req> requests) | F: And if the internet goes down? M: Nothing stops. The ERP and the data live in this browser. Here the internet is off, and a customer is still saved. |
| 18 | Proof | card: the run's own numbers | M: The run checked itself: <ops> records in one signed change set, the chain verified, the summary equal to the result in every table. |
| 19 | Alpha report | card: §BC-ALPHA lines, values masked | M: This is an alpha. Nobody has run it on a real Business Central yet. Every run writes a report you can send back: tables, counts, what was refused. Every value is masked. |
| 20 | Not yet | card NOT BUILT YET: a real tester's file · the cloud API · on-premises SQL Server · balances and open documents | F: So I can switch tomorrow? M: Masters and opening stock, today, on the demo company. Your own file is the next test. |
| 21 | End | card: one door (same end card as the Odoo film) + the guide URL | — |
**Facts (all from this recording, out/rec/facts.json):** summary line, commit ops, verifyChain, the form's "Migrated from Business Central" line (per-table counts), unit suggestion,
offline save (navigator offline, §CRUD-PERSIST verifyChain=ok, 0 requests), alpha line count. Model facts from erp/plugins/bc_model.mjs (tables, fields, commit). The cards refuse to
build if the offline beat or the PCS→Each suggestion is not proven by the recording.
