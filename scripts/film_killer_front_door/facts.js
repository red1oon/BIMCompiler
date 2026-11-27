#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 1 (bim-compiler prompts/FILM_KILLER_FRONT_DOOR.md §3 beats 0-5, §4 cut A). READ out/facts.log AFTER EVERY RUN; an exit code is not evidence.
// What this does: serves the REAL bim-ootb pdf/index.html (a worktree at origin/main, read only) and drives it in headless Chrome on the CPU (--disable-gpu, no GPU work): a real file chooser, real clicks,
// real keystrokes in Find, a real download, the network really switched off and the page really reloaded. Every `§` line the page prints is kept; every number the film shows or says is read back from them
// (out/facts.json). The one-digit-changed copy is made at run time in a temp folder (make_changed_pdf.py) and never committed. The witnesses of the page and the reader are RUN here and their verdicts read from their own logs.
// Usage: OOTB=<bim-ootb worktree at origin/main> node facts.js     (run it with `env -u DBUS_SESSION_BUS_ADDRESS`; headless, never the owner's display)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), cp = require('child_process');
const OOTB = process.env.OOTB;
if (!OOTB || !fs.existsSync(path.join(OOTB, 'pdf/index.html'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at origin/main that has pdf/index.html'); process.exit(2); }
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const XLSX = require(path.join(OOTB, 'erp/xlsx.mini.min.js'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), SHOTS = path.join(OUT, 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kfd_')), DL = path.join(tmp, 'dl'); fs.mkdirSync(DL);
const L = (m) => console.log('§FACTS ' + m), sleep = (ms) => new Promise(r => setTimeout(r, ms));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.pdf': 'application/pdf', '.wasm': 'application/wasm' };
const TB = path.join(OOTB, 'pdf/corpus/trial_balance_th.pdf'), MK = path.join(OOTB, 'pdf/corpus/market_impact_report.pdf');
const out = { made: new Date().toISOString(), ootb: cp.spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), states: {}, pages: {}, net: {} };
const num = (s) => Number(String(s).replace(/,/g, ''));

(async () => {
  // ---- the copy with one digit changed (beat 4): made now, in a temp folder, checked against poppler's own reading of both files
  const CH = path.join(tmp, 'trial_balance_th_one_digit_changed.pdf');
  const mk = cp.spawnSync('python3', ['-I', path.join(__dirname, 'make_changed_pdf.py'), TB, CH], { encoding: 'utf8' }); if (mk.status !== 0) throw new Error('make_changed_pdf failed: ' + mk.stdout + mk.stderr);
  const txt = (f) => cp.spawnSync('pdftotext', ['-raw', f, '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout.split('\n');
  const a = txt(TB), b = txt(CH), diff = []; a.forEach((x, i) => { if (x !== b[i]) diff.push([x, b[i]]); });
  out.changed = { linesDiffer: diff.length, bothSameLength: a.length === b.length, was: (diff[0] && (diff[0][0].match(/498\.09/) || [''])[0]) || null, now: (diff[0] && (diff[0][1].match(/499\.09/) || [''])[0]) || null, file: path.basename(CH) };
  L('COPY made=' + path.basename(CH) + ' pdftotext_lines_differing=' + diff.length + ' was=' + out.changed.was + ' now=' + out.changed.now + ' (a one-digit edit of the text stream; nothing else differs; the file is in a temp folder and is never committed)');
  if (diff.length !== 1 || out.changed.was !== '498.09' || out.changed.now !== '499.09') throw new Error('the changed copy is not a one-digit change');

  let served = 0; const srv = http.createServer((q, s) => { served++; let p = path.join(OOTB, decodeURIComponent(q.url.split('?')[0])); if (p.indexOf(OOTB) !== 0) { s.writeHead(403); return s.end(); } if (/\/$/.test(p)) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(d); }); });
  const socks = new Set(); srv.on('connection', k => { socks.add(k); k.on('close', () => socks.delete(k)); }); await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port, ORIGIN = srv.address().port;
  const br = await puppeteer.launch({ headless: 'new', userDataDir: path.join(tmp, 'profile'), args: ['--no-sandbox', '--disable-gpu'] });
  const pg = await br.newPage(); await pg.setViewport({ width: 1280, height: 358, deviceScaleFactor: 1.5 });   // drawn 1.5 times larger: 1920 x 537, the lower frame
  const logs = [], reqs = [], errs = []; pg.on('console', m => logs.push(m.text())); pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  pg.on('request', r => reqs.push({ m: r.method(), u: r.url(), body: !!r.postData() }));
  const cdp = await pg.target().createCDPSession(); await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL });
  const waitLog = async (re, from, ms) => { for (let t = 0; t < (ms || 20000); t += 100) { const l = logs.slice(from).filter(x => re.test(x))[0]; if (l) return l; await sleep(100); } return null; };
  const settle = async () => { await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await sleep(400); };
  const shot = async (id, note) => { await sleep(300); await settle(); await pg.screenshot({ path: path.join(SHOTS, id + '.png') }); out.states[id] = { file: 'shots/' + id + '.png', note }; L('shot ' + id + ' ' + note); };
  const drawn = () => pg.waitForFunction('document.querySelector(".pg") && Array.from(document.querySelectorAll(".pg")).some(function(d){return d.dataset.drawn==="1"})', { timeout: 20000 });
  // real file chooser; the requests made AFTER the file is chosen are counted (beat 1's "nothing is uploaded" is said only if that count is 0)
  const pick = async (file) => { const n = logs.length, r0 = reqs.length, r = await Promise.all([pg.waitForFileChooser(), pg.click('#b-open')]); await r[0].accept([file]); const open = await waitLog(/^§PDFED-OPEN/, n); await drawn().catch(() => {}); await sleep(1200); return { n, open, reqs: reqs.slice(r0) }; };
  const netOf = (rs) => ({ requests: rs.length, withBody: rs.filter(x => x.body).length, notGet: rs.filter(x => x.m !== 'GET').length, otherOrigin: rs.filter(x => new URL(x.u).port != ORIGIN).length, urls: rs.map(x => x.m + ' ' + x.u.replace(base, '')) });
  const wheel = async (sel, dx, dy) => { const r = await pg.evaluate((s) => { const e = document.querySelector(s).getBoundingClientRect(); return { x: e.left + e.width / 2, y: e.top + e.height / 2 }; }, sel); await pg.mouse.move(r.x, r.y); await pg.mouse.wheel({ deltaX: dx, deltaY: dy }); await sleep(500); };
  const verdictOf = () => pg.evaluate(() => ({ text: document.getElementById('verdict').textContent, cls: document.getElementById('verdict').className, cells: document.querySelectorAll('#grid td[data-a]').length, d28: (document.querySelector('#grid td[data-a="D28"]') || {}).textContent || null, e28: (document.querySelector('#grid td[data-a="E28"]') || {}).textContent || null }));
  const readSheet = async () => { const n = logs.length; await pg.click('#b-sheet'); const rd = await waitLog(/^§SHEET_READER/, n); await sleep(400); const st = await pg.evaluate(() => document.getElementById('sheet').scrollTop); if (st > 0) await wheel('#sheet', 0, -st - 50); const v = await verdictOf(); return { log: rd, v }; };
  try {
    await pg.goto(base + '/pdf/index.html', { waitUntil: 'load' }); const boot = await waitLog(/^§PDFED-BOOT/, 0, 10000); if (!boot) throw new Error('page did not boot');
    const swReady = await waitLog(/^§PDFED-OFFLINE ready=true/, 0, 15000); await sleep(600); L('boot ' + boot + ' | ' + swReady);
    out.pdfjs = (/pdfjs=(\S+)/.exec(boot) || [])[1]; out.stat0 = await pg.evaluate(() => document.getElementById('stat').textContent);
    await shot('empty', 'the page before any file: "' + out.stat0 + '"');

    // ---- beat 1: open the trial balance (real file chooser)
    const o1 = await pick(TB); const m1 = /pages=(\d+) chars=(\d+) outline=(\d+)/.exec(o1.open || '') || [];
    out.b1 = { open: o1.open, pages: +m1[1], chars: +m1[2], file: 'trial_balance_th.pdf', stat: await pg.evaluate(() => document.getElementById('stat').textContent) }; out.net.b1 = netOf(o1.reqs);
    L('b1 ' + o1.open + ' | requests after the file was chosen=' + out.net.b1.requests + ' withBody=' + out.net.b1.withBody + ' notGet=' + out.net.b1.notGet + ' otherOrigin=' + out.net.b1.otherOrigin + ' urls=' + out.net.b1.urls.join(','));
    await shot('b1_open', 'trial balance opened: ' + out.b1.stat);

    // ---- beat 2: the 12-page report, Find (real keystrokes), outline click
    const o2 = await pick(MK); const m2 = /pages=(\d+) chars=(\d+) outline=(\d+)/.exec(o2.open || '') || []; out.net.b2 = netOf(o2.reqs);
    out.b2 = { open: o2.open, pages: +m2[1], outline: +m2[3] }; L('b2 ' + o2.open + ' | requests after the file was chosen=' + out.net.b2.requests + ' otherOrigin=' + out.net.b2.otherOrigin);
    await shot('b2_open', 'the 12-page report opened with its outline');
    const nf = logs.length; await pg.type('#q', 'market', { delay: 90 }); const fd = await waitLog(/^§PDFED-FIND q="market"/, nf); await sleep(300); const fl = logs.slice(nf).filter(x => /^§PDFED-FIND/.test(x)).pop();
    const mf = /hits=(\d+) pages=(\d+)/.exec(fl || '') || []; const want = (txt(MK).join('\n').toLowerCase().match(/market/g) || []).length;
    out.find = { q: 'market', hits: +mf[1], pagesHit: +mf[2], poppler: want, hitLines: await pg.evaluate(() => document.querySelectorAll('#hits a').length) }; L('find ' + fl + ' | poppler counts ' + want + ' (same=' + (want === out.find.hits) + ')');
    await wheel('aside', 0, 5000); out.find.hitsShown = await pg.evaluate(() => { const h = document.getElementById('hits').getBoundingClientRect(), a = document.querySelector('aside').getBoundingClientRect(), l = Array.from(document.querySelectorAll('#hits a')); return l.filter(e => { const r = e.getBoundingClientRect(); return r.top >= a.top && r.bottom <= a.bottom; }).length; });
    await shot('b2_find', 'Find "market": ' + out.find.hits + ' hits on ' + out.find.pagesHit + ' pages');
    const ol = await pg.evaluate(() => Array.from(document.querySelectorAll('#outline a')).map(a => a.textContent)); out.outlineTitles = ol; const pick5 = Math.min(5, ol.length - 1);
    await pg.click('#outline a:nth-of-type(' + (pick5 + 1) + ')'); await sleep(900);
    out.outlineClick = { index: pick5 + 1, title: ol[pick5], page: await pg.evaluate(() => window.PdfPage.state.current) }; L('outline clicked entry ' + out.outlineClick.index + ' of ' + ol.length + ' "' + out.outlineClick.title + '" -> page ' + out.outlineClick.page);
    await shot('b2_outline', 'outline entry "' + out.outlineClick.title + '" -> page ' + out.outlineClick.page);

    // ---- beat 3: back to the trial balance, Read as sheet, hover D28
    await pg.click('#q', { clickCount: 3 }); await pg.keyboard.press('Backspace'); await sleep(300);   // the Find box is cleared by hand, as a person would
    const o3 = await pick(TB); await shot('b3_open', 'back to the trial balance');
    const r3 = await readSheet(); out.read = { log: r3.log, verdictText: r3.v.text, cls: r3.v.cls, cells: r3.v.cells, d28: r3.v.d28, e28: r3.v.e28, readerCells: +((/cells=(\d+)/.exec(r3.log) || [])[1]), reason: (/reason="([^"]*)"/.exec(r3.log) || [])[1], verdict: (/verdict=(\S+)/.exec(r3.log) || [])[1] };
    L('b3 ' + r3.log + ' | page says "' + r3.v.text + '" cells_in_grid=' + r3.v.cells + ' D28=' + r3.v.d28 + ' E28=' + r3.v.e28); await shot('b3_sheet', 'Read as sheet: ' + r3.v.text);
    // bring the cell's box into view with the mouse wheel (real scrolling), then hover D28
    const need = await pg.evaluate(() => { const S = window.PdfPage.state, m = S.read.map.D28, d = document.querySelector('.pg[data-p="' + m.page + '"]'), host = document.getElementById('pages'), k = d.clientWidth / S.info.sizes[m.page - 1][0];
      return { dx: Math.max(0, m.box[2] * k - host.clientWidth + 40) - host.scrollLeft, dy: (d.offsetTop - host.offsetTop + m.box[1] * k - host.clientHeight / 2) - host.scrollTop }; });
    await wheel('#pages', need.dx, need.dy); await wheel('#sheet', 0, 5000);
    await pg.hover('#grid td[data-a="D28"]'); const tb = await pg.evaluate(() => { const r = document.querySelector('#grid td[data-a="D28"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await pg.mouse.move(tb.x + 2, tb.y + 1); await pg.mouse.move(tb.x, tb.y); await settle();
    const box = await pg.evaluate(() => { const b = document.querySelector('.pg .box'), h = document.getElementById('pages').getBoundingClientRect(); if (!b) return null; const r = b.getBoundingClientRect(), t = document.querySelector('#grid td[data-a="D28"]').getBoundingClientRect(), sh = document.getElementById('sheet').getBoundingClientRect(); return { a: b.dataset.a, n: document.querySelectorAll('.pg .box').length, rect: [r.left, r.top, r.right, r.bottom], inside: r.left >= h.left && r.right <= h.right && r.top >= h.top && r.bottom <= h.bottom, cellInside: t.top >= sh.top && t.bottom <= sh.bottom }; });
    out.box = box; L('b3 hover D28: box ' + JSON.stringify(box)); if (!box || !box.inside || box.n !== 1 || !box.cellInside) throw new Error('the box of D28 is not visible on the page: ' + JSON.stringify(box));
    await shot('b3_hover', 'hover D28: its box on the page');
    { const r = cp.spawnSync('python3', ['-I', '-c', 'import sys; from PIL import Image; im = Image.open(sys.argv[1]).convert("RGB"); x0, y0, x1, y1 = [int(float(v) * 1.5) for v in sys.argv[2:6]]; n = 0; t = 0\nfor y in range(y0, y1):\n  for x in range(x0, x1):\n    p = im.getpixel((x, y)); t += 1; n += (abs(p[0] - 31) < 40 and abs(p[1] - 111) < 40 and abs(p[2] - 235) < 40)\nprint(n, t)', path.join(SHOTS, 'b3_hover.png')].concat(out.box.rect.map(String)), { encoding: 'utf8' }); const [bn, bt] = r.stdout.trim().split(' ').map(Number); out.box.blueOutlinePixels = bn; out.box.areaPixels = bt; L('b3 hover D28 painted: pixels of the box outline colour inside its rectangle in the frame=' + bn + ' of ' + bt + (bn > 60 ? '' : ' NOT PAINTED')); if (!(bn > 60)) throw new Error('the box is not painted in the shot'); }
    if (r3.v.d28 !== r3.v.e28) L('NOTE D28 and E28 differ: debit != credit would be false');

    // ---- beat 4: the one-digit-changed copy
    const o4 = await pick(CH); await shot('b4_open', 'the changed copy opened');
    const r4 = await readSheet(); out.bad = { log: r4.log, verdictText: r4.v.text, cls: r4.v.cls, verdict: (/verdict=(\S+)/.exec(r4.log) || [])[1], reason: (/reason="([^"]*)"/.exec(r4.log) || [])[1] };
    const mb = /([A-Z]+\d+): printed ([\d.,]+) != rows sum ([\d.,]+)/.exec(r4.v.text) || []; out.bad.cell = mb[1]; out.bad.printed = mb[2]; out.bad.rowsSum = mb[3];
    L('b4 ' + r4.log + ' | page says "' + r4.v.text + '"'); await shot('b4_sheet', 'the copy: ' + r4.v.text);
    if (out.bad.verdict !== 'DOES_NOT_ADD_UP' || !out.bad.cell) throw new Error('the changed copy was not caught: ' + r4.log);

    // ---- beat 5a: the original again, read, download the .xlsx (real download), re-read the file
    const o5 = await pick(TB); const r5 = await readSheet(); out.again = { verdictText: r5.v.text, cells: r5.v.cells }; L('b5a again ' + r5.log + ' | page says "' + r5.v.text + '"'); await shot('b5_sheet', 'the first report read again: ' + r5.v.text);
    const nx = logs.length; await pg.click('#b-xlsx'); const xl = await waitLog(/^§PDFED-XLSX/, nx); let f = null; for (let t = 0; t < 10000 && !f; t += 200) { f = fs.readdirSync(DL).filter(x => /\.xlsx$/.test(x) && !/crdownload/.test(x))[0]; await sleep(200); }
    if (!xl || !f) throw new Error('no download: ' + xl);
    const wb = XLSX.read(fs.readFileSync(path.join(DL, f)), { type: 'buffer' }), ws = wb.Sheets.Report, d28 = ws.D28;
    out.xlsx = { log: xl, file: f, bytes: fs.statSync(path.join(DL, f)).size, cells: +((/cells=(\d+)/.exec(xl) || [])[1]), sheets: wb.SheetNames, d28f: d28.f, d28v: d28.v, sums: Object.keys(ws).filter(k => ws[k] && ws[k].f && /^SUM\(/.test(ws[k].f)).length, rereadCells: Object.keys(ws).filter(k => /^[A-Z]+\d+$/.test(k)).length };
    L('b5a ' + xl + ' | the file re-read: sheets=' + wb.SheetNames.join('/') + ' D28=' + d28.v + ' formula=' + d28.f + ' sum_formulas=' + out.xlsx.sums + ' cells_in_file=' + out.xlsx.rereadCells); await shot('b5_download', 'Download .xlsx clicked: ' + f);

    // ---- beat 5b: the network switched off (real), the page reloaded, still reads the report
    // the network is really cut: the page's own server is shut down (every open connection destroyed) and the browser is set offline; the page can then only come from its own cache
    await new Promise(r => { srv.close(r); socks.forEach(k => k.destroy()); }); await pg.setOfflineMode(true); const onl = await pg.evaluate(() => navigator.onLine); const nr = logs.length, rr = reqs.length, sv0 = served; await pg.reload({ waitUntil: 'load' }).catch(() => {}); const boot2 = await waitLog(/^§PDFED-BOOT/, nr, 10000);
    if (!boot2) throw new Error('the page did not reload with the network off'); await sleep(500);
    out.offline = { navigatorOnLine: onl, boot: boot2 }; L('b6 network off: navigator.onLine=' + onl + ' reload -> ' + boot2); await shot('b6_offline_boot', 'the page reloaded with the network off');
    const o6 = await pick(TB); const r6 = await readSheet(); out.offline.verdictText = r6.v.text; out.offline.read = r6.log; out.offline.cells = r6.v.cells; out.offline.serverHits = served - sv0;  /* the server is gone: any request that still reached it would be counted */ out.offline.probe = await pg.evaluate(() => fetch('/probe-not-in-cache-' + Date.now()).then(r => 'reached the server: HTTP ' + r.status, e => 'no network: ' + e.name)); out.offline.onLineAfter = await pg.evaluate(() => navigator.onLine);
    L('b6 offline ' + o6.open + ' | ' + r6.log + ' | page says "' + r6.v.text + '" navigator.onLine_after=' + out.offline.onLineAfter + ' | requests that reached the server from reload to the end of the read=' + out.offline.serverHits + ' | probe of an uncached address: ' + out.offline.probe); await shot('b6_offline_sheet', 'read offline: ' + r6.v.text);
        out.pageErrors = errs; out.pdfNet = { allRequestsOtherOrigin: netOf(reqs).otherOrigin, total: reqs.length };
    L('NET whole take: requests=' + reqs.length + ' to another origin=' + out.pdfNet.allRequestsOtherOrigin + ' page_errors=' + errs.length + (errs.length ? ' ' + errs.join(' | ') : ''));
  } finally { await br.close(); try { srv.close(); } catch (e) { /* already shut down for the offline beat */ } }

  // ---- witnesses of the page and the reader: RUN here, verdicts read from their own logs (credentials on the last card)
  const wit = (name) => { const lf = path.join(OUT, 'witness_' + name + '.log'), r = cp.spawnSync('node', [path.join(OOTB, 'pdf/tests/witness_' + name + '.js')], { encoding: 'utf8', maxBuffer: 1 << 26, env: Object.assign({}, process.env, { NODE_PATH: path.join(os.homedir(), 'bim-compiler', 'node_modules') }) }); fs.writeFileSync(lf, r.stdout + r.stderr); return { exit: r.status, log: r.stdout + r.stderr }; };
  const wr = wit('sheet_reader'), wp = wit('pdfed_page'), vr = /§SREAD-VERDICT (\S+) judged=(\d+) failed=(\d+)/.exec(wr.log), vp = /§PDFPG-VERDICT (\S+) judged=(\d+) failed=(\d+)/.exec(wp.log);
  out.witness = { reader: vr && { verdict: vr[1], judged: +vr[2], failed: +vr[3], exit: wr.exit }, page: vp && { verdict: vp[1], judged: +vp[2], failed: +vp[3], exit: wp.exit } };
  const limits = (wr.log.match(/^§SREAD-LIMIT /gm) || []).length, man = JSON.parse(fs.readFileSync(path.join(OOTB, 'pdf/corpus/manifest.json'), 'utf8')), layouts = man.files.filter(x => x.oracle).length;
  out.layouts = { tried: layouts, notRebuilt: limits, rebuilt: layouts - limits };
  L('WITNESS reader ' + JSON.stringify(out.witness.reader) + ' | page ' + JSON.stringify(out.witness.page) + ' | layouts tried=' + layouts + ' (manifest files with an oracle) not rebuilt=' + limits + ' (§SREAD-LIMIT lines) rebuilt=' + (layouts - limits));
  const prs = cp.spawnSync('git', ['-C', OOTB, 'log', '--format=%s', 'HEAD', '--', 'pdf/'], { encoding: 'utf8' }).stdout.split('\n').map(s => (/\(#(\d+)\)\s*$/.exec(s) || [])[1]).filter(Boolean).map(Number).sort();
  out.prs = prs; L('PRS git log HEAD (the checkout served, ' + out.ootb + ') -- pdf/ gives PR numbers ' + prs.join(','));
  // the link on the last card: the guide page if it is live with its anchor, else the app itself (the docs deploy of this PR was refused by the seatbelt, see the RESULT)
  const GUIDE = 'https://red1oon.github.io/BIMCompiler/PdfPageGuide/#read-as-sheet', APP = 'https://red1oon.github.io/bim-ootb/pdf/';
  const get = (u) => cp.spawnSync('curl', ['-s', '-L', '-w', '\n%{http_code}', u], { encoding: 'utf8', maxBuffer: 1 << 26 }), gg = get(GUIDE.split('#')[0]), ga = get(APP), gcode = +gg.stdout.trim().split('\n').pop(), acode = +ga.stdout.trim().split('\n').pop();
  const anchor = /id="read-as-sheet"/.test(gg.stdout), useGuide = gcode === 200 && anchor;
  out.link = { url: useGuide ? GUIDE : APP, http: useGuide ? gcode : acode, anchor: useGuide ? 'read-as-sheet' : '-', guideHttp: gcode, guideAnchor: anchor, appHttp: acode };
  L('FILM_GUIDE url=' + out.link.url + ' http=' + out.link.http + ' anchor=' + out.link.anchor + ' (guide page http=' + gcode + ' anchor_found=' + anchor + '; app http=' + acode + ')');
  out.read.debitEqualsCredit = out.read.d28 === out.read.e28; out.offline.worked = out.offline.serverHits === 0 && /^no network/.test(out.offline.probe) && /adds up/.test(out.offline.verdictText); out.find.everyHit = out.find.hits === out.find.poppler;
  fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(out, null, 1));
  // verdict: INCONCLUSIVE when nothing was judged; FAIL on any number that does not hold
  const bad = [];
  if (out.b1.pages !== 1) bad.push('b1 pages'); if (out.read.verdict !== 'ADDS_UP' || out.read.cells !== 144 || out.read.cells !== out.read.readerCells) bad.push('read'); if (out.read.d28 !== out.read.e28) bad.push('debit!=credit');
  if (out.find.hits !== out.find.poppler) bad.push('find vs poppler'); if (!(out.xlsx.d28f === 'SUM(D6:D26)' && out.xlsx.rereadCells >= out.xlsx.cells)) bad.push('xlsx'); if (out.offline.navigatorOnLine !== false || !/adds up/.test(out.offline.verdictText) || out.offline.serverHits !== 0 || !/^no network/.test(out.offline.probe)) bad.push('offline');
  if (!out.witness.reader || out.witness.reader.verdict !== 'PASS' || !out.witness.page || out.witness.page.verdict !== 'PASS') bad.push('witness'); if (out.pageErrors.length) bad.push('page errors');
  L('FACTS_VERDICT ' + (bad.length ? 'FAIL ' + bad.join(',') : 'PASS') + ' (judged: pages, cells, debit=credit, find vs poppler, xlsx formula, offline, witnesses, page errors)'); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
