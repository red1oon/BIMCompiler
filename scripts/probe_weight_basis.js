#!/usr/bin/env node
// probe_weight_basis.js — STUDY/EVIDENCE ONLY, no fix (2026-08-12, bim-compiler
// prompts/4D_SCHEDULE_PERFECTION.md §CREW_DAY_HOURS + §HANDLING_WEIGHT_BASIS).
//
// ISSUE this probe exposes: the user's standing rule is that an element's install time must be
// weighted by its HANDLING SIZE, its WEIGHT, and the resource RATE. Two of those weights already
// ship (§LABOR_QUANTITY_WEIGHT = area for over-fragmented M2 classes, §HEAVY_MEMBER_SPEED_LIMIT =
// real length / class-average length for M classes). This probe measures WHAT IS LEFT UNWEIGHTED:
// how much of each building's labour-seconds is charged FLAT (one rate per element regardless of
// real size), and how wide the real size spread inside those flat-charged classes actually is.
// A flat class whose members are all the same size needs no weight; a flat class with a 10x
// spread is the same defect §HEAVY_MEMBER_SPEED_LIMIT was written for, in a different unit.
//
// Reported per building, every number derived from the shipped DB + shipped rates.js:
//   §WB_UNITS   labour-seconds and element counts split by RATES unit (M / M2 / KG / EA / none)
//   §WB_FLAT    per flat-charged class: n, secs share, real longest-dim min/avg/max, spread ratio
//   §WB_TOTAL   share of the building's labour-seconds that carries NO size signal at all
//
// Command (from bim-compiler/):
//   node scripts/probe_weight_basis.js 2>&1 | tee /tmp/.../probe_weight_basis.log
// Read the log, not the exit code.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const HOME = require('os').homedir();
const VIEWER_DIR = process.env.VIEWER_DIR || path.join(HOME, 'bim-ootb', 'viewer');
const BLD_DIR = process.env.BLD_DIR || path.join(HOME, 'bim-ootb', 'buildings');

// ── shipped rates.js, evaluated (not re-typed) ────────────────────────────────
const ctx = { console: console, window: {}, document: undefined, fetch: function () {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(VIEWER_DIR, 'rates.js'), 'utf8'), ctx);
const RATES = ctx.RATES, LABOR_RATES = ctx.LABOR_RATES;
const SR = ctx.SEQUENCE_RULES || {}, SD = ctx.SEQUENCE_DEFAULT || { phase: 'Architecture', sequence: 6, resource: null };

// matchRule / _installSecs — same shape as viewer/schedule_author.js (longest-substring containment)
function matchRule(cls) {
  if (!cls) return SD;
  let bestKey = null, bestLen = 0;
  for (const key in SR) if (cls.indexOf(key) >= 0 && key.length > bestLen) { bestKey = key; bestLen = key.length; }
  return bestKey ? SR[bestKey] : SD;
}
const CREW_DAY_SECS = 28800;   // the shipped constant under study — 8h, NOT the 24h norm
function prodOf(cls, rule) {
  const resource = rule && rule.resource;
  if (!resource || !LABOR_RATES[resource]) return null;
  const labor = LABOR_RATES[resource];
  let bestPk = null, bestLen = 0;
  for (const pk in labor.productivity) if (cls.indexOf(pk) >= 0 && pk.length > bestLen) { bestPk = pk; bestLen = pk.length; }
  const p = bestPk ? labor.productivity[bestPk] : 0;
  return p > 0 ? p : null;
}

const AREA_EXPR = "MAX(t.bbox_x,t.bbox_y,t.bbox_z) * CASE " +
  "WHEN t.bbox_x>=t.bbox_y AND t.bbox_x>=t.bbox_z THEN MAX(t.bbox_y,t.bbox_z) " +
  "WHEN t.bbox_y>=t.bbox_x AND t.bbox_y>=t.bbox_z THEN MAX(t.bbox_x,t.bbox_z) " +
  "ELSE MAX(t.bbox_x,t.bbox_y) END";
const LEN_EXPR = 'MAX(t.bbox_x,t.bbox_y,t.bbox_z)';
const VOL_EXPR = 't.bbox_x*t.bbox_y*t.bbox_z';

function q(db, sql) {
  const out = cp.execFileSync('sqlite3', ['-separator', '', db, sql], { maxBuffer: 1 << 28 }).toString();
  return out.split('\n').filter(Boolean).map(l => l.split(''));
}

const FIXTURES = ['Duplex', 'JKR', 'HHS_Office_Federated', 'Terminal', 'Clinic', 'Hospital', 'LTU_AHouse'];
const FRAGMENT_M2_FLOOR = 1.0;   // shipped constant, schedule_author.js

for (const name of FIXTURES) {
  const db = path.join(BLD_DIR, name + '_extracted.db');
  if (!fs.existsSync(db)) { console.log('§WB_SKIP ' + name + ' — no ' + db); continue; }
  let rows;
  try {
    rows = q(db, "SELECT m.ifc_class, COUNT(*), SUM(" + AREA_EXPR + "), SUM(" + LEN_EXPR + "), " +
      "MIN(" + LEN_EXPR + "), MAX(" + LEN_EXPR + "), SUM(" + VOL_EXPR + "), MIN(" + VOL_EXPR + "), MAX(" + VOL_EXPR + ") " +
      "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid " +
      "WHERE t.bbox_x IS NOT NULL AND t.bbox_x>0 AND m.ifc_class!='IfcOpeningElement' GROUP BY 1");
  } catch (e) { console.log('§WB_SKIP ' + name + ' — ' + e.message.split('\n')[0]); continue; }

  const byUnit = {};          // unit -> {n, secs}
  const flat = [];            // classes charged with NO size signal
  let totalSecs = 0, totalN = 0, flatSecs = 0, flatN = 0;

  for (const r of rows) {
    const cls = r[0], n = +r[1];
    const areaSum = +r[2] || 0, lenSum = +r[3] || 0, lenMin = +r[4] || 0, lenMax = +r[5] || 0;
    const volSum = +r[6] || 0, volMin = +r[7] || 0, volMax = +r[8] || 0;
    const rule = matchRule(cls);
    const prod = prodOf(cls, rule);
    const secsPerUnit = prod ? CREW_DAY_SECS / prod : 120;   // 120 = shipped no-data default
    const unit = (RATES[cls] && RATES[cls].unit) || '_NONE';
    const avgArea = n ? areaSum / n : 0;
    const avgLen = n ? lenSum / n : 0;

    // shipped weighting decision, replicated
    let mode, secs;
    if (unit === 'M2' && avgArea > 0 && avgArea < FRAGMENT_M2_FLOOR) { mode = 'AREA'; secs = secsPerUnit * areaSum; }
    else if (unit === 'M' && avgLen > 0) { mode = 'LENGTH'; secs = secsPerUnit * n; }  // ratio-sum == n by construction
    else { mode = 'FLAT'; secs = secsPerUnit * n; }

    totalSecs += secs; totalN += n;
    if (!byUnit[unit]) byUnit[unit] = { n: 0, secs: 0, flatSecs: 0 };
    byUnit[unit].n += n; byUnit[unit].secs += secs;
    if (mode === 'FLAT') {
      byUnit[unit].flatSecs += secs; flatSecs += secs; flatN += n;
      flat.push({ cls, unit, n, secs, lenMin, lenMax, avgLen, volMin, volMax, avgVol: n ? volSum / n : 0, prod });
    }
  }

  console.log('\n══ ' + name + ' — ' + totalN + ' elements with real bbox, ' +
    (totalSecs / 3600).toFixed(0) + ' crew-hours of shipped labour');
  for (const u of Object.keys(byUnit).sort((a, b) => byUnit[b].secs - byUnit[a].secs)) {
    const b = byUnit[u];
    console.log('§WB_UNITS ' + name + ' unit=' + u + ' n=' + b.n + ' secs=' + Math.round(b.secs) +
      ' (' + (100 * b.secs / totalSecs).toFixed(1) + '% of labour) flatCharged=' +
      (100 * b.flatSecs / (b.secs || 1)).toFixed(0) + '%');
  }
  flat.sort((a, b) => b.secs - a.secs);
  for (const f of flat.slice(0, 8)) {
    const spread = f.lenMin > 0 ? f.lenMax / f.lenMin : 0;
    const vspread = f.volMin > 0 ? f.volMax / f.volMin : 0;
    console.log('§WB_FLAT  ' + name + ' cls=' + f.cls + ' unit=' + f.unit + ' n=' + f.n +
      ' secsShare=' + (100 * f.secs / totalSecs).toFixed(1) + '%' +
      ' len=' + f.lenMin.toFixed(2) + '/' + f.avgLen.toFixed(2) + '/' + f.lenMax.toFixed(2) + 'm' +
      ' lenSpread=' + spread.toFixed(1) + 'x' +
      ' vol=' + f.volMin.toFixed(3) + '/' + f.avgVol.toFixed(3) + '/' + f.volMax.toFixed(3) + 'm3' +
      ' volSpread=' + (vspread > 0 ? vspread.toFixed(0) : 'n/a') + 'x');
  }
  console.log('§WB_TOTAL ' + name + ' flatCharged=' + flatN + '/' + totalN + ' elements = ' +
    (100 * flatSecs / totalSecs).toFixed(1) + '% of all labour-seconds carry NO size signal');
}
