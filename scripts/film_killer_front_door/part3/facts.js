#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps" PART 3, the memory (bim-compiler prompts/FILM_KILLER_FRONT_DOOR.md, Film 3). READ out/facts.log AFTER EVERY RUN; an exit code is not evidence.
// What this does: serves the REAL bim-ootb page erp/sheet_addin/history.html from a read-only worktree and drives it in headless Chrome on the CPU (--disable-gpu, no GPU work): real file choosers, real clicks and key presses, real
// downloads. Every `§SHIST-PAGE-*` line the page prints is kept; every number the film shows or says is read back from them, from the page's own DOM, or from the downloaded files re-read in node (the engine's own verify AND the
// kernel's verifyJournal). The files "changed outside the page" are made at record time in a temp folder by a SCRIPT (SheetJS in node), never by a real spreadsheet program, and are never committed.
// The server counts every request; external requests would be aborted and counted. Usage: OOTB=<bim-ootb worktree at origin/main> node facts.js   (run with `env -u DBUS_SESSION_BUS_ADDRESS`; headless)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), http = require('http'), cp = require('child_process');
const OOTB = process.env.OOTB, ERP = OOTB && path.join(OOTB, 'erp');
if (!OOTB || !fs.existsSync(path.join(ERP, 'sheet_addin/history.html'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at origin/main that has erp/sheet_addin/history.html'); process.exit(2); }
if (!process.env.SQLJS) process.env.SQLJS = '/home/red1/bim-ootb/tests/node_modules/sql.js';   // ws_kernel's node shell reads it (verifyJournal does not boot the kernel)
if (!global.crypto || !global.crypto.subtle) global.crypto = require('crypto').webcrypto;
const _log = console.log; console.log = function () { /* the kernel's own lines */ };
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const XLSX = require(path.join(ERP, 'xlsx.mini.min.js')), SH = require(path.join(ERP, 'sheet_history.js')), K = require(path.join(ERP, 'ws_kernel.js'));
const SA = require(path.join(ERP, 'sheet_addin/host_shim.js')), XH = require(path.join(ERP, 'sheet_addin/xlsx_host.js'));
const OUT = path.join(__dirname, process.env.OUTD || 'out'), SHOTS = path.join(OUT, 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kfd3_')), SRC = path.join(ERP, 'ninja_sample.xlsx');
const L = (m) => _log('§FACTS ' + m), sleep = (ms) => new Promise(r => setTimeout(r, ms)), J = JSON.stringify;
const VIEW = { width: 1100, height: 307, deviceScaleFactor: 1920 / 1100 };   // drawn 1.745 times larger: 1920 wide, the lower frame
const out = { made: new Date().toISOString(), ootb: cp.spawnSync('git', ['-C', OOTB, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), states: {}, net: {} }; out.ootbShort = out.ootb.slice(0, 8);
const PAGE = 'erp/sheet_addin/history.html', TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const NET = { requests: 0, bytes: 0, urls: [], notGet: [] }, external = [];

// ---- node side: the same layers the page uses (reading and checking the files the page hands back)
const readWb = (f) => XLSX.read(fs.readFileSync(f), Object.assign({ type: 'buffer' }, XH.READ));
const writeWb = (wb, name) => { const f = path.join(tmp, name); fs.writeFileSync(f, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', compression: true })); return f; };
const hostOf = (wb) => XH.create(XLSX, wb, { engineValue: (v) => v, userName: 'node' });
const rowsOf = (wb) => { const s = wb.Sheets[SA.HISTORY]; return s && s['!ref'] ? XLSX.utils.sheet_to_json(s, { header: 1, raw: true, defval: '' }).map(r => r.map(c => c == null ? '' : String(c))) : []; };
const linesOf = (wb) => rowsOf(wb).map(r => r.join('')).filter(Boolean);
const hiddenOf = (wb, name) => { const i = wb.SheetNames.indexOf(name), m = wb.Workbook && wb.Workbook.Sheets && wb.Workbook.Sheets[i]; return i < 0 ? null : (m && m.Hidden ? m.Hidden : 0); };
const visible = (wb) => wb.SheetNames.filter(n => !hiddenOf(wb, n));
const cellsOf = (wb) => { const o = {}; visible(wb).forEach(n => { const s = wb.Sheets[n]; Object.keys(s).forEach(a => { if (a.charAt(0) !== '!' && (s[a].v != null || s[a].f != null)) o[n + '!' + a] = [s[a].t === 'z' ? null : s[a].v, s[a].f || null]; }); }); return o; };
const snapOf = async (wb) => { const h = hostOf(wb), o = {}, n = visible(wb); for (let i = 0; i < n.length; i++) o[n[i]] = await h.readSheetValues(n[i]); return o; };
const canon = (snap) => J(Object.keys(snap).filter(s => Object.keys(snap[s]).length).sort().map(s => [s, Object.keys(snap[s]).sort().map(a => { const c = snap[s][a]; return [a, c.v === undefined ? null : c.v, c.f == null ? null : c.f]; })]));
const put = (s, a, v) => { if (v == null) delete s[a]; else s[a] = typeof v === 'number' ? { t: 'n', v } : { t: 's', v: String(v) }; const r = XLSX.utils.decode_range(s['!ref']), c = XLSX.utils.decode_cell(a); r.e.r = Math.max(r.e.r, c.r); r.e.c = Math.max(r.e.c, c.c); s['!ref'] = XLSX.utils.encode_range(r); };
const editOutside = (file, name, fn) => { const wb = readWb(file); fn(wb.Sheets, wb); return writeWb(wb, name); };   // "another program": the file opened, cells changed, saved again by a script
const tamper = (file, name, from, to) => { const wb = readWb(file), s = wb.Sheets[SA.HISTORY]; let hits = 0; Object.keys(s).forEach(a => { if (a.charAt(0) !== '!' && String(s[a].v).indexOf(from) >= 0 && !hits) { s[a] = { t: 's', v: String(s[a].v).replace(from, to) }; hits++; } }); return { file: writeWb(wb, name), hits }; };
async function fileFacts(file) { const wb = readWb(file), lines = linesOf(wb), v = await SH.verify(lines), kv = K.verifyJournal(lines.join('\n')), shim = SA.create(hostOf(wb), { SheetHistory: SH }), ch = await shim.checkHistory(); return { wb, lines, entries: v.ok ? lines.map(l => JSON.parse(l)) : [], verify: v, kernel: kv, hidden: hiddenOf(wb, SA.HISTORY), check: ch, cells: cellsOf(wb) }; }

(async () => {
  const srv = http.createServer((req, rsp) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''); if (!/favicon\.ico$/.test(rel)) { NET.requests++; NET.urls.push(req.method + ' ' + rel); }
    if (req.method !== 'GET') { NET.notGet.push(req.method + ' ' + rel); req.resume(); rsp.writeHead(405); return rsp.end(); }
    const f = path.join(OOTB, rel); if (f.indexOf(OOTB) !== 0 || !fs.existsSync(f) || !fs.statSync(f).isFile()) { rsp.writeHead(404); return rsp.end(); }
    const body = fs.readFileSync(f); NET.bytes += body.length; rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' }); rsp.end(body);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'], env: (() => { const e = Object.assign({}, process.env); delete e.DBUS_SESSION_BUS_ADDRESS; return e; })() });
  const newPage = async () => { const pg = await br.newPage(); await pg.setViewport(VIEW); pg.__log = []; pg.__reqs = []; pg.__errs = []; pg.__cdp = await pg.target().createCDPSession();
    pg.on('console', m => { const t = m.text(); if (/^§/.test(t)) pg.__log.push(t); }); pg.on('pageerror', e => { pg.__errs.push(String(e.message).slice(0, 160)); });
    await pg.setRequestInterception(true); pg.on('request', rq => { const u = rq.url(); if (!/favicon\.ico$/.test(u)) pg.__reqs.push(rq.method() + ' ' + u); if (u.indexOf(base) !== 0 && !/^(data|blob):/.test(u)) { external.push(rq.method() + ' ' + u.slice(0, 120)); return rq.abort(); } rq.continue(); });
    const n0 = NET.requests, b0 = NET.bytes, u0 = NET.urls.length; await pg.goto(base + PAGE, { waitUntil: 'load', timeout: 120000 }); await pg.waitForFunction(() => !!(window.HistoryPage && window.HistoryPage.state.cost), { timeout: 60000 });
    pg.__load = { requests: NET.requests - n0, bytes: NET.bytes - b0, urls: NET.urls.slice(u0).map(u => u.replace(/^GET /, '')) }; return pg; };
  const settle = async (pg) => { await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await sleep(350); };
  const shot = async (pg, id, note) => { await sleep(250); await settle(pg); await pg.screenshot({ path: path.join(SHOTS, id + '.png') }); out.states[id] = { file: 'shots/' + id + '.png', note }; L('shot ' + id + ' ' + note); };
  const renders = (pg) => pg.evaluate(() => window.HistoryPage.state.renders);
  const act = async (pg, fn) => { const n = await renders(pg); await fn(); await pg.waitForFunction((k) => { const s = window.HistoryPage.state; return s.renders > k && !s.busy; }, { timeout: 60000 }, n); await sleep(200); };
  const choose = (pg, label, file) => act(pg, async () => { const got = await Promise.all([pg.waitForFileChooser({ timeout: 30000 }), pg.click(label)]); await got[0].accept([file]); });
  const openFile = (pg, f) => choose(pg, 'label[for=file]', f), openOther = (pg, f) => choose(pg, 'label[for=file2]', f);
  const setName = async (pg, name) => { await pg.$eval('#who', e => { e.value = ''; }); await pg.type('#who', name, { delay: 80 }); };
  const stamp = (pg) => act(pg, () => pg.click('#b-stamp'));
  const download = async (pg, sel) => { const dir = fs.mkdtempSync(path.join(tmp, 'dl-')); await pg.__cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dir }); await pg.click(sel); for (let t = 0; t < 300; t++) { const fl = fs.readdirSync(dir).filter(f => !/\.crdownload$/.test(f)); if (fl.length && fs.statSync(path.join(dir, fl[0])).size > 0) { await sleep(150); return path.join(dir, fl[0]); } await sleep(100); } throw new Error('no download from ' + sel); };
  const clickData = async (pg, sel, attr, val) => { const has = await pg.evaluate((s, a, v) => Array.from(document.querySelectorAll(s)).some(x => x.dataset[a] === v), sel, attr, val); if (!has) return false; await act(pg, () => pg.evaluate((s, a, v) => { Array.from(document.querySelectorAll(s)).filter(x => x.dataset[a] === v)[0].click(); }, sel, attr, val)); return true; };
  const goStep = (pg, n) => clickData(pg, '#steps button', 'step', String(n)), cellStory = (pg, a) => clickData(pg, '#grid td', 'cell', a);
  const pickSide = (pg, side) => pg.evaluate((s) => { const b = document.querySelector('#conflicts button[data-pick="' + s + '"]'); if (b) b.click(); return !!b; }, side);
  const logOf = (pg, re) => pg.__log.filter(l => re.test(l));
  const dom = (pg) => pg.evaluate(() => { const q = (s) => Array.from(document.querySelectorAll(s)), id = (x) => document.getElementById(x), H = window.HistoryPage.state;
    const shown = (x) => { const e = id(x); return !!e && !e.hidden && !(e.closest('section') && e.closest('section').hidden); }, grid = {}; q('#grid td').forEach(td => { if (td.dataset.v !== undefined) grid[td.dataset.cell] = { v: JSON.parse(td.dataset.v), f: td.dataset.f === undefined ? null : td.dataset.f }; });
    return { state: id('status').dataset.state, status: id('status').textContent, opened: id('opened').textContent, name: id('who').value, whoNote: id('who-note').textContent,
      pending: shown('pending') ? q('#pending li').map(li => ({ cell: li.dataset.cell, over: li.dataset.typedOver === '1', text: li.textContent })) : [],
      stamp: shown('stamp-result') ? { verdict: id('stamp-result').dataset.verdict, text: id('stamp-result').textContent } : { verdict: null, text: '' }, stampDisabled: id('b-stamp').disabled, downloadShown: shown('b-download'), sheetShown: shown('sheet'), storyShown: shown('story'), mergeShown: shown('merge'), stepShown: shown('b-download-step'),
      steps: q('#steps button').map(b => ({ step: b.dataset.step, on: b.getAttribute('aria-pressed') === 'true', text: b.textContent })), tabs: q('#tabs button').map(b => b.dataset.sheet), sheet: H.sheet, viewNote: id('view-note').textContent, grid, marks: q('#grid td.chg').map(td => td.dataset.cell),
      storyHead: id('story-head').textContent, story: q('#story-list li').map(li => ({ seq: li.dataset.seq ? Number(li.dataset.seq) : null, actor: li.dataset.actor || null, at: li.dataset.at || null, before: li.dataset.before ? JSON.parse(li.dataset.before) : null, after: li.dataset.after ? JSON.parse(li.dataset.after) : null, typedOverFormula: li.dataset.typedOver === '1', mergedAt: li.dataset.mergedAt ? Number(li.dataset.mergedAt) : null, text: li.textContent })),
      merge: { verdict: id('merge-status').dataset.verdict, text: id('merge-status').textContent, applied: q('#merge-applied li').map(li => ({ cell: li.dataset.cell, actor: li.dataset.actor, text: li.textContent })),
        conflicts: q('#conflicts .conflict').map(c => ({ cell: c.dataset.cell, a: JSON.parse(c.dataset.a), b: JSON.parse(c.dataset.b), base: JSON.parse(c.dataset.base), whoA: c.dataset.whoA, whoB: c.dataset.whoB, text: c.querySelector('p').textContent, buttons: Array.from(c.querySelectorAll('button')).map(b => ({ pick: b.dataset.pick, on: b.getAttribute('aria-pressed') === 'true', text: b.textContent })) })), finishShown: shown('b-merge'), finishDisabled: id('b-merge').disabled },
      lines: H.lines.length, fileName: H.name }; });
  const pageBytes = async (pg) => { const b64 = await pg.evaluate(() => { const u = window.HistoryPage.bytes(); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }); const f = path.join(tmp, 'peek-' + Date.now() + '.xlsx'); fs.writeFileSync(f, Buffer.from(b64, 'base64')); return f; };
  // scroll the page (real wheel) so that an element sits at the top of the frame
  const toEl = async (pg, sel, dy) => { await pg.evaluate((s, d) => { const e = document.querySelector(s); window.scrollTo(0, Math.max(0, e.getBoundingClientRect().top + window.scrollY - (d == null ? 8 : d))); }, sel, dy); await sleep(300); };

  try {
    const S0 = await snapOf(readWb(SRC)), N0 = Object.keys(S0).reduce((n, s) => n + Object.keys(S0[s]).length, 0), B6 = S0.BACKUP.B6.v, B7 = S0.BACKUP.B7.v;
    out.sample = { file: 'ninja_sample.xlsx', sheets: Object.keys(S0).length, cells: N0, B9: S0.BACKUP.B9, B6, B7 }; L('FIXTURE workbook=ninja_sample.xlsx (the repo\'s own, 24,938 bytes) sheets=' + out.sample.sheets + ' cells=' + N0 + ' BACKUP!B9=' + J(S0.BACKUP.B9) + ' B6=' + B6 + ' B7=' + B7);
    if (!(S0.BACKUP.B9 && S0.BACKUP.B9.f === 'SUM(B5:B8)' && !S0.BACKUP.F2 && !S0.BACKUP.C5 && !S0.BACKUP.C6)) throw new Error('the sample workbook is not the one the film needs');
    const pg = await newPage(); out.load = pg.__load; out.cost = logOf(pg, /^§SHIST-PAGE-COST/)[0]; L('page loaded: ' + J(pg.__load.urls) + ' requests=' + pg.__load.requests + ' bytes=' + pg.__load.bytes + ' | ' + out.cost);
    const F = {}, mark = NET.requests;
    // ===== beat 1: open the file (real chooser), type a name, Stamp
    await shot(pg, 'h0_page', 'the history page before any file');
    await openFile(pg, SRC); const d0 = await dom(pg); out.o1 = { status: d0.status, opened: d0.opened, log: logOf(pg, /^§SHIST-PAGE-OPEN/)[0], whoNote: d0.whoNote }; L('b1 open: ' + out.o1.log + ' | page says "' + d0.status + '"'); await shot(pg, 'h1_open', 'the sample workbook opened: ' + d0.status);
    await setName(pg, 'Aisha'); await toEl(pg, '#h-open', 8); await shot(pg, 'h1b_named', 'the name typed, ready to stamp'); await stamp(pg); const d1 = await dom(pg); F.f1 = await download(pg, '#b-download'); out.s1 = { log: logOf(pg, /^§SHIST-PAGE-STAMP verdict=RECORDED/)[0], stamp: d1.stamp, state: d1.state, status: d1.status };
    L('b1 stamp: ' + out.s1.log + ' | page says "' + d1.stamp.text + '" | "' + d1.status + '"'); await toEl(pg, '#status', 60); await shot(pg, 'h2_stamped', 'Stamp: ' + d1.stamp.text);
    // ===== beat 2/3: another program changes the file; the page lists what changed
    F.f1e = editOutside(F.f1, 'day_edited1.xlsx', (s) => { put(s.BACKUP, 'B6', Math.round((B6 + 100) * 100) / 100); put(s.BACKUP, 'F2', 'checked by QS'); put(s.BACKUP, 'B9', 600); });
    out.outside1 = { cells: ['BACKUP!B6 ' + B6 + ' -> ' + Math.round((B6 + 100) * 100) / 100, 'BACKUP!F2 (a note)', 'BACKUP!B9 =SUM(B5:B8) -> 600'], by: 'a script (SheetJS in node), not a spreadsheet program', historyRowsUnchanged: J(rowsOf(readWb(F.f1))) === J(rowsOf(readWb(F.f1e))) }; L('outside edit 1 (made by a script, at record time): ' + J(out.outside1));
    await openFile(pg, F.f1e); const d2 = await dom(pg); out.p2 = { state: d2.state, status: d2.status, pending: d2.pending, marks: d2.marks, log: logOf(pg, /^§SHIST-PAGE-BIND/).pop() };
    L('b2 reopened: ' + out.p2.log + ' | page says "' + d2.status + '" | ' + J(d2.pending.map(p => p.text))); await toEl(pg, '#status', 60); await shot(pg, 'h3_pending', 'changes since the last stamp: ' + d2.pending.length + ' cells');
    await toEl(pg, '#pending', 40); await shot(pg, 'h3b_pending_list', 'the cells listed, the typed-over one flagged');
    await setName(pg, 'Ben'); await stamp(pg); const d3 = await dom(pg); F.f2 = await download(pg, '#b-download'); out.s2 = { log: logOf(pg, /^§SHIST-PAGE-STAMP verdict=RECORDED/).pop(), stamp: d3.stamp, state: d3.state }; L('b2 stamp: ' + out.s2.log + ' | page says "' + d3.stamp.text + '"');
    await toEl(pg, '#stamp-result', 80); await shot(pg, 'h4_stamp2', 'Stamp: ' + d3.stamp.text);
    await stamp(pg); const dn = await dom(pg); out.noop = { stamp: dn.stamp }; L('stamp again: ' + J(dn.stamp)); await toEl(pg, '#stamp-result', 80); await shot(pg, 'h4b_noop', 'Stamp again: ' + dn.stamp.text);
    // a third day: B6 changed again, the note cleared -> entry 3 by Aisha
    F.f2e = editOutside(F.f2, 'day_edited2.xlsx', (s) => { put(s.BACKUP, 'B6', Math.round((B6 + 101) * 100) / 100); put(s.BACKUP, 'F2', null); });
    await openFile(pg, F.f2e); await setName(pg, 'Aisha'); await stamp(pg); F.f3 = await download(pg, '#b-download'); out.s3 = { log: logOf(pg, /^§SHIST-PAGE-STAMP verdict=RECORDED/).pop() }; L('day 3 stamp: ' + out.s3.log);
    // ===== beat 4: a cell's story
    await toEl(pg, '#grid', 40); await cellStory(pg, 'B6'); const ds = await dom(pg); out.story = { cell: 'B6', head: ds.storyHead, lines: ds.story, log: logOf(pg, /^§SHIST-PAGE-STORY/).pop() }; L('b4 story B6: ' + out.story.log + ' | ' + J(ds.story.map(s => s.text)));
    await toEl(pg, '#story', 6); await shot(pg, 'h5_story', 'the story of B6: ' + ds.story.length + ' values');
    await cellStory(pg, 'B9'); const ds9 = await dom(pg); out.story9 = { lines: ds9.story }; L('story B9: ' + J(ds9.story.map(s => s.text))); await toEl(pg, '#story', 6); await shot(pg, 'h5b_story_b9', 'the story of B9: typed over a formula');
    // ===== beat 5: rewind to step 2, download that version
    await toEl(pg, '#h-sheet', 8); await goStep(pg, 2); await clickData(pg, '#tabs button', 'sheet', 'BACKUP'); const dr = await dom(pg); out.rewind = { step: 2, viewNote: dr.viewNote, B9: dr.grid.B9, F2: dr.grid.F2, B6: dr.grid.B6, marks: dr.marks, log: logOf(pg, /^§SHIST-PAGE-REWIND/).pop() };
    L('b5 rewind: ' + out.rewind.log + ' | "' + dr.viewNote + '" | B9=' + J(dr.grid.B9) + ' F2=' + J(dr.grid.F2)); await toEl(pg, '#h-sheet', 8); await shot(pg, 'h6_rewind', 'the sheet at step 2: ' + dr.viewNote);
    F.step2 = await download(pg, '#b-download-step'); const x2 = await fileFacts(F.step2), e3 = (await fileFacts(F.f3)).entries; out.rewind.file = { name: path.basename(F.step2), entries: x2.lines.length, verifyOk: x2.verify.ok, kernelOk: x2.kernel.ok, equalsAsOf2: canon(await snapOf(x2.wb)) === canon(SH.asOf(e3, 2)) };
    L('rewound file ' + J(out.rewind.file)); await goStep(pg, 'now');
    // the rewound file opens as intact at step 2
    const pr = await newPage(); await openFile(pr, F.step2); const dre = await dom(pr); out.rewind.reopen = { state: dre.state, lines: dre.lines, pending: dre.pending.length }; L('rewound file reopened: ' + J(out.rewind.reopen)); await pr.close();
    // ===== beat 6: two emailed copies merged
    const a0 = editOutside(F.f1, 'copy_a_edit.xlsx', (s) => { put(s.BACKUP, 'C5', 'paid'); put(s.BACKUP, 'B7', 11); put(s.BACKUP, 'B8', 77); }), b0 = editOutside(F.f1, 'copy_b_edit.xlsx', (s) => { put(s.BACKUP, 'C6', 'query'); put(s.BACKUP, 'B7', 22); put(s.BACKUP, 'B8', 77); });
    await openFile(pg, a0); await setName(pg, 'Aisha'); await stamp(pg); F.cA = await download(pg, '#b-download'); await openFile(pg, b0); await setName(pg, 'Ben'); await stamp(pg); F.cB = await download(pg, '#b-download');
    await openFile(pg, F.cA); await setName(pg, 'Aisha'); await toEl(pg, '#merge', 6); await shot(pg, 'h7_merge_ready', 'Aisha\'s copy open, the other copy to be opened'); await openOther(pg, F.cB); const dm = await dom(pg), c = dm.merge.conflicts[0] || { buttons: [], a: {}, b: {}, base: {} }, before = await fileFacts(await pageBytes(pg));
    out.merge = { log: logOf(pg, /^§SHIST-PAGE-MERGE verdict=CONFLICTS/).pop(), text: dm.merge.text, applied: dm.merge.applied.map(x => [x.cell, x.actor]), conflicts: dm.merge.conflicts.length, cell: c.cell, a: c.a.v, b: c.b.v, base: c.base.v, whoA: c.whoA, whoB: c.whoB, conflictText: c.text, buttons: c.buttons.map(b => b.text), noPreselect: c.buttons.every(b => !b.on), finishDisabled: dm.merge.finishDisabled, workbookUnchanged: before.lines.length === 2 && J(before.cells['BACKUP!B7']) === J([11, null]) && !before.cells['BACKUP!C6'] };
    L('b6 merge: ' + out.merge.log + ' | applied ' + J(out.merge.applied) + ' | conflict ' + c.cell + ' ' + c.a.v + ' vs ' + c.b.v + ' (' + c.whoA + ', ' + c.whoB + ') base ' + c.base.v + ' | finish disabled=' + out.merge.finishDisabled + ' | workbook unchanged=' + out.merge.workbookUnchanged);
    await toEl(pg, '#merge-status', 40); await shot(pg, 'h8_conflict', 'the conflict shown with both values and both names'); await toEl(pg, '#conflicts', 20); await shot(pg, 'h8b_conflict_buttons', 'the conflict: nothing chosen yet, Finish disabled');
    await pickSide(pg, 'a'); await sleep(300); await toEl(pg, '#conflicts', 20); await shot(pg, 'h9_picked', 'after the pick, Finish enabled'); await act(pg, () => pg.click('#b-merge')); const dd = await dom(pg); F.merged = await download(pg, '#b-download');
    const xm = await fileFacts(F.merged); out.merged = { log: logOf(pg, /^§SHIST-PAGE-MERGE verdict=RECORDED/).pop(), text: dd.merge.text, file: path.basename(F.merged), entries: xm.lines.length, verifyOk: xm.verify.ok, kernelOk: xm.kernel.ok, B7: xm.cells['BACKUP!B7'], C5: xm.cells['BACKUP!C5'], C6: xm.cells['BACKUP!C6'], state: dd.state };
    L('merged: ' + out.merged.log + ' | page says "' + dd.merge.text + '" | file ' + J({ entries: out.merged.entries, verify: out.merged.verifyOk, kernel: out.merged.kernelOk, B7: out.merged.B7, C5: out.merged.C5, C6: out.merged.C6 })); await toEl(pg, '#merge-status', 40); await shot(pg, 'h10_merged', 'the merge finished: ' + dd.merge.text);
    await toEl(pg, '#grid', 40); await cellStory(pg, 'B7'); const dsm = await dom(pg); out.mergeStory = { lines: dsm.story }; L('story B7 after the merge: ' + J(dsm.story.map(s => s.text))); await toEl(pg, '#story', 6); await shot(pg, 'h11_merge_story', 'the story of B7 names both people');
    // ===== beat 7: a history line edited by hand
    const t = tamper(F.f3, 'tampered.xlsx', '"after":{"v":600,', '"after":{"v":601,'), rows0 = rowsOf(readWb(t.file)); if (t.hits !== 1) throw new Error('the history text to edit by hand was not found once');
    await openFile(pg, t.file); const dt = await dom(pg); out.tamper = { change: 'a recorded value in entry 2: 600 became 601', status: dt.status, state: dt.state, stampDisabled: dt.stampDisabled, sheetShown: dt.sheetShown, storyShown: dt.storyShown, mergeShown: dt.mergeShown, downloadShown: dt.downloadShown, log: logOf(pg, /^§SHIST-PAGE-BIND/).pop() };
    L('b7 tamper: ' + out.tamper.log + ' | page says "' + dt.status + '" | stamp disabled=' + dt.stampDisabled + ' sheet=' + dt.sheetShown + ' story=' + dt.storyShown + ' merge=' + dt.mergeShown + ' download=' + dt.downloadShown); await toEl(pg, '#status', 60); await shot(pg, 'h12_broken', 'a history edited by hand: ' + dt.status);
    await pg.evaluate(() => { const b = document.getElementById('b-stamp'); b.disabled = false; b.click(); }); await sleep(600); const aft = await fileFacts(await pageBytes(pg)), d2t = await dom(pg);
    out.tamper.forcedStamp = { rowsUnchanged: J(rowsOf(aft.wb)) === J(rows0), lines: aft.lines.length, stateAfter: d2t.state }; L('stamp forced by hand on the broken history: ' + J(out.tamper.forcedStamp));
    // ===== every downloaded file, re-read in node
    out.files = []; for (const [k, f] of Object.entries({ stamped1: F.f1, stamped2: F.f2, stamped3: F.f3, step2: F.step2, copyA: F.cA, copyB: F.cB, merged: F.merged })) { const x = await fileFacts(f); out.files.push({ id: k, name: path.basename(f), entries: x.lines.length, verifyOk: x.verify.ok, kernelOk: x.kernel.ok, hidden: x.hidden }); }
    L('downloaded files re-read in node (engine verify and the kernel verifyJournal): ' + J(out.files));
    out.net = { requestsAtLoad: pg.__load.requests, bytesAtLoad: pg.__load.bytes, urlsAtLoad: pg.__load.urls, serverRequestsTotal: NET.requests, notGet: NET.notGet.length, external: external.length, pageReqsNonGet: pg.__reqs.filter(r => !/^GET /.test(r)).length };
    out.pageErrors = pg.__errs; const loads = NET.urls.filter(u => /history\.html$/.test(u)).length; out.net.pageLoads = loads; out.net.requestsAfterReady = NET.requests - loads * pg.__load.requests; out.net.perLoad = pg.__load.requests;
    L('NET server saw ' + NET.requests + ' requests in all = ' + loads + ' page loads x ' + pg.__load.requests + ' files (' + out.net.requestsAfterReady + ' after the pages were ready); non-GET ' + NET.notGet.length + '; external (aborted) ' + external.length + '; page errors ' + pg.__errs.length);
    await pg.close();
  } finally { await br.close(); srv.close(); }
  // derived verdicts the narration may rest on (guard.js reads them)
  const o = out; o.d = {};
  o.d.genesisCells = /entry=1 cells=(\d+)/.test(o.s1.log) ? +RegExp.$1 : null; o.d.stamp1 = o.s1.stamp.verdict === 'RECORDED' && o.d.genesisCells === o.sample.cells;
  o.d.listedExactly = J(o.p2.pending.map(p => p.cell)) === J(['BACKUP!F2', 'BACKUP!B6', 'BACKUP!B9']) && o.p2.state === 'pending'; o.d.overFlagged = o.p2.pending.filter(p => p.over).map(p => p.cell).join() === 'BACKUP!B9' && /typedOverFormula=\["BACKUP!B9"\]/.test(o.s2.log);
  o.d.noop = o.noop.stamp.verdict === 'NO-OP'; o.d.stamp2 = /entry=2 cells=3 /.test(o.s2.log) && o.s2.stamp.verdict === 'RECORDED'; o.d.storyThree = o.story.lines.length === 3 && o.story.lines.some(l => l.actor === 'Ben') && o.story.lines.every(l => l.actor && l.at);
  o.d.rewindOk = o.rewind.file.entries === 2 && o.rewind.file.verifyOk && o.rewind.file.kernelOk && o.rewind.file.equalsAsOf2 && o.rewind.reopen.state === 'intact' && o.rewind.B9.v === 600 && o.rewind.B9.f === null;
  o.d.mergeCombine = J(o.merge.applied) === J([['BACKUP!C6', 'Ben']]); o.d.oneClash = o.merge.conflicts === 1 && o.merge.a === 11 && o.merge.b === 22 && o.merge.whoA === 'Aisha' && o.merge.whoB === 'Ben' && o.merge.noPreselect && o.merge.finishDisabled && o.merge.workbookUnchanged;
  o.d.mergedOk = o.merged.entries === 3 && o.merged.verifyOk && o.merged.kernelOk && J(o.merged.B7) === J([11, null]) && !!o.merged.C5 && !!o.merged.C6 && o.mergeStory.lines.some(l => l.actor === 'Ben') && o.mergeStory.lines.some(l => l.actor === 'Aisha');
  o.d.tamperCaught = o.tamper.state === 'broken' && /entry 2 of 3/.test(o.tamper.status) && o.tamper.stampDisabled && !o.tamper.sheetShown && !o.tamper.storyShown && !o.tamper.mergeShown && !o.tamper.downloadShown && o.tamper.forcedStamp.rowsUnchanged && o.tamper.forcedStamp.lines === 3 && o.tamper.forcedStamp.stateAfter === 'broken';
  o.d.filesVerify = o.files.every(f => f.verifyOk && f.kernelOk && f.hidden === 2); o.d.noUpload = o.net.notGet === 0 && o.net.external === 0 && o.net.requestsAfterReady === 0 && o.pageErrors.length === 0;
  o.d.light = o.load.requests <= 8 && o.load.bytes <= 400000 && !/kernel|\.wasm|\.db/.test(o.load.urls.join(','));
  L('DERIVED ' + J(o.d)); fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(out, null, 1));
  const bad = Object.keys(o.d).filter(k => o.d[k] !== true && !/^genesisCells$/.test(k)); L('FACTS_VERDICT ' + (bad.length ? 'FAIL ' + bad.join(',') : 'PASS') + ' (judged: ' + Object.keys(o.d).length + ' derived facts)'); process.exit(bad.length ? 1 : 0);
})().catch(e => { _log('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
