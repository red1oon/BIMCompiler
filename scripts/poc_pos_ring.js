#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (POS_LENS_SESSION.md / POS_ADDON_SPEC.md §P-1). Read the log after every run.
// poc_pos_ring.js — W-POS-RING: the POS surface renders FROM the dictionary and every ringed line
//   traces to a c_poskey→m_product→m_productprice row.
//
// ISSUES IT PROVES (named, per "tests expose issues"):
//   1. The key grid is DATA, not code — every product key of the station's c_poskeylayout resolves to a
//      real m_product + a price row of the station's pricelist VERSION (zero per-product code; a key
//      without a master row would be an invented tile).
//   2. ringLine returns the SEALED master price verbatim ("you key the master, never the sale" —
//      POS_LENS_SESSION §keying-reconciliation): priceactual == m_productprice.pricestd to the cent,
//      linenetamt == qty × pricestd via BigDecimal HALF_UP (never raw JS Number).
//   3. §FALSIFIER (the spec's): ringing a REAL product ABSENT from the price list must REFUSE —
//      a POS that fills a missing price with anything is inventing money.
//
// NON-INVENT: station/keys/prices = build/erp/ad_seed_fullwidth.db verbatim (GardenWorld c_pos 100,
//   keylayout 100, pricelist 101 → version 104 "Standard 2003"). No Date.now/Math.random.
// Implementing docs/POS_ADDON_SPEC.md §P-1 — Witness: W-POS-RING
// Run: bash build/erp/run_witness.sh scripts/poc_pos_ring.js   — then READ the log.
'use strict';
var path = require('path');
var Database = require('better-sqlite3');
var POS = require(path.join(__dirname, '..', 'build', 'erp', 'pos_core.js'));

var db = new Database(path.join(__dirname, '..', 'build', 'erp', 'ad_seed_fullwidth.db'), { readonly: true });
var fails = 0;
function verdict(ok, label, detail) { if (!ok) fails++; console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : '')); }
// the FULL-WIDTH seed declares iDempiere-case column names (PriceStd, Name, …) — better-sqlite3 returns
// them verbatim. Lowercase row keys at the host boundary (the _b3 sql.js shim precedent, B-2/IDMP_FULLWIDTH).
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }
function lcAll(rows) { return rows.map(lc); }

// ── the station + its dictionary (EXTRACTED, the lens does the same reads) ──
var pos = lc(db.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
var plv = lc(db.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
var keys = lcAll(db.prepare('SELECT c_poskey_id, m_product_id FROM c_poskey WHERE c_poskeylayout_id=? AND m_product_id IS NOT NULL ORDER BY c_poskey_id').all(pos.c_poskeylayout_id));
var priceStmt = db.prepare('SELECT pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?');
var nameStmt = db.prepare('SELECT name FROM m_product WHERE m_product_id=?');
function nameOf(pid) { var r = lc(nameStmt.get(pid)); return r ? r.name : ('#' + pid); }
var ctx = { pos: pos, priceOf: function (pid) { return lc(priceStmt.get(plv.v, pid)) || null; } };

console.log('═══ W-POS-RING — POS grid from the dictionary; ringed lines trace to sealed master prices ═══');
console.log('    station=' + pos.name + '(c_pos ' + pos.c_pos_id + ') layout=' + pos.c_poskeylayout_id +
  ' pricelist=' + pos.m_pricelist_id + ' version=' + plv.v + '\n');

// ── 1. every key tile resolves: product exists + priced in the station version ──
var unresolved = keys.filter(function (k) { return !lc(nameStmt.get(k.m_product_id)) || !ctx.priceOf(k.m_product_id); });
verdict(keys.length > 0 && unresolved.length === 0,
  'all ' + keys.length + ' product keys of layout ' + pos.c_poskeylayout_id + ' resolve to m_product + m_productprice(version ' + plv.v + ')',
  'unresolved=' + unresolved.length);
console.log('§POS-IMPORT source=dictionary:c_poskey layout=' + pos.c_poskeylayout_id + ' products=' + keys.length +
  ' priced=' + (keys.length - unresolved.length) + ' → catalog tiles=' + keys.length + ' handAuthored=0');

// ── 2. ring every tile ×1: priceactual == the db row to the cent, linenetamt = qty×price HALF_UP ──
var priceDrift = 0;
keys.forEach(function (k) {
  var l = POS.ringLine(ctx, k.m_product_id, 1);
  var dbp = lc(priceStmt.get(plv.v, k.m_product_id)).pricestd;
  var want = (Math.round(Number(dbp) * 100) / 100).toFixed(2);
  if (!l.ok || l.priceactual !== want || l.linenetamt !== want) priceDrift++;
});
verdict(priceDrift === 0, 'ring every tile ×1 → priceactual == m_productprice.pricestd verbatim (BigDecimal, to the cent)', 'drift=' + priceDrift + '/' + keys.length);

// a multi-qty line: qty×price exact (product 124 "Rose Bush" pricestd 57.00 → ×3 = 171.00)
var l3 = POS.ringLine(ctx, 124, 3);
verdict(l3.ok && l3.linenetamt === '171.00', 'qty fold: ring ' + nameOf(124) + ' ×3 → linenetamt 171.00 (57.00×3, HALF_UP)', 'got=' + l3.linenetamt);
console.log('§POS ring product=124 qty=3 price=' + l3.priceactual + ' linenetamt=' + l3.linenetamt + ' source=m_productprice(v' + plv.v + ')');

// cart total = BigDecimal fold of sealed line amounts
var cart = [POS.ringLine(ctx, keys[0].m_product_id, 2), l3];
console.log('§POS-CART lines=' + cart.length + ' total=' + POS.cartTotal(cart) + ' (display fold, BigDecimal)');

// ── 3. §FALSIFIER: a REAL product with NO price row in the version must REFUSE ──
var unpriced = lc(db.prepare("SELECT m_product_id, name FROM m_product WHERE m_product_id NOT IN (SELECT m_product_id FROM m_productprice WHERE m_pricelist_version_id=?) AND isactive='Y' ORDER BY m_product_id LIMIT 1").get(plv.v));
var ref = POS.ringLine(ctx, unpriced.m_product_id, 1);
verdict(ref.ok === false && ref.reason === 'no-price',
  '§FALSIFIER ring ' + unpriced.name + '(' + unpriced.m_product_id + ') — absent from version ' + plv.v + ' → REFUSED (no invented price)',
  'reason=' + ref.reason);
console.log('§FALSIFIER pos=ring product=' + unpriced.m_product_id + ' price-row=absent → ok=' + ref.ok + ' reason=' + ref.reason + ' (must refuse)');

// qty: legacy accepts 0 and negatives (prompts/SQLiteIDEMPIERE.md §47, pilot S14a/b/c — MOrderLine.beforeSave has no sign check); only a non-number refuses.
// (Before F13 this witness asserted "qty=0 refused" — a rule legacy does not have; changed WITH that evidence, decision record §47.1.)
var rq = POS.ringLine(ctx, 124, 0);
verdict(rq.ok === true && rq.linenetamt === '0.00', 'qty=0 rings with LineNetAmt 0.00 (legacy S14c completes a zero line)', 'ok=' + rq.ok + ' linenetamt=' + rq.linenetamt);
var rn = POS.ringLine(ctx, 124, 'x');
verdict(rn.ok === false && rn.reason === 'bad-qty', '§FALSIFIER non-numeric qty refused', 'reason=' + rn.reason);

console.log('\n' + (fails === 0 ? '🟢 W-POS-RING PASS' : '🔴 W-POS-RING FAIL (' + fails + ')') +
  ' — the POS catalog is the dictionary (c_poskey→m_product→m_productprice), prices are the sealed master to the cent, and an unpriced product refuses to ring.');
db.close();
process.exit(fails === 0 ? 0 : 1);
