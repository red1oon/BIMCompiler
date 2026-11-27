// ⚠ DO NOT REMOVE — film v3 "Help that checks before you complete" (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.22; adapted from film_ctxhelp_derived/cards.js; house style prompts/FILM_NARRATION.md): the stills (1920x1080 PNG, headless
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
// ── v3 content: every value below is read from out/facts.json (shots.js + facts.js) or out/legacy.json; nothing is typed by hand ──
const nw = F.now, ou = F.ours, ho = F.help, WORDS = ou.words, why = (l) => (/why="([^"]*)"/.exec(l || '') || [])[1] || '?', docno = F.seed.documentno, band = (name, label) => panelBand(name, label);
const SO_LINE = 'Sales Order ' + docno + ', customer Joe Block';
cards.cover = [{ html: full('<div class="ch"><div class="k">KERNEL-ERP · HELP</div><div class="t1">Help that checks<br><span style="color:#FF6B78">before you complete</span></div><div class="s">What must be in place, what the action does, and what is wrong with this document: before you press</div><div class="c">The real pages, headless · English</div></div>'), frames: null }];
// 1/2/3 card (owner 2026-11-24: 1 what is now, 2 what is added, 3 what Kernel has more; technicalities to the credits cards; no table)
{ const css = `.o3{margin:70px 80px 0} .o3 h1{font-size:50px} .o3 h1 span{color:#FF6B78} .rows{margin-top:36px} .rw{display:grid;grid-template-columns:90px 330px 1fr;gap:20px;align-items:start;padding:20px 0;border-top:1px solid #334155}
    .rw .nb{font-size:72px;font-weight:700;color:#FF6B78;line-height:1} .rw .nm{font-size:30px;color:#7dd3fc;letter-spacing:2px;text-transform:uppercase;padding-top:12px} .rw .tx{font-size:30px;line-height:1.4;color:#F3EEE8} .rw .tx b{color:#4ade80}`;
  const added = Lg.applied.helps - Lg.before.helps;
  cards.card = [{ html: full('<div class="o3"><h1>Help that tells you <span>what to have in place</span></h1><div class="rows">' +
    '<div class="rw"><div class="nb">1</div><div class="nm">Now</div><div class="tx">iDempiere ships <b>' + Lg.before.helps + ' help topic</b>, and says what is wrong only after you press Complete, one reason at a time.</div></div>' +
    '<div class="rw"><div class="nb">2</div><div class="nm">Added</div><div class="tx"><b>' + added + ' help topics</b>, one for every core window (' + F.derived.windows + ' of ' + F.derived.of + '): what you need first, what Complete does, what can stop it. Also for iDempiere users, by a script.</div></div>' +
    '<div class="rw"><div class="nb">3</div><div class="nm">Kernel ERP has more</div><div class="tx">The help <b>checks your document</b> before you complete, marks the field, and fixes it in one click. Click a window name in the help to open it. Ask "How do I…?" and get the window and the action.</div></div>' +
    '</div></div>', css), frames: null }]; }
// 2 NOW: the same twin, the checker never started (W-HELP-PEEK P8): Complete -> one reason; fix the date; Complete -> the next reason
cards.now = [
  { html: frame(lines([dim('Now: the same order in the twin, the help checker switched off: this is how legacy behaves.'), ans(SO_LINE + ' · ' + nw.open.chip + ' · Date Ordered ' + nw.open.date + ' (its period is closed) · the customer is on credit hold'), good('help buttons ' + nw.open.lens_buttons + ' · checks run before any press ' + nw.open.peek_lines)]), band('now_open', 'the order, as it opens'), TWIN, 'Sales Order ' + docno + ': nothing pressed yet'), frames: null },
  { html: frame(lines([dim('You press Complete. The page\'s own message:'), ans(nw.ref1.toast), good('legacy\'s words for it: “' + WORDS.PeriodClosed + '”   · the order stays: ' + nw.ref1.chip), dim(cut(nw.ref1.line, 200))]), band('now_ref1', 'Complete pressed'), TWIN, 'first press: one reason'), frames: null }];
// the date is typed FIRST in its beat (house style: the voice starts after the return key), then the second press
cards.fixdate = typed('Date Ordered ❯ ', nw.fixed.date, ans(cut(nw.fixed.save.replace(/ source=.*$/, ''), 200)) + good('Date Ordered ' + nw.open.date + ' → ' + nw.fixed.date + ', saved'), band('now_ref1', 'before the change'), band('now_fixed', 'the date changed and saved'), TWIN, 'you change the date', 'the date is saved')
  .concat([{ html: frame(lines([dim('You press Complete again. The page\'s own message:'), ans(cut(nw.ref2.toast, 200)), good('legacy\'s words for it: “' + WORDS.BPartnerCreditHold + '”   · the order stays: ' + nw.ref2.chip), dim(cut(nw.ref2.line, 200))]), band('now_ref2', 'Complete pressed again'), TWIN, 'second press: the next reason'), frames: null }]);
// 3 OURS: nothing pressed; the count on the ? door; the panel lists both and marks the fields
cards.ours = [
  { html: frame(lines([dim('Ours: the same order, the help switched on. Nothing has been pressed.'), ans(ou.bg), good('the help door shows ' + ou.badge + '   (the number of things to fix, found by itself on opening)')]), band('ours_door', 'the help door'), TWIN, 'the help door carries the count'), frames: null },
  { html: frame(lines([dim('Open the door: the panel lists what is wrong with this order, in the order iDempiere would stop it:'), ans(cut(ou.panel.text, 230)), dim(ou.mark), dim('W-HELP-PEEK (recording day): P1 nothing kept ' + F.peek.claims.P1.v + ' · P2 same answer as the real Complete ' + F.peek.claims.P2.v + ' · P3 every blocker, legacy order ' + F.peek.claims.P3.v + ' · P5p fields marked ' + F.peek.claims.P5p.v)]), band('ours_panel', 'the help panel, the two fields marked'), TWIN, 'the panel lists both, the fields are marked'), frames: null }];
// 4 FIX: one click; Undo Changes; Open
cards.fix = [
  { html: frame(lines([ans(ou.fix.set), good('Fix: Date Ordered ' + ou.fix.before + ' → ' + ou.fix.after + ' · the check now lists ' + JSON.stringify(/keys=(\[[^\]]*\])/.exec(ou.fix.repeek)[1])), dim('nothing is saved yet · W-HELP-PEEK PF2 ' + F.peek.claims.PF2.v)]), band('ours_fix', 'one click on Fix'), TWIN, 'Fix: the date becomes today'), frames: null },
  { html: frame(lines([good('Undo Changes: the form shows ' + ou.undo.form + ' again (the saved date was ' + ou.fix.before + ')'), dim('W-HELP-PEEK PF3 ' + F.peek.claims.PF3.v)]), band('ours_undo', 'Undo Changes'), TWIN, 'Undo Changes takes the fix back'), frames: null },
  { html: frame(lines([dim('Open, on the credit line:'), ans(ou.open.zoom), good('landed on the customer: ' + ou.open.landed + '   · W-HELP-PEEK P6 ' + F.peek.claims.P6.v)]), band('ours_open', 'the Business Partner window'), TWIN, 'Open takes you to the customer'), frames: null }];
// 5 DONE: Save -> the count follows; the person releases the hold; Complete goes through
cards.done = [
  { html: frame(lines([dim('Fix, then Save. The page checks again by itself:'), ans(ou.saved.bg), good('the help door now shows ' + ou.saved.badge + '   · W-HELP-PEEK B2 ' + F.peek.claims.B2.v)]), band('ours_saved', 'saved: the door follows'), TWIN, 'Save: one thing left'), frames: null },
  { html: frame(lines([dim('In the Business Partner window the person sets Credit Status and saves:'), good('Credit Status ' + ou.release.before.v + ' → ' + ou.release.after), ans(cut((ou.release.save || '').replace(/ source=.*$/, ''), 200))]), band('ours_release', 'the hold released'), TWIN, 'the hold is released'), frames: null },
  { html: frame(lines([dim('Back on the order: ' + ou.ready.bg), good('Complete → ' + ou.complete.chip), ans(cut(ou.complete.model, 200))]), band('ours_done', 'Complete'), TWIN, 'Complete goes through'), frames: null }];
// 6 every window has its help; the last line is the guide link; the live page
const heads = (t) => t.bolds.filter((b) => /\.$|:$/.test(b)).join(' · ');
cards.windows = [
  { html: frame(lines([dim('Shipment (Customer), header tab:'), ans(ho.ship.line), good(heads(ho.ship.t))]), band('help_ship', 'the help panel: Shipment'), TWIN, 'Shipment: what you need first, how to fill it'), frames: null },
  { html: frame(lines([dim('Purchase Order, header tab:'), ans(ho.po.line), good(heads(ho.po.t))]), band('help_po', 'the help panel: Purchase Order'), TWIN, 'Purchase Order: the same four parts'), frames: null },
  { html: frame(lines([dim('Sales Order, the last line of its topic:'), good(ho.so.t.guideText + '   →   ' + ho.so.t.guideHref)]), band('help_so_foot', 'the last line of the topic'), TWIN, 'the link to the guide'), frames: null },
  { html: frame(lines([dim('The same address, fetched from the internet:'), good('HTTP ' + F.guide.status + ' · section “' + F.guide.anchor.text.replace(/¶$/, '') + '” found on the page'), dim(F.guide.href)]), lower(path.join(OUT, F.shots.guide_live.file), F.shots.guide_live.crop, 'the live Kernel-ERP User Guide'), 'the Kernel ERP User Guide, online', 'the same section'), frames: null }];
// 7 the ask (typed)
cards.ask = typed('help ❯ ', F.ask.q, ans('window: ' + F.ask.window.name + ' · action: ' + F.ask.action.name + '   at the command line: ' + F.ask.cli) + dim('matched: ' + (F.ask.matched || []).join(', ')) + good('the answer card names the window and the action'),
  band('help_so_foot', 'the help panel'), band('ask_card', 'the answer card'), TWIN, 'you type a question', 'the help answers');
// 8 real iDempiere: the script applied to the pilot, legacy's own ZK panel; the pilot restored after (legacy.log, pilot_witness.log)
{ const lk = Lg.lookup257, ps = F.pilot.counts.map((c) => /=(\d+)/.exec(c)[1]).join(' / '), cmd = 'psql -d idempiere_pilot -f ' + path.basename(Lg.script);
  const out = ans('§LEGACY_APPLIED helps ' + Lg.before.helps + ' -> ' + Lg.applied.helps + ', links 0 -> ' + (Lg.applied.tabLinks + Lg.applied.procLinks) + '   (' + Lg.applied.tabLinks + ' tabs, ' + Lg.applied.procLinks + ' processes)') + good('§LEGACY_LOOKUP tab=' + Lg.cfg.tab + '  legacy\'s own join AD_Tab -> AD_CtxHelp = our UUID ' + lk.uu.slice(0, 8) + '…  (' + lk.len + ' chars)') +
    dim('then our rows removed by their UUIDs: pilot back to its snapshot = ' + Lg.back + '; ad_ctxhelp / tab links / process links = ' + ps + ';  L&F parity ' + F.lf.verdict.replace('§LF_VERDICT ', ''));
  const st = (k, l) => frame(termTyped('$ ', cmd, 99999, true, out), zkBand(k, l), 'legacy iDempiere, purchase order ' + Lg.order.no + ': its own panel', 'applied to the legacy pilot database');
  cards.legacy = typed('$ ', cmd, out, band('help_po', 'the twin: Purchase Order'), zkBand('top', 'legacy iDempiere\'s own How To panel'), 'applied to the legacy pilot database', 'the twin: the same topic', 'real iDempiere: the tab\'s own words, then ours');
  cards.legacy.push({ html: st('complete', 'legacy iDempiere\'s own How To panel'), frames: null }, { html: st('tail', 'legacy iDempiere\'s own How To panel'), frames: null }); }
// 9 the admin report card: tested once, silent, not part of the show (owner 2026-11-24)
{ const css = `.rc{margin:38px 50px 0} .rc h1{font-size:40px} .rc h1 span{color:#94a3b8;font-size:24px;font-weight:400;margin-left:18px} .g{display:grid;grid-template-columns:repeat(11,1fr);gap:8px;margin-top:20px} .c1{background:#13203a;border:1px solid #334155;padding:8px 10px;font-size:19px} .c1 b{color:#4ade80} .c1 i{color:#94a3b8;font-style:normal;font-size:16px;display:block}
    .ln{font-size:21px;line-height:1.5;margin-top:20px;color:#cbd5e1;overflow-wrap:anywhere} .ln b{color:#7dd3fc}`;
  const cs = Object.keys(F.peek.claims).filter((k) => k !== 'RED').map((k) => '<div class="c1"><b>' + esc(k) + ' ' + esc(F.peek.claims[k].v) + '</b><i>judged ' + F.peek.claims[k].judged + '</i></div>').join('');
  const sh = (s) => esc(String(s).replace(/^.*§WITNESS_/, '').replace(/ CTX_BREAK.*$/, ''));
  cards.admin = [{ html: full('<div class="rc"><h1>Admin report card <span>tested once, on the recording day · main ' + esc(F.tree) + ' · not part of the show</span></h1>' +
    '<div class="ln"><b>W-HELP-PEEK</b> ' + esc(F.peek.verdict.replace('§HELP_PEEK ', '')) + ' · red runs: ' + esc(F.peek.red.replace('§HELP_PEEK RED ', '')) + ' (' + F.peek.reds.length + ' of ' + F.peek.reds.length + ' fail as they must)</div><div class="g">' + cs + '</div>' +
    '<div class="ln"><b>W-CTXHELP-OVERLAY</b> ' + sh(F.overlay.verdict) + '<br><b>W-CTXHELP-DERIVED</b> ' + sh(F.derived.verdict) + ' · red run (a cited line moved by one): ' + sh(F.red.verdict) + '<br><b>W-CTXHELP-LEGACY</b> ' + sh(F.legacyW.verdict) +
    '<br><b>The pilot after the shots</b> ad_ctxhelp / tab links / process links = ' + esc(F.pilot.counts.map((c) => /=(\d+)/.exec(c)[1]).join(' / ')) + ' · ' + esc(F.lf.verdict.replace('§LF_VERDICT ', 'L&F parity ')) + '</div></div>', css), frames: null }]; }
// close: prior art read, credentials, technicalities in rows, key-sound credit, the live guide link
{ const css = `.lc{margin:40px 60px 0} .lc h1{font-size:44px} .lc h1 span{color:#FF6B78} .cols{display:grid;grid-template-columns:560px 520px 640px;gap:36px;margin-top:22px}
    .col h2{font-size:21px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px} .r{font-size:20px;line-height:1.32;padding:6px 0;border-top:1px solid #334155;overflow-wrap:anywhere} .r b{color:#7dd3fc} .r i{color:#fbbf24;font-style:normal}
    .cr{position:absolute;left:60px;bottom:186px;font-size:17px;color:#94a3b8;width:1800px;line-height:1.4}`;
  const col = (h, rows) => '<div class="col"><h2>' + h + '</h2>' + rows.map((x) => '<div class="r">' + x + '</div>').join('') + '</div>';
  const art = ['<b>Microsoft Business Central</b><br>the journal Check while you work; errors that say what to do (the survey of VOCAB §19.21)', '<b>SAP ME21N</b><br>Check before you save an order', '<b>iDempiere</b><br>HelpController.renderCtxHelp, MCtxHelpMsg (the text cache), the DocAction classes MOrder, MInOut, MInvoice (<i>read at ~/idempiere-dev-setup</i>)'];
  const cred = ['<b>' + esc(F.credentials.repo) + '</b> · ' + esc(F.credentials.licence), '<b>Merged</b><br>bim-ootb ' + F.credentials.prs.filter((x) => /ootb/.test(x.repo)).map((x) => '#' + x.n).join(' ') + '<br>BIMCompiler ' + F.credentials.prs.filter((x) => /BIMCompiler/.test(x.repo)).map((x) => '#' + x.n).join(' '), '<b>Witnessed on main ' + esc(F.tree) + '</b><br>W-HELP-PEEK ' + esc(F.peek.verdict.replace('§HELP_PEEK VERDICT ', '')) + ' (' + Object.keys(F.peek.claims).filter((k) => k !== 'RED').length + ' claims, ' + F.peek.reds.length + ' red runs)'];
  const tech = ['<b>' + (Lg.applied.helps - Lg.before.helps) + ' topics</b> · ' + F.rows.tabs + ' tabs + ' + F.rows.procs + ' processes · ' + F.derived.windows + ' of ' + F.derived.of + ' core windows', '<b>The checker\'s rows</b> ' + (F.rows.peekAssume + F.rows.peekField + F.rows.peekFix) + ' (' + F.rows.peekAssume + ' assume · ' + F.rows.peekField + ' field · ' + F.rows.peekFix + ' fix), each cites its check: ' + F.rows.peekCited + ' of ' + (F.rows.peekAssume + F.rows.peekField + F.rows.peekFix), '<b>Effects read from legacy\'s source</b> ' + F.rows.effects, '<b>The legacy script</b> ' + Object.keys(F.script.statements).map((k) => F.script.statements[k] + ' ' + k.split(' ')[0]).join(' · ') + ' · ' + F.script.ddl + ' DDL'];
  cards.close = [{ html: full('<div class="lc"><h1>A document tells you what to have in place. <span>Before you act.</span></h1><div class="cols">' + col('prior art read', art) + col('credentials', cred) + col('the technicalities, in rows', tech) +
    '</div><div class="cr">Live guide: ' + esc(F.guide.href) + ' · Pictures: the real ERP twin page and the legacy iDempiere pilot, headless on the CPU · our rows were removed from the pilot after the shots · ' + esc(F.licenceFooter) + '</div></div>', css), frames: null }]; }
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
