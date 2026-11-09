// ⚠ DO NOT REMOVE — Scope guard
// Scope: §BIMDOC-FILM-PRODUCTION (prompts/FILM_NARRATION.md) — RECORD "From a drawing to an invoice: the BIM Document" on the REAL ERP page, public fixture only
//   (a synthetic "Duplex Sheet Set" project on the GardenWorld seed + a synthetic one-line DXF; no private set), headless Chromium, CPU ONLY (--disable-gpu), CDP screencast 1920x1080 -> constant 24 fps.
//   Steps, selectors and SQL oracles are the ones of bim-ootb erp/tests/witness_bimdoc_live.js (W-BIMDOC, 27 arms); that file is NOT edited here.
//   THE ISSUE this proves or disproves: can the ten §BIMDOC-FILM beats be filmed end-to-end, human pace, with every spoken number a §ERP_FILM_FACT read from the page's own § line
//   or the witness's hand-count oracle, and the kernel's ten evidence lines present IN ORDER in the page log? A beat whose line is absent is CUT (§ERP_FILM_CUT), never faked.
// §-log first — READ <out>/erp_film.log (beats + facts + verdict) and <out>/erp_film.page.log (page console) before any conclusion. Exit code is not evidence.
// Run:  OOTB=<read-only bim-ootb tree at origin/main> node scripts/film_bimdoc.js <outDir>      (env BEAT_MIN='{"b1":22.5,...}' = spoken length per beat, measured by the fitter; STOP_AFTER=<beat> to stop early)
//   -> <outDir>/bimdoc_silent.mp4 + erp_film.log + erp_film.page.log. Never takes the GPU lock; never touches the shared bim-ootb checkout.
'use strict';
const HOME = require('os').homedir();
const { chromium } = require(process.env.PW || (HOME + '/bim-ootb/tests/node_modules/playwright'));
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');

const REPO = process.env.OOTB || (HOME + '/bim-ootb');
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const LOG = [], PAGELOG = [];
const say = (s) => { LOG.push(s); console.log(s); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.zip': 'application/zip', '.sql': 'text/plain', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  fs.readFile(path.join(REPO, p), (e, buf) => {
    if (e) { res.writeHead(404); res.end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': buf.length }); res.end(buf);
  });
});
const MIN = JSON.parse(process.env.BEAT_MIN || '{}');        // spoken length of each beat (+ breath), measured by the fitter first: the film is cut to the narration
const STOP_AFTER = process.env.STOP_AFTER || ''; const STOP = { stop: true }; const START_AT = process.env.START_AT || ''; let FF = !!START_AT;   // START_AT=<beat>: the beats before it run fast and unrecorded (to reach the state) - a development aid, never used for the film itself const STOP = { stop: true };
// the public fixture (identical to the witness): a synthetic one-line DXF, hand counts written here independent of the module under test
const DXF = Buffer.from('0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nWALLS\n10\n0.0\n20\n0.0\n11\n9.0\n21\n0.0\n0\nENDSEC\n0\nEOF\n');
const PHASES = ['Concept', 'Construction Drawings'], TASKS = [['Plans', 0], ['Sections', 0], ['Details', 1]];
const DOCS = { 'A-101/1': ['A-101', 1, 'Duplex ground floor plan', 'ARC', 'DXF', 8, 'Plans'], 'A-102/1': ['A-102', 1, 'Duplex first floor plan', 'ARC', 'DXF', 6, 'Plans'], 'A-103/1': ['A-103', 1, 'Duplex roof plan', 'ARC', 'DXF', 10, 'Plans'],
  'A-201/1': ['A-201', 1, 'Duplex section AA', 'STR', 'IFC', 12, 'Sections'], 'A-201/2': ['A-201', 2, 'Duplex section AA (revised)', 'STR', 'IFC', 14, 'Sections'] };
const HAND = { plans: { total: 3, issued: 1, pct: 33.3, budget: 24, earned: 8 }, concept: { total: 4, issued: 2, pct: 50, budget: 38, earned: 22 }, hours: { lines: 3, total: 7 }, order: { qty: 8, price: 50, amount: 400 }, chain: { before: 2, after: 3 } };

// visible cursor + click ripple (headless has no pointer of its own)
const CURSOR = `(() => { const go = () => { if (document.getElementById('__fc')) return;
  const c = document.createElement('div'); c.id = '__fc';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;' +
    'background:url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><path d=%22M3 2 L3 18 L7.5 14 L10.5 20.5 L13 19.4 L10.1 13 L16 13 Z%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221.4%22/></svg>") no-repeat;transition:none';
  document.documentElement.appendChild(c);
  const at = (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; };
  addEventListener('mousemove', at, true);
  addEventListener('mousedown', (e) => { at(e); const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ffb400;border-radius:50%;width:10px;height:10px;' +
      'left:' + (e.clientX - 5) + 'px;top:' + (e.clientY - 5) + 'px;transition:all .45s ease-out;opacity:1';
    document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 600); }, true); };
  if (document.documentElement) go(); else addEventListener('DOMContentLoaded', go); })();`;

const CARD_CSS = '#__fc{display:none}html,body{margin:0;width:1920px;height:1080px;background:#0b0f17;color:#F3EEE8;font-family:"DejaVu Sans",sans-serif}' +
  '.w{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.k{color:#FF6B78;font-size:34px;letter-spacing:2px;margin-bottom:26px}' +
  '.t{font-size:96px;font-weight:700;text-align:center;line-height:1.15}.t b{color:#FF6B78}.p{font-size:40px;color:#c9c4bd;margin-top:34px;text-align:center}' +
  '.row{display:flex;align-items:center;gap:0;margin-top:30px}.bx{width:330px;height:210px;border:4px solid #7dd3fc;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:46px;font-weight:700;color:#7dd3fc}' +
  '.bx small{font-size:28px;font-weight:400;color:#c9c4bd;margin-top:10px}.ar{width:100px;text-align:center;font-size:72px;color:#FF6B78}.fn{position:absolute;bottom:260px;width:100%;text-align:center;font-size:30px;color:#8b95a5}' +
  '.pp{font-size:42px;color:#e6e1da;max-width:1500px;text-align:center;line-height:1.45;margin-top:30px}.pp b{color:#7dd3fc;font-weight:700}' +
  '.src{position:absolute;bottom:70px;left:120px;right:120px;text-align:center;font-size:24px;color:#8b95a5;line-height:1.5}';
const CARD_IDEA = '<style>' + CARD_CSS + '</style><div class="w"><div class="k">THE CHAIN, END TO END</div><div class="row">' +
  '<div class="bx">Sheet<small>the drawing file</small></div><div class="ar">&rarr;</div><div class="bx">BIM Document<small>a row in the register</small></div><div class="ar">&rarr;</div>' +
  '<div class="bx">Project task<small>hours and progress</small></div><div class="ar">&rarr;</div><div class="bx">Invoice<small>amounts</small></div></div>' +
  '</div>';
// v3 (owner 2026-11-09): the opening chapter card and the closing card. Every claim here is sourced in FILM_NARRATION.md §BIMDOC-FILM-V3 (prior art + what is built).
const CARD_CH = '<style>' + CARD_CSS + '</style><div class="w"><div class="k">CHAPTER</div><div class="t">BIM Integration to <b>ERP</b></div>' +
  '<div class="pp">In an earlier film, any set of BIM model elements was pushed to the ERP as a <b>Project Order</b>.<br>Now the project\'s back-office documentation is wired in too,<br>as a new BIM data record set: the <b>BIM Document</b>.</div></div>';
const CARD_END = '<style>' + CARD_CSS + '</style><div class="w"><div class="k">ALREADY IN THE SAME KERNEL</div><div class="t">One kernel. <b>One signed log.</b></div>' +
  '<div class="pp">The 4D schedule in our BIM already reads the <b>Project Order</b> back: planned against committed cost, phase by phase, as you scrub time.<br>' +
  'To our knowledge, the first to run BIM and ERP together in <b>one browser kernel</b>: every write applied locally and signed on one op-log, with no app or database server.</div>' +
  '<div class="src">Closest prior art: RIB iTWO 4.0 / MTWO (BIM 5D + ERP on cloud servers) · MI ERP BIM for Odoo 19 (IFC elements as ERP records, on an Odoo server) · INTELSYS.build (SAP S/4HANA + Autodesk).<br>' +
  'This film: a test server with public example data (a synthetic Duplex sheet set). The 4D variance is shown on the Hospital showcase project.</div></div>';

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp/idempiere.html', ORIGIN = 'http://localhost:' + server.address().port;
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--disable-gpu-compositing'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3, acceptDownloads: true });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage(); page.setDefaultTimeout(20000);
  const APPLOG = [];
  page.on('console', m => PAGELOG.push(m.text())); page.on('pageerror', e => PAGELOG.push('PAGEERR ' + e)); page.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.accept().catch(() => {}); });
  ctx.on('page', p => { if (p === page) return; p.on('console', m => { APPLOG.push(m.text()); PAGELOG.push('[app] ' + m.text()); }); p.on('pageerror', e => { APPLOG.push('PAGEERR ' + e); PAGELOG.push('[app] PAGEERR ' + e); }); });
  const mark = () => PAGELOG.length;
  const since = (n, re) => PAGELOG.slice(n).filter(l => re.test(l));
  const lastLine = (n, re) => since(n, re).pop() || '';
  const kv = (line, k) => { const m = new RegExp('(?:^|\\s)' + k + '=(\\S+)').exec(line || ''); return m ? m[1] : null; };
  const fact = (k, v) => say('§ERP_FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 400));
  const rd = (sql) => page.evaluate(s => window.__tipRead.rows(s), sql);
  const dq = (sql) => page.evaluate(s => { const r = window.__idmpDb.exec(s); return r.length ? r[0].values : []; }, sql);
  const snap = () => page.evaluate(() => window.IdmpGridTab.snapshot());

  // ── recording: clips of timestamped CDP screencast frames, in named segments (before / after / main), assembled in screenplay order at the end ──
  const clips = []; let cur = null, active = null; const segAcc = { before: 0, after: 0, main: 0 };
  const newSession = async (pg) => {
    const cdp = await ctx.newCDPSession(pg); const o = { pg, cdp };
    cdp.on('Page.screencastFrame', async f => {
      if (cur && active === o) { const fn = path.join(FR, String(clips.reduce((a, c) => a + c.frames.length, 0) + cur.frames.length).padStart(6, '0') + '.jpg');
        fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); cur.frames.push({ fn, ts: f.metadata.timestamp }); }
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    return o;
  };
  const mainSess = await newSession(page); active = mainSess;
  const startCast = (o) => o.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const stopCast = (o) => o.cdp.send('Page.stopScreencast').catch(() => {});
  async function recOn(seg) {
    if (cur || FF) return; cur = { seg, frames: [], t0: Date.now() / 1000 };
    await startCast(active); await sleep(120); await active.pg.mouse.move(0, 0).catch(() => {});   // a nudge so the first frame is emitted at once
    for (let i = 0; i < 40 && !cur.frames.length; i++) { await sleep(100); if (i === 10) await active.pg.evaluate(() => window.scrollBy(0, 0)).catch(() => {}); }
    if (!cur.frames.length) say('§ERP_FILM_WARN no first frame after resume (' + seg + ')');
  }
  async function recOff() { if (!cur) return; await stopCast(active); await sleep(80); cur.stop = Date.now() / 1000; segAcc[cur.seg] += cur.stop - cur.t0; clips.push(cur); cur = null; }
  async function off(fn) { const seg = cur && cur.seg; await recOff(); try { return await fn(); } finally { if (seg) await recOn(seg); } }   // work done off camera (a reload, a fixture row); the clip resumes
  const segNow = (seg) => segAcc[seg] + (cur && cur.seg === seg ? Date.now() / 1000 - cur.t0 : 0);
  async function switchTo(o) { if (!cur) { active = o; return; } await stopCast(active); active = o; await startCast(o); await sleep(150); }
  const HK = Number(process.env.HOLD_K || 0.65);   // visual-hold scale: a hold is a pause to be seen, never a wait for the page (those are explicit waits)
  const hold = (ms) => (FF ? Promise.resolve() : sleep(ms * HK));

  // beats: the beat's start is logged in-segment; the previous beat is held until its dialogue has room (the film is cut to the narration)
  let prev = null, lensMax = 0; const BEATS = [];
  const beat = async (id, seg, note) => {
    if (FF && id === START_AT) { FF = false; await recOn(seg); }
    if (prev && prev.seg === seg && MIN[prev.id]) { const wait = MIN[prev.id] - (segNow(seg) - prev.t); if (wait > 0) { say('§ERP_FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await sleep(wait * 1000); } }
    prev = { id, seg, t: segNow(seg) }; BEATS.push(prev); say('§ERP_FILM_BEAT id=' + id + ' seg=' + seg + ' t=' + prev.t.toFixed(2) + ' ' + (note || ''));
    if (!FF) { const nl = await page.evaluate(() => document.querySelectorAll('[data-lens-action]').length).catch(() => 0); lensMax = Math.max(lensMax, nl); if (nl) say('§ERP_FILM_LENS beat=' + id + ' lensButtons=' + nl); }
  };
  const endBeat = async () => { if (prev && MIN[prev.id]) { const wait = MIN[prev.id] - (segNow(prev.seg) - prev.t); if (wait > 0) { say('§ERP_FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await sleep(wait * 1000); } } };
  const cut = (id, why) => say('§ERP_FILM_CUT ' + id + ' ' + why);

  // ── human-paced input ──
  let clicks = 0, cursorOk = 0;
  async function glide(sel, steps) {
    const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: FF ? 1 : (steps || 18) }); await hold(220);
  }
  async function hclick(sel) {
    const T0 = Date.now(); await glide(sel); const T1 = Date.now();
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; });
    const b = await page.locator(sel).first().boundingBox();
    clicks++; if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++;
    await page.mouse.down(); await hold(70); await page.mouse.up(); await hold(450);
    if (process.env.TRACE) say('§ERP_FILM_TIMING click ' + sel.slice(0, 50) + ' glide=' + (T1 - T0) + 'ms total=' + (Date.now() - T0) + 'ms');
  }
  // typing goes through the field's own events (value + change + input), as the witness sets it; a letter-by-letter display at ~12 chars/s
  async function htype(sel, text) {
    await glide(sel); await page.mouse.down(); await hold(70); await page.mouse.up(); await hold(200);
    await page.locator(sel).first().fill(''); await page.keyboard.type(String(text), { delay: FF ? 0 : 55 });
    await page.locator(sel).first().dispatchEvent('change'); await hold(300);
  }
  async function hselect(sel, val) { await glide(sel); await page.mouse.down(); await hold(70); await page.mouse.up(); await hold(300); await page.selectOption(sel, String(val)); await page.locator(sel).first().dispatchEvent('change').catch(() => {}); await hold(500); }
  const F = (col, tag) => '#idmp-inline-mount ' + (tag || 'input') + '[data-col="' + col + '"]';
  const setv = (col, v) => page.evaluate(([c, v]) => { const e = document.querySelector('#idmp-inline-mount select[data-col="' + c + '"], #idmp-inline-mount input[data-col="' + c + '"]'); if (!e) return 'nofield';
    e.value = String(v); if (e.tagName !== 'SELECT') { e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); } return e.value; }, [col, v]);

  // ── the witness's helpers (boot / selectRow / createDoc / act), unrecorded unless wrapped by the screenplay ──
  async function boot(suffix) {
    for (let g = 0; g < 3; g++) { try { await page.goto('about:blank'); await page.goto(base + '?login=GardenAdmin' + (suffix || ''), { waitUntil: 'load' }); break; } catch (e) { if (g === 2) throw e; await sleep(1500); } }
    await page.waitForFunction(() => window.__idmpDb && window.PluginEngine && window.PluginEngine._reg && (() => { const R = window.PluginEngine._reg(); const x = R && R.get('org.kernel.bim-document'); return x && x.state === 'ACTIVE'; })(), null, { timeout: 60000 });
    if (suffix && /window=/.test(suffix)) await page.waitForFunction(() => document.querySelector('#idmp-toolbar button[data-tb="new"]') && window.IdmpGridTab, null, { timeout: 40000 });
    await sleep(1500);
  }
  async function selectRow(id) {                       // the witness's way: grid view, then the row indicator, until the snapshot names the record
    for (let k = 0; k < 2; k++) { if (await page.$('tr[data-ad-record="' + id + '"]')) break; await page.click('#idmp-toolbar button[data-tb="toggle"]').catch(() => {}); await sleep(900); }
    await page.evaluate(i => { const tr = document.querySelector('tr[data-ad-record="' + i + '"]'); const c = tr && tr.querySelector('.idmp-rowind'); if (c) c.click(); }, id); await sleep(900);
    for (let k = 0; k < 3; k++) { const has = await page.$('.idmp-docfsm, #idmp-inline-mount .cfrow'); if (has && String((await snap()).currentKey) === String(id)) break;
      await page.evaluate(i => { const tr = document.querySelector('tr[data-ad-record="' + i + '"]'); const c = tr && tr.querySelector('.idmp-rowind'); if (c) c.click(); }, id); await sleep(1200); }
    return (await snap()).currentKey;
  }
  const tabNames = () => page.evaluate(() => [...document.querySelectorAll('#idmp-tabstrip .idmp-adtab')].map(x => x.textContent.trim()));
  const tabSel = (name) => '#idmp-tabstrip .idmp-adtab:text-is("' + name + '")';
  const tabClickQ = async (name) => { await page.evaluate(n => { const t = [...document.querySelectorAll('#idmp-tabstrip .idmp-adtab')].find(x => x.textContent.trim() === n); if (t) t.click(); }, name); await sleep(1500); };
  const mkOp = (t, f) => ({ key: t, table: t, verb: 'create', op_type: 'CRUD_CREATE', op_uuid: null, cas: null, fields: f, stdDefaults: null });
  const commitOps = (ops) => page.evaluate(o => new Promise(res => { const A = window.APP || {}, std = { actor: A.actor, clientId: A.clientId, orgId: A.orgId || 0 }; o.forEach(x => { if (x.stdDefaults === null) x.stdDefaults = std; }); window.__crud.applyOpGroup(o, r => res(r)); }), ops);
  const ID = {}; let PRJ = null; const PH = {}, TK = {}; let W_ID = 0, T_ID = 0; const PROJ_WIN = 130;
  async function createDocForm(key, viaWindow) {         // the user's path through the BIM Document window form (setv = the witness's way of setting a field)
    const [no, rev, title, disc, kind, hours, task] = DOCS[key], n0 = mark();
    if (viaWindow !== false) { await boot('&window=' + W_ID); await page.click('#idmp-toolbar button[data-tb="new"]'); await sleep(2200); }
    for (const [c, v] of [['c_project_id', PRJ], ['c_projectphase_id', TK[task].ph], ['c_projecttask_id', TK[task].id], ['deliverableno', no], ['revision', rev], ['name', title], ['discipline', disc], ['filekind', kind], ['hoursbudget', hours]]) { await setv(c, v); await sleep(250); }
    await sleep(500); await page.click('#idmp-toolbar button[data-tb="save"]');
    for (let i = 0; i < 40 && !since(n0, /^§CRUD-GROUP-PERSIST|^§CRUD persist|committed key=bim_document/).length; i++) await sleep(250); await sleep(1200);
    const r = (await rd("SELECT bim_document_id FROM bim_document WHERE deliverableno='" + no + "' AND revision=" + rev))[0];
    ID[key] = r ? r.bim_document_id : null; return ID[key];
  }
  const barActs = () => page.evaluate(() => [...document.querySelectorAll('.idmp-docfsm [data-doc-action]')].map(b => b.getAttribute('data-doc-action')));
  const chip = () => page.evaluate(() => (document.querySelector('.idmp-docfsm .chip') || {}).textContent || null);
  const status = async (key) => ((await rd("SELECT docstatus, reversal_id, processed FROM bim_document WHERE bim_document_id=" + ID[key]))[0]) || null;
  async function openDocQ(key) { await boot('&window=' + W_ID); await selectRow(ID[key]); await sleep(800); }
  async function actQ(key, a) {                          // unrecorded document action (setup only)
    await openDocQ(key); const n0 = mark(); const bar = await barActs(); if (bar.indexOf(a) < 0) return { ok: false, bar };
    await page.click('.idmp-docfsm [data-doc-action="' + a + '"]');
    for (let i = 0; i < 60 && !since(n0, /^§CRUD process committed key=bim_document|REFUSED by the model|PROCESS BIM/).length; i++) await sleep(250); await sleep(1200); return { ok: true };
  }
  async function toTask(phaseName, taskName) {           // Project -> Phase -> Task, silently (reload + programmatic row picks)
    await boot('&window=' + PROJ_WIN); await selectRow(PRJ); await tabClickQ('Phase'); await selectRow(PH[phaseName]); await tabClickQ('Task'); await selectRow(TK[taskName].id);
  }
  // the same walk ON CAMERA: glide to each tab and row, click like a user. A row is picked by its indicator cell; the snapshot must name it (else the programmatic pick is the fallback)
  async function ensureGridQ() { if (!(await page.$('tr[data-ad-record]'))) { const sn = await snap(); if (sn && sn.rows && sn.rows.length) { await page.click('#idmp-toolbar button[data-tb="toggle"]').catch(() => {}); await sleep(900); } } }
  async function ensureGrid() { if (!(await page.$('.idmp-grid tbody tr[data-ad-record], .idmp-grid tr[data-ad-record]'))) { const sn = await snap(); if (sn && sn.rows && sn.rows.length) { await hclick('#idmp-toolbar button[data-tb="toggle"]'); await hold(700); } } }
  async function pickRow(id) {
    const rowSel = 'tr[data-ad-record="' + id + '"] .idmp-rowind';
    if (!(await page.$(rowSel))) { await hclick('#idmp-toolbar button[data-tb="toggle"]'); await hold(700); }
    if (await page.$(rowSel)) await hclick(rowSel);
    if (String((await snap()).currentKey) !== String(id)) { say('§ERP_FILM_NOTE pickRow ' + id + ' needed the programmatic pick'); await selectRow(id); }
  }
  const NEXT = '#idmp-toolbar button[title="Next record"]';
  async function ensureForm() { if (!(await page.$('.idmp-docfsm, #idmp-inline-mount .cfrow'))) { await hclick('#idmp-toolbar button[data-tb="toggle"]'); await page.waitForSelector('#idmp-inline-mount .cfrow, .idmp-docfsm', { timeout: 8000 }).catch(() => {}); await hold(700); } }
  async function formOf(id) { await pickRow(id); await ensureForm(); }   // the record's form (the BIM Document grid has no displayed columns in the dictionary, so the register is read through the form)
  async function walkTo(phaseName, taskName, tab, toLevel) {   // from the Project window with the project selected: Phase tab -> phase -> Task tab -> task -> (tab)
    await hclick(tabSel('Phase')); await hold(600); await pickRow(PH[phaseName]);
    if (toLevel === 'phase') return;
    await hclick(tabSel('Task')); await hold(600); await pickRow(TK[taskName].id);
    if (tab) { await hclick(tabSel(tab)); await hold(900); }
  }
  // v2 (ERP_IDEMPIERE_UX_PARITY.md §BIMDOC-ADPASS): progress and hours are COMPUTED COLUMNS of the Task/Phase grids; each grid load logs §AD-VIRTUAL tab= table= col= rows= values=[key:value,...]
  const virtLine = (n0, table, col) => lastLine(n0, new RegExp('^§AD-VIRTUAL tab=\\d+ table=' + table + ' col=' + col + ' rows='));
  const virtOf = (line, key) => { const m = / values=\[(.*)\]$/.exec(line || ''); if (!m) return null; const hit = m[1].split(',').map(kv => [kv.slice(0, kv.lastIndexOf(':')), kv.slice(kv.lastIndexOf(':') + 1)]).find(x => x[0] === String(key)); return hit ? hit[1] : null; };
  // bring a grid column on screen (glide to its header: the grid scrolls it in) and record that it is inside the viewport (numbers, not a look)
  async function showCol(col, tag) {
    const sel = '#idmp-content table thead th[data-ad-col="' + col + '"]';
    if (!(await page.$(sel))) { fact(tag + '.col.' + col, 'ABSENT'); return false; }
    await glide(sel); await hold(900);
    const r = await page.locator(sel).first().boundingBox(), vw = 1440, vh = 810, inside = !!(r && r.x >= 0 && r.x + r.width <= vw && r.y >= 0 && r.y + r.height <= vh);
    fact(tag + '.col.' + col, inside ? 'VISIBLE x=' + Math.round(r.x) + ' w=' + Math.round(r.width) : 'OUTSIDE ' + JSON.stringify(r)); return inside;
  }
  async function toGrid() { if (!(await page.$('#idmp-content table thead th[data-ad-col]'))) { await hclick('#idmp-toolbar button[data-tb="toggle"]'); await hold(900); } }
  // the record's gear (ProcessButtonPopup): open it, click one process by its Button column; returns the popup the process opens, if any
  async function gearRun(comp, popupMs) {
    await hclick('#idmp-toolbar [data-tb="process"]'); await page.waitForSelector('#idmp-proc-ov [data-tbb="' + comp + '"]', { timeout: 10000 }); await hold(900);
    await glide('#idmp-proc-ov [data-tbb="' + comp + '"]'); clicks++;
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; }), b = await page.locator('#idmp-proc-ov [data-tbb="' + comp + '"]').first().boundingBox();
    if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++;
    const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: popupMs || 30000 }).catch(() => null), (async () => { await page.mouse.down(); await hold(70); await page.mouse.up(); })()]);
    return popup;
  }
  const closeProcDlg = async () => { for (let i = 0; i < 40 && !(await page.$('#idmp-procdlg .idmp-procresult')); i++) await sleep(250); const m = await page.evaluate(() => { const r = document.querySelector('#idmp-procdlg .idmp-procresult .msg'); return r ? r.textContent : null; }); if (await page.$('[data-procdlg-ok]')) await hclick('[data-procdlg-ok]'); return m; };
  const ct = (n) => (n == null ? 'null' : String(n));

  try {
    // ════════ SETUP (off camera): the public fixture — a project with its own stages, no deliverables yet ════════
    await boot();
    T_ID = Number((await dq("SELECT AD_Table_ID FROM AD_Table WHERE TableName='BIM_Document' AND IsActive='Y'"))[0]?.[0] || 0);
    W_ID = Number((await dq("SELECT AD_Window_ID FROM AD_Table WHERE AD_Table_ID=" + T_ID))[0]?.[0] || 0);
    say('§ERP_FILM_SETUP table=' + T_ID + ' window=' + W_ID + ' fixture=public(synthetic Duplex Sheet Set on the GardenWorld seed) renderer=software(--disable-gpu)');
    if (!T_ID) throw new Error('BIM_Document not in the dictionary: the plugin did not start');
    const BILL = { c_bpartner_id: 117, c_bpartner_location_id: 112, m_warehouse_id: 103, m_pricelist_version_id: 104, c_currency_id: 100 };
    await commitOps([mkOp('c_project', Object.assign({ value: 'DUPLEX-SHEETS', name: 'Duplex Sheet Set', isactive: 'Y' }, BILL))]); await sleep(1200);
    PRJ = (await rd("SELECT c_project_id FROM c_project WHERE name='Duplex Sheet Set'"))[0].c_project_id;
    // the firm's own stages; the first stage is priced (eight hours at fifty: the product, quantity and price a phase needs to be ordered)
    await commitOps(PHASES.map((p, i) => mkOp('c_projectphase', Object.assign({ c_project_id: PRJ, name: p, seqno: 100 + (i + 1) * 10, isactive: 'Y', iscomplete: 'N' }, i === 0 ? { m_product_id: 126, qty: HAND.order.qty, priceactual: HAND.order.price } : {})))
      .concat(TASKS.map(([t, pi], i) => mkOp('c_projecttask', { c_projectphase_id: { __opRef: pi }, name: t, seqno: (i + 1) * 10, isactive: 'Y' })))); await sleep(1200);
    (await rd("SELECT c_projectphase_id AS id, name FROM c_projectphase WHERE c_project_id=" + PRJ)).filter(r => PHASES.indexOf(r.name) >= 0).forEach(r => PH[r.name] = r.id);
    (await rd("SELECT c_projecttask_id AS id, name, c_projectphase_id AS ph FROM c_projecttask WHERE c_projectphase_id IN (" + Object.values(PH).concat([0]).join(',') + ")")).filter(r => TASKS.some(t => t[0] === r.name)).forEach(r => TK[r.name] = { id: r.id, ph: r.ph });
    say('§ERP_FILM_SETUP project=' + PRJ + ' phases=' + JSON.stringify(PH) + ' tasks=' + JSON.stringify(Object.fromEntries(Object.entries(TK).map(([k, v]) => [k, v.id]))));
    if (Object.keys(PH).length !== PHASES.length || Object.keys(TK).length !== TASKS.length) throw new Error('fixture rows not readable back');
    const ownPh = Number((await rd("SELECT count(*) n FROM c_projectphase WHERE c_project_id=" + PRJ))[0].n);

    // ════════ (a) BEFORE: the project with its stages, an EMPTY BIM Document tab ════════
    await boot('&window=' + PROJ_WIN); await selectRow(PRJ); await tabClickQ('Phase'); await ensureGridQ();
    await recOn('before');
    await beat('before', 'before', 'the project with its stages; the BIM Document tab empty');
    await hold(3200);
    fact('before.ownStages', (await snap()).rows.length); fact('before.ownStages.sql', ownPh);
    await off(async () => { await tabClickQ('Task'); await selectRow(TK.Plans.id); await tabClickQ('BIM Document'); });
    await hold(500); await hclick(tabSel('BIM Document')).catch(() => {}); await hold(2200);
    const sn0 = await snap(); fact('before.registerRows', sn0.rows.length);
    if (sn0.rows.length !== 0) throw new Error('BEFORE is not empty: ' + sn0.rows.length);
    await hold(600); await endBeat(); await recOff();
    if (STOP_AFTER === 'before') throw STOP;

    // ════════ (b) beat 1 — stages copied from the type (Set Project Type, AD_Process 215) ════════
    await boot('&window=' + PROJ_WIN); const k1 = await selectRow(PRJ); await sleep(800);
    say('§ERP_FILM_NOTE b1 selected=' + k1 + ' want=' + PRJ + ' typeBtn=' + !!(await page.$('[data-proc-btn="C_ProjectType_ID"]')) + ' btns=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-proc-btn]')].map(e => e.getAttribute('data-proc-btn')))));
    await recOn('main'); await beat('b1', 'main', 'stages copied from the project type');
    await hold(900);
    const t1 = mark();
    await hclick('[data-proc-btn="C_ProjectType_ID"]'); await page.waitForSelector('[data-proc-param="C_ProjectType_ID"]', { timeout: 15000 }); await hold(900);
    const typeName = await dq("SELECT Name FROM C_ProjectType WHERE C_ProjectType_ID=101"); fact('b1.typeName', typeName[0][0]);
    await hselect('[data-proc-param="C_ProjectType_ID"]', 101);
    await hclick('[data-proc-run]');
    for (let i = 0; i < 60 && !(await page.$('#idmp-procdlg .idmp-procresult')); i++) await sleep(250);
    await hold(2600);
    const ures = await page.evaluate(() => { const r = document.querySelector('#idmp-procdlg .idmp-procresult'); return r ? { chip: (r.querySelector('.ok-chip') || {}).textContent, msg: (r.querySelector('.msg') || {}).textContent } : null; });
    const stLine = lastLine(t1, /^§PROJECT-SETTYPE /);
    fact('b1.line', stLine); fact('b1.phasesCopied', kv(stLine, 'phases')); fact('b1.tasksCopied', kv(stLine, 'tasks')); fact('b1.category', kv(stLine, 'category')); fact('b1.ui', JSON.stringify(ures));
    await hclick('[data-procdlg-ok]').catch(() => {}); await hold(700);
    await beat('b1r', 'main', 'the project now has five phases');
    await hclick(tabSel('Phase')); await hold(2000);
    const phNow = Number((await rd("SELECT count(*) n FROM c_projectphase WHERE c_project_id=" + PRJ))[0].n);
    fact('b1.stagesNow', phNow); fact('b1.stagesBefore', ownPh);
    if (!stLine) { cut('b1', 'no §PROJECT-SETTYPE line'); }
    if (STOP_AFTER === 'b1') { await endBeat(); await recOff(); throw STOP; }

    // ════════ beat 2 — the register: a sheet entered in the Task's BIM Document sub-tab, the others the same way (off camera) ════════
    await off(async () => {
      for (const k of ['A-102/1', 'A-103/1', 'A-201/1', 'A-201/2']) await createDocForm(k, true);
      say('§ERP_FILM_SETUP prepared ids=' + JSON.stringify(ID));
      await boot('&window=' + PROJ_WIN); await selectRow(PRJ);
    });
    await beat('b2', 'main', 'the register: a sheet entered in the Task sub-tab, then the whole register');
    await walkTo('Concept', 'Plans', 'BIM Document');
    const n2 = mark();
    await beat('b2n', 'main', 'one sheet typed into the Task sub-tab');
    await hclick('#idmp-toolbar button[data-tb="new"]'); await page.waitForSelector('#idmp-inline-mount .cfrow', { timeout: 10000 }); await hold(900);
    const [no1, rev1, title1, disc1, kind1, hrs1] = DOCS['A-101/1'];
    await htype(F('deliverableno'), no1); await htype(F('name'), title1);
    await hselect(F('discipline', 'select'), disc1); await hselect(F('filekind', 'select'), kind1); await htype(F('hoursbudget'), hrs1);
    if (String((await page.locator(F('revision')).first().inputValue().catch(() => '1'))) !== '1') await setv('revision', 1);
    await hclick('#idmp-toolbar button[data-tb="save"]');
    for (let i = 0; i < 40 && !since(n2, /^§CRUD-GROUP-PERSIST|^§CRUD persist|committed key=bim_document/).length; i++) await sleep(250); await sleep(1500);
    const r101 = (await rd("SELECT bim_document_id AS id, c_project_id AS p, c_projectphase_id AS ph, c_projecttask_id AS t, docstatus FROM bim_document WHERE deliverableno='A-101' AND revision=1"))[0];
    ID['A-101/1'] = r101 && r101.id;
    if (!r101 || String(r101.t) !== String(TK.Plans.id) || String(r101.ph) !== String(TK.Plans.ph) || String(r101.p) !== String(PRJ)) throw new Error('A-101 not saved from the sub-tab with its parents: ' + JSON.stringify(r101));
    fact('b2.A-101.row', JSON.stringify(r101)); fact('b2.A-101.parentsInherited', 'project+phase+task from the sub-tab parents');
    await off(async () => { await boot('&window=' + PROJ_WIN); await selectRow(PRJ); await tabClickQ('Phase'); await selectRow(PH.Concept); await tabClickQ('Task'); await selectRow(TK.Plans.id); await tabClickQ('BIM Document'); });
    await beat('b2r', 'main', 'the register: three rows on the task, in its grid');
    await hold(900); await toGrid(); await hold(1800);
    const sn2 = await snap(); fact('b2.registerRows.Plans', sn2.rows.length); fact('b2.rows', sn2.rows.length);
    const g2 = await page.evaluate(() => ({ th: [...document.querySelectorAll('#idmp-content table thead th[data-ad-col]')].map(e => e.getAttribute('data-ad-col')), rows: [...document.querySelectorAll('#idmp-content table tbody tr[data-ad-record]')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.trim()).filter(Boolean).length) }));
    fact('b2.grid.columns', g2.th.join('|')); fact('b2.grid.filledCells', g2.rows.join('|'));
    await hold(1500);
    // the task itself counts its deliverables: the Task grid's computed column
    const m2 = mark(); await hclick(tabSel('Task')); await hold(900); await toGrid();
    await showCol('BIM_Deliverables', 'b2'); await hold(1500);
    const regLine = virtLine(m2, 'C_ProjectTask', 'BIM_Deliverables');
    fact('b2.line', regLine); fact('b2.deliverables', virtOf(regLine, TK.Plans.id));
    if (!regLine) cut('b2', 'no §AD-VIRTUAL BIM_Deliverables line');
    await hclick(tabSel('BIM Document')); await hold(900); await toGrid();   // back to the register: beat 3 attaches to a BIM Document, not to the task
    if (STOP_AFTER === 'b2') { await endBeat(); await recOff(); throw STOP; }

    // ════════ beat 3 — the drawing attached (the generic Attachment dialog): name, size, fingerprint ════════
    await beat('b3', 'main', 'drawing attached: name, size, fingerprint');
    await formOf(ID['A-101/1']); await hold(800);
    const n3 = mark();
    let ab = await page.$('#idmp-toolbar button[data-tb="attachment"]'); if (!ab || await ab.evaluate(b => b.disabled)) { await page.click('#idmp-toolbar button[data-tb="refresh"]').catch(() => {}); await sleep(1800); }
    await hclick('#idmp-toolbar button[data-tb="attachment"]'); await page.waitForSelector('[data-att="dialog"]', { timeout: 10000 }); await hold(1200);
    await glide('[data-att="load"]'); await hold(400);
    const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), (async () => { await page.mouse.down(); await hold(70); await page.mouse.up(); })()]);
    await fc.setFiles([{ name: 'duplex_ground_floor.dxf', mimeType: 'application/dxf', buffer: DXF }]); await hold(2800);
    await hclick('[data-att="ok"]'); await page.waitForSelector('[data-att="dialog"]', { state: 'detached', timeout: 15000 }); await hold(1500);
    const attOpen = since(n3, /^§ATT open table=/)[0] || ''; fact('b3.attachedTo', attOpen);
    if (kv(attOpen, 'table') !== String(T_ID)) throw new Error('beat 3 attached to table ' + kv(attOpen, 'table') + ', not BIM_Document ' + T_ID);
    const hashLine = since(n3, /^§ATT hash name=duplex_ground_floor/)[0] || '';
    fact('b3.line', hashLine); fact('b3.name', kv(hashLine, 'name')); fact('b3.sha256', kv(hashLine, 'sha256')); fact('b3.sha256.node', sha(DXF)); fact('b3.bytes.node', DXF.length);
    fact('b3.saved', since(n3, /^§ATT save op=create entries=1/)[0] || 'NONE');
    if (!hashLine || kv(hashLine, 'sha256') !== sha(DXF)) cut('b3', 'no §ATT hash line equal to the node sha256');
    await hold(900);
    if (STOP_AFTER === 'b3') { await endBeat(); await recOff(); throw STOP; }

    // ════════ beat 4 — opened in the Modeller: the same fingerprint in the app's own log ════════
    await beat('b4', 'main', 'opened in the Modeller; the same fingerprint in the app log');
    const n4 = mark(), a4 = APPLOG.length;
    const popup = await gearRun('OpenInApp', 30000);
    const tbb = lastLine(n4, /^§AD-TBB click comp=OpenInApp /); fact('b4.gear.line', tbb); fact('b4.via', kv(tbb, 'via')); fact('b4.process', kv(tbb, 'process'));
    let appOpen = null;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      const ps = await newSession(popup); await switchTo(ps);
      for (let i = 0; i < 360 && !APPLOG.slice(a4).some(l => /^§FILESTORE-OPEN sha=|^§FILESTORE-OPEN REFUSED/.test(l)); i++) await sleep(250);
      appOpen = APPLOG.slice(a4).find(l => /^§FILESTORE-OPEN sha=/.test(l)) || null;
      await hold(6000);                                  // the Modeller, with the drawing opened
      await switchTo(mainSess); await popup.close().catch(() => {});
    }
    fact('b4.processResult', await closeProcDlg());
    const openLine = lastLine(n4, /^§BIMDOC-OPEN id=/);
    fact('b4.line', openLine); fact('b4.url', kv(openLine, 'url')); fact('b4.sha256.action', kv(openLine, 'sha256')); fact('b4.app', kv(openLine, 'app')); fact('b4.appLine', appOpen || 'NONE');
    fact('b4.sha12.app', appOpen ? (/sha=([0-9a-f]+)/.exec(appOpen) || [])[1] : 'NONE');
    if (!openLine || !appOpen) cut('b4', 'no §BIMDOC-OPEN / §FILESTORE-OPEN pair');
    await hold(1200);
    if (STOP_AFTER === 'b4') { await endBeat(); await recOff(); throw STOP; }

    // ════════ beat 5 — issued for review, then for construction (document-action bar) ════════
    await beat('b5', 'main', 'issued for review, then for construction');
    await off(async () => { await boot('&window=' + W_ID); await selectRow(ID['A-101/1']); });
    await hold(1800);
    const bar0 = await barActs(); fact('b5.bar.Draft', bar0.join(',')); fact('b5.chip.Draft', await chip());
    const n5a = mark(); await hclick('.idmp-docfsm [data-doc-action="PR"]');
    for (let i = 0; i < 60 && !since(n5a, /^§CRUD process committed key=bim_document/).length; i++) await sleep(250); await hold(2200);
    const toIP = lastLine(n5a, /^§CRUD process committed key=bim_document/);
    await off(async () => { await boot('&window=' + W_ID); await selectRow(ID['A-101/1']); });
    await hold(1500); fact('b5.chip.review', await chip()); fact('b5.bar.review', (await barActs()).join(','));
    const n5b = mark(); await hclick('.idmp-docfsm [data-doc-action="CO"]');
    for (let i = 0; i < 60 && !since(n5b, /^§CRUD process committed key=bim_document/).length; i++) await sleep(250); await hold(2200);
    const toCO = lastLine(n5b, /^§CRUD process committed key=bim_document/);
    const st101 = await status('A-101/1');
    fact('b5.line.review', toIP.replace(/op_uuid=\S+/, '').slice(0, 220)); fact('b5.line.construction', toCO.replace(/op_uuid=\S+/, '').slice(0, 220));
    fact('b5.to.review', kv(toIP, 'to')); fact('b5.to.construction', kv(toCO, 'to')); fact('b5.status.A-101', JSON.stringify(st101));
    if (!toIP || !toCO) cut('b5', 'no committed transition line');
    if (STOP_AFTER === 'b5') { await endBeat(); await recOff(); throw STOP; }

    // ════════ beat 6 — a revision supersedes the old row ════════
    await off(async () => { const r = await actQ('A-201/1', 'CO'); say('§ERP_FILM_SETUP A-201 rev 1 issued off camera ok=' + r.ok); await toTask('Concept', 'Sections'); await tabClickQ('BIM Document'); });
    await beat('b6', 'main', 'a revision supersedes the old row');
    await hold(1800); fact('b6.before.rows', (await snap()).rows.length);
    fact('b6.rev1.status.before', JSON.stringify(await status('A-201/1'))); fact('b6.rev2.status.before', JSON.stringify(await status('A-201/2')));
    await formOf(ID['A-201/2']); await hold(1500);
    const n6 = mark(); await hclick('.idmp-docfsm [data-doc-action="CO"]');
    for (let i = 0; i < 60 && !since(n6, /^§BIMDOC-SUPERSEDE /).length; i++) await sleep(250); await hold(2500);
    const supLine = lastLine(n6, /^§BIMDOC-SUPERSEDE /);
    fact('b6.line', supLine); fact('b6.deliverable', kv(supLine, 'deliverable')); const rv6 = /\(rev (\d+)\).*\(rev (\d+)\)/.exec(supLine || ''); fact('b6.rev.old', rv6 ? rv6[1] : 'NONE'); fact('b6.rev.new', rv6 ? rv6[2] : 'NONE'); fact('b6.rev1.docstatus', kv(supLine, 'old.docstatus'));
    fact('b6.rev1.status.after', JSON.stringify(await status('A-201/1'))); fact('b6.rev2.status.after', JSON.stringify(await status('A-201/2'))); fact('b6.reversal.matches', String((await status('A-201/1')).reversal_id) === String(ID['A-201/2']));
    await off(async () => { await boot('&window=' + PROJ_WIN); await selectRow(PRJ); await tabClickQ('Phase'); await selectRow(PH.Concept); await tabClickQ('Task'); await selectRow(TK.Sections.id); await tabClickQ('BIM Document'); });
    await hold(900); await formOf(ID['A-201/1']); await hold(2600);
    if (!supLine) cut('b6', 'no §BIMDOC-SUPERSEDE line');
    if (STOP_AFTER === 'b6') { await endBeat(); await recOff(); throw STOP; }

    // ════════ beat 7 — hours booked on the task (Expense Report window: the report and its lines) ════════
    await off(async () => {
      await boot('&window=' + PROJ_WIN);
      await page.evaluate(([prj, ph, tk, qty]) => new Promise(res => { const A = window.APP || {}, std = { actor: A.actor, clientId: A.clientId, orgId: A.orgId || 0 };
        const mk = (t, f) => ({ key: t, table: t, verb: 'create', op_type: 'CRUD_CREATE', op_uuid: null, cas: null, fields: f, stdDefaults: std });
        const ops = [mk('s_timeexpense', { documentno: 'TE-BIMDOC-1', datereport: '2026-11-09', isactive: 'Y', processed: 'N' })];
        qty.forEach((q, i) => ops.push(mk('s_timeexpenseline', { s_timeexpense_id: { __opRef: 0 }, line: (i + 1) * 10, istimereport: 'Y', dateexpense: '2026-11-09', qty: q, c_project_id: prj, c_projectphase_id: ph, c_projecttask_id: tk, description: 'Duplex plans, drafting hours', isactive: 'Y', processed: 'N' })));
        window.__crud.applyOpGroup(ops, rr => res(rr)); }), [PRJ, TK.Plans.ph, TK.Plans.id, [3.5, 2, 1.5]]);
      await sleep(1500);
      const te = (await rd("SELECT s_timeexpense_id AS id FROM s_timeexpense WHERE documentno='TE-BIMDOC-1'"))[0]; ID.te = te && te.id;
      await boot('&window=235'); if (ID.te != null) await selectRow(ID.te);
    });
    await beat('b7', 'main', 'hours booked on the task');
    await hold(1500);
    const tabs7 = await tabNames(); fact('b7.tabs', tabs7.join('|'));
    const lineTab = tabs7.find(t => /Line/i.test(t)); if (lineTab) { await hclick(tabSel(lineTab)); await hold(2200); }
    const hq = await rd("SELECT qty FROM s_timeexpenseline WHERE c_projecttask_id=" + TK.Plans.id + " AND isactive<>'N'");
    fact('b7.lines.read', hq.length); fact('b7.total.read', hq.reduce((a, x) => a + Number(x.qty || 0), 0));
    await hold(1500);
    fact('b7.lines', hq.length); fact('b7.qty', JSON.stringify(hq.map(x => Number(x.qty)).sort((x, y) => x - y)));
    // the same hours on the task: its grid's computed column "BIM Hours Booked"
    const mark0 = mark();
    await off(async () => { await boot('&window=' + PROJ_WIN); await selectRow(PRJ); await tabClickQ('Phase'); await selectRow(PH.Concept); await tabClickQ('Task'); await ensureGridQ(); });
    const m7 = mark0;
    await showCol('BIM_HoursBooked', 'b7'); await hold(1800);
    const hrsLine = virtLine(m7, 'C_ProjectTask', 'BIM_HoursBooked');
    fact('b7.line', hrsLine); fact('b7.total', virtOf(hrsLine, TK.Plans.id));
    if (!hrsLine || !(Number(virtOf(hrsLine, TK.Plans.id)) > 0)) cut('b7', 'no §AD-VIRTUAL BIM_HoursBooked with hours');

    // ════════ beat 8 — progress, computed: the same Task grid, then the Phase grid ════════
    await beat('b8', 'main', 'progress computed: issued over all, earned hours (grid columns)');
    await showCol('BIM_Issued', 'b8'); await hold(900); await showCol('BIM_EarnedHours', 'b8'); await hold(1500);
    const tI = virtLine(m7, 'C_ProjectTask', 'BIM_Issued'), tN = virtLine(m7, 'C_ProjectTask', 'BIM_Deliverables'), tE = virtLine(m7, 'C_ProjectTask', 'BIM_EarnedHours');
    fact('b8.line.task', tI); fact('b8.task.issued', virtOf(tI, TK.Plans.id)); fact('b8.task.total', virtOf(tN, TK.Plans.id)); fact('b8.task.earned', virtOf(tE, TK.Plans.id));
    const m8 = mark(); await hclick(tabSel('Phase')); await hold(900); await toGrid(); await showCol('BIM_Issued', 'b8p'); await hold(900); await showCol('BIM_EarnedHours', 'b8p'); await hold(1800);
    const pI = virtLine(m8, 'C_ProjectPhase', 'BIM_Issued'), pN = virtLine(m8, 'C_ProjectPhase', 'BIM_Deliverables'), pE = virtLine(m8, 'C_ProjectPhase', 'BIM_EarnedHours');
    fact('b8.line.phase', pI); fact('b8.phase.issued', virtOf(pI, PH.Concept)); fact('b8.phase.total', virtOf(pN, PH.Concept)); fact('b8.phase.earned', virtOf(pE, PH.Concept));
    fact('b8.stored.progress.columns', (await dq("SELECT count(*) FROM AD_Column c JOIN AD_Table t ON t.AD_Table_ID=c.AD_Table_ID WHERE c.ColumnName LIKE 'BIM\\_%' ESCAPE '\\' AND COALESCE(c.ColumnSQL,'')='' AND t.TableName IN ('C_ProjectTask','C_ProjectPhase')"))[0][0]);
    if (!tI || !pI) cut('b8', 'no §AD-VIRTUAL BIM_Issued line for the task or the phase');
    if (STOP_AFTER === 'b8') { await endBeat(); await recOff(); throw STOP; }

    // ════════ (c) beat 9 — the one real event: the phase ticked complete -> its Generate Order -> the invoice, with amounts ════════
    await off(async () => { await boot('&window=' + PROJ_WIN); await selectRow(PRJ); await tabClickQ('Phase'); await selectRow(PH.Concept); });
    await beat('b9', 'main', 'phase ticked complete; Generate Order; the invoice');
    await hold(1500);
    const flds = await page.evaluate(() => [...document.querySelectorAll('#idmp-inline-mount [data-col]')].map(e => e.getAttribute('data-col')));
    fact('b9.phaseFields', flds.join(','));
    await glide(F('iscomplete')); await hold(900);
    if (!(await page.locator(F('iscomplete')).first().isChecked())) await hclick(F('iscomplete'));
    fact('b9.iscomplete.ticked', await page.locator(F('iscomplete')).first().isChecked());
    const n9a = mark(); await hclick('#idmp-toolbar button[data-tb="save"]');
    for (let i = 0; i < 40 && !since(n9a, /^§CRUD-GROUP-PERSIST|^§CRUD persist|committed key=c_projectphase/).length; i++) await sleep(250); await hold(1800);
    const phRow = (await rd("SELECT iscomplete, qty, priceactual, m_product_id FROM c_projectphase WHERE c_projectphase_id=" + PH.Concept))[0];
    fact('b9.phase.row', JSON.stringify(phRow));
    const n9 = mark();
    await hclick('#idmp-toolbar [data-tb="process"]'); await hold(700);
    await hclick('[data-tbb="GenerateOrder"]');
    for (let i = 0; i < 80 && !(await page.$('#idmp-procdlg .idmp-procresult')); i++) await sleep(250); await hold(2600);
    const gres = await page.evaluate(() => { const r = document.querySelector('#idmp-procdlg .idmp-procresult'); return r ? { chip: (r.querySelector('.ok-chip') || {}).textContent, msg: (r.querySelector('.msg') || {}).textContent } : null; });
    const gHead = lastLine(n9, /^§PROJECT-PHASE-GENORDER /), gLine = lastLine(n9, /^§PROJECT-PHASE-GENORDER-LINE /);
    fact('b9.genorder.head', gHead); fact('b9.genorder.line', gLine); fact('b9.genorder.ui', JSON.stringify(gres));
    await hclick('[data-procdlg-ok]').catch(() => {}); await hold(600);
    const docNo = kv(gHead, 'documentno');
    const ordRow = docNo ? (await rd("SELECT c_order_id AS id FROM c_order WHERE documentno='" + docNo + "' AND c_project_id=" + PRJ))[0] : null; const orderId = ordRow ? ordRow.id : null;
    fact('b9.order.documentno', docNo); fact('b9.order.lines', kv(gHead, 'lines')); fact('b9.order.line.qty', kv(gLine, 'qty')); fact('b9.order.line.price', kv(gLine, 'price')); fact('b9.order.line.amount', kv(gLine, 'amount'));
    // the order is completed through the Sales Order window's document-action bar; an On-Credit order raises its invoice itself
    await off(async () => { await boot('&window=143'); await selectRow(orderId); });
    await beat('b9i', 'main', 'the order completed; the invoice');
    await hold(1500); fact('b9.order.bar', (await barActs()).join(','));
    const n9c = mark(); await hclick('.idmp-docfsm [data-doc-action="CO"]');
    for (let i = 0; i < 80 && !since(n9c, /^§CRUD process committed key=c_order|REFUSED by the model|REJECTED/).length; i++) await sleep(250); await hold(2400);
    const ih = lastLine(n9c, /^§ORDER-CREATEINVOICE /), il = lastLine(n9c, /^§ORDER-CREATEINVOICE-LINE /);
    const inv = (await rd("SELECT c_invoice_id AS id, documentno, docstatus, grandtotal FROM c_invoice WHERE c_order_id=" + orderId))[0];
    fact('b9.invoice.head', ih); fact('b9.invoice.line', il); fact('b9.invoice.invoiceno', kv(il, 'invoiceno')); fact('b9.invoice.qty', kv(il, 'qty')); fact('b9.invoice.price', kv(il, 'price')); fact('b9.invoice.amount', kv(il, 'amount'));
    fact('b9.invoice.row', JSON.stringify(inv));
    if (!il) cut('b9', 'no §ORDER-CREATEINVOICE-LINE');
    else {
      // the invoice is reached the way a user does from the order: Zoom Across -> Sales Invoice (the window opened by hand lists no row of this session, so the zoom is the path)
      await hclick('#idmp-toolbar button[data-tb="zoomacross"]'); await page.waitForSelector('#idmp-zoom-ov', { timeout: 10000 }); await hold(1800);
      const zoomTxt = await page.evaluate(() => document.getElementById('idmp-zoom-ov').innerText.replace(/\s+/g, ' ')); fact('b9.zoom.panel', zoomTxt);
      const nz = mark(); await hclick('#idmp-zoom-ov >> text=Sales Invoice and Credit/Debit Note'); await hold(2500);
      for (let i = 0; i < 20 && !(await page.$('#idmp-inline-mount .cfrow')); i++) await sleep(300);
      const sn9 = await snap(); say('§ERP_FILM_NOTE invoice via zoom: table=' + sn9.table + ' rows=' + sn9.rows.length + ' current=' + sn9.currentKey + ' want=' + inv.id);
      const shown = await page.evaluate(() => ({ docno: (document.querySelector('#idmp-inline-mount input[data-col="documentno"]') || {}).value, grand: (document.querySelector('#idmp-inline-mount input[data-col="grandtotal"]') || {}).value }));
      fact('b9.invoice.shown', JSON.stringify(shown)); fact('b9.invoice.current', sn9.currentKey);
      await hold(1500); const invTabs = await tabNames(); fact('b9.invoice.tabs', invTabs.join('|'));
      if (invTabs.find(t => /^Invoice Line$/i.test(t))) { await hclick(tabSel(invTabs.find(t => /^Invoice Line$/i.test(t)))); await hold(2800); }
    }
    if (STOP_AFTER === 'b9') { await endBeat(); await recOff(); throw STOP; }

    // ════════ beat 10 — the measure moves one link along the sheet chain ════════
    await off(async () => { await openDocQ('A-103/1'); });
    await beat('b10', 'main', 'one more sheet issued; the count moves one link');
    await hold(1500);
    const n10 = mark(); await hclick('.idmp-docfsm [data-doc-action="CO"]');
    for (let i = 0; i < 60 && !since(n10, /^§BIMDOC-CHAIN /).length; i++) await sleep(250); await hold(2500);
    const chLine = lastLine(n10, /^§BIMDOC-CHAIN /);
    fact('b10.line', chLine); fact('b10.deliverable', kv(chLine, 'deliverable')); fact('b10.issued.before', kv(chLine, 'issued-before')); fact('b10.issued.after', kv(chLine, 'issued-after')); fact('b10.delta', kv(chLine, 'delta')); fact('b10.deliverables', kv(chLine, 'deliverables'));
    if (!chLine || kv(chLine, 'delta') !== '1') cut('b10', 'no §BIMDOC-CHAIN with delta=1');
    await endBeat(); await recOff();

    // ════════ AFTER: the same project with its register and computed progress (recorded last, placed second in the film) ════════
    await off(async () => { await boot('&window=' + PROJ_WIN); await selectRow(PRJ); });
    await off(async () => { await tabClickQ('Phase'); await selectRow(PH.Concept); await tabClickQ('Task'); await selectRow(TK.Plans.id); await tabClickQ('BIM Document'); await ensureGridQ(); });
    await recOn('after'); await beat('after', 'after', 'the same project: register and computed progress');
    await hold(900); await toGrid(); await hold(2200);
    const snA = await snap(); fact('after.registerRows.Plans', snA.rows.length);
    const mA = mark(); await hclick(tabSel('Task')); await hold(900); await toGrid(); await showCol('BIM_Issued', 'after'); await hold(1500);
    const aTI = virtLine(mA, 'C_ProjectTask', 'BIM_Issued'), aTN = virtLine(mA, 'C_ProjectTask', 'BIM_Deliverables');
    fact('after.line.task', aTI); fact('after.task.issued', virtOf(aTI, TK.Plans.id)); fact('after.task.total', virtOf(aTN, TK.Plans.id));
    const mP = mark(); await hclick(tabSel('Phase')); await hold(900); await toGrid(); await showCol('BIM_Issued', 'afterp'); await hold(1500);
    const aPI = virtLine(mP, 'C_ProjectPhase', 'BIM_Issued'), aPN = virtLine(mP, 'C_ProjectPhase', 'BIM_Deliverables');
    fact('after.line.phase', aPI); fact('after.phase.issued', virtOf(aPI, PH.Concept)); fact('after.phase.total', virtOf(aPN, PH.Concept));
    await hold(2500); await endBeat(); await recOff();
    fact('lens.buttons.max', lensMax);
    say('§ERP_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { if (e === STOP) say('§ERP_FILM_STOP after ' + STOP_AFTER); else say('§ERP_FILM_ERROR ' + String(e.stack || e.message).split('\n').slice(0, 4).join(' | ')); }

  if (cur) await recOff();
  fs.writeFileSync(path.join(OUT, 'erp_film.page.log'), PAGELOG.join('\n') + '\n');

  // ════════ ASSEMBLY: before | idea card | after | main | end card — each part encoded identically, joined with -c copy ════════
  const enc = (listFile, out) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-r', '24', out]);
  const parts = []; const segLen = {};
  for (const seg of ['before', 'after', 'main']) {
    const cs = clips.filter(c => c.seg === seg && c.frames.length); if (!cs.length) continue;
    const lines = []; let lastFn = null;
    cs.forEach(c => { c.frames.forEach((f, i) => { const d = (i + 1 < c.frames.length ? c.frames[i + 1].ts : c.stop) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); lastFn = f.fn; }); });
    lines.push(`file '${lastFn}'`);
    const lf = path.join(OUT, 'frames_' + seg + '.txt'), mp = path.join(OUT, 'seg_' + seg + '.mp4'); fs.writeFileSync(lf, lines.join('\n') + '\n'); enc(lf, mp);
    segLen[seg] = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp]).toString().trim());
    say('§ERP_FILM_SEG ' + seg + ' clips=' + cs.length + ' frames=' + cs.reduce((a, c) => a + c.frames.length, 0) + ' dur=' + segLen[seg].toFixed(3) + ' recorded=' + segAcc[seg].toFixed(3));
  }
  // plain HTML cards (headless, CPU): a static hold with a 0.4 s fade in and out
  const cardCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }); const cardPage = await cardCtx.newPage();   // device scale 1: a card is exactly 1920x1080
  async function card(name, html, secs) {
    await cardPage.setContent(html); const png = path.join(OUT, 'card_' + name + '.png'); await cardPage.screenshot({ path: png });
    const mp = path.join(OUT, 'seg_' + name + '.mp4');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-framerate', '24', '-t', secs.toFixed(4), '-i', png, '-vf', `scale=1920:1080:flags=lanczos,fade=t=in:st=0:d=0.4,fade=t=out:st=${(secs - 0.4).toFixed(3)}:d=0.4,format=yuv420p`, '-c:v', 'libx264', '-crf', '17', '-r', '24', '-tune', 'stillimage', '-frames:v', String(Math.round(secs * 24)), mp]);
    segLen[name] = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp]).toString().trim()); say('§ERP_FILM_SEG ' + name + ' dur=' + segLen[name].toFixed(3)); return mp;
  }
  const cardSecs = Math.max(MIN.card || 8, 4), endSecs = Math.max(MIN.end || 6, 4), chSecs = Math.max(MIN.ch || 8, 4);
  const order = [];
  order.push(await card('ch', CARD_CH, chSecs)); if (segLen.before) order.push('before'); order.push(await card('card', CARD_IDEA, cardSecs)); if (segLen.after) order.push('after'); if (segLen.main) order.push('main'); order.push(await card('end', CARD_END, endSecs));
  const files = order.map(o => (o.endsWith('.mp4') ? o : path.join(OUT, 'seg_' + o + '.mp4')));
  const joinList = path.join(OUT, 'join.txt'); fs.writeFileSync(joinList, files.map(f => `file '${f}'`).join('\n') + '\n');
  const silent = path.join(OUT, 'bimdoc_silent.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', joinList, '-c', 'copy', silent]);
  // the beats' cues on the FINAL film clock (the narration cues)
  const off0 = {}; let acc = 0; for (const o of ['ch', 'before', 'card', 'after', 'main', 'end']) { if (!segLen[o]) continue; off0[o] = acc; acc += segLen[o]; }
  for (const b of BEATS) say('§ERP_FILM_CUE id=' + b.id + ' t=' + (off0[b.seg] + b.t).toFixed(3));
  say('§ERP_FILM_CUE id=ch t=' + (off0.ch ?? 0).toFixed(3)); say('§ERP_FILM_CUE id=card t=' + (off0.card ?? 0).toFixed(3)); say('§ERP_FILM_CUE id=end t=' + (off0.end ?? 0).toFixed(3));
  const fr = Number(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', silent]).toString().trim());
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', silent]).toString().trim());
  say('§ERP_FILM_DONE frames=' + fr + ' dur=' + dur.toFixed(3) + ' out=' + silent);
  fs.writeFileSync(path.join(OUT, 'erp_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();
