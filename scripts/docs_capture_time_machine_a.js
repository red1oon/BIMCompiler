#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/TimeMachine.md, PART A (SampleHouse): the Time Machine panel, the ✎ author wizard
// (Generate first draft / Start blank / Schedule now / ±5d / Apply to 4D), ⑂ What-if, the Gantt edit lock, ⏪ Pull Back, and
// the ↗ Editor button (the Schedule Editor TAB was deleted 2026-08-24, §TM_P6_FOLD — it now toggles the in-panel P6/MSP box).
// Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'figs'));
const LOG = process.env.LOG || '/tmp/docs_capture_time_machine_a.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_time_machine_a.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 1000 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 2200)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn, arg)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const shown = (id) => { const e = document.getElementById(id); return !!e && e.getBoundingClientRect().width > 0; };
  const btns = (rootSel) => page.evaluate((r) => Array.from(document.querySelectorAll(r + ' button, ' + r + ' input, ' + r + ' select')).map(e => { const b = e.getBoundingClientRect(); return (e.id || e.tagName) + '|' + ((e.title || e.textContent || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 70)) + '|' + (b.width > 0 ? 'vis' : 'hid'); }), rootSel);
  try {
    step('loaded', await c.openBuilding('SampleHouse_extracted.db'));
    await sleep(3000);
    await page.mouse.click(700, 300); await page.keyboard.press('t');
    const up = await pollFor('tm-panel', shown, 180000, 'tm-panel');
    await sleep(6000);
    step('tmPanelButtons', await btns('#tm-panel'));
    step('tmStatus', await page.evaluate(() => ({ label: document.getElementById('tm-label')?.innerText.replace(/\s+/g, ' '), status: document.getElementById('tm-status')?.innerText.replace(/\s+/g, ' ').slice(0, 200), big: document.getElementById('tm-big-counter')?.innerText })));
    if (up) await shot('tm-panel-samplehouse', '#tm-panel');

    // the ✎ Author button and the wizard are GONE (commit 490b7a7f #1171; user ruling 2026-08-05): record that, with evidence
    step('authorButtonPresent', await page.evaluate(() => ({ tmAuthor: !!document.getElementById('tm-author'), sa: !!document.getElementById('sa-body'), ScheduleAuthorUI: typeof window.ScheduleAuthorUI })));
    step('panelContainer', await page.evaluate(() => { const l = document.getElementById('tm-label'); let p = l; while (p && p !== document.body) { const s = getComputedStyle(p); if ((s.position === 'fixed' || s.position === 'absolute') && p.getBoundingClientRect().height > 80) { p.setAttribute('data-docs', 'tmpanel'); const r = p.getBoundingClientRect(); return { id: p.id, cls: p.className, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; } p = p.parentElement; } return null; }));
    if (await page.$('[data-docs=tmpanel]')) await shot('tm-panel-samplehouse-full', '[data-docs=tmpanel]');
    step('ganttDrawerText', await page.evaluate(() => { const g = document.getElementById('tm-gantt'); return g ? { h: Math.round(g.getBoundingClientRect().height), text: g.innerText.replace(/\s+/g, ' ').slice(0, 400) } : null; }));
    step('varBox', await page.evaluate(() => { const v = document.getElementById('tm-var-box'); return v ? { w: Math.round(v.getBoundingClientRect().width), text: v.innerText.replace(/\s+/g, ' ').slice(0, 400) } : null; }));
    step('titles', await page.evaluate(() => ['tm-sun', 'tm-eye', 'tm-gantt', 'tm-whatif', 'tm-editor', 'tm-dash', 'tm-var', 'tm-lod', 'tm-close', 'tm-undo', 'tm-baseline', 'tm-reschedule-asap', 'tm-gantt-editlock'].map(i => { const e = document.getElementById(i); return i + '|' + (e ? ((e.title || '') + '|' + (e.textContent || '').trim().slice(0, 20) + '|' + (e.getBoundingClientRect().width > 0 ? 'vis' : 'hid')) : 'ABSENT'); })));
    // ── ⑂ What-if
    await mclick('#tm-whatif'); await sleep(5000);
    step('whatIf', await page.evaluate(() => { const hit = Array.from(document.querySelectorAll('body *')).find(e => e.children.length === 0 && /what-if|what if/i.test(e.textContent) && e.getBoundingClientRect().width > 0 && e.id !== 'tm-whatif'); let p = hit; while (p && p !== document.body) { const s = getComputedStyle(p); if ((s.position === 'fixed' || s.position === 'absolute') && p.getBoundingClientRect().height > 100) { p.setAttribute('data-docs', 'whatif'); return { id: p.id, text: p.innerText.replace(/\s+/g, ' ').slice(0, 700) }; } p = p.parentElement; } return hit ? { text: hit.textContent.slice(0, 100), noPanel: true } : null; }));
    if (await page.$('[data-docs=whatif]')) await shot('whatif-samplehouse', '[data-docs=whatif]');

    // ── Gantt lock, Pull Back
    step('ganttState', await page.evaluate(() => ({ lock: (document.getElementById('tm-gantt-editlock') || {}).title || null, lockText: (document.getElementById('tm-gantt-editlock') || {}).textContent || null, lockMsg: (document.getElementById('tm-gantt-lockmsg') || {}).innerText || null, undo: (document.getElementById('tm-undo') || {}).title, baseline: (document.getElementById('tm-baseline') || {}).title, pull: (document.getElementById('tm-reschedule-asap') || {}).title, cpm: (document.getElementById('tm-gantt-cpmlegend') || {}).innerText })));
    await mclick('#tm-gantt-editlock'); await sleep(1500);
    step('afterUnlock', await page.evaluate(() => ({ lock: (document.getElementById('tm-gantt-editlock') || {}).title, lockMsg: (document.getElementById('tm-gantt-lockmsg') || {}).innerText })));
    await mclick('#tm-reschedule-asap'); await sleep(2500);
    step('afterPullBack', await page.evaluate(() => ({ tip: (document.getElementById('tm-gantt-tip') || {}).innerText, tipShown: !!document.getElementById('tm-gantt-tip') && document.getElementById('tm-gantt-tip').style.display, status: document.getElementById('tm-status')?.innerText.replace(/\s+/g, ' ').slice(0, 200), title: (document.getElementById('tm-reschedule-asap') || {}).title })));
    await shot('tm-gantt-unlocked-samplehouse', '#tm-gantt');
    // ── ↗ Editor = P6 box toggle
    await mclick('#tm-editor'); await sleep(2500);
    step('p6Box', { vis: await page.evaluate(() => { const b = document.getElementById('tm-p6-box'); return b ? { w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height), text: b.innerText.replace(/\s+/g, ' ').slice(0, 500) } : null; }), buttons: await btns('#tm-p6-box'), newTab: (await c.browser.pages()).length });
    if (await page.$('#tm-p6-box')) await shot('tm-p6-box-samplehouse', '#tm-p6-box');
    await shot('tm-whole-page-samplehouse');
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
