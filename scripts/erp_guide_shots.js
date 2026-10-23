// ⚠ DO NOT REMOVE — Scope: the stills of docs/ERPUserGuide.md "Walk-throughs" (purchasing, stock move + confirm, replenishment). Spec: prompts/ERP_FRIENDLY_OPS_LENS.md §71.
// Every still is taken from a real run of the flow, tightly clipped (union of the elements named, + 8 px), deviceScaleFactor 1.5 on a 1440x1500 window (a whole form fits, nothing scrolled out), English UI. §SHOT lines carry the facts each still shows (read the log:
// exit code is not evidence). Console errors must be 0 (printed as §SHOT-SUMMARY). The in-transit document type is a TWIN-ONLY fixture (copy of Material Movement, IsInTransit=Y): legacy has none.
// Run: ERP_REPO=<worktree of bim-ootb origin/main> node scripts/erp_guide_shots.js <outDir> [--sheet]   (docs/figs gets the PNGs when outDir = docs/figs)
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const REPO = process.env.ERP_REPO || path.join(require('os').homedir(), 'bim-ootb'), OUT = path.resolve(process.argv[2] || '.'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css', '.png': 'image/png', '.db': 'application/octet-stream', '.sql': 'text/plain', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = path.join(REPO, p); fs.stat(f, (e, s) => { if (e || s.isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Content-Length': s.size }); fs.createReadStream(f).pipe(r); }); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port + '/erp';
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] });
  const pg = await (await browser.newContext({ viewport: { width: 1440, height: 1500 }, deviceScaleFactor: 1.5 })).newPage();
  const logs = []; pg.on('console', m => logs.push(m.text())); pg.on('pageerror', e => logs.push('PAGEERR ' + e.message)); pg.on('dialog', d => d.accept());
  const say = (s) => console.log(s), hold = (ms) => pg.waitForTimeout(ms);
  const tip = (q) => pg.evaluate(x => window.__crud.withModelTrx(f => f(x)), q);
  const F = (c, t) => '#idmp-inline-mount ' + (t || 'input') + '[data-col="' + c + '"]';
  const NEWB = '#idmp-toolbar [data-tb="new"]', SAVEB = '#idmp-toolbar [data-tb="save"]', TOGGLE = '#idmp-toolbar [data-tb="toggle"]';
  const shots = [];
  async function shot(name, sels, o) {   // clip = union of the visible elements' boxes, padded; o.maxH caps the height (tall forms), o.pad overrides the padding
    o = o || {}; const pad = o.pad == null ? 8 : o.pad;
    const box = await pg.evaluate((sels) => { let x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0, n = 0; sels.forEach(s => document.querySelectorAll(s).forEach(e => { const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2 || getComputedStyle(e).visibility === 'hidden') return; n++; x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom); })); return n ? { x0, y0, x1, y1, n } : null; }, sels);
    if (!box) throw new Error('shot ' + name + ': none of ' + sels.join(' | ') + ' is visible');
    const x = Math.max(0, box.x0 - pad), y = Math.max(0, box.y0 - pad); let w = Math.min(1440 - x, box.x1 - box.x0 + 2 * pad), h = Math.min(1500 - y, box.y1 - box.y0 + 2 * pad); if (o.maxH) h = Math.min(h, o.maxH);
    const file = path.join(OUT, name + '.png'); await pg.screenshot({ path: file, clip: { x, y, width: w, height: h } }); shots.push(name); say('§SHOT ' + name + ' ' + Math.round(w) + 'x' + Math.round(h) + (o.note ? ' | ' + o.note : ''));
  }
  const click = async (sel) => { const l = pg.locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click(); await hold(500); };
  const pick = async (col, re) => { const o = (await pg.$$eval('#idmp-inline-mount select[data-col="' + col + '"] option', x => x.map(y => ({ v: y.value, t: y.text })))).find(x => x.v && re.test(x.t)); if (!o) throw new Error('no option ' + col + ' ' + re); await pg.selectOption(F(col, 'select'), o.v); await hold(600); };
  const openWin = async (w) => { const mid = await pg.evaluate(w => { const r = window.__idmpDb.exec("SELECT AD_Menu_ID FROM AD_Menu WHERE Action='W' AND AD_Window_ID=" + w + " AND IsActive='Y'"); return (r.length ? r[0].values.map(x => x[0]) : []).find(i => document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]')); }, w);
    await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } leaf.click(); }, mid);
    await pg.waitForSelector(NEWB, { state: 'attached', timeout: 20000 }); await hold(1000); };
  const waitStatus = async (table, idcol, expect, where) => { for (let i = 0; i < 80; i++) { const r = await tip('SELECT docstatus AS s FROM ' + table + ' WHERE ' + where + ' ORDER BY ' + idcol + ' LIMIT 1'); if (r[0] && r[0].s === expect) return true; await hold(250); } return false; };
  const toForm = async () => { for (let i = 0; i < 3; i++) { if (await pg.locator('#idmp-inline-mount .cfrow').first().isVisible().catch(() => false)) return; await click(TOGGLE); await hold(500); } };
  const findOk = async () => { if (await pg.locator('#idmp-find-ov').count()) { await click('#idmp-find-ov [data-find-ok]'); await hold(800); } };
  try {
    await pg.goto(base + '/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
    for (const n of ['erp_cache', 'fold_plugins']) await pg.evaluate(x => new Promise(r => { const q = indexedDB.deleteDatabase(x); q.onsuccess = q.onerror = q.onblocked = () => r(); }), n);
    await pg.goto(base + '/idempiere.html?lang=en_US', { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => !!window.__idmpDb && !!window.PluginRelease && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 30000 });
    await pg.evaluate(() => { const db = window.__idmpDb; const cols = db.exec('PRAGMA table_info(c_doctype)')[0].values.map(r => r[1]).filter(c => c !== 'c_doctype_id' && c !== 'c_doctype_uu');
      db.run('INSERT INTO c_doctype (c_doctype_id,' + cols.join(',') + ') SELECT 9100143,' + cols.join(',') + ' FROM c_doctype WHERE c_doctype_id=143'); db.run("UPDATE c_doctype SET isintransit='Y', name='Inventory Move (in transit)' WHERE c_doctype_id=9100143"); });
    // ── 1 plugin: Plugins & Releases link on the login page, the offer, install ──
    await shot('erp_pur_login', ['#idmp-login-clients', '#idmp-release-link'], { note: 'login page: tenants + the Plugins & Releases link' });
    await click('#idmp-release-link'); await pg.waitForSelector('#pr-osgi table.oc-t'); await hold(800);
    await shot('erp_pur_plugin_offer', ['#pr-root [data-oc-offerrow], #pr-root .oc-offers', '#pr-root [data-oc-offerrow="org.kernel.friendly-ops"]'], { pad: 14, note: 'Available on this page: Friendly operations lens' });
    await click('#pr-root [data-oc-offer="org.kernel.friendly-ops"]'); await hold(2500);
    say('§SHOT.fact plugin ' + logs.filter(l => /§PLUGIN-START/.test(l)).pop());
    await click('#pr-root [data-pr-close]'); await hold(600);
    // ── login ──
    await click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await pg.waitForSelector('#idmp-login-step1:visible');
    await click("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await pg.waitForSelector('#idmp-login-step2:visible');
    await shot('erp_pur_login_role', ['#idmp-login-step2'], { note: 'role/org step before OK' });
    await click('#idmp-login-ok'); await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0); await hold(1000);
    // ── 2 purchase order A: header, line, Complete ──
    await openWin(181); await click(NEWB); await pg.waitForSelector('#idmp-inline-mount .cfrow'); await hold(700);
    await pick('c_doctypetarget_id', /^Purchase Order/); await pick('c_bpartner_id', /Seed Farm/); await pick('ad_org_id', /^HQ/);
    await shot('erp_pur_po_header', ['#idmp-toolbar', '#idmp-inline-mount'], { maxH: 760, note: 'PO header: document type, supplier, organisation' });
    await click(SAVEB); await hold(1800);
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · C_OrderLine"]'); await hold(1000); await click(NEWB); await pg.waitForSelector(F('m_product_id', 'select')); await hold(800);
    await pick('m_product_id', /Mulch/); await pg.fill(F('qtyentered'), '5'); await pg.locator(F('qtyentered')).first().blur().catch(() => {}); await hold(600);
    await shot('erp_pur_po_line', ['#idmp-toolbar', '#idmp-tabstrip', '#idmp-inline-mount'], { maxH: 760, note: 'PO line: Mulch x 5' });
    await click(SAVEB); await hold(1800);
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · C_Order"]'); await pg.waitForSelector('[data-doc-action="CO"]'); await hold(700);
    await shot('erp_pur_po_complete_button', ['#idmp-tabstrip', '[data-doc-action]'], { pad: 10, note: 'draft PO with the Complete action' });
    await click('[data-doc-action="CO"]'); const poOk = await waitStatus('c_order', 'c_order_id', 'CO', 'c_order_id<0'); await hold(1200);
    const poA = (await tip("SELECT c_order_id AS i, documentno AS d, docstatus AS s FROM c_order WHERE c_order_id<0 ORDER BY c_order_id LIMIT 1"))[0]; say('§SHOT.fact poA ' + JSON.stringify(poA) + ' ok=' + poOk);
    await click('#idmp-toolbar [data-tb="process"]'); await pg.waitForSelector('#idmp-proc-ov'); await hold(500);
    await shot('erp_pur_gear_po', ['#idmp-toolbar [data-tb="process"]', '#idmp-proc-ov > *'], { pad: 10, maxH: 320, note: 'the gear on a completed PO: Copy Lines, Receive, Document Action group' });
    await pg.evaluate(() => { const o = document.getElementById('idmp-proc-ov'); if (o) o.remove(); });
    // ── 3 the long way: Material Receipt, Create Lines From ──
    await openWin(184); await click(NEWB); await pg.waitForSelector('#idmp-inline-mount .cfrow'); await hold(700);
    await pick('c_bpartner_id', /Seed Farm/); await pick('ad_org_id', /^HQ/); await click(SAVEB); await hold(1800);
    const BTN = '#idmp-content [data-proc-btn="CreateLinesFrom"]'; await pg.waitForSelector(BTN); await hold(500);
    await shot('erp_pur_receipt_button', ['#idmp-tabstrip', BTN], { pad: 14, note: 'Material Receipt header with the Create Lines From button' });
    await click(BTN); await pg.waitForSelector('#idmp-infowin'); await hold(800);
    await pg.selectOption('#idmp-infowin select[data-col="C_Order_ID"]', String(poA.i)); await click('#idmp-infowin [data-act="refresh"]'); await hold(1000);
    await pg.check('#idmp-infowin input[data-pick="0"]'); await pg.fill('#idmp-infowin tbody tr:first-child [data-edit="Qty"]', '3'); await hold(500);
    await shot('erp_pur_infowin', ['#idmp-infowin > *'], { pad: 6, maxH: 330, note: 'info window: order chosen, line ticked, quantity typed 3' });
    await click('#idmp-infowin [data-infoproc]'); await pg.waitForSelector('#idmp-procdlg [data-proc-run]'); await hold(700);
    await shot('erp_pur_infowin_dialog', ['#idmp-procdlg > *'], { pad: 8, note: 'process dialog (Shipment/Receipt and Locator filled from the record)' });
    await click('#idmp-procdlg [data-proc-run]'); await pg.waitForSelector('#idmp-procdlg [data-procdlg-ok]'); await hold(1200);
    await click('#idmp-procdlg [data-procdlg-ok]'); await hold(1200);
    say('§SHOT.fact receiptLines ' + JSON.stringify(await tip('SELECT movementqty AS q, c_orderline_id AS ol FROM m_inoutline WHERE m_inout_id<0')));
    await click('[data-doc-action="CO"]'); await hold(2500);
    await shot('erp_pur_receipt_done', ['#idmp-toolbar', '#idmp-inline-mount'], { maxH: 760, note: 'receipt Completed' });
    // ── 4 the shortcut: a second PO, then Receive and Create Bill from the gear ──
    await openWin(181); await click(NEWB); await pg.waitForSelector('#idmp-inline-mount .cfrow'); await hold(700);
    await pick('c_doctypetarget_id', /^Purchase Order/); await pick('c_bpartner_id', /Seed Farm/); await pick('ad_org_id', /^HQ/); await click(SAVEB); await hold(1800);
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · C_OrderLine"]'); await hold(1000); await click(NEWB); await pg.waitForSelector(F('m_product_id', 'select')); await hold(800);
    await pick('m_product_id', /Mulch/); await pg.fill(F('qtyentered'), '5'); await pg.locator(F('qtyentered')).first().blur().catch(() => {}); await hold(600); await click(SAVEB); await hold(1800);
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · C_Order"]'); await pg.waitForSelector('[data-doc-action="CO"]'); await hold(600); await click('[data-doc-action="CO"]');
    await waitStatus('c_order', 'c_order_id', 'CO', 'c_order_id=(SELECT MIN(c_order_id) FROM c_order WHERE c_order_id<0)'); await hold(1500);
    const gearRun = async (comp, nameShot, resShot) => {
      await click('#idmp-toolbar [data-tb="process"]'); await pg.waitForSelector('#idmp-proc-ov [data-tbb="' + comp + '"]'); await hold(500);
      await shot(nameShot, ['#idmp-toolbar [data-tb="process"]', '#idmp-proc-ov > *'], { pad: 10, maxH: 330, note: 'gear offers ' + comp });
      await click('#idmp-proc-ov [data-tbb="' + comp + '"]'); await pg.waitForSelector('#idmp-procdlg [data-procdlg-ok]', { timeout: 30000 }); await hold(900);
      await shot(resShot, ['#idmp-procdlg > *'], { pad: 8, note: 'result of ' + comp }); await click('#idmp-procdlg [data-procdlg-ok]'); await hold(1200); };
    await gearRun('FO_Order_Receive', 'erp_pur_gear_receive', 'erp_pur_receive_result');
    await gearRun('FO_Order_Bill', 'erp_pur_gear_bill', 'erp_pur_bill_result');
    say('§SHOT.fact shortcut ' + JSON.stringify({ receipt: await tip('SELECT docstatus AS s, documentno AS d FROM m_inout WHERE m_inout_id<0 ORDER BY m_inout_id LIMIT 1'), invoice: await tip('SELECT docstatus AS s, grandtotal AS g FROM c_invoice WHERE c_invoice_id<0 ORDER BY c_invoice_id LIMIT 1') }));
    // ── 5 stock: the in-transit move, the confirmation, the inventory documents ──
    await openWin(170); await click(NEWB); await pg.waitForSelector('#idmp-inline-mount .cfrow'); await hold(700);
    await pick('c_doctype_id', /in transit/i); await pick('ad_org_id', /^HQ/); await pick('m_warehouse_id', /HQ Warehouse/); await pick('m_warehouseto_id', /Store Central/);
    await shot('erp_stock_move_header', ['#idmp-toolbar', '#idmp-inline-mount'], { maxH: 760, note: 'in-transit Inventory Move header: HQ Warehouse -> Store Central' });
    await click(SAVEB); await hold(1800);
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · M_MovementLine"]'); await hold(1000); await click(NEWB); await hold(1000);
    await pick('m_product_id', /Elm Tree/); await pg.selectOption(F('m_locator_id', 'select'), '101'); await pg.selectOption(F('m_locatorto_id', 'select'), '102'); await pg.fill(F('qtyentered'), '10'); await pg.locator(F('qtyentered')).first().blur().catch(() => {}); await hold(600);
    await shot('erp_stock_move_line', ['#idmp-toolbar', '#idmp-tabstrip', '#idmp-inline-mount'], { maxH: 760, note: 'move line: Elm Tree x 10, Locator and Locator To chosen from the lookups' });
    await click(SAVEB); await hold(1800);
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · M_Movement"]'); await pg.waitForSelector('[data-doc-action="CO"]'); await hold(600); await click('[data-doc-action="CO"]');
    await waitStatus('m_movement', 'm_movement_id', 'IP', 'm_movement_id<0'); await hold(1800);
    await shot('erp_stock_move_inprogress', ['#idmp-toolbar', '#idmp-inline-mount'], { maxH: 340, note: 'after Complete: In Progress, the confirmation is open' });
    await openWin(333); await findOk(); await toForm(); await hold(600);
    await shot('erp_stock_confirm_header', ['#idmp-toolbar', '#idmp-inline-mount'], { maxH: 760, note: 'Move Confirmation, Drafted, Complete offered' });
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · M_MovementLineConfirm"]'); await hold(1000);
    if (await pg.locator('.idmp-grid tbody tr').count()) { await click(TOGGLE); await hold(600); }
    await pg.fill(F('confirmedqty'), '8'); await pg.locator(F('confirmedqty')).first().blur(); await hold(300); await pg.fill(F('scrappedqty'), '1'); await pg.locator(F('scrappedqty')).first().blur(); await hold(300);
    await click(SAVEB); await hold(1800);
    await shot('erp_stock_confirm_line', ['#idmp-toolbar', '#idmp-tabstrip', '#idmp-inline-mount'], { maxH: 760, note: 'confirm line: target 10, confirmed 8, scrapped 1, difference 2 (stored on save)' });
    await click('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · M_MovementConfirm"]'); await pg.waitForSelector('[data-doc-action="CO"]'); await hold(600); await click('[data-doc-action="CO"]');
    await waitStatus('m_movementconfirm', 'm_movementconfirm_id', 'CO', 'm_movementconfirm_id<0'); await hold(2200);
    await openWin(168); await findOk(); await toForm(); await click('#idmp-toolbar button[title="Last record"]'); await hold(1500);
    await shot('erp_stock_inventory_doc', ['#idmp-toolbar', '#idmp-inline-mount'], { maxH: 760, note: 'the inventory document the confirm created (last record)' });
    say('§SHOT.fact stock ' + JSON.stringify(await tip('SELECT l.m_locator_id AS loc, l.qtybook AS b, l.qtycount AS c, i.docstatus AS s FROM m_inventory i JOIN m_inventoryline l ON l.m_inventory_id=i.m_inventory_id WHERE i.m_inventory_id<0')));
    // ── 6 replenish ──
    const leaf = await pg.evaluate(() => { const r = [...document.querySelectorAll('#idmp-tree .idmp-row.leaf')].find(e => /Replenish Report/.test(e.textContent) && !/deprecated/i.test(e.textContent)); return r && r.getAttribute('data-menu-id'); });
    await pg.evaluate(id => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } leaf.click(); }, leaf);
    await pg.waitForSelector('#idmp-content [data-proc-run]'); await hold(1200);
    const P = (c) => '#idmp-content [data-proc-param="' + c + '"]';
    await pg.selectOption(P('M_Warehouse_ID'), '103'); await hold(300);
    await shot('erp_repl_params_before', ['#idmp-content .idmp-procform, #idmp-content [data-proc-run]'], { pad: 10, note: 'Replenish Report parameters: Document Type hidden while Create is blank' });
    await pg.selectOption(P('ReplenishmentCreate'), 'POO'); await hold(800);
    const dto = await pg.$$eval(P('C_DocType_ID') + ' option', o => o.filter(x => x.value).map(x => x.value + '=' + x.text)); say('§SHOT.fact docTypes ' + JSON.stringify(dto));
    await pg.selectOption(P('C_DocType_ID'), (dto.find(x => /=Purchase Order$/.test(x)) || dto[0]).split('=')[0]); await hold(500);
    await shot('erp_repl_params_after', ['#idmp-content .idmp-procform, #idmp-content [data-proc-run]'], { pad: 10, note: 'Create = Purchase Order: Document Type appears, filtered to purchase-order types' });
    await click('#idmp-content [data-proc-run]'); await pg.waitForFunction(() => /#\d+ - |Failed|Error/.test((document.querySelector('#idmp-content') || {}).innerText || ''), null, { timeout: 120000, polling: 250 }); await hold(1200);
    await shot('erp_repl_result', ['#idmp-content .idmp-procpane, #idmp-content .idmp-procform'], { pad: 10, note: 'report result: three draft purchase orders' });
    say('§SHOT.fact replenish ' + JSON.stringify(await tip("SELECT documentno AS d, docstatus AS s FROM c_order WHERE c_order_id<0 AND documentno>='800005' ORDER BY documentno")));
    await openWin(181); await toForm(); await click('#idmp-toolbar button[title="Last record"]'); await hold(1500);
    await shot('erp_repl_draft_po', ['#idmp-toolbar', '#idmp-inline-mount'], { maxH: 760, note: 'one of the drafted purchase orders (last record)' });
  } catch (e) { say('§SHOT-ERROR ' + String(e.stack || e).split('\n').slice(0, 4).join(' | ')); }
  const errs = logs.filter(l => /^PAGEERR/.test(l)); say('§SHOT-SUMMARY shots=' + shots.length + ' pageErrors=' + errs.length + (errs.length ? ' ' + errs.slice(0, 2).join(' | ') : ''));
  await browser.close(); srv.close();
})();
