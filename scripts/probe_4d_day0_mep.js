#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: WHAT the early-MEP elements of witness_day0_integrity C4 are (bim-compiler
// prompts/4D_MODEL_INTEGRITY.md §Q.16). Reads ONLY the persisted run, PLAYED layer, and calls the owners (§I):
// SupportSweep.contactGraph / designatedSupport / midairAudit. Read the log after every run.
// ISSUE: is MEP that starts in the first 3 days OUT OF ORDER (starts before its elected support is done), or is it
// buried / under-slab services correctly following the foundations they rest on?
// usage: node scripts/probe_4d_day0_mep.js [Building ...]     (BIM_OOTB=<checkout>, default ~/bim-ootb)
'use strict';
const path = require('path'), os = require('os');
const ROOT = process.env.BIM_OOTB || path.join(os.homedir(), 'bim-ootb');
const SG = require(path.join(ROOT, 'viewer', 'schedule_gate.js')); global.ScheduleGate = SG;
require(path.join(ROOT, 'viewer', 'cpm_schedule.js'));
const SS = require(path.join(ROOT, 'viewer', 'support_sweep.js'));
const CACHE = require(path.join(ROOT, 'scripts', 'cache_4d_run.js'));
const quiet = fn => { const l = console.log; console.log = () => {}; try { return fn(); } finally { console.log = l; } };
const D = 86400000, WIN = 3;
const blds = process.argv.slice(2).length ? process.argv.slice(2) : ['Duplex', 'HHS_Office_Federated', 'Hospital', 'Terminal', 'Clinic', 'JKR', 'LTU_AHouse'];
for (const bld of blds) {
  const r = CACHE.read(bld);
  if (!r) { console.log('§D0MEP ' + bld + ' CACHE_MISS  INCONCLUSIVE'); continue; }
  const L = CACHE.layerOf(r, 'played');
  if (L.missing) { console.log('§D0MEP ' + bld + ' played layer ABSENT  INCONCLUSIVE'); continue; }
  const items = r.els.filter(e => L.map[e.guid]).map(e => Object.assign({}, e, { s: L.map[e.guid].s, e: L.map[e.guid].e, bz: e.base_z != null ? e.base_z : e.bz, tz: e.top_z != null ? e.top_z : e.tz }));
  let t0 = Infinity, t1 = -Infinity; items.forEach(i => { if (i.s < t0) t0 = i.s; if (i.e > t1) t1 = i.e; });
  const G = quiet(() => SS.contactGraph(items)), des = quiet(() => SS.designatedSupport(items, G)), aud = quiet(() => SS.midairAudit(items));
  const mid = new Set(aud.guids);
  const taskOf = {}; (r.tasks || []).forEach(t => t.guids.forEach(g => { taskOf[g] = t.id; }));
  // ground reference, EXTRACTED: the median TOP of the building's own ground seeds (sequence 1 / Substructure)
  const seedTops = items.filter(i => i.seq === 1 || i.phase === 'Substructure').map(i => i.tz).sort((a, b) => a - b);
  const groundTop = seedTops.length ? seedTops[Math.floor(seedTops.length / 2)] : null;
  let n = 0, outOfOrder = 0, noSupport = 0, onSeed = 0, onOther = 0, topBelowGround = 0, baseBelowGround = 0;
  const supCls = {}, tasks = {}, cls = {};
  items.forEach((it, i) => {
    if (!/^MEP/.test(it.phase || '') || it.s >= t0 + WIN * D) return;
    n++; cls[it.cls] = (cls[it.cls] || 0) + 1; tasks[taskOf[it.guid] || '?'] = (tasks[taskOf[it.guid] || '?'] || 0) + 1;
    if (mid.has(it.guid)) outOfOrder++;
    const s = des[i];
    if (s < 0) noSupport++; else { const S = items[s]; const k = S.cls + '/' + (S.phase || '?'); supCls[k] = (supCls[k] || 0) + 1;
      if (S.seq === 1 || S.phase === 'Substructure') onSeed++; else onOther++; }
    if (groundTop != null) { if (it.tz <= groundTop) topBelowGround++; if (it.bz < groundTop) baseBelowGround++; }
  });
  const allMep = items.filter(i => /^MEP/.test(i.phase || '')).length;
  console.log('§D0MEP ' + bld + ' layer=played programmeDays=' + ((t1 - t0) / D).toFixed(1) + ' MEPtotal=' + allMep + ' earlyMEP(first ' + WIN + 'd)=' + n +
    (n ? ' | OUT_OF_ORDER(shipped judge)=' + outOfOrder + ' electedSupport: groundSeed=' + onSeed + ' other=' + onOther + ' none=' + noSupport +
      ' | groundTop(median top of ground seeds)=' + (groundTop == null ? 'n/a(no ground seeds)' : groundTop.toFixed(2) + 'm wholeElementBelowIt=' + topBelowGround + ' baseBelowIt=' + baseBelowGround) +
      ' | cls=' + JSON.stringify(cls) + ' tasks=' + JSON.stringify(tasks) + ' restsOn=' + JSON.stringify(supCls) : ' VACUOUS(no early MEP)'));
}
