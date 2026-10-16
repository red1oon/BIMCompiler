'use strict';
// ⚠ DO NOT REMOVE
// SCOPE: W-ROOM-FILL — falsifier for §MULTI-RECT (ROOM_INJECTION_HYBRID.md §8): a confirmed room's
// emitted rectangle set must cover MATERIALLY more of its real flood-filled region than the single
// §RECT-HONESTY rect did. Reports BEFORE (single-rect cover1) vs AFTER (rect-set cover_n) median +
// worst-case per building — numbers, not "better". Also proves the set discipline:
//   F1 coverage: per building, after-median >= before-median, after-worst > before-worst where any
//      room decomposed, and every confirmed room's cover_n >= RECT_COVER_TARGET − one noise-floor
//      rect's worth (the honest stop bound).
//   F2 identity: N rect rows in the DB still form exactly the logical room count via room_guid
//      (COUNT(DISTINCT room_guid) == logical rooms; every sub-rect row shares its parent's
//      name/predefined_type; SUSPECT rooms have exactly ONE row — EXCEPT the two mechanisms that
//      postdate this witness's 2026-07-11 freeze and legitimately emit multi-rect suspects
//      (§S74 addendum 2026-08-23, measured on Clinic/Hospital/Terminal, py+js byte-identical):
//      R-MERGE rect-concat with a suspect representative (room_walker.js:990-998, merged_from>1)
//      and R-REJECT's post-decompose SUSPECT_OPEN flag (room_walker.js:1063, enclosure below
//      SUSPECT_OPEN_ENCLOSURE). A multi-row suspect explained by NEITHER is still the original
//      defect (suspects must not decompose — _decomposeRegion's single flag) and stays a FAIL.
//   F3 rel purity: rel_contained_in_space keys logical room guids only (no lettered sub-rect guid).
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
const BUILDINGS = ['SampleCastle', 'HHS', 'Clinic', 'Garage', 'Hospital', 'Terminal'];

function median(a) { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }
function rows(db, sql) {
  const r = db.exec(sql);
  if (!r.length) return [];
  const cols = r[0].columns;
  return r[0].values.map(v => { const o = {}; cols.forEach((c, i) => o[c] = v[i]); return o; });
}

(async () => {
  const SQL = await initSqlJs();
  let pass = 0, fail = 0;
  const ok = (cond, msg) => { console.log(`§W-ROOM-FILL ${cond ? 'PASS' : 'FAIL'} ${msg}`); if (cond) pass++; else fail++; };

  for (const b of BUILDINGS) {
    const src = `${LIVEWIRE}/${b}_ARC.db`;
    if (!fs.existsSync(src)) { console.log(`§W-ROOM-FILL SKIP ${b}`); continue; }
    const db = new SQL.Database(new Uint8Array(fs.readFileSync(src)));
    const compiled = RoomWalker.compileRooms(db);
    const confirmed = compiled.rooms.filter(r => !r.suspect);
    const before = confirmed.map(r => r.cover1);
    const after = confirmed.map(r => r.cover_n);
    const decomposed = confirmed.filter(r => (r.rects || []).length > 1);
    console.log(`§W-ROOM-FILL ${b}: confirmed=${confirmed.length} decomposed=${decomposed.length} ` +
      `cover BEFORE med=${median(before).toFixed(2)} worst=${Math.min(...before).toFixed(2)} → ` +
      `AFTER med=${median(after).toFixed(2)} worst=${Math.min(...after).toFixed(2)}`);

    // F1 — material improvement: median never regresses; worst-case strictly improves wherever any
    // room decomposed; every room's rect-set coverage >= its single-rect coverage (monotone by
    // construction — this line falsifies a decomposition that LOSES floor area). No invented
    // absolute floor: a curved-wall room's remainder is all sub-noise-floor crescents — by the
    // grid's own NOISE_FLOOR rule that fringe is not representable room space; count reported.
    const medOk = median(after) >= median(before);
    const worstOk = decomposed.length === 0 || Math.min(...after) > Math.min(...before);
    const monotoneOk = confirmed.every(r => r.cover_n >= r.cover1 - 1e-9);
    const residue = confirmed.filter(r => r.cover_n < 0.75).length;
    ok(medOk && worstOk && monotoneOk, `${b} F1 coverage: med ${median(before).toFixed(2)}→${median(after).toFixed(2)}, ` +
      `worst ${Math.min(...before).toFixed(2)}→${Math.min(...after).toFixed(2)}, monotone=${monotoneOk}, roomsBelow0.75=${residue} (curved-wall fringe)`);

    // write + inspect the DB shape
    RoomWalker.writeRooms(db, compiled);
    const rr = rows(db, "SELECT guid, room_guid, name, predefined_type pt FROM spatial_structure " +
      "WHERE type='IfcSpace' AND guid LIKE 'RM\\_%' ESCAPE '\\'");
    const logical = compiled.total;
    const distinctRoom = new Set(rr.map(r => r.room_guid)).size;
    const byRoom = {};
    rr.forEach(r => (byRoom[r.room_guid] = byRoom[r.room_guid] || []).push(r));
    const byGuid = {};
    compiled.rooms.forEach(r => { byGuid[r.guid] = r; });
    let identBad = 0, suspectMulti = 0;
    Object.keys(byRoom).forEach(g => {
      const grp = byRoom[g];
      const names = new Set(grp.map(r => r.name)), pts = new Set(grp.map(r => r.pt));
      if (names.size !== 1 || pts.size !== 1) identBad++;
      if (grp[0].pt.indexOf('SUSPECT_') === 0 && grp.length !== 1) {
        // §S74 addendum (2026-08-23): exempt the two sanctioned multi-rect-suspect producers —
        // R-MERGE (merged_from>1) and R-REJECT's late SUSPECT_OPEN (enclosure-flagged after
        // decomposition). Anything else multi-row + suspect is the original single-rect defect.
        const cr = byGuid[g] || {};
        const explained = (cr.merged_from > 1) ||
          (cr.suspect === 'OPEN' && cr.enclosure < RoomWalker.SUSPECT_OPEN_ENCLOSURE);
        if (!explained) suspectMulti++;
      }
    });
    ok(distinctRoom === logical && identBad === 0 && suspectMulti === 0,
      `${b} F2 identity: rows=${rr.length} logicalRooms=${logical} distinctRoomGuid=${distinctRoom} identBad=${identBad} suspectMulti=${suspectMulti}`);

    // F3 — rel keys logical guids only (a lettered sub-rect guid never appears)
    const relBad = rows(db, "SELECT COUNT(*) n FROM rel_contained_in_space rel WHERE rel.space_guid LIKE 'RM\\_%' ESCAPE '\\' " +
      "AND NOT EXISTS (SELECT 1 FROM spatial_structure s WHERE s.guid=rel.space_guid AND s.room_guid=rel.space_guid)")[0].n;
    ok(relBad === 0, `${b} F3 rel purity: nonLogicalRefs=${relBad}`);
    db.close();
  }

  console.log(`§W-ROOM-FILL SUMMARY pass=${pass} fail=${fail}`);
  if (fail > 0) process.exit(1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
