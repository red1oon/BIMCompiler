// ⚠ DO NOT REMOVE — film 2 "CH 0 · Immersive Software: the ERP field" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 2): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). TWO frames:
// above, the REAL VS Code (a band of the stills shoot.sh took) or a typed terminal strip with REAL log lines / the overlay's own tooltip text; below, the REAL ERP page (pages/*.png from facts.js: its
// own pixels, a 1:1 band around the cursor, plus the tooltip again from the same pixels, scaled to fit and labelled). The bottom 170 px stay empty for the captions. Nothing is typed by hand. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = f => pics[f] || (pics[f] = b64(f));
const TOP = 400, BAR = 30, MT = TOP + BAR, MH = 480, SC = 1920 / 1440;
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden}
.top{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;overflow:hidden;background:#1e1e1e} .top img{position:absolute;left:0;width:1920px}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:16px 34px;font-family:'DejaVu Sans Mono',monospace;font-size:24px;line-height:1.42;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:'$ ';color:#4ade80} .ans{white-space:pre;color:#fbbf24} .bad{color:#f87171;font-weight:700} .good{color:#4ade80;font-weight:700} .dim{color:#94a3b8;white-space:pre}
.cur{display:inline-block;width:15px;height:26px;background:#4ade80;vertical-align:-5px;margin-left:2px} .tipbig{white-space:pre;color:#e8eef5;font-size:19px;line-height:1.32}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.mod{position:absolute;left:0;top:${MT}px;width:1920px;height:${MH}px;overflow:hidden;background:#000} .mod img{position:absolute;left:0;width:1920px}
.inset{position:absolute;border:3px solid #FF6B78;overflow:hidden;background:#000} .inset img{position:absolute} .lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
const bar = st => `<div class="bar">▲ <b>VS Code</b> (the real editor) &nbsp;·&nbsp; ▼ <b>the ERP</b>, the real page, dev overlay loaded by the bookmarklet &nbsp;·&nbsp; ${esc(st)}</div>`;
// the lower band: the page's own pixels around the cursor; the tooltip again from the same pixels, as large as fits (labelled with its scale)
const modHtml = (png, t) => {
  const cy = t && t.point ? t.point.y : 540, y0 = Math.max(0, Math.min(1080 - MH, Math.round(cy - 120)));
  let h = `<div class="mod"><img class="pg" src="${img(path.join(OUT, png))}" style="top:${-y0}px">`;
  if (t && t.tip && t.tip.w) { const Z = Math.min(2, (MH - 60) / t.tip.h, 1100 / t.tip.w), w = Math.round(t.tip.w * Z), hh = Math.round(t.tip.h * Z), left = 1920 - w - 30, top = 12;
    h += `<div class="inset" style="left:${left}px;top:${top}px;width:${w + 6}px;height:${hh + 6}px"><img src="${img(path.join(OUT, png))}" style="width:${Math.round(1920 * Z)}px;left:${-Math.round(t.tip.x * Z)}px;top:${-Math.round(t.tip.y * Z)}px"></div>` +
      `<div class="lab" style="left:${left}px;top:${top + hh + 10}px">the tooltip, ${Z.toFixed(1)}x</div>`; }
  return h + '</div>'; };
const frame = (topHtml, png, t, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topHtml}${bar(st)}${modHtml(png, t)}</body></html>`;
const vsc = still => `<div class="top"><img class="v" src="${img(path.join(OUT, 'stills', still + '.png'))}" style="top:${-Math.round(300 * SC)}px"></div>`;
const termHtml = (cmd, k, done, lines) => `<div class="term"><div class="cmd">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}</div>`;
const tipTop = (label, text) => `<div class="term"><div class="dim">${esc(label)}</div><div class="tipbig">${esc(text.split('\n').slice(0, 12).map(l => cut(l, 150)).join('\n'))}${text.split('\n').length > 12 ? '\n   …' : ''}</div></div>`;
const typed = (cmd, lines, png, t, st1, st2) => { const s = [{ html: frame(termHtml(cmd, 0, false, ''), png, t, st1), frames: 14 }];
  for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termHtml(cmd, k, false, ''), png, t, st1), frames: 1, key: 'k' });
  s.push({ html: frame(termHtml(cmd, cmd.length, false, ''), png, t, st1), frames: 8, key: 'r' }); s.push({ html: frame(termHtml(cmd, cmd.length, true, lines), png, t, st2), frames: null }); return s; };
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:104px;font-weight:700;margin-top:24px} .s{font-size:40px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}`;
const full = inner => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`;
const CO = '<span style="color:#FF6B78">', CE = '</span>', cards = {};
const pageDoc = { point: F.doctype.point, tip: F.doctype.tip }, pageNew = { point: F.dateNew.point, tip: F.dateNew.tip }, pageOld = { point: F.dateOld.point, tip: F.dateOld.tip };
cards.cover = [{ html: full('<div class="ch"><div class="k">CH 0</div><div class="t1">Immersive ' + CO + 'Software' + CE + '</div><div class="s">the ERP field: every layer of code at one spot</div><div class="c">Sovereignty begins with visibility in a single window · English</div></div>'), frames: null }];
cards.setup = typed(F.index.cmd, '<div class="ans">' + esc(cut(F.index.line, 120)) + '</div><div class="dim"> </div><div class="dim">then, in the ERP tab, the bookmark:</div><div class="dim">javascript:(function(){ … /devtools/hover/erp_hover.js … })()</div>',
  F.doctype.png, null, 'the Sales Order window, GardenWorld', 'the overlay is on in this tab only');
cards.move1 = [{ html: frame(tipTop('hover Target Document Type: the overlay\'s own text', F.doctype.text), F.doctype.png, pageDoc, 'hover a field: its layers in firing order'), frames: null },
               { html: frame(vsc('v_doctype'), F.doctype.png, pageDoc, 'Alt+1: the editor opens the callout'), frames: null }];
{ const red = '<div class="ans">' + esc(cut(F.red.line.replace(/^§/, ''), 118)).replace('false_unported=' + F.red.falseUnported, '<span class="bad">false_unported=' + F.red.falseUnported + '</span>') + '</div><div class="ans"><span class="bad">FAIL</span> E2b every UNPORTED the hover says agrees with the engine\'s own lookup</div>';
  const s = typed('node devtools/hover/tests/witness_erp_hover.js', red, F.dateOld.png, pageOld, 'v1 of the overlay (#3055): Date Ordered', 'the test, run against v1');
  s.push({ html: frame(vsc('v_date'), F.dateNew.png, pageNew, 'fixed (#3057): the engine\'s own answer; Alt+1 opens it'), frames: null });
  s.push({ html: frame('<div class="term"><div class="dim">the same test on main, after the fix</div><div class="ans">ERP_HOVER_W E2b <span class="good">false_unported=' + F.fix.falseUnported + '</span></div><div class="ans">' + esc(cut(F.fix.e2line.replace(/^§/, ''), 118)) + '</div><div class="ans">' + esc(F.fix.verdict.replace(/^§/, '')) + '</div></div>', F.dateNew.png, pageNew, 'what is really missing is still said: UNPORTED, never a guessed file'), frames: null });
  cards.move2 = s; }
{ const M = F.memory, mb = b => (b / 1048576).toFixed(1) + ' MB', kb = b => (b / 1024).toFixed(1) + ' KB', PA = require('./priorart.json'), C = F.credentials, d = M.deltaBytes, sign = d >= 0 ? '+' : '−';
  const css = `<style>.lc{margin:44px 60px 0} .lc h1{font-size:48px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:500px 700px 520px;gap:40px;margin-top:26px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px} .r{font-size:22px;line-height:1.33;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:190px;font-size:18px;color:#94a3b8}</style>`;
  const mem = ['<b>Heap with the window open</b> (forced GC, one run each)<br>with the tool ' + mb(M.withOverlay.used) + ' · without ' + mb(M.without.used) + ' · <i>' + sign + mb(Math.abs(d)) + '</i>',
    '<b>Files</b><br>overlay ' + kb(M.overlayBytes) + ' · index ' + kb(M.indexBytes) + ' (' + F.index.entries + ' registrations)', '<b>Switched off</b><br>nothing loads: the shipped page never asks for it'];
  const pa = PA.items.map(i => '<b>' + esc(i.name) + '</b><br>' + esc(i.does) + '<br><i>→ ' + esc(i.took) + '</i>');
  const cred = ['<b>' + esc(C.repo) + '</b><br>' + esc(C.licence), '<b>This feature</b><br>' + C.prs.map(p => '#' + p.n).join(' · ') + ' (merged)', '<b>Witnessed on main</b><br>' + esc(F.fix.verdict.replace('§', '')) + '<br>' + F.fix.fields + ' fields · ' + esc(F.fix.keys),
    '<b>Developer Guide</b><br>red1oon.github.io/BIMCompiler/DeveloperGuide/', '<b>Paper</b>: Deterministic Spatial Compilation<br>priority date ' + esc(C.paperPriority) + ' · red1oon.github.io/BIMCompiler/SpatialCompilationPaper/'];
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map(r => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full(css + '<div class="lc"><h1>What it costs, ' + CO + 'what we learned' + CE + ', who stands behind it</h1><div class="cols">' + col('cost in memory, measured', mem) + col('prior art: the lesson', pa) + col('project credentials', cred) +
    '</div><div class="cr">Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real VS Code and the real ERP page, headless on the CPU</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc'), imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .term')).reduce((w, e) => Math.max(w, e.getBoundingClientRect().right - 1920), 0);
          return { over: Math.max(t ? t.scrollHeight - t.clientHeight : 0, lc ? lc.getBoundingClientRect().bottom - (1080 - 170) : 0, wide), loaded: imgs.every(i => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
