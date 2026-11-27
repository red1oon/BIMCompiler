#!/usr/bin/env node
// # ⚠ DO NOT REMOVE — scope: READ-ONLY probe for prompts/4D_MODEL_INTEGRITY.md §Q (hanging beams).
// Proves or disproves: "a beam judged midair on the PLAYED layer is unsupported" — by naming, per
// beam, WHICH relation the shipped election chose. Read the log after every run; it changes nothing.
// Owners are CALLED, never re-derived (§I): SupportSweep.contactGraph / designatedSupport /
// midairAudit and ScheduleGate.supportPool, loaded from bim-ootb origin/main via `git show` (never a
// possibly-stale checkout), over the PERSISTED run.json of cache_4d_run.js (PRIMAL LAW 5).
// Self-check per building: the recount must equal playStats.midairPlayed, else the line says MISMATCH
// and nothing below it may be quoted. A building with no IfcBeam prints VACUOUS, never 0.
// usage: node scripts/probe_4d_beam_midair.js <cacheDir> [<cacheDir> ...]   (BIM_OOTB=~/bim-ootb, REF=origin/main)
const fs = require('fs'), vm = require('vm'), path = require('path'), cp = require('child_process');
const REPO = process.env.BIM_OOTB || path.join(process.env.HOME, 'bim-ootb'), REF = process.env.REF || 'origin/main';
const src = f => cp.execFileSync('git', ['-C', REPO, 'show', REF + ':viewer/' + f], { maxBuffer: 1 << 26 }).toString();
const sha = cp.execFileSync('git', ['-C', REPO, 'rev-parse', '--short', REF]).toString().trim();
const ctx = { console: { log() {} } }; ctx.global = ctx; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(src('schedule_gate.js'), ctx); vm.runInContext(src('cpm_schedule.js'), ctx); vm.runInContext(src('support_sweep.js'), ctx);   // cpm_schedule = the support-relation owner (§I.1a); support_sweep delegates to it
const SG = ctx.ScheduleGate, SS = ctx.SupportSweep, EPS = SG.EPS, GAP = SG.GAP;
// relation of an ALREADY-ELECTED support — the three clauses of _designatedSupport, read back, not a new test
const rel = (A, T) => (A.bz < T.bz - EPS && A.tz >= T.bz - GAP) ? 0 : (A.bz <= T.bz + EPS && A.tz >= T.tz - EPS) ? 1 : 2;
const RN = ['bearing-below', 'embedded', 'carrier-above'];
const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
const show = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(e => e[0] + ' ' + e[1]).join(' · ') || 'none';
console.log('§BEAM_MIDAIR_SRC judge=bim-ootb ' + REF + '@' + sha + ' EPS=' + EPS + ' GAP=' + GAP + ' CELL=' + SG.CELL);
for (const dir of process.argv.slice(2)) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, 'run.json')));
  const taskOf = {}; r.tasks.forEach(t => t.guids.forEach(g => { taskOf[g] = t.id; }));
  const items = r.els.filter(e => r.play[e.guid]).map(e => Object.assign({}, e, { s: r.play[e.guid].s, e: r.play[e.guid].e, task: taskOf[e.guid] }));
  const G = SS.contactGraph(items), des = SS.designatedSupport(items, G), ma = SS.midairAudit(items), mid = new Set(ma.guids);
  const tag = '§BEAM_MIDAIR ' + r.bld + ' db=' + r.dbFile + ' codeKey=' + r.codeKey + ' built=' + String(r.builtAt).slice(0, 10) + ' layer=played';
  console.log(tag + ' judged=' + items.length + ' midair=' + ma.midair + ' persisted=' + r.playStats.midairPlayed +
    ' selfcheck=' + (ma.midair === r.playStats.midairPlayed ? 'MATCH' : 'MISMATCH — do not quote this building'));
  const all = {}, bad = {}, task = { same: 0, cross: 0 }, lead = [], near = {}, alt = {}; let beams = 0, noSup = 0, nMid = 0;
  const col = { n: 0, mid: 0 }, emb = { n: 0, sameDepth: 0, mutual: 0, mid: 0 }, ca = { n: 0, mid: 0, nearLater: 0, nearStarted: 0 }, bb = { n: 0, mid: 0 };
  items.forEach((T, i) => {
    if (T.cls !== 'IfcBeam') return; beams++;
    if (des[i] < 0) { noSup++; return; }
    const j = des[i], A = items[j], k = rel(A, T), m = mid.has(T.guid);
    inc(all, RN[k] + '<-' + A.cls);
    if (m) { nMid++; inc(bad, RN[k] + '<-' + A.cls); inc(task, A.task === T.task ? 'same' : 'cross'); lead.push((A.s - T.s) / 86400000); }
    if (k === 0 && A.cls === 'IfcColumn') { col.n++; if (m) col.mid++; }
    if (k === 0 && A.cls === 'IfcBeam') { bb.n++; if (m) bb.mid++; }
    if (k === 1 && A.cls === 'IfcBeam') { emb.n++; if (m) emb.mid++;
      if (Math.abs(A.bz - T.bz) <= EPS && Math.abs(A.tz - T.tz) <= EPS) emb.sameDepth++;
      if (des[j] === i) emb.mutual++; }
    if (k === 2) { ca.n++; if (m) ca.mid++; let best = null, n1 = 0;
      (G.contacts[i] || []).forEach(c => { const X = items[c], kk = rel(X, T); if (kk === 1) n1++; if (kk === 0 && (!best || X.tz > best.tz)) best = X; });
      if (best) { inc(alt, 'has a bearing-below contact outside supportPool'); inc(near, best.cls + '(seq' + best.seq + ')'); if (best.s > T.s + 1) ca.nearLater++; else ca.nearStarted++; }
      else inc(alt, n1 ? 'has only an embedded contact outside supportPool' : 'no bearing/embedded contact at all'); }
  });
  if (!beams) { console.log('   IfcBeam total=0 VACUOUS — nothing judged'); continue; }
  lead.sort((a, b) => a - b); const q = p => lead.length ? lead[Math.floor(p * (lead.length - 1))].toFixed(1) : 'n/a';
  console.log('   IfcBeam total=' + beams + ' noElectedSupport=' + noSup + ' midair=' + nMid + ' sameTask=' + task.same + ' crossTask=' + task.cross +
    ' daysBeforeElectedSupport p50=' + q(.5) + ' p90=' + q(.9) + ' max=' + q(1));
  console.log('   elected support, ALL beams   : ' + show(all));
  console.log('   elected support, MIDAIR beams: ' + show(bad));
  console.log('   column-borne (bearing<-IfcColumn) n=' + col.n + ' midair=' + col.mid);
  console.log('   beam-on-beam bearing n=' + bb.n + ' midair=' + bb.mid);
  console.log('   embedded beam<-beam n=' + emb.n + ' sameDepthBox(|dbz|,|dtz|<=EPS)=' + emb.sameDepth + ' mutualElection=' + emb.mutual + ' midair=' + emb.mid);
  console.log('   carrier-above-elected n=' + ca.n + ' midair=' + ca.mid + ' : ' + show(alt));
  console.log('      their highest bearing-below contact: ' + show(near) + ' | starts LATER than the beam=' + ca.nearLater + ' alreadyStarted=' + ca.nearStarted);
}
