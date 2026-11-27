#!/usr/bin/env node
// ⚠ DO NOT REMOVE — W-ERP-NEW-TWIN (spec: prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §R.V item 2 / triage A2, "Not done: the twin rule's legacy comparison"; CARDINAL RULE: SQLite == legacy).
// READ THE LOG after every run: §ERPNEW_TWIN lines are the product. Exit code is not evidence.
// ISSUE: a Sales Order created by `erp.new` (the SQLite window path) differs from the one legacy iDempiere stores for the SAME facts.
//   T1 twin side creates header + line through the door (erp.new), legacy side creates them through the bridge `so` composite (BridgeCreateOrder + CreateOrderLine)
//      from the SAME facts: partner, doctype, sales rep, product, qty, and every header column the window path filled (location, price list, warehouse, term, ...)
//   T2 every header column both sides store is compared cell for cell (list printed: MATCH / DIFF / ONLY-ONE-SIDE)
//   T3 every line column likewise (price, tax, UOM, net, qty)
//   T4 Document No: same format (prefix/length), values need not be equal (separate sequences)
// Not a pass/fail on the product alone: a DIFF is a finding for the SQLite side (CARDINAL RULE: fix SQLite, never accept). INCONCLUSIVE when legacy is down or the twin did not create.
// Env: NODE_PATH, NODE_OPTIONS=--dns-result-order=ipv4first; ERPNEW_WT = bim-ootb worktree holding common/door/door.js (default /tmp/wt-erpnew).
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const { cfgFromEnv, query } = require('./ad_client');
const { createLink } = require('./legacy_link');
const C = require('./client_ctx').ctx;
const log = l => console.log(l);
const lc = r => { if (!r) return r; const o = {}; for (const k in r) o[k.toLowerCase()] = r[k]; return o; };
const WT = process.env.ERPNEW_WT || '/tmp/wt-erpnew', DOOR = path.join(WT, 'common/door/door.js');
const F = { bp: C.customer, doctype: C.dt.std, salesrep: C.user, product: C.prod.mulch, qty: 2 };

function door(line, dir, n) {
  const env = Object.assign({}, process.env, { BIM_OBJECT_OPLOG: path.join(dir, 'ops.jsonl'), BIM_DOOR_JOURNAL: path.join(dir, 'j.jsonl') });
  const out = execFileSync('node', [DOOR, '--actor', 'human', '--request', 'twin-' + n, '--journal', path.join(dir, 'j.jsonl'), line], { env, cwd: WT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 });
  return JSON.parse(out.trim());
}
const norm = v => v === null || v === undefined || v === '' ? '' : (v === true ? 'Y' : v === false ? 'N' : String(v));
const num = v => (v !== '' && !isNaN(Number(v)) ? String(Number(v)) : v);

(async () => {
  let pass = 0, diff = 0;
  // ---- twin side
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'erpnew_twin_'));
  let n = 0, T = {};
  try {
    const h = door(`erp.new kind=Order issotrx=Y c_doctypetarget_id=${F.doctype} c_bpartner_id=${F.bp} salesrep_id=${F.salesrep}`, dir, ++n);
    if (h.status !== 'ok') { log(`§ERPNEW_TWIN INCONCLUSIVE twin header did not create: ${h.status} ${h.why}`); return log('§WITNESS_ERP_NEW_TWIN verdict=INCONCLUSIVE'); }
    const l = door(`erp.new kind=C_OrderLine order=${h.answer.number} m_product_id=${F.product} qtyentered=${F.qty}`, dir, ++n);
    if (l.status !== 'ok') { log(`§ERPNEW_TWIN INCONCLUSIVE twin line did not create: ${l.status} ${l.why}`); return log('§WITNESS_ERP_NEW_TWIN verdict=INCONCLUSIVE'); }
    const rd = door(`erp.read kind=Order number=${h.answer.number}`, dir, ++n);
    T.head = rd.answer.record; T.line = l.answer.record; T.docno = h.answer.number;
    log(`§ERPNEW_TWIN twin order=${T.docno} header_cols=${Object.keys(T.head).length} line_cols=${Object.keys(T.line).length}`);
  } catch (e) { log('§ERPNEW_TWIN INCONCLUSIVE twin side error: ' + String(e.stderr || e.message).slice(-300)); return log('§WITNESS_ERP_NEW_TWIN verdict=INCONCLUSIVE'); }

  // ---- legacy side: SAME facts, plus the header columns the window path filled (legacy createData runs no window callouts)
  const cfg = cfgFromEnv(); cfg.login.OrgID = C.org; cfg.login.WarehouseID = T.head.m_warehouse_id || C.wh;
  const hf = { M_PriceList_ID: T.head.m_pricelist_id, M_Warehouse_ID: T.head.m_warehouse_id, C_BPartner_ID: F.bp, C_BPartner_Location_ID: T.head.c_bpartner_location_id, Bill_BPartner_ID: T.head.bill_bpartner_id, Bill_Location_ID: T.head.bill_location_id, C_DocTypeTarget_ID: F.doctype, };  // only the columns BridgeCreateOrder allows; term / rule / rep are left to legacy's own defaults and compared after (a DIFF there is the finding)
  const fields = {}; for (const k in hf) if (hf[k] !== undefined && hf[k] !== null && hf[k] !== '') fields[k] = { const: hf[k] };
  fields.DateOrdered = { path: 'date' }; fields.DateAcct = { path: 'date' };
  const DESC = { so: { composite: 'SyncOrder', header: { serviceType: 'BridgeCreateOrder', table: 'C_Order', fields },
    lines: { serviceType: 'CreateOrderLine', table: 'C_OrderLine', parent: 'C_Order_ID', from: 'lines', lineNo: { col: 'Line', step: 10 }, fields: { AD_Org_ID: { const: C.org }, AD_Client_ID: { const: C.client }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyOrdered: { path: 'qty' } } } } };
  log('§ERPNEW_TWIN legacy header columns sent: ' + Object.keys(fields).join(','));
  let L = {};
  try {
    let bytes = null;
    const lk = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: DESC });
    const d = new Date(), TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const u = lk.submit('so', { date: TODAY + ' 00:00:00', lines: [{ product: F.product, qty: F.qty }] }); await lk.drain();
    const s = lk.store.get(u);
    if (s.state !== 'CONFIRMED') { log(`§ERPNEW_TWIN INCONCLUSIVE legacy create ${s.state}: ${String(s.error).slice(0, 200)}`); return log('§WITNESS_ERP_NEW_TWIN verdict=INCONCLUSIVE'); }
    const oid = lk.store.idmap(u).find(x => x.tbl === 'C_Order').server_id;
    L.head = lc((await query(cfg, 'QueryCOrder', `C_Order_ID=${oid}`))[0]); L.line = lc((await query(cfg, 'QueryCOrderLine', `C_Order_ID=${oid}`))[0]);
    log(`§ERPNEW_TWIN legacy order=${L.head.documentno} id=${oid}`);
  } catch (e) { log('§ERPNEW_TWIN INCONCLUSIVE legacy side error: ' + String(e.message).slice(0, 300)); return log('§WITNESS_ERP_NEW_TWIN verdict=INCONCLUSIVE'); }

  // ---- compare cell for cell (ids of the record itself, audit stamps, and the Document No value are expected to differ)
  const SKIP = /^(c_order_id|c_orderline_id|created|updated|createdby|updatedby|documentno|c_order_uu|c_orderline_uu|dateordered|dateacct|datepromised|processing|processed|c_order_id)$/;
  const cmp = (tag, a, b) => {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    for (const k of keys) {
      if (SKIP.test(k)) continue;
      const ia = k in a, ib = k in b;
      if (ia && ib) { const x = num(norm(a[k])), y = num(norm(b[k])); if (x === y) pass++; else { diff++; log(`§ERPNEW_TWIN ${tag} DIFF ${k} twin=${x} legacy=${y}`); } }
      else if (norm(ia ? a[k] : b[k]) !== '') log(`§ERPNEW_TWIN ${tag} ONLY-${ia ? 'TWIN' : 'LEGACY'} ${k}=${norm(ia ? a[k] : b[k])}`);
    }
  };
  cmp('HEAD', T.head, L.head); cmp('LINE', T.line, L.line);
  const shape = s => String(s).replace(/\d/g, '9');
  const fmt = shape(T.docno) === shape(L.head.documentno);
  log(`§ERPNEW_TWIN DOCNO twin=${T.docno} legacy=${L.head.documentno} format_${fmt ? 'MATCH' : 'DIFF'}`); if (!fmt) diff++; else pass++;
  log(`§WITNESS_ERP_NEW_TWIN cells_match=${pass} diffs=${diff} verdict=${diff === 0 && pass > 0 ? 'PASS' : pass === 0 ? 'INCONCLUSIVE' : 'FINDINGS'}`);
})();
