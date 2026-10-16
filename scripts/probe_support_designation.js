#!/usr/bin/env node
// probe_support_designation.js — STUDY ONLY (2026-08-19, prompts/4D_GANTT_TM_REFACTOR.md
// §S25_PROTO.4 item 1). Nothing is changed by this probe; it answers ONE question with data:
//
//   When `designatedSupport` elects a support that sits in a LATER (band, phase) group than the
//   element it supports — the population that re-homes 17-64% of a building (§S25_PROTO.2) — did an
//   EQUALLY VALID candidate exist that would not have contradicted the phase order?
//
// Why it matters: if the answer is mostly YES, the fix is a TIE-BREAK among physically equivalent
// candidates (same classification class, so physics is not overridden — only the arbitrary choice
// between equals changes), and §S25_PROTO.2's 9.4x amplification collapses. If mostly NO, then the
// backward supports are genuine physics and the phase LABELS are what disagree with the building —
// a different fix entirely, in classification, not in support election.
//
// Classes are `designatedSupport`'s own, verbatim (cpm_schedule.js): 0 bearing-below, 1 embedded,
// 2 carrier-above; preference order 0 < 1 < 2, and §GROUNDED_NEVER_HANGS rejects class 2 for a
// grounded element. Group key is buildGraph's own (bandRank*8 + phaseRank).
//
// ⚠ Read the log after every run; exit code is not evidence.
// Usage: node scripts/probe_support_designation.js   [ONLY=Terminal_meta]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
const initSqlJs = require(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.js'));
const ScheduleGate = require(path.join(ROOT, 'viewer', 'schedule_gate.js'));
const ScheduleAuthor = require(path.join(ROOT, 'viewer', 'schedule_author.js'));
const CpmSchedule = require(path.join(ROOT, 'viewer', 'cpm_schedule.js'));

const BLD = path.join(ROOT, 'buildings');
const FLEET = (process.env.ONLY || ['Terminal_meta', 'Hospital_meta', 'Clinic_meta', 'LTU_AHouse_meta',
  'Duplex_extracted', 'HHS_Office_Federated_extracted', 'JKR_extracted'].join(',')).split(',');
const TIER1 = ['Substructure', 'Superstructure', 'Architecture'];
const EPS = ScheduleGate.EPS, GAP = ScheduleGate.GAP;

async function one(SQL, RATES, bld) {
  const dbPath = path.join(BLD, bld + '.db');
  if (!fs.existsSync(dbPath)) { console.log('§SD_SKIP ' + bld); return; }
  const db = new SQL.Database(fs.readFileSync(dbPath));
  const els = ScheduleAuthor._buildScheduleElements(db, RATES.SEQUENCE_RULES, {
    laborRates: RATES.LABOR_RATES, rates: RATES.RATES,
    nameOverrides: RATES.SEQUENCE_NAME_OVERRIDES, defaultRule: RATES.SEQUENCE_DEFAULT });
  db.close();
  const items = els.map(e => Object.assign({}, e, { bz: e.base_z, tz: e.top_z }));
  const n = items.length;
  const G = CpmSchedule.contactGraph(items);
  const des = CpmSchedule.designatedSupport(items, G);

  // group key — buildGraph's own derivation
  const lvlOf = [], agg = {};
  items.forEach((it, i) => { const L = it.storey ? ScheduleGate.collapsePhase(it.storey) : null; lvlOf[i] = L;
    if (L) { const a = agg[L] || (agg[L] = { sum: 0, c: 0 }); a.sum += it.bz; a.c++; } });
  const levels = Object.keys(agg).sort((a, b) => agg[a].sum / agg[a].c - agg[b].sum / agg[b].c);
  const bandOf = {}; levels.forEach(L => { bandOf[L] = Math.floor((agg[L].sum / agg[L].c) / 3); });
  const bv = []; levels.forEach(L => { if (bv.indexOf(bandOf[L]) < 0) bv.push(bandOf[L]); });
  bv.sort((a, b) => a - b); const brOf = {}; bv.forEach((b, r) => { brOf[b] = r; });
  const bandRank = {}; levels.forEach(L => { bandRank[L] = brOf[bandOf[L]]; });
  const pr = P => { const t = TIER1.indexOf(P); return t >= 0 ? t : 3; };
  const gk = i => (!lvlOf[i] ? -1 : bandRank[lvlOf[i]] * 8 + pr(items[i].phase || '_UNPHASED'));

  const classOf = (j, i) => {
    const S = items[j], T = items[i];
    if (S.bz < T.bz - EPS && S.tz >= T.bz - GAP) return 0;
    if (S.bz <= T.bz + EPS && S.tz >= T.tz - EPS) return 1;
    return 2;
  };

  let backward = 0, sameClassAlt = 0, anyClassAlt = 0, noAlt = 0, soleCandidate = 0;
  const byChosenClass = [0, 0, 0], altByClass = [0, 0, 0];
  const examples = [];
  for (let i = 0; i < n; i++) {
    const j = des[i]; if (j < 0) continue;
    const gi = gk(i), gj = gk(j);
    if (gi < 0 || gj < 0 || gj <= gi) continue;
    backward++;
    const chosenCls = classOf(j, i);
    byChosenClass[chosenCls]++;
    const list = G.contacts[i] || [];
    let same = false, any = false, cands = 0;
    for (let k = 0; k < list.length; k++) {
      const c = list[k]; if (c === j) continue;
      const cls = classOf(c, i);
      if (cls === 2 && G.grounded[i]) continue;         // §GROUNDED_NEVER_HANGS — not a legal candidate
      cands++;
      const gc = gk(c);
      if (gc < 0 || gc > gi) continue;                  // also backward (or ungrouped) — no help
      any = true;
      if (cls === chosenCls) same = true;
      altByClass[cls]++;
    }
    if (same) sameClassAlt++;
    if (any) anyClassAlt++; else { noAlt++; if (!cands) soleCandidate++; }
    if (examples.length < 4 && same)
      examples.push(items[i].cls + '@' + lvlOf[i] + '/' + items[i].phase + ' chose ' +
        items[j].cls + '@' + lvlOf[j] + '/' + items[j].phase + ' (cls' + chosenCls +
        ') over ' + cands + ' other candidates');
  }
  console.log('§SD ' + bld + ' n=' + n + ' backwardDesignations=' + backward +
    ' chosenClass={bearingBelow:' + byChosenClass[0] + ',embedded:' + byChosenClass[1] +
    ',carrierAbove:' + byChosenClass[2] + '}');
  console.log('§SD_ALT ' + bld +
    ' hasSameClassNonBackwardAlternative=' + sameClassAlt + ' (' + (100 * sameClassAlt / Math.max(1, backward)).toFixed(1) + '%)' +
    ' hasAnyNonBackwardAlternative=' + anyClassAlt + ' (' + (100 * anyClassAlt / Math.max(1, backward)).toFixed(1) + '%)' +
    ' noAlternative=' + noAlt + ' ofWhichSoleCandidate=' + soleCandidate);
  console.log('§SD_EG ' + bld + ' ' + JSON.stringify(examples));

  // ── SIMULATION: two corrected election rules, same classification, different tie-break.
  // V0 = shipped (class, then nearest: cls0 -> max top_z). V1 adds a LOAD-BEARING preference: among
  // class-0/1 candidates, a structure-pool member (seq<=4, or a promoted roof slab) outranks a
  // non-structural one — a pipe running 1cm under a wall currently beats the slab 10cm under it
  // purely on "nearest". V2 = V1, then prefer a candidate that does not contradict the phase order
  // (a tie-break between physically EQUIVALENT candidates — it never overrides a better class).
  function elect(i, mode) {
    const list = G.contacts[i]; if (!list) return -1;
    const T = items[i];
    let bestJ = -1, bestCls = 9, bestStruct = -1, bestFwd = -1, bestScore = Infinity;
    for (let k = 0; k < list.length; k++) {
      const j = list[k], S = items[j];
      let cls, score;
      if (S.bz < T.bz - EPS && S.tz >= T.bz - GAP) { cls = 0; score = -S.tz; }
      else if (S.bz <= T.bz + EPS && S.tz >= T.tz - EPS) { cls = 1; score = Math.abs(S.bz - T.bz); }
      else { cls = 2; score = S.bz; }
      const struct = (mode >= 1 && cls < 2 && (S.seq <= 4 || (S.cls === 'IfcSlab' && S.seq > 4))) ? 1 : 0;
      const gj2 = gk(j), gi2 = gk(i);
      const fwd = (mode >= 2 && gj2 >= 0 && gi2 >= 0 && gj2 <= gi2) ? 1 : 0;
      const better = cls < bestCls
        || (cls === bestCls && struct > bestStruct)
        || (cls === bestCls && struct === bestStruct && fwd > bestFwd)
        || (cls === bestCls && struct === bestStruct && fwd === bestFwd &&
            (score < bestScore || (score === bestScore && (bestJ < 0 || String(S.guid) < String(items[bestJ].guid)))));
      if (better) { bestCls = cls; bestStruct = struct; bestFwd = fwd; bestScore = score; bestJ = j; }
    }
    if (bestCls === 2 && G.grounded[i]) return -1;      // §GROUNDED_NEVER_HANGS, unchanged
    return bestJ;
  }
  const sim = [0, 1, 2].map(mode => {
    let back = 0, changed = 0, sameAsV0 = 0;
    for (let i = 0; i < n; i++) {
      const j = mode === 0 ? des[i] : elect(i, mode);
      if (j < 0) continue;
      if (j === des[i]) sameAsV0++; else changed++;
      const gi3 = gk(i), gj3 = gk(j);
      if (gi3 >= 0 && gj3 >= 0 && gj3 > gi3) back++;
    }
    return { mode, back, changed };
  });
  console.log('§SD_SIM ' + bld + ' backwardDesignations V0(shipped)=' + sim[0].back +
    ' V1(+load-bearing preference)=' + sim[1].back + ' (' +
    (100 * (sim[0].back - sim[1].back) / Math.max(1, sim[0].back)).toFixed(1) + '% fewer, ' +
    sim[1].changed + ' elections changed)' +
    ' V2(+phase-order tie-break)=' + sim[2].back + ' (' +
    (100 * (sim[0].back - sim[2].back) / Math.max(1, sim[0].back)).toFixed(1) + '% fewer, ' +
    sim[2].changed + ' elections changed)');
}

async function main() {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(ROOT, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(ROOT, 'viewer', 'rates.js'), 'utf8');
  const RATES = (new Function(src + '\nreturn {SEQUENCE_RULES:SEQUENCE_RULES, SEQUENCE_DEFAULT:SEQUENCE_DEFAULT,' +
    ' SEQUENCE_NAME_OVERRIDES:SEQUENCE_NAME_OVERRIDES, LABOR_RATES:LABOR_RATES, RATES:RATES};'))();
  for (const b of FLEET) await one(SQL, RATES, b);
  console.log('§SD_DONE — STUDY ONLY, nothing changed');
}
main().catch(e => { console.error('§SD_ERROR ' + (e && e.stack || e)); process.exit(2); });
