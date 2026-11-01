// ⚠ DO NOT REMOVE — Scope: the cards of "Network ERP without an Apps and Database server!" (TEAMWORK_FRAMEWORK.md §45.15). NO NUMBER IS TYPED: every
// figure is V('<fact id>') from facts.resolved.json; the only digit allowed in typed text is the network name "4G" (guard.js enforces both). Style = the
// terms films' CSS (../film_terms/cards_v3.js, read-only). READ THE LOG: out/guard.log.
'use strict';
const { CSS } = require('../film_terms/cards_v3.js');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CSSN = CSS + `.ttl{font:800 92px/1.1 'Noto Sans';text-align:center;margin-top:210px}.sub{font:400 40px/1.3 'Noto Sans';color:var(--ink2);text-align:center;margin-top:28px}
.node{display:inline-block;border:3px solid var(--line);border-radius:16px;padding:22px 30px;font:700 32px/1.25 'Noto Sans';text-align:center;vertical-align:middle}
.flow{display:flex;align-items:center;gap:26px;margin-top:40px}.ar{font:700 48px/1 'Noto Sans';color:var(--ink2)}.vs{display:flex;gap:40px;margin-top:30px}
.num{font:800 76px/1.05 'Noto Sans'}.lbl{font:400 28px/1.3 'Noto Sans';color:var(--ink2);margin-top:8px}`;
module.exports = { CSS: CSSN, build(F) {
  const V = (id, fmt) => { if (!(id in F)) throw new Error('fact not resolved: ' + id); const v = F[id]; return esc(fmt === ',' ? Number(String(v).replace(/,/g, '')).toLocaleString('en-US') : v); };
  const Sx = (k, h, st) => `<div data-s="${k}" style="${st || ''}">${h}</div>`;
  const page = (inner, src) => `<div class="pg"><div class="tag">NETWORK ERP WITHOUT AN APPS AND DATABASE SERVER</div>${inner}${src ? `<div class="src">${esc(src)}</div>` : ''}</div>`;
  const hd = (k, t, s, c) => `<div class="hd ${c || ''}"><div class="k">${k}</div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  const bx = (cls, w, inner, st) => `<div class="bx ${cls}" style="width:${w}px;${st || ''}">${inner}</div>`;
  const C = {};
  C.title = { n: 1, html: page(Sx(1, `<div class="ttl">Network ERP without an<br>Apps and Database server!</div><div class="sub">SQLite in the browser · a post office in between</div>`)) };
  C.usual = { n: 3, html: page(hd('THE USUAL PICTURE', 'Two servers in the middle of every click', '') +
    `<div class="flow">` + Sx(1, `<div class="node">people at their<br>screens</div>`, 'display:flex;align-items:center;gap:26px') +
    Sx(2, `<span class="ar">⇄</span><div class="node" style="border-color:var(--or)">APPLICATION<br>server</div><span class="ar">⇄</span><div class="node" style="border-color:var(--or)">DATABASE<br>server</div>`, 'display:flex;align-items:center;gap:26px') + `</div>` +
    Sx(3, bx('or', 1728, `<div class="q">Every click goes there and back, and both servers run all day.</div>`, 'margin-top:60px')), 'the classic architecture') };
  C.other = { n: 3, html: page(hd('THE OTHER PICTURE', 'Every device runs the whole ERP itself', '') +
    Sx(1, `<div class="flow"><div class="node" style="border-color:var(--cy)">device<br><span style="font-weight:400;font-size:24px">whole ERP · SQLite (WebAssembly)<br>its own signed log</span></div><div class="node" style="border-color:var(--cy)">device<br><span style="font-weight:400;font-size:24px">whole ERP · SQLite (WebAssembly)<br>its own signed log</span></div><div class="node" style="border-color:var(--cy)">device<br><span style="font-weight:400;font-size:24px">whole ERP · SQLite (WebAssembly)<br>its own signed log</span></div></div>`) +
    Sx(2, bx('cy', 1728, `<div class="q">Between them, a post office that only carries what changed: ids, quantities, amounts.</div>`, 'margin-top:40px')) +
    Sx(3, bx('gd', 1728, `<div class="q">No server in the path.</div>`, 'margin-top:20px')), 'local first · minimal relay') };
  C.test = { n: 3, html: page(hd('THE TEST', 'The hard way', '') +
    Sx(1, `<div style="margin-top:40px"><span class="num cy">${V('users_max')}</span> <span class="lbl">users, each its own device, the real sync engine</span></div>`) +
    Sx(2, `<div class="flow"><div class="node">office LAN</div><div class="node">broadband</div><div class="node">4G</div><div class="node" style="border-color:var(--or)">a poor line,<br>dropping requests</div></div><div class="lbl">simulated links (stated assumptions)</div>`) +
    Sx(3, bx('am', 1728, `<div class="q">Everyone syncs inside the same ${V('burst_s')} seconds: closing time.</div>`, 'margin-top:40px')), 'scale run logs') };
  C.lost = { n: 3, html: page(hd('NOTHING LOST — AFTER ONE FIX', 'The first run found a weak spot', '') + `<div class="vs">` +
    Sx(1, bx('or', 820, `<h3>First run</h3><div class="num or" style="margin-top:12px">${V('a1_before_lost')} of ${V('a1_devices')}</div><div class="lbl">devices on the worst lines could not get through: one dropped request restarted the whole sync</div>`)) +
    Sx(3, bx('gd', 820, `<h3>After the fix</h3><div class="num gdc" style="margin-top:12px">${V('a1_received')} / ${V('a1_reference')}</div><div class="lbl">records at head office · ${V('a1_retried')} dropped connections absorbed · lost: ${V('a1_lost')}</div>`)) + `</div>` +
    Sx(2, bx('cy', 1728, `<div class="q">The fix: retry the request, not the whole sync.</div>`, 'margin-top:30px')), 'scale run logs, before and after') };
  C.books = { n: 2, html: page(hd('SAME BOOKS', 'Compared with a run that had no network at all', '') +
    Sx(1, `<div style="margin-top:60px"><span class="num gdc">${V('a2_acc')}</span> <span class="lbl">records accepted at head office = the no-network run: ${V('a1_reference')}</span></div>`) +
    Sx(2, bx('cy', 1728, `<div class="q">The network changes when, never what.</div>`, 'margin-top:60px')), 'scale run logs') };
  C.feel = { n: 3, html: page(hd('HOW IT FEELS', 'Network time of a routine sync', 'it runs in the background: nobody waits for it') + `<div class="vs">` +
    Sx(1, bx('cy', 540, `<h3>broadband</h3><div class="num cy" style="margin-top:12px">${V('feel_bb')} s</div>`)) +
    Sx(2, bx('cy', 540, `<h3>4G</h3><div class="num cy" style="margin-top:12px">${V('feel_4g')} s</div>`)) +
    Sx(3, bx('am', 540, `<h3>a poor line</h3><div class="num amc" style="margin-top:12px">${V('feel_poor')} s</div>`)) + `</div>`, 'fit log') };
  C.maths = { n: 4, html: page(hd('THE MATHS', 'No thousand machines needed', '') +
    Sx(1, bx('cy', 1728, `<div class="q">Measured: ${V('fit_points')} users. A curve fitted to each number.</div>`, 'margin-top:30px')) +
    Sx(2, bx('gd', 1728, `<div class="q">Checked by predicting ${V('holdout_n')} users from the smaller runs: off by ${V('holdout_min')} to ${V('holdout_max')} percent.</div>`, 'margin-top:20px')) +
    Sx(3, bx('am', 1728, `<div class="q">${V('untrusted_n')} curves failed that check: not extrapolated.</div>`, 'margin-top:20px')) +
    Sx(4, bx('cy', 1728, `<div class="q">For example, a catch-up sync at ${V('extrap_n', ',')} users: about ${V('catchup_1000')} requests (±${V('catchup_err')} percent).</div>`, 'margin-top:20px')), 'fit log') };
  C.bends = { n: 2, html: page(hd('WHERE IT BENDS', 'The post office, not the ERP', "GitHub's own published limits") + `<div class="vs">` +
    Sx(1, bx('or', 820, `<h3>One shared GitHub account</h3><div class="num or" style="margin-top:12px">${V('cliff_shared')}–${V('cliff_shared_hi')}</div><div class="lbl">users, all syncing at closing time</div>`)) +
    Sx(2, bx('gd', 820, `<h3>One account per device</h3><div class="num gdc" style="margin-top:12px">≈ ${V('cliff_perdev')}</div><div class="lbl">users</div>`)) + `</div>`, 'fit log') };
  C.versus = { n: 3, html: page(hd('VS THE REST OF THE WORLD', 'The same documents on a classic server ERP and on this one', 'order → shipment → invoice → payment → two reversals') +
    Sx(1, bx('cy', 1728, `<div class="q">${V('o2c_steps')} documents · results identical: ${V('o2c_match')} of ${V('o2c_steps')}</div>`, 'margin-top:20px')) + `<div class="vs">` +
    Sx(2, bx('or', 820, `<h3>Classic server ERP, per document</h3><div class="num or" style="margin-top:10px">≥ ${V('legacy_step_ms_4g', ',')} ms</div><div class="lbl">on 4G · ≥ ${V('legacy_step_ms_poor', ',')} ms on a poor line</div>`)) +
    Sx(2, bx('gd', 820, `<h3>This ERP, per document</h3><div class="num gdc" style="margin-top:10px">${V('twin_step_ms')} ms</div><div class="lbl">no server in the way</div>`)) + `</div>` +
    Sx(3, bx('am', 1728, `<div class="q">Servers running all day: ${V('legacy_servers')} (${V('legacy_java_mb', ',')} MB + ${V('legacy_pg_mb')} MB of memory) vs none.</div>`, 'margin-top:20px')), 'parallel-run timing log, measured on this machine') };
  C.end = { n: 1, html: page(Sx(1, `<div class="ttl">Network ERP without an<br>Apps and Database server!</div><div class="sub">local first · minimal relay · proven by witness</div>`)) };
  return C;
} };
