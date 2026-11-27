<!-- ⚠ DO NOT REMOVE — Scope: the dialogue script of Film 6, "No Server to Keep Alive — and the Books Still Close" (TEAMWORK_FRAMEWORK.md §42.1 + §42.2 + §42.3). DRAFT FOR THE LEAD. NOT RECORDED. Read logs/script6_check.log after every edit.
     Rules (binding): (1) every number is {fact:<id>} (ids in facts6.spec.json) and is spelled out in words by the recorder; NO digit and NO spelled cardinal is typed in a spoken line (script6_check.js enforces it); (2) every claim about a community/industry source carries a claim-id tag in braces (claims6.json), quote <= 25 words, shown on screen as a lower third; a claim whose status is UNCONFIRMED is not made; (3) §42.2 wording rule: the film NEVER says "fraud cannot occur" (§39 R5 measured a restored phone can redeem again); (4) §41.1 film correction: in a POS space the till receives ONLY the movement back, not its completed order; (5) F asks, M explains, short plain sentences; (6) [IF ...] blocks wait for a pending fact; the ELSE text is the honest fallback and also goes on the limits card. -->
# No Server to Keep Alive — and the Books Still Close
**Subtitle (card, §42.1 verbatim):** standard ERP imports, local first: Unicenta POS and Micro Finance.
**Title:** option 1 of §42.1 (the lead's recommendation; the owner did not pick, §42.2). Options 2 and 3 stay open until recording.
**Cast:** F asks (Kokoro af_heart), M explains (Kokoro am_michael). **Target:** at most 8:30. Estimate at the end of this file.

---
## T. Title card  (hold with the first line)
CARD: title, subtitle above; small tag `SAMPLE DATA · ONE SAMPLE DAY` (the stage labels its clock "sample day").
F: Where is the server?
M: In the sale path, there is none. Every desk keeps its own copy of the database, and head office still signs the books.

## 0. The fear  — chapter card "Chapter 0 · Where is the server?"
SOURCES ON SCREEN (lower thirds): {claim:sqlite-serverless}, {claim:lf-secondary}. Who is meant: {claim:sqlite-hipp}.
F: People hear that and worry. No central database that is always up?
M: SQLite raised the same worry. Its lead developer is Richard Hipp, and its own page says the program reads and writes the file directly, with no separate server process.
F: Is that a fringe idea?
M: No. The Ink and Switch paper on local-first software says servers still exist, but hold secondary copies.
F: And if the phone is offline, who posts the books?
M: This film answers that, on a sample business day, with the oldest habit in the ERP.
CARD (4 s, silent; §42 v1 beat 1): `Earlier films, not repeated here: No server in the sale path · Keeping the bloat off the pipe · Trust and the thin pipe · The server is dead.`

## 0b. The convention is old — chapter card "Chapter 0 · The import table"
SOURCES ON SCREEN: {claim:idem-imp-a}, {claim:idem-imp-b}, {claim:idem-lineage}, {claim:resa-load}, {claim:resa-errors}, {claim:d365-valid}, {claim:erpnext-subledger}. NOT used as support: {claim:d365-trickle} (counter-example, see claims6.json).
F: Where does the audit trail live, without a central database?
M: The ERP already has such a trail. Outside data never becomes a posted document directly. It lands in an import table, and a role imports it by a named process.
F: How common is that?
M: The dictionary ships {fact:dict_i_tables} import tables and {fact:dict_import_procs} import processes, a habit from Compiere through ADempiere to iDempiere. Every row shows whether it was imported, and keeps its error. Retail does the same: Oracle audits till data in a batch, Dynamics validates before it posts, ERPNext keeps sales out of the ledger until the session closes.
F: And your own earlier integration?
M: It created orders directly and never used the import table. The twin now uses the convention it skipped.

---
## 1. The till sells, online or not — "Chapter 1"
STAGE: Till OFFLINE badge, tickets queued on the till (W-FILM-OFFLINE events), the visit later; timeline in sample-day hours.
F: The till loses its connection in the morning rush. Does it stop selling?
M: No. Each ticket is written on the till as import rows, order lines and the tenders that paid them. Nothing is posted. In our check, {fact:poss_decl_lines} order lines and {fact:poss_decl_tenders} tenders were declared, and no order or payment existed until somebody imported them.
F: And when the till reconnects?
M: Cut off, it kept {fact:foff_tickets} tickets, head office knew nothing, and a single visit sent exactly those. See the clock below: sales at their own hours, the visit later. Real time was never needed.
[CUT: fact mf_till_tender_up has no final log; limits card: "Tender rows are written on the till, but only order lines are shown travelling up the pipe."]

## 2. The borrower pays from a phone — "Chapter 2"
STAGE: Borrower phone + Slip-verify service ("SlipOK sample"); online, then OFFLINE; ToDo on the phone (W-MF-SEED events).
Wording on the verifier (claims ledger): {claim:slipok-sample} is UNCONFIRMED at the source. The film says only what the owner specified (§40.2): a slip-verification service, with SlipOK as the sample. No price, no feature, no logo.
F: A borrower pays an instalment by bank transfer. What does the phone do?
M: It checks the slip with a verification service, SlipOK as the sample; another provider is just another row. Then it writes a payment row and says payment received, at once. Head office is not asked anything.
F: Is the loan a special document?
M: No, an ordinary invoice with a payment schedule. A sample invoice of {fact:mf_inv_total} met a slip of {fact:mf_slip1_amt}, and the open balance, {fact:mf_open_after_slip1}, is worked out, never copied. A renewed certificate is a new invoice, from legacy's Recurring Run.
F: What if there is no signal?
M: The row is still written. The phone names the service that has not acknowledged, and says what happens online. A to-do stays until the service acknowledges or refuses; when the signal returns, the check runs again by itself.
F: Could the same slip be paid twice?
M: Not on the phone: it refuses a second row with the same bank reference.
LIMITS CARD LINE: "Head office's legacy Import Payment has no duplicate guard of its own (measured, §41.1 B)."

## 3. Head office works when head office works — "Chapter 3"
STAGE: Head-office clerk (role 102) and Stock role cards; timeline 17:30, 17:45, next morning 08:00 (sample day). REAL FRAMES: the admin's home with the lens, the import window and its error column.
F: The day is over at the till. What does head office do?
M: A clerk opens Import POS Sales from the menu and runs it. A sample ticket of {fact:poss_k1_total}, paid by tenders of {fact:poss_k1_tender_a} and {fact:poss_k1_tender_b}, becomes a single order, its invoice and receipts, with {fact:poss_k1_open} left open.
F: What if the tenders do not add up?
M: The ticket stays whole: {fact:poss_mis_docs} documents are made, and every row keeps the reason in its error column.
F: What if the clerk runs it twice?
M: Nothing new: {fact:poss_rerun_new} tickets the second time, and the books balance, {fact:poss_fact_own} ledger lines.
F: Who is allowed to do this?
M: The dictionary decides, as in legacy: {fact:hq_menu_x} of {fact:hq_menu_n} menu entries checked, role by role.
F: And the stock side?
M: Next morning the stock role opens Replenish Report. Confirm it, and a single movement is made, with {fact:hq_mv_lines} lines.
F: And posting?
M: If the tenant chooses queued posting, legacy's accounting processor posts the day at close, and so does the twin.

## 4. The day comes back to every desk — "Chapter 4"  (includes 4b, §42.2 "Only the events travel")
STAGE: next visits. Envelopes: up = order lines, down = the movement only. Counters: till ops/bytes before/after; borrower 2: took in / delivered.
F: So everything returns to the till?
M: No. Only the events travel: order lines go up, and the movement comes back.
F: Is that a separate system from the office setup?
M: No. The point-of-sale plan ships beside the office plan, chosen when the team is founded. Same engine, same database.
F: How thin is it?
M: An office-setup till received {fact:ppb_before_ops} operations, {fact:ppb_before_bytes} bytes. Under the point-of-sale plan, {fact:ppb_after_ops} operation, {fact:ppb_after_bytes} bytes: the replenishment line.
F: And the borrowers?
M: Each device is bound to its own branch or its own customer. The relay delivered {fact:ppb_b2_delivered} operations to the second borrower; the phone took in {fact:ppb_b2_in}, its own, and {fact:ppb_b2_foreign} of the first borrower's. Each balance comes back worked out.
F: Is the rest hidden at the relay?
M: Not yet. That needs sealed audiences.
F: And if several people edit the same record?
M: They get legacy's own message: "{fact:so_conflict_msg}".

## 4c. Returns and loyalty, without a realtime check — "Chapter 4c"
SPEC §42.2 wording rule applies word for word (never "fraud cannot occur").
F: Returns and loyalty need a live check, don't they?
M: No realtime check is needed. A return is a negative order line: Import Orders takes it, completing it puts the goods back in stock, and the invoice is negative, {fact:ret_order_total}. Loyalty credit lives on the buyer's phone, so tills share no balance to race over: after an earn, a redeem and a second scan, {fact:tc_earn}, {fact:tc_redeem} and {fact:tc_second}.
F: Can a phone be cheated?
M: A phone restored to an older state can redeem again. We do not claim it cannot. The settlement flags it at the day's close: an overspend of {fact:tc_overspend}.
F: So what protects the shop?
M: Policy, checked periodically: what could go wrong is small, bounded by a cap per instrument, a known customer for any refund, and the day-end cash count against declared returns.
LIMITS CARD LINE (mandatory, §42.2): "The link from a return to its original ticket (G-11), the return-to-cash-count and return-to-loyalty-reversal rules (G-13), and the once-only code witness and per-station issue cap (G-14) are specified, not built."

## 5. Built the way good software is built — "Chapter 5"  (§42.3 table; a principle without a witness here is NOT claimed)
F: Which good practices?
M: Separation of concerns: the till went from {fact:ppb_before_ops} operations to {fact:ppb_after_ops}. A single implementation per job: a single executor of document actions, {fact:wx_judged} checks, a single event bus, {fact:bus_judged}. Closed for change, open for extension: the sales import is a plugin, and the base hash stays identical. Least privilege: {fact:grant_judged} checks on what a plugin may hear.
M: Test the tests: {fact:mfs_mut_killed} of {fact:mfs_mut_total} broken copies of the Micro Finance check were caught, and {fact:hq_mut_killed} of {fact:hq_mut_total} for the head-office clerk. The same answer on every device: {fact:exe_judged} checks on who may complete, judged by the rule in force at the act. And a verifier is an adapter row: a second provider swapped in with no change outside it.
[Delete as much as you add: NOT MET, on the card and the limits card, from the merged diff: {fact:pr_added} lines added, {fact:pr_deleted} deleted. Not spoken. Also on the card, not spoken: one reader for what a device holds, {fact:tipr_judged} checks.]

## 5b. Screens you already know — no chapter card; a montage of REAL frames from the live site (§42.4)
STAGE: real frames, each captioned with its legacy name: the menu tree · an import window with its Imported box and error column · a process dialog · Document Action Access · Recurring · Tenant Accounting Processor · the Web Service Execution role · the plugins list · role 103's home.
F: I have run iDempiere for years. Will I recognise any of this?
M: All of it. The menu, the import windows with their error column, the process dialogs, Document Action Access, Recurring, the accounting processor, the Web Service Execution role. Even the plugins list: everyone reads it, and only the System Administrator changes it. Nothing new to learn. Only the place where the row is written has moved.

## L. Limits, said plainly — chapter card "Limits"
F: What is not done?
M: Behaviour comes from the legacy source, not a side-by-side run, because the legacy database was down. The standalone till app is not built. Only order lines are shown travelling up from the till. Return links and caps are specified. Hiding bytes at the relay needs sealed audiences. And this wave added far more than it deleted.

## W. Why we do it this way — chapter card "Why"
F: So why do it this way?
M: Backward compatibility: the import tables and processes your people already know, and a twin that differs from legacy in nothing. Sustainability: no server to keep alive, and a rule is a row. Interoperability: the same import tables that any file loader, bank file or till writes to, and a verifier behind a single standard interface. Sovereignty: your data stays on your own devices, under an MIT licence.
CARD: the four words as the card's four lines (backward compatibility · sustainability · interoperability · sovereignty) + `MIT licensed`.

## Z. The last card (held; owner's words verbatim, §42.2)
F: Can you think of a scenario where this system will fail?
CARD (held ≥ 6 s after the line, nothing else on it): `Can you think of a scenario where this system will fail?` / `red1org@gmail.com`

---
## Length estimate
Computed by script6_check.js (spoken words, per chapter). Kokoro-measured durations: logs/narr6_measure.log.
