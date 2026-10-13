// ⚠ DO NOT REMOVE — Scope guard
// Scope: §TB-FILM (bim-compiler prompts/NINJAEXCEL_TEMPLATE_ENGINE.md) — RAW (silent, un-narrated) USER film of the NinjaExcel Report: the Thai trial-balance template, run from the
//   Excel Report pill inside the ERP on GardenWorld data, headless Chromium, CPU only (--disable-gpu). Structure copied from scripts/film_erp_first_setup.js (§ERP-FILM).
//   THE ISSUE this proves/disproves: can the whole user story (template -> pill -> dates -> Run -> painted report -> .xlsx + one-page PDF) be filmed end to end with no human at the
//   keyboard, with every number the narration will say printed as a §TB_FILM_FACT read from the real run / real downloaded files / the real gate logs.
// §-log first — READ <out>/tb_film.log (beats + facts) and <out>/tb_film.page.log before any conclusion. Exit code is not evidence.
// Run:  node scripts/film_ninja_excel.js <outDir>          env OOTB=<bim-ootb worktree root carrying the port> (default /tmp/wt-ninja-port)  NT=<bim-compiler worktree> (gate logs)
// Rules: no customer data (GardenWorld only); no invented numbers; no screenshots as evidence (frames are the deliverable, facts are the proof).
'use strict';
const os = require('os'), http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require(os.homedir() + '/bim-ootb/tests/node_modules/playwright');
const XLSX = require('/home/red1/bim-compiler/node_modules/xlsx');
const REPO = process.env.OOTB || '/tmp/wt-ninja-port', NT = process.env.NT || path.join(__dirname, '..');
const OUT = path.resolve(process.argv[2] || '.'); const FR = path.join(OUT, 'frames'); fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
const FROM = '2003-01-01', TO = '2003-12-31';
const LOG = [], PAGELOG = []; const say = (s) => { LOG.push(s); console.log(s); };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.png': 'image/png', '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.xlsx': 'application/octet-stream', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  fs.readFile(path.join(REPO, p), (e, buf) => { if (e) { res.writeHead(404); res.end('404 ' + p); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': buf.length }); res.end(buf); });
});
const CURSOR = `(() => { const go = () => { if (document.getElementById('__fc')) return;
  const c = document.createElement('div'); c.id = '__fc';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;' +
    'background:url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><path d=%22M3 2 L3 18 L7.5 14 L10.5 20.5 L13 19.4 L10.1 13 L16 13 Z%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221.4%22/></svg>") no-repeat';
  document.documentElement.appendChild(c);
  const at = (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; };
  addEventListener('mousemove', at, true);
  addEventListener('mousedown', (e) => { at(e); const r = document.createElement('div');
    r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ffb400;border-radius:50%;width:10px;height:10px;' +
      'left:' + (e.clientX - 5) + 'px;top:' + (e.clientY - 5) + 'px;transition:all .45s ease-out;opacity:1';
    document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; });
    setTimeout(() => r.remove(), 600); }, true); };
  if (document.documentElement) go(); else addEventListener('DOMContentLoaded', go); })();`;

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const CSS = `body{margin:0;background:#12151f;color:#e6ebf5;font-family:'Noto Sans Thai','Noto Sans',system-ui,sans-serif}
 .card{height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 90px}
 .card h1{font-size:54px;margin:0 0 26px;font-weight:600}.card p{font-size:30px;margin:8px 0;opacity:.88}.card small{font-size:20px;opacity:.6;margin-top:30px}
 .tabs{display:flex;gap:6px;padding:14px 22px 0}.tab{padding:9px 22px;border-radius:8px 8px 0 0;background:#232940;font-size:19px;cursor:pointer;border:1px solid #39425f;border-bottom:none}
 .tab.on{background:#38476e;font-weight:600}.sheet{margin:0 22px;padding:14px;background:#1b2033;border:1px solid #39425f;height:calc(100vh - 110px);overflow:auto}
 table{border-collapse:collapse;font-size:17px}td,th{border:1px solid #39425f;padding:3px 9px;white-space:nowrap;max-width:560px;overflow:hidden;text-overflow:ellipsis}
 th{background:#2b3452}.hl{background:#4a3b12}.note{font-size:22px;padding:10px 24px;opacity:.9}`;

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 4 / 3, acceptDownloads: true });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  page.on('console', m => PAGELOG.push(m.text())); page.on('pageerror', e => PAGELOG.push('PAGEERR ' + e)); page.on('dialog', async d => { PAGELOG.push('DIALOG ' + d.message()); await d.accept(); });
  const fact = (k, v) => say('§TB_FILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 300));
  const last = (n, re) => PAGELOG.slice(n).filter(l => re.test(l)).pop() || '';

  // ── screencast: every changed frame, timestamped ──
  const cdp = await ctx.newCDPSession(page); const frames = []; let T0 = null;
  cdp.on('Page.screencastFrame', async f => {
    const fn = path.join(FR, String(frames.length).padStart(6, '0') + '.jpg'); fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); frames.push({ fn, ts: f.metadata.timestamp });
    if (T0 === null) T0 = f.metadata.timestamp; cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  const now = () => (T0 === null ? 0 : Date.now() / 1000 - T0);
  const MIN = JSON.parse(process.env.BEAT_MIN || '{}'); let prev = null;
  const beat = async (id, note) => {
    if (prev && MIN[prev.id]) { const wait = MIN[prev.id] - (now() - prev.t); if (wait > 0) { say('§TB_FILM_HOLD after=' + prev.id + ' extra=' + wait.toFixed(2)); await page.waitForTimeout(wait * 1000); } }
    prev = { id, t: now() }; say('§TB_FILM_BEAT id=' + id + ' t=' + prev.t.toFixed(2) + ' ' + (note || ''));
  };
  const hold = (ms) => page.waitForTimeout(ms);
  async function glide(sel) {
    const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {});
    const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 28 }); await hold(220);
  }
  let clicks = 0, cursorOk = 0;
  async function hclick(sel) {
    await glide(sel);
    const c = await page.evaluate(() => { const e = document.getElementById('__fc'); return e ? [parseFloat(e.style.left), parseFloat(e.style.top)] : null; });
    const b = await page.locator(sel).first().boundingBox(); clicks++;
    if (c && b && Math.abs(c[0] - (b.x + b.width / 2)) < 2 && Math.abs(c[1] - (b.y + b.height / 2)) < 2) cursorOk++;
    else say('§TB_FILM_CURSOR_MISS sel=' + sel + ' cursor=' + JSON.stringify(c) + ' target=' + (b ? Math.round(b.x + b.width / 2) + ',' + Math.round(b.y + b.height / 2) : 'none'));
    await page.mouse.down(); await hold(70); await page.mouse.up(); await hold(350);
  }
  async function hdate(sel, iso) {                       // a date input: click it, then type the digits the way a person does (locale order is the browser's)
    await hclick(sel); await page.locator(sel).first().evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, iso); await hold(900);
  }
  const card = async (h, lines, small, ms) => {
    await page.setContent(`<style>${CSS}</style><div class="card"><h1>${esc(h)}</h1>${(lines || []).map(l => `<p>${esc(l)}</p>`).join('')}${small ? `<small>${esc(small)}</small>` : ''}</div>`);
    await hold(ms);
  };

  // facts that exist before the film: the template file and the gate logs
  const TPL = path.join(REPO, 'erp/ninja_tb_sample.xlsx');
  const wbT = XLSX.readFile(TPL, { cellStyles: false });
  const proc = XLSX.utils.sheet_to_json(wbT.Sheets.Process, { header: 1, defval: '', raw: false });
  const procRows = proc.slice(1).filter(r => String(r[7] || '').trim() && String(r[7]).trim() !== '').length;
  fact('template.sheets', wbT.SheetNames.length + ' [' + wbT.SheetNames.join(',') + ']'); fact('template.processRows', procRows);
  const claims = (() => { try { return fs.readFileSync(path.join(NT, 'scripts/ninja_template/logs/T_manual_claims.log'), 'utf8'); } catch (e) { return ''; } })();
  const parity = (() => { try { return cp.execFileSync('node', [path.join(NT, 'scripts/ninja_template/pdf_parity_fact.js')], { encoding: 'utf8' }).trim(); } catch (e) { return 'ERR ' + e.message.split('\n')[0]; } })();

  try {
    await page.goto('about:blank');
    // 1 — the pain
    await beat('pain', 'title card');
    await card('Opening · Movement · Closing', ['Every month the same job —', 'fixed by hand in a spreadsheet.'], 'NinjaExcel Report', 7000);

    // 2 — the template: the real workbook, sheet by sheet (built from the real file's cells)
    await beat('template', 'the Excel template: Input / Process / BACKUP');
    const sheetHtml = (name, maxR, maxC, cols) => {
      const ws = wbT.Sheets[name], g = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }); let h = '<table>';
      g.slice(0, maxR).forEach((row, ri) => { h += '<tr>' + (cols || row.slice(0, maxC).map((_, i) => i)).map(ci => `<${ri === 0 && name === 'Process' ? 'th' : 'td'}>${esc(String(row[ci] == null ? '' : row[ci]).slice(0, 150))}</${ri === 0 && name === 'Process' ? 'th' : 'td'}>`).join('') + '</tr>'; }); return h + '</table>';
    };
    const PCOLS = [2, 3, 5, 7];                     // SELECT, TABLE, WHERE, Direction
    await page.setContent(`<style>${CSS}</style><div class="tabs"><div class="tab on" id="t-Input">Input</div><div class="tab" id="t-Process">Process</div><div class="tab" id="t-BACKUP">BACKUP</div></div>
      <div class="sheet" id="sh">${sheetHtml('Input', 12, 6)}</div><div class="note" id="nt">Your layout. Tags like @el.value@4 say where each number goes.</div>
      <script>window.SH=${JSON.stringify({ Input: sheetHtml('Input', 12, 6), Process: sheetHtml('Process', 9, 9, PCOLS), BACKUP: sheetHtml('BACKUP', 12, 6) })};window.NT=${JSON.stringify({ Input: 'Your layout. Tags like @el.value@4 say where each number goes.', Process: 'One line per question: what to read, from which table, with which filter.', BACKUP: 'The master copy of the report. Make every edit here.' })};
      document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{const n=t.id.slice(2);document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));t.classList.add('on');document.getElementById('sh').innerHTML=SH[n];document.getElementById('nt').textContent=NT[n];}));</script>`);
    await page.evaluate(CURSOR); await page.mouse.move(700, 420); await hold(4500); await hclick('#t-Process'); await hold(6500); await hclick('#t-BACKUP'); await hold(5000);

    // 3 — the ERP: login → pill → template → dates → run
    await beat('login', 'GardenWorld → GardenAdmin');
    const n0 = PAGELOG.length;
    await page.goto(base + '/idempiere.html', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__idmpDb, null, { timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 20000 });
    await hold(1800);
    await hclick("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))");
    await page.waitForSelector('#idmp-login-step1:visible', { timeout: 8000 }); await hold(900);
    await hclick("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))");
    await page.waitForSelector('#idmp-login-step2:visible', { timeout: 8000 }); await hold(1200);
    await hclick('#idmp-login-ok');
    await page.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 10000 });
    await page.waitForSelector('#pill-ninja', { state: 'attached', timeout: 15000 }); await hold(1500);

    await beat('pill', 'Excel Report pill → sample report template');
    const dockHidden = await page.evaluate(() => { const d = document.getElementById('idmp-pill'); return !!d && getComputedStyle(d).display === 'none'; });
    if (dockHidden) { const trig = '#idmp-pill-trigger,[data-pill-trigger]'; if (await page.$(trig)) await hclick(trig); else await page.evaluate(() => document.querySelector('#idmp-pill-trigger,[data-pill-trigger]').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))); await hold(700); }
    await glide('#pill-ninja'); await hold(500);
    await page.evaluate(() => document.getElementById('pill-ninja').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));   // registry pills fire on pointerup
    await page.waitForSelector('#ninja-panel', { timeout: 10000 }); await hold(1800);
    await hclick('#np-sample-tb'); await page.waitForSelector('#np-run', { timeout: 10000 }); await hold(1800);

    await beat('dates', 'From / To');
    await hdate('#np-from', FROM); await hdate('#np-to', TO);
    fact('period', FROM + '..' + TO);
    await beat('run', 'Run report');
    const n1 = PAGELOG.length; await hclick('#np-run'); await page.waitForSelector('#np-rep-sum', { timeout: 60000 }); await hold(2500);
    const runLine = last(n1, /§NINJA_REPORT_RUN /); fact('run', runLine.replace('§NINJA_REPORT_RUN ', '')); fact('done', last(n1, /§NINJA_REPORT_DONE /).replace('§NINJA_REPORT_DONE ', ''));
    fact('panelSummary', await page.textContent('#np-rep-sum'));

    // 4 — the list grew
    await beat('painted', 'the report painted: one row per account');
    const grid = await page.evaluate(() => [...document.querySelectorAll('#np-preview tr')].map(tr => [...tr.children].map(td => td.textContent)));
    const accts = grid.slice(5).filter(r => /^\d+$/.test(r[0])).length; const totRow = grid.findIndex(r => r[0] === 'รวม');
    fact('accounts', accts); fact('totalsRowNo', totRow + 1);
    await page.evaluate(() => { document.getElementById('np-preview').scrollIntoView({ block: 'center' }); });
    await glide('#np-preview tr:nth-child(6)'); await hold(2500);
    await page.evaluate(() => { const d = document.querySelector('#np-preview').parentElement; d.scrollTo({ top: d.scrollHeight, behavior: 'smooth' }); }); await hold(4000);

    // 5 — proof
    await beat('proof', 'totals and the proof line');
    const parseN = (s) => { s = String(s).trim(); if (s === '' || s === '-') return 0; const neg = /^\(.*\)$/.test(s); const v = +s.replace(/[(),]/g, ''); return neg ? -v : v; };
    const T_ = grid[totRow]; fact('totalDebit', parseN(T_[3]).toFixed(2)); fact('totalCredit', parseN(T_[4]).toFixed(2)); fact('proofDebitMinusCredit', (parseN(T_[3]) - parseN(T_[4])).toFixed(2));
    await page.evaluate((ti) => { const rows = document.querySelectorAll('#np-preview tr'); [rows[ti], rows[ti + 2]].forEach(r => r && r.querySelectorAll('td').forEach(td => { td.style.background = '#5a4510'; })); }, totRow);
    await glide('#np-preview tr:nth-last-child(1)'); await hold(7000);

    // 6 — the one rule (the number comes from the real gate log, not from here)
    await beat('rule', 'edit BACKUP, never Output');
    const ru = /CLAIM_BACKUP_RULE (PASS|FAIL)/.exec(claims); fact('backupRuleGate', ru ? ru[0] : 'NOT-FOUND');
    await page.evaluate(({ h, lines, small, css }) => {         // overlay, so the ERP panel (and its download links) survive the card
      const d = document.createElement('div'); d.id = '__rulecard'; d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#12151f;color:#e6ebf5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:system-ui,sans-serif';
      d.innerHTML = '<h1 style="font-size:54px;margin:0 0 26px">' + h + '</h1>' + lines.map(l => '<p style="font-size:30px;margin:8px 0;opacity:.88">' + l + '</p>').join('') + '<small style="font-size:20px;opacity:.6;margin-top:30px">' + small + '</small>'; document.body.appendChild(d);
    }, { h: 'One rule', lines: ['Never type into Output.', 'It is rebuilt from BACKUP on every run.', 'Make your edits in BACKUP.'], small: 'checked by gate CLAIM_BACKUP_RULE' });
    await hold(8000); await page.evaluate(() => document.getElementById('__rulecard').remove()); await hold(500);

    // 7 — the files: download both, show the PDF page that the pill really produced
    await beat('pdf', 'downloads: .xlsx and one-page PDF');
    const dl = {};
    if (!(await page.$('#np-rep a[download]'))) throw new Error('report links not on the page after card (goBack lost the panel)');
    const links = await page.$$('#np-rep a[download]'); const names = await Promise.all(links.map(l => l.getAttribute('download')));
    for (let i = 0; i < links.length; i++) { await glide('#np-rep a[download]:nth-of-type(' + (i + 1) + ')').catch(() => {}); const [d] = await Promise.all([page.waitForEvent('download'), links[i].click()]); const f = path.join(OUT, names[i]); await d.saveAs(f); dl[names[i].split('.').pop()] = f; await hold(1200); }
    fact('downloads', Object.keys(dl).join('+'));
    const pages = (cp.spawnSync('pdfinfo', [dl.pdf], { encoding: 'utf8' }).stdout.match(/Pages:\s+(\d+)/) || [])[1]; const ptxt = cp.spawnSync('pdftotext', [dl.pdf, '-'], { encoding: 'utf8' }).stdout.replace(/\s+/g, '');
    const codes = grid.slice(5).filter(r => /^\d+$/.test(r[0])).map(r => r[0]); const missing = codes.filter(c => !ptxt.includes(c)).length;
    fact('pdfPages', pages); fact('pdfAccountCodesMissing', missing + ' of ' + codes.length); fact('pdfBytes', fs.statSync(dl.pdf).size); fact('xlsxBytes', fs.statSync(dl.xlsx).size);
    cp.execFileSync('pdftoppm', ['-r', '120', '-png', '-singlefile', dl.pdf, path.join(OUT, 'report_page')]);
    const png = fs.readFileSync(path.join(OUT, 'report_page.png')).toString('base64');
    await page.setContent(`<style>${CSS}</style><div class="note" style="text-align:center">The PDF the pill just produced — one page</div><div style="text-align:center"><img style="height:calc(100vh - 80px)" src="data:image/png;base64,${png}"></div>`);
    await hold(9000);

    // 8 — free software (numbers from the real gate logs; wording keeps "on the reference sheets")
    await beat('free', 'free open-source code, no PDF subscription');
    fact('pdfParity', parity.replace(/^§PDF_PARITY_FACT /, ''));
    await card('Free open-source, end to end', ['ExcelJS 4.4.0 · PDFKit 0.15.2 — MIT licence', 'Fonts: Liberation Sans, Noto Sans Thai/Lao — SIL OFL', 'No PDF-conversion subscription.', parity.replace(/^§PDF_PARITY_FACT /, 'Measured against a commercial converter: ')], 'figure is for our reference sheets', 10000);

    // 9 — close
    await beat('close', 'you keep your own design');
    await card('You design it in Excel.', ['We fill it in.'], 'NinjaExcel Report · GardenWorld demo data', 6000);
    await beat('end', '');
    say('§TB_FILM_CURSOR clicks=' + clicks + ' cursorOnTarget=' + cursorOk + (clicks === cursorOk ? ' OK' : ' WRONG'));
  } catch (e) { say('§TB_FILM_ERROR ' + e.message.split('\n')[0]); }

  await cdp.send('Page.stopScreencast').catch(() => {}); await hold(300);
  const endTs = Date.now() / 1000;
  fs.writeFileSync(path.join(OUT, 'tb_film.page.log'), PAGELOG.join('\n') + '\n');
  const lines = [];
  frames.forEach((f, i) => { const d = (i + 1 < frames.length ? frames[i + 1].ts : endTs) - f.ts; lines.push(`file '${f.fn}'`, `duration ${Math.max(d, 0.001).toFixed(4)}`); });
  if (frames.length) lines.push(`file '${frames[frames.length - 1].fn}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n') + '\n');
  const mp4 = path.join(OUT, 'NinjaExcelReport_raw.mp4');
  try {
    cp.execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=24,scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§TB_FILM_DONE frames=' + frames.length + ' dur=' + (endTs - (T0 || endTs)).toFixed(2) + ' out=' + mp4);
  } catch (e) { say('§TB_FILM_ERROR ffmpeg ' + String(e.message).split('\n')[0]); }
  fs.writeFileSync(path.join(OUT, 'tb_film.log'), LOG.join('\n') + '\n');
  await browser.close(); server.close();
})();
