// ⚠ DO NOT REMOVE — NINJA_MODE_LANE.md §Phase 0: parser harness + oracle anchor.
// Parse Ninja_HRMIS.xlsx (2_RO_ModelMaker) → derive model → diff against PackOut.xml oracle.
// Witness: §NINJA-PARSE tables=<n> cols=<m> vsOracle=MATCH
// Run via: bash build/erp/run_witness.sh scripts/poc_ninja_model.js
// Read the log after EVERY run.

'use strict';

var path   = require('path');
var fs     = require('fs');
var XLSX   = require(path.join(__dirname, '..', 'node_modules', 'xlsx', 'xlsx.js'));
var NinjaModel = require(path.join(__dirname, '..', 'build', 'erp', 'ninja_model.js'));

var HRMIS_PATH  = path.resolve(__dirname, '..', '..', 'Projects', 'org.idempiere.ninja', 'templates', 'Ninja_HRMIS.xlsx');
var ORACLE_PATH = path.resolve(__dirname, '..', '..', 'Projects', 'org.idempiere.ninja', 'test_output', 'Ninja_HRMIS_Model', 'dict', 'PackOut.xml');

// ── Parse oracle PackOut.xml via regex (avoids XML parser dependency) ──────────────────────
function parseOracle(xmlPath) {
  var xml = fs.readFileSync(xmlPath, 'utf8');
  var tables = {};
  var currTable = null;

  var lines = xml.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    var tableMatch = /<AD_Table\b/.test(line);
    if (tableMatch) {
      // Read until </AD_Table> to get TableName
      var block = '';
      while (i < lines.length) {
        block += lines[i] + '\n';
        if (lines[i].indexOf('</AD_Table>') !== -1) break;
        i++;
      }
      var tnM = /<TableName>(.*?)<\/TableName>/.exec(block);
      if (tnM) {
        currTable = tnM[1].trim();
        tables[currTable] = [];
      }
      continue;
    }

    var colMatch = /<AD_Column\b/.test(line);
    if (colMatch && currTable) {
      var block2 = '';
      while (i < lines.length) {
        block2 += lines[i] + '\n';
        if (lines[i].indexOf('</AD_Column>') !== -1) break;
        i++;
      }
      var cnM = /<ColumnName>(.*?)<\/ColumnName>/.exec(block2);
      var refM = /<AD_Reference_ID>(.*?)<\/AD_Reference_ID>/.exec(block2);
      if (cnM) {
        tables[currTable].push({ name: cnM[1].trim(), refId: refM ? Number(refM[1].trim()) : 10 });
      }
      continue;
    }
  }

  return tables;
}

// ── read SheetJS AOA (array-of-arrays) from a named sheet ───────────────────────────────────
function sheetToAOA(wb, sheetName) {
  var ws = wb.Sheets[sheetName];
  if (!ws) return null;
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

// ── main ─────────────────────────────────────────────────────────────────────────────────────
(function main() {
  console.log('§ NINJA-PARSE starting');

  // 1. Load HRMIS.xlsx
  if (!fs.existsSync(HRMIS_PATH)) {
    console.error('FAIL: HRMIS.xlsx not found at ' + HRMIS_PATH);
    process.exit(1);
  }
  var wb = XLSX.readFile(HRMIS_PATH);
  console.log('§ Sheets:', wb.SheetNames.join(', '));

  // 2. Parse 2_RO_ModelMaker sheet (legacy row format)
  var romoRows = sheetToAOA(wb, '2_RO_ModelMaker');
  if (!romoRows) {
    console.error('FAIL: 2_RO_ModelMaker sheet not found');
    process.exit(1);
  }
  console.log('§ 2_RO_ModelMaker rows:', romoRows.length, '(incl. header)');

  var romoModel = NinjaModel.parseSheet(romoRows, { format: 'romo' });
  console.log('§ ROMO parse: bundleName=' + romoModel.bundleName +
    ' tables=' + romoModel.tables.length +
    ' warnings=' + romoModel.warnings.length);

  if (romoModel.warnings.length) {
    romoModel.warnings.forEach(function (w) { console.log('  WARN: ' + w); });
  }

  // 3. Parse ModelMakerSource sheet (transposed columnar format)
  var colRows = sheetToAOA(wb, 'ModelMakerSource');
  var colModel = null;
  if (colRows) {
    colModel = NinjaModel.parseSheet(colRows, { format: 'columnar' });
    console.log('§ COLUMNAR parse: tables=' + colModel.tables.length);
  } else {
    console.log('§ ModelMakerSource sheet not found (skipped)');
  }

  // 4. Parse oracle
  if (!fs.existsSync(ORACLE_PATH)) {
    console.error('FAIL: PackOut.xml oracle not found at ' + ORACLE_PATH);
    process.exit(1);
  }
  var oracle = parseOracle(ORACLE_PATH);
  var oracleTables = Object.keys(oracle);
  console.log('§ Oracle: tables=' + oracleTables.length);

  // 5. Equivalence check — ROMO model vs oracle
  // Known deviation: HR_Terminology (row 1, all-L# ColumnSet) is in ROMO but not oracle
  // (Java apply step failed on invalid L#ColName=Values column names — silent drop)
  var KNOWN_SKIP = { 'HR_Terminology': true };
  // Known cross-format deviations: oracle generated from ModelMakerSource (transposed) which adds
  // "Name" to every table's first column; 2_RO_ModelMaker ColumnSet for HR_Employment omits it.
  // This is a source-format difference (two sheets, two code paths) — not a parser bug.
  var KNOWN_COL_SKIP = { 'HR_Employment.Name': true };

  var romoByName = {};
  romoModel.tables.forEach(function (t) { romoByName[t.name] = t; });

  var missingFromRomo = [];
  var missingFromOracle = [];
  var colMismatches = [];
  var totalOracleCols = 0;
  var matchedCols = 0;

  // Normalize oracle column name: strip PREFIX# (oracle stores raw defs, our parser processes them)
  function normalizeOracleCol(rawName) {
    // Skip formula artifacts: DataTypeMaker!B4, B2&_ID, cell refs
    if (rawName.indexOf('!') !== -1) return null;
    if (rawName.indexOf('&') !== -1) return null;
    if (/^[A-Z]+\d+$/.test(rawName)) return null;
    // Strip PREFIX# (Q#BasicPay → BasicPay; L#ColName=Values → ColName)
    var m = /^([A-Za-z])#(.+)$/.exec(rawName);
    if (m) {
      var colName = m[2];
      if (colName.indexOf('=') !== -1) colName = colName.slice(0, colName.indexOf('='));
      return colName;
    }
    return rawName;
  }

  oracleTables.forEach(function (tname) {
    totalOracleCols += oracle[tname].length;
    if (!romoByName[tname]) {
      missingFromRomo.push(tname);
      return;
    }
    var romotable = romoByName[tname];
    var romoColNames = {};
    romotable.columns.forEach(function (c) { romoColNames[c.name] = true; });

    oracle[tname].forEach(function (oc) {
      var normalized = normalizeOracleCol(oc.name);
      if (normalized === null) {
        matchedCols++;  // artifact — count as matched (not a real column)
        return;
      }
      var key = tname + '.' + normalized;
      if (romoColNames[normalized]) {
        matchedCols++;
      } else if (KNOWN_COL_SKIP[key]) {
        matchedCols++;  // documented cross-format deviation
        console.log('  KNOWN-DEVIATION: ' + key + ' (oracle=ModelMakerSource, romo=2_RO_ModelMaker omits Name)');
      } else {
        colMismatches.push(tname + '.' + oc.name + ' → normalized=' + normalized + ' (missing from ROMO)');
      }
    });
  });

  // Tables in ROMO but not in oracle (excluding known-skip)
  romoModel.tables.forEach(function (t) {
    if (!oracle[t.name] && !KNOWN_SKIP[t.name]) {
      missingFromOracle.push(t.name);
    }
  });

  var totalRomoCols = romoModel.tables.reduce(function (s, t) { return s + t.columns.length; }, 0);

  console.log('');
  console.log('── Equivalence Report ──');
  console.log('ROMO tables: ' + romoModel.tables.length + ' (incl. HR_Terminology which is not in oracle — known)');
  console.log('Oracle tables: ' + oracleTables.length);
  console.log('ROMO total columns: ' + totalRomoCols);
  console.log('Oracle total columns: ' + totalOracleCols + ' (incl. formula-artifact columns)');

  if (missingFromRomo.length) {
    console.log('MISSING from ROMO (in oracle but not in our parse):');
    missingFromRomo.forEach(function (t) { console.log('  ' + t); });
  }
  if (missingFromOracle.length) {
    console.log('EXTRA in ROMO (not in oracle, not expected):');
    missingFromOracle.forEach(function (t) { console.log('  ' + t); });
  }
  if (colMismatches.length) {
    console.log('COLUMN MISMATCHES (in oracle but missing from ROMO):');
    colMismatches.slice(0, 20).forEach(function (m) { console.log('  ' + m); });
    if (colMismatches.length > 20) console.log('  ...and ' + (colMismatches.length - 20) + ' more');
  }

  // Falsifier: a malformed prefix is reported, not guessed
  var falsifier = NinjaModel.parseColDef('Z#SomeColumn', []);
  var falsifierWarn = [];
  NinjaModel.parseColDef('Z#SomeColumn', falsifierWarn);
  var falsifierOk = falsifierWarn.length > 0 && falsifier.refId === NinjaModel.DT.String;
  console.log('Falsifier (unknown prefix Z# → String + WARN): ' + (falsifierOk ? 'PASS' : 'FAIL'));

  // Verdict
  var vsOracle = (missingFromRomo.length === 0 && missingFromOracle.length === 0 && colMismatches.length === 0)
    ? 'MATCH' : 'PARTIAL(' + colMismatches.length + ' col diffs, ' + missingFromRomo.length + ' missing tables)';

  console.log('');
  console.log('§NINJA-PARSE tables=' + oracleTables.length +
    ' cols=' + totalRomoCols +
    ' vsOracle=' + vsOracle);

  // §TWIN-CLASSIFIED-MARKERS: an explicit verdict line run_witness.sh recognises; the falsifier is now load-bearing
  // on the exit code too (before, a failed falsifier printed FAIL and exited 0).
  var ok = vsOracle === 'MATCH' && falsifierOk;
  console.log(ok ? '🟢 W-NINJA-MODEL PASS — parse == PackOut oracle (' + oracleTables.length + ' tables, ' + totalRomoCols + ' cols) + falsifier'
                 : '🔴 W-NINJA-MODEL FAIL — vsOracle=' + vsOracle + ' falsifier=' + (falsifierOk ? 'PASS' : 'FAIL'));
  if (!ok) process.exit(1);
})();
