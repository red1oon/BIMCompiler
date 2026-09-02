// ⚠ DO NOT REMOVE — NINJA_MODE_LANE.md §Phase B: AD staging into sql.js.
// Stage HRMIS model into a copy of ad_seed.db; verify §AD-RENDER gate (menus + windows rendered).
// Witness: §NINJA-STAGE tables=<n> cols=<m> windows=<n> menus=<n> render=PASS rollback=PASS
// Run via: bash build/erp/run_witness.sh scripts/poc_ninja_stage.js
// Read the log after EVERY run.

'use strict';

var path = require('path');
var fs   = require('fs');

var initSqlJs = require(path.join(__dirname, '..', 'node_modules', 'sql.js'));
var XLSX      = require(path.join(__dirname, '..', 'node_modules', 'xlsx', 'xlsx.js'));

var NinjaModel = require(path.join(__dirname, '..', 'build', 'erp', 'ninja_model.js'));
var NinjaStage = require(path.join(__dirname, '..', 'build', 'erp', 'ninja_stage.js'));

var HRMIS_PATH    = path.resolve(__dirname, '..', '..', 'Projects', 'org.idempiere.ninja', 'templates', 'Ninja_HRMIS.xlsx');
var SEED_DB_PATH  = path.resolve(__dirname, '..', 'build', 'erp', 'post_poc', 'ad_seed.db');
var OUT_DB_PATH   = path.resolve('/tmp', 'ninja_stage_test.db');

(async function main() {
  console.log('§ NINJA-STAGE starting');

  // 1. Parse HRMIS model
  var wb = XLSX.readFile(HRMIS_PATH);
  var rows = XLSX.utils.sheet_to_json(wb.Sheets['2_RO_ModelMaker'], { header: 1, defval: '' });
  var model = NinjaModel.parseSheet(rows, { format: 'romo' });
  console.log('§ Model: bundleName=' + model.bundleName +
    ' tables=' + model.tables.length +
    ' warnings=' + model.warnings.length);

  // Use only the 18 oracle tables (exclude HR_Terminology which fails in Java apply)
  var oracleTables = new Set([
    'HR_HumanResourceManagement','HR_JobDesignation','HR_Trainer','HR_Rank',
    'HR_TrainingCourse','HR_ManpowerRequirement','HR_ProjectTaskForce',
    'HR_EmployeeProvidentFund','HR_Employment','HR_EmploymentHistory',
    'HR_MedicalHIstory','HR_Payroll','HR_PayrollDetails','HR_FamilyMembers',
    'HR_Appraisal','HR_Training','HR_LeaveApplication','HR_AssistanceRequest'
  ]);
  var filteredModel = Object.assign({}, model, {
    tables: model.tables.filter(function (t) { return oracleTables.has(t.name); })
  });
  console.log('§ Filtered model: tables=' + filteredModel.tables.length + ' (excluding HR_Terminology)');

  // 2. Load sql.js and open the seed db
  var SQL = await initSqlJs({
    locateFile: function (f) {
      return path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', f);
    }
  });

  if (!fs.existsSync(SEED_DB_PATH)) {
    console.error('FAIL: seed db not found at ' + SEED_DB_PATH);
    process.exit(1);
  }

  var seedBuf = fs.readFileSync(SEED_DB_PATH);
  var db = new SQL.Database(seedBuf);
  console.log('§ Seed db loaded (' + seedBuf.length + ' bytes)');

  // 3. Stage models
  var counts = NinjaStage.stageModels(db, filteredModel, 1234567890);
  console.log('§ Staged: tables=' + counts.tables +
    ' cols=' + counts.cols +
    ' windows=' + counts.windows +
    ' tabs=' + counts.tabs +
    ' fields=' + counts.fields +
    ' menus=' + counts.menus +
    ' skipped=' + counts.skipped);

  // 4. §AD-RENDER gate — verify the renderer can fold the staged AD
  // R1: menu nodes exist (AD_Menu with IsSummary='Y' for bundle + leaves)
  var menuNodes = db.exec("SELECT COUNT(*) FROM AD_Menu WHERE AD_Menu_ID >= " + NinjaStage.NINJA_BASE + " AND IsActive='Y'");
  var menuCount = menuNodes[0].values[0][0];
  console.log('§ AD_Menu rows: ' + menuCount + ' (expect ' + (filteredModel.tables.length + 1) + ')');

  // R2: windows openable (AD_Window → AD_Tab → AD_Table chain intact)
  var windowChain = db.exec(
    'SELECT COUNT(*) FROM AD_Window w' +
    ' JOIN AD_Tab t ON t.AD_Window_ID=w.AD_Window_ID' +
    ' JOIN AD_Table tb ON tb.AD_Table_ID=t.AD_Table_ID' +
    " WHERE w.AD_Window_ID >= " + NinjaStage.NINJA_BASE + " AND w.IsActive='Y'"
  );
  var chainCount = windowChain[0].values[0][0];
  console.log('§ Window→Tab→Table chain: ' + chainCount + ' (expect ' + filteredModel.tables.length + ')');

  // R3: fields shown (AD_Field → AD_Column chain)
  var fieldChain = db.exec(
    'SELECT COUNT(*) FROM AD_Field f' +
    ' JOIN AD_Column c ON c.AD_Column_ID=f.AD_Column_ID' +
    " WHERE f.AD_Field_ID >= " + NinjaStage.NINJA_BASE + " AND f.IsActive='Y'"
  );
  var fieldChainCount = fieldChain[0].values[0][0];
  console.log('§ Field→Column chain: ' + fieldChainCount + ' (expect ' + counts.fields + ')');

  // R4: kernel_ops has NINJA_STAGE entry
  var opLog = db.exec("SELECT parameters FROM kernel_ops WHERE op_type='NINJA_STAGE' ORDER BY id DESC LIMIT 1");
  var opLogOk = opLog.length > 0 && opLog[0].values.length > 0;
  console.log('§ kernel_ops NINJA_STAGE: ' + (opLogOk ? 'PRESENT ' + opLog[0].values[0][0] : 'MISSING'));

  var renderPass = (Number(menuCount) === filteredModel.tables.length + 1) &&
                   (Number(chainCount) === filteredModel.tables.length) &&
                   (Number(fieldChainCount) === counts.fields) &&
                   opLogOk;

  console.log('§ §AD-RENDER: ' + (renderPass ? 'PASS' : 'FAIL'));

  // 5. Rollback test
  var rbCounts = NinjaStage.rollbackModel(db, model.bundleName);
  console.log('§ Rollback: tables=' + rbCounts.tables + ' cols=' + rbCounts.cols + ' windows=' + rbCounts.windows);

  var afterRollback = db.exec(
    "SELECT COUNT(*) FROM AD_Table WHERE AD_Table_ID >= " + NinjaStage.NINJA_BASE + " AND IsActive='Y'"
  );
  var activeAfter = afterRollback[0].values[0][0];
  var rollbackPass = Number(activeAfter) === 0;
  console.log('§ Active AD_Table after rollback: ' + activeAfter + ' (expect 0) → ' + (rollbackPass ? 'PASS' : 'FAIL'));

  // 6. Save staged db for manual inspection
  var exported = db.export();
  fs.writeFileSync(OUT_DB_PATH, Buffer.from(exported));
  console.log('§ Saved test db: ' + OUT_DB_PATH);

  // 7. Verdict
  var pass = renderPass && rollbackPass;
  var totalCols = counts.cols;

  console.log('');
  console.log('§NINJA-STAGE tables=' + filteredModel.tables.length +
    ' cols=' + totalCols +
    ' windows=' + counts.windows +
    ' menus=' + counts.menus +
    ' render=' + (renderPass ? 'PASS' : 'FAIL') +
    ' rollback=' + (rollbackPass ? 'PASS' : 'FAIL'));

  // §TWIN-CLASSIFIED-MARKERS: explicit verdict line (the §NINJA-STAGE line above carries the numbers).
  console.log(pass ? '🟢 W-NINJA-STAGE PASS — render + rollback' : '🔴 W-NINJA-STAGE FAIL — render=' + renderPass + ' rollback=' + rollbackPass);
  if (!pass) process.exit(1);
})();
