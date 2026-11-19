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
//   P2b every ### heading not right after its ## starts a page · P6 the cover (.uat-cover) is page 1 alone · P7 every page reads "Page i of N" with the true N
//   P8 no link in the PDF points at the print server; every link into the site resolves to a built page (and its #id) · P9 every outside link answers 2xx/3xx
//   (spec: prompts/DOCS_DEPLOY_GUARD.md "Printable guides, 2026-11-19 SPEC")
// PRINT_BREAK=1 removes the sheet's break-after before printing: P1 must FAIL. PRINT_BREAK=clip makes every table wider than the page: P4 must FAIL.
// PRINT_BREAK=tables drops the keep-whole rule (P10) · PRINT_BREAK=links keeps the print-server links (P8) · =footer no footer (P7) · =cover the cover keeps no break-after (P6) · =h3 no section breaks (P2b). PRINT_NO_NET=1 skips P9 (printed, not PASS).
// usage: node scripts/guide/print_check.js --site <built site dir> --page <Name> --out <file.pdf>   exit 0 PASS · 1 FAIL · 3 INCONCLUSIVE / cannot run
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os'), cp = require('child_process');
const arg = k => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const SITE = arg('site'), NAME = arg('page'), OUT = arg('out'), BREAK = process.env.PRINT_BREAK === '1', CLIP = process.env.PRINT_BREAK === 'clip';
const BK = k => process.env.PRINT_BREAK === k, NO_NET = process.env.PRINT_NO_NET === '1';
// the public address of the site: links are written into the PDF under it, never under the print server (P8)
const PUBLIC = String(process.env.PRINT_PUBLIC || ((() => { try { return (fs.readFileSync(path.join(__dirname, '..', '..', 'mkdocs.yml'), 'utf8').match(/^site_url:\s*(\S+)/m) || [])[1]; } catch (e) { return ''; } })()) || '').replace(/\/?$/, '/');
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
    if (BK('cover')) await pg.addStyleTag({ content: '@media print { .uat-cover { break-after: auto !important; page-break-after: auto !important; } }' });
    if (BK('tables')) await pg.addStyleTag({ content: '@media print { .md-typeset table:not([class]) { break-inside: auto !important; page-break-inside: auto !important; } }' });   // P10 must FAIL
    if (BK('h3')) await pg.addStyleTag({ content: '@media print { .md-typeset h3 { break-before: auto !important; page-break-before: auto !important; } }' });
    // P8: a link that resolves to the print server is written under the public site_url (Chrome writes each link resolved against the page's own origin)
    const links = await pg.evaluate((pub, keep) => { const o = location.origin, out = [];
      document.querySelectorAll('a[href]').forEach(a => { const h = a.getAttribute('href'); if (!h || h.startsWith('#') || /^(mailto|javascript|data):/i.test(h) || !a.getClientRects().length) return;
        if (a.href.startsWith(o + '/')) { const rel = a.href.slice(o.length + 1); out.push({ rel, pub: pub + rel }); if (!keep && pub !== '/') a.setAttribute('href', pub + rel); } else out.push({ ext: a.href }); });
      return out; }, PUBLIC, BK('links'));
    const title = await pg.evaluate(() => ((document.querySelector('.md-typeset h1') || {}).innerText || document.title || '').replace(/¶/g, '').trim());
    let plan = null;
    if (mark) plan = await pg.evaluate(() => {   // invisible markers: absolutely placed (no space taken), 2px, white
      const css = 'position:absolute;font-size:2px;line-height:0;color:#fff;white-space:nowrap', put = (el, id, atEnd) => { const s = document.createElement('span'); s.setAttribute('style', css); s.textContent = id;
        // an END marker sits INSIDE its element's bottom-right corner (a marker after the last word overflowed the right edge and was itself clipped: a false P4 FAIL),
        // so it goes missing only when the element itself is cut off
        if (atEnd) { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; s.style.right = '0'; s.style.bottom = '0'; el.appendChild(s); } else el.insertBefore(s, el.firstChild); };
      const root = document.querySelector('.md-content .md-typeset') || document.body, P = { rows: [], heads: [], subs: [], sheet: null, cover: null };
      Array.from(root.querySelectorAll('table:not([class])')).forEach((t, ti) => Array.from(t.rows).forEach((r, ri) => { if (!r.cells.length) return; const id = 'qqR' + ti + 'X' + ri, text = r.cells[0].innerText.trim().slice(0, 40); put(r.cells[0], id + 'Aqq'); put(r.cells[r.cells.length - 1], id + 'Zqq', true);
        P.rows.push({ id, text }); }));
      const sheet = root.querySelector('.uat-sheet');
      Array.from(root.querySelectorAll('h2')).forEach((h, i) => { if (sheet && sheet.contains(h)) return; const text = h.innerText.replace(/¶/g, '').trim(); put(h, 'qqH' + i + 'qq'); P.heads.push({ id: 'qqH' + i + 'qq', text }); });
      const cover = root.querySelector('.uat-cover');
      Array.from(root.querySelectorAll('h3')).forEach((h, i) => { if ((sheet && sheet.contains(h)) || (cover && cover.contains(h))) return; const prev = h.previousElementSibling, text = h.innerText.replace(/¶/g, '').trim(); put(h, 'qqT' + i + 'qq'); P.subs.push({ id: 'qqT' + i + 'qq', text, afterChapter: !!prev && prev.tagName === 'H2' }); });
      if (cover) { const visible = el => el && getComputedStyle(el).display !== 'none' && el.innerText.trim(); put(cover, 'qqCAqq'); put(cover, 'qqCZqq', true); let a = cover.nextElementSibling; while (a && !visible(a)) a = a.nextElementSibling; if (a) put(a, 'qqCNEXTqq'); P.cover = { next: !!a }; }
      if (sheet) { put(sheet, 'qqSAqq'); put(sheet, 'qqSZqq', true); const visible = el => el && getComputedStyle(el).display !== 'none' && el.innerText.trim();
        let b = sheet.previousElementSibling; while (b && !visible(b)) b = b.previousElementSibling; let a = sheet.nextElementSibling; while (a && !visible(a)) a = a.nextElementSibling;
        if (b) put(b, 'qqBEFOREqq', true); if (a) put(a, 'qqAFTERqq'); P.sheet = { before: !!b, after: !!a }; }
      return P; });
    // P10: each table's height at the printed text width (A4 210 mm - 2 x 12 mm = 186 mm ~ 703 px), measured in print media, then the viewport is put back
    if (mark) { const vp = pg.viewport(); await pg.setViewport({ width: 703, height: 1000 });
      plan.tables = await pg.evaluate(() => { const root = document.querySelector('.md-content .md-typeset') || document.body;
        return Array.from(root.querySelectorAll('table:not([class])')).map((t, ti) => ({ ti, h: Math.round(t.getBoundingClientRect().height), n: t.rows.length, text: ((t.rows[1] || t.rows[0] || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40) })); });
      await pg.setViewport(vp); }
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');   // P7: "<title> · Page i of N" on every page (Chrome's print footer; @page margin boxes are not supported)
    await pg.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: !BK('footer'), headerTemplate: '<span></span>',
      footerTemplate: '<div style="font-size:8pt;width:100%;text-align:center;color:#444">' + esc(title) + ' · Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>' });
    await pg.close(); return Object.assign(plan || {}, { links });
  }
  const cleanPlan = await print(OUT, false); const plan = await print(MARKED, true); await br.close(); srv.close();
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
  // P10 (DOCS_DEPLOY_GUARD.md 2026-11-20): a table at most 90 % of the text height (297 mm - 2 x 14 mm = 269 mm ~ 1017 px) starts and ends on one page
  const LIMIT = Math.round(0.9 * 1017), tb = (plan.tables || []).map(t => { const rs = plan.rows.filter(r => r.id.startsWith('qqR' + t.ti + 'X')), a = rs.map(A_).filter(Boolean), z = rs.map(Z_).filter(Boolean);
    return Object.assign({}, t, { p0: a.length ? Math.min(...a) : 0, p1: z.length ? Math.max(...z) : 0 }); });
  const cut = tb.filter(t => t.h <= LIMIT && t.p1 > t.p0), long = tb.filter(t => t.h > LIMIT);
  if (!tb.length) say('§PRINT P10 not judged: no table measured'); else
  ck('P10 no table short enough for one page is cut across two (' + tb.length + ' tables, ' + long.length + ' taller than a page)', cut.length === 0,
    { cut: cut.map(t => t.text + ' h=' + t.h + ' pages ' + t.p0 + '-' + t.p1).slice(0, 10), nCut: cut.length, taller: long.map(t => t.text + ' h=' + t.h + ' pages ' + t.p0 + '-' + t.p1).slice(0, 10) });
  ck('P4 no row or last column is cut off', missing.length === 0, { missing: missing.map(r => r.text + (A_(r) ? ' (end missing)' : ' (start missing)')).slice(0, 6), nMissing: missing.length });
  // P5
  const first = t => (t.split('\n').map(l => l.replace(/qq[A-Z0-9]+qq/g, '').trim()).find(Boolean) || ''), differ = clean.map((t, i) => [i + 1, first(t), first(marked[i] || '')]).filter(x => x[1] !== x[2]);
  ck('P5 the published print and the marked print paginate alike', clean.length === marked.length && differ.length === 0, { pages: [clean.length, marked.length], differ: differ.slice(0, 4) });
  // P2b
  const badSubs = plan.subs.filter(h => !h.afterChapter && (!at[h.id] || firstOn(at[h.id]) !== h.id));
  if (plan.subs.length) ck('P2b every section heading (###) not right after its chapter heading starts a page (' + plan.subs.filter(h => !h.afterChapter).length + ' judged)', badSubs.length === 0, { notAtTop: badSubs.map(h => h.text + ' (page ' + at[h.id] + ')').slice(0, 6) });
  else say('§PRINT P2b not judged: the page has no ### heading');
  // P6
  if (plan.cover) ck('P6 the cover is page 1, alone', at.qqCAqq === 1 && at.qqCZqq === 1 && (!plan.cover.next || at.qqCNEXTqq === 2), { coverPages: [at.qqCAqq, at.qqCZqq], nextStartsOn: at.qqCNEXTqq });
  else say('§PRINT P6 not judged: the page has no .uat-cover');
  // P7
  const N = clean.length, noNum = clean.map((t, i) => [i + 1, (t.match(/Page (\d+) of (\d+)/) || [])]).filter(([i, m]) => Number(m[1]) !== i || Number(m[2]) !== N);
  ck('P7 every page reads "Page i of ' + N + '"', noNum.length === 0, { wrong: noNum.slice(0, 6).map(([i, m]) => i + ':' + (m[0] || 'none')) });
  // P8
  const raw = fs.readFileSync(OUT).toString('latin1'), uris = Array.from(new Set((raw.match(/\/URI\s*\(((?:\\\)|[^)])*)\)/g) || []).map(u => u.replace(/^\/URI\s*\(|\)$/g, '').replace(/\\([()\\])/g, '$1'))));
  const toServer = uris.filter(u => /^https?:\/\/(127\.0\.0\.1|localhost)[:/]/i.test(u)), inSite = cleanPlan.links.filter(l => l.rel), deadIn = [];
  for (const l of inSite) { const [p, frag] = l.rel.split('#'), file = path.join(SITE, decodeURIComponent(p.split('?')[0]) + (p === '' || p.endsWith('/') ? 'index.html' : ''));
    if (!fs.existsSync(file)) { deadIn.push(l.rel + ' (no page)'); continue; } if (frag && !fs.readFileSync(file, 'utf8').includes('id="' + decodeURIComponent(frag) + '"')) deadIn.push(l.rel + ' (no #' + frag + ')');
    if (!BK('links') && !uris.includes(l.pub)) deadIn.push(l.rel + ' (not written under ' + PUBLIC + ')'); }
  ck('P8 no link points at the print server; every link into the site opens (' + inSite.length + ' into the site, ' + uris.length + ' in the PDF)', !!PUBLIC && toServer.length === 0 && deadIn.length === 0, { public: PUBLIC, toPrintServer: toServer.slice(0, 4), dead: deadIn.slice(0, 6) });
  // P9
  const outside = uris.filter(u => /^https?:/i.test(u) && !u.startsWith(PUBLIC) && !toServer.includes(u));
  if (NO_NET) say('§PRINT P9 not judged (PRINT_NO_NET=1): ' + outside.length + ' outside links unchecked');
  else { const bad = [], unknown = [];
    for (const u of outside) { let code = '000'; for (let k = 0; k < 2 && !/^[23]/.test(code); k++) code = (cp.spawnSync('curl', ['-s', '-o', '/dev/null', '-L', '-w', '%{http_code}', '--max-time', '30', u], { encoding: 'utf8' }).stdout || '000').trim();
      if (code === '000') unknown.push(u); else if (!/^[23]/.test(code)) bad.push(code + ' ' + u); say('§PRINT_LINK ' + code + ' ' + u); }
    if (unknown.length) say('§PRINT P9 INCONCLUSIVE for ' + unknown.length + ' link(s) (no answer): ' + unknown.slice(0, 4).join(' '));
    ck('P9 every outside link answers (' + outside.length + ' checked)', bad.length === 0 && unknown.length === 0, { dead: bad.slice(0, 6), noAnswer: unknown.length }); }
  if (process.env.PRINT_KEEP) { fs.copyFileSync(MARKED, process.env.PRINT_KEEP); say('§PRINT marked print kept at ' + process.env.PRINT_KEEP); }   // PRINT_KEEP=<file>: the marked PDF, to read a FAIL
  fs.rmSync(TMP, { recursive: true, force: true });
  say('§PRINT_VERDICT ' + (fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' pdf=' + OUT); process.exit(fails ? 1 : 0);
})().catch(e => stop(3, 'STOPPED ' + (e.stack || e).toString().slice(0, 400)));
