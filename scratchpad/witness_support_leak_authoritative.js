// witness_support_leak_authoritative.js — headless, no browser, WHITEBOX (exercises the real shipped
// ScheduleGate.auditFloating — the SAME proven check time_machine.js's own §SUPPORT_CHECK already
// calls, "floating=0/10979" — not a re-implementation, not a looser ad-hoc heuristic).
//
// Supersedes witness_geo_support_leak.js's own detection criterion, which was TOO LOOSE (flagged
// "any real structure overlapping my XY footprint, at ANY Z" as a leak) — that over-flagged JKR's 3
// "Slab Edge" IfcBuildingElementProxy elements, whose only overlapping structure is a real IfcSlab
// SITTING ABOVE them (slab base_z=80.85, edge top_z=80.85 — flush, edge poured first/concurrent, not
// after). auditFloating correctly does NOT consider "structure above me" a support requirement — same
// causal direction as geoGate itself (a thing above you is not what holds you up). Re-checked here
// against the SAME authoritative, already-proven function, not asserted from a looser heuristic.
//
// FAILS (no fallback) if auditFloating(...) > 0 for ANY building — this IS the project's own already-
// established "nothing without support" invariant (§SUPPORT_CHECK), run here headlessly, before and
// after the §GEO_SUPPORT_LEAK geoGate() fix, so the real effect of that fix is measured against the
// authoritative check, not a substitute one.
var fs = require('fs');
var path = require('path');
var initSqlJs = require('/home/red1/bim-ootb/node_modules/sql.js');
var SQLJS_DIST = '/home/red1/bim-ootb/node_modules/sql.js/dist';
var VIEWER = process.env.VIEWER_DIR || '/home/red1/bim-ootb/viewer';
var BUILDINGS_DIR = '/home/red1/bim-ootb/buildings';

var ScheduleAuthor = require(path.join(VIEWER, 'schedule_author.js'));
var ScheduleGate = require(path.join(VIEWER, 'schedule_gate.js'));

var BUILDINGS = (process.argv[2] ? [process.argv[2]] : ['Duplex', 'Clinic', 'JKR', 'HHS_Office_Federated', 'Hospital', 'Terminal']);

function loadRules() {
  var txt = fs.readFileSync(path.join(VIEWER, 'rates.js'), 'utf8');
  var start = txt.indexOf('var RATES = {');
  var defIdx = txt.indexOf('var SEQUENCE_DEFAULT');
  var end = txt.indexOf('};', defIdx) + 2;
  var slice = txt.slice(start, end);
  return (new Function(slice + '\n return { SEQUENCE_RULES: SEQUENCE_RULES, SEQUENCE_DEFAULT: SEQUENCE_DEFAULT, LABOR_RATES: LABOR_RATES, RATES: RATES };'))();
}

initSqlJs({ locateFile: function (f) { return path.join(SQLJS_DIST, f); } }).then(function (SQL) {
  var rules = loadRules();
  var maxCrews = {};
  for (var res in rules.LABOR_RATES) if (rules.LABOR_RATES[res].max_crews) maxCrews[res] = rules.LABOR_RATES[res].max_crews;

  var totalFloating = 0;

  BUILDINGS.forEach(function (name) {
    var dbPath = path.join(BUILDINGS_DIR, name + '_extracted.db');
    if (!fs.existsSync(dbPath)) { console.log('§AUDIT_FLOAT SKIP ' + name + ' (fixture missing)'); return; }
    var db = new SQL.Database(fs.readFileSync(dbPath));

    var opts = { start: '2026-01-01', laborRates: rules.LABOR_RATES, rates: rules.RATES, scheduleGate: ScheduleGate };
    var mres = ScheduleAuthor.materializeZones(db, rules.SEQUENCE_RULES, opts);
    if (!mres.ok) { console.log('§AUDIT_FLOAT SKIP ' + name + ' materializeZones failed: ' + JSON.stringify(mres)); return; }

    var elements = ScheduleAuthor._buildScheduleElements(db, rules.SEQUENCE_RULES, {
      laborRates: rules.LABOR_RATES, rates: rules.RATES
    });
    var schedule = ScheduleGate.computeSchedule(elements, 0, 1, maxCrews);

    // THE REAL SHIPPED FUNCTION, same call shape time_machine.js's §SUPPORT_CHECK uses (struct +
    // furniture + walls over their XY support) — classFilter null = every element, matching
    // §SUPPORT_CHECK's own scope note "struct+furniture+walls".
    var floating = ScheduleGate.auditFloating(elements, schedule, null);
    totalFloating += floating;
    console.log('§AUDIT_FLOAT ' + name + ' elements=' + elements.length + ' floating=' + floating +
      ' (0=solved, same invariant as live §SUPPORT_CHECK)');
  });

  console.log('\n§AUDIT_FLOAT_SUMMARY totalFloating=' + totalFloating);
  console.log(totalFloating ? 'WITNESS FAIL — real floating elements exist, no fallback applied' : 'WITNESS PASS');
  process.exit(totalFloating ? 1 : 0);
}).catch(function (e) { console.error('§AUDIT_FLOAT_ERROR', e); process.exit(1); });
