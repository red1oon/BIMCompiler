#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
/**
 * ⚠ DO NOT REMOVE — Scope: W-THIN-DERIVE, prompts/TEAMWORK_FRAMEWORK.md §36 (build spec) / §34 (the thin-pipe principle). READ THE LOG after every run — the exit code is not evidence.
 * THE ISSUE it proves/disproves: a document Complete ships its CONSEQUENCES (reservations, order tax, shipments, cost details …) to every peer. Can a second device
 * with the same BASE and the same model-layer code DERIVE them from the document's own rows + the intent 'CO' instead? Answered per DocAction class, X of N,
 * N = the model layer's own registry ML.DOCS. Read-only: the shipped seed and the shipped model layer are loaded, nothing is written back.
 *   §CLASS <t>   — source document tried / chosen
 *   §T1 SAME     — B with A's clock and A's sequence state: MATCH or NOT DERIVABLE YET: table.column, …
 *   §T2 BYTES    — today's shipped group vs the thin intent
 *   §T3 CLOCK / DOCNO / RERUN / ORDER / UU — the determinism preconditions
 *   §T5 SKEW     — OPEN (not built): nothing tells B that A's model layer differs
 *   §MUTANTS     — the comparator must notice a dropped op, an altered value, a shifted clock
 * Run: node scripts/witness_thin_derive.js > build/scriptor/witness_thin_derive.log 2>&1
 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const Database = require('better-sqlite3');
const OOTB = process.env.OOTB || path.join(process.env.HOME, 'bim-ootb');
const FXM = require('./bridge/ad_shipped_fixture.js');
const ML = require(path.join(OOTB, 'erp/model_layer.js'));
const MODS = ['model_order', 'model_invoice', 'model_post', 'model_cost', 'model_match', 'model_inventory', 'model_movement', 'model_rma', 'model_dd', 'model_trade', 'model_master', 'model_asi', 'model_ctor'];
const loaded = MODS.filter(m => { try { require(path.join(OOTB, 'erp/' + m + '.js')); return true; } catch (e) { console.log('§THIN_LOAD_ERR ' + m + ' ' + e.message.slice(0, 80)); return false; } });
let ootbHead = '?'; try { ootbHead = cp.execFileSync('git', ['-C', OOTB, 'rev-parse', '--short', 'HEAD']).toString().trim(); } catch (e) {}
const lc = r => { const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; };

// ── the BASE every device sits on: the shipped seed + its self-heal patch, serialised once ──
const FX = FXM.loadShipped(OOTB, m => console.log(m)), BASE = FX.db.serialize();
// ── fixture map (checked against the schema below): the line table of each document class, and the draft resets ──
const LINES = { c_order: 'c_orderline', m_inout: 'm_inoutline', c_invoice: 'c_invoiceline', c_payment: null, c_allocationhdr: 'c_allocationline', m_movement: 'm_movementline',
  m_movementconfirm: 'm_movementlineconfirm', m_inventory: 'm_inventoryline', m_rma: 'm_rmaline', dd_order: 'dd_orderline' };
const RESET_HDR = { docstatus: 'DR', docaction: 'CO', processed: 'N', posted: 'N', isapproved: 'N', processedon: 0, isdelivered: 'N', isinvoiced: 'N', ispaid: 'N', isallocated: 'N', isreconciled: 'N' };
const RESET_LINE = { processed: 'N', qtydelivered: 0, qtyinvoiced: 0, qtyreserved: 0 };
const ENV0 = { date: '2026-10-26', now: '2026-10-26 10:00:00', nowMillis: 1792994400000 }, ENV1 = { date: '2026-10-27', now: '2026-10-27 09:30:00', nowMillis: 1793079000000 };

function device(name, idStart, opts) {
  const db = new Database(BASE); FXM.registerUdfs(OOTB, db);
  const rq = FXM.reentrant(db, OOTB), query = (s, p) => rq(s, (p || []).map(v => v == null ? null : v)), cols = {};
  const colsOf = t => cols[t] = cols[t] || db.prepare('PRAGMA table_info(' + t + ')').all().map(c => c.name.toLowerCase());
  let nid = idStart, useq = 0;
  const env = Object.assign({ client: 11, org: 11, user: 101, std: { actor: 101, clientId: 11, orgId: 11 } }, opts.clock || ENV0);
  env.uuid = () => name + '-uu-' + (++useq);
  if (opts.docnoAdvance) db.prepare('UPDATE ad_sequence SET currentnext = currentnext + 1').run();
  function insert(t, row) { const ks = Object.keys(row).filter(k => colsOf(t).includes(k)); db.prepare('INSERT INTO ' + t + ' (' + ks.map(k => '"' + k + '"').join(',') + ') VALUES (' + ks.map(() => '?').join(',') + ')').run(...ks.map(k => row[k])); }
  function apply(ops) {                                   // what the kernel's commitGroup does in the page (same semantics as scripts/poc_model_layer_oracle.js apply)
    const out = []; const fix = v => (v && typeof v === 'object' && v.__opRef != null) ? out[v.__opRef] : v;
    ops.forEach((o, i) => { const t = o.table, cs = colsOf(t); if (!cs.length) { out[i] = null; return; }
      if (o.op_type === 'CRUD_CREATE') { const f = Object.assign({}, o.fields), pk = t + '_id'; if (cs.includes(pk)) { f[pk] = ++nid; out[i] = f[pk]; } else out[i] = f[t + '_uu'];
        Object.keys(f).forEach(k => { f[k] = fix(f[k]); if (!cs.includes(k)) delete f[k]; }); insert(t, f); }
      else if (o.op_type === 'CRUD_UPDATE') { const ks = Object.keys(o.changes).filter(k => cs.includes(k));
        if (ks.length) db.prepare('UPDATE ' + t + ' SET ' + ks.map(k => '"' + k + '"=?').join(',') + ' WHERE ' + (o.idCol || t + '_id') + '=?').run(...ks.map(k => fix(o.changes[k].new)), fix(o.id)); out[i] = fix(o.id); }
      else if (o.op_type === 'CRUD_DELETE') db.prepare('DELETE FROM ' + t + ' WHERE ' + (o.idCol || t + '_id') + '=?').run(fix(o.id)); });
    return out;
  }
  // the document's own rows, as received: the same values and the same uu on every device, only the local ids are this device's
  function clone(t, src, ids) {
    const lt = LINES[t], h = lc(db.prepare('SELECT * FROM ' + t + ' WHERE ' + t + '_id=?').get(src));
    Object.assign(h, { [t + '_id']: ids.h, [t + '_uu']: 'thin-' + t + '-' + src }); Object.keys(RESET_HDR).forEach(k => { if (k in h) h[k] = RESET_HDR[k]; }); delete h.created; delete h.updated;
    insert(t, h); const rows = { header: h, lines: [] };
    if (lt) db.prepare('SELECT * FROM ' + lt + ' WHERE ' + t + '_id=? ORDER BY ' + lt + '_id').all(src).map(lc).forEach((l, i) => {
      Object.assign(l, { [lt + '_id']: ids.l[i], [t + '_id']: ids.h, [lt + '_uu']: 'thin-' + lt + '-' + src + '-' + i }); Object.keys(RESET_LINE).forEach(k => { if (k in l) l[k] = RESET_LINE[k]; }); delete l.created; delete l.updated;
      insert(lt, l); rows.lines.push(l); });
    return rows;
  }
  function complete(t, id) { return ML.run(query, Object.assign({ noWorkflow: true }, env), { table: t, timing: 'DOCACTION', id: id, action: 'CO' }); }
  return { name, db, env, colsOf, apply, clone, complete, uuCount: () => useq, close: () => db.close() };
}

// ── normalise an op group: this device's document ids -> DOC / LINE#i; op refs stay refs; generated uu -> UU#k (counted, not compared) ──
function norm(ops, ids, dev) {
  const idmap = new Map([[ids.h, 'DOC']]); ids.l.forEach((x, i) => idmap.set(x, 'LINE#' + i));
  const uuRe = new RegExp('^' + dev + '-uu-(\\d+)$');
  const nv = v => { if (v == null || v === '') return null; if (typeof v === 'object' && v.__opRef != null) return 'REF#' + v.__opRef;
    if (typeof v === 'number') return idmap.has(v) ? idmap.get(v) : Math.round(v * 1e6) / 1e6;
    if (typeof v === 'string') { const m = uuRe.exec(v); if (m) return 'UU#' + m[1]; if (/^-?\d+(\.\d+)?$/.test(v)) { const n = Number(v); return idmap.has(n) ? idmap.get(n) : Math.round(n * 1e6) / 1e6; } return v; }
    if (typeof v === 'object') return JSON.stringify(v); return v; };
  return ops.map(o => { const vals = {}; if (o.fields) Object.keys(o.fields).forEach(k => { vals[k] = nv(o.fields[k]); }); if (o.changes) Object.keys(o.changes).forEach(k => { vals[k] = nv(o.changes[k] && o.changes[k].new !== undefined ? o.changes[k].new : o.changes[k]); });
    return { op: o.op_type, table: o.table, id: nv(o.id), idCol: o.idCol || null, vals }; });
}
function diff(a, b) {                                          // [] = MATCH, else the exact table.column list (deduplicated)
  const out = new Set();
  if (a.length !== b.length) { const cnt = x => x.reduce((m, o) => { const k = o.table + ':' + o.op; m[k] = (m[k] || 0) + 1; return m; }, {}), ca = cnt(a), cb = cnt(b);
    Object.keys(Object.assign({}, ca, cb)).forEach(k => { if (ca[k] !== cb[k]) out.add(k + ' count ' + (ca[k] || 0) + '≠' + (cb[k] || 0)); }); return [...out]; }
  a.forEach((x, i) => { const y = b[i];
    if (x.op !== y.op || x.table !== y.table || x.idCol !== y.idCol) { out.add('op#' + i + ' ' + x.table + ':' + x.op + '≠' + y.table + ':' + y.op); return; }
    if (x.id !== y.id) out.add(x.table + '.<target>');
    Object.keys(Object.assign({}, x.vals, y.vals)).forEach(k => { if (JSON.stringify(x.vals[k]) !== JSON.stringify(y.vals[k])) out.add(x.table + '.' + k); }); });
  return [...out];
}
const A_IDS = (n) => ({ h: 7100001, l: Array.from({ length: n }, (_, i) => 7100101 + i) }), B_IDS = (n) => ({ h: 8200001, l: Array.from({ length: n }, (_, i) => 8200101 + i) });
// one A/B pair on fresh copies of the BASE; returns both groups normalised + the raw material
function pair(t, src, bOpts, bFirst) {
  const A = device('A', 9100000, {}), B = device('B', 9500000, bOpts || {});
  const nL = LINES[t] ? A.db.prepare('SELECT COUNT(*) n FROM ' + LINES[t] + ' WHERE ' + t + '_id=?').get(src).n : 0, ia = A_IDS(nL), ib = B_IDS(nL);
  const docA = A.clone(t, src, ia); B.clone(t, src, ib);
  let rA, rB; if (bFirst) { rB = B.complete(t, ib.h); rA = A.complete(t, ia.h); } else { rA = A.complete(t, ia.h); rB = B.complete(t, ib.h); }
  const res = { A, B, ia, ib, rA, rB, docA, nA: norm(rA.ops || [], ia, 'A'), nB: norm(rB.ops || [], ib, 'B') };
  return res;
}
const closeP = p => { p.A.close(); p.B.close(); };

let judged = 0; const derivable = [], notDer = [], incon = [], sameRes = {};
console.log('═══ W-THIN-DERIVE — can a peer DERIVE a Complete\'s consequences instead of receiving them? (TEAMWORK_FRAMEWORK §34/§36) ═══');
console.log('§THIN_START ootb=' + OOTB + '@' + ootbHead + ' model_modules=' + loaded.length + '/' + MODS.length + ' N=' + Object.keys(ML.DOCS).length + ' classes=' + Object.keys(ML.DOCS).join(','));
const probeDb = new Database(BASE), haveT = new Set(probeDb.prepare("SELECT lower(name) n FROM sqlite_master WHERE type='table'").all().map(r => r.n));
for (const t of Object.keys(ML.DOCS)) {
  const lt = LINES[t];
  if (!haveT.has(t)) { incon.push(t); console.log('§CLASS ' + t + ' INCONCLUSIVE: table not in the BASE'); continue; }
  if (lt && (!haveT.has(lt) || !probeDb.prepare('PRAGMA table_info(' + lt + ')').all().some(c => c.name.toLowerCase() === t + '_id'))) { incon.push(t); console.log('§CLASS ' + t + ' INCONCLUSIVE: line table ' + lt + ' missing or has no ' + t + '_id (fixture map)'); continue; }
  const srcs = probeDb.prepare('SELECT ' + t + '_id id FROM ' + t + ' ORDER BY ' + t + '_id').all().map(r => r.id);
  if (!srcs.length) { incon.push(t); console.log('§CLASS ' + t + ' INCONCLUSIVE: no ' + t + ' document in the BASE to clone'); continue; }
  let chosen = null, tries = [];
  for (const s of srcs.slice(0, 20)) { const A = device('A', 9100000, {}), nL = lt ? A.db.prepare('SELECT COUNT(*) n FROM ' + lt + ' WHERE ' + t + '_id=?').get(s).n : 0, ia = A_IDS(nL);
    A.clone(t, s, ia); const r = A.complete(t, ia.h); A.close(); tries.push(s + ':' + (r.ok ? 'CO' : (r.msg || r.error || r.status)));
    if (r.ok && (r.ops || []).length) { chosen = s; break; } }
  console.log('§CLASS ' + t + ' line=' + (lt || '-') + ' seed_docs=' + srcs.length + ' tried=' + tries.length + ' [' + tries.map(x => String(x).slice(0, 40)).join(' | ') + ']' + (chosen ? ' chosen=' + chosen : ''));
  if (!chosen) { incon.push(t); console.log('§T1 SAME ' + t + ' INCONCLUSIVE: no seed document of this class completes on A (first ' + tries.length + ' tried)'); continue; }
  judged++;
  // T1 SAME
  const p = pair(t, chosen, {});
  const d1 = diff(p.nA, p.nB), tabs = p.nA.reduce((m, o) => { const k = o.table + ':' + o.op.replace('CRUD_', ''); m[k] = (m[k] || 0) + 1; return m; }, {});
  console.log('§T1 SAME ' + t + ' A.ok=' + p.rA.ok + ' B.ok=' + p.rB.ok + ' opsA=' + p.nA.length + ' opsB=' + p.nB.length + ' group=' + JSON.stringify(tabs) + ' -> ' + (p.rB.ok && !d1.length ? 'MATCH' : 'NOT DERIVABLE YET: ' + (p.rB.ok ? d1.join(', ') : 'B refused: ' + (p.rB.msg || p.rB.error))));
  sameRes[t] = { p, d1, src: chosen };
  if (p.rB.ok && !d1.length) derivable.push(t); else notDer.push(t + '{' + d1.slice(0, 6).join(',') + (d1.length > 6 ? ',…+' + (d1.length - 6) : '') + '}');
  // T2 BYTES
  const docBytes = JSON.stringify(p.docA).length, grpBytes = JSON.stringify(p.rA.ops).length, intent = JSON.stringify({ table: t, uu: p.docA.header[t + '_uu'], action: 'CO', ts: ENV0.now }).length;
  console.log('§T2 BYTES ' + t + ' today=' + (docBytes + grpBytes) + ' (doc ' + docBytes + ' + complete group ' + grpBytes + ') thin=' + (docBytes + intent) + ' (doc ' + docBytes + ' + intent ' + intent + ') saving=' + (100 * (1 - (docBytes + intent) / (docBytes + grpBytes))).toFixed(1) + '% (net: 1 - thin/today)');
  // T3 preconditions
  const pc = pair(t, chosen, { clock: ENV1 }), dc = diff(p.nA, pc.nB);
  console.log('§T3 CLOCK ' + t + ' B on its own clock (' + ENV1.now + ') -> ' + (dc.length ? 'differs: ' + dc.join(', ') : 'no column depends on the clock'));
  const pd = pair(t, chosen, { docnoAdvance: true }), dd = diff(p.nA, pd.nB);
  console.log('§T3 DOCNO ' + t + ' B\'s sequences advanced by one document -> ' + (dd.length ? 'differs: ' + dd.join(', ') : 'no column depends on the sequence state'));
  p.A.apply(p.rA.ops); const again = p.A.complete(t, p.ia.h);
  console.log('§T3 RERUN ' + t + ' a second CO on A after its group is applied -> ok=' + again.ok + ' ops=' + (again.ops || []).length + (again.msg ? ' msg="' + again.msg + '"' : '') + ' ' + ((!again.ok || !(again.ops || []).length) ? 'IDEMPOTENT' : 'NOT IDEMPOTENT: ' + (again.ops || []).map(o => o.table + ':' + o.op_type.replace('CRUD_', '') + ' ' + JSON.stringify(o.changes ? Object.keys(o.changes).reduce((m, k) => { m[k] = o.changes[k] && o.changes[k].new !== undefined ? o.changes[k].new : o.changes[k]; return m; }, {}) : o.fields || {}).slice(0, 160)).join(' ; ')));
  const po = pair(t, chosen, {}, true), dor = diff(po.nA, po.nB), same = JSON.stringify(dor) === JSON.stringify(d1);
  console.log('§T3 ORDER ' + t + ' B completed BEFORE A -> ' + (same ? 'same comparison (no hidden state between devices)' : 'DIFFERENT: ' + dor.join(', ') + ' vs ' + d1.join(', ')));
  console.log('§T3 UU ' + t + ' generated uu on A=' + p.A.uuCount() + ' B=' + p.B.uuCount() + (p.A.uuCount() ? ' — the host mints these at random: each device would give a derived row a DIFFERENT uu (must be made deterministic before thin derivation ships)' : ' — none'));
  [pc, pd, po].forEach(closeP);
}
probeDb.close();
console.log('§T5 SKEW OPEN (not built): the intent carries no model-layer manifest, so B cannot tell that A runs different model code — a skewed B would derive silently. Needs a manifest hash on the intent + a refusal rule (versioning lane: shape versions / min_v)');
// ── comparator mutants: each must turn at least one MATCH class away from MATCH ──
console.log('§MUTANTS (the comparator itself must notice each change)');
let killed = 0;
function mut(label, f) { const hit = derivable.filter(t => { const p = sameRes[t].p, nb = JSON.parse(JSON.stringify(p.nB)); f(nb, t); return diff(p.nA, nb).length > 0; });
  const ok = derivable.length > 0 && hit.length > 0; if (ok) killed++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + ' -> ' + (derivable.length ? hit.length + '/' + derivable.length + ' MATCH classes turned' : 'VACUOUS: no MATCH class to mutate')); }
mut('one op dropped from B\'s group', nb => { nb.pop(); });
mut('one value altered in B\'s group', nb => { const o = nb.find(x => Object.keys(x.vals).some(k => typeof x.vals[k] === 'number')); if (o) { const k = Object.keys(o.vals).find(k => typeof o.vals[k] === 'number'); o.vals[k] += 1; } });
const clockHit = derivable.filter(t => { const pc = pair(t, sameRes[t].src, { clock: ENV1 }); const r = diff(sameRes[t].p.nA, pc.nB).length > 0; closeP(pc); return r; });
{ const ok = clockHit.length > 0; if (ok) killed++; console.log('   ' + (ok ? '🟢' : '🔴') + ' B\'s clock shifted without telling the comparator -> ' + clockHit.length + '/' + derivable.length + ' MATCH classes turned' + (derivable.length ? '' : ' (VACUOUS)')); }
Object.values(sameRes).forEach(r => closeP(r.p));
const N = Object.keys(ML.DOCS).length;
console.log('§THIN_VERDICT EVIDENCE judged=' + judged + ' derivable=' + derivable.length + '/' + N + ' [' + derivable.join(',') + '] notDerivable=[' + notDer.join(' ') + '] inconclusive=[' + incon.join(',') + '] mutants=' + killed + '/3' + (judged ? '' : ' INCONCLUSIVE: nothing judged'));
process.exit(0);
