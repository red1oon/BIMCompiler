// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 1 (prompts/FILM_KILLER_FRONT_DOOR.md §2 look and sound, §3 beats 0-5): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). Split screen: the line typed above
// (one still per character, one real key sound each; the voice starts after the return key) and the REAL page below (the pictures facts.js took of pdf/index.html). Every figure and every picture is read from out/facts.json and out/shots/;
// nothing is typed in by hand. The top strip states each step in plain words: a film device (said on the last card), never shown as a command that exists. The bottom 230 px stay empty for the captions.
// Cards: cover = two-colour card; last card = the way in, the limits, the credentials re-read from the take's logs, the link, the key-sound credit. Usage: node cards.js <outDir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OD = process.env.OUTD || 'out', F = JSON.parse(fs.readFileSync(path.join(__dirname, OD, 'facts.json'), 'utf8')), out = path.resolve(process.argv[2] || OD + '/cards'); fs.mkdirSync(out, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'), FONT = "'DejaVu Sans'";
const pics = {}, img = (id) => pics[id] || (pics[id] = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, OD, F.states[id].file)).toString('base64'));
const CSS = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0f172a;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden}
.term{position:absolute;left:28px;right:28px;top:14px;height:262px;background:#0b0f17;border:2px solid #334155;border-radius:14px;padding:12px 26px;font-family:'DejaVu Sans Mono',monospace;font-size:31px;line-height:1.4;overflow:hidden}
.cmd{color:#F3EEE8;white-space:pre} .cmd:before{content:'\\203A  ';color:#FF6B78;font-weight:700}
.ans{color:#fbbf24;white-space:pre} .ans b{color:#7dd3fc;font-weight:700} .ok{color:#4ade80;white-space:pre} .no{color:#f87171;font-weight:700;white-space:pre} .dim{color:#94a3b8;font-size:23px;white-space:pre}
.cur{display:inline-block;width:17px;height:32px;background:#4ade80;vertical-align:-5px;margin-left:2px}
.bar{position:absolute;left:0;right:0;top:282px;height:30px;background:#1e293b;color:#94a3b8;font-size:20px;line-height:30px;padding:0 28px;letter-spacing:1px} .bar b{color:#7dd3fc;font-weight:700} .bar i{float:right;font-style:normal;color:#fbbf24;font-weight:700;letter-spacing:2px}
.erp{position:absolute;left:0;top:312px;width:1920px;height:537px;display:block}`;
const split = (termInner, state) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="term">${termInner}</div><div class="bar">&#9660; <b>the real PDF page</b>, in a browser, on this computer<i>PROTOTYPE</i></div><img class="erp" src="${img(state)}"></body></html>`;
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden} .ch{text-align:center;padding:0 70px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:128px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .t2{font-size:60px;font-weight:700;color:#FF6B78;line-height:1.3;margin-top:26px} .p{font-size:38px;color:#94a3b8;margin-top:40px} .s{font-size:26px;color:#94a3b8;line-height:1.38} .l{font-size:42px;color:#7dd3fc;font-weight:700}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body><div class="term" style="display:none"></div>${inner}</body></html>`;
// one beat = steps; a step = one typed line over the picture of BEFORE, then its real answer over the picture taken AFTER. Steps before the last hold their answer a fixed 1.5 s; the last step's answer takes the rest of the beat.
const A = (h) => '<div class="ans">' + h + '</div>', OK = (h) => '<div class="ok">' + h + '</div>', NO = (h) => '<div class="no">' + h + '</div>', DIM = (s) => '<div class="dim">' + esc(s) + '</div>', b = (s) => '<b>' + esc(s) + '</b>';
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const R = F.read, X = F.xlsx, BAD = F.bad;
const steps = {
  b1: [{ cmd: 'open my report', before: 'empty', after: [A(b(F.b1.file) + ' · ' + plural(F.b1.pages, 'page')), DIM('after the file was chosen: ' + plural(F.net.b1.requests, 'request') + ' (the page\'s own script), ' + F.net.b1.withBody + ' carried data, ' + F.net.b1.otherOrigin + ' left this site')], state: 'b1_open' }],
  b2a: [{ cmd: 'open the long report', before: 'b1_open', after: [A(b('market_impact_report.pdf') + ' · ' + plural(F.b2.pages, 'page') + ' · ' + plural(F.b2.outline, 'outline entry').replace('entrys', 'entries'))], state: 'b2_open' },
        { cmd: 'market', before: 'b2_open', after: [A('Find ' + b('market') + ': ' + b(F.find.hits + ' hits') + ' on ' + plural(F.find.pagesHit, 'page')), DIM('counted again from the file\'s own text: ' + F.find.poppler)], state: 'b2_find' }],
  b2b: [{ cmd: 'jump by the outline', before: 'b2_find', after: [A('outline entry ' + F.outlineClick.index + ' of ' + F.outlineTitles.length + ': ' + b(F.outlineClick.title)), A('the page jumps to page ' + b(F.outlineClick.page))], state: 'b2_outline' }],
  b3a: [{ cmd: 'back to the trial balance', before: 'b2_outline', after: [A(b(F.b1.file) + ' · ' + plural(F.b1.pages, 'page'))], state: 'b3_open' },
        { cmd: 'read it as a sheet', before: 'b3_open', after: [OK(esc(R.verdictText)), A(b(R.cells + ' cells') + ' · debit ' + b(R.d28) + ' = credit ' + b(R.e28))], state: 'b3_sheet' }],
  b3b: [{ cmd: 'point at a number', before: 'b3_sheet', after: [A('cell ' + b('D28') + ' = ' + b(R.d28)), A('its box lights on the page it was printed on')], state: 'b3_hover' }],
  b4: [{ cmd: 'a copy where I changed one digit', before: 'b3_hover', after: [A(b(F.changed.was) + ' became ' + b(F.changed.now) + ' · ' + F.changed.linesDiffer + ' line of the file differs'), DIM('the copy is made now and opened like any file')], state: 'b4_open' },
       { cmd: 'read it as a sheet', before: 'b4_open', after: [NO(esc(BAD.verdictText)), DIM('cell ' + BAD.cell + ' printed ' + BAD.printed + ', its rows add to ' + BAD.rowsSum)], state: 'b4_sheet' }],
  b5a: [{ cmd: 'back to the first report, read as a sheet', before: 'b4_sheet', after: [OK(esc(F.again.verdictText))], state: 'b5_sheet' },
        { cmd: 'keep it as a spreadsheet file', before: 'b5_sheet', after: [A('saved ' + b(X.file) + ' · ' + b(X.cells + ' cells')), A('D28 holds ' + b('=' + X.d28f) + ' · ' + plural(X.sums, 'total') + ' are formulas'), DIM('re-read from the saved file: D28 = ' + X.d28v)], state: 'b5_download' }],
  b5b: [{ cmd: 'switch the network off', before: 'b5_download', after: [A('network ' + b('off') + ' · the page reloads from its own copy'), DIM('requests that reached the server: ' + F.offline.serverHits + ' · an address it never saw: ' + F.offline.probe)], state: 'b6_offline_boot' },
        { cmd: 'open the report, read it as a sheet', before: 'b6_offline_boot', after: [OK(esc(F.offline.verdictText))], state: 'b6_offline_sheet' }]
};
const texts = {};   // the visible text of every still, for guard.js cards
function beat(id) {
  const st = []; const S = steps[id];
  S.forEach((s, si) => { const last = si === S.length - 1, line = (k, done) => '<div class="cmd">' + esc(s.cmd.slice(0, k)) + (done ? '' : '<span class="cur"></span>') + '</div>';
    st.push({ html: split(line(0, false), s.before), frames: si === 0 ? 14 : 8 });
    for (let k = 1; k <= s.cmd.length; k++) st.push({ html: split(line(k, false), s.before), frames: 1, key: 'k' });   // one character a frame at 24 fps: one key sound each
    st.push({ html: split(line(s.cmd.length, false), s.before), frames: 8, key: 'r' });                                  // the return key
    st.push({ html: split(line(s.cmd.length, true) + s.after.join(''), s.state), frames: last ? null : 36 }); });
  return st;
}
const cards = {
  cover: [{ html: full('<div class="ch" style="margin-top:200px"><div class="k">PART 1  ·  THE WAY IN</div><div class="t1" style="font-size:112px">PDF and Excel<br>are killer apps</div><div class="t2">So we open it up</div><div class="p">your own report, opened, read as a sheet, checked</div></div>'), frames: null }],
  last: [{ html: full('<div class="ch" style="margin-top:34px"><div class="k">THE WAY IN</div><div class="t1" style="font-size:84px;margin-top:14px">Your own file first.</div>'
    + '<div class="t2" style="font-size:42px;margin-top:12px;line-height:1.25">Next: change a number<br>and get the same PDF back.</div>'
    + '<div class="p" style="font-size:36px;margin-top:14px;color:#F3EEE8;line-height:1.3">Then file it into the books, when you choose.<br>An ERP is available, free to use.</div>'
    + '<div class="l" style="margin-top:18px">' + esc(F.link.url.replace(/^https:\/\//, '')) + '</div>'
    + '<div class="s" style="margin-top:14px">Limits: one page at a time · simple tables · scans are not read · ' + F.layouts.rebuilt + ' of ' + F.layouts.tried + ' report layouts tried are rebuilt · no claim about many users, speed or e-invoices</div>'
    + '<div class="s" style="margin-top:8px">bim-ootb PRs ' + F.prs.map(p => '#' + p).join(' ') + ' · reader checks ' + F.witness.reader.verdict + ', ' + F.witness.reader.judged + ' judged ' + F.witness.reader.failed + ' failed · page checks ' + F.witness.page.verdict + ', ' + F.witness.page.judged + ' judged ' + F.witness.page.failed + ' failed (read from their logs)</div>'
    + '<div class="s" style="margin-top:8px">Opens PDFs with pdf.js and writes the spreadsheet file with SheetJS, both open source, unmodified · the top line states each step in plain words, it is not a command</div>'
    + '<div class="s" style="margin-top:8px">Key sounds: eklee, qubodup (CC BY 3.0, opengameart.org)</div></div>'), frames: null }]
};
['b1', 'b2a', 'b2b', 'b3a', 'b3b', 'b4', 'b5a', 'b5b'].forEach(id => { cards[id] = beat(id); });
const order = require('./narr.js').beats.map(x => x.id);
(async () => {
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1920,1080'] }), pg = await br.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
  const plan = {}; let n = 0, tall = 0, keys = 0, rets = 0;
  for (const id of order) { if (!cards[id]) throw new Error('no card for beat ' + id); plan[id] = []; texts[id] = []; let worst = 0, pic = 0;
    for (let i = 0; i < cards[id].length; i++) { const name = id + '_' + String(i + 1).padStart(3, '0') + '.png'; await pg.setContent(cards[id][i].html, { waitUntil: 'load' });
      const m = await pg.evaluate(() => { const t = document.querySelector('.term'), im = document.querySelector('.erp'), ch = document.querySelector('.ch'); return { over: t && im ? Math.max(t.scrollHeight - t.clientHeight, t.scrollWidth - t.clientWidth) : 0, low: im ? im.getBoundingClientRect().bottom - (window.innerHeight - 230) : (ch ? Math.max(ch.scrollWidth - ch.clientWidth, ch.getBoundingClientRect().bottom - (window.innerHeight - 230)) : 0), img: im ? (im.complete && im.naturalWidth > 0) : null, w: im ? im.naturalWidth : 0, h: im ? im.naturalHeight : 0, text: document.body.innerText, chBottom: ch ? ch.getBoundingClientRect().bottom : 0 }; });
      worst = Math.max(worst, m.over, m.low); if (m.img === false) throw new Error('the page picture of ' + id + ' did not load'); if (m.img) pic = m.w + 'x' + m.h; texts[id].push(m.text);
      await pg.screenshot({ path: path.join(out, name) }); const e = { file: name, frames: cards[id][i].frames }; if (cards[id][i].key) { e.key = cards[id][i].key; if (e.key === 'k') keys++; else rets++; } plan[id].push(e); n++; }
    if (worst > 0) tall++; console.log('§CARD beat=' + id + ' stills=' + cards[id].length + ' overflow_px=' + Math.max(0, worst) + (worst > 0 ? ' TOO-TALL' : '') + (pic ? ' page_picture=' + pic : ' (full card)') + (steps[id] ? ' typed=' + steps[id].map(s => s.cmd.length).join('+') : '')); }
  await br.close(); fs.writeFileSync(path.join(out, 'plan.json'), JSON.stringify(plan, null, 1)); fs.writeFileSync(path.join(out, 'text.json'), JSON.stringify(texts));
  console.log('§CARDS_DONE beats=' + Object.keys(plan).length + ' stills=' + n + ' too_tall=' + tall + ' key_stills=' + keys + ' return_stills=' + rets);
})().catch(e => { console.error('§CARDS_FAIL ' + (e && e.stack || e)); process.exit(1); });
