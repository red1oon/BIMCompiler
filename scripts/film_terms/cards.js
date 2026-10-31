// ⚠ DO NOT REMOVE — Scope: the cards of the film "Terms you can check". NO NUMBER IS TYPED HERE: every figure is V('<fact id>') from facts.resolved.json. A missing fact throws (build fails). Open rows use class "open" (amber) and never "ok" (green); the last two cards carry no green at all (guard.js checks both). READ THE LOG: out/guard.log.
// Each card = { html, n }: elements marked data-s="k" are revealed when shown>=k (the recorder steps the reveal over the beat). Cards are 1920x930; subtitles sit in the band below.
'use strict';
const fs = require('fs'), path = require('path');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CSS = `:root{--bg:#080A0E;--panel:#1A1A19;--line:#6B6A63;--ink:#FFFFFF;--ink2:#C3C2B7;--cy:#4FC3F7;--ye:#FFEB3B;--gd:#0CA30C;--am:#FAB219;--or:#FF8C1A}
*{box-sizing:border-box;margin:0}html,body{width:1920px;height:930px;overflow:hidden;background:var(--bg);color:var(--ink);font-family:'Noto Sans','DejaVu Sans',sans-serif}
.pg{position:absolute;left:0;top:0;width:1920px;height:930px;padding:70px 96px 0 96px;background-image:linear-gradient(rgba(26,26,25,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,25,.9) 1px,transparent 1px);background-size:80px 80px}
.tag{position:absolute;left:96px;top:26px;font:700 22px/1 'Noto Sans';letter-spacing:4px;color:var(--ink2)}
.hd{border-left:8px solid var(--cy);padding-left:30px;margin-bottom:22px}.hd .k{font:400 28px/1.2 'Noto Sans';color:var(--ink2);letter-spacing:2px}.hd .t{font:700 54px/1.12 'Noto Sans';margin-top:6px}.hd .s{font:400 28px/1.3 'Noto Sans';color:var(--ye);margin-top:8px}
.hd.am{border-left-color:var(--am)}
.big{font:800 72px/1.1 'Noto Sans'}.big.cy{color:var(--cy)}.big.or{color:var(--or)}.big.amc{color:var(--am)}.big.gdc{color:var(--gd)}.mut{color:var(--ink2)}
.row{display:flex;gap:22px;width:1728px}.col{display:flex;flex-direction:column;gap:18px}
.bx{background:var(--panel);border:2px solid var(--line);border-radius:14px;padding:18px 24px;flex:1;min-width:0}.bx.cy{border-color:var(--cy)}.bx.gd{border-color:var(--gd)}.bx.am{border-color:var(--am)}.bx.or{border-color:var(--or)}
.bx h3{font:700 34px/1.2 'Noto Sans'}.bx .q{font:400 31px/1.35 'Noto Sans';margin-top:12px}.bx .sb{font:400 26px/1.35 'Noto Sans';color:var(--ink2);margin-top:12px}.bx .mono,.mono{font:400 24px/1.35 'DejaVu Sans Mono',monospace}
.chip{display:inline-block;font:800 20px/1 'Noto Sans';letter-spacing:1px;padding:7px 12px;border-radius:8px;color:#080A0E;background:var(--cy);white-space:nowrap}.chip.ok{background:var(--gd)}.chip.open{background:var(--am)}.chip.ref{background:var(--or)}
table.tb{border-collapse:collapse;width:1728px}table.tb td,table.tb th{font:400 23px/1.2 'Noto Sans';padding:5px 14px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}table.tb .chip{font-size:16px;padding:4px 10px}table.tb th{font:700 20px/1.3 'Noto Sans';color:var(--ink2);letter-spacing:1px}
.lx{display:grid;grid-template-columns:230px 1fr;gap:6px 26px;align-items:baseline;padding:11px 0;border-bottom:1px solid var(--line)}.lx b{font:800 38px/1.1 'Noto Sans';color:var(--cy)}.lx span{font:700 30px/1.25 'Noto Sans'}.lx i{grid-column:2;font:400 22px/1.3 'Noto Sans';color:var(--ink2);font-style:normal}
.src{position:absolute;left:96px;top:880px;width:1728px;font:400 19px/1.3 'DejaVu Sans Mono',monospace;color:var(--ink2);white-space:nowrap;overflow:hidden}
.take{position:absolute;left:96px;top:806px;width:1728px;font:400 32px/1.3 'Noto Sans';color:var(--cy)}`;
const img = n => { const f = path.join(__dirname, 'out', 'cap', n); if (!fs.existsSync(f)) throw new Error('missing capture ' + n); return 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'); };
module.exports = { CSS, build(X) {
  const V = id => { const f = X[id]; if (!f || f.status !== 'now') throw new Error('fact not resolved: ' + id); return esc(f.value); };
  const Fl = (id, txt) => { V(id); return txt; };
  const S = (k, h) => `<div data-s="${k}">${h}</div>`, Sx = (k, h, st) => `<div data-s="${k}" style="${st || ''}">${h}</div>`;
  const page = (inner, src) => `<div class="pg"><div class="tag">TERMS YOU CAN CHECK</div>${inner}<div class="src">${esc(src)}</div></div>`;
  const hd = (k, t, s, c) => `<div class="hd ${c || ''}"><div class="k">${k}</div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  const C = {};
  // ---- title
  C.title = { n: 2, html: `<div class="pg"><div class="tag">LOCAL-FIRST ERP · TEAM MODE</div><div style="position:absolute;left:96px;top:250px;width:1700px;border-left:8px solid var(--cy);padding-left:36px">
    <div style="font:400 36px/1.2 'Noto Sans';color:var(--ink2);letter-spacing:2px">TERMS YOU CAN CHECK</div>${Sx(1, `<div style="font:700 88px/1.1 'Noto Sans';margin-top:14px">Where is the database?<br>Is it real-time?</div>`)}
    ${Sx(2, `<div style="font:400 36px/1.3 'Noto Sans';color:var(--ye);margin-top:26px">${V('lex_n')} plain words. Each one has a check that fails when the word stops being true.</div>`)}</div></div>` };
  // ---- 1 lexicon
  const LX = ['relay', 'ledger', 'bundle', 'visit', 'ack', 'statement'];
  C.lexicon = { n: LX.length, html: page(hd('THE WORDS', 'Plain words, each with a check', '') + LX.map((w, i) => Sx(i + 1, `<div class="lx"><b>${w.toUpperCase()}</b><span>“${V('lex_' + w + '_say')}”</span><i>${V('lex_' + w + '_def')}</i></div>`)).join(''), 'source: the project’s term list') };
  // ---- 2 runner
  const opn = [0, 1, 2].map(i => ({ t: V('open' + i + '_term') })), enf = [...Array(10).keys()].map(i => ({ t: V('enf' + i + '_term'), a: V('enf' + i + '_ok'), b: V('enf' + i + '_tot') }));
  C.runner = { n: 14, html: page(hd('A GREEN NEEDS A FAILING CONTROL', 'The runner lists open terms first, never green', '') + `<table class="tb"><tr><th>TERM</th><th>CONTROLS THAT CATCH A BREAK</th><th>STATUS</th></tr>`
    + opn.map((r, i) => `<tr data-s="${i + 1}"><td>${r.t}</td><td class="mut">none yet</td><td><span class="chip open">OPEN</span></td></tr>`).join('')
    + enf.map((r, i) => `<tr data-s="${i + 4}"><td>${r.t}</td><td>${r.a}/${r.b} refused</td><td><span class="chip ok">ENFORCED</span></td></tr>`).join('') + `</table>`
    + Sx(14, `<div class="take" style="top:822px;font-size:30px">Verdict ${V('ver_word')} · ${V('ver_enforced')} enforced · ${V('ver_open')} open · real pages judged: ${V('ver_browser')}</div>`), 'source: terms check run') };
  C.mutant = { n: 4, html: page(hd('THE RUNNER SAYING NO', 'One control sentence changed', '') + `<div class="row">` + Sx(1, `<div class="bx gd" style="width:830px"><h3>${V('enf3_term')}</h3><div class="big gdc" style="margin-top:12px">${V('enf3_ok')}/${V('enf3_tot')} refused</div><div class="q"><span class="chip ok">ENFORCED</span></div><div class="sb">the recorded run</div></div>`)
    + Sx(2, `<div class="bx or" style="width:830px"><h3>${V('enf3_term')}</h3><div class="big or" style="margin-top:12px">${V('mut_found')}/${V('mut_tot')} refused</div><div class="q"><span class="chip ref">UNCONTROLLED</span></div><div class="sb">after the change</div></div>`) + `</div>`
    + Sx(3, `<div class="bx or" style="margin-top:26px;width:1728px"><h3>Control not found</h3><div class="q mono">${V('mut_missing')}</div></div>`)
    + Sx(4, `<div class="big or" style="margin-top:28px">Verdict ${V('mut_word')} · ${V('mut_uncontrolled')} uncontrolled · the whole run fails</div>`), 'source: terms check run, one control changed') };
  // ---- 3 visit
  const pan = (k, cls, ttl, big, lab, sub) => Sx(k, `<div class="bx ${cls}" style="width:412px;height:420px"><h3>${ttl}</h3><div class="big ${cls === 'or' ? 'or' : cls === 'gd' ? 'gdc' : 'cy'}" style="margin-top:22px">${big}</div><div class="q">${lab}</div><div class="sb">${sub}</div></div>`);
  C.visit = { n: 5, html: page(hd('OFFLINE LOSES NOTHING', 'A Visit is your choice, and it is checked', '') + `<div class="row">`
    + pan(1, 'cy', 'Relay is down', V('vis_unsent'), 'claims still held on the device', Fl('vis_nothing', 'none marked sent · nothing reached the relay'))
    + pan(2, 'or', 'Relay lies', V('liar_rbf'), 'dropped bundle caught by the read-back', `counted as sent: ${V('liar_sent')}`)
    + pan(3, 'gd', 'Next Visit', V('vis_sent_later'), 'claims sent', 'every held claim goes')
    + pan(4, 'cy', 'A third Visit', V('vis_third'), 'sent', 'once only') + `</div>`
    + Sx(5, `<div class="take">${V('vis_judged')} checks judged · failed: ${V('vis_fails')}</div>`), 'source: Visit check log') };
  // ---- 4 refusal
  C.refusal = { n: 4, html: page(hd('THE REFUSAL EVERYONE SEES', 'The same answer on every device', '') + `<div class="row">`
    + Sx(1, `<div class="bx or" style="width:560px;height:470px"><h3>A station completes an order it may not</h3><div class="q">Refused: <b>${V('ex_reason')}</b><br>on all ${V('ex_devices')} devices</div><div class="q">Its consequence in the same action: <b>${V('ex_reason_group')}</b></div><div class="sb">left behind in any ledger: ${V('ex_ghost')}</div></div>`)
    + Sx(2, `<div class="bx or" style="width:560px;height:470px"><h3>A statement edited after signing</h3><div class="q">Refused: <b>${V('pt_sig')}</b></div><div class="q">${Fl('pt_backup', 'A lost primary key: the backup key replaces it')}</div></div>`)
    + Sx(3, `<div class="bx cy" style="width:560px;height:470px"><h3>On the real page</h3><div class="q">The station clicks Complete. Refusals: <b>${V('x7_before')} → ${V('x7_after')}</b>, ${Fl('x7_unchanged', 'the order unchanged')}.</div><div class="sb">${Fl('x9_stays', 'A rule retired later does not cancel an earlier refusal.')}</div></div>`) + `</div>`
    + Sx(4, `<div class="take">Checks judged: ${V('ex_judged')} · ${V('pt_judged')} · ${V('wx_judged')} · failed: ${V('ex_fails')} · ${V('pt_fails')} · ${V('wx_fails')}</div>`), 'sources: executor, signed-statement and real-page check logs') };
  // ---- 5 weakness
  const lst = ids => ids.map(i => `<div class="mono big" style="font-size:60px;margin-top:10px">${V(i)}</div>`).join('');
  C.weak = { n: 3, html: page(hd('THE WEAKNESS, STATED', 'No central counter', 'Two devices, offline, on the shipped plain sequence', 'am') + `<div class="row" style="align-items:center">`
    + Sx(1, `<div class="bx cy" style="width:600px;height:400px"><h3>Device A draws</h3>${lst(['clash_a', 'clash_b', 'clash_c'])}</div>`) + Sx(3, `<div class="big or" style="width:480px;text-align:center">SAME<br>NUMBERS</div>`) + Sx(2, `<div class="bx cy" style="width:600px;height:400px"><h3>Device B draws</h3>${lst(['clash_a', 'clash_b', 'clash_c'])}</div>`) + `</div>`, 'source: numbering check log, plain-sequence control') };
  // ---- 6 feature
  C.feature = { n: 4, html: page(hd('…TURNED INTO A FEATURE', 'The number says where it was made', 'Organisation – station – running count; the count never leaves the station', '') + `<div class="row">`
    + Sx(1, `<div class="bx gd" style="width:830px;height:400px"><h3>One station, four documents</h3>${['order', 'invoice', 'shipment', 'payment'].map(k => `<div class="mono" style="margin-top:12px;font-size:30px"><span class="mut">${k}</span> &nbsp; ${V('d9_' + k)}</div>`).join('')}</div>`)
    + Sx(2, `<div class="bx gd" style="width:830px;height:400px"><h3>Two stations, offline</h3><div class="big gdc" style="margin-top:20px;font-size:56px">${Fl('d10_none', 'shared numbers: none')}</div><div class="q">across ${V('d10_types')} document types</div></div>`) + `</div>`
    + Sx(3, `<div class="bx or" style="margin-top:22px"><h3>Another station’s number</h3><div class="q mono">${V('forged_doc')} sent by the wrong station: expected prefix ${V('forged_prefix')} · refused on all ${V('forged_devices')} devices</div></div>`), 'source: numbering check log') };
  const lg = V('d20_legacy').split(','), tw = V('d20_twin').split(',');
  C.legacy = { n: lg.length + 1, html: page(hd('THE LEGACY CHECK', 'Same numbers as legacy iDempiere', `${V('d20_pos')} positions compared one by one, side by side`, '') + `<table class="tb"><tr><th>POSITION</th><th>LEGACY iDEMPIERE</th><th>THIS SYSTEM</th><th></th></tr>`
    + lg.map((l, i) => `<tr data-s="${i + 1}"><td>${i + 1}</td><td class="mono">${l}</td><td class="mono">${tw[i]}</td><td><span class="chip ${l === tw[i] ? 'ok' : 'ref'}">${l === tw[i] ? 'EQUAL' : 'DIFFERENT'}</span></td></tr>`).join('') + `</table>`
    + Sx(lg.length + 1, `<div class="take" style="top:560px">On the real page the order is numbered <span class="mono">${V('page_order')}</span> · ${V('page_judged')} page checks judged</div>`), 'source: numbering check log, legacy comparison · real-page sales order check log') };
  // ---- 7 buttons
  const tile = (k, cls, ttl, big, lab) => Sx(k, `<div class="bx ${cls}" style="width:600px;padding:12px 22px"><h3 style="font-size:28px">${ttl}</h3><div class="big ${cls === 'gd' ? 'gdc' : cls === 'am' ? 'amc' : 'cy'}" style="margin-top:0;font-size:46px">${big}</div><div class="q" style="font-size:24px;margin-top:6px">${lab}</div></div>`);
  C.terms = { n: 3, html: page(hd('THE TERMS BUTTON · LIVE', 'Same table, from the last recorded run', '') + `<div class="row">`
    + Sx(1, `<div class="bx cy" style="width:560px;height:380px"><h3>Terms</h3><div class="big cy" style="margin-top:18px">${V('rec_rows')}</div><div class="q">terms listed</div></div>`)
    + Sx(2, `<div class="bx gd" style="width:560px;height:380px"><h3>Enforced</h3><div class="big gdc" style="margin-top:18px">${V('rec_enf')}</div><div class="q">each with a failing control</div></div>`)
    + Sx(3, `<div class="bx am" style="width:560px;height:380px"><h3>Open</h3><div class="big amc" style="margin-top:18px">${V('rec_open')}</div><div class="q">named, never green</div></div>`) + `</div>`, 'source: recorded terms run') };
  C.seatbelt = { n: 4, html: page(hd('THE SEATBELT · LIVE', 'Before you process a document', 'Advice only: it never blocks', '') + `<div class="row">`
    + Sx(1, `<img src="${img('seatbelt_panel.png')}" style="width:1060px;border:2px solid var(--cy);border-radius:10px">`)
    + `<div class="col" style="width:600px;gap:12px">` + tile(2, 'cy', 'Checks', V('sb_rows'), `${V('sb_advise')} advised: ${V('sb_s7')}, ${V('sb_s9')}`) + tile(3, 'cy', 'Its own checks', `${V('sbt_judged')}`, `judged · failed: ${V('sbt_fails')} · broken versions caught: ${V('sbt_mut_k')} of ${V('sbt_mut_t')}`)
    + Sx(4, `<div class="bx am" style="width:600px;padding:12px 22px"><h3 style="font-size:28px">${Fl('sbt_noblock', 'Never blocks')}</h3><div class="q" style="font-size:24px;margin-top:6px">${Fl('sbt_override', 'A document processed under advice is logged')}; ${V('sb_went_ahead')}</div></div>`) + `</div></div>`, 'source: real page capture · Seatbelt check logs') };
  C.searchkey = { n: 4, html: page(hd('…AND THE DEMO STATION, FIXED', 'Every station user now has a Search Key', 'The key comes from legacy iDempiere’s own rule', '') + `<div class="row">`
    + Sx(1, `<div class="bx or" style="width:830px;height:330px"><h3>Before</h3><div class="big or mono" style="font-size:52px;margin-top:20px">${V('sk_before_doc')}</div><div class="q">an empty name in the number</div><div class="sb">users without a Search Key: ${V('sk_users_before')}</div></div>`)
    + Sx(2, `<div class="bx gd" style="width:830px;height:330px"><h3>Now</h3><div class="big gdc mono" style="font-size:52px;margin-top:20px">${V('page_order')}</div><div class="q">the station’s own name</div><div class="sb">users without a Search Key: ${V('sk_users_after')}</div></div>`) + `</div>`
    + Sx(3, `<div class="bx cy" style="margin-top:22px;width:1728px"><div class="q">Rule: ${V('sk_legacy_rule')} · ${V('sk_gardenad')} matches the legacy pilot · ${V('sk_legacy_users')} users identical on both sides</div></div>`)
    + Sx(4, `<div class="bx cy" style="margin-top:18px;width:1728px"><div class="q">Office teams may bind a device to its User at approval: ${V('bind_optional')}</div></div>`), 'source: numbering check log · real-page sales order check logs · approval check log') };
  // ---- 8 not promised (NO green anywhere on this card or the next)
  C.notpromised = { n: 4, html: page(hd('WHAT IS NOT PROMISED', 'Open terms, named', '', 'am') + `<div class="row">`
    + Sx(1, `<div class="bx am" style="width:560px;height:480px"><h3>${V('open0_term')}</h3><span class="chip open" style="margin-top:12px">OPEN</span><div class="q">${V('open0_what')}</div><div class="q mono" style="font-size:28px;margin-top:14px">first download<br>${V('n10')} stations: ${V('kb10')} KB<br>${V('n100')} stations: ${V('mb100')} MB<br>${V('n1000')} stations: ${V('mb1000')} MB</div><div class="sb">Fix on the roadmap: ${V('open0_fix')}</div></div>`)
    + Sx(2, `<div class="bx am" style="width:560px;height:480px"><h3>${V('open1_term')}</h3><span class="chip open" style="margin-top:12px">OPEN</span><div class="q">${V('open1_what')}</div><div class="sb">Today: ${V('open1_state')}</div></div>`)
    + Sx(3, `<div class="bx am" style="width:560px;height:480px"><h3>${V('open2_term')}</h3><span class="chip open" style="margin-top:12px">OPEN</span><div class="q">${V('open2_what')}</div></div>`) + `</div>`
    + Sx(4, `<div class="take" style="top:780px;color:var(--ye);font-size:27px">Also: ${V('visit_only_engine')} Visit terms are judged by the engine only, not yet on a real page · ${V('dt_inconc')} legacy comparison ran inconclusive · download figures measured on ${Fl('star_limits', 'simulated devices on one machine')}, no network</div>`), 'sources: terms check run · scale measurement logs') };
  C.govern = { n: 3, html: page(hd('WHAT HOLDS', V('gov_name') + ', not a warranty', '', 'am')
    + Sx(1, `<div class="bx am" style="margin-top:30px;width:1728px"><div class="q" style="font-size:36px">They hold for a build whose terms run passes.</div></div>`)
    + Sx(2, `<div class="bx cy" style="margin-top:22px;width:1728px"><div class="q" style="font-size:36px">${V('gov_mit')}. It inherits the objectives ${V('gov_while')}.</div></div>`)
    + Sx(3, `<div class="bx am" style="margin-top:22px;width:1728px"><div class="q" style="font-size:36px">Open terms stay open until their own control exists.</div></div>`), 'source: the project’s governance note') };
  return C;
} };
