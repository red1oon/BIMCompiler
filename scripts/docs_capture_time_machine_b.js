#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/TimeMachine.md, PART B (SampleHouse): the Gantt drawer is a real editor — checked as NUMBERS
// through the app's own commit path (window.__tmGanttDrag / __tmGanttWindows / __tmRescheduleAsap, PRIMAL LAW: witness replaces eyeballing):
// locked drawer refuses an edit · unlock · move pushes successors only · resizeR changes duration only · Pull Back compresses ·
// ↺ Undo edit reverts the most recent edit · ⚑ Set Baseline. Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'figs'));
const LOG = process.env.LOG || '/tmp/docs_capture_time_machine_b.log';
const DAY = 86400000;

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_time_machine_b.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 1000 });
  const { page, log, report, shot, sleep } = c;
  const snap = async (n, sel) => { await page.mouse.move(5, 5); await sleep(900); return shot(n, sel); };   // park the pointer: no hover tooltip in the picture
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 2600)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn, arg)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const win = () => page.evaluate(() => (window.__tmGanttWindows ? window.__tmGanttWindows() : null));
  // per-task start/end shift in days against a reference list (null when identical)
  const diff = (ref, now) => { if (!ref || !now) return null; const out = []; now.forEach(n => { const r = ref.find(x => x.taskId === n.taskId); if (!r) { out.push({ id: n.taskId, new: true }); return; } const ds = Math.round((n.startTs - r.startTs) / DAY * 100) / 100, de = Math.round((n.endTs - r.endTs) / DAY * 100) / 100; if (ds || de) out.push({ id: n.taskId, phase: n.phase, storey: n.storey, dStart: ds, dEnd: de }); }); return out; };
  const tip = () => page.evaluate(() => { const t = document.getElementById('tm-gantt-tip'); return t && t.style.display !== 'none' ? t.innerText : null; });
  try {
    step('loaded', await c.openBuilding('SampleHouse_extracted.db'));
    await sleep(3000);
    await page.mouse.click(700, 300); await page.keyboard.press('t');
    await pollFor('tm-label', (i) => !!document.getElementById(i) && document.getElementById(i).getBoundingClientRect().width > 0, 180000, 'tm-label'); await sleep(8000);
    await mclick('#tm-gantt'); await sleep(5000);       // open the Gantt drawer (collapsed by default)
    const t0 = await win();
    step('tasks', t0 && t0.map(t => ({ id: t.taskId, storey: t.storey, phase: t.phase, startTs: t.startTs, endTs: t.endTs, days: Math.round((t.endTs - t.startTs) / DAY * 10) / 10, n: t.n })));
    step('drawer', await page.evaluate(() => { const g = document.getElementById('tm-gantt-box'); const r = g ? g.getBoundingClientRect() : null; return { h: r ? Math.round(r.height) : null, lock: (document.getElementById('tm-gantt-editlock') || {}).textContent, cpm: (document.getElementById('tm-gantt-cpmlegend') || {}).innerText }; }));
    await snap('tm-gantt-locked-samplehouse', '#time-machine-panel');
    if (!t0 || !t0.length) throw new Error('no gantt tasks');
    const first = t0[0].taskId;

    // NOTE: the UI 🔒 only gates pointer gestures; the hook calls the commit path directly (its lock is the BAKE lock). The UI lock is tested with real pointer events in part c.
    // 2. unlock via the real lock button
    await mclick('#tm-gantt-editlock'); await sleep(1500);
    step('unlocked', await page.evaluate(() => ({ text: (document.getElementById('tm-gantt-editlock') || {}).textContent, title: (document.getElementById('tm-gantt-editlock') || {}).title })));
    // 3. move the first task +3 days
    const r1 = await page.evaluate((id) => window.__tmGanttDrag(id, 'move', 3), first); await sleep(1500);
    const t1 = await win();
    step('move+3', { committed: r1, shifted: diff(t0, t1).map(x => x.id.replace('TASK_', '') + ' ' + x.dStart + '/' + x.dEnd), tip: await tip() });
    // 4. resize the first task's finish +2 days
    const r2 = await page.evaluate((id) => window.__tmGanttDrag(id, 'resizeR', 2), first); await sleep(1500);
    const t2 = await win();
    step('resizeR+2', { committed: r2, shiftedVsAfterMove: diff(t1, t2) });
    // 5. Pull Back
    const r3 = await page.evaluate(() => window.__tmRescheduleAsap ? window.__tmRescheduleAsap() : 'nohook'); await sleep(1500);
    const t3 = await win();
    step('pullBack', { result: r3, tip: await tip(), shiftedVsAfterResize: diff(t2, t3), shiftedVsOriginal: diff(t0, t3) });
    // 6. Undo until back to the original (guide: Undo reverts the single most recent edit)
    const undos = [];
    for (let i = 0; i < 4; i++) {
      await mclick('#tm-undo'); await sleep(1200);
      const tn = await win(); const d = diff(t0, tn);
      const f1 = d.find(x => x.id === first);
      undos.push({ n: i + 1, tasksDifferingFromOriginal: d.length, firstTask: f1 ? { dStart: f1.dStart, dEnd: f1.dEnd } : 'original', tip: await tip() });
    }
    step('undoSteps', undos);
    // 7. baseline
    await mclick('#tm-baseline'); await sleep(2000);
    step('baseline', { tip: await tip(), status: await page.evaluate(() => document.getElementById('tm-status')?.innerText.replace(/\s+/g, ' ').slice(0, 200)) });
    await snap('tm-gantt-unlocked-samplehouse', '#time-machine-panel');
    await snap('tm-gantt-page-samplehouse');
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
