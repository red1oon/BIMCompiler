#!/usr/bin/env node
// ⚠ DO NOT REMOVE — W-GUIDE-PRINT (prompts/DOCS_DEPLOY_GUARD.md §"Printable guides"). READ THE §PRINT LINES; the exit code is not evidence.
// THE ISSUE IT PROVES OR DISPROVES: "the published PDF of a printable guide has a page break, a split or a cut-off the reader would trip on".
// Prints a BUILT docs page twice in headless Chrome (print media, A4): clean (the file that is published) and with invisible markers, then reads the
// marked PDF page by page (pdftotext):
//   P1 the checklist sheet (.uat-sheet) on its own: its start and end markers on ONE page, the element before it ends earlier, the one after starts later
//   P2 every ## heading outside the sheet is the first marker on its page (a chapter starts a page)
//   P3 every table row's start and end markers on the same page (no row split across pages)
//   P4 every row's markers present (a missing end marker = the row's last column was cut off). Markers are qq<ID>qq: lowercase ends that cannot run into a neighbour (two adjacent QQ…QQ markers once read as one, a false P4 FAIL)
//   P5 the clean and the marked prints agree: same page count, same first text line on every page (the markers move nothing)
// PRINT_BREAK=1 removes the sheet's break-after before printing: P1 must FAIL. PRINT_BREAK=clip makes every table wider than the page: P4 must FAIL.
// usage: node scripts/guide/print_check.js --site <built site dir> --page <Name> --out <file.pdf>   exit 0 PASS · 1 FAIL · 3 INCONCLUSIVE / cannot run
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const SITE = arg('site'), NAME = arg('page'), OUT = arg('out'), BREAK = process.env.PRINT_BREAK === '1', CLIP = process.env.PRINT_BREAK === 'clip';
const say = s => console.log(s); let judged = 0, fails = 0;
const ck = (id, ok, info) => { judged++; if (!ok) fails++; say('§PRINT ' + id + ' ' + (ok ? 'PASS' : 'FAIL') + ' ' + JSON.stringify(info).slice(0, 500)); };
const stop = (code, why) => { say('§PRINT_VERDICT ' + (code === 3 ? 'INCONCLUSIVE' : 'FAIL') + ' ' + why); process.exit(code); };
(async () => {
  if (!SITE || !NAME || !OUT) stop(3, 'usage: --site <dir> --page <Name> --out <file.pdf>');
  let puppeteer; try { puppeteer = require(path.join(process.env.HOME, 'bim-compiler', 'node_modules', 'puppeteer')); } catch (e) { try { puppeteer = require('puppeteer'); } catch (e2) { stop(3, 'puppeteer not found'); } }
  if (cp.spawnSync('pdftotext', ['-v'], { encoding: 'utf8' }).error) stop(3, 'pdftotext not found (poppler-utils)');
  if (!fs.existsSync(path.join(SITE, NAME, 'index.html'))) stop(3, 'no built page ' + path.join(SITE, NAME, 'index.html'));
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };
  const srv = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; fs.readFile(path.join(SITE, p), (e, b) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(b); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const URL = 'http://127.0.0.1:' + srv.address().port + '/' + NAME + '/', TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'guideprint-')), MARKED = path.join(TMP, 'marked.pdf');
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  async function print(file, mark) {
    const pg = await br.newPage(); await pg.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 }); await pg.emulateMediaType('print');
    if (BREAK) await pg.addStyleTag({ content: '@media print { .uat-sheet { break-after: auto !important; page-break-after: auto !important; } }' });
    if (CLIP) await pg.addStyleTag({ content: '@media print { .md-typeset table:not([class]) td:first-child { min-width: 150mm !important; } }' });   // PRINT_BREAK=clip: tables wider than the page
    let plan = null;
    if (mark) plan = await pg.evaluate(() => {   // invisible markers: absolutely placed (no space taken), 2px, white
      const css = 'position:absolute;font-size:2px;line-height:0;color:#fff;white-space:nowrap', put = (el, id, atEnd) => { const s = document.createElement('span'); s.setAttribute('style', css); s.textContent = id;
        // an END marker sits INSIDE its element's bottom-right corner (a marker after the last word overflowed the right edge and was itself clipped: a false P4 FAIL),
        // so it goes missing only when the element itself is cut off
        if (atEnd) { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; s.style.right = '0'; s.style.bottom = '0'; el.appendChild(s); } else el.insertBefore(s, el.firstChild); };
      const root = document.querySelector('.md-content .md-typeset') || document.body, P = { rows: [], heads: [], sheet: null };
      Array.from(root.querySelectorAll('table:not([class])')).forEach((t, ti) => Array.from(t.rows).forEach((r, ri) => { if (!r.cells.length) return; const id = 'qqR' + ti + 'X' + ri, text = r.cells[0].innerText.trim().slice(0, 40); put(r.cells[0], id + 'Aqq'); put(r.cells[r.cells.length - 1], id + 'Zqq', true);
        P.rows.push({ id, text }); }));
      const sheet = root.querySelector('.uat-sheet');
      Array.from(root.querySelectorAll('h2')).forEach((h, i) => { if (sheet && sheet.contains(h)) return; const text = h.innerText.replace(/¶/g, '').trim(); put(h, 'qqH' + i + 'qq'); P.heads.push({ id: 'qqH' + i + 'qq', text }); });
      if (sheet) { put(sheet, 'qqSAqq'); put(sheet, 'qqSZqq', true); const visible = el => el && getComputedStyle(el).display !== 'none' && el.innerText.trim();
        let b = sheet.previousElementSibling; while (b && !visible(b)) b = b.previousElementSibling; let a = sheet.nextElementSibling; while (a && !visible(a)) a = a.nextElementSibling;
        if (b) put(b, 'qqBEFOREqq', true); if (a) put(a, 'qqAFTERqq'); P.sheet = { before: !!b, after: !!a }; }
      return P; });
    await pg.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true }); await pg.close(); return plan;
  }
  await print(OUT, false); const plan = await print(MARKED, true); await br.close(); srv.close();
  const pages = f => { const n = Number((cp.execFileSync('pdfinfo', [f], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/) || [0, 0])[1]); const out = [];
    for (let i = 1; i <= n; i++) out.push(cp.execFileSync('pdftotext', ['-f', String(i), '-l', String(i), f, '-'], { encoding: 'utf8' })); return out; };
  const clean = pages(OUT), marked = pages(MARKED), at = {}, order = [];
  marked.forEach((t, i) => { (t.match(/qq[A-Z0-9]+qq/g) || []).forEach(m => { if (!(m in at)) at[m] = i + 1; order.push([i + 1, m]); }); });
  say('§PRINT page=' + NAME + ' clean_pages=' + clean.length + ' marked_pages=' + marked.length + ' rows=' + plan.rows.length + ' headings=' + plan.heads.length + ' sheet=' + !!plan.sheet + (BREAK ? ' (BREAK: the sheet keeps no break-after)' : CLIP ? ' (BREAK clip: tables wider than the page)' : '') + ' bytes=' + fs.statSync(OUT).size);
  if (!plan.rows.length || !plan.heads.length) stop(3, 'nothing to judge: rows=' + plan.rows.length + ' headings=' + plan.heads.length);
  // P1
  if (plan.sheet) { const s = at.qqSAqq, z = at.qqSZqq, b = at.qqBEFOREqq, a = at.qqAFTERqq;
    ck('P1 the checklist sheet is one page of its own', !!s && s === z && (!plan.sheet.before || (b && b < s)) && (!plan.sheet.after || (a && a > z)), { sheetPages: [s, z], beforeEndsOn: b, afterStartsOn: a }); }
  else say('§PRINT P1 not judged: the page has no .uat-sheet');
  // P2
  const firstOn = p => (order.find(o => o[0] === p) || [])[1], badHeads = plan.heads.filter(h => !at[h.id] || firstOn(at[h.id]) !== h.id);
  ck('P2 every chapter heading starts a page (' + plan.heads.length + ' judged)', badHeads.length === 0, { notAtTop: badHeads.map(h => h.text + ' (page ' + at[h.id] + ', first there: ' + firstOn(at[h.id]) + ')').slice(0, 6) });
  // P3 + P4
  const A_ = r => at[r.id + 'Aqq'], Z_ = r => at[r.id + 'Zqq'], missing = plan.rows.filter(r => !A_(r) || !Z_(r)), split = plan.rows.filter(r => A_(r) && Z_(r) && A_(r) !== Z_(r));
  ck('P3 no table row is split across pages (' + plan.rows.length + ' rows)', split.length === 0, { split: split.map(r => r.text + ' (pages ' + A_(r) + '-' + Z_(r) + ')').slice(0, 6) });
  ck('P4 no row or last column is cut off', missing.length === 0, { missing: missing.map(r => r.text + (A_(r) ? ' (end missing)' : ' (start missing)')).slice(0, 6), nMissing: missing.length });
  // P5
  const first = t => (t.split('\n').map(l => l.replace(/qq[A-Z0-9]+qq/g, '').trim()).find(Boolean) || ''), differ = clean.map((t, i) => [i + 1, first(t), first(marked[i] || '')]).filter(x => x[1] !== x[2]);
  ck('P5 the published print and the marked print paginate alike', clean.length === marked.length && differ.length === 0, { pages: [clean.length, marked.length], differ: differ.slice(0, 4) });
  if (process.env.PRINT_KEEP) { fs.copyFileSync(MARKED, process.env.PRINT_KEEP); say('§PRINT marked print kept at ' + process.env.PRINT_KEEP); }   // PRINT_KEEP=<file>: the marked PDF, to read a FAIL
  fs.rmSync(TMP, { recursive: true, force: true });
  say('§PRINT_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' pdf=' + OUT); process.exit(fails ? 1 : 0);
})().catch(e => stop(3, 'STOPPED ' + (e.stack || e).toString().slice(0, 400)));
