<!-- ⚠ DO NOT REMOVE — Scope: the instrumentation list for Film 6 (TEAMWORK_FRAMEWORK §42.1). Which `§FILM_EVT` lines each witness must print, and where, so the trace recorder can build a REAL trace6.json (trace6.schema.json). NOTHING in any witness or bim-ootb file was edited to write this list; anchors are file:line in /tmp/wt-integ (bim-ootb integ/wave1 @ ab43f535, read 2026-10-28). Read the witness log after every run: no §FILM_EVT line = no event = nothing to show. -->
# FILM_EVT — the instrumentation list

## 0. Findings that change what the lead must add (read first)
1. **No witness takes a device offline.** W-HQ-CLERK, W-POS-PLAN and W-TEAM-SO never call `context.setOffline` (only `tests/offline_smoke.js:74` does). "Offline" in the trace therefore needs a real arm: Playwright `ctx.setOffline(true)` on the till (and on a borrower phone) around the deposit, a `T.visit()` that fails with no link and queues, then `setOffline(false)` and the Visit that carries it. A `§FILM_EVT kind=offline` printed without that toggle would be a label with nothing behind it (the §41.1 rule: a witness that cannot fail is not a witness). Until the arm exists, the film must not show OFFLINE stretches as measured.
2. **The till's inbound events must come from W-POS-PLAN (POS plan), never from W-HQ-CLERK.** W-HQ-CLERK runs an OFFICE space (no `?teamplan=pos`): its H11 shows the station holding the completed order AND the movement (`integ/hq_clerk.log` H11). Under the POS plan the till receives ONLY the movement line (`§PPB_AFTER B(till) … projected_tables=m_movementline:1`, `order=0`) — the §41.1 film correction. Two plans, two spaces: the trace must not splice them onto one till card.
3. **W-POS-PLAN builds the loans by raw CRUD** (`T.create(A,'c_invoice',…)`, `witness_pos_plan.js` lines 119-122) and the borrower payment as `c_payment` (line 125), not as a term-108 invoice and an `I_Payment` slip. The borrower story (Ch 2, Ch 4) needs W-MF-SEED (F2). Also the till's `I_Payment` tender rows do not travel yet (only `i_order` is a till UP flow; the `I_Payment` UP row in `flows_pos.json` is F2's).
4. **W-POS-SALES is Node only** (no page, no devices). It supplies figures (tickets, totals, refusals, posting facts) but no actor events from a real page; the clerk's "Import POS Sales" on the real menu needs the live-page arm (fact `poss_live_page`). W-HQ-CLERK drives "Import Orders" (206) from the real menu.
5. **W-POS-CHAIN printed `§PC_VERDICT INCONCLUSIVE — no ticket lines (PC_LINES) given`** in the lead's integration run (`integ/pos_chain.log`): an instrument fault (missing env), not a result. Do not cite W-POS-CHAIN C3/C4 in the film until it is re-run with `PC_LINES`.
6. Text limits the stage enforces (the dry run flags overflow): `text` of a log line ≤ 40 characters; `text` of a `note`/`refuse` ≤ 95 characters (2 lines); `label` ≤ 14 characters; `key` ≤ 20 characters. No number appears in a `text` unless it is a fact id value.

## 1. The line format (one helper, print it from the harness, never from the engine)
```
§FILM_EVT actor=<till|phone1|phone2|verifier|clerk|stock|relay> kind=<online|offline|local|send|deliver|verify|ack|run|refuse|note> seq=<n> ts=<ms, monotonic> step=<witness step id, e.g. H6> [label=<…>] [key=<…>] [to=<actor>] [from=<actor>] [queue=<±n>] [slip=<received|refused|unreached>] [todo=<set|clear>] [status=<approved|refused|unreached>] [process="<legacy process name>"] [cls=<ok|bad|n>] [text="<…>"]
```
- `ts` orders the lines; **`step` maps to the sample-day hour through `schedule6.json`** (a SCHEDULE: `{"H1":"09:10", …}`; the stage labels the clock "sample day"). The witness never prints a clock time of its own.
- Helper (in the harness, e.g. `T.evt = (o) => console.log('§FILM_EVT ' + Object.entries(Object.assign({seq: ++SEQ, ts: Date.now()}, o)).map(([k,v]) => k + '=' + (/\s/.test(String(v)) ? JSON.stringify(v) : v)).join(' '))`). One print per event; `send`/`deliver` are printed where the harness already counts `m.delivered` / `ownPlaced`, so envelopes equal the counted ops.
- The recorder (`film6_record.js`, to write) builds the trace: parses the lines, sets `wit = "<witness>#<log line number>"`, fills `header.sources` with the log path and sha256 of each run, and calls `film6_guard.js` (a trace with `status` ≠ REAL, any `wit=DRAFT`, or a source without sha256 is refused, exit 4).

## 2. W-HQ-CLERK — `erp/tests/witness_hq_clerk.js` (browser, office space) → Ch 3 (clerk, stock role); the till deposit of Ch 1 only as the deposit shape
| Where (line) | Event(s) to print |
|---|---|
| after the enrol loop, ~142-146 (H0) | `actor=clerk kind=online step=H0`, `actor=till kind=online step=H0` |
| ~148-151, per created `i_order` row (S1/H1) | `actor=till kind=local queue=1 text="ticket line written" step=H1` ×3; then at `T.visit(B)` (line 150) `actor=till kind=send label=I_Order key=<ticket> step=H1` ×3 |
| ~153-157 (S2/H2) | `actor=clerk kind=deliver from=relay label=I_Order step=H2` ×3; `actor=clerk kind=note cls=n text="rows arrived, nothing runs" step=H2` |
| ~158-186 (S3/H3, H5 menu sweep) | per role: `actor=clerk|stock kind=note cls=ok|bad text="menu: 8 of 8 match"` is a FACT (`hq_menu_x/n`); print only `actor=stock kind=refuse text="no Import Order entry" step=H5` for the negative arm |
| ~187-207 (S4/H6, H7) | `actor=clerk kind=run process="Import Orders" text="order per ticket" step=H6`; second run `… text="second run: nothing new" step=H7` |
| ~231-246 (S5/H8) | `actor=stock kind=online step=H8` (same device, role 103) |
| ~247-275 (S6/H9) | `actor=stock kind=run process="Replenish Report" text="quantities, no document" step=H9` |
| ~276-291 (S7/H10) | `actor=stock kind=run process="Material Movement" text="one movement" step=H10`; the movement leaving: `actor=stock kind=send label=movement step=H10` |
| ~293-299 (S8/H11) | **office-plan inbound: do NOT use for the till card** (finding 2); keep `actor=stock kind=note` only if the stock card needs the movement received |
Lines to NOT print: anything from the mutant child runs (`HQ_ONLY_ARMS`): guard the helper with `if (!MUT)`.

## 3. W-POS-SALES — `erp/tests/witness_pos_sales.js` (Node) → Ch 3 figures; no devices
Print through the same helper, actor `clerk`, at `guard('SALE','ran',…)` (line 227): `kind=run process="Import POS Sales" text="ticket imported" step=P1` (K1); at `guard('BATCH','ran',…)` (line 279):  `kind=run … text="batch: refused tickets stay whole"` and `kind=refuse cls=bad text="tenders and invoice differ: whole, with reason" step=P2` (the mismatch ticket); at `guard('RERUN','nothing-new',…)` (line 335): `kind=run … text="second run: nothing new" step=P3`. These are **Node-only** events: the clerk card may show them only after the live-page arm exists (`poss_live_page`), else the script says "the import" and the stage uses W-HQ-CLERK's Import Orders events.

## 4. W-POS-PLAN browser — `erp/tests/witness_pos_plan.js` → Ch 4 (only the events travel)
| Where | Event(s) |
|---|---|
| ~85-88 (B0 enrol) and ~104-110 (B1 enrol, four devices) | `online` for till, clerk(processor A), phone1 (C1), phone2 (C2) |
| 92 (B0) and 115 (B1): the till's `T.create(B,'i_order',…)` loop | `actor=till kind=local queue=1 text="ticket line written"`; at the following `T.visit(B)` `kind=send label=I_Order` |
| 118 `T.create(A,'m_movementline',…)` | `actor=stock kind=run process="Material Movement" text="replenishment line"` then `actor=stock kind=send label=movement` (the processor A plays the stock role here; keep the actor name from the trace's `actors`, not the device letter) |
| 125 `T.create(C1,'c_payment',…)` (until F2) | `actor=phone1 kind=local queue=1 text="payment row written"`; replaced by F2's slip path |
| 126-127 the final visit loop + `T.measure(B)` | per delivered op counted in `mB.delivered`: `actor=till kind=deliver label=<table> step=B2` — **exactly `mB.delivered` lines** (the stage will then show the 6 the relay delivered), and for each op the till REFUSED locally (`thin.refused`): `actor=till kind=refuse text="not declared for this role" step=B2` (count = `mB.thin.refused`); the one accepted: `kind=deliver label=m_movementline` |
| same, for C2 (`mC2`) | `actor=phone2 kind=deliver ×mC2.delivered`, `kind=refuse text="not addressed to this phone" ×mC2.thin.refused` (the 2 accepted are its own loan and instalment) |
The §PPB_* summary lines already carry the totals; the events must add up to them (the recorder asserts `Σ deliver = delivered_by_relay`, `Σ refuse = thin.refused`, per device).

## 5. W-TEAM-SO — `erp/tests/witness_team_so.js` → the stale-save message (Ch 4)
At the `§TEAM-CONFLICT` block (lines 247-268), after the two `console.log('   §TEAM-CONFLICT A=…')` lines (257): `actor=clerk kind=refuse cls=bad step=SO1 text="<the AD_Message text, read from the ad_message query on line 263>"` — the text must be the value of `§TEAM-CONFLICT-MSG ad_message A="…"`, not a literal (the film's fact `so_conflict_msg` is the same line). One event per device that shows the conflict (A and B); the film uses actor `clerk` for both because the story is "two people at head office edit the same record".

## 6. W-MF-SEED — does not exist yet (F2: bim-ootb `feat/mf-seed`, bim-compiler `fable/mf-seed`) → Ch 2 and the borrower half of Ch 4
Required prints (each arm of §40.1/§40.2, V1–V4, plus the end of day), actor names as in the schema:
- **V1 approved:** `phone1 verify to=verifier label=slip` → `verifier ack to=phone1 status=approved` → `phone1 local slip=received text="payment received"` **before** any Visit (this ordering is the claim), then `phone1 send label=I_Payment`.
- **V2 unreached → online → approved:** `phone2 offline` (a real `setOffline`, finding 1) → `phone2 local queue=1 todo=set text="<service> has not acknowledged"` → `phone2 note cls=bad text="<the phone's own message: which service, and what happens online>"` → `phone2 online` → `phone2 verify` → `verifier ack to=phone2 status=approved` → `phone2 local todo=clear slip=received text="row updated before send"` → `phone2 send label=I_Payment`. The `text` for the note is the phone's actual string (read from the DOM), not typed in the helper.
- **V3 refused:** `verifier ack status=refused` → `phone? local slip=refused` → `note cls=bad text="<the service's own message>"`.
- **V4 second adapter:** `verifier note cls=n text="adapter row swapped, no code change"` printed where the stub row is swapped.
- **duplicate:** `phone? refuse text="same bank reference refused on the phone"`.
- **end of day:** `clerk deliver label=I_Payment` → `clerk run process="Import Payment"` → (F1) `clerk run process="Tenant Accounting Processor" text="receipts posted"` → next Visit `phone? deliver label=balance` and `phone(other) refuse text="not addressed to this phone"`.
- **Recurring (F1/MF-2):** `clerk run process="Recurring" text="renewal invoice raised"`.
The run must also print every figure the script speaks as `§MFS-…` lines so the facts file can regex them (owner F2 names them; `facts6.spec.json` has the pending ids).

## 7. Schedule file `schedule6.json` (written by the lead at recording; the only place hours exist)
`{ "step": "hh:mm" | "+1 hh:mm" }`, taken from §42.1 (sales 09:10 to 11:40 offline, Visit 12:05; 17:30 Import POS Sales; 17:45 Import Payment; next morning 08:00 Replenish Report). The stage shows it as "sample day"; no hour is a measurement.

## 8. AS BUILT (2026-10-28, after the merge; PR #2431 live at main 0e0cd312)
- Lines printed by the witnesses (all `§FILM_EVT`, copies under `logs/evidence/`): W-FILM-OFFLINE 14 (`final/film_offline.log`, a real `setOffline` arm: finding 1 is closed), W-POS-SALES-LIVE 9 (`final/pos_sales_live.log`), W-HQ-CLERK with `HQ_PLAN=pos` 22 (`final/hq_pos.log`), W-MF-SEED 36 (`logs/evidence/mf_seed.log`; added by agent K in bim-ootb branch `film/mf-evt` `9ca13d01`, test-only, re-run 32/0 5/5).
- `build_trace6.js` selects the steps (O0-O3, S0-V4, P1-P3, I1, R, P, H8-H11, B1-B2) and fills the sample-day hours from `schedule6.json`; 63 events, header status REAL, 4 sources with sha256; `film6_guard.js` accepts it, and refused `trace6_DRAFT.json` (exit 4).
- Not used from the logs (named, not hidden): W-HQ-CLERK H0-H7 and W-POS-SALES-LIVE P0 (the same till deposit that W-FILM-OFFLINE already shows, with the offline cut). W-POS-PLAN and W-TEAM-SO print no `§FILM_EVT`: the film takes their numbers from their `§` lines as facts (`ppb_*`, `so_conflict_msg`), not as stage events.
