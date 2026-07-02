#!/usr/bin/env node
/**
 * BIM OOTB — Time Machine CAPTURED-schedule consume witness (Node).
 * Implementing 4D_CAPTURE_AND_FALLBACK.md T3 — Witnesses W-TM-REAL + W-TM-FALLBACK.
 *
 * Proves the time_machine.js T3 _cap probe + overlay on REAL data:
 *   - real Hospital elements (from the exported meta.db, real guids)
 *   - real captured tasks/links (extracted live from Hospital 2.0.ifc)
 * Then exercises the SAME probe+overlay logic copied verbatim from time_machine.js:
 *   W-TM-REAL    : §GANTT_SOURCE captured ... covered>0; covered ops get REAL task start/finish
 *                  + real task NAME (e.g. "Zone A") + _captured=1.
 *   W-TM-FALLBACK: with the tasks table emptied, _cap is null → §GANTT_SOURCE generated,
 *                  overlay skipped, ops left byte-identical (no behavioural change).
 *
 * Run: node --max-old-space-size=8192 deploy/dev/tests/test_tm_capture.js \
 *        "$HOME/Downloads/Hospital 2.0_meta.db" "$HOME/Downloads/Hospital 2.0.ifc" \
 *        2>&1 | tee deploy/dev/tests/tm_capture.log
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const WebIFC = require('web-ifc');
const initSqlJs = require('sql.js');

const dbPath = process.argv[2] || path.join(os.homedir(), 'Downloads', 'Hospital 2.0_meta.db');
const ifcPath = process.argv[3] || path.join(os.homedir(), 'Downloads', 'Hospital 2.0.ifc');

// ── widened 4D extraction (mirrors import_worker.js T1b) — condensed to tasks + links ──
function extract4D(ifcApi, modelID) {
  var tasks = [], taskElements = [];
  var _childToParentEx = {}, _hasKids = {};
  try {
    var nestIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCRELNESTS);
    for (var ni = 0; ni < nestIds.size(); ni++) {
      try {
        var n = ifcApi.GetLine(modelID, nestIds.get(ni));
        var pEx = n.RelatingObject ? n.RelatingObject.value : null;
        if (pEx == null || !n.RelatedObjects) continue;
        _hasKids[pEx] = true;
        for (var nj = 0; nj < n.RelatedObjects.length; nj++) {
          var kEx = n.RelatedObjects[nj] ? n.RelatedObjects[nj].value : null;
          if (kEx != null) _childToParentEx[kEx] = pEx;
        }
      } catch (e) {}
    }
  } catch (e) {}
  var _exToGuid = {};
  try {
    var taskIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCTASK);
    for (var tki = 0; tki < taskIds.size(); tki++) {
      try {
        var _ex = taskIds.get(tki);
        var t = ifcApi.GetLine(modelID, _ex);
        var tt = t.TaskTime ? ifcApi.GetLine(modelID, t.TaskTime.value) : null;
        var g = t.GlobalId ? t.GlobalId.value : 'TASK_' + tki;
        _exToGuid[_ex] = g;
        tasks.push({
          _ex: _ex, id: g, name: t.Name ? t.Name.value : 'Task ' + tki,
          scheduleStart: tt && tt.ScheduleStart ? tt.ScheduleStart.value : null,
          scheduleFinish: tt && tt.ScheduleFinish ? tt.ScheduleFinish.value : null,
        });
      } catch (e) {}
    }
  } catch (e) {}
  tasks.forEach(function (tk) { tk.isSummary = _hasKids[tk._ex] ? 1 : 0; });
  var _seen = {};
  function push(tid, guid) { if (!tid || !guid) return; var k = tid + '|' + guid; if (_seen[k]) return; _seen[k] = 1; taskElements.push({ taskId: tid, guid: guid }); }
  try {
    var pIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCRELASSIGNSTOPRODUCT);
    for (var pi = 0; pi < pIds.size(); pi++) {
      try {
        var rp = ifcApi.GetLine(modelID, pIds.get(pi));
        var prod = rp.RelatingProduct ? ifcApi.GetLine(modelID, rp.RelatingProduct.value) : null;
        if (prod && prod.GlobalId && rp.RelatedObjects) {
          var eg = prod.GlobalId.value;
          for (var pj = 0; pj < rp.RelatedObjects.length; pj++) {
            try { var to = ifcApi.GetLine(modelID, rp.RelatedObjects[pj].value); if (to && to.GlobalId) push(to.GlobalId.value, eg); } catch (e) {}
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
  return { tasks: tasks, taskElements: taskElements };
}

// ── _cap probe — COPIED VERBATIM from time_machine.js injectGantt() T3 block ──
function probeCap(db) {
  try {
    var tr = db.exec("SELECT task_id, name, schedule_start, schedule_finish FROM tasks " +
      "WHERE schedule_start IS NOT NULL AND schedule_finish IS NOT NULL " +
      "AND (is_summary IS NULL OR is_summary = 0)");
    if (!tr.length || !tr[0].values.length) return null;
    var win = {}, minS = Infinity, maxE = -Infinity, n = 0;
    tr[0].values.forEach(function (row) {
      var s = Date.parse(row[2]), e = Date.parse(row[3]);
      if (!isFinite(s) || !isFinite(e) || e < s) return;
      win[row[0]] = { s: s, e: e, name: row[1] || row[0] };
      if (s < minS) minS = s;
      if (e > maxE) maxE = e;
      n++;
    });
    if (!n) return null;
    var guidTask = {}, te = null;
    try { te = db.exec("SELECT task_id, guid FROM task_elements"); } catch (e) { te = null; }
    if (te && te.length && te[0].values.length) {
      te[0].values.forEach(function (row) {
        var tid = row[0], g = row[1];
        if (!win[tid]) return;
        if (!guidTask[g] || win[tid].s < win[guidTask[g]].s) guidTask[g] = tid;
      });
    }
    return { base: minS, projEnd: maxE, win: win, guidTask: guidTask, taskCount: n };
  } catch (e) { return null; }
}

// ── overlay — COPIED VERBATIM from time_machine.js injectGantt() T3 block ──
function overlay(db, _cap, totalDbElements) {
  if (!_cap) { console.log('§GANTT_SOURCE generated'); return { covered: 0 }; }
  var _covered = 0;
  db.run('BEGIN');
  var _upd = db.prepare("UPDATE kernel_ops SET timestamp = ?, parameters = ? WHERE op_type = 'ELEMENT_PLACE' AND output_guid = ?");
  var _allOps = db.exec("SELECT output_guid, parameters FROM kernel_ops WHERE op_type='ELEMENT_PLACE'");
  if (_allOps.length && _allOps[0].values.length) {
    _allOps[0].values.forEach(function (row) {
      var g = row[0], tid = _cap.guidTask[g];
      if (!tid) return;
      var w = _cap.win[tid];
      var p; try { p = JSON.parse(row[1]); } catch (e) { p = {}; }
      p.phase = w.name; p._end_ts = w.e; p._captured = 1; p._task = tid;
      _upd.run([w.s, JSON.stringify(p), g]);
      _covered++;
    });
  }
  _upd.free();
  db.run('COMMIT');
  var pct = totalDbElements ? Math.round(_covered / totalDbElements * 100) : 0;
  console.log('§GANTT_SOURCE captured tasks=' + _cap.taskCount + ' covered=' + _covered +
    ' generated=' + (totalDbElements - _covered) + ' total=' + totalDbElements + ' pct=' + pct);
  console.log('§4D_COVERAGE captured=' + _covered + ' generated=' + (totalDbElements - _covered) +
    ' total=' + totalDbElements + ' pct=' + pct +
    ' window=' + new Date(_cap.base).toISOString().slice(0, 10) + '..' + new Date(_cap.projEnd).toISOString().slice(0, 10));
  return { covered: _covered, pct: pct };
}

async function main() {
  if (!fs.existsSync(dbPath)) { console.error('§FATAL meta.db not found: ' + dbPath); process.exit(1); }
  if (!fs.existsSync(ifcPath)) { console.error('§FATAL ifc not found: ' + ifcPath); process.exit(1); }
  console.log('§TM_CAP_START db=' + path.basename(dbPath) + ' ifc=' + path.basename(ifcPath));

  // 1. Extract REAL captured tasks/links from the IFC
  const ifcApi = new WebIFC.IfcAPI();
  await ifcApi.Init();
  const modelID = ifcApi.OpenModel(new Uint8Array(fs.readFileSync(ifcPath)),
    { COORDINATE_TO_ORIGIN: false, USE_FAST_BOOLS: true, OPTIMIZE_PROFILES: true });
  const cap = extract4D(ifcApi, modelID);
  ifcApi.CloseModel(modelID);
  const leafDated = cap.tasks.filter(t => !t.isSummary && t.scheduleStart && t.scheduleFinish).length;
  console.log('§TM_CAP_EXTRACT tasks=' + cap.tasks.length + ' leafDated=' + leafDated +
    ' taskElements=' + cap.taskElements.length);

  // 2. Open the real meta.db, add the 4D tables (widened DDL), seed kernel_ops (1 op/element)
  const SQL = await initSqlJs();
  const db = new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)));
  const elc = db.exec('SELECT COUNT(*) FROM elements_meta');
  const totalDbElements = elc[0].values[0][0];
  console.log('§TM_CAP_DB elements_meta=' + totalDbElements);

  db.run('CREATE TABLE IF NOT EXISTS tasks (task_id TEXT PRIMARY KEY, schedule_id TEXT, wbs_parent TEXT, name TEXT, predefined_type TEXT, is_summary INTEGER, schedule_start TEXT, schedule_finish TEXT, schedule_duration TEXT, early_start TEXT, early_finish TEXT, late_start TEXT, late_finish TEXT, free_float TEXT, total_float TEXT, is_critical INTEGER, resource TEXT, status TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS task_elements (task_id TEXT, guid TEXT, PRIMARY KEY (task_id, guid))');
  db.run('CREATE TABLE IF NOT EXISTS kernel_ops (id INTEGER PRIMARY KEY, timestamp INTEGER NOT NULL, op_type TEXT NOT NULL, parameters TEXT NOT NULL, input_guids TEXT, output_guid TEXT, undone INTEGER DEFAULT 0)');
  db.run('BEGIN');
  var st = db.prepare('INSERT OR IGNORE INTO tasks (task_id,name,is_summary,schedule_start,schedule_finish) VALUES (?,?,?,?,?)');
  cap.tasks.forEach(t => st.run([t.id, t.name, t.isSummary, t.scheduleStart, t.scheduleFinish]));
  st.free();
  var se = db.prepare('INSERT OR IGNORE INTO task_elements VALUES (?,?)');
  cap.taskElements.forEach(te => se.run([te.taskId, te.guid]));
  se.free();
  // Seed one generative ELEMENT_PLACE op per element (simulates injectGantt's generative pass)
  var sg = db.prepare("INSERT INTO kernel_ops (timestamp,op_type,parameters,input_guids,output_guid,undone) VALUES(?,?,?,?,?,0)");
  var gen = db.exec('SELECT guid, ifc_class, element_name, storey FROM elements_meta');
  gen[0].values.forEach(function (row) {
    sg.run([1000, 'ELEMENT_PLACE', JSON.stringify({ phase: 'Generated', cls: row[1], name: row[2] || '', storey: row[3] || '', _end_ts: 1060000 }), JSON.stringify([row[0]]), row[0]]);
  });
  sg.free();
  db.run('COMMIT');

  // 3. W-TM-REAL — probe + overlay
  console.log('--- W-TM-REAL (captured) ---');
  var _cap = probeCap(db);
  if (!_cap) { console.error('§FATAL probe returned null on captured DB — expected non-null'); process.exit(1); }
  var res = overlay(db, _cap, totalDbElements);
  // sample 3 covered ops to prove real date + real name landed
  var sample = db.exec("SELECT output_guid, timestamp, parameters FROM kernel_ops WHERE op_type='ELEMENT_PLACE' AND parameters LIKE '%\"_captured\":1%' LIMIT 3");
  if (sample.length) sample[0].values.forEach(function (row) {
    var p = JSON.parse(row[2]);
    console.log('§TM_COVERED guid=' + row[0].slice(0, 10) + ' start=' + new Date(row[1]).toISOString().slice(0, 10) +
      ' end=' + new Date(p._end_ts).toISOString().slice(0, 10) + ' name="' + p.phase + '" captured=' + p._captured);
  });
  if (res.covered <= 0) { console.error('§FATAL covered=0 — overlay matched no elements'); process.exit(1); }

  // 4. W-TM-FALLBACK — same code on a DB with NO captured schedule
  console.log('--- W-TM-FALLBACK (no 4D) ---');
  db.run('DELETE FROM tasks');
  var before = db.exec("SELECT COUNT(*) FROM kernel_ops WHERE parameters LIKE '%\"_captured\":1%'")[0].values[0][0];
  var _cap2 = probeCap(db);
  console.log('§TM_FALLBACK probe=' + (_cap2 === null ? 'null (generative)' : 'NON-NULL — BUG'));
  overlay(db, _cap2, totalDbElements);
  var after = db.exec("SELECT COUNT(*) FROM kernel_ops WHERE parameters LIKE '%\"_captured\":1%'")[0].values[0][0];
  console.log('§TM_FALLBACK ops_untouched=' + (before === after) + ' (captured-flagged before=' + before + ' after=' + after + ')');
  if (_cap2 !== null) { console.error('§FATAL fallback probe non-null'); process.exit(1); }

  db.close();
  console.log('§TM_CAP_DONE');
}
main().catch(e => { console.error('§FATAL', e.message, e.stack); process.exit(1); });
