#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 2 (bim-compiler prompts/FILM_KILLER_FRONT_DOOR.md, Film 2). READ out/facts.log AFTER EVERY RUN; an exit code is not evidence.
// What this does: serves the REAL bim-ootb pages from a read-only worktree (pdf/index.html, erp/sheet_addin/file_it.html, erp/idempiere.html) and drives them in headless Chrome on the CPU (--disable-gpu, no GPU work): real file
// choosers, real double-clicks and key presses in the sheet, real downloads, real clicks. Every `§` line the pages print is kept; every number the film shows or says is read back from them or from the page's own DOM
// (out/facts.json). Files made at record time (a copy with one history line edited by hand; two invoice workbooks) live in a temp folder and are never committed.
// External requests are COUNTED and ABORTED for the take (named in the log); the film makes no network claim over the ERP page.
// Usage: OOTB=<bim-ootb worktree at origin/main> [STAGES=pdf,erp] node facts.js     (run with `env -u DBUS_SESSION_BUS_ADDRESS`; headless, never the owner's display)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), cp = require('child_process');
const OOTB = process.env.OOTB;
if (!OOTB || !fs.existsSync(path.join(OOTB, 'erp/sheet_addin/file_it.html'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at origin/main that has erp/sheet_addin/file_it.html'); process.exit(2); }
if (!global.crypto || !global.crypto.subtle) global.crypto = require('crypto').webcrypto;
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const XLSX = require(path.join(OOTB, 'erp/xlsx.mini.min.js')), SAMPLE = require(path.join(OOTB, 'erp/sheet_addin/sample_invoice.js'));
const PW = require(path.join(OOTB, 'pdf/pdf_write.js')), PH = require(path.join(OOTB, 'pdf/pdf_history.js'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), SHOTS = path.join(OUT, 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kfd2_')), STAGES = (process.env.STAGES || 'pdf,erp').split(',');
const L = (m) => console.log('§FACTS ' + m), sleep = (ms) => new Promise(r => setTimeout(r, ms));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.pdf': 'application/pdf', '.wasm': 'application/wasm', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.db': 'application/octet-stream' };
const TB = path.join(OOTB, 'pdf/corpus/trial_balance_th.pdf');
const FACTS = path.join(OUT, 'facts.json'), out = fs.existsSync(FACTS) && process.env.KEEP ? JSON.parse(fs.readFileSync(FACTS, 'utf8')) : { states: {}, net: {} };
out.made = new Date().toISOString(); out.ootb = cp.spawnSync('git', ['-C', OOTB, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(); out.ootbShort = out.ootb.slice(0, 8);
const VIEW = { width: 1700, height: 475, deviceScaleFactor: 1920 / 1700 };   // drawn 1.1294 times larger: 1920 wide, the lower frame
const external = [];

(async () => {
  const srv = http.createServer((q, s) => { let p = path.join(OOTB, decodeURIComponent(q.url.split('?')[0])); if (p.indexOf(OOTB) !== 0) { s.writeHead(403); return s.end(); } if (/\/$/.test(p)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await puppeteer.launch({ headless: 'new', userDataDir: path.join(tmp, 'profile'), args: ['--no-sandbox', '--disable-gpu'] });
  async function newPage(rel, dl) {
    const pg = await br.newPage(); await pg.setViewport(VIEW); pg.__log = []; pg.__errs = [];
    pg.on('console', m => { const t = m.text(); if (/^§/.test(t)) pg.__log.push(t); }); pg.on('pageerror', e => pg.__errs.push(String(e.message).slice(0, 160)));
    if (dl) { fs.mkdirSync(dl, { recursive: true }); const c = await pg.target().createCDPSession(); await c.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl }); }
    await pg.setRequestInterception(true);
    pg.on('request', rq => { const u = rq.url(); if (u.indexOf(base) !== 0 && !/^(data|blob):/.test(u)) { external.push(rq.method() + ' ' + u.slice(0, 120)); return rq.abort(); } rq.continue(); });
    if (rel) await pg.goto(base + rel, { waitUntil: 'load', timeout: 120000 });
    return pg;
  }
  const logFrom = (pg, re, from) => pg.__log.slice(from || 0).filter(x => re.test(x));
  const waitLog = async (pg, re, from, ms) => { for (let t = 0; t < (ms || 20000); t += 100) { const l = logFrom(pg, re, from)[0]; if (l) return l; await sleep(100); } return null; };
  const settle = async (pg) => { await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await sleep(400); };
  const shot = async (pg, id, note) => { await sleep(300); await settle(pg); await pg.screenshot({ path: path.join(SHOTS, id + '.png') }); out.states[id] = { file: 'shots/' + id + '.png', note }; L('shot ' + id + ' ' + note); };
  const wheel = async (pg, sel, dx, dy) => { const r = await pg.evaluate((s) => { const e = document.querySelector(s).getBoundingClientRect(); return { x: e.left + e.width / 2, y: e.top + e.height / 2 }; }, sel); await pg.mouse.move(r.x, r.y); await pg.mouse.wheel({ deltaX: dx, deltaY: dy }); await sleep(500); };
  const sheetTop = async (pg) => { const st = await pg.evaluate(() => document.getElementById('sheet').scrollTop); if (st > 0) await wheel(pg, '#sheet', 0, -st - 50); const sl = await pg.evaluate(() => document.getElementById('sheet').scrollLeft); if (sl > 0) await wheel(pg, '#sheet', -sl - 50, 0); };
  async function bringIntoView(pg, sel, host) {   // real wheel scrolling of the sheet panel until the cell is inside it
    for (let i = 0; i < 6; i++) { const d = await pg.evaluate((s, h) => { const c = document.querySelector(s).getBoundingClientRect(), p = document.querySelector(h).getBoundingClientRect(); return { dx: c.right > p.right - 8 ? c.right - p.right + 40 : c.left < p.left + 40 ? c.left - p.left - 40 : 0, dy: c.bottom > p.bottom - 8 ? c.bottom - p.bottom + 80 : c.top < p.top + 40 ? c.top - p.top - 80 : 0 }; }, sel, host); if (!d.dx && !d.dy) return true; await wheel(pg, host, d.dx, d.dy); } return false;
  }
  const typeInto = async (pg, a, text) => { const n = pg.__log.length; await bringIntoView(pg, '#grid td[data-a="' + a + '"]', '#sheet'); await pg.click('#grid td[data-a="' + a + '"]', { clickCount: 2 }); await pg.waitForSelector('#grid td[data-a="' + a + '"] input', { timeout: 5000 }); await pg.keyboard.type(text, { delay: 60 }); await pg.keyboard.press('Enter'); const ed = await waitLog(pg, /^§PDFWR-EDIT cell=/, n, 8000); await sleep(600); return { n, ed }; };
  const verdictTxt = (pg) => pg.evaluate(() => ({ text: document.getElementById('verdict').textContent, cls: document.getElementById('verdict').className, cells: document.querySelectorAll('#grid td[data-a]').length }));
  const pdfPick = async (pg, file) => { const n = pg.__log.length, r = await Promise.all([pg.waitForFileChooser(), pg.click('#b-open')]); await r[0].accept([file]); const st = await waitLog(pg, /^§PDFHIST-STATE|^§PDFHIST-OPEN/, n, 15000); await pg.waitForFunction('document.querySelector(".pg") && Array.from(document.querySelectorAll(".pg")).some(function(d){return d.dataset.drawn==="1"})', { timeout: 20000 }).catch(() => {}); await sleep(900); return n; };
  const histUi = (pg) => pg.evaluate(() => ({ say: document.getElementById('hist-say').textContent, cls: document.getElementById('hist-say').className, story: Array.from(document.querySelectorAll('#hist-story div')).map(d => d.textContent), stat: document.getElementById('stat').textContent }));
  const words = (f) => { const x = cp.spawnSync('pdftotext', ['-bbox', f, '-'], { encoding: 'utf8', maxBuffer: 1 << 27 }).stdout, w = []; const re = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g; let m; while ((m = re.exec(x))) w.push({ b: [+m[1], +m[2], +m[3], +m[4]], t: m[5] }); return w; };

  try {
    // ================= PDF PAGE: beats 1-3 =================
    if (STAGES.includes('pdf')) {
      const dl = path.join(tmp, 'dl'), pg = await newPage('/pdf/index.html', dl);
      const boot = await waitLog(pg, /^§PDFED-BOOT/, 0, 10000); if (!boot) throw new Error('pdf page did not boot'); await waitLog(pg, /^§PDFED-OFFLINE ready=true/, 0, 15000); L('boot ' + boot); out.pdfBoot = boot;
      await pdfPick(pg, TB); const n1 = pg.__log.length; await pg.click('#b-sheet'); const rd = await waitLog(pg, /^§SHEET_READER/, n1); await waitLog(pg, /^§PDFHIST-STATE entries=1/, n1); await sleep(500); await sheetTop(pg);
      out.p0 = { read: rd, verdict: (await verdictTxt(pg)).text, hist: (await histUi(pg)).say }; L('p0 ' + rd + ' | page says "' + out.p0.verdict + '" | ' + out.p0.hist);
      await shot(pg, 'p0_sheet', 'the trial balance read as a sheet: ' + out.p0.verdict);
      // beat 1a: change D10 (real double-click and keys)
      const E = [];
      const edit = async (a, text, old) => { const r = await typeInto(pg, a, text); await sheetTop(pg); const v = await verdictTxt(pg), h = logFrom(pg, /^§PDFWR-HISTORY/, r.n)[0] || null, re = logFrom(pg, /^§PDFWR-REREAD/, r.n)[0] || null; E.push({ cell: a, typed: text, edit: r.ed, history: h, reread: re, verdict: v.text, cls: v.cls }); L('edit ' + a + ' ' + text + ' | ' + r.ed + ' | ' + h + ' | page says "' + v.text + '"'); if (!r.ed || !/ok=true/.test(r.ed)) throw new Error('edit ' + a + ' not applied: ' + r.ed); return v; };
      await edit('D10', '500.09'); await shot(pg, 'p1_d10', 'D10 changed to 500.09: ' + E[0].verdict); out.p1 = { old: '498.09', new: '500.09' };
      // beat 1b: the page names the stale cell; fix D28, then F10, then F28
      await edit('D28', '40394.44'); await shot(pg, 'p1_d28', 'D28: ' + E[1].verdict);
      await edit('F10', '1020.16'); await shot(pg, 'p1_f10', 'F10: ' + E[2].verdict);
      await edit('F28', '2.00'); await shot(pg, 'p1_f28', 'F28: ' + E[3].verdict);
      out.edits = E; if (!/adds up/.test(E[3].verdict) || E[3].cls !== 'good') throw new Error('the four edits do not add up: ' + E[3].verdict);
      // beat 1c: Download PDF
      const n4 = pg.__log.length; await pg.click('#b-pdf'); const dn = await waitLog(pg, /^§PDFWR-DOWNLOAD/, n4, 15000), sv = logFrom(pg, /^§PDFHIST-SAVE/, n4)[0]; const file = path.join(dl, 'trial_balance_th_edited.pdf'); for (let w = 0; w < 80 && !fs.existsSync(file); w++) await sleep(100); await sleep(300);
      const bytes = fs.readFileSync(file), fo = path.join(tmp, 'again', 'trial_balance_th_edited.pdf'); fs.mkdirSync(path.dirname(fo), { recursive: true }); fs.copyFileSync(file, fo);
      L('download ' + dn + ' | ' + sv); await shot(pg, 'p1_download', 'Download PDF clicked: ' + path.basename(file));
      const w0 = words(TB), w1 = words(fo), diffs = []; let moved = 0; if (w0.length === w1.length) w0.forEach((w, i) => { if (w.t !== w1[i].t) diffs.push(w.t + '->' + w1[i].t); else if (w.b.some((v, k) => Math.abs(v - w1[i].b[k]) > 0.01)) moved++; });
      const txt = cp.spawnSync('pdftotext', ['-raw', fo, '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout, cnt = (s) => txt.split(s).length - 1, info = cp.spawnSync('pdfinfo', [fo], { encoding: 'utf8' });
      out.dl = { log: dn, save: sv, file: path.basename(file), bytes: bytes.length, words: w0.length, wordsSame: w0.length === w1.length, changedWords: diffs, changedCount: diffs.length, unchangedButMoved: moved, unchangedWords: w0.length - diffs.length, p500: cnt('500.09'), p498: cnt('498.09'), pages: (/Pages:\s+(\d+)/.exec(info.stdout) || [])[1], edits: +((/edits=(\d+)/.exec(dn) || [])[1]), historyEntries: +((/historyEntries=(\d+)/.exec(dn) || [])[1]), verdict: (/verdict=(\S+)/.exec(dn) || [])[1] };
      L('poppler on the downloaded file: words ' + w0.length + ' vs ' + w1.length + ', changed ' + diffs.length + ' [' + diffs.join(', ') + '], unchanged but moved ' + moved + ', "500.09" ' + out.dl.p500 + 'x, "498.09" ' + out.dl.p498 + 'x, pages ' + out.dl.pages);
      if (!(out.dl.wordsSame && diffs.length === 4 && moved === 0 && out.dl.p500 === 1 && out.dl.p498 === 0)) throw new Error('the downloaded PDF is not the same PDF with the 4 numbers changed');
      // the history inside the file, extracted by an independent tool
      const det = cp.spawnSync('pdfdetach', ['-list', fo], { encoding: 'utf8' }).stdout; cp.spawnSync('pdfdetach', ['-save', '1', '-o', fo + '.att', fo]); const lines = fs.readFileSync(fo + '.att', 'utf8').split('\n').filter(Boolean);
      out.attach = { list: det.trim().split('\n').slice(0, 2).join(' / '), lines: lines.length }; L('pdfdetach lists "' + out.attach.list + '" and extracts ' + lines.length + ' history lines');
      // ---- beat 2: reopen the downloaded file (real file chooser)
      const n5 = await pdfPick(pg, fo), op = logFrom(pg, /^§PDFHIST-OPEN/, n5)[0], hu = await histUi(pg); out.reopen = { open: op, say: hu.say, cls: hu.cls };
      L('b2 ' + op + ' | page says "' + hu.say + '"'); await shot(pg, 'p2_open', 'the downloaded file opened again: ' + hu.say);
      const n6 = pg.__log.length; await pg.click('#hist-cell', { clickCount: 3 }); await pg.keyboard.type('d10', { delay: 90 }); await pg.keyboard.press('Enter'); const st = await waitLog(pg, /^§PDFHIST-STORY cell=D10/, n6, 8000), hs = await histUi(pg);
      out.story = { log: st, lines: hs.story }; L('story ' + st + ' | ' + hs.story.join(' || ')); await shot(pg, 'p2_story', 'the story of D10'); if (!st || hs.story.length < 2) throw new Error('no story');
      // ---- beat 3: the same file with one history line edited by hand
      const good = new Uint8Array(bytes), tl = lines.slice(); const orig = tl[1]; tl[1] = orig.replace('"before":{"v":498.09', '"before":{"v":1.09'); if (tl[1] === orig) throw new Error('the history line to edit by hand was not found');
      const emb = await PW.embedFile(good, PH.NAME, PH.toBytes(tl)); if (!emb.ok) throw new Error('embed failed'); const ft = path.join(tmp, 'trial_balance_th_history_edited_by_hand.pdf'); fs.writeFileSync(ft, emb.bytes);
      const n7 = await pdfPick(pg, ft), op3 = logFrom(pg, /^§PDFHIST-OPEN/, n7)[0], h3 = await histUi(pg); out.broken = { open: op3, say: h3.say, cls: h3.cls, copy: path.basename(ft), changed: '498.09 -> 1.09 in the recorded value of entry 2' };
      L('b3 ' + op3 + ' | page says "' + h3.say + '"'); await shot(pg, 'p3_broken', 'a history edited by hand: ' + h3.say);
      if (!/state=broken/.test(op3 || '') || !/brokenAt=2/.test(op3)) throw new Error('the hand-edited history was not named at entry 2: ' + op3);
      out.pdfErrors = pg.__errs; await pg.close();
    }
    // ================= FILE IT + ERP: beats 4-5 =================
    if (STAGES.includes('erp')) {
      // two workbooks made now, in a temp folder (never committed): the printed subtotal wrong, and right
      const mkwb = (name, o) => { const f = path.join(tmp, name); fs.writeFileSync(f, Buffer.from(XLSX.write(SAMPLE.build(XLSX, o), { type: 'array', bookType: 'xlsx' }))); return f; };
      const WRONG = mkwb('invoice_wrong_total.xlsx', { subtotal: 153.51 }), RIGHT = mkwb('invoice.xlsx', {});
      const fi = await newPage('/erp/sheet_addin/file_it.html'); const t0 = Date.now(); await fi.waitForFunction('window.FileItPage&&window.FileItPage.runner.ready()', { timeout: 180000 }); const readyMs = Date.now() - t0; await sleep(500);
      out.fileit = { readyMs, engine: await fi.evaluate(() => document.getElementById('engine').textContent) }; L('file_it ready after ' + readyMs + ' ms | page says "' + out.fileit.engine + '"');
      await shot(fi, 'f0_ready', 'the filing page, ' + out.fileit.engine);
      const fiPick = async (f) => { const r = await Promise.all([fi.waitForFileChooser(), fi.click('label[for=file]')]); await r[0].accept([f]); await fi.waitForFunction((n) => window.FileItPage.state.name === n && !!window.FileItPage.state.wb && window.FileItPage.state.verdict === null, { timeout: 30000 }, path.basename(f)); await sleep(500); };
      const fiFile = async () => { await fi.click('#b-file'); await fi.waitForFunction('(function(){var s=window.FileItPage.state;return !s.busy&&s.verdict!==null})()', { timeout: 180000 }); await sleep(600); return fi.evaluate(() => ({ verdict: window.FileItPage.state.verdict, text: document.getElementById('verdict').textContent, opened: document.getElementById('opened').textContent })); };
      const scrollTo = async (sel) => { await fi.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), sel); await sleep(300); };
      // 4a: the wrong total is refused with both numbers
      await fiPick(WRONG); await shot(fi, 'f1_wrong_open', 'the workbook with a wrong printed total opened'); const rw = await fiFile(); await scrollTo('#h-verdict'); out.refused = { verdict: rw.verdict, text: rw.text };
      L('4a ' + J(rw)); await shot(fi, 'f2_refused', 'File it on the wrong total: ' + rw.text); if (!/153\.51/.test(rw.text) || !/153\.5\b|153\.50/.test(rw.text) || rw.verdict === 'FILED') throw new Error('the wrong total was not refused with both numbers: ' + rw.text);
      // 4b: the right one is filed
      await fi.evaluate(() => window.scrollTo(0, 0)); await fiPick(RIGHT); await shot(fi, 'f3_right_open', 'the workbook with the right total opened'); const n8 = fi.__log.length; const rr = await fiFile(); out.filed = { verdict: rr.verdict, text: rr.text };
      L('4b ' + J(rr)); await scrollTo('#h-verdict'); await shot(fi, 'f4_filed', 'File it: ' + rr.text); if (rr.verdict !== 'FILED') throw new Error('the right workbook was not filed: ' + rr.text);
      out.doc = await fi.evaluate(() => { const d = {}; document.querySelectorAll('#doc-head dd').forEach(e => { d[e.dataset.k] = e.textContent; }); return { head: d, lines: Array.from(document.querySelectorAll('#doc-lines tbody tr')).map(tr => Array.from(tr.children).map(td => td.textContent)) }; });
      out.books = await fi.evaluate(() => ({ rows: Array.from(document.querySelectorAll('#books-rows tbody tr')).map(tr => Array.from(tr.children).map(td => td.textContent)), ledger: document.getElementById('ledger').textContent }));
      const tot = out.books.rows.filter(r => r[2] === 'Total')[0] || [], entries = out.books.rows.filter(r => r[2] !== 'Total'); out.books.entries = entries.length; out.books.debit = tot[3]; out.books.credit = tot[4];
      L('doc ' + J(out.doc.head) + ' lines=' + out.doc.lines.length + ' | books: ' + entries.length + ' entries, debit ' + tot[3] + ' credit ' + tot[4]);
      await scrollTo('#h-doc'); await shot(fi, 'f5_doc', 'the document in the books'); await scrollTo('#h-books'); await shot(fi, 'f6_books', 'the accounting entries posted');
      if (tot[3] !== tot[4] || entries.length !== 6) throw new Error('the entries on screen are not 6 balanced rows: ' + J(tot));
      const filedDocNo = out.doc.head.Number, grand = out.doc.head['Grand total'];
      // 5: Open in the ERP (the page's own link; a real click and navigation)
      await scrollTo('#h-verdict'); const link = await fi.evaluate(() => document.getElementById('b-erp').getAttribute('href')); out.link = link; L('link ' + link);
      await Promise.all([fi.waitForNavigation({ waitUntil: 'load', timeout: 120000 }), fi.click('#b-erp')]);
      const boot = await waitLog(fi, /^§IDEMPIERE boot db=/, 0, 180000); const hh = fi.__log.filter(l => /^§DOOR-HANDOVER /.test(l))[0]; out.erpBoot = boot; out.handover = hh; L('ERP page: ' + boot + ' | ' + hh);
      await fi.waitForFunction(() => document.getElementById('idmp-login') && document.getElementById('idmp-login').style.display === 'flex', { timeout: 120000 }); await sleep(800);
      const pick = (l, n) => fi.evaluate((l, n) => { const e = Array.prototype.filter.call(document.querySelectorAll(l + ' .idmp-login-user'), x => { const m = x.querySelector('.nm'); return m && m.textContent.trim() === n; })[0]; if (e) e.click(); return !!e; }, l, n);
      await pick('#idmp-login-clients', 'GardenWorld'); await sleep(400); await fi.waitForFunction("document.querySelectorAll('#idmp-login-users .idmp-login-user').length>0", { timeout: 30000 });
      if (!(await pick('#idmp-login-users', 'GardenAdmin'))) throw new Error('GardenAdmin is not on the login card'); await fi.waitForFunction("(function(){var e=document.getElementById('idmp-login-step2');return e&&e.style.display!=='none'})()", { timeout: 30000 });
      await fi.click('#idmp-login-ok'); await fi.waitForFunction("(function(){var t=document.getElementById('idmp-tree');return t&&t.children.length>0})()", { timeout: 60000 }); await sleep(3000);
      const snap = () => fi.evaluate(() => ({ who: (document.querySelector('#idmp-header, header') || document.body).innerText.match(/GardenWorld[^\n]*/) ? (document.body.innerText.match(/GardenWorld · [^\n]*/) || [''])[0] : '', status: document.getElementById('idmp-status-main').textContent, tabs: Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).map(e => e.textContent.trim()), rows: Array.from(document.querySelectorAll('tr[data-ad-record]')).map(tr => ({ table: tr.getAttribute('data-ad-table'), id: tr.getAttribute('data-ad-record'), cells: Array.from(tr.querySelectorAll('td[data-ad-col]')).reduce((o, td) => { o[td.getAttribute('data-ad-col')] = td.textContent.trim(); return o; }, {}) })), toast: (document.body.innerText.match(/\d+ document filed from[^\n]*/) || [''])[0] }));
      const e0 = await snap(); out.erp = { who: e0.who, status: e0.status, tabs: e0.tabs, toast: e0.toast }; L('ERP window: ' + e0.who + ' | ' + e0.status + ' | tabs ' + e0.tabs.join(',') + ' | page says "' + e0.toast + '"');
      await shot(fi, 'e1_invoice_form', 'the invoice in the ERP window (form)');
      await fi.click('#idmp-toolbar [data-tb="toggle"]'); await sleep(1300); const e1 = await snap(); out.erp.grid = e1.rows.map(r => ({ id: r.id, table: r.table, doc: r.cells.DocumentNo, desc: r.cells.Description })); L('ERP grid rows ' + J(out.erp.grid)); await shot(fi, 'e2_invoice_grid', 'the Invoice window as a grid: ' + e1.rows.length + ' row');
      if (e1.rows.length !== 1 || e1.rows[0].cells.DocumentNo !== filedDocNo) throw new Error('the Invoice window does not list the filed invoice once: ' + J(out.erp.grid));
      await fi.evaluate(() => { Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).filter(x => x.textContent.trim() === 'Invoice Line')[0].click(); }); await sleep(2500); let e2 = await snap();
      if (!e2.rows.length) { await fi.click('#idmp-toolbar [data-tb="toggle"]'); await sleep(1300); e2 = await snap(); }
      out.erp.lines = e2.rows.map(r => ({ id: r.id, line: r.cells.Line, product: r.cells.M_Product_ID, qty: r.cells.QtyInvoiced, price: r.cells.PriceActual, net: r.cells.LineNetAmt })); L('ERP Invoice Line rows ' + J(e2.rows.map(r => r.cells)).slice(0, 700)); await shot(fi, 'e3_invoice_lines', 'the Invoice Line tab: ' + e2.rows.length + ' rows');
      await fi.evaluate(() => { Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).filter(x => x.textContent.trim() === 'Invoice')[0].click(); }); await sleep(1500);
      // the posting view (the row's own Posted button)
      const n9 = fi.__log.length, had = await fi.evaluate(() => { const b = document.querySelector('.idmp-posted-btn'); if (b) b.click(); return b ? b.textContent.trim() : null; }); await sleep(1500);
      const pv = await fi.evaluate(() => ({ lines: Array.from(document.querySelectorAll('#posted-overlay .posted-line')).map(l => { const g = c => { const e = l.querySelector(c); return e ? e.textContent.trim() : null; }; return [g('.posted-acct'), g('.posted-dr'), g('.posted-cr')]; }), text: (document.getElementById('posted-overlay') || {}).textContent || '' })), pf = logFrom(fi, /^§POSTED-FACTS/, n9)[0];
      out.posted = { button: had, lines: pv.lines, log: pf, note: (/Accounting schema[^\n]*?posted\)/.exec(pv.text) || [''])[0], balanced: /Balanced/.test(pv.text) }; L('Posted view: ' + J(pv.lines) + ' | ' + out.posted.note + ' | ' + pf); await shot(fi, 'e4_posted', 'the Posted view');
      if (pv.lines.length !== 3 || !/balanced=true/.test(pf || '')) throw new Error('the posted view is not the 3 balanced rows of one schema: ' + J(pv.lines));
      await fi.evaluate(() => { const x = document.querySelector('#posted-overlay .posted-ov-x'); if (x) x.click(); }); await sleep(500);
      // a report that includes it: the Trial Balance of this page, for the invoice's own date
      await fi.click('#idmp-search', { clickCount: 3 }); await fi.keyboard.type('Trial Balance', { delay: 70 }); await sleep(1200);
      await fi.evaluate(() => { const l = Array.from(document.querySelectorAll('#idmp-tree .idmp-row.leaf')).filter(e => /Trial Balance/.test(e.textContent))[0]; if (l) l.click(); }); await sleep(4000);
      const sels = await fi.$$('select'); let schemaSel = null; for (const h of sels) { const o = await h.evaluate(e => Array.from(e.options).map(x => x.textContent)); if (o.some(x => /GardenWorld US\/A/.test(x))) schemaSel = h; }
      await schemaSel.select(await schemaSel.evaluate(e => Array.from(e.options).filter(o => /GardenWorld US\/A/.test(o.textContent))[0].value)); const di = await fi.$$('input[type=date]'); await di[di.length - 1].click();
      const date = out.doc.head.Date; const m = /(\d{4})-(\d{2})-(\d{2})/.exec(date); await fi.keyboard.type(m[2] + m[3] + m[1], { delay: 60 }); await sleep(300);
      await shot(fi, 'e5_tb_params', 'the Trial Balance report: accounting schema and date chosen'); const n10 = fi.__log.length;
      await fi.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).filter(x => x.textContent.trim() === 'Run' && x.offsetParent)[0]; b.click(); }); await sleep(8000);
      const rep = await fi.evaluate(() => { const rows = Array.from(document.querySelectorAll('table')).map(t => Array.from(t.querySelectorAll('tr')).map(tr => Array.from(tr.children).map(td => td.textContent.trim()))).filter(t => t.some(r => r[0] === '12110'))[0] || []; return { rows: rows, foot: (document.body.innerText.match(/Total Dr[^\n]*/) || [''])[0], title: (document.body.innerText.match(/Trial Balance[^\n]*classname[^\n]*/) || [''])[0] }; });
      const r12 = rep.rows.filter(r => r[0] === '12110')[0], r41 = rep.rows.filter(r => r[0] === '41000')[0]; out.report = { rows: rep.rows.length, r12110: r12, r41000: r41, foot: rep.foot, date: date };
      // what the report's 12110 line holds, from the entries of the page's own database: with this invoice, and without it
      const q = (sql, p) => fi.evaluate((s, p) => { const st = window.__idmpDb.prepare(s); st.bind(p); const o = []; while (st.step()) o.push(st.getAsObject()); st.free(); return o; }, sql, p || []);
      const acct = (await q("SELECT c_elementvalue_id AS id FROM c_elementvalue WHERE value='12110' AND ad_client_id IN (0,11)"))[0], recId = Number(out.erp.grid[0].id);
      const base1 = "SELECT ROUND(SUM(amtacctdr),2) AS dr FROM fact_acct WHERE account_id=? AND c_acctschema_id=101 AND dateacct<=?";
      const sum = async (excl) => (await q(excl ? base1 + " AND NOT (ad_table_id=318 AND record_id=?)" : base1, excl ? [acct.id, '2026-11-20 23:59:59', recId] : [acct.id, '2026-11-20 23:59:59']))[0].dr;
      const withInv = await sum(false), without = await sum(true), thisInv = Math.round((withInv - without) * 100) / 100; out.report.sql = { account: '12110', debitWithInvoice: withInv, debitWithoutInvoice: without, thisInvoice: thisInv };
      L('report: 12110 row ' + J(r12) + ' | 41000 row ' + J(r41) + ' | ' + rep.foot + ' | from the entries: debit with the invoice ' + withInv + ', without it ' + without + ', this invoice ' + thisInv);
      await fi.evaluate(() => { const t = Array.from(document.querySelectorAll('table')).filter(t => Array.from(t.querySelectorAll('tr')).some(r => r.firstElementChild && r.firstElementChild.textContent.trim() === '12110'))[0]; const tr = Array.from(t.querySelectorAll('tr')).filter(r => r.firstElementChild.textContent.trim() === '12110')[0]; tr.scrollIntoView({ block: 'center' }); }); await sleep(500);
      await shot(fi, 'e6_tb_report', 'the Trial Balance report, row 12110');
      if (!r12 || Number(r12[2].replace(/,/g, '')) !== withInv || thisInv !== parseFloat(String(grand).replace(/,/g, '')) || !/balanced=true/.test(rep.foot)) { out.report.honest = false; L('REPORT_NOT_INCLUDING: the report row does not equal the entries read from the database: drop the report shot'); } else out.report.honest = true;
      out.net.external = external.slice(); out.erpErrors = fi.__errs; await fi.close();
    }
  } finally { await br.close(); srv.close(); }
  // derived verdicts the narration is allowed to rest on (guard.js reads them)
  if (out.edits) { out.p1 = out.p1 || {}; out.p1.verdictNames = /D28/.test(out.edits[0].verdict) && /F10/.test(out.edits[0].verdict); out.p1.finalAddsUp = out.edits[3].cls === 'good' && /adds up/.test(out.edits[3].verdict); out.dl.sameWithFourChanged = out.dl.wordsSame && out.dl.changedCount === 4 && out.dl.unchangedButMoved === 0 && out.dl.p498 === 0;
    out.reopen.ok = /state=ok/.test(out.reopen.open) && /continued=true/.test(out.reopen.open); out.story.ok = /values=2/.test(out.story.log); out.broken.ok = /state=broken/.test(out.broken.open) && /brokenAt=2/.test(out.broken.open); }
  if (out.doc) { out.refused.ok = /153\.51/.test(out.refused.text) && /153\.5\b/.test(out.refused.text); out.books.balanced = out.books.debit === out.books.credit; out.erp.once = out.erp.grid.length === 1 && out.erp.grid[0].doc === out.doc.head.Number;
    out.posted.balanced = out.posted.balanced && /balanced=true/.test(out.posted.log); out.report.thisInvoice = out.report.sql.thisInvoice; }
  out.net.externalCount = external.length; out.net.externalUrls = external; L('NET external requests aborted for the take: ' + external.length + ' ' + J(external));
  fs.writeFileSync(FACTS, JSON.stringify(out, null, 1)); L('wrote facts.json');
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
function J(x) { return JSON.stringify(x); }
