// witness_gantt_axis_trim.js — headless, no browser. Tests the hypothesis found by code review of
// viewer/time_machine.js (prompts/4D_SCHEDULE_PERFECTION.md §BROWSER_PROOF "drawer renders near-empty"):
//
// buildGanttTasks() (time_machine.js:4589-4602) percentile-trims (2nd-98th) each bar's own start/end
// to stop straggler elements distorting a SINGLE bar's span (§GANTT_MINI_TRIM, already shipped fix).
// But _projectStart/_projectEnd (time_machine.js:110-111), the Gantt AXIS every bar is drawn against,
// is the RAW min/max over every op — untrimmed. If crew-capped placement produces any long tail, the
// axis stretches to cover it while every bar (trimmed to the "bulk" 2-98%) shrinks to a sliver against
// that stretched axis — a mechanical explanation for "~4% pixel coverage" that needs no browser to test.
//
// Reuses the exact same pipeline witness_support_invariant_all_buildings.js already uses
// (ScheduleAuthor._buildScheduleElements + ScheduleGate.computeSchedule) — not a re-implementation.
var fs = require('fs');
var path = require('path');
var initSqlJs = require('/home/red1/bim-ootb/node_modules/sql.js');
var SQLJS_DIST = '/home/red1/bim-ootb/node_modules/sql.js/dist';
var VIEWER = '/home/red1/bim-ootb/viewer';
var BUILDINGS_DIR = '/home/red1/bim-ootb/buildings';

var ScheduleAuthor = require(path.join(VIEWER, 'schedule_author.js'));
var ScheduleGate = require(path.join(VIEWER, 'schedule_gate.js'));

var BUILDINGS = ['Duplex', 'Clinic', 'JKR', 'HHS_Office_Federated', 'Hospital', 'Terminal'];

function loadRules() {
  var txt = fs.readFileSync(path.join(VIEWER, 'rates.js'), 'utf8');
  var start = txt.indexOf('var RATES = {');
  var defIdx = txt.indexOf('var SEQUENCE_DEFAULT');
  var end = txt.indexOf('};', defIdx) + 2;
  var slice = txt.slice(start, end);
  return (new Function(slice + '\n return { SEQUENCE_RULES: SEQUENCE_RULES, SEQUENCE_DEFAULT: SEQUENCE_DEFAULT, LABOR_RATES: LABOR_RATES, RATES: RATES };'))();
}

function percentileTrim(vals) {
  // Mirrors buildGanttTasks() exactly: n>20 uses [2nd,98th] percentile, else true min/max.
  vals = vals.slice().sort(function (a, b) { return a - b; });
  var n = vals.length;
  if (n > 20) {
    var loI = Math.floor(n * 0.02), hiI = Math.min(n - 1, Math.ceil(n * 0.98) - 1);
    return vals[loI];
  }
  return vals[0];
}
function percentileTrimHi(vals) {
  vals = vals.slice().sort(function (a, b) { return a - b; });
  var n = vals.length;
  if (n > 20) {
    var hiI = Math.min(n - 1, Math.ceil(n * 0.98) - 1);
    return vals[hiI];
  }
  return vals[n - 1];
}

initSqlJs({ locateFile: function (f) { return path.join(SQLJS_DIST, f); } }).then(function (SQL) {
  var rules = loadRules();
  var maxCrews = {};
  for (var res in rules.LABOR_RATES) if (rules.LABOR_RATES[res].max_crews) maxCrews[res] = rules.LABOR_RATES[res].max_crews;

  BUILDINGS.forEach(function (name) {
    var dbPath = path.join(BUILDINGS_DIR, name + '_extracted.db');
    if (!fs.existsSync(dbPath)) { console.log('§AXIS_TRIM SKIP ' + name + ' (fixture missing)'); return; }
    var db = new SQL.Database(fs.readFileSync(dbPath));

    // Author a REAL schedule first — same verb the app uses (ScheduleAuthorUI's ✎ button), same
    // call witness_boq_charts_real_schedule.js already uses. Without this, task_elements/tasks are
    // empty and every op falls into one ungrouped bucket, which is not the state the bug was filed
    // against (K0 requires real task_id — that only exists post-authoring).
    var opts = { start: '2026-01-01', laborRates: rules.LABOR_RATES, rates: rules.RATES, scheduleGate: ScheduleGate };
    var mres = ScheduleAuthor.materializeZones(db, rules.SEQUENCE_RULES, opts);
    if (!mres.ok) { console.log('§AXIS_TRIM SKIP ' + name + ' materializeZones failed: ' + JSON.stringify(mres)); return; }

    var elements = ScheduleAuthor._buildScheduleElements(db, rules.SEQUENCE_RULES, {
      laborRates: rules.LABOR_RATES, rates: rules.RATES
    });
    if (!elements.length) { console.log('§AXIS_TRIM SKIP ' + name + ' (no elements)'); return; }

    var schedule = ScheduleGate.computeSchedule(elements, 0, 1, maxCrews);

    // Real op-level start/end, exactly what time_machine.js's _ops carries (baseMs=0 here — only
    // the RATIO of trimmed-to-raw span matters, not real calendar dates).
    var starts = [], ends = [];
    for (var guid in schedule) { starts.push(schedule[guid].start); ends.push(schedule[guid].end); }

    // AXIS as time_machine.js:110-111 computes it — raw min/max, no trim.
    var axisStart = Math.min.apply(null, starts) - 1;
    var axisEnd = Math.max.apply(null, ends);
    var axisRange = axisEnd - axisStart;

    // Real task_id groups, exactly how buildGanttTasks groups ops (join guid -> task_elements.task_id).
    var teRows = db.exec("SELECT guid, task_id FROM task_elements");
    var guidToTask = {};
    if (teRows.length) {
      teRows[0].values.forEach(function (r) { guidToTask[r[0]] = r[1]; });
    }
    var groups = {};
    for (var g in schedule) {
      var tid = guidToTask[g] || '_UNGROUPED';
      (groups[tid] = groups[tid] || { starts: [], ends: [] });
      groups[tid].starts.push(schedule[g].start);
      groups[tid].ends.push(schedule[g].end);
    }

    // Widest bar after the SAME percentile trim buildGanttTasks applies, as a fraction of the raw axis.
    var maxBarFrac = 0, maxBarTask = null, sumBarFrac = 0, nBars = 0;
    for (var k in groups) {
      var gs = groups[k];
      var s = percentileTrim(gs.starts), e = percentileTrimHi(gs.ends);
      var frac = axisRange > 0 ? (e - s) / axisRange : 0;
      sumBarFrac += frac; nBars++;
      if (frac > maxBarFrac) { maxBarFrac = frac; maxBarTask = k; }
    }
    var avgBarFrac = nBars ? sumBarFrac / nBars : 0;

    console.log('§AXIS_TRIM ' + name +
      ' elements=' + elements.length +
      ' axisDays=' + Math.round(axisRange / 86400000) +
      ' bars=' + nBars +
      ' widestBarFrac=' + (maxBarFrac * 100).toFixed(1) + '%' +
      ' avgBarFrac=' + (avgBarFrac * 100).toFixed(1) + '%' +
      ' widestBarTask=' + maxBarTask);
  });
  console.log('§AXIS_TRIM DONE');
});
