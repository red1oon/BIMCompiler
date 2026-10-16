#!/usr/bin/env node
// probe_s26_rank_monotone.js — the §S26 PAPER GATE (2026-08-19). STUDY ONLY, nothing in viewer/
// changes. It answers ONE falsifiable question before a line of engine code is written:
//
//   Can a single integer rank R(e), computed from data alone, satisfy  R(S) < R(E)  for EVERY
//   physical relation (S,E) where S must precede E?
//
// If yes, ordering needs no graph at all: sort by R, then physics is a max() delay (the pre-#1242
// architecture) and the SCC/contraction/cycle-breaker/blob machinery is unreachable code.
// If no, §S26 is dead and this probe says so with the offender counts.
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
//
// R is lexicographic  (bandRank, phaseRank, depth, bz, guid)  where
//   bandRank — dense rank of floor(base_z / 3m); the SHIPPED §S1_BAND_RANK band, never storey names
//              (Clinic's "Roof - Main" occupies 3 distinct elevations — a label is not a level).
//   phaseRank— Substructure < Superstructure < Architecture < everything else.
//   depth    — longest path over BEARING edges ONLY. Bearing requires S.bz < E.bz - EPS strictly,
//              so base_z strictly increases along every chain and a cycle is arithmetically
//              impossible. This is the whole reason depth is well-defined without Tarjan.
//   INHERITANCE (§S26's hole-closer): a hosted element takes its HOST's bandRank, a hanging element
//              takes its CARRIER's bandRank — not its own base_z. Those are the two families whose
//              edges point DOWN in elevation, i.e. the only ones that can invert a height sort.
//
// Usage:  node scripts/probe_s26_rank_monotone.js            (whole fleet)
//         ONLY=Duplex_extracted node scripts/probe_s26_rank_monotone.js
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
const SHIFT_HOURS = 24;
const TIER1 = ['Substructure', 'Superstructure', 'Architecture'];
const GAP = ScheduleGate.GAP, EPS = ScheduleGate.EPS;
const BAND_M = 3;
const INHERIT = process.env.INHERIT !== '0';   // INHERIT=0 measures the naive height sort (the pre-#1242 baseline)

function phaseRank(P) { const t = TIER1.indexOf(P); return t >= 0 ? t : 3; }

// ── the required-precedence set, by family ───────────────────────────────────────────────────────
// Identical predicates to proto_s25_forward_pass.js SUPPORTS='all' + host/opening, so the two probes
// are measuring the same physics and the numbers are comparable.
// STRUCT=1 (the §S26 correction): a SUPPORT must be a load-bearing class. The unrestricted
// predicate calls any lower touching box a support — including an IfcFlowSegment under a wall,
// i.e. a pipe "bearing" a wall. That is a CONTACT, not a precedence, and it is those edges that
// contradict phase order. EMBED=0 additionally drops the `embedded` family, which is symmetric by
// construction (two coincident boxes each embed the other — schedule_gate.js's own #1242 comment
// calls this out as a 2-cycle for pool members and guards it with !elPool).
const STRUCT = process.env.STRUCT === '1';
const EMBED = process.env.EMBED !== '0';
const HANG = process.env.HANG !== '0';
const HOST = process.env.HOST !== '0';
const HANG_ONE = process.env.HANG === 'one';
function isPool(S) { return S.seq <= 4 || (ScheduleGate.isPromotedSlab && ScheduleGate.isPromotedSlab(S)); }
function requiredEdges(items, G, gateEls) {
  const n = items.length, fam = { bearing: [], embedded: [], hang: [], host: [], opening: [] };
  for (let i = 0; i < n; i++) {
    const list = G.contacts[i]; if (!list) continue;
    const T = items[i];
    let below = 0;
    for (let k = 0; k < list.length; k++) {
      const j = list[k], S = items[j];
      if (STRUCT && !isPool(S)) continue;
      if (S.bz < T.bz - EPS && S.tz >= T.bz - GAP) { fam.bearing.push([j, i]); below++; }
      else if (EMBED && S.bz <= T.bz + EPS && S.tz >= T.tz - EPS) { fam.embedded.push([j, i]); below++; }
    }
    // HANG=one (§S26 correction #2): elect ONE carrier — the NEAREST above — instead of holding
    // every qualifying one. Mirrors designatedSupport()'s cls=2 branch. Holding all of them is what
    // makes the hang family the sole remaining cycle source (measured: hang edges 24,298 vs 8,189
    // bearing on Clinic — three hangs per bearing is not a building, it is a predicate misfiring).
    if (HANG && !below && !G.grounded[i]) {
      let bestJ = -1, bestZ = Infinity;
      for (let k = 0; k < list.length; k++) {
        const j = list[k], S = items[j];
        if (STRUCT && !isPool(S)) continue;
        if (!(S.bz >= T.tz - GAP && S.tz > T.tz + EPS)) continue;
        if (HANG_ONE) { if (S.bz < bestZ || (S.bz === bestZ && bestJ >= 0 && String(S.guid) < String(items[bestJ].guid))) { bestZ = S.bz; bestJ = j; } }
        else fam.hang.push([j, i]);
      }
      if (HANG_ONE && bestJ >= 0) fam.hang.push([bestJ, i]);
    }
  }
  const gi = {}; items.forEach((it, i) => { gi[it.guid] = i; });
  if (HOST) ScheduleGate.hostPairs(gateEls).forEach(p => { if (gi[gateEls[p.h].guid] != null) fam.host.push([p.h, p.i]); });
  if (HOST) ScheduleGate.openingPairs(gateEls).forEach(p => { if (gi[gateEls[p.h].guid] != null) fam.opening.push([p.h, p.i]); });
  return fam;
}

// ── R ────────────────────────────────────────────────────────────────────────────────────────────
function computeRank(items, fam) {
  const n = items.length;
  // 1. raw band of each element's OWN base_z, dense-ranked
  const rawBand = new Int32Array(n);
  const seen = [];
  for (let i = 0; i < n; i++) { const b = Math.floor(items[i].bz / BAND_M); rawBand[i] = b; if (seen.indexOf(b) < 0) seen.push(b); }
  seen.sort((a, b) => a - b);
  const rankOf = {}; seen.forEach((b, r) => { rankOf[b] = r; });
  const band = new Int32Array(n);
  for (let i = 0; i < n; i++) band[i] = rankOf[rawBand[i]];

  // 2. INHERITANCE — a hosted element takes its host's band; a hanging element takes its carrier's.
  //    Iterated to a fixpoint so host-of-host chains resolve. Non-convergence within CAP means a
  //    mutual host/hang pair exists in the data: counted, named, never silently resolved.
  let inheritIters = 0, inheritMoved = 0, unconverged = 0;
  if (INHERIT) {
    const parent = new Int32Array(n).fill(-1);
    fam.host.forEach(([h, i]) => { if (parent[i] < 0) parent[i] = h; });
    fam.opening.forEach(([h, i]) => { if (parent[i] < 0) parent[i] = h; });
    fam.hang.forEach(([c, i]) => { if (parent[i] < 0) parent[i] = c; });
    const CAP = 32;
    for (let it = 0; it < CAP; it++) {
      let moved = 0;
      for (let i = 0; i < n; i++) { const p = parent[i]; if (p < 0) continue;
        if (band[i] !== band[p]) { band[i] = band[p]; moved++; } }
      inheritIters = it + 1; inheritMoved += moved;
      if (!moved) break;
      if (it === CAP - 1) unconverged = moved;
    }
  }

  // 3. depth — longest path over BEARING edges only (acyclic by arithmetic: S.bz < E.bz strictly).
  //    Kahn over that subgraph; leftover would prove the arithmetic claim wrong, so it is asserted.
  const indeg = new Int32Array(n), succ = new Array(n);
  fam.bearing.forEach(([s, e]) => { (succ[s] || (succ[s] = [])).push(e); indeg[e]++; });
  const depth = new Int32Array(n), q = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);
  let done = 0;
  for (let qi = 0; qi < q.length; qi++) { const u = q[qi]; done++;
    const ss = succ[u]; if (!ss) continue;
    for (let k = 0; k < ss.length; k++) { const v = ss[k];
      if (depth[u] + 1 > depth[v]) depth[v] = depth[u] + 1;
      if (--indeg[v] === 0) q.push(v); } }
  const bearingLeftover = n - done;

  const phase = new Int32Array(n);
  for (let i = 0; i < n; i++) phase[i] = phaseRank(items[i].phase);
  return { band, phase, depth, bearingLeftover, inheritIters, inheritMoved, unconverged };
}

// lexicographic compare of R(a) vs R(b): <0 means a strictly precedes b
function cmpR(R, items, a, b) {
  return (R.band[a] - R.band[b]) || (R.phase[a] - R.phase[b]) || (R.depth[a] - R.depth[b]) ||
         (items[a].bz - items[b].bz) ||
         (String(items[a].guid) < String(items[b].guid) ? -1 : String(items[a].guid) > String(items[b].guid) ? 1 : 0);
}

async function runBuilding(SQL, RATES, bld) {
  const dbPath = path.join(BLD, bld + '.db');
  if (!fs.existsSync(dbPath)) { console.log('§S26G_SKIP ' + bld); return null; }
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
  const items = els.filter(e => raw[e.guid]).map(e => ({ guid: e.guid, cls: e.cls, seq: e.seq,
    phase: e.phase, storey: e.storey, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, bz: e.bz, tz: e.tz }));
  const n = items.length;
  const G = CpmSchedule.contactGraph(items);
  const gateEls = items.map(it => ({ guid: it.guid, cls: it.cls, seq: it.seq, x0: it.x0, x1: it.x1,
                                     y0: it.y0, y1: it.y1, base_z: it.bz, top_z: it.tz }));
  const names0 = ['bearing', 'embedded', 'hang', 'host', 'opening'];
  const fam = requiredEdges(items, G, gateEls);
  const R = computeRank(items, fam);

  // ── THE DECISIVE MEASUREMENT ───────────────────────────────────────────────────────────────────
  // Is the CORRECTED required-precedence set acyclic as a whole? The live engine's set is not (it
  // collapses to one 93% component). If the corrected set IS acyclic, then every cycle in the live
  // engine came from edges that are not precedence — pipe-under-wall "support" and symmetric
  // embedding — and the SCC/contraction/cycle-breaker machinery is solving a manufactured problem.
  {
    const all = [];
    names0.forEach(f => fam[f].forEach(e => all.push(e)));
    const key = {}, ded = [];
    all.forEach(([a, b]) => { if (a === b) return; const k = a + ',' + b; if (!key[k]) { key[k] = 1; ded.push([a, b]); } });
    const ind = new Int32Array(n), sc = new Array(n);
    ded.forEach(([a, b]) => { (sc[a] || (sc[a] = [])).push(b); ind[b]++; });
    const qq = []; for (let i = 0; i < n; i++) if (!ind[i]) qq.push(i);
    let dn = 0;
    for (let qi = 0; qi < qq.length; qi++) { const u = qq[qi]; dn++; const ss = sc[u]; if (!ss) continue;
      for (let k = 0; k < ss.length; k++) if (--ind[ss[k]] === 0) qq.push(ss[k]); }
    const left = n - dn;
    // largest strongly-connected component among the leftovers (iterative Tarjan)
    let largest = 0;
    if (left) {
      const idx = new Int32Array(n).fill(-1), low = new Int32Array(n), on = new Uint8Array(n);
      const stk = [], sizes = []; let c = 0;
      for (let r = 0; r < n; r++) {
        if (idx[r] >= 0) continue;
        const work = [[r, 0]];
        while (work.length) {
          const fr = work[work.length - 1], u = fr[0];
          if (fr[1] === 0) { idx[u] = low[u] = c++; stk.push(u); on[u] = 1; }
          const ss = sc[u] || [];
          let rec = false;
          while (fr[1] < ss.length) { const v = ss[fr[1]++];
            if (idx[v] < 0) { work.push([v, 0]); rec = true; break; }
            else if (on[v] && idx[v] < low[u]) low[u] = idx[v]; }
          if (rec) continue;
          if (low[u] === idx[u]) { let sz = 0, w;
            do { w = stk.pop(); on[w] = 0; sz++; } while (w !== u);
            if (sz > largest) largest = sz; sizes.push(sz); }
          work.pop();
          if (work.length) { const pu = work[work.length - 1][0]; if (low[u] < low[pu]) low[pu] = low[u]; }
        }
      }
    }
    console.log('§S26G_ACYCLIC ' + bld + ' correctedEdges=' + ded.length + ' kahnLeftover=' + left +
      ' largestSCC=' + (left ? largest : 1) +
      (left ? '  ⚠ STILL CYCLES' : '  ✓ ACYCLIC — no contraction, no cycle-breaker, no blob'));
  }

  const names = names0;
  let totE = 0, totBad = 0;
  // WHY did a violation happen? The first R level at which S is NOT strictly before E. This is the
  // diagnostic that separates "my rank is built wrong" from "the data genuinely contradicts itself".
  const cause = { band: 0, phase: 0, depth: 0, tie: 0 };
  const causeBy = {};
  const ex = { band: [], phase: [], depth: [] };
  const parts = names.map(f => {
    const E = fam[f]; let bad = 0;
    for (let k = 0; k < E.length; k++) {
      const s = E[k][0], e = E[k][1];
      if (cmpR(R, items, s, e) < 0) continue;
      bad++;
      let c;
      if (R.band[s] > R.band[e]) c = 'band';
      else if (R.band[s] === R.band[e] && R.phase[s] > R.phase[e]) c = 'phase';
      else if (R.band[s] === R.band[e] && R.phase[s] === R.phase[e] && R.depth[s] > R.depth[e]) c = 'depth';
      else c = 'tie';
      cause[c]++; causeBy[f + ':' + c] = (causeBy[f + ':' + c] || 0) + 1;
      if (ex[c] && ex[c].length < 3) ex[c].push(f + ' ' + items[s].cls + '@' + items[s].bz.toFixed(1) +
        '/' + items[s].phase + ' -> ' + items[e].cls + '@' + items[e].bz.toFixed(1) + '/' + items[e].phase);
    }
    totE += E.length; totBad += bad;
    return f + ' ' + bad + '/' + E.length;
  });
  console.log('§S26G_BUILD ' + bld + ' n=' + n + ' bands=' + (Math.max(...R.band) + 1) +
    ' inheritIters=' + R.inheritIters + ' inheritMoved=' + R.inheritMoved +
    ' unconverged=' + R.unconverged + ' bearingKahnLeftover=' + R.bearingLeftover +
    (R.bearingLeftover ? '  ⚠ BEARING CYCLED — the arithmetic claim is FALSE' : ' (bearing acyclic ✓)'));
  console.log('§S26G_VIOL ' + bld + ' TOTAL ' + totBad + '/' + totE +
    ' (' + (100 * totBad / (totE || 1)).toFixed(2) + '%) | ' + parts.join(' | '));
  // ── USER CLAIM (2026-08-19): the hang edge is REDUNDANT — a hanger is always a later PHASE than
  // the thing it hangs from, so the phase gate already orders the pair and the edge only adds cycles.
  // Measured directly: of every hang edge, how many are already covered by phase alone?
  {
    const H = fam.hang; let byPhase = 0, samePhase = 0, inverted = 0;
    const invEg = [], sameEg = {};
    H.forEach(([c, e]) => {
      const pc = R.phase[c], pe = R.phase[e];
      if (pc < pe) byPhase++;
      else if (pc === pe) { samePhase++;
        const k = items[c].phase + ' | ' + items[c].cls + ' carries ' + items[e].cls;
        sameEg[k] = (sameEg[k] || 0) + 1; }
      else { inverted++; if (invEg.length < 3) invEg.push(items[c].cls + '/' + items[c].phase +
        ' carries ' + items[e].cls + '/' + items[e].phase); }
    });
    const top = Object.keys(sameEg).sort((a, b) => sameEg[b] - sameEg[a]).slice(0, 3)
      .map(k => k + ' x' + sameEg[k]);
    console.log('§S26G_HANGREDUNDANT ' + bld + ' hangEdges=' + H.length +
      ' coveredByPhase=' + byPhase + ' (' + (100 * byPhase / (H.length || 1)).toFixed(1) + '%)' +
      ' samePhase=' + samePhase + ' phaseInverted=' + inverted);
    top.forEach(t => console.log('§S26G_HANGSAME ' + bld + ' ' + t));
    invEg.forEach(t => console.log('§S26G_HANGINV ' + bld + ' ' + t));
  }
  console.log('§S26G_CAUSE ' + bld + ' band=' + cause.band + ' phase=' + cause.phase +
    ' depth=' + cause.depth + ' tie=' + cause.tie + '  ' + JSON.stringify(causeBy));
  ['band', 'phase', 'depth'].forEach(c => ex[c].forEach(t => console.log('§S26G_EG ' + bld + ' [' + c + '] ' + t)));
  return { bld, n, totBad, totE, fam, R, items, bearingLeftover: R.bearingLeftover };
}

async function main() {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();
  const all = [];
  for (const b of FLEET) { const r = await runBuilding(SQL, RATES, b); if (r) all.push(r); }
  const clean = all.filter(r => r.totBad === 0).length;
  console.log('§S26G_FLEET ' + JSON.stringify(all.map(r => [r.bld, r.totBad + '/' + r.totE])));
  console.log('§S26G_VERDICT buildings=' + all.length + ' zeroViolation=' + clean + '/' + all.length +
    ' INHERIT=' + (INHERIT ? 'on' : 'off') + ' STRUCT=' + (STRUCT ? 'on' : 'off') + ' EMBED=' + (EMBED ? 'on' : 'off') + ' HANG=' + (HANG ? (HANG_ONE ? 'one' : 'all') : 'off') + ' HOST=' + (HOST ? 'on' : 'off') + ' — PAPER GATE, viewer/ unchanged');
}
main().catch(e => { console.error('§S26G_ERROR ' + (e && e.stack || e)); process.exit(2); });
