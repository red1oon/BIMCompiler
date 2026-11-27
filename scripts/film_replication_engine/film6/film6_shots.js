// ⚠ DO NOT REMOVE — Scope: REAL-PAGE FRAMES for Film 6 (TEAMWORK_FRAMEWORK §42.4, §42.5). Drives the LIVE site (https://red1oon.github.io/bim-ootb/erp/, shipped GardenWorld seed, a fresh browser profile) in headless Chromium --disable-gpu, CPU only,
// through the page's own login, menu, windows and process dialogs (same steps the W-POS-SALES-LIVE / W-MF-LENS / W-PLUGIN-ROLE witnesses prove), and saves PNG frames to shots/. PICTURE ONLY: every number the film speaks comes from the witness logs. The only rows written are the sample
// till tickets K1/K2 through the ERP write path (the witness's own deposit), labelled sample data. Nothing is drawn or edited on the frames; captions are added by the compositor. READ THE LOG (logs/shots.log): §SHOT lines carry the DOM text found on each frame.
// Usage: node film6_shots.js [baseUrl=https://red1oon.github.io/bim-ootb]
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path');
const BASE = (process.argv[2] || 'https://red1oon.github.io/bim-ootb').replace(/\/$/, ''), OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const say = s => console.log(s); let errors = 0; const J = JSON.stringify;
const WIN_LEAF = 9538001, PROC_LEAF = 9538002, BUNDLES = ['org.kernel.pos-integration', 'org.kernel.mf-lens'], K1 = 'POS1/2026-10-28/0101', K2 = 'POS1/2026-10-28/0102', D1 = '2026-10-28 00:00:00';
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 });
  await ctx.route(/\/\/www\.idempiere\.org\//, r => r.abort('internetdisconnected'));   // the seed's Donate gadget frames idempiere.org: kept out so the run needs no third-party host
  const pg = await ctx.newPage(), logs = [];
  pg.on('console', m => logs.push(m.text())); pg.on('pageerror', e => { errors++; say('§SHOT_ERROR pageerror ' + e.message); });
  const db = sql => pg.evaluate(q => { const r = window.__idmpDb.exec(q); if (!r.length) return []; const c = r[0].columns; return r[0].values.map(v => { const o = {}; c.forEach((x, i) => { o[x.toLowerCase()] = v[i]; }); return o; }); }, sql);
  const txt = (sel, n) => pg.evaluate(([s, k]) => ((document.querySelector(s) || { innerText: '' }).innerText || '').replace(/\s+/g, ' ').slice(0, k), [sel || 'body', n || 300]);
  const clickLeaf = id => pg.evaluate(id => { const lf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); if (!lf) return false; let n = lf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node') && !n.classList.contains('open')) { const h = n.querySelector(':scope > .idmp-row'); if (h) h.click(); } n = n.parentElement; } lf.click(); return true; }, id);
  const shot = async (name, note, sel) => { await sleep(900); const f = path.join(OUT, name + '.png'); await pg.screenshot({ path: f, clip: { x: 0, y: 0, width: 1920, height: 930 } }); say(`§SHOT ${name} png=${path.relative(__dirname, f)} role=${await pg.evaluate(() => window.APP && window.APP.roleId)} | ${note} | text="${(await txt(sel || '#idmp-content', 160)).replace(/"/g, "'")}"`); };
  async function firstLogin(client, user) {
    await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('" + client + "'))"); await pg.waitForSelector('#idmp-login-step1:visible');
    await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('" + user + "'))"); await pg.waitForSelector('#idmp-login-step2:visible'); await pg.click('#idmp-login-ok');
    await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 90000 }); await sleep(1500);
  }
  async function switchTo(client, user, role) {
    await pg.click('#idmp-switch-btn'); await sleep(600);
    if (await pg.isVisible('#idmp-login-clients')) await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('" + client + "'))");
    await pg.waitForSelector('#idmp-login-users .idmp-login-user', { timeout: 15000 });
    await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('" + user + "'))"); await pg.waitForSelector('#idmp-login-step2:visible');
    await pg.selectOption('#idmp-login-role', String(role)); await pg.click('#idmp-login-ok');
    await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 90000 });
    await pg.waitForSelector('#idmp-home', { timeout: 20000 }).catch(() => {}); await sleep(1800);
  }
  const create = (table, fields) => pg.evaluate(a => new Promise(res => { const once = e => { if (e.detail && String(e.detail.table).toLowerCase() === a.t) { window.removeEventListener('overlay:committed', once); res(e.detail.createdId); } }; window.addEventListener('overlay:committed', once); window.__crud.applyOp({ op_type: 'CRUD_CREATE', key: a.t, table: a.t, verb: 'create', fields: a.f }); setTimeout(() => res(null), 8000); }), { t: table, f: fields });
  const line = (key, prod, qty, price) => ({ ad_client_id: 11, ad_org_id: 11, i_isimported: 'N', issotrx: 'Y', documentno: key, doctypename: 'POS Order', m_product_id: prod, qtyordered: qty, priceactual: price, c_uom_id: 100, dateordered: D1 });
  const tender = (key, type, amt, extra) => Object.assign({ ad_client_id: 11, ad_org_id: 11, i_isimported: 'N', documentno: key, doctypename: 'AR Receipt', iso_code: 'USD', payamt: amt, tendertype: type, datetrx: D1 }, extra || {});
  const procSet = async (col, v) => { const s = '#idmp-content [data-proc-param="' + col + '"]', tag = await pg.$eval(s, e => e.tagName); if (tag === 'SELECT') await pg.selectOption(s, String(v)); else await pg.fill(s, String(v)); await sleep(250); };
  const procRun = async () => { await pg.click('#idmp-content [data-proc-run]'); await pg.waitForFunction(() => /OK #\d+\/\d+|Failed|OK/.test((document.querySelector('#idmp-content') || {}).innerText || ''), null, { timeout: 90000 }).catch(() => {}); await sleep(4000); };
  const menuIdOfProc = async pid => { const r = await db("SELECT ad_menu_id AS id FROM ad_menu WHERE ad_process_id=" + pid + " AND isactive='Y'"); return r.length ? r[0].id : null; };
  const menuIdOfWin = async wname => { const r = await db("SELECT m.ad_menu_id AS id FROM ad_menu m JOIN ad_window w ON w.ad_window_id=m.ad_window_id WHERE w.name='" + wname + "' AND m.isactive='Y'"); return r.length ? r[0].id : null; };

  say(`§SHOT_START base=${BASE} live site, fresh profile, 1920x930, --disable-gpu`);
  await pg.goto(BASE + '/erp/idempiere.html?lang=en_US', { waitUntil: 'load' });
  await pg.waitForFunction(() => !!window.__idmpDb && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 180000 });
  await sleep(3000);
  say('§SHOT_VERSION sw ' + (await pg.evaluate(() => fetch('sw.js').then(r => r.text()).then(t => (/CACHE_VERSION\s*=\s*'([^']+)'/.exec(t) || [])[1]).catch(() => null))));
  await shot('login', 'the live login page, the shipped seed', 'body');

  // ---- System Administrator: starts the two bundles (INSTALL_ONLY) ----
  await firstLogin('System', 'System');
  await pg.evaluate(() => window.PluginRelease.open()); await pg.waitForSelector('#pr-osgi table.oc-t', { timeout: 15000 }); await sleep(800);
  await shot('plugins_admin', 'Plugins & Releases as the System Administrator: Start/Stop available', '#pr-osgi');
  for (const b of BUNDLES) { await pg.click('[data-oc-start="' + b + '"]').catch(() => say('§SHOT_WARN no start button for ' + b)); await sleep(3500); }
  const st = await pg.evaluate(ids => { const r = window.PluginEngine && window.PluginEngine._reg(); return ids.map(i => { const b = r && r.list().filter(x => x.id === i)[0]; return i + '=' + (b ? b.state : 'none'); }); }, BUNDLES); say('§SHOT_BUNDLES ' + st.join(' '));
  await shot('plugins_admin_started', 'both bundles started by the System Administrator', '#pr-osgi');
  await pg.evaluate(() => window.PluginRelease.close());

  // ---- GardenWorld Admin (102): the home with the lens, menu, the import windows, dialogs ----
  await switchTo('GardenWorld', 'GardenAdmin', 102);
  await shot('home_lens', 'role 102 home: the Micro Finance gadget first in its column (the home page edited the way legacy allows)', '#idmp-home');
  const gadget = await pg.evaluate(() => [].map.call(document.querySelectorAll('#idmp-home .idmp-hcol:not(.idmp-hside) .idmp-gadget'), g => g.getAttribute('data-gadget-name'))); say('§SHOT_GADGETS ' + J(gadget));
  await pg.evaluate(() => { const r = document.querySelector('#idmp-tree .idmp-row[data-menu-id="163"]'); if (r && !(r.parentElement.classList.contains('open'))) r.click(); }); await sleep(900);
  await shot('menu_tree', 'the menu tree, Data Import expanded', '#idmp-tree');
  // sample till tickets through the ERP write path (same as the witness): K1 balanced, K2 tenders 100 against lines 115
  const dep = [[123, 2, 65], [130, 1, 50], [134, 3, 66]].map(l => ['i_order', line(K1, l[0], l[1], l[2])]);
  dep.push(['i_payment', tender(K1, 'X', 200)], ['i_payment', tender(K1, 'C', 178, { creditcardtype: 'V', r_pnref: 'PNREF-K1-0001', r_authcode: 'AUTH-K1-0001', r_result: '0', r_respmsg: 'APPROVED', isapproved: 'Y' })]);
  [[123, 1, 65], [130, 1, 50]].forEach(l => dep.push(['i_order', line(K2, l[0], l[1], l[2])])); dep.push(['i_payment', tender(K2, 'X', 100)]);
  const made = []; for (const d of dep) made.push(await create(d[0], d[1])); say('§SHOT_DEPOSIT created=' + J(made));
  await clickLeaf(WIN_LEAF); await pg.waitForSelector('#idmp-toolbar [data-tb="process"]', { timeout: 30000 }).catch(() => {}); await sleep(2500);
  await shot('import_window_before', 'Import POS Sales window: the till\'s sample tickets, nothing imported yet', '#idmp-content');
  await clickLeaf(PROC_LEAF); await pg.waitForSelector('#idmp-content [data-proc-run]', { timeout: 20000 }); await sleep(800);
  await shot('process_dialog', 'the process dialog: parameters read from AD_Process_Para', '#idmp-content');
  await procSet('AD_Client_ID', 11); await procSet('AD_Org_ID', 11); await procSet('C_BankAccount_ID', 100);
  await procRun(); await shot('process_batch', 'Import POS Sales run for every pending ticket: one imported, the mismatched ticket left whole', '#idmp-content');
  await clickLeaf(WIN_LEAF); await pg.waitForSelector('#idmp-toolbar [data-tb="process"]', { timeout: 30000 }).catch(() => {}); await sleep(2500);
  await shot('import_window_after', 'the same window after the run: Imported box, the error text of the ticket left whole', '#idmp-content');
  const imp = await menuIdOfWin('Import Payment'); if (imp && await clickLeaf(imp)) { await sleep(3000); await shot('import_payment_window', 'Import Payment window (legacy window 280)', '#idmp-content'); } else say('§SHOT_WARN no Import Payment window leaf');
  for (const [pid, name] of [[200074, 'recurring_run'], [53187, 'acct_processor'], [53267, 'replenish_report']]) { const mid = await menuIdOfProc(pid); if (mid && await clickLeaf(mid)) { await pg.waitForSelector('#idmp-content [data-proc-run]', { timeout: 20000 }).catch(() => {}); await sleep(900); await shot(name, 'process dialog ' + pid, '#idmp-content'); } else say('§SHOT_WARN no menu leaf for process ' + pid); }
  // Role window: Web Service Execution role; Document Action Access tab
  const rw = await menuIdOfWin('Role');
  if (rw && await clickLeaf(rw)) { await pg.waitForSelector('#idmp-toolbar', { timeout: 30000 }).catch(() => {}); await sleep(2500); await shot('role_window', 'the Role window', '#idmp-content');
    const clicked = await pg.evaluate(() => { const tr = [].slice.call(document.querySelectorAll('#idmp-content table tbody tr')).filter(t => /Web Service Execution/.test(t.innerText))[0]; if (tr) { tr.click(); tr.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); return true; } return false; }); await sleep(2000);
    if (clicked) { await shot('role_wse', 'role "Web Service Execution" selected (the least-privilege depositor role)', '#idmp-content'); }
    const tabOk = await pg.evaluate(() => { const t = [].slice.call(document.querySelectorAll('#idmp-content [role=tab], #idmp-content .idmp-tab, #idmp-content .tab, #idmp-tabs *')).filter(e => /Document Action Access/i.test(e.textContent) && e.children.length === 0)[0]; if (t) { t.click(); return true; } return false; }); await sleep(2500);
    if (tabOk) await shot('doc_action_access', 'Document Action Access tab of the Role window', '#idmp-content'); else say('§SHOT_WARN Document Action Access tab not found by text'); }
  else say('§SHOT_WARN no Role window leaf');
  await pg.evaluate(() => window.PluginRelease.open()); await pg.waitForSelector('#pr-osgi', { timeout: 15000 }).catch(() => {}); await sleep(900);
  await shot('plugins_user', 'Plugins & Releases as a non-administrator: the list is readable, read-only', '#pr-osgi');
  await pg.evaluate(() => window.PluginRelease.close());

  // ---- role 103: the home without the lens ----
  const u103 = await db("SELECT DISTINCT u.name AS n FROM ad_user_roles ur JOIN ad_user u ON u.ad_user_id=ur.ad_user_id AND u.isactive='Y' WHERE ur.ad_role_id=103 AND ur.isactive='Y' AND ur.ad_client_id=11"); say('§SHOT_USERS103 ' + J(u103));
  if (u103.length) { await switchTo('GardenWorld', u103[0].n, 103); await shot('home_103', 'role 103 home: no Micro Finance gadget', '#idmp-home'); const g3 = await pg.evaluate(() => [].map.call(document.querySelectorAll('#idmp-home .idmp-gadget'), g => g.getAttribute('data-gadget-name'))); say('§SHOT_GADGETS103 ' + J(g3)); }
  await browser.close();
  say(`§SHOT_DONE frames=${fs.readdirSync(OUT).filter(f => f.endsWith('.png')).length} pageerrors=${errors}`);
})().catch(e => { console.log('§SHOT_CRASH ' + (e && e.stack || e)); process.exit(2); });
