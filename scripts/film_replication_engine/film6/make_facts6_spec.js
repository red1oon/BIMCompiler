// ⚠ DO NOT REMOVE — Scope: generates facts6.spec.json, the facts list of Film 6. NO VALUE IS TYPED HERE: each fact is {id, witness, command, log file, regex, group}; facts6_resolve.js extracts the value from the log on the day.
// READ THE LOG (logs/facts6_resolve.log) after every run: MISSING = a "now" fact whose regex does not match its log; INCONCLUSIVE never prints as PASS.
'use strict';
const fs = require('fs');
const OOTB = 'in /tmp/wt-integ (bim-ootb main 0e0cd312 = integ/wave1 57a30863) ', BC = 'in /home/red1/bim-compiler (branch fable/integ-wave1) ';
const F = [];
const add = (id, ch, meaning, witness, cmd, log, re, group, extra) => F.push(Object.assign({ id, chapter: ch, meaning, witness, command: cmd, log, regex: re, group: group || 1, status: 'now' }, extra || {}));
const pend = (id, ch, meaning, witness, owner, expectLine, extra) => F.push(Object.assign({ id, chapter: ch, meaning, witness, status: 'pending', owner, expected_line: expectLine, command: null, log: null, regex: null }, extra || {}));
const SEED = 'sqlite3 /tmp/wt-integ/erp/ad_seed.db ';

// ---- Chapter 0b: the convention is old (static dictionary counts) ----
add('dict_i_tables', '0b', 'number of I_* import tables in the shipped dictionary', 'dictionary census (not a witness)', SEED + `"select count(*) from ad_table where lower(tablename) like 'i\\_%' escape '\\'"`, null, '^(\\d+)$', 1, { kind: 'sql' });
add('dict_import_procs', '0b', 'number of AD_Process rows whose Java class is an Import class (classname like %.Import%; includes Delete Import, ImportDelete). Say "built on an Import class", not "21 import wizards"', 'dictionary census (not a witness)', SEED + `"select count(*) from ad_process where classname like '%.Import%'"`, null, '^(\\d+)$', 1, { kind: 'sql' });

// ---- Chapter 1: the till declares (W-POS-SALES, Node, integ/wave1) ----
const POS = 'node erp/tests/witness_pos_sales.js 2>&1 | tee pos_sales.log  ' + OOTB;
add('poss_decl_lines', '1', 'I_Order lines declared across the seven sample tickets, all unimported, no document made', 'W-POS-SALES VIEW/deposit', POS, 'final/pos_sales.log', 'case=VIEW key=deposit OK rule="all tickets are declared: [^=]*= (\\d+) I_Order lines and [^=]*= (\\d+) tenders');
add('poss_decl_tenders', '1', 'I_Payment tenders declared in the same check', 'W-POS-SALES VIEW/deposit', POS, 'final/pos_sales.log', 'case=VIEW key=deposit OK rule="all tickets are declared: [^=]*= (\\d+) I_Order lines and [^=]*= (\\d+) tenders', 2);
add('poss_k1_total', '1,3', 'ticket K1: lines total = tenders total', 'W-POS-SALES VIEW/totals', POS, 'final/pos_sales.log', 'case=VIEW key=totals OK rule="LinesTotal=(\\d+) TendersTotal=(\\d+) Difference=(\\d+) \\((\\d+) = (\\d+) \\+ (\\d+)\\)', 1);
add('poss_k1_tender_a', '1,3', 'ticket K1: first tender amount', 'W-POS-SALES VIEW/totals', POS, 'final/pos_sales.log', 'case=VIEW key=totals OK rule="LinesTotal=(\\d+) TendersTotal=(\\d+) Difference=(\\d+) \\((\\d+) = (\\d+) \\+ (\\d+)\\)', 5);
add('poss_k1_tender_b', '1,3', 'ticket K1: second tender amount', 'W-POS-SALES VIEW/totals', POS, 'final/pos_sales.log', 'case=VIEW key=totals OK rule="LinesTotal=(\\d+) TendersTotal=(\\d+) Difference=(\\d+) \\((\\d+) = (\\d+) \\+ (\\d+)\\)', 6);
add('poss_k1_open', '3', 'open amount of K1 invoice after the imported receipts (allocated)', 'W-POS-SALES SALE/allocated', POS, 'final/pos_sales.log', 'case=SALE key=allocated OK rule="receipts allocated:.*open=(\\d+) IsPaid=Y');
add('poss_card_ref_present', '1', 'the card tender approval (R_PnRef / R_AuthCode / R_Result / R_RespMsg) reaches the receipt; Orig_TrxID stays NULL (flag, no number spoken)', 'W-POS-SALES SALE/card', POS, 'final/pos_sales.log', 'case=SALE key=card OK rule="card receipt: CreditCardType V, R_PnRef (\\S+), R_AuthCode (\\S+)', 1, { kind: 'text' });
add('poss_mis_lines_total', '3', 'mismatched ticket: invoice (lines) total', 'W-POS-SALES VIEW/mismatch', POS, 'final/pos_sales.log', 'case=VIEW key=mismatch OK rule="LinesTotal (\\d+), TendersTotal (\\d+)', 1);
add('poss_mis_tenders_total', '3', 'mismatched ticket: tenders total', 'W-POS-SALES VIEW/mismatch', POS, 'final/pos_sales.log', 'case=VIEW key=mismatch OK rule="LinesTotal (\\d+), TendersTotal (\\d+)', 2);
add('poss_mis_docs', '3', 'documents made for the mismatched ticket', 'W-POS-SALES BATCH/total-mismatch', POS, 'final/pos_sales.log', 'case=BATCH key=total-mismatch OK rule="(\\d+) documents for the key');
add('poss_fact_added', '3', 'Fact_Acct rows added by the batch', 'W-POS-SALES BATCH/no-posting-residue', POS, 'final/pos_sales.log', 'no-posting-residue OK rule="fact_acct rows added by the batch = (\\d+), facts of K4\'s own documents = (\\d+)', 1);
add('poss_fact_own', '3', 'Fact_Acct rows of the imported ticket\'s own documents (equal to the line above)', 'W-POS-SALES BATCH/no-posting-residue', POS, 'final/pos_sales.log', 'no-posting-residue OK rule="fact_acct rows added by the batch = (\\d+), facts of K4\'s own documents = (\\d+)', 2);
add('poss_batch_tickets', '3', 'tickets in the batch run', 'W-POS-SALES BATCH', POS, 'final/pos_sales.log', 'B-all §POSS client=11 bank=100 key=\\* tickets=(\\d+) imported=(\\d+) refused=(\\d+)', 1);
add('poss_batch_imported', '3', 'tickets imported in the batch run', 'W-POS-SALES BATCH', POS, 'final/pos_sales.log', 'B-all §POSS client=11 bank=100 key=\\* tickets=(\\d+) imported=(\\d+) refused=(\\d+)', 2);
add('poss_batch_refused', '3', 'tickets refused (whole, with a message) in the batch run', 'W-POS-SALES BATCH', POS, 'final/pos_sales.log', 'B-all §POSS client=11 bank=100 key=\\* tickets=(\\d+) imported=(\\d+) refused=(\\d+)', 3);
add('poss_rerun_new', '3', 'tickets imported by a second run of the same batch (nothing new)', 'W-POS-SALES RERUN', POS, 'final/pos_sales.log', 'case=RERUN key=nothing-new OK rule="process ok, summary #(\\d+)/(\\d+)');
add('poss_judged', '5', 'W-POS-SALES arms judged / failed', 'W-POS-SALES', POS, 'final/pos_sales.log', '§POSS-RESULT verdict=PASS judged=(\\d+) failed=(\\d+)', 1);
add('poss_basehash_flag', '5', 'the POS plugin leaves the team BASE hash byte-identical (open for extension, closed for change)', 'W-POS-SALES PLUG/base-hash', POS, 'final/pos_sales.log', 'case=PLUG key=base-hash (OK) rule=', 1, { kind: 'flag' });

// ---- Chapter 3: head office by role (W-HQ-CLERK, browser, integ/wave1) ----
const HQ = 'node erp/tests/witness_hq_clerk.js 2>&1 | tee hq_clerk.log  (HQ_NO_MUT=1 skips mutants) ' + OOTB;
add('hq_arms_judged', '3', 'W-HQ-CLERK arms judged (red=none)', 'W-HQ-CLERK', HQ, 'final/hq_office.log', '§HQ_ARMS red=none judged=(\\d+)');
add('hq_menu_x', '3', 'menu entries matching the dictionary (X of N), 4 roles x 2 entries', 'W-HQ-CLERK H3', HQ, 'final/hq_office.log', 'H3 menu entries match the dictionary for every role: X of N = (\\d+) of (\\d+)', 1);
add('hq_menu_n', '3', 'menu entries checked (N)', 'W-HQ-CLERK H3', HQ, 'final/hq_office.log', 'H3 menu entries match the dictionary for every role: X of N = (\\d+) of (\\d+)', 2);
add('hq_order_lines', '3', 'lines on the ONE completed order the clerk imported from the menu', 'W-HQ-CLERK H6', HQ, 'final/hq_office.log', 'H6 ONE C_Order with DocumentNo = the ticket key, CO, 3 lines[^\\n]*"nl":(\\d+)');
add('hq_rerun_orders_before', '3', 'orders in the tenant before the clerk runs Import Orders again', 'W-HQ-CLERK H7', HQ, 'final/hq_office.log', 'H7 the clerk runs Import Orders AGAIN[^\\n]*\\(orders in the tenant (\\d+) -> (\\d+)\\)', 1);
add('hq_rerun_orders_after', '3', 'orders in the tenant after the second run (equal)', 'W-HQ-CLERK H7', HQ, 'final/hq_office.log', 'H7 the clerk runs Import Orders AGAIN[^\\n]*\\(orders in the tenant (\\d+) -> (\\d+)\\)', 2);
add('hq_qty_123', '3', 'Replenish Report: Qty To Order, product 123', 'W-HQ-CLERK H9', HQ, 'final/hq_office.log', 'report rows: \\[\\{"p":123,"oh":\\d+,"q":(\\d+),.*?"p":130,"oh":\\d+,"q":(\\d+),.*?"p":134,"oh":\\d+,"q":(\\d+)', 1);
add('hq_qty_130', '3', 'Replenish Report: Qty To Order, product 130', 'W-HQ-CLERK H9', HQ, 'final/hq_office.log', 'report rows: \\[\\{"p":123,"oh":\\d+,"q":(\\d+),.*?"p":130,"oh":\\d+,"q":(\\d+),.*?"p":134,"oh":\\d+,"q":(\\d+)', 2);
add('hq_qty_134', '3', 'Replenish Report: Qty To Order, product 134', 'W-HQ-CLERK H9', HQ, 'final/hq_office.log', 'report rows: \\[\\{"p":123,"oh":\\d+,"q":(\\d+),.*?"p":130,"oh":\\d+,"q":(\\d+),.*?"p":134,"oh":\\d+,"q":(\\d+)', 3);
add('hq_mv_lines', '3', 'lines on the ONE Material Movement the stock role confirms', 'W-HQ-CLERK H10', HQ, 'final/hq_office.log', 'H10 OK makes ONE M_Movement \\(doctype (\\d+)\\) with (\\d+) lines', 2);
add('hq_station_proc', '4', 'processes the station ran in the office-plan HQ run (0: it only received). NOTE office plan, see FILM_EVT.md section 0', 'W-HQ-CLERK H11', HQ, 'final/hq_office.log', 'H11 the station ran neither Import Orders nor Replenish Report[^\\n]*bProc=(\\d+)');

// ---- Chapter 4: only the events travel (W-POS-PLAN browser, E, integ/wave1) ----
const PP = "PC_LINES='[...]' node erp/tests/witness_pos_plan.js 2>&1 | tee witness_pos_plan_browser.log  (PC_LINES = the W-POS-CHAIN ticket lines; PPB_NO_MUT=1 skips mutants) " + OOTB;
const PV = '§PPB_VERDICT PASS judged=(\\d+) fails=(\\d+) mutants_killed=(\\d+)/(\\d+) pageerrors=(\\d+) till_ops (\\d+)->(\\d+) till_bytes (\\d+)->(\\d+)';
add('ppb_before_ops', '4', 'till received ops in an OFFICE space (no plan)', 'W-POS-PLAN B0', PP, 'final/pos_plan.log', PV, 6);
add('ppb_after_ops', '4', 'till received ops under the POS plan', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', PV, 7);
add('ppb_before_bytes', '4', 'till envelope bytes, office space', 'W-POS-PLAN B0', PP, 'final/pos_plan.log', PV, 8);
add('ppb_after_bytes', '4', 'till envelope bytes, POS plan', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', PV, 9);
add('ppb_judged', '5', 'W-POS-PLAN browser arms judged', 'W-POS-PLAN', PP, 'final/pos_plan.log', PV, 1);
add('ppb_mut_killed', '5', 'W-POS-PLAN mutants killed', 'W-POS-PLAN', PP, 'final/pos_plan.log', PV, 3);
add('ppb_mut_total', '5', 'W-POS-PLAN mutants total', 'W-POS-PLAN', PP, 'final/pos_plan.log', PV, 4);
add('ppb_till_movement_lines', '4', 'tables the till projected under the POS plan: movement lines (the replenishment)', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', 'projected tables=m_movementline:(\\d+) order=(\\d+) loans=(\\d+)', 1);
add('ppb_till_orders', '4', 'completed orders the till holds under the POS plan (0: it holds its own ticket lines, not the processor\'s order)', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', 'projected tables=m_movementline:(\\d+) order=(\\d+) loans=(\\d+)', 2);
add('ppb_b2_in', '4', 'ops borrower 2 took in', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', 'borrower 2 took in exactly (\\d+) ops[^\\n]*?although the relay delivered (\\d+)', 1);
add('ppb_b2_delivered', '4', 'ops the relay delivered to borrower 2', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', 'borrower 2 took in exactly (\\d+) ops[^\\n]*?although the relay delivered (\\d+)', 2);
add('ppb_b2_foreign', '4', 'of borrower 1\'s loan / instalment / payment held by borrower 2', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', 'BORROWER 2 \\(same role\\) holds ITS loan[^\\n]*and (\\d+) of borrower 1\'s', 1);
add('ppb_undeclared_kept', '4', 'ops the processor kept on its own device (not declared on the pipe)', 'W-POS-PLAN B2', PP, 'final/pos_plan.log', 'the processor kept (\\d+) undeclared ops');
add('so_conflict_msg', '4', 'legacy message shown on a stale save (text, from AD_Message 53059)', 'W-TEAM-SO', 'node erp/tests/witness_team_so.js 2>&1 | tee witness_team_so.log ' + OOTB, 'final/team_so.log', '§TEAM-CONFLICT-MSG ad_message A="([^"]+)"', 1, { kind: 'text' });

// ---- Chapter 4c: loyalty (W-TREAT-CODE, bim-compiler scriptor) ----
const TC = 'node scripts/witness_scriptor_treat.js [bim-ootb dir] 2>&1 | tee treat.log  ' + BC;
add('tc_earn', '4c', 'loyalty balance after the earn', 'W-TREAT-CODE', TC, 'lane/scriptor_treat.log', 'W-TREAT-CODE — balance after earn/redeem/second scan (\\d+),(\\d+),(\\d+)', 1);
add('tc_redeem', '4c', 'balance after the redeem', 'W-TREAT-CODE', TC, 'lane/scriptor_treat.log', 'W-TREAT-CODE — balance after earn/redeem/second scan (\\d+),(\\d+),(\\d+)', 2);
add('tc_second', '4c', 'balance after the second scan (a no-op)', 'W-TREAT-CODE', TC, 'lane/scriptor_treat.log', 'W-TREAT-CODE — balance after earn/redeem/second scan (\\d+),(\\d+),(\\d+)', 3);
add('tc_overspend', '4c', 'balance flagged at settlement after a phone is restored to an older state and redeems again', 'W-TREAT-CODE', TC, 'lane/scriptor_treat.log', 'W-TREAT-CODE [^\\n]*"kind":"overspend","balance":(-?\\d+)');

// ---- Chapter 5: principles ----
add('wx_judged', '5', 'W-UPS-E2-HOST arms judged (executor by role rows)', 'W-UPS-E2-HOST', 'node erp/tests/witness_team_executors.js 2>&1 | tee witness_team_executors.log ' + OOTB, 'final/team_executors.log', '§WX_VERDICT PASS judged=(\\d+) fails=(\\d+) mutants_killed=(\\d+)/(\\d+)', 1);
add('wx_mut_killed', '5', 'W-UPS-E2-HOST mutants killed', 'W-UPS-E2-HOST', 'node erp/tests/witness_team_executors.js ' + OOTB, 'final/team_executors.log', '§WX_VERDICT PASS judged=(\\d+) fails=(\\d+) mutants_killed=(\\d+)/(\\d+)', 3);
add('wx_mut_total', '5', 'W-UPS-E2-HOST mutants total', 'W-UPS-E2-HOST', 'node erp/tests/witness_team_executors.js ' + OOTB, 'final/team_executors.log', '§WX_VERDICT PASS judged=(\\d+) fails=(\\d+) mutants_killed=(\\d+)/(\\d+)', 4);
add('wx_station_offered_none', '5', 'after the executor map, the station is offered NO Document Action on the order (flag)', 'W-UPS-E2-HOST X2', 'node erp/tests/witness_team_executors.js ' + OOTB, 'final/team_executors.log', 'X2 after its Visit, the station \\(B\\) is offered NO Document Action', 0, { kind: 'flag' });
add('bus_judged', '5', 'W-BUS (one event bus) arms judged', 'W-BUS', 'node erp/tests/witness_event_bus.js ' + OOTB, 'final/event_bus.log', '§BUS-RESULT verdict=PASS judged=(\\d+) failed=(\\d+)', 1);
add('grant_judged', '5', 'W-PLUGIN-GRANT arms judged (least privilege)', 'W-PLUGIN-GRANT', 'node erp/tests/witness_plugin_grant.js ' + OOTB, 'final/plugin_grant.log', '§GRANT-RESULT verdict=PASS judged=(\\d+) failed=(\\d+)', 1);
add('ipay_judged', '5', 'W-IMPORT-PAYMENT arms judged', 'W-IMPORT-PAYMENT', 'node erp/tests/witness_import_payment.js ' + OOTB, 'final/import_payment.log', '§IPAY-RESULT verdict=PASS judged=(\\d+) failed=(\\d+)', 1);

// ---- Chapter 2: W-MF-SEED (final log) ----
const MF = 'node erp/tests/witness_mf_seed.js 2>&1 | tee mf_seed.log ' + OOTB;
add('mf_inv_total', '2', 'grand total of the first borrower\'s instalment invoice (payment term 108, two schedule rows)', 'W-MF-SEED S1', MF, 'final/mf_seed.log', '\\[\\{"no":"MFL-1-\\d+","gt":(\\d+),"due":\\[(\\d+),(\\d+)\\]\\}', 1);
add('mf_inst_1', '2', 'first instalment (due row) of that invoice', 'W-MF-SEED S1', MF, 'final/mf_seed.log', '\\[\\{"no":"MFL-1-\\d+","gt":(\\d+),"due":\\[(\\d+),(\\d+)\\]\\}', 2);
add('mf_slip1_amt', '2', 'the first slip amount paid and confirmed on the phone', 'W-MF-SEED V1', MF, 'final/mf_seed.log', 'V1 ONE I_Payment row in legacy\'s processor-response columns:.*?"payamt":(\\d+)', 1);
add('mf_open_after_slip1', '2,4', 'the open balance on the first borrower\'s phone after the import = the second instalment, derived, never copied', 'W-MF-SEED B1', MF, 'final/mf_seed.log', 'B1 the next Visit shows the new balance on each phone, DERIVED[^\\n]*borrower 1 open (\\d+)\\.\\d+ = the second instalment (\\d+), borrower 2 open (\\d+)\\.\\d+', 1);
add('mf_open_b2', '4', 'the second borrower\'s open balance after its slips', 'W-MF-SEED B1', MF, 'final/mf_seed.log', 'B1 the next Visit shows the new balance on each phone, DERIVED[^\\n]*borrower 1 open (\\d+)\\.\\d+ = the second instalment (\\d+), borrower 2 open (\\d+)\\.\\d+', 3);
add('mfs_judged', '5', 'W-MF-SEED arms judged', 'W-MF-SEED', MF, 'final/mf_seed.log', '§MFS_VERDICT PASS judged=(\\d+) fails=(\\d+) inconclusive=none mutants_killed=(\\d+)/(\\d+)', 1);
add('mfs_mut_killed', '5', 'W-MF-SEED mutants killed', 'W-MF-SEED', MF, 'final/mf_seed.log', '§MFS_VERDICT PASS judged=(\\d+) fails=(\\d+) inconclusive=none mutants_killed=(\\d+)/(\\d+)', 3);
add('mfs_mut_total', '5', 'W-MF-SEED mutants total', 'W-MF-SEED', MF, 'final/mf_seed.log', '§MFS_VERDICT PASS judged=(\\d+) fails=(\\d+) inconclusive=none mutants_killed=(\\d+)/(\\d+)', 4);
add('hq_mut_killed', '5', 'W-HQ-CLERK (office) mutants killed', 'W-HQ-CLERK', 'node erp/tests/witness_hq_clerk.js ' + OOTB, 'final/hq_office.log', '§HQ_VERDICT PASS judged=(\\d+) fails=(\\d+) mutants_killed=(\\d+)/(\\d+)', 3);
add('hq_mut_total', '5', 'W-HQ-CLERK (office) mutants total', 'W-HQ-CLERK', 'node erp/tests/witness_hq_clerk.js ' + OOTB, 'final/hq_office.log', '§HQ_VERDICT PASS judged=(\\d+) fails=(\\d+) mutants_killed=(\\d+)/(\\d+)', 4);
const flag = (id, ch, meaning, wit, cmd, log, re) => add(id, ch, meaning, wit, cmd, log, re, 1, { kind: 'flag' });
flag('mf_v1_approved', '2', 'V1: approved slip, "Payment received" on the phone BEFORE any Visit', 'W-MF-SEED V1', MF, 'final/mf_seed.log', '🟢 V1 "Payment received" is on the phone BEFORE any Visit');
flag('mf_v2_unreached', '2', 'V2: unreached -> row written anyway, names the service, ToDo; online -> re-check -> approved, ToDo gone', 'W-MF-SEED V2', MF, 'final/mf_seed.log', '🟢 V2 back online the phone re-checks BY ITSELF');
flag('mf_v3_refused', '2', 'V3: refused slip shows the service\'s own message, nothing paid', 'W-MF-SEED V3', MF, 'final/mf_seed.log', '🟢 V3 refused: the service\'s own message is shown');
flag('mf_v4_swap', '2,5', 'V4: a second provider swapped in with zero code change outside the adapter', 'W-MF-SEED V4', MF, 'final/mf_seed.log', '🟢 V4 a second provider is swapped in with ZERO code change');
flag('mf_dup_refused', '2', 'D1: the same bank reference / the same QR is refused on the phone', 'W-MF-SEED D1', MF, 'final/mf_seed.log', '🟢 D1 a DIFFERENT QR text answering the SAME bank reference is refused');
flag('mf_borrower_balance', '4', 'B1: the next Visit shows the derived open balance on each phone', 'W-MF-SEED B1', MF, 'final/mf_seed.log', '🟢 B1 the next Visit shows the new balance on each phone, DERIVED');
flag('rec_renew', '2', 'R: a renewed certificate = a new invoice raised by Recurring Run from the menu', 'W-MF-SEED R', MF, 'final/mf_seed.log', '🟢 R a renewed certificate = a NEW invoice raised by legacy Recurring Run');
flag('acct_eod_posted', '3', 'P: the Tenant Accounting Processor (from the menu) posts the QUEUED receipts, Fact_Acct balanced', 'W-MF-SEED P', MF, 'final/mf_seed.log', '🟢 P end of day the Tenant Accounting Processor');
flag('plugin_role', '5b', 'W-PLUGIN-ROLE: every role reads the plugins list; only the System Administrator may install/start/stop/remove', 'W-PLUGIN-ROLE', 'node erp/tests/witness_plugin_role.js ' + OOTB, 'final/plugin_role.log', '§PLR_VERDICT PASS judged=(\\d+) fails=0 mutants_killed=(\\d+)/(\\d+)');
flag('poss_live_page', '3', 'W-POS-SALES-LIVE: the System Administrator starts the bundle; the import runs from the real menu in the page', 'W-POS-SALES-LIVE', 'node erp/tests/witness_pos_sales_live.js ' + OOTB, 'final/pos_sales_live.log', '§POSL_VERDICT PASS judged=(\\d+) fails=0 mutants_killed=(\\d+)/(\\d+)');
add('foff_judged', '1', 'W-FILM-OFFLINE arms judged (the till offline: 3 tickets kept locally, head office knows nothing, one Visit sends exactly those 3)', 'W-FILM-OFFLINE', 'node erp/tests/witness_film_offline.js ' + OOTB, 'final/film_offline.log', '§FOFF_VERDICT PASS judged=(\\d+) fails=0 mutants_killed=(\\d+)/(\\d+)', 1);
add('foff_tickets', '1', 'ticket lines the offline till committed locally and later sent in one Visit', 'W-FILM-OFFLINE FOFF4', 'node erp/tests/witness_film_offline.js ' + OOTB, 'final/film_offline.log', 'FOFF4 BACK ONLINE:[^\\n]*logs "sent=(\\d+)"', 1);
add('hqp_till_ops', '4', 'W-HQ-CLERK with HQ_PLAN=pos: ops the till received (only the movement lines)', 'W-HQ-CLERK pos', 'HQ_PLAN=pos node erp/tests/witness_hq_clerk.js ' + OOTB, 'final/hq_pos.log', 'till_received_ops=(\\d+)', 1);
add('pp_judged', '5', 'W-POS-PLAN node (bim-compiler team_plan): arms judged incl. catch-up', 'W-POS-PLAN node', 'node scripts/witness_pos_plan.js [bim-ootb dir] ' + BC, 'final/bc_pos_plan.log', '§PP_VERDICT PASS judged=(\\d+) fails=0 mutants_killed=(\\d+)/(\\d+)', 1);
add('pp_mut_killed', '5', 'W-POS-PLAN node mutants killed', 'W-POS-PLAN node', 'node scripts/witness_pos_plan.js [bim-ootb dir] ' + BC, 'final/bc_pos_plan.log', '§PP_VERDICT PASS judged=(\\d+) fails=0 mutants_killed=(\\d+)/(\\d+)', 2);
add('pp_mut_total', '5', 'W-POS-PLAN node mutants total', 'W-POS-PLAN node', 'node scripts/witness_pos_plan.js [bim-ootb dir] ' + BC, 'final/bc_pos_plan.log', '§PP_VERDICT PASS judged=(\\d+) fails=0 mutants_killed=(\\d+)/(\\d+)', 3);
add('exe_judged', '5', 'W-UPS-E3 executors judged by the map in force at the act (L2: refused stays refused after the map is retired)', 'W-UPS-E3', 'node scripts/witness_comm_executors.js ' + BC, 'lane/comm_executors.log', '§EXE_VERDICT PASS judged=(\\d+) fails=0', 1);
add('tipr_judged', '5', 'W-TIP-READERS (one reader for what this device holds) arms judged', 'W-TIPR', 'node erp/tests/witness_tip_readers.js ' + OOTB, 'final/tip_readers.log', '§TIPR-VERDICT PASS judged=(\\d+) fails=0', 1);
add('tipr_mut_killed', '5', 'W-TIP-READERS mutants killed', 'W-TIPR', 'node erp/tests/witness_tip_readers.js ' + OOTB, 'final/tip_readers.log', '§TIPR-MUTANTS killed=(\\d+) of (\\d+)', 1);
add('pr_added', '5', 'lines the merged wave added (bim-ootb PR 2431, squash 0e0cd312)', 'git', "git -C ~/bim-ootb diff --shortstat 0e0cd312^ 0e0cd312", null, '(\\d+) insertions\\(\\+\\), (\\d+) deletions', 1, { kind: 'cmd' });
add('pr_deleted', '5', 'lines the merged wave deleted (the "delete as much as you add" budget is NOT met; said plainly)', 'git', "git -C ~/bim-ootb diff --shortstat 0e0cd312^ 0e0cd312", null, '(\\d+) insertions\\(\\+\\), (\\d+) deletions', 2, { kind: 'cmd' });

add('ret_order_total', '4c', 'W-POS-RETURN: the negative order line completes as a negative invoice total', 'W-POS-RETURN', 'node erp/tests/witness_pos_return.js ' + OOTB, 'final/pos_return.log', '§RET-FACT ticket=RET/RETURN order_total=(-?\\d+)', 1);
add('ret_onhand', '4c', 'W-POS-RETURN: stock goes UP by this much when the return completes', 'W-POS-RETURN', 'node erp/tests/witness_pos_return.js ' + OOTB, 'final/pos_return.log', '§RET-FACT ticket=RET/RETURN [^\\n]*onhand_delta=\\{\"123@990000\":(-?\\d+)\\}', 1);
add('ret_judged', '4c', 'W-POS-RETURN arms judged', 'W-POS-RETURN', 'node erp/tests/witness_pos_return.js ' + OOTB, 'final/pos_return.log', '§RET-RESULT verdict=PASS judged=(\\d+) failed=0', 1);

// ---- CUT (unresolved from the final logs: the film does not use them; they go on the limits card) ----
const cutf = (id, ch, meaning, why) => F.push({ id, chapter: ch, meaning, witness: '-', status: 'cut', reason: why, command: null, log: null, regex: null });
cutf('mf_till_tender_up', '1', 'the till\'s I_Payment tender rows travel up the pipe in a browser run', 'no final log shows I_Payment leaving a till through the relay (W-POS-PLAN carries i_order up; the borrowers\' slips travel in W-MF-SEED). Limits card: tender rows from the till are written locally but only order lines are shown travelling.');
cutf('l1_catchup_hint', '5', 'catch-up on bind is shown as its own arm in the film', 'covered by pp_judged (the node witness includes the catch-up arms); no separate line is spoken');

const out = { _scope: 'Film 6 facts list. No value is typed: each fact names the witness, the command that produces the log, the log file and the regex that extracts it. facts6_resolve.js resolves them. status: now = resolved from a final log (lead/final, lead/lane); cut = unresolved from the final logs, not used by the film and named on the limits card.',
  logdir_default: '/tmp/claude-1000/-home-red1-bim-compiler/ef8ba76c-3b22-4dae-94ac-babe90436a0e/scratchpad/lead (the lead\'s FINAL suite: final/*.log, lane/*.log; copied under film6/logs/evidence/final and lane at recording)',
  regex_flags: 'm (multiline); group = capture group number; every regex searches the whole log, first match', facts: F };
fs.writeFileSync(__dirname + '/facts6.spec.json', JSON.stringify(out, null, 1));
console.log('facts6.spec.json written: ' + F.length + ' facts, now=' + F.filter(f => f.status === 'now').length + ' provisional=' + F.filter(f => f.status === 'now-provisional').length + ' pending=' + F.filter(f => f.status === 'pending').length);
