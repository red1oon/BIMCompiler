#!/usr/bin/env node
// poc4d.js — the JS port of Poc4D.java. THE JAVA IS THE ORACLE.
//   node poc4d.js            (hell fixture)
//   node poc4d.js coherent   (coherent fixture — must be 0/0)
//
// ⚠ DO NOT REMOVE — SCOPE. This is a PORT, not a second design. Every rule, constant, comment tag
// and output byte mirrors Poc4D.java. Parity is the gate: `bash parity.sh` diffs the two emitted
// JSON files and must report no difference. If they diverge, the JS is wrong — not the Java.
// Read the §POC_ log after every run.
//
// THE MODEL — one type, two rules.
//   Node { children[], work }
//   STRUCTURE  an element attaches at the deepest node that fully contains it
//   TIME       siblings run in order; a parent spans its children
// PRODUCT = THE TREE. tasks/task_elements/kernel_ops/Gantt/5D are PROJECTIONS, one visitor each,
// write-only, never authoritative. NO EDGES in the output: sibling order IS the order.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const RATES = process.env.RATES_DIR || path.join(os.homedir(), 'bim-ootb', 'viewer', 'rates');
const TEMPLATE = JSON.parse(fs.readFileSync(path.join(RATES, '4D_template.json'), 'utf8'));
// NOTE: sequence_rules.json is the MIRROR of rates.js's executed literal (rates.js says so, and
// they drifted once — resynced 2026-08-13). A viewer-side port must read the EXECUTED table.
const RULES = JSON.parse(fs.readFileSync(path.join(RATES, 'sequence_rules.json'), 'utf8'));
const SEQ_RULES = RULES.SEQUENCE_RULES, SEQ_DEFAULT = RULES.SEQUENCE_DEFAULT, LABOR = RULES.LABOR_RATES;
const PHASES = TEMPLATE.phases.map(p => p.name);
const SHIFT_HOURS = TEMPLATE.calendar.hours_per_shift;

// Shipped constants (schedule_gate.js), not re-typed by feel.
const EPS = 0.05, GAP = 0.5;

const x0 = e => e.cx - e.bx / 2, x1 = e => e.cx + e.bx / 2;
const y0 = e => e.cy - e.by / 2, y1 = e => e.cy + e.by / 2;
const z0 = e => e.cz - e.bz / 2, z1 = e => e.cz + e.bz / 2;

// §POC_BEARS_BOUND — the SHIPPED predicate bounds the support's BASE but never its TOP, so a 6.4m
// riser "bears" everything above its base (5 of 17 false edges on 20 elements). A real bearing
// contact has the support's TOP at the target's BASE.
function bears(s, t) {
  if (s === t) return false;
  const xy = x0(s) <= x1(t) && x1(s) >= x0(t) && y0(s) <= y1(t) && y1(s) >= y0(t);
  return xy && z0(s) < z0(t) - EPS && z1(s) >= z0(t) - GAP && z1(s) <= z0(t) + GAP;
}

const ruleFor = cls => SEQ_RULES[cls] || SEQ_DEFAULT;

// duration_rule: work content / (shift * crews). Productivity is units/shift from LABOR_RATES,
// longest matching class key — the "best prefix" rule schedule_author._installSecs uses.
function workDaysOf(e) {
  const t = LABOR[e.trade];
  if (!t) return 1 / 8;
  let best = 0, bestLen = -1;
  for (const k of Object.keys(t.productivity || {}))
    if (e.cls.indexOf(k) >= 0 && k.length > bestLen) { bestLen = k.length; best = t.productivity[k]; }
  if (best <= 0) best = 10;                       // sequence_rules default_productivity
  return 1 / best;
}
const crewsOf = tr => (LABOR[tr] && LABOR[tr].max_crews) || 1;

// ── the one type ────────────────────────────────────────────────────────────────────────────
class Leaf {
  constructor(e) { this.e = e; this.id = e.guid; this.kind = 'element'; this.s = 0; this.f = 0; }
  layout(t0) { this.s = t0; this.f = t0 + this.e.workDays; return this.f; }
  start() { return this.s; } finish() { return this.f; }
  children() { return []; }
}
class Group {
  constructor(id, kind, lanes) { this.id = id; this.kind = kind; this.lanes = Math.max(1, lanes || 1); this.kids = []; }
  add(n) { this.kids.push(n); return this; }
  children() { return this.kids; }
  layout(t0) {
    const lane = new Array(this.lanes).fill(t0);
    for (const k of this.kids) {
      let b = 0;
      for (let i = 1; i < this.lanes; i++) if (lane[i] < lane[b]) b = i;
      lane[b] = k.layout(lane[b]);
    }
    return Math.max(t0, ...lane);
  }
  start() { return this.kids.length ? Math.min(...this.kids.map(k => k.start())) : 0; }
  finish() { return this.kids.length ? Math.max(...this.kids.map(k => k.finish())) : 0; }
}

// §POC_LEVEL_IS_A_DATUM — a level is its FLOOR up to the next level's floor. Taking the band as the
// envelope of its members let one 6.4m riser labelled L1 stretch L1 over L2, so every L2 element
// fell out to building scope. Bands disjoint by construction.
function levelBands(els) {
  const floor = new Map();
  for (const e of els) if (e.storey != null)
    floor.set(e.storey, Math.min(floor.has(e.storey) ? floor.get(e.storey) : Infinity, z0(e)));
  const ordered = [...floor.keys()].sort((a, b) => floor.get(a) - floor.get(b));
  const b = new Map();
  ordered.forEach((l, i) => b.set(l, [floor.get(l),
    i + 1 < ordered.length ? floor.get(ordered[i + 1]) : Number.MAX_VALUE]));
  return b;
}
function containingLevel(e, bands, levels) {
  if (e.storey == null) return null;                     // no address -> attaches higher
  let byBase = null, byTop = null;
  for (const l of levels) {
    const bd = bands.get(l);
    if (z0(e) >= bd[0] - EPS && z0(e) < bd[1] - EPS) byBase = l;
    if (z1(e) > bd[0] + EPS && z1(e) <= bd[1] + EPS) byTop = l;
  }
  if (byBase == null) return null;
  if (byTop != null && byTop !== byBase) return null;    // spans bands -> attaches higher
  return byBase;
}

function topoLayers(cell) {
  const out = []; let left = cell.slice();
  while (left.length) {
    const free = left.filter(t => !left.some(s => bears(s, t)));
    if (!free.length) { out.push(left.slice()); break; }  // cycle: reported, not looped
    out.push(free);
    left = left.filter(e => free.indexOf(e) < 0);
  }
  return out;
}

// §POC_CREW_LANES — lanes are a CAPACITY, not a headcount. layer.size() is infinite crews and
// reproduces the stacking hell as a "parallel layer". max_crews comes from LABOR_RATES, per trade.
function cellNode(id, cell, report) {
  report.set(id, cell);
  const g = new Group(id, 'phase', 1);
  topoLayers(cell).forEach((layer, i) => {
    const cap = Math.max(...layer.map(e => crewsOf(e.trade)));
    const lg = new Group(id + ' · layer ' + (i + 1), 'layer', cap);
    layer.forEach(e => lg.add(new Leaf(e)));
    g.add(lg);
  });
  return g;
}

// ── PROJECTIONS. One walk, one visitor per consumer. WRITE-ONLY: no visitor reads another's
// output and none recomputes order. An edit moves a node and every projection is RECOMPUTED,
// never patched — which is why _tmRescaleToTaskWindow cannot come back.
function fold(n, parent, depth, v) {
  if (n instanceof Leaf) { if (v.leaf) v.leaf(n, parent); return; }
  if (v.group) v.group(n, depth);
  for (const k of n.kids) fold(k, n, depth + 1, v);
}

// OpsVisitor — leaves become kernel_ops ELEMENT_PLACE rows. The movie is exactly the leaves in
// start order; there is no second timeline to reconcile against.
function opsVisitor() {
  const rows = [];
  return { rows, leaf(l, parent) {
    rows.push('{"guid": "' + l.e.guid + '", "start_ts": ' + l.s.toFixed(4) +
      ', "end_ts": ' + l.f.toFixed(4) + ', "task": "' + esc(parent.id) +
      '", "cls": "' + l.e.cls + '", "trade": "' + l.e.trade + '"}');
  } };
}

// TasksVisitor — composites become tasks; leaf->parent becomes task_elements. task_sequences is
// NOT emitted: sibling order is the order, so an edge list would restate what the tree says.
function tasksVisitor() {
  const tasks = [], links = [];
  return { tasks, links,
    group(g, depth) {
      tasks.push('{"task_id": "' + esc(g.id) + '", "kind": "' + g.kind + '", "depth": ' + depth +
        ', "start": ' + g.start().toFixed(4) + ', "finish": ' + g.finish().toFixed(4) +
        ', "lanes": ' + g.lanes + '}');
    },
    leaf(l, parent) { links.push('{"task_id": "' + esc(parent.id) + '", "guid": "' + l.e.guid + '"}'); } };
}

function collect(n, out) {
  if (n instanceof Leaf) { out.push(n); return; }
  for (const k of n.children()) collect(k, out);
}

// ── audit: geometry's ONLY other job. §5.1 — name defects, never schedule around them ─────────
function audit(building, els, report) {
  const leaves = []; collect(building, leaves);
  const byGuid = new Map(leaves.map(l => [l.e.guid, l]));
  const cellOf = new Map();
  for (const [k, v] of report) for (const e of v) cellOf.set(e.guid, k);

  let viol = 0; const defects = [];
  for (const t of els) for (const s of els) {
    if (!bears(s, t)) continue;
    const ls = byGuid.get(s.guid), lt = byGuid.get(t.guid);
    if (!ls || !lt || lt.s >= ls.f - 1e-9) continue;
    const cs = cellOf.get(s.guid), ct = cellOf.get(t.guid);
    if (cs != null && cs === ct) { viol++; console.log('   §POC_VIOLATION ' + t.name + ' before ' + s.name + ' in ' + cs); }
    else defects.push(s.name + ' (' + cs + ') bears ' + t.name + ' (' + ct + ')');
  }
  const hist = new Map();
  for (const l of leaves) hist.set(l.s, (hist.get(l.s) || 0) + 1);
  const maxPile = Math.max(0, ...hist.values());

  console.log('§POC_STACKING maxSimultaneousStarts=' + maxPile + ' (bounded by LABOR_RATES max_crews, never by cell size)');
  console.log('§POC_VIOLATIONS total=' + viol + ' (same-cell — the model must prevent these; MUST BE 0)');
  console.log('§POC_DATA_DEFECTS total=' + defects.length + ' (bearing element classified AFTER what it carries — §5.1: named, never scheduled around)');
  defects.forEach(d => console.log('   §POC_DEFECT ' + d));
  console.log('§POC_SPAN days=' + building.finish().toFixed(2) + ' leaves=' + leaves.length + '/' + els.length);
  console.log(viol !== 0 ? '§POC_VERDICT FAIL' : '§POC_VERDICT PASS (violations=0; defects are input quality, reported)');
  return defects;
}

// ── the product: the TREE, serialised. Byte-identical to Poc4D.java's emitter. ────────────────
const esc = v => (v == null ? '' : String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"'));
function nodeJson(n, ind, out) {
  const p = ' '.repeat(ind);
  out.push(p + '{"id": "' + esc(n.id) + '", "kind": "' + n.kind + '", "start": ' +
    n.start().toFixed(4) + ', "finish": ' + n.finish().toFixed(4));
  if (n instanceof Leaf) {
    out.push(', "guid": "' + n.e.guid + '", "cls": "' + n.e.cls + '", "trade": "' + n.e.trade +
      '", "name": "' + esc(n.e.name) + '"}');
    return;
  }
  out.push(', "lanes": ' + n.lanes + ', "children": [\n');
  n.kids.forEach((k, i) => { nodeJson(k, ind + 2, out); out.push(i + 1 < n.kids.length ? ',\n' : '\n'); });
  out.push(p + ']}');
}

function emitJson(building, defects, coherent) {
  const o = [];
  o.push('{\n  "provenance": {\n');
  o.push('    "model": "composite",\n');
  o.push('    "template": "4D_template.json v' + TEMPLATE.meta.version + '",\n');
  o.push('    "rules": "sequence_rules.json (MIRROR of rates.js — JS port must read the executed table)",\n');
  o.push('    "fixture": "' + (coherent ? 'coherent' : 'hell') + '",\n');
  o.push('    "unit": "crew-days",\n');
  o.push('    "edges": "none — sibling order IS the order; task_sequences is derived"\n  },\n');
  o.push('  "defects": [');
  defects.forEach((d, i) => o.push((i > 0 ? ',\n    ' : '\n    ') + '"' + esc(d) + '"'));
  o.push((defects.length ? '\n  ' : '') + '],\n');
  const ops = opsVisitor(); fold(building, null, 0, ops);
  const tv = tasksVisitor(); fold(building, null, 0, tv);
  o.push('  "kernel_ops": [\n    ' + ops.rows.join(',\n    ') + '\n  ],\n');
  o.push('  "tasks": [\n    ' + tv.tasks.join(',\n    ') + '\n  ],\n');
  o.push('  "task_elements": [\n    ' + tv.links.join(',\n    ') + '\n  ],\n');
  o.push('  "task_sequences": "derived — sibling order IS the order",\n');
  console.log('§POC_PROJECTIONS kernel_ops=' + ops.rows.length + ' tasks=' + tv.tasks.length +
    ' task_elements=' + tv.links.length + ' task_sequences=0 (derived)');
  o.push('  "tree":\n');
  nodeJson(building, 2, o);
  o.push('\n}\n');
  const text = o.join('');
  const out = path.join(__dirname, coherent ? '4d_coherent.js.json' : '4d_hell.js.json');
  fs.writeFileSync(out, text);
  console.log('§POC_JSON ' + out + ' bytes=' + text.length);
}

// ── main ────────────────────────────────────────────────────────────────────────────────────
const coherent = process.argv[2] === 'coherent';
const els = require('./sandbox.js')[coherent ? 'coherent' : 'hell']();
for (const e of els) {
  const r = ruleFor(e.cls);
  e.phase = r.phase;
  e.trade = r.resource == null ? 'LABORER' : r.resource;
  e.workDays = workDaysOf(e);
}
console.log('§POC_FIXTURE ' + (coherent ? 'COHERENT (expect 0 violations AND 0 defects)'
  : 'HELL (expect 0 violations, N named defects)') + ' n=' + els.length);
console.log('§POC_SHIPPED template=' + TEMPLATE.meta.version + ' phases=[' + PHASES.join(', ') +
  '] shiftHours=' + SHIFT_HOURS.toFixed(1));

const bands = levelBands(els);
const levels = [...bands.keys()];
const building = new Group('BUILDING', 'building', 1);
const report = new Map();

// §POC_TREE_SHAPE — LEVEL-major with phases inside, which is what 4D_template.json declares
// (within_level chains phases inside a level; across_levels ladders each phase one level down).
// PHASE-over-LEVEL produced 17 bearing violations: all-Superstructure-before-all-Architecture puts
// the L2 slab before the L1 walls it rests on. One rule, two depths.
const pick = (ph, lv) => els.filter(e => e.phase === ph &&
  (lv == null ? containingLevel(e, bands, levels) == null : containingLevel(e, bands, levels) === lv));

for (const lv of levels) {
  const level = new Group(lv, 'level', 1);
  for (const ph of PHASES) { const c = pick(ph, lv); if (c.length) level.add(cellNode(lv + ' / ' + ph, c, report)); }
  if (level.kids.length) building.add(level);
}
const hi = new Group('<building-scope>', 'level', 1);
for (const ph of PHASES) { const c = pick(ph, null); if (c.length) hi.add(cellNode('<building-scope> / ' + ph, c, report)); }
if (hi.kids.length) building.add(hi);

building.layout(0);
emitJson(building, audit(building, els, report), coherent);
