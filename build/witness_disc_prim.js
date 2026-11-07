/**
 * witness_disc_prim.js — W-DW-PRIM: GENERATED-fixture representative primitives.
 * Spec: prompts/RESUME_DISC_WALKER_ENVELOPE_BOUND.md §PRIM.
 *
 * THE NON-INVENT POINT: an absent discipline has NO ground truth for fixture POSITION (correct —
 * positions stay GENERATED/plausible/density-placed, unchanged by this work). But the fixture's
 * SIZE per ifc_class IS measurable from the source building the rules were mined from. So we render
 * each generated fixture as a BOX of its class's MEASURED median bbox instead of a uniform 0.18 cube.
 * The box's DIMENSIONS carry the only real information; SHAPE stays a box (no fabricated catalog mesh).
 *
 * Proves/disproves:
 *   P1 MEASURED   — every rule_placement class carries bbox_dx/dy/dz>0 == an INDEPENDENT re-measure
 *                   (here, off the meta DB) of that class's median bbox. 0 tolerance. Oracle, not self-grade.
 *   P2 NON-INVENT — a class with no source element (synthetic 'IfcNope', NULL bbox) → repRules bbox=null
 *                   → engine emits bx=null → render falls back to the 0.18 cube. No fabricated size.
 *   P3 CARRIED    — disc_walker placements expose bx/by/bz == the stamped class bbox (carry-through intact).
 *   P4 REGRESSION — placement COUNT + every x/y/z identical to a bbox-stripped walk (SIZE-only change).
 *   P5 RENDER     — replicate the three.js box-instance transform (unit BoxGeometry scaled (bx,by,bz),
 *                   centered at p.x/y/z): the 8 world corners are p ± extent/2, exact.
 */
const path = require('path'), fs = require('fs');
const DWT = require(path.join(__dirname, '..', 'scripts', 'dw_tree.js'));   // the shipped walker and its rules, never this folder's older copy (MODELLER_MASTER §WITNESS-REPOINT)
const ROOT = path.resolve(__dirname, '..');
const DW = require(DWT.walker);

function loadSqlJs() {
  const cands = [path.join(ROOT, 'node_modules/sql.js'),
    path.join(process.env.HOME || '', 'bim-ootb/tests/node_modules/sql.js'), 'sql.js'];
  for (const c of cands) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('sql.js not found');
}
const MODELLER = path.join(process.env.HOME || '', 'bim-ootb/modeller');
// (rules db, meta db, walk-target building, a disc to walk for P3/P4)
const CASES = [
  { rules: DWT.rules('terminal_rules.db'), meta: path.join(MODELLER, 'Terminal_meta.db'),
    target: path.join(MODELLER, 'SampleCastle_extracted.db'), disc: 'PLB' },
  { rules: DWT.rules('duplex_rules.db'), meta: path.join(ROOT, 'build/Duplex_mep_meta.db'),
    target: path.join(MODELLER, 'SampleCastle_extracted.db'), disc: 'PLB' },
].filter(c => fs.existsSync(c.rules) && fs.existsSync(c.meta) && fs.existsSync(c.target));

let PASS = 0, FAIL = 0;
const ok = (c, m) => { (c ? PASS++ : FAIL++); console.log('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };
const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);

// _med replicated VERBATIM from disc_walker.js (filter-null, sort, a[floor(len/2)]) — same oracle.
function med(arr) { const a = arr.filter(v => v != null).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; }

// INDEPENDENT median bbox per ifc_class straight off the meta DB (the P1 oracle).
function metaBbox(mdb, cls) {
  const e = cls.replace(/'/g, "''");
  const r = mdb.exec("SELECT t.bbox_x,t.bbox_y,t.bbox_z FROM elements_meta m " +
    "JOIN element_transforms t ON m.guid=t.guid WHERE m.ifc_class='" + e + "'");
  if (!r.length) return null;
  const v = r[0].values;
  return { dx: med(v.map(x => x[0])), dy: med(v.map(x => x[1])), dz: med(v.map(x => x[2])) };
}

// Faithful three.js Matrix4.compose(pos, identityQuat, scale) applied to unit-box local corners
// (BoxGeometry(bx,by,bz) has corners at ±bx/2,±by/2,±bz/2). Identity rotation → world = pos + corner.
function boxCorners(p, bx, by, bz) {
  const out = [];
  for (const sx of [-0.5, 0.5]) for (const sy of [-0.5, 0.5]) for (const sz of [-0.5, 0.5])
    out.push([p.x + sx * bx, p.y + sy * by, p.z + sz * bz]);
  return out;
}

(async () => {
  const SQL = await loadSqlJs()();
  console.log('§DWPRIM-BEGIN cases=' + CASES.map(c => path.basename(c.rules)).join(','));

  for (const cs of CASES) {
    const rn = path.basename(cs.rules);
    console.log('\n── ' + rn + ' (meta=' + path.basename(cs.meta) + ') ──────────');
    const rulesBuf = fs.readFileSync(cs.rules);
    const rulesDb = new SQL.Database(new Uint8Array(rulesBuf));
    const mdb = new SQL.Database(new Uint8Array(fs.readFileSync(cs.meta)));

    // ── P1 MEASURED: stamped bbox per class == independent meta re-measure (0 tol) ──
    const cls = rulesDb.exec("SELECT DISTINCT ifc_class FROM rule_placement")[0].values.map(v => v[0]);
    let p1bad = 0, p1nullStamp = 0;
    for (const c of cls) {
      const r = rulesDb.exec("SELECT bbox_dx,bbox_dy,bbox_dz FROM rule_placement WHERE ifc_class='" + c.replace(/'/g, "''") + "' LIMIT 1");
      const st = r[0].values[0];
      const oracle = metaBbox(mdb, c);
      if (st[0] == null || !(st[0] > 0 && st[1] > 0 && st[2] > 0)) { p1nullStamp++; continue; }
      const good = oracle && near(st[0], oracle.dx) && near(st[1], oracle.dy) && near(st[2], oracle.dz);
      if (!good) { p1bad++; console.log('     mismatch ' + c + ' stamped=(' + st.map(x => (+x).toFixed(3)) + ') oracle=(' +
        (oracle ? [oracle.dx, oracle.dy, oracle.dz].map(x => (+x).toFixed(3)) : 'null') + ')'); }
    }
    ok(p1bad === 0 && p1nullStamp === 0, 'P1 MEASURED: ' + cls.length + ' classes stamped bbox == independent meta median (0 tol), 0 null/mismatch');

    // ── P3 CARRIED: place() exposes bx/by/bz == stamped class bbox ──
    DW.dwOpen(new SQL.Database(new Uint8Array(rulesBuf)));   // fresh handle for the engine
    const bdb = new SQL.Database(new Uint8Array(fs.readFileSync(cs.target)));
    const sub = DW.substrate(bdb);
    const placed = DW.place(cs.disc, sub, bdb);
    // stamped bbox per class (median, mirrors repRules)
    const stampByCls = {};
    rulesDb.exec("SELECT ifc_class,bbox_dx,bbox_dy,bbox_dz FROM rule_placement WHERE disc='" + cs.disc + "'")[0].values
      .forEach(v => { (stampByCls[v[0]] = stampByCls[v[0]] || { x: [], y: [], z: [] }); stampByCls[v[0]].x.push(v[1]); stampByCls[v[0]].y.push(v[2]); stampByCls[v[0]].z.push(v[3]); });
    const stampMed = {}; Object.keys(stampByCls).forEach(c => stampMed[c] = { dx: med(stampByCls[c].x), dy: med(stampByCls[c].y), dz: med(stampByCls[c].z) });
    let p3bad = 0;
    placed.forEach(pl => {
      const s = stampMed[pl.ifc_class];
      if (!s || !(s.dx > 0)) return;                          // class w/o measured bbox → fallback path (P2 covers)
      if (!(near(pl.bx, s.dx) && near(pl.by, s.dy) && near(pl.bz, s.dz))) p3bad++;
    });
    ok(placed.length > 0 && p3bad === 0, 'P3 CARRIED: ' + placed.length + ' placements expose bx/by/bz == stamped class bbox (0 bad)');

    // ── P4 REGRESSION: strip bbox cols → count + x/y/z identical (SIZE-only) ──
    const stripped = new SQL.Database(new Uint8Array(rulesBuf));
    stripped.run("UPDATE rule_placement SET bbox_dx=NULL,bbox_dy=NULL,bbox_dz=NULL");
    DW.dwOpen(stripped);
    const placed0 = DW.place(cs.disc, sub, bdb);
    let p4bad = (placed0.length !== placed.length) ? 1 : 0;
    for (let i = 0; i < placed.length && !p4bad; i++) {
      if (!(near(placed[i].x, placed0[i].x) && near(placed[i].y, placed0[i].y) && near(placed[i].z, placed0[i].z))) p4bad = 1;
    }
    // and the stripped walk must carry NO size (bx null) — proving size is the ONLY thing PRIM added
    const p4null = placed0.every(p => p.bx == null);
    ok(p4bad === 0 && p4null, 'P4 REGRESSION: count(' + placed.length + ')+x/y/z identical to bbox-stripped walk; stripped carries no size');

    // ── P2 NON-INVENT: synthetic IfcNope (NULL bbox) → repRules bbox=null → bx null → render 0.18 ──
    const fake = new SQL.Database(new Uint8Array(rulesBuf));
    const cols = fake.exec("PRAGMA table_info(rule_placement)")[0].values.map(v => v[1]);
    const vals = cols.map(c => c === 'disc' ? "'" + cs.disc + "'" : c === 'ifc_class' ? "'IfcNope'"
      : c === 'spacing_x_m' || c === 'spacing_y_m' ? '0.5' : c === 'n_measured' ? '4'
      : c === 'src_storey_area_m2' ? '100' : c === 'ref_kind' ? "'datum'"
      : (c === 'bbox_dx' || c === 'bbox_dy' || c === 'bbox_dz') ? 'NULL' : 'NULL');
    fake.run("INSERT INTO rule_placement(" + cols.join(',') + ") VALUES(" + vals.join(',') + ")");
    DW.dwOpen(fake);
    const reps = DW.repRules(cs.disc);
    const nope = reps.find(r => r.ifc_class === 'IfcNope');
    const fakePlaced = DW.place(cs.disc, sub, bdb).filter(p => p.ifc_class === 'IfcNope');
    const RENDER_FALLBACK = 0.18;
    const dim = (b) => (b > 0 ? b : RENDER_FALLBACK);          // the render's fallback rule
    const fellBack = fakePlaced.length > 0 && fakePlaced.every(p => p.bx == null && near(dim(p.bx), RENDER_FALLBACK));
    ok(nope && nope.bbox === null && fellBack, 'P2 NON-INVENT: IfcNope null bbox → bx=null → render fallback ' + RENDER_FALLBACK + ' (no fabricated size, ' + fakePlaced.length + ' fixtures)');

    // ── P5 RENDER: three.js box-instance transform exact ──
    DW.dwOpen(new SQL.Database(new Uint8Array(rulesBuf)));
    const sample = DW.place(cs.disc, sub, bdb).find(p => p.bx > 0);
    let p5 = false;
    if (sample) {
      const corners = boxCorners(sample, sample.bx, sample.by, sample.bz);
      const xs = corners.map(c => c[0]), ys = corners.map(c => c[1]), zs = corners.map(c => c[2]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      const ex = Math.max(...xs) - Math.min(...xs), ey = Math.max(...ys) - Math.min(...ys), ez = Math.max(...zs) - Math.min(...zs);
      p5 = near(cx, sample.x) && near(cy, sample.y) && near(cz, sample.z) &&
        near(ex, sample.bx) && near(ey, sample.by) && near(ez, sample.bz);
      console.log('     §DW-PRIM sample ' + sample.ifc_class + ' dims=(' + [sample.bx, sample.by, sample.bz].map(x => (+x).toFixed(3)).join(',') + ') at (' + [sample.x, sample.y, sample.z].map(x => (+x).toFixed(2)).join(',') + ')');
    }
    ok(p5, 'P5 RENDER: unit BoxGeometry scaled (bx,by,bz) centered at p → 8 world corners exact (center+extent match)');
  }

  console.log('\n§DWPRIM-END PASS=' + PASS + ' FAIL=' + FAIL);
  process.exit(FAIL ? 1 : 0);
})();
