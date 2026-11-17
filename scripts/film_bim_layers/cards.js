// ⚠ DO NOT REMOVE — film 3 "CH 0 · Immersive Software: a body's history" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 3): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). TWO frames:
// above, the REAL VS Code (a band of the stills shoot.sh took), a typed terminal strip showing REAL log lines, or the tooltip's OWN text (the page's textContent) in two columns with one layer lit;
// below, the REAL Modeller page (pages/*.png from facts.js: its own pixels, 1:1, a band that holds the whole tooltip and the cursor). The bottom 170 px stay empty for the captions. Every line, picture and number is read from out/; nothing is typed in by hand. READ THE LOG.
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
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:18px 34px;font-family:'DejaVu Sans Mono',monospace;font-size:25px;line-height:1.45;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:'$ ';color:#4ade80} .ans{white-space:pre;color:#fbbf24} .bad{color:#f87171;font-weight:700} .good{color:#4ade80;font-weight:700} .dim{color:#94a3b8;white-space:pre}
.tt{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:14px 34px;font-family:'DejaVu Sans Mono',monospace;font-size:17px;line-height:1.36;overflow:hidden;border-bottom:2px solid #334155}
.tt .hd{color:#e8eef5;white-space:pre;margin-bottom:6px} .tt .cols{display:grid;grid-template-columns:820px 1000px;gap:32px} .tt .ln{white-space:pre;color:#94a3b8} .tt .lt{white-space:pre;color:#fbbf24;font-weight:700}
.cur{display:inline-block;width:15px;height:27px;background:#4ade80;vertical-align:-5px;margin-left:2px} .tipbig{white-space:pre-wrap;color:#e8eef5;font-size:30px;line-height:1.45}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.mod{position:absolute;left:0;top:${MT}px;width:1920px;height:${MH}px;overflow:hidden;background:#000} .mod img{position:absolute;left:0;width:1920px}
.inset{position:absolute;border:3px solid #FF6B78;overflow:hidden;background:#000} .inset img{position:absolute} .lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
const bar = st => `<div class="bar">▲ <b>VS Code</b> / the tooltip's own text &nbsp;·&nbsp; ▼ <b>the Modeller</b>, the real page, dev overlay loaded by the bookmarklet &nbsp;·&nbsp; ${esc(st)}</div>`;
// the lower band: the page's own pixels, 1:1, around the cursor; the tooltip again at 2x from the same pixels (when there is one)
const modHtml = (png, t) => {
  const cy = t && t.tip && t.tip.h ? t.tip.y + t.tip.h / 2 : (t && t.point ? t.point.y : 540), y0 = Math.max(0, Math.min(1080 - MH, Math.round(cy - MH / 2)));
  let h = `<div class="mod"><img class="pg" src="${img(path.join(OUT, png))}" style="top:${-y0}px">`;
  if (t && t.tip && t.tip.w) { const lx = t.tip.x + t.tip.w + 12 < 1700 ? t.tip.x + t.tip.w + 12 : Math.max(8, t.tip.x - 230), ly = Math.max(6, t.tip.y - y0);
    h += `<div class="lab" style="left:${Math.round(lx)}px;top:${Math.round(ly)}px">the real tooltip, 1:1</div>`; }
  return h + '</div>'; };
const frame = (topHtml, png, t, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topHtml}${bar(st)}${modHtml(png, t)}</body></html>`;
const vsc = still => `<div class="top"><img class="v" src="${img(path.join(OUT, 'stills', still + '.png'))}" style="top:${-Math.round(300 * SC)}px"></div>`;   // the line is centred (revealRange InCenter): the band around it
const termHtml = (cmd, k, done, lines) => `<div class="term"><div class="cmd">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}</div>`;
// the tooltip's own text (textContent), the title line across, the layers in two columns (1-3 | 4-6 + the key line); the lines of layer `lit` in amber
const tipTop = (t, lit) => { const ls = String(t.text).split('\n'), head = ls[0], rest = ls.slice(1), i4 = rest.findIndex(l => /^4 /.test(l)); let cur = 0;
  const row = l => { const m = /^(\d) /.exec(l); if (m) cur = +m[1]; return '<div class="' + (cur === lit && !/^1-6 /.test(l) ? 'lt' : 'ln') + '">' + esc(l) + '</div>'; };
  const A = rest.slice(0, i4).map(row).join(''), B = rest.slice(i4).map(row).join('');
  return `<div class="tt"><div class="hd">${esc(cut(head, 140))}</div><div class="cols"><div>${A}</div><div>${B}</div></div></div>`; };
const typed = (cmd, lines, png, t, st1, st2) => { const s = [{ html: frame(termHtml(cmd, 0, false, ''), png, t, st1), frames: 14 }];
  for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termHtml(cmd, k, false, ''), png, t, st1), frames: 1, key: 'k' });
  s.push({ html: frame(termHtml(cmd, cmd.length, false, ''), png, t, st1), frames: 8, key: 'r' }); s.push({ html: frame(termHtml(cmd, cmd.length, true, lines), png, t, st2), frames: null }); return s; };
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:104px;font-weight:700;margin-top:24px} .s{font-size:40px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}`;
const full = inner => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`;
const CO = '<span style="color:#FF6B78">', CE = '</span>', T = F.targets, cards = {};
cards.cover = [{ html: full('<div class="ch"><div class="k">CH 0</div><div class="t1">Immersive ' + CO + 'Software' + CE + '</div><div class="s">A body\'s history, in one hover</div><div class="c">Sovereignty begins with visibility in a single window · the Modeller · English</div></div>'), frames: null }];
{ const ans = '<div class="ans">' + esc(cut(F.index.line, 110)) + '</div><div class="dim"> </div><div class="dim">then, in the Modeller tab, the bookmark:</div><div class="dim">javascript:(function(){ … /devtools/hover/dxf_hover.js … })()</div><div class="ans">' + esc(cut(F.page.installedLine, 110)) + '</div>';
  cards.setup = typed(F.index.cmd, ans, F.page.converted, null, 'the shed drawings, converted', 'the overlay is on in this tab only'); }
cards.move1 = [{ html: frame(tipTop(T.col, 3), 'pages/new_col.png', T.col, 'hover a column: six layers; 3 = its sizes'), frames: null },
               { html: frame(vsc('v_col'), 'pages/new_col.png', T.col, 'key 3: the editor opens the default row the top came from'), frames: null }];
cards.move2 = [{ html: frame(tipTop(T.wall, 4), 'pages/new_wall.png', T.wall, 'hover the north wall: 4 = its cuts'), frames: null },
               { html: frame(vsc('v_wall'), 'pages/new_wall.png', T.wall, 'key 1: the line that joined the two drawn pieces'), frames: null }];
{ const W = F.witness, ln = x => '<div class="ans">' + esc(cut(x.replace(/^§/, ''), 118)) + '</div>';
  const lines = ln(W.l3) + ln(W.l3def) + '<div class="dim"> </div>' + ln(W.blVerdict).replace('VERDICT PASS', 'VERDICT <span class="good">PASS</span>');
  const s3 = typed('node devtools/hover/tests/witness_bim_layers.js', lines, 'pages/new_bar.png', T.bar, 'a truss bar', 'the witness over every body of the shed');
  s3.push({ html: frame(tipTop(T.bar, 3), 'pages/new_bar.png', T.bar, 'its width: a default, which one not recorded; key 3 opens nothing'), frames: null }); cards.move3 = s3; }
{ const M = F.memory, mb = b => (b / 1048576).toFixed(1) + ' MB', kb = b => (b / 1024).toFixed(1) + ' KB', PA = require('./priorart.json'), C = F.credentials;
  const d = M.deltaBytes, sign = d >= 0 ? '+' : '−';
  const css = `<style>.lc{margin:44px 60px 0} .lc h1{font-size:48px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:500px 700px 520px;gap:40px;margin-top:26px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px} .r{font-size:23px;line-height:1.35;padding:8px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:190px;font-size:18px;color:#94a3b8}</style>`;
  const mem = ['<b>Heap after Convert</b> (forced GC, one run each)<br>with the tool ' + mb(M.withOverlay.used) + ' · without ' + mb(M.without.used) + ' · <i>' + sign + mb(Math.abs(d)) + '</i>',
    '<b>The trace</b><br>' + M.withOverlay.traceEntries + ' entries, ' + kb(M.withOverlay.traceJsonBytes) + ' as JSON', '<b>Files</b><br>overlay ' + kb(M.overlayBytes) + ' · index ' + kb(M.indexBytes),
    '<b>Not shown on the page</b><br>layer 5, edits after Convert: this film makes no edit (W-BIM-LAYERS L5 checks it in Node)'];
  const pa = PA.items.map(i => '<b>' + esc(i.name) + '</b><br>' + esc(i.does) + '<br><i>→ ' + esc(i.took) + '</i>');
  const cred = ['<b>' + esc(C.repo) + '</b><br>' + esc(C.licence), '<b>This feature</b><br>#3043 the trace · #3047 the hover · #3064 the layers (merged)', '<b>Witnessed on main</b><br>' + esc(F.witness.blVerdict.replace('§', '')) + '<br>' + esc(F.witness.dhVerdict.replace('§', '')),
    '<b>Developer Guide</b><br>red1oon.github.io/BIMCompiler/DeveloperGuide/', '<b>Paper</b>: Deterministic Spatial Compilation<br>priority date ' + esc(C.paperPriority) + ' · red1oon.github.io/BIMCompiler/SpatialCompilationPaper/'];
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map(r => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full(css + '<div class="lc"><h1>What it costs, ' + CO + 'what we learned' + CE + ', who stands behind it</h1><div class="cols">' + col('cost in memory, measured', mem) + col('prior art: the lesson', pa) + col('project credentials', cred) +
    '</div><div class="cr">Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real VS Code and the real Modeller, headless on the CPU</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map(b => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term') || document.querySelector('.tt'), lc = document.querySelector('.lc'); const imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .tt .ln, .tt .lt, .tt .hd')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);   // nothing may run off the right edge (v1 of the last card did)
          return { over: Math.max(t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, lc ? lc.getBoundingClientRect().bottom - (1080 - 170) : 0, wide), loaded: imgs.every(i => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
