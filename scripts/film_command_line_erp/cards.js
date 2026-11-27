// ⚠ DO NOT REMOVE — film "Command Line ERP" (prompts/FILM_COMMAND_LINE_ERP.md): the cards, as PNG stills (1920x1080, headless Chrome on the CPU, --disable-gpu). Every command line, screen and answer printed here is
// read from out/facts.json (the real runs of facts.js); nothing is typed in by hand. PLAYBOOK C: dark background, bottom 230 px left empty for captions. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const F = require('./out/facts.json'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const short = (s) => String(s).replace(/\/tmp\/cle_[A-Za-z0-9]+\//g, '…/');   // the scratch folder of the run is not the film's business
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
const L = F.lines;
// ── the beats ──
const LS = F.list.screens, NS = F.new.screens, ES = F.edit.screens, DS = F.delete.screens;
const newForm = pick(NS, s => s.key === '+'), newTyped = pick(NS, s => /^=Film Partner/.test(s.key)), newConfirm = pick(NS, s => /Save\?/.test(s.text)), newDone = pick(NS, s => s.key === 'y');
const edForm = pick(ES, s => /^Edit /.test(s.text)), edConfirm = pick(ES, s => /Save\?/.test(s.text)), edDone = pick(ES, s => s.key === 'y');
const dPop = pick(DS, s => /\[y\/N\]/.test(s.text)), dRef = pick(DS, s => /refused:/.test(s.text));
const TERM = {
  load: { h: 'A CSV: look first, write nothing', cpf: 1.5, steps: [
    { cmd: short(L.load_preview.line), after: [ans('<b>' + F.load.rows + '</b> lines &nbsp;·&nbsp; <b>' + F.load.ok + '</b> ok &nbsp;·&nbsp; <b>' + F.load.rejected + '</b> rejected'), dim('line ' + 2 + ': ' + cut(F.load.why, 80)), dim('written beside the file: film_partners.rejected.csv, film_partners.ok.csv')] },
    { cmd: short(L.load_ok.line), after: [ans('loaded: <b>' + F.load.loaded + '</b> &nbsp;·&nbsp; <b>' + F.load.keys + '</b> record'), dim('through the same save as the window: defaults, tree node, accounts')] }] },
  ai: { h: 'An AI, with the very same line', cpf: 1.5, steps: [
    { cmd: 'door --actor ai ' + F.ai.line, after: [ans('<b>' + F.ai.status + '</b>: held for a person, nothing written'), dim(cut(F.ai.why, 118))] },
    { cmd: 'door --confirm film-ai', after: [ans('<b>' + F.ai.confirmStatus + '</b> &nbsp;·&nbsp; ' + esc(F.ai.confirmedBy) + ' confirmed &nbsp;·&nbsp; written: <b>' + esc(F.ai.number) + '</b>')] }] },
  legacy: { h: 'The same door asks the real iDempiere', cpf: 1, steps: [
    { cmd: L.status.line, after: [ans(esc(F.legacy.summary).replace('UP', '<b>UP</b>'))] },
    { cmd: L.compare.line, after: [ans('<b>' + F.compare.match + '</b> cells match &nbsp;·&nbsp; <b>' + F.compare.diff + '</b> differ &nbsp;·&nbsp; <b>' + F.compare.nullVsDefault + '</b> empty on the other side'), dim('our order ' + F.compare.twinNumber + ' against legacy order ' + F.compare.legacyNumber)] }] }
};
const dgCss = '.dg{display:flex;gap:30px;align-items:stretch;margin-top:6px} .col{display:flex;flex-direction:column;gap:10px;justify-content:center} .bx{background:#111827;border:2px solid #475569;border-radius:14px;padding:11px 20px;font-size:26px;line-height:1.25;text-align:center} .bx b{color:#7dd3fc} .bx small{display:block;color:#94a3b8;font-size:21px;margin-top:4px}'
  + ' .ok{border-color:#4ade80} .pl{border:2px dashed #fbbf24;color:#fbbf24;opacity:.9} .pl small{color:#fbbf24} .hd2{font-size:24px;color:#94a3b8;margin-bottom:8px;letter-spacing:1px} .arr{align-self:center;font-size:54px;color:#475569} .note{margin-top:14px;font-size:30px;color:#fbbf24}';
const actorBox = (n, sub) => '<div class="bx ' + (F.onedoor.planned.includes(n) ? 'pl' : 'ok') + '"><b>' + esc(n) + '</b><small>' + esc(sub) + '</small></div>';
const oneDoor = page('<h1>One door: ' + esc(F.onedoor.title.replace(/^Every/, 'every').replace(/^every/, 'Every').toLowerCase().replace(/^every/, 'every')) + '</h1><div class="dg">'
  + '<div class="col"><div class="hd2">' + esc(F.onedoor.stages[0]) + '</div>' + actorBox('AI', 'tool connection (MCP)') + actorBox('Person', 'terminal or script file') + actorBox('Mailbox', F.onedoor.caveat) + actorBox('Phone', F.onedoor.caveat) + actorBox('Device', F.onedoor.caveat) + '</div><div class="arr">›</div>'
  + '<div class="col"><div class="hd2">' + esc(F.onedoor.stages[1]) + '</div><div class="bx" style="padding:34px 26px"><b>one list</b><small>app.verb key=value</small><small>name, inputs, units, harm,</small><small>who may use it</small><small>' + F.verbs + ' verbs</small></div></div><div class="arr">›</div>'
  + '<div class="col"><div class="hd2">' + esc(F.onedoor.stages[2]) + '</div><div class="bx" style="padding:34px 26px"><b>the same engine</b><small>parse · check · bind</small><small>call · reply</small></div></div><div class="arr">›</div>'
  + '<div class="col"><div class="hd2">' + esc(F.onedoor.stages[3]) + '</div><div class="bx ok" style="padding:20px 24px"><b>Kernel ERP</b><small>the mis verbs run here</small></div><div class="bx ok" style="padding:20px 24px"><b>legacy iDempiere</b><small>asked: status, compare</small></div></div></div>'
  + '<div class="note">green: works today &nbsp;·&nbsp; dashed: ' + esc(F.onedoor.caveat) + '</div>' + LABEL, dgCss);
const lightCard = page('<h1>How light</h1><div style="display:flex;gap:44px;margin-top:40px"><div class="file" style="flex:1;font-size:34px;line-height:1.7"><i>the screen logic</i><br><b style="color:#fbbf24;font-size:96px">' + F.light.coreLines + '</b> lines<br><span style="color:#94a3b8;font-size:26px">' + esc(F.light.coreFile) + '</span></div>'
  + '<div class="file" style="flex:1;font-size:34px;line-height:1.7"><i>what it needs</i><br><b style="color:#fbbf24;font-size:96px">' + F.light.coreRequires + '</b> dependencies<br><span style="color:#94a3b8;font-size:26px">the driver (' + F.light.driverLines + ' lines) only reads keys and runs door lines</span></div></div>'
  + '<div class="dim" style="margin:12px 0 0 0;font-size:32px">a terminal · no server · lines counted from the two files</div>' + LABEL);
const cards = {
  title: still(page('<div class="ch"><div class="k">BIM + ERP &nbsp;·&nbsp; OPEN SOURCE</div><div class="t1">Command Line ERP</div><div class="t2">light, hands-on, talks to AI</div><div class="p">runs off the Kernel ERP and legacy iDempiere &nbsp;·&nbsp; a prototype</div></div>',
    'body{background:#0b0f17} .ch{text-align:center;margin-top:120px} .k{font-size:32px;color:#FF6B78;letter-spacing:4px;font-weight:700} .t1{font-size:128px;font-weight:700;color:#F3EEE8;margin-top:36px} .t2{font-size:54px;color:#7dd3fc;margin-top:18px} .p{font-size:34px;color:#94a3b8;margin-top:50px}')),
  intro: still(page('<div class="plain">Before windows, there was a prompt.<br><span>a list &nbsp;·&nbsp; a pick &nbsp;·&nbsp; a key</span></div>')),
  list: LS.slice(0, 3).map(s => ({ html: scrCard(F.list.kind + ': a list, a pointer, buttons on the row', s.text), frames: null })),
  keys: still(scrCard('A key is one line', LS[2].text, 'this whole session ran <b>' + F.keys.lines + '</b> lines: ' + F.keys.session.map(l => '<b>' + esc(cut(l, 64)) + '</b>').join(' &nbsp;·&nbsp; ') + ' &nbsp;·&nbsp; moving ran none')),
  new: [newForm, newTyped, newConfirm, newDone].map(s => ({ html: scrCard('A new partner: the form asks only what the engine cannot fill', s.text), frames: null })),
  edit: [edForm, edConfirm, edDone].map(s => ({ html: scrCard('An edit sends only the changed column', s.text), frames: null })),
  delete: [dPop, dRef].map(s => ({ html: scrCard('A delete asks first, and the engine can refuse', s.text), frames: null })),
  load: termStates(TERM.load), ai: termStates(TERM.ai), legacy: termStates(TERM.legacy),
  onedoor: still(oneDoor), light: still(lightCard),
  close: still(page('<div class="plain" style="margin-top:130px;font-size:80px">A prompt, a pointer,<br>and one door.</div><div style="text-align:center;font-size:44px;color:#FF6B78;margin-top:34px">a prototype &nbsp;·&nbsp; open source</div><div style="text-align:center;font-size:38px;color:#7dd3fc;margin-top:50px">red1oon.github.io/BIMCompiler/FastScriptGuide</div>'))
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
