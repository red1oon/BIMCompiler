'use strict';
// ⚠ DO NOT REMOVE
// SCOPE: W-ROOM-WELLFORMED — falsifiers for the two smells the user saw visually on HHS
// (ROOM_INJECTION_HYBRID.md §7), proven on ALL synthetic-room buildings, not just HHS:
//   W1 tag integrity: every compiled room row is one of the 5 known predefined_types and its
//      name mark matches ('⚠ ' iff SUSPECT_*, '≈ ' otherwise).
//   W2 containment purity: rel_contained_in_space never references a SUSPECT_* room.
//   W3 (smell B falsifier — "floor crosses through a wall"): re-rasterize each storey's walls
//      INDEPENDENTLY (own grid code, not the walker's) and assert ZERO raw wall cells inside any
//      non-SUSPECT room rect at DEPTH >= 2 cells. This is exactly the defect the user saw; it
//      cannot re-form silently. The depth qualifier is §S74's addendum (2026-08-23): §WALL-SNAP
//      (room_walker.js:432-467, shipped 2026-07-13, two days after this witness froze) moves every
//      rect side OUT to its wall's continuous near face, so the rect boundary now COINCIDES with
//      the wall AABB by construction — the two independent quantizations here (round() rect cells
//      vs floor() wall cells) then legitimately share a <=1-cell boundary band. Measured fleet-wide
//      2026-08-23: 16,391 band hits (depth<=1), ZERO at depth>=2. A wall LINE genuinely crossing a
//      rect sits at depth>=2 and still FAILs; the band is counted and reported, never asserted away.
//   W4 (smell A falsifier — "corridor as room" / HHS door-partition collapse): HHS compiles via
//      flood-fill on every level (zero INTERNAL_DOORPART rows), >0 rooms on each of Level 1/2/3.
// Read the log after every run — exit code alone is not evidence.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
// §S74 candidate 1 (2026-08-23): no hardcoded absolute requires (witness_disc_walk_shim.js pattern).
function loadSqlJs() {
  const cands = [path.join(ROOT, 'node_modules/sql.js'), 'sql.js'];
  for (const c of cands) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('sql.js not found (npm install, or NODE_PATH to a node_modules with sql.js)');
}
const initSqlJs = loadSqlJs();
const RoomWalker = require('./room_walker.js');

// §S74 candidate 1 (2026-08-23): the old hardcoded '/tmp/wt-fable-livewire/modeller' died with its
// pruned worktree → all-SKIP vacuous green. Env override → long-lived home → old path; first
// existing dir wins. Per-building SKIP below still covers genuinely absent DBs.
const ARC_CANDIDATES = [
  process.env.ARC_DB_DIR,
  path.join(process.env.HOME || '', 'bim-ootb/modeller'),
  '/tmp/wt-fable-livewire/modeller',
].filter(Boolean);
const LIVEWIRE = ARC_CANDIDATES.find(d => fs.existsSync(d)) || ARC_CANDIDATES[ARC_CANDIDATES.length - 1];
const SCRATCH = '/tmp/w_room_wellformed';
const BUILDINGS = ['SampleCastle', 'HHS', 'Clinic', 'Garage', 'Hospital', 'Terminal'];
// SUSPECT_ELONGATED/SUSPECT_LARGE shipped 2026-07-13/14 while this witness was frozen at
// 2026-07-11's five types — added 2026-08-23 (§S74 candidate 1, latent-misfire fix; zero rows of
// either type across the six-building fleet today, so this is future-proofing, not a red fix).
const KNOWN_TYPES = ['INTERNAL', 'INTERNAL_SMALL', 'INTERNAL_DOORPART', 'SUSPECT_NO_DOOR', 'SUSPECT_OPEN',
  'SUSPECT_ELONGATED', 'SUSPECT_LARGE'];
const RES = RoomWalker.RES;

function rows(db, sql) {
  const r = db.exec(sql);
  if (!r.length) return [];
  const cols = r[0].columns;
  return r[0].values.map(v => { const o = {}; cols.forEach((c, i) => o[c] = v[i]); return o; });
}

(async () => {
  fs.rmSync(SCRATCH, { recursive: true, force: true });
  fs.mkdirSync(SCRATCH, { recursive: true });
  const SQL = await initSqlJs();
  let pass = 0, fail = 0;
  const ok = (cond, msg) => {
    console.log(`§W-ROOM-WELLFORMED ${cond ? 'PASS' : 'FAIL'} ${msg}`);
    if (cond) pass++; else fail++;
  };

  for (const b of BUILDINGS) {
    const src = `${LIVEWIRE}/${b}_ARC.db`;
    if (!fs.existsSync(src)) { console.log(`§W-ROOM-WELLFORMED SKIP ${b} — source not local`); continue; }
    const dbPath = `${SCRATCH}/${b}.db`;
    fs.copyFileSync(src, dbPath);
    const db = new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)));
    const result = RoomWalker.walk(db, { write: true });

    const roomRows = rows(db, "SELECT guid, name, parent_guid, predefined_type pt, " +
      "center_x cx, center_y cy, size_x sx, size_y sy FROM spatial_structure " +
      "WHERE type='IfcSpace' AND guid LIKE 'RM\\_%' ESCAPE '\\'");
    const storeyName = {};
    rows(db, "SELECT guid, name FROM spatial_structure WHERE type='IfcBuildingStorey'")
      .forEach(r => { storeyName[r.guid] = r.name; });

    // W1 — tag integrity
    const badType = roomRows.filter(r => KNOWN_TYPES.indexOf(r.pt) < 0);
    const badMark = roomRows.filter(r => {
      const isSuspect = r.pt.indexOf('SUSPECT_') === 0;
      return isSuspect ? r.name.indexOf('⚠ ') !== 0 : r.name.indexOf('≈ ') !== 0;
    });
    const nSuspect = roomRows.filter(r => r.pt.indexOf('SUSPECT_') === 0).length;
    ok(badType.length === 0 && badMark.length === 0,
      `${b} W1 tags: ${roomRows.length} rooms (${nSuspect} suspect), badType=${badType.length} badMark=${badMark.length}`);

    // W2 — containment purity: no rel row points at a SUSPECT room
    const suspectGuids = new Set(roomRows.filter(r => r.pt.indexOf('SUSPECT_') === 0).map(r => r.guid));
    const relRows = rows(db, "SELECT DISTINCT space_guid g FROM rel_contained_in_space WHERE space_guid LIKE 'RM\\_%' ESCAPE '\\'");
    const relSuspect = relRows.filter(r => suspectGuids.has(r.g));
    ok(relSuspect.length === 0, `${b} W2 containment: ${relRows.length} spaces referenced, suspectRefs=${relSuspect.length}`);

    // W3 — smell B falsifier: independent raster, zero raw wall cells inside any non-SUSPECT rect
    const ds = RoomWalker.doorStats(db);
    const vertMin = ds.h > 0 ? RoomWalker.VERT_FACTOR * ds.h : 0.0;
    const anchors = RoomWalker.storeyZAnchors(db);
    const wallsBy = RoomWalker.storeyWalls(db, vertMin, anchors);
    let checked = 0, crossings = 0, bandTotal = 0;
    const byStorey = {};
    roomRows.forEach(r => {
      if (r.pt.indexOf('SUSPECT_') === 0) return; // suspects are review candidates, not trusted rects
      const st = storeyName[r.parent_guid];
      if (st === undefined) return;
      (byStorey[st] = byStorey[st] || []).push(r);
    });
    Object.keys(byStorey).forEach(st => {
      const ws = wallsBy[st];
      if (!ws || ws.length < 3) return;
      // independent grid (same extent formula, own rasterization loop — the oracle)
      let xs0 = Infinity, xs1 = -Infinity, ys0 = Infinity, ys1 = -Infinity;
      ws.forEach(w => {
        xs0 = Math.min(xs0, w[0] - w[3] / 2); xs1 = Math.max(xs1, w[0] + w[3] / 2);
        ys0 = Math.min(ys0, w[1] - w[4] / 2); ys1 = Math.max(ys1, w[1] + w[4] / 2);
      });
      const pad = RES * 2; xs0 -= pad; ys0 -= pad; xs1 += pad; ys1 += pad;
      const nx = Math.max(4, Math.ceil((xs1 - xs0) / RES));
      const ny = Math.max(4, Math.ceil((ys1 - ys0) / RES));
      const clampI = v => Math.min(nx - 1, Math.max(0, v));
      const clampJ = v => Math.min(ny - 1, Math.max(0, v));
      const raw = new Uint8Array(nx * ny);
      ws.forEach(w => {
        const i0 = clampI(Math.floor((w[0] - w[3] / 2 - xs0) / RES)), i1 = clampI(Math.floor((w[0] + w[3] / 2 - xs0) / RES));
        const j0 = clampJ(Math.floor((w[1] - w[4] / 2 - ys0) / RES)), j1 = clampJ(Math.floor((w[1] + w[4] / 2 - ys0) / RES));
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) raw[i * ny + j] = 1;
      });
      byStorey[st].forEach(r => {
        const i0 = Math.round((r.cx - r.sx / 2 - xs0) / RES), i1 = Math.round((r.cx + r.sx / 2 - xs0) / RES) - 1;
        const j0 = Math.round((r.cy - r.sy / 2 - ys0) / RES), j1 = Math.round((r.cy + r.sy / 2 - ys0) / RES) - 1;
        // §S74 addendum (2026-08-23): depth<=1 = the §WALL-SNAP boundary band (rect edge sits ON
        // the wall near face by construction — expected contact, reported not failed); depth>=2 =
        // a wall genuinely inside the room — the original smell-B defect, still a FAIL.
        let snapBand = 0, deep = 0;
        for (let i = Math.max(0, i0); i <= Math.min(nx - 1, i1); i++)
          for (let j = Math.max(0, j0); j <= Math.min(ny - 1, j1); j++)
            if (raw[i * ny + j]) {
              const depth = Math.min(i - i0, i1 - i, j - j0, j1 - j);
              if (depth >= 2) deep++; else snapBand++;
            }
        checked++;
        bandTotal += snapBand;
        if (deep > 0) {
          crossings++;
          console.log(`  wall-crossing: ${r.guid} rect ${r.sx.toFixed(1)}x${r.sy.toFixed(1)} @(${r.cx.toFixed(1)},${r.cy.toFixed(1)}) contains ${deep} raw wall cells at depth>=2 (snap-band ${snapBand})`);
        }
      });
    });
    ok(crossings === 0, `${b} W3 wall-crossing: ${checked} non-suspect rects checked, crossings=${crossings} (snapBandHits=${bandTotal} expected §WALL-SNAP contact)`);

    // W4 — HHS-specific corridor falsifier
    if (b === 'HHS') {
      const dpRows = roomRows.filter(r => r.pt === 'INTERNAL_DOORPART').length;
      const perLevel = {};
      roomRows.forEach(r => {
        const st = storeyName[r.parent_guid];
        perLevel[st] = (perLevel[st] || 0) + 1;
      });
      const levelsOk = ['Level 1', 'Level 2', 'Level 3'].every(l => (perLevel[l] || 0) > 0);
      ok(dpRows === 0 && levelsOk,
        `HHS W4 corridor-collapse: doorPartitionRows=${dpRows} perLevel=${JSON.stringify(perLevel)}`);
    }
    db.close();
  }

  console.log(`§W-ROOM-WELLFORMED SUMMARY pass=${pass} fail=${fail}`);
  if (fail > 0) process.exit(1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
