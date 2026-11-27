// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 2 (prompts/FILM_KILLER_FRONT_DOOR.md, Film 2): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). Split screen: the line typed above (one still per character, one real key sound each;
// the voice starts after the return key) and the REAL page below (the pictures facts.js took of pdf/index.html, file_it.html and idempiere.html). Every figure and every picture is read from out/facts.json and out/shots/; nothing is typed in by hand. The top strip states
// each step in plain words (where the user really types, those very keystrokes): a film device, never shown as a command that exists. The bottom 230 px stay empty for the captions. Cards: cover (owner to confirm wording), YOUR CHOICE, the closing line, the prior-art card.
// Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OD = process.env.OUTD || 'out', F = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'facts.json'), 'utf8')), out = path.resolve(process.argv[2] || OD + '/cards'); fs.mkdirSync(out, { recursive: true });
const CRED = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'credits.json'), 'utf8')), LINKS = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'links.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), FONT = "'DejaVu Sans'";
const pics = {}, img = (id) => { if (!F.states[id]) throw new Error('no shot ' + id); return pics[id] || (pics[id] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, OD, F.states[id].file)).toString('base64')); };
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden}
.term{position:absolute;left:28px;right:28px;top:14px;height:262px;background:#0b0f17;border:2px solid #334155;border-radius:14px;padding:12px 26px;font-family:'DejaVu Sans Mono',monospace;font-size:31px;line-height:1.38;overflow:hidden}
.cmd{color:#F3EEE8;white-space:pre} .cmd:before{content:'\\203A  ';color:#FF6B78;font-weight:700}
.ans{color:#fbbf24;white-space:pre-wrap} .ans b{color:#7dd3fc;font-weight:700} .ok{color:#4ade80;white-space:pre-wrap} .no{color:#f87171;font-weight:700;white-space:pre-wrap} .dim{color:#94a3b8;font-size:23px;white-space:pre-wrap}
.sm{font-size:26px;line-height:1.28} .cur{display:inline-block;width:17px;height:32px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:282px;height:30px;background:#1e293b;color:#94a3b8;font-size:20px;line-height:30px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc;font-weight:700} .bar i{float:right;font-style:normal;color:#fbbf24;font-weight:700;letter-spacing:2px}
.erp{position:absolute;left:0;top:312px;width:1920px;height:537px;display:block}`;
const split = (termInner, state, what) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="term">${termInner}</div><div class="bar">&#9660; <b>${what}</b><i>PROTOTYPE</i></div><img class="erp" src="${img(state)}"></body></html>`;
const WHAT = (state) => /^p/.test(state) ? 'the real PDF page, in a browser, on this computer' : /^f/.test(state) ? 'the real filing page, in a browser, on the demo books' : 'the real ERP page, in a browser, on the demo books';
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden} .ch{text-align:center;padding:0 70px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:128px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .t2{font-size:60px;font-weight:700;color:#FF6B78;line-height:1.3;margin-top:26px} .p{font-size:38px;color:#94a3b8;margin-top:40px} .s{font-size:25px;color:#94a3b8;line-height:1.36} .l{font-size:34px;color:#7dd3fc;font-weight:700}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body><div class="term" style="display:none"></div>${inner}</body></html>`;
const A = (h) => '<div class="ans">' + h + '</div>', AS = (h) => '<div class="ans sm">' + h + '</div>', OK = (h) => '<div class="ok sm">' + h + '</div>', NO = (h) => '<div class="no sm">' + h + '</div>', DIM = (s) => '<div class="dim">' + esc(s) + '</div>', b = (s) => '<b>' + esc(s) + '</b>';
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const E = F.edits, ENG = /([\d.]+) MB of demo books loaded in ([\d.]+) s/.exec(F.fileit.engine) || [];
const R12 = F.report.r12110, SQL = F.report.sql;
// steps: [{ cmd, before, answers: [{ state, lines: [html] }] }]; a step before the last holds its (first) answer a fixed 1.5 s; the last step's answers share the rest of the beat
const steps = {
  b1a: [{ cmd: 'change D10 to 500.09', before: 'p0_sheet', answers: [{ state: 'p1_d10', lines: [NO(esc(E[0].verdict)), DIM('D10 was ' + F.p1.old + '; the PDF is rewritten in place (' + plural(1, 'edit') + ')')] }] }],
  b1b: [{ cmd: 'fix D28: 40394.44', before: 'p1_d10', answers: [{ state: 'p1_d28', lines: [NO(esc(E[1].verdict))] }] },
        { cmd: 'fix F10: 1020.16', before: 'p1_d28', answers: [{ state: 'p1_f10', lines: [NO(esc(E[2].verdict))] }] },
        { cmd: 'fix F28: 2.00', before: 'p1_f10', answers: [{ state: 'p1_f28', lines: [OK(esc(E[3].verdict))] }] }],
  b1c: [{ cmd: 'download the PDF', before: 'p1_f28', answers: [{ state: 'p1_download', lines: [AS(b(F.dl.file) + ' · ' + F.dl.bytes + ' bytes · ' + plural(F.dl.edits, 'edit') + ' · history ' + plural(F.dl.historyEntries, 'entry').replace('entrys', 'entries')), OK('checked with another reader: ' + F.dl.words + ' words in both files, ' + F.dl.changedCount + ' changed, ' + F.dl.unchangedButMoved + ' moved'), DIM('"500.09" ' + F.dl.p500 + ' time in the file, "498.09" ' + F.dl.p498 + ' times')] }] }],
  b2a: [{ cmd: 'open the downloaded file', before: 'p1_download', answers: [{ state: 'p2_open', lines: [OK(esc(F.reopen.say.split('. It is kept')[0] + '.')), DIM('the file itself holds it: ' + F.attach.list.replace(/\s*\/\s*/, ' · '))] }] }],
  b2b: [{ cmd: 'd10', before: 'p2_open', answers: [{ state: 'p2_story', lines: [A('story of cell ' + b('D10')), AS(esc(F.story.lines[0])), AS(esc(F.story.lines[1]))] }] }],
  b3: [{ cmd: 'a copy with one history line changed by hand', before: 'p2_story', answers: [{ state: 'p3_broken', lines: [NO(esc(F.broken.say)), DIM(F.broken.changed + '; the copy is made now and opened like any file')] }] }],
  b4a: [{ cmd: 'open a spreadsheet file with a wrong total', before: 'f0_ready', answers: [{ state: 'f1_wrong_open', lines: [A('a spreadsheet file with an invoice: its printed subtotal is wrong'), DIM('the page says: ' + F.fileit.engine)] }] },
         { cmd: 'file it', before: 'f1_wrong_open', answers: [{ state: 'f2_refused', lines: [NO(esc(F.refused.text)), DIM('nothing was filed')] }] }],
  b4b: [{ cmd: 'fix the total, open it again', before: 'f2_refused', answers: [{ state: 'f3_right_open', lines: [A('the same invoice, its printed total now right')] }] },
        { cmd: 'file it', before: 'f3_right_open', answers: [{ state: 'f4_filed', lines: [OK(esc(F.filed.text))] },
          { state: 'f5_doc', lines: [AS(b(F.doc.head.Document + ' ' + F.doc.head.Number) + ' · ' + esc(F.doc.head.Status) + ' · ' + esc(F.doc.head.Customer)), AS(plural(F.doc.lines.length, 'line') + ' · lines total ' + b(F.doc.head['Lines total']) + ' · grand total ' + b(F.doc.head['Grand total']))] },
          { state: 'f6_books', lines: [AS(b(F.books.entries + ' accounting entries') + ' in two sets of books'), AS('debit ' + b(F.books.debit) + ' = credit ' + b(F.books.credit))] }] }],
  b5a: [{ cmd: 'open it in the ERP', before: 'f6_books', answers: [{ state: 'e1_invoice_form', lines: [A('the ERP page · ' + b(F.erp.who.replace(/\s*·\s*\*\s*$/, '')) + ' · ' + b('demo books')), AS(esc(F.erp.status)), DIM(F.erp.toast)] },
          { state: 'e2_invoice_grid', lines: [A('Invoice window as a grid: ' + plural(F.erp.grid.length, 'row') + ' · document ' + b(F.erp.grid[0].doc) + ' · ' + esc(F.erp.grid[0].desc))] },
          { state: 'e3_invoice_lines', lines: [A('Invoice Line tab: ' + plural(F.erp.lines.length, 'row')), AS(F.erp.lines.map(l => esc(l.product + ' ' + l.qty + ' x ' + l.price)).join('   ·   '))] }] }],
  b5b: [{ cmd: 'show the entries it posted', before: 'e3_invoice_lines', answers: [{ state: 'e4_posted', lines: [AS(F.posted.lines.slice(0, 1).map(l => esc(l[0] + ': debit ' + l[1])).join('') ), AS(esc('41000 · Trade Revenue: credit ' + F.posted.lines.filter(l => /^41000/.test(l[0])).map(l => l[2]).join(' and '))), OK('Balanced · ' + esc(F.posted.note))] }] }],
  b5c: [{ cmd: 'Trial Balance', before: 'e4_posted', answers: [{ state: 'e5_tb_params', lines: [A('the report: accounting schema ' + b('GardenWorld US/A/US Dollar') + ' · date ' + b(F.report.date))] },
          { state: 'e6_tb_report', lines: [AS('12110 Accounts Receivable: debit ' + b(R12[2]) + ', credit ' + b(R12[3])), AS('of that debit, ' + b(SQL.thisInvoice.toFixed(2)) + ' is this invoice'), DIM('entries read from the books: debit ' + SQL.debitWithInvoice + ' with the invoice, ' + SQL.debitWithoutInvoice + ' without it'), OK(esc(F.report.foot))] }] }]
};
const texts = {};
function beat(id) {
  const st = [], S = steps[id];
  S.forEach((s, si) => { const last = si === S.length - 1, line = (k, done) => '<div class="cmd">' + esc(s.cmd.slice(0, k)) + (done ? '' : '<span class="cur"></span>') + '</div>', w = (state) => WHAT(state);
    st.push({ html: split(line(0, false), s.before, w(s.before)), frames: si === 0 ? 14 : 8 });
    for (let k = 1; k <= s.cmd.length; k++) st.push({ html: split(line(k, false), s.before, w(s.before)), frames: 1, key: 'k' });   // one character a frame at 24 fps: one key sound each
    st.push({ html: split(line(s.cmd.length, false), s.before, w(s.before)), frames: 8, key: 'r' });                                  // the return key
    s.answers.forEach((a, ai) => { if (!last && ai > 0) return; st.push({ html: split(line(s.cmd.length, true) + a.lines.join(''), a.state, w(a.state)), frames: last ? null : 36 }); }); });
  return st;
}
const link = (id) => (LINKS.links.find(l => l.id === id) || {}).shown;
const lim = 'Demo books (GardenWorld), one fixed demo login · a spreadsheet file, not tried in Excel · a history edit is caught, a removed history is not noticed · no claim about many users, speed, security or compliance';
const cards = {
  cover: [{ html: full('<div class="ch" style="margin-top:200px"><div class="k">PART 2  ·  THE BOOKS</div><div class="t1" style="font-size:112px">PDF and Excel<br>are killer apps</div><div class="t2">ERP is now a utility</div><div class="p">from your own file, into the books</div></div>'), frames: null }],
  choice: [{ html: full('<div class="ch" style="margin-top:300px"><div class="k">YOUR CHOICE</div><div class="t1" style="font-size:96px">Take it into the ERP,<br>if you want</div></div>'), frames: null }],
  b6: [{ html: full('<div class="ch" style="margin-top:50px"><div class="t1" style="font-size:96px;margin-top:0">ERP is now a utility,<br>no longer a luxury.</div><div class="t2" style="font-size:76px;margin-top:22px">It is granted free.</div>'
    + '<div class="s" style="margin-top:34px">Guide and pages:</div>' + LINKS.links.map(l => '<div class="l" style="margin-top:8px">' + esc(l.shown) + '</div>').join('')
    + '<div class="s" style="margin-top:26px">' + esc(lim) + '</div>'
    + '<div class="s" style="margin-top:10px">Steps are shown as the page looked when each one finished. The books load first: ' + esc(ENG[1] || '') + ' MB in ' + esc(ENG[2] || '') + ' s here.</div></div>'), frames: null }],
  prior: [{ html: full('<div class="ch" style="margin-top:120px"><div class="k">PRIOR ART  /  CREDENTIALS</div>'
    + CRED.lines.map((l, i) => '<div class="' + (i === 0 ? 't1' : 'p') + '" style="' + (i === 0 ? 'font-size:84px;margin-top:44px' : 'font-size:42px;margin-top:30px;color:#F3EEE8;line-height:1.3') + '">' + esc(l.shown) + '</div>').join('')
    + (CRED.lines.find(l => l.link) ? '<div class="l" style="margin-top:34px;font-size:32px">' + esc(CRED.lines.find(l => l.link).link) + '</div>' : '')
    + '<div class="s" style="margin-top:40px">Key sounds: eklee, qubodup (CC BY 3.0, opengameart.org) · the top line states each step in plain words, it is not a command</div></div>'), frames: null }]
};
['b1a', 'b1b', 'b1c', 'b2a', 'b2b', 'b3', 'b4a', 'b4b', 'b5a', 'b5b', 'b5c'].forEach(id => { cards[id] = beat(id); });
const order = require('./narr.js').beats.map(x => x.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); plan[id] = []; texts[id] = []; let worst = 0, pic = 0;
    for (let i = 0; i < cards[id].length; i++) { const name = id + '_' + String(i + 1).padStart(3, '0') + '.png'; await pg.setContent(cards[id][i].html, { waitUntil: 'load' });
      const m = await pg.evaluate(() => { const t = document.querySelector('.term'), im = document.querySelector('.erp'), ch = document.querySelector('.ch'); return { over: t && im ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: im ? im.getBoundingClientRect().bottom - (window.innerHeight - 230) : (ch ? Math.max(ch.scrollWidth - ch.clientWidth, ch.getBoundingClientRect().bottom - (window.innerHeight - 230)) : 0), img: im ? (im.complete && im.naturalWidth > 0) : null, w: im ? im.naturalWidth : 0, h: im ? im.naturalHeight : 0, text: document.body.innerText }; });
      worst = Math.max(worst, m.over, m.low); if (m.img === false) throw new Error('the page picture of ' + id + ' did not load'); if (m.img) pic = m.w + 'x' + m.h; texts[id].push({ t: m.text, typing: cards[id][i].key === 'k' });
      await pg.screenshot({ path: path.join(out, name) }); const e = { file: name, frames: cards[id][i].frames }; if (cards[id][i].key) { e.key = cards[id][i].key; if (e.key === 'k') keys++; else rets++; } plan[id].push(e); n++; }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' stills=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '') + (pic ? ' page_picture=' + pic : ' (full card)') + (steps[id] ? ' typed=' + steps[id].map(s => s.cmd.length).join('+') : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); fs.writeFileSync(path.join(out, 'text.json'), JSON.stringify(texts));
  console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall + ' key_stills=' + keys + ' return_stills=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
