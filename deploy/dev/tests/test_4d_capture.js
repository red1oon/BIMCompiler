#!/usr/bin/env node
/**
 * BIM OOTB — 4D capture witness harness (Node).
 * Implementing 4D_CAPTURE_AND_FALLBACK.md T1 — Witness W-CAPTURE
 *
 * The browser Drop importer can't run headlessly, but import_worker.js uses the
 * same web-ifc API as the backend extractor. This harness opens the real
 * Hospital 2.0.ifc, runs the SAME dual-direction 4D extraction logic added to
 * import_worker.js (kept byte-identical in logic — IfcRelAssignsToProcess +
 * IfcRelAssignsToProduct, dedup on taskId|guid), and proves:
 *   §4D_FOUND schedules=1 tasks=75 sequences=43 taskElements≈2900
 *   §4D_DB_ROWS task_elements=N   (via the same INSERT OR IGNORE SQL as the builder)
 *
 * Run:  node --max-old-space-size=8192 deploy/dev/tests/test_4d_capture.js \
 *         "$HOME/Downloads/Hospital 2.0.ifc" 2>&1 | tee deploy/dev/tests/4d_capture.log
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const WebIFC = require('web-ifc');
const initSqlJs = require('sql.js');

const ifcPath = process.argv[2] || path.join(os.homedir(), 'Downloads', 'Hospital 2.0.ifc');

async function main() {
  if (!fs.existsSync(ifcPath)) { console.error('§FATAL file not found: ' + ifcPath); process.exit(1); }
  console.log('§EXTRACT_START ifc=' + ifcPath);
  const ifcData = new Uint8Array(fs.readFileSync(ifcPath));
  console.log('§IFC_SIZE ' + (ifcData.byteLength / 1024 / 1024).toFixed(1) + 'MB');

  const ifcApi = new WebIFC.IfcAPI();
  await ifcApi.Init();
  console.log('§WASM_READY');

  const modelID = ifcApi.OpenModel(ifcData, {
    COORDINATE_TO_ORIGIN: false, USE_FAST_BOOLS: true, OPTIMIZE_PROFILES: true,
  });
  if (modelID < 0) { console.error('§PARSE_FAIL modelID=' + modelID); process.exit(1); }
  console.log('§PARSE_OK modelID=' + modelID);

  // ── BEGIN logic copied verbatim from import_worker.js 4D block (T1b widened) ──
  var schedules = [], tasks = [], taskSequences = [], taskElements = [], calendars = [];
  try {
    var schedIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCWORKSCHEDULE);
    for (var sci = 0; sci < schedIds.size(); sci++) {
      try {
        var s = ifcApi.GetLine(modelID, schedIds.get(sci));
        schedules.push({
          id: s.GlobalId ? s.GlobalId.value : 'SCHED_' + sci,
          name: s.Name ? s.Name.value : 'Schedule ' + sci,
          status: s.Status ? s.Status.value : null,
          created: s.CreationDate ? s.CreationDate.value : null,
        });
      } catch(e) {}
    }
  } catch(e) {}

  var _childToParentEx = {}, _hasKids = {};
  try {
    var nestIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCRELNESTS);
    for (var ni = 0; ni < nestIds.size(); ni++) {
      try {
        var n = ifcApi.GetLine(modelID, nestIds.get(ni));
        var parentEx = n.RelatingObject ? n.RelatingObject.value : null;
        if (parentEx == null || !n.RelatedObjects) continue;
        _hasKids[parentEx] = true;
        for (var nj = 0; nj < n.RelatedObjects.length; nj++) {
          var kidEx = n.RelatedObjects[nj] ? n.RelatedObjects[nj].value : null;
          if (kidEx != null) _childToParentEx[kidEx] = parentEx;
        }
      } catch(e) {}
    }
  } catch(e) {}

  var _exToGuid = {};
  try {
    var taskIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCTASK);
    for (var tki = 0; tki < taskIds.size(); tki++) {
      try {
        var _ex = taskIds.get(tki);
        var t = ifcApi.GetLine(modelID, _ex);
        var taskTime = t.TaskTime ? ifcApi.GetLine(modelID, t.TaskTime.value) : null;
        var _guid = t.GlobalId ? t.GlobalId.value : 'TASK_' + tki;
        _exToGuid[_ex] = _guid;
        tasks.push({
          _ex: _ex,
          id: _guid,
          name: t.Name ? t.Name.value : 'Task ' + tki,
          predefinedType: t.PredefinedType ? t.PredefinedType.value : null,
          scheduleStart: taskTime && taskTime.ScheduleStart ? taskTime.ScheduleStart.value : null,
          scheduleFinish: taskTime && taskTime.ScheduleFinish ? taskTime.ScheduleFinish.value : null,
          scheduleDuration: taskTime && taskTime.ScheduleDuration ? taskTime.ScheduleDuration.value : null,
          earlyStart: taskTime && taskTime.EarlyStart ? taskTime.EarlyStart.value : null,
          earlyFinish: taskTime && taskTime.EarlyFinish ? taskTime.EarlyFinish.value : null,
          lateStart: taskTime && taskTime.LateStart ? taskTime.LateStart.value : null,
          lateFinish: taskTime && taskTime.LateFinish ? taskTime.LateFinish.value : null,
          freeFloat: taskTime && taskTime.FreeFloat ? taskTime.FreeFloat.value : null,
          totalFloat: taskTime && taskTime.TotalFloat ? taskTime.TotalFloat.value : null,
          isCritical: (taskTime && taskTime.IsCritical != null) ? (taskTime.IsCritical.value ? 1 : 0) : null,
          status: t.Status ? t.Status.value : null,
        });
      } catch(e) {}
    }
  } catch(e) {}
  for (var twi = 0; twi < tasks.length; twi++) {
    var _pex = _childToParentEx[tasks[twi]._ex];
    tasks[twi].wbsParent = (_pex != null && _exToGuid[_pex]) ? _exToGuid[_pex] : null;
    tasks[twi].isSummary = _hasKids[tasks[twi]._ex] ? 1 : 0;
  }

  try {
    var calIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCWORKCALENDAR);
    for (var ci = 0; ci < calIds.size(); ci++) {
      try {
        var c = ifcApi.GetLine(modelID, calIds.get(ci));
        var calName = c.Name ? c.Name.value : null;
        var wts = c.WorkingTimes ? (Array.isArray(c.WorkingTimes) ? c.WorkingTimes : [c.WorkingTimes]) : [];
        var wtName = null, recType = null;
        if (wts.length) {
          try {
            var w = ifcApi.GetLine(modelID, wts[0].value);
            wtName = w.Name ? w.Name.value : null;
            if (w.RecurrencePattern) {
              var rp = ifcApi.GetLine(modelID, w.RecurrencePattern.value);
              recType = (rp && rp.RecurrenceType) ? rp.RecurrenceType.value : null;
            }
          } catch(e) {}
        }
        calendars.push({
          name: wtName || calName,
          recurrenceType: recType,
          raw: JSON.stringify({ calendarName: calName, workingTimeName: wtName, recurrenceType: recType, workingTimes: wts.length }),
        });
      } catch(e) {}
    }
  } catch(e) {}

  try {
    var seqIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCRELSEQUENCE);
    for (var sqi = 0; sqi < seqIds.size(); sqi++) {
      try {
        var sq = ifcApi.GetLine(modelID, seqIds.get(sqi));
        var pred = sq.RelatingProcess ? ifcApi.GetLine(modelID, sq.RelatingProcess.value) : null;
        var succ = sq.RelatedProcess ? ifcApi.GetLine(modelID, sq.RelatedProcess.value) : null;
        if (pred && succ) {
          taskSequences.push({
            predId: pred.GlobalId ? pred.GlobalId.value : null,
            succId: succ.GlobalId ? succ.GlobalId.value : null,
            type: sq.SequenceType ? sq.SequenceType.value : 'FINISH_START',
            lag: sq.TimeLag ? (parseFloat(sq.TimeLag.value) || 0) : 0,
          });
        }
      } catch(e) {}
    }
  } catch(e) {}

  var _seenTE = {};
  function _pushTE(taskId, guid) {
    if (!taskId || !guid) return;
    var key = taskId + '|' + guid;
    if (_seenTE[key]) return;
    _seenTE[key] = 1;
    taskElements.push({ taskId: taskId, guid: guid });
  }
  // Direction 1 — IfcRelAssignsToProcess
  try {
    var assignIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCRELASSIGNSTOPROCESS);
    for (var api = 0; api < assignIds.size(); api++) {
      try {
        var a = ifcApi.GetLine(modelID, assignIds.get(api));
        var process = a.RelatingProcess ? ifcApi.GetLine(modelID, a.RelatingProcess.value) : null;
        if (process && process.GlobalId && a.RelatedObjects) {
          var taskGuid = process.GlobalId.value;
          for (var aj = 0; aj < a.RelatedObjects.length; aj++) {
            try {
              var obj = ifcApi.GetLine(modelID, a.RelatedObjects[aj].value);
              if (obj && obj.GlobalId) _pushTE(taskGuid, obj.GlobalId.value);
            } catch(e) {}
          }
        }
      } catch(e) {}
    }
  } catch(e) {}
  // Direction 2 — IfcRelAssignsToProduct (Bonsai: RelatingProduct=element, RelatedObjects=tasks)
  try {
    var prodIds = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCRELASSIGNSTOPRODUCT);
    for (var pri = 0; pri < prodIds.size(); pri++) {
      try {
        var rp = ifcApi.GetLine(modelID, prodIds.get(pri));
        var product = rp.RelatingProduct ? ifcApi.GetLine(modelID, rp.RelatingProduct.value) : null;
        if (product && product.GlobalId && rp.RelatedObjects) {
          var elemGuid = product.GlobalId.value;
          for (var pj = 0; pj < rp.RelatedObjects.length; pj++) {
            try {
              var tobj = ifcApi.GetLine(modelID, rp.RelatedObjects[pj].value);
              if (tobj && tobj.GlobalId) _pushTE(tobj.GlobalId.value, elemGuid);
            } catch(e) {}
          }
        }
      } catch(e) {}
    }
  } catch(e) {}
  // ── END copied logic ──

  if (schedules.length || tasks.length) {
    console.log('§4D_FOUND schedules=' + schedules.length + ' tasks=' + tasks.length + ' sequences=' + taskSequences.length + ' taskElements=' + taskElements.length);
  } else {
    console.log('§4D_NONE no scheduling data in this IFC');
  }
  // Per-direction breakdown for diagnostics
  console.log('§4D_DETAIL workSchedules=' + schedules.length + ' tasks=' + tasks.length +
    ' seqs=' + taskSequences.length + ' uniqueTaskElements=' + taskElements.length);
  // T1b W-VOCAB witness — widened fields populated at the §5.2 evidence rates.
  function _cnt4d(f) { var n = 0; for (var z = 0; z < tasks.length; z++) if (tasks[z][f] != null) n++; return n; }
  var _nSummary = 0; for (var z = 0; z < tasks.length; z++) if (tasks[z].isSummary) _nSummary++;
  console.log('§4D_WIDE earlyStart=' + _cnt4d('earlyStart') + ' totalFloat=' + _cnt4d('totalFloat') +
    ' isCritical=' + _cnt4d('isCritical') + ' wbsParent=' + _cnt4d('wbsParent') +
    ' summary=' + _nSummary + ' calendars=' + calendars.length);
  ifcApi.CloseModel(modelID);

  // ── DB-rows check: same widened DDL + INSERT as import_db_builder.js ──
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('CREATE TABLE schedules (schedule_id TEXT PRIMARY KEY, name TEXT, status TEXT, created_date TEXT)');
  db.run('CREATE TABLE tasks (task_id TEXT PRIMARY KEY, schedule_id TEXT, wbs_parent TEXT, name TEXT, predefined_type TEXT, is_summary INTEGER, schedule_start TEXT, schedule_finish TEXT, schedule_duration TEXT, early_start TEXT, early_finish TEXT, late_start TEXT, late_finish TEXT, free_float TEXT, total_float TEXT, is_critical INTEGER, resource TEXT, status TEXT)');
  db.run('CREATE TABLE task_sequences (predecessor_id TEXT, successor_id TEXT, sequence_type TEXT, lag_days REAL DEFAULT 0, PRIMARY KEY (predecessor_id, successor_id))');
  db.run('CREATE TABLE task_elements (task_id TEXT, guid TEXT, PRIMARY KEY (task_id, guid))');
  db.run('CREATE TABLE calendars (name TEXT, recurrence_type TEXT, raw TEXT)');
  var _schedId = (schedules[0] && schedules[0].id) || null;
  db.run('BEGIN');
  var stmtSc = db.prepare('INSERT OR IGNORE INTO schedules VALUES (?,?,?,?)');
  for (var i = 0; i < schedules.length; i++) stmtSc.run([schedules[i].id, schedules[i].name, schedules[i].status, schedules[i].created]);
  stmtSc.free();
  var stmtTk = db.prepare('INSERT OR IGNORE INTO tasks VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  for (var i = 0; i < tasks.length; i++) stmtTk.run([tasks[i].id, _schedId, tasks[i].wbsParent || null, tasks[i].name,
    tasks[i].predefinedType || null, (tasks[i].isSummary != null ? tasks[i].isSummary : 0),
    tasks[i].scheduleStart || null, tasks[i].scheduleFinish || null, tasks[i].scheduleDuration || null,
    tasks[i].earlyStart || null, tasks[i].earlyFinish || null, tasks[i].lateStart || null, tasks[i].lateFinish || null,
    tasks[i].freeFloat || null, tasks[i].totalFloat || null, (tasks[i].isCritical != null ? tasks[i].isCritical : null),
    null, tasks[i].status || null]);
  stmtTk.free();
  var stmtSq = db.prepare('INSERT OR IGNORE INTO task_sequences VALUES (?,?,?,?)');
  for (var i = 0; i < taskSequences.length; i++) stmtSq.run([taskSequences[i].predId, taskSequences[i].succId, taskSequences[i].type, taskSequences[i].lag]);
  stmtSq.free();
  var stmtTe = db.prepare('INSERT OR IGNORE INTO task_elements VALUES (?,?)');
  for (var i = 0; i < taskElements.length; i++) stmtTe.run([taskElements[i].taskId, taskElements[i].guid]);
  stmtTe.free();
  var stmtCal = db.prepare('INSERT INTO calendars VALUES (?,?,?)');
  for (var i = 0; i < calendars.length; i++) stmtCal.run([calendars[i].name || null, calendars[i].recurrenceType || null, calendars[i].raw || null]);
  stmtCal.free();
  db.run('COMMIT');

  function count(tbl) { var r = db.exec('SELECT COUNT(*) FROM ' + tbl); return (r.length && r[0].values.length) ? r[0].values[0][0] : 0; }
  function countNN(col) { var r = db.exec('SELECT COUNT(*) FROM tasks WHERE ' + col + ' IS NOT NULL'); return (r.length && r[0].values.length) ? r[0].values[0][0] : 0; }
  console.log('§4D_DB_ROWS schedules=' + count('schedules') + ' tasks=' + count('tasks') +
    ' task_sequences=' + count('task_sequences') + ' task_elements=' + count('task_elements') + ' calendars=' + count('calendars'));
  // Prove the widened columns survived the INSERT (not just collected in JS).
  var rSum = db.exec('SELECT COUNT(*) FROM tasks WHERE is_summary=1');
  var nSummaryDb = (rSum.length && rSum[0].values.length) ? rSum[0].values[0][0] : 0;
  console.log('§4D_DB_FIELDS schedule_duration=' + countNN('schedule_duration') +
    ' early_start=' + countNN('early_start') + ' total_float=' + countNN('total_float') +
    ' is_critical=' + countNN('is_critical') + ' wbs_parent=' + countNN('wbs_parent') +
    ' is_summary=' + nSummaryDb);
  db.close();
}

main().catch(e => { console.error('§FATAL', e.message, e.stack); process.exit(1); });
