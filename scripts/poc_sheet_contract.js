#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>. SPDX-License-Identifier: MIT
// Implementing prompts/MIGRATE_INSTALL_TENANT.md §EXPORTER-V3-SPEC + §SHEET-CONTRACT — Witness: W-SHEET-CONTRACT
// Issue it proves or disproves (owner, 2026-11-09): "3rd party such as Odoo may miss certain mandatory table properties and
//   intra-table relationships (_ID and <table>Line master-detail). Those should be there. If not, patch so."
//   → every sheet of the user-run export workbook (bim-ootb erp/odoo_agent/export.js v3) is COMPLETE against the measured
//   contract (build/erp/sheet_contract.json: AD IsMandatory ∪ legacy NOT NULL, minus what legacy PO.save fills itself);
//   every header is a real AD column; every lookup resolves to exactly one row of an EARLIER sheet; every patch is named
//   and counted; rows == the live Odoo counts. Judged independently of the exporter's own self-check.
// Run: node scripts/poc_sheet_contract.js [path/to/export.js]   (live Odoo on :8069 records a fresh fixture; else replays it)
// Exit 0 PASS · 1 FAIL · 3 INCONCLUSIVE (no Odoo and no fixture, or nothing judged)
'use strict';
var cp = require('child_process'), fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
var ROOT = path.join(__dirname, '..');
var EXPORT = process.argv[2] || '/tmp/wt-odoo-v3/erp/odoo_agent/export.js';
var XLSX = require(path.join(path.dirname(EXPORT), '..', 'xlsx.mini.min.js'));
var AD = process.env.AD_SEED || path.join(process.env.HOME, 'bim-ootb/erp/ad_seed.db');
var CONTRACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/erp/sheet_contract.json'), 'utf8'));
var FIX = path.join(ROOT, 'build/erp/odoo_fixture/odoodemo_export_v3_2026-11-09.json');
var MOCK = path.join(__dirname, 'odoo_mock/odoo_rpc_mock.js');
var LOGF = path.join(ROOT, 'build/erp/logs_migrate_2026-11-09/poc_sheet_contract.log');
var log = [], fails = 0, judged = 0;
function L(s) { console.log(s); log.push(s); }
function ok(c, m) { judged++; if (!c) fails++; L('  ' + (c ? '✓' : '✗ FAIL:') + ' ' + m); }
function finish(code, verdict) { L('\n' + verdict); fs.mkdirSync(path.dirname(LOGF), { recursive: true }); fs.writeFileSync(LOGF, log.join('\n') + '\n'); process.exit(code); }
function sleep(s) { cp.spawnSync('sleep', [String(s)]); }
function sq(sql) { return JSON.parse(cp.execFileSync('sqlite3', ['-json', AD, sql], { encoding: 'utf8', maxBuffer: 1 << 28 }) || '[]'); }
function runExport(port, dir) {
  fs.mkdirSync(dir, { recursive: true });
  var r = cp.spawnSync('node', [EXPORT], { cwd: dir, env: Object.assign({}, process.env, { ODOO_PORT: String(port), CUTOVER: '2026-11-09' }), encoding: 'utf8', timeout: 180000 });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || ''), dir: path.join(dir, 'odoo_export') };
}
function mock(mode, fix) { var p = cp.spawn('node', [MOCK, mode, fix], { stdio: ['ignore', 'pipe', 'pipe'] }); p.buf = ''; p.stdout.on('data', function (c) { p.buf += c; }); sleep(0.8); return p; }
function stop(p) { return new Promise(function (r) { p.on('exit', function () { r(p.buf); }); p.kill('SIGTERM'); }); }
// Odoo is up = its JSON-RPC answers (the login page redirects to the database chooser when the server holds several databases → 303, not "down")
function odooUp() { var r = cp.spawnSync('curl', ['-s', '--max-time', '5', '-H', 'Content-Type: application/json', '-d', '{"jsonrpc":"2.0","method":"call","params":{"service":"common","method":"version","args":[]}}', 'http://localhost:8069/jsonrpc'], { encoding: 'utf8' }); return /server_version/.test(r.stdout || ''); }

// ── the dictionary, read once: columns per table, and how an _ID column names its table (Ninja's own rule:
//    column minus _ID, else AD_Reference_Value_ID → AD_Ref_Table.AD_Key → that key's table) ──
var adCols = {};
sq("select t.TableName as TableName, c.ColumnName as ColumnName, c.AD_Reference_ID as AD_Reference_ID, c.AD_Reference_Value_ID as AD_Reference_Value_ID from AD_Column c join AD_Table t on t.AD_Table_ID=c.AD_Table_ID where c.IsActive='Y'")
  .forEach(function (r) { (adCols[r.TableName] = adCols[r.TableName] || {})[r.ColumnName] = r; });
var refKeyTable = {};
sq("select rt.AD_Reference_ID as ref, t.TableName as tbl from AD_Ref_Table rt join AD_Column k on k.AD_Column_ID=rt.AD_Key join AD_Table t on t.AD_Table_ID=k.AD_Table_ID")
  .forEach(function (r) { refKeyTable[r.ref] = r.tbl; });   // aliases: sqlite returns ad_ref_table's declared lower-case names otherwise
L('§SHEETC-W dictionary refTables=' + Object.keys(refKeyTable).length);
function lookupTable(table, col) {
  var name = col.replace(/_ID$/, '');
  if (adCols[name]) return name;
  var c = adCols[table] && adCols[table][col];
  return c && c.AD_Reference_Value_ID ? refKeyTable[c.AD_Reference_Value_ID] || null : null;
}

// ── THE JUDGE: workbook (sheets as arrays) + manifest → findings. Pure; the falsifiers call it on tampered copies. ──
function judge(book, manifest) {
  var f = { missing: [], badHeader: [], badLookup: [], blankRequired: [], badPatch: [], noParent: [], dupKey: [], perSheet: [] };
  var patchOf = {}; (manifest.patches || []).forEach(function (p) { patchOf[p.table + '.' + p.column] = p; });
  book.forEach(function (s, si) {
    var table = s.name.replace(/^\d\d/, ''), hdr = s.rows[0] || [], data = s.rows.slice(1), contract = CONTRACT.tables[table];
    if (!contract) { f.badHeader.push(s.name + ': table not in the contract'); return; }
    var cols = hdr.map(function (h) { return String(h).split('>')[0]; });
    hdr.forEach(function (h, hi) {
      var c = cols[hi], alt = String(h).split('>')[1];
      if (!adCols[table] || !adCols[table][c]) { f.badHeader.push(s.name + '.' + h + ' is not an AD column of ' + table); return; }
      if (alt !== undefined) { var lt = lookupTable(table, c); if (!lt || !adCols[lt][alt]) f.badHeader.push(s.name + '.' + h + ': ' + (lt || '?') + ' has no column ' + alt); }
    });
    var sup = 0, def = 0, pat = 0, miss = [];
    contract.required.forEach(function (r) {
      var at = cols.indexOf(r.column), p = patchOf[table + '.' + r.column];
      if (at >= 0) {
        if (p) pat++; else sup++;
        var blanks = data.filter(function (row) { return row[at] === undefined || row[at] === ''; }).length;
        if (blanks && !(p && /blank/.test(p.cell)) && r.default === 'none') f.blankRequired.push(s.name + '.' + r.column + ' blank in ' + blanks + ' row(s)');
      } else if (r.default !== 'none') def++;
      else miss.push(r.column);
    });
    if (miss.length) f.missing.push(s.name + ': ' + miss.join(','));
    contract.parentLink.forEach(function (pc) { if (cols.indexOf(pc) < 0) f.noParent.push(s.name + ' lacks its AD parent link ' + pc); });
    // lookups into the workbook: exactly one row of an EARLIER sheet (or this one, for a self-parent)
    hdr.forEach(function (h, hi) {
      var c = cols[hi]; if (!/_ID$/.test(c)) return;
      var lt = lookupTable(table, c); if (!lt) return;
      var src = book.slice(0, si + 1).filter(function (x) { return x.name.replace(/^\d\d/, '') === lt; })[0];
      if (!src) return;   // tenant / reference data: resolved at load (patch or country/currency code)
      var alt = String(h).split('>')[1] || (lt + 'Line' === table ? 'DocumentNo' : 'Name');   // Ninja: <table>Line → parent by DocumentNo; else Name
      var ki = (src.rows[0] || []).map(function (x) { return String(x).split('>')[0]; }).indexOf(alt);
      if (ki < 0) { f.badLookup.push(s.name + '.' + h + ': ' + src.name + ' has no ' + alt + ' column'); return; }
      var n = {}; src.rows.slice(1).forEach(function (r) { var v = r[ki]; if (v !== '' && v !== undefined) n[v] = (n[v] || 0) + 1; });
      data.forEach(function (row, ri) { var v = row[hi]; if ((v === '' || v === undefined) && /Parent/.test(c)) return;
        if (n[v] !== 1) f.badLookup.push(s.name + ' r' + (ri + 2) + ' ' + h + '="' + v + '" → ' + (n[v] || 0) + ' row(s) of ' + src.name); });
    });
    // legacy unique indexes: a key whose columns the sheet gives must not repeat (columns the sheet leaves out take ONE default / the tenant value, i.e. constant per sheet)
    (contract.unique || []).forEach(function (u) {
      var at = u.columns.map(function (c) { return cols.map(function (x) { return x.toLowerCase(); }).indexOf(c); });
      if (at.every(function (i) { return i < 0; })) return;
      var seen = {}; data.forEach(function (row, ri) { var k = at.map(function (i) { return i < 0 ? '·' : row[i]; }).join('|');
        if (at.some(function (i) { return i >= 0 && (row[i] === '' || row[i] === undefined); })) return;   // NULL never collides in a pg unique index
        if (seen[k]) f.dupKey.push(s.name + ' r' + (ri + 2) + ' repeats r' + seen[k] + ' on ' + u.index + '(' + u.columns.join(',') + ')'); else seen[k] = ri + 2; });
    });
    f.perSheet.push({ sheet: s.name, rows: data.length, supplied: sup, defaulted: def, patched: pat, missing: miss });
  });
  (manifest.patches || []).forEach(function (p) {
    var s = book.filter(function (x) { return x.name.replace(/^\d\d/, '') === p.table; })[0];
    if (!s) { f.badPatch.push(p.table + '.' + p.column + ': no such sheet'); return; }
    if (!(p.rows > 0) || p.rows > s.rows.length - 1) f.badPatch.push(p.table + '.' + p.column + ' rows=' + p.rows + ' vs sheet rows ' + (s.rows.length - 1));
    if (!p.rule) f.badPatch.push(p.table + '.' + p.column + ' has no rule');
  });
  return f;
}
function readBook(dir) {
  var wb = XLSX.read(fs.readFileSync(path.join(dir, 'odoo_migration.xlsx')));
  return wb.SheetNames.map(function (n) { return { name: n, rows: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: '', raw: false }) }; });
}
function bookHash(book) { return crypto.createHash('sha256').update(JSON.stringify(book)).digest('hex').slice(0, 16); }

(async function () {
  L('══ W-SHEET-CONTRACT — export workbook complete against the measured contract (' + EXPORT + ') ══');
  L('§SHEETC-W contract measured=' + CONTRACT.measured + ' tables=' + Object.keys(CONTRACT.tables).length + ' sources: ' + CONTRACT.sources.ad_seed + ' · ' + CONTRACT.sources.pg);
  var T = fs.mkdtempSync(path.join(os.tmpdir(), 'sheetc-')), main, mode;
  if (process.env.SHEETC_MODE !== 'replay' && odooUp()) {
    mode = 'live';
    main = runExport(8069, path.join(T, 'live'));
    if (fs.existsSync(FIX)) fs.unlinkSync(FIX);
    var rec = mock('record', FIX); runExport(8070, path.join(T, 'rec')); L('§RECORD ' + (await stop(rec)).trim().split('\n').pop());
  } else if (fs.existsSync(FIX)) {
    mode = 'replay';
    var rp0 = mock('replay', FIX); main = runExport(8070, path.join(T, 'rep0')); await stop(rp0);
  } else { L('§NO-ODOO no live Odoo on :8069 and no fixture ' + path.relative(ROOT, FIX)); finish(3, '⚪ W-SHEET-CONTRACT INCONCLUSIVE — nothing to judge'); }
  L('§SHEETC-W mode=' + mode + ' export exit=' + main.code);
  main.out.split('\n').filter(function (l) { return /✗|🔴|ERROR/.test(l); }).forEach(function (l) { L('   exporter: ' + l.trim()); });
  if (main.code !== 0 || !fs.existsSync(path.join(main.dir, 'odoo_migration.xlsx'))) { ok(false, 'the export ran and published a workbook (exit ' + main.code + ')'); finish(1, '🔴 W-SHEET-CONTRACT FAIL (' + fails + ')'); }
  var manifest = JSON.parse(fs.readFileSync(path.join(main.dir, 'manifest.json'), 'utf8')), book = readBook(main.dir);
  var empty = book.filter(function (s) { return s.rows.length < 2; }).map(function (s) { return s.name; });
  if (empty.length) { L('§VACUOUS empty sheets: ' + empty.join(',')); finish(3, '⚪ W-SHEET-CONTRACT INCONCLUSIVE — empty sheet(s), their 0 findings mean nothing'); }
  ok(book.length === Object.keys(CONTRACT.tables).length, 'the workbook has one sheet per contract table, in order (' + book.map(function (s) { return s.name.slice(0, 2); }).join(' ') + ')');

  var f = judge(book, manifest);
  f.perSheet.forEach(function (p) { L('§SHEETC-W sheet=' + p.sheet + ' rows=' + p.rows + ' supplied=' + p.supplied + ' defaulted=' + p.defaulted + ' patched=' + p.patched + ' missing=[' + p.missing.join(',') + ']'); });
  (manifest.patches || []).forEach(function (p) { L('§SHEETC-W patch ' + p.table + '.' + p.column + ' rows=' + p.rows + ' rule=' + p.rule); });
  function show(arr) { return arr.length + (arr.length ? ': ' + arr.slice(0, 6).join(' | ') : ''); }
  ok(f.missing.length === 0, 'every required column of every sheet is supplied, defaulted by legacy PO.save, or patched — missing ' + show(f.missing));
  ok(f.badHeader.length === 0, 'every header is an AD column of its table, every `>` names a column of the looked-up table — bad ' + show(f.badHeader));
  ok(f.blankRequired.length === 0, 'no required column with no legacy default is left blank in a row — ' + show(f.blankRequired));
  ok(f.badLookup.length === 0, 'every in-workbook lookup finds exactly one row of an earlier sheet — bad ' + show(f.badLookup));
  var nU = Object.keys(CONTRACT.tables).reduce(function (n, t) { return n + (CONTRACT.tables[t].unique || []).length; }, 0);
  ok(nU > 0 && f.dupKey.length === 0, 'no sheet repeats a key of a legacy unique index (' + nU + ' indexes over the 17 tables) — ' + show(f.dupKey));
  ok(f.noParent.length === 0, 'every detail sheet carries its AD parent-link column — ' + show(f.noParent));
  ok(f.badPatch.length === 0 && (manifest.patches || []).length > 0, 'every patch names its rule and a row count within its sheet (' + (manifest.patches || []).length + ' patches) — ' + show(f.badPatch));

  // non-invent: rows == the live Odoo counts (manifest.source_counts were read from search_count by the agent)
  var sc = manifest.source_counts, rows = {}; book.forEach(function (s) { rows[s.name.replace(/^\d\d/, '')] = s.rows.length - 1; });
  function cnt(k) { return sc[k] !== undefined ? sc[k] : sc[k + ' (archived too)']; }   // §HARDEN-SPEC H2: partners/products/locations are read with archived ones (tagged key)
  var pairs = [['C_UOM', 'uom.uom []'], ['C_PaymentTerm', 'account.payment.term []'], ['M_Product_Category', 'product.category []'], ['C_ElementValue', 'account.account []'],
    ['M_Product', 'product.product []'], ['M_Product_PO', 'product.supplierinfo []'], ['M_ProductPrice', 'product.product []'], ['M_Warehouse', 'stock.warehouse []'],
    ['M_Locator', 'stock.location [["usage","=","internal"]]']];
  var off = pairs.filter(function (p) { return rows[p[0]] !== cnt(p[1]); }).map(function (p) { return p[0] + ' ' + rows[p[0]] + '≠' + cnt(p[1]); });
  var prov = JSON.parse(fs.readFileSync(path.join(main.dir, 'provenance.json'), 'utf8'));
  var poSheet = book.filter(function (x) { return /M_Product_PO$/.test(x.name); })[0].name, poIds = {}, poPairs = {};
  // a row carries every Odoo seller it stands for (ids: price breaks of one vendor fold into one row, legacy has one M_Product_PO per vendor); a template seller appears once per variant
  var poSh = book.filter(function (x) { return /M_Product_PO$/.test(x.name); })[0], piC = poSh.rows[0].indexOf('M_Product_ID>Value'), bpC = poSh.rows[0].indexOf('C_BPartner_ID>Value');
  prov[poSheet].forEach(function (o, i) { (o.ids || [o.id]).forEach(function (id) { poIds[id] = (poIds[id] || 0) + 1; }); var r = poSh.rows[i + 1]; poPairs[r[piC] + '/' + r[bpC]] = 1; });
  rows.M_Product_PO = Object.keys(poIds).length;   // judged on distinct Odoo seller rows; the variant expansion is reported below
  var ilSheet = book.filter(function (x) { return /M_InventoryLine$/.test(x.name); })[0].name, qIds = {}, qDup = 0;
  prov[ilSheet].forEach(function (o) { (o.ids || [o.id]).forEach(function (id) { if (qIds[id]) qDup++; qIds[id] = 1; }); });
  L('§SHEETC-W M_InventoryLine rows=' + prov[ilSheet].length + ' carry ' + Object.keys(qIds).length + ' Odoo quants (dup ' + qDup + ')');
  if (Object.keys(qIds).length !== cnt('stock.quant [["location_id.usage","=","internal"]]') || qDup) off.push('M_InventoryLine quants ' + Object.keys(qIds).length + '≠' + cnt('stock.quant [["location_id.usage","=","internal"]]'));
  off = off.filter(function (x) { return !/^M_Product_PO /.test(x); });
  if (rows.M_Product_PO !== cnt('product.supplierinfo []')) off.push('M_Product_PO distinct sellers ' + rows.M_Product_PO + '≠' + cnt('product.supplierinfo []'));
  var expanded = Object.keys(poIds).filter(function (k) { return poIds[k] > 1; });
  L('§SHEETC-W M_Product_PO rows=' + prov[poSheet].length + ' distinct supplierinfo=' + Object.keys(poIds).length + ' template-sellers expanded to variants=' + expanded.length +
    ' (' + expanded.map(function (k) { return k + '×' + poIds[k]; }).join(',') + ') product/vendor pairs unique=' + (Object.keys(poPairs).length === prov[poSheet].length ? 'Y' : 'N'));
  if (Object.keys(poPairs).length !== prov[poSheet].length) off.push('M_Product_PO has a repeated (product, vendor) pair');
  var partnersPlaced = rows.C_BPartner + rows.AD_User + (manifest.held || []).length;
  if (partnersPlaced !== cnt('res.partner []')) off.push('partners ' + partnersPlaced + '≠' + cnt('res.partner []'));
  ok(off.length === 0, 'sheet rows == live Odoo search_count for all ' + (pairs.length + 3) + ' slices (partners = C_BPartner ' + rows.C_BPartner + ' + AD_User ' + rows.AD_User + ' + held ' + (manifest.held || []).length + ') — off ' + show(off));

  if (mode === 'live') {
    var rp = mock('replay', FIX), r2 = runExport(8070, path.join(T, 'rep')), repOut = await stop(rp);
    L('§REPLAY ' + repOut.trim().split('\n').pop());
    ok(!/MISS/.test(repOut) && r2.code === 0 && bookHash(readBook(r2.dir)) === bookHash(book), 'replay from the recording gives the same sheets (' + bookHash(book) + ')');
    var r3 = runExport(8069, path.join(T, 'live2'));
    ok(bookHash(readBook(r3.dir)) === bookHash(book), 'two live runs give the same sheets (deterministic)');
  }

  // FALSIFIERS — the judge must catch a tampered workbook (proves the checks can fail, not only pass)
  var bp = JSON.parse(JSON.stringify(book)), mf = JSON.parse(JSON.stringify(manifest));
  var s5 = bp.filter(function (s) { return /C_BPartner$/.test(s.name); })[0], gi = s5.rows[0].indexOf('C_BP_Group_ID>IsDefault');
  s5.rows.forEach(function (r) { r.splice(gi, 1); }); mf.patches = mf.patches.filter(function (p) { return !(p.table === 'C_BPartner' && p.column === 'C_BP_Group_ID'); });
  var f1 = judge(bp, mf);
  L('§FALSIFIER-1 drop the C_BP_Group_ID patch → missing ' + show(f1.missing));
  ok(f1.missing.some(function (m) { return /C_BPartner: .*C_BP_Group_ID/.test(m); }), 'falsifier 1: dropping the default-group patch is reported as C_BPartner missing C_BP_Group_ID');
  // §HARDEN-SPEC H1: an address is found by its C_Location_UU (iDempiere's migration key), not by its street — the falsifier duplicates that key
  var bl = JSON.parse(JSON.stringify(book)), sl = bl.filter(function (s) { return /C_Location$/.test(s.name); })[0], ai = sl.rows[0].indexOf('C_Location_UU');
  var used = bl.filter(function (s) { return /C_BPartner_Location$/.test(s.name); })[0].rows[1][1];
  var other = sl.rows.slice(1).filter(function (r) { return r[ai] !== used; })[0]; other[ai] = used;
  var f2 = judge(bl, manifest);
  L('§FALSIFIER-2 duplicate C_Location_UU "' + used + '" → bad lookups ' + show(f2.badLookup));
  ok(f2.badLookup.some(function (m) { return m.indexOf(used) >= 0 && /→ 2 row/.test(m); }), 'falsifier 2: a duplicated C_Location_UU makes the location lookup ambiguous (2 rows), not silently first-match');

  var bu = JSON.parse(JSON.stringify(book)), lo = bu.filter(function (s) { return /M_Locator$/.test(s.name); })[0], H3 = lo.rows[0];
  var wi = H3.indexOf('M_Warehouse_ID>Value'), a3 = 1, b3 = lo.rows.findIndex(function (r, i) { return i > 1 && r[wi] === lo.rows[1][wi]; });
  ['X', 'Y', 'Z'].forEach(function (c) { lo.rows[b3][H3.indexOf(c)] = lo.rows[a3][H3.indexOf(c)]; });
  var f3 = judge(bu, manifest);
  L('§FALSIFIER-3 give locator r' + (b3 + 1) + ' the X/Y/Z of r' + (a3 + 1) + ' (same warehouse ' + lo.rows[1][wi] + ') → dup keys ' + show(f3.dupKey));
  ok(b3 > 1 && f3.dupKey.some(function (m) { return /m_location_where/.test(m); }), 'falsifier 3: two locators of one warehouse at the same X/Y/Z are reported against m_location_where');
  L('§FIXTURE ' + path.relative(ROOT, FIX) + (fs.existsSync(FIX) ? ' answers=' + JSON.parse(fs.readFileSync(FIX, 'utf8')).meta.answers : ' (none)'));
  if (judged < 8) finish(3, '⚪ W-SHEET-CONTRACT INCONCLUSIVE — only ' + judged + ' checks ran');
  finish(fails ? 1 : 0, fails ? '🔴 W-SHEET-CONTRACT FAIL (' + fails + ')' : '🟢 W-SHEET-CONTRACT PASS (' + mode + ')');
})();
