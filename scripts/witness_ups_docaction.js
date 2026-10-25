#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-UPS-ONE-DOCACTION, prompts/TEAMWORK_FRAMEWORK.md §38.1 (E1 COMPILE) enforcing FL-8 (§16.0a, the Unicenta POS Strategy:
 * ONE DocAction executor per document; the station declares, the processor completes). READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: a plan can today give a document two DocAction executors, or let the declaring station complete what it declares
 * (dual DocAction = ghost shipments/postings, two sources of truth). The real compiler (build/scriptor/compile.js) over the real AD (build/erp/ad_full.db).
 *   §U1 CONTROL  §U2 DUAL  §U3 STATION  §U4 AUTHOR  §U5 BAD  §U6 GENERIC  §MUTANTS (a copy of build/scriptor with one rule broken; each must turn >= 1 arm red)
 * Run: node scripts/witness_ups_docaction.js > build/scriptor/witness_ups_docaction.log 2>&1
 */
'use strict';
var path = require('path'), fs = require('fs'), os = require('os'), Better = require('better-sqlite3');
var SDIR = path.join(__dirname, '..', 'build', 'scriptor');
var db = new Better(path.join(__dirname, '..', 'build', 'erp', 'ad_full.db'), { readonly: true });
var judged = 0, fails = 0;
function say(ok, l, d) { judged++; if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + l + (d ? ' — ' + d : '')); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
var HQ = 102, STATION = 103;
// P1 (docs/ReplicationFlowRows.md) + the processor's own order, kept at HQ (LOCAL), with its ONE executor = the HQ role
var P1 = [
  { name: 'F1 pos-sales-up', treatment: 'FACT', role: STATION, strategy: 100, dir: 'UP', table: 'C_OrderLine', carries: ['M_Product_ID', 'QtyEntered', 'C_UOM_ID'], group: 'POSStation/Date/Order#', schedule: 'end-of-day', from: 'POS station', to: 'HQ' },
  { name: 'R1 replenish-rule', treatment: 'RULE', on: 'F1 pos-sales-up', process: 'GenerateReplenishment', emits: 'F2 replenishment-down' },
  { name: 'F2 replenishment-down', treatment: 'FACT', role: STATION, strategy: 100, dir: 'DOWN', table: 'M_MovementLine', carries: ['M_Product_ID', 'M_Locator_ID', 'M_LocatorTo_ID', 'QtyEntered', 'C_UOM_ID'], group: 'Movement doc key', schedule: 'on-change', from: 'HQ', to: 'POS station' },
  { name: 'D1 hq-order', treatment: 'LOCAL', table: 'C_Order', docaction: { executor: HQ, actions: ['CO'] } }];
function codes(r) { return (r.planErrors || []).map(function (e) { return e.code; }).sort(); }
function arms(COMPILE, quiet) {
  var red = [], A = function (n, ok, l, d) { if (!ok) red.push(n); if (!quiet) say(ok, l, d); return ok; }, H = quiet ? function () {} : console.log;
  var run = function (rows) { return COMPILE.compile(db, rows, {}); };
  function cases(rename) {                                    // rename: table map for U6 (the rule must not know any table)
    var R = function (rows) { return rows.map(function (r) { var x = clone(r); if (x.table && rename[x.table]) x.table = rename[x.table]; return x; }); };
    var out = {};
    out.control = run(R(P1));
    var dual = clone(P1); dual.push({ name: 'D2 another-executor', treatment: 'LOCAL', table: 'C_Order', docaction: { executor: STATION, actions: ['CO'] } }); out.dual = run(R(dual));
    var st = clone(P1); st[0].docaction = { executor: STATION, actions: ['CO'] }; st[3].table = 'C_Invoice'; out.station = run(R(st));
    var au = clone(P1); au[0].docaction = { executor: 'author', actions: ['CO'] }; au[3].table = 'C_Invoice'; out.authorUp = run(R(au));
    var mesh = [{ name: 'T1 order-shared', treatment: 'FACT', role: STATION, strategy: 100, dir: 'BOTH', audience: 'space', table: 'C_Order', group: 'C_Order_UU', docaction: { executor: 'author', actions: ['CO', 'VO'] } }]; out.authorMesh = run(R(mesh));
    out.bad = [{ executor: undefined, actions: ['CO'] }, { executor: 'x', actions: ['CO'] }, { executor: HQ, actions: [] }, { executor: HQ, actions: ['ZZ'] }]
      .map(function (d) { var b = clone(P1); b[3].docaction = d; if (d.executor === undefined) delete b[3].docaction.executor; return run(R(b)); });
    return out;
  }
  var c = cases({}), sig = function (x) { return JSON.stringify({ c: codes(x.control), d: codes(x.dual), s: codes(x.station), au: codes(x.authorUp), m: codes(x.authorMesh), b: x.bad.map(codes) }); };
  H('§U1 CONTROL');
  A('U1', c.control.planErrors && !c.control.planErrors.length && c.control.ok === true, 'P1 + the processor\'s order with ONE executor (HQ role ' + HQ + ', CO) compiles; no plan error', 'ok=' + c.control.ok + ' planErrors=' + JSON.stringify(c.control.planErrors));
  var d1 = (c.control.plan || []).filter(function (f) { return f.name === 'D1 hq-order'; })[0];
  A('U1', d1 && d1.docaction && d1.docaction.executor === HQ, 'the compiled plan CARRIES the executor on that row (what E2/E3 will read)', JSON.stringify(d1 && d1.docaction));
  H('§U2 DUAL');
  A('U2', codes(c.dual).indexOf('dual-docaction') >= 0 && c.dual.ok === false, 'a second row giving C_Order another executor (the station) -> dual-docaction, the plan does not compile', JSON.stringify(c.dual.planErrors));
  H('§U3 STATION');
  A('U3', codes(c.station).indexOf('station-docaction') >= 0 && c.station.ok === false, 'the station\'s UP declaration given a DocAction by its own role -> station-docaction', JSON.stringify(c.station.planErrors));
  H('§U4 AUTHOR');
  A('U4', codes(c.authorUp).indexOf('docaction-author-not-mesh') >= 0 && c.authorUp.ok === false, 'executor "author" on a UP declaration -> docaction-author-not-mesh', JSON.stringify(c.authorUp.planErrors));
  A('U4', !c.authorMesh.planErrors.length && c.authorMesh.ok === true, 'executor "author" on a BOTH + space (peer team) row compiles — the device that authored the document is its one executor', JSON.stringify(c.authorMesh.planErrors));
  H('§U5 BAD');
  ['no executor', 'executor "x"', 'actions []', 'actions ["ZZ"]'].forEach(function (l, i) {
    A('U5', codes(c.bad[i]).indexOf('docaction-bad') >= 0 && c.bad[i].ok === false, l + ' -> docaction-bad', JSON.stringify(c.bad[i].planErrors)); });
  H('§U6 GENERIC');
  var g = cases({ C_Order: 'M_Movement', C_OrderLine: 'M_MovementLine', C_Invoice: 'M_Inventory' });
  A('U6', sig(g) === sig(c), 'the same files with the document tables renamed (C_Order -> M_Movement, C_OrderLine -> M_MovementLine, C_Invoice -> M_Inventory) give the same verdicts: the rule knows no table', sig(g) === sig(c) ? 'identical' : sig(g) + ' vs ' + sig(c));
  return red;
}
console.log('═══ W-UPS-ONE-DOCACTION — E1 COMPILE: one DocAction executor per document (TEAMWORK_FRAMEWORK FL-8, §38.1) ═══');
var red0 = arms(require(path.join(SDIR, 'compile.js')), false);
console.log('§MUTANTS (a copy of build/scriptor with one rule broken; each must turn at least one arm red)');
function mut(label, file, from, to) {
  var root = fs.mkdtempSync(path.join(os.tmpdir(), 'ups_mut_')), d = path.join(root, 'scriptor');      // the copy's ../erp must resolve like the real one's
  fs.cpSync(SDIR, d, { recursive: true, filter: function (s) { return !/\.(log|db)$/.test(s); } }); fs.symlinkSync(path.join(SDIR, '..', 'erp'), path.join(root, 'erp'));
  var p = path.join(d, file), s = fs.readFileSync(p, 'utf8'), t = s.replace(from, to), applied = t !== s; fs.writeFileSync(p, t);
  var red, threw = null; try { red = arms(require(path.join(d, 'compile.js')), true); } catch (e) { red = []; threw = String(e.message).slice(0, 60); }   // a crash is NOT a kill
  fs.rmSync(root, { recursive: true, force: true });
  if (threw) { say(false, label + ' -> the mutant CRASHED (' + threw + ') — not a kill'); return; }
  say(applied && red.length > 0, label + ' -> red arms: ' + (red.length ? Array.from(new Set(red)).join(', ') : 'NONE (survivor = hole)') + (applied ? '' : ' (MUTATION DID NOT APPLY)'));
}
mut('the dual check off', 'compile.js', "if (byTable[t].length > 1)", "if (false)");
mut('the station check off', 'compile.js', "if (r.dir === 'UP' && d.executor === r.role)", "if (false)");
mut('the author/mesh check off', 'compile.js', "if (d.executor === 'author' && !(r.dir === 'BOTH' && r.audience === 'space'))", "if (false)");
console.log('§UPS_VERDICT ' + (fails || red0.length ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails);
process.exit(fails ? 1 : 0);
