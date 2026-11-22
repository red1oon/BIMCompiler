// ⚠ DO NOT REMOVE — film "The container legacy gave us, filled" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.18; house style prompts/FILM_NARRATION.md): the stills (1920x1080 PNG, headless
//   Chrome on the CPU). TWO frames (the house style): above, what is typed (real key cues) or the run's own § lines (from out/facts.json and the witness logs); below, the REAL page (out/pages/*.png):
//   the whole page scaled on the left, and the part that matters cut from the SAME pixels on the right, from the rectangles shots.js / legacy_shot.js recorded (never placed by hand), labelled with
//   its scale. The bottom 170 px stay empty for the captions. Chapter cards are not used (PLAYBOOK C allows them; this film is short). READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), out = path.resolve(process.argv[2] || path.join(OUT, 'cards')); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), Lg = F.legacy;
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = (f) => pics[f] || (pics[f] = b64(f));
const TOP = 260, BAR = 30, MT = TOP + BAR, MH = 620, PAGEW = Math.round(MH * 1920 / 1080), CL = 30 + PAGEW + 40, CW = 1920 - CL - 30, CH0 = MH - 40;
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:16px 34px;font-family:'DejaVu Sans Mono','Noto Sans CJK SC',monospace;font-size:23px;line-height:1.4;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:attr(data-p);color:#4ade80} .ans{white-space:pre-wrap;color:#fbbf24;overflow-wrap:anywhere;font-size:21px} .good{color:#4ade80} .dim{color:#94a3b8;font-size:20px;white-space:pre-wrap}
.cur{display:inline-block;width:14px;height:26px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.pg{position:absolute;left:30px;top:${MT}px;height:${MH}px;border:1px solid #334155} .crop{position:absolute;top:${MT}px;overflow:hidden;border:3px solid #FF6B78;background:#fff} .crop img{position:absolute}
.lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
const bar = (left, st) => `<div class="bar">▲ <b>${left}</b> &nbsp;·&nbsp; ▼ ${st}</div>`;
// the lower band: the whole page (scaled) on the left, and the rectangle [x,y,w,h] of the SAME png on the right at the scale that fits (at most 1.5x)
const lower = (png, r, label) => {
  const h = Math.min(r.h, 1080 - r.y), sc = Math.min(1.5, CH0 / h, CW / r.w), cw = Math.round(r.w * sc), ch = Math.round(h * sc), lab = label + ' · ' + (sc === 1 ? '1:1' : (sc > 1 ? 'enlarged ' : 'reduced ') + sc.toFixed(2).replace(/0$/, '') + 'x');
  return `<img class="pg" src="${img(png)}"><div class="crop" style="left:${CL}px;width:${cw + 6}px;height:${ch + 6}px"><img src="${img(png)}" style="width:${Math.round(1920 * sc)}px;left:${-Math.round(r.x * sc)}px;top:${-Math.round(r.y * sc)}px"></div>` +
    `<div class="lab" style="left:${CL}px;top:${MT + ch + 6}px">${esc(lab)}</div>`;
};
const P = (name) => path.join(OUT, F.shots[name].file), R = (name) => F.shots[name].rects;
const ctxBand = (name, label) => { const r = R(name), p = r.panel, c = r.ctx, y = Math.max(0, (r.howtoTitle || c).y - 6); return lower(P(name), { x: p.x, y, w: p.w, h: Math.min(640, 1080 - y) }, label); };   // the top of the panel, legible (~0.9x)
const frame = (topHtml, lowHtml, left, st) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${topHtml}${bar(left, esc(st))}${lowHtml}</body></html>`;
const term = (inner) => `<div class="term">${inner}</div>`;
const termTyped = (p, cmd, k, done, lines) => term(`<div class="cmd" data-p="${esc(p)}">${esc(cmd.slice(0, k))}${done ? '' : '<span class="cur"></span>'}</div>${done ? lines : ''}`);
const typed = (p, cmd, lines, lowBefore, lowAfter, left, st1, st2) => { const s = [{ html: frame(termTyped(p, cmd, 0, false, ''), lowBefore, left, st1), frames: 14 }];
  for (let k = 1; k <= cmd.length; k++) s.push({ html: frame(termTyped(p, cmd, k, false, ''), lowBefore, left, st1), frames: 2, key: 'k' });
  s.push({ html: frame(termTyped(p, cmd, cmd.length, false, ''), lowBefore, left, st1), frames: 8, key: 'r' }); s.push({ html: frame(termTyped(p, cmd, cmd.length, true, lines), lowAfter, left, st2), frames: null }); return s; };
const ans = (l) => `<div class="ans">${esc(cut(l, 260))}</div>`, dim = (l) => `<div class="dim">${esc(cut(l, 200))}</div>`, good = (l) => `<div class="ans good">${esc(cut(l, 260))}</div>`;
const lines = (arr) => term(arr.join(''));
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden} .ch{text-align:center;margin-top:250px}
.k{font-size:34px;color:#FF6B78;letter-spacing:6px} .t1{font-size:96px;font-weight:700;margin-top:24px} .s{font-size:40px;color:#cbd5e1;margin-top:34px} .c{font-size:24px;color:#94a3b8;margin-top:60px}`;
const full = (inner, css) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}${css || ''}</style></head><body>${inner}</body></html>`;
const TWIN = 'the ERP twin, the real page', cards = {};
cards.cover = [{ html: full('<div class="ch"><div class="k">KERNEL-ERP · CONTEXT HELP</div><div class="t1">The container legacy gave us,<br><span style="color:#FF6B78">filled</span></div><div class="s">iDempiere\'s own How To panel, with the steps in it</div><div class="c">The real pages, headless · English</div></div>'), frames: null }];
// 1 before / after: legacy's count (the pilot, read by legacy_shot.js before it applied anything) typed at the database prompt; below, the twin's Context Help window
{ const r = R('ctxwin'), c = r.content;
  cards.before = typed('idempiere_pilot=# ', 'SELECT count(*) FROM AD_CtxHelp;', ans(String(Lg.before.helps) + '   (legacy iDempiere: the Home welcome only)') + dim(F.ctxwin.window) + good('Context Help window, the twin: Find says Records = ' + F.ctxwin.records + ', grid rows ' + F.ctxwin.rows),
    lower(P('ctxwin'), c, 'the Context Help window'), lower(P('ctxwin'), c, 'the Context Help window'), 'typed at legacy\'s database', 'the twin: the same window, the same tables', 'the twin: ' + F.ctxwin.records + ' topics'); }
// 2 the panel follows the tab: header, Order Line, Order Tax (no topic)
cards.tab = [['so_header', F.so.line, 'Sales Order, the header tab'], ['so_line', F.line.line, 'Order Line'], ['so_tax', F.tax.line, 'Order Tax: no topic']].map(([n, l, st]) =>
  ({ html: frame(lines([dim('the page\'s own log, one line per tab:'), ans(F.so.line), ans(F.line.line), ans(F.tax.line)].map((x) => x.replace(esc(l), '<b style="color:#4ade80">' + esc(l) + '</b>'))), ctxBand(n, 'the How To panel'), TWIN, st), frames: null }));
// 3 one guide: the topic's last line links to the guide section; the guide's own page
{ const r = R('so_more'), m = r.more || r.ctx;
  cards.guide = [{ html: frame(lines([dim('W-CTXHELP-OVERLAY on this tree:'), ans(F.lines.k6cut.replace(/^§CTXHELP_OVERLAY /, '')), ans(F.lines.k11.replace(/^\s*PASS /, 'PASS ')), good('the link: ' + F.more.text + '  ->  ' + F.more.href)]),
      lower(P('so_more'), { x: r.panel.x, y: Math.max(0, m.y - 520), w: r.panel.w, h: 600 }, 'the end of the topic'), TWIN, 'a long topic ends with a link to the rest'), frames: null },
    { html: frame(lines([good('the guide opens at the same section: ' + F.guide.heading), dim(F.guide.url)]), `<img class="pg" src="${img(P('guide'))}" style="height:${MH}px">`, 'the guide, its own page', 'one text, read in the app or here'), frames: null }]; }
// 4 the question box; 4b the same question at red1
{ const r = R('ask'), a = r.card;
  cards.ask = typed('? ', F.ask.q, ans(F.ask.line.replace(/ hits=.*$/, '')), ctxBand('so_header', 'the How To panel'), lower(P('ask'), { x: r.panel.x, y: Math.max(0, a.y - 60), w: r.panel.w, h: a.h + 120 }, 'the answer card'), 'typed into the How To box', 'Sales Order open', 'the answer card, from the dictionary');
  const C = F.cli, o = `<div class="dim">${esc(C.arrow)}</div><div class="ans">${esc(C.summary.split('\n').filter((x) => x.trim()).slice(0, 4).join('\n'))}</div>`;
  cards.cli = typed('red1 ❯ ', C.line, o, lower(P('ask'), { x: r.panel.x, y: Math.max(0, a.y - 60), w: r.panel.w, h: a.h + 120 }, 'the answer card'), lower(P('ask'), { x: r.panel.x, y: Math.max(0, a.y - 60), w: r.panel.w, h: a.h + 120 }, 'the answer card'), 'red1, the command line', 'the same answer on the page', 'the same answer on the page'); }
// 5 languages
cards.langs = [['zh_CN', '中文'], ['de_DE', 'Deutsch'], ['es_ES', 'Español']].map(([lg, nm]) => ({ html: frame(lines([dim('the page\'s own log, Sales Order header, per screen language:'), ...['zh_CN', 'de_DE', 'es_ES'].map((x) => (x === lg ? good : ans)(F.langs[x].line))]),
  ctxBand('lang_' + lg, 'the How To panel, ' + nm), TWIN, nm + ': the tab\'s own text from legacy\'s pack, then the steps'), frames: null }));
// 6 a tenant's own words: typed (key cues), then shown at once
cards.tenant = typed('MsgText ❯ ', F.tenant.body, ans(F.tenant.save) + ans(cut(F.tenant.persist, 200)) + good('rows of help 1000000: ' + F.tenant.rows.map((x) => 'client ' + x.c + ' ' + x.n + ' chars').join(', ')),
  ctxBand('so_header', 'the How To panel, before'), ctxBand('tenant_shown', 'the How To panel, after Save'), 'typed by a tenant admin (an example) in the Context Help window', 'Sales Order: System\'s text', 'Sales Order: their own text, at once');
// 7 real iDempiere: the script applied to the pilot, legacy's own ZK panel; the pilot restored after (legacy.log)
{ const z = Lg.zk.rect;
  cards.legacy = typed('$ ', 'psql -d idempiere_pilot -f ' + path.basename(Lg.script), ans('§LEGACY_APPLIED helps ' + Lg.before.helps + ' -> ' + Lg.applied.helps + ', links 0 -> ' + (Lg.applied.tabLinks + Lg.applied.procLinks)) + good(F.lines.legacyL3) + good(F.lines.legacyL5) + dim('after the shot: our rows removed by their UUIDs, the pilot back to its snapshot: ' + Lg.back),
    `<div style="position:absolute;left:30px;top:${MT + 260}px;font-size:34px;color:#94a3b8">legacy iDempiere, before: the panel shows the tab\'s own text only</div>`, lower(path.join(OUT, 'pages', 'legacy_so.png'), { x: z.x, y: z.y, w: z.w, h: 1080 - z.y }, 'legacy iDempiere\'s own How To panel'),
    'applied to the legacy pilot database', 'legacy iDempiere', 'legacy iDempiere, order ' + Lg.order.no + ': its own panel'); }
// close: the claims, what is not built, the credentials
{ const css = `.lc{margin:44px 60px 0} .lc h1{font-size:46px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:560px 560px 620px;gap:40px;margin-top:24px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.33;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:186px;font-size:17px;color:#94a3b8;width:1800px}`;
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map((x) => '<div class="r">' + x + '</div>').join('') + '</div>';
  const same = ['<b>Legacy\'s own tables</b><br>AD_CtxHelp, AD_CtxHelpMsg, AD_CtxHelpMsg_Trl: no new table, no new column', '<b>Legacy\'s own panel</b><br>the tab\'s own Name / Description / Help first, then the steps',
    '<b>Extracted, not written</b><br>the steps are the guides\' own paragraphs; a long one links to the rest', '<b>Your text wins</b><br>a tenant\'s message first, System\'s kept underneath'];
  const notYet = ['<i>More topics</i>: needs a cited source; legacy\'s own docs state no licence yet', '<i>Translations</i>: after the content settles (German and Chinese machine, Spanish English)', '<i>An Oracle script</i>: PostgreSQL only', '<i>Applied through RUN_SyncDB</i> on a real site: shown here with psql'];
  const cred = ['<b>' + esc(F.credentials.repo) + '</b><br>' + esc(F.credentials.licence), '<b>Merged</b><br>' + F.credentials.prs.map((x) => '#' + x.n).join(' · '), '<b>Witnessed on main ' + esc(F.tree) + '</b><br>' + Object.values(F.verdicts).map(esc).join('<br>'),
    '<b>The guides</b><br>red1oon.github.io/BIMCompiler/ERPUserGuide/<br>red1oon.github.io/BIMCompiler/ERP_FirstSetup/'];
  cards.close = [{ html: full('<div class="lc"><h1>Same shape as legacy. <span>Nothing to relearn.</span></h1><div class="cols">' + col('the same shape', same) + col('not built yet', notYet) + col('credentials', cred) +
    '</div><div class="cr">Pictures: the real ERP twin page and the legacy iDempiere pilot, headless on the CPU · the legacy pilot restored after the shot · Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0</div></div>', css), frames: null }]; }
const order = require('./narr.js').beats.map((b) => b.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const planOut = {}, made = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); planOut[id] = []; let worst = 0;
    for (const c of cards[id]) {
      if (!made[c.html]) { const name = id + '_' + String(Object.keys(made).length + 1).padStart(3, '0') + '.png'; await pg.setContent(c.html, { waitUntil: 'load' });
        const m = await pg.evaluate(() => { const t = document.querySelector('.term'), lc = document.querySelector('.lc'), lab = document.querySelector('.lab'), imgs = Array.from(document.images);
          const wide = Array.from(document.querySelectorAll('.r, .col, .lc h1, .lab')).reduce((w, e) => Math.max(w, e.scrollWidth - e.clientWidth, e.getBoundingClientRect().right - 1920), 0);
          const low = Math.max(lc ? lc.getBoundingClientRect().bottom : 0, lab ? lab.getBoundingClientRect().bottom : 0) - (1080 - 170);
          return { why: { term: t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: Math.round(low), wide: Math.round(wide) }, over: Math.max(t ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low, wide), loaded: imgs.every((i) => i.complete && i.naturalWidth > 0) }; });
        if (!m.loaded) throw new Error('a picture of ' + id + ' did not load'); worst = Math.max(worst, m.over); if (m.over > 0) console.log('§CARD_OVER ' + name + ' ' + JSON.stringify(m.why)); await pg.screenshot({ path: path.join(out, name) }); made[c.html] = name; n++; }
      const e = { file: made[c.html], frames: c.frames }; if (c.key) { e.key = c.key; if (c.key === 'k') keys++; else rets++; } planOut[id].push(e); }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' entries=' + cards[id].length + ' overflow_px=' + Math.max(0, Math.round(worst)) + (worst > 0 ? ' TOO-TALL' : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(planOut, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(planOut).length + ' stills=' + n + ' too_tall=' + tall + ' key_cues=' + keys + ' return_cues=' + rets);
})().catch((e) => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
