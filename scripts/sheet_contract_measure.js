#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §EXPORTER-V3-SPEC (the measured contract) — feeds Witness: W-SHEET-CONTRACT
// Measures, for each migration target table, the columns a sheet row MUST end up with (AD IsMandatory ∪ legacy pg NOT NULL) and
//   where legacy fills each one when the sheet leaves it empty: PO.setStandardDefaults · the model's setInitialDefaults() · the
//   pg column DEFAULT (PO.buildInsertSQL skips NULLs). Also the AD parent-link columns (IsParent) of each detail table.
//   Nothing typed by hand: every row comes from ad_seed.db, the pilot postgres, or the iDempiere 13 Java source.
// Run: node scripts/sheet_contract_measure.js   (needs: sqlite3 CLI, docker container `postgres` with idempiere_pilot)
'use strict';
var cp = require('child_process'), fs = require('fs'), path = require('path'), crypto = require('crypto');
var ROOT = path.join(__dirname, '..');
var AD = process.env.AD_SEED || path.join(process.env.HOME, 'bim-ootb/erp/ad_seed.db');
var SRC = path.join(process.env.HOME, 'idempiere-dev-setup/idempiere/org.adempiere.base/src/org/compiere/model');
var PGDB = process.env.PGDB || 'idempiere_pilot';
var OUT = path.join(ROOT, 'build/erp/sheet_contract.json');
var LOG = path.join(ROOT, 'build/erp/logs_migrate_2026-11-09/sheet_contract_measure.log');
var TABLES = ['C_UOM', 'C_PaymentTerm', 'M_Product_Category', 'C_ElementValue', 'C_BPartner', 'C_Location', 'C_BPartner_Location', 'AD_User',
  'M_Product', 'M_Product_PO', 'M_PriceList', 'M_PriceList_Version', 'M_ProductPrice', 'M_Warehouse', 'M_Locator', 'M_Inventory', 'M_InventoryLine'];
var log = [];
function L(s) { console.log(s); log.push(s); }
function sha(buf) { return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16); }
function sq(sql) { return JSON.parse(cp.execFileSync('sqlite3', ['-json', AD, sql], { encoding: 'utf8' }) || '[]'); }

// PO.setStandardDefaults (PO.java) — the column names it fills, read from the source, not typed
var poSrc = fs.readFileSync(path.join(SRC, 'PO.java'), 'utf8');
var stdStart = poSrc.indexOf('protected void setStandardDefaults()'), stdEnd = poSrc.indexOf('//  setDefaults', stdStart);
var stdBody = poSrc.slice(stdStart, stdEnd);
var poStd = { suffix: [], exact: [] };
(stdBody.match(/colName\.endsWith\("([A-Za-z]+)"\)/g) || []).forEach(function (m) { poStd.suffix.push(/"([A-Za-z]+)"/.exec(m)[1]); });
(stdBody.match(/colName\.equals\("([A-Za-z_]+)"\)/g) || []).forEach(function (m) { poStd.exact.push(/"([A-Za-z_]+)"/.exec(m)[1]); });
var stdLine = poSrc.slice(0, stdStart).split('\n').length;
L('§SHEETC po-standard PO.java:' + stdLine + ' suffix=' + poStd.suffix.join(',') + ' exact=' + poStd.exact.join(',') + ' +key(<Table>_ID)');
// PO.saveNew fills an empty DocumentNo / Value from the document sequence (PO.java "Set new DocumentNo" / "Set empty Value")
var snStart = poSrc.indexOf('private boolean saveNew()'), snBody = poSrc.slice(snStart, poSrc.indexOf('private boolean doInsert', snStart));
var poSaveNew = {};
(snBody.match(/columnName = "([A-Za-z_]+)";/g) || []).forEach(function (m) { var c = /"([A-Za-z_]+)"/.exec(m)[1];
  poSaveNew[c] = poSrc.slice(0, snStart + snBody.indexOf(m)).split('\n').length; });
L('§SHEETC po-savenew ' + Object.keys(poSaveNew).map(function (c) { return c + '@PO.java:' + poSaveNew[c]; }).join(' '));
function isPoStd(t, c) { return c === t + '_ID' || poStd.exact.indexOf(c) >= 0 || poStd.suffix.some(function (s) { return c.endsWith(s); }); }

// model class per table: iDempiere's DefaultModelFactory naming (M + table name without prefix and underscores), else X_
function modelFile(t) {
  var base = t.replace(/^[A-Z]{1,2}_/, '').replace(/_/g, '');
  var cand = ['M' + base, 'M' + t.replace(/^[A-Z]{1,2}_/, ''), 'X_' + t];
  for (var i = 0; i < cand.length; i++) if (fs.existsSync(path.join(SRC, cand[i] + '.java'))) return cand[i];
  return null;
}
function initialDefaults(cls) {
  if (!cls || /^X_/.test(cls)) return { line: null, cols: {} };
  var src = fs.readFileSync(path.join(SRC, cls + '.java'), 'utf8'), lines = src.split('\n');
  var at = lines.findIndex(function (l) { return /void setInitialDefaults\s*\(\s*\)/.test(l); });
  if (at < 0) return { line: null, cols: {} };
  var cols = {}, depth = 0, started = false;
  for (var i = at; i < lines.length; i++) {
    var raw = lines[i], code = raw.replace(/\/\/.*$/, '');
    if (!/^\s*\/\//.test(raw)) { var m = /\bset([A-Za-z0-9_]+)\s*\(/.exec(code); if (m && i > at) cols[m[1]] = i + 1; }
    depth += (code.match(/\{/g) || []).length; if (depth > 0) started = true;
    depth -= (code.match(/\}/g) || []).length; if (started && depth <= 0) break;
  }
  return { line: at + 1, cols: cols };
}

var pgCols = {};
var pgOut = cp.execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', PGDB, '-At', '-F', '|', '-c',
  "select table_name, column_name, is_nullable, coalesce(column_default,'') from information_schema.columns where table_schema='adempiere' and table_name in (" +
  TABLES.map(function (t) { return "'" + t.toLowerCase() + "'"; }).join(',') + ')'], { encoding: 'utf8' });
pgOut.trim().split('\n').forEach(function (l) { var p = l.split('|'); (pgCols[p[0]] = pgCols[p[0]] || {})[p[1]] = { notNull: p[2] === 'NO', def: p[3] }; });
var pgVersion = cp.execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', PGDB, '-At', '-c',
  "select coalesce((select max(name) from adempiere.ad_migrationscript),'') "], { encoding: 'utf8' }).trim();
L('§SHEETC pg db=' + PGDB + ' tables=' + Object.keys(pgCols).length + '/' + TABLES.length + ' lastMigrationScript=' + pgVersion);

var contract = { measured: new Date().toISOString().slice(0, 10), sources: { ad_seed: path.basename(AD) + ' sha ' + sha(fs.readFileSync(AD)),
  pg: PGDB + ' ' + pgVersion, po: 'PO.java sha ' + sha(poSrc) + ' setStandardDefaults:' + stdLine }, poStandard: poStd, poSaveNew: poSaveNew, tables: {} };
var totalNone = 0;
TABLES.forEach(function (t) {
  var adc = sq("select c.ColumnName, c.IsMandatory, c.AD_Reference_ID, c.IsParent, c.IsKey from AD_Column c join AD_Table tb on tb.AD_Table_ID=c.AD_Table_ID " +
    "where tb.TableName='" + t + "' and c.IsActive='Y' and coalesce(c.ColumnSQL,'')=''");
  var pg = pgCols[t.toLowerCase()] || {};
  var cls = modelFile(t), init = initialDefaults(cls);
  if (cls && !/^X_/.test(cls)) contract.sources[cls] = cls + '.java sha ' + sha(fs.readFileSync(path.join(SRC, cls + '.java')));
  var req = [], parents = [];
  adc.forEach(function (c) {
    var p = pg[c.ColumnName.toLowerCase()] || {};
    if (c.IsParent === 'Y') parents.push(c.ColumnName);
    if (c.IsMandatory !== 'Y' && !p.notNull) return;
    if (/_UU$/.test(c.ColumnName) || isPoStd(t, c.ColumnName)) return;
    var src = init.cols[c.ColumnName] ? 'model:' + cls + '.java:' + init.cols[c.ColumnName] : p.def ? 'db-default:' + p.def
      : poSaveNew[c.ColumnName] ? 'po-savenew:PO.java:' + poSaveNew[c.ColumnName] : 'none';
    if (src === 'none') totalNone++;
    req.push({ column: c.ColumnName, adMandatory: c.IsMandatory === 'Y', pgNotNull: !!p.notNull, ref: c.AD_Reference_ID, default: src });
  });
  req.sort(function (a, b) { return a.column < b.column ? -1 : 1; });
  contract.tables[t] = { model: cls, initialDefaultsAt: init.line, parentLink: parents, required: req };
  var none = req.filter(function (r) { return r.default === 'none'; }).map(function (r) { return r.column; });
  L('§SHEETC table=' + t + ' model=' + cls + (init.line ? ':' + init.line : '') + ' required=' + req.length + ' defaulted=' + (req.length - none.length) +
    ' mustSupply=' + none.length + ' [' + none.join(',') + '] parentLink=[' + parents.join(',') + ']');
});
L('§SHEETC tables=' + TABLES.length + ' mustSupplyTotal=' + totalNone + (Object.keys(pgCols).length === TABLES.length ? '' : ' ⚠ pg tables missing'));
fs.writeFileSync(OUT, JSON.stringify(contract, null, 1));
fs.mkdirSync(path.dirname(LOG), { recursive: true }); fs.writeFileSync(LOG, log.join('\n') + '\n');
L('§SHEETC wrote ' + path.relative(ROOT, OUT));
