// ⚠ DO NOT REMOVE — film "Help that answers" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §11; house style prompts/FILM_NARRATION.md): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu).
// TWO frames: above, the typed question or the page's own § log lines (real lines from out/facts.json and the witness logs); below, the REAL ERP page (out/pages/*.png): the whole page scaled to the band
// on the left, and the help panel cut from the SAME pixels on the right, at the scale that fits, labelled with that scale. The bottom 170 px stay empty for the captions. Nothing is typed in by hand. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const W1 = fs.readFileSync(path.join(OUT, 'witness_field_help_main.log'), 'utf8'), W2 = fs.readFileSync(path.join(OUT, 'witness_help_showcase_main.log'), 'utf8');
const wline = (txt, re) => ((txt.split('\n').find((l) => re.test(l)) || '').trim());
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = (f) => pics[f] || (pics[f] = b64(f));
const TOP = 260, BAR = 30, MT = TOP + BAR, MH = 620, PW = 1080 * MH / 1080 * 1920 / 1080;   // page band: the whole 1920x1080 page scaled to MH tall
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:16px 34px;font-family:'DejaVu Sans Mono',monospace;font-size:23px;line-height:1.4;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:'? ';color:#4ade80} .ans{white-space:pre-wrap;color:#fbbf24;overflow-wrap:anywhere} .good{color:#4ade80} .bad{color:#f87171} .dim{color:#94a3b8;white-space:pre}
.de{color:#7dd3fc;white-space:pre-wrap} .cur{display:inline-block;width:14px;height:26px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.pg{position:absolute;left:30px;top:${MT}px;height:${MH}px;border:1px solid #334155} .crop{position:absolute;top:${MT}px;overflow:hidden;border:3px solid #FF6B78;background:#fff} .crop img{position:absolute}
.lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
const bar = (st) => `<div class="bar">▲ <b>typed</b> into the How To box, and the page's own § log &nbsp;·&nbsp; ▼ <b>the ERP twin</b>, the real page &nbsp;·&nbsp; ${esc(st)}</div>`;
// the lower band: the whole page (scaled), and the panel part [y0,y1) of the SAME png at the scale that fits the band (at most 1.5x)
const lower = (shotName, y0, y1) => {
  const s = F.shots[shotName], png = path.join(OUT, s.file), pageW = Math.round(MH * 1920 / 1080), px = s.rects.panel.x, pw = s.rects.panel.w;
  const CH0 = MH - 40, sc = Math.min(1.5, CH0 / (y1 - y0)), cw = Math.round(pw * sc), ch = Math.round((y1 - y0) * sc), left = 30 + pageW + 40;   // 40 px under the crop for its label, above the captions
  return `<img class="pg" src="${img(png)}"><div class="crop" style="left:${left}px;width:${cw + 6}px;height:${Math.min(CH0, ch) + 6}px"><img src="${img(png)}" style="width:${Math.round(1920 * sc)}px;left:${-Math.round(px * sc)}px;top:${-Math.round(y0 * sc)}px"></div>` +
    `<div class="lab" style="left:${left}px;top:${MT + Math.min(CH0, ch) + 6}px">the help panel, the page's own pixels, ${sc === 1 ? 'at 1x' : (sc > 1 ? 'enlarged ' : 'reduced ') + sc.toFixed(2).replace(/0$/, '') + 'x'}</div>`;
};
const crop = { // each beat's panel part, from the rects shots.js recorded (never placed by hand)
  idle: (r) => [r.tipTitle.y, r.howtoTitle.y + r.howtoTitle.h + 120],
  card: (r) => [r.howtoTitle.y, r.card.y + r.card.h + 8],
  ctx: (r) => [r.ctx.y - 10, r.ctx.y + r.ctx.h + 8],
  tip: (r) => [r.tipTitle.y, r.tooltip.y + 300] };
const band = (name, kind) => { const r = F.shots[name].rects, [a, b] = crop[kind](r); return lower(name, Math.max(0, a), Math.min(1080, b)); };
const frame = (topHtml, lowHtml, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topHtml}${bar(st)}${lowHtml}</body></html>`;
const term = (inner) => `<div class="term">${inner}</div>`;
const termTyped = (cmd, k, done, lines) => term(`<div class="cmd">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}`);
const typed = (cmd, lines, lowBefore, lowAfter, st1, st2) => { const s = [{ html: frame(termTyped(cmd, 0, false, ''), lowBefore, st1), frames: 14 }];
  for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termTyped(cmd, k, false, ''), lowBefore, st1), frames: 2, key: 'k' });
  s.push({ html: frame(termTyped(cmd, cmd.length, false, ''), lowBefore, st1), frames: 8, key: 'r' }); s.push({ html: frame(termTyped(cmd, cmd.length, true, lines), lowAfter, st2), frames: null }); return s; };
const ans = (l) => `<div class="ans">${esc(cut(l, 300))}</div>`, dim = (l) => `<div class="dim">${esc(l)}</div>`, good = (l) => `<div class="ans good">${esc(cut(l, 300))}</div>`;
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:104px;font-weight:700;margin-top:24px} .s{font-size:40px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}
.q{margin:150px 170px 0;font-size:50px;line-height:1.38;font-weight:600} .q .big{color:#FF6B78} .qa{margin:40px 170px 0;font-size:27px;color:#cbd5e1;line-height:1.45} .qs{margin:16px 170px 0;font-size:20px;color:#94a3b8}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`;
const CO = '<span style="color:#FF6B78">', CE = '</span>', cards = {};
cards.cover = [{ html: full('<div class="ch"><div class="k">KERNEL-ERP · HELP</div><div class="t1">Help that ' + CO + 'answers' + CE + '</div><div class="s">Field help, a question box and how-to, inside the window</div><div class="c">The real page, headless · English</div></div>'), frames: null }];
{ const Q = F.quote; cards.quote = [{ html: full('<div class="q">“' + esc(Q.text).replace(esc(Q.stat), '<span class="big">' + esc(Q.stat) + '</span>') + '”</div><div class="qa">' + esc(Q.who) + '<br><i>' + esc(Q.title) + '</i>, ' + esc(Q.date) + '</div><div class="qs">' + esc(Q.url) + ' · copy fetched ' + esc(Q.fetched) + ' (web.archive.org)</div>'), frames: null }]; }
cards.before = [{ html: frame(term(dim('before (#3126), erp/idempiere.html:' + F.oldTooltip.line + ' at ' + F.oldTooltip.commit + ':') + `<div class="ans bad">${esc(F.oldTooltip.text)}</div>` + dim('now: the field\'s own Description, as legacy (WEditor.java:333) — the column · type goes to the log only:') + ans(F.lines.fieldFocus) + good(wline(W1, /F4 description = AD_Field_v\.description/))),
  band('field_en', 'tip'), 'click into Document No: the Tool Tip panel'), frames: null }];
cards.ask1 = typed(F.ask1.q, ans(F.ask1.line), band('idle', 'idle'), band('ask_close', 'card'), 'nothing focused yet', 'the answer card, from the dictionary');
cards.link = [{ html: frame(term(ans(F.link.link) + ans(F.link.opened) + ans(F.link.ctx) + good(wline(W2, /S5 every how-to row/))), band('link_open', 'ctx'), 'the card\'s link opened Sales Order: its how-to, from the guide'), frames: null }];
cards.ask2 = typed(F.ask2.q, ans(F.ask2.line), band('link_open', 'ctx'), band('ask_void', 'card'), 'Sales Order open', 'the answer card for a payment');
{ const de = F.de.field.panel.split('\n').filter(Boolean);
  cards.german = [{ html: frame(term(ans(F.de.pack) + `<div class="de">Deutsch: ${esc(de[1])}</div><div class="dim">English original (the dictionary): ${esc(F.docNoEnglish)}</div>` + ans(F.lines.fieldFocusDe) + good(wline(W2, /S2 de_DE Tool Tip panel/))),
    band('field_de', 'tip'), 'Deutsch chosen: the same field'), frames: null }]; }
{ const PA = require('./priorart.json'), M = F.memory, kb = (b) => (b / 1024).toFixed(0) + ' KB', P = F.packs, C = F.credentials;
  const css = `<style>.lc{margin:44px 60px 0} .lc h1{font-size:46px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:470px 760px 500px;gap:40px;margin-top:24px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.33;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:186px;font-size:17px;color:#94a3b8;width:1800px}</style>`;
  const sign = M.deltaBytes >= 0 ? '+' : '−';
  const mem = ['<b>Heap, German session</b> (forced GC, one run each)<br>with the help pack ' + (M.withPack.used / 1048576).toFixed(1) + ' MB · without ' + (M.without.used / 1048576).toFixed(1) + ' MB · <i>' + sign + kb(Math.abs(M.deltaBytes)) + '</i>',
    '<b>Help pack, fetched once per language</b><br>de ' + kb(P.de_DE.bytes) + ' · fr ' + kb(P.fr_FR.bytes) + ' · zh ' + kb(P.zh_CN.bytes) + ' · ja ' + kb(P.ja_JP.bytes) + ' · how-to ' + kb(P.en_US.bytes),
    '<b>Fields with a translation</b><br>de ' + P.de_DE.fields + ' · fr ' + P.fr_FR.fields + ' · zh ' + P.zh_CN.fields + ' · ja ' + P.ja_JP.fields, '<b>Never in the seed</b><br>a separate file, only the chosen language'];
  const pa = PA.items.map((i) => '<b>' + esc(i.name) + '</b><br>' + esc(i.does) + '<br><i>→ ' + esc(i.took) + '</i>');
  const cred = ['<b>' + esc(C.repo) + '</b><br>' + esc(C.licence), '<b>This feature</b><br>#3126 field help · #3128 the help pack, search, how-to (merged)', '<b>Witnessed on main ' + esc(F.tree) + '</b><br>' + esc(F.verdicts.fieldHelp) + '<br>' + esc(F.verdicts.showcase),
    '<b>ERP User Guide</b><br>red1oon.github.io/BIMCompiler/ERPUserGuide/', '<b>Paper</b>: Deterministic Spatial Compilation<br>priority date ' + esc(C.paperPriority) + ' · red1oon.github.io/BIMCompiler/SpatialCompilationPaper/'];
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map((r) => '<div class="r">' + r + '</div>').join('') + '</div>';
  cards.close = [{ html: full(css + '<div class="lc"><h1>What it costs, ' + CO + 'what we learned' + CE + ', who stands behind it</h1><div class="cols">' + col('cost, measured', mem) + col('prior art: the lesson', pa) + col('project credentials', cred) +
    '</div><div class="cr">Opening quote: McKinsey Global Institute, <i>The social economy</i>, July 2012 · German text: the published de_DE pack (Team Germany), unchanged · Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real ERP page, headless on the CPU</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map((b) => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc'), q = document.querySelector('.qs'), lab = document.querySelector('.lab'); const imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .q, .qa, .lab')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);
          const low = Math.max(lc ? lc.getBoundingClientRect().bottom : 0, q ? q.getBoundingClientRect().bottom : 0, lab ? lab.getBoundingClientRect().bottom : 0) - (1080 - 170);   // the caption area stays empty
          return { why: { term: t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: Math.round(low), wide: Math.round(wide) }, over: Math.max(t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low, wide), loaded: imgs.every((i) => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); if (m.over > 0) console.log('§CARD_OVER ' + name + ' ' + JSON.stringify(m.why)); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, Math.round(worst)) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch((e) => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
