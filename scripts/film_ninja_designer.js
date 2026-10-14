// ⚠ DO NOT REMOVE — Scope guard
// Scope: Film 3 "Your Excel, your design" (prompts/NINJAEXCEL_FILM3_DESIGNER.md) — RAW silent recorder. Shows the REAL showcase sheets (rendered by scripts/film_sheet_html.js), the REAL engine run log, the REAL PDF page.
//   Headless Chromium, CPU only (--disable-gpu), CDP screencast -> mp4. Pattern from scripts/film_erp_first_setup.js (§ERP-FILM). The ERP pill is NOT filmed (port to bim-ootb not done): the run beat shows the engine log.
//   THE ISSUE it proves/disproves: can every spoken number of Film 3 be printed as a §FILM3_FACT read from a real run / real file, so narration invents nothing?
// §-log first — READ <out>/film3.log. Exit code is not evidence. GardenWorld only; no customer data. Never beside a live user tab (CPU only, but still).
// Run: node scripts/film_ninja_designer.js <outDir>      env SHOW=<dir with showcase_template.xlsx> (default ~/Projects/ninja-template-data/showcase)  BEAT_MIN='{"id":seconds}' to stretch a beat
'use strict';
const os = require('os'), fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const ND = os.homedir() + '/Projects/ninja-template-data/', E = require(ND + 'nm/node_modules/exceljs'), X = require('/home/red1/bim-compiler/node_modules/xlsx');
const D = require('/home/red1/bim-compiler/node_modules/better-sqlite3'), H = require('../build/erp/ninja_template_xlsx.js'), T = require('../build/erp/ninja_template.js'), C = require('../build/erp/ninja_calc.js'), PF = require('../build/erp/ninja_preflight.js');
const { sheetHtml } = require('./film_sheet_html.js');
const FILM_LANG = process.env.FILM_LANG || 'en', TH = FILM_LANG === 'th' ? require('./film3_th_strings.js') : {}, MISSING = []; const TR = s => (s === '' ? '' : FILM_LANG === 'th' ? (TH[s] !== undefined ? TH[s] : (MISSING.push(s), s)) : s);
const SHOW = process.env.SHOW || ND + 'showcase', NTDIR = path.join(__dirname, 'ninja_template');
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
const LOG = [], say = s => { LOG.push(s); console.log(s); }, fact = (k, v) => say('§FILM3_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 300));
const ENV = Object.assign({}, process.env, { FROM: '2006-12-01 00:00:00.0', TO: '2006-12-31 00:00:00.0' });
const sh = (cmd, args) => cp.spawnSync(cmd, args, { encoding: 'utf8', env: ENV, cwd: NTDIR }).stdout;
const CSS = `body{margin:0;background:#12151f;color:#e6ebf5;font-family:'Liberation Sans','Noto Sans','Noto Sans Thai',system-ui,sans-serif;overflow:hidden}
 .top{padding:18px 30px 6px;font-size:30px;font-weight:600}.sub{padding:0 30px 10px;font-size:20px;opacity:.75}
 .paper{margin:6px 30px;padding:14px;background:#fff;display:inline-block;position:relative;box-shadow:0 4px 24px #000a}
 table.xs{border-collapse:collapse;table-layout:fixed;font-family:'Liberation Sans',Arial,sans-serif;color:#000}table.xs td{padding:1px 4px;overflow:hidden;white-space:nowrap;border:1px solid #e3e3e3;font-size:13px}
 .grid td{border:1px solid #39425f}.dark table.xs{background:#1b2033}.dark table.xs td{color:#e6ebf5;border:1px solid #39425f;font-size:15px;padding:3px 9px;background:#1b2033}
 .ring{position:absolute;border:4px solid #ffb400;border-radius:6px;box-shadow:0 0 0 3px #0008;pointer-events:none;transition:all .35s}
 .chip{position:absolute;background:#ffb400;color:#1a1a1a;font-weight:700;font-size:21px;padding:5px 12px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 10px #000a;transition:all .35s}
 .hl td{background:#5a4510!important;color:#fff!important}.fbar{margin:10px 30px;padding:8px 14px;background:#232940;border:1px solid #39425f;font-family:monospace;font-size:24px;display:flex;gap:20px}
 .fbar b{color:#ffb400}.term{margin:10px 30px;padding:18px 24px;background:#0b0e16;border:1px solid #39425f;font-family:'DejaVu Sans Mono',monospace;font-size:21px;line-height:1.55;white-space:pre-wrap;height:520px;overflow:hidden}
 .term .ok{color:#6fd98a}.term .k{color:#ffb400}.card{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.card h1{font-size:62px;margin:0 0 24px}.card p{font-size:32px;opacity:.85;margin:6px}
 .scroller{width:1370px;overflow:hidden}.inner{position:relative;display:inline-block}.two{display:flex;gap:40px;padding:0 30px}.two>div{flex:1}.lbl{font-size:24px;margin:8px 0;font-weight:600}`;
(async () => {
  // ── real data: template model, engine run (guarded), facts ──
  const buf = fs.readFileSync(SHOW + '/showcase_template.xlsx'); const model = await H.loadModel(E, buf);
  const db = new D(ND + 'legacy/twin_snapshot.db', { readonly: true }); T.registerPgBuiltins((n, f) => db.function(n, { varargs: true }, f)); const exec = PF.selectOnly(T.sqliteExecutor(db));
  const pre = PF.preflight(model); const preLines = []; PF.report(pre, l => preLines.push(l));
  const runGrid = async edit => { const m = await H.loadModel(E, buf); if (edit) Object.keys(m.Sheets.Process).forEach(k => { const c = m.Sheets.Process[k]; if (c && c.t === 's' && c.v.includes("'14120'")) c.v = c.v.replace("'14120',", '').replace(",'14120'", ''); });
    const S = T.runTemplate(m, exec, { XLSX: X, clientId: 11, orgId: 0, from: ENV.FROM, to: ENV.TO }); C.evaluateSheet(m, 'Output'); return { m, S }; };
  const run = await runGrid(false), ed = await runGrid(true), OM = run.m;
  const merges = (OM.Sheets.BACKUP['!merges'] || []).length; const fills = new Set(Object.values(OM._styles).filter(s => s.fill && s.fill.fgColor).map(s => s.fill.fgColor.argb)).size;
  const pr = model.Sheets.Process; const prRows = Object.keys(pr).filter(k => /^A\d+$/.test(k) && pr[k].t !== 'z' && +k.slice(1) > 1 && /^@/.test(String(pr[k].v))).length;
  fact('design.mergedRegions', merges); fact('design.distinctFillColours', fills); fact('process.rules', prRows); fact('process.statements', run.S.sqlcount);
  fact('input.linkFormula', model.Sheets.Input.B7.f); fact('input.cellShows', model.Sheets.Input.B7.v); fact('process.annotationFormula', model.Sheets.Process.A4.f);
  const addrLines = run.S.log.filter(l => / Address is /.test(l)).length; fact('run.addressLines', addrLines);
  const gv = (m, k) => { const c = m.Sheets.Output[k]; return c && c.t !== 'z' ? c.v : null; };
  fact('kpi.postings', gv(OM, 'B7')); fact('kpi.debit', gv(OM, 'D7')); fact('kpi.credit', gv(OM, 'F7'));
  const cells = ['C', 'D', 'E', 'F'].flatMap(c => [12, 13, 14].map(r => gv(OM, c + r))); const filled = cells.filter(v => v != null).length; fact('grid.cells', cells.length); fact('grid.filled', filled); fact('grid.empty', cells.length - filled);
  fact('edit.grandTotalBefore', gv(OM, 'G15')); fact('edit.grandTotalAfter', gv(ed.m, 'G15')); fact('edit.accountsAfter', ['C', 'D', 'E', 'F'].map(c => gv(ed.m, c + '10')).filter(Boolean).length);
  const logs = ['W29_TwinXlsx.js', 'W33_PdfRender.js', 'W36_PdfContent.js', 'W37_Xtab2.js', 'W38_Preflight.js', 'W39_ShowcaseEdit.js'].map(w => {
    const args = { 'W29_TwinXlsx.js': [SHOW + '/showcase_template.xlsx', OUT + '/run.xlsx'], 'W33_PdfRender.js': [SHOW + '/showcase_template.xlsx', OUT + '/showcase.pdf', 'excel'], 'W36_PdfContent.js': [SHOW + '/showcase_template.xlsx', OUT + '/showcase.pdf'],
      'W37_Xtab2.js': [ND + 'legacy/parity_xtab2.xls'], 'W38_Preflight.js': [SHOW + '/showcase_template.xlsx'], 'W39_ShowcaseEdit.js': [SHOW + '/showcase_template.xlsx'] }[w]; return sh('node', [w, ...args]); });
  const L = logs.join('\n'); const g = re => (re.exec(L) || ['NOT-FOUND'])[0];
  const twin = g(/§TWIN_RUN .*/), pdfr = g(/§PDF_RENDER .*/), pdfc = g(/§PDF_CONTENT_VERDICT \w+/), pdfm = g(/§PDF_CONTENT showcase.*/), x2 = g(/§XTAB2_VERDICT .*/), pfv = g(/§PREFLIGHT_VERDICT .*/), ev = g(/§SHOWCASE_EDIT_VERDICT \w+/);
  [twin, pdfr, pdfm, pdfc, x2, pfv, ev].forEach(l => say('§FILM3_SRC ' + l)); fact('pdf.page', (/page=([\d.x]+)/.exec(pdfr) || [])[1]); fact('pdf.cellsMissing', (/missingFromPdf=(\d+)/.exec(pdfm) || [])[1]);
  cp.execFileSync('pdftoppm', ['-r', '100', '-png', '-singlefile', OUT + '/showcase.pdf', OUT + '/page']); const png = fs.readFileSync(OUT + '/page.png').toString('base64');

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] }); const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3 });
  const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page); const frames = []; let T0 = null;
  cdp.on('Page.screencastFrame', async f => { const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg'); fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp }); if (T0 === null) T0 = f.metadata.timestamp; cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0), SC = JSON.parse(process.env.BEAT_SCALE || '{}'), hold = ms => page.waitForTimeout(ms * ((prev && SC[prev.id]) || 1)), MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const beat = async (id, note) => { if (prev && MIN[prev.id]) { const w = MIN[prev.id] - (now() - prev.t); if (w > 0) { say('§FILM3_HOLD after=' + prev.id + ' extra=' + w.toFixed(2)); await page.waitForTimeout(w * 1000); } } prev = { id, t: now() }; say('§FILM3_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' ' + (note || '')); };
  let fits = 0, fitBad = 0;
  const show = async (title, sub, body, cls) => { const tt = TR(title), ts = sub ? TR(sub) : ''; await page.setContent(`<style>${CSS}</style><div class="${cls || ''}"><div class="top">${tt}</div><div class="sub">${ts}</div>${body}</div>`); await hold(50); const f = await page.evaluate(() => { const els = [...document.querySelectorAll('.paper,.term,.card h1,img')]; return { right: Math.max(0, ...els.map(e => e.getBoundingClientRect().right)), iw: innerWidth }; }); fits++; if (f.right > f.iw + 1) { fitBad++; say('§FILM3_FIT_CLIPPED ' + title.slice(0, 40) + ' right=' + f.right.toFixed(0) + ' viewport=' + f.iw); } };
  const ring = async (sel, label, dx) => page.evaluate(({ sel, label, dx }) => { document.querySelectorAll('.ring,.chip').forEach(e => e.remove()); const cells = sel.split(',').map(a => { a = a.trim(); const m = /^(\w+)!(.*)$/.exec(a); return document.querySelector(m ? `table[data-sheet="${m[1]}"] td[data-a="${m[2]}"]` : `td[data-a="${a}"]`); }).filter(Boolean); if (!cells.length) return 'miss';
    const host = cells[0].closest('.inner') || cells[0].closest('.paper'), hr = host.getBoundingClientRect(); const rs = cells.map(c => c.getBoundingClientRect()); const L = Math.min(...rs.map(r => r.left)), Tp = Math.min(...rs.map(r => r.top)), R = Math.max(...rs.map(r => r.right)), B = Math.max(...rs.map(r => r.bottom));
    const ring = document.createElement('div'); ring.className = 'ring'; ring.style.cssText = `left:${L - hr.left - 4}px;top:${Tp - hr.top - 4}px;width:${R - L}px;height:${B - Tp}px`; host.appendChild(ring);
    const chip = document.createElement('div'); chip.className = 'chip'; chip.textContent = label; if (dx === 'top') { chip.style.cssText += ';position:fixed;right:30px;top:16px;left:auto;font-size:24px'; document.body.appendChild(chip); } else { chip.style.left = (L - hr.left + (dx || 0)) + 'px'; chip.style.top = (B - hr.top + 10) + 'px'; host.appendChild(chip); } const sc = host.closest('.scroller'), vr = sc ? sc.getBoundingClientRect() : { left: 0, right: innerWidth }; return (L >= vr.left - 1 && R <= vr.right + 1 && R <= innerWidth) ? 'ok' : `clipped L=${L.toFixed(0)} R=${R.toFixed(0)} view=${vr.left.toFixed(0)}..${vr.right.toFixed(0)} iw=${innerWidth}`; }, { sel, label, dx });
  const PW = [26, 5, 28, 17, 22, 38, 8, 10, 17, 13, 13, 13, 13];
  const procView = (m, rows, title, sub) => show(title, sub, `<div class="paper"><div class="scroller" id="sc"><div class="inner">${sheetHtml(m, 'Process', X, { maxCol: 12, maxRow: rows, colWidths: PW, display: (a, c, t) => (c.t === 'z' ? '' : t) })}</div></div></div>`);
  const pan = async (addr, back) => { await page.evaluate(({ addr, back }) => { const sc = document.getElementById('sc'), td = document.querySelector(`td[data-a="${addr}"]`); sc.scrollTo({ left: Math.max(0, td.offsetLeft - (back || 0)), behavior: 'smooth' }); }, { addr, back }); await hold(1500); };
  const rangeAddrs = (c1, r1, c2, r2) => { const o = []; for (let r = r1; r <= r2; r++) for (let c = c1.charCodeAt(0); c <= c2.charCodeAt(0); c++) o.push(String.fromCharCode(c) + r); return o.join(','); };
  const card = (h, lines, ms) => show('', '', `<div class="card"><h1>${TR(h)}</h1>${lines.map(l => `<p>${TR(l)}</p>`).join('')}</div>`).then(() => hold(ms));
  let rings = 0, ringOk = 0; const RP = JSON.parse(process.env.RING_PRE || '{}'), RE = JSON.parse(process.env.RING_POST || '{}'), rpre = l => Object.keys(RP).filter(k => l.startsWith(k)).map(k => RP[k] * 1000)[0] || 0, rpost = l => Object.keys(RE).filter(k => l.startsWith(k)).map(k => RE[k] * 1000)[0] || 0;
  const R = async (...a) => { if (rpre(a[1])) await page.waitForTimeout(rpre(a[1])); say('§FILM3_RING t=' + now().toFixed(2) + ' ' + a[1]); rings++; { const rr = await ring(a[0], TR(a[1]), a[2]); if (rr === 'ok') ringOk++; else say('§FILM3_RING_CLIPPED ' + a[1] + ' -> ' + rr); } if (rpost(a[1])) await page.waitForTimeout(rpost(a[1])); };
  try {
    await beat('intro', 'intro card');
    await card('Excel. The accountant\u2019s killer app.', ['Accountants mastered it. The ERP, not so much.', 'Basic SQL joins the two, so accountants can do the report themselves.'], 13000);
    await beat('hook', 'the finished PDF');
    await show('The finished report', 'one page, produced from the Excel below', `<div style="text-align:center"><img style="height:690px;box-shadow:0 4px 24px #000a" src="data:image/png;base64,${png}"></div>`); await hold(5000);
    await beat('design', 'BACKUP sheet = the design');
    await show('The design lives in Excel — sheet “BACKUP”', 'plain Excel: fills, borders, merged cells, number formats', `<div class="paper">${sheetHtml(OM, 'BACKUP', X, { maxCol: 7, maxRow: 20 })}</div>`); await hold(1500);
    await R('B2', 'a merged, filled title band'); await hold(2200); await R('B3', 'another fill colour, just a cell format'); await hold(2000);
    await R(rangeAddrs('B', 6, 'G', 7), 'three boxes: fill + thick border'); await hold(2400); await R(rangeAddrs('B', 10, 'G', 11), 'header colours'); await hold(2000);
    await R(rangeAddrs('B', 12, 'G', 14), 'zebra rows, number formats'); await hold(2200); await R(rangeAddrs('B', 15, 'G', 15), 'totals row with a double rule'); await hold(2200); await R(rangeAddrs('B', 19, 'G', 20), 'signature boxes'); await hold(2200);
    await beat('rules', 'Process sheet');
    await procView(model, 12, 'The rules — sheet “Process”', 'one row per question');
    await hold(1800);
    await R('C1', 'SELECT: what to ask'); await hold(1800); await R('D1,F1', 'TABLE / WHERE: where, which rows'); await hold(1600); await pan('G1', 120); await R('H1', 'Direction: where the answer goes'); await hold(2200);
    await R('H2,H3,H4,H5,H6', 'S = one value into one cell'); await hold(2400); await R('H7,H8', '> = a list across'); await hold(2200); await R('H9,H12', 'V = down · C10+B12 = a whole grid'); await hold(3200);
    await beat('cross', 'Direction Add1+Add2: C10+B12');
    await show('The killer feature — Direction  “Add1 + Add2”', 'two addresses joined by a plus build a whole grid', `<div style="padding:0 30px"><div class="lbl">${TR('Process, after the run (only the three rows that matter)')}</div><div class="paper" style="margin:0"><div class="scroller" id="sc" style="width:1330px"><div class="inner">${sheetHtml(OM, 'Process', X, { maxCol: 12, maxRow: 12, colWidths: PW, display: (a, c, t) => (c.t === 'z' ? '' : t) })}</div></div></div><div class="lbl" style="margin-top:14px">${TR('Output, the grid they build')}</div><div class="paper" style="margin:0">${sheetHtml(OM, 'Output', X, { maxCol: 7, maxRow: 15 })}</div></div>`);
    await page.evaluate(() => { const t = document.querySelector('table[data-sheet="Process"]'); [...t.rows].forEach((r, i) => { if ([2, 3, 4, 5, 6, 8, 10, 11].includes(i + 1)) r.style.display = 'none'; }); const o = document.querySelector('table[data-sheet="Output"]'); [...o.rows].forEach((r, i) => { if (i + 1 <= 9) r.style.display = 'none'; }); });
    await hold(800); await pan('G1', 0);
    await R('H12', 'Direction = C10 + B12  (Add1 + Add2)', 'top'); await hold(2600);
    await R('G7,I7,J7,K7,L7', 'Add1 = C10: the accounts start here and run ACROSS', 'top'); await hold(3600);
    await R('G9,I9,J9,K9', 'Add2 = B12: the source tables start here and run DOWN', 'top'); await hold(3600);
    await R('Output!C12,Output!D12,Output!E12,Output!F12,Output!C13,Output!D13,Output!E13,Output!F13,Output!C14,Output!D14,Output!E14,Output!F14', 'each answer lands where its account and its table cross', 'top'); await hold(3600);
    await beat('link', 'the Excel link: Input -> Process');
    await show('Where the answer lands — sheet “Input”', 'an ordinary Excel link', `<div class="fbar"><b>B7</b><span>fx</span><span id="fx">${model.Sheets.Input.B7.v}</span></div><div class="paper">${sheetHtml(model, 'Input', X, { maxCol: 7, maxRow: 20 })}</div>`); await hold(2000);
    await R('B7', 'this cell shows the rule’s name'); await hold(1800); await page.evaluate(f => { document.getElementById('fx').textContent = '=' + f; }, model.Sheets.Input.B7.f); await hold(3000);
    await show('Where the name comes from — sheet “Process”', 'column A is also just an Excel formula', `<div class="fbar"><b>A4</b><span>fx</span><span>=${model.Sheets.Process.A4.f}</span></div><div class="paper"><div class="scroller"><div class="inner">${sheetHtml(model, 'Process', X, { maxCol: 12, maxRow: 8, colWidths: PW })}</div></div></div>`);
    await R('A4', 'select text + row number'); await hold(3600);
    await beat('run', 'engine run, real log');
    const term = [...preLines, twin, ...run.S.log.filter(l => / Address is /.test(l)).slice(0, 3), '… ' + (addrLines - 3) + ' more Address lines', pdfr, pdfm, pdfc].map(l => String(l).slice(0, 118));
    await show('Run it', 'the engine reads the links, asks the questions, paints the Output', '<div class="term" id="t"></div>');
    for (const l of term) { await page.evaluate(x => { const t = document.getElementById('t'); const s = document.createElement('div'); s.textContent = x; t.appendChild(s); }, l); await hold(800); } await hold(1000);
    await procView(OM, 12, 'After the run — the same Process sheet', 'the engine filled ADDRESS and VALUES by itself'); await hold(1200); await pan('G1', 60);
    await R('G2,G3,G4,G5,G6', 'ADDRESS: found through the Input links'); await hold(2600); await R('I2,I3,I4,I5,I6', 'VALUES: the exact values each SQL returned'); await hold(2600); await pan('J1', 700); await R('I7,J7,K7,L7', 'a list: one answer per column'); await hold(2800);
    await beat('sources', 'where each part came from');
    await show('Every part has a source', 'the finished sheet, after the run', `<div class="paper">${sheetHtml(OM, 'Output', X, { maxCol: 7, maxRow: 20 })}</div>`); await hold(1500);
    await R('B3', 'company name ← the client table'); await hold(2600); await R('B4', 'period ← the two dates you pick'); await hold(2600);
    await R(rangeAddrs('B', 6, 'G', 7), 'three boxes ← three SQL answers'); await hold(3200); await R(rangeAddrs('C', 10, 'F', 11), 'account numbers + names ← the account table'); await hold(3000);
    await R(rangeAddrs('B', 12, 'B', 14), 'rows ← source table of each posting'); await hold(2800); await R(rangeAddrs('C', 12, 'F', 14), 'grid ← one rule: C10+B12'); await hold(3200); await R(rangeAddrs('G', 12, 'G', 15) + ',' + rangeAddrs('C', 15, 'F', 15), 'totals ← plain Excel SUM'); await hold(3200);
    await beat('empty', 'blank means no posting');
    const blanks = ['C', 'D', 'E', 'F'].flatMap(c => [12, 13, 14].map(r => c + r)).filter(a => gv(OM, a) == null);
    await R(blanks.join(','), `${blanks.length} blank cells: no posting, not a made-up zero`); await hold(5200);
    await beat('edit', 'edit one rule, no other change');
    const gridOf = m => `<div class="paper" style="padding:6px">${sheetHtml(m, 'Output', X, { maxCol: 7, maxRow: 15 })}</div>`;
    await show('Change one rule — nothing else', 'in Process, the account list loses 14120', `<style>.two .paper{zoom:.6}</style><div class="two"><div><div class="lbl">${TR('Before')}</div>${gridOf(OM)}</div><div><div class="lbl">${TR('After')}</div>${gridOf(ed.m)}</div></div>`);
    await hold(9000);
    await beat('trust', 'checked'); const tl = [x2, pdfm, pdfc, pfv, ev].map(l => l.replace(/^§/, '')).filter(l => !/NOT-FOUND/.test(l));
    await show('Checked, not eyeballed', 'each line below is a test that ran', '<div class="term" id="t" style="height:420px"></div>');
    for (const l of tl) { await page.evaluate(x => { const t = document.getElementById('t'); const s = document.createElement('div'); s.textContent = x; t.appendChild(s); }, l.slice(0, 118)); await hold(1300); } await hold(3000);
    await beat('close', 'closing card'); await card('Design it in Excel. Get the same layout in the PDF.', ['Name the rule in Process. Link it in Input.', 'Add1 + Add2 builds the grid. Values shows the proof.', 'Your Excel. Your design. Our data.'], 17000); await beat('end', '');
    say('§FILM3_LANG ' + FILM_LANG + ' missingTranslations=' + MISSING.length + (MISSING.length ? ' WRONG: ' + [...new Set(MISSING)].join(' | ') : ' OK')); say('§FILM3_RINGS ' + rings + ' ok=' + ringOk + (rings === ringOk ? ' OK' : ' WRONG')); say('§FILM3_FIT screens=' + fits + ' clipped=' + fitBad + (fitBad === 0 ? ' OK' : ' WRONG'));
  } catch (e) { say('§FILM3_ERROR ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
  await cdp.send('Page.stopScreencast').catch(() => {}); await hold(300); const endTs = Date.now() / 1000;
  const lines = []; frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); }); if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n'); const mp4 = path.join(OUT, 'NinjaExcel_designer_raw.mp4');
  try { cp.execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]); say('§FILM3_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4); } catch (e) { say('§FILM3_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'film3.log'), LOG.join('\n') + '\n'); await browser.close();
})();
