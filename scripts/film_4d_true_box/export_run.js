#!/usr/bin/env node
// ⚠ DO NOT REMOVE — scope: bim-compiler prompts/4D_MODEL_INTEGRITY.md §Q.55 (proof film). Read the §FILM_EXPORT line after every run.
// WHAT: one persisted 4D run (cache_4d_run.js run.json — the PLAYED layer, the instants kernel_ops carries) -> the facts a frame needs:
//       per element its start / end, phase, class, its TRUE box (true_boxes.py), and the verdict of the SHIPPED judge
//       (SupportSweep.midairAudit) run on those true boxes: `midair` = it starts before its elected support is finished,
//       `orphan` = no support path to the ground. Nothing is re-solved, nothing is authored; the judge is the repo's own.
// usage: export_run.js <bim-ootb checkout whose judge to use> <run dir> <true_boxes.json> <out.json>
'use strict';
const fs = require('fs'), path = require('path');
const [ROOT, RUN, TB, OUT] = process.argv.slice(2);
const SG = require(path.join(ROOT, 'viewer/schedule_gate.js')); global.ScheduleGate = SG;
global.CpmSchedule = require(path.join(ROOT, 'viewer/cpm_schedule.js'));
const SS = require(path.join(ROOT, 'viewer/support_sweep.js'));
const CACHE = require(path.join(ROOT, 'scripts/cache_4d_run.js'));
const run = JSON.parse(fs.readFileSync(path.join(RUN, 'run.json'), 'utf8')), L = CACHE.layerOf(run, 'played'), tb = JSON.parse(fs.readFileSync(TB, 'utf8'));
let noBox = 0, moved = 0;
const items = run.els.filter(e => L.map[e.guid]).map(e => {
  const t = tb[e.guid], m = L.map[e.guid]; if (!t) { noBox++; return Object.assign({}, e, { s: m.s, e: m.e }); }
  if (Math.max(Math.abs(t[0] - e.x0), Math.abs(t[1] - e.x1), Math.abs(t[2] - e.y0), Math.abs(t[3] - e.y1), Math.abs(t[4] - e.bz), Math.abs(t[5] - e.tz)) > SG.EPS) moved++;
  return Object.assign({}, e, { x0: t[0], x1: t[1], y0: t[2], y1: t[3], bz: t[4], tz: t[5], s: m.s, e: m.e }); });
const q = console.log; console.log = () => {}; let ma; try { ma = SS.midairAudit(items.map(e => Object.assign({}, e))); } finally { console.log = q; }
const mid = new Set(ma.guids), orp = new Set(ma.orphanGuids || []);
let t0 = Infinity, t1 = -Infinity; items.forEach(e => { if (e.s < t0) t0 = e.s; if (e.e > t1) t1 = e.e; });
const rows = items.map(e => [e.guid, +((e.s - t0) / 86400000).toFixed(4), +((e.e - t0) / 86400000).toFixed(4), e.phase, e.cls, e.x0, e.x1, e.y0, e.y1, e.bz, e.tz, mid.has(e.guid) ? 1 : 0, orp.has(e.guid) ? 1 : 0]);
fs.writeFileSync(OUT, JSON.stringify({ run: RUN, days: (t1 - t0) / 86400000, n: rows.length, midair: ma.midair, orphans: ma.orphans, boxDiffersFromScheduleBox: moved, noTrueBox: noBox, rows }));
console.log('§FILM_EXPORT run=' + path.basename(RUN) + ' elements=' + rows.length + ' days=' + ((t1 - t0) / 86400000).toFixed(0) + ' judgedOnTrueBoxes midair=' + ma.midair + ' orphans=' + ma.orphans +
  ' | boxes the schedule used that differ from the true box (>' + SG.EPS + ' m)=' + moved + ' noTrueBox=' + noBox + ' -> ' + OUT);
