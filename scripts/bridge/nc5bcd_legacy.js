// §NC-5bcd legacy measurement (prompts/ERP_DEPTH_FILM.md §NC-5bcd): EUR sales invoice dated D1 + customer receipt dated D2 on the LOCAL pilot, with THROWAWAY Spot rate rows so
// R1 (invoice date) != R2 (receipt date). Variants: V1 gain (R2>R1), V2 loss (R2<R1), V3 control (R1==R2), V5 USD receipt against the EUR invoice.
// Reads, per variant, Fact_Acct of invoice (318) / payment (335) / allocation (735) on BOTH schemas straight from the pilot DB (rows, not folds) -> out/nc5bcd_legacy.json.
// Throwaway rates are inserted before and DELETED after each variant (and at start, in case a prior run crashed). Documents stay on the pilot (completed docs cannot be removed).
// READ THE §NC5BCD LINES.
'use strict';
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const { cfgFromEnv, query } = require('./ad_client');
const { createLink } = require('./legacy_link');
const C = require('./client_ctx').ctx;
const log = s => console.log(s);
const pg = sql => execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-tAF', '|', '-v', 'ON_ERROR_STOP=1', '-c', 'set search_path=adempiere;' + sql], { encoding: 'utf8' }).split('\n').filter(l => l && l !== 'SET').map(l => l.split('|'));
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const D1 = day(-5), D2 = day(0), EUR = 102, USD = 100, SPOT = 114, TAG = 'NC5BCD';
const cfg = cfgFromEnv(); cfg.login.OrgID = C.org; cfg.login.WarehouseID = C.wh;
const BP = C.customer, LOC = C.customerLoc;
const DESC = {
  inv: { composite: 'SyncOrder',
    header: { serviceType: 'BridgeCreateInvoice', table: 'C_Invoice', fields: { AD_Org_ID: { path: 'org' }, C_DocTypeTarget_ID: { const: C.dt.arInvoice }, C_BPartner_ID: { path: 'bp' }, C_BPartner_Location_ID: { path: 'loc' },
      M_PriceList_ID: { const: 103 }, IsSOTrx: { const: 'Y' }, DateInvoiced: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
    lines: { serviceType: 'BridgeCreateInvoiceLine', table: 'C_InvoiceLine', parent: 'C_Invoice_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
      fields: { AD_Org_ID: { path: 'org' }, AD_Client_ID: { const: C.client }, M_Product_ID: { path: 'product' }, QtyEntered: { path: 'qty' }, QtyInvoiced: { path: 'qty' } } },
    docAction: { serviceType: 'BridgeCompleteInvoice', table: 'C_Invoice', action: 'CO' } },
  pay: { composite: 'SyncOrder',
    header: { serviceType: 'BridgeCreatePayment', table: 'C_Payment', fields: { AD_Org_ID: { const: C.org }, C_DocType_ID: { const: C.dt.arReceipt }, C_BankAccount_ID: { const: C.bank }, C_BPartner_ID: { path: 'bp' },
      C_Invoice_ID: { path: 'invoice' }, C_Currency_ID: { path: 'cur' }, PayAmt: { path: 'amt' }, TenderType: { const: 'X' }, DateTrx: { path: 'date' }, DateAcct: { path: 'date' }, Description: { path: 'note' } } },
    docAction: { serviceType: 'BridgeCompletePayment', table: 'C_Payment', action: 'CO' } } };
// rate rows: EUR->USD multiply m, USD->EUR multiply 1/m, client 11 org 0, Spot; window W1 around D1 (not D2), W2 from D2 on. ValidFrom is later than the pilot's own 2000/2003 rows so these win the pick.
const rateRows = (m1, m2) => [[EUR, USD, m1, day(-9), day(-1)], [USD, EUR, 1 / m1, day(-9), day(-1)], [EUR, USD, m2, day(0), day(9)], [USD, EUR, 1 / m2, day(0), day(9)]];
let LIVE = [];
const cleanRates = () => { pg(`delete from c_conversion_rate where c_conversion_rate_id in (${LIVE.concat([0]).join(',')})`); LIVE = []; };   // no Description column on this table: ids are tracked
const putRates = (m1, m2) => { const ids = LIVE; for (const [f, t, m, a, b] of rateRows(m1, m2)) {
  const id = +pg("select nextidfunc((select ad_sequence_id from ad_sequence where name='C_Conversion_Rate')::int,'N'::varchar)")[0][0]; ids.push(id);
  pg(`insert into c_conversion_rate (c_conversion_rate_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,c_currency_id,c_currency_id_to,c_conversiontype_id,validfrom,validto,multiplyrate,dividerate) values (${id},11,0,'Y',now(),100,now(),100,${f},${t},${SPOT},'${a}','${b}',${m},${1 / m})`); } return ids; };
const facts = (tbl, id) => pg(`select c_acctschema_id,account_id,c_currency_id,round(amtsourcedr,2),round(amtsourcecr,2),round(amtacctdr,2),round(amtacctcr,2),description from fact_acct where ad_table_id=${tbl} and record_id=${id} order by c_acctschema_id,fact_acct_id`)
  .map(r => ({ schema: +r[0], account: +r[1], cur: +r[2], srcDr: +r[3], srcCr: +r[4], acctDr: +r[5], acctCr: +r[6], desc: r[7] }));
const wait = ms => new Promise(r => setTimeout(r, ms));
const factsPosted = async (tbl, id) => { for (let i = 0; i < 10; i++) { const f = facts(tbl, id); if (f.length) return f; await wait(1500); } return []; };
const VARIANTS = [{ k: 'V1gain', m1: 1.10, m2: 1.20, cur: EUR }, { k: 'V2loss', m1: 1.20, m2: 1.10, cur: EUR }, { k: 'V3same', m1: 1.10, m2: 1.10, cur: EUR }, { k: 'V5usdPay', m1: 1.10, m2: 1.20, cur: USD }];
(async () => {
  const out = { D1, D2, client: 11, variants: [] };
  let bytes = null;
  const link = await createLink({ cfg, persistence: { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } }, descriptors: DESC });
  const submit = async (n, p) => { const u = link.submit(n, p); await link.drain(); const s = link.store.get(u); return { ok: s.state === 'CONFIRMED', error: s.error, ids: link.store.idmap(u) }; };
  try {
    for (const v of VARIANTS) {
      putRates(v.m1, v.m2);
      const rec = { k: v.k, m1: v.m1, m2: v.m2, payCur: v.cur };
      const si = await submit('inv', { org: C.org, bp: BP, loc: LOC, date: D1 + ' 00:00:00', note: `${TAG} ${v.k}`, lines: [{ product: 137, qty: 100, org: C.org }] });
      if (!si.ok) { rec.invError = si.error; log(`§NC5BCD ${v.k} INVOICE REFUSED ${si.error}`); out.variants.push(rec); cleanRates(); continue; }
      const invId = si.ids.find(x => x.tbl === 'C_Invoice').server_id; rec.invoice = invId;
      const inv = (await query(cfg, 'QueryCInvoice', `C_Invoice_ID=${invId}`))[0];
      rec.invHdr = { cur: inv.C_Currency_ID, status: inv.DocStatus, grand: Number(inv.GrandTotal) };
      rec.invFacts = await factsPosted(318, invId);
      // pay the full invoice amount: in EUR = grand total; in USD (V5) = grand total x R2 (EUR->USD) so the payment is "the same value at today's rate"
      const amt = v.cur === EUR ? Number(inv.GrandTotal) : Math.round(Number(inv.GrandTotal) * v.m2 * 100) / 100;
      const sp = await submit('pay', { bp: BP, invoice: invId, cur: v.cur, amt, date: D2 + ' 00:00:00', note: `${TAG} ${v.k}` });
      if (!sp.ok) { rec.payError = sp.error; log(`§NC5BCD ${v.k} PAYMENT REFUSED ${sp.error}`); out.variants.push(rec); cleanRates(); continue; }
      const payId = sp.ids.find(x => x.tbl === 'C_Payment').server_id; rec.payment = payId;
      const p = (await query(cfg, 'QueryCPayment', `C_Payment_ID=${payId}`))[0];
      const al = await query(cfg, 'QueryCAllocationLine', `C_Payment_ID=${payId}`);
      rec.payHdr = { status: p.DocStatus, allocated: p.IsAllocated, amt };
      rec.allocLines = al.map(a => ({ hdr: a.C_AllocationHdr_ID, inv: a.C_Invoice_ID, amount: Number(a.Amount), writeoff: Number(a.WriteOffAmt), discount: Number(a.DiscountAmt) }));
      rec.payFacts = await factsPosted(335, payId);
      rec.allocFacts = rec.allocLines.length ? await factsPosted(735, rec.allocLines[0].hdr) : [];
      rec.allocHdr = rec.allocLines.length ? pg(`select c_currency_id,datetrx::date,dateacct::date,docstatus,approvalamt from c_allocationhdr where c_allocationhdr_id=${rec.allocLines[0].hdr}`)[0] : null;
      rec.invPaid = pg(`select ispaid from c_invoice where c_invoice_id=${invId}`)[0][0];
      log(`§NC5BCD ${v.k} inv=${invId} pay=${payId} alloc=${rec.allocLines.length} invFacts=${rec.invFacts.length} payFacts=${rec.payFacts.length} allocFacts=${rec.allocFacts.length} paid=${rec.invPaid}`);
      out.variants.push(rec);
      cleanRates();
    }
  } finally { cleanRates(); log('§NC5BCD throwaway rates deleted'); }
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out', 'nc5bcd_legacy.json'), JSON.stringify(out, null, 1));
  log('§NC5BCD DONE variants=' + out.variants.length);
})().catch(e => { try { cleanRates(); } catch (_) {} console.log('§NC5BCD CRASH ' + (e.stack || e)); process.exit(2); });
