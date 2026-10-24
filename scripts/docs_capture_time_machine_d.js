#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/TimeMachine.md, PART D (SampleHouse): the in-panel P6 / MS Project box (⇄ P6/MSP).
// Imports the demo fixtures in all three formats (+ the tokened .bound variants), records what the app reports (rows, links, CPM, bind
// results), clicks every EXPORT button and inspects the downloaded files, and clicks Diff vs Model. The Hospital fixtures bind to the
// HOSPITAL model — on SampleHouse they import as an unbound programme (that is the guide's "honest boundary" case).
// Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'figs'));
const LOG = process.env.LOG || '/tmp/docs_capture_time_machine_d.log';
const FIX = process.env.FIX || path.join(os.homedir(), 'bim-ootb', 'tests', 'fixtures');

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_time_machine_d.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 1000 });
  const { page, log, report, shot, sleep } = c;
  const snap = async (n, sel) => { await page.mouse.move(5, 5); await sleep(900); return shot(n, sel); };   // park the pointer: no hover tooltip in the picture
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 2400)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn, arg)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const logLen = () => fs.statSync(LOG).size;
  const logSince = (n) => { const b = fs.readFileSync(LOG, 'utf8'); return b.slice(n).split('\n').filter(l => /§(CPM|P6|FOREIGN|IMPORT|SCHED|BIND|TM_P6|GANTT_SOURCE|FOREIGN_IMPORT)/.test(l)).map(l => l.replace(/^\[con\] /, '').slice(0, 260)).slice(0, 14); };
  const out = () => page.evaluate(() => (document.getElementById('tm-p6-out') || {}).innerText);
  try {
    step('fixtures', fs.readdirSync(FIX).filter(f => /Hospital_GW|\.xer$/i.test(f)).map(f => f + ' ' + fs.statSync(path.join(FIX, f)).size));
    step('loaded', await c.openBuilding('SampleHouse_extracted.db'));
    await sleep(3000);
    await page.mouse.click(700, 300); await page.keyboard.press('t');
    await pollFor('tm-label', (i) => !!document.getElementById(i) && document.getElementById(i).getBoundingClientRect().width > 0, 180000, 'tm-label'); await sleep(8000);
    await mclick('#tm-gantt'); await sleep(3000);
    step('autobindDefault', await page.evaluate(() => { const e = document.getElementById('tm-p6-autobind'); return e ? { tag: e.tagName, type: e.type, checked: e.checked } : null; }));
    await mclick('#tm-editor'); await sleep(2000);
    step('p6BoxOpen', await page.evaluate(() => { const b = document.getElementById('tm-p6-box'); return { h: Math.round(b.getBoundingClientRect().height), text: b.innerText.replace(/\s+/g, ' ') }; }));
    await page.evaluate(() => 0); await sleep(12000);   // §TM_P6_LAZY: the interop engines lazy-load on first open — a too-early upload says 'Interop module not loaded'
    const files = ['Hospital_GW_Programme.xer', 'Hospital_GW_Programme.xml', 'Hospital_GW_MSProject.xml', 'Hospital_GW_Programme.bound.xer'];
    for (const f of files) {
      const p = path.join(FIX, f); if (!fs.existsSync(p)) { step('missing_' + f, true); continue; }
      const n0 = logLen();
      const input = await page.$('#tm-p6-file');
      await input.uploadFile(p);
      await sleep(9000);
      const o = await out();
      const w = await page.evaluate(() => (window.__tmGanttWindows ? window.__tmGanttWindows().length : null));
      step('import_' + f, { out: o && o.replace(/\s+/g, ' ').slice(0, 600), ganttBars: w, cpm: await page.evaluate(() => (document.getElementById('tm-gantt-cpmlegend') || {}).innerText), logLines: logSince(n0) });
    }
    await snap('tm-p6-after-import-samplehouse', '#time-machine-panel');
    // diff vs model
    const n1 = logLen();
    await mclick('#tm-p6-diff'); await sleep(8000);
    step('diffVsModel', { out: ((await out()) || '').replace(/\s+/g, ' ').slice(0, 900), logLines: logSince(n1) });
    await snap('tm-p6-diff-samplehouse', '#time-machine-panel');
    // exports
    const exp = {};
    for (const id of ['tm-p6-export-pmxml', 'tm-p6-export-msp', 'tm-p6-export-xer']) {
      const snap = () => Object.fromEntries(fs.readdirSync(c.dl).map(f => [f, fs.statSync(path.join(c.dl, f)).mtimeMs + ':' + fs.statSync(path.join(c.dl, f)).size]));
      const before = snap(); const o0 = await out();
      await mclick('#' + id); await sleep(7000);
      const after = snap();
      const changed = Object.keys(after).filter(f => after[f] !== before[f]);
      exp[id] = { files: changed.map(f => { const full = path.join(c.dl, f); return { f, bytes: fs.statSync(full).size, head: fs.readFileSync(full, 'utf8').slice(0, 140).replace(/\s+/g, ' ') }; }), out: ((await out()) || '').replace(/\s+/g, ' ').slice(0, 260), outChanged: (await out()) !== o0 };
    }
    step('exports', exp);
    step('exportOut', await out());
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
