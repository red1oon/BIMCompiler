// witness_gantt_ops_blackbox.js — headless, no browser. The "black box output log" requested
// 2026-08-04: dump the deterministic Gantt op population in build order (first pile knocked, last
// thing built) so a session can READ what the chart will draw instead of screenshotting it.
//
// Also settles a concrete hypothesis found by reading viewer/time_machine.js + kernel_ops.js +
// streaming.js source (not a guess): the live "one _UNKNOWN-storey outlier stretches the axis to
// 1049 days" finding (prompts/4D_SCHEDULE_PERFECTION.md §GANTT_AXIS_OUTLIER) may not be a genuine
// mistagged construction element at all — it may be the BUILDING_OPEN bookkeeping kernel_op:
//   1. streaming.js:812  commitOp(db,'BUILDING_OPEN',{name,count},[])  — no ts passed
//   2. kernel_ops.js:83  commitOp defaults stamp = Date.now() when ts is omitted — REAL wall-clock,
//      not a simulated construction date
//   3. time_machine.js:78-85 loadOps() queries kernel_ops with NO op_type filter (every other query
//      on this table in this file filters op_type='ELEMENT_PLACE' — this is the one exception)
//   4. time_machine.js:4536-4537 buildGanttTasks() defaults a missing storey/phase to
//      '_UNKNOWN'/'Architecture' — BUILDING_OPEN has neither param, so it lands in exactly that
//      bucket, with an end_ts of Date.now()+60000 — real "today", ~2 years past the simulated
//      2023-2024 construction window.
//
// This script reproduces that exact mechanism deterministically (a synthetic BUILDING_OPEN op with a
// FIXED "wall-clock" stamp, not Date.now(), so the witness itself stays reproducible) against a real
// authored schedule, and prints the black-box build-order log: first N and last N ops by start_ts,
// with op_type visible — the row that would be silently misread as a construction task is not hidden.
var fs = require('fs');
var path = require('path');
var initSqlJs = require('/home/red1/bim-ootb/node_modules/sql.js');
var SQLJS_DIST = '/home/red1/bim-ootb/node_modules/sql.js/dist';
var VIEWER = '/home/red1/bim-ootb/viewer';
var BUILDINGS_DIR = '/home/red1/bim-ootb/buildings';

var ScheduleAuthor = require(path.join(VIEWER, 'schedule_author.js'));
var ScheduleGate = require(path.join(VIEWER, 'schedule_gate.js'));

var BUILDING = process.argv[2] || 'Hospital';
// Fixed, not Date.now() — a witness must be reproducible. Chosen far outside any building's real
// 2023-2024 simulated window so its effect is unambiguous, same shape as the live wall-clock value.
var SIMULATED_WALL_CLOCK = Date.parse('2026-08-04T05:00:00Z');

function loadRules() {
  var txt = fs.readFileSync(path.join(VIEWER, 'rates.js'), 'utf8');
  var start = txt.indexOf('var RATES = {');
  var defIdx = txt.indexOf('var SEQUENCE_DEFAULT');
  var end = txt.indexOf('};', defIdx) + 2;
  var slice = txt.slice(start, end);
  return (new Function(slice + '\n return { SEQUENCE_RULES: SEQUENCE_RULES, SEQUENCE_DEFAULT: SEQUENCE_DEFAULT, LABOR_RATES: LABOR_RATES, RATES: RATES };'))();
}

// Mirrors time_machine.js computeDays()'s §GANTT_AXIS_OUTLIER trim exactly (as merged, 4d333c2).
function qualifiedAxis(ops) {
  var ends = ops.map(function (o) { return o.end_ts; }).sort(function (a, b) { return a - b; });
  var n = ends.length;
  var axisEnd;
  if (n > 20) {
    var hiI = Math.min(n - 1, Math.ceil(n * 0.98) - 1);
    axisEnd = ends[hiI];
  } else {
    axisEnd = Math.max.apply(null, ends);
  }
  return axisEnd;
}

function fmtDay(ts, base) { return Math.round((ts - base) / 86400000) + 'd'; }
function fmtDate(ts) { return new Date(ts).toISOString().slice(0, 10); }

initSqlJs({ locateFile: function (f) { return path.join(SQLJS_DIST, f); } }).then(function (SQL) {
  var rules = loadRules();
  var maxCrews = {};
  for (var res in rules.LABOR_RATES) if (rules.LABOR_RATES[res].max_crews) maxCrews[res] = rules.LABOR_RATES[res].max_crews;

  var dbPath = path.join(BUILDINGS_DIR, BUILDING + '_extracted.db');
  if (!fs.existsSync(dbPath)) { console.log('§BLACKBOX SKIP ' + BUILDING + ' (fixture missing)'); return; }
  var db = new SQL.Database(fs.readFileSync(dbPath));

  var opts = { start: '2026-01-01', laborRates: rules.LABOR_RATES, rates: rules.RATES, scheduleGate: ScheduleGate };
  var mres = ScheduleAuthor.materializeZones(db, rules.SEQUENCE_RULES, opts);
  if (!mres.ok) { console.log('§BLACKBOX SKIP ' + BUILDING + ' materializeZones failed: ' + JSON.stringify(mres)); return; }

  var elements = ScheduleAuthor._buildScheduleElements(db, rules.SEQUENCE_RULES, {
    laborRates: rules.LABOR_RATES, rates: rules.RATES
  });
  var schedule = ScheduleGate.computeSchedule(elements, 0, 1, maxCrews);

  // Real construction ops — output_guid + parameters carry storey/phase, exactly what loadOps()
  // returns for op_type='ELEMENT_PLACE' rows.
  var byGuid = {};
  elements.forEach(function (e) { byGuid[e.guid] = e; });
  var ops = [];
  for (var g in schedule) {
    var e = byGuid[g] || {};
    ops.push({
      op_type: 'ELEMENT_PLACE', output_guid: g,
      start_ts: schedule[g].start, end_ts: schedule[g].end,
      parameters: { storey: e.storey || null, phase: e.phase || null }
    });
  }
  var realProjectStart = Math.min.apply(null, ops.map(function (o) { return o.start_ts; })) - 1;
  var realProjectEnd = Math.max.apply(null, ops.map(function (o) { return o.end_ts; }));

  console.log('\n=== ' + BUILDING + ' — WITHOUT the bookkeeping op (op_type filter applied, the fix) ===');
  console.log('§BLACKBOX_CLEAN n=' + ops.length +
    ' projectStart=' + fmtDate(realProjectStart) + ' projectEnd=' + fmtDate(realProjectEnd) +
    ' days=' + Math.round((realProjectEnd - realProjectStart) / 86400000));

  // Reproduce the live mechanism: loadOps() has no op_type filter, so a BUILDING_OPEN row (real
  // wall-clock stamp, no storey/phase params) rides in unfiltered — exactly as viewer/time_machine.js
  // loadOps() does today.
  var pollutedOps = ops.concat([{
    op_type: 'BUILDING_OPEN', output_guid: null,
    start_ts: SIMULATED_WALL_CLOCK, end_ts: SIMULATED_WALL_CLOCK + 60000,
    parameters: {}   // no storey, no phase — matches the real commitOp('BUILDING_OPEN', {name,count}, []) call
  }]);
  pollutedOps.sort(function (a, b) { return a.start_ts - b.start_ts; });

  var polProjectStart = pollutedOps[0].start_ts - 1;
  var polProjectEnd = Math.max.apply(null, pollutedOps.map(function (o) { return o.end_ts; }));
  var polAxisEnd = qualifiedAxis(pollutedOps);   // the §GANTT_AXIS_OUTLIER display trim

  console.log('\n=== ' + BUILDING + ' — WITH the bookkeeping op (current loadOps(), no op_type filter) ===');
  console.log('§BLACKBOX_POLLUTED n=' + pollutedOps.length +
    ' _projectStart(REAL,unqualified)=' + fmtDate(polProjectStart) +
    ' _projectEnd(REAL,unqualified)=' + fmtDate(polProjectEnd) +
    ' days=' + Math.round((polProjectEnd - polProjectStart) / 86400000));
  console.log('§BLACKBOX_AXIS_TRIMMED _ganttAxisEnd(DISPLAY,post-#1175-fix)=' + fmtDate(polAxisEnd) +
    ' axisDays=' + Math.round((polAxisEnd - polProjectStart) / 86400000) +
    ' — the merged fix hides the pollution from the chart\'s axis...');
  console.log('§BLACKBOX_STILL_POLLUTED ...but _projectStart/_projectEnd (real playback bounds, ' +
    'scrubbing, "every element must eventually build") are UNCHANGED by that fix — still ' +
    Math.round((polProjectEnd - realProjectEnd) / 86400000) + 'd polluted past the real build end.');

  // The black-box build-order log itself: first 5 / last 5 ops by start_ts, op_type visible.
  console.log('\n--- build order (first 5) ---');
  pollutedOps.slice(0, 5).forEach(function (o, i) {
    console.log('  #' + (i + 1) + ' ' + o.op_type + ' guid=' + (o.output_guid || '(none)') +
      ' storey=' + (o.parameters.storey || '_UNKNOWN') + ' phase=' + (o.parameters.phase || '(none)') +
      ' start=' + fmtDate(o.start_ts));
  });
  console.log('--- build order (last 5) ---');
  pollutedOps.slice(-5).forEach(function (o, i) {
    console.log('  #' + (pollutedOps.length - 5 + i + 1) + ' ' + o.op_type + ' guid=' + (o.output_guid || '(none)') +
      ' storey=' + (o.parameters.storey || '_UNKNOWN') + ' phase=' + (o.parameters.phase || '(none)') +
      ' start=' + fmtDate(o.start_ts) + (o.op_type !== 'ELEMENT_PLACE' ? '  <-- NOT A CONSTRUCTION OP' : ''));
  });

  var lastOp = pollutedOps[pollutedOps.length - 1];
  var verdict = lastOp.op_type !== 'ELEMENT_PLACE';
  console.log('\n§BLACKBOX_VERDICT last-op-in-build-order-is-' + (verdict ? 'NOT-CONSTRUCTION (bug reproduced)' : 'a-real-element'));
  console.log(verdict ? 'WITNESS CONFIRMS ROOT CAUSE' : 'WITNESS DID NOT REPRODUCE');
}).catch(function (e) { console.error('§BLACKBOX_ERROR', e); process.exit(1); });
