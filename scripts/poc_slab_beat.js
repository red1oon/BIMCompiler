#!/usr/bin/env node
/**
 * # ⚠ DO NOT REMOVE — PoC for §25 §SLAB_BEAT (prompts/MEP_CLASH_REVEAL_MOVIE.md).
 * Read the log after every run. Scope: SELECTION ONLY — decide WHICH floor plate is marked and WHEN.
 * It draws nothing and it does not resolve the camera; the frustum/hold test is `plan.poseAt` in the
 * viewer (§16's method, probe_flythru_place.js). This is the cheap half, and it runs with no GPU,
 * no browser and no scene: DB extents + the persisted 4D run + the stored cinema_path.
 *
 * Non-invent: every value is read. Nothing is estimated except the film-second map, which is
 * declared linear and printed as an assumption so it can be falsified.
 *
 * Usage: node scripts/poc_slab_beat.js [Building ...]
 */
'use strict';
var fs = require('fs'), path = require('path'), OOTB = '/home/red1/bim-ootb';
var initSqlJs = require(path.join(OOTB, 'modeller', 'lib', 'sql-wasm.js'));
var wasm = fs.readFileSync(path.join(OOTB, 'modeller', 'lib', 'sql-wasm.wasm'));

var TINT_SEC = 2.0;      // §FLYTHRU_MESH_TINT envelope: 0.6 fade in / 1.0 hold / 0.6 out
var MIN_HOLD = 2.0;      // user, 2026-09-08: a candidate must hold > this before the next one
var CO_FRAC  = 0.10;     // a co-arrival counts when it is >= this fraction of the plate's area
var CAND_FRAC= 0.25;     // a plate is a candidate at >= this fraction of the building's largest
var MAX_DIVE = 2;        // user, 2026-09-08: "just do 2 at max during fly in" — a CEILING, not a target
var TAKE     = 1;        // §1 one cue per capability. user, 2026-09-08: "If the 9th second is the first
                         // beat, then nothing else needs to follow as the cutoff sequences are too short."
                         // A second floor plate is the SAME capability said twice — an inventory (§1).

function log(s) { console.log(s); }

// ── 1. CANDIDATES — planar slabs with true extents, from the DB, never scene metadata (§2)
function slabCandidates(db) {
  var q = "SELECT m.guid, m.element_name, m.storey, t.center_x, t.center_y, t.center_z, " +
          "t.bbox_x, t.bbox_y, t.bbox_z FROM elements_meta m " +
          "JOIN element_transforms t ON m.guid = t.guid " +
          "WHERE m.ifc_class IN ('IfcSlab','IfcSlabStandardCase')";
  var r; try { r = db.exec(q); } catch (e) { return []; }
  if (!r.length) return [];
  return r[0].values.map(function (v) {
    var bx = +v[6], by = +v[7], bz = +v[8];
    return { guid: v[0], rawName: v[1], storey: v[2],
             cx: +v[3], cy: +v[4], cz: +v[5], bx: bx, by: by, bz: bz,
             area: bx * by, name: semanticName(v[1]) };
  }).filter(function (s) { return s.bz < 0.5 * Math.min(s.bx, s.by); });   // planar, by its own footprint
}

// ── 2. SEMANTIC NAME — extracted, never invented (§8). Revit type strings are `Family:Type:id`.
function semanticName(raw) {
  if (!raw) return null;
  var p = String(raw).split(':');
  if (p.length >= 3) return p.slice(1, p.length - 1).join(':').trim();   // drop family and element id
  return String(raw).trim();
}

// ── 3. FILM SECOND — from the persisted 4D run. Linear, and it says so.
function filmSeconds(cands, play, filmSec) {
  var ss = [], ee = [];
  for (var k in play) { ss.push(play[k].s); ee.push(play[k].e); }
  var t0 = Math.min.apply(null, ss), t1 = Math.max.apply(null, ee), span = t1 - t0;
  cands.forEach(function (c) {
    var p = play[c.guid];
    c.sec = p ? (p.s - t0) / span * filmSec : null;
  });
  return { t0: t0, spanDays: span / 86400000 };
}

// ── 4a. PLAN OVERLAP — two plates stacked on the same footprint are ONE floor in two layers
//     (HHS lays `STB 30.0` structural and `FB 15.0 - Fliesen` finish 0.09 s apart on the same
//     65.84 x 53.44 m plan). A co-arrival somewhere ELSE fragments the frame; a co-arrival HERE
//     does not. MEASURED: without this test HHS rejected every candidate and the beat drew nothing.
function planOverlap(a, b) {
  var ix = Math.min(a.cx + a.bx / 2, b.cx + b.bx / 2) - Math.max(a.cx - a.bx / 2, b.cx - b.bx / 2);
  var iy = Math.min(a.cy + a.by / 2, b.cy + b.by / 2) - Math.max(a.cy - a.by / 2, b.cy - b.by / 2);
  if (ix <= 0 || iy <= 0) return 0;
  return (ix * iy) / Math.min(a.area, b.area);
}
var STACK_FRAC = 0.50;   // >= this share of the smaller footprint => same floor, different layer

// ── 4. CO-ARRIVAL — a cluster inside one tint envelope is ONE event. Keep the LARGEST, not the last.
function collapseCoArrivals(cands) {
  var live = cands.filter(function (c) { return c.sec != null; })
                  .sort(function (a, b) { return a.sec - b.sec; });
  var out = [];
  live.forEach(function (c) {
    var host = null;
    for (var i = out.length - 1; i >= 0; i--) {
      if (c.sec - out[i].sec <= TINT_SEC) { host = out[i]; break; }
      if (c.sec - out[i].sec > TINT_SEC) break;
    }
    if (!host) { c.coArrivals = []; out.push(c); return; }
    if (c.area > host.area) {                        // the larger plate takes the event
      c.coArrivals = (host.coArrivals || []).concat([host]);
      out[out.length - 1] = c;
    } else host.coArrivals.push(c);
  });
  out.forEach(function (c) {
    c.stacked = (c.coArrivals || []).filter(function (x) { return planOverlap(c, x) >= STACK_FRAC; });
    c.coSignificant = (c.coArrivals || []).filter(function (x) {
      return x.area >= CO_FRAC * c.area && planOverlap(c, x) < STACK_FRAC;
    });
  });
  return out;
}

// ── 5. HOLD — seconds until the next event that would claim the label.
function holdWindows(events) {
  events.forEach(function (e, i) {
    e.hold = (i + 1 < events.length) ? events[i + 1].sec - e.sec : Infinity;
  });
}

// ── 6. VISUAL POTENTIAL — a BOUND from the stored path's waypoints, NOT the camera pose.
//     Reports how many waypoints have the plate in front, and the largest angular size seen.
//     ⚠ INCONCLUSIVE when no path is stored; the real test is plan.poseAt in the viewer.
function visualBound(c, wps) {
  if (!wps || !wps.length) return { verdict: 'INCONCLUSIVE', inFront: 0, of: 0, maxSubtend: null };
  var inFront = 0, maxSub = 0;
  wps.forEach(function (w) {
    var vx = c.cx - w.x, vy = c.cy - w.y, vz = c.cz - w.z;
    var d = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1e-9;
    if ((vx * w.dx + vy * w.dy + vz * w.dz) / d > 0) inFront++;
    var sub = 2 * Math.atan(Math.max(c.bx, c.by) / 2 / d) * 180 / Math.PI;
    if (sub > maxSub) maxSub = sub;
  });
  return { verdict: inFront ? 'BOUND' : 'BEHIND-ALL', inFront: inFront, of: wps.length,
           maxSubtend: maxSub };
}

// ── 7. THE GUARD — at most MAX_DIVE beats inside the dive, longest hold wins (user, 2026-09-08).
function pickBeats(events, diveSec) {
  var qual = events.filter(function (e) {
    e.reject = null;
    if (e.hold < MIN_HOLD) e.reject = 'hold ' + e.hold.toFixed(2) + 's < ' + MIN_HOLD;
    else if (e.coSignificant.length) e.reject = e.coSignificant.length + ' co-arrivals >=' + (CO_FRAC * 100) + '%';
    return !e.reject;
  });
  var dive = qual.filter(function (e) { return e.sec < diveSec; })
                 .sort(function (a, b) { return b.hold - a.hold; });
  var take = Math.min(TAKE, MAX_DIVE);
  var kept = dive.slice(0, take);
  dive.slice(take).forEach(function (e) {
    e.reject = 'not taken — §1 one cue per capability (hold ' + e.hold.toFixed(2) + 's, rank ' +
               (dive.indexOf(e) + 1) + ' of ' + dive.length + ')';
  });
  var after = qual.filter(function (e) { return e.sec >= diveSec; });
  after.forEach(function (e) { e.reject = 'not taken — after the dive, and §1 takes one'; });
  kept.sort(function (a, b) { return a.sec - b.sec; });
  return { dive: kept, afterDive: after, diveQualified: dive.length };
}

function run(SQL, bld, dbFile, runFile) {
  if (!fs.existsSync(dbFile) || !fs.existsSync(runFile)) { log('  SKIP ' + bld + ' (db or cached run absent)'); return; }
  var db = new SQL.Database(fs.readFileSync(dbFile));
  var r4 = JSON.parse(fs.readFileSync(runFile, 'utf8'));

  // film length + dive window, from the stored path when there is one
  var filmSec = null, diveSec = null, wps = [], pathSrc = 'NONE (derived film)';
  ['Hospital_silent_local.db', path.basename(dbFile)].forEach(function (f) {
    if (filmSec != null) return;
    var p = path.join(OOTB, 'buildings', f);
    if (!fs.existsSync(p)) return;
    try {
      var d2 = new SQL.Database(fs.readFileSync(p));
      var q = d2.exec("SELECT ifc_x,ifc_y,ifc_z,dir_x,dir_y,dir_z,total_sec,dive_sec FROM cinema_path ORDER BY seq");
      if (q.length && q[0].values.length && String(f).indexOf(bld.split('_')[0]) === 0) {
        q[0].values.forEach(function (v) {
          wps.push({ x: +v[0], y: +v[1], z: +v[2], dx: +v[3], dy: +v[4], dz: +v[5] });
        });
        diveSec = +q[0].values[0][7];
        pathSrc = f + ' (' + wps.length + ' waypoints, total_sec=' + (+q[0].values[0][6]).toFixed(2) + ')';
      }
      d2.close();
    } catch (e) { /* no cinema_path */ }
  });
  // MEASURED: the baked film is 4699 frames @ 24 fps = 195.79 s (§MAXQ_START); dive_sec is in BAKE
  // seconds (18.286 = 0.094 x 195.8, §CINEMA_BEATS), NOT in the stored path's own 278.78 s.
  filmSec = 195.8;
  if (diveSec == null) { diveSec = filmSec * 0.094; pathSrc += ' — dive from the 0.094 beat fraction'; }

  var cands = slabCandidates(db);
  if (!cands.length) { log('  §SLAB_BEAT ' + bld + ' VACUOUS — no planar IfcSlab in this model'); db.close(); return; }
  var meta = filmSeconds(cands, r4.play, filmSec);
  var amax = Math.max.apply(null, cands.map(function (c) { return c.area; }));
  var pool = cands.filter(function (c) { return c.area >= CAND_FRAC * amax && c.sec != null; });
  var events = collapseCoArrivals(pool);
  holdWindows(events);
  events.forEach(function (e) { e.vis = visualBound(e, wps); });
  var pick = pickBeats(events, diveSec);

  log('');
  log('── ' + bld + ' ──');
  log('  §SLAB_BEAT_INPUT planarSlabs=' + cands.length + ' pool(>=' + (CAND_FRAC * 100) + '% of ' +
      amax.toFixed(0) + 'm2)=' + pool.length + ' events(co-arrivals collapsed)=' + events.length);
  log('  §SLAB_BEAT_FILM filmSec=' + filmSec.toFixed(2) + ' diveSec=' + diveSec.toFixed(2) +
      ' playSpan=' + meta.spanDays.toFixed(0) + 'd ⚠ ASSUMED LINEAR day→second');
  log('  §SLAB_BEAT_PATH ' + pathSrc);
  log('  ' + ['filmS', 'area m2', 'storey', 'hold', 'front', 'subtend', 'name', 'verdict']
        .map(function (h, i) { return h.padEnd([8, 9, 14, 7, 6, 8, 38, 0][i]); }).join(''));
  events.forEach(function (e) {
    var v = e.reject ? ('— ' + e.reject) : (pick.dive.indexOf(e) >= 0 ? '✅ DIVE BEAT' : '✅ qualifies (after dive)');
    log('  ' + e.sec.toFixed(2).padStart(6).padEnd(8) +
        e.area.toFixed(0).padStart(8).padEnd(9) +
        String(e.storey).slice(0, 13).padEnd(14) +
        (e.hold === Infinity ? '  ∞' : e.hold.toFixed(2)).padStart(6).padEnd(7) +
        (e.vis.inFront + '/' + e.vis.of).padEnd(6) +
        (e.vis.maxSubtend == null ? 'n/a' : e.vis.maxSubtend.toFixed(0) + '°').padEnd(8) +
        String(e.name).slice(0, 37).padEnd(38) + v +
        (e.stacked && e.stacked.length ? '  [+' + e.stacked.length + ' stacked layer(s): ' +
          e.stacked.map(function (x) { return x.name; }).join(', ') + ']' : ''));
  });
  log('  §SLAB_BEAT_PICK take=' + pick.dive.length + '/' + TAKE + ' (cap ' + MAX_DIVE +
      ', qualified in dive=' + pick.diveQualified + ')' +
      (pick.dive.length ? ' [' + pick.dive.map(function (e) { return e.sec.toFixed(2) + 's ' + e.storey; }).join(' | ') + ']'
                        : ' NOTHING — no plate qualifies inside the dive, and it says so') +
      ' afterDiveQualified=' + pick.afterDive.length + ' (none taken, §1)');
  if (!wps.length) log('  §SLAB_BEAT_VIS INCONCLUSIVE — no stored path; frustum must be judged by plan.poseAt in the viewer');
  db.close();
}

var LIST = process.argv.slice(2);
if (!LIST.length) LIST = ['Hospital', 'HHS_Office_Federated', 'Terminal', 'Clinic'];
initSqlJs({ wasmBinary: wasm }).then(function (SQL) {
  log('═══ §SLAB_BEAT PoC — which floor plate gets marked, and when. ' + new Date().toISOString().slice(0, 10) + ' ═══');
  log('SELECTION ONLY. Draws nothing. Frustum/hold is plan.poseAt in the viewer (§16).');
  LIST.forEach(function (b) {
    run(SQL, b, path.join(OOTB, 'buildings', b + '_extracted.db'),
        path.join(process.env.HOME, '.cache', 'bim4d', b, latest(b), 'run.json'));
  });
  log('');
  log('═══ done ═══');
});
function latest(b) {
  var d = path.join(process.env.HOME, '.cache', 'bim4d', b);
  if (!fs.existsSync(d)) return '_none_';
  var ds = fs.readdirSync(d).filter(function (x) { return fs.statSync(path.join(d, x)).isDirectory(); });
  ds.sort(function (a, c) { return fs.statSync(path.join(d, c)).mtimeMs - fs.statSync(path.join(d, a)).mtimeMs; });
  return ds[0] || '_none_';
}
