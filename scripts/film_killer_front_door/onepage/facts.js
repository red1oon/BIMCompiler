#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps — ONE PAGE" (bim-compiler prompts/FILM_KILLER_FRONT_DOOR.md, "FILM v2 — ONE PAGE"). READ out/facts.log AFTER EVERY RUN; an exit code is not evidence.
// What this does: drives the LIVE pages (https://red1oon.github.io/bim-ootb/, headless Chrome on the CPU, --disable-gpu, DBUS unset, service worker bypassed so every request is seen): real file choosers, real double-clicks, real
// key presses, real taps, real downloads. Every `§` line the pages print is copied into facts.log; every number the film shows or says is read back from them, from the pages' own DOM, or from the downloaded files re-read in node (SheetJS,
// pdfdetach, poppler). The stand-in picture page and the 2,400-page file are MADE at run time in a temp folder (ghostscript / pdfunite from corpus files), never committed. No owner PDF is used anywhere.
// Stages (STAGES=pdf,report,books,phone; KEEP=1 merges into an existing facts.json): pdf = beats 1-5 · report = beat 6 · books = beat 7 · phone = beat 8.
// Usage: OOTB=<bim-ootb worktree at origin/main (read only: node modules, corpus, md5 reference)> env -u DBUS_SESSION_BUS_ADDRESS node facts.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const OOTB = process.env.OOTB;
if (!OOTB || !fs.existsSync(path.join(OOTB, 'pdf/edit_layer.js'))) { console.error('§FACTS_FAIL set OOTB to a bim-ootb checkout at origin/main'); process.exit(2); }
if (!global.crypto || !global.crypto.subtle) global.crypto = require('crypto').webcrypto;
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const XLSX = require(path.join(OOTB, 'erp/xlsx.mini.min.js'));
const BASE = (process.env.BASE || 'https://red1oon.github.io/bim-ootb/').replace(/\/?$/, '/'), HOST = new URL(BASE).host;
const OUT = path.join(__dirname, process.env.OUTD || 'out'), SHOTS = path.join(OUT, 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kfd4_')), STAGES = (process.env.STAGES || 'pdf,report,books,offline,phone').split(',');
const L = (m) => console.log('§FACTS ' + m), sleep = (ms) => new Promise(r => setTimeout(r, ms)), J = JSON.stringify;
const FACTS = path.join(OUT, 'facts.json'), out = fs.existsSync(FACTS) && process.env.KEEP ? JSON.parse(fs.readFileSync(FACTS, 'utf8')) : { states: {}, net: {} };
out.made = new Date().toISOString(); out.base = BASE; out.ootb = cp.spawnSync('git', ['-C', OOTB, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(); out.ootbShort = out.ootb.slice(0, 8); out.d = out.d || {};
const TB = path.join(OOTB, 'pdf/corpus/trial_balance_th.pdf'), MR = path.join(OOTB, 'pdf/corpus/market_impact_report.pdf');
const VP = { width: 1500, height: 1100, deviceScaleFactor: 2 };           // the PDF page: the whole page 1 is on screen (no scrolling: the sticky header never overlaps a clip)
const VE = { width: 1700, height: 475, deviceScaleFactor: 1920 / 1700 };  // the ERP and the filing page: drawn at 1920 wide, the lower frame
const PHONE = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
const external = [], nonGet = [];

// ---- the film-side integrity reader: the object comparison of pdf/tests/witness_edit_sheet.js (objects(), compareObjects(), raster(), rasterDiff(): the same logic, copied; an independent reader, not the engine's)
const latin1 = (b) => Buffer.from(b).toString('latin1');
function objects(b) { const s = latin1(b), re = /(?:^|[\r\n\s])(\d+) (\d+) obj\b/g; let m; const o = {}; while ((m = re.exec(s))) { const st = m.index + m[0].length - (m[1] + ' ' + m[2] + ' obj').length, e = s.indexOf('endobj', st); if (e < 0) break; o[m[1]] = s.slice(st, e + 6); re.lastIndex = e + 6; } return o; }
function compareObjects(A, B) { const a = objects(A), b = objects(B), changed = [], added = [], removed = []; Object.keys(b).forEach(n => { if (!(n in a)) added.push(n); else if (a[n] !== b[n]) changed.push(n); }); Object.keys(a).forEach(n => { if (!(n in b)) removed.push(n); }); return { a, b, changed, added, removed }; }
function raster(file, name) { const base = path.join(tmp, name); cp.spawnSync('pdftoppm', ['-r', '72', '-f', '1', '-l', '1', file, base]); const f = fs.readdirSync(tmp).filter(x => x.indexOf(name) === 0 && /\.ppm$/.test(x))[0]; if (!f) return null; const b = fs.readFileSync(path.join(tmp, f)), s = b.toString('latin1', 0, 64).split(/\s+/), w = +s[1], h = +s[2]; return { w, h, px: b.subarray(b.length - w * h * 3) }; }
function rasterDiff(A, B, boxes, pad) { if (!A || !B || A.w !== B.w || A.h !== B.h) return { same: false }; let inside = 0, outside = 0; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const i = (y * A.w + x) * 3; if (A.px[i] === B.px[i] && A.px[i + 1] === B.px[i + 1] && A.px[i + 2] === B.px[i + 2]) continue; if (boxes.some(b => x >= b[0] - pad && x <= b[2] + pad && y >= b[1] - pad && y <= b[3] + pad)) inside++; else outside++; } return { same: true, inside, outside }; }

(async () => {
  // ===== 0. the live site is the build the tree says it is (md5 of the files the film shows)
  const refFiles = ['pdf/index.html', 'pdf/edit_layer.js', 'pdf/pdf_write.js', 'pdf/pdf_open.js', 'pdf/pdf_history.js', 'pdf/report_reader.js', 'erp/sheet_addin/file_it.html'];
  const md5 = (b) => require('crypto').createHash('md5').update(b).digest('hex').slice(0, 8), live = {};
  for (const f of refFiles) { const r = cp.spawnSync('curl', ['-s', '-L', BASE + f], { maxBuffer: 1 << 27 }); live[f] = md5(r.stdout) + '/' + md5(fs.readFileSync(path.join(OOTB, f))); }
  const diff = Object.keys(live).filter(f => live[f].split('/')[0] !== live[f].split('/')[1]);
  // the deployed ERP overlay files are minified (their bytes differ from the tree by design): they are checked by the markers the film needs, and by the live witnesses (W-NINJA-PDF live)
  const rp = cp.spawnSync('curl', ['-s', '-L', BASE + 'erp/overlay/ninja/report_pill.js'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout, np = cp.spawnSync('curl', ['-s', '-L', BASE + 'erp/overlay/ninja/ninja_pdf.js'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout;
  const markers = { report_pill: /np-dl-pdf/.test(rp) && /np-sample-/.test(rp) && /NINJA-REPORT-PILL/.test(rp), ninja_pdf: /NINJA_PDF/.test(np) && /overflowNumbers/.test(np) }; if (!markers.report_pill || !markers.ninja_pdf) diff.push('erp overlay markers ' + J(markers));
  out.liveEqMain = { files: live, differ: diff, minifiedMarkers: markers };
  L('LIVE_EQ_MAIN (erp overlay files are minified on the site: markers ' + J(markers) + ') ootb=' + out.ootbShort + ' files=' + refFiles.length + ' differ=' + J(diff) + ' ' + (diff.length ? 'MISMATCH: wait for the deploy' : 'equal'));
  if (diff.length) { fs.writeFileSync(FACTS, J(out, null, 1)); process.exit(4); }

  // ===== inputs made now, in the temp folder (never committed)
  const PIC = path.join(tmp, 'report_with_picture.pdf'), LONG = path.join(tmp, 'long_report_2400_pages.pdf');
  { let hex = ''; for (let y = 0; y < 32; y++) for (let x = 0; x < 64 * 3; x++) hex += ('0' + ((x * 7 + y * 3) % 256).toString(16)).slice(-2);
    const ps = path.join(tmp, 'img.ps'); fs.writeFileSync(ps, '<< /EndPage { exch pop 0 eq { gsave 560 12 translate 96 48 scale 64 32 8 [64 0 0 -32 0 32] <' + hex + '> false 3 colorimage grestore true } { false } ifelse } >> setpagedevice\n');
    const g = cp.spawnSync('gs', ['-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-sOutputFile=' + PIC, ps, '-f', TB], { encoding: 'utf8' });
    const un = cp.spawnSync('pdfunite', Array(200).fill(MR).concat([LONG]), { encoding: 'utf8' });
    const pi = cp.spawnSync('pdfinfo', [LONG], { encoding: 'utf8' }).stdout; out.inputs = { picture: 'made by ghostscript from the corpus trial balance (a 64x32 stand-in picture added)', pictureExit: g.status, longExit: un.status, longPages: +(/Pages:\s+(\d+)/.exec(pi) || [])[1], longBytes: fs.statSync(LONG).size, longSource: 'the 12-page corpus report joined 200 times (pdfunite)' };
    L('INPUTS ' + J(out.inputs)); if (g.status !== 0 || un.status !== 0) throw new Error('inputs not made'); }

  const br = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--enable-precise-memory-info'], env: (() => { const e = Object.assign({}, process.env); delete e.DBUS_SESSION_BUS_ADDRESS; return e; })() });
  const watch = (pg, tag) => { pg.__tag = tag; pg.__log = []; pg.__errs = []; pg.__req = [];
    pg.on('console', m => { const t = m.text(); if (/^§/.test(t)) { pg.__log.push(t); console.log('  PG[' + tag + '] ' + t.slice(0, 600)); } });
    pg.on('pageerror', e => pg.__errs.push(String(e.message).slice(0, 160)));
    pg.on('request', r => { const u = r.url(); if (/^(data|blob):/.test(u) || /favicon\.ico$/.test(u)) return; pg.__req.push(r.method() + ' ' + u); if (new URL(u).host !== HOST) external.push(tag + ' ' + r.method() + ' ' + u.slice(0, 120)); if (r.method() !== 'GET') nonGet.push(tag + ' ' + r.method() + ' ' + u.slice(0, 120)); }); return pg; };
  async function newPage(rel, view, tag, ctx) {
    const pg = await (ctx || br).newPage(); await pg.setViewport(view); await pg.setBypassServiceWorker(true); watch(pg, tag);
    pg.__cdp = await pg.target().createCDPSession(); pg.__dl = path.join(tmp, 'dl_' + tag); fs.mkdirSync(pg.__dl, { recursive: true }); await pg.__cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: pg.__dl }).catch(() => {});
    if (rel) await pg.goto(BASE + rel, { waitUntil: 'load', timeout: 120000 }); return pg; }
  const logFrom = (pg, re, from) => pg.__log.slice(from || 0).filter(x => re.test(x));
  const waitLog = async (pg, re, from, ms) => { for (let t = 0; t < (ms || 20000); t += 50) { const l = logFrom(pg, re, from)[0]; if (l) return l; await sleep(50); } return null; };
  const stat = (pg) => pg.$eval('#stat', e => e.textContent);
  // ---- a shot: a clip of the page, written as a PNG, said in the log
  const rectOf = (pg, sel) => pg.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height }; }, sel);
  const bandRect = async (pg, r0, r1) => pg.evaluate((a, z) => { const pgE = document.querySelector('.pg[data-p="1"]').getBoundingClientRect(); let top = 1e9, bot = 0;
    document.querySelectorAll('.el-t[data-kind="cell"]').forEach(e => { const m = /^[A-Z]+(\d+)$/.exec(e.dataset.cell || ''); if (!m) return; const r = +m[1]; if (r < a || r > z) return; const b = e.getBoundingClientRect(); top = Math.min(top, b.top); bot = Math.max(bot, b.bottom); });
    return { x: pgE.left + scrollX, y: top - 8 + scrollY, width: pgE.width, height: bot - top + 16 }; }, r0, r1);
  // the page's canvas has ink: a phone under a slow processor can still be drawing; a shot of a blank page is never taken
  const ink = (pg) => pg.evaluate(() => { const c = document.querySelector('.pg[data-p="1"] canvas'); if (!c || !c.width) return -1; const x = c.getContext('2d'); if (!x) return -2; const d = x.getImageData(0, 0, c.width, Math.min(c.height, 400)).data; let n = 0; for (let i = 0; i < d.length; i += 4 * 17) if (d[i] < 120 && d[i + 3] > 0) n++; return n; });
  async function inkWait(pg, id) { let n = -1; for (let t = 0; t < 40000; t += 500) { n = await ink(pg); if (n > 20) break; await sleep(500); } L('ink ' + id + ' darkPixelSamples=' + n); if (!(n > 20)) throw new Error('the page canvas is blank for ' + id); return n; }
  async function shot(pg, id, note, clip, settle) {
    if (/^p\d/.test(id)) await inkWait(pg, id);
    await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await sleep(settle || 450);
    const c = clip === 'page' ? await rectOf(pg, '.pg[data-p="1"]') : clip === 'head' ? { x: 0, y: 0, width: 1500, height: 419 } : clip === 'band' ? await bandRect(pg, 5, 28) : clip === 'history' ? await pg.evaluate(() => { const h = Array.from(document.querySelectorAll('aside h3')).filter(x => x.textContent.trim() === 'History')[0], st = document.getElementById('hist-story'), a = h.getBoundingClientRect(), z = st.getBoundingClientRect(); return { x: 0, y: a.top + scrollY - 6, width: 250, height: Math.max(z.bottom, a.bottom + 40) - a.top + 12 }; }) : clip;
    const f = path.join(SHOTS, id + '.png'), phoneShot = async () => { await pg.screenshot({ path: f }); const m = cp.spawnSync('convert', [f, '-crop', Math.round(c.width * 3) + 'x' + Math.round(c.height * 3) + '+' + Math.round(c.x * 3) + '+' + Math.round(c.y * 3), '+repage', f]); if (m.status !== 0) throw new Error('crop of the phone shot failed'); };
    if (/^p\d/.test(id)) await phoneShot(); else if (c) await pg.screenshot({ path: f, clip: c }); else await pg.screenshot({ path: f });
    if (/^p\d/.test(id)) { // a phone page under a slow processor can be on screen before its canvas is presented: the picture must show dark text in the page area, else it is taken again (logged)
      const share = () => parseFloat(cp.spawnSync('convert', [f, '-crop', '1170x800+0+330', '+repage', '-colorspace', 'Gray', '-threshold', '35%', '-negate', '-format', '%[fx:mean]', 'info:'], { encoding: 'utf8' }).stdout) || 0;
      let sh = share(), tries = 0; while (sh < 0.0008 && tries < 6) { tries++; await sleep(3000); await phoneShot(); sh = share(); }
      L('darkshare ' + id + ' ' + sh.toFixed(5) + ' retakes=' + tries); if (sh < 0.0008) throw new Error('the shot ' + id + ' shows no page text'); }
    out.states[id] = { file: 'shots/' + id + '.png', note, clip: c || 'viewport' }; L('shot ' + id + ' ' + note + (c ? ' clip=' + [c.x, c.y, c.width, c.height].map(v => Math.round(v)).join(',') : '')); }
  const centre = (pg, sel) => pg.$eval(sel, e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  const cellSel = (a) => '.el-t[data-cell="' + a + '"][data-kind="cell"]';
  const marksOf = (pg) => pg.$$eval('.el-mark', a => a.map(e => ({ cell: e.dataset.cell, ok: e.dataset.ok === 'true', gap: Number(e.dataset.gap), label: e.textContent })));
  const pick = async (pg, file) => { const n = pg.__log.length, r = await Promise.all([pg.waitForFileChooser({ timeout: 30000 }), pg.click('#b-open')]); await r[0].accept([file]); return n; };
  async function typeOn(pg, sel, text) { const n = pg.__log.length; await sleep(200); const c = await centre(pg, sel); await pg.mouse.click(c.x, c.y, { clickCount: 2 }); await pg.waitForSelector('.el-ed input', { timeout: 5000 }); await pg.$eval('.el-ed input', i => i.select()); await pg.keyboard.type(text, { delay: 40 }); await pg.keyboard.press('Enter');
    await waitLog(pg, /^§EDSHEET-EDIT /, n, 15000); await waitLog(pg, /^§EDSHEET-LAYER/, n, 15000); await sleep(250); return n; }
  const bytesOf = async (pg, prop) => { const s = await pg.evaluate((p) => { const u = window.PdfPage.state[p]; if (!u) return null; let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); }, prop); return s ? new Uint8Array(Buffer.from(s, 'base64')) : null; };
  async function download(pg, sel, re) { const before = fs.readdirSync(pg.__dl); await pg.click(sel); for (let t = 0; t < 300; t++) { const f = fs.readdirSync(pg.__dl).filter(x => before.indexOf(x) < 0 && re.test(x) && !/\.crdownload$/.test(x)); if (f.length) { await sleep(300); const dst = path.join(tmp, pg.__tag + '_' + f[0]); fs.renameSync(path.join(pg.__dl, f[0]), dst); return dst; } await sleep(200); } return null; }
  const num = (re, s) => { const m = re.exec(s || ''); return m ? Number(m[1]) : null; };

  try {
    // ================= BEATS 1-5: the PDF page =================
    if (STAGES.includes('pdf')) {
      const pg = await newPage('pdf/index.html', VP, 'pdf'); await pg.waitForFunction(() => window.PdfPage && document.getElementById('b-open'), { timeout: 30000 }); await sleep(800);
      out.b1 = { statBefore: await stat(pg) }; await shot(pg, 'b1_empty', 'the PDF page before any file', 'head');
      const reqBefore = pg.__req.length, n0 = await pick(pg, TB), open = await waitLog(pg, /^§PDFED-OPEN ok=true/, n0, 30000), lay = await waitLog(pg, /^§EDSHEET-LAYER/, n0, 30000); await sleep(800);
      const rd = logFrom(pg, /^§SHEET_READER/, n0)[0]; out.b1.open = open; out.b1.layer = lay; out.b1.reader = rd; out.b1.stat = await stat(pg); out.b1.requestsAfterReady = pg.__req.slice(reqBefore); out.b1.first = logFrom(pg, /^§PDFED-FIRST/, n0)[0];
      L('b1 open: ' + open + ' | ' + rd + ' | ' + lay + ' | page says "' + out.b1.stat + '"'); await shot(pg, 'b1_open', 'the report opened: ' + out.b1.stat, 'page');
      // 2a: a number changed, the total turns red; put back, green
      const D10 = cellSel('D10'); let n = await typeOn(pg, D10, '499.09'); out.b2a = { red: { write: logFrom(pg, /^§PDF_WRITE /, n)[0], edit: logFrom(pg, /^§EDSHEET-EDIT /, n)[0], stat: await stat(pg), marks: await marksOf(pg), reader: logFrom(pg, /^§SHEET_READER/, n).pop() } };
      L('b2a red: ' + out.b2a.red.edit + ' | ' + out.b2a.red.reader + ' | marks ' + J(out.b2a.red.marks.filter(m => !m.ok))); await shot(pg, 'b2a_red', 'D10 499.09: ' + out.b2a.red.stat, 'band');
      n = await typeOn(pg, D10, '498.09'); out.b2a.green = { edit: logFrom(pg, /^§EDSHEET-EDIT /, n)[0], stat: await stat(pg), marks: await marksOf(pg), reader: logFrom(pg, /^§SHEET_READER/, n).pop() };
      L('b2a green: ' + out.b2a.green.edit + ' | ' + out.b2a.green.reader); await shot(pg, 'b2a_green', 'D10 498.09: ' + out.b2a.green.stat, 'band');
      // 2b: a word, then a letter the font lacks (red box), then Ctrl+Z
      n = await typeOn(pg, cellSel('B10'), 'Accounts Receivable'); out.b2b = { word: { edit: logFrom(pg, /^§EDSHEET-EDIT /, n)[0], stat: await stat(pg) } }; L('b2b word: ' + out.b2b.word.edit); await shot(pg, 'b2b_word', 'B10: ' + out.b2b.word.stat, 'band');
      n = await typeOn(pg, cellSel('B12'), 'Quiz Zebra'); out.b2b.font = { edit: logFrom(pg, /^§EDSHEET-EDIT /, n)[0], fontLog: logFrom(pg, /^§EDSHEET-FONT/, n)[0], stat: await stat(pg), subs: await pg.$$eval('.el-sub', a => a.map(e => e.textContent)), layer: logFrom(pg, /^§EDSHEET-LAYER/, n).pop() };
      L('b2b font: ' + out.b2b.font.fontLog + ' | subs ' + J(out.b2b.font.subs) + ' | ' + out.b2b.font.layer); await shot(pg, 'b2b_font', 'B12 Quiz Zebra: ' + out.b2b.font.stat, 'band');
      n = pg.__log.length; await pg.keyboard.down('Control'); await pg.keyboard.press('KeyZ'); await pg.keyboard.up('Control'); await waitLog(pg, /^§EDSHEET-UNDO/, n, 15000); await waitLog(pg, /^§EDSHEET-LAYER/, n, 15000); await sleep(300);
      out.b2b.undo = { log: logFrom(pg, /^§EDSHEET-UNDO/, n)[0], layer: logFrom(pg, /^§EDSHEET-LAYER/, n).pop(), stat: await stat(pg), subs: (await pg.$$('.el-sub')).length }; L('b2b undo: ' + out.b2b.undo.log + ' | ' + out.b2b.undo.layer); await shot(pg, 'b2b_undo', 'Ctrl+Z: ' + out.b2b.undo.stat, 'band');
      await pg.close();

      // ----- beat 3-5: the same report with a stand-in picture
      const p3 = await newPage('pdf/index.html', VP, 'pic'); await p3.waitForFunction(() => window.PdfPage && document.getElementById('b-open'), { timeout: 30000 }); await sleep(600);
      const PICB = new Uint8Array(fs.readFileSync(PIC)); n = await pick(p3, PIC); const lay3 = await waitLog(p3, /^§EDSHEET-LAYER/, n, 30000); await waitLog(p3, /^§PDFED-OPEN ok=true/, n, 30000); await sleep(800); out.b3 = { layer: lay3, stat: await stat(p3) };
      L('b3 open: ' + lay3); await shot(p3, 'b3_open', 'the report with a stand-in picture: ' + out.b3.stat, 'page');
      const imgSel = '.el-t[data-kind="image"]'; n = p3.__log.length; const ic = await centre(p3, imgSel); await p3.mouse.click(ic.x, ic.y); const lk = await waitLog(p3, /^§EDSHEET-LOCKED/, n, 5000); out.b3.locked = { log: lk, stat: await stat(p3) }; L('b3 tap on the picture: ' + lk + ' | page says "' + out.b3.locked.stat + '"'); await shot(p3, 'b3_locked', out.b3.locked.stat, 'page');
      n = await typeOn(p3, cellSel('B10'), 'Accounts Receivable'); out.b3.edit = { log: logFrom(p3, /^§EDSHEET-EDIT /, n)[0], stat: await stat(p3) }; L('b3 edit: ' + out.b3.edit.log); await shot(p3, 'b3_edit', 'B10 Accounts Receivable on the picture page: ' + out.b3.edit.stat, 'page');
      const edited = await bytesOf(p3, 'bytes'), fE = path.join(tmp, 'pic_edited.pdf'); fs.writeFileSync(fE, edited);
      n = p3.__log.length; const dlPdf = await download(p3, '#b-pdf', /\.pdf$/); const dl = logFrom(p3, /^§PDFWR-DOWNLOAD/, n)[0], ex = logFrom(p3, /^§EDSHEET-EXPORT/, n)[0];
      const C = compareObjects(PICB, new Uint8Array(fs.readFileSync(dlPdf))), imgs = Object.keys(C.a).filter(k => /\/Subtype\s*\/Image/.test(C.a[k])), imgSame = imgs.every(k => C.a[k] === C.b[k]);
      const boxes = await p3.evaluate(() => window.PdfPage.state.undo.map(u => { const c = u.change; let b1 = c.box[1], b3 = c.box[3]; if (b3 - b1 < 2) { const base = (b1 + b3) / 2; b1 = base - c.size; b3 = base + 0.35 * c.size; } return [Math.min(c.x0Before, c.x0After), b1, Math.max(c.x1Before, c.x1After), b3]; }));
      const contentNums = Object.keys(C.a).filter(n => /\/Type\s*\/Page\b/.test(C.a[n])).map(n => (/\/Contents\s+(\d+)\s+0\s+R/.exec(C.a[n]) || [])[1]).filter(Boolean);
      const kinds = C.changed.map(n => n + ':' + (/\/Type\s*\/Catalog/.test(C.b[n]) ? 'catalog' : contentNums.indexOf(n) >= 0 ? 'page-content' : 'other'));
      const rD = rasterDiff(raster(PIC, 'o'), raster(fE, 'e'), boxes, 2), total = Object.keys(C.a).length, identical = total - C.changed.length - C.removed.length;
      const det = cp.spawnSync('pdfdetach', ['-list', dlPdf], { encoding: 'utf8' }).stdout;
      out.b3.h3 = { objectsInOriginal: total, identical, changed: C.changed, changedKinds: kinds, added: C.added, removed: C.removed, imageObjects: imgs.length, imageBytesIdentical: imgSame, rasterInside: rD.inside, rasterOutside: rD.outside, download: dl, export: ex, attachments: det.trim().split('\n').slice(1) };
      L('§FILM_H3 objects=' + total + ' identical=' + identical + ' changed=' + kinds.join(',') + ' added=' + C.added.join(',') + ' removed=' + C.removed.length + ' imageObjects=' + imgs.length + ' imageBytesIdentical=' + imgSame + ' rasterInside=' + rD.inside + ' rasterOutside=' + rD.outside + ' | ' + dl + ' | pdfdetach: ' + J(out.b3.h3.attachments));
      out.b3.dlStat = await stat(p3); await shot(p3, 'b3_dl', 'Download PDF: ' + out.b3.dlStat, 'head');
      // beat 4: the spreadsheet file
      n = p3.__log.length; const xl = await download(p3, '#b-xlsx', /\.xlsx$/); const xlsxLog = logFrom(p3, /^§PDFED-XLSX/, n)[0], hx = logFrom(p3, /^§PDFHIST-XLSX/, n)[0];
      const wb = XLSX.read(fs.readFileSync(xl), { type: 'buffer' }), ws = wb.Sheets.Report, sums = Object.keys(ws).filter(k => k[0] !== '!' && /^SUM\(/.test(ws[k].f || '')).map(k => k + '=' + ws[k].f);
      out.b4 = { xlsxLog, histLog: hx, file: path.basename(xl), sheets: wb.SheetNames, hidden: (wb.Workbook && wb.Workbook.Sheets || []).map(s => s.Hidden), sums, cells: Object.keys(ws).filter(k => k[0] !== '!').length, doorText: wb.SheetNames.indexOf('_door_text') >= 0, stat: await stat(p3), pdfHistoryEntries: num(/historyEntries=(\d+)/, dl), pdfAttachment: /_door_history\.jsonl/.test(det) };
      L('b4 xlsx: ' + xlsxLog + ' | ' + hx + ' | sheets ' + J(wb.SheetNames) + ' hidden ' + J(out.b4.hidden) + ' | ' + sums.join(' ; ') + ' | _door_text present=' + out.b4.doorText); await shot(p3, 'b4_xlsx', 'Download .xlsx: ' + out.b4.stat, 'head');
      // beat 4 (continued): the spreadsheet file the page gave is opened again on Sheet history (the guide's "open it again on the next page"): its history is read from inside it
      const hp = await newPage('erp/sheet_addin/history.html', VE, 'history'); await hp.waitForFunction(() => !!(window.HistoryPage && window.HistoryPage.state && window.HistoryPage.state.cost), { timeout: 90000 }); await sleep(600);
      await shot(hp, 'h0_page', 'the Sheet history page before any file'); const nh = hp.__log.length, hr = await Promise.all([hp.waitForFileChooser({ timeout: 30000 }), hp.click('label[for=file]')]); await hr[0].accept([xl]);
      await waitLog(hp, /^§SHIST-PAGE-BIND/, nh, 60000); await sleep(1200);
      out.b4.hist = { bind: logFrom(hp, /^§SHIST-PAGE-BIND/, nh).pop(), open: logFrom(hp, /^§SHIST-PAGE-OPEN/, nh)[0], status: await hp.$eval('#status', e => e.textContent), state: await hp.$eval('#status', e => e.dataset.state), opened: await hp.$eval('#opened', e => e.textContent) };
      L('b4 on Sheet history: ' + out.b4.hist.open + ' | ' + out.b4.hist.bind + ' | page says "' + out.b4.hist.status + '" state=' + out.b4.hist.state); await shot(hp, 'h1_xlsx', 'the .xlsx opened on Sheet history: ' + out.b4.hist.status); out.histErrors = hp.__errs; await hp.close();
      // beat 5: the cell's story, typed for real into the History box
      await p3.click('#hist-cell', { clickCount: 3 }); await p3.keyboard.press('Backspace'); n = p3.__log.length; await p3.keyboard.type('b10', { delay: 90 }); await p3.keyboard.press('Enter'); await waitLog(p3, /^§PDFHIST-STORY/, n, 8000); await sleep(400);
      out.b5 = { log: logFrom(p3, /^§PDFHIST-STORY/, n)[0], story: await p3.$eval('#hist-story', e => e.innerText), say: await p3.$eval('#hist-say', e => e.textContent) }; L('b5 story: ' + out.b5.log); await shot(p3, 'b5_story', 'the story of B10', 'history');
      out.net.pdfPages = { requestsAfterReady: [].concat(out.b1.requestsAfterReady) }; out.pdfErrors = [].concat(p3.__errs); await p3.close();
    }

    // ================= BEAT 6: a report printed by the ERP, opened on the one page =================
    if (STAGES.includes('report')) {
      const pe = await newPage(null, { width: 1700, height: 900, deviceScaleFactor: 1.5 }, 'erpreport'); await pe.goto(BASE + 'erp/idempiere.html?login=GardenAdmin', { waitUntil: 'networkidle2', timeout: 180000 });
      await pe.waitForFunction(() => !!(window.NinjaPill && window.NinjaPill.__report && window.__idmpDb), { timeout: 90000 }); await sleep(1500);
      await pe.waitForSelector('#pill-ninja', { timeout: 60000 });
      await pe.evaluate(() => { const dock = document.getElementById('idmp-pill'), trig = document.querySelector('#idmp-pill-trigger,[data-pill-trigger]'); if (dock && trig && getComputedStyle(dock).display === 'none') trig.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); document.getElementById('pill-ninja').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); });
      await pe.waitForSelector('#np-sample-tb', { timeout: 20000 }); await sleep(500); const modalRect = () => pe.evaluate(() => { let e = document.getElementById('np-out'); while (e && e.parentElement) { const b = e.getBoundingClientRect(); if (b.width >= 600 && b.width <= 1300 && b.height > 400) return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height }; e = e.parentElement; } return null; });
      const flowRect = () => pe.evaluate(() => { const r = document.getElementById('np-run').closest('div[style*="border-left"]'), b = r.getBoundingClientRect(); return { x: b.left + scrollX - 14, y: b.top + scrollY - 10, width: b.width + 28, height: b.height + 20 }; });
      const panelRect = async () => { const m = await modalRect(); return m ? { x: m.x, y: m.y, width: m.width, height: Math.min(m.height, 390) } : null; };
      await shot(pe, 'b6_pill', 'the Excel Report pill', await panelRect());
      await pe.evaluate(() => { document.getElementById('np-out').innerHTML = ''; document.getElementById('np-sample-tb').click(); });
      await pe.waitForFunction(() => { const o = document.getElementById('np-out'); return o && o.textContent.indexOf('Report template') >= 0 && document.getElementById('np-run'); }, { timeout: 60000 });
      await pe.evaluate(() => { document.getElementById('np-from').value = '2003-01-01'; document.getElementById('np-to').value = '2003-12-31'; }); const n = pe.__log.length;
      await pe.evaluate(() => document.getElementById('np-run').click()); await pe.waitForSelector('#np-rep-sum', { timeout: 90000 }); await sleep(600);
      out.b6 = { runLog: logFrom(pe, /^§NINJA_REPORT_RUN/, n)[0], doneLog: logFrom(pe, /^§NINJA_REPORT_DONE/, n)[0], ready: await pe.$eval('#np-rep-sum', e => e.textContent) }; L('b6 run: ' + out.b6.runLog + ' | ' + out.b6.doneLog + ' | page says "' + out.b6.ready + '"');
      const nP = pe.__log.length; const pdfFile = await download(pe, '#np-dl-pdf', /\.pdf$/); await waitLog(pe, /^§NINJA_REPORT_PDF/, nP, 60000); out.b6.pdfLog = logFrom(pe, /^§NINJA_REPORT_PDF/, nP)[0]; out.b6.pdfFile = pdfFile && path.basename(pdfFile); L('b6 pdf: ' + out.b6.pdfLog + ' | ' + out.b6.pdfFile);
      await shot(pe, 'b6_report', 'the report ready and its PDF made: ' + out.b6.ready, await flowRect()); if (!pdfFile) throw new Error('the ERP report PDF was not downloaded');
      const pr = await newPage('pdf/index.html', VP, 'report'); await pr.waitForFunction(() => window.PdfPage && document.getElementById('b-open'), { timeout: 30000 }); await sleep(600);
      let m = await pick(pr, pdfFile), o6 = await waitLog(pr, /^§PDFED-OPEN ok=true/, m, 30000); await waitLog(pr, /^§EDSHEET-LAYER/, m, 30000); await sleep(800);
      out.b6.open = { open: o6, reader: logFrom(pr, /^§SHEET_READER/, m)[0], layer: logFrom(pr, /^§EDSHEET-LAYER/, m)[0], stat: await stat(pr) }; L('b6 open on the one page: ' + out.b6.open.open + ' | ' + out.b6.open.reader + ' | ' + out.b6.open.layer); await shot(pr, 'b6_open', 'the ERP report opened on the one page: ' + out.b6.open.stat, 'page');
      // the cell: the first plain number of columns C-F from row 6 (as the witness N3 picks it), +1.00
      const cell = await pr.evaluate(() => { const R = window.PdfPage.state.layer.R, k = Object.keys(R.sheet).filter(a => R.sheet[a].t === 'n' && /^[C-F](\d+)$/.test(a) && Number(a.slice(1)) >= 6 && /^\d{1,3}(,\d{3})*\.\d\d$/.test(R.sheet[a].text))[0]; return k ? { a: k, text: R.sheet[k].text, v: R.sheet[k].v } : null; });
      if (!cell) throw new Error('no number cell found on the ERP report'); const neu = ((Math.round(cell.v * 100) + 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      m = await typeOn(pr, cellSel(cell.a), neu); out.b6.edit = { cell: cell.a, old: cell.text, neu, log: logFrom(pr, /^§EDSHEET-EDIT /, m)[0], reader: logFrom(pr, /^§SHEET_READER/, m).pop(), stat: await stat(pr), marks: await marksOf(pr) };
      L('b6 edit: ' + out.b6.edit.log + ' | ' + out.b6.edit.reader); await shot(pr, 'b6_red', cell.a + ' ' + neu + ': ' + out.b6.edit.stat, 'page');
      m = pr.__log.length; await pr.keyboard.down('Control'); await pr.keyboard.press('KeyZ'); await pr.keyboard.up('Control'); await waitLog(pr, /^§EDSHEET-UNDO/, m, 15000); await waitLog(pr, /^§EDSHEET-LAYER/, m, 15000); await sleep(300);
      out.b6.undo = { log: logFrom(pr, /^§EDSHEET-UNDO/, m)[0], reader: logFrom(pr, /^§SHEET_READER/, m).pop(), stat: await stat(pr) }; L('b6 undo: ' + out.b6.undo.log + ' | ' + out.b6.undo.reader); await shot(pr, 'b6_undo', 'Ctrl+Z: ' + out.b6.undo.stat, 'page');
      out.net.erpReportPageErrors = [].concat(pe.__errs, pr.__errs); await pr.close(); await pe.close();
    }

    // ================= BEAT 7: file it, the books, the ERP window =================
    if (STAGES.includes('books')) {
      const fi = await newPage('erp/sheet_addin/file_it.html', VE, 'books'); const t0 = Date.now(); await fi.waitForFunction('window.FileItPage&&window.FileItPage.runner.ready()', { timeout: 240000 }); const readyMs = Date.now() - t0; await sleep(600);
      out.fileit = { readyMs, engine: await fi.$eval('#engine', e => e.textContent) }; L('file_it ready after ' + readyMs + ' ms | page says "' + out.fileit.engine + '"'); await shot(fi, 'f0_ready', 'the filing page: ' + out.fileit.engine);
      const nS = fi.__log.length; const sampleFile = await download(fi, '#b-sample', /\.xlsx$/); await fi.waitForFunction(() => window.FileItPage.state.name === 'sample_invoice.xlsx' && !!window.FileItPage.state.wb, { timeout: 30000 }); await sleep(600);
      out.sample = { file: sampleFile && path.basename(sampleFile), opened: await fi.$eval('#opened', e => e.textContent) }; L('sample invoice: ' + J(out.sample)); await shot(fi, 'f1_sample', 'Get a sample invoice: ' + out.sample.opened);
      await fi.click('#b-file'); await fi.waitForFunction('(function(){var s=window.FileItPage.state;return !s.busy&&s.verdict!==null})()', { timeout: 240000 }); await sleep(800);
      out.filed = await fi.evaluate(() => ({ verdict: window.FileItPage.state.verdict, text: document.getElementById('verdict').textContent }));
      const scrollTo = async (sel) => { await fi.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), sel); await sleep(350); };
      L('filed: ' + J(out.filed)); if (out.filed.verdict !== 'FILED') throw new Error('not filed: ' + out.filed.text); await scrollTo('#h-verdict'); await shot(fi, 'f2_filed', 'File it: ' + out.filed.text);
      out.doc = await fi.evaluate(() => { const d = {}; document.querySelectorAll('#doc-head dd').forEach(e => { d[e.dataset.k] = e.textContent; }); return { head: d, lines: Array.from(document.querySelectorAll('#doc-lines tbody tr')).map(tr => Array.from(tr.children).map(td => td.textContent)) }; });
      out.books = await fi.evaluate(() => ({ rows: Array.from(document.querySelectorAll('#books-rows tbody tr')).map(tr => Array.from(tr.children).map(td => td.textContent)), ledger: document.getElementById('ledger').textContent }));
      const tot = out.books.rows.filter(r => r[2] === 'Total')[0] || [], entries = out.books.rows.filter(r => r[2] !== 'Total'); out.books.entries = entries.length; out.books.debit = tot[3]; out.books.credit = tot[4]; L('doc ' + J(out.doc.head) + ' lines=' + out.doc.lines.length + ' | books: ' + entries.length + ' entries, debit ' + tot[3] + ' credit ' + tot[4]);
      const filedDocNo = out.doc.head.Number, grand = out.doc.head['Grand total'];
      await scrollTo('#h-verdict'); out.link = await fi.$eval('#b-erp', e => e.getAttribute('href')); L('link ' + out.link);
      await Promise.all([fi.waitForNavigation({ waitUntil: 'load', timeout: 180000 }), fi.click('#b-erp')]);
      const boot = await waitLog(fi, /^§IDEMPIERE boot db=/, 0, 240000); const hh = fi.__log.filter(l => /^§DOOR-HANDOVER /.test(l))[0]; out.erpBoot = boot; out.handover = hh; L('ERP page: ' + boot + ' | ' + hh);
      await fi.waitForFunction(() => document.getElementById('idmp-login') && document.getElementById('idmp-login').style.display === 'flex', { timeout: 180000 }); await sleep(800);
      const pickU = (l, n) => fi.evaluate((l, n) => { const e = Array.prototype.filter.call(document.querySelectorAll(l + ' .idmp-login-user'), x => { const m = x.querySelector('.nm'); return m && m.textContent.trim() === n; })[0]; if (e) e.click(); return !!e; }, l, n);
      await pickU('#idmp-login-clients', 'GardenWorld'); await sleep(400); await fi.waitForFunction("document.querySelectorAll('#idmp-login-users .idmp-login-user').length>0", { timeout: 30000 });
      if (!(await pickU('#idmp-login-users', 'GardenAdmin'))) throw new Error('GardenAdmin is not on the login card'); await fi.waitForFunction("(function(){var e=document.getElementById('idmp-login-step2');return e&&e.style.display!=='none'})()", { timeout: 30000 });
      await fi.click('#idmp-login-ok'); await fi.waitForFunction("(function(){var t=document.getElementById('idmp-tree');return t&&t.children.length>0})()", { timeout: 90000 }); await sleep(3500);
      const snap = () => fi.evaluate(() => ({ status: document.getElementById('idmp-status-main').textContent, tabs: Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).map(e => e.textContent.trim()), rows: Array.from(document.querySelectorAll('tr[data-ad-record]')).map(tr => ({ table: tr.getAttribute('data-ad-table'), id: tr.getAttribute('data-ad-record'), cells: Array.from(tr.querySelectorAll('td[data-ad-col]')).reduce((o, td) => { o[td.getAttribute('data-ad-col')] = td.textContent.trim(); return o; }, {}) })) }));
      const e0 = await snap(); out.erp = { status: e0.status, tabs: e0.tabs }; L('ERP window: ' + e0.status + ' | tabs ' + e0.tabs.join(',')); await shot(fi, 'e1_invoice_form', 'the invoice in the ERP window (form)');
      await fi.click('#idmp-toolbar [data-tb="toggle"]'); await sleep(1500); const e1 = await snap(); out.erp.grid = e1.rows.map(r => ({ id: r.id, table: r.table, doc: r.cells.DocumentNo })); L('ERP grid rows ' + J(out.erp.grid)); await shot(fi, 'e2_invoice_grid', 'the Invoice window as a grid: ' + e1.rows.length + ' row');
      if (e1.rows.length !== 1 || e1.rows[0].cells.DocumentNo !== filedDocNo) throw new Error('the Invoice window does not list the filed invoice once: ' + J(out.erp.grid));
      await fi.evaluate(() => { Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).filter(x => x.textContent.trim() === 'Invoice Line')[0].click(); }); await sleep(2500); let e2 = await snap(); if (!e2.rows.length) { await fi.click('#idmp-toolbar [data-tb="toggle"]'); await sleep(1500); e2 = await snap(); }
      out.erp.lines = e2.rows.map(r => ({ id: r.id, line: r.cells.Line, product: r.cells.M_Product_ID, qty: r.cells.QtyInvoiced, price: r.cells.PriceActual, net: r.cells.LineNetAmt })); L('ERP Invoice Line rows ' + J(out.erp.lines)); await shot(fi, 'e3_invoice_lines', 'the Invoice Line tab: ' + e2.rows.length + ' rows');
      await fi.evaluate(() => { Array.from(document.querySelectorAll('#idmp-tabstrip .idmp-adtab')).filter(x => x.textContent.trim() === 'Invoice')[0].click(); }); await sleep(1500);
      const n9 = fi.__log.length, had = await fi.evaluate(() => { const b = document.querySelector('.idmp-posted-btn'); if (b) b.click(); return b ? b.textContent.trim() : null; }); await sleep(1800);
      const pv = await fi.evaluate(() => ({ lines: Array.from(document.querySelectorAll('#posted-overlay .posted-line')).map(l => { const g = c => { const e = l.querySelector(c); return e ? e.textContent.trim() : null; }; return [g('.posted-acct'), g('.posted-dr'), g('.posted-cr')]; }), text: (document.getElementById('posted-overlay') || {}).textContent || '' })), pf = logFrom(fi, /^§POSTED-FACTS/, n9)[0];
      out.posted = { button: had, lines: pv.lines, log: pf, note: (/Accounting schema[^\n]*?posted\)/.exec(pv.text) || [''])[0], balanced: /Balanced/.test(pv.text) }; L('Posted view: ' + J(pv.lines) + ' | ' + out.posted.note + ' | ' + pf); await shot(fi, 'e4_posted', 'the Posted view');
      if (pv.lines.length !== 3 || !/balanced=true/.test(pf || '')) throw new Error('the posted view is not the 3 balanced rows of one schema: ' + J(pv.lines));
      await fi.evaluate(() => { const x = document.querySelector('#posted-overlay .posted-ov-x'); if (x) x.click(); }); await sleep(500);
      await fi.click('#idmp-search', { clickCount: 3 }); await fi.keyboard.type('Trial Balance', { delay: 70 }); await sleep(1200);
      await fi.evaluate(() => { const l = Array.from(document.querySelectorAll('#idmp-tree .idmp-row.leaf')).filter(e => /Trial Balance/.test(e.textContent))[0]; if (l) l.click(); }); await sleep(4000);
      const sels = await fi.$$('select'); let schemaSel = null; for (const h of sels) { const o = await h.evaluate(e => Array.from(e.options).map(x => x.textContent)); if (o.some(x => /GardenWorld US\/A/.test(x))) schemaSel = h; }
      await schemaSel.select(await schemaSel.evaluate(e => Array.from(e.options).filter(o => /GardenWorld US\/A/.test(o.textContent))[0].value)); const di = await fi.$$('input[type=date]'); await di[di.length - 1].click();
      const date = out.doc.head.Date, dm = /(\d{4})-(\d{2})-(\d{2})/.exec(date); await fi.keyboard.type(dm[2] + dm[3] + dm[1], { delay: 60 }); await sleep(300); await shot(fi, 'e5_tb_params', 'the Trial Balance report: schema and date chosen');
      await fi.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).filter(x => x.textContent.trim() === 'Run' && x.offsetParent)[0]; b.click(); }); await sleep(8000);
      const rep = await fi.evaluate(() => { const rows = Array.from(document.querySelectorAll('table')).map(t => Array.from(t.querySelectorAll('tr')).map(tr => Array.from(tr.children).map(td => td.textContent.trim()))).filter(t => t.some(r => r[0] === '12110'))[0] || []; return { rows, foot: (document.body.innerText.match(/Total Dr[^\n]*/) || [''])[0] }; });
      const r12 = rep.rows.filter(r => r[0] === '12110')[0]; out.report = { rows: rep.rows.length, r12110: r12, foot: rep.foot, date };
      const q = (sql, p) => fi.evaluate((s, p) => { const st = window.__idmpDb.prepare(s); st.bind(p); const o = []; while (st.step()) o.push(st.getAsObject()); st.free(); return o; }, sql, p || []);
      const acct = (await q("SELECT c_elementvalue_id AS id FROM c_elementvalue WHERE value='12110' AND ad_client_id IN (0,11)"))[0], recId = Number(out.erp.grid[0].id);
      const base1 = "SELECT ROUND(SUM(amtacctdr),2) AS dr FROM fact_acct WHERE account_id=? AND c_acctschema_id=101 AND dateacct<=?";
      const sum = async (excl) => (await q(excl ? base1 + " AND NOT (ad_table_id=318 AND record_id=?)" : base1, excl ? [acct.id, date + ' 23:59:59', recId] : [acct.id, date + ' 23:59:59']))[0].dr;
      const withInv = await sum(false), without = await sum(true), thisInv = Math.round((withInv - without) * 100) / 100; out.report.sql = { account: '12110', debitWithInvoice: withInv, debitWithoutInvoice: without, thisInvoice: thisInv };
      L('report: 12110 row ' + J(r12) + ' | ' + rep.foot + ' | from the entries: debit with the invoice ' + withInv + ', without it ' + without + ', this invoice ' + thisInv);
      await fi.evaluate(() => { const t = Array.from(document.querySelectorAll('table')).filter(t => Array.from(t.querySelectorAll('tr')).some(r => r.firstElementChild && r.firstElementChild.textContent.trim() === '12110'))[0]; const tr = Array.from(t.querySelectorAll('tr')).filter(r => r.firstElementChild.textContent.trim() === '12110')[0]; tr.scrollIntoView({ block: 'center' }); }); await sleep(500); await shot(fi, 'e6_tb_report', 'the Trial Balance report, row 12110');
      out.report.honest = !!r12 && Number(r12[2].replace(/,/g, '')) === withInv && thisInv === parseFloat(String(grand).replace(/,/g, '')) && /balanced=true/.test(rep.foot); L('report honest=' + out.report.honest);
      out.books.filedDocNo = filedDocNo; out.books.grand = grand; out.erpErrors = fi.__errs; await fi.close();
    }

    // ================= the owner's steer: light, fast, works with the network switched off (the PDF page ONLY) =================
    if (STAGES.includes('offline')) {
      // first visit: a fresh browser context, an empty cache, what the page costs when it is usable (the method of the mobile witness: the sum of the encoded bytes of every finished request)
      const ctx = await br.createBrowserContext(), p1 = await ctx.newPage(); await p1.setViewport(VP); watch(p1, 'offline');
      const c1 = await p1.target().createCDPSession(); await c1.send('Network.enable'); let bytes = 0, nreq = 0; c1.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength || 0; nreq++; });
      const t0 = Date.now(); await p1.goto(BASE + 'pdf/index.html', { waitUntil: 'load', timeout: 120000 }); await p1.waitForFunction(() => document.getElementById('b-open') && !document.getElementById('b-open').disabled, { timeout: 60000 });
      const msUsable = Date.now() - t0, bytesUsable = bytes, nUsable = nreq; await p1.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller === null ? navigator.serviceWorker.ready.then(() => true) : true, { timeout: 30000 }).catch(() => {});
      const swReady = await p1.evaluate(() => navigator.serviceWorker ? navigator.serviceWorker.ready.then(r => !!(r && r.active)) : false).catch(() => false); await waitLog(p1, /^§PDFED-OFFLINE ready=true/, 0, 30000); await sleep(4000);
      out.light = { bytesAtUsable: bytesUsable, requestsAtUsable: nUsable, msToUsable: msUsable, bytesAfterSettle: bytes, serviceWorkerActive: swReady, line: logFrom(p1, /^§PDFED-OFFLINE/, 0)[0], note: 'fresh context, empty cache, desktop size, no throttling; encoded bytes of every finished request' };
      L('§FILM_FIRSTVISIT bytes=' + bytesUsable + ' requests=' + nUsable + ' msToUsable=' + msUsable + ' bytesAfterPrecache=' + bytes + ' serviceWorkerActive=' + swReady + ' | ' + out.light.line);
      // the network switched off: reload, open a corpus PDF, make one edit
      let reqs = 0, failed = 0; p1.on('request', () => { reqs++; }); p1.on('requestfailed', () => { failed++; }); await p1.setOfflineMode(true);
      let reloadOk = false, openOk = false, editOk = false, why = '';
      try { await p1.reload({ waitUntil: 'load', timeout: 60000 }); await p1.waitForFunction(() => window.PdfPage && document.getElementById('b-open') && !document.getElementById('b-open').disabled, { timeout: 30000 }); reloadOk = true; } catch (e) { why += 'reload: ' + String(e.message).slice(0, 100) + '; '; }
      if (reloadOk) { try { const n = await pick(p1, TB); await waitLog(p1, /^§PDFED-OPEN ok=true/, n, 30000); await waitLog(p1, /^§EDSHEET-LAYER/, n, 30000); await sleep(800); openOk = true;
        const m = await typeOn(p1, cellSel('D10'), '499.09'); editOk = /ok=true old="498\.09" new="499\.09"/.test(logFrom(p1, /^§EDSHEET-EDIT /, m)[0] || ''); out.offlineEdit = { edit: logFrom(p1, /^§EDSHEET-EDIT /, m)[0], write: logFrom(p1, /^§PDF_WRITE /, m)[0], stat: await stat(p1) }; } catch (e) { why += 'open/edit: ' + String(e.message).slice(0, 100) + '; '; } }
      out.offline = { reloadOk, openOk, editOk, requestsWhileOffline: reqs, failedWhileOffline: failed, why }; await p1.setOfflineMode(false);
      L('§FILM_OFFLINE reloadOk=' + reloadOk + ' openOk=' + openOk + ' editOk=' + editOk + ' requestsWhileOffline=' + reqs + ' failedWhileOffline=' + failed + (why ? ' why="' + why + '"' : '')); await p1.close(); await ctx.close();
    }

    // ================= BEAT 8: the phone (emulated) =================
    if (STAGES.includes('phone')) {
      const phoneCtx = async () => { const ctx = await br.createBrowserContext(), p = await ctx.newPage(); await p.setViewport(PHONE); await p.setUserAgent(UA); await p.setBypassServiceWorker(true); watch(p, 'phone'); const c = await p.target().createCDPSession(); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 }); p.__ctx = ctx; return { p, c }; };
      const A = await phoneCtx(), pa = A.p, t0 = Date.now(); await pa.goto(BASE + 'pdf/index.html', { waitUntil: 'load', timeout: 120000 }); await pa.waitForFunction(() => document.getElementById('b-open') && !document.getElementById('b-open').disabled, { timeout: 60000 });
      out.phone = { viewport: '390x844, device scale 3, touch, processor 4 times slower (an emulated phone, headless)', msToUsable: Date.now() - t0 };
      let n = await pick(pa, TB); await waitLog(pa, /^§EDSHEET-LAYER/, n, 60000); await waitLog(pa, /^§PDFED-OPEN ok=true/, n, 60000); await sleep(1500); await pa.evaluate(() => window.scrollTo(0, 0)); await shot(pa, 'p0_trial', 'on an emulated phone: the report opened', { x: 0, y: 0, width: 390, height: 389 }, 4000);
      const tc = await pa.$eval(cellSel('D10'), e => { e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }); await sleep(300); n = pa.__log.length;
      const tc2 = await centre(pa, cellSel('D10')); await pa.touchscreen.tap(tc2.x, tc2.y); await pa.waitForSelector('.el-ed input', { timeout: 8000 }); await pa.$eval('.el-ed input', i => i.select()); await pa.keyboard.type('499.09', { delay: 60 }); await pa.keyboard.press('Enter');
      await waitLog(pa, /^§EDSHEET-EDIT /, n, 30000); await waitLog(pa, /^§EDSHEET-LAYER/, n, 30000); await sleep(600);
      out.phone.tap = { editor: logFrom(pa, /^§EDSHEET-EDITOR/, n)[0], edit: logFrom(pa, /^§EDSHEET-EDIT /, n)[0], stat: await stat(pa), docWidth: await pa.evaluate(() => document.documentElement.scrollWidth) }; L('phone tap edit: ' + out.phone.tap.editor + ' | ' + out.phone.tap.edit + ' | docWidth=' + out.phone.tap.docWidth);
      await pa.evaluate(() => window.scrollTo(0, 0)); await sleep(300); await shot(pa, 'p1_trial', 'on an emulated phone: ' + out.phone.tap.stat, { x: 0, y: 0, width: 390, height: 389 }, 4000); await pa.close(); await A.p.__ctx.close();
      // the long file, five times, each after waiting (up to 2 min) for the machine to be quiet (each in a fresh phone context, each logged); the film uses the MEDIAN, and says so; the machine's load average is logged beside each run (another session may share this CPU)
      const runs = []; let lastShotDone = false;
      const quiet = async (why) => { const t0 = Date.now(); while (os.loadavg()[0] > 6 && Date.now() - t0 < 120000) await sleep(5000); L('quiet? ' + why + ' loadavg1=' + os.loadavg()[0].toFixed(2) + ' waitedMs=' + (Date.now() - t0) + ' cpus=' + os.cpus().length); };
      for (let k = 0; k < (+process.env.PHONE_RUNS || 5); k++) {
        if (!process.env.NO_QUIET) await quiet('before long-file run ' + (k + 1)); const B = await phoneCtx(), pb = B.p; await pb.goto(BASE + 'pdf/index.html', { waitUntil: 'load', timeout: 120000 }); await pb.waitForFunction(() => document.getElementById('b-open') && !document.getElementById('b-open').disabled, { timeout: 60000 });
        n = pb.__log.length; const r = await Promise.all([pb.waitForFileChooser({ timeout: 10000 }), pb.click('#b-open')]); const ta = Date.now(); await r[0].accept([LONG]); let firstPaint = null;
        for (let t = 0; t < 120000 && firstPaint == null; t += 50) { if (await pb.$('.pg[data-p="1"][data-drawn="1"]').catch(() => null)) firstPaint = Date.now() - ta; else await sleep(50); }
        const opened = await waitLog(pb, /^§PDFED-OPEN /, n, 240000); const first = logFrom(pb, /^§PDFED-FIRST/, n)[0], canv = await pb.$$eval('.pg canvas', a => a.length); await sleep(1500);
        const run = { run: k + 1, firstPagePaintedMs: firstPaint, firstLog: first, openLog: opened && opened.replace(/file="[^"]*"/, ''), canvasesAlive: canv, stat: await stat(pb), loadavg1: Number(os.loadavg()[0].toFixed(2)), cpus: os.cpus().length }; runs.push(run);
        L('phone long file run ' + (k + 1) + ': firstPagePaintedMs=' + firstPaint + ' | ' + first + ' | ' + run.openLog + ' | canvases=' + canv + ' | loadavg1=' + run.loadavg1 + ' cpus=' + run.cpus);
        if (k === (+process.env.PHONE_RUNS || 5) - 1) { await pb.evaluate(() => window.scrollTo(0, 0)); await shot(pb, 'p2_long', 'a long file on an emulated phone: ' + run.stat, { x: 0, y: 0, width: 390, height: 389 }, 4000); }
        out.net.phoneNonGet = nonGet.filter(x => /^phone/.test(x)); await pb.close(); await B.p.__ctx.close(); }
      const ms = runs.map(x => x.firstPagePaintedMs).sort((x, y) => x - y), med = ms[Math.floor(ms.length / 2)], mrun = runs.filter(x => x.firstPagePaintedMs === med)[0];
      out.phone.long = { file: 'a file made for the film: the corpus report joined 200 times', pages: out.inputs.longPages, bytes: out.inputs.longBytes, runs, runsMs: ms, firstPagePaintedMs: med, medianOf: runs.length, firstLog: mrun.firstLog, openLog: mrun.openLog, canvasesAlive: Math.max.apply(null, runs.map(x => x.canvasesAlive)), stat: mrun.stat };
      L('phone long file: runs ms=' + J(ms) + ' median=' + med + ' ms (pages=' + out.inputs.longPages + ')');
    }
  } finally { await br.close(); }

  // ===== derived verdicts the narration may rest on (guard.js reads them; each says what it is)
  const d = out.d;
  if (out.b1) { d.cells = num(/ cells=(\d+)/, out.b1.reader); d.addsUp = /verdict=ADDS_UP/.test(out.b1.reader); d.cellTargets = num(/cellTargets=(\d+)/, out.b1.layer); d.lockedRuns = num(/lockedRuns=(\d+)/, out.b1.layer);
    d.writableRuns = num(/writableRuns=(\d+)/, out.b1.layer); const mine = (a) => a.filter(x => /^(pdf|pic) /.test(x)); out.net.pdfNonGet = mine(nonGet); out.net.pdfExternal = mine(external); out.net.otherExternal = external.filter(x => !/^(pdf|pic) /.test(x)); d.noUpload = mine(nonGet).length === 0 && mine(external).length === 0 && out.pdfErrors.length === 0;
    const r = out.b2a.red, g = out.b2a.green, d28 = r.marks.filter(m => m.cell === 'D28')[0]; d.gap = d28 && !d28.ok ? d28.gap : null; d.redTotal = !!d28 && !d28.ok && /gap 1\.00/.test(d28.label); d.greenAgain = g.marks.length >= 4 && g.marks.every(m => m.ok) && /adds up/.test(g.stat);
    d.wordEdited = /ok=true old="Accounts Receivable - Trade" new="Accounts Receivable"/.test(out.b2b.word.edit); d.fontBox = /from=LiberationSans to=Helvetica standard=true/.test(out.b2b.font.fontLog) && out.b2b.font.subs.length === 1 && /font not same: LiberationSans . Helvetica/.test(out.b2b.font.subs[0]) && /redBoxes=1/.test(out.b2b.font.layer);
    d.undoClears = /text="Product asset"/.test(out.b2b.undo.log) && out.b2b.undo.subs === 0 && /redBoxes=0/.test(out.b2b.undo.layer);
    const h = out.b3.h3; d.pictureLocked = /lock=image/.test(out.b3.locked.log) && /^Locked: a picture/.test(out.b3.locked.stat); d.objectsInOriginal = h.objectsInOriginal; d.objectsIdentical = h.identical; d.objectsChanged = h.changed.length; d.changedAreCatalogAndPage = J(h.changedKinds.map(x => x.split(':')[1]).sort()) === J(['catalog', 'page-content']); d.objectsAdded = h.added.length; d.imageSame = h.imageObjects >= 1 && h.imageBytesIdentical; d.rasterOutside = h.rasterOutside; d.rasterInside = h.rasterInside;
    d.integrity = d.imageSame && h.rasterOutside === 0 && h.rasterInside > 0 && h.removed.length === 0 && h.identical === h.objectsInOriginal - h.changed.length;
    d.sumFormulas = out.b4.sums.length; d.noDoorText = !out.b4.doorText; d.historyInBoth = out.b4.pdfAttachment && /entries=\d+/.test(out.b4.histLog || '') && num(/entries=(\d+)/, out.b4.histLog) === out.b4.pdfHistoryEntries && out.b4.sheets.indexOf('_door_history') >= 0; d.historyEntries = out.b4.pdfHistoryEntries; d.xlsxCells = num(/cells=(\d+)/, out.b4.xlsxLog);
    d.historyOnSheetPage = out.b4.hist.state === 'intact' && num(/entries=(\d+)/, out.b4.hist.bind) === out.b4.pdfHistoryEntries && /pending=0/.test(out.b4.hist.bind || ''); d.storyValues = num(/values=(\d+)/, out.b5.log); d.storyOk = d.storyValues === 2 && /report-reader/.test(out.b5.story) && /you/.test(out.b5.story); }
  if (out.b6) { d.erpReportReady = /Report ready/.test(out.b6.ready) && /errors=0/.test(out.b6.doneLog || ''); d.erpPdfOnePage = /pages=1 /.test(out.b6.pdfLog || '') && /overflowNumbers=0/.test(out.b6.pdfLog) && /missingGlyphs=0/.test(out.b6.pdfLog); d.erpReadBack = num(/ cells=(\d+)/, out.b6.open.reader); d.erpAddsUp = /verdict=ADDS_UP/.test(out.b6.open.reader);
    d.erpEditNames = /verdict=DOES_NOT_ADD_UP/.test(out.b6.edit.reader) && /ok=true/.test(out.b6.edit.log); d.erpUndoAdds = /verdict=ADDS_UP/.test(out.b6.undo.reader); d.erpReportCells = d.erpReadBack; }
  if (out.doc) { d.filed = out.filed.verdict === 'FILED'; d.entriesBalanced = out.books.debit === out.books.credit && out.books.entries === 6; d.erpOnce = out.erp.grid.length === 1 && out.erp.grid[0].doc === out.books.filedDocNo; d.handover = /applied=1 skipped=0 refused=0/.test(out.handover || ''); d.postedBalanced = out.posted.balanced && /balanced=true/.test(out.posted.log);
    d.invoiceDollars = Math.floor(parseFloat(String(out.books.grand).replace(/,/g, ''))); d.invoiceCents = Math.round((parseFloat(String(out.books.grand).replace(/,/g, '')) - d.invoiceDollars) * 100); d.reportHonest = out.report.honest; out.report.thisInvoice = out.report.sql.thisInvoice; }
  if (out.light) { d.firstVisitBytes = out.light.bytesAtUsable; d.firstVisitMs = out.light.msToUsable; }
  if (out.b1 && out.b1.first) { d.pageOneMs = num(/ ms=(\d+)/, out.b1.first); d.rewriteMs = num(/ ms=(\d+)/, out.b2a.red.write); }
  if (out.offline) d.offlineOk = out.offline.reloadOk === true && out.offline.openOk === true && out.offline.editOk === true && out.offline.failedWhileOffline === 0 && out.light.serviceWorkerActive === true;
  if (out.phone) { d.phoneTapOk = /ok=true/.test(out.phone.tap.edit) && out.phone.tap.docWidth <= 390; d.longPages = out.phone.long.pages; d.longFirstMs = out.phone.long.firstPagePaintedMs; d.longCanvases = out.phone.long.canvasesAlive; d.longOk = /ok=true/.test(out.phone.long.openLog || '') && out.phone.long.firstPagePaintedMs > 0 && out.phone.long.canvasesAlive <= 6; }
  L('DERIVED ' + J(d)); fs.writeFileSync(FACTS, JSON.stringify(out, null, 1));
  const bad = Object.keys(d).filter(k => d[k] === false || d[k] === null || d[k] === undefined); L('FACTS_VERDICT ' + (bad.length ? 'FAIL ' + bad.join(',') : 'PASS') + ' (judged: ' + Object.keys(d).length + ' derived facts)'); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log('§FACTS_FAIL ' + (e && e.stack || e)); process.exit(1); });
