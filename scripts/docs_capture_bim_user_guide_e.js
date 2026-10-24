#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART E: the Film-Maker (Alt+C) "Cinema path" panel on HHS Office.
// Checks every control the guide names: bands (settle / stick / stop) with x,z,height,length, Whole-path block (reach %, clip
// mark in / mark out / whole film, build-the-model, room titles, Reveal, Clash pairs, Measure, Storey highlight, Silent-bake size,
// saved plans) and the footer (Preview / Cancel / Save this path / OK). Interactive 3D edits (click the tube, drag a band, walk
// finger mode) are NOT reproduced here — those images stay flagged STALE-IMG in prompts/DOCS_GUIDE_REFRESH.md.
// Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_e.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_e.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 1400 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 2400)); };
  const pollFor = async (label, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  try {
    step('loaded', await c.openBuilding('HHS_Office_Federated_extracted.db', '', { loadMs: 2400000 }));
    await sleep(5000);
    await page.mouse.click(700, 300); await sleep(300);
    await page.keyboard.down('Alt'); await page.keyboard.press('c'); await page.keyboard.up('Alt');
    const up = await pollFor('cpe-panel', () => { const p = document.getElementById('cpe-panel'); return !!p && p.getBoundingClientRect().width > 0; }, 240000);
    await sleep(4000);
    if (!up) throw new Error('Alt+C did not open #cpe-panel');
    step('panel', await page.evaluate(() => { const p = document.getElementById('cpe-panel'); const r = p.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), title: document.getElementById('cpe-title')?.innerText.replace(/\s+/g, ' '), state: document.getElementById('cpe-state')?.innerText.replace(/\s+/g, ' ').slice(0, 300) }; }));
    step('bands', await page.evaluate(() => Array.from(document.querySelectorAll('#cpe-rows > *')).map(r => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 120))));
    step('controls', await page.evaluate(() => Array.from(document.querySelectorAll('#cpe-panel button, #cpe-panel select, #cpe-panel input')).map(e => { const r = e.getBoundingClientRect(); return (e.id || e.tagName) + '|' + (e.tagName === 'SELECT' ? 'sel=' + e.value : (e.type === 'checkbox' ? 'chk=' + e.checked : (e.textContent || e.value || e.title || '').trim().slice(0, 28))) + '|' + (r.width > 0 ? 'vis' : 'HIDDEN'); })));
    step('wholePathText', await page.evaluate(() => { const p = document.getElementById('cpe-panel'); const t = p.innerText.replace(/\s+/g, ' '); const i = t.indexOf('Whole path'); return t.slice(i < 0 ? 0 : i, (i < 0 ? 0 : i) + 900); }));
    step('footerButtons', await page.evaluate(() => ['cpe-preview', 'cpe-cancel', 'cpe-save', 'cpe-ok'].map(i => { const e = document.getElementById(i); if (!e) return i + '|absent'; const r = e.getBoundingClientRect(); return i + '|' + (r.width > 0 ? 'visible' : 'HIDDEN') + '|' + e.textContent.trim(); })));
    step('selectOptions', await page.evaluate(() => Array.from(document.querySelectorAll('#cpe-panel select')).map(s => s.id + ': ' + Array.from(s.options).map(o => o.textContent.trim()).join(' / ') + ' [=' + s.value + ']')));
    await shot('filmmaker-path-editor-initial-hhs', '#cpe-panel');
    // option set: tick Clash pairs, read the panel again
    await page.evaluate(() => { const b = document.getElementById('cpe-clash'); if (b) b.setAttribute('data-docs', 'clash'); });
    const hadClash = await page.$('[data-docs=clash]');
    if (hadClash) {
      const xy = await page.evaluate(() => { const r = document.querySelector('[data-docs=clash]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await page.mouse.click(xy[0], xy[1]); await sleep(2500);
      step('afterClash', await page.evaluate(() => { const e = document.getElementById('cpe-clash'); return { cls: e.className, checked: e.checked, pressed: e.getAttribute('aria-pressed'), state: document.getElementById('cpe-state')?.innerText.replace(/\s+/g, ' ').slice(0, 300) }; }));
      await shot('filmmaker-options-hhs', '#cpe-panel');
    }
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
