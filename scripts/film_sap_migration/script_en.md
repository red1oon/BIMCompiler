<!-- ⚠ DO NOT REMOVE — Scope: storyboard + narration for the film "How to escape from your SAP Business One" (bim-compiler prompts/MIGRATE_INSTALL_TENANT.md §SAP-MEASURE / §SAP-SPEC /
     §SAP RESULT; owner 2026-11-10: "Ready for film?"). Same house style and pipeline as scripts/film_bc_migration (PLAYBOOK C, Kokoro F af_heart / M am_michael, captions burnt).
     Every number = a § fact of THIS recording (out/rec/facts.json) — never typed. READ out/record.log, out/cards.log, out/build.log after each step. -->
# "How to escape from your SAP Business One" — alpha film, storyboard (~3:00, English)

**One idea:** the third door, and the honest one. Business Central's model is open source; SAP Business One's is not. So the agent reads the model from the only place it is
published: the customer's own server. Released early as a proof of concept — tested only on the example records printed in SAP's own guide, and it says so.

| # | Beat | On screen | Narration (F asks / M answers) |
|---|---|---|---|
| 1 | Title | card: **How to escape from your SAP Business One** · *an alpha, read from your own server* | — |
| 2 | The trap | card: the usual picture (same as the other films) | F: We run SAP Business One. Can we take our data out ourselves? M: Yes. This is how, and it is an early version, so we will show what it can't do yet. |
| 3 | Is the model open? | card: Business Central = MIT source, read · SAP Business One = no open model found · SAP DB 2000–2007 = the database engine, not the application | F: For Business Central you read Microsoft's source. And SAP? M: SAP publishes no open data model for Business One. Its old open-source database, SAP DB, was only the engine; it never held Business One's tables. |
| 4 | Your server publishes it | card: the agent's own §SAP-AGENT lines from this run (login, metadata, sets, read only) | M: But every Business One server describes itself. Its Service Layer publishes the model. So the agent reads it from your own server, checks every field against it, and only reads. |
| 5 | No server here | card: the fixture = SAP's guide examples (c1, i001, i002, i011, warehouse 01, one account), cited by page | F: Did you have a Business One to test with? M: No. So the test server here answers with the only records SAP prints in its own guide: one customer, three items, one warehouse, one account. |
| 6 | Act 1 | chapter: STEP 1 · Run the agent · where your Service Layer is | — |
| 7 | Agent | card: the command + the agent's per-set lines (counts, fields read) | M: Step one. Run the agent on a machine that can reach your Service Layer. It needs Node and nothing else. It logs in, reads, logs out, and writes one file. |
| 8 | Act 2 | chapter: STEP 2 · Your own company | — |
| 9 | Login | shot: the new company on the login screen | M: Step two. Create your company in the ERP, the way iDempiere sets one up, and log in. |
| 10 | Act 3 | chapter: STEP 3 · Migrate from SAP Business One | — |
| 11 | Form | shot: the file + the cut-over date | M: Step three. Open Migrate from SAP Business One, pick the file, set the cut-over date. |
| 12 | Summary | shot: the summary (the warehouse refused, with its reason) | F: What will it do? M: A dry run first. Here one warehouse is refused, and it says why: it has no country, and the ERP needs an address. |
| 13 | Done | shot: Process done | M: Process. All of it, or none of it. |
| 14 | It's there | shot: Business Partner window | M: <bp> customer, <pr> items and <ev> account from SAP's own examples, in the ERP's own windows. |
| 15 | Products | shot: Product window | — (silent hold) |
| 16 | Found by running | card: item without a unit stopped the whole load → the client's default unit · refusals before the load were invisible, Business Central's too → fixed for both | F: Did it just work? M: No. An item without a unit stopped the whole load; now it gets the company's default unit, as iDempiere's own import does. And rows refused before the load never showed on the summary, in the Business Central form too. Both fixed. |
| 17 | Local first | shot: saved with the internet off (<req> requests) | M: And the ERP keeps working with the internet off. |
| 18 | Proof | card: the run's own numbers | M: The run checked itself: <ops> records in one signed change set, the chain verified, the summary equal to the result. |
| 19 | Alpha | card: §SAP-ALPHA lines + "<inc> rules waiting for a real file" | M: This is an alpha. <inc> of its rules had no record to test against. A tester's run judges them. The report it writes has counts and field names, and no values. |
| 20 | Not yet | card NOT BUILT YET: a real company's run · account class from the database · stock at a date · price lists · balances | F: So we can switch tomorrow? M: Not yet. Run it on your own server, and send the report back. That is how it grows. |
| 21 | End | card: one door (same end card) + the agent download URL | — |

**Facts (all from this recording, out/rec/facts.json):** W-SAP-MIGRATE verdict + inconclusive count, the agent's §SAP-AGENT lines (sets, counts, read_only), the summary line,
the M_Warehouse refusal reason on the page, commit ops, verifyChain, the form's "Migrated from SAP Business One" line, offline save (0 requests). The cards refuse to build if
read_only, the warehouse refusal, the witness PASS, verifyChain or the offline save is not proven by the recording.
