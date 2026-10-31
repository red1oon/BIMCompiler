#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — W-HQ-HOTSPOTS (bim-compiler prompts/TEAMWORK_FRAMEWORK.md §45.7; CARDINAL TWIN RULE: the twin does what legacy iDempiere does). READ THE LOG after every run: every verdict is a §HS line,
//   the exit code is not the evidence. A mutant that CRASHES is NOT a kill: it must print its own FAIL verdict. Each claim names the issue it proves or disproves.
// Judges the three head-office hot spots found by W-SCALE-STAR (§45.5): HS1 login context rebuilt per process, HS2 reply authoring refolding the log per row, HS3 import cost growing with the DB.
// Run:  node scripts/witness_hq_hotspots.js <bim-ootb tree> [--base <bim-ootb tree of main>] [--only hs1,hs2,hs3]      (HS2's identical-replies claim needs --base)
var path = require('path'), fs = require('fs'), cp = require('child_process'), crypto = require('crypto'), url = require('url');
var OOTB = process.argv[2], argv = process.argv.slice(3), A = {}; for (var ai = 0; ai < argv.length; ai++) if (/^--/.test(argv[ai])) A[argv[ai].slice(2)] = argv[++ai];
if (!OOTB) { console.log('§HS-VERDICT INCONCLUSIVE - no bim-ootb tree given'); process.exit(2); }
var ONLY = (A.only || 'hs1,hs2,hs3').split(','), BASE = A.base || null, BC = path.join(__dirname, '..');
var SQLJS_DIR = process.env.SQLJS_DIR || '/home/red1/bim-ootb/tests/node_modules/sql.js'; process.env.SQLJS = SQLJS_DIR; if (!global.window) global.window = {};
var judged = 0, fails = 0, inconc = 0, REAL = console.log;
function say(s) { REAL(s); }
function ck(id, issue, ok, detail) { judged++; if (!ok) fails++; say('§HS ' + (ok ? 'PASS' : 'FAIL') + ' ' + id + ' - ' + issue + (detail ? ' :: ' + detail : '')); }
function inc(id, why) { inconc++; say('§HS INCONCLUSIVE ' + id + ' - ' + why); }
function ERP(f) { return path.join(OOTB, 'erp', f); }
function quiet(fn) { var l = console.log, out = []; console.log = function () { out.push(Array.prototype.join.call(arguments, ' ')); }; try { return { r: fn(), out: out }; } finally { console.log = l; } }
async function quietA(fn) { var l = console.log, out = []; console.log = function () { out.push(Array.prototype.join.call(arguments, ' ')); }; try { return { r: await fn(), out: out }; } finally { console.log = l; } }
var SQLM;
async function openDb() { var initSqlJs = require(SQLJS_DIR); SQLM = SQLM || await initSqlJs({ locateFile: function (f) { return path.join(SQLJS_DIR, 'dist', f); } });
  var db = new SQLM.Database(new Uint8Array(fs.readFileSync(ERP('ad_seed.db')))), ok = 0; fs.readFileSync(ERP('patches/ad_seed.db.sql'), 'utf8').split(/;\s*\n/).forEach(function (st) { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (st) try { db.run(st); ok++; } catch (e) {} });
  return db; }
function req(f) { return require(ERP(f)); }
function bootKernel(db) { req('ad_rule.js').ensure(db); req('ad_import_tables.js').ensure(db); try { req('ad_index_overlay.js').ensure(db); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } return req('ws_kernel.js').build(db); }   // the overlays the HOST runs; ws_kernel.build(db) itself is the product's
function nowMs() { return Number(process.hrtime.bigint() / 1000n) / 1000; }

// ───────────────────────── HS1 ─────────────────────────
async function hs1() {
  say('§HS-SECTION HS1 login context = Env.getCtx(): built once per login identity (legacy Login.loadPreferences U/Login.java:477, RolePanel.java:910, ValuePreference.java:583)');
  var db = await openDb(), kk = quiet(function () { return bootKernel(db); }).r, AP = req('ad_process.js'), AC = req('ad_callout.js'), Env = AC.Env, seen = [], builds = 0;
  var q0 = kk.q; var cq = function (sql, p) { if (/FROM AD_Preference/i.test(sql)) builds++; return q0.call(this, sql, p); };
  AP.defineProcess('org.star.HS1Probe', function (SvrProcess) { function P() { SvrProcess.call(this); } P.prototype = Object.create(SvrProcess.prototype);
    P.prototype.doIt = function () { var c = this.getCtx(); seen.push({ pref: Env.getContext(c, 'P|STAR_HS1'), org: String(Env.getContext(c, '#AD_Org_ID')), role: String(Env.getContext(c, '#AD_Role_ID')), ctx: c }); return 'ok'; }; return P; });
  var S = { clientId: 11, orgId: 11, userId: 100, roleId: 102, warehouseId: 103, actor: 'witness:hs1' };
  db.run("INSERT INTO ad_preference (ad_preference_id, ad_client_id, ad_org_id, isactive, attribute, value, preferencefor, ad_preference_uu) VALUES (9899001, 11, 0, 'Y', 'STAR_HS1', 'v1', 'W', 'star-hs1-uu')");
  function run(sess) { var env = kk.env(sess); var r = quiet(function () { return AP.runJava(cq, env, { AD_Process_ID: 0, className: 'org.star.HS1Probe', title: 'hs1', params: {} }); }); return { r: r.r, out: r.out, env: env }; }
  var b0 = builds; for (var i = 0; i < 5; i++) run(S);
  var b1 = builds - b0;
  ck('HS1-C1', 'five processes of one session build the login context at most once (RED on main: one build per process)', b1 <= 1 && seen.length === 5 && seen.every(function (x) { return x.pref === 'v1'; }), 'builds=' + b1 + ' ran=' + seen.length + ' pref=' + seen.map(function (x) { return x.pref; }).join(','));
  // C2 (legacy: an AD_Preference row written after login is NOT seen until the next login)
  db.run("UPDATE ad_preference SET value='v2' WHERE ad_preference_id=9899001"); var n0 = seen.length, bb = builds; run(S);
  ck('HS1-C2a', 'a preference changed in the DB AFTER login is not seen by the next process of the same session (legacy: Login.loadPreferences ran at login)', seen.length === n0 + 1 && seen[n0].pref === 'v1', 'sees=' + (seen[n0] && seen[n0].pref) + ' builds=' + (builds - bb));
  S.roleId = 103; run(S);          // the SAME login session switches role (RolePanel: loadPreferences again): the holder is unchanged, only the identity key moves
  ck('HS1-C2b', 'a new login (role switch) loads the changed preference', seen[seen.length - 1].pref === 'v2' && seen[seen.length - 1].role === '103', 'sees=' + seen[seen.length - 1].pref + ' role=' + seen[seen.length - 1].role);
  S.orgId = 12; run(S);
  ck('HS1-C3', 'an organization switch rebuilds: the process sees the new #AD_Org_ID', seen[seen.length - 1].org === '12', 'org=' + seen[seen.length - 1].org);
  // C2c: resetSession = a fresh login for the SAME identity (the API a host calls when the user logs in again)
  if (typeof AC.resetSession === 'function') { db.run("UPDATE ad_preference SET value='v3' WHERE ad_preference_id=9899001"); var e4 = kk.env(S); AC.resetSession(e4.session); var nn = seen.length; quiet(function () { return AP.runJava(cq, e4, { AD_Process_ID: 0, className: 'org.star.HS1Probe', title: 'hs1', params: {} }); });
    ck('HS1-C2c', 'resetSession(holder) = a fresh login: the next process loads the current preference', seen.length === nn + 1 && seen[nn].pref === 'v3', 'sees=' + (seen[nn] && seen[nn].pref)); }
  else ck('HS1-C2c', 'resetSession(holder) exists (a host\'s login event)', false, 'AdCallout.resetSession is not defined');
  // C4: two kernels (two databases) never share a context even for the same identity
  var db2 = await openDb(), kk2 = quiet(function () { return bootKernel(db2); }).r; db2.run("INSERT INTO ad_preference (ad_preference_id, ad_client_id, ad_org_id, isactive, attribute, value, preferencefor, ad_preference_uu) VALUES (9899002, 11, 0, 'Y', 'STAR_HS1', 'other-db', 'W', 'star-hs1-uu2')");
  var n5 = seen.length; quiet(function () { return AP.runJava(kk2.q, kk2.env(S), { AD_Process_ID: 0, className: 'org.star.HS1Probe', title: 'hs1', params: {} }); });
  ck('HS1-C4', 'a second database (kernel) with the same identity gets its own context', seen.length === n5 + 1 && seen[n5].pref === 'other-db', 'sees=' + (seen[n5] && seen[n5].pref));
  db.close(); db2.close();
}

// ───────────────────────── HS2 ─────────────────────────
function engineReplies(tree) {
  var r = cp.spawnSync('node', [path.join(BC, 'scripts/witness_scale_star.js'), tree, 'engine', '--n', '4', '--m', '4', '--k', '2', '--workers', '2', '--budget-min', '10'], { encoding: 'utf8', maxBuffer: 1 << 28, timeout: 600000 });
  var m = /§STAR-HQ-REPLIES (\{.*\})/.exec(r.stdout || ''); return m ? JSON.parse(m[1]) : null;
}
function hs2() {
  say('§HS-SECTION HS2 reply authoring reads the roster once per translate pass (team_sync.js translate / rosterPersons)');
  var br = engineReplies(OOTB);
  if (!br) { inc('HS2', 'the engine harness produced no §STAR-HQ-REPLIES for ' + OOTB); return; }
  var down = br.movements + br.loans + br.schedules;
  ck('HS2-C5', 'S.order() (a whole-log refold) is called at most once per translate pass in the reply phase (2 passes here), not once per DOWN row (RED on main: ' + down + ')', br.order_calls <= 2, 'order_calls=' + br.order_calls + ' down_rows=' + down);
  if (!BASE) { inc('HS2-C6', 'no --base tree given: cannot compare the authored replies with main'); return; }
  var base = engineReplies(BASE);
  if (!base) { inc('HS2-C6', 'the base tree produced no replies line'); return; }
  ck('HS2-C6', 'the authored replies are IDENTICAL to main\'s (same specs, same order; uuids/timestamps normalised by first appearance)', base.spec_digest.sha === br.spec_digest.sha && base.spec_digest.n === br.spec_digest.n && br.spec_digest.n === down, 'main=' + base.spec_digest.sha + '/' + base.spec_digest.n + ' branch=' + br.spec_digest.sha + '/' + br.spec_digest.n + ' main_order_calls=' + base.order_calls);
}

// ───────────────────────── HS3 ─────────────────────────
async function hs3() {
  say('§HS-SECTION HS3 per-ticket import work does not grow with the orders already in the DB (find pushdown; legacy official indexes as a boot overlay)');
  var ML = null, db = await openDb(), kk = quiet(function () { return bootKernel(db); }).r; ML = kk.ML;
  // C8: find(exclude / ids) == the unrestricted answer filtered in JS, including this Trx's pending writes
  var S = { clientId: 11, orgId: 11, userId: 100, roleId: 102, warehouseId: 103, actor: 'witness:hs3' };
  var trx = new ML.Trx(kk.q, kk.env(S));
  function ins(k, st) { return ML.save(trx, 'i_order', null, ML.newPO(trx, 'i_order', { i_isimported: st, issotrx: 'Y', documentno: k, m_product_id: 123, qtyordered: 1, ad_org_id: 11, ad_client_id: 11 })); }
  var ids = []; ['Y', 'N', 'Y', null, 'E', 'N'].forEach(function (st, i) { var r = ins('HS3-' + i, st === null ? 'N' : st); if (r.ok) ids.push(r.id || r.i_order_id); });
  var all = trx.find('i_order', {}), idc = trx.idCol('i_order');
  var ex = trx.find('i_order', {}, null, { exclude: { i_isimported: 'Y' } }), exRef = all.filter(function (r) { return r.i_isimported == null || String(r.i_isimported) !== 'Y'; });
  var pick = all.slice(0, 3).map(function (r) { return r[idc]; }), idr = trx.find('i_order', {}, null, { ids: pick }), idRef = all.filter(function (r) { return pick.indexOf(r[idc]) >= 0 || pick.map(String).indexOf(String(r[idc])) >= 0; });
  var key = function (rs) { return rs.map(function (r) { return String(r[idc]) + ':' + r.i_isimported; }).sort().join(','); };
  ck('HS3-C8', 'find(exclude) and find(ids) give exactly the unrestricted answer filtered in JS, over pending writes too', all.length >= 6 && key(ex) === key(exRef) && key(idr) === key(idRef) && ex.length < all.length && idr.length === 3, 'all=' + all.length + ' exclude=' + ex.length + '/' + exRef.length + ' ids=' + idr.length + '/' + idRef.length);
  // C9: the legacy official indexes exist on the physical tables, and a lookup by c_bpartner_id uses one
  var plan = (db.exec("EXPLAIN QUERY PLAN SELECT * FROM c_payment WHERE c_bpartner_id=100")[0] || { values: [] }).values.map(function (v) { return v[3]; }).join(' ; ');
  var nIdx = ((db.exec("SELECT count(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_autoindex%'")[0] || { values: [[0]] }).values[0][0]);
  ck('HS3-C9', 'legacy\'s official dictionary indexes (IDEMPIERE-1132) exist on the physical tables: a lookup by c_payment.c_bpartner_id SEARCHes an index instead of SCANning (RED on main: no index at all)', /SEARCH c_payment USING INDEX c_payment_bpartner/.test(plan) && nIdx >= 70, 'plan=' + plan + ' indexes=' + nIdx);
  var plan2 = (db.exec("EXPLAIN QUERY PLAN SELECT * FROM c_invoice WHERE c_bpartner_id=100 AND ispaid='N'")[0] || { values: [] }).values.map(function (v) { return v[3]; }).join(' ; ');
  ck('HS3-C9b', 'the open-balance lookup (MBPartner.setTotalOpenBalance: c_bpartner_id + IsPaid=N pushed into the SELECT) SEARCHes legacy\'s c_invoice_paid index (IDEMPIERE-5259), not a scan of every invoice', /SEARCH c_invoice USING INDEX c_invoice_paid/.test(plan2), 'plan=' + plan2);
  var plan3 = (db.exec("EXPLAIN QUERY PLAN SELECT * FROM i_order WHERE i_order_id IN (1,2)")[0] || { values: [] }).values.map(function (v) { return v[3]; }).join(' ; ');
  ck('HS3-C9c', 'the import tables (created by the boot overlay without a primary key) get an id lookup index, so the scoped ticket read SEARCHes instead of scanning the whole table', /SEARCH i_order USING INDEX/.test(plan3), 'plan=' + plan3);
  // C10: the Team BASE does not move: the seed and the hashed patch texts are byte-identical to main's
  if (BASE) { var same = ['ad_seed.db', 'patches/ad_seed.db.sql', 'patches/mfg.sql'].map(function (f) { var a = path.join(OOTB, 'erp', f), b = path.join(BASE, 'erp', f); return !fs.existsSync(a) && !fs.existsSync(b) ? true : (fs.existsSync(a) && fs.existsSync(b) && crypto.createHash('sha256').update(fs.readFileSync(a)).digest('hex') === crypto.createHash('sha256').update(fs.readFileSync(b)).digest('hex')); });
    ck('HS3-C10', 'the Team BASE inputs (ad_seed.db, patches/ad_seed.db.sql, patches/mfg.sql) are byte-identical to main\'s: the fixes ship as boot overlays, outside the hashed base', same.every(Boolean), 'identical=' + JSON.stringify(same)); }
  else inc('HS3-C10', 'no --base tree: base-input identity not compared');
  db.close();
  // C7 runs in its own process (a second 45 MB sql.js kernel in this heap runs out of memory: seen); its § lines are relayed and counted
  var ch = cp.spawnSync('node', [__filename, OOTB, '--only', 'hs3flat'], { encoding: 'utf8', maxBuffer: 1 << 26, timeout: 1500000 });
  (ch.stdout || '').split('\n').filter(function (l) { return /^§HS (PASS|FAIL|INCONCLUSIVE) /.test(l); }).forEach(function (l) { say(l); var m = /^§HS (\w+) /.exec(l); judged += m[1] === 'INCONCLUSIVE' ? 0 : 1; if (m[1] === 'FAIL') fails++; if (m[1] === 'INCONCLUSIVE') inconc++; });
  if (!/§HS (PASS|FAIL|INCONCLUSIVE) HS3-C7/.test(ch.stdout || '')) inc('HS3-C7', 'the flat-cost child printed no verdict: ' + String(ch.stderr || '').slice(0, 200));
}
// C7: rows the model layer READS from i_order / i_payment per imported ticket must not depend on how many tickets are already imported
async function hs3Flat() {
  var db = await openDb(), kk = quiet(function () { return bootKernel(db); }).r, ML = kk.ML, AP = req('ad_process.js'), PR = req('plugin_registry.js'), reads = 0;
  var S = { clientId: 11, orgId: 11, userId: 100, roleId: 102, warehouseId: 103, actor: 'witness:hs3' }, ENVX = { clientAccounting: 'Q' }, D1 = '2026-10-29 00:00:00';
  var q0 = kk.q; kk.q = function (sql, p) { var r = q0.call(this, sql, p); if (/^\s*SELECT \* FROM (i_order|i_payment)\b/i.test(sql)) reads += (r || []).length; return r; };
  function commit(fn) { var trx = new ML.Trx(kk.q, Object.assign(kk.env(S), ENVX)), r; try { r = fn(trx, ML) || { ok: true }; } catch (ex) { r = { ok: false, error: String(ex && ex.stack) }; } var ok = r.ok !== false, ops = ok ? trx.groupOps() : []; if (ok && ops.length) kk.commit(S, ops, { ws: 'hs3' }); return Object.assign({}, r, { ok: ok, log: trx.log, trx: trx }); }
  function saveAll(rows) { return function (trx) { for (var i = 0; i < rows.length; i++) { var sv = ML.save(trx, rows[i].t, null, ML.newPO(trx, rows[i].t, rows[i].f)); if (!sv.ok) return { ok: false, error: rows[i].t + ': ' + sv.error }; } return { ok: true }; }; }
  var hostDb = { query: function (sql, p) { var st = db.prepare(sql), o = []; try { if (p && p.length) st.bind(p); while (st.step()) { var x = st.getAsObject(), r = {}; for (var c in x) r[c.toLowerCase()] = x[c]; o.push(r); } } finally { st.free(); } return o; }, run: function (sql, p) { db.run(sql, p || []); } };
  var host = { engineVersion: '1.0.0', db: hostDb, ops: { append: function () { return 1; } }, process: AP, docAction: ML, import: function (u) { return import(url.pathToFileURL(path.resolve(path.join(ERP('plugins')), u)).href); } };
  var reg = PR.create(host), mod = await quietA(function () { return import(url.pathToFileURL(ERP('plugins/pos_integration.mjs')).href); }); await quietA(function () { return reg.installBundle(mod.r); }); var st0 = await quietA(function () { return reg.startBundle('org.kernel.pos-integration'); });
  if (st0.r.state !== 'ACTIVE') { inc('HS3-C7', 'the POS plugin did not start: ' + st0.r.state); return; }
  var seq = 0;
  function deposit(n) { for (var i = 0; i < n; i++) { var key = 'HS3/' + (seq++); var d = commit(saveAll([{ t: 'i_order', f: { i_isimported: 'N', issotrx: 'Y', documentno: key, doctypename: 'POS Order', m_product_id: 123, qtyordered: 1, priceactual: 65, c_uom_id: 100, dateordered: D1, ad_org_id: 11 } }, { t: 'i_order', f: { i_isimported: 'N', issotrx: 'Y', documentno: key, doctypename: 'POS Order', m_product_id: 130, qtyordered: 1, priceactual: 50, c_uom_id: 100, dateordered: D1, ad_org_id: 11 } }, { t: 'i_payment', f: { i_isimported: 'N', documentno: key, doctypename: 'AR Receipt', iso_code: 'USD', payamt: 115, tendertype: 'X', datetrx: D1, ad_org_id: 11 } }])); if (!d.ok) throw new Error('deposit: ' + d.error); } }
  function round(n) { deposit(n); var r0 = reads, t = nowMs(), rr = quiet(function () { return commit(function (trx) { var x = AP.runInTrx(trx, 9538001, { params: { C_BankAccount_ID: 100, AD_Client_ID: 11, AD_Org_ID: 11 } }); if (process.env.HS_DEBUG) REAL('DEBUG ' + JSON.stringify({ s: x.summary, err: db.exec("SELECT i_errormsg FROM i_order WHERE i_isimported<>'Y' LIMIT 1")[0], lg: trx.log.filter(function (l) { return /REFUS|ERR|IMPORT/i.test(l); }).slice(0, 3) })); return { ok: x.ok, summary: x.summary }; }); }).r, ms = nowMs() - t, m = /#(\d+)\/(\d+)/.exec(rr.summary || ''); return { imported: m ? Number(m[1]) : 0, reads: reads - r0, ms: ms, ok: rr.ok }; }
  var R = [round(8), round(8), round(8), round(8)];
  if (R.some(function (x) { return x.imported !== 8; })) { inc('HS3-C7', 'a round did not import all its tickets: ' + JSON.stringify(R)); return; }
  var per = R.map(function (x) { return x.reads / x.imported; });
  ck('HS3-C7', 'rows read from i_order / i_payment per imported ticket do not grow with the tickets already imported (flat within 25% + 2 rows; RED on main: grows ~linearly)', per[3] <= per[0] * 1.25 + 2, 'rows_read_per_ticket by round=' + per.map(function (x) { return x.toFixed(1); }).join(' > ') + ' ms_per_ticket=' + R.map(function (x) { return Math.round(x.ms / x.imported); }).join(' > '));
  db.close();
}

(async function () {
  say('§HS-HEADER W-HQ-HOTSPOTS ootb=' + OOTB + ' base=' + (BASE || 'none') + ' commit=' + (cp.spawnSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout || '').trim() + ' node=' + process.version + ' at=' + new Date().toISOString());
  var CHILD = ONLY.length === 1 && ONLY[0] === 'hs3flat';
  try { if (ONLY.indexOf('hs1') >= 0) await hs1(); if (ONLY.indexOf('hs2') >= 0) hs2(); if (ONLY.indexOf('hs3') >= 0) await hs3(); if (ONLY.indexOf('hs3flat') >= 0) await hs3Flat(); }
  catch (e) { say('§HS FAIL CRASH - ' + String(e && e.stack || e).slice(0, 600)); fails++; judged++; }
  var v = judged === 0 ? 'INCONCLUSIVE' : fails ? 'FAIL' : inconc ? 'INCONCLUSIVE' : 'PASS';
  say('§HS-VERDICT ' + v + ' judged=' + judged + ' failed=' + fails + ' inconclusive=' + inconc);
  process.exit(v === 'PASS' ? 0 : 1);
})();
