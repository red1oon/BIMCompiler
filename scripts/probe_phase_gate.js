#!/usr/bin/env node
// probe_phase_gate.js — STUDY ONLY, no fix (2026-08-18, bim-compiler
// prompts/4D_GANTT_TM_REFACTOR.md §S24_TRIAGE). Written while triaging the §S24 spec; nothing in
// §S24.3 is implemented and this probe does not implement it.
//
// ⚠ DO NOT REMOVE — this is the ONLY place the §S24.5 acceptance question is actually measured:
// "on a real building, at one level, does the LATEST finish of phase A come at or before the
// EARLIEST start of phase B, in real days" — asked directly, per (level, phase-pair), on BOTH
// engines side by side. §RESULTS named this as the test that did not exist anywhere; it now does.
// Read the log after every run. Exit code is not evidence.
//
// ⚠ WHICH .db YOU POINT THIS AT IS PART OF THE MEASUREMENT (same landmine probe_arch_start.js
// §SERVED_BYTES records). The viewer fetches `<Building>_meta.db` whenever the meta+geo pair
// exists (viewer/streaming.js §DB_SPLIT_DETECT, ~line 2190) — regardless of mtime. Locally that is
// Terminal / Hospital / Clinic / LTU_AHouse. `Clinic_meta.db` (Jun 6) is OLDER than
// `Clinic_extracted.db` (Aug 3) and is still the served half, so "pick the newest file" picks the
// wrong one. DEFAULT_FLEET below names the served half per building; override with ONLY=.
//
// Reported per building, every number derived, none assumed:
//   §PG_GAP_{RAW,CPM}  per (level, TIER1 pair): group A finish, group B start, gap in days,
//                      offender count. RAW = ScheduleGate.computeSchedule (the local shell,
//                      §S24.2's precedent). CPM = CpmSchedule.run (what the live viewer displays,
//                      time_machine.js _displayTimeline).
//   §PG_SCC            SCC census of the built graph BEFORE solve() drops anything, plus the
//                      physics-only (E1/E2) census — §S24.1's 45,182 / size-5 claims.
//   §PG_ABLATE         same graph minus one edge population at a time — which population actually
//                      glues the giant component (§S24.1 attributes it to E4 density).
//   §PG_BACKWARD       designated supports whose SUPPORT sits in a strictly LATER (band, phase)
//                      group than its dependent, by designation class, plus the same count for E2
//                      host/opening pairs. This is the population a strictly sequential forward
//                      pass (§S24.3 Step 2) has no computed value for.
//   §PG_LEVEL_SPLIT    level names whose elements form two z-clusters >4m apart — one storey NAME
//                      spanning two federated datums, which the (level, phase) group key merges.
//
// Usage:  node scripts/probe_phase_gate.js                 # served half of all 7 buildings
//         ONLY=Terminal_meta node scripts/probe_phase_gate.js
//         ABLATE=0 node scripts/probe_phase_gate.js        # skip the (slower) ablation pass
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
const initSqlJs = require(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleGate = require(path.join(ROOT, 'viewer', 'schedule_gate.js'));
const ScheduleAuthor = require(path.join(ROOT, 'viewer', 'schedule_author.js'));
const CpmSchedule = require(path.join(ROOT, 'viewer', 'cpm_schedule.js'));

const BLD = path.join(ROOT, 'buildings');
// the half the viewer actually serves — NOT the newest file (see the header warning)
const DEFAULT_FLEET = ['Terminal_meta', 'Hospital_meta', 'Clinic_meta', 'LTU_AHouse_meta',
                       'Duplex_extracted', 'HHS_Office_Federated_extracted', 'JKR_extracted'];
const FLEET = (process.env.ONLY || DEFAULT_FLEET.join(',')).split(',');
const SHIFT_HOURS = process.env.SHIFT_HOURS ? Number(process.env.SHIFT_HOURS) : 24;
const ABLATE = process.env.ABLATE !== '0';
const DAY = 86400000;
const TIER1 = ['Substructure', 'Superstructure', 'Architecture'];

// iterative Tarjan over cpm_schedule.js's own `out` adjacency (same shape, own copy so this probe
// never depends on a non-exported internal); `allow(edge, u)` filters an ablation population.
function tarjan(total, out, allow) {
  const comp = new Int32Array(total).fill(-1), low = new Int32Array(total),
        num = new Int32Array(total).fill(-1), onStack = new Uint8Array(total);
  const stack = [], sizes = []; let idx = 0; const cv = [], ce = [];
  for (let root = 0; root < total; root++) {
    if (num[root] >= 0) continue;
    cv.push(root); ce.push(0);
    while (cv.length) {
      const u = cv[cv.length - 1]; let ei = ce[ce.length - 1];
      if (ei === 0) { num[u] = low[u] = idx++; stack.push(u); onStack[u] = 1; }
      const os = out[u]; let advanced = false;
      if (os) {
        while (ei < os.length) {
          const e = os[ei];
          if (e.dropped || (allow && !allow(e, u))) { ei++; continue; }
          const v = e.to;
          if (num[v] < 0) { ce[ce.length - 1] = ei + 1; cv.push(v); ce.push(0); advanced = true; break; }
          if (onStack[v] && num[v] < low[u]) low[u] = num[v];
          ei++;
        }
      }
      if (advanced) continue;
      cv.pop(); ce.pop();
      if (low[u] === num[u]) {
        const cid = sizes.length; let sz = 0, w;
        do { w = stack.pop(); onStack[w] = 0; comp[w] = cid; sz++; } while (w !== u);
        sizes.push(sz);
      } else if (cv.length) { const p = cv[cv.length - 1]; if (low[u] < low[p]) low[p] = low[u]; }
    }
  }
  return { comp, sizes };
}
const biggest = t => t.sizes.slice().sort((a, b) => b - a).slice(0, 4).join(',');

// §PG_GAP — THE acceptance question, per (level, TIER1 pair). Nothing here reads the graph: it is
// pure "when did the last element of A finish, when did the first element of B start".
function gapReport(items, times, label, bld) {
  const grp = {}, lz = {};
  items.forEach((o, i) => {
    if (!o.storey) return;
    const L = ScheduleGate.collapsePhase(o.storey), P = o.phase || '_UNPHASED';
    const g = grp[L + '||' + P] || (grp[L + '||' + P] = { s: Infinity, e: -Infinity, n: 0 });
    if (times[i].s < g.s) g.s = times[i].s;
    if (times[i].e > g.e) g.e = times[i].e;
    g.n++;
    const z = lz[L] || (lz[L] = { sum: 0, c: 0 }); z.sum += o.bz; z.c++;
  });
  const levels = Object.keys(lz).sort((a, b) => lz[a].sum / lz[a].c - lz[b].sum / lz[b].c);
  let base = Infinity; times.forEach(t => { if (t.s < base) base = t.s; });
  const byLvl = {};
  items.forEach((o, i) => { if (!o.storey) return;
    const k = ScheduleGate.collapsePhase(o.storey) + '||' + (o.phase || '_UNPHASED');
    (byLvl[k] = byLvl[k] || []).push(i); });
  const rows = [];
  levels.forEach(L => {
    for (let p = 0; p + 1 < TIER1.length; p++) {
      const A = grp[L + '||' + TIER1[p]], B = grp[L + '||' + TIER1[p + 1]];
      if (!A || !B) continue;
      const gap = (B.s - A.e) / DAY;
      let off = 0;
      (byLvl[L + '||' + TIER1[p + 1]] || []).forEach(i => { if (times[i].s < A.e) off++; });
      rows.push([L, TIER1[p][0] + '->' + TIER1[p + 1][0], A.n, B.n, +gap.toFixed(2),
                 off + '/' + B.n, +((A.e - base) / DAY).toFixed(2), +((B.s - base) / DAY).toFixed(2)]);
    }
  });
  console.log('§PG_GAP_' + label + '_TABLE ' + bld + ' [level, pair, nA, nB, gapDays, offenders, AfinishD, BstartD]');
  rows.forEach(r => console.log('   ' + JSON.stringify(r)));
  const bad = rows.filter(r => r[4] < 0);
  const worst = rows.length ? Math.min.apply(null, rows.map(r => r[4])) : 0;
  console.log('§PG_GAP_' + label + ' ' + bld + ' pairs=' + rows.length + ' negativeGap=' + bad.length +
    ' worstGapDays=' + worst.toFixed(2) + ' ' + (bad.length === 0 ? 'PASS' : 'FAIL'));
  return { pairs: rows.length, bad: bad.length, worst };
}

async function runBuilding(SQL, RATES, bld) {
  const dbPath = path.join(BLD, bld + '.db');
  if (!fs.existsSync(dbPath)) { console.log('§PG_SKIP ' + bld + ' — no such DB: ' + dbPath); return null; }
  const st = fs.statSync(dbPath);
  console.log('§PG_DB ' + bld + ' ' + dbPath + ' mtime=' + st.mtime.toISOString() + ' bytes=' + st.size);
  const db = new SQL.Database(fs.readFileSync(dbPath));
  const raw = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
    laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
    nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
  db.close();
  const elements = raw.map(it => Object.assign({}, it, { bz: it.base_z, tz: it.top_z }));
  const maxCrews = {};
  for (const r in RATES.LABOR_RATES) if (RATES.LABOR_RATES[r].max_crews) maxCrews[r] = RATES.LABOR_RATES[r].max_crews;
  const quiet = console.log; console.log = () => {};
  const sched = ScheduleGate.computeSchedule(elements, 0, 1, maxCrews, SHIFT_HOURS);
  console.log = quiet;
  const items = elements.map(el => {
    const s = sched[el.guid]; if (!s) return null;
    return { guid: el.guid, cls: el.cls, seq: el.seq, phase: el.phase, storey: el.storey,
             x0: el.x0, x1: el.x1, y0: el.y0, y1: el.y1, bz: el.bz, tz: el.tz,
             s: s.start, e: s.end, resource: el.resource };
  }).filter(Boolean);
  const n = items.length;
  console.log('§PG_BUILDING ' + bld + ' n=' + n);

  // RAW — the local, no-shared-graph shell (§S24.2's precedent), its own times
  const rawGap = gapReport(items, items.map(o => ({ s: o.s, e: o.e })), 'RAW', bld);

  const G = CpmSchedule.contactGraph(items);
  const graph = CpmSchedule.buildGraph(items, G);
  const N = graph.nNodes, out = graph.out;
  console.log('§PG_EDGES ' + bld + ' ' + JSON.stringify(graph.counts) + ' nodes=' + N);

  // (band, phase) group key — replicates buildGraph's own bandRank/phaseRank derivation
  const lvlOf = [], agg = {};
  items.forEach((it, i) => { const L = it.storey ? ScheduleGate.collapsePhase(it.storey) : null; lvlOf[i] = L;
    if (L) { const a = agg[L] || (agg[L] = { sum: 0, c: 0 }); a.sum += it.bz; a.c++; } });
  const levels = Object.keys(agg).sort((a, b) => agg[a].sum / agg[a].c - agg[b].sum / agg[b].c);
  const bandOf = {}; levels.forEach(L => { bandOf[L] = Math.floor((agg[L].sum / agg[L].c) / 3); });
  const bandVals = []; levels.forEach(L => { if (bandVals.indexOf(bandOf[L]) < 0) bandVals.push(bandOf[L]); });
  bandVals.sort((a, b) => a - b);
  const brOfBand = {}; bandVals.forEach((b, r) => { brOfBand[b] = r; });
  const bandRank = {}; levels.forEach(L => { bandRank[L] = brOfBand[bandOf[L]]; });
  const phaseRank = P => { const t = TIER1.indexOf(P); return t >= 0 ? t : 3; };
  const gk = i => (i >= n || !lvlOf[i] ? -1 : bandRank[lvlOf[i]] * 8 + phaseRank(items[i].phase || '_UNPHASED'));
  const backE1 = (e, u) => { if (e.type !== 1) return false; const a = gk(u), b = gk(e.to); return a >= 0 && b >= 0 && a > b; };

  // §PG_SCC — before solve() drops anything
  const all = tarjan(N, out, null);
  console.log('§PG_SCC ' + bld + ' allEdges biggest=' + biggest(all) +
    ' multiNode=' + all.sizes.filter(s => s > 1).length + ' ofNodes=' + N);
  const phys = tarjan(N, out, e => e.type === 1 || e.type === 2);
  console.log('§PG_SCC_PHYSICS ' + bld + ' biggest=' + biggest(phys) +
    ' multiNode=' + phys.sizes.filter(s => s > 1).length);

  if (ABLATE) {
    console.log('§PG_ABLATE ' + bld +
      ' base=' + biggest(all) +
      ' noBackwardE1=' + biggest(tarjan(N, out, (e, u) => !backE1(e, u))) +
      ' noE4=' + biggest(tarjan(N, out, e => e.type !== 4)) +
      ' noE3=' + biggest(tarjan(N, out, e => e.type !== 3)) +
      ' noE1=' + biggest(tarjan(N, out, e => e.type !== 1)) +
      ' noE2=' + biggest(tarjan(N, out, e => e.type !== 2)));
  }

  // §PG_BACKWARD — supports that sit in a strictly LATER group than what they support
  const EPS = ScheduleGate.EPS, GAP = ScheduleGate.GAP;
  const des = graph.designated;
  const byCls = [0, 0, 0], byPair = {};
  let back = 0, tot = 0;
  for (let i = 0; i < n; i++) {
    const j = des[i]; if (j < 0) continue;
    tot++;
    const a = gk(j), b = gk(i);
    if (a < 0 || b < 0 || a <= b) continue;
    back++;
    const S = items[j], T = items[i];
    const c = (S.bz < T.bz - EPS && S.tz >= T.bz - GAP) ? 0
            : (S.bz <= T.bz + EPS && S.tz >= T.tz - EPS) ? 1 : 2;
    byCls[c]++;
    const k = (S.phase || '?') + '->' + (T.phase || '?') + (lvlOf[j] === lvlOf[i] ? ' [same level]' : ' [cross level]');
    byPair[k] = (byPair[k] || 0) + 1;
  }
  const gateEls = items.map(it => ({ guid: it.guid, cls: it.cls, seq: it.seq, x0: it.x0, x1: it.x1,
                                     y0: it.y0, y1: it.y1, base_z: it.bz, top_z: it.tz }));
  let hp = 0, hpB = 0, op = 0, opB = 0;
  ScheduleGate.hostPairs(gateEls).forEach(p => { hp++; const a = gk(p.h), b = gk(p.i); if (a >= 0 && b >= 0 && a > b) hpB++; });
  ScheduleGate.openingPairs(gateEls).forEach(p => { op++; const a = gk(p.h), b = gk(p.i); if (a >= 0 && b >= 0 && a > b) opB++; });
  console.log('§PG_BACKWARD ' + bld + ' designatedSupports=' + tot + ' backward=' + back +
    ' byClass={bearingBelow:' + byCls[0] + ',embedded:' + byCls[1] + ',carrierAbove:' + byCls[2] + '}' +
    ' hostPairs=' + hpB + '/' + hp + ' openingPairs=' + opB + '/' + op +
    ' topPhasePairs=' + JSON.stringify(Object.keys(byPair).sort((a, b) => byPair[b] - byPair[a])
      .slice(0, 5).map(k => k + '=' + byPair[k])));

  // §PG_LEVEL_SPLIT — one storey NAME whose elements do not share one vertical body (the group key
  // merges them anyway). Clustered by INTERVAL OVERLAP of [base_z, top_z] with tolerance GAP, NOT by
  // centre-z distance: a centre-z rule reports any tall element as its own datum — measured, it
  // called Terminal's 236 real 30m precast piles a second ground floor (§S24_TRIAGE T7 CORRECTED).
  // A pile and the slab it carries overlap vertically and stay one level, as they should.
  const ivByL = {};
  items.forEach((o, i) => { if (lvlOf[i]) (ivByL[lvlOf[i]] = ivByL[lvlOf[i]] || []).push([o.bz, o.tz]); });
  const splits = [];
  Object.keys(ivByL).forEach(L => {
    const iv = ivByL[L].slice().sort((a, b) => a[0] - b[0]);
    const cl = [[iv[0][0], iv[0][1], 1]];
    for (let i = 1; i < iv.length; i++) {
      const c = cl[cl.length - 1];
      if (iv[i][0] <= c[1] + GAP) { if (iv[i][1] > c[1]) c[1] = iv[i][1]; c[2]++; }
      else cl.push([iv[i][0], iv[i][1], 1]);
    }
    const big = cl.filter(c => c[2] >= Math.max(3, 0.03 * iv.length));
    if (big.length > 1) splits.push([L, big.map(c => [+c[0].toFixed(1), +c[1].toFixed(1), c[2]])]);
  });
  const strayN = splits.reduce((s, x) => s + x[1].slice(1).reduce((a, c) => a + c[2], 0), 0);
  console.log('§PG_LEVEL_SPLIT ' + bld + ' levels=' + Object.keys(ivByL).length +
    ' splitLevels=' + splits.length + ' elementsOutsideMainBody=' + strayN + ' ' + JSON.stringify(splits));

  // CPM — what the live viewer actually displays (time_machine.js _displayTimeline)
  const sol = CpmSchedule.solve(items, graph, { maxCrews });
  console.log('§PG_DROPS ' + bld + ' ' + JSON.stringify(sol.drops));
  const cpmGap = gapReport(items, sol.times, 'CPM', bld);
  console.log('§PG_VERDICT ' + bld + ' RAW=' + rawGap.bad + '/' + rawGap.pairs +
    ' worst=' + rawGap.worst.toFixed(2) + 'd | CPM=' + cpmGap.bad + '/' + cpmGap.pairs +
    ' worst=' + cpmGap.worst.toFixed(2) + 'd');
  return { bld, raw: rawGap, cpm: cpmGap };
}

async function main() {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();
  const out = [];
  for (const b of FLEET) { const r = await runBuilding(SQL, RATES, b); if (r) out.push(r); }
  console.log('§PG_FLEET ' + JSON.stringify(out.map(r =>
    [r.bld, 'raw=' + r.raw.bad + '/' + r.raw.pairs, 'rawWorst=' + r.raw.worst.toFixed(1) + 'd',
     'cpm=' + r.cpm.bad + '/' + r.cpm.pairs, 'cpmWorst=' + r.cpm.worst.toFixed(1) + 'd'])));
  const clean = out.filter(r => r.cpm.bad === 0).length;
  console.log('§PG_FLEET_VERDICT buildings=' + out.length + ' cpmClean=' + clean + '/' + out.length +
    ' — STUDY ONLY, this probe fixes nothing');
}
main().catch(e => { console.error('§PG_ERROR ' + (e && e.stack || e)); process.exit(2); });
