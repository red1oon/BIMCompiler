// ⚠ DO NOT REMOVE — Scope: the chapter / limits / why / offer cards of Film 6 "No Server to Keep Alive — and the Books Still Close" (TEAMWORK_FRAMEWORK §42.1-§42.3), in the Civil Works chapter-card palette (palette.json, copied from film5).
// NO NUMBER IS TYPED HERE: every figure is V('<fact id>') from facts6_resolve.js output (facts6.resolved.json); a pending fact renders as a visible amber "[pending <owner>]" and is counted by the layout check (§CARD_PENDING). Quotes are Q('<claim id>') from claims6.json (<= 25 words, source printed under them).
// Read logs/cards6_check.log after every run. Cards are 1920x930 (the picture area; subtitles sit in the band below).
'use strict';
const fs = require('fs'), path = require('path');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nf = v => (/^-?\d+$/.test(v) ? Number(v).toLocaleString('en-US') : v);
const CSS = `
:root{--bg:#080A0E;--panel:#1A1A19;--line:#6B6A63;--ink:#FFFFFF;--ink2:#C3C2B7;--cy:#4FC3F7;--ye:#FFEB3B;--gd:#0CA30C;--am:#FAB219;--or:#FF8C1A}
*{box-sizing:border-box;margin:0}
html,body{width:1920px;height:930px;overflow:hidden;background:var(--bg);color:var(--ink);font-family:'Noto Sans','DejaVu Sans',sans-serif}
.pg{position:absolute;left:0;top:0;width:1920px;height:930px;background-color:var(--bg);background-image:linear-gradient(rgba(26,26,25,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,25,.9) 1px,transparent 1px);background-size:80px 80px}
.tag{position:absolute;left:96px;top:34px;font:700 22px/1 'Noto Sans';letter-spacing:4px;color:var(--ink2);white-space:nowrap}
.ser{position:absolute;right:96px;top:34px;font:700 22px/1 'Noto Sans';letter-spacing:4px;color:var(--ink2);white-space:nowrap}
.col{position:absolute;left:96px;top:84px;width:1728px;height:728px;display:flex;flex-direction:column;gap:26px;overflow:hidden}
.cardblk{width:1728px;padding-left:36px;border-left:8px solid var(--cy);flex:none}
.cardblk.free{position:absolute;left:96px;top:250px}.cardblk.free .t{font-size:84px}
.cardblk .k{font:400 36px/1.2 'Noto Sans';color:var(--ink2);letter-spacing:2px}
.cardblk .t{font:700 60px/1.12 'Noto Sans';color:var(--ink);margin-top:10px}
.cardblk .s{font:400 32px/1.3 'Noto Sans';color:var(--ye);margin-top:14px;width:1600px}
.grid{width:1728px;display:grid;gap:22px;flex:none}
.grid.c2{grid-template-columns:1fr 1fr}.grid.c3{grid-template-columns:1fr 1fr 1fr}.grid.c1{grid-template-columns:1fr}
.bx{background:var(--panel);border:2px solid var(--line);border-radius:14px;padding:16px 22px;min-width:0}
.bx.cy{border-color:var(--cy)}.bx.gd{border-color:var(--gd)}.bx.am{border-color:var(--am)}.bx.or{border-color:var(--or)}
.bx h3{font:700 30px/1.2 'Noto Sans';color:var(--ink)}
.bx .q{font:400 25px/1.35 'Noto Sans';color:var(--ink);margin-top:8px}
.bx .sb{font:400 22px/1.35 'Noto Sans';color:var(--ink2);margin-top:8px}
.bx .big{font:800 56px/1.1 'Noto Sans';color:var(--ink);margin-top:6px}
.bx .big.cy{color:var(--cy)}.bx .big.or{color:var(--or)}.bx .big.ye{color:var(--ye)}
.bx .mono{font:400 20px/1.35 'DejaVu Sans Mono',monospace;color:var(--ink2);margin-top:8px}
.chip{display:inline-block;font:800 20px/1 'Noto Sans';letter-spacing:1px;padding:7px 12px;border-radius:8px;color:#080A0E;background:var(--cy);white-space:nowrap}
.chip.gd{background:var(--gd)}.chip.am{background:var(--am)}.chip.or{background:var(--or)}
.pend{color:var(--am);font-weight:800}
.take{position:absolute;left:132px;top:820px;width:1692px;font:400 34px/1.3 'Noto Sans';color:var(--cy)}
.src{position:absolute;left:96px;top:868px;width:1728px;font:400 19px/1.3 'DejaVu Sans Mono',monospace;color:var(--ink2);white-space:nowrap;overflow:hidden}
table.tb{border-collapse:collapse;width:100%}
table.tb td,table.tb th{font:400 23px/1.25 'Noto Sans';padding:7px 12px;border-bottom:1px solid var(--line);text-align:left;color:var(--ink);vertical-align:top}
table.tb th{font:700 20px/1.3 'Noto Sans';color:var(--ink2);letter-spacing:1px}
.final{position:absolute;left:0;top:0;width:1920px;height:930px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.final .qq{font:700 78px/1.2 'Noto Sans';color:var(--ink);width:1500px}
.final .em{font:400 54px/1.2 'Noto Sans';color:var(--cy);margin-top:70px}
.why{position:absolute;left:96px;top:84px;width:1728px}
.why .w{font:700 52px/1.15 'Noto Sans';color:var(--ink);padding-left:28px;border-left:8px solid var(--cy);margin-bottom:26px}
.why .w small{display:block;font:400 25px/1.3 'Noto Sans';color:var(--ink2);margin-top:4px}
.why .mit{font:700 40px/1.2 'Noto Sans';color:var(--ye);margin-left:36px}
`;
function build(X, CL) {
  const V = id => { const f = X[id]; if (!f) throw new Error('§CARD_FAIL unknown fact ' + id); if (f.status !== 'now') return `<span class="pend">[pending ${esc(f.owner || '?')}]</span>`; return esc(nf(f.value)); };
  const claim = Object.fromEntries(CL.claims.map(c => [c.id, c]));
  const Q = id => { const c = claim[id]; if (!c) throw new Error('§CARD_FAIL unknown claim ' + id); if (c.status.startsWith('UNCONFIRMED')) throw new Error('§CARD_FAIL claim is UNCONFIRMED, cannot go on a card: ' + id); return `<div class="q">“${esc(c.quote)}”</div><div class="sb">${esc(c.source)} · ${esc(c.url.replace(/^https?:\/\//, ''))}</div>`; };
  const page = (n, kick, title, sub, body, take, src) => `<div class="pg"><div class="tag">CHAPTER ${esc(n)} · ${esc(kick)}</div><div class="ser">NO SERVER TO KEEP ALIVE · SAMPLE DATA</div><div class="col"><div class="cardblk"><div class="k">Chapter ${esc(n)}</div><div class="t">${esc(title)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}</div>${body || ''}</div>${take ? `<div class="take">${esc(take)}</div>` : ''}${src ? `<div class="src">source: ${esc(src)}</div>` : ''}</div>`;
  const bx = (cls, inner) => `<div class="bx ${cls || ''}">${inner}</div>`;
  const C = {};
  C.title = `<div class="pg"><div class="tag">SAMPLE DATA · ONE SAMPLE DAY</div><div class="ser">TEAMWORK FRAMEWORK §42</div><div class="cardblk free"><div class="k">ERP · LOCAL FIRST</div><div class="t" style="font-size:84px">No Server to Keep Alive — and the Books Still Close</div><div class="s">standard ERP imports, local first: Unicenta POS and Micro Finance</div></div></div>`;
  C.ch0 = page('0', 'WHERE IS THE SERVER?', 'Where is the server?', 'The same worry applies to SQLite. Engineers call the answer local-first.',
    `<div class="grid c2">${bx('cy', '<h3>SQLite</h3>' + Q('sqlite-serverless'))}${bx('cy', '<h3>Local-first software</h3>' + Q('lf-secondary'))}</div>`, 'Servers hold secondary copies; the desk holds the database.', 'claims6.json: sqlite-serverless, lf-secondary');
  C.ch0b = page('0', 'THE IMPORT TABLE', 'The import table is the audit trail', `The shipped dictionary has ${'@@dict_i_tables@@'} import tables and ${'@@dict_import_procs@@'} processes built on an Import class.`,
    `<div class="grid c2">${bx('cy', '<h3>iDempiere wiki</h3>' + Q('idem-imp-a'))}${bx('cy', '<h3>Oracle Retail Sales Audit</h3>' + Q('resa-load'))}${bx('cy', '<h3>Dynamics 365 Commerce</h3>' + Q('d365-valid'))}${bx('cy', '<h3>ERPNext POS</h3>' + Q('erpnext-subledger'))}</div>`, 'Outside data lands in an import table first; a role imports it.', 'claims6.json: idem-imp-a, resa-load, d365-valid, erpnext-subledger; facts: dict_i_tables, dict_import_procs');
  C.ch1 = page('1', 'THE TILL SELLS', 'The till sells, online or not', 'Each ticket is written on the till as import rows. Nothing is posted.',
    `<div class="grid c3">${bx('or', `<h3>Till: OFFLINE</h3><div class="big or">${V('poss_decl_lines')}</div><div class="sb">I_Order lines declared</div>`)}${bx('or', `<h3>Till: OFFLINE</h3><div class="big or">${V('poss_decl_tenders')}</div><div class="sb">I_Payment tenders declared, no order or payment yet</div>`)}${bx('cy', `<h3>Sample ticket</h3><div class="big cy">${V('poss_k1_total')}</div><div class="sb">= ${V('poss_k1_tender_a')} + ${V('poss_k1_tender_b')} in tenders</div>`)}</div>`, 'Cut off, the till kept @@foff_tickets@@ tickets; one visit later sent exactly those. Real time was never needed.', 'W-POS-SALES VIEW/deposit, VIEW/totals (pos_sales.log)');
  C.ch2 = page('2', 'THE BORROWER', 'The borrower pays from a phone', 'Checked in W-MF-SEED on the GardenWorld seed: two real customers, two phones.',
    `<div class="grid c3">${bx('gd', '<h3>Phone: ONLINE</h3><div class="sb">Slip checked by the verifier; the phone shows “payment received” before any Visit.</div><div style="margin-top:12px"><span class="chip gd">CHECKED</span></div>')}${bx('or', '<h3>Phone: OFFLINE</h3><div class="sb">The row is written anyway. The phone names the service that has not acknowledged, keeps a to-do, and re-checks by itself when online.</div><div style="margin-top:12px"><span class="chip gd">CHECKED</span></div>')}${bx('cy', `<h3>Invoice and slip</h3><div class="q">${V('mf_inv_total')} · slip ${V('mf_slip1_amt')}</div><div class="sb">open balance ${V('mf_open_after_slip1')}, derived, never copied</div>`)}</div>`, 'The verifier is an adapter row; SlipOK is the sample. A refused slip is never shown as paid.', 'W-MF-SEED V1, V2, V3, V4, S1, B1 (mf_seed.log)');
  C.ch3 = page('3', 'HEAD OFFICE', 'Head office works when head office works', 'Every step is a legacy window and process the auditor already knows.',
    `<div class="grid c2">${bx('gd', `<h3>The menu follows the dictionary</h3><div class="big">${V('hq_menu_x')} of ${V('hq_menu_n')}</div><div class="sb">menu entries match, role by role</div>`)}${bx('or', `<h3>A ticket that does not add up stays whole</h3><div class="q">tenders ${V('poss_mis_tenders_total')} · invoice ${V('poss_mis_lines_total')} · documents made ${V('poss_mis_docs')}</div><div class="sb">every row keeps its reason (I_ErrorMsg)</div>`)}${bx('cy', `<h3>Replenish Report → one movement</h3><div class="q">quantities ${V('hq_qty_123')} / ${V('hq_qty_130')} / ${V('hq_qty_134')} · movement lines ${V('hq_mv_lines')}</div>`)}${bx('gd', `<h3>The books balance</h3><div class="q">ledger facts added ${V('poss_fact_added')} = ${V('poss_fact_own')}</div><div class="sb">batch result vs the ticket's own documents</div>`)}</div>`, 'Run it twice: the second run imported ' + '@@poss_rerun_new@@' + ' tickets.', 'W-POS-SALES; W-HQ-CLERK H3, H9, H10 (hq_clerk.log)');
  C.ch4 = page('4', 'ONLY THE EVENTS TRAVEL', 'The day comes back to every desk', 'Up go the order lines; down comes the movement. Nothing else.',
    `<div class="grid c3">${bx('or', `<h3>Till, office setup</h3><div class="big or">${V('ppb_before_ops')} ops</div><div class="sb">${V('ppb_before_bytes')} bytes</div>`)}${bx('cy', `<h3>Till, point-of-sale plan</h3><div class="big cy">${V('ppb_after_ops')} op</div><div class="sb">${V('ppb_after_bytes')} bytes: the replenishment line</div>`)}${bx('gd', `<h3>Borrower 2</h3><div class="big">${V('ppb_b2_in')} of ${V('ppb_b2_delivered')}</div><div class="sb">took in; ${V('ppb_b2_foreign')} of borrower 1's</div>`)}${bx('am', '<h3>On the limits card</h3><div class="sb">The relay still delivers; each device refuses locally. Hiding bytes at the relay needs sealed audiences.</div>')}${bx('cy', `<h3>A stale save gets legacy's own message</h3><div class="q">“${V('so_conflict_msg')}”</div>`)}</div>`, '', 'W-POS-PLAN browser (E_ppb.log); W-TEAM-SO (team_so.log)');
  C.ch4c = page('4c', 'NO REALTIME CHECK', 'Returns and loyalty, no realtime check', 'Loyalty credit lives on the buyer\'s phone, so different tills share no balance to race over.',
    `<div class="grid c3">${bx('gd', `<h3>Earn · redeem · second scan</h3><div class="big">${V('tc_earn')} · ${V('tc_redeem')} · ${V('tc_second')}</div><div class="sb">the second scan does nothing</div>`)}${bx('or', `<h3>Phone restored to an older state</h3><div class="big or">${V('tc_overspend')}</div><div class="sb">flagged at settlement: caught at the day's close, not prevented</div>`)}${bx('gd', `<h3>Return = a negative order line</h3><div class="big">${V('ret_order_total')}</div><div class="sb">Import Orders takes it; completing it puts the goods back (stock +${V('ret_onhand')}) and the invoice is negative. Original-ticket link, cash-count and reversal rules are specified, not built.</div>`)}</div>`, 'What could go wrong is small, bounded by policy, and caught at the day\'s close.', 'W-TREAT-CODE (scriptor_treat.log); W-POS-RETURN (pos_return.log); TEAMWORK_FRAMEWORK §39 R5, §42.2');
  const PR = (name, built, wit, st) => `<tr><td>${esc(name)}</td><td>${built}</td><td>${wit}</td></tr>`;
  C.ch5 = page('5', 'GOOD PRACTICE', 'Built the way good software is built', '', `<div style="width:1728px;flex:none"><table class="tb"><tr><th>PRINCIPLE</th><th>WHAT WE BUILT</th><th>CHECKED BY</th></tr>` +
    PR('Separation of concerns', `till ${V('ppb_before_ops')} → ${V('ppb_after_ops')} ops`, 'W-POS-PLAN') +
    PR('One implementation per job', `executor ${V('wx_judged')} checks · event bus ${V('bus_judged')}`, 'W-UPS-E2-HOST · W-BUS') +
    PR('Open for extension, closed for change', 'sales import is a plugin; base hash identical', 'W-POS-SALES') +
    PR('Least privilege', `${V('grant_judged')} checks`, 'W-PLUGIN-GRANT') +
    PR('Idempotency', `second run imported ${V('poss_rerun_new')}`, 'W-POS-SALES RERUN') +
    PR('Test the tests', `broken copies caught ${V('mfs_mut_killed')}/${V('mfs_mut_total')} · ${V('hq_mut_killed')}/${V('hq_mut_total')} · ${V('ppb_mut_killed')}/${V('ppb_mut_total')}`, 'W-MF-SEED · W-HQ-CLERK · W-POS-PLAN') +
    PR('Program to an interface', 'a second verifier adapter swapped in, zero code change outside it', 'W-MF-SEED V4') +
    PR('Same answer on every device', `executors judged at the act ${V('exe_judged')} checks · catch-up on bind ${V('pp_judged')}`, 'W-UPS-E3 · W-POS-PLAN') +
    PR('One reader for what a device holds', `${V('tipr_judged')} checks, ${V('tipr_mut_killed')} broken copies caught`, 'W-TIPR') +
    PR('Delete as much as you add', `<span class="chip am">NOT MET</span> ${V('pr_added')} added · ${V('pr_deleted')} deleted`, 'merged diff, PR 2431') + `</table></div>`, '', 'TEAMWORK_FRAMEWORK §42.3 (a principle without a check is not claimed); facts6.spec.json');
  C.limits = page('L', 'LIMITS', 'Limits, said plainly', 'Named from the final check logs on the day of recording.',
    `<div class="grid c2">${bx('am', '<h3>Not built</h3><div class="sb">Standalone till app: tickets enter through the import window. Tender rows are written on the till, but only order lines are shown travelling up the pipe. Hiding bytes at the relay needs sealed audiences.</div>')}${bx('am', '<h3>Specified, not built</h3><div class="sb">Return link to the original ticket (G-11), return cash-count and reversal rules (G-13), once-only code and per-station cap (G-14).</div>')}${bx('am', `<h3>Honest numbers</h3><div class="sb">This wave added ${V('pr_added')} lines and deleted ${V('pr_deleted')}: the delete-as-much-as-you-add budget is not met. Legacy Import Payment has no duplicate guard of its own.</div>`)}${bx('am', '<h3>Method</h3><div class="sb">Legacy behaviour is read from source, not a side-by-side run: the legacy database was down when this was recorded.</div>')}</div>`, '', 'TEAMWORK_FRAMEWORK §41.1, §42.2; facts pr_added, pr_deleted (git diff --shortstat)');
  C.earlier = `<div class="pg"><div class="tag">BACKGROUND</div><div class="ser">NO SERVER TO KEEP ALIVE</div><div class="cardblk free"><div class="k">Earlier films, not repeated here</div><div class="s" style="color:var(--ink)">No server in the sale path<br>Keeping the bloat off the pipe<br>Trust and the thin pipe<br>The server is dead</div></div></div>`;
  C.why = `<div class="pg"><div class="tag">WHY WE DO IT THIS WAY</div><div class="ser">NO SERVER TO KEEP ALIVE</div><div class="why"><div class="w">Backward compatibility<small>the import tables and processes your people already know; a twin that differs from legacy in nothing</small></div><div class="w">Sustainability<small>no server to keep alive; a rule is a row; deletions are counted</small></div><div class="w">Interoperability<small>the same import tables any file loader, bank file or till writes to; one standard verifier interface</small></div><div class="w">Sovereignty<small>your data on your own devices</small><span class="mit">MIT licensed</span></div></div></div>`;
  C.offer = `<div class="pg"><div class="final"><div class="qq">Can you think of a scenario where this system will fail?</div><div class="em">red1org@gmail.com</div></div></div>`;
  // fact placeholders that must live inside static strings
  Object.keys(C).forEach(k => { C[k] = C[k].replace(/@@([a-z0-9_]+)@@/g, (m, id) => V(id)); });
  return { C, CSS, ORDER: ['title', 'ch0', 'earlier', 'ch0b', 'ch1', 'ch2', 'ch3', 'ch4', 'ch4c', 'ch5', 'limits', 'why', 'offer'] };
}
module.exports = { build, CSS };
