#!/usr/bin/env node
/*
 * witness_disc_walk_erp_landed.js — W-TRM-WALK-LANDED  (closes audit finding F-WALK-1)
 *
 * The GAP this closes (from build/erp/AUDIT_WALK_GROUNDTRUTH.md §F-WALK-1):
 *   witness_disc_walk_erp_equivalence.js proves the ERP.db (TRM001 views) is a drop-in rule source
 *   for the walker — BUT it walks only MEP-less residents (SampleCastle/Duplex/SampleHouse), so its
 *   E3 ROUTER-EQUIV only ever compared chains rules=0 erp=0 (VACUOUS on the LANDED layer). The one
 *   building that produces real routed segments (Terminal) is never walked through the ERP.db views.
 *   So the LANDED↔ERP.db drop-in was asserted-not-tested.
 *
 * This witness walks the MEP-rich Terminal through BOTH rule sources and proves the LANDED routing
 * layer survives the TRM001 reconciliation byte-for-byte. Each test names the issue it proves:
 *   L1 LANDED-NONEMPTY — Terminal walked from ERP.db views produces real chainSegs > 0 (NOT 0==0;
 *                        the routing rows in ad_routing_measured carry through the rule_routing view).
 *   L2 SEG-EQUIV       — the FULL set of landed segments is identical between terminal_rules.db and
 *                        ERP.db: same count + same (from_guid,to_guid,from xyz,to xyz,gap,bound) — the
 *                        reconciliation lost nothing the Router needs. This is the F-WALK-1 assertion.
 *   L3 PLACE-EQUIV     — on Terminal too (not just residents), the GENERATED placement layer matches
 *                        (count + sorted coords) — drop-in holds for both layers on a MEP-rich building.
 *   L4 REAL-ENDPOINTS  — every ERP.db-sourced segment still joins two real elements_meta rows at their
 *                        real element_transforms position (≤1e-6) — drop-in did not silently fabricate.
 *
 * Run: NODE_PATH=~/bim-ootb/tests/node_modules node build/witness_disc_walk_erp_landed.js
 */
const path = require('path'), fs = require('fs');
const DWT = require(path.join(__dirname, '..', 'scripts', 'dw_tree.js'));   // the shipped walker and its rules, never this folder's older copy (MODELLER_MASTER §WITNESS-REPOINT)
const ROOT = path.resolve(__dirname, '..');
const DW = require(DWT.walker);

function loadSqlJs() {
  const cands = [
    path.join(ROOT, 'node_modules/sql.js'),
    path.join(process.env.HOME || '', 'bim-ootb/tests/node_modules/sql.js'),
    'sql.js',
  ];
  for (const c of cands) { try { return require(c); } catch (e) { /* next */ } }
  throw new Error('sql.js not found (set NODE_PATH=~/bim-ootb/tests/node_modules)');
}

const RULES_DB = DWT.rules('terminal_rules.db');
const ERP_DB = path.join(ROOT, 'library/disc_patterns.db');   // de-ERP: canonical pattern-store name (was library/ERP.db)
const MODELLER = path.join(process.env.HOME || '', 'bim-ootb/modeller');
const TERMINAL = path.join(MODELLER, 'Terminal_meta.db');
const DISCS = ['PLB', 'ACMV'];   // the disciplines Terminal actually routes (the LANDED layer)

const LOG = path.join(__dirname, 'witness_disc_walk_erp_landed.log');
let PASS = 0, FAIL = 0;
const LINES = [];
const say = (s) => { LINES.push(s); console.log(s); };
const ok = (c, m) => { (c ? PASS++ : FAIL++); say('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };

// canonical, order-independent signature of one landed segment (every field the Router produces)
function sigSeg(s) {
  return [s.disc, s.from_kind, s.to_kind, s.from_guid, s.to_guid,
    s.from.map(n => n.toFixed(6)).join(','), s.to.map(n => n.toFixed(6)).join(','),
    (+s.gap).toFixed(6), (+s.bound).toFixed(6)].join('|');
}
function sigSegs(segs) { return (segs || []).map(sigSeg).sort().join('\n'); }
function sigPlacements(pl) {
  return (pl || []).map(p =>
    [p.disc, p.ifc_class, p.storey, p.x.toFixed(6), p.y.toFixed(6), p.z.toFixed(6)].join(':')
  ).sort().join('|');
}

// walk every routed disc on Terminal under whichever rule DB is currently open; return {segs, placements}
function walkAll(tdb, tag) {
  let segs = [], placements = [];
  for (const d of DISCS) {
    // noHostBind: compare the RULE-SOURCE walk (rule_shim host-bind projection lives only in *_rules.db,
    // not the ERP.db TRM001 views — see witness_disc_walk_erp_equivalence). Landed routing is unaffected.
    const w = DW.dwWalk(d, tdb, 'Terminal/' + tag, { noHostBind: true });
    segs = segs.concat(w.chainSegs || []);
    placements = placements.concat(w.placements || []);
  }
  return { segs, placements };
}

(async () => {
  for (const [p, n] of [[RULES_DB, 'terminal_rules.db'], [ERP_DB, 'ERP.db'], [TERMINAL, 'Terminal_meta.db']]) {
    if (!fs.existsSync(p)) { console.error('FATAL: missing ' + n + ' (' + p + ')'); process.exit(1); }
  }
  const SQL = await loadSqlJs()();
  const rulesDb = new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB)));
  const erpDb = new SQL.Database(new Uint8Array(fs.readFileSync(ERP_DB)));
  const tdb = new SQL.Database(new Uint8Array(fs.readFileSync(TERMINAL)));

  say('=== W-TRM-WALK-LANDED — Terminal LANDED layer through ERP.db views (closes F-WALK-1) ===');

  // index Terminal geometry for the L4 real-endpoint oracle
  const elClass = new Map(), elPos = new Map();
  {
    const r = tdb.exec("SELECT m.guid, m.ifc_class, t.center_x, t.center_y, t.center_z " +
      "FROM elements_meta m JOIN element_transforms t ON m.guid=t.guid");
    if (r.length) r[0].values.forEach(v => { elClass.set(v[0], v[1]); elPos.set(v[0], [v[2], v[3], v[4]]); });
  }
  say('  §LANDED-ORACLE Terminal indexed elements=' + elClass.size);

  // walk Terminal under terminal_rules.db, then under ERP.db (TRM001 views)
  DW.dwOpen(rulesDb); const R = walkAll(tdb, 'rules');
  DW.dwOpen(erpDb);   const E = walkAll(tdb, 'erp');
  say('  §LANDED-WALK rules: segs=' + R.segs.length + ' placed=' + R.placements.length +
    ' | erp: segs=' + E.segs.length + ' placed=' + E.placements.length);

  // L1 — ERP.db-sourced walk produces REAL segments (defeats the 0==0 vacuity that hid F-WALK-1)
  ok(E.segs.length > 0,
    'L1 LANDED-NONEMPTY Terminal/ERP.db routes ' + E.segs.length + ' real segments (NOT 0==0; routing rows survive TRM001)');

  // L2 — the F-WALK-1 assertion: full landed segment set identical across the two rule sources
  const segEq = sigSegs(R.segs) === sigSegs(E.segs);
  ok(segEq && R.segs.length === E.segs.length,
    'L2 SEG-EQUIV ' + R.segs.length + ' landed segs identical rules≡erp (from_guid/to_guid/xyz/gap/bound)' +
    (segEq ? '' : ' — MISMATCH'));

  // L3 — the GENERATED placement layer also matches on a MEP-rich building
  const placeEq = sigPlacements(R.placements) === sigPlacements(E.placements);
  ok(placeEq && R.placements.length === E.placements.length,
    'L3 PLACE-EQUIV ' + R.placements.length + ' placements identical rules≡erp (count+coords)' + (placeEq ? '' : ' — MISMATCH'));

  // L4 — every ERP.db-sourced segment still lands on real geometry (drop-in fabricated nothing)
  let realBad = 0, posBad = 0;
  for (const s of E.segs) {
    if (elClass.get(s.from_guid) !== s.from_kind || elClass.get(s.to_guid) !== s.to_kind) { realBad++; continue; }
    const fp = elPos.get(s.from_guid), tp = elPos.get(s.to_guid);
    if (Math.hypot(fp[0] - s.from[0], fp[1] - s.from[1], fp[2] - s.from[2]) > 1e-6) { posBad++; continue; }
    if (Math.hypot(tp[0] - s.to[0], tp[1] - s.to[1], tp[2] - s.to[2]) > 1e-6) posBad++;
  }
  ok(realBad === 0 && posBad === 0,
    'L4 REAL-ENDPOINTS all ' + E.segs.length + ' ERP.db segs join real elements at real positions (classMismatch=' +
    realBad + ' posDrift=' + posBad + ')');

  rulesDb.close(); erpDb.close(); tdb.close();
  say('');
  say('=== RESULT: ' + PASS + ' PASS / ' + FAIL + ' FAIL ===');
  fs.writeFileSync(LOG, LINES.join('\n') + '\n');
  say('log -> ' + LOG);
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
