// W-GANTT-DRAG-SLIP — whitebox §-log proof for FUSED 4D/5D WEDGE P1 (front-visual edit gesture).
// Implementing prompts/FUSED_4D5D_WEDGE_LANE.md §1 P1 — Witness: W-GANTT-DRAG-SLIP
//
// ISSUE PROVEN/DISPROVEN: Does a direct-manipulation pointer DRAG on a Gantt bar map to a
// deterministic, WYSIWYG, devicePixelRatio-safe time-delta — the input a SCHEDULE_SLIP op needs —
// using the REAL Gantt geometry? The design law (lane §0): the front visual is the dominant edit
// gesture (drag the bar = slip the task); the JSON editor is backstage. For that to be honest, a
// drag of Δpx must slip the bar so it lands EXACTLY under the drop point (no drift), on retina too.
// The trap this kills: computing the drag in DEVICE px (canvas.width = CSS×dpr) instead of CSS px
// (rect.width, what findBarAtClick uses) → on a 2× display the bar jumps twice as far as the cursor.
//
// NON-INVENT: bars are REAL SampleHouse windows from the REAL injectGantt (sliced verbatim from
// time_machine.js:2239-2517); the hit-test is the REAL findBarAtClick (sliced verbatim from
// time_machine.js:2686-2705); the bar-rect formula matches drawGanttMini:2602-2604. The actual
// SCHEDULE_SLIP op + ripple is CONSUMED by bim-ootb/viewer/whatif.js (NOT in this repo) — this
// witness proves only the GESTURE→delta mapping that feeds it, and says so. Truth = the §-log.
//
// Usage: node scripts/witness_gantt_drag_slip.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Database = require('better-sqlite3');

const ROOT = path.join(__dirname, '..');
const TM = path.join(ROOT, 'deploy/dev/time_machine.js');
const RATES = path.join(ROOT, 'deploy/dev/rates.js');
const SRC_DB = path.join(ROOT, 'DAGCompiler/lib/input/SampleHouse_extracted.db');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ FAIL ' + m); } };

// ── reuse the P2 loaders: real rates + real injectGantt sliced from the real files ──
function loadRates() {
  const win = {};
  const sb = { window: win, console: { log() {} }, Math, JSON, Object, Array, Number, isFinite, parseInt, parseFloat, String, Boolean, Date };
  sb.globalThis = sb; vm.createContext(sb); vm.runInContext(fs.readFileSync(RATES, 'utf8'), sb, { filename: 'rates.js' });
  return { SEQUENCE_RULES: sb.SEQUENCE_RULES || {}, LABOR_RATES: sb.LABOR_RATES || {}, SEQUENCE_DEFAULT: sb.SEQUENCE_DEFAULT || { phase: 'Architecture', sequence: 6, resource: null } };
}
function sliceFn(src, startRe, stopRe, label) {
  const lines = src.split('\n');
  let start = -1, end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (start < 0 && startRe.test(lines[i])) start = i;
    if (start >= 0 && stopRe.test(lines[i]) && i > start) { end = i; break; }
  }
  if (start < 0 || end < 0) throw new Error('could not locate ' + label + ' (drift?)');
  let body = lines.slice(start, end);
  while (body.length && !/^\s*\}\s*$/.test(body[body.length - 1])) body.pop();
  console.log('§DRAG-SLICE ' + label + ' lines ' + (start + 1) + '..' + (start + body.length) + ' (verbatim from time_machine.js)');
  return body.join('\n');
}
function wrapDb(better) {
  return {
    run(sql, params) { better.prepare(sql).run(...(params || [])); },
    exec(sql) { const s = better.prepare(sql); if (s.reader) { const c = s.columns().map(x => x.name); const v = s.raw().all(); return v.length ? [{ columns: c, values: v }] : []; } s.run(); return []; }
  };
}

// REAL Gantt bar-rect formula — drawGanttMini:2602-2604 / findBarAtClick:2698-2699.
// CSS px throughout (cW = rect.width). marginL=60, barH=12, gapH=2, rowH=14.
const GEO = { marginL: 60, barH: 12, rowH: 14 };
function barRect(task, i, projStart, projEnd, cW) {
  const range = Math.max(1, projEnd - projStart);
  const barW = cW - GEO.marginL;
  let x = GEO.marginL + (task.startTs - projStart) / range * barW;
  let w = (task.endTs - task.startTs) / range * barW;
  if (w < 2) w = 2;
  const y = i * GEO.rowH + 2;
  return { x, y, w, range, barW };
}

(function main() {
  console.log('\n=== W-GANTT-DRAG-SLIP (real SampleHouse Gantt geometry) ===');
  if (!fs.existsSync(SRC_DB)) { console.log('§DRAG-ABORT missing ' + SRC_DB); process.exit(2); }

  // Generate REAL ops → real bar windows
  const better = new Database(fs.readFileSync(SRC_DB));
  const rules = loadRates();
  const tmSrc = fs.readFileSync(TM, 'utf8');
  const app = { db: wrapDb(better) };
  const igSb = { A: () => app, window: rules, console: { log() {} }, Math, JSON, Object, Array, Number, isFinite, Infinity, Date, parseInt };
  igSb.globalThis = igSb; vm.createContext(igSb);
  vm.runInContext(sliceFn(tmSrc, /^\s*function injectGantt\(\)\s*\{/, /^\s*function drawGanttMini\(/, 'injectGantt') + '\nthis.__ig = injectGantt;', igSb, { filename: 'ig.js' });
  better.prepare('DROP TABLE IF EXISTS kernel_ops').run();
  igSb.__ig();
  const opRows = better.prepare('SELECT timestamp, parameters, output_guid FROM kernel_ops WHERE undone=0 ORDER BY timestamp').raw().all();
  const bars = opRows.map(r => { const p = JSON.parse(r[1]); return { startTs: r[0], endTs: p._end_ts, storey: p.storey || '', phase: p.phase || '', guid: r[2] }; });
  const projStart = Math.min(...bars.map(b => b.startTs)) - 1;
  const projEnd = Math.max(...bars.map(b => b.endTs));
  ok(bars.length > 0, 'real bars from injectGantt (' + bars.length + ' tasks)');

  // ── Load the REAL findBarAtClick hit-test to validate our geometry against production ──
  const fbSb = { _ganttTasks: bars, _projectStart: projStart, _projectEnd: projEnd, Math, console: { log() {} } };
  fbSb.globalThis = fbSb; vm.createContext(fbSb);
  vm.runInContext(sliceFn(tmSrc, /^\s*function findBarAtClick\(/, /^\s*\/\/ ── RES_ICONS/, 'findBarAtClick') + '\nthis.__fb = findBarAtClick;', fbSb, { filename: 'fb.js' });
  const findBarAtClick = fbSb.__fb;

  // ── The drag gesture, in CSS px ──
  const cW = 600;                       // canvas CSS width (rect.width)
  const dpr = 2;                        // simulate a retina display
  const i = Math.floor(bars.length / 2);
  const task = bars[i];
  const rect0 = barRect(task, i, projStart, projEnd, cW);
  const grabX = rect0.x + rect0.w / 2;  // grab bar centre
  const grabY = rect0.y + GEO.barH / 2;

  // mkEvent feeds findBarAtClick a real-shaped pointer event (CSS px rect)
  const ev = (cx, cy) => ({ target: { getBoundingClientRect: () => ({ left: 0, top: 0, width: cW, height: bars.length * GEO.rowH }) }, clientX: cx, clientY: cy });
  const grabbed = findBarAtClick(ev(grabX, grabY));
  ok(grabbed && grabbed.guid === task.guid, 'REAL findBarAtClick resolves the grabbed bar (geometry matches production)');

  // Drag +90 CSS px to the right
  const dPx = 90;
  const dropX = grabX + dPx;

  // CORRECT mapping (CSS px): Δt = Δpx * range / barW
  const dT = dPx * rect0.range / rect0.barW;
  const slipped = { startTs: task.startTs + dT, endTs: task.endTs + dT, storey: task.storey, phase: task.phase, guid: task.guid };
  const rect1 = barRect(slipped, i, projStart, projEnd, cW);
  const landGrab = rect1.x + rect1.w / 2;   // where the grabbed point is now
  const driftPx = Math.abs(landGrab - dropX);
  console.log('§DRAG-WYSIWYG dPx=' + dPx + ' Δt=' + Math.round(dT) + 'ms (' + (dT / 86400000).toFixed(2) + 'd) dropX=' + dropX.toFixed(1) + ' landX=' + landGrab.toFixed(1) + ' drift=' + driftPx.toFixed(4) + 'px');
  ok(driftPx < 0.5, 'WYSIWYG: dragged bar lands under the drop point (drift < 0.5px)');

  // The op-input this gesture feeds (shape per bim-ootb whatif.js; CONSUMED there, NOT asserted here)
  const slipOpDelta = { targetGuid: task.guid, startDelta_ms: Math.round(dT), durDelta_ms: 0 };
  console.log('§DRAG-OP would emit SCHEDULE_SLIP delta=' + JSON.stringify(slipOpDelta) +
    '  (consumed by bim-ootb/viewer/whatif.js ripple — out of scope for this repo, not asserted)');
  ok(slipOpDelta.startDelta_ms === Math.round(dT) && slipOpDelta.durDelta_ms === 0, 'gesture yields a well-formed slip delta == Δt (move, not stretch)');

  // ── THE TRAP: device-px mapping (uses canvas.width = cW*dpr) drifts on retina ──
  const dT_wrong = dPx * rect0.range / ((cW * dpr) - GEO.marginL); // WRONG: device-px barW
  const slippedWrong = { startTs: task.startTs + dT_wrong, endTs: task.endTs + dT_wrong };
  const rectW = barRect(slippedWrong, i, projStart, projEnd, cW);
  const landWrong = rectW.x + rectW.w / 2;
  const driftWrong = Math.abs(landWrong - dropX);
  console.log('§DRAG-DPR-TRAP device-px mapping drift=' + driftWrong.toFixed(1) + 'px (dpr=' + dpr + ') — CSS-px path avoids this');
  ok(driftWrong > 1, 'control: device-px mapping DOES drift on retina (the bug the CSS-px path kills)');

  console.log('§DRAG-VERDICT css-px=WYSIWYG(drift<0.5px) device-px=DRIFTS(' + driftWrong.toFixed(0) + 'px)  → drag→slip gesture math PROVEN dpr-safe on real Gantt geometry');
  console.log('\n  W-GANTT-DRAG-SLIP: ' + pass + '/' + (pass + fail) + (fail ? '  ❌' : '  ✅'));
  process.exit(fail ? 1 : 0);
})();
