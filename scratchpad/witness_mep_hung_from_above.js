// witness_mep_hung_from_above.js — headless, no browser. Diagnostic (measure only, no fix applied).
//
// HYPOTHESIS (code review, viewer/schedule_gate.js): geoGate/auditFloating only ever check for a
// support BELOW an element (`S.base_z < el.base_z - EPS`). MEP ductwork/pipe (IfcDuctSegment,
// IfcPipeSegment, IfcFlowSegment — all seq:7, resource HVAC_TECH/PLUMBER) is physically hung FROM the
// slab ABOVE it. Nothing in the scheduler or the audit ever requires that slab to be finished first —
// a duct can legitimately start while the ceiling it is fastened to does not exist yet. The existing
// "nothing floats" audit (0/0 on all 6 buildings, confirmed this session) cannot see this because it
// never tests the above-relationship at all, not because the below-relationship is satisfied.
//
// This does NOT touch schedule_gate.js. It reuses the real computed schedule (ScheduleGate.computeSchedule,
// same call witness_support_invariant_all_buildings.js makes) and independently checks, for each hung-MEP
// element, whether the REAL nearest slab directly above it (by geometry, same EPS/GAP/overlap the shipped
// module already uses) finishes AFTER the element starts.
var fs = require('fs');
var path = require('path');
var initSqlJs = require('/home/red1/bim-ootb/node_modules/sql.js');
var SQLJS_DIST = '/home/red1/bim-ootb/node_modules/sql.js/dist';
var VIEWER = '/home/red1/bim-ootb/viewer';
var BUILDINGS_DIR = '/home/red1/bim-ootb/buildings';

var ScheduleAuthor = require(path.join(VIEWER, 'schedule_author.js'));
var ScheduleGate = require(path.join(VIEWER, 'schedule_gate.js'));

var BUILDINGS = ['Duplex', 'Clinic', 'JKR', 'HHS_Office_Federated', 'Hospital', 'Terminal'];
var HUNG_CLASSES = { IfcDuctSegment: 1, IfcPipeSegment: 1, IfcFlowSegment: 1, IfcDuctFitting: 1, IfcPipeFitting: 1, IfcFlowFitting: 1 };
var EPS = 0.05, GAP = 0.5; // same constants schedule_gate.js uses — not invented, imported by value since they're module-private

function loadRules() {
  var txt = fs.readFileSync(path.join(VIEWER, 'rates.js'), 'utf8');
  var start = txt.indexOf('var RATES = {');
  var defIdx = txt.indexOf('var SEQUENCE_DEFAULT');
  var end = txt.indexOf('};', defIdx) + 2;
  var slice = txt.slice(start, end);
  return (new Function(slice + '\n return { SEQUENCE_RULES: SEQUENCE_RULES, SEQUENCE_DEFAULT: SEQUENCE_DEFAULT, LABOR_RATES: LABOR_RATES, RATES: RATES };'))();
}
function overlap(a, b) { return a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0; }

initSqlJs({ locateFile: function (f) { return path.join(SQLJS_DIST, f); } }).then(function (SQL) {
  var rules = loadRules();
  var maxCrews = {};
  for (var res in rules.LABOR_RATES) if (rules.LABOR_RATES[res].max_crews) maxCrews[res] = rules.LABOR_RATES[res].max_crews;

  BUILDINGS.forEach(function (name) {
    var dbPath = path.join(BUILDINGS_DIR, name + '_extracted.db');
    if (!fs.existsSync(dbPath)) { console.log('§MEP_ABOVE SKIP ' + name); return; }
    var db = new SQL.Database(fs.readFileSync(dbPath));
    var elements = ScheduleAuthor._buildScheduleElements(db, rules.SEQUENCE_RULES, {
      laborRates: rules.LABOR_RATES, rates: rules.RATES
    });
    if (!elements.length) { console.log('§MEP_ABOVE SKIP ' + name + ' (no elements)'); return; }
    var schedule = ScheduleGate.computeSchedule(elements, 0, 1, maxCrews);

    // Real slabs only (the plausible "thing I'm hung from") — seq<=4 IfcSlab, real geometry.
    var slabs = elements.filter(function (e) { return e.cls === 'IfcSlab' && e.seq <= 4; });
    var hung = elements.filter(function (e) { return HUNG_CLASSES[e.cls]; });

    var checked = 0, violating = 0, noSlabAbove = 0;
    var worst = null, worstLagDays = 0;
    hung.forEach(function (el) {
      var sc = schedule[el.guid]; if (!sc) return;
      // Nearest real slab ABOVE this element (base_z of slab >= top_z of element, within GAP, XY-overlapping).
      var bestEnd = -1, bestSlab = null;
      slabs.forEach(function (s) {
        var ssc = schedule[s.guid]; if (!ssc) return;
        if (s.base_z >= (el.top_z || el.base_z) - EPS && s.base_z <= (el.top_z || el.base_z) + GAP + 3 && overlap(s, el)) {
          if (bestSlab === null || s.base_z < bestSlab.base_z) { bestSlab = s; bestEnd = ssc.end; }
        }
      });
      if (!bestSlab) { noSlabAbove++; return; }
      checked++;
      if (sc.start < bestEnd - 1) {
        violating++;
        var lagDays = (bestEnd - sc.start) / 86400000;
        if (lagDays > worstLagDays) { worstLagDays = lagDays; worst = el.guid + ' (' + el.cls + ')'; }
      }
    });

    console.log('§MEP_ABOVE ' + name + ' hungElements=' + hung.length +
      ' checkedAgainstRealSlabAbove=' + checked + ' noSlabFoundAbove=' + noSlabAbove +
      ' startsBeforeSlabAboveFinishes=' + violating +
      (violating ? ' worstLagDays=' + worstLagDays.toFixed(1) + ' (' + worst + ')' : ''));
  });
  console.log('§MEP_ABOVE DONE');
});
