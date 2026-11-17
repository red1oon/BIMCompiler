// ⚠ DO NOT REMOVE — film "When AI Dies" (prompts/FILM_WHEN_AI_DIES.md): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). TWO frames: above (250 px) the typed strip (a line TYPED char by char with its answer lines), or a band
// of the REAL VS Code; below (630 px) a band of the REAL VS Code (the stills shoot.sh took, scaled 4/3, nothing drawn) or of the REAL ERP page (pages/erp_hover.png, 1:1). The bottom 170 px stay empty for the captions.
// Every line, picture and number is read from out/ through facts_view.js; the sentences come from i18n.js. Overflow is MEASURED (TOO-TALL fails the build). READ the log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const FV = require('./facts_view.js'), { t } = require('./i18n.js'), N = require('./narr.js'), PA = require('./priorart.json');
const BASE = FV.BASE, out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const { F, S, v, ERP } = FV;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const pics = {}, img = f => pics[f] || (pics[f] = 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
const { TOP, BAR, MH, SC, CROP, TOPCROP } = require('./layout.js'), MT = TOP + BAR, LANG = process.env.FILM_LANG || 'en';
const FONT = LANG === 'th' ? "'Noto Sans Thai','DejaVu Sans',sans-serif" : LANG === 'zh' ? "'DejaVu Sans','Noto Sans CJK SC',sans-serif" : "'DejaVu Sans',sans-serif";
// where each VS Code still is cut (source px from the top of the 1440x900 window; band = 630/SC = 472 px; the top band 250/SC = 188 px). Chosen from the stills' own geometry; guard.js checks each band lies inside the picture.
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:${FONT};overflow:hidden}
.top{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;overflow:hidden;background:#1e1e1e} .top img{position:absolute;left:0;width:1920px}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:14px 34px;font-family:'DejaVu Sans Mono','Noto Sans Thai','Noto Sans CJK SC',monospace;font-size:27px;line-height:1.42;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:'$ ';color:#4ade80} .ans{white-space:pre;color:#fbbf24} .dim{white-space:pre;color:#94a3b8} .good{color:#4ade80;font-weight:700}
.cur{display:inline-block;width:15px;height:27px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px;white-space:nowrap;overflow:hidden} .bar b{color:#7dd3fc}
.mod{position:absolute;left:0;top:${MT}px;width:1920px;height:${MH}px;overflow:hidden;background:#000} .mod img{position:absolute;left:0}
.lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
const bar = (st, erp) => `<div class="bar">▲ <b>${esc(t('bar.top'))}</b> &nbsp;·&nbsp; ▼ <b>${esc(t(erp ? 'bar.erp' : 'bar.bottom'))}</b> &nbsp;·&nbsp; ${esc(st)}</div>`;
const vsBottom = name => `<div class="mod"><img src="${img(path.join(BASE, 'stills', name + '.png'))}" style="top:${-Math.round(CROP[name] * SC)}px;width:1920px"></div>`;
const vsTop = name => `<div class="top"><img src="${img(path.join(BASE, 'stills', name + '.png'))}" style="top:${-Math.round(TOPCROP[name] * SC)}px"></div>`;
const tip = ERP.tip, EB = require('./layout.js').erpBand(tip), ZE = EB.zoom, x0E = EB.x0, y0E = EB.y0;
const erpBottom = () => `<div class="mod"><img src="${img(path.join(BASE, 'pages', 'erp_hover.png'))}" style="left:${-Math.round(x0E * ZE)}px;top:${-Math.round(y0E * ZE)}px;width:${1920 * ZE}px"><div class="lab" style="left:${Math.round((tip.x + tip.w - x0E) * ZE + 12)}px;top:${Math.round((tip.y - y0E) * ZE)}px">${esc(ERP.table + '.' + ERP.column)}</div></div>`;
const frame = (top, bottom, st, erp) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${top}${bar(st, erp)}${bottom}</body></html>`;
const termHtml = (cmd, k, done, lines) => `<div class="term"><div class="cmd">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}</div>`;
const ans = x => '<div class="ans">' + esc(cut(x, 100)) + '</div>', dim = x => '<div class="dim">' + esc(cut(x, 100)) + '</div>';
const typed = (cmd, lines, bottom, st1, st2, erp) => { const s = [{ html: frame(termHtml(cmd, 0, false, ''), bottom, st1, erp), frames: 14 }];
  for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termHtml(cmd, k, false, ''), bottom, st1, erp), frames: 1, key: 'k' });
  s.push({ html: frame(termHtml(cmd, cmd.length, false, ''), bottom, st1, erp), frames: 8, key: 'r' }); s.push({ html: frame(termHtml(cmd, cmd.length, true, lines), bottom, st2, erp), frames: null }); return s; };
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONT};overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:84px;font-weight:700;margin-top:24px;line-height:1.15} .s{font-size:40px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}`;
const full = (inner, extra) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}${extra || ''}</style></head><body>${inner}</body></html>`;
const CO = '<span style="color:#FF6B78">', CE = '</span>', cards = {}, shots = F.witness;
const tri = (b, ok) => b + (ok ? '' : '');
cards.cover = [{ html: full('<div class="ch"><div class="k">' + esc(t('cover.kicker')) + '</div><div class="t1">' + esc(t('cover.t1')) + '<br>' + CO + esc(t('cover.t2')) + CE + '</div><div class="c">' + esc(t('cover.line')) + '</div></div>'), frames: null }];
{ const b = vsBottom('before'); cards.before = typed(t('cmd.before'), ans(t('a.before.set', { v: v('ai.setting') })) + dim(t('a.before.ext', { n: v('ext.count') })) + dim(S.before.non_builtin_extensions.join(', ')), b, t('st.before'), t('st.before')); }
{ const b = vsBottom('q1_refs'); cards.q1 = typed(t('cmd.q1'), ans(t('a.q1.key', { places: v('refs.places'), files: v('refs.files') })) + dim(t('a.q1.def', { n: v('refs.builtin_defs') })) + dim(F.witness.refs.line), b, t('st.q1'), t('st.q1')); }
{ const b = erpBottom(), lines = ans(t('a.q2.hover', { field: ERP.table + '.' + ERP.column, layers: v('erp.layers') })) + ans(t('a.q2.key', { key: ERP.keyPressed, at: ERP.pickedAt })) + dim('W-ERP-HOVER  E2 fields=' + v('erp.fields') + ' wrong_line=' + v('erp.wrong_line') + '  ·  E4 keys=' + v('erp.keys') + ' wrong_or_dead=' + v('erp.keys_bad'));
  const s = typed(t('cmd.q2'), lines, b, t('st.q2a'), t('st.q2a'), true); s.push({ html: frame(vsTop('q2_line'), b, t('st.q2b'), true), frames: null }); cards.q2 = s; }
{ const b = vsBottom('q3_hover'); cards.q3 = typed(t('cmd.q3'), ans(t('a.q3.val')) + dim(cut(S.q3.last_value_line.replace(/`/g, '').replace(/^last value: /, ''), 100)) + dim(S.q3.lens[0] || ''), b, t('st.q3'), t('st.q3')); }
{ const b = vsBottom('q4_warn'); cards.q4 = typed(t('cmd.q4'), ans(t('a.q4.warn', { file: S.q4.file, line: S.q4.line, code: S.q4.code })) + dim(t('a.q4.why')) + dim(F.witness.core_pure.line), b, t('st.q4'), t('st.q4')); }
{ const s = typed(t('cmd.q5'), dim(t('a.q5.idle')), vsBottom('q5_idle'), t('st.q5a'), t('st.q5a')); s.pop();
  s.push({ html: frame(termHtml(t('cmd.q5'), t('cmd.q5').length, true, ans(t('a.q5.chk'))), vsBottom('q5_checking'), t('st.q5b')), frames: null });
  s.push({ html: frame(termHtml(t('cmd.q5'), t('cmd.q5').length, true, S.q5r.lines.slice(1, 4).map(l => dim(l.replace(/^§/, ''))).join('') + ans(t('a.q5.ready'))), vsBottom('q5_ready'), t('st.q5c')), frames: null });
  s.push({ html: frame(vsTop('q5_written'), vsBottom('q5_written'), t('st.q5d')), frames: null }); cards.q5 = s; }
{ const css = `.lc{margin:44px 60px 0} .lc h1{font-size:50px;line-height:1.2} .lc h1 span{color:#FF6B78} .lc .sub{font-size:26px;color:#cbd5e1;margin-top:10px} .pf{margin-top:24px;font-size:26px;color:#7dd3fc} .tb{margin-top:12px;width:1800px;border-collapse:collapse;font-size:25px} .tb td{padding:6px 12px;border-top:1px solid #334155;vertical-align:top} .tb .n{color:#4ade80;font-weight:700;white-space:nowrap} .tb .d{color:#fbbf24;font-family:'DejaVu Sans Mono',monospace;font-size:21px} .ft{margin-top:14px;font-size:22px;color:#94a3b8;line-height:1.4}`;
  const css2 = LANG !== 'en' ? '.lc h1{font-size:44px} .tb{font-size:21px} .tb td{padding:4px 12px} .ft{font-size:19px;margin-top:8px} .lc .sub{font-size:22px} .pf{font-size:22px;margin-top:14px}' : '';
  const fk = f => t('feat.' + f.replace(/[^a-z0-9]+/gi, '_').toLowerCase()), O = FV.OFF, row = (f, doors) => '<tr><td>' + esc(f.split(' · ').map(fk).join(' · ')) + '</td><td class="n">' + esc(t('why.doors', { n: String(doors.length) })) + '</td><td class="d">' + esc(doors.join('  ·  ')) + '</td></tr>';
  const und = O.understanding.map(f => row(f, O.traced[f].doors)).join(''), shp = (() => { const g = {}; Object.keys(O.shipDoors).forEach(f => { const k = JSON.stringify(Array.from(new Set(O.shipDoors[f].map(d => d.replace(/^lib\//, ''))))); (g[k] = g[k] || []).push(f); }); return Object.keys(g).map(k => row(g[k].join(' · '), JSON.parse(k))); })()
  const body = '<div class="lc"><h1>' + esc(t('why.h1')) + '</h1><div class="sub">' + esc(t('why.sub')) + '</div><div class="pf">' + esc(t('why.proof')) + '</div><table class="tb"><tr><td colspan="3" class="dim" style="color:#94a3b8">' + esc(t('why.und')) + '</td></tr>' + und + '<tr><td colspan="3" style="color:#94a3b8;padding-top:14px">' + esc(t('why.ship')) + '</td></tr>' + shp.join('') + '</table>' +
    '<div class="ft">' + esc(F.offline.line.replace(/^§/, '')) + '<br>' + esc(t('why.red')) + '<br>' + esc(F.witness.isolation.line.replace(/^§/, '')) + ' · ' + esc(t('why.iso')) + '<br>"chat.disableAIFeatures": true · ' + esc(t('why.setting')) + '</div></div>';
  cards.why = [{ html: full(body, css + css2), frames: null }]; }
cards.passenger = typed(t('cmd.passenger'), ans(t('a.pass.cmd')) + ans(t('a.pass.res', { n: v('ctx.lines') })) + dim(t('a.pass.note')), vsBottom('passenger'), t('st.passenger'), t('st.passenger'));
{ const css = `.rm{margin:120px 160px 0} .rm .k{font-size:34px;color:#FF6B78;letter-spacing:6px} .rm h1{font-size:84px;margin-top:20px} .rm .r{display:flex;gap:40px;margin-top:34px;font-size:38px;line-height:1.3} .rm .r b{color:#FF6B78;min-width:90px} .rm .f{margin-top:70px;font-size:26px;color:#94a3b8}`;
  cards.roadmap = [{ html: full('<div class="rm"><div class="k">' + esc(t('rm.kicker')) + '</div><h1>' + esc(t('rm.title')) + '</h1>' + N.ROADMAP.map(([id]) => '<div class="r"><b>' + esc(id) + '</b><span>' + esc(t('rm.' + id)) + '</span></div>').join('') + '<div class="f">' + esc(t('rm.foot')) + '</div></div>', css), frames: null }]; }
{ const css = `.lc{margin:40px 60px 0} .lc h1{font-size:50px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:620px 680px 480px;gap:34px;margin-top:22px}
    .col h2{font-size:22px;color:#94a3b8;letter-spacing:2px;margin-bottom:10px} .r{font-size:25px;line-height:1.3;padding:8px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal} .cr{position:absolute;left:60px;bottom:182px;font-size:18px;color:#94a3b8;width:1800px}`;
  const pa = PA.items.map((i, k) => '<b>' + esc(i.name) + '</b><br>' + esc(t('pa.' + k + '.does')) + '<br><i>→ ' + esc(t('pa.' + k + '.took')) + '</i>');
  const prs = Object.keys(F.prs).map(n => '#' + n + ' ' + t('pr.' + n)).join(' · ');
  const W = F.witness;
  const cred = ['<b>github.com/red1oon/bim-ootb</b> · ' + esc(F.licence), '<b>' + esc(t('cl.pr', { list: prs })) + '</b>',
    '<b>' + esc(t('cl.wit')) + '</b><br>W-X0-REFS ' + W.refs.verdict + ' · W-ERP-HOVER ' + W.erp_hover.verdict + ' · W-X0-LENS ' + W.lens.verdict + '<br>W-X0-CORE-PURE ' + W.core_pure.verdict + ' · W-X0-BUMP-BUTTON ' + W.bump_button.verdict + '<br>W-BUMP-PARITY ' + W.bump_parity.verdict + ' · W-X0-CONTEXT ' + W.context.verdict + '<br>W-X0-REALVSC ' + W.realvsc.verdict + ' · W-X0-ISOLATION ' + W.isolation.verdict + ' · X0_OFFLINE ' + F.offline.verdict,
    '<b>' + esc(t('cl.limit')) + '</b><br>' + esc(t('cl.limit1')) + '<br>' + esc(t('cl.limit2'))];
  const guide = ['<b>' + esc(t('cl.guide')) + '</b><br>red1oon.github.io/BIMCompiler/DeveloperGuide/<br>#41-x0-navigator-the-repos-own-vs-code-extension', esc(t('cl.guide2')), (t('cl.tr') ? esc(t('cl.tr')) : 'github.com/red1oon/bim-ootb · MIT')];
  const col = (h, rows) => '<div class="col"><h2>' + esc(h) + '</h2>' + rows.map(r => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full('<div class="lc"><h1>' + CO + esc(t('cl.h1a')) + CE + ' ' + esc(t('cl.h1b')) + '</h1><div class="cols">' + col(t('cl.col1'), pa) + col(t('cl.col2'), cred) + col(t('cl.col3'), guide) + '</div><div class="cr">' + esc(t('cl.keys')) + '</div></div>', css + (LANG === 'zh' ? ' .lc{margin:84px 60px 0}' : '')), frames: null }]; }   // zh: the fitter's own voice-credit caption sits in the top 70 px of the last card
const order = N.beats.map(b => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc, .rm'), imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .tb td, .ft, .cr, .cmd, .ans, .dim, .bar, .rm .r, .rm h1')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);
          return { over: Math.max(t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, lc ? lc.getBoundingClientRect().bottom - (1080 - 170) : 0, wide), loaded: imgs.every(i => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
