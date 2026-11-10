// ⚠ DO NOT REMOVE — film "From AI to Human": the cards, as PNG stills (1920x1080, headless Chrome on the CPU, --disable-gpu). Every command line and answer printed here is read from
// out/facts.json (the real runs of facts.js); nothing is typed in by hand. PLAYBOOK C: dark background, bottom 230 px left empty for captions. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const F = require('./out/facts.json'), out = path.resolve(process.argv[2] || 'out/cards'); fs.mkdirSync(out, { recursive: true });
const ZHL = process.env.FILM_LANG === 'zh';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const L = (id) => F.lines[id].line;
const page = (inner, extra) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:'DejaVu Sans','Noto Sans CJK SC',sans-serif;overflow:hidden}
.area{position:absolute;left:110px;right:110px;top:95px;height:735px}
h1{font-size:46px;color:#7dd3fc;font-weight:700;margin-bottom:34px}
.term{background:#0b0f17;border:2px solid #334155;border-radius:18px;padding:34px 40px;font-family:'DejaVu Sans Mono','Noto Sans CJK SC',monospace;font-size:38px;line-height:1.5}
.cmd{color:#F3EEE8;white-space:pre-wrap} .cmd:before{content:'> ';color:#4ade80}
.ans{color:#fbbf24;margin:2px 0 22px 46px} .ans b{color:#7dd3fc;font-weight:700} .dim{color:#94a3b8;font-size:30px;margin:0 0 20px 46px}
.big{font-size:150px;font-weight:700;text-align:center;margin-top:170px} .sub{font-size:44px;color:#FF6B78;text-align:center;margin-top:30px}
.plain{font-size:60px;line-height:1.5;margin-top:60px} .plain span{color:#94a3b8}
table{border-collapse:collapse;width:100%;font-size:32px} td{padding:13px 18px;border-bottom:1px solid #334155;vertical-align:top} td:first-child{color:#7dd3fc;font-weight:700;white-space:nowrap} .foot{font-size:32px;color:#fbbf24;margin-top:26px;line-height:1.4} .src{font-size:22px;color:#64748b;margin-top:12px}
.file{background:#111827;border:2px dashed #475569;border-radius:14px;padding:22px 30px;font-family:'DejaVu Sans Mono',monospace;font-size:34px;line-height:1.5;margin-bottom:26px} .file i{color:#94a3b8;font-style:normal;font-size:26px}
.cur{display:inline-block;width:20px;height:40px;background:#4ade80;vertical-align:-6px;margin-left:2px} .lab{position:absolute;right:0;bottom:0;border:2px solid #4ade80;color:#4ade80;border-radius:10px;padding:10px 24px;font-size:28px;font-weight:700} .shot{display:block;margin:0 auto;height:620px;border-radius:12px;border:2px solid #334155}
${extra || ''}</style></head><body><div class="area">${inner}</div></body></html>`;
// every on-screen text of the film (the command lines and the answers are printed from out/facts.json)
const T = { kick: 'BIM + ERP &nbsp;·&nbsp; OPEN SOURCE', t1: 'From AI to Human', t2: 'Scripts made for people', tp: 'What an assistant writes for itself, now a line anyone can type.',
  intro1: 'An AI writes small scripts for its own work.', intro2: 'Then it throws them away.', after: 'After: one line', label: 'Local First use is secured / air-gapped',
  closeBig: 'A line, not a script', closeSub: 'Open source &nbsp;·&nbsp; ' + F.verbs + ' verbs today' };
const ans = (h) => '<div class="ans">' + h + '</div>', dim = (s) => '<div class="dim">' + esc(s) + '</div>';
const LABEL = '<div class="lab">' + T.label + '</div>';
const cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const box = (label, lines, small) => '<div class="file"' + (small ? ' style="font-size:26px"' : '') + '><i>' + esc(label) + '</i><br>' + lines.map(x => esc(x)).join('<br>') + '</div>';
const B = F.before, doorLine = (id) => F.lines[id].line;
const diffs = F.compare.diffs.filter(d => /\(DIFF\)$/.test(d)).map(d => d.replace(/ \(DIFF\)$/, ''));
// the beats: BEFORE = what the assistant wrote or typed (measured from a file, or quoted with its source); AFTER = the same job as one real door line
const TERM = {
  twin: { h: T.after, cpf: 1, pre: box('before: ' + B.twin.file + ' (' + B.twin.lines + ' lines)', B.twin.head.map(x => cut(x, 100)).concat(['… and ' + (B.twin.lines - 3) + ' more lines']), true),
    steps: [{ cmd: doorLine('compare'), after: [ans('<b>' + F.compare.cells.match + '</b> cells match &nbsp;·&nbsp; <b>' + F.compare.cells.diff + '</b> differ &nbsp;·&nbsp; <b>' + F.compare.cells.nullVsDefault + '</b> empty on legacy'), dim(diffs.join('   '))] }] },
  column: { h: T.after, cpf: 1.5, pre: box('before: ' + B.column.source, [cut(B.column.cmd, 150), cut(B.column.cmd.slice(150), 150)], true),
    steps: [{ cmd: doorLine('column'), after: [ans('legacy fills it at login: row <b>' + F.column.legacyDefaultId + '</b>'), dim(F.column.twinNote)] }] },
  where: { h: T.after, cpf: 1, pre: box('before: ' + B.where.source, [B.where.cmd], true),
    steps: [{ cmd: doorLine('where'), after: [ans('<b>' + F.where.total + '</b> lines in the order callout'), dim(F.where.hits[0]), dim(F.where.hits[1])] }] },
  status: { h: T.after, cpf: 1, pre: box('before: ' + B.status.source, [B.status.cmd], true),
    steps: [{ cmd: doorLine('status'), after: [ans(esc(F.status.summary).replace('UP', '<b>UP</b>'))] }] },
  witness: { h: T.after, cpf: 1, pre: box('before: ' + B.witness.source, [B.witness.cmd], true),
    steps: [{ cmd: doorLine('witness'), after: [ans(esc(F.witness.name) + ' &nbsp; <b>' + F.witness.verdict + '</b> &nbsp;·&nbsp; <b>' + F.witness.pass + '</b> checks, ' + F.witness.fail + ' failed'), dim('the whole log is kept; witness.last reads it again')] }] },
  pack: { h: T.after, cpf: 1.5, pre: box('before: ' + B.pack.source, [cut(B.pack.cmd, 118), cut(B.pack.cmd.slice(118), 118)], true),
    steps: [{ cmd: doorLine('pack'), after: [ans('<b>' + F.pack.status + '</b> &nbsp;·&nbsp; <b>' + F.pack.elements + '</b> elements &nbsp;·&nbsp; <b>' + F.pack.processClasses + '</b> process classes named'), dim(F.pack.classes.join('   '))] }] },
  again: { h: T.after, cpf: 1.5, steps: [{ cmd: doorLine('pack_again'), after: [ans('<b>' + F.pack.again + '</b> &nbsp;·&nbsp; same sha256 ' + F.pack.sha + '…'), dim('a released pack is never changed: the same version with other rows is refused')] }] },
  claim: { h: T.after, cpf: 1.5, steps: [{ cmd: 'door --actor ai ' + doorLine('claim'), after: [ans('<b>' + F.claim.status + '</b>: held for a person, nothing written'), dim(F.claim.why)] }] }
};

const termPage = (b, s, k, done) => page('<h1>' + b.h + '</h1>' + (b.pre || '') + '<div class="term">' + b.steps.slice(0, s + 1).map((x, i) => i < s ? '<div class="cmd">' + esc(x.cmd) + '</div>' + x.after.join('')
  : '<div class="cmd">' + esc(x.cmd.slice(0, k)) + (done ? '' : '<span class="cur"></span>') + '</div>' + (done ? x.after.join('') : '')).join('') + '</div>' + LABEL);
// every state of a command beat: {html, frames} — frames null = shares the beat's remaining time (the answer is on screen)
function termStates(b) {
  const out = [{ html: termPage(b, 0, 0, false), frames: 18 }];
  b.steps.forEach((x, s) => { const stepK = b.cpf >= 1 ? b.cpf : 1, fr = b.cpf >= 1 ? 1 : Math.round(1 / b.cpf);
    for (let k = stepK; k < x.cmd.length; k += stepK) out.push({ html: termPage(b, s, k, false), frames: fr });
    out.push({ html: termPage(b, s, x.cmd.length, false), frames: 6 }); out.push({ html: termPage(b, s, x.cmd.length, true), frames: null }); });
  return out;
}
const SH = F.sheet, shTabs = SH.order.map((x, i) => '<span class="tab' + (x.name === 'AD_Column' ? ' on' : '') + '"><i>' + (i + 1) + '</i> ' + esc(x.name) + ' <u>' + x.rows + '</u></span>').join('');
const shGrid = '<table class="sg"><tr>' + SH.column.head.map(h => '<th>' + esc(h) + '</th>').join('') + '</tr>' + SH.column.rows.map(r => '<tr>' + r.map(v => '<td>' + esc(cut(v, 34)) + '</td>').join('') + '</tr>').join('') + '</table>';
const sheetCard = page('<h1>' + esc(SH.file) + ' &nbsp;·&nbsp; ' + SH.count + ' sheets, left to right</h1><div class="tabs">' + shTabs + '</div>' + shGrid + '<div class="dim" style="margin:22px 0 0 0">one row per record · first column Key · a cell reads ref:&lt;Key&gt; to point at a row of an earlier sheet</div>' + LABEL,
  '.tabs{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px} .tab{background:#1e293b;border:2px solid #334155;border-radius:10px;padding:8px 16px;font-family:"DejaVu Sans Mono",monospace;font-size:24px;color:#cbd5e1} .tab i{font-style:normal;color:#fbbf24;font-weight:700} .tab u{text-decoration:none;color:#94a3b8;font-size:20px} .tab.on{background:#0b0f17;border-color:#4ade80;color:#F3EEE8} table.sg{width:100%;font-size:25px;font-family:"DejaVu Sans Mono",monospace} table.sg th{text-align:left;color:#7dd3fc;padding:10px 14px;border-bottom:2px solid #475569} table.sg td{padding:10px 14px;color:#F3EEE8}');
const still = (html) => [{ html, frames: null }];
const cards = {
  title: still(page('<div class="ch"><div class="k">' + T.kick + '</div><div class="t1">' + T.t1 + '</div><div class="t2">' + T.t2 + '</div><div class="p">' + T.tp + '</div></div>', 'body{background:#0b0f17} .ch{text-align:center;margin-top:120px} .k{font-size:34px;color:#FF6B78;letter-spacing:4px;font-weight:700} .t1{font-size:120px;font-weight:700;margin-top:34px} .t2{font-size:120px;font-weight:700;color:#FF6B78;margin-top:6px} .p{font-size:40px;color:#94a3b8;margin-top:56px}')),
  intro: still(page('<div class="plain" style="margin-top:150px">' + T.intro1 + '<br><span>' + T.intro2 + '</span></div>')),
  twin: termStates(TERM.twin), column: termStates(TERM.column), where: termStates(TERM.where), status: termStates(TERM.status), witness: termStates(TERM.witness), sheet: still(sheetCard), pack: termStates(TERM.pack), again: termStates(TERM.again), claim: termStates(TERM.claim),
  close: still(page('<div class="big" style="font-size:110px;margin-top:150px">' + T.closeBig + '</div><div class="sub">' + T.closeSub + '</div><div class="sub" style="color:#7dd3fc;font-size:38px;margin-top:60px">red1oon.github.io/BIMCompiler/FastScriptGuide</div>'))
};
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'] }), pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}; let n = 0, tall = 0;
  for (const id of Object.keys(cards)) { plan[id] = []; let worst = 0;
    for (let i = 0; i < cards[id].length; i++) { const name = id + '_' + String(i + 1).padStart(3, '0') + '.png'; await pg.setContent(cards[id][i].html, { waitUntil: 'load' });
      const over = await pg.evaluate(() => { const a = document.querySelector('.area'), t = document.querySelector('.term'), l = document.querySelector('.lab'); const clash = t && l ? Math.max(0, t.getBoundingClientRect().bottom - l.getBoundingClientRect().top) : 0; return Math.max(a.scrollHeight - a.clientHeight, clash, 0); });
      worst = Math.max(worst, over); await pg.screenshot({ path: path.join(out, name) }); plan[id].push({ file: name, frames: cards[id][i].frames }); n++; }
    if (worst) tall++; console.log('§CARD beat=' + id + ' stills=' + cards[id].length + ' overflow_px=' + worst + (worst ? ' TOO-TALL' : '')); }
  await b.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
