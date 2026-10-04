// ⚠ DO NOT REMOVE — scope: W-CP-SUPPORT-ORACLE fixtures (prompts/ERP_IDEMPIERE_UX_PARITY.md §CP). Creates DRAFT orders in the
// PILOT DB (idempiere_pilot only, via iDempiere's own ADInterface = PO.save) whose lines the support witness drives through
// real callouts. Idempotent: an order whose Description already carries the cp_ tag is reused. Read the log after every run.
'use strict';
const cfg = require('./pilot_cfg'), ref = require('./pilot_ref');
if (cfg.PG_DB === 'idempiere') { console.log('§CP-FIX REFUSED: never write DB idempiere'); process.exit(1); }
const FIX = [
  { tag: 'cp_support_po_pl102', f: { AD_Org_ID: 11, C_DocTypeTarget_ID: 126, IsSOTrx: 'N', DateOrdered: '2006-12-15', DateAcct: '2006-12-15', DatePromised: '2006-12-20',
    C_BPartner_ID: 120, C_BPartner_Location_ID: 114, Bill_BPartner_ID: 120, Bill_Location_ID: 114, M_Warehouse_ID: 103, M_PriceList_ID: 102, C_Currency_ID: 100,
    C_PaymentTerm_ID: 107, PaymentRule: 'P', InvoiceRule: 'D', DeliveryRule: 'A', DeliveryViaRule: 'P', FreightCostRule: 'I', PriorityRule: '5', SalesRep_ID: 101 } },
  { tag: 'cp_support_so_pl103_pickup', f: { AD_Org_ID: 11, C_DocTypeTarget_ID: 132, IsSOTrx: 'Y', DateOrdered: '2003-02-15', DateAcct: '2003-02-15', DatePromised: '2003-02-20',
    C_BPartner_ID: 120, C_BPartner_Location_ID: 114, Bill_BPartner_ID: 120, Bill_Location_ID: 114, M_Warehouse_ID: 103, M_PriceList_ID: 103, C_Currency_ID: 102,
    C_PaymentTerm_ID: 106, PaymentRule: 'P', InvoiceRule: 'D', DeliveryRule: 'A', DeliveryViaRule: 'P', FreightCostRule: 'I', PriorityRule: '5', SalesRep_ID: 101 } },
  { tag: 'cp_support_so_pl101_bp118', f: { AD_Org_ID: 11, C_DocTypeTarget_ID: 132, IsSOTrx: 'Y', DateOrdered: '2003-02-15', DateAcct: '2003-02-15', DatePromised: '2003-02-20',
    C_BPartner_ID: 118, C_BPartner_Location_ID: 113, Bill_BPartner_ID: 118, Bill_Location_ID: 113, M_Warehouse_ID: 103, M_PriceList_ID: 101, C_Currency_ID: 100,
    C_PaymentTerm_ID: 106, PaymentRule: 'P', InvoiceRule: 'D', DeliveryRule: 'A', DeliveryViaRule: 'D', FreightCostRule: 'I', PriorityRule: '5', SalesRep_ID: 101 } }
];
(async () => {
  for (const x of FIX) {
    const ex = cfg.psql("select c_order_id from c_order where description='" + x.tag + "' and processed='N'");
    if (ex.length) { console.log('§CP-FIX ' + x.tag + ' reuse c_order_id=' + ex[0][0]); continue; }
    const r = await ref.create('C_Order', Object.assign({ Description: x.tag }, x.f));
    console.log('§CP-FIX ' + x.tag + ' create ok=' + r.ok + ' id=' + r.id + (r.error ? ' error=' + r.error : ''));
  }
})();
