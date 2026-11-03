# uniCenta-style Till & Kitchen Screen — User Guide *(SQLite, local-first)*

> **⚠ DEMONSTRATOR — NOT OFFICIAL.** Every screenshot in this guide is taken on the **GardenWorld demo
> tenant** with demo products and demo prices. Treat every figure as a sample (`SAMPLE — NOT OFFICIAL`),
> not as a certified point-of-sale or accounting system.

**What this is.** A cash-register screen that looks and behaves like **uniCenta oPOS 5.0**, so a cashier who knew
uniCenta needs no new learning, running on the same SQLite twin of iDempiere as the rest of Kernel-ERP. It is a
**separate page**, not a pill inside the ERP. It runs on the till's own browser, with no server, and it keeps
working when the connection drops.

> **The till deposits; it never completes.** Each sale is written on the till as *import rows* (`I_Order` lines
> and `I_Payment` tenders — the same legacy import tables iDempiere has). Head office later turns them into
> orders, invoices and receipts. The till itself writes **no** order, shipment, invoice, payment or posting.

Live pages (the demo site):

- Till: <https://red1oon.github.io/bim-ootb/erp/till.html>
- Kitchen screen: <https://red1oon.github.io/bim-ootb/erp/kitchen.html>

Related guides: [Kernel-ERP User Guide](ERPUserGuide.md) · [Kernel-ERP — Your First Setup](ERP_FirstSetup.md) ·
[Distributed ERP](DistributedERP.md).

This is a task-oriented manual. **Cashier:** read *If you know uniCenta 5*, *Ringing a sale* and *The kitchen*.
**Branch manager:** read *Setting up a till and a kitchen screen* and *Shifts and Close Cash*.
**Head-office clerk:** read *Head office*. Everyone: *Troubleshooting* at the end.

---

## If you know uniCenta 5

The 22 things a uniCenta 5.0 cashier does, and where each one is here. Labels are uniCenta's own.

| # | In uniCenta 5 | Here | What differs, and why |
|---|---|---|---|
| 1 | Login (user button / card) | **Login** screen: one button per active user of the tenant | You tap a name. There is no card or password step on this till. |
| 2 | Register menu: Sales, Edit Sales, Customer Payment, Payments, Close Cash | Same five buttons, in that order | Three more buttons follow them: **Check In/Out**, **Voucher**, **Pickup Reset**. |
| 3 | Sales screen | **Sales** screen, same six regions | **Scale**, **Mooring**, **Split Sale**, **Customer**, **Search product**, **Edit line**, **Choose attributes** and **Check Stock** are shown greyed out ("not in this release", with the reason as a tooltip). |
| 4 | Number pad | Same pad and same grammar (`3` then a product = 3 units, `n*`, `+`/`-` on the selected line, `=` to pay) | Re-read against uniCenta 5.0, not 3.81: on a refund ticket `+`/`-` add −1, and `n -` no longer makes the price negative. |
| 5 | Catalog: categories, sub-categories, product tiles | Same, tiles 107 x 60 | Tiles are the products that have a price on the till's price list, sorted by product key. |
| 6 | Ticket button bar | **Total discount**, **Line discount**, **Print preview**, **Open drawer**, **Virtual Keyboard** | Refund item, Service charge, Line note, Set person are **not** on the bar, as in uniCenta 5.0's default (they are commented out there). |
| 7 | Shared tickets | **Add New Ticket**, **Tickets awaiting completion**, **Delete**, **Reprint Ticket**, **Quick LogOff** | — |
| 8 | Payment dialog, 8 tenders | Tabs **Cash, Cheque, Voucher, Card, Free, Debt, Bank, Slip**; Add / Delete Part Payment; Print Receipt | **Voucher, Free, Debt and Slip are disabled.** Legacy iDempiere has no payment tender type for them, and the till may only send what legacy can import. Cash, Cheque, Card, Bank are live. |
| 9 | Receipt and change pop-up | **Receipt** screen, **Change** pop-up | Card: you key the terminal's reference and approval code; the card number is never typed or stored. |
| 10 | Edit Sales | **Edit Sales** | Edit is allowed only on a sale of the open shift that has not been refunded or sent to head office. |
| 11 | Refund | **Edit Sales → Refund** | Tabs Refund, Cheque, Voucher (disabled), Card. |
| 12 | Customer Payment | **Customer Payment** | Tabs Cash, Cheque, Voucher (disabled), Bank, Card, Slip (disabled). The till writes no debt of its own. |
| 13 | Payments (cash in / out) | **Payments** | Stays on the till (see *What never leaves the till*). |
| 14 | Close Cash (Z), Print, reprint a past Z | **Close Cash**, **Print**, **Reprint a past Z** | No counted-cash box — uniCenta 5.0 has none either. |
| 15 | Send Order (remote printer) | **Send Order** → the kitchen screen | uniCenta's remote display has no states and nothing comes back. Here the kitchen can mark done / void and the cashier sees it. |
| 16 | Restaurant map | `till.html?mode=restaurant` → 24 tables | — |
| 17 | Reservations | **Reservations** (restaurant mode) | — |
| 18 | Reprint Last Ticket | **Reprint Last Ticket** | — |
| 19 | Voucher issue / redeem | **Voucher** screen | A till-local ledger only. The Voucher *tender tab* stays disabled. |
| 20 | *(none in uniCenta)* | **Kitchen screen** | New: a separate page with waiting / done / void, Recall, changed-line marks and a Ready notice back to the till. |
| 21 | Check In / Check Out | **Check In/Out** | — |
| 22 | Pick-up number reset | **Pickup Reset** | — |

---

## Getting started (for the cashier)

1. **Open the till page** — <https://red1oon.github.io/bim-ootb/erp/till.html>. The strip at the top shows
   *Till*, *online/offline*, *paired / not paired*, who is signed in, *deposited N*, and a **Visit head office** button.
2. **Tap your name.**

   ![Login: one button per user, the status strip on top](img/till/till_01_login.png)

3. **Pick a panel** on the Register menu: *Sales, Edit Sales, Customer Payment, Payments, Close Cash*, and below
   them *Check In/Out, Voucher, Pickup Reset*.

   ![The Register menu](img/till/till_02_menu.png)

4. **Tap Sales.** Pick a category, then tap product tiles. The back arrow returns to the parent category.

   ![The Sales screen: option buttons on top, ticket and totals, number pad and side buttons on the right, categories and product tiles at the bottom](img/till/till_03_sales.png)

---

## Common tasks

### Ringing a sale

1. On **Sales**, tap a product tile: one unit is added. Tap it again and the line's quantity goes up (the same
   product is merged into its line, as in uniCenta).
2. For several units, type the number on the pad first (`3`), then tap the tile: three units.
3. Tap a line to select it. On the pad, `+` adds one unit, `-` takes one away (a sale line at zero is removed),
   and `n` `*` then `+` sets the line to *n* units. **C** clears the pad. **Delete line** removes the selected line.
4. A typed barcode followed by **Enter** (or **Get Barcode**) adds the product with that barcode or product key.
   An unknown code answers "*code* - no such product".

   ![Elm Tree x3 and a Patio Table on the ticket; the pad shows what is typed](img/till/till_04_lines.png)

5. Totals (Subtotal, Taxes, Total) are worked out with the ERP's own tax functions, so they equal what head office
   will import.

### Discounts

1. Select the line. Type the percentage on the pad **as digits**: `10` means 10 %.
2. **Line discount** inserts a negative "Line Discount 10%" line under the selected line. **Total discount**
   lowers the price of every line by that percentage.

   ![A 10% line discount under the Patio Table](img/till/till_05_discount.png)

3. If the discounted price would fall below the price list's **price limit**, the till refuses it first, because head
   office would refuse the ticket anyway.

   ![The refusal message across the top](img/till/till_06_refused.png)

### Taking payment

1. Press **=** on the pad (or the space key). With no lines on the ticket the till just beeps.
2. The **Payment** dialog opens with the total and what remains. Voucher, Free, Debt and Slip are greyed.

   ![The Payment dialog: eight tabs, four live](img/till/till_07_pay_tabs.png)

3. For a **split tender**: choose a tab, type the amount, tap **Add Part Payment**. For **Card**, key the *Terminal ref*
   and *Approval code* from the card terminal first. Only **Cash** may be more than what remains (the extra is change).
   **Delete Part Payment** removes the last part.

   ![Card 20.00 then Cash 250.00 against 231.75: change 38.25](img/till/till_08_pay_split.png)

4. Tick or untick **Print Receipt**, then **OK**. The sale is saved on the device and the **Receipt** screen opens.
5. If the **first** tender was cash and there is change, a **Change** pop-up shows the amount. Tap **OK** to return.

   ![The receipt: number, date, terminal, served by, lines, totals, tenders](img/till/till_09_receipt.png)

### Holding tickets and quick log-off

- **Add New Ticket** keeps the current ticket (if it has lines) and opens an empty one.
- **Tickets awaiting completion** lists the held tickets; tap one to recall it (a recalled ticket is removed from the list).
- **Quick LogOff** holds the current ticket and returns to Login.
- **Delete** asks "Are you sure you want to Delete the current Order?".

![The held-tickets list](img/till/till_10_held.png)

### Reprinting

**Reprint Last Ticket** reprints the last ticket of this till. **Reprint Ticket** lists the tickets of this till; tap one.

### Finding and editing a past ticket; refunds

1. Register menu → **Edit Sales**. Choose *Sales* or *Refund*, type the ticket number and press **Find**, or press
   **Finder** to list them and tap one.
2. **Print** reprints it. **Edit** reopens the lines on the Sales screen and saves under the **same ticket number**.
3. **Refund** opens a list of the original lines: **Add** the lines to refund (or **Add all lines**), then **Refund**.
   The Sales screen shows a refund ticket; **=** pays it with the Refund / Cheque / Card tabs.

![Edit Sales with the ticket found](img/till/till_11_editsales.png)

The buttons switch on and off by rule, and the line under the ticket says why:

| Situation | What the screen says |
|---|---|
| Already refunded | *This ticket has been refunded* (Edit and Refund off) |
| The ticket is itself a refund | *A refund ticket* (Edit and Refund off) |
| Sold in a shift that has since been closed | *Closed cash: Edit is not available* |
| Already sent to head office | *Already sent to head office: use Refund* |

### Customer Payment

Register menu → **Customer Payment** → type a name or key → **Find** → tap the customer. The card shows **Name**,
**Credit Limit**, **Current Debt**; **Amount** starts at the current debt. **Pay** opens the Payment dialog
(Cash, Cheque, Bank, Card live). A customer payment is a payment row with no sale lines; head office imports it
with **Import Payment**, not with Import POS Sales.

### Cash in / cash out, vouchers, check in, pick-up numbers

- **Payments**: choose *Cash (In)* or *Cash (Out)*, type the amount and notes, **Save**. Cash out is stored negative and both
  show in the shift's Close Cash totals.

  ![Payments: a 50.00 opening float](img/till/till_12_payments.png)

- **Voucher**: **Issue** a numbered voucher (V000001...) for a customer and amount, or **Redeem** a number
  ("No such voucher" / "Voucher already used" / "Voucher redeemed ..."). It is a ledger on this till only.

  ![The Voucher screen](img/till/till_13_voucher.png)

- **Check In/Out**: **Check In** / **Check Out** for the signed-in user; the line shows "*name* has Checked In at ...".
- **Pickup Reset**: shows the next pick-up number. **Reset** asks "Do you really want to reset the Order Pickup number to 0?".
  Pick-up numbers are given at the first **Send Order** or sale of a ticket that has no table.

### Restaurant mode

Open `till.html?mode=restaurant`. **Sales** now opens a floor map of **Table 1 ... Table 24**. A table with a held
or open ticket shows "Waiting : *time*". Tap a table to open or recall its ticket. **Reload**, **Reservations**
and **Tables** are on the sales screen; a reservation (*Select Person, Persons, Booking Time, Notes, Table* → **Save**)
has a **Check-In Now** button that opens that table. The shared-ticket buttons are hidden in this mode.

---

## The kitchen

### Sending an order

1. On **Sales**, ring the lines and tap **Send Order**. Every sale line of the ticket goes out as one new
   *generation* of the order (discount lines and zero quantities are not kitchen lines).
2. The order's name is the **table** if the ticket has one, otherwise the **pick-up number**, given on the first send.
3. The till says "Order *n* sent to the kitchen" and shows a **Kitchen: waiting** chip on the ticket bar.
4. Send again after changing the ticket: the new send **replaces** the old one on the kitchen screen. Sending an
   empty ticket after an earlier send tells the kitchen the order was cancelled.
5. When the kitchen marks the order done or void, the till shows "**Kitchen: order *n* is READY**" or "...is VOID" once,
   and the chip changes. While an order is waiting, the till checks for news every 10 seconds
   (`?poll=<seconds>` on the till URL changes it).

![After Send Order: the message and the "Kitchen: waiting" chip](img/till/till_17_send_order.png)

Send Order only works on a *sale* ticket ("Send Order is for a sale ticket").

### The kitchen screen

Open <https://red1oon.github.io/bim-ootb/erp/kitchen.html> on the kitchen's own device (set it up as in the next
section). Each waiting order is a card: order name and a running clock (MM:SS) on top, the lines below, **Bump** and **Void** at
the bottom.

![Three waiting cards. Order 1 was changed after it was sent: "Modified (send 2)", 3 x Elm Tree (was 2) in amber, Oak Tree added in green, Plum Tree struck through as removed](img/till/kitchen_01_open.png)

| What you see | Meaning |
|---|---|
| **Bump** | The whole order is done; the card leaves the screen and the till is told *READY*. |
| **Void** | The whole order is void; the till is told *VOID*. |
| Tap a line | Crosses that line off (done). Tap again to undo. |
| *Modified (send N)* | The till re-sent the order. Lines in **green** are new, **amber** "(was n)" changed quantity, **red struck-through** "(removed)" were taken off. |
| *Cancelled by the till* | The till sent an empty ticket after an earlier send. |
| **Recall** | Brings back the most recently bumped or voided card. Grey when there is none. |
| *N open* | How many cards are waiting. |
| **Station** | Filters by station. The till sends every line to station 1. |
| **Poll s** | How often the kitchen looks for news (default 10 seconds). |

### Elapsed colours: off until the branch sets them

The card header colours by waiting time **only when both** **Amber min** and **Red min** are filled in. Blank boxes
(placeholder "off") mean no colour, and nothing is assumed. With, say, 5 and 8: green until the 5th minute,
amber from the 6th, red from the 9th (whole minutes over the limit). The two numbers are saved on that kitchen device.

![Amber 5, red 8: order 2 is red, order 1 amber, order 3 green](img/till/kitchen_02_colours.png)

![After Bump on order 2: two open, Recall is now active](img/till/kitchen_03_bumped_recall.png)

The kitchen orders and their done / void marks are **branch-local**: they go only to the till and kitchen devices
of that branch Org. They are not legacy tables and head office does not read them.

---

## Setting up a till and a kitchen screen (branch manager)

Each till and each kitchen screen is a **Team device** of the branch's Org. You need a head-office (or manager) device that
starts the team, and a device for each till and kitchen screen.

1. **Start the team (once, on the head-office device).** Open the ERP page. Press the **Team** pill (two-heads icon,
   in the ⋯ rail). If it says *Turn on team mode*, press it; the page reloads. Under **Kind of team** choose
   **Point-of-sale team**, then press **Start a team**. Copy the **invite link**.

   ![The Team panel before a team exists: Kind of team, Start a team, or join one](img/till/ho_01_team_start.png)

2. **Join, on the till's own browser.** Open the ERP page there, press the **Team** pill, paste the invite (or open the
   invite link) and press **Join**. The device shows a **device code** and "Waiting for approval".
3. **Approve, back on the head-office device.** Team pill → **Check join requests** → match the device code →
   choose the role **Web Service Execution (50004)** → **Bound to** = the branch Org (for example *Store North*) →
   **Approve**. If *Bound to* is left empty the panel refuses: "Choose what this device is bound to first".
4. **Visit** on the joining device (Team pill → **Visit**, or **Visit head office** on the till page).
5. **Open the till** — `.../erp/till.html` on that device. The strip should say **paired**. The till's station
   (price list, Org, warehouse) is the tenant's first POS station (`c_pos`); its name is the Org key and the Team station user, for
   example `Store Central-webserv`, and that name is the prefix of every ticket number.
6. **Kitchen screen:** repeat steps 2-4 on the kitchen's device (same role and the **same** *Bound to* Org), then open
   `.../erp/kitchen.html`. Set **Amber min** / **Red min** if the branch wants colours.
7. **Test:** ring one sale, press **Send Order**, watch it appear on the kitchen device, press **Bump**, and watch
   the till say READY.

Both pages pass the address options `login=`, `pipe=`, `xcfg=`, `teamplan=` on to their built-in ERP engine, so a till can use another Team
station user with `?login=`.

## Shifts and Close Cash

A **shift** is numbered from 1 on each till and stays open until **Close Cash**.

1. Register menu → **Close Cash**. The page shows the Z for the open shift, read from the tickets of this shift:
   *Sequence, Start Date, End Date, Transactions, Units, Sales, Cash/payments, By tender, Net, Taxes,
   Lines removed, No Sale - Drawer Openings*. **Print** refreshes it.

   ![The Z of the open shift](img/till/till_14_close.png)

2. Press **Close Cash**, then confirm with **Yes, close the cash**.

   ![The confirmation step](img/till/till_15_close_confirm.png)

3. The page says **Cash Closed OK** and a new shift starts. A past Z can be reprinted from the drop-down and
   **Reprint a past Z**.

   ![After closing: next shift, past Z available](img/till/till_16_closed.png)

**When the shift reaches head office.** Close Cash runs **one Visit**, and that Visit carries the shift's rows (the batch). A manual **Visit
head office** or a **Send Order** also does a Visit and carries whatever is pending, so rows can arrive earlier. A Visit
that sends nothing marks nothing as sent. Offline, keep selling; the next Visit sends everything once.

### What never leaves the till

These live only in that till's browser, because legacy has no import shape for them:

- **Payments** cash in / out, the **Voucher** ledger, **Check In/Out**, pick-up numbers and their reset;
- restaurant floors, tables and reservations; **held** tickets; the drawer-opening count and the removed-lines audit;
- discount lines as separate lines (they are folded into the product line's price);
- links beyond the "Refund of *number*" line note; the closed-shift list and past Z records (re-derived on the till from the sale rows).

Head office therefore never sees a Z declaration. Clearing the browser's site data on a till loses these local items.
The sales themselves are in the device's engine, and numbering resumes after the highest number already deposited.

---

## Head office

Everything below is **opt-in**. Until the plugins are started, the ERP menu is exactly the legacy menu.

### Switching it on (System Administrator, once)

1. Sign in with tenant **System** → **SuperUser**.
2. Open the ⋯ rail and press the **plug** pill — **Plugin Engine**.
3. **POS integration** (`org.kernel.pos-integration`) is listed as *INSTALLED* but not started. Press **Start**.
4. Under *Friendly operations* press **Install** — this adds **Branch Day Close**.

![Before: POS integration installed but stopped, Friendly operations on offer](img/till/ho_03_plugin_before.png)

![After: both active](img/till/ho_04_plugin_after.png)

*Stop* on a bundle removes everything it added. The plugin rows (menus, processes, access) are visible to the System Administrator and
the **GardenWorld Admin** role, which is the head-office clerk. No other role gets them.

### Import POS Sales

Menu → **Data Import**:

- **Import POS Sale** (a read-only window): one row per till ticket, with *Ticket No, Business Partner Key, Date Ordered,
  Lines, Tenders, Lines Total, Tenders Total, Difference (Tenders - Lines), Imported, Import Error Message, Order*.
  A mismatch shows here before you import. On a price list that excludes tax the Difference is the tax; the exact check is done by the import.

  ![The Import POS Sale window](img/till/ho_07_import_pos_sale_window.png)

- **Import POS Sales** (the process): *Tenant, Organization, Bank Account (required), Ticket No (one ticket only)*.

  ![The Import POS Sales dialog](img/till/ho_06_import_pos_sales.png)

Each ticket is imported **all or none**: legacy Import Orders makes one completed order and its invoice; the tenders must equal
the invoice total to the cent; legacy Import Payment makes the completed receipts on that invoice; then the invoice
must be paid. Any failure rolls the whole ticket back, marks its rows with an error and the reason, and leaves it for
you to correct and run again. A customer payment (no lines) is refused here ("no ticket lines"); import it with **Import Payment**.

### Branch Day Close

Menu → **Data Import → Branch Day Close**. One run closes the business day for one branch (**Organization**) or several
(**Branch Orgs**, comma-separated Org ids; leave both empty for every Org that has pending till rows).

![The Branch Day Close dialog](img/till/ho_05_day_close.png)

| Parameter | Use |
|---|---|
| Organization / Branch Orgs | which branch(es) |
| Business Day (required) | the date of the tickets |
| Bank Account (required) | needed by Import Payment |
| Business Partner, Product Category, Is Kanban | the Replenish Report's own filters |
| Create (Inventory Movement / Production / Purchase Order / Requisition), Document Type | only if you want the replenishment documents made |

It runs, in legacy order and stage by stage over the branches: **1.** Import (Import POS Sales per cleared ticket),
**2.** Replenish Report for each warehouse of the branch, **3.** the replenish *create* only if you chose **Create**
("SKIPPED not requested" otherwise). Each step is reported on its own line. A failing step stops the whole close, is named with its
branch, and earlier steps stay.

**The audit gate.** Before importing, each till and day is checked on what head office really holds:

- **Gaps:** a till numbers its tickets from 1, so a missing number (S2 absent between S1 and S3) means a ticket never arrived.
- **Balance:** each ticket's tenders must equal the total the till itself computes (tax included or excluded, following the price list).

A till/day with a gap or an unbalanced ticket is **withheld whole**: none of its tickets are imported, it is named
("WITHHELD: gap S2" / "unbalanced ... expected=55.00 tenders=54.99"), and the other tills still close. The gate does
**not** check a Z, because the till never sends one. Customer payments are named and left for Import Payment. A branch with
nothing pending for the day is skipped, so running the close twice makes nothing new.

If **POS integration** is not started, the close falls back to Import Orders + Import Payment. Those cannot be limited to
single tickets, so the close is **blocked** (nothing imported) whenever a till was withheld or other days or branches
are pending; start POS integration for per-ticket control.

---

## Under the hood

- **A ticket number** is `<Org key>-<till user key>-<S|R|P><n>`: S sale, R refund, P customer payment, *n* counting from 1 per series. It is the
  `DocumentNo` of every row of the ticket.
- **Rows sent per ticket:** `I_Order` (one per product line: product, quantity, price actually paid, unit, date, shift tag
  "POS shift *till*/*seq*") and `I_Payment` (one per tender applied: amount, tender type, date, same shift tag). Over-payment is change and is never deposited.
- **Tender map:** Cash → `X`, Cheque → `K`, Card → `C`, Bank → `A`. Card rows carry the terminal reference and approval code, never the number.
- **Refunds:** negative quantity and negative payment under an `R` key, with "Refund of *original number*" on the line.
- **Prices and taxes** come from the ERP's own price list and tax functions; the till holds no tax formula.
- **Kitchen:** two branch-local tables (kitchen order, kitchen status). The till and kitchen look at the branch's shared box with one
  cheap list request per poll and run a full Visit only when another device wrote.
- **Same twin rule as the ERP:** where uniCenta 5.0 and legacy iDempiere disagree on what can be sent, legacy wins, which is why four tenders are disabled.

## Troubleshooting

| What you see | Meaning and fix |
|---|---|
| *That discount takes the line under its price limit; head office would refuse the ticket* (also "...takes a line under its price limit...") | The discounted price is below the price list's limit. Use a smaller percentage. |
| *Select a line and type the discount % first* | Select a line, type the percentage digits, then press the discount button. |
| *Enter an amount* | Type an amount before Add Part Payment / Save / Issue. |
| *Only cash gives change: the amount is more than remaining* | Over-tender is allowed on Cash only. |
| *Card: the terminal reference and approval code are needed (the card number is never keyed here)* | Key both from the card terminal. |
| *The ticket is already covered* / *The ticket is not covered yet: Add Part Payment* | Remaining must be zero before OK. |
| *This tender is not in this release* | Voucher, Free, Debt, Slip are disabled (no legacy tender type). |
| *A free-price or negative line has no legacy import mapping in this release (Import Orders needs a product)* | Ring a real product instead of a typed price. |
| *... - no such product* | The barcode or key matches no product on the till's price list. |
| *A refund takes lines of the original ticket (Edit Sales, Refund)* | On a refund ticket you cannot add products. |
| *Add at least one line to refund* | Tap **Add** on at least one line. |
| *The ticket does not exist* | Wrong number or series (Sales / Refund). |
| *Could not save the sale on this device: ...* | The device engine refused the save. Nothing was sent; retry. |
| *Send Order is for a sale ticket* / *Nothing to send* | Open a sale ticket with lines. |
| *Could not send the order: ...* | The kitchen row could not be saved on this device; retry. |
| Kitchen shows no cards | Till and kitchen must be paired to the **same** branch Org; press **Visit**. |
| Cards have no colour | By design until both Amber min and Red min are set. |
| *Visit failed: ...* | No connection or no pairing; keep working and press **Visit head office** later. |
| Strip says **not paired** | The device has not joined or is not approved yet (see *Setting up*). |
| Team panel: *No key: open the Team panel and use the system default, or save your own repository and key* | The team's relay key is missing on this browser; use the system default or save your own repository and key. |
| *Choose what this device is bound to first: ...* | Pick the branch Org in **Bound to** before Approve. |
| Import row error *ERR=no tenders: ...* | The ticket has lines but no payment rows. |
| *ERR=Tenders total X <> invoice total Y* | The tenders do not add up to the invoice; correct the rows and run again. |
| *ERR=Import Orders imported n of m ticket lines* | Some lines refused (product, price limit...); the reason follows. |
| Day Close: *WITHHELD: gap ...* / *unbalanced ...* | A till/day failed the audit gate. Find the missing ticket or fix the tender, then close again. |
| Day Close: *STOPPED at step "..." (Org ...)* | The named step failed; earlier steps stay. Fix the reason and run again. |
| Day Close: *BLOCKED, nothing imported* | POS integration is not started and the gate held a till or other days are pending. |
| *Branch Day Close: nothing pending for ...* | No unimported till rows for that day. |
| Branch Day Close not in the menu | Friendly operations is not installed (see *Switching it on*). |
