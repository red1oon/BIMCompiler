#!/usr/bin/env node
// ⚠ DO NOT REMOVE — W-GUIDE-VIEWER8 (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §14.6). Scope: the guide sections written 2026-11-17 for the 8 Viewer tools that had none (docs/BIMUserGuide.md: LOD400 Upgrade,
// Sanity and Egress, 4D Window, Issues, GI Preview (AO), Nav LOD (large bldgs); Human-Asset in the FM / Operate section). READ THE LOG: exit code alone is not evidence.
// Issue it proves/disproves: "the guide says something the tool does not do". The sections are DERIVED, so each claim must trace to the tool's own text.
//   V1 TRACE  — every row of scripts/guide/viewer8_sources.json: the guide phrase is in docs/BIMUserGuide.md AND its source phrase is in the named bim-ootb file (whitespace folded). X of N printed, N = the table.
//   V1b NAMES — each of the 8 palette names is a heading of the guide (7) or named in the FM / Operate section (Human-Asset): the very test build_howto.js applies (heading match, else body mention).
//   V4 LIVE   — (with --live) the real Viewer + Duplex, headless on the CPU: key Y / key E, and F1 + type Sanity / Egress + Enter -> the checklist panel opens and names it; key I -> the Issues panel is active. These are
//               the ways of opening the guide's text states, so a wrong "how to open" fails here (§14.7 gave Sanity and Egress real keys; before it the help printed S, which took a screenshot).
//   RED CONTROL — a planted guide phrase absent from the guide and a planted source phrase absent from its file must FAIL, or V1 proves nothing.
// usage: NODE_PATH=<bim-ootb>/node_modules:~/bim-compiler/node_modules node scripts/guide/witness_guide_viewer8.js <bim-ootb tree> [--live]
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const TREE = path.resolve(process.argv[2] || ''), LIVE = process.argv.includes('--live');
const ROOT = path.join(__dirname, '..', '..');
if (!process.argv[2] || !fs.existsSync(path.join(TREE, 'viewer', 'panels.js'))) { console.log('§W-GUIDE-VIEWER8 INCONCLUSIVE no bim-ootb tree given — nothing judged'); process.exit(2); }
const { Witness } = require(path.join(TREE, 'witness_kit', 'contract.js'));
const fold = (s) => String(s).replace(/\s+/g, ' ');
const GUIDE = fold(fs.readFileSync(path.join(ROOT, 'docs', 'BIMUserGuide.md'), 'utf8'));
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'viewer8_sources.json'), 'utf8'));
const SRC = {}; const src = (f) => SRC[f] || (SRC[f] = fold(fs.readFileSync(path.join(TREE, f), 'utf8')));
const rows = T.rows.map((r) => ({ guide: r.guide, file: r.file, source: r.source, kind: r.kind, inGuide: GUIDE.indexOf(fold(r.guide)) >= 0, inSource: src(r.file).indexOf(fold(r.source)) >= 0 }));
console.log('§GUIDE_VIEWER8 rows=' + rows.length + ' files=' + [...new Set(rows.map((r) => r.file))].join(','));
let fails = 0; const ck = (id, ok, msg) => { console.log((ok ? '§PASS ' : '§FAIL ') + id + ' ' + msg); if (!ok) fails++; };
const res = Witness('GUIDE-VIEWER8')
  .population(() => rows)
  .schema({ type: 'object', required: ['guide', 'file', 'source', 'inGuide', 'inSource'], properties: { guide: { type: 'string' }, file: { type: 'string' }, source: { type: 'string' } } })
  .invariant('V1 every row: the guide phrase is in the guide (' + rows.length + ' rows)', (rs) => { const bad = rs.filter((r) => !r.inGuide); bad.forEach((r) => console.log('  not in guide: ' + JSON.stringify(r.guide))); return !bad.length; })
  .invariant('V1 every row: the source phrase is in its bim-ootb file', (rs) => { const bad = rs.filter((r) => !r.inSource); bad.forEach((r) => console.log('  not in ' + r.file + ': ' + JSON.stringify(r.source))); return !bad.length; })
  .redControl((rs) => rs.map((r, i) => (i === 0 ? Object.assign({}, r, { inGuide: GUIDE.indexOf('a phrase the guide never says 9f3c') >= 0 }) : (i === 1 ? Object.assign({}, r, { inSource: src(r.file).indexOf('a phrase the source never holds 9f3c') >= 0 }) : r))))
  .run();
if (res.fail) fails += res.fail;
// V1b — the build_howto.js rule on the live pill list: a heading that contains the name, else a body mention
const panels = fs.readFileSync(path.join(TREE, 'viewer', 'panels.js'), 'utf8');
const NAMES = { lod400: 'LOD400 Upgrade', hbaFM: 'Human-Asset', sanity: 'Sanity', egress: 'Egress', sched4d: '4D Window', 'gi-preview': 'GI Preview (AO)', dlodnav: 'Nav LOD (large bldgs)', issues: 'Issues' };
const secs = fs.readFileSync(path.join(ROOT, 'docs', 'BIMUserGuide.md'), 'utf8').split(/^(?=#{2,4} )/m).map((b) => ({ head: (b.match(/^#{2,4} (.*)/) || [])[1] || '', body: b }));
Object.keys(NAMES).forEach((id) => {
  const pn = (new RegExp("\\{ id: '" + id.replace(/[-]/g, '\\-') + "',\\s+name: '([^']+)'").exec(panels) || [])[1];
  const byHead = secs.filter((s) => s.head.indexOf(NAMES[id]) >= 0), byBody = secs.filter((s) => s.body.indexOf(NAMES[id]) >= 0);
  ck('V1b ' + id, pn === NAMES[id] && (byHead.length >= 1 || byBody.length >= 1), 'palette name "' + pn + '" == expected "' + NAMES[id] + '"; headings holding it: ' + byHead.length + ' (' + (byHead[0] ? byHead[0].head : '-') + '), body sections: ' + byBody.length);
});
(async () => {
  if (LIVE) {
    const puppeteer = require('puppeteer'); const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.css': 'text/css', '.wasm': 'application/wasm', '.png': 'image/png', '.svg': 'image/svg+xml', '.sql': 'text/plain' };
    const DB = 'FilmGuide8_extracted.db', VDB = path.join(TREE, 'viewer', 'buildings', DB); fs.copyFileSync(fs.realpathSync(path.join(process.env.HOME, 'bim-ootb', 'viewer', 'buildings', 'Duplex_extracted.db')), VDB);
    const srv = http.createServer((q, s) => { const p = decodeURIComponent(q.url.split('?')[0]); fs.readFile(path.join(TREE, p), (e, b) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(b); }); });
    await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    try {
      const open = async () => { const page = await br.newPage(); await page.setViewport({ width: 1600, height: 900 }); const err = []; page.on('pageerror', (e) => err.push(String(e).slice(0, 160)));
        await page.goto('http://127.0.0.1:' + port + '/viewer/viewer.html?db=buildings/' + DB + '&lang=en_MY', { waitUntil: 'load', timeout: 120000 });
        await page.waitForFunction('window.APP && window.APP.db && window._TRL_READY && window._mainPillActions && window.showCommandPalette && window.APP.showStructuralSanity', { timeout: 240000 }); await sleep(3000); return { page, err }; };
      const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
      for (const [word, want] of [['Sanity', /Sanity/], ['Egress', /Egress/]]) {
        const { page, err } = await open(); await blur(page); await page.keyboard.press('F1'); await page.waitForSelector('#cmd-search', { timeout: 30000 }); await page.focus('#cmd-search'); await page.keyboard.type(word, { delay: 30 }); await sleep(400); await page.keyboard.press('Enter');
        await page.waitForFunction(() => { const p = document.getElementById('rule-checklist-panel'); return !!p && getComputedStyle(p).display !== 'none' && p.innerText.length > 20; }, { timeout: 60000 }).catch(() => {});
        const t = await page.evaluate(() => { const p = document.getElementById('rule-checklist-panel'); return p && getComputedStyle(p).display !== 'none' ? p.innerText.replace(/\s+/g, ' ').slice(0, 160) : null; });
        ck('V4 F1, type "' + word + '", Enter opens the checklist and names it', !!t && want.test(t) && !err.length, 'panel=' + JSON.stringify(t) + ' pageErrors=' + err.length); await page.close();
      }
      for (const [key, want, what] of [['y', /Sanity/, 'Sanity'], ['e', /Egress/, 'Egress']]) {
        const { page, err } = await open(); await blur(page); await page.keyboard.press(key);
        await page.waitForFunction(() => { const p = document.getElementById('rule-checklist-panel'); return !!p && getComputedStyle(p).display !== 'none' && p.innerText.length > 20; }, { timeout: 60000 }).catch(() => {});
        const t = await page.evaluate(() => { const p = document.getElementById('rule-checklist-panel'); return p && getComputedStyle(p).display !== 'none' ? p.innerText.replace(/\s+/g, ' ').slice(0, 160) : null; });
        ck('V4 key ' + key.toUpperCase() + ' opens the ' + what + ' checklist and names it', !!t && want.test(t) && !err.length, 'panel=' + JSON.stringify(t) + ' pageErrors=' + err.length); await page.close();
      }
      { const { page, err } = await open(); await blur(page); await page.keyboard.press('i'); await sleep(1500);
        const on = await page.evaluate(() => { const p = document.getElementById('issues-panel'); return !!p && p.classList.contains('active'); });
        ck('V4 key I opens the Issues panel', on && !err.length, 'issues-panel.active=' + on + ' pageErrors=' + err.length); await page.close(); }
    } finally { await br.close(); srv.close(); try { fs.unlinkSync(VDB); } catch (e) { /* ignore */ } }
  } else console.log('§V4 LIVE not judged (no --live)');
  console.log('§W-GUIDE-VIEWER8 ' + (fails ? 'FAIL ' + fails : (LIVE ? 'PASS' : 'PASS (live not judged)'))); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('§W-GUIDE-VIEWER8 ERROR ' + (e && e.stack || e)); process.exit(1); });
