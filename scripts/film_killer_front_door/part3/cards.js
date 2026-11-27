// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 3, the memory (prompts/FILM_KILLER_FRONT_DOOR.md, Film 3): the stills (1920x1080 PNG, headless Chrome on the CPU, --disable-gpu). Split screen: the line typed above (one still per character, one real key sound each;
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
const WHAT = () => 'the real history page, in a browser, on this computer';
const CH = `*{box-sizing:border-box;margin:0;padding:0} body{width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:${FONT},sans-serif;overflow:hidden} .ch{text-align:center;padding:0 70px} .k{font-size:34px;color:#FF6B78;letter-spacing:6px;font-weight:700} .t1{font-size:128px;font-weight:700;color:#F3EEE8;margin-top:36px;line-height:1.1} .t2{font-size:60px;font-weight:700;color:#FF6B78;line-height:1.3;margin-top:26px} .p{font-size:38px;color:#94a3b8;margin-top:40px} .s{font-size:25px;color:#94a3b8;line-height:1.36} .l{font-size:34px;color:#7dd3fc;font-weight:700}`;
const full = (inner) => `<!doctype html><html><head><meta charset="utf-8"><style>${CH}</style></head><body><div class="term" style="display:none"></div>${inner}</body></html>`;
const A = (h) => '<div class="ans">' + h + '</div>', AS = (h) => '<div class="ans sm">' + h + '</div>', OK = (h) => '<div class="ok sm">' + h + '</div>', NO = (h) => '<div class="no sm">' + h + '</div>', DIM = (s) => '<div class="dim">' + esc(s) + '</div>', b = (s) => '<b>' + esc(s) + '</b>';
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
const o = F, S1 = o.s1, S2 = o.s2, P2 = o.p2, ST = o.story, MG = o.merge, MD = o.merged, RW = o.rewind, TP = o.tamper, up = (s) => s;
const FI = o.files.filter(f => f.verifyOk && f.kernelOk).length;
const steps = {
  b1a: [{ cmd: 'open my spreadsheet file', before: 'h0_page', answers: [{ state: 'h1_open', lines: [A(b(o.sample.file) + ' · ' + plural(o.sample.sheets, 'sheet') + ' · ' + plural(o.sample.cells, 'cell')), AS(esc(o.o1.status)), DIM('this page: ' + o.load.requests + ' files, ' + o.load.bytes + ' bytes. After it was ready the server saw ' + o.net.requestsAfterReady + ' requests, ' + o.net.notGet + ' that were not plain downloads, ' + o.net.external + ' to another host')] }] }],
  b1b: [{ cmd: 'Aisha', before: 'h1_open', answers: [{ state: 'h1b_named', lines: [A('your name, typed: ' + b('Aisha')), DIM(o.o1.whoNote)] }] },
        { cmd: 'stamp', before: 'h1b_named', answers: [{ state: 'h2_stamped', lines: [OK(esc(S1.stamp.text)), AS(esc(S1.status))] }] }],
  b2: [{ cmd: 'someone changes the file outside the page', before: 'h2_stamped', answers: [{ state: 'h2_stamped', lines: [A('three cells are changed in the file: ' + b('B6') + ', ' + b('F2') + ', ' + b('B9')), DIM('here by a script, made just now (' + o.outside1.cells.join('; ') + '); the stored history is untouched')] }] },
       { cmd: 'open the changed file', before: 'h2_stamped', answers: [{ state: 'h3_pending', lines: [AS(esc(P2.status))] }, { state: 'h3b_pending_list', lines: [AS(esc(P2.pending[0].text)), AS(esc(P2.pending[1].text)), AS(esc(P2.pending[2].text))] }] }],
  b3: [{ cmd: 'look at B9', before: 'h3b_pending_list', answers: [{ state: 'h3b_pending_list', lines: [AS(esc(P2.pending[2].text)), DIM('flagged in the list now, and in the entry the next stamp makes: typedOverFormula = BACKUP!B9')] }] }],
  b2s: [{ cmd: 'Ben', before: 'h3b_pending_list', answers: [{ state: 'h3b_pending_list', lines: [A('another name, typed: ' + b('Ben'))] }] },
        { cmd: 'stamp', before: 'h3b_pending_list', answers: [{ state: 'h4_stamp2', lines: [OK(esc(S2.stamp.text)), DIM(S2.log.replace('§SHIST-PAGE-STAMP ', '').replace(/ chunks=\d+| lineChars=\d+| ms=\d+| heapMB=\d+/g, '').trim())] }] },
        { cmd: 'stamp again', before: 'h4_stamp2', answers: [{ state: 'h4b_noop', lines: [A(esc(o.noop.stamp.text)), DIM('nothing is written when nothing changed')] }] }],
  b4: [{ cmd: 'click B6', before: 'h4b_noop', answers: [{ state: 'h5_story', lines: [A(esc(ST.head)), AS(esc(ST.lines[0].text)), AS(esc(ST.lines[1].text)), AS(esc(ST.lines[2].text))] }] },
       { cmd: 'click B9', before: 'h5_story', answers: [{ state: 'h5b_story_b9', lines: [AS(esc(o.story9.lines[0].text)), AS(esc(o.story9.lines[1].text)), DIM(o.o1.whoNote)] }] }],
  b5: [{ cmd: 'go back to step 2', before: 'h5b_story_b9', answers: [{ state: 'h6_rewind', lines: [AS(esc(RW.viewNote)), DIM('B9 is ' + RW.B9.v + ' with no formula, F2 holds "' + RW.F2.v + '", B6 is ' + RW.B6.v)] }] },
       { cmd: 'download this version', before: 'h6_rewind', answers: [{ state: 'h6_rewind', lines: [A(b(RW.file.name) + ' · ' + plural(RW.file.entries, 'entry').replace('entrys', 'entries')), OK('checked: the history verifies (engine and the kernel\'s own check), the cells are exactly the sheet at step 2'), DIM('opened again on the page: ' + RW.reopen.state + ', ' + RW.reopen.lines + ' entries, ' + RW.reopen.pending + ' changes since')] }] }],
  b6a: [{ cmd: 'open the other copy', before: 'h7_merge_ready', answers: [{ state: 'h8_conflict', lines: [AS(esc(MG.text)), AS('from the other copy: ' + MG.applied.map(a => esc(a[0] + ' (' + a[1] + ')')).join(', '))] },
          { state: 'h8b_conflict_buttons', lines: [AS(esc(MG.conflictText)), DIM('nothing is chosen' + (MG.noPreselect ? '' : '?') + ': Finish is ' + (MG.finishDisabled ? 'disabled' : 'ENABLED?') + ' and this workbook is ' + (MG.workbookUnchanged ? 'unchanged (still 2 entries)' : 'CHANGED?'))] }] }],
  b6b: [{ cmd: 'choose 11 (Aisha)', before: 'h8b_conflict_buttons', answers: [{ state: 'h9_picked', lines: [A('chosen: ' + b('Keep 11 (Aisha)') + ' · Finish is now enabled')] }] },
        { cmd: 'finish the merge', before: 'h9_picked', answers: [{ state: 'h10_merged', lines: [OK(esc(MD.text)), AS('merged file: ' + plural(MD.entries, 'entry').replace('entrys', 'entries') + ' · history verifies (engine and kernel) · B7 = ' + MD.B7[0] + ' · C5 and C6 both there')] },
          { state: 'h11_merge_story', lines: o.mergeStory.lines.map(l => AS(esc(l.text))) }] }],
  b7: [{ cmd: 'a history line edited by hand', before: 'h11_merge_story', answers: [{ state: 'h12_broken', lines: [NO(esc(TP.status)), DIM(TP.change + '. Stamp is disabled; forced anyway, the stored history stayed as it was (' + TP.forcedStamp.lines + ' entries)')] }] }]
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
const lim = 'A spreadsheet file, not tried in Excel · a name is typed, not a signature · the time of an entry is not protected · a removed history is not noticed · colours and widths are not kept in the download · no claim about many users, speed, security or compliance';
const cards = {
  cover: [{ html: full('<div class="ch" style="margin-top:200px"><div class="k">PART 3  ·  THE MEMORY</div><div class="t1" style="font-size:112px">PDF and Excel<br>are killer apps</div><div class="t2">History is the missing killer</div><div class="p">your own file, with a memory inside it</div></div>'), frames: null }],
  close: [{ html: full('<div class="ch" style="margin-top:50px"><div class="t1" style="font-size:96px;margin-top:0">Your own file first.</div><div class="t2" style="font-size:66px;margin-top:20px">A memory inside it.</div><div class="p" style="font-size:44px;margin-top:20px;color:#F3EEE8">And the books, when you choose.</div>'
    + '<div class="s" style="margin-top:34px">The pages:</div>' + LINKS.links.map(l => '<div class="l" style="margin-top:8px">' + esc(l.shown) + '</div>').join('')
    + '<div class="s" style="margin-top:26px">' + esc(lim) + '</div></div>'), frames: null }],
  prior: [{ html: full('<div class="ch" style="margin-top:120px"><div class="k">PRIOR ART  /  CREDENTIALS</div>'
    + CRED.lines.map((l, i) => '<div class="' + (i === 0 ? 't1' : 'p') + '" style="' + (i === 0 ? 'font-size:84px;margin-top:44px' : 'font-size:42px;margin-top:30px;color:#F3EEE8;line-height:1.3') + '">' + esc(l.shown) + '</div>').join('')
    + (CRED.lines.find(l => l.link) ? '<div class="l" style="margin-top:34px;font-size:32px">' + esc(CRED.lines.find(l => l.link).link) + '</div>' : '')
    + '<div class="s" style="margin-top:40px">Key sounds: eklee, qubodup (CC BY 3.0, opengameart.org) · the top line states each step in plain words, it is not a command</div></div>'), frames: null }]
};
['b1a', 'b1b', 'b2', 'b3', 'b2s', 'b4', 'b5', 'b6a', 'b6b', 'b7'].forEach(id => { cards[id] = beat(id); });
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
