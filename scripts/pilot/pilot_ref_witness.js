// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot §1; read the log after every run.
// pilot_ref_witness.js — §PILOT-REF: server up on WS_BASE, ADInterface login works (a real doc-action call reaches the model layer),
// row counts per core table of the DB the server points at, bundles ACTIVE count (OSGi console not queried: INCONCLUSIVE for plugins unless PILOT_BUNDLES given).
'use strict';
const cfg = require('./pilot_cfg'), R = require('./pilot_ref');
(async () => {
  const web = await fetch(cfg.WS_BASE + '/webui/').then(r => r.status).catch(e => 'DOWN ' + e.message);
  const r = await R.docAction('C_Order', 99999999, 'CO');   // login + type access + model lookup; expects "No Record"
  const loginOk = /No Record/.test(r.error || '');
  console.log('§PILOT-REF webui=' + web + ' base=' + cfg.WS_BASE + ' db=' + cfg.PG_DB + ' client=' + cfg.CLIENT_ID + ' adinterfaceLogin=' + (loginOk ? 'OK' : 'FAIL(' + r.error + ')'));
  const tabs = ['c_order', 'c_orderline', 'c_invoice', 'c_invoiceline', 'm_inout', 'm_inoutline', 'c_payment', 'c_allocationhdr', 'gl_journal', 'fact_acct', 'm_storageonhand', 'm_transaction', 'm_costdetail', 'c_bpartner', 'm_product', 'ad_pinstance', 'ad_wf_process'];
  const c = tabs.map(t => t + '=' + cfg.psql(`select count(*) from ${t}` + (t === 'ad_pinstance' ? '' : ` where ad_client_id=${cfg.CLIENT_ID}`))[0][0]);
  console.log('§PILOT-REF rowcounts ' + c.join(' '));
  console.log('§PILOT-REF plugins INCONCLUSIVE (not enumerated; GardenWorld stock build has no customer plugins; set via OSGi console ss when a customer build is stood up)');
  process.exit(loginOk ? 0 : 1);
})();
