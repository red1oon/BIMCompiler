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
  const chart = () => { const rows = [['office network', 'l_nl_lan'], ['mobile data', 'l_nl_4g'], ['bad line', 'l_nl_poor']], max = Math.max(...rows.map(r => Number(F[r[1]]))), W = 470, x0 = 200, bh = 24, gap = 2, gh = 2 * bh + gap + 36;
    let g = `<svg width="820" height="${70 + rows.length * gh}" style="display:block" font-family="Noto Sans, DejaVu Sans" >`;
    g += `<rect x="${x0}" y="8" width="16" height="16" rx="3" fill="${OR}"/><text x="${x0 + 24}" y="22" font-size="22" fill="#C3C2B7">traditional system</text><rect x="${x0 + 270}" y="8" width="16" height="16" rx="3" fill="${BL}"/><text x="${x0 + 294}" y="22" font-size="22" fill="#C3C2B7">this system</text>`;
    rows.forEach((r, i) => { const y = 54 + i * gh, wl = Math.max(4, Number(F[r[1]]) / max * W), wt = Math.max(4, Number(F.t_twin) / max * W);
      const bar = (yy, w, c) => `<path d="M${x0} ${yy} h${w - 4} a4 4 0 0 1 4 4 v${bh - 8} a4 4 0 0 1 -4 4 h-${w - 4} z" fill="${c}"/>`;
      g += `<text x="${x0 - 14}" y="${y + bh + 6}" font-size="24" fill="#FFFFFF" text-anchor="end">${esc(r[0])}</text>` + bar(y, wl, OR) + `<text x="${x0 + wl + 10}" y="${y + bh - 5}" font-size="21" fill="#C3C2B7">≥ ${V(r[1] + '_s')} s</text>`
        + bar(y + bh + gap, wt, BL) + `<text x="${x0 + wt + 10}" y="${y + 2 * bh + gap - 5}" font-size="21" fill="#C3C2B7">${V('t_twin_s')} s</text>`; });
    return g + `<line x1="${x0}" y1="44" x2="${x0}" y2="${50 + rows.length * gh - 30}" stroke="#6B6A63" stroke-width="2"/></svg>`; };
  const li = (sign, t) => `<div style="display:flex;gap:12px;margin-top:8px"><b style="width:22px;color:#FFFFFF">${sign}</b><span>${t}</span></div>`;
  const opening = (kick, sub, extra) => `<div style="position:absolute;left:96px;top:220px;width:1728px;border-left:8px solid var(--cy);padding-left:36px"><div style="font:400 36px/1.2 'Noto Sans';color:var(--ink2);letter-spacing:2px">${kick}</div><div style="font:800 104px/1.08 'Noto Sans';margin-top:16px">Network ERP</div><div style="font:800 76px/1.12 'Noto Sans';color:var(--ye)">without an Apps and Database server!</div><div style="font:400 36px/1.3 'Noto Sans';color:var(--ink2);margin-top:28px">${sub}</div>${extra ? `<div style="font:400 30px/1.5 'DejaVu Sans Mono',monospace;color:var(--cy);margin-top:40px">${extra}</div>` : ''}</div>`;
  C.title = { n: 1, html: page(Sx(1, opening('A SHORT FILM · LOCAL FIRST', 'the whole program on every device · only the changes travel'))) };
  C.usual = { n: 3, html: page(hd('THE USUAL PICTURE', 'Two computers in the middle of every click', '') +
    `<div class="flow">` + Sx(1, `<div class="node">people at their<br>screens</div>`, 'display:flex;align-items:center;gap:26px') +
    Sx(2, `<span class="ar">⇄</span><div class="node" style="border-color:var(--or)">PROGRAM<br>computer</div><span class="ar">⇄</span><div class="node" style="border-color:var(--or)">DATA<br>computer</div>`, 'display:flex;align-items:center;gap:26px') + `</div>` +
    Sx(3, bx('or', 1728, `<div class="q">Every click goes there and back, and both computers run all day.</div>`, 'margin-top:60px')), 'how shared business systems usually work') };
  C.other = { n: 3, html: page(hd('THE OTHER PICTURE', 'Every device runs the whole program itself', '') +
    Sx(1, `<div class="flow"><div class="node" style="border-color:var(--cy)">device<br><span style="font-weight:400;font-size:24px">the whole program<br>its own copy of the data</span></div><div class="node" style="border-color:var(--cy)">device<br><span style="font-weight:400;font-size:24px">the whole program<br>its own copy of the data</span></div><div class="node" style="border-color:var(--cy)">device<br><span style="font-weight:400;font-size:24px">the whole program<br>its own copy of the data</span></div></div>`) +
    Sx(2, bx('cy', 1728, `<div class="q">Between them, a delivery service that only carries the changes: item codes, quantities, amounts.</div>`, 'margin-top:40px')) +
    Sx(3, bx('gd', 1728, `<div class="q">Nothing in the middle doing the work.</div>`, 'margin-top:20px')), 'work on the device first, send only the changes') };
  C.test = { n: 3, html: page(hd('THE TEST', 'The hard way', '') +
    Sx(1, `<div style="margin-top:40px"><span class="num cy">${V('users_max')}</span> <span class="lbl">users, each on their own device, running the real software</span></div>`) +
    Sx(2, `<div class="flow"><div class="node">office network</div><div class="node">home internet</div><div class="node">mobile data</div><div class="node" style="border-color:var(--or)">a bad line that<br>drops connections</div></div><div class="lbl">connections simulated on one computer</div>`) +
    Sx(3, bx('am', 1728, `<div class="q">Everyone sends their day's work within the same ${V('burst_s')} seconds: closing time.</div>`, 'margin-top:40px')), 'test logs') };
  C.lost = { n: 3, html: page(hd('NOTHING LOST', 'Dropped connections happened', '') + `<div class="vs">` +
    Sx(1, bx('am', 820, `<h3>Dropped connections</h3><div class="num amc" style="margin-top:12px">${V('a1_retried')}</div><div class="lbl">each retried on the spot</div>`)) +
    Sx(2, bx('gd', 820, `<h3>At head office</h3><div class="num gdc" style="margin-top:12px">${V('a1_received')} / ${V('a1_reference')}</div><div class="lbl">records received</div>`)) + `</div>` +
    Sx(3, bx('gd', 1728, `<div class="q">Lost: ${V('a1_lost')}.</div>`, 'margin-top:30px')), 'test logs') };
  C.books = { n: 2, html: page(hd('SAME BOOKS', 'Compared with a run that had no network at all', '') +
    Sx(1, `<div style="margin-top:60px"><span class="num gdc">${V('a2_acc')}</span> <span class="lbl">records at head office, the same as the test with no network: ${V('a1_reference')}</span></div>`) +
    Sx(2, bx('cy', 1728, `<div class="q">The network changes when, never what.</div>`, 'margin-top:60px')), 'test logs') };
  C.feel = { n: 3, html: page(hd('HOW IT FEELS', 'Time to send the changes', 'it runs in the background: nobody waits for it') + `<div class="vs">` +
    Sx(1, bx('cy', 540, `<h3>home internet</h3><div class="num cy" style="margin-top:12px">${V('feel_bb')} s</div>`)) +
    Sx(2, bx('cy', 540, `<h3>mobile data</h3><div class="num cy" style="margin-top:12px">${V('feel_4g')} s</div>`)) +
    Sx(3, bx('am', 540, `<h3>a bad line</h3><div class="num amc" style="margin-top:12px">${V('feel_poor')} s</div>`)) + `</div>`, 'fit log') };
  C.maths = { n: 4, html: page(hd('THE MATHS', 'No thousand computers needed', '') +
    Sx(1, bx('cy', 1728, `<div class="q">Measured with ${V('fit_points')} users, and found the pattern in each number.</div>`, 'margin-top:30px')) +
    Sx(2, bx('gd', 1728, `<div class="q">Tested each pattern: using the smaller tests to guess ${V('holdout_n')} users, the guesses were off by ${V('holdout_min')} to ${V('holdout_max')} percent.</div>`, 'margin-top:20px')) +
    Sx(3, bx('am', 1728, `<div class="q">${V('untrusted_n')} of the ${V('fit_metrics')} numbers had no reliable pattern: not guessed.</div>`, 'margin-top:20px')) +
    Sx(4, bx('cy', 1728, `<div class="q">For example, at ${V('extrap_n', ',')} users, a device catching up after a while sends about ${V('catchup_1000')} messages (give or take ${V('catchup_err')} percent).</div>`, 'margin-top:20px')), 'fit log') };
  C.bends = { n: 3, html: page(hd('WHERE IT BENDS', 'The free delivery service, not the program', "GitHub's own published rules") + `<div class="vs">` +
    Sx(1, bx('or', 820, `<h3>One shared GitHub account</h3><div class="num or" style="margin-top:12px">${V('cliff_shared')}–${V('cliff_shared_hi')}</div><div class="lbl">users, all sending at closing time</div>`)) +
    Sx(2, bx('am', 820, `<h3>One account per person</h3><div class="num amc" style="margin-top:12px">≈ ${V('hq_cliff_lo')}–${V('hq_cliff_hi')}</div><div class="lbl">users: head office's own account runs out first</div>`)) + `</div>` +
    Sx(3, bx('cy', 1728, `<div class="q">Measured up to ${V('fit_max_n')} users. Beyond that: untested.</div>`, 'margin-top:30px')), 'fit log') };
  C.versus = { n: 4, html: page(hd('VS THE REST OF THE WORLD — APPLE FOR APPLE', 'Traditional server-based system vs this one', "this system tested with the browser's own database · the traditional one without its extra sign-in on every step") +
    Sx(1, bx('cy', 1728, `<div class="q">${V('o2c_steps')} documents (order → delivery → invoice → payment → two cancellations) · results identical: ${V('o2c_match')} of ${V('o2c_steps')}</div>`, 'margin-top:14px')) + `<div class="vs" style="margin-top:16px;align-items:flex-start">` +
    Sx(2, `<div class="bx" style="width:880px;border-color:#6B6A63"><h3>Wait per document</h3>${chart()}<div class="lbl" style="font-size:19px">the middle result of ${V('l_runs')} tests · on mobile data the tests ranged ${V('l_4g_lo_s')}–${V('l_4g_hi_s')} s · traditional: the server's own time, extra sign-in removed, plus the trip there and back</div></div>`) +
    `<div style="width:800px">` + Sx(3, bx('am', 800, `<div class="q">This system still sends its changes, later, in the background: about ${V('feel_4g')} s on mobile data.</div>`)) +
    Sx(4, bx('cy', 800, `<div class="q">Computers running all day in the middle: ${V('legacy_servers')} vs none.</div>`, 'margin-top:16px')) + `</div></div>`, 'timing logs, measured on one computer') };
  C.honest = { n: 3, html: page(hd('HONESTLY: PROS AND CONS', 'Wait per document, and what each one costs', '') + `<div class="vs" style="margin-top:14px;align-items:flex-start">` +
    Sx(1, `<div class="bx" style="width:860px;border-color:#6B6A63"><h3>Wait per document (middle of ${V('l_runs')} tests)</h3>${chart()}<div class="lbl" style="font-size:20px">traditional: the server's own time, extra sign-in removed, plus the trip there and back</div></div>`) +
    `<div style="width:840px">` +
    Sx(2, bx('or', 840, `<h3 style="color:#FFFFFF">Traditional server-based system</h3><div class="lbl" style="font-size:22px;color:#E6E6E6">${li('+', 'one copy: everyone sees a change at once')}${li('+', 'a long track record')}${li('−', 'computers to run, pay for and look after')}${li('−', 'every action waits on the network')}${li('−', 'network down: work stops')}</div>`, `border-color:${OR}`)) +
    Sx(3, bx('cy', 840, `<h3 style="color:#FFFFFF">This system</h3><div class="lbl" style="font-size:22px;color:#E6E6E6">${li('+', 'no central computers: every action finishes on the device')}${li('+', 'keeps working without internet, sends later')}${li('−', 'others see your change only after it is sent')}${li('−', 'the free GitHub delivery service: ' + V('cliff_shared') + '–' + V('cliff_shared_hi') + ' users on one account, about ' + V('hq_cliff_lo') + '–' + V('hq_cliff_hi') + ' with one per person; beyond that, your own')}${li('−', 'a full copy of the data on every device')}${li('−', 'a warning when someone else just changed the same record: not built yet')}</div>`, `border-color:${BL};margin-top:16px`)) +
    `</div></div>`, 'timing logs, test logs') };
  // the closing overview (owner 2026-11-02: "a closing card that wraps up a good overview table comparing with others"): measured cells only for the traditional
  //   (legacy iDempiere, §45.15b) and this one; the cloud column is labelled general, not measured; text only, no invented figures
  const ov = [['computers you keep running', V('legacy_servers') + ' (program + data)', "none of yours: the vendor's", 'none'],
    ['wait on every click', 'yes: the trip to your server', 'yes: the trip to the vendor', 'no: done on the device'],
    ['internet down', 'office works, branches stop', 'work stops', 'keeps working, sends later'],
    ['others see a change', 'at once', 'at once', 'after it is sent'],
    ['where the data lives', 'your server', "the vendor's computers", 'on every device'],
    ['ongoing cost', 'computers and their upkeep', 'a subscription per user', 'a free delivery service, within its limits'],
    ['tested in this film', 'yes', 'no', 'up to ' + V('fit_max_n') + ' users']];
  const th = (t, c, sub) => `<th style="text-align:left;padding:10px 14px;border-bottom:3px solid ${c};font:700 26px/1.2 'Noto Sans'">${t}${sub ? `<div style="font:400 19px/1.2 'Noto Sans';color:#C3C2B7;margin-top:4px">${sub}</div>` : ''}</th>`;
  C.overview = { n: 2, html: page(hd('THE WHOLE PICTURE', 'Three ways to run a shared business system', '') +
    Sx(1, `<table style="margin-top:18px;width:1728px;border-collapse:collapse;font:400 24px/1.3 'Noto Sans'"><tr><th></th>${th('Traditional server system', OR, 'your own computers')}${th('Cloud system', '#6B6A63', 'rented · general, not measured here')}${th('This system', BL, 'local first')}</tr>` +
      ov.map((r, i) => `<tr style="background:${i % 2 ? 'transparent' : 'rgba(255,255,255,.03)'}"><td style="padding:9px 14px;color:#C3C2B7;width:330px">${r[0]}</td><td style="padding:9px 14px">${r[1]}</td><td style="padding:9px 14px;color:#C3C2B7">${r[2]}</td><td style="padding:9px 14px">${r[3]}</td></tr>`).join('') + `</table>`) +
    Sx(2, `<div class="lbl" style="font-size:22px;margin-top:16px">Traditional and this one: measured in this film. Cloud: how such systems generally work.</div>`), 'timing logs, test logs') };
  C.end = { n: 1, html: page(Sx(1, opening('LOCAL FIRST · EVERY NUMBER TESTED', 'work on the device first · send only the changes', 'github.com/red1oon/bim-ootb<br>github.com/red1oon/BIMCompiler<br>red1org@gmail.com'))) };
  return C;
} };
