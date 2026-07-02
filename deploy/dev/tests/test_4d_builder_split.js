#!/usr/bin/env node
/**
 * BIM OOTB — Drop-IFC DB builder SPLIT-path witness (Node).
 * Implementing 4D_CAPTURE_AND_FALLBACK.md T1b — confirms the *actual* import_db_builder.js
 * (not just the extraction logic) carries the widened 4D schema through BOTH outputs:
 *   - the full single extractedDb
 *   - the split metaDb (Hospital = 56,141 elements > 15,000 → splits; 4D MUST land in meta, not geo)
 *
 * Issue this proves: "does a real Drop-IFC export of a large building contain the widened
 * 4D tables (schedules/tasks[18-col]/task_sequences/task_elements/calendars) in meta.db?"
 *
 * Run: node deploy/dev/tests/test_4d_builder_split.js 2>&1 | tee deploy/dev/tests/4d_builder_split.log
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function main() {
  const SQL = await initSqlJs();
  // Load buildImportDBs() — the file is a plain script (no module.exports), so eval it.
  const src = fs.readFileSync(path.join(__dirname, '..', 'import_db_builder.js'), 'utf8');
  eval(src); // defines buildImportDBs in this scope

  // ── Mock data shaped exactly like import_worker.js result ──
  const N = 15001; // > 15000 → triggers the split path
  const elements = [], transforms = [], geometries = [];
  for (let i = 0; i < N; i++) {
    const g = 'E' + i;
    elements.push({ guid: g, ifcClass: 'IfcWall', name: 'W' + i, storey: 'L1', discipline: 'ARC', material: null });
    transforms.push({ guid: g, cx: 0, cy: 0, cz: 0, rx: 0, ry: 0, rz: 0, bx: 1, by: 1, bz: 1 });
  }
  // one tiny geometry so component_geometries is non-empty
  geometries.push({ guid: 'E0', geomHash: 'H0',
    vertices: new Float32Array([0,0,0]).buffer, indices: new Uint32Array([0]).buffer, normals: null });

  // Widened 4D fixtures (field names match import_worker.js)
  const schedules = [{ id: 'S1', name: 'Baseline Schedule', status: 'PLANNED', created: '2026-04-29' }];
  const tasks = [
    { id: 'T_SUM', name: 'Structures', predefinedType: 'NOTDEFINED', wbsParent: null, isSummary: 1,
      scheduleStart: null, scheduleFinish: null, scheduleDuration: null,
      earlyStart: null, earlyFinish: null, lateStart: null, lateFinish: null,
      freeFloat: null, totalFloat: null, isCritical: null, status: null },
    { id: 'T_A', name: 'Zone A', predefinedType: 'CONSTRUCTION', wbsParent: 'T_SUM', isSummary: 0,
      scheduleStart: '2026-05-16T09:00:00', scheduleFinish: '2026-05-30T17:00:00', scheduleDuration: 'P15D',
      earlyStart: '2026-05-16T09:00:00', earlyFinish: '2026-05-20T17:00:00',
      lateStart: '2026-05-16T09:00:00', lateFinish: '2026-05-20T17:00:00',
      freeFloat: 'P0D', totalFloat: 'P0D', isCritical: 1, status: null },
    { id: 'T_B', name: 'Zone B', predefinedType: 'CONSTRUCTION', wbsParent: 'T_SUM', isSummary: 0,
      scheduleStart: '2026-05-31T09:00:00', scheduleFinish: '2026-06-14T17:00:00', scheduleDuration: 'P15D',
      earlyStart: '2026-05-31T09:00:00', earlyFinish: '2026-06-04T17:00:00',
      lateStart: '2026-06-01T09:00:00', lateFinish: '2026-06-05T17:00:00',
      freeFloat: 'P1D', totalFloat: 'P1D', isCritical: 0, status: null },
  ];
  const taskSequences = [{ predId: 'T_A', succId: 'T_B', type: 'FINISH_START', lag: 0 }];
  const taskElements = [{ taskId: 'T_A', guid: 'E0' }, { taskId: 'T_B', guid: 'E1' }];
  const calendars = [{ name: '9 - 5', recurrenceType: 'WEEKLY', raw: '{"workingTimes":1}' }];

  const data = {
    meta: { name: 'Hospital 2.0', filename: 'Hospital 2.0.ifc' },
    elements, transforms, geometries, bomTree: [],
    schedules, tasks, taskSequences, taskElements, calendars,
  };

  const out = buildImportDBs(SQL, data);
  console.log('§BUILD_OUT extractedDb=' + (out.extractedDb ? 'yes' : 'no') +
    ' metaDb=' + (out.metaDb ? 'yes' : 'no') + ' geoDb=' + (out.geoDb ? 'yes' : 'no'));

  function report(tag, buf) {
    if (!buf) { console.log(tag + ' MISSING'); return; }
    const db = new SQL.Database(new Uint8Array(buf));
    const tbls = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const names = (tbls.length ? tbls[0].values.map(v => v[0]) : []);
    function c(t) { try { const r = db.exec('SELECT COUNT(*) FROM ' + t); return (r.length && r[0].values.length) ? r[0].values[0][0] : 0; } catch(e) { return 'ABSENT'; } }
    console.log(tag + ' tables=[' + names.join(',') + ']');
    console.log(tag + '_4D schedules=' + c('schedules') + ' tasks=' + c('tasks') +
      ' task_sequences=' + c('task_sequences') + ' task_elements=' + c('task_elements') + ' calendars=' + c('calendars'));
    // prove widened columns present + populated in the split output
    try {
      const r = db.exec("SELECT COUNT(*) FROM tasks WHERE schedule_duration IS NOT NULL");
      const r2 = db.exec("SELECT COUNT(*) FROM tasks WHERE is_critical IS NOT NULL");
      const r3 = db.exec("SELECT COUNT(*) FROM tasks WHERE wbs_parent IS NOT NULL");
      const r4 = db.exec("SELECT COUNT(*) FROM tasks WHERE is_summary=1");
      console.log(tag + '_COLS schedule_duration=' + r[0].values[0][0] + ' is_critical=' + r2[0].values[0][0] +
        ' wbs_parent=' + r3[0].values[0][0] + ' is_summary=' + r4[0].values[0][0]);
    } catch(e) { console.log(tag + '_COLS ERROR ' + e.message); }
    db.close();
  }
  report('§4D_FULL', out.extractedDb);
  report('§4D_META', out.metaDb);
  // geoDb should NOT carry 4D — confirm separation
  if (out.geoDb) {
    const gdb = new SQL.Database(new Uint8Array(out.geoDb));
    const gt = gdb.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('§4D_GEO tables=[' + (gt.length ? gt[0].values.map(v => v[0]).join(',') : '') + ']');
    gdb.close();
  }
}
main().catch(e => { console.error('§FATAL', e.message, e.stack); process.exit(1); });
