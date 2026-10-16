#!/usr/bin/env node
// proto_s25_forward_pass.js — PROTOTYPE of prompts/4D_GANTT_TM_REFACTOR.md §S25.7, measured against
// real buildings (2026-08-19). STUDY ONLY: this is a probe, not the shipped engine. Nothing in
// viewer/ is changed by it. Its job is to answer, before anyone builds §S25 for real, the one
// question §S25.12 admits is unanswered: does the layer contract actually produce a correct
// schedule on real data, or does it fail somewhere the design didn't anticipate?
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
//
// It implements §S25 end to end and nothing else:
//   L1 §S25.2  level ladder — identity split by vertical INTERVAL OVERLAP (never centre-z: that
//              reads a 30m pile as its own datum, §S24_TRIAGE T7 CORRECTED), names merged by median
//              datum within GAP, ordered by the shipped 3m band rank (parallel sub-buildings on one
//              band are never chained).
//   L2 §S25.3  physics — contactGraph/designatedSupport + hostPairs/openingPairs, all FINISH-to-
//              START. Same-group constraints must sort earlier by (base_z, guid) or they are a data
//              contradiction: DROPPED and COUNTED, never contracted.
//   §S25.5     deferral — a physics predecessor in a LATER group defers its dependent, and that
//              dependent leaves its own group's completion count. Deferral points strictly forward
//              in a total order, so no cycle can form. No Tarjan, no fixpoint, no sweep cap.
//   L3 §S25.4  convention — phase gate (TIER1 in order, then Tier-2 after all Tier-1 at a level) and
//              level gate (same phase, previous band) as NUMBERS released by counters, not edges.
//   L4 §S25.6  capacity — same claim-earliest-slot allocator, claims made in TIME order via a heap
//              keyed (feasible start, base_z, guid). Delays only.
//   §S25.8     durations computed here from installSecs — computeSchedule is NOT consulted for them,
//              which is the claim that makes ONE engine possible.
//
// Measured per building, all three engines in ONE run so the comparison is exact:
//   RAW = ScheduleGate.computeSchedule · CPM = CpmSchedule.run (live today) · S25 = this pass.
//   §S25P_GAP    the acceptance question, per (level, TIER1 pair): negative gaps + worst, per engine
//   §S25P_FLOAT  ScheduleGate.auditFloating — dependent starting before its support FINISHES (the FS
//                invariant §S25.3 exists to close; W-MZ-8's locked baselines are this number)
//   §S25P_MIDAIR the directional judge — dependent starting before its designated support STARTS
//   §S25P_CREW   over-capacity exposure per resource
//   §S25P_RUN    leftover (MUST be 0), deferred/contradiction counts, makespan, wall-clock
//
// Usage:  node scripts/proto_s25_forward_pass.js
//         ONLY=Terminal_meta node scripts/proto_s25_forward_pass.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
const initSqlJs = require(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleGate = require(path.join(ROOT, 'viewer', 'schedule_gate.js'));
const ScheduleAuthor = require(path.join(ROOT, 'viewer', 'schedule_author.js'));
const CpmSchedule = require(path.join(ROOT, 'viewer', 'cpm_schedule.js'));

const BLD = path.join(ROOT, 'buildings');
const DEFAULT_FLEET = ['Terminal_meta', 'Hospital_meta', 'Clinic_meta', 'LTU_AHouse_meta',
                       'Duplex_extracted', 'HHS_Office_Federated_extracted', 'JKR_extracted'];
const FLEET = (process.env.ONLY || DEFAULT_FLEET.join(',')).split(',');
const SHIFT_HOURS = process.env.SHIFT_HOURS ? Number(process.env.SHIFT_HOURS) : 24;
const DAY = 86400000;
const TIER1 = ['Substructure', 'Superstructure', 'Architecture'];
const GAP = ScheduleGate.GAP, EPS = ScheduleGate.EPS;

// §S25.8 — the duration mapping, reimplemented here rather than imported, precisely to prove the
// pass needs nothing from computeSchedule. Verbatim schedule_gate.js toProductive/toWall.
const SHIFT_MS = SHIFT_HOURS * 3600 * 1000;
const SCALE = process.env.SCALE ? Number(process.env.SCALE) : 1;
function toProductive(t) { const o = t; if (o <= 0) return 0; const d = Math.floor(o / DAY), r = o - d * DAY; return d * SHIFT_MS + (r < SHIFT_MS ? r : SHIFT_MS); }
function toWall(p) { if (p <= 0) return 0; const d = Math.floor(p / SHIFT_MS), r = p - d * SHIFT_MS; return d * DAY + r; }

// ── L1 §S25.2 ────────────────────────────────────────────────────────────────────────────────────
// levelLadder(items) -> { levelOf: Int32Array, levels: [{name, base, top, med, band, bandRank, n}] }
function levelLadder(items) {
  const byName = {};
  items.forEach((o, i) => {
    if (!o.storey) return;
    const nm = ScheduleGate.collapsePhase(o.storey);
    (byName[nm] = byName[nm] || []).push(i);
  });
  // split: a name's elements cluster by vertical interval overlap (tolerance GAP)
  const bodies = [];
  Object.keys(byName).forEach(nm => {
    const idx = byName[nm].slice().sort((a, b) => items[a].bz - items[b].bz);
    let cur = null;
    idx.forEach(i => {
      if (cur && items[i].bz <= cur.top + GAP) { if (items[i].tz > cur.top) cur.top = items[i].tz; cur.members.push(i); }
      else { cur = { name: nm, base: items[i].bz, top: items[i].tz, members: [i] }; bodies.push(cur); }
    });
  });
  // merge: distinct bodies whose DATUM (median base_z of their members) agrees within GAP are one
  // physical storey exported twice (federated ladders). Median, not extent — a tall column's top
  // reaches the floor above and must not merge two storeys.
  bodies.forEach(b => {
    const zs = b.members.map(i => items[i].bz).sort((x, y) => x - y);
    b.med = zs[Math.floor(zs.length / 2)];
  });
  bodies.sort((a, b) => a.med - b.med);
  const levels = [];
  bodies.forEach(b => {
    const last = levels[levels.length - 1];
    if (last && Math.abs(b.med - last.med) <= GAP) {
      last.members = last.members.concat(b.members);
      last.names.push(b.name);
      if (b.base < last.base) last.base = b.base;
      if (b.top > last.top) last.top = b.top;
    } else levels.push({ names: [b.name], base: b.base, top: b.top, med: b.med, members: b.members });
  });
  // order: shipped M1 band = floor(mean base_z / 3m), dense-ranked over bands present
  levels.forEach(L => {
    let s = 0; L.members.forEach(i => { s += items[i].bz; });
    L.meanZ = s / L.members.length;
    L.band = Math.floor(L.meanZ / 3);
    L.n = L.members.length;
  });
  const bandVals = [];
  levels.forEach(L => { if (bandVals.indexOf(L.band) < 0) bandVals.push(L.band); });
  bandVals.sort((a, b) => a - b);
  const rankOf = {}; bandVals.forEach((b, r) => { rankOf[b] = r; });
  levels.forEach(L => { L.bandRank = rankOf[L.band]; });
  const levelOf = new Int32Array(items.length).fill(-1);
  levels.forEach((L, li) => L.members.forEach(i => { levelOf[i] = li; }));
  return { levelOf, levels };
}

function phaseRank(P) { const t = TIER1.indexOf(P); return t >= 0 ? t : 3; }

// ── the §S25.7 pass ──────────────────────────────────────────────────────────────────────────────
function s25Compute(items, maxCrews, desOverride) {
  const t0 = Date.now();
  const n = items.length;
  const lad = levelLadder(items), levelOf = lad.levelOf, levels = lad.levels;

  // groups = (level, phase); pass order = (bandRank, phaseRank, phaseName, levelIdx) — a TOTAL order
  const gidOf = new Int32Array(n).fill(-1), groups = [], gidByKey = {};
  for (let i = 0; i < n; i++) {
    const li = levelOf[i]; if (li < 0) continue;
    const P = items[i].phase || '_UNPHASED', key = li + '||' + P;
    let g = gidByKey[key];
    if (g === undefined) {
      g = groups.length; gidByKey[key] = g;
      groups.push({ level: li, phase: P, bandRank: levels[li].bandRank, pr: phaseRank(P),
                    members: [], remaining: 0, gatePending: 0, gateTime: 0, complete: -1, deferred: 0 });
    }
    gidOf[i] = g; groups[g].members.push(i);
  }
  const order = groups.map((g, i) => i).sort((a, b) => {
    const A = groups[a], B = groups[b];
    return A.bandRank - B.bandRank || A.pr - B.pr ||
           (A.phase < B.phase ? -1 : A.phase > B.phase ? 1 : 0) || A.level - B.level;
  });
  const passRank = new Int32Array(groups.length);
  order.forEach((g, r) => { passRank[g] = r; });
  // rank of an element for the total-order test: ungrouped sorts before everything (rank -1)
  const rankOfEl = i => (gidOf[i] < 0 ? -1 : passRank[gidOf[i]]);
  const sortsEarlier = (p, e) => (items[p].bz !== items[e].bz ? items[p].bz < items[e].bz
                                  : String(items[p].guid) < String(items[e].guid));

  // ── L2 §S25.3 — physics constraints, all FS
  const G = CpmSchedule.contactGraph(items);
  const des = CpmSchedule.designatedSupport(items, G);
  const gateEls = items.map(it => ({ guid: it.guid, cls: it.cls, seq: it.seq, x0: it.x0, x1: it.x1,
                                     y0: it.y0, y1: it.y1, base_z: it.bz, top_z: it.tz }));
  // §S25.3 — ONE designated support per element (the default), or EVERY qualifying support with
  // ALL_SUPPORTS=1. The all-supports variant was tried because `auditFloating` (the judge) tests all
  // of them while the designated edge covers one; it is REPRODUCIBLY NOT VIABLE and the flag exists
  // so that stays checkable rather than remembered: contact relations in real data are mutual, so
  // every qualifying support as an edge explodes the physics cycles — measured on Duplex, largest
  // physics component 5 -> 672, contracted edges 76 -> 4,821, re-homed 31.6% -> 93.3%, makespan
  // 8.1d -> 2.7d (a schedule where almost everything shares a start is not a schedule). The RAW
  // shell reaches float=0 by a different mechanism entirely — a grid gate that only sees supports
  // ALREADY PLACED, plus its 16-sweep repair loop — not by holding all of them as constraints.
  // SUPPORTS=designated (default, one elected support) | bearing | all.
  //   bearing  — exactly the predicate the JUDGE (auditFloating) tests: EVERY bearing-below support
  //              (S.base_z < T.base_z - EPS, STRICTLY ANTISYMMETRIC so it cannot cycle) plus the
  //              scoped hang set (fires only when the element has no bearing support at all, and the
  //              carrier is strictly above its top — mutual hang impossible). Proposed by the
  //              2026-08-19 review as the option C4 never tested: C4's `all` also included EMBEDDED,
  //              the symmetric clause (two coincident boxes each embed the other) that manufactured
  //              the cycle explosion C4 then blamed on all-supports as such.
  //   all      — C4's original: bearing + embedded + hang.
  const SUPPORTS = process.env.SUPPORTS || 'designated';
  const cons = [];
  let nSup = 0;
  if (SUPPORTS === 'designated') {
    for (let i = 0; i < n; i++) { const j = desOverride ? desOverride[i] : des[i];
      if (j >= 0) { cons.push([j, i]); nSup++; } }
  } else if (SUPPORTS === 'bearing' || SUPPORTS === 'bearingonly') {
    for (let i = 0; i < n; i++) {
      const list = G.contacts[i]; if (!list) continue;
      const T = items[i];
      let below = 0;
      for (let k = 0; k < list.length; k++) {
        const j = list[k], S = items[j];
        if (S.bz < T.bz - EPS && S.tz >= T.bz - GAP) { cons.push([j, i]); nSup++; below++; }
      }
      if (SUPPORTS === 'bearingonly') continue;
      if (!below && !G.grounded[i]) for (let k = 0; k < list.length; k++) {
        const j = list[k], S = items[j];
        if (S.bz >= T.tz - GAP && S.tz > T.tz + EPS) { cons.push([j, i]); nSup++; }
      }
    }
  }
  for (let i = 0; SUPPORTS === 'all' && i < n; i++) {
    const list = G.contacts[i]; if (!list) continue;
    const T = items[i];
    let below = 0;
    for (let k = 0; k < list.length; k++) {
      const j = list[k], S = items[j];
      if ((S.bz < T.bz - EPS && S.tz >= T.bz - GAP) ||             // bearing below
          (S.bz <= T.bz + EPS && S.tz >= T.tz - EPS)) {            // embedded
        cons.push([j, i]); nSup++; below++;
      }
    }
    if (!below && !G.grounded[i]) {                                // hang: only with no bearing support
      for (let k = 0; k < list.length; k++) {
        const j = list[k], S = items[j];
        if (S.bz >= T.tz - GAP && S.tz > T.tz + EPS) { cons.push([j, i]); nSup++; }
      }
    }
  }
  // 'bearingonly' isolates the DIRECTION question: bearing-below edges alone are strictly
  // antisymmetric in base_z and therefore cannot cycle at all. Every other family (hang, host,
  // opening) can point DOWN, and it is those that close cycles against a bearing chain running up.
  if (SUPPORTS !== 'bearingonly') {
    ScheduleGate.hostPairs(gateEls).forEach(p => cons.push([p.h, p.i]));
    ScheduleGate.openingPairs(gateEls).forEach(p => cons.push([p.h, p.i]));
  }

  // ── §S25.5 CORRECTED (2026-08-19, found by this prototype's first run: the rule as written in
  // §S25.5 DEADLOCKS — a NON-deferred element whose predecessor is a DEFERRED element of its own
  // group cannot finish, so the group never completes, so the later group never opens, so the
  // deferred element never runs. Measured on Duplex: 975 of 1,119 elements stuck. Excluding
  // deferred members from a group's completion is not enough; the lateness has to MOVE the element.)
  //
  // The fix, and it is simpler than the rule it replaces: an element does not "belong to its group
  // and get excused" — it belongs to the LATEST group any of its physics predecessors puts it in.
  //     effectiveRank(e) = max( passRank(group(e)), max over predecessors p of effectiveRank(p) )
  // one longest-path propagation in topological order. Every constraint is then forward-or-same by
  // construction, group completion is "all my work is done" with no exclusion accounting, and the
  // deadlock cannot form. Re-homed elements are counted and reported, exactly as before.
  //
  // For that longest path to exist the PHYSICS layer must be acyclic. §S25.0's claim is that it is —
  // support is a strict order by elevation — and that any physics cycle is a data error. True but
  // not automatic: `designatedSupport`'s carrier-above class (a hung duct) points DOWNWARD in
  // elevation, so a mutual pair can close a 2-cycle. So: one Tarjan over the PHYSICS LAYER ONLY
  // (tiny — largest physics SCC in the fleet is 5-17 nodes), drop the edges inside a multi-node
  // component, COUNT them. This is not the merged-graph Tarjan §S25.0 rejects: it runs on one layer,
  // where a cycle means the model is wrong, and it reports rather than silently contracting.
  const predsOf = new Array(n), succsOf = new Array(n);
  let cForward = 0, cSame = 0, cDefer = 0, cPhysCycle = 0;
  let compOf = null, compSizes = null;
  {
    const adj = new Array(n);
    cons.forEach(([p, e]) => { if (p !== e) (adj[p] || (adj[p] = [])).push(e); });
    const comp = new Int32Array(n).fill(-1), low = new Int32Array(n), num = new Int32Array(n).fill(-1);
    const onS = new Uint8Array(n), st = [], sizes = []; let idx = 0;
    const cv = [], ce = [];
    for (let root = 0; root < n; root++) {
      if (num[root] >= 0) continue;
      cv.push(root); ce.push(0);
      while (cv.length) {
        const u = cv[cv.length - 1]; let ei = ce[ce.length - 1];
        if (ei === 0) { num[u] = low[u] = idx++; st.push(u); onS[u] = 1; }
        const os = adj[u]; let adv = false;
        if (os) while (ei < os.length) {
          const v = os[ei];
          if (num[v] < 0) { ce[ce.length - 1] = ei + 1; cv.push(v); ce.push(0); adv = true; break; }
          if (onS[v] && num[v] < low[u]) low[u] = num[v];
          ei++;
        }
        if (adv) continue;
        cv.pop(); ce.pop();
        if (low[u] === num[u]) { const cid = sizes.length; let sz = 0, w;
          do { w = st.pop(); onS[w] = 0; comp[w] = cid; sz++; } while (w !== u);
          sizes.push(sz);
        } else if (cv.length) { const p2 = cv[cv.length - 1]; if (low[u] < low[p2]) low[p2] = low[u]; }
      }
    }
    for (let k = 0; k < cons.length; k++) {
      const p = cons[k][0], e = cons[k][1];
      if (p === e) continue;
      // A mutual-support pair is a MODELLING error, not a scheduling choice. Its members are
      // CONTRACTED (one shared start, the judge's own equality contract) rather than dropped —
      // dropping cost 53 midair violations on Duplex, measured, because the dependent then had
      // nothing holding it. Contraction is confined to the PHYSICS layer, where the cycle is, and
      // is counted. Nothing else is dropped: every other physics constraint is kept, and the graph
      // is acyclic BECAUSE these components are contracted, so no ordering rule has to be invented
      // to keep it that way.
      if (comp[p] === comp[e] && sizes[comp[p]] > 1) { cPhysCycle++; continue; }
      const rp = rankOfEl(p), re = rankOfEl(e);
      if (rp === re) cSame++; else if (rp < re) cForward++; else cDefer++;
      (predsOf[e] || (predsOf[e] = [])).push(p);
      (succsOf[p] || (succsOf[p] = [])).push(e);
    }
    compOf = comp; compSizes = sizes;
  }
  // effective rank: longest path over the CONDENSATION of the physics DAG (a contracted component
  // is ONE node, so every member shares one rank). Propagating over elements first and sharing the
  // component max afterwards is WRONG and deadlocks — measured: raising a component member's rank
  // after propagation leaves its successors at a lower rank than their own predecessor, so a group
  // waits on work re-homed past it (Duplex, 674 of 1,119 stuck). Condensation first, then propagate.
  const effRank = new Int32Array(n);
  {
    const nC = compSizes.length;
    const compRank = new Int32Array(nC).fill(-1);
    for (let i = 0; i < n; i++) { const r = rankOfEl(i); if (r > compRank[compOf[i]]) compRank[compOf[i]] = r; }
    const cAdj = new Array(nC), cIndeg = new Int32Array(nC);
    for (let e = 0; e < n; e++) {
      const ps = predsOf[e]; if (!ps) continue;
      for (let k = 0; k < ps.length; k++) {
        const cp = compOf[ps[k]], ce2 = compOf[e];
        if (cp === ce2) continue;
        (cAdj[cp] || (cAdj[cp] = [])).push(ce2);
        cIndeg[ce2]++;
      }
    }
    const q = []; for (let c = 0; c < nC; c++) if (!cIndeg[c]) q.push(c);
    let h = 0, seen = 0;
    while (h < q.length) {
      const u = q[h++]; seen++;
      const os = cAdj[u]; if (!os) continue;
      for (let k = 0; k < os.length; k++) {
        const v = os[k];
        if (compRank[u] > compRank[v]) compRank[v] = compRank[u];
        if (--cIndeg[v] === 0) q.push(v);
      }
    }
    if (seen !== nC) console.log('§S25P_TOPO_INCOMPLETE comps seen=' + seen + '/' + nC +
      ' — the physics condensation is not a DAG, which contradicts §S25.0');
    for (let i = 0; i < n; i++) effRank[i] = compRank[compOf[i]];
  }
  const rehomed = new Uint8Array(n);
  let cRehome = 0;
  for (let i = 0; i < n; i++) if (gidOf[i] >= 0 && effRank[i] !== passRank[gidOf[i]]) { rehomed[i] = 1; cRehome++; }
  // membership for completion accounting is by EFFECTIVE rank: rank -> its group id
  const groupAtRank = new Int32Array(groups.length);
  order.forEach((g, r) => { groupAtRank[r] = g; });
  const effGroupOf = new Int32Array(n).fill(-1);
  // §S25.7: an element with no level gets NO group gate. Lifting it into a group by its ancestor's
  // rank made it feed that group's completion time while never being counted as re-homed — a silent
  // membership channel (found by review, 2026-08-19).
  for (let i = 0; i < n; i++) if (effRank[i] >= 0 && gidOf[i] >= 0) effGroupOf[i] = groupAtRank[effRank[i]];
  const effMembers = new Array(groups.length);
  for (let g = 0; g < groups.length; g++) { effMembers[g] = []; groups[g].remaining = 0; groups[g].deferred = 0; }
  for (let i = 0; i < n; i++) if (effGroupOf[i] >= 0) { effMembers[effGroupOf[i]].push(i); groups[effGroupOf[i]].remaining++; }
  for (let i = 0; i < n; i++) if (rehomed[i]) groups[gidOf[i]].deferred++;

  // ── L3 §S25.4 — gates as numbers. phase gate within a level; level gate across bands per phase.
  const gatedBy = new Array(groups.length);      // g -> [groups that must complete first]
  const gates = new Array(groups.length);        // reverse: gating group -> [gated groups]
  for (let g = 0; g < groups.length; g++) { gatedBy[g] = []; gates[g] = []; }
  const byLevel = {};
  groups.forEach((g, gi) => { (byLevel[g.level] = byLevel[g.level] || []).push(gi); });
  Object.keys(byLevel).forEach(li => {
    const gs = byLevel[li];
    const t1 = TIER1.map(P => gs.find(gi => groups[gi].phase === P)).filter(x => x !== undefined);
    for (let i = 1; i < t1.length; i++) gatedBy[t1[i]].push(t1[i - 1]);
    const t2 = gs.filter(gi => phaseRank(groups[gi].phase) === 3);
    t2.forEach(gi => t1.forEach(t => gatedBy[gi].push(t)));
  });
  const byPhase = {};
  groups.forEach((g, gi) => { (byPhase[g.phase] = byPhase[g.phase] || []).push(gi); });
  Object.keys(byPhase).forEach(P => {
    const byBand = {};
    byPhase[P].forEach(gi => { (byBand[groups[gi].bandRank] = byBand[groups[gi].bandRank] || []).push(gi); });
    const ranks = Object.keys(byBand).map(Number).sort((a, b) => a - b);
    for (let r = 1; r < ranks.length; r++)
      byBand[ranks[r]].forEach(gi => byBand[ranks[r - 1]].forEach(pg => gatedBy[gi].push(pg)));
  });
  for (let g = 0; g < groups.length; g++) {
    groups[g].gatePending = gatedBy[g].length;
    gatedBy[g].forEach(pg => gates[pg].push(g));
  }

  // ── the pass
  const predCount = new Int32Array(n), predFinish = new Float64Array(n);
  for (let i = 0; i < n; i++) predCount[i] = predsOf[i] ? predsOf[i].length : 0;
  const ES = new Float64Array(n), EE = new Float64Array(n), done = new Uint8Array(n);
  const DUR = new Float64Array(n);
  for (let i = 0; i < n; i++) DUR[i] = Math.round((items[i].installSecs || 120) * SCALE * 1000);  // productive ms (§S25.8)

  const crews = {};
  const capFor = r => (typeof maxCrews === 'number' ? maxCrews : (maxCrews && maxCrews[r]) || 3);
  const poolOf = r => crews[r] || (crews[r] = new Array(capFor(r)).fill(0));

  const heap = [];
  const key = new Float64Array(n);
  function less(a, b) {
    if (key[a] !== key[b]) return key[a] < key[b];
    if (items[a].bz !== items[b].bz) return items[a].bz < items[b].bz;
    return String(items[a].guid) < String(items[b].guid);
  }
  function push(v) { heap.push(v); let c = heap.length - 1;
    while (c > 0) { const p = (c - 1) >> 1; if (less(heap[c], heap[p])) { const t = heap[c]; heap[c] = heap[p]; heap[p] = t; c = p; } else break; } }
  function pop() { const top = heap[0], last = heap.pop();
    if (heap.length) { heap[0] = last; let c = 0;
      for (;;) { const l = 2 * c + 1, r = l + 1; let m = c;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === c) break; const t = heap[c]; heap[c] = heap[m]; heap[m] = t; c = m; } }
    return top; }

  const open = new Uint8Array(groups.length);
  const completeQ = [];
  const compMembers = {}, compPending = {};
  for (let i = 0; i < n; i++) if (compSizes[compOf[i]] > 1) {
    (compMembers[compOf[i]] = compMembers[compOf[i]] || []).push(i);
    compPending[compOf[i]] = (compPending[compOf[i]] || 0) + 1;
  }
  const readyFlag = new Uint8Array(n);
  function feasible(i) {
    const g = effGroupOf[i];
    return Math.max(predFinish[i], g >= 0 ? groups[g].gateTime : 0);
  }
  function tryReady(i) {
    if (done[i] || readyFlag[i] || predCount[i] > 0) return;
    const g = effGroupOf[i];
    if (g >= 0 && !open[g]) return;
    readyFlag[i] = 1;
    const c = compOf[i];
    if (compSizes[c] === 1) { key[i] = feasible(i); push(i); return; }
    if (--compPending[c] === 0) {                       // whole component ready -> one shared start
      const mem = compMembers[c];
      let k2 = -Infinity;
      mem.forEach(m => { const f = feasible(m); if (f > k2) k2 = f; });
      const rep = mem[0];
      key[rep] = k2; push(rep);
    }
  }
  function completeGroup(g) {
    const G2 = groups[g];
    if (G2.complete >= 0) return;
    let c = G2.gateTime;
    effMembers[g].forEach(i => { if (done[i] && EE[i] > c) c = EE[i]; });
    G2.complete = c;
    gates[g].forEach(h => {
      if (c > groups[h].gateTime) groups[h].gateTime = c;
      if (--groups[h].gatePending === 0) completeQ.push(h);
    });
  }
  function openGroup(g) {
    if (open[g]) return;
    open[g] = 1;
    effMembers[g].forEach(tryReady);
    if (groups[g].remaining === 0) completeGroup(g);        // group whose work all re-homed away
  }
  for (let g = 0; g < groups.length; g++) if (groups[g].gatePending === 0) completeQ.push(g);
  const drain = () => { while (completeQ.length) openGroup(completeQ.shift()); };
  drain();
  for (let i = 0; i < n; i++) if (effGroupOf[i] < 0) tryReady(i);   // ungrouped: physics + crews only

  let processed = 0, crewOverCapScc = 0;
  function finalize(i, start) {
    const end = toWall(toProductive(start) + DUR[i]);
    ES[i] = start; EE[i] = end; done[i] = 1; processed++;
    const sc = succsOf[i];
    if (sc) for (let k = 0; k < sc.length; k++) {
      const d = sc[k];
      if (end > predFinish[d]) predFinish[d] = end;           // FS
      if (--predCount[d] === 0) tryReady(d);
    }
    const g = effGroupOf[i];
    if (g >= 0 && --groups[g].remaining === 0) { completeGroup(g); drain(); }
    return end;
  }
  while (heap.length) {
    const i = pop();
    if (done[i]) continue;
    const c = compOf[i];
    if (compSizes[c] === 1) {
      let start = feasible(i);
      const pool = poolOf(items[i].resource);
      let si = 0;
      for (let k = 1; k < pool.length; k++) if (pool[k] < pool[si]) si = k;
      if (pool[si] > start) start = pool[si];                 // L4: capacity delays, never reorders
      pool[si] = toWall(toProductive(start) + DUR[i]);
      finalize(i, start);
    } else {
      // contracted physics component: one shared start, one crew slot reserved per member
      const mem = compMembers[c].slice().sort((a, b) => items[a].bz - items[b].bz ||
        (String(items[a].guid) < String(items[b].guid) ? -1 : 1));
      let start = -Infinity;
      mem.forEach(m => { const f = feasible(m); if (f > start) start = f; });
      const picks = [], used = {};
      mem.forEach(m => {
        const r = items[m].resource, pool = poolOf(r);
        const u = used[r] || (used[r] = {});
        let si = -1;
        for (let k = 0; k < pool.length; k++) if (!u[k] && (si < 0 || pool[k] < pool[si])) si = k;
        if (si < 0) { crewOverCapScc++; si = 0; for (let k = 1; k < pool.length; k++) if (pool[k] < pool[si]) si = k; }
        else { u[si] = 1; if (pool[si] > start) start = pool[si]; }
        picks.push([m, r, si]);
      });
      picks.forEach(([m, r, si]) => {
        const pool = poolOf(r), end = toWall(toProductive(start) + DUR[m]);
        if (end > pool[si]) pool[si] = end;
      });
      mem.forEach(m => { if (!done[m]) finalize(m, start); });
    }
  }
  if (processed < n) {   // §S25.7: report a stall, never repair it — and say WHY it stalled
    let byPred = 0, byGate = 0; const sampleG = {}, sampleP = [];
    for (let i = 0; i < n; i++) {
      if (done[i]) continue;
      const g = effGroupOf[i];
      if (predCount[i] > 0) {
        byPred++;
        if (sampleP.length < 4) {
          const p = (predsOf[i] || []).find(x => !done[x]);
          sampleP.push(items[i].cls + '@' + (g >= 0 ? groups[g].phase + '/r' + passRank[g] : 'nogroup') +
            ' waits ' + (p == null ? '?' : items[p].cls + '@' +
              (gidOf[p] >= 0 ? groups[gidOf[p]].phase + '/r' + passRank[gidOf[p]] : 'nogroup') +
              (rehomed[i] ? ' [re-homed]' : '')));
        }
      } else if (g >= 0 && !open[g]) {
        byGate++;
        const k = groups[g].phase + '/band' + groups[g].bandRank;
        sampleG[k] = (sampleG[k] || 0) + 1;
      }
    }
    console.log('§S25P_STALL stuckOnPredecessor=' + byPred + ' stuckOnClosedGate=' + byGate +
      ' gateSample=' + JSON.stringify(Object.keys(sampleG).slice(0, 6).map(k => k + '=' + sampleG[k])) +
      ' predSample=' + JSON.stringify(sampleP));
  }
  let minS = Infinity, maxE = -Infinity;
  for (let i = 0; i < n; i++) { if (done[i]) { if (ES[i] < minS) minS = ES[i]; if (EE[i] > maxE) maxE = EE[i]; } }
  return { times: Array.from({ length: n }, (_, i) => ({ s: ES[i], e: EE[i] })),
           leftover: n - processed, levels, groups, deferredN: cDefer,
           forwardN: cForward, sameN: cSame, deferredEls: cRehome, physCycleDropped: cPhysCycle,
           bulkMask: Array.from({ length: n }, (_, i) => !rehomed[i]), nSup, crewOverCapScc,
           gidOf, effGroupOf, levelOf, rehomed,
           maxComp: compSizes.reduce((a, b) => (b > a ? b : a), 0),
           makespanDays: (maxE - minS) / DAY, ms: Date.now() - t0 };
}

// ── measurement (identical for all three engines) ────────────────────────────────────────────────
function gapReport(items, times, mask) {
  const grp = {}, lz = {};
  items.forEach((o, i) => {
    if (!o.storey) return;
    if (mask && !mask[i]) return;
    const L = ScheduleGate.collapsePhase(o.storey), P = o.phase || '_UNPHASED';
    const g = grp[L + '||' + P] || (grp[L + '||' + P] = { s: Infinity, e: -Infinity, n: 0 });
    if (times[i].s < g.s) g.s = times[i].s;
    if (times[i].e > g.e) g.e = times[i].e;
    g.n++;
    const z = lz[L] || (lz[L] = { sum: 0, c: 0 }); z.sum += o.bz; z.c++;
  });
  const levels = Object.keys(lz).sort((a, b) => lz[a].sum / lz[a].c - lz[b].sum / lz[b].c);
  const rows = [];
  levels.forEach(L => {
    for (let p = 0; p + 1 < TIER1.length; p++) {
      const A = grp[L + '||' + TIER1[p]], B = grp[L + '||' + TIER1[p + 1]];
      if (!A || !B) continue;
      rows.push({ L, pair: TIER1[p] + '->' + TIER1[p + 1], gap: (B.s - A.e) / DAY, nB: B.n });
    }
  });
  const bad = rows.filter(r => r.gap < 0);
  return { pairs: rows.length, bad: bad.length,
           worst: rows.length ? Math.min.apply(null, rows.map(r => r.gap)) : 0,
           worstRow: bad.sort((a, b) => a.gap - b.gap)[0] };
}
function floatCount(elements, items, times) {
  const m = {};
  items.forEach((o, i) => { m[o.guid] = { start: times[i].s, end: times[i].e }; });
  const q = console.log; console.log = () => {};
  try { return ScheduleGate.auditFloating(elements, m); } finally { console.log = q; }
}
function midairCount(items, times, G, des) {
  let v = 0;
  for (let i = 0; i < items.length; i++) { const j = des[i]; if (j < 0) continue;
    if (times[j].s > times[i].s + 1) v++; }
  return v;
}
function crewViol(items, times, maxCrews) {
  const byRes = {};
  items.forEach((o, i) => { (byRes[o.resource] = byRes[o.resource] || []).push(i); });
  let viol = 0;
  Object.keys(byRes).forEach(r => {
    const cap = (maxCrews && maxCrews[r]) || 3, ev = [];
    byRes[r].forEach(i => { ev.push([times[i].s, 1]); ev.push([times[i].e, -1]); });
    ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let cur = 0, over = 0, last = null;
    for (const [t, d] of ev) { if (cur > cap && last != null) over += t - last; last = t; cur += d; }
    if (over > DAY) viol++;
  });
  return viol;
}

async function runBuilding(SQL, RATES, bld) {
  const dbPath = path.join(BLD, bld + '.db');
  if (!fs.existsSync(dbPath)) { console.log('§S25P_SKIP ' + bld); return null; }
  const db = new SQL.Database(fs.readFileSync(dbPath));
  const elements = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
    laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
    nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
  db.close();
  const maxCrews = {};
  for (const r in RATES.LABOR_RATES) if (RATES.LABOR_RATES[r].max_crews) maxCrews[r] = RATES.LABOR_RATES[r].max_crews;
  const els = elements.map(it => Object.assign({}, it, { bz: it.base_z, tz: it.top_z }));
  const quiet = console.log; console.log = () => {};
  const raw = ScheduleGate.computeSchedule(els, 0, 1, maxCrews, SHIFT_HOURS);
  console.log = quiet;
  const items = els.map(e => {
    const r = raw[e.guid]; if (!r) return null;
    return { guid: e.guid, cls: e.cls, seq: e.seq, phase: e.phase, storey: e.storey,
             x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, bz: e.bz, tz: e.tz,
             s: r.start, e: r.end, resource: e.resource, installSecs: e.installSecs };
  }).filter(Boolean);
  const keep = elements.filter(e => raw[e.guid]);
  console.log('§S25P_BUILDING ' + bld + ' n=' + items.length + ' shiftHours=' + SHIFT_HOURS);

  const G = CpmSchedule.contactGraph(items), des = CpmSchedule.designatedSupport(items, G);
  const rawT = items.map(o => ({ s: o.s, e: o.e }));
  const cpmRun = CpmSchedule.run(items, { maxCrews });
  const cpmT = cpmRun.ok ? cpmRun.solution.times : rawT;
  let desOverride = null;
  if (process.env.DESIG === 'v2') {   // load-bearing preference + phase-order tie-break among equals
    const lvl = [], ag = {};
    items.forEach((it, i) => { const L = it.storey ? ScheduleGate.collapsePhase(it.storey) : null; lvl[i] = L;
      if (L) { const a = ag[L] || (ag[L] = { sum: 0, c: 0 }); a.sum += it.bz; a.c++; } });
    const lv = Object.keys(ag).sort((a, b) => ag[a].sum / ag[a].c - ag[b].sum / ag[b].c);
    const bo = {}; lv.forEach(L => { bo[L] = Math.floor((ag[L].sum / ag[L].c) / 3); });
    const bvals = []; lv.forEach(L => { if (bvals.indexOf(bo[L]) < 0) bvals.push(bo[L]); });
    bvals.sort((a, b) => a - b); const bro = {}; bvals.forEach((b, r) => { bro[b] = r; });
    const br = {}; lv.forEach(L => { br[L] = bro[bo[L]]; });
    const gk2 = i => (!lvl[i] ? -1 : br[lvl[i]] * 8 + phaseRank(items[i].phase || '_UNPHASED'));
    const EPS2 = ScheduleGate.EPS, GAP2 = ScheduleGate.GAP;
    desOverride = new Int32Array(items.length).fill(-1);
    for (let i = 0; i < items.length; i++) {
      const list = G.contacts[i]; if (!list) continue;
      const T = items[i];
      let bJ = -1, bCls = 9, bStruct = -1, bFwd = -1, bScore = Infinity;
      for (let k = 0; k < list.length; k++) {
        const j = list[k], S = items[j];
        let cls, score;
        if (S.bz < T.bz - EPS2 && S.tz >= T.bz - GAP2) { cls = 0; score = -S.tz; }
        else if (S.bz <= T.bz + EPS2 && S.tz >= T.tz - EPS2) { cls = 1; score = Math.abs(S.bz - T.bz); }
        else { cls = 2; score = S.bz; }
        const st = (cls < 2 && (S.seq <= 4 || (S.cls === 'IfcSlab' && S.seq > 4))) ? 1 : 0;
        const gj = gk2(j), gi = gk2(i);
        const fw = (gj >= 0 && gi >= 0 && gj <= gi) ? 1 : 0;
        if (cls < bCls || (cls === bCls && st > bStruct) || (cls === bCls && st === bStruct && fw > bFwd) ||
            (cls === bCls && st === bStruct && fw === bFwd && (score < bScore ||
             (score === bScore && (bJ < 0 || String(S.guid) < String(items[bJ].guid))))))
          { bCls = cls; bStruct = st; bFwd = fw; bScore = score; bJ = j; }
      }
      desOverride[i] = (bCls === 2 && G.grounded[i]) ? -1 : bJ;
    }
  }
  const s25 = s25Compute(items, maxCrews, desOverride);

  console.log('§S25P_LADDER ' + bld + ' levels=' + s25.levels.length +
    ' groups=' + s25.groups.length +
    ' ladder=' + JSON.stringify(s25.levels.slice(0, 30).map(L =>
      [L.names.join('='), +L.med.toFixed(1), L.bandRank, L.n])));
  console.log('§S25P_CLASSIFY ' + bld + ' constraints={forward:' + s25.forwardN + ',sameGroup:' +
    s25.sameN + ',deferral:' + s25.deferredN + ',contradictionDropped:' + s25.contradictions +
    ',physicsCycleContracted:' + s25.physCycleDropped + '}' +
    ' supportConstraints=' + s25.nSup + ' largestPhysComp=' + s25.maxComp +
    ' reHomedElements=' + s25.deferredEls + ' (' + (100 * s25.deferredEls / items.length).toFixed(1) +
    '% — the physically-late tail: cascaded from ' + s25.deferredN + ' backward constraints)');
  console.log('§S25P_RUN ' + bld + ' leftover=' + s25.leftover + ' ' +
    (s25.leftover === 0 ? 'PASS' : 'FAIL — §S25.7 says a non-zero leftover is a bug in the design, report it') +
    ' makespanDays=' + s25.makespanDays.toFixed(1) + ' ms=' + s25.ms);

  const out = {};
  [['RAW', rawT], ['CPM', cpmT], ['S25', s25.times]].forEach(([tag, T]) => {
    const g = gapReport(items, T), f = floatCount(keep, items, T),
          m = midairCount(items, T, G, des), c = crewViol(items, T, maxCrews);
    out[tag] = { g, f, m, c };
    console.log('§S25P_' + tag + ' ' + bld + ' negGap=' + g.bad + '/' + g.pairs +
      ' worst=' + g.worst.toFixed(2) + 'd' +
      (g.worstRow ? ' at[' + g.worstRow.L + ' ' + g.worstRow.pair + ']' : '') +
      ' float=' + f + ' midair=' + m + ' crewViol=' + c +
      ' makespanD=' + ((Math.max.apply(null, T.map(t => t.e)) - Math.min.apply(null, T.map(t => t.s))) / DAY).toFixed(1));
  });
  function engineGap(useEffective) {
    const acc = {};
    for (let i = 0; i < items.length; i++) {
      const g = useEffective ? s25.effGroupOf[i] : s25.gidOf[i];
      if (g < 0) continue;
      const G3 = s25.groups[g], k = G3.level + '||' + G3.phase;
      const a = acc[k] || (acc[k] = { s: Infinity, e: -Infinity, lvl: G3.level });
      if (s25.times[i].s < a.s) a.s = s25.times[i].s;
      if (s25.times[i].e > a.e) a.e = s25.times[i].e;
    }
    let pairs = 0, bad = 0, worst = 0, worstAt = '';
    s25.levels.forEach((L, li) => {
      for (let p = 0; p + 1 < TIER1.length; p++) {
        const A = acc[li + '||' + TIER1[p]], B = acc[li + '||' + TIER1[p + 1]];
        if (!A || !B) continue;
        pairs++;
        const gap = (B.s - A.e) / DAY;
        if (gap < 0) { bad++; if (gap < worst) { worst = gap; worstAt = L.names.join('=') + ' ' + TIER1[p][0] + '->' + TIER1[p + 1][0]; } }
      }
    });
    return { pairs, bad, worst, worstAt };
  }
  const engEff = engineGap(true), engLab = engineGap(false);
  console.log('§S25P_ENGINE ' + bld + ' enforced(effective membership)=' + engEff.bad + '/' + engEff.pairs +
    ' worst=' + engEff.worst.toFixed(2) + 'd' + (engEff.worstAt ? ' at[' + engEff.worstAt + ']' : '') +
    ' ' + (engEff.bad === 0 ? 'PASS' : 'FAIL') +
    ' | asLabelled(re-homed tail included)=' + engLab.bad + '/' + engLab.pairs +
    ' worst=' + engLab.worst.toFixed(2) + 'd' + (engLab.worstAt ? ' at[' + engLab.worstAt + ']' : ''));
  const bulk = gapReport(items, s25.times, s25.bulkMask);
  console.log('§S25P_BULK ' + bld + ' negGap=' + bulk.bad + '/' + bulk.pairs +
    ' worst=' + bulk.worst.toFixed(2) + 'd' + (bulk.worstRow ? ' at[' + bulk.worstRow.L + ' ' +
    bulk.worstRow.pair + ']' : '') + ' ' + (bulk.bad === 0 ? 'PASS' : 'FAIL') +
    ' — same test over each phase\'s OWN work (re-homed tail excluded, listed above)');
  console.log('§S25P_COMPARE ' + bld + ' [byName gap | float | makespanD]  RAW=' +
    out.RAW.g.bad + '/' + out.RAW.g.pairs + ' ' + out.RAW.g.worst.toFixed(1) + 'd | ' + out.RAW.f + ' | ' +
    ((Math.max.apply(null, rawT.map(t => t.e)) - Math.min.apply(null, rawT.map(t => t.s))) / DAY).toFixed(1) +
    '   CPM=' + out.CPM.g.bad + '/' + out.CPM.g.pairs + ' ' + out.CPM.g.worst.toFixed(1) + 'd | ' + out.CPM.f + ' | ' +
    ((Math.max.apply(null, cpmT.map(t => t.e)) - Math.min.apply(null, cpmT.map(t => t.s))) / DAY).toFixed(1) +
    '   S25=' + out.S25.g.bad + '/' + out.S25.g.pairs + ' ' + out.S25.g.worst.toFixed(1) + 'd | ' + out.S25.f + ' | ' +
    s25.makespanDays.toFixed(1) + '   supports=' + (process.env.SUPPORTS || 'designated') +
    ' desig=' + (process.env.DESIG || 'v0') + ' crewOverCapScc=' + s25.crewOverCapScc);
  console.log('§S25P_VERDICT ' + bld +
    ' gap ' + out.CPM.g.bad + '->' + out.S25.g.bad + '/' + out.S25.g.pairs +
    ' | float ' + out.CPM.f + '->' + out.S25.f +
    ' | midair ' + out.CPM.m + '->' + out.S25.m +
    ' | crew ' + out.CPM.c + '->' + out.S25.c +
    ' | leftover=' + s25.leftover + ' | engineGap=' + engEff.bad + '/' + engEff.pairs +
    ' | bulkGapByName=' + bulk.bad + '/' + bulk.pairs + (bulk.bad ? ' BULK_FAIL worst=' +
      bulk.worst.toFixed(2) + 'd' : '') +
    '   [engineGap is a SELF-ASSERT, not evidence: min-start(B) >= gateTime(B) >= complete(A) = max-end(A) by construction]');
  return { bld, n: items.length, out, s25, bulk, engEff, engLab };
}

async function main() {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();
  const all = [];
  for (const b of FLEET) { const r = await runBuilding(SQL, RATES, b); if (r) all.push(r); }
  console.log('§S25P_FLEET ' + JSON.stringify(all.map(r =>
    [r.bld, 'gap ' + r.out.CPM.g.bad + '->' + r.out.S25.g.bad + '/' + r.out.S25.g.pairs,
     'float ' + r.out.CPM.f + '->' + r.out.S25.f, 'midair ' + r.out.CPM.m + '->' + r.out.S25.m,
     'crew ' + r.out.CPM.c + '->' + r.out.S25.c, 'leftover ' + r.s25.leftover,
     'engineGap ' + r.engEff.bad + '/' + r.engEff.pairs,
     'asLabelled ' + r.engLab.bad + '/' + r.engLab.pairs,
     'reHomed ' + (100 * r.s25.deferredEls / r.n).toFixed(1) + '%'])));
  const clean = all.filter(r => r.engEff.bad === 0 && r.s25.leftover === 0).length;
  console.log('§S25P_FLEET_VERDICT buildings=' + all.length + ' s25Clean=' + clean + '/' + all.length +
    ' — PROTOTYPE, viewer/ unchanged');
}
main().catch(e => { console.error('§S25P_ERROR ' + (e && e.stack || e)); process.exit(2); });
