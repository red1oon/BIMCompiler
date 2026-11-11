#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film7 "Migrating Legacy Accounting" (EN). Scope: PREP the three source-side input files the real forms pick. READ THE LOG after every run (§FILM7-PREP lines).
// Run: node prep7.js <erp-tree-root> <outdir>.   Inputs are produced by the SHIPPED readers: iDempiere open_reader.js (read-only psql, GardenWorld client 11), SAP agent open_reader.js
// against the test mock Service Layer (ALPHA, test-supplied ledger), BC package written by tests/bc_package_writer.js (ALPHA, test-supplied). Nothing typed: every file is a reader/writer output.
'use strict';
const path = require('path'), fs = require('fs'), url = require('url'), cp = require('child_process');
const ROOT = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const ERP = path.join(ROOT, 'erp'), T = path.join(ERP, 'tests'), CUT = '2026-11-10';
(async () => {
  const SAPX = JSON.parse(fs.readFileSync(path.join(T, 'fixtures/sapbc_open/sap_rows.json'), 'utf8')), BCX = JSON.parse(fs.readFileSync(path.join(T, 'fixtures/sapbc_open/bc_rows.json'), 'utf8'));
  // SAP
  const SR = require(path.join(ERP, 'sap_agent/open_reader.js')), MOCK = require(path.join(T, 'sap_sl_open_mock.js')), mk = await MOCK.start(SAPX), calls = [];
  const S = await SR.run({ url: mk.url, company: 'TESTDB', user: 'manager', password: 'mock', cutover: CUT }, null, (l) => calls.push(l)); const sc = mk.calls.slice(); mk.close();
  fs.writeFileSync(path.join(OUT, 'sap_open.json'), JSON.stringify(S));
  console.log('§FILM7-PREP sap_open.json sets=' + Object.keys(S.sets).map((k) => k + ':' + S.sets[k].length).join(',') + ' sl_calls=' + sc.length + ' all_read_only=' + sc.every((c) => /^GET /.test(c) || /^POST \/b1s\/v1\/(Login|Logout|CompanyService_GetAdminInfo)$/.test(c)) + ' problems=' + JSON.stringify(S.manifest.problems));
  calls.filter((l) => /^§SAP-OPEN/.test(l)).slice(-3).forEach((l) => console.log('  shipped> ' + l.slice(0, 300)));
  // BC
  const XLSX = require(path.join(ERP, 'xlsx.mini.min.js')), MODEL = (await import(url.pathToFileURL(path.join(ERP, 'plugins/bc_model.mjs')).href)).default;
  const buf = require(path.join(T, 'bc_package_writer.js')).write(XLSX, MODEL, BCX, 'TEST-BC'); fs.writeFileSync(path.join(OUT, 'bc_package.xlsx'), buf);
  console.log('§FILM7-PREP bc_package.xlsx bytes=' + buf.length + ' tables=' + Object.keys(BCX.rows).length);
  // iDempiere (legacy GardenWorld, read only)
  const r = cp.spawnSync('node', [path.join(ERP, 'idempiere_agent/open_reader.js'), '--cutover', CUT, '--db', process.env.IDEMPIERE_TEST_DB || 'idempiere_test', '--client', '11', '--container', 'postgres', '--out', path.join(OUT, 'idempiere_open.json')],
    { encoding: 'utf8', env: Object.assign({}, process.env, { PGPASSWORD: process.env.IDEMPIERE_PGPASSWORD || process.env.PGPASSWORD || 'adempiere' }) });
  console.log('§FILM7-PREP idempiere_open rc=' + r.status + ' ' + (r.stdout + r.stderr).split('\n').filter((l) => /§IDO-READ|rror/.test(l)).slice(0, 8).join(' | '));
  process.exit(r.status ? 1 : 0);
})();
