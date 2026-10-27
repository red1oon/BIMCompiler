# POS as a plugin, a local-first till (Unicenta reborn), and the head-office day close — SPEC FOR LATER

```
# ⚠ DO NOT REMOVE — Scope & protocol. Read the log after EVERY run before any conclusion.
# SCOPE: (1) package the POS lens as a plugin; (2) turn the till into a local-first app that DEPOSITS tickets
#   (it never completes core documents); (3) an opt-in one-click "branch day close" at head office that chains
#   the SAME legacy processes. Nothing is built from this file until the owner says go on a phase.
# RULES: TWIN CARDINAL RULE (the default ERP = legacy, L&F included; a friendlier op is an opt-in lens) ·
#   AD-LAYER LAW (port the mechanism, one implementation per responsibility, deletion budget, X of N) ·
#   IMMUTABLE TWIN PRINCIPLE (local first, minimal relay; TEAMWORK_FRAMEWORK top) · FL-8 (one DocAction executor).
#   Spec before code · RED first · a mutant must prove it applied, a crash is not a kill · witness, never eyes.
# RELATED (read, do not duplicate): prompts/POS_SHOWCASE_LANE.md (the register/KDS/kiosk/tender UI lane) ·
#   docs/internal/POS_ADDON_SPEC.md (the 2012 Unicenta loop as folds) · prompts/ERP_FRIENDLY_OPS_LENS.md
#   (friendlier ops = opt-in lens, measured) · prompts/TEAM_REPLICATION_PLUGIN_STUDY.md §13-§14 (the chain, the
#   owner's operating model) · prompts/TEAMWORK_FRAMEWORK.md §38 (gap register G-1…G-21).
```

## §0 The owner's words (2026-10-28)
> *"Also consider if we should have the typical ERPNext Friendlier plugin benefit of unified in single batch process. Or maintain them as part of Unicenta POS plugin. I remember back that Unicenta POS on client side is its own client touch screen app. Since we did a POS lens in our twin as a pill we can rethink this. 1. Should it be a plugin too or stay as one off demo? 2. Build a local first version of our Unicenta POS. This can be spec'd in a prompts/# for later."*

Before that (study §14): *"These are separate ops by dedicated roles … An admin or clerical person does the import of branches data already deposited by respective POS stations Orgs. Then stocks are checked via that report. A process confirm proceeds their movement or purchase order creation. … Mfg Order is optional … We merely twin them."*

**Owner correction, same day:** *"By right, if we are to follow legacy, that POS was my early days overlooked that it should be as described above - Unicenta POS with its kitchen screen standalone."* ⇒ The target is **legacy's shape: a standalone till app and a standalone kitchen screen** (Unicenta oPOS and its kitchen display), each its own app on its own device. Neither is a pill inside the ERP window. The in-ERP POS pill (M1-M4) was an early shortcut and is **superseded**, not extended. This decides Q1 below and reorders the phases.

## §1 Measured today (bim-ootb main @c2dbc70c, 2026-10-28)
| # | Fact | Where |
|---|---|---|
| M1 | The POS lens is **built-in host code**, not a plugin: two script tags plus a pill gated `showWhen: pos-station` | `erp/idempiere.html:706` `pos_core.js?v=3`, `:714` `pos_lens.js?v=11` |
| M2 | The till **completes the sale itself**: `completeOrder` → `SET_STATUS CO`, then the shipment and the invoice (WR fan-out) in one group, committed on the till. Under FL-8 and the owner's model (§0: stations *deposit*, head office *imports*), that makes every till a DocAction executor | `erp/pos_core.js:70-139` |
| M3 | The till also composes **its own engine verbs** (`erp_engine` `buildDoc/completeOrder/completeInvoice/explodeBOM`, `ALLOWED_VERBS`), not the ported legacy model classes (`model_order.js` etc.) — a second path for a core document | `erp/pos_core.js:7-8, :41` |
| M4 | `pos_core.replenishSuggest` / `buildReplenishPO` = a **second replenishment formula** beside the ported legacy Replenish Report (AD_Process 53267, `erp/processes/ReplenishReportProduction.js`, 860 legacy lines) | `pos_core.js`; AD-LAYER LAW 5 |
| M5 | The ERPNext/Odoo-style precedent already exists AS A PLUGIN: `erp/plugins/friendly_ops.mjs` (`org.kernel.friendly-ops`) stages `AD_Process`, `AD_Process_Para`, `AD_Process_Access`, `AD_ToolBarButton` rows (`manifest.dictionary`), opt-in, measured by gestures/screens/fields with books diff 0 | `friendly_ops.mjs:16-55`; `ERP_FRIENDLY_OPS_LENS.md` §1-§2 |
| M6 | The deposit path is built and live: station `I_Order` rows travel, the ported **Import Orders** (206) makes ONE completed order at head office, the order comes back. `I_Order.PriceActual` is honoured (the ticket's price is the order's price) | study §13.5; `ImportOrder.js:345-346` (= `ImportOrder.java:750-751`) |
| M7 | Payments have the same legacy shape: `I_Payment` (AD_Table 597, AccessLevel 2) + **Import Payment** (AD_Process 343, `org.compiere.process.ImportPayment`) are in the seed dictionary; **not ported** (`erp/processes/` has only `ImportOrder.js` of the Import* family). `I_BankStatement` / Import Bank Statement (221) likewise | seed `ad_table`, `ad_process` |
| M8 | Unicenta 2012 = a fat Java touch-screen client with **its own database** (tickets, payments, closed cash), an ActiveMQ queue per station, the AutoBOMOrder backflush plugin and the Replenishment Report at iDempiere | `docs/internal/POS_ADDON_SPEC.md` §0, `:36-46` |

## §2 Recommendations
### §2.1 Q1 — the POS lens: neither plugin nor demo; RETIRED in favour of the standalone apps (owner correction, §0)
**Decided by the owner's correction:** the till and the kitchen screen are **standalone apps** (own entry pages, own local store, installable, offline), as Unicenta and its kitchen display were. Each device pairs into the team as a Team device of its branch Org, so the till app is the POS "plugin" in legacy's sense: an add-on outside the ERP, connected by data, not code. The ERP side keeps only what head office needs, and that is core/legacy already (Import Orders, Import Payment, Replenish Report) plus the friendly-ops day close (§2.3). **Deletion budget:** the in-ERP POS pill (`idempiere.html:706,714` script tags, the `pos-station` pill gate), `pos_core.js`'s complete-on-the-till path (M2/M3) and `replenishSuggest` (M4) are removed once the standalone till reaches the same ring/receipt features. W-POS-OFF: the ERP page without them is byte-identical to one that never had them.
**Kitchen screen (KDS):** a second standalone app in the same branch. It receives the till's ticket lines and sends back "bumped / ready". This is a **branch-local flow** (till ⇄ kitchen) that never waits on head office: a plan row with audience = the branch, not the space. Today's KDS is a 2nd ERP tab (`POS_SHOWCASE_LANE.md` §P2); it moves into its own app. How Unicenta's kitchen display actually receives orders (shared database, printer queue or network) is **extracted from Unicenta's source in P0**, not assumed.
### §2.2 Q2 — a local-first Unicenta: the till deposits, it never completes
**The till is its own app** (as Unicenta was, owner §0): a touch-screen page with its own local store, fully offline, outside the ERP window. It keeps what Unicenta kept (the open ticket, its lines, tenders, the receipt, the cash drawer and the close-cash count). It **deposits** declarations through Team (minimal relay, FL-1):
- the ticket as `I_Order` rows (built, M6; the price paid travels as `PriceActual`; DocTypeName e.g. *POS Order*, `IsSOTrx='Y'`, study §13.5 finding 4);
- the tenders as `I_Payment` rows (needs the Import Payment port, M7 — the same pattern as Import Orders);
- the close-cash as a declaration (row shape TBD, owner Q-c).

It **reads** master data down (products, prices, taxes: read-only plan flows) to price the receipt with the core's own functions. It writes no `C_Order`/`M_InOut`/`C_Invoice`/`Fact_Acct`. **The head office owns every document** (FL-8, §14).

**Reuse the front end, replace the back end:** the ring UI, album cards, KDS, kiosk, modifiers and tender screens (`POS_SHOWCASE_LANE.md` P1-P5) stay. `pos_core`'s complete-on-the-till path (M2/M3) and its own replenishment formula (M4) are DELETED in the same change (deletion budget). Backflush (AutoBOMOrder) then happens where the order is completed, at head office. **Divergence named in advance:** a receipt total is the till's arithmetic; the order total is head office's (derived, FL-2). `PriceActual` keeps them equal for price, while tax rounding must be judged by a witness (receipt total == imported order GrandTotal, to the cent).
### §2.3 The ERPNext-style one-click "branch day close" — a friendly-ops op at head office, NOT inside the POS plugin
**Recommend: both, layered.** The legacy operations stay separate, each run by its own role and schedule (the default; the twin, §14). An opt-in friendly-ops process "**Branch Day Close**" (dictionary rows staged by `org.kernel.friendly-ops`, the M5 pattern) runs the SAME ported processes in legacy order for the branches chosen:

1. Import Orders (206, DocAction CO)
2. Import Payment (343, once ported)
3. Replenish Report (53267) for the branch warehouses
4. the report's confirm create (Movement / Purchase Order)

Each step is shown with its own result; the close stops at the first error; every step stays runnable alone. It belongs to friendly-ops, not the POS plugin: it is a head-office office operation by head-office roles, and a site without the POS plugin (importing from another till system) wants it too. **Acceptance (W-DAYCLOSE):** the one-click run and the four separate runs over the same deposits give identical books and stock (`fact_acct`, `m_storageonhand`, `m_movement`, `c_order` diff = 0); the gestures G and screens S are measured before and after (`ERP_FRIENDLY_OPS_LENS.md` §2).
### §2.4 Manufacturing (optional, unchanged)
LiberoMfg (`erp/plugins/libero_*`) or legacy's simple Production (e.g. Patio Furniture: components → parent in stock). Replenish Report's production create mode is already refused as named in the port (not core).

## §3 Phases (each: spec → RED witness → build → witness → log read; the owner's go per phase)
| Phase | What | Witness |
|---|---|---|
| P0 | **Extract, no code:** Unicenta oPOS's own screens, its local tables (ticket, lines, tenders, closed cash) and how its kitchen display receives orders (source, not memory); X of N `pos_lens`/`pos_core` features worth carrying into the standalone till; the tax rounding of a receipt vs an imported order; what Import Payment needs (legacy source lines, the model classes it calls) | evidence log |
| P1 | **The standalone till app** (own entry page, own store, offline cache, pairs as a Team device of its branch Org), depositing `I_Order` (+ the ring/receipt UI carried over) | W-TILL-DEPOSIT (receipt total == imported GrandTotal to the cent; the till wrote 0 core-document rows) + W-TILL-OFFLINE (a full shift with the network off; deposits arrive at the next Visit; nothing lost, nothing doubled) |
| P2 | **The standalone kitchen screen**: a branch-local flow till ⇄ kitchen (lines in, bump/ready out), never waiting on head office | W-KDS-BRANCH (a line reaches the kitchen and a bump reaches the till with head office offline) |
| P3 | **Port Import Payment** (343) verbatim, `I_Payment` boot overlay (the B1 route: base hash unchanged) | W-IMPORT-PAYMENT (the W-IMPORT-ORDER pattern) |
| P4 | **Retire the in-ERP POS pill**: script tags, pill gate, `pos_core` complete path, `replenishSuggest` deleted | W-POS-OFF (the ERP page byte-identical to one that never had them) |
| P5 | **Branch Day Close** in friendly-ops | W-DAYCLOSE (one click == four separate runs, books diff 0; G/S measured) |
| P6 | the film (till + kitchen at the branch → clerk imports at head office → day close / replenish → movement back) | follows W-HQ-CLERK (study §14) |

## §4 Owner questions (decide, or say "decide for me")
- **Q-a (tenders):** deposit tenders as `I_Payment` rows for Import Payment (legacy, recommended), or inside the ticket?
- **Q-b (stock on the till):** may the till show availability, read-only from head office's last published snapshot (offline it can be stale), or no stock display at all?
- **Q-c (close cash):** Unicenta's close-cash count: a declaration head office books (cash journal / bank statement import), or till-only?
- **Q-d (screens):** the till's screens — Unicenta's own layout (parity, the twin habit), or carry our lens design (`POS_SHOWCASE_LANE.md` P1-P5) into the standalone app? Recommendation: Unicenta's layout and flow as the base (twin), our modern touches (album cards, QR tender) only where Unicenta has an equivalent screen.

## §5 Payment tenders: POS domain or ERP concern? (owner, 2026-10-28: *"I wonder if it's a POS domain or ERP concern? How are credit card settlements resolved on ERP end? At POS end we should handle as Unicenta POS interfaces with those various machines including receipt printing."*)
**Answer: both, split at the device boundary.**
- **POS domain (the till app, local, offline-capable):** talking to the machines, as Unicenta does: the card terminal (it authorizes the card; the till never sees or stores a card number), the cash drawer, the receipt printer, the customer display. The tender UI (split tender, change due). What the till records is the tender FACT: type, amount, card brand, the terminal's approval code and batch reference. **Never a card number** (PCI: the pan never leaves the terminal).
- **ERP concern (head office, legacy documents):** recording the money and reconciling it. In the seed dictionary (measured):
  - `C_Payment` with `TenderType` (ref 214: Cash, Credit Card, Check, Direct Deposit, Direct Debit, Account);
  - `C_POSPayment` (AD_Table 200016) and `C_POSTenderType` (200017) for several tenders on one POS order;
  - `C_PaymentProcessor` (398) / `C_BankAccount_Processor` (200030) for ONLINE card processing from the ERP (web or back-office card entry, not a till).
- **How a card settlement resolves in legacy (the practice, to be confirmed against source in P0):**
  1. Each card tender becomes a receipt (`C_Payment` TenderType C) into a **card-clearing bank account**, allocated to the invoice.
  2. Days later the acquirer pays the batch, net of its fee, into the real bank account.
  3. That arrives as a **bank statement** (Import Bank Statement 221 / Load Bank Statement 247 from the bank's file). Its lines are matched to the receipts (Bank Statement Matcher 256, **ported**: `erp/processes/BankStatementMatcher.js`).
  4. The fee is the difference, booked on the statement line as a charge (`C_Charge`, e.g. bank fees). Cash tenders go to a cash/till account and are reconciled by the close-cash count (Q-c).
- **So the till deposits tenders as declarations** (`I_Payment` rows; Import Payment 343, legacy 572 lines, **not ported** — the same pattern as Import Orders). Head office's import creates the receipts; settlement is ordinary bank-statement work by the accounts role. **Shared prerequisite:** the Micro Finance case needs the same Import Payment port (`TEAMWORK_FRAMEWORK.md` §40).

## §6 Unicenta is a dedicated project — the owner's integration (owner, 2026-10-28)
> *"Unicenta POS also has restaurant option where there is table reservation and BPartner customer which I have imported into it in my integration together with AD_User. … Unicenta POS is a dedicated project with my integration which has setup that pulls branch info from ERP, where each POS pulls that info into its till one time first time, with products, prices, users, and loyalty list of customers. Thus this may take a when before a nice film."*

**Public record found (2026-10-28 search; the wiki pages refuse automated fetching, so their text is NOT yet read — P0 reads the source):**
- The integration began as the Openbravo POS integration "integrated to iDempiere ERP via APACHE ActiveMQ 5.5.0"; Unicenta is a fork of that project, maintained by Red1 and Eduardo Gil (Ghintech). The wiki lists version 4.6, GPLv2, with live client users in Panama.
- The POS client and a server-side `posintegration` plugin are hosted by Ghintech on Bitbucket. Setup is a standalone `POS_ACTIVEMQ` app with **POSSync** / **OrderSync** buttons.
- Wanda POS = Unicenta + ActiveMQ + iDempiere.
- Pages: [Plugin: Unicenta POS](https://wiki.idempiere.org/en/Plugin:_Unicenta_POS) · [FS Unicenta For Idempiere](https://wiki.idempiere.org/en/FS_Unicenta_For_Idempiere) · [How to activate the POSSync and OrderSync buttons](https://wiki.idempiere.org/en/How_to_activate_the_POSSync_and_OrderSync_buttons) · [Unicenta oPos to iDempiere](https://wiki.idempiere.org/en/Unicenta_oPos_to_iDempiere) · [Plugin: Openbravo POS](https://wiki.idempiere.org/en/Plugin:_Openbravo_POS) · [Plugin: Wanda POS](https://wiki.idempiere.org/en/Plugin:_Wanda_POS) · [red1 on SourceForge](https://sourceforge.net/p/red1).
- This repo already records the 2012 loop: `docs/internal/POS_ADDON_SPEC.md` §0 and the owner's thin-pipe lesson, `TEAMWORK_FRAMEWORK.md` §34.

**What the integration does, per the owner — the shape to twin:**
- **Setup pull, first time per till (ERP → POS):** branch info (the till's org, warehouse, price list — `C_POS` 748), products, prices, users (`AD_User`), customers (`C_BPartner`) with the loyalty list, and the restaurant setup.
- **In team terms these are Reference seeds (type R):** pulled once, then refreshed by an effective-dated pull (treatment table row 6, `TEAMWORK_FRAMEWORK.md` §16.17: *"Price / promo update — Reference seed (type R), pulled; effective-dated"*). This is read-only master data down; the till authors none of it.
- **Restaurant option:** places/tables and table reservations live in the till; customers come from the ERP. Whether a reservation is also an ERP record is owner Q-e.
- **Up (POS → ERP):** tickets as `I_Order`, tenders as `I_Payment`, close cash (Q-c).

**P0 adds:** read the integration's source (POS_ACTIVEMQ, posintegration, POSSync/OrderSync). Owner: the wiki blocks automated fetching here; give the source location or an export, and P0 extracts from it, never from memory. **Agreed: this is a dedicated project and its film comes later.**

## §7 Separation of concern and the team replication framework (keep an eye, owner 2026-10-28)
- **Three kinds of party, one boundary contract** (study §8.2):
  - the **apps** (till, kitchen, borrower) are Team devices that DECLARE (`I_*` rows) and read reference seeds — they run no DocAction;
  - the **head-office core** runs the legacy processes (Import Orders / Payment, Replenish Report, bank statements) by role and schedule (study §14);
  - the **comm plugin** carries and orders, and decides nothing about documents.
  - The **scriptor** compiles who receives what (the plan); a convenience such as Branch Day Close is a friendly-ops plugin over the same processes.
- **Thin pipe (§34) — a finding from §13.5 that this spec must fix, not repeat:** in W-POS-CHAIN the till received the processor's whole Complete group (**103 ops**: the order, plus the shipment, the invoice and the postings of a POS Order). That is §34 audit item (1), the fat-pipe habit. Under FL-8 the fix is **role-scoped flows** (G-6, `TEAMWORK_FRAMEWORK.md` §38.12/§38.14: the hosts read a POS star plan, a direction per role): the till receives what the plan declares for it (its ticket's status, the replenishment movement, reference seeds), never the postings. W-TILL-DEPOSIT must count bytes and ops received by the till, and judge them against the plan.
- **Branch-local flows** (till ⇄ kitchen) are plan rows with audience = the branch, so head office never sees bump events.
- **Per-role delivery is what makes all three apps scale** (§11: G-6 is a scaling requirement).

## §8 Questions added
- **Q-e (reservations):** a restaurant table reservation — till-only (as Unicenta), or also an ERP record (e.g. a resource assignment)?
- **Q-f (source):** where is the integration's source (Bitbucket Ghintech `posintegration`, the POS client, SourceForge red1)? P0 reads it.

## §9 OWNER PROPOSAL — `I_POSSales`: one view per sale, one POS import that unravels it (2026-10-28; owner: *"I would recommend a one liner 'SQLView' that joins I_Payment etc to I_Orderline. The POS import on ERP side unravels to correct models. We can rename it as I_POSSales"*)
**Measured before designing (seed):**
- **Views are read-only in the twin:** 158 `AD_Table` rows with `IsView='Y'`, 0 SQLite triggers (no INSTEAD OF write path; W-PLAN-ERP E1 says the same). ⇒ the till cannot insert INTO a view, so it still writes the two legacy import tables. `I_POSSales` is the view that presents one sale.
- **`I_Payment` (74 columns) carries no order link:** there is no `C_Order_ID` and no order document number. It has `DocumentNo`, `InvoiceDocumentNo`, `C_Invoice_ID`, `TenderType`, `CreditCardType`, `PayAmt`, `Orig_TrxID`, `TrxType`. Its card-number columns (`CreditCardNumber`, `CreditCardVV`, `CreditCardExpMM/YY`) stay EMPTY from a till (§5, PCI).
- **No `I_POSSales` exists** in the seed or the docs: it is a new dictionary object.
**Design (the owner's proposal, made concrete):**
- **Deposit (till, unchanged legacy shape):** ticket lines → `I_Order` (`DocumentNo` = the ticket key, §13.5); tenders → `I_Payment` with **`DocumentNo` = the same ticket key**, `TenderType`, `CreditCardType`, `PayAmt`, the terminal's approval code in `Orig_TrxID`.
- **`I_POSSales` = ONE SQL view:** `I_Order` lines joined to their `I_Payment` tenders on the ticket key, plus per-ticket totals (lines total vs tenders total = a visible mismatch before import). `AD_Table` IsView='Y' with its `AD_Column` rows. It gives the clerk ONE window per sale ("Import POS Sales") instead of two import windows.
- **"Import POS Sales" process (head office, a clerk role) unravels each ticket, all-or-none, through the LEGACY processes only:**
  1. Import Orders (206) for that ticket's lines → ONE completed POS order (WR also makes its shipment + invoice);
  2. the glue step: find that order's invoice and stamp `I_Payment.C_Invoice_ID` on the ticket's tenders (an id link, no business rule);
  3. Import Payment (343) for those tenders → receipts allocated to that invoice;
  4. a ticket whose tenders do not match its total, or whose step fails, is left whole (nothing posted) with `I_ErrorMsg` on its rows — legacy's own import-error convention.
- **Where it lives — the separation:** the view, its window rows and the process row are DATA staged by the **ERP-side POS integration plugin** (`ctx.dict`, removed on stop). That is the twin of the owner's server-side `posintegration` plugin (§6), so no base-hash change and no host code. The till app carries no import logic; the comm plugin only carries the two `I_*` row kinds; Branch Day Close (§2.3) then calls "Import POS Sales" in place of the separate Import Orders + Import Payment steps.
- **Thin pipe (§34) kept:** two row kinds of identifying facts per ticket travel up. The view and the unravelling happen at head office, which is model-rich.
**Witness W-POS-SALES (spec):**
- a 3-line ticket with 2 tenders (cash + card) → the view shows 1 sale, 3 lines, 2 tenders, totals equal;
- the process makes ONE completed order, ONE invoice, TWO receipts allocated to it, open amount 0;
- a ticket whose tenders total ≠ lines total is left whole with `I_ErrorMsg`, and 0 documents are made;
- the process run twice makes nothing new (`I_IsImported`);
- the card-number columns are empty on every deposited row;
- the plugin stopped → the view, window and process rows are gone and the base hash is unchanged.
- Mutants: the invoice link step off (receipts unallocated) · all-or-none off (an order without its payments) · the total check off.
**Order:** after Import Payment (§41 agent B) — the view and process are a small step on top of the two legacy ports.

## §10 What happens ON THE TILL, housekeeping by a central OK, and the concerns — with the industry's prior art (2026-10-28; owner: *"question is what actually happens on POS side. Storing it's ready to export data with legacy table exacts makes good learning curve for legacy users. After some month's export and successful reconciliation by central, it can receive an OK code to housekeep. What other concerns should we look into? … my integration around 2012 is a prior art so we have to refer how industry handles central POS systems."*)
### §10.1 The owner's model of the till
The till stores what it will export **in legacy's exact import tables** (`I_Order` lines, `I_Payment` tenders — the `I_POSSales` view of §9 reads them), so a legacy user already knows the till's data. It keeps them until head office has imported AND reconciled them. Head office then sends an **OK code**, and the till housekeeps (purges) what the code covers.
### §10.2 How the industry runs central POS (prior art; sources at the end)
- **Oracle Retail Sales Audit (ReSA):** stores send their transaction log (RTLOG). The central sales audit loads and validates it, computes totals (incl. over/short for store balancing), and holds a **store/day** until every error is corrected or overridden; the store/day status becomes *Audited* and only then is it exported (to GL etc.). A separate step prevents exporting the same totals twice.
- **Microsoft Dynamics 365 Commerce:** store transactions are pulled to headquarters (P-job), **validated**, then **calculated and posted** as statements. The trickle-feed model splits transactional statements (orders, invoices, payments, posted continuously) from financial statements (the cash/tender reconciliation of a shift).
- **ERPNext:** POS Invoices touch no ledger while the shift runs; the **POS Closing Entry** consolidates the period's invoices into ONE Sales Invoice (a Merge Log records which), turning n × 3 ledger entries into 3–4.
- **The owner's 2012 integration** (§6) is the prior art of the same loop over ActiveMQ.
- **The common pattern, in our terms:** the store captures an immutable log → the centre audits a store/day (completeness, totals, tenders vs money) → only an audited day is posted, once → the store is told. The OK code IS that last step.
### §10.3 The OK code, in the framework we have
- **The OK is a signed statement from head office:** the G-8 mechanism (`TeamSync.publishStatement`, owner-signed, judged by the engine) with a new kind, `reconciled`:
  - `{till (device kid / C_POS), business day, last ticket number, a hash of that day's deposited rows, the Z totals it balanced against}`.
  - The till **verifies the signature and the hash against its own rows** before deleting anything. It never purges on an unsigned, forged, or older-watermark code.
- **What it keeps after a purge:** the day's Z summary (the counters), so a till can still print a past day's totals.
- **Legal retention** is head office's job (the books live there; Malaysia's record-keeping period to be confirmed). The till's own retention window is a setting.
- **Close cousins already built:** the checkpoint (§13.12.3, a signed state that compacts a log) and the period close (`erp_period_close.js`). The OK code compacts the TILL's export store the same way — G-21's storage half, at the till.
### §10.4 Concerns to design for (each traced to the prior art or to our register)
1. **Business day and the Z close** (ReSA store/day, D365 shift statement, ERPNext closing, Unicenta's close-cash). One close per till per business day: totals by tender, tax, voids, discounts, and a non-resettable grand-total counter. They travel as a declaration (Q-c answered by the prior art: yes, a declaration). The business day comes from the shift open, not the wall clock (a till's clock can drift; a late-night shift crosses midnight).
2. **Central audit gate before posting.** "Import POS Sales" runs only for a till/day whose Z has arrived, whose ticket numbers have no gap, and whose lines and tenders balance the Z. Errors are corrected or overridden by an auditor role (ReSA). The import is the posting step, run once (`I_IsImported` + the unique index).
3. **Completeness: gaps and duplicates.** Ticket numbers are contiguous per till; a gap report is shown before the OK. Duplicates are already refused (ticket key + `c_order_documentno`, §13.5).
4. **Voids, returns, refunds, discounts, manager overrides, drawer opens.** Loss-prevention audit rows travel too: Unicenta keeps removed lines and drawer-open events. Returns at another store = G-11 / §39.
5. **Price and tax at the time of sale.** The ticket carries the price paid (`PriceActual`, honoured by Import Orders) and its tax. Promotions are effective-dated reference seeds. The receipt total must equal the imported order's GrandTotal to the cent (tax rounding witness).
6. **Tenders and card settlement** (§5): the terminal's batch close totals vs the acquirer's payout vs the bank statement.
7. **E-invoicing (Malaysia, LHDN MyInvois).** Sources agree that B2C sales may be submitted as a **consolidated e-invoice within 7 days after month end**, and that a buyer who asks for an individual e-invoice gets one. Frequency and thresholds differ between sources: **confirm against LHDN's current guideline before building.** In our split: head office submits (never the till); the till only captures the buyer's tax id when asked.
8. **Per ticket vs consolidated posting.** Legacy iDempiere makes one POS order per ticket (what we twin by default). ERPNext and D365 consolidate per shift/day to cut ledger volume. Consolidation is a friendly-ops option at volume, not the default (G-20/G-21 scaling).
9. **Devices from a browser till.** Receipt printer, cash drawer, scale, scanner, card terminal: a browser needs WebUSB/WebSerial or a small local bridge, and card terminals usually run "semi-integrated" (the POS sends the amount, the terminal handles the card). A P0 measurement for the standalone till.
10. **Offline capacity and device loss.** Storage quota and the number of days a till may run offline (alarm before full). A lost or stolen till: device revoke (roster), and its deposits stay signed. Training mode (tickets that never export). Customer data on the till falls under Malaysia's PDPA.
11. **Restaurant.** Open tables shared by several tills in one branch (Unicenta's shared tickets) and reservations = branch-local state (§7), never head office's.
### §10.5 Phases this adds
- **P0:** Unicenta's own tables and close-cash from source (Q-f).
- **W-TILL-Z:** a day's Z balances against its deposits.
- **W-OK-HOUSEKEEP:** a signed OK purges exactly the covered rows; a forged or older one purges nothing; the Z summary survives.
- **W-AUDIT-GATE:** an unbalanced or gapped day is not imported.
### §10.6 Sources (2026-10-28 search; vendor blogs flagged where used)
Oracle Retail Sales Audit: https://docs.oracle.com/cd/E79623_01/rms/pdf/160C/html/resa_ug/resa-import.htm · https://docs.oracle.com/cd/E79792_01/resa/pdf/141/html/user_guide/resa-totals.htm · https://docs.oracle.com/cd/E79623_01/rms/pdf/160C/html/resa_ug/resa-auditing.htm · https://docs.oracle.com/en/industries/retail/retail-merchandising-foundation-cloud/21.0/rmsoa/prevent-duplicate-export-total-values-resa-sapreexp.htm — Dynamics 365 Commerce: https://learn.microsoft.com/en-us/dynamics365/commerce/trickle-feed · https://learn.microsoft.com/en-us/dynamics365/commerce/fin-recon · https://learn.microsoft.com/en-us/dynamics365/commerce/valid-checker — ERPNext: https://docs.frappe.io/erpnext/pos-invoice-consolidation · https://docs.frappe.io/erpnext/user/manual/en/point-of-sales · https://discuss.frappe.io/t/feature-erpnext-v13-new-point-of-sale-beta-testing — MyInvois (secondary sources, to confirm with LHDN): https://vatcalc.com/?p=17543 · https://www.hashmicro.com/my/blog/consolidated-e-invoice/ · https://www.cleartax.com/my/en/consolidated-einvoicing-malaysia · https://paydibs.com/?p=30227
