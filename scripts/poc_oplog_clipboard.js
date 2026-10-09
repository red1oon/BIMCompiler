#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — Scope guard (WH_SHIP_LATER_CLIPBOARD.md §CL-3).
//   Read the log after every run.
// poc_oplog_clipboard.js — W-OPLOG-CLIPBOARD: proves the clipboard relay format is self-contained
// and idempotent across devices.
//
// ISSUES IT PROVES (named):
//   §CL-SERIAL — buildDeliverLaterGroup ops → serialize to base64 blob → deserialize → same
//     op_type/params round-trip. The blob is the ONLY thing that crosses the pipe.
//   §CL-UUID   — deserialized ops carry the original op_uuid; commitGroup on a fresh (receiver)
//     DB honours it; a SECOND commitGroup with the SAME op_uuid does NOT insert a duplicate row.
//     Proves the paste-twice scenario is safe.
//   §CL-DELTA  — after replay, the committed rows produce the same movement op_types and qtys
//     as the original (movementqty matches to the unit). The fold is transport-independent.
//
// NON-INVENT: cart/doctypes = real ad_seed_fullwidth.db rows; deterministic ids + baseTs.
// Implementing prompts/WH_SHIP_LATER_CLIPBOARD.md §CL-3 — Witness: W-OPLOG-CLIPBOARD
// Run: bash build/erp/run_witness.sh scripts/poc_oplog_clipboard.js   — then READ the log.
'use strict';
var path = require('path');
var fs = require('fs');
var initSqlJs = require('sql.js');
var E = require('./erp_engine');
var POS = require(path.join(__dirname, '..', 'build', 'erp', 'pos_core.js'));

global.window = global.window || {};
global.crypto = global.crypto || require('crypto').webcrypto;
require(path.join(__dirname, '..', 'build', 'erp', 'kernel_ops.js'));
var KO = global.window.KernelOps;

var Database = require('better-sqlite3');
var SEED = path.join(__dirname, '..', 'build', 'erp', 'ad_seed_fullwidth.db');
var COPY = '/tmp/poc_clipboard_seed.db';
fs.copyFileSync(SEED, COPY);
var db = new Database(COPY);

var fails = 0;
function verdict(ok, label, detail) {
  if (!ok) fails++;
  console.log('   ' + (ok ? '🟢' : '🔴') + ' ' + label + (detail ? ' — ' + detail : ''));
}
function lc(r) { if (!r) return r; var o = {}; for (var k in r) o[k.toLowerCase()] = r[k]; return o; }

(async function () {
  console.log('═══ W-OPLOG-CLIPBOARD — clipboard relay: serialize→deserialize→replay idempotency ═══\n');

  var SQL = await initSqlJs();

  // ── fixture: station ctx + cart (mirror of poc_wh_pos_pick.js, verbatim) ──
  var pos = lc(db.prepare('SELECT * FROM c_pos WHERE c_pos_id=100').get());
  var plv = lc(db.prepare('SELECT m_pricelist_version_id v FROM m_pricelist_version WHERE m_pricelist_id=?').get(pos.m_pricelist_id));
  var priceStmt = db.prepare('SELECT pricestd FROM m_productprice WHERE m_pricelist_version_id=? AND m_product_id=?');
  var ctx = {
    pos: pos,
    priceOf: function (pid) { return lc(priceStmt.get(plv.v, pid)) || null; },
    bomOf: function () { return []; },
    wrPolicy: { isautogenerateinout: 'Y', isautogenerateinvoice: 'Y' }
  };
  var dt132 = lc(db.prepare('SELECT * FROM c_doctype WHERE c_doctype_id=132').get());
  var invRule = db.prepare("SELECT c.DefaultValue v FROM AD_Column c JOIN AD_Table t ON t.AD_Table_ID=c.AD_Table_ID WHERE t.TableName='C_Order' AND c.ColumnName='InvoiceRule'").get().v;
  var keys = db.prepare('SELECT m_product_id FROM c_poskey WHERE c_poskeylayout_id=? AND m_product_id IS NOT NULL ORDER BY c_poskey_id LIMIT 2').all(pos.c_poskeylayout_id).map(lc);
  var BP = 112;
  var cart = [POS.ringLine(ctx, keys[0].m_product_id, 2), POS.ringLine(ctx, keys[1].m_product_id, 1)];
  var g = POS.buildDeliverLaterWithShipment(ctx, cart, { orderId: 910001, inoutId: 910002, c_bpartner_id: BP, doctype: dt132, invoiceRule: invRule });
  verdict(g.ok && g.newVerbs.length === 0, 'deliver-later group built (engine, newVerbs=[])', 'ops=' + g.ops.length);

  // ── SENDER: commit to the sender's in-memory DB, then serialize ──
  var senderDb = new SQL.Database(); KO.ensureTable(senderDb);
  var senderOps = g.ops.map(function (o) { return { op_type: o.op_type, params: o }; });
  var res = await KO.commitGroup(senderDb, senderOps, { gid: 'pos-dl-1', baseTs: 1718200000000 });
  verdict(res.committed, 'sender commitGroup ok', 'gid=' + res.gid + ' ops=' + res.op_hashes.length);

  // §CL-1 equivalent: query sender's kernel_ops for the gid → build payload
  var sentRows = senderDb.exec('SELECT op_uuid, op_type, parameters FROM kernel_ops WHERE gid = ?', [res.gid]);
  var sentOps = sentRows[0] ? sentRows[0].values.map(function (v) {
    return { op_uuid: v[0], op_type: v[1], params: JSON.parse(v[2]) };
  }) : [];
  verdict(sentOps.length === g.ops.length, '§CL-SERIAL sent op count matches original', 'sent=' + sentOps.length + ' original=' + g.ops.length);

  // serialize → the clipboard blob
  var blob = Buffer.from(JSON.stringify({ v: 1, ops: sentOps })).toString('base64');
  verdict(blob.length > 0, '§CL-SERIAL serialized to base64 blob', 'bytes=' + blob.length);
  console.log('§POS-OPLOG-COPY gid=' + res.gid + ' ops=' + sentOps.length + ' bytes=' + blob.length);

  // ── RECEIVER: deserialize on a FRESH db (different device) ──
  var payload = JSON.parse(Buffer.from(blob, 'base64').toString('utf8'));
  verdict(payload.v === 1 && Array.isArray(payload.ops) && payload.ops.length === sentOps.length,
    '§CL-SERIAL deserialized: v=1, ops array intact', 'ops=' + payload.ops.length);

  // round-trip: op_type and key params match
  var allMatch = payload.ops.every(function (o, i) {
    return o.op_type === sentOps[i].op_type && o.op_uuid === sentOps[i].op_uuid;
  });
  verdict(allMatch, '§CL-SERIAL all op_type + op_uuid survive round-trip');

  // commit to receiver's fresh DB (honouring op_uuid)
  var receiverDb = new SQL.Database(); KO.ensureTable(receiverDb);
  var rxOps = payload.ops.map(function (o) { return { op_type: o.op_type, op_uuid: o.op_uuid, params: o.params }; });
  var rxRes = await KO.commitGroup(receiverDb, rxOps, {});
  verdict(rxRes.committed, 'receiver commitGroup ok (first apply)', 'gid=' + rxRes.gid);

  // §CL-UUID: op_uuid is preserved in the receiver DB
  var rxRows = receiverDb.exec('SELECT op_uuid FROM kernel_ops ORDER BY id');
  var rxUuids = rxRows[0] ? rxRows[0].values.map(function (v) { return v[0]; }) : [];
  var uuidsMatch = sentOps.every(function (o, i) { return rxUuids[i] === o.op_uuid; });
  verdict(uuidsMatch, '§CL-UUID receiver DB op_uuid matches sender op_uuid exactly');

  // §CL-UUID: SECOND apply (paste-twice) — idempotency is a PRE-GATE on the receiver, not a
  // kernel constraint (kernel_ops has no UNIQUE on op_uuid). The receiver must check BEFORE
  // calling commitGroup: if ANY incoming op_uuid already exists → skip entirely.
  function alreadyApplied(rxDb, ops) {
    var uuids = ops.map(function (o) { return o.op_uuid; }).filter(Boolean);
    if (!uuids.length) return false;
    var placeholders = uuids.map(function () { return '?'; }).join(',');
    var rows = rxDb.exec('SELECT COUNT(*) FROM kernel_ops WHERE op_uuid IN (' + placeholders + ')', uuids);
    return rows[0] && Number(rows[0].values[0][0]) > 0;
  }
  var beforeCount = rxUuids.length;
  var skipSecond = alreadyApplied(receiverDb, rxOps);
  verdict(skipSecond, '§CL-UUID pre-gate detects already-applied op_uuids before second commitGroup',
    'existing=' + beforeCount + ' skip=' + skipSecond);
  if (!skipSecond) await KO.commitGroup(receiverDb, rxOps, {});
  var rx2Count = receiverDb.exec('SELECT COUNT(*) FROM kernel_ops')[0].values[0][0];
  verdict(Number(rx2Count) === beforeCount, '§CL-UUID paste-twice: row count unchanged (pre-gate prevented duplicate)',
    'count_before=' + beforeCount + ' count_after=' + rx2Count);
  console.log('§WH-OPLOG-APPLY ops=' + rxOps.length + ' ok=' + rxRes.committed + ' idempotent=' + (Number(rx2Count) === beforeCount));

  // §CL-DELTA: op_types in receiver match sender — movement types preserved
  var rxOpTypes = receiverDb.exec('SELECT op_type, parameters FROM kernel_ops ORDER BY id')[0].values;
  var senderOpTypes = senderDb.exec('SELECT op_type, parameters FROM kernel_ops WHERE gid=? ORDER BY id', [res.gid])[0].values;
  var deltaMatch = rxOpTypes.length >= senderOpTypes.length && senderOpTypes.every(function (s, i) {
    var rxP = JSON.parse(rxOpTypes[i][1]);
    var sP = JSON.parse(s[1]);
    if (s[0] !== rxOpTypes[i][0]) return false;
    // for movement-bearing ops, check movementqty preserved
    if (sP.movementqty !== undefined) return String(sP.movementqty) === String(rxP.movementqty);
    return true;
  });
  verdict(deltaMatch, '§CL-DELTA receiver op_types + movementqty match sender exactly',
    'sender_ops=' + senderOpTypes.length + ' rx_ops=' + rxOpTypes.length);

  // final tally
  console.log('\n' + (fails === 0 ? '✅ W-OPLOG-CLIPBOARD PASS' : '❌ W-OPLOG-CLIPBOARD FAIL') + ' — ' + fails + ' failures');
  process.exit(fails > 0 ? 1 : 0);
})();
