#!/usr/bin/env node
/*
 * witness_disc_walk_erp_equivalence.js — W-TRM-WALK-EQUIV
 *
 * Proves §CONVERGENCE "the consume side is a drop-in, not a re-interpretation":
 * the SAME real disc_walker.js engine, pointed at the reconciled library/ERP.db
 * (via the TRM001 compatibility VIEWS rule_placement/rule_routing/rule_place_order/
 * rule_avoidance), walks a resident building IDENTICALLY to pointing it at the
 * mined build/terminal_rules.db. If equivalent, ERP.db is a faithful drop-in
 * rule source — the reconciliation lost nothing the walker needs.
 *
 * Each test names the issue it proves/disproves:
 *   E1 ROSTER-EQUIV   — disciplines() identical from ERP.db views vs terminal_rules.db
 *                       (the Outliner "Walk" roster is the same → no disc lost/added)
 *   E2 WALK-EQUIV     — per disc, dwWalk gives the SAME refused flag + placed count +
 *                       the SAME placement coordinates (sorted) on a resident building
 *   E3 ROUTER-EQUIV   — per disc, the Router chains are identical (IFC classes survived
 *                       the reconciliation: ad_routing_measured kept IfcPipeSegment etc.,
 *                       not the coarse ad_mep_pattern node tokens)
 *   E4 NONEMPTY       — at least one disc actually places (>0) so equivalence isn't vacuous
 *
 * Run: NODE_PATH=~/bim-ootb/tests/node_modules node build/witness_disc_walk_erp_equivalence.js
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
const BUILDING = ['SampleCastle', 'Duplex', 'SampleHouse']
  .map(k => ({ key: k, db: path.join(MODELLER, k + '_extracted.db') }))
  .find(r => fs.existsSync(r.db));

const LOG = path.join(__dirname, 'witness_disc_walk_erp_equivalence.log');
let PASS = 0, FAIL = 0;
const LINES = [];
const say = (s) => { LINES.push(s); console.log(s); };
const ok = (c, m) => { (c ? PASS++ : FAIL++); say('  ' + (c ? '✅' : '❌') + ' ' + m); return c; };

// canonical, order-independent signature of a walk result
function sigPlacements(pl) {
  return (pl || []).map(p =>
    [p.disc, p.ifc_class, p.storey, p.x.toFixed(6), p.y.toFixed(6), p.z.toFixed(6)].join(':')
  ).sort().join('|');
}
function sigChains(ch) {
  return (ch || []).map(c => [c.from, c.to, c.pattern, c.n_from, c.n_to].join(':')).sort().join('|');
}

(async () => {
  if (!BUILDING) { console.error('FATAL: no resident building DB found'); process.exit(1); }
  for (const [p, n] of [[RULES_DB, 'terminal_rules.db'], [ERP_DB, 'ERP.db']]) {
    if (!fs.existsSync(p)) { console.error('FATAL: missing ' + n); process.exit(1); }
  }
  const SQL = await loadSqlJs()();
  const rulesDb = new SQL.Database(new Uint8Array(fs.readFileSync(RULES_DB)));
  const erpDb = new SQL.Database(new Uint8Array(fs.readFileSync(ERP_DB)));
  const bdb = new SQL.Database(new Uint8Array(fs.readFileSync(BUILDING.db)));

  say('=== W-TRM-WALK-EQUIV — ERP.db (views) drop-in vs terminal_rules.db ===');
  say('building=' + BUILDING.key + '  erp=' + path.basename(ERP_DB));
  say('');

  // E1 roster equivalence
  DW.dwOpen(rulesDb); const rosterR = DW.disciplines().slice().sort();
  DW.dwOpen(erpDb);   const rosterE = DW.disciplines().slice().sort();
  ok(JSON.stringify(rosterR) === JSON.stringify(rosterE) && rosterR.length > 0,
    'E1 ROSTER-EQUIV rules=[' + rosterR.join(',') + '] erp=[' + rosterE.join(',') + ']');

  // E2/E3 per-disc walk equivalence
  const discs = rosterR.length ? rosterR : rosterE;
  let anyPlaced = 0, walkMismatch = 0, chainMismatch = 0;
  for (const d of discs) {
    // RULE-SOURCE equivalence: walk both with noHostBind. host-bind reads the rule_shim PROJECTION
    // (§SHIM-SELECT) which lives only in the *_rules.db, NOT in the ERP.db TRM001 compatibility views — so
    // default-on host-bind would diverge POSITIONS (counts still match). This witness tests that the mined
    // placement/routing RULES are equivalent drop-ins; the shim projection is a separate layer. (§DWG pattern.)
    DW.dwOpen(rulesDb); const wr = DW.dwWalk(d, bdb, BUILDING.key + '/rules', { noHostBind: true });
    DW.dwOpen(erpDb);   const we = DW.dwWalk(d, bdb, BUILDING.key + '/erp', { noHostBind: true });
    const sameRefuse = !!wr.refused === !!we.refused;
    const sameCount = (wr.placed || 0) === (we.placed || 0);
    const samePos = sigPlacements(wr.placements) === sigPlacements(we.placements);
    const sameChains = sigChains(wr.chains) === sigChains(we.chains);
    if (!(sameRefuse && sameCount && samePos)) walkMismatch++;
    if (!sameChains) chainMismatch++;
    anyPlaced += (wr.placed || 0);
    ok(sameRefuse && sameCount && samePos,
      'E2 WALK-EQUIV ' + d + ' refused=' + wr.refused + ' placed rules=' + (wr.placed || 0) +
      ' erp=' + (we.placed || 0) + (samePos ? ' pos≡' : ' POS≠'));
    ok(sameChains,
      'E3 ROUTER-EQUIV ' + d + ' chains rules=' + (wr.chains || []).length +
      ' erp=' + (we.chains || []).length + (sameChains ? ' ≡' : ' ≠'));
  }

  ok(anyPlaced > 0, 'E4 NONEMPTY total placed across disciplines = ' + anyPlaced + ' (>0)');

  say('');
  say('=== RESULT: ' + PASS + ' PASS / ' + FAIL + ' FAIL ===  (walkMismatch=' +
    walkMismatch + ' chainMismatch=' + chainMismatch + ')');
  fs.writeFileSync(LOG, LINES.join('\n') + '\n');
  say('log -> ' + LOG);
  process.exit(FAIL ? 1 : 0);
})();
