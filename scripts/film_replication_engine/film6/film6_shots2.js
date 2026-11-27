// ⚠ DO NOT REMOVE — Scope: the three frames film6_shots.js could not reach by text (the Role window records and its tabs), same live site, same rules (picture only; READ logs/shots2.log §SHOT lines).
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright'); const fs = require('fs'), path = require('path');
const BASE = 'https://red1oon.github.io/bim-ootb', OUT = path.join(__dirname, 'shots'), sleep = ms => new Promise(r => setTimeout(r, ms)); let errors = 0;
(async () => {
  const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'] });
  const ctx = await br.newContext({ viewport: { width: 1920, height: 930 }, deviceScaleFactor: 1 }); await ctx.route(/\/\/www\.idempiere\.org\//, r => r.abort('internetdisconnected'));
  const pg = await ctx.newPage(); pg.on('pageerror', e => { errors++; console.log('§SHOT_ERROR ' + e.message); });
  const db = sql => pg.evaluate(q => { const r = window.__idmpDb.exec(q); if (!r.length) return []; const c = r[0].columns; return r[0].values.map(v => { const o = {}; c.forEach((x, i) => { o[x.toLowerCase()] = v[i]; }); return o; }); }, sql);
  const txt = n => pg.evaluate(k => ((document.querySelector('#idmp-content') || { innerText: '' }).innerText || '').replace(/\s+/g, ' ').slice(0, k), n || 200);
  const shot = async (name, note) => { await sleep(1000); const f = path.join(OUT, name + '.png'); await pg.screenshot({ path: f, clip: { x: 0, y: 0, width: 1920, height: 930 } }); console.log(`§SHOT ${name} png=shots/${name}.png | ${note} | text="${(await txt(220)).replace(/"/g, "'")}"`); };
  await pg.goto(BASE + '/erp/idempiere.html?lang=en_US', { waitUntil: 'load' });
  await pg.waitForFunction(() => !!window.__idmpDb && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0, null, { timeout: 180000 }); await sleep(3000);
  await pg.click("#idmp-login-clients .idmp-login-user:has(.nm:text-is('GardenWorld'))"); await pg.waitForSelector('#idmp-login-step1:visible');
  await pg.click("#idmp-login-users .idmp-login-user:has(.nm:text-is('GardenAdmin'))"); await pg.waitForSelector('#idmp-login-step2:visible'); await pg.selectOption('#idmp-login-role', '102').catch(() => {}); await pg.click('#idmp-login-ok');
  await pg.waitForFunction(() => document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0, null, { timeout: 90000 }); await sleep(2000);
  console.log('§SHOT_ROLE ' + (await pg.evaluate(() => window.APP.roleId)));
  const mid = (await db("SELECT m.ad_menu_id AS id FROM ad_menu m JOIN ad_window w ON w.ad_window_id=m.ad_window_id WHERE w.name='Role' AND m.isactive='Y'"))[0].id;
  await pg.evaluate(id => { const lf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); let n = lf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node') && !n.classList.contains('open')) { const h = n.querySelector(':scope > .idmp-row'); if (h) h.click(); } n = n.parentElement; } lf.click(); }, mid);
  await sleep(4000); console.log('§SHOT_TB ' + JSON.stringify(await pg.evaluate(() => [].map.call(document.querySelectorAll('#idmp-toolbar [data-tb]'), e => e.getAttribute('data-tb') + ':' + (e.getAttribute('title') || '')))));
  await pg.click('#idmp-toolbar [data-tb="toggle"]'); await sleep(1800);
  console.log('§SHOT_GRID ' + JSON.stringify(await pg.evaluate(() => [].map.call(document.querySelectorAll('#idmp-content table tbody tr'), t => t.innerText.replace(/\s+/g, ' ').slice(0, 60)))));
  console.log('§SHOT_ROLES ' + JSON.stringify(await db("SELECT ad_role_id AS id, name, ad_client_id AS c FROM ad_role WHERE name LIKE '%Web Service%' OR ad_role_id IN (50004,103)")));
  const picked = await pg.evaluate(() => { const tr = [].slice.call(document.querySelectorAll('#idmp-content table tbody tr')).filter(t => /Web Service Execution/.test(t.innerText))[0]; if (!tr) return false; tr.click(); tr.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); return true; }); await sleep(2500);
  console.log('§SHOT_AFTER_PICK ' + JSON.stringify(await pg.evaluate(() => ({ inputs: [].slice.call(document.querySelectorAll('#idmp-content input')).map(e => e.value).filter(Boolean).slice(0, 4), grid: !!document.querySelector('#idmp-content table tbody tr') }))));
  const name = await pg.evaluate(() => [].slice.call(document.querySelectorAll('#idmp-content input')).map(e => e.value).filter(v => /Web Service Execution/.test(v))[0] || '');
  console.log('§SHOT_RECORD name=' + name);
  if (/Web Service Execution/.test(name)) {
    await shot('role_wse', 'Role window, record "Web Service Execution" (the least-privilege depositor role)');
    for (const [tab, file] of [['Process Access', 'wse_process_access'], ['Document Action Access', 'wse_doc_action_access']]) { const ok = await pg.evaluate(t => { const el = [].slice.call(document.querySelectorAll('body *')).filter(e => !e.closest('#idmp-tree') && e.children.length === 0 && e.textContent.trim() === t && e.offsetParent !== null)[0]; if (!el) return false; el.click(); return true; }, tab); if (ok) { await sleep(2500); await shot(file, 'tab "' + tab + '" of the Web Service Execution role'); } else console.log('§SHOT_WARN tab not found ' + tab); }
  } else console.log('§SHOT_WARN Web Service Execution record not reached');
  const rows = await db("SELECT count(*) AS n FROM ad_document_action_access a JOIN ad_role r ON r.ad_role_id=a.ad_role_id WHERE r.name='Web Service Execution'"); console.log('§SHOT_DB document_action_access rows for the role: ' + JSON.stringify(rows));
  await br.close(); console.log('§SHOT_DONE pageerrors=' + errors);
})().catch(e => { console.log('§SHOT_CRASH ' + (e.stack || e)); process.exit(2); });
