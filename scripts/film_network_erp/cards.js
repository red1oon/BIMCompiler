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
const OR = '#d95926', BL = '#3987e5';   // dataviz reference dark slots 2 (orange) and 1 (blue); validate_palette.js --mode dark --surface #080A0E: ALL CHECKS PASS
module.exports = { CSS: CSSN, build(F) {
  const V = (id, fmt) => { if (!(id in F)) throw new Error('fact not resolved: ' + id); const v = F[id]; return esc(fmt === ',' ? Number(String(v).replace(/,/g, '')).toLocaleString('en-US') : v); };
  const Sx = (k, h, st) => `<div data-s="${k}" style="${st || ''}">${h}</div>`;
  const page = (inner, src) => `<div class="pg"><div class="tag">NETWORK ERP WITHOUT AN APPS AND DATABASE SERVER</div>${inner}${src ? `<div class="src">${esc(src)}</div>` : ''}</div>`;
  const hd = (k, t, s, c) => `<div class="hd ${c || ''}"><div class="k">${k}</div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  const bx = (cls, w, inner, st) => `<div class="bx ${cls}" style="width:${w}px;${st || ''}">${inner}</div>`;
  const C = {};
  // the honest card: a grouped horizontal bar chart (dataviz: magnitude across two series; one axis; thin bars, 4 px rounded data-ends anchored to the
  //   baseline, 2 px gap, direct value labels, legend present, text in ink not series colour; palette validated on #080A0E: ALL CHECKS PASS)
  const chart = () => { const rows = [['office LAN', 'l_nl_lan'], ['4G', 'l_nl_4g'], ['poor line', 'l_nl_poor']], max = Math.max(...rows.map(r => Number(F[r[1]]))), W = 520, x0 = 150, bh = 24, gap = 2, gh = 2 * bh + gap + 36;
    let g = `<svg width="820" height="${70 + rows.length * gh}" style="display:block" font-family="Noto Sans, DejaVu Sans" >`;
    g += `<rect x="${x0}" y="8" width="16" height="16" rx="3" fill="${OR}"/><text x="${x0 + 24}" y="22" font-size="22" fill="#C3C2B7">classic server ERP</text><rect x="${x0 + 270}" y="8" width="16" height="16" rx="3" fill="${BL}"/><text x="${x0 + 294}" y="22" font-size="22" fill="#C3C2B7">this ERP</text>`;
    rows.forEach((r, i) => { const y = 54 + i * gh, wl = Math.max(4, Number(F[r[1]]) / max * W), wt = Math.max(4, Number(F.t_twin) / max * W);
      const bar = (yy, w, c) => `<path d="M${x0} ${yy} h${w - 4} a4 4 0 0 1 4 4 v${bh - 8} a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${c}"/>`;
      g += `<text x="${x0 - 14}" y="${y + bh + 6}" font-size="24" fill="#FFFFFF" text-anchor="end">${esc(r[0])}</text>` + bar(y, wl, OR) + `<text x="${x0 + wl + 10}" y="${y + bh - 5}" font-size="21" fill="#C3C2B7">≥ ${V(r[1], ',')} ms</text>`
        + bar(y + bh + gap, wt, BL) + `<text x="${x0 + wt + 10}" y="${y + 2 * bh + gap - 5}" font-size="21" fill="#C3C2B7">${V('t_twin')} ms</text>`; });
    return g + `<line x1="${x0}" y1="44" x2="${x0}" y2="${50 + rows.length * gh - 30}" stroke="#6B6A63" stroke-width="2"/></svg>`; };
  const li = (sign, t) => `<div style="display:flex;gap:12px;margin-top:8px"><b style="width:22px;color:#FFFFFF">${sign}</b><span>${t}</span></div>`;
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
  C.lost = { n: 3, html: page(hd('NOTHING LOST', 'Dropped connections happened', '') + `<div class="vs">` +
    Sx(1, bx('am', 820, `<h3>Dropped connections</h3><div class="num amc" style="margin-top:12px">${V('a1_retried')}</div><div class="lbl">each retried on the spot</div>`)) +
    Sx(2, bx('gd', 820, `<h3>At head office</h3><div class="num gdc" style="margin-top:12px">${V('a1_received')} / ${V('a1_reference')}</div><div class="lbl">records received</div>`)) + `</div>` +
    Sx(3, bx('gd', 1728, `<div class="q">Lost: ${V('a1_lost')}.</div>`, 'margin-top:30px')), 'scale run log') };
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
  C.versus = { n: 4, html: page(hd('VS THE REST OF THE WORLD — APPLE FOR APPLE', 'The same documents on a classic server ERP and on this one', "this ERP on the browser's own SQLite (WebAssembly) · the classic one without its per-call login") +
    Sx(1, bx('cy', 1728, `<div class="q">${V('o2c_steps')} documents (order → shipment → invoice → payment → two reversals) · results identical: ${V('o2c_match')} of ${V('o2c_steps')}</div>`, 'margin-top:14px')) + `<div class="vs" style="margin-top:16px;align-items:flex-start">` +
    Sx(2, `<div class="bx" style="width:880px;border-color:#6B6A63"><h3>Wait per document</h3>${chart()}<div class="lbl" style="font-size:19px">median of ${V('l_runs')} runs · 4G range ${V('l_4g_lo')}–${V('l_4g_hi', ',')} ms · classic = server time of its writes, per-call login removed, plus one round trip each</div></div>`) +
    `<div style="width:800px">` + Sx(3, bx('am', 800, `<div class="q">This ERP pays for its network later, in the background: one routine sync ${V('feel_4g')} s on 4G.</div>`)) +
    Sx(4, bx('cy', 800, `<div class="q">Servers running all day: ${V('legacy_servers')} vs none.</div>`, 'margin-top:16px')) + `</div></div>`, 'parallel-run timing logs, measured on this machine') };
  C.honest = { n: 3, html: page(hd('HONESTLY: PROS AND CONS', 'Wait per document, and what each one costs', '') + `<div class="vs" style="margin-top:14px;align-items:flex-start">` +
    Sx(1, `<div class="bx" style="width:860px;border-color:#6B6A63"><h3>Wait per document (median of ${V('l_runs')} runs)</h3>${chart()}<div class="lbl" style="font-size:20px">classic: server time without its per-call login, plus one round trip per write</div></div>`) +
    `<div style="width:840px">` +
    Sx(2, bx('or', 840, `<h3 style="color:#FFFFFF">Classic server ERP</h3><div class="lbl" style="font-size:22px;color:#E6E6E6">${li('+', 'one copy: everyone sees a change at once')}${li('+', 'years of maturity')}${li('−', 'servers to run, pay for and look after')}${li('−', 'every action waits on the network')}${li('−', 'network down: work stops')}</div>`, `border-color:${OR}`)) +
    Sx(3, bx('cy', 840, `<h3 style="color:#FFFFFF">This ERP</h3><div class="lbl" style="font-size:22px;color:#E6E6E6">${li('+', 'no servers: every action finishes on the device')}${li('+', 'keeps working offline, sends later')}${li('−', 'others see a change after the next sync')}${li('−', 'one shared free relay account: ' + V('cliff_shared') + '–' + V('cliff_shared_hi') + ' users (beyond: an account per device, or your own relay)')}${li('−', 'a full copy on every device')}${li('−', 'the “changed by another user” check on save: not built yet')}</div>`, `border-color:${BL};margin-top:16px`)) +
    `</div></div>`, 'parallel-run timing logs, scale run fit log') };
  C.end = { n: 1, html: page(Sx(1, `<div class="ttl">Network ERP without an<br>Apps and Database server!</div><div class="sub">local first · minimal relay · proven by witness</div>`)) };
  return C;
} };
