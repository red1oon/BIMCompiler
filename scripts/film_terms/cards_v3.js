// ⚠ DO NOT REMOVE — Scope: the cards of the PUBLIC cut v3 of "Terms you can check" (script_en_v3_public.md). NO NUMBER IS TYPED: every figure is V('<fact id>') from facts.resolved.v3.json; a missing fact throws. Plain words only (guard_v3.js bans the jargon list). Cards 'limits' and 'tryit' carry no green. Env G2=pass / G3=1 switch the two pending lines. READ THE LOG: out_v3/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), { CSS } = require('./cards.js');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const img = n => { const f = path.join(__dirname, 'out_v3', 'cap', n); if (!fs.existsSync(f)) throw new Error('missing capture ' + n); return 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'); };
const CSS3 = CSS + `.env{display:inline-block;width:150px;height:96px;border:3px solid var(--cy);border-radius:10px;background:var(--panel);text-align:center;font:800 44px/92px 'Noto Sans'}.env.gap{border:3px dashed var(--or);background:transparent;color:var(--or)}
.arrow{font:700 56px/1 'Noto Sans';color:var(--ink2);align-self:center}.sq{display:inline-block;width:92px;height:92px;margin:8px;border-radius:12px;background:var(--gd)}.sq.bad{background:var(--or)}.flagc{font:800 30px/1.2 'Noto Sans';color:var(--or)}
.bar{display:inline-block;width:150px;vertical-align:bottom}`;
module.exports = { CSS: CSS3, build(X) {
  const V = id => { const f = X[id]; if (!f || f.status !== 'now') throw new Error('fact not resolved: ' + id); return esc(f.value); };
  const Fl = (id, txt) => { V(id); return txt; };
  const G2 = process.env.G2 === 'pass', G3 = process.env.G3 === '1';
  const Sx = (k, h, st) => `<div data-s="${k}" style="${st || ''}">${h}</div>`;
  const page = (inner, src, tag) => `<div class="pg"><div class="tag">${tag || 'TERMS YOU CAN CHECK'}</div>${inner}<div class="src">${esc(src)}</div></div>`;
  const hd = (k, t, s, c) => `<div class="hd ${c || ''}"><div class="k">${k}</div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  const C = {};
  const till = (n, extra) => `<div class="bx cy" style="width:330px;height:190px"><h3>Till</h3><div class="sb" style="font-size:30px">keeps its own books</div>${extra || ''}</div>`;
  // 1 hook
  C.hook = { n: 4, html: page(hd('A SHOP, TWO PLACES', 'Tills in the shop, a head office elsewhere', '') + `<div class="row" style="margin-top:30px">${till()}${till()}${till()}<div class="bx cy" style="width:520px;height:190px"><h3>Head office</h3><div class="sb" style="font-size:30px">keeps its own books too</div></div></div>`
    + Sx(2, `<div class="bx am" style="margin-top:34px;width:1728px"><h3>The internet drops</h3></div>`)
    + Sx(3, `<div class="bx gd" style="margin-top:22px;width:1728px"><h3>The tills keep selling</h3><div class="sb">When the connection returns, they catch up.</div></div>`)
    + Sx(4, `<div class="take" style="top:790px">Nothing in the middle to rent. Nothing in the middle to keep alive.</div>`), 'source: the product’s design; each claim in this film is tested') };
  // 2 how it works
  C.how = { n: 4, html: page(hd('HOW IT WORKS', 'Every device keeps its own books', 'A post box carries small sealed envelopes') + `<div class="row" style="margin-top:20px;align-items:stretch">`
    + Sx(1, `<div class="bx cy" style="width:520px;height:300px"><h3>Tills</h3><div class="q">each one a book of its own</div></div>`) + Sx(2, `<div class="arrow">→</div>`)
    + Sx(2, `<div class="bx am" style="width:420px;height:300px"><h3>Post box</h3><div class="q">carries sealed envelopes</div></div>`) + Sx(2, `<div class="arrow">→</div>`)
    + Sx(1, `<div class="bx cy" style="width:420px;height:300px"><h3>Head office</h3><div class="q">collects them</div></div>`) + `</div>`
    + Sx(3, `<div class="bx cy" style="margin-top:26px;width:1728px"><h3>The post box only carries. It never decides.</h3><div class="sb">Swap it, and the books stay the same.</div></div>`)
    + Sx(4, `<div class="bx or" style="margin-top:18px;width:1728px"><div class="q">A till breaks the rules: every device refuses it, and says why. ${Fl('refuse_every', '')}</div></div>`), 'source: executor refusal test log (every device refuses)') };
  // 3 private
  C.private = { n: 4, html: page(hd('PRIVATE BY DESIGN', 'Only that till and head office can open its mail', '') + `<div class="row" style="margin-top:6px">`
    + Sx(1, `<div class="bx cy" style="width:520px;height:230px"><h3>Till A</h3><div class="q">sealed envelopes for head office</div></div>`) + Sx(1, `<div class="bx am" style="width:420px;height:230px"><h3>Post box</h3><div class="q">cannot open them</div></div>`) + Sx(1, `<div class="bx cy" style="width:420px;height:230px"><h3>Head office</h3><div class="q">opens them</div></div>`) + `</div>`
    + Sx(2, `<div class="row" style="margin-top:22px"><div class="bx or" style="width:1000px;height:240px"><h3>Till B, a tampered app</h3><div class="q">takes all ${V('rs_downloaded')} of A’s envelopes</div><div class="big gdc" style="margin-top:6px;font-size:64px">opens ${V('rs_opened')}</div></div>`
    + Sx(3, `<div class="bx am" style="width:710px;height:240px"><h3>The old way: one shared key</h3><div class="q">the same till opens all ${Fl('rs_ctl_opened', '')}</div><div class="sb">so we know the test can fail</div></div>`) + `</div>`)
    + Sx(4, `<div class="take" style="top:810px">Sealed to the pair. Not the post box. Not the other tills.</div>`), 'source: sealed-mail test log') };
  // 4 gaps
  const env = (id, gap) => `<span class="env ${gap ? 'gap' : ''}">${V(id)}</span>`;
  C.gaps = { n: 4, html: page(hd('NOTHING GOES MISSING UNNOTICED', 'Envelopes are numbered and signed', '') + Sx(1, `<div style="margin-top:30px;display:flex;gap:30px">${env('env1')}${env('env2')}${env('env3')}${env('env4', 1)}${env('env5')}</div>`)
    + Sx(2, `<div class="bx or" style="margin-top:34px;width:1728px"><h3 class="flagc">Gap: envelope ${V('gh_gap_mid')} was held back, and the receiver sees it</h3></div>`)
    + Sx(3, `<div class="bx gd" style="margin-top:22px;width:1728px"><h3>Also checked over a real public post box on GitHub</h3><div class="sb">Held back and reported: ${Fl('gh_word', 'passed')}</div></div>`)
    + Sx(4, `<div class="bx am" style="margin-top:22px;width:1728px"><div class="q">With the numbering switched off, the same test finds no gap. ${Fl('gh_ctl_flag', 'So the test can say no.')}</div></div>`), 'source: real public post box test log') };
  // 5 light
  const bar = (h, col, lab, sub) => `<div style="display:inline-block;text-align:center;width:360px"><div style="height:${h}px;width:150px;margin:0 auto;background:${col};border-radius:6px 6px 0 0"></div><div class="q" style="font-size:30px;margin-top:10px">${lab}</div><div class="sb" style="font-size:24px">${sub}</div></div>`;
  C.light = { n: 3 + (G3 ? 1 : 0), html: page(hd('STAYS LIGHT AS YOU GROW', 'A new till’s first download', 'Bars are not to scale') + `<div style="display:flex;align-items:flex-end;gap:40px;height:420px">`
    + Sx(1, bar(330, 'var(--or)', `${V('kb10')} KB at ${V('n10')} tills`, `then ${V('mb100')} MB at ${V('n100')} (before)`)) + Sx(2, bar(6, 'var(--gd)', `${V('sc10')} bytes at ${V('n10')} tills`, `${V('sc100')} bytes at ${V('n100')} (now)`))
    + (G3 ? Sx(3, bar(6, 'var(--gd)', `${V('sc1000')} bytes at ${V('n1000')} tills`, '(now)')) : '') + `</div>`
    + Sx(G3 ? 4 : 3, `<div class="bx am" style="width:1728px"><div class="q" style="font-size:27px">Measured on simulated tills on a single machine. ${Fl('star_limits', '')}</div></div>`), 'source: sealed-mail size measurement logs') };
  // 6 promises
  const sqs = Array.from({ length: +V('v3_enforced') }, (_, i) => `<span class="sq${i === 0 ? ' sealed' : ''}"></span>`).join('');
  C.promises = { n: 4, html: page(hd('PROMISES YOU CAN CHECK', 'Each promise has a test that must fail if it breaks', '') + `<div class="row" style="margin-top:10px">`
    + Sx(1, `<div class="bx gd" style="width:760px;height:400px"><h3>Promises kept: ${V('v3_enforced')}</h3><div style="margin-top:10px">${sqs}</div></div>`)
    + `<div class="col" style="width:950px">` + Sx(2, `<div class="bx or" style="height:190px"><h3>Sealed mail: a safety check removed</h3><div class="q">found ${V('neg_found')} of ${V('neg_tot')} · the whole run: <b>${V('neg_word')}</b></div></div>`)
    + Sx(3, `<div class="bx gd" style="height:190px"><h3>Check put back</h3><div class="q">Verdict <b>${V('v3_word')}</b> · ${V('v3_enforced')} kept · ${V('v3_open')} open</div></div>`) + `</div></div>`
    + Sx(4, `<div style="position:absolute;left:96px;top:215px;width:1728px;height:600px;background:var(--bg);border:2px solid var(--cy);border-radius:14px;padding:30px;text-align:center"><img src="${img('objectives_cap.png')}" style="width:1180px;border-radius:8px"><div class="take" style="position:static;margin-top:20px;text-align:center">The project’s own page: nothing left under “Not promised yet”.</div></div>`),
    'source: sealed-mail and full test-run logs · frozen capture of the live objectives page') };
  // 7 limits (no green)
  C.limits = { n: 3, html: page(hd('WHAT WE DO NOT CLAIM', 'Honest limits', '', 'am') + `<div class="row" style="margin-top:12px">`
    + Sx(1, `<div class="bx am" style="width:560px;height:360px"><h3>The post box sees the traffic</h3><div class="q">${Fl('lim_meta', 'It still sees who sent how much, and when.')}</div></div>`)
    + Sx(2, `<div class="bx am" style="width:560px;height:360px"><h3>Older teams</h3><div class="q">${Fl('rs_office', 'Teams started before sealed mail, and office teams, work exactly as before.')}</div></div>`)
    + Sx(3, G2 ? `<div class="bx am" style="width:560px;height:360px"><h3>Another machine</h3><div class="q">${Fl('g2_pass', 'The checks have been run from a fresh copy on another machine.')}</div></div>` : `<div class="bx am" style="width:560px;height:360px"><h3>Another machine</h3><div class="q">${Fl('r3_not_done', 'Not yet run from a fresh copy on another machine.')}</div></div>`) + `</div>`, 'sources: sealed-mail test notes · developers page') };
  // 8 try it (no green)
  C.tryit = { n: 3, html: page(hd('TRY IT', 'Open source, tested, and yours to run', '', 'am')
    + Sx(1, `<div class="bx cy" style="margin-top:20px;width:1728px"><div class="q" style="font-size:36px">${Fl('gov_mit', 'Open source under the MIT licence.')} No artificial intelligence inside.</div></div>`)
    + Sx(2, `<div class="bx am" style="margin-top:20px;width:1728px"><div class="q" style="font-size:36px">${V('gov_name')}: tested properties, not a warranty. ${Fl('gov_while', 'A copy keeps them only while its own tests still pass.')}</div></div>`)
    + Sx(3, `<div class="bx cy" style="margin-top:20px;width:1728px"><div class="q mono" style="font-size:28px">https://red1oon.github.io/bim-ootb/erp/team_objectives.html<br>https://red1oon.github.io/bim-ootb/erp/team_developers.html<br>https://red1oon.github.io/bim-ootb/erp/team_guide.html</div></div>`), 'the three open pages') };
  return C;
} };
