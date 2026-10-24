#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/TimeMachine.md, PART C (SampleHouse): REAL pointer gestures on the Gantt canvas (bar rects from window.__tmGanttBars):
// locked drawer ignores a drag · unlocked: drag a bar body (move, successors pushed) · drag a bar's right edge (resize) ·
// marquee from empty canvas then drag one selected bar (group moves together) — each judged as numbers via __tmGanttWindows. Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'figs'));
const LOG = process.env.LOG || '/tmp/docs_capture_time_machine_c.log';
const DAY = 86400000;

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_time_machine_c.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 1000 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 2600)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms, arg) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn, arg)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const win = () => page.evaluate(() => (window.__tmGanttWindows ? window.__tmGanttWindows() : null));
  // per-task start/end shift in days against a reference list (null when identical)
  const diff = (ref, now) => { if (!ref || !now) return null; const out = []; now.forEach(n => { const r = ref.find(x => x.taskId === n.taskId); if (!r) { out.push({ id: n.taskId, new: true }); return; } const ds = Math.round((n.startTs - r.startTs) / DAY * 100) / 100, de = Math.round((n.endTs - r.endTs) / DAY * 100) / 100; if (ds || de) out.push({ id: n.taskId, phase: n.phase, storey: n.storey, dStart: ds, dEnd: de }); }); return out; };
  const tip = () => page.evaluate(() => { const t = document.getElementById('tm-gantt-tip'); return t && t.style.display !== 'none' ? t.innerText : null; });
  const bars = () => page.evaluate(() => { const cv = document.getElementById('tm-gantt-canvas'); const r = cv.getBoundingClientRect(); const sx = r.width / (cv.width || r.width), sy = r.height / (cv.height || r.height); return { rect: [r.x, r.y, r.width, r.height], scale: [sx, sy], canvasPx: [cv.width, cv.height], bars: (window.__tmGanttBars || []).map(b => ({ i: b.i, id: b.taskId, x: r.x + b.x * sx, w: b.w * sx, midY: r.y + b.midY * sy, h: b.h * sy })) }; });
  const drag = async (x0, y0, x1, y1) => { await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 6 }); await page.mouse.move(x1, y1, { steps: 6 }); await page.mouse.up(); await sleep(1800); };
  const lens = (ws) => ws && ws.map(w => ({ id: (w.taskId || 'null').replace('TASK_', ''), s: w.startTs, e: w.endTs }));
  try {
    step('loaded', await c.openBuilding('SampleHouse_extracted.db'));
    await sleep(3000);
    await page.mouse.click(700, 300); await page.keyboard.press('t');
    await pollFor('tm-label', (i) => !!document.getElementById(i) && document.getElementById(i).getBoundingClientRect().width > 0, 180000, 'tm-label'); await sleep(8000);
    await mclick('#tm-gantt'); await sleep(5000);
    const t0 = await win();
    const g0 = await bars();
    step('barGeometry', { rect: g0.rect, scale: g0.scale, canvasPx: g0.canvasPx, bars: g0.bars.map(b => ({ i: b.i, id: b.id && b.id.replace('TASK_', ''), x: Math.round(b.x), w: Math.round(b.w), y: Math.round(b.midY) })) });
    const authored = g0.bars.filter(b => b.id);
    const target = authored[0];
    // A. locked: a real drag on a bar must change nothing
    step('lockText0', await page.evaluate(() => (document.getElementById('tm-gantt-editlock') || {}).textContent));
    await drag(target.x + target.w / 2, target.midY, target.x + target.w / 2 + 60, target.midY);
    step('A_lockedDrag', { changed: diff(t0, await win()).length, lockMsg: await page.evaluate(() => (document.getElementById('tm-gantt-lockmsg') || {}).innerText), tip: await tip() });
    // B. unlock, drag the same bar body +60 px
    await mclick('#tm-gantt-editlock'); await sleep(1200);
    step('lockText1', await page.evaluate(() => (document.getElementById('tm-gantt-editlock') || {}).textContent));
    const gB = await bars(); const tb = gB.bars.find(b => b.id === target.id);
    const secPerPx = (g0.canvasPx[0] ? 1 : 1);
    await drag(tb.x + tb.w / 2, tb.midY, tb.x + tb.w / 2 + 60, tb.midY);
    const tB = await win();
    step('B_moveBody', { shifted: diff(t0, tB).map(x => x.id.replace('TASK_', '') + ' ' + x.dStart + '/' + x.dEnd), tip: await tip() });
    // C. resize: drag the right edge of the same bar +30 px
    const gC = await bars(); const tc = gC.bars.find(b => b.id === target.id);
    await drag(tc.x + tc.w - 1, tc.midY, tc.x + tc.w - 1 + 30, tc.midY);
    const tC = await win();
    step('C_resizeEdge', { vsAfterMove: diff(tB, tC).map(x => x.id.replace('TASK_', '') + ' ' + x.dStart + '/' + x.dEnd), tip: await tip() });
    // D. marquee: from just right of the axis end on the first row across all bars, then drag one selected bar
    const gD = await bars();
    const right = Math.max.apply(null, gD.bars.map(b => b.x + b.w));
    const top = Math.min.apply(null, gD.bars.map(b => b.midY)) - 8, bot = Math.max.apply(null, gD.bars.map(b => b.midY)) + 8;
    const cvRight = gD.rect[0] + gD.rect[2];
    step('marqueeGeometry', { barsRight: Math.round(right), canvasRight: Math.round(cvRight), top: Math.round(top), bottom: Math.round(bot) });
    const startX = Math.min(cvRight - 4, right + 6);
    if (startX > right) {
      await drag(startX, bot, gD.bars[0].x - 4, top);          // sweep right-bottom -> left-top across every bar
      const selected = await page.evaluate(() => ({ selected: typeof window.__tmGanttSelected !== 'undefined' ? window.__tmGanttSelected : null }));
      step('D_selection', selected);
      const tD0 = await win();
      const gD2 = await bars(); const bt = gD2.bars.find(b => b.id === target.id);
      await drag(bt.x + bt.w / 2, bt.midY, bt.x + bt.w / 2 + 40, bt.midY);
      const tD = await win();
      step('D_groupMove', { shifted: diff(tD0, tD).map(x => x.id.replace('TASK_', '') + ' ' + x.dStart + '/' + x.dEnd) });
    } else step('D_skipped', 'no empty canvas to the right of the bars');
    await shot('tm-gantt-real-gestures-samplehouse', '#time-machine-panel');
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
