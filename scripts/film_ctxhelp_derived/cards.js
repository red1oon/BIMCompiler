// ⚠ DO NOT REMOVE — film "Read from legacy's own code" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.20; adapted from film_ctxhelp_cms/cards.js §19.18; house style prompts/FILM_NARRATION.md): the stills (1920x1080 PNG, headless
//   Chrome on the CPU). TWO frames (the house style): above, what is typed (real key cues) or the run's own § lines (from out/facts.json and the witness logs); below, the REAL page (out/pages/*.png):
//   the whole page scaled on the left, and the part that matters cut from the SAME pixels on the right, from the rectangles shots.js / legacy_shot.js recorded (never placed by hand), labelled with
//   its scale. The bottom 170 px stay empty for the captions. Chapter cards are not used (PLAYBOOK C allows them; this film is short). READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), out = path.resolve(process.argv[2] || path.join(OUT, 'cards')); fs.mkdirSync(out, { recursive: true });
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), Lg = F.legacy, RUN_LOG = process.env.RUN_LOG || 'run_20261123_142109_m3metaall.log';
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'), pics = {}, img = (f) => pics[f] || (pics[f] = b64(f));
const TOP = 260, BAR = 30, MT = TOP + BAR, MH = 620, PAGEW = Math.round(MH * 1920 / 1080), CL = 30 + PAGEW + 40, CW = 1920 - CL - 30, CH0 = MH - 40;
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden}
.term{position:absolute;left:0;top:0;width:1920px;height:${TOP}px;background:#0b0f17;padding:16px 34px;font-family:'DejaVu Sans Mono','Noto Sans CJK SC',monospace;font-size:23px;line-height:1.4;overflow:hidden;border-bottom:2px solid #334155}
.cmd{white-space:pre;color:#F3EEE8} .cmd:before{content:attr(data-p);color:#4ade80} .ans{white-space:pre-wrap;color:#fbbf24;overflow-wrap:anywhere;font-size:21px} .good{color:#4ade80} .dim{color:#94a3b8;font-size:20px;white-space:pre-wrap}
.cur{display:inline-block;width:14px;height:26px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:${TOP}px;height:${BAR}px;background:#1e293b;color:#94a3b8;font-size:19px;line-height:${BAR}px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc}
.pg{position:absolute;left:30px;top:${MT}px;height:${MH}px;border:1px solid #334155} .crop{position:absolute;top:${MT}px;overflow:hidden;border:3px solid #FF6B78;background:#fff} .crop img{position:absolute}
.hl{color:#4ade80;font-weight:700} .lab{position:absolute;background:#FF6B78;color:#0b0f17;font-size:17px;font-weight:700;padding:2px 8px}`;
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
const TWIN = 'the ERP twin, the real page', cards = {}, LEGACY = 'real iDempiere (the pilot), its own page';
const cropOf = (name) => F.shots[name].crop, panelBand = (name, label) => lower(P(name), cropOf(name), label), zk = (k) => Lg.zk.shots[k], zkBand = (k, label) => lower(path.join(OUT, zk(k).file), zk(k).crop, label);
const plain = (t) => String(t).replace(/\t/g, '    ').replace(/\s+$/, ''), n = (re, s) => (String(s).match(re) || []).length;
cards.cover = [{ html: full('<div class="ch"><div class="k">KERNEL-ERP · CONTEXT HELP</div><div class="t1">Read from<br><span style="color:#FF6B78">legacy\'s own code</span></div><div class="s">iDempiere\'s How To panel, for every window of the trade cycle and the books</div><div class="c">The real pages, headless · English</div></div>'), frames: null }];
// 1 before / after: legacy's count (the pilot, read by legacy_shot.js before it applied anything) typed at the database prompt; below, the twin's Context Help window
{ const r = R('ctxwin'), c = r.content;
  cards.before = typed('idempiere_pilot=# ', 'SELECT count(*) FROM AD_CtxHelp;', ans(String(Lg.before.helps) + '   (legacy iDempiere: the Home welcome only)') + dim(F.ctxwin.window) + good('Context Help window, the twin: Find says Records = ' + F.ctxwin.records + ', grid rows ' + F.ctxwin.rows + '   (windows with a derived topic: ' + F.derived.windows + ' of ' + F.derived.of + ')'),
    lower(P('ctxwin'), c, 'the Context Help window'), lower(P('ctxwin'), c, 'the Context Help window'), 'typed at legacy\'s database', 'the twin: the same window, the same tables', 'the twin: ' + F.ctxwin.records + ' topics'); }
// 2 Sales Order, unasked: the derived sections, three stills (what leads each is an element, checked in shots.js)
{ const p = F.so.p, head = [dim('the page\'s own log, Sales Order, header tab:'), ans(F.so.line)];
  cards.so = [['so_a', good('Before you start: ' + p.beforeItems.length + ' records that must exist, ' + p.beforeLinks.length + ' links, each to its own window') + dim('Do it: ' + p.doit), 'Sales Order: Before you start, Do it'],
    ['so_b', good('What Complete does: ' + p.complete.length + ' lines, ' + p.ticks + ' with ✓ (a recorded legacy run showed it)'), 'Sales Order: What Complete does'],
    ['so_c', good('When it refuses, legacy says: ' + n(/“/g, p.refuse) + ' messages, ' + p.refuseTicks + ' with ✓'), 'Sales Order: When it refuses']].map(([nm, extra, st]) => ({ html: frame(lines(head.concat([extra])), panelBand(nm, 'the How To panel'), TWIN, st), frames: null })); }
// 3 who wrote it: legacy's own source line, for real (sed), beside the panel's first What Complete does line
{ const ef = F.rules.effect, T = F.term.sed;
  cards.who = typed('model ❯ ', T.cmd, ans(plain(T.out)) + dim('in ' + path.dirname(ef.file) + '/   (tabs shown as spaces)') + good('legacy_rules.json  ' + ef.id + '  ->  ' + path.basename(ef.file) + ':' + ef.line + '  the token is on that line: ' + F.rules.tokenHeld) + dim('W-CTXHELP-DERIVED D2b: cited lines ' + F.derived.cited + ' of ' + F.derived.citedOf + ' hold their token  ·  red run (line moved by one): ' + F.red.verdict.replace(/^.*§WITNESS_CTXHELP_DERIVED /, '')),
    panelBand('so_b', 'the How To panel'), panelBand('so_b', 'the How To panel'), 'typed in legacy\'s source folder', 'Sales Order: What Complete does', 'the first line is this rule'); }
// 4 and the tick: legacy's own recorded result (grep for real); the long line cut with … but the keys kept
const cutDetail = (d, lk, sk) => { const kv = (o, ks) => '{' + ks.filter((k) => o && k in o).map((k) => JSON.stringify(k) + ':' + JSON.stringify(o[k])).join(',') + ',…}'; return d.line.slice(0, d.line.indexOf(' legacy=')) + ' legacy=' + kv(d.legacy, lk) + ' sqlite=' + kv(d.sqlite, sk); };
const hlTerm = (text, key) => esc(text).replace(esc(key), '<span class="hl">' + esc(key) + '</span>');
{ const T = F.term.tick, d = T.d, cut1 = cutDetail(d, ['outcome', 'docstatus', 'shipments', 'shipments_completed', 'invoices'], ['outcome', 'docstatus', 'shipments', 'shipments_completed', 'invoices']), ls = T.out.split('\n');
  const out = ls.map((l) => /^§SCN_DETAIL /.test(l) ? '<div class="ans">' + hlTerm(cut1, '"shipments_completed":1') + '</div>' : ans(l)).join('');
  cards.tick = typed('bim_bridge ❯ ', T.cmd, out + dim('✓ only where the run MATCHED on both sides; the long line is cut with … (the full line is in ' + RUN_LOG + ')'),
    panelBand('so_b', 'the How To panel'), panelBand('so_b', 'the How To panel'), 'typed in the bridge\'s log folder', 'Sales Order: What Complete does', 'a ✓ is a recorded run'); }
// 5 refusals in legacy's words
{ const T = F.term.ref, ls = T.out.split('\n'), out = ls.map((l) => /^§SCN_DETAIL /.test(l) ? '<div class="ans">' + hlTerm(l, 'Business Partner with this Order over Credit Hold') + '</div>' : ans(l)).join('');
  cards.refuse = typed('bim_bridge ❯ ', T.cmd, out, panelBand('so_c', 'the How To panel'), panelBand('so_c', 'the How To panel'), 'typed in the bridge\'s log folder', 'Sales Order: When it refuses', 'legacy\'s own message, word for word'); }
// 6 Purchase Order: the same list, one ✓
{ const po = F.po.p, so = F.so.p, tl = po.complete.filter((x) => x.tick).map((x) => x.text);
  cards.po = [{ html: frame(lines([dim('the page\'s own log, Purchase Order, header tab:'), ans(F.po.line), good('What Complete does: ' + po.complete.length + ' lines, ' + po.ticks + ' with ✓:  ' + cut(tl[0], 120)), dim('for comparison, Sales Order: ' + so.complete.length + ' lines, ' + so.ticks + ' with ✓')]), panelBand('po_b', 'the How To panel'), TWIN, 'Purchase Order: What Complete does'), frames: null }]; }
// 7 any window: Business Partner's Needed by; a click; Shipment's own lines
{ const bp = F.bp.p, sh = F.ship.p;
  cards.any = [{ html: frame(lines([dim('the page\'s own log, Business Partner, header tab:'), ans(F.bp.line), good('Needed by: ' + bp.neededLinks.length + ' documents, each a link to its window  (' + bp.neededLinks.map((l) => l.win).join(' ') + ')')]), panelBand('bp_n', 'the How To panel'), TWIN, 'Business Partner: Needed by'), frames: null },
    { html: frame(lines([dim('a click on Shipment (Customer) in that list, the page\'s own log:'), ans(F.click.line), good('What Complete does: ' + sh.complete.length + ' lines, ' + sh.ticks + ' with ✓')]), panelBand('ship_b', 'the How To panel'), TWIN, 'Shipment (Customer): What Complete does'), frames: null },
    { html: frame(lines([dim('Shipment (Customer), the end of its refusal list:'), ans(F.ship.line), good('and ' + F.ship.more.n + ' more in ' + F.ship.more.file + '  (the list names the source file, not every message)')]), panelBand('ship_c', 'the How To panel'), TWIN, 'Shipment (Customer): When it refuses'), frames: null }]; }
// 8 real iDempiere: the script applied to the pilot, legacy's own ZK panel; the pilot restored after (legacy.log, pilot_witness.log)
{ const lk = Lg.lookup257, ps = F.pilot.counts.map((c) => /=(\d+)/.exec(c)[1]).join(' / ');
  const out = ans('§LEGACY_APPLIED helps ' + Lg.before.helps + ' -> ' + Lg.applied.helps + ', links 0 -> ' + (Lg.applied.tabLinks + Lg.applied.procLinks) + '   (' + Lg.applied.tabLinks + ' tabs, ' + Lg.applied.procLinks + ' processes)') + good('§LEGACY_LOOKUP tab=257  legacy\'s own join AD_Tab -> AD_CtxHelp = our UUID ' + lk.uu.slice(0, 8) + '…  (' + lk.len + ' chars)') +
    dim('then our rows removed by their UUIDs: pilot back to its snapshot = ' + Lg.back + '; ad_ctxhelp / tab links / process links = ' + ps + ';  L&F parity ' + F.lf.verdict.replace('§LF_VERDICT ', '')) + dim('legacy caches a tab\'s help text (MCtxHelpMsg.java:51): the rows are proved by the lookup, not by the picture alone');
  const lowT = panelBand('ship_b', 'the twin: Shipment (Customer)'), st = (k, l) => frame(termTyped('$ ', 'psql -d idempiere_pilot -f ' + path.basename(Lg.script), 99999, true, out), zkBand(k, l), 'legacy iDempiere, shipment ' + Lg.order.no + ': its own panel', 'applied to the legacy pilot database');
  cards.legacy = typed('$ ', 'psql -d idempiere_pilot -f ' + path.basename(Lg.script), out, lowT, zkBand('top', 'legacy iDempiere\'s own How To panel'), 'applied to the legacy pilot database', 'the twin: the same topic', 'real iDempiere: the tab\'s own words, then ours');
  cards.legacy.push({ html: st('complete', 'legacy iDempiere\'s own How To panel'), frames: null }, { html: st('tail', 'legacy iDempiere\'s own How To panel'), frames: null }); }
// close: the claims, what is not built, the credentials
{ const css = `.lc{margin:44px 60px 0} .lc h1{font-size:46px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:540px 540px 640px;gap:40px;margin-top:24px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:21px;line-height:1.33;padding:7px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:186px;font-size:17px;color:#94a3b8;width:1800px}`;
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map((x) => '<div class="r">' + x + '</div>').join('') + '</div>';
  const claims = ['<b>' + F.derived.windows + ' of ' + F.derived.of + ' windows</b><br>every window of the trade cycle and the books has its topic', '<b>' + F.rules.effects + ' effects</b><br>read from legacy\'s DocAction source, each cited by file and line (' + F.derived.cited + ' of ' + F.derived.citedOf + ' lines hold their token)',
    '<b>' + F.derived.ticks + ' ticks ✓</b><br>a recorded legacy run on that side matched; with every verdict flipped: ' + F.derived.flipped, '<b>Legacy\'s own words</b><br>its refusal messages, quoted exactly'];
  const notYet = ['<i>Ticks for the rest</i>: more recorded runs', '<i>Translations</i> of the new text', '<i>The VS Code link</i>: an idea only', '<i>A guide page</i> for this panel: the guides do not describe it yet'];
  const cred = ['<b>' + esc(F.credentials.repo) + '</b><br>' + esc(F.credentials.licence), '<b>Merged</b><br>' + F.credentials.prs.map((x) => '#' + x.n).join(' · '), '<b>Witnessed on main ' + esc(F.tree) + '</b><br>' + esc(F.derived.verdict.replace(/^.*§WITNESS_/, 'W-').replace(/_/g, '-').replace(/ inconclusive=0/, '')) + '<br>pilot after the shots: ad_ctxhelp / tab links / process links = ' + esc(F.pilot.counts.map((c) => /=(\d+)/.exec(c)[1]).join(' / ')) + '<br>' + esc(F.lf.verdict.replace('§LF_VERDICT ', 'L&F parity: ')),
    '<b>Read for this</b><br>iDempiere MOrder.java:' + F.rules.effect.line + ' and MInOut.java; the bridge run of 2026-11-23'];
  cards.close = [{ html: full('<div class="lc"><h1>Read from legacy\'s own code. <span>Cited, and checked.</span></h1><div class="cols">' + col('what it says', claims) + col('not built yet', notYet) + col('credentials', cred) +
    '</div><div class="cr">Pictures: the real ERP twin page and the legacy iDempiere pilot, headless on the CPU · our rows were removed from the pilot after the shots · Key sounds: eklee and qubodup, OpenGameArt "Single Key Press Sounds", CC BY 3.0</div></div>', css), frames: null }]; }
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
