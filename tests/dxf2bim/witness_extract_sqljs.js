// ⚠ DO NOT REMOVE — W-EXTRACT-BROWSER (lane spec §L5.6 S5b): the extractor core run through the BROWSER path (Uint8Array shim + sql.js database) writes the
// same DB as the Node path (Buffer + better-sqlite3). Issue it proves/disproves: "the Modeller's in-browser extraction differs from the proven Node extractor".
// The web-ifc engine is the same wasm build in both; what this isolates is the shim + the sql.js adapter. Control: a doctored row must FAIL.
// Usage: node tests/dxf2bim/witness_extract_sqljs.js <ifc>... (NODE_PATH must reach web-ifc, better-sqlite3, sql.js)
'use strict';
const fs = require('fs'), path = require('path'), WebIFC = require('web-ifc'), Database = require('better-sqlite3'), initSqlJs = require('sql.js');
const Core = require('../../scripts/ifc_extract_core.js');
const dumpB = db => { const o = {}; db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().forEach(({ name }) => { o[name] = db.prepare(`SELECT * FROM "${name}"`).all().map(r => JSON.stringify(r, (k, v) => (v && v.type === 'Buffer' ? Buffer.from(v.data).toString('hex') : v))).filter(r => !/"key":"(import_date|source_file)"/.test(r)).sort(); }); return o; };
const hex = u => Buffer.from(u).toString('hex');
function dumpS(sdb) { const o = {}; sdb.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0].values.forEach(([name]) => { const r = sdb.exec(`SELECT * FROM "${name}"`)[0]; o[name] = r ? r.values.map(v => JSON.stringify(Object.fromEntries(r.columns.map((c, i) => [c, v[i] instanceof Uint8Array ? hex(v[i]) : v[i]])))).filter(x => !/"key":"(import_date|source_file)"/.test(x)).sort() : []; }); return o; }
(async () => {
  const SQL = await initSqlJs(); let fails = 0;
  for (const ifc of process.argv.slice(2)) {
    const base = path.basename(ifc, '.ifc'), data = new Uint8Array(fs.readFileSync(ifc));
    const mk = async () => { const api = new WebIFC.IfcAPI(); await api.Init(); return api; };
    const bdb = new Database(':memory:');
    await Core.extractToDb({ WebIFC, ifcApi: await mk(), ifcData: data, db: bdb, Buf: Buffer, buildingName: base, sourceName: base + '.ifc' });
    const sdb = new SQL.Database();
    await Core.extractToDb({ WebIFC, ifcApi: await mk(), ifcData: data, db: Core.sqljsDb(sdb), Buf: Core.browserBuf, buildingName: base, sourceName: base + '.ifc' });
    const A = dumpB(bdb), B = dumpS(sdb), bad = [];
    new Set(Object.keys(A).concat(Object.keys(B))).forEach(t => { const a = A[t], b = B[t]; if (!a || !b || a.length !== b.length || a.some((r, i) => r !== b[i])) bad.push(`${t}: node=${a ? a.length : '-'} browser=${b ? b.length : '-'}`); });
    const n = Object.values(A).reduce((s, r) => s + r.length, 0);
    console.log(`${bad.length ? 'FAIL' : 'PASS'} W-EXTRACT-BROWSER[${base}] | browser-path DB differs from the Node-path DB | tables=${Object.keys(A).length} rows=${n}${bad.length ? ' ' + bad.join('; ') : ''}`);
    if (bad.length) fails++;
    if (ifc === process.argv[2]) { const C = JSON.parse(JSON.stringify(B)); const t = Object.keys(C).find(k => C[k].length); C[t][0] += ' '; const d = Object.keys(A).filter(k => A[k].some((r, i) => r !== C[k][i])); console.log(`${d.length ? 'PASS' : 'FAIL'} W-EXTRACT-BROWSER-control | a doctored row is seen | ${d.length ? 'FAILED as required' : 'BLIND'}`); if (!d.length) fails++; }
  }
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
