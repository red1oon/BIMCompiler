#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: W-OP-VERSIONS, the witness of prompts/TEAMWORK_FRAMEWORK.md §16.30 (the amended §13.12.J.2 built on the kernel op-log). READ THE LOG after every run: the §OPV_* lines are the proof, the exit code is not.
// Real kernel (build/erp/kernel_ops.js), real signer (~/bim-ootb/erp/erp_signer.js), real verifyChain. Module under test: build/erp/op_versions.js (override: OPV_MODULE=<path>, used by the mutant runs).
// Every arm names the issue it proves or disproves. An arm that judged an empty population prints INCONCLUSIVE, never PASS (§OPV_VERDICT).
// Run: node scripts/poc_op_versions.js [> build/erp/logs_versions/op_versions.log]      env OPV_NO_MUTANTS=1 skips the mutant runs; OPV_QUIET=1 prints only the §OPV_ARMS line (child runs).
'use strict';
if (typeof global.crypto === 'undefined') { global.crypto = require('crypto').webcrypto; }
global.window = global.window || {}; global.self = global.self || global;
var path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process'), crypto = require('crypto');
var initSqlJs = require('sql.js');
var ROOT = path.join(__dirname, '..');
var KERNEL = path.join(ROOT, 'build', 'erp', 'kernel_ops.js'), UPCASTER = path.join(ROOT, 'build', 'erp', 'op_upcaster.js');
var MODULE = process.env.OPV_MODULE || path.join(ROOT, 'build', 'erp', 'op_versions.js');
var SIGNER = path.join(process.env.HOME, 'bim-ootb', 'erp', 'erp_signer.js');
var QUIET = !!process.env.OPV_QUIET;
var sha = function (f) { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); };
var say = function (s) { if (!QUIET) console.log(s); };
var upcasterShaBefore = sha(UPCASTER);

function loadGlobal(p) { delete require.cache[require.resolve(p)]; require(p); }
function freshKernel() { delete require.cache[require.resolve(KERNEL)]; require(KERNEL); return global.window.KernelOps; }
function getP(o) { var p = o.parameters; return (typeof p === 'string') ? JSON.parse(p) : p; }
function cents(x) { return Math.round((x || 0) * 100); }
function foldV2(rows) {                                   // the CURRENT reducer: reads the v2 shape (line.acct)
  var bal = {}; rows.forEach(function (o) { var p = getP(o); if (!p.lines) return;
    p.lines.forEach(function (l) { var a = String(l.acct); bal[a] = (bal[a] || 0) + cents(l.amtacctdr) - cents(l.amtacctcr); }); }); return bal; }
function foldOriginal(rows) {                             // the frozen truth: each op read in the shape it was WRITTEN in
  var bal = {}; rows.forEach(function (o) { var p = getP(o); if (!p.lines) return;
    p.lines.forEach(function (l) { var a = String(l.account_id != null ? l.account_id : l.acct); bal[a] = (bal[a] || 0) + cents(l.amtacctdr) - cents(l.amtacctcr); }); }); return bal; }
function maxDiff(x, y) { var k = {}, m = 0, a; for (a in x) k[a] = 1; for (a in y) k[a] = 1; for (a in k) m = Math.max(m, Math.abs((x[a] || 0) - (y[a] || 0))); return m; }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

var ARMS = {}, JUDGED = 0, FAILS = 0, VACUOUS = 0;
function arm(id) { ARMS[id] = ARMS[id] || { ok: 0, bad: 0, vac: 0 }; return ARMS[id]; }
function check(id, name, cond, detail) { var a = arm(id); JUDGED++; if (cond) a.ok++; else { a.bad++; FAILS++; } say((cond ? '   ✓ ' : '   ✗ ') + id + ' ' + name + (detail ? ' — ' + detail : '')); }
function vacuous(id, name, why) { arm(id).vac++; VACUOUS++; say('   ? ' + id + ' ' + name + ' — INCONCLUSIVE: ' + why); }

var IN = (function () { var SRC = null; return { load: function () { delete require.cache[require.resolve(MODULE)]; SRC = require(MODULE); return SRC; } }; })();

(async function () {
  var SQL = await initSqlJs();
  loadGlobal(SIGNER); var ES = global.window.ErpSigner;
  var kp = await ES.mintKeypair(), appSigner = ES.makeSigner(kp);                       // the chain signer (kernel side)
  var sgn = { sign: function (h) { return appSigner.sign(h); }, verify: function (h, s) { return appSigner.verify(h, s); }, signed_by: 'edge:app' };
  var adminKp = await ES.mintKeypair(), admin = ES.makeSigner(adminKp);                  // the ADMIN key that signs upcaster sets
  var otherKp = await ES.mintKeypair(), other = ES.makeSigner(otherKp);                  // someone else's key
  var V;
  try { V = IN.load(); } catch (e) { console.log('§OPV_MODULE_MISSING ' + (e && e.message ? e.message.split('\n')[0] : e)); console.log('§OPV_VERDICT RED — the module under test does not load (expected before it is written)'); process.exit(3); }
  var TRUST = { admin: admin.verify };

  // a signed kernel log; entries {type, params, sv, inputs, out}; legacy (sv omitted/1) ops carry NO _sv, exactly like July's legacy ops
  async function mkLog(entries) {
    var K = freshKernel(); K.setSigner(sgn); var db = new SQL.Database(), n = 0;
    entries.forEach(function (e) { n++; var p = JSON.parse(JSON.stringify(e.params)); if (e.sv !== undefined && e.sv !== 1) p._sv = e.sv;
      K.commitOp(db, e.type, p, e.inputs || null, e.out || null, 'u-' + n, 1000 + n); });
    await K.sealChain(db);
    var r = db.exec('SELECT id, op_uuid, op_type, parameters, input_guids, output_guid FROM kernel_ops ORDER BY id');       // the STORED row, as the chain signed it (replayOps drops the guids and parses the params)
    var rows = r[0].values.map(function (v) { return Object.freeze({ id: v[0], op_uuid: v[1], op_type: v[2], parameters: v[3], input_guids: v[4], output_guid: v[5] }); });
    return { K: K, db: db, rows: rows };
  }
  var L1 = function (a, d, c) { return { account_id: a, amtacctdr: d, amtacctcr: c }; }, L2 = function (a, d, c) { return { acct: a, amtacctdr: d, amtacctcr: c }; };
  var post1 = function (i) { return { type: 'POST', params: { table: 'C_Invoice', id: 100 + i, lines: [L1('101', 10 + i, 0), L1('400', 0, 10 + i)] } }; };
  var post2 = function (i) { return { type: 'POST', sv: 2, params: { table: 'C_Invoice', id: 200 + i, lines: [L2('101', 7 + i, 0), L2('400', 0, 7 + i)] } }; };
  var SET12 = { kind: 'upcasters', op: 'POST', steps: [{ from: 1, map: [{ at: 'lines[]', rename: ['account_id', 'acct'] }] }], signer: 'admin' };
  async function signed(set, who, signerId) { var s = JSON.parse(JSON.stringify(set)); if (signerId) s.signer = signerId; delete s.sig; s.sig = await (who || admin).sign(await V.setHash(s)); return s; }
  function device(appV, extra) { var R = V.create({ trust: TRUST }); if (appV) Object.keys(appV).forEach(function (t) { R.setApp(t, appV[t]); }); return R; }
  var good = await signed(SET12);

  say('═══ §OPV — W-OP-VERSIONS: the amended §13.12.J.2 on the kernel op-log (spec §16.30) ═══');
  say('§OPV_START module=' + MODULE + ' op_upcaster.sha256=' + upcasterShaBefore.slice(0, 16));

  // ─────────── V1 mixed log, set loaded: folds to the all-v2 rewrite AND to the original v1 effect; chain verifies ───────────
  say('\n── V1: a mixed v1+v2 signed log folds to the same state as the all-v2 rewrite ──');
  var mixed = await mkLog([0, 1, 2, 3, 4, 5].map(post1).concat([0, 1, 2, 3, 4, 5].map(post2)));
  var D = device({ POST: 2 }); var lr = await D.loadSet(good);
  var r1 = D.fold(mixed.rows);
  var orig = foldOriginal(mixed.rows), got = foldV2(r1.folded);
  var rewrite = mixed.rows.map(function (o) { var p = getP(o); if (p.lines) p.lines = p.lines.map(function (l) { return L2(l.account_id != null ? l.account_id : l.acct, l.amtacctdr, l.amtacctcr); }); return { op_type: o.op_type, parameters: p }; });
  if (!(r1.folded.length > 0 && Object.keys(orig).length > 0)) vacuous('V1', 'population', 'no ops folded');
  check('V1', 'set loads (' + JSON.stringify(lr) + ') and every op folds', lr.ok === true && r1.folded.length === 12 && r1.parked.length === 0 && r1.refused.length === 0, 'folded=' + r1.folded.length + ' parked=' + r1.parked.length + ' refused=' + r1.refused.length);
  check('V1', 'fold == original v1/v2 effect (history frozen)', maxDiff(orig, got) === 0, 'maxDiff=' + maxDiff(orig, got) + 'c ' + JSON.stringify(got));
  check('V1', 'fold == the all-v2 rewrite of the log', maxDiff(foldV2(rewrite), got) === 0, 'maxDiff=' + maxDiff(foldV2(rewrite), got) + 'c');
  var vc = await mixed.K.verifyChain(mixed.db); check('V1', 'signed chain still verifies after the fold (stored ops untouched)', vc.ok === true, 'ok=' + vc.ok);

  // ─────────── V2 a hole in the chain / an unknown verb are refused at load ───────────
  say('\n── V2: chain-gap and bad-vocabulary are refused at load ──');
  var gapSet = await signed({ kind: 'upcasters', op: 'POST', steps: [{ from: 1, map: [{ rename: ['a', 'b'] }] }, { from: 3, map: [{ rename: ['b', 'c'] }] }], signer: 'admin' });
  var verbSet = await signed({ kind: 'upcasters', op: 'POST', steps: [{ from: 1, map: [{ eval: 'process.exit()' }] }], signer: 'admin' });
  var Dg = device({ POST: 2 }), rg = await Dg.loadSet(gapSet), rv = await Dg.loadSet(verbSet);
  check('V2', 'a set with a hole (steps 1 and 3) is refused `chain-gap`', rg.ok === false && rg.reason === 'chain-gap', JSON.stringify(rg));
  check('V2', 'an unknown verb is refused `bad-vocabulary` (data, never code)', rv.ok === false && rv.reason === 'bad-vocabulary', JSON.stringify(rv));
  var Dx = device({ POST: 2 }); await Dx.loadSet(good); var conflict = await Dx.loadSet(await signed({ kind: 'upcasters', op: 'POST', steps: [{ from: 1, map: [{ rename: ['account_id', 'other'] }] }], signer: 'admin' }));
  check('V2', 'a second signed set that redefines step 1 differently is refused `step-conflict`; the same set again is accepted', conflict.ok === false && conflict.reason === 'step-conflict' && (await Dx.loadSet(good)).ok === true, JSON.stringify(conflict));
  check('V2', 'a refused set changes nothing: v1 ops still park `needs-mapping`', Dg.fold(mixed.rows.slice(0, 2)).parked.length === 2);

  // ─────────── V3 / V4 parking, provisional hash, convergence after the upgrade ───────────
  say('\n── V3: an old app parks newer ops, marks the hash provisional, converges after the upgrade ──');
  var full = device({ POST: 2 }); await full.loadSet(good); var rFull = full.fold(mixed.rows), hFull = await full.ledgerOf(rFull);
  var A = device({ POST: 1 }), rA = A.fold(mixed.rows), hA = await A.ledgerOf(rA);
  var nV2 = mixed.rows.filter(function (o) { return getP(o)._sv === 2; }).length;
  if (nV2 === 0) vacuous('V3', 'population', 'the log has no v2 op');
  check('V3', 'appV=1 parks exactly the v2 ops as `needs-upgrade`', rA.parked.length === nV2 && rA.parked.every(function (x) { return x.reason === 'needs-upgrade'; }), 'parked=' + rA.parked.length + ' of ' + nV2);
  check('V3', 'parked ops are not in the fold', rA.folded.length === 12 - nV2, 'folded=' + rA.folded.length);
  check('V3', 'parked_count>0 and provisional:true', rA.parked_count === nV2 && rA.provisional === true, 'parked_count=' + rA.parked_count + ' provisional=' + rA.provisional);
  check('V3', 'the provisional hash differs from the full-upgrade hash', hA !== hFull);
  A.setApp('POST', 2); await A.loadSet(good); var rA2 = A.fold(mixed.rows), hA2 = await A.ledgerOf(rA2);   // "upgrade": app release + the signed set
  check('V3', 'after the upgrade: parked_count 0, provisional:false', rA2.parked_count === 0 && rA2.provisional === false, 'parked_count=' + rA2.parked_count + ' provisional=' + rA2.provisional);
  check('V3', 'after the upgrade the hash == the full-upgrade hash', hA2 === hFull, hA2.slice(0, 12) + ' vs ' + hFull.slice(0, 12));
  say('\n── V4: three devices, two parked sets: same parked set => same hash; all equal after the upgrade ──');
  var Dc = device({ POST: 1 }), Db = device({ POST: 2 }); await Db.loadSet(good);
  var hC = await Dc.ledgerOf(Dc.fold(mixed.rows)), hB = await Db.ledgerOf(Db.fold(mixed.rows));
  check('V4', 'A and C (same parked set) agree', hA === hC, hA.slice(0, 12) + ' / ' + hC.slice(0, 12));
  check('V4', 'B (nothing parked) differs from A and C', hB !== hA && hB !== hC);
  Dc.setApp('POST', 2); await Dc.loadSet(good); var hC2 = await Dc.ledgerOf(Dc.fold(mixed.rows));
  check('V4', 'after the upgrade A == B == C', hA2 === hB && hC2 === hB, [hA2, hB, hC2].map(function (h) { return h.slice(0, 8); }).join(' '));

  // ─────────── V5 bogus versions are refused, never applied, never parked ───────────
  say('\n── V5: a bogus _sv is refused `bogus-version` ──');
  var bogusLog = await mkLog([post2(0), { type: 'POST', sv: 0, params: post2(1).params }, { type: 'POST', sv: -1, params: post2(2).params }, { type: 'POST', sv: 1.5, params: post2(3).params }, { type: 'POST', sv: 'x', params: post2(4).params }]);
  var Dd = device({ POST: 2 }); await Dd.loadSet(good); var rb = Dd.fold(bogusLog.rows), clean = Dd.fold(bogusLog.rows.slice(0, 1));
  check('V5', 'four bogus versions (0, -1, 1.5, "x") are REFUSED `bogus-version`', rb.refused.length === 4 && rb.refused.every(function (x) { return x.reason === 'bogus-version'; }), 'refused=' + rb.refused.length + ' ' + rb.refused.map(function (x) { return x.reason; }).join(','));
  check('V5', 'none is parked and none is applied', rb.parked.length === 0 && rb.folded.length === 1 && maxDiff(foldV2(rb.folded), foldV2(clean.folded)) === 0);

  // ─────────── V6 signed data or nothing ───────────
  say('\n── V6: an upcaster set must be signed by a trusted admin ──');
  var uns = JSON.parse(JSON.stringify(SET12)); delete uns.sig;
  var untrusted = await signed(SET12, other, 'mallory');
  var wrongKey = await signed(SET12, other, 'admin');                                     // claims to be admin, signed with another key
  var tampered = JSON.parse(JSON.stringify(good)); tampered.steps[0].map[0].rename = ['account_id', 'steal'];
  var De = device({ POST: 2 }), re = [await De.loadSet(uns), await De.loadSet(untrusted), await De.loadSet(wrongKey), await De.loadSet(tampered)];
  check('V6', 'no signature -> `unsigned`', re[0].ok === false && re[0].reason === 'unsigned', JSON.stringify(re[0]));
  check('V6', 'signer not in the trust list -> `untrusted-signer`', re[1].ok === false && re[1].reason === 'untrusted-signer', JSON.stringify(re[1]));
  check('V6', 'claims admin but another key signed -> `bad-signature`', re[2].ok === false && re[2].reason === 'bad-signature', JSON.stringify(re[2]));
  check('V6', 'a step edited after signing -> `bad-signature`', re[3].ok === false && re[3].reason === 'bad-signature', JSON.stringify(re[3]));
  check('V6', 'none of the four changed anything (v1 ops still park `needs-mapping`)', De.fold(mixed.rows.slice(0, 2)).parked.length === 2);
  var Df = device({ POST: 2 }), rf = await Df.loadSet(good);
  check('V6', 'control: the good signed set loads and clears them', rf.ok === true && Df.fold(mixed.rows.slice(0, 2)).folded.length === 2, JSON.stringify(rf));

  // ─────────── V7 min_v retirement, identical on every device ───────────
  say('\n── V7: min_v retires a version, identically everywhere ──');
  var Dh = device({ POST: 2 }), Di = device({ POST: 2 }); await Dh.loadSet(good);                       // Dh has the mapping, Di has none
  var before = Dh.fold(mixed.rows); Dh.setPolicy({ min_v: { POST: 2 } }); Di.setPolicy({ min_v: { POST: 2 } });
  var rh = Dh.fold(mixed.rows), ri = Di.fold(mixed.rows), n1 = mixed.rows.length - nV2;
  check('V7', 'control: without the policy the v1 ops fold', before.folded.length === 12 && before.refused.length === 0);
  check('V7', 'with min_v POST=2 every v1 op is REFUSED `retired-version`', rh.refused.length === n1 && rh.refused.every(function (x) { return x.reason === 'retired-version'; }), 'refused=' + rh.refused.length + ' of ' + n1);
  check('V7', 'the refused set is identical on the device WITH the mapping and the one WITHOUT it', same(rh.refused.map(function (x) { return x.id; }), ri.refused.map(function (x) { return x.id; })) && rh.refused.length > 0);
  check('V7', 'the v2 ops still fold', rh.folded.length === nV2);

  // ─────────── V8 dependency parking / refusing ───────────
  say('\n── V8: an op that reads a parked op parks; one that reads a refused op is refused ──');
  var dep = await mkLog([
    { type: 'POST', sv: 2, params: post2(0).params, out: 'g-parked' },                                    // v2 on an appV=1 device -> parked
    { type: 'POST', params: post1(1).params, inputs: ['g-parked'], out: 'g-child' },                      // reads it -> dep-parked
    { type: 'POST', params: post1(2).params, inputs: ['g-child'] },                                       // reads the child -> dep-parked (transitive)
    { type: 'POST', params: post1(3).params },                                                            // independent -> folds
    { type: 'POST', sv: 0, params: post2(4).params, out: 'g-bad' },                                       // bogus -> refused
    { type: 'POST', params: post1(5).params, inputs: ['g-bad'] }]);                                       // reads it -> dep-refused
  var Dj = device({ POST: 1 }), rj = Dj.fold(dep.rows);
  var why = function (list) { return list.map(function (x) { return x.reason; }).join(','); };
  check('V8', 'parked: needs-upgrade, dep-parked, dep-parked (transitive)', why(rj.parked) === 'needs-upgrade,dep-parked,dep-parked', why(rj.parked));
  check('V8', 'refused: bogus-version, dep-refused', why(rj.refused) === 'bogus-version,dep-refused', why(rj.refused));
  check('V8', 'the independent op folds, and only it', rj.folded.length === 1 && getP(rj.folded[0]).id === 103, 'folded=' + rj.folded.length);

  // ─────────── V9 tolerant reader ───────────
  say('\n── V9: missing -> default, unknown -> passed through, stored bytes never rewritten ──');
  var tol = await mkLog([{ type: 'POST', params: { table: 'C_Invoice', id: 1, lines: [L1('101', 1, 0)] } }, { type: 'POST', params: { table: 'C_Invoice', id: 2, currency: 'USD', x_new: 42, lines: [L1('101', 2, 0)] } }]);
  var Dk = device({ POST: 1 }); Dk.setShape('POST', { defaults: { currency: 'MYR' } });
  var before9 = JSON.stringify(tol.rows), stored9 = JSON.stringify(tol.db.exec('SELECT parameters FROM kernel_ops')), rk = Dk.fold(tol.rows), p0 = getP(rk.folded[0]), p1 = getP(rk.folded[1]);
  check('V9', 'a missing field takes the default', p0.currency === 'MYR', 'currency=' + p0.currency);
  check('V9', 'a present field is NOT overwritten by the default', p1.currency === 'USD', 'currency=' + p1.currency);
  check('V9', 'an unknown field is passed through untouched', p1.x_new === 42 && p1.table === 'C_Invoice');
  check('V9', 'the stored rows (frozen) and the stored parameter strings in the DB are byte-identical after the fold', before9 === JSON.stringify(tol.rows) && stored9 === JSON.stringify(tol.db.exec('SELECT parameters FROM kernel_ops')));

  // ─────────── V10 mapping missing: only a signed set is needed, no app change ───────────
  say('\n── V10: a v1 op on an appV=2 app with no mapping parks `needs-mapping`; the signed set clears it ──');
  var Dl = device({ POST: 2 }), r10a = Dl.fold(mixed.rows);
  check('V10', 'v1 ops park `needs-mapping` (the v2 ops fold)', r10a.parked.length === n1 && r10a.parked.every(function (x) { return x.reason === 'needs-mapping'; }) && r10a.folded.length === nV2, 'parked=' + r10a.parked.length + ' ' + why(r10a.parked).split(',')[0]);
  await Dl.loadSet(good); var r10b = Dl.fold(mixed.rows);
  check('V10', 'after loading the signed set (appV unchanged) nothing is parked', r10b.parked.length === 0 && r10b.folded.length === 12 && r10b.provisional === false);

  // ─────────── V11 determinism ───────────
  say('\n── V11: determinism ──');
  var h1 = await full.ledgerOf(full.fold(mixed.rows)), h2 = await full.ledgerOf(full.fold(mixed.rows));
  check('V11', 'fold twice -> identical hash', h1 === h2);
  var PAYSET = await signed({ kind: 'upcasters', op: 'PAY', steps: [{ from: 1, map: [{ rename: ['amt', 'amount'] }, { default: ['cur', 'MYR'] }] }], signer: 'admin' });
  var two = await mkLog([post1(0), post2(0), { type: 'PAY', params: { amt: 5 } }, { type: 'PAY', sv: 2, params: { amount: 6, cur: 'USD' } }]);
  var X = device({ POST: 2, PAY: 2 }), Y = device({ POST: 2, PAY: 2 }); await X.loadSet(good); await X.loadSet(PAYSET); await Y.loadSet(PAYSET); await Y.loadSet(good);
  var hX = await X.ledgerOf(X.fold(two.rows)), hY = await Y.ledgerOf(Y.fold(two.rows)); var rX = X.fold(two.rows);
  check('V11', 'two sets loaded in either order -> the same hash', hX === hY && rX.folded.length === 4, hX.slice(0, 12) + ' / ' + hY.slice(0, 12));
  check('V11', 'rename + default steps produced the current PAY shape', getP(rX.folded[2]).amount === 5 && getP(rX.folded[2]).cur === 'MYR');

  // ─────────── V14 a nested object (the CRUD ops' params.fields / params.changes) can be mapped too ───────────
  say('\n── V14: `at:"fields"` maps the nested object of a CRUD-shaped op ──');
  var fset = await signed({ kind: 'upcasters', op: 'CRUD_CREATE', steps: [{ from: 1, map: [{ at: 'fields', rename: ['grandtotal', 'total'] }, { at: 'fields', default: ['currency', 'MYR'] }] }], signer: 'admin' });
  var crud = await mkLog([{ type: 'CRUD_CREATE', params: { fields: { documentno: 'SO-1', grandtotal: 100 } } }, { type: 'CRUD_CREATE', sv: 2, params: { fields: { documentno: 'SO-2', total: 50, currency: 'USD' } } }]);
  var Dn = device({ CRUD_CREATE: 2 }); var rn0 = await Dn.loadSet(fset), rn = Dn.fold(crud.rows), f0 = getP(rn.folded[0]).fields, f1 = getP(rn.folded[1]).fields;
  check('V14', 'a v1 op\'s fields.grandtotal becomes fields.total and gets the default currency', rn0.ok && f0.total === 100 && f0.grandtotal === undefined && f0.currency === 'MYR' && f0.documentno === 'SO-1', JSON.stringify(f0));
  check('V14', 'a native v2 op is left exactly as written', f1.total === 50 && f1.currency === 'USD');

  // ─────────── V13 the Anytype staircase: three app versions on one log (the outside failure report, replayed) ───────────
  say('\n── V13: three app versions, one log — the middle version keeps working and says what waits ──');
  // Outside report (Anytype forum, 2026): desktop 0.53.1 stuck "spinning", the intermediate 0.54.2 STILL failed, only 0.54.11 synced. The failure was per DEVICE, with no reason shown.
  var post3 = function (i) { return { type: 'POST', sv: 3, params: { table: 'C_Invoice', id: 300 + i, lines: [{ acct: '101', dr: 4 + i, cr: 0 }, { acct: '400', dr: 0, cr: 4 + i }] } }; };
  var SET23 = await signed({ kind: 'upcasters', op: 'POST', steps: [{ from: 2, map: [{ at: 'lines[]', rename: ['amtacctdr', 'dr'] }, { at: 'lines[]', rename: ['amtacctcr', 'cr'] }] }], signer: 'admin' });
  var tri = await mkLog([0, 1, 2].map(post1).concat([0, 1, 2].map(post2), [0, 1, 2].map(post3)));
  var foldV3 = function (rows) { var bal = {}; rows.forEach(function (o) { var p = getP(o); p.lines.forEach(function (l) { var a = String(l.acct); bal[a] = (bal[a] || 0) + cents(l.dr != null ? l.dr : l.amtacctdr) - cents(l.cr != null ? l.cr : l.amtacctcr); }); }); return bal; };
  var truth = (function () { var bal = {}; tri.rows.forEach(function (o) { var p = getP(o); p.lines.forEach(function (l) { var a = String(l.account_id != null ? l.account_id : l.acct); bal[a] = (bal[a] || 0) + cents(l.dr != null ? l.dr : l.amtacctdr) - cents(l.cr != null ? l.cr : l.amtacctcr); }); }); return bal; })();
  var old = device({ POST: 1 }), mid = device({ POST: 2 }), cur = device({ POST: 3 });
  await mid.loadSet(good); await cur.loadSet(good); await cur.loadSet(SET23);
  var ro = old.fold(tri.rows), rm = mid.fold(tri.rows), rc = cur.fold(tri.rows);
  check('V13', '0.53.1-like (appV 1) folds the 3 it can read, parks 6, and SAYS so', ro.folded.length === 3 && ro.parked_count === 6 && old.summary(ro).text === '6 items need an update: 6 needs-upgrade', old.summary(ro).text);
  check('V13', 'the intermediate version (appV 2) is NOT dead: folds 6, parks only the 3 it cannot read', rm.folded.length === 6 && rm.parked_count === 3 && rm.parked.every(function (x) { return x.reason === 'needs-upgrade'; }), 'folded=' + rm.folded.length + ' ' + mid.summary(rm).text);
  check('V13', 'the current version folds all 9 and matches the original effect', rc.folded.length === 9 && maxDiff(truth, foldV3(rc.folded)) === 0, 'maxDiff=' + maxDiff(truth, foldV3(rc.folded)) + 'c');
  var hC = await cur.ledgerOf(rc), hM = await mid.ledgerOf(rm), hO = await old.ledgerOf(ro);
  check('V13', 'the three provisional/final hashes are all different while they differ in what they can read', hC !== hM && hM !== hO && hC !== hO);
  mid.setApp('POST', 3); await mid.loadSet(SET23); old.setApp('POST', 3); await old.loadSet(good); await old.loadSet(SET23);
  var hM2 = await mid.ledgerOf(mid.fold(tri.rows)), hO2 = await old.ledgerOf(old.fold(tri.rows));
  check('V13', 'after each upgrades (app release + signed sets) all three hashes are equal and nothing is provisional', hM2 === hC && hO2 === hC && mid.fold(tri.rows).provisional === false, [hO2, hM2, hC].map(function (h) { return h.slice(0, 8); }).join(' '));

  // ─────────── V12 the old module is untouched and its witness still passes ───────────
  say('\n── V12: op_upcaster.js untouched; poc_d2_versioning.js still passes ──');
  var upAfter = sha(UPCASTER); check('V12', 'op_upcaster.js sha256 unchanged', upAfter === upcasterShaBefore, upAfter.slice(0, 16));
  var kids = process.env.OPV_NO_D2 ? null : cp.spawnSync(process.execPath, [path.join(__dirname, 'poc_d2_versioning.js')], { encoding: 'utf8', timeout: 120000 });
  if (kids) check('V12', 'poc_d2_versioning.js prints OVERALL=PASS', /§D2-WITNESS OVERALL=PASS/.test(kids.stdout || ''));

  // ─────────── verdict ───────────
  var red = Object.keys(ARMS).filter(function (k) { return ARMS[k].bad > 0; }), inc = Object.keys(ARMS).filter(function (k) { return ARMS[k].vac > 0; });
  console.log('§OPV_ARMS red=' + (red.join(',') || 'none') + ' vacuous=' + (inc.join(',') || 'none') + ' judged=' + JUDGED);
  if (QUIET) { process.exit(red.length ? 1 : 0); }

  // ─────────── mutants: each broken copy of the module must turn at least one arm red ───────────
  var muts = [];
  if (!process.env.OPV_NO_MUTANTS && !process.env.OPV_MODULE) {
    var src = fs.readFileSync(MODULE, 'utf8');
    var M = [
      ['signature check skipped', "if (!sigOk) return refuse('bad-signature');", '', ['V6']],
      ['chain-gap check off', "if (ordered[i].from !== ordered[0].from + i) return refuse('chain-gap');", '', ['V2']],
      ['newer op folded instead of parked', "if (v > appV) return 'needs-upgrade';", 'if (false) return \'needs-upgrade\';', ['V3']],
      ['min_v ignored', "if (v < minV) return 'retired-version';", 'if (false) return \'retired-version\';', ['V7']],
      ['provisional never set', 'provisional: parked.length > 0', 'provisional: false', ['V3']],
      ['dependents of a parked op folded', "if (dep.parked) return park('dep-parked');", 'if (false) return park(\'dep-parked\');', ['V8']],
      ['bogus version applied', "if (!isVersion(v)) return 'bogus-version';", 'if (false) return \'bogus-version\';', ['V5']],
      ['tolerant reader overwrites a present field', 'if (!(k in q)) q[k] = d[k];', 'q[k] = d[k];', ['V9']]];
    M.forEach(function (m) {
      if (src.split(m[1]).length !== 2) { muts.push({ name: m[0], error: 'anchor not found exactly once' }); return; }
      var tmp = path.join(os.tmpdir(), 'op_versions_mut_' + process.pid + '_' + muts.length + '.js'); fs.writeFileSync(tmp, src.replace(m[1], m[2]));
      var k = cp.spawnSync(process.execPath, [__filename], { encoding: 'utf8', timeout: 180000, env: Object.assign({}, process.env, { OPV_MODULE: tmp, OPV_QUIET: '1', OPV_NO_D2: '1' }) });
      fs.unlinkSync(tmp); var mm = /§OPV_ARMS red=(\S+)/.exec(k.stdout || ''); var redArms = mm && mm[1] !== 'none' ? mm[1].split(',') : [];
      muts.push({ name: m[0], expect: m[3], red: redArms });
    });
    console.log('\n§OPV_MUTANTS');
    muts.forEach(function (m) { var ok = !m.error && m.red.length > 0 && m.expect.every(function (e) { return m.red.indexOf(e) !== -1; }); if (!ok) FAILS++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + m.name + ' -> ' + (m.error || ('red arms: ' + (m.red.join(', ') || 'NONE (survivor)')) + ' (expected ' + m.expect.join('/') + ')')); });
  }
  var killed = muts.filter(function (m) { return !m.error && m.red.length > 0; }).length;
  var verdict = FAILS > 0 ? 'FAIL' : (VACUOUS > 0 ? 'INCONCLUSIVE' : 'PASS');
  console.log('§OPV_VERDICT ' + verdict + ' judged=' + JUDGED + ' fails=' + FAILS + ' vacuous=' + VACUOUS + (muts.length ? ' mutants_killed=' + killed + '/' + muts.length : ' mutants=skipped') + ' (module: ' + path.basename(MODULE) + '; op_upcaster.js untouched; used by build/comm via opts.versions, see witness_comm_versions.js)');
  process.exit(FAILS ? 1 : 0);
})().catch(function (e) { console.log('§OPV_CRASH ' + (e && e.stack || e)); process.exit(2); });
