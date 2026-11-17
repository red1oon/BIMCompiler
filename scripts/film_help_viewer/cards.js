// ⚠ DO NOT REMOVE — film "Help that answers, in the Viewer" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §17.1; house style prompts/FILM_NARRATION.md): the stills (1920x1080 PNG, headless Chrome on
// the CPU, --disable-gpu). TWO frames: above, the typed line (the help box or the red1 prompt) or the page's own § log lines (real lines from out/facts.json and the witness logs); below, the REAL Viewer
// page (out/pages/*.png): ONE full-bleed region of the same pixels (v3, §17.3: the subject rectangles read from the page by shots.js and the model box, enlarged, see lower() and band.json), its zoom named in the bar strip. (was: the whole page + a crop, labelled with
// its scale. The bottom 170 px stay empty for the captions. Nothing is typed in by hand. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), out = path.resolve(process.argv[2] || path.join(OUT, 'cards')); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
const WL = { cls: 'witness_class_help_main.log', howto: 'witness_howto_main.log', dock: 'witness_help_dock_main.log' }, W = {};
Object.keys(WL).forEach((k) => { W[k] = fs.readFileSync(path.join(OUT, WL[k]), 'utf8'); });
const wline = (txt, re) => ((txt.split('\n').find((l) => re.test(l)) || '').trim().replace(/^§/, ''));
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = (f) => pics[f] || (pics[f] = b64(f));
const TOP = 260, BAR = 30, MT = TOP + BAR, MH = 620, PAGEW = Math.round(MH * 1920 / 1080), CX = 30 + PAGEW + 40, CW = 1920 - CX - 30, CH0 = MH - 40;
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:16px 34px;font-family:'DejaVu Sans Mono','Noto Sans CJK SC',monospace;font-size:23px;line-height:1.4;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:'? ';color:#4ade80} .cmd.sh:before{content:'red1 ❯ '} .out{white-space:pre-wrap;color:#e8eef5;font-size:22px;line-height:1.35} .ans{white-space:pre-wrap;color:#fbbf24;overflow-wrap:anywhere} .good{color:#4ade80} .dim{color:#94a3b8;white-space:pre-wrap;overflow-wrap:anywhere}
.cur{display:inline-block;width:14px;height:26px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.band{position:absolute;left:0;width:1920px;height:${MH}px;overflow:hidden;background:#0f172a} .band img{position:absolute}
.zl{position:absolute;right:28px;top:${TOP}px;height:${BAR}px;line-height:${BAR}px;font-size:19px;color:#fbbf24;letter-spacing:1px} .lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
const BARS = { box: (st) => `▲ <b>typed</b> into the help box, and the page's own § log &nbsp;·&nbsp; ▼ <b>the BIM Viewer</b>, the real page, Duplex &nbsp;·&nbsp; ${st}`,
  log: (st) => `▲ the page's own <b>§ log</b> &nbsp;·&nbsp; ▼ <b>the BIM Viewer</b>, the real page, Duplex &nbsp;·&nbsp; ${st}`,
  cli: (st) => `▲ <b>red1</b>, the command line &nbsp;·&nbsp; ▼ <b>the BIM Viewer</b>, the help that offers the line &nbsp;·&nbsp; ${st}` };
const bar = (kind, st) => `<div class="bar">${BARS[kind](esc(st))}</div>`;
const lab = (sc, what) => what + ', the page\'s own pixels, ' + (Math.abs(sc - 1) < 0.005 ? 'at 1x' : (sc > 1 ? 'enlarged ' : 'reduced ') + sc.toFixed(2).replace(/0$/, '') + 'x');
// v3 (VOCAB_MESSAGE_CATALOG §17.3 F2/F3): the lower band is ONE full-bleed region of the page. The subject = the listed rectangles (CSS px, read from the page by shots.js; a `clip` keeps only the top n px of a tall
// panel) united with the model's measured box; z (band px per CSS px) = min(ZMAX, 1920/subject.w, 620/subject.h), never under ZMIN (else §FRAME_BAR, the build fails); the region is centred on the subject and kept inside the page.
// Every band's numbers go to cards/band.json for framecheck.py (which measures the PNG itself).
const BAND_W = 1920, BAND_H = MH, ZMIN = 1.2, ZMAX = 2.0, BM = new Map(), FRAME_BAR = [];
const clipR = (r, c, n) => (n ? { x: r.x, y: r.y, w: r.w, h: Math.min(r.h, n) } : r), inter = (a, b) => { const x0 = Math.max(a.x, b.x), y0 = Math.max(a.y, b.y), x1 = Math.min(a.x + a.w, b.x + b.w), y1 = Math.min(a.y + a.h, b.y + b.h); return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null; };
const lower = (shotName, subj, what) => {
  const s = F.shots[shotName]; if (!s) throw new Error('no picture ' + shotName); const png = path.join(OUT, s.file), cv = s.building.canvas, bb = s.building.box && inter(s.building.box, cv);
  const rs = (subj || []).map((q) => ({ id: q.id, r: clipR(R(shotName, q.id), q.clip, q.clip) })); let U = bb; rs.forEach((q) => { U = U ? union(U, q.r) : q.r; });
  const z = Math.min(ZMAX, BAND_W / U.w, BAND_H / U.h), rw = BAND_W / z, rh = BAND_H / z;
  if (z < ZMIN) { FRAME_BAR.push(shotName); console.log('§FRAME_BAR ' + shotName + ' z=' + z.toFixed(3) + ' < ' + ZMIN + ' subject=' + JSON.stringify(U)); }
  const x0 = Math.max(0, Math.min(cv.w - rw, U.x + U.w / 2 - rw / 2)), y0 = Math.max(0, Math.min(cv.h - rh, U.y + U.h / 2 - rh / 2)), reg = { x: x0, y: y0, w: rw, h: rh };
  const bv = bb && inter(bb, reg), fonts = rs.map((q) => (s.minFont[q.id] || 1e9)).filter((v) => v < 1e9), mf = fonts.length ? Math.min.apply(null, fonts) : null, inside = rs.map((q) => inter(q.r, reg)).filter(Boolean);
  const met = { shot: shotName, z: +z.toFixed(4), region: reg, subject: U, building_h: bv ? +(bv.h * z / BAND_H).toFixed(4) : 0, building_w: bv ? +(bv.w * z / BAND_W).toFixed(4) : 0, subject_h_in_band: +((Math.min(U.y + U.h, y0 + rh) - Math.max(U.y, y0)) * z / BAND_H).toFixed(4),
    subject_w_in_band: +((Math.min(U.x + U.w, x0 + rw) - Math.max(U.x, x0)) * z / BAND_W).toFixed(4), panels_in_region: inside.length + '/' + rs.length, min_font_css: mf, min_font_band_px: mf ? +(mf * z).toFixed(2) : null };
  const html = `<div class="band" style="top:${MT}px"><img src="${img(png)}" style="width:${Math.round(cv.w * z)}px;left:${-Math.round(x0 * z)}px;top:${-Math.round(y0 * z)}px"></div><div class="zl">${esc(what)}, the page's own pixels, enlarged ${z.toFixed(2)}x</div>`;
  BM.set(html, met); return html;
};
const R = (shot, id) => { const r = F.shots[shot] && F.shots[shot].rects[id]; if (!r) throw new Error('no rectangle ' + id + ' in ' + shot); return r; };
const union = (a, b) => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };
const pad = (r, t, b) => ({ x: r.x, y: Math.max(0, r.y - t), w: r.w, h: Math.min(1080 - Math.max(0, r.y - t), r.h + t + (b || 0)) });
const top = (r, n) => ({ x: r.x, y: r.y, w: r.w, h: Math.min(r.h, n) });
const frame = (topHtml, lowHtml, kind, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topHtml}${bar(kind, st)}${lowHtml}</body></html>`;
const term = (inner) => `<div class="term">${inner}</div>`;
const termTyped = (cmd, k, done, lines, sh) => term(`<div class="cmd${sh ? ' sh' : ''}">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}`);
const typed = (cmd, lines, lowBefore, lowAfter, kind, st1, st2, sh) => { const s = [{ html: frame(termTyped(cmd, 0, false, '', sh), lowBefore, kind, st1), frames: 14 }];
  for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termTyped(cmd, k, false, '', sh), lowBefore, kind, st1), frames: 2, key: 'k' });
  s.push({ html: frame(termTyped(cmd, cmd.length, false, '', sh), lowBefore, kind, st1), frames: 8, key: 'r' }); s.push({ html: frame(termTyped(cmd, cmd.length, true, lines, sh), lowAfter, kind, st2), frames: null }); return s; };
const ans = (l) => `<div class="ans">${esc(cut(l || '', 300))}</div>`, dim = (l) => `<div class="dim">${esc(cut(l || '', 300))}</div>`, good = (l) => `<div class="ans good">${esc(cut(l || '', 300))}</div>`;
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:104px;font-weight:700;margin-top:24px} .s{font-size:40px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}
.q{margin:150px 170px 0;font-size:50px;line-height:1.38;font-weight:600} .q .big{color:#FF6B78} .qa{margin:40px 170px 0;font-size:27px;color:#cbd5e1;line-height:1.45} .qs{margin:16px 170px 0;font-size:20px;color:#94a3b8}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body>${inner}</body></html>`;
const cards = {};
cards.cover = [{ html: full('<div class="ch"><div class="k">BIM VIEWER · HELP</div><div class="t1">Help that <span style="color:#FF6B78">answers</span></div><div class="s">in the BIM Viewer: this element, How To, the same at the command line</div><div class="c">The real page, headless · English</div></div>'), frames: null }];
{ const Q = F.quote; cards.quote = [{ html: full('<div class="q">“' + esc(Q.text).replace(esc(Q.stat), '<span class="big">' + esc(Q.stat) + '</span>') + '”</div><div class="qa">' + esc(Q.who) + '<br><i>' + esc(Q.title) + '</i>, ' + esc(Q.date) + '</div><div class="qs">' + esc(Q.url) + ' · copy fetched ' + esc(Q.fetched) + '</div>'), frames: null }]; }
const KS = (shot) => [{ id: '#info-panel' }];   // class-text stills: the info panel with the class text, beside the model
const HP = [{ id: '#cmd-palette', clip: 470 }, { id: '#find-panel' }];   // help stills: the help panel's top part, the model, and the Find panel (all real, all open)
cards.klass = [{ html: frame(term(ans(F.lines.classEn) + good(wline(W.cls, /PASS C2 verbatim/)) + good(wline(W.cls, /PASS C4 label/))), lower('klass_en', KS('klass_en'), 'the info panel'), 'log', 'a wall picked in Find: the info panel') , frames: null }];
cards.lang = [
  { html: frame(term(ans(F.lines.class_de_DE) + good(wline(W.cls, /§PASS C4a IfcWall de_DE/))), lower('klass_de_DE', KS('klass_de_DE'), 'the info panel in German'), 'log', 'the same wall, the page in Deutsch (de_DE)'), frames: null },
  { html: frame(term(ans(F.lines.class_zh_CN) + good(wline(W.cls, /§PASS C4b IfcWall zh_CN/))), lower('klass_zh_CN', KS('klass_zh_CN'), 'the info panel in Chinese'), 'log', 'the same wall, the page in 中文 (zh_CN)'), frames: null }];
cards.ask = typed(F.word.w, ans(F.lines.palNative) + good(wline(W.howto, /§PASS H4c/)), lower('pal_open', HP, 'the help panel'), lower('pal_native', HP, 'the help panel'),
  'box', 'F1: the help panel, left', 'one word typed: the entry that holds it, opened');
{ const C = F.cli;
  cards.cli = typed(C.line, dim(C.door) + ans(C.summary) + dim(C.viewerLine), lower('pal_find', HP, 'the Find entry'), lower('pal_find', HP, 'the Find entry'), 'cli',
    'the help\'s Find entry: its guide link, the same at the CLI', 'the line run at the red1 prompt: its real answer', true); }
cards.dock = [
  { html: frame(term(ans(F.lines.dragSave)), lower('dock_moved', HP, 'the help panel, moved'), 'log', 'dragged by its header'), frames: null },
  { html: frame(term(ans(F.lines.close)), lower('dock_closed', [{ id: '#find-panel' }], 'the help panel closed'), 'log', 'closed with ×'), frames: null },
  { html: frame(term(ans(F.lines.restore) + ans(F.lines.reopen) + good(wline(W.dock, /§PASS D3d after reload/)) + good(wline(W.dock, /§PASS D6a/))), lower('dock_reopen', HP, 'the help panel, reopened'), 'log', 'F1 again: where it was left'), frames: null }];
{ const PA = require('./priorart.json'), C = F.credentials, kb = (b) => (b / 1024).toFixed(1) + ' KB', FS = F.files;
  const css = `<style>.lc{margin:44px 60px 0} .lc h1{font-size:46px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:470px 760px 500px;gap:40px;margin-top:24px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.33;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:186px;font-size:17px;color:#94a3b8;width:1800px}</style>`;
  const cost = ['<b>How To text</b><br>viewer/help/howto.json ' + kb(FS['viewer/help/howto.json']) + ', fetched once, on the first F1',
    '<b>The class text</b><br>viewer/info_class_help.js ' + kb(FS['viewer/info_class_help.js']) + ' + rows in the existing language files',
    '<b>One panel, one drag, both apps</b><br>common/help/help_panel.js ' + kb(FS['common/help/help_panel.js']) + ' · common/drag.js ' + kb(FS['common/drag.js']),
    '<b>The CLI line</b><br>' + (F.cli.ms / 1000).toFixed(1) + ' s, its own headless Viewer on the CPU'];
  const pa = PA.items.map((i) => '<b>' + esc(i.name) + '</b><br>' + esc(i.does) + '<br><i>→ ' + esc(i.took) + '</i>');
  const PRL = { 3150: 'class text', 3152: 'its languages', 3156: 'How To', 3160: 'the panel', 3165: 'one shared panel' };
  const cred = ['<b>' + esc(C.repo) + '</b><br>' + esc(C.licence), '<b>This feature</b><br>' + C.prs.map((x) => '#' + x.n + ' ' + (PRL[x.n] || '')).join(' · ') + ' (merged)',
    '<b>Witnessed on main ' + esc(F.tree) + '</b><br>' + esc(F.verdicts.classHelp) + '<br>' + esc(F.verdicts.howto) + '<br>' + esc(F.verdicts.dock),
    '<b>BIM User Guide</b><br>red1oon.github.io/BIMCompiler/BIMUserGuide/', '<b>Paper</b>: Deterministic Spatial Compilation<br>priority date ' + esc(C.paperPriority) + ' · red1oon.github.io/BIMCompiler/SpatialCompilationPaper/'];
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map((r) => '<div class="r">' + r + '</div>').join('') + '</div>';
  const credit = 'Opening quote: Jakob Nielsen, <i>10 Usability Heuristics for User Interface Design</i>, Nielsen Norman Group, ' + esc(F.quote.date.replace(/ \(.*$/, '')) + ' (copy fetched ' + esc(F.quote.fetched) + ') · IFC definitions: ' + esc(F.en.block.credit || '') + ' (bSDD copy fetched ' + esc(C.bsddFetched) + ') · Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0 · pictures: the real Viewer page, headless on the CPU';
  cards.close = [{ html: full(css + '<div class="lc"><h1>What it costs, <span>what we learned</span>, who stands behind it</h1><div class="cols">' + col('cost, measured', cost) + col('prior art: the lesson', pa) + col('project credentials', cred) +
    '</div><div class="cr">' + credit + '</div></div>'), frames: null }]; }
const order = require('./narr.js').beats.map((b) => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}, BANDS = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc'), q = document.querySelector('.qs'), lab = document.querySelector('.lab'); const imgs = Array.from(document.images);
          const wide = Math.max(Array.from(document.querySelectorAll('.r, .col, .lc h1, .q, .qa, .lab')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0),
            Array.from(document.querySelectorAll('.crop')).reduce((w, e) => Math.max(w, e.getBoundingClientRect().right - 1920), 0));   // a crop clips its picture on purpose: only its box must stay inside
          const low = Math.max(lc ? lc.getBoundingClientRect().bottom : 0, q ? q.getBoundingClientRect().bottom : 0, lab ? lab.getBoundingClientRect().bottom : 0) - (1080 - 170);   // the caption area stays empty
          return { why: { term: t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: Math.round(low), wide: Math.round(wide) }, over: Math.max(t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low, wide), loaded: imgs.every((i) => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); if (m.over > 0) console.log('§CARD_OVER ' + name + ' ' + JSON.stringify(m.why)); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; for (const [k, v] of BM) if (c.html.indexOf(k) >= 0) BANDS[name] = v; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, Math.round(worst)) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); fs.writeFileSync(path.join(out, 'band.json'), JSON.stringify(BANDS, null, 1)); console.log('§FRAME_BARS_RECORDED stills=' + Object.keys(BANDS).length + ' frame_bar_fails=' + FRAME_BAR.length); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets); if (FRAME_BAR.length) { console.error('§CARDS_FAIL FRAME_BAR ' + FRAME_BAR.join(',')); process.exit(1); }
})().catch((e) => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
