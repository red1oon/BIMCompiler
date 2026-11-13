// ⚠ DO NOT REMOVE — film "A table of your own, in one line" (prompts/FILM_COMMAND_LINE_ERP.md, FOLLOW-UP FILM): the cards (the drawing helpers and the still loop are the first film's cards.js), as PNG stills (1920x1080, headless Chrome on the CPU, --disable-gpu). Every command line, screen and answer printed here is
// read from out/facts.json (the real runs of facts.js); nothing is typed in by hand. PLAYBOOK C: dark background, bottom 230 px left empty for captions. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const F = require('./out/facts.json'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const short = (s) => String(s).replace(/\/tmp\/toy_[A-Za-z0-9]+\//g, '…/');   // the scratch folder of the run is not the film's business
const page = (inner, extra) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans',sans-serif;overflow:hidden}
.area{position:absolute;left:110px;right:110px;top:80px;height:750px}
h1{font-size:44px;color:#7dd3fc;font-weight:700;margin-bottom:26px}
.term{background:#0b0f17;border:2px solid #334155;border-radius:18px;padding:30px 38px;font-family:'DejaVu Sans Mono',monospace;font-size:36px;line-height:1.5}
.cmd{color:#F3EEE8;white-space:pre-wrap;word-break:break-all} .cmd:before{content:'> ';color:#4ade80}
.ans{color:#fbbf24;margin:2px 0 18px 46px} .ans b{color:#7dd3fc;font-weight:700} .dim{color:#94a3b8;font-size:28px;margin:0 0 16px 46px}
.scr{background:#0b0f17;border:2px solid #334155;border-radius:18px;padding:26px 30px;font-family:'DejaVu Sans Mono',monospace;font-size:25px;line-height:1.42;white-space:pre-wrap;word-break:break-all;color:#cbd5e1}
.scr .hd{color:#7dd3fc;font-weight:700} .scr .cur{color:#F3EEE8;background:#1e293b} .scr .hi{background:#4ade80;color:#0b0f17;font-weight:700} .scr .nt{color:#fbbf24} .scr .dm{color:#94a3b8} .scr .run{color:#4ade80}
.plain{font-size:62px;line-height:1.5;margin-top:150px;text-align:center} .plain span{color:#94a3b8;font-size:46px}
.file{background:#111827;border:2px dashed #475569;border-radius:14px;padding:20px 28px;font-family:'DejaVu Sans Mono',monospace;font-size:28px;line-height:1.45;margin-bottom:22px} .file i{color:#94a3b8;font-style:normal;font-size:24px}
.cur2{display:inline-block;width:20px;height:38px;background:#4ade80;vertical-align:-6px;margin-left:2px}
.lab{position:absolute;right:0;bottom:0;border:2px solid #fbbf24;color:#fbbf24;border-radius:10px;padding:8px 22px;font-size:26px;font-weight:700;letter-spacing:2px}
.call{color:#4ade80;font-size:32px;margin:22px 0 0 8px} .call b{color:#F3EEE8}
${extra || ''}</style></head><body><div class="area">${inner}</div></body></html>`;
const LABEL = '<div class="lab">PROTOTYPE</div>';
const ans = (h) => '<div class="ans">' + h + '</div>', dim = (s) => '<div class="dim">' + esc(s) + '</div>';
// a real mis.js plain screen, drawn: the pointed row, the highlighted button, the notes
const scr = (text) => '<div class="scr"' + (text.split('\n').length > 15 ? ' style="font-size:21px;line-height:1.36;padding:18px 26px"' : '') + '>' + text.split('\n').map((l, i) => {
  let h = esc(l).replace(/&gt;\[([^\]]*)\]&lt;/g, '<span class="hi"> $1 </span>');
  if (i === 0) return '<span class="hd">' + h + '</span>';
  if (/^ &gt; /.test(h)) return '<span class="cur">' + h + '</span>';
  if (/^the line it will run:/.test(l)) return '<span class="run">' + h + '</span>';
  if (/^(help:| Up\/Down| type to fill| y saves)/.test(l)) return '<span class="dm">' + h + '</span>';
  if (/refused:|created |Save\?|\[y\/N\]|cancelled|no changes|saved/.test(l)) return '<span class="nt">' + h + '</span>';
  return h; }).join('\n') + '</div>';
const scrCard = (title, text, callout) => page('<h1>' + title + '</h1>' + scr(text) + (callout ? '<div class="call">' + callout + '</div>' : '') + LABEL);
const termPage = (b, s, k, done) => page('<h1>' + b.h + '</h1><div class="term">' + b.steps.slice(0, s + 1).map((x, i) => i < s ? '<div class="cmd">' + esc(x.cmd) + '</div>' + x.after.join('')
  : '<div class="cmd">' + esc(x.cmd.slice(0, k)) + (done ? '' : '<span class="cur2"></span>') + '</div>' + (done ? x.after.join('') : '')).join('') + '</div>' + LABEL);
function termStates(b) {   // {html, frames}: frames null = shares the beat's remaining time (the answer is on screen)
  const out = [{ html: termPage(b, 0, 0, false), frames: 18 }];
  b.steps.forEach((x, s) => { const stepK = b.cpf >= 1 ? b.cpf : 1, fr = b.cpf >= 1 ? 1 : Math.round(1 / b.cpf);
    for (let k = stepK; k < x.cmd.length; k += stepK) out.push({ html: termPage(b, s, k, false), frames: fr });
    out.push({ html: termPage(b, s, x.cmd.length, false), frames: 6 }); out.push({ html: termPage(b, s, x.cmd.length, true), frames: null }); });
  return out;
}
const still = (html) => [{ html, frames: null }];
const pick = (list, f) => list.filter(f)[0];
const L = F.lines, PA = require('./priorart.json');
// the two-tone chapter card, house typography (scripts/film_unicenta_till/cards.js chap(): kicker coral, line 1 off-white, line 2 coral, one sub line, plain #0b0f17, silent)
const CH = 'body{background:#0b0f17} .area{top:0;height:850px} .ch{text-align:center;margin-top:250px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:118px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .t2{font-size:118px;font-weight:700;color:#FF6B78;line-height:1.15} .p{font-size:40px;color:#94a3b8;margin-top:44px}';
const chap = (k, l1, l2, sub) => page('<div class="ch"><div class="k">' + esc(k) + '</div><div class="t1">' + esc(l1) + '</div><div class="t2">' + esc(l2) + '</div><div class="p">' + esc(sub) + '</div></div>', CH);
const FS = F.first.screens, fForm = pick(FS, s => s.key === '+'), fTyped = pick(FS, s => /^=Tractor/.test(s.key)), fConfirm = pick(FS, s => /Save\?/.test(s.text)), fDone = pick(FS, s => s.key === 'y');
const file = (name, lines) => '<div class="file"><i>' + esc(name) + '</i>\n' + lines.map((l, i) => '<div' + (i === 0 ? ' style="color:#7dd3fc"' : '') + '>' + esc(l) + '</div>').join('') + '</div>';
const sheetCard = page('<h1>A sheet: one line for each column</h1>' + file(F.sheet.file, F.sheet.text) + '<div class="call"><b>' + F.sheet.columns + '</b> columns written by a person &nbsp;·&nbsp; only <b>Column</b> is required</div>' + LABEL, '.file{font-size:34px;line-height:1.6}');
const TERM = {
  oneline: { h: 'One line makes the window', cpf: 1.5, steps: [
    { cmd: L.add.line, after: [ans('table <b>' + esc(F.add.table) + '</b> &nbsp;·&nbsp; window <b>' + esc(F.add.window) + '</b> &nbsp;·&nbsp; form, menu entry'), ans('<b>' + F.add.standard + '</b> columns added for you &nbsp;·&nbsp; <b>' + F.add.roles + '</b> roles given access'), dim('added: ' + cut(F.add.standardNames.join(', '), 96)), dim('no code written for it: the same engine runs every window')] }] },
  refuse1: { h: 'A mandatory column is asked for', cpf: 1.5, steps: [
    { cmd: L.refuse1.line, after: [ans('<b>refused</b>'), dim(cut(F.refuse1.why, 100)), dim('nothing was written')] }] },
  refuse2: { h: 'A value outside the sheet\'s list is refused', cpf: 1.5, steps: [
    { cmd: L.refuse2.line, after: [ans('<b>refused</b> &nbsp;·&nbsp; it accepts: <b>' + F.refuse2.valid.map(esc).join('</b>, <b>') + '</b>'), dim(cut(F.refuse2.why, 100))] }] },
  stamp: { h: 'Who made it, and when', cpf: 1.5, steps: [
    { cmd: L.read.line, after: [ans('name <b>' + esc(F.stamp.name) + '</b> &nbsp;·&nbsp; condition <b>' + esc(F.stamp.condition) + '</b>'), ans('created <b>' + esc(F.stamp.created) + '</b> &nbsp;·&nbsp; by user <b>' + esc(F.stamp.createdby) + '</b>'), dim('its own id: ' + F.stamp.uu), dim('the user is a stated default: sign-in is not built')] }] },
  restart: { h: 'Close everything, come back', cpf: 1.5, steps: [
    { cmd: L.restart.line, after: [ans('<b>' + F.restart.total + '</b> record &nbsp;·&nbsp; ' + F.restart.rows.map(r => esc(r.Name) + ', ' + esc(r.Condition)).join(' ; ')), dim('a separate process: the window and its rows are replayed from the log')] }] }
};
const paCss = '.pa{display:flex;gap:34px;margin-top:4px} .pc{flex:1} .ph{font-size:26px;letter-spacing:2px;color:#94a3b8;margin-bottom:12px} .pi{background:#111827;border:2px solid #334155;border-radius:12px;padding:12px 18px;margin-bottom:10px} .pi b{display:block;font-size:25px;color:#7dd3fc;font-weight:700} .pi span{display:block;font-size:22px;color:#F3EEE8;margin-top:3px;line-height:1.3} .pi i{display:block;font-style:normal;font-size:16px;color:#94a3b8;margin-top:4px;font-family:"DejaVu Sans Mono",monospace;word-break:break-all} .pf{margin-top:8px;font-size:27px;color:#fbbf24} .pn{font-size:21px;color:#94a3b8;margin-top:4px} h1{margin-bottom:16px}';
const pItem = (e) => '<div class="pi"><b>' + esc(e.line) + '</b><span>' + esc(e.took || e.does) + '</span><i>' + esc(/^https:/.test(e.source) ? e.source.replace(/^https:\/\//, '') : e.source.split('/')[0] + ' … ' + e.source.split('/').slice(-2).join('/')) + '</i></div>';
const priorCard = page('<h1>Prior art: what this learned from</h1><div class="pa"><div class="pc"><div class="ph">READ IN THE SOURCE, AND USED</div>' + PA.learned.map(pItem).join('') + '</div><div class="pc"><div class="ph">NEARBY TOOLS, PAGES READ 2026-11-14</div>' + PA.nearby.map(pItem).join('')
  + '<div class="pf">' + esc(PA.found) + '</div><div class="pn">' + esc(PA.notSearched) + '</div></div></div>', paCss);
const cards = {
  cover: still(chap('COMMAND LINE ERP  ·  PART 2', 'A table of your own,', 'in one line', 'a spreadsheet\'s columns become a working window')),
  sheet: still(sheetCard),
  oneline: termStates(TERM.oneline),
  empty: still(scrCard('The new table, with no rows yet', F.empty.screen)),
  first: [fForm, fTyped, fConfirm, fDone].map(s => ({ html: scrCard('The first record: the form asks only what the engine cannot fill', s.text), frames: null })),
  refuse1: termStates(TERM.refuse1), refuse2: termStates(TERM.refuse2), stamp: termStates(TERM.stamp), restart: termStates(TERM.restart),
  priorart: still(priorCard),
  close: still(page('<div class="plain" style="margin-top:130px;font-size:80px">One sheet, one line,<br>a working window.</div><div style="text-align:center;font-size:44px;color:#FF6B78;margin-top:34px">a prototype &nbsp;·&nbsp; open source</div><div style="text-align:center;font-size:38px;color:#7dd3fc;margin-top:50px">red1oon.github.io/BIMCompiler/FastScriptGuide</div>'))
};
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}; let n = 0, tall = 0;
  for (const id of Object.keys(cards)) { plan[id] = []; let worst = 0;
    for (let i = 0; i < cards[id].length; i++) { const name = id + '_' + String(i + 1).padStart(3, '0') + '.png'; await pg.setContent(cards[id][i].html, { waitUntil: 'load' });
      const over = await pg.evaluate(() => { const a = document.querySelector('.area'); const l = document.querySelector('.lab'); const body = a.lastElementChild === l ? a.children[a.children.length - 2] : a.lastElementChild; const clash = body && l ? Math.max(0, body.getBoundingClientRect().bottom - (window.innerHeight - 230)) : 0; const wide = Array.from(a.querySelectorAll('.scr,.term,.dg,.file')).reduce((m, e) => Math.max(m, e.scrollWidth - e.clientWidth), 0); return Math.max(a.scrollHeight - a.clientHeight, a.scrollWidth - a.clientWidth, clash, wide); });
      worst = Math.max(worst, over); await pg.screenshot({ path: path.join(out, name) }); plan[id].push({ file: name, frames: cards[id][i].frames }); n++; }
    if (worst) tall++; console.log('§CARD beat=' + id + ' stills=' + cards[id].length + ' overflow_px=' + worst + (worst ? ' TOO-TALL' : '')); }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
