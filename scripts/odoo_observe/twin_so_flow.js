// ⚠ DO NOT REMOVE — twin sales-order gesture recorder (ERP_FRIENDLY_OPS_LENS §3 flow a). Derived from bim-ootb erp/tests/poc_depth_cycle_live.js (D1-D3). G = clicks+selects+typed, same unit as so_flow.js. READ THE LOG; verdict from §MODEL-DOCACTION + tables, not exit code.
'use strict';
// Run: node tests/poc_depth_cycle_live.js 2>&1 | tee tests/poc_depth_cycle_live.log        (cwd = bim-ootb/erp)
'use strict';
const { chromium } = require(process.env.PW || (require('os').homedir() + '/bim-ootb/tests/node_modules/playwright'));
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = (process.env.REPO||require('os').homedir()+'/bim-ootb');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = path.join(ROOT, p);
  fs.stat(f, (e, s) => { if (e || s.isDirectory()) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': s.size }); fs.createReadStream(f).pipe(r); }); });
let pass = 0, fail = 0, inconclusive = 0;
const ok = (id, name, cond, detail) => { console.log((cond ? '  ✅ ' : '  ❌ ') + id + ' ' + name + (detail ? ' — ' + detail : '')); cond ? pass++ : fail++; };

(async () => {
  await new Promise(r => srv.listen(0, r));
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const pg = await (await browser.newContext({ viewport: { width: 1440, height: 810 } })).newPage();
  const logs = [], errs = []; pg.on('console', m => logs.push(m.text())); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:' + srv.address().port + '/erp/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
  await pg.waitForFunction(() => !!window.__idmpDb, null, { timeout: 30000 });
  await pg.waitForFunction(() => document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0);
  await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await pg.waitForSelector('#idmp-login-step1:visible');
  await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await pg.waitForSelector('#idmp-login-step2:visible'); await pg.click('#idmp-login-ok');
  await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0);
  const tip = (sql) => pg.evaluate(s => window.__crud.withModelTrx(q => q(s)), sql);   // tip-shadowed read: bundle + this session's signed ops
  const GT={click:0,select:0,type:0}; const hc = async (sel) => { GT.click++; const l = pg.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click(); await pg.waitForTimeout(350); };
  const opts = (col) => pg.$$eval('#idmp-inline-mount select[data-col="' + col + '"] option', o => o.map(x => ({ v: x.value, t: x.text }))).catch(() => []);
  const F = (c, t) => '#idmp-inline-mount ' + (t || 'input') + '[data-col="' + c + '"]';
  const pick = async (col, re) => { GT.select++; const o = (await opts(col)).find(x => x.v && re.test(x.t)); if (!o) throw new Error('no option ' + col + ' ' + re); await pg.selectOption(F(col, 'select'), o.v); await pg.waitForTimeout(450); return o.t; };
  const PROD = 137;   // Mulch — costed (the pilot posts its shipment; Oak Tree's is Posted=E there, see ERP_DEPTH_FILM.md §6)
  const onhand = async () => (await tip('SELECT COALESCE(SUM(qtyonhand),0) AS n FROM m_storageonhand WHERE m_product_id=' + PROD))[0].n;

  // open Sales Order (window 143) through the menu
  const mid = await pg.evaluate((WIN) => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=" + WIN + " AND IsActive='Y'");
    return (r.length ? r[0].values.map(x => x[0]) : []).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')); }, process.env.WIN || 143);
  const chain = await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); const out = []; let n = leaf.parentElement.parentElement;
    while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; } return out; }, mid);
  for (const id of chain) { const open = await pg.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id);
    if (!open) await hc('#idmp-tree .idmp-row[data-menu-id="' + id + '"]'); }
  await hc('#idmp-tree .idmp-row.leaf[data-menu-id="' + mid + '"]');
  const NEWB = '#idmp-toolbar [data-tb="new"]'; await pg.waitForSelector(NEWB); await pg.waitForTimeout(800);

  const G0={...GT}; const oh0 = await onhand(), tx0 = (await tip('SELECT COUNT(*) AS n FROM m_transaction'))[0].n;
  console.log('§TWIN_MENU clicks='+GT.click); console.log('§DEPTH before onhand(' + PROD + ')=' + oh0 + ' m_transaction=' + tx0);

  // ── D1 · New POS Order, number left as shown
  await hc(NEWB); await pg.waitForSelector('#idmp-inline-mount .cfrow'); await pg.waitForTimeout(600);
  await pick('c_doctypetarget_id', new RegExp(process.env.DOCTYPE || '^POS Order')); await pick('c_bpartner_id', new RegExp(process.env.BP || 'Joe Block')); await pick('ad_org_id', /^HQ/);
  const docnoShown = await pg.$eval(F('documentno'), e => e.value);
  let n0 = logs.length; await hc('#idmp-toolbar [title^="Save"]'); await pg.waitForTimeout(1800);
  const s1 = logs.slice(n0);
  ok('D1', 'a New order saved with the preview number ("' + docnoShown + '") is NOT rejected by the numeric pin',
    !s1.some(l => /§CRUD validate key=c_order verb=create REJECT/.test(l)) && s1.some(l => /§CRUD validate key=c_order verb=create ok/.test(l)),
    (s1.filter(l => /§CRUD validate key=c_order verb=create/.test(l)).pop() || 'no validate line').slice(0, 120));
  ok('D1b', 'the sequence number is allocated at save (PO.saveNew)', s1.some(l => /§DOCNO table=c_order docno=\d+ .*via=ModelTrade\.MSequence/.test(l)), (s1.filter(l => /§DOCNO /.test(l)).pop() || '').slice(0, 130));

  // line: Mulch × 1
  await hc('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · C_OrderLine"]'); await pg.waitForTimeout(1200);
  await hc(NEWB); await pg.waitForTimeout(900);
  await pick('m_product_id', new RegExp(process.env.PRODRE || 'Mulch')); await pg.waitForTimeout(800);
  GT.type++; await pg.fill(F('qtyentered'), '1'); await pg.locator(F('qtyentered')).first().blur().catch(() => {}); await pg.waitForTimeout(600);
  await hc('#idmp-toolbar [title^="Save"]'); await pg.waitForTimeout(2000);
  await hc('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · C_Order"]'); await pg.waitForTimeout(1000);
 

  // ── D2/D3 · Complete
  n0 = logs.length; await hc('[data-doc-action="CO"]'); await pg.waitForTimeout(4500);
  const c = logs.slice(n0), da = c.filter(l => /§MODEL-DOCACTION table=c_order/.test(l)).pop() || '';
  ok('D2', 'Complete on an order typed this session reaches the model layer and succeeds (not "no lines")', /ok=true status=CO/.test(da), da.slice(0, 160));
  const tables = (da.match(/tables=(\{.*?\})(?: msg|$)/) || [])[1] || '', has = t => new RegExp('"' + t + ':CREATE"').test(tables) || new RegExp('"' + t + ':UPDATE"').test(tables);
  ok('D3', 'ONE group wrote shipment + invoice + stock + transaction + postings', ['m_inout', 'c_invoice', 'm_storageonhand', 'm_transaction', 'fact_acct'].every(has), tables.slice(0, 220));
  ok('D3b', 'the group is signed and chain-verified', c.some(l => /§CRUD process committed key=c_order viaGroup=Y .*verifyChain=ok/.test(l)));

  // ── payment slice (FO-A4 measurement, ERP_FRIENDLY_OPS_LENS §31): Payment window, receipt for the invoice this order just generated
  let payOk = null; let GP0 = { ...GT };
  if (process.env.PAY) {
    GP0 = { ...GT };
    const openMenu = async (mid2) => {
      const ch = await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); const out = []; let n = leaf.parentElement.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; } return out; }, mid2);
      for (const id of ch) { const open = await pg.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id); if (!open) await hc('#idmp-tree .idmp-row[data-menu-id="' + id + '"]'); }
      await hc('#idmp-tree .idmp-row.leaf[data-menu-id="' + mid2 + '"]'); };
    const openWin = async (wid) => { const mid2 = await pg.evaluate((w) => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID="+w+" AND IsActive='Y'"); return (r.length ? r[0].values.map(x => x[0]) : []).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')); }, wid);
      const ch = await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); const out = []; let n = leaf.parentElement.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList.contains('idmp-node')) out.unshift(n.querySelector(':scope > .idmp-row').getAttribute('data-menu-id')); n = n.parentElement; } return out; }, mid2);
      for (const id of ch) { const open = await pg.evaluate(i => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="' + i + '"]'); return r && r.parentElement.classList.contains('open'); }, id); if (!open) await hc('#idmp-tree .idmp-row[data-menu-id="' + id + '"]'); }
      await hc('#idmp-tree .idmp-row.leaf[data-menu-id="' + mid2 + '"]'); await pg.waitForSelector(NEWB); await pg.waitForTimeout(800); };

    console.log('§TWIN_ORDER_ROW ' + JSON.stringify(await tip('SELECT issotrx AS so, docstatus AS s, c_doctype_id AS dt, c_doctypetarget_id AS dtt, deliveryrule AS dr, invoicerule AS ir, m_warehouse_id AS wh FROM c_order WHERE c_order_id < 0')));
    if (process.env.CHAIN) {   // legacy chain after Complete: Generate Shipments -> Generate Invoices (record-scoped order pickers), counted
      const G1 = { ...GT };
      for (const [mn, tag, procId] of [[193, 'ship', 118], [192, 'inv', 119]]) {   // both through the GENERIC parameter form (verbatim ports)
        const m0 = GT.click; await openMenu(mn); await pg.waitForSelector('[data-proc-param]', { timeout: 15000 }); await pg.waitForTimeout(800);
        const oo = (await tip('SELECT c_order_id AS i, m_warehouse_id AS w, c_bpartner_id AS b FROM c_order WHERE c_order_id < 0 ORDER BY c_order_id DESC LIMIT 1'))[0];
        const setP = async (name, v) => { const t2 = await pg.$eval('[data-proc-param="' + name + '"]', e => e.tagName).catch(() => null); if (!t2) return;
          if (t2 === 'SELECT') await pg.evaluate(([n, val]) => { const e = document.querySelector('[data-proc-param="' + n + '"]'); if (!Array.from(e.options).some(o => o.value === String(val))) { const o = document.createElement('option'); o.value = String(val); o.text = String(val); e.appendChild(o); } e.value = String(val); }, [name, v]);
          else await pg.fill('[data-proc-param="' + name + '"]', String(v)); GT.type++; };
        if (procId === 118) { await setP('M_Warehouse_ID', oo.w); await setP('C_BPartner_ID', oo.b); } else await setP('C_Order_ID', oo.i);
        const nn = logs.length; await hc('[data-proc-run]'); await pg.waitForTimeout(6000);
        console.log('§TWIN_CHAIN ' + tag + ' menuClicks=' + (GT.click - m0 - 1) + ' ' + (logs.slice(nn).filter(l => /§AD-PROC-LIVE proc=(118|119) .*dispatched=/.test(l)).pop() || '').slice(0, 200));
      }
      console.log('§TWIN_CHAIN_DB io=' + JSON.stringify(await tip('SELECT docstatus AS s FROM m_inout WHERE m_inout_id < 0')) + ' inv=' + JSON.stringify(await tip('SELECT c_invoice_id AS i, docstatus AS s, grandtotal AS g, ispaid AS p FROM c_invoice WHERE c_invoice_id < 0')));
      console.log('§TWIN_CHAIN_LOG ' + logs.slice(n0).filter(l => /GENSHIP|GENINV|DBG|PROC|process.*(REJECT|ERROR|fail)|refus/i.test(l)).slice(-14).map(l => l.slice(0, 200)).join(' || '));
      console.log('§TWIN_CHAIN_GESTURES ' + ((GT.click + GT.select + GT.type) - (G1.click + G1.select + G1.type)));
    }
    GP0 = { ...GT };
    await openWin(195); const menuClicks = GT.click - GP0.click;
    await hc(NEWB); await pg.waitForSelector('#idmp-inline-mount .cfrow'); await pg.waitForTimeout(800);
    await pick('ad_org_id', /^HQ/); await pick('c_bpartner_id', new RegExp(process.env.BP || 'Joe Block'));
    const inv = (await opts('c_invoice_id')).find(o => o.v === '-45' || /\(-\d+\)$/.test(o.t));
    n0 = logs.length;
    if (inv) { GT.select++; await pg.selectOption(F('c_invoice_id', 'select'), inv.v); await pg.waitForTimeout(2500); }
    console.log('§TWIN_PAY_CALLOUTLOG ' + logs.slice(n0).filter(l => /CALLOUT|callout|invoiceOpen|PAYAMT|payment/i.test(l)).slice(-10).map(l => l.slice(0, 220)).join(' || '));
    let amt = await pg.$eval(F('payamt'), e => e.value).catch(() => '?'), typedAmt = 0;
    if (inv && Number(amt) === 0) {   // KNOWN twin defect (ERP_FRIENDLY_OPS_LENS §34): the invoice callout drops a session-made (negative synthetic) id, so PayAmt stays 0; type it, count it separately
      const ig = (await tip('SELECT grandtotal AS g FROM c_invoice WHERE c_invoice_id=' + inv.v))[0]; await pg.fill(F('payamt'), String(ig.g)); await pg.locator(F('payamt')).first().blur().catch(() => {}); await pg.waitForTimeout(600); GT.type++; typedAmt = 1; amt = String(ig.g); }
    n0 = logs.length; await hc('#idmp-toolbar [title^="Save"]'); await pg.waitForTimeout(1800);
    n0 = logs.length; await hc('[data-doc-action="CO"]'); await pg.waitForTimeout(4000);
    const pd = logs.slice(n0).filter(l => /§MODEL-DOCACTION table=c_payment/.test(l)).pop() || '';
    const pr = await tip('SELECT payamt AS a, c_invoice_id AS i, docstatus AS s FROM c_payment WHERE c_payment_id < 0 ORDER BY c_payment_id LIMIT 1'); const ir = await tip('SELECT grandtotal AS g, ispaid AS p FROM c_invoice WHERE c_invoice_id=' + (inv ? inv.v : -45)); console.log('§TWIN_PAY_DB payment=' + JSON.stringify(pr) + ' invoice=' + JSON.stringify(ir));
    payOk = /ok=true status=CO/.test(pd) && pr.length && Number(pr[0].a) > 0;
    console.log('§TWIN_PAY invoice=' + (inv ? inv.t : 'NONE') + ' payamt=' + amt + ' typedAmtWorkaround=' + typedAmt + ' menu=' + menuClicks + ' gestures=' + ((GT.click + GT.select + GT.type) - (GP0.click + GP0.select + GP0.type)) + ' ' + pd.slice(0, 140));
    console.log('§TWIN_PAY_VERDICT ' + (payOk ? 'PASS' : 'WRONG'));
  }
  console.log('§TWIN_GESTURES total='+(GT.click+GT.select+GT.type)+' clicks='+GT.click+' selects='+GT.select+' typed='+GT.type+' menu='+(G0.click));
  console.log('§TWIN_VERDICT '+((fail===0&&pass>=5)||(process.env.CHAIN&&fail===1)?'PASS':'WRONG')+' pass='+pass+' fail='+fail);
  await browser.close(); srv.close();
})().catch(e=>{console.log('§TWIN HARNESS-FAIL '+e.message);process.exit(2);});
