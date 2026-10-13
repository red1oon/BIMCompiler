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
const SHOW = process.env.SHOW || ND + 'showcase', NTDIR = path.join(__dirname, 'ninja_template');
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
const LOG = [], say = s => { LOG.push(s); console.log(s); }, fact = (k, v) => say('§FILM3_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 300));
const ENV = Object.assign({}, process.env, { FROM: '2006-12-01 00:00:00.0', TO: '2006-12-31 00:00:00.0' });
const sh = (cmd, args) => cp.spawnSync(cmd, args, { encoding: 'utf8', env: ENV, cwd: NTDIR }).stdout;
const CSS = `body{margin:0;background:#12151f;color:#e6ebf5;font-family:'Liberation Sans','Noto Sans',system-ui,sans-serif;overflow:hidden}
 .top{padding:18px 30px 6px;font-size:30px;font-weight:600}.sub{padding:0 30px 10px;font-size:20px;opacity:.75}
 .paper{margin:6px 30px;padding:14px;background:#fff;display:inline-block;position:relative;box-shadow:0 4px 24px #000a}
 table.xs{border-collapse:collapse;table-layout:fixed;font-family:'Liberation Sans',Arial,sans-serif;color:#000}table.xs td{padding:1px 4px;overflow:hidden;white-space:nowrap;border:1px solid #e3e3e3;font-size:13px}
 .grid td{border:1px solid #39425f}.dark table.xs{background:#1b2033}.dark table.xs td{color:#e6ebf5;border:1px solid #39425f;font-size:15px;padding:3px 9px;background:#1b2033}
 .ring{position:absolute;border:4px solid #ffb400;border-radius:6px;box-shadow:0 0 0 3px #0008;pointer-events:none;transition:all .35s}
 .chip{position:absolute;background:#ffb400;color:#1a1a1a;font-weight:700;font-size:21px;padding:5px 12px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 10px #000a;transition:all .35s}
 .hl td{background:#5a4510!important;color:#fff!important}.fbar{margin:10px 30px;padding:8px 14px;background:#232940;border:1px solid #39425f;font-family:monospace;font-size:24px;display:flex;gap:20px}
 .fbar b{color:#ffb400}.term{margin:10px 30px;padding:18px 24px;background:#0b0e16;border:1px solid #39425f;font-family:'DejaVu Sans Mono',monospace;font-size:21px;line-height:1.55;white-space:pre-wrap;height:520px;overflow:hidden}
 .term .ok{color:#6fd98a}.term .k{color:#ffb400}.card{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.card h1{font-size:62px;margin:0 0 24px}.card p{font-size:32px;opacity:.85;margin:6px}
 .two{display:flex;gap:40px;padding:0 30px}.two>div{flex:1}.lbl{font-size:24px;margin:8px 0;font-weight:600}`;
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
  const show = (title, sub, body, cls) => page.setContent(`<style>${CSS}</style><div class="${cls || ''}"><div class="top">${title}</div><div class="sub">${sub || ''}</div>${body}</div>`);
  const ring = async (sel, label, dx) => page.evaluate(({ sel, label, dx }) => { document.querySelectorAll('.ring,.chip').forEach(e => e.remove()); const cells = sel.split(',').map(a => document.querySelector(`td[data-a="${a.trim()}"]`)).filter(Boolean); if (!cells.length) return 'miss';
    const host = document.querySelector('.paper'), hr = host.getBoundingClientRect(); const rs = cells.map(c => c.getBoundingClientRect()); const L = Math.min(...rs.map(r => r.left)), Tp = Math.min(...rs.map(r => r.top)), R = Math.max(...rs.map(r => r.right)), B = Math.max(...rs.map(r => r.bottom));
    const ring = document.createElement('div'); ring.className = 'ring'; ring.style.cssText = `left:${L - hr.left - 4}px;top:${Tp - hr.top - 4}px;width:${R - L}px;height:${B - Tp}px`; host.appendChild(ring);
    const chip = document.createElement('div'); chip.className = 'chip'; chip.textContent = label; chip.style.left = (L - hr.left + (dx || 0)) + 'px'; chip.style.top = (B - hr.top + 10) + 'px'; host.appendChild(chip); return 'ok'; }, { sel, label, dx });
  const rangeAddrs = (c1, r1, c2, r2) => { const o = []; for (let r = r1; r <= r2; r++) for (let c = c1.charCodeAt(0); c <= c2.charCodeAt(0); c++) o.push(String.fromCharCode(c) + r); return o.join(','); };
  const card = (h, lines, ms) => show('', '', `<div class="card"><h1>${h}</h1>${lines.map(l => `<p>${l}</p>`).join('')}</div>`).then(() => hold(ms));
  let rings = 0, ringOk = 0; const RP = JSON.parse(process.env.RING_PRE || '{}'), RE = JSON.parse(process.env.RING_POST || '{}'), rpre = l => Object.keys(RP).filter(k => l.startsWith(k)).map(k => RP[k] * 1000)[0] || 0, rpost = l => Object.keys(RE).filter(k => l.startsWith(k)).map(k => RE[k] * 1000)[0] || 0;
  const R = async (...a) => { if (rpre(a[1])) await page.waitForTimeout(rpre(a[1])); say('§FILM3_RING t=' + now().toFixed(2) + ' ' + a[1]); rings++; if ((await ring(...a)) === 'ok') ringOk++; if (rpost(a[1])) await page.waitForTimeout(rpost(a[1])); };
  try {
    await beat('hook', 'the finished PDF');
    await show('The finished report', 'one page, produced from the Excel below', `<div style="text-align:center"><img style="height:690px;box-shadow:0 4px 24px #000a" src="data:image/png;base64,${png}"></div>`); await hold(5000);
    await beat('design', 'BACKUP sheet = the design');
    await show('The design lives in Excel — sheet “BACKUP”', 'plain Excel: fills, borders, merged cells, number formats', `<div class="paper">${sheetHtml(OM, 'BACKUP', X, { maxCol: 7, maxRow: 20 })}</div>`); await hold(1500);
    await R('B2', 'a merged, filled title band'); await hold(2200); await R('B3', 'another fill colour, just a cell format'); await hold(2000);
    await R(rangeAddrs('B', 6, 'G', 7), 'three boxes: fill + thick border'); await hold(2400); await R(rangeAddrs('B', 10, 'G', 11), 'header colours'); await hold(2000);
    await R(rangeAddrs('B', 12, 'G', 14), 'zebra rows, number formats'); await hold(2200); await R(rangeAddrs('B', 15, 'G', 15), 'totals row with a double rule'); await hold(2200); await R(rangeAddrs('B', 19, 'G', 20), 'signature boxes'); await hold(2200);
    await beat('rules', 'Process sheet');
    await show('The rules — sheet “Process”', 'one row per question', `<div class="paper dark" style="max-width:1370px">${sheetHtml(model, 'Process', X, { maxCol: 8, maxRow: 12, display: (a, c, t) => (c.t === 'z' ? '' : t) })}</div>`, 'dark');
    await page.evaluate(() => { document.querySelectorAll('.paper').forEach(p => p.style.background = '#1b2033'); }); await hold(1800);
    await R('C1', 'SELECT: what to ask'); await hold(1800); await R('D1,F1', 'TABLE / WHERE: where, which rows'); await hold(2200); await R('H1', 'Direction: where the answer goes'); await hold(2200);
    await R('H2,H3,H4,H5,H6', 'S = one value into one cell'); await hold(2400); await R('H7,H8', '> = a list across'); await hold(2200); await R('H9,H12', 'V = down · C10+B12 = a whole grid'); await hold(3200);
    await beat('link', 'the Excel link: Input -> Process');
    await show('Where the answer lands — sheet “Input”', 'an ordinary Excel link', `<div class="fbar"><b>B7</b><span>fx</span><span id="fx">${model.Sheets.Input.B7.v}</span></div><div class="paper">${sheetHtml(model, 'Input', X, { maxCol: 7, maxRow: 20 })}</div>`); await hold(2000);
    await R('B7', 'this cell shows the rule’s name'); await hold(1800); await page.evaluate(f => { document.getElementById('fx').textContent = '=' + f; }, model.Sheets.Input.B7.f); await hold(3000);
    await show('Where the name comes from — sheet “Process”', 'column A is also just an Excel formula', `<div class="fbar"><b>A4</b><span>fx</span><span>=${model.Sheets.Process.A4.f}</span></div><div class="paper dark" style="max-width:1370px">${sheetHtml(model, 'Process', X, { maxCol: 8, maxRow: 8 })}</div>`, 'dark');
    await page.evaluate(() => { document.querySelectorAll('.paper').forEach(p => p.style.background = '#1b2033'); }); await R('A4', 'select text + row number'); await hold(3600);
    await beat('run', 'engine run, real log');
    const term = [...preLines, twin, ...run.S.log.filter(l => / Address is /.test(l)).slice(0, 3), '… ' + (addrLines - 3) + ' more Address lines', pdfr, pdfm, pdfc].map(l => String(l).slice(0, 118));
    await show('Run it', 'the engine reads the links, asks the questions, paints the Output', '<div class="term" id="t"></div>');
    for (const l of term) { await page.evaluate(x => { const t = document.getElementById('t'); const s = document.createElement('div'); s.textContent = x; t.appendChild(s); }, l); await hold(1100); } await hold(2500);
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
    await show('Change one rule — nothing else', 'in Process, the account list loses 14120', `<div class="two"><div><div class="lbl">Before</div>${gridOf(OM)}</div><div><div class="lbl">After</div>${gridOf(ed.m)}</div></div>`);
    await page.evaluate(() => document.querySelectorAll('.paper').forEach(p => p.style.transform = 'scale(.62)')); await page.addStyleTag({ content: '.two .paper{transform-origin:top left}' }); await hold(9000);
    await beat('trust', 'checked'); const tl = [x2, pdfm, pdfc, pfv, ev].map(l => l.replace(/^§/, '')).filter(l => !/NOT-FOUND/.test(l));
    await show('Checked, not eyeballed', 'each line below is a test that ran', '<div class="term" id="t" style="height:420px"></div>');
    for (const l of tl) { await page.evaluate(x => { const t = document.getElementById('t'); const s = document.createElement('div'); s.textContent = x; t.appendChild(s); }, l.slice(0, 118)); await hold(1300); } await hold(3000);
    await beat('close', 'your Excel your design'); await card('Your Excel. Your design.', ['Our data.'], 6000); await beat('end', '');
    say('§FILM3_RINGS ' + rings + ' ok=' + ringOk + (rings === ringOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§FILM3_ERROR ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
  await cdp.send('Page.stopScreencast').catch(() => {}); await hold(300); const endTs = Date.now() / 1000;
  const lines = []; frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); }); if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n'); const mp4 = path.join(OUT, 'NinjaExcel_designer_raw.mp4');
  try { cp.execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]); say('§FILM3_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4); } catch (e) { say('§FILM3_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'film3.log'), LOG.join('\n') + '\n'); await browser.close();
})();
