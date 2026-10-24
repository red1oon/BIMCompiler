#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART C1: HHS Office — every Find axis (incl. Parts) + Room highlight.
// Guide claims checked: "6/6 Parts" with Stairway (20) / Lift Shaft (3) / Plant Room (1769); Level 2 = 31 rooms, 105 whole building.
// Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run — exit code is not evidence.
// Env: OUT (png dir) · GPU=sw|real (default sw) · LOG
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_c1.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_c1.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 1500)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const findShown = () => { const f = document.getElementById('find-panel'); return !!f && f.getBoundingClientRect().width > 0; };
  const railOpen = async () => { const closed = await page.evaluate(() => getComputedStyle(document.getElementById('mobile-pill')).display === 'none'); if (closed) await mclick('#mobile-trigger'); await sleep(1200); };
  const axisLabel = () => page.evaluate(() => { const b = document.getElementById('find-axis-toggle'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : null; });
  const treeText = () => page.evaluate(() => { const t = document.getElementById('find-tree'); const r = document.getElementById('find-results'); const rows = Array.from(document.querySelectorAll('#find-panel .find-acc-header, #find-panel .tree-row, #find-panel [class*=row]')).filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean); return { tree: t && t.getBoundingClientRect().height > 0 ? t.innerText.replace(/\n+/g, ' | ').slice(0, 900) : null, results: r ? r.innerText.replace(/\n+/g, ' | ').slice(0, 900) : null, rows: rows.slice(0, 30) }; });
  try {
    step('loaded', await c.openBuilding('HHS_Office_Federated_extracted.db', '', { loadMs: 2400000 }));
    await sleep(4000);
    await railOpen(); await mclick('#pill-navigate'); await sleep(1200); await mclick('#drawer-row-find');
    await pollFor('find-open', findShown, 120000); await sleep(1500);
    // walk every axis once, record the label + what the list shows; screenshot each
    const seen = [];
    for (let i = 0; i < 8; i++) {
      const lab = await axisLabel(); if (!lab || seen.some(s => s.label === lab)) break;
      await sleep(1500);
      const tt = await treeText();
      seen.push({ label: lab, ...tt });
      log('§DOCS_AXIS ' + JSON.stringify({ label: lab, tree: tt.tree, results: (tt.results || '').slice(0, 300) }));
      await shot('axis-' + (i + 1) + '-' + lab.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 24), '#find-panel');
      await mclick('#find-axis-toggle'); await sleep(2500);
    }
    step('axes', seen.map(s => s.label));
    report.steps.axisDetail = seen;
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
